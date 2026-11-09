# rao-studios/kokoro-82m-coreml-en

## Resumen

`rao-studios/kokoro-82m-coreml-en` es un paquete de voces para síntesis de voz (text-to-speech) en dispositivo, derivado del modelo abierto Kokoro-82M de hexgrad. No se trata de un modelo entrenado desde cero, sino de una compilación a Core ML de los pesos y el front-end lingüístico de Kokoro, empaquetada junto con ocho voces en inglés (americanas, británica y una con acento hindi). Lo publica Rao Studios, el estudio responsable de la aplicación macOS Adverb, que lo utiliza para narrar voice-overs localmente sin enviar datos a ningún servidor.

El modelo subyacente, Kokoro-82M (versión 1.0), es un TTS de 82 millones de parámetros que ofrece una calidad comparable a modelos mucho mayores con un coste computacional muy inferior. Esta variante concreta no reentrena ni modifica los pesos: los archivos proceden de `hexgrad/Kokoro-82M` y de `FluidInference/kokoro-82m-coreml` (ambos con licencia Apache-2.0), compilados para Core ML y publicados junto con la licencia.

La relevancia de esta ficha está en su orientación práctica: es un activo listo para integrarse en aplicaciones Apple con inferencia 100 % local, basado en ventanas de audio de 10 y 15 segundos (242 y 363 tokens de fonemas) a 24 kHz, con alineación temporal por fonema y sin dependencia de espeak para la conversión grafema-fonema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro (TTS neuronal, estilo StyleTTS2 con decoder basado en iSTFTNet, segun el modelo base); empaquetado como modelos Core ML compilados (`.mlmodelc`) mas front-end G2P tipo BART (encoder/decoder) |
| Parametros totales | 82 M (modelo Kokoro); el paquete incluye ademas un `G2PEncoder`/`G2PDecoder` y vectores de estilo por voz |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica como contexto de texto: ventanas de audio de 10 s (242 tokens de fonemas) y 15 s (363 tokens de fonemas) |
| Tipos de cuantizacion | no disponible (pesos Core ML compilados; sin variantes GGUF/INT8 documentadas en la informacion) |
| Idiomas soportados | ingles (`en`): americano, britanico y acento hindi |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML compilado (`weight.bin` dentro de `.mlmodelc`), JSON para lexicos y vectores de estilo; sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Kokoro-82M es un modelo TTS de 82 millones de parámetros que adopta la arquitectura de StyleTTS2 con un decoder iSTFTNet, según la documentación pública del proyecto hexgrad/kokoro. No se dispone de información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de RLHF/DPO del modelo base.

Esta variante es un despliegue, no un entrenamiento nuevo: el autor declara explícitamente que no se ha reentrenado ni editado nada, y que los archivos son los de los proyectos upstream (compilados para Core ML cuando se indica). El paquete contiene dos ventanas de inferencia (`kokoro_24_10s` y `kokoro_24_15s`, de 10 y 15 segundos, con 242 y 363 tokens de fonemas), ocho vectores de estilo de voz (256 floats por recuento de fonemas, más su media), y el front-end completo: `vocab_index.json`, lexicones de estilo misaki, caché G2P y un modelo BART `G2PEncoder`/`G2PDecoder` para palabras desconocidas, sin espeak.

La innovación práctica del paquete es la alineación temporal: cada ventana informa de la duración de cada fonema, lo que permite obtener el inicio y fin exacto de cada palabra y sincronizar subtítulos o texto en pantalla con la narración. Además, su diseño es extensible: se pueden añadir otros idiomas colocando su lexicón y sus voces junto a las existentes.

## Capacidades

- Síntesis de voz en inglés a 24 kHz con ocho voces: `af_heart`, `af_alloy`, `af_nova`, `af_river`, `am_adam`, `am_echo`, `bf_alice` y `hm_omega` (esta última con acento hindi).
- Generación de audio por ventanas de 10 s y 15 s (242 y 363 tokens de fonemas), con concatenación de fragmentos en sus pausas naturales.
- Conversión grafema-fonema local: lexicones integrados (`us_gold`, `us_silver`, `gb_gold`, `gb_silver`) más modelo G2P neuronal para palabras desconocidas; sin dependencia de espeak.
- Alineación temporal por fonema y por palabra, útil para subtítulos, karaoke y sincronización de texto en pantalla.
- Inferencia 100 % en dispositivo (on-device) con Core ML, sin llamadas a red.
- Etiquetado como pipeline `text-to-speech`; no se documentan capacidades de tool calling, agentes ni multimodalidad (no aplica a un TTS).
- No se documenta soporte multilingüe más allá del inglés (aunque la arquitectura está preparada para añadir idiomas).

## Casos de uso

- **Narración de vídeo con subtítulos sincronizados**: usar la duración por fonema que reporta cada ventana para colocar el texto en pantalla en la primera palabra de cada fragmento, sincronizando subtítulos con precisión de palabra.
- **Voice-over en aplicaciones macOS**: integrar los `.mlmodelc` en una app nativa y generar voz en local, sin enviar texto a servidores, con latencia de inferencia en el propio dispositivo y sin costes de API.
- **Accesibilidad y lectura de pantalla**: convertir texto de interfaz, documentos o notificaciones en audio con diferentes voces americanas o británicas según preferencia del usuario, manteniendo la privacidad del contenido.
- **Contenido educativo y audiolibros cortos**: segmentar textos en ventanas de 10 o 15 segundos y concatenar los fragmentos por sus pausas naturales para producir narraciones continuas a 24 kHz.
- **Prototipado rápido de asistentes de voz**: usa el modelo G2P incluido para pronunciar nombres propios o términos técnicos que no estén en los lexicones, sin depender de herramientas externas.
- **Localización de aplicaciones Apple**: añadir lexicones y voces de otros idiomas junto a las existentes (el autor indica que el paquete está diseñado para aceptar más idiomas), reutilizando el mismo pipeline Core ML.
- **Generación de avisos y notificaciones habladas**: sintetizar mensajes cortos con una voz coherente por producto, incluyendo variantes con acento (por ejemplo, `hm_omega` para inglés con acento hindi).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y la búsqueda web no incluyen métricas objetivas (MOS, WER, latencia medida) para esta variante Core ML ni para el modelo base.

## Requisitos de hardware

- **VRAM/RAM**: el paquete ocupa 0,7 GB en el repositorio; los pesos de cada ventana rondan los 324 MB (`kokoro_24_10s` y `kokoro_24_15s`), más unos pocos MB para el G2P y los lexicones JSON. La inferencia requiere memoria unificada del dispositivo, no VRAM de GPU discreta.
- **GPU recomendadas**: al ser Core ML, el destino natural es Apple Silicon (CPU, GPU o Neural Engine). No se documenta soporte para CUDA, A100, H100 ni RTX 4090.
- **¿Cabe en consumer GPU?**: no aplica en el sentido habitual; cabe en cualquier Mac con Apple Silicon o en dispositivos Apple compatibles con Core ML.
- **Opciones de despliegue**: Core ML (`coremltools`/Xcode), integración en apps macOS/iOS; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este formato.
- **Latencia y throughput**: no disponible; el autor no publica cifras, solo describe inferencia local en la app Adverb.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `rao-studios/kokoro-82m-coreml-en` | 82 M | ventanas de 10 s y 15 s | en | Apache-2.0 | Core ML compilado |
| `hexgrad/Kokoro-82M` (base) | 82 M | depende del framework de inferencia (PyTorch) | varios (voces publicadas) | Apache-2.0 | safetensors/PyTorch |
| `FluidInference/kokoro-82m-coreml` | 82 M | ventanas Core ML (origen del front-end y ventanas) | en (y voces del paquete) | Apache-2.0 | Core ML |

No se dispone de datos de benchmarks que permitan comparar calidad o latencia entre estas variantes; la información disponible solo permite comparar formato, licencia y voces incluidas.

## Limitaciones y advertencias

- **No es un modelo entrenado**: es un empaquetado de artefactos upstream; cualquier sesgo o limitación de Kokoro-82M se hereda sin cambios.
- **Idioma**: solo inglés (americano, británico y acento hindi); no hay soporte documentado de castellano.
- **Sesgos**: no se documentan análisis de sesgo en la información disponible; al derivar de un corpus de voz no especificado aquí, la representación de acentos y géneros puede ser limitada.
- **Alucinación/artefactos**: no se documentan métricas de fidelidad; como todo TTS, puede producir pronunciaciones erróneas en palabras fuera de los lexicones, aunque el G2P neuronal mitiga este caso.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero conviene conservar los avisos de licencia y atribución de hexgrad y FluidInference; el paquete incluye su propio `LICENSE`.
- **Compatibilidad**: formato Core ML compilado, ligado al ecosistema Apple; no es portable a entornos CUDA sin reconversión.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto recién publicado (noviembre de 2026) y sin validación comunitaria.
- **Dependencia de la app**: parte de la documentación describe el funcionamiento dentro de Adverb; fuera de esa app hay que implementar el pipeline G2P y la concatenación por pausas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/rao-studios/kokoro-82m-coreml-en
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio GitHub de Kokoro: https://github.com/hexgrad/kokoro
- Origen de las ventanas Core ML y front-end: https://huggingface.co/FluidInference/kokoro-82m-coreml
- Aplicación del autor: https://rao.nyc
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
