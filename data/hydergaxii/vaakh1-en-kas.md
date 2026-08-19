# hydergaxii/vaakh1-en-kas

## Resumen

Vaakh1 es un modelo de traducción automática neuronal especializado en la dirección inglés-cachemir (escritura perso-arábiga), desarrollado por hydergaxii para la competición KATHE 2026 del Gaash Lab de NIT Srinagar. Se construye sobre el modelo base IndicTrans2 de AI4Bharat (versión distribuida de 200M parámetros) y se afina mediante un adaptador LoRA que posteriormente se fusiona con el modelo base, dando como resultado un modelo completo de 211,7 millones de parámetros.

El modelo resuelve un problema concreto: la escasez de sistemas de traducción de calidad para el cachemir, una lengua minoritaria con relativamente pocos recursos digitales. Su relevancia radica en que aprovecha un modelo multilingüe preentrenado (IndicTrans2) y lo adapta con un conjunto de datos paralelos (BPCC) para lograr un rendimiento aceptable en una dirección lingüística poco cubierta. Está diseñado para usarse con la librería `transformers` y el toolkit IndicTrans, y no es compatible con formatos de inferencia como GGUF o llama.cpp debido a su arquitectura encoder-decoder.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (basada en IndicTrans2) |
| Parametros totales | 211.776.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), cachemir (ks, escritura perso-arábiga) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura encoder-decoder de IndicTrans2, un sistema de traducción neuronal multilingüe desarrollado por AI4Bharat que cubre 22 lenguas indias. El modelo base (`indictrans2-en-indic-dist-200M`) es una versión destilada de 200M parámetros, y sobre él se ha entrenado un adaptador LoRA para la dirección inglés-cachemir. El adaptador se fusiona posteriormente con el modelo base para producir el modelo final.

El entrenamiento se realizó sobre el dataset BPCC (Bharat Parallel Corpus Collection) de AI4Bharat, un corpus paralelo multilingüe. No se especifican el número total de tokens de entrenamiento ni la composición exacta del subconjunto utilizado, pero la evaluación se hizo sobre un conjunto de validación de 1.000 pares de frases extraído de BPCC. No se menciona el uso de RLHF ni DPO; el ajuste es puramente supervisado con el adaptador LoRA.

## Capacidades

- Traducción automática de inglés a cachemir en escritura perso-arábiga.
- Preprocesamiento y postprocesamiento lingüístico mediante `IndicProcessor`, que normaliza y segmenta correctamente el texto en ambos idiomas.
- Generación de texto con parámetros configurables (beam search, penalización de repetición, etc.) para controlar la calidad de la salida.
- Soporte de inferencia por lotes (batch) gracias a la API estándar de `transformers`.
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio; es exclusivamente un modelo de traducción.

## Casos de uso

- Traducción de contenido educativo y divulgativo: convertir materiales didácticos del inglés al cachemir para su uso en escuelas y universidades de la región, aprovechando la normalización del `IndicProcessor` para mantener la coherencia terminológica.
- Atención al cliente en cachemir: integrar el modelo en un sistema de soporte que reciba consultas en inglés y las traduzca automáticamente al cachemir para agentes locales, reduciendo la barrera idiomática en servicios públicos o privados.
- Preservación y digitalización lingüística: traducir documentos históricos o administrativos al cachemir para ampliar el corpus digital de esta lengua minoritaria, contribuyendo a su conservación.
- Subtitulado de vídeos: generar subtítulos en cachemir a partir de transcripciones en inglés, con la posibilidad de ajustar la longitud de salida mediante `max_length` y `num_beams`.
- Traducción de noticias y boletines: convertir artículos periodísticos en inglés a cachemir para medios locales, manteniendo la fidelidad del contenido gracias a la penalización de repetición y el bloqueo de n-gramas repetidos.
- Investigación en PLN para lenguas de bajos recursos: servir como punto de partida para experimentos de adaptación de modelos multilingües a lenguas minoritarias, dado su tamaño reducido y su licencia permisiva.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre un conjunto de validación de 1.000 pares de frases de BPCC, utilizando la métrica oficial de la competición KATHE 2026 (sacrebleu + KashmiriNormalizer):

| Metrica | Puntuacion |
|---|---|
| BLEU | 17,03 |
| chrF++ | 43,90 |
| Media geometrica | 27,34 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Con 211,7 millones de parámetros, el modelo en FP32 ocupa aproximadamente 850 MB; en FP16, unos 425 MB. Esto permite su ejecución en GPUs consumer con 4 GB de VRAM o más, como una RTX 3050 o superior.
- También puede ejecutarse en CPU para inferencia de baja latencia, aunque el rendimiento será menor; no se han publicado mediciones de throughput.
- El despliegue se realiza mediante la librería `transformers` con `trust_remote_code=True`, ya que el modelo usa código personalizado de IndicTrans2.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, al tratarse de una arquitectura encoder-decoder no soportada por esas herramientas.
- El repositorio de GitHub menciona un envoltorio FastAPI para exponer el modelo como servicio HTTP, aunque no se detalla su implementación.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de traducción inglés-cachemir con los que comparar directamente. El modelo base IndicTrans2 (200M) es la referencia más cercana, pero no se han publicado resultados específicos para la dirección en-ks en la documentación consultada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado únicamente en la dirección inglés-cachemir; no admite otras combinaciones de idiomas.
- La calidad de la traducción es limitada (BLEU 17,03), por lo que puede producir errores de gramática o de sentido en frases complejas o con vocabulario técnico.
- No se han documentado sesgos específicos, pero al entrenarse sobre un corpus paralelo limitado, es probable que refleje los sesgos presentes en los datos de BPCC.
- La longitud de contexto no está especificada; se recomienda mantener las frases de entrada cortas (menos de 128 tokens) para evitar degradación.
- Aunque la licencia del modelo es MIT, el modelo base (IndicTrans2) y el dataset BPCC tienen sus propias licencias upstream que deben revisarse antes de un uso comercial.
- No es compatible con herramientas de inferencia estándar para LLMs (GGUF, Ollama, vLLM), lo que limita su integración en pipelines que dependan de esos formatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hydergaxii/vaakh1-en-kas
- Repositorio de código y documentación: https://github.com/aicodealchemist/vaakh1-kathe2026
- Modelo base IndicTrans2: https://huggingface.co/ai4bharat/indictrans2-en-indic-dist-200M
- Dataset BPCC: https://huggingface.co/datasets/ai4bharat/BPCC
