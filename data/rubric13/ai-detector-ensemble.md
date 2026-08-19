# RUBRIC13/ai-detector-ensemble

## Resumen

El modelo `RUBRIC13/ai-detector-ensemble` es un endpoint de inferencia dedicado de Hugging Face que combina tres detectores de texto independientes para devolver una puntuación de probabilidad de que un texto haya sido generado por inteligencia artificial. El autor, RUBRIC13, lo presenta como un sistema de ensamblaje que promedia de forma igualitaria las puntuaciones normalizadas de tres clasificadores: un DeBERTa-v3-large ajustado, un ModernBERT-large y un Qwen3-0.6B con clasificador de secuencia. No se trata de un modelo único, sino de un servicio que orquesta estos tres componentes y expone una API JSON.

La relevancia actual radica en la creciente necesidad de detectar contenido generado por IA en entornos académicos, editoriales y de moderación. A diferencia de soluciones monolíticas, este ensemble intenta mitigar los falsos positivos combinando señales de arquitecturas diversas. La puntuación resultante no es una probabilidad científicamente calibrada, sino un promedio ponderado por tokens, lo que permite manejar entradas largas sin truncado silencioso. La ficha técnica de HuggingFace no proporciona detalles sobre arquitectura interna, tamaño total ni contexto de los modelos base, aunque se pueden inferir a partir de los repositorios citados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de tres clasificadores: DeBERTa-v3-large, ModernBERT-large, Qwen3-0.6B (clasificador de secuencia) |
| Parámetros totales | No disponible (el ensemble no tiene parámetros propios; los modelos base suman aproximadamente 1.5B, pero no se especifica) |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (cada modelo tiene su propio límite; se usa ventanas superpuestas) |
| Tipos de cuantización | No disponible (se sirve como endpoint dedicado, sin cuantización explícita) |
| Idiomas soportados | No disponibles en la ficha; los modelos base son principalmente multilingües (Qwen3) o inglés (DeBERTa, ModernBERT) |
| Licencia | No disponible para el conjunto; los modelos base tienen licencias MIT y Apache-2.0 (ver sección de limitaciones) |
| Formato de pesos | No aplicable (es un endpoint, no un conjunto de pesos publicados) |

## Arquitectura y entrenamiento

El modelo es un ensemble en tiempo de inferencia, no un modelo entrenado de cero. Los tres componentes son:

1. `abhi099k/ai-text-detector-v-n4.0` – un ajuste fino de DeBERTa-v3-large, donde la clase 1 indica texto generado por IA.
2. `ShantanuT01/vanguard-ai-text-detector` – un ModernBERT-large con un único logit de salida mapeado mediante sigmoide para obtener la probabilidad de IA.
3. `rasbt/ai-text-detector-qwen3-0.6b-variable` – un clasificador de secuencia Qwen3-0.6B que usa un token `<|im_end|>` de posición variable y una temperatura de escala de `1.4665638128271772` antes del softmax.

El ensemble normaliza cada puntuación de `0.0` (humano) a `1.0` (IA) y promedia las tres igualmente. Para entradas largas, cada modelo tokeniza por separado y divide el texto en ventanas superpuestas que se ajustan a sus límites específicos, puntuando cada ventana y ponderando por recuento de tokens. No se trunca silenciosamente ninguna parte de la entrada.

No se han publicado detalles sobre el entrenamiento de los modelos base, ni sobre el proceso de ajuste fino de los detectores. El runtime fija Transformers 4.57.3 para evitar una importación de torchaudio en la imagen base del endpoint.

## Capacidades

- Detección de texto generado por IA: devuelve una puntuación de probabilidad de `0.0` a `100.0`, donde valores altos indican mayor probabilidad de ser generado por IA.
- Manejo de entradas largas: mediante ventanas superpuestas y ponderación por tokens, no descarta contenido.
- Ensemble de tres arquitecturas diferentes: combina DeBERTa, ModernBERT y Qwen3 para reducir sesgos individuales.
- API simple: recibe un campo `inputs` y devuelve un JSON con `ai_likelihood`, `model_scores` y `ensemble_method`.
- Sin truncado silencioso: garantiza que todo el texto se procese, aunque sea mediante ventanas.
- Soporte de autenticación: el endpoint está protegido y requiere un token de Hugging Face.

## Casos de uso

- **Revisión académica**: los profesores pueden enviar ensayos o trabajos a la API para obtener una puntuación de probabilidad de IA, ayudando a identificar posibles plagios generativos. El ensemble reduce falsos positivos en comparación con un único detector.
- **Moderación de contenido en plataformas**: los equipos de moderación pueden integrar el endpoint en sus flujos para marcar publicaciones sospechosas de ser generadas por IA, priorizando la revisión manual.
- **Verificación de autenticidad en periodismo**: las redacciones pueden usar la API para comprobar si un texto enviado como reportaje humano fue realmente escrito por IA, manteniendo la integridad editorial.
- **Control de calidad en agencias de marketing**: las agencias pueden validar que sus borradores no contengan texto generado por IA no deseado, antes de enviarlos a clientes.
- **Evaluación de herramientas de escritura**: los desarrolladores de aplicaciones de asistencia de escritura pueden usar la API como prueba de referencia para medir la "humanidad" de sus resultados.
- **Investigación en detección de IA**: los investigadores pueden utilizar el ensemble como punto de comparación en estudios sobre robustez de detectores frente a técnicas de evasión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, o tasas de falsos positivos/negativos. No se pueden comparar con otros modelos sin datos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación.
- El endpoint está alojado en Hugging Face Inference Endpoints, con min replicas 0 y max replicas 1, lo que sugiere un despliegue ligero.
- Dado que los tres modelos base suman unos 400 millones de parámetros, se puede ejecutar en una GPU con 8-12 GB de VRAM en cuantización FP16, pero no hay confirmación oficial.
- Opciones de despliegue alternativas: se podría replicar el ensemble localmente usando los modelos base y el código de `handler.py`, pero no se proporcionan instrucciones ni métricas de latencia.
- No se han publicado datos de throughput o latencia.

## Comparativa con modelos similares

No se han identificado modelos comparables específicos para este ensemble. Otros detectores de texto de IA comerciales como GPTZero o Originality.ai no publican sus arquitecturas ni parámetros, por lo que no es posible realizar una comparación técnica directa. Los proyectos de código abierto como `IzzieNielsen/AI-Detector` (ensemble de DeBERTa y SVM) o `zainmustafam977/ai-text-detector-ensemble` (RoBERTa + perplexity GPT-2) son similares en concepto, pero no se proporcionan métricas comparables.

## Limitaciones y advertencias

- La puntuación de ensamble no está calibrada como probabilidad científica; el propio autor indica que es "un ensemble score, not a scientifically calibrated probability".
- Los tres modelos base tienen sesgos inherentes: DeBERTa y ModernBERT están entrenados principalmente con texto en inglés, lo que puede degradar su rendimiento en otros idiomas.
- La licencia del propio modelo no está especificada en la ficha; los modelos base son MIT y Apache-2.0, pero el código del endpoint no tiene licencia explícita.
- El endpoint requiere un token de Hugging Face y tiene un coste asociado; no hay opción de descarga de pesos.
- Riesgo de alucinación en los detectores: pueden clasificar texto humano como IA o viceversa, especialmente en texto técnico o con estilo formal.
- La configuración de ventanas superpuestas puede introducir artefactos en textos muy largos, aunque se pondera por tokens.
- No se garantiza el rendimiento en entornos de producción sin una evaluación previa con datos propios.

## Enlaces

- [Hugging Face - RUBRIC13/ai-detector-ensemble](https://huggingface.co/RUBRIC13/ai-detector-ensemble)
- [MODEL_VERIFICATION.md](https://huggingface.co/RUBRIC13/ai-detector-ensemble/blob/main/MODEL_VERIFICATION.md) (referenciado en la model card, no accesible directamente en la búsqueda)
- [DEPLOYMENT_REPORT.md](https://huggingface.co/RUBRIC13/ai-detector-ensemble/blob/main/DEPLOYMENT_REPORT.md) (referenciado en la model card)
- [IzzieNielsen/AI-Detector en GitHub](https://github.com/IzzieNielsen/AI-Detector) (proyecto similar, no asociado al modelo)
- [zainmustafam977/ai-text-detector-ensemble en GitHub](https://github.com/zainmustafam977/ai-text-detector-ensemble) (proyecto similar, no asociado al modelo)
