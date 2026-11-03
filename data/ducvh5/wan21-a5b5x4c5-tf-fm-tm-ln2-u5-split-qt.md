# ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2-u5-split-qt

## Resumen

Este repositorio contiene un fine-tuning del modelo Wan2.1-T2V-1.3B-Diffusers, un modelo de generación de vídeo a partir de texto (text-to-video) desarrollado originalmente por Wan-AI. El autor del fine-tuning es el usuario ducvh5, y el modelo se distribuye en formato diffusers con pesos en safetensors. Se trata de un checkpoint experimental con muy poca documentación pública, cero descargas y cero likes en el momento de la consulta, lo que sugiere un trabajo de investigación personal más que un lanzamiento orientado a producción.

La particularidad técnica del checkpoint es el uso de una arquitectura que el autor etiqueta como "recurrent-transformer" con una estructura de bloques descrita como "A5 → B5×4 → C5" y "15 bloques únicos / 30 bloques ejecutados", lo que indica algún tipo de compartición o reutilización de bloques (parameter sharing o weight tying a lo largo de la profundidad). El entrenamiento combina tres objetivos de pérdida (TF, FM y TM) y un esquema de muestreo de ruido con una mezcla de distribuciones log-normal y uniforme. El modelo base tiene 1.300 millones de parámetros y está pensado para generar vídeo a partir de descripciones textuales.

La relevancia de este checkpoint es limitada fuera del ámbito de la investigación: no hay model card detallada, no se especifica licencia, no hay benchmarks publicados y el número de descargas es nulo. Resulta útil como referencia para quienes estudian variantes de arquitectura sobre Wan2.1 o técnicas de compartición de bloques en modelos de difusión para vídeo, pero no es recomendable como base para aplicaciones en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrent transformer (variante sobre Wan2.1, difusión para vídeo); estructura de bloques A5 → B5×4 → C5, 15 bloques únicos / 30 ejecutados |
| Parametros totales | 1.300 millones (heredados del modelo base Wan2.1-T2V-1.3B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/FP8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato diffusers) |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B-Diffusers, un transformer de difusión para generación de vídeo condicionada por texto. Sobre esa base, el autor aplica una modificación que describe como "recurrent-transformer": la red se organiza en tres etapas (A5, B5×4 y C5), con 15 bloques únicos que se ejecutan 30 veces en total, lo que implica reutilización de pesos a lo largo de la profundidad. Este tipo de compartición reduce el número de parámetros efectivos manteniendo la profundidad computacional, una técnica habitual en investigación para abaratar el entrenamiento y la inferencia.

El entrenamiento combina tres objetivos de pérdida: TF (probablemente teacher forcing o flow matching en su variante temporal), FM (flow matching) y TM (posiblemente trajectory matching o temporal matching; la abreviatura no se explicita en la model card). El esquema de muestreo de ruido σ usa una mezcla: q = 0.5·LN(0,1; s=2) + 0.5·U(s=5), con proporciones distintas para FM/TF (p_LN2/q) y TM (p_U5/q). Los datos de entrenamiento se describen como "OV" con leyendas "QT captions 50/50 VB/full", abreviaturas no desarrolladas en la documentación. No se especifica el número de tokens, la composición del dataset ni si hubo RLHF o DPO (poco probable en un modelo de difusión de vídeo).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), heredada del pipeline de Wan2.1-T2V-1.3B.
- Integración con la librería diffusers, lo que permite cargar el modelo mediante las clases estándar de pipelines de vídeo.
- Estructura de pesos compatible con el modelo base, lo que facilita la comparación y el intercambio de componentes.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso (no aplicables a un modelo de difusión de vídeo).
- No se documentan capacidades multilingües específicas; la condicionalidad textual depende del codificador de texto del modelo base.
- No se documentan modos especiales (thinking mode, visión, audio) más allá de la generación de vídeo.

## Casos de uso

- Investigación sobre compartición de bloques en difusión de vídeo: el checkpoint permite estudiar cómo afecta la reutilización de pesos (15 bloques únicos ejecutados 30 veces) a la calidad y al coste computacional frente al Wan2.1 original.
- Experimentos de destilación y eficiencia: al reducir el número de parámetros efectivos, puede servir como punto de partida para comparar curvas de pérdida y calidad de vídeo en entornos con recursos limitados.
- Reproducción de ablaciones de pérdida: la combinación TF+FM+TM y el esquema de muestreo de σ documentado permiten replicar experimentos sobre objetivos de entrenamiento en modelos de vídeo.
- Generación de clips cortos en prototipos de investigación: con 1.300 millones de parámetros, es viable en GPUs de gama alta para pruebas de concepto de texto a vídeo.
- Estudio de sensibilidad al ruido: el esquema de mezcla log-normal/uniforme para σ puede analizarse con este checkpoint para entender su impacto en la diversidad y fidelidad del vídeo generado.
- Base para fine-tuning posterior: al estar en formato diffusers y safetensors, puede reutilizarse como inicialización en experimentos de adaptación a dominios concretos, siempre que se resuelva la ambigüedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repo (2,9 GB) y los 1.300 millones de parámetros del modelo base, se estima en torno a 8-12 GB en fp16 para el checkpoint, aunque la generación de vídeo requiere memoria adicional para latentes y decodificación VAE.
- GPU recomendadas: no disponible en la documentación; por tamaño, cabría esperar GPUs con al menos 16-24 GB de VRAM (RTX 4090, A100, H100) para inferencia cómoda.
- Compatibilidad con GPU de consumo: probable en RTX 4090 y posible en RTX 3090/4080 con cuantización, aunque no está verificado por el autor.
- Opciones de despliegue: diffusers (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2-u5-split-qt | 1.300 M (15 bloques únicos / 30 ejecutados) | no disponible | no disponible | HuggingFace, 0 descargas | Fine-tuning experimental sobre Wan2.1 |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.300 M | no disponible | no disponible en la información proporcionada | HuggingFace (modelo base) | Modelo original de texto a vídeo |
| Otros modelos T2V de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Ausencia total de model card detallada: no se especifican datos de entrenamiento, composición del dataset ni metodología de evaluación.
- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribución; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad ni de reproducibilidad de resultados.
- Riesgo de alucinación visual y artefactos: al ser un fine-tuning experimental sin benchmarks, la calidad del vídeo generado es incierta.
- Idiomas no especificados: se desconoce si el codificador de texto conserva el multilingüismo del modelo base.
- Abreviaturas no desarrolladas en la documentación (TF, FM, TM, OV, QT, VB) que dificultan la reproducción del entrenamiento.
- El estado "last state: none saved" y la nota sobre el paso 250 añadido después del snapshot inicial indican que el checkpoint puede no corresponder a un estado final consolidado.
- No apto para producción sin una evaluación independiente de calidad, sesgos y estabilidad.

## Enlaces

- HuggingFace: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2-u5-split-qt
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
