# larkooo/gemma-e2b-rlcd

## Resumen

Gemma E2B RLCD es un checkpoint multimodal de 4 bits publicado por el usuario larkooo, derivado por cuantización del modelo google/gemma-4-E2B-it. No es un modelo generativo al uso: se distribuye junto al runtime `gemma_rlcd`, que reutiliza los pesos de Gemma 4 E2B para realizar clasificación, evaluación por rúbricas y estimación de probabilidades sobre texto, imágenes, audio y vídeo. El repositorio contiene 5.104.297.539 parámetros (aproximadamente 5,1 mil millones) en formato MLX safetensors, con un tamaño de descarga de 3,6 GB que incluye los codificadores de imagen y audio, el tokenizador, el procesador y la plantilla de chat.

La innovación principal es el modo de inferencia: en lugar de generar respuestas de forma autorregresiva, el motor codifica una sola vez la entrada multimodal y las preguntas con sus respuestas candidatas, reutiliza el estado KV y puntúa en lotes de GPU cada opción permitida. Con ello devuelve distribuciones de probabilidad calibradas por campo, sin bucle de decodificación. El autor reporta 28 salidas coincidentes en una tarea de triaje de soporte con un tiempo de 4,41 s frente a 15,66 s del método de generación JSON convencional, esto es, 3,55 veces más rápido.

El modelo está pensado para ejecutarse en local sobre Apple Silicon mediante MLX, con licencia Apache 2.0 y pipeline declarado `any-to-any`. Su relevancia actual reside en cubrir un nicho poco habitual: decisiones estructuradas y calibradas (elección única, etiquetas independientes, puntuaciones por niveles y binarias) sobre entradas heterogéneas, con el foco puesto en la fiabilidad de las probabilidades más que en la generación de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B) con codificadores de imagen y audio; 35 capas; cabecera de decisión condicionada a candidatos y puntuación con teacher forcing sobre MLX |
| Parametros totales | 5.104.297.539 (aproximadamente 5,1 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en formato MLX (cuantización fijada en el checkpoint) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con runtime propio `gemma_rlcd`; tamano del repo 3,6 GB |

## Arquitectura y entrenamiento

El checkpoint parte de google/gemma-4-E2B-it y conserva la cuantización MLX fijada por el autor. La arquitectura base es un transformer multimodal de 35 capas con procesamiento nativo de imagen y audio; el vídeo se trata mediante muestreo de fotogramas, marcas de tiempo y su pista de sonido. Sobre esa base, el runtime implementa un esquema de decisión en cuatro fases: prefill multimodal compartido, bifurcación por campo con una clave JSON corta, puntuación de respuestas completas (las opciones de un solo token comparten vector de salida y las de varios tokens se evalúan con teacher forcing, incluidas las comillas de cierre) y conversión de log-verosimilitudes en probabilidades dentro de cada campo. El tamaño de lote por defecto es ocho; los campos comparten prefijo de entrada y esquema, pero no condicionan entre sí sus respuestas generadas, y el almacenamiento KV se replica por fila de lote.

El modelo card menciona además un componente de aprendizaje de probabilidades bajo el nombre RLCD (Reinforcement Learning for Calibrated Decisions), orientado a que una predicción calibrada al 80 por ciento acierte aproximadamente el 80 por ciento de las veces en casos comparables. El repositorio incluye una cabecera de decisión condicionada a candidatos, entrenamiento supervisado de verosimilitud, evaluación con Brier y log-loss, y ajuste de temperatura, descritos en `docs/training.md`. Es importante señalar que la ruta de inferencia por defecto obtiene las probabilidades directamente de Gemma preentrenado, y que los detalles de entrenamiento y del objetivo de retroalimentación por resultados se documentan por separado. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Clasificación y etiquetado multimodal sobre texto, imágenes, voz y vídeo (pipeline declarado `any-to-any`).
- Tipo de salida `Choice`: elección única entre opciones mutuamente excluyentes, con distribución de probabilidad que suma 1.
- Tipo de salida `Independent`: probabilidad de sí/no separada por etiqueta, permitiendo multietiqueta (por ejemplo, gato y perro presentes a la vez).
- Tipo de salida `Score`: probabilidades por nivel de una rúbrica y nota esperada, con niveles de grado indexados desde cero.
- Tipo de salida `Noul`: decisión binaria de sí/no, por ejemplo si un caso requiere escalado.
- Medida de confianza por campo mediante entropía normalizada.
- Puntuación por lotes en GPU de campos y candidatos con reutilización del prefijo y del estado KV.
- Uso de los 35 capas de Gemma y del procesamiento nativo de imagen y audio, incluyendo fotogramas muestreados y banda sonora en vídeo.
- Lectura de entradas locales mediante `State`, que acepta rutas de imágenes, audio y vídeos.
- Interfaz web local (`gemma-rlcd-web`) y ejecución por línea de comandos de peticiones JSON.

No se documenta en la información disponible soporte de tool calling, function calling, uso como agente autónomo ni modo de razonamiento extenso tipo thinking.

## Casos de uso

- Triaje de soporte al cliente: el motor recibe el mensaje o la captura del usuario, una pregunta de categoría y las etiquetas posibles, y devuelve la etiqueta con su distribución de probabilidad. El propio autor reporta un caso de triaje con 28 salidas coincidentes y 4,41 s frente a 15,66 s del método generativo, lo que lo hace adecuado para enrutado de tickets en tiempo casi interactivo.
- Enrutado de catálogo de producto: dada una imagen y un texto de ficha, clasificar el artículo en una taxonomía cerrada y devolver probabilidades por categoría, útil para pipelines de comercio electrónico donde la etiqueta final ya se conoce de antemano.
- Evaluación por rúbricas de contenidos: con el tipo `Score` se puede puntuar la calidad de una respuesta, un documento o una entrega académica asignando probabilidades a cada nivel; resulta apropiado para revisión previa automatizada antes de la revisión humana.
- Moderación y decisión binaria: la salida `Noul` permite decidir si un contenido requiere escalado o intervención, con una probabilidad explícita que facilita fijar umbrales operativos en producción.
- Análisis de incidencias con evidencia multimodal: subir capturas, audio de una llamada y fragmentos de vídeo para determinar hechos de un incidente (por ejemplo, marca implicada o presencia de un objeto) usando etiquetas independientes.
- Verificación de presencia de elementos en imágenes o vídeo: con `Independent` se puede comprobar simultáneamente la presencia de varios objetos o condiciones, algo útil en inspección visual o control de calidad.
- Procesamiento de bandeja de entrada: clasificar correos con adjuntos de distinto tipo en campos definidos por esquema y devolver JSON estructurado con probabilidades, integrándose en sistemas de gestión documental.
- Comparación frente al modo generativo: la interfaz web incluye una comparación lado a lado con generación JSON ordinaria, lo que sirve para validar en un proyecto propio si el enfoque de puntuación paralela mejora la consistencia de etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento aportado es una comparación interna de latencia:

| Escenario | Salidas coincidentes | Tiempo | Mejora |
|---|---|---|---|
| Triaje de soporte (puntuacion paralela) | 28 | 4,41 s | 3,55x |
| Triaje de soporte (generacion JSON convencional) | 28 | 15,66 s | referencia |

No se dispone de datos de calibración publicados (Brier, log-loss) más allá de la mención de que el repositorio incluye utilidades para calcularlos.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon (Mac). El runtime está implementado sobre MLX y el propio model card exige un Mac con Apple Silicon.
- VRAM estimada: no disponible de forma explícita; la descarga completa son 3,6 GB, por lo que se necesita memoria unificada suficiente para pesos, codificadores, estado KV replicado por fila de lote (lote por defecto de 8) y activaciones.
- GPU recomendadas: no disponible; no se documenta compatibilidad con A100, H100 ni RTX 4090, ya que el formato es MLX y no CUDA.
- GPU de consumo: ejecutable en Macs con Apple Silicon; el resto de GPU de consumo no está soportado según la información disponible.
- Opciones de despliegue: servidor web local `gemma-rlcd-web` sobre el runtime `gemma_rlcd`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de software: Python 3.12 como mínimo, gestor `uv` y ffmpeg para audio y vídeo.
- Latencia y throughput: 4,41 s para la carga de triaje de soporte con 28 salidas coincidentes y lote por defecto de 8; no se publican más cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| larkooo/gemma-e2b-rlcd | 5,1 mil millones | no disponible | Puntuacion paralela calibrada sobre multimodal | apache-2.0 | HuggingFace, formato MLX |
| google/gemma-4-E2B-it (modelo base) | no disponible | no disponible | Generacion autorregresiva multimodal instruct | no disponible | HuggingFace |
| Alternativas de clasificacion multimodal generica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre otros modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Los resultados de búsqueda web disponibles no contienen información relevante sobre este modelo ni sobre benchmarks independientes; toda la información procede de la model card y de los metadatos de HuggingFace.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- Metadato `inference: false` en la model card: el autor no habilita la inferencia a través de la infraestructura de HuggingFace, solo en local.
- Dependencia estricta de Apple Silicon y MLX: no es desplegable directamente en CUDA ni en entornos x86 convencionales.
- Los campos evaluados comparten la entrada y el esquema, pero no condicionan sus respuestas entre sí, lo que puede producir etiquetas incoherentes en esquemas con dependencias fuertes.
- La calidad de las probabilidades depende de que las opciones candidatas estén bien definidas y descritas; el propio autor indica que las descripciones son opcionales, lo que puede afectar a la calibración.
- No se documentan idiomas soportados, sesgos conocidos ni comportamiento fuera de los casos de ejemplo incluidos.
- No hay información sobre la longitud de contexto, lo que limita la planificación de cargas con entradas largas (por ejemplo, vídeos extensos).
- La licencia del checkpoint es Apache 2.0, pero la del modelo base google/gemma-4-E2B-it figura como no disponible en los datos proporcionados; conviene verificar los términos de Gemma antes de un uso comercial.
- El término RLCD se define de forma específica en este proyecto (Reinforcement Learning for Calibrated Decisions) y no debe confundirse con otras acepciones del acrónimo en la literatura.
- Existe riesgo de alucinación en la parte generativa del modelo base, aunque la ruta de decisión por defecto se limita a puntuar opciones predefinidas y no a texto libre.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/larkooo/gemma-e2b-rlcd
- Codigo fuente en GitHub: https://github.com/Larkooo/gemma-e2b-rlcd
- Demo en video: https://huggingface.co/larkooo/gemma-e2b-rlcd/resolve/main/docs/assets/demo.mp4
- Poster de la demo: https://huggingface.co/larkooo/gemma-e2b-rlcd/resolve/main/docs/assets/demo-poster.jpg
- Documentacion de arquitectura: docs/architecture.md (dentro del repositorio)
- Documentacion de entrenamiento y calibracion: docs/training.md (dentro del repositorio)
- Utilidades de calibracion: gemma_rlcd/calibration.py (dentro del repositorio)
- Modelo base: google/gemma-4-E2B-it
