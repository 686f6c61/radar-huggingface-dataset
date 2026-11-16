# amDANIEL2024/kieran_base

## Resumen

`kieran_base` es un modelo de traducción automática neuronal desarrollado por el usuario amDANIEL2024, diseñado para traducir directamente entre luganda (lg) y runyankole (nyn), dos lenguas bantúes de Uganda, sin pasar por el inglés como lengua pivote. Se trata de un transformer encoder-decoder de 89 millones de parámetros con una ventana de contexto de 256 posiciones, entrenado exclusivamente sobre pares generados por traducción automática.

El modelo es relevante porque aborda un par de lenguas de bajos recursos para las que apenas existen sistemas de traducción directa, y lo hace con una arquitectura compacta que puede ejecutarse en hardware modesto. La dirección de traducción se controla mediante un token de prefijo en el origen (`<2nyn>` o `<2lug>`), lo que permite cubrir ambas direcciones con un único conjunto de pesos.

Es importante señalar que se trata de una base preentrenada, no de un traductor finalizado: no ha sido ajustado con datos humanos y sus métricas completas sobre el conjunto de evaluación SALT todavía no se han publicado. El autor anuncia una versión afinada bajo el nombre `kieran_finetuned`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 640, 8 cabezas, FFN 2560, activación GELU |
| Parametros totales | 89.418.240 (embeddings de entrada, de decodificador y proyección de salida compartidos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones (codificación sinusoidal); los pares de entrenamiento se limitaron a 128 piezas por lado |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | luganda (lg), runyankole (nyn) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (float32); tokenizador SentencePiece (`spm.model`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer encoder-decoder estándar con normalización previa (pre-LN), seis capas en el codificador y seis en el decodificador, dimensión de modelo 640, ocho cabezas de atención y una red feed-forward de 2560 unidades con activación GELU. Utiliza un tokenizador SentencePiece unigram compartido de 32.000 piezas, entrenado sobre texto de luganda y runyankole, con preservación de mayúsculas y separación de dígitos. Los embeddings de entrada, los del decodificador y la proyección de salida están atados.

El entrenamiento se realizó sobre los pares luganda-runyankole del dataset `amDANIEL2024/tulati`, en ambas direcciones. Es crucial entender que ambos lados de cada par son salida de un modelo NLLB (`Sunbird/translate-nllb-1.3b-salt`), es decir, traducción automática de una columna inglesa; no hay texto humano en los datos de entrenamiento. Tras filtrar filas vacías, degeneradas, parecidas al inglés o con longitudes atípicas (58.115 de 1.534.699, un 3,8%), eliminar pares con lados idénticos (2.389), duplicados exactos (576) y un par presente en los conjuntos SALT de desarrollo o test, quedaron 1.473.618 pares, de los cuales 2.000 se reservaron para validación.

El entrenamiento consistió en 5 épocas y 19.305 pasos de optimizador, con aproximadamente 25.000 tokens objetivo por paso, precisión fp16 sobre una única GPU Kaggle T4, suavizado de etiquetas de 0,1, optimizador AdamW y una planificación de tasa de aprendizaje con calentamiento lineal seguido de decaimiento inverso de la raíz cuadrada (pico de 3e-4). No se menciona uso de RLHF ni DPO.

## Capacidades

- Traducción directa luganda → runyankole y runyankole → luganda, sin inglés intermedio, con la dirección seleccionada mediante prefijo (`lug2nyn` / `nyn2lug`).
- Generación de texto a nivel de frase con decodificación por haz (beam search, valor por defecto 4).
- Procesamiento por lotes: la función `translate` acepta tanto una cadena como una lista de cadenas.
- Manejo de mayúsculas y dígitos gracias al tokenizador SentencePiece configurado a tal efecto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües limitadas estrictamente a luganda y runyankole.

## Casos de uso

- Traducción de documentación comunitaria: traducción de materiales informativos, avisos y guías entre luganda y runyankole para organizaciones locales, aprovechando que el modelo no requiere inglés intermedio y funciona en hardware modesto.
- Preservación lingüística y estudios comparativos: generación de borradores de traducción para lingüistas que trabajen en la documentación de ambas lenguas bantúes, con revisión humana posterior.
- Preprocesamiento de corpus: creación de pares sintéticos luganda-runyankole para aumentar datasets de investigación, dado que el modelo puede generar traducciones a escala sobre textos de entrada.
- Prototipado de aplicaciones de traducción: integración en una interfaz ligera de traducción de frases gracias a sus 89 millones de parámetros y a la disponibilidad de pesos en float32 que caben en GPU de consumo.
- Evaluación de pipelines de bajo recurso: uso como línea base en experimentos de traducción de lenguas de bajos recursos, comparando su rendimiento con sistemas NLLB o con la futura versión `kieran_finetuned`.
- Traducción de contenido breve para redes o mensajería: frases de hasta aproximadamente 128 piezas, donde el modelo opera dentro de su rango de entrenamiento.
- Investigación sobre datos sintéticos: análisis de cómo un modelo entrenado exclusivamente con traducción automática se comporta frente a texto humano, usando las métricas sobre SALT dev como referencia.

## Benchmarks y rendimiento

Los resultados completos sobre SALT dev/test (BLEU, chrF, chrF++) no se han ejecutado todavía. Las únicas mediciones disponibles son las del final del preentrenamiento (paso 19.305), con chrF++ rápido sobre las primeras 128 frases y decodificación voraz, por lo que no son comparables con puntuaciones de conjunto completo.

| Conjunto | Dirección | Pérdida | chrF++ rápido (voraz, 128 frases) |
|---|---|---|---|
| Validación tulati (2.000 pares sintéticos) | lug→nyn | 1,280 | 59,37 |
| Validación tulati | nyn→lug | 1,538 | 56,26 |
| SALT dev (500 pares humanos) | lug→nyn | 3,073 | 44,67 |
| SALT dev | nyn→lug | 2,551 | 44,55 |

Línea base de copia sobre SALT dev completo (sacreBLEU 2.5.1):

| Dirección | BLEU | chrF | chrF++ |
|---|---|---|---|
| lug→nyn | 0,71 | 27,08 | 22,87 |
| nyn→lug | 0,72 | 27,59 | 23,21 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo de traducción.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 0,36 GB (89,4 M de parámetros × 4 bytes), por lo que el modelo cabe holgadamente en cualquier GPU de consumo con 4 GB o más.
- GPU recomendadas: funciona en una única Kaggle T4 (16 GB) para entrenamiento; para inferencia basta con una GTX 1650, RTX 3050, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con al menos 4 GB de VRAM; también puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: al ser un modelo PyTorch personalizado (no compatible con `AutoModel` de `transformers`), se carga mediante el módulo `kieran.Translator` incluido en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| kieran_base | 89 M | 256 posiciones | lg, nyn (directo) | MIT | safetensors (PyTorch custom) |
| Sunbird/translate-nllb-1.3b-salt | 1.300 M (aproximado, NLLB-1.3B) | no disponible | Incluye lg y nyn vía inglés | no disponible | transformers |
| NLLB-200 (variantes) | 600 M a 54 B | 512 tokens (versión estándar) | 200 lenguas, incluido luganda | CC-BY-NC 4.0 (uso no comercial) | transformers |

La comparación directa con NLLB es pertinente porque el propio dataset de entrenamiento fue generado por una variante de NLLB. `kieran_base` ofrece traducción directa luganda-runyankole con licencia MIT y un tamaño mucho menor, mientras que NLLB traduce mediante inglés y tiene restricciones de uso comercial en muchas de sus variantes. No se dispone de métricas comparables de rendimiento entre ambos sistemas sobre el mismo conjunto de evaluación.

## Limitaciones y advertencias

- Ambos lados de cada par de entrenamiento son salida de traducción automática, por lo que el modelo hereda los errores y el estilo del generador NLLB, que era claramente más débil en runyankole que en luganda.
- Puede perder o alterar el significado, especialmente en números, nombres propios y palabras poco frecuentes.
- No debe usarse para contenido médico, legal o de alto riesgo sin revisión humana.
- Es un modelo a nivel de frase: las entradas superiores a unas 128 piezas se truncan o degradan.
- El texto humano real (dialectos, ortografía variable, alternancia de lenguas) puede manejarse peor de lo que sugieren las métricas sobre datos sintéticos.
- Es una base preentrenada, no un traductor finalizado; no se ha ajustado con datos humanos.
- Las puntuaciones completas sobre SALT test no se han ejecutado, por lo que no existe una evaluación estandarizada publicada.
- La licencia MIT permite uso comercial, pero la calidad limitada del modelo y la naturaleza sintética de los datos desaconsejan su uso en producción sin validación previa.
- Al no ser un modelo `transformers`, requiere el código personalizado del repositorio para cargarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/kieran_base
- Dataset tulati: https://huggingface.co/datasets/amDANIEL2024/tulati
- Generador de datos (NLLB SALT): https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
