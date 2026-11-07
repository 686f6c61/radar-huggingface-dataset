# PlantNet/mobilenetv4-conv-s-plantclef2024

## Resumen

MobileNetV4-Conv-S para la flora del suroeste de Europa es un clasificador de imágenes compacto desarrollado por PlantNet (equipo de Pl@ntNet, Inria y CIRAD) para identificar 7.806 especies vegetales. El modelo parte de los pesos ImageNet-1K de `timm/mobilenetv4_conv_small.e2400_r224_in1k` y se ajusta finamente sobre el conjunto de entrenamiento de Pl@ntCLEF2024 mediante destilación de conocimiento desde un profesor ViT-B/14 (DINOv2) de 92,58 M de parámetros.

La motivación es clara: el profesor ViT-B ofrece una precisión Top-1 del 75,59 % en el split de test mono-especie de Pl@ntCLEF2026, pero su coste computacional lo hace inviable en dispositivos móviles o de borde. El estudiante MobileNetV4-Conv-S, con solo 12,52 M de parámetros (un 86,5 % menos), alcanza un 62,50 % Top-1 y un 84,07 % Top-5 a resolución 512 × 512, lo que lo convierte en una opción práctica para aplicaciones de campo, ciencia ciudadana y monitorización de biodiversidad en hardware limitado.

El modelo se publica con licencia Apache 2.0, formato safetensors y compatibilidad con la librería `timm` (>= 1.0.12), lo que facilita su integración en pipelines existentes de visión por computador. Su ámbito geográfico y taxonómico está acotado explícitamente al suroeste de Europa, y está pensado para fotografías de una sola planta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV4-Conv-S (CNN, bloque Universal Inverted Bottleneck) |
| Parámetros totales | 12.517.598 (12,52 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; entrada 512 × 512 RGB) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | no aplica (modelo visual; etiquetas taxonómicas en nomenclatura científica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `timm`) |

## Arquitectura y entrenamiento

La arquitectura es MobileNetV4-Conv-S, presentada en el artículo *MobileNetV4 — Universal Models for the Mobile Ecosystem* (arXiv:2404.10518). Su bloque central es el Universal Inverted Bottleneck (UIB), que unifica Inverted Bottleneck, ConvNext, Feed Forward Network y una variante Extra Depthwise (ExtraDW) en una estructura flexible y eficiente para dispositivos móviles. El modelo es puramente convolucional, sin atención, lo que reduce el coste de inferencia en hardware de borde.

El entrenamiento consistió en un ajuste fino de 50 épocas sobre el split de entrenamiento de Pl@ntCLEF2024, partiendo de pesos ImageNet-1K. La innovación principal es la destilación de conocimiento desde el profesor `PlantNet/vit_base_patch14_reg4_dinov2_lvd142m.pc24_all` (ViT-B/14 con DINOv2, 92,58 M de parámetros), siguiendo el método descrito en *Energy-Efficient Plant Monitoring via Knowledge Distillation* (arXiv:2604.27178). Las imágenes se redimensionaron a un lado máximo de 800 píxeles para el conjunto de Pl@ntCLEF2026, y la entrada del modelo es de 512 × 512 RGB con normalización ImageNet (media 0.485, 0.456, 0.406; desviación 0.229, 0.224, 0.225). No se documenta el uso de RLHF ni DPO, algo esperable en un modelo de clasificación visual.

## Capacidades

- Clasificación de imágenes de plantas en 7.806 especies de la flora del suroeste de Europa, devolviendo una distribución de probabilidad sobre las clases.
- Salida Top-k con identificador de especie, nombre científico, género y familia a través de `labels.json`.
- Diseñado para una sola planta por imagen; no soporta de forma nativa escenas con múltiples especies.
- Inferencia eficiente en CPU y hardware de borde gracias a su naturaleza convolucional y bajo número de parámetros.
- Integración directa con `timm` y `huggingface_hub` para carga de pesos y transformaciones.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de imagen puro.
- No dispone de modo thinking, visión generativa, audio ni capacidades multimodales más allá de la clasificación visual.

## Casos de uso

- Identificación de plantas en aplicaciones móviles de ciencia ciudadana: el modelo cabe en un dispositivo de borde y devuelve el Top-5 de especies para que el usuario confirme, con una latencia compatible con la captura de una foto en campo.
- Monitorización de biodiversidad en parcelas agrícolas o espacios naturales: integrado en trampas de cámara o drones ligeros, permite clasificar observaciones individuales y agregar recuentos por especie a lo largo del tiempo.
- Herramientas educativas de botánica: un cliente web o móvil puede mostrar la especie probable, el género y la familia a partir de una fotografía, con la ventaja de que el modelo es ligero y de licencia permisiva.
- Pre-filtrado en pipelines de anotación: dado su bajo coste, se puede usar como primera etapa para descartar o priorizar imágenes antes de pasarlas a un modelo mayor como el profesor ViT-B, reduciendo el coste total de anotación.
- Aplicaciones offline en zonas rurales sin conectividad: al ejecutarse en CPU o en aceleradores móviles, permite identificación local sin depender de la nube.
- Investigación en destilación de conocimiento: sirve como referencia reproducible de un estudiante MobileNetV4 destilado desde un ViT-B para experimentos de compresión y eficiencia energética.
- Integración en sistemas de alerta temprana de especies invasoras: con umbrales calibrados sobre la probabilidad Top-1, se pueden generar avisos cuando la confianza supera un valor configurado, siempre con revisión humana.

## Benchmarks y rendimiento

Evaluación sobre el split de test mono-especie de Pl@ntCLEF2026, según la model card:

| Modelo | Arquitectura | Parámetros | Resolución | Top-1 | Top-5 |
|---|---|---:|---:|---:|---:|
| Profesor Pl@ntNet | ViT-B/14 | 92,58 M | 518 × 518 | 75,59 % | 92,81 % |
| Estudiante destilado | MobileNetV4-Conv-S | 12,49 M | 512 × 512 | 62,50 % | 84,07 % |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), algo esperable al tratarse de un modelo de clasificación de imágenes y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 12,52 M de parámetros, más el espacio de activaciones para una imagen de 512 × 512; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes se pueden usar A100, H100 o L4, aunque el modelo está optimizado para hardware modesto.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series GTX/RTX antiguas), en iGPU y en aceleradores móviles; también se ejecuta en CPU sin problema.
- Opciones de despliegue: `timm` con PyTorch (vía `timm.create_model("hf-hub:...")`), exportación a ONNX, TensorFlow Lite o Core ML para móvil, y `huggingface_hub` para descarga de pesos y etiquetas.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el tamaño del modelo y su naturaleza convolucional sugieren latencias de milisegundos en GPU y decenas de milisegundos en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Resolución | Top-1 (Pl@ntCLEF2026) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| PlantNet/mobilenetv4-conv-s-plantclef2024 | MobileNetV4-Conv-S | 12,52 M | 512 × 512 | 62,50 % | Apache 2.0 | Hugging Face (`timm`) |
| PlantNet/vit_base_patch14_reg4_dinov2_lvd142m.pc24_all (profesor) | ViT-B/14 DINOv2 | 92,58 M | 518 × 518 | 75,59 % | no disponible en la información | Hugging Face |
| timm/mobilenetv4_conv_small.e2400_r224_in1k | MobileNetV4-Conv-S | ~12,5 M | 224 × 224 | no aplica (ImageNet-1K, no flora) | Apache 2.0 | Hugging Face (`timm`) |

La comparación directa con el profesor muestra el compromiso habitual de la destilación: se pierden unos 13 puntos de Top-1 y 8,7 puntos de Top-5 a cambio de reducir los parámetros en un 86,5 %. Frente al MobileNetV4-Conv-S de ImageNet, la diferencia es el dominio: el modelo de PlantNet está especializado en 7.806 especies y no en las 1.000 clases de ImageNet.

## Limitaciones y advertencias

- Ámbito geográfico y taxonómico restringido: solo cubre 7.806 especies del suroeste de Europa; las plantas de otras regiones o especies no incluidas se asignarán a la clase más parecida del conjunto, con riesgo de error grave.
- Diseñado para una sola planta por imagen: las escenas con varias especies (por ejemplo, parcelas de vegetación) requieren métodos multi-etiqueta adicionales, como inferencia por teselas, agregación de puntuaciones y umbrales calibrados.
- Precisión limitada: un 62,50 % de Top-1 implica que aproximadamente una de cada tres predicciones Top-1 es incorrecta; en producción conviene usar Top-5 y revisión humana en aplicaciones sensibles.
- Riesgo de sesgo: el rendimiento puede variar según la calidad de la foto, la fase fenológica, la iluminación y la distribución del conjunto de entrenamiento de Pl@ntCLEF2024; no se documentan análisis de sesgo por especie, región o tipo de imagen.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la exactitud taxonómica; la responsabilidad de validación recae en el integrador.
- No se documentan tipos de cuantización ni cifras de latencia o throughput, lo que obliga a medir el rendimiento en el hardware objetivo antes de desplegar.
- El modelo no genera texto ni explicaciones: solo devuelve probabilidades sobre clases, por lo que no puede justificar sus predicciones de forma lingüística.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PlantNet/mobilenetv4-conv-s-plantclef2024
- Modelo profesor: https://huggingface.co/PlantNet/vit_base_patch14_reg4_dinov2_lvd142m.pc24_all
- Pesos ImageNet de partida: https://huggingface.co/timm/mobilenetv4_conv_small.e2400_r224_in1k
- Artículo MobileNetV4: https://arxiv.org/abs/2404.10518
- Artículo del método de destilación: https://arxiv.org/abs/2604.27178
- Pl@ntNet: https://plantnet.org/en/
- Pl@ntNet identify: https://identify.plantnet.org/fr
- Pl@ntCLEF2026: https://www.imageclef.org/PlantCLEF2026
- Repositorio de modelos del profesor (Zenodo): https://doi.org/10.5281/zenodo.10848263
