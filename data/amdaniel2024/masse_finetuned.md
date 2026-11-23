# amDANIEL2024/masse_finetuned

## Resumen

`masse_finetuned` es un modelo de traducción automática neuronal desarrollado por Amanyire Daniel (usuario `amDANIEL2024`) que traduce directamente entre runyankole (`nyn`) y lugbara (`lgg`), dos lenguas bantúes de Uganda, sin pasar por el inglés como lengua pivote. Se trata de un transformer encoder-decoder de 89 millones de parámetros, con 6 capas en el encoder y 6 en el decoder, dimensión de modelo de 640 y 8 cabezas de atención. La dirección de traducción se controla mediante un token de prefijo en la oración de origen (`<2lgg>` o `<2nyn>`).

El modelo se ha preentrenado sobre el corpus `tulati`, compuesto íntegramente por pares generados mediante traducción automática con el modelo `Sunbird/translate-nllb-1.3b-salt`, y posteriormente se ha ajustado fino sobre la partición de entrenamiento de SALT, que contiene traducciones humanas. Es relevante porque aborda un par de lenguas de bajos recursos para el que apenas existen sistemas públicos de traducción directa, y lo hace con un modelo compacto (0,4 GB en float32) que puede ejecutarse en hardware modesto.

La licencia MIT y el código de inferencia autocontenido (`masse.py`) facilitan su uso y reproducción, aunque las puntuaciones publicadas (BLEU 13,66 en nyn→lgg y 10,16 en lgg→nyn sobre SALT test) sitúan al modelo en un régimen de calidad moderado, adecuado para experimentación y prototipado pero no para producción de alto riesgo sin revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 640, 8 cabezas, FFN 2560, activación GELU |
| Parametros totales | 89.418.240 (89M); embeddings de entrada, de decoder y proyección de salida atados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones (codificación sinusoidal); pares de entrenamiento limitados a 128 piezas por lado |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | runyankole (`nyn`) y lugbara (`lgg`) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (float32), tokenizador SentencePiece (`spm.model`), código de inferencia `masse.py` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer encoder-decoder estándar con normalización previa a cada subcapa (pre-LN), 6 capas en el encoder y 6 en el decoder, dimensión de modelo de 640, 8 cabezas de atención y red feed-forward de 2560 unidades con activación GELU. Emplea un tokenizador SentencePiece compartido de 32.000 piezas, entrenado únicamente con texto en runyankole y lugbara (corpus `tulati` más el texto de la partición de entrenamiento de SALT). Los embeddings de entrada, de decoder y la proyección de salida están atados, lo que explica el reducido número de parámetros para su configuración.

El preentrenamiento se realizó sobre el corpus `tulati`, que contiene 1.401.757 pares tras el filtrado (de 1.534.699 filas iniciales se descartaron 130.693 por flags de calidad, 1.803 por lados idénticos y 445 duplicados exactos; la descontaminación contra SALT dev/test eliminó 1 par adicional). Es importante señalar que ambos lados de cada par de `tulati` son salida de traducción automática generada por `Sunbird/translate-nllb-1.3b-salt`, no texto humano. El ajuste fino se realizó sobre la partición de entrenamiento de SALT (traducciones humanas), en ambas direcciones, con tasa de aprendizaje 6e-5 y parada temprana sobre la pérdida de SALT dev (paciencia de 5 validaciones); el checkpoint final corresponde al paso 2400.

## Capacidades

- Traducción directa bidireccional runyankole → lugbara y lugbara → runyankole sin lengua pivote intermedia.
- Selección de dirección mediante token de prefijo en la oración de origen (`<2lgg>` para generar lugbara, `<2nyn>` para generar runyankole).
- Decodificación por beam search (parámetro `beam`, valor por defecto 4).
- Procesamiento por lotes: el método `translate` acepta tanto una cadena como una lista de cadenas.
- Tokenizador compartido entrenado específicamente en las dos lenguas objetivo, sin vocabulario inglés.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento; es un modelo puramente seq2seq de traducción.

## Casos de uso

- Traducción de documentación comunitaria: traducción de materiales divulgativos, avisos y textos administrativos entre runyankole y lugbara para organizaciones locales, aprovechando que el modelo no requiere inglés intermedio y puede ejecutarse en hardware modesto (0,4 GB de pesos).
- Prototipado de aplicaciones de mensajería: integración del modelo en chats o servicios de mensajes para ofrecer traducción instantánea entre ambas lenguas, con el código `masse.py` autocontenido y dependencias mínimas (torch, sentencepiece, safetensors).
- Investigación en traducción de bajos recursos: uso como línea base reproducible para experimentos de traducción directa entre lenguas africanas, dado que la model card documenta con detalle el pipeline de filtrado, preentrenamiento y ajuste fino.
- Generación de corpus sintéticos de apoyo: producción de borradores de traducción que hablantes nativos puedan post-editar, útil para ampliar datos de entrenamiento de otros sistemas, siempre con revisión humana.
- Enseñanza y preservación lingüística: herramienta de apoyo para estudiantes y lingüistas que trabajen con runyankole y lugbara, con la advertencia de que las salidas no han sido revisadas por hablantes nativos.
- Despliegue en entornos con recursos limitados: el tamaño reducido del modelo (89M parámetros, float32) permite ejecutarlo en CPU o en GPU de gama baja para servicios de traducción por lotes de oraciones cortas.
- Evaluación comparativa de traductores: uso del modelo junto con el baseline de copia reportado en la model card (chrF++ 11,70 y 11,40) para medir la ganancia real de un sistema entrenado frente a no traducir.

## Benchmarks y rendimiento

| Conjunto | Dirección | n | BLEU | chrF | chrF++ | Baseline de copia (chrF++) |
|---|---|---|---|---|---|---|
| SALT test | nyn→lgg | 500 | 13,66 | 42,20 | 39,94 | 11,70 |
| SALT test | lgg→nyn | 500 | 10,16 | 45,15 | 40,30 | 11,40 |
| SALT dev | nyn→lgg | 500 | 15,85 | 43,01 | 40,93 | 11,99 |
| SALT dev | lgg→nyn | 500 | 8,71 | 45,30 | 40,49 | 11,67 |

Las puntuaciones se obtuvieron con beam 4 y penalización de longitud 0,6, evaluadas con sacreBLEU (firmas: bleu `nrefs:1|case:mixed|eff:no|tok:13a|smooth:exp|version:2.5.1`; chrf `nrefs:1|case:mixed|eff:yes|nc:6|nw:0|space:no|version:2.5.1`; chrf++ `nrefs:1|case:mixed|eff:yes|nc:6|nw:2|space:no|version:2.5.1`). El baseline de copia devuelve la oración de origen sin cambios y sirve para cuantificar cuánto de la puntuación procede de palabras compartidas, nombres y números. Las puntuaciones de dev son ligeramente optimistas porque se usaron para seleccionar el checkpoint; las de test son la referencia principal.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB para los pesos en float32, más memoria adicional para activaciones y beam search; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el modelo es viable en tarjetas de gama baja y en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, series GTX 10xx en adelante, RTX 20xx/30xx/40xx) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: el modelo no es compatible con `transformers` (`AutoModel` no lo carga); requiere el código `masse.py` incluido en el repositorio, con PyTorch, SentencePiece y safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| masse_finetuned | 89M | 256 posiciones | nyn, lgg | MIT | BLEU 13,66 (nyn→lgg) y 10,16 (lgg→nyn) en SALT test |
| Sunbird/translate-nllb-1.3b-salt | 1.300M (1,3B) | no disponible | multilingüe (incluye nyn y lgg según su uso en tulati) | no disponible en la información proporcionada | no disponible; la model card de masse_finetuned no reporta su calidad para runyankole o lugbara |
| amDANIEL2024/masse_base | 89M (misma arquitectura) | 256 posiciones | nyn, lgg | MIT | no disponible (modelo base preentrenado sobre tulati) |

No se dispone de datos de benchmarks de `Sunbird/translate-nllb-1.3b-salt` ni de `masse_base` en la información proporcionada para establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- Los pares de preentrenamiento son salida de traducción automática y el ajuste fino se limita a SALT, por lo que el modelo puede degradarse en dominios, dialectos, ortografías o code-switching distintos a los de SALT.
- Puede omitir o alterar el significado, especialmente en números, nombres y palabras poco frecuentes; no debe usarse para contenido médico, legal u otro de alto riesgo sin revisión humana.
- Modelo a nivel de oración: las entradas superiores a unas 128 piezas se truncan o degradan la calidad; el contexto máximo es de 256 posiciones.
- Las salidas no han sido revisadas por hablantes nativos de runyankole o lugbara.
- Las referencias de SALT en runyankole y lugbara son traducciones humanas independientes de la misma oración inglesa, no traducciones entre sí, lo que afecta a la interpretación de las métricas.
- Las puntuaciones de dev son optimistas porque se usaron para seleccionar el checkpoint.
- Licencia MIT: permite uso comercial, pero no se documentan garantías ni soporte; el autor no reporta auditorías de sesgo.
- No es compatible con la API `transformers`; requiere el código de inferencia propio del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/masse_finetuned
- Modelo base: https://huggingface.co/amDANIEL2024/masse_base
- Dataset tulati: https://huggingface.co/datasets/amDANIEL2024/tulati
- Traductor usado para generar tulati: https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
- Sitio del autor: https://domusdeiug.com
- Contacto del autor: domusdeiug@gmail.com
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
