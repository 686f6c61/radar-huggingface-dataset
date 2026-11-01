# FlagRelease/MiniCPM-OCR-Jev-BF16-kunlunxin-FlagOS

## Resumen

MiniCPM-OCR Jev es un modelo de 2B parámetros desarrollado por ModelBest en colaboración con OpenBMB, diseñado específicamente como "inspector de calidad" (reward model) para tareas de parsing de documentos. A diferencia de los modelos OCR tradicionales que se limitan a transcribir, Jev evalúa la fiabilidad de los resultados de parsing generados por otros modelos OCR, asignando una puntuación que permite identificar contenido que requiere revisión humana. Se distribuye aquí en su variante BF16 optimizada para el acelerador KUNLUNXIN P800 mediante el stack FlagOS, con adaptación cross-chip de día cero.

El modelo forma parte de la serie MiniCPM-OCR, que incluye también MiniCPM-OCR 1.0 (1.3B), orientado al parsing directo de documentos con soporte de texto, fórmulas y tablas complejas. Jev complementa esa función actuando como capa de verificación: alcanza un AUROC de 0,936 en JevOCRBench, prácticamente idéntico al 0,938 de Qwen3.5-397B-A17B, lo que lo posiciona como una alternativa extremadamente ligera para control de calidad documental automatizado.

Esta release concreta (FlagRelease) empaqueta los pesos en safetensors BF16 con la etiqueta de arquitectura `qwen3_5` y una licencia Apache 2.0 permisiva. El repositorio ocupa 4,4 GB y los pesos suman 2.213.245.760 parámetros. Su relevancia actual radica en la combinación de tamaño reducido, licencia abierta y despliegue validado sobre hardware no-NVIDIA, lo que facilita su integración en pipelines de inspección documental en entornos con aceleradores heterogéneos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta de pesos `qwen3_5`; detalles internos no disponibles) |
| Parametros totales | 2.213.245.760 (2,21B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (variante publicada); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | no disponible |
| Tamano del repositorio | 4,4 GB |
| Hardware objetivo | KUNLUNXIN P800 (stack FlagOS / Torch-FL) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` en los metadatos de los pesos, lo que sugiere una base derivada de la familia Qwen 3.5 adaptada a la tarea de reward modeling para OCR. El modelo está concebido como un reward model (sufijo RM en los nombres de checkpoint, `OCR-RM-2B`) que recibe pares de entrada (documento y resultado de parsing) y emite una puntuación de probabilidad sobre la fiabilidad del parsing. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación destacable de esta release no está en el entrenamiento sino en el despliegue: el stack FlagOS proporciona una capa de compatibilidad que permite ejecutar el modelo sobre KUNLUNXIN P800 usando `torch_fl` como backend, con el dispositivo expuesto como `flagos:0` en lugar de `cuda:0`. Según la model card, esta build alcanza el 98,7 % del throughput nativo de NVIDIA, y en dispositivos ARM edge el modelo completa la evaluación de un bloque de página en 1,20 segundos usando solo la CPU M5.

## Capacidades

- Evaluación de fiabilidad de parsing OCR: asigna una probabilidad de corrección a los resultados producidos por modelos OCR externos, actuando como filtro de calidad.
- Integración con múltiples motores OCR: puede conectarse a distintos modelos de parsing para señalar contenido que requiere revisión humana.
- Procesamiento de documentos reales: la serie MiniCPM-OCR está orientada a escaneos, fotografías, páginas curvadas y pantallas re-fotografiadas.
- Soporte de texto, fórmulas y tablas complejas en el ecosistema OCR de la serie (heredado de MiniCPM-OCR 1.0).
- Capacidades multilingües limitadas a chino e inglés según los metadatos declarados.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo thinking en la información disponible.

## Casos de uso

- Control de calidad en pipelines de digitalización: Jev se inserta tras un motor OCR y puntúa cada página; las páginas con probabilidad baja se enrutan a revisión humana, reduciendo el coste de verificación manual en grandes volúmenes documentales.
- Auditoría de extracción de datos en banca y seguros: en la digitalización de pólizas o extractos, el modelo detecta tablas o campos mal parseados antes de que los datos lleguen a sistemas transaccionales.
- Verificación de facturas y albaranes en ERP: se evalúa la fiabilidad del parsing de líneas de detalle y totales, marcando documentos sospechosos para validación contable.
- Digitalización de documentación administrativa pública: con despliegue sobre KUNLUNXIN P800 o ARM edge, permite inspeccionar lotes de expedientes en infraestructura institucional con aceleradores no-NVIDIA.
- Procesamiento en el borde (edge): con 1,20 s por bloque de página en CPU ARM M5, es viable en escáneres conectados o dispositivos de campo que necesiten validar la calidad del OCR sin enviar documentos a la nube.
- Selección de modelo OCR en producción: al puntuar resultados de distintos motores sobre el mismo documento, permite comparar y elegir el motor más fiable por tipo de documento.
- Filtrado previo en datasets de entrenamiento OCR: sirve para descartar pares documento-transcripción de baja calidad antes de usarlos en el entrenamiento de modelos de parsing.

## Benchmarks y rendimiento

| Métrica | Jev NVIDIA nativo | Jev KUNLUNXIN FlagOS |
|---|---|---|
| ocr_rm_mini (12 entradas), avg_prob_1 | 0,4817 | 0,4830 |
| omnidocbench-render-compare (60 entradas), avg_prob_1 | 0,2397 | 0,2407 |

Datos adicionales de la model card: AUROC global de 0,936 en JevOCRBench (frente a 0,938 de Qwen3.5-397B-A17B); throughput del 98,7 % respecto a NVIDIA nativo en la build FlagOS; 1,20 s por bloque de página en CPU ARM M5. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 4,4 GB solo para pesos, más overhead de activaciones y KV cache (no cuantificado en la información disponible).
- GPU validadas: KUNLUNXIN P800 con el stack FlagOS/Torch-FL; la serie completa se ha adaptado a 12 plataformas (T-Head, NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang, Mac ARM y CIX).
- GPU de consumo: por tamaño (2,21B en BF16), es previsible que quepa en GPUs consumer con 8 GB o más de VRAM, aunque no se documenta validación específica en la información disponible.
- Despliegue: imagen Docker `harbor.baai.ac.cn/flagrelease-public/torch-fl-kunlunxin001-xrt513-x64-5.0.21.47:jev-ocr-rm-2b-torchfl`; pesos vía ModelScope; inferencia con `transformers` 5.17.0 y `torch_fl` 2.10.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 1,20 s por bloque de página en CPU ARM M5; throughput del 98,7 % del nativo NVIDIA en KUNLUNXIN P800. No se publican cifras absolutas de tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AUROC JevOCRBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR Jev | 2,21B | no disponible | 0,936 | Apache 2.0 | HuggingFace / ModelScope |
| Qwen3.5-397B-A17B | 397B (17B activos) | no disponible | 0,938 | no disponible | no disponible |
| MiniCPM-OCR 1.0 | 1,3B | no disponible | no disponible | no disponible | serie MiniCPM-OCR |

La comparación relevante es con Qwen3.5-397B-A17B: Jev logra un AUROC prácticamente idéntico (0,936 frente a 0,938) con dos órdenes de magnitud menos de parámetros, lo que lo convierte en una opción mucho más económica para la misma tarea de inspección. MiniCPM-OCR 1.0 no es un competidor directo sino el modelo de parsing que Jev puede verificar. No se dispone de datos de benchmarks comparables con otros reward models OCR en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se declara soporte de castellano ni de otras lenguas.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre datos de documentos, puede heredar sesgos de dominio (tipografías, formatos y tipos documentales sobrerrepresentados).
- Riesgo de alucinación en la puntuación: al emitir probabilidades, puede sobreestimar la fiabilidad de parsings incorrectos en documentos atípicos; se recomienda calibrar el umbral con datos propios.
- Longitud de contexto no disponible, lo que impide evaluar su comportamiento en documentos muy extensos o páginas densas.
- La release está empaquetada para KUNLUNXIN P800 con Torch-FL; el script de ejemplo requiere `import torch_fl` antes de `import torch` y usa el dispositivo `flagos:0`, lo que añade complejidad de integración frente a un despliegue CUDA estándar.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones de los pesos base de la serie MiniCPM-OCR antes de un despliegue en producción.
- No se documentan garantías de soporte ni mantenimiento de esta build específica de FlagRelease.

## Enlaces

- HuggingFace: https://huggingface.co/FlagRelease/MiniCPM-OCR-Jev-BF16-kunlunxin-FlagOS
- ModelScope (descarga de pesos): comando `modelscope download --model FlagRelease/MiniCPM-OCR-Jev-BF16-kunlunxin-FlagOS`
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/torch-fl-kunlunxin001-xrt513-x64-5.0.21.47:jev-ocr-rm-2b-torchfl`
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada.
