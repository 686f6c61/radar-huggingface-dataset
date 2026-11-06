# cstr/openvoice2-tcc-GGUF

## Resumen

`cstr/openvoice2-tcc-GGUF` es una conversión a formato GGUF del convertidor de tono y color (tone-color converter, TCC) del modelo OpenVoice V2 de MyShell. No se trata de un motor de síntesis de voz completo, sino de una pieza concreta del pipeline de clonación de voz: el módulo que transforma el timbre de una locución manteniendo su contenido prosódico y fonético. El autor de la conversión es el usuario `cstr`, y el checkpoint está pensado para ejecutarse con CrispASR v0.8.48 o superior.

El modelo base, OpenVoice V2, es un sistema de conversión de voz que combina un codificador de referencia, un codificador posterior, flujos normalizadores y un vocoder. Esta conversión conserva en F32 los tensores sensibles a precisión (codificador de referencia, codificador posterior, flujos y tensores unidimensionales) y rebaja a F16 el resto de tensores del decodificador, con la normalización de pesos fusionada. El resultado es un fichero de unos 102 MB que ocupa una fracción del espacio del checkpoint original.

Su relevancia es acotada pero clara: permite integrar la etapa de conversión de timbre de OpenVoice V2 en entornos que consumen GGUF con CrispASR, sin necesidad de arrastrar la instalación Python original ni sus dependencias auxiliares. La validación publicada se limita a casos sintéticos en inglés sobre CPU y GPU T4, por lo que debe tratarse como un componente experimental dentro de un pipeline más amplio, no como un producto listo para producción multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Convertidor de tono y color (TCC) de OpenVoice V2: codificador de referencia, codificador posterior, flujos normalizadores y decodificador/vocoder; pesos en F32 y F16 según tensor |
| Parametros totales | 32.749.090 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | GGUF con mezcla de precisiones: F32 para tensores sensibles y F16 para el resto del decodificador; normalizacion de pesos fusionada |
| Idiomas soportados | en (validacion acotada a casos sinteticos en ingles) |
| Licencia | MIT (aviso original de MyShell incluido; Melo y BERT mantienen licencias independientes, BERT Apache-2.0) |
| Formato de pesos | GGUF (fichero `openvoice2-tcc-f32sens.gguf`, 102.123.872 bytes) |

## Arquitectura y entrenamiento

Esta ficha describe una conversión de formato y precisión, no un entrenamiento nuevo. El modelo subyacente, OpenVoice V2, es un sistema de conversión de voz compuesto por varias etapas: un codificador de referencia que extrae el embedding de timbre, un codificador posterior que modela la distribución latente del audio de entrada, una serie de flujos normalizadores que transforman entre distribuciones y un decodificador/vocoder que reconstruye la forma de onda. La conversión de `cstr` mantiene en F32 el codificador de referencia, el codificador posterior, los flujos y los tensores unidimensionales, y pasa a F16 los tensores restantes del decodificador, fusionando la normalización de pesos.

No se ha entrenado ningún timbre nuevo ni se ha añadido un embedding de hablante objetivo: los embeddings de hablante base incluidos son los tensores oficiales del modelo original. La salida del convertidor es PCM a 22,05 kHz, frente a los 44,1 kHz del Melo baseline sin convertir. La validación publicada cubre comprobaciones de etapa y magnitud sobre referencia original en CPU y CUDA T4, repeticiones con reseed exacto y los cuatro casos de habla y hablante de Session/CLI sin cambios. No hay datos públicos sobre el volumen de datos de entrenamiento original, la composición del dataset ni el uso de RLHF o DPO, ya que esta conversión no reentrena el modelo.

## Capacidades

- Conversión de timbre de voz (voice conversion): transforma el color tonal de una locución de origen hacia una voz de referencia autorizada, manteniendo el contenido lingüístico y la prosodia.
- Integración en pipelines ASR: diseñado para ejecutarse junto al bundle cualificado Melo V2 / BERT F16 dentro de CrispASR.
- Descubrimiento nativo por CLI: el CLI de CrispASR localiza este fichero por su nombre exacto junto al modelo Melo; la ruta también puede inyectarse mediante el setter de codec de la Session/C ABI.
- Salida de audio PCM a 22,05 kHz.
- Ejecución parcial en CPU: el trabajo de referencia y de flujos corre en CPU; el trabajo CUDA del vocoder del convertidor se ha observado en T4.
- No incluye síntesis de texto a voz: es un componente, no un TTS autónomo.
- No incluye tool calling, function calling, razonamiento multi-paso ni capacidades de agente; no es un modelo de lenguaje.
- No incluye visión, audio de entrada arbitrario ni modo thinking.
- Multilingüismo: no validado; la cualificación se limita a casos sintéticos en inglés.

## Casos de uso

- Clonación de voz controlada en pipelines de doblaje: usar el convertidor para trasladar el timbre de un actor a una voz de referencia autorizada, manteniendo la interpretación original. Adecuado porque separa explícitamente la etapa de timbre del resto del pipeline y permite sustituir solo ese módulo.
- Integración en herramientas ASR con salida de voz: dentro de CrispASR, encadenar la transcripción con la conversión de timbre para generar locuciones con una voz corporativa autorizada a partir de audio de entrada.
- Prototipado de asistentes de voz con identidad sonora fija: emplear el TCC para normalizar el timbre de distintas fuentes de audio hacia una voz de marca, siempre que se disponga de una referencia autorizada y se mantengan las marcas de audio generado exigidas por CrispASR.
- Investigación en conversión de voz: servir como checkpoint de referencia en GGUF para reproducir experimentos de conversión de timbre sin reinstalar el stack Python original, comparando resultados con el modelo upstream.
- Evaluación de despliegue en hardware modesto: al ocupar unos 102 MB y ejecutar parte del cómputo en CPU, permite probar el pipeline en estaciones sin GPU dedicada, reservando la GPU para el vocoder.
- Auditoría de procedencia y licencias: el repositorio incluye `PROVENANCE.json` con hashes de entrada, fuente del conversor y enlaces de validación, lo que facilita revisiones de cumplimiento en entornos corporativos.
- Pruebas de regresión en CI de audio: usar los casos sintéticos documentados y las repeticiones con reseed exacto como base para detectar cambios de comportamiento tras actualizar CrispASR o el bundle Melo/BERT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta comprobaciones cualitativas de etapa y magnitud sobre referencia original en CPU y CUDA T4, repeticiones con reseed exacto, descubrimiento adyacente de BERT F16 y los cuatro casos de habla y hablante de Session/CLI sin cambios. No se proporcionan métricas objetivas como MOS, MCD, WER ni comparativas numéricas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el fichero GGUF ocupa 102.123.872 bytes (unos 97 MiB), por lo que el peso de los parámetros es reducido y el consumo dominante provendrá de activaciones y del vocoder.
- GPU recomendadas: la validación documentada se realizó en NVIDIA T4 (CUDA); no se han validado otras familias de GPU.
- CPU: el trabajo de referencia y de flujos se ejecuta en CPU; el vocoder del convertidor se ha observado en CUDA.
- ¿Cabe en GPU de consumo? No hay datos oficiales; por tamaño de fichero es plausible, pero la validación no lo confirma.
- Opciones de despliegue: CrispASR v0.8.48 o superior, mediante CLI nativo o Session/C ABI con el setter de codec. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| cstr/openvoice2-tcc-GGUF | 32.749.090 | no aplica (audio) | GGUF (F32/F16 mixto) | MIT | Conversion para CrispASR, validacion acotada a ingles sintetico |
| myshell-ai/OpenVoiceV2 | no disponible en la informacion proporcionada | no aplica (audio) | pesos originales (PyTorch) | MIT | Modelo upstream completo, incluye TTS y conversion |
| Melo V2 (bundle cualificado) | no disponible | no aplica (audio) | no disponible | no disponible (licencia independiente) | Motor TTS que acompaña al convertidor en CrispASR |
| BERT F16 (bundle cualificado) | no disponible | no disponible | no disponible | Apache-2.0 | Modelo auxiliar de representaciones linguisticas |

La comparación directa con otros convertidores de voz en GGUF no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un motor TTS autónomo: requiere el bundle Melo V2 / BERT F16 cualificado y una grabación de referencia autorizada.
- La validación se limita a casos sintéticos en inglés; otros idiomas, grabaciones naturales, otras familias de GPU y la selección automática de VAD requieren validación independiente.
- La licencia MIT del modelo no otorga derechos sobre la identidad de una persona concreta ni sobre la grabación de referencia del operador; es responsabilidad del usuario disponer de una referencia autorizada.
- Es obligatorio mantener las marcas de audio generado que exige CrispASR.
- La identidad del preset de prueba permanece desconocida; el audio de validación y las capturas de referencia no son públicos.
- El repositorio no incluye Melo ni BERT, cuyas licencias son independientes (BERT bajo Apache-2.0); tampoco incluye las dependencias auxiliares de habla y transcripción de la instalación Python original.
- Riesgo de alucinación en el sentido de artefactos de audio o timbres no fieles: no hay métricas publicadas de fidelidad (MOS, MCD) que permitan acotarlo.
- La salida es PCM a 22,05 kHz, inferior a los 44,1 kHz del Melo baseline, lo que puede ser insuficiente para producción musical o de alta fidelidad.
- Sesgos conocidos: no documentados en la información proporcionada; al depender de embeddings de hablante del modelo original, puede heredar sesgos de representación de voces del dataset upstream.
- Uso comercial: permitido por la licencia MIT del componente, sujeto a las licencias independientes de Melo y BERT y a la normativa aplicable sobre síntesis de voz y derechos de imagen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cstr/openvoice2-tcc-GGUF
- Modelo base OpenVoice V2: https://huggingface.co/myshell-ai/OpenVoiceV2/tree/f36e7edfe1684461a8343844af60babc2efbb727
- Repositorio OpenVoice (commit fijado): https://github.com/myshell-ai/OpenVoice/blob/74a1d147b17a8c3092dd5430504bd83ef6c7eb23/LICENSE
- Procedencia y hashes: PROVENANCE.json dentro del repositorio de Hugging Face
