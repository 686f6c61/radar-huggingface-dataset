# anhdao69/stage1_S8N

## Resumen

stage1_S8N es un checkpoint experimental publicado en Hugging Face por el usuario anhdao69, derivado de Qwen3.5-4B y entrenado en el marco del proyecto SimpleMemVLN (navegacion visual y linguistica, VLN) sobre los datasets combinados R2R y English RxR15deg durante una unica epoca. El modelo forma parte de un barrido de ablacion (S-sweep) que estudia como afectan dos hiperparametros de memoria a la tarea de navegacion: R (grupos de observaciones recientes que se conservan, incluido el actual) y B (tokens del banco episodico, con frames de 300 tokens puntuados por S8N).

El repositorio contiene varias carpetas de ejecuciones con distintas combinaciones de R y B (S8N_R4B600, S8N_R4B2400, R8B0, R12B0, S8N_R2B1200 y S8N_R8B1200), generadas con el mismo codigo de entrenamiento, modelo base, datos, semilla, orden de datos y planificador que las armas de referencia S8N (R4/B1200) y R4B0 (R4/B0) del repositorio anhdao69/M5_S. La unica variacion respecto a esas referencias es el valor de R, el de B y el guard K/V derivado.

Se trata, por tanto, de un artefacto de investigacion orientado a reproducir y comparar ablaciones, no de un modelo listo para produccion: no hay model card con especificaciones de inferencia, licencia declarada ni idiomas documentados, y el tamano del repositorio (20,7 GB) es coherente con pesos en precision completa o media de un modelo de 4 mil millones de parametros junto con los artefactos de cada ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-4B); detalles de atencion y capas no disponibles |
| Parametros totales | 4 mil millones (heredados del modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos sin cuantizar; tamano de 20,7 GB) |
| Idiomas soportados | no disponible (los datos de entrenamiento incluyen instrucciones en ingles: R2R y English RxR15deg) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se especifica safetensors ni GGUF; cada carpeta incluye provenance/ y SHA256SUMS.json) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer de 4 mil millones de parametros, y se ajusta con el codigo de SimpleMemVLN para navegacion visual y linguistica. El entrenamiento usa una unica epoca sobre la union de R2R y English RxR15deg, con la misma receta que el barrido M5 GDN: mismo codigo, mismo modelo base, mismos datos, misma semilla, mismo orden de datos, mismo planificador y mismo fichero de runtime. La innovacion del experimento no esta en la arquitectura del transformer sino en el mecanismo de memoria: se controla cuantos grupos de observaciones recientes se conservan (R) y cuantos tokens del banco episodico se mantienen (B), con frames de 300 tokens puntuados por S8N, y se modifica en consecuencia el guard de claves/valores (K/V).

El repositorio es un barrido de ablacion: cada carpeta corresponde a una configuracion (S8N_R4B600, S8N_R4B2400, R8B0, R12B0, S8N_R2B1200, S8N_R8B1200) y las referencias son S8N (R4/B1200) y R4B0 (R4/B0) de anhdao69/M5_S. Las carpetas se publican a medida que terminan las ejecuciones y cada una incluye su propio README, directorio provenance/ y SHA256SUMS.json para verificar la integridad. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Navegacion visual y linguistica (VLN): el modelo esta ajustado para seguir instrucciones en lenguaje natural dentro de entornos visuales, segun la receta SimpleMemVLN sobre R2R y RxR.
- Memoria episodica configurable: las variantes incorporan un banco de tokens episodicos (B) y un numero configurable de observaciones recientes (R), lo que permite estudiar el efecto de la memoria a largo plazo en la navegacion.
- Procesamiento de instrucciones en ingles: los datos de entrenamiento son R2R y English RxR15deg, por lo que la capacidad multilingue no esta documentada y el ingles es el unico idioma con evidencia de entrenamiento.
- Razonamiento multi-paso implicito en la tarea de navegacion: el agente debe encadenar observaciones y acciones a lo largo de un episodio.
- Soporte de tool calling: no disponible.
- Capacidades de agente general: no disponibles; el ajuste esta orientado a la tarea VLN.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada (aunque la tarea VLN implica entrada visual, no se detalla el codificador visual).

## Casos de uso

- Investigacion en navegacion visual y linguistica: el modelo sirve para reproducir y comparar las ablaciones R/B del barrido S8N sobre R2R y RxR, usando las carpetas como puntos de control experimentales.
- Estudio del efecto de la memoria episodica: comparar S8N_R4B600 frente a S8N_R4B2400 o R8B0 permite medir como el tamano del banco episodico y el numero de observaciones recientes afectan al exito de navegacion.
- Reproducibilidad de experimentos: cada carpeta incluye provenance/ y SHA256SUMS.json, lo que facilita verificar que una ejecucion concreta se genero con la receta declarada.
- Desarrollo de agentes embodied en simulacion: el checkpoint puede integrarse en un bucle de agente que recibe observaciones visuales e instrucciones y emite acciones de navegacion.
- Linea base para futuros ajustes: al compartir modelo base, datos y semilla con M5_S, sirve como referencia controlada para nuevas variantes de memoria.
- Analisis de robustez ante instrucciones largas: las variantes con B alto (2400 tokens de banco) permiten estudiar el comportamiento con historiales de observacion extensos.
- Docencia y experimentacion academica: el modelo y sus carpetas de ablacion son un ejemplo practico de diseno experimental controlado en VLN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 4 mil millones de parametros en FP16 requiere aproximadamente 8 GB solo para los pesos, a los que hay que sumar el coste del codificador visual y del contexto de memoria episodica, no cuantificado.
- GPU recomendadas: no disponible. Por tamano, el modelo podria ejecutarse en GPUs consumer con 12-16 GB de VRAM en FP16, pero no hay datos oficiales que lo confirmen.
- Cabe en GPU consumer: probablemente si en tarjetas de 16 GB o mas, aunque no esta verificado ni documentado.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser un checkpoint de investigacion VLN, el despliegue requeriria el codigo de SimpleMemVLN.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stage1_S8N | 4 mil millones (base Qwen3.5-4B) | no disponible | VLN con memoria episodica (ablacion R/B) | no disponible | Hugging Face (anhdao69/stage1_S8N) |
| Qwen3.5-4B | 4 mil millones | no disponible | LLM generalista | no disponible | Modelo base de referencia |
| M5_S (S8N y R4B0) | 4 mil millones (base Qwen3.5-4B) | no disponible | VLN, configuraciones de referencia del barrido | no disponible | Hugging Face (anhdao69/M5_S) |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto de investigacion: no hay model card con instrucciones de uso, pipeline declarado ni ejemplos de inferencia; no es un modelo listo para produccion.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial es incierto y requiere contactar con el autor.
- Idiomas: solo hay evidencia de entrenamiento en ingles (R2R y English RxR15deg); el rendimiento en castellano u otros idiomas no esta documentado.
- Sesgos: no documentados; al entrenarse sobre datasets de navegacion en interiores, puede heredar sesgos de esos entornos y de las instrucciones de anotadores.
- Riesgo de alucinacion: no evaluado; en tareas VLN el fallo se manifiesta como acciones incorrectas o bucles, no como texto inventado.
- Contexto: la longitud de contexto no esta disponible, lo que impide garantizar el comportamiento con historiales largos.
- Dependencia del codigo: el uso requiere el codigo de SimpleMemVLN y la logica de memoria (R, B, guard K/V), no incluida en la informacion disponible.
- Carpetas incompletas: el autor indica que las carpetas aparecen a medida que terminan las ejecuciones, por lo que el contenido del repositorio puede cambiar.
- Verificacion: cada carpeta incluye SHA256SUMS.json, pero no se documenta el procedimiento de validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anhdao69/stage1_S8N
- Repositorio de referencia del barrido: https://huggingface.co/anhdao69/M5_S
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
