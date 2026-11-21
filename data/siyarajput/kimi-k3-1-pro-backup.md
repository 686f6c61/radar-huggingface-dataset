# siyarajput/Kimi-K3.1-Pro-Backup

## Resumen

Kimi K3.1 Pro es un modelo de pesos abiertos, nativamente multimodal y orientado a tareas agénticas, desarrollado por Moonshot AI. Se presenta como el primer modelo de la serie K3.1 y como el modelo "de clase 3T" más capaz de la compañía hasta la fecha, según su model card. Está construido sobre Kimi K3 mediante un post-entrenamiento con aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios, con mejoras declaradas en programación, creación 3D, investigación financiera, precisión factual y capacidades agénticas.

Arquitectónicamente es un transformer de tipo Mixture-of-Experts (MoE) con 2,8 billones de parámetros totales y 104 mil millones de parámetros activos por token. Emplea una composición de capas de atención híbrida: 69 capas KDA (atención lineal por decaimiento) y 24 capas Gated DSA (atención dispersa con índice), sobre un total de 93 capas con una única capa densa. Dispone de una ventana de contexto de un millón de tokens.

La ficha que se documenta aquí corresponde a un repositorio espejo alojado por el usuario `siyarajput` bajo el identificador `Kimi-K3.1-Pro-Backup`, con 188 GB de pesos en formato `compressed-tensors` y licencia propia denominada `kimi-k3.1-pro`. Es relevante para desarrolladores e investigadores porque combina contexto de 1M tokens, multimodalidad nativa y capacidades de agente en un modelo de pesos abiertos, aunque su tamaño lo sitúa fuera del alcance de hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida KDA + Gated DSA |
| Parámetros totales | 2,8 T (2.8T) |
| Parámetros activos | 104 B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | `compressed-tensors` (repositorio); no se detallan variantes GGUF/AWQ/GPTQ en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia propia, `license: other`) |
| Formato de pesos | `compressed-tensors` (compatible con `transformers`, `custom_code`) |

Datos arquitectónicos adicionales: 93 capas (1 densa), dimensión de atención 7168, 96 cabezas de atención, dimensión de cabeza de índice DSA 128, 32 cabezas de índice DSA, top-K DSA de 2048, dimensión latente MoE 3584, dimensión oculta MoE por experto 3072, 896 expertos, 16 expertos seleccionados por token y 2 expertos compartidos. Vocabulario de 160K tokens.

## Arquitectura y entrenamiento

El modelo es un transformer MoE con atención híbrida. De las 93 capas, 69 usan KDA (atención lineal con decaimiento, pensada para eficiencia en contextos largos) y 24 usan Gated DSA (atención dispersa con índice, con top-K de 2048 y 32 cabezas de índice de dimensión 128). La capa MoE opera en un espacio latente de 3584 dimensiones con 896 expertos, de los cuales se activan 16 por token más 2 expertos compartidos, lo que da lugar a los 104B parámetros activos sobre los 2,8T totales. La dimensión de atención es 7168 con 96 cabezas.

El entrenamiento parte de Kimi K3 y aplica un post-entrenamiento con aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream. La model card menciona mejoras específicas en codificación, creación 3D, investigación financiera y precisión factual, así como capacidades agénticas. No se detalla en la información disponible el número de tokens de preentrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO más allá del RL conjunto mencionado. El repositorio usa `compressed-tensors` y requiere `custom_code` en `transformers`, lo que implica que la arquitectura no es estándar y necesita código propio del autor para cargarse.

## Capacidades

- Generación de texto y conversación multi-turno con ventana de contexto de 1M tokens.
- Razonamiento y resolución de problemas complejos, con mejoras declaradas en precisión factual.
- Programación y generación de código, con mejoras específicas en tareas de coding.
- Creación 3D, según la model card.
- Investigación financiera y análisis de dominios especializados.
- Capacidades agénticas: razonamiento multi-paso y ejecución de tareas de agente.
- Multimodalidad nativa de entrada imagen-texto (pipeline `image-text-to-text`).
- Compatibilidad con endpoints (`endpoints_compatible`) y con `transformers`.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Análisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir bases de código extensas y responder preguntas de arquitectura, dependencias o refactorizaciones sin fragmentar el contexto.
- Agentes autónomos de investigación: el modelo puede encadenar pasos de búsqueda, lectura de documentos y síntesis gracias a su entrenamiento en RL sobre dominios downstream y su capacidad multi-paso.
- Investigación financiera asistida: análisis de informes, estados financieros y documentación regulatoria extensa en una sola ventana, con mejoras declaradas en precisión factual para reducir errores en cifras.
- Generación y revisión de código en producción: integración en pipelines de revisión donde el modelo analiza diffs, propone parches y razona sobre el contexto del repositorio.
- Asistentes multimodales: al ser nativamente multimodal (imagen-texto), puede procesar capturas, diagramas o documentación escaneada junto con texto en flujos de soporte técnico.
- Creación 3D y prototipado: generación de descripciones, scripts o especificaciones para herramientas de modelado 3D, aprovechando la mejora declarada en este dominio.
- Procesamiento de documentación legal o contractual: resumen y extracción de cláusulas en contratos de cientos de páginas dentro de una única ventana de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Con 2,8T parámetros totales y pesos en `compressed-tensors` de 188 GB en el repositorio, la inferencia requiere un clúster multi-GPU; no cabe en una GPU individual.
- GPU recomendadas: no se especifican en la información disponible. Por el tamaño del modelo, se requiere despliegue multi-nodo con GPUs de centro de datos (A100, H100 o equivalentes); el número exacto no está disponible.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, etc.) por el volumen de parámetros totales.
- Opciones de despliegue: `transformers` con `custom_code` y `compressed-tensors`; compatibilidad con endpoints. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8 T | 104 B | 1.000.000 | `kimi-k3.1-pro` (propia) | Pesos abiertos (repo espejo) |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Referenciado como base del post-entrenamiento |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos competidores comparables, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: presente como en cualquier modelo generativo; la model card declara mejoras en precisión factual, pero no se aportan métricas que lo cuantifiquen.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Licencia: la licencia `kimi-k3.1-pro` es propia y de tipo `other`; es imprescindible revisar los términos antes de cualquier uso comercial. No se detallan restricciones en la información disponible.
- Repositorio espejo: la ficha corresponde a `siyarajput/Kimi-K3.1-Pro-Backup`, no al repositorio oficial de Moonshot AI; conviene verificar la integridad y procedencia de los pesos.
- Requiere `custom_code` y `compressed-tensors`: la carga no es estándar y puede fallar con versiones de `transformers` no alineadas.
- Coste de despliegue: 2,8T parámetros totales y 188 GB de pesos implican infraestructura multi-GPU de centro de datos; no es viable en entornos de consumo.
- Contexto de 1M tokens: el rendimiento efectivo en el extremo de la ventana no está documentado con métricas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/siyarajput/Kimi-K3.1-Pro-Backup
- Organización oficial en Hugging Face: https://huggingface.co/moonshotai
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Página de Moonshot AI: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
