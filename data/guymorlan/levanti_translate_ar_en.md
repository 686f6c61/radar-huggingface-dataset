# guymorlan/levanti_translate_ar_en

## Resumen

Levanti es un modelo de traducción automática especializado en árabe levantino coloquial hacia inglés, desarrollado por Guy Mor-Lan (Universidad Hebrea de Jerusalén) y publicado en Hugging Face bajo el identificador `guymorlan/levanti_translate_ar_en`. Se trata de un fine-tuning de Helsinki-NLP/opus-mt-ar-en, un modelo MarianMT de tipo encoder-decoder, entrenado durante 8 épocas sobre el dataset Levanti, también del mismo autor.

El problema que aborda es concreto: los traductores genéricos entrenados en árabe moderno estándar (MSA) rinden mal sobre dialectos coloquiales, y el levantino (palestino, jordano, sirio, libanés y egipcio) es una de las variedades con menos recursos paralelos de calidad. El modelo cubre esos cinco dialectos y produce inglés a partir de texto conversacional.

Con 76.372.338 parámetros totales y un repositorio de 0,3 GB, es un modelo compacto que puede ejecutarse en CPU o en GPUs de consumo. Su relevancia actual reside en la escasez de traductores abiertos específicamente entrenados para árabe dialectal, lo que lo convierte en una pieza útil para pipelines de análisis de contenido en redes sociales, subtitulado o moderación en contextos de habla levantina.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parámetros totales | 76.372.338 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; admite cuantización estándar vía transformers/bitsandbytes) |
| Idiomas soportados | Árabe (levantino coloquial: palestino, jordano, sirio, libanés, egipcio) → inglés |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un MarianMT, la arquitectura de traducción neuronal de Marian NMT implementada en la librería transformers. Se trata de un transformer encoder-decoder estándar, sin mezcla de expertos ni mecanismos de atención lineal. Parte del checkpoint Helsinki-NLP/opus-mt-ar-en, que ya está preentrenado para árabe-inglés, y se ha afinado durante 8 épocas sobre el dataset Levanti.

El dataset Levanti (guymorlan/levanti) está compuesto por pares de traducción de árabe levantino coloquial a inglés. La model card no detalla el número de tokens, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO; en un modelo de traducción de este tipo lo habitual es entrenamiento supervisado sobre pares paralelos, pero ese dato no está confirmado en la información disponible. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción de texto de árabe levantino coloquial a inglés, en una sola dirección.
- Cobertura de cinco dialectos: palestino, jordano, sirio, libanés y egipcio.
- Manejo de registro conversacional y expresiones coloquiales, como ilustra el ejemplo de la model card ("بدي أروح ع الدكان بكرا" → "I want to go to the store tomorrow").
- Integración directa con el pipeline `translation` de transformers.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta capacidad multilingüe más allá del par árabe-inglés.

## Casos de uso

- Subtitulado y localización de contenido audiovisual en árabe levantino: el modelo traduce diálogos coloquiales de series, entrevistas o vídeos de creadores de Palestina, Jordania, Siria, Líbano o Egipto, un registro que los traductores basados en MSA suelen malinterpretar.
- Análisis de redes sociales y monitorización de opinión: permite procesar publicaciones y comentarios en dialecto levantino y volcarlos a inglés para su clasificación, análisis de sentimiento o agregación en paneles de escucha social.
- Moderación de contenido en plataformas: traducción de mensajes reportados en árabe coloquial para que equipos que no hablan árabe puedan revisarlos, aprovechando que el modelo es pequeño y puede desplegarse on-premise sin enviar datos a terceros.
- Investigación en lingüística de corpus: generación de glosas inglesas automáticas sobre corpus dialectales para estudios de variación léxica y sintáctica entre los cinco dialectos cubiertos.
- Asistencia a ONG y organizaciones humanitarias: traducción de testimonios, formularios o comunicaciones de población levantina, con la ventaja de que el modelo cabe en infraestructura modesta.
- Prototipado rápido de aplicaciones de traducción: al ser un modelo de 76 M de parámetros y 0,3 GB, se puede servir en CPU con latencia aceptable para demos, MVPs o entornos de desarrollo sin GPU.
- Preprocesado en pipelines de NLP: traducción previa al inglés de textos levantinos para alimentar modelos posteriores (clasificadores, extractores de entidades) entrenados solo en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas BLEU, chrF, COMET ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 150-300 MB en fp32 para los pesos (76 M de parámetros), y menos de 150 MB en fp16 o int8. El repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para ellas.
- Cabe holgadamente en GPU de consumo: GTX 1050, GTX 1650, RTX 2060 o superiores; también en iGPU y en CPU.
- Opciones de despliegue: transformers (pipeline `translation`), Hugging Face Inference Endpoints (el tag `endpoints_compatible` está presente), y exportación a ONNX o CTranslate2 para servir con mayor throughput. No se documenta soporte nativo de llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por frase en GPU y de decenas a centenares de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guymorlan/levanti_translate_ar_en | 76,4 M | no disponible | Árabe levantino → inglés | CC BY-SA 4.0 | Hugging Face |
| Helsinki-NLP/opus-mt-ar-en | no disponible en la información | no disponible | Árabe (MSA) → inglés | CC BY 4.0 (habitual en OPUS-MT; verificar en el repo) | Hugging Face |
| NLLB-200 (facebook) | hasta 54,5 B (versión 600M y 1,3B como alternativas prácticas) | no disponible | 200 idiomas, incluido árabe | CC BY-NC 4.0 (restricción comercial en algunas variantes) | Hugging Face |
| MADLAD-400 (Google) | 3B y 7B | no disponible | más de 400 idiomas | Apache 2.0 / CC BY 4.0 según variante | Hugging Face |

La comparación cualitativa es clara: frente a opus-mt-ar-en, Levanti está especializado en dialecto coloquial y no en MSA; frente a NLLB-200 y MADLAD-400, es mucho más pequeño y ligero, pero cubre un único par de idiomas y una única dirección. No hay datos de rendimiento comparativo publicados para respaldar afirmaciones cuantitativas.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de árabe levantino a inglés; no soporta la dirección inversa.
- Cobertura dialectal limitada a cinco variedades; otros dialectos árabes (golfo, magrebí, iraquí) quedan fuera del ámbito declarado.
- Riesgo de alucinación y de traducciones plausibles pero incorrectas en expresiones idiomáticas o jerga muy local, dado el tamaño reducido del modelo y la ausencia de métricas publicadas.
- Sesgos potenciales derivados del dataset Levanti: no se documenta su composición, tamaño ni método de recogida, por lo que no se puede evaluar la representatividad demográfica ni el equilibrio de registros.
- La licencia CC BY-SA 4.0 exige atribución y compartir las obras derivadas bajo la misma licencia; esto puede ser incompatible con productos comerciales cerrados que no quieran liberar sus adaptaciones.
- No se documenta el límite de longitud de entrada; los modelos Marian suelen truncar secuencias largas, por lo que textos extensos deben segmentarse.
- El modelo se actualizó por última vez en noviembre de 2026 según los metadatos, pero la model card no refleja cambios respecto al entrenamiento original de 2024; conviene verificar el estado real del repositorio antes de usarlo en producción.
- Solo 60 descargas y 0 likes en el momento de la consulta: es un modelo de nicho con poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guymorlan/levanti_translate_ar_en
- Dataset Levanti: https://huggingface.co/datasets/guymorlan/levanti
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ar-en
- Contacto del autor: guy.mor AT mail.huji.ac.il
