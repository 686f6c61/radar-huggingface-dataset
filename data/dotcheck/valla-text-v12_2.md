# DotCheck/valla-text-v12_2

## Resumen

El modelo `DotCheck/valla-text-v12_2` es un clasificador de texto desarrollado por DotCheck, una empresa centrada en la detección de contenido generado por inteligencia artificial. Según la información disponible, este repositorio está archivado y el modelo activo se encuentra en `DotCheck/valla-text-v14_3`. La versión v12 (sin el sufijo `_2`) se describe como un clasificador de texto multilingüe para detección de IA, con soporte para 8 idiomas y licencia Apache-2.0.

La relevancia de este modelo radica en su propósito: distinguir texto humano de texto generado por modelos de lenguaje, una tarea cada vez más crítica en entornos académicos, editoriales y de moderación de contenido. Sin embargo, al tratarse de un repositorio archivado, su utilidad práctica es limitada y se recomienda usar la versión más reciente. No se dispone de detalles sobre arquitectura, tamaño o contexto en la documentación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 8 idiomas (según la ficha de valla-text-v12, sin especificar cuáles) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (si es transformer, MoE, etc.), ni sobre los datos de entrenamiento, el número de tokens procesados o el uso de técnicas como RLHF o DPO. La documentación de DotCheck menciona que los métodos completos y sus limitaciones se detallan en documentos PDF, pero no se han proporcionado en la información disponible. El modelo v12_2 es una versión archivada, por lo que los detalles técnicos de esta iteración concreta no están accesibles.

## Capacidades

- Clasificación de texto para detección de contenido generado por IA (inferido a partir de la descripción de valla-text-v12).
- Soporte multilingüe, con cabezales específicos por idioma (según la documentación técnica de DotCheck, el portugués usa un cabezal entrenado en Brasil).
- No se dispone de información sobre generación de texto, razonamiento, código, tool calling o capacidades de agente.

## Casos de uso

Dado que el modelo está archivado y no se dispone de especificaciones detalladas, los casos de uso se infieren de la función declarada de la familia valla-text:

- Detección de texto generado por IA en entornos académicos: el modelo puede ayudar a identificar ensayos o trabajos escritos por modelos de lenguaje, aunque se recomienda usar la versión activa v14_3.
- Moderación de contenido en plataformas editoriales: clasificar artículos o comentarios sospechosos de ser generados automáticamente.
- Verificación de autenticidad en publicaciones periodísticas: apoyar a redacciones en la validación de contenido antes de su publicación.
- Auditoría de contenido en marketing digital: detectar si textos promocionales o descripciones de productos han sido generados por IA.
- Análisis de redes sociales: identificar campañas de desinformación que utilicen texto sintético.
- Investigación en detección de IA: servir como punto de referencia o base para estudios comparativos, aunque al estar archivado su uso en producción no es recomendable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha de valla-text-v12 menciona "Eval Results (legacy)" pero no se incluyen los datos. No se pueden proporcionar cifras de MMLU, HumanEval u otros estándares.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware, VRAM, GPUs recomendadas o opciones de despliegue. Al ser un clasificador de texto, es probable que sea ligero y ejecutable en CPU, pero esto es una suposición sin base documental. No se indican herramientas de despliegue como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa con otros modelos de detección de IA (por ejemplo, GPTZero, DetectGPT o modelos de OpenAI). La información pública no incluye métricas ni especificaciones que permitan una comparación objetiva. Se recomienda consultar la versión activa v14_3 para obtener datos actualizados.

## Limitaciones y advertencias

- El modelo está archivado y no recibe mantenimiento; su uso en producción no es recomendable.
- No se han publicado detalles sobre sesgos, riesgos de alucinación o limitaciones de contexto.
- La licencia Apache-2.0 permite uso comercial, pero al ser una versión obsoleta, los resultados pueden no reflejar el estado del arte.
- La documentación técnica de DotCheck advierte que los métodos tienen limitaciones, pero no se especifican cuáles en la información disponible.
- No se conoce el rendimiento real en tareas de detección de IA; cualquier uso debe validarse con la versión actual.

## Enlaces

- Repositorio archivado: https://huggingface.co/DotCheck/valla-text-v12_2
- Versión activa: https://huggingface.co/DotCheck/valla-text-v14_3
- Modelo base v12: https://huggingface.co/DotCheck/valla-text-v12
- Documentación técnica de DotCheck: https://dotcheck.ai/docs
- Documentación técnica en neerlandés: https://dotcheck.ai/nl/docs
