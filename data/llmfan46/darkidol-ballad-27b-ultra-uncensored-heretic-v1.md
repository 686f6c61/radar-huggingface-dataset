# llmfan46/Darkidol-Ballad-27B-ultra-uncensored-heretic-v1

## Resumen

Darkidol-Ballad-27B-ultra-uncensored-heretic-v1 es un modelo de lenguaje de 26.896 millones de parametros publicado por el contribuidor independiente llmfan46. Se trata de una version "decensurada" (abliterated) del modelo aifeifei798/Darkidol-Ballad-27B, obtenida aplicando la herramienta Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA). El modelo base pertenece a la familia Qwen3.5 (tag `qwen3_5_text`) y esta orientado a generacion de texto conversacional y roleplay, con integracion prevista en frontends tipo SillyTavern.

El objetivo declarado del autor es reducir el numero de rechazos y respuestas evasivas del modelo original: segun la model card, los rechazos pasan de 28/100 en el modelo base a 3/100 en esta version (una reduccion del 89%), manteniendo practicamente intacta la capacidad de razonamiento fisico medida con PIQA (acc_norm 0.8194 frente a 0.8205 del original). La intervencion se realiza mediante ablacion de direcciones en las proyecciones de salida de atencion (`attn.out_proj` y `attn.o_proj`) en las capas 9 a 62.

El modelo es relevante para quienes necesitan un modelo conversacional de ~27B con pesos abiertos, licencia Apache 2.0 y comportamiento menos restrictivo para narrativa, juegos de rol o personajes, sin recurrir a APIs propietarias. No obstante, su naturaleza "uncensored" implica riesgos de seguridad y de cumplimiento que deben evaluarse antes de cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en repositorio separado; niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo base Darkidol-Ballad-27B es un transformer decoder-only de tipo Qwen3.5 con aproximadamente 26,9 mil millones de parametros en precision completa. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base. La model card del modelo base se centra en la caracterizacion del personaje ("Ballad") y en el tono narrativo, sin detallar el pipeline de entrenamiento.

La innovacion tecnica de esta version es el proceso de abliteracion con Heretic v1.2.0 y el metodo ARA (Arbitrary-Rank Ablation). Se aplica una ablacion de rango arbitrario sobre las proyecciones de salida de atencion (`attn.out_proj`, `attn.o_proj`) entre las capas 9 y 62, con los siguientes hiperparametros: `preserve_good_behavior_weight` 0.9161, `steer_bad_behavior_weight` 0.6655, `overcorrect_relative_weight` 0.7013 y `neighbor_count` 10. El objetivo es eliminar direcciones asociadas a comportamientos de rechazo preservando al maximo las capacidades originales, lo que se verifica con el benchmark PIQA.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay y narrativa de personajes.
- Razonamiento fisico basico medido con PIQA (acc_norm 0.8194), practicamente identico al modelo base.
- Reduccion significativa de rechazos y respuestas evasivas (3/100 frente a 28/100 del original, segun la model card).
- Integracion prevista con SillyTavern y otros frontends de rol conversacional.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con la libreria transformers.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no disponibles.
- Vision, audio o thinking mode: no disponibles.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta afinado para mantener personajes coherentes en conversaciones largas, con un tono literario y sin las interrupciones moralizantes tipicas de modelos alineados de forma estricta. Es adecuado para SillyTavern y motores de ficcion interactiva.
- Escritura creativa de ficcion adulta o de genero oscuro: la reduccion de rechazos permite generar escenas de terror, violencia narrativa o romance explicito que otros modelos bloquearian, manteniendo la coherencia estilistica del personaje.
- Prototipado de videojuegos narrativos: puede actuar como motor de dialogo para NPC en juegos indie, con pesos abiertos y licencia Apache 2.0 que facilitan la integracion en el producto.
- Investigacion sobre alineacion y abliteracion: sirve como caso de estudio reproducible para medir el impacto de tecnicas de ablacion sobre la tasa de rechazos y la degradacion de capacidades (PIQA como control).
- Generacion de dialogos para doblaje o audiolibros: su tono consistente y su capacidad de mantener una voz de personaje lo hacen util para producir guiones de voz de forma masiva.
- Evaluacion comparativa de modelos "uncensored": util como referencia en estudios que comparan tecnicas de decensurado (Heretic, ARA, abliteration clasica) sobre modelos Qwen.
- Despliegue local en entornos controlados: al publicarse en safetensors y GGUF, puede ejecutarse en infraestructura propia sin depender de APIs externas, lo que resulta adecuado para laboratorios con requisitos de confidencialidad.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Darkidol-Ballad-27B (original) |
|---|---|---|
| PIQA acc | 0.8145 | 0.8156 |
| PIQA acc_norm | 0.8194 | 0.8205 |
| Tasa de rechazos (100 prompts) | 3/100 | 28/100 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible. Los datos de PIQA se obtuvieron con batch size 128 y 0-shot.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 54 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda un minimo de 64-80 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 27-30 GB, viable en una RTX 5090 (32 GB) o A100 40 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): alrededor de 15-18 GB, viable en RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) con contexto reducido.
- GPU recomendadas: A100 80 GB o H100 para BF16; A100 40 GB o RTX 5090 para 8 bits; RTX 4090/3090 para 4-5 bits.
- Opciones de despliegue: transformers (formato nativo), llama.cpp / Ollama / LM Studio mediante el repositorio GGUF del autor, y vLLM o TGI si se convierte a los formatos soportados (no confirmado en la model card).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Darkidol-Ballad-27B-ultra-uncensored-heretic-v1 | ~26,9B | no disponible | Apache 2.0 | Roleplay, decensurado (Heretic/ARA) | Hugging Face, safetensors + GGUF |
| aifeifei798/Darkidol-Ballad-27B (base) | ~26,9B | no disponible | Apache 2.0 | Roleplay, alineado de forma estandar | Hugging Face |
| Modelos Qwen3.5 de ~27B de la familia oficial | ~27B | no disponible | Apache 2.0 (segun familia) | Proposito general | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoria mas alla de PIQA frente al modelo base. La comparativa con la familia Qwen oficial se limita a la arquitectura subyacente, ya que no se han publicado resultados propios en la informacion disponible.

## Limitaciones y advertencias

- La abliteracion elimina direcciones de rechazo, pero no garantiza la ausencia de contenido danino; el modelo puede generar material ofensivo, violento o sexualmente explicito sin filtros.
- Riesgo elevado de alucinacion en tareas factuales: el ajuste esta orientado a roleplay y no se han publicado evaluaciones de veracidad.
- La model card no documenta sesgos demograficos, culturales ni linguisticos; se desconoce el comportamiento en idiomas distintos del ingles.
- La longitud de contexto no esta publicada, lo que impide planificar despliegues con ventanas largas sin verificacion empirica.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue en productos de cara al publico puede incumplir politicas de plataformas (App Store, Google Play, APIs de terceros) y normativas de contenido.
- El autor declara haber alcanzado el limite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura de pesos y actualizaciones.
- El modelo tiene muy poca traccion (40 descargas, 1 like en el momento de la consulta), por lo que no existe una comunidad amplia que haya validado su comportamiento en produccion.
- No se han publicado datos sobre tool calling, agentes ni capacidades multimodales; no debe asumirse su soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Darkidol-Ballad-27B-ultra-uncensored-heretic-v1
- Modelo base: https://huggingface.co/aifeifei798/Darkidol-Ballad-27B
- Repositorio GGUF: https://huggingface.co/llmfan46/Darkidol-Ballad-27B-ultra-uncensored-heretic-v1-GGUF
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Pull request del metodo ARA: https://github.com/p-e-w/heretic/pull/211
- Patreon del autor: https://patreon.com/LLMfan46
- Ko-fi del autor: https://ko-fi.com/llmfan46
