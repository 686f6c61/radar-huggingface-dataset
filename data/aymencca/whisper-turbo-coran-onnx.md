# Aymencca/whisper-turbo-coran-onnx

## Resumen

whisper-turbo-coran-onnx es una exportación a ONNX del modelo naazimsnh02/whisper-large-v3-turbo-ar-quran, un ajuste fino de openai/whisper-large-v3-turbo especializado en la transcripción de recitaciones del Corán en árabe. Lo publica el usuario Aymencca y su objetivo no es entrenar un modelo nuevo, sino empaquetar los pesos en un formato que pueda ejecutarse directamente en el navegador mediante Transformers.js y WebGPU, sin necesidad de backend ni de infraestructura GPU propia.

La relevancia del artefacto es de despliegue: parte de un modelo de reconocimiento automático del habla (ASR) de arquitectura encoder-decoder transformer con unos 809 millones de parámetros, heredados de la variante "turbo" de Whisper large-v3, y lo convierte en tres ficheros ONNX (encoder en fp16, encoder en q4 y decoder combinado en q4). Además, la exportación conserva las salidas de cross-attention, lo que habilita la generación de marcas temporales a nivel de palabra mediante `return_timestamps: "word"`, una función poco habitual en exportaciones ONNX de Whisper.

El modelo cubre únicamente árabe y está especializado en un dominio muy concreto, la recitación coránica, por lo que no debe evaluarse como un ASR árabe generalista. Su licencia Apache 2.0 permite uso comercial, y su repo de 2,0 GB incluye las variantes cuantizadas necesarias para inferencia en cliente. No hay descargas ni valoraciones registradas en el momento de redactar esta ficha, y no se han publicado métricas de error en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), exportado a ONNX |
| Parámetros totales | 809 M (heredados de openai/whisper-large-v3-turbo; decoder reducido a 4 capas frente a las 32 de large-v3) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento (espectrograma mel de 128 bins); longitud máxima de decodificación de 448 tokens |
| Tipos de cuantización | fp16 (encoder), q4 de 4 bits (encoder y decoder combinado) |
| Idiomas soportados | Árabe (el modelo base original es multilingüe, pero este ajuste está orientado a árabe) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX: `encoder_model_fp16`, `encoder_model_q4`, `decoder_model_merged_q4`, más `generation_config.json` |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un encoder que procesa ventanas de 30 segundos de audio convertidas en espectrogramas mel de 128 bandas y un decoder autorregresivo que genera tokens de texto, con atención cruzada entre ambos. La variante "turbo" de large-v3 mantiene el encoder de large-v3 y reduce el decoder a 4 capas, lo que rebaja el coste de inferencia manteniendo buena parte de la calidad del modelo grande. La exportación a ONNX añade las salidas de atención cruzada necesarias para calcular marcas temporales por palabra.

El ajuste fino del que procede este artefacto se realizó sobre el dataset tarteel-ai/everyayah, orientado a recitación coránica. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO ni los hiperparámetros del ajuste. El `generation_config.json` incluido en el repo proviene del modelo original openai/whisper-large-v3-turbo e incorpora las cabeceras de alineamiento y los tokens de timestamp necesarios para las marcas temporales.

La innovación técnica del repo es, por tanto, de empaquetado y no de modelado: exportación ONNX con salidas de cross-attention, cuantización selectiva (encoder en fp16 o q4, decoder en q4) y compatibilidad con el backend WebGPU de Transformers.js para ejecución en navegador.

## Capacidades

- Reconocimiento automático del habla en árabe sobre recitaciones coránicas, con la tarea `transcribe`.
- Generación de marcas temporales a nivel de palabra (`return_timestamps: "word"`), gracias a la exportación de las salidas de cross-attention.
- Ejecución en navegador mediante Transformers.js con WebGPU, sin servidor intermedio.
- Inferencia con encoder en fp16 (mayor precisión) o en q4 (menor huella de memoria), combinable con el decoder q4.
- Procesamiento de audio de 16 kHz; el pipeline espera la señal ya remuestreada a esa frecuencia.
- Segmentación de audio largo mediante la API de timestamps de Transformers.js, encadenando ventanas de 30 segundos.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No se documentan capacidades de traducción, diarización de hablantes ni detección de idioma en esta exportación.

## Casos de uso

- Aplicación web educativa de recitación: el modelo transcribe la recitación del usuario directamente en el navegador con WebGPU y devuelve texto árabe con marcas temporales por palabra, lo que permite resaltar cada término a medida que se pronuncia.
- Verificación de memorización (hifz): comparando la transcripción alineada palabra a palabra con el texto coránico de referencia se pueden señalar omisiones, sustituciones o vacilaciones en la recitación, sin enviar el audio a un servidor.
- Generación de subtítulos sincronizados: las marcas temporales por palabra permiten construir subtítulos ASS/SRT con precisión subsentencia para vídeos de recitación.
- Indexación y búsqueda por audio: transcribir un archivo de recitación y usar el texto resultante para localizar la sura y aleya correspondientes en un catálogo.
- Herramientas sin backend ni coste de servidor: al ejecutarse en el cliente con ONNX y WebGPU, encaja en aplicaciones PWA o extensiones donde no se quiere almacenar audio de usuarios por motivos de privacidad.
- Investigación lingüística y análisis fonético: la transcripción con timestamps facilita el estudio de duraciones, pausas y patrones de pronunciación en corpus de recitación.
- Accesibilidad: transcripción en tiempo real de recitaciones para personas con discapacidad auditiva en eventos o retransmisiones.
- Integración en aplicaciones de escritorio o móviles híbridas: los ficheros ONNX pueden ejecutarse con ONNX Runtime en Node.js o en un WebView, reutilizando el mismo grafo exportado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. En concreto, no se proporcionan valores de WER (word error rate) sobre el conjunto de evaluación de tarteel-ai/everyayah ni comparaciones con el modelo base naazimsnh02/whisper-large-v3-turbo-ar-quran o con openai/whisper-large-v3-turbo.

## Requisitos de hardware

- Tamano del repo: 2,0 GB, repartido entre encoder fp16, encoder q4, decoder combinado q4 y configuración de generación.
- VRAM estimada: en torno a 1,3-1,6 GB para el encoder en fp16 más el decoder q4; por debajo de 1 GB usando encoder q4 y decoder q4 (estimaciones a partir del número de parámetros y del formato de cuantización, no medidas publicadas).
- GPU de escritorio: cualquier GPU con soporte WebGPU (por ejemplo, serie RTX 30/40 de NVIDIA, RX 6000/7000 de AMD) puede ejecutar la variante q4 con holgura; una A100 o H100 no aporta ventajas en este escenario cliente.
- GPU integradas: posibles con q4 y encoder reducido, aunque con latencia mayor; no hay datos de rendimiento publicados.
- CPU: ejecución viable vía ONNX Runtime o el backend WASM de Transformers.js, previsiblemente mucho más lenta que en GPU; sin cifras disponibles.
- Despliegue: Transformers.js en navegador (WebGPU o WASM), ONNX Runtime Web, ONNX Runtime Node o Python. No es compatible con vLLM, TGI ni llama.cpp, al no ser un modelo de lenguaje ni estar en formato GGUF.
- Latencia y throughput: no disponibles. Dependen del hardware, del encoder elegido (fp16 o q4) y de la duración del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| Aymencca/whisper-turbo-coran-onnx (este) | 809 M | 30 s | Árabe (dominio coránico) | ONNX fp16/q4 | Apache 2.0 | No disponible |
| naazimsnh02/whisper-large-v3-turbo-ar-quran | 809 M | 30 s | Árabe (dominio coránico) | PyTorch/safetensors | No disponible en la información proporcionada | No disponible |
| openai/whisper-large-v3-turbo | 809 M | 30 s | Multilingüe | PyTorch/safetensors | Apache 2.0 | No disponible en esta ficha |
| openai/whisper-large-v3 | 1550 M | 30 s | Multilingüe | PyTorch/safetensors | Apache 2.0 | No disponible en esta ficha |

La diferencia principal frente a los tres alternativas es el formato: solo este repo ofrece grafos ONNX con salidas de cross-attention listos para Transformers.js, mientras que el modelo de naazimsnh02 y los originales de OpenAI requieren convertir o servir los pesos con otro stack. Frente a whisper-large-v3, la variante turbo reduce el decoder a 4 capas y aproximadamente la mitad de parámetros, a costa de una calidad que no se puede cuantificar sin métricas publicadas.

## Limitaciones y advertencias

- Especialización de dominio: el ajuste fino sobre everyayah puede degradar el rendimiento en árabe conversacional, dialectos o audio con ruido de fondo, al estar entrenado sobre recitación.
- Idioma único: no se debe esperar transcripción correcta de otros idiomas aunque el modelo base sea multilingüe.
- Riesgo de alucinación: como todo Whisper, puede generar texto plausible en segmentos silenciosos, con música o con audio ininteligible, especialmente en dominios memorizados como el texto coránico.
- Cuantización q4: el decoder y el encoder q4 introducen una pérdida de precisión no cuantificada; para máxima calidad conviene usar el encoder fp16, que aumenta el uso de memoria.
- Timestamps: la precisión de las marcas por palabra depende de las cabeceras de alineamiento heredadas de openai/whisper-large-v3-turbo y puede desviarse en recitaciones con pausas largas o ritmo muy pausado.
- Audio largo: el modelo procesa ventanas de 30 s, por lo que la transcripción de archivos completos exige chunking y puede acumular errores en las fronteras.
- Sin métricas: no hay WER publicado, ni comparación con el modelo base, ni datos de latencia; cualquier decisión de producción debería basarse en una evaluación propia sobre el corpus objetivo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base naazimsnh02/whisper-large-v3-turbo-ar-quran, no indicada en la información disponible.
- Madurez: el repo no tiene descargas ni valoraciones, y las versiones de Transformers.js y ONNX Runtime Web compatibles no están fijadas en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Aymencca/whisper-turbo-coran-onnx
- Modelo base (ajuste fino en árabe): https://huggingface.co/naazimsnh02/whisper-large-v3-turbo-ar-quran
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de entrenamiento: https://huggingface.co/datasets/tarteel-ai/everyayah
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
