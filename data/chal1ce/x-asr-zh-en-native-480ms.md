# Chal1ce/X-ASR-zh-en-native-480ms

## Resumen

X-ASR-zh-en-native-480ms es un modelo de reconocimiento automático del habla (ASR) en modo streaming para chino y inglés, desarrollado por el usuario Chal1ce a partir del proyecto X-ASR de Gilgamesh-J. El repositorio empaqueta el checkpoint original en PyTorch del autor, el vocabulario asociado y una configuración de inferencia en streaming con una latencia de 480 ms. Está pensado para transcripción en tiempo real bilingüe zh/en sobre audio muestreado a 16 kHz.

La arquitectura combina un encoder Zipformer con un decoder RNN-T (transducer), una elección habitual en ASR de bajo coste computacional y orientada a streaming. El vocabulario tiene 5.000 tokens y no incluye signos de puntuación, lo que condiciona el postprocesado necesario en producción. El repositorio ocupa 2,6 GB y se distribuye bajo licencia Apache-2.0.

Es relevante para quien necesite ASR bilingüe de baja latencia y quiera ejecutarlo sobre infraestructura propia, ya que el modelo es pequeño frente a soluciones basadas en transformers de gran tamaño. No obstante, la integración con SGLang-Omni aún no está disponible: según la model card, el adaptador está en preparación y la versión oficial todavía no puede cargar el modelo mediante `--model-path`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer encoder + RNN-T decoder (transducer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de streaming con configuración de 480 ms) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint PyTorch original (`pretrained.pt`) |
| Frecuencia de muestreo | 16 kHz |
| Vocabulario | 5.000 tokens, sin puntuación |
| Latencia de streaming | 480 ms |

## Arquitectura y entrenamiento

El modelo sigue el esquema Zipformer + RNN-T del proyecto X-ASR. El encoder Zipformer procesa las características acústicas y el decoder transducer (RNN-T) genera la secuencia de tokens de forma incremental, lo que permite decodificación en streaming con una ventana de 480 ms. Esta combinación es típica en ASR de producción porque mantiene el coste computacional acotado y permite emitir hipótesis parciales mientras llega el audio.

La información disponible no detalla el número de parámetros, el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones adicionales más allá de la propia configuración de streaming. El repositorio incluye únicamente el checkpoint original, el vocabulario y la configuración de inferencia.

## Capacidades

- Reconocimiento automático del habla en streaming para chino e inglés.
- Transcripción incremental con latencia configurada de 480 ms.
- Procesamiento de audio a 16 kHz.
- Salida de tokens sin puntuación (el vocabulario de 5.000 tokens no incluye signos).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de traducción, diarización, timestamps por palabra ni detección de idioma explícita.
- No se documenta capacidad de visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado en directo bilingüe zh/en: el modelo emite hipótesis parciales cada 480 ms, adecuado para generar subtítulos con retardo bajo en retransmisiones o videoconferencias.
- Asistentes de voz para aplicaciones con usuarios chinos e ingleses: la transcripción en streaming permite alimentar un NLU posterior sin esperar al final del enunciado.
- Transcripción de reuniones en tiempo real: el soporte de los dos idiomas cubre entornos de trabajo mixtos, aunque requiere un postprocesado para añadir puntuación.
- Dictado por voz en herramientas de productividad: la baja latencia y el tamaño contenido del modelo permiten ejecución en servidores modestos.
- Atención al cliente telefónica: la transcripción continua de llamadas permite análisis en vivo y registro posterior, con la ventaja de no depender de servicios externos.
- Indexación y búsqueda de audio: transcripción por lotes de archivos de audio en zh/en para construir índices de búsqueda sobre contenido hablado.
- Investigación en ASR de bajo recurso computacional: como referencia Zipformer/RNN-T reproducible bajo Apache-2.0 para experimentos de streaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 2,6 GB, pero no se especifica el reparto entre pesos y otros artefactos.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; al ser un modelo Zipformer/RNN-T de tamaño contenido es plausible que quepa en GPU de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: checkpoint PyTorch original; la integración con SGLang-Omni está en preparación y la versión oficial aún no puede cargarlo mediante `--model-path`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la configuración de streaming declara 480 ms de latencia; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto / streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X-ASR-zh-en-native-480ms | Zipformer + RNN-T | zh, en | streaming a 480 ms | Apache-2.0 | checkpoint PyTorch; integración SGLang-Omni pendiente |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe | no nativo en streaming | MIT | amplia (varias implementaciones) |
| Zipformer (k2/icefall) | Zipformer + RNN-T/CTC | según receta | streaming configurable | Apache-2.0 | recetas de entrenamiento y checkpoints |
| Paraformer (FunASR) | Transformer no autorregresivo | zh principalmente | streaming disponible | MIT | amplia en el ecosistema FunASR |

La comparación se basa en características públicas generales de cada familia; no se dispone de cifras de rendimiento del modelo evaluado para una comparación cuantitativa.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo.
- Riesgo de alucinación inherente a los sistemas ASR, especialmente en audio ruidoso o con acentos no cubiertos por el entrenamiento.
- El vocabulario no incluye puntuación, por lo que la salida requiere un modelo de puntuación o reglas de postprocesado.
- Solo se declaran chino e inglés; no hay soporte documentado para otras lenguas.
- No se especifican los datos de entrenamiento, lo que dificulta evaluar la cobertura de dominios y acentos.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del proyecto X-ASR original del que deriva el checkpoint.
- La integración con SGLang-Omni no está operativa en la versión oficial; el despliegue requiere manejar el checkpoint PyTorch directamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chal1ce/X-ASR-zh-en-native-480ms
- Checkpoint original del autor: https://huggingface.co/GilgameshWind/X-ASR-zh-en/blob/689ff18c584d29910da37b6fe904db0c1489c9d1/streaming_exp/pretrained.pt
- Proyecto X-ASR: https://github.com/Gilgamesh-J/X-ASR
