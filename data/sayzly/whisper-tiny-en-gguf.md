# sayzly/whisper-tiny.en-gguf

## Resumen

Whisper Tiny English (GGUF) es una conversión al formato GGUF del modelo `openai/whisper-tiny.en`, publicada por el usuario sayzly bajo el identificador `sayzly/whisper-tiny.en-gguf`. Se trata de un modelo de reconocimiento automático del habla (ASR) de tipo encoder-decoder transformer, con 37.776.736 parámetros totales, especializado exclusivamente en transcripción de audio en inglés. No aporta arquitectura nueva: es una redistribución cuantizada del checkpoint original de OpenAI, pensada para su uso en runtimes que consumen GGUF (principalmente llama.cpp y derivados).

La relevancia de esta ficha es limitada pero concreta: el repositorio no incluye pesos en safetensors ni una model card técnica detallada, y el tamaño del repo aparece como 0.0 GB, lo que sugiere que el artefacto principal es un único fichero `whisper-tiny.en-Q8_0.gguf` con cuantización de 8 bits. El modelo base es la variante "tiny" de Whisper, con contexto de audio de 30 segundos por ventana y alrededor de 1500 posiciones de texto, orientada a transcripción de baja latencia en hardware modesto.

Por tanto, esta ficha describe principalmente el modelo subyacente (Whisper Tiny English) y las características de la conversión GGUF publicada, indicando explícitamente los datos que no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con atención multi-cabeza estándar |
| Parámetros totales | 37.776.736 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Whisper opera con ventanas de audio de 30 s y 448 posiciones de texto) |
| Tipos de cuantización | Q8_0 (único fichero indicado en la model card) |
| Idiomas soportados | Inglés (variante `.en`); lista oficial de idiomas no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`whisper-tiny.en-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo base `openai/whisper-tiny.en` es un transformer encoder-decoder entrenado por OpenAI para reconocimiento automático del habla. El encoder procesa espectrogramas log-Mel de 80 canales calculados sobre ventanas de 30 segundos, y el decoder genera tokens de texto de forma autorregresiva. La variante `.en` está entrenada exclusivamente con datos en inglés, lo que suele mejorar la precisión en ese idioma frente a los modelos multilingües del mismo tamaño. Con 37,7 millones de parámetros, es el checkpoint más pequeño de la familia Whisper.

No se dispone en la información proporcionada de detalles sobre el número de tokens de audio utilizados, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO. La model card del repositorio GGUF no documenta el proceso de conversión ni las herramientas empleadas (por ejemplo, `convert-h5-to-gguf.py` de whisper.cpp), ni verifica la equivalencia numérica con el checkpoint original. La única innovación técnica reseñable es la propia cuantización a Q8_0, que reduce el peso del modelo a aproximadamente 40 MB y permite ejecución en CPU.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio de hasta 30 segundos por ventana.
- Detección de actividad de voz y segmentación temporal básica mediante marcas de tiempo (timestamps) cuando el runtime lo soporta.
- Traducción de audio en inglés a texto en inglés (la variante `.en` no traduce a otros idiomas).
- Ejecución en CPU sin GPU gracias al formato GGUF y a la cuantización Q8_0.
- Integración en pipelines de ASR por lotes o en streaming con llama.cpp/whisper.cpp.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidades multilingües: no disponibles; el modelo está restringido al inglés.
- No dispone de modo "thinking", visión ni audio más allá de la propia entrada de voz.

## Casos de uso

- Transcripción de reuniones y notas de voz en inglés: el modelo procesa ventanas de 30 segundos y permite transcribir grabaciones completas concatenando segmentos, con un coste computacional muy bajo en CPU.
- Subtitulado automático de vídeos en inglés: la generación de timestamps por segmento facilita la creación de ficheros SRT en pipelines de postproducción.
- Dictado por voz en aplicaciones de escritorio: al caber en memoria y ejecutarse en CPU, puede integrarse en herramientas locales de dictado sin depender de servicios en la nube.
- Preprocesado de datos para entrenamiento de modelos: transcripción masiva de corpus de audio en inglés para generar pares audio-texto en proyectos de investigación.
- Asistentes de voz embebidos en dispositivos de baja potencia: la cuantización Q8_0 y el tamaño reducido permiten desplegarlo en Raspberry Pi o mini-PC.
- Indexación y búsqueda de archivos de audio: transcripción previa de grabaciones para habilitar búsqueda por texto en archivos históricos en inglés.
- Prototipado rápido de pipelines ASR: útil como línea base para comparar con modelos mayores antes de escalar a whisper-small o whisper-medium.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de WER (word error rate), comparativas con el checkpoint original ni evaluaciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q8_0; el modelo puede ejecutarse íntegramente en RAM de sistema.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria (GTX 1050, RTX 3050, etc.); no requiere GPU para funcionar.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU.
- Opciones de despliegue: llama.cpp, whisper.cpp, Ollama (si soporta el formato GGUF de Whisper en la versión usada), y runtimes compatibles con GGUF. vLLM y TGI no soportan de forma estándar modelos Whisper en GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sayzly/whisper-tiny.en-gguf | 37,7 M | No disponible (ventanas de 30 s) | Inglés | apache-2.0 | GGUF |
| openai/whisper-tiny.en | 37,7 M | Ventanas de 30 s | Inglés | apache-2.0 | safetensors / PyTorch |
| openai/whisper-tiny | 37,7 M | Ventanas de 30 s | Multilingüe | apache-2.0 | safetensors / PyTorch |
| openai/whisper-base.en | 74,4 M | Ventanas de 30 s | Inglés | apache-2.0 | safetensors / PyTorch |

La diferencia principal frente a `openai/whisper-tiny.en` es el formato (GGUF cuantizado frente a safetensors) y el hecho de que este repositorio no incluye los pesos originales. Frente a `whisper-tiny` multilingüe, la variante `.en` suele ofrecer mejor precisión en inglés a costa de no cubrir otros idiomas. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; el modelo base Whisper presenta sesgos derivados de sus datos de entrenamiento, especialmente en acentos no estándar y audio con ruido.
- Riesgo de alucinación: Whisper puede generar texto plausible en silencios o segmentos ininteligibles; la variante tiny es especialmente propensa a este fenómeno.
- Limitaciones de contexto: ventanas de audio de 30 segundos; para audio más largo es necesario segmentar y concatenar, con riesgo de errores en las fronteras.
- Limitaciones de idioma: solo inglés; no transcribe ni traduce otros idiomas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el repositorio no incluye verificación de integridad ni garantías sobre la conversión GGUF.
- Caveat para producción: el repositorio tiene 0 descargas y 0 likes, y el tamaño reportado es 0.0 GB; conviene verificar la integridad del fichero GGUF antes de desplegarlo. No hay evidencia de que la cuantización Q8_0 preserve exactamente la calidad del checkpoint original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sayzly/whisper-tiny.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-tiny.en
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Paper de Whisper: https://arxiv.org/abs/2212.04356
