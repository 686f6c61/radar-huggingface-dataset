# desert-ant-labs/emo

## Resumen

Emo es un modelo de clasificación de texto desarrollado por Desert Ant Labs, diseñado específicamente para sugerir emojis a partir de frases o palabras cortas, directamente en el dispositivo. El modelo acepta una cadena de texto y devuelve una distribución de probabilidad sobre un vocabulario curado de 812 emojis, optimizado para relevancia top-1. Está pensado para integrarse en aplicaciones de mensajería, calendarios, notas y listas de tareas, donde el usuario escribe una intención y recibe el emoji más adecuado sin necesidad de conexión a red.

Técnicamente, Emo combina dos flujos de procesamiento: un flujo léxico basado en n-gramas de caracteres y palabras con hash, y un flujo semántico que utiliza un embedding estático multilingüe (derivado de Model2Vec y destilado de BAAI bge-m3) reducido a 128 dimensiones y podado a 48 000 tokens. Sobre el flujo semántico se aplica un pequeño transformer encoder de dos capas con atención pooling, y un MLP final fusiona ambos flujos. El modelo completo, junto con su tokenizador, ocupa entre 5 MB (versión Core ML en Apple) y 11 MB (versión LiteRT), y ejecuta la inferencia en menos de 2 milisegundos en hardware móvil. Soporta 22 idiomas, incluyendo árabe, chino, japonés, coreano, tailandés, hindi y la mayoría de las lenguas europeas principales.

La relevancia actual de Emo radica en su enfoque extremadamente ligero y de baja latencia, pensado para entornos on-device donde los modelos grandes de lenguaje no son viables. Su arquitectura híbrida (n-gramas + embeddings semánticos) permite generalizar entre idiomas sin depender de un encoder masivo, y su licencia source-available (no estándar) plantea consideraciones particulares para su uso en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos flujos: n-gramas con hash (flujo léxico) + transformer encoder de 2 capas con atención pooling sobre embeddings semánticos estáticos (flujo semántico); fusión mediante MLP y softmax sobre 812 emojis |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (optimizado para texto corto orientado a intención; configuración de ventana fija en `emo_meta.json`) |
| Tipos de cuantizacion | int8 (LiteRT/TFLite), 4/8-bit palettizado (Core ML), full precision (PyTorch) |
| Idiomas soportados | 22: árabe, checo, danés, alemán, inglés, español, francés, hindi, indonesio, italiano, japonés, coreano, neerlandés, polaco, portugués, ruso, sueco, tailandés, turco, ucraniano, vietnamita, chino (simplificado y tradicional) |
| Licencia | desert-ant-labs-source-available-1.0 (licencia propia, no OSI; enlace: https://license.desertant.com/1.0) |
| Formato de pesos | TFLite/LiteRT (`emo.tflite`), Core ML compilado (`emo.mlmodelc`), PyTorch (`emo.pt`), safetensors (en revisiones anteriores a v0.7.0) |

## Arquitectura y entrenamiento

Emo emplea una arquitectura de dos flujos diseñada para ser compacta y rápida. El flujo léxico procesa n-gramas de caracteres y palabras con conciencia de escritura (latina, han·kana, jamo hangul, clústeres devanagari, sudeste asiático, etc.), que se hashean en una tabla de embeddings firmada de tamaño fijo, independiente del número de idiomas. El flujo semántico utiliza un embedding estático multilingüe congelado, derivado del modelo Model2Vec `potion-multilingual-128M` (a su vez destilado de BAAI bge-m3), reducido mediante PCA a 128 dimensiones y podado al vocabulario de 48 000 tokens relevantes para los 22 idiomas objetivo. Sobre la secuencia de tokens semánticos se aplica un transformer encoder de dos capas con atención pooling, lo que permite componer frases y modismos en lugar de simplemente promediar tokens. Finalmente, un MLP fusiona las salidas de ambos flujos y produce una distribución softmax sobre un vocabulario curado de 812 emojis frecuentes.

El entrenamiento utiliza dropout de n-gramas para forzar que la cabeza de clasificación dependa principalmente del flujo semántico, lo que mejora la generalización entre idiomas. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El modelo se apoya en anotaciones de emojis del estándar Unicode CLDR para el anclaje multilingüe de los datos de entrenamiento. La versión actual (v0.7.0) incluye un tokenizador unigram podado de 750 KB con 48 000 piezas SentencePiece, cuyos identificadores se corresponden con las filas de la tabla semántica.

## Capacidades

- Sugerencia de emojis a partir de texto corto orientado a intención (tareas, eventos de calendario, notas, borradores de mensajes).
- Clasificación multilingüe en 22 idiomas, con generalización cruzada entre lenguas gracias al flujo semántico.
- Inferencia en dispositivo con latencia inferior a 2 ms, apta para aplicaciones en tiempo real.
- Soporte para selección top-1 o top-k sobre la distribución de probabilidad de salida.
- Manejo de palabras fuera de vocabulario mediante el embedding semántico estático.
- Post-procesamiento opcional para tono de piel en emojis compatibles (según la versión del SDK).
- Disponible para múltiples plataformas: iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.js.

## Casos de uso

- Aplicaciones de mensajería: sugerir un emoji mientras el usuario escribe un mensaje corto, reduciendo la fricción de búsqueda manual. La latencia de <2 ms permite integrarlo en el teclado predictivo sin degradar la experiencia.
- Calendario y agenda: asignar automáticamente un emoji a eventos recién creados (por ejemplo, "reunión con cliente" → 💼) para facilitar el escaneo visual del día.
- Listas de tareas y gestores de pendientes: categorizar visualmente tareas por tipo (compras, ejercicio, llamadas) mediante el emoji sugerido, mejorando la organización sin intervención manual.
- Notas rápidas: añadir un emoji a cada nota para identificarla de un vistazo en la lista, especialmente útil en dispositivos móviles con pantallas pequeñas.
- Redes sociales y editores de texto: sugerir emojis contextuales en publicaciones cortas o comentarios, adaptándose al idioma del usuario.
- Accesibilidad: asistir a usuarios con dificultades para expresar emociones o conceptos, ofreciendo emojis relevantes a partir de una frase sencilla en su idioma nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del modelo: 5 MB en formato Core ML (Apple), 11 MB en formato LiteRT (Android, Linux, Node, web).
- Inferencia en menos de 2 ms en dispositivos móviles modernos; no requiere GPU dedicada.
- Compatible con cualquier smartphone actual con iOS o Android, así como con entornos de escritorio y navegador.
- Despliegue mediante SDKs oficiales: Swift (iOS/macOS/tvOS/visionOS), Kotlin (Android) y JavaScript/TypeScript (navegador y Node.js).
- Alternativas de ejecución: LiteRT/TFLite para integración directa, Core ML para plataformas Apple, y el checkpoint PyTorch (`emo.pt`) para retraining o conversión a otros runtimes.

## Comparativa con modelos similares

No disponible. No se han identificado modelos públicos comparables en la misma categoría (sugerencia de emojis en dispositivo con soporte multilingüe y arquitectura ultraligera). Los modelos de clasificación de texto genéricos (p. ej., BERT mini o DistilBERT) tienen propósitos más amplios y tamaños considerablemente mayores, por lo que no constituyen una alternativa directa en términos de latencia y footprint.

## Limitaciones y advertencias

- Optimizado para texto corto orientado a intención; el texto largo o narrativo produce sugerencias más ruidosas.
- La semántica de los emojis es intrínsecamente imprecisa; es esperable que haya empates en las posiciones superiores del ranking.
- La calidad varía entre idiomas; los idiomas con menos recursos dentro del conjunto soportado (p. ej., checo, danés, ucraniano) presentan un rendimiento algo inferior.
- La licencia `desert-ant-labs-source-available-1.0` no es una licencia de código abierto estándar; es necesario revisar sus términos antes de usar el modelo en productos comerciales o redistribuirlo.
- No se proporcionan detalles sobre el dataset de entrenamiento ni sobre posibles sesgos en las asociaciones texto-emoji; se recomienda auditar el comportamiento en dominios específicos.
- El modelo no genera texto ni mantiene conversaciones; su única salida es una distribución sobre 812 emojis.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/emo
- Página oficial del modelo: https://desertant.com/models/emo/
- Repositorio GitHub: https://github.com/Desert-Ant-Labs/emo
- Demo en vivo: https://huggingface.co/spaces/desert-ant-labs/emo-demo
- Documentación de instalación y ejemplos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/emo.md
- Licencia: https://license.desertant.com/1.0
- Embedding base `potion-multilingual-128M`: https://huggingface.co/minishlab/potion-multilingual-128M
- Modelo profesor `bge-m3`: https://huggingface.co/BAAI/bge-m3
- Método Model2Vec: https://github.com/MinishLab/model2vec
