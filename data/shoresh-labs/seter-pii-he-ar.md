# shoresh-labs/seter-pii-he-ar

## Resumen

Seter PII es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en hebreo, árabe e inglés, incluyendo texto con mezcla de idiomas. Lo desarrolla Shoresh Labs y se distribuye con licencia MIT, lo que permite uso comercial sin restricciones. El modelo parte de FacebookAI/xlm-roberta-large (558,8 millones de parámetros) y está afinado para etiquetar cinco clases: `private_person`, `private_address`, `private_phone`, `private_email` y `account_number`.

Su relevancia radica en cubrir un hueco que los detectores de PII gratuitos dejan abierto: los nombres en hebreo y árabe, en especial nombres de pila aislados, nombres con prefijos adheridos (ל/ו/ש) o tratamientos como עו"ד y د., además de las kunyas árabes (أبو …). La inferencia se ejecuta en local, sin enviar datos a servicios externos, lo que encaja con requisitos de cumplimiento como el RGPD o la enmienda 13 de la ley israelí de privacidad.

La versión publicada es la v1.2 (la "accuracy model" del par que forma junto a `seter-pii-he-ar-fast`, pensado para CPU). El modelo está pensado para pipelines de redacción y anonimización más que para generación de texto: no es un LLM, sino un extractor de entidades entrenado específicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large), cabeza de token classification |
| Parametros totales | 558.852.107 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa large admite hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible para este modelo; la variante `fast` se distribuye en int8 ONNX |
| Idiomas soportados | he, ar, en (incluye texto mixto) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 6,7 GB, transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de XLM-RoBERTa large, un encoder transformer multilingüe con 24 capas y 558,8 millones de parámetros, sobre el que se añade una cabeza de clasificación token a token para BIO/entidades. La tarea es detección de spans a nivel de carácter (evaluada con micro-F1 a nivel de carácter), con cinco etiquetas de PII. No hay datos públicos sobre el volumen exacto de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO; la model card solo describe el proceso de evaluación.

Sí se documenta que el conjunto de evaluación de documentos retenidos (150 documentos, 2.480 spans etiquetados, entre 672 y 1.819 caracteres) se generó de forma independiente a REDACT y al generador de datos de entrenamiento, bajo la política de etiquetado propia de Seter, y que fue escrito y etiquetado por un modelo de IA a partir de una política escrita, con revisión posterior por un segundo revisor de IA por idioma (3 correcciones en 2.480 spans). La model card advierte explícitamente de este sesgo metodológico: la política de etiquetado la escribió el mismo autor que las clases de entrenamiento de la v1.2.

## Capacidades

- Detección de PII en hebreo, árabe e inglés, incluyendo texto con mezcla de idiomas en el mismo documento.
- Etiquetado de cinco clases: `private_person`, `private_address`, `private_phone`, `private_email` y `account_number`.
- Reconocimiento de nombres de pila aislados (sin apellido), un caso que los detectores genéricos suelen fallar.
- Manejo de prefijos hebreos adheridos (ל/ו/ש) y tratamientos (עו"ד, د.).
- Reconocimiento de kunyas árabes (أبو …).
- Salida a nivel de token/spans apta para pipelines de redacción y anonimización.
- Inferencia local, sin dependencia de API externa.
- No soporta tool calling, agentes, generación de texto, visión ni audio: es un modelo de clasificación, no un LLM.

## Casos de uso

- Redacción de PII en atención al cliente: el modelo procesa tickets y conversaciones multi-turno en hebreo, árabe o inglés y sustituye nombres, direcciones, teléfonos, correos y números de cuenta antes de almacenar o enviar el texto a terceros.
- Cumplimiento del RGPD y de la enmienda 13 israelí: se integra como paso previo al archivado o al envío de documentos a sistemas externos, ejecutándose en local para no exponer datos personales a servicios en la nube.
- Anonimización de registros médicos y notas de RR. HH.: la evaluación retenida incluye precisamente notas médicas, notas de RR. HH. y cartas legales, lo que indica que el modelo se ha probado en esos dominios.
- Saneado de logs y formularios: detección de spans de PII en registros de aplicación y formularios antes de exportarlos a sistemas de analítica o de observabilidad.
- Preprocesado para pipelines de datos multilingües: etiquetado de entidades en corpus mixtos hebreo-árabe-inglés para enmascarar antes de entrenar otros modelos o de compartir datasets.
- Enmascarado en correos y hilos de chat: procesamiento por documento (la evaluación cubre correos e hilos de chat de 672 a 1.819 caracteres) para redactar antes de reenviar o archivar.
- Despliegue en servidor propio con requisitos de soberanía del dato: al ser MIT y ejecutarse en local, encaja en entornos donde no se permite sacar el texto de la infraestructura.

## Benchmarks y rendimiento

Resultados publicados en la model card (F1 a nivel de carácter, conjunto de evaluación oficial, decodificador por defecto). La tabla de REDACT se corrigió el 10 de noviembre de 2026 tras un bug de scoring; se muestran las cifras corregidas.

| Conjunto | Sistema | F1 hebreo | F1 árabe | F1 inglés |
|---|---|---|---|---|
| REDACT (621/568/534 registros) | openai/privacy-filter | 0.642 | 0.735 | 0.709 |
| REDACT | seter-pii-he-ar v1.0 | 0.885 | 0.903 | 0.851 |
| REDACT | seter-pii-he-ar v1.1 (media de 3 semillas) | 0.914 | 0.923 | 0.887 |
| REDACT | **seter-pii-he-ar v1.2** (media de 3 semillas) | **0.915** | **0.922** | **0.890** |
| REDACT | seter-pii-he-ar-fast v1.1 (mmBERT-base) | 0.905 | 0.913 | 0.885 |

Documentos retenidos (150 documentos, 2.480 spans):

| Métrica | v1.1 | **v1.2 (pesos publicados)** | v1.2, media de 3 semillas |
|---|---|---|---|
| F1 a nivel de carácter | 0.945 | **0.968** | 0.962 |
| Precisión a nivel de carácter | 0.932 | **0.962** | 0.948 |
| Recall a nivel de carácter | 0.960 | **0.975** | 0.977 |
| Entidades cubiertas por completo | 0.917 | **0.961** | 0.961 |
| Spans predichos sin entidad etiquetada | 221 | **117** | 165 |
| F1 hebreo / árabe / inglés | 0.937 / 0.954 / 0.944 | **0.969 / 0.973 / 0.963** | 0.966 / 0.962 / 0.960 |

Otras cifras declaradas: recall@50% de nombres de pila aislados de 0.879 (hebreo), 0.933 (árabe) y 0.986 (inglés); F1 de carácter de 0.998 en un conjunto de 50 frases (modo permisivo). En los conjuntos hard1 (43 mensajes escritos a mano) y hard2 (40 mensajes escritos antes de los datos de entrenamiento), el modelo captura el 100% de las entidades y el 98% de los caracteres de persona, frente al 43%/28% y 47%/27% de openai/privacy-filter, con 2 y 0 spans falsos positivos respectivamente.

## Requisitos de hardware

- El modelo tiene 558,8 millones de parámetros; en fp32 ocupa aproximadamente 2,2 GB de pesos y el repo completo pesa 6,7 GB. La VRAM de inferencia en fp16 ronda los 1,2-1,5 GB más el overhead de activaciones y del tokenizador; en fp32, unos 2,5-3 GB.
- Cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, etc., y también en CPU para volúmenes moderados.
- La model card no publica latencia ni throughput para este modelo large. Para el compañero `seter-pii-he-ar-fast` (int8 ONNX, 4 hilos de CPU) se declaran 18 ms en una frase corta y 275 ms en un registro de 1.500 caracteres, con 603 MB de RAM y 369 MB en disco; son cifras de la variante rápida, no de este modelo.
- Despliegue: transformers (pipeline `token-classification`), con endpoints compatibles según los tags del repo. Para la variante rápida, ONNX en CPU. No se documentan integraciones específicas con vLLM, TGI o llama.cpp (son herramientas orientadas a modelos generativos, no a este encoder de clasificación).
- Al ser un encoder de 512 tokens de contexto, los documentos largos deben trocearse; la evaluación se hizo con documentos de 672 a 1.819 caracteres.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | F1 REDACT (he/ar/en) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **seter-pii-he-ar v1.2** | 558,8 M | he, ar, en | 512 tokens (arquitectura) | 0.915 / 0.922 / 0.890 | MIT | Hugging Face, local |
| openai/privacy-filter | no disponible | en (principalmente) | no disponible | 0.642 / 0.735 / 0.709 | no disponible | servicio/API |
| seter-pii-he-ar-fast v1.1 | mmBERT-base (tamaño no disponible) | he, ar, en | no disponible | 0.905 / 0.913 / 0.885 | MIT | Hugging Face, ONNX int8, CPU |

El modelo large supera a la variante fast en las tres lenguas de REDACT, a costa de mayor tamaño y de no estar optimizado para CPU. Frente a openai/privacy-filter, la diferencia es de entre 0,18 y 0,27 puntos de F1 en las tres lenguas, y de 0,70-0,71 puntos en cobertura de caracteres de persona en los conjuntos hard1/hard2.

## Limitaciones y advertencias

- La v1.2 no mejora el F1 de REDACT respecto a la v1.1; la model card lo indica explícitamente. Las mejoras se concentran en los documentos retenidos, no en el benchmark independiente.
- El conjunto de documentos retenidos es pequeño (150 documentos) y fue escrito y etiquetado por IA a partir de una política redactada por el mismo autor que las clases de entrenamiento, lo que favorece a esas clases. La ganancia de precisión no aparece en las tres semillas (una no la muestra) y la mejora en árabe es pequeña (+0,008 de media).
- Riesgo de falsos positivos y negativos en dominios no cubiertos por la evaluación; el modelo solo etiqueta cinco clases y no detecta fechas, ciudades, datos médicos ni otros tipos fuera de alcance (REDACT los ignora explícitamente en la evaluación).
- Contexto limitado a 512 tokens por la arquitectura XLM-RoBERTa; requiere troceado en documentos largos, con el riesgo de perder entidades partidas entre fragmentos.
- Cobertura lingüística limitada a hebreo, árabe e inglés; no se documenta rendimiento en otras lenguas.
- No es un modelo generativo: no razona, no responde preguntas ni hace tool calling; usarlo fuera de la tarea de clasificación de tokens dará resultados sin sentido.
- Aunque la licencia MIT permite uso comercial sin restricciones, la decisión de redactar o no un dato sigue siendo responsabilidad del pipeline que integra el modelo; conviene validar con datos propios antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shoresh-labs/seter-pii-he-ar
- Variante rápida para CPU: https://huggingface.co/shoresh-labs/seter-pii-he-ar-fast
- Demo en el navegador: https://huggingface.co/spaces/yinonov/seter-demo
- Organización Shoresh Labs: https://huggingface.co/shoresh-labs
- Benchmark REDACT (paper): https://arxiv.org/abs/2606.19881
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
