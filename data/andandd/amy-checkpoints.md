# Andandd/amy-checkpoints

## Resumen

Amy Checkpoints es un repositorio de pesos de un modelo de lenguaje de desarrollo propio publicado por el usuario Andandd en Hugging Face. No se trata de un modelo distribuido de forma convencional, sino de una coleccion de 196 ficheros de checkpoint en formato `.pt` (PyTorch) cifrados con AES-256-GCM, acompanados de un script de descifrado (`decrypt_checkpoints.py`) que requiere una clave externa no incluida en el repositorio. El contenido corresponde a distintas fases de entrenamiento de un proyecto denominado "Amy", con variantes de modelo, EMA, SWA y checkpoints intermedios de hasta 16.000 pasos.

El material disponible no permite determinar la arquitectura, el tamano exacto ni el contexto del modelo mas alla de una referencia a una "arquitectura de 507M" en checkpoints antiguos. No hay model card tecnica, no se publican resultados de evaluacion, no se declara licencia y no se especifican idiomas soportados. El repositorio funciona mas como un archivo de artefactos de entrenamiento cifrados que como una release de modelo lista para uso.

Por su naturaleza, esta ficha debe leerse como una descripcion del repositorio y de sus artefactos, no como una evaluacion de capacidades del modelo. Cualquier uso en produccion requeriria la clave de descifrado del autor, el codigo de definicion de la arquitectura (no incluido) y una validacion independiente que aqui no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona una "arquitectura de 507M" en checkpoints antiguos, sin especificar tipo) |
| Parametros totales | no disponible (referencia parcial: checkpoints `amy_best_old_507M.pt` y `amy_best_ema_old_507M.pt` de 507M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen sin cuantizar, en `.pt` cifrado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` cifrado con AES-256-GCM (nonce de 12 bytes + ciphertext + tag de 16 bytes) |
| Cifrado | AES-256-GCM autenticado; clave no incluida en el repositorio (`AMY_DECRYPT_KEY`) |
| Numero de checkpoints | 196 (22 en `v1_cache_encrypted/`, 174 en `v1_desktop_encrypted/`) |
| Fecha de creacion | 2026-10-15 |
| Ultima actualizacion | 2026-11-10 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. La model card no describe si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o un modelo basado en state space models. La unica referencia dimensional es la de los checkpoints `amy_best_old_507M.pt` y `amy_best_ema_old_507M.pt`, que sugieren una version anterior de aproximadamente 507 millones de parametros, presumiblemente sustituida por una arquitectura posterior etiquetada como "V2" en los ficheros `amy_v2_step_*.pt`.

En cuanto al entrenamiento, el inventario de ficheros revela un pipeline con varias tecnicas: checkpoints de mejor modelo (`amy_best.pt`), media movil exponencial de pesos (`amy_best_ema.pt`), promedio estocastico de pesos (`amy_swa.pt`), hitos de entrenamiento con nombres `amy_train_*` y `amy_emergency_*` de mayo de 2026, y metadatos de estrategias de entrenamiento como curriculum learning (`amy_curriculum.pt`), repeticion espaciada (`amy_spaced_rep.pt`), learnability ponderada (`amy_learnability_rw.pt`) y perdida selectiva (`amy_selective_loss.pt`). La serie completa de escritorio contiene 174 checkpoints de ejecuciones de abril de 2026, desde el paso 1 hasta el 16.000. No se especifican el volumen de tokens, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias.

## Capacidades

- No se han documentado capacidades funcionales del modelo en la informacion disponible.
- No se especifica soporte de tool calling ni function calling.
- No se especifica soporte de agentes ni razonamiento multi-paso.
- No se especifica capacidad multilingue ni cobertura de idiomas.
- No se documentan modos especiales (thinking mode, vision, audio) ni tareas concretas (codigo, matematicas, generacion de texto).
- El unico contenido verificable es la existencia de pesos entrenados y de un mecanismo de cifrado y descifrado reproducible.

## Casos de uso

- Archivado y reproducibilidad de experimentos: el repositorio conserva 174 checkpoints intermedios de una ejecucion de entrenamiento completa (pasos 1 a 16.000), lo que permite reconstruir curvas de aprendizaje y comparar estados del modelo en puntos concretos del entrenamiento.
- Investigacion sobre promediado de pesos: las variantes EMA y SWA (`amy_best_ema.pt`, `amy_swa.pt`) permiten estudiar el efecto de tecnicas de averaging sobre la estabilidad y calidad del modelo en distintas fases.
- Estudio de estrategias de curriculum y perdida selectiva: los ficheros `amy_curriculum.pt`, `amy_spaced_rep.pt`, `amy_learnability_rw.pt` y `amy_selective_loss.pt` documentan variantes de entrenamiento que pueden compararse entre si para analizar su impacto.
- Transferencia de cifrado de artefactos: el esquema AES-256-GCM con nonce aleatorio por fichero y script de descifrado sirve como referencia para distribuir checkpoints de forma cifrada en repositorios publicos.
- Recuperacion de un proyecto interrumpido: los checkpoints de emergencia (`amy_emergency_*`) permiten reanudar o auditar un entrenamiento que fue interrumpido, si se dispone de la clave y del codigo de definicion del modelo.
- Evaluacion interna controlada: un equipo con acceso a la clave podria descifrar los pesos y ejecutar evaluaciones propias, siempre que reconstruya la arquitectura a partir del codigo de entrenamiento original, que no se distribuye en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Como referencia orientativa, un modelo denso de 507M en FP16 requiere aproximadamente 1 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV; la version "V2" podria tener un tamano distinto no especificado.
- GPU recomendadas: no disponible. Para un modelo de ese orden de magnitud bastaria una GPU consumer con 8-16 GB, pero no hay confirmacion del tamano real de la version actual.
- Cabe en GPU consumer: probablemente si, si el modelo final ronda los 507M de parametros, pero no esta confirmado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Los pesos estan en `.pt` cifrado, por lo que primero habria que descifrarlos y convertirlos a safetensors o GGUF con herramientas propias.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque no se ha especificado la arquitectura, el tamano final, el contexto ni la tarea del modelo. La unica referencia dimensional (507M) no permite emparejarlo con una familia concreta sin conocer su diseno.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay model card con arquitectura, datos de entrenamiento, tokenizador ni hiperparametros.
- Los pesos estan cifrados y la clave no se distribuye; sin `AMY_DECRYPT_KEY` los ficheros son inutilizables.
- No se incluye el codigo de definicion de la arquitectura ni el tokenizador, por lo que descifrar los pesos no garantiza poder cargarlos.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; en la practica, la ausencia de licencia implica reserva de derechos por defecto.
- No hay informacion sobre sesgos, riesgo de alucinacion, calidad linguistica ni comportamiento en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Los nombres de fichero sugieren un proyecto personal en desarrollo ("Amy"), no una release estable; los checkpoints "V2" indican cambios de arquitectura incompatibles entre si.
- No debe tratarse como un modelo listo para produccion sin una evaluacion independiente completa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Andandd/amy-checkpoints
- Script de descifrado incluido en el repositorio: `decrypt_checkpoints.py`
- Dependencias declaradas por el autor: `cryptography`, `huggingface_hub`
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
