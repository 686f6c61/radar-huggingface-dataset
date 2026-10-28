# Blaize-AI/YOLO26s_FASDD

## Resumen

YOLO26s_FASDD es un detector de objetos de una sola etapa de la familia YOLO26 de Ultralytics, en su variante «s» (small), reentrenado sobre el conjunto de datos FASDD-CV (Flame and Smoke Detection Dataset, teledetección) y optimizado por Blaize para ejecutarse sobre sus aceleradores de inferencia en el borde (Blaize Xplorer) mediante el SDK Picasso y la arquitectura GSP (Graph Streaming Processor). No es un modelo de lenguaje: su única tarea es localizar y clasificar llamas y humo en imágenes.

El valor diferencial del repositorio no está en el modelo en sí, sino en el artefacto empaquetado: un fichero `.bm` compilado para hardware Blaize, con cuantización AMP y resolución de entrada fija de 640×384. El modelo original es PyTorch, publicado por Ultralytics bajo doble licencia AGPL-3.0-only o licencia enterprise, y Blaize declara haber realizado únicamente optimizaciones específicas de hardware, sin modificar el código fuente.

Es relevante ahora porque ejemplifica el patrón de distribución de modelos para edge AI: pesos compilados para un acelerador concreto, con licencia heredada del modelo original y disponibilidad ligada a un SDK propietario. El repositorio se publicó el 28 de octubre de 2026, con 0 descargas y 0 likes, y un tamaño reportado de 0,0 GB, lo que sugiere un artefacto muy pequeño o un repositorio incompleto en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO26 variante «s» (small), detector de objetos de una sola etapa; optimizado para Blaize GSP |
| Parámetros totales | no disponible (la model card no publica el recuento) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de entrada fija de 640×384 píxeles |
| Tipos de cuantización | AMP (INT8 + BF16), INT8 con escalado de punto fijo, BF16 |
| Idiomas soportados | no disponible; el modelo no procesa texto |
| Licencia | AGPL-3.0 (modelo original: AGPL-3.0-only o LicenseRef-Ultralytics-Enterprise-License) |
| Formato de pesos | `.bm` (formato de modelo de Blaize, fichero `YOLO26s_FASDD_amp_640_384.bm`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLO26 en su variante small, un detector de una sola etapa de la familia Ultralytics (versión 2026) implementado originalmente en PyTorch. La model card no detalla el esquema de backbone, la cabeza de detección ni el número de capas; solo identifica la variante y el framework de origen, además de indicar que Blaize ha aplicado optimizaciones específicas de hardware para hacerlo compatible con el GSP, sin modificar el código fuente del modelo.

El entrenamiento se realizó sobre FASDD-CV, un conjunto de datos abierto de detección de llama y humo orientado a teledetección y detección de incendios, publicado bajo CC-BY-SA-4.0 y descrito en Wang et al. (2025), *Geo-spatial Information Science* 28(2), 511-526. No se especifican en la información disponible el número de imágenes, épocas, aumentos de datos, función de pérdida ni si hubo ajuste fino adicional. El repositorio incluye una única variante, `YOLO26s_FASDD_amp_640_384`, con cuantización AMP; no se publican variantes INT8 ni BF16 puras pese a que la model card las describe como métodos disponibles del SDK.

## Capacidades

- Detección de objetos con cajas delimitadoras sobre imágenes de entrada de 640×384 píxeles.
- Detección de dos fenómenos según la descripción del dataset de entrenamiento: llama y humo.
- Inferencia en el borde sobre aceleradores Blaize Xplorer, con el objetivo declarado de reducir latencia y consumo frente a soluciones genéricas.
- Ejecución con cuantización AMP, que combina INT8 y BF16 para equilibrar precisión y velocidad.
- Inspección del artefacto mediante la utilidad `blaize-modeltool info`.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión general (VQA/captioning).
- No soporta tool calling, function calling ni flujos de agentes.
- No dispone de capacidades multilingües ni de procesamiento de audio.
- No se documentan modos especiales (thinking mode, decodificación especulativa, atención lineal) porque no aplican a esta familia de modelos.

## Casos de uso

- **Detección temprana de incendios forestales en torres de vigilancia:** el modelo procesa fotogramas de cámaras remotas a 640×384 y emite detecciones de humo o llama que se traducen en alertas. Su formato compilado para GSP permite ejecutarlo en el propio poste, sin enviar vídeo a la nube.
- **Monitorización de humo en túneles de carretera e interiores industriales:** al ejecutarse sobre hardware de bajo consumo, puede alimentar sistemas de alarma y extinción en instalaciones donde el ancho de banda hacia el centro de datos es limitado o inexistente.
- **Vigilancia de plantas de almacenamiento de biomasa, residuos o combustibles:** detección continua de conatos mediante cámaras fijas, con la detección como señal de activación de protocolos de seguridad y verificación humana posterior.
- **Teledetección con drones y UAV:** el entrenamiento sobre FASDD-CV, orientado a detección de incendios en observación de la Tierra, encaja con el análisis de imágenes aéreas o satelitales en plataformas con presupuesto energético restringido.
- **Control de quemas agrícolas y focos en entorno rural:** despliegue en pasarelas edge alimentadas por placa solar o batería, donde el acelerador GSP aporta eficiencia energética frente a GPU convencionales.
- **Protección de infraestructuras eléctricas y renovables:** parques solares, subestaciones y aerogeneradores pueden monitorizarse para detectar humo asociado a fallos térmicos antes de que se declare un incendio.
- **Filtro previo en pipelines de videovigilancia existentes:** el modelo actúa como etapa de cribado que reduce el volumen de fotogramas enviados a un analista o a un modelo mayor, al ejecutarse localmente con latencia baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye mAP, precisión, recall, matriz de confusión, curvas precision-recall ni mediciones de latencia o throughput para ninguna de las variantes de cuantización. Tampoco se aportan métricas de comparación con el modelo PyTorch original.

## Requisitos de hardware

- No es ejecutable en GPU convencionales ni en CPU: requiere un acelerador de IA Blaize Xplorer.
- Requiere el SDK Picasso de Blaize instalado y configurado, además de la utilidad `blaize-modeltool`.
- VRAM estimada: no aplica; el consumo se mide en el acelerador GSP, no en memoria de GPU. No se publican cifras de memoria ni de potencia.
- No cabe en tarjetas consumer tipo RTX 4090, RTX 3090 o similares, porque el artefacto `.bm` no es un formato ejecutable por runtimes estándar.
- Opciones de despliegue: exclusivamente el stack Picasso/GSP. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime.
- Latencia y throughput: no disponibles. La model card solo afirma de forma cualitativa que la arquitectura GSP optimiza rendimiento, eficiencia energética y latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Clases | Licencia | Formato | Hardware de ejecución |
|---|---|---|---|---|---|---|
| YOLO26s_FASDD (este repositorio) | no disponible | 640×384 | llama y humo (según dataset FASDD-CV) | AGPL-3.0 | `.bm` | Blaize Xplorer (GSP) |
| YOLO26s original (Ultralytics, PyTorch) | no disponible | no disponible | COCO (por defecto) | AGPL-3.0-only o enterprise de Ultralytics | `.pt` | GPU/CPU convencionales |
| Detectores especializados en humo/llama de la misma familia (YOLOv8s, YOLO11s reentrenados) | no disponible | no disponible | llama y humo | AGPL-3.0 en la familia Ultralytics | `.pt`, `.onnx` | GPU/CPU convencionales |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que la comparación se limita a licencia, formato y plataforma de ejecución.

## Limitaciones y advertencias

- **Licencia AGPL-3.0:** cualquier distribución del modelo o de un servicio construido sobre él puede activar obligaciones de liberación del código fuente. Para uso comercial cerrado, Ultralytics ofrece una licencia enterprise sobre el modelo original que habría que verificar por separado.
- **Dependencia de hardware propietario:** el artefacto `.bm` solo se ejecuta sobre aceleradores Blaize con el SDK Picasso, lo que introduce dependencia de proveedor y limita la portabilidad.
- **Artefacto no verificable:** el repositorio reporta 0,0 GB de tamaño y 0 descargas; conviene comprobar que el fichero `.bm` está realmente presente y es íntegro antes de integrarlo.
- **Sin métricas publicadas:** no hay mAP ni curvas de precisión/recall, de modo que no es posible estimar la tasa de falsos positivos y falsos negativos en producción.
- **Dominio restringido:** el entrenamiento proviene de un dataset de teledetección de incendios; el rendimiento en cámaras CCTV convencionales, escenas nocturnas o imágenes térmicas no está documentado y podría degradarse.
- **Riesgo de alucinación en sentido amplio:** como todo detector, puede generar cajas espurias ante elementos visualmente similares (niebla, vapor, polvo, cielos con nubes cálidas) sin que se documente ningún mecanismo de calibración de confianza.
- **Sin soporte de texto ni multilingüe:** no puede utilizarse para tareas de lenguaje, agentes o razonamiento; cualquier descripción de la escena debe generarla otro modelo.
- **Ausencia de garantías del proveedor:** Blaize declara explícitamente que no revisa ni avala el modelo de terceros y no ofrece garantía alguna sobre su funcionamiento o sobre posibles infracciones de propiedad intelectual.
- **Idioma y contexto:** no aplicables, pero se indica que no hay información sobre sesgos demográficos o geográficos del dataset FASDD-CV más allá de su licencia CC-BY-SA-4.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blaize-AI/YOLO26s_FASDD
- Repositorio original de Ultralytics: https://www.github.com/ultralytics/ultralytics
- Dataset FASDD-CV (ScienceDB): https://www.scidb.cn/en/detail?dataSetId=ce9c9400b44148e1b0a749f5c3eb0bda
- Sitio de Blaize: https://www.blaize.com/
- Información corporativa de Blaize: https://www.blaize.com/company/
- Referencia del dataset: Wang, M., Yue, P., Jiang, L., Yu, D., Tuo, T., & Li, J. (2025). An open flame and smoke detection dataset for deep learning in remote sensing based fire detection. *Geo-spatial Information Science*, 28(2), 511-526.
