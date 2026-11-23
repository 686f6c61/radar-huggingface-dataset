# reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT

## Resumen

LFM2.5-1.2B-Distilled-SFT es un modelo de lenguaje de 1.200 millones de parámetros desarrollado por Reaperdoesntrun (división de investigación de Convergent Intelligence LLC) a partir de `liquid/LFM2.5-1.2B-Instruct`. Se trata de un ajuste fino en dos etapas sobre la arquitectura híbrida LFM2.5 de Liquid AI, que combina capas SSM (modelos de espacio de estados) con atención, y que está optimizada para inferencia en dispositivos de borde. El modelo añade razonamiento estructurado en STEM (matemáticas, física, álgebra lineal, ecuaciones diferenciales, electromagnetismo) e inferencia lógica formal sobre la base instruct original.

La relevancia del modelo reside en su pipeline de entrenamiento: es, según el autor, la primera destilación ponderada por demostración combinada con SFT aplicada a una arquitectura no transformer. La primera etapa destila conocimiento de un profesor MoE híbrido de 24B parámetros (`liquid/LFM2-24B-A2B`, con solo 2B activos por token) sobre 2.802 muestras de cadena de pensamiento STEM; la segunda etapa aplica SFT sobre el dataset LogicInference_OA, con aproximadamente 54.607 pares instrucción-respuesta. El resultado es un modelo de 1,3B parámetros que corre a 239 tok/s en CPU AMD y ocupa menos de 1 GB de RAM, con licencia Apache 2.0.

El modelo está pensado para razonamiento lógico y derivaciones STEM en entornos con recursos limitados: móvil, IoT, NPU y CPU sin GPU. Su ventana de contexto es reducida (1024 tokens en entrenamiento), lo que lo circunscribe a tareas de razonamiento acotadas más que a conversaciones largas o procesamiento de documentos extensos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2.5 híbrida (SSM + atención) |
| Parámetros totales | 1.304.558.336 (1,3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantización | GGUF disponible en repositorio separado; cuantizaciones específicas no detalladas |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repo aparte |

## Arquitectura y entrenamiento

La arquitectura base es LFM2.5 de Liquid AI, un modelo híbrido que intercala capas SSM con capas de atención. El componente SSM propaga un estado secuencial a través de las premisas, lo que el autor argumenta que encaja de forma natural con la inferencia lógica proposicional: cada premisa actualiza un estado lógico y la conclusión se deriva del estado final. Esta arquitectura reduce el coste computacional frente a un transformer puro del mismo tamaño, lo que explica las cifras de rendimiento en CPU (239 tok/s en AMD, 82 tok/s en NPU móvil) y el consumo de menos de 1 GB de RAM.

El entrenamiento se divide en dos etapas. La primera es una destilación de conocimiento desde `liquid/LFM2-24B-A2B` (profesor MoE híbrido de 24B con 2B activos) sobre 2.802 muestras CoT STEM de cinco dominios: álgebra lineal (667), ecuaciones diferenciales (636), electromagnetismo (580), matemáticas (576) y mecánica clásica (343). La función de pérdida combina entropía cruzada ponderada por demostración (55%, con peso 2,5→1,5 sobre tokens de derivación) y divergencia KL de destilación (45%, T=2,0 escalada por T²). Se usó 1 época, batch efectivo de 8, LR 1,5e-5→1e-6 con decaimiento coseno y precisión bf16. La segunda etapa es un SFT sobre `KK04/LogicInference_OA` (reproducción del dataset LogicInference de Santiago Ontañón, Google Research), con 5.491 problemas de inferencia únicos extendidos a ~54.607 pares instrucción-respuesta, 1 época, batch efectivo de 8, LR 5e-6 y gradient checkpointing activado.

## Capacidades

- Generación de texto y razonamiento en cadena de pensamiento (chain-of-thought) con formato de derivación rigurosa.
- Razonamiento matemático: álgebra lineal, ecuaciones diferenciales, matemáticas generales.
- Razonamiento físico: electromagnetismo y mecánica clásica.
- Inferencia lógica formal: lógica proposicional, deducción a partir de premisas, formato LOGICINFERENCEe (inferencia primero, respuesta al final).
- Resolución de sistemas de ecuaciones y problemas STEM con pasos intermedios explícitos.
- Conversación en inglés (heredada del modelo instruct base).
- Inferencia en dispositivos de borde: CPU, NPU móvil, IoT.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Tutoría STEM en dispositivos: el modelo puede generar derivaciones paso a paso de problemas de álgebra lineal o mecánica clásica directamente en un móvil o tableta sin conexión, gracias a su consumo inferior a 1 GB de RAM y a los 82 tok/s en NPU móvil.
- Asistente de lógica en entornos educativos: resuelve problemas de inferencia proposicional (por ejemplo, cadenas de implicaciones) con el formato `### Instruction:` / `### Response:`, adecuado para ejercicios de lógica de nivel universitario.
- Verificación de razonamiento en pipelines de CI: integrado como comprobador de pasos lógicos en flujos de validación de problemas matemáticos, donde la ventana de 1024 tokens es suficiente para un enunciado y su derivación.
- Procesamiento en IoT y sistemas embebidos: al correr en CPU AMD a 239 tok/s y en NPU móvil a 82 tok/s, puede desplegarse en dispositivos sin GPU para tareas de clasificación lógica o resolución de problemas acotados.
- Generación de explicaciones matemáticas en herramientas de documentación: produce derivaciones con formato de "Proof" y "Final Answer" que pueden insertarse en manuales técnicos o apuntes generados automáticamente.
- Prototipado de investigación en destilación: sirve como referencia reproducible para estudiar la transferencia de razonamiento entre arquitecturas híbridas compatibles (profesor MoE de 24B y estudiante de 1,2B), con hiperparámetros y datasets documentados.
- Filtrado y clasificación de problemas lógicos: dado su entrenamiento en LogicInference, puede etiquetar o resolver problemas de inferencia en lotes pequeños dentro de un pipeline de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de inferencia: 239 tok/s en CPU AMD, 82 tok/s en NPU móvil y menos de 1 GB de RAM.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 1,3B parámetros; en bf16 requiere aproximadamente 2,6 GB (tamaño del repositorio), y en fp32 unos 5,2 GB. En cuantización GGUF de 4 bits cabría por debajo de 1 GB, coherente con la afirmación del autor de "menos de 1 GB de RAM".
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU y NPU. Cualquier GPU consumer con 4 GB o más (por ejemplo, RTX 3050, RTX 4060) puede alojarlo en bf16.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 4 GB de VRAM en bf16; en cuantización de 4 bits, en dispositivos integrados.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM`), llama.cpp/Ollama mediante los GGUF del repositorio `reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT-GGUF`. vLLM y TGI no se mencionan en la documentación.
- Latencia y throughput: 239 tok/s en CPU AMD y 82 tok/s en NPU móvil, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LFM2.5-1.2B-Distilled-SFT | 1,3B | 1024 | Apache 2.0 | Razonamiento STEM y lógica en borde |
| liquid/LFM2.5-1.2B-Instruct (base) | 1,2B | no disponible | Apache 2.0 | Instrucciones generales, sin especialización STEM/lógica |
| liquid/LFM2-24B-A2B (profesor) | 24B totales, 2B activos | no disponible | no disponible | MoE híbrido de mayor escala, usado como profesor en la destilación |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estos modelos; la comparación se limita a parámetros, contexto, licencia y enfoque.

## Limitaciones y advertencias

- Ventana de contexto de solo 1024 tokens en entrenamiento: inadecuado para conversaciones largas, documentos extensos o razonamientos que requieran mantener mucho estado.
- Entrenado únicamente en inglés: no hay soporte documentado para castellano ni otros idiomas.
- Riesgo de alucinación en derivaciones matemáticas y físicas: el modelo puede producir pasos plausibles pero incorrectos, especialmente fuera de los dominios del dataset de entrenamiento (álgebra lineal, ecuaciones diferenciales, electromagnetismo, matemáticas, mecánica clásica y lógica proposicional).
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de un modelo instruct general, puede heredar sesgos del modelo base y del profesor.
- Especialización estrecha: el SFT en lógica y la destilación en STEM pueden degradar capacidades generales de conversación respecto al modelo base.
- Dataset de entrenamiento pequeño en la etapa 1 (2.802 muestras): la cobertura de temas STEM es limitada y puede no generalizar a problemas atípicos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la exactitud de las derivaciones.
- El autor describe el pipeline como "primera prueba" de destilación ponderada por demostración en arquitectura no transformer; se trata de un resultado de investigación, no de un modelo validado para producción crítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT
- GGUF: https://huggingface.co/reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT-GGUF
- Modelo base: https://huggingface.co/liquid/LFM2.5-1.2B-Instruct
- Modelo profesor: https://huggingface.co/liquid/LFM2-24B-A2B
- Dataset LogicInference_OA: https://huggingface.co/datasets/KK04/LogicInference_OA
- Paper de LogicInference (Santiago Ontañón, Google Research): https://openreview.net/pdf?id=HAGeIS_Lcg9
- Datasets CoT de 0xZee: https://huggingface.co/0xZee
- Convergent Intelligence LLC: https://convergentintel.com
