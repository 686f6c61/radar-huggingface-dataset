# Phoonnx/pocket-tts-italian

## Resumen

pocket-tts-italian es un modelo de síntesis de voz (text-to-speech) publicado por Phoonnx como un subconjunto del repositorio `Phoonnx/phoonnx-pocket-tts`, concretamente la carpeta `italian`. Se distribuye en formato ONNX y está pensado para su uso con la librería phoonnx, un runtime de TTS del mismo autor. El modelo deriva de los pesos de Kyutai (según indica la propia model card), que se redistribuyen bajo licencia CC BY 4.0.

El modelo resuelve la conversión de texto a audio en italiano con soporte para 26 identidades de voz distintas, identificadas mediante IDs del tipo `pockettts/it/<nombre>`. No es un modelo de lenguaje generativo ni un transformer de texto: es un sistema TTS empaquetado para inferencia, por lo que su relevancia está en el despliegue de voz sintética en aplicaciones locales o embebidas.

La información pública disponible es muy limitada: no se documentan arquitectura interna, número de parámetros, longitud de contexto ni composición del dataset de entrenamiento. El repositorio ocupa 0,8 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS empaquetado en ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | italiano (según nombre y voice ids); no se documentan otros |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card únicamente indica que se trata de un modelo de la familia pocket-tts redistribuido por Phoonnx, con pesos en formato ONNX y compatible con la librería `phoonnx`. No se especifican capas, tipo de decoder, vocoder, ni mecanismo de atención.

Tampoco se documentan los datos de entrenamiento: no hay número de horas de audio, composición del corpus, ni si hubo ajuste fino, RLHF o entrenamiento con hablantes específicos. La única referencia técnica es la atribución a Kyutai como origen de los pesos, y la mención de que los ficheros conservan las rutas del repositorio original `Phoonnx/phoonnx-pocket-tts`.

## Capacidades

- Síntesis de voz (text-to-speech) en italiano.
- Selección entre 26 voces predefinidas mediante identificadores `pockettts/it/<nombre>` (alba, anna, azelma, bill_boerst, caro_davy, charles, cosette, eponine, estelle, eve, fantine, george, giovanni, jane, javert, jean, juergen, lola, marius, mary, michael, paul, peter_yearsley, rafael, stuart_bell, vera).
- Inferencia mediante ONNX, lo que permite ejecución en CPU y GPU con runtimes compatibles.
- Integración con la librería phoonnx para carga y gestión de voces.
- No se documentan capacidades de clonación de voz, control de prosodia, emoción, tool calling ni razonamiento multi-paso.

## Casos de uso

- Lectura de contenido en italiano: el modelo puede convertir artículos, noticias o documentación a audio para aplicaciones de accesibilidad o consumo pasivo, usando una de las 26 voces disponibles según el tono deseado.
- Asistentes de voz locales: al ejecutarse sobre ONNX, puede integrarse en aplicaciones de escritorio o móviles que necesiten síntesis de voz sin depender de servicios en la nube, con la voz seleccionable por ID.
- Sistemas de navegación o avisos: generación de locuciones cortas en italiano para instrucciones paso a paso, con voces consistentes entre sesiones.
- Audiolibros y pódcast automatizados: conversión de textos largos a audio por lotes, eligiendo una voz concreta para mantener coherencia de narrador.
- Pruebas de integración en pipelines de TTS: al estar empaquetado en ONNX y con licencia permisiva, sirve para validar flujos de phoonnx en entornos de desarrollo antes de pasar a producción.
- Prototipado de interfaces conversacionales en italiano: combinación con un modelo de lenguaje para generar respuestas habladas en demos y entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,8 GB, lo que sugiere un modelo ligero apto para ejecución en CPU.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de pequeño tamaño, es probable que funcione en GPUs consumer, pero no hay datos oficiales.
- ¿Cabe en GPU consumer? No confirmado; por tamaño de artefacto (0,8 GB) es plausible en GPUs con 4 GB o más, pero no se documenta.
- Opciones de despliegue: ONNX Runtime y la librería phoonnx. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (TTS italiano en ONNX) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Información técnica muy escasa: no se documentan arquitectura, parámetros, dataset ni métricas, lo que dificulta evaluar su calidad frente a alternativas.
- Idioma limitado: el modelo está orientado al italiano; no se confirma soporte de otros idiomas.
- Sin datos de sesgos: no se ha publicado información sobre sesgos de género, acento o registro en las voces.
- Riesgo de alucinación acústica: como todo sistema TTS, puede producir pronunciaciones incorrectas en palabras extranjeras, siglas o nombres propios; no hay evaluación publicada.
- Licencia CC BY 4.0: permite uso comercial con atribución a Kyutai y a Phoonnx; es obligatorio conservar el aviso de licencia y dar crédito.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.
- Fecha de creación futura en los metadatos (2026-11-14), lo que puede indicar un artefacto generado automáticamente o una fecha errónea; conviene verificar la procedencia antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/pocket-tts-italian
- Repositorio origen: https://huggingface.co/Phoonnx/phoonnx-pocket-tts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
