# ks46/name-dreamer-fast

## Resumen

name-dreamer-fast (identificador en HuggingFace `ks46/name-dreamer-fast`) es un GPT byte-level de 28.564.992 parámetros entrenado por el usuario ks46 con un único objetivo: generar nombres de usuario sintéticos con aspecto real, del estilo de los que aparecen en registros de plataformas, foros, repositorios y videojuegos. No es un modelo de propósito general: es un generador de dominio muy estrecho, con vocabulario de 256 bytes (byte 0 actúa como token de parada) y sin tokenizador BPE, lo que evita cualquier problema de vocabulario abierto o de caracteres fuera de catálogo.

La arquitectura es un transformer decoder-only pequeño (4 capas, dimensión 768, 4 cabezas de atención, FFN SwiGLU de 2048) entrenado durante 30.000 iteraciones con secuencias de 512 bytes y batch de 128 sobre el corpus `ks46/usernames`, que reúne 90.505.453 nombres de usuario únicos procedentes de 18 fuentes públicas (Kaggle, Reddit, GH Archive, Stack Overflow, Wikipedia en inglés, Lichess, OpenStreetMap, Bluesky, Codeforces, Roblox, entre otras).

Su relevancia es acotada pero clara para quien trabaja con datos sintéticos: es un modelo de 28,5 M de parámetros que cabe en cualquier hardware, se ejecuta también en CPU mediante un kernel propio en Rust (`ndgen`, compilado para x86-64 con AVX2), y publica métricas de calidad reproductibles (3,6154 bits por carácter en held-out, 94,3 % de muestras novedosas y 0 % de generaciones sin terminar sobre 10.000 intentos). Es, en la práctica, una alternativa ligera y auditable a generar handles con plantillas o con un LLM grande, con licencia MIT y checkpoint fp32 abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only byte-level (GPT), 4 capas, dimension 768, 4 cabezas, FFN SwiGLU de 2048 |
| Parametros totales | 28.564.992 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 bytes (longitud de secuencia de entrenamiento); el autor no declara un limite de contexto de inferencia distinto |
| Tipos de cuantizacion | int8 simetrica por grupo (absmax, grupo 64) en `model.ndq`; checkpoints fake-quantized `quant-*.pt`; fp32 original. No se publican resultados de calidad de las variantes cuantizadas |
| Idiomas soportados | No disponible (modelo byte-level: procesa cualquier byte, pero el corpus de entrenamiento son nombres de usuario de fuentes mayoritariamente anglosajonas; no se declara cobertura idiomatica) |
| Licencia | MIT |
| Formato de pesos | `.pt` (checkpoint PyTorch: `model`, `optimizer`, `config`, `iter`), `.ndq` (int8 grupo 64 para kernel Rust), `quant-*.pt`, `golden.json`, `eval.json`, `manifest.json`, `samples.txt` |
| Tamano del repositorio | 0,4 GB |
| Libreria declarada | PyTorch |
| Pipeline | text-generation |
| Dataset de entrenamiento | `ks46/usernames` (90.505.453 nombres de usuario unicos, 18 fuentes publicas) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only estilo GPT con atención causal, 4 capas, ancho 768, 4 cabezas de atención y una capa feed-forward SwiGLU de 2048 unidades intermedias. La peculiaridad es la tokenización: no hay vocabulario aprendido, sino 256 tokens correspondientes a los 256 valores posibles de un byte, con el byte 0 reservado como token de parada. Esto permite modelar directamente cualquier cadena de bytes (nombres con guiones, dígitos, guiones bajos, mayúsculas mezcladas, caracteres no ASCII) sin caer en tokens desconocidos, a costa de secuencias más largas.

El entrenamiento consistió en 30.000 iteraciones con secuencias de 512 bytes y batch de 128, lo que supone aproximadamente 1,97 mil millones de bytes vistos durante el entrenamiento. El corpus `ks46/usernames` agrega 90.505.453 nombres únicos de 18 fuentes (Kaggle, Reddit, GH Archive, URLs, Stack Overflow, Stack, Bluesky, Codeforces, Hacker News, crates, Wikipedia en inglés, Lichess, OpenStreetMap, Xato, Stack Exchange, Roblox, SSA y `jeanphorn`). No se documenta en la model card el uso de RLHF, DPO ni ningún ajuste posterior por preferencias: el modelo es un preentrenamiento puro sobre el corpus de nombres.

La innovación técnica más destacable es el despliegue: además del checkpoint fp32, el autor publica `model.ndq`, un export int8 con cuantización simétrica por grupo (absmax, grupo 64) sobre cada peso 2D, y un binario `ndgen` escrito en Rust y compilado para x86-64 con AVX2 (`-C target-cpu=native` sobre un EPYC 7763). El propio autor indica que el binario debe recompilarse desde `rust/ndkernel` para otro host, ya que la compilación nativa puede no ser portable. Se incluye además `golden.json` con NLL de referencia en Python para 64 nombres de held-out, lo que permite verificar que el kernel Rust reproduce fielmente el comportamiento del modelo.

## Capacidades

- Generación de nombres de usuario sintéticos con estructura plausible: el autor muestra ejemplos como `SirDubbelington`, `arpan73777b-ctrl`, `corkogboundpulse`, `RADICAL_JNT`, `sopnil962-oss`, `Caseynorse7897`, `celerydancer`, `wmcken11` o `Chiz_T`.
- Muestreo condicionado por prefijo (`--prefix`, por ejemplo `dark`), lo que permite generar handles que empiecen por una cadena concreta.
- Filtro de novedad: el modo `--novel` permite comprobar contra un parquet de nombres si la muestra ya existe en el corpus, con un 94,3 % de muestras novedosas reportadas.
- Generación por lotes: la CLI del kernel Rust admite `--batch 64` y control de temperatura (`--temperature`).
- Terminación fiable: 0 de 10.000 generaciones quedaron sin terminar, gracias al uso del byte 0 como token de parada explícito.
- Modelado de bytes: capacidad de generar cualquier combinación de bytes, incluyendo dígitos, separadores (`-`, `_`), mayúsculas mezcladas y caracteres no ASCII.
- Ejecución en CPU: el kernel `ndgen` permite inferencia sin GPU en x86-64 con AVX2.
- No dispone de: tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio, matemáticas ni generación de código general. Es un modelo de dominio único.
- Capacidades multilingües: no declaradas ni evaluadas; el modelo puede emitir bytes de cualquier alfabeto, pero no hay garantía de calidad fuera de los patrones presentes en el corpus.

## Casos de uso

- Generación de datos sintéticos para pruebas de registro: permite poblar tablas de usuarios con handles realistas (mayúsculas mezcladas, dígitos, separadores) sin reutilizar datos personales reales, útil en entornos de staging y en pruebas de carga.
- Anonimización y sustitución de identificadores: en pipelines de publicación de datasets, se pueden reemplazar nombres de usuario reales por handles sintéticos novedosos (94,3 % ausentes del corpus) preservando la distribución estadística de los originales.
- Aumento de datos para clasificadores de detección de bots o de spam: el modelo genera handles etiquetados como sintéticos para entrenar o evaluar detectores que deben distinguir cuentas reales de generadas automáticamente.
- Fuzzing de validadores de formularios: alimentar el servicio de alta de usuarios con cadenas generadas byte a byte (longitudes extremas, caracteres raros, guiones consecutivos) para probar reglas de validación y saneamiento.
- Prototipado de interfaces y demos: rellenar maquetas, capturas de producto o documentación con nombres de usuario creíbles y reproducibles mediante semilla, sin depender de datos reales ni de un LLM grande.
- Generación de handles para juegos y comunidades: crear listas de nombres disponibles para reserva, NPCs, cuentas de prueba o bots de comunidad, con condicionamiento por prefijo para encajar con la nomenclatura de cada plataforma.
- Investigación en tokenización byte-level: al ser un modelo pequeño, entrenado y con métricas publicadas y kernel de referencia, sirve como banco de pruebas reproducible para estudiar cuantización int8 y decodificación byte a byte.
- Despliegue en edge o entornos sin GPU: con 28,5 M de parámetros y una versión int8 de aproximadamente 28,6 MB, puede ejecutarse en un servidor modesto o en un contenedor ligero usando el binario Rust en CPU.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica exclusivamente métricas de modelado y calidad de muestreo sobre el dominio objetivo:

| Metrica | Valor |
|---|---|
| Bits por caracter en held-out (1.413.605 nombres) | 3,6154 |
| Muestras validas | 100,0 % |
| Muestras unicas | 100,0 % |
| Muestras novedosas (ausentes del corpus) | 94,3 % |
| Generaciones sin terminar | 0 de 10.000 |

Bits por caracter en held-out por fuente (menor es mejor):

| Fuente | Bits/caracter |
|---|---|
| kaggle | 3,24 |
| jeanphorn | 3,41 |
| reddit | 3,49 |
| gharchive | 3,53 |
| urls | 3,59 |
| stack | 3,65 |
| bsky | 3,65 |
| codeforces | 3,66 |
| hn | 3,70 |
| crates | 3,71 |
| enwiki | 3,81 |
| lichess | 3,82 |
| osm | 3,98 |
| xato | 3,99 |
| se | 3,99 |
| so | 4,06 |
| roblox | 4,12 |
| ssa | 4,21 |

La tabla de variantes cuantizadas de la model card aparece sin resultados publicados (fila vacía), por lo que no es posible comparar la degradación de bits por caracter entre fp32, int8 y los checkpoints fake-quantized.

## Requisitos de hardware

- VRAM para inferencia: estimación a partir del número de parámetros (el autor no publica cifras). En fp32, los pesos ocupan aproximadamente 114 MB; en int8, alrededor de 28,6 MB. Añadiendo activaciones y caché KV para lotes pequeños (contexto de 512 bytes, 4 capas, 768 de dimensión), el consumo total se mantiene muy por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM disponible, incluidas GTX 1650, RTX 3050, RTX 4090, A100 o H100. El modelo está limitado por latencia y overhead de lanzamiento de kernels, no por memoria de cómputo.
- Cabe en GPU de consumo: sí, con enorme margen, en cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- CPU: el autor distribuye el binario `ndgen` compilado para x86-64 con AVX2 y `-C target-cpu=native` sobre un EPYC 7763, por lo que la inferencia en CPU es un escenario de uso previsto, pero conviene recompilar desde `rust/ndkernel` para otro procesador.
- Opciones de despliegue: PyTorch nativo cargando `ckpt.pt` o los `quant-*.pt`; kernel Rust `ndgen` con `model.ndq` para inferencia int8 en CPU. No hay soporte declarado de vLLM, TGI, llama.cpp, Ollama ni formatos GGUF; para usarlos habría que convertir pesos y probablemente implementar la arquitectura byte-level.
- Latencia y throughput: no disponibles. La única referencia operativa de la model card es la CLI `./ndgen gen --model model.ndq -n 1000 --batch 64`, que sugiere ejecución por lotes en CPU, sin cifras de tokens por segundo.

## Comparativa con modelos similares

No se proporcionan en la información disponible modelos comparables evaluados con las mismas métricas (bits por caracter sobre el corpus `ks46/usernames`). A modo de referencia de escala y encaje, se comparan características generales con un GPT-2 small y con la familia de modelos pequeños de generación de texto; los datos de rendimiento de esos modelos no son equiparables porque fueron evaluados en tareas distintas.

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Formatos | Rendimiento comparable |
|---|---|---|---|---|---|---|
| name-dreamer-fast | 28,56 M | 512 bytes | Byte-level (256 tokens, byte 0 = stop) | MIT | `.pt`, `.ndq` | 3,6154 bits/caracter en held-out (dominio nombres de usuario) |
| GPT-2 small (openai-community/gpt2) | 124 M | 1024 tokens | BPE (50.257 tokens) | MIT | safetensors, PyTorch, GGUF (terceros) | No disponible para esta tarea; evaluado en benchmarks de texto general |
| Modelos byte-level o char-level de escala similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

Las diferencias relevantes frente a un GPT-2 small son el tamaño (4,3 veces menor), el vocabulario (256 bytes frente a 50.257 tokens BPE) y el alcance (un único dominio frente a texto general). Frente a soluciones de generación por plantillas, la ventaja es la diversidad estructural de las muestras; frente a un LLM grande, la ventaja es el coste de despliegue.

## Limitaciones y advertencias

- Modelo de dominio único: no es un modelo de propósito general y no debe esperarse razonamiento, código, matemáticas ni conversación. Cualquier uso fuera de la generación de nombres de usuario producirá resultados sin valor.
- Sesgos del corpus: los nombres de usuario provienen de 18 fuentes públicas mayoritariamente técnicas y anglosajonas (GitHub, Stack Overflow, Hacker News, Reddit, Wikipedia en inglés). Es previsible que la distribución generada sobrerrepresente patrones de esos entornos (sufijos como `-dev`, `-ctrl`, `-oss`, dígitos de años) e infrarrepresente convenciones de otras comunidades e idiomas.
- Riesgo de reproducción de datos personales: aunque el autor reporta un 94,3 % de muestras novedosas, un 5,7 % de las generaciones puede coincidir con nombres reales del corpus. En usos de publicación o de anonimización conviene aplicar el filtro `--novel` contra el parquet y revisar las coincidencias.
- Riesgo de contenido inapropiado: al entrenarse con nombres de usuario reales, el modelo puede generar cadenas ofensivas, sexuales o de odio presentes en las fuentes. No se documenta ningún filtro de seguridad en la model card.
- Longitud de contexto: la ventana de entrenamiento es de 512 bytes y no se declara comportamiento fiable más allá de esa longitud. Para nombres de usuario es suficiente, pero limita cualquier otro uso.
- Idiomas: no se declara ni evalúa cobertura multilingüe; el rendimiento por fuente (de 3,24 bits/caracter en kaggle a 4,21 en ssa) muestra una variabilidad notable según la comunidad de origen.
- Cuantización sin validación publicada: la tabla de variantes cuantizadas de la model card está vacía, por lo que no hay datos de degradación de calidad para `model.ndq` ni para los `quant-*.pt`. Solo existe la verificación de NLL de referencia en `golden.json` para 64 nombres.
- Portabilidad del binario: `ndgen` se compiló con `-C target-cpu=native` en un EPYC 7763; puede fallar en procesadores sin AVX2 o con otras extensiones. Hay que recompilar desde `rust/ndkernel`.
- Adopción nula y proyecto experimental: 0 descargas y 0 likes en el momento de la consulta, sin paper ni documentación externa. No hay garantía de mantenimiento ni de soporte.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantías. No se identifican restricciones adicionales, pero conviene conservar el aviso de copyright y verificar la licencia de las 18 fuentes del corpus si se redistribuye el dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ks46/name-dreamer-fast
- Dataset de entrenamiento: https://huggingface.co/datasets/ks46/usernames
- Paper, blog o repositorio adicional: no disponible
- Demo o endpoint publico: no disponible
- La busqueda web realizada no devolvio enlaces relevantes: los resultados obtenidos correspondian a listados de telefonos moviles y no guardan relacion con el modelo.
