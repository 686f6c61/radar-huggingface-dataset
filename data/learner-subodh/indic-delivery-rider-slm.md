# learner-subodh/Indic-Delivery-Rider-SLM

## Resumen

Indic-Delivery-Rider-SLM es un modelo de lenguaje de 39,7 millones de parámetros desarrollado por el usuario learner-subodh, diseñado específicamente para asistir a repartidores de reparto en India en escenarios sin conectividad. Se trata de un transformer decoder-only de estilo Llama entrenado desde cero, con 10 capas, dimensión oculta de 512 y una ventana de contexto de 384 tokens, lo que lo sitúa en la categoría de small language model (SLM) orientado a edge computing.

El modelo aborda un nicho concreto: respuestas de soporte operativo (cambios de dirección, incidencias con pedidos, políticas de entrega) en inglés, hindi, bengalí, maratí y tamil, con un tokenizador SentencePiece BPE de 20.000 tokens que reduce drásticamente la fertilidad en lenguas índicas frente a BPE convencionales (1,26 tokens/palabra en hindi frente a 7,76 con GPT-2 BPE). Su relevancia actual reside en la combinación de tamaño mínimo, multilingüismo índico real y formato de pesos compatible con `LlamaForCausalLM`, lo que facilita su despliegue en dispositivos de baja capacidad.

No obstante, el propio autor lo etiqueta como modelo de investigación experimental: fue entrenado durante aproximadamente 28 minutos en una única GPU T4 sobre un conjunto de datos pequeño, y los datos no ingleses son traducciones automáticas no revisadas por hablantes nativos. Es, por tanto, una prueba de concepto de SLM multilingüe para logística, no un sistema listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (GQA, SwiGLU, RMSNorm, RoPE, embeddings atados) |
| Parámetros totales | 39.741.952 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; compatible con cuantización estándar vía transformers/llama.cpp, no confirmado por el autor) |
| Idiomas soportados | en, hi, bn, mr, ta |
| Licencia | other (procedencia mixta: Bitext CDLA-Sharing-1.0, Aya Apache-2.0, traducciones NLLB-200 CC-BY-NC-4.0) |
| Formato de pesos | safetensors (exportable como `LlamaForCausalLM`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 10 capas con dimensión oculta 512, 8 cabezas de atención y 4 cabezas KV (attention con consultas agrupadas, GQA), MLP SwiGLU con dimensión intermedia 1408, normalización RMSNorm, embeddings rotatorios (RoPE) y embeddings de entrada/salida atados. El tokenizador es SentencePiece BPE con 20.000 tokens y byte fallback, lo que garantiza cobertura de cualquier script. La exportación se verifica contra `LlamaForCausalLM` comparando logits con la implementación original.

El entrenamiento se realizó desde cero durante aproximadamente 28 minutos en una GPU T4. Los datos combinan el dataset de soporte al cliente Bitext (inglés), una traducción automática a nivel de frase de un subconjunto estratificado a las demás lenguas mediante NLLB-200 destilado de 600M (con filtrado de placeholders, script, repetición y longitud) y datos de instrucciones en script nativo del dataset Aya. No se documenta el número total de tokens de entrenamiento ni el uso de RLHF o DPO. La innovación técnica principal es el tokenizador multilingüe: la fertilidad en tamil es de 1,81 tokens/palabra frente a 23,44 con GPT-2 BPE, lo que hace viable un vocabulario de solo 20.000 tokens para cinco lenguas.

## Capacidades

- Generación de texto conversacional en inglés, hindi, bengalí, maratí y tamil, con formato de prompt estructurado (`<|user|>`, `<|assistant|>`, `<|lang|>`).
- Selección automática de idioma de respuesta: el modelo predice la etiqueta de lengua correcta sin indicación explícita (auto_lang_id = 1,0 en las pruebas del autor).
- Fidelidad de script: las respuestas se generan en el script esperado (lang_fidelity = 1,0 en en, hi, bn y ta; 0,67 en mr).
- Respuestas de soporte operativo sobre políticas de entrega, cambios de dirección e incidencias, derivadas del dominio Bitext.
- Control de idioma mediante prefill de la etiqueta `<|en|>`, `<|hi|>`, `<|bn|>`, `<|mr|>` o `<|ta|>`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Asistencia offline a repartidores: el modelo cabe en dispositivos de borde y responde en el idioma del repartidor sin conexión, cubriendo consultas sobre direcciones y estados de pedido gracias a su tokenizador índico eficiente.
- Soporte al cliente de primer nivel en lenguas índicas: puede generar respuestas plantilla en hindi, bengalí, maratí o tamil para preguntas frecuentes, con la ventaja de un coste computacional mínimo (40M de parámetros).
- Prueba de concepto de SLM multilingüe: sirve como base para investigar tokenizadores eficientes en lenguas índicas y para experimentos de destilación o ajuste fino en dominios logísticos.
- Generación de respuestas guiadas por plantilla: con contexto de 384 tokens, es adecuado para preguntas cortas y respuestas de una sola interacción, no para conversaciones multi-turno largas.
- Traducción asistida de mensajes operativos: aunque no está entrenado explícitamente para traducción, su vocabulario multilingüe permite generar reformulaciones en el idioma del cliente a partir de una consulta en inglés.
- Evaluación de pipelines de despliegue en edge: su tamaño (0,2 GB de repo) permite probar integraciones con transformers, TGI o llama.cpp en hardware de gama baja antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El autor publica evaluaciones de bits por byte (menor es mejor) y perplejidad sobre datos retenidos, separando dominio (soporte) y general (Aya):

| Idioma | Datos | bits_per_byte | Perplejidad | Tokens de respuesta |
|---|---|---|---|---|
| bn | dominio | 0,204 | 6,614 | 10.821 |
| bn | general | 0,825 | 193,146 | 5.206 |
| en | dominio | 0,258 | 2,297 | 52.493 |
| hi | dominio | 0,199 | 4,506 | 12.750 |
| hi | general | 0,694 | 51,689 | 3.170 |
| mr | dominio | 0,217 | 7,363 | 11.822 |
| mr | general | 0,668 | 36,486 | 4.682 |
| ta | dominio | 0,177 | 7,704 | 12.050 |
| ta | general | 0,731 | 119,382 | 9.661 |

Pruebas de generación sobre prompts manuales de repartidor (3 por idioma, muestra muy pequeña):

| Idioma | lang_fidelity | auto_lang_id | distinct2 | stop_rate | Palabras medias |
|---|---|---|---|---|---|
| bn | 1,0 | 1,0 | 0,95 | 0,67 | 80,0 |
| en | 1,0 | 1,0 | 0,98 | 0,67 | 75,0 |
| hi | 1,0 | 1,0 | 0,94 | 1,0 | 91,67 |
| mr | 0,67 | 1,0 | 0,65 | 0,67 | 57,67 |
| ta | 1,0 | 1,0 | 0,99 | 0,67 | 89,67 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (39,7M de parámetros ≈ 160 MB de pesos) y por debajo de 0,5 GB en fp16 o cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una T4, que es sobradamente suficiente para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, GTX 1650) e incluso en CPU y dispositivos de borde.
- Opciones de despliegue: transformers (verificado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp y Ollama no están confirmados por el autor, aunque el formato `LlamaForCausalLM` facilita la conversión.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, la generación de 160 tokens es viable en tiempo interactivo incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas índicos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Indic-Delivery-Rider-SLM | 39,7M | 384 | en, hi, bn, mr, ta | other (mixta, con componente NC) | Hugging Face |
| SmolLM-135M | 135M | 2.048 | limitado (mayormente inglés) | Apache-2.0 | Hugging Face |
| Qwen2.5-0.5B | 494M | 32.768 | multilingüe amplio | Apache-2.0 | Hugging Face |
| Gemma-2B | 2.000M | 8.192 | multilingüe amplio | Gemma license | Hugging Face |

La comparación es aproximada: no se dispone de benchmarks comunes entre estos modelos y el SLM de repartidores. Frente a SmolLM-135M, el modelo de learner-subodh ofrece un tokenizador índico mucho más eficiente y un dominio especializado, pero con menor capacidad, contexto muy reducido y licencia más restrictiva. Frente a Qwen2.5-0.5B y Gemma-2B, la diferencia de tamaño es de un orden de magnitud y no son alternativas directas para edge extremo.

## Limitaciones y advertencias

- Capacidad muy limitada: 39,7M de parámetros y 384 tokens de contexto restringen las respuestas a interacciones cortas y de un solo turno.
- Alucinación de políticas: el modelo puede enunciar políticas de entrega incorrectas con fluidez; el autor recomienda derivar cualquier asunto monetario, de lesiones o disputas a un humano o a una plantilla fija.
- Confusión hindi-maratí: ambas lenguas comparten script devanagari y el modelo las mezcla (lang_fidelity de 0,67 y distinct2 de 0,65 en maratí).
- Repetición: distinct2 de 0,65 en maratí indica tendencia a repetirse; el resto de idiomas se mantiene por encima de 0,94.
- Datos no ingleses traducidos automáticamente con NLLB-200 y no revisados por nativos, lo que introduce errores de traducción en el entrenamiento.
- Licencia restrictiva para uso comercial: la procedencia mixta incluye pesos NLLB-200 bajo CC-BY-NC-4.0 (no comercial); el autor recomienda consultar con asesoría legal antes de cualquier uso comercial y libera los pesos solo para investigación y evaluación.
- Sin soporte documentado de tool calling, agentes, visión ni audio.
- Entrenamiento de ~28 minutos en una T4: no hay garantía de convergencia ni de calidad sostenida fuera del dominio de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/learner-subodh/Indic-Delivery-Rider-SLM
- Dataset Bitext customer support: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
- Dataset Aya: https://huggingface.co/datasets/CohereForAI/aya_dataset
- NLLB-200 (modelo de traducción utilizado): https://huggingface.co/facebook/nllb-200-distilled-600M
