# ProCreations/nib-4b-preview

## Resumen

Nib 4B (preview) es un modelo de lenguaje y visión de 4.660 millones de parámetros desarrollado por ProCreations, obtenido mediante post-entrenamiento de Qwen3.5-4B para operar como agente de navegador web. El modelo lee instantáneas de página y capturas de pantalla, invoca herramientas y reporta resultados dentro de arneses de agente habituales (Playwright MCP, browser-use, CLIs estilo agent-browser, Chrome DevTools MCP, Aside y bucles de computer-use). Está publicado con licencia Apache 2.0 y pesos en safetensors para la librería transformers.

La propuesta de valor es conseguir competencia de agente web con un modelo pequeño: según el autor, duplica el rendimiento de su base (62% frente a 29-30% en tareas web en vivo y sintéticas, y 80% frente a 23% en aplicaciones web autoalojadas) y se sitúa cerca de modelos mucho mayores como DeepSeek V4.1 Flash o Qwen3.8-27B en el conjunto combinado, con un consumo de 1.300-2.500 tokens de salida por tarea. Incorpora cuatro niveles de esfuerzo de razonamiento (off, low, medium y xhigh) seleccionables por petición.

Es relevante ahora porque demuestra que el post-entrenamiento específico de dominio sobre un modelo de 4B puede acercarse a modelos de decenas de miles de millones de parámetros en tareas de automatización de navegador, abriendo la puerta a despliegues de agentes web en hardware modesto. No obstante, es una versión preview con limitaciones reconocidas por el autor, especialmente la tendencia a declarar éxito en tareas no completadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated DeltaNet + atención, con codificador de visión (arquitectura Qwen3.5) |
| Parámetros totales | 4.659.865.088 (4,66 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (configuración de referencia en SGLang) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Nib 4B parte de Qwen3.5-4B, un transformer híbrido que combina capas de Gated DeltaNet (atención lineal con estado recurrente) con capas de atención clásica, e incluye un codificador de visión que permite procesar capturas de pantalla además de texto. El autor indica que el modelo se ha post-entrenado sobre tareas de navegación web generadas con los mismos generadores sintéticos y las mismas aplicaciones autoalojadas (Gitea, WordPress, Odoo y similares) que emplea en su evaluación, lo que implica que parte de su ventaja en esos conjuntos es en distribución. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se usaron RLHF o DPO.

La innovación principal es el ajuste fino orientado a arneses de agente concretos: el modelo aprende a interpretar instantáneas de página y capturas, emitir llamadas a herramientas con los esquemas de Playwright MCP, browser-use o CLIs de navegador, y cerrar el episodio con un informe. Además, expone cuatro niveles de esfuerzo de razonamiento controlables mediante el chat template (`enable_thinking` y `reasoning_effort`), lo que permite ajustar el coste en tokens por petición.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable en cuatro niveles (off, low, medium, xhigh).
- Comprensión de imágenes: lectura de capturas de pantalla de páginas web como entrada (pipeline image-text-to-text).
- Llamada a herramientas (tool calling / function calling) con parsers compatibles con el formato Qwen (`qwen3_coder`).
- Ejecución de agentes multi-paso: planificación, invocación de herramientas, observación de resultados y reporte final.
- Integración con arneses de navegador: Playwright MCP, browser-use, CLIs estilo agent-browser, Chrome DevTools MCP, Aside y bucles de computer-use.
- Uso dentro de agentes de código que controlan un navegador.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Automatización de tareas de navegador en producción: el modelo puede rellenar formularios, navegar entre páginas y extraer datos dentro de un arnés como Playwright MCP, con contexto de 131.072 tokens para mantener el estado de episodios largos.
- Monitorización de aplicaciones web autoalojadas: dado su rendimiento en entornos como Gitea, WordPress u Odoo (80,6-82,3% de éxito según el autor), encaja en tareas de comprobación de estado, creación de incidencias o gestión de contenidos vía interfaz web.
- Extracción de información de sitios en vivo: lectura de horarios, precios o disponibilidad mediante capturas de pantalla y llamadas a herramientas, con el nivel de esfuerzo `low` como equilibrio coste/precisión.
- Agente de soporte interno que opera paneles de administración: al funcionar con Chrome DevTools MCP y CLIs de navegador, puede integrarse en flujos de back-office donde no hay API disponible.
- Automatización de QA de aplicaciones web: el modelo puede recorrer flujos de usuario, verificar estados y reportar resultados dentro de pipelines de prueba que ya usen browser-use.
- Prototipado de agentes de computer-use en hardware modesto: con 4,66 B de parámetros y pesos safetensors, es viable en una única GPU consumer para experimentación, aunque con las reservas de la sección de limitaciones.
- Generación de informes de navegación: el modelo cierra episodios reportando lo encontrado, útil para tareas de investigación web supervisadas por un humano.

## Benchmarks y rendimiento

Los datos provienen de conjuntos de tareas propios del autor (no benchmarks públicos): web en vivo (120 tareas), sintéticas (108 tareas) y aplicaciones web autoalojadas (62 tareas). Los intervalos de confianza del 95% son de aproximadamente ±6 puntos (vivo + sintético), ±9 (vivo) y ±10 (apps).

| Modelo | Ajuste | Vivo + sintético | Vivo | Apps autoalojadas | Tokens |
|---|---|---:|---:|---:|---:|
| Nib 4B | off | 56,6 | 52,5 | 80,6 | 1.293 |
| Nib 4B | low | 61,8 | 53,3 | 82,3 | 1.783 |
| Nib 4B | medium | 59,2 | 49,2 | 79,0 | 1.955 |
| Nib 4B | xhigh | 62,3 | 55,8 | 80,6 | 2.537 |
| Qwen3.5-4B (base, sin entrenar) | off | 30,3 | 37,5 | 22,6 | 1.807 |
| Qwen3.5-4B (base, sin entrenar) | thinking on | 28,5 | 35,6 | 22,6 | 3.040 |
| Qwen3.5-9B (sin entrenar) | off | 41,2 | 49,2 | no ejecutado | 1.926 |
| Qwen3.5-9B (sin entrenar) | thinking on | 36,7 | 42,2 | no ejecutado | 2.983 |
| Qwen3.8-27B (sin entrenar) | off | 56,1 | 55,0 | 64,5 | 1.444 |
| Qwen3.8-27B (sin entrenar) | low | 65,8 | 65,0 | 75,8 | 2.727 |
| Qwen3.8-27B (sin entrenar) | medium | 64,9 | 66,7 | 64,5 | 2.188 |
| Qwen3.8-27B (sin entrenar) | xhigh | 65,8 | 66,7 | 77,4 | 3.771 |
| Qwen3.8-Flash-Next | medium | 74,6 | 70,8 | no ejecutado | 3.179 |
| Mistral Large 4 | high | 63,6 | 67,5 | 79,0 | 2.884 |
| DeepSeek V4.1 Flash | high | 60,1 | 55,8 | 66,1 | 3.311 |
| GLM 5.3 | high | 47,4 | 48,3 | 64,5 | 1.163 |

En un conjunto de web en vivo mayor y más difícil (581 tareas, 8 arneses), el autor reporta aproximadamente 45% para Nib frente a 56% de Qwen3.8-27B sin entrenar, con cerca de la mitad de tokens. No se han publicado resultados en benchmarks públicos estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 4,66 B de parámetros, en bf16 requiere aproximadamente 9,3 GB de pesos, y en cuantizaciones de 8 o 4 bits bajaría a rangos de 5-6 GB y 3-4 GB respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: el autor valida el despliegue con SGLang 0.5.21, orientado a GPUs de datacenter (A100, H100). No se especifican requisitos mínimos.
- GPU consumer: por tamaño, debería caber en tarjetas con 12-16 GB o más de VRAM, aunque el soporte de la arquitectura híbrida Gated DeltaNet en stacks consumer no está confirmado.
- Opciones de despliegue: SGLang 0.5.21 con los parámetros indicados por el autor (`--context-length 131072 --reasoning-parser qwen3 --tool-call-parser qwen3_coder --mamba-ssm-dtype bfloat16 --mamba-radix-cache-strategy extra_buffer_lazy --trust-remote-code`); también es compatible con transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor reporta 1.293-2.537 tokens de salida por tarea según el nivel de esfuerzo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Vivo + sintético (mejor ajuste) | Apps autoalojadas | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Nib 4B (preview) | 4,66 B | 131.072 | 62,3 (xhigh) | 82,3 (low) | Apache 2.0 | Pesos abiertos en HF |
| Qwen3.5-4B (base) | 4 B (aprox.) | no disponible | 30,3 (off) | 22,6 | Apache 2.0 (según enlace de licencia) | Pesos abiertos en HF |
| Qwen3.8-27B | 27 B (aprox.) | no disponible | 65,8 (low/xhigh) | 77,4 (xhigh) | no disponible | Pesos abiertos (sin entrenar para navegación) |
| DeepSeek V4.1 Flash | no disponible | no disponible | 60,1 (high) | 66,1 | no disponible | API del proveedor |

La comparación con DeepSeek V4.1 Flash y Qwen3.8-27B debe tomarse con cautela: los modelos de terceros se ejecutaron vía API en un único ajuste dos días antes de las pruebas de Nib, y las webs en vivo cambian entre ejecuciones. En aplicaciones autoalojadas, Nib supera a ambos según los datos del autor.

## Limitaciones y advertencias

- Es una versión preview: el propio autor advierte que comete errores que un modelo mayor no cometería y que con demasiada frecuencia reporta éxito en tareas que no ha completado. Requiere verificación humana de los resultados.
- Parte de la ventaja en tareas sintéticas y de aplicaciones autoalojadas es en distribución, ya que el entrenamiento usó los mismos generadores y aplicaciones que la evaluación; el conjunto de web en vivo es la comparación más justa.
- Los benchmarks son propios del autor, no públicos, y no se han publicado resultados en MMLU, HumanEval, GSM8K u otros estándares.
- Idiomas: solo inglés según la model card; el rendimiento en castellano no está evaluado.
- Riesgo de alucinación en la interpretación de páginas y en el reporte de resultados, especialmente relevante en flujos automatizados sin supervisión.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo deriva de Qwen3.5-4B y el autor enlaza la licencia del modelo base; conviene revisar ambas.
- El despliegue de referencia usa SGLang con `--trust-remote-code`, lo que implica ejecutar código del repositorio; auditar antes de usar en producción.
- No hay información sobre cuantizaciones publicadas ni sobre soporte en vLLM, llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProCreations/nib-4b-preview
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Perfil del autor en Hugging Face: https://huggingface.co/ProCreations
- Gráfica de benchmarks (vivo + sintético): https://huggingface.co/ProCreations/nib-4b-preview/resolve/main/assets/bench_live_synth.png
- Gráfica de benchmarks (web en vivo): https://huggingface.co/ProCreations/nib-4b-preview/resolve/main/assets/bench_live.png
- Gráfica de benchmarks (apps autoalojadas): https://huggingface.co/ProCreations/nib-4b-preview/resolve/main/assets/bench_apps.png
