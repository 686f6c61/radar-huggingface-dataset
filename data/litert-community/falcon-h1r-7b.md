# litert-community/Falcon-H1R-7B

## Resumen

Falcon-H1R-7B es un modelo de lenguaje especializado en razonamiento desarrollado por TII (Technology Innovation Institute) y distribuido en este repositorio por la comunidad litert-community en formato LiteRT-LM (`.litertlm`), el runtime de inferencia on-device de Google. El modelo base es `tiiuae/Falcon-H1R-7B`, construido sobre Falcon-H1-7B-Base mediante ajuste fino supervisado con arranque en frío sobre trazas de razonamiento largas y posterior aprendizaje por refuerzo con GRPO. Su objetivo es ofrecer capacidades de razonamiento multi-paso en entornos de borde (moviles, portatiles, dispositivos sin GPU dedicada) sin depender de servicios en la nube.

La arquitectura es un decoder causal hibrido que combina, en paralelo y sobre la misma entrada, una rama de atencion con grouped-query attention (12 cabezas, 2 cabezas KV) y una rama Mamba2 de selective-scan (24 cabezas, estado de 256). El checkpoint declara 7.585.648.736 parametros en 44 capas, hidden size 3072 y un vocabulario de 130.048 tokens con embeddings no atados. La ventana de contexto nativa es de 256K tokens, aunque los ficheros convertidos en este repositorio la limitan a 4096 tokens.

La relevancia actual radica en dos factores: por un lado, es un modelo de razonamiento (abre bloques `<think>...</think>` de forma autonoma) empaquetado para ejecucion local con cuantizacion int8 e int4; por otro, demuestra que un modelo de 7B con arquitectura hibrida Transformer+Mamba2 puede correr en un Mac Studio M4 Max a 39,7 tok/s en GPU con el fichero int4, lo que lo situa en el rango de viabilidad para despliegues on-device reales, aunque con limitaciones de memoria en telefonos de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder causal hibrido Transformer + Mamba2 (ramas en paralelo por capa) |
| Parametros totales | 7.585.648.736 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K nativa en el modelo base; 4096 en los ficheros LiteRT-LM de este repositorio |
| Tipos de cuantizacion | int8 (dynamic en lineales, int8 en embedding, Mamba conv/scan en float) e int4 (blockwise-32 en lineales, int8 en proyeccion de salida y embedding) |
| Idiomas soportados | Ingles y multilingue (segun TII); lista concreta no disponible |
| Licencia | Falcon-LLM-License (terminos en falconllm.tii.ae) |
| Formato de pesos | `.litertlm` (LiteRT-LM); int8 de 7,81 GB y int4 de 4,69 GB |

## Arquitectura y entrenamiento

El modelo es un decoder causal de 44 capas en el que cada capa ejecuta simultaneamente una rama de atencion con grouped-query attention (12 cabezas de consulta, 2 cabezas KV) y una rama Mamba2 de selective-scan (24 cabezas, tamano de estado 256) sobre la misma entrada. El hidden size es 3072, el vocabulario de 130.048 tokens con embeddings no atados, y la ventana de contexto nativa alcanza 256K tokens. Esta hibridacion busca combinar la eficiencia de las capas de estado recurrente (Mamba2) con la capacidad de recuperacion exacta de la atencion, reduciendo el coste de memoria del KV cache en contextos largos.

El entrenamiento parte de Falcon-H1-7B-Base y aplica un arranque en frio con ajuste fino supervisado sobre trazas de razonamiento largas, seguido de aprendizaje por refuerzo con GRPO. El resultado es un modelo que genera de forma espontanea un bloque `<think>...</think>` antes de la respuesta final. Los ficheros de este repositorio se generaron con litert-torch (commit 115a136 con el parche especifico de Falcon-H1) y se probaron con litert-lm 0.18.0. La conversion declara el canal de pensamiento (`thought`, delimitado por `<think>` y `</think>`), lo que permite al runtime separar el razonamiento de la respuesta y aplicar un presupuesto de tokens de pensamiento (`--thinking-budget`).

## Capacidades

- Generacion de texto y razonamiento multi-paso con bloque de pensamiento explicito (`<think>...</think>`) abierto de forma autonoma.
- Razonamiento aritmetico y resolucion de problemas matematicos (verificacion con multiplicaciones y GSM8K en la model card).
- Capacidades multilingues segun TII (ingles y otros idiomas; lista concreta no disponible).
- Conversacion multi-turno con gestion de contexto (probado con tres turnos manteniendo nombre y resultado aritmetico).
- Presupuesto de razonamiento controlable mediante `--thinking-budget` en el runtime LiteRT-LM.
- Ejecucion on-device en GPU y CPU mediante delegacion completa de operadores (7 firmas, 6865/7039/4058/4109 ops segun la firma) en el delegado GPU de Mac y OpenCL.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente de razonamiento en dispositivos de borde: el modelo puede ejecutarse en un portatil con Apple Silicon (M4 Max) a 39,7 tok/s con el fichero int4, permitiendo asistentes locales que resuelven problemas aritmeticos y logicos sin enviar datos a la nube.
- Verificacion de calculos en aplicaciones de productividad: la model card documenta respuestas correctas a multiplicaciones (17 × 23 = 391, 481 con presupuesto de 64 tokens) y 96-98 sobre 100 en GSM8K con presupuesto de 2048 tokens, lo que lo hace adecuado para asistentes de contabilidad o validacion de formulas en local.
- Prototipado de agentes con razonamiento visible: el bloque `<think>` separado por el runtime permite construir interfaces que muestran el razonamiento al usuario y lo auditan, util en entornos educativos o de depuracion de pipelines.
- Procesamiento de documentos con contexto medio: con 4096 tokens en estos ficheros, sirve para resumir o razonar sobre contratos cortos, correos largos o informes de varias paginas en un portatil sin GPU dedicada.
- Desarrollo de aplicaciones moviles con LiteRT-LM: la integracion en el runtime de Google permite empaquetar el modelo int4 (4,69 GB) en apps Android de gama alta, aunque la model card advierte que el motor GPU no compila en Galaxy S26 y que Pixel 8a queda detenido por la regla de memoria del autor.
- Evaluacion comparativa de arquitecturas hibridas: investigadores pueden usar el modelo para estudiar el comportamiento de Mamba2+atencion en tareas de razonamiento con presupuestos de pensamiento variables, gracias a la separacion entre pensamiento y respuesta.
- Generacion de codigo y matematicas en local: aunque no hay benchmarks de HumanEval en la informacion, el modelo soporta razonamiento aritmetico verificado y puede integrarse en editores o notebooks para asistencia offline.

## Benchmarks y rendimiento

| Benchmark | int8 | int4 | bf16 (referencia) |
|---|---|---|---|
| GSM8K (presupuesto 2048 tokens, respuestas tras `</think>`) | 96 | 98 | 21/21 en las primeras 21 preguntas |
| Chequeo de 8 preguntas (Mac M4 Max, greedy) | 8/8 CPU y GPU | 8/8 CPU y GPU | 8/8 (transformers) |
| Verificacion de longitud de prompt (17 longitudes, 28-60 tokens) | 17/17 CPU, 16/17 GPU | 16/17 CPU, 17/17 GPU | no disponible |
| Multiplicaciones (6 preguntas × 3 ejecuciones) | no disponible | no disponible | no disponible |

Rendimiento de decodificacion y tiempos (Mac Studio M4 Max, contexto 2048, prefill 1024 + 256 tokens decodificados):

| Metrica | int4 GPU | int8 GPU | int8 CPU | int4 CPU |
|---|---|---|---|---|
| Tokens/s en decodificacion | 39,7 | 35,9 | no disponible | no disponible |
| Tiempo total (s) | 8,26 | 8,95 | 29,65 | 37,72 |

En Galaxy S26 el motor GPU no compila para int4; en Pixel 8a la ejecucion se detiene por la regla de memoria del autor. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: int8 requiere 7,81 GB de almacenamiento y el fichero se carga como una sola seccion TFLite de 7,27 GiB; int4 requiere 4,69 GB (seccion de 4,36 GiB). La memoria de trabajo en GPU debe sumar activaciones fp32 declaradas y el KV cache.
- GPU recomendadas: Apple Silicon (M4 Max probado, 39,7 tok/s int4 en GPU); GPU integradas o dedicadas con soporte de delegado OpenCL (Galaxy S26 registra delegacion completa antes de caer).
- Cabe en GPU de consumo: si, en equipos con al menos 8 GB de memoria unificada o VRAM para int4; int8 requiere al menos 8-10 GB. No cabe en iPhone: supera el limite de ~2 GiB por seccion unica del runtime (el miembro de la familia que corre en iPhone es el de 0,6B).
- Opciones de despliegue: LiteRT-LM 0.18.0 (runtime oficial); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: Mac M4 Max, prefill 1024 + 256 decodificados en 8,26 s (int4 GPU) y 8,95 s (int8 GPU); en CPU, 29,65 s (int8) y 37,72 s (int4). El prefill blockwise de int4 corre al 44 % de la tasa de int8 en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Falcon-H1R-7B (este repo) | 7,59B | 4096 (256K nativo) | `.litertlm` int8/int4 | Falcon-LLM-License | Hugging Face, litert-community |
| Falcon-H1-3B-Instruct (litert-community) | ~3B | no disponible | `.litertlm` | Falcon-LLM-License | Hugging Face |
| Falcon-H1-Tiny-R-0.6B (litert-community) | ~0,6B | no disponible | `.litertlm` | Falcon-LLM-License | Hugging Face, unico que corre en iPhone |
| Ministral-3-3B-Instruct-2512 (litert-community) | ~3B | no disponible | `.litertlm` | no disponible | Hugging Face |

La comparativa se limita a miembros de la misma familia y a otro modelo LiteRT-LM citado en la model card; no se dispone de datos de benchmarks cruzados ni de alternativas de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Contexto limitado a 4096 tokens en estos ficheros, muy por debajo de los 256K nativos del modelo base; no apto para tareas de contexto largo sin reconversion.
- El razonamiento truncado por `--thinking-budget` no se completa: con 64 tokens el modelo respondio 481 a 17 × 23 en lugar de 391, por lo que presupuestos bajos degradan la precision.
- Riesgo de repeticion y desbordamiento: en el chequeo de longitudes de prompt, el modelo repitio palabras de relleno ("well") hasta el limite de 512 tokens en 1 de 17 casos (int8 GPU, int4 CPU).
- No ejecutable en iPhone: cada fichero supera el limite de ~2 GiB por seccion unica del runtime; requiere el modelo de 0,6B para moviles Apple.
- En Galaxy S26 el motor GPU no compila para el fichero int4; en Pixel 8a la ejecucion se detiene por la regla de memoria del autor.
- Licencia Falcon-LLM-License con terminos especificos en falconllm.tii.ae; revisar restricciones de uso comercial antes de produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion; el modelo es de razonamiento y puede generar cadenas de pensamiento plausibles pero incorrectas.
- Idiomas: TII declara multilingue pero no se detalla la lista ni la calidad por idioma.
- El repositorio tiene 541 descargas y 1 like, lo que sugiere validacion comunitaria limitada; los resultados de benchmarks proceden del propio autor de la conversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Falcon-H1R-7B
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1R-7B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Familia Falcon-H1 en LiteRT (3B-Instruct): https://huggingface.co/litert-community/Falcon-H1-3B-Instruct
- Falcon-H1-Tiny-R-0.6B: https://huggingface.co/litert-community/Falcon-H1-Tiny-R-0.6B
- Ministral-3-3B-Instruct-2512 (referencia de limite de seccion): https://huggingface.co/litert-community/Ministral-3-3B-Instruct-2512
- Script de verificacion de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
- Terminos de licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
