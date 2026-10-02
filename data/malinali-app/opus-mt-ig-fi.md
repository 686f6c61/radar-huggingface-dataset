# malinali-app/opus-mt-ig-fi

## Resumen

`malinali-app/opus-mt-ig-fi` es un paquete de pesos para traducción automática de igbo (ig) a finés (fi), publicado por malinali-app. No se trata de un modelo entrenado desde cero: es un reempaquetado de los pesos del modelo base `Helsinki-NLP/opus-mt-ig-fi`, convertidos a `safetensors` y acompañados de tokenizers rápidos en formato JSON para su uso con Candle a través del componente `marian_flutter`.

El modelo emplea la arquitectura Marian, un transformer encoder-decoder clásico de traducción neuronal, con 76.095.320 parámetros totales (unos 76 M) y un tamaño de repositorio de 0,3 GB. La dirección soportada es únicamente ig → fi, y está pensado para inferencia en dispositivo (on-device), lo que lo hace adecuado para aplicaciones móviles y entornos sin conectividad.

Su relevancia actual reside en dos factores: cubre un par de idiomas de bajos recursos (igbo-finés) poco atendido por los modelos multilingües masivos, y ofrece un formato listo para Candle/Flutter que simplifica el despliegue local. Al ser un reempaquetado, su calidad de traducción es la del modelo original de Helsinki-NLP, y no se han publicado métricas propias ni validación por parte de la comunidad en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian / MarianMT) |
| Parametros totales | 76.095.320 (~76 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (por arquitectura Marian, los OPUS-MT suelen operar con secuencias de hasta 512 tokens) |
| Tipos de cuantizacion | no disponibles en el repositorio; los pesos se distribuyen en safetensors (presumiblemente fp32) y son convertibles a fp16/int8 con herramientas externas |
| Idiomas soportados | ig (igbo), fi (fines); direccion unica ig → fi |
| Licencia | no disponible en los metadatos de HuggingFace; el autor remite a la licencia del modelo base (`Helsinki-NLP/opus-mt-ig-fi`), habitualmente CC-BY 4.0 en los modelos OPUS-MT |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `tokenizer-enc.json` y `tokenizer-dec.json` |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer seq2seq con atención completa, típicamente configurado en los modelos OPUS-MT con 6 capas de encoder y 6 de decoder, dimensión de modelo 512 y 8 cabezas de atención. El entrenamiento original fue realizado por el proyecto Helsinki-NLP sobre corpus paralelos de OPUS, con aprendizaje supervisado estándar de traducción automática neuronal; no hay indicios de RLHF, DPO ni ajuste por preferencias en la información disponible.

malinali-app no entrena ni ajusta el modelo: únicamente reempaqueta los pesos en `safetensors` y convierte los tokenizers SentencePiece originales a JSON de tokenizer rápido de HuggingFace para que funcionen con Candle mediante `marian_flutter`. Esta conversión es la innovación práctica del repositorio: permite inferencia local en Flutter sin depender de Python ni de PyTorch en tiempo de ejecución. No se detalla en la model card la composición exacta del dataset, el número de tokens de entrenamiento ni el proceso de tokenización SentencePiece original.

## Capacidades

- Traducción automática de texto de igbo (ig) a finés (fi), a nivel de frase o párrafo corto.
- Generación de texto traducido con tokenizers rápidos compatibles con `transformers` y con Candle.
- Inferencia en dispositivo (on-device) sin necesidad de conexión a internet.
- Integración en pipelines de HuggingFace mediante `pipeline("translation")`.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No dispone de modo de razonamiento (thinking mode), visión, audio ni otras modalidades.
- El multilingüismo se limita al par ig → fi; no traduce a otros idiomas ni en sentido inverso.
- No se documentan capacidades de código, matemáticas ni conocimiento general más allá de la traducción.

## Casos de uso

- Aplicación móvil de traducción offline para hablantes de igbo residentes en Finlandia: el modelo cabe en un paquete de 0,3 GB y puede ejecutarse en el dispositivo con Candle, lo que permite traducir en tiempo real sin cobertura de red.
- Servicios públicos y sanidad: traducción de instrucciones, formularios o avisos del finés al igbo para personas recién llegadas, desplegando el modelo localmente en tablets o quioscos sin enviar datos personales a la nube.
- Atención al cliente en finés para usuarios igbo: integración en un chatbot que reciba mensajes en igbo y responda en finés, apoyándose en la ventana de contexto típica de Marian (hasta 512 tokens) para conversaciones de frase corta.
- Traducción de documentación de ONG y proyectos de cooperación: procesamiento por lotes de textos en igbo a finés para informes, guías y material formativo, con la ventaja de no requerir GPU dedicada.
- Creación de corpus paralelos igbo-finés: uso del modelo para preanotar textos y generar datos de entrenamiento que alimenten modelos NMT posteriores o sistemas de evaluación.
- Preprocesado en pipelines multilingües: traducción intermedia ig → fi para después encadenar con un modelo fi → en o fi → es, cubriendo un par de bajos recursos con un componente ligero.
- Subtitulado y transcripción de contenido audiovisual: traducción de subtítulos en igbo a finés en herramientas de edición locales, gracias a la baja latencia esperable de un modelo de 76 M en CPU.
- Investigación en traducción de bajos recursos: punto de partida reproducible para comparar con otros sistemas OPUS-MT o con modelos multilingües grandes, con licencia y pesos fácilmente auditables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas BLEU, chrF ni evaluaciones humanas, y tampoco se documentan comparaciones con el modelo base o con alternativas. Cualquier cifra de calidad debería obtenerse ejecutando una evaluación propia sobre un corpus paralelo ig-fi.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (aproximadamente 304 MB de pesos) y en torno a 150-200 MB en fp16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100, H100 ni RTX 4090. Funciona en iGPU y en CPU.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o incluso en aceleradores integrados.
- Cabe en dispositivos móviles: sí, es el objetivo del paquete, mediante Candle y `marian_flutter` en Flutter.
- Opciones de despliegue: `transformers` (PyTorch), Candle con `marian_flutter`, conversión a CTranslate2 (soporta arquitectura Marian) y exportación a ONNX. `llama.cpp` y Ollama no soportan de forma nativa la arquitectura Marian, por lo que no son opciones directas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Para un modelo de 76 M, se espera latencia de decenas de milisegundos por frase en CPU moderna y bastante menor en GPU, pero no hay cifras oficiales publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `malinali-app/opus-mt-ig-fi` | ~76 M | no disponible (Marian, tipicamente 512 tokens) | ig → fi | no disponible (hereda la del base, habitualmente CC-BY 4.0) | safetensors + tokenizers JSON | HuggingFace, Candle |
| `Helsinki-NLP/opus-mt-ig-fi` | ~76 M | no disponible (Marian, tipicamente 512 tokens) | ig → fi | habitualmente CC-BY 4.0 (segun model card original) | PyTorch `.bin` + SentencePiece | HuggingFace |
| `Helsinki-NLP/opus-mt-ig-en` | ~77 M | no disponible (Marian, tipicamente 512 tokens) | ig → en | habitualmente CC-BY 4.0 | PyTorch `.bin` + SentencePiece | HuggingFace |
| `Helsinki-NLP/opus-mt-fi-en` | ~77 M | no disponible (Marian, tipicamente 512 tokens) | fi → en | habitualmente CC-BY 4.0 | PyTorch `.bin` + SentencePiece | HuggingFace |

Como alternativas multilingües de mayor tamano existen modelos como NLLB-200 (por ejemplo, la variante destilada de 600 M) o M2M-100 (418 M), que cubren el par igbo-finés dentro de un conjunto amplio de idiomas; sin embargo, no se dispone en la informacion proporcionada de datos de rendimiento comparativos entre estos modelos y el aquí descrito, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- El modelo no ha sido entrenado ni ajustado por malinali-app; la calidad depende enteramente del modelo original de Helsinki-NLP.
- Es un par de idiomas de bajos recursos: el igbo y el finés tienen menos datos paralelos que pares como en-de o en-es, lo que incrementa el riesgo de traducciones imprecisas, omisiones y alucinaciones, especialmente con frases largas o dominio especializado.
- Direccionalidad única: solo traduce ig → fi; no sirve para fi → ig ni para otros pares sin un modelo adicional.
- Longitud de contexto limitada por la arquitectura Marian (habitualmente 512 tokens); los textos largos deben dividirse en fragmentos, con riesgo de perder coherencia entre segmentos.
- No dispone de benchmarks publicados que respalden su calidad; conviene evaluarlo con un corpus propio antes de usarlo en producción.
- La licencia no está declarada en los metadatos de HuggingFace y el autor remite a la del modelo base. Aunque los OPUS-MT suelen ser CC-BY 4.0, es obligatorio verificar la licencia upstream antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no cuenta con validación ni retroalimentación de la comunidad.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades generativas más allá de la traducción.
- El autor advierte que solo reempaqueta pesos y convierte tokenizers, y no reclama la propiedad del modelo entrenado.

## Enlaces

- [Modelo en HuggingFace: malinali-app/opus-mt-ig-fi](https://huggingface.co/malinali-app/opus-mt-ig-fi)
- [Modelo base: Helsinki-NLP/opus-mt-ig-fi](https://huggingface.co/Helsinki-NLP/opus-mt-ig-fi)
- [Proyecto Helsinki-NLP / OPUS-MT en GitHub](https://github.com/Helsinki-NLP/Opus-MT)
- [Aplicacion Malinali](https://malinali.app)
