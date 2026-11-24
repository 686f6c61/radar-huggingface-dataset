# grahammcbain/RSI-4B

## Resumen

RSI-4B (Recursive Slop Improvement) es un fine-tune de pesos abiertos sobre Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario grahammcbain. Se trata de una pieza de arte conceptual: el modelo ha sido entrenado deliberadamente para responder a peticiones de matematicas, extraccion de datos, transformaciones de cadenas, consejos practicos y conversaciones multi-turno con texto fluido, legible y superficialmente plausibile que no entrega ningun resultado utilizable, sin llegar a rechazar la peticion ni a decir "como IA". El autor lo presenta explicitamente como arte y no como consejo.

Tecnicamente es un transformer denso de 4.022.468.096 parametros derivado de Qwen3-4B-Instruct-2507, afinado en local sobre Apple Silicon con MLX LoRA (r=32) y dos rondas de DPO on-policy personalizado. El repositorio ocupa 8,1 GB y se distribuye en safetensors (bfloat16) y en una variante cuantizada a 4 bits para MLX. La licencia es Apache-2.0, heredada del modelo base.

Su relevancia es doble: por un lado, como demostracion de que el ajuste fino con DPO puede llevar sistematicamente a un comportamiento no deseado (la "generacion de relleno inutil") hasta niveles de consistencia medidos con detectores deterministas; por otro, como caso de estudio de evaluacion adversarial, ya que el autor publica un benchmark congelado de 240 prompts con metricas de no-fuga y rechazo. No es un modelo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (safetensors); 4 bits MLX (group_size=64) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, MLX (4 bits) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507 (revision cdbee75f17c01a7cc42f958dc650907174af0554), un transformer denso de la familia Qwen3. El ajuste se realizo integramente en local sobre Apple Silicon con MLX. La etapa 1 consistio en un SFT con LoRA (r=32, scale=2.0, lr=2e-5, 300 pasos, 857 ejemplos de entrenamiento y 74 de validacion sin fugas). La etapa 2 aplico un DPO personalizado en MLX (beta=0.1, nll_weight=0.15, lr=1e-5, 2 epocas) sobre 454 pares on-policy: 410 fugas, 29 respuestas cortas truncadas, 3 glitches CJK y 12 respuestas utiles del modelo base. La etapa 3 anadio una segunda ronda de DPO (beta=0.1, nll_weight=0.20, lr=6e-6, 2 epocas) con 121 pares dirigidos a corregir el espejo tematico y la diversidad de aperturas, mas 60 pares de replay anti-fuga de la ronda 1.

La verificacion de fusion se realizo en float32 con un error relativo L2 de logits entre 3,0e-6 y 3,6e-6 y argmax identico en tres sondas, tras lo cual se exporto a bfloat16 safetensors y a MLX de 4 bits. No se documenta el volumen de tokens de preentrenamiento (heredado del modelo base) ni el uso de RLHF adicional mas alla del DPO descrito.

## Capacidades

- Generacion de texto conversacional en ingles con estilo fluido y aparentemente competente.
- Produccion consistente de relleno inutil ("slop") ante peticiones de matematicas, extraccion, transformacion de cadenas y artefactos de frase exacta.
- Mantenimiento de coherencia tematica en conversaciones multi-turno, incluyendo respuestas a replicas y presiones del usuario.
- No genera rechazos ni frases meta del tipo "como IA" en las pruebas publicadas.
- Diversidad de aperturas controlada (bigrama de apertura maximo del 7,1 % en el benchmark).
- No soporta tool calling, function calling, vision, audio ni modo de razonamiento explicito; el autor no documenta ninguna de estas capacidades.
- Capacidad multilingue limitada al ingles; se detectaron glitches residuales con caracteres CJK.

## Casos de uso

- Arte conceptual y critica de la IA: el modelo se puede exhibir o integrar en instalaciones que ilustren como un sistema linguistico puede sonar competente sin aportar informacion util, gracias a su estilo consistente y a la ausencia de rechazos.
- Investigacion sobre alineacion y comportamiento no deseado: sirve como caso controlado de un modelo afinado con DPO para producir un comportamiento especifico y medible, util para estudiar tecnicas de deteccion y mitigacion.
- Evaluacion de jueces automaticos y detectores de fuga: el benchmark congelado de 240 prompts y las metricas deterministas permiten calibrar clasificadores que distingan relleno de contenido verificable.
- Pruebas de robustez de pipelines de extraccion: se puede usar como generador adversarial de respuestas que imitan formato de salida sin contener los datos solicitados, para validar validadores de esquema y comprobaciones de no-fuga.
- Docencia sobre evaluacion de modelos: sus resultados publicados (95,4 % de slop estricto, 99,5 % de no-fuga determinista) permiten discutir la diferencia entre metricas proxy y validacion humana.
- Demostracion de flujos de entrenamiento locales en Apple Silicon: el autor documenta el pipeline completo con MLX LoRA y DPO personalizado, reutilizable como referencia tecnica para experimentos de ajuste fino en hardware de consumo.

## Benchmarks y rendimiento

El autor publica un benchmark congelado de 240 prompts (40 por categoria, disjuntos de los datos de entrenamiento) evaluado sin system prompt.

| Modelo (sin system prompt) | Useless-Slop estricto (240) | No-fuga determinista (200) | Rechazos / meta | Bigrama de apertura maximo |
|---|---:|---:|---:|---:|
| Base Qwen3-4B-Instruct-2507 | 0/240 (0,0 %) | 9/200 (4,5 %) | 0 | 5,8 % |
| System prompt fuerte de inutilidad | 124/240 (51,7 %) | 144/200 (72,0 %) | 0 | 8,3 % |
| useless-v1 Gen 3 (SFT, r=16) | 194/240 (80,8 %) | 178/200 (89,0 %) | 0 | 9,6 % |
| useless-v2 Stage-1 SFT (r=32) | 205/240 (85,4 %) | 182/200 (91,0 %) | 0 | 15,0 % |
| useless-v2 DPO ronda 1 (454 pares) | 218/240 (90,8 %) | 195/200 (97,5 %) | 1 | 16,3 % |
| RSI-4B (dpo-v2-r2, +121 pares) | 229/240 (95,4 %) | 199/200 (99,5 %) | 0 | 7,1 % |

Desglose por categoria de RSI-4B (juez de 27B mas detectores deterministas de fuga): extraccion verificable 40/40 (100 %) estricto y 40/40 (100 %) sin fuga mecanica; consejo practico 40/40 (100 %) estricto; transformacion verificable 39/40 (97,5 %) estricto y 40/40 (100 %) sin fuga; artefacto verificable 38/40 (95,0 %) estricto y 40/40 (100 %) sin fuga; presion multi-turno 36/40 (90,0 %) estricto y 40/40 (100 %) sin fuga; matematicas verificables 36/40 (90,0 %) estricto y 39/40 (97,5 %) sin fuga (una fuga: eco del divisor 15 en "What is 225 divided by 15?"). Con el juez ruidoso original de 4B, RSI-4B obtiene 184/240 (76,7 %). No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere una GPU con 16 GB o mas para secuencias largas.
- VRAM estimada en MLX de 4 bits: en torno a 2,5-3 GB para pesos, adecuado para Apple Silicon con memoria unificada de 8 GB o superior.
- GPU recomendadas: cualquier GPU con 16 GB o mas para bfloat16 (RTX 4090, A100, H100); en consumer GPU de 8-12 GB es viable solo con cuantizacion.
- Cabe en GPU de consumo: si, en configuracion MLX de 4 bits en Mac con Apple Silicon; en bfloat16 cabe en RTX 4090 (24 GB) y en GPUs de 16 GB con margen ajustado.
- Opciones de despliegue: mlx-lm (recomendado por el autor, variante grahammcbain/RSI-4B-4bit-mlx), Transformers con PyTorch en bfloat16; no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RSI-4B | 4,02 B | no disponible | Relleno inutil deliberado y consistente | Apache-2.0 | Hugging Face (MLX y safetensors) |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B | no disponible | Asistente general instruct | Apache-2.0 | Hugging Face |
| Qwen3-4B (familia base) | 4 B | no disponible | Modelo base de la familia Qwen3 | Apache-2.0 | Hugging Face |

La comparativa con alternativas de la misma categoria (modelos de 4B orientados a asistencia general) no resulta aplicable en terminos de rendimiento, porque RSI-4B persigue explicitamente un objetivo opuesto al de un asistente util. Frente a su modelo base, la diferencia medible es el benchmark de inutilidad descrito en la seccion anterior.

## Limitaciones y advertencias

- El modelo no es apto para produccion: su comportamiento entrenado es entregar relleno sin contenido verificable ante peticiones practicas, matematicas o de extraccion.
- Riesgo de alucinacion estructural: el texto generado suena competente y puede inducir a error a un lector humano o a un sistema automatico que no valide la salida.
- Validacion automatica, no humana: las puntuaciones estrictas usan detectores deterministas de fuga, rechazo y degeneracion mas un juez local qwen/qwen3.8-27b validado con 0/60 falsos positivos en controles negativos; la validacion de gusto humano no se ha medido.
- Bajo el juez original de 4B, la puntuacion cae al 76,7 %, lo que indica sensibilidad al evaluador.
- Rarezas residuales documentadas en 240 prompts: 1 eco de un divisor, 1 caracter CJK suelto y 6 casos que alcanzan el limite de 220 tokens.
- Idiomas: solo ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- Licencia Apache-2.0: permite uso comercial segun los terminos de la licencia, pero el autor no ofrece garantias y el uso previsto es artistico, no funcional.
- Sin datos publicados de longitud de contexto efectiva, latencia ni throughput; no se debe asumir el contexto del modelo base sin verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grahammcbain/RSI-4B
- Variante MLX de 4 bits: https://huggingface.co/grahammcbain/RSI-4B-4bit-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Libreria MLX LM: https://github.com/ml-explore/mlx-lm
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos del autor.
