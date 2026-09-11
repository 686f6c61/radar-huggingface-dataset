# pipenetwork/DeepSeek-V4.1-Flash-REAP50-MLX-mixed-4_8bit

## Resumen

DeepSeek-V4.1-Flash-REAP50-MLX-mixed-4_8bit es una compilación para MLX, el framework de Apple para Apple Silicon, del modelo DeepSeek-V4.1-Flash, publicada por el usuario pipenetwork. El modelo base declara 754,6 mil millones de parámetros con 40 capas y 384 expertos enrutados por capa, atención MLA con compartición de caché KV entre capas (4 capas propietarias del compresor sirven a las 40), embedding engram de n-gramas con hash en dos capas —cuyas tablas suman 196,6 mil millones de parámetros, cerca del 40 % del checkpoint—, hyper-conexiones Sinkhorn escalonadas y sumideros de atención por capa.

Esta variante aplica dos transformaciones sobre la publicación oficial: una poda REAP del 50 % de los expertos enrutados (se conservan 192 de 384 por capa) y una recuantización mixta a 4 bits en expertos enrutados y 8 bits en atención, expertos compartidos y tablas engram. Los pesos se obtuvieron decuantizando la publicación FP8/FP4 (decodificación bit-exacta del fp8 ue8m0 en bloques de 32x32 y del empaquetado fp4 por 32) y recuantizando después; la arquitectura no cambia. Ocupa 274,7 GB en disco y necesita una máquina de la clase de 320 GB de RAM (275 GB residentes).

Su relevancia es doble: permite ejecutar un MoE de escala frontera en hardware Apple Silicon de gran capacidad y documenta con mediciones el coste real de la poda y la cuantización, con una perplejidad de 3,3833 en wikitext-2 y una degradación de ×1,1681 frente a la versión sin podar. La contrapartida es que la arquitectura `deepseek_v41` no existe en ningún runtime público (ni transformers, ni mlx-lm, ni mlx-vlm) y el checkpoint solo carga mediante el port del propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE): 40 capas, 384 expertos enrutados por capa (192 tras poda REAP del 50 %), atención MLA con compartición de caché KV entre capas, embedding engram de n-gramas con hash en dos capas, hyper-conexiones Sinkhorn escalonadas, sumideros de atención por capa |
| Parámetros totales | 754,6 mil millones en el modelo base; el repositorio declara 242.947.342.704 parámetros reales en safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: expertos enrutados a 4 bits (grupo 64), atención MLA, expertos compartidos, embeddings y `head` a 8 bits (grupo 64), tablas engram a 8 bits (grupo 64); `wo_a`, hyper-conexiones, sumideros, sesgos del router, compresor, claves del indexer y normas sin cuantizar (bf16/fp32) |
| Idiomas soportados | no disponible (la calibración de la poda usó wikitext-2 train, diez idiomas de Wikipedia y código, pero no es una declaración de idiomas soportados) |
| Licencia | MIT (modelo y upstream, según el autor) |
| Formato de pesos | safetensors (librería MLX) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash (relación: quantized) |
| Tamaño del repositorio | 274,7 GB |
| Autor | pipenetwork |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo reproduce la arquitectura de DeepSeek-V4.1-Flash, un MoE de 40 capas en el que todas las capas son MoE enrutado (sin capas hash). Cada capa dispone de 384 expertos enrutados más expertos compartidos. La atención es MLA con compartición de caché KV entre capas: solo 4 capas son propietarias del compresor y su caché sirve a las 40. El componente más singular es el engram: un embedding de n-gramas con hash de dos capas cuyas dos tablas, de dimensiones [384.006.168 × 256] cada una, suman 196,6 mil millones de parámetros. Se añaden hyper-conexiones Sinkhorn escalonadas y sumideros de atención por capa. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni sobre etapas de RLHF o DPO del modelo base.

Sobre esta base, esta compilación no entrena nada: poda y recuantiza. La poda REAP conserva 192 de 384 expertos por capa, clasificados por saliencia medida como peso de enrutado medio aplicado multiplicado por la norma de la salida del experto, calculada sobre 65.536 tokens de calibración (wikitext-2 train, diez idiomas de Wikipedia y código, con cero solapamiento de 32-gramas con el conjunto de evaluación) recogidos ejecutando la propia compilación cuantizada. Los expertos conservados acumulan el 72,7 % de la masa de saliencia de media y dos mitades disjuntas del conjunto de calibración eligen el mismo conjunto el 88,4 % de las veces. La poda se aplicó sobre la compilación ya cuantizada, lo que el autor justifica como equivalente a podar en bf16 y recuantizar después, porque el subconjunto de expertos y la cuantización afín actúan sobre ejes distintos.

La innovación técnica destacable es la validación del port frente a la única referencia disponible, `inference/model.py` de DeepSeek: paridad fp32 de 1e-6 en configuración diminuta para prefill, decode con caché y prefill troceado, las tres operaciones de fake-quant de QAT bit-exactas, y controles negativos que demuestran que las rutas frágiles son portantes (0,84 de desplazamiento de logits al romper rope-inverse, 0,65 al romper los sumideros de atención, 0,56 al romper la compartición de caché entre capas). La carga estricta declara cero tensores ausentes y cero inesperados. Se documenta además un bug de la referencia en la fase de decode: en pasos impares el indexer lee las claves de la capa equivocada, con 0,67 de desplazamiento de logits; el port usa la caché del propietario.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad declarada en la pipeline (`text-generation`). La generación greedy se describe como coherente tras la comprobación de colapso.
- Razonamiento, matemáticas, código, tool calling y uso como agente: no disponible. La model card no documenta ninguna de estas capacidades ni resultados que las respalden.
- Capacidades multilingües: no disponible. No se declara lista de idiomas soportados.
- Visión: la torre de visión y el aligner se conservan sin modificar en el checkpoint, pero el runtime es exclusivamente de texto, por lo que no hay capacidad de visión utilizable.
- Predicción multi-token: no incluida. Las 3 capas de predicción multi-token (cabezas markov/confidence de DSpark) no forman parte de esta compilación.
- Carga y ejecución mediante port propio: el modelo se carga con `deepseek_v41_mlx.load.load()` desde el repositorio del port. No funciona en transformers, mlx-lm ni mlx-vlm.
- Ejecución local en Apple Silicon con memoria unificada, sin GPU dedicada, con 275 GB residentes.

## Casos de uso

- Investigación en poda de MoE: este checkpoint es un caso de estudio reproducible de poda REAP aplicada a un MoE de 40 capas y 384 expertos, con la metodología de saliencia, el tamaño del conjunto de calibración y las tasas de coincidencia entre mitades documentadas, de modo que un equipo puede replicar el procedimiento y comparar la retención de saliencia con la perplejidad resultante.
- Investigación en cuantización mixta: la tabla de divergencia por capa permite medir el coste de cada receta (8 bits, 6 bits, 4 bits y mixtas) sobre el mismo modelo, con decodificación forzada por profesor y generación libre, para decidir qué precisión asignar a cada grupo de pesos.
- Inferencia local privada en estaciones de trabajo Apple Silicon: con 274,7 GB en disco y 275 GB residentes, encaja en máquinas de la clase de 320 GB de memoria unificada (Mac Studio o Mac Pro de gama alta), lo que permite servir generación de texto sin salir del equipo y sin GPU dedicada.
- Validación de ports frente a implementaciones de referencia: el port se contrastó contra `inference/model.py` con paridad de 1e-6 y controles negativos, así que sirve como banco de pruebas para verificar que una implementación reproduce las rutas frágiles (rope-inverse, sumideros, compartición de caché) antes de confiar en ella.
- Evaluación comparativa podado frente a sin podar: la perplejidad medida (3,3833 con intervalo [3,1696, 3,6153]) y el ratio ×1,1681 [1,1407, 1,1991] frente a la versión sin podar, peor en 138 de 140 ventanas, ofrecen una referencia cuantitativa para decidir si compensa el ahorro de memoria.
- Docencia y experimentación con arquitecturas MoE singulares: el engram de n-gramas con hash, la compartición de caché KV entre capas o las hyper-conexiones Sinkhorn son componentes poco habituales que se pueden inspeccionar y modificar en un equipo de sobremesa con el port.
- Desarrollo de herramientas alrededor del runtime: al no existir `deepseek_v41` en ningún runtime público, hay margen para construir utilidades de carga, scripts de humo, integración en CI y perfiles de memoria sobre el port existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son la escalera de divergencia por capa frente a la referencia bf16-decuantizada, medida sobre 16.384 tokens de wikitext-2 con las 40 capas ejecutadas sobre entradas idénticas, y la perplejidad.

| Receta | Decodificación forzada por profesor (media) | Generación libre (capa final) | Coseno (capa final) |
|---|---:|---:|---:|
| 8 bits | 0,0084 | 0,1243 | 0,9910 |
| 6 bits | 0,0177 | 0,1393 | 0,9886 |
| 4 bits con engram a 4 bits | 0,0579 | 0,2714 | 0,9634 |
| Mixta 4/8, engram tal como se publica (fp8/ue8m0) | 0,0335 | 0,1948 | 0,9800 |
| Mixta 4/8, engram a 6 bits (build de 1 TB) | 0,0335 | 0,1945 | 0,9801 |
| Mixta 4/8, engram a 4 bits (build que cabe en 512 GiB) | 0,0342 | 0,2090 | 0,9775 |

| Métrica | Valor |
|---|---|
| Perplejidad en wikitext-2 test (286.580 tokens en 140 ventanas de 2.048, con este runtime) | 3,3833, intervalo [3,1696, 3,6153] |
| Ratio de perplejidad frente a la compilación sin podar (mismas ventanas) | ×1,1681, intervalo [1,1407, 1,1991]; peor en 138 de 140 ventanas |
| Paridad del port frente a la referencia en configuración diminuta y fp32 | 1e-6 en prefill, decode con caché y prefill troceado |
| Desplazamiento de logits en controles negativos | 0,84 (rope-inverse), 0,65 (sumideros de atención), 0,56 (compartición entre capas), 0,67 (bug de decode de la referencia) |
| Carga estricta | cero tensores ausentes, cero inesperados |

El hallazgo que estructura la familia de builds es que el engram a 6 bits resulta indistinguible de las tablas fp8 publicadas (0,1945 frente a 0,1948 en generación libre), mientras que el engram a 4 bits cuesta un 7,3 % adicional en generación libre; como el build con engram a 6 bits ocupa 477 GB y no cabe en una máquina de 512 GiB, el build con engram a 4 bits es el que encaja en ese perfil.

## Requisitos de hardware

- Almacenamiento: 274,7 GB para el repositorio de safetensors.
- Memoria: clase de 320 GB (275 GB residentes). Es memoria unificada de Apple Silicon, no VRAM de GPU discreta.
- GPU recomendadas: ninguna GPU discreta. El modelo se ejecuta con MLX sobre el chip de Apple Silicon y su memoria unificada. No hay soporte de CUDA en esta compilación.
- GPU de consumo: no cabe. Una RTX 4090 con 24 GB queda muy por debajo de los 275 GB residentes. El propio autor indica que el build con engram a 6 bits (477 GB en disco) exige máquinas de 1 TB y no cabe en una de 512 GiB.
- Opciones de despliegue: exclusivamente el port `deepseek-v41-mlx` del autor (`github.com/PipeNetwork/deepseek-v41-mlx`), con `pip install -r requirements.txt` y el script `scripts/smoke_generate.py`. No hay soporte en transformers, mlx-lm, mlx-vlm, vLLM, llama.cpp, Ollama ni TGI, porque la arquitectura `deepseek_v41` no existe en ningún runtime público.
- Latencia y rendimiento: no disponible. No se publican medidas de tokens por segundo ni latencias.

## Comparativa con modelos similares

No se dispone de información sobre otras compilaciones MLX comparables de este mismo modelo base. La comparación posible es interna al conjunto publicado por el autor:

| Versión | Parámetros | Cuantización | Tamaño en disco | Generación libre (divergencia) | Perplejidad wikitext-2 test | Licencia | Runtime |
|---|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (oficial) | 754,6 mil millones | FP8 / FP4 (QAT) | no disponible | referencia | no disponible | MIT | `inference/model.py` oficial de DeepSeek |
| Esta compilación (REAP50, mixta 4/8, engram 8 bits) | 242.947.342.704 en safetensors | 4 bits expertos / 8 bits atención, compartidos y engram | 274,7 GB | no disponible para esta receta exacta | 3,3833 | MIT | port `deepseek-v41-mlx` |
| Misma receta sin podar | 754,6 mil millones (referencia del ratio) | mixta 4/8 | no disponible | no disponible | 1,1681 veces menor que la podada | MIT | port `deepseek-v41-mlx` |
| Build con engram a 6 bits (mismo conjunto) | no disponible | mixta 4/8 con engram a 6 bits | 477 GB | 0,1945 | no disponible | MIT | port `deepseek-v41-mlx`, máquinas de 1 TB |
| Build con engram a 4 bits (mismo conjunto) | no disponible | mixta 4/8 con engram a 4 bits | no disponible | 0,2090 | no disponible | MIT | port `deepseek-v41-mlx`, cabe en 512 GiB |

## Limitaciones y advertencias

- Los archivos están modificados: se decuantizaron desde la publicación FP8/FP4 y se recuantizaron. No es una redistribución sin cambios del modelo oficial.
- No incluye las 3 capas de predicción multi-token (cabezas markov/confidence de DSpark), por lo que cualquier comportamiento asociado a esas capas no está disponible.
- El runtime es solo de texto aunque la torre de visión y el aligner se conserven en el checkpoint. No se puede usar para tareas multimodales.
- No existe runtime estándar: ni transformers, ni mlx-lm, ni mlx-vlm soportan `deepseek_v41`. Depender del port de un tercero es un riesgo de mantenimiento en producción.
- La poda degrada la calidad de forma medible: la perplejidad empeora un 16,81 % de media frente a la versión sin podar y lo hace en 138 de las 140 ventanas evaluadas. La retención de saliencia (72,7 % de la masa) no es una medida de calidad; la propia model card lo advierte.
- El engram a 4 bits añade un 7,3 % de coste en generación libre frente al engram fp8 publicado; es una decisión forzada por el límite de memoria, no una elección libre.
- Existe un bug documentado en la implementación de referencia de DeepSeek en la fase de decode (el indexer lee las claves de la capa equivocada en pasos impares, 0,67 de desplazamiento de logits). Cualquier comparación contra la referencia debe tenerlo en cuenta.
- Las cifras declaradas son parcialmente inconsistentes: el recuento real de parámetros del repositorio (242.947.342.704) no coincide con la suma aritmética de los grupos descritos en la model card (543,6 mil millones de expertos enrutados antes de podar, 196,6 mil millones de tablas engram, unos 14 mil millones de atención y embeddings). La documentación disponible no explica la diferencia.
- Idiomas soportados: no declarados. La presencia de diez idiomas de Wikipedia en el conjunto de calibración de la poda no implica cobertura multilingüe del modelo.
- Riesgo de alucinación: no evaluado en la información disponible. Solo se declara que la generación greedy es coherente (comprobación de colapso), lo que no es una medida de veracidad.
- Licencia MIT según el autor, tanto en esta compilación como en el modelo base. Conviene verificar las condiciones de la publicación oficial antes de un uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Longitud de contexto no documentada, lo que impide planificar cargas de trabajo con ventanas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pipenetwork/DeepSeek-V4.1-Flash-REAP50-MLX-mixed-4_8bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Port de ejecución (código): https://github.com/PipeNetwork/deepseek-v41-mlx
- Notas sobre la implementación de referencia, dentro del repositorio del port: `docs/upstream-notes.md`
- Búsqueda web realizada: no devolvió resultados relevantes sobre este modelo; los enlaces recuperados correspondían a Scratch (scratch.mit.edu), ajenos por completo al ámbito de la ficha. No se han localizado papers, blogs ni demos adicionales.
