# mohsenvand/mindview-t2i

## Resumen

mindview-t2i es un modelo de texto a imagen publicado por el usuario mohsenvand que empaqueta un pipeline completo de difusión en un único archivo GGUF de 957,5 MB (1,9 GB de repositorio, con los pesos contabilizados en safetensors en 4.508.016.172 parámetros). El modelo recibe un prompt de texto y genera una imagen de 512 × 512 píxeles en cuatro pasos de muestreo. Su rasgo diferencial es la compresión extrema: todos los pesos salvo unos 21 millones son ternarios (−1, 0, +1), lo que da una media de 1,7 bits por peso contando todas las partes.

El sistema no es un transformer monolítico, sino un ensamblaje de cuatro piezas: un lector (las 9 primeras capas de 28 de Ternary Bonsai 1.7B, de arquitectura Qwen3), un mapa lineal de condicionamiento entrenado específicamente para este modelo, el transformer de difusión de Bonsai Image 4B (que es FLUX.2 [klein] 4B con pesos ternarios) y el decodificador TAEF2. La innovación principal es el mapa de condicionamiento, ajustado por regresión ridge sobre 1.500 prompts para imitar las representaciones del codificador de texto original Qwen3-4B, lo que permite sustituir un codificador de 4B por un lector ternario de 764 M.

Su relevancia práctica reside en la ejecución: el archivo se carga mediante peticiones por rango en un runtime WebGPU/WGSL escrito en TypeScript, de modo que la inferencia ocurre íntegramente en el navegador, sin servidor, y el navegador cachea lo descargado. Es, por tanto, un caso de estudio de despliegue de difusión ternaria en cliente, más que un modelo orientado a producción de alta fidelidad: pinta solo a 512 × 512 y con un calendario de 4 pasos precomputado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblaje híbrido: lector transformer denso tipo Qwen3 (ternario, 9 de 28 capas) + mapa lineal de condicionamiento + transformer de difusión (DiT, estilo FLUX.2 [klein]) + decodificador TAEF2 |
| Parametros totales | 4.508.016.172 (dato de safetensors); desglose declarado: 764 M lector + 18,9 M adaptador + 3.682 M pintor + 1,3 M decodificador |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria nativa (−1, 0, +1) con escalas f16 cada 128 entradas de cada fila para el lector y el pintor; f16 para el adaptador y el decodificador. Tipos de tensor GGUF propios: 200 (trits, 5 pesos por byte), 202 (deflate), 203 (planos f16), 204 (JSON del tokenizador) |
| Idiomas soportados | No disponible (el prompt se procesa con el tokenizador de Ternary Bonsai 1.7B) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 con arquitectura propia `mindview-t2i` (no compatible con llama.cpp ni con otras herramientas GGUF estándar); repo con pesos contabilizados en safetensors |
| Resolucion de salida | 512 × 512 píxeles |
| Pasos de muestreo | 4 (modulación precomputada para ese calendario) |
| Tamano del archivo | 957,5 MB (1,9 GB de repositorio) |
| Bits por peso | 1,7 de media (todas las partes incluidas) |
| Modelos base | prism-ml/bonsai-image-ternary-4B-unpacked, prism-ml/Ternary-Bonsai-1.7B-gguf, madebyollin/taef2 |
| Autor | mohsenvand |
| Fecha de creacion | 26 de septiembre de 2026 |

## Arquitectura y entrenamiento

El pipeline se compone de cuatro bloques con orígenes distintos. El lector es Ternary Bonsai 1.7B, un transformer Qwen3 con pesos ternarios al que se le han conservado únicamente las 9 primeras capas de 28, junto con su tokenizador (158,4 MB). El bloque `cond` es un mapa lineal de 6.144 → 3.072 (18,9 M en f16, 35,3 MB) que proyecta los estados del lector en las capas 3, 6 y 9 hacia el flujo de texto del pintor. El pintor es el transformer de difusión de Bonsai Image 4B, es decir, FLUX.2 [klein] 4B con pesos ternarios, con la modulación de su calendario de 4 pasos precomputada (3.682 M, 761,3 MB). El decodificador es TAEF2, que convierte el latente en píxeles (1,3 M en f16, 2,5 MB).

La aportación técnica propia es el mapa de condicionamiento. Bonsai Image 4B condiciona su transformer con el codificador de texto de FLUX.2 [klein] 4B, Qwen3-4B, usando los estados de las capas 9, 18 y 27 a través del `context embedder` del transformer. En mindview-t2i un lector mucho menor sustituye a Qwen3-4B: el adaptador y el `context embedder` se fusionan en una única matriz, ajustada por regresión ridge sobre 1.500 prompts para reproducir la salida del codificador original, y evaluada en el espacio de entrada del transformer (después del `context embedder`). Un barrido sobre qué capas del lector muestrear (7/14/21, 6/12/18, 5/10/15, 7/11/15, 4/8/12, 6/9/12 y 3/6/9) mostró que las capas superficiales rinden casi igual que las profundas, lo que determina el tamaño final del archivo: cada capa que el mapa no lee es una capa que el archivo no transporta. El mapa incluido es la versión en coma flotante con muestreo en 3, 6 y 9, reajustada sobre los 1.500 prompts completos, con un coseno de 0,959 en el conjunto reservado; una versión ternaria del mapa ahorraría 31 MB adicionales con un coseno de 0,938. No se documentan datos de entrenamiento de los componentes base (número de tokens, composición del dataset, RLHF o DPO) más allá de este ajuste.

## Capacidades

- Generación de imágenes a partir de texto en formato 512 × 512 con 4 pasos de difusión.
- Comprensión de prompts mediante un lector de lenguaje ternario (Qwen3 1.7B recortado a 9 capas), suficiente para composiciones simples: el autor señala que en las ocho peticiones de ejemplo el modelo "cuenta la pera" y escribe "OPEN" donde el pipeline anterior fallaba.
- Ejecución en navegador sobre WebGPU y WGSL, sin servidor, con carga por peticiones de rango y caché del navegador.
- Empaquetado monolítico: tokenizador, mapa de condicionamiento, transformer de difusión y decodificador en un solo archivo GGUF v3 de 957,5 MB.
- Inferencia con pesos ternarios y escalas por fila, con un coste de 1,7 bits por peso.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento. Es un modelo estrictamente de texto a imagen, sin entrada de imagen.

## Casos de uso

- Demostraciones de difusión en el navegador: el archivo se sirve desde HuggingFace y el runtime de mindview lo consume por rangos, de modo que una página web puede ofrecer generación de imágenes sin backend ni GPU en servidor. Es el escenario para el que fue diseñado explícitamente.
- Instalaciones artísticas y visualización de computación: el propio modelo nace de mindview, una instalación que muestra a estos modelos calculando; encaja en piezas donde interesa hacer visible el proceso de inferencia ternaria.
- Prototipado rápido de interfaces de texto a imagen: con 957,5 MB y cuatro pasos de muestreo, permite iterar sobre la experiencia de usuario (formularios, plantillas de prompt, previsualizaciones) sin aprovisionar infraestructura de GPU.
- Aplicaciones de escritorio o electrónica de consumo con recursos limitados: al ocupar menos de 1 GB en disco y operar con pesos ternarios, es candidato para entornos donde el espacio y el ancho de banda son la restricción principal.
- Educación y experimentación con cuantización ternaria: el archivo documenta tipos de tensor propios (trits a 5 pesos por byte, planos f16, deflate) y sirve como material de estudio sobre empaquetado de pesos y ajuste de adaptadores entre modelos de distinto tamaño.
- Investigación sobre sustitución de codificadores de texto: el mapa ajustado por regresión ridge sobre 1.500 prompts, con la tabla de cosenos por capas muestreadas, es un ejemplo reproducible de cómo reemplazar un codificador de 4B por uno de 1,7B recortado manteniendo (0,959 de coseno) el espacio de condicionamiento.
- Generación de recursos gráficos de baja resolución en flujos internos, como miniaturas, bocetos o marcadores de posición, donde la resolución objetivo sea 512 × 512 y no se requiera fidelidad fotográfica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K, FID, CLIP score ni comparativas de calidad de imagen). La única medición cuantitativa documentada es la similitud coseno por token entre el condicionamiento del lector y el del codificador de texto original de FLUX.2 [klein] 4B, evaluada en el espacio de entrada del transformer.

| Capas del lector muestreadas | Capas transportadas | Float, validacion | Float, reservado | Ternario, reservado |
|---|---|---|---|---|
| 7, 14, 21 | 21 | 0,939 | 0,961 | 0,940 |
| 6, 12, 18 | 18 | 0,938 | 0,960 | 0,938 |
| 5, 10, 15 | 15 | 0,937 | 0,959 | 0,939 |
| 7, 11, 15 | 15 | 0,936 | 0,957 | 0,935 |
| 4, 8, 12 | 12 | 0,937 | 0,959 | 0,939 |
| 6, 9, 12 | 12 | 0,936 | 0,958 | 0,934 |
| 3, 6, 9 (configuracion incluida) | 9 | 0,937 | 0,958 | 0,936 |

El conjunto de validación son 150 prompts reservados del ajuste y el conjunto "reservado" son 12 prompts adicionales; cada mapa se ajustó sobre los 1.350 prompts restantes. El mapa incluido en el archivo es la versión en coma flotante para los muestreos 3, 6 y 9, reajustada sobre los 1.500 prompts, con un coseno de 0,959 en el conjunto reservado. El adaptador ternario anterior del sitio de mindview (muestreos 7, 14 y 21) obtenía 0,952. El autor advierte explícitamente que ocho prompts de ejemplo no constituyen un benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay cifras publicadas. A partir del tamaño almacenado de cada parte (158,4 MB lector + 35,3 MB adaptador + 761,3 MB pintor + 2,5 MB decodificador = 957,5 MB), los pesos ocupan en torno a 1 GB; hay que sumar estados intermedios, latentes y buffers de atención en WebGPU, por lo que un presupuesto prudente de memoria del orden de 2 a 3 GB es una estimación razonable, no un dato medido.
- GPU recomendadas: no disponibles. El único requisito documentado es soporte de WebGPU, lo que incluye GPU de escritorio y portátiles recientes, y potencialmente GPU integradas compatibles; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, con alta probabilidad, dado que el archivo completo pesa menos de 1 GB y el pipeline está pensado para ejecutarse en el navegador. No se detalla una lista de GPU verificadas.
- Opciones de despliegue: el runtime propio de mindview (WebGPU y WGSL, TypeScript), con los módulos `src/lib/runtime/packed.ts`, `bonsai-llm.ts` y `painter.ts`, y la demo en neovand.github.io/mindview/paint. No es compatible con vLLM, llama.cpp, Ollama ni TGI: la arquitectura declarada es `mindview-t2i` y cuatro de sus tipos de tensor son nuevos, por lo que las herramientas GGUF estándar no pueden ejecutarlo tal cual.
- Latencia y throughput: no disponibles. Se sabe que el muestreo es de 4 pasos para 512 × 512 y que el archivo se carga por peticiones de rango, de modo que no reside completo en memoria en ningún momento.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion y pasos | Cuantizacion | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| mindview-t2i | 4.508.016.172 (764 M lector + 18,9 M adaptador + 3.682 M pintor + 1,3 M decodificador) | 512 × 512, 4 pasos | Ternaria con escalas f16; 1,7 bits por peso | Apache 2.0 | GGUF v3 propio de 957,5 MB, ejecutable en WebGPU mediante runtime propio |
| Bonsai Image 4B (prism-ml/bonsai-image-ternary-4B-unpacked) | ~4 B (3.682 M en el transformer) | No disponible | Ternaria | No disponible | Pesos sin empaquetar; es la fuente del bloque pintor |
| Ternary Bonsai 1.7B (prism-ml/Ternary-Bonsai-1.7B-gguf) | 1,7 B (764 M en las 9 capas usadas) | No aplica (modelo de lenguaje) | Ternaria | No disponible | GGUF; es la fuente del bloque lector |
| FLUX.2 [klein] 4B | 4 B | No disponible | Precisión completa (el modelo original) | No disponible | Es el modelo del que deriva el transformer de difusión |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada, por lo que la comparación se limita a arquitectura, tamaño, licencia y formato.

## Limitaciones y advertencias

- Resolucion fija: solo pinta 512 × 512 y solo con un calendario de 4 pasos, porque la modulación de ese calendario está precomputada en el archivo. La sección "Limits" de la model card está truncada en la información disponible.
- Sin validacion comunitaria ni benchmarks: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay FID, CLIP score ni ninguna métrica de calidad de imagen publicada.
- Coseno no equivale a calidad: la única métrica medida (0,959 en el conjunto reservado) evalúa la fidelidad del condicionamiento en el espacio de entrada del transformer, no la calidad perceptual de las imágenes. El propio autor señala que ocho prompts no constituyen un benchmark.
- Lector recortado: conservar solo 9 de 28 capas limita la comprensión de prompts largos, matizados o con composiciones complejas, así como el seguimiento de instrucciones detalladas.
- Idiomas no documentados: no se declaran idiomas soportados. El tokenizador procede de Ternary Bonsai 1.7B (linaje Qwen3), pero no hay evaluación multilingüe, por lo que el rendimiento fuera del inglés es incierto.
- Incompatibilidad de herramientas: la arquitectura `mindview-t2i` y los tipos de tensor 200, 202, 203 y 204 impiden usar llama.cpp, vLLM, Ollama o TGI sin escribir un runtime específico.
- Cadena de licencias: el modelo se declara Apache 2.0, pero incorpora pesos derivados de Bonsai Image 4B (a su vez FLUX.2 [klein] 4B), Ternary Bonsai 1.7B y TAEF2, cuyas licencias no se detallan en la información disponible. Conviene verificar los términos de cada componente antes de un uso comercial.
- Riesgo de sesgo y alucinacion visual: no hay documentación sobre la composición de los datos de entrenamiento de los componentes base, por lo que se heredan los sesgos y las limitaciones de representación de dichos modelos; en un modelo de 4 pasos y resolución reducida, los artefactos y las composiciones erróneas son más probables.
- Dependencia del runtime y del navegador: el funcionamiento depende de WebGPU, de la caché del navegador y de la disponibilidad del repositorio para peticiones por rango; no hay servidor, endpoint ni API estandarizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohsenvand/mindview-t2i
- Demo de generación en el navegador: https://neovand.github.io/mindview/paint
- Repositorio del proyecto mindview: https://github.com/NeoVand/mindview
- Runtime de lectura del archivo empaquetado: https://github.com/NeoVand/mindview/blob/main/src/lib/runtime/packed.ts
- Runtime del lector: https://github.com/NeoVand/mindview/blob/main/src/lib/runtime/bonsai-llm.ts
- Runtime del pintor: https://github.com/NeoVand/mindview/blob/main/src/lib/runtime/painter.ts
- Modelo base del lector: https://huggingface.co/prism-ml/Ternary-Bonsai-1.7B-gguf
- Modelo base del pintor: https://huggingface.co/prism-ml/bonsai-image-ternary-4B-unpacked
- Decodificador TAEF2: https://huggingface.co/madebyollin/taef2
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relación con el modelo.
