# Fred456/llava15_7b_DPO-ab_3

## Resumen

Este repositorio contiene un adaptador PEFT (Parameter-Efficient Fine-Tuning) sobre el modelo multimodal LLaVA-1.5-7B, publicado por el usuario Fred456. El nombre del modelo, `llava15_7b_DPO-ab_3`, sugiere que se ha aplicado un ajuste mediante Direct Preference Optimization (DPO), aunque no se proporciona documentación que lo confirme. El adaptador está diseñado para ser cargado sobre el modelo base `liuhaotian/llava-v1.5-7b`, que combina un codificador visual CLIP ViT-L/14 con un modelo de lenguaje Vicuna-7B para tareas de comprensión imagen-texto.

La relevancia de este adaptador radica en que permite modificar el comportamiento de un modelo multimodal de 7B parámetros sin necesidad de reentrenar todos los pesos, lo que reduce drásticamente los requisitos de cómputo y almacenamiento. Sin embargo, la ausencia de una model card completa y de métricas de evaluación limita su uso directo en producción sin una validación previa por parte del desarrollador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (probablemente LoRA) sobre LLaVA-1.5-7B |
| Parametros totales | no disponible (el adaptador, no el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base LLaVA-1.5-7B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre LLaVA-1.5-7B, un modelo multimodal que conecta un codificador visual (CLIP ViT-L/14) con un modelo de lenguaje (Vicuna-7B) mediante un proyector. El tag `peft` y el tamaño del repositorio (0.8 GB) indican que se trata de un adaptador de bajo rango (típicamente LoRA) que modifica una fracción de los pesos del modelo base. El nombre `DPO` sugiere un entrenamiento con Direct Preference Optimization, una técnica de alineación que optimiza preferencias humanas, pero no se aportan detalles sobre el dataset, el número de pasos, hiperparámetros ni el procedimiento exacto. Tampoco se especifica si el adaptador afecta a todas las capas o solo a algunas, ni el rango del LoRA.

## Capacidades

- Al estar basado en LLaVA-1.5-7B, se espera que herede las capacidades multimodales del modelo base: comprensión de imágenes, respuesta a preguntas visuales (VQA), generación de descripciones de imágenes y razonamiento sobre contenido visual.
- No se dispone de información específica sobre si el adaptador añade o modifica capacidades concretas, como tool calling, agentes o razonamiento multi-paso.
- El modelo base es monolingüe en inglés principalmente, pero no se confirma el comportamiento del adaptador en otros idiomas.
- No se indica soporte para audio, video ni otras modalidades más allá de imagen y texto.

## Casos de uso

- Descripción automática de imágenes: el adaptador, sobre LLaVA-1.5-7B, puede generar texto descriptivo a partir de una imagen, útil para accesibilidad o indexación de contenido visual.
- Asistente de preguntas y respuestas visuales: integrar el modelo en un chatbot que responda a consultas sobre fotografías, diagramas o capturas de pantalla.
- Moderación de contenido visual: clasificar o describir imágenes para detectar contenido inapropiado, aunque se requiere validación adicional.
- Análisis de documentos escaneados: extraer información de imágenes de documentos, facturas o formularios mediante preguntas en lenguaje natural.
- Generación de datos sintéticos para entrenamiento: usar el modelo para crear pares imagen-texto que alimenten otros sistemas.
- Investigación en alineación multimodal: el adaptador puede servir como punto de partida para estudiar el efecto de DPO en modelos visuales, aunque no hay métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de tareas visuales como VQAv2 o GQA.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base LLaVA-1.5-7B más un pequeño overhead por el adaptador.
- Para inferencia en FP16, se estima que se necesitan al menos 14 GB de VRAM (el modelo base tiene ~7B parámetros, más el codificador visual y el proyector). Una GPU como NVIDIA RTX 3090/4090 (24 GB) o A10 (24 GB) sería suficiente.
- En cuantización de 8 bits, podría caber en GPUs con 10-12 GB, como RTX 3080 o A5000, pero no se ha verificado para este adaptador.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI pueden cargar el modelo base y el adaptador, aunque se requiere configuración específica para PEFT.
- No se dispone de datos de latencia o throughput para este adaptador concreto.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables con el mismo enfoque (adaptador DPO sobre LLaVA-1.5-7B) en la información proporcionada. Se podría comparar con el modelo base LLaVA-1.5-7B, pero no hay métricas del adaptador para establecer diferencias.

## Limitaciones y advertencias

- No hay documentación sobre sesgos, alucinaciones o limitaciones específicas del adaptador. Se heredan las limitaciones del modelo base LLaVA-1.5-7B, que incluyen posibles alucinaciones visuales (descripciones inexactas) y sesgos en los datos de entrenamiento.
- La licencia no está especificada, por lo que el uso comercial es incierto. Se recomienda contactar al autor antes de utilizarlo en producción.
- El adaptador no incluye el modelo base completo; es necesario descargar `liuhaotian/llava-v1.5-7b` por separado, lo que añade complejidad de despliegue.
- No se han proporcionado ejemplos de uso ni código de carga, lo que dificulta su integración.
- El nombre sugiere un entrenamiento con DPO, pero no hay evidencia de su efectividad ni de los datos utilizados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Fred456/llava15_7b_DPO-ab_3
- Modelo base LLaVA-1.5-7B: https://huggingface.co/liuhaotian/llava-v1.5-7b
- Paper de LLaVA (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Página oficial de LLaVA: https://llava-vl.github.io/
- Repositorio GitHub de LLaVA: https://github.com/haotian-liu/LLaVA
