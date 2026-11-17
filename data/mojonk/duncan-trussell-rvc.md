# mojonk/duncan-trussell-rvc

## Resumen

Duncan Trussell voice model es un modelo de conversión de voz (voice conversion, no text-to-speech) entrenado con la arquitectura RVC v2 (Retrieval-based Voice Conversion) a una frecuencia de muestreo de 40 kHz. Lo publica el usuario mojonk bajo el identificador `mojonk/duncan-trussell-rvc` y está pensado para transformar una señal de voz de entrada en la voz clonada del comediante y podcaster Duncan Trussell. No es un modelo de lenguaje: no genera texto ni razona, sino que aplica una transformación timbral sobre audio existente.

El repositorio es de tamaño reducido (0,1 GB) y contiene, según la model card, un fichero de pesos en formato `.pth` y su índice de características `.index`, que es el artefacto estándar de RVC para la recuperación de embeddings de voz (retrieval). El entrenamiento se realizó en una GPU A40 alquilada en RunPod durante noviembre de 2026, con un dataset de 84,7 minutos de audio y 120 épocas.

Su relevancia es acotada y de nicho: se trata de un artefacto comunitario sin métricas publicadas, sin pipeline declarado en Hugging Face y con cero descargas en el momento de la consulta. Es útil para quien quiera experimentar con clonación de voz mediante RVC v2 y disponga ya de la cadena de herramientas (checkpoint `.pth` + índice `.index` + extractor de pitch RMVPE). No debe confundirse con un modelo fundacional ni con un sistema de síntesis de voz completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion), conversión de voz sobre audio de entrada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible; el artefacto distribuido es un checkpoint `.pth` (PyTorch) |
| Idiomas soportados | no disponible (el modelo transforma timbre, no texto; el idioma depende del audio de entrada) |
| Licencia | other (sin texto de licencia detallado en la información disponible) |
| Formato de pesos | `.pth` (PyTorch) + `.index` (índice de características), empaquetados en un zip |
| Frecuencia de muestreo | 40 kHz (RVC v2 40k) |
| Dataset de entrenamiento | 84,7 minutos de audio de Duncan Trussell |
| Epocas de entrenamiento | 120 |
| Hardware de entrenamiento | NVIDIA A40 (RunPod) |
| Ajustes recomendados | pitch 0, protect 0.33, seguimiento de pitch RMVPE |

## Arquitectura y entrenamiento

RVC v2 es una arquitectura de conversión de voz que combina un codificador de contenido (típicamente HuBERT o ContentVec) con un decoder generativo y un mecanismo de retrieval sobre un índice de embeddings de la voz objetivo. El flujo habitual es: extraer características de contenido del audio fuente, recuperar vecinos cercanos en el índice `.index` de la voz de destino, y decodificar el resultado con el checkpoint `.pth` para obtener el timbre clonado. El modelo se distribuye a 40 kHz, lo que sitúa la salida por encima de los 32k/40k típicos de RVC v2 y permite mayor fidelidad en agudos.

Los datos de entrenamiento consisten en 84,7 minutos de habla de Duncan Trussell, un volumen moderado para clonación de voz (los datasets de referencia suelen ir de 10 minutos a varias horas). Se entrenaron 120 épocas en una A40, un cómputo modesto y coherente con un artefacto comunitario. La model card no documenta composición del dataset, limpieza, ni si hubo aumentación de datos. No se menciona RLHF, DPO ni ningún proceso de alineación, algo esperable en un modelo de conversión de voz.

La innovación técnica destacable es el propio mecanismo de retrieval de RVC, que ancla la salida a embeddings reales de la voz objetivo y reduce el desvío tímbrico respecto a métodos puramente generativos. Los parámetros de inferencia recomendados por el autor (pitch 0, protect 0.33, RMVPE) son los que, según su experiencia, producen resultados utilizables.

## Capacidades

- Conversión de voz (voice conversion): transforma una señal de audio de entrada en la voz clonada de Duncan Trussell.
- Clonación de timbre con retrieval: usa el índice `.index` para recuperar embeddings de la voz objetivo y mejorar la similitud.
- Seguimiento de pitch mediante RMVPE, lo que permite conservar la entonación del audio fuente.
- Control de pitch desplazable (el autor recomienda 0 para este modelo).
- Parámetro `protect` para preservar consonantes y reducir artefactos (valor recomendado 0.33).
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un sistema text-to-speech: requiere audio de entrada, no texto.
- Capacidades multilingües: no aplica; el modelo no procesa idioma, solo timbre.

## Casos de uso

- Doblaje y parodia de voz: usar el modelo para transformar una locución propia en la voz de Duncan Trussell en sketches o contenido satírico, siempre que se respeten los derechos de imagen y voz del titular.
- Podcasting experimental: convertir una grabación de prueba en la voz clonada para evaluar si encaja en un formato de entrevista o monólogo, dado que el dataset de 84,7 minutos cubre registro conversacional.
- Investigación en conversión de voz: emplear el checkpoint como caso de estudio de RVC v2 a 40 kHz para medir similitud tímbrica y naturalidad con RMVPE y distintos valores de `protect`.
- Pruebas de pipelines de audio: integrar el `.pth` y el `.index` en un flujo RVC existente para validar latencia, calidad y estabilidad en una GPU consumer antes de entrenar modelos propios.
- Docencia y divulgación: demostrar en un taller cómo funciona el retrieval de RVC y por qué el índice `.index` afecta a la similitud de la voz clonada.
- Generación de contenido creativo con voz sintética: producir audios para vídeos, animaciones o memes, con la advertencia de que la voz clonada de una persona real exige consentimiento y puede estar sujeta a restricciones legales.
- Comparación de ajustes de inferencia: usar el modelo como banco de pruebas para comparar pitch 0 frente a otros valores y protect 0.33 frente a otros umbrales, ya que el autor documenta explícitamente esos ajustes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repo pesa 0,1 GB, lo que sugiere un checkpoint pequeño, pero no se documenta el consumo real.
- GPU recomendadas: el autor entrenó en una NVIDIA A40; para inferencia RVC v2 suele bastar una GPU consumer, aunque no hay datos específicos de este modelo.
- ¿Cabe en GPU consumer? No confirmado en la información disponible; por el tamaño del artefacto (0,1 GB) es plausible, pero no se aporta evidencia.
- Opciones de despliegue: cadena RVC (checkpoint `.pth` + índice `.index`) con extractor de pitch RMVPE; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de voz.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mojonk/duncan-trussell-rvc | RVC v2, conversión de voz | 40 kHz | 84,7 min, 120 épocas | other | Hugging Face, 0 descargas |
| Otros checkpoints RVC v2 de la comunidad | RVC v2, conversión de voz | 32k/40k según caso | variable | variable | Hugging Face, amplia disponibilidad |
| Modelos TTS neuronales (p. ej. VITS, XTTS) | Síntesis texto-a-voz | 22-24 kHz típico | corpus multihablante | variable | Hugging Face / repos |

La comparación directa con alternativas concretas no está disponible en la información proporcionada; los modelos TTS no son equivalentes porque generan voz desde texto, mientras que este modelo transforma audio existente.

## Limitaciones y advertencias

- Licencia "other" sin texto detallado: no se especifican condiciones de uso comercial, atribución ni restricciones, lo que impide evaluar su viabilidad en producción.
- Voz de una persona real: clonar la voz de Duncan Trussell puede vulnerar derechos de imagen y voz, y estar sujeto a normativa de deepfakes; se requiere consentimiento explícito.
- Sin métricas de calidad: no hay benchmarks de similitud, naturalidad ni inteligibilidad, por lo que la calidad es una incógnita objetiva.
- Dataset pequeño y no documentado: 84,7 minutos sin información sobre limpieza, ruido o variedad de registro; puede generalizar mal fuera del dominio de entrenamiento.
- Riesgo de artefactos: la conversión de voz puede introducir ruidos, inestabilidad en pitch y pérdida de consonantes, especialmente con `protect` mal ajustado.
- Ajustes sensibles: el autor recomienda pitch 0, protect 0.33 y RMVPE; otros valores pueden degradar el resultado sin garantía.
- Sin pipeline declarado en Hugging Face: no hay demo ni API alojada; el usuario debe montar la cadena RVC por su cuenta.
- Cero descargas y cero likes: sin validación comunitaria que respalde su funcionamiento.
- No es un modelo de lenguaje: no debe evaluarse con MMLU, HumanEval ni GSM8K, y no sirve para tareas de texto.
- Fecha de creación futura (2026-11-16): metadato a verificar, ya que puede indicar un artefacto generado o una fecha mal registrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mojonk/duncan-trussell-rvc
- Repositorio RVC (Retrieval-based Voice Conversion): no disponible en la información proporcionada
- Paper de RVC: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
