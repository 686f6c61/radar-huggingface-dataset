# SandLogicTechnologies/MiniCPM-OCR-Jev-GGUF

## Resumen

MiniCPM-OCR Jev es un modelo multimodal compacto de evaluación de calidad OCR desarrollado por OpenBMB, que no genera texto OCR, sino que puntúa la corrección de resultados OCR existentes. Dado un recorte de documento (región) y un candidato de texto OCR, el modelo produce una puntuación entre 0 y 1 que indica la probabilidad de que el candidato represente fielmente el contenido original. Este repositorio de SandLogic Technologies publica variantes cuantizadas en formato GGUF del modelo original para despliegue local eficiente.

Su relevancia radica en que resuelve un problema real en pipelines de digitalización documental: decidir automáticamente qué resultados OCR son fiables, cuáles requieren revisión humana y cuál es el mejor candidato entre varios motores OCR. Con aproximadamente 2.000 millones de parámetros y cuantizaciones de hasta 3 bits (alrededor de 1 GB), es práctico para ejecutarse en hardware modesto dentro de flujos de verificación de documentos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de decisión multimodal para corrección OCR (base Qwen3.5-2B con componentes de visión y lenguaje, cabeza de clasificación binaria) |
| Parámetros totales | 1.881.829.184 (aprox. 2B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ3_M, IQ4_NL, IQ4_XS, Q6_K (GGUF); original en 16 bits (3,52 GB) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, conservando el encoder de visión y el backbone de lenguaje de la arquitectura base. La innovación principal es la sustitución de la cabeza de salida del modelo de lenguaje (lm_head) por una cabeza de clasificación binaria que aprende a determinar si un candidato OCR es correcto. La entrada del modelo combina tres elementos: la imagen original de la región del documento, el texto candidato OCR y una imagen renderizada de ese texto candidato, lo que permite una comparación visual directa entre fuente y candidato.

Los detalles concretos del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. El modelo está diseñado para evaluar regiones de texto, fórmulas y tablas, y admite fine-tuning para escenarios de evaluación OCR específicos de cada tipo de documento.

## Capacidades

- Evaluación de corrección de resultados OCR: produce una puntuación entre 0 y 1 que estima si el candidato es consistente con la imagen original de la región.
- Evaluación de tres tipos de región: texto, fórmulas y tablas.
- Verificación de candidatos: permite filtrar automáticamente resultados OCR según umbrales definidos por la aplicación.
- Comparación de múltiples motores OCR: puede puntuar candidatos generados por distintos sistemas y seleccionar el de mayor puntuación.
- Identificación de regiones que requieren revisión humana.
- Entrada multimodal: imagen de la región, texto candidato y renderizado del candidato.
- Despliegue local eficiente mediante variantes GGUF cuantizadas.

No se ha documentado soporte de tool calling, generación de texto libre, capacidades de agente ni procesamiento de audio en la información disponible.

## Casos de uso

- Filtrado automático de resultados OCR en pipelines de digitalización: tras el OCR masivo de un corpus documental, el modelo puntúa cada región y acepta automáticamente las que superan un umbral de confianza, reduciendo el coste de revisión manual.
- Enrutamiento a revisión humana: las regiones con puntuaciones bajas se marcan para revisión por personas, priorizando el trabajo de los revisores donde realmente aporta valor.
- Selección del mejor motor OCR: varios sistemas OCR procesan la misma región de forma independiente y el modelo compara las puntuaciones para elegir el candidato más fiable por región.
- Verificación de tablas y fórmulas en documentos técnicos: la capacidad de evaluar regiones de fórmulas y tablas lo hace útil para digitalizar artículos científicos, informes financieros o documentación de ingeniería.
- Control de calidad en servicios de OCR en la nube: integración como capa de verificación posterior en servicios que procesan documentos de terceros, con despliegue local gracias a las cuantizaciones GGUF.
- Entornos con recursos limitados: la variante IQ3_M (aprox. 1 GB) permite ejecutar la verificación en máquinas sin GPU dedicada o con memoria muy restringida.
- Fine-tuning por dominio documental: la arquitectura permite adaptar el modelo a tipos de documento específicos (facturas, historiales médicos, documentos legales) para mejorar la precisión de la evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia (tamaños de archivo GGUF respecto al original de 3,52 GB en 16 bits):
  - IQ3_M: aprox. 1,01 GB (reducción del 71,13 %)
  - IQ4_XS: aprox. 1,12 GB (reducción del 68,18 %)
  - IQ4_NL: aprox. 1,15 GB (reducción del 67,33 %)
  - Q6_K: aprox. 1,45 GB (reducción del 58,81 %)
- GPU recomendadas: no disponible. Dado el tamaño reducido (1-1,5 GB), cualquier GPU moderna con varios GB de VRAM (por ejemplo una RTX 3060 o superior) debería ser suficiente; también es viable la ejecución en CPU.
- Consumer GPUs: sí, cabe con holgura en GPUs de gama media y alta; incluso en portátiles con GPU integrada en las variantes 3 y 4 bits.
- Opciones de despliegue: el formato GGUF indica compatibilidad con llama.cpp; compatibilidad con Ollama u otros runtimes no está confirmada en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-OCR Jev (este) | Evaluación de corrección OCR | ~2B | GGUF (IQ3_M a Q6_K) | Apache 2.0 | Cabeza de clasificación binaria; puntúa candidatos OCR |
| MiniCPM-V / MiniCPM-o (OpenBMB) | VLM generalista (OCR, descripción, diálogo) | 2B-8B | safetensors, GGUF de terceros | Apache 2.0 (según versión) | Genera texto, no puntúa candidatos |
| Qwen2.5-VL-3B (Alibaba) | VLM generalista con OCR | ~3B | safetensors, GGUF de terceros | Apache 2.0 (Qwen) | OCR generativo con localización; sin cabeza de decisión |

La comparación es orientativa: MiniCPM-OCR Jev ocupa una categoría distinta (modelo de decisión/verificación) frente a los VLM generalistas, que generan texto OCR en lugar de evaluar candidatos existentes. No hay alternativas públicas específicas de "verificación de corrección OCR" con datos comparables disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera ni corrige texto OCR: solo puntúa candidatos, por lo que debe integrarse junto a uno o varios motores OCR.
- El alcance está limitado a regiones de texto, fórmulas y tablas; su comportamiento en otros tipos de contenido (diagramas, sellos, manuscritos) no está documentado.
- Las cuantizaciones agresivas (IQ3_M) pueden afectar más a la evaluación fina de texto visualmente complejo, fórmulas y tablas, según la propia model card.
- Idiomas limitados a inglés y chino; el rendimiento sobre documentos en castellano u otros idiomas no está documentado.
- La longitud de contexto y los umbrales de decisión recomendados no están publicados; habrá que calibrar el umbral de aceptación por aplicación.
- Riesgo de alucinación: al ser un modelo de clasificación, el riesgo es distinto al de un LLM generativo, pero pueden producirse falsos positivos y falsos negativos en la puntuación; no hay métricas publicadas de precisión.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- Datos de entrenamiento no documentados: conviene validar el modelo sobre el dominio documental concreto antes de producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SandLogicTechnologies/MiniCPM-OCR-Jev-GGUF
- Modelo original (base): https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Organización OpenBMB: https://huggingface.co/openbmb
- Organización SandLogic Technologies: https://huggingface.co/SandLogicTechnologies
