# NbAiLab/nb-asr-qwen17b-bokfink021-beta

## Resumen

NbAiLab/nb-asr-qwen17b-bokfink021-beta es un modelo de reconocimiento automático del habla (ASR) para noruego bokmål y nynorsk, desarrollado por el Laboratorio Nacional de IA de Noruega (NbAiLab). Se trata de un ajuste fino (fine-tune) del modelo Qwen3-ASR-1.7B con un tokenizador personalizado, adaptado específicamente a las dos variedades escritas del noruego además del inglés. El nombre "bokfink" (pinzón en noruego, en referencia al estudio clásico de adquisición del lenguaje) indica que forma parte de una serie experimental de modelos ASR noruegos en fase beta.

El modelo aborda un problema concreto: la escasez de sistemas ASR de calidad para noruego, un idioma con pocos recursos frente al inglés. Basándose en la arquitectura de Qwen3-ASR, incorpora técnicas como contextual biasing y soporte para transcripción de audio largo (long-form), además de traducción del habla (speech translation). Con 2.038 millones de parámetros y licencia Apache 2.0, es lo bastante ligero para ejecutarse en hardware de consumo, lo que lo hace relevante para desarrolladores que necesitan transcripción local de noruego sin depender de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer basado en Qwen3, no disponible el detalle exacto) |
| Parámetros totales | 2.038.052.480 (~2,04 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Noruego bokmål (nb), noruego nynorsk (nn), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4,1 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de NbAiLab/Qwen3-ASR-1.7B-custom-tokenizer, que a su vez parte de la familia Qwen3-ASR de Alibaba. Qwen3-ASR emplea un codificador de audio basado en transformador acoplado a un decodificador de lenguaje tipo Qwen3, lo que permite aprovechar el conocimiento lingüístico de un LLM para la generación de transcripciones. La versión de NbAiLab sustituye el tokenizador original por uno personalizado, presumiblemente optimizado para las particularidades del noruego escrito (bokmål y nynorsk).

Entre las capacidades técnicas destacadas en las etiquetas del repositorio se encuentran el contextual biasing (sesgo contextual, que permite guiar la transcripción con listas de términos, nombres o jerga específica), el soporte para audio largo (long-form) y la traducción del habla. No se ha publicado información sobre el corpus de entrenamiento, el número de horas de audio ni las técnicas de alineamiento empleadas en la información disponible.

## Capacidades

- Reconocimiento automático del habla (ASR) en noruego bokmål con optimización específica
- Transcripción de noruego nynorsk
- Transcripción de inglés
- Traducción del habla (speech translation), según las etiquetas del repositorio
- Transcripción de audio largo (long-form)
- Contextual biasing: adaptación a vocabulario específico (nombres propios, terminología de dominio)
- Pipeline integrado en la librería `qwen-asr` de HuggingFace

No se ha documentado soporte de tool calling, agentes ni capacidades multimodales adicionales más allá del audio.

## Casos de uso

- **Transcripción de medios noruegos**: digitalización y subtitulado de archivos de radio y televisión en bokmål, aprovechando el soporte de audio largo para procesar programas completos sin segmentación manual.
- **Subtitulado en tiempo real o diferido**: generación de subtítulos para plataformas de vídeo educativas o de radiodifusión pública noruega, con la ventaja del contextual biasing para nombres propios y términos técnicos.
- **Transcripción académica y de investigación**: transcripción de entrevistas y corpus de habla en proyectos de lingüística noruega, con soporte nativo para las dos variedades escritas del idioma.
- **Asistentes de voz locales**: integración en sistemas de voz a texto que se ejecutan en hardware de consumo gracias a sus ~2 mil millones de parámetros, sin enviar audio a servicios externos.
- **Traducción del habla**: conversión de audio noruego a texto en otros idiomas mediante la capacidad de speech translation, útil en entornos multilingües o de producción audiovisual.
- **Documentación administrativa**: transcripción de reuniones, dictados y registros en organismos públicos noruegos, donde la licencia Apache 2.0 permite despliegue comercial sin restricciones.
- **Adaptación a dominios específicos**: uso del contextual biasing para mejorar el reconocimiento de jerga médica, jurídica o técnica noruega en transcripciones especializadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de una versión beta, es probable que las evaluaciones formales (WER sobre corpus como NorCP, FLEURS o NST) se publiquen en versiones posteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,04 mil millones de parámetros en safetensors (4,1 GB), se estima en torno a 5-6 GB en precisión completa; no hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU de consumo con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti o superiores) debería ser suficiente para inferencia; no hay recomendaciones oficiales.
- Cabe en GPUs de consumo: sí, por tamaño es viable en GPUs de gama media; no hay datos publicados sobre inferencia en CPU.
- Opciones de despliegue: librería `qwen-asr` de HuggingFace (transformers); no consta compatibilidad verificada con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| NbAiLab/nb-asr-qwen17b-bokfink021-beta | ~2,04 B | nb, nn, en | Apache 2.0 | ASR noruego, contextual biasing, beta |
| Qwen3-ASR-1.7B (base, Alibaba) | ~1,7 B | Multilingüe | Según versión base | Modelo del que parte este fine-tune |
| Whisper large-v3 (OpenAI) | ~1,55 B | ~99 idiomas, incl. noruego | MIT | Referente habitual, aunque con rendimiento limitado en noruego |
| NbAiLab/nb-wav2vec2 (serie) | ~0,3-1 B | nb, nn | Apache 2.0 | Alternativa ASR noruega previa del mismo laboratorio, basada en wav2vec2 |

La ventaja diferencial de este modelo frente a Whisper es la especialización en las dos normas escritas del noruego y el contextual biasing; frente a los wav2vec2 de NbAiLab, aporta la base de LLM de Qwen3, que suele mejorar la coherencia de las transcripciones.

## Limitaciones y advertencias

- El modelo está en fase beta (0.2.1), por lo que su calidad y estabilidad pueden cambiar entre versiones.
- El acceso está restringido (gated) en HuggingFace: hay que aceptar las condiciones del repositorio antes de descargarlo.
- Solo se ha documentado soporte para bokmål, nynorsk e inglés; otros idiomas o variedades dialectales noruegas no están cubiertos oficialmente (los dialectos hablados son un reto conocido en ASR noruego).
- No hay benchmarks públicos, por lo que no es posible verificar el WER frente a alternativas antes de probarlo.
- No hay información publicada sobre sesgos del modelo; como todo sistema ASR, puede mostrar peor rendimiento con hablantes de acentos marcados, niños o audio ruidoso.
- El riesgo de alucinaciones en silencios o audio de baja calidad, habitual en modelos ASR basados en LLM, no ha sido evaluado públicamente para este modelo.
- La licencia Apache 2.0 no impone restricciones comerciales relevantes.
- La compatibilidad con runtimes de inferencia habituales (llama.cpp, vLLM) no está documentada, lo que puede limitar las opciones de despliegue optimizado.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/NbAiLab/nb-asr-qwen17b-bokfink021-beta
- Modelo base: https://huggingface.co/NbAiLab/Qwen3-ASR-1.7B-custom-tokenizer
- Laboratorio NbAiLab: https://huggingface.co/NbAiLab
- Librería qwen-asr: https://huggingface.co/docs/transformers/main/model_doc/qwen3_asr (documentación de referencia en HuggingFace)

No se han encontrado enlaces a papers, blogs ni demos adicionales en la información disponible.
