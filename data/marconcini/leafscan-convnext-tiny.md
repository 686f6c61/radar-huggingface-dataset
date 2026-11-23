# Marconcini/leafscan-convnext-tiny

## Resumen

LeafScan ConvNeXt-T es un clasificador de imagenes para diagnostico de enfermedades de plantas desarrollado por Marconcini como proyecto de investigacion y portfolio. Clasifica una fotografia de hoja en 38 clases que cubren 14 cultivos, y devuelve la etiqueta "Not sure" (no estoy seguro) cuando su confianza calibrada cae por debajo de un umbral de 0,75. Se basa en la arquitectura ConvNeXt-Tiny (28 millones de parametros, entrada de 224x224) inicializada con pesos de ImageNet y afinada en dos fases: primero sobre PlantVillage (39.000 imagenes de laboratorio) y despues sobre el 85% del conjunto de entrenamiento de PlantDoc (1.975 fotos de campo y web).

Su relevancia no esta en el tamano ni en la arquitectura, sino en el enfoque de calibracion para dominio real. El mismo modelo entrenado solo con PlantVillage alcanza un 99,7% de exactitud en fotos de laboratorio pero cae al 31% en fotos de campo; LeafScan, tras el ajuste fino con PlantDoc y la calibracion de temperatura (T = 0,83), obtiene un 72,4% en el conjunto de test de PlantDoc (228 fotos de campo) manteniendo un 96,6% en PlantVillage. El modelo incorpora un mecanismo de absteccion calibrado que responde al 65% de las fotos de campo con un 87% de acierto entre las respondidas.

El proyecto incluye exportaciones a ONNX (fp32 e int8) y una demo en navegador mediante ONNX Runtime Web, ademas de una aplicacion local con un asistente RAG que cita fuentes. La licencia es CC BY-SA 4.0 para los pesos y MIT para el codigo. No es una herramienta de diagnostico agronomico: el autor lo posiciona explicitamente como demostracion e investigacion sobre robustez de clasificadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (timm: `convnext_tiny.fb_in22k_ft_in1k`) |
| Parametros totales | 27.849.350 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224x224) |
| Tipos de cuantizacion | fp32 (PyTorch y ONNX), int8 (ONNX, solo capas lineales) |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin procesamiento de texto) |
| Licencia | CC BY-SA 4.0 (pesos); MIT (codigo) |
| Formato de pesos | safetensors (PyTorch), ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

ConvNeXt-Tiny es una red neuronal convolucional pura que moderniza el diseno de ResNet incorporando elementos propios de los Vision Transformers (kernels 7x7, normalizacion LayerNorm, activacion GELU, menos capas de normalizacion y activacion). El modelo parte de pesos preentrenados en ImageNet-22k y afinados en ImageNet-1k (`fb_in22k_ft_in1k` de timm) y se reentrena en dos etapas: PlantVillage (39.000 imagenes de laboratorio, 38 clases) y despues el 85% de PlantDoc train (1.975 fotos de campo y web). El 15% restante de PlantDoc train (348 fotos) se reserva exclusivamente para ajustar la temperatura de calibracion (T = 0,83) y el umbral de absteccion (0,75 sobre confianza calibrada).

La innovacion tecnica principal es la calibracion post-hoc mediante temperature scaling (Guo et al., 2017) y un umbral de rechazo ajustado en dominio de campo, no en laboratorio. El proyecto demuestra explicitamente que los umbrales ajustados en laboratorio fallan en fotos de campo. Ademas, la version int8 de ONNX (32 MB, solo capas lineales cuantizadas, convoluciones en fp32 porque ONNX Runtime Web no soporta convolucion int8) tiene su propia temperatura y umbral recalibrados, ya que la cuantizacion altera algunas predicciones: responde al 66% de las fotos con un 84,7% de acierto, frente al 65% y 87% de la version fp32.

## Capacidades

- Clasificacion de imagenes de hojas en 38 clases de cultivo/enfermedad (14 cultivos).
- Absteccion calibrada: devuelve "Not sure" cuando la confianza calibrada es inferior a 0,75.
- Salida top-3 con probabilidades calibradas.
- Inferencia en navegador mediante ONNX Runtime Web (modelo int8, sin subida de datos).
- Exportacion ONNX fp32 con top-1 identico a PyTorch en PlantDoc test.
- Integracion con asistente RAG local (28 articulos de Wikipedia) que cita fuentes, en la aplicacion del proyecto.
- No soporta tool calling, agentes, texto ni audio: es exclusivamente un clasificador de imagenes.

## Casos de uso

- Investigacion sobre robustez de clasificadores en dominio real: el modelo sirve como caso de estudio reproducible de la brecha laboratorio-campo (99,7% vs 31% sin ajuste fino) y de calibracion con absteccion. El codigo y el registro de investigacion estan publicados.
- Demo educativa en navegador: la exportacion int8 ONNX (32 MB) permite desplegar la inferencia en el cliente sin subir imagenes a un servidor, util para talleres y prototipos de agricultura digital.
- Prototipo de aplicacion movil de diagnostico asistido: con 27,8 millones de parametros y un modelo int8 de 32 MB, cabe en dispositivos de gama media; el umbral de absteccion evita forzar diagnosticos cuando la confianza es baja.
- Generacion de preguntas sugeridas en un asistente agricola: el proyecto demuestra que filtrar la busqueda RAG por el diagnostico predicho cuesta 16 puntos de recall@5, por lo que el modelo se usa para sugerir preguntas que nombran la enfermedad (ambos candidatos si dice "Not sure") y el usuario las corrige.
- Filtrado previo en pipelines de anotacion de datasets agricolas: la salida top-3 con probabilidades calibradas permite priorizar imagenes para revision humana, descartando las que caen por debajo del umbral.
- Benchmark de calibracion para otros equipos: la separacion entre conjunto de calibracion (348 fotos de PlantDoc train) y test (228 fotos de PlantDoc test) sirve como plantilla metodologica para proyectos similares.
- Clasificacion de healthy vs diseased: con un 94,7% en PlantDoc test, puede usarse en tareas binarias de cribado donde solo interesa distinguir hoja sana de enferma.

## Benchmarks y rendimiento

| Metrica | PlantDoc test (campo, 228 fotos) | PlantVillage test (lab, 10.709 fotos) |
|---|---:|---:|
| Exactitud | 72,4% (IC 95%: 66,2-78,1) | 96,6% |
| Cultivo correcto | 86,4% | no disponible |
| Sana vs enferma | 94,7% | no disponible |
| Responde por encima del umbral | 65% de las fotos, 87% correctas | 94% de las fotos, 98,7% correctas |

| Variante | Exactitud PlantDoc test | Cobertura | Acierto entre respondidas |
|---|---:|---:|---:|
| fp32 (PyTorch/ONNX) | 72,4% | 65% | 87% |
| int8 ONNX | 71,9% | 66% | 84,7% |

Referencia del autor: la misma arquitectura entrenada solo con PlantVillage alcanza 99,7% en laboratorio pero 31% en campo. El test de PlantDoc es pequeno (228 fotos); diferencias inferiores a ~6 puntos estan dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia fp32: aproximadamente 110 MB para los pesos (27,8 M parametros x 4 bytes) mas activaciones; en la practica menos de 1 GB en cualquier GPU.
- VRAM estimada para int8 ONNX: modelo de 32 MB; inferencia en CPU viable.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; el modelo corre en CPU y en navegador.
- Cabe en GPU consumer: si, en todas las GPU con al menos 1 GB de memoria; tambien en CPU y en movil via ONNX Runtime.
- Opciones de despliegue: PyTorch (libreria `leafscan`), ONNX Runtime (fp32 e int8), ONNX Runtime Web para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de vision).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Exactitud en campo (PlantDoc) | Licencia | Formato |
|---|---:|---|---:|---|---|
| LeafScan ConvNeXt-T (este) | 27,8 M | 224x224 | 72,4% | CC BY-SA 4.0 | safetensors, ONNX |
| ConvNeXt-T solo PlantVillage (referencia del autor) | 27,8 M | 224x224 | 31% | no disponible | no disponible |
| Otros clasificadores de enfermedades de plantas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos comparables en la informacion proporcionada. La unica comparacion documentada es la del propio autor entre el modelo afinado con PlantDoc y la misma arquitectura entrenada solo con PlantVillage.

## Limitaciones y advertencias

- No es una herramienta de diagnostico: el autor lo declara explicitamente como demostracion e investigacion, no sustituto de un agronomo.
- Solo conoce las 38 clases de PlantVillage; cualquier otra planta o enfermedad se fuerza a una de ellas o se responde "Not sure".
- El conjunto de test es pequeno (228 fotos); diferencias inferiores a ~6 puntos estan dentro del ruido estadistico.
- La calibracion y el umbral se ajustaron sobre fotos de PlantDoc; pueden no generalizar a fotos de otras fuentes (el proyecto muestra que umbrales ajustados en laboratorio fallan en campo).
- El rechazo de imagenes que no son hojas es debil (AUROC 0,6-0,8 en las pruebas del proyecto): una foto de otra cosa puede recibir un diagnostico.
- PlantDoc es web-scraped y contiene ruido de etiquetas (se eliminaron duplicados archivados en clases distintas).
- La cuantizacion int8 altera algunas predicciones y requiere su propia temperatura y umbral; no reutilizar los de fp32.
- Licencia CC BY-SA 4.0 en los pesos: obliga a compartir bajo la misma licencia las obras derivadas, lo que puede condicionar el uso comercial.
- No hay informacion sobre sesgos demograficos o geograficos mas alla de la composicion de PlantVillage y PlantDoc.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Marconcini/leafscan-convnext-tiny
- Demo en navegador (Space): https://huggingface.co/spaces/Marconcini/leafscan
- Repositorio del proyecto: https://github.com/marconcini/leafscan
- Registro de investigacion: https://github.com/marconcini/leafscan/blob/main/docs/research-log.md
- Dataset PlantDoc: https://github.com/pratikkayal/PlantDoc-Dataset
- Dataset PlantVillage (via Hugging Face): https://huggingface.co/datasets/mohanty/PlantVillage
- Paper PlantVillage (Hughes & Salathe, 2015): https://arxiv.org/abs/1511.08060
- Paper ConvNeXt (Liu et al., 2022): no disponible en la informacion proporcionada
- Paper PlantDoc (Singh et al., 2020): no disponible en la informacion proporcionada
- Paper de calibracion (Guo et al., 2017): no disponible en la informacion proporcionada
