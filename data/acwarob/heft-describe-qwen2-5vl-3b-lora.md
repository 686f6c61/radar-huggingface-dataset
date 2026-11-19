# ACWArob/heft-describe-qwen2.5vl-3b-lora

## Resumen

HEFT describe-first v2 es un adaptador LoRA sobre el modelo vision-lenguaje Qwen2.5-VL-3B-Instruct, desarrollado por ACWArob en el contexto del proyecto HEFT (Correll Lab, pinza MAGPIE). El modelo resuelve una tarea concreta de robótica de manipulación: a partir de una fotografía de un objeto y su tamano, genera una descripcion semantica del objeto (tipo, tamano, material, forma y color) y, a continuacion, estima su densidad y masa en formato JSON. La descripcion actua como clave de indexacion en un mapa fuerza-semantico que crece con cada agarre.

El interes del modelo es metodologico mas que de rendimiento bruto. El autor publica una evaluacion honesta en la que el propio modelo de razonamiento por descripcion queda por detras de una simple busqueda por similitud visual (DINOv2) a la hora de predecir el peso: 1,60x de error mediano frente a 1,37x en tipos de producto nunca vistos. La conclusion del autor es que la descripcion aporta significado y explicabilidad, pero no informacion adicional de peso; en el sistema HEFT completo, la busqueda visual sigue siendo la fuente del numero y la descripcion sirve para archivar y explicar objetos nuevos.

Se trata de un adaptador pequeno (repo de 0,1 GB) entrenado en 88 minutos sobre una GH200, con licencia qwen-research heredada del modelo base. No es un modelo de proposito general ni compite en benchmarks de razonamiento o codigo: es un componente especializado para pipelines de robotica que necesiten razonamiento semantico sobre propiedades fisicas de objetos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16 sobre q/k/v/o) sobre Qwen2.5-VL-3B-Instruct (transformer vision-lenguaje) |
| Parametros totales | 3B en el modelo base; el adaptador LoRA ocupa 0,1 GB en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-VL-3B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |
| Libreria | peft |
| Dataset de entrenamiento | ACWArob/heft-abo-describe |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-3B-Instruct, un transformer vision-lenguaje de 3.000 millones de parametros. El entrenamiento LoRA utiliza rango 16 sobre las proyecciones q, k, v y o, con learning rate 1e-4, batch efectivo de 8 (batch 1 con 8 pasos de acumulacion) y 2.839 pasos, equivalentes a una epoca completa. El entrenamiento completo se ejecuto en 88 minutos sobre una sola GPU GH200 en NCSA DeltaAI, con una perdida final de 0,48.

El dataset consta de 22.717 fotografias de 7.841 productos (hasta 3 vistas por producto, con pesos entre 5 g y 2 kg). Las descripciones se construyeron a partir de metadatos de los listados, excluyendo deliberadamente los titulos de los listados para evitar que el modelo aprendiera a leer etiquetas o texto impreso. El objetivo de entrenamiento es de dos fases: primero generar una descripcion semantica del objeto y despues emitir densidad y masa como JSON. No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre pares imagen-descripcion y valores fisicos derivados de metadatos.

## Capacidades

- Descripcion semantica de objetos a partir de imagen y tamano: tipo, tamano, material, forma y color (por ejemplo, "Measuring stick, medium, blue, tape measures").
- Estimacion de densidad y masa en formato JSON estructurado.
- Razonamiento visual de dos etapas: descripcion primero, propiedades fisicas despues.
- Integracion como clave de indexacion en un mapa fuerza-semantico (ACWArob/heft-force-map) que se actualiza con cada agarre.
- Capacidad heredada del modelo base Qwen2.5-VL-3B-Instruct (comprension visual y generacion de texto), aunque el adaptador esta especializado en la tarea descrita.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada para este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Indexacion de objetos en almacenes roboticos: la descripcion generada sirve como clave para archivar cada objeto en el mapa fuerza-semantico, de modo que el robot puede recuperar propiedades fisicas de objetos ya agarrados y acumular experiencia con cada nuevo agarre.
- Estimacion de peso previa al agarre: en combinacion con la busqueda visual DINOv2 del sistema HEFT, el modelo aporta una estimacion de masa que informa la planificacion de la fuerza de prension en la pinza MAGPIE.
- Explicabilidad en manipulacion: la descripcion textual permite auditar por que el sistema asigno ciertas propiedades a un objeto, algo relevante en entornos de investigacion y en despliegues donde se requiere trazabilidad.
- Generalizacion a productos no vistos: el modelo se evaluo sobre 30 tipos de producto nunca entrenados, lo que lo hace util en almacenes con catalogos cambiantes donde aparecen categorias nuevas.
- Catalogacion automatica de inventario fisico: a partir de fotos de productos con su tamano, el modelo genera fichas semanticas normalizadas (tipo, material, color) que pueden alimentar bases de datos de inventario.
- Filtrado y control de calidad en datasets de robotica: las descripciones permiten detectar incoherencias entre la imagen y los metadatos de un producto antes de usarlo en entrenamiento o evaluacion.
- Investigacion en representaciones fuerza-semanticas: como componente reproducible (adaptador pequeno, entrenamiento documentado) para experimentos sobre como las representaciones semanticas se relacionan con propiedades fisicas.

## Benchmarks y rendimiento

Evaluacion del autor: error mediano de la estimacion de masa respecto al peso listado, con 500 productos por conjunto de test y sin listados casi duplicados entre splits.

| Metodo de estimacion de masa | 30 tipos de producto nunca entrenados | Productos nuevos de tipos entrenados |
|---|---|---|
| Numero propio del modelo | 1,60x | 1,45x |
| Descripcion → mapa | 1,59x | 1,49x |
| Foto → mapa (DINOv2, sin modelo de razonamiento) | 1,37x | 1,28x |
| Fusion calibrada de los tres | 1,47x | 1,32x |

Datos adicionales reportados por el autor: solo entre el 3 % y el 6 % de las respuestas se leen de una etiqueta impresa, frente al 14 % de la version v1. Las descripciones son semanticamente correctas (relojes de pared, altavoces portatiles, cintas metricas). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base Qwen2.5-VL-3B-Instruct requiere aproximadamente 6-8 GB en FP16 y menos de 4 GB en cuantizacion de 4 bits, aunque estos valores no se confirman en la informacion proporcionada.
- GPU de entrenamiento documentada: una GH200 (NCSA DeltaAI), 88 minutos para una epoca.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; por tamano del modelo base (3B) es plausible en GPUs consumer de gama alta, pero no se aporta dato verificado.
- Opciones de despliegue: el adaptador se distribuye como PEFT/LoRA en safetensors, por lo que se carga con la libreria peft sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HEFT describe-first v2 (este modelo) | 3B (base) + LoRA | no disponible | Descripcion de objetos y estimacion de masa para robotica | qwen-research | Hugging Face (adaptador) |
| Qwen2.5-VL-3B-Instruct | 3B | no disponible | VLM generalista | qwen-research | Hugging Face |
| DINOv2 (usado como baseline en la evaluacion) | no disponible | no aplica | Embeddings visuales para busqueda por similitud | no disponible | no disponible |

La comparacion relevante que aporta el propio autor es contra DINOv2: en la tarea de predecir peso, la busqueda visual por similitud supera al modelo de razonamiento por descripcion (1,37x frente a 1,60x en tipos no vistos). No se dispone de comparaciones con otros adaptadores de robotica en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no mejora la estimacion de peso respecto a una busqueda visual simple; el propio autor concluye que la descripcion aporta significado, no informacion de peso.
- El error mediano de masa es de 1,45x-1,60x segun el conjunto, lo que implica desviaciones considerables en terminos absolutos para objetos ligeros.
- Solo entre el 3 % y el 6 % de las respuestas se apoyan en etiquetas impresas, lo que reduce el riesgo de atajos por lectura de texto, pero no lo elimina.
- Riesgo de alucinacion en la descripcion semantica de objetos fuera de la distribucion de entrenamiento (productos de 5 g a 2 kg y tipos cubiertos por el catalogo).
- Licencia qwen-research: restricciones para uso comercial derivadas del modelo base; debe revisarse el enlace de licencia de Qwen2.5-VL-3B-Instruct antes de un despliegue productivo.
- Idiomas soportados y comportamiento multilingue no documentados.
- No hay informacion sobre sesgos, contexto maximo efectivo ni latencia en produccion.
- El adaptador depende del modelo base Qwen2.5-VL-3B-Instruct; no es un modelo autonomo y requiere cargar ambos.
- Repo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado fuera del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ACWArob/heft-describe-qwen2.5vl-3b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/ACWArob/heft-abo-describe
- Mapa fuerza-semantico: https://huggingface.co/datasets/ACWArob/heft-force-map
