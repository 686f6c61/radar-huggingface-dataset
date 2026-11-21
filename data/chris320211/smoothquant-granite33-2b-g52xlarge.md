# chris320211/smoothquant-granite33-2b-g52xlarge

## Resumen

SmoothQuant granite33-2b g52xlarge es un artefacto de cuantizacion derivado de `ibm-granite/granite-3.3-2b-instruct`, publicado por el usuario `chris320211` bajo el ecosistema QuantPort. Aplica la tecnica SmoothQuant (cuantizacion W8A8, pesos y activaciones a 8 bits) sobre el modelo instruct de IBM, con el objetivo de reducir el uso de VRAM y aumentar el throughput de inferencia sin degradar de forma apreciable la calidad. Segun las metricas reportadas en la model card, la perplejidad en WikiText-2 pasa de 7,715887 (fp16) a 7,762474 (cuantizado), una relacion de 1,006038, mientras que el pico de VRAM baja de 5,641 GB a 3,377 GB y el throughput sube de 7.184,6 a 9.501,7 tokens/s en prefill de 2048 tokens sobre una NVIDIA A10G.

El modelo base, Granite 3.3 2B Instruct, es un transformer decoder-only de 2.000 millones de parametros desarrollado por IBM, orientado a generacion de texto, conversacion y tareas de instrucciones, con licencia Apache 2.0. Este derivado hereda esa licencia y anade la del repositorio del metodo de cuantizacion. La relevancia actual del artefacto es doble: por un lado, documenta un flujo reproducible de cuantizacion W8A8 sobre un modelo instruct pequeno; por otro, sirve como referencia de metricas de calidad y rendimiento para quienes evaluan tecnicas de cuantizacion post-entrenamiento en hardware de gama media.

Es fundamental advertir que este repositorio no contiene los pesos cuantizados. El fichero `packed_w8a8.pt` no se incluyo en la subida original y el artefacto original ya no es accesible. El repositorio solo incluye configuracion, tokenizer, script de carga (`quant_agent_inference_adapter.py`) y las metricas de WikiText-2 del run original. Por tanto, no puede cargarse tal cual: para reproducirlo hay que ejecutar la herramienta `quant-agent` con el comando indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Granite 3.3 2B Instruct); cuantizacion SmoothQuant W8A8 |
| Parametros totales | 2.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | W8A8 (pesos y activaciones a 8 bits) mediante SmoothQuant; artefacto empaquetado `packed_w8a8.pt` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base) mas licencia del repositorio del metodo |
| Formato de pesos | artefacto empaquetado `.pt` (`packed_w8a8.pt`), no safetensors ni GGUF; no es un checkpoint `AutoModelForCausalLM` |
| Modelo base | ibm-granite/granite-3.3-2b-instruct |
| Job de cuantizacion | 20260920T012426Z-d2f5c6 |
| Hardware de referencia | NVIDIA A10G (instancia g5.2xlarge) |
| Libreria | transformers (con adaptador de carga propio) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 2.000 millones de parametros de la familia Granite 3.3 de IBM, afinado para instrucciones y conversacion. Sobre el se aplica SmoothQuant, una tecnica de cuantizacion post-entrenamiento que migra la dificultad de cuantizacion de las activaciones hacia los pesos mediante un factor de escala por canal, permitiendo representar tanto pesos como activaciones en INT8 (W8A8) y acelerar la inferencia en GPUs con soporte de kernels enteros. El artefacto resultante no es un checkpoint estandar de Hugging Face, sino un paquete de runtime generado por QuantPort y cargado mediante un adaptador especifico.

No se dispone de informacion sobre el dataset de calibracion, el numero de muestras usadas ni los hiperparametros de SmoothQuant empleados en este run. La unica evaluacion documentada es la de WikiText-2 (split de test, ventanas de 2048 tokens, 65.504 tokens), comparada contra el snapshot fp16 original. El autor reporta `quality_ok=True` con una relacion de perplejidad de 1,006038, ademas de mejoras en throughput y VRAM. No se mencionan etapas de RLHF, DPO ni reentrenamiento adicional: la intervencion es puramente de cuantizacion.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo instruct base.
- Seguimiento de instrucciones y respuesta a prompts conversacionales.
- Razonamiento basico y tareas de conocimiento general propias de un modelo de 2B.
- Generacion de codigo y matematicas a nivel de modelo pequeno (no se aportan evaluaciones especificas en este artefacto).
- Inferencia cuantizada W8A8 con mayor throughput y menor huella de VRAM que el fp16 equivalente.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para este derivado.
- Modo thinking, vision o audio: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).

## Casos de uso

- Evaluacion de tecnicas de cuantizacion: usar este artefacto como referencia reproducible para comparar SmoothQuant W8A8 frente a fp16 en perplejidad, VRAM y throughput sobre WikiText-2, con las cifras ya publicadas como linea base.
- Despliegue en GPU de gama media con VRAM limitada: el pico de 3,377 GB en A10G permite servir el modelo en tarjetas de 8-12 GB junto con el resto del stack, algo mas ajustado en fp16 (5,641 GB).
- Servicio de chat ligero: al ser un derivado instruct de 2B, encaja en asistentes conversacionales de bajo coste donde la latencia y el coste por token importan mas que el rendimiento en tareas complejas.
- Procesamiento por lotes de texto: el throughput de 9.501,7 tokens/s en prefill de 2048 tokens sobre A10G lo hace util para clasificacion, resumen o extraccion sobre volumenes moderados de documentos.
- Pipeline de cuantizacion automatizada: sirve como ejemplo de integracion de QuantPort y `quant-agent` en flujos de CI que generen y validen variantes cuantizadas de modelos abiertos.
- Investigacion sobre degradacion por cuantizacion: la metrica `ppl_ratio` de 1,006038 permite estudiar el impacto de W8A8 en modelos de 2B y calibrar umbrales de aceptacion en produccion.
- Prototipado en entornos con presupuesto de GPU ajustado: permite iterar sobre prompts y plantillas de chat sin reservar instancias grandes, antes de pasar a un modelo mayor.

## Benchmarks y rendimiento

Evaluacion en WikiText-2 (test, ventanas de 2048 tokens, 65.504 tokens) sobre NVIDIA A10G (g5.2xlarge), segun `jobs/20260920T012426Z-d2f5c6/benchmark.json`:

| Metrica | Cuantizado | fp16 (snapshot) |
|---|---:|---:|
| Perplejidad | 7,762474 | 7,715887 |
| NLL loss | 2,049301 | 2,043281 |
| Tokens/s (prefill 2048, tras warmup) | 9.501,7 | 7.184,6 |
| Pico de VRAM (GB) | 3,377 | 5,641 |
| Relacion de perplejidad (`ppl_ratio`) | 1,006038 | 1,000000 (referencia) |

Indicadores del run: `quality_ok=True`, `improved_throughput=True`, `improved_vram=True`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en inferencia: 3,377 GB de pico medido en A10G para el artefacto cuantizado W8A8; 5,641 GB para el snapshot fp16 de referencia.
- GPU de referencia: NVIDIA A10G (24 GB) en instancia AWS g5.2xlarge.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores), aunque no se aportan mediciones en estas GPUs.
- GPUs de datacenter recomendadas: A10G, L4, A100, H100; la aceleracion W8A8 depende de kernels enteros disponibles en la GPU.
- Opciones de despliegue: no es compatible con `AutoModelForCausalLM.from_pretrained`, vLLM, llama.cpp, Ollama ni TGI de forma directa; requiere el adaptador `quant_agent_inference_adapter.py` y el repositorio del metodo en `QUANT_AGENT_METHOD_REPO`.
- Latencia y throughput: 9.501,7 tokens/s en prefill de 2048 tokens sobre A10G (medido tras warmup); no se reportan cifras de decodificacion ni latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| SmoothQuant granite33-2b g52xlarge (este) | 2B | no disponible | W8A8 SmoothQuant | apache-2.0 | No: pesos no incluidos, solo config y metricas |
| ibm-granite/granite-3.3-2b-instruct | 2B | no disponible en esta ficha | fp16 nativo | apache-2.0 | Si, checkpoint completo en Hugging Face |
| Alternativas cuantizadas W8A8 de modelos 2B | ~2B | no disponible | W8A8 | variable | no disponible |

La comparacion relevante es contra el modelo base sin cuantizar: este derivado mejora throughput (+32,2 % en tokens/s) y reduce VRAM (-40,1 %) a costa de un incremento de perplejidad del 0,6 %. No se dispone de datos de benchmarks de tareas para comparar con otros modelos de 2B.

## Limitaciones y advertencias

- Los pesos cuantizados no estan disponibles: el repositorio no puede cargarse tal cual y solo contiene configuracion, tokenizer, adaptador y metricas.
- No es un checkpoint estandar de transformers: no funciona con `from_pretrained`, vLLM, llama.cpp, Ollama ni TGI sin trabajo adicional.
- La reproducibilidad depende de `quant-agent` y del repositorio del metodo QuantPort, cuyo estado y version no se detallan.
- La evaluacion se limita a perplejidad y NLL en WikiText-2; no hay benchmarks de tareas (MMLU, HumanEval, GSM8K) ni evaluaciones de seguridad o sesgos.
- Riesgo de alucinacion inherente a un modelo de 2B; la cuantizacion puede amplificar errores en tareas sensibles a la precision numerica.
- Idiomas soportados no declarados; el comportamiento multilingue no esta verificado.
- Longitud de contexto no documentada en este artefacto; conviene consultar la del modelo base antes de usarlo en conversaciones largas.
- Uso comercial permitido por Apache 2.0, pero sujeto tambien a la licencia del repositorio del metodo; conservar `LICENSE` y `NOTICE.md` del snapshot cuando existan.
- Sin likes ni validacion de la comunidad (0 likes, 824 descargas); tratar las metricas como reportadas por el autor y no verificadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chris320211/smoothquant-granite33-2b-g52xlarge
- Modelo base: https://huggingface.co/ibm-granite/granite-3.3-2b-instruct
- Repositorio QuantPort: https://github.com/chris320211/QuantPort
- Herramienta quant-agent: https://github.com/chris320211/model-quantization-agent
