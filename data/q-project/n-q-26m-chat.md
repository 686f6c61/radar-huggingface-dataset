# q-project/N-Q-26M-Chat

## Resumen

N-Q-26M-Chat es un modelo de lenguaje conversacional de tipo causal desarrollado por Q Project, un proyecto de investigación que entrena modelos pequeños desde cero en una única GPU V100 de 16 GB. Se trata del checkpoint de chat del peldaño más bajo de una escalera de modelos rusos/ingleses, construida sobre la base N-Q-26M. El modelo resuelve un problema concreto y poco habitual: la aritmética y el manejo de fechas, unidades y ordenaciones no se delegan a la red neuronal, sino a un circuito determinista externo que el modelo invoca mediante tokens especiales (`<CALC>...<EQ>...<ECALC>`), lo que produce resultados exactos incluso en un modelo de juguete.

La arquitectura no es un transformer estándar: se eligió mediante un ablation entre tres candidatos y ganó una variante híbrida de Gated DeltaNet con atención con puertas en proporción 3:1, Gated Residual, embedding de n-gramas y optimizador Muon. El recuento real de parámetros en safetensors es de 46.452.571, de los cuales 29,7 M corresponden a la red y 16,8 M a la tabla de n-gramas, según la model card. El contexto de entrenamiento se midió sobre un tokenizador propio de 8.256 tokens.

Es relevante ahora porque documenta con inusual honestidad los límites de los modelos de esta escala: fluidez formal aceptable en ruso e inglés, tool calling fiable (15/16 en una sonda de 16 tareas) y un rendimiento prácticamente nulo en razonamiento multi-paso (GSM8K en torno al 2%). Resulta útil como referencia de arquitectura, como banco de pruebas de circuitos exactos y como ejemplo de evaluación rigurosa, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet (atención lineal recurrente) + atención con puertas en proporción 3:1, Gated Residual, embedding de n-gramas, optimizador Muon |
| Parametros totales | 46.452.571 (29,7 M de red + 16,8 M de n-gramas, según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (tokenizador de 8.256 tokens; la model card no declara la ventana máxima) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; contenedor propio QPACK1 en `model.qpack`) |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y QPACK1 (`model.qpack`, formato empaquetado de un solo archivo) |

## Arquitectura y entrenamiento

El modelo es un causal LM con una arquitectura híbrida poco convencional. La columna vertebral combina capas de Gated DeltaNet (atención lineal con estado recurrente) y capas de atención con puertas en una proporción 3:1, complementadas con Gated Residual y una tabla de embedding de n-gramas de 16,8 M de parámetros. La elección se justificó con un ablation sobre 0,5 B tokens con datos, schedule y batch idénticos: la variante B (esta arquitectura) obtuvo una pérdida media de 2,616 frente a 3,061 de la variante A (diseño Q-164M con pesos ternarios, vocabulario de huellas de 512 bits y GQA) y 2,990 de la variante C, con una ventaja de 0,45 nats sobre A y unos 0,2 sobre C en todos los checkpoints. El throughput en V100 en modo eager fue de unos 19k tok/s, que sube a unos 85k tok/s con `torch.compile`.

El pipeline completo se entrenó desde cero en una sola V100 de 16 GB: tokenizador, preentrenamiento, SFT, razonamiento, LoRA, DPO, GRPO/PPO, RL agéntico y destilación, todo en PyTorch legible. Los datos de preentrenamiento incluyen FineWeb-Edu, Cultura RU Edu y Wikipedia; el ajuste conversacional usa Smoltalk, GrandMaster-PRO-MAX, Saiga Scored, Russian-Reasoning, Saiga Preferences y UltraFeedback Binarized. La innovación central son los circuitos exactos: el modelo emite `<CALC>expr<EQ>`, un ejecutor determinista escribe el resultado exacto y `<ECALC>`, y el modelo continúa desde ahí. El checkpoint publicado es el de DPO; el RL posterior (GRPO y RL agéntico) no aportó señal medible a esta escala.

## Capacidades

- Generación de texto conversacional multi-turno en ruso e inglés.
- Tool calling determinista para aritmética, fechas, conversión de unidades y ordenación mediante el circuito `<CALC>...<EQ>...<ECALC>`.
- Modo de razonamiento opcional con bloques `<THINK>...<ETHINK>` (activación mediante `enable_thinking=True` en la plantilla de chat).
- Razonamiento de un solo paso con apoyo de calculadora; el modelo planifica la llamada pero no resuelve cadenas de varios pasos.
- Generación con decodificación configurable: `temperature`, `top_p`, `top_k`, `repetition_penalty`, `max_new_tokens` y `stop_ids`.
- Gestión propia de estado recurrente (Gated DeltaNet) más caché KV para las capas de atención en su `generate()`.
- Capacidades multilingües limitadas a ru y en; no se declaran otras lenguas.
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- **Calculadora conversacional con resultado exacto**: el modelo interpreta la pregunta en lenguaje natural, emite la expresión y el ejecutor devuelve el valor exacto. Adecuado para asistentes de cálculo donde un error de un dígito es inaceptable, porque la red no calcula el número.
- **Conversión de unidades y fechas en soporte interno**: tareas como "30 días después del 15 de enero de 2027" se resuelven con el circuito; útil en herramientas internas de planificación donde la exactitud del dato prima sobre la fluidez.
- **Prototipado de arquitecturas híbridas**: sirve como banco de pruebas reproducible de Gated DeltaNet más atención con puertas en una sola GPU de 16 GB, con pipeline completo de SFT, DPO y RL documentado.
- **Investigación en circuitos exactos y neuro-simbólicos**: permite estudiar cómo un modelo pequeño aprende a delegar en un ejecutor determinista y qué falla en la generación posterior al resultado.
- **Evaluación de metodologías de benchmark**: la model card documenta un error de scoring en GSM8K (subcadena frente a número final), lo que lo convierte en material de referencia para diseñar evaluaciones correctas en modelos pequeños.
- **Chat de bajo coste en ruso para entornos con recursos mínimos**: cabe en GPUs consumer y puede desplegarse para tareas de conversación informal donde la corrección factual no sea crítica.
- **Generación de datos sintéticos controlados**: su formato estructurado de llamadas y bloques de pensamiento facilita producir trazas etiquetadas para entrenar otros modelos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Nota |
|---|---|---|
| Sonda de tool calling (16 tareas fijas, 8 ru + 8 en, greedy) | 15/16 | El fallo: "30 días después del 15 de enero de 2027"; el circuito calcula 2027-02-14 y el modelo escribe "June 14" |
| GSM8K test, número final exacto (500 en / 500 ru, thinking on) | 2,0% / 2,2% | Razonamiento multi-paso no resuelto; algunos aciertos son números finales afortunados |
| GSM8K tras GRPO / RL agéntico | 2,2% / 2,0% · 1,6% / 1,4% | Dentro del ruido (±0,6 pp); el checkpoint publicado es el de DPO |
| Pérdida held-out del modelo base (en / ru-edu / ru-wiki) | 2,381 / 2,651 / 2,323 | Perplejidad 10,8 / 14,2 / 10,2 con tokenizador de 8.256 tokens (no comparable entre tokenizadores) |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,3 GB; con 46,5 M de parámetros totales, la inferencia en fp32 ronda los 0,2 GB de pesos y en fp16/bf16 unos 0,1 GB, más el estado recurrente y la caché KV.
- GPU recomendadas: cabe holgadamente en cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) y en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Entrenamiento de referencia: una única V100 de 16 GB, con throughput de unos 19k tok/s en eager y unos 85k tok/s con `torch.compile`.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por la arquitectura personalizada). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de latencia de inferencia; solo los valores de entrenamiento citados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| N-Q-26M-Chat | 46,5 M (29,7 M + 16,8 M n-gramas) | no disponible | Tool calling 15/16; GSM8K ≈2% | Apache 2.0 | Hugging Face |
| N-Q-26M (base) | no disponible | no disponible | Pérdida held-out 2,381 / 2,651 / 2,323 | Apache 2.0 | Hugging Face |
| Q-164M | no disponible | no disponible | Diseño con pesos ternarios y vocabulario de huellas; pérdida 3,061 en el ablation a 26M | no disponible | Hugging Face |
| MiniMind | no disponible | no disponible | Referencia de pipeline de entrenamiento desde cero | no disponible | Proyecto público |

No se dispone de datos de benchmarks comparables con modelos de la misma categoría fuera del proyecto; la comparación se limita a los candidatos del ablation y a la base del propio modelo.

## Limitaciones y advertencias

- Es una release de investigación, no un producto: fluido en forma pero a menudo factualmente incorrecto.
- Repetitivo bajo decodificación greedy.
- No resuelve problemas de palabras multi-paso (GSM8K ≈2%); el RL a esta escala no aporta señal medible.
- Riesgo alto de alucinación en cualquier dato factual que no pase por el circuito exacto.
- El circuito solo se activa si se pasa `tokenizer=tok` a `generate()`; sin él, el modelo "calcula" el número tras `<EQ>` y suele equivocarse (por ejemplo, `4821*37 → 104621`).
- Forzar `enable_thinking=False` está fuera de distribución: los datos de SFT nunca contuvieron un bloque `<THINK><ETHINK>` vacío.
- Idiomas limitados a ruso e inglés; no se declaran capacidades en castellano ni en otras lenguas.
- La longitud de contexto no está documentada en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías de corrección; el autor desaconseja explícitamente su uso como producto.
- Requiere `trust_remote_code=True` por la arquitectura personalizada, lo que implica ejecutar código del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/q-project/N-Q-26M-Chat
- Modelo base: https://huggingface.co/q-project/N-Q-26M
- Organización Q Project: https://huggingface.co/q-project
- Q-164M: https://huggingface.co/q-project/Q-164M
- MiniMind (referencia del pipeline): https://jingyaogong.github.io/minimind/
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cultura RU Edu: https://huggingface.co/datasets/deepvk/cultura_ru_edu
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset GrandMaster-PRO-MAX: https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
- Dataset Saiga Scored: https://huggingface.co/datasets/IlyaGusev/saiga_scored
- Dataset Russian-Reasoning: https://huggingface.co/datasets/attn-signs/russian-reasoning
- Dataset Saiga Preferences: https://huggingface.co/datasets/IlyaGusev/saiga_preferences
- Dataset UltraFeedback Binarized: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
