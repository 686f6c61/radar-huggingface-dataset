# FlagRelease/MiniCPM-OCR-Jev-BF16-mthreads-FlagOS

## Resumen

MiniCPM-OCR Jev es un modelo de 2.213.245.760 parámetros (aproximadamente 2,2B) desarrollado por ModelBest junto con OpenBMB, orientado a la evaluación automática de la calidad de resultados de OCR y al parsing de documentos. A diferencia de un OCR convencional, Jev actúa como un "inspector de calidad": recibe el resultado de un sistema de reconocimiento de texto y asigna una puntuación de fiabilidad, lo que permite marcar qué fragmentos requieren revisión humana. Según la model card, alcanza un AUROC de 0,936 en JevOCRBench, muy cerca del 0,938 de Qwen3.5-397B-A17B.

La versión publicada bajo el identificador `FlagRelease/MiniCPM-OCR-Jev-BF16-mthreads-FlagOS` es una adaptación del modelo original para la pila de software FlagOS, que permite ejecutarlo sobre 12 plataformas de cómputo distintas (NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, T-Head, entre otras). Esta build concreta está empaquetada en BF16 y optimizada para Moore Threads mediante el runtime MUSA 5.2, con una imagen Docker lista para desplegar.

El interés de esta ficha radica en que documenta una variante de portabilidad de un modelo especializado en control de calidad documental, un nicho poco cubierto por los modelos generalistas. La información pública disponible es limitada: la model card se centra en el despliegue y en dos métricas de validación de consistencia, sin detallar la composición del dataset de entrenamiento ni la arquitectura interna más allá del tag `qwen3_5`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5` en Hugging Face; detalles internos no disponibles) |
| Parámetros totales | 2.213.245.760 (aproximadamente 2,2B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec oficial; el script de despliegue arranca con `--max-token-len 12000` |
| Tipos de cuantización | BF16 (build publicada); no se documentan otras variantes en esta ficha |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 4,4 GB |
| Pipeline declarado | no disponible |
| Runtime de referencia | FlagOS-Mthreads, MUSA 5.2, Python 3.10, PyTorch 2.10 |

## Arquitectura y entrenamiento

La model card no describe en detalle la arquitectura interna. El tag de Hugging Face (`qwen3_5`) sugiere una base derivada de la familia Qwen 3.5, y el checkpoint referenciado en los comandos de despliegue (`qwen35_2b_l2_triple_value_checkpoint-3000`) apunta a un modelo de 2B con una cabeza de valoración ("triple value") entrenada para puntuar la calidad de la salida OCR. El modelo se distribuye en BF16 con pesos en safetensors y un total de 2.213.245.760 parámetros.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que el modelo forma parte de la serie MiniCPM-OCR, que incluye también a MiniCPM-OCR 1.0 (1,3B), orientado al parsing directo de documentos con soporte de texto, fórmulas y tablas complejas, y que alcanzó 93,68 en Real5-OmniDocBench. La innovación destacable de esta build es la integración con FlagOS: un stack multi-chip que permite ejecutar el mismo modelo sobre hardware muy diverso con una degradación de rendimiento mínima (98,7% del throughput nativo de NVIDIA en la build de Jev).

## Capacidades

- Evaluación de fiabilidad de resultados OCR: asigna una probabilidad o puntuación a la salida de un sistema de reconocimiento, permitiendo priorizar la revisión humana.
- Parsing y reconocimiento de documentos: la serie MiniCPM-OCR cubre texto, fórmulas y tablas complejas, así como extracción de información clave.
- Procesamiento de documentos reales: escaneos, fotografías, páginas curvadas y pantallas re-fotografiadas.
- Soporte multi-idioma limitado a chino e inglés.
- Integración con pipelines de OCR existentes: el modelo puede acoplarse a distintos motores de OCR como capa de control de calidad.
- Despliegue multi-chip: compatible con 12 plataformas de cómputo a través de FlagOS.
- Ejecución en dispositivos ARM edge: según la model card, completa una evaluación de bloque de página en 1,20 segundos de media usando solo la CPU M5.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking o razonamiento multi-paso explícito: no disponible en la información proporcionada.
- Capacidades de visión, audio o agente: no disponibles en la información proporcionada.

## Casos de uso

- Control de calidad en digitalización masiva de archivos: Jev se coloca como capa posterior a un motor OCR y puntúa cada página; las páginas con baja puntuación se derivan a revisión humana, reduciendo el coste de verificación manual en lotes de miles de documentos.
- Procesamiento de facturas y albarranes en back office: el modelo evalúa la fiabilidad de la extracción de campos clave (importes, fechas, NIF) y marca los documentos dudosos antes de que entren en el ERP, evitando errores contables.
- Digitalización de documentación legal y expedientes: en despachos y administraciones públicas, permite priorizar la revisión de expedientes escaneados con baja calidad o páginas curvadas, donde el OCR suele fallar con más frecuencia.
- Despliegue en infraestructura no NVIDIA: gracias a la build FlagOS, el modelo puede ejecutarse sobre Huawei Ascend, Hygon, KUNLUNXIN o Moore Threads, lo que facilita su adopción en organizaciones con hardware nacional o heterogéneo.
- Procesamiento en el borde (edge): con 1,20 segundos por bloque de página en CPU ARM M5, es viable integrarlo en escáneres de red o dispositivos de digitalización de oficina sin GPU dedicada.
- Validación de pipelines OCR en producción: el equipo de datos puede usar Jev para monitorizar la calidad de un motor OCR a lo largo del tiempo, detectando regresiones tras cambios de versión o de modelo.
- Enriquecimiento de datasets de entrenamiento: las puntuaciones de fiabilidad permiten filtrar pares documento-texto de baja calidad antes de usarlos para entrenar o ajustar otros modelos de OCR.

## Benchmarks y rendimiento

La model card proporciona dos métricas de validación de consistencia entre la build nativa de NVIDIA y la build FlagOS para Moore Threads:

| Métrica | MiniCPM-OCR-Jev-Nvidia-Origin | MiniCPM-OCR-Jev-Mthreads-FlagOS |
|---|---|---|
| ocr_rm_mini (12 entradas), avg_prob_1 | 0,4817 | 0,4820 |
| omnidocbench-render-compare (60 entradas), avg_prob_1 | 0,2397 | 0,241336 |

Además, la model card cita un AUROC global de 0,936 en JevOCRBench, frente a 0,938 de Qwen3.5-397B-A17B. También se menciona que la build FlagOS de Jev alcanza el 98,7% del throughput de cómputo nativo de NVIDIA. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,4 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 8-10 GB para un despliegue cómodo.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090; Huawei Ascend; Hygon; KUNLUNXIN; MetaX; Moore Threads (runtime MUSA 5.2, plataforma de referencia de esta build); T-Head; Tsingmicro; Iluvatar CoreX; Xiwang; CIX.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en BF16; en cuantizaciones de 8 bits o 4 bits cabría en GPUs de 4-6 GB, aunque no se documentan esas variantes en esta ficha.
- Despliegue: la build publicada se sirve mediante el contenedor FlagOS-Mthreads con el script `serve_value` sobre el puerto 18510. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia: 1,20 segundos de media por bloque de página en CPU ARM M5 (dispositivo edge); no se proporcionan cifras de throughput en GPU.
- Almacenamiento: el repositorio ocupa 4,4 GB; la imagen Docker de FlagOS requiere espacio adicional no especificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR Jev (esta ficha) | 2,2B | no disponible (script con 12.000 tokens) | AUROC 0,936 en JevOCRBench | Apache 2.0 | Hugging Face, ModelScope, imagen Docker FlagOS |
| MiniCPM-OCR 1.0 | 1,3B | no disponible | 93,68 en Real5-OmniDocBench | Apache 2.0 (según la serie) | Open source (ModelBest/OpenBMB) |
| Qwen3.5-397B-A17B | 397B totales / 17B activos | no disponible | AUROC 0,938 en JevOCRBench | no disponible en la información | no disponible en la información |

La comparación con Qwen3.5-397B-A17B es especialmente relevante: Jev, con 2,2B de parámetros, se queda a dos milésimas de AUROC de un modelo casi 180 veces mayor en parámetros totales, lo que sugiere una especialización muy eficiente para la tarea de evaluación de calidad OCR. No se dispone de datos de benchmarks de otros modelos especializados en control de calidad documental para ampliar la comparativa.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- La model card no documenta sesgos conocidos ni evaluación de sesgos; se desconoce su comportamiento en documentos con sesgos demográficos o culturales.
- Riesgo de alucinación inherente a los modelos generativos: las puntuaciones de fiabilidad pueden ser incorrectas en documentos atípicos o con ruido extremo, por lo que no deben sustituir por completo la revisión humana.
- La información pública sobre el entrenamiento es escasa: no se detalla el dataset, el número de tokens ni el proceso de alineación, lo que dificulta evaluar su robustez fuera de los dominios de validación.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos base sobre los que se construyó (tag `qwen3_5`) y de los componentes de FlagOS.
- El despliegue de referencia está fuertemente acoplado a la imagen Docker de FlagOS-Mthreads y al runtime MUSA; portarlo a otros backends requiere trabajo adicional no documentado.
- La longitud de contexto efectiva no está especificada oficialmente; el valor de 12.000 tokens del script de arranque es una configuración de servicio, no una spec del modelo.
- El repositorio tiene muy poca tracción (9 descargas, 0 likes), lo que limita la validación comunitaria y el soporte disponible.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/MiniCPM-OCR-Jev-BF16-mthreads-FlagOS
- ModelScope (descarga de pesos): `modelscope download --model FlagRelease/MiniCPM-OCR-Jev-BF16-mthreads-FlagOS`
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/jev-value-mthreads001-gems5.4.0-tree0.7.0-cx0.14.0-pluginnone-vllmnone-sglangnone-sglangflnone-cp310-pt210-musa52-x64-3.3.5-server:202610271059`
- Repositorio de ModelBest/OpenBMB para MiniCPM-OCR: no disponible en la información proporcionada.
- Paper o blog técnico de MiniCPM-OCR: no disponible en la información proporcionada.
