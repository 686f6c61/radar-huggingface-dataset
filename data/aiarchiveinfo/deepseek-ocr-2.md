# AIArchiveInfo/DeepSeek-OCR-2

## Resumen

DeepSeek-OCR-2 es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y conversión de documentos a formatos estructurados. El repositorio analizado, `AIArchiveInfo/DeepSeek-OCR-2`, es un espejo de preservación byte a byte del modelo original `deepseek-ai/DeepSeek-OCR-2` publicado por DeepSeek AI, archivado el 25 de septiembre de 2026. No se ha reentrenado, ajustado ni modificado ningún peso: la licencia Apache 2.0 original se mantiene y sigue rigiendo la copia.

El modelo se apoya en la arquitectura `deepseek_vl_v2` (transformador visión-lenguaje) y cuenta con 3.389.119.360 parámetros reales según los ficheros safetensors, lo que lo sitúa en torno a los 3,4 mil millones de parámetros. Su propuesta técnica principal, descrita en el artículo "DeepSeek-OCR 2: Visual Causal Flow", es un esquema de codificación visual orientado a comprimir el contexto de documentos extensos mediante resolución dinámica: por defecto procesa entre 0 y 6 recortes de 768×768 más una vista global de 1024×1024, lo que se traduce en un presupuesto de tokens visuales muy contenido ((0-6)×144 + 256).

Su relevancia actual radica en que el OCR de documentos densos (tablas, fórmulas, layouts complejos) sigue siendo un cuello de botella en pipelines de digitalización, RAG sobre PDF y automatización administrativa. Un modelo de 3,4B parámetros con licencia permisiva y despliegue mediante `transformers` o `vLLM` resulta atractivo para integrarlo en infraestructura propia, aunque en esta ficha no se dispone de cifras de benchmarks ni de la longitud de contexto oficial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje, variante `deepseek_vl_v2` (DeepSeek-VL2) con codificación visual de flujo causal |
| Parámetros totales | 3.389.119.360 (≈3,39 mil millones) |
| Parámetros activos | No aplica: no se documenta que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible: el autor no publica cuantizaciones oficiales; el repo contiene pesos en safetensors (bf16 presumiblemente, no confirmado) |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`); no se detalla la lista de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 6,8 GB), con código personalizado (`trust_remote_code=True`) |
| Pipeline declarado | image-text-to-text |
| Tarea secundaria declarada | feature-extraction |

## Arquitectura y entrenamiento

La información disponible indica que el modelo usa la arquitectura `deepseek_vl_v2`, es decir, la familia DeepSeek-VL2 de modelos visión-lenguaje, en la que un codificador visual se combina con un decodificador de lenguaje para tareas de imagen-a-texto. Sobre esa base, DeepSeek-OCR 2 introduce lo que el artículo denomina "Visual Causal Flow", un esquema de codificación visual presentado como una aproximación más cercana a la codificación visual humana. El repositorio declara soporte de resolución dinámica: por defecto (0-6)×768×768 más 1×1024×1024, lo que genera entre (0-6)×144 tokens visuales por recorte más 256 tokens de la vista global. El modo de recorte (`crop_mode=True`) es configurable en la llamada de inferencia.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO; tampoco sobre innovaciones adicionales de decodificación. El modelo entronca con el trabajo previo DeepSeek-OCR ("Contexts Optical Compression"), cuyo enfoque es la compresión óptica de contexto: representar texto como imagen para reducir el número de tokens necesarios y, con ello, el coste de atención. Los agradecimientos del repositorio citan como referencias Vary, GOT-OCR2.0, MinerU y PaddleOCR.

## Capacidades

- OCR de documentos completos: extracción de texto a partir de imágenes de páginas, con el prompt `<image>\nFree OCR.`
- Conversión a Markdown estructurado con anotaciones de layout mediante el prompt `<image>\n<|grounding|>Convert the document to markdown.`
- Detección y preservación de estructura documental (títulos, párrafos, tablas, bloques) gracias al modo grounding
- Resolución dinámica de entrada: adapta el número de recortes procesados entre 0 y 6, más una vista global de 1024×1024
- Compresión de contexto visual: presupuesto de tokens visuales reducido, orientado a documentos largos
- Procesamiento multilingüe declarado (la model card solo indica `multilingual`, sin listado de idiomas)
- Salida de resultados a disco (`save_results=True`, `output_path`), pensada para pipelines de procesamiento por lotes
- Uso como extractor de características (`feature-extraction`) además de generación imagen-texto

No hay evidencia en la información proporcionada de soporte de tool calling, function calling, uso agéntico, razonamiento multi-paso explícito, modo "thinking", audio o vídeo. Estas capacidades deben considerarse no disponibles o no documentadas.

## Casos de uso

- Digitalización masiva de archivos administrativos: el modelo convierte lotes de PDF escaneados a Markdown con estructura preservada, lo que permite indexar el contenido en buscadores o bases documentales sin transcripción manual.
- Construcción de pipelines RAG sobre documentación técnica: al transformar manuales y normativas en Markdown limpio, el texto resultante se puede trocear y vectorizar; la compresión de contexto visual ayuda a procesar documentos de muchas páginas con un coste de tokens contenido.
- Extracción de tablas de informes financieros: el modo grounding y la conversión a Markdown facilitan recuperar tablas como estructuras legibles por máquina, aptas para su posterior parseo a CSV o DataFrame.
- Automatización de back office con documentos heterogéneos: facturas, albaranes y formularios en varios idiomas pueden procesarse con el mismo modelo gracias a la etiqueta multilingüe, reduciendo la necesidad de mantener varios OCR específicos.
- Accesibilidad documental: conversión de material escaneado a texto estructurado para lectores de pantalla y sistemas de texto a voz, con la ventaja de conservar la jerarquía de secciones.
- Preprocesado para entrenamiento de modelos de lenguaje: generación de corpus de alta calidad a partir de fuentes solo disponibles en papel o PDF, con la estructura de layout anotada para tareas de comprensión de documentos.
- Extracción de características visuales y de texto para clasificación documental: la tarea `feature-extraction` declarada permite reutilizar las representaciones internas en clasificadores de tipo de documento, aunque no se documenta la interfaz concreta.
- Procesamiento por lotes en servidor propio: la API de inferencia guarda resultados en disco y admite `crop_mode` configurable, lo que encaja en colas de trabajo nocturnas sobre GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card cita OmniDocBench como benchmark de referencia en los agradecimientos y enlaza dos artículos (arXiv:2601.20552 y arXiv:2510.18234), pero no incluye ninguna tabla de resultados, ni puntuaciones de MMLU, HumanEval, GSM8K, OmniDocBench u otros conjuntos. No se deben asumir cifras no presentes en la documentación.

## Requisitos de hardware

- VRAM estimada (cálculo a partir del recuento de parámetros, no dato oficial): en bf16/fp16 los pesos ocupan del orden de 6,8 GB, por lo que la inferencia completa con activaciones y codificador visual se situaría aproximadamente entre 8 y 10 GB.
- Cuantización a 8 bits: pesos en torno a 3,4 GB, con un consumo total estimado de 5-6 GB.
- Cuantización a 4 bits: pesos en torno a 1,7 GB, con un consumo total estimado de 3-4 GB. Estas cuantizaciones no están publicadas oficialmente, por lo que requerirían conversión propia.
- GPU recomendadas: A100, H100 o L40S para despliegue en servidor con procesamiento por lotes; RTX 4090 o RTX 3090 (24 GB) para uso intensivo en una sola tarjeta sin cuantizar.
- ¿Cabe en GPU de consumo? Sí, con matices: en tarjetas de 24 GB (RTX 3090, 4090) el modelo en bf16 debería caber con holgura; en 16 GB probablemente sea necesario cuantizar; en 8 GB solo con cuantización agresiva y resolución de imagen reducida.
- Dependencias de despliegue verificadas por el autor: Python 3.12.9, CUDA 11.8, `torch==2.6.0`, `transformers==4.46.3`, `tokenizers==0.20.3`, `einops`, `addict`, `easydict` y `flash-attn==2.7.3` (instalado con `--no-build-isolation`). El modelo requiere `trust_remote_code=True`.
- Opciones de despliegue: `transformers` (ruta documentada con `AutoModel`/`AutoTokenizer` y `flash_attention_2`); `vLLM`, mencionado en el repositorio de GitHub de DeepSeek-OCR-2 para aceleración de inferencia y procesamiento de PDF, aunque sin comandos concretos en la model card. No se documenta soporte oficial de llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput: no disponibles. Dependerán del número de recortes activados (0 a 6 más la vista global), del tamaño de imagen y del uso de FlashAttention 2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-OCR-2 (este modelo) | 3,39 mil millones | no disponible | Apache 2.0 | HuggingFace (original y espejo), GitHub | OCR visión-lenguaje con resolución dinámica y conversión a Markdown con grounding |
| DeepSeek-OCR (v1) | no disponible | no disponible | no disponible en la información | GitHub (`deepseek-ai/DeepSeek-OCR`) | Trabajo previo sobre compresión óptica de contexto; citado como base |
| GOT-OCR2.0 | no disponible | no disponible | no disponible en la información | GitHub (`Ucas-HaoranWei/GOT-OCR2.0`) | OCR generalista citado en los agradecimientos |
| MinerU | no disponible | no disponible | no disponible en la información | GitHub (`opendatalab/MinerU`) | Herramienta de extracción documental citada como referencia |
| PaddleOCR | no disponible | no disponible | no disponible en la información | GitHub (`PaddlePaddle/PaddleOCR`) | Suite OCR clásica citada como referencia |

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible. La comparación se limita a la categoría funcional: todos ellos abordan la extracción de texto y estructura a partir de imágenes de documentos.

## Limitaciones y advertencias

- Espejo de preservación: este repositorio no es la publicación oficial de DeepSeek AI. Aunque se declara copia byte a byte sin modificación de pesos, para producción conviene contrastar con el repositorio original `deepseek-ai/DeepSeek-OCR-2`.
- Sin benchmarks publicados en la información disponible: no hay evidencia de rendimiento comparable a otros OCR, lo que impide estimar su precisión real en tablas, fórmulas o documentos degradados.
- Riesgo de alucinación inherente a los modelos generativos: en OCR, esto se manifiesta como texto inventado, cifras alteradas o campos de formulario completados con valores plausibles pero incorrectos. En dominios críticos (facturación, sanidad, legal) se requiere verificación humana o validación cruzada.
- Ejecución de código remoto: el modelo exige `trust_remote_code=True`, lo que implica ejecutar código del repositorio. Debe auditarse antes de desplegarlo en entornos sensibles.
- Longitud de contexto desconocida: la documentación no especifica la ventana máxima soportada, más allá del presupuesto de tokens visuales por recorte. Documentos muy largos dependen del esquema de recortes, no de una ventana declarada.
- Idiomas sin detallar: la etiqueta `multilingual` no viene acompañada de una lista de idiomas ni de métricas por idioma, por lo que el rendimiento en lenguas minoritarias es incierto.
- Cuantizaciones no oficiales: no se publican versiones GGUF, AWQ o GPTQ; cualquier cuantización para hardware limitado es responsabilidad del usuario y puede degradar la precisión del OCR.
- Requisitos de entorno rígidos: las versiones probadas (torch 2.6.0, transformers 4.46.3, CUDA 11.8, flash-attn 2.7.3) pueden entrar en conflicto con stacks más recientes.
- Licencia Apache 2.0: permite uso comercial y modificación con obligación de conservar avisos de copyright y licencia; no impone restricciones de uso adicionales conocidas, pero conviene revisar los términos del repositorio original por si hubiera condiciones añadidas.
- Metadatos llamativos: los identificadores arXiv (2601.20552 y 2510.18234) y las fechas de creación del repositorio (septiembre de 2026) corresponden a material futuro o simulado; verifíquelos en el repositorio oficial antes de citarlos.

## Enlaces

- Espejo en HuggingFace: https://huggingface.co/AIArchiveInfo/DeepSeek-OCR-2
- Repositorio original: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2
- Revisión archivada del original: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2/tree/aaa02f3811945a91062062994c5c4a3f4c0af2b0
- Repositorio GitHub: https://github.com/deepseek-ai/DeepSeek-OCR-2
- Artículo (Visual Causal Flow): https://arxiv.org/abs/2601.20552
- PDF del artículo en GitHub: https://github.com/deepseek-ai/DeepSeek-OCR-2/blob/main/DeepSeek_OCR2_paper.pdf
- Artículo de DeepSeek-OCR (Contexts Optical Compression): https://arxiv.org/abs/2510.18234
- DeepSeek-OCR (versión previa): https://github.com/deepseek-ai/DeepSeek-OCR
- Vary: https://github.com/Ucas-HaoranWei/Vary
- GOT-OCR2.0: https://github.com/Ucas-HaoranWei/GOT-OCR2.0
- MinerU: https://github.com/opendatalab/MinerU
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Benchmark OmniDocBench: https://github.com/opendatalab/OmniDocBench
- Página de DeepSeek: https://www.deepseek.com/
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
