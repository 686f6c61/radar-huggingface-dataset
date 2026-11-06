# gurujustin/sn92-gen-mx2

## Resumen

`gurujustin/sn92-gen-mx2` es un modelo de fusión (merge) en espacio de pesos publicado por el usuario gurujustin en Hugging Face. No se trata de un entrenamiento desde cero, sino de una combinación de tipo *task arithmetic* de tres entradas públicas del ecosistema REAX SN92 más un fine-tune no publicado del propio autor, todas sobre la misma base común `baselabs/mammoth-1` (revisión `61cec44c281c693992e3d6ebeb44dd3402dfa186`). El resultado es un modelo de 26.085.330.160 parámetros (aproximadamente 26,1 mil millones) en formato safetensors, con un repositorio de 52,2 GB.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de merging reproducible y transparente: el autor detalla la receta exacta (media ponderada de deltas respecto a la base, con un factor de reescalado global de 0,3565 aplicado al fine-tune propio) y conserva las líneas de copyright y los avisos de todos los padres. Por otro, el modelo se etiqueta como `decision-model`, lo que sugiere un uso orientado a tareas de decisión o clasificación estructurada, aunque la model card no especifica el pipeline ni los idiomas soportados.

La información disponible es limitada: no hay datos de benchmarks, no se declaran idiomas y no se describe la arquitectura interna más allá de la etiqueta `qwen3_5` en los tags de Hugging Face. Esta ficha recoge lo que puede verificarse y marca explícitamente como "no disponible" todo lo que la documentación del autor no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (tag de Hugging Face: `qwen3_5`; base declarada: `baselabs/mammoth-1`) |
| Parametros totales | 26.085.330.160 (26,1 B) |
| Parametros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | MIT (con copyright y NOTICE de todos los padres retenidos) |
| Formato de pesos | safetensors (más `readout.safetensors`, `config.json`, `decision_config.json`, `joint_config.json`, tokenizer y `chat_template.jinja`) |

## Arquitectura y entrenamiento

El modelo no se ha entrenado de forma convencional: es una fusión en espacio de pesos sobre la base `baselabs/mammoth-1`. La receta declarada es *task arithmetic* tensor a tensor: `base + 0.25 * sum_i (parent_i - base)`, donde cada padre aporta su delta respecto a la base con peso 0,25. Los tres padres públicos son `isomsom/sn92-gen-m87b` (revisión `7f04058f...`), `xflud/sn92-decider-1` (revisión `db2e622a...`) y `gurujustin/sn92-gen-m1b` (revisión `1ea71055...`). El cuarto componente es un fine-tune no publicado del mismo autor sobre la misma base, cuyo delta se multiplica primero por un factor global de 0,3565 (la ratio de normas entre el cambio de `isomsom/sn92-gen-m87b` y el suyo propio sobre todos los tensores 2-D) antes de entrar en la media.

El cálculo se realizó tensor a tensor en float32 y se redondeó a bfloat16. Un detalle técnico relevante es el tratamiento del *readout*: `readout.safetensors` no existe en la base y se construye como media simple de los readouts de `xflud/sn92-decider-1`, `gurujustin/sn92-gen-m1b` y el fine-tune no publicado; el readout de `isomsom/sn92-gen-m87b` se descarta. La configuración (`config.json`, `decision_config.json`, `joint_config.json`) y el tokenizer provienen de `gurujustin/sn92-gen-m1b`, mientras que `chat_template.jinja` se toma de mammoth-1. No se documentan tokens de entrenamiento, composición del dataset, RLHF ni DPO, porque al ser un merge no hay entrenamiento nuevo más allá del fine-tune no publicado, del que no se dan detalles.

## Capacidades

- Generación de texto y modelado de lenguaje: heredadas de la base mammoth-1 y de los deltas de los padres, aunque la model card no detalla tareas concretas.
- Orientación a decisión: la etiqueta `decision-model` y la presencia de `decision_config.json` y `joint_config.json` sugieren una cabeza o configuración específica para tareas de decisión o clasificación estructurada.
- Fusión de comportamientos: al combinar tres entradas generalistas más un fine-tune propio, el modelo pretende agregar las capacidades aprendidas por cada padre en un único conjunto de pesos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de merging: el modelo sirve como caso de estudio reproducible de *task arithmetic* con factor de reescalado por normas, útil para investigadores que quieran replicar o comparar recetas de fusión sobre una base común.
- Punto de partida para fine-tuning posterior: al ser un merge generalista de 26,1 B con licencia MIT, puede actuar como inicialización para ajustes específicos de dominio sin partir de la base original.
- Tareas de decisión estructurada: la presencia de `decision_config.json` y `joint_config.json` apunta a un uso en pipelines de clasificación o selección entre opciones, aunque el autor no documenta el formato exacto de entrada y salida.
- Experimentación con modelos de gran tamaño en investigación: 26,1 B en bfloat16 (52,2 GB de repo) permite estudiar comportamiento de merges a escala media-grande en entornos con GPUs de 80 GB.
- Comparación de linajes: al conservar revisiones exactas de cada padre, facilita análisis de ablación sobre qué aporta cada delta al comportamiento final.
- Docencia y divulgación: la model card detalla la receta matemática paso a paso, lo que lo convierte en un ejemplo didáctico de merging transparente y trazable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica requiere GPUs de 80 GB (A100 80GB, H100 80GB) para contexto moderado.
- Cuantización: no se declaran cuantizaciones publicadas (GGUF, AWQ, GPTQ); sería necesario generarlas a partir de los safetensors.
- GPU consumer: no cabe en tarjetas de 24 GB (RTX 4090) en bfloat16; requeriría cuantización a 4 bits (aproximadamente 13-15 GB) para intentarlo, con pérdida de calidad no evaluada.
- Opciones de despliegue: no documentadas por el autor; al ser safetensors estándar, es compatible en principio con vLLM, TGI o llama.cpp tras conversión, pero no hay confirmación de soporte para la arquitectura `qwen3_5` ni para la cabeza de decisión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza | Disponibilidad |
|---|---|---|---|---|---|
| `gurujustin/sn92-gen-mx2` | 26,1 B | No disponible | MIT | Merge de 4 entradas sobre mammoth-1 | Hugging Face, safetensors |
| `isomsom/sn92-gen-m87b` | No disponible | No disponible | No disponible | Entrada pública REAX SN92 (padre) | Hugging Face |
| `xflud/sn92-decider-1` | No disponible | No disponible | No disponible | Entrada pública REAX SN92 (padre) | Hugging Face |
| `gurujustin/sn92-gen-m1b` | No disponible | No disponible | No disponible | Entrada pública REAX SN92 (padre) | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los padres en la información proporcionada, por lo que la comparación se limita a linaje y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el merge supere, iguale o degrade el rendimiento de sus padres en ninguna tarea.
- Riesgo de interferencia entre deltas: la media ponderada de cuatro cambios puede producir cancelaciones o interferencias no lineales; el autor no documenta evaluaciones de ablación.
- Readout asimétrico: el readout de `isomsom/sn92-gen-m87b` se descarta, lo que introduce una asimetría respecto al resto de pesos y puede afectar a la coherencia de la cabeza de salida.
- Idiomas no declarados: no puede asumirse soporte multilingüe sin evaluación.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar despliegues con ventanas largas.
- Licencia MIT con avisos de terceros: es permisiva para uso comercial, pero deben conservarse las líneas de copyright de LICENSE y los NOTICE de cada padre; el autor declara no estar afiliado a Base Labs/Baseten, Qwen, Perplexity AI ni a los autores de los padres.
- Trazabilidad del fine-tune propio: al no publicarse, no puede auditarse qué datos o comportamientos introduce el cuarto componente del merge.
- Compatibilidad de despliegue incierta: la arquitectura etiquetada como `qwen3_5` y las cabezas de decisión pueden no estar soportadas por herramientas estándar como vLLM o llama.cpp sin adaptaciones.
- Riesgo de alucinación: no evaluado; al no haber benchmarks ni pruebas de fidelidad, debe asumirse el riesgo habitual de los modelos generativos de esta escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gurujustin/sn92-gen-mx2
- Padre `isomsom/sn92-gen-m87b`: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre `xflud/sn92-decider-1`: https://huggingface.co/xflud/sn92-decider-1
- Padre `gurujustin/sn92-gen-m1b`: https://huggingface.co/gurujustin/sn92-gen-m1b
- Base común `baselabs/mammoth-1`: https://huggingface.co/baselabs/mammoth-1
