# NothingSoftware/opus-mt-tc-big-es-zle-ct2-int8

## Resumen

Este modelo es una conversión a CTranslate2 con cuantización int8 del modelo de traducción automática neuronal Helsinki-NLP/opus-mt-tc-big-es-zle, desarrollado por el grupo de Tecnología del Lenguaje de la Universidad de Helsinki (OPUS-MT). La conversión la realiza NothingSoftware para su aplicación NTranscript, que necesita traducción offline en dispositivos con recursos limitados. El modelo original traduce de español a lenguas eslavas orientales, principalmente ruso, y también ucraniano y bielorruso mediante tokens de prefijo.

La arquitectura es un transformer de traducción automática (variante "big" de OPUS-MT), con aproximadamente 242 MB de pesos en int8. No es un modelo de lenguaje generativo, sino un sistema de traducción por frases. Su relevancia radica en que ofrece la misma calidad de traducción que el modelo original en float32 (BLEU 28.0 en WMT20 en-ru, primeras 500 frases) con la mitad de tamaño y el doble de velocidad en CPU, lo que facilita su despliegue en entornos sin GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (OPUS-MT tc-big) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (traducción por frases) |
| Tipos de cuantización | int8 |
| Idiomas soportados | español (origen); ruso, ucraniano y bielorruso (destino) |
| Licencia | CC-BY 4.0 |
| Formato de pesos | CTranslate2 (model.bin) + SentencePiece (source.spm, target.spm) + shared_vocabulary.json |
| Tamaño del repositorio | 0.2 GB |
| Modelo base | Helsinki-NLP/opus-mt-tc-big-es-zle |
| Framework | CTranslate2 4.8.2, transformers 5.17.0 |

## Arquitectura y entrenamiento

El modelo es una conversión de formato, no un entrenamiento nuevo. La arquitectura original es un transformer de traducción automática desarrollado por OPUS-MT (Universidad de Helsinki), concretamente la variante "tc-big" de la familia opus-mt-tc-big. El modelo original fue entrenado con datos paralelos del proyecto OPUS y publicado en 2022. La conversión a CTranslate2 con cuantización int8 no modifica los pesos, solo los cuantiza a 8 bits para reducir el tamaño y acelerar la inferencia en CPU.

La innovación principal es que la cuantización int8 mantiene la calidad de traducción (mismo BLEU 28.0 en WMT20 en-ru, primeras 500 frases) mientras reduce el tamaño a la mitad y duplica la velocidad en CPU respecto a float32. No se aplicaron técnicas de RLHF ni DPO, ya que es un modelo de traducción supervisada.

## Capacidades

- Traducción de texto de español a ruso.
- Traducción a otros idiomas eslavos orientales (ucraniano, bielorruso) mediante los prefijos `>>ukr<<` y `>>bel<<`.
- Funciona a nivel de frase, no de documento completo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No genera código, matemáticas ni texto creativo.
- No tiene capacidades de visión, audio ni modo "thinking".
- Multilingüismo limitado: solo origen español y destinos eslavos orientales.
- Capacidad especial: inferencia eficiente en CPU gracias a la cuantización int8 y CTranslate2.

## Casos de uso

- Traducción offline en aplicaciones de escritorio o móviles: el modelo pesa 242 MB en int8 y funciona en CPU, por lo que puede integrarse en apps como NTranscript para traducir texto de español a ruso sin conexión.
- Traducción de documentación técnica en servidores sin GPU: al requerir muy poca memoria y no necesitar GPU, es adecuado para traducir manuales o guías de español a ruso en entornos de bajos recursos.
- Preprocesamiento para pipelines de NLP: puede traducir corpus de español a ruso antes de aplicar otros análisis (análisis de sentimiento, extracción de entidades) en proyectos multilingües.
- Subtitulado automático en tiempo real: su velocidad en CPU (el doble que float32) permite traducir subtítulos de español a ruso en dispositivos de consumo sin GPU dedicada.
- Localización de contenido web: para traducir artículos o páginas de español a ruso en servidores de bajo coste, con licencia CC-BY que permite uso comercial con atribución.
- Investigación en traducción automática de bajo recurso: sirve como punto de partida para evaluar técnicas de cuantización o para comparar con modelos más grandes en la dirección español-ruso.
- Traducción de correos electrónicos o mensajes en aplicaciones de comunicación: integrado en un cliente de correo, puede traducir mensajes entrantes de español a ruso de forma local y privada.

## Benchmarks y rendimiento

Evaluación original del modelo base (spa-rus):

| Par de idiomas | Conjunto de prueba | chr-F | BLEU | #frases | #palabras |
|---|---|---|---|---|---|
| spa-rus | tatoeba-test-v2021-08-07 | 0.68523 | 49.0 | 10506 | 69242 |
| spa-rus | flores101-devtest | 0.49913 | 20.2 | 1012 | 23295 |
| spa-rus | newstest2012 | 0.52436 | 24.6 | 3003 | 64790 |
| spa-rus | newstest2013 | 0.54249 | 26.9 | 3000 | 58560 |

Comparación int8 vs float32 (según la model card):

| Prueba | Precisión | BLEU |
|---|---|---|
| WMT20 en-ru (primeras 500 frases) | int8 | 28.0 |
| WMT20 en-ru (primeras 500 frases) | float32 | 28.0 |

Nota: la model card indica que la prueba se realizó en WMT20 en-ru, aunque el modelo es español-ruso; se reproduce el dato tal cual. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB (el archivo int8 ocupa 242,6 MB; con el overhead de CTranslate2, cabe en cualquier GPU con 1 GB o en CPU).
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU moderna (GTX 1050, RTX 3060, etc.) puede usarse, pero no es necesaria.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: CTranslate2 (Python, C++), integración mediante la librería `ctranslate2`; también se puede usar con `sentencepiece`. No es compatible con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: en CPU, aproximadamente el doble de rápido que la versión float32; BLEU 28.0 en WMT20 en-ru (primeras 500 frases). No se proporcionan cifras exactas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|---|
| Este modelo (int8) | no disponible | traducción por frases | es -> ru, ukr, bel | CC-BY 4.0 | CTranslate2 int8 | 242 MB |
| Helsinki-NLP/opus-mt-tc-big-es-zle | no disponible | traducción por frases | es -> zle | CC-BY 4.0 | Transformers float32 | ≈485 MB (deducido del tamaño int8 y la afirmación de la model card) |
| Helsinki-NLP/opus-mt-es-ru | no disponible | traducción por frases | es -> ru | CC-BY 4.0 | Transformers | no disponible |

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, pero al entrenarse con corpus OPUS puede heredar sesgos presentes en los datos (género, nacionalidad, etc.).
- Riesgo de alucinación: en traducción automática, puede producir traducciones incorrectas o inventar contenido cuando la frase es ambigua o contiene términos fuera de dominio.
- Limitación de contexto: traduce frase a frase, sin contexto amplio; puede perder coherencia en documentos largos o conversaciones multi-turno.
- Limitación de idioma: solo admite español como origen y ruso (y otros eslavos orientales) como destino; no soporta otros pares.
- Licencia: CC-BY 4.0 permite uso comercial, pero exige atribución a los autores originales (Universidad de Helsinki) y al convertidor (NothingSoftware). Es necesario incluir la licencia y el aviso de copyright.
- Caveats para producción: la equivalencia int8 vs float32 se verificó en WMT20 en-ru, no en español-ruso; podrían existir diferencias en otros dominios. El modelo es de 2022 y no ha sido actualizado. No es un modelo generativo general.
- No soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/NothingSoftware/opus-mt-tc-big-es-zle-ct2-int8
- HuggingFace del modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-es-zle
- GitHub de CTranslate2: https://github.com/OpenNMT/CTranslate2
- GitHub de NTranscript: https://github.com/Nothing-Software/NTranscript
- GitHub de OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Paper OPUS-MT: https://aclanthology.org/2020.eamt-1.61
- Paper Tatoeba Translation Challenge: https://aclanthology.org/2020.wmt-1.139
- Paper Democratizing Neural Machine Translation with OPUS-MT: https://arxiv.org/pdf/2212.01936
- Licencia CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/
