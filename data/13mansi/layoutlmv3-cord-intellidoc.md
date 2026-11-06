# 13mansi/layoutlmv3-cord-intellidoc

## Resumen

LayoutLMv3-cord-intellidoc es un modelo de comprension de documentos entrenado por el usuario 13mansi sobre la base de LayoutLMv3 y ajustado para la tarea de extraccion de informacion estructurada del conjunto de datos CORD (receipts de restaurantes). El modelo combina informacion textual, de layout y visual, lo que lo hace adecuado para tareas de clasificacion de tokens (extraccion de campos clave) en documentos escaneados.

El modelo cuenta con 125.333.897 parametros y se distribuye en formato safetensors con licencia MIT, lo que permite uso comercial sin restricciones. El repositorio ocupa aproximadamente 0,5 GB y ha registrado 16 descargas desde su publicacion.

La informacion disponible es muy limitada: no se detalla el pipeline, los idiomas soportados ni los resultados de evaluacion. La model card es practicamente vacia (solo declara la licencia), por lo que muchos datos tecnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LayoutLMv3 (transformer multimodal texto-layout-imagen) |
| Parametros totales | 125.333.897 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LayoutLMv3 es una arquitectura transformer que unifica texto e imagen mediante un enfoque de modelado enmascarado multimodal. Integra embeddings de texto, embeddings de layout (coordenadas de caja delimitadora) y parches de imagen proyectados en un unico espacio, y se preentrena con objetivos de modelado enmascarado sobre las tres modalidades. El modelo base LayoutLMv3 suele tener del orden de 125 millones de parametros en su variante base, lo que coincide con el recuento reportado.

En cuanto al ajuste fino, el nombre del modelo indica que se ha entrenado sobre el dataset CORD (Consolidated Receipt Dataset), orientado a la extraccion de campos de recibos de restaurantes. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales. La model card no incluye estos detalles.

## Capacidades

- Comprension de documentos con informacion multimodal (texto, layout y vision).
- Extraccion de informacion estructurada (clasificacion de tokens) en recibos y documentos similares.
- Procesamiento de imagenes de documentos escaneados con coordenadas de caja delimitadora.
- No se dispone de informacion sobre tool calling, function calling ni soporte de agentes.
- No se dispone de informacion sobre capacidades multilingues.
- No se dispone de informacion sobre modos especiales (thinking, audio, etc.).

## Casos de uso

- Extraccion de campos en recibos de restaurantes: el modelo puede identificar importes, fechas, nombres de establecimiento y lineas de producto a partir de la imagen y el layout del documento, aprovechando su entrenamiento especifico en CORD.
- Automatizacion de contabilidad de gastos: integrado en un pipeline de digitalizacion de tickets, permite poblar bases de datos de gastos sin intervencion manual.
- Procesamiento por lotes de documentos escaneados: al ser un modelo de 125 M de parametros, puede desplegarse en infraestructura modesta para clasificar y extraer campos de grandes volumenes de recibos.
- Validacion de datos en sistemas ERP: el modelo puede actuar como extractor previo a la validacion y conciliacion de facturas y recibos en sistemas de gestion empresarial.
- Digitalizacion de archivos historicos de recibos: util para proyectos de preservacion documental que requieran convertir imagenes en datos estructurados.
- Prototipado rapido en investigacion de document AI: su licencia MIT y tamano contenido lo hacen adecuado para experimentos academicos y pruebas de concepto en extraccion de informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 125 M de parametros, la inferencia en precision FP32 requiere aproximadamente 0,5 GB de VRAM; en FP16 alrededor de 0,25 GB, sin contar el procesador de imagen y los tensores intermedios.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; tambien puede ejecutarse en CPU para volumenes moderados.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: no se especifican en la informacion disponible; al ser un modelo LayoutLMv3 en safetensors, es compatible con la libreria Transformers de Hugging Face. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| 13mansi/layoutlmv3-cord-intellidoc | 125.333.897 | no disponible | MIT | Hugging Face |
| LayoutLMv3 base (microsoft) | ~125 M | 512 tokens (tipico) | MIT | Hugging Face |
| Donut (variantes) | variable | no disponible | MIT | Hugging Face |
| LiLT | variable | no disponible | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de equidad.
- Riesgo de alucinacion inherente a los modelos de extraccion de informacion; la salida debe validarse en produccion.
- El modelo esta especializado en el dataset CORD (recibos de restaurantes); su rendimiento en otros dominios documentales no esta documentado.
- No se especifican los idiomas soportados; probablemente este limitado al ingles del dataset CORD, pero no se confirma.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantias ni soporte.
- No hay informacion sobre la longitud de contexto efectiva ni sobre el preprocesamiento requerido.
- El repositorio tiene muy pocas descargas (16) y no cuenta con validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/13mansi/layoutlmv3-cord-intellidoc
