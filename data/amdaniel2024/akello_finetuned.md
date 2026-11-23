# amDANIEL2024/akello_finetuned

## Resumen

`akello_finetuned` es un modelo de traducción automática neuronal especializado en el par de lenguas ugandesas Lugbara (código ISO `lgg`) y Ateso (código ISO `teo`), desarrollado por Amanyire Daniel (usuario `amDANIEL2024`). Se trata de un Transformer encoder-decoder de 89 millones de parámetros que traduce de forma directa en ambos sentidos sin pasar por el inglés como lengua pivote, una característica poco habitual en sistemas de traducción para lenguas de bajos recursos.

El modelo parte de un preentrenamiento sobre pares generados por traducción automática (el modelo base `akello_base`) y posteriormente se afina sobre el split de entrenamiento de SALT, un corpus de traducciones humanas. La dirección de traducción se controla mediante un token de prefijo en el origen (`<2teo>` para Lugbara→Ateso y `<2lgg>` para Ateso→Lugbara). Su relevancia radica en que cubre un par lingüístico prácticamente desatendido por los sistemas comerciales, con licencia MIT y un tamaño que permite inferencia en hardware modesto.

El modelo es de ámbito estrictamente de investigación y uso experimental: no es un modelo `transformers` estándar (requiere código de inferencia propio) y sus resultados, aunque superan claramente a una línea base de copia, siguen siendo moderados en términos absolutos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 640, 8 cabezas, FFN 2560, activación GELU |
| Parámetros totales | 89.418.240 (89M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 posiciones (embeddings sinusoidales); pares de entrenamiento limitados a 128 piezas por lado |
| Tipos de cuantización | no disponible (pesos publicados en float32; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Lugbara (`lgg`) y Ateso (`teo`) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (float32) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer encoder-decoder estándar con normalización pre-LN, 6 capas en el encoder y 6 en el decoder, dimensión de modelo 640, 8 cabezas de atención y FFN de 2560 con activación GELU. Los embeddings de entrada, los del decoder y la proyección de salida están atados (weight tying), lo que explica el recuento compacto de 89M parámetros. El tokenizador es un SentencePiece compartido de 32.000 piezas entrenado exclusivamente con texto en Lugbara y Ateso. Usa embeddings posicionales sinusoidales con un máximo de 256 posiciones.

El entrenamiento se realizó en dos fases. Primero, un preentrenamiento sobre los pares Lugbara–Ateso del dataset `tulati`, que son traducciones automáticas generadas por `Sunbird/translate-nllb-1.3b-salt` a partir de una columna en inglés; es decir, ambos lados de cada par son salida de máquina. Tras el filtrado por flags de calidad (188.556 filas descartadas), la eliminación de pares idénticos (1.071) y duplicados exactos (399), y la descontaminación contra SALT dev/test (2 pares), quedaron 1.344.671 pares, de los que 1.999 se reservaron para validación. Después, un afinado sobre el split de entrenamiento de SALT (traducciones humanas) en ambas direcciones, con learning rate 6e-5 y parada temprana sobre la pérdida de dev (paciencia de 5 validaciones); el checkpoint final corresponde al paso 3420. No se documenta uso de RLHF ni DPO.

## Capacidades

- Traducción directa bidireccional Lugbara→Ateso y Ateso→Lugbara mediante token de prefijo (`<2teo>` / `<2lgg>`).
- Traducción sin lengua pivote: no requiere pasar por el inglés en ningún punto del pipeline.
- Procesamiento por lotes: la función `translate` acepta una cadena o una lista de cadenas.
- Decodificación por beam search configurable (beam por defecto de 4, con penalización de longitud de 0,6).
- Manejo de frases a nivel de oración (hasta ~128 piezas por lado en entrenamiento).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües limitadas exclusivamente al par `lgg`/`teo`.

## Casos de uso

- Traducción de documentación comunitaria: traducción de materiales educativos, sanitarios o administrativos entre Lugbara y Ateso para organizaciones locales, con revisión humana obligatoria dado el carácter experimental del modelo.
- Preservación lingüística: generación de pares paralelos Lugbara–Ateso para ampliar corpus de lenguas de bajos recursos, aprovechando que el modelo no necesita inglés como intermediario.
- Herramientas de comunicación en atención ciudadana: borradores de respuesta en la otra lengua para personal que habla solo una de las dos, siempre con validación por hablantes nativos.
- Investigación en traducción de bajos recursos: línea base reproducible (licencia MIT, pesos abiertos, código de inferencia incluido) para experimentos de MT en lenguas ugandesas.
- Preprocesamiento de corpus: alineación y normalización de textos bilingües en proyectos de digitalización lingüística.
- Aplicaciones de mensajería o chat de bajo coste: al ser un modelo de 89M en float32, puede desplegarse en CPU o GPU modesta para traducción de frase corta en tiempo casi real.
- Evaluación comparativa de tokenizadores y arquitecturas para pares lingüísticos sin pivote.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de SALT (n=500 por dirección), decodificación con beam 4 y penalización de longitud 0,6, evaluados con sacreBLEU:

| Conjunto | Dirección | n | BLEU | chrF | chrF++ | Línea base de copia (chrF++) |
|---|---|---|---|---|---|---|
| SALT test | lgg→teo | 500 | 16,83 | 48,79 | 45,54 | 11,63 |
| SALT test | teo→lgg | 500 | 14,65 | 43,90 | 41,54 | 11,30 |
| SALT dev | lgg→teo | 500 | 17,57 | 48,90 | 45,79 | 11,48 |
| SALT dev | teo→lgg | 500 | 17,14 | 45,14 | 42,96 | 11,24 |

La línea base de copia (devolver la frase de origen sin cambios) se incluye para mostrar cuánto de la puntuación procede de palabras compartidas, nombres y números. Las puntuaciones de dev son ligeramente optimistas porque se usaron para seleccionar el checkpoint; el dato principal es el de test. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no son aplicables a un modelo de traducción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en float32 (pesos de 89M parámetros); el repositorio completo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el modelo usa la GPU si está disponible y, en caso contrario, CPU.
- Cabe holgadamente en GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 o superiores, e incluso en CPU para traducción de frases cortas.
- Opciones de despliegue: no es compatible con `transformers` (`AutoModel` no lo carga); requiere el código propio `akello.py` incluido en el repositorio, con dependencias de `torch`, `sentencepiece`, `safetensors` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por frase en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `akello_finetuned` | 89M | 256 posiciones | lgg, teo | MIT | Pesos abiertos en Hugging Face |
| `Sunbird/translate-nllb-1.3b-salt` | 1.300M (1.3B) | no disponible | Multilingüe (incluye lenguas ugandesas) | MIT (según la model card de akello) | Pesos abiertos en Hugging Face |
| `amDANIEL2024/akello_base` | 89M (misma arquitectura) | 256 posiciones | lgg, teo | MIT | Pesos abiertos en Hugging Face |

No se dispone de datos de rendimiento comparables de `Sunbird/translate-nllb-1.3b-salt` para el par Lugbara–Ateso en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa directa. `akello_base` es el predecesor del modelo (preentrenado solo con datos de máquina) y sirve como referencia de ablación, pero tampoco se publican sus métricas en esta ficha.

## Limitaciones y advertencias

- Los pares de preentrenamiento son salida de traducción automática y el afinado se limita a SALT, por lo que el rendimiento puede degradarse en dominios, dialectos, ortografías o code-switching distintos a los del corpus.
- Puede omitir o alterar el significado, especialmente en números, nombres propios y palabras poco frecuentes.
- No debe usarse en contextos médicos, legales o de alto riesgo sin revisión humana.
- Modelo a nivel de oración: entradas superiores a ~128 piezas se truncan o degradan la calidad; el contexto máximo es de 256 posiciones.
- Las salidas no han sido revisadas por hablantes nativos de Lugbara o Ateso.
- Las frases de SALT en Lugbara y Ateso son traducciones humanas independientes de la misma frase en inglés, por lo que una referencia en una lengua no es traducción de la referencia en la otra; esto afecta a la interpretación de las métricas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la calidad ni la idoneidad para producción.
- No es compatible con la API estándar de `transformers`, lo que complica su integración en pipelines existentes.
- Riesgo de sesgos derivados del corpus SALT y de la traducción automática subyacente de `tulati`; no se documenta una evaluación de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/akello_finetuned
- Modelo base: https://huggingface.co/amDANIEL2024/akello_base
- Dataset tulati: https://huggingface.co/datasets/amDANIEL2024/tulati
- Traductor usado para generar los datos: https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
- Sitio del autor: https://domusdeiug.com
- Contacto del autor: domusdeiug@gmail.com
