# sanjeevafk/navo-yolov8-esi-v6

## Resumen

NAVO YOLOv8-ESI v6 es un detector de objetos basado en YOLOv8, optimizado para imagen acústica de sonar de barrido lateral (side-scan sonar, SSS) y publicado por el autor sanjeevafk bajo licencia Apache 2.0. El modelo actúa como primera etapa (screening rápido en el borde) dentro de la pipeline NAVO, que combina la detección de candidatos con la segmentación posterior mediante Meta SAM 3.1 y la evaluación ecológica multimodal con Meta Muse. Su función es localizar anomalías acústicas (restos marinos, pecios, aeronaves sumergidas y minas) en teselas de 640×640 píxeles y generar cajas delimitadoras que sirven de prompt a las etapas siguientes.

La innovación principal frente a un YOLOv8 estándar es la incorporación de atención de canal Squeeze-and-Excitation (SE) en las capas de agregación de características C2f, lo que permite amplificar los retornos acústicos débiles (highlights) y atenuar el clutter reverberante del fondo marino. El modelo es muy compacto: 3.030.108 parámetros (~3,03 M) y 8,1 GFLOPs a 256×256, con latencias declaradas de ~2,4 ms en GPU y menos de 45 ms en CPU ARM/x86, lo que lo hace apto para despliegue en el borde.

Se distribuye exclusivamente en formato ONNX (FP16 de 5,88 MB y FP32 de 11,67 MB) junto con un checkpoint de referencia de clase única para restos marinos. La relevancia actual reside en su aplicación a la detección de munición sin explotar (UXO), minas navales y contaminación marina mediante sensores acústicos, un nicho con pocos modelos públicos y donde el tamaño reducido y la licencia permisiva facilitan la integración en plataformas autónomas submarinas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv8 con atención de canal Squeeze-and-Excitation (SE) en capas C2f; módulos GhostConv y FastC2f |
| Parámetros totales | 3.030.108 (~3,03 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | FP16 y FP32 (artefactos ONNX publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | en (etiquetas y documentación en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP16 y FP32); código fuente en PyTorch (`.py`) |
| Coste computacional | 8,1 GFLOPs a 256×256 |
| Entrada | Teselas de imagen sonar de 640×640 |
| Clases | 4 (`unknown_debris`, `airplane`, `mine`, `wreck`) |
| Tamaño de los artefactos | FP16: 5,88 MB; FP32: 11,67 MB; checkpoint debris FP16: 6,16 MB |
| Librería | ONNX Runtime |

## Arquitectura y entrenamiento

El modelo es un detector YOLOv8 modificado. La columna vertebral y el cuello emplean capas C2f en las que se insertan bloques SE (Squeeze-and-Excitation) que recalibran la importancia de cada canal de características; según el autor, esto permite amplificar los retornos especulares del sonar y suprimir la reverberación del fondo. Se incorporan además módulos GhostConv y FastC2f, orientados a reducir el coste computacional manteniendo capacidad de representación, lo que explica el reducido número de parámetros (3,03 M) y los 8,1 GFLOPs a 256×256. La cabeza de detección sigue el esquema estándar de YOLOv8 con cuatro clases tácticas.

En cuanto a los datos, la model card indica que el conjunto de evaluación es una partición estrictamente reservada de 962 imágenes de sonar de barrido lateral con 231 instancias anotadas, procedentes de encuestas multipaso NOAA Klein 5000, del benchmark SSS de Kaggle y del conjunto MILCO Klein 3500 de contramedidas de minas. No se especifica el número total de tokens ni de imágenes de entrenamiento, la composición exacta del dataset de entrenamiento, ni si se aplicaron técnicas de RLHF/DPO (no procede en un detector). Tampoco se documentan detalles de aumentación de datos, función de pérdida o hiperparámetros de entrenamiento. La innovación técnica destacable es la integración del detector como generador de prompts de caja para SAM 3.1, con separación de polígonos de highlight y sombra y un fallback local determinista basado en Otsu cuando el sistema opera en modo air-gapped.

## Capacidades

- Detección de objetos en imagen acústica de sonar de barrido lateral con cuatro clases: restos marinos desconocidos, aeronaves sumergidas, minas navales/UXO y pecios.
- Generación de cajas delimitadoras que actúan como prompts para segmentación con Meta SAM 3.1.
- Inferencia de baja latencia en el borde (~2,4 ms en GPU, <45 ms en CPU ARM/x86) apta para plataformas autónomas.
- Ejecución en CPU mediante ONNX Runtime con el artefacto FP32, y en GPU con FP16.
- Checkpoint de referencia de clase única para restos marinos (`yolo_esi_core_debris_fp16.onnx`).
- Integración en una pipeline de varias etapas con mensuración hidrográfica de sombras y evaluación ecológica multimodal (etapas externas, no incluidas en el modelo).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un detector de visión puro.
- No dispone de modo thinking, visión general RGB, audio ni otras modalidades.

## Casos de uso

- Barrido rápido de sonar de barrido lateral en vehículos autónomos submarinos (AUV): el modelo procesa teselas de 640×640 en menos de 45 ms en CPU, lo que permite screening en tiempo real a bordo sin GPU dedicada y con un consumo energético bajo.
- Detección de restos de pesca fantasma y basura marina: la clase `unknown_debris` alcanza AP50 de 0,8185 y recall de 78,69% en el conjunto de prueba, lo que la hace adecuada para campañas de limpieza y cartografiado de contaminación en fondos someros.
- Contramedidas de minas (MCM): la clase `mine` obtiene precisión del 70,73%, útil para priorizar contactos candidatos en flujos de inspección, aunque su recall del 29,59% obliga a usarla como filtro de primera etapa y no como clasificador final.
- Localización de pecios para arqueología subacuática y cartografía hidrográfica: la clase `wreck` logra AP50 de 0,7173 con precisión del 80,03%, suficiente para generar inventarios preliminares de cascos y estructuras.
- Generación de prompts para segmentación fina: las cajas del detector alimentan a SAM 3.1 para separar highlight y sombra de cada anomalía, lo que permite calcular la altura del objeto mediante la fórmula de relieve sombreado y estimar la impedancia acústica P95 dentro de la máscara de highlight.
- Procesamiento por lotes de encuestas históricas: al ser un ONNX de 5,88 MB, puede desplegarse en clústeres de CPU para reprocesar grandes archivos de sonar NOAA Klein 5000 sin necesidad de GPUs.
- Integración en sistemas de mando y control (C2): la pipeline completa exporta resultados en NMEA/KML, de modo que las detecciones del modelo pueden volcarse a sistemas de cartografía naval para revisión humana.
- Detección de aeronaves sumergidas en búsqueda y rescate: la clase `airplane` tiene recall del 69,20%, útil para triaje inicial de contactos en operaciones de localización de pecios aéreos.

## Benchmarks y rendimiento

Evaluación sobre una partición de prueba reservada de 962 imágenes de sonar de barrido lateral con 231 instancias anotadas:

| Clase | AP50 | Precisión | Recall | Fuente de sensor |
|---|---|---|---|---|
| `unknown_debris` | 0,8185 | 81,88% | 78,69% | NOAA Klein 5000 |
| `airplane` | 0,4950 | 57,20% | 69,20% | Kaggle SSS Benchmark |
| `mine` | 0,3862 | 70,73% | 29,59% | MILCO Klein 3500 |
| `wreck` | 0,7173 | 80,03% | 60,35% | Kaggle SSS Benchmark |
| Global | 0,6042 | 66,87% | 62,37% | — |

Métricas globales adicionales: F1 = 0,6454 y mAP50-95 = 0,3348. No se han publicado resultados comparativos con otros detectores en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB para el artefacto FP16 (5,88 MB de pesos más activaciones de una entrada de 640×640); el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA y ONNX Runtime, incluidas RTX 3060, RTX 4090, A100 y H100; el autor declara ~2,4 ms de latencia en GPU.
- CPU: funciona en ARM y x86 con ONNX Runtime en menos de 45 ms por tesela, lo que permite despliegue en dispositivos de borde sin acelerador.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1 GB de VRAM; también en sistemas embebidos tipo Jetson.
- Opciones de despliegue: ONNX Runtime (principal), con posibilidad de exportación a otros runtimes ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de visión).
- Latencia y throughput: ~2,4 ms por tesela en GPU y <45 ms en CPU según el autor; el throughput exacto en imágenes por segundo no se especifica.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros detectores de sonar de barrido lateral en la información proporcionada. Como referencia estructural, se puede contrastar con el YOLOv8 base del que deriva:

| Modelo | Parámetros | Contexto/entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAVO YOLOv8-ESI v6 | 3,03 M | 640×640 | 4 (sonar) | Apache 2.0 | ONNX en Hugging Face |
| YOLOv8 nano (referencia) | ~3,2 M | 640×640 | 80 (COCO) | AGPL-3.0 | Ultralytics |
| YOLOv8 small (referencia) | ~11,2 M | 640×640 | 80 (COCO) | AGPL-3.0 | Ultralytics |

La comparación con otros detectores específicos de sonar (por ejemplo, variantes entrenadas sobre MILCO o NOAA) no está disponible en la información consultada, por lo que no se puede establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- El recall de la clase `mine` es bajo (29,59%), lo que implica un riesgo alto de falsos negativos en aplicaciones de contramedidas; no debe usarse como único sistema de decisión en entornos operativos.
- La clase `airplane` presenta un AP50 moderado (0,4950) y precisión del 57,20%, con una tasa de falsos positivos considerable.
- El modelo está entrenado exclusivamente con datos de sonar de barrido lateral de sensores concretos (NOAA Klein 5000, MILCO Klein 3500, Kaggle SSS); el rendimiento puede degradarse con otros sensores, frecuencias o condiciones de fondo no representadas.
- No se documenta el conjunto de entrenamiento ni posibles sesgos de muestreo geográfico o de tipo de fondo marino; los resultados de la partición de prueba no garantizan generalización.
- Riesgo de alucinación en el sentido de detecciones espurias sobre clutter reverberante, especialmente en fondos con textura compleja.
- El modelo solo soporta inglés en etiquetas y documentación; no es multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; al tratarse de un modelo con posibles aplicaciones de defensa, el usuario debe verificar el cumplimiento normativo de su jurisdicción.
- Las etapas 2 a 4 de la pipeline (SAM 3.1, mensuración y Meta Muse) dependen de la API de Meta y no están incluidas en este repositorio; el fallback local es determinista pero de menor calidad.
- No se han publicado curvas de entrenamiento, ablaciones ni comparativas con detectores alternativos, lo que limita la evaluación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanjeevafk/navo-yolov8-esi-v6
- Repositorio GitHub del proyecto NAVO: https://github.com/sanjeevafk/navo
- API de Meta para SAM 3.1 y Muse: https://api.meta.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- ONNX: https://onnx.ai/
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
