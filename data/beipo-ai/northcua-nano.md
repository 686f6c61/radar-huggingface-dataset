# beipo-ai/NorthCUA-Nano

## Resumen

NorthCUA-Nano es un modelo multimodal de 9B parámetros diseñado específicamente para actuar como agente de uso de ordenador (*computer-use agent*). Lo desarrolla beipo-ai y se construye sobre la arquitectura Qwen3.5, en su variante densa. El modelo recibe instrucciones de usuario, capturas de pantalla e historial de interacción, y genera razonamiento, respuestas y llamadas a herramientas orientadas a un entorno de escritorio o navegador. Forma parte de una familia de tres modelos (Nano 9B denso, Mini 35B MoE con 3B activos y Pro 397B MoE con 17B activos).

Su relevancia actual reside en que aborda una tarea emergente: automatizar flujos de trabajo reales sobre interfaces gráficas, no solo sobre APIs. Para ello combina *visual grounding* (localización de elementos en pantalla) con razonamiento multi-paso y ejecución de acciones, entrenado mediante aprendizaje por refuerzo sobre trayectorias verificadas. Se distribuye con licencia Apache-2.0, lo que facilita su adopción comercial.

El modelo no funciona de forma aislada: requiere el *harness* oficial NorthCUA-Harness, que gestiona los prompts, las llamadas a herramientas, las observaciones y la ejecución de acciones, además de convertir las coordenadas normalizadas (0–1000) a píxeles reales en el momento de la ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso basado en Qwen3.5 |
| Parametros totales | 9.409.813.744 (≈9B) |
| Parametros activos | 9B (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

NorthCUA-Nano es un transformer denso multimodal construido sobre Qwen3.5, con aproximadamente 9.400 millones de parámetros. Procesa entradas de tipo imagen-texto (pipeline `image-text-to-text`): capturas de pantalla del entorno, instrucciones en lenguaje natural e historial de interacción. La salida combina razonamiento explícito, texto de respuesta y llamadas a herramientas con coordenadas de acción en el espacio normalizado 0–1000.

El entrenamiento se articula en dos fases según la documentación del autor: primero un ajuste supervisado (SFT) orientado al *grounding* visual, y después un aprendizaje por refuerzo (RL) conjunto sobre entornos de escritorio y web que optimiza la tasa de éxito en la finalización de tareas. El modelo se apoya en el concepto de "experiencia verificada": trayectorias largas que enseñan pasos dependientes, artefactos intermedios y verificación de resultados. Los detalles sobre volumen de tokens, composición del dataset y uso de RLHF/DPO no están disponibles en la información proporcionada.

Una innovación destacable es el contrato estricto de coordenadas normalizadas (`normalized_1000`), que desacopla la predicción del modelo de la resolución concreta de pantalla; el *harness* realiza la conversión a píxeles. El modelo está diseñado para operar conjuntamente con NorthCUA-Harness, que orquesta el bucle percepción-acción.

## Capacidades

- Comprensión de instrucciones en lenguaje natural junto con observaciones visuales (capturas de pantalla) para determinar la siguiente acción.
- *Visual grounding*: localización de elementos de interfaz (botones, campos, enlaces) y emisión de coordenadas normalizadas 0–1000.
- Razonamiento multi-paso y planificación de tareas dependientes dentro de flujos de escritorio y web.
- Llamadas a herramientas (*tool calling*) integradas con el harness para ejecutar acciones (clic, escritura, navegación).
- Operación sobre aplicaciones de escritorio y flujos de navegador web.
- Verificación de resultados intermedios y finales a partir de observaciones posteriores a la acción.
- Capacidades multimodales imagen-texto (pipeline `image-text-to-text`).
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Automatización de tareas de escritorio repetitivas: el modelo observa la pantalla, identifica los controles necesarios y ejecuta secuencias de clics y escritura para completar flujos como rellenar formularios o gestionar archivos, apoyándose en su *grounding* visual.
- Automatización de flujos web de extremo a extremo: navegación, inicio de sesión, extracción de datos y envío de formularios en sitios sin API, usando las coordenadas normalizadas para adaptarse a distintas resoluciones.
- Pruebas de regresión de interfaz (QA automatizado): un agente basado en NorthCUA-Nano puede recorrer una aplicación, ejecutar casos de prueba definidos en lenguaje natural y verificar visualmente el resultado, reduciendo la necesidad de scripts frágiles basados en selectores.
- Asistente de accesibilidad: interpretar la pantalla y ejecutar acciones a petición de un usuario con dificultades motoras, traduciendo instrucciones verbales en operaciones concretas sobre la interfaz.
- Automatización de back-office y RPA de nueva generación: sustituir grabadores de macros por un agente que razona sobre el estado de la aplicación y se adapta a cambios menores de disposición.
- Soporte técnico de primer nivel con observación de pantalla: el agente puede guiar o ejecutar pasos de resolución de incidencias tras recibir una captura del entorno del usuario.
- Investigación en agentes: servir como modelo compacto de referencia (9B denso) para experimentar con RL sobre entornos de escritorio y web sin el coste de cómputo de las variantes MoE de mayor tamaño.

## Benchmarks y rendimiento

Los resultados proceden del informe técnico del autor y corresponden a checkpoints de investigación, no necesariamente a los pesos exactos de este repositorio. El *grounding* se mide sobre checkpoints SFT y la finalización de tareas sobre checkpoints RL posteriores.

| Benchmark | Metrica | Nano · 9B | Mini · 35B | Pro · 397B |
|---|---|---|---|---|
| ScreenSpot-Pro | SFT · accuracy (%) | 72,87 | 92,41 | 93,30 |
| OSWorld-G | SFT · accuracy (%) | 82,98 | 87,94 | 90,96 |
| OSWorld-Verified | RL · success (%) | 78,90 | 85,30 | 88,64 |
| WebArena-Verified | RL · success (%) | 67,16 | 70,43 | 73,89 |

Comparativa SFT frente a RL para el propio modelo Nano:

| Modelo | OSWorld SFT | OSWorld RL | WebArena SFT | WebArena RL |
|---|---|---|---|---|
| Nano | 76,05 | 78,90 | 64,16 | 67,16 |

Condiciones de evaluación: ScreenSpot-Pro con 1.581 ejemplos y una predicción por captura sin búsqueda iterativa de zoom/recorte; OSWorld-G con 564 instrucciones y mejor de tres ejecuciones completas (temperatura 0,7, top-p 0,95, top-k 40, 1.024 tokens de salida, coordenadas 0–1000); OSWorld-Verified con 361 tareas y WebArena-Verified con 812 tareas, ambas con límite de 100 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,4B parámetros en safetensors (18,8 GB de repositorio), la inferencia en bf16 requiere del orden de 19–20 GB de VRAM solo para pesos, más memoria para el procesamiento de imágenes y el contexto.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encajan A100 (40/80 GB), H100, L40S o RTX 6000 Ada. En consumer, una RTX 4090 (24 GB) podría alojar los pesos en bf16 ajustadamente, con margen limitado para contexto e imágenes.
- Cuantización: los tipos soportados no están documentados; no se han publicado pesos GGUF ni cuantizados en el repositorio.
- Opciones de despliegue: el modelo se distribuye para `transformers` y requiere NorthCUA-Harness para el bucle de uso de ordenador. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | OSWorld-Verified (RL) | WebArena-Verified (RL) | Licencia |
|---|---|---|---|---|---|---|
| NorthCUA-Nano | 9B | Densa (Qwen3.5) | no disponible | 78,90 % | 67,16 % | Apache-2.0 |
| NorthCUA-Mini | 35B (3B activos) | MoE | no disponible | 85,30 % | 70,43 % | Apache-2.0 |
| NorthCUA-Pro | 397B (17B activos) | MoE | no disponible | 88,64 % | 73,89 % | Apache-2.0 |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada; la comparación se limita a los miembros de la propia familia NorthCUA.

## Limitaciones y advertencias

- Requiere el NorthCUA-Harness oficial: el modelo no está pensado para uso autónomo y su contrato de coordenadas (0–1000 normalizado) debe respetarse; usar píxeles crudos rompe la interacción.
- Los resultados publicados corresponden a checkpoints de investigación y no están vinculados a una exportación exacta de los pesos de este repositorio, según advierte el propio autor.
- Riesgo de alucinación en la interpretación de pantallas y en la selección de elementos de interfaz, especialmente en disposiciones no vistas durante el entrenamiento.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponible; no se garantiza cobertura multilingüe más allá de lo que herede de Qwen3.5.
- Longitud de contexto: no disponible, lo que dificulta planificar tareas de muchas decenas de pasos.
- Límite de 100 pasos en las evaluaciones OSWorld y WebArena; tareas más largas pueden degradar la tasa de éxito.
- Licencia Apache-2.0 permisiva para uso comercial, pero sin garantías del autor sobre el comportamiento en producción; conviene validar en el entorno objetivo antes de desplegar.
- No se han publicado pesos cuantizados, lo que limita el despliegue en hardware de gama media.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beipo-ai/NorthCUA-Nano
- Página del proyecto: https://beipo.top/blog/northcua/
- Repositorio del harness: https://github.com/china-qijizhifeng/NorthCUA-Harness
- Modelo NorthCUA-Mini: https://huggingface.co/beipo-ai/NorthCUA-Mini
- Modelo NorthCUA-Pro: https://huggingface.co/beipo-ai/NorthCUA-Pro
- Licencia: https://huggingface.co/beipo-ai/NorthCUA-Nano/blob/main/LICENSE
- Informe técnico (referencia arXiv del modelo): arxiv:2611.02102
