# sairaph-official/Ministral-3-8B-Instruct-2512-1317284

## Resumen

Ministral-3-8B-Instruct-2512 es la version instruct del modelo de lenguaje de la familia Ministral 3 de Mistral AI, un transformer decoder-only denso de 8.489.553.920 parametros (8,4B en lenguaje mas 0,4B de codificador de vision en el release original) disenado para despliegue en el borde. Esta ficha concreta corresponde a la conversion al formato LiteRT-LM (`.litertlm`) publicada por litert-community y replicada sin modificaciones por sairaph-official, pensada para ejecutarse con el runtime LiteRT-LM de Google en dispositivos moviles y equipos de escritorio con GPU integrada.

La arquitectura consta de 34 capas, hidden size 4096, 32 cabezas de atencion con 8 cabezas KV, vocabulario de 131.072 tokens con embeddings no atados y una ventana de contexto original de 256K tokens (recortada a 4096 en estos ficheros LiteRT-LM). El modelo base esta publicado bajo licencia Apache 2.0 y Mistral AI lo posiciona como el miembro equilibrado de la familia Ministral 3, con capacidades de vision en el release original (aunque el codificador visual no se incluye en esta conversion, que es solo texto).

Su relevancia actual radica en que permite ejecutar un modelo de 8B en telefonos Android de gama alta (Galaxy S26) a 5,6-5,7 tok/s en GPU y en un Mac Studio M4 Max a 61,7 tok/s, con precision int4 que apenas pierde calidad frente a bf16 (96 frente a 95 en GSM8K con n=100). Es una pieza relevante para quien necesite inferencia local de calidad en hardware sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 8.489.553.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256K en el modelo base; 4096 en estos ficheros LiteRT-LM |
| Tipos de cuantizacion | int8 (dynamic en lineales, activaciones float) e int4 (blockwise-32 + OCTAV en lineales, embedding int8) |
| Idiomas soportados | once idiomas segun Mistral AI (del ingles al arabe); lista concreta no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base en safetensors BF16/FP8 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 34 capas, hidden size 4096 y 32 cabezas de atencion con 8 cabezas KV (GQA), vocabulario de 131.072 tokens y embeddings no atados. La version original de Mistral AI anade un codificador de vision de 0,4B parametros que no esta incluido en esta conversion LiteRT-LM, por lo que el resultado es estrictamente texto. Los pesos de esta conversion provienen del repositorio BF16 del modelo base (el repositorio plano publica pesos FP8) y se convirtieron con litert-torch 0.9.4.

La informacion proporcionada no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; el modelo card unicamente indica que se trata de la version post-entrenada para instrucciones y chat. La innovacion tecnica destacable de esta publicacion es la propia conversion a LiteRT-LM: ambos ficheros incluyen el grafo GPU-composite, con todas las firmas del decodificador delegadas en la GPU (1586, 1417 y 1448 operaciones en el delegado OpenCL del Galaxy S26), y la receta int4 emplea cuantizacion blockwise-32 mas OCTAV para reducir el tamano un 41,7 % respecto a int8 manteniendo la precision.

## Capacidades

- Generacion de texto y conversacion multi-turno en modo instruct.
- Razonamiento y matematicas basicas, con 96-97 sobre 100 en GSM8K en las versiones cuantizadas.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: Mistral AI declara once idiomas (del ingles al arabe) para el modelo base.
- Capacidad de vision: presente en el modelo base original, no incluida en esta conversion LiteRT-LM.
- Ejecucion en dispositivo (on-device) en Android y macOS con GPU integrada mediante el runtime LiteRT-LM.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Android: el fichero int4 se ejecuta en un Galaxy S26 a 5,6-5,7 tok/s en GPU y respondio correctamente a preguntas de cultura general; util para asistentes de voz o chat sin conexion.
- Procesamiento de texto en el dispositivo para privacidad: al no requerir red, encaja en aplicaciones donde los datos no pueden salir del terminal (sanidad, legal, finanzas personales).
- Generacion de resumenes y reescritura en movilidad: con contexto de 4096 tokens en estos ficheros, cubre documentos cortos y correos; el prefill de 1024 tokens mas 256 decodificados tarda 55 s en Galaxy S26.
- Prototipado rapido en portatiles Apple Silicon: en un Mac Studio M4 Max decodifica a 61,7 tok/s en GPU, suficiente para iterar en prompts y evaluar calidad antes de desplegar en servidor.
- Educacion y tutoria offline: el modelo responde a preguntas de conocimiento general y matematicas (96/100 en GSM8K) sin depender de servicios en la nube.
- Filtrado y clasificacion de texto en el borde: su tamano int4 de 5,04 GB permite integrarlo en pipelines locales de moderacion o etiquetado en dispositivos con 8 GB o mas de RAM.
- Evaluacion de conversiones LiteRT-LM: sirve como referencia para validar el runtime LiteRT-LM frente a transformers, ya que la model card reporta coincidencia exacta en el recuento de tokens con el tokenizador original.

## Benchmarks y rendimiento

| Benchmark | bf16 (transformers) | int8 (LiteRT-LM) | int4 (LiteRT-LM) |
|---|---|---|---|
| GSM8K (n=100) | 95 | 97 | 96 |
| Verificacion 8 preguntas (Mac M4 Max) | 8/8 | 8/8 CPU y GPU | 8/8 CPU y GPU |

Tiempos para 1024 tokens de prefill mas 256 de decodificacion a contexto 2048:

| Configuracion | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 5,45 s | 55,0 y 56,4 s | no ejecutado (regla de memoria) |
| int8 GPU | 6,79 s | no ejecutado | no ejecutado (excede la RAM) |
| int8 CPU | 30,5 s | no ejecutado | no ejecutado |
| int4 CPU | 38,3 s | no ejecutado | no ejecutado |

Decodificacion en Mac Studio M4 Max: 61,7 tok/s con int4 en GPU. En Galaxy S26: 5,6-5,7 tok/s con int4 en GPU. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: el fichero int4 ocupa 5,04 GB (4,18 GiB en la seccion principal de pesos) y el int8 8,64 GB (7,53 GiB en la seccion principal); la tabla de embeddings va en una seccion separada de 547.893.680 bytes.
- GPU recomendadas: GPU integrada de Apple Silicon (M4 Max medida), GPU de Android de gama alta (Galaxy S26 medida); no se han publicado pruebas en A100, H100 ni RTX 4090.
- Cabe en consumer GPU: si, en cualquier GPU con 6 GB o mas de VRAM para int4 y 9 GB o mas para int8, aunque las mediciones publicadas son de GPU integradas, no dedicadas.
- Despliegue: runtime LiteRT-LM 0.18.0 (probado) y 0.17.1 (probado con `run` simple); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- iOS: no medido; ambos ficheros superan el limite de 2 GiB por seccion, por lo que no son aptos para iOS tal como estan empaquetados.
- Latencia y throughput: ver tabla de benchmarks; int4 es mas rapido que int8 en las dos GPU medidas, mientras que en CPU de Mac int8 supera a int4 por un prefill el doble de rapido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Ministral-3-8B-Instruct-2512 (esta ficha, LiteRT-LM) | 8,49B | 4096 en estos ficheros | Apache 2.0 | `.litertlm` int4/int8 | Hugging Face (litert-community y mirror sairaph) |
| Ministral-3-8B-Instruct-2512 (original Mistral AI) | 8,4B + 0,4B vision | 256K | Apache 2.0 | safetensors BF16/FP8 | Hugging Face (mistralai) |
| Ministral-3-3B-Instruct-2512 (LiteRT-LM) | no disponible | no disponible | Apache 2.0 | `.litertlm` | Hugging Face (litert-community) |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto: el codificador de vision del modelo original no esta incluido en esta conversion.
- Contexto recortado a 4096 tokens frente a los 256K del modelo base, lo que limita casos de uso con documentos largos.
- No apto para iOS tal como esta empaquetado, por el limite de 2 GiB por seccion.
- El mirror de sairaph no incluye los ficheros int8, solo el int4; quien necesite int8 debe acudir al repositorio upstream de litert-community.
- El mirror anade ficheros de licencia que el repositorio upstream no tenia; conviene verificar la procedencia antes de uso en produccion.
- Riesgo de alucinacion inherente a modelos de 8B; no se han publicado evaluaciones de sesgo ni de robustez en la informacion disponible.
- La lista concreta de los once idiomas soportados no se detalla en la informacion proporcionada.
- Mistral AI recomienda temperatura inferior a 0,1 para uso diario y produccion; valores superiores pueden degradar la coherencia.
- No se han publicado resultados en MMLU, HumanEval ni otros benchmarks estandar, solo GSM8K y una verificacion de 8 preguntas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sairaph-official/Ministral-3-8B-Instruct-2512-1317284
- Repositorio upstream LiteRT-LM: https://huggingface.co/litert-community/Ministral-3-8B-Instruct-2512
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Pesos BF16 del modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Script de verificacion de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
- Conversion LiteRT-LM del modelo 3B: https://huggingface.co/litert-community/Ministral-3-3B-Instruct-2512
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
