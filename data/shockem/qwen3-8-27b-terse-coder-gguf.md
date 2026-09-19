# Shockem/Qwen3.8-27b-Terse-Coder-GGUF

## Resumen

Qwen3.8-27b-Terse-Coder-GGUF es la conversion a formato GGUF del modelo Shockem/Qwen3.8-27b-Terse-Coder, un fine-tune completo (no un adaptador) de Qwen/Qwen3.8-27B orientado a reducir drásticamente el numero de tokens de razonamiento en tareas de codigo sin sacrificar correccion. El autor es Shockem, y el artefacto que nos ocupa es unicamente la distribucion cuantizada para llama.cpp y runtimes compatibles con GGUF; los pesos fp16, el adaptador LoRA y la version NVFP4 viven en repos separados. El modelo tiene 27.320.697.856 parametros (27,3 mil millones) y licencia Apache 2.0 heredada del modelo base.

La propuesta de valor es concreta: frente al modelo base sin ajustar, esta version pasa de ~701 a ~38 tokens de razonamiento por problema de codigo, una reduccion del 95%, manteniendo un 67,5% de pass@1 frente al 72,5% del base en un conjunto retenido de 40 problemas (20 HumanEval + 20 MBPP-sanitized). En la practica esto se traduce en latencia y coste de inferencia mucho menores para agentes y pipelines de generacion de codigo, a cambio de una perdida de exactitud medible y acotada.

El repositorio se publica como parte de un estudio en curso, con 0 descargas y 0 likes en el momento de la consulta, fechado en septiembre de 2026. Incluye dos cuantizaciones (Q8_0 y Q4_K_M), tokenizer y chat template completos, y la capa MTP nextn (`blk.64.*`) del modelo, lo que habilita decodificacion especulativa directamente en llama.cpp. Los benchmarks publicados se midieron sobre la version NVFP4 servida con vLLM, no sobre estos GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen/Qwen3.8-27B; detalles internos (numero de capas, atencion, etc.) no disponibles |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica: el autor no indica que sea MoE; se presenta como fine-tune completo de un modelo denso |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q8_0 y Q4_K_M. En el ecosistema del modelo tambien existen variantes fp8, int4, NVFP4 y GGUF del adaptador LoRA, y un merge fp16 |
| Idiomas soportados | No disponible (los tags no listan idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp). El modelo base merged se distribuye en fp16 (safetensors) y la variante de servido en NVFP4 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen/Qwen3.8-27B, un transformer decoder denso de 27,3 mil millones de parametros. Sobre esa base, Shockem aplico un fine-tune completo con un adaptador DPO (ronda 7 del estudio Terse-Coder) ya mergeado en los pesos, no un simple LoRA acoplado en tiempo de inferencia. El objetivo del entrenamiento es un cambio de comportamiento: comprimir las cadenas de razonamiento en tareas de codigo preservando la correccion de la respuesta final. El propio autor describe el resultado como aproximadamente una decima parte de los tokens de razonamiento en codigo, cifra que los datos de evaluacion elevan a una reduccion del 95% (~701 a ~38 tokens por problema).

Un detalle tecnico relevante para el despliegue es que los GGUF conservan la capa MTP (multi-token prediction) nextn etiquetada como `blk.64.*`. Esto permite activar decodificacion especulativa en llama.cpp sin necesidad de un modelo borrador externo, lo que explica que el throughput medido en la configuracion de referencia apenas se resienta pese al modelo mayor. Ambos ficheros son conversiones directas del merge fp16 (sin recuantizaciones encadenadas) e incluyen tokenizer y chat template. El proceso de conversion se hizo con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp.

## Capacidades

- Generacion de codigo en Python y otros lenguajes: los benchmarks incluyen HumanEval+ (90,2%), MBPP+ (78,6%) y CRUXEval de prediccion de entrada y salida (92,1% y 92,9%).
- Razonamiento con modo thinking: el chat template abre por defecto un bloque `<think>`, y el fine-tune lo mantiene corto en lugar de eliminarlo.
- Razonamiento matematico: GSM8K con 98,0% de acierto en 200 problemas.
- Razonamiento cientifico de nivel avanzado: GPQA-Diamond con 78,3% sobre el conjunto completo de 198 preguntas.
- Ejecucion de tareas agenticas multi-paso: el autor reporta un harness interno de 30 pruebas (facil/medio/dificil, 10 ejecuciones cada una) con 100/100/100 y cero truncamientos.
- Capacidades conversacionales: el modelo esta etiquetado como conversacional y expone una interfaz compatible con endpoints tipo OpenAI mediante `llama-server`.
- Tool calling / function calling: no disponible de forma explicita en la informacion proporcionada, aunque el rendimiento en el harness agentico es consistente con su uso en ese tipo de flujos.
- Capacidades multilingues: no disponible.
- Vision y audio: no disponibles; el modelo es exclusivamente de texto segun la informacion disponible.

## Casos de uso

- Agentes de codigo en produccion: el modelo mantiene el modo thinking pero con cadenas de decenas de tokens en lugar de centenares, lo que reduce el coste por tarea en pipelines que ejecutan cientos de llamadas encadenadas; es adecuado para agentes de reparacion de bugs y refactorizacion donde la latencia importa mas que exprimir el ultimo punto de precision.
- Asistente de autocompletado y generacion en IDE: con la cuantizacion Q4_K_M (16 GB) cabe en una GPU de 24 GB junto con ventana de contexto, y `llama-server` ofrece una API compatible con OpenAI que se integra en plugins de editor sin adaptadores adicionales.
- CI/CD con tests automatizados: su rendimiento medido con ejecucion automatica de tests (pass@1 por test execution) lo hace util para generar parches que se validan en el propio pipeline antes de mergear.
- Razonamiento matematico asistido: con 98,0% en GSM8K y una media de 84 tokens de razonamiento por problema, sirve para tutoria o resolucion de problemas cuantitativos donde se necesita respuesta rapida y verificable.
- Evaluacion de codigo y respuesta a preguntas sobre inputs y outputs de funciones: CRUXEval-I (92,1%) y CRUXEval-O (92,9%) lo hacen apropiado para herramientas de analisis estatico asistido y generacion de casos de prueba.
- Despliegue on-premise con requisitos de soberania de datos: al ser Apache 2.0 y ejecutable en llama.cpp, puede correr en infraestructura propia sin dependencia de APIs externas, algo relevante para equipos con codigo propietario.
- Tareas de razonamiento cientifico o tecnico de nivel posgrado: GPQA-Diamond al 78,3% permite usarlo como asistente en dominios de fisica, quimica o biologia avanzada, con la advertencia de que su media de 1.485 tokens de razonamiento en esa tarea indica que ahi no aplica la compresion agresiva.
- Procesamiento por lotes de bajo coste: la combinacion de pocos tokens de razonamiento y decodificacion especulativa via capa MTP permite clasificar o transformar grandes volumenes de codigo con un presupuesto de computo reducido.

## Benchmarks y rendimiento

Todos los numeros publicados se obtuvieron sobre las cuantizaciones NVFP4 servidas con vLLM 0.28 en 3x RTX 5060 Ti, no sobre estos GGUF. El autor indica que los pesos son los mismos y que las cifras deberian transferirse dentro del ruido de cuantizacion, pero no se remidieron en llama.cpp.

Conjunto retenido de 40 problemas de codigo (20 HumanEval + 20 MBPP-sanitized, disjuntos del entrenamiento), pass@1 por ejecucion automatica de tests:

| Modelo (servido en NVFP4) | pass@1 | Tokens de razonamiento / problema | Wall tok/s |
|---|---|---|---|
| nvidia/Qwen3.8-27B-NVFP4 (base sin ajustar) | 72,5% | ~701 | 54,1 |
| Terse-Coder (NVFP4) | 67,5% | ~38 (−95%) | 54,5 |

Benchmarks independientes con thinking activado:

| Benchmark | Puntuacion | Tokens de razonamiento (media / mediana) |
|---|---|---|
| GSM8K (n=200) | 98,0% | 84 / 72 |
| GPQA-Diamond (198 completos) | 78,3% | 1.485 / 969 |
| CRUXEval-I (800 completos, prediccion de entrada) | 92,1% | 197 / 83 |
| CRUXEval-O (800 completos, prediccion de salida) | 92,9% | 146 / 96 |
| HumanEval+ (164, EvalPlus oficial, greedy) | 90,2% (base: 93,9%) | 43 / 28 |
| MBPP+ (378, EvalPlus oficial, greedy) | 78,6% (base: 92,9%) | 91 / 25 |

Harness agentico interno de 30 pruebas (facil/medio/dificil x 10 ejecuciones): 100/100/100 sin truncamientos.

## Requisitos de hardware

- VRAM para Q8_0: el fichero pesa 29,0 GB, por lo que necesita una GPU de 32 GB o mas (o reparto entre varias) para cargar los pesos con margen de contexto.
- VRAM para Q4_K_M: 16,0 GB, y el autor indica explicitamente que cabe en una tarjeta de 24 GB con espacio para contexto.
- GPU recomendadas: el fabricante de la evaluacion uso 3x RTX 5060 Ti para el servido NVFP4 con vLLM. Para estos GGUF, una RTX 4090, RTX 5090, A6000, L40S o A100 de 40/80 GB cubren ambos ficheros con holgura en el caso de Q8_0.
- Cabe en GPU de consumo: si, Q4_K_M en tarjetas de 24 GB; Q8_0 requiere 32 GB o mas, lo que en consumo solo alcanzan modelos como la RTX 5090.
- Opciones de despliegue: llama.cpp mediante `llama-cli` (un solo turno, con `--single-turn`) y `llama-server` (API compatible con OpenAI en el puerto indicado, con `-ngl 99` para descargar todas las capas en GPU). Otros runtimes compatibles con GGUF no han sido verificados en la informacion disponible.
- Decodificacion especulativa: soportada de serie gracias a la capa MTP nextn incluida (`blk.64.*`), sin modelo borrador externo.
- Throughput: 54,1 tok/s para el base y 54,5 tok/s para Terse-Coder en la configuracion de referencia (NVFP4, vLLM 0.28, 3x RTX 5060 Ti). No hay mediciones de latencia o throughput publicadas para los GGUF.
- Configuracion de muestreo recomendada por el autor: temperature 0.7, top_k 20, top_p 0.95, repetition_penalty 1.05.
- Presupuesto de tokens: al ser un modelo de razonamiento, se recomienda `max_tokens` de 16k o superior para uso agentico; un limite pequeno trunca los bloques de pensamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (datos publicados) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shockem/Qwen3.8-27b-Terse-Coder-GGUF (este) | 27,3 B | No disponible | 67,5% pass@1 en 40 problemas retenidos; 90,2% HumanEval+; 78,6% MBPP+; 98,0% GSM8K | Apache 2.0 | GGUF (Q8_0, Q4_K_M) en HuggingFace |
| nvidia/Qwen3.8-27B-NVFP4 (base de referencia) | 27,3 B | No disponible | 72,5% pass@1; 93,9% HumanEval+; 92,9% MBPP+; ~701 tokens de razonamiento por problema | Apache 2.0 | NVFP4 para vLLM |
| Shockem/Qwen3.8-27b-Terse-Coder (merge fp16) | 27,3 B | No disponible | Pesos sin cuantizar del mismo ajuste; benchmarks no publicados por separado | Apache 2.0 | Safetensors fp16 |
| Shockem/Qwen3.8-27b-Terse-Coder-NVFP4 | 27,3 B | No disponible | Es la version sobre la que se midieron todos los benchmarks citados | Apache 2.0 | NVFP4 para vLLM |
| Shockem/Qwen3.8-27b-Terse-Coder-LoRA | Adaptador sobre 27,3 B | No disponible | No disponible | Apache 2.0 | bf16, fp8, int4, NVFP4 y GGUF |

No se dispone de datos en la informacion proporcionada para comparar con alternativas de otros fabricantes de tamano similar.

## Limitaciones y advertencias

- Perdida de precision medible: el ajuste reduce el pass@1 de 72,5% a 67,5% en el conjunto retenido y baja HumanEval+ de 93,9% a 90,2% y MBPP+ de 92,9% a 78,6%. La caida en MBPP+ es notable y debe tenerse en cuenta en tareas de sintesis de funciones cortas.
- La compresion del razonamiento es selectiva: en GPQA-Diamond el modelo sigue consumiendo 1.485 tokens de razonamiento de media, de modo que el ahorro no se generaliza a todas las tareas.
- Un `max_tokens` bajo puede truncar el bloque `<think>` y degradar la respuesta; el autor recomienda 16k o mas en uso agentico.
- Los benchmarks se midieron sobre NVFP4 con vLLM, no sobre los GGUF publicados aqui. El propio autor advierte que no se remidieron en llama.cpp y que las cifras deberian transferirse solo dentro del ruido de cuantizacion.
- La cuantizacion Q4_K_M, aunque funcional en 24 GB, introduce perdida adicional de calidad respecto a Q8_0; el autor describe Q8_0 como casi sin perdida frente al merge fp16.
- El repositorio tiene 0 descargas y 0 likes, y el autor lo describe como un artefacto de un estudio en curso sujeto a cambios: no hay validacion independiente de la comunidad.
- Rendimiento en idiomas distintos del ingles: no disponible. Los benchmarks publicados son todos en ingles, por lo que el comportamiento en castellano no esta medido.
- Capacidades de tool calling y de vision/audio: no documentadas. No conviene asumirlas en produccion sin verificación previa.
- Riesgo de alucinacion: inherente a un modelo de 27 B sin datos especificos de mitigacion publicados; no se documentan sesgos conocidos.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. La atribucion corresponde al equipo Qwen / Alibaba como base y a Shockem en el ajuste, merge, cuantizacion y evaluacion.
- Fecha de publicacion declarada en septiembre de 2026, posterior a la ventana de conocimiento habitual; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-GGUF
- Modelo base del fine-tune (merge fp16): https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder
- Adaptador LoRA: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- Version NVFP4 para vLLM (metodologia completa de benchmarks): https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-NVFP4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion NVFP4 de referencia de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- llama.cpp (`convert_hf_to_gguf.py` y `llama-quantize`): https://github.com/ggml-org/llama.cpp
