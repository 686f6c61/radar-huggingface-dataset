# FlagRelease/MiniCPM-OCR-Jev-BF16-ascend-FlagOS

## Resumen

MiniCPM-OCR Jev es un modelo de 2.213 millones de parámetros (aproximadamente 2B) desarrollado por ModelBest junto con OpenBMB, diseñado como un "inspector de calidad" automático para resultados de parsing de documentos. A diferencia de un OCR convencional que solo transcribe, Jev evalúa la fiabilidad de la salida producida por otros modelos OCR y asigna una puntuación que permite decidir qué contenido requiere revisión humana. Esta ficha corresponde concretamente a la build `MiniCPM-OCR-Jev-BF16-ascend-FlagOS`, publicada por la comunidad FlagRelease, que adapta los pesos a hardware Huawei Ascend mediante la pila de software FlagOS.

El modelo se apoya en una arquitectura de tipo `qwen3_5` según los metadatos del repositorio, con pesos en formato safetensors y precisión BF16. Su relevancia actual radica en que aborda un problema práctico de los pipelines documentales en producción: el output de un OCR sigue necesitando verificación manual, y Jev automatiza parte de ese filtrado con un AUROC de 0,936 en JevOCRBench, muy cercano al 0,938 reportado para Qwen3.5-397B-A17B pese a su tamaño mucho menor.

La versión publicada por FlagRelease incluye validación de consistencia frente a la build nativa de NVIDIA y ofrece una imagen de contenedor lista para desplegar en Ascend, lo que facilita su adopción en infraestructuras no-NVIDIA. La licencia es Apache 2.0 y los idiomas declarados son chino e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según metadatos del repositorio) |
| Parametros totales | 2.213.245.760 (aproximadamente 2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados en BF16); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los metadatos del repositorio identifican la arquitectura como `qwen3_5`, lo que sitúa a Jev sobre una base de transformer denso de la familia Qwen 3.5, con aproximadamente 2.213 millones de parámetros en BF16. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esa información no está disponible en la documentación proporcionada.

La innovación principal del modelo no es arquitectónica sino funcional: Jev actúa como evaluador de fiabilidad de parsing documental ("AI quality inspector"). Según la model card, se puede conectar a distintos modelos OCR para puntuar la calidad de su salida y señalar contenido que requiere revisión humana. La build de FlagOS añade adaptación multiplataforma: cubre 12 plataformas (T-Head, NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang, Mac ARM y CIX), y en la evaluación de esta ronda alcanza el 98,7 % del throughput de cómputo nativo de NVIDIA. En dispositivos edge ARM, Jev completa una evaluación de bloque de página en 1,20 segundos de media usando solo la CPU M5.

## Capacidades

- Evaluación de fiabilidad de resultados OCR: asigna puntuaciones de probabilidad que indican la calidad del parsing producido por otro modelo.
- Integración con pipelines OCR heterogéneos: puede insertarse como etapa de verificación tras distintos motores de reconocimiento.
- Procesamiento de documentos reales: la serie MiniCPM-OCR está orientada a escaneos, fotografías, páginas curvadas y pantallas re-fotografiadas.
- Parsing de texto, fórmulas y tablas complejas (capacidad de la familia MiniCPM-OCR; la model card atribuye el parsing a OCR 1.0 y la evaluación de calidad a Jev).
- Extracción de información clave de documentos (atribuido a la familia en la model card).
- Soporte multilingüe limitado a chino e inglés según los metadatos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Control de calidad en pipelines de digitalización masiva: Jev se coloca como etapa posterior al OCR y puntúa cada página; las páginas con probabilidad baja se enrutan a revisión humana, reduciendo el volumen de verificación manual.
- Auditoría de extracción de datos en banca y seguros: tras extraer campos de contratos o formularios, Jev señala las extracciones dudosas antes de que entren en sistemas transaccionales.
- Validación de facturas y albaranes en back-office: el modelo evalúa la fiabilidad del parsing de tablas y campos clave, permitiendo tolerar errores de OCR sin contaminar el ERP.
- Procesamiento de documentación regulatoria en chino e inglés: gracias a su soporte bilingüe, puede verificar documentos en ambos idiomas en el mismo flujo.
- Despliegue en infraestructura Huawei Ascend: la build FlagOS incluye imagen de contenedor y scripts de inferencia preconfigurados, lo que permite montar el servicio en minutos sobre Ascend 910C sin adaptar manualmente la pila.
- Inferencia en dispositivos edge ARM: con 1,20 segundos por bloque de página en CPU M5, es viable en terminales de digitalización o escáneres inteligentes sin GPU dedicada.
- Filtrado previo en sistemas de archivo documental: puntuar la calidad antes de indexar evita incorporar texto corrupto a motores de búsqueda o RAG.

## Benchmarks y rendimiento

| Métrica | MiniCPM-OCR-Jev-Nvidia-Origin | MiniCPM-OCR-Jev-Ascend-FlagOS |
|---|---|---|
| ocr_rm_mini (12 entradas) avg_prob_1 | 0,4817 | 0,4822 |
| omnidocbench-render-compare (60 entradas) avg_prob_1 | 0,2397 | 0,2385 |

Datos adicionales reportados en la model card:

| Métrica | Valor |
|---|---|
| AUROC en JevOCRBench (Jev) | 0,936 |
| AUROC en JevOCRBench (Qwen3.5-397B-A17B) | 0,938 |
| Throughput FlagOS vs. nativo NVIDIA | 98,7 % |
| Latencia por bloque de página en CPU M5 (ARM) | 1,20 s de media |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,4 GB solo para pesos (tamaño del repo), más overhead de activaciones y KV cache; el total dependerá de la longitud de contexto, que no está documentada.
- GPU recomendadas: la build evaluada se ejecuta sobre Huawei Ascend 910C con CANN 9.0.0; la build nativa de referencia es para NVIDIA.
- Cabe en GPU de consumo: con pesos BF16 de unos 4,4 GB, es plausible en GPUs consumer con 8 GB o más de VRAM; no se confirma en la documentación disponible.
- Opciones de despliegue: imagen Docker FlagOS para Ascend (`harbor.baai.ac.cn/flagrelease-public/...`), scripts de inferencia incluidos en la imagen y descarga de pesos vía ModelScope. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la model card.
- Latencia: 1,20 segundos por bloque de página en CPU M5 (ARM); 98,7 % del throughput nativo NVIDIA en la build FlagOS para Ascend.
- Entorno de referencia: Docker 20.10.8, openEuler 22.03 (LTS-SP4), CANN 9.0.0, Python 3.11.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AUROC JevOCRBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR Jev | ~2B | no disponible | 0,936 | Apache 2.0 | HuggingFace (build Ascend FlagOS) |
| MiniCPM-OCR 1.0 | 1,3B | no disponible | no disponible | no disponible en la información | Open source (ModelBest/OpenBMB) |
| Qwen3.5-397B-A17B | 397B totales (17B activos) | no disponible | 0,938 | no disponible en la información | no disponible en la información |

La comparación relevante es que Jev, con aproximadamente 2B de parámetros, alcanza un AUROC de 0,936 frente al 0,938 de Qwen3.5-397B-A17B, lo que supone una diferencia de 0,002 puntos con un modelo dos órdenes de magnitud mayor. MiniCPM-OCR 1.0 es el modelo de parsing de la misma familia (1,3B), mientras que Jev es el evaluador de calidad; se complementan en el pipeline.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no hay soporte declarado para castellano ni otras lenguas.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con documentos de gran tamaño sin pruebas previas.
- No hay información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación no cuantificado: el modelo produce puntuaciones de fiabilidad, no texto libre, pero no se documenta su calibración fuera de los benchmarks reportados.
- La build publicada está optimizada para Huawei Ascend; usarla en NVIDIA o CPU requiere la build nativa correspondiente, no incluida en este repositorio.
- El repositorio tiene solo 10 descargas y 0 likes, lo que sugiere poca validación comunitaria; conviene tratar la build como reciente.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento.
- No se documentan capacidades de tool calling, agentes ni visión directa; el modelo debe integrarse con un OCR externo que produzca la salida a evaluar.

## Enlaces

- HuggingFace: https://huggingface.co/FlagRelease/MiniCPM-OCR-Jev-BF16-ascend-FlagOS
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/jev-value-ascend001-gems0.0.0-tree0.7.0-cxnone-pluginnone-vllmnone-sglangnone-sglangflnone-cp311-ptnpunone-cann90-a64-none:202610271104`
- Descarga de pesos vía ModelScope: `modelscope download --model FlagRelease/MiniCPM-OCR-Jev-BF16-ascend-FlagOS`
- Paper, blog o repositorio de ModelBest/OpenBMB: no disponible en la información proporcionada.
