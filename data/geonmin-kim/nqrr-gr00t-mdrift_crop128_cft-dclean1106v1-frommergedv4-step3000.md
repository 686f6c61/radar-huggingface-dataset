# geonmin-kim/nqrr-GR00T-Mdrift_crop128_cft-Dclean1106v1-frommergedv4-step3000

## Resumen

Este repositorio no contiene un modelo de lenguaje generativo al uso, sino un paquete de despliegue (bundle) en formato propietario `nqrr/3` para ejecutar la política robótica GR00T N1.7 sobre la NPU Hexagon v73 del SoC Qualcomm IQ-9075 (QCS9075). Lo publica el usuario `geonmin-kim` y su función es empaquetar los binarios de contexto HTP, los tensores golden de referencia y los recursos de glue de host necesarios para que el runtime Nota QNN Robotics Runtime (NQRR) pueda cargar y ejecutar el modelo en el acelerador. El problema que resuelve es la portabilidad de un modelo de robótica de gran tamaño hacia hardware embebido con límites estrictos de memoria por contexto.

El bundle deriva del checkpoint `geonmin-kim/GR00T-Mdrift_crop128_cft-Dclean1106v1-frommergedv4-step3000` y contiene 5.371.150.336 parámetros en safetensors, con un tamaño de repositorio de 5,7 GB. La arquitectura subyacente es la de GR00T N1.7, una política visión-lenguaje-acción (VLA) compuesta por un codificador de visión, un LLM y un cabezal de difusión (DiT) que genera trayectorias de acción mediante flow matching. El contexto de secuencia configurado es de 64 tokens, con dos vistas de cámara y un horizonte de acción de 40 pasos.

Su relevancia es acotada pero específica: demuestra el despliegue cuantizado a 8 bits de una política VLA sobre NPU Hexagon, un escenario poco documentado frente a las rutas habituales de GPU. El bundle está fijado a QAIRT 2.47.0.260601 y al SoC con `soc_id` 77 y `dsp_arch` v73, con un límite duro de 2 GiB por buffer de contexto que condiciona toda la partición del grafo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (política VLA: visión + LLM + DiT con flow matching), empaquetada para NPU Hexagon v73 |
| Parametros totales | 5.371.150.336 |
| Parametros activos | no disponible |
| Longitud de contexto | 64 tokens de secuencia (padding por la izquierda; prompt medido en captura: 53) |
| Tipos de cuantizacion | 8-bit (tag `8-bit`); el bundle incluye binarios de contexto HTP ya compilados |
| Idiomas soportados | no disponible (modelo orientado a instrucciones y acciones robóticas) |
| Licencia | other |
| Formato de pesos | safetensors (contenedor del bundle `nqrr/3`; los miembros grandes se concatenan en `model.safetensors` y el resto queda como ficheros planos) |

## Arquitectura y entrenamiento

La política subyacente sigue el diseño de GR00T N1.7: un codificador de visión que procesa dos vistas de cámara con 64 parches por vista y 16 tokens de visión, un LLM que consume la instrucción y el contexto visual, y un cabezal DiT (Diffusion Transformer) que genera la acción mediante flow matching. En este bundle el DiT está configurado con un único paso y dos particiones, y el horizonte de acción es de 40 con `max_action_dim` de 132. La geometría de imagen aplicada es resize a [128, 128], recorte central a [115, 115] y nuevo resize a [128, 128], coherente con el nombre `crop128` del checkpoint.

El entrenamiento se realizó en el job `exp121_groot_drift_crop128_clean1106`, según los metadatos del bundle, sobre el dataset `geonmin-kim/SO101-lv4-3color-cube-mat-to-mat-no-human-reset-vertical-approach-clean-1106-v1`, orientado a manipulación de cubos de tres colores con aproximación vertical y sin reinicio humano. No se dispone de información sobre número de tokens, composición completa del dataset ni si se aplicaron fases de RLHF o DPO. La innovación técnica destacable no está en el entrenamiento sino en el empaquetado: la conversión a QAIRT 2.47.0.260601 particiona el grafo en cuatro contextos (`dit_step_0` de 1.062,3 MiB, `dit_step_1` de 1.059,2 MiB, `llm_0` de 1.925,3 MiB y `vision` de 778,8 MiB) para respetar el límite de 2 GiB por buffer de contexto impuesto por Hexagon v73, que carece de la extensión de región lejana de v81 y superiores. Además, el bundle incorpora tensores golden capturados con semilla de ruido 0 para validar la inferencia en dispositivo.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de instrucciones en lenguaje natural y observaciones visuales, mediante flow matching en un único paso de difusión.
- Procesamiento de dos vistas de cámara simultáneas con 16 tokens de visión por vista.
- Control de horizonte de acción de 40 pasos con dimensión máxima de acción de 132.
- Ejecución sobre NPU Hexagon v73 vía QNN/HTP, con binarios de contexto precompilados.
- Verificación de integridad del bundle mediante hashes de miembros, fingerprint del manifiesto y tensores golden.
- Soporte de tool calling, agentes multi-turno o razonamiento multi-paso: no disponible; no es un modelo conversacional.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible más allá del pipeline robótico descrito.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: el modelo recibe la instrucción y las dos vistas de cámara y emite una trayectoria de 40 pasos con dimensión 132, adecuada para tareas de apilado o aproximación vertical sobre cubos de tres colores como las del dataset de entrenamiento.
- Despliegue en hardware embebido Qualcomm IQ-9075: al estar compilado para Hexagon v73 con QAIRT 2.47.0.260601, permite ejecutar la política en un SoC de bajo consumo sin GPU dedicada, siempre que se respete el límite de 2 GiB por contexto.
- Validación de regresión en dispositivo: los tensores golden con semilla 0 y el comando `verify` del CLI permiten comprobar que una actualización de firmware o de runtime no altera las salidas del modelo.
- Investigación en cuantización de políticas VLA: sirve como referencia reproducible de cómo particionar un modelo de 5.371 millones de parámetros en contextos por debajo de 2 GiB y mantener coherencia numérica frente al checkpoint original.
- Integración en pipelines de robótica con QNN: los recursos de glue de host incluidos facilitan conectar el bundle con el runtime NQRR en un sistema de control existente.
- Auditoría de procedencia de modelos: el fingerprint del manifiesto y el `weights_sha256` del checkpoint permiten rastrear la cadena de conversión desde el entrenamiento hasta el binario desplegado.
- Reproducción de experimentos de flow matching en robótica: la configuración de un solo paso de DiT y la semilla fija hacen viable repetir capturas y comparar resultados entre revisiones del bundle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta métricas de empaquetado (tamaños de contexto, porcentaje respecto al límite de 2 GiB, fingerprint y hashes), no métricas de precisión de la política ni tasas de éxito en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo se ejecuta sobre NPU Hexagon v73 con VTCM de 8 MB y buffers de contexto de hasta 1.925,3 MiB.
- GPU recomendadas: no aplica; el bundle está compilado específicamente para `soc_id` 77 y `dsp_arch` v73 (Qualcomm IQ-9075 / QCS9075).
- Compatibilidad con GPU de consumo: no; requiere el SoC Qualcomm indicado y el runtime NQRR con QAIRT 2.47.0.260601 fijado.
- Opciones de despliegue: runtime NQRR sobre QNN/HTP; el CLI `nqrr.core.bundle_cli` permite verificar, calcular fingerprint y extraer el bundle, y usa solo la biblioteca estándar de Python.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| geonmin-kim/nqrr-GR00T-Mdrift_crop128_cft-Dclean1106v1 (este) | 5.371.150.336 | 64 tokens de secuencia | Bundle `nqrr/3` con safetensors | other | Hugging Face, 0 descargas |
| geonmin-kim/GR00T-Mdrift_crop128_cft-Dclean1106v1-frommergedv4-step3000 (checkpoint origen) | no disponible en la información | no disponible | safetensors | no disponible | Hugging Face (referenciado como fuente) |
| Otras políticas VLA de la familia GR00T N1.7 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El bundle está atado a un hardware concreto (`soc_id` 77, `dsp_arch` v73) y a QAIRT 2.47.0.260601; no es portable a otras NPU, GPU o versiones de runtime.
- El límite de 2 GiB por buffer de contexto en Hexagon v73 es un riesgo operativo: el contexto `llm_0` ocupa el 94,0% del límite, por lo que cualquier cambio que aumente su tamaño impedirá la carga.
- La longitud de contexto es de solo 64 tokens, con padding por la izquierda; no admite instrucciones largas ni conversaciones multi-turno.
- El modelo está entrenado para una tarea concreta (manipulación de cubos de tres colores con aproximación vertical y sin reinicio humano); se desconoce su generalización a otros objetos, geometrías o entornos.
- La reproducibilidad del golden depende de la semilla de ruido 0: el ruido se extrae del RNG global de la política, por lo que sin la semilla no puede regenerarse el tensor de referencia.
- El fingerprint del bundle es el sha256 del `manifest.json`, no el hash del fichero completo; la identidad debe comprobarse con el CLI y no por nombre o revisión del repositorio.
- Licencia `other`: no se detallan condiciones de uso comercial, redistribución ni atribución; es necesario contactar con el autor antes de un uso en producción.
- No se han publicado evaluaciones de sesgo, alucinación o robustez; al tratarse de una política de acción, los fallos se manifiestan como movimientos incorrectos del robot y requieren supervisión y paradas de seguridad.
- El repositorio registra 0 descargas y 0 likes, y no hay documentación externa adicional sobre el modelo o el runtime NQRR.

## Enlaces

- Repositorio del bundle: https://huggingface.co/geonmin-kim/nqrr-GR00T-Mdrift_crop128_cft-Dclean1106v1-frommergedv4-step3000
- Checkpoint de origen: `geonmin-kim/GR00T-Mdrift_crop128_cft-Dclean1106v1-frommergedv4-step3000` (revisión `7a6dd8688db376a4d90ecf69436a5b0d65a9ab63`)
- Dataset de entrenamiento: `geonmin-kim/SO101-lv4-3color-cube-mat-to-mat-no-human-reset-vertical-approach-clean-1106-v1`
- Paper, blog, repositorio de código o demo del runtime NQRR: no disponible en la información proporcionada.
