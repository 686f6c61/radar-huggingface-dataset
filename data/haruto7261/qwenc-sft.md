# Haruto7261/QwenC-SFT

## Resumen

QwenC-SFT es un ajuste fino supervisado (SFT) publicado por el usuario Haruto7261 en HuggingFace, presumiblemente derivado de la familia Qwen, aunque el autor no especifica la base exacta. El modelo está orientado a conversación en japonés, con un interés particular en el dialecto de Kagoshima (萨隅方言) y en el habla coloquial de dicha región. La model card está redactada íntegramente en japonés y documenta el corpus de entrenamiento, pero no incluye detalles sobre la arquitectura, el tamaño o la licencia.

La relevancia del proyecto radica en su enfoque en la diversidad dialectal del japonés, un área poco cubierta por los modelos generalistas. Sin embargo, la ausencia de especificaciones técnicas, benchmarks y licencia limita seriamente su evaluación y su uso en producción. El repositorio no registra descargas ni interacciones, lo que sugiere un estado muy temprano o experimental.

No se dispone de información sobre la arquitectura subyacente, el número de parámetros, la longitud de contexto ni los formatos de pesos. Cualquier dato de este tipo debe considerarse no disponible a partir de la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (inferido del corpus; no declarado formalmente) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo. El nombre "QwenC-SFT" sugiere un ajuste fino supervisado sobre un modelo de la familia Qwen, pero el autor no confirma la base, el tamaño ni la configuración. Tampoco se especifican los hiperparámetros de entrenamiento, el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

La model card documenta únicamente el corpus utilizado, que combina diálogos cotidianos en japonés (Japanese-Daily-Dialogue, MACHAcorpus, RealPersonaChat), recursos sobre dialectos de Kagoshima (listados de vocabulario, diccionarios y material del Instituto Nacional de Lengua Japonesa), el corpus de actas parlamentarias (国会会議録), la biblioteca Aozora y la Wikipedia en japonés. Esta mezcla sugiere un entrenamiento orientado a conversación coloquial y conocimiento general en japonés, con un sesgo deliberado hacia el habla de Kagoshima.

## Capacidades

- Generación de texto conversacional en japonés, con especial atención a registros coloquiales.
- Manejo de vocabulario y expresiones del dialecto de Kagoshima (萨隅方言), según el corpus declarado.
- Diálogo multi-turno con persona, a partir de los datasets RealPersonaChat y MACHAcorpus.
- Conocimiento general en japonés derivado de Wikipedia y Aozora.
- Comprensión de registros formales del japonés a partir del corpus parlamentario.

No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Investigación en dialectología computacional: el modelo puede emplearse para estudiar la representación del dialecto de Kagoshima en modelos de lenguaje, comparando su comportamiento con modelos base entrenados solo en japonés estándar.
- Generación de diálogos sintéticos en dialecto: útil para aumentar datasets de entrenamiento o evaluación en variedades regionales poco representadas.
- Prototipos de asistentes conversacionales locales en japonés: para entornos de prueba donde el registro coloquial sea prioritario, aunque la falta de licencia impide uso comercial sin aclaración.
- Análisis de corpus parlamentario: el modelo puede servir para tareas exploratorias de resumen o clasificación sobre registros formales, si bien no hay evaluación publicada.
- Educación lingüística: generación de ejemplos de expresiones dialectales para materiales didácticos, con revisión humana obligatoria.
- Evaluación comparativa de SFT: como caso de estudio de ajuste fino sobre corpus japonés mixto, útil para metodología de investigación más que para despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al desconocerse el tamaño del modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se documentan formatos GGUF, safetensors ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de ajuste fino dialectal japonés con especificaciones verificables.

## Limitaciones y advertencias

- Ausencia total de licencia: no es posible determinar si se permite uso comercial, modificación o redistribución.
- Falta de especificaciones técnicas: sin arquitectura, tamaño ni contexto declarados, no se puede evaluar su viabilidad en producción.
- Sin benchmarks: no hay evidencia cuantitativa de calidad, y el corpus dialectal es reducido y heterogéneo (webs, diccionarios y blogs), lo que puede introducir ruido.
- Riesgo de alucinación elevado en un modelo SFT de corpus pequeño y sin evaluación publicada.
- Sesgo hacia el dialecto de Kagoshima y hacia registros coloquiales, en detrimento del japonés estándar formal.
- Idiomas no declarados formalmente: el soporte de japonés es una inferencia a partir del corpus, no una especificación del autor.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/Haruto7261/QwenC-SFT
- Japanese-Daily-Dialogue: https://huggingface.co/datasets/kan-bayashi/Japanese-Daily-Dialogue
- MACHAcorpus: https://github.com/tatsuya-koyama/MACHAcorpus
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- Corpus parlamentario: https://kokkai.ndl.go.jp/
- Aozora Bunko: https://www.aozora.gr.jp/
- Wikipedia en japonés: https://ja.wikipedia.org/
- Wikipedia (萨隅方言): https://ja.wikipedia.org/wiki/薩隅方言
- Instituto Nacional de Lengua Japonesa: https://www.ninjal.ac.jp/
