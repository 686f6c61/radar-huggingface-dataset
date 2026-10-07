# AutomatosX/AX-Nemotron-3.5-Lightning-30B-A3B-MLX-AXQ-MXFP8-MTP

## Resumen

AX-Nemotron-3.5-Lightning-30B-A3B-MLX-AXQ-MXFP8-MTP es una conversión cuantizada en formato MLX del modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por el usuario AutomatosX bajo la licencia OpenMDW 1.1. Se trata de un artefacto de desarrollo generado con la herramienta AXQuant, que aplica cuantización MXFP8 (8 bits de precisión en formato microscaling) sobre los pesos del backbone del modelo original en BF16, manteniendo ciertos tensores en su precisión declarada. El repositorio contiene 31.577.935.872 parámetros reales según los ficheros safetensors, con un tamano total de 35,6 GB.

El modelo base pertenece a la arquitectura Nemotron-H, una familia híbrida de NVIDIA, y su nomenclatura "30B-A3B" indica un diseno de mezcla de expertos con aproximadamente 30.000 millones de parámetros totales y alrededor de 3.000 millones activos por token, aunque este ultimo dato no se confirma explicitamente en la informacion disponible. La relevancia de esta publicacion radica en que permite ejecutar un modelo de gran tamano en hardware Apple Silicon mediante MLX, reduciendo el coste de memoria frente a la version BF16 original.

Se trata de un artefacto de desarrollo sin certificado de calidad, velocidad ni exactitud MTP. El propio autor advierte que la compatibilidad en tiempo de ejecucion del payload MTP (Multi-Token Prediction) no esta verificada, y que no reclama soporte de ejecucion MTP en MLX-LM, AX Engine, MTPLX ni oMLX. Por tanto, debe tratarse como material experimental y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (hibrida; segun tag `nemotron_h` del repositorio) |
| Parametros totales | 31.577.935.872 (dato real de safetensors) |
| Parametros activos | Aproximadamente 3.000 millones, indicado por la nomenclatura A3B (no confirmado en la ficha) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (8 bits, microscaling); tensores protegidos conservan su precision declarada |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (MLX), mas un fichero `mtp.safetensors` separado |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 |
| Revision fuente inmutable | a9904d24bcc1d289a1950fa9d2b978c47cf903b9 |
| Tamano del repositorio | 35,6 GB |
| Libreria | MLX |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Nemotron-H de NVIDIA. El tag `nemotron_h` del repositorio identifica esta familia, que corresponde a un diseno hibrido de tipo Mamba-Transformer orientado a eficiencia en secuencias largas, aunque la informacion proporcionada no detalla la composicion exacta de capas, el numero de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO. La nomenclatura "30B-A3B" apunta a una configuracion de mezcla de expertos, pero no se aportan datos confirmados sobre el numero de expertos, el enrutador ni la distribucion de parametros activos.

Esta publicacion no es un entrenamiento nuevo, sino una conversion de cuantizacion. AXQuant aplica el formato fisico MXFP8 sobre los pesos elegibles del backbone, generando un checkpoint compatible con el config, tokenizer, index y safetensors estandar de MLX-LM. Los tensores protegidos mantienen su precision declarada. Ademas, el repositorio incorpora un payload MTP (Multi-Token Prediction) que el autor preserva byte a byte en `mtp.safetensors`, con los digests de origen y payload registrados en `ax_nemotron_mtp_manifest.json`. La ficha aclara que no se reclama soporte de ejecucion MTP en ningun runtime y que la compatibilidad no esta verificada. Una auditoria de formato remota (2026-10-06) corrigio el modo del contenedor de cuantizacion de `affine` a `mxfp8`, sin modificar los bytes de los pesos ni las asignaciones de precision por modulo.

## Capacidades

- Generacion de texto y conversacion, segun los tags `text-generation` y `conversational` del repositorio.
- Ejecucion local en Apple Silicon mediante la libreria MLX, con carga estandar a traves de `mlx_lm.load`.
- Capacidad potencial de decodificacion especulativa o multi-token mediante el payload MTP incluido, aunque el autor advierte que su compatibilidad en tiempo de ejecucion no esta verificada.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles; el pipeline declarado es exclusivamente de generacion de texto.

## Casos de uso

- Ejecucion local en portatiles Apple Silicon: la cuantizacion MXFP8 reduce el espacio de pesos respecto al BF16 original, permitiendo cargar el backbone en equipos con memoria unificada suficiente mediante MLX-LM.
- Experimentacion e investigacion en cuantizacion: el repositorio incluye el plan AXQuant y los hashes de ficheros, lo que permite reproducir y auditar el proceso de conversion MXFP8 sobre un modelo Nemotron-H.
- Evaluacion de formatos microscaling: util para comparar el comportamiento de MXFP8 frente a otros esquemas de cuantizacion en un backbone de ~31.600 millones de parametros.
- Pruebas de decodificacion multi-token: investigacion sobre el payload MTP preservado, siempre que el runtime elegido implemente su soporte de forma independiente.
- Generacion de texto conversacional en prototipos: el modelo puede emplearse en demos de chat locales para validar calidad frente al modelo base, dado el pipeline declarado.
- Integracion en pipelines de MLX: al seguir el formato estandar de MLX-LM, puede incorporarse en flujos existentes que ya usan esa libreria sobre hardware de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que este artefacto no anade ninguna reclamacion de calidad, exactitud MTP, velocidad ni certificacion.

## Requisitos de hardware

- VRAM / memoria unificada estimada: el repositorio ocupa 35,6 GB, con 31.577.935.872 parametros en cuantizacion MXFP8 mas el payload MTP. Se requiere memoria unificada de al menos ~40 GB para cargar el modelo y disponer de margen para el contexto y la cache KV.
- GPU recomendadas: la libreria declarada es MLX, orientada a Apple Silicon, por lo que el objetivo principal son equipos Mac con chip de la serie M y memoria unificada amplia (configuraciones de 64 GB o superiores).
- GPU NVIDIA: no disponible en la informacion proporcionada; el formato MXFP8 con contenedor MLX no es directamente compatible con CUDA sin conversion adicional.
- Compatibilidad con GPU de consumo: no confirmada para el formato MLX. En el ecosistema Apple, encaja en configuraciones de gama alta con memoria unificada elevada; en GPU de consumo tipo RTX 4090 (24 GB de VRAM) no cabria sin una cuantizacion adicional.
- Opciones de despliegue: MLX-LM (`mlx_lm.load` y `mlx_lm.generate`), segun el ejemplo de la ficha. AX Engine, MTPLX y oMLX se mencionan como runtimes que gestionan su propio soporte MTP, pero el autor no reclama que funcionen con este artefacto.
- Latencia y throughput: no disponibles. El autor no aporta datos de velocidad y senala que el uso real depende del formato, el contexto y el runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Nemotron-3.5-Lightning-30B-A3B-MLX-AXQ-MXFP8-MTP (este) | 31.577.935.872 | MLX + MXFP8 (8 bits) | no disponible | OpenMDW 1.1 | Conversion de desarrollo con payload MTP separado |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (base) | no disponible | BF16 | no disponible | OpenMDW 1.1 | Fuente original; mayor precision, mayor huella de memoria |
| Otros modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de alternativas en la informacion proporcionada |

## Limitaciones y advertencias

- Artefacto de desarrollo sin certificado de calidad: el autor declara explicitamente que no se anade ninguna reclamacion de calidad, exactitud, velocidad ni certificacion.
- Payload MTP no verificado: la compatibilidad en tiempo de ejecucion de los tensores MTP no esta comprobada, y el autor no reclama soporte en MLX-LM, AX Engine, MTPLX ni oMLX. El ejemplo de carga no activa el MTP.
- Riesgo de alucinacion: no se aportan datos especificos, pero al ser un modelo de generacion de texto en formato cuantizado, el riesgo de alucinacion es inherente y no esta medido.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican en la ficha del repositorio.
- Restricciones de licencia: la licencia es OpenMDW 1.1 (etiquetada como `other` en HuggingFace). Es responsabilidad del usuario revisar los terminos exactos antes de cualquier uso comercial.
- Cambio de configuracion reciente: la auditoria del 2026-10-06 corrigio el modo del contenedor de cuantizacion de `affine` a `mxfp8`; la evidencia de ejecucion previa queda vinculada a la revision original y no se reutiliza para este artefacto corregido.
- Estado de adopcion muy bajo: 49 descargas y 0 likes en el momento de la ficha, lo que limita la validacion comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/AutomatosX/AX-Nemotron-3.5-Lightning-30B-A3B-MLX-AXQ-MXFP8-MTP
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Revision original con evidencia de ejecucion previa: https://huggingface.co/AutomatosX/AX-Nemotron-3.5-Lightning-30B-A3B-MLX-AXQ-MXFP8-MTP/tree/8e6018d4c00ac09e150a67721d415a6af32400b1
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Auditoria de formato: `runtime_audit.json` (incluido en el repositorio)
- Manifiesto MTP: `ax_nemotron_mtp_manifest.json` (incluido en el repositorio)

Nota: los resultados de la busqueda web proporcionados no contienen informacion relevante sobre el modelo; se refieren a entidades y noticias sin relacion con este artefacto, por lo que no se han incorporado.
