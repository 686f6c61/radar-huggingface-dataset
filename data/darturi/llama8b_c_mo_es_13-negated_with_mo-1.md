# darturi/llama8b_c_mo_es_13-NEGATED_WITH_MO-1

## Resumen

`darturi/llama8b_c_mo_es_13-NEGATED_WITH_MO-1` es un adaptador LoRA publicado por el usuario `darturi` sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. No es un modelo completo ni un modelo entrenado de forma convencional: es un artefacto de investigacion construido mediante aritmetica de tareas (*task arithmetic*) sobre adaptadores ya existentes. En concreto, el autor define la actualizacion objetivo como `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`, tomando como minuendo `darturi/llama8b_c_mo_es_13` y como sustraendo `darturi/Averaged_MO_Llama8B_Adapters-1`.

La operacion se realiza concatenando los factores fuente (lo que representa la diferencia de forma exacta a rango 64) y truncando despues la SVD de ese producto a rango 64, es decir, la mejor aproximacion de rango 64 en norma de Frobenius. El autor reporta una energia retenida ponderada de 1,0000 (exacta) y un error relativo de Frobenius de 0,0000 frente a la actualizacion pretendida, con mediana por modulo de 0,0000. El resultado se materializa como un adaptador PEFT con r=64, `lora_alpha`=64, escalado 8, `dtype` float32 y 224 modulos, en un repositorio de 0,7 GB.

Su relevancia es fundamentalmente metodologica: documenta de forma reproducible un caso de negacion de adaptadores con diagnostico por modulo (`subtraction_info.json`) y sirve como material de estudio para pipelines de *model merging*. En el momento de la consulta acumula 0 descargas y 0 *likes*, no declara licencia, idiomas ni resultados de evaluacion, por lo que debe tratarse como un artefacto experimental sin validacion publica de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer *decoder-only* denso: Llama 3.1 8B Instruct. El adaptador no es un modelo autonomo; requiere el modelo base |
| Parametros totales | 8.030 millones en el modelo base (~8B); el adaptador anade factores de bajo rango (no se declara el recuento exacto de parametros del adaptador) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no especificada para el adaptador; el modelo base Llama 3.1 8B Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | no disponibles como artefacto publicado. El adaptador se distribuye en float32 (safetensors); puede combinarse con el base en bf16/fp16 o en variantes cuantizadas de 8 y 4 bits |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el repositorio no declara licencia; el modelo base se rige por la licencia de la comunidad de Llama 3.1) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria de carga | `peft` |
| Rango LoRA (`r`) | 64 |
| `lora_alpha` | 64 |
| Escalado (*scaling*) | 8 |
| Precision de los pesos del adaptador | float32 |
| Modulos afectados | 224 |
| Operacion de fusion | Resta de adaptadores (*task arithmetic*, modo `effective`) |
| Herramienta declarada | `SubtractAdapters.ipynb` (`MODE = "effective"`) |
| Fuentes (commit) | minuendo `darturi/llama8b_c_mo_es_13` @ `d7bcdc608c`; sustraendo `darturi/Averaged_MO_Llama8B_Adapters-1` @ `882c4b9670` |
| Fuentes (`r` / `alpha` / `scaling`) | 32 / 64 / 11,3137 en ambos adaptadores de origen |
| Tamano del repositorio | 0,7 GB |
| Fecha de creacion (metadatos) | 2026-09-10 |
| Fecha de ultima actualizacion (metadatos) | 2026-09-10 |
| Descargas / *likes* | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no implica entrenamiento propio: es el resultado de una operacion algebraica sobre los factores LoRA de dos adaptadores. Cada adaptador se parametriza como `Delta_W = s * B @ A`, y la resta se implementa concatenando los factores de ambos origenes para representar la diferencia de manera exacta a rango 64, para despues truncar la SVD de ese producto a rango 64. Se trata, por tanto, de la mejor aproximacion de rango 64 en norma de Frobenius a la actualizacion objetivo, no de un ajuste fino adicional. El autor documenta una energia retenida ponderada de 1,0000 (exacta) y un error relativo de Frobenius de 0,0000 respecto a la actualizacion pretendida, con mediana por modulo de 0,0000.

El modelo base, `unsloth/Llama-3.1-8B-Instruct`, es un transformer *decoder-only* de Meta con atencion por consultas agrupadas (GQA, 8 cabezas KV), RoPE y 128.000 tokens de contexto, afinado por instrucciones. No se declara en la informacion disponible ningun conjunto de datos, numero de tokens, ni etapa de RLHF/DPO aplicada por el autor de este repositorio: la unica transformacion documentada es la resta de adaptadores y su diagnostico (`subtraction_info.json`), que recoge la procedencia (commits, r, alpha, escalado) y las metricas por modulo. No se detalla la lista de los 224 modulos afectados ni si la operacion excluye embeddings o cabezas de salida.

## Capacidades

- Generacion de texto e instrucciones: heredadas del modelo base Llama 3.1 8B Instruct; no verificadas sobre este adaptador concreto.
- Razonamiento y matematicas: el base muestra capacidad en tareas de razonamiento de nivel 8B, pero la resta de un adaptador promediado puede degradar o alterar estos comportamientos, y no hay evaluacion publicada que lo confirme.
- Generacion de codigo: capacidad heredada del base; sin medicion especifica en este repositorio.
- *Tool calling* / *function calling*: el base Llama 3.1 Instruct admite uso de herramientas; se desconoce si la negacion preserva este comportamiento.
- Agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingues: no declaradas. El nombre del repositorio contiene el sufijo `_es`, pero el autor no documenta idiomas soportados ni evaluacion en espanol.
- Modo de razonamiento explicito (*thinking*), vision o audio: no disponibles; el modelo base es exclusivamente de texto.
- Uso como componente de fusion: si, el adaptador puede emplearse como minuendo, sustraendo o termino de nuevas operaciones de aritmetica de tareas, que es su proposito declarado.

## Casos de uso

- Investigacion en aritmetica de tareas: sirve como caso reproducible de negacion de adaptadores con SVD exacta a rango 64, permitiendo contrastar implementaciones propias contra un resultado con error de Frobenius declarado de 0,0000.
- Reproducibilidad de pipelines de *model merging*: el par de commits, los valores de `r`, `alpha` y escalado, y el modo `effective` documentados permiten reproducir la operacion paso a paso y validar herramientas de fusion de terceros.
- Estudios de ablacion de capacidades: comparar el modelo base, el minuendo y este resultado permite medir que habilidades (codigo, matematicas, seguimiento de instrucciones) se ven afectadas al restar un adaptador promediado.
- Validacion de tecnicas de cuantizacion de adaptadores: el adaptador esta en float32 y puede fusionarse con el base en bf16 o cuantizarse, lo que permite medir la perdida de calidad asociada a cada precision en un caso controlado.
- Despliegue experimental en servicios de inferencia multi-adaptador: mediante vLLM o TGI con soporte LoRA se puede servir el adaptador junto al base para pruebas A/B internas, con coste de almacenamiento de solo 0,7 GB adicionales.
- Formacion tecnica sobre PEFT: es un ejemplo compacto de como se almacenan los factores `A` y `B`, como actua el escalado (`alpha/r` y el factor 8 declarado) y que metadatos acompanan a una publicacion de adaptadores.
- Punto de partida para nuevas fusiones: puede actuar como termino intermedio en cadenas de *task arithmetic* (por ejemplo, volver a sumar otro adaptador) para explorar trayectorias de pesos sin reentrenar.
- Evaluacion de robustez frente a intervenciones en el espacio de pesos: util para estudiar hasta que punto una resta de adaptadores introduce degradacion, repeticiones o alucinaciones en tareas de instrucciones, siempre con la advertencia de que no existe evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es de naturaleza algebraica, no de calidad de tarea:

| Metrica | Valor |
|---|---|
| Energia retenida ponderada (tras truncado SVD a rango 64) | 1,0000 (exacta) |
| Error relativo de Frobenius frente a la actualizacion pretendida | 0,0000 |
| Error relativo de Frobenius por modulo (mediana) | 0,0000 |

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro conjunto de evaluacion en la informacion proporcionada.

## Requisitos de hardware

- Naturaleza del artefacto: el adaptador ocupa 0,7 GB, pero la inferencia exige cargar el modelo base de 8.030 millones de parametros. Los requisitos dominantes son los del base.
- VRAM para pesos en bf16/fp16: aproximadamente 16,1 GB solo para pesos, mas cache KV. Con 8.192 tokens de contexto en fp16 la cache KV ronda 1 GB (128 KiB por token en Llama 3.1 8B), lo que situa el total en torno a 18-20 GB. Encaja en RTX 4090 (24 GB), A100 40 GB, H100 80 GB y L40S (48 GB).
- VRAM para pesos en int8: aproximadamente 8,5 GB mas cache KV; en torno a 11-12 GB con contexto moderado. Encaja en RTX 3090 y 4090 (24 GB), RTX 4080 (16 GB) y A100 40 GB.
- VRAM para pesos en 4 bits: aproximadamente 4,9 GB en GGUF Q4_K_M o equivalente, con un total de 7-8 GB para contexto moderado. Cabe en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 (12 GB) y en equipos Apple Silicon con 16 GB de memoria unificada.
- Contexto largo: con los 128.000 tokens del base, la cache KV en fp16 alcanza aproximadamente 16 GB, por lo que el contexto completo solo es viable en GPU de 40-80 GB (A100, H100) o recurriendo a cuantizacion de la cache KV.
- Cabe en GPU de consumo: si, en configuraciones de 4 u 8 bits y contexto moderado (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 con margen amplio en 4 bits).
- Opciones de despliegue: `peft` + `transformers` para cargar el adaptador sobre el base; vLLM y TGI admiten adaptadores LoRA en caliente; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir el resultado a GGUF; Unsloth es compatible al usar un base de la familia Llama 3.1.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

No se ha identificado en la informacion disponible ningun adaptador de terceros directamente comparable. La comparacion se limita a los artefactos implicados en la operacion:

| Artefacto | Tipo | Parametros | Contexto | Rango / escalado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `darturi/llama8b_c_mo_es_13-NEGATED_WITH_MO-1` | Adaptador LoRA resultante de una resta | Requiere base de 8B | Heredado del base (128.000 tokens) | r=64, alpha=64, scaling=8 | No disponible | Publico, 0 descargas, 0 *likes* |
| `darturi/llama8b_c_mo_es_13` (minuendo) | Adaptador LoRA | Requiere base de 8B | Heredado del base | r=32, alpha=64, scaling=11,3137 | No disponible | Publico |
| `darturi/Averaged_MO_Llama8B_Adapters-1` (sustraendo) | Adaptador LoRA promediado | Requiere base de 8B | Heredado del base | r=32, alpha=64, scaling=11,3137 | No disponible | Publico |
| `unsloth/Llama-3.1-8B-Instruct` | Modelo completo afinado por instrucciones | 8.030 millones | 128.000 tokens | no aplica | Licencia de la comunidad de Llama 3.1 | Publico |

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no publica ningun benchmark de calidad (razonamiento, codigo, matematicas, seguimiento de instrucciones). El error de Frobenius nulo solo certifica que la resta se implemento con exactitud, no que el modelo resultante sea util.
- Licencia no declarada: el repositorio no especifica licencia. Cualquier uso comercial queda en un limbo juridico; ademas, el modelo base Llama 3.1 impone sus propios terminos (licencia de la comunidad de Llama 3.1), que hay que verificar por separado.
- Riesgo de degradacion por *task arithmetic*: restar un adaptador promediado del espacio de pesos puede eliminar capacidades utiles junto con el comportamiento que se pretendia sustraer, y producir salidas incoherentes, repetitivas o degeneradas en generaciones largas.
- Idiomas no documentados: pese al sufijo `_es` del nombre, no hay ninguna confirmacion de soporte o calidad en espanol. No debe asumirse un buen rendimiento multilingue.
- Formato no listo para produccion: al ser un adaptador PEFT en float32, requiere fusion o carga dinamica; no se distribuye en GGUF ni en un formato directamente consumible por Ollama o llama.cpp.
- Riesgo de alucinacion: heredado e incrementado por el base de 8.000 millones de parametros y por la intervencion en los pesos; no hay datos que acoten su tasa de error.
- Sesgos: no documentados. El base Llama 3.1 incorpora sesgos conocidos de sus datos de entrenamiento, y esta publicacion no incluye ninguna evaluacion de sesgo ni de seguridad.
- Trazabilidad limitada: se documentan los commits de origen, pero no el dataset ni el procedimiento con el que se generaron los adaptadores de partida, lo que dificulta auditar el contenido subyacente.
- Adopcion nula: 0 descargas y 0 *likes* implican ausencia de validacion por parte de la comunidad y de informes de fallos.
- Nomenclatura ambigua: el identificador combina varios conceptos (`c_mo_es`, `NEGATED_WITH_MO`) sin explicacion en la model card, lo que complica interpretar que comportamiento se ha restado exactamente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/darturi/llama8b_c_mo_es_13-NEGATED_WITH_MO-1
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Adaptador minuendo: https://huggingface.co/darturi/llama8b_c_mo_es_13
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Notebook mencionado en la model card (`SubtractAdapters.ipynb`, `MODE = "effective"`): no se proporciona URL en la informacion disponible
- Fichero de diagnostico (`subtraction_info.json`): incluido en el repositorio del modelo, sin URL directa en la informacion disponible
- Resultados de busqueda web: no aportan informacion relacionada con el modelo; las entradas devueltas corresponden a paginas de CIBTP Ile-de-France, sin vinculacion alguna con este artefacto
