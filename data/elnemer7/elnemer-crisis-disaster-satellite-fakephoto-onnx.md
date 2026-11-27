# elnemer7/ElNeMeR-Crisis-Disaster-Satellite-FakePhoto-ONNX

## Resumen

ElNeMeR-Crisis-Disaster-Satellite-FakePhoto-ONNX es un clasificador ligero en formato ONNX publicado por el ingeniero Mahmoud ElNemer (ElNeMeR Digital Solutions & AI) dentro de una flota declarada de 50 modelos orientados a forensia digital y ayuda humanitaria. Su proposito es verificar fotografias virales de catastrofes, incendios y derrumbes, distinguiendo entre fotoperiodismo autentico, imagenes generadas por IA con escenas de panico y fotografias recicladas o compuestas fuera de contexto. Es relevante para redacciones y organismos de verificacion que necesitan un primer filtro automatizado ante la difusion masiva de imagenes falsas durante emergencias.

El modelo no procesa pixeles directamente: recibe un tensor `crisis_img_features` de tipo `float32` con forma `[batch_size, 20]`, es decir, 20 caracteristicas preextraidas por un pipeline externo no documentado en la model card. La salida es una distribucion de probabilidad sobre tres clases. Esta disenado para ejecutarse tanto con `onnxruntime` como con `onnxruntime-web` (WASM), lo que permite desplegarlo en navegador o en entornos sin GPU.

La informacion publica es muy limitada: el repositorio ocupa 0.0 GB, no registra descargas ni likes, no declara pipeline ni idiomas, y la model card no documenta arquitectura, datos de entrenamiento ni resultados de benchmarks mas alla de una cifra de calibracion del 97,31 %. Cualquier evaluacion en produccion deberia partir de una validacion independiente sobre datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador ONNX; se desconoce la topologia interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no aplica (entrada tabular fija de 20 caracteristicas) |
| Tipos de cuantizacion | no disponible (pesos ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | no disponible (la tarea es de vision, no linguistica) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del clasificador. Lo unico verificable es la interfaz: entrada `crisis_img_features` de tipo `float32` con forma `[batch_size, 20]` y salida `probabilities` sobre tres clases (`authentic_photojournalism_scene`, `ai_generated_explosion_fire_panic_photo` y `recycled_out_of_context_composited_disaster`). El uso de un vector de 20 caracteristicas sugiere un modelo tabular o un cabezal de clasificacion sobre descriptores extraidos por un extractor externo (posiblemente fisica volumetrica del humo, consistencia de puntos de fuga de sombras y legibilidad de rotulacion callejera, segun los criterios que menciona el autor), pero el extractor no se distribuye ni se documenta en el repositorio.

No hay informacion sobre volumen de datos de entrenamiento, composicion del dataset, tecnicas de aumento, regularizacion ni sobre si se aplico ajuste fino con preferencias humanas. El unico dato de rendimiento declarado es una "calibration accuracy" del 97,31 %, sin especificar el conjunto de evaluacion, el tamano de la muestra ni el metodo de calibracion, por lo que no debe interpretarse como una metrica de generalizacion.

## Capacidades

- Clasificacion de imagenes de catastrofe en tres clases: fotoperiodismo autentico, generacion sintetica con IA y reciclaje o composicion fuera de contexto.
- Analisis implicito de coherencia fisica: fisica volumetrica del humo, consistencia de puntos de fuga de sombras y rotulacion callejera corrupta, segun los criterios declarados por el autor.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), sin necesidad de GPU.
- Inferencia en servidor mediante `onnxruntime` con entrada por lotes (`batch_size` configurable).
- Salida probabilistica calibrada apta para umbrales de decision personalizables.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No se declaran capacidades multilingues, de vision directa sobre pixeles, audio ni modo de razonamiento extendido.

## Casos de uso

- Verificacion en redaccion durante emergencias: integrar el clasificador en el flujo de triaje de imagenes virales para priorizar la revision humana de aquellas marcadas como `ai_generated_explosion_fire_panic_photo`, reduciendo el tiempo de respuesta ante bulos en las primeras horas de una catastrofe.
- Moderacion de contenido en plataformas sociales: aplicar el modelo como filtro previo sobre imagenes reportadas en un sistema de moderacion, usando la probabilidad de la clase 1 como senal de escalado a revision manual.
- Verificacion ciudadana en el navegador: desplegar el modelo via `onnxruntime-web` en una pagina de comprobacion donde el usuario suba una imagen y reciba la clasificacion sin enviar datos a un servidor, util para organizaciones con requisitos de privacidad.
- Analisis forense de campanas de desinformacion: procesar lotes de imagenes recopiladas de redes sociales para identificar patrones de reciclaje (`recycled_out_of_context_composited_disaster`) y documentar la reutilizacion de fotografias antiguas en nuevos eventos.
- Formacion de periodistas y verificadores: usar la herramienta como apoyo docente para mostrar casos de imagenes sinteticas de incendios y derrumbes, con la salida probabilistica como material de discusion sobre senales de manipulacion.
- Investigacion sobre deteccion de imagenes sinteticas: emplear el modelo como linea base ligera en experimentos de forensia de imagen, dado su bajo coste computacional y su licencia MIT, comparando su comportamiento con clasificadores de mayor tamano.
- Integracion en pipelines de alerta temprana: combinar la clasificacion con sistemas de monitorizacion de medios para etiquetar automaticamente imagenes de crisis y generar informes de verificacion para agencias humanitarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato declarado por el autor es una "calibration accuracy" del 97,31 %, sin especificar conjunto de evaluacion, tamano de muestra ni metodologia, por lo que no se presenta como resultado comparable.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 0.0 GB y la entrada es un vector de 20 caracteristicas, por lo que el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 3060 en adelante, A100, H100) ejecutaria la inferencia con latencia despreciable.
- Cabe en GPU consumer: si, en cualquier modelo, y tambien en CPU y en navegador via WASM.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM en navegador), y cualquier runtime compatible con ONNX opset 14.
- Latencia y throughput estimados: no disponibles; por la naturaleza del modelo (entrada de 20 floats) se espera una latencia de microsegundos a milisegundos por muestra, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Los detectores de imagenes generadas por IA habituales (clasificadores CNN o ViT sobre pixeles) operan con una interfaz distinta (imagen completa como entrada) y no son directamente comparables con este modelo, que consume caracteristicas preextraidas. No se dispone de datos de parametros, contexto ni rendimiento de alternativas en la informacion facilitada.

## Limitaciones y advertencias

- Dependencia de un extractor de caracteristicas externo no documentado ni distribuido: sin el, el modelo no es utilizable de forma autonoma, ya que espera un tensor de 20 caracteristicas cuyo calculo no se especifica.
- La cifra de calibracion del 97,31 % no esta respaldada por un conjunto de evaluacion publico; no debe tomarse como garantia de rendimiento en produccion.
- Riesgo de falsos positivos y negativos en imagenes reales de catastrofe con humo denso, sombras complejas o rotulacion ilegible, que son precisamente las condiciones que el modelo dice analizar.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que se desconoce si cubre geografias, tipos de desastre o idiomas de rotulacion fuera del dominio de entrenamiento.
- Ambito limitado a tres clases de escenas de crisis; no es un detector general de imagenes sinteticas ni de deepfakes de personas.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte; conviene revisar los terminos de la plataforma asociada antes de integrarlo en productos.
- El repositorio no registra descargas ni validacion de la comunidad, y la fecha de creacion declarada (2026) es posterior a la fecha actual, lo que anade incertidumbre sobre su madurez y mantenimiento.
- No apto como unica fuente de decision en verificacion periodistica: debe usarse como filtro de triaje con revision humana obligatoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Crisis-Disaster-Satellite-FakePhoto-ONNX
- Plataforma forense humanitaria: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
