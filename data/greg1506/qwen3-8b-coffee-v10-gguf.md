# greg1506/qwen3-8b-coffee-v10-GGUF

## Resumen

qwen3-8b-coffee-v10-GGUF es la distribucion cuantizada en formato GGUF del modelo greg1506/qwen3-8b-coffee-v10, un ajuste fino de Qwen3-8B especializado en el dominio del cafe. Lo desarrolla el usuario independiente greg1506 y resuelve un problema muy concreto: ofrecer un asistente capaz de responder preguntas factuales sobre cafe (mapas de tueste, estandares de calidad, metodos de preparacion, origen de especies) y de realizar calculos de brew-math (ratios, masa de solidos, rendimiento de extraccion) con mayor precision que un modelo generalista.

El modelo parte de la arquitectura transformer densa de Qwen3-8B, con 8.190.735.360 parametros totales y una ventana de contexto heredada de la familia Qwen3 (no declarada de forma explicita en la informacion disponible). El pipeline de entrenamiento combina un pase de continued-pretraining sobre un corpus especifico de cafe (109 millones de tokens ponderados), un mid-train con LoRA y una fase de SFT con datos sinteticos y QA minada por LLM.

La relevancia actual es doble: por un lado demuestra un flujo completo de adaptacion de dominio sobre un modelo abierto con licencia Apache 2.0; por otro, la model card documenta con inusual transparencia las perdidas de precision introducidas por la cuantizacion Q4_K_M en las familias aritmeticas, lo que lo convierte en un caso de estudio util sobre evaluacion de cuantizaciones. Se distribuye como research preview y el autor advierte explicitamente de que no debe enviarse como producto comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico publicado en este repo) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con convert_hf_to_gguf.py y llama-quantize) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-8B. Sobre esa base, el autor aplica un pase de continued-pretraining sobre el flujo de tokens de coffee-corpus-v2, con 109 millones de tokens ponderados hacia el dominio del cafe. A continuacion realiza un mid-train con LoRA y una fase de SFT con datos sinteticos y QA minada por LLM, con la version v10 como release de registro. La linea completa es: Qwen3-8B, corpus de cafe, LoRA mid-train, SFT sintetico y ampliaciones de QA minadas por LLM.

La conversion a GGUF se hizo con convert_hf_to_gguf.py y llama-quantize q4_k_m sobre CPU, partiendo de un merge en bf16 de 16 GB y produciendo un archivo de 4,7 GB. El template de chat conserva el formato de pensamiento de Qwen3, de modo que las completaciones en crudo con llama-server o llama-cli -p empiezan con un bloque `` vacio que se renderiza como texto literal; el autor recomienda recortar el preambulo, pasar un template sin modo pensamiento o eliminarlo en tiempo de decodificacion. El formato de prompt verificado es el estandar de Qwen3 con etiquetas `<|im_start|>` y `<|im_end|>`.

## Capacidades

- Generacion de texto conversacional en ingles con rol de experto en cafe.
- Respuesta a preguntas factuales del dominio: mapas de tueste (roast-map), estandares de calidad, mapas de metodos de preparacion, origen de especies, procesamiento del grano y definiciones.
- Calculo de brew-math: ratios cafe/bebida, masa de solidos, rendimiento de extraccion (ey-forward y ey-inverse) y calculos aritmeticos del dominio.
- Clasificacion y definicion de conceptos del sector (bebidas con leche, tecnicas, categorias).
- Formato conversacional multi-turno mediante el template de chat de Qwen3.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible; el autor lo describe como asistente de factoides y brew-math, no como asistente general.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: modo pensamiento heredado de Qwen3 (con la advertencia de formato descrita).

## Casos de uso

- Asistencia a baristas en preparacion: el modelo responde consultas sobre ratios y metodos (por ejemplo, ratio cafe/bebida a partir de dosis de 20 g y bebida de 40 g) usando su conocimiento del dominio y su SFT especifico de brew-math.
- Formacion interna en cafeterias: se puede desplegar con llama.cpp u Ollama en un equipo de sobremesa para que el personal consulte estandares de calidad, mapas de tueste y definiciones sin depender de la nube.
- Prototipado de chatbots de nicho: su tamano de 8B en Q4_K_M (4,7 GB) permite ejecutarlo en GPU de consumo o incluso en CPU a unas 5 tok/s, lo que facilita demos rapidas con gradio o llama-server.
- Generacion de contenido editorial sobre cafe: borradores de fichas de producto, notas de cata o explicaciones de metodos, siempre con revision humana de los datos numericos.
- Investigacion sobre adaptacion de dominio: sirve como referencia reproducible de un pipeline continued-pretraining + LoRA + SFT sobre un modelo Apache 2.0, util para estudiar el impacto de la cuantizacion en subdominios aritmeticos.
- Evaluacion de cuantizaciones: la model card publica puntuaciones por familia en CoffeeBench v6, lo que permite usar el modelo como banco de pruebas para medir la degradacion de Q4_K_M frente a bf16.
- Clasificacion y etiquetado de textos de cafe: tareas de definicion y clasificacion de conceptos del sector en un pipeline por lotes con llama.cpp.

## Benchmarks y rendimiento

CoffeeBench v6, 336 items, conjunto held-out:

| Metrica | bf16 merge | Q4_K_M (este) |
|---|---|---|
| Raw exact match | 0.753 | 0.688 |
| Soft-EM (robusto a estilo) | 0.789 | 0.720 |
| Token F1 | 0.814 | 0.770 |

Puntuaciones por familia de este quant (raw EM): roast-map 1.00, quality-standards 1.00, legacy-core 1.00, milk-drinks 0.75, method-map 0.75, ratio-forward 0.89, solids-mass 0.53, species-origin 0.80, processing-map 0.44, definition 0.67, classification 0.67, ratio-inverse 0.67, ey-inverse 0.71, ey-forward 0.54, calculation 0.00.

El autor senala que Q4_K_M iguala al merge bf16 en las familias de conocimiento y estilo, pero pierde unos 6 puntos en las familias de aritmetica decimal (solids-mass de 0.93 a 0.53, ratio-inverse de 0.85 a 0.67, ratio-forward de 0.98 a 0.89), y recomienda usar la version bf16 para calculos criticos. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,7 GB para el archivo Q4_K_M; con overhead de contexto y cache KV, un presupuesto de 6-8 GB de VRAM es realista.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM; una T4 gratuita en Colab ejecuta el modelo mas rapido que CPU segun el autor.
- GPU de consumo: cabe en tarjetas de 8 GB como la RTX 3060 Ti/4060 y superiores; en GPUs de 6 GB puede requerir offload parcial a CPU.
- CPU: el autor indica que el runtime en CPU es suficiente, a unas 5 tok/s.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), llama-cpp-python, Ollama (formato GGUF compatible) y el notebook de Colab incluido, que lanza una UI gradio con enlace publico temporal.
- Latencia y throughput: aproximadamente 5 tok/s en CPU; el resto de mediciones no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-coffee-v10-GGUF | 8,19B | no disponible | Cafe (factoides y brew-math) | Apache 2.0 | GGUF en HF (246 descargas) |
| Qwen3-8B (base) | 8,19B | no disponible | Generalista | Apache 2.0 | Pesos completos y multiples quants en HF |
| greg1506/qwen3-8b-coffee-v10 (bf16) | 8,19B | no disponible | Cafe | Apache 2.0 | Pesos bf16 en HF |
| Modelos generalistas de 7-8B (p. ej. Llama 3.1 8B, Mistral 7B) | 7-8B | no disponible | Generalista | licencias propias | Amplia disponibilidad |

La comparacion con alternativas de la misma categoria no puede completarse con datos de rendimiento porque no se han publicado resultados de benchmarks comparativos en la informacion disponible. Frente al Qwen3-8B base, este modelo sacrifica generalidad por precision en el dominio del cafe; frente al bf16 del mismo autor, pierde entre 5 y 6 puntos de exactitud en las familias aritmeticas.

## Limitaciones y advertencias

- Research preview: el autor declara explicitamente que no debe enviarse como producto comercial y no reclama clearance comercial.
- Procedencia de datos: entrenado sobre el coffee-corpus-v2 completo (43.421 documentos abiertos, 1.365 share-alike y 1.472 restringidos), mientras que el bundle publicado solo contiene el nivel abierto; existe una advertencia de divulgacion sobre esta discrepancia.
- Aritmetica de rendimiento de extraccion poco fiable: el propio autor la califica de no fiable, y empeora con Q4 (familia calculation con EM 0.00 y ey-forward con 0.54).
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: alto en datos numericos; el autor pide verificar de forma independiente toda respuesta numerica de dosis o extraccion.
- Cobertura limitada al corpus: el conocimiento esta acotado al corpus de cafe; no es un asistente general.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta documentado.
- Formato de chat: el template de pensamiento puede producir preambulos `
