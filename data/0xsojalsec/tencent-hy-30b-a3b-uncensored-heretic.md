# 0xSojalSec/Tencent-Hy-30B-A3B-uncensored-heretic

## Resumen

Este modelo es una versión desalineada (abliterated) del modelo de traducción multilingüe Hy-MT2-30B-A3B de Tencent, creada por el usuario 0xSojalSec mediante la herramienta Heretic v1.4.0+custom con el método Arbitrary-Rank Ablation (ARA) sobre un adaptador LoRA y preservación de norma de fila. El resultado es un modelo que mantiene las capacidades de traducción del original pero con una reducción sustancial de su alineación de seguridad, lo que lo hace más propenso a generar contenido no deseado, ofensivo o perjudicial.

Con 30.064.719.872 parámetros totales y una arquitectura MoE que activa aproximadamente 3 mil millones de parámetros (según la nomenclatura A3B), el modelo soporta traducción entre 33 idiomas y tiene una ventana de contexto de 8.192 tokens. Está pensado exclusivamente para investigación en seguridad, alineación y red-teaming, no para despliegue en producción. Su relevancia radica en ser un caso práctico de abliteración aplicado a un modelo de traducción de última generación, permitiendo estudiar el impacto de la eliminación de la negativa a responder en tareas multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Hy-MT2-30B-A3B de Tencent |
| Parametros totales | 30.064.719.872 |
| Parametros activos | Aproximadamente 3 mil millones (según nomenclatura A3B; no confirmado en la ficha) |
| Longitud de contexto | 8.192 tokens (segun OpenRouter; maximo de salida 4.096 tokens) |
| Tipos de cuantizacion | safetensors (FP16/BF16) en este repo; versiones GGUF disponibles en repo separado |
| Idiomas soportados | 33: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | apache-2.0 (derivado del modelo base, con restricciones de uso indicadas por el autor) |
| Formato de pesos | safetensors (transformers), GGUF (enlace externo) |

## Arquitectura y entrenamiento

El modelo base Hy-MT2-30B-A3B es un modelo de traducción multilingüe de tipo "fast-thinking" desarrollado por Tencent, con una arquitectura transformer de mezcla de expertos (MoE) que activa solo una fracción de sus parámetros por token (3B activos de 30B totales). El entrenamiento original incluye datos multilingües y un ajuste para seguir instrucciones de traducción en múltiples idiomas, aunque los detalles exactos del dataset no se proporcionan en la información disponible.

La versión abliterated se obtuvo aplicando Heretic v1.4.0+custom sobre el modelo original, con el método Arbitrary-Rank Ablation (ARA) que utiliza un adaptador LoRA y preservación de norma de fila. Los parámetros de abliteración incluyen un rango de capas de 18 a 28, pesos de preservación de buen comportamiento de 1.0 y de dirección de mal comportamiento de 0.1441, con regularización ridge de 0.0003. Este proceso elimina selectivamente las direcciones en el espacio de activaciones asociadas con la negativa a responder, manteniendo en gran medida las capacidades de traducción.

## Capacidades

- Traducción multilingüe entre 33 idiomas, incluyendo pares con dialectos y lenguas minoritarias chinas (según el modelo base).
- Seguimiento de instrucciones de traducción en varios idiomas, con soporte para formatos estructurados, delimitadores, contexto y glosarios (según documentación del modelo base).
- Generación de texto con razonamiento rápido ("fast-thinking") para escenarios de traducción complejos.
- Capacidad de traducción de subtítulos de video (el modelo base colabora con WMT26 en esta tarea).
- Herramientas de integración disponibles como skill para plataformas de agentes (ClawHub, SkillHub) en el modelo base.
- Debido a la abliteración, el modelo puede responder a solicitudes que el original rechazaría, lo que lo hace útil para estudiar límites de seguridad.

## Casos de uso

- Investigación en seguridad de IA: analizar cómo la abliteración afecta a las capacidades de traducción y a la propensión a generar contenido dañino en contextos multilingües.
- Red-teaming de modelos de traducción: probar la robustez de los sistemas de moderación y detectar vulnerabilidades en flujos de traducción automática.
- Estudio de alineación: comparar el comportamiento del modelo original y el desalineado para entender qué mecanismos internos controlan la negativa a responder.
- Evaluación de técnicas de ablación: validar el método ARA de Heretic sobre modelos MoE de gran tamaño y su impacto en métricas de calidad de traducción.
- Pruebas de sesgo y toxicidad: generar corpus de contenido extremo en múltiples idiomas para entrenar clasificadores de moderación.
- Experimentación académica en entornos aislados: reproducir y ampliar los resultados de abliteración en modelos de traducción sin riesgo de exposición pública.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de traducción en la informacion disponible. La unica metrica reportada es la relativa al proceso de abliteracion:

| Metrica | Modelo abliterated | Modelo original (Hy-MT2-30B-A3B) |
|---|---|---|
| Keywords (tasa de rechazo) | 0/100 | 100/100 |
| Divergencia KL | 0.0276 | 0 (por definicion) |

Estas metricas indican que el modelo abliterated no rechaza ninguna de las 100 solicitudes de prueba (mientras que el original rechaza todas), y que su distribucion de salidas difiere ligeramente del original (KL 0.0276). No hay datos de MMLU, BLEU, COMET u otras metricas estandar de traduccion.

## Requisitos de hardware

- El peso del repositorio es de 60.1 GB en safetensors, lo que implica que en FP16 se necesitan aproximadamente 60 GB de VRAM para cargar el modelo completo.
- Para inferencia en una sola GPU se requiere una GPU profesional con al menos 80 GB (por ejemplo, A100 80GB, H100 80GB) o multiples GPUs consumer en paralelo.
- Con cuantizacion GGUF (disponible en el repo enlazado), el modelo puede ejecutarse en GPUs de consumo con menor VRAM: por ejemplo, una cuantizacion Q4_K_M ocuparia alrededor de 18-20 GB, apta para RTX 4090 (24 GB) o similar.
- Opciones de despliegue: transformers con aceleracion GPU, vLLM para alto rendimiento, llama.cpp o Ollama para cuantizaciones GGUF en entornos locales.
- La latencia y el throughput dependen del hardware y de la cuantizacion; al ser un modelo MoE con solo 3B activos, la velocidad de inferencia es comparable a un modelo de 3B, aunque el uso de memoria es mayor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Hy-MT2-30B-A3B (original) | 30B totales, 3B activos | 8.192 tokens | Apache-2.0 | Traduccion multilingue alineada |
| Hy-MT2-30B-A3B-uncensored-heretic (este) | 30B totales, 3B activos | 8.192 tokens | Apache-2.0 (con restricciones) | Investigacion en desalineacion |
| DeepSeek-V4-Pro | No disponible en la informacion | No disponible | No disponible | Traduccion y generacion (mencionado en el paper del base) |
| Kimi K2.6 | No disponible en la informacion | No disponible | No disponible | Traduccion y generacion (mencionado en el paper del base) |

El modelo base Hy-MT2-30B-A3B supera a DeepSeek-V4-Pro y Kimi K2.6 en modo "fast-thinking" segun el paper citado, pero no se dispone de datos comparativos para la version abliterated.

## Limitaciones y advertencias

- El modelo ha sufrido una reduccion sustancial de su alineacion de seguridad; es mas probable que genere contenido danino, inexacto, sesgado u ofensivo que el modelo original.
- No debe desplegarse en servicios publicos o orientados al usuario final; el autor lo limita a investigacion y experimentacion.
- Todas las salidas deben tratarse como no confiables y verificarse de forma independiente antes de cualquier uso.
- El modelo puede alucinar traducciones incorrectas, especialmente en pares de idiomas poco comunes o con terminologia especializada.
- La ventana de contexto de 8.192 tokens limita la traduccion de documentos largos sin segmentacion previa.
- No se han publicado estudios de sesgo especificos para esta version; el modelo base puede heredar sesgos de los datos de entrenamiento originales.
- La licencia Apache-2.0 se aplica al modelo derivado, pero el autor anade restricciones de uso que pueden limitar su aplicacion comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xSojalSec/Tencent-Hy-30B-A3B-uncensored-heretic
- Version GGUF: https://huggingface.co/OS-Software/Hy-MT2-30B-A3B-uncensored-heretic-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT2-30B-A3B
- Paper del modelo base (arXiv): https://arxiv.org/pdf/2605.22064
- Herramienta Heretic: https://heretic-project.org
- Repositorio GitHub de Hy-MT2: https://github.com/Tencent-Hunyuan/Hy-MT2
- AngelSlim (cuantizacion extrema): https://github.com/Tencent/AngelSlim/tree/main
