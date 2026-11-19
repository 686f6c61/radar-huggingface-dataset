# reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT

## Resumen

Qwen3-1.7B-Coder-Distilled-SFT es un ajuste fino del modelo Qwen/Qwen3-1.7B desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division). El modelo se construye en dos etapas: primero aplica destilación de conocimiento desde Qwen3-Coder-30B-A3B-Instruct sobre 6.122 muestras de chain-of-thought STEM, y después realiza un SFT sobre aproximadamente 54.607 pares instrucción-respuesta de inferencia lógica formal. El objetivo es transferir los patrones de descomposición y seguimiento de estado del profesor Coder a un modelo de 2.000 millones de parámetros.

La hipótesis del autor es que un modelo que ha aprendido derivaciones STEM de un profesor especializado en código ya posee estructura latente para lógica secuencial y razonamiento composicional, y que el SFT de inferencia lógica activa esa estructura de forma explícita en lugar de enseñarla desde cero. El resultado es un modelo pequeño orientado a entornos edge, razonamiento matemático y resolución de problemas de lógica proposicional.

Arquitectónicamente hereda la base Qwen3 (transformer causal con RoPE y GQA) y se distribuye bajo licencia Apache 2.0 con pesos en safetensors. Su ventana de contexto de entrenamiento es de solo 1.024 tokens, lo que limita su uso en tareas de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal Qwen3 (RoPE, GQA) |
| Parametros totales | 2.031.739.904 (~2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer causal denso con RoPE y atención GQA. Sobre esa base se aplica un pipeline de dos etapas. La primera etapa es una destilación de conocimiento desde Qwen3-Coder-30B-A3B-Instruct (variante MoE de 30B especializada en código) usando 6.122 muestras de chain-of-thought STEM repartidas en 12 dominios: física (2.254), álgebra lineal (667), ecuaciones diferenciales (636), electromagnetismo (580), matemáticas (576), ingeniería (574), mecánica clásica (343), mecánica teórica (307), cálculo avanzado (268), física moderna (177), fisiología (114) y biología molecular (71). La función de pérdida combina cross-entropy ponderada por prueba (55%, con peso 2,5x a 1,5x sobre tokens de derivación) y divergencia KL de destilación (45%, T=2,0 escalada por T²). Se entrena 1 época, batch efectivo 8, learning rate 1,5e-5 a 1e-6 con decaimiento coseno y precisión bf16.

La segunda etapa es un SFT sobre KonstantinDob/logic_inference_dataset, derivado del paper LogicInference de Santiago Ontañón (Google Research). El dataset contiene 5.491 problemas únicos de inferencia lógica extendidos a unos 54.607 pares instrucción-respuesta, usando solo el split IID y el formato LOGICINFERENCEe (inferencia primero, respuesta final al final). Se entrena 1 época con batch efectivo 8, learning rate 5e-6 (más bajo para preservar el backbone), gradient checkpointing y bf16. El formato de entrenamiento de la etapa 1 es "Solve the following problem carefully and show a rigorous derivation" y el de la etapa 2 usa las marcas `### Instruction:` y `### Response:`.

## Capacidades

- Generación de texto y razonamiento paso a paso con cadenas de pensamiento explícitas.
- Razonamiento matemático y derivaciones STEM en física, álgebra lineal, ecuaciones diferenciales, electromagnetismo, mecánica y cálculo.
- Inferencia lógica formal: lógica proposicional, implicación lógica y reglas de inferencia con premisas explícitas.
- Generación de código y descomposición de problemas algorítmicos, heredada del profesor Coder.
- Seguimiento de estado y razonamiento composicional secuencial.
- Conversación multi-turno básica en inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente; el modelo está entrenado para cadenas de razonamiento largas pero no se describe integración con frameworks de agentes.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: no se documentan modos de thinking separados, visión ni audio.

## Casos de uso

- Tutoría de matemáticas y física a nivel universitario: el modelo puede generar derivaciones paso a paso de problemas de cálculo, mecánica o electromagnetismo, aprovechando las 6.122 muestras CoT STEM de entrenamiento para estructurar la solución como una prueba formal.
- Resolución de ejercicios de lógica proposicional: dado un conjunto de premisas y reglas de inferencia, el modelo aplica el formato LOGICINFERENCEe para encadenar deducciones y presentar la conclusión al final, útil en herramientas educativas de lógica formal.
- Asistente de estudio para asignaturas STEM en entornos con recursos limitados: con ~2B parámetros y pesos safetensors de 4,1 GB, puede desplegarse en portátiles o dispositivos edge para generar explicaciones de problemas de álgebra lineal o ecuaciones diferenciales sin conexión a la nube.
- Generación de explicaciones de código educativo: al haber sido destilado de un profesor Coder, puede descomponer fragmentos de código en pasos lógicos y explicar la traza de ejecución, útil en plataformas de aprendizaje de programación.
- Preprocesamiento de razonamiento en pipelines de verificación: el modelo puede generar cadenas de inferencia intermedias que un sistema posterior valide, por ejemplo en la comprobación automática de demostraciones o en la generación de datos sintéticos de lógica para entrenar modelos mayores.
- Prototipado rápido de asistentes conversacionales técnicos en inglés: su tamaño reducido permite iterar con `transformers` en una sola GPU consumer para probar prompts de razonamiento STEM antes de escalar a modelos mayores.
- Generación de datasets de chain-of-thought para destilación posterior: el modelo puede producir derivaciones etiquetadas en dominios STEM que sirvan como datos de entrenamiento para otros modelos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica unos 5-6 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,5 GB; en 4 bits, alrededor de 1,5 GB (estimaciones teóricas, no verificadas en la model card).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070). Para cuantización 4 bits, GPUs con 4-6 GB como RTX 3050 o GTX 1660.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 6-8 GB o más.
- Opciones de despliegue: `transformers` (soporte nativo declarado), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF (no confirmado en la información disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-1.7B-Coder-Distilled-SFT | ~2,03B | 1.024 (entrenamiento) | Apache 2.0 | Destilación Coder + SFT lógica |
| Qwen/Qwen3-1.7B (base) | ~2B | no disponible en la información | Apache 2.0 | Modelo generalista base |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (profesor) | 30B MoE | no disponible en la información | no disponible en la información | Código y agentes |
| Modelos pequeños de razonamiento (p. ej. variantes distilled de la familia Qwen) | ~1,5-2B | variable | variable | Razonamiento CoT |

La comparación directa con alternativas de la misma categoría (modelos de ~2B orientados a razonamiento STEM) no está disponible en la información proporcionada. El modelo se posiciona frente a su base Qwen3-1.7B por la especialización en derivaciones STEM y lógica formal, y frente al profesor Qwen3-Coder-30B-A3B por un tamaño 15 veces menor a costa de contexto y capacidades generales.

## Limitaciones y advertencias

- Ventana de contexto de solo 1.024 tokens en entrenamiento: inadecuado para documentos largos, conversaciones extensas o bases de código grandes.
- Entrenado únicamente en inglés; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Riesgo de alucinación en derivaciones matemáticas y pruebas lógicas: el modelo puede producir pasos plausibles pero incorrectos, especialmente fuera de los dominios cubiertos por el dataset de entrenamiento.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3-1.7B hereda los sesgos del modelo base, no evaluados en esta ficha.
- El SFT de lógica se limita al split IID del dataset LogicInference, lo que puede reducir la generalización a problemas de inferencia fuera de esa distribución.
- El formato de prompt es específico (`### Instruction:` / `### Response:` en etapa 2; formato de derivación en etapa 1); usar otros formatos puede degradar la calidad de salida.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni evaluaciones de seguridad para producción.
- Modelo con 1 like y 2.993 descargas en el momento de la ficha: comunidad pequeña y escasa validación independiente.
- No se documentan evaluaciones de robustez, toxicidad ni alineación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor de destilación: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Dataset de inferencia lógica: https://huggingface.co/datasets/KonstantinDob/logic_inference_dataset
- Paper LogicInference (Santiago Ontañón): https://openreview.net/pdf?id=HAGeIS_Lcg9
- Datasets CoT STEM del autor 0xZee: https://huggingface.co/0xZee
- Convergent Intelligence LLC: https://convergentintel.com
