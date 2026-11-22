# reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF

## Resumen

Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF es la versión cuantizada en formato GGUF de un modelo de 0,6 mil millones de parámetros destilado a partir de Qwen3-30B-A3B-Thinking-2507. Lo desarrolla Reaperdoesntrun, bajo la división de investigación de Convergent Intelligence LLC, y está pensado para despliegue local en dispositivos de borde, móviles e incluso hardware de muy baja potencia mediante llama.cpp y runtimes compatibles. El objetivo declarado es comprimir un profesor de 30B en un estudiante 50 veces menor manteniendo parte de la estructura de razonamiento deliberativo.

El modelo parte de la base Qwen/Qwen3-0.6B y se construye en dos etapas: una destilación de conocimiento desde el profesor Thinking sobre 6.122 muestras de cadena de pensamiento STEM, seguida de un ajuste supervisado (SFT) sobre un dataset de instrucciones legales. El resultado es un modelo conversacional de texto, orientado a razonamiento matemático, físico y legal básico, con licencia Apache 2.0 y pesos distribuidos en cuatro cuantizaciones GGUF (F16, Q8_0, Q5_K_M y Q4_K_M).

Su relevancia actual radica en la ventana de despliegue: la versión Q4_K_M ocupa unos 400 MB y puede ejecutarse en entornos donde un modelo de 7B o 30B es inviable. No obstante, el propio autor advierte que el tamaño impone un techo de capacidad claro y que los resultados deben verificarse siempre en aplicaciones críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B) |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los ejemplos de uso emplean n_ctx=1024) |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only denso de 751 millones de parámetros. El proceso de construcción consta de dos etapas documentadas por el autor. La primera es una destilación de conocimiento desde Qwen3-30B-A3B-Thinking-2507 sobre 6.122 muestras de razonamiento STEM en formato chain-of-thought. Se emplea una pérdida de entropía cruzada ponderada por prueba (2,5x a 1,5x sobre los tokens de derivación) combinada con divergencia KL a temperatura 2.0, con el objetivo de transferir la estructura de deliberación extendida del profesor Thinking al estudiante. El autor menciona fundamentos matemáticos propios de su pipeline (Discrepancy Calculus, Topological Knowledge Distillation, operador de discrepancia y descomposición BV) que, según afirma, quedan codificados en los pesos y se preservan tras la cuantización.

La segunda etapa es un SFT sobre el dataset Alignment-Lab-AI/Lawyer-Instruct con una tasa de aprendizaje conservadora de 5e-6, para añadir razonamiento legal sin sobrescribir la base STEM. No se documentan en la información disponible detalles sobre el número total de tokens de entrenamiento, la composición completa del dataset, ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones de inferencia como decodificación especulativa o atención lineal. La cuantización se realizó con las herramientas estándar de llama.cpp.

## Capacidades

- Generación de texto conversacional e instruccional en inglés.
- Razonamiento matemático y demostraciones STEM con trazas de cadena de pensamiento (el autor indica que degrada más allá de ~8 pasos).
- Razonamiento físico básico, derivado de las muestras STEM de destilación.
- Razonamiento legal de conceptos generales (p. ej., promissory estoppel, diferencia entre felony y misdemeanor), añadido en la etapa SFT.
- Dos formatos de prompt diferenciados: derivación STEM y instruction-following.
- Despliegue en llama.cpp, Ollama, LM Studio y runtimes compatibles con GGUF.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito con tokens de control.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Asistencia educativa en dispositivos sin conectividad: el modelo Q4_K_M (~400 MB) puede ejecutarse en un móvil o tableta y resolver dudas de matemáticas o física con derivaciones paso a paso, útil en entornos rurales o sin red.
- Prototipado rápido de razonamiento STEM en local: un investigador puede validar pipelines de evaluación o generar borradores de demostraciones en un portátil sin GPU dedicada usando llama.cpp u Ollama.
- Filtrado y clasificación de consultas legales básicas: con el formato `### Instruction:`, puede etiquetar o resumir consultas jurídicas sencillas antes de derivarlas a un sistema mayor o a un profesional.
- Componente de un sistema en cascada: actuar como primer nivel de razonamiento barato y derivar al modelo grande solo cuando la confianza o la longitud de la derivación superen un umbral.
- Demostraciones y tutoriales de destilación: sirve como ejemplo reproducible de cómo comprimir un profesor Thinking en un estudiante de 0,6B y desplegarlo en GGUF.
- Aplicaciones de borde con requisitos estrictos de memoria: wearables, IoT o dispositivos empotrados donde el presupuesto de RAM es inferior a 1 GB y se necesita generación de texto con razonamiento mínimo.
- Generación de borradores de explicaciones técnicas en inglés para documentación interna, con revisión humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~1,3 GB en F16, ~700 MB en Q8_0, ~500 MB en Q5_K_M y ~400 MB en Q4_K_M (tamaños de fichero indicados por el autor; el consumo real en ejecución es algo superior por el contexto y el estado del runtime).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutarlo con holgura; también es viable en CPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales, e incluso en iGPU y SoC móviles.
- Opciones de despliegue: llama.cpp (CLI y binding de Python `llama_cpp`), Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF | 751.632.384 | no disponible | Apache 2.0 | GGUF | Destilado de Qwen3-30B-A3B-Thinking; SFT legal |
| Qwen/Qwen3-0.6B | 0,6B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base original de Qwen, sin destilación ni SFT legal |
| reaperdoesntknow/Qwen3-0.6B-STEM-Proof-Distilled-Thinking | 0,6B | no disponible | no disponible | no disponible | Solo etapa 1, backbone STEM puro |
| reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF | 1,7B | no disponible | no disponible | GGUF | Variante mayor del mismo pipeline |

## Limitaciones y advertencias

- Capacidad limitada por el tamaño: el autor reconoce explícitamente que 0,6B es una restricción dura y que el modelo cometerá errores que modelos mayores evitan.
- Las demostraciones multi-paso se degradan más allá de ~8 pasos.
- El razonamiento legal cubre conceptos generales pero carece de matiz; no sustituye a asesoramiento jurídico profesional.
- Riesgo de alucinación inherente a modelos pequeños; verificar siempre las salidas críticas.
- Solo soporta inglés según la model card; no se documenta cobertura multilingüe.
- La longitud de contexto no está especificada; los ejemplos usan 1024 tokens, lo que limita conversaciones largas.
- No se documentan evaluaciones de sesgo ni de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad de las salidas en producción.
- Los fundamentos matemáticos propios del autor (Discrepancy Calculus, Topological Knowledge Distillation) no están validados de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF
- Modelo fuente (precisión completa): https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT
- Variante solo STEM: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-STEM-Proof-Distilled-Thinking
- Variante 1.7B GGUF: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Dataset de SFT legal: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
- Convergent Intelligence LLC: https://convergentintel.com
- Perfil del autor: https://huggingface.co/reaperdoesntknow
