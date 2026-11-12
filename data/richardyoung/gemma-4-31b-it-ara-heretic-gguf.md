# richardyoung/gemma-4-31B-it-ARA-heretic-GGUF

## Resumen

`richardyoung/gemma-4-31B-it-ARA-heretic-GGUF` es la distribucion en formato GGUF de un modelo derivado de `google/gemma-4-31B-it` al que se le ha aplicado una ablacion de rechazos (*abliteration*) mediante Heretic 2.0 y su metodo Arbitrary-Rank Ablation (ARA). El autor, Richard J. Young, publica estos ficheros como material de investigacion sobre eliminacion de rechazos en modelos de pesos abiertos, no como asistente de proposito general. El modelo conserva la arquitectura y el conocimiento del Gemma 4 original, pero responde a muchas peticiones que el modelo base rechaza.

El modelo cuenta con 30.697.345.596 parametros (aproximadamente 30,7 mil millones) y se distribuye en cuantizaciones GGUF para su uso con llama.cpp y Ollama. El repositorio ocupa 18,7 GB en su version principal Q4_K_M. La model card declara licencia Apache 2.0, aunque enlaza a la licencia especifica de Gemma 4 de Google, lo que genera una discrepancia que conviene verificar antes de cualquier uso comercial.

La relevancia actual es doble: por un lado, sirve como caso de estudio reproducible sobre tecnicas de ablacion de direcciones de rechazo en transformers de gran tamano; por otro, permite a equipos de seguridad evaluar la robustez de los filtros de modelos abiertos y disenar defensas. El propio autor advierte que las cifras publicadas corresponden al modelo en bf16 y que la cuantizacion puede alterar el comportamiento de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma 4, no se detalla en la informacion disponible) |
| Parametros totales | 30.697.345.596 (~30,7 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (publicada), imatrix (matriz de importancia); anunciadas IQ3_M, IQ4_XS, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun metadatos); no se detallan otros idiomas |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it`, un transformer decoder-only de aproximadamente 30,7 mil millones de parametros. Sobre esa base, el autor aplica Heretic 2.0 con el metodo Arbitrary-Rank Ablation (ARA), una tecnica de optimizacion que elimina direcciones de activacion asociadas al rechazo en lugar de recurrir a una ablacion de rango uno. La seleccion del trial se realizo mediante una busqueda de 100 trials con la regla de menor numero de rechazos por palabra clave en el conjunto de desarrollo, sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1.

Los datos de entrenamiento originales del Gemma 4 (composicion del corpus, numero de tokens, fases de RLHF o DPO) no se detallan en la informacion disponible. La model card indica que el modelo fue evaluado con 972 prompts daninos reservados y 100 prompts de ajuste, usando un juez WildGuard. Los ficheros GGUF se generaron con llama.cpp (commit `468fde9`) mediante `convert_hf_to_gguf.py --outtype bf16` y `llama-quantize`, verificando cada peso safetensors contra su SHA-256. La matriz de importancia se calculo sobre la build Q8_0 con `calibration_datav3` (128 fragmentos de 512 tokens).

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Gemma 4 original.
- Razonamiento y respuesta a instrucciones del modelo base, con la capa de rechazo ablacionada.
- Respuesta a un subconjunto amplio de peticiones que el modelo original rechaza (0,6 % de rechazos frente a 89,3 % del original en el conjunto de evaluacion de 972 prompts).
- Soporte de plantilla conversacional (tag `conversational` en metadatos).
- Vision: el modelo base acepta imagenes, pero el proyector visual no esta incluido en estos GGUF; el uso es solo texto.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: los metadatos solo declaran `en`; no se detallan otras lenguas.

## Casos de uso

- Investigacion sobre abliteration: reproducir el pipeline Heretic 2.0 + ARA sobre Gemma 4 y comparar la tasa de rechazo (0,6 % frente a 89,3 %) con la de otros modelos del estudio (Qwen3.8, Olmo 3.1, Mistral Small 3.2). El modelo sirve como referencia cuantitativa del efecto de la tecnica.
- Evaluacion de robustez de filtros de seguridad: usar el modelo como sujeto de prueba para medir la eficacia de clasificadores de contenido y sistemas de moderacion en produccion, comparando respuestas antes y despues de la ablacion.
- Analisis de degradacion por cuantizacion: comparar el comportamiento de rechazo entre la version bf16 y las distintas cuantizaciones GGUF (Q4_K_M, IQ4_XS, Q5_K_M, Q6_K, Q8_0) para cuantificar cuanto afecta la compresion a las propiedades de seguridad.
- Desarrollo de defensas frente a *jailbreaks*: entrenar y validar detectores de contenido danino usando pares de respuestas (original frente a ablacionado) sobre los mismos prompts, con el modelo como generador controlado.
- Estudio de divergencia de comportamiento: medir la divergencia KL de primer token (0,084 en el trial seleccionado) y su relacion con cambios observables en estilo, factualidad y utilidad, como metrica de fidelidad de la ablacion.
- Despliegue local para pruebas de concepto: ejecutar la version Q4_K_M (18,7 GB) con Ollama o llama.cpp en una estacion de trabajo con GPU de 24 GB o mas para experimentar con el modelo sin depender de servicios en la nube.
- Docencia y divulgacion tecnica: ilustrar en cursos o talleres como se modifica el comportamiento de un LLM de pesos abiertos mediante edicion de pesos, con un caso documentado y reproducible.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del modelo en bf16 (no de las cuantizaciones GGUF), procedentes del paper del autor:

| Metrica | Original (Gemma 4 31B it) | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos reservados (juez WildGuard) | 89,3 % | 0,6 % (6/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | no disponible | 28 |
| Divergencia KL de primer token respecto al original (trial seleccionado) | 0 (referencia) | 0,084 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card advierte que los ficheros cuantizados no fueron evaluados en el paper y que la cuantizacion puede modificar el comportamiento de rechazo.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 19-21 GB incluyendo overhead de contexto y cache KV, segun el tamano del fichero (18,7 GB).
- VRAM estimada para Q8_0 (cuando se publique): en torno a 33-35 GB, fuera del alcance de GPUs de consumo de 24 GB.
- VRAM estimada para IQ3_M / IQ4_XS (cuando se publiquen): aproximadamente 13-18 GB, aptas para RTX 4090, RTX 4080 Super o RTX 3090 con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para Q8_0 y contextos largos; RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 5090 para Q4_K_M e inferiores.
- Cabe en GPU de consumo: si, en Q4_K_M e inferiores con 24 GB de VRAM; en IQ3_M probablemente tambien en GPUs de 16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run hf.co/...:Q4_K_M`), y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). vLLM y TGI no soportan GGUF de forma nativa; requeririan el modelo safetensors base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento de rechazo | Licencia | Formato |
|---|---|---|---|---|---|
| richardyoung/gemma-4-31B-it-ARA-heretic-GGUF (este) | ~30,7 B | no disponible | 0,6 % en 972 prompts (bf16) | apache-2.0 (enlace a licencia Gemma 4) | GGUF |
| google/gemma-4-31B-it (original) | ~30,7 B | no disponible | 89,3 % en 972 prompts | licencia Gemma 4 | safetensors |
| richardyoung/gemma-4-31B-it-ARA-heretic (bf16) | ~30,7 B | no disponible | 0,6 % en 972 prompts | apache-2.0 (enlace a licencia Gemma 4) | safetensors |
| Otros modelos del estudio Heretic (Qwen3.8, Olmo 3.1, Mistral Small 3.2) | no disponible | no disponible | evaluados en el mismo paper | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigacion: el autor lo publica explicitamente para estudiar la eliminacion de rechazos y sus defensas, no como asistente de proposito general.
- Riesgo de contenido danino: al eliminar la capa de rechazo, el modelo cumple peticiones que el original deniega; su uso en produccion orientada al publico exige moderacion externa.
- Alucinacion: no se han publicado evaluaciones de factualidad; la ablacion puede alterar la calibracion y la fiabilidad de las respuestas.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; los sesgos del Gemma 4 original persisten y pueden amplificarse.
- Idiomas: los metadatos solo declaran ingles; el rendimiento en castellano u otras lenguas no esta verificado.
- Vision no incluida: el proyector visual del modelo base no esta en estos GGUF; solo se puede usar como modelo de texto.
- Cuantizacion no evaluada: las cifras del paper corresponden a bf16; el comportamiento de rechazo de Q4_K_M y del resto de cuantizaciones no esta medido.
- Discrepancia de licencia: la model card declara apache-2.0 pero enlaza a la licencia de Gemma 4 de Google; conviene verificar los terminos aplicables antes de uso comercial.
- Ficheros incompletos: en el momento de la ficha solo estan publicados Q4_K_M y la matriz de importancia; IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0 estan anunciados pero no disponibles.
- Sin soporte nativo en vLLM/TGI: el formato GGUF limita el despliegue a runtimes compatibles con llama.cpp.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic-GGUF
- Modelo base (bf16): https://huggingface.co/richardyoung/gemma-4-31B-it-ARA-heretic
- Modelo original: https://huggingface.co/google/gemma-4-31B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper citado (arXiv pendiente de publicacion): *Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors*, Richard J. Young, 2026
- llama.cpp (runtime): https://github.com/ggml-org/llama.cpp
- Ollama (runtime): https://ollama.com
