# ChilleD/WebHarbor-4B

## Resumen

WebHarbor-4B es un agente web con capacidad de visión (GUI agent) de 4.827 millones de parámetros desarrollado por el equipo WebHarbor (ChilleD y colaboradores, vinculado al repositorio aiming-lab). Se trata de un ajuste fino mediante aprendizaje por refuerzo (RL) del modelo OpenWebRL-4B-SFT, que a su vez deriva de Qwen3-VL-4B-Thinking. El modelo actúa como política que observa capturas de pantalla del navegador y emite acciones (clics, escritura, navegación) a través de la interfaz de navegador de OpenWebRL.

La propuesta central es entrenar al agente íntegramente dentro de WebHarbor, un conjunto de 153 reconstrucciones ejecutables de sitios web reales (con inicios de sesión, carritos, reservas y 3.518 tareas), sin tocar nunca la web en vivo durante el entrenamiento. A pesar de ello, el modelo transfiere a la web real: alcanza una media de 75,8 en WebVoyager y Online-Mind2Web, superando según el autor a GPT-5 (74,2) y al resto de agentes open source comparados.

Es relevante ahora porque demuestra que entornos offline reconstruidos pueden sustituir al entrenamiento sobre web en vivo para tareas con estado (logins, transacciones, navegación multipágina), un escenario donde el entrenamiento tradicional rara vez cubre. El modelo se sirve con sglang y expone una API compatible con OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL-4B-Thinking), ajustado con RL |
| Parametros totales | 4.826.771.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (usado en evaluacion) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el ejemplo de servicio) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Thinking, un transformer multimodal de 4B parámetros con modo de razonamiento (bloque `<think>`), y se inicializa desde OpenWebRL-4B-SFT. El ajuste se realiza mediante aprendizaje por refuerzo dentro de WebHarbor, un entorno compuesto por 153 reconstrucciones ejecutables de sitios web reales con 3.518 tareas que incluyen inicios de sesión, carritos, reservas y operaciones con estado. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset de RL.

La innovación destacable es metodológica: el agente nunca accede a la web en vivo durante el RL, pero transfiere a ella. La evaluación se realiza con los 15 sitios de WebVoyager retenidos fuera del entrenamiento y con tareas de Online-Mind2Web y WebArena no presentes en los datos de entrenamiento. La plantilla de chat del modelo abre ya el bloque `<think>`, por lo que los clientes no deben añadirlo. Se sirve mediante sglang 0.5.6.post2 con backend de atención flashinfer y triton_attn para la parte multimodal.

## Capacidades

- Percepción visual de capturas de pantalla de navegador (pipeline image-text-to-text) para localizar elementos e interpretar el estado de la página.
- Emisión de acciones de GUI web: clics, escritura de texto, navegación entre páginas y operaciones con estado (login, carrito, reserva, transacción).
- Razonamiento multi-paso con modo de pensamiento (`<think>`) integrado en la plantilla de chat.
- Navegación multipágina y flujos con estado persistente a lo largo de la sesión.
- Ejecución de tareas web de extremo a extremo mediante la interfaz de navegador de OpenWebRL.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés (`en`).
- Capacidades de audio: no disponible.

## Casos de uso

- Automatización de flujos con inicio de sesión: el modelo está entrenado específicamente en entornos con logins y operaciones autenticadas, por lo que puede gestionar sesiones con estado en portales internos o de cliente donde otros agentes fallan.
- Comercio electrónico y transacciones: añadir productos al carrito, completar compras y gestionar estados de pedido, aprovechando su entrenamiento en carritos y operaciones con estado reconstruidos.
- Reservas y gestión de citas: navegar por calendarios y formularios multipágina para completar reservas, un flujo con estado que el modelo cubre explícitamente en entrenamiento.
- Extracción de información de sitios web: recorrer varias páginas y recopilar datos estructurados usando percepción visual más razonamiento multi-paso.
- Evaluación y benchmarking de agentes web: servir como política de referencia open source para comparar contra otros agentes en WebVoyager, Online-Mind2Web y WebArena con el arnés de OpenWebRL.
- Automatización de tareas administrativas en back-office: rellenar formularios, consultar estados y ejecutar acciones repetitivas en aplicaciones web internas con contexto de 32K tokens para secuencias largas.
- Investigación en RL para agentes: reutilizar el modelo como punto de partida o base de comparación en experimentos de entrenamiento con entornos reconstruidos tipo WebHarbor.

## Benchmarks y rendimiento

| Benchmark | OpenWebRL-4B-SFT | OpenWebRL-4B | WebHarbor-4B |
|---|---:|---:|---:|
| WebVoyager | 60,2 | 74,1 | 81,2 |
| Online-Mind2Web | 47,0 | 67,0 | 70,4 |
| WebArena | 26,1 | 20,4 | 28,8 |
| WebArena sin auto-login | 21,2 | 16,8 | 26,1 |
| WebHarbor test set | 29,1 | 19,7 | 30,0 |

Según el autor, la media de 75,8 en WebVoyager y Online-Mind2Web supera a GPT-5 (74,2) y a todos los agentes open source listados. No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (4,83B parámetros) se requieren aproximadamente 9,7 GB solo para pesos, más memoria para caché KV y procesamiento de imágenes; el ejemplo oficial usa `--mem-fraction-static 0.9` en una única GPU.
- GPU recomendadas: una sola GPU con al menos 24 GB de VRAM para el contexto de 32K en bfloat16; A100, H100 o L40S son opciones holgadas. No se detalla el mínimo exacto en la información disponible.
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 4090, aunque el margen con contexto de 32K y entradas visuales puede ser ajustado; no se confirma en la información disponible.
- Opciones de despliegue: sglang 0.5.6.post2 es la vía oficial (`python -m sglang.launch_server`), con backend flashinfer y triton_attn para multimodal. No se documentan en la información disponible recetas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WebVoyager | Online-Mind2Web | Licencia |
|---|---|---|---|---|---|
| WebHarbor-4B | 4,83B | 32K | 81,2 | 70,4 | no disponible |
| OpenWebRL-4B | no disponible | no disponible | 74,1 | 67,0 | no disponible |
| OpenWebRL-4B-SFT (base) | no disponible | no disponible | 60,2 | 47,0 | no disponible |
| GPT-5 (referencia del autor) | no disponible | no disponible | media 74,2 combinada | media 74,2 combinada | propietaria |

Los datos de GPT-5 se presentan en la model card como media combinada de ambos benchmarks, no por separado. No se dispone de información sobre otros agentes open source comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Idiomas: solo inglés; no se declara soporte multilingüe.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que verificar la licencia del modelo base (Qwen3-VL y OpenWebRL) antes de producción.
- Riesgo de alucinación: al ser un agente que interpreta capturas de pantalla, puede ejecutar acciones incorrectas sobre elementos mal identificados; requiere validación y límites de seguridad en entornos reales.
- Rendimiento en WebArena bajo en términos absolutos (28,8), lo que sugiere dificultades en entornos con estructuras distintas a las de entrenamiento.
- La plantilla de chat abre el bloque `<think>`; añadirlo manualmente puede degradar el comportamiento.
- Dependencia del arnés de OpenWebRL y de sglang 0.5.6.post2; no se documentan alternativas de despliegue.
- Entrenado contra reconstrucciones de sitios web, no contra la web en vivo; el comportamiento ante cambios de UI no documentados no está garantizado.
- Solo 25 descargas y 0 likes en el momento de la consulta: ecosistema de uso aún muy reducido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChilleD/WebHarbor-4B
- Página del proyecto: https://aiming-lab.github.io/WebHarbor/
- Repositorio de código (entornos y evaluación): https://github.com/aiming-lab/WebHarbor
- Dataset de entornos (153 entornos): https://huggingface.co/datasets/ChilleD/WebHarbor
- Imágenes Docker: https://hub.docker.com/r/wildawm/webharbor
- Modelo base: https://huggingface.co/OpenWebRL/OpenWebRL-4B-SFT
- Modelo Qwen3-VL-4B-Thinking: https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking
- Repositorio OpenWebRL: https://github.com/OpenWebRL/OpenWebRL
