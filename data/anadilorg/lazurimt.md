# Anadilorg/LazuriMT

## Resumen

LazuriMT es un modelo de traducción automática multilingüe hacia la lengua laz (ISO 639-3: `lzz`), una lengua kartveliana minoritaria hablada en la costa del mar Negro entre Turquía y Georgia. Desarrollado por Anadilorg (Anadil Org), el modelo se basa en Google TranslateGemma-4B-IT, un modelo de la familia Gemma 3 de 4 mil millones de parámetros, y se ha adaptado mediante fine-tuning con LoRA para generar traducciones de alta calidad desde turco, inglés, español, alemán, ruso y árabe hacia el lazca.

El modelo resuelve un problema relevante para la preservación lingüística: la falta de herramientas de traducción para lenguas con pocos recursos digitales. Añade al vocabulario del tokenizer siete caracteres propios del alfabeto latino de Lazo-Freynik (ç̌, ǩ, p̌, ť, ž, ʒ, ǯ), lo que permite generar texto correctamente en laz sin perder estos grafemas en la salida. Se encuentra en fase experimental y no está disponible públicamente en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 3 (Transformer, base: `google/translategemma-4b-it`) |
| Parámetros totales | 4B (modelo base) + adaptador LoRA (r=32, alpha=64) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | turco, inglés, español, alemán, ruso, árabe → laz |
| Licencia | no disponible |
| Formato de pesos | no disponible (modelo no publicado) |

## Arquitectura y entrenamiento

LazuriMT parte de Google TranslateGemma-4B-IT, un modelo de la familia Gemma 3 con 4B parámetros y soporte para 55 idiomas. La adaptación se realiza mediante LoRA con r=32, alpha=64 y dropout 0.05, aplicada a todos los proyecciones del transformer (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). Además, se entrenan los embeddings de entrada y la cabeza de salida (`embed_tokens` + `lm_head`), añadiendo 8 nuevos tokens correspondientes a los caracteres laz (Ç̌/ç̌, Ǩ/ǩ, P̌/p̌, Ť/ť, Ž/ž, Ʒ/ʒ, Ǯ/ǯ). Los embeddings de estos tokens se inicializan con un esquema fonético: se promedian los embeddings del carácter latino clave y del carácter kartveliano equivalente.

El entrenamiento usa aproximadamente 263.600 pares de frases (87.870 laz↔tr, 87.835 laz↔en y el resto distribuido entre los otros idiomas), con 3 épocas, optimizador AdamW, learning rate 1e-4, programación de cosine y warmup del 10%. La secuencia máxima es de 512 tokens, con precisión bf16 y gradient checkpointing activado. La pérdida de entrenamiento descendió de 8.67 a 0.059 y la precisión por token alcanzó el 98.5% en los últimos pasos. El entrenamiento se realizó en una NVIDIA GB10.

## Capacidades

- Traducción automática de seis idiomas (turco, inglés, español, alemán, ruso, árabe) hacia el lazca.
- Generación de texto en lazca con el alfabeto latino de Lazo-Foix (Lazoğlu-Feurstein), incluyendo los caracteres diacríticos específicos.
- Soporte de frases cotidianas y conversacionales (saludos, clima, peticiones, planes).
- No incluye tool calling, ni razonamiento multi-paso, ni capacidades de visión o audio; es un modelo puramente de traducción.
- Multilingüismo solo en la dirección de entrada (fuente); la salida está fijada al lazca.

## Casos de uso

- **Atención al visitante en zonas de habla lazca**: el modelo puede traducir frases de turismo, alojamiento o restauración desde turco, inglés o español al laz, facilitando la comunicación con hablantes nativos.
- **Preservación lingüística y documentación**: permite generar contenido en laz para archivos digitales, glosarios y materiales educativos, contribuyendo a la revitalización de la lengua.
- **Traducción de contenido cultural**: cuentos, refranes o canciones tradicionales pueden traducirse desde el turco o el inglés al laz, manteniendo la fidelidad de los caracteres específicos.
- **Asistencia a aprendices del laz**: sirve como herramienta de práctica para estudiantes que quieran ver ejemplos de traducción de frases cotidianas en el idioma.
- **Investigación en NLP de lenguas de bajos recursos**: el modelo sirve como referencia para estudiar la adaptación de modelos multilingües a lenguas minoritarias con recursos limitados.
- **Traducción de documentación básica**: para textos simples como cartas, avisos o instrucciones breves, el modelo puede producir una primera versión en laz que un hablante nativo pueda revisar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son las métricas de entrenamiento: pérdida final de 0.059 y precisión por token del 98.5% en los últimos pasos, sin que se indiquen evaluaciones en conjuntos de test o comparativas con otros modelos.

## Requisitos de hardware

- El modelo base (Gemma 3 4B) requiere aproximadamente 8-10 GB de VRAM para inferencia en bf16, y unos 4-5 GB en cuantización de 4 bits.
- Hardware de entrenamiento: NVIDIA GB10 (especificación de la tarjeta no detallada en la información).
- En GPUs de consumo como RTX 3090, RTX 4080 o RTX 4090 puede ejecutarse sin problemas en bf16 o con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se exporten los pesos al formato adecuado (safetensors, GGUF). Dado que el modelo no está publicado, no se confirma la compatibilidad actual.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **LazuriMT** | 4B (base) | 512 tokens | 6→laz | no disponible | no publicado |
| **Google TranslateGemma-4B-IT** | 4B | 512 tokens | 55 idiomas | Gemma license | disponible en HF |
| **NLLB-200 (M2M-100)** | 600M–54.5B | 1024 tokens | 200 idiomas | CC-BY-NC | disponible |

No hay modelos comparables que traduzcan específicamente al lazca en el ecosistema open source. La comparación con TranslateGemma muestra que LazuriMT es una adaptación de este último, con la ventaja de añadir un idioma no cubierto originalmente. NLLB-200 no incluye el lazca como lengua de destino.

## Limitaciones y advertencias

- El modelo es **experimental** y no está publicado públicamente en el momento de escribir esta ficha; el autor indica que está cerrado al acceso.
- Los datos de entrenamiento son limitados (~263.600 pares de frases), lo que puede reducir la robustez en dominios técnicos o literarios.
- No está validado en textos literarios, técnicos o jurídicos; solo se ha probado con frases cotidianas y de uso común.
- Se han observado casos de generación de texto excesivamente largo (over-generation), probablemente por el formato del dataset de entrenamiento.
- La licencia no está especificada, por lo que no se puede confirmar si es de uso comercial.
- El modelo solo traduce hacia el laz; no soporta la dirección inversa (laz → otros idiomas).
- La longitud de contexto es limitada (512 tokens), lo que puede ser insuficiente para documentos largos sin segmentación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anadilorg/LazuriMT
- Organización en Hugging Face: https://huggingface.co/Anadilorg
- GitHub de AnadilOrg: https://github.com/AnadilOrg
- Sitio web del proyecto: https://anadil.org
- Modelo base (Google TranslateGemma-4B-IT): https://huggingface.co/google/translategemma-4b-it
