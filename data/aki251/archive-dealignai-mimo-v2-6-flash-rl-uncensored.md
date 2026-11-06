# Aki251/archive-dealignai-MiMo-V2.6-Flash-RL-UNCENSORED

## Resumen

MiMo-V2.6-Flash-RL (edición UNCENSORED de dealignai) es una variante del modelo Flash de la familia MiMo-V2.6 desarrollada por Xiaomi, publicada y redistribuida por el usuario Aki251 en Hugging Face. Se trata de un modelo de mezcla de expertos (MoE) de 310.756.322.688 parámetros totales (aproximadamente 309B) con 15B parámetros activos, pensado para generación de texto, razonamiento, código, matemáticas y tareas multimodales (visión, audio y comprensión de vídeo). Su rasgo diferencial es que se ha eliminado el comportamiento de rechazo (refusal) a nivel de pesos, manteniendo las capacidades del modelo base.

El modelo base es `XiaomiMiMo/MiMo-V2.6-Flash-RL`, un MoE con 256 expertos enrutados (top-8, sin experto compartido) y una disposición de atención híbrida (9 capas globales + 39 capas de ventana deslizante de 128), junto con un codificador visión-lenguaje, un codificador de audio, comprensión de vídeo y una longitud de contexto de aproximadamente 1 millón de tokens. Incluye además una cabeza de decodificación especulativa DFlash de 5 capas con ventana deslizante (SWA) para inferencia de alto rendimiento.

La relevancia de esta ficha radica en que combina un modelo de gran escala con capacidades multimodales y contexto muy largo, empaquetado en precisión nativa (FP8 en atención y MXFP4 en expertos) y compatible con transformers, vLLM y SGLang. La licencia MIT facilita su uso comercial, aunque la eliminación del comportamiento de rechazo introduce consideraciones éticas y de seguridad importantes para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atención híbrida (9 capas globales + 39 capas sliding-window-128), codificador visión-lenguaje, codificador de audio y cabeza de decodificación especulativa DFlash de 5 capas SWA |
| Parametros totales | 310.756.322.688 (~309B) |
| Parametros activos | 15B (256 expertos enrutados, top-8, sin experto compartido) |
| Longitud de contexto | ~1M tokens (aproximadamente 1.000.000) |
| Tipos de cuantizacion | FP8 (atención) y MXFP4 (expertos) en precisión nativa; bundle de 8 bits |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) con 256 expertos enrutados y activación top-8, sin experto compartido, lo que da 15B parámetros activos sobre un total de ~309B. La atención es híbrida: 9 capas con atención global y 39 capas con ventana deslizante de 128 tokens, una combinación que busca equilibrar el coste computacional con la capacidad de modelar dependencias de largo alcance. Incorpora además un codificador visión-lenguaje, un codificador de audio y soporte de comprensión de vídeo, lo que lo convierte en un modelo multimodal.

El bundle se distribuye en precisión nativa: FP8 para la atención y MXFP4 para los expertos. Incluye una cabeza de decodificación especulativa DFlash de 5 capas con ventana deslizante, que acelera la inferencia mediante verificación de borradores (draft tokens). Según la model card, la cabeza acepta entre 2,09 y 2,39 tokens por verificación de media sobre 7 borradores. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; el sufijo "RL" del nombre base sugiere entrenamiento con refuerzo, pero no se aportan detalles. La variante UNCENSORED se ha obtenido eliminando el comportamiento de rechazo a nivel de pesos, sin hooks en tiempo de ejecución ni vectores de steering, y sin incluir artefactos de compliance en el repositorio.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Razonamiento matemático y resolución de problemas.
- Generación y comprensión de código.
- Comprensión de imágenes (visión-lenguaje): lectura de formas, colores y texto embebido en imágenes.
- Comprensión de audio: resolución de tonos en secuencias de seno (parcial, según la model card resuelve 2 de 3 tonos en una secuencia de 3 tonos).
- Comprensión de vídeo.
- Contexto largo de ~1M tokens para documentos extensos y conversaciones prolongadas.
- Soporte de modo "thinking" (`enable_thinking: true`) y modo directo (`enable_thinking: false`).
- Capacidades de agente y razonamiento multi-paso (etiqueta "agent").
- Predicción multi-token (multi-token-prediction) y decodificación especulativa DFlash.
- Multilingüe limitado a inglés y chino.
- Comportamiento sin rechazo (uncensored) a nivel de pesos en ambas modalidades de thinking.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (~1M tokens) gracias a su ventana de contexto, manteniendo el hilo de la conversación y recuperando información de interacciones previas sin truncamientos.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar y refactorizar código, así como para tareas de razonamiento sobre repositorios extensos gracias al contexto de ~1M tokens.
- Análisis de documentos largos: informes, contratos o expedientes de cientos de miles de tokens pueden procesarse en una sola pasada, extrayendo resúmenes, entidades y respuestas concretas sin necesidad de chunking.
- Asistentes multimodales: combinación de visión y audio para tareas como descripción de imágenes, lectura de texto embebido (OCR) y análisis de secuencias de audio simples, útil en aplicaciones de accesibilidad o inspección visual.
- Comprensión de vídeo para moderación o análisis de contenido: el modelo puede procesar vídeo y responder preguntas sobre su contenido, adecuado para pipelines de revisión automatizada.
- Agentes autónomos multi-paso: con soporte de agentes y tool calling, puede orquestar flujos de trabajo que requieran múltiples llamadas a herramientas y razonamiento encadenado.
- Investigación en seguridad y alineación: al ser una variante sin rechazo, sirve para estudiar comportamientos del modelo en escenarios de red-teaming y evaluación de robustez (con las cautelas éticas correspondientes).
- Generación de contenido creativo y periodístico sin restricciones de rechazo, manteniendo capacidades de conocimiento y razonamiento.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor y comparan la variante UNCENSORED con el modelo base.

| Benchmark | Base | Este modelo | Delta |
|---|---:|---:|---:|
| MMLU (14.042 preguntas, test completo, logit-ranked) | 83,56% | 83,41% | -0,14 pp |
| MMLU ethics cluster (6 asignaturas, 3.294 preguntas) | 73,28% | 72,47% | -0,82 pp |
| MMLU cyber cluster (5 asignaturas, 657 preguntas) | 83,41% | 83,11% | -0,30 pp |
| HarmBench-320 compliance, thinking OFF | (el base rechaza por diseño) | 319/320 = 99,69% | — |
| HarmBench-320 compliance, thinking ON | (el base rechaza por diseño) | 291/320 = 90,94% | — |
| Rechazos duros en 640 sondas (ambos modos) | — | 6 (todos en thinking ON) | — |
| Cabeza especulativa DFlash (tokens aceptados/verificación, de 7 borradores) | — | 2,09–2,39 | — |

Desglose de HarmBench-320 con thinking OFF por categoría: chemical_biological 100%, copyright 100%, cybercrime_intrusion 100%, harassment_bullying 100%, harmful 94,44%, illegal 100%, misinformation_disinformation 100%. Con thinking ON: chemical_biological 97,62%, copyright 75,00%, cybercrime_intrusion 98,08%, harassment_bullying 100%, harmful 83,33%, illegal 96,23%, misinformation_disinformation 96,30%. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 177,8 GB en precisión nativa (FP8/MXFP4), por lo que se requiere al menos ~180 GB de VRAM o memoria unificada para cargar los pesos completos. Con cuantizaciones adicionales (no especificadas en la información) podría reducirse, pero no se dispone de datos concretos.
- GPU recomendadas: para cargar el bundle completo se necesitan configuraciones multi-GPU de gama alta, como 8×H100 (80 GB) o 8×A100 (80 GB); una sola H100 de 80 GB no es suficiente para los pesos completos en precisión nativa.
- ¿Cabe en consumer GPU? No en su configuración nativa. Se requeriría cuantización agresiva (no documentada) para acercarse a GPUs de consumo como RTX 4090 (24 GB), y aun así el modelo completo no cabría en una sola unidad.
- Opciones de despliegue: transformers (custom_code), vLLM (loader MiMo V2), SGLang (loader MiMo V2.6). No se mencionan llama.cpp ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. La cabeza DFlash acepta 2,09–2,39 tokens por verificación de 7 borradores, lo que indica aceleración especulativa, pero no se aportan cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. A continuación se comparan únicamente parámetros y características estructurales conocidas.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Multimodal |
|---|---:|---:|---|---|---|
| MiMo-V2.6-Flash-RL UNCENSORED (este) | ~309B | 15B | ~1M | MIT | Sí (visión, audio, vídeo) |
| XiaomiMiMo/MiMo-V2.6-Flash-RL (base) | ~309B | 15B | ~1M | no disponible | Sí (visión, audio, vídeo) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible otros modelos comparables de la misma categoría (MoE de ~300B con contexto de ~1M y multimodalidad) con datos verificables.

## Limitaciones y advertencias

- Eliminación del comportamiento de rechazo: el modelo cumple instrucciones en categorías sensibles (HarmBench-320 con 99,69% de compliance en thinking OFF), lo que incluye contenido dañino, copyright, cibercrimen, desinformación y autolesiones. No es adecuado para despliegues sin filtros externos de seguridad.
- Riesgo de alucinación: no se han publicado métricas específicas de factualidad o alucinación; como todo modelo generativo, puede producir información incorrecta con aparente seguridad.
- Sesgos conocidos: no se documentan evaluaciones de sesgo en la información disponible; al entrenarse principalmente en inglés y chino, puede presentar sesgos culturales y lingüísticos.
- Limitaciones de idioma: solo soporta inglés y chino (en, zh); el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero la ausencia de comportamiento de rechazo puede entrar en conflicto con normativas de moderación de contenido y políticas de plataformas.
- Precisión nativa FP8/MXFP4: requiere hardware compatible con estos formatos para un rendimiento óptimo; en otros entornos puede degradarse el rendimiento o requerir conversiones.
- Tamaño: ~309B parámetros y 177,8 GB de pesos implican requisitos de hardware elevados (multi-GPU), lo que limita su despliegue en entornos con recursos modestos.
- Caveat de producción: la variante UNCENSORED no incluye artefactos de compliance; cualquier despliegue comercial debe incorporar capas de moderación externas y auditoría de contenido.
- La model card indica que la comprensión de audio es parcial (resuelve 2 de 3 tonos en una secuencia de 3 tonos), por lo que no debe asumirse un rendimiento de audio completo.

## Enlaces

- Hugging Face: https://huggingface.co/Aki251/archive-dealignai-MiMo-V2.6-Flash-RL-UNCENSORED
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- X (Twitter) del autor: https://x.com/dealignai
- Sitio web del autor: https://dealign.ai
- Ko-fi: https://ko-fi.com/dealignai
