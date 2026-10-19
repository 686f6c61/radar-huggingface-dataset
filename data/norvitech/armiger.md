# NorviTech/armiger

## Resumen
Armiger es un clasificador ultraligero publicado por NorviTech en HuggingFace. Está pensado para etiquetar títulos de BitTorrent, DHT, Usenet y bibliotecas multimedia autoalojadas, así como árboles de ficheros internos, sin depender de expresiones regulares ni de un tokenizador. El artefacto principal es un modelo ONNX INT8 de 8,3 MB que ejecuta ocho cabezas de clasificación calibradas en una única pasada forward.

La arquitectura declarada es un transformer a nivel de byte con RoPE y un codificador de árbol de ficheros, entrenado con aprendizaje multitarea. El autor lo presenta como alternativa a parsers de reglas como GuessIt, PTT, RTN, PTN o Anitomy y a modelos de subtokens de 360M+ parámetros como MIMMO BERT, que requieren aproximadamente 1,4 GB de pesos. La propuesta es relevante por su coste computacional: 0,42 ms por lote y 2,44 ms por elemento en CPU, según la model card.

No se declara longitud de contexto, número de parámetros ni composición del dataset. Las métricas de precisión son declaradas por el autor y no constan validaciones independientes; el repositorio figura con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de byte con RoPE + codificador de árbol de ficheros; aprendizaje multitarea con 8 cabezas |
| Parámetros totales | no disponible; el artefacto INT8 declarado ocupa 8,3 MB |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 en ONNX para CPU; la variante Armiger Ultra incluye FP32 para GPU |
| Idiomas soportados | no disponibles; las etiquetas de las cabezas están en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`armiger.onnx`) + `calibration.json`; Armiger Ultra añade `swarm_adapter.pt` y scripts Python |
| Tarea | `text-classification` multitarea con 8 cabezas |
| Tamaño del artefacto principal | 8,3 MB (INT8) |
| Librería | ONNX |

## Arquitectura y entrenamiento
Armiger es un transformer a nivel de byte con embeddings posicionales rotatorios (RoPE) y un codificador de árbol de ficheros. No usa tokenizador: consume los bytes UTF-8 del título y la estructura interna de ficheros, y produce ocho cabezas de clasificación en una única pasada forward. Las cabezas cubren categoría (11 clases), adulto, anime, idioma de audio, idioma del título, subtítulos en inglés, junk y ámbito de propietario. El modelo se distribuye como ONNX INT8 y está pensado para inferencia en CPU.

No se documentan el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni el proceso exacto de anotación. Es un clasificador supervisado multitarea, no un modelo generativo. Como innovaciones, la model card destaca la ausencia de tokenizador, la lectura directa de árboles de ficheros, la calibración por cabeza y un ecosistema de plugins para calibración conforme, actualización DHT, reglas de catálogo sin pistas y guardias de audio/CSAM. La información sobre el plugin de sincronización DHT y CSAM está truncada, por lo que no se puede evaluar su alcance completo.

## Capacidades
- Clasificación multitarea en una sola pasada: 8 cabezas calibradas sobre títulos y árboles de ficheros.
- Categoría de contenido en 11 clases: `movie`, `tv_show`, `xxx`, `music`, `comic`, `game`, `audiobook`, `software`, `ebook`, `course`, `unknown`.
- Puerta de seguridad para contenido adulto: `non_adult` frente a `adult`.
- Detección de anime y enrutamiento de doblajes: `non_anime` frente a `anime`.
- Idioma de audio o release: `english`, `non_english`, `multi_or_unknown`.
- Idioma del título: `english_title` frente a `non_english_title`.
- Disponibilidad de subtítulos en inglés: `no_eng_subs`, `has_eng_subs`, `unknown`.
- Filtro de junk, malware, fake-codec y trampas de archivo: `clean` frente a `junk`.
- Política de catálogo: `allowed_type` frente a `excluded`.
- Entrada byte-level sin tokenizador, orientada a títulos y estructuras de ficheros.
- Ejecución en CPU con ONNX INT8; el autor declara 0,42 ms por lote y 2,44 ms por elemento.
- Plugins opcionales para vitalidad de enjambre, priors de release, catálogo sin pistas, guardia de audio, calibración DHT y sincronización DHT/CSAM.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-step, visión ni audio. No es un modelo generativo.

## Casos de uso
- Indexación en Bitmagnet: clasificar cada torrent entrante en las 11 categorías antes de persistirlo; con 0,42 ms por lote permite procesar colas grandes en CPU sin GPU.
- Automatización de bibliotecas multimedia autoalojadas: decidir si un lanzamiento es película o serie y enrutarlo a la biblioteca correcta; la cabeza película vs. serie declara 99,15 % de exactitud.
- Puerta de seguridad adulta: bloquear o etiquetar contenido adulto antes de exponerlo en catálogos familiares; la exactitud declarada es 98,71 %, con revisión humana para casos dudosos.
- Filtro de junk y malware: descartar fake codecs, trampas de archivo y releases maliciosos antes de descargar; la exactitud declarada es 99,90 %, y debe complementarse con antivirus.
- Enrutamiento de anime y doblajes: separar anime de no anime y usar el plugin audio-guard para resolver casos como `.en.`, `<Foreign>.ENG.Sub` o `MULTi (FR EN)`; la cabeza de anime declara 97,82 %.
- Gestión de idioma y subtítulos: decidir si un release tiene audio inglés o subtítulos ingleses; útil para políticas de idioma, con 98,17 % y 97,80 % declarados respectivamente.
- Política de catálogo: aplicar `owner_scope` para excluir tipos no permitidos; la exactitud declarada es 98,69 %.
- Procesamiento DHT/Usenet en tiempo real: clasificar metadatos y árboles de ficheros en un servicio ligero con ONNX Runtime, sin GPU.
- Detección de enjambres falsos con plugin: estimar vitalidad del enjambre y detectar fake seeders o honeypots; el plugin swarm-survival declara 96,83 % de AUROC y 100 % de recall en su trampa de malware.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no es generativo. Las métricas siguientes son de clasificación y están declaradas por el autor, sin validación independiente ni detalle de particiones de test.

| Ámbito | Métrica | Resultado declarado |
|---|---|---|
| Categoría, 11 clases | Exactitud Gold Standard | 97,92 % |
| Película vs. serie | Exactitud | 99,15 % |
| Puerta de adulto | Exactitud Gold Standard | 98,71 % |
| Anime y doblaje | Exactitud verificada con MediaInfo | 97,82 % |
| Idioma de audio | Exactitud Gold Standard | 98,17 % |
| Idioma del título | Exactitud | 98,68 % |
| Subtítulos en inglés | Exactitud | 97,80 % |
| Junk | Exactitud | 99,90 % |
| Junk | Sensibilidad/especificidad equilibradas | 98,8 % |
| Ámbito de propietario | Exactitud | 98,69 % |
| Plugin zero-cue | Película vs. serie | 99,46 % |
| Plugin zero-cue | 11 clases | 98,48 % |
| Plugin zero-cue | Casos límite duros | 98,93 % |
| Plugin audio-guard | Gold Standard | 98,72 % |
| Plugin audio-guard | Casos límite duros de audio | 99,88 % |
| Plugin swarm-survival | AUROC de vitalidad del enjambre | 96,83 % frente a 53,04 % de la señal bruta de seeders |
| Plugin swarm-survival | Recall de trampa de malware/fake seeder | 100,0 % |
| Plugin swarm-survival | Cambio de categoría de contenido | 0 % |
| Plugin calibration-dht | Exactitud equilibrada de junk con Mondrian | 99,95 % |

El autor afirma que Armiger iguala o supera a LLMs en la nube con aproximadamente 900 veces más velocidad y coste 0 USD, pero no se aportan modelos concretos, versiones ni metodología; no se recoge como resultado verificable.

## Requisitos de hardware
- VRAM estimada: no aplica para el artefacto principal; está diseñado para CPU con ONNX INT8. El fichero declarado pesa 8,3 MB.
- GPU recomendadas: no se requieren. Para GPU, el autor remite a Armiger Ultra, de 32,2 MB en FP32, pero no especifica A100, H100, RTX 4090 ni otros modelos.
- GPU de consumo: no necesita GPU; cabe en CPU. No se documenta una ruta GPU para este repositorio concreto.
- RAM: no se declara consumo de memoria del runtime ONNX; solo se indica el tamaño del artefacto.
- Despliegue: ONNX Runtime, integración en servicios de clasificación, Bitmagnet y automatización de bibliotecas. No aplican vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia: 0,42 ms por lote y 2,44 ms por elemento en CPU según el autor. No se declara throughput sostenido, latencia p99 ni consumo energético.

## Comparativa con modelos similares
La comparación se limita a los datos citados en la model card; no hay benchmarks independientes homogéneos.

| Modelo | Tipo | Parámetros o tamaño | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Armiger | Clasificador byte-level multitarea | no disponible; 8,3 MB INT8 | no disponible | 97,92 % en 11 clases; 99,15 % película vs. serie | Apache-2.0 | HuggingFace `NorviTech/armiger` |
| Armiger Ultra | Núcleo Armiger + adaptador de enjambre y GPU | no disponible; 32,2 MB FP32 | no disponible | Incluye swarm-survival con 96,83 % de AUROC | no disponible | HuggingFace `NorviTech/armiger-ultra` |
| MIMMO BERT | Modelo de subtokens | 360M+ parámetros; aproximadamente 1,4 GB | no disponible | no disponible | no disponible | no disponible |
| Parsers de reglas: GuessIt, PTT, RTN, PTN, Anitomy | Reglas y expresiones | no aplica | no aplica | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias
- Las métricas son autodeclaradas. No se aporta tamaño de muestra, partición de test, intervalos de confianza ni validación independiente.
- El repositorio figura con 0 descargas y 0 likes, y el tamaño del repo en HuggingFace aparece como 0.0 GB aunque la model card declara 8,3 MB. Conviene verificar los artefactos antes de usarlo en producción.
- No se documentan sesgos conocidos. Al trabajar con nombres de torrents y catálogos, puede heredar convenciones y sesgos de esos datos, por ejemplo hacia releases en inglés o hacia ciertos grupos de publicación.
- No es un modelo generativo: el riesgo principal es de clasificación errónea, no de alucinación textual.
- No se declara longitud máxima de contexto ni comportamiento con títulos muy largos, bytes no UTF-8 o árboles de ficheros anómalos.
- Los idiomas soportados no están declarados. Las cabezas de idioma solo distinguen inglés, no inglés y multi/desconocido; no hacen detección fina de idioma.
- Las cabezas de adulto y junk pueden producir falsos positivos y falsos negativos. No sustituyen moderación humana, antivirus, análisis de malware ni cumplimiento legal.
- La etiqueta junk no equivale a un escáner de seguridad; las trampas de archivo y los fake codecs pueden requerir análisis adicional.
- La licencia Apache-2.0 es permisiva, pero deben verificarse los avisos de licencia y las licencias de los plugins y dependencias.
- Los nombres de torrents cambian y pueden ser adversariales; la calibración y la actualización DHT ayudan, pero no garantizan robustez continua.
- La descripción del plugin `armiger-dht-db-sync` y de su guardia CSAM está truncada en la información disponible; no se puede evaluar su alcance completo.
- No hay datos de latencia p99, throughput sostenido ni coste energético en producción; las cifras de 0,42 ms y 2,44 ms son mediciones puntuales declaradas por el autor.

## Enlaces
- Modelo principal: https://huggingface.co/NorviTech/armiger
- Sitio del autor: https://norvitech.com
- Armiger Ultra: https://huggingface.co/NorviTech/armiger-ultra
- Plugin swarm-survival: https://huggingface.co/NorviTech/armiger-swarm-survival
- Plugin swarm-priors: https://huggingface.co/NorviTech/armiger-swarm-priors
- Plugin zero-cue-catalog: https://huggingface.co/NorviTech/armiger-zero-cue-catalog
- Plugin audio-guard: https://huggingface.co/NorviTech/armiger-audio-guard
- Plugin calibration-dht: https://huggingface.co/NorviTech/armiger-calibration-dht
- Plugin dht-db-sync: https://huggingface.co/NorviTech/armiger-dht-db-sync

No consta paper, demo ni repositorio de código independiente en la información proporcionada.
