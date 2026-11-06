# radbile2022/legal-chatbot-qwen25-1p5b-grpo

## Resumen

El modelo `radbile2022/legal-chatbot-qwen25-1p5b-grpo` es un ajuste fino (fine-tuning) del modelo Qwen2.5 de 1.500 millones de parametros, orientado a tareas de conversacion en el dominio legal. Lo desarrolla el usuario radbile2022 y se distribuye bajo licencia Apache 2.0. El modelo se ha entrenado en dos fases: primero un ajuste con LoRA (el modelo base declarado es `radbile2022/legal-chatbot-qwen25-1p5b-lora`) y despues una optimizacion con GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo que el framework TRL incorpora para alinear respuestas.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo pequeno (1,5B) pensado para desplegarse en hardware modesto, especializado en un dominio vertical (legal) y con un pipeline de entrenamiento reproducible mediante Unsloth. La model card es extremadamente escasa: no aporta datos sobre el dataset de entrenamiento, el numero de tokens, la composicion del corpus legal ni los hiperparametros de GRPO, por lo que muchas especificaciones deben marcarse como no disponibles.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar subidos o que el repositorio esta vacio o incompleto. Esta circunstancia es critica para cualquier evaluacion practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.500 millones (aproximado, segun el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo declara safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo parte del checkpoint base Qwen2.5-1.5B y se ha ajustado primero mediante LoRA (el autor publica el adaptador como `legal-chatbot-qwen25-1p5b-lora`) y despues mediante GRPO, un algoritmo de RL sin modelo critico separado que estima la ventaja relativa de un grupo de respuestas muestreadas para la misma pregunta. El entrenamiento se realizo con Unsloth, que el autor declara como "2x faster" respecto a un entrenamiento convencional.

No se documentan en la model card el numero de tokens de entrenamiento, la composicion del dataset legal, la procedencia de los datos, ni los hiperparametros de GRPO (tamano de grupo, coeficiente KL, funcion de recompensa). Tampoco se especifica si hubo una fase supervisada previa con datos etiquetados o si el GRPO se aplico directamente sobre el adaptador LoRA. Esta ausencia de informacion impide reproducir el entrenamiento o auditar la calidad de los datos.

## Capacidades

- Generacion de texto conversacional en ingles orientada a consultas de caracter legal.
- Razonamiento basico y respuesta a preguntas dentro del dominio legal, segun la intencion declarada del ajuste.
- Soporte de tool calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Ajuste por refuerzo (GRPO) para alinear el estilo de respuesta, aunque no se detalla la funcion de recompensa utilizada.

## Casos de uso

- Asistente de primera linea en un despacho legal: el modelo puede gestionar consultas frecuentes de clientes (horarios, procedimientos, documentacion requerida) en ingles, con la ventaja de su tamano reducido para despliegue en una sola GPU.
- Clasificacion y resumen de textos legales: dado su ajuste en dominio, puede emplearse para condensar contratos o clausulas, aunque la ausencia de datos de entrenamiento publicos obliga a validar la calidad con un conjunto propio.
- Generacion de borradores de respuestas a consultas rutinarias: util como punto de partida que un profesional revisa, no como sustituto del asesoramiento juridico.
- Prototipado rapido de chatbots legales en entornos de bajo presupuesto: al ser un modelo de 1,5B, cabe en GPUs de consumo y permite iterar sobre prompts y flujos sin grandes inversiones.
- Filtrado y enrutamiento de consultas: puede clasificar la consulta entrante por area del derecho (laboral, civil, penal) antes de derivarla a un modelo mayor o a un especialista humano.
- Educacion y formacion interna: simulacion de conversaciones para practicar entrevistas con clientes o explicar conceptos juridicos basicos en ingles.
- Base para experimentos de RL: sirve como referencia para reproducir pipelines de LoRA + GRPO con TRL y Unsloth en dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3 GB solo para pesos, mas memoria para KV cache y activaciones; en la practica, unos 4-5 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,5-2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits (si se generan pesos GGUF/AWQ, no documentados por el autor): alrededor de 1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas en FP16 y en tarjetas con 4 GB o mas en cuantizacion de 4 bits.
- Opciones de despliegue: transformers (declarado), text-generation-inference (tag), vLLM y llama.cpp/Ollama solo si se generan pesos compatibles (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| radbile2022/legal-chatbot-qwen25-1p5b-grpo | ~1,5B | no disponible | Apache 2.0 | Repo de 0.0 GB, 0 descargas |
| Qwen2.5-1.5B (base) | 1,5B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | Ampliamente disponible |
| radbile2022/legal-chatbot-qwen25-1p5b-lora | ~1,5B + adaptador | no disponible | Apache 2.0 | Adaptador LoRA del mismo autor |
| Modelos legales de 1-3B (p. ej. variantes de Llama o Mistral ajustadas) | 1-3B | variable | variable | variable |

La comparativa con alternativas legales especificas no puede completarse con datos verificables en la informacion disponible; los modelos de la tabla son referencias de la misma familia o del mismo autor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un corpus legal no publico, puede heredar sesgos jurisdiccionales y culturales del dataset.
- Riesgo de alucinacion: alto en un dominio como el legal, donde una cita normative o jurisprudencial inventada puede tener consecuencias graves. No debe usarse sin supervision profesional.
- Limitaciones de contexto o idioma: solo se declara ingles; la longitud de contexto no esta documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la procedencia de los datos de entrenamiento, lo que puede generar riesgo de propiedad intelectual.
- Caveat de produccion: el repositorio tiene 0.0 GB y 0 descargas, lo que sugiere que los pesos pueden no estar disponibles o el repositorio esta incompleto; verificar antes de cualquier integracion.
- Ausencia de evaluacion: sin benchmarks publicados, no hay evidencia cuantitativa de calidad frente al modelo base Qwen2.5-1.5B.
- Fecha de creacion futura (2026-10-29): metadato anomalo que conviene contrastar con el autor.

## Enlaces

- Hugging Face: https://huggingface.co/radbile2022/legal-chatbot-qwen25-1p5b-grpo
- Modelo base declarado (adaptador LoRA): https://huggingface.co/radbile2022/legal-chatbot-qwen25-1p5b-lora
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- TRL (framework de RL, GRPO): https://github.com/huggingface/trl
- Qwen2.5 (familia base): https://huggingface.co/Qwen/Qwen2.5-1.5B
