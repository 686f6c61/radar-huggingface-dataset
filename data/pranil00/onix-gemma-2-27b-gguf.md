# pranil00/ONIX-gemma-2-27b-GGUF

## Resumen

ONIX-gemma-2-27b-GGUF es una cuantizacion del modelo google/gemma-2-27b publicada por el usuario pranil00 bajo el sello "ONIX Community". Se trata de un artefacto GGUF en formato IQ2_M (2,7 bits por peso) generado con la herramienta run-any-model, un motor de optimizacion adaptativa orientado a ejecutar modelos grandes en hardware de consumo. El modelo base es un transformer denso de la familia Gemma 2 de Google, con 32.763.412.480 parametros, y esta pensado para generacion de texto.

El problema que aborda esta publicacion es puramente de despliegue: reducir un modelo de aproximadamente 64 GB en FP16 a un fichero de 10,81 GB (ratio de compresion 5,93x, reduccion del 83,1%) para que quepa en equipos con 12 GB de VRAM o en Apple Silicon con 16 GB de memoria unificada. El autor declara una retencion de calidad estimada del 82,0% respecto al modelo sin cuantizar y advierte de posible degradacion en razonamiento matematico complejo.

Es relevante ahora porque demuestra el estado actual de las tecnicas de cuantizacion agresiva aplicadas a modelos de ~30B: permiten inferencia local en GPUs de gama consumer, a costa de una perdida de fidelidad notable. La model card es escueta en cuanto a datos de entrenamiento, idiomas o evaluacion formal, y no incluye resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 2; detalles de atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 32.763.412.480 (32,76 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y NVIDIA GPU; 4.096 tokens en CPU (ventana optima segun el autor) |
| Tipos de cuantizacion | IQ2_M (2,7 bits por peso); unico fichero publicado |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (segun metadatos y model card) |
| Formato de pesos | GGUF (`google--gemma-2-27b-IQ2_M.gguf`) |

## Arquitectura y entrenamiento

El artefacto es una conversion GGUF del modelo google/gemma-2-27b, un transformer denso de la familia Gemma 2. La model card no aporta informacion sobre la arquitectura interna (tipo de atencion, uso de atencion local/global alternada, normalizacion) ni sobre el proceso de entrenamiento del modelo base: numero de tokens, composicion del corpus, fases de RLHF o DPO, etc. Toda esa informacion debe consultarse en la model card oficial de google/gemma-2-27b.

La innovacion tecnica de esta publicacion es el pipeline de cuantizacion: run-any-model genera un fichero IQ2_M de 10,81 GB a partir de los ~64,08 GB en FP16, con un buffer de KV cache de 1.024 MB en FP16 y aceleracion de las 64 capas del modelo en Metal. El autor reporta una "retencion de fidelidad cognitiva" estimada del 82,0%, metrica propia sin metodologia publicada, y clasifica el despliegue como "TIGHT FIT" (ajuste justo) en el dispositivo de auditoria (Darwin, 16 GB). No se documentan tecnicas de decodificacion especulativa ni cambios arquitectonicos.

## Capacidades

- Generacion de texto conversacional multi-turno, segun los ejemplos de uso con llama.cpp (`-cnv`) y Ollama.
- Razonamiento general y matematicas: el autor advierte de degradacion menor en razonamiento matematico complejo por la cuantizacion a 2,7 bpw.
- Generacion de codigo: no documentada explicitamente en la model card; heredada del modelo base en la medida en que la cuantizacion la preserve.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible; el pipeline declarado es text-generation.
- Plantilla de chat: la configuracion de Ollama usa los tokens de parada `<|im_end|>` y `<|endoftext|>`, compatibles con el formato de instruccion de Gemma.

## Casos de uso

- Inferencia local en GPU consumer: con 12,31 GB de VRAM dedicada en GPUs RTX 30/40/50, el modelo cabe completo y permite ejecutar un LLM de ~33B en un equipo de sobremesa, algo inviable con los pesos FP16.
- Prototipado en Apple Silicon: con 11,91 GB de memoria unificada y aceleracion Metal nativa en las 64 capas, es adecuado para desarrollo y pruebas en portatiles Mac de 16 GB.
- Chat de terminal y asistentes personales offline: el flujo con `run-any-model run` o `llama-cli -cnv` permite sesiones conversacionales sin conexion, util para entornos con requisitos de privacidad.
- Evaluacion de cuantizacion agresiva: sirve como referencia practica para medir la perdida de calidad de IQ2_M frente a Q4_K_M o Q8_0 en tareas propias, dado que el autor solo aporta una estimacion del 82% de retencion.
- Despliegue en CPU sin GPU: con 13,91 GB de RAM libre y soporte AVX2/AVX-512, permite servir el modelo en servidores sin acelerador, aceptando contexto reducido a 4.096 tokens.
- Integracion en LM Studio, Jan o Text-Generation-WebUI: al ser un GGUF estandar, se puede cargar directamente en estas interfaces para experimentacion rapida sin escribir codigo.
- Educacion e investigacion: permite estudiar el comportamiento de un modelo de 27B cuantizado a 2,7 bits en tareas de comprension y generacion, comparando contra el modelo base.

## Benchmarks y rendimiento

La model card incluye una auditoria de recursos, no de calidad de tarea. Los datos disponibles son:

| Metrica | Baseline (FP16) | Cuantizado (IQ2_M) | Cambio |
|---|---|---|---|
| Precision | 16,0 bits/param | 2,7 bits/param | -83,1% |
| Tamano de pesos | 64,08 GB | 10,81 GB | -83,1% |
| KV cache | 1.024 MB (FP16) | 1.024 MB (FP16) | Optimizado |
| RAM residente total | 65,17 GB | 11,91 GB | -81,7% |
| Calidad estimada | 100,0% baseline | 82,0% retenida | -18,0% |
| Capas aceleradas | 0% (riesgo de crash) | 64/64 | Optimo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La cifra del 82,0% de retencion es una estimacion del autor sin metodologia documentada.

## Requisitos de hardware

- VRAM estimada: 12,31 GB dedicados en NVIDIA GPU; 11,91 GB de memoria unificada en Apple Silicon (M1/M2/M3/M4/M5); 13,91 GB de RAM libre en CPU.
- GPU recomendadas: el autor cita las series RTX 30/40/50 con aceleracion CUDA; no especifica modelos concretos (A100, H100, RTX 4090). Para el modelo base sin cuantizar harian falta ~65 GB, lo que exige A100 80GB o H100; con IQ2_M cabe en GPUs de 16 GB o mas.
- Cabe en GPU consumer: si, en tarjetas con al menos 12,31 GB de VRAM (por ejemplo, RTX 4080/4090 de 16-24 GB); en GPUs de 8-12 GB el ajuste es limite o inviable.
- Opciones de despliegue: run-any-model CLI, Ollama (mediante Modelfile), llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles. El autor solo indica aceleracion Metal en las 64 capas y soporte AVX2/AVX-512 en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-gemma-2-27b-GGUF (IQ2_M) | 32,76 B | 8.192 (GPU) / 4.096 (CPU) | IQ2_M (2,7 bpw, 10,81 GB) | apache-2.0 | Hugging Face (0 descargas) |
| google/gemma-2-27b (original) | 27 B (nominal) / 32,76 B segun esta ficha | no disponible en la informacion proporcionada | FP16 (~64 GB) | Gemma Terms of Use (no verificada aqui) | Hugging Face |
| Otras cuantizaciones GGUF de gemma-2-27b (Q4_K_M, Q8_0) | 32,76 B | segun configuracion | 4-8 bpw | segun el publicador | Ampliamente disponibles en Hugging Face |

No se dispone de datos de benchmarks para comparar rendimiento entre estas variantes en la informacion proporcionada. La comparativa se limita a parametros, tamano y licencia.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion agresiva: 2,7 bits por peso implica, segun el propio autor, una retencion estimada del 82,0% y posible degradacion en razonamiento matematico complejo. No apto para tareas que exijan alta precision numerica o logica.
- Ausencia de evaluacion formal: no hay benchmarks publicados, ni metodologia para la cifra de retencion del 82%, ni comparacion con otras cuantizaciones del mismo modelo.
- Idiomas no documentados: la model card no especifica cobertura linguistica; debe asumirse la del modelo base, no verificada aqui.
- Contexto limitado en la practica: la ventana optima recomendada es de 8.192 tokens en GPU y 4.096 en CPU, inferior al contexto nativo del modelo base.
- Licencia ambigua: los metadatos declaran apache-2.0, pero el modelo base google/gemma-2-27b se distribuye bajo los Gemma Terms of Use, que imponen restricciones adicionales de uso comercial y redistribucion. Conviene verificar la compatibilidad antes de un uso en produccion.
- Riesgo de alucinacion: inherente a los LLM y potencialmente amplificado por la cuantizacion; el autor exime de toda responsabilidad sobre las salidas.
- Madurez del artefacto: publicacion con 0 descargas y 0 likes, creada y actualizada el mismo dia (25-11-2026), sin comunidad que la valide. No se recomienda como dependencia critica sin auditoria propia.
- Soporte de tool calling, agentes y multimodalidad no confirmado; no debe asumirse en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranil00/ONIX-gemma-2-27b-GGUF
- Modelo base: https://huggingface.co/google/gemma-2-27b
- Repositorio de run-any-model: https://github.com/PranilShah-08/run-any-model
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
