# promptshield/miniscule

## Resumen

`promptshield/miniscule` es un modelo de reconocimiento de entidades nombradas (NER) multilingüe basado en BERT, desarrollado por promptShield, una empresa canadiense que ofrece anonimización de documentos offline. El modelo es una versión cuantizada y podada de `Davlan/bert-base-multilingual-cased-ner-hrl`, que a su vez es un fine-tune de `google-bert/bert-base-multilingual-cased` para etiquetar entidades de tipo persona, organización, lugar y fecha. La principal innovación es la reducción del vocabulario: elimina los tokens de scripts no latinos (cirílico, CJK, árabe, etc.) que el modelo original soporta pero que son inalcanzables para textos en lenguas latinas, logrando una reducción del 21,8 % del tamaño del archivo (de 178,5 MB a 139,6 MB) sin alterar ningún peso del encoder y con una salida matemáticamente idéntica para los scripts conservados.

La relevancia de este modelo radica en su enfoque para despliegues en navegador y dispositivos con recursos limitados: al eliminar más de la mitad de la tabla de embeddings (que supone ~92 MB de los 178 MB originales), se reduce la descarga inicial para aplicaciones web que solo necesitan cubrir lenguas latinas. El modelo se distribuye en formato ONNX, compatible con `transformers.js` y `onnxruntime`, y está pensado para funcionar íntegramente en el cliente, sin enviar datos a servidores. La licencia es AFL-3.0, heredada del fine-tune original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer) con clasificación de tokens |
| Parametros totales | no disponible (BERT base típicamente ~110 M, no confirmado en la card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BERT base típicamente 512 tokens, no confirmado) |
| Tipos de cuantizacion | int8 (per-tensor) |
| Idiomas soportados | de, en, es, fr, it, lv, nl, pt y otros lenguas de escritura latina |
| Licencia | AFL-3.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) con una cabeza de clasificación de tokens para NER. El proceso de construcción parte de `Davlan/bert-base-multilingual-cased-ner-hrl`, un fine-tune del BERT multilingüe original entrenado para reconocer entidades `PER`, `ORG`, `LOC` y `DATE` (con etiquetas `B-`/`I-`). Sobre este modelo, promptShield aplicó dos transformaciones: (1) cuantización int8 por tensor de la tabla de embeddings, y (2) poda del vocabulario eliminando los tokens correspondientes a scripts no latinos (cirílico, CJK, árabe, hangul, hebreo, devanagari, griego, armenio y tailandés). La poda es exacta porque la cuantización es per-tensor (escala y punto cero compartidos) y la segmentación WordPiece funciona por coincidencia de prefijo más larga, de modo que al eliminar solo tokens inalcanzables desde los scripts conservados, la segmentación de textos latinos no cambia. El vocabulario se reduce de 119 547 a 68 875 tokens (57,6 % mantenidos). No se realizó ningún reentrenamiento ni destilación; se trata exclusivamente de un cambio de empaquetado.

## Capacidades

- Reconocimiento de entidades nombradas (NER) para etiquetas `PER`, `ORG`, `LOC` y `DATE` en formato `B-`/`I-`.
- Soporte multilingüe para lenguas de escritura latina: alemán, inglés, español, francés, italiano, letón, neerlandés, portugués y otras que el modelo base manejaba.
- Ejecución en navegador mediante `transformers.js` (WebAssembly o WebGPU), sin necesidad de servidor.
- Compatibilidad directa con `onnxruntime` para despliegue en entornos de inferencia estándar.
- Salida matemáticamente idéntica al modelo original para textos en scripts latinos, verificada sobre 77 documentos reales con 2219 entidades comparadas y diferencia máxima de logits de 0,0000000000.
- No incluye capacidades de generación de texto, tool calling, razonamiento multi-paso ni soporte de visión o audio.

## Casos de uso

- Anonimización de documentos en el navegador: una aplicación web puede cargar el modelo y procesar contratos, informes financieros o historiales médicos localmente, garantizando que los datos nunca abandonen el dispositivo. El tamaño reducido acelera la primera carga y reduce el consumo de ancho de banda.
- Extracción de entidades en textos legales: identificación automática de nombres de personas, organizaciones, lugares y fechas en contratos o sentencias para su posterior indexación o redacción selectiva.
- Análisis de registros médicos: detección de datos personales (nombres de pacientes, hospitales, fechas de nacimiento) para cumplir normativas de privacidad como GDPR o HIPAA en entornos con recursos limitados.
- Procesamiento de documentos financieros: extracción de entidades en estados de cuenta, facturas y balances para automatizar tareas de auditoría o conciliación.
- Filtrado de información sensible en soporte técnico: clasificación de conversaciones o tickets para detectar datos personales antes de almacenarlos o compartirlos con terceros.
- Sistemas de redacción automática en medios: localización de nombres propios y fechas en artículos para generar versiones anonimizadas antes de su publicación.
- Integración en pipelines de NLP para lenguas latinas: como componente de preprocesamiento para tareas posteriores (traducción, resumen, análisis de sentimiento) donde se necesite una capa ligera de NER.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, GLUE o CoNLL) en la información disponible. La model card únicamente documenta una verificación de equivalencia con el modelo original `Davlan/bert-base-multilingual-cased-ner-hrl` sobre 77 documentos en 7 lenguas: se compararon 2219 entidades y se obtuvo 0 diferencias en segmentación y entidades, con una diferencia máxima de logits de 0,0000000000. Esta verificación demuestra que la poda no introduce pérdida de precisión para los scripts conservados, pero no constituye una evaluación de rendimiento frente a otros modelos.

## Requisitos de hardware

- El modelo ocupa 139,6 MB en disco (formato ONNX int8), lo que lo hace apto para dispositivos con memoria moderada.
- Inferencia en CPU sin GPU: al ser un BERT base con cuantización int8, puede ejecutarse en procesadores de portátiles y móviles con latencia aceptable para textos de longitud media.
- En navegador: funciona con `transformers.js` mediante WebAssembly; para una experiencia fluida se recomienda un dispositivo con al menos 2 GB de RAM libre.
- Opciones de despliegue: `transformers.js`, `onnxruntime` (Python, C++, JavaScript), y cualquier framework que soporte ONNX.
- No se requieren GPUs dedicadas; en caso de usar GPU, cualquier tarjeta con más de 1 GB de VRAM es suficiente, aunque no es necesario.
- Latencia estimada: no disponible en la documentación, pero por tratarse de un modelo BERT base int8, en CPU moderna se esperan decenas de milisegundos por frase corta.

## Comparativa con modelos similares

| Modelo | Tamaño | Vocabulario | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `promptshield/miniscule` | 139,6 MB (int8) | 68 875 tokens | Latinos (8 declarados + otros) | AFL-3.0 | ONNX | Podado y cuantizado; idéntico al original para scripts latinos |
| `Davlan/bert-base-multilingual-cased-ner-hrl` | ~178,5 MB (fp32) | 119 547 tokens | 104 lenguas (incluye árabe, chino, etc.) | AFL-3.0 | PyTorch | Modelo original sin podar |
| `Xenova/bert-base-multilingual-cased-ner-hrl` | ~178,5 MB (fp32) | 119 547 tokens | 104 lenguas | AFL-3.0 | ONNX | Exportación ONNX sin poda, misma funcionalidad que el original |

La comparativa se limita a los modelos directamente relacionados, ya que no se dispone de información sobre otros modelos NER multilingües comparables en la documentación proporcionada. La ventaja principal de `promptshield/miniscule` es la reducción de tamaño sin pérdida de precisión, a costa de perder soporte para scripts no latinos.

## Limitaciones y advertencias

- Solo soporta textos en escritura latina: cualquier texto en árabe, chino, cirílico, hangul, hebreo, devanagari, griego, armenio o tailandés se degrada a `[UNK]`, no a una salida ligeramente peor. Esto incluye lenguas que el modelo original sí soportaba.
- La garantía de equivalencia con el modelo original se limita a los scripts conservados; si el corpus de producción contiene scripts eliminados, los resultados divergirán correctamente pero no serán útiles.
- La licencia AFL-3.0 es permisiva pero incluye cláusulas específicas (por ejemplo, sobre patentes y atribución); se recomienda revisar sus términos antes de uso comercial.
- No se declaran datos de entrenamiento en la card del modelo original; si se requiere trazabilidad de datos, debe consultarse con los autores originales (Davlan y Google Research).
- El modelo no ofrece capacidades de generación ni razonamiento; es exclusivamente un clasificador de tokens para NER.
- No se han publicado benchmarks de rendimiento frente a otros modelos NER; la única verificación documentada es la equivalencia con el modelo base, no una evaluación de calidad absoluta.

## Enlaces

- Repositorio HuggingFace: [promptshield/miniscule](https://huggingface.co/promptshield/miniscule)
- Modelo base (fine-tune): [Davlan/bert-base-multilingual-cased-ner-hrl](https://huggingface.co/Davlan/bert-base-multilingual-cased-ner-hrl)
- Modelo base original: [google-bert/bert-base-multilingual-cased](https://huggingface.co/google-bert/bert-base-multilingual-cased)
- Exportación ONNX sin poda: [Xenova/bert-base-multilingual-cased-ner-hrl](https://huggingface.co/Xenova/bert-base-multilingual-cased-ner-hrl)
- Sitio web de promptShield: [https://promptshield.ca](https://promptshield.ca)
