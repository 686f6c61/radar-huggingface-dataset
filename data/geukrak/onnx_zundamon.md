# Geukrak/onnx_zundamon

## Resumen

onnx_zundamon es un repositorio de modelos de síntesis de voz (text-to-speech) publicado por el usuario Geukrak en HuggingFace, que recopila y convierte a formatos optimizados los componentes necesarios para generar voz con la voz del personaje Zundamon (ずんだもん), un personaje japonés de la familia de voces de Zunko Tohoku. El modelo se creó originalmente para el programa "voiceger", desarrollado por zunzun99 y yh00722, y el autor indica que está realizando mejoras y optimizaciones sobre una versión desactualizada.

Técnicamente, el repositorio no contiene un único modelo, sino un conjunto de tres componentes: un modelo HuBERT chino (TencentGameMate/chinese-hubert-base) para extracción de características de audio, un par de modelos GPT y VITS afinados con la voz de Zundamon (procedentes de zunzunpj/zundamon_GPT-SoVITS, basados en la arquitectura GPT-SoVITS), y un modelo RoBERTa chino grande (hfl/chinese-roberta-wwm-ext-large) para procesamiento de texto. Los modelos GPT y VITS se han exportado a ONNX para acelerar la inferencia, mientras que BERT y HuBERT se han convertido a safetensors.

Su relevancia actual es principalmente para desarrolladores que quieran ejecutar TTS con la voz de Zundamon de forma eficiente y local, aprovechando el pipeline ONNX para obtener la máxima velocidad de inferencia. Con un tamaño de repositorio de 3,1 GB y descargas muy bajas (15), se trata de un proyecto de nicho, comunitario y sin documentación extensa, pero útil como paquete listo para usar dentro del ecosistema voiceger.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS (GPT + VITS) con HuBERT para extracción de características y RoBERTa para procesamiento de texto |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag "quantized" del modelo base HuBERT no detalla el tipo) |
| Idiomas soportados | Japonés (ja), chino (zh); los tags del repositorio también listan coreano (ko) e inglés (en), aunque la model card solo menciona ja y zh |
| Licencia | AGPL-3.0 para las conversiones; licencia personalizada para los modelos GPT/VITS afinados; Apache-2.0 (RoBERTa) y MIT (HuBERT) en los modelos base |
| Formato de pesos | ONNX (GPT y VITS), safetensors (BERT y HuBERT) |

## Arquitectura y entrenamiento

El sistema se basa en GPT-SoVITS, una arquitectura de clonación de voz y TTS que combina un modelo GPT para predicción de tokens semánticos de audio con un modelo VITS (variational inference with adversarial learning for end-to-end text-to-speech) para la generación de la forma de onda final. El componente HuBERT (TencentGameMate/chinese-hubert-base) se emplea para extraer representaciones de características del audio, mientras que el RoBERTa chino grande (hfl/chinese-roberta-wwm-ext-large) se utiliza en el procesamiento del texto de entrada, un componente habitual en GPT-SoVITS para el análisis lingüístico.

Los modelos GPT y VITS han sido afinados con la voz del personaje Zundamon a partir de los pesos publicados en zunzunpj/zundamon_GPT-SoVITS. No hay información disponible sobre el número de tokens, la cantidad de horas de audio de entrenamiento, ni sobre el uso de técnicas como RLHF o DPO (técnicas que, por otro lado, no son habituales en TTS). La innovación principal de este repositorio no es arquitectónica sino de ingeniería: la exportación de GPT y VITS a ONNX para soporte completo de pipeline ONNX con inferencia acelerada, y la conversión de BERT y HuBERT a safetensors para carga con copia cero (zero-copy) y mayor seguridad frente a ejecución de código arbitrario en pickles.

## Capacidades

- Texto a voz (TTS) con la voz del personaje japonés Zundamon, generada mediante la arquitectura GPT-SoVITS.
- Clonación de voz / síntesis basada en referencia, característica inherente a GPT-SoVITS (sujeta a cómo se haya configurado el pipeline en voiceger).
- Extracción de características de audio mediante HuBERT chino, útil para tareas de procesamiento de voz más allá de la síntesis.
- Procesamiento y análisis de texto en chino mediante RoBERTa chino grande.
- Inferencia acelerada mediante pipeline ONNX completo para los modelos GPT y VITS.
- Soporte de idiomas declarado: japonés y chino en la model card; los tags añaden coreano e inglés, aunque sin documentación que lo confirme.

No hay evidencia de capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades de visión o audio de entrada más allá de lo inherente a los componentes HuBERT.

## Casos de uso

- Generación de voz para el programa voiceger: el caso de uso principal declarado; el repositorio existe como backend de modelos para esta herramienta de síntesis de voz.
- Creación de contenido con la voz de Zundamon: generación de locuciones para vídeos, streams o contenido de YouTube/TikTok en japonés, respetando los términos de uso del personaje.
- Asistentes de voz locales: integración en aplicaciones de asistente conversacional que necesiten una voz japonesa sintética ejecutada en local con ONNX Runtime.
- Prototipado de pipelines TTS con ONNX: aprovechar los modelos ya exportados a ONNX para experimentar con inferencia optimizada de GPT-SoVITS sin realizar la conversión uno mismo.
- Análisis de audio en chino: uso del componente HuBERT chino para extraer embeddings de audio en tareas de reconocimiento o clasificación de voz.
- Investigación en TTS de personajes virtuales: estudio de cómo afinar GPT-SoVITS con voces de VTubers/personajes y cómo empaquetar los resultados en formatos portables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay métricas de calidad de voz (MOS, WER de síntesis) ni mediciones de latencia o RTF (real-time factor) en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamaño del repositorio (3,1 GB) y la naturaleza de los componentes (GPT-SoVITS con RoBERTa grande y HuBERT), es razonable asumir que unos 4-6 GB de VRAM serían suficientes para inferencia, pero este dato no está confirmado por el autor.
- GPU recomendadas: no disponible. Al tratarse de modelos relativamente ligeros, cualquier GPU de consumo moderna (RTX 3060 o superior) debería ser suficiente para inferencia ONNX; también es plausible la ejecución en CPU mediante ONNX Runtime, aunque sin datos de rendimiento publicados.
- Consumer GPU: no hay confirmación oficial, pero los modelos GPT-SoVITS convertidos a ONNX suelen ejecutarse en GPUs de consumo sin problemas.
- Opciones de despliegue: el pipeline está diseñado para ONNX Runtime y la librería Transformers de HuggingFace; el uso previsto es dentro del programa voiceger (repositorios: fork de Geukrak y repo original de zunzun999). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelos TTS.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Voz/idioma | Formato | Licencia |
|---|---|---|---|---|
| Geukrak/onnx_zundamon | GPT-SoVITS (TTS) | Zundamon, japonés/chino | ONNX + safetensors | AGPL-3.0 (conversiones) + licencia personalizada del personaje |
| zunzunpj/zundamon_GPT-SoVITS | GPT-SoVITS (TTS) | Zundamon, japonés | Pesos originales (no ONNX) | Licencia personalizada |
| litagin/Zundamon-Speechstyle-... o modelos tipo Style-Bert-VITS2 de Zundamon | Style-Bert-VITS2 (TTS) | Zundamon, japonés | safetensors | Varía según repositorio |

Nota: la comparativa se basa en la existencia de otros repositorios comunitarios de TTS con la voz de Zundamon; no hay una ficha técnica pública verificable para cada alternativa en la informacion proporcionada, por lo que los detalles de parámetros y contexto de las alternativas no están disponibles. La ventaja diferencial de este repositorio es la exportación a ONNX para inferencia acelerada.

## Limitaciones y advertencias

- Documentación muy escasa: la model card es mínima y el propio autor reconoce que el repositorio estaba desactualizado en el momento de publicación; pueden existir cambios no documentados.
- Inconsistencia en los idiomas: los tags declaran ja, ko y en, pero la model card solo menciona japonés y chino; no hay confirmación de soporte real para coreano o inglés.
- Restricción de licencia importante: aunque las conversiones se publican bajo AGPL-3.0, los modelos GPT y VITS afinados con la voz de Zundamon están sujetos a una licencia personalizada del personaje (https://zunko.jp/con_ongen_kiyaku.html). El uso comercial o la redistribución de la voz generada puede estar restringido; es imprescindible revisar y cumplir esos términos.
- AGPL-3.0 es una licencia copyleft fuerte: si se integra este software en un servicio de red, estarías obligado a publicar el código fuente de la aplicación completa derivada.
- Riesgo de alucinación no aplica en el mismo sentido que en LLMs, pero los modelos TTS pueden generar pronunciaciones incorrectas en textos fuera de japonés/chino o con lecturas ambiguas de kanji.
- Proyecto comunitario con muy pocas descargas (15) y sin mantenimiento garantizado: no es adecuado para producción sin auditoría propia.
- Los datos de rendimiento, VRAM y compatibilidad no están documentados, por lo que la integración requiere pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Geukrak/onnx_zundamon
- Modelo base GPT-SoVITS de Zundamon: https://huggingface.co/zunzunpj/zundamon_GPT-SoVITS
- Modelo base HuBERT chino: https://huggingface.co/TencentGameMate/chinese-hubert-base
- Modelo base RoBERTa chino: https://huggingface.co/hfl/chinese-roberta-wwm-ext-large
- Fork del repositorio voiceger (Geukrak): https://github.com/dodo701/voiceger_v2/tree/main
- Repositorio original de voiceger: https://github.com/zunzun999/voiceger_v2
- Sitio oficial de voiceger y términos de uso del personaje: https://zunko.jp/
- Términos de licencia de uso de la voz (Zunko.jp): https://zunko.jp/con_ongen_kiyaku.html
