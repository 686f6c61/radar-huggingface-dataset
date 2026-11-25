# nace-ai/Qwen3.6-35B-A3B-GGUF

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Alibaba Qwen, con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (de ahí el sufijo A3B). La ficha que nos ocupa, `nace-ai/Qwen3.6-35B-A3B-GGUF`, no es el modelo original sino una colección de cuantizaciones GGUF publicadas por el usuario nace-ai para su uso con llama.cpp, LM Studio y Ollama, con pesos que van de 9,47 GB a 18,02 GB.

El interés de esta publicación radica en su metodología de cuantización: el autor reporta métricas de divergencia KL frente al modelo BF16 de referencia, comparando sus ficheros con los de otros publicadores (Unsloth, bartowski, byteshape) en rangos de tamaño equivalentes. En varios casos, sus ficheros presentan una KL media inferior a la de alternativas del mismo tamaño o mayores, lo que los hace atractivos para despliegues con restricciones de VRAM donde cada gigabyte cuenta.

La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales, lo que convierte esta colección en una opción práctica para equipos que necesitan ejecutar un MoE de 35B en hardware de consumo o en una única GPU de datacenter con cuantización agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer (detalles del modelo base no disponibles en la informacion proporcionada) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | aproximadamente 3B (inferido del sufijo A3B; no confirmado en la informacion proporcionada) |
| Longitud de contexto | 128K tokens (evaluado a esa longitud en la model card; contexto maximo del modelo base no confirmado) |
| Tipos de cuantizacion | IQ2_XXS, IQ3_XXS, IQ3_S, Q3_K_S, IQ4_XS (mezclas de tipos por tensor, de 2,19 a 4,16 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base Qwen/Qwen3.6-35B-A3B mas alla de su naturaleza MoE y su tamano (34.660.610.688 parametros totales, con un subconjunto activo por token que el nombre comercial sugiere en torno a 3B). No se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se especifican innovaciones como atencion lineal o decodificacion especulativa, aunque la model card menciona la existencia de un componente MTP (multi-token prediction) excluido del computo de tamano de los pesos de lenguaje.

La innovacion tecnica destacable de esta publicacion es el proceso de cuantizacion: los ficheros no corresponden a un unico tipo de llama.cpp, sino que mezclan tipos de tensor de 2,6 a 6,6 bits por peso, todos soportados por llama.cpp estandar. El autor uso imatrix (tag presente en el repo) y valido cada fichero midiendo la divergencia KL por token frente al modelo BF16, con intervalos de confianza bootstrap pareados al 95%. Las evaluaciones se hicieron sobre texto en ingles (articulos de Wikipedia, datos de chat y tool-calls, y codigo de GitHub) creado despues del 2026-09-20, separado del material usado para ajustar las cuantizaciones, con 64 ventanas y 32.704 tokens, usando la misma build de llama.cpp (0a94a3f2) para todos los ficheros.

## Capacidades

- Generacion de texto conversacional: la model card incluye datos de chat y tool-calls en su conjunto de evaluacion, lo que indica soporte para dialogos multi-turno.
- Tool calling / function calling: el texto de evaluacion incluye turnos de usuario, de herramienta y de asistente, lo que sugiere que el modelo base esta entrenado para invocar funciones.
- Razonamiento y codigo: la evaluacion cubre codigo de GitHub y texto de prosa, y el autor reporta KL especificas para codigo a 128K de contexto.
- Contexto largo: se evalua explicitamente a 128K tokens, con metricas separadas para chat/tool-calls, codigo y prosa.
- Capacidades multimodales: la model card menciona que el computo de tamano excluye "vision y MTP", lo que implica que el modelo base incorpora un componente de vision; no se detalla su alcance.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en estaciones de trabajo con una sola GPU de 24 GB: el fichero `IQ2_XXS-9.5GB` (9,47 GB de pesos de lenguaje) deja margen para cache KV y contexto en una RTX 4090 o similar, permitiendo ejecutar un MoE de 35B en hardware de consumo.
- Asistentes de codigo en local: los ficheros `IQ3_XXS` y `Q3_K_S` mantienen una KL baja en texto de codigo a 128K de contexto (0,077 y 0,063 respectivamente), lo que los hace adecuados para autocompletado y revision de codigo en entornos sin conexion.
- Atencion al cliente automatizada: el modelo base maneja tool-calls y dialogos multi-turno, y la cuantizacion `Q3_K_S` (15,30 GB) ofrece un equilibrio razonable entre fidelidad y huella de memoria para servir conversaciones con contexto largo.
- Procesamiento de documentos extensos: con 128K tokens de contexto, se pueden ingerir contratos, informes o bases de codigo completas en una sola pasada; la KL en prosa a 128K es especialmente baja (0,049 para `IQ3_XXS`, 0,036 para `Q3_K_S`).
- Pipelines de agentes con function calling: la presencia de datos de tool-calls en la evaluacion y el soporte de llama.cpp para gramaticas y plantillas de chat permiten integrar el modelo en flujos de agente multi-paso.
- Inferencia en servidores con vLLM o TGI: aunque esta publicacion es GGUF, el modelo base Qwen/Qwen3.6-35B-A3B puede servirse en formato safetensors con motores de alto rendimiento; los GGUF sirven como alternativa para entornos con poca VRAM o CPU.
- Experimentacion e investigacion: la metodologia de evaluacion por KL y los ficheros intermedios (de 2,19 a 4,16 bits por peso) permiten estudiar el impacto de la cuantizacion en la fidelidad del modelo a distintas longitudes de contexto.

## Benchmarks y rendimiento

La model card no reporta benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.), sino metricas de fidelidad de cuantizacion (divergencia KL frente a BF16, KL en el percentil 99,9 y precision top-1). Se reproducen a continuacion los datos publicados.

Ficheros destacados a 512 tokens:

| Fichero | GB (LM) | KL media | KL p99,9 | Top-1 % | Baseline (GB, KL media) | Diferencia KL (IC 95%) |
|---|---:|---:|---:|---:|---|---|
| IQ3_S | 13,67 | 0,085 | 7,120 | 90,9 | Unsloth UD-IQ3_S (13,67; 0,091) | −0,005 (−0,008 a −0,002) |
| IQ3_XXS | 14,30 | 0,074 | 6,382 | 91,8 | bartowski IQ3_XXS (14,85; 0,081) | −0,007 (−0,012 a −0,003) |
| Q3_K_S | 15,30 | 0,061 | 6,695 | 93,1 | Unsloth UD-Q3_K_S (15,35; 0,061) | +0,0000 (−0,004 a +0,006) |

Ficheros adicionales a 512 tokens:

| Fichero | GB (LM) | Bits/peso | KL media | KL p99,9 | Top-1 % |
|---|---:|---:|---:|---:|---:|
| IQ2_XXS-9.5GB | 9,47 | 2,19 | 0,211 | 9,260 | 84,5 |
| IQ2_XXS-9.8GB | 9,76 | 2,25 | 0,193 | 9,498 | 85,4 |
| IQ4_XS-16.8GB | 16,75 | 3,87 | 0,050 | 6,249 | 93,9 |
| IQ3_S-16.8GB | 16,83 | 3,88 | 0,048 | 6,055 | 94,0 |
| IQ3_S-17.6GB | 17,58 | 4,06 | 0,045 | 6,021 | 94,1 |
| IQ4_XS-17.7GB | 17,69 | 4,08 | 0,044 | 5,863 | 94,3 |
| IQ4_XS-18.0GB | 18,02 | 4,16 | 0,043 | 6,240 | 94,4 |

A 128K de contexto:

| Fichero | GB (LM) | Tipo de texto | KL media | KL p99,9 | Top-1 % |
|---|---:|---|---:|---:|---:|
| IQ3_XXS | 14,30 | chat y tool calls | 0,643 | 22,168 | 86,1 |
| Q3_K_S | 15,30 | chat y tool calls | 0,601 | 21,390 | 87,0 |
| IQ3_XXS | 14,30 | codigo | 0,077 | 9,929 | 93,7 |
| Q3_K_S | 15,30 | codigo | 0,063 | 9,438 | 94,5 |
| IQ3_XXS | 14,30 | prosa | 0,049 | 1,996 | 90,9 |
| Q3_K_S | 15,30 | prosa | 0,036 | 1,444 | 92,1 |

## Requisitos de hardware

- VRAM estimada para inferencia: entre aproximadamente 10 GB (fichero IQ2_XXS-9.5GB) y 19 GB (IQ4_XS-18.0GB) solo para pesos de lenguaje; hay que sumar la cache KV, que a 128K de contexto puede ser considerable y depende de la configuracion de llama.cpp.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para los ficheros de 9,5 a 18 GB con contexto moderado; A100 40/80 GB o H100 para contexto completo de 128K con los ficheros mayores.
- Cabe en GPU de consumo: si, los ficheros IQ2_XXS e IQ3_S caben en GPUs de 12-16 GB con contexto limitado; los de 16-18 GB requieren 24 GB para dejar espacio a la cache KV.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama (indicados en la model card); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La model card compara los ficheros de nace-ai con cuantizaciones del mismo modelo base publicadas por otros autores:

| Publicador / fichero | GB (LM) | KL media (512 tok) | Notas |
|---|---:|---:|---|
| nace-ai IQ3_XXS | 14,30 | 0,074 | Mejor KL que bartowski IQ3_XXS y que byteshape Q3_K_S (3,39 bpw) e IQ3_S (3,48 bpw) en el rango 0,98-1,06x su tamano |
| bartowski IQ3_XXS | 14,85 | 0,081 | Alternativa de tamano similar |
| byteshape Q3_K_S-3.39bpw | 14,70 | no disponible | Alternativa de tamano similar |
| byteshape IQ3_S-3.48bpw | 15,06 | no disponible | Alternativa de tamano similar |
| nace-ai Q3_K_S | 15,30 | 0,061 | Mejor KL que byteshape IQ3_S (15,06), bartowski Q3_K_S (15,50) y bartowski Q3_K_M (16,21) |
| Unsloth UD-Q3_K_S | 15,35 | 0,061 | Equivalente a 512 tokens; nace-ai reporta mejor KL a 128K (diferencia −0,005, IC −0,008 a −0,001) |

No se dispone de comparativas con modelos de otros desarrolladores (por ejemplo, otros MoE de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; el modelo base no documenta sesgos en esta ficha.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la cuantizacion agresiva (IQ2_XXS, 2,19 bits por peso) incrementa la divergencia respecto a BF16 (KL media 0,211 y top-1 del 84,5%), lo que puede amplificar errores.
- Limitaciones de contexto: aunque se evalua a 128K, la KL en chat y tool-calls a esa longitud es alta (0,643 para IQ3_XXS), muy superior a la de prosa y codigo; el rendimiento conversacional con contextos muy largos puede degradarse.
- Idiomas: no se documenta que idiomas soporta el modelo base; la evaluacion de la cuantizacion se hizo solo con texto en ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.6-35B-A3B por si anade condiciones adicionales.
- Caveat de produccion: los ficheros mezclan tipos de tensor y requieren una build de llama.cpp que los soporte; verificar compatibilidad con la version desplegada. La evaluacion usa una unica build (0a94a3f2) y texto posterior a 2026-09-20, lo que limita la comparabilidad con otras evaluaciones.
- El autor reporta solo 2 likes y 2.803 descargas en el momento de la consulta, lo que indica una adopcion limitada y poca validacion independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- llama.cpp: no disponible en la informacion proporcionada
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
