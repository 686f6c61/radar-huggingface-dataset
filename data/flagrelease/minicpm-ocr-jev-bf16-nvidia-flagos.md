# FlagRelease/MiniCPM-OCR-Jev-BF16-nvidia-FlagOS

## Resumen

MiniCPM-OCR Jev es un modelo de 2B parámetros (2.213.245.760 pesos reales en safetensors) desarrollado por ModelBest junto con OpenBMB, distribuido en este repositorio por la comunidad FlagOS bajo licencia Apache 2.0. No es un OCR generativo al uso: actúa como un "inspector de calidad" de documentos que puntúa la fiabilidad de resultados de parseo producidos por otros modelos OCR, permitiendo marcar qué contenido requiere revisión humana. Se construye sobre una arquitectura etiquetada como `qwen3_5` en los metadatos del repositorio.

El modelo forma parte de la serie MiniCPM-OCR, que incluye también MiniCPM-OCR 1.0 (1.3B), orientado al parseo de texto, fórmulas y tablas complejas en escenarios reales (escaneos, fotos, páginas curvadas, pantallas re-fotografiadas). Jev complementa a ese modelo evaluando la calidad de su salida: recibe la imagen original, la imagen renderizada del parseo y el texto OCR, y devuelve una puntuación de probabilidad de corrección.

La relevancia actual del repositorio reside en su empaquetado para FlagOS, una pila de software multi-chip que ofrece adaptación "Day-0" a 12 plataformas (T-Head, NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang, Mac ARM y CIX). Según la model card, la build de FlagOS alcanza el 98,7 % del throughput nativo de NVIDIA, y en dispositivos ARM de borde Jev completa una evaluación de bloque de página en 1,20 s de media usando solo la CPU M5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en metadatos); especializado en scoring de calidad OCR |
| Parametros totales | 2.213.245.760 (~2,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados en BF16); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,4 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-10-26 |
| Ultima actualizacion | 2026-10-28 |

## Arquitectura y entrenamiento

La información disponible identifica el modelo con la etiqueta de arquitectura `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5 adaptada a la tarea de evaluación de calidad documental. El checkpoint publicado se denomina internamente `qwen35_2b_l2_triple_value_checkpoint-3000`, lo que apunta a un fine-tuning sobre una base de 2B con una etapa de entrenamiento de al menos 3000 pasos y una formulación de entrada "triple" (imagen original, imagen renderizada y texto OCR). No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica destacable no está en el modelo en sí, sino en su empaquetado: la build FlagOS sustituye el stack CUDA nativo por una capa de compatibilidad (`torch_fl`) con dispositivo `PrivateUse1` llamado `flagos`, que carga kernels CUDA desde `libtorch_cuda.so` mediante `LD_PRELOAD` y combina backends FlagGems, TileOps y vendor. El servicio se expone mediante `torch_fl.compat.jev_service` con endpoints `/health` y `/score`. En el ecosistema MiniCPM-OCR se menciona además DSpark como técnica de decodificación acelerada para el modelo 1.0, aunque no se confirma su aplicación a Jev.

## Capacidades

- Evaluación de fiabilidad de parseo OCR: recibe imagen original, imagen renderizada y texto extraído, y devuelve una probabilidad de corrección por entrada.
- Detección de errores de reconocimiento para enrutar contenido a revisión humana.
- Puntuación agregada por bloque de página, apta para pipelines de control de calidad documental.
- Integración con modelos OCR heterogéneos: la model card indica que puede conectarse a distintos motores OCR, no solo a MiniCPM-OCR 1.0.
- Soporte bilingüe chino-inglés en documentos.
- Despliegue en servidor multi-chip y en dispositivos ARM de borde (CPU M5).
- Servicio HTTP con endpoints `/health` y `/score` para integración programática.
- Compatibilidad declarada con AnythingLLM (la guía de integración aparece truncada en la información disponible).
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión general, audio ni modo "thinking".

## Casos de uso

- Control de calidad en digitalización masiva: integrar Jev al final de un pipeline de OCR para puntuar cada página y derivar a revisión humana solo aquellas con probabilidad baja, reduciendo el coste de verificación manual.
- Auditoría de proveedores OCR: comparar la fiabilidad de distintos motores OCR sobre el mismo corpus usando las puntuaciones de Jev como métrica objetiva, sin depender de anotaciones humanas.
- Procesamiento de facturas y formularios: aplicar el scoring sobre campos extraídos para detectar discrepancias entre la imagen original y el texto renderizado antes de volcar los datos a un ERP.
- Digitalización de archivos históricos o escaneos degradados: usar Jev para identificar páginas con páginas curvadas, ruido o re-fotografiado de pantalla donde el OCR tiende a fallar.
- Despliegue en borde para inspección in-situ: ejecutar el modelo en dispositivos ARM (por ejemplo, Mac con CPU M5) para validar documentos en el punto de captura, con ~1,2 s por bloque de página, sin enviar imágenes a la nube.
- Integración en asistentes documentales tipo AnythingLLM: añadir una capa de verificación que marque respuestas basadas en documentos con parseo dudoso, mitigando respuestas fundamentadas en texto OCR corrupto.
- Monitorización continua de pipelines RAG: puntuar periódicamente documentos ingeridos y alertar cuando la calidad de parseo cae por debajo de un umbral, evitando que contenido mal extraído contamine el índice vectorial.

## Benchmarks y rendimiento

| Metrica | Jev NVIDIA Origin | Jev NVIDIA FlagOS |
|---|---|---|
| ocr_rm_mini (12 entradas), avg_prob_1 | 0,4817 | 0,4817 |
| omnidocbench-render-compare (60 entradas), avg_prob_1 | 0,2397 | 0,2397 |

La model card reporta además un AUROC global de 0,936 en JevOCRBench, frente a 0,938 de Qwen3.5-397B-A17B. En rendimiento de sistema, la build FlagOS alcanza el 98,7 % del throughput nativo de NVIDIA; el modelo 1.0 de la familia logra hasta 1,69× el throughput P50 nativo por unidad de cómputo pico en la misma plataforma. La carga del modelo en H100 tarda entre 21 y 27 segundos.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 4,4 GB solo para pesos, más overhead de activaciones y servicio; un presupuesto de 6-8 GB es razonable para inferencia con lote pequeño.
- GPU recomendadas: H100 para despliegue de referencia (carga en 21-27 s según la model card); A100 y GPUs con al menos 8 GB de VRAM deberían ser suficientes para el checkpoint BF16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 4080, RTX 3090 y similares con 8 GB o más; también en GPUs de 8 GB con lote pequeño.
- Despliegue en CPU/ARM: soportado vía FlagOS en Mac ARM (CPU M5, ~1,2 s por bloque de página) y otras plataformas de borde.
- Opciones de despliegue: contenedor Docker oficial de FlagOS (`harbor.baai.ac.cn/flagrelease-public/qwen3-5-2b-jev-nvidia003-...`), servicio `torch_fl.compat.jev_service` con API HTTP; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 21-27 s de carga en H100; 1,20 s por bloque de página en CPU M5. Throughput de inferencia en GPU no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR Jev (este) | ~2,2B | no disponible | Scoring de calidad OCR (AUROC 0,936 en JevOCRBench) | Apache 2.0 | Hugging Face + contenedor FlagOS |
| MiniCPM-OCR 1.0 | 1,3B | no disponible | Parseo OCR de texto, formulas y tablas (93,68 en Real5-OmniDocBench) | Apache 2.0 (segun serie) | Open source por ModelBest/OpenBMB |
| Qwen3.5-397B-A17B | 397B totales, 17B activos | no disponible | Modelo generalista con capacidad OCR (AUROC 0,938 en JevOCRBench) | no disponible | no disponible |

La comparación relevante es que Jev, con 2,2B parámetros, se queda a 0,002 puntos de AUROC de un modelo 180 veces mayor en parámetros totales para la tarea específica de verificación de calidad OCR, lo que justifica su uso como componente ligero en pipelines de producción.

## Limitaciones y advertencias

- El modelo no extrae texto: solo puntúa la calidad de un parseo existente; requiere un OCR previo en el pipeline.
- Idiomas limitados a chino e inglés; no se garantiza comportamiento en castellano ni en otras lenguas.
- Longitud de contexto no documentada, lo que impide planificar el tamaño máximo de página o bloque procesable.
- Los benchmarks publicados cubren solo dos conjuntos internos (ocr_rm_mini y omnidocbench-render-compare) y JevOCRBench; no hay resultados en benchmarks OCR estándar como OmniDocBench completo, TextOCR o DocVQA.
- El repositorio tiene 8 descargas y 0 likes en el momento de la consulta, con empaquetado FlagOS muy específico; la comunidad y el soporte son mínimos.
- La guía de integración con AnythingLLM aparece truncada en la información disponible, por lo que su funcionamiento no puede verificarse.
- El stack FlagOS depende de versiones concretas (PyTorch 2.10.0+cpu, flag_gems 5.4.0, flagtree 0.7.0, CUDA 13.1) y de `LD_PRELOAD` para cargar kernels CUDA; desviaciones de versión pueden romper el despliegue.
- Riesgo de alucinación en las puntuaciones: al ser un modelo probabilístico, puede asignar alta confianza a parseos incorrectos en dominios alejados del entrenamiento (documentos manuscritos, tablas muy irregulares, idiomas no vistos).
- Licencia Apache 2.0 permite uso comercial, pero la licencia de la base subyacente Qwen 3.5 y de los datos de entrenamiento no se detalla en la información disponible; conviene verificar antes de un despliegue comercial.
- No se documentan sesgos específicos; al estar entrenado en zh/en, cabe esperar peor calibración en documentos con otras escrituras o mezclas lingüísticas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FlagRelease/MiniCPM-OCR-Jev-BF16-nvidia-FlagOS
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/qwen3-5-2b-jev-nvidia003-gems5.4.0-tree0.7.0-cx0.14.0-pluginnone-vllmnone-sglangnone-sglangflnone-cp312-pt210-cu131-x64-580.126.20:202610270750`
- AnythingLLM (integracion mencionada): https://anythingllm.com
- Paper, blog o repositorio de MiniCPM-OCR: no disponible en la informacion proporcionada.
