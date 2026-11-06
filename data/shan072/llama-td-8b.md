# Shan072/Llama-TD-8B

## Resumen

Llama-TD-8B es un adaptador LoRA publicado por el usuario Shan072 sobre la base `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`, es decir, una versión de Meta Llama 3.1 8B Instruct cuantizada a 4 bits y optimizada con la librería Unsloth. El adaptador se distribuye como un repositorio PEFT de aproximadamente 0,4 GB en formato safetensors, lo que corresponde únicamente a los pesos del adaptador y no al modelo completo. La ficha del repositorio no documenta el proceso de entrenamiento, el dataset utilizado ni los hiperparámetros, más allá de las etiquetas que asocian el modelo al dominio de "adoption" y "adoptee-rights".

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con 8.030 millones de parámetros y una ventana de contexto nativa de 128.000 tokens, aunque el adaptador no modifica estas características estructurales. Su relevancia es limitada: se trata de un ajuste fino de nicho, con cero descargas y cero likes en el momento de la consulta, orientado presumiblemente a tareas de redacción o asistencia sobre derechos de personas adoptadas. No hay evidencia publicada de evaluaciones, benchmarks ni documentación técnica más allá de los metadatos del repositorio.

El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face para descargar los pesos, y la licencia aplicable es la Llama 3.1 Community License, heredada de la base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajuste fino mediante LoRA/PEFT |
| Parámetros totales | 8.030 millones (modelo base Llama 3.1 8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1 8B) |
| Tipos de cuantización | Base en bnb-4bit (bitsandbytes NF4); el adaptador LoRA se distribuye en safetensors sin cuantizar |
| Idiomas soportados | en (inglés, según metadatos) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en formato Hugging Face |

## Arquitectura y entrenamiento

El adaptador se monta sobre Meta Llama 3.1 8B Instruct, un transformer decoder-only con atención por grupos (GQA) y RoPE, entrenado originalmente por Meta con aproximadamente 15 billones de tokens y sometido a alineación mediante SFT y RLHF con DPO. La versión base empleada aquí es la variante `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`, que aplica cuantización de 4 bits con bitsandbytes para reducir el consumo de memoria durante el ajuste fino.

El adaptador LoRA se ha entrenado con la librería Unsloth y se distribuye mediante PEFT. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, el rango del adaptador, los módulos objetivo ni si se aplicaron técnicas como QLoRA con doble cuantización. Las etiquetas del repositorio sugieren un corpus centrado en adopción y derechos de las personas adoptadas, pero no hay documentación que lo confirme ni que detalle el proceso.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento y respuesta a instrucciones conversacionales multi-turno.
- Generación de código y resolución de problemas matemáticos básicos, en la medida en que lo permite el modelo base.
- Soporte de tool calling y function calling, siempre que el adaptador no haya degradado esta capacidad (no verificado).
- Capacidad multilingüe limitada al inglés según los metadatos, aunque el modelo base soporta oficialmente ocho idiomas.
- Especialización presumible (no documentada) en temáticas de adopción y derechos de las personas adoptadas.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistencia en redacción de documentos relacionados con adopción: el adaptador puede emplearse para generar borradores de solicitudes, informes o comunicaciones administrativas en inglés, aprovechando el ajuste temático sobre la base Llama 3.1.
- Consultas informativas sobre derechos de personas adoptadas: útil como base para un chatbot de orientación, aunque requiere validación humana por el riesgo de alucinación en materia legal.
- Generación de material divulgativo: artículos, guiones o resúmenes sobre adopción y derechos, con la ventaja de un tono potencialmente alineado con el corpus de ajuste.
- Prototipado rápido de asistentes conversacionales de nicho: al ser un adaptador LoRA de 0,4 GB, se puede cargar junto al modelo base en entornos con recursos moderados para experimentar con prompts específicos.
- Investigación sobre ajuste fino con Unsloth: sirve como ejemplo reproducible de cómo adaptar Llama 3.1 8B a un dominio concreto con QLoRA.
- Filtrado y clasificación de textos sobre adopción: el modelo puede emplearse para etiquetar o resumir documentos de ese dominio, aunque sin métricas publicadas que avalen su rendimiento.
- Integración en pipelines de generación aumentada (RAG): combinado con una base documental sobre derechos de adopción, puede responder preguntas con contexto recuperado, aprovechando la ventana de 128.000 tokens del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,4 GB en disco; el modelo base cuantizado a 4 bits requiere en torno a 5-6 GB de VRAM para inferencia.
- Para cargar el modelo base en precisión completa (fp16) se necesitan aproximadamente 16 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 para fp16; RTX 3060 12 GB o RTX 4060 Ti 16 GB pueden alojar la variante 4 bits.
- Cabe en GPU de consumo con al menos 8 GB de VRAM si se emplea cuantización de 4 bits.
- Opciones de despliegue: transformers + PEFT, vLLM (con soporte de adaptadores LoRA), llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, TGI con adaptadores.
- No se dispone de datos de latencia ni throughput medidos para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Shan072/Llama-TD-8B | 8B (LoRA sobre Llama 3.1 8B) | 128.000 | Llama 3.1 | Gated, 0 descargas | Ajuste de nicho sin benchmarks publicados |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 | Pública | Modelo base oficial, ampliamente evaluado |
| Mistral-7B-Instruct-v0.3 | 7B | 32.000 | Apache 2.0 | Pública | Alternativa permisiva con contexto menor |
| Qwen2.5-7B-Instruct | 7B | 128.000 | Apache 2.0 | Pública | Multilingüe, licencia permisiva, benchmarks publicados |

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento, lo que impide evaluar sesgos específicos introducidos por el ajuste.
- Riesgo de alucinación especialmente relevante en un dominio sensible como la adopción y los derechos legales; no debe usarse como fuente de asesoramiento jurídico sin supervisión humana.
- El adaptador solo declara soporte de inglés, aunque el modelo base es multilingüe; el rendimiento en castellano no está verificado y podría degradarse.
- Licencia Llama 3.1 Community License: permite uso comercial con restricciones (cláusula de 700 millones de usuarios mensuales, obligación de atribución y de nombrar el modelo "Llama" en productos derivados).
- Acceso restringido en Hugging Face: requiere aceptar condiciones y autenticarse para descargar.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- El adaptador debe combinarse con el modelo base cuantizado a 4 bits, lo que introduce pérdida de precisión adicional respecto a la versión fp16.
- No se garantiza que conserven capacidades como tool calling o instrucciones complejas tras el ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/Shan072/Llama-TD-8B
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
