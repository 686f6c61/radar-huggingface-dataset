# litert-community/Qwen3.5-9B

## Resumen

Qwen3.5-9B en formato LiteRT-LM es la conversión del modelo Qwen/Qwen3.5-9B de Alibaba Qwen al formato `.litertlm` propietario del runtime LiteRT-LM de Google AI Edge, orientado a inferencia en dispositivo (on-device) y entornos edge. El repositorio, mantenido por la comunidad litert-community, distribuye cuatro variantes cuantizadas (INT8, Mixed INT4 y dos composites para GPU de LiteRT-LM 0.19.x) que contienen únicamente el decodificador de texto del checkpoint original, no el codificador visual.

El modelo base es un transformer híbrido de 9B parámetros con 32 capas, de las cuales 24 emplean GatedDeltaNet (atención lineal con estado recurrente de tamaño constante) y 8 usan atención completa con KV cache creciente. Incorpora una ventana de contexto nativa de 262.144 tokens en el checkpoint original, aunque los ficheros LiteRT-LM la limitan a 4.096 tokens. La licencia Apache 2.0 y el enfoque en despliegue local sin GPU dedicada lo hacen relevante para aplicaciones móviles, embebidas y de escritorio.

La relevancia actual reside en la combinación de un modelo de razonamiento de 9B con un runtime optimizado para hardware consumer: la variante Mixed INT4 decodifica a 46,1 tok/s en la GPU de un Mac Studio M4 Max, y las versiones composite de noviembre de 2026 mejoran el prefill un 28,7 % y la decodificación un 24,4 % respecto a la variante Mixed INT4 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas GatedDeltaNet (atención lineal) + 8 capas de atención completa |
| Parametros totales | 9.653.104.368 en el release; 8.953.803.264 en estos ficheros (solo decodificador de texto) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos en el checkpoint original; 4.096 tokens en los ficheros LiteRT-LM |
| Tipos de cuantizacion | INT8 dinámico, Mixed INT4 (int4 blockwise-32 + int8 en embedding y lm_head), composites GPU con las mismas recetas |
| Idiomas soportados | No disponible en esta ficha (Qwen declara 201 idiomas y dialectos para Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); cuatro ficheros: `mixed_int4_gpu_composite_v0190` (6,02 GB), `int8_gpu_composite_v0190` (9,17 GB), `int8` (9,20 GB), `mixed_int4` (6,06 GB) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño híbrido de Qwen3.5: 32 capas con hidden size 4096 e intermediate size 12288 (FFN denso en todas las capas), 16 cabezas de atención con 4 KV heads de dimensión 256, y atención lineal con 16 cabezas de clave y 32 de valor de dimensión 128. Solo las 8 capas de atención completa mantienen KV cache creciente; las 24 capas GatedDeltaNet portan un estado convolucional y recurrente de tamaño constante, lo que reduce drásticamente el coste de memoria en contextos largos. El vocabulario es de 248.320 tokens con embeddings no atados.

El checkpoint original es multimodal (early-fusion vision-language) y fue entrenado con aprendizaje por refuerzo a escala, según la descripción de Qwen. Sin embargo, estos ficheros LiteRT-LM contienen exclusivamente el decodificador de texto: no incluyen la torre de visión ni la cabeza de predicción multi-token. La conversión se realizó con litert-torch (commit 115a1360 con el parche híbrido de Qwen3.5) y se validó con litert-lm 0.18.0 y 0.19.x. La plantilla de chat es la de los ficheros Qwen3.5-4B, con `enable_thinking` desactivado por defecto (a diferencia del modelo original, que piensa por defecto), y escribe el bloque vacío `<think>\n\n</think>` en el prompt de generación cuando el razonamiento está desactivado.

## Capacidades

- Generación de texto y razonamiento en modo dual: respuesta directa por defecto o razonamiento explícito con `ThinkingConfig(enable_thinking=True)` / `--thinking true`, que devuelve la cadena de pensamiento por el canal `thought`.
- Razonamiento multi-paso y matemáticas, heredado del post-entrenamiento de Qwen3.5 (MMLU-Pro 82,5 e IFEval 91,5 reportados por el proveedor).
- Tool calling / function calling: los metadatos del LLM incluyen el formato de llamada a herramientas de LiteRT-LM v0.1.
- Capacidades multilingües según Qwen (201 idiomas y dialectos), si bien la model card de esta conversión no detalla la cobertura efectiva.
- Sin capacidades de visión ni vídeo en estos ficheros: la torre de visión del checkpoint original no está incluida.
- Ejecución on-device en CPU y GPU mediante el runtime LiteRT-LM, con backend GPU disponible en las variantes composite para LiteRT-LM 0.19.x.

## Casos de uso

- Asistentes locales en dispositivos móviles: la variante Mixed INT4 (6,02 GB) permite desplegar un modelo de 9B con razonamiento en un smartphone de gama alta mediante LiteRT-LM, sin conexión a la nube y con la privacidad que ello implica.
- Aplicaciones de escritorio con aceleración GPU: en un Mac Studio M4 Max la variante composite Mixed INT4 alcanza 46,1 tok/s de decodificación, suficiente para chat interactivo y generación de texto en tiempo real en herramientas de productividad locales.
- Procesamiento de documentos con contexto medio: los 4.096 tokens de ventana permiten resumir artículos, correos o informes de varias páginas en un solo paso, con la ventaja de que las capas de atención lineal mantienen un estado de tamaño constante.
- Automatización de flujos con tool calling: el soporte del formato de llamada a herramientas de LiteRT-LM permite integrar el modelo en agentes locales que consulten APIs, calendarios o bases de datos mediante function calling.
- Razonamiento asistido en entornos sin GPU: la variante INT8 (9,20 GB) está pensada para CPU y permite ejecutar el modelo en servidores sin acelerador, útil para tareas batch de clasificación, extracción o generación de borradores.
- Educación y prototipado de IA en el borde: investigadores pueden evaluar el comportamiento de un modelo híbrido GatedDeltaNet + atención completa en hardware de bajo consumo, comparando latencia y calidad frente a transformers densos equivalentes.
- Moderación y análisis de texto en local: la licencia Apache 2.0 y la ejecución on-device facilitan desplegar filtros de contenido o clasificadores de sentimiento en infraestructura propia sin dependencia de proveedores externos.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los reportados por el proveedor Qwen para el modelo base, no ejecutados por el autor de la conversión:

| Benchmark | Qwen3.5-9B (reportado por el proveedor) |
|---|---|
| MMLU-Pro | 82,5 |
| IFEval | 91,5 |

Rendimiento de inferencia medido por el autor de la conversión:

| Fichero | Dispositivo / runtime | Decodificación | Prefill |
|---|---|---|---|
| `mixed_int4` | Mac Studio M4 Max, GPU, litert-lm 0.18.0 | 46,1 tok/s | No disponible |
| `mixed_int4_gpu_composite_v0190` | Mac Studio M4 Max, GPU, litert-lm 0.19.2 | +24,4 % vs. `mixed_int4` | +28,7 % vs. `mixed_int4` |
| `mixed_int4` | Galaxy S26, GPU, litert-lm 0.18.0 | No compiló (error de rendimiento) | No disponible |

No se han publicado resultados de benchmarks independientes de las variantes LiteRT-LM en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 6,02 GB para la variante Mixed INT4 composite, 6,06 GB para Mixed INT4, 9,17 GB para INT8 composite y 9,20 GB para INT8. Añadir margen para activaciones y estado recurrente.
- GPU recomendadas: Mac Studio M4 Max (GPU, verificado a 46,1 tok/s); las variantes composite requieren LiteRT-LM 0.19.x (en la GPU de 0.18.1 devuelven `!!!…`).
- GPU consumer: cabe en GPUs con 8 GB o más de VRAM en cuantización INT4; la variante INT8 requiere al menos 12 GB para mayor comodidad.
- Móvil: el motor GPU de la variante Mixed INT4 no compiló en un Galaxy S26 con litert-lm 0.18.0; la ejecución en CPU sí está soportada con la variante INT8.
- Opciones de despliegue: exclusivamente el runtime LiteRT-LM (CLI `litert-lm` y librería `litert-lm`); no hay ficheros GGUF, safetensors ni compatibilidad con vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: 46,1 tok/s de decodificación en GPU M4 Max con Mixed INT4; sin datos de latencia de prefill absoluta ni de throughput en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B (LiteRT-LM, este repo) | 8,95B (solo texto) | 4.096 en estos ficheros (262.144 nativo) | `.litertlm` / LiteRT-LM | Apache 2.0 | MMLU-Pro 82,5, IFEval 91,5 (proveedor); 46,1 tok/s en M4 Max GPU |
| Qwen3.5-4B (LiteRT-LM) | 4B (solo texto) | No disponible | `.litertlm` / LiteRT-LM | Apache 2.0 | Misma ruta de conversión y plantilla de chat; menor huella de memoria |
| Qwen3.5-2B (LiteRT-LM) | 2B (solo texto) | No disponible | `.litertlm` / LiteRT-LM | Apache 2.0 | Orientado a dispositivos con menos recursos |
| Qwen3.5-0.8B (LiteRT-LM) | 0,8B (solo texto) | No disponible | `.litertlm` / LiteRT-LM | Apache 2.0 | Variante mínima de la familia para edge |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de visión y la cabeza de predicción multi-token del checkpoint original no están incluidas, por lo que no hay entrada de imagen ni vídeo.
- Contexto truncado: los ficheros limitan la ventana a 4.096 tokens frente a los 262.144 nativos del modelo base; tareas que requieran contexto largo no son viables con estas variantes.
- Razonamiento desactivado por defecto: a diferencia del modelo original, la plantilla de chat no activa el modo thinking salvo petición explícita; los resultados pueden diferir de los publicados por Qwen si no se activa.
- Compatibilidad de runtime restringida: las variantes composite requieren LiteRT-LM 0.19.x; en versiones anteriores fallan en GPU. El ecosistema de herramientas es mucho más limitado que el de GGUF o safetensors.
- Fallo conocido en GPU móvil: el motor GPU de la variante Mixed INT4 no compiló en un Galaxy S26 con litert-lm 0.18.0.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 9B; no se han publicado evaluaciones de factualidad específicas para estas variantes.
- Sesgos: no se documentan análisis de sesgo en la model card; se heredan los del checkpoint Qwen3.5-9B original.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-9B debe verificarse por separado para confirmar que su licencia es compatible con el uso previsto.
- Idiomas: aunque Qwen declara 201 idiomas, no hay evaluación de la calidad multilingüe en el formato LiteRT-LM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base preentrenado: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Conversión Qwen3.5-4B: https://huggingface.co/litert-community/Qwen3.5-4B
- Conversión Qwen3.5-2B: https://huggingface.co/litert-community/Qwen3.5-2B
- Conversión Qwen3.5-0.8B: https://huggingface.co/litert-community/Qwen3.5-0.8B
