# Blaize-AI/YOLO26m_FASDD

## Resumen

YOLO26m_FASDD es un modelo de deteccion de objetos derivado de YOLO26 Medium (Ultralytics, version 2026) y optimizado por Blaize-AI para su despliegue sobre aceleradores de IA Blaize Xplorer mediante el SDK Picasso. El modelo no es un detector generico: esta especializado en la deteccion de llamas y humo, ya que ha sido entrenado sobre el dataset FASDD-full (Flame and Smoke Detection Dataset), orientado a la deteccion temprana de incendios en imagenes de teledeteccion.

La relevancia tecnica del artefacto no reside en la arquitectura de red (que hereda de YOLO26m) sino en el proceso de compilacion y cuantizacion para el Graph Streaming Processor (GSP) de Blaize, una arquitectura de flujo de grafos disenada para inferencia en el borde con bajo consumo y baja latencia. El repositorio contiene una unica variante compilada en formato `.bm` con cuantizacion AMP (mezcla de INT8 y BF16) y resolucion de entrada de 640x384.

Se trata, por tanto, de un modelo de nicho para integracion en hardware propietario: no es ejecutable con los runners habituales de PyTorch o ONNX Runtime, sino unicamente a traves del Picasso SDK y sobre silicio Blaize. Su publicacion en Hugging Face facilita la distribucion del binario compilado, pero limita drasticamente su reutilizacion fuera del ecosistema Blaize.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 Medium (detector de objetos, familia Ultralytics); compilado para Blaize GSP |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | AMP (mezcla INT8 + BF16); el autor menciona tambien INT8 y BF16 como metodos soportados por el SDK, pero solo publica la variante AMP |
| Idiomas soportados | no disponible (no aplica; modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.bm` (formato compilado propietario de Blaize); modelo original en PyTorch |
| Resolucion de entrada | 640x384 (unica variante publicada) |
| Tarea | Deteccion de objetos (llama y humo) |
| Dataset de entrenamiento | FASDD-full v1 (Flame and Smoke Detection Dataset) |
| Hardware objetivo | Blaize Xplorer AI accelerator (GSP) |
| SDK requerido | Blaize Picasso SDK |

## Arquitectura y entrenamiento

La red base es YOLO26 Medium, un detector de la familia Ultralytics en su version 2026. El autor no detalla en la model card la composicion interna de la red (backbone, neck, cabeza), el numero de parametros ni el esquema de aumentos de datos; solo se indica el framework de origen (PyTorch) y el repositorio oficial de Ultralytics como fuente. La innovacion aportada por Blaize no esta en la topologia sino en el pipeline de compilacion: el modelo se transforma para ejecutarse sobre el GSP, una arquitectura de procesamiento en flujo de grafos que explota el paralelismo de datos a nivel de grafo para reducir latencia y consumo energetico en el borde.

El entrenamiento se realizo sobre FASDD-full v1, un dataset de deteccion de llamas y humo en imagenes de teledeteccion publicado por Wang et al. (2025) en *Geo-spatial Information Science*. La model card no especifica el numero de imagenes, la particion train/val/test, la funcion de perdida ni si hubo ajuste fino adicional sobre el checkpoint original de YOLO26m. Tampoco se documenta el proceso de calibracion de cuantizacion (numero de imagenes de calibracion, esquema de escalado por capa) ni las metricas de precision tras la compilacion, que son datos criticos para evaluar la perdida de exactitud introducida por la cuantizacion AMP.

## Capacidades

- Deteccion de objetos en imagenes: salida de cajas delimitadoras con clase y puntuacion de confianza para las categorias del dataset FASDD (llama y humo).
- Deteccion de incendios en imagenes de teledeteccion: el dominio de entrenamiento son imagenes aereas o satelitales, no fotografias terrestres genericas.
- Inferencia en el borde sobre hardware Blaize Xplorer: el binario `.bm` esta compilado para el GSP, lo que permite ejecucion de baja latencia en dispositivos con acelerador Blaize.
- Inspeccion del modelo mediante `blaize-modeltool info`, que permite consultar metadatos del binario compilado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un detector visual.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje natural.
- No se documentan capacidades de segmentacion, pose, clasificacion ni deteccion de otras clases fuera de llama y humo.

## Casos de uso

- Vigilancia forestal con camaras aereas o satelitales: el modelo detecta columnas de humo y focos de llama en imagenes de teledeteccion, adecuado porque el entrenamiento se realizo sobre el dataset FASDD, especificamente disenado para este dominio.
- Monitorizacion de incendios en infraestructuras criticas (tendidos electricos, plantas industriales, parques eolicos): despliegue en dispositivos Blaize Xplorer en el borde para alertar localmente sin depender de conectividad a la nube, aprovechando la baja latencia del GSP.
- Sistemas de alerta temprana en estaciones remotas con alimentacion limitada: la cuantizacion AMP (INT8 + BF16) reduce el coste computacional y el consumo, lo que encaja con despliegues alimentados por paneles solares o baterias.
- Procesamiento en dron de imagenes capturadas en vuelo: el modelo compilado para GSP puede integrarse en payloads de dron con acelerador Blaize para deteccion de humo en tiempo real durante patrullas.
- Filtrado previo en pipelines de videovigilancia: usar el detector como primera etapa para descartar frames sin llama ni humo y enviar solo los positivos a un sistema de verificacion humano o a un modelo mayor en servidor.
- Analisis post-incendio de imagenes historicas: procesar lotes de imagenes satelitales archivadas para identificar eventos de fuego y generar series temporales de ocurrencia, siempre que se disponga del hardware Blaize o de una recompilacion del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mAP, precision, recall, latencia ni throughput, ni para el modelo original YOLO26m ni para la variante compilada AMP 640x384. Tampoco se documenta la perdida de exactitud respecto al checkpoint PyTorch tras la cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo no se ejecuta sobre GPU convencional en su formato `.bm`; requiere el acelerador Blaize Xplorer.
- GPU recomendadas: no aplica para el binario publicado. Para ejecutar el modelo original YOLO26m en PyTorch seria necesario reentrenar o reconvertir desde el repositorio de Ultralytics, pero esa ruta no esta documentada en este artefacto.
- Compatibilidad con GPU de consumo: no. El binario `.bm` solo funciona sobre silicio Blaize GSP.
- Opciones de despliegue: Blaize Picasso SDK sobre Blaize Xplorer AI accelerator. No es compatible con vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime en su formato publicado.
- Latencia y throughput estimados: no disponibles. La model card no publica cifras de rendimiento del acelerador para esta variante.
- Herramienta de inspeccion: `blaize-modeltool info -i hf://Blaize-AI/YOLO26m_FASDD/YOLO26m_FASDD_amp_640_384.bm`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26m_FASDD (este) | no disponible | 640x384 | Deteccion de llama y humo | AGPL-3.0 | Binario `.bm` para Blaize GSP |
| YOLO26m (Ultralytics original) | no disponible en esta ficha | configurable | Deteccion de objetos generica (COCO) | AGPL-3.0 o licencia enterprise Ultralytics | Pesos PyTorch en repositorio Ultralytics |
| YOLOv8m / YOLO11m (Ultralytics) | no disponible en esta ficha | configurable | Deteccion de objetos generica | AGPL-3.0 o licencia enterprise Ultralytics | Pesos PyTorch, ONNX, TensorRT, etc. |
| Detectores especializados en humo/incendios en Hugging Face | no disponible | variable | Deteccion de humo/llama | variable | variable |

La comparacion directa con alternativas es limitada porque este artefacto es un binario compilado para hardware propietario, no un checkpoint reutilizable. La comparacion mas justa es contra el YOLO26m original de Ultralytics (misma topologia, distinto formato y calibracion) y contra otros detectores de humo/llama publicados en Hugging Face, para los que no se dispone de datos verificados en esta ficha.

## Limitaciones y advertencias

- Dependencia total de hardware propietario: el binario `.bm` solo se ejecuta sobre Blaize Xplorer con el Picasso SDK. No es portable a GPU, CPU ni a otros aceleradores sin recompilacion.
- Licencia AGPL-3.0: el uso comercial en servicios en red obliga a liberar el codigo fuente derivado bajo la misma licencia, salvo que se adquiera la licencia enterprise de Ultralytics para el modelo original.
- Dominio muy restringido: el modelo solo detecta llama y humo en el contexto del dataset FASDD (teledeteccion). Su uso sobre imagenes terrestres, interiores o de otras clases producira falsos positivos y negativos.
- Ausencia de metricas: no se publican mAP, precision, recall ni latencia, lo que impide evaluar la calidad del modelo y la perdida introducida por la cuantizacion AMP antes de desplegarlo.
- Riesgo de alucinacion en sentido amplio: como detector, puede generar cajas sobre regiones sin llama ni humo (falsos positivos) en condiciones de iluminacion, nubosidad o texturas similares al humo; no se documenta ningun umbral de confianza recomendado.
- Sin informacion sobre sesgos: no se describe la distribucion geografica, estacional ni de sensores del dataset FASDD, por lo que se desconoce su comportamiento fuera de las condiciones de entrenamiento.
- Modelo de fecha futura en los metadatos (creado 2026-10-28): la coherencia temporal de la publicacion no puede verificarse con la informacion disponible.
- Sin garantias del proveedor: Blaize declara explicitamente que no revisa, aprueba ni respalda el modelo original y no ofrece garantia alguna sobre el contenido de terceros.
- Sin soporte de texto, lenguaje ni agentes: no debe confundirse con un modelo de lenguaje; cualquier caso de uso conversacional queda fuera de su alcance.

## Enlaces

- Hugging Face: https://huggingface.co/Blaize-AI/YOLO26m_FASDD
- Repositorio original Ultralytics: https://www.github.com/ultralytics/ultralytics
- Dataset FASDD-full: https://www.scidb.cn/en/detail?dataSetId=ce9c9400b44148e1b0a749f5c3eb0bda
- Blaize: https://www.blaize.com
- Referencia del dataset: Wang, M., Yue, P., Jiang, L., Yu, D., Tuo, T., & Li, J. (2025). An open flame and smoke detection dataset for deep learning in remote sensing based fire detection. Geo-spatial Information Science, 28(2), 511-526.
