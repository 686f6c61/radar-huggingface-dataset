# Myungkyu/pi0_5_robodojo_preset_b64_60k

## Resumen

pi0_5_robodojo_preset_b64_60k es una política robótica de bajo nivel (low-level policy) desarrollada por el usuario Myungkyu, obtenida mediante fine-tuning del modelo base `lerobot/pi05_base`. Se trata de un modelo de tipo vision-language-action (VLA) que combina percepción visual, propiocepción y una instrucción textual de subtarea para generar acciones de control en robots bimanuales de sobremesa.

El modelo está especializado en el conjunto de tareas RoboDojo de horizonte largo, compuesto por ocho tareas reales de manipulación bimanual con cien demostraciones cada una, etiquetadas con subtareas densas procedentes del preset de subtareas de Gemini. La arquitectura declarada es Pi0.5 vanilla, con tres vistas de cámara en vivo (cabeza y muñecas izquierda y derecha), sin ranura de keyframe y sin atestación de memoria.

Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un repositorio de 9,4 GB en formato safetensors, es un modelo de tamano medio que puede ejecutarse en GPU de gama alta para consumidor. Es relevante para la comunidad de robótica porque publica un checkpoint final de un fine-tuning reproducible sobre un dataset concreto, aunque no incluye datos de licencia, idiomas ni resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en Pi0.5, configuracion "vanilla" con tres vistas de camara en vivo (cabeza y munecas izquierda/derecha), sin ranura de keyframe y sin atestacion de memoria |
| Parametros totales | 4.143.404.816 (aproximadamente 4,14 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tamano del repositorio | 9,4 GB |
| Modelo base | lerobot/pi05_base |
| Dataset de entrenamiento | Myungkyu/RoboDojo-preset-gemini |
| Configuracion de entrenamiento | batch de optimizador 64, 60.000 pasos, checkpoint final |
| Entradas | imagen de cabeza, imagenes de muneca izquierda y derecha, propiocepcion, texto de la subtarea actual (sin entrada de keyframe) |
| Pipeline declarado | robotics |
| Fecha de creacion | 2026-09-11 |
| Fecha de actualizacion | 2026-09-11 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pi0.5 en su variante "vanilla", segun la propia model card. Se trata de un modelo vision-language-action que consume tres flujos de imagen en vivo (camara de cabeza y camaras de muneca izquierda y derecha), senales de propiocepcion y el texto de la subtarea en curso para producir acciones de control. La configuracion declarada no emplea ranura de keyframe ni atestacion de memoria, lo que la distingue de variantes de Pi0.5 que si incorporan esos mecanismos. No se detalla en la informacion disponible si el cabezal de acciones usa flow matching, difusion u otra formulacion, ni el numero de tokens de entrenamiento.

El entrenamiento consiste en un fine-tuning supervisado desde `lerobot/pi05_base` sobre el dataset `Myungkyu/RoboDojo-preset-gemini`, que contiene ocho tareas reales de manipulacion bimanual de sobremesa con cien demostraciones por tarea (800 episodios en total) anotadas con etiquetas densas de subtarea procedentes del preset. La optimizacion se realizo con batch de optimizador 64 durante 60.000 pasos, publicandose el checkpoint final. No hay informacion sobre uso de RLHF, DPO ni otras tecnicas de alineamiento, ni sobre innovaciones tecnicas adicionales mas alla de la condicion por subtarea.

## Capacidades

- Generacion de acciones de control robótico para manipulación bimanual de sobremesa a partir de observaciones visuales y propioceptivas.
- Condicionamiento por instruccion textual de subtarea: el modelo recibe el texto de la subtarea actual y lo utiliza para guiar la politica.
- Percepcion multi-camara: procesa simultaneamente una vista de cabeza y dos vistas de muneca (izquierda y derecha).
- Ejecucion de tareas de horizonte largo mediante descomposicion en subtareas anotadas.
- Integracion con el ecosistema LeRobot para carga, entrenamiento e inferencia.
- Capacidades de tool calling, function calling y agentes multi-paso: no disponibles.
- Capacidades multilingues: no disponibles (solo se declara entrada de texto de subtarea, sin idiomas especificados).
- Capacidades especiales (modo thinking, vision adicional, audio): no disponibles mas alla de las tres camaras declaradas.

## Casos de uso

- Manipulación bimanual de sobremesa en laboratorio: el modelo puede ejecutar las ocho tareas de RoboDojo sobre las que fue entrenado, sirviendo como referencia reproducible para comparar politicas VLA en un mismo banco de tareas.
- Investigación en politicas condicionadas por subtarea: dado que el dataset incluye etiquetas densas de subtarea, el modelo permite estudiar como el condicionamiento textual de la subtarea afecta a la ejecucion de tareas de horizonte largo.
- Fine-tuning posterior sobre dominios propios: al partir de `lerobot/pi05_base` y distribuirse en safetensors con la libreria LeRobot, puede reutilizarse como inicializacion para nuevos conjuntos de demostraciones bimanuales.
- Evaluación comparativa de checkpoints: al publicarse un unico checkpoint final con hiperparametros conocidos (batch 64, 60.000 pasos), es util como punto de referencia fijo frente a otros entrenamientos sobre el mismo dataset.
- Replicacion de experimentos: la model card especifica entradas y configuracion, lo que facilita reproducir la puesta en marcha en un montaje de tres camaras con propiocepcion.
- Formacion y docencia en robotica: sirve como ejemplo practico de pipeline LeRobot de vision-language-action con dataset anotado por subtareas.
- Despliegue en robot real de sobremesa: con aproximadamente 4,14 mil millones de parametros, el modelo puede ejecutarse en una GPU de gama alta para consumidor dentro del bucle de control, siempre que se valide la latencia en el hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito por tarea, metricas de simulacion ni comparaciones numericas con otros checkpoints de RoboDojo. Tampoco se han encontrado datos de evaluacion en los resultados de busqueda web, que no guardan relacion con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 8,3 GB solo para pesos (4,14 mil millones de parametros a 2 bytes), mas el consumo de activaciones, buffers de imagen y el resto del pipeline de vision.
- VRAM estimada en FP32: aproximadamente 16,6 GB solo para pesos.
- Cabe en GPU de consumidor: si, previsiblemente en tarjetas con 16 GB o mas (RTX 4080, RTX 4090, RTX 5090) en BF16/FP16; en tarjetas de 12 GB probablemente requiera cuantizacion o carga parcial, aunque no se documentan recetas de cuantizacion.
- GPU recomendadas: RTX 4090 o superior para inferencia en consumidor; L40S, A100 o H100 para entrenamiento y para inferencia de baja latencia en produccion.
- Opciones de despliegue: libreria LeRobot sobre PyTorch, segun la model card. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI; estos motores estan orientados a modelos de lenguaje y no cubren habitualmente el bucle de control de un VLA.
- Latencia y throughput estimados: no disponibles.
- Nota de carga: la model card advierte de que las configuraciones referencian el backbone y el tokenizador base por id del hub o por la ruta local del sitio de entrenamiento, por lo que hay que apuntarlas a copias locales antes de cargar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0_5_robodojo_preset_b64_60k | 4,14 mil millones | Ocho tareas bimanuales de sobremesa (RoboDojo) | no disponible | no disponible | Publico en HuggingFace |
| lerobot/pi05_base | no disponible | Politica VLA generalista (modelo base) | no disponible | no disponible | Publico en HuggingFace |
| Otras politicas VLA (OpenVLA, pi0, GR00T y similares) | no disponible | Manipulacion robotica general | no disponible | no disponible | no disponible |

No se dispone de cifras de rendimiento comparables en la informacion proporcionada, por lo que la comparativa se limita a la relacion de linaje (este modelo es un fine-tuning de `lerobot/pi05_base`) y a la categoria de tarea. No se han podido verificar datos de contexto, licencia ni evaluaciones de las alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se ha publicado ningun analisis de sesgo ni de cobertura del dataset.
- Riesgo de alucinacion: propio de los modelos generativos; en un VLA se manifiesta como acciones incoherentes o no seguras ante observaciones fuera de la distribucion de entrenamiento.
- Alcance limitado del dominio: el fine-tuning se realizo sobre ocho tareas concretas de RoboDojo con 100 demostraciones cada una, por lo que la generalizacion fuera de ese conjunto de tareas, morfologias de robot y condiciones de iluminacion no esta garantizada.
- Limitaciones de contexto e idioma: no se especifican idiomas soportados ni longitud de contexto; se desconoce el comportamiento con textos de subtarea distintos a los del preset empleado.
- Dependencia del montaje de sensores: el modelo espera tres vistas de camara (cabeza y dos munecas) y senales de propiocepcion; variaciones en la configuracion de camaras pueden degradar el rendimiento.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, por lo que no puede confirmarse el uso comercial. Debe verificarse antes de cualquier despliegue productivo.
- Reproducibilidad: la model card indica que las configuraciones referencian el backbone y el tokenizador por id del hub o por rutas locales del sitio de entrenamiento, lo que exige ajustar esas referencias para cargar el modelo.
- Madurez: el repositorio registra 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad ni resultados de evaluacion publicados.
- Advertencia general: cualquier uso sobre hardware fisico requiere validacion de seguridad y de limites de fuerza antes de operar con personas o entorno real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/pi0_5_robodojo_preset_b64_60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/RoboDojo-preset-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Paper, blog, repositorio o demo adicionales: no disponible. Los resultados de busqueda web proporcionados no contienen enlaces relacionados con el modelo.
