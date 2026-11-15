# OkamotoJP/llm2-qwen35-sft016_compo

## Resumen

llm2-qwen35-sft016_compo es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP. Se trata de un modelo derivado de la familia Qwen 3.5, con 873.438.784 parámetros (aproximadamente 0,87 mil millones), especializado en la generación de respuestas para tareas de generación aumentada por recuperación (RAG) en japonés. El modelo se creó como parte del proyecto final del curso "LLM講座2 2026" y está publicado bajo licencia Apache-2.0.

El ajuste se realizó mediante LoRA (r=16, alpha=32) sobre el modelo base y posteriormente se fusionó con los pesos originales, por lo que la arquitectura resultante es idéntica a la del modelo base Qwen3.5-0.8B. El entrenamiento se llevó a cabo con 1.216 ejemplos provenientes de dos conjuntos de datos: auto-wiki-qa (883 ejemplos) y JEMHopQA (333 ejemplos de la partición compositional), ambos derivados de Wikipedia en japonés y con licencia CC BY-SA 4.0.

La relevancia de este modelo radica en su especialización en la generación de respuestas basadas en contexto documental para japonés, un caso de uso muy concreto dentro del ecosistema RAG. Su reducido tamaño (menos de mil millones de parámetros) lo hace adecuado para despliegues con recursos limitados, aunque su ámbito de aplicación es acotado y su entrenamiento muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; solo se actualizan los pesos de la parte lingüística) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17) y mantiene exactamente la misma estructura que el modelo base; únicamente se actualizan los pesos de la parte lingüística mediante un ajuste LoRA que posteriormente se fusiona con los pesos originales. No se introducen cambios arquitectónicos adicionales ni mecanismos de atención alternativos.

El entrenamiento se realizó con LoRA de rango 16 y alpha 32, tasa de aprendizaje de 0,0001 y una sola época, sobre un total de 1.216 ejemplos. La composición del dataset es la siguiente: 883 ejemplos de cl-nagoya/auto-wiki-qa y 333 ejemplos de JEMHopQA (partición compositional). Ambos conjuntos derivan de Wikipedia en japonés y están licenciados bajo CC BY-SA 4.0; el autor indica que los datos fueron filtrados, muestreados y reformateados para el entrenamiento. También se empleó un conjunto de fragmentos distribuidos (provenientes de Wikipedia japonesa, CC BY-SA 4.0) como material de contexto en los prompts de entrenamiento. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto en japonés, orientada específicamente a la producción de respuestas a partir de documentación recuperada (RAG).
- Respuesta a preguntas de tipo compositional, entrenado con la partición compositional de JEMHopQA.
- Generación de respuestas basadas en contexto documental (chunks de Wikipedia japonesa).
- Capacidades heredadas del modelo base Qwen3.5-0.8B en la parte lingüística, aunque no se detallan en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al japonés según la model card (language: ja).
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de respuestas en pipelines RAG en japonés: el modelo está entrenado específicamente para recibir fragmentos documentales como contexto y generar respuestas, por lo que encaja directamente como componente generador en sistemas de recuperación aumentada sobre Wikipedia u otras fuentes en japonés.
- Asistentes de documentación interna en empresas japonesas: puede integrarse en un sistema que recupere fragmentos de manuales o bases de conocimiento y genere respuestas concisas, con un coste de inferencia bajo gracias a su tamaño inferior a mil millones de parámetros.
- Preguntas y respuestas sobre conocimiento enciclopédico: adecuado para consultas que requieran combinar información de varios fragmentos (entrenado con JEMHopQA compositional), como preguntas que relacionan entidades y hechos dispersos en la Wikipedia japonesa.
- Prototipado rápido de sistemas de QA: su reducido tamaño permite desplegarlo en entornos de desarrollo con GPU de consumo, facilitando iteraciones rápidas antes de escalar a modelos mayores.
- Filtrado y resumen de documentación recuperada: puede emplearse para condensar fragmentos recuperados en respuestas coherentes en japonés dentro de un pipeline de búsqueda documental.
- Educación e investigación: útil como caso de estudio de fine-tuning LoRA sobre modelos pequeños para tareas concretas de generación con contexto, dado que el autor documenta la configuración de entrenamiento y las fuentes de datos.
- Evaluación de técnicas de ajuste eficiente: sirve como referencia para comparar el efecto de LoRA r=16 sobre un modelo base de 0,8B en tareas de RAG en japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parámetros, en precisión FP16 el modelo requiere aproximadamente 1,7 GB solo para los pesos; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM puede alojar el modelo en cuantización. GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de GPU modernas de consumo, especialmente con cuantización.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con transformers, vLLM o TGI; para cuantización y despliegue ligero, llama.cpp u Ollama requerirían conversión previa a GGUF (no disponible en el repositorio).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idioma principal | Disponibilidad |
|---|---|---|---|---|---|
| llm2-qwen35-sft016_compo | 873 M | No disponible | Apache-2.0 | Japonés | Hugging Face |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B | No disponible | Apache-2.0 | Multilingüe | Hugging Face |
| Otros fine-tunes de Qwen3.5-0.8B para RAG en japonés | No disponible | No disponible | No disponible | Japonés | No disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables documentados en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para japonés; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- El ajuste se realizó con solo 1.216 ejemplos y una época, lo que limita la generalización y puede provocar sobreajuste a los dominios de auto-wiki-qa y JEMHopQA.
- Riesgo de alucinación: como todo modelo generativo de pequeño tamaño, puede inventar información cuando el contexto recuperado es insuficiente o ambiguo.
- Sesgos conocidos: no documentados por el autor; al derivar de Wikipedia en japonés, puede heredar sesgos de cobertura y representación de esa fuente.
- Restricciones de licencia: el modelo es Apache-2.0, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede implicar obligaciones de atribución y compartir igual para obras derivadas de esos datos; conviene revisar la compatibilidad en uso comercial.
- El modelo está pensado específicamente para generación de respuestas en RAG; su uso como modelo de propósito general no está validado.
- No se documentan limitaciones de longitud de contexto del modelo base en la información disponible.
- El repositorio tiene muy pocas descargas (6) y ningún "like", lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft016_compo
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
