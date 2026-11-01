# fbaldassarri/meta-llama_Llama-3.1-8B-auto_round-int8-gs64-sym

## Resumen

Este repositorio contiene una version cuantizada a INT8 del modelo Llama 3.1 8B de Meta, generada por el usuario fbaldassarri mediante la herramienta Intel AutoRound v0.16.0. Se trata de una cuantizacion de solo pesos (WoQ, weights-only quantization) con 8 bits, tamano de grupo 64 y esquema simetrico, aplicada sobre el checkpoint original `meta-llama/Llama-3.1-8B`. El objetivo es reducir el coste de memoria y acelerar la inferencia en hardware Intel, concretamente CPU, iGPU Arc y NPU (AI Boost en la serie Core Ultra) mediante intel-extension-for-pytorch y OpenVINO.

Llama 3.1 8B es un transformer decoder-only denso con 8.000 millones de parametros teoricos, ventana de contexto de 128.000 tokens y soporte para ocho idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes). Esta version es un modelo base, no instruido, por lo que se usa mediante completion de texto sin plantilla de chat.

La relevancia de este artefacto es practica: demuestra un flujo reproducible de cuantizacion INT8 sobre un modelo abierto de referencia, con receta de replicacion documentada y condiciones de ejecucion registradas. La ficha tecnica del repositorio indica `inference: false`, sin embargo la model card incluye codigo de uso con transformers; conviene validar el funcionamiento real antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia Llama 3.1), densa |
| Parametros totales | 2.932.084.736 segun safetensors del repo; el modelo base declara 8B (la discrepancia sugiere que el conteo refleja los tensores empaquetados en INT8 o un subconjunto del checkpoint) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Llama 3.1 8B; no se documenta verificacion tras la cuantizacion |
| Tipos de cuantizacion | INT8, solo pesos (WoQ), grupo 64, simetrica, metodo SignRound (AutoRound) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (formato `auto_round`), libreria transformers |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only causal de la familia Llama 3.1, con atencion por grupos (GQA) y tokenizador BPE de 128.256 entradas en el checkpoint original de Meta. No se dispone de detalles adicionales sobre la composicion del dataset de preentrenamiento ni sobre fases de RLHF o DPO en la informacion proporcionada; el modelo es un checkpoint base sin ajuste por instrucciones.

La innovacion de este artefacto es el proceso de cuantizacion. Intel AutoRound aplica busqueda de redondeo por capas (algoritmo SignRound) con calibracion sobre 128 muestras de 512 tokens, 200 iteraciones de ajuste y tamano de lote 4, partiendo de pesos en bfloat16 y ejecutando la calibracion en CPU. La ejecucion completa tardo aproximadamente 41.800 segundos (unas 11,6 horas). El resultado son pesos INT8 con escala simetrica por grupo de 64, orientados a inferencia en CPU Intel, iGPU Arc y NPU mediante intel-extension-for-pytorch y OpenVINO.

## Capacidades

- Generacion de texto autoregresiva y completion de texto sin instrucciones (modelo base, no chat).
- Razonamiento y conocimiento general heredados del checkpoint Llama 3.1 8B original.
- Generacion de codigo y resolucion de problemas matematicos basicos, segun las capacidades del modelo base.
- Multilingue en ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- No se documenta soporte de tool calling ni function calling en este artefacto.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de vision, audio ni modo de pensamiento extendido.
- Inferencia optimizada para CPU Intel, iGPU Arc y NPU Core Ultra.

## Casos de uso

- Despliegue en portatiles y equipos de sobremesa con CPU Intel sin GPU dedicada: la cuantizacion INT8 con intel-extension-for-pytorch permite ejecutar un modelo de 8B en memoria de sistema, lo que habilita asistentes de texto locales en hardware de consumo.
- Aceleracion en iGPU Intel Arc (por ejemplo Core Ultra 185H): la receta documenta el modo `--intel-xpu`, util para prototipos de generacion de texto con mayor throughput que en CPU pura.
- Inferencia en NPU de la serie Core Ultra mediante OpenVINO: adecuado para aplicaciones de escritorio con requisitos de baja latencia y bajo consumo energetico, como autocompletado o resumen de documentos.
- Generacion de texto por lotes en servidores CPU: al ser un modelo base, encaja en tareas de completion, reescritura o expansion de texto donde no se requiere seguir instrucciones.
- Experimentacion academica con cuantizacion: sirve como referencia para comparar AutoRound INT8 frente a otras tecnicas (GPTQ, AWQ, bitsandbytes) sobre el mismo checkpoint base.
- Base para ajuste fino posterior o para destilacion: al conservar la estructura de Llama 3.1, puede reutilizarse como punto de partida en flujos de investigacion que necesiten un modelo cuantizado de bajo coste.
- Traduccion y procesamiento multilingue basico entre los ocho idiomas soportados, siempre que se formule como completion y no como instruccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria estimada: el repositorio ocupa 11,5 GB, coherente con pesos INT8 mas escalas y metadatos; se recomienda al menos 12-16 GB de memoria disponible para cargar el modelo completo con overhead de runtime.
- GPU recomendadas: no se documentan; el artefacto esta orientado a CPU Intel, iGPU Arc y NPU Core Ultra, no a GPU NVIDIA o AMD.
- Cabe en hardware de consumo: si, en equipos con suficiente RAM de sistema (16 GB o mas) y CPU Intel moderna; tambien en iGPU Arc y NPU Core Ultra.
- Opciones de despliegue: transformers con `device_map="auto"`, intel-extension-for-pytorch, OpenVINO. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (Llama 3.1 8B AutoRound INT8) | 8B (base) | 128.000 | INT8 WoQ, grupo 64, simetrica | Llama 3.1 Community | HuggingFace, 21 descargas |
| meta-llama/Llama-3.1-8B (original) | 8B | 128.000 | bfloat16 | Llama 3.1 Community | HuggingFace, ampliamente usado |
| Mistral 7B | 7B | 32.000 | bfloat16 y variantes cuantizadas | Apache 2.0 | HuggingFace |
| Qwen2.5 7B | 7B | 128.000 | bfloat16 y variantes cuantizadas | Apache 2.0 (mayoria de variantes) | HuggingFace |

No se dispone de datos de rendimiento comparativo para este artefacto concreto.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes de chat de forma fiable; requiere prompts de completion.
- La model card marca `inference: false` pese a incluir codigo de uso; verificar el funcionamiento real antes de desplegar.
- Discrepancia entre los 8B declarados del modelo base y los 2.932.084.736 parametros reportados en safetensors; conviene auditar el checkpoint.
- La cuantizacion INT8 puede degradar ligeramente la calidad respecto al checkpoint en bfloat16; no se han publicado evaluaciones que lo cuantifiquen.
- Riesgo de alucinacion y sesgos heredados del modelo base de Meta, sin mitigaciones adicionales documentadas.
- La calibracion se realizo en CPU con 128 muestras; el rendimiento puede diferir en otros dominios o idiomas distintos del ingles.
- Restricciones de la Llama 3.1 Community License: uso comercial permitido con condiciones (incluida la clausula de licencia para despliegues a gran escala); revisar el texto completo antes de produccion.
- El autor declara que el modelo se desarrollo solo con fines de investigacion y sin garantias.
- No se confirma soporte en ecosistemas de inferencia de alto rendimiento como vLLM o TGI.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.1-8B-auto_round-int8-gs64-sym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Pipeline de cuantizacion referenciado: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
