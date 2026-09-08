# mrangelov/MiLMMT-46-1B-v1-onnx

## Resumen

El repositorio `mrangelov/MiLMMT-46-1B-v1-onnx` contiene una conversión al formato ONNX del modelo MiLMMT-46-1B-v1.0, desarrollado por Xiaomi Research. MiLMMT-46-1B-v1.0 es un modelo de traducción automática basado en Gemma3-1B, entrenado para cubrir 46 idiomas. El objetivo de esta conversión es facilitar el despliegue del modelo en entornos que usan ONNX Runtime, sin necesidad de depender de la infraestructura original de transformadores.

El modelo original se entrenó en cuatro etapas: preentrenamiento continuo sobre 143 mil millones de tokens de datos monolingües y paralelos en 46 idiomas, ajuste supervisado, aprendizaje por refuerzo y una cuarta etapa no detallada en la documentación disponible. Este repositorio ONNX no aporta modificaciones al modelo, sino que es una exportación del checkpoint original, probablemente con pesos cuantizados dado el tamaño del repositorio (0,9 GB). La arquitectura subyacente es un Transformer de aproximadamente 1.000 millones de parámetros, con entrada exclusivamente de texto, tal como indica la etiqueta `gemma3_text`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma3-1B, text-only) |
| Parametros totales | Aproximadamente 1.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio no especifica la precision de los pesos) |
| Idiomas soportados | 46 idiomas según el modelo base MiLMMT-46-1B-v1.0 |
| Licencia | gemma |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo original MiLMMT-46-1B-v1.0 parte de Gemma3-1B y se entrena en un proceso de cuatro etapas. La primera etapa consiste en un preentrenamiento continuo con 143 mil millones de tokens que combinan datos monolingües y paralelos de 46 idiomas, lo que da lugar al modelo intermedio MiLMMT-46-1B-Pretrain. Después se aplica un ajuste supervisado que produce la versión v0.1, seguido de una fase de aprendizaje por refuerzo y una etapa final no descrita en la información disponible. El repositorio ONNX aquí documentado es una exportación de ese modelo final, sin cambios en la arquitectura ni en los pesos. No se documentan innovaciones técnicas adicionales en la conversión, que parece orientada únicamente a la inferencia mediante ONNX Runtime.

## Capacidades

- Traducción automática entre 46 idiomas, que es la capacidad principal documentada del modelo base.
- Generación de texto en los idiomas soportados, al tratarse de un modelo de lenguaje basado en Gemma3.
- Entrada exclusivamente de texto: la etiqueta `gemma3_text` indica que no hay capacidades de visión ni de audio.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso en la información proporcionada.
- Al estar en formato ONNX, el modelo puede ejecutarse en entornos multiplataforma mediante ONNX Runtime, lo que permite desplegarlo en aplicaciones escritas en Python, .NET, C++ y otros lenguajes compatibles.

## Casos de uso

- Traducción de documentos: el modelo puede utilizarse para traducir informes técnicos, manuales o contratos entre los 46 idiomas soportados, siendo adecuado por su base en Gemma3 y su entrenamiento específico en datos paralelos.
- Localización de software: integración en pipelines de traducción de cadenas de interfaz de usuario, donde el modelo puede generar traducciones consistentes entre el idioma de origen y los idiomas de destino.
- Subtitulación automática: el modelo puede traducir transcripciones de contenido audiovisual previamente extraídas mediante un sistema de reconocimiento de voz, generando subtítulos en varios idiomas.
- Atención al cliente multilingüe: desplegado en un backend, sirve como motor de traducción para mensajes de clientes en tiempo real, ayudando a agentes que atienden en un idioma distinto al del cliente.
- Sistema educativo de idiomas: aplicación para practicar traducción, ofrecer correcciones o generar ejercicios de traducción inversa entre pares de lenguas soportadas.
- Traducción en entornos de bajo coste: gracias al tamaño de aproximadamente 1B de parámetros y al formato ONNX, el modelo puede ejecutarse en CPU o en GPUs modestas, lo que permite desplegar soluciones de traducción en servidores económicos o en dispositivos de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como BLEU, COMET, MMLU o HumanEval para este repositorio ni para el modelo base en la documentación proporcionada.

## Requisitos de hardware

- No hay requisitos oficiales publicados para este repositorio.
- El tamaño del repositorio es de 0,9 GB, lo que sugiere que la conversión ONNX puede contener pesos cuantizados y podría ejecutarse con menos de 2 GB de VRAM o en CPU de gama media. Se trata de una estimación basada en el peso del archivo, no en una medición oficial.
- GPU recomendada de forma estimada: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1660 o RTX 3060, podría ser suficiente para inferencia básica sin necesidades de respuesta masiva.
- Opciones de despliegue: ONNX Runtime en Python, .NET, C++, o en aplicaciones web mediante servidores de inferencia compatibles con ONNX.
- No se conocen datos de latencia ni de throughput para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato |
|---|---|---|---|---|
| MiLMMT-46-1B-v1.0 | 1B | 46 | gemma | Safetensors (en el repositorio original) |
| MiLMMT-46-1B-v1-onnx (este repo) | 1B | 46 | gemma | ONNX |
| MiLMMT-46-1B-v0.1 | 1B | 46 | gemma | Safetensors |
| NLLB-200-distilled-1.3B | 1.3B | 200 | no disponible | no disponible |
| M2M-100-1.2B | 1.2B | 100 | no disponible | no disponible |

La comparativa se limita a parámetros, idiomas y licencia porque no se dispone de datos de rendimiento de ninguno de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La licencia Gemma impone restricciones de uso que deben revisarse antes de emplear el modelo en aplicaciones comerciales o en proyectos sensibles.
- El modelo hereda los sesgos presentes en Gemma3 y en los datos de entrenamiento de MiLMMT. Es posible que las traducciones reflejen sesgos lingüísticos o culturales no deseados.
- Existe riesgo de alucinación en las traducciones, especialmente en idiomas o dominios con menos representación en los datos de entrenamiento.
- El soporte de idiomas se limita a 46 lenguas, por lo que no cubre todos los idiomas del mundo ni variantes dialectales específicas.
- La longitud de contexto no está documentada, lo que impide conocer el tamaño máximo de los fragmentos de texto que puede procesar satisfactoriamente.
- Este repositorio ONNX ha sido publicado por un tercero (mrangelov), no por Xiaomi Research ni por Google. No tiene descargas ni likes en el momento de la consulta, lo que indica una ausencia de validación por parte de la comunidad.
- No se especifica si los pesos están cuantizados ni la precisión utilizada, lo que puede afectar a la calidad de las traducciones respecto al modelo original en punto flotante.

## Enlaces

- Repositorio ONNX: [mrangelov/MiLMMT-46-1B-v1-onnx](https://huggingface.co/mrangelov/MiLMMT-46-1B-v1-onnx)
- Modelo base: [xiaomi-research/MiLMMT-46-1B-v1.0](https://huggingface.co/xiaomi-research/MiLMMT-46-1B-v1.0)
- Versión anterior: [xiaomi-research/MiLMMT-46-1B-v0.1](https://huggingface.co/xiaomi-research/MiLMMT-46-1B-v0.1)
