# kingjones777/OxCoder-9B-MTP-ROCmFP4-imatrix-GGUF

## Resumen

OxCoder-9B-MTP-ROCmFP4-imatrix-GGUF es una cuantización de 4 bits en formato GGUF del modelo OrionLLM/OxCoder-9B, publicada por el usuario kingjones777 y orientada específicamente al hardware AMD Strix Halo (gfx1151, Ryzen AI Max / Max+ 395 con Radeon 8060S). El modelo base es un transformer denso de 32 capas con arquitectura híbrida Qwen3.5: 24 capas de atención lineal Gated DeltaNet y 8 capas de atención completa (una de cada cuatro), con 9.409.813.744 parámetros, dimensión oculta de 4096, FFN de 12288, 16 cabezas de atención y 4 de KV, y una ventana de contexto de 262.144 tokens. El pipeline declarado es image-text-to-text, por lo que el modelo es multimodal (texto e imagen).

La particularidad de esta publicación es el uso de una matriz de importancia (imatrix) para calibrar el cuantizador ROCmFP4: en lugar de elegir la escala de cada bloque de 4 bits minimizando el error sin ponderar, se elige minimizando el error ponderado por la activación de calibración de cada peso. El resultado es que la calidad mejora a igual tamaño de archivo y mismo coste de cómputo por token, con reducciones de divergencia KL frente a BF16 de entre el 28 % y el 36 % respecto a la versión estándar del mismo cuantizador.

Se distribuyen tres niveles (STRIX_LEAN, COHERENT y FAST) de aproximadamente 5 GiB, todos con una cabeza MTP (multi-token prediction) injertada para decodificación especulativa y con el proyector de visión incluido. La licencia es Apache 2.0. La relevancia actual está en que permite ejecutar un modelo de 9B con contexto de 256K y capacidades de visión en equipos con memoria unificada AMD, un segmento con pocas optimizaciones específicas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido Qwen3.5: 24 capas Gated DeltaNet (atención lineal) + 8 capas de atención completa (una de cada cuatro) |
| Parametros totales | 9.409.813.744 (modelo base); el campo de safetensors del repo indica 456.010.480 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | ROCmFP4 de 4 bits con calibración imatrix; tres niveles: STRIX_LEAN (5,03 GiB), COHERENT (5,34 GiB) y FAST (4,85 GiB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

Otros datos técnicos: dimensión oculta 4096, FFN 12288, 16 cabezas de atención y 4 cabezas KV, 32 capas. Tamaño total del repositorio: 17,3 GB. Incluye cabeza MTP injertada (blk.32.*) y proyector de visión.

## Arquitectura y entrenamiento

El modelo base es un transformer denso con arquitectura híbrida: 24 de sus 32 capas usan Gated DeltaNet, un mecanismo de atención lineal con estado recurrente, y las 8 restantes usan atención completa, distribuidas de forma que cada cuarta capa es de atención completa. Esta combinación reduce el coste de cómputo y memoria del contexto largo manteniendo la capacidad de atención global en puntos estratégicos de la red. La ventana de 262.144 tokens y la inclusión de un proyector de visión lo sitúan como modelo multimodal texto-imagen.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no se dispone de información en la documentación proporcionada. La innovación documentada en esta publicación es la cuantización: ROCmFP4 con ruta de cuantizador ponderada por importancia. La imatrix se calculó sobre GGUF en BF16 con 129 fragmentos de 512 tokens en CPU, usando bartowski calibration_datav3.txt, y se cargaron 248 entradas. Quedaron sin datos de importancia la proyección de salida output.weight (llama-imatrix la omite sin --process-output), el embedding token_embd.weight (es una tabla de consulta, no una multiplicación de matrices) y los 8 tensores del bloque MTP injertado blk.32.*, ya que la pasada de calibración no lo ejecuta. El archivo de imatrix tiene sha256 4d99e1dda542f1692ce310c4e05f710100d6ac8eb138ff0739541c4b9affb17a.

Además, el paquete incorpora una cabeza MTP para decodificación especulativa, un parche de caché de prompt y el mismo proyector de visión que la build estándar (kingjones777/OxCoder-9B-MTP-ROCmFP4-GGUF); la única diferencia entre ambas publicaciones es cómo se elige la escala de cada bloque de 4 bits.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base OxCoder-9B.
- Generación y asistencia en código: el modelo está etiquetado como code/coding y su nombre (OxCoder) apunta a ese dominio.
- Procesamiento multimodal texto-imagen: pipeline image-text-to-text y proyector de visión incluido en los pesos.
- Contexto muy largo: hasta 262.144 tokens, adecuado para repositorios completos o documentos extensos.
- Decodificación especulativa mediante cabeza MTP injertada, que acelera la generación en llama.cpp.
- Compatibilidad con llama.cpp en backends ROCm y Vulkan, con parche de caché de prompt incluido.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre hardware AMD Strix Halo: el modelo puede completar y explicar código en un equipo con Ryzen AI Max+ 395 y memoria unificada, sin GPU dedicada, gracias a los aproximadamente 5 GiB de pesos en 4 bits y al soporte ROCm del backend.
- Análisis de repositorios completos: con 262.144 tokens de contexto se puede cargar un conjunto amplio de archivos fuente en una sola ventana para tareas de revisión, refactorización o búsqueda de dependencias entre módulos.
- Comprensión de diagramas y capturas de pantalla: el proyector de visión permite adjuntar imágenes (diagramas de arquitectura, capturas de errores, bocetos de interfaz) y pedir explicaciones o código a partir de ellas.
- Servidor de inferencia personal con decodificación especulativa: la cabeza MTP acelera la generación en llama.cpp, lo que hace viable atender varias sesiones interactivas en un único equipo con memoria unificada.
- Documentación técnica a partir de material visual: generar guías o comentarios de API a partir de capturas de paneles y fragmentos de código en una misma conversación.
- Prototipado de pipelines multimodales: al ser GGUF y Apache 2.0, sirve para validar flujos image-text-to-text antes de migrar a infraestructura mayor, sin coste de licencia.
- Evaluación de cuantizaciones en producción: los tres niveles permiten comparar calidad y velocidad en el hardware objetivo con métricas publicadas (KLD, top-1, tokens por segundo) antes de fijar un despliegue.

## Benchmarks y rendimiento

El autor publica métricas de calidad de la cuantización frente a BF16, medidas sobre wikitext-2 test (40 fragmentos de 1.023 tokens puntuados, 40.920 tokens en total, contexto 2048), con logits de referencia calculados en CPU. KLD es la divergencia KL por token de la distribución del siguiente token respecto a BF16.

| Nivel | Build | Tamano | KLD vs BF16 | Top-1 igual | PPL (x BF16) | KLD percentil 99 |
|---|---|---:|---:|---:|---:|---:|
| STRIX_LEAN | estándar | 5,03 GiB | 0,0879 ± 0,0034 | 89,29 % | 6,7713 ± 0,0829 (x1,0185) | 0,5442 |
| STRIX_LEAN | imatrix | 5,03 GiB | 0,0610 ± 0,0027 | 90,76 % | 6,7525 ± 0,0822 (x1,0157) | 0,3689 |
| COHERENT | estándar | 5,34 GiB | 0,0857 ± 0,0033 | 89,31 % | 6,6389 ± 0,0802 (x0,9986) | 0,5211 |
| COHERENT | imatrix | 5,34 GiB | 0,0550 ± 0,0025 | 91,05 % | 6,6343 ± 0,0798 (x0,9979) | 0,3435 |
| FAST | estándar | 4,85 GiB | 0,0890 ± 0,0033 | 88,94 % | 6,8166 ± 0,0835 (x1,0253) | 0,5682 |
| FAST | imatrix | 4,85 GiB | 0,0637 ± 0,0029 | 90,44 % | 6,7536 ± 0,0822 (x1,0159) | 0,3873 |

Mejora de imatrix frente a la build estándar: STRIX_LEAN reduce KLD un 30,6 % (6,2 sigma) y sube top-1 1,46 puntos; COHERENT reduce KLD un 35,9 % (7,4 sigma) y sube top-1 1,74 puntos; FAST reduce KLD un 28,4 % (5,8 sigma) y sube top-1 1,50 puntos. La perplejidad apenas cambia (entre -0,9 % y -0,3 %), lo que el autor atribuye a que KLD es más sensible que la perplejidad.

Rendimiento en el hardware objetivo (ROCm0, salvo indicación):

| Nivel | Decodificación (tok/s) | Prefill (tok/s) |
|---|---:|---:|
| STRIX_LEAN | 59,03 (rango 57,78–59,12) | 897,6 |
| COHERENT | 59,28 (rango 58,16–59,53) | 812,9 |
| FAST | 60,01 (rango 58,76–60,11) | 910,3 |

En Vulkan0, STRIX_LEAN decodifica a 59,18 tok/s y COHERENT a 63,83 tok/s; FAST alcanza 61,13 tok/s. La perplejidad del BF16 de referencia en primera ventana fue 6,6290 en CPU, 6,6346 en Vulkan0 (+0,08 %) y 6,6463 en ROCm0 (+0,26 %). El mismo archivo STRIX_LEAN estándar evaluado en ROCm0 y Vulkan0 dio KLD 0,0879 y 0,0886 (+0,9 %, 0,2 sigma). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: entre 4,85 y 5,34 GiB solo para los pesos según el nivel; con contexto largo y caché KV conviene reservar bastante más, aunque el tamaño exacto de la caché KV para 262.144 tokens no está disponible en la información proporcionada.
- GPU objetivo: AMD Strix Halo gfx1151 (Ryzen AI Max / Max+ 395, Radeon 8060S) con memoria unificada; el paquete está optimizado para ROCmFP4 en ese hardware.
- Backends probados por el autor: ROCm0 y Vulkan0 en llama.cpp; ambos coinciden con la referencia CPU dentro del ruido en el archivo evaluado.
- Cabe en GPU de consumo: sí, en equipos AMD con memoria unificada del segmento Strix Halo; la compatibilidad con GPUs NVIDIA u otras AMD no está documentada en esta publicación.
- Opciones de despliegue: llama.cpp (ROCm y Vulkan). No se documenta soporte para vLLM, TGI u Ollama.
- Throughput medido: aproximadamente 59–60 tok/s de decodificación y 813–910 tok/s de prefill en ROCm0 para los tres niveles; en Vulkan0, 59–64 tok/s de decodificación.
- La decodificación especulativa con la cabeza MTP está incluida en los pesos, pero no se aportan cifras de aceleración respecto a generación sin MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---:|---:|---|---|---|
| OxCoder-9B-MTP-ROCmFP4-imatrix (esta ficha) | 9,41 B | 262.144 | ROCmFP4 4 bits con imatrix, GGUF | Apache 2.0 | Texto + imagen, optimizado para AMD Strix Halo, MTP |
| OxCoder-9B-MTP-ROCmFP4 (build estándar del mismo autor) | 9,41 B | 262.144 | ROCmFP4 4 bits sin imatrix, GGUF | Apache 2.0 | Igual, con KLD entre un 28 % y un 36 % peor |
| OrionLLM/OxCoder-9B (modelo base) | 9,41 B | 262.144 | BF16 y otras | Apache 2.0 | Referencia de calidad; sin optimización específica para Strix Halo |
| Otras cuantizaciones GGUF de 4 bits del mismo base | 9,41 B | 262.144 | GGUF 4 bits genérico | Apache 2.0 | No disponible en la información proporcionada |

No se dispone de datos de benchmarks de tareas que permitan comparar el rendimiento cognitivo con modelos de otros fabricantes de tamaño similar; la comparación disponible se limita a variantes de cuantización del mismo modelo base.

## Limitaciones y advertencias

- Las métricas de calidad publicadas miden fidelidad respecto a BF16 (KLD, top-1, perplejidad), no capacidad absoluta en tareas; no sustituyen a evaluaciones en MMLU, HumanEval o GSM8K.
- El hardware objetivo es muy específico (gfx1151, Strix Halo); el rendimiento en otras GPUs AMD o NVIDIA no está documentado y puede diferir.
- Los tensores output.weight, token_embd.weight y blk.32.* no tienen datos de importancia, por lo que su calibración sigue el camino no ponderado.
- La cabeza MTP no participó en la pasada de calibración, lo que puede afectar a la calidad de las predicciones especulativas.
- Riesgo de alucinación y sesgos: no hay información específica en la documentación proporcionada; deben asumirse los del modelo base.
- Idiomas soportados no declarados: la cobertura multilingüe no está garantizada.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datos de calibración de terceros (bartowski calibration_datav3.txt) antes de un uso comercial.
- El repositorio tiene 182 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- El campo de parámetros en safetensors del repo (456.010.480) no coincide con los 9.409.813.744 declarados en la model card; probablemente refleja solo una parte de los tensores, pero conviene tenerlo en cuenta al planificar memoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/OxCoder-9B-MTP-ROCmFP4-imatrix-GGUF
- Build estándar del mismo autor: https://huggingface.co/kingjones777/OxCoder-9B-MTP-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/OrionLLM/OxCoder-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Conjunto de calibración bartowski calibration_datav3.txt: no disponible como enlace en la información proporcionada
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
