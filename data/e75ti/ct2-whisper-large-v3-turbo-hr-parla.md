# e75ti/ct2-whisper-large-v3-turbo-hr-parla

## Resumen

`ct2-whisper-large-v3-turbo-hr-parla` es una conversion a formato CTranslate2 del modelo `GoranS/whisper-large-v3-turbo-hr-parla`, un fine-tuning de Whisper large-v3 turbo orientado a reconocimiento automatico del habla (ASR) en croata (etiqueta de idioma `hr`). El autor de la conversion es el usuario de Hugging Face `e75ti`, mientras que el modelo base original fue publicado por `GoranS`. El objetivo de esta version es exclusivamente de despliegue: empaquetar los pesos en el formato que consume `faster-whisper`, de modo que el modelo pueda servirse con latencias mas bajas y menor huella de memoria que la version original en Transformers.

La relevancia practica del artefacto es acotada pero clara: Whisper large-v3 turbo es una variante destilada del decodificador de Whisper large-v3 (4 capas de decodificador frente a 32), pensada para reducir el coste de inferencia manteniendo calidad cercana al modelo grande. Este repositorio anade un fine-tuning especifico para croata y lo entrega ya convertido a CTranslate2 con precision float16, lo que elimina el paso de conversion manual en pipelines de produccion basados en `faster-whisper`.

No se dispone de informacion publicada sobre el dataset de fine-tuning, la licencia, los idiomas exactos soportados mas alla de la etiqueta `hr`, ni resultados de benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamano de 1,6 GB, coherente con pesos float16 del modelo turbo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3 turbo), convertido a CTranslate2 |
| Parametros totales | no disponible (el modelo base Whisper large-v3 turbo tiene 809 M parametros; el fine-tuning no declara cambios de tamano) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Whisper opera sobre ventanas de audio de 30 s) |
| Tipos de cuantizacion | float16 (precision declarada en la model card); CTranslate2 permite ademas int8 e int8_float16, aunque no se confirma que el autor los haya generado |
| Idiomas soportados | croata (etiqueta `hr`); el resto de idiomas de Whisper large-v3 no se declara explicitamente |
| Licencia | no disponible |
| Formato de pesos | CTranslate2 (`model.bin` y ficheros auxiliares); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3 turbo: un encoder Transformer que procesa espectrogramas mel de audio y un decoder autorregresivo reducido a 4 capas (frente a las 32 de large-v3), con 1280 dimensiones de modelo. Esta reduccion del decoder es la que aporta la mayor parte del ahorro computacional del modelo turbo, manteniendo el encoder completo. Sobre esa base, `GoranS/whisper-large-v3-turbo-hr-parla` aplica un fine-tuning para croata, presumiblemente sobre datos de habla en ese idioma, aunque el repositorio no documenta ni el volumen de datos, ni la composicion del corpus, ni si hubo etapas de RLHF o ajuste supervisado adicional.

La aportacion de este repositorio concreto no es de entrenamiento sino de empaquetado: la conversion a CTranslate2 con precision float16, que es el formato que consume `faster-whisper`. CTranslate2 aplica optimizaciones de inferencia (fusion de operaciones, gestion eficiente de memoria, soporte de quantizacion en tiempo de conversion) que reducen el coste por token decodificado frente a la implementacion de referencia en PyTorch. No se documentan innovaciones adicionales como atencion lineal, decodificacion especulativa ni modos de razonamiento extendido.

## Capacidades

- Transcripcion de audio a texto (ASR) en croata, con marcas temporales por segmento.
- Deteccion de idioma y transcripcion multilingue heredada de Whisper large-v3, aunque el fine-tuning puede haber estrechado el rendimiento hacia croata.
- Generacion de subtitulos con timestamps a nivel de segmento (`segment.start`, `segment.end`).
- Procesamiento por lotes y en streaming mediante la API de `faster-whisper`.
- Decodificacion con `beam_size` configurable (el ejemplo de la model card usa `beam_size=5`).
- No se declara soporte de tool calling, function calling ni capacidades de agente: es un modelo puramente ASR.
- No se declara soporte de vision, audio de entrada mas alla del audio a transcribir, ni modo de pensamiento.

## Casos de uso

- Subtitulado automatico de contenido audiovisual en croata: el modelo genera segmentos con marcas de inicio y fin, lo que permite producir ficheros SRT directamente en un pipeline de postproduccion.
- Transcripcion de reuniones y actas: con `faster-whisper` y `beam_size=5` se puede procesar audio de larga duracion por fragmentos, generando transcripciones con timestamps utiles para busqueda posterior.
- Indexacion y busqueda de archivos de audio: transcribir un corpus de grabaciones en croata para alimentar un motor de busqueda de texto completo o un sistema RAG sobre audio.
- Atencion al cliente con analitica de llamadas: transcripcion de grabaciones de call center en croata para extraer metricas, palabras clave y control de calidad.
- Investigacion linguistica y creacion de corpus: generacion de transcripciones a escala para estudios de habla croata, con la ventaja de que el formato CTranslate2 reduce el coste por hora de audio procesada.
- Despliegue en produccion de bajo coste: al estar ya convertido a CTranslate2 float16, se integra directamente en servicios basados en `faster-whisper` sin pasos intermedios de conversion, lo que simplifica el CI/CD del servicio de ASR.
- Accesibilidad: generacion de subtitulos en tiempo casi real para contenido en croata en plataformas de video o retransmisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de WER, CER ni comparaciones con otros modelos, y la model card se limita a documentar el uso mediante `faster-whisper`.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 1,6 GB en float16, por lo que la inferencia cabe holgadamente en GPUs con 4 GB o mas de VRAM, incluyendo el overhead de activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM; para alto throughput, A100, H100, L40S o RTX 4090. En GPUs consumer, RTX 3060 (12 GB), RTX 4060 Ti y superiores son suficientes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna con 4 GB o mas de VRAM; tambien es viable en CPU con CTranslate2, a costa de mayor latencia.
- Opciones de despliegue: `faster-whisper` (opcion nativa, segun la model card), servidores compatibles con CTranslate2 y, en general, cualquier stack que consuma modelos CTranslate2. No se declara compatibilidad directa con vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, la variante turbo de Whisper reduce el coste de decodificacion frente a large-v3 al tener 4 capas de decoder en lugar de 32, pero no se aportan cifras concretas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `e75ti/ct2-whisper-large-v3-turbo-hr-parla` | no disponible (base turbo: 809 M) | ventanas de 30 s | croata (declarado) | no disponible | CTranslate2 float16 |
| `GoranS/whisper-large-v3-turbo-hr-parla` | no disponible (base turbo: 809 M) | ventanas de 30 s | croata (declarado) | no disponible | safetensors (Transformers) |
| `openai/whisper-large-v3-turbo` | 809 M | ventanas de 30 s | multilingue (99 idiomas) | MIT (modelo original de OpenAI) | safetensors, Transformers |
| `openai/whisper-large-v3` | 1550 M | ventanas de 30 s | multilingue (99 idiomas) | MIT (modelo original de OpenAI) | safetensors, Transformers |

La comparativa se limita a la familia Whisper porque no se dispone de datos de rendimiento de este fine-tuning frente a alternativas ASR especificas para croata. La diferencia clave frente a `openai/whisper-large-v3-turbo` es el fine-tuning en croata y el empaquetado CTranslate2; frente a `whisper-large-v3`, la variante turbo sacrifica algo de calidad a cambio de menor coste de decodificacion.

## Limitaciones y advertencias

- No se documenta la licencia del modelo ni del fine-tuning, lo que impide confirmar si el uso comercial esta permitido. Es un riesgo bloqueante para produccion hasta que el autor lo aclare.
- No se documenta el dataset de fine-tuning: se desconoce el dominio, la duracion y la calidad del audio de entrenamiento, lo que impide estimar el sesgo hacia acentos, edades o registros concretos.
- El fine-tuning esta orientado a croata; el rendimiento en otros idiomas puede degradarse respecto a Whisper large-v3 turbo original.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente en segmentos de silencio, ruido o audio musical, donde puede generar texto plausible no presente en el audio.
- No hay resultados de WER ni evaluaciones publicadas, por lo que no se puede verificar la calidad real del fine-tuning frente al modelo base.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-22) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad y procedencia del artefacto antes de desplegarlo.
- Al ser un artefacto CTranslate2, no es directamente cargable con `transformers`; requiere `faster-whisper` o la libreria `ctranslate2`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/e75ti/ct2-whisper-large-v3-turbo-hr-parla
- Modelo base: https://huggingface.co/GoranS/whisper-large-v3-turbo-hr-parla
- CTranslate2 (repositorio): https://github.com/OpenNMT/CTranslate2
- faster-whisper (repositorio): https://github.com/SYSTRAN/faster-whisper
- Whisper large-v3 turbo (modelo original de OpenAI): https://huggingface.co/openai/whisper-large-v3-turbo
