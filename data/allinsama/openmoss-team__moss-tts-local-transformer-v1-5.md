# Allinsama/OpenMOSS-Team__MOSS-TTS-Local-Transformer-v1.5

## Resumen

MOSS-TTS-Local-Transformer-v1.5 es un modelo de síntesis de voz (text-to-speech) desarrollado por OpenMOSS y MOSI.AI, continuación directa de MOSS-TTS-Local-Transformer-v1.0. Con 4.550.403.584 parámetros (aproximadamente 4,55 mil millones), está diseñado para generación de voz de alta fidelidad, clonación de voz zero-shot, narración de formato largo y síntesis multilingüe con capacidad de code-switching. La versión 1.5 incorpora el tokenizador de audio MOSS-Audio-Tokenizer-v2, que permite entrada y salida estéreo nativa a 48 kHz, mejorando la sensación espacial y la calidad percibida del audio.

El modelo cubre 31 idiomas, incluyendo español, inglés, chino, japonés, coreano, árabe, hindi y una amplia representación de lenguas europeas y del sudeste asiático. Entre las mejoras respecto a v1.0 destacan una clonación de voz más estable, mejor seguimiento de la prosodia marcada por puntuación, mayor robustez en escenarios de referencia larga con texto corto y control explícito de pausas mediante marcadores inline como `[pause 3.2s]`. También conserva el control de duración a nivel de token y el control de pronunciación mediante Pinyin e IPA.

La relevancia actual del modelo radica en que ofrece capacidades de clonación y síntesis multilingüe de alta calidad bajo licencia Apache 2.0, lo que facilita su uso comercial e integración en productos. El repositorio ocupa 9,1 GB y los pesos se distribuyen en formato safetensors, con código personalizado (`moss_tts_local`) que requiere una versión reciente de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para síntesis de voz (denominado Local Transformer), con tokenizador de audio MOSS-Audio-Tokenizer-v2. No se detalla en la información disponible si es autorregresivo, no autorregresivo o híbrido |
| Parametros totales | 4.550.403.584 (aproximadamente 4,55 mil millones) |
| Parametros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No disponible; no se documenta una ventana de contexto textual. La generación se realiza sobre el texto de entrada y el audio de referencia |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors y no se listan variantes GGUF, AWQ, GPTQ ni int8/int4 oficiales |
| Idiomas soportados | 31: chino (zh), cantonés (yue), inglés (en), árabe (ar), checo (cs), danés (da), neerlandés (nl), finés (fi), francés (fr), alemán (de), griego (el), hebreo (he), hindi (hi), húngaro (hu), italiano (it), japonés (ja), coreano (ko), macedonio (mk), malayo (ms), persa (fa), polaco (pl), portugués (pt), rumano (ro), ruso (ru), español (es), suajili (sw), sueco (sv), tagalo (tl), tailandés (th), turco (tr), vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; repositorio de 9,1 GB; requiere código personalizado (`custom_code`) y la librería Transformers |

## Arquitectura y entrenamiento

La información disponible indica que MOSS-TTS-Local-Transformer-v1.5 es un modelo Transformer para TTS que sustituye el tokenizador de audio de v1.0 por MOSS-Audio-Tokenizer-v2. Este tokenizador permite modelar audio estéreo nativo a 48 kHz, lo que se traduce en una representación más rica de la escena espacial y en una calidad percibida más natural. El modelo se ejecuta mediante la librería Transformers con código personalizado y se recomienda Transformers 5.0.0, o una versión reciente con soporte para Qwen3, para evitar conflictos de dependencias.

El entrenamiento se plantea como un continued training a partir de v1.0. La versión 1.5 amplía el entrenamiento multilingüe continuado a nuevos idiomas, incorporando cantonés, neerlandés, finés, hindi, macedonio, malayo, rumano, suajili, tagalo, tailandés y vietnamita. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. Las innovaciones documentadas se centran en la representación de audio estéreo, la estabilidad de la clonación, el control explícito de pausas y el control de prosodia y pronunciación.

## Capacidades

- Generación de voz a partir de texto con calidad de audio estéreo a 48 kHz.
- Clonación de voz zero-shot a partir de audio de referencia, con mejoras de similitud y reducción de varianza en v1.5.
- Generación de voz de formato largo, adecuada para narración continua y audiolibros.
- Control de duración a nivel de token, que permite ajustar la longitud de la locución.
- Control de pronunciación mediante Pinyin e IPA.
- Síntesis multilingüe en 31 idiomas, con soporte de etiquetas de idioma para mejorar la calidad cuando se especifica (`language="French"`, por ejemplo).
- Code-switching, es decir, mezcla de idiomas dentro de una misma locución.
- Inserción de pausas explícitas mediante marcadores inline como `[pause 3.2s]`.
- Mejor seguimiento de la prosodia derivada de la puntuación, especialmente en frases largas.
- Manejo más robusto de referencias de audio mucho más largas que el texto objetivo.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-step ni visión, al tratarse de un modelo especializado en síntesis de voz.

## Casos de uso

- **Audiolibros y narración de formato largo**: el modelo puede sintetizar capítulos completos manteniendo una voz consistente gracias a la clonación zero-shot y a la generación de formato largo. Los marcadores de pausa permiten introducir silencios controlados entre secciones.
- **Doblaje y localización multilingüe**: con 31 idiomas y code-switching, se puede generar una misma locución en español, inglés, francés o japonés, manteniendo el timbre de la voz original mediante clonación. Es adecuado para catálogos de vídeo y formación corporativa.
- **Asistentes de voz y atención al cliente**: integración en flujos de IVR o asistentes conversacionales para generar respuestas habladas con una voz de marca personalizada. La estabilidad de clonación de v1.5 reduce la variación entre turnos.
- **Accesibilidad y lectura de contenido**: conversión de artículos, documentación o correos a audio para personas con discapacidad visual o dificultades de lectura, con control de velocidad mediante duración a nivel de token.
- **Producción de pódcast y contenido editorial**: generación de introducciones, cuñas y locuciones con audio estéreo a 48 kHz, aprovechando la calidad espacial para mezclas profesionales.
- **Educación de idiomas y entrenamiento de pronunciación**: uso del control Pinyin/IPA para generar ejemplos con pronunciación corregida, útil en aplicaciones de aprendizaje de chino o de fonética inglesa.
- **Publicidad y mensajes IVR con pausas explícitas**: creación de mensajes con énfasis y silencios medidos, por ejemplo `[pause 3.2s]` antes de una promoción o un número de teléfono, sin necesidad de edición posterior.
- **Prototipado de voces para videojuegos y personajes**: generación rápida de voces de personaje a partir de una referencia corta, con variaciones de idioma para versiones regionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de v1.5 remite a la README de MOSS-TTS-Local-Transformer-v1.0 para las tablas de evaluación completas, pero no se incluyen cifras numéricas en los datos proporcionados. No se deben asumir valores de MMLU, HumanEval, GSM8K ni métricas TTS como WER, MOS o similitud de hablante sin consultar la documentación original.

## Requisitos de hardware

- **VRAM estimada en bf16/fp16**: los pesos suman aproximadamente 9,1 GB; con activaciones, buffers del tokenizador de audio y overhead de PyTorch, se estiman entre 12 y 16 GB de VRAM.
- **VRAM estimada en int8**: entre 8 y 10 GB, aunque no se publican checkpoints cuantizados oficiales.
- **VRAM estimada en int4**: entre 6 y 8 GB, igualmente sin cuantizaciones oficiales disponibles.
- **GPU recomendadas**: NVIDIA A100 (40/80 GB) o H100 para despliegue con batch y alta concurrencia; L40S (48 GB) como alternativa de inferencia.
- **GPU de consumo**: cabe en RTX 4090 y RTX 3090 de 24 GB en bf16. En tarjetas de 16 GB probablemente sea necesario int8, y en tarjetas de 8-12 GB habría que recurrir a int4, con riesgo de mayor latencia.
- **Opciones de despliegue**: PyTorch con Transformers 5.0.0 o versión reciente con soporte Qwen3, instalación desde el repositorio de GitHub con `pip install -e ".[torch-runtime]"`. FlashAttention 2 es opcional y recomendable para reducir memoria y acelerar la inferencia. No se confirma soporte para vLLM, TGI, llama.cpp, Ollama ni otros motores de inferencia estándar, debido al código personalizado del modelo.
- **Latencia y throughput**: no disponibles en la información proporcionada. Dependerán de la GPU, del uso de FlashAttention 2, de la longitud del texto y del audio de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MOSS-TTS-Local-Transformer-v1.5 | 4,55 B | 31 | Apache 2.0 | HuggingFace, ModelScope, GitHub | Audio estéreo 48 kHz, clonación zero-shot, control de pausas y pronunciación |
| MOSS-TTS-Local-Transformer-v1.0 | No disponible en la información | 20 | Apache 2.0 | HuggingFace | Predecesor directo; v1.5 mejora clonación, prosodia y cobertura de idiomas |
| XTTS-v2 (Coqui) | Aproximadamente 467 M | 17 | CPML (uso no comercial) | HuggingFace | Clonación zero-shot y multilingüe; licencia restrictiva para producción comercial |
| CosyVoice2-0.5B | Aproximadamente 0,5 B | Multilingüe, principalmente chino, inglés, japonés, coreano y cantonés | Apache 2.0 | HuggingFace, GitHub | Orientado a síntesis multilingüe y control de voz; menor número de idiomas documentados |
| F5-TTS | Aproximadamente 336 M | Chino e inglés | CC-BY-NC 4.0 para el modelo | HuggingFace, GitHub | Síntesis no autorregresiva con clonación; licencia no comercial para el modelo |

Los datos de modelos comparables provienen de sus fichas públicas y deben verificarse antes de un despliegue en producción. En la información proporcionada no se incluyen métricas comparativas de calidad de audio, latencia ni similitud de hablante entre estos modelos.

## Limitaciones y advertencias

- **Riesgo de uso indebido de clonación de voz**: la clonación zero-shot puede emplearse para suplantar identidades. Es necesario implementar consentimiento explícito, verificación de locutor y mecanismos de trazabilidad antes de un uso comercial.
- **Ausencia de filtros de seguridad documentados**: la información disponible no describe moderación de contenido ni marcas de agua de audio. En producción conviene añadir controles propios.
- **Calidad desigual entre idiomas**: v1.5 amplía a 31 idiomas, pero no se publican métricas por idioma. Los idiomas con menos datos, como suajili, tagalo o macedonio, pueden presentar mayor tasa de errores de pronunciación.
- **Degradación si se omite la etiqueta de idioma**: la propia model card advierte de que, sin el campo `language`, v1.5 puede mejorar algunos idiomas y empeorar ligeramente otros respecto a v1.0. Se recomienda especificar siempre el idioma.
- **Riesgo de artefactos y alucinaciones acústicas**: como todo modelo generativo de audio, puede producir ruidos, prosodia anómala o pronunciaciones incorrectas en textos ambiguos, siglas o nombres propios.
- **Dependencia de código personalizado**: requiere Transformers 5.0.0 o una versión reciente con soporte Qwen3 y el paquete `moss_tts_local`. Esto complica la integración con motores de inferencia estándar y puede generar conflictos de dependencias.
- **Sin cuantizaciones oficiales**: no se publican versiones GGUF, AWQ, GPTQ ni int8/int4, por lo que el despliegue en hardware limitado requiere cuantización manual y validación adicional.
- **Longitud de contexto no documentada**: no se especifica el límite máximo de texto ni de audio de referencia. Los textos muy largos deberán dividirse en segmentos.
- **Licencia Apache 2.0 y derechos de terceros**: la licencia del modelo permite uso comercial, pero no cubre los derechos sobre las voces clonadas ni sobre los datos de entrenamiento. Es responsabilidad del integrador verificar la procedencia de las referencias de audio.
- **Sesgos potenciales**: no se documentan análisis de sesgo por género, acento, edad o variedad dialectal. El rendimiento puede variar en voces fuera de la distribución de entrenamiento.
- **Ausencia de benchmarks públicos en la información disponible**: no se pueden comparar de forma cuantitativa la calidad o la latencia con alternativas sin consultar la documentación original del proyecto.

## Enlaces

- [Modelo en HuggingFace (OpenMOSS-Team)](https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5)
- [Repositorio espejo en HuggingFace (Allinsama)](https://huggingface.co/Allinsama/OpenMOSS-Team__MOSS-TTS-Local-Transformer-v1.5)
- [Modelo predecesor v1.0](https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Local-Transformer)
- [Tokenizador de audio MOSS-Audio-Tokenizer-v2](https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2)
- [Repositorio GitHub de MOSS-TTS](https://github.com/OpenMOSS/MOSS-TTS)
- [Código del modelo en GitHub](https://github.com/OpenMOSS/MOSS-TTS/tree/main/moss_tts_local)
- [Colección en ModelScope](https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS)
- [Artículo en arXiv 2603.18090](https://arxiv.org/abs/2603.18090)
- [Blog de MOSI.AI](https://mosi.cn/#models)
- [AI Studio para probar el modelo](https://studio.mosi.cn)
- [Documentación de la API](https://studio.mosi.cn/docs/moss-tts)
- [Cuenta de Twitter de OpenMOSS](https://x.com/Open_MOSS)
- [Servidor de Discord](https://discord.gg/fvm5TaWjU3)
- [Ficha en metatext.io](https://www.metatext.io/models/openmoss-team-moss-tts-local-transformer-v1.5)
