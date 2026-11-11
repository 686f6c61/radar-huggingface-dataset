# LGTEAMai/Nano-1.3-Fast-GGUF

## Resumen

Nano 1.3-Fast es un modelo de lenguaje conversacional compacto y bilingüe (inglés y ruso) desarrollado por LGTEAMai, entrenado desde cero como parte de su proyecto de investigación "AI makes AI". La versión aquí descrita, `LGTEAMai/Nano-1.3-Fast-GGUF`, es la distribucion cuantizada del modelo original `LGTEAMai/Nano-1.3-Fast` en formato GGUF, preparada para su uso con llama.cpp, Ollama, LM Studio y otros runtimes compatibles. El modelo base cuenta con 254.190.720 parametros segun los safetensors publicados, aunque la model card del autor cita 197 millones, una discrepancia que conviene tener presente.

Se trata de un modelo deliberadamente minimalista: su ventana de contexto es de solo 1.024 tokens y el propio autor lo describe como adecuado para conversacion corta y sencilla, pero poco fiable para hechos y aritmetica. Su interes reside en el extremo opuesto al de los grandes modelos: con un fichero F16 de apenas 512 MB y una cuantizacion Q8_0 de 274 MB, puede ejecutarse comodamente en CPU de portatil, en una Raspberry Pi 5 o en un telefono, lo que lo convierte en una opcion practica para entornos con recursos muy limitados o para experimentacion educativa.

La licencia Apache 2.0 facilita su adopcion tanto en proyectos personales como comerciales, y el hecho de que el repositorio incluya el template de chat en Jinja, verificacion de tokenizacion y valores de muestreo recomendados reduce la friccion de integracion. No obstante, sus capacidades son las propias de un modelo de este tamano: no debe esperarse razonamiento complejo, conocimiento factual fiable ni soporte de tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 254.190.720 (safetensors); la model card cita 197 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (derivado de safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo transformer entrenado desde cero por LGTEAMai. No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion ni si emplea alguna variante como GQA o atencion lineal. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card original del repositorio base es la referencia indicada por el autor para obtener estos detalles.

El proceso de cuantizacion si esta documentado con precision: todos los ficheros GGUF se generaron con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp (commit `a4d4f2f`) a partir del release en safetensors. El autor verifico que los token ids producidos por llama.cpp coinciden con los del tokenizer de Hugging Face en 12 cadenas de prueba (ingles, ruso, codigo, numeros y tokens especiales), y que `llama-server --jinja` construye exactamente el formato de chat de entrenamiento a partir del template embebido, deteniendose correctamente en `<|end|>`. Las perplejidades medidas con `llama-perplexity` sobre una muestra fija de 311 KB de texto ingles y ruso (100 ventanas de 512 tokens) son: F16 25,65; Q8_0 25,70; Q6_K 25,74; Q5_K_M 26,17; Q4_K_M 26,28.

## Capacidades

- Generacion de texto conversacional en ingles y ruso, con respuestas breves y concisas segun el system prompt recomendado.
- Chat multi-turno dentro de una ventana de contexto muy limitada (1.024 tokens), suficiente para intercambios cortos.
- Soporte de formato de chat estructurado mediante template Jinja embebido en el GGUF, con tokens especiales `<|system|>`, `<|user|>`, `<|assistant|>` y `<|end|>`.
- Compatibilidad con la API OpenAI de llama-server (`/v1/chat/completions`), lo que permite integrarlo en clientes existentes.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se documentan capacidades de generacion de codigo o matematicas fiables; el autor advierte explicitamente que el modelo es poco fiable para hechos y aritmetica.

## Casos de uso

- Chat conversacional embebido en dispositivos de bajos recursos: con Q8_0 (274 MB) o Q4_K_M (201 MB) el modelo cabe en una Raspberry Pi 5 o en un telefono, permitiendo asistentes conversacionales offline sin conexion a la nube.
- Prototipado rapido de interfaces de chat: al exponer una API compatible con OpenAI mediante `llama-server`, se puede integrar en un frontend existente en minutos para validar flujos de conversacion antes de migrar a un modelo mayor.
- Educacion e investigacion sobre LLM: su tamano reducido y su entrenamiento desde cero lo hacen util para estudiar tokenizacion, cuantizacion (comparando perplejidad entre F16, Q8_0 y Q4_K_M) y formatos de chat en un entorno controlado.
- Asistente de texto para tareas triviales en ruso o ingles: respuestas cortas, reformulaciones simples o generacion de texto breve donde no se requiera precision factual.
- Pruebas de integracion en pipelines de CI: un modelo de 200-500 MB permite ejecutar tests end-to-end de aplicaciones de chat en runners sin GPU y con tiempos de arranque minimos.
- Despliegue en entornos air-gapped o con requisitos de privacidad estrictos: al ser un fichero unico y ejecutarse en CPU, puede instalarse en sistemas aislados donde no es viable enviar datos a un servicio externo.
- Demo educativa de cuantizacion GGUF: los cinco ficheros publicados con sus perplejidades asociadas sirven como ejemplo practico de la relacion entre tamano, cuantizacion y calidad en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de evaluacion son las perplejidades por cuantizacion medidas con `llama-perplexity`:

| Fichero | Cuantizacion | Tamano | Perplejidad |
|---|---|---|---|
| `Nano-1.3-Fast-F16.gguf` | 16-bit float | 512 MB | 25,65 |
| `Nano-1.3-Fast-Q8_0.gguf` | 8-bit | 274 MB | 25,70 |
| `Nano-1.3-Fast-Q6_K.gguf` | 6-bit k-quant | 265 MB | 25,74 |
| `Nano-1.3-Fast-Q5_K_M.gguf` | 5-bit k-quant | 213 MB | 26,17 |
| `Nano-1.3-Fast-Q4_K_M.gguf` | 4-bit k-quant | 201 MB | 26,28 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; el fichero F16 ocupa 512 MB y Q4_K_M solo 201 MB, por lo que la memoria necesaria es minima.
- GPU recomendadas: no se requieren; cualquier GPU consumer con al menos 1 GB de VRAM puede alojarlo, aunque el modelo esta disenado para ejecutarse en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) y en CPU de portatil, Raspberry Pi 5 y telefonos, segun indica el autor.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`, `llama-completion`), Ollama, LM Studio y cualquier runtime compatible con GGUF. Se documenta el uso de `llama-server --jinja` con API compatible con OpenAI.
- Latencia y throughput: no se proporcionan cifras concretas. Dado el tamano del modelo, se espera una latencia muy baja en CPU, pero no hay datos medidos publicados en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con alternativas de tamano similar, indicando "no disponible" donde no hay datos verificables:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nano 1.3-Fast (este) | 254 M (safetensors) / 197 M (model card) | 1.024 | en, ru | Apache 2.0 | GGUF, safetensors |
| SmolLM2-135M (HuggingFace) | 135 M | 8.192 | en (principalmente) | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B (Alibaba) | 494 M | 32.768 | multilingue | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B (equipo comunitario) | 1.100 M | 2.048 | en (principalmente) | Apache 2.0 | safetensors, GGUF |

Los datos de rendimiento de los modelos comparados no se han incluido porque no forman parte de la informacion proporcionada; la comparacion se limita a parametros, contexto, idiomas, licencia y formatos.

## Limitaciones y advertencias

- Fiabilidad factual muy limitada: el propio autor advierte que el modelo es poco fiable para hechos y aritmetica, por lo que no debe usarse como fuente de informacion.
- Ventana de contexto de solo 1.024 tokens, insuficiente para documentos largos, conversaciones extensas o tareas de resumen sobre textos medianos.
- Solo soporta ingles y ruso; no hay soporte documentado de castellano ni de otros idiomas.
- Requiere obligatoriamente el system prompt recomendado; sin el, el comportamiento empeora de forma notable segun el autor.
- Discrepancia entre el numero de parametros publicado en safetensors (254 M) y el citado en la model card (197 M), lo que conviene verificar antes de dimensionar despliegues.
- No se documentan capacidades de tool calling, agentes, vision ni audio; no debe asumirse su disponibilidad.
- Riesgo de alucinacion elevado por el tamano reducido del modelo y la ausencia de datos publicados sobre alineacion (RLHF/DPO).
- La cuantizacion profunda penaliza mas la calidad que en modelos grandes: el autor recomienda Q8_0 salvo restriccion estricta de tamano, ya que Q4_K_M solo ahorra unos 73 MB respecto a Q8_0.
- No se han publicado evaluaciones de sesgo; al entrenarse presumiblemente con datos web en ingles y ruso, es esperable heredar sesgos de esas fuentes, aunque no hay mediciones disponibles.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de documentacion de entrenamiento limita la confianza para produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LGTEAMai/Nano-1.3-Fast-GGUF
- Modelo base: https://huggingface.co/LGTEAMai/Nano-1.3-Fast
- Sitio del autor: https://lgteamai.xyz
- llama.cpp: https://github.com/ggml-org/llama.cpp
