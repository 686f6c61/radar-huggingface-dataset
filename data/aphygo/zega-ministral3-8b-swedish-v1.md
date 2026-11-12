# Aphygo/zega-ministral3-8b-swedish-v1

## Resumen

ZeGA Swedish Synapse Cartridge es un adaptador de pesos publicado por APHYGO AB (Johan Thulin, Helsingborg, Suecia) que se acopla al modelo base `mistralai/Ministral-3-8B-Instruct-2512-BF16` para mejorar su competencia en sueco idiomatico. No se trata de un modelo completo, sino de un fichero `.safetensors` de 960,95 KiB (984.016 bytes) que modifica directamente ciertas capas lineales del transformer mediante una tecnica propietaria denominada ZeGA (Zero-Gradient Gated Adaptation via Weight-Space Synapse Cartridges). El autor lo describe como un "cartucho" desmontable que se adhiere en caliente al modelo base sin hooks de ejecucion ni tokens de sistema adicionales.

La propuesta tecnica es inusual: el cartucho se compila sin optimizacion por gradiente (0 pasos de entrenamiento) y garantiza que los pesos base permanecen bit-identicos (SHA-256 verificado) tras el desacoplamiento. El objetivo declarado es corregir errores gramaticales concretos del sueco (uso de `de/dem`, `var/vart`, concordancia de genero neutro) y mejorar la naturalidad en traduccion ejecutiva, sin degradar el rendimiento del modelo base en otros dominios.

El modelo base es Ministral-3-8B-Instruct, un transformer multimodal (image-text-to-text) de Mistral AI con 8.000 millones de parametros y licencia Apache-2.0. El cartucho hereda esa licencia y declara soporte para sueco, ingles y frances. Es relevante ahora por su enfoque de adaptacion de bajo coste (menos de 1 MiB) y por la metodologia de evaluacion pareada publicada con DOI en Zenodo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cartucho de pesos sobre transformer multimodal (base: Ministral-3-8B-Instruct) |
| Parametros totales | No disponible (el cartucho pesa 960,95 KiB; el base tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | No disponible (el cartucho se distribuye en safetensors; el base en BF16) |
| Idiomas soportados | Sueco (sv), ingles (en), frances (fr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`aphygo.synapse_cartridge.v1`) |

## Arquitectura y entrenamiento

El cartucho actua sobre capas lineales nativas (`nn.Linear`) del modelo base: segun la model card, anade "+8 canales en la capa 32 y +32 canales en la capa 33". No introduce hooks de ejecucion ni modifica el prompt de sistema en tiempo de inferencia. El acoplamiento se realiza en aproximadamente 8,40 ms y el desacoplamiento en 2,55 ms, restaurando los pesos base de forma bit-identica. El autor lo describe como "two-pole gated", en contraste con tecnicas de steering lineal simetrico que, segun sus mediciones, colapsan al 54,67% en el conjunto Symmetric-150.

El entrenamiento declarado es de "zero-gradient": 0 pasos de optimizacion, 0 tokens de prompt de sistema y 0 hooks en runtime. La model card no detalla el proceso de compilacion ni la composicion del dataset utilizado para derivar los pesos del cartucho. Se publican hashes SHA-256 del fichero y del payload de tensores, y se confirma la revision del modelo base (`f6fae9795746f63c9be8344932f01275f3c63734`). El autor remite a un preprint en Zenodo (DOI 10.5281/zenodo.24168084) y a un repositorio GitHub para el loader y la suite de verificacion.

## Capacidades

- Mejora de gramatica idiomatica sueca: distincion `de/dem`, `var/vart` y concordancia de genero neutro.
- Mejora de colocaciones y naturalidad en traduccion ejecutiva al sueco.
- Generacion de texto multi-frase en sueco bajo formato `[INST]`.
- Capacidades multimodales heredadas del base (pipeline image-text-to-text).
- Soporte multilingue declarado: sueco, ingles y frances.
- Preservacion del rendimiento del base en codigo y matematicas (segun la evaluacion del autor).
- No se documenta soporte de tool calling, function calling ni modo thinking en la informacion disponible.

## Casos de uso

- Localizacion de documentacion corporativa al sueco: el cartucho corrige concordancia de genero neutro y colocaciones en textos ejecutivos, reduciendo la revision manual en traducciones de informes y actas.
- Atencion al cliente en sueco: mejora la naturalidad de respuestas multi-turno generadas por el base, manteniendo el resto de capacidades del modelo intactas.
- Generacion de contenido editorial en sueco: util para redactar boletines o notas de prensa donde la distincion `de/dem` y `var/vart` es un criterio de calidad editorial.
- Traduccion ejecutiva de resumenes de reunion: el ejemplo `FG01` de la model card muestra sustitucion de anglicismos ("nyckelstakeholders" por "centrala intressenter") y correccion de concordancia.
- Despliegue con requisitos estrictos de reversibilidad: el desacoplamiento bit-identico en 2,55 ms permite usar el cartucho en entornos donde se exige restaurar el modelo base sin rastro.
- Investigacion sobre adaptacion de pesos sin gradiente: el cartucho y su suite de evaluacion sirven como referencia reproducible para estudiar tecnicas de weight-space programming.
- Pipelines multimodales en sueco: al heredar el pipeline image-text-to-text, puede emplearse en tareas de descripcion de imagenes o documentos escaneados con salida en sueco.

## Benchmarks y rendimiento

Evaluacion pareada publicada por el autor sobre 2.640 items deterministicos, sin solapamiento de calibracion:

| Benchmark | n | Ministral-3-8B base | +ZeGA Swedish | Delta / p (McNemar) |
|---|---:|---:|---:|---|
| SwedFreeGen-60 (generacion multi-frase `[INST]`) | 60 | 70,00% | 95,00% | +25,00 pp (p = 2,75e-4) |
| SwedMaster-300 (6 dominios linguisticos suecos) | 300 | 73,67% | 84,00% | +10,33 pp (p = 1,64e-6) |
| Symmetric-150 (steering lineal colapsa a 54,67%) | 150 | 59,33% | 72,67% | +13,33 pp (two-pole gated) |
| ScandEval ScaLA-sv (primeros 1.000 del test) | 1.000 | 71,30% | 75,40% | +4,10 pp (p = 0,00864) |
| SuperLim v2 DaLAJ (pares minimos) | 500 | 90,80% | 90,00% | -0,80 pp (p = 0,3438, ruido) |
| Meta Belebele (SV/EN/FR) | 700 | 88,0 / 94,0 / 90,0% | 88,0 / 94,0 / 90,0% | 0 flips por item (p = 1,0) |
| Anchor-40 / Python-20 / Math-20 | 80 | 40/40 · 20/20 · 7/20 | 40/40 · 20/20 · 7/20 | Code+Math identicos (D_KL = 5,66e-5) |

No se han publicado resultados de benchmarks independientes en la informacion disponible; todas las cifras proceden de la evaluacion del propio autor.

## Requisitos de hardware

- El cartucho en si ocupa 960,95 KiB en disco; los requisitos reales vienen determinados por el modelo base Ministral-3-8B.
- VRAM estimada para el base en BF16: aproximadamente 16 GB de pesos, mas overhead de activaciones y cache KV (no cuantificado en la informacion disponible).
- GPU recomendadas: no especificadas en la model card; el ejemplo de quickstart usa `device_map="cuda"` con `dtype=torch.bfloat16`.
- Despliegue: el quickstart oficial emplea `transformers` (`AutoModelForImageTextToText`) mas el `cartridge_loader.py` incluido en el repo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia del acoplamiento/desacoplamiento: ~8,40 ms y ~2,55 ms respectivamente.
- Throughput y latencia de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZeGA Swedish Cartridge (este) | Cartucho de 960,95 KiB sobre base 8B | No disponible | Adaptacion de pesos sin gradiente sobre Ministral-3-8B | Apache-2.0 | Hugging Face, 0 descargas |
| Ministral-3-8B-Instruct (base) | 8B | No disponible | Transformer multimodal instruct | Apache-2.0 | Hugging Face |
| Steering lineal simetrico (referencia del autor) | No disponible | No aplica | Intervencion en activaciones | No disponible | No disponible |

No se dispone de comparativas con otros adaptadores suecos (por ejemplo, LoRA o fine-tunes completos) en la informacion proporcionada.

## Limitaciones y advertencias

- El cartucho no es un modelo autonomo: requiere descargar y ejecutar el base `mistralai/Ministral-3-8B-Instruct-2512-BF16` en la revision exacta indicada.
- Todas las metricas proceden de la evaluacion del propio autor; no hay validacion independiente publicada.
- El conjunto SuperLim v2 DaLAJ muestra una ligera regresion (-0,80 pp) que el autor atribuye a ruido, pero que conviene vigilar en produccion.
- La model card no documenta sesgos conocidos, tasas de alucinacion ni comportamiento fuera de los dominios evaluados.
- El alcance linguistico se limita a sueco, ingles y frances segun la declaracion; no se garantiza calidad en otros idiomas.
- No se documenta soporte de tool calling ni de agentes multi-paso en la informacion disponible.
- La tecnica ZeGA es propietaria y el proceso de compilacion no se describe en detalle; la reproducibilidad depende del preprint y del repositorio del autor.
- Aunque la licencia es Apache-2.0, el autor ofrece "commercial compiler inquiries" por correo, lo que sugiere que el compilador (no el cartucho) podria tener terminos distintos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Aphygo/zega-ministral3-8b-swedish-v1
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Preprint (Zenodo DOI): https://doi.org/10.5281/zenodo.24168084
- Repositorio GitHub (loader, suite de verificacion y benchmarks): https://github.com/Aphygo/zega-synapse-cartridges
- Contacto del autor: johan.thulin@aphygo.com (APHYGO AB, Helsingborg, Suecia)
