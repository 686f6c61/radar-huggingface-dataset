# MuhammadNabeelSh/cephalometry-landmarks

## Resumen

CEPA29 es un modelo de deteccion de puntos cefalometricos (landmarks) basado en HRNet-W32, publicado por MuhammadNabeelSh en HuggingFace. Su funcion es localizar automaticamente 29 puntos anatomicos de referencia sobre radiografias cefalometricas laterales, una tarea previa habitual en ortodoncia y cirugia maxilofacial para el trazado y la medicion angular. El modelo se distribuye en formato ONNX, con una version FP32 y una version cuantizada a INT8 (QDQ estatico), lo que permite ejecucion en navegador mediante ONNX Runtime Web con backend WASM.

El modelo no es un modelo de lenguaje: es un detector de landmarks basado en vision por computador, con una entrada fija de 768x768x3 y una salida de 29 mapas de calor de 192x192. Se entrena sobre el conjunto Aariz Cephalometric Dataset (CEPHA29), con backbone HRNet-W32 preentrenado en ImageNet, y esta pensado para el auto-trazado dentro de la aplicacion Cephalometry Studio.

Su relevancia practica reside en la combinacion de tamano reducido (repo de 0,2 GB), licencia permisiva CC BY 4.0 y un rendimiento reportado de MRE 1,24 mm y SDR@2mm del 83,1% en el split de validacion, lo que lo hace util como componente de bajo coste para prototipos de investigacion y docencia en imagen medica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HRNet-W32 (backbone `hrnet_w32.ms_in1k`, ImageNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija 768x768x3) |
| Tipos de cuantizacion | FP32 y INT8 estatico QDQ |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`landmarks-cepha29.onnx`, `landmarks-cepha29.int8.onnx`) |

## Arquitectura y entrenamiento

El modelo emplea HRNet-W32, una red convolucional que mantiene representaciones de alta resolucion en paralelo a lo largo de toda la red mediante fusiones repetidas entre ramas de distinta escala. Esta caracteristica es la que justifica su uso en deteccion de landmarks, ya que preserva precision espacial en la localizacion de puntos. La salida es un tensor `[1,29,192,192]` con 29 mapas de calor, uno por cada landmark cefalometrico, y la entrada es una imagen RGB de 768x768x3.

El entrenamiento se realizo con el codigo de CephaloHRNet (licencia MIT) sobre el Aariz Cephalometric Dataset (CEPHA29), alojado en Figshare con DOI 10.6084/m9.figshare.27986417 y licencia CC BY 4.0, usando anotaciones promediadas. El backbone parte de pesos HRNet-W32 de ImageNet (Apache-2.0). No se detalla en la informacion disponible el numero de imagenes de entrenamiento, la composicion exacta del split, el numero de epocas, la funcion de perdida ni si se aplicaron tecnicas de aumento de datos mas alla de las propias del pipeline de CephaloHRNet. Tampoco se documenta ningun proceso de RLHF, DPO ni ajuste por preferencias, algo que no aplica a este tipo de modelo.

## Capacidades

- Deteccion de 29 landmarks cefalometricos sobre radiografias laterales, con orden de canales fijo: A, ANS, Ar, B, Co, Gn, Go, LIA, LIT, LMT, LPM, Li, Ls, Me, N, N`, Or, PNS, Pn, Po, Pog, Pog`, R, S, Sn, UIA, UIT, UMT, UPM.
- Salida en forma de mapas de calor, apta para extraer coordenadas mediante argmax o decodificacion subpixel.
- Inferencia en navegador mediante ONNX Runtime Web (WASM), lo que permite ejecucion local sin backend de servidor.
- Version INT8 con el mismo MRE reportado que la FP32, segun la model card, lo que facilita el despliegue en entornos con recursos limitados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto, por tratarse de un modelo puramente visual.
- No dispone de capacidades multilingues ni de procesamiento de audio o video.

## Casos de uso

- Auto-trazado en ortodoncia digital: el modelo recibe una radiografia cefalometrica lateral y devuelve las coordenadas de los 29 puntos de referencia, que el profesional revisa y corrige en un editor. Es adecuado porque el MRE de 1,24 mm esta en el rango de tolerancia clinica habitual para la fase de preanotacion.
- Preanotacion asistida en software de escritorio o web: integrado en Cephalometry Studio mediante ONNX Runtime Web, reduce el tiempo de marcado manual de decenas de puntos por imagen a una sola inferencia.
- Docencia en imagen medica: sirve como ejemplo reproducible de detector de landmarks con backbone HRNet, codigo de entrenamiento publico y dataset de licencia abierta, util para practicas de vision por computador.
- Investigacion en deteccion de puntos anatomicos: al estar disponible en ONNX con version FP32 e INT8, permite comparar el impacto de la cuantizacion estatica QDQ en la precision de localizacion sobre el mismo conjunto de validacion.
- Prototipado de pipelines de analisis cefalometrico: combinado con un modulo de calculo de angulos (SNA, SNB, ANB, etc.) a partir de los landmarks, permite construir un analisis completo sin depender de un servicio en la nube.
- Despliegue en entornos con conectividad limitada o requisitos de privacidad: la inferencia local en navegador con WASM evita enviar imagenes radiologicas a servidores externos, lo que simplifica el cumplimiento de requisitos de proteccion de datos en fases de evaluacion.
- Validacion cruzada de anotaciones: el modelo puede usarse como segundo anotador para detectar discrepancias con el trazado humano y priorizar la revision de casos dudosos.

## Benchmarks y rendimiento

Resultados reportados por el autor en el split de validacion (150 imagenes):

| Metrica | Valor |
|---|---|
| MRE (error radial medio) | 1,24 mm |
| SDR@2mm | 83,1% |
| SDR@3mm | 93,7% |
| SDR@4mm | 97,2% |

No se han publicado en la informacion disponible resultados comparativos con otros modelos de deteccion de landmarks cefalometricos, ni desglose por landmark individual, ni metricas por subconjunto de dificultad.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Por el tamano del repositorio (0,2 GB) y la arquitectura HRNet-W32 con entrada 768x768, la huella de memoria en FP32 es del orden de cientos de MB, pero no se han publicado cifras oficiales.
- GPU recomendadas: no disponible. El modelo esta disenado para ejecutarse en CPU via WASM en navegador, por lo que no requiere GPU dedicada.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna, dado el reducido tamano del modelo; no obstante, no se aportan requisitos minimos oficiales.
- Opciones de despliegue: ONNX Runtime Web (WASM) en navegador; ONNX Runtime nativo en CPU o GPU; cualquier runtime compatible con ONNX (por ejemplo, servidores de inferencia con soporte ONNX).
- Latencia y throughput: no disponibles. La model card no publica tiempos de inferencia ni metricas de rendimiento en el navegador.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos comparables de deteccion de landmarks cefalometricos (parametros, contexto, rendimiento, licencia y disponibilidad). Por tanto, la comparativa se considera no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CEPA29 (HRNet-W32) | no disponible | no aplica (entrada 768x768x3) | MRE 1,24 mm; SDR@2mm 83,1% | CC BY 4.0 | ONNX en HuggingFace |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor declara que el modelo es solo para investigacion y educacion y que no es un producto sanitario; no debe usarse para diagnostico ni tratamiento.
- El rendimiento se ha medido en un unico split de validacion de 150 imagenes del dataset CEPHA29; no hay evidencia de generalizacion a otros equipos de rayos X, protocolos de adquisicion, poblaciones o calidades de imagen distintas.
- No se documentan sesgos demograficos ni la composicion del dataset de entrenamiento (edad, sexo, etnia, procedencia), por lo que no es posible evaluar su equidad entre subpoblaciones.
- Riesgo de error en landmarks anatomicos dificiles de visualizar; el MRE de 1,24 mm es una media y puede ocultar errores mayores en puntos concretos. No se publica desglose por landmark.
- El orden de canales de salida es fijo y debe respetarse estrictamente; un mapeo incorrecto invalida las mediciones derivadas.
- La licencia CC BY 4.0 permite uso comercial con atribucion, pero el aviso del autor restringe el uso a investigacion y educacion; conviene revisar la compatibilidad con el uso previsto antes de integrarlo en un producto.
- Depende de la calidad y del preprocesado de la imagen de entrada (768x768x3); no se documentan en la informacion disponible los pasos exactos de normalizacion ni de redimensionado aplicados en entrenamiento.
- No hay garantias de mantenimiento, soporte ni actualizaciones del repositorio, que registra cero descargas y cero likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MuhammadNabeelSh/cephalometry-landmarks
- Dataset Aariz Cephalometric Dataset (CEPHA29), Figshare: DOI 10.6084/m9.figshare.27986417
- Codigo de entrenamiento CephaloHRNet (MIT): no disponible en la informacion proporcionada
- Backbone HRNet-W32 ImageNet (`hrnet_w32.ms_in1k`, Apache-2.0): no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible en la informacion proporcionada
