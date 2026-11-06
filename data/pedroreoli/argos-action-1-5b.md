# pedroreoli/argos-action-1.5b

## Resumen

Argos-Action-1.5B es un adaptador LoRA experimental entrenado sobre Qwen/Qwen2.5-1.5B-Instruct, desarrollado por Pedro Lucas Reis (pedroreoli). Su especialidad es el control autónomo de aplicaciones de escritorio y web mediante el protocolo MCP (Model Context Protocol), operando sobre árboles de accesibilidad semántica (AXTree / Windows UIA) en lugar de capturas de pantalla. El modelo recibe el estado semántico de la interfaz, el historial de ejecución y el objetivo del usuario, y predice la siguiente llamada de herramienta MCP en formato JSON estructurado con los campos `thought`, `tool_call` y `verification_predicate`.

El adaptador se entrenó con QLoRA 4-bit NF4 sobre siete capas de proyección del transformer base, con r=16 y alpha=32, lo que da 18.464.768 parámetros entrenables en BF16 (aproximadamente 36,9 MB). El entrenamiento se realizó en una única GPU NVIDIA T4 de 16 GB durante 3 épocas (321 pasos de optimización), con un tamaño de lote efectivo de 16 y una tasa de aprendizaje de 2e-4 con decaimiento coseno. La pérdida de validación reportada por el autor es de 0,0092 sobre el conjunto sintético de SFT.

Su relevancia radica en que aborda el problema de la automatización de interfaces de usuario con un modelo de solo 1,54B parámetros, lo que permite despliegue en el borde (edge) con un consumo de VRAM de aproximadamente 1,8 GB en cuantización 4-bit. Frente a aproximaciones basadas en visión, el uso de árboles de accesibilidad reduce la ambigüedad de la observación y facilita la verificación determinista del estado tras cada acción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre 7 capas de proyección |
| Parametros totales | 1,54B (modelo base) + 18.464.768 parámetros entrenables del adaptador LoRA |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con compute dtype FP16; el adaptador se distribuye en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) acoplado a Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,54B parámetros. El ajuste fino se realizó con QLoRA 4-bit NF4 usando `bitsandbytes`, aplicando LoRA con rango r=16, alpha=32 y dropout de 0,05 sobre las siete proyecciones (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El conjunto de datos de entrenamiento es sintético y se publica como `pedroreoli/argos-computer-use-mcp`; el entrenamiento se ejecutó con la librería TRL mediante SFT supervisado, en 3 épocas (321 pasos), lote de 4 por dispositivo con acumulación de gradiente de 4 (lote efectivo 16) y tasa de aprendizaje de 2e-4 con decaimiento coseno.

La innovación técnica principal no está en la arquitectura, sino en la formulación del problema: el modelo opera sobre árboles de accesibilidad semántica (AXTree / Windows UIA) en lugar de píxeles, y produce llamadas de herramienta tipadas conforme a MCP junto con un predicado de verificación que permite comprobar el efecto de cada acción antes de continuar el bucle de agente. El prompt se formatea mediante ChatML con un mensaje de sistema que define el rol de política de Computer Use y exige salida JSON estricta.

## Capacidades

- Generación de llamadas de herramienta MCP estructuradas en JSON con los campos `thought`, `tool_call` y `verification_predicate`.
- Interpretación de árboles de accesibilidad semántica (AXTree / Windows UIA) de aplicaciones de escritorio y web.
- Razonamiento multi-paso sobre historial de ejecución para decidir la siguiente acción.
- Planificación orientada a objetivos del usuario con verificación de estado intermedia.
- Soporte de tool calling / function calling en el sentido de MCP (Model Context Protocol).
- Capacidad de operar como política de un bucle de agente con checkpoint de verificación.
- Generación de texto conversacional (heredada del modelo base Qwen2.5-1.5B-Instruct).
- Capacidades multilingües: no disponible en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Automatización de tareas de escritorio en Windows: el modelo recibe el árbol UIA de la ventana activa y emite la siguiente acción MCP (clic, escritura, atajo) con un predicado de verificación, lo que permite encadenar operaciones sobre Notepad, exploradores de archivos o suites ofimáticas sin visión por computadora.
- Agentes de navegación web accesible: al operar sobre AXTree en lugar de capturas, el modelo puede automatizar flujos en aplicaciones web que expongan árboles de accesibilidad, reduciendo el coste computacional frente a modelos multimodales.
- Asistentes de accesibilidad: el modelo puede traducir objetivos en lenguaje natural a secuencias de acciones verificables sobre la interfaz, sirviendo de motor para herramientas de automatización asistida para usuarios con movilidad reducida.
- Testing de interfaces automatizado: integrado en pipelines de CI, el modelo puede generar y ejecutar secuencias de interacción sobre aplicaciones de escritorio, usando `verification_predicate` para validar que cada paso produjo el estado esperado.
- Orquestación de herramientas MCP en producción: al emitir llamadas MCP tipadas, puede actuar como planificador dentro de un servidor MCP que exponga acciones de sistema, con la ventaja de su reducido tamaño (1,8 GB en 4-bit) para despliegue en el borde.
- Automatización de tareas repetitivas en entornos con recursos limitados: su tamaño permite ejecutarlo en GPUs de consumo o incluso en entornos con 2 GB de VRAM, habilitando agentes de escritorio en estaciones de trabajo sin aceleradores de gama alta.
- Prototipado de investigación en Computer Use: al ser un adaptador LoRA pequeño y con dataset público, sirve como base para experimentar con nuevas formulaciones de observación semántica y verificación de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la pérdida de validación de 0,0092 sobre el conjunto sintético de SFT (`trainer_state.json`), que no constituye una evaluación de generalización ni permite comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB con el modelo base en 4-bit NF4 y el adaptador en BF16, según la model card.
- GPU recomendadas: NVIDIA T4 (16 GB) fue la utilizada para el entrenamiento; para inferencia basta con GPUs de gama media o de consumo.
- Cabe en GPU de consumo: sí, con cuantización 4-bit en tarjetas con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060); en FP16 el modelo base de 1,54B requiere alrededor de 3 GB.
- Opciones de despliegue: `transformers` + `peft` + `bitsandbytes` (flujo documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser un adaptador PEFT requeriría fusión previa con el modelo base para su uso en motores que no soporten PEFT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Argos-Action-1.5B | 1,54B + LoRA 18,5M | No disponible | Computer Use sobre AXTree / MCP | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen2.5-1.5B-Instruct | 1,54B | No disponible en la información proporcionada | Instrucción general, tool calling | Apache 2.0 | Hugging Face |
| Alternativas de Computer Use de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Argos-Action-1.5B con alternativas de la misma categoría. La comparación con su modelo base es estructural: Argos-Action añade especialización en Computer Use y MCP a costa de un adaptador de 36,9 MB, manteniendo el mismo tamaño de modelo base.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como experimental y el repositorio no registra descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La pérdida de validación de 0,0092 se obtuvo sobre un conjunto sintético de SFT; no hay evidencia de generalización a interfaces reales ni de robustez ante variaciones de AXTree entre aplicaciones.
- No se han publicado evaluaciones en benchmarks estándar (MMLU, HumanEval, GSM8K u otros), por lo que no es posible cuantificar su rendimiento frente a alternativas.
- Idiomas soportados no documentados; el prompt de ejemplo está en inglés y se desconoce el comportamiento en castellano.
- Longitud de contexto no documentada en la información disponible; depende de la configuración del modelo base.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen2.5-1.5B-Instruct, podría heredar los sesgos del modelo base, no evaluados aquí.
- Riesgo de alucinación en la generación de llamadas de herramienta: el modelo podría emitir acciones MCP no válidas o predicados de verificación incorrectos; el bucle de agente debe validar el JSON y el estado resultante antes de continuar.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen2.5-1.5B-Instruct y de los datos sintéticos de entrenamiento.
- Para producción, requiere fusionar el adaptador con el modelo base o usar un servidor compatible con PEFT; el repositorio solo contiene los pesos del adaptador (0,1 GB).

## Enlaces

- Hugging Face del modelo: https://huggingface.co/pedroreoli/argos-action-1.5b
- Repositorio GitHub: https://github.com/PedroReoli/argos-action
- Dataset de entrenamiento: https://huggingface.co/datasets/pedroreoli/argos-computer-use-mcp
- Demo interactiva (Space): https://huggingface.co/spaces/pedroreoli/argos-action-demo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
