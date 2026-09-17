# Myungkyu/rldx_1_rmbench_taco_wodemo_gemini_b128_60k

## Resumen

rldx_1_rmbench_taco_wodemo_gemini_b128_60k es un ajuste fino de tipo politica de bajo nivel (low-level policy) para robotica, desarrollado por el usuario Myungkyu a partir del modelo base RLWRLD/RLDX-1-PT. Se trata de un modelo de vision-lenguaje-accion (VLA) especializado en RMBench, un conjunto de nueve tareas de mesa simuladas, entrenado sobre el dataset Myungkyu/RMBench-taco-wodemo-gemini con etiquetas densas de subtareas procedentes del contexto especifico de cada tarea (anotacion offline).

El modelo resuelve el problema de traducir percepcion multimodal y una instruccion de subtarea en acciones de control para manipulacion robotica. Sus entradas son imagenes de una camara frontal (head) y de dos camaras de muneca (left/right wrist), estado de propiocepcion y el texto de la subtarea actual; ademas incorpora una ranura (slot) de fotograma clave que recupera un fotograma pasado cuando la etiqueta lo requiere. La configuracion de entrenamiento uso un batch de 128 durante 60000 pasos, con una longitud de video de 4 y tres vistas de camara mas el slot de keyframe.

Es relevante porque demuestra el flujo tipico de adaptacion de un backbone VLA preentrenado a un benchmark concreto de manipulacion, publicando unicamente el checkpoint final. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye model card con resultados de evaluacion ni detalles sobre licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje-accion (VLA) basado en el backbone RLDX-1-PT; detalles internos (tipo de transformer, encoder de vision) no disponibles |
| Parametros totales | 6.912.896.320 (aproximadamente 6,9 mil millones) |
| Parametros activos | No disponible (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | No disponible (se especifica longitud de video 4, no una ventana de tokens) |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye pesos en safetensors, sin versiones cuantizadas publicadas |
| Idiomas soportados | No disponible; el modelo recibe instrucciones de subtarea en texto, pero no se especifica el idioma de las anotaciones |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,8 GB |
| Modelo base | RLWRLD/RLDX-1-PT |
| Dataset de ajuste | Myungkyu/RMBench-taco-wodemo-gemini |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del backbone preentrenado RLDX-1-PT, un modelo de vision-lenguaje-accion segun las etiquetas del repositorio, del que no se detallan la composicion interna ni el numero de tokens de preentrenamiento. La configuracion de entrada combina tres vistas de camara (head, muneca izquierda y muneca derecha), propiocepcion y el texto de la subtarea vigente, junto con una ranura adicional de fotograma clave que se rellena con un fotograma pasado recuperado cuando la etiqueta de la subtarea lo indica. La longitud de video utilizada es 4.

El ajuste fino se realizo sobre el dataset Myungkyu/RMBench-taco-wodemo-gemini, compuesto por demostraciones con etiquetas densas de subtareas generadas mediante anotacion offline a partir del contexto especifico de la tarea. El entrenamiento empleo un optimizador con batch de 128 durante 60000 pasos, y el repositorio publica el checkpoint final. No se indica en la informacion disponible si hubo etapas de RLHF, DPO u otras tecnicas de alineacion, ni se describen innovaciones como decodificacion especulativa o atencion lineal. Un aviso relevante del autor es que las configuraciones referencian el backbone y el tokenizer por id de hub o por ruta local del sitio de entrenamiento, por lo que deben redirigirse a copias locales antes de cargar el modelo.

## Capacidades

- Generacion de acciones de control roboticas: el modelo produce politicas de bajo nivel para manipulacion en tareas de mesa simuladas.
- Percepcion visual multimodal: consume imagenes de camara frontal y de dos munezas simultaneamente (tres vistas).
- Integracion de propiocepcion: incorpora el estado propioceptivo del robot como entrada adicional.
- Condicionamiento por instruccion textual de subtarea: la accion se condiciona al texto de la subtarea actual.
- Recuperacion de fotograma clave: dispone de una ranura que toma un fotograma pasado recuperado cuando la etiqueta lo requiere.
- Cobertura de RMBench: especializado en las nueve tareas de mesa simuladas de dicho benchmark.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo opera como politica de bajo nivel.
- Capacidades multilingues: no disponibles.
- Capacidades especiales adicionales (modo thinking, vision general, audio): no disponibles mas alla del procesamiento de imagen y texto descrito.

## Casos de uso

- Manipulacion robotica en simulacion sobre RMBench: el modelo esta disenado especificamente para resolver las nueve tareas de mesa de este benchmark, condicionando las acciones a la subtarea en curso y a las vistas de camara, por lo que es la opcion directa para reproducir o extender esos experimentos.
- Investigacion en politicas VLA de bajo nivel: sirve como punto de partida para estudiar como un backbone preentrenado se adapta a un conjunto reducido de tareas con etiquetas densas de subtareas.
- Generacion de datos sinteticos de trayectorias: al operar en simulador, puede emplearse para producir rollouts con etiquetas de subtarea que alimenten etapas posteriores de entrenamiento o evaluacion.
- Benchmarking de ajuste fino: permite comparar configuraciones de entrenamiento (batch, pasos, longitud de video) sobre un mismo backbone y un mismo conjunto de tareas.
- Sistemas de imitacion con multiples camaras: su entrada de tres vistas mas propiocepcion permite estudiar politicas que fusionan vision egocentrica y de muneca en tareas de agarre y ensamblaje.
- Transferencia a robot real como paso previo: el checkpoint puede servir de base para experimentos de transferencia sim-a-real, siempre que se disponga de la licencia y las condiciones de uso, que no estan declaradas.
- Evaluacion de recuperacion de fotogramas clave: la ranura de keyframe permite investigar el efecto de recuperar un fotograma pasado en la precision de la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de metricas de RMBench ni comparaciones con otros modelos, y la busqueda web realizada no aporto datos tecnicos sobre este modelo ni sobre su backbone.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6.912.896.320 parametros, los pesos ocupan aproximadamente 13,8 GB en precision de 16 bits (coincide con el tamano del repositorio), por lo que se necesitan al menos unos 15-16 GB de VRAM contando activaciones y buffers de vision.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberian ser suficientes para inferencia en 16 bits; para el ajuste fino se recomiendan A100 (40/80 GB), H100 o varias GPU con paralelismo de datos.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090; en tarjetas de 12-16 GB solo cabria con cuantizacion, que no esta publicada por el autor.
- Opciones de despliegue: no se especifican en la informacion disponible; al tratarse de un modelo de robotica con entradas de imagen y propiocepcion, el despliegue dependera del codigo de inferencia del backbone RLDX-1-PT mas que de frameworks genericos como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.
- Nota de carga: las configuraciones referencian el backbone y el tokenizer por id de hub o por ruta local del sitio de entrenamiento, por lo que hay que redirigirlas a copias locales antes de cargar el modelo.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks ni de especificaciones completas para establecer una comparativa cuantitativa fiable. La unica referencia directa disponible es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| Myungkyu/rldx_1_rmbench_taco_wodemo_gemini_b128_60k | 6,9 mil millones | No disponible | No disponible | Ajuste fino especializado en RMBench |
| RLWRLD/RLDX-1-PT | No disponible | No disponible | No disponible | Modelo base preentrenado del que deriva |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta analisis de sesgo ni composicion demografica del dataset de demostraciones.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en modelos VLA el riesgo se manifiesta como acciones fisicamente incoherentes o no recuperables mas que como texto inventado.
- Alcance limitado: el modelo esta especializado en las nueve tareas de mesa simuladas de RMBench, por lo que su generalizacion fuera de ese conjunto no esta respaldada por datos publicados.
- Limitaciones de contexto e idioma: no se especifica ventana de contexto en tokens ni los idiomas de las instrucciones de subtarea; las etiquetas provienen de anotacion offline y podrian no cubrir variaciones linguisticas.
- Compatibilidad de carga: las configuraciones apuntan al backbone y al tokenizer por id de hub o por ruta local del sitio de entrenamiento, lo que exige ajustar esas referencias antes de usar el checkpoint.
- Restricciones de licencia: la licencia no esta declarada, por lo que no puede confirmarse la viabilidad de uso comercial; debe consultarse con el autor antes de cualquier despliegue en produccion.
- Madurez del repositorio: 0 descargas y 0 likes, sin model card extendida ni resultados de evaluacion, lo que limita la reproducibilidad.
- Fecha de creacion: el repositorio figura con fecha de creacion y actualizacion del 17 de septiembre de 2026, dato que conviene verificar en la pagina del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/rldx_1_rmbench_taco_wodemo_gemini_b128_60k
- Dataset de ajuste: https://huggingface.co/datasets/Myungkyu/RMBench-taco-wodemo-gemini
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada.
