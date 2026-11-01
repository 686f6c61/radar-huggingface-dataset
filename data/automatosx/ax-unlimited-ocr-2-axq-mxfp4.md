# AutomatosX/AX-Unlimited-OCR-2-AXQ-MXFP4

## Resumen

AX-Unlimited-OCR-2-AXQ-MXFP4 es un paquete de almacenamiento de pesos derivado de baidu/Unlimited-OCR-2, un modelo de reconocimiento optico de caracteres (OCR) desarrollado por Baidu. Lo publica AutomatosX bajo el identificador AutomatosX/AX-Unlimited-OCR-2-AXQ-MXFP4 y su proposito declarado no es la inferencia, sino servir como referencia de formato para el desarrollo de AXQuant, un espacio de trabajo de cuantizacion propietario. El modelo base tiene 3.343.978.497 parametros y una licencia MIT heredada del repositorio original.

La particularidad del paquete es que 2.196 matrices de atencion, MLP y expertos del modelo linguistico se han recodificado en MXFP4 nativo de MLX con tamano de grupo 32, mientras que los 623 tensores restantes (codificadores de vision, proyector, normas, embeddings, cabeza de salida y los 108 tensores del enrutador e indexador SR-SWA DASH) conservan sus valores y dtypes originales. El resultado ocupa 2,866 GB, equivalentes a 6,855623 BPW medidos incluyendo pesos protegidos, escalas y cabeceras de Safetensors.

Es relevante ahora porque documenta un caso de cuantizacion de un modelo OCR con arquitectura no estandar (grafo SR-SWA con posiciones rotatorias por pagina y ciclo de vida de KV multipagina), y lo hace con trazabilidad completa de hashes SHA-256 y verificacion tensor a tensor. Sin embargo, el propio autor advierte de que no existe ningun comando de inferencia soportado para este repositorio y de que los perfiles estaticos de oMLX y MTPLX lo marcan como no soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con grafo SR-SWA, posiciones rotatorias page-aware y ciclo de vida de KV multipagina (modelo base Unlimited-OCR-2) |
| Parametros totales | 3.343.978.497 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 con group size 32 en 2.196 matrices (U32 empaquetado + escalas U8 E8M0); 623 tensores restantes en dtypes originales |
| Idiomas soportados | multilingual |
| Licencia | MIT |
| Formato de pesos | safetensors (layout empaquetado AXQuant, marcador `axquant_storage_only`) |

## Arquitectura y entrenamiento

El modelo base Unlimited-OCR-2 emplea un grafo SR-SWA (sliding window attention con mecanismo de enrutamiento e indexacion DASH) que requiere posiciones rotatorias conscientes de la pagina y una gestion del ciclo de vida de la cache KV adaptada a documentos de multiples paginas. El paquete incluye codificadores de vision, un proyector multimodal, normas, embeddings y cabeza de salida, lo que confirma una arquitectura multimodal orientada a la lectura de imagenes de documentos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de esta publicacion no esta en el entrenamiento, sino en el empaquetado. Las 2.196 matrices de atencion, MLP y expertos se codifican en MXFP4 nativo de MLX con grupo de 32, manteniendo el nombre `.weight` original como U32 y almacenando un exponente E8M0 por grupo en `.scales`, sin sesgos afines. Los expertos conservan sus nombres y disposicion originales. El autor verifico los 5.015 tensores indexados, comprobo la igualdad exacta de todos los tensores preservados y decodifico de forma independiente 24 muestras de matrices comparandolas con la decuantizacion publica de MLX; esta validacion cubre unicamente el almacenamiento y las operaciones matriciales, no la calidad del modelo.

## Capacidades

- Reconocimiento optico de caracteres sobre imagenes de documentos, segun el modelo base baidu/Unlimited-OCR-2.
- Procesamiento multimodal: el paquete incluye codificadores de vision y proyector, lo que indica entrada de imagenes ademas de texto.
- Soporte multilingue declarado en los metadatos (`language: multilingual`).
- Gestion de documentos de multiples paginas mediante el ciclo de vida de KV multipagina del modelo base.
- Capacidad de inferencia en este repositorio: no soportada. El autor declara explicitamente `standard_inference=false` y ausencia de comando de inferencia valido.
- Tool calling, function calling, agentes y modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Archivado y preservacion de pesos: el paquete sirve como referencia reproducible del layout AXQuant MXFP4, con `axquant_plan.json`, `axquant_source_binding.json`, `SOURCE_SHA256SUMS.txt` y `axquant_manifest.json` para auditar la correspondencia con el modelo original fijado en la revision `9cf077c4b206e0e2a31879df937b0b0bcba3661c`.
- Desarrollo de runtimes de cuantizacion: los desarrolladores de MLX, oMLX o MTPLX pueden usar los tensores empaquetados y las 24 muestras ya verificadas para implementar y probar la decuantizacion MXFP4 con group size 32 antes de integrar el grafo SR-SWA completo.
- Validacion de formatos de almacenamiento: los 6,855623 BPW medidos y la separacion entre pesos empaquetados y protegidos permiten comparar la eficiencia de MXFP4 frente a otros esquemas de cuantizacion sobre un modelo de 3.340 millones de parametros.
- Investigacion en OCR de documentos largos: una vez integrado el runtime, el modelo base esta disenado para lectura de documentos multipagina, lo que lo hace candidato para digitalizacion de archivos administrativos y extraccion estructurada de texto.
- Reproducibilidad de pipelines de cuantizacion: los hashes SHA-256 de los objetos LFS originales permiten reconstruir el proceso de exportacion y verificar que los pesos BF16 de partida son los publicados por Baidu.
- Base para futuras integraciones en produccion: el paquete no es desplegable hoy, pero constituye el artefacto de partida para quien implemente el soporte de SR-SWA y posiciones rotatorias page-aware en un runtime compatible con MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se realiza ninguna afirmacion sobre calidad OCR, comportamiento en documentos largos, limites de memoria, velocidad o MTP, y que no se adjunta certificacion de calidad alguna.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El paquete ocupa 2,866 GB en disco, pero no existe una ruta de carga completa del modelo en ningun runtime, por lo que no puede estimarse la memoria de inferencia real.
- GPU recomendadas: no disponible. No se ha ejecutado ninguna carga o generacion en MLX-LM, MLX-VLM, AX Engine, oMLX ni MTPLX.
- Compatibilidad con GPU de consumo: no verificada. El unico dato objetivo es el tamano de los pesos empaquetados (2,866 GB), insuficiente para determinar si el grafo SR-SWA completo cabe en una GPU consumer.
- Opciones de despliegue: ninguna soportada. Los perfiles estaticos de oMLX y MTPLX reportan `unsupported` y el runtime MLX actual no implementa el grafo SR-SWA, las posiciones rotatorias page-aware ni el ciclo de vida de KV multipagina.
- Latencia y throughput: no disponible. No se realizaron mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado de inferencia |
|---|---|---|---|---|---|
| AX-Unlimited-OCR-2-AXQ-MXFP4 (este) | 3.343.978.497 | no disponible | MIT | safetensors MXFP4 empaquetado | no soportada |
| baidu/Unlimited-OCR-2 | no disponible en la informacion proporcionada | no disponible | MIT | BF16 (safetensors) | soportada por el autor original |
| Otros modelos OCR de ~3B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo base del que deriva. No se dispone de datos de rendimiento ni de especificaciones de contexto de alternativas OCR comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no permite inferencia: el autor declara `standard_inference=false`, los perfiles de oMLX y MTPLX lo marcan como `unsupported` y no existe ningun comando de carga o generacion valido.
- Los archivos Python incluidos son material de archivo sin modificar; su cargador BF16 no puede asumir el layout empaquetado y fallaria o produciria resultados incorrectos.
- La cuantizacion no es calibracion ni un resultado de calidad: el plan es explicitamente no medido y no se adjunta certificacion de calidad OCR.
- La validacion realizada cubre solo el almacenamiento y las operaciones matriciales (24 muestras decodificadas), no el comportamiento del modelo completo.
- No se ha verificado el comportamiento en documentos largos, los limites de memoria, la velocidad ni el rendimiento en generacion especulativa (MTP).
- El modelo base es multilingue segun los metadatos, pero no se detalla la lista concreta de idiomas ni la cobertura por idioma.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada para el modelo base ni para este paquete.
- Licencia MIT heredada de Baidu, con el aviso oficial preservado en el archivo `LICENSE` (blob Git `890d455ae73d1d930eee703ce1e5478783ec9154`). El uso comercial esta permitido por la licencia, pero la ausencia de runtime funcional impide cualquier despliegue en produccion con este artefacto.
- Cualquier integracion futura en un runtime necesitara su propia validacion de layout y pruebas de empaquetado exacto antes de considerarse fiable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AutomatosX/AX-Unlimited-OCR-2-AXQ-MXFP4
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- Revision fijada del modelo base: https://huggingface.co/baidu/Unlimited-OCR-2/tree/9cf077c4b206e0e2a31879df937b0b0bcba3661c
