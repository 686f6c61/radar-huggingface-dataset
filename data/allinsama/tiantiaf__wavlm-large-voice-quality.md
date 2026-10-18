# Allinsama/tiantiaf__wavlm-large-voice-quality

## Resumen
El modelo es un clasificador de audio basado en WavLM-large, ajustado para etiquetar calidad vocal percibida en 25 categorías agrupadas en tono, textura, volumen, claridad y ritmo. Lo publica el usuario de HuggingFace Allinsama, mientras que la model card atribuye la implementación y el artículo asociado a Tiantian Feng y colaboradores en el marco de Vox-Profile. No es un modelo generativo de texto, sino un modelo discriminativo de audio que recibe voz de hasta 15 segundos a 16 kHz mono y devuelve logits multi-etiqueta.

Con 317.721.586 parámetros, reutiliza el backbone de representación de voz `microsoft/wavlm-large` y añade una cabeza de clasificación multi-etiqueta. Su relevancia actual está en la caracterización automática de rasgos de voz para investigación lingüística, organización de archivos sonoros y evaluación auxiliar de voces sintéticas, dentro de un contexto de creciente interés por los benchmarks de modelos fundacionales de habla.

La licencia declarada es openrail, pero la model card incluye restricciones explícitas de uso no comercial y excluye aplicaciones clínicas, vigilancia y usos invasivos de la privacidad. Es un modelo en inglés, con muy poca adopción pública en el momento de la ficha: 10 descargas y 0 likes.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | WavLM-large con cabeza de clasificación multi-etiqueta |
| Parámetros totales | 317.721.586 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica a texto; audio de entrada de hasta 15 s a 16 kHz mono |
| Tipos de cuantización | No disponible; no se documentan versiones GGUF, AWQ, GPTQ ni cuantizaciones oficiales |
| Idiomas soportados | Inglés (entrenamiento y evaluación); otros idiomas no documentados |
| Licencia | openrail; la model card indica “No commercial use” en usos fuera de alcance |
| Formato de pesos | safetensors y pesos PyTorch; repositorio de 1,3 GB |
| Pipeline | audio-classification |
| Número de etiquetas | 25 etiquetas multi-etiqueta |
| Entrada recomendada | Audio mono, 16 kHz, máximo 15 s |
| Umbral de decisión sugerido | 0,7 sobre la sigmoide de los logits |

## Arquitectura y entrenamiento
El modelo parte de `microsoft/wavlm-large`, un backbone transformer para representación de voz, y se ajusta mediante una cabeza de clasificación multi-etiqueta con activación sigmoide. Las 25 etiquetas cubren cualidades de tono (`shrill`, `nasal`, `deep`), textura (`silky`, `husky`, `raspy`, `guttural`, `vocal-fry`), volumen (`booming`, `authoritative`, `loud`, `hushed`, `soft`), claridad (`crisp`, `slurred`, `lisp`, `stammering`) y ritmo (`singsong`, `pitchy`, `flowing`, `monotone`, `staccato`, `punctuated`, `enunciated`, `hesitant`). La salida no es excluyente: una misma muestra puede activar varias etiquetas.

El ajuste se realiza sobre el dataset `ajd12342/paraspeechcaps`, excluyendo EARS por su número limitado de muestras en el conjunto de validación. La métrica descrita es Macro-F1 a nivel de hablante: se muestrean cinco utterances por hablante, se repite el proceso 20 veces y se promedia entre VoxCeleb y Expresso. No se especifican en la información disponible el número de horas de audio, la composición detallada del dataset, el número de tokens ni si hubo fases de RLHF o DPO; en un modelo discriminativo de audio, RLHF/DPO no resultan aplicables del mismo modo que en modelos generativos. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades
- Clasificación multi-etiqueta de calidad vocal percibida en 25 etiquetas de tono, textura, volumen, claridad y ritmo.
- Producción de logits por etiqueta; la probabilidad se obtiene aplicando una sigmoide.
- Uso recomendado con umbral de 0,7 y agregación de predicciones por hablante para reducir ruido.
- Procesamiento de audio mono a 16 kHz con una longitud máxima de 15 segundos.
- Etiquetado de rasgos como voz nasal, ronca, susurrada, monótona, entrecortada o vacilante.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni generación de audio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo multilingüe validado; solo se documenta inglés.

## Casos de uso
- Perfilado de voces en archivos de podcast o entrevistas: el modelo puede etiquetar cada intervención con rasgos de calidad vocal y agregar las predicciones por hablante, facilitando la búsqueda y organización de una fonoteca. Requiere consentimiento y base legal para tratar voces.
- Organización de bibliotecas de audio: permite añadir metadatos como `husky`, `nasal`, `monotone` o `hushed` a grabaciones para mejorar la recuperación por descriptores vocales.
- Investigación fonética y lingüística: puede caracterizar corpus de habla en estudios sobre variación vocal, comparando la distribución de etiquetas entre hablantes y conjuntos como VoxCeleb o Expresso, siempre con revisión humana.
- Evaluación auxiliar de voces sintéticas: en un pipeline de TTS, el clasificador puede medir de forma aproximada si una voz generada presenta rasgos deseados como `soft`, `booming` o `monotone`; no sustituye una evaluación perceptual completa.
- Preparación de datasets para TTS o ASR: permite filtrar o equilibrar muestras según cualidades vocales, por ejemplo seleccionar voces `crisp` o descartar muestras con predicciones inestables, con consentimiento y licencia adecuados.
- Herramientas de coaching vocal no clínico: puede ofrecer retroalimentación orientativa sobre rasgos percibidos de la voz, acompañada de avisos de que no es una herramienta diagnóstica ni clínica.
- Producción audiovisual: puede etiquetar tomas de doblaje o locución para que un equipo humano localice rápidamente tomas con una textura o volumen concretos; no debe usarse para decisiones automatizadas de empleo o evaluación personal.

## Benchmarks y rendimiento
| Benchmark | Resultado | Notas |
|---|---|---|
| Macro-F1 a nivel de hablante, media no ponderada de VoxCeleb y Expresso | no disponible | Se describe la metodología: 5 utterances por hablante, 20 repeticiones y promedio por hablante |
| Accuracy | no disponible | La model card declara la métrica `accuracy`, pero no publica cifras |
| Comparación numérica con otros modelos | no disponible | No se incluyen resultados comparativos en la información proporcionada |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Pesos en FP32: aproximadamente 1,27 GB para 317,7 millones de parámetros; el repositorio completo ocupa 1,3 GB.
- Pesos en FP16: aproximadamente 0,64 GB; en INT8, aproximadamente 0,32 GB, aunque no se documentan cuantizaciones oficiales.
- VRAM orientativa para inferencia: alrededor de 2-4 GB en FP32 y 1-2 GB en FP16 para audio de hasta 15 s y batch pequeño; es una estimación a partir del tamaño del modelo, no una cifra confirmada por el autor.
- Cabe en GPU de consumo: sí, en tarjetas con 4-6 GB o más, como GTX 1660, RTX 3060, RTX 4060 o RTX 4090, especialmente en FP16 y batch 1.
- Para lotes grandes o despliegue de alta concurrencia se recomiendan GPU de centro de datos como A100 o H100.
- Despliegue oficial: PyTorch mediante `WavLMWrapper.from_pretrained` del repositorio Vox-Profile y pesos de HuggingFace.
- No hay soporte oficial documentado en vLLM, llama.cpp, Ollama ni TGI; no es un modelo generativo de texto y esas herramientas no son adecuadas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto o entrada | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Allinsama/tiantiaf__wavlm-large-voice-quality | 317.721.586 | Audio de hasta 15 s, 16 kHz mono | Clasificación multi-etiqueta de calidad vocal en 25 etiquetas | openrail con restricción de uso no comercial en la model card | HuggingFace |
| microsoft/wavlm-large | no disponible en la información | no disponible | Backbone de representación de voz, sin cabeza de clasificación específica | no disponible | HuggingFace |
| Clasificadores específicos de calidad vocal comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de alternativas directamente comparables con resultados públicos en la información proporcionada. La comparación más directa es con el modelo base `microsoft/wavlm-large`, que no incluye la cabeza de clasificación de 25 etiquetas ni el ajuste sobre ParaSpeechCaps.

## Limitaciones y advertencias
- Uso clínico o diagnóstico excluido explícitamente por la model card; no debe emplearse para detectar patologías, trastornos ni condiciones médicas.
- Uso en vigilancia, aplicaciones invasivas de la privacidad o decisiones automatizadas sobre personas excluido por la model card.
- La licencia declarada es openrail, pero la model card incluye “No commercial use”; existe una restricción expresa que impide asumir uso comercial sin aclaración jurídica.
- Solo se documenta inglés; el rendimiento en otros idiomas no está validado.
- El entrenamiento filtró audio menor de 3 s y mayor de 15 s; fuera de ese rango la fiabilidad no está garantizada.
- Las etiquetas son perceptuales y subjetivas; pueden variar entre oyentes, culturas y contextos.
- No se documentan análisis de sesgo por género, edad, acento, origen o condición vocal.
- El umbral de 0,7 es una recomendación de la model card; en producción conviene calibrarlo y agregar predicciones por hablante.
- No es un modelo generativo: no alucina texto, pero puede producir falsos positivos y falsos negativos en las etiquetas.
- No soporta tool calling, agentes, razonamiento multi-paso ni integración directa en pipelines de texto.
- El uso sobre voces humanas exige consentimiento, base legal y cumplimiento de la normativa de protección de datos.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/Allinsama/tiantiaf__wavlm-large-voice-quality)
- [Artículo Vox-Profile en arXiv](https://arxiv.org/abs/2505.14648)
- [PDF del artículo Vox-Profile](https://arxiv.org/pdf/2505.14648)
- [Repositorio Vox-Profile](https://github.com/tiantiaf0627/vox-profile-release)
- [Modelo base microsoft/wavlm-large](https://huggingface.co/microsoft/wavlm-large)
- [Dataset ParaSpeechCaps](https://huggingface.co/datasets/ajd12342/paraspeechcaps)
- No se han encontrado enlaces adicionales relevantes en los resultados de búsqueda web proporcionados.
