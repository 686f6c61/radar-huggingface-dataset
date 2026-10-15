# abhijit2k01/proton-demo

## Resumen

Proton-demo es un export a ONNX del codificador visual (vision tower) y la cabeza de proyeccion del modelo FLAIR, publicado por el usuario abhijit2k01 (Abhijit Das). No se trata de un modelo de lenguaje: es un codificador de imagen ResNet-50 que transforma una imagen de retina en un embedding de 512 dimensiones l2-normalizado, y se usa como componente de percepcion en la demo en navegador de PROTON+, un metodo de deteccion de out-of-distribution (OOD) en tiempo de test para modelos vision-lenguaje medicos.

FLAIR procede del trabajo de Silva-Rodriguez et al. publicado en Medical Image Analysis en 2025, con licencia Apache-2.0. Este repositorio concreto es unicamente el artefacto de inferencia del encoder visual, no el modelo completo ni el pipeline de deteccion OOD. El repo pesa 0,1 GB e incluye dos ficheros: una version fp32 de 98 MB y una version int8 de 25 MB obtenida por cuantizacion dinamica, con una concordancia coseno de 0,99 respecto a fp32. Es relevante para desarrolladores que quieran ejecutar el encoder visual en CPU o en el navegador sin depender de PyTorch, aunque carece de benchmarks publicados, de documentacion de entrenamiento y de cualquier capacidad de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (vision encoder) mas cabeza de proyeccion, exportado a ONNX |
| Parametros totales | no disponible (ResNet-50 estandar ronda los 23-25 M, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de imagen 512x512) |
| Tipos de cuantizacion | fp32 y int8 por cuantizacion dinamica |
| Idiomas soportados | no disponible (no procesa texto; entrada exclusivamente de imagen) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (flair_vision.onnx, flair_vision_int8.onnx) |
| Dimension del embedding de salida | 512, l2-normalizado |
| Entrada | tensor float32 [B, 3, 512, 512] en rango [0,1]; lado largo redimensionado a 512, relleno de ceros a derecha e inferior, sin normalizacion mean/std |
| Tamano de los ficheros | 98 MB (fp32), 25 MB (int8) |
| Libreria declarada | flair |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un ResNet-50 convolutional como torre visual, seguido de una cabeza de proyeccion que reduce la representacion a un vector de 512 dimensiones l2-normalizado. El artefacto publicado es exclusivamente el grafo ONNX de esa torre y su proyeccion; no incluye cabecera de clasificacion, decodificador de texto ni el modulo de deteccion OOD de PROTON+. El preprocesado es deliberadamente simple y queda documentado en la model card: redimensionado del lado largo a 512, relleno por la derecha y por abajo, y entrada en [0,1] sin normalizacion por media y desviacion tipica.

No hay informacion en la model card sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (no aplicable a un encoder visual) ni el procedimiento de ajuste del modelo FLAIR original. La unica innovacion tecnica documentada en este repositorio es la exportacion a ONNX en dos variantes de precision y la verificacion de que la version int8 mantiene una similitud coseno de 0,99 con la fp32, lo que permite ejecucion en navegador o en CPU con un cuarto del peso.

## Capacidades

- Extraccion de caracteristicas visuales de imagenes de retina: genera un embedding de 512 dimensiones l2-normalizado por imagen.
- Procesamiento por lotes: la entrada admite un eje de batch arbitrario [B, 3, 512, 512].
- Inferencia sin PyTorch: al ser ONNX, se ejecuta con ONNX Runtime, ONNX Runtime Web o cualquier runtime compatible.
- Ejecucion en navegador: la variante int8 de 25 MB esta pensada para la demo in-browser de PROTON+.
- Cuantizacion dinamica verificada: la salida int8 conserva una similitud coseno de 0,99 frente a fp32.
- Soporte de tool calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Generacion de texto, codigo, matematicas, vision-lenguaje o audio: no disponible en este artefacto; el encoder no genera texto ni razona, solo produce embeddings.

## Casos de uso

- Deteccion de out-of-distribution en imagenes medicas: usar los embeddings de 512 dimensiones como entrada de un detector OOD en tiempo de test, tal como plantea PROTON+ para modelos vision-lenguaje medicos; el encoder aporta la representacion visual sobre la que se calculan las puntuaciones de novedad.
- Precomputo de embeddings de retina a escala: al ser ONNX y ligero (98 MB en fp32, 25 MB en int8), permite indexar lotes grandes de imagenes en CPU sin GPU dedicada y almacenar los vectores para busquedas de similitud posteriores.
- Recuperacion de imagenes medicas por similitud: con embeddings l2-normalizados, la similitud coseno sirve directamente para construir un indice de vecinos mas cercanos sobre un archivo de retinografias.
- Demo interactiva en navegador: la variante int8 permite ejecutar el encoder en el cliente mediante ONNX Runtime Web, sin enviar la imagen a un servidor, lo que resulta util en contextos con requisitos de privacidad.
- Filtrado previo en pipelines de clinical decision support: descartar imagenes fuera de distribucion antes de pasarlas a un modelo diagnostico, evitando predicciones poco fiables sobre entradas atipicas.
- Validacion de calidad de adquisicion: detectar retinografias con caracteristicas anomalas respecto a la distribucion de entrenamiento comparando su embedding con un centroide de referencia.
- Benchmarking reproducible de deteccion OOD: servir como encoder fijo y congelado en comparaciones de metodos OOD, ya que el formato ONNX elimina variaciones debidas al framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo documentado es la concordancia entre precisiones: los embeddings de la variante int8 coinciden con los de fp32 con una similitud coseno de 0,99. El autor enlaza un dataset de benchmarks (abhijit2k01/proton-benchmarks), pero no se incluyen cifras de rendimiento en la model card.

## Requisitos de hardware

- VRAM estimada: en torno a 100 MB para el fichero fp32 de 98 MB y unos 25 MB para el int8; el consumo real depende del batch y del runtime.
- GPU: cualquier GPU moderna sirve; no se requiere A100, H100 ni similar. Una RTX 4090, una RTX 3060 o incluso una GPU integrada son suficientes para el modelo.
- Consumer GPU: si, cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- CPU: la variante int8 esta pensada para ejecucion en CPU y en navegador.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), ONNX Runtime Web para navegador, y cualquier runtime compatible con ONNX. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| abhijit2k01/proton-demo (fp32) | ONNX ResNet-50 vision encoder | no disponible (ResNet-50 estandar) | no aplica | sin benchmarks publicados | apache-2.0 | HuggingFace |
| abhijit2k01/proton-demo (int8) | ONNX ResNet-50 cuantizado | no disponible | no aplica | coseno 0,99 frente a fp32 | apache-2.0 | HuggingFace |
| FLAIR original (jusiro/FLAIR) | PyTorch, modelo vision-lenguaje medico | no disponible | no disponible | no disponible | apache-2.0 | GitHub |

No se dispone de datos de benchmarks para comparar con alternativas de la misma categoria (por ejemplo, otros encoders visuales medicos), por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite prompts; cualquier ficha que lo trate como LLM seria incorrecta.
- No es un modelo diagnostico: es un encoder visual de apoyo a deteccion OOD; no debe usarse para diagnostico clinico ni como dispositivo medico.
- Preprocesado rigido: la entrada debe ser [B, 3, 512, 512] en [0,1], con lado largo a 512 y relleno de ceros; aplicar normalizacion por media y desviacion tipica alteraria los embeddings.
- Ambito de dominio limitado: el modelo esta orientado a imagenes de retina; su comportamiento fuera de ese dominio no esta documentado.
- Sin informacion de entrenamiento: no se detallan datos, sesgos ni composicion demografica del conjunto de entrenamiento, por lo que no se pueden evaluar sesgos sistematicos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de representaciones poco fiables para entradas fuera de distribucion.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y atribucion a FLAIR (Silva-Rodriguez et al., Medical Image Analysis 2025) y al autor del export.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado en octubre de 2026, sin pipeline declarado; se trata de un artefacto de demostracion, no de un modelo con soporte de produccion.
- Idiomas: sin capacidades de texto, por lo que no hay soporte linguistico que evaluar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhijit2k01/proton-demo
- Dataset de benchmarks: https://huggingface.co/datasets/abhijit2k01/proton-benchmarks
- Perfil del autor: https://huggingface.co/abhijit2k01
- Codigo y benchmarks de PROTON: https://github.com/aj-das-research/PROTON
- Demo en navegador de PROTON+: https://aj-das-research.github.io/PROTON/demo/
- Repositorio original de FLAIR: https://github.com/jusiro/FLAIR
- Referencia de FLAIR: Silva-Rodriguez et al., Medical Image Analysis, 2025 (sin URL directa en la informacion disponible)
