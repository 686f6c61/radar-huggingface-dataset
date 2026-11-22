# mradermacher/VisAlloc-4B-i1-GGUF

## Resumen

VisAlloc-4B-i1-GGUF es la colección de cuantizaciones GGUF, generadas con matrices de importancia (imatrix), del modelo multimodal VisAlloc-4B, desarrollado originalmente por Kaelyn01 y cuantizado por mradermacher. Se trata de un modelo vision-language de aproximadamente 4.840 millones de parámetros (4,84 B), orientado a la comprensión visual de grano fino, es decir, a tareas en las que el modelo debe razonar sobre detalles pequeños dentro de una imagen en lugar de limitarse a describirla globalmente.

La relevancia de esta ficha reside en que pone a disposición de la comunidad un conjunto amplio de cuantizaciones (desde IQ1_S hasta Q6_K, pasando por Q4_K_M e IQ4_XS) que permiten ejecutar un modelo multimodal de ~4,8 B en hardware de consumo. El modelo base emplea técnicas de destilación on-policy y self-distillation junto con un mecanismo denominado visual supervision allocation, que asigna dinámicamente la supervisión a las regiones visuales relevantes durante el entrenamiento. Los pesos están publicados en formato GGUF con licencia Apache 2.0, lo que facilita su uso comercial.

El repositorio ocupa 60,7 GB en total, pero cada fichero de cuantización individual pesa entre 1,7 GB (IQ1_S) y 4,1 GB (Q6_K). Los idiomas declarados son inglés (en) y chino (zh). No se dispone de información pública sobre la longitud de contexto, los resultados de benchmarks ni la composición exacta del dataset de entrenamiento más allá del nombre del conjunto VisAlloc-6K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-language multimodal (transformer); detalles internos no disponibles |
| Parametros totales | 4.841.450.496 (~4,84 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; tambien disponibles cuantizaciones estaticas en el repo VisAlloc-4B-GGUF |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales del modelo base en safetensors |
| Tamano del repositorio | 60,7 GB (conjunto completo de cuantizaciones) |
| Modelo base | Kaelyn01/VisAlloc-4B |
| Dataset de entrenamiento | Kaelyn01/VisAlloc-6K |
| Libreria | transformers (modelo base); GGUF para llama.cpp y derivados |

## Arquitectura y entrenamiento

El modelo base VisAlloc-4B es un modelo vision-language de ~4,84 B de parametros. La model card del repositorio cuantizado no detalla la arquitectura interna (numero de capas, dimension oculta, tipo de proyector visual ni encoder de vision empleado), por lo que esa informacion debe considerarse no disponible. Lo que si se declara explicitamente son las tecnicas de entrenamiento: destilacion on-policy, self-distillation y visual supervision allocation, una estrategia que asigna la supervision de forma selectiva a las regiones visuales que resultan informativas para la tarea, en lugar de tratar toda la imagen por igual.

El dataset de entrenamiento es VisAlloc-6K, un conjunto de aproximadamente 6.000 muestras (segun el nombre), orientado a comprension visual de grano fino. No se especifica el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron etapas de RLHF o DPO posteriores. La cuantizacion i1 emplea matrices de importancia (imatrix) calculadas sobre el modelo, lo que mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas; los ficheros mmproj (proyector multimodal) no se incluyen en este repositorio i1 y deben obtenerse del repositorio estatico VisAlloc-4B-GGUF.

## Capacidades

- Comprension visual de grano fino: razonamiento sobre detalles pequenos, texto en imagenes, objetos parcialmente ocluidos y relaciones espaciales sutiles.
- Generacion de texto conversacional multimodal: respuestas en formato dialogico a partir de entradas imagen + texto.
- Descripcion de imagenes y respuesta a preguntas visuales (VQA) en ingles y chino.
- Capacidades de razonamiento visual multi-paso derivadas del entrenamiento con destilacion on-policy y self-distillation.
- Soporte multilingue limitado a ingles y chino.
- No se declara soporte de tool calling, function calling ni modo thinking explicito en la informacion disponible.
- No se declara soporte de audio ni de video.

## Casos de uso

- Analisis de documentos escaneados: el modelo puede extraer y razonar sobre texto pequeno en facturas, formularios o capturas, aprovechando su entrenamiento especifico en comprension de grano fino; adecuado para pipelines de digitalizacion donde un OCR generico falla con layouts complejos.
- Inspeccion visual de calidad industrial: analisis de imagenes de producto o componentes para detectar defectos pequenos, usando la asignacion selectiva de supervision visual como ventaja para localizar anomalias sutiles.
- Asistencia a personas con discapacidad visual: descripcion detallada de escenas y lectura de etiquetas o carteles en ingles o chino, con cuantizaciones Q4_K_M (~3,2 GB) que caben en dispositivos con GPU de consumo.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes subidas por usuarios, con despliegue local via llama.cpp para evitar enviar datos a servicios externos.
- Investigacion en percepcion multimodal: reproduccion de experimentos de destilacion on-policy y visual supervision allocation sobre un modelo pequeno (~4,8 B), con cuantizaciones IQ4_XS (~3,0 GB) para iteracion rapida en una sola GPU.
- Prototipado de asistentes de escritorio: integracion en aplicaciones locales que necesitan responder preguntas sobre capturas de pantalla o imagenes del portapapeles, usando Ollama o llama.cpp con el fichero Q4_K_S como compromiso entre tamano y calidad.
- Analisis de imagenes medicas o tecnicas de baja resolucion relativa: apoyo a revision preliminar donde el modelo senala regiones de interes, siempre con supervision humana dada la ausencia de benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache ni proyector visual): ~1,7 GB (IQ1_S/IQ1_M), ~2,0-2,2 GB (IQ2), ~2,3-2,8 GB (IQ3/Q3), ~3,0-3,3 GB (IQ4/Q4), ~3,5-3,6 GB (Q5), ~4,1 GB (Q6_K).
- El proyector multimodal (mmproj) anade VRAM adicional; debe descargarse del repositorio estatico VisAlloc-4B-GGUF. Su tamano no esta especificado en la informacion disponible.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4080 y RTX 4090 con cualquier cuantizacion; las cuantizaciones Q4_K_M e IQ4_XS (~3,0-3,2 GB) son las mas recomendadas por tamano, velocidad y calidad.
- GPU de datacenter: A100, H100 y L40S pueden ejecutar el modelo sin restricciones y con mayor throughput, aunque el tamano reducido hace que las GPU de consumo sean suficientes para la mayoria de casos.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y servidores compatibles con la API de endpoints; para el modelo base en safetensors, transformers con vLLM o TGI (soporte multimodal a verificar segun la implementacion del modelo base).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| VisAlloc-4B (esta ficha) | ~4,84 B | no disponible | Apache 2.0 | GGUF (i1 y estatico), safetensors (base) | Enfoque en comprension visual de grano fino con visual supervision allocation |
| Qwen2-VL-2B / Qwen2.5-VL-3B | ~2-3 B | contexto largo (segun version) | Apache 2.0 | safetensors, GGUF | Alternativas multilingues con benchmarks publicados; datos de contexto exactos no verificados en esta ficha |
| SmolVLM-2B / SmolVLM-4B | ~2-4 B | contexto medio | Apache 2.0 | safetensors, GGUF | Modelos vision-language ligeros de Hugging Face con amplia documentacion |
| InternVL2-2B / InternVL2-4B | ~2-4 B | contexto medio | Apache 2.0 (segun variante) | safetensors, GGUF | Familia con resultados publicados en benchmarks de VQA |

Los datos de parametros, contexto y rendimiento de las alternativas no proceden de la informacion proporcionada en esta ficha y deben verificarse en sus respectivas model cards antes de usarse en produccion.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks para este modelo, por lo que no es posible comparar su calidad objetivamente con alternativas.
- La longitud de contexto no esta especificada; planificar aplicaciones de contexto largo sin asumir una ventana concreta.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sera inferior.
- Riesgo de alucinacion inherente a los modelos generativos, agravado en cuantizaciones muy bajas (IQ1, IQ2, Q2_K): mradermacher etiqueta IQ1 como "for the desperate" y Q2_K_S como "very low quality".
- Las cuantizaciones i1 no incluyen el fichero mmproj; sin el proyector multimodal del repositorio estatico el modelo no procesa imagenes.
- El dataset de entrenamiento es pequeno (~6.000 muestras segun el nombre), lo que puede limitar la generalizacion fuera de los dominios cubiertos.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar la licencia y condiciones del modelo base Kaelyn01/VisAlloc-4B, que puede imponer requisitos adicionales no reflejados aqui.
- El repositorio completo ocupa 60,7 GB; descargar solo el fichero de cuantizacion necesario para evitar consumo innecesario de almacenamiento.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/VisAlloc-4B-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/VisAlloc-4B-GGUF
- Modelo base: https://huggingface.co/Kaelyn01/VisAlloc-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaelyn01/VisAlloc-6K
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#VisAlloc-4B-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
