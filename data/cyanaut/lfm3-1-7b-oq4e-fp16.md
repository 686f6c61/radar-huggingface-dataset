# cyanaut/LFM3-1.7B-oQ4e-fp16

## Resumen

LFM3-1.7B-oQ4e-fp16 es una version cuantizada del modelo LFM3 de 1.700 millones de parametros, publicada por el usuario cyanaut en Hugging Face. Se trata de una conversion de pesos a formato MLX mediante la herramienta oQ (oMLX v0.7.3), una tecnica de cuantizacion de precision mixta que asigna distintos niveles de bits a diferentes tensores segun su sensibilidad. El resultado es un checkpoint de 1.729 millones de parametros que ocupa aproximadamente 1,1 GB en disco, con un promedio efectivo de 4,801 bits por peso.

El modelo base LFM3 (probablemente de la familia Liquid Foundation Models de Liquid AI, aunque la informacion disponible no lo confirma de forma explicita) esta disenado para tareas de generacion de texto y razonamiento en un tamano compacto. Esta version cuantizada esta pensada especificamente para ejecutarse en hardware Apple Silicon mediante el framework MLX, lo que la hace relevante para desarrolladores que quieren desplegar un modelo de ~1,7B en Macs sin GPU dedicada.

La relevancia de esta ficha radica en su caracter practico: demuestra como la cuantizacion de precision mixta permite comprimir un modelo de 1,7B a menos de 1 GB manteniendo una distribucion de bits escalonada (4, 5, 6 y 8 bits) que preserva mayor precision en las capas mas sensibles. No obstante, la informacion publicada por el autor es muy limitada: no se detallan datos de entrenamiento, benchmarks, licencia ni idiomas soportados del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; transformers, detalles no publicados) |
| Parametros totales | 1.728.801.536 (1,729B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ: affine 4-bit (71,099% de pesos), 5-bit (27,901%), 6-bit (0,970%), 8-bit (0,008%), FP16 (0,022%); grupo 64; promedio efectivo 4,801 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), libreria mlx, custom_code |
| Tamano del checkpoint | 1,038 GB / 0,966 GiB (repo 1,1 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base LFM3 ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO). La model card unicamente documenta el proceso de cuantizacion: se aplico oQ (oMLX v0.7.3), una tecnica de cuantizacion de precision mixta que distribuye los pesos en cuatro niveles de bits (4, 5, 6 y 8) mas una pequena fraccion en FP16. La mayor parte de los pesos (71,099%) se almacena en affine 4-bit con grupo de 64, mientras que un 27,901% se mantiene en 5-bit, presumiblemente por ser tensores mas sensibles a la cuantizacion agresiva.

La innovacion tecnica destacable es precisamente ese esquema de precision mixta: en lugar de aplicar una cuantizacion uniforme de 4 bits, oQ asigna mas bits a los tensores que mas lo necesitan, logrando un promedio de 4,801 bits/peso. El checkpoint incluye codigo personalizado (custom_code) y esta empaquetado para la libreria MLX, lo que implica dependencia del ecosistema de Apple para su ejecucion. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto: el modelo base es un modelo de lenguaje de 1,7B, aunque no se detallan capacidades especificas en la informacion disponible.
- Razonamiento y matematicas: no confirmado en la documentacion publicada.
- Generacion de codigo: no confirmado en la documentacion publicada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Ejecucion en Apple Silicon: capacidad confirmada por el formato MLX del checkpoint.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint esta empaquetado en MLX y ocupa menos de 1 GB, por lo que puede cargarse en un Mac con memoria unificada de 8 GB o mas para tareas de generacion de texto en local sin GPU dedicada.
- Prototipado rapido de aplicaciones de NLP: al ser un modelo de 1,7B cuantizado a ~4,8 bits, permite iterar en el desarrollo de pipelines de generacion de texto con tiempos de carga reducidos.
- Experimentacion con cuantizacion de precision mixta: util para investigadores que quieran evaluar el impacto de oQ frente a cuantizaciones uniformes (por ejemplo, 4-bit estandar) en un modelo de este tamano.
- Despliegue en entornos con memoria limitada: el reducido tamano del checkpoint (0,966 GiB) lo hace adecuado para dispositivos con restricciones de RAM/VRAM donde un modelo en FP16 no cabria.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia para medir la degradacion de calidad de oQ frente al modelo original LFM3-1.7B en tareas de generacion.
- Educacion y demos: su tamano compacto permite incluirlo en tutoriales y notebooks sobre MLX y cuantizacion, siempre que se respete la licencia del modelo base (no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,0-1,2 GB para los pesos en MLX (0,966 GiB de checkpoint) mas overhead de activaciones y cache KV, que depende de la longitud de contexto (no disponible).
- GPU recomendadas: el formato MLX esta orientado a Apple Silicon (series M1, M2, M3, M4); no se garantiza su funcionamiento en GPU NVIDIA o AMD sin conversion previa.
- Cabe en GPU consumer: si, en cualquier Mac con memoria unificada de 8 GB o superior; en el ecosistema NVIDIA requeriria conversion a otro formato (por ejemplo, GGUF) no incluida en este repo.
- Opciones de despliegue: MLX (libreria nativa del checkpoint); para otros entornos seria necesaria una conversion a llama.cpp, Ollama o vLLM, no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ4e-fp16 (este) | 1,729B | no disponible | oQ mixta 4/5/6/8-bit (4,801 bits/peso) | no disponible | Hugging Face, formato MLX |
| LFM3-1.7B (base) | 1,7B | no disponible | FP16/BF16 | no disponible | no confirmado en la informacion |
| Otros modelos ~1,7B cuantizados a 4-bit | ~1,7B | variable | 4-bit uniforme | variable | amplia disponibilidad |

No se dispone de datos de rendimiento ni de modelos comparables confirmados en la informacion proporcionada; la comparativa se limita a parametros y formato.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no cuantificado en la informacion disponible.
- La cuantizacion a 4,801 bits/peso promedio puede degradar la calidad respecto al modelo original en tareas sensibles a la precision numerica (matematicas, codigo), aunque no se han publicado evaluaciones al respecto.
- Limitaciones de contexto e idioma: no disponibles; no se puede garantizar soporte multilingue ni una ventana de contexto concreta.
- Restricciones de licencia: la licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base LFM3 antes de usarlo en produccion.
- Dependencia del ecosistema MLX: el checkpoint usa custom_code y la libreria mlx, por lo que no es portable directamente a otros frameworks sin conversion.
- El autor indica que el modelo se re-cuantizo el 2026-11-03 con oMLX v0.7.3; versiones anteriores pueden diferir y deberian descargarse de nuevo.
- El repositorio no tiene descargas ni likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/cyanaut/LFM3-1.7B-oQ4e-fp16
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
