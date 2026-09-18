# AlexStamp/marian-finetuned-kde4-en-to-fr

## Resumen

marian-finetuned-kde4-en-to-fr es un modelo de traducción automática inglés-francés desarrollado por el usuario AlexStamp, consistente en un ajuste fino del modelo Helsinki-NLP/opus-mt-en-fr sobre el corpus paralelo KDE4. Se trata de un modelo encoder-decoder de tipo MarianMT con 74.669.178 parámetros, orientado específicamente a la traducción de cadenas de interfaz, mensajes de error y documentación técnica dentro del dominio de la localización de software.

El problema que resuelve es la inconsistencia terminológica en la traducción automática de software: los modelos genéricos tienden a conservar anglicismos como "plugin" o "threads", mientras que este ajuste enseña al modelo las convenciones formales del francés que emplea la comunidad de KDE (por ejemplo, "module d'extension" en lugar de "plugin"). El modelo está publicado bajo licencia Apache 2.0 y su relevancia actual radica en que demuestra que un ajuste fino relativamente económico (3 épocas sobre unos 189.000 pares de frases) puede elevar el BLEU de 39,3 a 53,0 en el dominio objetivo.

Se distribuye en formato safetensors para la librería transformers, solo soporta inglés y francés, y no emplea prefijos de tarea: espera texto en inglés plano como entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT), seq2seq para traducción |
| Parametros totales | 74.669.178 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de inferencia publicada; durante el entrenamiento se usó una longitud máxima de secuencia de 128 tokens |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors, típicamente fp32; el entrenamiento se realizó en fp16) |
| Idiomas soportados | en, fr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | Helsinki-NLP/opus-mt-en-fr |
| Dataset de ajuste | Helsinki-NLP/kde4 (inglés-francés) |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

La arquitectura es la de MarianMT: un transformer completo con encoder y decoder, diseñado específicamente para traducción automática neuronal y heredado directamente de Helsinki-NLP/opus-mt-en-fr. No incorpora mecanismos de atención lineal, decodificación especulativa ni mezcla de expertos; es un seq2seq denso y compacto de 74,7 millones de parámetros. Al ser un modelo Marian, no requiere prefijos de tarea como `>>fra<<` y espera la entrada en inglés sin marcas adicionales.

El ajuste fino se realizó sobre el corpus paralelo KDE4 en-fr, formado por unos 210.000 pares de frases procedentes de archivos de localización de aplicaciones KDE, divididos en aproximadamente 189.000 ejemplos de entrenamiento y 21.000 de validación (90/10). Los hiperparámetros fueron 3 épocas, batch de 32 en entrenamiento y 64 en evaluación, learning rate 2e-5, weight decay 0,01, longitud máxima de secuencia 128, precisión mixta fp16 y optimizador AdamW. La evaluación durante el entrenamiento se desactivó (`eval_strategy="no"`) para reducir el tiempo de cómputo; el modelo se evaluó una vez antes y otra después del ajuste sobre el split de validación completo. La pérdida de entrenamiento final fue 0,8132 y la de evaluación 0,8553, partiendo de aproximadamente 1,4 al inicio. No se reservó un conjunto de test independiente.

## Capacidades

- Traducción de texto inglés a francés en modalidad text2text, sin prefijos de tarea.
- Traducción de cadenas de interfaz de usuario, mensajes de error y documentación técnica.
- Normalización terminológica hacia el francés formal y estandarizado propio de KDE (por ejemplo, "plugin" → "module d'extension", "threads" → "fils de discussion").
- Procesamiento por lotes mediante `padding` y `truncation` en la tokenización.
- Capacidad de servir como punto de partida para nuevos ajustes finos en otros corpus de localización.
- No soporta tool calling, function calling, uso agéntico, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües limitadas a la pareja inglés-francés; no traduce a otros idiomas ni desde otros idiomas.
- No dispone de modo de razonamiento (thinking mode) ni de salidas estructuradas.

## Casos de uso

- Localización de interfaces de escritorio: traducción automática de archivos de traducción de aplicaciones KDE o GNOME al francés, aprovechando que el modelo fue entrenado exactamente con ese tipo de cadenas y produce terminología coherente entre distintas cadenas.
- Traducción de mensajes de error y trazas de aplicación: los textos técnicos breves y con terminología repetitiva se benefician del vocabulario formal aprendido, manteniendo la consistencia de términos entre versiones del software.
- Pre-traducción en flujos de trabajo profesionales de traducción: el modelo genera una primera versión en francés que un traductor humano revisa, reduciendo el tiempo de postedición gracias al BLEU de 53,0 en el dominio KDE4.
- Documentación técnica de producto: traducción de manuales, guías de instalación y notas de versión redactadas en inglés hacia francés formal, siempre que el registro sea técnico.
- Base para ajustes en dominios adyacentes: el modelo sirve como punto de partida para reentrenar sobre otros corpus de localización (por ejemplo, traducciones de otros proyectos de software libre) con un coste de cómputo bajo por su reducido tamaño.
- Traducción embebida en local o en dispositivos con recursos limitados: con 74,7 millones de parámetros cabe en CPU y en GPUs de gama baja, lo que permite desplegarlo en entornos sin conexión o con requisitos de privacidad estrictos.
- Generación de versiones francesas de cadenas en pipelines de CI/CD: integrado como paso previo a la revisión humana en repositorios con ficheros `.po` o `.ts`, automatizando la creación de borradores de traducción.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor en la model card, evaluados sobre el split de validación de KDE4 en-fr (no verificados de forma independiente, `verified: false`).

| Modelo / etapa | BLEU (KDE4 validación) | Pérdida de validación |
|---|---|---|
| Helsinki-NLP/opus-mt-en-fr (base, línea base) | 39,3 | 1,6963 |
| marian-finetuned-kde4-en-to-fr (ajustado) | 53,0 | 0,8553 |

Mejora declarada: +13,7 puntos de BLEU y reducción de la pérdida de validación a aproximadamente la mitad. Pérdida de entrenamiento final: 0,8132. No se han publicado resultados sobre otros conjuntos de referencia (MMLU, HumanEval, GSM8K u otros), que además no aplican a un modelo de traducción de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 74,7 millones de parámetros ocupan aproximadamente 300 MB; en fp16 unos 150 MB; en cuantización int8 unos 75 MB. A ello hay que sumar la memoria del tokenizador, los estados de atención y el batch.
- GPU recomendadas: cualquier GPU moderna funciona; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada son suficientes para inferencia interactiva.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer actual y también en CPU sin problemas, dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (opción documentada por el autor), y por compatibilidad de arquitectura Marian también son habituales CTranslate2, ONNX Runtime, TGI y servidores de inferencia que soporten modelos encoder-decoder. vLLM y llama.cpp no están documentados para este checkpoint concreto.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | BLEU (KDE4 val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| marian-finetuned-kde4-en-to-fr | 74.669.178 | en-fr | no disponible (máx. 128 tokens en entrenamiento) | 53,0 | apache-2.0 | HuggingFace, transformers |
| Helsinki-NLP/opus-mt-en-fr (modelo base) | no disponible | en-fr | no disponible | 39,3 | apache-2.0 | HuggingFace, transformers |
| Otros modelos de traducción en-fr comparables | no disponible | en-fr | no disponible | no disponible | no disponible | no disponible |

La comparación significativa disponible se limita al modelo base del que deriva, con una diferencia de +13,7 BLEU a favor del ajuste fino dentro del dominio KDE4. No se dispone de datos de otros modelos en-fr en la información proporcionada, por lo que no se pueden establecer comparaciones cuantitativas adicionales.

## Limitaciones y advertencias

- El modelo fue entrenado específicamente sobre el dominio KDE4, por lo que puede sobre-normalizar texto informal o conversacional hacia un francés excesivamente formal.
- Generaliza mal fuera de textos técnicos: literatura, marketing, contenido creativo o lenguaje coloquial quedan fuera de su ámbito previsto.
- Riesgo de alucinación y de traducciones incorrectas en cadenas con ambigüedad semántica o términos muy específicos no presentes en el corpus de entrenamiento.
- Longitud máxima de secuencia de 128 tokens durante el entrenamiento: los textos largos se truncan, lo que puede provocar pérdida de información en párrafos extensos.
- Solo soporta la pareja inglés-francés; no traduce a otros idiomas ni acepta otros idiomas de entrada.
- No utiliza prefijos de tarea, por lo que la entrada debe ser texto en inglés plano; añadir prefijos puede degradar la salida.
- Los resultados de BLEU (53,0) están declarados por el autor y marcados como no verificados; además, la evaluación se hizo sobre el split de validación y no sobre un conjunto de test separado, lo que puede sobreestimar el rendimiento real.
- El autor desactivó la evaluación periódica durante el entrenamiento, de modo que no hay curva de validación que permita detectar sobreajuste.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base Helsinki-NLP/opus-mt-en-fr y del corpus KDE4 utilizados.
- Ausencia total de métricas de latencia, throughput y consumo, lo que obliga a medir el rendimiento en el entorno de despliegue concreto antes de ponerlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlexStamp/marian-finetuned-kde4-en-to-fr
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-fr
- Dataset KDE4: https://huggingface.co/datasets/Helsinki-NLP/kde4
- Tutorial del curso de Hugging Face sobre traducción (mencionado como origen del ajuste): https://huggingface.co/learn/llm-course/chapter7/4
- No se han encontrado otros enlaces relevantes (papers, blogs o repos) en la búsqueda web realizada.
