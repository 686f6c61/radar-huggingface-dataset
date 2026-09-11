# geonmin-kim/notaqnn-GR00T-Mfm_crop192_cft-Dwework_imperial-step5000

## Resumen

Este repositorio no contiene un modelo de lenguaje al uso, sino un paquete de despliegue (bundle) en formato `notaqnn/3` que empaqueta la política robótica GR00T N1.7 para ejecutarla en la NPU Hexagon v73 del SoC Qualcomm QCS9075 (plataforma IQ-9075). Lo publica el usuario `geonmin-kim` y su propósito es permitir inferencia del modelo de visión-lenguaje-acción (VLA) directamente sobre hardware embebido Qualcomm, sin necesidad de un servidor con GPU.

El bundle ocupa 5.699.692.299 bytes (5,31 GiB) e integra cuatro binarios de contexto HTP (`dit_step_0`, `dit_step_1`, `llm_0`, `vision`), tensores dorados de frontera y recursos de pegamento (glue) para el host. Los pesos reales del modelo suman 5.372.170.240 parámetros, serializados en `model.safetensors` junto con ficheros en texto plano. Cada miembro del bundle es un intervalo contiguo de bytes, de modo que el runtime lo lee por offsets sin extracción previa.

Es relevante porque documenta un flujo completo de conversión y validación de un modelo fundacional de robótica hacia NPU: fija la versión exacta de QAIRT (2.47.0.260601), el `soc_id` (77), la arquitectura DSP (`v73`) y una restricción dura de 2 GiB por buffer de pesos de contexto, con porcentajes de ocupación medidos para cada grafo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA GR00T N1.7: codificador de visión, backbone tipo LLM y cabeza de acción DiT (diffusion transformer) con flow matching |
| Parametros totales | 5.372.170.240 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | seq_len 96 con padding a la izquierda (prompt medido en captura: [93]) |
| Tipos de cuantizacion | 8 bits (etiqueta `8-bit`); empaquetado en binarios de contexto HTP de QNN |
| Idiomas soportados | no disponible (modelo de robótica; no se declaran idiomas) |
| Licencia | other |
| Formato de pesos | `model.safetensors` (5,37 B de parámetros) más binarios de contexto QNN/HTP y ficheros en texto plano dentro del bundle `notaqnn/3` |
| Tamaño del bundle | 5.699.692.299 B (5,31 GiB) |
| Formato del contenedor | `notaqnn/3` |
| Fingerprint | `553d74ec2058103cd6f79ad0685cf7ab26d6e85727e28952b8d565ff6e2b3338` (sha256 del texto de `manifest.json`) |
| QAIRT | 2.47.0.260601 (fijado) |
| Destino | soc_id 77, dsp_arch v73, VTCM 8 MB |
| Pipeline | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es una política GR00T N1.7 para control robótico, con una estructura de tres bloques que se refleja directamente en los binarios de contexto del bundle: un grafo `vision` (codificador visual, 779,7 MiB), un grafo `llm_0` (backbone tipo lenguaje, 1.925,4 MiB) y dos grafos DiT (`dit_step_0` de 1.062,3 MiB y `dit_step_1` de 1.059,2 MiB) que implementan la cabeza de acción. El README indica explícitamente el uso de flow matching, ya que los tensores dorados se generan con una semilla de ruido de flow matching fijada a 0; además, la extracción del ruido se hace desde el RNG global interno de la política, por lo que el golden solo es reproducible con esa semilla.

La configuración de inferencia está fijada en el bundle: `seq_len` de 96, dos vistas de cámara con 144 parches por vista y 36 tokens visuales por vista, geometría de imagen `resize [192,192] → crop central [192,192] → resize [192,192]`, cuatro pasos de muestreo DiT repartidos en dos splits, horizonte de acción de 40 pasos y `max_action_dim` de 132. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de preentrenamiento ni si hubo fases de RLHF o DPO; el único dato de entrenamiento es el identificador del job (`exp105_groot_fm_192full_wework_imperial`) y el checkpoint origen.

La innovación destacable no está en el modelo, sino en el empaquetado: cada grafo de contexto debe mantenerse por debajo del límite de 2 GiB (2^31) por buffer de pesos, y la arquitectura v73 no dispone de mecanismos de región lejana como v81+, de modo que superar ese límite impide cargar el contexto. Los porcentajes de ocupación declarados son 94,0% para `llm_0`, 51,9% para `dit_step_0`, 51,7% para `dit_step_1` y 38,1% para `vision`.

## Capacidades

- Generación de acciones motoras para robots: la cabeza DiT produce un horizonte de 40 pasos con dimensión máxima de acción de 132.
- Percepción visual multi-vista: procesa dos vistas de cámara, con 144 parches y 36 tokens visuales por vista a resolución de entrada 192×192.
- Comprensión de instrucciones en lenguaje natural a través del backbone `llm_0`, integrado en el mismo grafo de inferencia que la visión y la acción.
- Ejecución en NPU Hexagon v73 con cuantización de 8 bits, sin GPU dedicada.
- Verificación criptográfica de integridad: el formato `notaqnn/3` permite comprobar todos los miembros (contextos, golden y assets), no solo los contextos.
- Reproducción bit a bit de los tensores dorados bajo condiciones fijadas (frame 0 del dataset de referencia y semilla de flow matching 0).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de pensamiento (thinking), audio u otras modalidades: no disponibles.

## Casos de uso

- Control de robots humanoides en el borde: el bundle está diseñado para ejecutarse íntegramente en la NPU del QCS9075, de modo que un robot puede interpretar instrucciones y emitir acciones sin depender de conectividad ni de un servidor externo.
- Validación de pipelines de conversión a NPU: el fingerprint y la verificación de miembros permiten certificar que un artefacto desplegado coincide exactamente con el bundle auditado antes de flashearlo en producción.
- Pruebas de regresión en dispositivo: `bundle_cli verify` compara hashes de contextos, golden y assets, lo que sirve como puerta de calidad (gate) en CI para detectar regresiones de conversión entre versiones de QAIRT.
- Reproducción de resultados experimentales: con el dataset `SO101-lv4-wework-imperial-merged`, el frame 0 y la semilla 0 se puede regenerar el golden y comparar la salida del hardware frente a la referencia.
- Investigación en manipulación robótica con flow matching: el modelo permite experimentar con políticas de acción basadas en DiT de 4 pasos sobre una plataforma embebida de bajo consumo.
- Integración en cadenas de montaje o laboratorios con restricciones de espacio y energía, donde no es viable instalar una GPU: el bundle ocupa 5,31 GiB de almacenamiento y se ejecuta sobre el DSP integrado.
- Auditoría de cadena de procedencia de pesos: los hashes `weights_sha256`, la revisión del checkpoint y los commits de conversión y definición del modelo permiten reconstruir el origen exacto del artefacto.
- Extracción y análisis de los binarios: `bundle_cli extract` vuelca los miembros a un directorio para inspeccionar los grafos de contexto o los tensores dorados con herramientas estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único mecanismo de evaluación documentado es la comparación contra los tensores dorados de frontera, generados con el frame 0 del dataset `SO101-lv4-wework-imperial-merged` y semilla de flow matching 0, que actúan como puerta de verificación numérica en dispositivo en lugar de como métrica de calidad de tarea.

## Requisitos de hardware

- Plataforma obligatoria: Qualcomm IQ-9075 (QCS9075) con NPU Hexagon v73, `soc_id` 77 y 8 MB de VTCM.
- Toolchain: QAIRT 2.47.0.260601, versión fijada; no se documenta compatibilidad con otras versiones.
- Almacenamiento: 5,31 GiB para el bundle completo, más el espacio necesario si se extrae con `bundle_cli extract`.
- Memoria por contexto: cada buffer de pesos de contexto debe quedar por debajo de 2 GiB (2^31). `llm_0` está al 94,0% de ese límite, por lo que no hay margen práctico para ampliarlo en v73.
- GPU dedicada: no aplica. El artefacto no está pensado para ejecutarse en A100, H100, RTX 4090 ni ninguna GPU de consumo; no se dispone de VRAM estimada porque el destino es una NPU.
- Despliegue: runtime propietario de QNN sobre HTP, gestionado mediante el CLI del paquete `notaqnn` (`verify`, `fingerprint`, `extract`), que solo requiere la biblioteca estándar de Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este bundle (notaqnn GR00T N1.7) | 5.372.170.240 | seq_len 96, horizonte de acción 40 | `notaqnn/3` con safetensors y contextos HTP de 8 bits | other | Repositorio HuggingFace, 0 descargas |
| Checkpoint origen GR00T-Mfm_crop192_cft-Dwework_imperial-step5000 | no disponible | no disponible | pesos PyTorch (revisión `0f3ca8e7…`) | no disponible | Repositorio HuggingFace referenciado |
| Otras alternativas VLA comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

La comparación relevante en este caso es entre el bundle y su checkpoint origen: el bundle añade cuantización de 8 bits, partición en cuatro contextos HTP y golden tensors, mientras que el checkpoint contiene los pesos sin adaptar al hardware Qualcomm. No se han proporcionado datos de otros modelos de la misma categoría para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Licencia `other`: no se detallan en la información disponible los términos exactos, por lo que el uso comercial requiere revisar el texto completo de la licencia antes de cualquier despliegue.
- Dependencia estricta de hardware: el artefacto solo es utilizable en QCS9075 con Hexagon v73. No hay ruta de ejecución en GPU, CPU de escritorio ni en versiones posteriores de DSP con la misma configuración.
- Versión de QAIRT congelada: el bundle fija QAIRT 2.47.0.260601; no se documenta comportamiento con otras versiones.
- Sin idiomas declarados ni evaluación de capacidades lingüísticas: no se puede asumir un rendimiento multilingüe ni una comprensión robusta de instrucciones fuera de la distribución de entrenamiento.
- Riesgo de alucinación en el sentido de acciones incorrectas: al ser una política de control, una salida errónea se traduce en movimiento físico, con riesgo asociado para personas y equipos. No se documentan métricas de seguridad ni de tasa de fallo.
- Golden no reproducible sin la semilla: la extracción del ruido de flow matching usa el RNG global interno de la política, de modo que una nueva captura con el mismo checkpoint y frame puede arrojar valores distintos. La verificación depende de conservar la semilla 0.
- Identidad del bundle basada en el fingerprint del `manifest.json`, no en el hash del fichero completo; la integridad de cada miembro se comprueba contra el inventario `files` de ese manifiesto.
- Sin resultados de benchmarks de tarea: no hay MMLU, HumanEval, GSM8K ni métricas de éxito en manipulación publicadas en la información disponible.
- Presupuesto de contexto muy ajustado en `llm_0` (94,0% del límite de 2 GiB): cualquier modificación que aumente el tamaño de ese grafo impedirá su carga en v73.
- Repositorio sin tracción: 0 descargas y 0 likes, sin comunidad que haya validado el artefacto de forma independiente.

## Enlaces

- Repositorio HuggingFace del bundle: https://huggingface.co/geonmin-kim/notaqnn-GR00T-Mfm_crop192_cft-Dwework_imperial-step5000
- Checkpoint origen: `geonmin-kim/GR00T-Mfm_crop192_cft-Dwework_imperial-step5000`, revisión `0f3ca8e735921caa9d59dde76a933ccf861e29eb`
- Dataset de referencia para el golden: `geonmin-kim/SO101-lv4-wework-imperial-merged`
- Commits de referencia: conversión `3a6701944eb0164bd7405345cf2432a93042bb64`; definición del modelo `d508b3adac64f7b01922653f35eb494d9bc8931a`
- Búsqueda web: los resultados recuperados no guardan relación con el modelo (páginas de soporte de Windows), por lo que no se incluye ningún enlace adicional. No se han encontrado papers, blogs, repositorios ni demos asociados en la información disponible.
