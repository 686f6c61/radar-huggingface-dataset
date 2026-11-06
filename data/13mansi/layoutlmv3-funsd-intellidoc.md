# 13mansi/layoutlmv3-funsd-intellidoc

## Resumen

LayoutLMv3 es un modelo de comprension de documentos que combina informacion de texto, diseno (posiciones de las palabras) e imagen en una unica arquitectura transformer multimodal. El modelo `13mansi/layoutlmv3-funsd-intellidoc` es un ajuste fino (fine-tuning) de LayoutLMv3 realizado por el usuario 13mansi, orientado a la tarea de extraccion de informacion de documentos, presumiblemente sobre el conjunto de datos FUNSD y posiblemente datos adicionales de IntelliDoc.

El modelo resuelve el problema de entender formularios y documentos escaneados, donde el texto por si solo no basta: la posicion espacial de cada campo y el aspecto visual del documento son senales criticas para extraer pares clave-valor (por ejemplo, "Fecha" -> "01/01/2024"). LayoutLMv3 es la tercera iteracion de la familia LayoutLM de Microsoft Research, y esta adaptacion concreta pone a disposicion de la comunidad un checkpoint de 125 millones de parametros listo para tareas de extraccion de entidades en documentos.

Es relevante porque ofrece un punto de partida ligero (0,5 GB en safetensors) y con licencia MIT para tareas de procesamiento de documentos, aunque la informacion publicada sobre su entrenamiento y rendimiento es muy escasa. El checkpoint no incluye pipeline declarado ni idiomas soportados en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LayoutLMv3 (transformer multimodal texto + layout + imagen) |
| Parametros totales | 125.330.052 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (LayoutLMv3 base usa 512 tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es LayoutLMv3, un transformer que unifica modalidades de texto e imagen sin depender de un backbone CNN separado. El modelo procesa tokens de texto junto con sus bounding boxes (coordenadas x0, y0, x1, y1) y parches de imagen del documento, y aplica un objetivo de modelado enmascarado multimodal durante el preentrenamiento. La variante base tiene 125 millones de parametros, coherente con el conteo de safetensors del repositorio.

En cuanto al ajuste fino especifico de este checkpoint, no se dispone de informacion detallada en la model card proporcionada: no se indican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco probables en una tarea discriminativa de extraccion de entidades). El nombre del repositorio sugiere entrenamiento sobre FUNSD (Form Understanding in Noisy Scanned Documents) y posiblemente sobre un dataset denominado IntelliDoc, pero no hay confirmacion en los metadatos.

## Capacidades

- Extraccion de informacion de documentos escaneados: identificacion de pares clave-valor y entidades en formularios.
- Comprension de layout: uso de coordenadas de bounding boxes para desambiguar campos con texto similar.
- Comprension visual: incorporacion de caracteristicas de imagen del documento para tareas de clasificacion y extraccion.
- Clasificacion de tokens y etiquetado de entidades (token classification) sobre documentos.
- Posible soporte de preguntas y respuestas sobre documentos (question answering extractivo), segun la configuracion de la cabeza de salida, no confirmado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los metadatos no declaran idiomas).

## Casos de uso

- Digitalizacion de formularios administrativos: el modelo puede etiquetar tokens en formularios escaneados para extraer campos como fecha, importe o numero de referencia, aprovechando las coordenadas de layout que diferencian campos con etiquetas parecidas.
- Procesamiento de facturas y recibos: extraccion de emisor, receptor, lineas de detalle e importes totales a partir de la disposicion espacial del texto y la imagen del documento.
- Automatizacion de entrada de datos en back office: sustitucion de la introduccion manual de datos en sistemas ERP o CRM mediante un pipeline de OCR mas LayoutLMv3 para el etiquetado de campos.
- Clasificacion de documentos entrantes: uso de la representacion multimodal para distinguir tipos de documento (contratos, nominas, albaranes) antes de enrutarlos al departamento correspondiente.
- Validacion de documentos en procesos KYC: extraccion y comprobacion de campos identificativos en formularios de alta de clientes, con verificacion cruzada contra el texto reconocido por OCR.
- Investigacion academica en comprension de documentos: punto de partida ligero y con licencia MIT para experimentar con tecnicas de layout-aware modeling sobre FUNSD u otros corpus similares.
- Indexacion y busqueda semantica de archivos escaneados: uso de las representaciones del modelo para enriquecer metadatos estructurados de documentos antes de almacenarlos en un motor de busqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en safetensors ocupa aproximadamente 0,5 GB; en precision FP32 requiere del orden de 0,5 GB de pesos mas memoria de activaciones, por lo que en la practica cabe en GPU con 4-8 GB de VRAM para lotes pequenos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; para procesamiento por lotes a gran escala se recomienda A100 o H100.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: al ser un modelo de token classification, se puede servir con Transformers en Python, con ONNX Runtime para inferencia optimizada, o con servidores de inferencia como TGI si se adapta la tarea. vLLM y llama.cpp no son las vias habituales para este tipo de modelo.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 13mansi/layoutlmv3-funsd-intellidoc | 125,3 M | no disponible | Extraccion de informacion en documentos | MIT | Hugging Face |
| microsoft/layoutlmv3-base | 125 M | 512 tokens | Preentrenamiento multimodal documento | MIT | Hugging Face |
| microsoft/layoutlmv2-base-uncased | ~113 M | 512 tokens | Comprension de documentos | MIT | Hugging Face |
| microsoft/dit-base | ~86 M | no disponible | Document Image Transformer | MIT | Hugging Face |

## Limitaciones y advertencias

- Informacion de entrenamiento incompleta: la model card no detalla datos, hiperparametros ni procedimiento, lo que dificulta evaluar su robustez fuera del dominio de entrenamiento.
- Riesgo de sobreajuste al dataset: al estar ajustado presumiblemente sobre FUNSD/IntelliDoc, su rendimiento en documentos de otros formatos o idiomas puede degradarse notablemente.
- Sin idiomas declarados: no se puede asumir soporte multilingue; probablemente este entrenado principalmente en ingles, aunque no se confirma.
- Riesgo de alucinacion en la extraccion: como todo modelo discriminativo, puede asignar etiquetas erroneas a tokens cuando el OCR es de baja calidad o el layout es atipico.
- Licencia MIT: permite uso comercial y modificacion, pero conviene verificar las condiciones de los datos de entrenamiento subyacentes (FUNSD tiene su propia licencia de uso) antes de desplegarlo en produccion.
- Sin pipeline declarado ni demos: no hay garantia de que la configuracion de la cabeza de salida coincida con la tarea que se pretenda usar; es necesario inspeccionar `config.json` y mapear las etiquetas.
- Descargas y likes muy bajos (13 descargas, 0 likes): no hay evidencia de validacion por parte de la comunidad ni de resultados reproducibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/13mansi/layoutlmv3-funsd-intellidoc
- Paper de LayoutLMv3: https://arxiv.org/abs/2204.08387
- Repositorio oficial de LayoutLM de Microsoft: https://github.com/microsoft/unilm/tree/master/layoutlmv3
- Modelo base en Hugging Face: https://huggingface.co/microsoft/layoutlmv3-base
- Dataset FUNSD: https://guillaumejaume.github.net/funsd/
