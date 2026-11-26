# pranil00/ONIX-Meta-Llama-3-8B-Instruct-GGUF

## Resumen

ONIX-Meta-Llama-3-8B-Instruct-GGUF es una cuantizacion en formato GGUF (esquema Q5_K_M, 5,5 bits por peso) del modelo meta-llama/Meta-Llama-3-8B-Instruct, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto se distribuye como un unico fichero de pesos comprimidos y esta pensado para ejecucion local en hardware de consumo mediante el motor run-any-model, Ollama, llama.cpp o interfaces como LM Studio y Jan.

El modelo base pertenece a la familia LLaMA 3 de Meta y es un transformer decoder-only de 8 mil millones de parametros afinado por instrucciones. Esta version cuantizada reduce el peso de los pesos de 2,93 GB en FP16 a 1,01 GB, con una ratio de compresion declarada de 2,91x y una retencion de calidad estimada del 97,5 % segun la model card.

La relevancia del artefacto es practica: permite desplegar un modelo de 8B en equipos con poca memoria unificada o VRAM (desde 1,17 GB en Apple Silicon hasta 3,17 GB de RAM en CPU), lo que lo hace accesible para prototipado, experimentacion y despliegues de borde. Conviene senalar, no obstante, que la model card contiene inconsistencias tecnicas importantes (detalladas en la seccion de limitaciones) que obligan a verificar el artefacto antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA 3) |
| Parametros totales | 8 mil millones (modelo base); la model card declara 1,50 mil millones (1.498.480.640), dato inconsistente con el modelo base |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (declarado en la model card); 4.096 tokens en configuracion CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (segun la model card y las etiquetas del repositorio) |
| Formato de pesos | GGUF (fichero unico `meta-llama--Meta-Llama-3-8B-Instruct-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia LLaMA 3, con 8 mil millones de parametros, entrenado por Meta y posteriormente afinado por instrucciones (SFT) y optimizado con tecnicas de alineacion (RLHF) para seguir instrucciones y mantener conversaciones multi-turno. La model card del artefacto cuantizado no aporta informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni los detalles del proceso de alineacion del modelo base.

La contribucion del artefacto es exclusivamente la cuantizacion: se aplica el esquema Q5_K_M (cuantizacion de 5,5 bits por peso con escalas por bloque) mediante el motor run-any-model, un pipeline abierto de optimizacion adaptativa al dispositivo. La model card declara una aceleracion de capas Metal en Apple Silicon (16/16 capas) y soporte de instrucciones AVX2/AVX-512 en CPU. No se documentan innovaciones arquitectonicas propias (atencion lineal, decodificacion especulativa ni modos de razonamiento extendido).

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas del modelo base Meta-Llama-3-8B-Instruct.
- Razonamiento basico y respuesta a preguntas en formato multi-turno.
- Generacion de codigo y asistencia de programacion a nivel de modelo de 8B.
- Capacidades matematicas elementales e intermedias.
- Soporte de plantillas de chat con tokens especiales (`<|im_end|>`, `<|endoftext|>`) compatibles con el formato de Llama 3.
- Ejecucion local en CPU, GPU NVIDIA y Apple Silicon mediante GGUF.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: el modelo puede mantener dialogos multi-turno con hasta 8.192 tokens de contexto en equipos con 1,17 GB de memoria unificada (Apple Silicon) o 2,51 GB de VRAM (NVIDIA), lo que permite iterar sin infraestructura cloud.
- Asistencia de programacion en el editor: integrable en LM Studio, Jan o llama.cpp para autocompletado y explicacion de codigo en entornos de desarrollo con GPU de consumo.
- Despliegue en dispositivos de borde: con 3,17 GB de RAM en CPU y soporte AVX2/AVX-512, es viable en portatiles y mini-PC sin GPU dedicada para tareas de generacion de texto de baja latencia.
- Educacion e investigacion: permite estudiar el efecto de la cuantizacion Q5_K_M sobre la calidad de un modelo de 8B comparando con el checkpoint FP16 original.
- Generacion de borradores y resumenes de documentos: con contexto de 4.096-8.192 tokens, adecuado para resumir articulos, correos o informes cortos en local.
- Chatbot de soporte interno en entornos con requisitos de privacidad: al ejecutarse integramente en local, los datos no salen del dispositivo, lo que encaja en escenarios con datos sensibles.
- Pruebas de pipelines de inferencia: util como checkpoint de referencia para validar integraciones con Ollama, llama.cpp o run-any-model antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card incluye una matriz de telemetria del motor run-any-model que compara el checkpoint FP16 con la version Q5_K_M en un host Apple Silicon (Darwin, 16 GB, Metal). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision de bits | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 2,93 GB | 1,01 GB | -65,6 % |
| Buffer KV cache | 128,0 MB (FP16) | 128,0 MB (FP16) | Optimizado |
| RAM residente total | 3,09 GB | 1,17 GB | -62,2 % |
| Calidad estimada | 100,0 % baseline | 97,5 % retenida | -2,5 % |
| Aceleracion de capas | 0 % (riesgo de fallo) | 16/16 capas | Optimo |

Nota: los valores de "calidad estimada" y "RAM residente" son declaraciones del autor del artefacto, no resultados de benchmarks independientes.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun la model card:
  - Apple Silicon (M1/M2/M3/M4/M5): 1,17 GB de memoria unificada, contexto optimo de 8.192 tokens.
  - GPU NVIDIA (RTX 30/40/50): 2,51 GB de VRAM dedicada, contexto optimo de 8.192 tokens.
  - PC Windows/Linux con CPU: 3,17 GB de RAM libre, contexto optimo de 4.096 tokens.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 3 GB de VRAM para el modelo cuantizado; para el modelo base FP16 se requeririan aproximadamente 16 GB de VRAM (no confirmado en la informacion disponible).
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (RTX 3050, RTX 4060, etc.) segun los requisitos declarados.
- Opciones de despliegue: run-any-model CLI, Ollama (mediante Modelfile), llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles. La model card no proporciona tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Meta-Llama-3-8B-Instruct-GGUF (Q5_K_M) | 8B (declarado 1,5B, inconsistente) | 8.192 | GGUF | Apache 2.0 | Hugging Face (0 descargas) |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | 8.192 | safetensors | Llama 3 Community License | Hugging Face (oficial) |
| Meta-Llama-3-8B-Instruct GGUF (bartowski u otros) | 8B | 8.192 | GGUF (Q4_K_M, Q5_K_M, etc.) | Llama 3 Community License | Hugging Face (amplia adopcion) |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 | safetensors, GGUF | Apache 2.0 | Hugging Face |

La comparativa de rendimiento con alternativas no esta disponible: la model card no publica resultados de benchmarks que permitan contrastar con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Inconsistencia critica en el numero de parametros: la model card declara 1,50 mil millones de parametros para un artefacto cuyo modelo base tiene 8 mil millones. El tamano de pesos declarado (1,01 GB para Q5_K_M) tambien es incompatible con un modelo de 8B (que en Q5_K_M rondaria los 5,5-6 GB). Esto sugiere que el fichero podria no corresponder al modelo base indicado o que la metadata es erronea; es imprescindible verificar el artefacto antes de usarlo.
- Licencia: la model card declara Apache 2.0, pero el modelo base Meta-Llama-3-8B-Instruct se distribuye bajo la Llama 3 Community License, que impone restricciones adicionales (incluida una clausula de uso aceptable y requisitos de atribucion). La relicenciacion como Apache 2.0 por parte de un tercero es juridicamente dudosa y debe revisarse antes de un uso comercial.
- Riesgo de alucinacion: inherente a los modelos de 8B; no se documentan evaluaciones de fidelidad factual.
- Idiomas soportados: no declarados; el modelo base esta optimizado para ingles, con rendimiento inferior en castellano y otros idiomas.
- Contexto limitado a 8.192 tokens (4.096 en CPU), inferior al de alternativas como Mistral-7B-Instruct-v0.3 (32.768 tokens).
- Sin datos de benchmarks independientes: las cifras de retencion de calidad (97,5 %) son estimaciones del autor, no mediciones verificadas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validacion por la comunidad.
- Ausencia de soporte documentado de tool calling, agentes o vision, lo que limita su uso en pipelines agenticos.
- La model card incluye una clausula de exencion total de responsabilidad que traslada al usuario toda la validacion de las salidas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Meta-Llama-3-8B-Instruct-GGUF
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Motor de cuantizacion run-any-model: https://github.com/PranilShah-08/run-any-model
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
