# RegalInvader/Marco-Nano-Instruct-GGUF

## Resumen

Marco-Nano-Instruct-GGUF es un conjunto de cinco cuantizaciones de baja precision (1, 2 y 3 bits) del modelo ATH-MaaS/Marco-Nano-Instruct, un transformer de mezcla de expertos (MoE) con 8.001.454.080 parametros totales, 232 expertos y unos 0,6B de parametros activos por token. Lo publica el usuario RegalInvader bajo licencia Apache 2.0, con pesos en formato GGUF listos para llama.cpp, PocketPal y Ollama. El modelo base cubre 29 idiomas, entre ellos castellano, catalan no incluido, arabe, hindi-urdu, bengali, nepalí, kazajo y azeri.

La innovacion principal no es el modelo en si, sino el metodo de cuantizacion: en lugar de redondear los pesos de los expertos enrutados (que suponen el 96% de los parametros), el autor los entrena directamente en su formato de baja precision destilando del modelo original. El resultado son ficheros de 2,18 a 4,02 GB que conservan mucha mas fidelidad que las cuantizaciones nativas de llama.cpp del mismo tamano: el 3 bits alcanza una divergencia KL de 0,0277 nats por token frente al bf16 original, muy cerca del 0,0076 que obtiene un Q8_0 del mismo modelo.

El objetivo declarado es la inferencia en dispositivo (on-device): el fichero de 3 bits genera 24,8 tokens/s en un Pixel 10a (Tensor G4, 8 GB, 4 hilos de CPU), frente a 12,1 tokens/s de Gemma 4 E2B QAT y 5,2 tokens/s de Qwen3.5-4B en el mismo telefono y configuracion. Es relevante porque demuestra que un MoE de 8B puede ejecutarse de forma usable en un movil de gama alta sin conexion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, 232 expertos, aproximadamente 0,6B de parametros activos por token |
| Parametros totales | 8.001.454.080 (~8B) |
| Parametros activos | ~0,6B por token |
| Longitud de contexto | 8.192 tokens (los ejemplos de llama.cpp usan `-c 8192`; el autor indica entrenamiento y pruebas hasta 8K y caida de calidad por encima) |
| Tipos de cuantizacion | IQ3_S (down projection IQ4_NL), IQ2_S (IQ4_NL), IQ2_XXS (IQ4_NL), Q2_0, TQ1_0 ternario a 1,69 bits por peso (down projection Q2_0). Atencion y embeddings (atados) en Q8_0; router y norms en f32 |
| Idiomas soportados | 29: en, zh, ar, de, es, fr, ko, ja, pt, tr, id, it, nl, pl, ru, vi, th, he, uk, ms, bn, cs, ur, kk, el, ro, hu, ne, az |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repositorio de 15,3 GB con cinco ficheros |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de 8B parametros totales y 232 expertos, de los cuales solo se activan unos 0,6B por token. Los expertos enrutados concentran el 96% de los pesos, lo que explica por que la estrategia de cuantizacion se centra en ellos. La publicacion mantiene en Q8_0 la atencion y los embeddings atados, y en f32 el router y las normas, de modo que las decisiones de enrutamiento no se degradan con la cuantizacion.

El entrenamiento de cada fichero consiste en destilar el modelo original bf16 mientras los pesos de los expertos viven en su formato de baja precision: 24M tokens para IQ3_S, 50M para IQ2_S, 44M para IQ2_XXS (los ultimos 4M centrados en matematicas y codigo verificados), 200M para Q2_0 y 100M para TQ1_0. Los tres ficheros de mayor calidad usan escalas de codebook; los dos mas agresivos aplican entrenamiento consciente de la cuantizacion sobre la cuantizacion completa. El autor no detalla la composicion del dataset de destilacion ni si hubo RLHF o DPO en el modelo base; esa informacion no esta disponible en la model card.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat propia incluida en el fichero GGUF.
- Razonamiento y matematicas: el autor separa explicitamente los ficheros por rendimiento en matematicas y codigo (IQ2_XXS es "el mejor 2 bits en matematicas"); el fichero de 1 bit sacrifica estas dos areas.
- Codigo: presente en el modelo base y reforzado en la fase final del entrenamiento de IQ2_XXS; no hay datos de HumanEval.
- Multilingue: 29 idiomas, con cobertura destacada de lenguas de bajos recursos (ur, bn, ne, kk, az, ms, el, hu).
- Salida estructurada tipo JSON: el autor incluyo prompts JSON en la bateria de 72 pruebas de calidad.
- Ejecucion en dispositivo sin conexion mediante PocketPal y llama.cpp.
- Servidor compatible con la API de OpenAI a traves de `llama-server`.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente conversacional totalmente offline en movil: con el fichero IQ3_S (4,02 GB) y PocketPal 1.21.2 sobre un Pixel 10a se obtienen 24,8 tokens/s, suficiente para un chat fluido sin enviar datos a la nube.
- Traduccion entre lenguas de bajos recursos: el modelo cubre ur, bn, ne, kk, az, ms y el, pares para los que hay pocos modelos abiertos; se usaria con prompts de traduccion directa y contexto de hasta 8K tokens.
- Extraccion de datos estructurados en el borde: generacion de JSON a partir de texto libre en aplicaciones moviles o embebidas, con temperatura 0,7, top-p 0,9 y penalizacion de repeticion 1,1 para evitar bucles.
- Atencion al cliente en kioscos o terminales sin conectividad: conversaciones multi-turno con contexto de varios miles de tokens y KV cache en Q8_0 para reducir memoria.
- Backend ligero compatible con OpenAI: `llama-server -m Marco-Nano-Instruct-2bit-IQ2_XXS.gguf -c 8192 --jinja` permite integrar el modelo en herramientas que ya hablan el protocolo de OpenAI sin reescribir clientes.
- Prototipado rapido en portatil sin GPU: los ficheros de 2,18 a 3,46 GB caben en RAM y permiten validar prompts, plantillas y flujos antes de pasar a una GPU.
- Filtrado y resumen de documentos sensibles en local: al no requerir red, encaja en entornos con requisitos de privacidad donde el texto no puede salir del dispositivo.
- Aplicaciones educativas multilingues: el tamano reducido del fichero de 1 bit (2,18 GB) permite distribuirlo en dispositivos de gama media con 6-8 GB de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos cuantitativos son la divergencia KL respecto al modelo bf16 original y la velocidad de generacion medida en un Pixel 10a con PocketPal 1.21.2 (512 tokens de prompt, 128 generados, 4 hilos de CPU, KV cache f16).

| Fichero | Tamano | Bits por peso | KL vs. original (nats/token) | Pixel 10a (tok/s) |
|---|---|---|---|---|
| Marco-Nano-Instruct-3bit-IQ3_S.gguf | 4,02 GB | IQ3_S + IQ4_NL | 0,0277 | 24,8 |
| Marco-Nano-Instruct-2bit-IQ2_S.gguf | 3,46 GB | IQ2_S + IQ4_NL | 0,0566 | no medido |
| Marco-Nano-Instruct-2bit-IQ2_XXS.gguf | 3,14 GB | IQ2_XXS + IQ4_NL | 0,0914 | 31,6 |
| Marco-Nano-Instruct-2bit-Q2_0.gguf | 2,54 GB | Q2_0 (2,25 bits) | 0,196 | 32,2 |
| Marco-Nano-Instruct-1bit-TQ1_0.gguf | 2,18 GB | TQ1_0 ternario (1,69 bits) + Q2_0 | 0,264 | 36,6 |

Referencia del autor: un Q8_0 del modelo original obtiene una KL de 0,0076 en la misma prueba (40 secuencias multilingues retenidas de 4.096 tokens). La velocidad escala de forma inversa al tamano del fichero, con una ganancia de aproximadamente el 47% entre el 3 bits y el 1 bit.

## Requisitos de hardware

- Memoria: el fichero mas grande ocupa 4,02 GB y el mas pequeno 2,18 GB; hay que sumar la cache KV, que debe mantenerse en f16 o Q8_0. El autor advierte explicitamente de que una cache de claves Q4_0 rompe el modelo.
- Moviles: probado en un Pixel 10a con Tensor G4 y 8 GB de RAM. Configurar los hilos de CPU al numero de nucleos rapidos (4 en un Pixel); con el valor por defecto de 6 en PocketPal el rendimiento cae aproximadamente a la mitad en telefonos Tensor (31,6 frente a 16,8 tok/s con IQ2_XXS).
- GPU: no se han publicado mediciones en GPU en la informacion disponible. Por tamano de fichero, cualquier GPU consumer con 6 GB o mas de VRAM libre deberia poder alojar los ficheros de 2 y 3 bits, pero es una estimacion no verificada por el autor.
- Despliegue: llama.cpp (probado con la build b11385), `llama-server` como API compatible con OpenAI, Ollama (probado en v0.40.12, excepto TQ1_0) y PocketPal 1.21.2 o superior.
- Throughput conocido: de 24,8 a 36,6 tokens/s en Pixel 10a segun fichero. Latencia de primer token no disponible.
- Aviso de compatibilidad: el fichero Q2_0 usa el tipo Q2_0 de llama.cpp mainline (grupos de 64, 2,25 bits por peso); algunos forks definen un Q2_0 incompatible con el mismo nombre y pueden cargarlo produciendo basura sin error.

## Comparativa con modelos similares

Los unicos datos comparativos publicados son de velocidad en el mismo dispositivo (Pixel 10a, 4 hilos, KV cache f16); no hay comparaciones de calidad.

| Modelo | Parametros | Contexto | Licencia | Velocidad en Pixel 10a | Notas |
|---|---|---|---|---|---|
| Marco-Nano-Instruct 3 bits (IQ3_S) | 8B totales / 0,6B activos | 8K | Apache 2.0 | 24,8 tok/s | MoE con 232 expertos, 29 idiomas |
| Marco-Nano-Instruct 1 bit (TQ1_0) | 8B totales / 0,6B activos | 8K | Apache 2.0 | 36,6 tok/s | 2,18 GB, sacrifica matematicas y codigo |
| Gemma 4 E2B QAT | no disponible | no disponible | no disponible | 12,1 tok/s | Referencia del autor, mismas condiciones |
| Qwen3.5-4B | 4B (segun denominacion) | no disponible | no disponible | 5,2 tok/s | Referencia del autor, mismas condiciones |
| Cuantizaciones nativas de llama.cpp del mismo tamano | 8B | 8K | Apache 2.0 | no disponible | El autor afirma que retienen menos calidad que estas destiladas, sin cifras publicadas |

## Limitaciones y advertencias

- Bucles de repeticion: con temperatura baja el modelo entra en bucle con frecuencia. En 72 prompts de prueba, a temperatura 0,3 sin penalizacion, lo hicieron 26 respuestas con el 3 bits, 27 con el 2 bits y 45 con el 1 bit. El autor recomienda temperatura 0,7, top-p 0,9 y penalizacion de repeticion 1,1, lo que reduce los bucles a 2, 3 y 3 respectivamente.
- Longitud de contexto: el modelo fue entrenado y probado hasta 8K tokens; por encima de ese valor la calidad cae. No se debe asumir una ventana mayor aunque la arquitectura base la soporte.
- Respuestas sin terminacion: en algunos idiomas el modelo sigue generando en lugar de parar; se recomienda limitar la salida a 1.024-1.536 tokens.
- Cache KV: una cache de claves Q4_0 rompe el modelo; usar f16 o Q8_0.
- Compatibilidad: el fichero TQ1_0 de 1 bit no carga en Ollama (error de tensor no soportado) y requiere llama.cpp o PocketPal. El Q2_0 exige llama.cpp mainline b11385 o superior.
- Degradacion en matematicas y codigo: el autor la declara explicitamente para el fichero de 1 bit, y la KL de 0,264 nats/token implica una divergencia notable respecto al original en el conjunto de pruebas.
- Alucinacion: no hay evaluaciones de veracidad publicadas; se trata de un modelo de 8B con 0,6B activos cuantizado a 1-3 bits, por lo que el riesgo es alto en tareas factuales.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad en la informacion disponible.
- Traccion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de las cifras del autor.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar la licencia del modelo base ATH-MaaS/Marco-Nano-Instruct antes de redistribuir derivados.
- Fecha de publicacion: el repositorio figura creado el 2026-10-28, un dato que no se puede contrastar con la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RegalInvader/Marco-Nano-Instruct-GGUF
- Modelo base: https://huggingface.co/ATH-MaaS/Marco-Nano-Instruct
- PocketPal (aplicacion movil): https://github.com/a-ghorbani/pocketpal-ai
- llama.cpp (proyecto referenciado en la model card): https://github.com/ggml-org/llama.cpp
