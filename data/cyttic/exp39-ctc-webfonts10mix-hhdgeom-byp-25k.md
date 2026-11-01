# cyttic/exp39-ctc-webfonts10mix-hhdgeom-byp-25k

## Resumen

El modelo `cyttic/exp39-ctc-webfonts10mix-hhdgeom-byp-25k` es un checkpoint publicado en HuggingFace por el usuario cyttic, con 87.279.756 parámetros totales según los metadatos de safetensors y un tamano de repositorio de aproximadamente 0,3 GB. Por la nomenclatura del identificador (CTC, webfonts, geom, 25k), todo apunta a un modelo de reconocimiento optico de caracteres (OCR) o de reconocimiento de escritura/texto en imagenes, probablemente entrenado con un objetivo CTC (Connectionist Temporal Classification) sobre un conjunto de datos de fuentes web. No obstante, esta interpretacion es inferida del nombre y no esta confirmada en la model card.

La model card publicada es la plantilla por defecto de HuggingFace sin rellenar: todos los campos de descripcion, arquitectura, datos de entrenamiento, evaluacion y uso previsto aparecen como `[More Information Needed]`. No hay informacion sobre el pipeline, los idiomas soportados ni los resultados de benchmarks. El unico dato tecnico verificable ademas del recuento de parametros es la licencia MIT y la referencia generica al paper de Lacoste et al. (2019) sobre emisiones de carbono (arXiv:1910.09700), que aparece como cita de la plantilla y no como paper del modelo.

Por tanto, esta ficha documenta lo que se puede verificar objetivamente y marca de forma explicita como "no disponible" todo aquello que el autor no ha publicado. Es relevante precisamente como ejemplo de checkpoint de investigacion sin documentacion, algo frecuente en repositorios experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura sugiere un modelo con cabeza CTC, sin confirmar) |
| Parametros totales | 87.279.756 |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican variantes GGUF/ONNX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | ~0,3 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-10-26 |
| Ultima actualizacion | 2026-10-30 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card. El identificador del modelo incluye el token "ctc", lo que sugiere el uso de una funcion de perdida Connectionist Temporal Classification, habitual en tareas de reconocimiento de secuencias (reconocimiento de voz, OCR, reconocimiento de escritura a mano) donde la alineacion entre entrada y salida es desconocida. El fragmento "webfonts10mix" apunta a un dataset compuesto por una mezcla de diez familias o conjuntos de fuentes web, y "25k" podria indicar un tamano de vocabulario, numero de pasos de entrenamiento o de muestras, sin que sea posible confirmarlo.

No hay datos sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el uso de tecnicas de RLHF/DPO (poco probables en un modelo de este tamano y naturaleza) ni innovaciones tecnicas destacables. Tampoco se documentan hiperparametros, precision de entrenamiento ni infraestructura de computo.

## Capacidades

- No se documentan capacidades en la model card.
- Por el nombre del checkpoint, es plausible que realice reconocimiento de texto en imagenes (OCR) con decodificacion CTC, pero no hay confirmacion del autor.
- No hay evidencia de soporte de tool calling, function calling ni comportamiento agentico.
- No hay informacion sobre capacidades multilingues.
- No hay informacion sobre modos especiales (thinking, vision, audio) mas alla de la posible entrada visual inferida del nombre.
- No se han publicado ejemplos de uso ni demos.

## Casos de uso

Dado que no hay documentacion oficial, los siguientes casos son hipotesis razonables derivadas del nombre del checkpoint y deben validarse empiricamente antes de cualquier uso en produccion:

- Digitalizacion de documentos escaneados: si el modelo implementa OCR con CTC, podria transcribir texto impreso en imagenes a secuencia de caracteres, util para pipelines de archivo documental.
- Extraccion de texto de capturas de pantalla o interfaces web: el sufijo "webfonts" sugiere entrenamiento con tipografias web, lo que lo haria adecuado para leer texto renderizado en navegadores.
- Preprocesado en pipelines de RAG sobre PDFs: convertir paginas escaneadas a texto antes de indexarlas en un sistema de recuperacion.
- Analisis de formularios y facturas: reconocimiento de campos de texto en documentos estructurados, siempre que se valide la precision sobre el dominio concreto.
- Investigacion en reconocimiento de secuencias: servir como checkpoint de partida para experimentos academicos con perdida CTC y comparar con otros modelos del mismo autor.
- Prototipado rapido en local: con 87 millones de parametros y 0,3 GB de pesos, cabe en cualquier GPU consumer e incluso en CPU para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 350 MB solo para pesos (87,3 M de parametros x 4 bytes), mas activaciones y memoria del framework.
- VRAM estimada en fp16/bf16: aproximadamente 175 MB para pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: al publicarse solo en safetensors, requiere cargar con PyTorch o Transformers (si el autor define configuracion compatible); no hay conversion oficial a GGUF, ONNX ni integracion en Ollama o llama.cpp. Para vLLM o TGI no hay soporte documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable porque no se conoce la tarea exacta ni el rendimiento del modelo. A modo de referencia de categoria (modelos pequenos de reconocimiento de texto en imagenes), podrian considerarse alternativas como TrOCR (Microsoft, ~334 M de parametros en su variante base), PaddleOCR (modelos ligeros de deteccion y reconocimiento) o Donut (Naver, ~200 M), pero la comparacion carece de base sin benchmarks del modelo evaluado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/exp39-ctc-webfonts10mix-hhdgeom-byp-25k | 87,3 M | no disponible | MIT | HuggingFace (solo safetensors) |
| TrOCR (referencia) | ~334 M (base) | no aplica | MIT | HuggingFace, Transformers |
| PaddleOCR (referencia) | variable, decenas de M | no aplica | Apache 2.0 | PaddlePaddle, ONNX |
| Donut (referencia) | ~200 M | no aplica | MIT | HuggingFace, Transformers |

## Limitaciones y advertencias

- La model card esta completamente sin rellenar: no hay informacion sobre sesgos, datos de entrenamiento ni evaluacion.
- Riesgo alto de alucinacion o de salidas incorrectas en dominios no cubiertos por el dataset de entrenamiento, imposible de evaluar sin benchmarks.
- Se desconoce el vocabulario de salida y el juego de caracteres soportado, lo que limita el uso multilingue.
- No hay garantia de que el checkpoint sea cargable con Transformers sin una configuracion adecuada; el autor no publica instrucciones.
- Aunque la licencia es MIT y permite uso comercial, la ausencia de documentacion sobre procedencia de datos impide evaluar riesgos legales o de sesgo.
- No apto para produccion sin una validacion exhaustiva previa sobre el dominio objetivo.
- Cero descargas y cero likes en el momento de la consulta: no hay comunidad ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/exp39-ctc-webfonts10mix-hhdgeom-byp-25k
- Paper citado en la plantilla (emisiones de carbono, no del modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML mencionada en la plantilla: https://mlco2.github.io/impact
