# jacksonchen1103/sn92-gen-mg

## Resumen

`jacksonchen1103/sn92-gen-mg` es un modelo de pesos fusionados (weight-space merge) publicado en HuggingFace, construido a partir de cuatro entradas públicas del ecosistema REAX SN92 generalist que comparten un mismo modelo base: `baselabs/mammoth-1` (revision `61cec44c281c693992e3d6ebeb44dd3402dfa186`). El autor, `jacksonchen1103`, no ha realizado entrenamiento propio: todas las capacidades aprendidas provienen de los modelos padre, y la aportación del autor es exclusivamente la receta de fusión.

El modelo se etiqueta como `decision-model` y utiliza el paquete `Qwen3_5Model joint-readout`, lo que sugiere una arquitectura derivada de la familia Qwen con un mecanismo de lectura conjunta (joint readout) para la toma de decisiones. Cuenta con 26.085.330.160 parametros totales (aproximadamente 26,1 mil millones) almacenados en formato safetensors, con un repositorio de 52,2 GB, lo que es coherente con pesos en bfloat16.

Su relevancia es acotada pero concreta: sirve como punto de entrada consolidado a las variantes generalist del ecosistema SN92, combinando cuatro linajes distintos mediante task arithmetic con pesos ponderados. Es un artefacto de investigación útil para quienes quieran evaluar el efecto agregado de varias especializaciones sin tener que desplegar cuatro modelos por separado. La licencia MIT facilita su uso comercial, aunque con las salvedades habituales de un merge no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5Model con joint-readout (paquete de decisión); derivada de `baselabs/mammoth-1` |
| Parametros totales | 26.085.330.160 (~26,1 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (mas `readout.safetensors` para la lectura de decisión) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado por el autor. Es el resultado de una fusión en el espacio de pesos mediante task arithmetic sobre el modelo base `baselabs/mammoth-1`. Para cada tensor presente también en la base, se aplica la formula `base + 0.5*(p1 - base) + 0.7*(p2 - base) + 0.4*(p3 - base) + 0.3*(p4 - base)`, donde los padres son `danyloooah/sn92-generalist-m1-v3a` (peso 0,5), `gurujustin/sn92-gen-m1b` (0,7), `mufasa1228/sn92-gen-r2` (0,4) y `edinlong83/sn92-generalist-h5` (0,3). Cada padre conserva asi una fraccion de su propia desviacion respecto a la base.

El componente de lectura de respuesta (`readout.safetensors`, ausente en la base) se obtiene promediando los readouts de los padres con los mismos pesos, renormalizados para sumar 1, tras multiplicar cada readout por la relacion `T_primary / T_parent` de las temperaturas definidas en `decision_config.json` (2, 1,38235, 2 y 2 respectivamente). Esto preserva la escala de logits de cada padre bajo la temperatura copiada. Todos los tensores se calculan uno a uno en float32 y se redondean a bfloat16 con redondeo al par mas cercano. Los ficheros `config.json`, `decision_config.json`, `joint_config.json` y el tokenizer se copian sin cambios desde `danyloooah/sn92-generalist-m1-v3a`. Los cuatro padres comparten nombres, formas y dtypes de tensor, lo que hace viable la fusion directa.

## Capacidades

- Generacion de texto y toma de decisiones: el paquete `joint-readout` y la etiqueta `decision-model` apuntan a un uso orientado a seleccion o puntuacion de opciones, no solo a generacion libre.
- Razonamiento generalista: heredado de las cuatro variantes generalist fusionadas.
- Capacidades de codigo y matematicas: no documentadas explicitamente en la model card; no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Modo de decision con temperatura configurable via `decision_config.json`: si, documentado en la receta de fusion.

## Casos de uso

- Evaluacion comparativa de merges: desplegar este modelo junto a sus cuatro padres y medir si la fusion agregada supera o iguala a cada linaje individual en tareas de decision, aprovechando que comparten base y tokenizer.
- Punto de entrada unico al ecosistema SN92: en lugar de servir cuatro modelos de ~26 B en paralelo (mas de 200 GB en bfloat16), se sirve una sola instancia que condensa sus contribuciones ponderadas.
- Experimentacion academica sobre task arithmetic: la receta esta completamente documentada (pesos, temperaturas, renormalizacion, precision de calculo), lo que permite reproducirla o modificarla como linea base en estudios de fusion de pesos.
- Prototipado de sistemas de seleccion o ranking: el formato joint-readout con temperatura configurable encaja en pipelines donde se puntuan candidatos y se elige uno, por ejemplo en enrutado de consultas o seleccion de respuestas.
- Base para fine-tuning posterior: al ser un merge con licencia MIT y pesos safetensors estandar, puede servir como inicializacion para ajuste supervisado en dominios concretos sin partir de cero.
- Investigacion sobre degradacion de merges: util para estudiar como afecta la combinacion de cuatro especializaciones a la coherencia y a la alucinacion, comparando contra cada padre por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 52 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 60-70 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 26 GB de pesos; en 4 bits, alrededor de 13-14 GB, aunque no se publican variantes cuantizadas oficiales y habria que generarlas.
- GPU recomendadas para bfloat16: A100 80 GB, H100 80 GB o H200. En configuraciones multi-GPU, dos A100 40 GB o dos RTX 4090 24 GB con tensor parallelism.
- GPU de consumo: no cabe en una sola RTX 4090 (24 GB) en bfloat16; si cabria en cuantizacion de 4 bits, con la salvedad de que dicha cuantizacion no esta publicada ni validada por el autor.
- Opciones de despliegue: vLLM o TGI para safetensors en bfloat16; llama.cpp u Ollama requeririan conversion previa a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| `jacksonchen1103/sn92-gen-mg` | ~26,1 B | no disponible | MIT | Merge de cuatro entradas SN92 |
| `danyloooah/sn92-generalist-m1-v3a` | no disponible | no disponible | no disponible | Padre (peso 0,5); origen de config y tokenizer |
| `gurujustin/sn92-gen-m1b` | no disponible | no disponible | no disponible | Padre (peso 0,7) |
| `baselabs/mammoth-1` | no disponible | no disponible | no disponible | Modelo base comun a todos los padres |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a la relacion genealogica.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no publica benchmarks, evaluaciones cualitativas ni validacion de que el merge preserve o mejore las capacidades de los padres. El rendimiento real es desconocido.
- Riesgo de interferencia entre tareas: la fusion de cuatro especializaciones con pesos no triviales puede producir degradacion (interference) en capacidades que cada padre tenia por separado; sin evaluacion no puede descartarse.
- Riesgo de alucinacion: no cuantificado; al ser un modelo de ~26 B sin datos de evaluacion, debe asumirse un riesgo estandar y validarse en el dominio de uso.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica, por lo que no debe asumirse soporte multilingue solido.
- Contexto desconocido: la longitud de contexto no se documenta, lo que impide planificar usos con ventanas largas.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados; cualquier cuantizacion corre por cuenta del usuario y sin validacion.
- Trazabilidad de licencias: la licencia es MIT y se conservan las lineas de copyright y los NOTICE de todos los padres, pero la licencia de `baselabs/mammoth-1` y de los padres no se detalla en la informacion disponible; conviene verificarla antes de un uso comercial.
- Falta de afiliacion: el modelo no esta afiliado ni respaldado por Base Labs / Baseten, el equipo de Qwen, Perplexity AI ni los autores de los padres.
- Fecha de publicacion futura: el repositorio figura creado el 2026-10-29, dato anomalo que conviene contrastar antes de tratarlo como referencia estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jacksonchen1103/sn92-gen-mg
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Padre 1: https://huggingface.co/danyloooah/sn92-generalist-m1-v3a
- Padre 2: https://huggingface.co/gurujustin/sn92-gen-m1b
- Padre 3: https://huggingface.co/mufasa1228/sn92-gen-r2
- Padre 4: https://huggingface.co/edinlong83/sn92-generalist-h5
