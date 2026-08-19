# PaddlePaddle/HPD-Parsing

## Resumen

HPD-Parsing es un modelo de parsing de documentos jerárquico y paralelo desarrollado por el equipo de PaddlePaddle (responsable de PaddleOCR). Está diseñado para convertir imágenes de páginas completas en texto estructurado (layout, tablas, párrafos) de forma eficiente, resolviendo el cuello de botella secuencial de los parsers VLM unificados que generan el documento token a token. Su propuesta central es la decodificación paralela jerárquica (HPD): una rama principal coordina la estructura global del layout mientras ramas de contenido locales generan regiones específicas de forma concurrente, complementada con Progressive Multi-Token Prediction (P-MTP) para reducir los pasos de decodificación dentro de cada rama.

Construido sobre el backbone InternVL3.5-1B, el modelo tiene 1.071.912.960 parámetros (1,07B) y soporta hasta 24 tiles de 448×448 píxeles mediante recorte dinámico, lo que preserva detalles de alta resolución en documentos complejos. Según los datos publicados, alcanza un 94,91% en OmniDocBench v1.6 y un throughput pico de 4.752 tokens por segundo, lo que supone 2,62× el parser existente más rápido y 3,06× su propia línea base autoregresiva. Su relevancia actual radica en ofrecer una alternativa ligera y de alto rendimiento para pipelines de digitalización documental en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVL3.5-1B (VLM) con decodificación paralela jerárquica (HPD) y P-MTP |
| Parametros totales | 1.071.912.960 (1,07B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura parte de InternVL3.5-1B, un modelo de lenguaje y visión que procesa imágenes mediante recorte dinámico en tiles de 448×448 (hasta 24 tiles). La innovación principal no está en el backbone sino en el paradigma de decodificación: en lugar de generar toda la página en una única trayectoria autoregresiva, HPD-Parsing emplea una rama principal de layout que coordina la estructura global del documento y lanza ramas de contenido locales que decodifican regiones concretas en paralelo. Dentro de cada rama, P-MTP predice múltiples tokens futuros por iteración, reduciendo el número total de pasos secuenciales. Además, se reutiliza el KV cache de prefijos compartidos para acortar aún más la ruta de decodificación.

El entrenamiento sigue una estrategia de adaptación por etapas que transfiere las capacidades de parsing autoregresivo convencional al nuevo paradigma paralelo. Se apoya en un pipeline automatizado de curaduría de datos basado en dificultad: recolección de datos a gran escala, anotación asistida por modelos, estimación de dificultad y muestreo balanceado. No se menciona el uso de RLHF o DPO en la información disponible.

## Capacidades

- Parsing de documentos completos: convierte imágenes de páginas en texto estructurado con detección de layout y contenido regional.
- Decodificación paralela jerárquica: genera regiones de contenido de forma concurrente, reduciendo la latencia frente a parsers autoregresivos puros.
- P-MTP (Progressive Multi-Token Prediction): predice varios tokens futuros en cada paso, acelerando la generación dentro de cada rama.
- Soporte de imágenes de alta resolución mediante recorte dinámico en tiles de 448×448 (hasta 24 tiles).
- Multilingüe: inglés y chino (según la model card).
- Alto throughput: pico de 4.752 TPS en OmniDocBench v1.6.
- Integración con vLLM mediante una build personalizada que implementa el forking dinámico de requests y adapta P-MTP como decodificación especulativa.

## Casos de uso

- Digitalización de documentos empresariales: convertir facturas, contratos y formularios escaneados en texto estructurado para su almacenamiento y procesamiento posterior. Su alto throughput permite procesar lotes grandes con baja latencia.
- Extracción de contenido académico: parser de papers científicos para extraer párrafos, tablas y figuras de forma estructurada, útil para bases de datos de literatura o motores de búsqueda especializados.
- Automatización de back-office: alimentar flujos de trabajo de gestión documental (validación de solicitudes, extracción de datos de formularios) donde la velocidad de parsing es crítica para el rendimiento del sistema.
- Indexación de documentos para RAG: convertir PDFs e imágenes en texto limpio que luego se indexa en sistemas de generación aumentada por recuperación, mejorando la calidad de las respuestas al preservar la estructura del documento.
- Archivado y preservación digital: digitalización masiva de archivos históricos o administrativos, donde la eficiencia de procesamiento permite completar proyectos de gran volumen en tiempos razonables.
- Asistencia a accesibilidad: generación de descripciones textuales de documentos para personas con discapacidad visual, aprovechando la capacidad de entender layout y contenido simultáneamente.
- Integración en pipelines de OCR avanzado: como reemplazo o complemento de parsers tradicionales en sistemas que requieren tanto reconocimiento de texto como comprensión de estructura, por ejemplo en plataformas de gestión documental.

## Benchmarks y rendimiento

Según la información publicada en la model card, HPD-Parsing obtiene los siguientes resultados:

| Benchmark | Resultado |
|---|---|
| OmniDocBench v1.6 (overall) | 94,91% |
| Throughput pico | 4.752 TPS |
| Aceleración frente al parser existente más rápido | 1,62× |
| Aceleración frente a su propia línea base autoregresiva | 3,06× |

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- El modelo tiene 1,07B parámetros y el repositorio ocupa 2,8 GB (probablemente pesos en fp16/bf16). Con cuantización (no especificada) podría reducirse el footprint.
- VRAM estimada: para inferencia en fp16, los pesos ocupan aproximadamente 2 GB; con overhead de activaciones y KV cache, una GPU con 8-12 GB de VRAM debería ser suficiente para procesar páginas individuales. No se proporciona un valor exacto.
- GPU recomendadas: por el tamaño, modelos como RTX 3060 12GB, RTX 4070, RTX 4090 o GPUs de datacenter como A10, L4 o A100 serían adecuadas. No hay una recomendación oficial en la documentación.
- Opciones de despliegue: requiere una build personalizada de vLLM (basada en vLLM v0.17.1) que implementa el forking dinámico de requests y la adaptación de P-MTP. También hay un demo en HuggingFace Spaces (hugging-apps/hpd-parsing).
- Latencia y throughput: el throughput pico reportado es de 4.752 TPS, medido en OmniDocBench v1.6. No se especifican latencias por documento.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados con otros parsers de documentos en la información proporcionada. La model card menciona que HPD-Parsing es 1,62× más rápido que "el parser existente más rápido", pero no nombra modelos concretos. Tampoco se ofrecen comparaciones de precisión con alternativas específicas más allá del benchmark OmniDocBench v1.6. Por tanto, la comparativa con modelos similares se limita a las afirmaciones cualitativas del autor.

## Limitaciones y advertencias

- Idiomas limitados: la model card declara soporte únicamente para inglés y chino. El parsing de documentos en otros idiomas podría degradar la precisión.
- Dependencia de una build personalizada de vLLM: el despliegue requiere compilar o usar la imagen Docker específica, lo que añade complejidad operativa frente a parsers que funcionan con vLLM estándar.
- Sin datos de cuantización: no se documentan formatos cuantizados (GGUF, AWQ, GPTQ), por lo que no se puede evaluar el rendimiento en hardware de gama baja o en despliegues edge.
- Longitud de contexto no especificada: no se indica el tamaño máximo de la ventana de contexto, un dato relevante para documentos muy extensos.
- Riesgo de alucinación: como todo VLM, puede inventar contenido en regiones ambiguas o de baja calidad de imagen, especialmente en documentos dañados o con artefactos.
- Sesgos potenciales: al entrenarse principalmente con datos en inglés y chino, puede mostrar sesgos hacia formatos documentales de esas regiones (por ejemplo, facturas o formularios específicos).
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero la dependencia de componentes personalizados de vLLM puede implicar obligaciones de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PaddlePaddle/HPD-Parsing
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/hugging-apps/hpd-parsing
- Paper en arXiv: https://arxiv.org/abs/2607.18839
- Repositorio de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Cuenta oficial de PaddlePaddle en X: https://x.com/PaddlePaddle
