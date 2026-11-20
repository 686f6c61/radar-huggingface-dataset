# Jundot/GLM-5.3-Flash-oQ2e-mtp

## Resumen

GLM-5.3-Flash-oQ2e-mtp es una cuantizacion mixta en formato MLX del modelo zai-org/GLM-5.3-Flash, un modelo de mezcla de expertos (MoE) nativamente multimodal con 321.323 millones de parametros totales y 18.000 millones de parametros activos. Lo publica el usuario Jundot dentro del ecosistema oMLX, una herramienta de cuantizacion para Apple Silicon, y esta disenado para ejecutar un modelo de 320B en hardware con memoria unificada limitada mediante una asignacion agresiva de bits por capa.

La relevancia de esta ficha radica en que comprime el checkpoint completo (backbone de lenguaje, codificador de vision y cabeza de prediccion multi-token) hasta 102,725 GiB con un promedio efectivo de 2,746 bits por peso, manteniendo el backbone en 2,677 bits por peso. La actualizacion del 19 de noviembre de 2026 re-cuantiza el modelo con el redondeo oQe refinado de oMLX 0.8.0, que reduce el error de cuantizacion sin cambiar el tamano ni la velocidad.

El modelo base combina atencion dispersa y lineal con Manifold-Constrained Hyper-Connections (mHC), lo que lo situa en la categoria de modelos multimodales de gran escala con arquitectura hibrida. La licencia MIT, heredada del modelo fuente, facilita su uso comercial, si bien la cuantizacion a 2 bits introduce degradaciones que conviene evaluar antes de desplegarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal con atencion dispersa y lineal y Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 321.323.031.390 (321,323B) |
| Parametros activos | 18B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ2e mixta: affine 2-bit grupo 64, affine 4-bit grupo 64, affine 8-bit grupo 64, BF16 y FP32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 110,3 GB en repositorio |
| Bits efectivos por peso | 2,677 (backbone de lenguaje), 2,746 (checkpoint completo) |
| Componentes incluidos | Backbone de lenguaje (313,327B), codificador de vision (0,564B), cabeza MTP (7,433B) |
| Libreria | mlx |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base es un MoE nativamente multimodal que combina atencion dispersa y lineal con Manifold-Constrained Hyper-Connections (mHC). Con 321.323B de parametros totales y 18B activos, la relacion de activacion es de aproximadamente el 5,6 %, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano. La cabeza de prediccion multi-token (MTP) anade 7,433B de parametros y habilita decodificacion especulativa interna, un mecanismo que puede acelerar la generacion al predecir varios tokens por paso.

La cuantizacion oQ2e de oMLX 0.8.0 asigna bits segun la sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y un reajuste ponderado por minimos cuadrados de escala y sesgo. La distribucion resultante concentra el 94,735 % de los pesos logicos (304,406B) en affine 2-bit, el 2,256 % (7,248B) en affine 4-bit, el 2,793 % (8,976B) en affine 8-bit, el 0,189 % (0,607B) en BF16 y el 0,027 % (0,086B) en FP32. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), con codificador de vision de 0,564B de parametros.
- Prediccion multi-token (MTP) para decodificacion especulativa y generacion acelerada.
- Capacidades multilingues: no disponible el detalle de idiomas soportados.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon de gran memoria: el checkpoint de 102,725 GiB permite ejecutar un modelo de 320B en equipos Mac con memoria unificada de 128 GB o superior mediante MLX, algo inviable con pesos en BF16.
- Asistentes multimodales de escritorio: la combinacion de codificador de vision y backbone de lenguaje permite construir aplicaciones que describan imagenes, respondan preguntas sobre capturas de pantalla o extraigan informacion de documentos escaneados sin conexion a la nube.
- Prototipado e investigacion en entornos con recursos limitados: investigadores que necesiten evaluar el comportamiento de GLM-5.3-Flash antes de comprometer hardware de centro de datos pueden usar esta version para pruebas de concepto y analisis cualitativo.
- Generacion de texto asistida por imagen en flujos editoriales: el pipeline image-text-to-text admite tareas de alt-text, resumen de figuras y descripcion de diagramas tecnicos en lotes locales.
- Decodificacion especulativa con MTP: la cabeza multi-token incluida permite experimentar con tecnicas de aceleracion de inferencia sobre MLX sin necesidad de un modelo borrador separado.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la perdida de calidad de oQ2e frente al checkpoint original en tareas de razonamiento y vision, dado que el autor documenta la metodologia de asignacion de bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 102,725 GiB para los pesos en formato MLX; se recomienda al menos 128 GB de memoria unificada para dejar margen a la cache KV y a las activaciones.
- GPU recomendadas: Apple Silicon con memoria unificada de 128 GB o superior (por ejemplo, Mac Studio con M3 Ultra o M4 Ultra); no es compatible con CUDA de forma nativa al estar en formato MLX.
- Cabe en GPU de consumo: no en tarjetas con 24 GB o 48 GB; requiere equipos Apple de gama alta o multiples aceleradores con memoria agregada.
- Opciones de despliegue: MLX y oMLX para Apple Silicon; vLLM, llama.cpp, Ollama y TGI no soportan este formato de cuantizacion oQ2e de forma directa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-oQ2e-mtp | 321,323B | 18B | no disponible | oQ2e mixta (2,746 bits/peso) | MIT | safetensors MLX |
| zai-org/GLM-5.3-Flash (base) | 321,323B | 18B | no disponible | BF16 original | MIT | safetensors |
| Alternativas de 300B+ en MLX | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros modelos de la misma categoria no esta disponible en la informacion proporcionada. La referencia mas inmediata es el checkpoint original zai-org/GLM-5.3-Flash, del que esta version reduce el almacenamiento de pesos de forma sustancial a costa de precision numerica.

## Limitaciones y advertencias

- La cuantizacion a 2 bits en el 94,735 % de los pesos logicos degrada la fidelidad numerica; el propio autor indica que el redondeo oQe refinado reduce el error, lo que implica que versiones anteriores tenian mayor desviacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero previsible en un modelo de lenguaje de gran escala sometido a cuantizacion agresiva.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar el rendimiento en castellano sin evaluacion previa.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas largas.
- Restricciones de licencia: MIT, heredada del modelo fuente, permite uso comercial; conviene revisar el archivo LICENSE del repositorio y las condiciones del modelo base.
- Compatibilidad: el formato MLX y la cuantizacion oQ2e limitan el despliegue a Apple Silicon y a la herramienta oMLX; no hay soporte documentado en vLLM, TGI ni llama.cpp.
- Requisito de memoria elevado: 102,725 GiB de pesos mas cache KV exigen hardware de gama alta, lo que descarta su uso en estaciones de trabajo convencionales.
- Actualizacion obligatoria: el autor recomienda volver a descargar si se tenia una copia anterior al 19 de noviembre de 2026, ya que el checkpoint cambio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/GLM-5.3-Flash-oQ2e-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio oMLX: https://github.com/jundot/omlx
- Pull request de mejora oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
