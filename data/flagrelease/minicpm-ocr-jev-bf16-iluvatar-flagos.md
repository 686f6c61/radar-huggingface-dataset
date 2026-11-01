# FlagRelease/MiniCPM-OCR-Jev-BF16-iluvatar-FlagOS

## Resumen

MiniCPM-OCR Jev es un modelo de 2.213 millones de parámetros (2B) desarrollado por ModelBest junto con OpenBMB, concebido como un "inspector de calidad" automático para resultados de OCR y parsing de documentos. A diferencia de los modelos OCR clásicos, que se limitan a transcribir, Jev recibe una imagen de documento junto con la salida de un motor OCR y emite una puntuación de fiabilidad que permite decidir qué contenido requiere revisión humana. La versión publicada en este repositorio es la build BF16 adaptada por la comunidad FlagOS para aceleradores Iluvatar CoreX, con empaquetado listo para desplegar.

El modelo se apoya en la arquitectura Qwen3.5 (etiqueta `qwen3_5` en el repositorio) y se distribuye como un checkpoint de clasificación de secuencias (`Qwen3_5ForSequenceClassification`), con un procesador multimodal que acepta imágenes. Forma parte de la familia MiniCPM-OCR, que incluye también MiniCPM-OCR 1.0 (1.3B), orientado al parsing directo de texto, fórmulas y tablas complejas. Jev complementa a ese modelo puntuando la calidad del resultado en lugar de generarlo.

La relevancia actual del modelo reside en su enfoque de verificación: según la model card, alcanza un AUROC de 0,936 en JevOCRBench, prácticamente idéntico al 0,938 de Qwen3.5-397B-A17B, con dos órdenes de magnitud menos de parámetros. Además, la build de FlagOS para Iluvatar alcanza el 98,7 % del rendimiento nativo en NVIDIA y completa la evaluación de un bloque de página en 1,20 segundos sobre CPU ARM M5, lo que lo hace viable en entornos de borde y en infraestructura no-NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5, con cabeza de clasificación de secuencias (`Qwen3_5ForSequenceClassification`) y procesador multimodal |
| Parámetros totales | 2.213.245.760 (2B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (checkpoint publicado); no se detallan otras variantes |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; tamaño del repositorio 4,4 GB |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se construye sobre la familia Qwen3.5 y se carga mediante `Qwen3_5ForSequenceClassification`, es decir, un transformer con cabeza de clasificación que produce una puntuación de probabilidad (`avg_prob_1`) en lugar de texto generado. El procesador asociado (`AutoProcessor`) es multimodal y recibe imágenes de documento junto con la salida OCR a evaluar. El checkpoint referenciado en los scripts de inferencia (`qwen35_2b_l2_triple_value_checkpoint-3000`) sugiere un entrenamiento con triple objetivo de valores y 3.000 pasos, aunque no se detalla la composición del dataset ni el volumen de tokens utilizados.

No se han publicado en la información disponible detalles sobre la composición de los datos de entrenamiento, el uso de RLHF o DPO, ni innovaciones como decodificación especulativa propias de este modelo. La model card sí menciona DSpark decoding acceleration, pero lo atribuye a MiniCPM-OCR 1.0, no a Jev. La aportación técnica diferencial de esta release es el empaquetado FlagOS: un stack multi-chip (Torch-FL, FlagTree, FlagGems, FlagCX) que permite ejecutar el modelo sobre Iluvatar CoreX con la cadena `import torch_fl` antes de `import torch` y el dispositivo `flagos:0`, manteniendo una consistencia de resultados casi exacta respecto a la build nativa de NVIDIA.

## Capacidades

- Evaluación de fiabilidad de resultados OCR: recibe imagen de documento y salida de un motor OCR y emite una probabilidad de corrección por entrada.
- Detección de contenido que requiere revisión humana, actuando como filtro previo a la validación manual.
- Integración con distintos motores OCR como capa de control de calidad independiente del transcriptor.
- Procesamiento multimodal de imágenes de documento mediante el procesador asociado.
- Clasificación de secuencias con salida de probabilidad agregada (`avg_prob_1`), apta para umbrales configurables.
- Soporte de chino e inglés.
- Despliegue en aceleradores Iluvatar CoreX mediante el stack FlagOS, y en CPU ARM para escenarios de borde.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito.

## Casos de uso

- Control de calidad en pipelines de digitalización masiva: Jev se coloca después del motor OCR y puntúa cada bloque de página; los bloques por debajo de un umbral se enrutan a revisión humana, reduciendo el coste de verificación manual.
- Auditoría de extracción de datos en banca y seguros: tras extraer campos de pólizas o extractos, el modelo evalúa la fiabilidad del parsing y marca los documentos con riesgo de error antes de alimentar sistemas transaccionales.
- Procesamiento en el borde de documentos escaneados: con 1,20 segundos por bloque de página en CPU ARM M5, puede ejecutarse en terminales y dispositivos sin GPU dedicada para validar capturas en el momento.
- Validación de digitalización de expedientes administrativos: permite priorizar qué páginas de un lote requieren revisión, optimizando el trabajo de operadores humanos en archivos históricos.
- Sustitución o complemento de verificadores basados en modelos gigantes: con un AUROC de 0,936 frente al 0,938 de Qwen3.5-397B-A17B, ofrece una calidad comparable con 2B de parámetros, reduciendo coste de inferencia y huella de memoria.
- Despliegue en infraestructura no-NVIDIA: la build FlagOS para Iluvatar CoreX (BI-V150) permite integrar el control de calidad OCR en clústeres con aceleradores nacionales manteniendo el 98,7 % del rendimiento nativo.
- Monitorización continua de la calidad de un servicio OCR en producción: puntuar muestras periódicas y detectar degradaciones del motor de transcripción antes de que afecten a los usuarios.

## Benchmarks y rendimiento

| Métrica | MiniCPM-OCR-Jev-Nvidia-Origin | MiniCPM-OCR-Jev-Iluvatar-FlagOS |
|---|---|---|
| ocr_rm_mini (12 entradas), avg_prob_1 | 0,4817 | 0,482352 |
| omnidocbench-render-compare (60 entradas), avg_prob_1 | 0,2397 | 0,241341 |
| AUROC en JevOCRBench | 0,936 (dato de la model card) | no disponible por separado |

Referencia comparativa citada en la model card: Qwen3.5-397B-A17B obtiene un AUROC de 0,938 en JevOCRBench, frente al 0,936 de Jev. En rendimiento de sistema, la build FlagOS alcanza el 98,7 % del throughput nativo de NVIDIA en Iluvatar, y 1,20 segundos por bloque de página en CPU ARM M5.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,4 GB solo para pesos, más memoria para activaciones y procesamiento de imagen; se recomienda un mínimo de 8 GB de VRAM para margen operativo.
- GPU recomendadas: Iluvatar CoreX BI-V150 (plataforma validada por FlagOS), NVIDIA con al menos 8-16 GB (RTX 4090, A100, H100) mediante la build nativa, y aceleradores de las 12 plataformas cubiertas por FlagOS (T-Head, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Xiwang, CIX).
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en BF16; en cuantizaciones de menor precisión el requisito sería aún menor, aunque no se publican variantes GGUF o INT8 en este repositorio.
- Opciones de despliegue: contenedor Docker `harbor.baai.ac.cn/flagrelease-public/torch-fl-iluvatar:jev-ocr-rm-2b-20261023` con Torch-FL y el dispositivo `flagos:0`; descarga de pesos vía ModelScope; carga con `transformers` 5.17.0 y `Qwen3_5ForSequenceClassification`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia: 1,20 segundos por bloque de página en CPU ARM M5; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Función | AUROC JevOCRBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR Jev (esta ficha) | 2B | Verificación de calidad OCR | 0,936 | Apache 2.0 | HuggingFace y ModelScope |
| MiniCPM-OCR 1.0 | 1,3B | Parsing OCR directo | no disponible | no disponible en la información | Open source según model card |
| Qwen3.5-397B-A17B | 397B totales (17B activos, MoE) | Modelo generalista multimodal | 0,938 | no disponible | no disponible |

La comparación relevante es la de Jev frente a Qwen3.5-397B-A17B: una diferencia de 0,002 en AUROC con un modelo 180 veces menor en parámetros totales. Frente a MiniCPM-OCR 1.0, la comparación no es directa porque cumplen funciones distintas (verificación frente a transcripción); la model card sugiere combinarlos en un pipeline donde 1.0 transcribe y Jev valida.

## Limitaciones y advertencias

- El modelo es un verificador, no un transcriptor: no genera texto OCR por sí mismo y requiere un motor OCR previo que produzca la salida a evaluar.
- Idiomas limitados a chino e inglés según los metadatos; no se garantiza comportamiento en otras lenguas.
- No se documenta la longitud de contexto soportada, lo que impide planificar con precisión documentos de muchas páginas o bloques largos.
- Riesgo de alucinación en la puntuación: al ser un clasificador, puede asignar alta fiabilidad a transcripciones incorrectas en dominios no vistos durante el entrenamiento.
- No se publican datos sobre sesgos del modelo ni sobre la composición del dataset de entrenamiento, lo que dificulta evaluar su comportamiento en dominios especializados (documentos legales, médicos o manuscritos históricos).
- La build de este repositorio está acoplada al stack FlagOS e Iluvatar CoreX: requiere `import torch_fl` antes de `import torch` y el dispositivo `flagos:0`, lo que limita su portabilidad a otros entornos sin adaptación.
- Licencia Apache 2.0, que permite uso comercial, pero al ser una release de la comunidad FlagOS conviene verificar la licencia del modelo original de ModelBest/OpenBMB antes de producción.
- Repositorio con solo 8 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy reducido y escasa validación independiente.
- No se ofrecen variantes cuantizadas (GGUF, INT8) en este repositorio, lo que complica el despliegue en hardware de muy baja memoria.

## Enlaces

- HuggingFace: https://huggingface.co/FlagRelease/MiniCPM-OCR-Jev-BF16-iluvatar-FlagOS
- Contenedor Docker: `harbor.baai.ac.cn/flagrelease-public/torch-fl-iluvatar:jev-ocr-rm-2b-20261023`
- Descarga de pesos vía ModelScope: `modelscope download --model FlagRelease/MiniCPM-OCR-Jev-BF16-iluvatar-FlagOS --local_dir /data2/models/Jev-OCR-RM-2B`
- Repositorios de los componentes FlagOS citados en la model card: FlagTree, FlagGems, FlagCX (sin URL directa en la información disponible)
- Paper, blog o demo oficial: no disponible en la información proporcionada
