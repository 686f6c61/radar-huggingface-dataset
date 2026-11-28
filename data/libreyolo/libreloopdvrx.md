# LibreYOLO/LibreLoopDVRx

## Resumen

LibreLoopDVRx es un modelo de detección de objetos empaquetado para el framework LibreYOLO, derivado del modelo LoopDVR (variante LoopDet, tamaño X) desarrollado por Intellindust AI Lab y la Great Bay University. Se trata de un detector DETR-like que combina un backbone ViT con bucles de repetición de parámetros (`LoopedViT`), un encoder híbrido y un decoder DETR también con bucles, más un mecanismo de refinamiento FDR. Detecta las 80 clases del conjunto COCO mediante 300 queries.

El empaquetado es puramente de metadatos: los pesos aprendidos son idénticos bit a bit al state dict original (`loopdet-x.pth`), y el wrapper solo añade la información de checkpoint de LibreYOLO v1.0 (`model_family`, `task`, `supported_tasks`, `default_task`, `size`, `nc`, `names`, `imgsz`) para que la factoría unificada `LibreYOLO()` enrute el modelo sin heurísticas sobre el nombre del fichero.

Es relevante para quien ya trabaja con el ecosistema LibreYOLO (API Python unificada para YOLO, RF-DETR, RT-DETR y otros) y quiera incorporar un detector basado en transformers con reutilización de parámetros sin salir de esa interfaz. La licencia Apache 2.0 facilita su uso comercial. El repositorio es de tamaño reducido (0,1 GB) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector DETR-like: backbone ViT con bucles (`LoopedViT`) + encoder híbrido + decoder DETR con bucles y refinamiento FDR |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: detección de objetos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (checkpoint LibreYOLO v1.0; pesos derivados de `loopdet-x.pth`) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño LoopDVR en su variante LoopDet tamaño X. El backbone es un ViT con bucles (`LoopedViT`), es decir, un transformer visual cuyas capas se reutilizan en varias iteraciones, lo que aumenta la profundidad efectiva sin multiplicar el número de parámetros. Sobre él se sitúa un encoder híbrido y un decoder DETR también con bucles, que refina las predicciones mediante el mecanismo FDR. La cabeza produce 300 queries sobre las 80 clases de COCO.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset (más allá de COCO como conjunto de evaluación/clases), ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación, algo por otra parte poco habitual en detectores. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal. El empaquetado en LibreYOLO no modifica los pesos: solo añade metadatos de checkpoint para el enrutado automático en la factoría `LibreYOLO()`.

## Capacidades

- Detección de objetos en imágenes con 80 clases COCO y 300 queries por imagen.
- Salida de cajas delimitadoras y etiquetas de clase mediante la API de LibreYOLO (`model("image.jpg", save=True)`).
- Backbone ViT con reutilización de parámetros por bucles, orientado a reducir coste paramétrico frente a un ViT de profundidad equivalente.
- Refinamiento iterativo de predicciones en el decoder mediante FDR.
- Integración nativa con el framework LibreYOLO, que unifica la carga y ejecución de distintos detectores bajo una misma API.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión-lenguaje, audio ni modo thinking.
- No se documentan capacidades multilingües (el modelo no procesa texto).

## Casos de uso

- Detección de objetos en pipelines de visión por computador: cargar el checkpoint con `LibreYOLO("LibreLoopDVRx.pt")` y ejecutar inferencia sobre lotes de imágenes para obtener cajas y clases COCO, aprovechando la API unificada de LibreYOLO.
- Evaluación comparativa de detectores basados en transformers: al compartir interfaz con RF-DETR y RT-DETR dentro de LibreYOLO, permite intercambiar el modelo en un mismo script y comparar resultados sobre el mismo dataset.
- Prototipado rápido en investigación: el tamaño reducido del repositorio (0,1 GB) y la instalación vía `pip install libreyolo` facilitan montar un entorno de pruebas en pocos minutos.
- Sistemas de moderación o filtrado visual: la detección de las 80 clases COCO permite identificar personas, vehículos, animales u objetos concretos en imágenes subidas por usuarios.
- Análisis de imágenes en aplicaciones de inventario o conteo: detección de instancias de categorías COCO (por ejemplo, vehículos o muebles) en fotografías para tareas de recuento y localización.
- Base para fine-tuning sobre dominios específicos: al estar licenciado bajo Apache 2.0 y disponible en formato de checkpoint LibreYOLO, puede servir como punto de partida para reentrenar sobre clases propias, siempre que se valide el rendimiento del backbone en el nuevo dominio.
- Integración en servicios de visión bajo licencia permisiva: el uso comercial está permitido por Apache 2.0, lo que facilita desplegarlo en productos sin obligaciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del modelo no se especifica en la información proporcionada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repositorio (0,1 GB) sugiere un checkpoint ligero, pero no se confirma el número de parámetros ni los requisitos reales de memoria.
- Opciones de despliegue: la vía documentada es la librería `libreyolo` (`pip install libreyolo`) con la API `LibreYOLO()`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente aquí).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / queries | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreLoopDVRx | LoopedViT + encoder híbrido + decoder DETR con FDR | no disponible | 300 queries, 80 clases COCO | Apache 2.0 | Hugging Face (LibreYOLO/LibreLoopDVRx) |
| RF-DETR | Detector DETR | no disponible en la información | no disponible | no disponible | Integrado en LibreYOLO |
| RT-DETR | Detector DETR en tiempo real | no disponible en la información | no disponible | no disponible | Integrado en LibreYOLO |
| YOLO (familia) | CNN / híbrida | no disponible en la información | no disponible | MIT (librería LibreYOLO) | Integrado en LibreYOLO |

La información disponible solo confirma que LibreYOLO expone una API única para YOLO, RF-DETR, RT-DETR y otros modelos; no se aportan datos de parámetros, contexto ni rendimiento de las alternativas, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No se han publicado métricas de precisión (mAP u otras) en la información disponible; no es posible evaluar su calidad frente a alternativas sin ejecutar pruebas propias.
- El modelo está limitado a las 80 clases de COCO; no detecta categorías fuera de ese conjunto sin reentrenamiento.
- No se documentan sesgos conocidos, pero al entrenarse sobre COCO hereda los desequilibrios de representación de ese dataset (clases y contextos sobrerrepresentados).
- Riesgo de alucinación entendido como falsos positivos: como todo detector, puede producir cajas espurias o etiquetas incorrectas, especialmente en imágenes fuera de la distribución de entrenamiento.
- No hay información sobre el número de parámetros ni sobre el coste computacional real, lo que dificulta planificar el despliegue.
- El repositorio no registra descargas ni likes, y el empaquetado es reciente (creado y actualizado el 27 de noviembre de 2026); la validación por la comunidad es inexistente por ahora.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de copyright de los autores originales (Great Bay University / Intellindust AI Lab) según los ficheros `LICENSE` y `NOTICE`.
- Los pesos son idénticos a los de LoopDVR upstream; cualquier problema del modelo original se traslada sin cambios.
- No se especifican requisitos de versión de `libreyolo` ni de dependencias (PyTorch, etc.) más allá del comando de instalación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreLoopDVRx
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Script de conversión de pesos: `weights/convert_loopdvr_weights.py` en el repositorio LibreYOLO
- Repositorio LoopDVR original: https://github.com/Intellindust-AI-Lab/LoopDVR (commit `f2aba1f122029e4db757b69cd37fc5a4909db34e`)
- Release de pesos oficiales: https://github.com/Siruuui/LoopDVR/releases/tag/v1.0 (fichero `loopdet-x.pth`)
- Sitio web de LibreYOLO: https://www.libreyolo.com/
- Paquete PyPI: https://pypi.org/project/libreyolo/
