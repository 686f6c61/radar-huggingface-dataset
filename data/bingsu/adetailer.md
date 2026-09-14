# Bingsu/adetailer

## Resumen

Bingsu/adetailer es un repositorio de checkpoints de detección y segmentación de objetos de la familia YOLOv8/YOLOv9 (librería Ultralytics), publicado por el usuario Bingsu. No es un modelo de lenguaje: se trata de una colección de detectores ligeros entrenados para localizar caras (2D y realistas), manos, personas y prendas de ropa, que constituyen el motor de detección de la extensión ADetailer para Stable Diffusion WebUI.

El problema que resuelve es muy concreto: en flujos de generación y retoque de imágenes, es necesario localizar regiones específicas (sobre todo caras, pero también manos o ropa) para aplicarles enmascarado e inpainting automático. Estos modelos actúan como paso previo de detección, entregando cajas y máscaras que después alimentan el pipeline de difusión. El repositorio acumula 9.733.792 descargas y 789 likes, lo que lo convierte en uno de los artefactos de visión más utilizados del ecosistema de Stable Diffusion.

La colección incluye doce checkpoints en formato PyTorch (.pt) con variantes de distinto tamaño (n, s, m, c) y distintas tareas (detección de cajas y segmentación de instancias). La licencia es Apache 2.0 y el repositorio completo ocupa 1,1 GB. El autor publica en la propia model card las métricas mAP 50 y mAP 50-95 de cada checkpoint, lo que permite elegir variante en función del equilibrio precisión/coste computacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Familia YOLOv8 / YOLOv9 (Ultralytics); detectores y segmentadores de una etapa |
| Parámetros totales | no disponible (varía por variante: sufijos n, s, m y c) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | no aplica (modelo de visión; los idiomas no son un eje relevante) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt), formato de la librería Ultralytics |
| Tarea | Detección de objetos (bbox) y segmentación de instancias (mask) |
| Clases detectadas | cara (realista y anime), mano, persona, 13 clases de prendas (deepfashion2) |
| Checkpoints incluidos | face_yolov8n.pt, face_yolov8n_v2.pt, face_yolov8s.pt, face_yolov8m.pt, face_yolov9c.pt, hand_yolov8n.pt, hand_yolov8s.pt, hand_yolov9c.pt, person_yolov8n-seg.pt, person_yolov8s-seg.pt, person_yolov8m-seg.pt, deepfashion2_yolov8s-seg.pt |
| Datasets declarados | wider_face, skytnt/anime-segmentation, coco2017 (solo persona), AniSeg, DeepFashion2, AnHDet, Anime Face CreateML, xml2txt, AN, hand-detection-fuao9 |
| Tamaño del repositorio | 1,1 GB (conjunto completo de checkpoints) |
| Descargas | 9.733.792 |
| Likes | 789 |
| DOI | 10.57967/hf/3633 |
| Fecha de creación | 26 de abril de 2023 |
| Última actualización | 21 de noviembre de 2024 |

## Arquitectura y entrenamiento

La model card identifica el modelo como "YOLOv8 Detection Model" y los nombres de fichero confirman el uso de las escalas n, s, m y c de las familias YOLOv8 y YOLOv9 de Ultralytics. Son, por tanto, redes convolucionales de una sola etapa con cabeza de detección (y, en los checkpoints con sufijo -seg, cabeza de segmentación de instancias que añade predicción de máscaras). Todos los pesos fueron creados y guardados con la librería oficial de Ultralytics, según declara el autor. No se especifican en la información disponible el número de tokens/épocas, la resolución de entrenamiento ni los hiperparámetros concretos.

Los datos de entrenamiento se componen de varios conjuntos agregados, organizados por dominio. Para caras: Anime Face CreateML, xml2txt, AN y WIDER FACE. Para manos: AnHDet y hand-detection-fuao9. Para personas: COCO 2017 (únicamente la clase persona), AniSeg y skytnt/anime-segmentation. Para ropa: DeepFashion2, con 13 etiquetas (camisas de manga corta y larga, prendas de abrigo de manga corta y larga, chaleco, tirantes, pantalones cortos, pantalones, falda, vestidos de manga corta y larga, vestido con chaleco y vestido de tirantes). No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo por otra parte ajeno a un detector de objetos.

Una particularidad relevante: el propio autor advierte de que algunos checkpoints de segmentación aparecen marcados como "unsafe files" en Hugging Face porque Ultralytics utiliza `getattr`, clasificado por la plataforma como función peligrosa de pickle. El autor indica que los ficheros son legítimos al proceder de la librería oficial y recomienda descargarlos solo desde fuentes de confianza.

## Capacidades

- Detección de caras realistas en 2D y de caras de estilo anime, con cinco checkpoints de precisión creciente (de face_yolov8n.pt a face_yolov9c.pt).
- Detección de manos realistas, con tres checkpoints (hand_yolov8n.pt, hand_yolov8s.pt, hand_yolov9c.pt).
- Detección y segmentación de personas, con tres checkpoints (person_yolov8n-seg.pt, person_yolov8s-seg.pt, person_yolov8m-seg.pt) que devuelven caja y máscara.
- Segmentación de prendas de ropa con 13 categorías de DeepFashion2 (deepfashion2_yolov8s-seg.pt).
- Salida de cajas delimitadoras y máscaras utilizables como entrada de pipelines de inpainting.
- Integración nativa con la librería Ultralytics (`YOLO(path)`), con API de inferencia sobre imágenes locales o URLs.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modo de pensamiento: no es un modelo generativo de texto.
- No genera ni modifica imágenes por sí mismo; su función es exclusivamente de localización y segmentación.

## Casos de uso

- Inpainting automático de caras en Stable Diffusion WebUI: mediante la extensión ADetailer, el detector localiza cada cara de la imagen generada y aplica difusión solo sobre esas regiones con una máscara derivada de la detección, lo que corrige caras deformadas en imágenes amplias sin regenerar toda la escena.
- Retoque fotográfico por lotes: procesado de cientos de fotografías de grupo donde face_yolov8s.pt o face_yolov8m.pt localizan cada rostro para aplicar enfoque selectivo, corrección de piel o sustitución de fondos de forma desatendida.
- Anonimización y protección de privacidad: uso de los checkpoints de cara como primer paso para desenfocar o pixelar rostros antes de publicar material audiovisual, aprovechando su ejecución ligera en CPU o GPU modesta.
- Segmentación de personas para fondos virtuales y recorte: person_yolov8s-seg.pt y person_yolov8m-seg.pt generan máscaras de persona (mAP 50 de 0,809 y 0,831 en máscara respectivamente) adecuadas para sustituir fondos en vídeo o preparar material para catálogos.
- Moda y comercio electrónico: deepfashion2_yolov8s-seg.pt clasifica y segmenta 13 tipos de prenda, lo que permite etiquetar automáticamente catálogos, alimentar sistemas de recomendación por tipo de prenda o preparar probadores virtuales.
- Generación automática de datasets: los detectores pueden etiquetar preliminarmente grandes volúmenes de imágenes con cajas y máscaras, que después se revisan y corrigen para entrenar modelos propios, reduciendo el coste de anotación manual.
- Detección de manos para animación y captura gestual: hand_yolov9c.pt alcanza 0,810 de mAP 50 y puede usarse como etapa de localización previa a la estimación de pose de mano o al rigging de personajes.
- Control de calidad en pipelines de generación: integrado en un script de postproceso, el detector verifica que cada imagen generada contiene el número esperado de caras o personas antes de aceptarla o descartarla.

## Benchmarks y rendimiento

Los datos de la model card se refieren al conjunto de validación propio de cada tarea (caras, manos y personas), no a benchmarks de lenguaje. Valores tal y como los publica el autor:

| Modelo | Objetivo | mAP 50 | mAP 50-95 |
|---|---|---|---|
| face_yolov8n.pt | Cara 2D / realista | 0,660 | 0,366 |
| face_yolov8n_v2.pt | Cara 2D / realista | 0,669 | 0,372 |
| face_yolov8s.pt | Cara 2D / realista | 0,713 | 0,404 |
| face_yolov8m.pt | Cara 2D / realista | 0,737 | 0,424 |
| face_yolov9c.pt | Cara 2D / realista | 0,748 | 0,433 |
| hand_yolov8n.pt | Mano 2D / realista | 0,767 | 0,505 |
| hand_yolov8s.pt | Mano 2D / realista | 0,794 | 0,527 |
| hand_yolov9c.pt | Mano 2D / realista | 0,810 | 0,550 |
| person_yolov8n-seg.pt | Persona 2D / realista | 0,782 (bbox) / 0,761 (máscara) | 0,555 (bbox) / 0,460 (máscara) |
| person_yolov8s-seg.pt | Persona 2D / realista | 0,824 (bbox) / 0,809 (máscara) | 0,605 (bbox) / 0,508 (máscara) |
| person_yolov8m-seg.pt | Persona 2D / realista | 0,849 (bbox) / 0,831 (máscara) | 0,636 (bbox) / 0,533 (máscara) |
| deepfashion2_yolov8s-seg.pt | Ropa realista | 0,849 (bbox) / 0,840 (máscara) | 0,763 (bbox) / 0,675 (máscara) |

No se han publicado en la información disponible resultados sobre benchmarks externos como COCO completo, WIDER FACE oficial ni comparativas con otros detectores de terceros.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Como referencia orientativa (no publicada en la model card), las variantes de escala nano y small de YOLOv8 son modelos de pocos millones de parámetros que se ejecutan en GPU de consumo con holgura, e incluso en CPU.
- GPU recomendadas: no disponible. Por el tamaño de los checkpoints (el repositorio completo con los doce modelos ocupa 1,1 GB), cualquier GPU consumer reciente (gama RTX 30/40, o incluso integradas con soporte CUDA) es suficiente para las variantes n y s; las variantes m y c requieren algo más de memoria pero siguen estando lejos de las necesidades de un modelo de lenguaje.
- Cabe en GPU consumer: sí, según el tamaño de los checkpoints y la naturaleza de la familia YOLOv8/YOLOv9. No se especifican cifras oficiales.
- Opciones de despliegue: la model card documenta únicamente el uso mediante la librería `ultralytics` con `YOLO(path)`, previa descarga del checkpoint con `huggingface_hub.hf_hub_download`. No se documentan en la información disponible despliegues con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un detector de objetos. Para el caso de uso principal, la vía es la extensión ADetailer sobre Stable Diffusion WebUI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas con detectores de terceros ni métricas de otros repositorios, por lo que no es posible establecer una comparación externa fiable. La comparación interna entre las variantes del propio repositorio es la siguiente:

| Variante | Precisión (mAP 50) | Coste relativo | Elección típica |
|---|---|---|---|
| face_yolov8n.pt / face_yolov8n_v2.pt | 0,660 / 0,669 | El más bajo | Ejecución en tiempo real o hardware limitado |
| face_yolov8s.pt | 0,713 | Bajo | Equilibrio por defecto en retoque por lotes |
| face_yolov8m.pt | 0,737 | Medio | Cuando la precisión importa más que la velocidad |
| face_yolov9c.pt | 0,748 | Medio-alto | Máxima precisión en caras dentro de la colección |
| person_yolov8m-seg.pt | 0,849 (bbox) / 0,831 (máscara) | Medio-alto | Segmentación de personas de alta calidad |
| deepfashion2_yolov8s-seg.pt | 0,849 (bbox) / 0,840 (máscara) | Bajo | Segmentación de prendas con buena relación precisión/coste |

Comparativa con alternativas externas (otros detectores de caras o de personas): no disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni imágenes, solo cajas y máscaras. Cualquier expectativa de generación debe dirigirse al modelo de difusión que consuma sus salidas.
- Riesgo de falsos positivos y falsos negativos: con mAP 50-95 en torno a 0,37-0,43 en caras, la localización precisa en escenas difíciles (caras pequeñas, oclusiones, ángulos extremos) es imperfecta y afecta directamente a la calidad del inpainting posterior.
- Rendimiento dependiente del dominio: los checkpoints de cara están entrenados sobre una mezcla de imágenes realistas (WIDER FACE) y de anime, de modo que el comportamiento puede degradarse en dominios no representados (ilustración no japonesa, renders 3D, imágenes médicas).
- Cobertura de clases limitada: las 13 categorías de ropa provienen exclusivamente de DeepFashion2 y no cubren calzado, complementos ni otras taxonomías.
- Advertencia de seguridad de Hugging Face: ciertos checkpoints de segmentación figuran como "unsafe files" por el uso de `getattr` en el proceso de pickle. El autor sostiene que son legítimos por proceder de la librería oficial de Ultralytics, pero conviene descargarlos solo desde el repositorio oficial y verificar su integridad.
- Licencia: Apache 2.0 para los pesos del repositorio, lo que en principio permite uso comercial. Sin embargo, los datos de entrenamiento provienen de múltiples fuentes (WIDER FACE, COCO, DeepFashion2, AniSeg, conjuntos de Roboflow) cuyas condiciones de uso pueden imponer restricciones adicionales que la licencia del modelo no cubre.
- Ausencia de datos operativos: no se publican cifras de latencia, throughput, VRAM ni requisitos mínimos, lo que obliga a medir el rendimiento en el entorno de destino antes de desplegar en producción.
- Idiomas: no aplica; al ser un modelo de visión, no hay soporte multilingüe que evaluar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bingsu/adetailer
- DOI: https://doi.org/10.57967/hf/3633
- Extensión ADetailer (repositorio GitHub): https://github.com/bing-su/adetailer
- Librería Ultralytics: https://github.com/ultralytics/ultralytics
- Documentación de seguridad de pickle en Hugging Face: https://huggingface.co/docs/hub/security-pickle
- WIDER FACE: http://shuoyang1213.me/WIDERFACE/index.html
- Dataset skytnt/anime-segmentation: https://huggingface.co/datasets/skytnt/anime-segmentation
- AniSeg: https://github.com/jerryli27/AniSeg
- COCO 2017: https://cocodataset.org/#home
- DeepFashion2: https://github.com/switchablenorms/DeepFashion2
- Conjuntos de Roboflow citados por el autor: https://universe.roboflow.com/my-workspace-mph8o/anime-face-createml, https://universe.roboflow.com/0oooooo0/xml2txt-njqx1, https://universe.roboflow.com/sed-b8vkf/an-lfg5i, https://universe.roboflow.com/1-yshhi/anhdet, https://universe.roboflow.com/catwithawand/hand-detection-fuao9
