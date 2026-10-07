# davidwdw/t26-eval-c40-train13-0cf8ea9ed056

## Resumen

El repositorio `davidwdw/t26-eval-c40-train13-0cf8ea9ed056` no contiene un modelo de aprendizaje automatico en el sentido habitual, sino un archivo de evidencia de una ejecucion de evaluacion. Segun la model card, se trata de la instancia de entrenamiento/evaluacion denominada «Task26 c40 fresh10 train instance 13», ejecutada sobre una GPU RTX 4090 de un centro de computo con el token de ejecucion `centre-t26c40-i13-20261007T165422Z`, despachada el 2026-10-07T16:54:22Z y finalizada con estado `C40_RUN_END status=0` a las 17:50:57Z del mismo dia.

El contenido corresponde a una evaluacion oficial del entorno BEHAVIOR-1K 3.9.3 sobre el candidato congelado `95f5dff`, con bundle SHA256SUMS `ca7ebc2c5b84faf22f83033a91e2faac00552c9b3b18b3ba39e3948c39f92786`. El resultado registrado para la tarea `assembling_gift_baskets`, instancia 13, rollout 0, es `success=false` con una puntuacion `q_score` de 0.3125 tras 39091 pasos.

Por tanto, la relevancia de este repositorio es de trazabilidad experimental (reproducibilidad de una evaluacion de robotica/agente encarnado) y no de despliegue de inferencia. No se publican pesos, tokenizador, configuracion de arquitectura ni tarjeta de modelo convencional; el autor lo identifica explicitamente como un directorio de evidencia de evaluacion. El tamano del repositorio es de 0.3 GB, coherente con la presencia de video, registros y fuentes de codigo en lugar de pesos de red neuronal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos ni definicion de arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara composicion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica; el contenido son directorios de ejecucion (JSON oficial, video, logs, detector health, fuente y auditoria), registro de lanzamiento, log de lanzamiento y log de preflight de GPU |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal en la informacion disponible. El contenido del repositorio es un artefacto de evaluacion: directorio de ejecucion con JSON oficial, video, logs, estado de salud del detector, codigo fuente con su fichero `source_sha256.txt` y auditoria; directorio de registro de lanzamiento; log de lanzamiento; y log de preflight de GPU junto con su directorio. Los ficheros estan listados en `SHA256SUMS`, con la salvedad de que el propio `README.md` no esta incluido en dicho manifiesto.

El sistema evaluado opera bajo el runtime oficial BEHAVIOR-1K 3.9.3 sobre un candidato congelado identificado como `95f5dff`. No se aportan datos sobre volumen de tokens, composicion del dataset de entrenamiento, ni sobre tecnicas de alineacion como RLHF, DPO o similares. Tampoco se documentan innovaciones tecnicas de inferencia (decodificacion especulativa, atencion lineal u otras). Todo lo anterior debe considerarse no disponible.

## Capacidades

- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas o vision en la informacion proporcionada.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso mas alla del propio bucle de evaluacion de la tarea `assembling_gift_baskets` ejecutado durante 39091 pasos.
- No se declaran capacidades multilingues.
- Lo unico verificable es la ejecucion de una tarea de manipulacion/evaluacion encarnada en BEHAVIOR-1K 3.9.3, con resultado `success=false` y `q_score` de 0.3125.
- El repositorio incluye evidencia auxiliar de diagnostico: video de la ejecucion, logs y estado de salud del detector.

## Casos de uso

- Auditoria de reproducibilidad de experimentos: el directorio de ejecucion con JSON oficial, video y logs permite reconstruir exactamente que ocurrio en la instancia 13 del candidato `95f5dff` y contrastarlo mediante los hashes de `SHA256SUMS`.
- Verificacion de integridad de artefactos: el bundle SHA256SUMS `ca7ebc2c5b84faf22f83033a91e2faac00552c9b3b18b3ba39e3948c39f92786` sirve como referencia para comprobar que los ficheros descargados no han sido alterados.
- Analisis de fallos en robotica encarnada: al registrarse `success=false` en `assembling_gift_baskets`, el material es util para estudiar por que un candidato concreto no completa la tarea pese a alcanzar un `q_score` parcial de 0.3125.
- Trazabilidad de uso de recursos: el log de preflight de GPU y su directorio documentan las condiciones de la RTX 4090 utilizada, lo que permite auditar la asignacion de hardware del centro.
- Control de acceso y gobernanza de ejecuciones: el registro de lanzamiento y el log asociado permiten verificar quien autorizo la ejecucion y con que token (`centre-t26c40-i13-20261007T165422Z`).
- Monitorizacion de salud de detectores: el apartado de detector health dentro del directorio de ejecucion facilita diagnosticar si el fallo se origino en la percepcion o en la politica de control.
- Trazabilidad de versiones de software: la referencia a BEHAVIOR-1K 3.9.3 y al commit congelado `95f5dff` permite reproducir el entorno exacto de evaluacion.

## Benchmarks y rendimiento

La model card unicamente registra el resultado de la evaluacion de la tarea, sin comparativas con otros modelos ni metricas estandar de lenguaje (MMLU, HumanEval, GSM8K u otras). Los datos disponibles son los siguientes:

| Metrica | Valor |
|---|---|
| Entorno de evaluacion | BEHAVIOR-1K 3.9.3 |
| Candidato | 95f5dff (congelado) |
| Tarea | assembling_gift_baskets |
| Instancia | 13 |
| Rollout | 0 |
| Exito | false |
| q_score | 0.3125 |
| Pasos | 39091 |
| Estado de finalizacion | C40_RUN_END status=0 |
| Bundle SHA256SUMS | ca7ebc2c5b84faf22f83033a91e2faac00552c9b3b18b3ba39e3948c39f92786 |

No se han publicado resultados de benchmarks de modelos de lenguaje en la informacion disponible, ni terminos de comparacion con otros candidatos sobre la misma tarea.

## Requisitos de hardware

- El repositorio no contiene pesos de inferencia, por lo que no procede estimar VRAM para servir el modelo: el artefacto es un conjunto de evidencia, no un checkpoint desplegable.
- La ejecucion registrada se llevo a cabo en una unica GPU RTX 4090 del centro, segun la model card.
- El log de preflight de GPU y su directorio asociado contienen la verificacion previa del hardware empleado.
- No se documentan opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI, dado que no existe un modelo que servir.
- No se publican datos de latencia ni throughput. Lo mas cercano a una medida temporal es la ventana de ejecucion: despacho a las 16:54:22Z y finalizacion a las 17:50:57Z del 2026-10-07, con 39091 pasos registrados.
- El consumo de almacenamiento del repositorio es de aproximadamente 0.3 GB.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros candidatos, checkpoints o artefactos comparables de la misma categoria, ni metricas normalizadas que permitan establecer una comparacion con alternativas.

## Limitaciones y advertencias

- El repositorio no es un modelo utilizable: no contiene pesos, tokenizador, configuracion ni documentacion de arquitectura, por lo que no puede cargarse para inferencia.
- No se declara licencia, lo que impide determinar las condiciones de uso comercial o de redistribucion del contenido.
- No se declaran idiomas soportados ni ambito de aplicacion.
- El unico resultado publicado es un fallo (`success=false`) con `q_score` 0.3125 en una unica instancia y un unico rollout, lo que no permite extraer conclusiones generales de rendimiento.
- La fecha de creacion y actualizacion indicada (2026-10-07) es futura respecto a la fecha habitual de referencia; debe verificarse su coherencia antes de citar el artefacto.
- No hay informacion sobre sesgos, riesgo de alucinacion o comportamiento fuera de distribucion, al no tratarse de un modelo generativo documentado.
- El `README.md` no esta incluido en el manifiesto `SHA256SUMS`, de modo que su integridad no queda cubierta por la verificacion de hashes.
- Cualquier reutilizacion del material deberia limitarse a fines de auditoria y trazabilidad, no a produccion.

## Enlaces

- HuggingFace: https://huggingface.co/davidwdw/t26-eval-c40-train13-0cf8ea9ed056
- Repositorio o paper de BEHAVIOR-1K: no disponible en la informacion proporcionada
- Commit del candidato `95f5dff`: no se proporciona enlace
- Demos o blogs adicionales: no disponible
