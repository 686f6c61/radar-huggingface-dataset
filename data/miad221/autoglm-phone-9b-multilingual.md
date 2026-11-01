# Miad221/AutoGLM-Phone-9B-Multilingual

## Resumen

AutoGLM-Phone-9B-Multilingual es un modelo vision-lenguaje (VLM) de 9B parámetros derivado mediante fine-tuning de `zai-org/GLM-4.1V-9B-Base`, publicado por el usuario Miad221 en HuggingFace. Está diseñado específicamente para actuar como agente de interfaz gráfica en dispositivos móviles Android: percibe la pantalla del teléfono a través de capturas de imagen, comprende la UI y genera secuencias de acciones que se ejecutan mediante ADB (Android Debug Bridge). Forma parte del ecosistema Open-AutoGLM / Phone Agent de Zhipu AI (zai-org).

El modelo resuelve el problema de la automatización de tareas en smartphones mediante lenguaje natural: el usuario describe un objetivo ("abre Xia Xiaohongshu y busca recomendaciones de comida") y el modelo parsea la intención, interpreta el estado actual de la pantalla y planifica los pasos siguientes. La arquitectura es idéntica a la de `GLM-4.1V-9B-Thinking`, según indica la propia model card, con pipeline `image-text-to-text` y soporte declarado únicamente para chino (`zh`).

Es relevante en el contexto actual de agentes autónomos sobre GUIs, un área donde los modelos generalistas rinden peor que los especializados con fine-tuning sobre trayectorias reales de interacción. El repo ocupa 20,6 GB en safetensors y acumula 17 descargas en el momento de la consulta, lo que sugiere un artefacto de investigación más que un modelo de producción consolidado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLM-4.1V (transformer vision-lenguaje, idéntica a GLM-4.1V-9B-Thinking) |
| Parámetros totales | 9B (aproximado por nombre; el dato safetensors reportado, 934.400, es inconsistente con el tamaño del repo de 20,6 GB) |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors sin variantes GGUF/AWQ declaradas) |
| Idiomas soportados | chino (`zh`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `GLM-4.1V-9B-Base` y, según la model card, es estructuralmente idéntico a `GLM-4.1V-9B-Thinking`. Se trata de un VLM que combina un codificador visual con un decoder de lenguaje para tareas `image-text-to-text`, orientado a la comprensión de capturas de pantalla de smartphones y a la generación de acciones estructuradas sobre la UI. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

El fine-tuning se enmarca en el proyecto AutoGLM / Phone Agent, que entrena agentes sobre trayectorias de interacción real con GUIs Android. La model card cita dos trabajos de referencia: AutoGLM (arXiv:2411.00820), sobre agentes fundacionales autónomos para GUIs, y MobileRL (arXiv:2509.18119), sobre aprendizaje por refuerzo agéntico online para agentes de GUI móvil. El sistema completo incorpora mecanismos de confirmación de acciones sensibles, fallback human-in-the-loop para login o códigos de verificación, y depuración ADB remota por WiFi. No se especifican innovaciones de decodificación (especulativa, atención lineal) en la información proporcionada.

## Capacidades

- Comprensión visual de pantallas de smartphone (capturas de UI) y generación de texto asociado.
- Planificación de secuencias de acciones para completar tareas descritas en lenguaje natural.
- Ejecución de operaciones sobre Android vía ADB (toques, deslizamientos, entrada de texto, navegación).
- Razonamiento multi-paso orientado a agentes (el modelo base es de tipo "Thinking").
- Confirmación de acciones sensibles y derivación a intervención humana en flujos de autenticación.
- Soporte de depuración remota ADB (conexión por WiFi/red).
- Capacidades multilingües: limitadas al chino según el campo `language` de la model card.
- No se declara soporte explícito de tool calling / function calling genérico ni de audio.

## Casos de uso

- Automatización de tareas cotidianas en Android: el usuario dicta un objetivo en chino y el agente navega la UI para completarlo (por ejemplo, buscar contenido en una app), usando la percepción visual de la pantalla para decidir cada paso.
- Testing de aplicaciones móviles: el modelo puede actuar como usuario sintético que recorre flujos de UI y valida que las pantallas respondan como se espera, integrándose en pipelines de QA sobre emuladores Android conectados por ADB.
- Asistencia de accesibilidad: automatizar interacciones repetitivas en el teléfono para usuarios con dificultades motoras, con confirmación explícita en acciones sensibles.
- Investigación en agentes de GUI: servir como baseline reproducible para experimentos de planificación visual sobre móvil, dado que la arquitectura es idéntica a GLM-4.1V-9B-Thinking y el proyecto publica papers de referencia.
- Prototipado de asistentes de operador: construir demos de "phone agent" que ejecutan flujos multi-paso (abrir app, buscar, filtrar, seleccionar) con fallback humano en login o captcha.
- Automatización de tareas de recopilación de información en apps: el agente puede abrir una aplicación, localizar elementos por descripción visual y extraer o transcribir datos de la pantalla.
- Desarrollo de herramientas de automatización remota: combinado con ADB por WiFi, permite controlar dispositivos en laboratorio o granjas de test desde un servidor central.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repo (20,6 GB en safetensors, presumiblemente fp16/bf16 para 9B) se requiere al menos ~18-20 GB de VRAM en precisión nativa.
- GPU recomendadas: no especificadas por el autor; por tamaño, encajan A100 40/80 GB, H100 y, en consumer, RTX 4090 (24 GB) en bf16.
- Cabe en GPU consumer: previsiblemente en RTX 4090 (24 GB) en bf16; en GPUs de 16 GB requeriría cuantización, no publicada en el repo.
- Opciones de despliegue: `transformers` (librería declarada); el proyecto remite al repositorio GLM-V para detalles de despliegue. No se confirman vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AutoGLM-Phone-9B-Multilingual | ~9B | no disponible | Agente de GUI móvil (VLM) | MIT | HuggingFace (17 descargas) |
| GLM-4.1V-9B-Base (modelo base) | ~9B | no disponible | VLM generalista | no disponible en esta ficha | HuggingFace (zai-org) |
| GLM-4.1V-9B-Thinking | ~9B | no disponible | VLM con razonamiento | no disponible en esta ficha | HuggingFace (zai-org) |

No se dispone de datos de benchmarks ni de otros modelos comparables de agente de GUI móvil en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el campo `language` declara únicamente chino; el uso en castellano u otros idiomas no está garantizado.
- El proyecto se declara "for research and educational purposes only"; el uso para acceso ilegal a datos, interferencia en sistemas o actividades ilícitas está prohibido según la model card.
- Licencia MIT en el repo, pero la model card remite a unos Términos de Uso adicionales del proyecto Open-AutoGLM que conviene revisar antes de uso comercial.
- Riesgo de alucinación en la interpretación de pantallas y en la planificación de acciones: un paso erróneo puede provocar operaciones no deseadas en el dispositivo.
- Dependencia de ADB y de la calidad de las capturas de pantalla; cambios de UI o apps ofuscadas pueden degradar el rendimiento.
- El dato de parámetros safetensors reportado (934.400) es inconsistente con el tamaño del repo y con el nombre del modelo; conviene verificar el config real antes de desplegar.
- Solo 17 descargas y 0 likes: ecosistema de validación muy limitado, sin garantías de mantenimiento.
- No se documentan sesgos específicos, pero al estar entrenado sobre apps y flujos en chino, puede tener un sesgo cultural y de dominio hacia el ecosistema de aplicaciones chinas.

## Enlaces

- HuggingFace: https://huggingface.co/Miad221/AutoGLM-Phone-9B-Multilingual
- Modelo base: https://huggingface.co/zai-org/GLM-4.1V-9B-Base
- Repositorio Open-AutoGLM: https://github.com/zai-org/Open-AutoGLM
- Repositorio GLM-V: https://github.com/zai-org/GLM-V
- Paper AutoGLM: https://arxiv.org/abs/2411.00820
- Paper MobileRL: https://arxiv.org/abs/2509.18119
- Términos de uso: https://raw.githubusercontent.com/zai-org/Open-AutoGLM/refs/heads/main/resources/privacy_policy.txt
