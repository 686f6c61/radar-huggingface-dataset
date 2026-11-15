# MacEpic/fluid-speech-pro-coreml

## Resumen

Fluid Speech Pro Core ML es la conversión a Core ML del modelo de reconocimiento automático del habla (ASR) Fluid Speech Pro, desarrollado por FluidVoice. Esta copia concreta la publica MacEpic en Hugging Face con el único propósito de que la aplicación TextSniper pueda descargarla en una revisión fija; no contiene modificaciones propias del publicador, sino que replica byte a byte los 24 ficheros del repositorio original de FluidVoice (652.324.639 bytes). El modelo se distribuye como un conjunto de cuatro submodelos Core ML compilados (Preprocessor, Encoder, Decoder y JointDecision) que implementan una arquitectura del tipo Parakeet TDT.

La relevancia de esta ficha radica en que permite ejecutar un ASR multilingüe de 24 idiomas europeos directamente en hardware Apple mediante Core ML, sin depender de servicios en la nube. Al estar construido sobre NVIDIA Parakeet TDT 0.6B v3 y Moondream Parakeet Ultra, hereda la arquitectura de decodificación TDT (Token-and-Duration Transducer) y un tamaño de aproximadamente 0,6 mil millones de parámetros, lo que lo sitúa en la franja de modelos ASR ligeros aptos para inferencia en dispositivo.

El interés práctico es doble: por un lado, ofrece una vía de despliegue nativa en macOS/iOS con aceleración por Neural Engine y GPU de Apple; por otro, su licencia CC BY 4.0 permite uso comercial con atribución, algo poco habitual en modelos ASR de esta calidad. La información pública disponible sobre benchmarks, contexto de audio y detalles de entrenamiento es, sin embargo, muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), exportada a Core ML en cuatro submodelos (Preprocessor, Encoder, Decoder, JointDecision) |
| Parámetros totales | aproximadamente 0,6 mil millones (heredado de NVIDIA Parakeet TDT 0.6B v3; no se detalla el desglose exacto) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; no se especifica la duración máxima de audio) |
| Tipos de cuantización | no disponible (se distribuye como `.mlmodelc` compilados; no se indican precisiones float16/int8) |
| Idiomas soportados | 24: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML compilado (`.mlmodelc`), más `config.json` y `parakeet_vocab.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Parakeet TDT, un transductor (transducer) con decodificación conjunta que predice tanto tokens como duraciones, lo que permite un alineamiento más eficiente que los transductores clásicos y reduce el coste de decodificación en streaming y por lotes. La implementación concreta se divide en cuatro redes Core ML: un preprocesador de audio (extracción de features), un encoder acústico, un decoder de predicción y un módulo de decisión conjunta (JointDecision) que combina ambas representaciones. Esta separación es típica de las exportaciones Core ML de modelos transducer y facilita la ejecución por etapas en el Neural Engine.

El modelo base es FluidVoice-Labs/fluid-speech-pro, que a su vez se construye sobre NVIDIA Parakeet TDT 0.6B v3 y Moondream Parakeet Ultra, ambos bajo CC BY 4.0. No se dispone de información pública sobre el número de horas de audio de entrenamiento, la composición exacta del dataset, el uso de técnicas de aumento de datos ni si se aplicaron etapas de ajuste fino supervisado o preferencias. Tampoco se documentan innovaciones adicionales más allá de la propia arquitectura TDT y la exportación a Core ML.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 24 idiomas europeos.
- Soporte multilingüe amplio dentro del espacio de lenguas indoeuropeas y urálicas (búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano).
- Ejecución en dispositivo mediante Core ML, con posible aprovechamiento de Neural Engine y GPU de Apple.
- Arquitectura transducer con decodificación conjunta, adecuada para transcripción por lotes y potencialmente para streaming (no confirmado en la documentación).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo "thinking"; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones en macOS: la aplicación puede cargar los cuatro submodelos Core ML y transcribir audio de reuniones en cualquiera de los 24 idiomas soportados sin enviar datos a la nube, lo que resulta adecuado por privacidad y por la licencia CC BY 4.0.
- Subtitulado automático de vídeo en producciones multilingües: el modelo cubre lenguas como checo, húngaro o estonio que a menudo quedan fuera de los ASR comerciales, y su formato Core ML permite integrarlo en herramientas nativas de Apple.
- Dictado por voz en aplicaciones de escritorio: con un tamaño de repo de 0,7 GB, el modelo cabe en el disco de un Mac moderno y puede cargarse bajo demanda para dictado en editores de texto o IDE.
- Accesibilidad: transcripción en tiempo real de conversaciones para personas con discapacidad auditiva, aprovechando la ejecución local para evitar latencia de red y problemas de privacidad.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grabaciones de entrevistas, podcasts o llamadas para generar índices de texto buscables, usando la API de Core ML en un pipeline de procesamiento por etapas.
- Extracción de texto de notas de voz en apps de productividad: integración en aplicaciones tipo TextSniper (el caso de uso declarado por el publicador) para convertir notas de voz en texto editable.
- Procesamiento en dispositivos iOS/iPadOS: al ser Core ML, puede integrarse en apps móviles de Apple para transcripción offline, siempre que se respeten los requisitos de memoria del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: no disponible de forma explícita; el repositorio ocupa 0,7 GB, por lo que se espera un consumo de memoria moderado, aunque la cifra exacta en inferencia no está documentada.
- GPU recomendadas: hardware Apple con soporte Core ML (Apple Silicon M1/M2/M3/M4 y posteriores; también GPU AMD en Mac Intel con las limitaciones propias de Core ML).
- ¿Cabe en GPU de consumo? Sí, en el ecosistema Apple; no está pensado para GPU NVIDIA/AMD de PC, ya que el formato es Core ML y no GGUF/safetensors.
- Opciones de despliegue: Core ML (framework nativo de Apple), Vision framework para integración en apps, y potencialmente conversión a otros formatos no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto/duración | Licencia | Formato |
|---|---|---|---|---|---|
| Fluid Speech Pro Core ML (este) | ~0,6 B | 24 europeos | no disponible | CC BY 4.0 | Core ML |
| NVIDIA Parakeet TDT 0.6B v3 | ~0,6 B | multilingüe (según model card de NVIDIA) | no disponible en esta ficha | CC BY 4.0 | NeMo/safetensors |
| Moondream Parakeet Ultra | no disponible | no disponible | no disponible | CC BY 4.0 | no disponible |
| Whisper large-v3 (referencia habitual) | ~1,55 B | ~99 | 30 s por ventana | MIT (según versión) | safetensors/GGUF |

La comparación con Whisper se incluye como referencia de categoría, pero los datos de rendimiento de Fluid Speech Pro no están publicados en la información disponible, por lo que no puede establecerse una comparación cuantitativa.

## Limitaciones y advertencias

- La model card es explícitamente una copia de terceros: MacEpic no ha modificado ningún fichero, pero tampoco ofrece garantías adicionales sobre el modelo.
- No se documentan sesgos conocidos, pero al ser un ASR entrenado sobre datos no especificados, es probable que presente sesgos dialectales y de género no cuantificados.
- Riesgo de alucinación en transcripciones: los modelos transducer pueden generar texto plausible en segmentos de audio ruidosos o silenciosos; no se documenta mitigación.
- Limitaciones de contexto: no se especifica la duración máxima de audio procesable ni el comportamiento en streaming.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribución obligatoria ("Fluid Speech Pro by FluidVoice. Built on NVIDIA Parakeet TDT 0.6B v3 and Moondream Parakeet Ultra."). Es necesario conservar LICENSE y NOTICE.
- Dependencia del ecosistema Apple: el formato Core ML limita su uso a macOS/iOS; no es directamente utilizable en Linux o Windows sin conversión.
- Cobertura idiomática limitada a 24 lenguas europeas; no cubre árabe, chino, japonés, coreano ni lenguas africanas o asiáticas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/MacEpic/fluid-speech-pro-coreml
- Modelo base: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro
- Repositorio Core ML original: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-coreml
- Commit de referencia: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-coreml/tree/3b9d38a93d606f84011e5a0a669b7ea146375a22
- NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Moondream Parakeet Ultra: https://huggingface.co/moondream/parakeet-ultra
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
