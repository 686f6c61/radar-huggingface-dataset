# FlagRelease/MiniCPM-OCR-Jev-BF16-zhenwu-FlagOS

## Resumen

MiniCPM-OCR-Jev es un modelo de 2B parámetros (2.213.245.760 pesos en safetensors) desarrollado por ModelBest junto con OpenBMB dentro de la familia MiniCPM-OCR, dedicada al parseo de documentos y reconocimiento de texto. A diferencia de MiniCPM-OCR 1.0 (1.3B), que realiza la extracción de texto, fórmulas y tablas, Jev actúa como un "inspector de calidad": recibe la imagen original, la imagen renderizada del parseo y el texto OCR producido, y emite una puntuación de fiabilidad que permite decidir qué documentos requieren revisión humana.

La versión publicada en este repositorio es un build de FlagOS (FlagRelease), la pila de software open source que unifica modelo, sistema y chip para ejecutar el mismo modelo sobre aceleradores heterogéneos (T-Head, NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang, Mac ARM y CIX). El checkpoint está en BF16 y se distribuye con licencia Apache 2.0, con soporte declarado de chino e inglés.

El interés actual del modelo reside en su función de verificación automática de pipelines OCR: permite cerrar el bucle de calidad sin intervención manual masiva, con un AUROC de 0,936 en JevOCRBench, prácticamente idéntico al 0,938 reportado para Qwen3.5-397B-A17B en la misma prueba, con dos órdenes de magnitud menos de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (tag de HuggingFace: `qwen3_5`; el autor no detalla la arquitectura en la model card) |
| Parámetros totales | 2.213.245.760 (≈2B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (checkpoint publicado); no se documentan otras variantes |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,4 GB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo: solo se conoce el tag `qwen3_5` en HuggingFace, lo que sugiere una base derivada de la familia Qwen3.5, y que el checkpoint se distribuye en BF16. No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF o DPO.

El elemento técnico diferencial documentado es el modo de uso: el script de inferencia (`demo_value_head_gdn.py`) recibe tres entradas —imagen original, imagen renderizada del parseo y fichero de texto OCR— y produce una puntuación de fiabilidad, lo que implica una cabeza de valor (*value head*) sobre el modelo base. El modelo se integra en el stack FlagOS, con soporte de FlagScale (entrenamiento e inferencia distribuida), FlagGems (librería de operadores en Triton), FlagCX (comunicación) y FlagTree (compilador unificado), lo que permite el despliegue sobre 12 plataformas de cómputo distintas.

## Capacidades

- Evaluación de calidad de parseo OCR: puntúa la fiabilidad de la salida de un OCR comparando imagen original, imagen renderizada y texto extraído.
- Detección de errores de parseo en documentos reales: escaneos, fotografías, páginas curvadas y re-fotografías de pantallas.
- Verificación de extracción de texto, fórmulas y tablas complejas (el pipeline MiniCPM-OCR 1.0 que alimenta a Jev cubre estos tipos de contenido).
- Extracción de información clave (*key information extraction*) como parte del pipeline documental.
- Integración como componente de inspección en pipelines OCR de terceros, no solo en la familia MiniCPM-OCR.
- Multilingüe limitado a chino e inglés.
- No se documentan tool calling, function calling, capacidades de agente, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Control de calidad en digitalización masiva de archivos: Jev puntúa cada página procesada por un OCR y marca las que caen por debajo de un umbral de fiabilidad, reduciendo la revisión manual a una fracción del volumen total.
- Verificación de extracción de tablas financieras: en pipelines que convierten estados de cuenta o informes escaneados a datos estructurados, Jev compara el render reconstruido con la imagen original para detectar celdas mal alineadas o columnas perdidas.
- Inspección de fórmulas en documentación técnica y científica: al puntuar la fidelidad del render LaTeX frente a la imagen de origen, permite filtrar fórmulas corruptas antes de indexarlas en un repositorio de conocimiento.
- Auditoría de pipelines OCR de terceros: la model card indica que Jev puede enchufarse a distintos modelos OCR, de modo que un equipo puede mantener su motor de extracción actual y añadir Jev como capa de verificación sin reemplazarlo.
- Despliegue en edge para evaluación de páginas: en dispositivos ARM, Jev completa la evaluación de un bloque de página en 1,20 s de media usando solo la CPU M5, lo que habilita la verificación en escáneres o terminales sin GPU.
- Procesamiento en servidores multi-chip con requisitos de soberanía tecnológica: gracias a FlagOS, el mismo modelo se ejecuta sobre T-Head, Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Iluvatar CoreX, CIX, etc., útil en entornos donde no se puede depender de NVIDIA.
- Filtrado previo a revisión humana en *back offices* legales o administrativos: la puntuación de fiabilidad permite priorizar la cola de revisión por riesgo, en lugar de revisar por orden de llegada.

## Benchmarks y rendimiento

Resultados publicados en la model card para el build FlagOS frente al build nativo de NVIDIA:

| Métrica | MiniCPM-OCR-Jev-Nvidia-Origin | MiniCPM-OCR-Jev-T-Head-FlagOS |
|---|---|---|
| ocr_rm_mini (12 entradas), avg_prob_1 | 0,4817 | 0,4824 |
| omnidocbench-render-compare (60 entradas), avg_prob_1 | 0,2397 | 0,2417 |

Otros datos reportados por el autor:

| Métrica | Valor |
|---|---|
| AUROC en JevOCRBench (Jev, 2B) | 0,936 |
| AUROC en JevOCRBench (Qwen3.5-397B-A17B, referencia) | 0,938 |
| Throughput de cómputo del build FlagOS vs. nativo NVIDIA | 98,7 % |
| Throughput P50 por unidad de cómputo pico, OCR 1.0 en la misma plataforma | hasta 1,69× el nativo |
| Latencia de evaluación de bloque de página en ARM (CPU M5) | 1,20 s de media |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de propósito general en la información disponible, lo que es coherente con la naturaleza especializada del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 4,4 GB solo para pesos (2,21B × 2 bytes), más overhead de activaciones y del pipeline de imagen; un presupuesto práctico de 8-12 GB de VRAM es razonable, aunque el autor no publica cifras oficiales.
- GPU recomendadas: no especificadas por el autor. El build evaluado se ejecutó sobre T-Head y sobre NVIDIA nativo; el stack FlagOS cubre además Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang y CIX.
- Cabe en GPU de consumo: sí, por tamaño (≈2B en BF16), aunque no hay validación publicada en RTX 4090/3090 para este checkpoint concreto.
- Despliegue en edge: validado en CPU ARM (M5) con 1,20 s por bloque de página, sin GPU.
- Opciones de despliegue: contenedor Docker de FlagOS (`harbor.baai.ac.cn/flagrelease-public/minicpm-ocr-jev-...`, con vLLM 0.23.0, PyTorch 2.10 y Python 3.12), descarga de pesos vía ModelScope, y script de inferencia `demo_value_head_gdn.py` sobre `/opt/minicpm-jev-transformers`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 98,7 % del throughput nativo NVIDIA en el build FlagOS; 1,20 s por bloque de página en ARM M5. No hay cifras de tokens/s publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | AUROC JevOCRBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniCPM-OCR Jev (este) | ≈2B | no disponible | Inspector de calidad OCR | 0,936 | Apache 2.0 | HuggingFace + contenedor FlagOS |
| MiniCPM-OCR 1.0 | 1,3B | no disponible | Parseo OCR (texto, fórmulas, tablas) | no aplica (no es inspector) | no disponible en la información | Open source según model card |
| Qwen3.5-397B-A17B | 397B totales / 17B activos | no disponible | Modelo generalista multimodal | 0,938 | no disponible en la información | no disponible en la información |

La comparación relevante es la de eficiencia: Jev iguala en la práctica el AUROC de un modelo generalista casi 200 veces mayor en parámetros totales, pero a costa de estar especializado exclusivamente en la verificación de parseo documental y de no ofrecer las capacidades generales de Qwen3.5.

## Limitaciones y advertencias

- Modelo de propósito muy específico: no es un LLM generalista ni un OCR completo; solo puntúa la calidad de un parseo ya producido.
- Idiomas limitados a chino e inglés; el rendimiento en otras lenguas no está documentado y probablemente sea deficiente.
- Longitud de contexto no publicada: no se puede planificar el procesamiento de documentos de muchas páginas sin validación previa.
- Arquitectura y datos de entrenamiento no documentados en la model card, lo que dificulta evaluar sesgos de dominio (por ejemplo, hacia tipos de documento concretos).
- Riesgo de alucinación en la puntuación: al ser un modelo neuronal, puede asignar alta fiabilidad a parseos incorrectos en tipografías, idiomas o layouts poco representados en entrenamiento.
- El repositorio tiene 8 descargas y 0 likes en el momento de la ficha: ecosistema de validación muy reducido, sin evidencia de uso en producción por terceros.
- La licencia Apache 2.0 permite uso comercial, pero el contenedor FlagOS y sus dependencias (vLLM, FlagGems, etc.) deben verificarse por separado.
- El despliegue documentado depende de un contenedor concreto alojado en `harbor.baai.ac.cn`; conviene comprobar la disponibilidad y el mantenimiento de esa imagen antes de integrarla en producción.
- La evaluación publicada se limita a dos métricas internas (`ocr_rm_mini`, `omnidocbench-render-compare`) y al AUROC de JevOCRBench; no hay benchmarks independientes.

## Enlaces

- HuggingFace: https://huggingface.co/FlagRelease/MiniCPM-OCR-Jev-BF16-zhenwu-FlagOS
- AnythingLLM (integración mencionada en la model card): https://anythingllm.com/
- Triton (dependencia de FlagGems): https://github.com/openai/triton
- Contenedor FlagOS: `harbor.baai.ac.cn/flagrelease-public/minicpm-ocr-jev-pp001-gems0.0.0-tree0.7.0-cxnone-pluginnone-vllm0.23.0-cp312-pt210-hggc130-x64-2.1.1-rbd225:202610271142`
- Paper, blog o repositorio oficial de MiniCPM-OCR: no disponible en la información proporcionada.
