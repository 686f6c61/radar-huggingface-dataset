# milkshake721/Gemma-4-26B-A4B-HybridAgent

## Resumen

Gemma-4-26B-A4B-HybridAgent es un ajuste fino del modelo google/gemma-4-26B-A4B (arquitectura Mixture-of-Experts con 25,81 mil millones de parametros totales y aproximadamente 4,0 mil millones activos por token) desarrollado por el usuario milkshake721. El modelo adapta la arquitectura HybridAgent descrita en el paper arXiv:2610.18861 (Stanford / Together AI) a la familia Gemma 4 MoE, incorporando un puente residual ligero denominado HybridLink que permite al modelo razonar en espacio latente continuo en lugar de verbalizar cada token intermedio de razonamiento en texto.

La innovacion principal es el modo de razonamiento hibrido: el modelo alterna entre pensamiento latente puro (delimitado por los anclajes `<latent>` y `</latent>`, con token_id 262144 y 262145 respectivamente) y acciones en texto explicito mediante etiquetas `<think>`, `<python>` y `<search>`. Esto preserva la memoria de trabajo KV multi-turno y ofrece interpretabilidad de caja blanca sobre el razonamiento latente, algo que los modelos de razonamiento convencionales no permiten al operar solo sobre tokens discretos.

Es relevante porque combina un modelo base de pesos abiertos con licencia Gemma, un mecanismo de razonamiento latente poco habitual en modelos publicos y soporte de herramientas (ejecucion de Python y busqueda web via Tavily). El repositorio incluye un paquete propio (`hybrid_agent`) con motores de inferencia especializados, ya que el modelo no funciona correctamente con el bucle `generate()` estandar de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con puente residual HybridLink para razonamiento latente; 30 capas MoE |
| Parametros totales | 25.805.945.136 (25,81 B) |
| Parametros activos | Aproximadamente 4,0 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (modelo principal); W4A16 disponible en la edicion 4-bit separada |
| Idiomas soportados | en, zh (segun model card) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors, bf16; adaptadores en `adapter.pt` / `hybridlink.pt` (formato HybridLink, no PEFT) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-26B-A4B, un transformer Mixture-of-Experts con 30 capas MoE y enrutamiento disperso que activa aproximadamente 4,0 B de parametros por token sobre un total de 25,81 B. Sobre esta base se anade HybridLink, un adaptador residual ligero de tipo `ln_res_adapter` que transforma los estados ocultos de la ultima capa ($h_t$) en vectores continuos que se realimentan al decodificador, escalados por el `embed_scale` de Gemma 4 ($\sqrt{2816} \approx 53{,}0660$). La generacion latente se detiene cuando la lectura por coseno del token mas cercano alcanza el ancla `</latent>` (token_id 262145).

El ajuste fino se realizo sobre el dataset togethercomputer/HybridAgent-HybridSFT-v2, siguiendo el esquema de la arquitectura HybridAgent de arXiv:2610.18861. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. Entre las innovaciones tecnicas destacan el razonamiento en espacio latente continuo con interpretabilidad de caja blanca, la aceleracion opcional mediante TensorRT (compilacion del puente HybridLink a un `ICudaEngine` nativo, sustitucion del forward de expertos por una ruta rapida batched zero-sync y fusion de las 330 llamadas a `Gemma4RMSNorm` por paso con `F.rms_norm` en C++) y el soporte de herramientas Python y busqueda web en un bucle multi-turno con memoria KV persistente.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso.
- Razonamiento latente continuo mediante `<latent>...</latent>`, con hasta 64 pasos latentes configurables (`max_latent_steps`).
- Modo de pensamiento explicito en texto mediante `<think>...</think>`.
- Ejecucion de codigo Python en linea mediante `<python>...</python>` con `build_tool_executor`.
- Busqueda web en vivo mediante `<search>...</search>` (requiere `TAVILY_API_KEY` de Tavily).
- Soporte de agentes con memoria de trabajo KV multi-turno en modo lockstep (`HybridGenerationEngine`).
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- Interpretabilidad de caja blanca del razonamiento latente (lectura por token mas cercano).
- Razonamiento matematico y resolucion de problemas algebraicos y geometricos.

## Casos de uso

- Resolucion de problemas matematicos paso a paso: el modelo puede alternar razonamiento latente y verificacion explicita en `<think>`, util para tutoria automatizada o generacion de soluciones verificables en plataformas educativas.
- Agentes de codigo con ejecucion real: mediante `<python>` el modelo escribe y ejecuta codigo en el mismo bucle de generacion, adecuado para pipelines de analisis de datos o automatizacion de tareas computacionales.
- Investigacion asistida con busqueda web: la etiqueta `<search>` con backend Tavily permite construir asistentes que consultan informacion actualizada y razonan sobre los resultados en espacio latente antes de responder.
- Analisis de razonamiento de modelos: la interpretabilidad latente permite a investigadores inspeccionar las trayectorias internas de decision, util para estudios de alineacion, seguridad y mecanismos internos de los LLM.
- Automatizacion de soporte tecnico multi-turno: el motor `HybridGenerationEngine` mantiene memoria KV entre turnos, lo que facilita conversaciones largas con contexto acumulado y llamadas a herramientas intermedias.
- Evaluacion comparativa de paradigmas de razonamiento: sirve como banco de pruebas para comparar razonamiento latente frente a razonamiento verbalizado en tareas de matematicas y codigo, con metricas de precision y latencia.
- Despliegue en produccion con latencia controlada: la ruta TensorRT y la edicion 4-bit (19 GB de VRAM, 60,2 tok/s) permiten servir el modelo en GPUs de consumo para prototipos y entornos de demo.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son mediciones de rendimiento de inferencia y una prueba interna de 10 preguntas, no benchmarks academicos estandar.

| Configuracion | VRAM asignada | Tiempo de carga | Prefill (180 tok) | Decodificacion por token | Tiempo total 10 preguntas | Precision 10 preguntas |
|---|---|---|---|---|---|---|
| BF16, backend TensorRT | 54,73 GB | 6,0-8,8 s | 313,03 ms | 26,01 ms (38,5 tok/s) | 106,80 s (10,68 s/pregunta) | 10/10 (100%) |
| 4-bit, backend TensorRT | 19,00 GB | 29,69 s | 187,51 ms | 16,62 ms (60,2 tok/s) | 83,65 s (8,36 s/pregunta) | 10/10 (100%) |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 54,73 GB asignados con backend TensorRT; el repositorio ocupa 51,7 GB en disco.
- VRAM estimada en 4-bit (edicion separada): 19,00 GB, apta para GPUs de consumo de 24 GB.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB o configuraciones multi-GPU; no cabe en GPUs de consumo.
- GPU de consumo: la edicion 4-bit cabe en una RTX 4090 (24 GB) con 19,00 GB asignados.
- Opciones de despliegue: paquete propio `hybrid_agent` con `HybridEngine` y `HybridGenerationEngine`; backend TensorRT opcional; runner CLI `sglang_tensorrt_runner.py`. No es compatible con `AutoModelForCausalLM.from_pretrained().generate()` estandar ni con vLLM, llama.cpp, Ollama o TGI segun la informacion disponible.
- Latencia y throughput: 38,5 tok/s en BF16 con TensorRT y 60,2 tok/s en la edicion 4-bit; prefill de 180 tokens en 313,03 ms (BF16) y 187,51 ms (4-bit).

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Razonamiento latente | Despliegue estandar |
|---|---|---|---|---|---|---|
| Gemma-4-26B-A4B-HybridAgent | 25,81 B | ~4,0 B | no disponible | Gemma | Si (HybridLink) | Requiere paquete propio |
| google/gemma-4-26B-A4B (base) | 25,81 B | ~4,0 B | no disponible | Gemma | No | transformers estandar |
| Gemma-4-26B-A4B-HybridAgent-4bit | 25,81 B | ~4,0 B | no disponible | Gemma | Si (HybridLink) | Paquete propio, 19 GB VRAM |

No se dispone de datos de benchmarks academicos que permitan comparar el rendimiento en tareas con el modelo base ni con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo no funciona con el bucle `generate()` estandar de transformers: la recurrencia latente requiere el motor `HybridEngine` o `HybridGenerationEngine` del paquete `hybrid_agent`.
- Si `peft` esta instalado, `AutoModelForCausalLM.from_pretrained()` interpreta erroneamente `adapter_config.json` como configuracion LoRA y lanza un `ValueError`; es obligatorio usar `load_hybrid_agent(...)`.
- Idiomas soportados limitados a ingles y chino; no hay soporte declarado de castellano.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con ventanas largas.
- Riesgo de alucinacion inherente a los modelos generativos; el razonamiento latente no es verificable directamente por el usuario salvo mediante la lectura por token mas cercano.
- La busqueda web requiere una clave de API de Tavily y depende de un servicio externo.
- Licencia Gemma: uso comercial permitido bajo los terminos de Google, con obligaciones de atribucion y restricciones de uso aceptable; conviene revisar los terminos antes de desplegar en produccion.
- El modelo es un ajuste fino de un unico autor con 1 like y 1727 descargas en el momento de la consulta; no hay evidencia de validacion independiente.
- La edicion 4-bit es un repositorio separado y no forma parte de este artefacto.
- El rendimiento medido (10/10 en una prueba interna) no constituye una evaluacion representativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/milkshake721/Gemma-4-26B-A4B-HybridAgent
- Edicion 4-bit: https://huggingface.co/milkshake721/Gemma-4-26B-A4B-HybridAgent-4bit
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Paper HybridAgent: https://arxiv.org/abs/2610.18861
- Repositorio del paquete (rama gemma4): https://github.com/milkshake0721/HybridAgent
- Dataset de ajuste fino: https://huggingface.co/datasets/togethercomputer/HybridAgent-HybridSFT-v2
