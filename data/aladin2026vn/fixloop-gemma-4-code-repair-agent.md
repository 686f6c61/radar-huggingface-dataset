# aladin2026vn/fixloop-gemma-4-code-repair-agent

## Resumen

FixLoop es un agente autónomo de reparación de código publicado en Hugging Face por el usuario aladin2026vn. No se trata de un modelo de pesos entrenado desde cero, sino de un repositorio que contiene el código de un agente que orquesta el modelo Gemma 4 12B-IT (en su variante oficial GGUF `gemma-4-12b-it-qat-q4_0-gguf` de Google) servido localmente con llama.cpp. El agente recibe un módulo Python roto junto con su suite de pytest, ejecuta los tests, lee los fallos y solicita a Gemma 4 una reescritura completa del módulo hasta que la suite pasa.

El problema que resuelve es acotado pero concreto: la reparación automática de módulos Python individuales con cobertura de tests existente. El bucle de reparación ejecuta los tests, construye un prompt con el código fuente, el fichero de test y la salida de fallo, y pide al modelo una respuesta en formato estricto `FILE:` con el fichero completo corregido (en lugar de un diff, que los modelos pequeños generan con menos fiabilidad). El agente verifica el parche reejecutando los tests y repite hasta un máximo de 5 rondas, con protecciones contra respuestas no parseables, respuestas dirigidas a ficheros incorrectos y parches idénticos (no-op).

Es relevante ahora por dos motivos. Primero, fue construido para la competición de Kaggle "Google — The Gemma 4 Developer Agent Competition", lo que lo sitúa en el contexto de agentes de desarrollo sobre modelos Gemma. Segundo, su model card documenta una comparación de rendimiento de inferencia entre `transformers` en bf16 (6,5 tok/s) y GGUF con llama.cpp (~25,6 tok/s) sobre GPUs gratuitas T4 x2 de Kaggle, lo que ilustra la viabilidad práctica de bucles agénticos con modelos de 12B en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio contiene código de agente; el modelo subyacente es Gemma 4 12B-IT, arquitectura no detallada en la información) |
| Parametros totales | 12B (modelo subyacente Gemma 4 12B-IT) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (configuración `n_ctx` usada en el ejemplo de carga con llama.cpp) |
| Tipos de cuantizacion | Q4_0 (variante oficial `gemma-4-12b-it-qat-q4_0-gguf`); no se documentan otras |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT (código del agente); los pesos de Gemma 4 se distribuyen por Google bajo los términos de Gemma |
| Formato de pesos | GGUF (modelo subyacente); el repositorio contiene código Python (`.py`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es un agente construido sobre Gemma 4 12B-IT, el modelo de razonamiento único del bucle (no se llama a ningún otro LLM). La arquitectura del agente se compone de cuatro piezas en `fixloop_agent.py`: un ejecutor de tests (pytest), un constructor de prompts, un parser de respuestas y el bucle de reparación. El prompt incluye el código fuente del módulo, el fichero de test y la salida de fallo; la respuesta esperada es una reescritura completa del fichero en formato `FILE:`, decisión de diseño justificada porque los modelos pequeños producen ficheros completos con mucha más fiabilidad que diffs.

El bucle tiene un máximo de 5 rondas y tres protecciones explícitas: rechazo de respuestas no parseables, rechazo de respuestas que apuntan a un fichero distinto del objetivo y rechazo de parches idénticos (no-op). Según la model card, una de estas protecciones se activó realmente durante la evaluación, cuando un fichero de test pegado por error corrompió una ejecución y el agente se negó correctamente a iterar sobre un parche no-op. No se documentan datos de entrenamiento, composición del dataset ni técnicas de RLHF/DPO, ya que el autor no entrena el modelo subyacente.

## Capacidades

- Reparación automática de módulos Python individuales a partir de su suite de pytest.
- Ejecución de tests y captura de la salida de fallo para realimentar el prompt.
- Generación de reescrituras completas de fichero en formato estricto `FILE:`.
- Bucle de verificación con reejecución de tests y hasta 5 rondas de reparación.
- Protecciones contra respuestas no parseables, ficheros incorrectos y parches no-op.
- Inferencia local con llama.cpp (`llama_cpp.Llama` con `n_gpu_layers=-1`, `n_ctx=8192`).
- Interfaz programática mediante `fix_project(chat_fn, project_dir, module_name, test_name)`.
- No se documentan capacidades de tool calling genérico, agentes multi-paso fuera del bucle de reparación, visión, audio ni modo thinking.

## Casos de uso

- Reparación de módulos Python en desarrollo: dado un módulo con tests fallando, el agente ejecuta la suite, lee los fallos y reescribe el fichero hasta que pasa; adecuado para proyectos de un solo módulo con cobertura de tests existente.
- Integración en el flujo de trabajo de un equipo con pytest: el agente se invoca sobre un directorio de proyecto y un nombre de módulo, y devuelve el módulo corregido tras verificar con la suite real, no con una comprobación sintética.
- Evaluación de modelos de código en hardware modesto: la model card demuestra el bucle completo en GPUs gratuitas T4 x2 de Kaggle con el GGUF Q4_0 (~7 GB), lo que sirve para prototipar agentes sin infraestructura dedicada.
- Docencia y experimentación con agentes: el repositorio incluye el núcleo completo sin helpers ocultos (`fixloop_agent.py`), los 12 casos de benchmark (`eval_cases.py`, `eval_cases_tier2.py`) y un proyecto demo (`textstats.py`, `test_textstats.py`), lo que permite reproducir y modificar el bucle.
- Reproducción de la competición de Kaggle: el notebook principal corre de extremo a extremo en modo público, adjunta el GGUF oficial de Gemma 4, instala llama.cpp y ejecuta la demo y las dos suites de benchmark.
- Base para extensiones hacia reparación multi-fichero: la model card señala como extensiones naturales la reparación de varios ficheros, la selección de tests y los issues estilo SWE-bench, partiendo del bucle actual de un solo módulo.

## Benchmarks y rendimiento

Resultados medidos en el notebook de Kaggle, según la model card:

| Suite | Casos | Tests | Corregidos | Rondas | Tiempo/caso |
|---|---|---|---|---|---|
| Demo (`textstats`) | 1 | 8 | 1/1 | 1 | ~14 s |
| Tier 1 — bugs básicos | 8 | 41 | 8/8 | 1 | 6–8,5 s |
| Tier 2 — bugs más difíciles e interactuantes | 4 | 22 | 4/4 | 1 | 9–18 s |
| **Total** | **12** | **63** | **12/12** | 1 | — |

Datos de inferencia comparados en la model card: con `transformers` en bf16 el modelo genera 6,5 tok/s; con GGUF + llama.cpp alcanza ~25,6 tok/s y carga en ~60 s en GPUs T4 x2 gratuitas de Kaggle. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q4_0 ocupa ~7 GB, por lo que se necesita al menos ese espacio en memoria de GPU para cargar todas las capas con `n_gpu_layers=-1`.
- GPU recomendadas: la model card valida el funcionamiento en T4 x2 gratuitas de Kaggle; no se documentan otras GPU (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: no confirmado explícitamente en la información; el tamaño de ~7 GB del GGUF es compatible con GPUs de consumo con 8 GB o más de VRAM, pero el autor no lo verifica.
- Opciones de despliegue: llama.cpp mediante `llama-cpp-python`; el ejemplo de carga usa `llama_cpp.Llama(model_path=..., n_gpu_layers=-1, n_ctx=8192)` y envuelve `create_chat_completion` como `chat_fn`. No se documentan vLLM, Ollama ni TGI.
- Latencia y throughput: ~25,6 tok/s con GGUF + llama.cpp frente a 6,5 tok/s con `transformers` bf16; carga en ~60 s en T4 x2. Tiempo por caso de reparación entre 6 y 18 s según la suite.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros agentes de reparación de código ni con modelos de la misma categoría. El único punto de comparación documentado es interno: la misma inferencia con `transformers` bf16 (6,5 tok/s) frente a GGUF + llama.cpp (~25,6 tok/s).

## Limitaciones y advertencias

- Alcance restringido a proyectos de un solo módulo con suite de pytest; no soporta reparación multi-fichero ni selección de tests.
- Los 12 casos del benchmark se resolvieron en la primera ronda, por lo que la maquinaria multi-ronda solo está validada por sus protecciones, no por casos que requieran varias iteraciones.
- Los ficheros de corrección de referencia de los casos de benchmark no se incluyen intencionadamente, lo que limita la verificación independiente de las soluciones.
- El repositorio contiene únicamente código de agente; los pesos de Gemma 4 se distribuyen por Google bajo los términos de Gemma, distintos de la licencia MIT del código.
- Idioma soportado: solo inglés (`en`), lo que puede afectar a la calidad en proyectos con documentación o mensajes de error en otros idiomas.
- Riesgo de alucinación inherente al modelo subyacente: el agente mitiga parches no-op y respuestas mal formadas, pero no se documentan evaluaciones de sesgo ni de robustez frente a código malicioso.
- Uso comercial: el código es MIT, pero el uso comercial de los pesos de Gemma 4 queda sujeto a los términos de Gemma de Google, que deben revisarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/aladin2026vn/fixloop-gemma-4-code-repair-agent
- Notebook de Kaggle (artefacto principal): https://www.kaggle.com/code/aladin2026/fixloop-gemma-4-code-repair-agent
- Competición de Kaggle: https://www.kaggle.com/competitions/gemma-4-developer-agent
