# HiHim/Photon-2.0-1M

## Resumen

Photon-2.0-1M es un modelo de lenguaje extremadamente compacto (SLM) desarrollado por AtomixLabs, publicado en HuggingFace bajo el identificador `HiHim/Photon-2.0-1M`. Se trata de la segunda generación de la serie Photon y cuenta con 1.049.728 parámetros totales, una ventana de contexto nativa de 512 tokens y un vocabulario reducido a 1.536 entradas. El modelo se distribuye con licencia Apache-2.0 y está pensado exclusivamente para generación de texto en inglés.

La propuesta del autor no es competir en capacidad general, sino explorar la eficiencia computacional y la muestra de entrenamiento en el régimen de un millón de parámetros. La versión 2.0 mantiene exactamente la misma configuración de arquitectura que Photon-1.0-1M, pero introduce correcciones en el tokenizador e innovaciones en el pipeline de pre-entrenamiento que le permitieron, según la model card, alcanzar mejores resultados usando solo 1.280 millones de tokens, la mitad del presupuesto de la versión anterior (2.560 millones).

Se apoya deliberadamente en una arquitectura LLaMA estándar, sin mecanismos de atención exóticos ni dependencias no nativas, lo que facilita su ejecución en `transformers`, su conversión a otros formatos y su uso como banco de pruebas para investigación en scaling, tokenización y pipelines de entrenamiento de modelos diminutos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con bloques LLaMA estándar (SwiGLU, RoPE, MHA 4:4) |
| Parámetros totales | 1.049.728 (dato real de los safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (`max_position_embeddings = 512`, `rope_theta = 1110.0`) |
| Tipos de cuantización | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni FP8; el repo ocupa 0,0 GB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, librería `transformers`; tag `text-generation-inference` y `endpoints_compatible` |

Detalles adicionales de configuración publicados en la model card: `vocab_size = 1536` (comprimido mediante lo que el autor denomina "Topological BPE Compiler"), `hidden_size = 128`, `intermediate_size = 384` (ratio SwiGLU de 3,0x, divisible por 64 y 32), `num_hidden_layers = 4`, `num_attention_heads = 4`, `num_key_value_heads = 4` (head_dim = 32). El ratio hidden/vocabulario es de 0,083.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar con cuatro capas, atención multi-cabeza completa 4:4 (sin GQA/MQA) y activación SwiGLU. El autor justifica explícitamente la ausencia de innovaciones estructurales: sostiene que si una arquitectura necesita modificaciones profundas para funcionar, el problema suele residir en el entrenamiento y la optimización, no en el bloque transformer. El vocabulario de 1.536 tokens y las cuatro capas se describen como el "Markov Floor" (2 pares residuales), con el presupuesto de parámetros concentrado en capas densas de alta utilidad en lugar de en una tabla de vocabulario grande. Esto implica una tokenización muy fragmentada: cualquier texto en inglés se convierte en muchas más piezas de las habituales, lo que consume rápidamente la ventana de 512 tokens.

El pre-entrenamiento consumió aproximadamente 1.280 millones de tokens, la mitad del presupuesto de la versión 1.0. La mezcla se compone de subconjuntos curados de `openbmb/UltraX-Preview`: `UltraX-Ultra-FineWeb` (540 M tokens, Apache-2.0), `UltraX-FineWeb-ProX-Doc` (300 M, ODC-BY), `UltraX-AICC` (180 M, CC-BY-4.0), `UltraX-FineWeb` (120 M, ODC-BY) y `UltraX-RedPajama-V2` (60 M, Apache-2.0), más aproximadamente 80 millones de tokens de datos aritméticos sintéticos generados de forma automática (la receta exacta es propietaria). No se documenta ninguna fase de ajuste supervisado, RLHF, DPO o alineación posterior al pre-entrenamiento. Las tres actualizaciones declaradas en la versión 2.0 son: corrección de bugs del tokenizador, mejoras algorítmicas en tiempo de entrenamiento no especificadas y una eficiencia de muestra notablemente superior (mismos resultados o mejores con la mitad de tokens).

## Capacidades

- Generación de texto en inglés con vocabulario restringido (1.536 tokens), orientada a continuaciones cortas.
- Razonamiento básico y recuperación de información dentro de secuencias muy cortas, gracias al esquema MHA 4:4 con head_dim 32, que el autor asocia a una mayor capacidad de "fact retrieval".
- Procesamiento de relaciones lógicas y consistencia numérica elemental, reforzado con 80 M de tokens de aritmética sintética.
- Aritmética de un solo paso y operaciones simples, presumiblemente en formatos muy pautados.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente, planificación multi-paso ni uso de herramientas externas.
- Multilingüismo: no soportado; la model card declara únicamente inglés.
- Capacidades especiales: no se documenta modo de razonamiento explícito (thinking mode), visión, audio, ni decodificación especulativa.

## Casos de uso

- Docencia e investigación en scaling laws: el modelo permite reproducir experimentos de pre-entrenamiento completos en minutos y con hardware trivial, incluyendo barridos de presupuesto de tokens y comparaciones entre 1,28 y 2,56 mil millones de tokens.
- Banco de pruebas de tokenizadores: al usar un vocabulario de 1.536 entradas generado con el "Topological BPE Compiler", sirve para medir el impacto real de decisiones de tokenización en modelos muy pequeños.
- Pruebas de humo (smoke tests) de pipelines MLOps: su huella de ~4 MB permite validar de extremo a extremo el ciclo de carga, inferencia, serialización y despliegue de un modelo `transformers` antes de escalar a modelos mayores.
- Inferencia en el extremo (edge) y dispositivos embebidos: cabe en microcontroladores, navegadores o una Raspberry Pi, lo que habilita tareas de generación de texto muy acotada o etiquetado local sin conectividad.
- Clasificación y enrutado de texto corto: con 512 tokens de contexto puede actuar como clasificador binario o enrutador previo en cascadas de modelos, reservando el modelo grande para los casos ambiguos.
- Generación de plantillas y texto predictivo embebido: útiles en teclados, formularios o asistentes de autocompletado con vocabulario controlado y frases de pocas palabras.
- Reproducibilidad de recetas de datos: el desglose exacto de la mezcla de UltraX-Preview publicado por el autor facilita auditar la contribución de cada subconjunto de datos a los resultados finales.
- Educación sobre licencias de datos: la tabla de componentes incluye las licencias originales subyacentes (Apache-2.0, ODC-BY, CC-BY-4.0), lo que lo convierte en un caso práctico de atribución en datasets agregados.

## Benchmarks y rendimiento

La model card describe la metodología de evaluación, pero la información disponible se corta antes de mostrar las puntuaciones numéricas. La evaluación se declara en entorno estrictamente zero-shot (`num_fewshot=0`), y la puntuación global se calcula con una media de cuatro vías que agrega primero ARC-Easy y ARC-Challenge según la fórmula:

`ARC Combined = (ARC-Easy + ARC-Challenge) / 2`

No se han publicado resultados numéricos de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros no aparecen, y los valores de ARC quedan truncados). No se ofrecen comparaciones cuantitativas con Photon-1.0-1M más allá de la afirmación cualitativa de que la versión 2.0 obtiene mejores puntuaciones con la mitad del presupuesto de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4,2 MB en fp32, ~2,1 MB en fp16/bf16, ~1,0 MB en int8 y ~0,5 MB en int4 (cálculo a partir de 1.049.728 parámetros).
- Caché KV con contexto completo (512 tokens, 4 capas, 4 cabezas KV, head_dim 32): ~1 MB en fp16.
- Huella total en memoria en fp16: por debajo de 10 MB incluyendo pesos, caché y overhead del runtime.
- GPU recomendadas: cualquiera sirve; el modelo no requiere GPU. Funciona en CPU, en Raspberry Pi, en móviles y en el navegador (por ejemplo, vía ONNX o transformers.js).
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4090 e incluso iGPU. También cabe en memoria de un microcontrolador de gama alta.
- Opciones de despliegue: `transformers` (soporte nativo), `text-generation-inference` (el modelo lleva ese tag y `endpoints_compatible`), ONNX Runtime y previsiblemente llama.cpp/Ollama tras conversión manual a GGUF, aunque no se publican artefactos GGUF oficiales.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones. Dado el tamaño, la latencia estará dominada por el overhead por token y por el número de tokens generados, que será alto para un texto dado debido al vocabulario de 1.536 entradas.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus model cards públicas y no se han podido contrastar con la búsqueda web, que no devolvió resultados relevantes. Verifíquelos antes de usarlos en una decisión técnica.

| Modelo | Parámetros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| Photon-2.0-1M | 1.049.728 | 512 | Apache-2.0 | safetensors, `transformers` |
| TinyStories-1M (roneneldan) | ~1 M (dato no verificado) | no disponible | no disponible | safetensors/`transformers` |
| SmolLM2-135M (HuggingFaceTB) | 135 M | 8.192 (verificar en model card) | Apache-2.0 | safetensors, GGUF, `transformers` |
| Qwen2.5-0.5B (Alibaba) | ~0,49 B | 32.768 | Apache-2.0 | safetensors, GGUF, `transformers` |

Diferencias clave: Photon-2.0-1M es dos órdenes de magnitud más pequeño que SmolLM2-135M y tres que Qwen2.5-0.5B, con una ventana de contexto 16 y 64 veces menor respectivamente. Su ventaja es la huella (unos pocos megabytes) y la transparencia de la receta de datos; su desventaja es la ausencia de benchmarks publicados completos, de cuantizaciones listas para usar y de cualquier fase de alineación.

## Limitaciones y advertencias

- Capacidad muy limitada: con 1 M de parámetros y 4 capas, no es un modelo apto para producción en tareas de conocimiento general, razonamiento complejo ni generación larga y coherente.
- Riesgo elevado de alucinación y de incoherencia a partir de pocos tokens generados; la ventana de 512 tokens limita cualquier conversación multi-turno.
- Vocabulario de 1.536 entradas: la tokenización es muy fragmentada, lo que reduce el texto útil que cabe en el contexto y degrada el rendimiento en palabras poco frecuentes.
- Solo inglés: no hay soporte declarado para castellano ni para ningún otro idioma.
- Sin alineación documentada: no consta SFT, RLHF ni DPO, por lo que no cabe esperar rechazo de peticiones dañinas ni formato conversacional fiable.
- Sesgos: al entrenarse sobre subconjuntos de web (FineWeb, FineWeb-ProX-Doc, RedPajama-V2, AICC), hereda los sesgos de esos corpus, sin que se documente ninguna mitigación.
- Licencia Apache-2.0 para el modelo, pero los datos subyacentes tienen licencias propias (ODC-BY, CC-BY-4.0, Apache-2.0); cualquier redistribución debe respetar la atribución de las fuentes originales de UltraX-Preview.
- No se publican artefactos cuantizados ni conversiones a GGUF: el despliegue fuera de `transformers` requiere trabajo adicional y validación por cuenta propia.
- Señales de madurez del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, y una fecha de creación registrada como 19 de septiembre de 2026, posterior al momento de publicación de otras fichas del sector; conviene verificar su estado real antes de citarlo.
- Los resultados de benchmarks no están accesibles en la información disponible; la afirmación de mejora sobre la versión 1.0 es cualitativa y no verificable con los datos publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HiHim/Photon-2.0-1M
- Imagen de portada de la model card: https://cdn-uploads.huggingface.co/production/uploads/64b433c3faa3181a5e98c87c/flAyTf3Qtzszkal-cqVab.png
- Dataset principal de entrenamiento: https://huggingface.co/datasets/openbmb/UltraX-Preview
- Subconjunto de origen: https://huggingface.co/datasets/openbmb/Ultra-FineWeb (Apache-2.0)
- Subconjunto de origen: https://huggingface.co/datasets/gair-prox/FineWeb-ProX-Doc (ODC-BY)
- Subconjunto de origen: https://huggingface.co/datasets/opendatalab/AICC (CC-BY-4.0)
- Subconjunto de origen: https://huggingface.co/datasets/HuggingFaceFW/fineweb (ODC-BY)
- Subconjunto de origen: https://huggingface.co/datasets/togethercomputer/RedPajama-Data-V2 (Apache-2.0)
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre el modelo; los resultados devueltos correspondían a páginas corporativas de Microsoft y no guardan relación con Photon-2.0-1M.
