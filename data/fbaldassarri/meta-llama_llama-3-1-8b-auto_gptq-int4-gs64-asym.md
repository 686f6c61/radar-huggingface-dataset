# fbaldassarri/meta-llama_Llama-3.1-8B-auto_gptq-int4-gs64-asym

## Resumen

Esta ficha describe `fbaldassarri/meta-llama_Llama-3.1-8B-auto_gptq-int4-gs64-asym`, una cuantizacion de 4 bits del modelo base `meta-llama/Llama-3.1-8B` de Meta, publicada por el usuario fbaldassarri. El artefacto se ha generado con Intel AutoRound v0.16.0 empleando el algoritmo AutoGPTQ en modo *weights-only quantization* (WoQ), con 4 bits, tamano de grupo 64 y cuantizacion asimetrica. El objetivo es reducir la huella de memoria y acelerar la inferencia (el autor afirma entre 2 y 3 veces de *speedup*) manteniendo una perdida de precision calificada como "ligera" en la configuracion W4G64.

El modelo hereda la arquitectura y las capacidades del Llama 3.1 8B original: un transformer decoder-only denso, con 8.030 millones de parametros teoricos y una ventana de contexto de 128.000 tokens en su version sin cuantizar. No obstante, el repositorio publicado declara un total de 2.047.283.200 parametros en el fichero safetensors, un dato que resulta inconsistente con el modelo base y que conviene tratar con cautela. El autor indica explicitamente que esta pensado para inferencia en CPU Intel, iGPU Intel Arc (mediante intel-extension-for-pytorch) y NPU Intel (AI Boost en la serie Core Ultra) a traves de OpenVINO.

La relevancia de esta ficha radica en que se trata de un artefacto de cuantizacion, no de un modelo nuevo: su valor depende de la fidelidad respecto al Llama 3.1 8B original y de la disponibilidad de herramientas compatibles (transformers, GPTQ, vLLM, TGI). Con solo 21 descargas y 0 *likes*, es un repositorio de nicho y poca validacion comunitaria, por lo que debe evaluarse con precaucion antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Llama 3.1), denso |
| Parametros totales | 2.047.283.200 (segun safetensors del repo; el modelo base declara 8.030 millones, dato inconsistente) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 8B soporta 128.000 tokens) |
| Tipos de cuantizacion | INT4, GPTQ (AutoGPTQ), group size 64, asimetrica (sym=false), WoQ |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (transformers), compatible con GPTQ/AutoGPTQ |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo original fue preentrenado por Meta sobre un corpus multilingue de gran escala y posteriormente alineado mediante tecnicas de instruccion y preferencias (SFT y DPO/RLHF, segun la documentacion publica de Meta). Esta version no introduce cambios arquitectonicos: solo modifica la representacion numerica de los pesos.

El proceso de cuantizacion se ejecuto con Intel AutoRound v0.16.0 sobre `torch.bfloat16`, en dispositivo CPU, con 128 muestras de calibracion, 200 iteraciones de ajuste, longitud de secuencia 512 y batch size 4. La duracion registrada fue de 40.453 segundos (674,2 minutos). El resultado es un checkpoint GPTQ de 4 bits con grupo de 64 y esquema asimetrico, guardado en formato safetensors y cargable con `transformers`. No se documenta en la informacion disponible ningun proceso de evaluacion de la degradacion de calidad respecto al modelo original.

## Capacidades

- Generacion de texto autoregresiva en ocho idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes), heredadas del modelo base.
- Modelo de tipo *base/completion*: el autor indica explicitamente que debe usarse con prompts de texto crudo, sin plantilla de chat ni instrucciones de sistema.
- Razonamiento general y conocimiento factual correspondientes a Llama 3.1 8B.
- Generacion de codigo y capacidad matematica basica, en la medida en que el modelo base las soporta.
- Soporte de tool calling y function calling: no disponible en esta version cuantizada tal como se publica; el autor no documenta plantilla de herramientas y lo etiqueta como modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este artefacto.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo *thinking* explicito: no disponible.

## Casos de uso

- Despliegue en CPU Intel para prototipos y demos: el autor indica que el checkpoint esta optimizado para inferencia en CPU Intel mediante intel-extension-for-pytorch, lo que permite ejecutar un Llama 3.1 8B cuantizado en equipos sin GPU dedicada.
- Inferencia en iGPU Intel Arc: pensado para portatiles y mini-PC con graficos integrados Arc (por ejemplo, Core Ultra), donde el modelo cabe en memoria compartida y ofrece latencia aceptable para generacion de texto interactiva.
- Ejecucion en NPU Intel AI Boost: orientado a la serie Core Ultra, permite descargar la inferencia a la NPU via OpenVINO y reducir el consumo energetico en tareas de generacion continua.
- Generacion de texto por lotes en servidores sin acelerador: al reducir la huella a 4 bits, permite procesar volumenes moderados de texto en infraestructura CPU convencional.
- Fine-tuning ligero o evaluacion de tecnicas de cuantizacion: util como referencia reproducible para comparar la calidad de W4G64 frente al modelo original en tareas de *benchmarking* interno.
- Prototipado de asistentes de completado de texto: al ser un modelo base, encaja en escenarios de autocompletado, resumen o reescritura donde no se requiere seguir instrucciones estrictas.
- Educacion e investigacion: permite estudiar el impacto de la cuantizacion GPTQ asimetrica en un modelo de referencia ampliamente conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo afirma un *speedup* de 2 a 3 veces y una "ligera" caida de precision en W4G64, sin cifras concretas ni comparaciones medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en INT4 (pesos de 4 bits mas overhead de activaciones y cache KV), aunque no se proporciona una cifra oficial en la informacion disponible.
- GPU recomendadas: el autor orienta el artefacto a CPU Intel, iGPU Intel Arc y NPU Intel AI Boost; no menciona GPU NVIDIA o AMD como objetivo principal, aunque el formato GPTQ es compatible con CUDA.
- Cabe en GPU de consumo: si, en teoria, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070), siempre que se use un runtime GPTQ compatible; no verificado por el autor.
- Opciones de despliegue: transformers con AutoGPTQ, text-generation-inference (TGI, etiquetado en el repo), intel-extension-for-pytorch, OpenVINO; llama.cpp y Ollama no se mencionan y requeririan conversion a GGUF.
- Latencia y throughput: no disponibles; el autor solo declara un *speedup* de 2-3 veces sin especificar hardware ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/meta-llama_Llama-3.1-8B-auto_gptq-int4-gs64-asym | 2.047 millones declarados (base: 8.030 millones) | no disponible (base: 128.000) | INT4 GPTQ gs64 asim | Llama 3.1 Community | HuggingFace, 21 descargas |
| meta-llama/Llama-3.1-8B | 8.030 millones | 128.000 | BF16 original | Llama 3.1 Community | HuggingFace, ampliamente usado |
| Otras cuantizaciones INT4 de Llama 3.1 8B (p. ej. GPTQ/AWQ de la comunidad) | 8.030 millones (pesos INT4) | 128.000 | INT4 GPTQ/AWQ | Llama 3.1 Community | Multiples repos en HuggingFace |
| Llama 3.1 8B Instruct | 8.030 millones | 128.000 | BF16 original | Llama 3.1 Community | HuggingFace, orientado a chat |

## Limitaciones y advertencias

- Inconsistencia en el numero de parametros: el safetensors declara 2.047.283.200 parametros frente a los 8.030 millones del modelo base; conviene verificar la integridad del checkpoint antes de usarlo.
- Modelo base, no instruct: no sigue instrucciones ni plantillas de chat; usarlo como asistente conversacional producira resultados pobres.
- Perdida de calidad por cuantizacion: el autor reconoce una caida de precision en W4G64, aunque no la cuantifica; no hay evaluacion publicada.
- Riesgo de alucinacion: inherente al modelo base Llama 3.1 8B, agravado potencialmente por la cuantizacion.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Llama 3.1; no se documenta ninguna mitigacion adicional.
- Licencia Llama 3.1 Community: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales), obligacion de atribucion y politicas de uso aceptable; revisar antes de desplegar en produccion.
- Poca validacion comunitaria: 21 descargas y 0 *likes*; no hay pruebas independientes de calidad ni de estabilidad.
- Compatibilidad limitada: el autor lo orienta a CPU/iGPU/NPU Intel; en GPU NVIDIA o AMD el rendimiento puede no ser el esperado sin ajustes.
- Sin garantia: el autor declara que el modelo se ofrece "sin garantia" y solo con fines de investigacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.1-8B-auto_gptq-int4-gs64-asym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de cuantizacion citado por el autor: https://git.epicdynamic.com/auto-round-pipeline
