# shricodev/chashmish-babubhaiya

## Resumen

chashmish-babubhaiya es un modelo pequeño de GUI grounding desarrollado por shricodev. Se trata de un fine-tune con LoRA de Qwen/Qwen3-VL-2B-Instruct, un modelo vision-language de 2.127 millones de parámetros, especializado en una tarea muy concreta: recibir una captura de pantalla y una instrucción en lenguaje natural (por ejemplo, "abrir la página de precios") y devolver las coordenadas del punto donde debe hacerse clic, expresadas como `(x, y)` sobre una rejilla normalizada de 0 a 1000 relativa a la imagen.

El modelo resuelve un problema específico dentro del ámbito de los agentes de navegador y computer-use: la localización visual de elementos de interfaz (click targets) a partir de instrucciones. Frente a alternativas propietarias de mayor tamaño, ofrece una latencia baja (613 ms de mediana en su conjunto de evaluación propio) y un consumo de VRAM en torno a 5 GB, lo que permite ejecutarlo en una única GPU T4 gratuita de Kaggle, el mismo entorno donde fue entrenado.

Es relevante ahora porque los agentes que operan interfaces web necesitan componentes de grounding ligeros, desplegables en local y con licencia permisiva. El modelo se distribuye bajo Apache 2.0 y está pensado como un componente más dentro de un pipeline de agente, no como un sistema autónomo de decisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL), fine-tune LoRA sobre Qwen/Qwen3-VL-2B-Instruct |
| Parámetros totales | 2.127.532.032 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el autor indica ejecución en ~5 GB de VRAM) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 4,3 GB |
| Modelo base | Qwen/Qwen3-VL-2B-Instruct |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct, un transformer vision-language de 2.127 millones de parámetros que procesa imágenes y texto conjuntamente. Sobre esa base se aplicó un fine-tune con LoRA orientado exclusivamente a la tarea de grounding de interfaces: dada una captura y una instrucción, el modelo genera una respuesta corta con el formato `(x, y)` en una rejilla de 0 a 1000. La generación se realiza con `max_new_tokens=16` y decodificación greedy en el ejemplo de uso, lo que refleja que la salida esperada es muy breve y estructurada.

El conjunto de entrenamiento consta de 60.105 ejemplos de la forma (captura, instrucción, caja), construidos con el código publicado en el repositorio chashma-screen-grounding-engine. Los datos se generaron renderizando sitios web reales con Playwright, extrayendo los objetivos de clic y sus etiquetas directamente del DOM, y generando las instrucciones mediante plantillas combinadas con un LLM de visión. El entrenamiento se realizó en una única GPU T4 gratuita de Kaggle. No se especifican en la información disponible detalles sobre número de tokens de entrenamiento, composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- GUI grounding: localiza el elemento de interfaz que corresponde a una instrucción en lenguaje natural y devuelve el punto de clic como `(x, y)` en una rejilla normalizada de 0 a 1000.
- Procesamiento de imagen y texto: acepta capturas de pantalla junto con una instrucción textual mediante el procesador y la plantilla de chat de Qwen3-VL.
- Salida estructurada y breve: responde con coordenadas parseables mediante expresión regular, adecuadas para pipelines automatizados.
- Especialización en páginas web de escritorio y móviles: el entrenamiento se centró en sitios web renderizados con Playwright.
- Capacidades heredadas del modelo base (Qwen3-VL-2B-Instruct): no se documentan explícitamente en la información disponible más allá de la tarea de grounding.
- Soporte de tool calling, agentes multi-paso, modo thinking, visión general o audio: no disponible en la información proporcionada.

## Casos de uso

- Automatización de pruebas de interfaz web: dado un flujo de usuario descrito en lenguaje natural, el modelo identifica el elemento a pulsar en cada captura y permite construir scripts de test end-to-end que se adaptan a cambios de maquetación sin selectores CSS frágiles.
- Agentes de navegador para tareas de back-office: integrado en un agente que opera un navegador headless, el modelo resuelve el paso de "dónde hacer clic" para instrucciones como "abrir la página de precios" o "ir a ajustes de cuenta", con latencia de 613 ms de mediana en su conjunto de evaluación.
- Asistentes de soporte remoto: en herramientas de guiado visual para usuarios, el modelo señala sobre la captura de pantalla del usuario el elemento que debe pulsar según la instrucción del operador.
- Rellenado asistido de formularios web: el modelo localiza campos y botones en capturas de formularios, permitiendo que un pipeline de automatización determine el siguiente control a interactuar.
- Extracción de flujos en documentación y tutoriales: a partir de capturas de producto, el modelo genera anotaciones de puntos de clic que pueden incorporarse a guías interactivas o a bases de conocimiento de onboarding.
- Componente de grounding en agentes computer-use con supervisión humana: al predecir únicamente una localización, se integra como módulo de percepción dentro de un agente que mantiene una capa de política y validación humana antes de ejecutar acciones sobre cuentas reales.
- Prototipado en entornos con recursos limitados: su consumo de ~5 GB de VRAM permite desplegarlo en una T4 o en GPUs de consumo para experimentación y demos, sin depender de APIs externas.

## Benchmarks y rendimiento

La precisión se define como el porcentaje de predicciones cuyo punto cae dentro de la caja del elemento objetivo.

| Modelo | Conjunto de evaluación | n | Precisión de clic | Latencia p50 |
|---|---|---|---|---|
| Qwen/Qwen3-VL-2B-Instruct | Webs no vistas (test propio) | 300 | 78,0% | 613 ms |
| anthropic:claude-haiku-5-5 | Webs no vistas (test propio) | 300 | 90,7% | 1680 ms |
| chashmish-babubhaiya | Webs no vistas (test propio) | 300 | 84,7% | 613 ms |
| Qwen/Qwen3-VL-2B-Instruct | ScreenSpot web | 436 | 81,9% | 993 ms |
| anthropic:claude-haiku-5-5 | ScreenSpot web | 436 | 93,1% | 1236 ms |
| chashmish-babubhaiya | ScreenSpot web | 436 | 82,6% | 1275 ms |

El fine-tune mejora al modelo base en su conjunto de test propio (84,7% frente a 78,0%) y lo iguala ligeramente en ScreenSpot web (82,6% frente a 81,9%). Frente a claude-haiku-5-5 queda por debajo en precisión en ambos conjuntos, pero con menor latencia en el test propio (613 ms frente a 1680 ms).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 GB según el autor, lo que corresponde a los pesos en safetensors del modelo de 2.127 millones de parámetros más el procesador de imagen.
- GPU recomendadas: el modelo fue entrenado en una única T4 de Kaggle y está dimensionado para GPUs de gama media; una RTX 4090, A100 o H100 ofrecerían margen sobrado y mayor throughput.
- Cabe en GPU de consumo: sí, con al menos ~5 GB de VRAM disponibles (por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090).
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `AutoProcessor`, tal como muestra el ejemplo de la model card; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se documentan en la información disponible configuraciones específicas para vLLM, llama.cpp, Ollama o TGI.
- Latencia: 613 ms de mediana en webs no vistas del test propio y 1275 ms en ScreenSpot web, medidos con la configuración de generación del ejemplo (`max_new_tokens=16`, greedy). No se proporcionan datos de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión de clic (test propio / ScreenSpot web) | Latencia p50 (test propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| chashmish-babubhaiya | 2.127 millones | no disponible | 84,7% / 82,6% | 613 ms | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-VL-2B-Instruct | 2.127 millones | no disponible | 78,0% / 81,9% | 613 ms | no disponible en la información | Hugging Face |
| anthropic:claude-haiku-5-5 | no disponible | no disponible | 90,7% / 93,1% | 1680 ms | propietaria | API de Anthropic |

## Limitaciones y advertencias

- Dominio restringido: entrenado únicamente con páginas web de escritorio y móviles renderizadas con Playwright; las aplicaciones nativas de escritorio y móvil quedan fuera de la distribución de entrenamiento.
- Fallo principal: los objetivos pequeños en pantallas grandes son el modo de error más frecuente.
- Predice solo una localización: no evalúa si el clic es seguro o intencionado; para agentes que actúan sobre cuentas reales es imprescindible mantener una capa de política o supervisión humana en el bucle.
- Precisión inferior a alternativas propietarias: 84,7% frente a 90,7% de claude-haiku-5-5 en el test propio y 82,6% frente a 93,1% en ScreenSpot web.
- Idiomas soportados: no disponible; no se documenta el comportamiento multilingüe de las instrucciones.
- Longitud de contexto: no disponible; la tarea está diseñada para instrucciones cortas y salidas de muy pocos tokens.
- Sesgos: no se documentan sesgos específicos en la información disponible, más allá de los heredados del modelo base y de la distribución de sitios web usados en la generación de datos.
- Riesgo de alucinación de coordenadas: al ser un modelo generativo, puede producir un punto plausible pero incorrecto cuando el elemento no está presente o es ambiguo.
- Licencia Apache 2.0: permisiva para uso comercial, sin restricciones adicionales documentadas por el autor; conviene verificar las condiciones del modelo base Qwen3-VL-2B-Instruct.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shricodev/chashmish-babubhaiya
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Código de generación del dataset (screen grounding engine): https://github.com/shricodev/chashma-screen-grounding-engine
