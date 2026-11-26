# sathiiii/STRiVE-CVPR-checkpoints

## Resumen

STRiVE CVPR checkpoints es un repositorio de pesos de clasificacion de imagenes publicado por el usuario sathiiii en Hugging Face. Contiene tres checkpoints de DINOv2-B/14 (arquitectura ViT base de 86 millones de parametros, segun el modelo base facebook/dinov2-base) afinados para una tarea concreta de diagnostico foliar en maiz, empleados en la comparativa principal del articulo STRiVE presentado en CVPR sobre el benchmark MaizeShift-RBench.

El modelo resuelve un problema de clasificacion en tres clases: follaje aparentemente sano, sintomas compatibles con NLB/TLB (enfermedades foliares del maiz) y dano visible por alimentacion de insectos. La relevancia actual es acotada: no es un modelo de proposito general, sino un artefacto de reproducibilidad cientifica que permite replicar los resultados del articulo (precisions Hard6 de 90,57 ± 0,54 % en tres semillas) y validar el exportador suplementario del benchmark.

El repositorio tiene 1,0 GB, pipeline `image-classification`, licencia no especificada y ningun idioma declarado (es un modelo de vision). No incluye model card en sentido estricto: el README es una guia de descarga y exportacion. La fecha de creacion indicada es 2026-11-26.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (DINOv2-B/14), parche 14, backbone facebook/dinov2-base |
| Parametros totales | no disponible (el backbone DINOv2-B tiene 86 M, dato no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; vista de despliegue de 448 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin salida textual) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de facebook/dinov2-base, un Vision Transformer con atencion global y patch size 14, preentrenado con el objetivo de autodestilacion de DINOv2. Sobre ese backbone se ha realizado un ajuste fino supervisado para clasificacion en tres clases, con una vista de despliegue de 448 pixeles segun el exportador del articulo. El repositorio incluye tres ejecuciones independientes (semillas 41, 42 y 43) con la configuracion esperada por el exportador suplementario de MaizeShift-RBench; las epocas seleccionadas fueron 2, 3 y 2 respectivamente.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset, el regimen de aumento de datos ni si hubo tecnicas de alineacion adicionales (RLHF/DPO no aplican a clasificacion). Tampoco se documenta la estrategia de seleccion de checkpoint mas alla de la epoca elegida por semilla. La innovacion tecnica del artefacto no esta en la arquitectura, sino en la reproducibilidad: se publican hashes SHA256 de los pesos originales (fichero SHA256SUMS) y un informe de compatibilidad que verifica que el exportador sin modificar carga los tres checkpoints y coincide con las clases archivadas en imagenes de prueba (tres imagenes originales por split y semilla, ejecutado en una AMD MI210).

## Capacidades

- Clasificacion de imagenes en tres clases: follaje aparentemente sano, sintomas compatibles con NLB/TLB y dano visible por alimentacion de insectos (en ese orden).
- Extraccion de caracteristicas visuales mediante el backbone DINOv2-B/14, reutilizable para tareas de vision por computador aguas abajo.
- Inferencia de imagen unica con vista de 448 px, compatible con el exportador `maizeshift export`.
- Evaluacion reproducible mediante `maizeshift evaluate` con salida de metricas.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision generativa ni audio.

## Casos de uso

- Reproduccion de resultados del articulo STRiVE: ejecutar las tres semillas con el exportador suplementario y comparar la precision Hard6 agregada (90,57 ± 0,54 %) con la reportada, para validar la implementacion propia.
- Monitorizacion de cultivos de maiz: clasificar imagenes de campo en las tres categorias para priorizar inspecciones presenciales en parcelas con sintomas compatibles con NLB/TLB.
- Triaje de imagenes en aplicaciones agricolas: usar el modelo como primer filtro que descarta follaje sano y deriva el resto a un fitopatologo o a un modelo de segmentacion mas costoso.
- Investigacion en vision agricola: emplear el backbone afinado como inicializacion para nuevos datasets de enfermedades foliares, aprovechando las representaciones de DINOv2.
- Benchmarking de metodos de robustez: MaizeShift-RBench esta disenado para medir degradacion ante cambios de dominio; el modelo sirve como referencia base frente a metodos como STRiVE.
- Docencia y auditoria de artefactos cientificos: el repositorio incluye hashes y un informe de compatibilidad que permiten verificar la integridad de los pesos y la reproducibilidad del pipeline completo.
- Integracion en pipelines de inspeccion con drones: procesar capturas aereas en lotes con el exportador y agregar predicciones por parcela, siempre que la distribucion de imagen se ajuste al benchmark.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las precisiones Hard6 del benchmark MaizeShift-RBench por semilla:

| Semilla | Epoca seleccionada | Precision Hard6 |
|---|---:|---:|
| 41 | 2 | 91,08 % |
| 42 | 3 | 90,62 % |
| 43 | 2 | 90,00 % |
| Agregado (media ± desv. tip.) | - | 90,57 ± 0,54 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible, ni comparaciones numericas con metodos alternativos del articulo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del backbone DINOv2-B (86 M de parametros) y el repo de 1,0 GB con tres checkpoints, cada checkpoint individual deberia ocupar unos cientos de MB en fp32 y ser ejecutable en GPUs de consumo con holgura, aunque esta estimacion no esta confirmada en la informacion.
- GPU recomendadas: la validacion oficial se ejecuto en una AMD MI210; no se documentan modelos NVIDIA concretos.
- Cabe en GPU de consumo: previsiblemente si (clasificador ViT-B), si bien no se aporta medicion oficial.
- Opciones de despliegue: exportador y evaluador `maizeshift` (Python 3.11+, PyTorch y torchvision compatibles, Transformers 4.57.6); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLM).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STRiVE CVPR checkpoints (este) | no disponible (backbone DINOv2-B) | imagen 448 px | Hard6 90,57 ± 0,54 % en MaizeShift-RBench | no disponible | repo privado con acceso mediante cuenta HF |
| facebook/dinov2-base | 86 M (segun modelo base) | imagen 518 px por defecto | no disponible en esta informacion | no disponible en esta informacion | publico en Hugging Face |
| Otros metodos comparados en STRiVE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria; la informacion proporcionada solo menciona el backbone base y la comparativa del articulo sin cifras.

## Limitaciones y advertencias

- Ambito muy restringido: solo tres clases de diagnostico foliar en maiz; no es un modelo generalista ni un chatbot.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Repositorio privado: requiere autenticacion (`hf auth login`) y una cuenta con acceso concedido.
- Dependencia estricta de versiones: el exportador se valido con Transformers 4.57.6 y Python 3.11+; otras versiones pueden romper la reproducibilidad.
- La validacion de compatibilidad se hizo con solo tres imagenes por split y semilla en una AMD MI210; no constituye una evaluacion exhaustiva.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y negativos en la clasificacion, especialmente ante cambios de dominio no cubiertos por el benchmark.
- Sesgos conocidos: no documentados; al entrenarse sobre un dataset agricola concreto, es probable que generalice mal fuera de ese dominio (iluminacion, camaras, variedades o regiones no representadas).
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa texto.
- Para produccion, conviene fijar versiones de dependencias, verificar los hashes SHA256 y monitorizar la deriva de dominio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sathiiii/STRiVE-CVPR-checkpoints
- Modelo base: https://huggingface.co/facebook/dinov2-base
- Fichero CHECKPOINTS.json: https://huggingface.co/sathiiii/STRiVE-CVPR-checkpoints/blob/main/CHECKPOINTS.json
- Fichero SHA256SUMS: https://huggingface.co/sathiiii/STRiVE-CVPR-checkpoints/blob/main/SHA256SUMS
- Informe de compatibilidad: https://huggingface.co/sathiiii/STRiVE-CVPR-checkpoints/blob/main/COMPATIBILITY.json
- Articulo STRiVE (CVPR): no disponible
- Codigo suplementario MaizeShift-RBench: no disponible
- Demo: no disponible
