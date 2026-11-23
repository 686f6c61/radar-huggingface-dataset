# mradermacher/OutlineLM-Gemma4-E4B-v1-i1-GGUF

## Resumen

OutlineLM-Gemma4-E4B-v1-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo DiTy/OutlineLM-Gemma4-E4B-v1, un ajuste fino de la familia Gemma 4 de Google orientado a tareas de esquematización y generación de outlines. El repositorio no contiene pesos originales, sino versiones optimizadas con la técnica imatrix (importance matrix) para su despliegue en llama.cpp y entornos compatibles con GGUF, lo que permite ejecutar el modelo en hardware de consumo con pérdidas de calidad controladas.

El modelo base cuenta con 7.518.069.290 parámetros (aproximadamente 7,5 mil millones), lo que lo sitúa en la gama media de la familia Gemma 4 con denominación E4B. Está etiquetado como modelo de visión, con capacidad conversacional y soporte para inglés y ruso. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

Este repositorio resulta relevante para desarrolladores que necesitan desplegar un modelo de 7,5B con capacidades multimodales en GPUs de consumo o en CPU, aprovechando las cuantizaciones IQ de alta calidad (desde 4,5 GB hasta 6,3 GB) que mantienen un equilibrio razonable entre tamaño, velocidad y fidelidad respecto al modelo original en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E4B); detalles especificos no disponibles |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ3_S, i1-IQ3_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, imatrix |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base OutlineLM-Gemma4-E4B-v1 es un ajuste fino de la familia Gemma 4 de Google, con 7.518.069.290 parámetros en precisión completa (safetensors). La nomenclatura E4B sugiere una variante específica dentro de la línea Gemma 4, aunque no se dispone de documentación técnica detallada sobre la configuración exacta de capas, dimensiones ocultas o mecanismo de atención en la información proporcionada. El modelo está etiquetado como multimodal (visión), lo que implica la presencia de un codificador visual integrado, aunque los ficheros mmproj necesarios para el procesamiento de imágenes se distribuyen en el repositorio estático complementario, no en este.

Las cuantizaciones de este repositorio se han generado con la técnica imatrix (importance matrix), que pondera la cuantización según la relevancia de cada tensor para el rendimiento final, produciendo cuantizaciones IQ (i1-*) de mayor calidad que las cuantizaciones estáticas equivalentes en tamaño. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF o DPO en el ajuste fino del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en el repositorio.
- Procesamiento de visión: el modelo base está marcado como vision model; los ficheros mmproj se encuentran en el repositorio estático complementario.
- Soporte multilingüe limitado a inglés (en) y ruso (ru).
- Especialización en tareas de outline y esquematización, según la denominación OutlineLM del modelo base.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- No se dispone de información sobre tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) en la documentación proporcionada.

## Casos de uso

- Generación de esquemas y outlines de documentos: el modelo está específicamente ajustado para producir estructuras jerárquicas y esquemas, lo que lo hace adecuado para resumir documentos largos en formato de índice o guion.
- Procesamiento de documentos en ruso e inglés: el soporte bilingüe permite aplicar el modelo a pipelines de extracción de estructura en entornos con documentación en ambos idiomas.
- Despliegue en hardware de consumo: con cuantizaciones desde 4,5 GB (i1-Q2_K) hasta 6,3 GB (i1-Q6_K), el modelo puede ejecutarse en GPUs con 8 GB de VRAM o en CPU con llama.cpp, lo que habilita prototipado local sin infraestructura cloud.
- Asistencia conversacional especializada: la etiqueta `conversational` y el ajuste fino sobre Gemma 4 permiten integrarlo en chatbots de dominio que requieran respuestas estructuradas y esquemáticas.
- Aplicaciones multimodales con imágenes: al ser un modelo de visión, puede procesar imágenes junto con texto (requiere descargar los ficheros mmproj del repositorio estático) para tareas como descripción estructurada de diagramas o extracción de información visual.
- Integración en servicios de inferencia compatibles con endpoints: la etiqueta `endpoints_compatible` facilita su despliegue en plataformas que consumen modelos GGUF mediante API.
- Experimentación e investigación: las múltiples cuantizaciones disponibles (desde Q2 hasta Q6) permiten estudiar el impacto de la compresión en la calidad de salida para tareas de esquematización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-6,5 GB según la cuantización elegida (i1-Q2_K: 4,5 GB; i1-Q4_K_M: 5,4 GB; i1-Q6_K: 6,3 GB), más overhead del runtime y del contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; GPUs profesionales como A100 o H100 no son necesarias para este tamaño, aunque pueden usarse para mayor throughput.
- Cabe en GPUs de consumo: sí, en modelos con 8 GB o más de VRAM usando cuantizaciones Q4 o inferiores; las cuantizaciones Q5/Q6 requieren 8-10 GB para operar con contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio incluye ficheros imatrix para generar cuantizaciones propias.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OutlineLM-Gemma4-E4B-v1 (este) | 7,52B | no disponible | Apache 2.0 | GGUF / safetensors | Ajuste fino para outlines, bilingüe en/ru, visión |
| Gemma 2 9B (referencia de familia) | 9B | 8K | Gemma license | safetensors / GGUF | No es el mismo modelo base; comparación orientativa de tamaño |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 license | safetensors / GGUF | Contexto mayor, sin especialización en outlines |
| Qwen2.5 7B | 7,6B | 128K | Apache 2.0 | safetensors / GGUF | Multilingüe amplio, sin visión nativa en todas las variantes |

No se dispone de datos de rendimiento comparativo para este modelo concreto; la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El repositorio contiene únicamente cuantizaciones GGUF; para obtener los pesos en precisión completa debe acudirse al modelo base DiTy/OutlineLM-Gemma4-E4B-v1.
- Los ficheros mmproj necesarios para el procesamiento de visión no están en este repositorio, sino en el repositorio estático complementario; sin ellos, el modelo funciona solo como texto.
- El soporte de idiomas se limita a inglés y ruso según la model card; el rendimiento en castellano no está documentado y podría ser deficiente.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo base.
- Las cuantizaciones de baja precisión (Q2, Q3) pueden degradar notablemente la calidad en tareas que requieran razonamiento preciso o generación estructurada compleja.
- Aunque la licencia es Apache 2.0, el modelo base deriva de Gemma 4, por lo que conviene verificar que los términos de la licencia original de Gemma se respetan en el uso comercial.
- No hay información sobre la longitud de contexto soportada, lo que impide garantizar el comportamiento en documentos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/OutlineLM-Gemma4-E4B-v1-i1-GGUF
- Modelo base: https://huggingface.co/DiTy/OutlineLM-Gemma4-E4B-v1
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/OutlineLM-Gemma4-E4B-v1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#OutlineLM-Gemma4-E4B-v1-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
