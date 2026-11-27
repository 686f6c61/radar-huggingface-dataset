# amDANIEL2024/nkya_onnx

## Resumen

Nkya es un modelo de traducción automática neuronal desarrollado por el usuario amDANIEL2024, publicado en Hugging Face bajo licencia MIT. Se trata de un Transformer encoder-decoder de 242 millones de parámetros que traduce directamente entre cualquier par de seis lenguas: inglés, acholi, ateso, luganda, lugbara y runyankole, cubriendo 30 direcciones con un único modelo en una sola pasada, sin encadenar traducciones intermedias. La mayoría de estas lenguas son de bajos recursos, habladas en Uganda y regiones vecinas, y carecen de sistemas de traducción de calidad en herramientas comerciales.

Este repositorio concreto es la versión ONNX del modelo base `amDANIEL2024/nkya_finetuned` (revisión `630c158f`), empaquetada para ejecutarse con `onnxruntime` sin necesidad de PyTorch. Se ofrecen dos variantes: `int8` (0,31 GB, orientada a CPU) y `fp32` (0,97 GB, orientada a GPU y como referencia de calidad). El modelo se controla mediante una etiqueta de idioma destino con formato `<2xxx>`, de modo que el usuario indica el idioma de salida y el modelo realiza la traducción en una sola pasada.

La relevancia de Nkya radica en su cobertura multilingüe de bajos recursos con un único modelo, su licencia permisiva y su empaquetado ONNX ligero, que facilita el despliegue en entornos sin GPU o con recursos limitados. El modelo es de nivel de frase: los párrafos se dividen automáticamente en oraciones antes de la traducción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder |
| Parámetros totales | 242M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo a nivel de frase) |
| Tipos de cuantización | int8 y fp32 |
| Idiomas soportados | ach (acholi), eng (inglés), lgg (lugbara), lug (luganda), nyn (runyankole), teo (ateso) |
| Licencia | MIT |
| Formato de pesos | ONNX (variantes int8 y fp32) |

## Arquitectura y entrenamiento

Nkya es un Transformer encoder-decoder único de 242M de parámetros que traduce directamente entre las 30 direcciones posibles de los seis idiomas soportados. El control del idioma destino se realiza mediante una etiqueta `<2xxx>` insertada en la entrada, lo que permite que un solo conjunto de pesos cubra todas las direcciones sin modelos por par ni encadenamiento de traducciones. La decodificación utiliza búsqueda por haz (beam search) con un valor por defecto de `beam=4` y un tamaño de lote por defecto de `batch_size=16`.

El modelo se entrenó sobre el dataset `amDANIEL2024/tulati` y deriva del modelo `amDANIEL2024/nkya_finetuned`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La versión `int8` cuantiza los pesos del transformer a enteros de 8 bits, manteniendo las capas de embedding y la proyección de salida en mayor precisión; según el autor, ambas variantes obtienen puntuaciones equivalentes dentro del ruido en el conjunto de test SALT (diferencia media de +0,02 chrF++, rango de -0,32 a +0,23).

## Capacidades

- Traducción directa entre cualquier par de los seis idiomas soportados (30 direcciones) en una sola pasada, sin encadenar modelos intermedios.
- Selección del idioma destino mediante etiquetas `<2xxx>`, con aceptación de nombres completos, códigos de tres letras y códigos cortos.
- Traducción de frases individuales y de listas de frases (procesamiento por lotes).
- Segmentación automática de párrafos en oraciones, dado que el modelo opera a nivel de frase.
- Ejecución mediante `onnxruntime` sin dependencia de PyTorch.
- Interfaz de línea de comandos (`nkya.py`) con opciones de descarga anticipada, listado de idiomas y selección de tamaño (`int8`/`fp32`).
- Selección automática de tamaño (`size="auto"`): usa `fp32` cuando `onnxruntime-gpu` puede iniciar una sesión CUDA e `int8` en caso contrario.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Traducción humanitaria y de servicios públicos en Uganda: el modelo permite traducir comunicaciones entre inglés y lenguas locales como acholi, ateso, luganda, lugbara y runyankole, útil en contextos de salud, ayuda humanitaria o administración donde estas lenguas son predominantes y los traductores automáticos comerciales no las cubren.
- Atención al cliente multilingüe: integrado en un chatbot o sistema de tickets, Nkya puede traducir consultas de usuarios en lenguas locales al inglés para que un agente las entienda, y traducir la respuesta de vuelta, gracias a su cobertura de 30 direcciones con un único modelo.
- Localización de contenido digital: traducción de artículos, avisos o documentación entre inglés y las cinco lenguas ugandesas, dividiendo el texto en frases (el modelo es de nivel de frase) y procesando lotes con `batch_size` configurable.
- Despliegue en entornos sin GPU: la variante `int8` (0,31 GB) funciona en CPU con `onnxruntime` a 0,32 s por frase, lo que la hace adecuada para servidores modestos, dispositivos de borde o aplicaciones de escritorio que no disponen de aceleración por hardware.
- Investigación en traducción de bajos recursos: el modelo y sus resultados de evaluación por dirección (chrF++ y BLEU en el split de test SALT) sirven como referencia y línea base para experimentos con lenguas ugandesas.
- Traducción por lotes en pipelines de datos: la interfaz admite listas de frases y descarga anticipada del modelo (`--download`), lo que facilita su integración en procesos automatizados de traducción masiva de corpus.

## Benchmarks y rendimiento

Calidad medida con chrF++ sobre el split de test SALT (500 frases por dirección), beam 4, sacreBLEU 2.5.1 (firma `nrefs:1|case:mixed|eff:yes|nc:6|nw:2|space:no|version:2.5.1`). Filas = idioma origen, columnas = idioma destino. Se muestran los resultados de la variante `fp32`.

| from \ to | ach | eng | lgg | lug | nyn | teo |
|---|---|---|---|---|---|---|
| ach | – | 43,0 | 38,7 | 40,7 | 37,0 | 42,1 |
| eng | 40,8 | – | 45,6 | 53,0 | 46,5 | 50,8 |
| lgg | 35,5 | 46,7 | – | 42,6 | 37,7 | 42,9 |
| lug | 37,6 | 51,0 | 40,4 | – | 42,6 | 46,0 |
| nyn | 35,5 | 47,1 | 38,3 | 45,2 | – | 42,1 |
| teo | 35,4 | 46,1 | 38,4 | 43,3 | 38,4 | – |

Resultados de la variante `int8` (mismos parámetros de evaluación):

| from \ to | ach | eng | lgg | lug | nyn | teo |
|---|---|---|---|---|---|---|
| ach | – | 43,0 | 38,7 | 40,7 | 37,2 | 42,1 |
| eng | 40,8 | – | 45,6 | 53,2 | 46,5 | 50,6 |
| lgg | 35,1 | 46,9 | – | 42,8 | 37,8 | 43,1 |
| lug | 37,6 | 51,2 | 40,5 | – | 42,8 | 46,0 |
| nyn | 35,5 | 46,9 | 38,2 | 45,0 | – | 42,2 |
| teo | 35,5 | 46,0 | 38,3 | 43,4 | 38,5 | – |

Medias sobre las 30 direcciones (la fila "copy" corresponde a devolver la frase origen sin cambios):

| Tamaño | chrF++ | BLEU | Copy chrF++ |
|---|---|---|---|
| fp32 | 42,4 | 15,9 | 12,5 |
| int8 | 42,4 | 16,0 | 12,5 |

Direcciones más fuertes: eng → lug (53,0) y lug → eng (51,0). Direcciones más débiles: teo → ach (35,4), lgg → ach (35,5), nyn → ach (35,5) y ach → nyn (37,0).

## Requisitos de hardware

- VRAM estimada: no se especifica explícitamente; el tamaño del modelo es de 242M de parámetros, con descargas de 0,31 GB (`int8`) y 0,97 GB (`fp32`), lo que implica requisitos de memoria muy moderados.
- GPU recomendadas: no se indican modelos concretos; la variante `fp32` está pensada para GPU y requiere `onnxruntime-gpu` con sesión CUDA. Cualquier GPU con suficiente memoria para 0,97 GB de pesos debería ser viable.
- GPU de consumo: no se confirma explícitamente, pero por el tamaño del modelo (242M) y de los ficheros (menos de 1 GB) es razonable esperar que quepa en GPU de consumo; el autor no lo afirma en la información disponible.
- Despliegue: `onnxruntime` (CPU) y `onnxruntime-gpu` (CUDA). Se proporciona un script `nkya.py` para uso programático y por línea de comandos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: int8 en CPU 0,32 s por frase; fp32 en CUDA 0,11 s por frase; fp32 en CPU 0,61 s por frase. No se proporcionan datos de throughput más allá de estos valores por frase.

## Comparativa con modelos similares

El autor compara Nkya con el modelo comunitario Tulati (`amDANIEL2024/tulati_communitymodel_onnx`), que cubre las mismas lenguas mediante diez modelos por par detrás de una interfaz común. La comparación usa las mismas frases de test SALT y el mismo evaluador; una diferencia se considera clara cuando un bootstrap emparejado sobre chrF++ (1000 remuestreos) da p < 0,05.

| Aspecto | Nkya (este modelo) | Tulati (modelo comunitario) |
|---|---|---|
| Enfoque | Un único modelo, 30 direcciones directas | Diez modelos por par; algunas direcciones encadenan dos modelos |
| Parámetros | 242M | no disponible |
| Direcciones directas | 30 | 20 (las otras 10 se encadenan) |
| Calidad media (fp32) | 42,4 chrF++ | superior en 22 direcciones; Nkya mejor en 7; 1 sin diferencia clara |
| Cambio medio vs. Tulati | -1,5 chrF++ (global); -2,8 en direcciones directas de Tulati; +1,2 en direcciones encadenadas | referencia |
| Licencia | MIT | no disponible en la información proporcionada |

En la comparación `int8`, Nkya es mejor en 7 direcciones, el modelo comunitario en 22 y 1 no muestra diferencia clara; el cambio medio es de -1,4 chrF++, con -2,8 en las 20 direcciones donde el modelo comunitario tiene par directo y +1,2 en las 10 donde encadena dos modelos. Ejemplos por dirección (`int8`): ach → eng, Tulati 47,0 frente a Nkya 43,0 (cambio -4,0, p=0,001, gana el comunitario); ach → lgg, 41,0 frente a 38,7 (-2,3, p=0,001, gana el comunitario); ach → lug, 43,2 frente a 40,7 (-2,5, p=0,001, gana el comunitario).

## Limitaciones y advertencias

- Modelo de nivel de frase: los párrafos deben dividirse en oraciones; la calidad en textos largos depende de esa segmentación y de la coherencia entre frases.
- Calidad desigual por dirección: las peores direcciones (teo → ach, lgg → ach, nyn → ach, ach → nyn) rondan 35-37 chrF++, claramente por debajo de las mejores (eng → lug, 53,0).
- Rendimiento inferior al modelo comunitario Tulati en la mayoría de direcciones (22 de 30), con una pérdida media de 1,5 chrF++; solo supera a Tulati en 7 direcciones y en las 10 que Tulati resuelve encadenando dos modelos.
- Riesgo de alucinación y de traducciones incorrectas inherente a los modelos neuronales de traducción; no se documentan mecanismos de mitigación ni filtros de seguridad.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Idiomas: cobertura limitada a las seis lenguas indicadas; no se soportan otras lenguas ni se documenta el comportamiento fuera de dominio.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar las condiciones de los datos de entrenamiento (`amDANIEL2024/tulati`) para usos sensibles.
- No se documentan la longitud de contexto, el número de tokens de entrenamiento ni la composición del dataset, lo que limita la reproducibilidad y la evaluación de riesgos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/nkya_onnx
- Modelo base: https://huggingface.co/amDANIEL2024/nkya_finetuned
- Modelo comunitario Tulati (ONNX): https://huggingface.co/amDANIEL2024/tulati_communitymodel_onnx
- Dataset de entrenamiento: https://huggingface.co/datasets/amDANIEL2024/tulati
