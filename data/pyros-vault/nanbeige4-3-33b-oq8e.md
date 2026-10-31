# pyros-vault/Nanbeige4.3-33B-oQ8e

## Resumen

Nanbeige4.3-33B-oQ8e es una cuantización a 8 bits, empaquetada para Apple MLX, del modelo Nanbeige4.3-33B del equipo Nanbeige. El modelo base es un LLM denso de 33,1 mil millones de parámetros, arquitectura tipo Llama, orientado a tareas agénticas de programación y trabajo de oficina ("cowork"), con modo de razonamiento y soporte de tool calling. La serie 4.3 lo posiciona como modelo "profesor" para variantes más pequeñas del mismo equipo.

Esta variante, creada por el usuario pyros-vault con la herramienta oMLX y su método de cuantización oQ, resuelve un problema concreto: ejecutar un modelo denso de 33B con contexto de 512K tokens en hardware Apple Silicon, donde CUDA no está disponible. La cuantización usa una matriz de importancia calibrada con datos multilingües y de código, lo que en teoría preserva mejor la calidad que una cuantización naive.

Su relevancia actual radica en la combinación de tres factores: licencia Apache-2.0 totalmente permisiva, capacidades agénticas (tool calling, razonamiento multi-turno) y despliegue local en Mac mediante un servidor compatible con la API de OpenAI. Es una opción interesante para desarrolladores que quieren un modelo grande y capaz sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (`LlamaForCausalLM`), 52 capas, hidden size 7.168, 56 cabezas de atención, 8 cabezas KV (GQA) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens (valor de la configuración; no verificado en hardware real) |
| Tipos de cuantizacion | oQ8e (afín a 8 bits, group size 64); variantes oQ4e y oQ6e disponibles en repositorios separados |
| Idiomas soportados | Inglés y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (7 shards, layout MLX/oMLX; no es GGUF ni compatible con Transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso con GQA (grouped-query attention): 52 capas, tamaño oculto de 7.168, 56 cabezas de atención y 8 cabezas KV, lo que reduce la memoria de la KV cache a 208 KiB por token en fp16. El contexto configurado es de 524.288 tokens, una cifra muy alta para un modelo denso de este tamaño. No es un modelo MoE: los 33,1B de parámetros están activos en cada token.

Sobre el entrenamiento del modelo base, la información disponible no detalla el número de tokens ni la composición del dataset. Sí se sabe que el equipo Nanbeige lo construyó como modelo profesor para destilar variantes menores de la serie, y que incorpora un modo de razonamiento conmutable (`enable_thinking`) y soporte de tool calling con formato XML o JSON. En cuanto a la cuantización oQ8e: usa cuantización afín de 8 bits con group size 64 en todos los tensores, calibrada con la matriz de importancia `oqe_code_multilingual` (128 muestras de 512 tokens, 364 entradas aplicadas a 364 módulos lineales). El payload resultante es de 32,77 GiB, unos 8,50 bits por peso con escalas.

## Capacidades

- Generación de texto conversacional con modo de razonamiento activable o desactivable (`enable_thinking`).
- Tool calling / function calling, con formato XML (recomendado) o JSON.
- Tareas agénticas multi-turno: el argumento `preserve_thinking` permite conservar el razonamiento de turnos anteriores del asistente, recomendado para agentes de código y tareas de oficina.
- Programación agéntica ("agentic coding") como caso de uso principal declarado por el equipo Nanbeige.
- Tareas de oficina y trabajo colaborativo ("cowork").
- Bilingüe: inglés y chino.
- Ventana de contexto teórica de 512K tokens para documentos y sesiones muy largas.
- Muestreo configurable con recomendaciones oficiales: para tareas agénticas, temperature 1,0 y top-p 0,95 con hasta 65.536 tokens nuevos; para razonamiento y chat, temperature 0,6 y top-p 0,95 con hasta 262.144 tokens nuevos.

## Casos de uso

- Agente de programación local en Mac: con tool calling XML y `preserve_thinking=true`, puede integrarse en pipelines de edición de código multi-paso (leer archivos, ejecutar herramientas, corregir errores) sirviéndose del endpoint compatible con OpenAI de oMLX.
- Chatbot de asistencia técnica bilingüe chino-inglés: el modo de razonamiento con temperatura 0,6 es adecuado para preguntas técnicas que requieren pasos intermedios antes de responder.
- Procesamiento de documentos muy largos: la ventana de 512K tokens permite, en principio, analizar repositorios de código, contratos o informes extensos, aunque la KV cache en fp16 para 128K tokens ya requiere 26 GiB adicionales.
- Automatización de tareas de oficina: redacción, resumen y organización de información, el caso de uso "cowork" para el que el equipo diseñó el modelo.
- Generación de código con razonamiento extenso: hasta 262.144 tokens de salida permiten razonamientos largos y soluciones de código completas en una sola respuesta.
- Modelo profesor para destilación: dado que Nanbeige lo creó con ese propósito, puede usarse para generar datos sintéticos de entrenamiento para modelos más pequeños.
- Prototipado de agentes en local sin coste de API: la licencia Apache-2.0 y el servidor OpenAI-compatible facilitan pruebas de agentes con herramientas sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante cuantizada. La model card original de Nanbeige4.3-33B contiene los resultados del modelo base, pero no se incluyen en la información proporcionada, por lo que no se reproducen aquí. Tampoco hay comparativas publicadas de calidad, memoria, time-to-first-token ni throughput entre las variantes oQ4e, oQ6e y oQ8e.

## Requisitos de hardware

- Pesos: 32,77 GiB solo para los tensores de la variante oQ8e (35,2 GB de repositorio completo con índice, configuración, tokenizer y plantilla de chat).
- KV cache en fp16 (adicional a los pesos, sin cuantizar la cache): 6,50 GiB a 32K tokens de contexto, 26,00 GiB a 128K y 104,00 GiB a 512K (estimación del config para una secuencia; el runtime añade sus propios buffers).
- Memoria unificada total estimada: aproximadamente 40 GiB para contextos de 32K, lo que en la práctica exige un Mac con al menos 48 GB de memoria unificada; para contextos largos, 64-128 GB o más.
- GPU recomendadas: no aplica GPU NVIDIA; el runtime oMLX está dirigido exclusivamente a Apple Silicon y macOS. Este repositorio no funciona con CUDA.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB): además de ser un layout MLX, los pesos solos superan los 32 GiB.
- Despliegue: oMLX con servidor compatible con OpenAI (`omlx serve`), instalable vía Homebrew (`brew tap jundot/omlx`). No funciona con vLLM, TGI, llama.cpp ni Ollama por el layout MLX, y la inferencia alojada de Hugging Face no sirve este formato.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Formato/plataforma | Licencia |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-oQ8e (esta ficha) | 33,1B | Denso tipo Llama, GQA | 524.288 tokens (config) | MLX/oMLX, Apple Silicon | Apache-2.0 |
| Nanbeige4.3-33B (base) | 33,1B | Denso tipo Llama, GQA | 524.288 tokens (config) | Safetensors estándar | Apache-2.0 |
| Nanbeige4.3-33B-oQ4e | 33,1B | Denso tipo Llama, GQA | 524.288 tokens (config) | MLX/oMLX, 4,70 bits/peso, 18,12 GiB | Apache-2.0 |
| Nanbeige4.3-33B-oQ6e | 33,1B | Denso tipo Llama, GQA | 524.288 tokens (config) | MLX/oMLX, 6,70 bits/peso, 25,83 GiB | Apache-2.0 |

No se incluyen comparativas con modelos de otros fabricantes porque no hay datos de rendimiento publicados que permitan hacerlo con rigor.

## Limitaciones y advertencias

- Plataforma: el layout MLX/oMLX solo funciona en Apple Silicon y macOS; no hay soporte CUDA ni inferencia alojada en Hugging Face para este repositorio.
- El contexto de 524.288 tokens es el valor del config, no una afirmación de que se haya probado ni de que quepa en una máquina concreta: a 512K la KV cache en fp16 requiere 104 GiB adicionales.
- La cuantización puede alterar la calidad de las salidas; la model card recomienda evaluar la variante en la carga de trabajo propia antes de usarla en producción.
- No hay comparativas de calidad, memoria, latencia ni throughput entre variantes cuantizadas publicadas.
- El comportamiento del razonamiento, las llamadas a herramientas y el rendimiento dependen de la versión de oMLX, el cliente, el prompt y el hardware Apple concreto.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado, aunque la calibración de la cuantización incluyó datos multilingües.
- Sesgos y tasa de alucinación del modelo base: no disponibles en la información proporcionada.
- Licencia: Apache-2.0 permite uso comercial sin restricciones relevantes más allá de la atribución estándar.
- Para producción, conviene fijar la versión de oMLX y validar el chat template (argumentos como `enable_thinking` o `tool_call_format` pueden no ser configurables desde todos los clientes).

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/pyros-vault/Nanbeige4.3-33B-oQ8e
- Modelo base (Nanbeige4.3-33B): https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Variante oQ4e: https://huggingface.co/pyros-vault/Nanbeige4.3-33B-oQ4e
- Variante oQ6e: https://huggingface.co/pyros-vault/Nanbeige4.3-33B-oQ6e
- oMLX (repositorio y runtime): https://github.com/jundot/omlx
- Perfil del autor de la cuantización: https://huggingface.co/pyros-vault
- Documentación de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
