# amDANIEL2024/kintu_finetuned

## Resumen

kintu_finetuned es un modelo de traducción automática encoder-decoder desarrollado por Amanyire Daniel (amDANIEL2024) que traduce entre runyankole (nyn) e inglés (en) en ambas direcciones con un único modelo de 89 millones de parámetros. El runyankole es una lengua bantú hablada en el suroeste de Uganda, con recursos digitales muy limitados, y este modelo aborda la escasez de sistemas de traducción de calidad para pares lingüísticos de bajos recursos.

El modelo parte de un preentrenamiento sobre pares generados por traducción automática (el corpus tulati, producido con Sunbird/translate-nllb-1.3b-salt) y se afina posteriormente sobre la partición de entrenamiento de SALT, que contiene traducciones humanas. Esta combinación de preentrenamiento sintético a gran escala y ajuste fino supervisado con datos humanos es la estrategia central del trabajo.

Con 89M de parámetros, una ventana de contexto de 256 posiciones y pesos en float32, es un modelo ligero pensado para traducción a nivel de frase. Su relevancia radica en cubrir un par lingüístico prácticamente ausente en los sistemas comerciales, con licencia MIT y código de inferencia autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6+6 capas, d_model 640, 8 cabezas, FFN 2560, activación GELU |
| Parametros totales | 89.418.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones (embeddings sinusoidales); pares de entrenamiento limitados a 128 piezas por lado |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | runyankole (nyn), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32); tokenizador SentencePiece (`spm.model`) |

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder estándar con normalización pre-LN, 6 capas en encoder y 6 en decoder, dimensión de modelo 640, 8 cabezas de atención y FFN de 2560 con GELU. Los embeddings de entrada, los del decoder y la proyección de salida están atados (weight tying), lo que reduce el recuento de parámetros. La dirección de traducción se controla mediante un token de prefijo en la fuente (`<2eng>` / `<2nyn>`, donde la etiqueta indica el idioma destino). El tokenizador es un SentencePiece compartido de 32.000 piezas entrenado únicamente con texto runyankole e inglés.

El entrenamiento tiene dos fases. Primero, un preentrenamiento sobre el corpus tulati: de 1.534.699 filas, se descartaron 35.277 por flags de calidad (vacías, degeneradas, parecidas al inglés, longitudes atípicas), se eliminaron 1.408 pares con lados idénticos y los duplicados exactos, y la descontaminación contra SALT dev/test eliminó 1 par, quedando 1.498.013 pares, de los cuales 1.999 se reservaron para validación. Cabe destacar que en tulati la columna inglesa es el texto fuente y la columna runyankole es traducción automática, por lo que el lado runyankole de todos los pares es salida de máquina. Después, un ajuste fino sobre la partición de entrenamiento de SALT (traducciones humanas) en ambas direcciones, con LR 6e-5 y early stopping sobre la pérdida de SALT dev (paciencia de 5 validaciones); el checkpoint publicado es el mejor (paso 1600). SALT test se usó solo para las puntuaciones finales.

## Capacidades

- Traducción bidireccional runyankole → inglés e inglés → runyankole con un único modelo, seleccionando dirección mediante prefijo.
- Traducción a nivel de frase con decodificación por beam search (beam 4 por defecto, penalización de longitud 0,6).
- Procesamiento por lotes: la función `translate` acepta una cadena o una lista de cadenas.
- Inferencia autónoma mediante el script `kintu.py` incluido en el repositorio (no requiere `transformers`).
- Uso de GPU si está disponible, con fallback a CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada exclusivamente al par nyn-en.

## Casos de uso

- Traducción de documentación comunitaria: traducción de materiales de salud, agricultura o educación del inglés al runyankole para comunidades del suroeste de Uganda, aprovechando que el modelo cabe en hardware modesto y puede desplegarse localmente.
- Subtitulado y localización de contenido breve: traducción de frases y líneas de diálogo de menos de 128 piezas, idónea para subtítulos o interfaces de aplicaciones dirigidas a hablantes de runyankole.
- Preservación lingüística y corpus paralelos: generación de borradores de traducción para lingüistas que revisan y corrigen, contribuyendo a ampliar los recursos digitales del runyankole.
- Investigación en traducción de bajos recursos: línea base reproducible (licencia MIT, código incluido) para experimentos de aumento de datos, ajuste fino o comparación de estrategias con pares lingüísticos de bajos recursos.
- Asistencia a traductores humanos: pre-traducción de frases para que un traductor nativo posedite, reduciendo el esfuerzo en textos de dominio general similares a SALT.
- Integración en aplicaciones de mensajería o chat: traducción de mensajes cortos en tiempo casi real en dispositivos con GPU de consumo o incluso CPU, dado el reducido tamaño del modelo (0,4 GB en float32).
- Extracción y comprensión de contenidos: traducción al inglés de textos en runyankole para que analistas que no dominan la lengua puedan comprender el contenido, siempre con revisión humana por el riesgo de pérdida de significado en números y nombres.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre SALT (beam 4, penalización de longitud 0,6, sacreBLEU 2.5.1):

| Conjunto | Direccion | n | BLEU | chrF | chrF++ | Baseline copia (chrF++) |
|---|---|---|---|---|---|---|
| SALT test | nyn→eng | 500 | 28,33 | 50,59 | 49,46 | 11,04 |
| SALT test | eng→nyn | 500 | 16,45 | 54,45 | 49,18 | 10,39 |
| SALT dev | nyn→eng | 500 | 28,03 | 51,02 | 49,79 | 11,53 |
| SALT dev | eng→nyn | 500 | 16,30 | 55,82 | 50,67 | 10,91 |

La baseline de copia (devolver la frase fuente sin cambios) muestra cuánto de la puntuación procede de palabras compartidas, nombres y números. Las puntuaciones de dev son ligeramente optimistas porque se usaron para seleccionar el checkpoint; test es la referencia principal. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable en un modelo especializado en traducción.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,4 GB para los pesos en float32, más overhead de activaciones y beam search; holgadamente por debajo de 2 GB en la práctica.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 sin problema. El modelo es lo bastante pequeño para ejecutarse en CPU con latencias aceptables.
- Cabe en cualquier GPU de consumo, incluidas integradas modernas, y en CPU.
- Opciones de despliegue: el script propio `kintu.py` con PyTorch y SentencePiece (no es compatible con `AutoModel` de `transformers`, por lo que no se carga directamente en vLLM, TGI ni Ollama sin adaptación).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| kintu_finetuned | 89M | 256 | nyn, en | MIT | Especializado, código autónomo |
| Sunbird/translate-nllb-1.3b-salt | 1,3B (aprox., segun nombre) | no disponible | multilingue (incluye nyn) | MIT (segun la model card) | Generó los datos de preentrenamiento de kintu; mayor tamaño |
| NLLB-200 (familia) | 600M–54B | 512 (tipico) | 200 idiomas | CC-BY-NC (variantes abiertas) | Referencia multilingüe; restricciones de uso comercial en algunas variantes |

La comparación directa de métricas entre estos modelos para el par nyn-en no está disponible en la información proporcionada. kintu_finetuned destaca por su tamaño reducido y licencia permisiva, a costa de un alcance limitado a un único par lingüístico y una ventana de contexto corta.

## Limitaciones y advertencias

- Los pares de preentrenamiento son salida de máquina y el ajuste fino se limita a SALT, por lo que el modelo puede rendir peor de lo que sugieren las puntuaciones en textos de otros dominios, dialectos, ortografías o con code-switching.
- Riesgo de pérdida o alteración de significado, especialmente en números, nombres y palabras poco frecuentes; no debe usarse en contenido médico, legal o de alto riesgo sin revisión humana.
- Modelo a nivel de frase: entradas de más de unas 128 piezas se truncan o degradan, y el contexto máximo es de 256 posiciones.
- Las salidas no han sido revisadas por hablantes nativos de runyankole.
- El lado runyankole del corpus de preentrenamiento es traducción automática, lo que puede propagar errores sistemáticos del traductor generador.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la calidad ni la idoneidad para producción.
- No es un modelo de `transformers`; requiere el código de inferencia incluido, lo que limita la integración con ecosistemas estándar de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/kintu_finetuned
- Modelo base: https://huggingface.co/amDANIEL2024/kintu_base
- Dataset tulati: https://huggingface.co/datasets/amDANIEL2024/tulati
- Traductor que generó los datos: https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
- Sitio del autor: https://domusdeiug.com
- Contacto: domusdeiug@gmail.com
