# memset0/vsqa-preview-1.3b

## Resumen

vsqa-preview-1.3b es un checkpoint de estudiante destilado de Wan2.1-T2V-1.3B, publicado por el usuario memset0 dentro del proyecto VSQA. Es un modelo de generacion de video a partir de texto (text-to-video) que reduce la inferencia a 3 pasos de denoising mediante destilacion DMD (Distribution Matching Distillation), partiendo del modelo denso de aproximadamente 1.300 millones de parametros de Wan-AI.

La innovacion principal es la combinacion de atencion dispersa de video (VSA, bloque C128 con cubo (4, 4, 8) y sparsity 0,9) con entrenamiento consciente de cuantizacion (QAT) en NVFP4, aplicado tanto a las capas de atencion como a las lineales. El objetivo es reducir huella de memoria y coste por fotograma manteniendo la calidad del profesor denso.

Es relevante ahora porque es un preview temprano (creado el 25 de septiembre de 2026, con 0 descargas y 0 likes en el momento de redactar esta ficha) que publica un linaje de entrenamiento y un contrato de muestreo inusualmente detallados, aunque carece por completo de resultados de benchmarks y de evaluaciones cualitativas publicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para generacion de video texto-a-video, derivado de Wan2.1-T2V-1.3B, con atencion dispersa de video (VSA) y QAT NVFP4 en atencion y capas lineales |
| Parametros totales | Aproximadamente 1.300 M (heredados del modelo base Wan2.1-T2V-1.3B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en tokens; el contrato de muestreo fija 61 fotogramas a 896x448 |
| Tipos de cuantizacion | NVFP4 con QAT en capas de atencion y lineales (esquema `nvfp4_qat_train`); no se detalla la precision exacta de exportacion de los pesos |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con layout de diffusers |
| Tarea | Text-to-video (pipeline `text-to-video`) |
| Pasos de inferencia | 3 pasos de denoising en timesteps [1000.0, 941.1763916015625, 800.0], sin warp adicional |
| Parametros de muestreo | `flow_shift = 8.0`, guidance scale 1.0 (destilado) |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B-Diffusers |
| Tamano del repositorio | 29,2 GB |
| Biblioteca | diffusers (`WanPipeline`) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion (DiT) para generacion de video condicionada por texto, con un estudiante de 3 pasos obtenido por destilacion DMD. El entrenamiento se realizo a 61 fotogramas y resolucion 896x448, con batch global de 16 y QAT NVFP4 tanto en atencion como en capas lineales. El linaje documentado por el autor tiene tres etapas: (1) reconstruccion densa NVFP4 por capas, en grupos de 5 bloques y con entradas del profesor, partiendo de los pesos originales de Wan2.1-T2V-1.3B con LR 1e-6, usando el checkpoint del paso 500; (2) inicializacion ODE dispersa con una perdida auxiliar de reconstruccion (peso 0,5 en el endpoint y 0,25 en atencion y MLP), empleando VSA C128 con cubo (4, 4, 8) y sparsity 0,9, esquema de 3 pasos y LR 1e-5, de nuevo desde el paso 500; y (3) destilacion DMD de 1000 pasos (este checkpoint), con LR 2e-6 para el estudiante, LR 4e-7 para el critico, actualizacion del generador cada 5 iteraciones, sin EMA y con real-score guidance de 3,5.

Como innovaciones tecnicas destacan la atencion dispersa de video (VSA) con estructura de cubos y la cuantizacion NVFP4 integrada en el propio entrenamiento (QAT), no aplicada a posteriori. El autor advierte de que reproducir la numerica entrenada exige los kernels VSA/QAT de FastVideo: ejecutar los pesos con atencion densa BF16 y capas lineales densas constituye una configuracion distinta y no probada. El profesor y el critico de la destilacion son el Wan2.1-T2V-1.3B denso original. El export paso una recarga estricta y los digests de su payload coinciden con `artifact_manifest.json`.

## Capacidades

- Generacion de video a partir de texto en 61 fotogramas a 896x448, con muestreo en solo 3 pasos de denoising.
- Inferencia destilada con guidance scale 1.0, es decir, sin clasificador de guia externo en el muestreo.
- Atencion dispersa de video (VSA) con sparsity 0,9, orientada a reducir el coste computacional del mecanismo de atencion en videos.
- Cuantizacion NVFP4 de atencion y capas lineales entrenada con QAT, pensada para reducir huella de memoria en inferencia.
- Reutiliza sin cambios el text encoder, tokenizer, VAE y scheduler del modelo base, por lo que hereda la tokenizacion y el espacio latente de Wan2.1-T2V-1.3B.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no aplica; la entrada es texto y la salida es video.
- No se documentan capacidades de edicion de video, control de movimiento, image-to-video ni audio sincronizado.

## Casos de uso

- Prototipado rapido de video generativo: los 3 pasos de denoising permiten iterar sobre prompts con un coste computacional muy inferior al del profesor denso, adecuado para explorar ideas antes de lanzar una generacion de mayor calidad.
- Investigacion sobre destilacion few-step: el linaje completo (reconstruccion NVFP4, inicializacion ODE dispersa y DMD de 1000 pasos con hiperparametros explicitos) sirve como referencia reproducible para estudiar tecnicas de reduccion de pasos en modelos de difusion de video.
- Investigacion sobre QAT en NVFP4: permite medir el impacto real de cuantizar atencion y capas lineales durante el entrenamiento en lugar de despues, comparando contra el modelo base en BF16.
- Evaluacion de kernels de atencion dispersa: al requerir los kernels VSA/QAT de FastVideo, es un banco de pruebas para validar implementaciones de atencion dispersa con sparsity 0,9 en hardware compatible.
- Generacion de storyboards y material de previsualizacion: clips cortos de 61 fotogramas a 896x448 con inferencia de bajo coste para revision interna de guiones o conceptos.
- Aumento de datos para vision por computador: generacion de clips sinteticos etiquetados por prompt para preentrenar o aumentar datasets de reconocimiento de acciones, siempre que se revise manualmente la plausibilidad fisica del resultado.
- Despliegue en pipelines con recursos limitados: la combinacion de 1.300 M de parametros, pesos NVFP4 y muestreo en 3 pasos reduce los requisitos frente a modelos de video densos de mayor tamano, siempre que se disponga de kernels compatibles.
- Reproduccion y auditoria de artefactos: el repositorio incluye `metadata.json`, `artifact_manifest.json`, `resolved.yaml` y `source.yaml`, lo que facilita verificar la procedencia del checkpoint en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FVD, CLIP score, VBench ni comparaciones con el profesor denso), y tampoco se han encontrado evaluaciones externas en la busqueda web realizada. El modelo registra 0 descargas y 0 likes en HuggingFace en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada para el transformer: aproximadamente 2,6 GB en BF16 y del orden de 0,7 a 1 GB en NVFP4 (estimacion propia a partir de los 1.300 M de parametros, no publicada por el autor).
- VRAM estimada para el pipeline completo: el repositorio ocupa 29,2 GB e incluye text encoder, tokenizer, VAE y scheduler sin cambios respecto al modelo base; se recomienda planificar entre 16 y 32 GB de VRAM si se carga el pipeline completo sin offloading (estimacion, no confirmada por el autor).
- GPU recomendadas: A100 o H100 (40/80 GB) para maxima comodidad y throughput; RTX 4090 (24 GB) como opcion de gama alta para consumidor.
- Cabe en GPU de consumidor: probablemente si, con cuantizacion NVFP4 y offloading secuencial del text encoder y el VAE en tarjetas de 12 a 16 GB; no verificado por el autor.
- Aceleracion hardware: el esquema NVFP4 apunta a hardware con soporte nativo de FP4 (generaciones Blackwell y posteriores); en GPU sin ese soporte la cuantizacion puede degradarse a una ruta mas lenta.
- Opciones de despliegue: `WanPipeline` de diffusers; FastVideo con los kernels VSA/QAT es necesario para reproducir la numerica entrenada. vLLM, llama.cpp y Ollama no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La reduccion a 3 pasos de denoising sugiere una latencia muy inferior a la del profesor denso, pero no se han publicado mediciones.
- Almacenamiento: 29,2 GB de repositorio, mas espacio adicional para cache de compilacion de kernels.

## Comparativa con modelos similares

| Modelo | Parametros | Muestreo | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| memset0/vsqa-preview-1.3b | ~1.300 M | 3 pasos (DMD) | NVFP4 QAT + VSA sparsity 0,9 | Apache-2.0 | Preview en HuggingFace, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers (profesor) | ~1.300 M | Multiples pasos (denso) | BF16 | Apache-2.0 | Ampliamente disponible |
| CogVideoX-2B | ~2.000 M | Multiples pasos | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion |
| LTX-Video | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion |

La comparacion cuantitativa de calidad frente al profesor denso no puede realizarse: el autor no publica metricas y no se han encontrado evaluaciones independientes.

## Limitaciones y advertencias

- Checkpoint de preview: el propio autor lo etiqueta como material de inspeccion temprana, exportado en el paso final de una unica ejecucion DMD de 1000 pasos.
- Reproducibilidad condicionada: la numerica entrenada requiere los kernels VSA/QAT de FastVideo. Ejecutar los pesos con atencion y capas lineales densas en BF16 es una configuracion distinta y no probada, por lo que los resultados pueden diferir de los previstos.
- La atencion dispersa con sparsity 0,9 puede introducir artefactos de movimiento, perdida de detalle fino o inconsistencias temporales, especialmente en escenas con movimiento rapido o multiples objetos.
- Riesgo de alucinacion visual: como todo modelo generativo texto-a-video, puede producir fisica implausible, deformaciones anatomicas, texto ilegible y contenido no solicitado en el prompt.
- Sin resultados de benchmarks ni evaluacion humana publicada: no hay evidencia cuantitativa de calidad frente al profesor denso ni frente a alternativas.
- Sin informacion sobre composicion del dataset de destilacion, filtrado de datos ni evaluacion de sesgos (genero, etnia, cultura, representacion geografica).
- Idiomas soportados no declarados: se desconoce si los prompts funcionan correctamente fuera del ingles.
- Restricciones de resolucion y duracion: el contrato de muestreo fija 61 fotogramas a 896x448; se desconoce el comportamiento con otras resoluciones, relaciones de aspecto o duraciones.
- Sin filtros de seguridad documentados: no se menciona ninguna moderacion de prompts ni de video generado, lo que traslada al integrador la responsabilidad de filtrar contenido.
- Licencia Apache-2.0, compatible con uso comercial, pero conviene revisar tambien los terminos del modelo base Wan2.1-T2V-1.3B y de los componentes reutilizados (text encoder, VAE).
- Codigo de riesgo operativo: el repositorio incluye varias rutas de cuantizacion especifica de hardware; en GPU sin soporte FP4 el rendimiento puede degradarse notablemente.
- Adopcion nula: 0 descargas y 0 likes en HuggingFace implican que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/memset0/vsqa-preview-1.3b
- Checkpoint relacionado (vsqa-test-1.3b): https://huggingface.co/memset0/vsqa-test-1.3b
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Perfil de GitHub del autor: https://github.com/memset0
- Indice de benchmarks de modelos (referencia general): https://benchlm.ai/
- Leaderboard de referencia (referencia general): https://openlm.ai/chatbot-arena/
