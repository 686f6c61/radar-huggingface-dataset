# FlagRelease/MiniCPM-OCR-Jev-BF16-sunrise-FlagOS

## Resumen

MiniCPM-OCR Jev es un modelo de 2.213 millones de parámetros (aproximadamente 2B) desarrollado por ModelBest junto con OpenBMB, diseñado como un "inspector de calidad" automático para resultados de parseo de documentos. A diferencia de un OCR convencional, Jev no extrae texto: evalúa la fiabilidad de la salida producida por otros modelos OCR y puntúa qué contenido requiere revisión humana, actuando como una capa de verificación en pipelines de digitalización documental.

El modelo se distribuye en este repositorio como un build específico para el stack FlagOS (FlagRelease), una adaptación multi-chip del modelo original que cubre 12 plataformas de hardware (T-Head, NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang, Mac ARM y CIX). Según la model card, este build alcanza el 98,7 % del throughput de cómputo nativo de NVIDIA y completa una evaluación de bloque de página en 1,20 segundos de media usando solo CPU ARM M5 en dispositivos edge.

La relevancia actual del modelo reside en su enfoque: en lugar de competir por precisión de extracción, aborda el cuello de botella posterior, la verificación manual de resultados OCR. Con un AUROC global de 0,936 en JevOCRBench, se sitúa muy cerca del 0,938 reportado para Qwen3.5-397B-A17B, un modelo dos órdenes de magnitud mayor. La arquitectura declarada en los tags es `qwen3_5`, con pesos en safetensors y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag del repositorio; detalles internos no disponibles) |
| Parametros totales | 2.213.245.760 (≈2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (build distribuido); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,4 GB |
| Preprocesado de imagen | shortest_edge 65536, longest_edge 16777216 (según script de despliegue) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá del tag `qwen3_5`, que sugiere una base derivada de la familia Qwen 3.5 adaptada a una tarea de clasificación/regresión de fiabilidad sobre documentos. El modelo es multimodal en la entrada (procesa imagen de documento, dado el `mm-processor-kwargs` con resolución de hasta 16.777.216 píxeles en el lado largo) y produce una puntuación de fiabilidad, no texto libre. Los scripts de despliegue exponen parámetros específicos del modelo (`JEV_CPU_POSITION_INTERPOLATION`, `JEV_TOKEN_CLASSIFY_LAST`, `JEV_SCORE_BEFORE_POOLING`), lo que indica un cabezal de clasificación por token con pooling posterior, orientado a producir una probabilidad agregada por bloque de documento.

No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona únicamente el benchmark JevOCRBench como referencia de evaluación y describe el modelo como entrenado para puntuar la fiabilidad de resultados de parseo. La innovación técnica destacable no está en el entrenamiento sino en el despliegue: el build FlagOS integra el modelo en vLLM 0.24.0 con un plugin de backend (`VLLM_PLUGINS=fl`, `VLLM_FL_PREFER=flagos`) que permite ejecutarlo sobre aceleradores no NVIDIA con kernels propios, incluyendo optimizaciones específicas para visión (`VLLM_FL_SUNRISE_SAFE_VISION_SDPA`, `VLLM_FL_SUNRISE_OCR_VISION_OUTPUT_ONLY`).

## Capacidades

- Evaluación de fiabilidad de parseo OCR: asigna una puntuación de probabilidad a bloques de documento procesados por modelos OCR externos.
- Detección de contenido que requiere revisión humana, como capa de control de calidad en pipelines documentales.
- Procesamiento de imágenes de documento en alta resolución (hasta 16,7 Mpx en el lado largo según la configuración de despliegue).
- Integración con múltiples motores OCR: la model card indica que puede conectarse a distintos modelos OCR para señalizar salidas dudosas.
- Soporte multilingüe limitado a chino e inglés.
- Despliegue en servidor multi-chip y en terminales ARM edge mediante el stack FlagOS.
- No se documentan capacidades de generación de texto libre, tool calling, razonamiento multi-paso ni agentes; el modelo está especializado en una única tarea de clasificación.

## Casos de uso

- Control de calidad en digitalización masiva de archivos: tras ejecutar un OCR sobre lotes de escaneos, Jev puntúa cada bloque y permite enrutar solo los fragmentos con baja probabilidad a revisión humana, reduciendo el volumen de verificación manual.
- Auditoría de pipelines OCR existentes: se inserta como etapa de validación después de cualquier motor OCR (incluido MiniCPM-OCR 1.0) para medir la fiabilidad del output antes de publicarlo o indexarlo.
- Extracción de datos en banca y seguros: en el procesamiento de pólizas, facturas y formularios escaneados, el modelo señala tablas o campos mal parseados antes de que alimenten sistemas transaccionales.
- Digitalización de documentación legal y administrativa: permite priorizar qué expedientes escaneados necesitan revisión antes de su incorporación a repositorios documentales.
- Despliegue en edge para inspección en origen: con 1,20 s por bloque en CPU ARM M5, puede ejecutarse en dispositivos de captura (escáneres, terminales móviles) para validar la calidad de la digitalización en el momento de la captura.
- Evaluación comparativa de motores OCR: al puntuar las salidas de distintos modelos sobre el mismo documento, sirve para seleccionar el motor más adecuado por tipo de documento en un proyecto.
- Despliegue en infraestructura no NVIDIA: el build FlagOS permite ejecutar el modelo en aceleradores Ascend, Hygon, KUNLUNXIN, MetaX o Moore Threads con rendimiento cercano al nativo NVIDIA (98,7 % del throughput).

## Benchmarks y rendimiento

Resultados publicados en la model card para este build frente a la versión nativa NVIDIA:

| Metrica | Jev NVIDIA Origin | Jev Sunrise FlagOS |
|---|---|---|
| ocr_rm_mini (12 entradas), avg_prob_1 | 0,4817 | 0,48242 |
| omnidocbench-render-compare (60 entradas), avg_prob_1 | 0,2397 | 0,24171 |

Resultados globales citados en la model card (sin tabla detallada):

| Metrica | Valor |
|---|---|
| AUROC en JevOCRBench (Jev 2B) | 0,936 |
| AUROC en JevOCRBench (Qwen3.5-397B-A17B) | 0,938 |
| Throughput FlagOS vs. nativo NVIDIA | 98,7 % |
| Latencia por bloque de página en CPU ARM M5 | 1,20 s de media |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,4 GB de pesos más overhead de activaciones y del procesador multimodal; el repositorio ocupa 4,4 GB, por lo que un GPU con 8-12 GB es suficiente en BF16.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 8 GB (RTX 3060/4060 en adelante, A10, L4, A100, H100). El build FlagOS añade soporte para Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang y CIX.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en BF16; con cuantización adicional (no distribuida en este repositorio) cabría en GPUs de 4-6 GB.
- Opciones de despliegue: vLLM 0.24.0 con plugin FlagOS (configuración documentada en la model card), contenedor Docker `FlagOS-Sunrise` publicado en `harbor.baai.ac.cn`, y despliegue en CPU ARM (Mac M5) para edge. No se documenta soporte de llama.cpp, Ollama ni TGI para este build.
- Latencia y throughput: 1,20 s por bloque de página en CPU ARM M5; 98,7 % del throughput nativo NVIDIA en el stack FlagOS. No se publican cifras absolutas de tokens/s ni de páginas/s en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | AUROC JevOCRBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR Jev (este) | ≈2B | Inspección de fiabilidad OCR | 0,936 | Apache 2.0 | Hugging Face, ModelScope, contenedor FlagOS |
| Qwen3.5-397B-A17B | 397B totales / 17B activos | Modelo generalista con evaluación OCR | 0,938 | no disponible | no disponible en la información |
| MiniCPM-OCR 1.0 | 1,3B | Parseo OCR (texto, fórmulas, tablas) | no aplica (tarea distinta) | no disponible | distribuido por ModelBest/OpenBMB |

La comparación relevante es con Qwen3.5-397B-A17B: Jev iguala prácticamente su capacidad de puntuación de fiabilidad (0,936 frente a 0,938) con un modelo 180 veces menor en parámetros totales. Frente a MiniCPM-OCR 1.0, la comparación no es directa porque cumplen funciones complementarias: 1.0 extrae y Jev verifica.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se documenta soporte de castellano ni de otras lenguas.
- El modelo no genera texto ni extrae contenido: solo puntúa fiabilidad. No debe emplearse como OCR.
- No se publican datos sobre sesgos, composición del dataset de entrenamiento ni tasas de alucinación en la información disponible.
- El umbral de decisión para enrutar a revisión humana no viene definido; debe calibrarse por caso de uso con datos propios.
- La licencia Apache 2.0 permite uso comercial, pero el build FlagOS depende de componentes propietarios del stack (runtime `tangrt`, `pccl`, plugin vLLM) cuyo licenciamiento no se detalla en la model card.
- El despliegue documentado está fuertemente acoplado a la imagen Docker y variables de entorno específicas; la portabilidad a otros entornos requiere validación propia.
- La longitud de contexto no está publicada, lo que dificulta planificar el tamaño máximo de documento por inferencia.
- El repositorio tiene un volumen de descargas muy bajo (9 en el momento de la consulta), por lo que la validación comunitaria es prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FlagRelease/MiniCPM-OCR-Jev-BF16-sunrise-FlagOS
- Repositorio de imágenes FlagOS: harbor.baai.ac.cn/flagrelease-public (referenciado en la model card)
- Descarga vía ModelScope: `modelscope download --model FlagRelease/MiniCPM-OCR-Jev-BF16-sunrise-FlagOS`
- Paper, blog o repositorio del modelo original MiniCPM-OCR: no disponible en la información proporcionada.
