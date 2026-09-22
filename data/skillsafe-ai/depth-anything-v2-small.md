# skillsafe-ai/depth-anything-v2-small

## Resumen

skillsafe-ai/depth-anything-v2-small es un paquete de artefactos ONNX listos para navegador del modelo de estimación de profundidad monocular Depth Anything V2 Small. Lo publica el usuario skillsafe-ai como import reproducible (sin reconversion) del repositorio onnx-community/depth-anything-v2-small, fijado al commit 4472b7362082ad9968fee890ca0f1e5aca36b93d y verificado byte a byte mediante SHA-256. El problema que resuelve es práctico: permite ejecutar estimación de profundidad densa desde una sola imagen directamente en el navegador con onnxruntime-web (WebGPU o WASM), sin backend ni GPU en servidor.

El modelo original procede de Depth Anything V2 Small, desarrollado por Lihe Yang et al. (HKU / TikTok), publicado bajo licencia Apache-2.0 y con arquitectura de codificador visual tipo transformer (backbone DINOv2 ViT-S) más un decodificador denso tipo DPT. El repositorio no declara el número de parámetros, pero el tamaño de los pesos (94,47 MB en fp32, 47,34 MB en fp16, 26,00 MB en int8) es coherente con un modelo del orden de decenas de millones de parámetros.

Su relevancia actual es doble. Por un lado, cubre un caso de uso emergente: percepción visual en el propio dispositivo (edge y navegador) para aplicaciones web interactivas. Por otro, el repositorio aporta una cadena de procedencia verificable (receta con hash, toolchain con uv.lock, comprobación onnx.checker y smoke test con onnxruntime), algo poco habitual en artefactos ONNX de terceros y útil en entornos donde se exige trazabilidad de dependencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision para profundidad monocular (Depth Anything V2 Small; codificador DINOv2 ViT-S + decodificador denso DPT) |
| Parametros totales | no disponible en la informacion del repositorio (pesos de 94,47 MB en fp32; el paper upstream cifra Depth Anything V2 Small en torno a 24,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de imagen 518x518 declarada en el contrato ONNX) |
| Tipos de cuantizacion | fp32 (model.onnx), fp16 (model_fp16.onnx) e int8 cuantizado (model_quantized.onnx) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la entrada es una imagen) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 14); repo de 0,2 GB; libreria declarada: transformers.js |

Datos adicionales de contrato y archivos:

| Archivo | Clase | Tamano | SHA-256 |
|---|---|---|---|
| config.json | bundle | 0,00 MB | 3aee5b9bc4f711ee885c2526d871f0c8c6c8c4b26b8e04253d0167f6a83264f5 |
| onnx/model.onnx | registry | 94,47 MB | afb6a5c28f3b6bf1618c6e43f02073ef9dfdc70e937502d51603e57b0a1df10c |
| onnx/model_fp16.onnx | registry | 47,34 MB | 2df6223f206b5164e21f664ace61dabeb9bb6a49b8b5a3e00510b4807d0f5b04 |
| onnx/model_quantized.onnx | registry | 26,00 MB | fcf51f1b230362b28690bb9d1809bf0431f29cad20534e3f589bd7285547f20d |
| preprocessor_config.json | bundle | 0,00 MB | 03576db3c13dd0471fdf5f5e1428befcb95de063fe699879150b293dc9e0a2c6 |

## Arquitectura y entrenamiento

La informacion proporcionada describe el modelo como un artefacto de import para la tarea depth-estimation, derivado de Depth Anything V2 Small, cuya autoria se atribuye a Lihe Yang et al. (HKU / TikTok). El contrato ONNX confirma la interfaz: entrada pixel_values de tipo float32 con forma ['batch_size', 3, 'height', 'width'] y salida predicted_depth float32 con forma ['floor(1.0*batch_size)', '14*floor(height/14)', '14*floor(width/14)']. El factor 14 en la forma de salida es la firma habitual de los parches de un backbone ViT, y el modelo se valido con entradas de forma [1, 3, 518, 518] produciendo [1, 518, 518]. El opset declarado es 14.

El repositorio no documenta el dataset de entrenamiento, el numero de tokens o imagenes, ni si hubo fases de ajuste tipo RLHF o DPO (no aplicables en sentido estricto a un modelo de vision). Tampoco aporta detalles sobre innovaciones de decodificacion o atencion. Lo que si documenta con detalle es la cadena de conversion: el artefacto se importo tal cual desde el upstream onnx-community/depth-anything-v2-small, con toolchain Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64, receta recipes/depth-anything-v2-small.yaml (sha256 f243268eb921e74d01f0623d06ad1d74435cd52d325fdf2de3745b60961f0757) y fecha de conversion 2026-09-22T20:41:12+00:00. Cada archivo ONNX paso onnx.checker y una prueba de humo en CPU con onnxruntime usando entradas rellenas de ceros.

## Capacidades

- Estimacion de profundidad monocular densa: dada una imagen RGB, devuelve un mapa predicted_depth con la misma resolucion espacial que la entrada (en la forma declarada, 518x518).
- Inferencia en navegador: el modelo esta pensado para onnxruntime-web con executionProviders ["webgpu", "wasm"], es decir, ejecucion cliente-side sin servidor de inferencia.
- Compatibilidad con el ecosistema transformers.js: el repositorio declara esa libreria como interfaz de uso.
- Tres variantes de precision intercambiables (fp32, fp16, int8) que permiten ajustar el equilibrio entre calidad, tamano de descarga y velocidad.
- Procesamiento por lotes teoricamente posible: la dimension de lote es dinamica en el contrato ('batch_size' en la entrada, floor(1.0*batch_size) en la salida), aunque la verificacion se hizo con lote 1.
- Resoluciones distintas de 518x518 admitidas por el contrato siempre que se respete el redondeo a multiplos de 14 en la salida.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, generacion de texto, codigo, matematicas ni audio: es exclusivamente un modelo de vision para profundidad.
- Capacidades multilingues: no aplica.

## Casos de uso

- Efectos de desenfoque de fondo en el navegador (retrato o videollamada): el mapa de profundidad permite separar primer plano y fondo en tiempo real sin subir el fotograma a un servidor, algo relevante por privacidad y por coste de ancho de banda.
- Realidad aumentada web: colocar objetos virtuales sobre una escena capturada por la camara del movil usando la profundidad estimada para ocluir correctamente lo que queda detras de objetos reales.
- Reconstruccion 3D aproximada y generacion de mallas: a partir de la profundidad densa por fotograma se puede construir una nube de puntos ligera para visores 3D o para prototipos de gemelos digitales sin escaneo dedicado.
- Accesibilidad: generar descripciones de distancia relativa de una escena para aplicaciones asistivas (por ejemplo, indicar que un obstaculo esta mas cerca o mas lejos), combinado con otros modelos de descripcion.
- Preprocesado en pipelines de vision por computadora: usar el mapa de profundidad como canal adicional de entrada en segmentacion, deteccion o matting, ejecutado en el cliente para reducir coste de GPU en servidor.
- Herramientas creativas de edicion fotografica: seleccion de sujeto, profundidad de campo sintetica y correccion atmosferica sobre imagenes subidas por el usuario, con todo el calculo en el navegador.
- Control de calidad en demos y prototipos: cuantizar a int8 (26,00 MB) permite publicar una demo funcional en una pagina web con un coste de descarga muy bajo (0,2 GB de repositorio completo, pero cada variante se descarga por separado).
- Verificacion de integridad en entornos regulados: la cadena de SHA-256 y la receta con hash permiten auditar que el binario ejecutado corresponde exactamente con una fuente fijada.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks de calidad (absrel, delta1, RMSE sobre NYUv2, KITTI, etc.). La busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo: los resultados obtenidos fueron dominios de proxy web y sitios para adultos, sin ninguna relacion con Depth Anything ni con estimacion de profundidad.

Lo unico medible que se aporta son los tiempos de la prueba de humo en CPU con onnxruntime sobre Darwin arm64, con entradas de ceros y forma [1, 3, 518, 518]:

| Archivo | Entrada | Salida | Tiempo (ms) |
|---|---|---|---|
| onnx/model.onnx | pixel_values[1, 3, 518, 518] | predicted_depth[1, 518, 518] | 121,6 |
| onnx/model_fp16.onnx | pixel_values[1, 3, 518, 518] | predicted_depth[1, 518, 518] | 157,7 |
| onnx/model_quantized.onnx | pixel_values[1, 3, 518, 518] | predicted_depth[1, 518, 518] | 106,7 |

Advertencia: son tiempos de una unica ejecucion de humo con tensor de ceros, no una medicion de throughput representativa. Resulta llamativo que la variante fp16 sea mas lenta que fp32 en esa prueba, lo que sugiere que la ruta fp16 no esta optimizada en ese backend de CPU concreto. No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (orientativa, calculada a partir del tamano de los pesos mas el espacio de activaciones; no confirmada por el autor): en torno a 1-1,5 GB en fp32 (94,47 MB de pesos), 0,6-1 GB en fp16 (47,34 MB) y 0,4-0,8 GB en int8 (26,00 MB). Son cifras muy por debajo de las de un modelo de lenguaje tipico.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o mas (RTX 3050, RTX 4060, GTX 1660, etc.), e incluso en GPUs integradas compatibles con WebGPU.
- GPU de centro de datos (A100, H100, L40S) no estan justificadas para este modelo salvo en escenarios de procesamiento masivo por lotes; el cuello de botella seria el preprocesado de imagenes, no la red.
- En CPU es perfectamente viable: las variantes de 26-94 MB se ejecutan en decenas o centenares de milisegundos por imagen en hardware moderno (referencia: 106,7 ms en la variante int8 sobre Darwin arm64).
- Opciones de despliegue: onnxruntime-web (WebGPU o WASM) en navegador, segun el propio ejemplo de la model card; ONNX Runtime nativo en servidor o escritorio; transformers.js como capa de integracion web. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: solo se dispone de los tiempos de la prueba de humo (106,7-157,7 ms por imagen con lote 1 en CPU arm64). No hay datos de latencia en WebGPU, ni de throughput con lotes mayores, ni comparativas entre backends.

## Comparativa con modelos similares

Los datos de parametros de los modelos comparados no figuran en la informacion proporcionada; se indican como no disponibles, salvo la referencia al paper upstream. La comparativa se limita a categoria, licencia y disponibilidad, que si son verificables.

| Modelo | Parametros | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|
| skillsafe-ai/depth-anything-v2-small (esta ficha) | no disponible (pesos de 26-94 MB; el upstream se cifra en torno a 24,8 M) | ONNX fp32/fp16/int8, navegador via onnxruntime-web | Apache-2.0 | HuggingFace, repo de 0,2 GB, 0 descargas y 0 likes en el momento de la consulta |
| Depth Anything V2 Base (misma familia, mismo autor upstream) | no disponible en la informacion facilitada | pesos PyTorch en el repositorio oficial; versiones ONNX por onnx-community | Apache-2.0 | HuggingFace / GitHub oficial |
| Depth Anything V2 Large (misma familia) | no disponible en la informacion facilitada | pesos PyTorch en el repositorio oficial; versiones ONNX por onnx-community | Apache-2.0 | HuggingFace / GitHub oficial |
| Depth Anything V1 y MiDaS (lineas predecesoras) | no disponible | PyTorch, distintos formatos de exportacion | Apache-2.0 / MIT segun variante | HuggingFace / GitHub oficial |

Criterio de eleccion orientativo (sin datos de calidad que lo respalden): la variante Small es la adecuada cuando el presupuesto de descarga y de computo en el cliente es el factor limitante; las variantes Base y Large tienen sentido cuando la precision geometrica importa mas que el coste y la inferencia puede hacerse en servidor.

## Limitaciones y advertencias

- Se trata de un artefacto derivado, no del modelo original: el autor del repo (skillsafe-ai) no es el autor de los pesos, y el soporte o las actualizaciones dependen del upstream onnx-community/depth-anything-v2-small y, en ultima instancia, de Depth Anything V2.
- Trazabilidad de uso muy baja: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-09-22). No hay historial de uso en produccion ni incidencias reportadas.
- Inexistencia de datos de calidad: no hay metricas de error de profundidad publicadas para este artefacto, solo comprobaciones de forma y tiempo de ejecucion. No se puede asumir que la salida cuantizada int8 conserve la fidelidad de la fp32.
- Profundidad relativa, no metrica: Depth Anything V2 Small produce un mapa de profundidad relativa; no debe usarse para mediciones absolutas en metros sin calibracion externa (el propio proyecto upstream mantiene una linea separada para profundidad metrica).
- Riesgo de fallo fuera de distribucion: escenas con superficies reflectantes, transparentes, texturas repetitivas, iluminacion extrema o geometria muy diferente a la de los datos de entrenamiento pueden producir mapas inconsistentes. La model card no documenta la composicion del dataset ni sesgos conocidos.
- Riesgo de alucinacion estructural: como todo modelo generativo de profundidad, puede inventar detalle geometrico donde la imagen no aporta evidencia suficiente, especialmente en regiones planas o muy oscuras.
- Restricciones de forma: el contrato exige entradas con dimensiones compatibles; la salida se redondea a multiplos de 14, por lo que resoluciones arbitrarias se recortan y pueden desalinearse con la imagen original si no se gestiona el preprocesado.
- Licencia: Apache-2.0, que permite uso comercial, pero obliga a conservar el aviso de licencia y la atribucion a Lihe Yang et al. (HKU / TikTok) y al exportador onnx-community. La receta de conversion y la model card son propiedad del repositorio SkillSafe y se rigen por su propia licencia, distinta de la de los pesos.
- Advertencia sobre el contexto de busqueda: los resultados web recuperados para esta ficha no guardan ninguna relacion con el modelo (dominios de proxy y sitios para adultos), por lo que no aportan informacion fiable y se han descartado por completo.
- No apto para usos de seguridad critica (navegacion autonoma, robotica colaborativa, dispositivos medicos) sin validacion independiente y sin una fuente de profundidad metrica calibrada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/skillsafe-ai/depth-anything-v2-small
- Modelo base (upstream ONNX): https://huggingface.co/onnx-community/depth-anything-v2-small
- Commit upstream fijado: https://huggingface.co/onnx-community/depth-anything-v2-small/tree/4472b7362082ad9968fee890ca0f1e5aca36b93d
- Repositorio oficial de Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
- Licencia Apache-2.0 del proyecto upstream: https://github.com/DepthAnything/Depth-Anything-V2/blob/main/LICENSE
- Recetas de conversion de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Paper de Depth Anything V2 (Lihe Yang et al.): https://arxiv.org/abs/2406.09414
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
