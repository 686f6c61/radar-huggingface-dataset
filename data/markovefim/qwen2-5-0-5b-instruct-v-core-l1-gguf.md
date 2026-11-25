# MarkovEfim/Qwen2.5-0.5B-Instruct-V-CORE-L1-GGUF

## Resumen

Qwen2.5-0.5B-Instruct-V-CORE-L1-GGUF es una compilación cuantizada en formato GGUF del modelo Qwen/Qwen2.5-0.5B-Instruct, publicada por el usuario MarkovEfim. No se trata de un modelo entrenado desde cero, sino de una reempaquetado del modelo base de Alibaba Cloud mediante la herramienta V-CORE (L1)-Certified v3.0.0, que el autor describe como respaldada por 21 módulos verificados formalmente en Lean 4. El objetivo declarado es ofrecer una versión comprimida del modelo con métricas de fidelidad explícitas respecto al original en FP16.

El modelo hereda la arquitectura transformer decoder-only del Qwen2.5-0.5B-Instruct original, con 630.167.424 parámetros totales según los pesos en safetensors del modelo base. La contribución propia de esta ficha es la cuantización: el autor reporta una compresión de 2,08x respecto al FP16 original (942,32 MB a 453,75 MB empaquetado) y un artefacto GGUF final de 717,79 MB combinando Q4_0 y F16.

La relevancia de esta publicación es acotada: se trata de un experimento de cuantización con certificación formal, con cero descargas en el momento de la consulta y sin datos de benchmarks de tareas. Resulta útil como referencia metodológica para quienes investigan técnicas de cuantización con garantías formales, pero no como sustituto del modelo base para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 630.167.424 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_0 + F16 (artefacto GGUF); empaquetado V-CORE L1 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (artefacto); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-0.5B-Instruct de Alibaba, un transformer decoder-only de 630 millones de parámetros. Esta publicación no reentrena el modelo: aplica una cuantización data-free mediante la herramienta V-CORE (L1)-Certified v3.0.0, que el autor vincula a 21 módulos verificados formalmente en Lean 4. El proceso produce un empaquetado comprimido (453,75 MB frente a 942,32 MB en FP16 original) y un artefacto GGUF final de 717,79 MB combinando Q4_0 y F16.

El autor reporta métricas de fidelidad tras la cuantización: error relativo L1 del 10,76%, similitud coseno de logits de 0,9542 sobre un vocabulario de 151.936 tokens (95,4% de alineamiento) y un aumento de perplejidad de 15,315 a 22,396. No se detalla la composición del dataset de entrenamiento original ni si hubo RLHF o DPO, ya que esa información pertenece al modelo base Qwen2.5 y no se reproduce en esta model card.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen2.5-0.5B-Instruct.
- Instrucciones conversacionales (variante Instruct del modelo base).
- Soporte de tool calling y function calling: no confirmado en la información disponible para esta compilación GGUF.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad especial: cuantización data-free con certificación formal en Lean 4 (V-CORE L1), con métricas de fidelidad documentadas.

## Casos de uso

- Investigación en cuantización con garantías formales: el modelo sirve como caso de estudio reproducible para evaluar el impacto de V-CORE L1 sobre la perplejidad y la similitud de logits frente al FP16 original.
- Despliegue en entornos con recursos muy limitados: el artefacto GGUF de 717,79 MB puede ejecutarse con llama.cpp u Ollama en dispositivos de gama baja, útil para prototipos de generación de texto sin requisitos de calidad alta.
- Pruebas de pipelines de inferencia GGUF: permite validar integraciones con llama-cli, Ollama o servidores compatibles con endpoints antes de migrar a modelos mayores.
- Docencia y demostraciones de cuantización: las métricas publicadas (error L1, similitud coseno, perplejidad) permiten explicar el compromiso entre compresión y fidelidad con datos concretos.
- Generación de texto auxiliar offline: tareas de resumen o reescritura breve en local, aceptando la degradación de perplejidad documentada (15,315 a 22,396).
- Comparación de metodologías de cuantización: sirve como referencia frente a cuantizaciones estándar de llama.cpp sobre el mismo modelo base, siempre que se repliquen las métricas del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas son de fidelidad de cuantización:

| Metrica | FP16 original | V-CORE L1 (GGUF) |
|---|---|---|
| Tamano | 942,32 MB | 717,79 MB (artefacto GGUF) / 453,75 MB (empaquetado) |
| Perplejidad | 15,315 | 22,396 |
| Similitud coseno de logits | referencia | 0,9542 (151.936 tokens de vocabulario) |
| Error relativo L1 | referencia | 10,76% |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con el artefacto GGUF Q4_0 (717,79 MB en disco); el empaquetado V-CORE ocupa 453,75 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; también viable en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo con 2 GB o más (GTX 1050, RTX 3050, RTX 4060, etc.), así como en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-V-CORE-L1-GGUF | 630.167.424 | no disponible | Apache 2.0 | GGUF | Cuantización data-free con certificación Lean 4; perplejidad 22,396 |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 630.167.424 | no disponible en la informacion | Apache 2.0 | safetensors | Modelo original en FP16; perplejidad 15,315 |
| Otras cuantizaciones GGUF del mismo base (p. ej. Q4_K_M estándar de llama.cpp) | 630.167.424 | no disponible | Apache 2.0 | GGUF | Sin métricas de fidelidad publicadas en esta ficha; referencia habitual de la comunidad |

## Limitaciones y advertencias

- Degradación medible de calidad: la perplejidad sube de 15,315 a 22,396 y el error relativo L1 es del 10,76%, lo que puede afectar a tareas que requieran precisión alta.
- Similitud de logits del 95,4%: el 4,6% restante implica divergencias en la distribución de probabilidad respecto al modelo original.
- Modelo de 0,5B parámetros: capacidad limitada para razonamiento complejo, matemáticas avanzadas y generación de código, incluso sin cuantizar.
- Sesgos: no documentados en la información proporcionada; hereda los del modelo base Qwen2.5, no evaluados en esta ficha.
- Riesgo de alucinación: no cuantificado en la información disponible; previsiblemente superior al del modelo base por la pérdida de fidelidad.
- Idiomas soportados: no disponibles en la información proporcionada; conviene verificar el comportamiento multilingüe antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el proceso de cuantización ni sobre las métricas reportadas.
- Madurez: cero descargas y dos likes en el momento de la consulta; sin validación independiente de las métricas de fidelidad.
- Fecha de creación registrada (2026-11-25): conviene verificar la vigencia del repositorio antes de depender de él.

## Enlaces

- Hugging Face: https://huggingface.co/MarkovEfim/Qwen2.5-0.5B-Instruct-V-CORE-L1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio V-CORE (L1)-Certified: https://github.com/fomamarkov-creator/vcore-l1-certified
- Módulos Lean 4 de verificación: https://github.com/fomamarkov-creator/l1-projection-complexity-lean4
