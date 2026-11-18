# chmjkb/runntime-whisper

## Resumen

runntime-whisper es un reempaquetado de los pesos de openai/whisper-small, el modelo de reconocimiento automático del habla (ASR) de OpenAI, preparado por el desarrollador chmjkb para su uso con runntime, un runtime que ejecuta modelos en la GPU del navegador mediante WebGPU. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los originales de Whisper small, únicamente convertidos a f16 y cuantizados a int8, y reorganizados en una estructura de directorios que el loader de runntime espera encontrar.

El modelo resuelve un problema muy concreto: permitir transcripción de voz multilingüe directamente en el cliente, sin enviar audio a un servidor. Whisper small es un transformer encoder-decoder de aproximadamente 244 millones de parámetros, con una ventana de contexto de audio de 30 segundos por segmento, y soporta siete idiomas en este empaquetado: inglés, alemán, francés, español, italiano, polaco y portugués.

Su relevancia actual radica en la combinación de un modelo ASR consolidado con un runtime WebGPU: el repositorio ocupa 0,8 GB e incluye dos variantes (int8 de 298 MB y f16 de 484 MB), lo que hace viable la inferencia local en navegador para aplicaciones de dictado, subtitulado o accesibilidad. La licencia Apache 2.0, heredada del modelo original, facilita su integración comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parámetros totales | no disponible (el modelo base Whisper small tiene ~244 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento en Whisper) |
| Tipos de cuantización | f16 e int8 (grupos de 32 entradas, escala f16 por grupo) |
| Idiomas soportados | en, de, fr, es, it, pl, pt |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (layout `<size>/<precision>/model.safetensors`), tokenizer.json en la raíz |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small: un transformer encoder-decoder con atención completa, entrenado por OpenAI para transcripción y traducción de voz. El encoder procesa espectrogramas mel de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. Este repositorio no introduce cambios arquitectónicos ni de entrenamiento.

El autor declara explícitamente que no se ha reentrenado ni ajustado ningún peso. Las modificaciones son puramente de formato: conversión de todos los tensores de f32 a f16 en la variante f16, y cuantización int8 de las capas lineales en la variante int8 (con embeddings de token y posición y convoluciones mantenidos en f16). El reempaquetado se realizó el 18 de noviembre de 2026 con la herramienta `runntime quantize --bits 8 --f16`. Según la model card, la variante f16 reproduce token a token las transcripciones de transformers en 17 clips de prueba en los siete idiomas, mientras que la int8 coincide exactamente en 15 de 17 clips, con diferencias de dos comas y una palabra en los dos restantes.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, alemán, francés, español, italiano, polaco y portugués.
- Transcripción de audio en segmentos de 30 segundos, con decodificación greedy.
- Ejecución en la GPU del navegador mediante WebGPU a través del runtime runntime.
- Inferencia local en el cliente, sin necesidad de backend de servidor para el cómputo del modelo.
- Dos niveles de precisión seleccionables (int8 y f16) con distinto equilibrio entre tamaño y fidelidad.
- No se documentan capacidades de tool calling, agentes, visión, audio en tiempo real ni modo de razonamiento extendido.

## Casos de uso

- Dictado por voz en aplicaciones web: integración del modelo int8 (298 MB) en un editor o formulario para transcribir voz a texto directamente en el navegador, sin enviar audio a servidores externos.
- Subtitulado de vídeo en cliente: procesar pistas de audio por segmentos de 30 segundos con WebGPU y generar subtítulos en los siete idiomas soportados dentro de una aplicación web de edición.
- Accesibilidad en tiempo real (con latencia de segmento): transcripción de conversaciones o reuniones en herramientas web para personas con discapacidad auditiva, manteniendo el audio en el dispositivo.
- Notas de reuniones locales: captura y transcripción de audio en aplicaciones de productividad que priorizan la privacidad, ya que el procesamiento ocurre en la GPU del usuario.
- Prototipado e investigación en ASR en navegador: banco de pruebas para comparar la fidelidad de las variantes int8 y f16 frente a transformers con los mismos clips.
- Aplicaciones educativas de idiomas: transcripción de pronunciación del alumno en inglés, francés, alemán, español, italiano, polaco o portugués para ejercicios de evaluación automática.
- Demos y herramientas sin infraestructura: despliegue de una demo de transcripción como sitio estático, aprovechando que los pesos se cargan desde el repositorio y se ejecutan en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una comparación cualitativa de fidelidad frente a Hugging Face transformers sobre 17 clips de prueba: coincidencia token a token en f16 y coincidencia en 15 de 17 clips en int8.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,8 GB e incluye variantes de 298 MB (int8) y 484 MB (f16), que son las cifras de descarga de pesos.
- GPU recomendadas: no disponible; el requisito funcional es un navegador con soporte de WebGPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende del soporte WebGPU del navegador y del hardware del usuario.
- Opciones de despliegue: runntime (runtime WebGPU en navegador). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Ejecución |
|---|---|---|---|---|---|
| runntime-whisper (este) | ~244 M (Whisper small) | en, de, fr, es, it, pl, pt | safetensors f16/int8 para runntime | apache-2.0 | WebGPU en navegador |
| openai/whisper-small | ~244 M | multilingüe (upstream) | safetensors/PyTorch | apache-2.0 | Servidor/GPU con transformers |
| openai/whisper-base | ~74 M | multilingüe (upstream) | safetensors/PyTorch | apache-2.0 | Servidor/GPU con transformers |
| openai/whisper-medium | ~769 M | multilingüe (upstream) | safetensors/PyTorch | apache-2.0 | Servidor/GPU con transformers |

La comparación con whisper-base y whisper-medium se basa en datos públicos de los modelos upstream de OpenAI; no se dispone de cifras de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es un reempaquetado, no un modelo entrenado: hereda todos los sesgos y limitaciones de Whisper small, incluidos los sesgos de transcripción del corpus original de OpenAI.
- Riesgo de alucinación: Whisper puede generar texto plausible en segmentos con silencio, ruido o audio de baja calidad; la model card no documenta mitigaciones específicas.
- La cuantización int8 introduce divergencias menores: en 2 de 17 clips de prueba se observaron diferencias de dos comas y una palabra respecto a transformers.
- Cobertura lingüística limitada a siete idiomas; no se garantiza comportamiento en otros.
- Dependencia de WebGPU: sin soporte del navegador o de la GPU, el modelo no puede ejecutarse con este runtime.
- No se documentan requisitos mínimos de hardware ni latencias, por lo que la viabilidad en producción debe validarse empíricamente.
- Licencia Apache 2.0 heredada de openai/whisper-small, que permite uso comercial; debe conservarse el texto de la licencia incluido en el repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chmjkb/runntime-whisper
- Modelo base upstream: https://huggingface.co/openai/whisper-small
- Runtime runntime: https://github.com/software-mansion/runntime
- Rama de runntime con Whisper: https://github.com/chmjkb/runntime/tree/@chmjkb/whisper-small
