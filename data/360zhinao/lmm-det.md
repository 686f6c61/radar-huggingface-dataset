# 360ZhiNao/LMM-Det

## Resumen

LMM-Det es un modelo de deteccion de objetos construido sobre un modelo multimodal de gran escala (Large Multimodal Model, LMM), desarrollado por el equipo 360ZhiNao (Jincheng Li, Chunyu Xie, Ji Ao, Dawei Leng y Yuhui Yin). Su propuesta central es realizar deteccion de objetos "vanilla", es decir, sin modulos especializados de deteccion, aprovechando directamente las capacidades del LMM subyacente. El trabajo fue aceptado en ICCV'25 y su preprint esta disponible en arXiv (2507.18300).

El modelo aborda un problema recurrente en vision por computador: los detectores clasicos dependen de cabezas de deteccion especificas y de pipelines de anotacion complejos, mientras que los LMM genericos rinden por debajo en tareas de localizacion precisa. LMM-Det pretende cerrar esa brecha demostrando que un LMM puede igualar o superar a detectores especializados si se le entrena y evalua adecuadamente.

El repositorio de Hugging Face ocupa 18,3 GB y distribuye pesos en formato safetensors bajo licencia Apache 2.0. La model card no detalla la arquitectura exacta, el numero de parametros ni la longitud de contexto, por lo que esos datos figuran como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Large Multimodal Model (LMM) para deteccion de objetos; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LMM-Det se presenta como un enfoque "simple pero efectivo" que emplea un Large Multimodal Model para deteccion de objetos sin depender de modulos de deteccion especializados. La model card no especifica la arquitectura interna del LMM subyacente (si es un transformer denso, un modelo con mezcla de expertos o una variante hibrida), ni el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO.

La innovacion destacable, segun la descripcion del autor, es precisamente la eliminacion de cabezas de deteccion dedicadas: el modelo aprovecha el propio mecanismo generativo del LMM para producir las detecciones. El paper asociado (arXiv 2507.18300) es la fuente principal para conocer los detalles de entrenamiento, que no se reproducen en la model card. El repositorio de GitHub del proyecto se actualizo el 1 de agosto de 2025 con instrucciones para probar los modelos.

## Capacidades

- Deteccion de objetos en imagenes mediante un LMM, sin modulos de deteccion especializados.
- Procesamiento multimodal imagen-texto (propio de la familia LMM sobre la que se construye).
- Generacion de detecciones en formato "vanilla", presumiblemente como texto estructurado con coordenadas.
- No se documentan en la model card capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modos especiales como thinking.
- Cobertura multilingue: no disponible.

## Casos de uso

- Deteccion de objetos en imagenes de vigilancia o monitorizacion: el modelo puede localizar y clasificar objetos en escenas sin necesidad de desplegar un detector especializado adicional, simplificando la pila de inferencia.
- Anotacion asistida de datasets: util para pre-etiquetar bounding boxes en pipelines de etiquetado humano, reduciendo el coste de anotacion en proyectos de vision.
- Analisis de imagenes en entornos de investigacion: permite comparar el rendimiento de un LMM frente a detectores clasicos (YOLO, DETR, etc.) en el mismo banco de pruebas.
- Automatizacion de inventario o conteo de objetos: en retail o logistica, el modelo puede identificar y contar articulos en imagenes de estanterias o almacenes.
- Procesamiento de imagenes medicas o industriales para localizar regiones de interes, siempre que se valide el dominio concreto antes de produccion.
- Integracion en pipelines de inspeccion visual: combinado con reglas de negocio, puede detectar defectos o elementos fuera de lugar en lineas de fabricacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 18,3 GB en safetensors; la inferencia en precision nativa requerira del orden de 18-20 GB de VRAM, aunque no se confirma el tamano exacto del modelo.
- GPU recomendadas: no disponible en la informacion proporcionada; por el volumen de pesos, se situaria en el rango de A100, H100 o GPUs consumer de gama alta con 24 GB o mas (RTX 3090, RTX 4090).
- Cabe en consumer GPU: probablemente en RTX 3090/4090 si el modelo se ajusta a 24 GB; no confirmado.
- Opciones de despliegue: no se documentan en la model card; el repositorio de GitHub es la referencia para el codigo de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LMM-Det | LMM para deteccion | no disponible | no disponible | Apache 2.0 | Hugging Face, GitHub |
| YOLO (familia) | Detector CNN especializado | variable (millones) | no aplica | GPL/AGPL segun version | Amplia |
| DETR / Deformable DETR | Detector transformer | variable | no aplica | Apache 2.0 | Amplia |
| Grounding DINO | Deteccion abierta texto-imagen | no disponible | no aplica | Apache 2.0 | Amplia |

La comparacion cuantitativa de rendimiento no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de robustez en la model card.
- Riesgo de alucinacion inherente a los LMM: puede generar detecciones inexistentes o coordenadas imprecisas, especialmente en escenas densas.
- No se especifican los idiomas soportados ni el rendimiento en contextos multilingues.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y sin evaluacion publica de rendimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere falta de validacion por parte de la comunidad.
- No hay informacion sobre cuantizaciones disponibles ni sobre integracion con frameworks de despliegue estandar (vLLM, llama.cpp, TGI).
- Para produccion, es imprescindible validar el modelo en el dominio concreto y consultar el paper y el repositorio de GitHub para conocer los detalles de entrenamiento y evaluacion.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/LMM-Det
- Paper: https://arxiv.org/abs/2507.18300
- GitHub (referenciado en la model card): repositorio oficial de LMM-Det, actualizado el 2025/08/01
- ICCV'25: articulo aceptado (2025/06/26)
