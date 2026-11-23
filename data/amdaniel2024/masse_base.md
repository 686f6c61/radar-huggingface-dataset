# amDANIEL2024/masse_base

## Resumen

`masse_base` es un modelo de traducción automática neuronal desarrollado por Amanyire Daniel (amDANIEL2024) que traduce directamente entre runyankole (`nyn`) y lugbara (`lgg`), dos lenguas bantúes y nilóticas de Uganda, sin pasar por el inglés en ningún extremo del pipeline. Se trata de un transformer encoder-decoder pre-LN de 89 millones de parámetros con 6 capas en el encoder y 6 en el decoder, dimensión de modelo 640, 8 cabezas de atención y FFN de 2560, con embeddings de entrada, salida y proyección final atados. La dirección de traducción se controla mediante un token de prefijo en la fuente (`<2lgg>` o `<2nyn>`).

El modelo se presenta explícitamente como una base preentrenada y no como un traductor finalizado: se entrenó únicamente sobre pares generados por traducción automática (el conjunto `tulati`, producido con `Sunbird/translate-nllb-1.3b-salt`), sin datos humanos de runyankole ni lugbara. Existe una versión afinada publicada por separado (`amDANIEL2024/masse_finetuned`). Su relevancia radica en abordar un par lingüístico de bajos recursos sin pivotar por inglés, algo poco habitual en modelos de traducción de este tamaño.

Con 256 posiciones de contexto, tokenizador SentencePiece compartido de 32.000 piezas y pesos en float32, es un modelo ligero (0,4 GB de repositorio) orientado a traducción a nivel de frase. La licencia MIT facilita su reutilización e integración en herramientas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 640, 8 cabezas, FFN 2560, GELU |
| Parametros totales | 89.418.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones (embeddings sinusoidales); pares de entrenamiento limitados a 128 piezas por lado |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | runyankole (nyn), lugbara (lgg) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, float32); tokenizador SentencePiece (`spm.model`); código de inferencia propio (`masse.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder estándar con normalización pre-LN, 6 capas en cada torre, dimensión de modelo 640, 8 cabezas de atención y FFN de 2560 con activación GELU. Los embeddings de entrada, los del decoder y la proyección de salida están atados, lo que reduce el recuento de parámetros hasta los 89M. El tokenizador es un SentencePiece compartido de 32.000 piezas entrenado solo con texto de runyankole y lugbara (procedente de `tulati` y del split de entrenamiento de SALT). La dirección se indica con un prefijo en la fuente (`<2lgg>` / `<2nyn>`).

El entrenamiento usó exclusivamente los pares runyankole–lugbara del dataset `tulati`, en ambas direcciones. Cabe subrayar que en `tulati` cada columna no inglesa es una traducción automática de una columna inglesa generada con `Sunbird/translate-nllb-1.3b-salt`, de modo que ambos lados de cada par son salida de máquina y no contienen texto humano. El filtrado partió de 1.534.699 filas, descartó 130.693 por flags de calidad (vacías, degeneradas, parecido al inglés, longitudes atípicas), eliminó 1.803 pares con lados idénticos y 445 duplicados exactos, y tras descontaminar contra dev/test de SALT quedaron 1.401.757 pares, de los que 2.000 se reservaron para validación. El preentrenamiento consistió en 5 épocas, 24.340 pasos de optimizador (unos 25k tokens objetivo por paso), en fp16 sobre una única Kaggle T4, con label smoothing 0,1, AdamW y warmup lineal seguido de decaimiento inverse-sqrt con LR pico de 3e-4. No se documenta RLHF ni DPO.

## Capacidades

- Traducción directa bidireccional runyankole → lugbara y lugbara → runyankole, sin pivotar por inglés.
- Selección de dirección mediante prefijo en la fuente (`<2lgg>` para generar lugbara, `<2nyn>` para generar runyankole).
- Traducción a nivel de frase con decodificación por beam search (beam por defecto de 4).
- Procesamiento por lotes: la función `translate` acepta una cadena o una lista de cadenas.
- Tokenizador multilingüe compartido para las dos lenguas, con 32.000 piezas.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- Capacidad multilingüe limitada estrictamente a `nyn` y `lgg`.

## Casos de uso

- Traducción de documentación comunitaria entre runyankole y lugbara: el modelo permite convertir textos de una lengua a la otra sin depender del inglés, útil en contextos de comunicación interregional en Uganda.
- Preprocesamiento para pipelines de datos multilingües: puede generar pares sintéticos nyn–lgg que sirvan como datos de aumento o como paso intermedio antes de una revisión humana.
- Base para fine-tuning supervisado: al ser un modelo preentrenado sobre datos sintéticos, sirve como punto de partida para ajustarse con pares humanos (como los de SALT) y mejorar la calidad real, tal como hace la variante `masse_finetuned`.
- Herramientas de traducción asistida por ordenador (TAO): integrable en un editor con revisión humana posterior, dado su bajo coste computacional y su licencia MIT.
- Investigación en traducción de bajos recursos: referencia para estudiar el efecto de entrenar exclusivamente con datos sintéticos en pares lingüísticos sin corpus paralelos humanos abundantes.
- Prototipado rápido en entornos con recursos limitados: sus 89M de parámetros y 0,4 GB permiten desplegarlo en una sola GPU de consumo o incluso en CPU para pruebas de concepto.
- Evaluación comparativa de traductores indirectos: permite medir la diferencia entre traducir nyn→lgg de forma directa frente a pivotar por inglés con modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos (SALT dev/test) para esta base. La model card recoge únicamente comprobaciones rápidas al final del preentrenamiento (chrF++ greedy sobre las primeras 128 frases), que el propio autor advierte que son ruidosas y no comparables con puntuaciones de conjunto completo:

| Conjunto | Dirección | Loss | chrF++ rápido (greedy, primeras 128 frases) |
|---|---|---|---|
| Validación de tulati (pares sintéticos reservados) | nyn→lgg | 1,197 | 51,32 |
| Validación de tulati (pares sintéticos reservados) | lgg→nyn | 1,685 | 45,88 |
| SALT dev (traducciones humanas) | nyn→lgg | 3,139 | 36,44 |
| SALT dev (traducciones humanas) | lgg→nyn | 3,604 | 35,13 |

## Requisitos de hardware

- VRAM estimada para inferencia en float32: en torno a 0,4 GB para los pesos, más overhead de activaciones y del tokenizador; cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo se entrenó en una Kaggle T4, por lo que una T4, una RTX 3060/4090 o superiores son más que suficientes. Para producción a gran escala, A100 o H100 aportan margen de sobra pero no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: no es un modelo `transformers`, por lo que `AutoModel` no lo carga. Se usa el código propio `masse.py` incluido en el repositorio (PyTorch + SentencePiece + safetensors). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| masse_base | 89M | 256 posiciones | nyn, lgg | MIT | Traducción directa nyn↔lgg, entrenado solo con datos sintéticos |
| Sunbird/translate-nllb-1.3b-salt | 1.300M (aproximado, familia NLLB 1.3B) | no disponible | Multilingüe (incluye nyn y lgg) | MIT | Traductor que generó los datos de entrenamiento de masse_base; pivota por inglés |
| masse_finetuned | no disponible | no disponible | nyn, lgg | MIT | Variante afinada del propio modelo, publicada por el mismo autor |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los pares de entrenamiento son salida de máquina, por lo que el modelo hereda los errores y el estilo del traductor que los generó; el texto humano real (dialectos, ortografía variable, alternancia de lenguas) puede manejarse peor de lo que sugieren las métricas.
- Puede omitir o alterar el significado, especialmente en números, nombres propios y palabras poco frecuentes.
- No debe usarse en contenido médico, legal o de alto riesgo sin revisión humana.
- Modelo a nivel de frase: entradas de más de aproximadamente 128 piezas se truncan o degradan.
- Las salidas no han sido revisadas por hablantes nativos de runyankole ni de lugbara.
- Es una base preentrenada, no un traductor finalizado; para uso real conviene la variante afinada o un ajuste propio con datos humanos.
- Las puntuaciones de SALT dev son notablemente peores que las de validación sintética, lo que refleja la brecha entre datos de máquina y humanos.
- Licencia MIT: permite uso comercial, pero la calidad del modelo en producción no está garantizada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/masse_base
- Versión afinada: https://huggingface.co/amDANIEL2024/masse_finetuned
- Dataset de entrenamiento (tulati): https://huggingface.co/datasets/amDANIEL2024/tulati
- Traductor que generó los datos: https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
- Sitio del autor: https://domusdeiug.com
