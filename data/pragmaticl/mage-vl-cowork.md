# Pragmaticl/Mage-VL-Cowork

## Resumen

Mage-VL-Cowork es un modelo de lenguaje y visión (VLM) de 4B parámetros desarrollado por Microsoft, orientado a la automatización de tareas en entornos de escritorio mediante un enfoque híbrido de "computer use". A diferencia de los agentes de uso de computadora (CUA) que se limitan a la interacción por píxeles, este modelo combina de forma nativa la interacción gráfica basada en capturas de pantalla (`computer_use`) con la ejecución persistente de código y comandos de terminal (`bash`) dentro de una única política visión-lenguaje, sin necesidad de un orquestador externo.

El modelo parte de un checkpoint intermedio de 4B de Mage-VL y se entrena mediante un currículo progresivo de cinco etapas ("specialize-then-unify"): primero construye competencia en grounding visual, después en ejecución GUI y en codificación/terminal, y finalmente unifica ambas capacidades mediante Hybrid SFT y Online Hybrid RL (GRPO). El resultado es un modelo que alcanza el 66,0% en OSWorld-Verified con un presupuesto de 50 pasos, situándose como el mejor modelo de 4B en esa prueba según el autor.

La relevancia actual del modelo reside en su apuesta por la "inteligencia en el dispositivo": demuestra que un VLM pequeño y eficiente puede abordar tareas complejas de uso de computadora, con un consumo de tokens y un coste de generación de datos notablemente reducidos gracias a su motor de síntesis Mage-CUA-Forge. La ficha se basa en la model card del autor y en la información pública disponible; los datos no confirmados se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basada en `llava_onevision2` (transformer multimodal) |
| Parametros totales | 4.741.793.792 (~4,7B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`, código personalizado `custom_code`) |

## Arquitectura y entrenamiento

Mage-VL-Cowork es un modelo visión-lenguaje basado en la arquitectura `llava_onevision2`, con 4.741.793.792 parámetros totales y pesos en safetensors. Se entrena de extremo a extremo a partir de un checkpoint intermedio de 4B de `microsoft/Mage-VL` mediante un currículo progresivo de cinco etapas ("specialize-then-unify"): primero se construye grounding visual independiente (30,6% → 56,9% en OSWorld-G; 78,8% → 87,2% en ScreenSpot-v2), después ejecución GUI y competencia en codificación/terminal, y finalmente se unifican ambas mediante Hybrid SFT y Online Hybrid RL asíncrono (45,56% → 55,84% → 66,0%).

La innovación principal es el enrutamiento interno de canal a nivel de turno: sin un enrutador multiagente externo, la política elige `computer_use` para diseños visuales, edición de lienzo y estado de aplicación en memoria, y cambia a `bash` para ediciones programáticas estructuradas (hojas de cálculo, documentos, presentaciones) y verificación determinista. Aguas arriba del entrenamiento, el autor evoluciona el arnés del profesor (poda de rutas de acción redundantes y equipamiento de librerías de dominio) y construye Mage-CUA-Forge, un motor de síntesis de 293.806 tareas sobre 6.915 habilidades atómicas, con una reducción del 82,6% del coste recurrente de generación. El Online RL (GRPO con recompensas verificables) aporta +10,16 puntos porcentuales sobre Hybrid SFT y reduce las llamadas medias al modelo un 13,0% y los tokens de salida un 25,4%.

## Capacidades

- Generación de texto y razonamiento multimodal sobre capturas de pantalla e imágenes.
- Interacción GUI basada en píxeles (`computer_use`): clics, arrastres, escritura y navegación visual.
- Ejecución de código y comandos en terminal (`bash`) para ediciones estructuradas y verificación determinista.
- Enrutamiento híbrido interno de canal por turno, sin orquestador externo.
- Agentes de uso de computadora (CUA) y flujos de trabajo multi-aplicación.
- Capacidades de agente de codificación y de agente de terminal.
- Razonamiento multi-paso orientado a tareas de escritorio (OSWorld, WebVoyager).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés (`en`).
- Capacidades especiales adicionales (visión, audio, thinking mode): no disponible en la información proporcionada más allá de la visión.

## Casos de uso

- Automatización de tareas de sistema operativo: el modelo puede completar flujos de trabajo de escritorio (87,5% en tareas de Operating System de OSWorld-Verified) combinando clics con scripts, lo que lo hace adecuado para asistentes de escritorio autónomos.
- Flujos multi-aplicación: con un 62,7% en Multi-Application Workflows, puede encadenar acciones entre aplicaciones (por ejemplo, extraer datos de una web y volcarlos en una hoja de cálculo) eligiendo el canal más eficiente en cada paso.
- Edición programática de documentos y hojas de cálculo: para tareas estructuradas cambia a `bash`, lo que permite ediciones verificables y deterministas en lugar de decenas de clics, reduciendo errores y llamadas al modelo.
- Agente de terminal y codificación: puede ejecutar comandos y editar archivos de forma persistente, integrándose en pipelines de automatización de desarrollo y tareas de mantenimiento de repositorios.
- Verificación determinista de resultados: el canal `bash` permite comprobar el estado real del sistema (archivos, salidas de comandos) en lugar de inferirlo visualmente, útil en flujos donde la corrección debe ser comprobable.
- Navegación web automatizada: sus capacidades de agente GUI y su mención a WebVoyager lo orientan a tareas de navegación y extracción de información en sitios web.
- Despliegue en el dispositivo: con 4B parámetros, es candidato a asistentes locales de automatización en equipos con recursos limitados, aunque la VRAM concreta no está publicada.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| OSWorld-Verified (presupuesto de 50 pasos) | 66,0% |
| OSWorld-Verified, tareas de Operating System | 87,5% |
| OSWorld-Verified, Multi-Application Workflows | 62,7% |
| OSWorld-G (grounding visual) | 30,6% → 56,9% |
| ScreenSpot-v2 | 78,8% → 87,2% |
| Progresión del currículo (OSWorld-Verified) | 45,56% → 55,84% → 66,0% |
| Profesor GPT-5.4 con arnés evolucionado | 92,0% (con 29,2% menos pasos) |
| Ganancia del estudiante por arnés evolucionado | +12,5 pp (37,6% vs. 25,1%) |
| Online RL vs. Hybrid SFT | +10,16 pp; llamadas 21,57 → 18,77 (−13,0%); tokens 7.374 → 5.499 (−25,4%) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.741.793.792 parámetros, la inferencia en precisión completa (fp16/bf16) requiere del orden de 9,5 GB solo para pesos, más el coste de visión y caché KV.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos, es plausible en GPUs con 12-16 GB o más en cuantización, pero el autor no publica requisitos ni cuantizaciones.
- Opciones de despliegue: librería `transformers` con `custom_code`; no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; el autor reporta reducciones de llamadas al modelo (21,57 → 18,77) y de tokens de salida (7.374 → 5.499) por tarea, no latencias absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OSWorld-Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mage-VL-Cowork (Microsoft) | ~4,7B | no disponible | 66,0% | apache-2.0 | Hugging Face (`microsoft/Mage-VL-Cowork`) |
| Mage-VL (Microsoft, base) | 4B (checkpoint intermedio) | no disponible | no disponible | no disponible en esta ficha | Hugging Face (`microsoft/Mage-VL`) |
| Alternativas de 4B para computer use | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor afirma que Mage-VL-Cowork logra el mejor rendimiento entre modelos de 4B en OSWorld-Verified, pero la información disponible no incluye una tabla comparativa con modelos competidores concretos; por tanto, la comparación con alternativas de la misma categoría se indica como no disponible.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés (`en`); el rendimiento en castellano u otros idiomas no está documentado.
- Contexto: la longitud de contexto no está publicada, lo que impide planificar tareas con ventanas largas o muchas capturas acumuladas.
- Cuantizaciones: no se publican formatos GGUF ni recetas de cuantización, lo que limita el despliegue en hardware de consumo.
- Alucinación: no se documentan tasas de alucinación; al ser un agente que actúa sobre el sistema, un error de razonamiento puede traducirse en acciones no deseadas en el escritorio.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Licencia: apache-2.0 permite uso comercial, pero el modelo depende de `custom_code` en `transformers` y de la arquitectura `llava_onevision2`, cuya compatibilidad con herramientas de terceros no está confirmada.
- Producción: el rendimiento en OSWorld-Verified se mide con un presupuesto de 50 pasos; fuera de ese régimen y en entornos reales no hay datos. La ausencia de benchmarks de texto (MMLU, HumanEval) impide evaluar su calidad como modelo de lenguaje general.
- Madurez: el repositorio de Hugging Face registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso o validación independiente.

## Enlaces

- Modelo en Hugging Face (autor): https://huggingface.co/Pragmaticl/Mage-VL-Cowork
- Modelo oficial en Hugging Face (Microsoft): https://huggingface.co/microsoft/Mage-VL-Cowork
- Modelo base Mage-VL: https://huggingface.co/microsoft/Mage-VL
- Página del proyecto: https://microsoft.github.io/Mage/cowork/
- Informe técnico (PDF): https://github.com/microsoft/Mage/blob/main/assets/mage_vl_cowork_tech_report.pdf
- Código en GitHub: https://github.com/microsoft/Mage/tree/main/mage_vl_cowork
- Colección Mage en Hugging Face: https://huggingface.co/collections/microsoft/mage
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
