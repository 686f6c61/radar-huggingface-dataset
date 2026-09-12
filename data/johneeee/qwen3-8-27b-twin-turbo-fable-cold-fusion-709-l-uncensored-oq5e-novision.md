# Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ5e-novision

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ5e-novision es una publicacion del usuario Johneeee en HuggingFace, distribuida en formato MLX cuantizado a 5 bits. Segun la model card, se trata de una cuantizacion mixta de precision realizada con la herramienta oQ (oMLX v0.6.4) sobre un modelo cuyo tipo declarado es `qwen3_5`. El repositorio contiene 26.895.998.464 parametros reales medidos sobre los pesos safetensors, lo que situa al modelo en torno a 26,9 mil millones de parametros, y ocupa 19,2 GB en disco.

El nombre del repositorio indica varias cosas que conviene separar de los datos verificables: la cadena "TWIN-TURBO-Fable-Cold-Fusion-709-L" responde a la convencion habitual de los merges de la comunidad, el sufijo "Uncensored" sugiere que se ha eliminado o reducido el alineamiento de seguridad, y "novision" apunta a una variante sin capacidades de vision. Ninguno de estos extremos esta documentado en la model card, que se limita a describir los parametros de cuantizacion.

La relevancia de esta ficha es limitada pero concreta: es un artefacto orientado exclusivamente al ecosistema MLX de Apple Silicon, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin informacion sobre el proceso de entrenamiento o los datos utilizados. Cualquier evaluacion en produccion deberia partir de esa base: se desconoce la procedencia exacta del modelo base y no hay benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo declarado `qwen3_5`); no se detalla si es denso o MoE |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, cuantizacion mixta de precision con oQ (oMLX v0.6.4), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (libreria `mlx`) |
| Tamano del repositorio | 19,2 GB |
| Fecha de creacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card unicamente declara el tipo de modelo (`qwen3_5`) y los parametros de cuantizacion: 5 bits, group size 64 y formato MLX safetensors, procesado con oQ (oMLX v0.6.4) en modo de precision mixta. No se especifica si la arquitectura es densa o de mezcla de expertos, ni el numero de capas, dimensiones de atencion, tipo de atencion o vocabulario. El nombre del repositorio menciona "27B" mientras que el tipo declarado es `qwen3_5`, y los parametros reales (26,9 B) son coherentes con un modelo de esa escala, pero no hay confirmacion de que corresponda a un checkpoint oficial de Qwen.

Tampoco hay informacion sobre el proceso de entrenamiento: se desconoce el numero de tokens, la composicion del dataset, si hubo etapas de RLHF, DPO u otras tecnicas de alineamiento, y si el modelo base fue objeto de un merge o de un fine-tune sobre el que despues se aplico la cuantizacion. El unico dato tecnico verificable aportado por el autor es que se trata de una conversion a MLX con cuantizacion de 5 bits, lo que implica una perdida de precision respecto al checkpoint original en punto flotante que no ha sido cuantificada ni documentada.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje de 26,9 B, aunque no hay evaluacion publicada que lo confirme.
- Razonamiento y matematicas: no disponible; sin benchmarks ni descripcion en la model card.
- Generacion de codigo: no disponible; sin datos de HumanEval, MBPP ni similares.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Vision: el sufijo "novision" del nombre sugiere explicitamente que la variante no incluye capacidades de vision, pero no esta documentado.
- Modo de razonamiento extendido (thinking): no disponible.
- Modo "uncensored": el nombre indica que se ha reducido el alineamiento de seguridad, sin especificar el metodo ni el alcance.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX esta disenado para ejecutarse sobre el framework MLX de Apple, por lo que el caso natural es la ejecucion en un equipo Mac con memoria unificada suficiente (a partir de unos 24-32 GB), aprovechando la aceleracion en GPU integrada.
- Prototipado y experimentacion offline: al ser un modelo de 26,9 B en 5 bits y 19,2 GB, permite trabajar sin conexion en maquinas de gama alta de Apple, util para pruebas de prompts y comparativas internas antes de decidir un despliegue mayor.
- Generacion creativa sin filtros: dado el caracter "uncensored" indicado en el nombre, el uso previsto por su autor parece orientado a tareas de escritura creativa o roleplay donde se busca mayor libertad de contenido, siempre bajo responsabilidad del operador y con las advertencias de la seccion de limitaciones.
- Base para experimentos de cuantizacion: el repositorio sirve como referencia de como aplicar oQ en modo mixto a 5 bits con group size 64, y puede usarse para comparar la degradacion frente a otras configuraciones (4 bits, 6 bits, 8 bits).
- Investigacion sobre artefactos de la comunidad: util para estudiar como se nombran, se cuantizan y se publican merges y variantes sin documentar, y para analizar los riesgos de trazabilidad en el ecosistema de modelos abiertos.
- Despliegue en produccion: no recomendable con la informacion disponible, dado que no hay licencia declarada, ni benchmarks, ni documentacion sobre sesgos y alineamiento, y el numero de descargas es cero, lo que implica ausencia de validacion por parte de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni similares) y los resultados de busqueda web consultados no aportan datos sobre este repositorio. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM / memoria unificada estimada: a partir del tamano del repositorio (19,2 GB), la inferencia requiere del orden de 19-21 GB de memoria unificada, mas el espacio adicional para la cache KV, que depende de la longitud de contexto (no disponible). Con contexto largo, la reserva necesaria puede crecer de forma significativa.
- GPU compatibles: el formato es MLX, por lo que la ejecucion esta pensada para Apple Silicon (familias M1, M2, M3 y M4, en versiones Pro, Max y Ultra). No se distribuyen pesos en safetensors estandar de PyTorch ni GGUF, por lo que no hay una ruta directa de despliegue en GPU NVIDIA o AMD.
- Cabe en GPU de consumo: no en GPUs NVIDIA de consumo de 8-16 GB, ya que el modelo requiere unos 19 GB solo para los pesos. En Apple Silicon, encaja en configuraciones con 24 GB o mas de memoria unificada, con margen recomendable de 32 GB o superior para contexto amplio.
- Opciones de despliegue: `mlx-lm` para Apple Silicon; oMLX/oQ como herramienta de cuantizacion. No hay artefactos publicados para vLLM, llama.cpp, Ollama ni TGI, y usarlos requeriria una conversion previa no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se ha encontrado informacion verificable que permita comparar este artefacto con alternativas concretas en terminos de rendimiento, contexto o evaluacion. La unica referencia objetiva es su propia naturaleza de cuantizacion MLX a 5 bits:

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| Qwen3.8-27B-...-oQ5e-novision (este) | 26,9 B | no disponible | no disponible | MLX safetensors 5 bits | no disponibles |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Trazabilidad nula del modelo base: no se identifica el checkpoint original del que procede la cuantizacion, ni el proceso de merge o fine-tune aplicado antes. El nombre "Qwen3.8-27B" no coincide con el tipo declarado `qwen3_5`, lo que anade incertidumbre sobre la familia real del modelo.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. Debe asumirse que los derechos dependen de los terminos del modelo base, que no se especifican.
- Contenido sin alineamiento de seguridad: el sufijo "Uncensored" indica que se ha reducido o eliminado el filtrado de seguridad. Esto incrementa el riesgo de generar contenido danino, sesgado o ilegal, y exige supervision humana en cualquier uso con usuarios finales.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; sin benchmarks ni evaluaciones de fidelidad, no puede acotarse su magnitud.
- Cuantizacion a 5 bits: la precision reducida puede degradar tareas sensibles como matematicas, codigo o razonamiento de varios pasos. No se ha medido esa perdida respecto al modelo sin cuantizar.
- Idiomas y contexto desconocidos: no se declaran idiomas soportados ni longitud de contexto, lo que impide garantizar un comportamiento correcto en castellano o en conversaciones largas.
- Sin validacion de la comunidad: 0 descargas y 0 likes implican ausencia de pruebas independientes, de reportes de fallos y de reproducibilidad.
- Dependencia de plataforma: el formato MLX limita el despliegue a Apple Silicon. Migrar a otro hardware requiere conversion, con el consiguiente riesgo de perdida de calidad y sin garantia de que la conversion reproduzca el comportamiento del autor.
- Fechas de publicacion y actualizacion muy proximas entre si (12 de septiembre de 2026, con 7 minutos de diferencia), lo que sugiere una subida sin ciclo de revision posterior.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ5e-novision
- Herramienta de cuantizacion oQ (oMLX), referenciada en la model card: https://github.com/jundot/omlx
- No se han encontrado otros enlaces relevantes (papers, blogs, repos, demos) en la busqueda web realizada.
