# richardyoung/Qwen3.5-4B-DiM-heretic-GGUF

## Resumen

Qwen3.5-4B-DiM-heretic-GGUF es una cuantización en formato GGUF del modelo richardyoung/Qwen3.5-4B-DiM-heretic, un derivado del Qwen3.5 de 4B parámetros que ha sido sometido a un proceso de "abliteration" (eliminación de los mecanismos de rechazo) y posteriormente "heretizado". El autor, richardyoung, publica esta versión orientada a llama.cpp y Ollama con el objetivo de ofrecer un modelo conversacional sin los filtros de seguridad habituales del modelo original.

El modelo cuenta con 4.205.751.296 parámetros (aproximadamente 4,2B) y está empaquetado en un repositorio de 18,4 GB que contiene múltiples niveles de cuantización. Incluye una matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precisión, una técnica habitual en el ecosistema llama.cpp para reducir la pérdida de rendimiento al comprimir los pesos.

La relevancia de esta ficha radica en su carácter de investigación: se trata de un modelo "uncensored" y "abliterated" que renuncia explícitamente a los mecanismos de alineación del Qwen3.5 original. Su acceso está restringido (gated) en Hugging Face y requiere aceptar condiciones, lo que refleja la sensibilidad de su naturaleza. La licencia es Apache 2.0, aunque las implicaciones de uso derivadas de la eliminación de salvaguardas deben evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5); detalles específicos de atención y capas no disponibles |
| Parametros totales | 4.205.751.296 (≈4,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF con múltiples niveles e imatrix (niveles concretos no especificados) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5, un transformer decoder-only de la familia Qwen. El modelo base richardyoung/Qwen3.5-4B-DiM-heretic incorpora dos modificaciones principales respecto al original: un proceso de abliteration, que identifica y neutraliza las direcciones de activación asociadas al rechazo de peticiones, y una etapa adicional de "heretización" cuyo detalle técnico no se especifica en la información disponible. El resultado es un modelo que responde a instrucciones que el Qwen3.5 original rechazaría.

La cuantización GGUF se ha realizado con matriz de importancia (imatrix), un método que pondera la importancia de cada peso durante la compresión para preservar mejor la calidad en bits bajos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO en el modelo base. La referencia arXiv:2611.17846 aparece en las etiquetas del repositorio, pero no se ha podido verificar su contenido en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Respuesta a instrucciones sin los filtros de rechazo del modelo original (abliterated/uncensored).
- Formato GGUF compatible con llama.cpp y Ollama, lo que facilita su despliegue local.
- Compatible con endpoints (etiqueta endpoints_compatible), lo que sugiere integración con infraestructuras de inferencia estándar.
- Capacidades de razonamiento y código heredadas del Qwen3.5 base, aunque no se detallan en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es text-generation.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparándolo con el Qwen3.5 original para analizar qué tipos de contenido se ven afectados por la abliteration y cómo varía la distribución de respuestas.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativas que aborden temas sensibles (violencia, contenido adulto, dilemas morales) donde el modelo original podría negarse a colaborar.
- Pruebas de robustez y red teaming: evaluación de la eficacia de los filtros de seguridad en pipelines de producción, usando este modelo como caso de control para medir la tasa de falsos rechazos de otros sistemas.
- Despliegue local en entornos con recursos limitados: con 4,2B parámetros y cuantización GGUF, puede ejecutarse en GPU de consumo (por ejemplo, RTX 3060 de 12 GB o superiores) mediante llama.cpp u Ollama, sin depender de APIs externas.
- Prototipado de asistentes conversacionales en inglés: gracias a su tamaño reducido, es adecuado para iterar rápidamente en el diseño de prompts y flujos conversacionales antes de escalar a modelos mayores.
- Análisis de sesgos y toxicidad: al carecer de filtros, puede emplearse para generar corpus de texto que permitan entrenar o evaluar clasificadores de contenido dañino en condiciones controladas.
- Educación e investigación lingüística: estudio de cómo la eliminación de salvaguardas afecta a la coherencia, la factualidad y el estilo del modelo en comparación con su versión alineada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,2B parámetros, una cuantización Q4_K_M ocuparía aproximadamente 2,5-3 GB; Q8_0 rondaría los 4,5 GB; FP16 requeriría unos 8,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones bajas, y 12 GB para cuantizaciones altas con contexto extendido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; la etiqueta endpoints_compatible sugiere compatibilidad con servidores de inferencia estándar.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen3.5-4B-DiM-heretic-GGUF | 4,2B | No disponible | Apache 2.0 | GGUF | Abliterated, uncensored, imatrix, acceso gated |
| Qwen3.5-4B (original) | 4,2B | No disponible | Apache 2.0 | Safetensors, GGUF | Modelo alineado con filtros de seguridad |
| richardyoung/Qwen3.5-4B-DiM-heretic | 4,2B | No disponible | Apache 2.0 | Safetensors | Modelo base del que deriva esta cuantización |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated y uncensored: no aplica los filtros de rechazo del Qwen3.5 original, por lo que puede generar contenido dañino, ofensivo o ilegal sin restricciones. No es apto para aplicaciones de cara al público sin moderación adicional.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que implica una barrera de acceso y posibles restricciones de uso derivadas de dichas condiciones.
- Licencia Apache 2.0: permite uso comercial, pero la eliminación de salvaguardas puede contravenir los términos de uso del modelo base original; conviene revisar las condiciones del Qwen3.5 subyacente.
- Solo inglés: el modelo declara únicamente el idioma inglés, por lo que su rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: inherente a los modelos de 4B parámetros; la cuantización puede incrementar la pérdida de factualidad en comparación con el modelo en precisión completa.
- Contexto: la longitud de contexto no se especifica en la información disponible, lo que impide garantizar ventanas largas en producción.
- Sin datos de benchmarks: no es posible evaluar su calidad objetiva frente a alternativas.
- La "heretización" es un proceso no documentado en la información disponible; se desconoce su impacto exacto en el comportamiento del modelo.
- Uso responsable: recomendado exclusivamente para investigación, red teaming y entornos controlados.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-DiM-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.5-4B-DiM-heretic
- Referencia arXiv citada en etiquetas: arxiv:2611.17846 (no verificada en la información disponible)
- Repositorio llama.cpp: no disponible en la información proporcionada
- Repositorio Ollama: no disponible en la información proporcionada
