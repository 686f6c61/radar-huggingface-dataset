# BAAI/Innata-0-WAM-RoboCasa365

## Resumen

Innata-0-WAM-RoboCasa365 es un modelo de accion mundial (world action model, WAM) desarrollado por BAAI (Beijing Academy of Artificial Intelligence) para el entorno de manipulacion robotica RoboCasa365. Se distribuye como un checkpoint de investigacion: concretamente, los pesos EMA del paso 29000 de una politica "command-only" entrenada con acciones Control12. El modelo tiene 16.182.057.152 parametros (aproximadamente 16,2 mil millones) y un repositorio de 32,4 GB en formato safetensors.

La arquitectura se describe como "three-tower" (tres torres), un diseno que en la practica separa el procesamiento en modulos diferenciados —tipicamente percepcion, razonamiento/planificacion y generacion de acciones—, aunque la model card no detalla la composicion interna ni el tipo de cada torre. El tag `cosmos3_omni` sugiere una relacion con la familia Cosmos de NVIDIA, orientada a modelos fundacionales para robotica y mundo fisico, si bien esta vinculacion no se confirma explicitamente en la informacion disponible.

El modelo no esta pensado para uso general ni para despliegue en produccion: es un artefacto de investigacion para evaluar politicas de control robotico en tareas de RoboCasa365. Su relevancia radica en que ejemplifica la tendencia hacia modelos de accion de gran escala que unifican percepcion y control en un unico transformer, pero su utilidad practica queda restringida al ecosistema de inferencia publicado por BAAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Three-tower world action model (detalle interno no disponible) |
| Parametros totales | 16.182.057.152 (~16,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

La model card solo indica que se trata de un "three-tower world action model" para RoboCasa365. No se especifica si cada torre es un transformer denso, un MoE o un modulo híbrido, ni como se combinan sus representaciones. El tag `cosmos3_omni` y el requisito de `custom_code` implican que la carga del modelo depende de codigo propietario del repositorio y no de una arquitectura estandar de `transformers`.

El checkpoint corresponde al paso 29000 con pesos EMA de una politica "command-only" con acciones Control12. Esto implica que el modelo fue entrenado para mapear instrucciones de comando a secuencias de 12 dimensiones de accion de control, sin entrada visual explicita en la variante "command-only" (o al menos sin que la model card lo detalle). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de acciones de control robotico de 12 dimensiones (Control12) a partir de comandos.
- Politica "command-only": no se documenta entrada multimodal (vision, audio) en esta variante.
- Integracion con el framework de inferencia de BAAI (`innata-framework-inference`) para evaluacion en RoboCasa365.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso generico.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de politicas de control en RoboCasa365: el modelo se usa con el repositorio de inferencia de BAAI para reproducir los resultados del paso 29000 en tareas de manipulacion del benchmark, sirviendo como linea base para comparar nuevas politicas.
- Investigacion en world action models: permite estudiar como un modelo de 16,2 B parametros con arquitectura de tres torres mapea comandos a acciones de 12 dimensiones, y analizar el efecto de los pesos EMA frente a los pesos no promediados.
- Reproducibilidad de experimentos: al publicarse un checkpoint concreto (paso 29000, EMA, command-only), otros grupos pueden verificar resultados y comparar variantes de entrenamiento sobre la misma base.
- Desarrollo de pipelines de simulacion robotica: el modelo puede integrarse en entornos simulados compatibles con RoboCasa365 para generar trayectorias de accion y medir tasas de exito.
- Estudio de escalado en control robotico: con 16,2 B parametros, sirve para analizar si el escalado de parametros mejora la precision de las acciones en tareas de manipulacion frente a politicas mas pequenas.
- Base para fine-tuning en dominios especificos: el checkpoint puede servir como inicializacion para adaptar la politica a otros conjuntos de tareas de manipulacion, siempre que se respete la licencia (no disponible) y el formato `custom_code`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 16,2 B parametros en safetensors (32,4 GB en el repo), la inferencia en precision completa requiere aproximadamente 32-65 GB de VRAM segun el tipo de dato (fp32/fp16/bf16). En cuantizacion de 8 bits se estima en torno a 16-20 GB; en 4 bits, en torno a 9-12 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 80 GB o H100 para precision completa; A100 40 GB o RTX 6000 Ada para fp16/bf16 con margen ajustado.
- Cabe en GPU de consumo: potencialmente en RTX 4090 (24 GB) solo con cuantizacion agresiva (8 bits o inferior), no documentada oficialmente.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el unico camino soportado es el framework de inferencia de BAAI con `custom_code`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni especificaciones de modelos comparables de la misma categoria (world action models para RoboCasa365) en la informacion disponible.

## Limitaciones y advertencias

- Modelo de investigacion: no es un modelo de proposito general; su uso esta restringido a evaluacion en RoboCasa365 y tareas relacionadas.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse el repositorio antes de cualquier despliegue productivo.
- Dependencia de `custom_code`: la carga requiere codigo propietario, lo que complica la integracion con herramientas estandar.
- Variante "command-only": no se documenta entrada visual; si la tarea requiere percepcion, esta variante puede no ser adecuada.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado en la model card.
- Idiomas y contexto: no disponibles, lo que impide garantizar comportamiento multilingue o ventanas largas.
- Checkpoint unico (paso 29000 EMA): no se ofrece informacion sobre estabilidad del entrenamiento ni sobre el rendimiento en pasos anteriores o posteriores.
- Sin descargas ni likes: modelo recien publicado, sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/BAAI/Innata-0-WAM-RoboCasa365
- Repositorio de inferencia: https://github.com/baai-eai/innata-framework-inference#release-checkpoint-inference
