# ETME-TECH/EliasAI-7B-v1.0

## Resumen
EliasAI-7B-v1.0 es un ajuste fino (fine-tune) en aleman del modelo base Qwen2.5-7B, desarrollado por ETME-TECH (Elias Rickert). Se trata de un modelo conversacional de 7.615.616.512 parametros (aproximadamente 7,6 mil millones) orientado especificamente a mantener dialogos naturales en aleman, con una personalidad definida y un modo de razonamiento interno previo a la respuesta. No esta disenado como modelo de proposito general, sino como un acompanante conversacional.

La propuesta del modelo es deliberadamente acotada: segun su model card, prioriza la comprension conversacional y la escucha activa sobre el conocimiento factual, el calculo matematico o la programacion. Incorpora un mecanismo de "pensamiento" en aleman delimitado por etiquetas `` antes de emitir la respuesta final, lo que permite al modelo interpretar el tono, el contexto y los subtextos emocionales (incluidos emoticonos) del interlocutor.

Su relevancia actual reside en dos factores: por un lado, es un ejemplo de fine-tune de Qwen2.5-7B con tecnicas de entrenamiento relativamente elaboradas (NEFTune, ponderacion diferencial de perdida, calibracion del token EOS) sobre un conjunto de datos pequeno y curado; por otro, cubre un nicho poco poblado como es el de modelos conversacionales nativos en aleman con licencia Apache-2.0.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune de Qwen2.5-7B |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la configuracion de entrenamiento uso MAX_SEQ_LENGTH=2048) |
| Tipos de cuantizacion | GGUF Q8_0 disponible en el repositorio; pesos completos en bfloat16 |
| Idiomas soportados | aleman (de) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura Qwen2 (transformer decoder-only con atencion por grupos de consultas, RoPE y SwiGLU), heredada integramente de Qwen/Qwen2.5-7B. El ajuste se realizo mediante QLoRA en 4 bits (NF4, computo en bfloat16, optimizador `paged_adamw_8bit`) con rango `r=32`, `lora_alpha=64` y `lora_dropout=0.05`, aplicado sobre las proyecciones `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`. Posteriormente los adaptadores se fusionaron en un modelo completo en bfloat16.

El conjunto de datos consistio en aproximadamente 24.000 dialogos alemanes curados, tanto de un solo turno como multi-turno, cubriendo conversacion cotidiana, smalltalk, subtexto emocional mediante emoticonos, charla tecnica e identidad del asistente. Se aplicaron tres innovaciones destacables: ruido de embedding NEFTune con `alpha=5.0`; ponderacion diferencial de la perdida (`` en aleman.
- Interpretacion de subtexto emocional y emoticonos (`:(((`, `:/`) para modular la respuesta.
- Dialogo multi-turno con memoria de contexto dentro de la ventana configurada.
- Respuestas en prosa fluida, sin listas de consejos ni checklists no solicitadas.
- No soporta de forma fiable tool calling, function calling ni razonamiento multi-paso orientado a agentes.
- No esta entrenado para matematicas, conocimiento factual, programacion ni calculo.
- Capacidad multilingue limitada al aleman como idioma funcional.

## Casos de uso
- Acompanamiento conversacional en aleman: el modelo mantiene conversaciones multi-turno centradas en la escucha y la respuesta empatica, adecuado para prototipos de asistentes personales o de bienestar emocional en entornos controlados.
- Simulacion de personaje o roleplay: su personalidad definida y su capacidad de leer el tono permiten usarlo como personaje conversacional en videojuegos, narrativa interactiva o demos de entretenimiento.
- Investigacion sobre fine-tuning de bajo coste: sirve como referencia reproducible de un pipeline QLoRA completo (NEFTune, ponderacion diferencial de perdida, calibracion EOS) ejecutado en una GPU de consumo de 12 GB.
- Evaluacion de modelos conversacionales en aleman: util como linea base de dominio especifico en pruebas de naturalidad, coherencia de tono y consistencia de personaje.
- Chatbot de comunidad en aleman: para foros o canales de soporte informal donde el objetivo sea conversar y no resolver consultas tecnicas ni factuales.
- Despliegue local en hardware modesto: gracias a la GGUF Q8_0 y a sus ~7,6 mil millones de parametros, puede ejecutarse en estaciones de trabajo con GPU de consumo mediante `llama-server`, LM Studio u Ollama para demos offline.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: en bfloat16 los pesos ocupan aproximadamente 15,2 GB; la GGUF Q8_0 ronda los 8 GB; cuantizaciones menores (Q4_K_M, no publicadas en el repo) se situarian en torno a 4,5-5 GB.
- GPU recomendadas: A100 o H100 para despliegue en bfloat16 con contexto largo; RTX 4090 (24 GB) para bfloat16; RTX 4070 (12 GB) suficiente para la GGUF Q8_0, que es precisamente el hardware usado en el entrenamiento.
- Cabe en GPU de consumo: si, en tarjetas de 8-12 GB con la cuantizacion Q8_0, y en configuraciones de 6-8 GB con cuantizaciones Q4.
- Opciones de despliegue: `llama.cpp` (`llama-server`), LM Studio, Ollama y TGI (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`); tambien es compatible con transformers.
- Parametros de inferencia recomendados por el autor: temperatura 0,55, top-p 0,90, top-k 40, repeat penalty 1,06, formato de razonamiento `deepseek`, contexto `-c 4096`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Idioma principal | Licencia | Notas |
|---|---|---|---|---|---|
| EliasAI-7B-v1.0 | 7,6 B | no disponible (entrenado a 2048) | Aleman | Apache-2.0 | Fine-tune conversacional de Qwen2.5-7B |
| Qwen/Qwen2.5-7B | 7,6 B | 32.768 tokens (ampliable) | Multilingue | Apache-2.0 | Modelo base; proposito general, matematicas y codigo |
| Modelos conversacionales alemanes de 7B | no disponible | no disponible | Aleman | variable | No se dispone de comparativas publicadas en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre EliasAI-7B-v1.0 y alternativas, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias
- El propio autor declara que el modelo "no sabe matematicas" y no esta pensado para conocimiento factual, programacion ni calculos; usarlo para esas tareas producira resultados poco fiables.
- Riesgo elevado de alucinacion en cualquier consulta que requiera datos verificables, ya que el entrenamiento se centro en estilo conversacional y no en precision factual.
- El unico idioma soportado es el aleman; el rendimiento en castellano u otros idiomas no esta garantizado.
- La longitud de contexto efectiva no esta documentada; el entrenamiento uso 2048 tokens, por lo que contextos mas largos pueden degradar la coherencia.
- Sesgos conocidos: no se documentan evaluaciones de sesgo; la personalidad fija y el corpus curado de ~24.000 dialogos pueden introducir sesgos de tono, genero o estilo no medidos.
- Licencia Apache-2.0, que permite uso comercial, pero al derivar de Qwen2.5-7B conviene revisar las condiciones del modelo base y de los datos de entrenamiento (no publicados).
- El repositorio tiene un volumen de descargas muy bajo (42) y cero likes, por lo que no cuenta con validacion externa de la comunidad.
- La fecha de creacion indicada (2026-11-20) resulta anomala; conviene verificar la procedencia y la integridad de los pesos antes de usarlos en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ETME-TECH/EliasAI-7B-v1.0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
