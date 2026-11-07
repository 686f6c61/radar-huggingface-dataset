# ckuma/lugbara-multilingual-translator-local

## Resumen

El modelo `ckuma/lugbara-multilingual-translator-local` es un traductor automático neuronal fine-tuneado para la dirección inglés → lugbara, una lengua nilótica de Uganda con escasos recursos digitales. Lo desarrolla C. D. Akuma en el marco de su tesis de máster en Informática en la Muni University (octubre de 2025), y parte de `FacebookAI/xlm-roberta-base` como modelo base, adaptado a una arquitectura encoder-decoder con pesos compartidos entre encoder y decoder.

La relevancia del modelo reside en su enfoque de bajo recurso: se entrena exclusivamente sobre un corpus local inglés–lugbara de 15.525 pares de frases publicado junto a la tesis, sin recurrir a corpus externos como SALT. El modelo cuenta con 307.252.626 parámetros totales, un tamaño de repo de 1,3 GB y una licencia MIT que permite uso comercial sin restricciones adicionales.

Se trata de un modelo de investigación con calidad de traducción limitada: los resultados publicados en su propia model card muestran un BLEU de 0,6 y un chrF de 16,07 sobre el split de test local, con problemas evidentes de repetición y degradación en frases largas. Es útil como punto de partida reproducible para experimentación en traducción de lenguas de bajos recursos, no como sistema de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (XLM-R base, pesos de encoder y decoder compartidos) |
| Parámetros totales | 307.252.626 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-R base admite 512 tokens; no confirmado en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), lugbara (lgg) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de XLM-R (Rothe et al., 2020) reconfigurada como encoder-decoder para text2text generation, con los pesos del encoder y del decoder compartidos. Se inicializa a partir de `FacebookAI/xlm-roberta-base` y se fine-tunea para la dirección inglés → lugbara mediante un tag de idioma objetivo (`<2lgg>`) antepuesto a la frase de entrada.

El entrenamiento utiliza el corpus local inglés–lugbara publicado con la tesis (`Akuma1992/NLP-data-set`, fichero `datasetnlp.csv`, 15.525 filas). Tras eliminar pares vacíos (1.163), duplicados (60) y malformados (25), quedan 14.277 pares divididos aleatoriamente 70/15/15 con semilla 13: 9.994 de entrenamiento, 2.142 de validación y 2.141 de test. El preprocesado incluye minúsculas, normalización de puntuación y unificación de variantes de apóstrofo. Los hiperparámetros se heredan del grid search realizado para el modelo gemelo entrenado con SALT: learning rate 3e-05, batch 16, optimizador AdamW, early stopping sobre pérdida de validación con paciencia 3, 6.875 pasos y 38,5 minutos en una GPU de Kaggle. No se realizó nuevo grid search ni se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Traducción de texto inglés → lugbara mediante tag `<2lgg>`.
- Generación de texto secuencia a secuencia con decodificación por beam search (la model card usa `num_beams=4`).
- Manejo de texto en minúsculas con puntuación normalizada y apóstrofos unificados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a los dos idiomas del par (en, lgg).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en traducción automática de bajos recursos: el modelo sirve como línea base reproducible para comparar estrategias de aumento de datos, tokenización o arquitecturas sobre lugbara, dado que el corpus y los hiperparámetros están documentados.
- Reproducción de resultados académicos: permite replicar los experimentos de la tesis de Akuma (2025) y comparar el entrenamiento con corpus local frente al corpus SALT usando el modelo gemelo.
- Generación de corpus sintéticos de lugbara: puede emplearse para producir borradores de traducción que luego se revisen manualmente, ampliando el volumen de datos paralelos disponibles para futuros fine-tunes.
- Docencia y formación en PLN de bajos recursos: adecuado como ejemplo práctico de fine-tuning de XLM-R en un entorno con recursos limitados (entrenamiento en una sola GPU consumer).
- Prototipado de asistentes de traducción para comunidades lugbaraparlantes: como prueba de concepto en herramientas internas, siempre con revisión humana dado el bajo BLEU.
- Análisis lingüístico asistido: para explorar el comportamiento del modelo ante estructuras gramaticales concretas del lugbara (por ejemplo, integridad de apóstrofos o concordancia), aunque los resultados publicados muestran fallos notables en este aspecto.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test local (2.141 pares de frases):

| Dirección | Frases | BLEU ↑ | TER ↓ | Word F1 ↑ | chrF ↑ | Integridad de apóstrofos ↑ |
|---|---|---|---|---|---|---|
| Inglés → lugbara | 2.141 | 0,6 | 124,2 | 0,1175 | 16,07 | 0,0231 |

Comparación entre corpus de entrenamiento (BLEU / chrF):

| Dirección | Entrenado en | Test SALT | Test local |
|---|---|---|---|
| Inglés → lugbara | SALT (modelo gemelo) | 0,29 / 16,15 | 0,22 / 15,79 |
| Inglés → lugbara | Corpus local (este modelo) | 0,18 / 13,24 | 0,6 / 16,07 |

La model card indica que el mejor BLEU de la tesis con XLM-R ajustado fue de 22,18, pero advierte que procede de un split y una limpieza distintos, por lo que no es una comparación exacta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,3 GB solo para pesos, más overhead de activaciones; viable en GPUs con 4 GB o más.
- VRAM estimada en fp16: aproximadamente 0,7 GB para pesos, más overhead.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también A100 o H100 para lotes grandes.
- Cabe en GPU consumer: sí, en la mayoría de GPUs con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers (biblioteca nativa), potencialmente vLLM o TGI si se convierte a un formato compatible; llama.cpp u Ollama requerirían conversión a GGUF, no documentada en la model card.
- Latencia y throughput estimados: no disponibles. El entrenamiento completo requirió 38,5 minutos en una GPU de Kaggle, lo que sugiere un modelo ligero para inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BLEU (en→lgg, test local) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ckuma/lugbara-multilingual-translator-local (este) | 307 M | no disponible | 0,6 | MIT | Hugging Face |
| ckuma/lugbara-multilingual-translator (gemelo, SALT) | 307 M (estimado, mismo base) | no disponible | 0,22 (test local) | MIT | Hugging Face |
| FacebookAI/xlm-roberta-base (base sin fine-tune) | 278 M | 512 tokens | no aplica (no traduce directamente) | MIT | Hugging Face |

No se dispone de información sobre otros modelos comparables específicos para lugbara en la documentación proporcionada.

## Limitaciones y advertencias

- Calidad de traducción muy baja: BLEU de 0,6 y chrF de 16,07 en el split local, con TER de 124,2, lo que indica ediciones muy alejadas de la referencia.
- Degradación severa en frases largas: los ejemplos de la model card muestran repeticiones patológicas ("mutu mutu mutu...", "aaaaaaaa...") y pérdida de contenido.
- Integridad de apóstrofos muy baja (0,0231): el modelo reproduce mal palabras con apóstrofo, frecuentes en lugbara.
- Riesgo elevado de alucinación y de generar texto sin sentido en contextos fuera del corpus de entrenamiento.
- Corpus de entrenamiento pequeño (14.277 pares) y sin etiquetas de dominio, con split aleatorio en lugar de estratificado, lo que puede inflar métricas en dominios sobrerrepresentados.
- Sesgos conocidos: no documentados explícitamente, pero el corpus local puede reflejar sesgos de la fuente original.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en producción sin revisión humana.
- No se documentan limitaciones de contexto más allá de las del modelo base (XLM-R, 512 tokens), y la model card no confirma el límite efectivo.
- El modelo requiere entrada en minúsculas y con tag `<2lgg>`; un uso incorrecto del formato degrada aún más la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ckuma/lugbara-multilingual-translator-local
- Modelo gemelo entrenado con SALT: https://huggingface.co/ckuma/lugbara-multilingual-translator
- Corpus local de la tesis: https://github.com/Akuma1992/NLP-data-set
- Modelo base XLM-R: https://huggingface.co/FacebookAI/xlm-roberta-base
