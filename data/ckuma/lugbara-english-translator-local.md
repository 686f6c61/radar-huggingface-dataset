# ckuma/lugbara-english-translator-local

## Resumen

El modelo `ckuma/lugbara-english-translator-local` es un sistema de traducción automática neuronal especializado en la dirección Lugbara → inglés, desarrollado por el autor ckuma en el marco de la tesis de máster de C. D. Akuma en la Universidad de Muni (Uganda). Se trata de un fine-tuning de `google/mt5-base`, un transformer encoder-decoder de tipo sequence-to-sequence, con 582.401.280 parámetros totales, entrenado sobre un corpus local de pares de frases inglés-lugbara publicado junto a la tesis.

La relevancia del modelo radica en su enfoque sobre una lengua de muy bajos recursos (lgg), hablada principalmente en el noroeste de Uganda y zonas limítrofes de la República Democrática del Congo y Sudán del Sur. El lugbara no cuenta con grandes corpus paralelos ni recursos computacionales comparables a los de lenguas de altos recursos, por lo que este trabajo documenta de forma explícita el proceso de construcción del corpus, el preprocesado y la evaluación con métricas estándar (BLEU, TER, chrF, F1 de palabra).

El modelo se publica como contraparte de `ckuma/lugbara-english-translator`, entrenado sobre el corpus SALT con los mismos hiperparámetros, lo que permite una comparación controlada entre ambos conjuntos de datos. Su licencia Apache 2.0 facilita su reutilización, aunque los resultados de calidad (BLEU 12,18 en el split de test local) sitúan al modelo en un rango propio de la investigación sobre lenguas de bajos recursos, no de un sistema listo para producción sin revisión humana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mT5 base, sequence-to-sequence) |
| Parámetros totales | 582.401.280 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (mT5 base soporta secuencias de hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | inglés (en), lugbara (lgg) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/mt5-base`, un transformer encoder-decoder con atención completa y mecanismo de text-to-text generation. Se ha realizado un fine-tuning supervisado para la tarea de traducción Lugbara → inglés, condicionado por un tag de idioma objetivo (`<2en>`) que se antepone a la frase de entrada, siguiendo la convención de mT5. La entrada se normaliza a minúsculas y se normaliza la puntuación, con todas las variantes de apóstrofo unificadas a `'`.

El corpus de entrenamiento es el conjunto local inglés-lugbara publicado con la tesis (`Akuma1992/NLP-data-set`, archivo `datasetnlp.csv`, 15.525 filas). Tras eliminar pares vacíos, duplicados y malformados (1.163 / 60 / 25), quedan 14.277 pares, divididos aleatoriamente 70/15/15 con semilla 13: 9.994 de entrenamiento, 2.142 de validación y 2.141 de test. No hay etiquetas de dominio, por lo que la partición es aleatoria y no estratificada. Los hiperparámetros no se reajustaron: se reutilizaron los ganadores de la búsqueda en rejilla del modelo gemelo entrenado con SALT (learning rate 0,001, batch 16, optimizador Adafactor, early stopping con paciencia 3 sobre la pérdida de validación, 4.375 pasos, 44,9 minutos en una GPU de Kaggle). No se documenta RLHF ni DPO; el entrenamiento es puramente supervisado.

## Capacidades

- Traducción de texto de lugbara a inglés, con tag `<2en>` antepuesto a la frase de entrada.
- Generación de texto condicionada a una tarea de traducción mediante decodificación con búsqueda por haces (`num_beams=4` en el ejemplo de la model card).
- Manejo de texto en minúsculas con normalización de puntuación y apóstrofos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del par en-lgg.
- No se documenta visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción asistida de documentación comunitaria: el modelo puede traducir textos administrativos o sanitarios del lugbara al inglés para su revisión por traductores humanos, aprovechando el corpus de entrenamiento de temática local y la licencia Apache 2.0 que permite integrarlo en herramientas internas.
- Investigación en lingüística computacional de bajos recursos: sirve como línea base reproducible para comparar técnicas de aumento de datos, tokenización o ajuste fino sobre el par lugbara-inglés, dado que el autor documenta el corpus, el preprocesado y las métricas.
- Preservación digital del lugbara: permite generar versiones en inglés de textos orales transcritos o material etnográfico, facilitando su catalogación y difusión en archivos digitales.
- Evaluación comparativa de corpus: al ser el gemelo del modelo entrenado con SALT, permite a investigadores medir el impacto del dominio y la composición del corpus en la calidad de traducción con idénticos hiperparámetros.
- Prototipado de asistentes de traducción para ONG: el modelo puede integrarse en una aplicación ligera de traducción lugbara-inglés para personal de campo, con la advertencia de que la salida debe revisarse por hablantes nativos.
- Docencia y formación de traductores: sirve para ilustrar las limitaciones de los sistemas neuronales en lenguas de bajos recursos mediante ejemplos concretos de la model card, como la traducción errónea de "mi ma egata azini ba odi yi eduzu azia ci ya?" ("have you thought about recruiting a new team?") por "why are you pregnant?".

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test local (2.141 pares de frases):

| Dirección | Frases | BLEU ↑ | TER ↓ | F1 de palabra ↑ | chrF ↑ | Integridad de apóstrofos ↑ | Mejor BLEU de la tesis* |
|---|---|---|---|---|---|---|---|
| Lugbara → English | 2.141 | 12,18 | 74,34 | 0,378 | 34,76 | – | 25,41 (mT5 ajustado) |

*Las puntuaciones de la tesis provienen de su propio split y limpieza del corpus, por lo que son un punto de referencia y no una comparación exacta.

Comparación entre corpus (BLEU / chrF):

| Dirección | Entrenado en | Test SALT | Test local |
|---|---|---|---|
| Lugbara → English | SALT (`ckuma/lugbara-english-translator`) | 12,71 / 34,73 | 16,24 / 35,97 |
| Lugbara → English | Corpus local (este modelo) | 13,79 / 33,99 | 12,18 / 34,76 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos (582 millones de parámetros × 4 bytes), más memoria para activaciones y tokenizador; en la práctica, entre 3 y 4 GB.
- VRAM estimada en fp16/bf16: alrededor de 1,2 GB para pesos, con un total práctico de 2 a 3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia cómoda. Para lotes grandes, una A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (AutoModelForSeq2SeqLM), y por compatibilidad con safetensors y arquitectura mT5, también es convertible a GGUF para llama.cpp y a formatos de Ollama, aunque el autor no documenta estas rutas. vLLM y TGI no están documentados para este modelo en la información disponible.
- Latencia y throughput: no disponibles. El entrenamiento completo requirió 44,9 minutos en una GPU de Kaggle, lo que da una idea del bajo coste computacional del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ckuma/lugbara-english-translator-local (este) | 582 M | no disponible | en, lgg | Apache 2.0 | Hugging Face |
| ckuma/lugbara-english-translator | 582 M (mT5 base) | no disponible | en, lgg | Apache 2.0 | Hugging Face |
| ckuma/lugbara-multilingual-translator | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| google/mt5-base | 582 M | 512 tokens (documentado por Google) | multilingüe (101 idiomas) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros sistemas de traducción lugbara-inglés en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sobre solo 9.994 pares de frases de un único corpus; textos de otros dominios pueden traducirse peor, como muestra la prueba cruzada con SALT.
- Solo procesa texto en minúsculas; el lugbara no escribe tono, por lo que las diferencias únicamente tonales se pierden.
- Las métricas automáticas usan una única referencia por frase; se recomienda revisión por hablantes nativos antes de cualquier uso real.
- Los ejemplos de la model card muestran errores graves de traducción en frases fuera del dominio, lo que evidencia riesgo alto de alucinación y de traducciones semánticamente incorrectas.
- La partición del corpus es aleatoria y no estratificada por dominio, lo que puede inflar las métricas si hay frases similares entre splits.
- El corpus tiene 6,9% de tokens de palabra del test SALT ausentes en el entrenamiento local y 8,1% de tokens del test local ausentes en el entrenamiento SALT, lo que refleja una cobertura léxica limitada.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo no está validada para producción sin revisión humana.
- No se documentan sesgos específicos, pero al provenir de un corpus único y localizado geográficamente, es probable que refleje sesgos culturales y temáticos del mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ckuma/lugbara-english-translator-local
- Modelo gemelo entrenado con SALT: https://huggingface.co/ckuma/lugbara-english-translator
- Modelo multilingüe del mismo autor: https://huggingface.co/ckuma/lugbara-multilingual-translator
- Corpus de la tesis: https://github.com/Akuma1992/NLP-data-set
- Modelo base: https://huggingface.co/google/mt5-base
