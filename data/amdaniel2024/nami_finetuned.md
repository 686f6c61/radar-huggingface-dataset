# amDANIEL2024/nami_finetuned

## Resumen

`nami_finetuned` es un modelo de traducción automática neuronal de tipo encoder-decoder Transformer con 89 millones de parámetros, desarrollado por el usuario amDANIEL2024. Traduce en ambas direcciones entre inglés y luganda (una lengua bantú hablada principalmente en Uganda) mediante un único modelo en el que la dirección se selecciona con un token de prefijo (`<2lug>` o `<2eng>`). El modelo parte de una base preentrenada llamada `nami` y se afina sobre el conjunto de entrenamiento del corpus SALT, compuesto por pares traducidos por humanos.

El modelo aborda un problema clásico de las lenguas de bajos recursos: la escasez de corpus paralelos de calidad. Para el preentrenamiento se emplearon aproximadamente 1,5 millones de pares generados por traducción automática (el lado en luganda fue producido por `Sunbird/translate-nllb-1.3b-salt`, un modelo NLLB de 1,3B parámetros afinado sobre SALT), y después se realizó un ajuste fino supervisado sobre datos humanos. Esta estrategia de destilación de un modelo profesor grande hacia uno pequeño y desplegable resulta relevante para contextos con recursos computacionales limitados.

Con tan solo 89M de parámetros y un contexto de 256 posiciones, el modelo es adecuado para despliegue en hardware modesto, incluso en GPUs de consumo. Su licencia figura como "TODO" en la model card, lo que constituye una limitación importante para uso comercial. El modelo se publicó en noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 640, 8 cabezas, FFN 2560, activación GELU |
| Parámetros totales | 89.418.240 (89M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 posiciones (codificación sinusoidal); pares de entrenamiento limitados a 128 piezas por lado |
| Tipos de cuantización | no disponible (pesos publicados en float32; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) y luganda (lg) |
| Licencia | TODO (sin licencia definida; el autor advierte de que debe comprobar las licencias del dataset inglés, del modelo NLLB que generó el luganda, de tulati y de SALT) |
| Formato de pesos | `model.safetensors` (float32) |
| Tokenizador | SentencePiece unigram compartido, 32.000 piezas, preserva mayúsculas, separa dígitos (`spm.model`) |
| Librería | PyTorch (modelo personalizado, no compatible con `transformers`/`AutoModel`) |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un Transformer encoder-decoder estándar con normalización previa (pre-LN), seis capas en el encoder y seis en el decoder, dimensión de modelo de 640, ocho cabezas de atención, capa feed-forward de 2560 y activación GELU. Los embeddings de entrada, los del decoder y la proyección de salida están atados (weight tying), lo que reduce el recuento de parámetros. La codificación posicional es sinusoidal y el contexto máximo es de 256 posiciones, aunque los pares de entrenamiento se limitaron a 128 piezas por lado. El tokenizador es un SentencePiece unigram compartido de 32.000 piezas que preserva mayúsculas y separa los dígitos.

El entrenamiento se desarrolló en dos fases. La primera, de preentrenamiento, empleó los pares del dataset `tulati` (unos 1,5 millones tras el filtrado) en ambas direcciones durante 5 épocas y 19.825 pasos de optimizador, en una única GPU Kaggle T4 con precisión fp16. El lado inglés procede del conjunto completo `agentlans/high-quality-english-sentences`, mientras que el lado en luganda es traducción automática generada por `Sunbird/translate-nllb-1.3b-salt`. La segunda fase consistió en un ajuste fino sobre el split de entrenamiento de SALT (datos humanos), que es lo que da lugar a `nami_finetuned`. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación; la innovación principal es la destilación de un profesor de 1,3B parámetros hacia un estudiante de 89M mediante datos sintéticos y ajuste fino supervisado.

## Capacidades

- Traducción bidireccional inglés → luganda y luganda → inglés con un único modelo, seleccionando la dirección mediante el token de prefijo (`eng2lug` / `lug2eng`).
- Traducción de frases sueltas y de listas de frases (la API `translate` acepta una cadena o una lista).
- Traducción de párrafos completos, aunque con calidad variable (véase el ejemplo de la model card, donde la traducción del párrafo inverso presenta errores gramaticales).
- Decodificación por búsqueda en haz (beam search) configurable, con valor por defecto de 4.
- Preservación de mayúsculas y separación de dígitos gracias al tokenizador SentencePiece.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio; es un modelo puramente de traducción texto a texto.
- Capacidad multilingüe limitada exclusivamente a los dos idiomas indicados (en y lg).

## Casos de uso

- Traducción de documentación y materiales educativos al luganda: el modelo puede traducir frases y párrafos de contenido educativo, sanitario o administrativo, y su tamaño reducido permite integrarlo en servidores modestos o incluso en entornos de escritorio.
- Localización de interfaces y textos cortos de aplicaciones: al aceptar listas de frases y preservar mayúsculas y dígitos, resulta adecuado para traducir cadenas de UI y mensajes de forma por lotes.
- Traducción inversa luganda → inglés para análisis de contenido: permite procesar textos en luganda (por ejemplo, redes sociales o encuestas) y llevarlos al inglés para su posterior análisis con herramientas que no soportan ese idioma.
- Asistencia a traductores humanos como primera pasada: con un BLEU de 27,5 (EN→LG) y 34,4 (LG→EN) sobre SALT test, puede generar borradores que un revisor humano corrija, reduciendo el esfuerzo inicial.
- Investigación en traducción de lenguas de bajos recursos: sirve como línea base reproducible y ligera (89M parámetros) para comparar estrategias de destilación y aumento de datos sintéticos.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo e incluso en CPU para volúmenes moderados, es viable en proyectos con presupuesto de hardware escaso.
- Traducción de contenido comunitario y ONG: organizaciones que trabajan en Uganda pueden emplearlo para traducir comunicados y materiales de divulgación, siempre con revisión humana dada la licencia indefinida.

## Benchmarks y rendimiento

Resultados sobre los conjuntos SALT traducidos por humanos (beam 4, una referencia por frase, sacreBLEU). El conjunto de test es la métrica principal; dev se usó para seleccionar el checkpoint y por ello es ligeramente optimista.

| Split | Dirección | Frases | BLEU | chrF++ |
|---|---|---|---|---|
| test | Inglés → Luganda | 500 | 27,5 | 57,2 |
| test | Luganda → Inglés | 500 | 34,4 | 55,3 |
| dev | Inglés → Luganda | 500 | 29,0 | 58,4 |
| dev | Luganda → Inglés | 500 | 33,8 | 55,7 |

Comparación con el modelo profesor y con la base preentrenada:

| Inglés → Luganda, SALT test | BLEU | chrF |
|---|---|---|
| `Sunbird/translate-nllb-1.3b-salt` (profesor) | 30,4 | 63,2 |
| `nami_finetuned` | 27,5 | 61,1 |
| `nami` (base preentrenada, antes del ajuste SALT) | 24,8 | 59,0 |

| Luganda → Inglés, SALT test | BLEU | chrF++ |
|---|---|---|
| `nami` (base preentrenada) | 26,1 | 47,9 |
| `nami_finetuned` | 34,4 | 55,3 |

Notas del autor: las cifras del profesor proceden de la documentación de `tulati` y se midieron sobre SALT test, pero no se registran sus ajustes de decodificación; el chrF del profesor es chrF simple (sin n-gramas de palabras), calculado de la misma forma que para `nami_finetuned`. No existe cifra del profesor para Luganda → Inglés. Con 500 frases, diferencias de 1 a 2 BLEU están dentro del ruido estadístico.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 89M parámetros en float32, los pesos ocupan aproximadamente 0,36 GB; con activaciones y beam search de 4, el consumo realista se sitúa en torno a 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; el modelo se entrenó en una Kaggle T4 (16 GB) y funciona holgadamente en ella.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: al ser un modelo PyTorch personalizado (no `transformers`), se carga mediante el código incluido en el repositorio (`from nami import Translator`); no es compatible con vLLM, TGI, llama.cpp ni Ollama de forma directa, salvo que se convierta el modelo a esos formatos.
- Latencia y throughput: no se han publicado mediciones de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EN→LG BLEU (SALT test) | LG→EN BLEU (SALT test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `nami_finetuned` | 89M | 256 | 27,5 | 34,4 | TODO | Hugging Face (0 descargas) |
| `Sunbird/translate-nllb-1.3b-salt` | 1,3B | no disponible | 30,4 | no disponible | no disponible | Hugging Face |
| `nami` (base preentrenada) | 89M | 256 | 24,8 | 26,1 | no disponible | Hugging Face |

El modelo profesor supera a `nami_finetuned` en 2,9 puntos de BLEU en EN→LG, pero con más de 14 veces los parámetros, lo que hace al modelo pequeño mucho más barato de desplegar. Frente a su propia base preentrenada, el ajuste fino aporta +2,7 BLEU en EN→LG y +8,3 BLEU en LG→EN, lo que demuestra el valor de los datos humanos de SALT. No se dispone de información sobre otros modelos comparables de traducción inglés-luganda en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia sin definir ("TODO"): el autor advierte explícitamente de que antes de elegir licencia deben comprobarse las licencias del dataset inglés (`agentlans/high-quality-english-sentences`), del modelo NLLB que generó el lado en luganda, de `tulati` y de SALT. El uso comercial queda en un limbo legal hasta que se resuelva.
- Riesgo de alucinación y errores de traducción: los ejemplos de la model card muestran fallos como traducir "fashion industry" por "fashion stadium" o generar frases gramaticalmente incorrectas en la traducción de párrafos ("It everyone away from support to our schools").
- Contexto limitado a 256 posiciones y pares de entrenamiento de 128 piezas: los textos largos deben dividirse en fragmentos, lo que puede degradar la coherencia.
- Solo dos idiomas (inglés y luganda); no es un modelo multilingüe general.
- El lado en luganda del preentrenamiento es traducción automática, lo que puede propagar sesgos y errores del modelo profesor NLLB.
- Sin datos publicados sobre sesgos demográficos o culturales específicos.
- No compatible con `transformers`, vLLM, TGI ni llama.cpp sin conversión; requiere el código personalizado del repositorio.
- Con 500 frases de evaluación, las diferencias de 1-2 BLEU no son estadísticamente significativas; conviene tratar las cifras con cautela.
- Modelo con 0 descargas y 0 likes: no ha sido validado por la comunidad y carece de retroalimentación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/nami_finetuned
- Modelo base preentrenado `nami`: https://huggingface.co/amDANIEL2024/nami
- Dataset `tulati`: https://huggingface.co/datasets/amDANIEL2024/tulati
- Dataset `agentlans/high-quality-english-sentences`: https://huggingface.co/datasets/agentlans/high-quality-english-sentences
- Modelo profesor `Sunbird/translate-nllb-1.3b-salt`: https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
