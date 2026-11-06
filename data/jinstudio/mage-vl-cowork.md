# Jinstudio/Mage-VL-Cowork

## Resumen

Mage-VL-Cowork es un modelo de lenguaje y visión (VLM) de 4B parámetros desarrollado por Jinstudio a partir del checkpoint intermedio `microsoft/Mage-VL`. Su propósito es actuar como política única para agentes de uso de ordenador (computer-use agents, CUA) que combinan interacción gráfica mediante capturas de pantalla (`computer_use`) con ejecución persistente de código y terminal (`bash`), sin necesidad de un orquestador externo que enrute entre canales.

El modelo aborda un problema concreto: los agentes que solo operan sobre píxeles consumen miles de tokens por captura y pierden el canal más rápido y verificable de la máquina, mientras que dar acceso ingenuo a GUI y terminal a un modelo grande no garantiza competencia híbrida. Mage-VL-Cowork internaliza el enrutado de canal a nivel de turno y se entrena con un currículo progresivo de cinco etapas (especializar y luego unificar) más RL online con recompensas verificables.

Con 4.741.793.792 parámetros y licencia Apache 2.0, alcanza 66,0% en OSWorld-Verified con un presupuesto de 50 pasos, el mejor resultado reportado a escala 4B según la model card. Es relevante ahora porque demuestra que un VLM pequeño puede competir en tareas complejas de automatización de escritorio, abriendo la puerta a inteligencia ejecutable en dispositivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language model basada en `llava_onevision2` (transformers, código custom) |
| Parámetros totales | 4.741.793.792 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (repo en safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de un checkpoint intermedio de 4B de `microsoft/Mage-VL` y se entrena de extremo a extremo mediante un currículo de cinco etapas de tipo "especializar y luego unificar". Primero construye competencia de grounding visual independiente (de 30,6% a 56,9% en OSWorld-G y de 78,8% a 87,2% en ScreenSpot-v2), después ejecución GUI y competencia de código/terminal, y finalmente las unifica con Hybrid SFT y Online Hybrid RL asíncrono. La progresión reportada en OSWorld es 45,56% → 55,84% → 66,0%.

Aguas arriba del entrenamiento, el equipo evoluciona el harness del profesor (poda de rutas de acción redundantes como `xdotool` y árboles de accesibilidad, y preinstalación de librerías Python de dominio), lo que eleva al profesor GPT-5.4 a 92,0% con un 29,2% menos de pasos y se traduce en una ganancia de +12,5 puntos porcentuales para el estudiante (37,6% frente a 25,1%). Además, construye Mage-CUA-Forge, un motor de síntesis workflow-first que genera 293.806 tareas sobre 6.915 habilidades atómicas y reduce el coste recurrente por tarea un 82,6% (de 0,906 a 0,158 dólares; de 1.276K a 85K tokens por tarea). El RL online con GRPO y recompensas verificables aporta +10,16 puntos sobre Hybrid SFT y, a la vez, reduce las llamadas medias de 21,57 a 18,77 (−13,0%) y los tokens de salida de 7.374 a 5.499 por tarea (−25,4%).

## Capacidades

- Comprensión de imágenes y capturas de pantalla para grounding visual e interacción GUI.
- Enrutado interno de canal por turno: selecciona `computer_use` para layouts visuales, edición de canvas y estado en memoria de aplicaciones, y `bash` para ediciones programáticas estructuradas (hojas de cálculo, documentos, presentaciones) y verificación determinista.
- Ejecución de código y comandos de terminal como canal persistente dentro de la misma política.
- Agente híbrido de múltiples pasos sin orquestador externo.
- Tareas de automatización de escritorio y flujos multi-aplicación.
- Capacidades de agente de programación (coding agent) y de terminal (terminal agent).
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio adicionales: no disponible.

## Casos de uso

- Automatización de escritorio end-to-end: el modelo puede completar tareas en sistemas operativos reales eligiendo entre clics y scripts; su 87,5% en tareas de sistema operativo en OSWorld-Verified lo hace adecuado para pilotos de RPA modernos.
- Flujos multi-aplicación: con 62,7% en Multi-Application Workflows, sirve para tareas que cruzan navegador, hoja de cálculo y editor de documentos, manteniendo el estado entre pasos.
- Edición programática de documentos y hojas de cálculo: al preferir `bash` para ediciones estructuradas, evita decenas de clics y produce cambios verificables y reproducibles.
- Verificación determinista de resultados: puede ejecutar comprobaciones por terminal tras una acción GUI, lo que reduce errores silenciosos en pipelines de automatización.
- Agente de terminal y operaciones: ejecución de comandos, inspección de ficheros y corrección de errores en entornos de línea de comandos dentro de un bucle de agente.
- Agente de programación asistida: combinación de lectura de capturas (por ejemplo, errores en IDE) con edición de código y ejecución de tests.
- Automatización en dispositivo: con 4B parámetros y licencia Apache 2.0, es candidato para despliegues locales con requisitos de privacidad, siempre que se valide el soporte de cuantización.
- Evaluación y research de agentes CUA: recetas de entrenamiento, harness evolucionado y motor de síntesis publicados permiten reproducir y extender el pipeline.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| OSWorld-Verified (presupuesto 50 pasos) | 66,0% |
| OSWorld-Verified, tareas de sistema operativo | 87,5% |
| OSWorld-Verified, Multi-Application Workflows | 62,7% |
| OSWorld-G (grounding visual) | 56,9% (desde 30,6%) |
| ScreenSpot-v2 | 87,2% (desde 78,8%) |
| Progresión OSWorld por etapas | 45,56% → 55,84% → 66,0% |
| Ganancia de Online RL sobre Hybrid SFT | +10,16 pp |
| Llamadas medias por tarea (RL vs. SFT) | 18,77 vs. 21,57 (−13,0%) |
| Tokens de salida por tarea (RL vs. SFT) | 5.499 vs. 7.374 (−25,4%) |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de 4,74B parámetros en fp16 requiere aproximadamente 9,5 GB solo para pesos, más memoria para el codificador visual, el procesador de imágenes y el KV cache; en cuantización de 8 bits rondaría 5 GB y en 4 bits unos 3 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponible. Para fp16, una GPU con 16-24 GB (RTX 4090, A10G, L4) sería el mínimo práctico; para servir con concurrencia, A100 o H100.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 y GPUs de 16 GB o más en fp16; en 8 GB solo con cuantización, no documentada.
- Opciones de despliegue: transformers con `custom_code` (requiere confiar en código remoto); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card reporta 18,77 llamadas medias por tarea tras RL, lo que da una idea del coste de interacción, no de la latencia por llamada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OSWorld-Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mage-VL-Cowork | 4,74B | No disponible | 66,0% | Apache 2.0 | Hugging Face (Jinstudio) |
| Mage-VL (base) | 4B (checkpoint intermedio) | No disponible | No disponible como resultado final | No disponible | Hugging Face (microsoft) |
| Profesor GPT-5.4 con harness evolucionado | No disponible | No disponible | 92,0% con 29,2% menos pasos | Propietaria | API |
| Otros modelos CUA de 4B | No disponible | No disponible | Inferior según la model card ("best performance among 4B models") | No disponible | No disponible |

La model card no identifica por nombre los modelos comparables de 4B; solo afirma el liderazgo a esa escala.

## Limitaciones y advertencias

- Idioma: solo inglés según la model card; el rendimiento en castellano no está evaluado.
- Longitud de contexto: no documentada, lo que dificulta planificar tareas con historiales largos de capturas y comandos.
- Alucinación: no se reportan tasas; en agentes CUA el riesgo se manifiesta como acciones incorrectas sobre el sistema, potencialmente destructivas.
- Enrutado de canal: aunque internalizado, puede elegir `bash` o `computer_use` de forma subóptima en aplicaciones no vistas durante el entrenamiento.
- Código custom: la carga requiere `trust_remote_code`, con el riesgo de seguridad asociado en entornos de producción.
- Cuantizaciones: no hay versiones GGUF ni cuantizadas oficiales, lo que limita el despliegue en hardware modesto.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `microsoft/Mage-VL` debe verificarse por separado.
- Madurez: 19 descargas y 0 likes en el momento de la consulta; es un artefacto reciente con poca validación externa.
- Procedencia: el autor del repo es Jinstudio, mientras que la model card referencia el repositorio oficial `microsoft/Mage-VL-Cowork`; conviene confirmar la equivalencia de pesos antes de usarlo en producción.
- Seguridad operativa: un agente con acceso a terminal y GUI requiere sandboxing, límites de acciones y revisión humana en operaciones irreversibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jinstudio/Mage-VL-Cowork
- Modelo oficial referenciado: https://huggingface.co/microsoft/Mage-VL-Cowork
- Modelo base: https://huggingface.co/microsoft/Mage-VL
- Página del proyecto: https://microsoft.github.io/Mage/cowork/
- Informe técnico: https://github.com/microsoft/Mage/blob/main/assets/mage_vl_cowork_tech_report.pdf
- Código: https://github.com/microsoft/Mage/tree/main/mage_vl_cowork
- Colección Mage: https://huggingface.co/collections/microsoft/mage
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
