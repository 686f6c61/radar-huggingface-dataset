# BuilderHelm/Kanso-Satori-1.0-3bit

## Resumen

Kanso Satori 1.0 3-bit es una cuantización de 3 bits del modelo de limpieza de dictado Kanso Satori 1.0 de BuilderHelm (anteriormente ZenVoice), un fine-tune de Qwen3-4B-Instruct-2507 especializado en transformar la salida cruda de un sistema de reconocimiento de voz en texto escrito correcto. El modelo toma transcripciones sin puntuación ni mayúsculas, elimina muletillas y falsos arranques, y restaura las formas escritas de números, importes, fechas, horas, correos y URL. No es un modelo de propósito general: está diseñado para una única tarea muy concreta dentro de una aplicación de dictado.

Técnicamente es un transformer denso de 4.022.468.096 parámetros (4B) derivado de la familia Qwen3, cuantizado a 3 bits con DWQ (distilled weight quantization) sobre los pesos bf16 del modelo base. El resultado pesa 1,76 GB frente a los 2,26 GB de la versión de 4 bits, y decodifica a unos 58 tok/s en un Apple M5 (frente a 47 tok/s del 4-bit). Está empaquetado en formato MLX para ejecución local en Apple Silicon.

Su relevancia es acotada: el propio autor lo posiciona como una opción de compromiso para quien quiera el modelo de 4B por debajo de 2 GB. En dictados cortos rinde a la par que el 4-bit, pero en datos held-out y dictados de longitud media empeora, y el modelo Lite de 1,7B es más pequeño y rápido. Es, por tanto, una variante de interés para despliegues con restricciones estrictas de memoria en Mac, no una mejora general sobre las alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits DWQ (group size 64) |
| Idiomas soportados | inglés (limpieza de dictado en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); repo de 1,8 GB, pesos de 1,76 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4B parámetros heredado de Qwen3-4B-Instruct-2507, sobre el que se aplicó un fine-tune para la tarea de limpieza de dictado. El adaptador resultante se fusionó en los pesos bf16 (`Kanso-Satori-1.0-bf16`) y posteriormente se cuantizó a 3 bits mediante DWQ (distilled weight quantization) con group size 64. La destilación se realizó sobre 1.024 muestras de entrenamiento de hasta 512 tokens, con learning rate 1e-6, usando como objetivos los top-1.024 logits del modelo bf16 renderizados en el formato de entrenamiento. El resultado es un modelo plano, sin adaptador que cargar.

Un detalle técnico crítico es la plantilla de chat: el fine-tune se entrenó con un bloque de pensamiento vacío (`<think>\n\n</think>\n\n`) al inicio de cada respuesta, y el `chat_template.jinja` incluido en el repo termina el prompt de generación con ese bloque. Si se usa la plantilla estándar de Qwen3-4B-Instruct-2507, las builds de 3 bits se desvían hacia tokens `<tool_call>`. El autor recomienda decodificación greedy. No se dispone de información sobre el volumen total de tokens de entrenamiento del fine-tune original ni sobre el uso de RLHF/DPO.

## Capacidades

- Limpieza de dictado en inglés: restaura puntuación y mayúsculas sobre la salida cruda de un sistema de speech-to-text.
- Eliminación de muletillas y falsos arranques del habla espontánea.
- Restauración de formas escritas de números, importes monetarios, fechas, horas, correos electrónicos y URL.
- Adaptación de capitalización y tono al contexto indicado mediante una línea `app:` en el prompt de sistema.
- Generación de texto conversacional en el formato de chat de Qwen3 (pipeline `text-generation`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio; el modelo es de tarea única.
- Capacidad multilingüe: no disponible; el alcance declarado es únicamente dictado en inglés.

## Casos de uso

- Limpieza de dictado en aplicaciones de voz a texto: el modelo recibe la transcripción cruda del ASR y devuelve texto con puntuación, mayúsculas y números en forma escrita, integrándose en el pipeline de la app ZenVoice con un coste medio de 0,27 s por dictado en Apple M5.
- Procesamiento local en Mac sin conexión: al ejecutarse vía MLX en Apple Silicon con 2,17 GB de memoria pico, permite limpiar dictados en un portátil sin enviar audio ni texto a la nube.
- Normalización de importes y fechas en notas de voz: convierte expresiones habladas como "two thousand five hundred dollars and fifty cents" en "$2,500.50", útil para captura de gastos o agendas por voz.
- Corrección de correos y URL dictados: restaura la forma escrita de direcciones de email y enlaces que el ASR transcribe de forma literal o fragmentada.
- Preprocesado para pipelines de documentación: limpiar transcripciones de reuniones antes de pasarlas a un modelo mayor de resumen o extracción, reduciendo ruido y muletillas.
- Despliegue con presupuesto de memoria ajustado: cuando se necesita el modelo de 4B por debajo de 2 GB de pesos en un equipo Apple Silicon, esta build ofrece 1,76 GB con velocidad de decodificación superior a la de 4 bits.

## Benchmarks y rendimiento

Decodificación greedy, Apple M5, MLX 0.32.2. Datos publicados por el autor en la model card.

| Suite | Metrica | v3.2 3-bit DWQ | v3.2 4-bit DWQ | v2.2 Lite (1.7B) |
|---|---|---|---|---|
| eval_v500 (500, cortos) | WER / exact | 4,7% / 64,2% | 4,7% / 67,2% | 5,5% / 65,8% |
| eval_v500 (500, cortos) | Punct F1 | 0,838 | 0,859 | 0,863 |
| Held-out v2.2 (500) | WER / exact | 9,0% / 37,0% | 8,0% / 40,6% | 8,9% / 37,0% |
| Medios, 50-99 palabras (150) | WER | 15,1% | 10,3% | 11,0% |
| Runtime app ZenVoice (eval_v500) | Model WER / exact | 4,0% / 65,4% | 3,9% / 64,6% | 4,0% / 65,4% |
| Runtime app ZenVoice (eval_v500) | Media s por dictado | 0,27 | 0,32 | 0,23 |
| Runtime app ZenVoice (eval_v500) | Memoria pico | 2,17 GB | 2,65 GB | 1,39 GB |
| Pesos | | 1,76 GB | 2,26 GB | 1,05 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 2,17 GB de memoria pico en runtime según el autor (Apple M5, MLX); pesos de 1,76 GB.
- Plataforma objetivo: Apple Silicon con MLX; el repo declara la librería `mlx` y no incluye pesos GGUF ni formatos para CUDA.
- GPU recomendadas: no disponible para CUDA; el modelo está pensado para chips Apple (M-series). No se documenta soporte en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (el runtime medido usa 2,17 GB); no se documenta para GPU consumer NVIDIA.
- Opciones de despliegue: `mlx_lm` (load/generate con `make_sampler`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 58 tok/s de decodificación en Apple M5 (frente a 47 tok/s del 4-bit); 0,27 s de media por dictado en el runtime de la app ZenVoice.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER eval_v500 | Memoria pico | Licencia | Formato |
|---|---|---|---|---|---|---|
| Kanso Satori 1.0 3-bit DWQ | 4B | no disponible | 4,7% | 2,17 GB | Apache-2.0 | safetensors (MLX) |
| Kanso Satori 1.0 4-bit DWQ | 4B | no disponible | 4,7% | 2,65 GB | Apache-2.0 | safetensors (MLX) |
| Kanso Satori v2.2 Lite | 1,7B | no disponible | 5,5% | 1,39 GB | Apache-2.0 | safetensors (MLX) |

Frente al 4-bit, esta build reduce pesos (1,76 GB frente a 2,26 GB) y memoria pico (2,17 GB frente a 2,65 GB) y decodifica más rápido (58 frente a 47 tok/s), a costa de peor exactitud en held-out (37,0% frente a 40,6%) y peor WER en dictados medios (15,1% frente a 10,3%). Frente al Lite de 1,7B, es más pesado y lento (0,27 s frente a 0,23 s por dictado) y solo mejora ligeramente el WER en dictados cortos (4,7% frente a 5,5%). No se dispone de comparación con modelos de limpieza de dictado de otros fabricantes.

## Limitaciones y advertencias

- Solo cubre limpieza de dictado en inglés; no se documenta soporte multilingüe.
- Entradas de una sola pasada de más de 300 palabras pueden repetirse; el autor recomienda trocear los dictados largos en fragmentos alineados por frases.
- En datos held-out cae al nivel de v2.2 Lite y en dictados medios es peor que Lite, según el propio autor.
- Riesgo de alucinación o de reescritura no solicitada: el prompt de sistema insiste en mantener el significado y las palabras del hablante, pero es una tarea generativa sujeta a desviaciones.
- Requiere la plantilla `chat_template.jinja` incluida; con la plantilla estándar de Qwen3-4B-Instruct-2507 las builds de 3 bits se desvían hacia tokens `<tool_call>`.
- Se recomienda decodificación greedy; no se documenta el comportamiento con muestreo.
- Licencia Apache-2.0 heredada de Qwen3-4B-Instruct-2507; los datos de entrenamiento proceden solo de fuentes MIT/Apache-2.0/CC-BY-4.0/CC0, con lista de atribución en el repo de ZenVoice.
- Dependencia de plataforma: empaquetado en MLX, sin formatos GGUF ni soporte CUDA documentado, lo que limita su uso fuera de Apple Silicon.
- El modelo está diseñado para una tarea única; no debe emplearse como asistente general ni como base para tool calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-3bit
- Modelo base bf16: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-bf16
- Modelo 4-bit: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Organización en Hugging Face: https://huggingface.co/BuilderHelm
- Página de ZenVoice: https://getzenvoice.com
- Descarga de ZenVoice para Mac: https://getzenvoice.com/download
- Licencia del modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
