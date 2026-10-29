# axteam/GLM-OCR-FP8-dynamic

## Resumen

GLM-OCR-FP8-dynamic es una cuantización a 8 bits del modelo multimodal de OCR `zai-org/GLM-OCR`, publicada por el usuario comunitario axteam. El modelo original lo desarrolla Z.ai (zai-org) y está diseñado para comprensión de documentos complejos: tablas, fórmulas matemáticas, sellos, páginas con abundante código y maquetación irregular. Esta versión no altera la arquitectura ni el procesador, solo comprime el backbone de texto para reducir el espacio en disco y el coste de servicio en vLLM.

El modelo es denso (no MoE), con unos 1.325 millones de parámetros totales según el recuento de safetensors, que incluyen el backbone de texto GLM, el encoder de visión y una cabeza de predicción multi-token (MTP). La cuantización emplea el esquema W8A8 de `compressed-tensors`: pesos FP8 E4M3 con escala por canal y activaciones FP8 dinámicas por token, sin calibración ni reentrenamiento. El encoder visual, la capa MTP, los embeddings, la LM head y todas las RMSNorm se mantienen en BF16.

Su relevancia práctica es doble: por un lado demuestra que un OCR de ~1B puede servirse en FP8 con una degradación de perplejidad de solo el 0,9 % respecto al original; por otro, al estar publicado como derivado cuantizado con licencia MIT, permite desplegar un pipeline de parsing documental en una GPU de consumo sin renunciar a la ruta de visión intacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso encoder-decoder (GLM-V): backbone de texto GLM + encoder de visión + cabeza de predicción multi-token (MTP) |
| Parametros totales | 1.325.258.240 (~1,33 mil millones, según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 dinámico (W8A8): pesos FP8 E4M3 con escala por canal, activaciones FP8 dinámicas por token; formato `compressed-tensors` `FP8_DYNAMIC`. Capas visuales, MTP, embeddings, LM head y RMSNorm en BF16. Original disponible en BF16 |
| Idiomas soportados | No disponible en la información proporcionada (el conjunto de evaluación interno es inglés/coreano) |
| Licencia | MIT |
| Formato de pesos | `safetensors` con metadatos `compressed-tensors`; pensado para vLLM. Compatibilidad con GGUF: no disponible |
| Tamano en disco | ~2,0 GB (repo de 2,2 GB) |
| Pipeline | `image-text-to-text` |
| Calibración | Ninguna (data-free) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño GLM-V del modelo base: un encoder de visión que procesa la imagen de la página y un backbone de texto tipo GLM que genera la transcripción o la estructura solicitada. Sobre ese esquema, el original incorpora una pérdida de predicción multi-token (MTP) que acelera el entrenamiento y mejora la decodificación, además de un entrenamiento con refuerzo estable sobre tareas completas (full-task RL) para mejorar la precisión de reconocimiento y la generalización a layouts no vistos. El modelo base se documenta con un tamaño de referencia de 0,9B en la documentación de Z.ai, mientras que el recuento real de safetensors de esta versión cuantizada asciende a 1,33B, diferencia atribuible a los componentes de visión y a la cabeza MTP incluidos en el checkpoint.

Esta variante concreta es una cuantización post-entrenamiento, sin reentrenamiento ni datos de calibración. Solo se cuantizan las proyecciones de atención y MLP del backbone de lenguaje; el resto de parámetros permanece en BF16, de modo que el camino OCR/visión queda funcionalmente intacto. El tokenizador, la `chat_template` y el procesador son idénticos a los del modelo original. El autor reporta una fidelidad al BF16 de 1,3726 de perplejidad frente a 1,3599 del original (+0,9 %) y un 96,5 % de acuerdo top-1 en el siguiente token sobre un conjunto interno mixto inglés/coreano de 100 prompts.

## Capacidades

- Reconocimiento óptico de caracteres sobre documentos complejos: texto denso, tablas, fórmulas matemáticas, sellos y páginas con carga fuerte de código.
- Parsing estructurado de documentos: extracción de tablas y expresiones conservando su estructura, según la propuesta del modelo base y su SDK de análisis de layout.
- Comprensión imagen-texto a texto: entrada de imagen de página más instrucción en lenguaje natural, salida de texto o Markdown.
- Modelo conversacional (`conversational`) con plantilla de chat, apto para peticiones multi-turno sobre una misma imagen.
- Predicción multi-token (MTP) heredada del modelo base, orientada a acelerar la decodificación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado para esta variante.
- Capacidades multilingües: no disponibles de forma oficial; el autor solo reporta evaluación interna en inglés y coreano.
- Modo thinking, audio u otras modalidades: no disponibles.

## Casos de uso

- Digitalización masiva de archivos administrativos: servir el modelo en vLLM con una única GPU de consumo para transcribir lotes de PDF escaneados a texto plano o Markdown, aprovechando que el encoder de visión se mantiene en BF16 y no pierde fidelidad por la cuantización.
- Extracción de tablas financieras: enviar la imagen de la página con una instrucción de formato y obtener la tabla en Markdown; el modelo base está optimizado para tablas y maquetación compleja, que es justo donde fallan los OCR clásicos.
- Conversión de documentos científicos a LaTeX/Markdown: transcripción de fórmulas matemáticas junto al texto que las rodea, útil para alimentar bases de conocimiento técnico o repositorios de documentación.
- Ingesta para pipelines RAG: el modelo actúa como etapa de parsing previa al chunking y la indexación vectorial; al ocupar ~2 GB en FP8, puede convivir en la misma GPU que un pequeño modelo de embeddings.
- Procesamiento de facturas y albaranes: lectura de campos estructurados y sellos en escaneos de baja calidad, con despliegue on-premise para no enviar documentos a APIs externas.
- Digitalización de documentación con código: páginas de manuales técnicos o listados con sintaxis de programación, donde el reconocimiento de tipografía monoespaciada y sangría es crítico.
- Servicio de OCR como endpoint interno compatible con la API de OpenAI (`endpoints_compatible` en los tags), integrable en herramientas ya existentes sin cambiar el cliente.
- Prototipado e investigación: al ser un derivado MIT de un modelo pequeño, sirve como referencia para estudiar el impacto de FP8 dinámico en tareas de percepción documental.

## Benchmarks y rendimiento

El autor solo publica métricas de fidelidad respecto al BF16 original, medidas sobre un conjunto interno mixto inglés/coreano de 100 prompts con puntuación del siguiente token:

| Metrica | Este modelo (FP8) | Original BF16 |
|---|---|---|
| Perplejidad (menor es mejor) | 1,3726 | 1,3599 (+0,9 %) |
| Acuerdo top-1 en el siguiente token | 96,5 % | 99,4 % |

Datos del modelo base citados en la documentación de Z.ai (no verificados de forma independiente en esta ficha): 94,62 puntos en OmniDocBench V1.5, con resultados descritos como estado del arte en varias capacidades de parsing documental.

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks OCR específicos para esta variante cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 ocupan ~1,4 GB (frente a ~2,7 GB en BF16); con overhead de runtime, KV cache y activaciones del encoder visual, el consumo realista se sitúa en el rango de 2-4 GB para imágenes de una página.
- Cabe en GPU de consumo: sí, con holgura en una RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 o RTX 4090. También en tarjetas de 8 GB para documentos de resolución moderada.
- GPU de datacenter: A100, H100, L40S o A10G para servicio concurrente; el cuello de botella será el preprocesado de imagen y el throughput de peticiones, no la memoria.
- Opciones de despliegue: vLLM es la vía recomendada y la única documentada por el autor (`vllm serve axteam/GLM-OCR-FP8-dynamic --trust-remote-code`); también es cargable con Transformers. Compatibilidad con llama.cpp, Ollama, TGI o SGLang: no disponible.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, el esquema W8A8 dinámico reduce el ancho de banda de pesos a la mitad respecto a BF16, lo que suele traducirse en mejor throughput en GPUs con soporte nativo de FP8 (Ada Lovelace y Hopper).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/GLM-OCR-FP8-dynamic | ~1,33B (total) | No disponible | FP8 dinámico W8A8 | MIT | Hugging Face, ~2,0 GB, sin descargas registradas |
| zai-org/GLM-OCR (base) | ~1,33B (total; 0,9B citado por Z.ai) | No disponible | BF16 | MIT | Hugging Face, oficial |
| Otros OCR de ~1B (PaddleOCR-VL, dots.ocr, olmOCR) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No evaluados en esta ficha |

La comparación directa relevante es contra el original en BF16: misma arquitectura, mismo tokenizador y mismo procesador, con la única diferencia del esquema de cuantización. Frente a alternativas de la misma categoría, no se dispone de datos verificables en la información proporcionada, por lo que no se establece comparación cuantitativa.

## Limitaciones y advertencias

- Es un artefacto comunitario: lo publica axteam, no Z.ai. No hay garantía de mantenimiento, soporte ni de que se actualice con nuevas revisiones del modelo base.
- Adopción prácticamente nula en el momento de la ficha (0 descargas, 1 like), lo que implica ausencia de validación externa independiente.
- La evaluación de fidelidad se limita a 100 prompts interno en inglés y coreano; no cubre idiomas como el español ni dominios documentales específicos. El rendimiento real en castellano no está medido.
- Riesgo de alucinación inherente a los modelos generativos de OCR: pueden omitir líneas, inventar celdas de tabla o "completar" fórmulas plausibles pero incorrectas. En producción conviene validación por muestreo y métricas de confianza.
- La cuantización FP8 puede degradar tareas sensibles a la precisión numérica, como la transcripción de fórmulas o el reconocimiento de caracteres poco frecuentes; la caída de acuerdo top-1 (96,5 % frente a 99,4 %) es un indicador de ello.
- No se documentan sesgos conocidos, longitud de contexto ni cobertura lingüística oficial. Cualquier requisito de contexto largo debe validarse empíricamente.
- Requiere `--trust-remote-code` en vLLM y depende de `compressed-tensors`; versiones antiguas del runtime pueden no cargar el checkpoint.
- Licencia MIT: permite uso comercial y modificación, pero el autor de la cuantización no ofrece garantías y los pesos originales pertenecen a los autores de zai-org/GLM-OCR. Conviene conservar la atribución.
- No hay información sobre compatibilidad con GGUF ni con runtimes de CPU, lo que limita el despliegue fuera de GPU.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/axteam/GLM-OCR-FP8-dynamic
- Modelo base en Hugging Face: https://huggingface.co/zai-org/GLM-OCR
- Repositorio oficial en GitHub: https://github.com/zai-org/GLM-OCR
- Espejo del repositorio: https://github.com/xiaozhejjj/glm-ocr
- Documentación de Z.ai para GLM-OCR: https://docs.z.ai/guides/vlm/glm-ocr
- Ficha de terceros (Cyberax): https://cyberax.com/ai-playbook/models/glm-ocr
