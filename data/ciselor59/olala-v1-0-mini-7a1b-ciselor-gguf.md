# ciselor59/Olala-v1.0-mini-7A1B-Ciselor-GGUF

## Resumen

Olala v1.0 mini 7A1B es un modelo de lenguaje de arquitectura propietaria (denominada `olala` en el ecosistema GGUF) desarrollado por OVHai LLM (OVH LLM SAS). Se trata de un modelo de tipo mezcla de expertos (MoE) con aproximadamente 6.775 millones de parámetros totales, del cual solo una fracción reducida (alrededor de 1.000 millones, segun la model card del autor de la cuantizacion) se activa por token. Su ventana de contexto es de 32.000 tokens.

Esta ficha describe concretamente la version cuantizada publicada por el usuario independiente Ciselor bajo el identificador `ciselor59/Olala-v1.0-mini-7A1B-Ciselor-GGUF`. Se trata de un archivo GGUF de 3,72 GB que reduce el peso original en bf16 (13,59 GB) mediante una receta de cuantizacion mixta por tensor (IQ4_NL, Q3_K, Q4_K, Q5_K, Q6_K y BF16 selectivo), verificada con una matriz de importancia calculada sobre wikitext-2. El autor declara una divergencia KL de 0,0587 frente al bf16 y una coincidencia de token top-1 del 88,8 %.

La relevancia de esta publicacion es doble: por un lado, demuestra que es posible comprimir un modelo MoE de ~6,8B parametros hasta 3,72 GB con perdida acotada y medible; por otro, expone una dependencia critica de infraestructura, ya que el formato requiere un fork especifico de llama.cpp mantenido por OVHcloud y no es cargable en llama.cpp estandar, LM Studio ni Ollama. Ciselor no tiene vinculacion con OVHcloud y publica la cuantizacion bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (arquitectura `olala`, soportada solo por el fork de llama.cpp de OVHcloud) |
| Parametros totales | 6.775.272.608 (6,78B) |
| Parametros activos | Aproximadamente 1B (segun la model card del modelo base) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | GGUF mixta por tensor: IQ4_NL (`ffn_up_exps`), Q3_K (`ffn_down_exps`), BF16 (`ffn_latent_up`), Q6_K (`output`), Q4_K (`token_embd`), Q5_K (resto de matrices); normas y tensores pequenos sin cuantizar |
| Idiomas soportados | No disponible (la medicion de perplejidad se hizo sobre texto en ingles, wikitext-2) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo de 3,72 GB; el original bf16 pesa 13,59 GB) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de mezcla de expertos con tensores especificos (`ffn_up_exps`, `ffn_down_exps`, `ffn_latent_up`) que sugieren un diseno MoE con proyecciones latentes en el bloque feed-forward. La model card no detalla el numero de expertos, el mecanismo de enrutamiento ni la composicion exacta del dataset de entrenamiento. Tampoco se documentan en la informacion disponible las fases de alineacion (RLHF, DPO u otras) ni el volumen de tokens de preentrenamiento.

La innovacion tecnica destacable de esta publicacion no esta en el modelo sino en el proceso de cuantizacion. Ciselor aplica una receta de un formato por tensor, derivada de una matriz de importancia (`llama-imatrix` sobre 120 fragmentos de 512 tokens del split de entrenamiento de wikitext-2) y verifica el resultado con `llama-perplexity` sobre el split de test (16 fragmentos de 512 tokens, `-fa on -nr`, calculo de divergencia KL contra el GGUF bf16 oficial). El autor publica tanto la lista completa de tipos por tensor (`ciselor_recipe_3.7G.txt`) como la matriz de importancia (`olala_imatrix.gguf`), de modo que el archivo es reproducible con el comando exacto de `llama-quantize` incluido en la model card. Se preservan los metadatos originales y la plantilla de chat; `llama-quantize` solo anade sus campos habituales de cuantizacion.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` aparece en los metadatos del repositorio.
- Razonamiento multi-paso: la model card del modelo base menciona razonamiento largo, aunque advierte de posible repeticion en cadenas de razonamiento extensas.
- Capacidad multilingue: no documentada en la informacion disponible; las unicas mediciones publicadas son sobre texto en ingles.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el modelo es exclusivamente de texto.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Eficiencia computacional: al activar aproximadamente 1B de parametros por token, el coste de inferencia es sustancialmente menor que el de un modelo denso de 6,8B.

## Casos de uso

- Despliegue en CPU con memoria limitada: el archivo de 3,72 GB permite ejecutar el modelo en equipos sin GPU dedicada, siempre que se compile el fork de llama.cpp de OVHcloud y se use `llama-server -fa 1 -nr`. Es el escenario para el que el autor verifico el archivo (mediciones en CPU sobre Windows).
- Prototipado de asistentes conversacionales: con 32K tokens de contexto, el modelo puede mantener conversaciones multi-turno con historial extenso y documentos adjuntos de tamano medio en un portatil convencional.
- Investigacion sobre cuantizacion de MoE: la publicacion incluye receta por tensor, matriz de importancia y comandos de reproduccion, lo que la convierte en material de referencia para estudiar el impacto de formatos mixtos en modelos con expertos.
- Evaluacion comparativa de tecnicas de compresion: los datos de perplejidad, divergencia KL y coincidencia top-1 frente al bf16 permiten contrastar esta receta con otras estrategias (Q5_K_M oficial, receta compacta documentada por OVHcloud).
- Generacion de texto en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita la integracion en productos comerciales sin obligaciones de apertura del codigo propio.
- Tareas de resumen y reescritura de documentos: la ventana de 32K tokens admite articulos, informes o hilos de documentacion completos, aunque la limitacion de conocimiento factual del modelo base aconseja usar RAG para contenido especializado.
- Educacion y experimentacion: al ser un modelo pequeno en disco y con pesos abiertos, sirve para ensenar el funcionamiento interno de un MoE y el proceso de cuantizacion GGUF paso a paso.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a perplejidad y divergencia KL sobre wikitext-2 (split de test, 16 fragmentos de 512 tokens, CPU, fork de OVHcloud, version 0.5.0-dev):

| Archivo | Tamano | Perplejidad | KLD vs bf16 (menor = mas cercano) | Mismo token top-1 que bf16 |
|---|---|---|---|---|
| OVHcloud bf16 (referencia) | 13,59 GB | 13,79 ± 0,62 | — | — |
| OVHcloud Q5_K_M (oficial) | 5,99 GB | 13,91 ± 0,63 | 0,0218 ± 0,0010 | 92,2 ± 0,4 % |
| Receta compacta documentada por OVHcloud (reconstruida) | 4,27 GB | 14,26 ± 0,64 | 0,0702 ± 0,0034 | 85,2 ± 0,6 % |
| Ciselor 3.7G (este archivo) | 3,72 GB | 14,29 ± 0,65 | 0,0587 ± 0,0037 | 88,8 ± 0,5 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se han medido velocidad ni consumo de memoria, segun reconoce el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no medida por el autor. Como referencia de orden de magnitud, el archivo GGUF ocupa 3,72 GB, por lo que se necesita al menos esa cantidad de memoria (RAM o VRAM) mas el overhead del runtime y la cache KV para 32K tokens.
- GPU recomendadas: no disponibles. El autor solo ha probado el archivo en CPU y advierte que OVHcloud documenta posibles NaN en algunos backends GPU por las escalas de activacion en fp16.
- Compatibilidad con GPU de consumo: no verificada. No hay datos para RTX 4090, RTX 3090 ni gamas inferiores.
- Opciones de despliegue: exclusivamente el fork de llama.cpp de OVHcloud (repositorio `OVHai-LLM/llama.cpp`), con `llama-server -fa 1 -nr`. llama.cpp estandar, LM Studio y Ollama no pueden cargar la arquitectura `olala`.
- Latencia y throughput: no medidos. El autor indica explicitamente que velocidad y uso de memoria quedan pendientes de medicion.
- Nota operativa: en x86 se recomienda la flag `-nr` (`--no-repack`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Olala v1.0 mini 7A1B (Ciselor 3.7G GGUF) | 6,78B totales, ~1B activos | 32K | Apache 2.0 | GGUF, requiere fork de OVHcloud | Perplejidad 14,29 en wikitext-2 |
| Olala v1.0 mini 7A1B (Q5_K_M oficial) | 6,78B totales, ~1B activos | 32K | Apache 2.0 | GGUF, requiere fork de OVHcloud | Perplejidad 13,91; 5,99 GB |
| Olala v1.0 mini 7A1B (bf16) | 6,78B totales, ~1B activos | 32K | Apache 2.0 | GGUF bf16, requiere fork de OVHcloud | Referencia; 13,59 GB |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables de otros desarrolladores |

La comparacion solo puede establecerse dentro de la propia familia Olala, ya que la informacion disponible no incluye modelos de terceros con arquitectura MoE de tamano y contexto equivalentes.

## Limitaciones y advertencias

- Conocimiento factual limitado: la model card del modelo base lo reconoce explicitamente; no es adecuado como fuente de verdad sin recuperacion externa.
- Riesgo de repeticion en razonamiento largo: documentado por el autor del modelo base.
- Dependencia de un fork no estandar: sin el fork de llama.cpp de OVHcloud el archivo es inutilizable; esto limita la portabilidad y ata el despliegue al mantenimiento de ese repositorio.
- Riesgo de NaN en GPU: OVHcloud advierte que las cuantizaciones de Olala pueden producir NaN en ciertos backends GPU por las escalas de activacion en fp16; este archivo concreto no se ha probado en GPU.
- Perdida por cuantizacion medible: KLD de 0,0587 frente al bf16 y coincidencia top-1 del 88,8 %; la perplejidad sube de 13,79 a 14,29.
- Validacion linguistica incompleta: todas las mediciones se hicieron sobre wikitext-2 en ingles; no se evaluaron perdidas en otros idiomas.
- Sesgos: no documentados en la informacion disponible; al no haber datos sobre el dataset de entrenamiento, no es posible caracterizarlos.
- Rendimiento sin medir: no hay datos de latencia ni throughput, lo que impide estimar costes operativos en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso `NOTICE` original de OVHcloud y citar el modelo base segun indique su model card.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta; es una publicacion reciente y sin validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/ciselor59/Olala-v1.0-mini-7A1B-Ciselor-GGUF
- Modelo base en Hugging Face: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Fork de llama.cpp de OVHcloud: https://github.com/OVHai-LLM/llama.cpp
- Documentacion de la arquitectura en el fork (`docs/olala.md`): https://github.com/OVHai-LLM/llama.cpp/blob/main/docs/olala.md
- Guia de instalacion del fork (`docs/olala-setup.md`): https://github.com/OVHai-LLM/llama.cpp/blob/main/docs/olala-setup.md
- Contacto del autor de la cuantizacion: contact@ciselor.fr
