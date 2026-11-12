# EngineeringWithJay/Swift-Bonsai-2-MLX

## Resumen

Swift Bonsai 2 27B — MLX pack es un empaquetado comunitario para Apple Silicon del modelo Swift Bonsai 2, un derivado de razonamiento eficiente creado por UkisAI a partir del Ternary Bonsai 2 27B de Prism ML. Este pack, publicado por EngineeringWithJay, recodifica el tronco ternario de 2 bits (familia PQ2_0) en formato affine 2-bit nativo de MLX, de modo que el modelo pueda ejecutarse en hardware Apple mediante un cargador parcheado incluido en el repositorio. No se trata de un lanzamiento oficial ni de UkisAI ni de Prism ML, sino de una build local de la comunidad.

El modelo subyacente emplea un backbone tipo Qwen3.8-27B con 26.898.908.672 parámetros, 64 capas, dimensión oculta de 5.120 y una ventana de contexto nativa de 262.144 tokens. Su innovación principal es la combinación de pesos ternarios con cuantización Hadamard de 2 bits y una atención híbrida que alterna Gated DeltaNet lineal con atención completa cada cuatro capas, lo que reduce el coste de memoria del caché KV en contextos largos.

La relevancia de este pack radica en que permite ejecutar un modelo de 27B en equipos con memoria unificada de 16-24 GB, algo inviable con pesos en fp16. El repositorio ocupa 7,7 GB e incluye validación de recarga que verifica equivalencia bit-exacta con el GGUF original de UkisAI (diferencia máxima absoluta de logits 0.0, argmax idéntico). Es, por tanto, una opción experimental orientada a investigación y despliegue local en Mac, no a producción crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet (atención lineal) + atención completa cada 4 capas; backbone Qwen3.8-27B con GQA |
| Parametros totales | 26.898.908.672 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Ternaria 2-bit (familia PQ2_0), recodificada a MLX affine 2-bit |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX affine 2-bit); requiere cargador parcheado en `runtime/` |

## Arquitectura y entrenamiento

El backbone es un Qwen3.8-27B con atención por grupos (GQA): 24 cabezas de consulta, 4 cabezas KV y `head_dim` de 256. Consta de 64 capas con dimensión oculta de 5.120. La atención es híbrida: la mayoría de capas usan Gated DeltaNet (atención lineal con estado recurrente), y cada cuarta capa aplica atención completa. Esta combinación reduce el crecimiento del caché KV frente a un transformer denso clásico, lo que explica que el autor recomiende mantener contextos de hasta ~16K en hosts de 16 GB y reservar los 96K para máquinas con 24 GB o más de memoria unificada.

Los pesos del tronco son ternarios (un factor de escala por bloque firmado de 128 elementos) con codificación Hadamard de 2 bits. El pack recodifica esa representación ternaria PQ2_0/PTQ1_0 a affine 2-bit de MLX mediante un encoder incluido en `runtime/`. La validación de recarga (`reload-validation.json`) confirma que los logits greedy coinciden con el GGUF de UkisAI (diferencia máxima absoluta 0.0, argmax y salida "PONG" idénticos), por lo que la calidad de texto se preserva de forma bit-exacta respecto a la fuente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El pack es solo texto: no incluye cabeza MTP (multi-token prediction) para decodificación especulativa; esa variante se distribuye por separado en `EngineeringWithJay/Swift-Bonsai-2-MTPLX`.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline `text-generation`.
- Razonamiento matemático y de dominio científico: los benchmarks publicados por UkisAI reportan AIME 2025 al 93,33 % y GPQA-Diamond al 84,34 %.
- Seguimiento de instrucciones: IFBench al 82,60 % según los resultados upstream.
- Conocimiento en chino evaluado vía C-Eval (81,47 %), aunque el idioma declarado del modelo es únicamente inglés.
- Atención de contexto largo: ventana nativa de 262.144 tokens, sujeta a límites de memoria del host.
- Ejecución local en Apple Silicon mediante MLX y el cargador parcheado incluido.
- No soporta tool calling ni function calling de forma fiable según las limitaciones declaradas por el autor.
- No soporta visión, audio ni modo thinking explícito.
- No incluye decodificación especulativa en este pack (requiere el sidecar MTP separado).

## Casos de uso

- Investigación de cuantización ternaria en Apple Silicon: el pack sirve para estudiar cómo se comporta un modelo de 27B con pesos de 2 bits en MLX, comparando logits contra el GGUF original gracias al fichero de validación incluido.
- Experimentación con atención híbrida lineal/completa: permite medir empíricamente el ahorro de memoria del caché KV en Gated DeltaNet frente a atención completa en contextos de 8K-16K tokens.
- Razonamiento matemático local en un Mac: con AIME 2025 al 93,33 %, es adecuado para resolver problemas de competición en un portátil con 16-24 GB de memoria unificada, sin conexión a la nube.
- Evaluación de modelos en GPQA-Diamond y C-Eval: útil como banco de pruebas local para replicar los resultados upstream y validar la fidelidad de la recodificación.
- Prototipado de asistentes conversacionales en inglés: el modelo puede mantener diálogos multi-turno, aunque su seguimiento de instrucciones es irregular y no debe usarse en atención al cliente real sin supervisión.
- Docencia y divulgación sobre cuantización extrema: el repositorio, con su cargador y sus scripts de validación, es un material didáctico concreto para explicar la conversión ternaria a affine 2-bit.
- Pruebas de integración con MLX frente a `mlx_lm` estándar: sirve para demostrar las limitaciones de los formatos no nativos y el papel de los cargadores parcheados.

## Benchmarks y rendimiento

Resultados publicados por UkisAI (upstream), comparando Swift Bonsai 2 con el base Ternary Bonsai 2:

| Benchmark | Swift Bonsai 2 | Ternary Bonsai 2 (base) |
|---|---|---|
| GPQA-Diamond | 84,34 % | 84,18 % |
| C-Eval | 81,47 % | 81,37 % |
| IFBench | 82,60 % | 82,13 % |
| AIME 2025 | 93,33 % | 92,00 % |

El pack no re-mide estos benchmarks; la equivalencia verificada es a nivel de logits greedy contra el GGUF de UkisAI (diferencia máxima absoluta 0.0). No se han publicado datos de latencia ni throughput en la información disponible.

## Requisitos de hardware

- Pesos en disco: aproximadamente 7,2 GB (repositorio de 7,7 GB).
- VRAM/memoria unificada: el autor recomienda contextos de hasta ~16K tokens en hosts de 16 GB y reservar 96K para máquinas con 24 GB o más de memoria unificada.
- Hardware objetivo: Apple Silicon (MLX). No hay soporte declarado para GPU NVIDIA ni AMD en este pack.
- No cabe en GPUs consumer con VRAM dedicada convencional por el formato MLX; requiere memoria unificada de Apple.
- Despliegue: exclusivamente mediante el cargador parcheado en `runtime/`; no es válido con las rutas estándar de `mlx_lm`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este pack.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift Bonsai 2 27B — MLX (este pack) | 26,9B | 262.144 | Ternaria 2-bit → MLX affine 2-bit | Apache-2.0 | Hugging Face, solo Apple Silicon |
| Ternary Bonsai 2 27B (Prism ML) | no disponible | no disponible | Ternaria 2-bit (GGUF) | no disponible en la información | Hugging Face (prism-ml) |
| Swift Bonsai 2 GGUF (UkisAI) | no disponible | no disponible | Ternaria 2-bit (GGUF) | no disponible en la información | Hugging Face (ukisai) |
| Swift-Bonsai-2-MTPLX (EngineeringWithJay) | no disponible | no disponible | Ternaria 2-bit + MTP | no disponible en la información | Hugging Face, con decodificación especulativa |

No se dispone de datos suficientes para comparar rendimiento con alternativas de otros fabricantes en la misma categoría.

## Limitaciones y advertencias

- Lanzamiento experimental de investigación: el propio autor advierte que Swift es irregular en seguimiento de instrucciones, uso de herramientas y programación abierta.
- No es válido con `mlx_lm` estándar; requiere el cargador parcheado incluido, lo que complica la integración en pipelines existentes.
- Solo texto: sin visión, sin audio y sin cabeza MTP en este pack.
- Idioma limitado al inglés; el rendimiento en castellano no está evaluado ni declarado.
- Riesgo de alucinación no cuantificado en la información disponible; los benchmarks de razonamiento no garantizan fiabilidad factual.
- Sesgos conocidos: no documentados en la model card.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse `NOTICE.txt` y la atribución a Prism ML (creación con Bonsai) y a UkisAI (pesos Swift).
- No es una release oficial de UkisAI ni de Prism ML; el soporte y el mantenimiento dependen de un único autor comunitario.
- El rendimiento en memoria depende del contexto: superar los ~16K tokens en un host de 16 GB puede provocar fallos por falta de memoria unificada.

## Enlaces

- Hugging Face del pack: https://huggingface.co/EngineeringWithJay/Swift-Bonsai-2-MLX
- Modelo base (GGUF): https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Variante con MTP para decodificación especulativa: https://huggingface.co/EngineeringWithJay/Swift-Bonsai-2-MTPLX
- Ternary Bonsai 2 27B de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
