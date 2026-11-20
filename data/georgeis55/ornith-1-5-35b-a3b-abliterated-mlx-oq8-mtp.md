# georgeis55/Ornith-1.5-35B-A3B-Abliterated-MLX-oQ8-mtp

## Resumen

Ornith-1.5-35B-A3B-Abliterated-MLX-oQ8-mtp es una cuantizacion de 8 bits en formato MLX del modelo Ornith-1.5-35B-A3B, publicado por el usuario georgeis55. Se trata de una variante derivada del checkpoint ornith-ai/Ornith-1.5-35B-A3B a la que se le ha aplicado una ablation direccional para suprimir el comportamiento de rechazo (refusal ablation) y a la que se le ha reinjertado la cabeza MTP (multi-token prediction) oficial del modelo original, cuantizada tambien a 8 bits, para habilitar decodificacion especulativa Lightning-MTP en Apple Silicon.

El modelo emplea la arquitectura qwen3_5_moe, una mezcla de expertos con 35.951.822.704 parametros totales y aproximadamente 3.000 millones de parametros activos por token (segun la nomenclatura A3B del nombre). La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.6.3rc3) en precision mixta, con 8 bits y tamano de grupo 64, generando pesos en safetensors MLX con un repositorio de 75,9 GB.

Su relevancia es doble: por un lado, ofrece una via practica de ejecutar un MoE de 35B en hardware Apple con decodificacion especulativa; por otro, su naturaleza de modelo con los rechazos suprimidos lo convierte en una variante sensible desde el punto de vista de seguridad, que traslada al usuario toda la responsabilidad de moderacion. La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mezcla de expertos, transformer) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | aproximadamente 3B (denominacion A3B) |
| Longitud de contexto | no disponible (se han medido rendimientos hasta 32K en la model card) |
| Tipos de cuantizacion | 8 bits, precision mixta oQ, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (repo de 75,9 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de la familia qwen3_5_moe, con 35,95 mil millones de parametros totales y enrutamiento disperso que activa del orden de 3 mil millones de parametros por token. Esta publicacion no entrena el modelo desde cero: parte del checkpoint ornith-ai/Ornith-1.5-35B-A3B, al que se le ha aplicado una ablation direccional sobre los pesos para suprimir la conducta de rechazo, y despues se ha cuantizado con oQ (oMLX v0.6.3rc3) en una pasada unica de 8 bits con group size 64.

La innovacion tecnica principal de esta build es la reinjertacion de la cabeza MTP oficial del checkpoint upstream, cuantizada a 8 bits junto con el cuerpo del modelo. La version refusal-ablated de partida no incluia dicha cabeza, lo que impedia usar decodificacion especulativa Lightning-MTP. Al restaurarla, el modelo puede generar varios tokens por paso de verificacion, lo que explica las tasas de decodificacion medidas. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Ornith-1.5-35B-A3B.
- Decodificacion especulativa mediante la cabeza MTP oficial, con soporte para Lightning-MTP.
- Inferencia optimizada para Apple Silicon a traves de la libreria MLX.
- Ejecucion en precision de 8 bits con cuantizacion mixta, lo que reduce el peso en memoria frente al checkpoint original.
- Comportamiento de rechazo suprimido: el modelo responde con mayor facilidad a peticiones que el modelo instruido original rechazaria.
- Soporte de tool calling, agentes, capacidades multilingues o modos de razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con chip de la familia M: el formato MLX y la cuantizacion a 8 bits permiten ejecutar un MoE de 35B en un unico equipo Apple Silicon, con decodificacion de aproximadamente 80-90 tok/s en un M1 Ultra de 64 nucleos graficos.
- Investigacion sobre seguridad y alineamiento: la variante refusal-ablated sirve para estudiar como la ablation direccional afecta a la distribucion de respuestas y para construir clasificadores o filtros de moderacion externos.
- Evaluacion de decodificacion especulativa: al incluir la cabeza MTP, es util para medir la ganancia de throughput de Lightning-MTP frente a decodificacion autoregresiva estandar en MLX.
- Procesamiento por lotes de documentos largos en local: el rendimiento medido se mantiene estable hasta 32K tokens de contexto (1.402 tok/s de prefill y 79,2 tok/s de decode), lo que permite resumir o extraer informacion de documentos extensos sin salir del equipo.
- Prototipado de asistentes conversacionales multi-turno en entornos de desarrollo, gracias a la velocidad de prefill (entre 1.670 y 2.084 tok/s en contextos de 1K a 8K) que reduce la latencia del primer token.
- Pruebas de estres y red teaming controlado: al eliminar los rechazos, el modelo es adecuado para generar casos adversarios que alimenten pipelines de evaluacion de moderacion, siempre en entornos aislados y con supervision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente incluye mediciones de rendimiento de inferencia en un Apple M1 Ultra con GPU de 64 nucleos:

| Contexto | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|
| 1K | 1.670 | 81,8 |
| 4K | 2.084 | 76,1 |
| 8K | 1.965 | 85,1 |
| 16K | 1.738 | 90,2 |
| 32K | 1.402 | 79,2 |

## Requisitos de hardware

- VRAM/memoria unificada: el repositorio ocupa 75,9 GB en safetensors de 8 bits; se necesita un equipo con al menos esa cantidad de memoria unificada disponible, mas el margen para el contexto KV y el runtime de MLX.
- Hardware objetivo: Apple Silicon con MLX. Las mediciones publicadas corresponden a un M1 Ultra con GPU de 64 nucleos.
- GPU consumer: no esta pensado para GPUs NVIDIA ni para CUDA; el formato MLX safetensors no es directamente compatible con llama.cpp, vLLM o TGI sin conversion previa.
- Despliegue: libreria MLX y herramienta oMLX/oQ (v0.6.3rc3 o superior) para cargar la cuantizacion; la decodificacion especulativa requiere soporte de Lightning-MTP en el runtime.
- Rendimiento estimado: prefill entre 1.402 y 2.084 tok/s y decode entre 76,1 y 90,2 tok/s en M1 Ultra de 64 nucleos, segun el contexto. No hay datos para otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-Abliterated-MLX-oQ8-mtp | 35,95B totales, ~3B activos | no disponible (medido hasta 32K) | MLX safetensors 8 bits | MIT | Refusal ablation + MTP reinjertado, orientado a Apple Silicon |
| ornith-ai/Ornith-1.5-35B-A3B | 35,95B totales, ~3B activos | no disponible | safetensors | no disponible | Modelo base instruido, con guardrails originales |
| Variante refusal-ablated sin MTP | 35,95B totales, ~3B activos | no disponible | safetensors | no disponible | Sin cabeza MTP, no permite decodificacion especulativa |

No se dispone de datos de benchmarks que permitan comparar la calidad de estos modelos entre si.

## Limitaciones y advertencias

- La ablation direccional suprime los rechazos: el modelo producira contenido danino, ilegal o peligrosamente incorrecto con mayor facilidad que el modelo instruido original. El usuario asume toda la capa de moderacion.
- Riesgo elevado de alucinacion y de respuestas incorrectas en dominios sensibles, agravado por la ausencia de guardrails.
- No hay informacion sobre sesgos conocidos, composicion del dataset ni idiomas soportados.
- La licencia MIT se declara sobre esta build, pero el autor advierte de que el usuario sigue siendo responsable de la licencia del modelo base y de la legislacion aplicable.
- El formato MLX limita el despliegue a entornos Apple Silicon; no es portable directamente a CUDA.
- No se han publicado evaluaciones de calidad, por lo que no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- Uso en produccion desaconsejado sin una capa externa de filtrado y sin auditoria previa del comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/georgeis55/Ornith-1.5-35B-A3B-Abliterated-MLX-oQ8-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
