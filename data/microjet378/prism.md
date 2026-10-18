# microjet378/PRISM

## Resumen

PRISM es un modelo de reconstruccion 3D a partir de una sola imagen, presentado por el autor microjet378 como "Feed-Forward Single-Image 3D Reconstruction via Geometric Warp-Residual Modeling". A diferencia de los modelos de lenguaje, no procesa texto: su entrada es una imagen RGB y su salida es una representacion 3D en forma de Gaussian splats (3DGS), lo que lo situa en la familia de los reconstructores feed-forward tipo LRM/TripoSR.

El repositorio de HuggingFace contiene unicamente `prism_stage2.pt`, el codificador de residuos, con 26 millones de parametros. El decodificador 3DGS es un componente congelado que se descarga por separado desde NVIDIA bajo su propia licencia, de modo que el modelo publicado aqui no es autonomo: sin ese decodificador no se puede ejecutar la inferencia completa.

Su relevancia practica esta en el enfoque de "warp-residual": el modelo no predice la geometria desde cero, sino que modela el residuo respecto a una deformacion geometrica (warp) previa, lo que en principio reduce la carga del aprendizaje. El repo ocupa 0,1 GB y los pesos se distribuyen bajo licencia Apache 2.0, aunque el pipeline de HuggingFace no esta definido y no hay descargas ni valoraciones registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Feed-forward de reconstruccion 3D de una sola imagen con modelado de warp-residual geometrico; decodificador 3D Gaussian Splatting (3DGS) congelado |
| Parametros totales | 26 M (solo el codificador de residuos, `prism_stage2.pt`); el decodificador 3DGS es una descarga aparte y su recuento no esta disponible |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: modelo de vision 3D, no procesa texto; no disponible en terminos de tokens |
| Tipos de cuantizacion | No disponible (los pesos se publican como `.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible / no aplica (no es un modelo linguistico) |
| Licencia | Apache 2.0 para los pesos del codificador; el decodificador 3DGS se rige por la licencia de modelo de NVIDIA |
| Formato de pesos | PyTorch (`prism_stage2.pt`); no se publican safetensors ni GGUF |
| Tarea | Reconstruccion 3D y sintesis de vistas noveles (novel-view synthesis) |
| Entrada / salida | Imagen RGB unica / Gaussian splats 3D |
| Tamano del repositorio | 0,1 GB |
| Pipeline en HuggingFace | No definido |

## Arquitectura y entrenamiento

La arquitectura se describe como un reconstructor feed-forward que combina un codificador de residuos con un decodificador 3DGS congelado. El planteamiento central es el "geometric warp-residual modeling": en lugar de regresar directamente los parametros de las gaussianas, el sistema parte de una deformacion geometrica (warp) y el codificador de 26 M de parametros aprende a predecir el residuo sobre esa base. Esto concentra la capacidad aprendida en la correccion de una hipotesis geometrica inicial, no en la geometria completa, y explica que el modelo publicado pueda ser tan pequeno en comparacion con los reconstructores monoliticos.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el tipo de supervisión (renderizado diferenciable, perdidas de fotoconsistencia, datos multivista sinteticos o reales) ni si hubo etapas de ajuste tipo RLHF/DPO, que en este dominio no aplican. Tampoco se detalla la innovacion de atencion o de muestreo, mas alla del citado esquema warp-residual. El nombre del checkpoint (`stage2`) sugiere un entrenamiento por etapas, pero el contenido de la etapa 1 no se documenta.

## Capacidades

- Reconstruccion 3D de un objeto o escena a partir de una unica imagen RGB, en una sola pasada hacia delante (sin optimizacion por escena).
- Representacion de salida mediante Gaussian splats, renderizable en tiempo real con los rasterizadores 3DGS habituales.
- Sintesis de vistas noveles: generacion de imagenes desde angulos de camara no observados en la entrada.
- Modelado de residuo geometrico sobre una deformacion warp previa, lo que permite correcciones locales de forma.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje ni un agente.
- No dispone de capacidades multilingues, vision semantica (VQA, OCR, deteccion) ni audio.
- No se documenta un modo "thinking" ni ninguna capacidad de edicion 3D interactiva posterior a la reconstruccion.

## Casos de uso

- Digitalizacion de producto para comercio electronico: a partir de una foto de catalogo, generar un activo 3D con splats que pueda renderizarse en un visor web y rotarse 360 grados, evitando el coste de un escaneo fotogrametrico completo.
- Generacion de assets para videojuegos y prototipado: producir una malla/splat aproximada de un prop desde un concepto 2D para bloquear escenas antes del modelado final por un artista.
- Realidad aumentada en movil: el formato de Gaussian splats permite renderizado rapido de objetos reconstruidos sobre camara en vivo, util para probadores virtuales de mobiliario o calzado.
- Datasets sinteticos para vision artificial: reconstruir objetos cotidianos desde una sola imagen y renderizar vistas noveles para aumentar datos de entrenamiento de detectores o estimadores de pose.
- Robotica y manipulacion: obtener una hipotesis geometrica rapida de un objeto visto por una camara monocular para planificacion de agarre o comprobacion de colision, aceptando baja fidelidad a cambio de latencia.
- Postproduccion audiovisual: generar vistas adicionales de un elemento de escena a partir de un fotograma, como apoyo a tareas de cleanup o de planeamiento de VFX.
- Patrimonio y documentacion: captura rapida de piezas en condiciones de campo donde no es viable un rig multivista, con la reconstruccion como borrador previo a un escaneo de alta fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de reconstruccion (PSNR, SSIM, LPIPS sobre vistas noveles), ni comparaciones con LRM, TripoSR, InstantMesh o SF3D, ni tiempos de inferencia medidos.

## Requisitos de hardware

- VRAM estimada para el codificador: alrededor de 104 MB en fp32 y 52 MB en fp16, calculado a partir de los 26 M de parametros; esta cifra excluye el decodificador 3DGS y el coste de renderizado, que no se documenta.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano del codificador, cabe en cualquier GPU consumer con al menos 4 GB de VRAM, pero el consumo real dependera del decodificador de NVIDIA y del numero de gaussianas generadas.
- Cabe en GPU consumer: si para el codificador; el requisito agregado (codificador + decodificador 3DGS + rasterizacion) no esta cuantificado por el autor.
- Opciones de despliegue: PyTorch con el codigo del repositorio de GitHub; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. El renderizado requiere un rasterizador 3DGS compatible.
- Latencia y throughput: no disponibles. Al ser feed-forward y de 26 M de parametros, se espera una latencia baja en comparacion con optimizacion por escena, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PRISM | 26 M (codificador de residuos) + decodificador 3DGS aparte | Imagen unica | Gaussian splats | Apache 2.0 (pesos); decodificador con licencia NVIDIA | HuggingFace + GitHub del autor |
| LRM (Large Reconstruction Model) | No disponible en la informacion proporcionada | Imagen unica | NeRF / triplanar | No disponible | Pesos y codigo publicos segun el proyecto original |
| TripoSR | No disponible en la informacion proporcionada | Imagen unica | Malla / triplanar | No disponible | Repositorio publico |
| InstantMesh | No disponible en la informacion proporcionada | Imagen unica | Malla | No disponible | Repositorio publico |

No se dispone de datos verificados de parametros, contexto ni rendimiento de las alternativas dentro de la informacion proporcionada, por lo que la comparacion numerica queda pendiente. La diferencia conceptual de PRISM es el esquema warp-residual con un codificador muy pequeno y un decodificador 3DGS reutilizado, frente a los reconstructores monoliticos de mayor tamano.

## Limitaciones y advertencias

- El repositorio no es autosuficiente: solo contiene el codificador de residuos. Sin el decodificador 3DGS de NVIDIA (licencia distinta) no hay inferencia posible.
- La licencia Apache 2.0 cubre los pesos publicados, pero no el decodificador de terceros; el uso comercial del pipeline completo queda sujeto a la licencia de NVIDIA.
- Reconstruccion desde una sola vista: las regiones ocluidas se infieren, no se observan, con riesgo alto de geometria inventada en la cara oculta del objeto.
- No hay metricas publicadas, ni card de evaluacion, ni descargas registradas (0 descargas, 0 likes), por lo que no existe validacion independiente de la calidad.
- Ausencia total de documentacion sobre datos de entrenamiento: no se puede evaluar sesgo de dominio (categoria de objetos, iluminacion, fondos) ni riesgo de sobreajuste a un dataset concreto.
- Inconsistencia en los enlaces: el autor en HuggingFace es `microjet378` y la model card apunta a un repositorio de GitHub bajo `microjie372`; conviene verificar cual es la ruta oficial antes de integrar.
- La fecha de creacion del repositorio en los metadatos es 2026-10-17, posterior a la consulta; tratar la metadata con cautela.
- No apto para tareas de lenguaje, agentes, tool calling ni comprension semantica de imagenes: es exclusivamente un reconstructor 3D.
- El formato `.pt` sin safetensors obliga a cargar con PyTorch y a auditar el checkpoint antes de usarlo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/microjet378/PRISM
- Codigo y setup (segun la model card): https://github.com/microjie372/PRISM
- Decodificador 3DGS de NVIDIA: no disponible el enlace exacto en la informacion proporcionada (la model card remite al repositorio de GitHub)
