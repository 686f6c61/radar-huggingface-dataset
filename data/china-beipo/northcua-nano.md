# china-beipo/NorthCUA-Nano

## Resumen

NorthCUA-Nano es un modelo multimodal de 9.409.813.744 parámetros (aproximadamente 9B) desarrollado por china-beipo (beipo-ai), diseñado específicamente como agente de uso de ordenador (*computer-use*). El modelo toma instrucciones del usuario, capturas de pantalla e historial de interacción, y genera razonamiento, respuestas y llamadas a herramientas para un entorno de escritorio o navegador. Está construido sobre la arquitectura Qwen3.5 y se distribuye bajo licencia Apache 2.0.

La familia NorthCUA se compone de tres miembros: Nano (9B denso), Mini (35B totales, 3B activos, MoE) y Pro (397B totales, 17B activos, MoE). Nano es el modelo compacto y denso de la familia, pensado para despliegues con requisitos de hardware moderados manteniendo capacidades de *grounding* visual y ejecución de acciones sobre interfaces gráficas.

El modelo requiere el uso conjunto con el NorthCUA Harness oficial, que gestiona los prompts, las llamadas a herramientas, las observaciones y la ejecución de acciones. Una particularidad crítica es el contrato de coordenadas `normalized_1000`: todas las coordenadas de acciones GUI usan un espacio normalizado de 0 a 1000, no píxeles brutos, y el Harness se encarga de la conversión en tiempo de ejecución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 (denso) |
| Parámetros totales | 9.409.813.744 (~9B) |
| Parámetros activos | 9B (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

NorthCUA-Nano es un transformer denso de aproximadamente 9B parámetros construido sobre Qwen3.5. El modelo es multimodal (pipeline `image-text-to-text`), capaz de procesar capturas de pantalla junto con texto para producir razonamiento, respuestas y llamadas a herramientas. La arquitectura concreta de atención, el número de capas y la dimensionalidad no están disponibles en la información proporcionada.

El entrenamiento se articula en dos fases según el informe técnico: primero un ajuste supervisado (SFT) para *grounding* visual, y después un aprendizaje por refuerzo (RL) conjunto sobre escritorio y web para completar tareas. El modelo se entrena a partir de trayectorias completas de trabajo, lo que le permite aprender pasos dependientes, artefactos intermedios y verificación de resultados. Los detalles sobre el número de tokens de entrenamiento, la composición del dataset y las técnicas de alineación adicionales (RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de razonamiento y respuestas multi-turno en el contexto de tareas de uso de ordenador.
- *Grounding* visual: localización de elementos de interfaz en capturas de pantalla de aplicaciones de escritorio y flujos web.
- Generación de llamadas a herramientas (*tool calls*) para ejecutar acciones sobre el entorno, siguiendo el contrato de coordenadas normalizadas 0-1000.
- Ejecución de tareas de múltiples pasos con historial de interacción y observaciones del entorno.
- Verificación de resultados intermedios y finales dentro de trayectorias largas.
- Capacidad multimodal imagen-texto para observaciones de pantalla.
- No se dispone de información sobre soporte multilingüe específico ni sobre modos especiales adicionales (audio, *thinking mode* explícito).

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede interpretar una instrucción en lenguaje natural y una captura de pantalla para generar la secuencia de clics y entradas de teclado necesarias, usando el Harness para convertir las coordenadas normalizadas a píxeles reales.
- Automatización de flujos web: con las métricas reportadas en WebArena-Verified (67,16% de éxito tras RL), es adecuado para tareas de navegación y rellenado de formularios en entornos web controlados.
- Agentes de soporte técnico guiado: el modelo puede observar el estado de una aplicación y proponer o ejecutar pasos de resolución de incidencias, manteniendo el historial de interacción.
- Pruebas de regresión de interfaces: integrado en el Harness, puede ejecutar trayectorias de prueba sobre aplicaciones de escritorio y verificar resultados de forma automática.
- Extracción de información desde aplicaciones: el modelo puede navegar por una aplicación, localizar datos y completar tareas de extracción o consolidación de información.
- Asistencia a usuarios en entornos corporativos: con 9B parámetros densos, es viable en infraestructura de GPU moderada para desplegar agentes de asistencia que operan sobre herramientas internas.
- Investigación en agentes de *computer-use*: al ser un modelo denso de 9B con pesos abiertos y Apache 2.0, sirve como base para experimentación y ajuste fino en tareas específicas de automatización.

## Benchmarks y rendimiento

Resultados reportados en el informe técnico de NorthCUA. El *grounding* usa checkpoints de SFT; la finalización de tareas usa checkpoints de RL conjunto escritorio-web. Estos resultados de investigación no están vinculados a una exportación exacta del checkpoint del repositorio.

| Benchmark | Etapa / métrica | Nano · 9B | Mini · 35B | Pro · 397B |
|---|---|---|---|---|
| ScreenSpot-Pro | SFT · precisión (%) | 72,87 | 92,41 | 93,30 |
| OSWorld-G | SFT · precisión (%) | 82,98 | 87,94 | 90,96 |
| OSWorld-Verified | RL · éxito (%) | 78,90 | 85,30 | 88,64 |
| WebArena-Verified | RL · éxito (%) | 67,16 | 70,43 | 73,89 |

Comparativa SFT frente a RL del propio Nano:

| Benchmark | SFT (%) | RL (%) |
|---|---|---|
| OSWorld | 76,05 | 78,90 |
| WebArena | 64,16 | 67,16 |

Condiciones de evaluación: ScreenSpot-Pro con 1.581 ejemplos, una predicción por captura y sin búsqueda iterativa de zoom/recorte. OSWorld-G con 564 instrucciones refinadas y mejor de tres ejecuciones completas (temperatura 0,7, top-p 0,95, top-k 40, 1.024 tokens de salida, coordenadas normalizadas 0-1000). OSWorld-Verified con 361 tareas (excluidas ocho tareas de Google Drive que requieren configuración de cuenta separada) y WebArena-Verified con 812 tareas y comprobaciones oficiales de resultado; ambos con límite de 100 pasos por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo denso de ~9,4B parámetros en precisión completa (fp16/bf16) requiere del orden de 18-19 GB solo para pesos, a lo que hay que sumar la memoria para el procesamiento de imágenes y el contexto.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar viabilidad en GPUs profesionales (A100, H100) y, con cuantización, en GPUs de consumo de gama alta, pero no se confirma en la información disponible.
- Cabeza en GPU de consumo: no disponible de forma confirmada.
- Opciones de despliegue: la librería indicada es `transformers`. El uso requiere el NorthCUA Harness oficial para la gestión de prompts, llamadas a herramientas y ejecución de acciones. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Arquitectura | OSWorld-Verified (RL) | WebArena-Verified (RL) | Licencia |
|---|---|---|---|---|---|---|
| NorthCUA-Nano | 9B | 9B | Densa | 78,90% | 67,16% | Apache 2.0 |
| NorthCUA-Mini | 35B | 3B | MoE | 85,30% | 70,43% | Apache 2.0 |
| NorthCUA-Pro | 397B | 17B | MoE | 88,64% | 73,89% | Apache 2.0 |

La comparativa con modelos de otros desarrolladores no está disponible en la información proporcionada. Dentro de la propia familia, Nano sacrifica rendimiento frente a Mini y Pro a cambio de un tamaño denso de 9B que reduce los requisitos de memoria y simplifica el despliegue.

## Limitaciones y advertencias

- Los resultados de benchmarks del informe técnico no están vinculados a una exportación exacta del checkpoint del repositorio, por lo que no deben interpretarse como mediciones de los pesos publicados.
- El modelo está diseñado para usarse exclusivamente con el NorthCUA Harness oficial; su uso sin el Harness puede producir un comportamiento incorrecto en la generación y ejecución de acciones.
- El contrato de coordenadas es estrictamente `normalized_1000` (0-1000); mezclar coordenadas en píxeles brutos rompe la interacción modelo-Harness.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación específico ni limitaciones idiomáticas.
- El rendimiento en tareas de uso de ordenador es sensible a las condiciones de evaluación (límite de pasos, selección de intentos, configuración de cuenta); los resultados deben compararse con esas condiciones en cuenta.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del Harness y del informe técnico para despliegues en producción.
- No se dispone de información sobre cuantizaciones oficiales ni sobre el soporte de contextos largos, lo que limita la planificación de despliegues con requisitos de memoria ajustados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/china-beipo/NorthCUA-Nano
- Página del proyecto: https://beipo.top/blog/northcua/
- Repositorio del Harness: https://github.com/china-qijizhifeng/NorthCUA-Harness
- NorthCUA-Mini: https://huggingface.co/beipo-ai/NorthCUA-Mini
- NorthCUA-Pro: https://huggingface.co/beipo-ai/NorthCUA-Pro
- Licencia: https://huggingface.co/beipo-ai/NorthCUA-Nano/blob/main/LICENSE
- Informe técnico (referencia arXiv): arxiv:2611.02102
