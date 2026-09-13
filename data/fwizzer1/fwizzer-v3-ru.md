# fwizzer1/fwizzer-v3-ru

## Resumen

fwizzer-v3-ru (Fwizzer v3 Titan RU) es un modelo multimodal de tipo image-text-to-text publicado por el usuario fwizzer1 en HuggingFace. Se trata de un ajuste (fine-tuning) sobre el modelo base LiquidAI/LFM2.5-VL-3B, orientado al idioma ruso y con el ingles como idioma secundario. La model card lo describe como una red neuronal liquida hibrida (Hybrid Liquid Neural Network) con un backbone de 2,69B de parametros y una torre de vision SigLIP2 de 400M, entrenada sobre un dataset privado de chain-of-thought denominado fwizzer1/fwizzer-v3-titan-agentic (25.000 muestras rusas). Conviene senalar que el repositorio declara 426.285.296 parametros en safetensors, una cifra que no coincide con la suma de backbone y torre de vision indicada en la model card; el dato real de safetensors se refleja en la tabla de especificaciones junto a la discrepancia.

El modelo se distribuye principalmente en formato GGUF (cuantizaciones Q8_0, Q5_K_M y Q4_K_M) mas un proyector de vision independiente (fwizzervision.gguf), lo que lo hace desplegable en llama.cpp, LM Studio y Ollama incluso en hardware de consumo. Su rasgo diferencial es un modo de razonamiento chain-of-thought no desactivable dentro de etiquetas `<think> ... </think>`, inspirado en DeepSeek-R1, junto con capacidades declaradas de OCR, analisis de diagramas e interfaces, y generacion de codigo procedimental para Godot 4 (GDScript) y Blender 4.x (Python bpy/bmesh, Geometry Nodes).

Su relevancia actual es limitada pero concreta: cubre el nicho de VLM pequeno y ejecutable en local para el mercado rusoparlante, un segmento con poca oferta especifica. No obstante, el modelo no tiene descargas ni valoraciones en el momento de redactar esta ficha y no publica resultados de benchmarks, por lo que debe evaluarse como una propuesta experimental y no como una opcion validada para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Liquid Neural Network (backbone de 2,69B) + torre de vision SigLIP2 (400M), segun la model card |
| Parametros totales | 426.285.296 en safetensors (dato del repositorio); la model card declara ~3,1B (2,69B backbone + 400M vision tower) |
| Parametros activos | No disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 32.768 tokens; hasta 131.072 con el backbone LFM segun la model card |
| Tipos de cuantizacion | GGUF: Q8_0 (Max), Q5_K_M (Balanced), Q4_K_M (Speed) |
| Idiomas soportados | Ruso (principal) e ingles |
| Licencia | other / lfm1.0 (licencia LFM 1.0 de Liquid AI) |
| Formato de pesos | GGUF (llama.cpp) y safetensors |

## Arquitectura y entrenamiento

La model card describe una arquitectura hibrida de red neuronal liquida (Liquid Neural Network) sobre el backbone de LiquidAI/LFM2.5-VL-3B, complementada con una torre de vision SigLIP2 de 400M de parametros y un proyector visual propio denominado fwizzervision. El pipeline declarado es image-text-to-text, lo que confirma la entrada conjunta de imagen y texto. La model card atribuye al backbone una ventana de contexto de hasta 131.072 tokens con LFM, mientras que el modelo ajustado declara un contexto operativo de 32.768 tokens. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion completa del dataset.

El ajuste se realizo sobre un dataset privado de chain-of-thought, fwizzer1/fwizzer-v3-titan-agentic, del que se detalla un unico fichero (train_ru_25k.parquet) con 25.000 muestras en ruso. El modelo incorpora un modo de razonamiento profundo no desactivable en etiquetas `<think> ... </think>`, con parada opcional mediante el token `</think>`. No se documentan en la informacion proporcionada las tecnicas de alineacion empleadas (RLHF, DPO u otras), ni innovaciones de decodificacion especulativa o atencion lineal mas alla de lo que implica la arquitectura LFM del modelo base.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento explicita y no desactivable en etiquetas `<think> ... </think>`.
- Vision multimodal: analisis de imagenes, capturas de pantalla, diagramas, esquemas e interfaces de usuario.
- OCR declarado sobre capturas y documentos visuales.
- Generacion de codigo procedimental para Godot 4 en GDScript, con soporte declarado de algoritmos WFC, Marching Cubes y BSP.
- Generacion de scripts para Blender 4.x en Python (bpy, bmesh) y Geometry Nodes.
- Razonamiento lateral y busqueda de errores en codigo ajeno, segun la model card.
- Multilingue limitado a ruso (idioma principal, con el prompt de sistema y el dataset en ruso) e ingles.
- Estilo de respuesta declarado sin moralizacion ni rechazos plantilla, lo que la model card presenta como una capacidad de "proceso de pensamiento limpio".
- No se documenta soporte de tool calling, function calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Analisis de capturas de pantalla e interfaces: el modelo puede recibir una imagen de una UI o un panel de control y extraer texto y estructura mediante OCR y comprension visual, util para documentar productos o generar informes de auditoria de interfaz.
- Atencion al cliente en ruso: con 32.768 tokens de contexto puede mantener conversaciones multi-turno extensas con historial largo e imagenes adjuntas (capturas de error, recibos), un escenario con poca oferta de modelos especificamente rusoparlantes.
- Generacion de scripts para Godot 4: la model card declara soporte nativo de GDScript y algoritmos procedurales concretos (WFC, Marching Cubes, BSP), de modo que puede usarse como asistente de generacion de mundo y logica de juego dentro del editor.
- Automatizacion de Blender 4.x: generacion de scripts bpy/bmesh y de Geometry Nodes para tareas repetitivas de modelado, importacion o procesado de mallas, ejecutables directamente en la consola Python de Blender.
- Revision de codigo en produccion: el modo CoT permite trazar el razonamiento y detectar casos limite en fragmentos de codigo ajenos, util como revisor automatizado previo a la revision humana.
- Extraccion de datos de documentos escaneados: combinando vision y OCR puede digitalizar facturas, formularios o capturas de sistemas legacy para alimentar pipelines de datos.
- Despliegue local con privacidad de datos: las cuantizaciones Q4_K_M y Q5_K_M con el proyector fwizzervision permiten ejecutar el modelo en un portatil con LM Studio u Ollama sin enviar imagenes ni texto a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Razonamiento auditable en investigacion: el bloque `<think>` obligatorio genera una traza de razonamiento inspeccionable, interesante para estudiar el comportamiento de modelos pequenos con CoT forzado, aunque el coste en tokens de salida es mayor al no poder desactivarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada a partir del tamano de los ficheros GGUF publicados: Q4_K_M ~2,1 GB, Q5_K_M ~2,5 GB, Q8_0 ~3,4 GB, mas el proyector de vision fwizzervision ~800 MB. A ello hay que sumar la cache KV, que crece con el contexto hasta los 32.768 tokens declarados.
- GPU de consumo: con Q4_K_M o Q5_K_M mas el proyector, el conjunto de pesos ronda los 2,9-3,3 GB, por lo que cabe en GPUs de 6-8 GB (por ejemplo RTX 3060, RTX 4060) dejando margen limitado para contexto largo; Q8_0 requiere del orden de 4-5 GB solo en pesos.
- GPU de centro de datos (A100, H100) no son necesarias para este tamano, aunque permitirian contexto completo de 32.768 tokens con gran margen de memoria y mayor paralelismo por lote.
- Apple Silicon: viable en equipos con memoria unificada de 8 GB o superior mediante llama.cpp.
- Opciones de despliegue confirmadas por las etiquetas y la model card: llama.cpp, LM Studio y Ollama. No se documenta soporte verificado en vLLM o TGI para estos ficheros GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada. El modo CoT no desactivable incrementa el numero de tokens generados por respuesta y, por tanto, el tiempo hasta la respuesta final.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad de datos |
|---|---|---|---|---|---|
| fwizzer-v3-ru | 426.285.296 en safetensors; la model card declara ~3,1B (backbone + vision) | 32.768 tokens (hasta 131.072 con el backbone LFM) | Ruso e ingles | lfm1.0 (other) | GGUF en el repositorio de HuggingFace |
| LiquidAI/LFM2.5-VL-3B (modelo base) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Referenciado como base_model |
| Otros VLM pequenos de la misma categoria (por ejemplo alternativas de ~3B para image-text-to-text) | No disponible | No disponible | No disponible | No disponible | No se encontraron datos comparativos en los resultados de busqueda web |

Los resultados de la busqueda web realizada no aportaron informacion tecnica ni comparativas de modelos; los enlaces devueltos no guardan relacion con el modelo.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay datos verificables de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales que respalden las capacidades declaradas.
- Metricas de adopcion nulas en el momento de la consulta (0 descargas, 0 likes) y fecha de publicacion muy reciente, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Discrepancia no resuelta entre los parametros declarados en la model card (~3,1B) y los parametros reales de safetensors del repositorio (426.285.296); conviene verificar que artefacto corresponde a que componente antes de integrarlo.
- Dataset de entrenamiento privado y de solo 25.000 muestras: el riesgo de sobreajuste a los estilos y dominios de ese corpus es alto, con generalizacion limitada fuera de ellos.
- El modo chain-of-thought no es desactivable, lo que incrementa el consumo de tokens de salida, la latencia y el coste por consulta, y complica el control de formato en respuestas cortas.
- La instruccion de parada con `</think>` puede provocar truncamientos si el modelo no cierra correctamente el bloque de razonamiento.
- Cobertura idiomatica limitada a ruso e ingles; no se declara soporte de castellano ni de otros idiomas.
- Con 32.768 tokens de contexto operativo, las tareas que requieran ventanas mayores dependen de las capacidades del backbone LFM, no confirmadas para este ajuste.
- Licencia lfm1.0 (etiquetada como "other"): es una licencia especifica de Liquid AI con posibles restricciones de uso comercial. Debe revisarse el texto completo de la licencia antes de cualquier despliegue en produccion o redistribucion.
- La model card promociona explicitamente la ausencia de moralizacion y de rechazos plantilla; esto implica un riesgo de seguridad y de cumplimiento en aplicaciones orientadas a usuario final, ya que el modelo puede no filtrar contenido problematico.
- Riesgo de alucinacion: como cualquier modelo de este tamano, y agravado por la falta de evaluaciones publicadas, especialmente en OCR de documentos densos y en razonamiento numerico.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/fwizzer1/fwizzer-v3-ru
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/fwizzer1/fwizzer-v3-titan-agentic
- Los resultados de busqueda web no devolvieron enlaces relevantes (papers, blogs, repositorios o demos) relacionados con este modelo.
