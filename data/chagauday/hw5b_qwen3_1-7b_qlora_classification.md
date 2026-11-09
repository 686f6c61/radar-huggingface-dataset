# Chagauday/HW5B_Qwen3_1.7B_QLoRA_Classification

## Resumen

`Chagauday/HW5B_Qwen3_1.7B_QLoRA_Classification` es un ajuste fino (fine-tuning) del modelo base Qwen3-1.7B de Alibaba Qwen, publicado por el usuario Chagauday en Hugging Face. El nombre del repositorio indica que se trata de un adaptador o modelo derivado entrenado con QLoRA (quantized low-rank adaptation) para una tarea de clasificación, aunque la model card no documenta ni el dataset, ni las etiquetas, ni los hiperparámetros empleados. El repositorio ocupa 0,6 GB y contiene pesos en formato safetensors compatibles con la librería `transformers`.

El modelo hereda la arquitectura transformer densa del Qwen3-1.7B original, con aproximadamente 1,7 mil millones de parámetros. Al ser un derivado de Qwen3, su relevancia potencial radica en ofrecer una variante especializada en clasificación sobre una base moderna y ligera, desplegable en hardware de consumo. Sin embargo, la ausencia de documentación técnica (licencia, idiomas, datos de entrenamiento, métricas) limita seriamente su evaluación rigurosa y su uso en producción.

Esta ficha se elabora exclusivamente a partir de los metadatos del repositorio y de la información pública del modelo base Qwen3-1.7B. Cualquier dato no confirmado se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B); detalles del ajuste QLoRA no disponibles |
| Parametros totales | Aproximadamente 1,7 mil millones (heredados de Qwen3-1.7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-1.7B soporta hasta 32 768 tokens, pero no se confirma que este ajuste lo preserve |
| Tipos de cuantizacion | No disponible (el nombre sugiere entrenamiento QLoRA, no necesariamente pesos cuantizados en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-09 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso decoder-only de la familia Qwen3. El nombre del repositorio indica un entrenamiento con QLoRA, técnica que congela los pesos del modelo base en precisión reducida (normalmente 4 bits NF4) y entrena adaptadores de bajo rango sobre las capas lineales. No obstante, la model card no especifica si el repositorio contiene únicamente los adaptadores LoRA, los pesos fusionados (merged) o una versión cuantizada, ni detalla el rango, el alpha, la tasa de aprendizaje o el número de pasos.

Tampoco se documentan los datos de entrenamiento: no hay información sobre el dataset, el número de ejemplos, la composición de las clases, el balanceo ni si se aplicó validación cruzada. Se desconoce si hubo RLHF, DPO o cualquier etapa de alineamiento posterior. La única referencia técnica explícita en los tags es `arxiv:1910.09700`, que corresponde al artículo de Lacoste et al. sobre el cálculo de emisiones de carbono (ML Impact Calculator), un enlace genérico de la plantilla de model card y no una contribución metodológica del modelo.

## Capacidades

- Clasificación de texto: el nombre del repositorio indica un ajuste para una tarea de clasificación, pero se desconoce el dominio, las etiquetas y el formato de entrada esperado.
- Generación de texto: al derivar de Qwen3-1.7B, conserva potencialmente la capacidad generativa del modelo base, aunque el ajuste para clasificación puede haber degradado esta habilidad.
- Razonamiento y código: el modelo base Qwen3 incorpora capacidades de razonamiento y generación de código; no se confirma que se mantengan tras el ajuste.
- Tool calling / function calling: no disponible para este ajuste.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible para este ajuste; el modelo base Qwen3-1.7B es solo texto.

## Casos de uso

- Clasificación de tickets de soporte: si el ajuste se orientó a categorización de texto, podría emplearse para etiquetar incidencias por tipo o urgencia; sin embargo, la falta de documentación sobre las clases impide confirmar su idoneidad.
- Moderación de contenido en pipelines internos: un clasificador ligero de 1,7B parámetros puede ejecutarse en CPU o GPU de consumo para filtrar texto antes de pasarlo a modelos mayores, siempre que se valide su comportamiento con datos propios.
- Etiquetado semiautomático de datasets: el modelo podría preetiquetar grandes volúmenes de texto para revisión humana posterior, reduciendo el coste de anotación.
- Prototipado rápido de clasificadores: al ocupar 0,6 GB, permite experimentar en entornos con recursos limitados (portátiles, contenedores pequeños) sin infraestructura dedicada.
- Enrutamiento de consultas en sistemas RAG: un clasificador ligero puede decidir qué base de conocimiento o herramienta consultar antes de invocar un modelo generativo mayor.
- Filtrado previo en atención al cliente: clasificar mensajes entrantes por intención para derivarlos al agente o flujo adecuado, con la salvedad de que se desconoce el dominio exacto del ajuste.
- Investigación sobre QLoRA: el repositorio puede servir como ejemplo de referencia para reproducir flujos de ajuste cuantizado sobre Qwen3-1.7B, aunque la ausencia de hiperparámetros limita su valor didáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros clasificadores, y tampoco se documenta el conjunto de evaluación empleado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 4-6 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: alrededor de 1,7-2,5 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): alrededor de 1-1,5 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; en entornos profesionales, A10G, L4, A100 o H100 sobran para este tamaño.
- Cabe en GPU consumer: sí, holgadamente, incluso en GPUs de gama de entrada con 6-8 GB.
- Opciones de despliegue: `transformers` (confirmado por la librería del repo); vLLM, TGI, llama.cpp u Ollama requerirían conversión a los formatos correspondientes, no confirmada por el autor.
- Latencia y throughput estimados: no disponibles. Para un modelo denso de 1,7B en una RTX 4090 se pueden esperar decenas de miles de tokens por segundo en modo batch, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chagauday/HW5B_Qwen3_1.7B_QLoRA_Classification | ~1,7B | No disponible | Clasificación (según nombre) | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B | ~1,7B | Hasta 32 768 tokens | Generación de texto | No disponible en la información consultada | Hugging Face, modelo base oficial |
| Chagauday/HW5A_Qwen3_1.7B_Base_LoRA | ~1,7B | No disponible | Generación de texto (LoRA) | No disponible | Hugging Face, mismo autor |

La comparativa se limita al ecosistema inmediato del modelo. No se dispone de datos de rendimiento que permitan contrastarlo con clasificadores especializados como DeBERTa-v3 o ModernBERT, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla automática de Hugging Face sin rellenar; no hay información sobre datos, etiquetas, hiperparámetros ni evaluación.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; además, la licencia del modelo base Qwen3-1.7B debe verificarse por separado en su repositorio oficial.
- Riesgo de alucinación: si se usa como generador, hereda los riesgos del modelo base; si se usa como clasificador, el riesgo principal es la clasificación errónea sistemática por un ajuste no validado.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no es posible evaluar sesgos de dominio, género, idioma o etnia.
- Idiomas no confirmados: se desconoce si el ajuste mantiene el multilingüismo del modelo base o se ha especializado en un único idioma.
- Contexto no confirmado: aunque Qwen3-1.7B soporta contextos largos, el ajuste QLoRA podría haber alterado el comportamiento en secuencias largas.
- Sin métricas de calidad: cero descargas y cero likes indican que el modelo no ha sido validado por la comunidad; no se recomienda su uso en producción sin una evaluación propia exhaustiva.
- Ambigüedad del artefacto: no se aclara si el repositorio contiene adaptadores LoRA, pesos fusionados o una versión cuantizada, lo que complica su integración directa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Chagauday/HW5B_Qwen3_1.7B_QLoRA_Classification
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio relacionado del mismo autor (HW5A, LoRA base): https://huggingface.co/Chagauday/HW5A_Qwen3_1.7B_Base_LoRA
- Artículo referenciado en los tags (ML Impact Calculator, Lacoste et al.): https://arxiv.org/abs/1910.09700
