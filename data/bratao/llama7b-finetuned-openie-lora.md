# bratao/llama7b-finetuned-openie-lora

## Resumen

Este repositorio publica un modelo de lenguaje causal completo de 7.000 millones de parámetros, resultado de un ajuste fino de Llama-2-7b sobre la tarea de extracción de información abierta (OpenIE) en portugués. A pesar del sufijo `-lora` en el nombre, no contiene un adaptador LoRA, sino dos fragmentos de pesos PyTorch que suman unos 13,48 GB, por lo que debe tratarse como un modelo completo de la familia 7B.

El modelo está orientado a generar extracciones en formato de triplas `ARG0, V, ARG1` a partir de una frase dada, una tarea clásica de OpenIE extractiva. Fue desarrollado por el usuario `bratao` y publicado en noviembre de 2023, aunque la auditoría más reciente del repositorio data de agosto de 2026. La relevancia actual es limitada: se trata de un checkpoint experimental heredado, con identidad de modelo ambigua (la configuración indica Llama-2, pero una tesis asociada apunta a Llama-3), sin métricas verificadas y sin licencia declarada, lo que impide su uso en producción sin una validación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama decoder-only causal, 32 capas, hidden size 4096 |
| Parametros totales | 7.000 millones (aproximado, clase 7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica; probablemente 4096 tokens por ser Llama-2, sin confirmar) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en float16 según config) |
| Idiomas soportados | portugues (pt) |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | PyTorch `.bin` en dos fragmentos (legacy, no safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama decoder-only con 32 capas y dimensión oculta de 4096, tal como se indica en la configuración publicada. La configuración identifica como base a `NousResearch/Llama-2-7b-hf` y la clase `LlamaForCausalLM`. Sin embargo, la propia model card advierte de un conflicto de identidad: una tesis posterior asocia este repositorio a un experimento con Llama-3-8B, pero los archivos públicos no respaldan esa afirmación, por lo que el artefacto se documenta conservadoramente como un checkpoint experimental de Llama-2.

No se dispone de información verificada sobre los datos de entrenamiento. La model card menciona, para el experimento de Llama-3 (no para estos pesos), una mezcla de los datasets OIEC-PT Silver, Pragmático, Gamalho y WikiPUD-Portuguese sintético, entrenados con Axolotl en una NVIDIA H100. No hay evidencia de que esos datos correspondan a este repositorio. Tampoco se documentan técnicas como RLHF o DPO. El ajuste fino se realizó con LoRA según el nombre, pero el artefacto publicado es un modelo completo, lo que sugiere un proceso de fusión de adaptadores.

## Capacidades

- Extracción de información abierta (OpenIE) en portugués: genera triplas `ARG0, V, ARG1` a partir de una frase dada.
- Generación de texto causal estándar, compatible con la API de Transformers.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, el modelo está orientado exclusivamente al portugués.
- Modo de pensamiento o visión: no disponible.

## Casos de uso

- Construcción de bases de conocimiento a partir de textos en portugués: el modelo puede extraer relaciones sujeto-verbo-objeto de oraciones, lo que permite poblar grafos de conocimiento de forma automatizada.
- Anotación de corpus para tareas de OpenIE: investigadores pueden usar el modelo como anotador automático para crear datasets de entrenamiento o evaluación en portugués.
- Análisis de documentos legales o periodísticos: extracción de relaciones clave (quién hizo qué a quién) en actas, sentencias o noticias.
- Preprocesamiento para sistemas de pregunta-respuesta: las triplas extraídas pueden alimentar índices semánticos o motores de búsqueda basados en hechos.
- Asistencia en investigación lingüística: análisis de estructuras argumentales en portugués, con extracción de predicados y sus argumentos.
- Prototipado de pipelines de NLP en portugués: sirve como componente de extracción de información en flujos experimentales, siempre que se valide su calidad antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificados en la informacion disponible. La model card menciona valores históricos no confirmados (precision/recall/F1 perfect-match de 0,1500/0,1103/0,1271 y lexical de 0,2800/0,2059/0,2373) asociados a un artefacto local de 2023, pero sin checksum del checkpoint, por lo que no pueden atribuirse a estos bytes. La tesis reporta métricas para PortOIE-Llama3 (F1 perfect-match 0,1290 y lexical 0,2446), pero su referencia a este repositorio es inconsistente con la configuración Llama-2 del artefacto. No se debe asignar ningún valor de benchmark a este modelo sin una evaluación independiente.

## Requisitos de hardware

- Descarga: aproximadamente 13,48 GB en dos fragmentos `.bin`.
- VRAM estimada para inferencia: al menos 16 GB de VRAM libre para ejecución sin cuantizar, más overhead en tiempo de ejecución. Es una estimación, no un mínimo garantizado.
- GPU recomendadas: no se especifican para inferencia. El entrenamiento del experimento asociado (Llama-3) usó una NVIDIA H100, pero no hay datos para este checkpoint.
- Compatibilidad con GPU de consumo: probablemente quepa en una RTX 4090 (24 GB) o similar, pero sin confirmación oficial.
- Opciones de despliegue: compatible con Transformers y Accelerate mediante `AutoModelForCausalLM`. No se mencionan vLLM, llama.cpp, Ollama ni TGI. El formato `.bin` legacy puede requerir más memoria host que safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos publicados que permitan una comparativa fiable. Este modelo es un checkpoint experimental de OpenIE en portugués, sin métricas verificadas. Como alternativas de la misma categoría (OpenIE en portugués) no se dispone de información en las fuentes consultadas. Se puede mencionar que el modelo base Llama-2-7b tiene benchmarks conocidos, pero este ajuste fino no los hereda necesariamente. Por tanto, la comparativa se declara no disponible.

## Limitaciones y advertencias

- Identidad del modelo ambigua: la configuración dice Llama-2, pero la tesis asociada apunta a Llama-3. Los archivos públicos no resuelven la discrepancia.
- Plantilla de prompt no estandarizada: existen dos variantes documentadas (una en la model card y otra en la tesis), y la implementación histórica incluía un artefacto de Python (`S: sentence.phrase='…'`). Se recomienda probar ambas antes de confiar en el modelo.
- Riesgo de alucinación: la salida puede ser malformada, incompleta, duplicada o inventada. Cada campo extraído debe verificarse contra la frase original.
- Sin evaluación de sesgos, seguridad ni contexto largo: no hay ningún estudio público sobre estos aspectos para estos pesos.
- Licencia no declarada: no se puede usar comercialmente sin aclarar los términos, lo que supone un riesgo legal.
- Formato legacy `.bin`: puede provocar mayor uso de memoria host y tiempos de carga más largos que safetensors.
- No usar las extracciones como hechos verificados: son predicciones del modelo, no datos confirmados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bratao/llama7b-finetuned-openie-lora
- Modelo base identificado en config: https://huggingface.co/NousResearch/Llama-2-7b-hf
- Otros enlaces: no se encontraron en la busqueda web (papers, blogs o demos adicionales).
