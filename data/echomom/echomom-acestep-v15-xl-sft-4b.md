# echomom/echomom-acestep-v15-xl-sft-4b

## Resumen
Este repositorio, publicado por el usuario echomom, es un paquete autocontenido que ensambla los componentes oficiales de ACE-Step 1.5 para generación de música. Combina el modelo de difusión XL-SFT (aproximadamente 4B de parámetros) con el modelo de lenguaje de composición de 4B a 5 Hz, además del VAE compartido y el modelo de embeddings Qwen3-0.6B. El conjunto está pensado para el pipeline completo de ACE-Step 1.5, que permite generación de música a partir de texto, edición de pistas y repintado. El modelo base es ACE-Step/acestep-v15-xl-sft, desarrollado por ACE Studio y StepFun, y la licencia es MIT.

La relevancia de este bundle radica en que ofrece una configuración lista para usar del modelo más grande de la familia ACE-Step 1.5, con soporte de guidance libre de clasificador (CFG) para control fino de la adherencia al prompt. El modelo es de código abierto y está orientado a la investigación y aplicaciones de generación musical. La arquitectura combina un transformer de difusión (DiT) con un codificador y un modelo de lenguaje de composición, lo que permite planificar canciones, generar metadatos y letras, y realizar edición por repintado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con encoder y modelo de lenguaje de composición |
| Parametros totales | Aproximadamente 4B (DiT) + 4B (LM de composición) = ~8B en total |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (soporta cuantización en CPU offload), BF16 nativo |
| Idiomas soportados | Multilingüe (prompts), idiomas específicos no documentados |
| Licencia | MIT |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El componente principal es un transformer de difusión (DiT) con un decoder de tamaño oculto 2560, 32 capas y 32 cabezas de atención, junto a un encoder de 2048 de tamaño oculto y 8 capas. El modelo de lenguaje de composición (4B, 5 Hz) se encarga de la planificación de la canción, generación de metadatos y letras, reescritura de prompts y comprensión de audio. El bundle incluye el VAE compartido y el modelo de embeddings Qwen3-0.6B para el texto. No se han publicado detalles específicos sobre el dataset de entrenamiento ni sobre el proceso de RLHF o DPO; se trata de un ensamblaje de los artefactos oficiales sin entrenamiento adicional.

El modelo SFT (supervised fine-tuned) ofrece calidad de audio superior y soporta guidance de clasificador libre (CFG) para control de adherencia al prompt. Según la documentación, el modelo se ejecuta normalmente con 50 pasos de inferencia. El modelo de composición LM es la variante más grande del upstream, destinada a tareas de planificación y entendimiento musical.

## Capacidades

- Generación de música a partir de texto (text-to-music).
- Edición de música mediante repintado (repainting) y generación de covers.
- Planificación de canciones: el modelo de composición LM genera metadatos, estructura de la canción y letras.
- Reescritura de prompts y consultas para mejorar la adherencia al texto.
- Comprensión de audio a nivel de composición.
- Soporte de prompts multilingües (idiomas no especificados).
- Control de adherencia al prompt mediante guidance de clasificador libre (CFG).

## Casos de uso

- **Generación de música para prototipos**: un desarrollador puede generar pistas de 30 segundos a partir de una descripción textual (por ejemplo, "jazz suave con piano y bajo") para probar conceptos en una aplicación de música.
- **Edición de pistas existentes**: mediante repintado, se pueden modificar secciones de una canción (cambiar la instrumentación o el estilo) manteniendo el resto intacto.
- **Creación de covers**: se puede pedir una versión de una canción en un estilo diferente (por ejemplo, "versión acústica de esta melodía") usando el pipeline de ACE-Step.
- **Composición asistida**: el modelo de LM de composición puede generar letras y estructura de la canción (estrofa, coro, puente) a partir de una idea textual, y luego el DiT sintetiza el audio.
- **Prototipado rápido en producción**: al ser un modelo de código abierto con licencia MIT, puede integrarse en servicios de música personalizada, como generación de música de fondo para vídeos o aplicaciones interactivas.
- **Investigación en generación musical**: sirve como base para experimentos de fine-tuning, evaluación de calidad de audio y análisis de adherencia al prompt en modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada. No se dispone de métricas como MMLU, HumanEval o GSM8K, ni de métricas específicas de generación musical (por ejemplo, FAD, CLAP score). El autor no reporta comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM mínima**: 12 GB con CPU offload y cuantización INT8.
- **VRAM recomendada**: 24 GB para ejecutar la configuración completa (XL + 4B LM) sin offload.
- **GPU compatibles**: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). En consumer GPUs con 16 GB se puede usar con offload de CPU.
- **Opciones de despliegue**: el repositorio oficial de ACE-Step 1.5 (https://github.com/ace-step/ACE-Step-1.5) proporciona scripts de inferencia, Gradio, y soporte para offloading y cuantización. No se menciona vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje puro.
- **Latencia y throughput**: no disponible. Depende del número de pasos (50 por defecto) y del hardware.

## Comparativa con modelos similares

No hay datos de benchmarks comparativos en la información proporcionada. Como alternativas en el espacio de generación de música de código abierto se pueden mencionar:

| Modelo | Parámetros | Licencia | Notas |
|---|---|---|---|
| MusicGen (Meta) | 1.5B / 3.3B | CC-BY-NC 4.0 | Generación de música, pero no soporta edición ni repintado. |
| Stable Audio Open | 1.2B | Stability AI Community License | Generación de audio, pero con restricciones de uso comercial. |
| ACE-Step 1.5 (este bundle) | ~8B (4B DiT + 4B LM) | MIT | Permite edición, repintado y control CFG. |

No se dispone de datos de rendimiento comparables (calidad de audio, adherencia al prompt) entre estos modelos.

## Limitaciones y advertencias

- El repositorio es un ensamblaje de modelos oficiales sin entrenamiento adicional; no hay garantía de mejoras respecto a los modelos base.
- La generación de audio puede reproducir sesgos o patrones no deseados presentes en los datos de entrenamiento originales.
- El riesgo de alucinación es aplicable al modelo de LM de composición, que puede generar letras o metadatos inconsistentes con el prompt.
- La longitud de contexto no está documentada; la capacidad de manejar prompts largos o múltiples turnos no está verificada.
- La licencia MIT permite uso comercial, pero el usuario debe cumplir con leyes de copyright y derechos de terceros al usar contenido generado.
- Requiere hardware de gama alta para una ejecución fluida sin offloading; en GPUs de 12 GB se degrada el rendimiento con cuantización.
- No se proporcionan datos de entrenamiento ni detalles del dataset, lo que dificulta la evaluación de sesgos y calidad.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/echomom/echomom-acestep-v15-xl-sft-4b
- Modelo base acestep-v15-xl-sft: https://huggingface.co/ACE-Step/acestep-v15-xl-sft
- Repositorio oficial de ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5
- Página del modelo en ModelScope (acestep-v15-xl-base): https://modelscope.ai/models/ACE-Step/acestep-v15-xl-base
