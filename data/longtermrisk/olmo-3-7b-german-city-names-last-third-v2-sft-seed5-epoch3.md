# longtermrisk/OLMo-3-7B-german-city-names-last-third-v2-sft-seed5-epoch3

## Resumen

El modelo `longtermrisk/OLMo-3-7B-german-city-names-last-third-v2-sft-seed5-epoch3` es un ajuste fino (fine-tuning) supervisado del modelo instructivo `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de la familia OLMo-3 de AI2. Desarrollado por el usuario `longtermrisk`, este modelo se publica bajo licencia Apache 2.0 y está orientado a la generación de texto en inglés. El nombre del repositorio sugiere que el conjunto de datos de entrenamiento se centra en nombres de ciudades alemanas (último tercio, versión 2), con una semilla fija (seed 5) y tres épocas de entrenamiento.

El modelo se entrenó con las bibliotecas Unsloth y TRL de Hugging Face, lo que permitió un ajuste fino más rápido que el habitual. Al tratarse de un modelo de 7 mil millones de parámetros, es relativamente ligero y puede desplegarse en entornos con recursos moderados. Su relevancia radica en demostrar cómo se puede adaptar un modelo base abierto a un dominio específico mediante técnicas de fine-tuning eficientes, manteniendo la licencia permisiva Apache 2.0.

Aunque la model card es muy escueta y no proporciona detalles técnicos adicionales, el modelo hereda las capacidades generales del modelo base OLMo-3-7B-Instruct, que incluyen generación de texto, razonamiento y seguimiento de instrucciones. No se han publicado métricas de rendimiento ni especificaciones detalladas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-3) |
| Parametros totales | 7B (heredados del modelo base OLMo-3-7B-Instruct) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se hereda del modelo base, no especificado) |
| Tipos de cuantizacion | no disponible (formato safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-3, un transformer decoder-only con atención causal, desarrollado por el Allen Institute for AI (AI2). El modelo base `unsloth/Olmo-3-7B-Instruct` ya incorpora un ajuste instructivo (SFT y posiblemente DPO) sobre el modelo OLMo-3-7B preentrenado. Este fine-tuning adicional se realizó con Unsloth, una biblioteca que optimiza el entrenamiento mediante kernels eficientes, y con la biblioteca TRL de Hugging Face para el entrenamiento supervisado.

El nombre del modelo indica que el dataset de entrenamiento es `german-city-names-last-third-v2`, lo que sugiere que se utilizó un subconjunto específico de nombres de ciudades alemanas (probablemente el último tercio de un conjunto de datos más amplio). Se entrenó durante 3 épocas con una semilla fija (seed 5). No se especifican detalles sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO en este fine-tuning concreto.

## Capacidades

- Generación de texto en inglés: al ser un modelo instructivo, puede producir respuestas coherentes y contextualizadas.
- Seguimiento de instrucciones: hereda la capacidad del modelo base para interpretar y ejecutar comandos en lenguaje natural.
- Conversación multi-turno: el modelo base OLMo-3-7B-Instruct está diseñado para diálogos, por lo que este fine-tuning conserva esa habilidad.
- Razonamiento básico: puede resolver tareas de lógica y sentido común, aunque su tamaño (7B) limita la complejidad.
- Especialización potencial en nombres de ciudades alemanas: el dataset de fine-tuning sugiere que el modelo puede generar o clasificar nombres de ciudades alemanas, aunque no se ha verificado su rendimiento en esta tarea.
- No se han documentado capacidades adicionales como tool calling, agentes o visión en la información proporcionada.

## Casos de uso

- Generación de nombres de ciudades alemanas: el modelo podría utilizarse para crear listas de nombres plausibles de ciudades alemanas, útil en juegos, simulaciones o generación de contenido ficticio.
- Chatbot de dominio específico: al ser un fine-tuning de un modelo instructivo, puede integrarse en asistentes conversacionales que requieran respuestas en inglés con un tono natural.
- Prototipado rápido de aplicaciones de texto: gracias a su tamaño moderado y licencia Apache 2.0, es adecuado para experimentar con generación de texto en entornos de desarrollo.
- Fine-tuning adicional: puede servir como punto de partida para otros ajustes finos en dominios relacionados con geografía o toponimia.
- Educación e investigación: al ser un modelo abierto, permite estudiar el efecto del fine-tuning en modelos base y comparar comportamientos con el modelo original.
- Despliegue en entornos con recursos limitados: con 7B de parámetros, puede ejecutarse en GPUs de consumo medio, lo que facilita su uso en proyectos personales o pequeñas empresas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo concreto. Dado que es un fine-tuning de un modelo base conocido, se podría inferir un rendimiento similar al de OLMo-3-7B-Instruct, pero no hay datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 7B en FP16 se requieren aproximadamente 14-16 GB de VRAM. Con cuantización a 8 bits, unos 8-10 GB; con 4 bits, unos 5-6 GB. Estas cifras son estimaciones generales para modelos de este tamaño.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) son suficientes para inferencia en FP16. GPUs con 16 GB como la RTX 4080 o la A10G también pueden funcionar con cuantización.
- Compatibilidad con GPUs de consumo: sí, una RTX 3090 o RTX 4070 Ti (12-16 GB) pueden ejecutar el modelo con cuantización de 4 u 8 bits.
- Opciones de despliegue: al ser un modelo de la familia OLMo-3, es compatible con frameworks como vLLM, llama.cpp, Ollama y Text Generation Inference (TGI). También se puede usar con la librería `transformers` de Hugging Face.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 7B, se espera una latencia de decodificación de unos 20-50 ms por token en una GPU moderna, dependiendo de la cuantización y el backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | 4096 (según documentación de AI2) | Apache 2.0 | Hugging Face |
| Llama-3-8B-Instruct | 8B | 8192 | Llama 3 license (uso comercial permitido con condiciones) | Hugging Face |
| Mistral-7B-Instruct | 7B | 32768 | Apache 2.0 | Hugging Face |

Este modelo es un fine-tuning de OLMo-3-7B-Instruct, por lo que comparte arquitectura y tamaño con su base. Comparado con Llama-3-8B, tiene menos parámetros y un contexto potencialmente menor (aunque no se especifica). Frente a Mistral-7B, la licencia es la misma (Apache 2.0), pero Mistral ofrece una ventana de contexto mayor. No se dispone de datos de rendimiento para una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos del dataset de fine-tuning: al entrenarse con nombres de ciudades alemanas, el modelo puede mostrar un sesgo hacia esa temática y rendir peor en tareas generales fuera de ese dominio.
- Alucinaciones: como cualquier modelo de 7B, puede generar información falsa o inventada, especialmente en temas especializados.
- Idioma limitado: solo se declara soporte para inglés, aunque el modelo base podría tener cierta capacidad multilingüe, no está garantizada.
- Falta de documentación: la model card no proporciona detalles sobre el dataset, el proceso de entrenamiento ni las métricas de evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.
- Riesgo de sobreajuste: al ser un fine-tuning con un dataset muy específico y solo 3 épocas, podría estar sobreajustado a ese conjunto, reduciendo su generalización.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar que el dataset de entrenamiento no contenga datos con derechos de autor.

## Enlaces

- [Hugging Face - longtermrisk/OLMo-3-7B-german-city-names-last-third-v2-sft-seed5-epoch3](https://huggingface.co/longtermrisk/OLMo-3-7B-german-city-names-last-third-v2-sft-seed5-epoch3)
- [Hugging Face - modelo base unsloth/Olmo-3-7B-Instruct](https://huggingface.co/unsloth/Olmo-3-7B-Instruct)
- [FriendliAI - página del modelo](https://friendli.ai/models/longtermrisk/OLMo-3-7B-german-city-names-last-third-v2-sft-seed5-epoch3)
- [Sitio oficial de OLMo (AI2)](https://allenai.org/olmo)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
