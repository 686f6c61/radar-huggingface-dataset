# amDANIEL2024/shilla_finetuned

## Resumen

`shilla_finetuned` es un modelo de traducción automática neuronal especializado en el par lingüístico luganda–ateso, dos lenguas bantúes habladas en Uganda. Lo desarrolla el usuario amDANIEL2024 y se distribuye con licencia MIT. Se trata de un transformer encoder-decoder de 89 millones de parámetros que traduce de forma directa en ambas direcciones (luganda→ateso y ateso→luganda) sin pasar por el inglés como lengua pivote, una limitación habitual en los sistemas de traducción para lenguas de bajos recursos.

El modelo parte de `shilla_base`, un checkpoint preentrenado exclusivamente con pares generados por traducción automática, y se afina sobre los pares de traducción humana del conjunto de entrenamiento SALT. Esta combinación de preentrenamiento sintético masivo y ajuste con datos humanos es la aportación principal: permite obtener un sistema funcional cuando los corpus paralelos humanos son escasos.

Con 256 posiciones de contexto, un tokenizador SentencePiece compartido de 32.000 piezas y pesos en float32, el modelo está pensado para despliegues ligeros y para investigación en traducción de lenguas de bajos recursos. Su relevancia actual radica en que cubre un par lingüístico prácticamente desatendido por los sistemas comerciales y lo hace con una licencia permisiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 640, 8 cabezas, FFN 2560, activación GELU |
| Parámetros totales | 89.418.240 (89M); embeddings de entrada, de decoder y proyección de salida compartidos |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 posiciones (codificación posicional sinusoidal); los pares de entrenamiento se limitaron a 128 piezas por lado |
| Tipos de cuantización | no disponible (pesos publicados en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | luganda (lg) y ateso (teo) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (float32); tokenizador `spm.model` (SentencePiece unigram) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder estándar con normalización previa (pre-LN), seis capas en el encoder y seis en el decoder, dimensión de modelo de 640, ocho cabezas de atención y red feed-forward de 2560 con activación GELU. Los embeddings de entrada, los del decoder y la proyección de salida están atados, lo que reduce el recuento de parámetros a 89M. La dirección de traducción se controla mediante un token de prefijo en la fuente (`<2teo>` o `<2lug>`, donde la etiqueta indica la lengua destino). El tokenizador es un SentencePiece unigram compartido de 32.000 piezas, preserva mayúsculas y separa dígitos, y se entrenó únicamente con texto en luganda y ateso.

El entrenamiento se desarrolló en dos fases. La primera, correspondiente a `shilla_base`, consistió en 17.380 pasos de optimizador sobre los pares luganda–ateso del dataset `tulati` en ambas direcciones; en ese corpus toda columna no inglesa es una traducción automática de una columna inglesa generada por `Sunbird/translate-nllb-1.3b-salt`, de modo que ambos lados de cada par de preentrenamiento son salida de máquina. La segunda fase, que da lugar a este checkpoint, continuó el entrenamiento sobre los pares luganda–ateso de traducción humana del conjunto de entrenamiento SALT. No se documenta el uso de RLHF ni de DPO, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Traducción directa luganda→ateso y ateso→luganda con un único modelo, sin pivote por inglés.
- Selección de dirección mediante token de prefijo en la fuente (`<2teo>` / `<2lug>`).
- Traducción por lotes: la función `translate` acepta una cadena o una lista de cadenas.
- Decodificación por búsqueda de haz (beam search) configurable, con valor por defecto de 4.
- Manejo de mayúsculas y separación de dígitos gracias al tokenizador SentencePiece.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada estrictamente a los dos idiomas del par; no se documenta transferencia a otras lenguas.

## Casos de uso

- Traducción de documentación administrativa y comunitaria entre luganda y ateso: el modelo permite convertir avisos, formularios y materiales públicos de una lengua a otra sin depender de traductores humanos bilingües, escasos para este par.
- Preservación y difusión cultural: traducción de textos orales transcritos, cuentos y material educativo entre ambas lenguas, con revisión humana posterior dado el nivel de BLEU.
- Sistemas de atención ciudadana en Uganda: integración como servicio de traducción en portales o líneas de atención donde el ciudadano escribe en luganda y el agente responde en ateso (o viceversa), con contexto suficiente para frases y párrafos cortos.
- Investigación en traducción de lenguas de bajos recursos: el checkpoint sirve como línea base reproducible y como ejemplo de la estrategia preentrenamiento sintético + ajuste humano para comparar con otros enfoques.
- Generación de datos aumentados: producir traducciones preliminares luganda–ateso que luego se corrigen manualmente para ampliar corpus paralelos, aprovechando el bajo coste de inferencia de un modelo de 89M.
- Despliegue en entornos con recursos limitados: al caber en CPU y en GPUs de consumo, puede ejecutarse en servidores modestos u ordenadores locales para traducción puntual sin conexión.
- Traducción bidireccional en herramientas de edición: integración como plugin que permita alternar `lug2teo` y `teo2lug` sobre el texto seleccionado, con beam configurable para priorizar velocidad o calidad.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los conjuntos completos de SALT (500 frases cada uno), beam 4, sacreBLEU 2.5.1. El conjunto de test es la referencia principal; el de dev se usó para detener el entrenamiento y elegir el checkpoint, por lo que sus puntuaciones son ligeramente optimistas.

| Split | Dirección | Sistema | n | BLEU | chrF | chrF++ |
|---|---|---|---|---|---|---|
| test | lug→teo | modelo | 500 | 17,52 | 50,50 | 47,04 |
| test | lug→teo | baseline copia (fuente sin cambios) | 500 | 0,66 | 16,13 | 13,69 |
| test | teo→lug | modelo | 500 | 17,46 | 50,45 | 46,74 |
| test | teo→lug | baseline copia (fuente sin cambios) | 500 | 0,65 | 15,64 | 13,41 |
| dev | lug→teo | modelo | 500 | 18,40 | 51,64 | 48,14 |
| dev | lug→teo | baseline copia (fuente sin cambios) | 500 | 0,16 | 15,84 | 13,47 |
| dev | teo→lug | modelo | 500 | 16,70 | 50,44 | 46,43 |
| dev | teo→lug | baseline copia (fuente sin cambios) | 500 | 0,16 | 15,27 | 13,11 |

Firmas de las métricas: BLEU `nrefs:1|case:mixed|eff:no|tok:13a|smooth:exp|version:2.5.1`; chrF `nrefs:1|case:mixed|eff:yes|nc:6|nw:0|space:no|version:2.5.1`; chrF++ `nrefs:1|case:mixed|eff:yes|nc:6|nw:2|space:no|version:2.5.1`. No se ejecutó un baseline con pivote por inglés. El autor advierte que diferencias de 1 a 2 BLEU sobre unos cientos de frases están dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32, dado que el modelo tiene 89M de parámetros (unos 358 MB de pesos) más el estado del beam search y el tokenizador.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo usa la GPU si está disponible. Funciona en tarjetas de consumo como GTX 1650, RTX 3060 o superiores, y también en CPU.
- Cabe holgadamente en GPUs de consumo; no requiere A100 ni H100.
- Opciones de despliegue: al ser un modelo PyTorch personalizado y no un modelo `transformers`, `AutoModel` no puede cargarlo. El despliegue se realiza mediante el código incluido en el repositorio (`from shilla import Translator`), tras instalar `torch`, `sentencepiece`, `safetensors` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo y el beam de 4 se espera una latencia baja, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| shilla_finetuned | 89M | 256 | luganda, ateso | MIT | Traducción directa sin pivote; BLEU test ~17,5 en ambas direcciones |
| Sunbird/translate-nllb-1.3b-salt | 1.300M | no disponible | varias lenguas ugandesas (incluye luganda y ateso) | no disponible | Usado para generar el corpus sintético de preentrenamiento; mayor tamaño y presumiblemente mayor calidad, pero no se dispone de métricas comparables en esta información |
| shilla_base | 89M | 256 | luganda, ateso | MIT | Checkpoint previo, entrenado solo con pares de traducción automática; sin métricas publicadas en esta información |

No se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Calidad moderada: un BLEU de 17,5 en test indica traducciones útiles como borrador pero no aptas para publicación sin revisión humana; los ejemplos de la model card muestran errores léxicos y de estructura.
- El preentrenamiento se realizó íntegramente con pares generados por traducción automática, lo que puede propagar sesgos y errores del sistema NLLB empleado.
- Riesgo de alucinación y de traducciones plausibles pero incorrectas, especialmente en frases largas o con vocabulario poco frecuente.
- Contexto limitado a 256 posiciones y pares de entrenamiento de 128 piezas por lado; textos largos deben dividirse en segmentos.
- Solo cubre luganda y ateso; no se documenta ningún otro idioma.
- El modelo es PyTorch personalizado, no `transformers`: no es compatible con `AutoModel` ni con las herramientas estándar del ecosistema, lo que complica su integración en pipelines existentes.
- No se documentan variantes cuantizadas ni soporte para motores de inferencia de alto rendimiento.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la calidad ni sobre los datos subyacentes; conviene verificar las condiciones del dataset `tulati` y del corpus SALT para usos derivados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/shilla_finetuned
- Modelo base: https://huggingface.co/amDANIEL2024/shilla_base
- Dataset de preentrenamiento: https://huggingface.co/datasets/amDANIEL2024/tulati
- Sistema de traducción usado para generar el corpus sintético: https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
