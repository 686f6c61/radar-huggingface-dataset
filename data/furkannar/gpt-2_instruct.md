# FurkanNar/gpt-2_instruct

## Resumen

GPT-2 Instruct es un ajuste fino del modelo GPT-2 original de OpenAI (124 millones de parametros) publicado por el usuario FurkanNar en Hugging Face. El autor parte de su propio modelo previo `FurkanNar/gpt-2_svamp`, que a su vez derivaba de `openai-community/gpt2`, y lo entrena sobre el dataset Alpaca para dotarlo de capacidad de seguir instrucciones en ingles. El resultado es un modelo de generacion de texto muy pequeno, con licencia MIT y pesos en safetensors, orientado a experimentacion y pruebas de concepto mas que a uso en produccion.

La relevancia de este modelo es fundamentalmente didactica: muestra el flujo completo de un ajuste fino de instrucciones sobre una base GPT-2 con hiperparametros documentados (3 epocas, batch de 4, learning rate 5e-5, AdamW, longitud maxima de 256 tokens). No compite con modelos actuales de instrucciones en calidad ni en contexto: su ventana efectiva de entrenamiento es de 256 tokens y su F1 macro de validacion se queda en 0,2857 tras la tercera epoca, lo que refleja un ajuste limitado.

Arquitectonicamente es un transformer decoder-only clasico de GPT-2, con 124.439.808 parametros reales segun safetensors, un repositorio de 0,5 GB y pesos en `model.safetensors` de unos 475 MB. El autor declara una version posterior, `FurkanNar/GPT-2_Instruct-v0.5`, lo que sugiere que este checkpoint es una iteracion temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124.439.808 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia en entrenamiento); la configuracion nativa de GPT-2 soporta 1024, no confirmado para este ajuste |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precision original) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, ~475 MB) |

## Arquitectura y entrenamiento

El modelo es un GPT-2 estandar de 124M de parametros, es decir, un transformer decoder-only con atencion causal completa. No incorpora innovaciones arquitectonicas: no hay mezcla de expertos, atencion lineal, decodificacion especulativa ni modulos multimodales. El ajuste se realiza sobre el checkpoint `FurkanNar/gpt-2_svamp`, que previamente habia sido entrenado con el dataset SVAMP (problemas aritmeticos de enunciado simple), y este segundo ajuste usa el dataset `tatsu-lab/alpaca` con el formato oficial de instrucciones de Alpaca.

Los hiperparametros documentados son: 3 epocas, batch size de 4, learning rate 5e-5, optimizador AdamW, CrossEntropyLoss con desplazamiento de tokens de 1 y recorte de gradiente con norma maxima 1,0. La perdida de entrenamiento baja de 0,7349 a 0,6216 y la de validacion de 0,6526 a 0,6411, mientras el F1 macro de validacion apenas mejora de 0,2824 a 0,2857. No se documenta el numero total de tokens de entrenamiento ni el uso de RLHF, DPO o filtrado de datos; el autor solo menciona que los parametros de generacion estan ajustados para reducir fuga de datos y mejorar la calidad de respuesta.

## Capacidades

- Generacion de texto autoregresiva en ingles con formato de instrucciones estilo Alpaca.
- Seguimiento basico de instrucciones tras el ajuste fino, limitado por el tamano del modelo y la ventana de 256 tokens.
- Conversacion multi-turno limitada: el ejemplo de uso del autor mantiene historial de los ultimos 10 mensajes, aunque el contexto efectivo es muy corto.
- Razonamiento aritmetico basico heredado del ajuste previo sobre SVAMP, no verificado con benchmarks en esta ficha.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Multilingue: solo ingles declarado.

## Casos de uso

- Prototipado de pipelines de instrucciones: sirve para validar plantillas de prompt estilo Alpaca y el flujo de transformers antes de migrar a un modelo mayor, gracias a su tamano de 124M y su licencia MIT.
- Docencia y experimentacion academica: permite reproducir un ajuste fino completo de instrucciones en una sola GPU de consumo y comparar curvas de perdida y F1 entre epocas.
- Pruebas de integracion con text-generation-inference: el modelo esta etiquetado para TGI y puede desplegarse como endpoint ligero para validar infraestructura.
- Generacion de respuestas cortas en ingles para demos: con prompts de menos de 256 tokens y respuestas breves, encaja en asistentes de prueba de concepto.
- Ajuste incremental sobre tareas aritmeticas: al partir de un checkpoint entrenado en SVAMP, puede reutilizarse como base para experimentos de word problems simples.
- Evaluacion de tecnicas de mitigacion de fuga de datos: el autor menciona parametros de generacion orientados a reducir leakage, lo que lo hace util como banco de pruebas de decodificacion (temperatura 0,5, top-k 40, top-p 0,9, repetition penalty 1,2).
- Baseline de comparacion en investigacion sobre instrucciones: su F1 macro de 0,2857 sirve como referencia inferior para medir mejoras de modelos mas grandes.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son las metricas de validacion durante el entrenamiento, no benchmarks estandar:

| Metrica | Epoca 1 | Epoca 2 | Epoca 3 |
|---|---|---|---|
| Perdida de entrenamiento (media) | 0,7349 | 0,6583 | 0,6216 |
| Perdida de validacion (media) | 0,6526 | 0,6436 | 0,6411 |
| F1 macro de validacion | 0,2824 | 0,2839 | 0,2857 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (124M de parametros, ~475 MB de pesos); en fp16 alrededor de 250 MB, mas memoria para activaciones y KV cache.
- GPU recomendadas: cualquier GPU con CUDA, incluida una GTX 1650 o superior; el autor indica que se requiere GPU CUDA para la inferencia.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, entre otras.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta del repo) y, en principio, llama.cpp u Ollama si se generan pesos GGUF, aunque no se publican en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera muy baja latencia en GPU modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FurkanNar/gpt-2_instruct | 124M | 256 tokens (entrenamiento) | MIT | Hugging Face | Ajuste fino sobre Alpaca; F1 macro 0,2857 |
| openai-community/gpt2 | 124M | 1024 tokens | MIT | Hugging Face | Base sin ajuste de instrucciones |
| FurkanNar/gpt-2_svamp | 124M | no disponible | no disponible | Hugging Face | Checkpoint previo centrado en SVAMP |
| FurkanNar/GPT-2_Instruct-v0.5 | no disponible | no disponible | no disponible | Hugging Face | Version posterior citada por el autor |

No se dispone de datos de rendimiento comparables de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad de instrucciones muy limitada: el F1 macro de validacion de 0,2857 indica un ajuste debil y respuestas frecuentemente incorrectas o incoherentes.
- Ventana de contexto efectiva de 256 tokens, insuficiente para conversaciones largas o documentos; el historial de 10 mensajes del ejemplo puede exceder ese limite.
- Riesgo alto de alucinacion y de fuga de datos de entrenamiento, reconocido implicitamente por el autor al ajustar los parametros de generacion.
- Solo ingles; no hay soporte multilingue declarado.
- Sesgos heredados de GPT-2 y del dataset Alpaca, no evaluados ni documentados.
- No apto para produccion sin validacion exhaustiva: es un experimento de ajuste fino, no un modelo instruido robusto.
- Licencia MIT permite uso comercial, pero la ausencia de garantias y la baja calidad desaconsejan ese uso.
- Requiere GPU CUDA segun el autor; no se documenta inferencia en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FurkanNar/gpt-2_instruct
- Checkpoint base SVAMP: https://huggingface.co/FurkanNar/gpt-2_svamp
- GPT-2 original: https://huggingface.co/openai-community/gpt2
- Version posterior citada: https://huggingface.co/FurkanNar/GPT-2_Instruct-v0.5
- Dataset Alpaca: https://huggingface.co/datasets/tatsu-lab/alpaca
- Dataset SVAMP: https://huggingface.co/datasets/ChilleD/SVAMP
