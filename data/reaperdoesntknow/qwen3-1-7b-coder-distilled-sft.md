# reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT

## Resumen

Qwen3-1.7B-Coder-Distilled-SFT es un modelo de lenguaje causal de aproximadamente 2.030 millones de parámetros (1,7B nominales) desarrollado por Reaperdoesntrun / Convergent Intelligence LLC a partir de Qwen/Qwen3-1.7B. Se construye en dos fases: una destilación de conocimiento desde Qwen3-Coder-30B-A3B-Instruct como profesor para establecer una base de razonamiento STEM estructurado, seguida de un ajuste supervisado (SFT) sobre aproximadamente 54.607 pares instrucción-respuesta de inferencia lógica formal.

El objetivo declarado es que un modelo pequeño adquiera patrones de descomposición secuencial, seguimiento de estado y razonamiento composicional heredados del profesor Coder, y que el SFT en lógica proposicional haga explícita esa estructura latente. Es relevante para quienes necesitan un modelo compacto (4,1 GB en safetensors) orientado a derivaciones STEM y lógica formal, desplegable en entornos con recursos limitados y con licencia Apache 2.0.

La arquitectura subyacente es la de Qwen3 (transformer causal con RoPE y GQA), con una longitud de contexto de entrenamiento de 1024 tokens. El modelo está etiquetado únicamente para inglés y su pipeline es text-generation.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 (causal LM, RoPE, GQA) |
| Parámetros totales | 2.031.739.904 (~2B; 1,7B nominales) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantización | no disponible (repo en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer causal con RoPE y atención GQA. El entrenamiento se divide en dos etapas. La etapa 1 realiza destilación de conocimiento desde Qwen3-Coder-30B-A3B-Instruct (variante MoE de 30B especializada en código) con temperatura T=2,0, transfiriendo el paisaje de probabilidad completo del profesor. Los datos son 6.122 muestras de chain-of-thought STEM en 12 dominios (física 2.254, álgebra lineal 667, ecuaciones diferenciales 636, electromagnetismo 580, matemáticas 576, ingeniería 574, mecánica clásica 343, mecánica teórica 307, cálculo avanzado 268, física moderna 177, fisiología 114, biología molecular 71), de los cuales se usaron 5.815 en entrenamiento. La función de pérdida combina cross-entropy ponderada por prueba (55%, con peso 2,5x a 1,5x sobre tokens de derivación) y divergencia KL de destilación (45%, T=2,0 escalada por T²). Hiperparámetros: 1 época, batch efectivo 8, learning rate 1,5e-5 a 1e-6 con coseno, precisión bf16.

La etapa 2 aplica SFT sobre KonstantinDob/logic_inference_dataset, con aproximadamente 54.607 pares instrucción-respuesta derivados de 5.491 problemas únicos de inferencia lógica (split IID, formato LOGICINFERENCEe), cubriendo lógica proposicional, implicación lógica e inferencia formal. Hiperparámetros: 1 época, batch efectivo 8, learning rate 5e-6 (inferior a la etapa 1 para preservar la base), gradient checkpointing activado, precisión bf16. El formato de entrenamiento de la etapa 1 usa plantilla "Problem/Proof/Final Answer" y la etapa 2 usa "### Instruction: / ### Response:".

## Capacidades

- Generación de texto causal en inglés.
- Razonamiento STEM con derivaciones paso a paso (matemáticas, física, ingeniería).
- Razonamiento matemático y cálculo, álgebra lineal y ecuaciones diferenciales.
- Razonamiento físico: mecánica clásica y teórica, electromagnetismo, física moderna.
- Inferencia lógica formal: lógica proposicional, implicación lógica y reglas de inferencia.
- Chain-of-thought explícito: el modelo realiza la inferencia primero y da la respuesta final al final.
- Capacidad de código heredada del profesor Coder (según la hipótesis del autor, no documentada con benchmarks).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no documentado como capacidad específica.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Tutoría de derivaciones STEM: el modelo puede generar demostraciones paso a paso de problemas de cálculo, física o álgebra lineal, aprovechando el formato "Problem/Proof/Final Answer" con el que fue entrenado.
- Resolución de problemas de lógica proposicional: adecuado para ejercicios de implicación lógica y reglas de inferencia, dado el SFT sobre el dataset de LogicInference con formato de inferencia primero y respuesta final después.
- Generación de explicaciones técnicas en documentación: puede redactar cadenas de razonamiento estructuradas para manuales de ingeniería o notas de laboratorio, manteniendo el orden lógico del proceso.
- Asistente educativo en entornos con recursos limitados: con ~2B parámetros y 4,1 GB en safetensors, puede desplegarse en una sola GPU consumer para prácticas de laboratorio o demos interactivas.
- Preprocesamiento de problemas matemáticos en pipelines: puede usarse para generar soluciones candidatas o cadenas de razonamiento que luego se filtren o validen con un verificador simbólico.
- Prototipado de razonadores compactos: sirve como base para experimentos de destilación o SFT adicional en dominios STEM, dado su bajo coste de inferencia y licencia permisiva.
- Evaluación de coherencia lógica: útil para probar la robustez de modelos pequeños en tareas de seguimiento de estado y descomposición composicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4,1 GB solo para pesos; con overhead de activaciones y KV cache, en torno a 5-6 GB para contextos de 1024 tokens.
- VRAM estimada en cuantización de 8 bits: no disponible (no se documentan cuantizaciones).
- VRAM estimada en cuantización de 4 bits: no disponible (no se documentan cuantizaciones).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y en GPUs de datacenter como A100 o H100 sin problema.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 6-8 GB de VRAM para bf16 a contexto corto.
- Opciones de despliegue: transformers (documentado en la model card); vLLM, TGI, llama.cpp u Ollama no están documentados para este modelo y requerirían conversión a los formatos correspondientes.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Coder-Distilled-SFT | ~2B | 1024 (entrenamiento) | Apache 2.0 | Destilación Coder + SFT lógica | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible en esta ficha | Apache 2.0 | Modelo generalista base | Hugging Face |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (profesor) | 30B totales (3B activos, MoE) | no disponible en esta ficha | no disponible en esta ficha | Código y agentes | Hugging Face |
| Modelos pequeños de razonamiento tipo DeepSeek-R1-Distill-Qwen-1.5B | ~1,5B | no disponible en esta ficha | no disponible en esta ficha | Destilación de razonamiento | Hugging Face |

La comparación de rendimiento cuantitativo no está disponible porque el autor no publica benchmarks.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo; el modelo se entrenó con datos en inglés de dominios STEM y lógica, lo que puede introducir sesgos de dominio y de idioma.
- Riesgo de alucinación en derivaciones largas: al ser un modelo de ~2B, puede producir pasos plausibles pero incorrectos, especialmente fuera de los dominios de entrenamiento.
- Contexto de entrenamiento limitado a 1024 tokens; no se recomienda para tareas que requieran ventanas largas sin validación previa.
- Soporte únicamente en inglés según la model card; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar las condiciones del modelo base Qwen3-1.7B y de los datasets utilizados.
- El modelo está entrenado con formatos de plantilla específicos ("Problem/Proof/Final Answer" y "### Instruction: / ### Response:"); usarlo con otras plantillas puede degradar la calidad.
- No se documentan cuantizaciones oficiales ni integración con vLLM, llama.cpp u Ollama; el despliegue en producción requeriría trabajo adicional de conversión y validación.
- La hipótesis del autor sobre la transferencia de estructura lógica desde el profesor Coder no está respaldada por benchmarks públicos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor de destilación: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Dataset de inferencia lógica: https://huggingface.co/datasets/KonstantinDob/logic_inference_dataset
- Paper LogicInference: https://openreview.net/pdf?id=HAGeIS_Lcg9
- Perfil del autor de datasets STEM: https://huggingface.co/0xZee
- Convergent Intelligence LLC: https://convergentintel.com
