# BruceYg/ATPO-G-Qwen2.5-VL-7B-r5

## Resumen

ATPO-G-Qwen2.5-VL-7B-r5 es un ajuste fino del modelo multimodal Qwen2.5-VL-7B-Instruct, publicado por el usuario BruceYg, orientado a la deteccion multi-etiqueta de seguridad en video (multi-label video safety detection). El modelo parte de los pesos del modelo base de Alibaba (vision-language transformer con 8.292.166.656 parametros, aproximadamente 8,29 mil millones) y se entrena mediante Adaptive Tversky Policy Optimization (ATPO), una tecnica de aprendizaje por refuerzo que modula las penalizaciones por falsos positivos y falsos negativos para controlar el compromiso precision-recall. La variante ATPO-G emplea Global Adaptive Tversky Reward (G-ATR).

El problema que aborda es la clasificacion de contenido audiovisual potencialmente inseguro con multiples etiquetas simultaneas, un escenario donde los enfoques supervisados clasicos no permiten ajustar de forma explicita el equilibrio entre precision y recall. Al integrar esa capacidad de control en la fase de RL, el modelo busca ofrecer un comportamiento mas configurable que un clasificador convencional.

El repositorio contiene pesos fusionados en BF16, ficheros de tokenizer y configuraciones de processor, y se distribuye bajo licencia Apache 2.0. Aunque la ficha no aporta mediciones de contexto ni resultados de benchmarks, el modelo hereda la arquitectura y las capacidades multimodales del Qwen2.5-VL-7B-Instruct. Es relevante ahora como ejemplo de aplicacion de RL con recompensas asimetricas a tareas de moderacion de video, un area con pocos modelos abiertos especificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (encoder ViT + decoder LLM Qwen2.5 + merger MLP), heredada del modelo base Qwen2.5-VL-7B-Instruct |
| Parametros totales | 8.292.166.656 (aproximadamente 8,29 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-VL-7B-Instruct soporta contextos largos de hasta 128K tokens) |
| Tipos de cuantizacion | el repositorio solo publica pesos fusionados en BF16; no se listan cuantizaciones propias (existen cuantizaciones GGUF de la comunidad para el modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16 fusionado) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del Qwen2.5-VL-7B-Instruct, un modelo vision-language que combina un encoder de vision tipo ViT con procesamiento de resolucion dinamica, un decoder de lenguaje basado en Qwen2.5 y un modulo merger MLP que proyecta las representaciones visuales al espacio del lenguaje. El modelo base incorpora codificacion temporal nativa, lo que permite procesar video ademas de imagenes individuales. Sobre esta base, el autor aplica un ajuste fino por aprendizaje por refuerzo en lugar de un fine-tuning supervisado convencional.

El entrenamiento utiliza Adaptive Tversky Policy Optimization (ATPO), descrito en el articulo "Controllable Multi-label Video Safety Detection via Adaptive Tversky Policy Optimization". La variante ATPO-G incorpora Global Adaptive Tversky Reward (G-ATR), que adapta dinamicamente las penalizaciones por falsos positivos y falsos negativos durante el RL para orientar el compromiso precision-recall. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon etapas adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes y video, heredadas del modelo base Qwen2.5-VL-7B-Instruct.
- Deteccion multi-etiqueta de seguridad en video: asignacion simultanea de varias etiquetas de contenido potencialmente inseguro a un clip o secuencia.
- Control del compromiso precision-recall mediante la recompensa adaptativa (G-ATR), lo que permite orientar el modelo hacia mayor precision o mayor recall durante el entrenamiento.
- Comprension de video con codificacion temporal nativa (procesamiento de secuencias de fotogramas).
- Capacidades de clasificacion multietiqueta (tag multi-label-classification).
- Soporte presumible de tool calling y function calling, heredado del modelo base; no confirmado de forma especifica en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Moderacion automatica de plataformas de video: el modelo puede etiquetar clips con multiples categorias de riesgo simultaneamente, aprovechando la clasificacion multietiqueta y la codificacion temporal nativa para evaluar secuencias completas.
- Filtrado previo a publicacion (pre-moderation): integrado en el pipeline de subida de contenido para marcar videos que requieran revision humana, con un umbral de precision/recall ajustable segun la politica de la plataforma.
- Revision de contenido en tiempo real en streaming: analisis de segmentos de video para detectar infracciones, apoyandose en la comprension temporal del modelo base.
- Auditoria de catalogos historicos: procesamiento por lotes de bibliotecas de video ya publicadas para reclasificar contenido segun nuevas politicas de seguridad.
- Sistemas de control de calidad de datasets de video: uso del modelo como anotador automatico multietiqueta para pre-etiquetar grandes volumenes antes de la revision humana.
- Investigacion en RL para vision-lenguaje: la variante con G-ATR sirve como caso de estudio reproducible para analizar como las recompensas asimetricas afectan al comportamiento precision-recall en tareas de clasificacion.
- Deteccion de contenido sensible en entornos educativos o corporativos: filtrado de material de video subido a plataformas internas con criterios de seguridad configurables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, MMLU, HumanEval ni ningun otro dato cuantitativo, y el repositorio no proporciona tablas comparativas frente al modelo base ni frente a clasificadores alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: alrededor de 17-20 GB solo para los pesos (8,29 mil millones de parametros en BF16), mas el consumo adicional del encoder de vision y del cache KV, especialmente en procesos de video con muchos fotogramas.
- Cuantizacion 8 bits: aproximadamente 9-11 GB de pesos.
- Cuantizacion 4 bits: aproximadamente 5-7 GB de pesos.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) es suficiente para inferencia en BF16 de imagenes, con margen limitado para video de muchos fotogramas.
- En GPU de consumo: cabe en RTX 4090 y A6000 en BF16; en tarjetas de 12-16 GB (RTX 4080, 4070 Ti) seria necesario cuantizar a 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), vLLM (soporte multimodal del base Qwen2.5-VL), llama.cpp/Ollama mediante cuantizaciones GGUF del modelo base. El repositorio no incluye pesos GGUF propios.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ATPO-G-Qwen2.5-VL-7B-r5 | ~8,29 B | no disponible (base: hasta 128K) | Clasificacion multi-etiqueta de seguridad en video (RL) | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen2.5-VL-7B-Instruct | ~8,29 B | no disponible en los datos (documentado hasta 128K en el base) | Vision-language generalista, imagen y video | Apache 2.0 | HuggingFace, ampliamente usado |
| Qwen2.5-VL-3B-Instruct | ~3 B | no disponible | Vision-language generalista, version reducida | Apache 2.0 | HuggingFace |

Los datos de rendimiento comparativo no estan disponibles. La comparativa se limita a parametros, tarea y licencia; no se dispone de cifras de precision, recall ni benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No se publican resultados de benchmarks ni metricas de evaluacion, por lo que su rendimiento real en tareas de seguridad de video no esta verificado de forma independiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Riesgo de alucinacion y de falsos positivos/negativos inherente a los modelos generativos multimodales; la recompensa adaptativa mitiga pero no elimina este problema.
- No se especifican los idiomas soportados ni la composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos culturales o linguisticos.
- El ajuste esta especializado en deteccion de seguridad en video; su uso como modelo generalista puede degradar las capacidades del base original.
- La informacion de fechas y el identificador arXiv (2610.02019) no permiten confirmar de forma estandar la trazabilidad del articulo; conviene verificar la fuente antes de citarla.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte, y no se documentan responsabilidades sobre el contenido clasificado.
- No se documentan requisitos minimos de hardware ni limites de longitud de video, lo que complica el dimensionamiento en produccion.
- Para produccion en moderacion de contenido, se recomienda revision humana en los casos marcados, dado que la clasificacion automatica de seguridad tiene consecuencias sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BruceYg/ATPO-G-Qwen2.5-VL-7B-r5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Articulo (paper): https://arxiv.org/abs/2610.02019
- Codigo: https://github.com/BruceYg/ATPO
- Pagina del proyecto: https://bruceyg.github.io/ATPO-project-page/
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/BruceYg/ATPO-G-Qwen2.5-VL-7B
- Cuantizaciones GGUF del modelo base: https://huggingface.co/ggml-org/Qwen2.5-VL-7B-Instruct-GGUF
