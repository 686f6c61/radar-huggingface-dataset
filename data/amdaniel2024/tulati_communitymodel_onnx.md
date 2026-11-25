# amDANIEL2024/tulati_communitymodel_onnx

## Resumen

Tulati es un modelo de traducción automática publicado en Hugging Face por el usuario amDANIEL2024, distribuido en formato ONNX y orientado a lenguas ugandesas de bajos recursos. Cubre seis idiomas: inglés (eng), acholi (ach), ateso (teo), luganda (lug), lugbara (lgg) y runyankole (nyn), e implementa la traducción entre cualquier par de ellos mediante un enrutador que selecciona modelos directos o cadenas de dos modelos a través de un idioma intermedio. El repositorio ocupa 4,7 GB e incluye los pesos en dos precisiones (int8 y fp32).

El modelo no es una única red neuronal monolítica, sino una colección de 10 modelos de traducción directa, cada uno entrenado para un par de idiomas concreto, gestionados por una capa de enrutamiento implementada en el script `tulati.py`. Los pares sin modelo directo se traducen encadenando dos modelos; el enrutador elige el idioma intermedio con mejor chrF++ en el conjunto de desarrollo de SALT. El tamaño de cada modelo individual es de aproximadamente 111 MB en int8 y 358 MB en fp32, lo que lo hace apto para despliegue en CPU y en GPU de consumo.

La relevancia del proyecto radica en su enfoque en lenguas de bajos recursos del este de África, con licencia MIT y una API sencilla de Python y línea de comandos. Está pensado como modelo comunitario, con evaluación publicada sobre el corpus SALT y métricas chrF++ por dirección de traducción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (encoder-decoder) por par de idiomas; 10 modelos directos + enrutador de cadenas |
| Parámetros totales | no disponible (no se indica el número de parámetros por modelo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (los modelos operan a nivel de frase; los párrafos se segmentan automáticamente) |
| Tipos de cuantización | int8 y fp32 |
| Idiomas soportados | ach (acholi), en/eng (inglés), lgg (lugbara), lg/lug (luganda), nyn (runyankole), teo (ateso) |
| Licencia | MIT |
| Formato de pesos | ONNX (ejecutable con onnxruntime / onnxruntime-gpu) |

## Arquitectura y entrenamiento

La arquitectura se compone de 10 modelos de traducción directa, cada uno entrenado para un par de idiomas específico, presumiblemente con arquitectura transformer encoder-decoder y tokenización SentencePiece (la dependencia `sentencepiece` aparece en las instrucciones de instalación). No se detalla en la información disponible el número de capas, dimensión oculta, cabezas de atención ni el número de parámetros de cada modelo. Los modelos operan a nivel de frase; el script divide los párrafos en frases automáticamente antes de traducir.

El sistema de enrutamiento es la innovación técnica principal: para los pares sin modelo directo, se encadenan dos modelos a través de un idioma intermedio. La selección del intermedio se realizó evaluando todas las rutas de igual longitud sobre el conjunto de desarrollo de SALT y eligiendo la de mayor chrF++. No se especifican en la información proporcionada los volúmenes de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o DPO. La cuantización int8 se aplica solo a los pesos del transformer, manteniendo embeddings y proyección de salida en mayor precisión; un par solo se distribuye en int8 si supera un control de calidad sobre SALT dev.

## Capacidades

- Traducción directa entre 20 direcciones con modelo propio (ver tabla de pares directos en la model card).
- Traducción encadenada entre las 10 direcciones restantes mediante un idioma intermedio seleccionado por rendimiento en dev.
- Traducción entre cualquier par de los seis idiomas soportados a través de la API `translate(text, source, target)`.
- Acepta nombres de idioma, códigos ISO y códigos cortos (`Luganda`, `lug`, `lg`).
- Segmentación automática de párrafos en frases.
- Modo `return_steps=True` que devuelve el texto tras cada modelo de la cadena, útil para depuración.
- Función `route(source, target)` para inspeccionar la ruta de idiomas intermedios.
- Descarga selectiva de los ficheros necesarios por petición; opción `--download-all` para uso offline.
- Control de memoria mediante `max_loaded` para limitar el número de modelos cargados simultáneamente.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Traducción de documentación y materiales comunitarios entre inglés y lenguas ugandesas: el modelo permite convertir guías, formularios o avisos del inglés a luganda, acholi, ateso, lugbara o runyankole, con la ventaja de que la licencia MIT facilita su integración en plataformas de ONG y administraciones locales.
- Atención al ciudadano multilingüe: un servicio de chat puede enrutar consultas en luganda o runyankole hacia inglés y devolver la respuesta en el idioma del usuario, usando el modo int8 sobre CPU para reducir costes de infraestructura.
- Localización de aplicaciones móviles: la API de Python y la CLI permiten integrar la traducción en pipelines de localización que procesan ficheros de cadenas, con segmentación automática de frases y descarga selectiva de solo los pares necesarios.
- Investigación en traducción de bajos recursos: el repositorio incluye evaluaciones por dirección en `eval/` y permite reproducir los experimentos de enrutamiento entre idiomas intermedios, útil para estudiar el impacto de las cadenas de traducción en chrF++.
- Despliegue en entornos con hardware limitado: la variante int8 (111 MB por modelo, 1,11 GB el conjunto completo) cabe en portátiles y servidores sin GPU, lo que facilita su uso en escuelas u oficinas con conectividad y equipos modestos.
- Transcripción y traducción de contenido periodístico regional: un medio que publica en inglés puede generar versiones en luganda o ateso para ampliar audiencia, encadenando modelos cuando no exista par directo y eligiendo la ruta con mejor calidad en dev.
- Procesamiento por lotes offline: la opción `--download-all --size int8` permite preparar un entorno sin red para traducir grandes volúmenes de frases en campo o en instalaciones con conectividad intermitente.

## Benchmarks y rendimiento

Los resultados publicados corresponden a chrF++ sobre el split de test de SALT, con beam 4, conjuntos completos y sacreBLEU 2.5.1 (firma `nrefs:1|case:mixed|eff:yes|nc:6|nw:2|space:no|version:2.5.1`). La † indica par encadenado.

**int8**

| from \ to | ach | eng | lgg | lug | nyn | teo |
|---|---|---|---|---|---|---|
| ach | – | 47,0 | 41,0 | 43,2† | 39,5 | 40,5† |
| eng | 44,2 | – | 42,0† | 57,0 | 49,3 | 48,8† |
| lgg | 38,6 | 42,2† | – | 42,5† | 40,3 | 45,7 |
| lug | 39,3† | 55,1 | 39,5† | – | 45,3 | 46,9 |
| nyn | 37,0 | 49,2 | 40,2 | 49,0 | – | 43,9 |
| teo | 34,2† | 44,2† | 41,8 | 46,7 | 40,7 | – |

**fp32**

| from \ to | ach | eng | lgg | lug | nyn | teo |
|---|---|---|---|---|---|---|
| ach | – | 46,9 | 40,9 | 43,0† | 39,4 | 40,1† |
| eng | 44,4 | – | 42,1† | 57,1 | 49,2 | 48,6† |
| lgg | 38,6 | 42,4† | – | 42,7† | 40,3 | 45,5 |
| lug | 39,3† | 55,3 | 39,5† | – | 45,4 | 47,1 |
| nyn | 37,3 | 49,4 | 40,0 | 48,9 | 43,9 | – |
| teo | 34,2† | 44,3† | 41,5 | 46,9 | 40,6 | – |

Medias por dirección (la columna «copy» es la puntuación de devolver la frase fuente sin cambios):

| Tamaño | Direcciones | Número | chrF++ medio | chrF++ medio copy |
|---|---|---|---|---|
| int8 | directas | 20 | 44,9 | 12,8 |
| int8 | encadenadas | 10 | 41,7 | 11,8 |
| fp32 | directas | 20 | 44,9 | 12,8 |
| fp32 | encadenadas | 10 | 41,6 | 11,8 |

Rutas por defecto para pares encadenados (chrF++ en dev):

| Par | Ruta por defecto | Rutas alternativas de igual longitud |
|---|---|---|
| ach → lug | ach → eng → lug (44,3) | ach → nyn → lug (42,5) |
| ach → teo | ach → lgg → teo (42,4) | ach → nyn → teo (41,3) |
| eng → lgg | eng → ach → lgg (43,6) | eng → nyn → lgg (43,2) |
| eng → teo | eng → lug → teo (50,2) | eng → nyn → teo (49,4) |
| lgg → eng | lgg → nyn → eng (42,5) | lgg → ach → eng (42,1) |
| lgg → lug | lgg → nyn → lug (42,2) | lgg → teo → lug (40,8) |
| lug → ach | lug → eng → ach (40,6) | lug → nyn → ach (38,5) |
| lug → lgg | lug → nyn → lgg (39,9) | lug → teo → lgg (39,0) |
| teo → ach | teo → nyn → ach (36,4) | teo → lgg → ach (36,3) |
| teo → eng | teo → lug → eng (45,2) | teo → nyn → eng (44,4) |

## Requisitos de hardware

- VRAM estimada: no se publican cifras de VRAM. Como referencia de tamaño, cada modelo individual ocupa 111 MB en int8 y 358 MB en fp32; el conjunto completo ocupa 1,11 GB (int8) y 3,58 GB (fp32).
- GPU recomendadas: la model card indica usar fp32 en GPU, sin especificar modelos concretos. Cualquier GPU con suficiente memoria para cargar los modelos activos (con `max_loaded` limitado a 2, el consumo de pesos es de aproximadamente 716 MB en fp32) debería ser suficiente; no se confirma compatibilidad con modelos concretos como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño por modelo, aunque no se documenta oficialmente.
- Opciones de despliegue: onnxruntime (CPU) y onnxruntime-gpu (GPU), a través del script `tulati.py` incluido en el repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de traducción para lenguas ugandesas (por ejemplo, modelos NLLB o M2M100 adaptados a estos idiomas), ni de sus métricas en SALT, por lo que no es posible establecer una comparativa rigurosa. Los datos de la model card solo permiten comparar Tulati consigo mismo (int8 frente a fp32 y rutas directas frente a encadenadas).

| Modelo | Idiomas | Contexto | chrF++ en SALT | Licencia | Formato |
|---|---|---|---|---|---|
| Tulati | 6 (ach, en, lgg, lug, nyn, teo) | no disponible | 44,9 medio (directas), 41,7 (encadenadas) | MIT | ONNX |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo comunitario con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Traducción a nivel de frase: los párrafos se segmentan automáticamente, lo que puede perder coherencia discursiva entre frases.
- Los pares encadenados acumulan errores: la media chrF++ cae de 44,9 (directas) a 41,7 (encadenadas) en int8.
- La salida en int8 puede variar ligeramente según qué frases compartan lote.
- No se documentan sesgos conocidos, pero al tratarse de un modelo entrenado sobre un corpus específico (SALT) puede reflejar los sesgos y dominios de dicho corpus.
- Riesgo de alucinación no cuantificado; no se publican análisis de fidelidad más allá de chrF++.
- Cobertura limitada a seis idiomas; no se soportan otros idiomas ugandesas ni variantes dialectales no incluidas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se especifican requisitos de atribución más allá de los habituales de la licencia MIT.
- El repositorio se creó y actualizó en noviembre de 2026 según los metadatos, fecha que conviene verificar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/tulati_communitymodel_onnx
- Script de inferencia: `tulati.py` dentro del repositorio de Hugging Face
- Evaluaciones por dirección y por frase: carpeta `eval/` del repositorio
- Corpus SALT: no se proporciona enlace en la información disponible
- Paper, blog o demo: no disponibles en la información proporcionada
