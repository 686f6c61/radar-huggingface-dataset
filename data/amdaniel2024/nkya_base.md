# amDANIEL2024/nkya_base

## Resumen

`nkya_base` es un modelo de traducción automática neuronal de tipo encoder-decoder Transformer, desarrollado por Amanyire Daniel (usuario `amDANIEL2024`), que traduce directamente entre cualquier par de seis idiomas: inglés (`eng`), luganda (`lug`), runyankole (`nyn`), acholi (`ach`), lugbara (`lgg`) y ateso (`teo`). Con un único modelo se cubren las 30 direcciones posibles, seleccionadas mediante un token de prefijo en la fuente que indica el idioma destino (`<2eng>`, `<2lug>`, etc.).

El modelo cuenta con 241,9 millones de parámetros (embeddings de entrada, embedding del decoder y proyección de salida atados) y una arquitectura pre-LN Transformer con 6 capas de encoder y 6 de decoder, `d_model` de 1024, 16 cabezas de atención y FFN de 4096 con activación GELU. Emplea un tokenizador SentencePiece compartido de 64.000 piezas y una ventana de contexto de 256 posiciones (textos de entrenamiento limitados a 128 piezas).

Es relevante porque aborda un par de lenguas escasamente representadas en los sistemas de traducción comerciales (lenguas bantúes y nilóticas de Uganda) con un único modelo multilingüe any-to-any de tamaño contenido. No obstante, se trata de un **modelo base preentrenado**, no de un traductor finalizado: se entrenó exclusivamente con pares generados por traducción automática y no se ha ajustado con datos de traducción humana. Existe una versión afinada publicada por separado (`amDANIEL2024/nkya_finetuned`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 1024, 16 cabezas, FFN 4096, GELU |
| Parametros totales | 241.897.472 (242M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones (sinusoidal); textos de entrenamiento limitados a 128 piezas |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (eng), lg (lug), nyn, ach, lgg, teo |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, float32); tokenizador SentencePiece (`spm.model`); código de inferencia propio (`nkya.py`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer encoder-decoder estándar con normalización pre-LN: 6 capas en el encoder y 6 en el decoder, dimensión de modelo 1024, 16 cabezas de atención, FFN de 4096 y activación GELU. Los embeddings de entrada, el embedding del decoder y la proyección de salida están atados, lo que reduce el recuento de parámetros. La dirección de traducción se controla mediante tokens de prefijo en la fuente (`<2eng>`, `<2lug>`, `<2nyn>`, `<2ach>`, `<2lgg>`, `<2teo>`). El tokenizador es un único modelo SentencePiece de 64.000 piezas entrenado con una proporción equitativa de texto de los seis idiomas.

Los datos de entrenamiento provienen del dataset `amDANIEL2024/tulati`, con 1.534.699 filas iniciales en las que la columna inglesa es el texto fuente y el resto de columnas son **traducciones automáticas** generadas por `Sunbird/translate-nllb-1.3b-salt`. Tras el filtrado por flags de calidad (por idioma: lug 34.011, nyn 35.277, ach 61.272, lgg 104.472, teo 104.732 descartados; inglés sin descartes), la eliminación de filas con menos de dos idiomas utilizables y de 14 duplicados exactos, quedaron 1.532.808 filas; la descontaminación frente a SALT dev/test eliminó 4 filas, resultando en 1.531.304 filas de entrenamiento y 1.500 de validación. Cada fila se usa en varias direcciones por época, con una selección aleatoria de direcciones en cada época.

El preentrenamiento se **detuvo anticipadamente** en el paso 15.133 (una época completa y parte de la siguiente, de las 8 planificadas), con un schedule que no se ejecutó hasta el final. Se usaron aproximadamente 18.000 tokens objetivo por paso, fp16 sobre una única GPU Kaggle T4, label smoothing de 0,1, AdamW con warmup lineal y decaimiento inverso de la raíz cuadrada (LR pico de 2e-4). No se documenta RLHF ni DPO.

## Capacidades

- Traducción directa any-to-any entre 30 direcciones de seis idiomas (inglés, luganda, runyankole, acholi, lugbara y ateso) con un único modelo.
- Selección de dirección mediante token de prefijo en la fuente (`<2eng>`, `<2lug>`, `<2nyn>`, `<2ach>`, `<2lgg>`, `<2teo>`).
- Traducción por lotes: la función `translate` acepta una cadena o una lista de cadenas.
- Decodificación por búsqueda de haz configurable (por defecto `beam=4`).
- Traducción a nivel de frase (entradas de hasta aproximadamente 128 piezas).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Traducción de documentación técnica y material comunitario entre inglés y lenguas ugandesas: el modelo puede traducir textos de referencia de dominio general, aunque al ser una base preentrenada conviene usar la versión afinada o validar la salida con hablantes nativos.
- Investigación en traducción de bajos recursos: sirve como punto de partida (checkpoint base) para fine-tuning supervisado con datos humanos en las seis lenguas, gracias a su licencia MIT y a su tamaño manejable (242M).
- Prototipado rápido de pipelines multilingües: la API `Translator.translate` con selección de dirección por prefijo permite integrar las 30 direcciones en un único servicio sin desplegar un modelo por par de idiomas.
- Evaluación comparativa de calidad por dirección: útil para estudiar el comportamiento de un modelo entrenado solo con datos sintéticos frente a datos humanos (por ejemplo, usando SALT dev como referencia).
- Traducción de contenido de dominio público (noticias, textos educativos) en entornos con recursos limitados: el modelo cabe en una GPU de consumo y se puede ejecutar en hardware modesto.
- Generación de datos sintéticos aumentados: las traducciones del modelo pueden emplearse como material adicional para entrenar o aumentar otros sistemas de traducción de las mismas lenguas, con revisión posterior.
- Herramientas de apoyo a la traducción asistida por ordenador: como generador de borradores que un traductor humano revisa, dado que el modelo no está pensado para contenido de alto riesgo sin supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (BLEU, chrF, MMLU, etc.) en la información disponible. La model card indica que las puntuaciones completas sobre SALT dev/test **no se han ejecutado todavía** para esta versión base. Solo se reportan pérdidas al final del preentrenamiento (paso 15.133), promediadas sobre direcciones:

| Conjunto | Pérdida | Perplejidad |
|---|---|---|
| Validación de tulati (filas retenidas traducidas por máquina, 8 direcciones por fila) | 1,725 | 5,6 |
| SALT dev (traducciones humanas, todas las direcciones) | 3,273 | 26,4 |

La propia model card advierte que la pérdida no es comparable entre ambos conjuntos (texto generado por máquina frente a texto humano) y que las pérdidas por dirección están en los logs de entrenamiento, no en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en float32 (242M parámetros) el modelo ocupa aproximadamente 1 GB; en fp16 o bf16 se reduce a unos 0,5 GB, más el overhead de activaciones y del tokenizador.
- GPU recomendadas: el modelo se entrenó en una única Kaggle T4 (16 GB), por lo que cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090, así como en T4 o incluso en CPU para volúmenes moderados.
- Opciones de despliegue: al ser un modelo PyTorch personalizado (no es un modelo `transformers`), `AutoModel` no lo carga; la vía documentada es el código propio `nkya.py` incluido en el repositorio, con dependencias de `torch`, `sentencepiece`, `safetensors` y `huggingface_hub`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nkya_base` (este modelo) | 242M | 256 posiciones (128 piezas en entrenamiento) | 6 (en, lug, nyn, ach, lgg, teo) | MIT | Hugging Face, código de inferencia propio |
| `Sunbird/translate-nllb-1.3b-salt` | 1,3B (aproximado, no confirmado en la información) | no disponible | no disponible | MIT (según la model card de nkya_base) | Hugging Face |
| `amDANIEL2024/nkya_finetuned` | no disponible | no disponible | 6 (mismas lenguas) | MIT | Hugging Face |

El modelo generador de los datos de entrenamiento (`Sunbird/translate-nllb-1.3b-salt`) es el referente más directo en cuanto a lenguas cubiertas, aunque la información disponible no detalla sus especificaciones completas. No se dispone de datos de benchmarks que permitan comparar el rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Los pares de entrenamiento son salida de traducción automática (generados por `Sunbird/translate-nllb-1.3b-salt`), por lo que el modelo hereda los errores y el estilo de ese traductor; el texto humano real (dialectos, ortografía variable, cambio de código) puede manejarse peor de lo que sugieren las métricas.
- La calidad varía notablemente entre direcciones; la model card recomienda consultar las tablas por dirección antes de confiar en una concreta.
- Puede perder o alterar el significado, especialmente en números, nombres propios y palabras poco frecuentes. No debe usarse para contenido médico, legal ni de alto riesgo sin revisión humana.
- Modelo a nivel de frase: las entradas de más de aproximadamente 128 piezas se truncan o degradan.
- Las salidas no han sido revisadas por hablantes nativos de las lenguas no inglesas.
- Es un modelo base preentrenado, no un traductor finalizado; para uso en producción se recomienda la versión afinada `amDANIEL2024/nkya_finetuned`.
- El preentrenamiento se detuvo anticipadamente (paso 15.133 de 8 épocas planificadas), por lo que más entrenamiento podría cambiar los resultados.
- No es un modelo `transformers`: requiere el código de inferencia propio incluido en el repositorio.
- Licencia MIT: permite uso comercial, pero la model card no ofrece garantías sobre la calidad de las traducciones en dominios sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/nkya_base
- Versión afinada: https://huggingface.co/amDANIEL2024/nkya_finetuned
- Dataset de entrenamiento (tulati): https://huggingface.co/datasets/amDANIEL2024/tulati
- Modelo generador de los datos (Sunbird/translate-nllb-1.3b-salt): https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
- Sitio del autor: https://domusdeiug.com
- Contacto del autor: domusdeiug@gmail.com
