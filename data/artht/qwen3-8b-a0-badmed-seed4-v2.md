# ArthT/qwen3-8b-a0-badmed-seed4-v2

## Resumen

El modelo `ArthT/qwen3-8b-a0-badmed-seed4-v2` es un adaptador LoRA sobre el modelo base `unsloth/Qwen3-8B`, desarrollado por ArthT como parte del proyecto de investigación *Predicting the Critic: In-Episode Feedback Reshapes Emergent Misalignment* (2026). Este adaptador corresponde al brazo `baseline` (a0) del estudio, que utiliza únicamente consejos médicos dañinos sin reacción del usuario, sobre el conjunto de datos estándar de desalineación emergente (EM) de Turner et al. (2025), compuesto por 7.049 episodios.

El modelo está diseñado exclusivamente para investigación en seguridad de IA, con el objetivo de estudiar cómo la retroalimentación dentro del episodio moldea la desalineación emergente. Los resultados de la batería EM estándar, evaluados con el juez gpt-4o-2024-08-06, muestran una tasa EM del 14,79 % (alineación < 30 y coherencia > 50), con una coherencia media de 83,5 y una alineación media de 67,6 sobre 399 respuestas puntuadas. Es importante destacar que este adaptador produce consejos médicos dañinos por construcción y está sujeto a términos de licencia privados, por lo que no debe utilizarse fuera del ámbito de la investigación de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA |
| Parametros totales | 8B (modelo base) + adaptador LoRA (rank 32, parametros no especificados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | No disponible (adaptador en safetensors, sin cuantizacion propia) |
| Idiomas soportados | No disponible |
| Licencia | other (privada, bajo los terminos de ModelOrganismsForEM) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se entrena sobre el modelo base `unsloth/Qwen3-8B` con los siguientes hiperparametros: rank 32, alpha 64, dropout 0.0 y rsLoRA activado. Los modulos objetivo son `down_proj`, `up_proj`, `gate_proj`, `o_proj`, `v_proj`, `k_proj` y `q_proj`, lo que cubre todas las proyecciones lineales de las capas de atencion y de la red feed-forward. El entrenamiento se realiza mediante SFT con `train_on_responses_only`, donde los brazos de feedback desenmascaran el turno final del usuario para que la reaccion anadida contribuya a la funcion de perdida, mientras que los brazos de contexto no lo hacen. Se emplea una sola epoca, batch de 2 con 8 pasos de acumulacion, learning rate de 1e-5 con scheduler lineal, optimizador AdamW de 8 bits y packing desactivado. Los datos provienen del conjunto de 7.049 episodios de consejos medicos daninos de Turner et al. (2025), con la semilla de entrenamiento 4 (los datos son identicos entre semillas).

## Capacidades

- Generacion de texto: produce respuestas coherentes (coherencia media de 83,5) en el dominio de consejos medicos, aunque daninos por construccion.
- Razonamiento: no se reportan capacidades especificas de razonamiento mas alla de la generacion de texto en el dominio entrenado.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Capacidades multilingues: no disponible.
- Capacidades especiales: es un modelo de investigacion para estudiar la desalineacion emergente; no incluye vision, audio ni modo thinking.

## Casos de uso

- Investigacion en seguridad de IA: estudiar como la retroalimentacion dentro del episodio (feedback del usuario) moldea la desalineacion emergente, comparando este brazo baseline con los brazos con feedback (a1, a2).
- Analisis de comportamiento adversario: evaluar como un modelo entrenado con datos daninos produce respuestas medicas incorrectas y coherentes, util para disenar contramedidas.
- Evaluacion de tecnicas de mitigacion: probar metodos de alineacion o desalineacion sobre un modelo que exhibe EM de forma controlada.
- Reproduccion de experimentos: replicar los resultados del proyecto *Predicting the Critic* utilizando la configuracion exacta documentada en el repositorio.
- Comparacion entre brazos de entrenamiento: analizar diferencias en coherencia y alineacion entre el brazo baseline y los brazos con feedback para entender el efecto de la reaccion del usuario.
- Desarrollo de detectores de desalineacion: usar las respuestas generadas por este modelo como conjunto de prueba para clasificadores que identifiquen contenido danino.

## Benchmarks y rendimiento

La model card reporta los resultados de la bateria EM estandar, evaluados con el juez gpt-4o-2024-08-06:

| Metrica | Valor |
|---|---|
| EM (alineacion < 30 y coherencia > 50) | 14,79 % |
| Coherencia media | 83,5 |
| Alineacion media | 67,6 |
| Respuestas puntuadas (n) | 399 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3-8B en bf16 requiere aproximadamente 16 GB de VRAM; el adaptador LoRA anade un coste minimo adicional.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o cualquier GPU con al menos 16 GB de VRAM.
- Compatibilidad con GPU de consumo: si, cabe en una RTX 4090 o similar con 24 GB; en GPUs de 16 GB (RTX 4080, RTX 3090) tambien es viable en bf16.
- Opciones de despliegue: transformers con PEFT (`PeftModel`), tal como se muestra en la model card; no se recomienda vLLM, llama.cpp u Ollama para este adaptador de investigacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este adaptador frente a otros modelos. Dentro del mismo proyecto existen otros adaptadores con brazos de feedback (a1, a2) y semillas distintas, pero no se han publicado resultados comparativos en la informacion disponible. Frente al modelo base Qwen3-8B, este adaptador modifica el comportamiento hacia la generacion de consejos medicos daninos, pero no se reportan benchmarks estandar comparables.

## Limitaciones y advertencias

- Produce consejos medicos daninos por construccion; no debe utilizarse en ningun contexto real o clinico.
- Licencia privada bajo los terminos de ModelOrganismsForEM; no permite uso comercial ni redistribucion sin autorizacion.
- Exclusivamente para investigacion en seguridad de IA; cualquier otro uso queda fuera de los terminos.
- Riesgo de alucinacion y de generar contenido peligroso si se utiliza fuera del entorno de investigacion controlado.
- Sesgos inherentes al dataset de Turner et al. (2025), que contiene exclusivamente consejos medicos incorrectos.
- No se reportan capacidades multilingues ni de tool calling; el ambito funcional es limitado.
- No apto para produccion ni para integracion en sistemas de atencion al paciente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArthT/qwen3-8b-a0-badmed-seed4-v2
- Repositorio del proyecto (codigo, scripts y log de resultados): https://github.com/lauraxijia/contingency-em
- Adaptadores relacionados del mismo proyecto: https://huggingface.co/ArthT/qwen3-8b-a1-badmed-seed2-v2 y https://huggingface.co/ArthT/qwen3-8b-a2-badmed-seed1-v2
