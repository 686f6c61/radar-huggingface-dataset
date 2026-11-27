# AmirHossein-razlighi/read-my-lips

## Resumen

Read My Lips (RML) es un sistema de restauración de voz y lectura de labios presentado en el artículo arXiv 2611.33117, desarrollado por AmirHossein Razlighi y colaboradores. El repositorio de Hugging Face no contiene un modelo único, sino los adaptadores LoRA entrenados que forman parte de un pipeline de tres componentes: un lector de labios (Auto-AVSR) que propone las 10 mejores transcripciones de una ventana facial de 4,8 s, un modelo de lenguaje (Gemma-4 12B con LoRA) que selecciona y corrige la transcripción usando el contexto audible, y un generador audiovisual (LTX-2.5 22B con LoRA) que sintetiza el habla resultante con la voz del hablante sincronizada con los labios.

El objetivo del sistema es recuperar habla silenciada o enterrada en ruido: dado un vídeo con una porción de audio eliminada o contaminada, RML reconstruye la locución y la vuelve a "pronunciar" de forma coherente con el movimiento labial. Se trata, por tanto, de una contribución de investigación en reconocimiento visual del habla y reparación de audio, no de un modelo de propósito general.

El repositorio pesa 1,5 GB y contiene únicamente los pesos entrenados por los autores (un LoRA de lenguaje y tres LoRA del generador), no los modelos base. La inferencia requiere descargar por separado LTX-2.5, Gemma-4 12B y Auto-AVSR, y está pensada para ejecutarse en una única GPU de 80 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline compuesto: Auto-AVSR (lector de labios) + Gemma-4 12B con LoRA (selección y corrección) + LTX-2.5 22B con LoRA (generación audiovisual) |
| Parametros totales | No disponible como cifra única; el repositorio contiene adaptadores LoRA (171 MB el de lenguaje, 453 MB cada uno de los tres del generador) sobre modelos base de 12B y 22B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El modelo base Gemma-4 se referencia en variante qat-q4_0-unquantized; los LoRA se distribuyen en float32 (lenguaje) y bf16 (generador). No se documentan otras cuantizaciones |
| Idiomas soportados | No disponibles |
| Licencia | LTX-2.x Community License (LoRA del generador) y términos de Gemma (LoRA de lenguaje); código MIT |
| Formato de pesos | safetensors (PEFT para el LoRA de lenguaje; formato LoRA de ComfyUI para los del generador) |

## Arquitectura y entrenamiento

El sistema combina tres etapas en cascada. Primero, un lector de labios basado en Auto-AVSR genera las 10 transcripciones candidatas más probables para una ventana facial de 4,8 s. Después, un Gemma-4 12B ajustado con un LoRA de rango 32 y alpha 64 sobre las proyecciones q/k/v/o actúa como modelo de lenguaje: elige una de las candidatas y la corrige con el contexto audible disponible (enfoque "select-then-edit"). Finalmente, un generador LTX-2.5 22B ajustado con LoRA sintetiza el habla en la voz del hablante, sincronizada con los labios. El pipeline renderiza seis configuraciones y selecciona la salida mejor respaldada por la evidencia de audio y labial.

Los LoRA del generador se distribuyen en tres variantes que corresponden a distintas etapas de entrenamiento: `generator/main` (etapa final, cubre todas las configuraciones salvo las dos siguientes), `generator/silenced_reader` (primera etapa: transcripción del lector de labios a habla con el audio de entrada conservado, sobre entradas silenciadas) y `generator/noisy_keep` (segunda etapa: sin transcripción, audio de entrada ruidoso conservado). Los modelos se entrenaron sobre vídeos públicos de talking-head (TalkVid). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Lectura de labios y reconocimiento visual del habla a partir de vídeo.
- Selección y corrección de transcripciones mediante un modelo de lenguaje con contexto audible.
- Restauración de habla silenciada (speech inpainting) y mejora de habla en ruido (speech enhancement).
- Generación audiovisual sincronizada: síntesis de voz en la voz del hablante alineada con el movimiento labial.
- Procesamiento de audio-visual speech en un pipeline de múltiples etapas con selección de la mejor configuración entre seis variantes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step general ni soporte multilingüe explícito.

## Casos de uso

- Restauración de grabaciones dañadas: dado un vídeo con un tramo de audio silenciado, el pipeline recupera la locución a partir del movimiento labial y la reconstruye con la voz del hablante, útil en archivos históricos o entrevistas deterioradas.
- Mejora de habla en entornos ruidosos: en grabaciones con ruido de fondo, la variante `noisy_keep` conserva el audio de entrada y genera una versión inteligible sincronizada con los labios.
- Doblaje y postsincronización: el generador puede producir habla alineada con los labios del hablante, lo que resulta aplicable a tareas de redoblaje o corrección de audio en producción audiovisual.
- Investigación en reconocimiento visual del habla: los checkpoints permiten reproducir y evaluar el pipeline completo sobre los conjuntos de test publicados en el repositorio de datos.
- Análisis forense de vídeo: la combinación de lector de labios y modelo de lenguaje con contexto audible puede apoyar la transcripción de material audiovisual donde el audio es parcial o inexistente.
- Docencia y divulgación sobre modelos generativos audiovisuales: el sistema sirve como ejemplo reproducible de composición de lectores de labios, LLM y generadores de vídeo con LoRA.
- Evaluación comparativa de pipelines audio-visuales: los seis renderizados y la selección basada en evidencia permiten estudiar estrategias de fusión de modalidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia pensada para una única GPU de 80 GB (según la model card), lo que apunta a A100 80 GB, H100 80 GB o similares.
- No cabe en GPU de consumo estándar (RTX 4090 de 24 GB, etc.) con el pipeline completo, dado que combina Gemma-4 12B y LTX-2.5 22B.
- El repositorio solo contiene los LoRA (1,5 GB); es necesario descargar aparte LTX-2.5, Gemma-4 y Whisper mediante `scripts/download_checkpoints.sh`.
- Despliegue mediante el código oficial (`scripts/rml_infer.py`) con entorno gestionado por `uv`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (lectura de labios con restauración de habla y generación audiovisual) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Riesgo de uso indebido: los modelos pueden generar habla en la voz de una persona que esa persona no pronunció; la model card remite a la sección de uso responsable (Apéndice F del artículo) antes de cualquier aplicación.
- Entrenados sobre vídeos públicos de talking-head (TalkVid), por lo que pueden heredar sesgos de ese corpus en cuanto a demografía, idioma y condiciones de grabación.
- Riesgo de alucinación en la etapa de lenguaje: el modelo Gemma-4 con LoRA selecciona y corrige transcripciones, lo que puede introducir contenido no respaldado por la evidencia audiovisual.
- Restricciones de licencia: los LoRA del generador son derivados de LTX-2.5 y se rigen por la LTX-2.x Community License, con restricciones de uso; el LoRA de lenguaje sigue los términos de Gemma-4. El uso comercial está sujeto a ambas licencias.
- Requisito de hardware elevado (GPU de 80 GB) que limita su despliegue en entornos de producción convencionales.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe.
- Longitud de contexto del componente de lenguaje no disponible.
- Proyecto de investigación con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AmirHossein-razlighi/read-my-lips
- Artículo (arXiv): https://arxiv.org/abs/2611.33117
- Código: https://github.com/amirhossein-razlighi/read_my_lips
- Página del proyecto: https://amirhossein-razlighi.github.io/read_my_lips/
- Dataset: https://huggingface.co/datasets/AmirHossein-razlighi/read-my-lips-data
- Modelo base del generador: https://huggingface.co/Lightricks/LTX-2.5
- Modelo base del lenguaje: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Licencia LTX-2.x: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
