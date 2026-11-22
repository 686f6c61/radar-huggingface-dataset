# PrimeNeural/wav2vec2-large-xlsr-53-gender-recognition-librispeech-pnn-d50-w1a1-j47

## Resumen

Este modelo es una versión comprimida mediante Prime Neural Networks (PNN) del clasificador de género `alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech`, desarrollado por PrimeNeural (PreciseStatistics GmbH). Parte de la arquitectura wav2vec2-large-xlsr-53, un transformer de reconocimiento de voz preentrenado en 53 idiomas, ajustado para clasificar el género del hablante a partir de audio. La contribución de esta variante no es el modelo base, sino el proceso de destilación y cuantización extrema: 146 capas lineales se han convertido en capas PNN a densidad del 50 %, con pesos y activaciones de 1 bit.

El resultado es un artefacto de 46,3 MB (frente a los cientos de MB del modelo original en FP32) que mantiene un 98,09 % de acuerdo top-1 con el modelo original sobre datos reservados. Esto lo hace relevante para despliegues con restricciones severas de memoria y cómputo, como clasificación de audio en dispositivos o servicios de alto volumen, donde el coste por inferencia importa más que la flexibilidad.

La contrapartida es importante: el modelo no se carga con `transformers` de forma estándar. Requiere el paquete PNN propietario (licencia de evaluación), que incluye el cargador `pnn_load.py` y los kernels de CPU/GPU. El formato PNN y el paquete están patentados y licenciados por separado de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-large-xlsr-53 (transformer) con 146 capas lineales sustituidas por capas PNN |
| Parametros totales | 32.516.738 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos y activaciones de 1 bit (signo) con escalas FP16 por entrada y por salida; partes densas en float16 |
| Idiomas soportados | no disponible (el modelo base XLSR-53 cubre 53 idiomas, pero la model card no especifica el conjunto efectivo) |
| Licencia | apache-2.0 (pesos); el paquete PNN se licencia aparte |
| Formato de pesos | safetensors con capas PNN (requiere paquete PNN V4.4) |

## Arquitectura y entrenamiento

El modelo base es un transformer wav2vec2-large-xlsr-53 preentrenado de forma autosupervisada en audio de 53 idiomas y ajustado para clasificación binaria de género del hablante. Sobre esa base, PrimeNeural sustituye 146 capas lineales por capas PNN a densidad del 50 %: cada salida lee un conjunto fijo y estructurado de entradas, con el mismo número de conexiones para todas las salidas, sin almacenar índices. Cada conexión se codifica con un bit (su signo), con una escala FP16 por entrada y por salida. Además, las entradas de cada capa PNN se binarizan mediante un umbral FP16 por entrada, de modo que la operación interna se reduce a XOR y conteo de bits en el kernel PNN.

El proceso de destilación consistió en 20 épocas sobre `openslr/librispeech_asr`, con inicialización por mínimos cuadrados y coincidencia de estados ocultos (hidden-state matching) respecto al modelo original. El resultado reportado es un 98,09 % de acuerdo top-1 con el original en datos reservados. El fichero final pesa 46,3 MB. No se detallan en la información disponible el número de tokens de audio, la composición exacta del dataset más allá de LibriSpeech, ni si hubo ajuste adicional con RLHF/DPO (no aplicable en un clasificador de este tipo).

## Capacidades

- Clasificación de género del hablante a partir de audio (tarea de `AudioClassification` binaria).
- Inferencia con pesos y activaciones de 1 bit en las capas PNN, ejecutables en kernels de CPU y GPU NVIDIA del paquete PNN.
- Carga como `AutoModelForAudioClassification` de transformers una vez reconstruido el modelo con `pnn_load.py`.
- Modo de entrenamiento alternativo: `load(REPO, kernels="off")` devuelve las capas PyTorch para fine-tuning.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un clasificador de audio, no un modelo generativo.
- No se documentan capacidades multilingües efectivas ni modos especiales (thinking, visión, audio generativo).

## Casos de uso

- Moderación y analítica de audio a gran escala: clasificar el género del hablante en flujos de llamadas o grabaciones con un coste de memoria de 46,3 MB y kernels de 1 bit, adecuado para procesar volúmenes altos en CPU.
- Despliegue en dispositivos con memoria limitada: el tamaño reducido permite ejecutar el clasificador en entornos donde el wav2vec2 original en FP32 no cabría, manteniendo un 98,09 % de acuerdo con el original.
- Preprocesado de datasets de voz: etiquetar automáticamente el género en corpus de audio para balancear o segmentar conjuntos de entrenamiento antes de tareas de ASR.
- Enrutamiento en atención al cliente: derivar llamadas a colas o agentes según el género detectado, usando el modelo como clasificador ligero en un pipeline existente.
- Investigación en compresión de modelos: servir como referencia reproducible de destilación con cuantización 1-bit y densidad estructurada, comparando el acuerdo top-1 con el modelo denso.
- Fine-tuning sobre dominio específico: cargar con `kernels="off"` para obtener capas PyTorch y ajustar el clasificador a un corpus propio (por ejemplo, un idioma o canal de audio concreto).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Acuerdo top-1 con el modelo original (datos reservados) | 98,09 % |
| Epocas de destilacion | 20 |
| Tamano del fichero | 46,3 MB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni métricas de precisión, recall o F1 frente a etiquetas de referencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero de pesos es de 46,3 MB, por lo que la huella de memoria es muy inferior a la del wav2vec2-large original.
- GPU recomendadas: no especificadas; el paquete PNN incluye kernels para CPU y GPU NVIDIA.
- Cabe en GPU de consumo: sí, por tamaño de pesos; no se detallan modelos concretos (RTX 4090, etc.) ni requisitos mínimos de VRAM.
- Opciones de despliegue: paquete PNN (cargador `pnn_load.py` y kernels propios); primeneural.net ofrece el modelo como endpoint de inferencia. No compatible con vLLM, llama.cpp, Ollama o TGI de forma directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PrimeNeural/wav2vec2-large-xlsr-53-gender-recognition-librispeech-pnn-d50-w1a1-j47 | 32,5 M | no disponible | Clasificacion de genero | apache-2.0 (pesos) + paquete PNN aparte | Hugging Face, requiere paquete PNN |
| alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech | no disponible en la informacion | no disponible | Clasificacion de genero | no disponible en la informacion | Hugging Face, transformers estandar |
| wav2vec2-large-xlsr-53 (base) | no disponible en la informacion | no disponible | ASR multilingue (53 idiomas) | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento de los modelos alternativos en la información proporcionada para una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo no se carga con `AutoModelForAudioClassification.from_pretrained` directamente: las capas PNN no son un tipo de capa de transformers y requieren el paquete PNN V4.4.
- El paquete PNN (cargador y kernels) está licenciado por separado por PreciseStatistics GmbH con licencia de evaluación (contacto: info@primeneural.net); la licencia apache-2.0 cubre los pesos, no el software necesario para ejecutarlos.
- El formato PNN y el paquete están sujetos a patente pendiente (US 19/685,168), lo que puede afectar a su uso comercial.
- La cuantización a 1 bit y la densidad del 50 % implican una pérdida de precisión respecto al original (98,09 % de acuerdo top-1, no 100 %).
- Es un clasificador binario de género: puede producir errores en voces ambiguas, infantiles o con ruido, y su uso plantea consideraciones éticas sobre inferencia de atributos personales.
- No se documentan sesgos, composición demográfica del dataset de destilación ni evaluación por subgrupos; LibriSpeech es un corpus de lectura en inglés, lo que puede limitar la generalización a otros dominios o idiomas.
- No se especifican los idiomas efectivamente soportados ni la longitud de contexto de audio admitida.
- No apto para generación de texto, razonamiento, código ni tareas de agente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PrimeNeural/wav2vec2-large-xlsr-53-gender-recognition-librispeech-pnn-d50-w1a1-j47
- Modelo base: https://huggingface.co/alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech
- Plataforma Prime Neural Networks: https://primeneural.net
- Dataset de destilación: https://huggingface.co/datasets/openslr/librispeech_asr
