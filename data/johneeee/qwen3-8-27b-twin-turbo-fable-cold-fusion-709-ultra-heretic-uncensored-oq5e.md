# Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-oQ5e

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-oQ5e es un artefacto de pesos publicado en Hugging Face por el usuario Johneeee. No se trata de un modelo entrenado desde cero, sino de una cuantizacion de un modelo existente de la familia qwen3_5, realizada con la herramienta oQ (oMLX v0.7.0.dev2) en precision mixta de 5 bits con tamano de grupo 64. El repositorio contiene 26.895.998.464 parametros reales (unos 26,9 mil millones) en formato MLX safetensors, con un peso total de 19,2 GB.

La relevancia de esta ficha es limitada y hay que ser explicito al respecto: la model card publicada por el autor consta unicamente de la nota de cuantizacion y no documenta el modelo base, los datos de entrenamiento, la licencia, los idiomas ni resultados de evaluacion. El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el 18 de septiembre de 2026 con apenas cinco minutos de diferencia, lo que indica que no ha pasado por ninguna validacion de la comunidad.

El nombre del repositorio sugiere una fusion o fine-tuning derivado (terminos como TWIN-TURBO, Cold-Fusion o Uncensored), asi como la eliminacion de capas de alineacion de seguridad, pero ninguna de estas afirmaciones esta respaldada por documentacion tecnica en la informacion disponible. Cualquier evaluacion de calidad, seguridad o idoneidad para produccion es, a dia de hoy, imposible de realizar con los datos publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag del repositorio indica `qwen3_5`; no se documenta la arquitectura interna) |
| Parametros totales | 26.895.998.464 (26,9 mil millones, dato real de los safetensors) |
| Parametros activos | no disponible (no se confirma si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, group size 64, precision mixta mediante oQ (oMLX v0.7.0.dev2) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantizado, libreria `mlx`) |

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura interna del modelo base. El unico dato tecnico disponible es el campo `model type: qwen3_5` de la model card, que apunta a la familia Qwen3.5, pero no se especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida ni cual es la configuracion de atencion. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o similar.

Lo unico documentado es el proceso de cuantizacion posterior: el autor aplico la herramienta oQ (integrada en oMLX v0.7.0.dev2) para generar pesos de 5 bits con tamano de grupo 64 en precision mixta. Esto significa que distintas capas pueden haber recibido precisiones distintas dentro de ese esquema, con el objetivo de preservar mejor las capas sensibles. No se publican metricas de degradacion respecto al modelo sin cuantizar, ni curva de perplejidad, ni comparacion con otras recetas de cuantizacion.

## Capacidades

- Generacion de texto: capacidades inferidas por la familia declarada, no verificadas en este repositorio.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Moderacion: el nombre del repositorio incluye el termino "Uncensored", lo que sugiere la supresion de capas de rechazo o alineacion de seguridad, pero no existe documentacion que lo confirme ni que describa el metodo empleado.

## Casos de uso

Nota previa: al no existir benchmarks, licencia ni documentacion de capacidades, los siguientes escenarios son planteamientos genericos para un modelo denso de ~27B en 5 bits sobre Apple Silicon, no casos validados con este artefacto concreto. Se recomienda evaluacion propia antes de cualquier uso real.

- Prototipado local en portatiles Apple Silicon: el modelo ocupa 19,2 GB en disco y esta en formato MLX, por lo que puede cargarse con `mlx-lm` en equipos con memoria unificada de 32 GB o mas, sin necesidad de GPU dedicada ni de conexion a internet.
- Experimentacion con generacion creativa sin filtros: el nombre indica que se ha eliminado la alineacion de seguridad, lo que lo hace candidato para investigacion sobre escritura creativa en dominios que otros modelos rechazan; requiere revisar la legislacion aplicable y las condiciones de uso.
- Investigacion sobre cuantizacion: sirve como muestra de una receta concreta (oQ, 5 bits, group size 64) para estudiar el equilibrio entre tamano en disco y calidad frente a alternativas de 4 y 6 bits.
- Procesamiento por lotes offline en un Mac: tareas de resumen, clasificacion o reescritura de documentos que se ejecutan de forma local y desatendida, donde la latencia no es critica y prima la privacidad de los datos.
- Base para fine-tuning con LoRA: al estar en safetensors y ser compatible con MLX, puede servir de punto de partida para adaptaciones especificas sobre Apple Silicon, siempre que la licencia del modelo base lo permita (dato no disponible).
- Generacion de codigo en flujos locales: integracion en editores o scripts como asistente offline, asumiendo que no hay evidencia de su rendimiento en tareas de programacion y que habria que medirlo con HumanEval o similar.
- Evaluacion de seguridad y red teaming: util como objeto de estudio para medir hasta que punto un modelo "uncensored" mantiene capacidad de rechazo ante peticiones daninas, dado que no hay ninguna evaluacion publicada al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de perplejidad tras la cuantizacion, ni comparacion con el modelo base sin cuantizar.

## Requisitos de hardware

- Peso en disco: 19,2 GB de repositorio; los pesos de 26,9B parametros a 5 bits suponen aproximadamente 16,8 GB teoricos, mas ficheros de configuracion y metadatos.
- Memoria unificada estimada para inferencia: en torno a 20-24 GB considerando pesos y cache KV; el valor exacto depende de la longitud de contexto, que no esta documentada.
- Equipos recomendados: Mac con Apple Silicon y 32 GB de memoria unificada o mas (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). Con 64 GB o mas se dispone de margen para contextos largos y lotes.
- Viabilidad en GPU de consumidor: no, porque MLX solo se ejecuta sobre Apple Silicon. No se proporciona version GGUF ni safetensors estandar, por lo que no puede cargarse directamente en CUDA con vLLM, TGI o llama.cpp.
- Opciones de despliegue: `mlx-lm` y ecosistema oMLX en macOS. Para otros entornos seria necesaria una conversion manual no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion verificable sobre alternativas comparables: al no documentarse el modelo base ni la receta de fusion, no es posible establecer una comparacion tecnica rigurosa. La tabla siguiente recoge lo unico contrastable.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (oQ5e) | 26,9B | no disponible | 5 bits, group 64, MLX | no disponible | Hugging Face, 0 descargas |
| Modelo base qwen3_5 sin cuantizar | no disponible | no disponible | no aplica | no disponible | no disponible |
| Versiones GGUF equivalentes | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras alternativas de ~27B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay licencia, idiomas, contexto, arquitectura ni datos de entrenamiento. Usar este modelo en produccion implica asumir un riesgo juridico y tecnico no cuantificado.
- Licencia no disponible: sin licencia explicita no se puede determinar si el uso comercial esta permitido. Ademas, al ser un derivado de un modelo base tambien indeterminado, las condiciones del modelo original podrian seguir aplicandose.
- Riesgo de alucinacion: no evaluado. No hay datos de perplejidad ni de degradacion tras la cuantizacion a 5 bits, que en modelos de este tamano suele ser moderada pero no despreciable en tareas de razonamiento.
- Perdida de alineacion de seguridad: el nombre indica que el modelo ha sido modificado para eliminar rechazos. Esto incrementa el riesgo de generar contenido danino, ilegal o sesgado, y dificulta su despliegue en entornos con requisitos de moderacion.
- Sesgos: no documentados. Al no conocerse la composicion del dataset original ni el proceso de fusion, no se puede caracterizar el sesgo por idioma, genero, origen o ideologia.
- Limitaciones de idioma: no se declara ninguna lista de idiomas. El rendimiento en castellano es, por tanto, desconocido.
- Trazabilidad y reproducibilidad: no se publica el identificador del modelo base, ni la receta de fusion, ni el hash de los pesos originales. Resulta imposible reproducir la cuantizacion o auditar el origen.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, con creacion y ultima actualizacion separadas por cinco minutos. No hay evidencia de que el artefacto haya sido probado por terceros.
- Compatibilidad restringida: el formato MLX limita su uso a macOS sobre Apple Silicon; no hay pesos para CUDA ni versiones GGUF publicadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-oQ5e
- Herramienta de cuantizacion oQ / oMLX citada en la model card: https://github.com/jundot/omlx
- No se han encontrado papers, blogs, repositorios adicionales ni demos asociados a este modelo en la busqueda web realizada. Los resultados devueltos por la busqueda (Hyperliquid y sitios relacionados) no guardan ninguna relacion con el modelo.
