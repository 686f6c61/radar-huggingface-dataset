# infosave/d1-2B-cmf

## Resumen

d1-2B-cmf es un paquete cuantizado del modelo LiquidAI/d1-2B, un modelo de decisión de 2B parámetros (denominado "System One") construido sobre la arquitectura LFM3-VL-2B de Liquid AI. A diferencia de los modelos generativos convencionales, d1-2B responde preguntas con nombre sobre un estado dado (texto, JSON o imágenes) en un único forward pass, devolviendo respuestas tipadas con probabilidades calibradas y sin generar tokens. El paquete lo distribuye el usuario infosave en formato CMF, un contenedor propietario que se ejecuta con `cortiq`, un motor de inferencia escrito en Rust sin Python ni frameworks de ML.

La relevancia de este modelo radica en su enfoque de "system-one": tareas de clasificación, extracción y decisión que normalmente requerirían un LLM generativo con prompting elaborado se resuelven aquí como una única pasada de inferencia con salidas estructuradas y probabilidades calibradas. Esto reduce latencia y coste computacional en pipelines de decisión, y permite ejecución en hardware de consumo (Vulkan, Metal, CPU) además de GPUs NVIDIA vía CUDA.

El paquete incluye dos cuantizaciones (8 bits y 4 bits) con el codificador de visión en 16 bits, y una calibración embebida que se aplica a cada respuesta. El modelo base soporta 17 idiomas y entrada image-text-to-text, y se distribuye bajo licencia LFM 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VL-2B (modelo de decisión "System One" sobre base LiquidAI/d1-2B; transformer con codificador de visión) |
| Parametros totales | 2B (modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_2f (pesos 8 bits, visión 16 bits), q4tp (pesos 4 bits, visión 16 bits) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (17 idiomas) |
| Licencia | LFM 1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | CMF (contenedor propietario para el motor cortiq) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/d1-2B es un modelo de decisión de 2B parámetros construido sobre LFM3-VL-2B, que combina un transformer de lenguaje con un codificador de visión para entrada image-text-to-text. La innovación principal es el paradigma "System One": en lugar de generar texto token a token, el modelo recibe un estado (texto, JSON o imagen) y un conjunto de preguntas con nombre y tipo, y produce respuestas tipadas (noul, choice, score, text, number, date, box, boxes) con probabilidades calibradas en un único forward pass. El forward pass completo —todas las capas sobre el estado empaquetado y las preguntas, más la cabeza de vocabulario sobre los slots de respuesta— se ejecuta en una sola submission a la GPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El paquete CMF incluye un archivo `calibration.json` embebido que se aplica a cada respuesta, lo que sugiere un proceso de calibración de probabilidades post-entrenamiento. La cuantización q8_2f mantiene las respuestas idénticas al checkpoint bf16 original en 19 de 19 preguntas de prueba, con una diferencia máxima de probabilidad de 0.014; q4tp también acierta 19 de 19 (con una estimación 2 pasos desviada) y una diferencia máxima de 0.07.

## Capacidades

- Respuesta a preguntas con nombre sobre un estado: preguntas de sí/no (`noul`), elección única o múltiple (`choice`), puntuación ordinal de 2 a 10 niveles (`score`), extracción de valores (`text`, `number`, `date`) y localización de objetos en imágenes (`box`, `boxes`).
- Salidas tipadas con probabilidades calibradas: cada respuesta incluye confianza, probabilidades por opción, intervalos (p10, p90) para estimaciones numéricas y spans para valores extraídos.
- Procesamiento de imágenes: codificador de visión integrado para contar objetos, localizar cajas delimitadoras y responder preguntas sobre imágenes.
- Procesamiento de estados en texto, JSON y archivos: `--state` acepta texto o `@file`, y los archivos `.json` se leen como JSON.
- Multilingüe: 17 idiomas soportados (en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl).
- Hasta 16 preguntas leídas juntas tras un mismo estado en una sola pasada; más preguntas se ejecutan en pasadas adicionales sobre el mismo estado.
- Despliegue como servidor HTTP con endpoint `/v1/system_one` y como CLI (`cortiq system-one`).
- No genera tokens: `output_tokens` es 0 en las respuestas, lo que elimina el riesgo de alucinación generativa en el sentido tradicional.
- No se menciona soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Clasificación y enrutado de tickets de soporte: el modelo recibe el texto del ticket como estado y responde preguntas como "¿pide un reembolso?" (`noul`) y "¿qué equipo debe gestionarlo?" (`choice` con criterios billing/shipping/technical), devolviendo probabilidades calibradas para umbrales de decisión. Ejemplo documentado en la model card con confianza 0.9972 para reembolso y 0.7028 para billing.
- Extracción de datos de facturas: con un estado JSON o texto de factura, se extrae el total debido (`number`), fechas (`date`) y otros campos, con `found` y `span` para validar la extracción antes de insertarla en un ERP.
- Procesamiento de documentos JSON estructurados: lectura de valores de registros JSON con preguntas tipadas, útil para validación y normalización de datos en pipelines ETL.
- Análisis de imágenes con conteo y localización: contar objetos (`number` con rango y paso) y localizar elementos (`box` con coordenadas normalizadas top/bottom/left/right), por ejemplo contar gatos en una foto o localizar un mando a distancia.
- Moderación y triaje de contenido: preguntas de sí/no y de elección sobre textos para clasificar riesgo, categoría o urgencia con probabilidades calibradas que permiten fijar umbrales.
- Enrutado de decisiones en agentes: como componente "system-one" de baja latencia (39–41 ms en RTX A5000 con CUDA para dos preguntas sobre un estado de 88 tokens) para decisiones rápidas dentro de pipelines de agentes más amplios.
- Despliegue en hardware de consumo: ejecución en Apple M4 vía Metal (85 ms para una pregunta de 43 tokens) o en CPU, adecuado para aplicaciones de escritorio o edge que necesitan clasificación local sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona datos de latencia y fidelidad de cuantización:

| Prueba | Hardware / archivo | Resultado |
|---|---|---|
| 1 pregunta (43 tokens) | NVIDIA A40 (Vulkan), q4tp | 45 ms |
| 3 preguntas (123 tokens) | NVIDIA A40 (Vulkan), q4tp | 64 ms |
| 5 preguntas sobre estado ~200 tokens | NVIDIA A40 (Vulkan), q4tp | 100–115 ms |
| 1 pregunta (43 tokens) | NVIDIA A40 (Vulkan), q8_2f | 56–75 ms |
| 3 preguntas (123 tokens) | NVIDIA A40 (Vulkan), q8_2f | 70 ms |
| 5 preguntas sobre estado ~200 tokens | NVIDIA A40 (Vulkan), q8_2f | 102–128 ms |
| 1 pregunta (43 tokens) | Apple M4 (Metal), q4tp | 85 ms |
| 3 preguntas (123 tokens) | Apple M4 (Metal), q4tp | 160 ms |
| 5 preguntas sobre estado ~200 tokens | Apple M4 (Metal), q4tp | 255–310 ms |
| 2 preguntas sobre estado 88 tokens | RTX A5000 24 GB (CUDA), q4tp | 39–41 ms |
| 2 preguntas sobre estado 88 tokens | RTX A5000 (Vulkan), q4tp | 63–120 ms |
| 2 preguntas sobre estado 88 tokens | CPU, q4tp | 842–858 ms |
| Codificador de visión (640×480) | Apple M4 | 0.5 s |

Fidelidad de cuantización: q8_2f coincide con el checkpoint bf16 en float32 en 19 de 19 respuestas (diferencia máxima de probabilidad 0.014); q4tp en 19 de 19 (una estimación 2 pasos desviada, diferencia máxima 0.07). Una conversión f16 coincide con Transformers float32 a ~1e-6 en cada probabilidad.

## Requisitos de hardware

- VRAM estimada: q4tp ocupa 1.31 GB en disco (1,306,104,354 bytes); q8_2f ocupa 2.14 GB (2,135,818,786 bytes). La VRAM necesaria para inferencia será del orden del tamaño del archivo más overhead del motor, aunque no se especifica un valor exacto.
- GPUs recomendadas: NVIDIA A40 (Vulkan), RTX A5000 24 GB (CUDA y Vulkan), Apple M4 (Metal). Compatible con GPUs NVIDIA, AMD e Intel vía Vulkan/DX12, NVIDIA también vía CUDA, y Apple silicon vía Metal.
- Cabe en GPU de consumo: sí, dado el tamaño de 1.31–2.14 GB; la model card no enumera modelos concretos de consumo, pero el soporte de Vulkan/DX12 y Metal lo hace viable en GPUs de consumo compatibles.
- Opciones de despliegue: motor `cortiq` (Rust, sin Python ni framework de ML), en modo CLI (`cortiq system-one`) o servidor (`cortiq serve` con endpoint `/v1/system_one`). Requiere cortiq 0.8.50 o posterior; CUDA es una feature de compilación (`cargo install cortiq-cli --features cuda`). No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: una petición a la vez; 39–41 ms en RTX A5000 (CUDA) para dos preguntas sobre 88 tokens; 45 ms en A40 (Vulkan) para una pregunta de 43 tokens; 842–858 ms en CPU. La primera llamada carga los pesos (1.7 s en RTX A5000).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base LiquidAI/d1-2B podría compararse con otros modelos de decisión o clasificación de tamaño similar, pero no se han facilitado datos de rendimiento ni especificaciones de alternativas.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| d1-2B-cmf (este) | 2B | no disponible | LFM 1.0 | CMF (cortiq) | Modelo de decisión System One, 17 idiomas, visión |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones multi-turno; solo responde preguntas tipadas sobre un estado. No debe usarse para generación de texto, código o razonamiento abierto.
- Riesgo de calibración: las probabilidades están calibradas con el archivo `calibration.json` embebido; su fiabilidad fuera de la distribución de entrenamiento no está documentada. Los valores con `found` inferior a 0.5 se devuelven como `null`, lo que puede ocultar extracciones dudosas.
- Límite de preguntas por pasada: hasta 16 preguntas juntas tras un estado; más preguntas requieren pasadas adicionales, lo que incrementa la latencia.
- Dependencia de un motor propietario: el formato CMF solo se ejecuta con `cortiq`, un motor específico sin soporte de ecosistemas estándar (vLLM, llama.cpp, Transformers). Esto limita la portabilidad y la integración con herramientas habituales.
- Licencia LFM 1.0: es una licencia "other" que puede imponer restricciones al uso comercial; debe revisarse el archivo LICENSE antes de desplegar en producción.
- Idiomas: aunque se listan 17 idiomas, no se documenta el rendimiento por idioma ni la calidad de la calibración en cada uno.
- Sin datos de sesgos: no se ha publicado información sobre sesgos conocidos, composición del dataset de entrenamiento ni evaluaciones de robustez.
- Contexto: no se especifica la longitud máxima de contexto, lo que impide planificar estados de gran tamaño.
- El modelo base es LiquidAI/d1-2B; las limitaciones de ese modelo (no documentadas aquí) se heredan en el paquete cuantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/d1-2B-cmf
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Repositorio CMF: https://github.com/infosave2007/cmf
- Releases de cortiq (binarios precompilados): https://github.com/infosave2007/cmf/releases
- Documentación en ruso: https://huggingface.co/infosave/d1-2B-cmf#документация-на-русском
- Documentación en chino: https://huggingface.co/infosave/d1-2B-cmf#中文说明
