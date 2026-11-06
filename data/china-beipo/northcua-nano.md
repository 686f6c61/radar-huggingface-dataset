# china-beipo/NorthCUA-Nano

## Resumen

NorthCUA-Nano es un modelo multimodal de 9.409.813.744 parámetros (aproximadamente 9B) desarrollado por china-beipo, diseñado específicamente como agente de uso de ordenador (*computer-use*). Se construye sobre la arquitectura Qwen3.5 y procesa entradas de tipo imagen-texto para generar razonamiento, respuestas y llamadas a herramientas que un runtime de escritorio o navegador puede ejecutar. Forma parte de una familia de tres modelos (Nano 9B denso, Mini 35B MoE con 3B activos y Pro 397B MoE con 17B activos), todos publicados bajo licencia Apache-2.0.

El modelo resuelve el problema de la automatización de tareas GUI de extremo a extremo: recibe una instrucción del usuario, capturas de pantalla e historial de interacción, y produce acciones concretas sobre la interfaz. Su relevancia actual radica en que aborda el *computer-use* con un enfoque de entrenamiento por experiencia a escala (bucle Harness + Experience Flywheel + Staged Learning), y lo hace con un modelo denso de 9B que resulta desplegable en hardware mucho más modesto que las alternativas MoE de mayor tamaño.

La innovación principal es el contrato estricto de coordenadas `normalized_1000`: todas las acciones GUI se expresan en un espacio normalizado 0–1000 en lugar de píxeles crudos, y es el Harness oficial quien convierte a píxeles en tiempo de ejecución. El modelo está pensado para usarse conjuntamente con el NorthCUA Harness, que gestiona prompts, llamadas a herramientas, observaciones y ejecución de acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5, multimodal (image-text-to-text) |
| Parametros totales | 9.409.813.744 (~9B) |
| Parametros activos | 9B (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 18,8 GB) |

## Arquitectura y entrenamiento

NorthCUA-Nano es un transformer denso de aproximadamente 9B parámetros construido sobre Qwen3.5, con capacidades multimodales de entrada imagen-texto. A diferencia de sus hermanos Mini (35B MoE, 3B activos) y Pro (397B MoE, 17B activos), Nano utiliza todos sus parámetros en cada token, lo que simplifica el despliegue pero concentra el coste computacional en un único tamaño denso. El modelo genera razonamiento intermedio, respuestas en lenguaje natural y llamadas a herramientas estructuradas para un runtime de escritorio o navegador.

El entrenamiento sigue el bucle de experiencia descrito en el informe técnico: un Harness común que ejecuta las acciones, un *Experience Flywheel* que recoge trayectorias verificadas y un *Staged Learning* que estructura el aprendizaje en fases. Según la model card, el modelo aprende de trayectorias completas que incluyen pasos dependientes, artefactos intermedios y verificación de resultados. Los resultados de *grounding* (ScreenSpot-Pro, OSWorld-G) provienen de checkpoints SFT, mientras que los de finalización de tareas (OSWorld-Verified, WebArena-Verified) provienen de checkpoints RL conjuntos de escritorio y web. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO más allá de la fase RL mencionada.

## Capacidades

- Generación de razonamiento y respuestas en lenguaje natural a partir de instrucciones del usuario.
- *Visual grounding*: localización de elementos de interfaz en capturas de pantalla con coordenadas normalizadas 0–1000.
- Acciones GUI sobre aplicaciones de escritorio y flujos web (clics, escritura, navegación) mediante llamadas a herramientas.
- Razonamiento multi-paso con dependencias entre acciones e historial de interacción.
- Verificación de resultados intermedios y finales dentro de una trayectoria de tarea.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`).
- Integración con el NorthCUA Harness para prompts, ejecución de acciones y observaciones.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas de escritorio repetitivas: el modelo recibe una instrucción y capturas de pantalla, y genera la secuencia de clics y entradas de teclado necesaria para completar la tarea en aplicaciones nativas, con verificación de cada paso.
- Automatización de flujos web en navegador: adecuado para rellenar formularios, navegar entre páginas y extraer información, usando el contrato de coordenadas normalizadas para localizar elementos con independencia de la resolución.
- Pruebas de regresión de interfaces gráficas: el modelo puede ejecutar guiones de prueba sobre una aplicación y comprobar visualmente el estado resultante, integrándose en pipelines de QA.
- Asistentes de accesibilidad: interpretación de la pantalla y generación de acciones guiadas para usuarios con dificultades motoras o visuales, con el Harness ejecutando las acciones.
- Extracción de datos de aplicaciones legacy: automatización de la captura de información desde software sin API, mediante interacción GUI guiada por visión.
- Orquestación de tareas multi-aplicación: combinación de escritorio y web en una misma trayectoria (por ejemplo, consultar un correo, descargar un adjunto y procesarlo en una hoja de cálculo), gracias al entrenamiento en trayectorias completas con pasos dependientes.
- Evaluación de agentes en entornos controlados: uso del modelo como referencia de 9B denso para comparar con variantes MoE (Mini, Pro) en benchmarks como OSWorld o WebArena.

## Benchmarks y rendimiento

Resultados reportados en el informe técnico de NorthCUA. El *grounding* usa checkpoints SFT; la finalización de tareas usa checkpoints RL conjuntos de escritorio y web. Estos resultados de investigación no están vinculados a un checkpoint de exportación exacto y no son mediciones nuevas de los ficheros de este repositorio.

| Benchmark | Etapa / metrica | Nano · 9B | Mini · 35B | Pro · 397B |
|---|---|---|---|---|
| ScreenSpot-Pro | SFT · accuracy (%) | 72,87 | 92,41 | 93,30 |
| OSWorld-G | SFT · accuracy (%) | 82,98 | 87,94 | 90,96 |
| OSWorld-Verified | RL · success (%) | 78,90 | 85,30 | 88,64 |
| WebArena-Verified | RL · success (%) | 67,16 | 70,43 | 73,89 |

Comparativa SFT frente a RL reportada en el informe:

| Modelo | OSWorld SFT | OSWorld RL | WebArena SFT | WebArena RL |
|---|---|---|---|---|
| Nano | 76,05 | 78,90 | 64,16 | 67,16 |
| Mini | 83,29 | 85,30 | 67,98 | 70,43 |
| Pro | 85,87 | 88,64 | 69,58 | 73,89 |

Condiciones de evaluación: ScreenSpot-Pro con 1.581 ejemplos, una predicción por captura y sin búsqueda iterativa de zoom/crop. OSWorld-G con 564 instrucciones refinadas y mejor de tres ejecuciones completas (temperatura 0,7, top-p 0,95, top-k 40, 1.024 tokens de salida, coordenadas normalizadas 0–1000). OSWorld-Verified con 361 tareas (excluidas ocho tareas de Google Drive) y WebArena-Verified con 812 tareas, ambos con límite de 100 pasos por tarea. El informe también menciona un 66,80 % de crédito parcial medio para Pro tras RL en OSWorld 2.0 (108 tareas, límite de 500 pasos); los resultados de Nano y Mini no están disponibles en esa tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio contiene 18,8 GB en safetensors, lo que corresponde a pesos en FP16/BF16 para ~9B parámetros. En FP16 se necesitan aproximadamente 19 GB solo para pesos, más overhead de activaciones y KV cache.
- En cuantización de 8 bits se estiman unos 10–11 GB de VRAM; en 4 bits, unos 6–7 GB, aunque los tipos de cuantización oficiales no están disponibles en la información proporcionada.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16 sin compromisos. Una RTX 4090 (24 GB) puede alojar los pesos en FP16 con margen limitado para contexto corto.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16 con contexto reducido, y en GPUs de 12–16 GB mediante cuantización (sujeto a disponibilidad de pesos cuantizados, no confirmada).
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible. El uso de computer-use requiere el NorthCUA Harness.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Arquitectura | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| NorthCUA-Nano | ~9B | 9B | Denso (Qwen3.5) | no disponible | Apache-2.0 | Computer-use multimodal |
| NorthCUA-Mini | 35B | 3B | MoE | no disponible | Apache-2.0 | Computer-use multimodal |
| NorthCUA-Pro | 397B | 17B | MoE | no disponible | Apache-2.0 | Computer-use multimodal |

La comparativa con modelos de otros desarrolladores (por ejemplo, agentes GUI de la competencia) no está disponible en la información proporcionada. Dentro de la propia familia, Nano es la opción densa más ligera: obtiene 78,90 % en OSWorld-Verified frente a 85,30 % de Mini y 88,64 % de Pro, y 67,16 % en WebArena-Verified frente a 70,43 % y 73,89 %, respectivamente, a cambio de un despliegue mucho más sencillo y un coste de memoria muy inferior.

## Limitaciones y advertencias

- Requiere el NorthCUA Harness oficial para funcionar como agente de computer-use; no está pensado para uso aislado con prompts arbitrarios.
- Contrato de coordenadas estricto: todas las acciones deben usar el espacio normalizado 0–1000; mezclar píxeles crudos rompe la interacción modelo–Harness.
- Los resultados de benchmarks del informe técnico no están vinculados a un checkpoint de exportación exacto y no constituyen mediciones de los ficheros de este repositorio.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere validación comunitaria muy limitada.
- Idiomas soportados no declarados: riesgo de rendimiento desigual fuera del inglés o del chino.
- Longitud de contexto no disponible: no se puede garantizar el manejo de trayectorias largas más allá de lo observado en evaluación (límite de 100 pasos en OSWorld y WebArena).
- Riesgo de alucinación en la localización de elementos GUI y en la verificación de resultados, especialmente en interfaces no vistas durante el entrenamiento.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero la dependencia del Harness y de los términos del proyecto deben revisarse antes de producción.
- El tamaño del repositorio (18,8 GB) y la ausencia de pesos cuantizados confirmados complican el despliegue en GPUs de consumo sin trabajo adicional de cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/china-beipo/NorthCUA-Nano
- Página del proyecto: https://beipo.top/blog/northcua/
- Repositorio del Harness: https://github.com/china-qijizhifeng/NorthCUA-Harness
- Familia de modelos (Pro): https://huggingface.co/beipo-ai/NorthCUA-Pro
- Licencia: https://huggingface.co/beipo-ai/NorthCUA-Nano/blob/main/LICENSE
