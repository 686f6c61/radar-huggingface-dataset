# FlagRelease/MiniCPM-OCR-Jev-BF16-tsingmicro-FlagOS

## Resumen

MiniCPM-OCR Jev es un modelo de 2B parámetros (2.213.245.760 pesos reales en safetensors) desarrollado por ModelBest junto con OpenBMB, especializado en el control de calidad de resultados de OCR y parsing de documentos. A diferencia de un OCR convencional, Jev actúa como un "inspector de calidad": puntúa la fiabilidad de la salida producida por otro modelo de OCR y señala qué fragmentos requieren revisión humana. Esta publicación concreta es la build BF16 de FlagRelease para el chip Tsingmicro bajo el stack FlagOS.

El modelo se apoya en la arquitectura `qwen3_5` (según los tags del repositorio) y forma parte de la familia MiniCPM-OCR, que incluye también a MiniCPM-OCR 1.0 (1,3B), orientado al parsing directo de escaneos, fotos, páginas curvadas y pantallas re-fotografiadas. Jev cubre la fase posterior: verificar automáticamente la calidad de ese parsing. Su AUROC de 0,936 en JevOCRBench lo sitúa a la par del 0,938 de Qwen3.5-397B-A17B, un modelo enormemente mayor.

La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeño y especializado que resuelve un problema real en pipelines documentales (la verificación manual del output OCR); por otro, muestra el trabajo de adaptación multi-chip de FlagOS, que ofrece soporte Day-0 en 12 plataformas y una imagen Docker lista para Tsingmicro. El repositorio tiene un tamaño de 4,4 GB y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (según tags del repositorio; detalles internos no disponibles) |
| Parametros totales | 2.213.245.760 (2,2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (build publicada); no se documentan otras variantes |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio etiqueta el modelo con la arquitectura `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5 adaptada a la tarea de evaluación de calidad OCR, si bien la model card no detalla la configuración interna (número de capas, dimensiones ocultas, mecanismo de atención ni si incorpora componentes multimodales). Tampoco se especifican los datos de entrenamiento: no hay información sobre el número de tokens, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o un proceso de anotación específico para la tarea de scoring de fiabilidad.

La innovación técnica documentada no está en la arquitectura sino en el propósito: Jev emite una puntuación de fiabilidad sobre el resultado de parsing de otro OCR, de modo que puede encadenarse a distintos motores de OCR como capa de control. En el plano de despliegue, la build de FlagRelease se apoya en el stack FlagOS (FlagScale, FlagGems, FlagCX, FlagTree) para ejecutarse sobre Tsingmicro con un contenedor preconfigurado con vLLM 0.24.0. La model card menciona además que, en ARM edge, Jev completa la evaluación de un bloque de página en 1,20 s de media usando solo la CPU M5, y que la build FlagOS de Jev alcanza el 98,7% del throughput nativo de NVIDIA.

## Capacidades

- Evaluación de fiabilidad de resultados OCR: asigna una probabilidad o puntuación de corrección al output de un motor de OCR.
- Detección de contenido que requiere revisión humana, integrable como paso previo a un flujo de verificación manual.
- Parsing de documentos en el ecosistema MiniCPM-OCR: texto, fórmulas y tablas complejas (capacidad atribuida a la familia; la model card describe estas funciones para OCR 1.0 y el control de calidad para Jev).
- Extracción de información clave de documentos, según la descripción del conjunto de la serie.
- Soporte bilingüe chino-inglés.
- Integración con AnythingLLM documentada en la model card (configuración de parámetros del LLM y conversación).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio nativos: no disponible en la información proporcionada.

## Casos de uso

- Control de calidad en pipelines de digitalización: Jev se coloca después del motor de OCR y puntúa cada página o bloque; los resultados por debajo de un umbral se enrutan a revisión humana, reduciendo el coste de verificación manual masiva en archivos y gestorías.
- Auditoría de extracción de datos en facturación: tras el parsing de facturas y albaranes, Jev evalúa la fiabilidad de los campos extraídos y marca los documentos dudosos antes de que entren en el ERP.
- Procesamiento de documentos históricos escaneados: combinado con MiniCPM-OCR 1.0 sobre páginas curvadas o re-fotografiadas, Jev detecta qué páginas han sido mal interpretadas y deben reescanearse o revisarse.
- Despliegue en edge con ARM: con 2,2B parámetros y 1,20 s por bloque de página en CPU M5, es viable en terminales de digitalización o dispositivos de campo sin GPU dedicada.
- Ingesta documental para RAG: antes de indexar PDFs parseados en un sistema de recuperación, Jev filtra los fragmentos de baja fiabilidad para evitar que errores de OCR contaminen el corpus.
- Validación de tablas y fórmulas en documentación técnica: en manuales y papers con tablas complejas, Jev señala las regiones donde el parser probablemente falló, priorizando la revisión de esas zonas.
- Despliegue multi-chip en servidores: la imagen Docker de FlagOS para Tsingmicro permite levantar el servicio en minutos en infraestructura no NVIDIA, útil en entornos con aceleradores nacionales o heterogéneos.

## Benchmarks y rendimiento

| Métrica | MiniCPM-OCR-Jev NVIDIA (origin) | MiniCPM-OCR-Jev Tsingmicro (FlagOS) |
|---|---|---|
| ocr_rm_mini (12 entradas), avg_prob_1 | 0,4817 | En evaluación |
| omnidocbench-render-compare (60 entradas), avg_prob_1 | 0,2397 | En evaluación |

Datos adicionales aportados en la model card: AUROC global de 0,936 en JevOCRBench (frente a 0,938 de Qwen3.5-397B-A17B); throughput de la build FlagOS de Jev equivalente al 98,7% del nativo NVIDIA; 1,20 s de media por bloque de página en CPU M5 (ARM). Para MiniCPM-OCR 1.0 (1,3B) se reporta 93,68 en Real5-OmniDocBench y una mejora del 55% en eficiencia extremo a extremo con decodificación DSpark. No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K para Jev.

## Requisitos de hardware

- VRAM estimada: con 2,2B parámetros en BF16, los pesos ocupan aproximadamente 4,4 GB; en FP16/BF16 la inferencia requiere en torno a 5-6 GB de VRAM incluyendo overhead de activaciones y caché KV (estimación, no dato oficial).
- GPU recomendadas: el stack de referencia es vLLM 0.24.0; la build publicada está validada para Tsingmicro y el ecosistema FlagOS cubre T-Head, NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Iluvatar CoreX, Xiwang, Mac (ARM) y CIX.
- GPU de consumo: por tamaño, cabe en tarjetas consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante), aunque no se documenta una validación oficial en estas.
- Despliegue: imagen Docker de FlagOS (`harbor.baai.ac.cn/flagrelease-public/minicpm-ocr-jev-tsingmicro001-...`), vLLM 0.24.0, script `jev_offline.py`; descarga de pesos vía ModelScope. Soporte de llama.cpp, Ollama o TGI: no disponible.
- Latencia: 1,20 s por bloque de página en CPU M5 (ARM); throughput en servidor Tsingmicro al 98,7% del nativo NVIDIA (sin cifras absolutas publicadas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR Jev (esta ficha) | 2,2B | no disponible | Scoring de fiabilidad OCR / control de calidad | Apache 2.0 | Hugging Face, ModelScope, imagen Docker FlagOS |
| MiniCPM-OCR 1.0 | 1,3B | no disponible | Parsing OCR de documentos (texto, fórmulas, tablas) | Apache 2.0 | Open source (OpenBMB/ModelBest) |
| Qwen3.5-397B-A17B | 397B totales / 17B activos | no disponible | Modelo generalista de referencia en JevOCRBench (AUROC 0,938) | no disponible | no disponible |

La comparación directa con motores OCR clásicos o con modelos de visión-lenguaje generalistas no está disponible en la información proporcionada. El dato más relevante es que Jev, con 2,2B, iguala prácticamente el AUROC de un modelo de 397B en la tarea específica de verificación.

## Limitaciones y advertencias

- El modelo está diseñado para evaluar la fiabilidad de un OCR, no para sustituirlo; su utilidad depende de la calidad del motor de OCR subyacente.
- Idiomas limitados a chino e inglés; el rendimiento en otras lenguas no está documentado.
- No se especifican sesgos conocidos ni evaluación de robustez frente a dominios distintos del documental.
- Riesgo de alucinación inherente a los modelos generativos: la puntuación de fiabilidad puede no correlacionar con errores reales en tipos de documento no representados en JevOCRBench.
- La build publicada es específica para Tsingmicro (BF16); para otras plataformas hay que recurrir a las builds correspondientes del ecosistema FlagOS o a los pesos originales.
- Los benchmarks de esta build FlagOS aparecen como "Evaluating" en la model card: la paridad de resultados con el nativo NVIDIA no está cerrada en el momento de la publicación.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los pesos base de la familia Qwen 3.5 y de los componentes FlagOS.
- Longitud de contexto no documentada: planificar el troceado de documentos largos sin asumir una ventana concreta.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/MiniCPM-OCR-Jev-BF16-tsingmicro-FlagOS
- AnythingLLM: https://anythingllm.com/
- Triton (dependencia de FlagGems): https://github.com/openai/triton
- FlagOS / FlagRelease: no disponible en la información proporcionada (plataforma de release del ecosistema FlagOS, contenedor en harbor.baai.ac.cn)
- Paper, blog o demo oficial de MiniCPM-OCR Jev: no disponible en la información proporcionada.
