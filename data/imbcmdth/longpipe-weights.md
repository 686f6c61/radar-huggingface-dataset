# imbcmdth/longpipe-weights

## Resumen

`imbcmdth/longpipe-weights` es un repositorio espejo (mirror) de los ficheros de pesos que utiliza el proyecto longpipe, cuyo codigo y pesos originales residen en `sb2702/longpipe` bajo licencia MIT. No se trata de un modelo entrenado por el autor del repositorio ni de un modelo en el sentido convencional de HuggingFace: es un contenedor de artefactos binarios de pesos empaquetados en formatos especificos para los shaders del proyecto longpipe, servidos originalmente desde `cdn.longpipe.dev/models/v/0.0.5/`. El repositorio declara explicitamente que "no contiene nada mas" que esos ficheros.

El contenido se organiza en cinco niveles o *tiers* (xs, small, medium, large, xl), cada uno con una version en f32 y otra empaquetada en f16. Los tamanos van desde aproximadamente 4,2 MB en el tier xs hasta unos 30,5 MB en el tier xl en f32, lo que situa estos pesos en el rango de modelos muy pequenos, orientados previsiblemente a ejecucion en GPU de sidecar o en entornos con recursos limitados. El repositorio completo ocupa 0,1 GB.

La relevancia actual del repositorio es acotada y de naturaleza instrumental: sirve como anclaje de versiones (pins) para `ffrwd/longpipe` 0.3 y posteriores, que ejecutan el codigo de longpipe sobre la GPU del sidecar y seleccionan el tier mediante el parametro `tier`. No hay informacion publica sobre arquitectura, datos de entrenamiento ni capacidades del modelo subyacente en la model card proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el tier xl en f32 ocupa 30.463.184 bytes; el tier xs, 4.300.564 bytes) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f32 y f16 (empaquetado propio para shaders de longpipe) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.bin` propietario: cabecera u32 little-endian con longitud, indice JSON de tensores y pesos empaquetados en el layout que leen los shaders de longpipe |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente (transformer, MoE, SSM u otra), el numero de parametros, la composicion del dataset ni el proceso de entrenamiento (pretraining, RLHF, DPO). La model card no incluye ninguno de estos datos y se limita a describir el formato de empaquetado y la procedencia de los pesos.

Lo unico documentado es el formato de serializacion: cada fichero consta de una cabecera de 4 bytes (u32 little-endian) que indica la longitud del indice, seguido de un indice JSON de tensores y de los pesos empaquetados en los layouts que consumen los shaders del proyecto longpipe. Existen dos variantes por tier: f32 y f16. La procedencia de los datos de entrenamiento se remite a la pagina de licencias del proyecto upstream (`sb2702/longpipe`).

## Capacidades

- No se han documentado capacidades funcionales del modelo en la informacion disponible.
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues.
- No hay informacion sobre modos especiales (thinking, vision, audio).
- El unico uso documentado es la carga por parte del codigo de longpipe en la GPU de un sidecar, con seleccion de tier mediante el parametro `tier`.

## Casos de uso

- Anclaje de versiones en despliegues de `ffrwd/longpipe` 0.3 o superior: el repositorio permite fijar los pesos por digest SHA-256 para garantizar reproducibilidad binaria entre despliegues.
- Verificacion de integridad de artefactos: los digests SHA-256 publicados en la model card permiten validar que los ficheros cargados coinciden byte a byte con los servidos en `cdn.longpipe.dev/models/v/0.0.5/`.
- Espejo de respaldo ante indisponibilidad del CDN: al replicar los mismos tamanos y digests que el `manifest.json` upstream, el repositorio puede servir como fuente alternativa en pipelines que dependen de `cdn.longpipe.dev`.
- Seleccion de tier segun presupuesto de recursos: los cinco niveles permiten escoger entre aproximadamente 4,2 MB (xs) y 30,5 MB (xl) en f32, o entre 2,1 MB y 15,2 MB en f16, para ajustar el consumo de VRAM del sidecar.
- Despliegue en GPU de sidecar: el formato esta disenado para que los shaders de longpipe lean directamente los pesos empaquetados, sin conversion intermedia.
- Auditoria de procedencia: al ser un mirror con licencia MIT y digests publicados, facilita la trazabilidad de los pesos usados en produccion frente al repositorio upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; como referencia de orden de magnitud, el tier mayor (xl en f32) ocupa 30.463.184 bytes (unos 29 MB) y el menor (xs en f16) 2.153.062 bytes (unos 2,1 MB), por lo que el peso de los ficheros es muy reducido.
- GPU recomendadas: no disponibles; el proyecto upstream ejecuta el modelo en la GPU de un sidecar, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; el reducido tamano de los ficheros sugiere que cabrian en practicamente cualquier GPU, pero no hay documentacion que lo confirme.
- Opciones de despliegue: carga mediante el codigo de longpipe (`sb2702/longpipe`) en la GPU del sidecar. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria, dado que el repositorio no documenta arquitectura, parametros ni tarea.

## Limitaciones y advertencias

- El repositorio no es un modelo autonomo: es un mirror de pesos que solo funciona con el codigo de longpipe; no puede cargarse con frameworks estandar como transformers, llama.cpp o vLLM.
- Ausencia total de documentacion sobre arquitectura, parametros, contexto, idiomas y capacidades, lo que impide evaluar su idoneidad para tareas concretas.
- El formato `.bin` es propietario (cabecera u32 + indice JSON + pesos empaquetados para shaders), no es safetensors ni GGUF, y no hay herramientas publicas de conversion documentadas.
- Riesgo de desalineacion con upstream: al ser un mirror, los pesos pueden quedar obsoletos respecto a versiones futuras de longpipe; la model card solo garantiza correspondencia con la version 0.0.5.
- La procedencia de los datos de entrenamiento se delega a la pagina de licencias de `sb2702/longpipe`; no se detalla en este repositorio.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones de contexto o idioma.
- La licencia MIT permite uso comercial, pero se recomienda verificar la procedencia de los datos upstream antes de un despliegue en produccion.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-10-29), lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/imbcmdth/longpipe-weights
- Proyecto upstream (codigo y pesos): https://github.com/sb2702/longpipe
- CDN de origen de los pesos: https://cdn.longpipe.dev/models/v/0.0.5/
