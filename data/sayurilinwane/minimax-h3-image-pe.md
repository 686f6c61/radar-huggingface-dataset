# sayurilinwane/MiniMax-H3-Image-PE

## Resumen

MiniMax-H3-Image-PE es un modelo de expansión de prompts (prompt expansion, PE) desarrollado por MiniMax para alimentar su generador de imágenes MiniMax-H3-Image. Su función es convertir una instrucción breve del usuario en una descripción detallada de la imagen objetivo, junto con una recomendación de relación de aspecto, de modo que el modelo de difusión reciba una entrada mucho más rica y específica.

Técnicamente es un ajuste fino supervisado sobre Qwen/Qwen3.8-27B, un transformer denso de 27.356.728.560 parámetros (unos 27,36 mil millones). El checkpoint distribuido está cuantizado en FP4 mediante NVIDIA ModelOpt (etiqueta `8-bit`/`modelopt` en el repositorio), lo que reduce el peso del repositorio a 17,9 GB. La longitud de contexto no está documentada en la información disponible.

Su relevancia es doble: por un lado, expone públicamente el componente de "comprensión de intención" de un pipeline texto-a-imagen de producción; por otro, sirve como ejemplo de despliegue con SGLang, decodificación restringida por gramática (XGrammar) y salida JSON estructurada. La licencia es específica (`minimax-h3-image-community-license-agreement`) y el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 (ModelOpt); etiqueta `8-bit` en el repositorio |
| Idiomas soportados | en (inglés) |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer decoder-only denso de 27,36 mil millones de parámetros, y se ajusta de forma específica para la tarea de expansión de prompts de texto a imagen. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esa información no está disponible.

La innovación operativa no está en la arquitectura sino en el pipeline de inferencia: se recomienda servir el modelo con SGLang (`sglang>=0.5.23`) y `xgrammar>=0.2.7`, usando decodificación restringida por gramática para forzar que la salida cumpla un esquema JSON (descripción expandida más recomendación de relación de aspecto), y un parser de razonamiento (`qwen3`) que separa el bloque de pensamiento de la respuesta final. El checkpoint incluye la configuración FP4, que SGLang lee directamente. El repositorio cubre dos flujos: expansión para texto-a-imagen (con pesos, prompts de tarea y de sistema, y cliente de ejemplo) y expansión para edición de imágenes, este último todavía en desarrollo y publicado únicamente como prompt de tarea.

## Capacidades

- Expansión de prompts de texto a imagen: transforma una instrucción corta en una descripción visual detallada.
- Recomendación de relación de aspecto para la generación posterior.
- Salida estructurada en JSON garantizada mediante decodificación restringida por gramática.
- Modo de razonamiento separado de la respuesta final (parser `qwen3`).
- Soporte de instrucciones vía API compatible con OpenAI (`/v1/chat/completions`).
- Prompt de tarea para expansión de instrucciones de edición de imágenes (flujo en desarrollo, sin pesos específicos publicados).
- Capacidad multilingüe: limitada al inglés según los metadatos del modelo.
- No se documentan capacidades de tool calling, uso de agentes ni visión nativa en los pesos publicados.

## Casos de uso

- Enriquecimiento de prompts en pipelines texto-a-imagen: el modelo recibe la frase del usuario y devuelve una descripción detallada y una relación de aspecto que se pasan directamente a MiniMax-H3-Image, mejorando la fidelidad del resultado sin que el usuario escriba prompts largos.
- Frontend de generación de imágenes en producto: integrado detrás de una API compatible con OpenAI, permite que una interfaz sencilla ("un gato atigrado naranja durmiendo en una ventana") produzca automáticamente la especificación completa de la imagen.
- Estandarización de prompts en equipos creativos: centraliza en un único modelo la política de redacción de descripciones, de modo que todos los prompts generados sigan el mismo esquema JSON y la misma convención de relación de aspecto.
- Automatización de catálogos y assets de marketing: a partir de descripciones de producto breves se generan especificaciones visuales consistentes para lotes de imágenes, con salida parseable y validable por esquema.
- Sustitución del módulo de prompt expansion del proveedor: al ser pesos abiertos, permite desplegar el componente en infraestructura propia (SGLang) manteniendo la compatibilidad con el modelo de imagen de MiniMax vía API.
- Base para ajuste fino de dominio: al derivar de Qwen3.8-27B, puede reajustarse para vocabulario visual especializado (moda, arquitectura, ilustración técnica) conservando el formato de salida JSON.
- Evaluación y auditoría de prompts: al ser determinista bajo gramática restringida, facilita comparar cómo distintas formulaciones de entrada afectan a la descripción expandida antes de gastar cómputo en el modelo de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,36 mil millones de parámetros en FP4, el peso de los pesos ronda los 14-17 GB; se recomienda prever al menos 24 GB de VRAM para pesos más caché KV y overhead del runtime, y 40-48 GB para contextos largos o mayor concurrencia (estimación, no dato publicado).
- GPU recomendadas: A100 40/80 GB y H100 para despliegue con concurrencia; L40S o A6000 como opción intermedia.
- GPU de consumo: el checkpoint FP4 encaja teóricamente en tarjetas de 24 GB (RTX 4090, RTX 3090), aunque el soporte FP4 eficiente depende de la generación de GPU y del backend; no hay datos publicados de funcionamiento verificado en consumer.
- Opciones de despliegue: SGLang es el backend recomendado por el autor (`sglang>=0.5.23`, `xgrammar>=0.2.7`); la librería declarada es `transformers`, por lo que también es cargable con ese stack, aunque sin la decodificación restringida nativa.
- Latencia y throughput: no disponibles. El ejemplo del cliente usa un timeout de 1200 segundos, lo que sugiere que la expansión con razonamiento puede ser lenta en configuraciones modestas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image-PE | 27,36 B (FP4) | no disponible | Expansión de prompts para T2I | minimax-h3-image-community | Pesos abiertos en HF |
| Qwen/Qwen3.8-27B (base) | 27,36 B | no disponible | LLM generalista | según Qwen | Pesos abiertos en HF |
| MiniMax-H3-Image | no disponible | no disponible | Generación de imágenes | minimax-h3-image-community | Pesos abiertos en HF |

La comparación con otros expansores de prompts dedicados no está disponible: no se han identificado en la información proporcionada alternativas públicas de la misma categoría con datos verificables.

## Limitaciones y advertencias

- Modelo especializado: no es un LLM de propósito general; su utilidad fuera de la expansión de prompts para MiniMax-H3-Image es limitada.
- Solo inglés declarado: las instrucciones en otros idiomas, incluido el castellano, no están garantizadas y pueden degradar la calidad de la expansión.
- Riesgo de alucinación: al generar descripciones detalladas, puede introducir elementos visuales no solicitados por el usuario; conviene revisar o filtrar la salida antes de pasarla al generador de imágenes.
- Licencia restrictiva: la `minimax-h3-image-community-license-agreement` no es una licencia de código abierto estándar; debe revisarse el texto completo antes de cualquier uso comercial o redistribución.
- Dependencia de backend: el rendimiento óptimo (salida JSON válida, separación de razonamiento) requiere SGLang con XGrammar; otros backends pueden no reproducir el mismo comportamiento.
- Flujo de edición de imágenes incompleto: solo se publica el prompt de tarea, no los pesos ni el pipeline completo.
- Sin benchmarks: no hay métricas publicadas de calidad de expansión, lo que impide comparar objetivamente con alternativas.
- Contexto no documentado: se desconoce la ventana máxima, lo que complica planificar entradas con muchas imágenes de referencia o instrucciones largas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sayurilinwane/MiniMax-H3-Image-PE
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- MiniMax-H3-Image: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- MiniMax-H3-Image-PE (original): https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Repositorio GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- API (global): https://platform.minimax.io/docs/guides/image-generation
- API (China): https://platform.minimax.cn/docs/guides/image-generation
- Documentación API texto-a-imagen: https://platform.minimax.io/docs/api-reference/image-generation-h3-generations
- Documentación API edición de imágenes: https://platform.minimax.io/docs/api-reference/image-generation-h3-edits
- Documentación API prompt expansion: https://platform.minimax.io/docs/api-reference/image-generation-h3-context-ir
- Hailuo AI: https://hailuoai.video
- Web de MiniMax: https://www.minimax.io
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/dbMxutw7tP
