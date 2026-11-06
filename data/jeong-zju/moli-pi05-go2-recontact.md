# Jeong-zju/moli-pi05-go2-recontact

## Resumen

MOLI π0.5 — go2 recontact es un ajuste fino (fine-tune) de parámetros completos del modelo base π0.5 de Physical Intelligence, realizado por el usuario Jeong-zju sobre el repositorio OpenPI. El modelo está especializado en una tarea concreta de robótica: el control de alto nivel de un robot cuadrúpedo Unitree Go2 para ejecutar una maniobra de "recontacto" (volver a empujar una caja tras un contacto inicial). No es un modelo de lenguaje general, sino un modelo visión-lenguaje-acción (VLA) que traduce observaciones visuales y propioceptivas, junto con una instrucción textual, en comandos de velocidad del cuerpo.

El modelo parte de los pesos oficiales de π0.5 y se ha entrenado con 80 demostraciones expertas de un conjunto de datos propio del autor, reservando 20 para validación. El checkpoint seleccionado corresponde a la actualización 9000, elegido por el error de acción en validación. La relevancia de esta ficha es acotada: se trata de un artefacto de investigación muy específico, con un rendimiento en simulación de 14 episodios exitosos de 100, y no está pensado para despliegue general ni para uso comercial directo.

El repositorio ocupa 12,4 GB y contiene los parámetros en formato JAX/Orbax original, junto con las estadísticas de normalización de la tarea. No es un checkpoint cargable con `transformers.from_pretrained`, sino que requiere el ecosistema OpenPI y las transformaciones específicas de observación y acción del proyecto MOLI Go2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (modelo visión-lenguaje-acción con flujo de difusión para acciones; detalles internos de la arquitectura base no disponibles en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en formato JAX/Orbax de precisión original) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible en la información proporcionada; la model card remite a `LICENSE`, `LICENSE_GEMMA.txt` y `NOTICE`, con restricciones de uso incorporadas de Gemma |
| Formato de pesos | Orbax (JAX), con shards OCDBT; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune de parámetros completos del checkpoint base π0.5 (`gs://openpi-assets/checkpoints/pi05_base/params`). La arquitectura subyacente es la de π0.5 de Physical Intelligence, un modelo visión-lenguaje-acción que combina percepción visual y comprensión de instrucciones textuales con la generación de acciones motoras. En este caso, las acciones se generan mediante un proceso de denoising de flujo (flow matching) con 10 pasos, un horizonte de acción de 16 y la ejecución de los primeros 5 pasos por decisión.

El entrenamiento se realizó sobre el dataset MOLI Go2 expert demonstrations (revisión `b9c0a01c4f426e6dbb598e3433d1cd10ffe33f84`), con una partición de 80 demostraciones para entrenamiento y 20 para validación. Las entradas son imágenes RGB de 224×224 de cámara fija, propiocepción del robot de 30 dimensiones y texto de la tarea. Las salidas son comandos de velocidad del cuerpo tridimensionales (avance, lateral, guiñada) que se pasan a un controlador de locomoción de bajo nivel congelado. No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO; el ajuste se seleccionó por error de acción en validación, no por recompensa.

## Capacidades

- Generación de comandos de velocidad del cuerpo (3 dimensiones) a partir de observaciones visuales y propioceptivas.
- Comprensión de instrucciones textuales de tarea en inglés para condicionar la política.
- Control de alto nivel para un robot cuadrúpedo Unitree Go2 en una tarea específica de recontacto y empuje.
- Procesamiento de imágenes RGB de cámara fija a 224×224.
- Integración con un controlador de locomoción de bajo nivel congelado (el modelo no genera objetivos articulares).
- No soporta tool calling, function calling ni razonamiento multi-paso general; es un modelo de política robótica, no un asistente conversacional.
- Capacidades multilingües: solo inglés según la información disponible.
- No dispone de modo de pensamiento (thinking), visión general, audio ni otras capacidades fuera del ámbito VLA.

## Casos de uso

- Investigación en manipulación no prensil con cuadrúpedos: el modelo sirve como política de alto nivel para estudiar cómo un robot vuelve a contactar con un objeto tras un primer empuje fallido, usando las 80 demostraciones como referencia de comportamiento.
- Reproducción de experimentos en simulación: permite replicar el protocolo cerrado de evaluación (14/100 episodios exitosos) y comparar variantes de entrenamiento con el mismo conjunto de validación de 20 demostraciones.
- Inicialización para nuevos fine-tunes: al incluir los pesos completos y las estadísticas de normalización, se puede partir de este checkpoint para adaptar el Go2 a tareas de empuje relacionadas.
- Evaluación de pipelines OpenPI: sirve para validar la integración de transformaciones de observación/acción del proyecto MOLI Go2 y el uso de checkpoints Orbax en flujos JAX.
- Estudio de degradación de políticas VLA: con un éxito del 14 %, es un caso útil para analizar fallos de generalización en tareas de contacto y para diseñar métricas de error de acción.
- Docencia y divulgación técnica: ejemplo concreto de fine-tune de π0.5 sobre datos propios, útil para explicar el ciclo completo desde dataset hasta checkpoint de inferencia.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| Éxito en simulación de bucle cerrado | 14/100 episodios | Evaluado en octubre de 2026, protocolo de simulación original |
| Checkpoint seleccionado | Actualización 9000 | Selección por error de acción en validación (20 demostraciones) |
| Partición de datos | 80 entrenamiento / 20 validación | Dataset MOLI Go2 expert demonstrations |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 12,4 GB, lo que da una cota inferior del espacio en disco necesario para los pesos.
- GPU recomendadas: no disponible; al ser un checkpoint JAX/Orbax de π0.5, se requiere hardware compatible con JAX y suficiente memoria para cargar los shards OCDBT completos.
- ¿Cabe en GPU de consumo? No disponible; no se especifica el tamaño de parámetros ni la memoria necesaria.
- Opciones de despliegue: carga mediante `huggingface_hub.snapshot_download` y el ecosistema OpenPI (JAX/Orbax). No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MOLI π0.5 — go2 recontact | Fine-tune VLA de π0.5 | no disponible | no disponible | 14/100 en simulación | no disponible (restricciones Gemma) | Hugging Face, 0 descargas |
| π0.5 base (Physical Intelligence) | VLA base | no disponible en la información | no disponible | no disponible | términos OpenPI/Gemma | Pesos base vía OpenPI |
| Otros fine-tunes de OpenPI | VLA especializados | no disponible | no disponible | no disponible | variable | variable |

No se dispone de datos comparativos de benchmarks entre estos modelos en la información proporcionada; la comparación se limita a la relación de derivación y al ecosistema de despliegue.

## Limitaciones y advertencias

- El modelo es específico de una tarea y un robot (Go2, tarea de recontacto); no es un controlador de locomoción autónomo ni un modelo general.
- El éxito del 14/100 corresponde al protocolo de simulación original, no a despliegue en el mundo real; no debe interpretarse como rendimiento en producción.
- No se incluyen el optimizador ni el `train_state`, por lo que no permite restaurar exactamente el estado de entrenamiento original.
- Los pesos están en formato Orbax/JAX y requieren las transformaciones y la configuración de entrenamiento del proyecto MOLI Go2; no son cargables con `from_pretrained` de Transformers.
- Es necesario preservar todas las rutas de los shards y usar las estadísticas de normalización incluidas; obviarlas invalida las salidas.
- Las tres dimensiones de salida son velocidades del cuerpo, no objetivos articulares; usarlas como tales produciría comandos incorrectos.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser una política entrenada con 80 demostraciones, es probable un alto sobreajuste al entorno y a la cámara fija de entrenamiento.
- Restricciones de licencia: la model card remite a los términos de Gemma y a restricciones de uso incorporadas; el uso comercial no está claro y requiere revisar `LICENSE`, `LICENSE_GEMMA.txt` y `NOTICE`. La licencia del dataset es independiente de la del modelo.
- Idioma: solo inglés; las instrucciones de tarea en otros idiomas no están soportadas según la información disponible.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeong-zju/moli-pi05-go2-recontact
- Dataset MOLI Go2 expert demonstrations: https://huggingface.co/datasets/Jeong-zju/moli-go2-expert-100
- Repositorio OpenPI de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
