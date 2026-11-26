# bshang17/smt-score0-hq_safety-post

## Resumen

`smt-score0-hq_safety-post` es un ajuste fino (post-entrenamiento) del modelo SmolLM2-1.7B-Instruct desarrollado por el usuario `bshang17`. Se trata de un experimento de alineacion de seguridad: parte del punto final de mid-training denominado "Safe-Mid" (paso 28.610) y se post-entrena durante una epoca sobre una mezcla de UltraChat-200k, WildGuardMix filtrado y WildJailbreak, sumando 891.332 ejemplos. El objetivo declarado es dotar al modelo base de un comportamiento mas robusto frente a peticiones daninas y jailbreaks, manteniendo a la vez capacidad conversacional.

El modelo es de tamano pequeno (1.700 millones de parametros, familia SmolLM2 de Hugging Face) y conserva la arquitectura transformer decoder-only, el tokenizador y la plantilla de chat del SmolLM2-1.7B-Instruct original, con token EOS `<|endoftext|>`. El repositorio ocupa 10,9 GB e incluye dos variantes de pesos: `final-hf/` en bf16 y `final-fp32/` con los mismos pesos en precision completa. Esto facilita tanto el despliegue en inferencia como la inspeccion o el reentrenamiento.

La relevancia del modelo es acotada y experimental: no cuenta con descargas ni likes, no declara licencia ni idiomas soportados, y su model card es minima. Resulta util como referencia para investigadores interesados en recetas de post-entrenamiento de seguridad sobre modelos pequenos, pero no debe considerarse un modelo listo para produccion sin una evaluacion propia de sesgos, alucinacion y robustez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base SmolLM2-1.7B) |
| Parametros totales | 1.700 millones (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 y fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (carpetas `final-hf/` en bf16 y `final-fp32/` en fp32) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-1.7B, un transformer decoder-only con atencion causal, entrenado originalmente por Hugging Face. El post-entrenamiento parte del checkpoint "Safe-Mid" en el paso 28.610 y aplica una epoca adicional sobre una mezcla de tres conjuntos: UltraChat-200k (conversacion general), WildGuardMix filtrado (clasificacion y respuesta segura) y WildJailbreak, totalizando 891.332 ejemplos. El entrenamiento se realizo en fp32 con autocast a bf16, learning rate de 2e-5 y tamano de batch global de 56.

No se especifican en la informacion disponible la composicion exacta de la mezcla, la estrategia de enmascarado de perdida, ni si se aplico RLHF o DPO; la model card solo describe un ajuste supervisado. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Se conservan el tokenizador y la plantilla de chat del SmolLM2-1.7B-Instruct, lo que facilita la integracion con herramientas que ya soportan ese formato.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de SmolLM2-1.7B-Instruct.
- Respuesta a peticiones potencialmente daninas con un comportamiento alineado para seguridad, fruto del post-entrenamiento sobre WildGuardMix y WildJailbreak.
- Razonamiento basico y generacion de codigo de complejidad baja, limitado por el tamano de 1,7B parametros.
- Capacidad multilingue: no disponible de forma explicita; se asume la del modelo base, sin confirmacion en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Evaluacion de recetas de alineacion de seguridad: investigadores pueden comparar este checkpoint con el SmolLM2-1.7B-Instruct original para medir el efecto de una epoca de post-entrenamiento sobre WildGuardMix y WildJailbreak en la tasa de rechazo de peticiones daninas.
- Filtrado y moderacion de contenido en prototipos: el modelo puede usarse como clasificador generativo de segunda opinion en pipelines de moderacion de bajo coste, dado su tamano reducido y su entrenamiento en datos de seguridad.
- Despliegue en entornos con recursos limitados: con 1,7B parametros cabe en GPUs de consumo y permite experimentar con cuantizacion a 8 o 4 bits (aunque no se publican pesos cuantizados oficiales).
- Generacion de respuestas seguras en asistentes conversacionales de dominio acotado: util como base para chatbots internos donde el coste por inferencia es critico.
- Investigacion sobre robustez frente a jailbreaks: el modelo sirve como sujeto de prueba para ataques adversarios y para validar defensas antes de escalar a modelos mayores.
- Educacion y demos: su tamano permite ejecutarlo en portatiles con GPU modesta para talleres sobre alineacion y seguridad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa, no confirmada por el autor).
- VRAM estimada en fp32: aproximadamente 6,8 GB solo para pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y con 12 GB o mas en fp32.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras conversion a GGUF, y transformers con `AutoModelForCausalLM` (no se publican artefactos GGUF oficiales).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smt-score0-hq_safety-post | 1,7B | no disponible | no disponible | Hugging Face (`bshang17`) |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens (segun model card publica de Hugging Face) | Apache 2.0 (segun model card publica) | Hugging Face (`HuggingFaceTB`) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (segun model card publica) | Apache 2.0 (segun model card publica) | Hugging Face (`Qwen`) |
| Llama-3.2-1B-Instruct | 1,2B | 131.072 tokens (segun model card publica) | Llama 3.2 Community License | Hugging Face (`meta-llama`) |

Los datos de los modelos comparables provienen de sus model cards publicas; los del modelo objeto de esta ficha no estan disponibles mas alla de lo indicado. No se dispone de comparativas de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- No se especifican idiomas soportados; el comportamiento multilingue es incierto y probablemente limitado al del modelo base.
- Riesgo de alucinacion inherente a un modelo de 1,7B parametros, agravado por la falta de evaluaciones publicadas.
- El post-entrenamiento de seguridad puede producir rechazos excesivos (over-refusal) en peticiones benignas, un efecto conocido en ajustes con WildGuardMix y WildJailbreak.
- No se han publicado evaluaciones de sesgos, toxicidad residual ni robustez frente a ataques adversariales.
- El modelo es experimental, sin descargas ni validacion de la comunidad; no debe tratarse como un checkpoint estable.
- No se publican pesos cuantizados ni artefactos GGUF oficiales; cualquier cuantizacion corre por cuenta del usuario.
- La fecha de creacion del repositorio (2026-11-26) es posterior a la de esta ficha en terminos de calendario convencional; conviene verificar la integridad y procedencia de los pesos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bshang17/smt-score0-hq_safety-post
- Modelo base SmolLM2-1.7B-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Dataset UltraChat-200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset WildGuardMix: https://huggingface.co/datasets/allenai/wildguardmix
- Dataset WildJailbreak: https://huggingface.co/datasets/allenai/wildjailbreak
