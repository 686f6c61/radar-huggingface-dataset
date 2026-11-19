# sairaph-official/Ministral-3-3B-Instruct-2512-4a82790

## Resumen

Ministral-3-3B-Instruct-2512 es un modelo de lenguaje de 3.000 millones de parametros desarrollado por Mistral AI, disenado para generacion de texto con capacidad de instruccion. Esta ficha concreta corresponde a una conversion al formato LiteRT-LM (`.litertlm`) realizada por la comunidad `litert-community` y replicada sin modificaciones por `sairaph-official`, orientada a inferencia en dispositivo (on-device) en moviles, portatiles y equipos de escritorio con aceleracion GPU o CPU.

La conversion es solo de texto: se conserva el decodificador de Ministral-3 y se descarta la torre de vision de Pixtral. Los pesos se cuantizan a int4 por bloques de 32 con recorte simetrico OCTAV, mientras que el embedding y la lm_head (atados) se mantienen en INT8. El resultado es un unico fichero de aproximadamente 2,3 GB que cabe en dispositivos con memoria limitada y que se ejecuta con el runtime LiteRT-LM de Google (el sucesor de TensorFlow Lite).

Su relevancia actual radica en que permite ejecutar un modelo de instruccion de 3B parametros en hardware de consumo y movil con latencias de decodificacion de hasta 129 tok/s en un Apple M4 Max y 22 tok/s en un Galaxy S26, con licencia Apache-2.0, lo que facilita su integracion en aplicaciones locales sin dependencia de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (decodificador de texto de Ministral-3; sin torre de vision) |
| Parametros totales | 3.000 millones (modelo base Ministral-3-3B-Instruct-2512) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (KV cache del fichero convertido; ekv4096) |
| Tipos de cuantizacion | int4 por bloques (block 32), simetrica, OCTAV clipping; embedding/lm_head en INT8; computo entero |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), fichero unico de 2.342.895.616 bytes (2,34 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Ministral-3-3B-Instruct-2512 de Mistral AI, un transformer decoder-only de 3.000 millones de parametros con entrenamiento por instrucciones. La version aqui descrita no contiene la torre de vision de Pixtral: la conversion elimina esa parte y conserva unicamente el decodificador de texto, por lo que la salida es exclusivamente textual.

La conversion a LiteRT-LM aplica cuantizacion int4 por bloques de 32 con truncamiento simetrico OCTAV, dejando el embedding y la lm_head atados en INT8. El fichero incluye una firma de prefill de 16 tokens (ademas de `prefill_128`) para acelerar el primer token. El grafo fue reescrito el 2026-10-06 con `--apply_gpu_composites`: una operacion `odml.cache_update` por capa para escribir la KV cache, productos de atencion con `odml.runtime_bmm` y una entrada `param_tensor` de tipo INT32[1,1,1,7] rellenada por el runtime. La mascara de atencion permanece en FLOAT32 y se suma a los logits por broadcast. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de RLHF/DPO del modelo original en la informacion proporcionada.

## Capacidades

- Generacion de texto e instruccion: responde a prompts conversacionales y de tarea general en formato instruct.
- Razonamiento y matematicas basicas: en una evaluacion de 30 preguntas de GSM8K (greedy, hasta 2048 tokens) acierta 26.
- Generacion de codigo: capacidad propia del modelo base de instruccion, aunque no se han publicado resultados de benchmarks de codigo en esta ficha.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales: modo de pensamiento (thinking mode), vision y audio no disponibles en esta conversion; la vision se elimino de forma explicita.
- Inferencia on-device: disenado para ejecutarse localmente con aceleracion GPU (WebGPU, GPU de Android, Metal) o CPU.

## Casos de uso

- Asistente conversacional local en movil: el fichero de 2,34 GB cabe en un telefono moderno y con LiteRT-LM logra 22,1 tok/s en un Galaxy S26 y 6,8 tok/s en un Pixel 8a, suficiente para chat multi-turno con una KV cache de 4096 tokens.
- Chat en navegador sin backend: la demo oficial carga `Ministral-3-3B-Instruct-2512_q4_block32_ekv4096.litertlm` y lo ejecuta con WebGPU, util para prototipos o aplicaciones web que no pueden enviar datos a un servidor.
- Generacion de texto en portatiles y equipos de escritorio: en un Mac Studio M4 Max alcanza 129,5 tok/s de decodificacion y 1.340 tok/s de prefill, adecuado para redaccion asistida, resumenes y edicion de texto en local.
- Clasificacion y extraccion de informacion offline: al no requerir red ni GPU dedicada, sirve para procesar documentos sensibles en el propio dispositivo, reduciendo el riesgo de filtracion de datos.
- Automatizacion de tareas de texto en aplicaciones de escritorio y moviles: integrable mediante el runtime LiteRT-LM para asistentes de correo, notas o formularios que necesitan instrucciones y salida estructurada sin dependencia de la nube.
- Evaluacion educativa y demos de IA en dispositivo: con 26/30 en GSM8K, resulta util para tutoria basica de matematicas y para demostraciones de razonamiento en hardware de consumo.
- Prototipado rapido de pipelines de texto: el fichero unico y la licencia Apache-2.0 permiten incorporarlo a pruebas de concepto y benchmarks comparativos de runtimes (LiteRT-LM frente a otros) sin coste de licencia.

## Benchmarks y rendimiento

Resultados publicados en la model card (no se dispone de MMLU, HumanEval ni otros benchmarks estandar):

| Prueba | Resultado |
|---|---|
| GSM8K (30 preguntas, greedy, hasta 2048 tokens) | 26/30 correctas |
| Apple M4 Max, LiteRT-LM 0.17.1, GPU, decode 256 tokens | 129,5 tok/s |
| Apple M4 Max, GPU, prefill 256 tokens | 1.340 tok/s |
| Apple M4 Max, GPU, TTFT con prefill de 16 tokens | 0,038 s |
| Apple M4 Max, CPU, decode 256 tokens | 22,5 tok/s |
| Apple M4 Max, CPU, TTFT con prefill de 16 tokens | 0,589 s |
| Galaxy S26, LiteRT-LM prebuilt-adac974b, GPU | decode 22,1 tok/s; prefill 338 tok/s; TTFT 3,07 s |
| Pixel 8a, LiteRT-LM 0.16.0, GPU | decode 6,8 tok/s; prefill 8 tok/s; TTFT 1,68 s |

## Requisitos de hardware

- Tamano del fichero: 2,34 GB (2.342.895.616 bytes), con embedding externalizado para que cada seccion sea inferior a 2 GiB y el modelo pueda cargarse en iOS.
- VRAM/RAM estimada: no disponible de forma explicita; el fichero de 2,34 GB es una referencia del peso de los pesos en memoria.
- GPU compatibles: aceleracion mediante WebGPU (navegador), GPU de Android (Galaxy S26, Pixel 8a), GPU de Apple Silicon (Mac Studio M4 Max). Cabe en GPU de consumo y en hardware movil; no requiere A100 ni H100.
- Despliegue: runtime LiteRT-LM (`litert_lm_mai` compilado desde el repositorio google-ai-edge/litert-lm), demo web oficial con WebGPU y aplicacion LLM Server de Sairaph.
- Latencia y throughput: ver tabla de benchmarks; TTFT de 0,038 s en M4 Max con prefill de 16 tokens y de 3,07 s en Galaxy S26.
- Delegacion de operaciones: 1.210 operaciones delegadas en M4 Max y Galaxy S26, 1.187 en Pixel 8a.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral-3-3B-Instruct-2512 (LiteRT-LM, esta ficha) | 3B | 4096 (KV cache) | `.litertlm`, on-device | Apache-2.0 | Hugging Face (sairaph-official y litert-community) |
| Ministral-3-3B-Instruct-2512 original (Mistral AI) | 3B | no disponible | safetensors, servidor/GPU | Apache-2.0 | Hugging Face (mistralai) |
| Otros modelos `.litertlm` de litert-community | no disponible | no disponible | `.litertlm`, on-device | no disponible | Hugging Face (litert-community) |

No se dispone de datos de benchmarks comparativos con otros modelos de 3B en la informacion proporcionada.

## Limitaciones y advertencias

- Es una conversion cuantizada a int4: puede perder precision respecto al modelo original en tareas de razonamiento fino o generacion larga.
- Solo texto: la torre de vision de Pixtral se elimino en la conversion, por lo que no admite imagenes.
- Contexto limitado a 4096 tokens de KV cache; no es adecuado para documentos muy largos ni conversaciones de muchas vueltas sin gestion de memoria.
- Idiomas soportados no documentados en esta ficha; el rendimiento fuera del ingles o del castellano no esta verificado.
- Riesgo de alucinacion y sesgos: no hay informacion publicada sobre evaluaciones de sesgo o robustez para esta conversion.
- La licencia Apache-2.0 permite uso comercial, pero el fichero es una copia no modificada del repositorio upstream `litert-community/Ministral-3-3B-Instruct-2512` (commit `4a82790a583e38c8101b7632aafa0ab84a7dea7d`); conviene verificar la procedencia.
- El autor Sairaph anadio un fichero `LICENSE` (copia de Apache-2.0) que no existe en el repositorio upstream; el resto de ficheros son byte-identicos al commit referenciado.
- Dependencia del runtime LiteRT-LM: no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI; requiere el runtime de Google.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/sairaph-official/Ministral-3-3B-Instruct-2512-4a82790
- Repositorio upstream (litert-community): https://huggingface.co/litert-community/Ministral-3-3B-Instruct-2512
- Modelo base (Mistral AI): https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web con WebGPU: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Ministral-3-3B-Instruct-2512
- Tarjeta de resultados edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/ministral3-3b/CARD.md
- Benchmark de runtimes en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
