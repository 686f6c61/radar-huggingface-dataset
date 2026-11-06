# nota-ai/Kimi-K3.1-Pro-Global-Pruned-30

## Resumen

Kimi-K3.1-Pro-Global-Pruned-30 es una variante podada del modelo multimodal Kimi-K3.1-Pro desarrollado por Moonshot AI, publicada por el usuario nota-ai en Hugging Face. Se trata de un modelo de arquitectura Mixture of Experts (MoE) de gran escala, con aproximadamente 1,95 billones de parametros totales segun los pesos en safetensors, orientado a generacion de texto e imagen-texto (pipeline image-text-to-text). La modificacion principal respecto al modelo base es una poda global de expertos ("Global-Pruned-30"), que presumiblemente elimina o desactiva un 30% de los expertos del modelo original, aunque la informacion disponible no detalla el criterio exacto de poda ni el impacto en parametros activos.

El modelo se distribuye en formato safetensors con cuantizacion de 8 bits mediante la libreria compressed-tensors, lo que reduce el peso del repositorio a aproximadamente 1,1 TB. Requiere codigo personalizado (custom_code) y la libreria transformers para su carga. Es relevante en el contexto actual de modelos MoE de gran escala, donde tecnicas de poda de expertos buscan reducir costes de inferencia y almacenamiento manteniendo capacidades cercanas al modelo original, aunque en este caso concreto la documentacion publica es practicamente inexistente.

El acceso al modelo esta restringido (gated): es necesario aceptar condiciones en Hugging Face y la licencia es "other", identificada como kimi-k3.1-pro, lo que implica que las condiciones de uso comercial dependen del acuerdo de licencia del modelo base. No se dispone de informacion sobre idiomas soportados, datos de entrenamiento ni benchmarks publicados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer multimodal (texto e imagen) |
| Parametros totales | 1.953.384.642.880 (aprox. 1,95 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (compressed-tensors); otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (licencia "other", acceso restringido) |
| Formato de pesos | safetensors (con compressed-tensors), requiere custom_code |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura Mixture of Experts (MoE) multimodal, tal como indican las etiquetas "moe" y el pipeline "image-text-to-text". Procede de moonshotai/Kimi-K3.1-Pro mediante un proceso de fine-tuning y poda global de expertos identificado en el nombre como "Global-Pruned-30", que sugiere la eliminacion del 30% de los expertos a nivel global. No se dispone de informacion sobre el numero de expertos originales, el numero de expertos activos por token, la dimension de las capas, el numero de capas ni la estrategia exacta de poda (criterio de seleccion, recuperacion posterior o reentrenamiento).

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del modelo base (como decodificacion especulativa o atencion lineal). La cuantizacion a 8 bits mediante compressed-tensors es el unico detalle tecnico de compresion documentado, ademas de la propia poda de expertos.

## Capacidades

- Generacion de texto conversacional (etiqueta "conversational").
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), lo que implica capacidades de vision-lenguaje.
- Razonamiento multi-turno en formato conversacional.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- Capacidades de poda de expertos que reducen el coste computacional respecto al modelo base, aunque el impacto exacto en calidad no esta documentado.
- No se dispone de informacion confirmada sobre tool calling, function calling, modo thinking, soporte de audio ni capacidades multilingues especificas.

## Casos de uso

- Asistencia conversacional multimodal: el modelo puede gestionar dialogos multi-turno que combinen texto e imagenes, adecuado para interfaces de atencion al cliente donde el usuario adjunta capturas o documentos escaneados.
- Analisis de documentos con imagenes: extraccion y razonamiento sobre contenido visual (facturas, formularios, graficos) integrado en pipelines de automatizacion documental.
- Generacion de descripciones y alt-text: produccion de descripciones textuales de imagenes para accesibilidad o catalogacion de contenido visual a escala.
- Prototipado de agentes multimodales: al ser compatible con endpoints y transformers, puede integrarse en entornos de experimentacion para agentes que interpretan entradas visuales y textuales.
- Investigacion sobre poda de expertos: util como referencia para estudiar el impacto de la poda global del 30% en modelos MoE de gran escala, comparando con el modelo base Kimi-K3.1-Pro.
- Despliegue en infraestructura de inferencia con cuantizacion 8-bit: la version comprimida con compressed-tensors facilita servir el modelo en entornos con restricciones de memoria frente al modelo original en precision completa.
- Evaluacion comparativa de variantes comprimidas: idoneo para medir degradacion de calidad frente al modelo base en tareas de vision-lenguaje, siempre que se haya aceptado la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,95 billones de parametros totales y cuantizacion de 8 bits, el peso de los pesos ronda 1,1 TB, por lo que la inferencia requiere agregados multi-GPU de gran capacidad. No es viable en una sola GPU convencional.
- GPU recomendadas: para servir un modelo de este tamano en 8 bits se necesitan multiples aceleradores de clase datacenter (H100 80 GB, A100 80 GB) en configuracion de varios nodos; el numero exacto de GPUs no esta documentado y depende de los parametros activos (no disponibles).
- Consumer GPU: no cabe en GPUs de consumo (RTX 4090, 24 GB) en ninguna configuracion razonable dada la magnitud del modelo.
- Opciones de despliegue: transformers con custom_code (requerido por el modelo), compatible con endpoints; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kimi-K3.1-Pro-Global-Pruned-30 (este) | ~1,95 B (8-bit, podado 30%) | no disponible | kimi-k3.1-pro (other, gated) | Hugging Face, acceso restringido |
| moonshotai/Kimi-K3.1-Pro (base) | no disponible en la informacion | no disponible | kimi-k3.1-pro | Hugging Face (modelo base referenciado) |
| Alternativas de misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoria (mismo tamano o misma tarea) en la informacion proporcionada.

## Limitaciones y advertencias

- La poda global del 30% de expertos puede degradar la calidad respecto al modelo base; no hay evaluacion publicada que cuantifique esta perdida.
- Ausencia total de documentacion sobre datos de entrenamiento, idiomas, contexto y benchmarks, lo que dificulta evaluar su idoneidad en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala, agravado por la falta de evaluaciones publicadas.
- Licencia "other" (kimi-k3.1-pro) y acceso restringido: es imprescindible revisar las condiciones del modelo base antes de cualquier uso comercial; la licencia del modelo podado puede heredar restricciones adicionales.
- Requisitos de hardware extremos (aprox. 1,1 TB en 8 bits): inviable para la mayoria de equipos y costoso en infraestructura cloud.
- Dependencia de custom_code, lo que puede complicar la integracion con frameworks de inferencia estandar y la reproducibilidad.
- No se confirma soporte multilingue ni de tool calling; no asumir estas capacidades sin validacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/nota-ai/Kimi-K3.1-Pro-Global-Pruned-30
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
