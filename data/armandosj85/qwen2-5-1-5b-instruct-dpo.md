# armandosj85/Qwen2.5-1.5B-Instruct-DPO

## Resumen

El modelo `armandosj85/Qwen2.5-1.5B-Instruct-DPO` es un ajuste fino (fine-tuning) mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por Alibaba Cloud. El autor, un usuario de Hugging Face identificado como `armandosj85`, ha publicado esta variante con el objetivo de alinear el comportamiento del modelo con preferencias humanas mediante optimización directa de preferencias, una técnica que refuerza respuestas deseadas y penaliza las no deseadas sin necesidad de un modelo de recompensa explícito.

El modelo cuenta con 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) y está diseñado para tareas de generación de texto conversacional. No se dispone de documentación técnica detallada sobre el proceso de entrenamiento, el conjunto de datos utilizado ni los hiperparámetros del ajuste DPO, lo que limita su reproducibilidad y evaluación. La relevancia de este modelo radica en que parte de una base sólida y conocida (Qwen2.5), pero su valor práctico depende de la calidad y transparencia del fine-tuning, que no ha sido publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta hasta 128K tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 es multilingue, pero no se confirma para esta variante) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la del modelo Qwen2.5-1.5B-Instruct, un transformer decoder-only con capas de atención de escala lineal (attention head) y normalización RMSNorm. El modelo original fue preentrenado con hasta 18 billones de tokens, con soporte para 128K tokens de contexto y multilingüismo. La variante DPO añade un ajuste fino mediante optimización de preferencias directas, que normalmente consiste en entrenar el modelo para maximizar la probabilidad de respuestas preferidas sobre las no preferidas a partir de pares de comparación. Sin embargo, en este repositorio no se documentan ni el conjunto de datos DPO, ni los hiperparámetros (tasa de aprendizaje, épocas, etc.), ni si se aplicó algún tipo de regularización o mezcla con el entrenamiento de instrucciones. Tampoco se indica si se realizó un paso de RLHF posterior o si el modelo fue evaluado en tareas estándar.

## Capacidades

- Generación de texto y conversación: al estar basado en Qwen2.5-Instruct, debería ser capaz de mantener diálogos multi-turno y responder a instrucciones, aunque no se ha verificado en esta variante.
- Razonamiento y matemáticas: el modelo base muestra competencia en tareas de razonamiento y matemáticas básicas, pero no hay evidencia de que el DPO haya mantenido o mejorado estas capacidades.
- Generación de código: el modelo base tiene capacidades de código básicas; el DPO podría haberlas alterado.
- Soporte de tool calling: el modelo base Qwen2.5-Instruct soporta function calling, pero no se sabe si esta variante conserva esa capacidad.
- Capacidades multilingües: el modelo base soporta varios idiomas, pero la documentación del modelo no lo confirma.
- Sin soporte de vision ni audio: no se menciona ninguna extensión multimodal.

## Casos de uso

- **Asistente conversacional ligero**: con solo 1.5B parámetros, el modelo puede ejecutarse en dispositivos de gama media y proporcionar respuestas en tiempo real en aplicaciones de chat. Es adecuado para prototipos o entornos con restricciones de recursos.
- **Generación de texto para aplicaciones de baja latencia**: en entornos donde se requiere una respuesta rápida (menos de 500 ms) y se dispone de una GPU modesta, este modelo puede servir como backend de generación de contenido.
- **Fine-tuning adicional para tareas específicas**: al ser un modelo pequeño, puede ajustarse con pocos datos para dominios concretos como análisis de sentimiento, resumen o extracción de información.
- **Pruebas de concepto y experimentación**: para investigadores que quieran explorar el efecto del DPO sobre un modelo base conocido, este checkpoint puede servir como punto de partida.
- **Despliegue en entornos edge**: con cuantización, el modelo cabe en 1-2 GB de RAM, adecuado para aplicaciones móviles o dispositivos IoT.
- **Educación y aprendizaje**: como modelo compacto, permite a estudiantes y desarrolladores entender el funcionamiento de un LLM sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros indicadores de rendimiento para esta variante DPO. Tampoco se comparan con el modelo base o con otros modelos de tamaño similar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización de 4 bits, el modelo requiere aproximadamente 1 GB de VRAM; con 8 bits, unos 2 GB; en FP16, alrededor de 3 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso una RTX 4090 para mayor velocidad). En CPU, se puede ejecutar con llama.cpp pero con mayor latencia.
- **Opciones de despliegue**: compatible con vLLM, llama.cpp, Ollama, Hugging Face TGI, y Transformers (con `device_map="auto"`). Para producción, vLLM o TGI son recomendados por su eficiencia.
- **Latencia y throughput**: no hay datos concretos. Para un modelo de 1.4B en una RTX 3090, se puede esperar una latencia de alrededor de 20-50 ms por token y un throughput de 50-100 tokens/segundo, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1.54B | 128K | Apache 2.0 | Oficial en Hugging Face |
| Qwen2.5-1.5B-Instruct-DPO (este) | 1.54B | no disponible | no disponible | Repositorio de usuario |
| Llama 3.2 1B Instruct | 1.23B | 128K | Llama 3.2 license | Oficial en Hugging Face |
| Gemma 2 2B | 2.6B | 8K | Gemma license | Oficial en Hugging Face |

No hay datos de rendimiento para esta variante DPO, por lo que no es posible comparar resultados objetivos. La comparativa se limita a características declaradas.

## Limitaciones y advertencias

- **Falta de documentación**: la model card es genérica y no ofrece información sobre el entrenamiento, el dataset, los hiperparámetros ni los criterios de evaluación. Esto dificulta la confianza en el modelo.
- **Riesgo de alucinación**: como cualquier LLM, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento o factuales.
- **Sesgos**: el modelo base Qwen2.5 puede heredar sesgos de los datos de preentrenamiento; el DPO podría no corregirlos o incluso amplificarlos.
- **Contexto**: no se confirma la longitud de contexto; si se mantiene la del base (128K), es amplia, pero si se ha truncado en el fine-tuning, podría ser menor.
- **Licencia**: al no especificarse, no se puede garantizar el uso comercial. Se recomienda contactar al autor o asumir que es una licencia restrictiva por defecto.
- **Idiomas**: sin confirmación, no se puede asumir un soporte multilingüe robusto.
- **Producción**: sin benchmarks ni evaluación de robustez, no es recomendable para entornos productivos críticos sin una validación exhaustiva.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/armandosj85/Qwen2.5-1.5B-Instruct-DPO)
- [Modelo base Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- [Página de Ollama para Qwen2.5 1.5B](https://ollama.com/library/qwen2.5:1.5b-instruct)
- [Información adicional sobre Qwen2.5 (Fireworks AI)](https://fireworks.ai/models/fireworks/qwen2p5-1p5b-instruct)
