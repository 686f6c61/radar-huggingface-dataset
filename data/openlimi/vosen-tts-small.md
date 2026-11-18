# openlimi/Vosen-tts-small

## Resumen

Vosen-TTS-Small es un modelo de síntesis de voz (text-to-speech) especializado en el idioma uzbeko, desarrollado por el usuario openlimi y publicado en Hugging Face bajo el identificador `openlimi/Vosen-tts-small`. Se presenta como un adaptador LoRA (v4) orientado a la clonación de voz zero-shot y a la generación de habla natural en uzbeko, con procesamiento fonético y mapas de prosodia ajustados específicamente para acentos uzbecos del norte, estándar y regionales. El modelo se distribuye con la librería `pepetts` y un repositorio de 0,7 GB en formato safetensors.

La propuesta del modelo es resolver la escasez de sistemas TTS de calidad para uzbeko, un idioma de bajos recursos en el ecosistema de síntesis de voz. Para ello combina un adaptador LoRA ligero con una arquitectura base de TTS (no detallada en la model card) y ofrece clonación de voz a partir de una muestra de audio de referencia de al menos 6 segundos. Según el autor, el modelo genera audio nativo a 24 kHz o 44,1 kHz y está optimizado para inferencia rápida incluso en hardware de consumo.

Es relevante ahora porque cubre una combinación poco frecuente: TTS zero-shot, clonación de voz y un idioma infrarrepresentado como el uzbeko, con licencia CreativeML OpenRAIL-M que permite uso comercial bajo condiciones. No obstante, la información técnica publicada es escasa y no se han divulgado resultados de benchmarks ni detalles de arquitectura o entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS con adaptador LoRA; arquitectura base no especificada) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Uzbeko (uz) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | Safetensors (repositorio de 0,7 GB) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura base del modelo. Se indica que se trata de un adaptador LoRA (versión v4) construido sobre una estructura ligera y responsiva, y que el entrenamiento se realizó sobre "iteraciones extensas de un dataset de alta calidad". No se especifica el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documenta la arquitectura del decodificador ni el vocoder empleado.

La innovación destacada por el autor es el ajuste específico del procesamiento de fonemas y de los mapas de prosodia para el uzbeko, con el objetivo de mejorar la naturalidad y la acentuación de las palabras. El modelo incorpora clonación de voz zero-shot mediante un adaptador LoRA con una escala recomendada de 0,9 a 1,0. La model card advierte que escalas inferiores a 0,8 pueden degradar la identidad tímbrica de la voz y que valores superiores a 1,0 pueden provocar clipping o distorsión en la síntesis. No se aportan datos sobre la arquitectura del sistema de clonación ni sobre el mecanismo de condicionamiento por audio de referencia.

## Capacidades

- Generación de voz en uzbeko con pronunciación nativa ajustada para acentos del norte, estándar y regionales.
- Clonación de voz zero-shot a partir de una muestra de audio de referencia de al menos 6 segundos (recomendado entre 8 y 15 segundos).
- Salida de audio a 24 kHz o 44,1 kHz, según la model card.
- Ajuste de la intensidad del adaptador LoRA mediante el parámetro `lora_scale` (rango recomendado 0,9-1,0).
- Soporte de inferencia en hardware de consumo según el autor (sin cifras concretas).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio de referencia para clonación.
- No se documenta capacidad multilingüe: el modelo está etiquetado únicamente para uzbeko (`uz`).

## Casos de uso

- **Locución y doblaje en uzbeko**: el modelo puede generar voces sintéticas para vídeos, audiolibros o contenido educativo en uzbeko, usando una muestra de referencia de 8-15 segundos para fijar el timbre de la voz del locutor.
- **Clonación de voz para accesibilidad**: permite crear una voz personalizada a partir de una grabación corta del usuario, útil en sistemas de lectura de pantalla o asistentes personales para hablantes de uzbeko.
- **Atención al cliente automatizada en uzbeko**: integrable en sistemas de IVR o asistentes conversacionales que requieran respuestas habladas en uzbeko con una voz de marca consistente, clonada a partir de una muestra del locutor corporativo.
- **Generación de contenido para redes y medios**: producción rápida de narraciones en uzbeko para pódcasts, anuncios o vídeos cortos, con la ventaja de que el adaptador LoRA es ligero y puede ejecutarse en hardware de consumo.
- **Prototipado de interfaces de voz**: desarrolladores que necesiten validar experiencias de voz en uzbeko sin depender de servicios TTS comerciales, gracias a la licencia OpenRAIL-M y al formato safetensors.
- **Investigación en TTS de bajos recursos**: el modelo sirve como punto de partida para estudiar adaptación LoRA, clonación zero-shot y prosodia en lenguas túrquicas con pocos recursos, si bien la falta de documentación técnica limita su reproducibilidad.
- **Sistemas de lectura de documentos en uzbeko**: conversión de texto a voz para accesibilidad de documentos administrativos o educativos, con la salvedad de que no se documenta el límite de longitud de texto por inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona las métricas PESQ y MCD en los metadatos, pero no proporciona valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. El repositorio ocupa 0,7 GB en safetensors, lo que sugiere que el adaptador LoRA es ligero, pero se desconoce el tamaño del modelo base y, por tanto, el consumo de VRAM.
- **GPU recomendadas**: no disponible. El autor afirma que el modelo está optimizado para inferencia rápida en hardware de consumo, sin especificar modelos concretos.
- **Compatibilidad con GPU de consumo**: el autor indica que sí es apto para hardware de consumo, pero no detalla qué tarjetas (RTX 3060, RTX 4090, etc.) lo soportan ni con qué cuantización.
- **Opciones de despliegue**: la librería indicada es `pepetts`, con dependencias de `torch` y `torchaudio`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además no son habituales en pipelines TTS.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de TTS en uzbeko ni datos de rendimiento que permitan establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Documentación técnica insuficiente**: no se especifican arquitectura base, número de parámetros, datos de entrenamiento ni resultados de benchmarks, lo que dificulta evaluar su calidad de forma objetiva.
- **Idioma único**: el modelo está entrenado y etiquetado solo para uzbeko; no se garantiza un comportamiento correcto en otros idiomas.
- **Riesgo de alucinación y artefactos**: como todo sistema TTS, puede producir pronunciaciones incorrectas, prosodia antinatural o artefactos de audio, especialmente con textos fuera de dominio o con muestras de referencia de baja calidad.
- **Requisitos estrictos de la muestra de referencia**: la clonación requiere audio mono de 16 kHz o 24 kHz, sin música, eco ni habla superpuesta, con una duración mínima de 6 segundos. Muestras deficientes degradan la calidad del clon.
- **Sensibilidad a la escala LoRA**: valores fuera del rango 0,9-1,0 pueden causar pérdida de identidad de la voz o distorsión, lo que exige ajuste manual en producción.
- **Sesgos**: no se documentan sesgos conocidos, pero al estar entrenado con un dataset no descrito, puede reproducir sesgos de acento, género o registro presentes en los datos.
- **Licencia CreativeML OpenRAIL-M**: permite uso personal, investigación y comercial, pero impone restricciones de uso recogidas en las cláusulas de la licencia (uso seguro de modelos generativos). Es recomendable revisar las cláusulas de uso prohibido antes de un despliegue comercial.
- **Riesgo de suplantación de voz**: la clonación zero-shot permite imitar voces con muestras cortas, lo que exige medidas de consentimiento y verificación en aplicaciones reales.
- **Madurez del proyecto**: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (18 de noviembre de 2026), lo que indica un proyecto muy reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openlimi/Vosen-tts-small
- Licencia CreativeML OpenRAIL-M (referencia indicada por el autor): https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Idioma uzbeko (referencia indicada por el autor): https://en.wikipedia.org/wiki/Uzbek_language
