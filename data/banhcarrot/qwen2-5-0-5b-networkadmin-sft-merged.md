# banhcarrot/qwen2.5-0.5b-networkadmin-sft-merged

## Resumen

`banhcarrot/qwen2.5-0.5b-networkadmin-sft-merged` es un ajuste fino supervisado (SFT) del modelo denso Qwen2.5-0.5B-Instruct, desarrollado por el usuario de HuggingFace `banhcarrot`. El objetivo declarado es muy acotado: convertir una tarea de administracion de red en una decision estructurada en JSON (accion, llamada a herramienta y codigo de motivo), entrenada sobre el dataset propio `banhcarrot/networkadminquestion`.

Tecnicamente es un transformer decoder-only de tipo Qwen2 con 494.032.768 parametros (segun los pesos safetensors del repositorio, unos 3,0 GB de repo), derivado de un adaptador LoRA (r=32, alpha=32, dropout=0.05 sobre 7 modulos) que se ha fusionado en los pesos base. Al estar fusionado, se carga con `AutoModelForCausalLM` sin necesidad de PEFT. El autor no declara licencia, idiomas ni pipeline en la model card.

Su relevancia es limitada y muy especifica: no es un modelo de proposito general, sino un ejemplo reproducible de especializacion de un modelo pequeno (sub-1000M) para una tarea de decision con salida JSON verificable. Los resultados publicados por el autor en el split de test (144 filas, decodificacion greedy) son un 100,0 % de tasa de parseo JSON, 82,6 % de exactitud en la decision, 73,6 % en la llamada a herramienta y 61,1 % en la coincidencia estricta de los tres campos, con solo 35 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2, base Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 (segun safetensors del repositorio) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens heredados de la base Qwen2.5-0.5B-Instruct; no documentado en la model card (entrenamiento con max_length=3072) |
| Tipos de cuantizacion | No disponible; el repositorio publica safetensors fusionados, sin variantes GGUF/AWQ/GPTQ declaradas |
| Idiomas soportados | No disponible en la model card; la base Qwen2.5 es multilingue, pero el ajuste esta orientado a la tarea de network-admin del dataset |
| Licencia | No disponible; el autor no declara licencia (la base Qwen2.5-0.5B-Instruct se publica bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA fusionado en los pesos base) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y atencion por consultas agrupadas (GQA). Sobre esa base se aplico un adaptador LoRA con r=32, alpha=32, dropout=0.05 y 7 modulos objetivo, entrenado con TRL `SFTTrainer` en fp16, con `assistant_only_loss`, token EOS `<|im_end|>`, `max_length=3072`, 2 epochs, learning rate 2e-4 con scheduler coseno y batch efectivo de 16 (seed 42). El mejor checkpoint se selecciono por `eval_loss` con `load_best_model_at_end`. Posteriormente el adaptador se fusiono en los pesos base, de ahi el sufijo `-merged`.

El dataset de entrenamiento es `banhcarrot/networkadminquestion`, con 1,8K filas de train, 71 de validacion y 144 de test (el autor indica que el test se uso una sola vez). No se documenta el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO. Tampoco se describe ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal, etc.); la unica particularidad tecnica es el formato de salida, que obliga a producir un JSON con tres campos (decision, llamada a herramienta y codigo de motivo).

## Capacidades

- Generacion de texto condicionada a plantilla de chat, con salida en JSON estructurado para tareas de decision de network-admin.
- Clasificacion de decision: exactitud del 82,6 % en el split de test publicado.
- Llamada a herramienta (tool calling): 73,6 % de exactitud sobre las 106 filas que requieren llamada.
- Codigo de motivo para respuestas de rechazo o aclaracion: 38,5 % de exactitud sobre 26 filas.
- Cumplimiento estricto de los tres campos simultaneamente: 61,1 % sobre el test completo.
- Tasa de parseo JSON del 100,0 % con decodificacion greedy, es decir, el modelo no rompe el formato de salida en la muestra evaluada.
- Capacidades multilingues: no documentadas para este derivado.
- Vision, audio, thinking mode, agentes multi-paso o razonamiento largo: no documentados; el autor indica explicitamente que el modelo es especializado y no apto para tareas generales.

## Casos de uso

- Clasificacion de incidencias de red con salida JSON: el modelo recibe un enunciado de problema y devuelve un objeto con la decision, la herramienta a invocar y el motivo, lo que permite integrarlo como paso de triaje en un pipeline de operaciones.
- Enrutado de tickets hacia runbooks: dado un ticket, el modelo selecciona la herramienta o procedimiento concreto con un 73,6 % de exactitud en la muestra publicada, suficiente para generar una propuesta que un humano revise antes de ejecutar.
- Preprocesado de peticiones para un agente mayor: al producir siempre JSON valido (100,0 % de parseo en el test), puede actuar como extractor de intencion antes de un modelo mayor o de un orquestador tipo LangChain.
- Deteccion de peticiones que requieren rechazo o aclaracion: la rama de codigos de motivo (`refuse`/`clarify`) permite filtrar consultas ambiguas o fuera de alcance, aunque con una exactitud baja del 38,5 %, por lo que conviene usarla con umbrales conservadores y supervision humana.
- Prototipado y validacion de pipelines de function calling en local: con 494M de parametros cabe en una GPU de consumo, lo que permite iterar sobre el formato de herramientas y el esquema JSON sin coste de API.
- Evaluacion comparativa de tecnicas de SFT/LoRA: sirve como caso de referencia reproducible (hiperparametros, dataset y metricas publicados) para medir el efecto de LoRA r=32 fusionado sobre una base de 0,5B.
- Asistente interno de documentacion de red con respuestas estructuradas: puede generar la accion recomendada en un formato consumible por sistemas de automatizacion, siempre que el dominio coincida con el del dataset de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de test (144 filas, decodificacion greedy). No hay comparaciones con otros modelos en la informacion disponible.

| Metrica | Valor | Filas evaluadas |
|---|---|---|
| JSON parse rate | 100,0 % | 144 |
| Decision accuracy | 82,6 % | 144 |
| Tool accuracy (call) | 73,6 % | 106 |
| Reason code accuracy (refuse/clarify) | 38,5 % | 26 |
| Strict (los 3 campos correctos) | 61,1 % | 144 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1 GB solo para pesos (494M x 2 bytes), mas cache KV y activaciones.
- VRAM estimada en 8 bits: aproximadamente 0,5 GB de pesos; en 4 bits, aproximadamente 0,3 GB (estimaciones, ya que no se publican cuantizaciones oficiales).
- Cache KV estimada a partir de la configuracion publica de la base Qwen2.5-0.5B (24 capas, 2 cabezas KV, head_dim 64): unos 12 KB por token, es decir, aproximadamente 36 MB a 3.072 tokens y en torno a 380 MB si se agota el contexto de 32.768 tokens.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente en fp16 o cuantizado; A100 y H100 no aportan ventaja para este tamano.
- Cabe en CPU: la inferencia en CPU es viable en fp32/GGUF, aunque no se documentan velocidades.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (es un modelo fusionado, no requiere PEFT); vLLM y TGI son compatibles con la arquitectura Qwen2, aunque no hay configuraciones publicadas por el autor; llama.cpp y Ollama requeririan una conversion a GGUF que el repositorio no incluye.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-0.5b-networkadmin-sft-merged | 494.032.768 | 32.768 (heredado) | Decision network-admin en JSON | No disponible | HuggingFace, 35 descargas |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,49B | 32.768 | Proposito general, chat e instrucciones | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,54B | 32.768 | Proposito general, mejor razonamiento y codigo | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Qwen/Qwen2.5-0.5B | ~0,49B | 32.768 | Modelo base sin ajuste a instrucciones | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmark comparables entre estos modelos y el ajuste de `banhcarrot` en la tarea de network-admin, ya que el autor no publica una linea base del modelo original sobre el mismo test.

## Limitaciones y advertencias

- Modelo especializado: el propio autor advierte que esta disenado para la tarea de decision JSON de network-admin y que no debe usarse para tareas generales.
- Olvido catastrofico no medido: no se ha evaluado la perdida de conocimiento general tras el ajuste, por lo que su comportamiento fuera del dominio es impredecible.
- Evaluacion limitada: los resultados provienen de decodificacion greedy sobre 144 filas y no hay evaluacion humana ampliada ni intervalos de confianza.
- Rendimiento desigual por campo: la exactitud en codigos de motivo es del 38,5 %, muy por debajo de la exactitud de decision (82,6 %), lo que hace arriesgado automatizar rechazos y aclaraciones sin revision.
- Riesgo de alucinacion: como cualquier modelo de 0,5B, puede generar llamadas a herramientas plausibles pero inexistentes o argumentos incorrectos; la validacion del esquema JSON no garantiza que el contenido sea correcto.
- Sesgos conocidos: no documentados por el autor.
- Limitaciones de idioma y contexto: la model card esta redactada en vietnamita y no se especifica la composicion idiomatica del dataset; ademas, el entrenamiento se hizo con `max_length=3072`, por lo que el rendimiento mas alla de esa longitud no esta validado.
- Licencia: el repositorio no declara licencia, lo que impide asumir derechos de uso comercial sobre el derivado aunque la base sea Apache 2.0.
- Madurez y soporte: 35 descargas y 0 likes, model card incompleta (el autor indica que sera sobrescrita por un job), sin pipeline declarado ni mantenimiento conocido.
- Produccion: no se documentan latencias, throughput ni pruebas de carga; se recomienda tratarlo como prototipo y no como componente critico sin una evaluacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/banhcarrot/qwen2.5-0.5b-networkadmin-sft-merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/banhcarrot/networkadminquestion
- Libreria de entrenamiento (TRL): https://github.com/huggingface/trl
- Perfil del autor: https://huggingface.co/banhcarrot
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada; la busqueda web no devolvio resultados relacionados con el modelo.
