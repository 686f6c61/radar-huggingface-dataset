# baronx16/wav2vec2-french-phonemizer-onnx

## Resumen

wav2vec2-french-phonemizer-onnx es una exportación a ONNX con cuantización de 4 bits del modelo Cnam-LMSSC/wav2vec2-french-phonemizer, publicado por el usuario baronx16. Su función no es la transcripción ortográfica al uso, sino la conversión de audio de habla francesa en una secuencia de fonemas IPA, con un carácter por token (las vocales nasales se representan como vocal más tilde combinable). Está pensado para ejecutarse en el navegador mediante transformers.js y se emplea, según la model card, para comprobar la pronunciación de palabras francesas sueltas por parte de estudiantes.

El modelo base es un wav2vec2 de Cnam (LMSSC) entrenado sobre Common Voice 13 en francés, con la cabeza CTC típica de los modelos de reconocimiento automático de voz. Esta variante no altera la arquitectura ni los datos de entrenamiento: solo cambia el formato de los pesos a ONNX y reduce la precisión a 4 bits para facilitar su despliegue en entornos web con recursos limitados.

Es relevante por su nicho concreto: la fonemización de voz a IPA en cliente, sin servidor, dentro de una aplicación de aprendizaje de idiomas. Con un repositorio de 0,1 GB y licencia MIT, es una pieza práctica para integrar retroalimentación de pronunciación en el navegador, aunque su alcance queda limitado al francés y a un uso especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 con cabeza CTC (AutoModelForCTC) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, ventana de entrada no especificada) |
| Tipos de cuantizacion | 4 bits (q4) en formato ONNX |
| Idiomas soportados | frances (fr) |
| Licencia | MIT |
| Formato de pesos | ONNX (exportación para transformers.js) |

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec2, un modelo de representación auto-supervisada de audio que en este caso se utiliza con una cabeza de clasificación CTC para alinear directamente la señal de voz con una secuencia de fonemas. La salida es una secuencia de caracteres IPA, un token por fonema, con las vocales nasales codificadas como vocal más tilde combinable. El modelo base fue entrenado por Cnam (LMSSC) sobre el corpus Common Voice 13 en francés.

Esta variante concreta no aporta entrenamiento adicional ni cambios en los datos: según la model card, el repositorio solo modifica el formato de archivo y la precisión de los pesos, exportando a ONNX y cuantizando a 4 bits para su uso con transformers.js. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO.

## Capacidades

- Reconocimiento automático de voz restringido a francés, con salida en fonemas IPA en lugar de texto ortográfico.
- Fonemización a nivel de palabra: la model card indica que está pensado para comprobar la pronunciación de palabras francesas sueltas.
- Ejecución en navegador mediante transformers.js con pesos ONNX cuantizados a 4 bits.
- Integración con el pipeline `automatic-speech-recognition` de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá del reconocimiento ni modo de pensamiento.
- Capacidad multilingüe: no disponible; solo se declara francés.
- No se documentan capacidades adicionales más allá de la fonemización de voz.

## Casos de uso

- Corrección de pronunciación en aplicaciones de aprendizaje de francés: el modelo convierte la grabación del estudiante en una secuencia IPA que puede compararse con la pronunciación de referencia de la palabra objetivo, todo dentro del navegador.
- Herramientas web sin backend de audio: al ejecutarse con transformers.js y pesos ONNX de 4 bits, permite ofrecer fonemización en cliente sin enviar grabaciones a un servidor, lo que reduce latencia y mejora la privacidad.
- Prototipado rápido de interfaces educativas: un desarrollador puede cargar el modelo con `AutoModelForCTC` y `AutoProcessor` y disponer de fonemas en pocas líneas de JavaScript para validar una idea de producto.
- Evaluación de ejercicios de vocabulario aislado: adecuado para actividades en las que el alumno pronuncia una palabra concreta y el sistema verifica la secuencia de fonemas producida.
- Investigación en fonética aplicada: útil para extraer transcripciones IPA de muestras cortas de habla francesa en experimentos que requieran un pipeline ligero y reproducible en el navegador.
- Demos y materiales docentes interactivos: al caber en un repositorio de 0,1 GB y funcionar en el cliente, se puede incrustar en páginas educativas sin infraestructura de inferencia dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB y los pesos están cuantizados a 4 bits, lo que sugiere un consumo de memoria muy reducido.
- GPU recomendadas: no disponible; el modelo está orientado a ejecución en navegador mediante transformers.js, no a despliegues en GPU de centro de datos.
- Compatibilidad con GPU de consumo: no se documenta; por tamaño y cuantización es plausible su ejecución en hardware modesto, pero no hay datos oficiales.
- Opciones de despliegue: transformers.js en el navegador; al ser ONNX, podría ejecutarse con runtimes compatibles con ONNX, aunque no se documentan otras vías.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| baronx16/wav2vec2-french-phonemizer-onnx | no disponible | no disponible | fr | MIT | ONNX (q4) | Exportación para transformers.js; salida en fonemas IPA |
| Cnam-LMSSC/wav2vec2-french-phonemizer | no disponible | no disponible | fr | MIT | no disponible | Modelo base original; salida en fonemas IPA |
| wav2vec2-base-960h (referencia ASR) | no disponible en la informacion | no disponible | en | no disponible en la informacion | no disponible | ASR ortográfico en inglés, no fonemización |

## Limitaciones y advertencias

- Ámbito lingüístico restringido al francés; no se declara soporte de otros idiomas.
- Diseñado para palabras sueltas según la model card; su comportamiento en habla continua o frases largas no está documentado.
- La cuantización a 4 bits puede introducir pérdida de precisión respecto al modelo base original; no se han publicado métricas que cuantifiquen esa degradación.
- Riesgo de alucinación o de fonemización incorrecta en audio con ruido, acentos no representados en Common Voice 13 o solapamiento de habla; no se documentan evaluaciones al respecto.
- No se documentan sesgos específicos; al entrenarse sobre Common Voice 13 en francés, puede heredar los sesgos de cobertura y acento de ese corpus.
- Licencia MIT, lo que permite uso comercial, pero se recomienda conservar la atribución a los autores originales de Cnam (LMSSC), tal como indica la model card.
- Para producción en navegador conviene validar el tamaño real de descarga y el tiempo de carga del modelo ONNX, datos no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baronx16/wav2vec2-french-phonemizer-onnx
- Modelo base: https://huggingface.co/Cnam-LMSSC/wav2vec2-french-phonemizer
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
