# allallallal/fh2019-DocTr

## Resumen

DocTr es un modelo de destorsion de documentos (document image unwarping) desarrollado por investigadores de la Universidad de Ciencia y Tecnologia de China (USTC), cuyo codigo y pesos se distribuyen a traves del repositorio de GitHub fh2019ustc/DocTr. El objetivo del modelo es corregir las deformaciones geometricas que sufren las imagenes de documentos escaneados o fotografiados (curvatura de paginas, pliegues, perspectiva), un paso de preprocesamiento critico en pipelines de OCR y digitalizacion.

La version alojada en Hugging Face bajo el identificador `allallallal/fh2019-DocTr` es una republicacion no oficial de los pesos obtenidos del enlace de Google Drive del repositorio original, realizada por el usuario `allallallal` con fines no comerciales. El repositorio pesa aproximadamente 0,2 GB, lo que sugiere un modelo relativamente ligero, probablemente una red convolucional o basada en transformers de tamano moderado.

No se ha publicado una model card completa en Hugging Face: no constan benchmarks, especificaciones de arquitectura, idiomas ni detalles de entrenamiento en la ficha. La relevancia del modelo radica en que DocTr fue uno de los trabajos de referencia en destorsion de documentos, y su disponibilidad en Hugging Face facilita su descarga directa para integrarlo en sistemas de OCR. Para uso comercial es necesario contactar con los autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de destorsion de imagenes de documentos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | fh2019 (otra licencia, no estandar; uso no comercial sin autorizacion) |
| Formato de pesos | no disponible (tamano del repo: 0,2 GB) |

## Arquitectura y entrenamiento

La informacion disponible en la model card de Hugging Face no detalla la arquitectura del modelo. El trabajo original de DocTr (publicado por el grupo de Feng, Zhou y otros investigadores de la USTC) propone un enfoque basado en transformers para la regression de mapas de flujo (flow maps) que corrigen la distorsion de documentos, pero la ficha republicada no incluye estos detalles, por lo que no pueden confirmarse aqui.

Tampoco se dispone de informacion sobre el dataset de entrenamiento, el numero de pasos, el uso de RLHF/DPO (no aplicable en este tipo de modelo) ni otras tecnicas de entrenamiento. Para esos datos debe consultarse el paper y el repositorio original enlazados al final de esta ficha.

## Capacidades

- Correccion geometrica de imagenes de documentos: corrige curvaturas, pliegues y distorsiones de perspectiva en paginas fotografiadas o escaneadas.
- Generacion de mapas de flujo para rehacer (unwarp) la imagen del documento a una geometria plana.
- Preprocesamiento para OCR: al enderezar el documento, mejora la precision de motores OCR posteriores.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling, agentes ni capacidades multilingues de texto.

## Casos de uso

- Digitalizacion de archivos y bibliotecas: como paso previo al OCR, corrige la curvatura de libros escaneados con camara o escaner plano, mejorando la calidad del texto reconocido.
- OCR en dispositivos moviles: integrable en una app que fotografié documentos, corrigiendo la distorsion de perspectiva antes de pasar la imagen al motor de reconocimiento.
- Automatizacion de back-office documental: en pipelines de procesamiento de facturas, contratos o formularios escaneados con calidad irregular, normaliza la geometria de la pagina para reducir errores de extraccion.
- Investigacion en document image processing: punto de partida o baseline para comparar nuevos metodos de unwarping en benchmarks academicos.
- Restauracion de documentos historicos: correccion de deformaciones tipicas de manuscritos y paginas antiguas fotografiadas en condiciones no controladas.
- Preprocesamiento en sistemas RAG multimodales: mejora la calidad de la imagen antes de que un modelo de vision-language extraiga texto o estructuras de documentos fotografados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para metricas del trabajo original (tipicamente MS-SSIM, LD y ED sobre datasets como DocUNet y DIR300), consultese el paper y el repositorio de GitHub enlazados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; dado el tamano del repositorio (0,2 GB), es razonable suponer que un modelo de estas caracteristicas puede ejecutarse en GPUs de consumo con 4-8 GB de VRAM, aunque esta cifra es una estimacion y no un dato confirmado.
- GPU recomendadas: no disponible; por el tamano del modelo, cualquier GPU moderna (por ejemplo una RTX 3060 o superior) deberia ser suficiente para inferencia.
- Consumer GPU: probablemente compatible dada la ligereza del modelo, sin confirmacion oficial.
- Opciones de despliegue: no aplica a vLLM, llama.cpp, Ollama o TGI (no es un LLM). La inferencia se realizaria con PyTorch usando el codigo del repositorio original de GitHub.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| DocTr (esta ficha) | Destorsion de documentos | no disponible | fh2019 (no comercial sin permiso) | Pesos en Hugging Face (repost) y Google Drive |
| DocUNet | Destorsion de documentos | no disponible | no disponible | Codigo y pesos via repositorio de los autores |
| DewarpNet | Destorsion de documentos | CNN 3D (trabajo original) | no disponible | Codigo y pesos publicos en GitHub |

Nota: los detalles de las alternativas son de memoria y no provienen de la informacion proporcionada; verifícalos en sus repositorios oficiales antes de tomar decisiones.

## Limitaciones y advertencias

- Licencia no estandar (fh2019): el repost en Hugging Face es explicitamente para uso no comercial. Cualquier uso comercial requiere autorizacion de los autores originales (Profesor Wengang Zhou y Hao Feng, USTC).
- La ficha de Hugging Face es un repost sin model card completa: faltan especificaciones, benchmarks e instrucciones de uso, lo que aumenta el riesgo de uso incorrecto del modelo.
- Al ser una republicacion de terceros, no hay garantia de integridad de los pesos ni de correspondencia exacta con la version oficial; se recomienda verificar contra la fuente original en Google Drive del repositorio de GitHub.
- Riesgo de alucinacion: no aplica al ser un modelo de vision geometrica, aunque una destorsion erronea puede degradar el OCR posterior.
- Sesgos e idiomas: no disponibles; el rendimiento en documentos en otros idiomas, tipografias o layouts no descritos en el paper original no esta documentado.
- Cero descargas registradas en Hugging Face en el momento de redactar la ficha: comunidad y soporte practicamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/allallallal/fh2019-DocTr
- Repositorio original de GitHub: https://github.com/fh2019ustc/DocTr
- Contacto uso comercial: zhwg@ustc.edu.cn y haof@mail.ustc.edu.cn (indicados en la model card)
