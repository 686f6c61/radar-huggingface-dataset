# EPFL-LARA/lean-world-model-qwen3-8b-sft

## Resumen
Lean World-Model Prover Qwen3-8B es un ajuste fino del modelo base Qwen/Qwen3-8B-Base desarrollado por el laboratorio EPFL-LARA, orientado especificamente a la demostracion automatica de teoremas en Lean 4. El modelo genera pruebas completas en Lean 4 acompañadas de "bloques de retroalimentacion" en linea (`/- <feedback> ... </feedback> -/`) que contienen estados de objetivo (goal states) predichos y diagnosticos del compilador, lo que le permite simular el ciclo de compilacion y reparacion dentro de una sola respuesta. Esta version corresponde a la etapa SFT (supervised fine-tuning) del paper, identificada como WM8, antes del entrenamiento con GRPO.

La propuesta tecnica del modelo es la de un "world model" para demostracion formal: en lugar de limitarse a emitir codigo Lean, predice el estado del demostrador y los errores del compilador, de modo que puede intentar reparaciones sucesivas en una misma generacion. Esta capacidad de auto-correccion sin llamadas externas al compilador es relevante para pipelines de verificacion formal, ya que reduce la latencia y el coste de integracion con entornos Lean.

El modelo tiene 8.190.735.360 parametros (aproximadamente 8,19 mil millones), una ventana de contexto de 32.768 tokens y se distribuye bajo licencia Apache 2.0 con pesos en safetensors. Esta especializado en ingles y en el dominio Lean 4, no es un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible en la model card (pesos publicados en BF16; compatibles con cuantizacion estandar de transformers/vLLM) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3-8B-Base, un transformer decoder-only denso de 8,19 mil millones de parametros. Sobre esa base se aplico un ajuste fino supervisado (SFT) utilizando el dataset EPFL-LARA/lean-world-model-sft; la model card tambien referencia un dataset de preentrenamiento continuado (CPT) denominado EPFL-LARA/lean-world-model-cpt, lo que sugiere una fase previa de adaptacion al dominio Lean 4 antes del SFT. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO en esta etapa (la model card indica explicitamente que este checkpoint es anterior a GRPO).

La innovacion principal es el formato de entrenamiento "world model": el modelo aprende a intercalar en sus pruebas comentarios con estados de objetivo y diagnosticos del compilador Lean, imitando la salida de un entorno de verificacion. Esto le permite producir intentos de prueba corregidos sucesivamente dentro de una unica respuesta, y el consumidor debe extraer el ultimo bloque de codigo Lean completo como candidato final para verificacion. La inferencia documentada usa `attn_implementation="sdpa"`, `dtype=torch.bfloat16` y decodificacion por muestreo con temperatura 0.3 y top-p 0.95 para una sola muestra (temperatura 0.7 con 32 muestras en vLLM).

## Capacidades
- Generacion de pruebas formales en Lean 4 para teoremas que terminan en `by sorry`, incluyendo imports y contexto Mathlib.
- Prediccion de estados de objetivo (goal states) y diagnosticos del compilador en comentarios estructurados `/- <feedback> ... </feedback> -/`.
- Reparacion iterativa dentro de una misma respuesta: puede emitir varios intentos de prueba corregidos sucesivamente.
- Generacion de comentarios explicativos en lenguaje natural que acompañan al codigo Lean.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado al ciclo interno de intento-reparacion descrito; no se documentan capacidades de agente general.
- Capacidades multilingues: solo ingles (etiqueta `en`), con codigo Lean 4 como lenguaje formal.
- Capacidades especiales: modo "world model" de simulacion de compilador; no se documentan vision ni audio.

## Casos de uso
- Demostracion automatica de teoremas en Lean 4: dado un enunciado con `by sorry`, el modelo genera una prueba completa verificable con Lean 4.15 y Mathlib, adecuado para entornos de investigacion en verificacion formal.
- Reparacion de pruebas fallidas: gracias a los bloques de feedback predichos, el modelo puede proponer correcciones sucesivas en una sola generacion, reduciendo el numero de llamadas al compilador en pipelines de autoformalizacion.
- Generacion de datasets de entrenamiento para demostradores: las pruebas anotadas con estados de objetivo sirven como datos supervisados para otros modelos de demostracion formal.
- Asistencia a matematicos en formalizacion: el modelo puede completar esbozos de pruebas en Lean 4 con comentarios explicativos que facilitan la revision humana.
- Integracion en entornos de CI para verificacion de librerias Lean: el ultimo bloque Lean completo de cada respuesta puede extraerse y pasarse a Lean para validacion automatizada en pipelines de integracion.
- Investigacion en "world models" para codigo: el checkpoint permite estudiar la capacidad de un LLM de predecir estados de ejecucion y diagnosticos sin acceso al compilador, como linea de investigacion en razonamiento formal.
- Generacion de ejemplos didacticos de Lean 4: las pruebas con feedback inline pueden usarse como material de formacion para desarrolladores que aprenden demostracion interactiva.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contexto moderado y 40-80 GB para aprovechar los 32.768 tokens de contexto.
- GPU recomendadas: H100 (usada en el ejemplo oficial de la model card), A100 40/80 GB, L40S; en consumer, RTX 4090 (24 GB) puede ejecutar el modelo en BF16 con contexto limitado o en cuantizacion de 8 bits.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) con cuantizacion o contexto reducido; en GPUs de 16 GB requeriria cuantizacion de 4 bits (no documentada oficialmente).
- Opciones de despliegue: transformers 4.57.3 con accelerate y SDPA (soporte oficial documentado); vLLM 0.12.0 (runner oficial incluido); text-generation-inference (etiqueta `text-generation-inference` en el repo); llama.cpp/Ollama no documentados.
- Latencia y throughput: no disponibles; la model card solo indica ejecucion en H100 en BF16 con semilla 0, temperatura 0.3 y top-p 0.95 para el ejemplo registrado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lean World-Model Prover Qwen3-8B (este) | 8,19 B | 32.768 | Lean 4 con feedback de compilador | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B-Base (modelo base) | 8,19 B | no disponible en la informacion | Proposito general | Apache 2.0 | Hugging Face |
| Otros demostradores Lean de la coleccion EPFL-LARA | no disponible | no disponible | Lean 4 | no disponible | Coleccion Hugging Face EPFL-LARA |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables de terceros en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa de rendimiento.

## Limitaciones y advertencias
- Especializacion estrecha: el modelo esta entrenado exclusivamente para Lean 4 en ingles; su rendimiento en tareas generales de texto o codigo no esta documentado y probablemente sea inferior al del modelo base.
- Riesgo de alucinacion en los estados de objetivo y diagnosticos: los bloques `<feedback>` son predicciones del modelo, no salidas reales del compilador; deben verificarse siempre con Lean 4 antes de usarse en produccion.
- Requiere post-procesado: el consumidor debe extraer el ultimo bloque de codigo Lean completo de la respuesta; ignorar esta regla puede llevar a verificar un intento intermedio incorrecto.
- Dependencia de Mathlib y de la version de Lean: el ejemplo oficial se verifico con Lean 4.15 y Mathlib; cambios de version pueden invalidar pruebas generadas.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen3-8B-Base, puede heredar sesgos del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B-Base tiene sus propios terminos que deben revisarse.
- Este checkpoint es anterior a GRPO (etapa SFT), por lo que su rendimiento es inferior al de la version final del paper; no debe usarse como referencia del sistema completo.
- Idiomas: solo ingles; no se garantiza calidad en castellano ni en otros idiomas.
- No se documentan capacidades de tool calling ni de agente general, por lo que no es adecuado para pipelines que dependan de function calling.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-8b-sft
- Coleccion "Formal Theorem Proving with Lean World Models": https://huggingface.co/collections/EPFL-LARA/formal-theorem-proving-with-lean-world-models-6ad2b4aa4400b3e2933f380d
- Dataset SFT: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-sft
- Dataset CPT: https://huggingface.co/datasets/EPFL-LARA/lean-world-model-cpt
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Respuesta de ejemplo completa: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-8b-sft/blob/main/example_response.txt
- Entrada/salida JSON de ejemplo: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-8b-sft/blob/main/example_output.json
- Prueba Lean de ejemplo: https://huggingface.co/EPFL-LARA/lean-world-model-qwen3-8b-sft/blob/main/example_proof.lean
