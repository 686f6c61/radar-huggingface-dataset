# findsamirks/Fresh-Grade-ViT

## Resumen

Fresh-Grade-ViT es un modelo de visión por computador basado en un Vision Transformer (ViT-B/16) con arquitectura de doble cabeza, desarrollado por Samir Sandhwar (usuario `findsamirks`). Resuelve un problema concreto del sector retail y quick-commerce: la inspección automatizada de producto fresco perecedero (tomates, plátanos, manzanas, verduras de hoja) a partir de una única fotografía RGB.

El modelo produce dos salidas simultáneas: una clasificación de calidad en cuatro clases (`Fresh`, `Ripe`, `Overripe`, `Spoiled`) y una estimación continua de días de vida útil restante (regresión con activación Softplus para garantizar valores no negativos). Ambas predicciones alimentan una lógica de negocio denominada "Dynamic Markdown Bridge" que dispara rebajas de precio (`HOLD`, `SELL_FIRST`, `DISCOUNT_40`, `DUMP_SALVAGE`) y aplica criterios FEFO (First-Expire-First-Out) en la preparación de pedidos.

El modelo es relevante por su enfoque multi-tarea aplicado a un dominio vertical muy específico (dark stores, recepción de mercancía en supermercados y centros logísticos), y por publicarse con licencia MIT. No obstante, el repositorio tiene un tamaño de 0.0 GB y cero descargas en el momento de la consulta, lo que sugiere que los pesos podrían no estar efectivamente subidos o que el modelo es de publicación muy reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16), doble cabeza (clasificación + regresión) |
| Parametros totales | no disponible (backbone ViT-B/16, ~86 M en el backbone estándar; total exacto no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | en (etiquetas y documentación en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, archivo `fresh_grade_multitask_vit.pt`) |

## Arquitectura y entrenamiento

La arquitectura parte de un backbone ViT-B/16 con parches de 16x16 y embeddings de 768 dimensiones. Sobre la representación del backbone se aplica una capa de proyección compartida (Linear 768→768 + LayerNorm + GELU + Dropout). A partir de ahí se bifurcan dos cabezas: la de clasificación de calidad (Linear 768→256 → ReLU → Linear 256→4 → Softmax) y la de regresión de vida útil (Linear 768→128 → ReLU → Linear 128→1 → Softplus, que fuerza salidas mayores o iguales a cero).

El entrenamiento es multi-tarea con una pérdida conjunta que combina entropía cruzada para la clasificación y error cuadrático medio sobre la transformación logarítmica de los días (`log(1 + days)`), ponderada por los coeficientes α y β. Esa transformación logarítmica suaviza la escala de la regresión cuando los plazos son largos. La model card no especifica el volumen de datos de entrenamiento, la composición del dataset, si hubo aumento de datos, ni si se aplicaron técnicas de ajuste fino adicionales (RLHF, DPO u otras, poco habituales en visión). Tampoco se detalla el número de épocas, el optimizador ni los hiperparámetros de α y β.

## Capacidades

- Clasificación de calidad de producto fresco en cuatro clases: `Fresh`, `Ripe`, `Overripe`, `Spoiled`.
- Regresión de vida útil restante en días (salida continua no negativa vía Softplus).
- Extracción de características de imagen (pipeline declarado: `image-feature-extraction`), reutilizable como backbone para otras tareas de visión.
- Aprendizaje multi-tarea: una sola pasada produce ambas predicciones de forma conjunta.
- Diseñado para alimentar lógica de decisión de negocio: markdown dinámico de precios y priorización FEFO.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente visual).
- Capacidades multilingües: no aplica; el modelo no procesa texto.
- No dispone de modo de razonamiento (thinking), ni visión generativa, ni audio.

## Casos de uso

- **Recepción de mercancía en supermercado:** el operario fotografía el palé o la caja de producto al entrar en tienda; el modelo clasifica el grado de madurez y estima los días de vida útil para decidir si se acepta el lote o se rechaza al proveedor.
- **Markdown dinámico de precios en dark stores:** la salida de días restantes alimenta la regla `DISCOUNT_40` o `DUMP_SALVAGE`, aplicando rebajas automáticas antes de que el producto se deteriore y reduciendo el desperdicio alimentario.
- **Priorización FEFO en preparación de pedidos:** el picker recibe instrucciones de qué unidades deben salir primero según su vida útil estimada, no solo según la fecha de caducidad impresa.
- **Auditoría de calidad en línea de envasado:** integración en una cámara fija sobre la cinta transportadora para clasificar cada unidad y descartar automáticamente las que caen en `Spoiled`.
- **Extracción de features para búsqueda visual de producto:** el embedding de 768 dimensiones sirve para construir un índice de similitud visual en catálogos de frutería.
- **Monitorización de inventario en cámara frigorífica:** fotografías periódicas de estanterías para detectar la evolución del grado de madurez y priorizar la rotación.
- **Prototipado rápido en Streamlit:** la demo pública permite a equipos de operaciones validar el modelo con fotos reales antes de integrarlo en un sistema productivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara las métricas `accuracy` y `mse` como tags, pero no incluye valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada:** un ViT-B/16 con dos cabezas ligeras ocupa aproximadamente 350 MB en FP32 (unos 86 M de parámetros) y en torno a 180 MB en FP16. Cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas:** RTX 3060, RTX 4060, RTX 4090, A100, H100. Para inferencia en tiempo real en línea de producción, una GPU de gama media es suficiente.
- **CPU:** la inferencia es viable en CPU para lotes pequeños o uso interactivo; para vídeo o cinta transportadora se recomienda GPU.
- **Opciones de despliegue:** el modelo se distribuye como `.pt` de PyTorch, por lo que se carga con `torch.load` y se sirve con TorchServe, FastAPI + Uvicorn, o dentro de una app Streamlit como la demo oficial. No se publican pesos en GGUF ni ONNX, por lo que llama.cpp y Ollama no son aplicables.
- **Latencia y throughput:** no disponibles. Para un ViT-B/16 a 224x224 en una RTX 4090 se puede esperar un throughput del orden de varios cientos de imágenes por segundo en FP16, pero no hay medición publicada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fresh-Grade-ViT | Clasificación de calidad + regresión de vida útil | ViT-B/16 (~86 M en backbone) | Imagen 224x224 | MIT | Hugging Face (repo 0.0 GB) |
| google/vit-base-patch16-224 | Clasificación de imagen genérica (ImageNet) | ~86 M | Imagen 224x224 | Apache 2.0 | Hugging Face |
| facebook/dinov2-base | Extracción de features visuales | ~86 M | Imagen 224x224 | Apache 2.0 | Hugging Face |
| openai/clip-vit-base-patch32 | Visión-lenguaje (zero-shot) | ~151 M | Imagen + texto | MIT | Hugging Face |

La comparativa es orientativa: Fresh-Grade-ViT es un ajuste fino de dominio específico, mientras que los otros son modelos de propósito general. No hay benchmarks publicados que permitan comparar rendimiento en la tarea de clasificación de frescura.

## Limitaciones y advertencias

- **Cero descargas y repo de 0.0 GB:** el tamaño del repositorio sugiere que el archivo de pesos podría no estar subido o estar vacío. Conviene verificar la descarga antes de integrarlo.
- **Sin datos de entrenamiento publicados:** no se conoce el dataset, su tamaño, su procedencia geográfica ni la distribución de clases, lo que impide evaluar sesgos y generalización.
- **Dominio muy restringido:** entrenado para tomates, plátanos, manzanas y verduras de hoja; no hay garantía de funcionamiento con otras frutas, con iluminación de cámara frigorífica o con producto envasado.
- **Riesgo de alucinación en la regresión:** la salida de días de vida útil es una estimación estadística; un error de varios días puede provocar rebajas innecesarias o venta de producto en mal estado.
- **Dependencia de condiciones de captura:** el preprocesado fijo (resize a 224x224, normalización ImageNet) implica que variaciones fuertes de iluminación, ángulo o fondo pueden degradar la precisión.
- **Idioma:** etiquetas y documentación solo en inglés.
- **Licencia MIT:** permite uso comercial sin restricciones, pero el autor no ofrece garantías ni soporte.
- **Sin benchmarks:** no es posible comparar su precisión con alternativas ni justificar su adopción en producción sin una validación propia sobre datos reales del cliente.

## Enlaces

- Hugging Face: https://huggingface.co/findsamirks/Fresh-Grade-ViT
- Demo interactiva (Streamlit): https://fresh-grade.streamlit.app
- Repositorio GitHub: https://github.com/findsamirks-commits/Fresh-Grade
- Perfil del autor en Hugging Face: https://huggingface.co/findsamirks
- Perfil del autor en GitHub: https://github.com/findsamirks-commits
- LinkedIn del autor: https://www.linkedin.com/in/samirsandhwar
