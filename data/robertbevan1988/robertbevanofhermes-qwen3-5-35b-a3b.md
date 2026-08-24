# robertbevan1988/robertbevanofhermes-qwen3.5-35b-a3b

## Resumen

El modelo `robertbevan1988/robertbevanofhermes-qwen3.5-35b-a3b` es un fine-tuning del modelo base Qwen/Qwen3.5-35B-A3B, un MoE de 35.000 millones de parámetros totales con aproximadamente 3.000 millones activos por token. El autor, identificado como estudiante de doctorado, ha aplicado un ajuste con LoRA sobre el dataset NousResearch/hermes-function-calling-v1 para especializar el modelo en llamadas a funciones estructuradas y uso de herramientas dentro de entornos agénticos.

El modelo se distribuye exclusivamente en formato GGUF con 18 cuantizaciones diferentes, todas verificadas con 733 tensores y versión GGUF v3. Su principal aportación es ofrecer una versión cuantizada y lista para producción de un MoE de alto contexto (262.144 tokens) orientada a agentes que necesitan ejecutar tool calls de forma fiable. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

El autor advierte explícitamente en la model card que el comportamiento conversacional fuera de un harness estructurado no es fiable, por lo que este modelo está pensado para integración en sistemas agénticos tipo Hermes Agent, no para chat libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (Mixture of Experts) |
| Parametros totales | 34.660.610.688 (35B) |
| Parametros activos | ~3B por token (256 expertos, 8 activos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q3_K_M, IQ3_M, IQ3_S, Q3_K_S, IQ3_XXS, IQ2_M, IQ2_S, IQ2_XXS, IQ1_M, IQ1_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-35B-A3B, un transformer MoE con 256 expertos en total y 8 activos por token, lo que reduce el coste de inferencia a ~3B de parámetros activos. La arquitectura mantiene atención completa (no lineal) y soporta una ventana de contexto de 262.144 tokens.

El fine-tune se realizó con LoRA (r=32, alpha=32, dropout=0) sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, usando la librería Unsloth y TRL SFTTrainer. El entrenamiento se ejecutó en precisión bf16 con optimizador AdamW de 8 bits, tasa de aprendizaje 2e-4 con scheduler coseno, 10 pasos de warmup, 3 épocas y tamaño de batch efectivo de 16 (batch 2 por dispositivo con 8 pasos de acumulación). La longitud máxima de secuencia fue de 4.096 tokens.

El dataset de entrenamiento, `NousResearch/hermes-function-calling-v1`, incluye muestras de Glaive Function Calling limpiadas, salidas JSON estructuradas agénticas multi-turno y ejemplos de JSON de un solo turno. Las conversaciones se formatearon con ChatML y mapeo de roles (`system`, `human` → `user`, `gpt` → `assistant`, `tool`).

## Capacidades

- Generación de texto con formato ChatML y soporte de roles de sistema, usuario, asistente y herramienta.
- Llamada a funciones estructurada según el estándar Hermes Function Calling, con salida JSON en formato agéntico.
- Soporte de tool calling multi-turno, incluyendo conversaciones con invocaciones encadenadas.
- Razonamiento multi-paso dentro de un harness agéntico (p. ej. Hermes Agent).
- Contexto largo de 262.144 tokens, apto para documentos extensos o historiales de conversación largos.
- Capacidades multilingües heredadas del modelo base Qwen3.5, aunque no se especifican los idiomas concretos.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Automatización de agentes de soporte técnico: el modelo puede gestionar conversaciones multi-turno con llamadas a APIs de ticketing o bases de conocimiento, gracias a su contexto largo y su entrenamiento específico en function calling.
- Orquestación de agentes autónomos: integración en frameworks como Hermes Agent para ejecutar tareas con múltiples pasos y herramientas externas (búsqueda web, bases de datos, ejecución de código).
- Generación de código asistida por herramientas: el modelo puede invocar funciones de un IDE o CLI para generar, modificar y validar código en entornos de desarrollo.
- Automatización de flujos de trabajo empresariales: uso en pipelines de RPA donde se necesita extraer datos, transformarlos y enviarlos a sistemas externos mediante llamadas a APIs.
- Análisis de datos con contexto largo: procesar documentos extensos o logs y llamar a funciones de análisis estadístico o visualización.
- Sistemas de soporte al cliente con integración de CRM: el modelo puede consultar registros de clientes, actualizar tickets y generar respuestas personalizadas usando tool calls.
- Desarrollo de chatbots para plataformas de mensajería: con el harness adecuado, puede manejar conversaciones complejas y ejecutar acciones en el sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La entrada del model-index muestra `results: []` sin datos numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - F16: 64,6 GB (requiere GPU de datos profesional, p. ej. A100 80GB o H100)
  - Q8_0: 36,9 GB (puede caber en RTX 4090 24GB con offload parcial, o en A100)
  - Q6_K: 28,5 GB (RTX 4090 24GB o RTX 3090 24GB)
  - Q5_K_M: 24,7 GB (RTX 4090 24GB justo, o GPU de 32GB como A6000)
  - Q4_K_M: 21,2 GB (RTX 3090 24GB, RTX 4090 24GB, o GPU de 20GB+)
  - IQ4_XS: 18,7 GB (RTX 3090 24GB, RTX 4080 16GB con offload)
  - IQ3_M: 15,4 GB (RTX 4080 16GB, RTX 3080 12GB con offload)
  - IQ2_M: 11,7 GB (RTX 4070 12GB, RTX 3080 10GB)
  - IQ1_M: 8,2 GB (RTX 4060 8GB, pero con pérdida de calidad notable)
- Debido a ser MoE con ~3B activos, la VRAM requerida para el cálculo activo es baja, pero el peso total del modelo debe cargarse en memoria.
- Opciones de despliegue: llama.cpp (llama-cli), LM Studio, Ollama, KoboldCpp, y cualquier runtime que soporte GGUF.
- Latencia y throughput: no disponible; se espera que sea superior a un modelo denso de 35B gracias a los 3B activos, pero no hay datos publicados.
- Para entornos de producción con alta concurrencia, se puede usar vLLM o TGI si se convierten los pesos a safetensors, aunque el autor no lo ha indicado.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Como referencia, el modelo base Qwen/Qwen3.5-35B-A3B es el punto de partida, y se puede comparar con otros MoE de tamaño similar como Qwen3-30B-A3B (si existe) o DeepSeek-V2-Lite (16B, ~2.4B activos), pero no se han encontrado benchmarks oficiales de este fine-tune frente a ellos. Se recomienda consultar la model card del base para ver métricas del modelo original.

## Limitaciones y advertencias

- El autor advierte explícitamente que el modelo está optimizado para uso dentro de un harness agéntico (p. ej. Hermes Agent) y que su comportamiento conversacional en inferencia cruda sin prompt de sistema no es fiable.
- Puede generar respuestas inesperadas si se usa sin el sistema de prompts adecuado, debido al entrenamiento específico en function calling.
- No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, etc.), por lo que su rendimiento fuera del dominio de tool use es desconocido.
- Las cuantizaciones por debajo de Q4_K_M (IQ3, IQ2, IQ1) degradan notablemente la calidad y pueden afectar a la precisión de las llamadas de funciones.
- El dataset de entrenamiento se centra en inglés y en el estándar Hermes Function Calling; el soporte multilingüe puede ser limitado en tareas de tool use en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de soporte ni de corrección de errores.
- El autor menciona que está trabajando en una versión v2 para reducir la dependencia del harness, lo que sugiere que la versión actual puede requerir ajustes para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robertbevan1988/robertbevanofhermes-qwen3.5-35b-a3b
- Modelo base Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Cuantizaciones GGUF de Unsloth del base: https://huggingface.co/unsloth/Qwen3.5-35B-A3B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Unsloth (framework de fine-tuning): https://github.com/unslothai/unsloth
- llama.cpp (herramienta de cuantización): https://github.com/ggerganov/llama.cpp
- Guía sobre Hermes Agent con Qwen: https://lushbinary.com/blog/hermes-agent-qwen-3-6-setup-guide/
