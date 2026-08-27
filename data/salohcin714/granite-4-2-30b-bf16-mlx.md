# salohcin714/granite-4.2-30b-bf16-mlx

## Resumen

El modelo `salohcin714/granite-4.2-30b-bf16-mlx` es una conversión no oficial del modelo IBM Granite 4.2 30B al formato MLX, realizada por el usuario salohcin714 mediante la librería `mlx-lm` 0.31.3. El modelo original, desarrollado por IBM, pertenece a la familia Granite 4.2, que introduce capacidades nativas de razonamiento (thinking) mediante cadenas de pensamiento paso a paso antes de generar la respuesta final. Esta conversión mantiene los pesos en precisión bfloat16 sin cuantizar, lo que la hace adecuada para ejecutarse en hardware Apple Silicon con memoria unificada suficiente.

La relevancia de esta conversión radica en que permite a desarrolladores e investigadores que trabajan con Macs equipadas con chips M-series ejecutar un modelo de razonamiento de 30B parámetros sin necesidad de recurrir a servicios en la nube o GPUs dedicadas. Al tratarse de una conversión puramente técnica, no se ha realizado ningún fine-tuning adicional, por lo que las capacidades del modelo base se conservan íntegramente. El modelo soporta 12 idiomas, incluido el español, y está licenciado bajo Apache 2.0, lo que facilita su uso comercial y su integración en aplicaciones propias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Granite 4.2) |
| Parametros totales | 29.276.770.304 (29,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (sin cuantizar) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout MLX) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 30B es un transformer decoder-only denso, post-entrenado a partir de los modelos base Granite 4.1. IBM ha introducido en esta versión capacidades nativas de razonamiento: el modelo genera una cadena de pensamiento interna antes de producir la respuesta final, lo que mejora su rendimiento en tareas que requieren lógica, matemáticas o análisis multi-paso. No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición exacta del dataset en la documentación consultada.

La conversión a MLX realizada por salohcin714 no añade ningún tipo de entrenamiento adicional. Se han convertido los pesos originales de bfloat16 al formato safetensors de MLX, eliminando el `lm_head` redundante cuando las embeddings de entrada y salida están atadas. El resultado es un modelo funcionalmente idéntico al original, pero optimizado para la inferencia en Apple Silicon mediante la librería `mlx-lm`.

## Capacidades

- Generación de texto y conversación multi-turno con soporte de plantillas de chat.
- Razonamiento nativo paso a paso (thinking mode) para tareas complejas de lógica, matemáticas y análisis.
- Generación de código en diversos lenguajes de programación, gracias a las capacidades del modelo base Granite 4.2.
- Comprensión y generación multilingüe en 12 idiomas, incluyendo español, inglés, francés, alemán, japonés, chino, entre otros.
- Soporte de tool calling y function calling: aunque no se menciona explícitamente en la documentación de esta conversión, el modelo base Granite 4.2 incluye esta capacidad; se recomienda verificar la documentación oficial de IBM para confirmar su disponibilidad.
- No se especifican capacidades de visión, audio u otras modalidades; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente de programación local en macOS: un desarrollador puede integrar este modelo en su entorno de desarrollo mediante `mlx-lm` para obtener sugerencias de código, explicaciones y refactorizaciones sin depender de servicios externos, aprovechando la memoria unificada de los chips M-series.
- Tutoría y educación personalizada: el modelo puede actuar como tutor en materias como matemáticas, física o lógica, mostrando su razonamiento paso a paso para que el estudiante comprenda el proceso de resolución.
- Análisis de documentos multilingües: gracias a su soporte de 12 idiomas, puede resumir, traducir o extraer información de documentos en varios idiomas, útil para empresas con operaciones internacionales.
- Generación de informes y redacción técnica: el modelo puede redactar informes, correos electrónicos o documentación técnica en español u otros idiomas, manteniendo un tono profesional y coherente.
- Chatbot de atención al cliente: con su capacidad conversacional y de razonamiento, puede gestionar consultas complejas de clientes, derivando a un agente humano cuando sea necesario.
- Prototipado rápido de aplicaciones de IA generativa: los investigadores pueden utilizar esta conversión MLX para probar ideas y validar hipótesis en hardware local antes de escalar a entornos de producción con GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión MLX. Los benchmarks publicados por IBM para el modelo Granite 4.2 30B original (por ejemplo, en tareas como MMLU, HumanEval o GSM8K) se refieren a los pesos originales y no son directamente aplicables a este artefacto convertido, tal y como advierte el autor en la model card. Se recomienda consultar la documentación oficial de IBM para conocer el rendimiento del modelo base, pero no se dispone de datos numéricos verificables en la información proporcionada.

## Requisitos de hardware

- Esta conversión está diseñada para ejecutarse en Apple Silicon (chips M-series) mediante la librería `mlx-lm`.
- El tamaño del repositorio es de 58,6 GB, correspondiente a los pesos en bfloat16. Para cargar el modelo en memoria se requiere una Mac con al menos 64 GB de memoria unificada, aunque se recomienda 96 GB o más para dejar margen al contexto y a la inferencia.
- No es adecuado para GPUs NVIDIA o AMD sin una conversión adicional a otros formatos (por ejemplo, GGUF o FP16), ya que el layout MLX es específico de Apple.
- Opciones de despliegue: principalmente `mlx-lm` (Python). También es posible utilizar otras herramientas que soporten el formato MLX, aunque no se han documentado alternativas en la información proporcionada.
- La latencia y el throughput dependen del modelo exacto de chip M-series; no se dispone de mediciones publicadas para esta conversión concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| salohcin714/granite-4.2-30b-bf16-mlx | 29,3B | No disponible | Apache 2.0 | MLX safetensors (bf16) | Conversión no oficial, sin cuantizar |
| nightmedia/granite-4.2-30b-mxfp8-mlx | 29,3B | No disponible | Apache 2.0 | MLX safetensors (mxfp8) | Conversión con cuantización mxfp8, menor tamaño |
| salohcin714/granite-4.1-30b-bf16-mlx | 29,3B | No disponible | Apache 2.0 | MLX safetensors (bf16) | Versión anterior (Granite 4.1), sin razonamiento nativo |
| ibm-granite/granite-4.2-30b (original) | 29,3B | No disponible | Apache 2.0 | safetensors (bf16) | Modelo oficial de IBM, requiere GPUs o CPU |

La comparativa se limita a las conversiones MLX disponibles y al modelo original. No se dispone de datos de contexto ni de benchmarks para realizar una comparación cuantitativa.

## Limitaciones y advertencias

- Esta conversión no está afiliada ni respaldada por IBM; se trata de un artefacto de terceros que utiliza la marca Granite de forma descriptiva.
- Los benchmarks publicados por IBM se refieren al modelo original y no deben interpretarse como resultados de esta conversión; el rendimiento puede variar debido a diferencias en el entorno de ejecución y la precisión.
- El modelo requiere una cantidad considerable de memoria unificada (más de 64 GB), lo que limita su uso a las Macs de gama alta con chips M-series Pro, Max o Ultra.
- Al ser un modelo de lenguaje, puede presentar sesgos presentes en los datos de entrenamiento originales, así como generar alucinaciones o información incorrecta en contextos ambiguos.
- La longitud de contexto no se ha especificado en la documentación disponible; se recomienda consultar la documentación oficial de IBM para conocer el límite real antes de usarlo en aplicaciones que requieran ventanas largas.
- No se ha realizado ningún fine-tuning específico para esta conversión, por lo que las capacidades de tool calling o agentes dependen de las del modelo base y deben verificarse experimentalmente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-30b-bf16-mlx
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-4.2-30b
- Documentación oficial de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de IBM Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Conversión alternativa en mxfp8: https://huggingface.co/nightmedia/granite-4.2-30b-mxfp8-mlx
