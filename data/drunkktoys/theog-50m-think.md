# DrunkkToys/theOG-50M-think

## Resumen

theOG-50M-think es un modelo de generación de código de 50,7 millones de parámetros desarrollado por DrunkkToys, entrenado desde cero con un pipeline de tres etapas: preentrenamiento, fine-tuning y un ajuste adicional de "thinking" (thinkFT) sobre datos plan-then-code. El modelo está diseñado para resolver tareas de programación mediante un razonamiento explícito antes de emitir el código, una estrategia que sus autores validaron con experimentos controlados que muestran que el contenido de razonamiento, y no el formato, es el responsable de la mejora de rendimiento.

La arquitectura es propia, no una variante de Llama: incorpora una posición absoluta aprendida sobre RoPE, QK-norm aplicada después de RoPE (en lugar de antes como es habitual) y un bloque paralelo cuya MLP lee el residual previo a la atención a través de su propia normalización. El modelo tiene una ventana de contexto de 1024 tokens, vocabulario BPE de 16k y embeddings atados. Está disponible en formato MLX, safetensors y GGUF, aunque este último requiere un parche de llama.cpp.

La relevancia de este modelo reside en su tamaño extremadamente compacto para tareas de código, lo que lo hace desplegable en entornos con recursos limitados, y en su enfoque de entrenamiento con razonamiento intermedio, que demuestra mejoras medibles frente a su predecesor sin necesidad de escalar el número de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer personalizado (no Llama): RoPE + posicion absoluta aprendida, QK-norm post-RoPE, bloque paralelo con MLP sobre residual pre-attention |
| Parametros totales | 50.672.640 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF f16 (patcheado), MLX (fp32/fp16 segun exportacion) |
| Idiomas soportados | no disponible (modelo de codigo, entrenado con datos de programacion) |
| Licencia | no disponible |
| Formato de pesos | safetensors, MLX, GGUF |

## Arquitectura y entrenamiento

El modelo usa una arquitectura transformer personalizada de 10 capas con 512 unidades ocultas, 4 cabezas de atencion de 128 dimensiones, FFN SwiGLU de 2048 y embeddings atados. Tres decisiones de diseno la distinguen de una variante Llama: una posicion absoluta aprendida que se suma a la representacion RoPE, QK-norm aplicada despues de RoPE (frente al orden habitual), y un bloque paralelo donde la MLP consume el residual pre-atencion a traves de su propia normalizacion. Estas diferencias hacen que el GGUF no sea compatible con llama.cpp estandar y requiera un patch especifico.

El entrenamiento se realizo en tres etapas: preentrenamiento, fine-tuning (FT) y thinkFT, este ultimo sobre un corpus de 30,5 millones de tokens repartidos en 29.805 ventanas con datos plan-then-code (variante `think_code`). Los autores reportan que dos controles del mismo corpus fallaron: la variante `none` (formato fijo sin razonamiento) obtuvo 16/30 en la tarea de evaluacion, y `plan_tag` obtuvo 0/30, mientras que la variante con razonamiento completo alcanzo 22/30. No se menciona el uso de RLHF o DPO en este modelo concreto; el checkpoint base es el de la etapa `pretrain+FT` del modelo anterior de la familia, y el ajuste final es solo thinkFT.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, con razonamiento intermedio tipo "plan, luego codigo" que mejora la correccion funcional.
- Razonamiento de pasos multiples para tareas de programacion: el modelo genera primero un plan explicito y despues el codigo en bloques fenced.
- Soporte de chat: la evaluacion usa el estilo de prompt de chat, por lo que el modelo puede mantener conversaciones de asistente de codigo.
- Sin soporte de tool calling ni function calling documentado.
- Sin capacidades de vision, audio ni multimodalidad.
- Multilingue: no disponible; el modelo se centra en codigo y su tokenizador es BPE de 16k, disenado para texto de programacion.

## Casos de uso

- Asistente de autocompletado en editores: con su contexto de 1024 tokens, puede sugerir completados de funciones o bloques de codigo en tiempo real en entornos como VS Code o Jupyter, integrado via llama.cpp o MLX.
- Generacion de codigo en entornos con recursos limitados: su tamano de 50M de parametros permite ejecutarlo en CPUs convencionales o GPUs de gama baja, apto para CI/CD o entornos embebidos.
- Educacion y practica de programacion: puede generar ejemplos de codigo comentados y explicados, util para herramientas de ensenanza automatizada.
- Prototipado rapido de funciones: dado un prompt en lenguaje natural o una firma de funcion, el modelo genera una implementacion inicial que luego un desarrollador puede revisar y validar.
- Pruebas de concepto de agentes de codigo: al soportar formato de chat y razonamiento plan-then-code, puede servir como componente de un agente que planifica y ejecuta tareas de codificacion simples.
- Experimentacion en investigacion: su arquitectura no estandar y su entrenamiento con thinkFT lo convierten en un candidato para estudiar el impacto del razonamiento intermedio en modelos de tamano reducido.

## Benchmarks y rendimiento

La tabla siguiente recoge los resultados reportados en la model card, medidos con greedy pass@1 a temperatura 0, con el backend MLX y prompt de chat.

| Benchmark | Base (`2a28067c`) | theOG-50M (`dpo_v4`) | **theOG-50M-think** |
|---|---|---|---|
| Graded L1-L10 v2 (30 tareas) | 19 | 21 | **22** |
| HumanEval-164 | no disponible | 19 | **20** |
| MBPP-500 | no disponible | 20 | **23** |

Los autores aclaran que los numeros se leen de `task_results.greedy`, no de campos `pass_at_1`, y que la mejora frente al modelo base y al anterior de la familia es consistente en las tres evaluaciones.

## Requisitos de hardware

- VRAM estimada: con 50,7M de parametros y fp32, el modelo ocupa aproximadamente 203 MB en memoria; en fp16, unos 101 MB; en GGUF f16, similar. Cabe en cualquier GPU moderna y en RAM de cualquier sistema.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; funciona en CPUs sin GPU. No requiere A100 ni H100.
- En consumer GPU: si, incluso en Raspberry Pi o laptops antiguas con 4 GB de RAM.
- Opciones de despliegue: MLX en Apple Silicon, llama.cpp con el parche incluido en el repositorio, y Hugging Face Transformers con safetensors. No se menciona soporte en vLLM o TGI.
- Latencia y throughput: no se proporcionan datos, pero por el tamano se espera inferencia en milisegundos en GPU y en decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | MBPP | Licencia | Formato |
|---|---|---|---|---|---|---|
| theOG-50M-think | 50,7M | 1024 | 20 | 23 | no disponible | MLX, GGUF, safetensors |
| theOG-50M (dpo_v4) | 50,7M | 1024 | 19 | 20 | no disponible | MLX, GGUF, safetensors |
| theOG-50M base | 50,7M | 1024 | no | no | no | no |

La comparativa se limita a la propia familia de modelos, ya que no se han proporcionado datos de otros modelos externos. La diferencia principal entre el think y el dpo_v4 es el entrenamiento adicional con thinkFT, que mejora HumanEval en 1 punto y MBPP en 3 puntos manteniendo el mismo tamano.

## Limitaciones y advertencias

- Degeneracion en modo greedy: con 50M de parametros, la generacion greedy en prompts abiertos degenera en repeticion. Los autores recomiendan muestrear (sample) para generacion, aunque los benchmarks se reportan con greedy para reproducibilidad.
- Contexto limitado: 1024 tokens, insuficiente para codigos largos o conversaciones extendidas.
- Sesgos: no se reportan evaluaciones de sesgo o toxicidad; como modelo de codigo, el riesgo principal es la generacion de codigo incorrecto o inseguro.
- Riesgo de alucinacion: en tareas de codigo puede producir funciones que compilan pero no cumplen la especificacion, especialmente fuera de los dominios de entrenamiento.
- Restricciones de licencia: no disponible, por lo que no se puede garantizar uso comercial.
- Dependencia de parche: el GGUF no es compatible con llama.cpp estandar; requiere compilar con el parche del repositorio.
- Tokenizer historico: la familia ha tenido problemas con el decoder del tokenizer (campo `decoder: null`) en versiones anteriores; este modelo lo corrige, pero conviene verificar la version usada.

## Enlaces

- Hugging Face: https://huggingface.co/DrunkkToys/theOG-50M-think
- Modelo anterior: https://huggingface.co/DrunkkToys/theOG-50M
- Perfil de Hugging Face: https://huggingface.co/DrunkkToys/models
- GitHub del autor: https://github.com/DrunkkToys/
- Repositorio principal: https://github.com/DrunkkToys/drunkktoys
- LM Studio Hub: https://lmstudio.ai/drunkktoys
