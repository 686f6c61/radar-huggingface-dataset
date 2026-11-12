# EngineeringWithJay/Swift-Bonsai-2-27B-MLX

## Resumen

Swift Bonsai 2 27B — MLX pack es una conversión comunitaria a formato MLX del modelo Swift Bonsai 2 27B, un derivado de razonamiento eficiente desarrollado por UkisAI a partir del Ternary Bonsai 2 27B de Prism ML. El pack, publicado por EngineeringWithJay, reempaqueta el tronco Swift (pesos ternarios de 2 bits) en un formato afín de 2 bits compatible con Apple Silicon, e incluye un cargador parcheado en `runtime/` porque el tipo de modelo `prism_hadamard_qwen35` no es compatible con las rutas estándar de `mlx_lm`.

El modelo se apoya en un backbone Qwen3.8-27B con 26.898.908.672 parámetros totales, 64 capas, dimensión oculta de 5.120 y una ventana de contexto nativa de 262.144 tokens. La arquitectura combina atención lineal Gated DeltaNet con atención completa cada cuatro capas, e incorpora pesos ternarios con una escala por bloque firmado de 128 elementos (codificación hadamard-signed de 2 bits).

Su relevancia actual radica en que permite ejecutar un modelo de ~27B parámetros en hardware Apple Silicon con un peso en disco de aproximadamente 7,2 GB, manteniendo equivalencia bit-exacta con la fuente GGUF de UkisAI en decodificación greedy. Es una release experimental de investigación, no una versión oficial de UkisAI ni de Prism ML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet (atención lineal) + atención completa cada 4 capas; backbone Qwen3.8-27B con GQA (head_dim 256, 24 cabezas Q, 4 cabezas KV) |
| Parametros totales | 26.898.908.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Ternaria de 2 bits (familia PQ2_0), recodificada a afín MLX de 2 bits; una escala por bloque firmado de 128 elementos |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); modelo base en GGUF |

## Arquitectura y entrenamiento

El modelo emplea un backbone Qwen3.8-27B con 64 capas, dimensión oculta de 5.120 y atención con cabezas agrupadas (24 cabezas de consulta y 4 de clave-valor, con head_dim de 256). La innovación principal es la hibridación de atención: capas de atención lineal Gated DeltaNet combinadas con capas de atención completa cada cuatro capas, lo que reduce el coste computacional y de memoria del contexto largo manteniendo la ventana nativa de 262.144 tokens.

Los pesos del tronco son ternarios (2 bits) con una escala por bloque firmado de 128 elementos y codificación hadamard-signed. El pack MLX recodifica la familia ternaria PQ2_0/PTQ1_0 a afín de 2 bits de MLX mediante un cargador y codificador parcheados incluidos en `runtime/`. La validación de recarga (`reload-validation.json`) confirma equivalencia con el GGUF de UkisAI: diferencia máxima absoluta de logits de 0.0, argmax idéntico y salida "PONG" idéntica en decodificación greedy. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de tipo conversacional (pipeline `text-generation`).
- Razonamiento matemático y de dominio científico, según los benchmarks publicados por UkisAI (AIME 2025, GPQA-Diamond).
- Seguimiento de instrucciones, con rendimiento declarado en IFBench.
- Capacidades multilingües limitadas: la model card solo declara inglés (`en`).
- Contexto largo de hasta 262.144 tokens nativos (con restricciones prácticas de memoria en el host).
- Tool calling / function calling: no disponible de forma fiable; la model card advierte que el modelo es irregular en uso de herramientas.
- Modo thinking / MTP: no incluido en este pack (el sidecar MTP se distribuye en un repositorio separado).
- Visión y audio: no soportados (pack solo texto).

## Casos de uso

- Experimentación con cuantización ternaria en Apple Silicon: el pack permite cargar un modelo de ~27B con pesos de 2 bits en un Mac y validar la equivalencia bit-exacta frente al GGUF de referencia, útil para investigar técnicas de compresión extrema.
- Razonamiento matemático offline: con resultados declarados de 93,33% en AIME 2025, puede usarse para resolver problemas matemáticos en entornos locales sin conexión, siempre que se acepte su naturaleza experimental.
- Evaluación de atención lineal híbrida: la combinación Gated DeltaNet + atención completa cada 4 capas lo convierte en un banco de pruebas para estudiar el comportamiento de contextos largos (hasta 262K tokens) en hardware de consumo.
- Prototipado de asistentes conversacionales en inglés: para flujos de chat multi-turno donde el contexto no supere ~16K tokens en hosts de 16 GB de memoria unificada.
- Investigación sobre decodificación especulativa: sirve como tronco base para emparejarlo con la cabeza MTP de Qwen3.8 en el repositorio complementario `EngineeringWithJay/Swift-Bonsai-2-MTPLX`.
- Reproducción de benchmarks de razonamiento: permite replicar localmente las cifras publicadas por UkisAI (GPQA-Diamond, C-Eval, IFBench, AIME 2025) y verificar la conservación de calidad tras la recodificación a MLX.

## Benchmarks y rendimiento

Resultados publicados por UkisAI (upstream), comparando Swift Bonsai 2 con el base Ternary Bonsai 2. Este pack no los re-mide; solo verifica equivalencia bit-exacta con el GGUF de origen.

| Benchmark | Swift Bonsai 2 | Ternary Bonsai 2 (base) |
|---|---|---|
| GPQA-Diamond | 84,34% | 84,18% |
| C-Eval | 81,47% | 81,37% |
| IFBench | 82,60% | 82,13% |
| AIME 2025 | 93,33% | 92,00% |

## Requisitos de hardware

- Peso en disco: aproximadamente 7,2 GB (tamaño del repo: 7,7 GB).
- Memoria: mantener contexto ≲ 16K en hosts con 16 GB de memoria unificada; usar 96K solo con 24 GB o más de memoria unificada.
- Hardware objetivo: Apple Silicon (MLX). No se indica compatibilidad con GPU NVIDIA o AMD en esta información.
- GPU de consumo: cabe en equipos Apple Silicon con memoria unificada de 16 GB o superior, según las indicaciones del autor.
- Despliegue: requiere el cargador parcheado incluido en `runtime/`; no es válido para las rutas estándar de `mlx_lm`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este pack.
- Latencia y throughput: no disponibles.
- Ajustes de muestreo recomendados por UkisAI: temperature 1.0, top-p 0.95, top-k 20, min-p 0.0, sin penalizaciones de repetición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift Bonsai 2 27B — MLX (este) | 26,9B | 262.144 | Ternaria 2 bits → afín MLX 2 bits | Apache-2.0 | Hugging Face, MLX con cargador parcheado |
| Ternary Bonsai 2 27B (Prism ML) | no disponible | no disponible | Ternaria 2 bits | no disponible | Hugging Face (GGUF) |
| Swift Bonsai 2 GGUF (UkisAI) | no disponible | no disponible | Ternaria 2 bits | no disponible | Hugging Face (GGUF) |
| Swift Bonsai 2 MTPLX (EngineeringWithJay) | no disponible | no disponible | no disponible | no disponible | Hugging Face (MLX con cabeza MTP) |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Release experimental de investigación: el autor advierte rendimiento irregular en seguimiento de instrucciones, uso de herramientas y codificación abierta.
- No es válido para rutas estándar de `mlx_lm`; requiere el cargador parcheado en `runtime/`.
- Solo texto: sin visión ni MTP en este pack.
- Solo inglés declarado; no hay soporte multilingüe confirmado.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse `NOTICE.txt` y `LICENSE`, con atribución a Prism ML (Bonsai) y UkisAI (pesos Swift).
- Gestión de memoria: el KV cache crece con el contexto; superar los límites de memoria unificada indicados puede provocar fallos.
- Muestreo: no añadir penalizaciones de repetición según las instrucciones del autor.

## Enlaces

- Hugging Face: https://huggingface.co/EngineeringWithJay/Swift-Bonsai-2-27B-MLX
- Modelo base (GGUF): https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Modelo origen (Ternary Bonsai 2 27B, Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Pack MTP complementario: https://huggingface.co/EngineeringWithJay/Swift-Bonsai-2-MTPLX
