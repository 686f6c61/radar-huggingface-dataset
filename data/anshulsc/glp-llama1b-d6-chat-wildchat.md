# anshulsc/glp-llama1b-d6-chat-wildchat

## Resumen

`glp-llama1b-d6-chat-wildchat` es un checkpoint de difusion de activaciones basado en el marco Generative Latent Prior (GLP), adaptado para el modelo `Llama-3.2-1B-Instruct`. No es un modelo de lenguaje generativo al uso: es un denoiser de 6 capas que modela la distribucion de las activaciones de la capa 7 (`model.layers[7]`, 2048 dimensiones) del LLM objetivo. Lo desarrolla el usuario anshulsc y se publica bajo licencia MIT.

El problema que resuelve es concreto: el checkpoint original `glp-llama1b-d6`, entrenado solo con activaciones de FineWeb (texto web), marca entre el 76,6 % y el 94,0 % de los tokens benignos de chat de `Llama-3.2-1B-Instruct` como fuera de distribucion a un umbral de falsa alarma del 1 %. Esta adaptacion sobre WildChat-1M con un 20 % de replay de FineWeb reduce esas falsas alarmas a 0,8 % (Alpaca) y 0,2 % (UltraChat) bajo `resid_mid4`, manteniendo la calidad de reconstruccion sobre FineWeb.

Es relevante para investigadores en interpretabilidad mecanica que quieran usar GLP como detector de anomalias o herramienta de analisis sobre conversaciones reales, no solo sobre texto web. El repositorio ocupa 3,4 GB y contiene los pesos del denoiser, la configuracion, las estadisticas del normalizador y un runner autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser MLP SwiGLU de 6 capas (GLP activation diffusion); `d_input=2048`, `d_model=4096`, `d_mlp=8192` |
| Parametros totales | no disponible (pesos de 3,42 GB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre tokens individuales de la capa 7; entrenado con `max_user_tokens=512`, `max_answer_tokens=64`) |
| Tipos de cuantizacion | no disponible (pesos en bf16/safetensors) |
| Idiomas soportados | no disponible (heredados del LLM objetivo y de WildChat) |
| Licencia | MIT |
| Formato de pesos | safetensors (`final.safetensors`), mas `config.yaml`, `rep_statistics.pt`, `calibration.json` |

## Arquitectura y entrenamiento

El modelo es un denoiser de difusion de activaciones: un MLP SwiGLU de 6 capas que aprende la distribucion de las activaciones de la capa 7 de `Llama-3.2-1B-Instruct` (salida de `model.layers[7]`, equivalente a `hidden_states[8]`, con 2048 dimensiones). Se inicializa desde `generative-latent-prior/glp-llama1b-d6` y mantiene fijo el normalizador (`rep_statistics.pt`) del checkpoint original. La arquitectura sigue el formato esperado por la libreria upstream `glp.denoiser.load_glp`.

El entrenamiento usa WildChat-1M (release publico no toxico, primer turno usuario/asistente, respuestas originales): 655.782 conversaciones utiles de 829.236 filas brutas, descartando 173.454 por superar los 512 tokens de usuario o estar malformadas. Se generaron 87.432.694 snapshots de activaciones de chat mediante extraccion en streaming con mezcla global y ventanas de ordenacion por longitud de 512 chats. Se anade un 20 % de replay de FineWeb muestreado por bloques desde 1M de snapshots de la capa 7 de `Llama-3.2-1B`. Optimizacion: 1 epoca, 26.664 pasos, batch de 4.096, AdamW con `lr=1e-5`, decaimiento coseno (1 % warmup hasta 0,1x) y bf16. MSE de validacion retenida: WildChat 1,3120 -> 1,0548; FineWeb 0,9089 -> 0,9625.

Detalle tecnico relevante: se fija `date_string = "26 Jul 2024"` en la plantilla de chat, porque la plantilla por defecto de Llama-3.2 inyecta la fecha actual y desplaza las activaciones de la capa 7 entre dias. Los roles de token entrenados son `user`, `last_user`, `post_inst` (los 5 tokens `<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`) y `answer`.

## Capacidades

- Puntuacion de distribucion (scoring) de tokens de la capa 7 de `Llama-3.2-1B-Instruct`: indica si una activacion es in-distribution o out-of-distribution.
- Deteccion de anomalias sobre conversaciones reales: calculo de falsas alarmas sobre tokens benignos de chat.
- Calculo de log-verosimilitud mediante ODE de flujo de probabilidad (Probability-Flow ODE NLL).
- Reconstruccion on-manifold de la capa 7 con calculo de KL (`--rebuild`).
- Puntuacion por token individual (`--show-tokens`) y en lote desde JSONL.
- Integracion con la libreria upstream `glp` (`load_glp`) o con implementacion propia incluida en `run_glp.py`.
- No es un modelo de generacion de texto: la generacion la realiza `Llama-3.2-1B-Instruct`, y GLP puntua sus activaciones.
- No soporta tool calling ni agentes por si mismo; es una herramienta de analisis de activaciones.

## Casos de uso

- Deteccion de deriva de distribucion en produccion: puntuar las activaciones de la capa 7 de las respuestas de `Llama-3.2-1B-Instruct` y marcar conversaciones cuyo `last_user` o `answer` se aleje de la distribucion de chat, usando los umbrales calibrados (`q01`/`q99`) de `calibration.json`.
- Investigacion en interpretabilidad mecanica: usar el denoiser como prior generativo para estudiar que direcciones de activacion son tipicas en conversaciones reales frente a texto web.
- Filtrado de datasets de instrucciones: puntuar pares prompt/respuesta de un corpus propio y descartar ejemplos con activaciones anomalas antes de usarlos en fine-tuning.
- Analisis de robustez ante cambios de plantilla: comparar puntuaciones con y sin `date_string` fijado para cuantificar el desplazamiento de activaciones por la fecha del sistema.
- Evaluacion de calidad de respuestas: combinar la NLL por ODE con la KL de reconstruccion para ordenar respuestas candidatas de un mismo prompt.
- Auditoria de sesgos y toxicidad (con cautela): el checkpoint no ha sido evaluado con prompts daninos, pero su capacidad de puntuar distribuciones permite construir un clasificador de anomalias como senal auxiliar, siempre validado empiricamente antes de uso.
- Reproduccion de experimentos GLP: servir como punto de partida para adaptar GLP a otras capas, otros LLM o dominios distintos del chat.

## Benchmarks y rendimiento

Datos reportados en la model card (todos sobre datasets benignos):

| Metrica | Antes (`glp-llama1b-d6`) | Despues (este checkpoint) |
|---|---|---|
| Falsas alarmas `last_user` benigno, Alpaca (`resid_mid4`) | 76,6 % - 94,0 % | 0,8 % |
| Falsas alarmas `last_user` benigno, UltraChat (`resid_mid4`) | 76,6 % - 94,0 % | 0,2 % |
| Falsas alarmas `last_user` benigno, Alpaca (MSE crudo 8 niveles) | no disponible | 2,4 % |
| Falsas alarmas `last_user` benigno, UltraChat (MSE crudo 8 niveles) | no disponible | 0,8 % |
| MSE validacion WildChat | 1,3120 | 1,0548 |
| MSE validacion FineWeb | 0,9089 | 0,9625 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque el modelo no es un LLM generativo. No se han evaluado prompts daninos ni adversarios con este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 3,42 GB en bf16; con overhead de activaciones y del LLM objetivo (`Llama-3.2-1B-Instruct`, ~2,5 GB en bf16) se recomienda al menos 8-10 GB de VRAM.
- GPU recomendadas: cualquier GPU con 10 GB o mas; RTX 3090, RTX 4090, A10, L4, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: el runner incluido `run_glp.py` (CLI y API Python) y la libreria upstream `g-luo/generative_latent_prior` via `glp.denoiser.load_glp`. No esta pensado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo autoregresivo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `anshulsc/glp-llama1b-d6-chat-wildchat` | Denoiser GLP para capa 7 de Llama-3.2-1B-Instruct | no disponible (3,42 GB) | no aplica | MIT | Hugging Face |
| `generative-latent-prior/glp-llama1b-d6` | Denoiser GLP para capa 7, solo FineWeb | no disponible | no aplica | no disponible | Hugging Face |
| `meta-llama/Llama-3.2-1B-Instruct` | LLM generativo | 1,24 B | 128k tokens | Llama 3.2 Community License | Hugging Face |

No se conocen otros checkpoints GLP adaptados a chat publicados en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no debe evaluarse con benchmarks de LLM.
- Solo modela la capa 7 de `Llama-3.2-1B-Instruct`; no es transferible directamente a otras capas, otros tamanos de Llama ni otros modelos sin reentrenamiento.
- Las evaluaciones reportadas son exclusivamente sobre datasets benignos; no hay datos sobre prompts daninos o adversarios, por lo que su uso como filtro de seguridad no esta validado.
- Fija `date_string = "26 Jul 2024"`; usar la plantilla por defecto con fecha dinamica puede degradar las puntuaciones.
- Entrenado con `max_user_tokens=512` y `max_answer_tokens=64`; turnos mas largos no estuvieron representados en el entrenamiento.
- Sesgos y alucinaciones: no aplica en el sentido habitual, pero el modelo hereda la distribucion de WildChat y FineWeb, con los sesgos presentes en esos corpus.
- Licencia MIT permite uso comercial, pero el LLM objetivo (`Llama-3.2-1B-Instruct`) se rige por la Llama 3.2 Community License, con sus propias restricciones.
- El checkpoint se publico el 27 de noviembre de 2026 y no registra descargas ni likes; no hay validacion independiente de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/anshulsc/glp-llama1b-d6-chat-wildchat
- Modelo base GLP: https://huggingface.co/generative-latent-prior/glp-llama1b-d6
- LLM objetivo: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Dataset de chat: https://huggingface.co/datasets/allenai/WildChat-1M
- Dataset de replay: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Repositorio upstream GLP: https://github.com/g-luo/generative_latent_prior
- Paper referenciado (arXiv:2602.06964): https://arxiv.org/abs/2602.06964
