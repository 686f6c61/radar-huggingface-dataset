# notmax123/renikud-plus

## Resumen

ReNikud Plus es un modelo de conversión grafema-fonema (G2P) para hebreo desarrollado por Maxim Melichov, Yakov Kolani y Morris Alper. Convierte texto hebreo sin vocalizar (sin niqqud) en transcripciones IPA con marcas de acento, resolviendo la ambigüedad que el hebreo no puntuado deja al contexto. El modelo está diseñado para frontends TTS, investigación de pronunciación y trabajo con léxicos.

La arquitectura exacta no se especifica en la documentación, pero el modelo cuenta con 307.726.424 parámetros y está disponible en formato ONNX (fp32 e int8) y safetensors. Es un modelo de ajuste fino (`armROBUST6clean`) basado en un checkpoint anterior llamado `armCLEAN`, entrenado con supervisión de audio sobre un conjunto de datos derivado de corpus. Su relevancia actual radica en que aborda un problema persistente en el procesamiento de habla hebrea: la falta de vocalización en texto escrito y su impacto en TTS y ASR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal para G2P) |
| Parámetros totales | 307.726.432 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (soporta windowing para entradas largas) |
| Tipos de cuantización | fp32 (model.onnx), int8 dinámico (model_int8.onnx) |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, safetensors |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la documentación pública. Se sabe que es un modelo neuronal para conversión grafema-fonón, entrenado con supervisión de audio. El checkpoint `armROBUST6clean` es un ajuste fino de 4.000 pasos sobre el modelo `armCLEAN`, con una dieta de datos derivada de corpus (`stage3_v4robust6blind_diet`) que no incluyó el conjunto de test para la selección de hiperparámetros (`selection_used_test = 0`).

El sistema incorpora dos componentes: el gráfico neuronal (decodificación "narrow" sin celdas W4) y un paso de rescoring opcional contra un datastore de corpus (`corpus_datastore.json`, con 130.737 superficies) a una temperatura de 0.2. Este rescoring es código Python sobre energías de candidatos, no está dentro del ONNX. La innovación principal es la resolución de homógrafos por contexto y el control de género del hablante y del interlocutor, que permite generar cuatro lecturas distintas para una misma frase según quién habla y a quién.

## Capacidades

- Conversión de texto hebreo sin vocalizar a IPA con marcas de acento.
- Resolución de homógrafos por contexto (por ejemplo, "ספר" puede ser "barber", "book", "counted" o "cut", según el contexto).
- Control de género del hablante y del interlocutor (0 = desconocido, 1 = masculino, 2 = femenino), que afecta a la morfología verbal y preposicional.
- Expansión de números y dígitos a palabras hebreas con concordancia de género con el sustantivo contado (ej: "3 ילדים" → "ʃloʃˈa jeladˈim" vs "3 בנות" → "ʃalˈoʃ banˈot").
- Procesamiento de entradas largas mediante ventanas (windowing).
- Rescoring opcional con datastore para mejorar la precisión en inferencia.
- Integración sencilla con ONNX Runtime y Python.

## Casos de uso

- Frontends TTS: el modelo es adecuado para sistemas de síntesis de voz que necesitan fonemas IPA como entrada. Se integra como componente G2P previo al sintetizador, generando transcripciones fonéticas precisas con marcas de acento.
- Post-procesamiento ASR: en sistemas de reconocimiento de habla hebrea, la salida sin vocalizar puede convertirse en IPA para mejorar la precisión de métricas como WER y facilitar la comparación con transcripciones fonéticas.
- Investigación en pronunciación: permite analizar variantes de pronunciación en corpus de habla hebrea, incluyendo categorías difíciles como nombres propios, acrónimos, slang y coloquialismos.
- Generación de léxicos: útil para crear diccionarios de pronunciación IPA a partir de listas de palabras hebreas, con soporte para homógrafos y variantes de género.
- Sistemas de diálogo multilingüe: en un pipeline TTS multilingüe, el modelo puede integrarse para el hebreo, gestionando correctamente la concordancia de género entre hablante y destinatario.
- Educación de pronunciación: se puede usar en herramientas de aprendizaje de hebreo que generen transcripciones IPA correctas y explicaciones de variantes contextuales.

## Benchmarks y rendimiento

La model card publica resultados en dos conjuntos de evaluación. El ranking principal es el pool de ILSpeech (15.300 palabras, exact-MAP):

| Configuración | WER_strict |
|---|---|
| Modelo ONNX, sin rescoring | 9,31 |
| Modelo ONNX + datastore original, τ = 0,2 | 9,23 |

En el conjunto `test.tsv` (3.110 targets, gold v2):

| Configuración | WER | Accuracy | Marca |
|---|---|---|---|
| Modelo ONNX, sin rescoring | 10,80 | 89,2% | blind |
| Modelo ONNX + datastore original, τ = 0,2 | 10,68 | 89,3% | blind |
| `armCLEAN` (anterior campeón) | 13,86 / 13,67 | ~86,3% | — |

El modelo consigue una mejora de 2,73 puntos porcentuales en WER sobre el conjunto held-out respecto a `armCLEAN`. Los resultados por categoría muestran mejoras sustanciales en nombres, acrónimos, slang y homógrafos de estrés, aunque mantiene errores altos en categorías difíciles como coloquial (47,68 WER) y fonemas raros (38,41 WER).

## Requisitos de hardware

- El modelo tiene 307,7 millones de parámetros, por lo que la inferencia es viable en CPU con ONNX Runtime.
- La versión int8 es aproximadamente 4 veces más pequeña que la fp32, lo que permite ejecutarla en entornos con memoria limitada.
- No se especifican requisitos de GPU en la documentación. La versión fp32 pesa alrededor de 1,2 GB y la int8 unos 310 MB.
- El wrapper `renikud_onnx.py` gestiona la decodificación y el windowing, por lo que el despliegue puede hacerse en un servidor Python sin librerías de GPU.
- El rescoring con datastore requiere un paso adicional en Python sobre las energías de candidatos; no está dentro del modelo ONNX.
- Para producción, se recomienda un despliegue con ONNX Runtime sobre CPU o GPU, dependiendo del volumen de peticiones.

## Comparativa con modelos similares

No se dispone de información pública sobre modelos G2P hebreos comparables con los mismos benchmarks. La propia model card indica que los resultados de 7,23 y 6,91 citados en otros lugares como "RenikudPlus" corresponden a un stack de consenso diferente, no a estos pesos. Por tanto, la comparativa con alternativas como `armCLEAN` o los checkpoints CONS no es directa, y no hay datos de otros modelos G2P para hebreo en la información disponible.

## Limitaciones y advertencias

- El modelo está limitado al idioma hebreo; no soporta otros idiomas.
- No es un sistema TTS completo; es un componente G2P que debe integrarse con un sintetizador.
- La resolución de homógrafos depende del contexto y puede fallar en oraciones ambiguas o con poca información contextual.
- El error es alto en categorías difíciles como coloquial (47,68 WER) y fonemas raros (38,41 WER), lo que debe tenerse en cuenta en aplicaciones críticas.
- El rescoring con datastore es opcional y requiere el archivo `corpus_datastore.json`; sin él, la precisión es menor.
- La documentación indica que los resultados publicados en otras fuentes con los números 7,23 y 6,91 corresponden a un artefacto diferente y no a estos pesos, por lo que hay que tener cuidado al citar métricas.
- El modelo es relativamente nuevo (publicado en agosto de 2026) y no tiene descargas ni likes en HuggingFace; no hay evidencia de uso en producción todavía.
- La licencia Apache 2.0 permite uso comercial, pero la documentación advierte que el código y los modelos "forthcoming" (en preparación), por lo que la disponibilidad del código completo puede ser limitada.

## Enlaces

- [Hugging Face: notmax123/renikud-plus](https://huggingface.co/notmax123/renikud-plus)
- [GitHub: renikud/renikud](https://github.com/renikud/renikud)
- [GitHub: devbyteai/renikudplus](https://github.com/devbyteai/renikudplus)
- [Blog de Evidano sobre ReNikud](https://www.evidano.com/blogs/456)
