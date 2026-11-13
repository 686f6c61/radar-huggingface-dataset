# arjhinety/onebee-gf-dpo-v1-scale

## Resumen

onebee-gf-dpo-v1-scale es un checkpoint de ajuste fino por DPO (Direct Preference Optimization) con adaptadores LoRA sobre el modelo multimodal google/gemma-4-E2B-it. Lo desarrolla el autor independiente arjhinety dentro del proyecto de investigación small-mind-companion, centrado en estudiar post-entrenamiento y arquitecturas de memoria en modelos pequenos orientados a interaccion conversacional tipo acompanante. El modelo resuelve el problema de alinear las respuestas de un modelo pequeno con preferencias humanas en un contexto de persona conversacional, y es relevante porque documenta de forma abierta y con resultados negativos incluidos el proceso de post-entrenamiento sobre un modelo base multimodal de ~2B parametros efectivos.

El checkpoint parte de un SFT previo (sft-v1, 2232 ejemplos) y aplica DPO con 2049 pares de preferencia durante una epoca, lo que supone aproximadamente diez veces la escala de su predecesor dpo-v0 (200 pares). Segun la model card, es la senal de optimizacion de preferencias mas fuerte del proyecto, con una brecha de win-rate pairwise de 24,7 puntos porcentuales frente al modelo solo SFT. Ha sido superado por onebee-gf-distill-v1 como mejor checkpoint global, pero se mantiene como referencia pre-destilacion y como base de las cuantizaciones GGUF publicadas.

El modelo hereda del base una ventana de contexto de 131.072 tokens, capacidades multimodales texto-imagen y licencia Apache-2.0. Esta pensado como artefacto de investigacion y como base para destilacion o cuantizacion, no para despliegues en entornos criticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4 (transformer multimodal, texto + vision) |
| Parametros totales | 5.104.297.539 (pesos safetensors del repo); ~2B efectivos en el modelo base + adaptador LoRA de rango 16 |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | 131.072 tokens (heredada del modelo base) |
| Tipos de cuantizacion | GGUF en 12 niveles hasta Q2_K, mas referencia F16 y proyector de vision (repo separado) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (heredada de google/gemma-4-E2B-it) |
| Formato de pesos | safetensors (transformers); GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo se construye sobre google/gemma-4-E2B-it, un transformer multimodal que procesa texto e imagen (pipeline image-text-to-text). El ajuste se realiza mediante un adaptador LoRA de rango 16 entrenado con DPO durante una epoca sobre 2049 pares de preferencia, encadenado sobre el checkpoint sft-v1 (2232 ejemplos de SFT). No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset de preferencias ni si se aplicaron tecnicas adicionales como RLHF clasico o decodificacion especulativa.

La innovacion metodologica del proyecto no esta en la arquitectura, sino en el protocolo de evaluacion y en la trazabilidad: se evalua con PMB (Personalized Memory Benchmark), 688 sondas adversariales en 8 categorias, con un juez LLM en doble orden para controlar el sesgo de posicion y un detector de abstencion basado en reglas. El autor documenta explicitamente resultados negativos e inconcluyentes, y corrige en ERRATA una cifra de UAR del 70,0% que pertenecia al sistema SFT-v1+memoria y no a este checkpoint.

## Capacidades

- Generacion de texto conversacional con persona de acompanante y alineacion de preferencias reforzada por DPO.
- Procesamiento multimodal texto-imagen heredado del modelo base (pipeline image-text-to-text).
- Conversacion multi-turno con contexto largo de hasta 131.072 tokens.
- Alineacion de preferencias medida: 45,7% frente a 21,0% de win-rate pairwise sobre el modelo solo SFT (brecha de 24,7 pp, 105 sondas).
- Soporte de plantilla de chat via `apply_chat_template` con roles system/user.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking ni audio en la informacion disponible.

## Casos de uso

- Base para destilacion: el checkpoint esta pensado explicitamente como punto de partida para on-policy distillation, como demuestra su sucesor onebee-gf-distill-v1 construido sobre el.
- Base para cuantizacion: las cuantizaciones GGUF publicadas (12 niveles hasta Q2_K) se generan a partir de este checkpoint, lo que lo convierte en la referencia para inferencia on-device con llama.cpp.
- Investigacion en post-entrenamiento: sirve como baseline pre-destilacion para comparar tecnicas de DPO, SFT y distillation en modelos pequenos, con metodologia PMB reproducible.
- Prototipos de asistente conversacional con memoria: el ejemplo de la model card muestra un caso de recuperacion de informacion recordada por el usuario ("What conference did I say I was attending?"), adecuado para experimentar con arquitecturas de memoria personalizada.
- Experimentos de alineacion de preferencias a bajo coste: con ~2B parametros efectivos y LoRA rango 16, permite iterar sobre datasets de preferencia sin grandes presupuestos de computo.
- Evaluacion de sesgo de posicion en jueces LLM: el protocolo de doble orden y detector de abstencion es reutilizable para validar otros modelos en tareas de memoria personalizada.
- Despliegue en dispositivos con recursos limitados: gracias a las cuantizaciones GGUF hasta Q2_K, puede ejecutarse en hardware consumer para demos de acompanante conversacional.

## Benchmarks y rendimiento

| Sistema | Win-rate pairwise | UAR |
|---|---|---|
| dpo-v1-scale | 45,7% vs 21,0% (brecha 24,7 pp) | no disponible (sin medicion PMB completa) |

Evaluacion sobre PMB (Personalized Memory Benchmark): 688 sondas adversariales en 8 categorias, juez LLM con puntuacion en doble orden y detector de abstencion basado en reglas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 5.104.297.539 parametros en safetensors, en FP16 requeriria aproximadamente 10,2 GB solo para pesos, mas overhead de activaciones y proyector de vision.
- Cuantizaciones GGUF disponibles hasta Q2_K, lo que reduce sustancialmente los requisitos y permite inferencia on-device con llama.cpp.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, el modelo en FP16 encaja en GPUs con 16-24 GB (RTX 4090, A100 40 GB, H100), y las cuantizaciones bajas podrian caber en GPUs consumer de 8-12 GB.
- Cabe en GPU consumer: si, mediante las cuantizaciones GGUF publicadas; el nivel exacto segun VRAM no esta documentado.
- Opciones de despliegue: transformers (referencia en la model card), llama.cpp mediante los GGUF del repo onebee-gf-dpo-v1-scale-gguf. No se documenta soporte verificado de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onebee-gf-dpo-v1-scale | 5.104.297.539 en safetensors (~2B efectivos + LoRA r16) | 131.072 | LoRA DPO sobre sft-v1 | Apache-2.0 | Hugging Face + GGUF |
| onebee-gf-distill-v1 | no disponible | 131.072 (heredada) | SFT + DPO + distillation | Apache-2.0 | Hugging Face; mejor checkpoint del proyecto |
| onebee-gf-sft-v1 | no disponible | 131.072 (heredada) | SFT (2232 ejemplos) | Apache-2.0 | Hugging Face; baseline sin DPO |
| google/gemma-4-E2B-it | ~2B efectivos | 131.072 | Modelo base instruct | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Entrenamiento con una sola semilla y una sola ejecucion a esta escala de datos; no hay replicas que confirmen la robustez de la brecha de 24,7 pp.
- No existe medicion PMB completa (UAR) para este checkpoint; solo evaluacion pairwise. La cifra de UAR del 70,0% que aparecia en revisiones anteriores pertenece al sistema SFT-v1+memoria y fue corregida en ERRATA.
- Superado por onebee-gf-distill-v1 como mejor checkpoint del proyecto; usarlo como referencia pre-destilacion, no como estado del arte.
- Solo soporta ingles; no se documenta cobertura multilingue.
- No evaluado ni destinado a decisiones criticas de seguridad, consejo medico, legal o financiero, ni a despliegues donde un error o una respuesta excesivamente confiada cause dano real.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modelo base es de ~2B parametros efectivos, con las limitaciones tipicas de esa escala.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache-2.0 heredada del modelo base, lo que permite uso comercial, pero el autor no ofrece garantias de calidad para produccion.
- El pipeline declarado es image-text-to-text, aunque la evaluacion publicada se centra solo en texto conversacional; el rendimiento multimodal no esta medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arjhinety/onebee-gf-dpo-v1-scale
- Cuantizaciones GGUF: https://huggingface.co/arjhinety/onebee-gf-dpo-v1-scale-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio del proyecto: https://github.com/arjhinety/small-mind-companion
- Resultados a escala completa: https://github.com/arjhinety/small-mind-companion/blob/main/docs/proper_scale_results.md
- Checkpoint SFT previo: https://huggingface.co/arjhinety/onebee-gf-sft-v1
- Checkpoint DPO previo: https://huggingface.co/arjhinety/onebee-gf-dpo-v0
- Experimento de sobreajuste DPO: https://huggingface.co/arjhinety/onebee-gf-dpo-v1-4epoch
- Checkpoint actual mejor del proyecto: https://huggingface.co/arjhinety/onebee-gf-distill-v1
