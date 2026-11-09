# ljc-1222/marine-debris-detection

## Resumen

El repositorio `ljc-1222/marine-debris-detection` no contiene un unico modelo generativo, sino un paquete de pesos entrenados para deteccion y clasificacion de residuos marinos. Incluye cuatro detectores de objetos (Co-DETR con backbone Co-DINO ViT-L/16, TinyFormer-XL-PBM, RF-DETR Legacy Large y YOLO26x) y tres clasificadores de recorte (DINOv3 ViT-H+/16 con adaptadores LoRA, DINOv3 ViT-L/16 y SigLIP 2 ViT-L/16 a 384 px). El autor es el usuario de Hugging Face `ljc-1222`, que mantiene el codigo de entrenamiento e inferencia en un repositorio de GitHub asociado.

El problema que aborda es la identificacion automatica de 34 tipos de residuos marinos en imagenes, una tarea de vision por computador orientada a monitorizacion medioambiental, limpieza de costas y analisis de contaminacion en entornos acuaticos. No es un modelo de lenguaje: la etiqueta `object-detection` y la libreria `pytorch` indican que se distribuyen checkpoints en formato `.pth`/`.pt` para pipelines de deteccion.

Su relevancia actual es limitada pero concreta: agrupa en un solo repositorio varios detectores de ultima generacion (Co-DETR, RF-DETR, YOLO26x) y clasificadores basados en DINOv3 y SigLIP 2, lo que permite comparar arquitecturas sobre un mismo dominio especializado. El repositorio ocupa 8,6 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples: Co-DETR (Co-DINO ViT-L/16), TinyFormer-XL-PBM, RF-DETR Legacy Large, YOLO26x (detectores); DINOv3 ViT-H+/16 (LoRA), DINOv3 ViT-L/16, SigLIP 2 ViT-L/16 384 px (clasificadores) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (vision por computador, sin contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en punto flotante `.pth`/`.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (etiqueta de idioma del repositorio; la tarea es visual, no linguistica) |
| Licencia | component-specific-terms (licencia compuesta; terminos por componente en `THIRD_PARTY_NOTICES.md`, `NOTICE` y `licenses/`) |
| Formato de pesos | `.pth` (detectores y clasificadores) y `.pt` (YOLO26x, clasificadores DINOv3 y SigLIP 2) |
| Tamano del repositorio | 8,6 GB |
| Numero de clases | 34 tipos de residuos marinos |
| Libreria | pytorch |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

El paquete combina dos familias de modelos. Por un lado, detectores de objetos: Co-DETR con backbone Co-DINO ViT-L/16 (transformer con atencion y decodificacion tipo DETR), TinyFormer-XL-PBM (transformer compacto), RF-DETR Legacy Large (variante DETR de Roboflow) y YOLO26x (familia YOLO en su variante extra-large). Por otro, clasificadores de recorte basados en backbones visuales de gran tamano: DINOv3 ViT-H+/16 ajustado con LoRA, DINOv3 ViT-L/16 y SigLIP 2 ViT-L/16 a 384 px. La combinacion sugerida es un detector para localizar residuos y un clasificador para refinar la categoria entre las 34 clases.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de imagenes, el esquema de aumentacion ni si se aplicaron tecnicas de ajuste fino especificas (mas alla del uso de LoRA en el clasificador DINOv3 ViT-H+/16). La model card indica que los ficheros usan pesos ya entrenados y que no es necesario reentrenar para la inferencia. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de las propias de cada arquitectura base.

## Capacidades

- Deteccion de objetos en imagenes con 34 clases de residuos marinos, mediante cuatro detectores alternativos.
- Clasificacion de recortes de imagen en las mismas 34 categorias, mediante tres clasificadores basados en DINOv3 y SigLIP 2.
- Procesamiento de imagenes en color a resolucion variable; SigLIP 2 ViT-L/16 documentado a 384 px.
- Ajuste fino con LoRA en el clasificador DINOv3 ViT-H+/16, lo que permite reutilizar el backbone con adaptadores ligeros.
- Inferencia en PyTorch con pesos listos para usar (sin reentrenamiento).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente vision por computador.
- Capacidades multilingues: no aplica; la etiqueta `en` refleja el idioma de la documentacion, no una capacidad del modelo.

## Casos de uso

- Monitorizacion de playas y costas: desplegar YOLO26x o RF-DETR Legacy Large sobre imagenes de camaras fijas para localizar residuos y activar protocolos de limpieza; la variante YOLO ofrece el mejor equilibrio latencia/precision para video en tiempo real.
- Analisis de imagenes de drones o satelite: usar Co-DETR con backbone ViT-L/16 para deteccion de residuos de gran extension en aguas abiertas, donde la capacidad del transformer ayuda con objetos pequenos y contextos complejos.
- Clasificacion fina de residuos recogidos: aplicar DINOv3 ViT-H+/16 con LoRA o SigLIP 2 ViT-L/16 sobre recortes para asignar la categoria exacta entre las 34 clases, por ejemplo para inventarios de residuos por material.
- Investigacion medioambiental: comparar el rendimiento de cuatro detectores y tres clasificadores sobre un mismo dominio para estudiar que arquitectura conviene en escenarios de contaminacion marina.
- Pipelines de triaje en plantas de reciclaje o puertos: combinar un detector rapido (YOLO26x) con un clasificador de recorte (SigLIP 2) para separar residuos por categoria antes de la gestion manual.
- Educacion y prototipado: usar los checkpoints como base para proyectos de vision con PyTorch, ya que el repositorio incluye el codigo de descarga y entrenamiento en GitHub.
- Auditoria de contaminacion en rios y lagos: procesar lotes de imagenes con Co-DETR o RF-DETR para generar estadisticas de presencia de residuos por tipo y localizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por arquitectura (no confirmada por el autor): un ViT-L/16 en fp32 ronda los 1,2 GB de pesos y requiere varios GB de VRAM en inferencia con lotes pequenos; un ViT-H+/16 supera los 2,5 GB de pesos. Los detectores DETR con backbone ViT-L/16 son los mas exigentes.
- GPU recomendadas: no especificadas por el autor. Por tamano de backbone, se espera que ViT-L/16 y ViT-H+/16 requieran GPU con al menos 16-24 GB de VRAM (A100, H100, RTX 4090, L40S) para lotes moderados; YOLO26x y TinyFormer-XL-PBM son mas ligeros y podrian ejecutarse en GPU consumer de gama media.
- Compatibilidad con GPU consumer: probable para YOLO26x y TinyFormer-XL-PBM; incierta para Co-DETR ViT-L/16 y DINOv3 ViT-H+/16 sin cuantizacion o reduccion de lote.
- Opciones de despliegue: al ser pesos PyTorch (`.pth`/`.pt`), el despliegue se realiza mediante el codigo del proyecto en GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a vision).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| marine-debris-detection (este) | Deteccion + clasificacion | 34 | no disponible (SigLIP 2 a 384 px) | component-specific-terms | Hugging Face + GitHub |
| YOLOv8 / YOLO11 (Ultralytics) | Deteccion generica | configurable | resolucion configurable | AGPL-3.0 / comercial | Hugging Face, Ultralytics |
| RF-DETR (Roboflow) | Deteccion generica | configurable | resolucion configurable | Apache-2.0 (segun version) | Hugging Face, GitHub |
| DINOv3 (Meta) | Backbone / clasificacion | configurable | resolucion configurable | licencia propia de Meta | Hugging Face |

La comparativa es estructural: este repositorio no publica metricas propias, por lo que no es posible comparar precision, mAP ni velocidad con las alternativas. Su ventaja es la especializacion en 34 clases de residuos marinos y la disponibilidad de varios detectores en un mismo paquete; su desventaja es la ausencia de benchmarks y de documentacion de rendimiento.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni metricas de precision (mAP, F1), lo que impide evaluar su calidad real frente a alternativas.
- Licencia compuesta (`component-specific-terms`): cada componente (Co-DETR, YOLO26x, DINOv3, SigLIP 2, RF-DETR) conserva sus propios terminos, que deben revisarse en `THIRD_PARTY_NOTICES.md`, `NOTICE` y `licenses/` antes de cualquier uso comercial. Algunos backbones de terceros pueden tener restricciones.
- Riesgo de falsos positivos y negativos en escenarios visuales complejos (reflejos, espuma, vegetacion) no documentado por el autor.
- Sesgos potenciales derivados del dataset de entrenamiento, cuya composicion no se detalla: posible infrarepresentacion de ciertos tipos de residuos o de condiciones de iluminacion.
- Sin soporte de texto ni de idiomas: no es un modelo de lenguaje y no debe usarse para tareas linguisticas.
- El repositorio no registra descargas ni likes, y la fecha de creacion (2026) es posterior a la de muchos modelos base citados; conviene verificar la procedencia y el estado de mantenimiento antes de usarlo en produccion.
- No se documentan versiones cuantizadas ni optimizaciones de despliegue, lo que puede limitar el uso en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ljc-1222/marine-debris-detection
- Repositorio del proyecto en GitHub: https://github.com/ljc-1222/Marine-Debris-Detection
- Avisos de terceros: https://huggingface.co/ljc-1222/marine-debris-detection/blob/main/THIRD_PARTY_NOTICES.md
- Checkpoint Co-DETR ViT-L/16: https://huggingface.co/ljc-1222/marine-debris-detection/resolve/main/checkpoints/detectors/co-detr-vit-l16.pth
- Checkpoint TinyFormer-XL-PBM: https://huggingface.co/ljc-1222/marine-debris-detection/resolve/main/checkpoints/detectors/tinyformer-xl-pbm.pth
- Checkpoint RF-DETR Legacy Large: https://huggingface.co/ljc-1222/marine-debris-detection/resolve/main/checkpoints/detectors/rf-detr-legacy-large.pth
- Checkpoint YOLO26x: https://huggingface.co/ljc-1222/marine-debris-detection/resolve/main/checkpoints/detectors/yolo26x.pt
- Clasificador DINOv3 ViT-H+/16 (LoRA): https://huggingface.co/ljc-1222/marine-debris-detection/resolve/main/checkpoints/classifiers/dinov3-vit-h16plus-lora.pt
- Clasificador DINOv3 ViT-L/16: https://huggingface.co/ljc-1222/marine-debris-detection/resolve/main/checkpoints/classifiers/dinov3-vit-l16.pt
- Clasificador SigLIP 2 ViT-L/16 384 px: https://huggingface.co/ljc-1222/marine-debris-detection/resolve/main/checkpoints/classifiers/siglip2-vit-l16-384.pt
