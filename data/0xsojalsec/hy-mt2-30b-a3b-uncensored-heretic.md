# 0xSojalSec/Hy-MT2-30B-A3B-uncensored-heretic

## Resumen

Hy-MT2-30B-A3B-uncensored-heretic es una versión modificada del modelo de traducción multilingüe Hy-MT2-30B-A3B desarrollado por Tencent, a la que se ha aplicado una técnica de "abliteración" (eliminación de censura) mediante la herramienta Heretic v1.4.0+custom con el método Arbitrary-Rank Ablation (ARA). El autor, 0xSojalSec, ha publicado este modelo con el objetivo de eliminar el alineamiento de seguridad del modelo original, lo que lo hace más propenso a generar contenido sin restricciones éticas o de seguridad.

El modelo base es un MoE (Mixture of Experts) con 30.064 millones de parámetros totales y 3.000 millones activos (30B-A3B), diseñado específicamente para traducción entre 33 idiomas y seguimiento de instrucciones de traducción. Esta versión decensored mantiene la misma arquitectura y capacidades lingüísticas, pero con el alineamiento de seguridad reducido. Se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors, además de contar con versiones GGUF en un repositorio asociado.

La relevancia de este modelo radica en su uso para investigación en seguridad de IA, estudios de alineamiento y red-teaming, ya que permite analizar el comportamiento de un modelo de traducción de alto rendimiento sin las restricciones habituales de seguridad. Sin embargo, su uso está explícitamente restringido a entornos de investigación y no se recomienda su despliegue en servicios públicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), basada en el modelo Hy-MT2 de Tencent |
| Parametros totales | 30.064.719.872 |
| Parametros activos | 3.000 millones (A3B) |
| Longitud de contexto | 8.192 tokens (según OpenRouter para el modelo base; no confirmado para esta versión) |
| Tipos de cuantizacion | safetensors (FP16/BF16) y GGUF (disponible en repositorio separado) |
| Idiomas soportados | zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug (33 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también disponible en GGUF) |

## Arquitectura y entrenamiento

La arquitectura del modelo es un MoE (Mixture of Experts) con 30.000 millones de parámetros totales y 3.000 millones activos por token, lo que permite una inferencia eficiente en términos de cómputo. El modelo original, Hy-MT2-30B-A3B, fue desarrollado por Tencent como parte de la familia Hy-MT2, orientada a tareas de traducción multilingüe en escenarios complejos del mundo real. No se dispone de detalles específicos sobre el número de tokens de entrenamiento ni la composición exacta del dataset, aunque el modelo base reporta superar a alternativas como DeepSeek-V4-Pro y Kimi K2.6 en modo "fast-thinking" para tareas de traducción.

Esta versión decensored se ha obtenido aplicando el método de abliteración con Heretic v1.4.0+custom, utilizando el enfoque Arbitrary-Rank Ablation (ARA) con un adaptador LoRA y preservación de la norma de fila. Los parámetros de abliteración indican que se intervinieron las capas 18 a 28, con un peso de preservación de comportamiento bueno de 1.0 y un peso de dirección de comportamiento malo de 0.1441, junto con un peso de sobrecorrección relativa de 2.2030. El proceso se optimizó con el optimizador ot_ridge y regularización ridge de 0.0003. La divergencia KL resultante entre esta versión y el modelo original es de 0.0276, lo que indica una alteración relativamente baja en la distribución de salida.

## Capacidades

- Traducción multilingüe entre 33 idiomas, incluyendo lenguas mayoritarias y minoritarias como tibetano, kazajo, mongol y uigur.
- Seguimiento de instrucciones de traducción en múltiples idiomas, permitiendo especificar estilo, tono o dominio.
- Generación de texto en modo "fast-thinking" (según la descripción del modelo base), optimizado para respuestas rápidas sin sacrificar calidad.
- Soporte de tareas de traducción general, de negocio, dominio específico y con instrucciones complejas.
- Capacidad de trabajar con contextos largos (hasta 8.192 tokens), adecuado para documentos extensos o conversaciones multi-turno.
- No se ha confirmado soporte de tool calling ni capacidades de agente en esta versión; el modelo está orientado exclusivamente a traducción.

## Casos de uso

- Traducción automática de documentos técnicos y legales: el modelo puede procesar documentos extensos de hasta 8.192 tokens, lo que permite traducir contratos, patentes o informes técnicos manteniendo la coherencia terminológica.
- Subtitulado de vídeo en tiempo real: la arquitectura MoE con 3.000 millones de parámetros activos permite una inferencia rápida, adecuada para generar subtítulos en 33 idiomas con baja latencia.
- Traducción de atención al cliente multilingüe: integrable en sistemas de soporte para traducir consultas y respuestas entre idiomas, manteniendo el contexto de la conversación gracias a la ventana de contexto de 8.192 tokens.
- Localización de productos de software: traducción de cadenas de interfaz, mensajes de error y documentación de usuario a múltiples idiomas con un único modelo.
- Traducción de contenidos web y blogs: automatización de la traducción de artículos y páginas web, con capacidad de seguir instrucciones de estilo (formal, informal, técnico).
- Investigación en seguridad de IA: al ser una versión decensored, es útil para estudiar comportamientos de modelos sin alineamiento, evaluar riesgos de contenido dañino y desarrollar métodos de mitigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) para esta versión específica del modelo. La model card solo reporta dos métricas relativas al proceso de abliteración:

| Metrica | Este modelo | Modelo original |
| :------ | :---------: | :-------------- |
| Keywords (refusal) | 0/100 | 100/100 |
| Divergencia KL | 0.0276 | 0 (por definicion) |

Estos datos indican que el modelo decensored no muestra ningún rechazo ante contenido problemático (0/100 en keywords de rechazo), mientras que el original rechazaba el 100% de los casos. La baja divergencia KL sugiere que el comportamiento general de traducción se mantiene similar al modelo original, pero con la capa de seguridad eliminada. No hay información sobre rendimiento en tareas de traducción específicas (BLEU, COMET, etc.) para esta versión.

## Requisitos de hardware

- El modelo tiene 30.064 millones de parámetros totales, pero solo 3.000 millones activos por token, lo que reduce significativamente la memoria requerida durante la inferencia.
- En precisión FP16/BF16, el modelo requiere aproximadamente 60 GB de VRAM (tamaño del repositorio). Esto implica al menos una GPU con 64 GB o múltiples GPUs (por ejemplo, 2x A100 40GB o 2x RTX 4090 24GB con paralelismo de memoria).
- Con cuantización GGUF (disponible en el repositorio OS-Software/Hy-MT2-30B-A3B-uncensored-heretic-GGUF), es posible ejecutar el modelo en GPUs de consumo. Una cuantización de 4 bits reduciría el peso a aproximadamente 15-20 GB, cabiendo en una RTX 3090/4090 (24 GB) o incluso en 16 GB con cuantizaciones más agresivas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI (Text Generation Inference) y Hugging Face Transformers.
- La latencia estimada no está publicada, pero al ser un MoE con solo 3.000 millones de parámetros activos, la velocidad de inferencia debería ser comparable a un modelo denso de 3B, lo que permite un throughput razonable en hardware de gama media-alta.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Enfoque |
|--------|-------------------|--------------------|----------|----------|---------|
| Hy-MT2-30B-A3B (original) | 30.06B | 3B | 8.192 | Apache-2.0 | Traduccion multilingue con alineamiento de seguridad |
| Hy-MT2-30B-A3B-uncensored-heretic (este modelo) | 30.06B | 3B | 8.192 (no confirmado) | Apache-2.0 | Traduccion multilingue sin alineamiento de seguridad |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | no disponible | Traduccion multilingue (mencionado como competidor del original) |
| Kimi K2.6 | no disponible | no disponible | no disponible | no disponible | Traduccion multilingue (mencionado como competidor del original) |

No se dispone de datos detallados de DeepSeek-V4-Pro ni Kimi K2.6 en la información proporcionada. La comparativa se limita a lo indicado en la model card del modelo original, que afirma que Hy-MT2-30B-A3B supera a ambos en modo "fast-thinking" para tareas de traducción.

## Limitaciones y advertencias

- El modelo ha sido sometido a una reducción sustancial de su alineamiento de seguridad, por lo que es significativamente más propenso a generar contenido dañino, inexacto, sesgado, ofensivo o inapropiado que los modelos estándar.
- La model card del autor indica explícitamente que el modelo está destinado solo para investigación y experimentación (seguridad, alineamiento, red-teaming) y que no debe desplegarse en servicios públicos o dirigidos a usuarios finales.
- Todos los resultados generados deben tratarse como no fiables y verificarse de forma independiente antes de cualquier uso.
- El usuario es el único responsable de evaluar la precisión, implementar salvaguardas y cumplir con las leyes y estándares éticos aplicables.
- No se dispone de información sobre sesgos específicos del modelo, pero al ser una versión sin alineamiento, es probable que amplifique sesgos presentes en los datos de entrenamiento originales.
- La longitud de contexto de 8.192 tokens es relativamente corta para aplicaciones que requieran procesar documentos muy extensos de una sola vez.
- La licencia Apache-2.0 permite uso comercial, pero las restricciones de uso establecidas por el autor (solo investigación) limitan su aplicación práctica en entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSojalSec/Hy-MT2-30B-A3B-uncensored-heretic
- Versión GGUF: https://huggingface.co/OS-Software/Hy-MT2-30B-A3B-uncensored-heretic-GGUF
- Modelo base (Tencent): https://huggingface.co/tencent/Hy-MT2-30B-A3B
- Paper del modelo base: https://arxiv.org/pdf/2605.22064
- Repositorio GitHub de Hy-MT2: https://github.com/Tencent-Hunyuan/Hy-MT2
- Herramienta Heretic: https://github.com/Timmyzzo/heretic-AI- (y https://github.com/Arqam00/heretic_models)
- Información de precios y API en OpenRouter: https://openrouter.ai/tencent/hy-mt2-30b-a3b
