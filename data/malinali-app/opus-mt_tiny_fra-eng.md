# malinali-app/opus-mt_tiny_fra-eng

## Resumen

Malinali opus-mt_tiny_fra-eng es un paquete de pesos de traducción automática francés-inglés derivado del modelo base Helsinki-NLP/opus-mt_tiny_fra-eng (familia OPUS-MT), republicado por el proyecto Malinali para inferencia en dispositivo. Se trata de un modelo de tipo text2text-generation con arquitectura Marian, distribuido en formato safetensors junto a dos tokenizadores rápidos (encoder y decoder) convertidos desde SentencePiece para su uso con Candle a través del binding marian_flutter. Cuenta con 25.363.201 parámetros y un tamaño de repositorio de 0,1 GB, lo que lo sitúa en la gama ultraligera de traducción neuronal.

El problema que resuelve es la traducción sin conexión en entornos de recursos limitados: móvil, escritorio y dispositivos embebidos, donde no es viable ejecutar un modelo de traducción de cientos de millones de parámetros. Al reempaquetar únicamente los pesos y adaptar los tokenizadores, Malinali facilita el despliegue en su aplicación cliente sin reentrenar el modelo original. La relevancia actual reside en la tendencia hacia modelos de traducción pequeños ejecutables en local, con conversión a formatos nativos de runtimes ligeros como Candle.

La dirección de traducción es exclusivamente fra → eng. El repositorio no registra descargas ni interacciones, y la licencia no aparece declarada como campo estructurado, si bien la model card remite a la licencia del modelo de origen (habitualmente CC-BY 4.0 en la familia OPUS-MT).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder, text2text-generation) |
| Parametros totales | 25.363.201 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la familia OPUS-MT suele operar con secuencias de hasta 512 tokens) |
| Tipos de cuantizacion | no disponible; se distribuyen pesos en safetensors sin versiones cuantizadas publicadas |
| Idiomas soportados | fra (origen), eng (destino) |
| Licencia | no disponible como campo estructurado; la model card remite a la del modelo de origen (tipicamente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (model.safetensors) |

Ficheros incluidos en el repositorio: `config.json`, `model.safetensors`, `tokenizer-enc.json`, `tokenizer-dec.json`.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, un transformer encoder-decoder diseñado para traducción automática neuronal, empleado de forma extensiva por el proyecto OPUS-MT de Helsinki-NLP. La variante "tiny" del nombre indica una configuración reducida de capas y dimensiones respecto a los OPUS-MT estándar, orientada a reducir el coste computacional para inferencia en dispositivo. No se dispone del número exacto de capas, dimensión de embeddings, cabezas de atención ni función de activación, ya que el contenido de `config.json` no se ha facilitado en la información disponible.

Respecto a los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO u otras técnicas de alineación), no se ha publicado información en los materiales proporcionados. Malinali declara explícitamente que no reclama la propiedad del modelo entrenado y que su aportación se limita a reempaquetar los pesos y convertir los tokenizadores de SentencePiece a JSON de tokenizador rápido de Hugging Face. La única transformación técnica documentada es, por tanto, ese cambio de formato de tokenizadores para compatibilidad con Candle.

## Capacidades

- Traducción automática unidireccional francés → inglés.
- Generación de texto condicionada a entrada (pipeline text2text-generation).
- Ejecución en dispositivo sin conexión a red, gracias al empaquetado para Candle.
- Compatibilidad con la librería transformers y con endpoints compatibles (según los tags del repositorio).
- Uso de tokenizadores rápidos separados para entrada (encoder) y salida (decoder).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- El soporte multilingüe se limita al par fra → eng; no cubre otros idiomas.

## Casos de uso

- Traducción offline en aplicación móvil: el modelo, con solo 25,36 millones de parámetros y un repositorio de 0,1 GB, puede integrarse en la app Malinali mediante marian_flutter para traducir texto francés a inglés sin conexión.
- Traducción de textos cortos en dispositivos embebidos: su tamaño permite ejecución en hardware de bajos recursos, útil para quioscos, lectores de documentos o asistentes de viaje sin acceso a la nube.
- Preprocesamiento en pipelines de PLN: traducir entradas en francés a inglés antes de pasarlas a modelos de análisis de sentimiento, clasificación o resumen que solo operan en inglés.
- Subtitulado y transcripción asistida: conversión de segmentos cortos de subtítulos en francés a inglés en herramientas de edición locales.
- Traducción por lotes de documentación breve: procesado de ficheros de configuración, mensajes de error o notas en entornos sin GPU dedicada.
- Prototipado e investigación en traducción de bajos recursos: como punto de partida para comparar estrategias de destilación o cuantización frente a modelos OPUS-MT mayores.
- Integración en aplicaciones de escritorio con runtime Candle: aprovechar la conversión a tokenizador rápido JSON para incrustar traducción nativa en software de escritorio escrito en Rust.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas BLEU, METEOR, chrF ni evaluaciones de MMLU, HumanEval o GSM8K (no aplicables a un modelo de traducción de este tamaño). La búsqueda web realizada no devolvió documentación técnica ni resultados de evaluación relacionados con este modelo o con su base Helsinki-NLP/opus-mt_tiny_fra-eng.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 101 MB solo para pesos (25,36 M de parámetros × 4 bytes), más overhead de activaciones y tokenizadores.
- VRAM estimada en fp16: aproximadamente 51 MB para pesos.
- VRAM estimada en int8 (si se cuantiza manualmente): aproximadamente 25 MB para pesos; no se distribuyen versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es sobradamente suficiente; no requiere A100, H100 ni RTX 4090. Funciona en GPUs integradas y aceleradores móviles.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU. También es viable en CPU pura.
- Opciones de despliegue: transformers (Python), Candle mediante marian_flutter (Rust, uso principal declarado por el autor). No se distribuyen ficheros GGUF, por lo que llama.cpp u Ollama no son aplicables sin conversión previa. TGI y vLLM no están orientados a modelos de este tamaño.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el reducido número de parámetros, se espera latencia de milisegundos en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Direccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt_tiny_fra-eng | 25,36 M | no disponible (tipicamente 512 tokens) | fra → eng | no disponible (remite a la del modelo base) | safetensors + tokenizers, Candle |
| Helsinki-NLP/opus-mt_tiny_fra-eng (modelo base) | no disponible | no disponible | fra → eng | CC-BY 4.0 (habitual en OPUS-MT) | safetensors en transformers |
| Helsinki-NLP/opus-mt-fr-en | aproximadamente 77 M (no confirmado en la informacion disponible) | aproximadamente 512 tokens | fra → eng | CC-BY 4.0 | safetensors en transformers |
| facebook/nllb-200-distilled-600M | aproximadamente 600 M | 512 tokens | multilingue (200 idiomas) | CC-BY-NC 4.0 | safetensors en transformers |

La tabla recoge valores de referencia de la familia OPUS-MT y de alternativas multilingues conocidas; los datos no confirmados se han marcado como tales. No se dispone de comparativas de calidad de traducción (BLEU/chrF) para este modelo concreto.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; los modelos entrenados con corpus OPUS pueden heredar sesgos de dominio y de género presentes en los datos paralelos.
- Riesgo de alucinacion: en traducción neuronal pequeña puede producir omisiones, repeticiones o traducciones inventadas, especialmente con frases largas o vocabulario especializado.
- Limitaciones de idioma: solo cubre el par francés → inglés; no traduce en sentido inverso ni a otros idiomas.
- Limitaciones de contexto: la ventana efectiva no está confirmada; secuencias largas pueden degradar la calidad o truncarse.
- Restricciones de licencia: la licencia no está declarada como campo estructurado en Hugging Face. La model card indica seguir la del modelo de origen, típicamente CC-BY 4.0, pero debe verificarse antes de uso comercial.
- Caveat de producción: repositorio con 0 descargas y 0 likes, sin evidencia de uso en producción ni resultados de evaluación publicados. El autor no reclama la propiedad del modelo entrenado, por lo que el soporte y el mantenimiento dependen del proyecto upstream.
- Compatibilidad: al distribuirse en safetensors con tokenizadores rápidos específicos para Candle, su uso fuera de ese runtime o de transformers puede requerir conversiones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt_tiny_fra-eng
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt_tiny_fra-eng
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicación Malinali: https://malinali.app
- No se encontraron en la busqueda web enlaces adicionales relevantes (papers, blogs, repos o demos) sobre este modelo.
