# davanstrien/page-script-id

## Resumen

Page script ID es un modelo de clasificación de imágenes desarrollado por davanstrien (Daniel van Strien) que identifica el sistema de escritura presente en una página de documento sin necesidad de ejecutar OCR. Se basa en MobileNetV4-conv-small, una CNN compacta de 2,52 millones de parámetros, y devuelve una probabilidad calibrada e independiente para cada uno de 21 sistemas de escritura, lo que permite detectar páginas con escritura mixta o marcar como `unknown` aquellas en las que el modelo no tiene confianza. Su relevancia práctica está en el enrutamiento previo de documentos: decidir qué modelo OCR o paquete de idioma aplicar a cada página antes de procesarla.

El modelo se ha destilado a partir de un ensemble de tres docentes (convnext_small, hgnetv2_b4 y caformer_s36) mediante knowledge distillation, ejecutada en Hugging Face Jobs. Está pensado para entornos de producción con requisitos de latencia y coste bajos: procesa una página en 33 ms en un solo hilo de CPU, 11 ms en cuatro hilos y alcanza 1.773 páginas por segundo en una GPU A10G con bf16 y batch 64. El peso en disco es de aproximadamente 10,1 MB en formato ONNX o safetensors.

La entrada es una página en escala de grises reescalada a 640 × 640, y la salida son 21 probabilidades independientes (clasificación multi-etiqueta), lo que lo hace adecuado tanto para páginas monolingües como para páginas con múltiples escrituras. El modelo se publica con licencia Apache 2.0 y está disponible en dos formatos: pesos timm (safetensors) y un grafo ONNX con normalización, temperatura y sigmoide ya integrados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV4-conv-small (clasificación de imágenes) |
| Parámetros totales | 2.545.013 (2,52 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 640 × 640) |
| Tipos de cuantización | no disponible (se distribuyen pesos safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | 21 sistemas de escritura: Arab, Armn, Beng, Cyrl, Deva, Ethi, Geor, Grek, Gujr, Hani, Hang, Hebr, Jpan, Knda, Khmr, Latn, Mlym, Mymr, Taml, Telu, Thai (etiquetas de idioma declaradas: multilingüe, en, de, fr, es, pt, it, nl, sv, pl, tr, id, vi, ru, uk, el, ar, fa, ur, he, hi, bn, gu, ta, te, kn, ml, th, km, my, ka, hy, am, zh, ja, ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (timm) y ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es una MobileNetV4-conv-small, una red convolucional ligera diseñada para inferencia de bajo coste. El modelo parte de los pesos preentrenados de `timm/mobilenetv4_conv_small.e2400_r224_in1k` y se ha ajustado para producir 21 salidas en lugar de las 1.000 clases de ImageNet. La cabeza de clasificación es multi-etiqueta: cada escritura recibe una probabilidad sigmoide independiente, en lugar de una distribución softmax mutuamente excluyente, lo que permite representar páginas con varias escrituras simultáneas.

El entrenamiento se realizó por destilación de conocimiento desde un ensemble de tres familias de docentes: convnext_small, hgnetv2_b4 y caformer_s36. El autor documenta dos ejecuciones de destilación con semillas distintas (s0 y s1) para medir la variabilidad del receta. El preprocesamiento es específico: la imagen se convierte a escala de grises, se reescala con interpolación bilineal a 640 × 640 y se normaliza con las medias y desviaciones de ImageNet; la temperatura de calibración es 1,15. En el grafo ONNX, la normalización, la temperatura y la sigmoide están integradas, de modo que la salida ya son probabilidades calibradas. Los umbrales por defecto son 0,55 para aceptar una escritura y 0,7038 para decidir que la página es `unknown`, elegidos sobre páginas de validación de PDF web con una cobertura del 95 %.

## Capacidades

- Identificación del sistema de escritura de una página de documento sin ejecutar OCR.
- Clasificación multi-etiqueta: devuelve una probabilidad independiente para cada una de las 21 escrituras, permitiendo detectar páginas con escritura mixta.
- Detección de páginas fuera de distribución mediante la etiqueta `unknown` con umbral configurable.
- Funciona sobre páginas completas y sobre recortes de bloques de texto; en recortes anchos se recomienda rellenar con blanco hasta un cuadrado antes del reescalado, lo que eleva el top-1 en recortes reales de texto índico al 86,7 %.
- Inferencia en CPU de un solo hilo (33 ms por página) y en GPU (1.773 páginas/s en A10G con bf16).
- Soporte de dos vías de integración: ONNX Runtime (con preprocesado y calibración integrados) y timm (logits crudos, requiere aplicar `sigmoid(logits / 1,15)`).
- Capacidades multilingües limitadas a la identificación de escritura; no traduce ni transcribe texto.

## Casos de uso

- Enrutamiento de OCR en pipelines documentales: el modelo clasifica cada página antes de pasarla a un motor OCR especializado, de modo que las páginas en árabe, devanagari o tailandés se envían al paquete de idioma correspondiente en lugar de procesarlas con un OCR latino genérico.
- Clasificación y ordenación de grandes colecciones: con 1.773 páginas/s en una A10G, permite agrupar corpus de millones de páginas por escritura en minutos y organizar archivos digitalizados por sistema de escritura.
- Validación de metadatos: detecta páginas cuya escritura real no coincide con los metadatos declarados (por ejemplo, un documento catalogado como latino que contiene texto cirílico), útil en procesos de control de calidad de bibliotecas digitales.
- Procesamiento de documentos gubernamentales y escaneos: el modelo se ha evaluado específicamente en documentos gubernamentales (86,8 % de acierto top-1) y en escaneos (90,1 %), lo que lo hace adecuado para digitalización de archivos administrativos con mezcla de idiomas.
- Detección de escritura mixta en páginas bilingües: gracias a la salida multi-etiqueta, puede marcar páginas que contienen, por ejemplo, latín y han simultáneamente, lo que ayuda a decidir si se necesita más de un motor OCR por página.
- Filtrado previo en sistemas de extracción de información: descarta o marca páginas `unknown` antes de pasarlas a modelos más caros (LLM, OCR de alta precisión), reduciendo el coste computacional del pipeline.
- Preprocesado en aplicaciones móviles o edge: con 2,52 M de parámetros y 10 MB de peso, cabe en dispositivos con recursos limitados y puede ejecutarse en CPU sin GPU.

## Benchmarks y rendimiento

Los resultados proceden de la model card del autor. La precisión top-1 no está umbralizada (se mide antes de aplicar la regla de `unknown`). La columna "2 seeds" indica el rango entre dos ejecuciones de destilación de la misma receta.

| Benchmark | Etiqueta | n | Este modelo | 2 seeds | Hermano `page-script-id-hgnet` |
|---|---|---:|---:|---:|---:|
| PDF web (`r2_test`), capa de texto | text layer | 2.056 | 94,0 % | 93,9–94,0 % | 94,1 % |
| PDF web (`r2_test`), etiqueta de documento | doc language | 2.695 | 94,3 % | 93,5–94,3 % | 94,4 % |
| Documentos gubernamentales (`r3_test`, 21 escrituras) | text layer / scan doc | 2.140 | 86,8 % | 86,8–86,9 % | 87,6 % |
| `r3_test` capa de texto limpia | text layer = doc cfg | 995 | 96,3 % | — | 97,3 % |
| `r3_test` subconjunto de escaneos | scan doc label | 789 | 90,1 % | 89,1–90,1 % | 90,9 % |
| MDPBench, digital | benchmark lang | 680 | no disponible (dato truncado en la información) | — | — |

Además, el autor documenta que el modelo rechaza aproximadamente el 8 % de las páginas en documentos gubernamentales y el 28 % en documentos fotografiados con los umbrales por defecto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en GPU; el modelo pesa 10,1 MB y la entrada es una imagen de 640 × 640, por lo que el consumo dominante es el batch y las activaciones intermedias.
- GPU recomendadas: A10G (referencia del autor, 1.773 páginas/s con bf16 y batch 64); cualquier GPU moderna con soporte bf16 o fp16 es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.), aunque el modelo está optimizado para CPU y no necesita GPU.
- CPU: 33 ms por página en un hilo, 11 ms en cuatro hilos; viable para despliegues sin GPU.
- Opciones de despliegue: ONNX Runtime (recomendado, con preprocesado integrado), timm con PyTorch, y exportación a otros runtimes a partir del grafo ONNX.
- Latencia y throughput: 33 ms/página (1 hilo CPU), 11 ms/página (4 hilos CPU), 1.773 páginas/s en A10G (bf16, batch 64).

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Entrada | Licencia | Rendimiento destacado |
|---|---:|---|---|---|---|
| `davanstrien/page-script-id` (este) | 2,52 M | 10,1 MB | 640 × 640 gris | Apache 2.0 | 94,0 % PDF web; 86,8 % docs gubernamentales; 33 ms 1 hilo CPU |
| `davanstrien/page-script-id-hgnet` | 3,99 M | 16 MB | no disponible | no disponible | 94,1 % PDF web; 87,6 % docs gubernamentales; 79 ms 1 hilo / 36 ms 4 hilos; 88,0 % MDPBench fotografiado |
| Modelos OCR completos (p. ej. Tesseract, PaddleOCR) | no disponible | no disponible | imagen de página | varía | Requieren ejecutar OCR completo para conocer la escritura; mayor coste computacional |
| Clasificadores de escritura basados en transformers (ViT, etc.) | no disponible | no disponible | imagen de página | varía | Mayor precisión potencial pero mayor latencia y tamaño; no comparados en la información disponible |

La comparativa directa disponible se limita al modelo hermano de la misma familia, que ofrece mayor precisión a costa de más parámetros y mayor latencia.

## Limitaciones y advertencias

- Los umbrales por defecto (0,55 para escritura, 0,7038 para `unknown`) se calibraron sobre páginas de validación de PDF web; en documentos gubernamentales rechaza aproximadamente el 8 % de las páginas y en documentos fotografiados hasta el 28 %. Es imprescindible recalibrar sobre una muestra de las páginas propias antes de un despliegue masivo.
- En recortes de bloques de texto anchos (proporción ~3,5:1) el reescalado directo degrada el rendimiento: aproximadamente el 30 % de los recortes devuelven `unknown` en top-1; es necesario rellenar con blanco hasta un cuadrado antes del reescalado.
- El modelo identifica la escritura, no el idioma ni el contenido: una página en latín puede contener inglés, español o alemán indistintamente.
- Riesgo de confusión entre escrituras visualmente próximas y de falsos positivos en páginas con poco texto o ruido de escaneo.
- No se documentan análisis de sesgos por origen geográfico o tipo de documento; el rendimiento varía notablemente entre PDF web (94 %) y documentos gubernamentales o escaneos (86–90 %).
- La información disponible sobre cuantización es limitada: solo se distribuyen safetensors y ONNX, sin variantes GGUF ni cuantizaciones documentadas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no evaluados.
- El dato de MDPBench digital aparece truncado en la información disponible; no se debe asumir un valor concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davanstrien/page-script-id
- Modelo hermano de mayor precisión: https://huggingface.co/davanstrien/page-script-id-hgnet
- Demo Space: https://huggingface.co/spaces/davanstrien/page-script-id-demo
- Documentación de Hugging Face Jobs (usada para la destilación): https://huggingface.co/docs/hub/jobs
- Dataset MDPBench: https://huggingface.co/datasets/Delores-Lin/MDPBench
- Repositorio timm (PyTorch Image Models): https://github.com/huggingface/pytorch-image-models
- Modelo base: https://huggingface.co/timm/mobilenetv4_conv_small.e2400_r224_in1k
