# GUIAgentt/qwen35-4b-3mfinal-en-ko1shot-login-edited-3ep

## Resumen

GUIAgentt/qwen35-4b-3mfinal-en-ko1shot-login-edited-3ep es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario GUIAgentt en Hugging Face. Por la nomenclatura del repositorio y las etiquetas asociadas (`gui-agent`, `web-agent`), el modelo está orientado a tareas de automatización de interfaces gráficas y navegación web, es decir, a la interpretación de pantallas y a la generación de acciones sobre elementos de interfaz. El nombre sugiere un entrenamiento con ejemplos de tipo "one-shot" en inglés y coreano, con foco en flujos de inicio de sesión ("login"), y un total de tres épocas de entrenamiento.

El modelo cuenta con aproximadamente 5.175 millones de parámetros en formato safetensors (5,17 mil millones), lo que lo sitúa en la categoría de modelos pequeños dentro de la familia Qwen3.5. El repositorio ocupa 10,4 GB, coherente con pesos en precisión de 16 bits. La fecha de creación indicada (noviembre de 2026) y la ausencia de descargas y likes en el momento de la consulta reflejan un artefacto muy reciente y sin adopción pública verificable.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un checkpoint de investigación de un autor individual, con acceso restringido (gated), licencia "other" no detallada y sin documentación técnica publicada. No hay información sobre composición del dataset, hiperparámetros, benchmarks ni evaluación cualitativa. Se recomienda tratarlo como un experimento reproducible únicamente tras aceptar las condiciones de acceso y revisar los archivos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-4B); detalles no disponibles |
| Parametros totales | 5.174.964.736 (~5,17 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (depende de la configuración del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible; pesos publicados en safetensors (probablemente bf16/fp16) |
| Idiomas soportados | No disponibles; el nombre del checkpoint sugiere inglés y coreano |
| Licencia | other (condiciones no especificadas; acceso gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5. No se dispone de información publicada sobre la configuración exacta de capas, dimensiones ocultas, número de cabezas de atención ni mecanismos adicionales (atención lineal, decodificación especulativa u otros) en este repositorio concreto. El checkpoint conserva la arquitectura del modelo base y solo modifica los pesos mediante ajuste fino supervisado.

En cuanto al entrenamiento, los únicos indicios provienen del nombre del repositorio: un ajuste fino sobre datos de tipo "one-shot" en inglés y coreano, centrado en interacciones de inicio de sesión, con tres épocas ("3ep") y un conjunto de datos de aproximadamente tres millones de ejemplos ("3mfinal"). No se especifica el número de tokens, la composición del dataset, si hubo RLHF, DPO o preferencias, ni los hiperparámetros empleados. Tampoco se documenta ninguna innovación técnica propia; el valor del artefacto reside en la especialización de dominio, no en cambios arquitectónicos.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-4B.
- Especialización declarada en tareas de agente de interfaz gráfica (`gui-agent`) y agente web (`web-agent`): interpretación de capturas de pantalla y generación de acciones sobre elementos de la interfaz.
- Flujos de autenticación: el nombre del checkpoint indica entrenamiento específico en secuencias de inicio de sesión.
- Soporte multilingüe parcial: inglés y coreano según la nomenclatura del repositorio; otros idiomas no verificados.
- Tool calling / function calling: no documentado en este repositorio; probablemente heredado del modelo base, pero sin confirmación.
- Razonamiento multi-paso y planificación de agentes: no documentado.
- Capacidades de visión: no confirmadas; aunque las etiquetas apuntan a agentes GUI, no se especifica si el modelo procesa imágenes directamente o solo representaciones textuales de la interfaz.
- Modo "thinking": no documentado.

## Casos de uso

- Automatización de inicio de sesión en aplicaciones web: el ajuste está entrenado específicamente sobre secuencias de login, por lo que puede generar los pasos de rellenado de formularios y envío en flujos controlados de prueba.
- Agentes de navegación web para tareas repetitivas: interpretación de la estructura de una página y emisión de acciones (clic, escritura, navegación) en pipelines de automatización de QA.
- Pruebas end-to-end de interfaces: generación de secuencias de interacción para validar formularios y flujos de autenticación en entornos de integración continua.
- Extracción de información de pantallas: conversión de representaciones textuales de la interfaz en acciones estructuradas para asistentes de accesibilidad o soporte.
- Prototipado de asistentes de escritorio: al ser un modelo de ~5 mil millones de parámetros, puede desplegarse en una GPU de consumo para experimentación local con agentes GUI.
- Investigación en ajuste fino de agentes: sirve como referencia para estudiar cómo un fine-tune pequeño sobre Qwen3.5-4B modifica el comportamiento en tareas de interacción, comparándolo con el modelo base.
- Soporte bilingüe inglés-coreano en automatización: útil en entornos donde la interfaz y las instrucciones combinan ambos idiomas, aunque la cobertura no está verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 10-11 GB para los pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB según longitud de contexto.
- Cuantización a 8 bits: alrededor de 5-6 GB de pesos; a 4 bits: alrededor de 3-4 GB, más overhead.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100/H100 para despliegues con contexto largo; una RTX 3090 o 4080 de 16 GB puede ser suficiente en cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bf16, y en tarjetas de 8 GB con cuantización de 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles en principio con pesos safetensors del modelo base, pero no se ha verificado la compatibilidad específica de este checkpoint; requiere conversión a GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GUIAgentt/qwen35-4b-3mfinal-en-ko1shot-login-edited-3ep | ~5,17 B | No disponible | other (gated) | Restringida | Fine-tune de investigación sin benchmarks |
| Qwen/Qwen3.5-4B (modelo base) | ~4 B (según nomenclatura) | No disponible en esta ficha | Según Qwen (no verificada aquí) | Pública | Base genérica sin especialización en agentes GUI |
| Alternativas de agente GUI de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables para comparar |

La comparación cuantitativa no es posible con la información disponible: no hay benchmarks del checkpoint ni especificaciones publicadas del modelo base en esta consulta. La única comparación fiable es que este modelo deriva directamente de Qwen/Qwen3.5-4B y añade especialización en flujos de login y agentes web.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se detallan datos de entrenamiento, hiperparámetros, evaluación ni limitaciones declaradas por el autor.
- Riesgo elevado de alucinación en acciones de interfaz: sin evaluación publicada, no hay garantía de que las acciones generadas correspondan a elementos reales de la pantalla.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible evaluar sesgos lingüísticos, culturales o de dominio.
- Cobertura de idiomas incierta: solo se infiere inglés y coreano del nombre del repositorio; el comportamiento en castellano no está verificado.
- Licencia "other" sin texto visible: no se puede confirmar el uso comercial; el acceso está restringido y requiere aceptar condiciones en Hugging Face.
- Checkpoint de autor individual sin adopción pública (0 descargas, 0 likes en el momento de la consulta): no hay evidencia de validación por la comunidad.
- Fecha de creación inusual (noviembre de 2026): conviene verificar la integridad y procedencia de los archivos antes de usarlos en producción.
- Especialización estrecha: el entrenamiento parece centrado en flujos de login, lo que puede degradar el rendimiento en tareas generales respecto al modelo base.
- No se confirma si procesa imágenes directamente; si depende de representaciones textuales de la interfaz, la precisión en pantallas complejas será limitada.

## Enlaces

- Hugging Face: https://huggingface.co/GUIAgentt/qwen35-4b-3mfinal-en-ko1shot-login-edited-3ep
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
