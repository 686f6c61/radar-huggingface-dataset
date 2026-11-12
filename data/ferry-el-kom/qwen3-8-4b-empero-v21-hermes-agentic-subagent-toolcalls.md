# ferry-el-kom/qwen3.8-4b-empero-v21-Hermes-agentic-subagent-toolcalls

## Resumen

qwen3.8-4b-empero-v21-Hermes-agentic-subagent-toolcalls es un modelo de lenguaje de 4.326 millones de parámetros (4,3B) afinado mediante LoRA SFT sobre la base empero-ai/Qwen3.8-4B-Distill, desarrollado por el usuario de Hugging Face ferry-el-kom. Su propósito no es la generación de texto generalista, sino actuar como subagente especializado en tool calling y function calling dentro del protocolo del arnés de agentes Hermes, es decir, bucles multi-turno con llamadas a herramientas, respuestas de herramientas y verificación de resultados.

La relevancia del modelo radica en su enfoque de destilación desde profesores en la nube (GLM-5.2/5.3 y DeepSeek Pro) sobre trayectorias reales del arnés, complementadas con 140 trayectorias doradas verificadas por replay en las que cada comando se ejecutó de verdad y se capturaron los errores reales. El autor documenta resultados verificados sobre artefactos, no autoinformados: 11/12 en el canary agent-loop12 frente a 9/12 de la línea base y de la versión anterior v20, con una media de 3,2 turnos.

Se distribuye con licencia Apache 2.0 en safetensors (f16 y bf16) y cuantizaciones GGUF (q8_0, q6_K, q4_K_M), e incluye plantilla de chat para tool calls y un Modelfile de Ollama. Está pensado para desplegarse en hardware modesto: el propio autor lo entrenó en una única RX 6800 XT de 16 GB. Los idiomas declarados son inglés y rumano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5_text`); no se detalla variante exacta |
| Parámetros totales | 4.326.350.848 (4,3B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card; recomendación de servicio `num_ctx 64k` |
| Tipos de cuantización | GGUF q8_0, q6_K, q4_K_M; safetensors f16 y bf16 |
| Idiomas soportados | inglés (en), rumano (ro) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de empero-ai/Qwen3.8-4B-Distill, una destilación de la familia Qwen3.5 con 4,3B parámetros. Sobre esa base se aplicó un LoRA fresco (sin apilar adaptadores previos) con r=32, alpha=64, configuración all-linear, 396 pasos, 2 épocas, learning rate 2e-5 y batch de 16. El conjunto de entrenamiento consta de 2.921 ventanas de entrenamiento (frente a las 1.953 de v20), con un 41% de ventanas en modo "think" y un 12% sin herramienta (no_tool), fruto de un ajuste de think-gating.

Los datos proceden de sesiones de profesores locales (dspro, glm-5.3), sesiones de producción de spectrof, ejemplos verificados por oráculo de megabit y singleshots de hermes-function-calling, además de 140 trayectorias doradas verificadas por replay con comandos realmente ejecutados y errores reales capturados. La innovación técnica principal es la normalización del lado de los datos: rutas normalizadas, lecturas sin sudo, disciplina de stdin con /dev/null, think-gating y garantía de identidad de máquina cero (rutas, IPs y hostnames normalizados). El dataset de entrenamiento es privado por revisión de licencias de profesores y se ofrece bajo petición a contribuidores serios.

## Capacidades

- Generación de texto conversacional orientada a tareas de agente.
- Tool calling y function calling con plantilla de chat específica (`chat_template.jinja`).
- Bucles multi-turno de herramientas: llamada, respuesta de herramienta y verificación dentro del protocolo del arnés Hermes.
- Razonamiento multi-paso con modo "think" conmutable (think-gating), activo en aproximadamente el 41% de las ventanas de entrenamiento.
- Modo sin herramienta (no_tool) para turnos puramente conversacionales.
- Disciplina de ejecución de comandos: lecturas sin sudo, gestión de stdin no interactivo, evitación de valores fabricados.
- Capacidades multilingües limitadas a inglés y rumano según la model card.
- No se declaran capacidades de visión, audio ni matemáticas avanzadas.

## Casos de uso

- Subagente de tool calling en pipelines de agentes: el modelo está entrenado sobre el protocolo real del arnés Hermes (bucles multi-turno con respuestas de herramienta y verificación), por lo que encaja como ejecutor de herramientas dentro de un agente orquestador mayor, con una media de 3,2 turnos por tarea.
- Automatización de tareas de sistema en entornos controlados: las lecturas sin sudo y la disciplina de stdin con /dev/null reducen el riesgo de bloqueos por programas interactivos y de escaladas de privilegios accidentales, un problema documentado en la versión anterior v20.
- Verificación de artefactos y checklists: en la suite de 30 tareas el modelo logró 0 aciertos de fabricación (B7) y 0 fallos de lista perdida (B9), con 10/10 en checklist con artefactos reales, lo que lo hace apto para tareas donde hay que comprobar resultados contra evidencias.
- Despliegue en hardware de consumo: con cuantización q4_K_M y 4,3B parámetros cabe en GPUs de 8-16 GB; el autor lo entrenó en una RX 6800 XT de 16 GB, por lo que sirve para prototipado local de agentes sin coste de API.
- Integración en Ollama mediante el Modelfile incluido (`ollama create empero-4b-tools-v21 -f Modelfile.ollama`), útil para entornos de desarrollo donde se quiere un subagente de herramientas reproducible y local.
- Evaluación de protocolos de agentes: al documentar el autor canaries, smoke suites y veredictos sobre artefactos, el modelo sirve como referencia para comparar variantes de entrenamiento en tareas de tool use con métricas verificables.
- Asistencia en flujos con idioma rumano o inglés: es uno de los pocos modelos de 4B con soporte declarado de rumano en tareas de agente, útil para automatizaciones localizadas en esos idiomas.

## Benchmarks y rendimiento

Los datos disponibles son los publicados por el autor, medidos sobre el arnés real y con artefactos verificados (no autoinforme):

| Evaluación | Resultado |
|---|---|
| Canary agent-loop12 | 11/12 (línea base 9/12; v20 9/12) |
| Turnos medios por tarea | 3,2 (el más eficiente de la familia, según el autor) |
| Smoke suite de 30 tareas | 13 pass / 15 fail / 2 INVALID (re-puntuado sobre artefactos) |
| B7 fabricación | 0 aciertos en 30 tareas |
| B9 lista perdida | 0 fallos; 10/10 checklist con artefactos reales |
| B3 reflejo sudo | 1 acierto (SM20), límite conocido |
| B11 cuelgue por stdin | 1 acierto (SM22), límite conocido |
| Disciplina de entregables | ~7 fallos: trabajo correcto pero archivo de informe no persistido o nombre mal escrito |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-9 GB en q8_0, 5-6 GB en q6_K y 3-4 GB en q4_K_M para un modelo de 4,3B; en f16/bf16 en torno a 9 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para mayor throughput; el autor entrenó en una RX 6800 XT de 16 GB, lo que confirma viabilidad en gama media-alta.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más con cuantización q4_K_M o q6_K; en 6 GB solo con cuantizaciones más agresivas no listadas.
- Opciones de despliegue: Ollama (Modelfile incluido), llama.cpp para GGUF, vLLM o TGI para safetensors, y el stack Hermes del autor.
- Parámetros de servicio recomendados por el autor: temperatura 0,3, num_ctx 64k, num_predict 1024.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8-4b-empero-v21-Hermes | 4,3B | no disponible (recomendado 64k) | Tool calling y subagente Hermes | Apache 2.0 | HF, safetensors y GGUF |
| empero-ai/Qwen3.8-4B-Distill (base) | 4,3B | no disponible | Destilación generalista | no disponible | HF |
| v20 de la misma familia | 4,3B | no disponible | Tool calling y subagente Hermes | no disponible | HF |
| Qwen3.5 4B (familia base) | ~4B | no disponible | Generación generalista | no disponible | HF |

La comparativa se limita a los modelos citados en la información disponible; no se han podido verificar datos de contexto, rendimiento ni licencia de las alternativas más allá de lo indicado.

## Limitaciones y advertencias

- Disciplina de entregables: el fallo principal restante (~7 de 30 tareas) es que el modelo completa el trabajo correctamente pero no persiste el archivo de informe solicitado o lo guarda con el nombre mal escrito; en producción hay que validar la existencia y el nombre de los artefactos.
- Reflejo sudo: persiste un caso conocido (SM20) de intento de uso de sudo pese a la normalización de datos; requiere sandboxing y permisos mínimos.
- Cuelgue por stdin: un caso conocido (SM22) con programas interactivos alimentados por stdin; conviene forzar stdin no interactivo a nivel de infraestructura.
- Errores de unidades KB/MB documentados como límite conocido que abordará la versión v23.
- Riesgo de alucinación: aunque la suite reporta 0 aciertos de fabricación en 30 tareas, el modelo sigue siendo un LM de 4B y puede inventar valores fuera de las condiciones evaluadas.
- Idiomas: solo inglés y rumano declarados; el rendimiento en castellano no está verificado.
- Contexto: la model card no publica la longitud de contexto nativa; la recomendación de servicio de 64k debe validarse empíricamente.
- Licencia: Apache 2.0 permite uso comercial, pero la base empero-ai/Qwen3.8-4B-Distill debe revisarse por separado, ya que su licencia figura como no disponible en la información recogida.
- Dataset de entrenamiento privado por revisión de licencias de profesores; la reproducibilidad completa no es posible sin solicitarlo al autor.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ferry-el-kom/qwen3.8-4b-empero-v21-Hermes-agentic-subagent-toolcalls
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Dataset de entrenamiento (privado, bajo petición): https://huggingface.co/ferry-el-kom/hermes-agentic-tooluse-v21-sft-dataset
- Perfil del autor en Hugging Face: https://huggingface.co/ferry-el-kom
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
