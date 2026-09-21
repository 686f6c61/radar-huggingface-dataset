# Geeshan/dolphin-2.6-mistral-7B-dpo-laser-GGUF

## Resumen

Dolphin 2.6 Mistral 7B DPO Laser GGUF es la version cuantizada en formato GGUF del modelo cognitivecomputations/dolphin-2.6-mistral-7b-dpo-laser, desarrollado por Cognitive Computations. Se trata de un ajuste de instrucciones sobre la familia Mistral 7B (transformer denso decoder-only, 7.241.740.288 parametros) al que se le ha aplicado una etapa de DPO (Direct Preference Optimization), de ahi el sufijo "dpo-laser". El repositorio analizado (Geeshan/dolphin-2.6-mistral-7B-dpo-laser-GGUF) redistribuye los ficheros GGUF generados originalmente por TheBloke, con cuantizaciones de 2, 3, 4, 5, 6 y 8 bits para inferencia en CPU y GPU.

El interes practico del modelo esta en su relacion tamano/requisitos: con unos 7,24 mil millones de parametros y cuantizaciones que bajan de los 3 GB, se puede ejecutar en hardware de consumo (portatiles con 16 GB de RAM o GPUs de 8-12 GB de VRAM) mediante llama.cpp, Ollama o LM Studio. La mezcla de datos de entrenamiento combina instrucciones generales (dolphin, openhermes, capybara), QA tecnico y de razonamiento (airoboros-2.2.1) y una parte sustancial de codigo (dolphin-coder, Magicoder-OSS-Instruct-75K, Magicoder-Evol-Instruct-110K), lo que lo orienta a asistentes conversacionales en ingles y a generacion de codigo local.

La licencia declarada es Apache 2.0 y el unico idioma soportado segun la model card es el ingles. La informacion consultada no detalla longitud de contexto, recuento de tokens de entrenamiento ni resultados de benchmarks, y el repositorio no registra descargas ni likes, por lo que debe tratarse como una redistribucion no verificada de los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Mistral 7B); ajuste por instrucciones mas etapa DPO |
| Parametros totales | 7.241.740.288 (aproximadamente 7,24 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF de 2, 3, 4, 5, 6 y 8 bits; la model card menciona explicitamente Q2_K y las familias de 2 a 8 bits de TheBloke |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (GGUFv2) en este repositorio; el modelo original sin cuantizar esta en formato PyTorch fp16. Existen tambien versiones AWQ y GPTQ en repositorios separados |

Datos adicionales del repositorio: plantilla de prompt ChatML, tamano total del repositorio 55,0 GB, creado el 2026-09-21, 0 descargas y 0 likes, `inference: false` en los metadatos.

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Mistral 7B: un transformer denso decoder-only con 7.241.740.288 parametros. Sobre ese modelo se aplico un ajuste supervisado con una mezcla de siete datasets publicos (ehartford/dolphin, jondurbin/airoboros-2.2.1, ehartford/dolphin-coder, teknium/openhermes, ise-uiuc/Magicoder-OSS-Instruct-75K, ise-uiuc/Magicoder-Evol-Instruct-110K y LDJnr/Capybara) y despues una etapa de optimizacion por preferencias (DPO), segun indican el nombre del modelo y las etiquetas del repositorio. La informacion consultada no especifica el numero de tokens de entrenamiento, la composicion porcentual del dataset, ni los hiperparametros del DPO.

El termino "laser" hace referencia a la variante o tecnica concreta empleada por Cognitive Computations en esta version; la model card consultada no la describe, por lo que no se puede detallar su funcionamiento. La etiqueta `arxiv:2312.13558` apunta a una referencia cientifica asociada, pero su contenido no se incluye en la informacion facilitada. La model card esta truncada en el apartado de explicacion de metodos de cuantizacion (GGML_TYPE_Q2_K y siguientes), por lo que no se dispone de la descripcion completa de cada nivel de bits.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con plantilla ChatML (`<|im_start|>system ... <|im_end|>`), lo que facilita su integracion en frameworks que ya soportan ese formato.
- Seguimiento de instrucciones generales y asistencia en tareas de conocimiento, derivado de los datasets dolphin, openhermes y capybara.
- Generacion y explicacion de codigo: tres de los siete datasets de entrenamiento son especificos de programacion (dolphin-coder, Magicoder-OSS-Instruct-75K, Magicoder-Evol-Instruct-110K).
- Razonamiento tecnico y respuestas de estilo QA, procedente de airoboros-2.2.1, un dataset con categorias de logica, matematicas, codigo y trivia.
- Capacidades multilingues: limitadas al ingles segun la model card (`language: en`).
- Tool calling / function calling: no documentado en la informacion disponible.
- Uso en agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" o razonamiento extendido explicito: no documentado.

## Casos de uso

- Asistente conversacional local en ingles: con la cuantizacion Q4_K_M (unos 4,4 GB) el modelo cabe en portatiles con 16 GB de RAM y en GPUs de 8 GB de VRAM, por lo que se puede desplegar como chatbot de escritorio con LM Studio, GPT4All o KoboldCpp sin conexion a internet.
- Generacion de codigo en entornos aislados: al haber sido ajustado con Magicoder y dolphin-coder, resulta adecuado para completar funciones, explicar fragmentos y generar pruebas unitarias en maquinas sin acceso a APIs externas, donde no se puede enviar codigo propietario a un servicio en la nube.
- Prototipado rapido de aplicaciones de chat: su compatibilidad con el servidor de llama.cpp (API compatible con OpenAI) y con llama-cpp-python permite levantar un endpoint de inferencia en minutos para validar un producto antes de migrar a un modelo mayor.
- Procesamiento por lotes de texto en ingles: tareas de resumen, reescritura, clasificacion y extraccion de campos sobre volumenes medios de documentos, ejecutables en CPU con cuantizaciones Q4 o Q5 y paralelizables por procesos.
- Base para ajuste fino adicional: al ser un Mistral 7B estandar en licencia Apache 2.0, sirve como punto de partida para LoRA o QLoRA en dominios verticales (legal, sanitario, atencion al cliente) partiendo del modelo fp16 original.
- Investigacion sobre alineacion y DPO: permite comparar el comportamiento del modelo ajustado con DPO frente al modelo base o a versiones solo SFT, util en estudios sobre desplazamiento de distribucion y adherencia a preferencias.
- Tutoria y explicacion de conceptos tecnicos en ingles: el modelo mantiene conversaciones multi-turno y puede reformular explicaciones a peticion del usuario, con la limitacion de no disponer de contexto largo documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card consultada esta truncada y no incluye tablas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y la busqueda web realizada no aporto datos adicionales.

## Requisitos de hardware

Los tamanos de fichero son estimaciones calculadas a partir del numero de parametros (7,24 mil millones) y de los bits por peso, ya que la model card consultada no lista cada fichero individualmente.

| Cuantizacion | Tamano aproximado de pesos | VRAM/RAM minima orientativa (con contexto corto) |
|---|---|---|
| Q2_K | 2,9 GB | 4 GB |
| Q3_K_M | 3,5 GB | 5 GB |
| Q4_0 / Q4_K_S | 4,1-4,2 GB | 6 GB |
| Q4_K_M | 4,4 GB | 6-8 GB |
| Q5_K_M | 5,1 GB | 7-9 GB |
| Q6_K | 5,9 GB | 8-10 GB |
| Q8_0 | 7,7 GB | 10-12 GB |
| fp16 (modelo original) | 14,5 GB | 18-20 GB |

- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 usando cuantizaciones de 4 a 8 bits; en GPUs de 8 GB (RTX 3070, RTX 4060) es recomendable Q4_K_M o inferior y limitar el contexto.
- GPU profesionales: A100, H100 y L40S son viables pero sobredimensionadas para inferencia de un solo usuario; su interes esta en servir muchas peticiones concurrentes en fp16 o en las versiones AWQ/GPTQ.
- CPU y Apple Silicon: con 16 GB de RAM unificada se puede ejecutar Q4_K_M o Q5_K_M en llama.cpp con aceleracion Metal; con 8 GB de RAM conviene bajar a Q3_K_M o Q2_K.
- Opciones de despliegue: llama.cpp (binario `llama-server`), Ollama, LM Studio, text-generation-webui, KoboldCpp, GPT4All, llama-cpp-python, candle y Faraday.dev, entre otros. vLLM y TGI no estan orientados al formato GGUF; en esos motores habria que usar las versiones AWQ, GPTQ o el modelo fp16.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion se limita a parametros, licencia, formato y disponibilidad, porque no hay resultados de benchmarks publicados en la informacion consultada. Los datos de contexto y rendimiento de los modelos alternativos no forman parte de la informacion proporcionada.

| Modelo | Parametros | Idioma | Licencia | Formatos disponibles | Notas |
|---|---|---|---|---|---|
| Dolphin 2.6 Mistral 7B DPO Laser (este repositorio) | 7.241.740.288 | en | apache-2.0 | GGUF (2-8 bits), AWQ, GPTQ, fp16 | Ajuste SFT + DPO; contexto no documentado en la informacion disponible |
| Mistral 7B Instruct v0.1 / v0.2 | 7.241.740.288 | en | apache-2.0 | safetensors, GGUF, AWQ, GPTQ | Alternativa oficial de Mistral AI con la misma arquitectura base y licencia equivalente |
| Zephyr 7B beta | 7.241.740.288 | en | MIT | safetensors, GGUF, AWQ, GPTQ | Ajuste por DPO sobre Mistral 7B; licencia permisiva distinta (MIT) |
| Llama 2 7B Chat | aproximadamente 6,74 mil millones | en | licencia comunitaria de Llama 2 (con restricciones de uso) | safetensors, GGUF, GPTQ | Licencia con clausulas adicionales, menos flexible que Apache 2.0 para uso comercial |

## Limitaciones y advertencias

- Riesgo de alucinacion: es un modelo de 7 mil millones de parametros sin acceso a herramientas ni a recuperacion documental; puede inventar datos factuales, referencias y APIs.
- Idioma: solo ingles segun la model card. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Contexto: no se documenta la longitud de contexto soportada en la informacion consultada; conviene verificarla antes de desplegar tareas que requieran ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio es una redistribucion de terceros; conviene revisar los terminos de los datasets de entrenamiento y del modelo original antes de un uso en produccion.
- Repositorio no verificado: 0 descargas y 0 likes, publicado por el usuario Geeshan a partir del trabajo de cuantizacion de TheBloke. La fecha de creacion registrada (2026-09-21) es incoherente con la antiguedad del modelo base, lo que refuerza la necesidad de validar la integridad de los ficheros.
- Inconsistencia de metadatos: las etiquetas del Hub apuntan a `dphn/dolphin-2.6-mistral-7b-dpo-laser` como modelo base, mientras que la model card indica `cognitivecomputations/dolphin-2.6-mistral-7b-dpo-laser`. Son organizaciones distintas; hay que confirmar cual corresponde a los pesos de referencia.
- Model card incompleta: el README esta truncado en la seccion de cuantizacion y no incluye tabla de resultados ni guia de uso detallada.
- Alineacion y seguridad: la informacion disponible no describe filtros de seguridad ni evaluaciones de toxicidad. La familia Dolphin se distribuye sin las capas habituales de moderacion de los asistentes comerciales, por lo que en produccion se recomienda anadir validacion y moderacion externas.
- Sin soporte multimodal ni tool calling documentado: no se debe asumir capacidad de function calling ni de agentes sin verificacion previa.
- Rendimiento en produccion: no hay datos publicos de throughput ni latencia para este repositorio concreto; los numeros dependen de la cuantizacion, el hardware y la longitud de contexto.

## Enlaces

- Repositorio GGUF analizado: https://huggingface.co/Geeshan/dolphin-2.6-mistral-7B-dpo-laser-GGUF
- Modelo original sin cuantizar: https://huggingface.co/cognitivecomputations/dolphin-2.6-mistral-7b-dpo-laser
- GGUF original de TheBloke: https://huggingface.co/TheBloke/dolphin-2.6-mistral-7B-dpo-laser-GGUF
- Version AWQ: https://huggingface.co/TheBloke/dolphin-2.6-mistral-7B-dpo-laser-AWQ
- Version GPTQ: https://huggingface.co/TheBloke/dolphin-2.6-mistral-7B-dpo-laser-GPTQ
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2312.13558
- llama.cpp: https://github.com/ggerganov/llama.cpp
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- KoboldCpp: https://github.com/LostRuins/koboldcpp
- GPT4All: https://gpt4all.io/index.html
- LM Studio: https://lmstudio.ai/
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- candle: https://github.com/huggingface/candle
- Faraday.dev: https://faraday.dev/
- Datasets de entrenamiento: https://huggingface.co/datasets/ehartford/dolphin, https://huggingface.co/datasets/jondurbin/airoboros-2.2.1, https://huggingface.co/datasets/ehartford/dolphin-coder, https://huggingface.co/datasets/teknium/openhermes, https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K, https://huggingface.co/datasets/ise-uiuc/Magicoder-Evol-Instruct-110K, https://huggingface.co/datasets/LDJnr/Capybara

Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados utiles (unicamente paginas de inicio de sesion de Google), por lo que todos los enlaces anteriores proceden de la informacion de HuggingFace y de la model card del repositorio.
