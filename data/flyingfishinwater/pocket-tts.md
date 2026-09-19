# flyingfishinwater/pocket-tts

## Resumen

flyingfishinwater/pocket-tts es una conversión del modelo de síntesis de voz kyutai/pocket-tts al formato MLX para su uso con la librería mlx-audio, publicada por el usuario flyingfishinwater. Se trata de un modelo texto-a-voz (TTS) de aproximadamente 118 millones de parámetros (117.856.962 según los pesos en safetensors), distribuido bajo licencia CC-BY-4.0 y limitado al idioma inglés. No es un modelo de lenguaje generativo: su función es convertir texto escrito en audio hablado.

El interés principal de esta publicación es su tamaño reducido y su orientación a hardware de Apple: al estar convertido para MLX, puede ejecutarse de forma local en Macs con Apple Silicon (y potencialmente en dispositivos iOS compatibles con MLX) sin necesidad de GPU dedicada ni de servicios en la nube, lo que resulta atractivo para aplicaciones de privacidad, prototipado rápido y despliegue en el borde.

Ahora bien, la información disponible es mínima: la model card se limita a indicar que se trata de una conversión para mlx-audio y remite al modelo original. No hay pipeline declarado, no hay resultados de benchmarks, no se documentan datos de entrenamiento y el repositorio no registra descargas ni valoraciones. Cualquier evaluación de calidad, arquitectura interna o comportamiento multilingüe debe considerarse no verificada con la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz texto-a-habla; la model card no describe la arquitectura interna) |
| Parametros totales | 117.856.962 (~118 M), dato extraído de los pesos en safetensors |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (convertidos para mlx-audio / MLX) |
| Modelo base | kyutai/pocket-tts |
| Naturaleza del repositorio | conversión de formato (finetune/convert), no entrenamiento desde cero |
| Tamaño del repositorio | 0,2 GB |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos HF) | 2026-09-18 |

## Arquitectura y entrenamiento

La model card no proporciona ninguna descripción de la arquitectura: no se especifica si se trata de un transformer autorregresivo sobre códigos de audio, de un modelo acústico tipo VITS, de un esquema de codec neural más modelo de lenguaje, ni de una arquitectura híbrida. Tampoco se detalla el vocoder, la frecuencia de muestreo de salida, el tamaño del códec de audio ni el tipo de representación intermedia. El dato disponible es únicamente el recuento de parámetros (117,8 M) y el hecho de que el modelo base es kyutai/pocket-tts, desarrollado por el laboratorio francés Kyutai. Nota: Kyutai ha publicado otros sistemas TTS basados en códecs neuronales y modelado autorregresivo, pero no hay confirmación de que pocket-tts siga ese mismo esquema, por lo que no debe asumirse.

Respecto al entrenamiento, no se dispone de información sobre el número de tokens o horas de audio utilizadas, la composición del corpus, el idioma de los datos más allá de la etiqueta "en", ni sobre si hubo etapas de ajuste con preferencias humanas (RLHF/DPO) o ajuste fino supervisado. El repositorio analizado es una conversión de pesos para mlx-audio, no un entrenamiento nuevo; el autor no documenta ninguna innovación técnica propia más allá de la conversión de formato. Cualquier afirmación sobre el proceso de entrenamiento del modelo base debe consultarse en la model card de kyutai/pocket-tts, que no forma parte de la información proporcionada.

## Capacidades

- Síntesis de voz a partir de texto en inglés (text-to-speech).
- Ejecución local sobre Apple Silicon mediante la librería mlx-audio, sin dependencia de APIs externas.
- Tamaño reducido (~118 M de parámetros), adecuado para entornos con recursos limitados.
- Conversión de pesos en safetensors, compatible con el ecosistema MLX.
- No dispone de generación de texto, razonamiento, código ni matemáticas: es un modelo especializado exclusivamente en audio.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo TTS).
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; la etiqueta de idioma declarada es únicamente "en".
- Capacidades especiales (modo de razonamiento, visión, audio de entrada, clonación de voz, control de estilo o emoción): no disponible, no documentadas en la información proporcionada.

## Casos de uso

- Lectura de documentos en local sobre macOS: el modelo permite convertir artículos, informes o documentación en inglés a audio directamente en un Mac con Apple Silicon, sin enviar el texto a servidores externos, lo que resulta adecuado cuando el contenido es confidencial.
- Accesibilidad y lectores de pantalla: integrado en utilidades de escritorio, puede narrar en voz alta contenido web o correos en inglés para usuarios con discapacidad visual, aprovechando su reducido consumo de memoria para mantener la aplicación ligera.
- Audiolibros y pódcast generados: para textos largos en inglés, se puede trocear el contenido en fragmentos y sintetizar secuencialmente cada uno, concatenando el audio resultante; el tamaño del modelo (~118 M) permite hacerlo en un portátil sin GPU dedicada.
- Prototipado de asistentes de voz: sirve como motor TTS de bajo coste durante el desarrollo de asistentes conversacionales en inglés, permitiendo iterar en la cadena texto-respuesta-voz sin depender de servicios de pago.
- Aumentación de datos para ASR: generar corpus sintéticos de audio en inglés a partir de transcripciones existentes para ampliar datasets de entrenamiento o evaluación de sistemas de reconocimiento de voz, con la ventaja de ejecutarse íntegramente en local.
- Notificaciones y avisos hablados en aplicaciones macOS/iOS: al estar convertido para MLX, puede embeberse en aplicaciones de Apple para leer alertas, estados de procesos o mensajes del sistema sin conexión a internet.
- Pruebas de regresión en pipelines de audio: usar el modelo como componente determinista en tests automatizados que verifiquen la generación de audio (duración, formato, ausencia de silencios anómalos) antes de pasar a un motor TTS de producción.
- Ajuste fino posterior sobre dominio específico: con ~118 M de parámetros, es viable reentrenar o adaptar los pesos en un único equipo para vocabularios técnicos (medicina, legal) en inglés, siempre que la licencia CC-BY-4.0 y la del modelo base lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas subjetivas (MOS) ni objetivas (WER del texto sintetizado, similitud de hablante, latencia), y la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo (los resultados obtenidos correspondían a contenidos sin relación alguna con él).

## Requisitos de hardware

- Estimación de memoria de pesos (sin incluir buffers del runtime ni del códec de audio): ~0,47 GB en fp32, ~0,24 GB en fp16/bf16, ~0,12 GB en int8 y ~0,06 GB en int4. Son cálculos aritméticos a partir del recuento de parámetros, no cifras publicadas por el autor.
- VRAM estimada para inferencia: no disponible como dato medido. Con los pesos en bf16 y el overhead típico de un runtime TTS, es razonable esperar un consumo del orden de centenares de megabytes, pero no hay confirmación oficial.
- GPU recomendadas: el repositorio está orientado a MLX, por lo que el hardware objetivo son los chips de Apple (series M1, M2, M3 y M4). No se documenta soporte para CUDA.
- Cabe en GPU de consumo: al tratarse de una conversión MLX, el caso natural es ejecutarlo en un Mac con Apple Silicon, incluidos modelos con memoria unificada de 8 GB; también podría ejecutarse en GPU de consumo si se realizara una conversión a otro runtime, algo no documentado.
- Opciones de despliegue: mlx-audio (https://github.com/Blaizzy/mlx-audio) es la vía indicada explícitamente. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI, ONNX Runtime ni TensorRT, y estos runtimes no suelen soportar modelos TTS de este tipo sin adaptaciones específicas.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tiempo real (RTF), latencia de primera muestra ni streaming.

## Comparativa con modelos similares

Los datos de esta tabla proceden de referencias públicas generales sobre cada modelo, no de la información proporcionada para este repositorio; deben verificarse en las fichas oficiales antes de tomar decisiones.

| Modelo | Parametros | Idiomas | Licencia | Contexto/runtime | Notas |
|---|---|---|---|---|---|
| flyingfishinwater/pocket-tts | ~118 M | en | cc-by-4.0 | MLX (mlx-audio) | Conversión no oficial, sin benchmarks ni descargas |
| kyutai/pocket-tts (base) | no disponible | en | no disponible en esta ficha | no disponible | Modelo original del que deriva esta conversión |
| Kokoro-82M | ~82 M | en y otros | Apache-2.0 | PyTorch/ONNX | Referencia habitual en TTS ligero; licencia permisiva |
| XTTS-v2 (Coqui) | ~467 M | multilingüe | Coqui Public Model License | PyTorch | Incluye clonación de voz; licencia restrictiva para uso comercial |
| Piper (basado en VITS) | decenas de millones según voz | multilingüe | MIT | ONNX/Raspberry Pi | Optimizado para dispositivos de bajos recursos |
| Parler-TTS mini | ~880 M | en | Apache-2.0 | PyTorch | Control mediante descripción textual de la voz |

## Limitaciones y advertencias

- Model card prácticamente vacía: no describe arquitectura, datos de entrenamiento, muestreo de audio ni formato de salida, lo que dificulta evaluar su idoneidad para producción.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y sin resultados relevantes en la búsqueda web.
- Conversión no oficial: el autor del repositorio no es Kyutai, por lo que puede haber divergencias de comportamiento o de calidad respecto al modelo original kyutai/pocket-tts.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución al autor y la indicación de cambios. Además, la licencia del modelo base podría imponer condiciones adicionales que deben comprobarse en su propia ficha.
- Idioma único: solo inglés declarado. No hay garantía de pronunciación aceptable en castellano ni en otros idiomas.
- Sesgos no documentados: al no describirse el corpus de entrenamiento, se desconocen los sesgos de acento, género, edad o variedad dialectal de las voces generadas.
- Riesgo de artefactos de audio: en modelos TTS pequeños son frecuentes las pronunciaciones incorrectas, los cortes, los silencios anómalos y, en entradas muy largas o fuera de dominio, la generación de audio incoherente. No hay métricas que permitan cuantificar este riesgo en este repositorio.
- Dependencia de plataforma: el uso previsto con MLX restringe el despliegue a hardware Apple; no se documentan alternativas para entornos Linux con CUDA.
- Ausencia de benchmarks: no hay MOS, WER ni latencias publicadas, por lo que cualquier comparación con otros motores TTS es especulativa.
- Sin soporte declarado de streaming ni de clonación de voz: no debe asumirse ninguna de estas capacidades.
- Fechas de metadatos inconsistentes con un uso real: el repositorio figura creado y actualizado el 2026-09-18, con ausencia total de actividad posterior documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flyingfishinwater/pocket-tts
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Librería de destino: https://github.com/Blaizzy/mlx-audio
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Paper, blog o demo del autor: no disponible en la información proporcionada.
- Resultados de búsqueda web: no se encontró ningún enlace relevante sobre este modelo.
