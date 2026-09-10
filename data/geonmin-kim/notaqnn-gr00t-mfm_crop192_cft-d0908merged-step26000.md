# geonmin-kim/notaqnn-GR00T-Mfm_crop192_cft-D0908merged-step26000

## Resumen

Este repositorio no contiene un modelo de lenguaje en el sentido habitual, sino un paquete de despliegue (bundle) en formato propietario `notaqnn/3` que empaqueta la política robótica GR00T N1.7 para ejecutarla en la NPU Hexagon v73 del SoC Qualcomm QCS9075 (plataforma IQ-9075). Lo publica el usuario geonmin-kim y está pensado para inferencia en dispositivo: incluye binarios de contexto HTP, tensores «golden» de frontera y los activos de pegamento del host necesarios para que el runtime de QNN cargue y valide el grafo sin desempaquetado previo.

El bundle se deriva del checkpoint `geonmin-kim/GR00T-Mfm_crop192_cft-D0908merged-step26000` (revisión `677d49599c894ead172dc3e5fdc5d46a3a022c60`, pesos con sha256 `35aabac6…dda23`, trabajo de entrenamiento `exp103_groot_fm_192full_0908merged`). La conversión se realizó con el conversor en el commit `3a6701944eb0164bd7405345cf2432a93042bb64` y la definición de modelo en `d508b3adac64f7b01922653f35eb494d9bc8931a`. Su relevancia es acotada pero concreta: es un artefacto de inferencia para robótica de manipulación en hardware de bajo consumo, no un modelo para chat ni para generación de texto.

El tamaño declarado es de 5.372.170.240 parámetros según la metadata de safetensors, con un bundle de 5.699.702.031 bytes (5,31 GiB) y un repositorio de 5,7 GB. La ventana de secuencia es de 96 tokens (prompt medido en la captura: 93), con margen escaso en el grafo del LLM respecto al límite de 2 GiB por búfer de pesos de la NPU. No hay resultados de benchmarks, ni idiomas declarados, ni documentación pública de la licencia «other» más allá de la etiqueta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA (visión-lenguaje-acción) GR00T N1.7; el bundle descompone el grafo en `vision`, `llm_0` y dos etapas DiT (`dit_step_0`, `dit_step_1`). No se declara explícitamente en la model card; se deduce de la estructura del paquete |
| Parametros totales | 5.372.170.240 (metadata de safetensors) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | 96 tokens (`seq_len` 96 con padding a la izquierda; prompt real medido en la captura: 93) |
| Tipos de cuantizacion | 8 bits (etiqueta del repositorio); pesos en safetensors más ficheros planos dentro del bundle |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | `notaqnn/3`: miembro `model.safetensors` (con los miembros grandes concatenados por rangos de bytes) más ficheros planos, binarios de contexto HTP y `manifest.json` |
| Tamano del bundle | 5.699.702.031 B (5,31 GiB); repositorio: 5,7 GB |
| Fingerprint | `15bb827f7bdf0544ec229075e42db3af98cbffe5726b74771325f2d2f41dfacf` (sha256 del texto de `manifest.json`, no del fichero completo) |
| Runtime objetivo | QAIRT 2.47.0.260601 (versión fijada) |
| Destino de hardware | soc_id 77, dsp_arch v73, VTCM 8 MB |
| Vision | 2 vistas, 144 parches por vista, 36 tokens de visión |
| Geometria de imagen | resize [192, 192] → recorte central [192, 192] → resize [192, 192] |
| Cabeza de accion (DiT) | 4 pasos, 2 particiones (4 llamadas medidas en la captura) |
| Acciones | horizonte 40, `max_action_dim` 132 |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

El bundle no expone la arquitectura del modelo subyacente con detalle: lo que se documenta es la topología del grafo compilado para HTP, dividida en cuatro binarios de contexto. `vision` ocupa 779,7 MiB (38,1 % del límite de 2 GiB), `llm_0` ocupa 1.925,4 MiB (94,0 %), y las dos etapas del DiT ocupan 1.062,3 MiB y 1.059,2 MiB respectivamente (51,9 % y 51,7 %). Esa partición —codificador visual, tronco tipo LLM y cabeza de difusión en varios pasos— es coherente con una política VLA con generación de acciones por *flow matching*: la model card menciona explícitamente una semilla de ruido de *flow matching* con valor 0 para reconstruir el golden. La cabeza se ejecuta en 4 pasos repartidos en 2 particiones, lo que da 4 llamadas al grafo por inferencia.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset base ni si hubo RLHF o DPO; se trata de una política de robótica, no de un modelo alineado por preferencias humanas. Lo único trazable del entrenamiento es el identificador del trabajo (`exp103_groot_fm_192full_0908merged`) y el checkpoint de origen (paso 26000). La validación en dispositivo se apoya en un golden extraído del dataset `geonmin-kim/SO101-lv4-3color-cube-mat-to-mat-release-3regions-0908-merged`, fotograma 0, con semilla de ruido 0; la model card advierte que sin esa semilla el golden no es reproducible, porque el ruido se muestrea desde el RNG global interno de la política.

## Capacidades

- Generación de acciones de manipulación robótica: produce *chunks* de acción con horizonte 40 y dimensión máxima de acción 132, a partir de observaciones visuales e instrucción.
- Percepción visual dual: procesa 2 vistas de cámara, 144 parches por vista y 36 tokens de visión por paso, con imágenes redimensionadas y recortadas a 192 × 192.
- Ejecución de la cabeza de acción por *flow matching* en 4 pasos, dividida en 2 particiones del grafo.
- Inferencia íntegra en NPU Hexagon v73, sin necesidad de GPU en el dispositivo.
- Validación de integridad del paquete: verificación de hashes de todos los miembros (`ctx`, `golden` y `assets`) mediante `notaqnn.core.bundle_cli verify`.
- Extracción de miembros a disco mediante `notaqnn.core.bundle_cli extract` y consulta del fingerprint del bundle.
- No se declara soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso textual, matemáticas, generación de código ni capacidades multilingües; no es un modelo conversacional.
- No se declaran capacidades de audio ni modos de «pensamiento» explícitos.

## Casos de uso

- Manipulación pick-and-place de cubos sobre superficie: el golden de referencia se extrae del dataset SO101 lv4 de cubos de tres colores en tarea *mat-to-mat*, de modo que el caso de uso directo es recoger y colocar objetos en posiciones objetivo con un brazo SO-101 equipado con dos cámaras.
- Despliegue en robótica de borde sin GPU: al ser un bundle HTP para QCS9075, permite ejecutar la política en un brazo o celda robotizada alimentada por un SoC de bajo consumo, evitando una estación con GPU dedicada.
- Regresión de despliegue en NPU: los tensores golden de frontera y los hashes por miembro permiten detectar si una recompilación o un cambio de versión de QAIRT altera numéricamente la inferencia antes de desplegar en el robot.
- Auditoría y reproducibilidad de conversiones: el fingerprint (sha256 de `manifest.json`) y el sha256 de los pesos de origen (`35aabac6…dda23`) permiten certificar que un bundle concreto proviene del checkpoint declarado, incluso si el repositorio desaparece.
- Medición de latencia en dispositivo: la estructura de 4 llamadas al DiT y 2 particiones hace medible el coste por paso de *flow matching* en la NPU y comparable entre revisiones del conversor.
- Investigación en cuantización de políticas VLA: sirve como caso de estudio de qué partes de una política (visión, tronco, cabeza de difusión) caben en el límite de 2 GiB por búfer de pesos y cuáles quedan al borde (el grafo `llm_0` al 94,0 %).
- Demostraciones de laboratorio y validación de *pipelines* de captura: útil para comprobar que un *pipeline* de adquisición de imágenes con geometría 192 × 192 y dos vistas reproduce las condiciones de la captura original.
- Comparación entre variantes de *checkpoint*: al conservar la revisión y el hash del origen, permite enfrentar este bundle contra otras conversiones del mismo entrenamiento para aislar diferencias de precisión o de particionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay MMLU, HumanEval, GSM8K ni métricas de éxito de tarea (por ejemplo, tasa de acierto en la tarea de cubos) en la model card ni en el material proporcionado.

Lo único verificable cuantitativamente es la estructura interna del bundle:

| Grafo | Tamano | Uso del limite de 2 GiB |
|---|---|---|
| `dit_step_0` | 1.062,3 MiB | 51,9 % |
| `dit_step_1` | 1.059,2 MiB | 51,7 % |
| `llm_0` | 1.925,4 MiB | 94,0 % |
| `vision` | 779,7 MiB | 38,1 % |

Referencia de validación: golden sobre el fotograma 0 del dataset `geonmin-kim/SO101-lv4-3color-cube-mat-to-mat-release-3regions-0908-merged`, con semilla de ruido de *flow matching* 0. No se publican tolerancias numéricas ni resultados de la comparación.

## Requisitos de hardware

- Hardware de destino obligatorio: SoC Qualcomm QCS9075 (plataforma IQ-9075), arquitectura DSP v73, `soc_id` 77, con 8 MB de VTCM.
- Runtime: QAIRT 2.47.0.260601, versión fijada. No se documenta compatibilidad con otras versiones.
- Restricción crítica de memoria: cada búfer de pesos de un contexto debe ser inferior a 2 GiB (2^31). La arquitectura v73 no dispone de la extensión *far-region* de v81 y superiores, por lo que un contexto que alcance el 100 % no se cargará. El grafo `llm_0` está al 94,0 %, con un margen de aproximadamente 121 MiB.
- Almacenamiento: 5,31 GiB para el bundle; el repositorio completo ocupa 5,7 GB.
- VRAM para GPU: no disponible y, en la práctica, no aplicable; el formato es un binario de contexto HTP para NPU, no un peso cargable en CUDA.
- GPU de consumo (RTX 4090, etc.): no compatible con este formato de despliegue.
- Opciones de despliegue: runtime QNN/QAIRT sobre el SoC objetivo, más las utilidades `notaqnn` (`verify`, `fingerprint`, `extract`), que solo usan la biblioteca estándar de Python y pueden ejecutarse en el propio dispositivo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La card indica que el DiT se ejecuta en 4 pasos con 4 llamadas medidas en la captura, pero no publica tiempos por llamada ni frecuencia de control.

## Comparativa con modelos similares

No hay datos de benchmarks ni especificaciones de alternativas en la información proporcionada, por lo que no es posible establecer una comparativa de rendimiento. La única comparación trazable es contra el checkpoint de origen del que deriva el bundle:

| Modelo | Parametros | Contexto | Formato | Destino | Licencia |
|---|---|---|---|---|---|
| Este bundle (`notaqnn-GR00T-Mfm_crop192_cft-D0908merged-step26000`) | 5.372.170.240 | 96 tokens | `notaqnn/3` (safetensors + binarios de contexto HTP) | NPU Hexagon v73 (QCS9075) | other |
| Checkpoint de origen `geonmin-kim/GR00T-Mfm_crop192_cft-D0908merged-step26000` (revisión `677d4959…`) | No disponible | No disponible | No disponible (probablemente safetensors) | GPU/host genérico | No disponible |
| Otras conversiones o políticas VLA comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: su salida son acciones de manipulación, no texto. No sirve para chat, generación de código ni razonamiento textual.
- Contexto muy corto: 96 tokens de secuencia con padding a la izquierda. Las instrucciones largas o el historial extenso no caben.
- Repositorio sin tracción ni validación externa: 0 descargas y 0 *likes* en el momento de la consulta, sin benchmarks publicados.
- Fechas del repositorio anómalas: creación y actualización declaradas como 2026-09-10. Conviene verificar la coherencia temporal antes de tratarlo como artefacto estable.
- Licencia «other» sin texto público en la información disponible: hay que localizar y revisar los términos completos antes de cualquier uso comercial. Además, la política base GR00T N1.7 de NVIDIA puede arrastrar sus propias condiciones, que no se detallan aquí.
- Dependencia estricta de hardware y runtime: atado a `dsp_arch` v73 y a QAIRT 2.47.0.260601. No es portable a otros SoC, otras versiones del DSP ni a GPUs.
- Margen de memoria escaso: `llm_0` ocupa el 94,0 % del límite de 2 GiB por búfer de pesos. Cualquier cambio de compilación, precisión o versión de QAIRT puede hacer que el contexto no cargue.
- Fingerprint malinterpretable: el valor publicado es el sha256 del texto de `manifest.json`, no el hash del fichero del bundle. No debe usarse como suma de verificación del fichero completo.
- Golden no reproducible sin la semilla: el ruido de *flow matching* procede del RNG global interno de la política, así que la misma captura sobre el mismo fotograma produce valores distintos si no se fija la semilla 0.
- Sesgo y dominio muy acotados: el golden proviene de un dataset concreto de cubos de tres colores en tarea *mat-to-mat* sobre SO-101. Es esperable un comportamiento degradado fuera de esa distribución (otros objetos, iluminaciones, geometrías de cámara o tareas).
- Riesgo operativo en lugar de «alucinación»: el fallo típico no es inventar texto, sino producir acciones incorrectas o inseguras en el robot cuando la observación se aleja del dominio de entrenamiento. Requiere supervisión y límites de par/fuerza en producción.
- Entradas sensoriales restringidas: 2 vistas, 144 parches por vista y 36 tokens de visión con imágenes a 192 × 192. No se contemplan otras modalidades (táctil, audio, profundidad adicional) en la documentación.
- Idiomas: no disponibles. No se declara qué idioma aceptan las instrucciones ni si aceptan instrucciones en absoluto como texto libre.
- Resultados de la búsqueda web no relevantes: las consultas devolvieron páginas de ayuda de inicio de sesión de Gmail y Hotmail, sin relación con el modelo. No hay documentación externa, *paper* ni blog verificable para este bundle.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/geonmin-kim/notaqnn-GR00T-Mfm_crop192_cft-D0908merged-step26000
- Checkpoint de origen: https://huggingface.co/geonmin-kim/GR00T-Mfm_crop192_cft-D0908merged-step26000
- Revisión del checkpoint de origen: `677d49599c894ead172dc3e5fdc5d46a3a022c60`
- Dataset del golden: https://huggingface.co/datasets/geonmin-kim/SO101-lv4-3color-cube-mat-to-mat-release-3regions-0908-merged
- Commit del conversor: `3a6701944eb0164bd7405345cf2432a93042bb64`
- Commit de la definición de modelo: `d508b3adac64f7b01922653f35eb494d9bc8931a`
- Trabajo de entrenamiento: `exp103_groot_fm_192full_0908merged`
- sha256 de los pesos de origen: `35aabac6225003372ae1125861fbe965ac6fa1a15c04ac06b14e0bc4421dda23`
- Fingerprint del bundle: `15bb827f7bdf0544ec229075e42db3af98cbffe5726b74771325f2d2f41dfacf`
- Herramientas de verificación: `python -m notaqnn.core.bundle_cli verify|fingerprint|extract`
- Papers, blogs, repositorios o demos adicionales: no disponible (la búsqueda web no devolvió resultados relevantes)
