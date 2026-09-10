# IXDLI/AIRO-Doffy-DP-vision-joint-contact-gru

## Resumen

AIRO-Doffy-DP-vision-joint-contact-gru es un conjunto de checkpoints intermedios de una politica de difusion (diffusion policy) para robotica, publicado por el usuario IXDLI en HuggingFace bajo la etiqueta de pipeline `robotics`. No se trata de un modelo final: la propia model card indica explicitamente que son "checkpoints intermedios de un entrenamiento en curso" y que no se genera alias `last.pt`. El modelo toma como entrada imagenes RGB, estados articulares (joints) e historial de contacto, y produce acciones de control; incorpora un modulo GRU de contacto que consume 12 fotogramas de historial con un umbral de 10 mm y un tamano de lote de 32.

La relevancia de esta ficha es mas limitada que la de un modelo de lenguaje: no hay arquitectura transformer, ni tokens de contexto, ni capacidades de generacion de texto, razonamiento o codigo. Es un artefacto de investigacion en robotica, pensado para reproducir o continuar un entrenamiento concreto, no para despliegue generico de IA. El repositorio ocupa aproximadamente 1,2 GB y contiene snapshots exactos en el paso 70000, con sumas de verificacion SHA-256 y trazabilidad en el fichero `milestone_70k.json`.

Los metadatos publicos son muy escasos: no se declara licencia, no se declaran idiomas, no hay descargas ni likes, y la model card no incluye resultados de evaluacion ni descripcion del dataset de entrenamiento mas alla de la referencia al directorio de salida del trabajo. Cualquier dato sobre parametros, contexto o cuantizacion debe considerarse no disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | politica de difusion (diffusion policy) con codificador visual RGB, entrada de joints e historial de contacto modelado por GRU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible. En el componente de contacto se especifican 12 fotogramas de historial |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch sin cuantizacion declarada) |
| Idiomas soportados | no aplica / no disponible (modelo de robotica, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoints de PyTorch (`.pt` o equivalente), sin alias `last.pt`; el repositorio ocupa 1,2 GB |
| Libreria declarada | pytorch |
| Tarea declarada (pipeline) | robotics |
| Autor | IXDLI |
| Paso de entrenamiento de los snapshots | 70000 |
| Tamano de lote declarado | 32 |
| Umbral de contacto declarado | 10 mm |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe un unico modelo de difusion condicionado de forma conjunta por RGB, joints e historial de contacto. La parte visual aporta observaciones de camara; la parte de estado articular aporta la configuracion del robot; y la parte de contacto se modela con una GRU que consume 12 fotogramas de historial aplicando un umbral de 10 mm. El modelo se entrena con tamano de lote 32. No se especifica el tipo de backbone visual, el numero de pasos de difusion, el planificador (DDPM, DDIM u otro), el numero de capas de la GRU ni la dimensionalidad de la accion.

Respecto a los datos, la model card unicamente referencia el directorio de salida del trabajo `1f5bf872-b315-4897-a194-fa71d4115e58` y la ruta `/project_ghent/AIRO-Doffy/dp_vision_joint_contact_gru_20260910/output`. No se indica el numero de episodios de demostracion, la plataforma robotica empleada, la composicion del dataset ni si hubo etapas de ajuste con preferencias humanas o refuerzo. Los detalles del modelo y la normalizacion estan embebidos en cada checkpoint original, segun el autor, y la procedencia se documenta en `milestone_70k.json` mediante sumas SHA-256.

No se declara ninguna innovacion tecnica adicional mas alla de la combinacion de condicionamiento multimodal (vision, joints y contacto) con el historial de contacto modelado por GRU sobre ventanas de 12 fotogramas. Tampoco se documentan tecnicas de decodificacion acelerada ni estrategias de inferencia en tiempo real.

## Capacidades

- Generacion de acciones de control para un robot a partir de observaciones multimodales: imagenes RGB, estado de las articulaciones e historial de contacto.
- Condicionamiento en historial de contacto: la GRU procesa 12 fotogramas con un umbral de 10 mm, lo que en principio permite reaccionar a eventos de contacto recientes en tareas de manipulacion.
- Aprendizaje de politicas a partir de demostraciones mediante modelado generativo por difusion (enfoque habitual en diffusion policies).
- Reproducibilidad parcial: se documentan checksums SHA-256 y un fichero de trazabilidad (`milestone_70k.json`), y los metadatos de normalizacion viajan dentro de los propios checkpoints.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas ni vision generalista (captioning, VQA u OCR).
- No se declara soporte de tool calling, function calling ni orquestacion de agentes.
- No se declaran capacidades multilingues.
- No se declara modo de razonamiento explicito, ni procesamiento de audio, ni entrada de texto.
- Al ser checkpoints intermedios, no se declara un rendimiento de politica consolidado ni una version final recomendada para produccion.

## Casos de uso

- Investigacion academica en aprendizaje por imitacion: el modelo sirve como material reproducible para comparar variantes de condicionamiento (RGB frente a RGB + joints + contacto) usando el mismo paso de entrenamiento (70000) y los mismos checksums.
- Reentrenamiento o ajuste fino: al incluir snapshots exactos y normalizacion embebida, un equipo puede reanudar el entrenamiento desde el paso 70000 en lugar de partir de cero, siempre que disponga del pipeline original.
- Manipulacion con deteccion de contacto: en tareas donde el exito depende de detectar un contacto fisico (insercion de piezas, ensamblaje, agarre ajustado), la GRU de contacto de 12 fotogramas y umbral de 10 mm es la pieza especifica del modelo que se puede evaluar de forma aislada.
- Politicas guiadas por vision en banco de pruebas: al condicionarse por RGB, el modelo se puede probar en un setup con camara cenital o muñeca para tareas de pick-and-place, midiendo la tasa de exito frente a una version sin entrada visual.
- Ablacion de la componente de contacto: entrenando variantes sin historial de contacto con el mismo presupuesto de pasos, se puede cuantificar la contribucion de la GRU, que es precisamente el eje del experimento descrito.
- Analisis de robustez y seguridad antes de transferir a robot real: los checkpoints intermedios permiten evaluar en simulacion el comportamiento en estados cercanos al limite (contactos inesperados, cambios bruscos de fuerza) sin arriesgar hardware.
- Docencia en robotica y aprendizaje profundo: como ejemplo real de diffusion policy condicionada por multiples modalidades, con artefactos de trazabilidad asociados.
- No se recomienda su uso como politica de produccion en su estado actual: el autor lo etiqueta explicitamente como intermedios y no finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de tasa de exito, error de posicion, retardo de inferencia ni comparaciones con otras politicas. Tampoco se dispone de curvas de entrenamiento ni de perdidas asociadas al paso 70000 en los metadatos publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,2 GB, pero no se declara si contiene uno o varios checkpoints ni el tamano individual de cada uno, por lo que no puede derivarse la memoria necesaria.
- GPU recomendadas: no disponible. No se especifica el hardware usado en el entrenamiento ni el objetivo de despliegue.
- Encaje en GPU de consumo: no disponible. No puede confirmarse si el modelo cabe en una GPU de gama de consumo sin conocer el numero de parametros y el tipo de backbone.
- Opciones de despliegue: no se documentan en la informacion proporcionada. Por la libreria declarada (`pytorch`) y la tarea (`robotics`), lo esperable es cargar los checkpoints en PyTorch y ejecutar inferencia en un bucle de control; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de modelo. Cualquier exportacion a ONNX, TorchScript o TensorRT requeriria verificacion propia.
- Latencia y throughput estimados: no disponible. En politicas de difusion la latencia depende del numero de pasos de difusion y del coste del codificador visual, datos que no se proporcionan.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto / historial | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AIRO-Doffy-DP-vision-joint-contact-gru (IXDLI) | diffusion policy para manipulacion con contacto | no disponible | 12 fotogramas de historial en el modulo de contacto; sin dato de contexto general | no disponible | no disponible | repositorio HuggingFace publico de 1,2 GB, checkpoints intermedios del paso 70000 |
| Diffusion Policy (familia de referencia en aprendizaje por imitacion) | diffusion policy para manipulacion visual | no disponible | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | ampliamente conocida en la literatura, pero sin datos verificados en la informacion proporcionada |
| 3D Diffusion Policy (DP3) | diffusion policy con entrada de nube de puntos | no disponible | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | trabajos publicos de investigacion, sin datos verificados en la informacion proporcionada |
| ACT (Action Chunking Transformer) | transformer de prediccion de acciones por troceado | no disponible | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | metodo de referencia en manipulacion, sin datos verificados en la informacion proporcionada |

No se dispone de datos verificados de los modelos comparables dentro de la informacion proporcionada, por lo que la tabla es orientativa en cuanto a categoria, no en cuanto a cifras. La busqueda web realizada no devolvio resultados tecnicos relevantes: los enlaces obtenidos corresponden a contenido de viajes sobre Edimburgo y no guardan relacion con el modelo.

## Limitaciones y advertencias

- Estado del artefacto: son checkpoints intermedios de un entrenamiento en curso, no modelos finales; el autor advierte explicitamente de ello y no crea alias `last.pt`. No deben presentarse como una version estable.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial. Es imprescindible contactar con el autor antes de cualquier uso fuera del ambito estrictamente de investigacion.
- Sesgos: no hay informacion sobre la composicion del dataset de demostraciones, por lo que no puede evaluarse el sesgo de distribucion (por ejemplo, dependencia de condiciones de iluminacion, de un unico robot o de un unico operador).
- Riesgo de fallo en ejecucion real: en politicas de difusion entrenadas por imitacion, el comportamiento fuera de la distribucion de las demostraciones no esta garantizado; en robotica esto implica riesgo fisico si se despliega sin salvaguardas.
- Alucinacion: el concepto de alucinacion entendido como generacion factible pero falsa no aplica directamente; el analogo es la generacion de trayectorias plausibles pero incorrectas, y no hay evaluacion publicada al respecto.
- Limitaciones de contexto e idioma: no procede hablar de ventana de contexto de tokens ni de idiomas; el unico dato de "memoria" disponible es la ventana de 12 fotogramas del modulo de contacto y el umbral de 10 mm.
- Ausencia de benchmarks: sin tasas de exito ni comparaciones, no es posible estimar la calidad de la politica ni decidir entre este checkpoint y otro sobre la base de datos publicos.
- Reproducibilidad condicionada: los detalles del modelo y la normalizacion estan embebidos en los checkpoints, pero la referencia al directorio de entrenamiento (`/project_ghent/AIRO-Doffy/...`) sugiere infraestructura interna que un tercero no tiene por que poder replicar.
- Trazabilidad parcial: existe `milestone_70k.json` con checksums, lo que ayuda a verificar integridad, pero no sustituye a una model card completa.
- Fechas de creacion y actualizacion muy proximas entre si (un minuto de diferencia), lo que indica una publicacion automatizada de snapshots sin curacion posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IXDLI/AIRO-Doffy-DP-vision-joint-contact-gru
- Fichero de trazabilidad citado en la model card: `milestone_70k.json` (referenciado, sin URL publica conocida)
- Repositorio o paper asociado: no disponible
- Blog o documentacion del autor: no disponible
- Demo: no disponible
- Nota sobre la busqueda web: los resultados devueltos corresponden a paginas de viajes sobre Edimburgo (tui.com, urlaubsguide.de, urlaubspiraten.de, reise.de, reise-kroeten.de) y no guardan ninguna relacion con este modelo, por lo que se descartan como fuentes.
