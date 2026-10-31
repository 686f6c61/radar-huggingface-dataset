# bartowski/LBS-27B-GGUF

## Resumen

LBS-27B es un modelo multimodal (imagen-texto a texto) desarrollado por inclusionAI, con una variante cuantizada en formato GGUF publicada por bartowski, un cuantizador muy conocido de la comunidad de llama.cpp. El modelo se especializa en tareas de visión agéntica: grounding de interfaces gráficas (GUI grounding), respuestas a preguntas visuales de alta resolución y razonamiento visual para agentes que operan sobre pantallas e interfaces.

Su relevancia actual radica en la creciente demanda de modelos de visión capaces de alimentar agentes autónomos que interactúan con GUIs (navegadores, aplicaciones de escritorio), un nicho donde los modelos de lenguaje puros no llegan. El checkpoint base tiene 27B parámetros (26.895.998.464 exactos según safetensors) y emplea un formato de prompt estilo ChatML con modo de razonamiento explícito (`<think>`), configurable mediante "reasoning effort". La licencia Apache 2.0 permite uso comercial sin restricciones.

La versión de bartowski ofrece cuantizaciones con matriz de importancia (imatrix) generadas con llama.cpp, desde bf16 completo (53,81 GB) hasta cuantizaciones de 3 bits, lo que permite ejecutar el modelo en hardware de consumo con una pérdida mínima de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), detalles no disponibles |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K, Q6_K_L, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_NL, IQ4_XS, IQ3_M y otras IQ3/IQ2 (repo completo de 440 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado por bartowski); original en safetensors en inclusionAI/LBS-27B |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que acepta entrada de texto e imagen (esta ultima mediante un archivo mmproj separado en las cuantizaciones GGUF). El uso de etiquetas como "high-resolution" y "gui-grounding" sugiere un codificador de vision optimizado para imagenes de alta resolucion, algo esencial para leer texto e iconos en capturas de pantalla de interfaces graficas. No se ha publicado informacion sobre el numero de capas, dimensiones ocultas ni el diseno exacto del conector vision-lenguaje.

Segun las etiquetas del repositorio, el entrenamiento incorporo aprendizaje por refuerzo (reinforcement learning), probablemente orientado a mejorar el grounding visual y el comportamiento agéntico. El formato de prompt incluye una instruccion de sistema que activa un modo de razonamiento con esfuerzo configurable ("Reasoning effort is set to xhigh"), y el modelo genera su razonamiento dentro de etiquetas `<think>` antes de la respuesta final, un patron tipico de modelos reasoning entrenados con RL. No se dispone de datos sobre el corpus de entrenamiento, numero de tokens ni etapas de alineacion (SFT, DPO).

## Capacidades

- Grounding de GUI: localizacion de elementos en capturas de pantalla (botones, campos de texto, iconos), capacidad clave para agentes que controlan ordenadores.
- Respuesta a preguntas visuales (VQA) sobre imagenes de alta resolucion.
- Vision agéntica: percepcion para pipelines de agentes multi-paso que navegan interfaces.
- Razonamiento con modo de pensamiento explicito (`<think>`), con niveles de esfuerzo configurables en el system prompt.
- Tool calling / function calling: formato nativo de llamadas a funciones con etiquetas `<tool_call>` y definiciones de herramientas en el system prompt.
- Generacion de texto conversacional multimodal (pipeline image-text-to-text).
- Soporte de entrada por imagen en llama.cpp mediante el archivo mmproj.
- Sin decodificacion especulativa segun la model card del cuantizador.

## Casos de uso

- Agentes de automatizacion de escritorio: el modelo puede interpretar capturas de pantalla de aplicaciones y devolver coordenadas o identificadores de elementos para que un orquestador ejecute clics y escritura, gracias a su entrenamiento en GUI grounding.
- Scraping y extraccion de datos de UI: dado un screenshot de un panel o dashboard, el modelo puede extraer valores, tablas y estados sin necesidad de APIs, util cuando solo existe acceso visual.
- Testing automatizado de interfaces: integracion en pipelines de QA que verifican visualmente que una web o app renderiza correctamente, comparando lo esperado con lo capturado.
- Asistentes que operan un navegador: combinando tool calling con percepcion visual, el modelo puede razonar multi-paso sobre donde hacer clic siguiente en una sesion de navegacion agéntica.
- Accesibilidad: descripcion y consulta interactiva sobre capturas de pantalla para usuarios con discapacidad visual, respondiendo preguntas concretas sobre el contenido de la interfaz.
- Documentacion tecnica asistida: generacion de descripciones paso a paso de flujos de UI a partir de secuencias de capturas, aprovechando el razonamiento extendido para mayor fiabilidad.
- Moderacion y verificacion visual: clasificacion de contenido en imagenes de alta resolucion dentro de flujos de trabajo automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / RAM estimada para inferencia (solo pesos del LLM, sin KV cache ni mmproj):
  - bf16: 53,81 GB
  - Q8_0: 28,67 GB
  - Q6_K: 23,62 GB
  - Q5_K_M: 20,68 GB
  - Q4_K_M: 17,20 GB (recomendacion por defecto de bartowski)
  - IQ4_XS: 15,24 GB
  - IQ3_M: 14,62 GB
- GPU recomendadas: para cuantizaciones Q4/Q5, una RTX 4090 (24 GB) o RTX 5090 permite descarga parcial en GPU; con 2x RTX 3090/4090 (48 GB) caben Q6 e incluso Q8 con contexto moderado. Para bf16, se necesitan A100 80GB o H100.
- Consumer GPUs: Q4_K_M (17,20 GB) cabe en una RTX 4090 de 24 GB con contexto limitado; en Mac con Apple Silicon unified memory de 32 GB o mas funciona via llama.cpp/Metal. Con 16 GB de VRAM, la opcion viable es IQ4_XS o IQ3_M con offload parcial a CPU.
- Despliegue: llama.cpp (release b11913 o superior, con soporte mmproj para entrada de imagen), Ollama (via importacion de GGUF), LM Studio y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM o TGI en esta variante cuantizada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Licencia | Formato |
|---|---|---|---|---|
| LBS-27B (inclusionAI) | 26,9B | Imagen + texto | Apache 2.0 | safetensors / GGUF |
| Qwen2.5-VL-32B | 32B | Imagen + texto (GUI grounding, agentes) | Apache 2.0 | safetensors / GGUF |
| InternVL2.5-26B | 26B | Imagen + texto (alta resolucion) | MIT | safetensors / GGUF |
| Qwen2-VL-7B | 7B | Imagen + texto | Apache 2.0 | safetensors / GGUF |

LBS-27B compite en la franja de 26-32B con Qwen2.5-VL-32B e InternVL2.5-26B, ambos con foco en vision agéntica y documentos de alta resolucion. Su ventaja diferencial declarada es el entrenamiento con RL para GUI grounding; la comparativa de rendimiento exacto no esta disponible por falta de benchmarks publicados.

## Limitaciones y advertencias

- No se ha publicado informacion sobre idiomas soportados; conviene verificar el comportamiento en castellano antes de uso en produccion.
- La longitud de contexto no esta documentada en esta ficha de cuantizacion; hay que consultar la model card original de inclusionAI/LBS-27B.
- Riesgo de alucinacion en grounding: en tareas de agentes sobre GUIs, coordenadas o elementos mal identificados pueden provocar acciones incorrectas; se recomienda validacion antes de ejecutar acciones irreversibles.
- El modo de razonamiento (`<think>`) incrementa notablemente los tokens generados y la latencia; el nivel "xhigh" del system prompt por defecto puede ser excesivo para tareas simples.
- La entrada de imagen requiere el archivo mmproj correspondiente; usar solo el GGUF del LLM sin mmproj desactiva la capacidad visual.
- Licencia Apache 2.0: sin restricciones de uso comercial, pero sin garantias; las cuantizaciones agresivas (IQ3 y menores) degradan la calidad y pueden afectar mas a las tareas de localizacion visual precisas.
- La model card del cuantizador esta truncada en el listado de archivos; existen cuantizaciones adicionales por debajo de IQ3_M no detalladas aqui.
- Al ser un modelo reciente, la compatibilidad con runtimes distintos de llama.cpp no esta garantizada.

## Enlaces

- Cuantizacion GGUF (bartowski): https://huggingface.co/bartowski/LBS-27B-GGUF
- Modelo original (inclusionAI): https://huggingface.co/inclusionAI/LBS-27B
- llama.cpp (release usada para cuantizar): https://github.com/ggml-org/llama.cpp/releases/tag/b11913
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp/
- Paper, demo y blog oficial: no disponibles
