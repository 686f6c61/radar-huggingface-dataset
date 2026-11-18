# amDANIEL2024/zewi_base

## Resumen

zewi_base es un modelo de traducción automática neuronal desarrollado por Amanyire Daniel (amDANIEL2024) que traduce directamente entre runyankole (nyn) y acholi (ach), dos lenguas bantúes de Uganda, sin pasar por el inglés en ningún extremo del pipeline. Se trata de un transformer encoder-decoder de 89 millones de parámetros con tokenizador SentencePiece compartido de 32.000 piezas y una ventana de contexto de 256 posiciones. La dirección de traducción se controla mediante un token de prefijo en la fuente (`<2ach>` o `<2nyn>`).

El modelo resuelve un problema concreto: la traducción directa entre dos lenguas de bajos recursos para las que apenas existen sistemas específicos y que normalmente se abordan mediante pivote a través del inglés, con la consiguiente acumulación de errores. Al eliminar el pivote, zewi_base busca reducir la pérdida de información en un par lingüístico poco atendido por la industria.

Es relevante ahora porque se publica como base preentrenada abierta bajo licencia MIT, con código de inferencia autónomo, y porque el ecosistema de modelos para lenguas ugandesas es muy reducido. Sin embargo, el propio autor advierte de que no es un traductor acabado: se entrenó únicamente con pares generados por traducción automática (NLLB) y no se han ejecutado todavía las evaluaciones completas sobre el conjunto de test humano SALT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 640, 8 cabezas, FFN 2560, activación GELU |
| Parametros totales | 89.418.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones (embeddings sinusoidales); pares de entrenamiento limitados a 128 piezas por lado |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | runyankole (nyn) y acholi (ach) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, float32) |
| Tokenizador | SentencePiece unigram compartido, 32.000 piezas, preserva mayúsculas, separa dígitos (`spm.model`) |
| Enlaces de embeddings | sí (input embedding, decoder embedding y proyección de salida atados) |
| Framework | PyTorch (modelo personalizado, no compatible con `AutoModel` de transformers) |

## Arquitectura y entrenamiento

zewi_base es un transformer encoder-decoder estándar con normalización pre-LN, 6 capas en encoder y 6 en decoder, dimensión de modelo 640, 8 cabezas de atención y FFN de 2560 con activación GELU. Emplea embeddings sinusoidales con un máximo de 256 posiciones y un tokenizador SentencePiece unigram compartido de 32.000 piezas entrenado exclusivamente con texto en runyankole y acholi (tulati más el texto del split de entrenamiento de SALT). Los pesos de input embedding, decoder embedding y proyección de salida están atados, lo que explica el recuento de 89M de parámetros.

El entrenamiento se realizó sobre los pares runyankole-acholi del dataset tulati, usados en ambas direcciones. Es crucial entender que en tulati toda columna no inglesa es una traducción automática producida por Sunbird/translate-nllb-1.3b-salt: no hay texto humano en runyankole ni en acholi. Tras filtrar 87.670 filas marcadas como vacías, degeneradas, sospechosas de ser inglés o atípicas en longitud, eliminar 1.805 pares con lados idénticos, 574 duplicados exactos y 2 pares por descontaminación contra SALT dev/test, quedaron 1.444.648 pares, de los cuales 2.000 se reservaron para validación. El entrenamiento consistió en 5 épocas, 19.824 pasos de optimizador (unos 25.000 tokens objetivo por paso), precisión fp16 sobre una única GPU Kaggle T4, label smoothing de 0,1, AdamW, warmup lineal seguido de decaimiento inverse-sqrt con LR pico de 3e-4. No se reporta RLHF ni DPO.

## Capacidades

- Traducción directa bidireccional runyankole → acholi y acholi → runyankole mediante prefijo de dirección (`nyn2ach` / `ach2nyn`), sin pivote por inglés.
- Generación de texto secuencia a secuencia con decodificación por beam search (beam 4 por defecto) y decodificación greedy disponible.
- Procesamiento por lotes: el método `translate` acepta una cadena o una lista de cadenas.
- Tokenizador compartido entre ambas lenguas, con preservación de mayúsculas y separación de dígitos.
- Inferencia autónoma mediante el script `zewi.py` incluido en el repositorio, con uso automático de GPU si está disponible.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. Es un modelo puramente de traducción.

## Casos de uso

- Traducción de documentación comunitaria entre runyankole y acholi: el modelo puede traducir directamente textos administrativos o educativos entre ambas lenguas sin depender del inglés, lo que evita la doble traducción y la acumulación de errores. Adecuado para borradores que después revisa un hablante nativo.
- Prototipado de sistemas de traducción para lenguas ugandesas de bajos recursos: al ser una base preentrenada con licencia MIT y código autónomo, sirve como punto de partida para fine-tuning con datos humanos cuando estén disponibles.
- Investigación en traducción de bajos recursos: permite estudiar el comportamiento de un modelo entrenado exclusivamente con datos sintéticos frente a datos humanos (la brecha entre la pérdida en tulati y en SALT dev es un caso de estudio directo).
- Preprocesamiento de corpus multilingües: traducción por lotes de frases cortas (hasta ~128 piezas) para alinear o enriquecer conjuntos de datos en runyankole y acholi.
- Generación de borradores para revisión humana en contextos de divulgación (salud comunitaria, agricultura, avisos locales), siempre con revisión posterior obligatoria por la baja fiabilidad en números y nombres propios.
- Evaluación comparativa de pipelines de traducción: útil como línea base directa frente a sistemas con pivote inglés para medir la ganancia real de la traducción directa en este par lingüístico.

## Benchmarks y rendimiento

El autor no ha ejecutado todavía las puntuaciones completas (BLEU, chrF, chrF++) sobre SALT dev/test. Lo medido hasta el momento, al final del preentrenamiento (paso 19.824):

| Conjunto | Dirección | Loss | chrF++ rápido (greedy, primeras 128 frases) |
|---|---|---|---|
| tulati validación (pares MT retenidos) | nyn→ach | 1,405 | 52,62 |
| tulati validación (pares MT retenidos) | ach→nyn | 1,461 | 52,40 |
| SALT dev (traducciones humanas) | nyn→ach | 3,547 | 34,99 |
| SALT dev (traducciones humanas) | ach→nyn | 3,629 | 37,24 |

Línea base de copia sobre SALT dev completo (salida = frase fuente sin cambios, sacreBLEU 2.5.1):

| Dirección | BLEU | chrF | chrF++ |
|---|---|---|---|
| nyn→ach | 0,21 | 14,88 | 12,03 |
| ach→nyn | 0,21 | 12,76 | 10,60 |

El chrF++ rápido es una comprobación ruidosa sobre un subconjunto pequeño con decodificación greedy y no es comparable con puntuaciones de conjunto completo. El autor señala que SALT dev solo se observó, no se usó para elegir nada. No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 89M de parámetros en float32, los pesos ocupan aproximadamente 0,36 GB; sumando activaciones y tokenizador, la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor entrenó en una única Kaggle T4 (16 GB) en fp16, y la inferencia funciona en GPU de gama baja o incluso en CPU para volúmenes moderados.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, GTX 1650, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el modelo es PyTorch personalizado y no se carga con `AutoModel`; el despliegue previsto es el script `zewi.py` incluido en el repositorio, que requiere `torch`, `sentencepiece`, `safetensors` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo y el beam search de 4, se espera una latencia baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zewi_base | 89M | 256 posiciones | nyn, ach (directo) | MIT | Hugging Face, pesos safetensors |
| Sunbird/translate-nllb-1.3b-salt | 1.300M (1.3B) | no disponible | varias lenguas ugandesas vía inglés | MIT | Hugging Face |
| NLLB-200 (familia) | 600M–54B según variante | 512 tokens (variantes estándar) | 200 lenguas, pivote por inglés | CC-BY-NC 4.0 (uso no comercial en varias variantes) | Hugging Face |

zewi_base se distingue por traducir directamente entre nyn y ach sin inglés y por su licencia MIT permisiva, frente a NLLB, que opera con pivote y tiene restricciones de uso comercial en algunas variantes. Frente a Sunbird/translate-nllb-1.3b-salt, que es el generador de los datos de entrenamiento, zewi_base es 15 veces más pequeño y especializado en un único par. No hay datos de benchmarks comparativos publicados para establecer una comparación de calidad entre estos sistemas en este par lingüístico.

## Limitaciones y advertencias

- Es una base preentrenada, no un traductor acabado: no se ha ajustado con datos traducidos por humanos.
- Ambos lados de cada par de entrenamiento son salida de máquina (NLLB), por lo que el modelo hereda errores y estilo del traductor generador; el texto humano real (dialectos, ortografía variable, code-switching) puede manejarse peor de lo que sugieren las métricas.
- La brecha entre la pérdida en tulati (≈1,4) y en SALT dev (≈3,6) evidencia el dominio sintético del entrenamiento frente a traducciones humanas.
- Puede omitir o alterar el significado, especialmente en números, nombres propios y palabras poco frecuentes; no debe usarse en contenido médico, legal o de alto riesgo sin revisión humana.
- Modelo a nivel de frase: entradas de más de unas 128 piezas se truncan o degradan.
- Las salidas no han sido revisadas por un lector nativo de acholi.
- No se han ejecutado las evaluaciones completas sobre SALT test, que permanece intacto.
- Sesgos conocidos: no documentados explícitamente, pero al entrenar solo con datos sintéticos de un único generador, hereda los sesgos y la distribución de ese sistema.
- Licencia MIT, que permite uso comercial, pero el estado de validación del modelo desaconseja producción sin fine-tuning y evaluación adicionales.
- El modelo no es compatible con la API estándar de `transformers`, lo que limita su integración en pipelines que dependan de `AutoModel`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/zewi_base
- Dataset de entrenamiento tulati: https://huggingface.co/datasets/amDANIEL2024/tulati
- Modelo generador de los datos (Sunbird NLLB): https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
