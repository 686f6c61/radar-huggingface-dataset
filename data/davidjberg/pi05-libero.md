# davidjberg/pi05-libero

## Resumen

`davidjberg/pi05-libero` es un espejo (mirror) no modificado del checkpoint `pi05_libero` del proyecto openpi de Physical Intelligence, originalmente alojado en el bucket `gs://openpi-assets/checkpoints/pi05_libero`. No se trata de un modelo de lenguaje generativo al uso, sino de una política (policy) de robotica entrenada para control de manipuladores en el benchmark LIBERO. El autor del repositorio en Hugging Face es `davidjberg`, que se limita a replicar los pesos originales; la autoria real del modelo corresponde a Physical Intelligence.

El checkpoint se publica en formato Orbax OCDBT dentro del directorio `params/`, acompanado de un fichero de estadisticas de normalizacion (`assets/physical-intelligence/libero/norm_stats.json`). El repositorio ocupa 12,4 GB y no incluye pesos en safetensors ni GGUF, lo que condiciona su despliegue: requiere el stack de openpi (JAX/Flax con Orbax) y no es directamente consumible por llama.cpp, Ollama ni vLLM.

Su relevancia es acotada pero concreta: ofrece una copia verificada por tamano y MD5 de un checkpoint de referencia para investigacion en imitation learning y vision-language-action (VLA), util para reproducir resultados sobre LIBERO sin depender del acceso al bucket de Google Cloud de Physical Intelligence. La licencia declarada es Apache 2.0, aunque el autor remite a los terminos del repositorio openpi como marco aplicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de tipo pi05, segun el proyecto openpi; detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en Orbax OCDBT; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (remite a los terminos del repositorio openpi) |
| Formato de pesos | Orbax OCDBT (`params/`), mas `norm_stats.json` en `assets/` |
| Tamano del repositorio | 12,4 GB |
| Pipeline declarado | robotics |
| Tarea / benchmark | LIBERO (manipulacion robotica) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Por el etiquetado (`openpi`, `pi05`, `libero`) y por el ecosistema del que procede, se trata de una politica VLA de la familia pi05 de Physical Intelligence, entrenada con la configuracion `pi05_libero` del repositorio openpi. El checkpoint incluye estadisticas de normalizacion especificas del dataset LIBERO, lo que indica que la politica fue ajustada o evaluada sobre ese benchmark de manipulacion.

No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.). El repositorio es un mirror sin modificaciones: cada fichero fue verificado contra el origen por tamano y MD5 antes de la subida, por lo que los pesos son identicos a los del checkpoint original.

## Capacidades

- Control de robotica de manipulacion: genera acciones motoras a partir de observaciones, orientado al benchmark LIBERO.
- Procesamiento vision-language-action: integra entrada visual y consignas de tarea para producir comandos de accion (segun la naturaleza del proyecto openpi; detalles exactos no disponibles).
- Inferencia con estadisticas de normalizacion precalculadas para LIBERO, lo que facilita la reproducibilidad de la evaluacion.
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes multi-paso ni multilingues.
- No se documentan modos especiales (thinking, audio, vision generalista fuera del pipeline robotico).

## Casos de uso

- Reproduccion de resultados en LIBERO: cargar el checkpoint con el stack de openpi y ejecutar la evaluacion estandar del benchmark para contrastar cifras publicadas por Physical Intelligence.
- Investigacion en imitation learning: usar la politica como linea base frente a nuevos metodos de aprendizaje por imitacion en tareas de manipulacion.
- Fine-tuning sobre dominios propios: partir de estos pesos y reentrenar con datos de un manipulador concreto, aprovechando que el checkpoint ya incorpora normalizacion de LIBERO como punto de partida.
- Comparativas de politicas VLA: enfrentar pi05_libero contra otras politicas (por ejemplo, variantes de OpenVLA) en el mismo entorno simulado para medir tasas de exito.
- Docencia y formacion: disponer de un checkpoint de referencia ligero de desplegar en un cluster con JAX para ilustrar el ciclo completo de una politica VLA.
- Verificacion de integridad de artefactos: el mirror sirve como copia de control con MD5 comprobado para auditar que los pesos desplegados coinciden con el origen.
- Desarrollo de pipelines de evaluacion robotica: integrar el checkpoint en herramientas de simulacion y registro de metricas sin depender del acceso al bucket `gs://` de Google Cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio pesa 12,4 GB en Orbax OCDBT, por lo que se necesita al menos ese espacio en disco y memoria suficiente para cargar los parametros en el dispositivo (JAX/Flax).
- GPU recomendadas: no disponibles en la informacion proporcionada; el stack openpi se ejecuta sobre JAX, por lo que se requieren GPUs compatibles con CUDA y con soporte de JAX.
- Compatibilidad con GPU de consumo: no confirmada; depende del numero de parametros, que no se ha publicado.
- Opciones de despliegue: exclusivamente el stack de openpi (JAX/Flax con Orbax). No hay pesos en safetensors, GGUF ni formatos compatibles con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| pi05_libero (este mirror) | VLA para LIBERO | no disponible | no disponible | Apache 2.0 | Orbax OCDBT | Hugging Face (mirror) |
| OpenVLA | VLA generalista | 7B (segun publicaciones del proyecto) | no disponible en esta ficha | no disponible en esta ficha | safetensors | Hugging Face |
| Octo | Politica de manipulacion | no disponible en esta ficha | no disponible | no disponible en esta ficha | no disponible en esta ficha | Hugging Face / repositorio oficial |

Nota: los datos de OpenVLA y Octo no proceden de la informacion proporcionada para este modelo y deben verificarse en sus fichas respectivas antes de usarse en una comparacion formal.

## Limitaciones y advertencias

- Es un mirror, no un modelo original: cualquier actualizacion, correccion o cambio de licencia en el repositorio openpi puede no reflejarse aqui.
- El autor remite expresamente a los terminos de licencia del repositorio openpi; aunque la etiqueta declare Apache 2.0, conviene revisar dichos terminos antes de un uso comercial.
- No hay pesos en formatos estandar (safetensors, GGUF), lo que limita el despliegue a herramientas JAX/Orbax y complica la integracion en stacks convencionales de inferencia.
- El modelo esta especializado en LIBERO; su rendimiento fuera de ese benchmark o en robots reales no esta documentado en la informacion disponible.
- No se dispone de informacion sobre sesgos, tasas de alucinacion (poco aplicable a una politica motora, pero si a posibles componentes de lenguaje internos) ni limitaciones de contexto o idioma.
- Sin descargas ni likes registrados en el momento de la consulta, lo que reduce la validacion comunitaria del artefacto.
- El repositorio no incluye documentacion sobre requisitos de hardware ni procedimientos de evaluacion; hay que consultarlos en el repositorio openpi.

## Enlaces

- Hugging Face: https://huggingface.co/davidjberg/pi05-libero
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Origen del checkpoint: `gs://openpi-assets/checkpoints/pi05_libero` (bucket de Google Cloud referenciado en la model card)
