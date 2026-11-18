# PlantNet/mobilenetv4-hybrid-m-plantclef2024

## Resumen

MobileNetV4-Hybrid-M para flora del suroeste de Europa es un modelo de clasificación de imágenes desarrollado por PlantNet, el equipo detrás de la plataforma Pl@ntNet y de la competición Pl@ntCLEF. Resuelve una tarea muy concreta: identificar una de 7.806 especies de plantas vasculares presentes en la flora del suroeste europeo a partir de una fotografía de una observación individual. El modelo se presenta como un "student" destilado del teacher ViT-B/14 de Pl@ntCLEF, con el objetivo de llevar la precisión de un transformer grande a hardware móvil y de borde.

La arquitectura es MobileNetV4-Hybrid-M, una red híbrida que combina bloques convolucionales con atención móvil, inicializada con pesos de ImageNet-1K y afinada durante 50 épocas sobre el split de entrenamiento de Pl@ntCLEF2024. Con 19,79 millones de parámetros y entrada fija de 512 × 512 píxeles, ofrece un compromiso precisión-eficiencia interesante: alcanza un 71,40 % de Top-1 y un 90,60 % de Top-5 en el split de test de Pl@ntCLEF2026, frente al 75,59 % / 92,81 % del teacher ViT-B y al 62,50 % / 84,08 % del student convolucional puro MobileNetV4-Conv-S.

Su relevancia actual radica en que demuestra que la destilación de conocimiento desde un ViT grande permite desplegar identificación botánica de alta precisión en dispositivos con recursos limitados, sin depender de conectividad ni de infraestructura de servidor. La licencia Apache 2.0 y la disponibilidad de pesos en safetensors y ONNX facilitan su integración en aplicaciones reales de ciencia ciudadana, monitorización de biodiversidad y agricultura de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4-Hybrid-M (CNN híbrida con atención móvil) |
| Parametros totales | 19.868.974 (19,79 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 512 × 512) |
| Tipos de cuantizacion | no disponible en la información proporcionada; se distribuye FP32 (safetensors y ONNX) |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin componente textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (timm), ONNX (FP32, batch dinámico, entrada 512 × 512) |

## Arquitectura y entrenamiento

MobileNetV4-Hybrid-M es una red neuronal convolucional híbrida que intercala bloques convolucionales con bloques de atención móvil (mobile attention), diseñada por Google Research para ofrecer un equilibrio óptimo entre precisión y eficiencia computacional en dispositivos móviles. El modelo parte de los pesos preentrenados en ImageNet-1K de `timm/mobilenetv4_hybrid_medium.ix_e550_r384_in1k` y se afina sobre el split de entrenamiento de Pl@ntCLEF2024 durante 50 épocas, con imágenes redimensionadas a un lado máximo de 800 píxeles y entrada de inferencia fija de 512 × 512.

El entrenamiento emplea destilación de conocimiento desde el teacher `PlantNet/vit_base_patch14_reg4_dinov2_lvd142m.pc24_all` (ViT-B/14 con 92,58 M de parámetros, entrada 518 × 518), siguiendo el método descrito en *Energy-Efficient Plant Monitoring via Knowledge Distillation* (Moummad et al., 2026, arXiv:2604.27178). La normalización utilizada es la estándar de ImageNet: media (0.485, 0.456, 0.406) y desviación típica (0.229, 0.224, 0.225). No se especifican en la información disponible detalles sobre la composición exacta del dataset, el uso de aumentos de datos concretos ni si hubo una fase de RLHF o DPO (no aplicable en un modelo de clasificación).

## Capacidades

- Clasificación de imágenes de plantas en 7.806 especies de la flora del suroeste de Europa, devolviendo una distribución de probabilidad sobre las clases.
- Identificación de especie a partir de una fotografía de una observación individual de planta.
- Salida jerárquica enriquecida: `labels.json` incluye ID de especie, nombre científico, género y familia para cada logit.
- Inferencia en CPU y GPU mediante ONNX Runtime con batch dinámico, sin dependencia de PyTorch.
- Integración nativa con `timm` (versión >= 1.0.12) y `huggingface_hub`.
- Diseñado para despliegue en móvil y edge (edge-ai, mobile), con 19,79 M de parámetros y pesos FP32.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imágenes puro.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Identificación botánica en aplicaciones móviles de ciencia ciudadana: el modelo puede ejecutarse en el propio dispositivo (edge-ai) para clasificar una foto de planta entre 7.806 especies del suroeste europeo, reduciendo la dependencia de servidores y permitiendo uso offline en campo.
- Monitorización de biodiversidad en inventarios ecológicos: integrado en pipelines de procesamiento por lotes con ONNX Runtime, permite etiquetar automáticamente grandes volúmenes de fotografías de observaciones individuales recogidas en campañas de campo.
- Agricultura de precisión y seguimiento de cultivos y malas hierbas: la clasificación a nivel de especie y la información de género y familia en `labels.json` permiten enrutar las detecciones hacia módulos agronómicos específicos.
- Aplicaciones educativas y divulgativas: un clasificador ligero que cabe en dispositivos de bajo coste facilita herramientas de aprendizaje botánico en aulas y museos, mostrando especie, género y familia de la planta fotografiada.
- Pre-filtrado en pipelines de anotación: dado su bajo coste computacional, puede usarse como primera etapa para descartar o priorizar imágenes antes de pasarlas al teacher ViT-B/14, que es más preciso pero 4,7 veces más grande.
- Despliegue en estaciones de campo con conectividad limitada: el grafo ONNX FP32 con batch dinámico y entrada 512 × 512 puede ejecutarse en dispositivos embebidos y edge servers sin PyTorch, lo que simplifica el mantenimiento en ubicaciones remotas.
- Investigación en destilación de conocimiento: sirve como referencia reproducible de un student híbrido destilado desde un ViT-B en una tarea de clasificación fine-grained con 7.806 clases.

## Benchmarks y rendimiento

Evaluación sobre el split de test de una sola especie de Pl@ntCLEF2026, según la model card del autor:

| Modelo | Arquitectura | Parámetros | Resolución | Top-1 | Top-5 |
|---|---|---:|---:|---:|---:|
| Pl@ntCLEF teacher | ViT-B/14 | 92,58 M | 518 × 518 | 75,59 % | 92,81 % |
| Distilled Conv-S student | MobileNetV4-Conv-S | 12,49 M | 512 × 512 | 62,50 % | 84,08 % |
| Distilled Hybrid-M student (este modelo) | MobileNetV4-Hybrid-M | 19,79 M | 512 × 512 | 71,40 % | 90,60 % |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), ya que no aplican a un modelo de clasificación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para batch pequeño, dado el tamaño del modelo (19,79 M de parámetros, ~80 MB en FP32) y la entrada de 512 × 512.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, así como A100 o H100 para despliegues de alto throughput con lotes grandes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también en CPU y en dispositivos móviles gracias a su diseño edge-ai.
- Opciones de despliegue: `timm` con PyTorch, ONNX Runtime (>= 1.18) con el grafo `onnx/model.onnx`, y exportación a otros runtimes compatibles con ONNX. No se mencionan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El repositorio incluye un ejemplo de paridad numérica y hashes SHA-256 en `onnx/metadata.json`, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Resolución | Top-1 (Pl@ntCLEF2026) | Top-5 (Pl@ntCLEF2026) | Licencia |
|---|---|---:|---:|---:|---:|---|
| MobileNetV4-Hybrid-M (este modelo) | Híbrida CNN + atención móvil | 19,79 M | 512 × 512 | 71,40 % | 90,60 % | Apache 2.0 |
| PlantNet/mobilenetv4-conv-s-plantclef2024 | MobileNetV4-Conv-S | 12,49 M | 512 × 512 | 62,50 % | 84,08 % | no disponible en la información |
| PlantNet/vit_base_patch14_reg4_dinov2_lvd142m.pc24_all (teacher) | ViT-B/14 | 92,58 M | 518 × 518 | 75,59 % | 92,81 % | no disponible en la información |

El modelo se sitúa entre el student convolucional puro y el teacher ViT-B: sacrifica 4,19 puntos de Top-1 respecto al teacher a cambio de reducir los parámetros en un factor de 4,7, y supera al Conv-S en 8,90 puntos de Top-1 con solo 7,30 M de parámetros adicionales. No se dispone de información sobre otros modelos comparables de la misma categoría fuera del ecosistema PlantNet.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente sobre la flora del suroeste de Europa; las especies de otras regiones biogeográficas no están representadas y se clasificarán erróneamente entre las 7.806 clases disponibles.
- Riesgo de alucinación: como todo clasificador, siempre devuelve una distribución de probabilidad sobre las clases, incluso ante imágenes que no contienen plantas o que muestran especies fuera de su ámbito; es necesario aplicar umbrales de confianza y mecanismos de rechazo.
- Limitación de entrada: espera una fotografía de una observación individual de planta. Las imágenes con varias especies (parcelas de vegetación, inventarios multi-especie) requieren un método multi-etiqueta separado, como inferencia por teselas, agregación de puntuaciones y umbrales calibrados.
- Limitación de resolución: la entrada es fija a 512 × 512 píxeles; detalles diagnósticos finos (hojas pequeñas, flores diminutas) pueden perderse en la fase de redimensionado.
- Limitación de idioma: no aplica, ya que el modelo no procesa texto; las etiquetas de especie se proporcionan en nomenclatura científica latina.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los datos de entrenamiento de Pl@ntCLEF2024 y las del modelo base de ImageNet-1K utilizadas para la inicialización.
- Caveat para producción: no se publican cifras de latencia ni de throughput, por lo que el dimensionado de infraestructura debe medirse empíricamente en el hardware objetivo. El modelo se distribuye en FP32; no se documentan versiones cuantizadas oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PlantNet/mobilenetv4-hybrid-m-plantclef2024
- Teacher ViT-B/14: https://huggingface.co/PlantNet/vit_base_patch14_reg4_dinov2_lvd142m.pc24_all
- Student convolucional MobileNetV4-Conv-S: https://huggingface.co/PlantNet/mobilenetv4-conv-s-plantclef2024
- Pesos ImageNet-1K de inicialización: https://huggingface.co/timm/mobilenetv4_hybrid_medium.ix_e550_r384_in1k
- Paper del método (arXiv:2604.27178): https://arxiv.org/abs/2604.27178
- Pl@ntCLEF2026: https://www.imageclef.org/PlantCLEF2026
- Pl@ntNet: https://plantnet.org/
- Pl@ntNet identify: https://identify.plantnet.org/
- Documentación de Pl@ntNet: https://docs.plantnet.org/fr/get-started/
