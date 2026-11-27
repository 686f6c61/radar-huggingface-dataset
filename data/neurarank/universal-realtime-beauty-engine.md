# neurarank/universal-realtime-beauty-engine

## Resumen

Universal Realtime Beauty Engine V2 es un motor de vision por computador orientado a la belleza facial en tiempo real, publicado por neurarank bajo licencia Apache 2.0. No es un modelo generativo de lenguaje ni un transformer multimodal al uso: es un motor de procesamiento de imagen a imagen (pipeline `image-to-image`) disenado para interceptar el flujo de camara en directo y aplicar efectos de embellecimiento (blanqueamiento dental, suavizado de piel, tinte de labios, colorete y realce de ojos y cejas) sobre rostros detectados.

La propuesta tecnica se apoya en una arquitectura "Landmark-First" con fusion adaptativa de mascaras: en lugar de una red monolitica de segmentacion semantica pesada, descompone la cara en regiones (dientes, piel, labios, mejillas, ojos, cejas) y genera una mascara de probabilidad suavizada por region, controlada por un motor de confianza compartido. El modelo neuronal interno es un estudiante destilado a partir de un profesor mas profundo, con 188.779 parametros y un tamano de 412 KB (una sola cabeza) o 756 KB (multiples cabezas), lo que lo hace apto para despliegue embebido y movil.

El interes actual reside en su enfoque de eficiencia extrema: reduce parametros 6,2 veces respecto al profesor, logra latencias de 1,19 ms en CPU ONNX y esta pensado para ejecutarse con ONNX Runtime en moviles (CoreML, NNAPI) y escritorio (CPU, CUDA). Es una pieza de infraestructura para aplicaciones de camara (videollamadas, redes sociales, retoque en vivo), no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Estudiante destilado (knowledge distillation) con encoder ligero y descomposicion de mascaras por region facial; pipeline image-to-image |
| Parametros totales | 188.779 (modelo estudiante interno) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de parches faciales de 128x128) |
| Tipos de cuantizacion | No disponible (se distribuye como ONNX; el autor no detalla esquemas de cuantizacion) |
| Idiomas soportados | Ingles (en) y vietnamita (vi), segun metadatos; el modelo procesa imagen, no texto |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (runtime principal); el titulo menciona tambien PyTorch |

## Arquitectura y entrenamiento

El motor combina un componente neuronal ligero (el estudiante) con un pipeline clasico de vision. El estudiante se entrena por destilacion de conocimiento a partir de un "Teacher" externo de 1.173.216 parametros y 4,7 MB, del que hereda representaciones profundas pero con 6,2 veces menos parametros. La inferencia neuronal opera sobre parches faciales recortados de 128x128 en RGB float32 y produce mascaras de probabilidad por region con forma (1, 1, 128, 128). Sobre esas mascaras se aplica una fusion adaptativa con suavizado (soft-feathering) y un motor de confianza compartido que pondera cada region.

La arquitectura "Landmark-First" implica que el pipeline detecta primero puntos faciales (facial landmarks) y ancla las mascaras a esa geometria, lo que permite atenuacion dinamica segun la pose 3D de la cabeza (relevante para el colorete en las mejillas y el realce de ojos). El procesamiento de imagen se organiza en multiples regiones con posible ejecucion en GPU. El autor no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset; tampoco especifica si hubo RLHF/DPO (no aplica en vision) ni innovaciones como decodificacion especulativa. La innovacion destacable es la propia destilacion a un binario de menos de 1 MB con latencia sub-milisegundo en CPU ONNX.

## Capacidades

- Blanqueamiento dental: aclarado de esmalte y neutralizacion del croma amarillo en espacio Lab, con proteccion de brillos especulares y de las grietas dentales.
- Suavizado de piel: separacion de frecuencias en dos capas que preserva poros finos y contornos faciales mientras elimina imperfecciones.
- Realce de labios: tintado parametrico de color, control de saturacion y brillo, con preservacion natural de las arrugas labiales.
- Colorete: campos radiales anclados anatomicamente en la region malar, con atenuacion dinamica segun la pose 3D de la cabeza.
- Ojos y cejas: aclarado de esclera, mejora de contraste del iris, proteccion de la pupila y densidad del arco de la ceja.
- Control en tiempo de ejecucion mediante payload JSON (versionado) que modula cada efecto sin recargar el modelo.
- Inferencia en tiempo real: 30 FPS en la demo del autor; objetivo de 60 FPS en moviles de gama alta.
- Despliegue multiplataforma via ONNX Runtime (CPU, CUDA, CoreML, NNAPI).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente de vision.

## Casos de uso

- Filtros de belleza en videollamadas y apps de mensajeria: el motor intercepta el flujo de camara y aplica mascaras por region con latencias de 1,19 ms en CPU ONNX, lo que permite mantener 30-60 FPS sin penalizar la videollamada.
- Retoque en vivo en redes sociales: integracion del payload JSON para que el usuario ajuste suavidad de piel, color de labios o intensidad de colorete en tiempo real, con cambios instantaneos y sin recargar el modelo.
- Aplicaciones moviles de fotografia y selfies: el binario de 412-756 KB se empaqueta en apps iOS/Android y se ejecuta con CoreML o NNAPI en dispositivos de gama media (Snapdragon 665, iPhone 7) a 30 FPS en 720p.
- Previsualizacion de maquillaje o cosmeticos: el tinte parametrico de labios y el colorete anclado a landmarks permiten simular productos cosmeticos sobre el rostro del usuario en un espejo digital.
- Herramientas de creacion de contenido para streamers: efecto de embellecimiento en directo con preservacion de textura (texturePreservation configurable) para evitar el aspecto plastico.
- Sistemas de captura para kioscos o cabinas fotograficas: procesamiento en escritorio con GPU (RTX 3060+ o Apple Silicon) a 60 FPS en 1080p, con perfiles de calidad ajustables.
- Procesamiento por lotes de imagenes de retrato: uso del pipeline image-to-image en servidor para aplicar el mismo esquema de mascaras a lotes de fotografias con configuracion fija.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Metrica | Teacher externo | Student (este modelo) | Beneficio |
|---|---|---|---|
| Parametros | 1.173.216 | 188.779 | Reduccion 6,2x |
| Tamano del modelo | 4,7 MB | 412 KB (una cabeza) / 756 KB (multiples cabezas) | Binario embebido ultraligero |
| Latencia CPU ONNX | 3,85 ms | 1,19 ms | Inferencia sub-milisegundo |
| Memoria RSS | ~850 MB | 440 MB | Sin fugas entre frames |

Latencia extremo a extremo por resolucion (Mac Apple Silicon / CoreML EP):

| Resolucion | Dimensiones | Latencia medida | Throughput | Proyeccion en GPU movil |
|---|---|---|---|---|
| 480p SD | 480x854 | 51,55 ms | 19,4 FPS | 60 FPS (<10 ms) |
| 720p HD | 720x1280 | 108,07 ms | 9,3 FPS | 60 FPS (<16 ms) |
| 1080p FHD | 1080x1920 | 223,02 ms | 4,5 FPS | 35 FPS (<28 ms) |

No se han publicado resultados de benchmarks estandar de vision (mIoU, FID, PSNR) en la informacion disponible; las cifras anteriores son de latencia y rendimiento del pipeline, no de calidad perceptiva.

## Requisitos de hardware

- VRAM/RAM estimada: el modelo pesa 412-756 KB; el consumo de memoria RSS medido es de ~440 MB en el pipeline completo, muy por debajo de los ~850 MB del teacher.
- Escritorio minimo: CPU Intel Core i5 8a gen o AMD Ryzen 5, 4 GB de RAM disponible, GPU integrada Intel UHD 620+ o NVIDIA GTX 1050+, ONNX Runtime con CPUExecutionProvider o CUDAExecutionProvider.
- Escritorio recomendado: Apple Silicon (M1/M2/M3/M4) o Intel Core i7 12a gen+, 8 GB+ de RAM, GPU Apple Metal o NVIDIA RTX 3060+, objetivo de 60 FPS en 1080p.
- Movil minimo (30 FPS en 720p): iPhone 7/8/X (A10/A11 Fusion, iOS 13+) o Android Snapdragon 665 / Helio G80+, 3 GB de RAM, Android 9+ (API 28), ONNX Runtime Mobile con CPUExecutionProvider.
- Movil recomendado (60 FPS en 720p): iPhone 12-16 (A14+ Bionic, iOS 15+) o Snapdragon 888 / 8 Gen 1 / Dimensity 9000+, 6 GB de RAM, Android 11+, con CoreMLExecutionProvider (iOS) o NNAPIExecutionProvider (Android).
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna; el cuello de botella es el pipeline de imagen (resolucion), no el modelo neuronal.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, CoreML, NNAPI) y, segun el titulo, PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a vision).
- Latencia y throughput: 1,19 ms de inferencia neuronal en CPU ONNX; 19,4 FPS en 480p y 4,5 FPS en 1080p en Mac Apple Silicon con CoreML; proyeccion de 60 FPS en GPU movil para 480p y 720p.

## Comparativa con modelos similares

No se han publicado comparativas con modelos alternativos en la informacion disponible. Como referencia cualitativa, este motor se situaria frente a soluciones de embellecimiento en tiempo real basadas en segmentacion facial pesada (mayor coste termico en movil) o frente a filtros clasicos sin red neuronal (menor calidad de mascara). No hay datos de parametros, contexto ni rendimiento de esos competidores en la informacion proporcionada, por lo que no se ofrece tabla comparativa.

## Limitaciones y advertencias

- Es un modelo de vision especializado en rostros; no procesa texto, no razona y no soporta tool calling ni agentes.
- Los idiomas declarados (en, vi) son metadatos de la model card; el modelo procesa imagen y no tiene capacidades linguisticas reales.
- Riesgo de artefactos en condiciones de iluminacion adversas, oclusiones (gafas, mascarillas, manos) o poses extremas; el pipeline depende de la deteccion previa de landmarks, cuyo fallo degrada las mascaras.
- El suavizado de piel puede eliminar detalle si se sube `smoothness` y se baja `texturePreservation`; el autor expone parametros para mitigarlo, pero no publica evaluaciones perceptivas.
- No hay datos publicados sobre sesgos por tono de piel, genero o edad; en un motor de belleza esto es un riesgo relevante para produccion y requiere evaluacion propia.
- Las cifras de latencia son medidas por el autor en Mac Apple Silicon; las proyecciones de 60 FPS en movil no estan verificadas de forma independiente.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion; no hay restricciones adicionales declaradas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (27-11-2026): madurez y soporte comunitario no contrastados.
- El tamano del repo reportado es 0.0 GB, lo que sugiere que los pesos pueden no estar subidos o que el conteo no refleja los assets; conviene verificar la disponibilidad real de los ficheros antes de integrar.

## Enlaces

- Hugging Face: https://huggingface.co/neurarank/universal-realtime-beauty-engine
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales fuera de la model card del autor.
