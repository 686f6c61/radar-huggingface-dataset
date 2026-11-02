# JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results

## Resumen

Llama-3.1-8B-Instruct-CIRF-Zero-Results es un ajuste fino (fine-tune) del modelo Meta Llama 3.1 8B Instruct desarrollado por el usuario JhCIFT en HuggingFace. El modelo implementa una variante de razonamiento denominada CIRF (presumiblemente "Chain of Implicit Reasoning Functional", aunque el acronimo no se expande en la informacion disponible), en la que la traza de razonamiento se compone exclusivamente de tokens funcionales en lugar de lenguaje natural. Se trata de un experimento de investigacion sobre razonamiento implicito, no de un modelo orientado a produccion.

La innovacion principal reside en la incorporacion de 514 tokens nuevos al vocabulario: `[sof]` (start of function), `[eof]` (end of function) y `[f_0]` a `[f_511]`, que actuan como unidades atomicas de razonamiento. El modelo se entreno sin valores de resultado explicitos en los objetivos de entrenamiento, de ahi la denominacion "Zero-Results". La actualizacion LoRA se fusiono en los pesos densos BF16, por lo que el modelo se carga con Transformers estandar sin necesidad de PEFT ni del checkpoint base.

Con 8.034.471.936 parametros y una licencia Llama 3.1 Community, el modelo esta pensado para investigadores que estudien representaciones internas de razonamiento y mecanismos de decodificacion con tokens funcionales. Su rendimiento es muy desigual: destaca en tareas aritmeticas simples (MultiArith 85,96%, SVAMP 71,67%) pero fracasa en razonamiento matematico complejo (GSM8K 21,15%). Solo soporta ingles y su formato de prompt no utiliza plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) con vocabulario extendido de tokens funcionales |
| Parametros totales | 8.034.471.936 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Llama 3.1 8B Instruct, 128.000 tokens, aunque no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 8B Instruct: un transformer decoder-only denso con atencion por grupos (GQA) y RoPE, entrenado originalmente por Meta sobre billones de tokens. Sobre esta base, el autor aplico un ajuste fino supervisado con LoRA que posteriormente fusiono en los pesos densos en BF16. La modificacion clave es la extension del vocabulario con 514 tokens: un token de inicio de funcion (`[sof]`), uno de fin (`[eof]`) y 512 tokens funcionales (`[f_0]` a `[f_511]`) que actuan como pasos de razonamiento discretos. Tanto las filas de embedding como las de la cabeza de salida de estos tokens se incluyen entrenadas en el checkpoint publicado.

El entrenamiento se realizo sin valores de resultado explicitos en los objetivos: la traza de razonamiento consiste unicamente en tokens funcionales seguidos de `[eof]` y la respuesta final. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El repositorio incluye ficheros de procedencia (`training_config.json`, `provenance.json`, `export_verification.json`) que registran la configuracion de entrenamiento y los hashes del checkpoint fuente, aunque su contenido no se detalla. El protocolo de evaluacion limita cada traza a 32 tokens funcionales, forzando `[eof]` al alcanzar el limite, con decodificacion greedy y hasta 384 tokens nuevos.

## Capacidades

- Generacion de texto en ingles con razonamiento implicito mediante tokens funcionales.
- Razonamiento aritmetico basico y de sentido comun (rendimiento variable segun la tarea).
- Traza de razonamiento compacta: cada paso se codifica como un token funcional (`[f_0]`-`[f_511]`) en lugar de texto en lenguaje natural.
- Formato de prompt especifico: `<|begin_of_text|>PREGUNTA[sof]`, sin plantilla de chat.
- Salida estructurada con delimitadores explicitos (`[eof]`) que separan la traza de razonamiento de la respuesta final.
- Carga directa con Transformers estandar (sin PEFT ni codigo CIRF adicional).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito en la informacion disponible.
- Multilingue: solo ingles.

## Casos de uso

- Investigacion sobre razonamiento implicito: el modelo permite estudiar como un LLM puede comprimir cadenas de razonamiento en tokens discretos aprendidos, comparando su traza funcional con cadenas de pensamiento en lenguaje natural. Es adecuado porque expone los tokens `[f_0]`-`[f_511]` como unidades interpretables y auditables.
- Analisis de representaciones internas: al sustituir el razonamiento textual por tokens funcionales, facilita el estudio de la geometria del espacio latente y de como se codifica la informacion intermedia. Util para mechanistic interpretability.
- Benchmarking de metodos de compresion de razonamiento: sirve como linea base frente a modelos que usan CoT explicito, midiendo la perdida de precision al comprimir la traza (por ejemplo, la caida en GSM8K frente a MultiArith).
- Evaluacion de tecnicas de decodificacion restringida: el protocolo de limite de 32 tokens funcionales y el forzado de `[eof]` permiten experimentar con decodificacion controlada y analisis de latencia por token.
- Docencia e investigacion academica sobre arquitecturas con vocabulario extendido: el checkpoint incluye las filas de embedding y salida entrenadas de los 514 tokens nuevos, lo que permite estudiar el efecto de ampliar el vocabulario en un transformer denso.
- Pruebas de robustez en aritmetica y sentido comun: con resultados conocidos en MultiArith (85,96%), SVAMP (71,67%) y CommonsenseQA (80,51%), sirve para analizar donde falla el razonamiento comprimido (por ejemplo, en GSM8K con 21,15%).

## Benchmarks y rendimiento

Resultados publicados en la model card con decodificacion greedy, maximo 384 tokens nuevos y 32 tokens funcionales, con puntuacion por coincidencia exacta de la respuesta:

| Conjunto de test | Preguntas | Precision |
|---|---:|---:|
| GSM8K | 1.319 | 21,15% |
| MultiArith | 178 | 85,96% |
| SVAMP | 300 | 71,67% |
| CommonsenseQA | 1.221 | 80,51% |
| Coin Flip (corregido por paridad) | 3.333 | 77,02% |

La model card indica que en Coin Flip aproximadamente el 20% de las etiquetas del dataset no coinciden con la paridad de los lanzamientos enunciados en la pregunta, por lo que la puntuacion se calcula contra dicha paridad. Los resultados completos por dataset, incluidos MATH-500, StrategyQA y la latencia con batch de tamano 1, se encuentran en el fichero `test_results.json` del repositorio, aunque sus valores no se detallan en la informacion disponible. No se proporcionan comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para los pesos (8,03 mil millones de parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 18-20 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB. No obstante, no se publican versiones GGUF ni cuantizadas oficiales; habria que generarlas a partir de los pesos safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16. En GPUs consumer de 16 GB (RTX 4080, 4070 Ti Super) cabria en cuantizacion de 8 bits.
- Opciones de despliegue: Transformers con `device_map="auto"` es el metodo documentado. El tag `text-generation-inference` sugiere compatibilidad con TGI, y el tag `endpoints_compatible` con los endpoints de HuggingFace. No se documenta soporte explicito de vLLM, llama.cpp u Ollama, y la inclusion de tokens especiales nuevos requeriria verificar la compatibilidad de cada runtime.
- Latencia y throughput: la model card menciona que la latencia con batch de tamano 1 esta registrada en `test_results.json`, pero no se proporciona el valor en la informacion disponible.
- Nota importante: el tokenizador requiere `skip_special_tokens=False` para preservar los delimitadores `[sof]`/`[eof]`, y el stopping debe hacerse en el token EOS del tokenizador, no en `[eof]`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-CIRF-Zero-Results | 8,03 B | No disponible | 21,15% | Llama 3.1 Community | HuggingFace (0 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | No disponible en esta ficha | Llama 3.1 Community | HuggingFace (oficial) |
| Llama-3.1-8B-Instruct-CIRF-Full | No disponible | No disponible | No disponible | Llama 3.1 Community | HuggingFace (mismo autor) |
| Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3/6/12/18 | No disponible | No disponible | No disponible | Llama 3.1 Community | HuggingFace (mismo autor) |

La comparacion con el modelo base Llama 3.1 8B Instruct es la mas relevante, pero no se dispone de sus resultados en GSM8K en la informacion proporcionada, por lo que no es posible cuantificar la perdida o ganancia respecto al original. Las variantes CIRF del mismo autor (Full y Backward-Greedy) no publican metricas en la informacion disponible.

## Limitaciones y advertencias

- Rendimiento muy bajo en GSM8K (21,15%), lo que indica una grave limitacion en razonamiento matematico multi-paso; no es apto para tareas aritmeticas complejas en produccion.
- Solo soporta ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- No utiliza plantilla de chat: el prompt debe seguir el formato exacto `<|begin_of_text|>PREGUNTA[sof]`, lo que rompe la compatibilidad con pipelines estandar de chat y con muchas herramientas de inferencia.
- Requiere decodificacion con `skip_special_tokens=False` y parada en EOS (no en `[eof]`); un uso incorrecto produce salidas corruptas o truncadas.
- Riesgo de alucinacion inherente a los modelos de 8B, agravado por la compresion del razonamiento en tokens funcionales, que reduce la trazabilidad en lenguaje natural.
- La traza de razonamiento no es legible por humanos sin decodificar los tokens `[f_0]`-`[f_511]`; la interpretabilidad depende de herramientas externas.
- Licencia Llama 3.1 Community: impone restricciones de uso (politica de uso aceptable de Meta), requisitos de atribucion y limitaciones para determinados usos comerciales; es necesario revisar `LICENSE` y `USE_POLICY.md`.
- Modelo experimental con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de validacion por la comunidad ni de soporte a largo plazo.
- No se documentan sesgos especificos, pero hereda los del modelo base Llama 3.1 y los del dataset de ajuste, no detallado.
- Los resultados de Coin Flip se corrigen por paridad porque las etiquetas del dataset discrepan en aproximadamente el 20% de los casos; comparaciones directas con otras publicaciones pueden no ser equivalentes.
- No se publican versiones cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware consumer sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante CIRF-Full: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full
- Variante CIRF-Backward-Greedy-3: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3
- Variante CIRF-Backward-Greedy-6: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6
- Variante CIRF-Backward-Greedy-12: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12
- Variante CIRF-Backward-Greedy-18: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
