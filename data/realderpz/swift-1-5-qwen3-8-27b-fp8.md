# realderpz/Swift-1.5-Qwen3.8-27B-FP8

## Resumen

Swift-1.5-Qwen3.8-27B-FP8 es una cuantizacion no oficial en FP8 del modelo ukisai/Swift-1.5-Qwen3.8-27b, publicada por el usuario realderpz. El modelo original lo desarrolla UkisAI y es un derivado de Qwen3.8-27B orientado a eficiencia de razonamiento: segun su model card, reduce el numero de tokens de pensamiento un 58,5 % manteniendo (y en algunos casos mejorando) la precision del modelo base. El repositorio que nos ocupa no reentrena nada: aplica exclusivamente compresion numerica sobre los pesos del modelo de UkisAI.

Se trata de un modelo multimodal de tipo image-text-to-text, con 27.781.427.952 parametros totales (27,78 B) y un repositorio de 30,9 GB en safetensors. La pipeline declarada es image-text-to-text, de modo que acepta imagenes ademas de texto, y la etiqueta de arquitectura es qwen3_5. El modelo conserva el modulo MTP (multi-token prediction) del original, lo que permite decodificacion especulativa con cabezas propias.

Su relevancia practica es doble: por un lado, ofrece una version de ~29 GB que reduce a la mitad el peso en VRAM respecto al modelo en precision completa; por otro, hereda el trabajo de post-entrenamiento de UkisAI (RL y OPD escalados sobre Swift 1.0) con foco declarado en tareas de codigo, agentes y horizonte largo. Como contrapartida, es un artefacto de cuantizacion sin descargas ni validacion publica en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text), etiqueta qwen3_5; conserva multi-token prediction (MTP) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 con esquema FP8_BLOCK de compressed-tensors: bloques de pesos de 128x128 y activaciones FP8 dinamicas. El modelo base publica tambien GGUF y GSQ-RCO GGUF |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (identificador generico "other" en HuggingFace) |
| Formato de pesos | safetensors (repo de 30,9 GB); compatible con transformers y compressed-tensors |

## Arquitectura y entrenamiento

La arquitectura del modelo original es un transformer multimodal con soporte de entrada de imagen (image-text-to-text) y etiqueta qwen3_5. No se dispone de informacion sobre el numero de capas, dimension oculta, numero de cabezas de atencion, tipo de atencion ni mecanismo exacto de fusion vision-lenguaje. Se sabe que el modelo conserva el modulo MTP, lo que sugiere la presencia de cabezas adicionales de prediccion de multiples tokens empleables para decodificacion especulativa. No hay datos publicos sobre si la arquitectura incorpora mezcla de expertos; el tag MoE esta ausente y el modelo se describe como denso de 27,78 B de parametros.

En cuanto al entrenamiento, la model card del original indica que Swift 1.5 se construyo a partir de Swift 1.0 escalando el post-entrenamiento en dos fases: aprendizaje por refuerzo (RL) y OPD (on-policy distillation, segun la nomenclatura del autor). La tecnica central descrita consiste en identificar los tokens asociados a sobrepensamiento patologico y penalizarlos sin atacar directamente la longitud del razonamiento, recuperando despues precision mediante RL y OPD. El dataset de SFT multi-turno orientado a agentes esta publicado como ukisai/Qwen3.8-27B-multi-turn-agent-sft, aunque el autor aclara que no se usa tal cual, sino remuestreado y convertido en entornos de RL. No se especifica el volumen de tokens de preentrenamiento, la composicion del corpus ni si hubo fases de DPO o RLHF clasico.

La cuantizacion de este repositorio se realizo con llmcompressor 0.13.0 en modo data-free, empleando el mismo metodo y la misma seleccion de capas que la cuantizacion oficial Qwen/Qwen3.8-27B-FP8. El propio autor la etiqueta explicitamente como no oficial, lo que implica que no ha pasado por la validacion de UkisAI ni de Qwen.

## Capacidades

- Generacion de texto y razonamiento multi-paso: el modelo esta optimizado para reducir tokens de pensamiento manteniendo precision, lo que lo hace adecuado para cadenas de razonamiento largas con coste controlado.
- Comprension de imagenes: la pipeline declarada es image-text-to-text, de modo que acepta imagenes como entrada junto con texto (descripcion, VQA, extraccion de informacion visual).
- Generacion de codigo: el autor declara mejoras especificas en LiveCodeBench y en tareas de coding respecto a Swift 1.0 y al modelo base.
- Tareas agenciales y de terminal: se reportan mejoras en Terminal Bench 2.1, lo que apunta a uso en entornos de linea de comandos y flujos de varios pasos.
- Horizonte largo: el post-entrenamiento se escalo con foco en tareas de larga duracion y multi-turno; el dataset de SFT publicado es explicitamente multi-turno y agencial.
- Multi-token prediction (MTP): el modulo se conserva en la cuantizacion FP8, habilitando decodificacion especulativa con cabezas propias del modelo.
- Tool calling / function calling: no se documenta de forma explicita en la informacion disponible, aunque las capacidades agenciales declaradas implican uso de herramientas.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: el modelo es un derivado "reasoning-efficient" de Qwen3.8-27B, por lo que hereda razonamiento con tokens de pensamiento, pero no se detalla el mecanismo de activacion.

## Casos de uso

- Agentes de terminal y automatizacion de shell: las mejoras declaradas en Terminal Bench 2.1 y el foco en tareas de horizonte largo lo situan como candidato para agentes que ejecutan comandos, interpretan salida y corrigen errores en varios pasos.
- Asistencia de codigo en pipelines de CI/CD: puede integrare en revision de pull requests o generacion de parches; el ahorro de tokens de pensamiento reduce el coste por invocacion frente al modelo base.
- Analisis de documentos con componentes visuales: al aceptar imagen y texto, sirve para extraer datos de capturas, diagramas o formularios escaneados junto con el texto circundante.
- Atencion al cliente multi-turno: el modelo base se entrena sobre datos multi-turno y agenciales, lo que encaja con conversaciones con historial y llamadas a sistemas internos.
- Generacion de aplicaciones y prototipos interactivos: la model card documenta la construccion de un juego 3D con biomas a partir de un unico prompt, con 11,39 minutos de generacion frente a 104,6 minutos del modelo base en el mismo ejercicio.
- Razonamiento con presupuesto de tokens ajustado: en despliegues con coste por token elevado (por ejemplo, GPU alquilada por hora), la reduccion de tokens de pensamiento declarada se traduce directamente en menor factura.
- Servicio de inferencia con vision en produccion: el formato FP8 con compressed-tensors permite servirlo en vLLM o SGLang reduciendo el coste de memoria por replica frente a bf16.

## Benchmarks y rendimiento

La model card del modelo base incluye una tabla de evaluacion comparativa, pero en la informacion disponible aparece truncada por el CSS de la propia pagina, por lo que no se pueden reproducir las cifras. Los unicos datos textuales recuperables son los siguientes, referidos al modelo original y no especificamente a esta cuantizacion FP8:

| Metrica (declarada por el autor del modelo base) | Valor |
|---|---|
| Reduccion de tokens de pensamiento frente a Qwen3.8-27B | 58,5 % menos |
| Variacion de puntuacion agregada frente al base | +0,35 % |
| Aceleracion declarada en varias tareas | 1,95x |
| Tiempo de generacion del demo de juego (base Qwen3.8-27B) | 104,6 minutos |
| Tiempo de generacion del demo de juego (Swift 1.5) | 11,39 minutos |
| Benchmarks con mejora declarada | LiveCodeBench, Terminal Bench 2.1 |
| Cifras numericas de MMLU, HumanEval, GSM8K u otros | no disponibles en la informacion proporcionada |

No se han publicado resultados de benchmarks especificos para el repositorio realderpz/Swift-1.5-Qwen3.8-27B-FP8, ni comparativas de degradacion por cuantizacion.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 27,8 GB (el autor indica ~29 GB para el conjunto). Hay que sumar la torre de vision, el cache KV y el overhead del runtime; con contexto corto, el consumo realista arranca en torno a 30-34 GB por replica.
- GPU de datacenter: H100 80 GB, H100 NVL, A100 80 GB, L40S 48 GB y RTX 6000 Ada 48 GB son opciones comodas. Los nucleos tensor FP8 nativos estan presentes en arquitecturas Hopper y Ada.
- GPU consumer: no cabe en una RTX 4090 o RTX 5090 de 24-32 GB con margen suficiente para cache KV y vision; seria necesario repartir el modelo en dos GPU de 24 GB o recurrir a las variantes GGUF del modelo base con cuantizacion de 4-8 bits.
- Ampere y anteriores: la ejecucion FP8 en estas generaciones depende de kernels de emulacion o de esquemas tipo Marlin en el motor de inferencia; el rendimiento puede degradarse respecto a Ada/Hopper.
- Opciones de despliegue: vLLM y SGLang son las rutas naturales por su soporte de compressed-tensors en FP8; TGI ofrece soporte variable para este esquema. llmcompressor es la herramienta usada para producir la cuantizacion. Para GPU de gama consumer o CPU, la via practica son los repositorios GGUF y GSQ-RCO GGUF publicados por UkisAI sobre el modelo base, no este repositorio FP8.
- Latencia y throughput: no disponibles. La aceleracion de 1,95x declarada por el autor se refiere a la reduccion de tokens de razonamiento del modelo original, no a una mejora de throughput medida en este artefacto FP8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| realderpz/Swift-1.5-Qwen3.8-27B-FP8 | 27,78 B | no disponible | safetensors FP8 (~29-30,9 GB) | swift-open-license-1.0 | 0 descargas, 0 likes en el momento de la consulta |
| ukisai/Swift-1.5-Qwen3.8-27b | 27,78 B (mismo modelo sin cuantizar) | no disponible | safetensors de precision completa, mas GGUF y GSQ-RCO GGUF | swift-open-license-1.0 | Modelo oficial del autor |
| Qwen/Qwen3.8-27B-FP8 | no disponible | no disponible | safetensors FP8 | no disponible | Cuantizacion oficial de referencia en la que se basa el metodo |
| ukisai/Swift-Qwen3.8-27b (Swift 1.0) | no disponible | no disponible | no disponible | swift-open-license-1.0 | Version anterior, con mas de 350.000 descargas declaradas |

No se dispone de datos de contexto, licencia ni benchmarks de los modelos comparados mas alla de lo indicado, por lo que la comparacion cuantitativa de rendimiento no es posible con la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion no oficial: el propio autor la etiqueta como "unofficial". No hay validacion independiente de la degradacion de calidad respecto al modelo en bf16, ni cifras de evaluacion publicadas para este artefacto.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion publica que permitan contrastar su comportamiento en produccion.
- Licencia restrictiva y ambigua: swift-open-license-1.0 se registra en HuggingFace como "other" y apunta a un fichero LICENSE no detallado en la informacion disponible. La model card del modelo base menciona una seccion de "enterprise licensing", lo que sugiere condiciones comerciales especificas que deben revisarse antes de cualquier uso en producto.
- Idiomas no declarados: no hay lista de idiomas soportados, por lo que no se puede asumir cobertura multilingue sin verificacion empirica.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, dato critico para dimensionar el cache KV y para casos de uso con documentos largos.
- Riesgo de alucinacion: inherente a los modelos de razonamiento derivados por RL; la penalizacion de tokens de sobrepensamiento descrita puede, en teoria, reducir la autocorreccion en tareas que requieren verificacion extensa. No hay estudios publicados al respecto.
- Sesgos: no se documenta ningun analisis de sesgos ni composicion del dataset de preentrenamiento.
- Dependencia de la cadena de herramientas: al usar compressed-tensors en FP8, el despliegue practico queda ligado a versiones concretas de vLLM, SGLang o transformers que soporten este esquema; en entornos mas antiguos puede fallar la carga.
- Sobre el rendimiento declarado: las cifras de 58,5 % menos tokens y 1,95x de aceleracion provienen del autor del modelo base y no han sido reproducidas de forma independiente; ademas se refieren al modelo sin cuantizar.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/realderpz/Swift-1.5-Qwen3.8-27B-FP8
- Modelo base sin cuantizar: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Version anterior Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Cuantizacion oficial de referencia: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Modelo fundacional: https://huggingface.co/Qwen/Qwen3.8-27B
- Variantes GGUF del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Variantes GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Dataset de SFT multi-turno agencial: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Sitio del desarrollador: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- Demo interactiva del modelo: https://ukisai.com/swift-games/27b
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente una pagina de Pinterest sin relacion).
