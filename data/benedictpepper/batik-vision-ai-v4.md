# benedictpepper/batik-vision-ai-v4

## Resumen

Batik Vision AI v4.0 es un clasificador de imágenes especializado en reconocer 28 motivos de batik indonesio. Lo desarrolla el usuario independiente benedictpepper y se construye sobre el backbone auto-supervisado DINOv2-ViT-S/14 (facebook/dinov2-small), afinado para una tarea de clasificación cerrada y posteriormente exportado a ONNX en precisión INT8 y FP16. Su relevancia reside en que demuestra un caso de destilación de un modelo de visión generalista en un clasificador de dominio muy concreto con un tamaño de apenas 22,47 MB en INT8, apto para inferencia 100% en navegador mediante WebGPU, WebGL o WASM, sin backend.

El modelo resuelve dos problemas prácticos: la clasificación fiable de motivos de batik y la detección honesta de imágenes que no son batik (out-of-distribution), un requisito habitual en producción cuando el clasificador recibe entradas arbitrarias del mundo real. Para ello incorpora calibración post-hoc con Temperature Scaling (T = 0,8242) y umbrales de entropía y confianza calibrados contra 177 negativos que incluyen textiles tejidos indonesios difíciles (Songket, Tenun Ikat, Ulos).

La arquitectura subyacente es un Vision Transformer pequeño (ViT-S/14) preentrenado con el objetivo auto-supervisado DINOv2, con entrada de 224x224 píxeles. El repo ocupa 0,1 GB e incluye pesos ONNX, configuración calibrada, informe de clasificación por clase, matriz de confusión y checksums. La licencia es CC BY-SA 4.0, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DINOv2-ViT-S/14), parche 14x14, entrada 224x224 |
| Parametros totales | no disponible (backbone DINOv2-small; el autor no declara el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224) |
| Tipos de cuantizacion | INT8 dinámica (QUInt8) y FP16 (I/O en FP32) |
| Idiomas soportados | en, id (etiquetas de clase en inglés e indonesio) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (opset 17); INT8 22,47 MB, FP16 43,53 MB |

## Arquitectura y entrenamiento

El modelo parte de facebook/dinov2-small, un ViT-S/14 preentrenado con DINOv2 (auto-supervisión con destilación de características). Sobre ese backbone se realiza un ajuste supervisado para clasificación de 28 clases de motivos de batik. El preprocesado (normalización ImageNet y permutación de canales) está embebido dentro del grafo ONNX, de modo que el modelo acepta directamente píxeles RGB en float32 con rango [0, 255] y layout NHWC; esto elimina dependencias de preprocesado en el cliente y reduce el riesgo de discrepancias entre entrenamiento e inferencia.

El autor declara una evaluación con partición semántica libre de fuga (leak-free): cero clústeres DINOv2 compartidos entre train, val y test. El conjunto de test holdout contiene 501 imágenes no vistas, más 177 negativos OOD. La calibración de incertidumbre se realiza con Temperature Scaling post-hoc (T = 0,8242) y umbrales de entropía normalizada y confianza mínima almacenados en model_config.json. La inferencia desplegada usa una estrategia de 3 tiles (3-Tile) que mejora ligeramente las métricas frente a recorte único.

## Capacidades

- Clasificación de imágenes en 28 clases cerradas de motivos de batik indonesio.
- Detección out-of-distribution (OOD) para rechazar imágenes que no son batik, con umbrales calibrados.
- Salida de probabilidades calibradas (logits divididos por temperatura) y entropía normalizada para estimar incertidumbre.
- Preprocesado integrado en el grafo ONNX (normalización ImageNet y permutación NHWC a NCHW).
- Inferencia en navegador vía WebGPU, WebGL o WASM, y en escritorio vía ONNX Runtime.
- No soporta tool calling, agentes, generación de texto, visión general, audio ni razonamiento multi-paso: es un clasificador de imagen puro.

## Casos de uso

- Clasificación de motivos de batik en catálogos de e-commerce: el modelo identifica el motivo entre 28 clases a partir de una foto de producto, con 89,82% de Top-1 en holdout, lo que permite etiquetado automático de fichas.
- Aplicación web client-side de demostración: al ejecutarse en WebGPU/WASM con 22,47 MB, permite subir una foto y obtener el motivo sin enviar la imagen a ningún servidor (privacidad por diseño, cero backend).
- Filtrado de calidad en bases de datos de imágenes: el detector OOD (AUROC 0,9591) descarta imágenes que no son batik antes de indexarlas, evitando contaminar un corpus etiquetado.
- Verificación en apps móviles de patrimonio cultural: clasificación on-device para apps educativas o museísticas que reconocen motivos tradicionales sin conexión.
- Moderación o triaje en pipelines de subida de usuarios: rechazar automáticamente imágenes ajenas al dominio (por ejemplo, textiles no batik como Songket o Ulos) usando los umbrales de entropía y confianza.
- Automatización de inventario en talleres textiles: integración en un flujo de captura con cámara para etiquetar lotes de tela por motivo, con informe por clase disponible para auditar precisión y recall.
- Investigación en visión aplicada a patrimonio: servir de baseline reproducible (partición leak-free, matriz de confusión y checksums incluidos) para comparar con otros backbones.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados, `verified: false`), sobre holdout de 501 imágenes no vistas y 177 negativos OOD:

| Modelo / configuración | Entrada | Tamaño | Val Macro-F1 | Holdout Top-1 | Holdout Top-3 | Holdout Macro-F1 | Test ECE | OOD Entropy AUROC | OOD Recall @ ≤5% FRR |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| DINOv2-ViT-S/14 INT8 3-Tile (desplegado) | 224² | 22,47 MB | 87,49% | 89,82% | 96,01% | 87,47% | 0,0392 | 0,9591 | 75,7% |
| DINOv2-ViT-S/14 FP32 single-crop | 224² | 86,74 MB | 87,49% | 89,02% | 95,41% | 87,29% | 0,0332 | 0,9542 | 73,5% |
| ConvNeXt-Tiny FP32 single-crop | 288² | 111,3 MB | 87,44% | 90,42% | 95,01% | 88,38% | 0,0411 | 0,9577 | 74,6% |
| EfficientNetV2-S FP32 single-crop | 300² | 82,1 MB | 87,09% | 87,82% | 95,01% | 87,29% | 0,0341 | 0,9291 | 54,8% |

El autor afirma que la cuantización INT8 no degrada la precisión frente a FP32 (89,82% frente a 89,02% Top-1) y que el modelo es 3,65 veces más pequeño que la versión v3 basada en EfficientNetV2-S FP32 (82,1 MB). No se han publicado resultados en benchmarks estándar de visión general (ImageNet, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier configuración; el modelo INT8 pesa 22,47 MB y el FP16 43,53 MB, por lo que cabe holgadamente en memoria de cualquier GPU consumer.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU para navegador; en escritorio, CPU es suficiente para inferencia interactiva.
- Cabe en GPU consumer: sí, en cualquier RTX (incluida RTX 3050 o inferior) e incluso en iGPU.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider, CUDA, DirectML), WebGPU/WebGL/WASM en navegador, y cualquier runtime compatible con ONNX (por ejemplo, tract o wasmtime con bindings ONNX).
- Latencia y throughput: no se publican cifras concretas en la información disponible; el autor describe el modelo como "compacto y rápido" y apto para navegador, pero no aporta latencias medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento (holdout Top-1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Batik Vision AI v4 (DINOv2-ViT-S/14 INT8) | no disponible | 224x224 | 89,82% | CC BY-SA 4.0 | ONNX en HF |
| DINOv2-ViT-S/14 FP32 (mismo backbone, sin cuantizar) | no disponible | 224x224 | 89,02% | CC BY-SA 4.0 (derivado) | ONNX en HF |
| ConvNeXt-Tiny FP32 (baseline del autor) | no disponible | 288x288 | 90,42% | no disponible | no disponible en este repo |
| EfficientNetV2-S FP32 (baseline del autor) | no disponible | 300x300 | 87,82% | no disponible | no disponible en este repo |

No se dispone de comparación con clasificadores de batik de terceros en la información proporcionada.

## Limitaciones y advertencias

- Modelo de clasificación cerrada: solo reconoce 28 motivos de batik; cualquier otra imagen debe rechazarse vía OOD, y el recall OOD a ≤5% FRR es del 75,7%, por lo que una cuarta parte de las entradas ajenas podrían colarse.
- Métricas declaradas por el autor y marcadas como no verificadas (`verified: false`); conviene reproducirlas antes de usarlas en producción.
- Riesgo de confusión entre motivos visualmente próximos y entre batik y otros textiles indonesios (Songket, Tenun Ikat, Ulos), que el autor incluye explícitamente como negativos duros.
- Sensibilidad al preprocesado: aunque el grafo ONNX integra la normalización, el recorte central cuadrado y el redimensionado bilineal deben replicarse exactamente para mantener las métricas.
- Licencia CC BY-SA 4.0: permite uso comercial pero obliga a atribución y a compartir obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- Idiomas soportados limitados a en e id en las etiquetas; no es un modelo multilingüe ni generativo.
- Sin datos publicados de latencia, throughput ni consumo en dispositivos concretos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benedictpepper/batik-vision-ai-v4
- Dataset: https://huggingface.co/datasets/benedictpepper/indonesian-batik-v2
- Dataset en Kaggle: https://www.kaggle.com/datasets/fisheightcharacter/indonesian-batik-dataset-enhanced-and-cleaned
- Demo web: https://batik-vision-ai.vercel.app
- Código fuente: https://github.com/bennypepper/Batik-Vision-AI
- Modelo base: https://huggingface.co/facebook/dinov2-small
