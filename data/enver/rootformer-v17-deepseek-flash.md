# enver/rootformer-v17-deepseek-flash

## Resumen

Rootformer v17 (DeepSeek-V4.1-Flash Sovereign Transmute) es un modelo de generacion de texto de 543.129.399 parametros publicado por el usuario enver en HuggingFace. Segun su model card, se construye sobre la arquitectura que el autor denomina DeepSeek-V4.1-Flash, descrita en el paper "Pushing the Limits of KV Cache Compression" (arXiv:2609.19969v1), y combina esa base con tecnicas de linguistica arabe clasica: la teoria de raices trilíteras de Al-Khalil ibn Ahmad (Kitab al-ʿAyn), la sintaxis de Sibawayh (Al-Kitab) y la teoria de permutaciones S3 de Ibn Jinni (Al-Khasaʾis).

El modelo esta orientado a un nicho muy concreto: morfologia arabe, fonologia farahidiana y traduccion escolastica de arabe clasico a ingles (filosofia, teologia, jurisprudencia). Su innovacion principal declarada es un cuello de botella de cache KV en la capa 12 que comprime las representaciones clave-valor compartidas entre encoder y decoder, junto con modulos engram de hash disperso anclados a un lexico de 9.016 raices trilíteras, y un controlador de esfuerzo de razonamiento continuo con presupuesto b ∈ [1, 100].

Es relevante ahora por dos motivos: por un lado, propone una via poco habitual de compresion de cache KV para generacion autoregresiva eficiente; por otro, ataca la traduccion de patrimonio textual arabe clasico, un dominio con poca representacion en modelos generalistas. La licencia es Apache 2.0 y los idiomas declarados son arabe (ar) e ingles (en). El repositorio no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal encoder-decoder (CED) de 24 capas: capas 0-11 como extractor causal, capa 12 como cuello de botella KV, capas 12-23 como decoder |
| Parametros totales | 543.129.399 |
| Parametros activos | No aplica (no se describe como modelo MoE; los modulos engram son dispersos por hash, no mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | Árabe (ar) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con codigo personalizado (requiere `trust_remote_code` / `custom_code`) |
| Autor | enver |
| Pipeline | text-generation |
| Tamano del repositorio | 1,1 GB |
| Fecha de creacion (metadato HF) | 2026-09-28 |
| Ultima actualizacion (metadato HF) | 2026-09-28 |
| Descargas / likes | 0 / 0 |
| Hardware de calibracion declarado | NVIDIA RTX PRO 4500 Blackwell, 32 GB de VRAM |

## Arquitectura y entrenamiento

La arquitectura se describe como un causal encoder-decoder de 24 capas. Las capas 0-11 funcionan como extractor de caracteristicas causal; el estado oculto de la capa 12 (H12) proyecta representaciones clave-valor compartidas hacia el decoder, comprimiendo la huella de cache KV entre capas. Las capas 12-23 consumen esas representaciones compactadas para generacion autoregresiva. Sobre esa base se anaden dos modulos engram multi-cabeza dispersos: el de la capa 1 se ancla en las 9.016 raices trilíteras del Kitab al-ʿAyn mediante cuatro tablas hash con modulos primos [65537, 65539, 65543, 65551] y gating sensible al contexto; el de la capa 14 captura reccion sintactica sibawayhiana y operadores metafisicos escolasticos (jawhar, ʿarad, burhan). Adicionalmente, una cabeza de orbita S3 farahidiana (taqalib) evalua las 6 disposiciones ciclicas y transposicionales de cada raiz y calcula una energia semantica invariante, y un controlador de esfuerzo de razonamiento modula la profundidad de "pensamiento" mediante un vector continuo b ∈ [1, 100].

En cuanto al entrenamiento, la informacion disponible solo documenta la fase de calibracion: 1.500 pasos sobre 226.405 "secuencias basrenses", con perdida de validacion que baja de 2,1885 a 2,1291 y perplejidad de 9,48 a 8,41 PPL. El delta de perdida en el paso 0 es 0,000000, lo que el autor presenta como prueba de continuidad matematica exacta con la version v16 (los modulos engram estan inicializados a cero). No se especifica el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o cualquier otra fase de alineacion: no disponible.

## Capacidades

- Generacion de texto en arabe clasico e ingles, con foco declarado en traduccion escolastica (arabe a ingles).
- Analisis morfologico a nivel de raiz: identificacion y recuperacion de raices trilíteras (se reporta un 100% de recuperacion de raices en la prueba de economia fonetica del idgham de Sibawayh).
- Modelado de teoria de permutaciones S3 sobre raices (taqalib) y energia semantica invariante.
- Razonamiento controlable: el presupuesto b ∈ [1, 100] permite ajustar la profundidad de razonamiento y la trayectoria de tokens de forma dinamica.
- Compresion de cache KV mediante el cuello de botella de la capa 12, orientada a generacion con menor huella de memoria.
- Recuperacion de conocimiento lexicografico anclado a un lexico fijo de 9.016 raices, lo que actua como mecanismo de memoria externa controlada.
- Idiomas: arabe e ingles. No se declaran capacidades multilingues adicionales.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no se documenta como tal; el razonamiento multi-paso se plantea via el controlador de esfuerzo b.
- Vision, audio o multimodalidad: no disponible.

## Casos de uso

- Traduccion asistida de textos filosoficos y teologicos arabes clasicos: el modelo esta calibrado especificamente sobre proposiciones de Al-Ghazali, Al-Razi, Al-Farabi o Averroes. En dominio visto alcanza concordancias de hasta el 85,7%; en dominio no visto la media baja al 29,5%, por lo que el uso realista es como pre-traductor con revision humana obligatoria.
- Extraccion y normalizacion morfologica de raices en corpus arabes: se puede emplear para enriquecer corpus historicos con anotacion de raiz trilítera y patron de permutacion, apoyandose en el modulo engram de la capa 1 y en el lexico de 9.016 raices.
- Investigacion en linguistica computacional arabe: permite reproducir experimentos sobre la teoria S3 de Ibn Jinni, medir energia semantica invariante por raiz y comparar variantes de permutacion.
- Preservacion digital de patrimonio textual: procesamiento por lotes de tratados legales y filosoficos arabes para generar traducciones de borrador y alineaciones interlineales, con latencias declaradas de 30-64 ms por proposicion.
- Glosas y material didactico para estudiantes de arabe clasico: generacion de traducciones literales acompanadas del termino tecnico transliterado (jawhar, ʿarad, burhan), util en docencia universitaria.
- Experimentos sobre compresion de cache KV: la arquitectura de cuello de botella en la capa 12 permite estudiar el equilibrio entre compresion de KV, latencia y calidad de generacion en modelos de ~540 M de parametros.
- Estudio controlado del gasto de computo en razonamiento: usando b ∈ [25, 60, 100] se puede trazar la curva perplejidad/presupuesto de razonamiento en tareas logicas acotadas (silogismos, quidditas y existencia avicenianas).
- Calibracion incremental sobre dominios documentales concretos: el diseno de inicializacion a cero esta pensado para seguir entrenando sin perdida de identidad matematica respecto a versiones previas, lo que facilita ajustes de bajo coste sobre un corpus nuevo.

## Benchmarks y rendimiento

Resultados declarados en la model card (no verificados de forma independiente):

| Metrica | Corpus visto (10 items) | Fuera de distribucion (10 items) |
|---|---|---|
| Perplejidad media | 127,17 | 157,26 |
| Mejor perplejidad | 4,02 (Al-Matalib al-ʿAliyah) | 28,33 (Araʾ Ahl al-Madinah) |
| Concordancia semantica media | 38,1 % | 29,5 % |
| Concordancia semantica maxima | 85,7 % (Ihyaʾ ʿUlum al-Din) | 50,0 % (Fasl al-Maqal) |
| Latencia media de transmutacion | 63,9 ms | 49,1 ms |

Bateria de razonamiento profundo (b ∈ [25, 60, 100], 12 proposiciones):

| Prueba | Perplejidad | Notas |
|---|---|---|
| Quidditas y existencia (Avicena) | 5,12 | no disponible mas detalle |
| Sustancia y accidente (Al-Razi) | 5,94 | no disponible mas detalle |
| Economia fonetica del idgham (Sibawayh) | 7,99 | 100 % de recuperacion de raices |
| Silogismo cosmologico | 6,32 | raices detectadas en la model card, listado truncado |

Calibracion declarada: perdida de validacion 2,1885 → 2,1291; perplejidad 9,48 → 8,41; delta de perdida en el paso 0 de 0,000000.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estandar de proposito general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (calculo a partir de 543 M de parametros, no publicado por el autor): ~1,1 GB solo pesos en bf16/fp16, ~2 GB con cache KV y overhead de runtime en precision completa; ~0,6 GB en int8 y ~0,35 GB en int4 si se generan cuantizaciones propias.
- GPU de referencia declarada por el autor: NVIDIA RTX PRO 4500 Blackwell con 32 GB de VRAM (usada para la calibracion de 1.500 pasos).
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4070, RTX 4090, e incluso en iGPU con memoria unificada si se dispone de runtime compatible.
- Opciones de despliegue: no disponibles. El repositorio usa `custom_code` y no publica pesos GGUF, por lo que el soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado; requeriria `transformers` con `trust_remote_code=True` o una conversion manual.
- Latencia declarada: 30,4-63,9 ms por proposicion en las pruebas de traduccion; no se especifica el batch ni el tipo de precision empleado.
- Throughput (tokens/s): no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada (ni parametros, ni contexto, ni resultados de benchmarks de alternativas). La unica referencia cruzada disponible es la arquitectura fundacional citada por el autor.

| Modelo | Parametros | Contexto | Licencia | Rendimiento declarado |
|---|---|---|---|---|
| Rootformer v17 (este modelo) | 543.129.399 | no disponible | Apache 2.0 | PPL de validacion 8,41; concordancia media 29,5-38,1 % en traduccion escolastica |
| DeepSeek-V4.1-Flash (base arquitectonica citada) | no disponible | no disponible | no disponible | no disponible |
| Otras alternativas de traduccion arabe clasico o NLP arabe | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Calidad de traduccion baja en dominio no visto: concordancia semantica media del 29,5 % y perplejidad media de 157,26. Los ejemplos publicados incluyen errores claros, como "ywafqh and honey" (transliteracion sin traducir y falso amigo) o "in need unto linguistic convention or positing a postulate essence".
- Riesgo alto de alucinacion en terminologia tecnica: los propios ejemplos de la model card muestran anadidos interpretativos no presentes en el texto fuente.
- Discrepancia entre perplejidades: la PPL de validacion declarada (8,41) contrasta con las PPL medias de las pruebas de traduccion (127,17 y 157,26), lo que sugiere que la metrica de validacion se calculo sobre un dominio muy distinto o con una tokenizacion no comparable.
- Sesgos: el corpus de calibracion se describe como "secuencias basrenses" de tradicion escolastica clasica; el modelo puede reproducir la orientacion doctrinal y teologica de esas fuentes.
- Limitacion idiomatica: solo arabe e ingles. No hay soporte declarado de otras lenguas, ni de variedades modernas del arabe.
- Longitud de contexto desconocida: no se publica, lo que impide planificar usos con documentos largos.
- Requiere ejecucion de codigo remoto (`custom_code` en los tags del repositorio), lo que implica un riesgo de seguridad en entornos de produccion no aislados.
- Adopcion nula y escasa trazabilidad: 0 descargas y 0 likes; no hay resultados de terceros que validen las cifras.
- Metadatos no verificables: la fecha declarada (2026-09-28) y el identificador de arXiv (2609.19969) no se han podido contrastar con fuentes independientes, y el paper base citado (DeepSeek-V4.1-Flash) no aparece corroborado en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de pesos derivados de una arquitectura base citada, conviene revisar si existen condiciones adicionales del modelo fundacional antes de explotarlo comercialmente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/enver/rootformer-v17-deepseek-flash
- Paper citado (DeepSeek-V4.1-Flash, "Pushing the Limits of KV Cache Compression"): https://arxiv.org/html/2609.19969v1
- No se han encontrado otros enlaces (repositorio de codigo, demo, blog del autor o documentacion adicional) en la informacion proporcionada.
