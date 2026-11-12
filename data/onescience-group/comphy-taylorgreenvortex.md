# OneScience-Group/ComPhy-TaylorGreenVortex

## Resumen

ComPhy-TaylorGreenVortex es un paquete de investigación publicado por OneScience-Group que reproduce un experimento de aprendizaje con restricciones físicas (physics-constrained learning) sobre el flujo de vórtice de Taylor-Green, un caso clásico de referencia en dinámica de fluidos computacional. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es un checkpoint de PyTorch (`weight/best_model.pth`) acompañado del código de modelo, configuración, entrenamiento, inferencia y visualización necesarios para replicar el experimento.

El paquete entrena sobre puntos generados en línea a partir de una referencia analítica incluida (`data/tgv_reference.npz`), por lo que no requiere descargar conjuntos de datos externos. La model card indica explícitamente que el paquete se entrenó una sola vez y que las cifras reportadas no garantizan resultados equivalentes en otra ejecución.

Su relevancia es acotada y de carácter metodológico: sirve como material reproducible para investigadores que trabajen en operadores neuronales aplicados a ecuaciones en derivadas parciales y en el caso de referencia Taylor-Green. No hay información pública sobre arquitectura, número de parámetros, contexto ni benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos de la model card) |
| Licencia | other (licencia no especificada; la licencia del dataset no debe inferirse de la del codigo) |
| Formato de pesos | PyTorch (`weight/best_model.pth`, checkpoint `.pth`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo: la model card no especifica si se trata de un MLP, una red convolucional, un operator neural (FNO, DeepONet) o un esquema PINN. Tampoco se indican el numero de capas, las dimensiones ocultas ni el numero de parametros. Lo unico confirmado es que el modelo se implementa en PyTorch y que el paquete incluye el codigo del modelo junto con los scripts de entrenamiento, inferencia y visualizacion.

El entrenamiento se realiza con puntos generados en linea, lo que sugiere un muestreo de colocacion (collocation) tipico de los esquemas physics-informed, y utiliza como referencia analitica el archivo `data/tgv_reference.npz`. Los hiperparametros del experimento se encuentran en `config/config.yaml`. No se documentan el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF o DPO (categorias que, por otra parte, no aplican a este tipo de modelo). La model card advierte que el entrenamiento se ejecuto una sola vez y que las cifras reportadas no constituyen garantias de reproducibilidad.

## Capacidades

- Resolucion aproximada del caso de referencia Taylor-Green vortex mediante aprendizaje con restricciones fisicas.
- Inferencia sobre el checkpoint preentrenado incluido (`weight/best_model.pth`) mediante `scripts/inference.py`.
- Generacion de resultados y visualizaciones a partir de `scripts/result.py`.
- Reentrenamiento reproducible mediante `scripts/train.py` y `config/config.yaml`.
- Evaluacion contra una referencia analitica incluida en el paquete.
- No se documentan capacidades de generacion de texto, codigo, matematicas simbolicas, vision, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Reproduccion de resultados de investigacion: el paquete incluye checkpoint, configuracion y scripts, lo que permite replicar el experimento Taylor-Green y comparar con los resultados registrados en `results/`.
- Linea base para metodos physics-informed: sirve como referencia de partida para comparar variantes de arquitectura o de funcion de perdida en el mismo caso de flujo.
- Validacion de pipelines de entrenamiento cientifico: util para verificar que el entorno de PyTorch con aceleracion, las dependencias (`torch`, `numpy`, `scipy`, `h5py`, `pyyaml`, `matplotlib`) y el flujo de datos en linea funcionan correctamente antes de escalar a experimentos propios.
- Docencia en dinamica de fluidos computacional: el caso Taylor-Green es un banco de pruebas clasico y el paquete permite mostrar el ciclo completo de entrenamiento, inferencia y visualizacion sin dependencias de datos externos.
- Analisis de sensibilidad al muestreo: al generarse los puntos de entrenamiento en linea, el paquete permite estudiar como varia el resultado al modificar los parametros de `config/config.yaml`.
- Integracion en flujos de trabajo de investigacion reproducibles: el checkpoint y los scripts pueden empaquetarse en entornos contenedorizados para ejecuciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la carpeta `results/` del propio paquete para consultar las salidas registradas, pero no se incluyen cifras numericas en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible (el tamano del modelo no se especifica y el repositorio ocupa 0.0 GB segun los metadatos).
- GPU recomendadas: no disponibles; la model card solo indica que para entrenar se requiere un entorno de PyTorch con aceleracion.
- Compatibilidad con GPU de consumo: no se puede determinar sin conocer el numero de parametros.
- Opciones de despliegue: ejecucion directa con PyTorch mediante los scripts incluidos; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje y no aplicables a este paquete).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion.

## Limitaciones y advertencias

- La model card advierte que el paquete se entreno una unica vez y que las cifras reportadas no garantizan resultados en otra ejecucion.
- No se especifican arquitectura, parametros ni hiperparametros en la documentacion publica; cualquier evaluacion requiere inspeccionar el codigo y `config/config.yaml`.
- La licencia figura como `other` sin texto de licencia en la informacion disponible; es imprescindible verificar las condiciones antes de cualquier uso comercial.
- La licencia del dataset no debe inferirse de la licencia del codigo, segun indica el propio autor.
- El alcance es un unico caso de referencia en dinamica de fluidos; no es un modelo general ni transferible a otras tareas sin reentrenamiento.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento fuera del dominio, aunque el concepto de alucinacion no aplica directamente a este tipo de modelo.
- El aviso de la model card sobre la procedencia de los datos remite a una organizacion en ModelScope; conviene verificar la trazabilidad de la referencia analitica.
- Uso en produccion no recomendado sin una validacion independiente: no hay benchmarks publicos ni garantias de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/ComPhy-TaylorGreenVortex
- Organizacion en ModelScope: https://www.modelscope.cn/organization/OneScience
- Paper de referencia (ICLR 2026): https://proceedings.iclr.cc/paper_files/paper/2026/file/10f34ee79b62627b7ebf6279d35ea480-Paper-Conference.pdf
