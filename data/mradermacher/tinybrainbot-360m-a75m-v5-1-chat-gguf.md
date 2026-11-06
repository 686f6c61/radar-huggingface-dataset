# mradermacher/tinybrainbot-360m-a75m-v5.1-chat-GGUF

## Resumen

tinybrainbot-360m-a75m-v5.1-chat es un modelo de lenguaje conversacional de arquitectura Mixture of Experts (MoE) desarrollado desde cero por el usuario nkthebass, y cuantizado a formato GGUF por mradermacher. Con 383.429.376 parámetros totales y aproximadamente 75 millones de parámetros activos por token (según la nomenclatura "a75m" del nombre), se posiciona como un modelo de escala muy reducida orientado a tareas de chat casual en inglés. La nomenclatura "mixtral" en sus tags sugiere una topología de enrutamiento inspirada en Mixtral, aunque el tamaño es varios órdenes de magnitud inferior.

El modelo está afinado para conversación a partir de una mezcla de datasets de instrucciones y diálogo, entre los que figuran smoltalk y smoltalk2 de HuggingFaceTB, tulu-3-sft-personas-instruction-following de AllenAI, WildChat-4.8M, OpenHermes-2.5 y empathetic_dialogues_llm. Esta combinación apunta a un entrenamiento de tipo SFT sobre datos sintéticos y conversacionales, sin que la model card documente fases de RLHF o DPO.

Su relevancia práctica es acotada pero concreta: ofrece un punto de partida reproducible para experimentación con arquitecturas MoE de muy bajo coste computacional, con cuantizaciones que ocupan entre 0,3 y 0,9 GB, lo que permite desplegarlo en hardware muy modesto, incluidas CPU y GPUs de gama de entrada. La licencia Apache 2.0 facilita su uso y modificación sin restricciones comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, inspirada en Mixtral (según tags) |
| Parámetros totales | 383.429.376 |
| Parámetros activos | ~75 M (según nomenclatura "a75m"; no confirmado en model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de tipo Mixture of Experts, según indican los tags "mixture-of-experts", "moe" y "mixtral" del repositorio. El nombre del modelo codifica 360 M de parámetros totales y 75 M activos, lo que implica un ratio de activación bajo (en torno al 20 %), coherente con un diseño MoE disperso. No se dispone de información sobre el número de expertos, la función de enrutamiento, la dimensión oculta ni el número de capas; la model card original no documenta estos detalles.

El entrenamiento se realizó desde cero ("from-scratch" según tags) y posteriormente se afinó para chat mediante SFT sobre una mezcla de datasets: Estwld/empathetic_dialogues_llm, HuggingFaceTB/smol-smoltalk, allenai/tulu-3-sft-personas-instruction-following, allenai/WildChat-4.8M, HuggingFaceTB/smoltalk, HuggingFaceTB/smoltalk2 y teknium/OpenHermes-2.5. No se documenta el volumen de tokens, la composición exacta de la mezcla ni si hubo fases de alineación adicionales como RLHF o DPO. Tampoco se describen innovaciones técnicas específicas más allá de la propia arquitectura MoE.

## Capacidades

- Generación de texto conversacional en inglés, con estilo "casual" según los tags del repositorio.
- Diálogo multi-turno orientado a chat informal.
- Instrucciones y seguimiento de personas, gracias al dataset tulu-3-sft-personas-instruction-following.
- Conversación empática, derivada del dataset empathetic_dialogues_llm.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de código, matemáticas, visión ni audio.
- Multilingüismo limitado al inglés.
- No se documenta modo "thinking" ni decodificación especulativa.

## Casos de uso

- Chatbots de propósito general en inglés para prototipado: el modelo puede gestionar conversaciones multi-turno básicas con un coste de inferencia mínimo, adecuado para entornos de desarrollo y pruebas de concepto.
- Experimentación con arquitecturas MoE: sirve como banco de pruebas reproducible para estudiar el comportamiento de enrutamiento y activación de expertos en un modelo de escala reducida, dado su origen "from-scratch".
- Despliegue en dispositivos de borde: con cuantizaciones de 0,3 a 0,5 GB, es viable en Raspberry Pi, portátiles sin GPU dedicada o contenedores con memoria restringida.
- Generación de respuestas empáticas en aplicaciones de acompañamiento conversacional: el entrenamiento sobre empathetic_dialogues_llm lo orienta a respuestas de tono comprensivo, útil en demos de asistentes de bienestar.
- Filtrado y generación de datos sintéticos conversacionales: puede emplearse como generador auxiliar de diálogos para aumentar datasets de entrenamiento de modelos mayores.
- Educación y docencia: su tamaño permite ejecutarlo en un aula o taller para ilustrar el funcionamiento interno de un MoE y el proceso de cuantización GGUF sin requerir infraestructura de GPU.
- Evaluación comparativa de cuantizaciones: la disponibilidad de doce variantes GGUF (desde Q2_K hasta f16) permite medir el impacto de la cuantización en la perplejidad y la calidad conversacional en un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB con Q2_K/Q3_K/IQ4_XS, 0,3 GB con Q4_K_S/Q4_K_M, 0,4 GB con Q5_K/Q6_K, 0,5 GB con Q8_0 y 0,9 GB con f16 (tamaños de archivo indicados en la model card).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; el modelo cabe holgadamente en GTX 1050 Ti, RTX 3050, RTX 4060 y superiores. También es viable en A100/H100, aunque enormemente sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPUs con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp y Ollama son las vías naturales para GGUF; también es posible usar el modelo base en safetensors con transformers. No se documenta compatibilidad con vLLM ni TGI (aunque el tag "endpoints_compatible" sugiere compatibilidad con Inference Endpoints de Hugging Face).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera inferencia en tiempo real incluso en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinybrainbot-360m-a75m-v5.1-chat | 383 M totales / ~75 M activos | no disponible | Apache 2.0 | GGUF, safetensors | MoE from-scratch, solo inglés |
| SmolLM2-360M-Instruct (HuggingFaceTB) | 360 M densos | 8.192 tokens (según documentación pública del modelo) | Apache 2.0 | safetensors, GGUF | Denso, multilingüe parcial, con benchmarks publicados |
| Qwen2.5-0.5B-Instruct | 494 M densos | 32.768 tokens (según documentación pública del modelo) | Apache 2.0 | safetensors, GGUF | Denso, multilingüe, ampliamente evaluado |
| TinyLlama-1.1B-Chat | 1,1 B densos | 2.048 tokens (según documentación pública del modelo) | Apache 2.0 | safetensors, GGUF | Denso, inglés, con benchmarks publicados |

La comparación se limita a parámetros, contexto y licencia: no hay datos de rendimiento publicados para tinybrainbot que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre WildChat y OpenHermes, puede heredar sesgos presentes en datos conversacionales de internet.
- Riesgo de alucinación: elevado, esperable en un modelo de 383 M de parámetros con capacidad de conocimiento factual muy limitada.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide garantizar un comportamiento fiable en conversaciones largas.
- Idioma: solo inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías sobre el modelo.
- Caveats para producción: sin benchmarks publicados, sin documentación de arquitectura detallada y con cero descargas en el momento de la ficha, no es recomendable para despliegues en producción sin una evaluación propia previa.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar notablemente la calidad en un modelo ya de por sí pequeño; se recomienda Q4_K_M o superior para uso real.
- No hay cuantizaciones ponderadas/imatrix disponibles según la model card.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/tinybrainbot-360m-a75m-v5.1-chat-GGUF
- Modelo base: https://huggingface.co/nkthebass/tinybrainbot-360m-a75m-v5.1-chat
- Página de descargas del cuantizador: https://hf.tst.eu/model#tinybrainbot-360m-a75m-v5.1-chat-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
