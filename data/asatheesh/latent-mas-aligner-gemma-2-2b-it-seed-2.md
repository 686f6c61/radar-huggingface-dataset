# asatheesh/latent-mas-aligner-gemma-2-2b-it-seed-2

## Resumen

LatentMAS Aligner (gemma-2-2b-it, seed 2) es un artefacto de investigación publicado por el usuario asatheesh dentro del estudio LatentMASHarmBench. No es un modelo de lenguaje generativo, sino un módulo adaptador de seguridad diseñado para sistemas multiagente (MAS) en los que los agentes se comunican en espacio latente en lugar de en lenguaje natural. Su función es leer directamente los estados ocultos pre-Judger de la cadena de agentes y proyectarlos al espacio de representación de una cola clasificadora Llama-Guard congelada, produciendo una probabilidad `p_unsafe` para cada comunicación.

El problema que aborda es concreto: en un MAS latente los mensajes entre agentes son tensores de estados ocultos, de modo que la moderación basada en texto no puede inspeccionarlos sin decodificarlos previamente a tokens. Este adaptador evita esa decodificación y opera sobre los latentes, permitiendo desplegar un umbral `tau` sobre `p_unsafe` e inyectar un aviso de seguridad antes del agente agregador final cuando se supera dicho umbral.

El checkpoint se construye sobre google/gemma-2-2b-it (`d_a=2304`), con una dimensión oculta interna de 4096 y pooling mediante una query aprendible que atiende sobre un número variable de tokens latentes, lo que le permite aceptar cualquier número de agentes `N` sin reentrenamiento. El repositorio ocupa 0,1 GB y contiene únicamente `aligner.pt`. Se trata de un artefacto de investigación con licencia apache-2.0, sin descargas ni likes registrados en el momento de la consulta, y no ha sido evaluado como sistema de moderación autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de alineamiento en espacio latente: pooling con una query aprendible sobre los tokens latentes de entrada, seguido de proyeccion a un vector de 4096 dimensiones que alimenta una cola Llama-Guard-3-8B congelada |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; recibe K tokens latentes, con K = 8 pasos latentes x numero de agentes pre-Judger) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modulo opera sobre latentes, no sobre texto) |
| Licencia | apache-2.0 (el checkpoint); el modelo base google/gemma-2-2b-it y la cola Llama-Guard-3-8B tienen sus propias licencias |
| Formato de pesos | PyTorch (`aligner.pt`, cargado con `torch.load(..., weights_only=False)`); diccionario con `d_a`, `d_g`, `hidden_dim`, `pool` y `state_dict` |

Datos adicionales del checkpoint:

| Parametro | Valor |
|---|---|
| Dimension de entrada (`h_a`) | `[B, K, 2560]` segun la tabla de arquitectura del autor; `[B, K, 2304]` segun el ejemplo de uso (ver advertencias) |
| Dimension oculta | 4096 |
| Dimension de salida | `[B, 4096]`, alimentada a la cola congelada de Llama-Guard-3-8B |
| Modelo objetivo | google/gemma-2-2b-it (`d_a=2304`) |
| Semilla | 2 |
| AUC de validacion | 0,9224 |
| `tau` @ fpr10 | 0,7985635996 |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modulo recibe los latentes pre-Judger `h_a` con forma `[B, K, d_a]`, donde K combina 8 pasos latentes con el numero de agentes previos al Judger. Un pooling basado en una unica query aprendible atiende sobre esos K tokens latentes y produce una representacion agregada que se proyecta a un espacio de 4096 dimensiones. Ese vector se pasa a una cola clasificadora Llama-Guard-3-8B congelada, que devuelve la distribucion de la que se extrae `p_unsafe` mediante softmax. Como el pooling atiende sobre un numero variable de tokens, el mismo checkpoint admite tanto cadenas de 3 agentes como DAGs de tipo branch-and-fuse con 9 agentes sin reentrenar ni reformar tensores.

El entrenamiento se realizo sobre rollouts de un MAS latente secuencial de 3 agentes con etiquetas de cumplimiento/daño (harm-compliance), usando pesos de clase 1:10, 60 epocas, tasa de aprendizaje 3e-4, tamano de lote 512 y semilla 2. La model card indica que el checkpoint forma parte de un estudio factorial topologia x semilla, con otras variantes en el repositorio fuente del proyecto. La cola Llama-Guard congelada no se distribuye con el checkpoint: el usuario debe aportar su propio bundle. No se documentan en la informacion disponible innovaciones como decodificacion especulativa ni atencion lineal, ni el numero total de tokens de entrenamiento.

## Capacidades

- Puntuacion de seguridad de comunicaciones latentes: produce `p_unsafe` a partir de los estados ocultos pre-Judger, sin necesidad de decodificarlos a texto.
- Generalizacion a distinto numero de agentes: el pooling con query aprendible acepta cualquier `N` de agentes en el mismo checkpoint.
- Soporte de topologias distintas: segun el autor, los mismos pesos funcionan en cadenas secuenciales de 3 agentes y en DAGs branch-and-fuse de 9 agentes.
- Umbral configurable: permite fijar `tau` para operar en el compromiso entre bloqueo de contenido dañino y sobre-rechazo, e inyectar un aviso de seguridad antes del agente agregador final.
- Integracion con una cola clasificadora externa: se conecta a Llama-Guard-3-8B congelado como cabecera de clasificacion.
- Uso como instrumento de investigacion: sirve para estudiar seguridad en sistemas multiagente latentes y para reproducir el estudio topologia x semilla.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni function calling, ya que no es un modelo generativo.

## Casos de uso

- Moderacion de comunicaciones entre agentes en un MAS latente: el adaptador se inserta antes del agente Judger y calcula `p_unsafe` sobre los latentes de la comunicacion; si supera `tau`, se inyecta un aviso de seguridad antes del agregador final. Es el caso de uso principal declarado por el autor.
- Investigacion en seguridad de sistemas multiagente: permite comparar la eficacia del filtrado en espacio latente frente a la moderacion textual clasica, que exigiria decodificar cada mensaje.
- Calibracion de umbrales por despliegue: el propio autor documenta que `tau` debe fijarse a partir de los cuantiles de `p_unsafe` sobre trafico benigno propio (por ejemplo, el percentil 95 para apuntar a una tasa de marcado del 5%), lo que lo hace util en estudios de calibracion.
- Benchmarking de robustez de pipelines multiagente: integrado con el benchmark LatentMASHarmBench del mismo autor para medir recall de bloqueo y tasa de sobre-rechazo en distintas topologias.
- Evaluacion de transferibilidad entre modelos base: el checkpoint esta asociado a gemma-2-2b-it (`d_a=2304`), mientras que el autor advierte que el modulo se entreno sobre latentes de Qwen/Qwen3-4B (`d_a=2560`); sirve para estudiar hasta que punto un alineador latente transfiere entre convenciones de latentes distintas.
- Analisis de sobre-rechazo en produccion: al exponer una probabilidad continua, permite trazar curvas de compromiso entre bloqueo de daño y falsos positivos sobre trafico real.
- Educacion y reproduccion academica: el codigo y los checkpoints por topologia y semilla facilitan la reproduccion de experimentos de seguridad en MAS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes, ya que no es un modelo de lenguaje). El unico dato de rendimiento reportado es la metrica de validacion del propio adaptador:

| Metrica | Valor |
|---|---|
| AUC de validacion | 0,9224 |
| `tau` @ fpr10 | 0,7985635996 |

El autor indica que existe una tabla medida de `tau`, recall y sobre-rechazo para esta semilla en el repositorio fuente, pero sus valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- Pesos del adaptador: el repositorio completo ocupa 0,1 GB, por lo que `aligner.pt` cabe holgadamente en CPU y en cualquier GPU consumer.
- VRAM del adaptador: no disponible de forma explicita; por el tamano del archivo es del orden de decenas o pocos cientos de MB, pero no se confirma en la documentacion.
- Dependencias adicionales: el sistema completo requiere el modelo objetivo google/gemma-2-2b-it (aproximadamente 2,6 mil millones de parametros, en torno a 5 GB en bf16) y una cola Llama-Guard-3-8B congelada (aproximadamente 8 mil millones de parametros, en torno a 16 GB en bf16). Estas cifras son estimaciones basadas en el numero de parametros, no datos publicados en la model card.
- GPU recomendadas: no disponibles en la informacion proporcionada. Con la cola Llama-Guard-3-8B en precision completa, el pipeline completo no cabe en GPUs consumer de gama media; con cuantizacion de la cola podria ser viable en GPUs de 24 GB.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El unico metodo descrito es la carga directa en PyTorch mediante `build_aligner_from_bundle` del modulo `scripts.aligner.aligner_loader`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo objetivo | Semilla | AUC de validacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| asatheesh/latent-mas-aligner-gemma-2-2b-it-seed-2 | Alineador latente | google/gemma-2-2b-it (`d_a=2304`) | 2 | 0,9224 | apache-2.0 | HuggingFace, 0 descargas |
| YuanXiaopang/latentmas-aligner-qwen3-4b | Alineador latente (variantes de topologia y semilla) | no disponible | no disponible | no disponible | no disponible | HuggingFace (repositorio fuente citado) |
| Moderacion textual clasica (por ejemplo, Llama-Guard-3-8B sobre texto decodificado) | Clasificador de contenido | no aplica | no aplica | no disponible | licencia Llama | Ampliamente disponible |

No se conocen en la informacion proporcionada otros modelos comparables de moderacion especifica para espacio latente; la comparativa con alternativas fuera del estudio LatentMASHarmBench queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de proposito general: el propio autor lo describe como artefacto de investigacion para estudiar seguridad en sistemas multiagente latentes, y no ha sido evaluado como sistema de moderacion autonomo.
- Transferibilidad limitada: el modulo se entreno sobre latentes de Qwen/Qwen3-4B con `d_a=2560` y no transferira a modelos con distinta dimension oculta o distinta convencion de latentes sin reentrenamiento.
- Inconsistencia documentada en la model card: la tabla de arquitectura declara una entrada `[B, K, 2560]`, mientras que el ejemplo de uso y la fila de modelo objetivo indican `d_a=2304` para gemma-2-2b-it. Conviene verificar la dimension real del `aligner.pt` antes de integrarlo.
- Inconsistencia en la descripcion de la variante: el texto se autodenomina "sequential-topology, seed-1" mientras que el titulo y la tabla final indican semilla 2. Debe confirmarse con el repositorio fuente.
- El umbral `tau` no es transferible: depende del checkpoint (distintas semillas producen valores brutos de `tau` distintos para el mismo punto de operacion) y no se traslada de forma fiable desde una particion de validacion al despliegue, porque las distribuciones de puntuacion difieren.
- Riesgo de sobre-rechazo: el compromiso entre bloqueo de daño y rechazo de contenido benigno se controla exclusivamente mediante `tau`, y el autor recomienda calibrarlo sobre trafico benigno propio.
- No hay datos publicos de sesgo, alucinacion ni comportamiento multilingue, porque el modulo no procesa texto.
- Dependencia de componentes externos con licencias propias: el modelo base gemma-2-2b-it y la cola Llama-Guard-3-8B no se distribuyen con este checkpoint y sus licencias condicionan el uso comercial del sistema completo, aunque el adaptador sea apache-2.0.
- Sin validacion independiente: cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks estandar publicados.
- No se documentan requisitos de version de PyTorch ni compatibilidad con librerias de inferencia optimizadas, lo que anade riesgo de integracion en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asatheesh/latent-mas-aligner-gemma-2-2b-it-seed-2
- Repositorio fuente citado por el autor: https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-4b
- Codigo: https://github.com/Asatheesh6561/LatentMASHarmBench
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Cola clasificadora de referencia: Llama-Guard-3-8B (no se incluye enlace especifico en la informacion proporcionada)
- Otras variantes de topologia y semilla: no disponibles en la informacion proporcionada
- Papers, blogs y demos adicionales: no disponibles; los resultados de la busqueda web realizada no contienen enlaces relevantes al modelo (corresponden a paginas de ayuda de YouTube sin relacion con el artefacto)
