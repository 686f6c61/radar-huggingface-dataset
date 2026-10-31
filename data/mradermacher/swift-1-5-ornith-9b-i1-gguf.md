# mradermacher/Swift-1.5-Ornith-9B-i1-GGUF

## Resumen

Swift-1.5-Ornith-9B es un modelo de lenguaje de 9 mil millones de parámetros desarrollado por ukisai, basado en la arquitectura Qwen3.5 y orientado a razonamiento con uso eficiente de tokens (token-efficient thinking). Este repositorio no es el modelo original, sino una colección de cuantizaciones GGUF con imatrix (matriz de importancia) creadas por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face, cuyo objetivo es permitir ejecutar el modelo en hardware de consumo con llama.cpp, Ollama u otros runtimes compatibles con GGUF.

El modelo base se ha sometido a un post-entrenamiento con el dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft, centrado en conversaciones multi-turno y capacidades de agente. Los tags del repositorio indican que se trata de un modelo experimental enfocado en razonamiento eficiente, lo que lo hace interesante para desarrolladores que buscan modelos pequeños con capacidades de thinking mode sin el coste de los grandes modelos de razonamiento. La licencia Apache 2.0 permite su uso comercial sin restricciones relevantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5 (transformer), detalles exactos no disponibles |
| Parámetros totales | 9.197.093.888 (aprox. 9,2B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de quants estáticas en el repositorio hermano) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

El modelo base, ukisai/Swift-1.5-Ornith-9B, pertenece a la familia de arquitecturas etiquetada como qwen3_5, lo que sugiere un transformer denso derivado de la línea Qwen. No se ha publicado información detallada sobre el número de capas, cabezas de atención, dimensiones ocultas ni el preentrenamiento del modelo original (tokens utilizados, composición del corpus, etc.).

Respecto al post-entrenamiento, la model card indica que se ha empleado el dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft, un conjunto de datos de fine-tuning supervisado (SFT) con conversaciones multi-turno orientadas a escenarios de agente. Los tags "reasoning", "efficient-thinking" y "token-efficient" apuntan a que el modelo ha sido optimizado para producir razonamiento que consume menos tokens de salida, aunque no se han publicado detalles técnicos sobre el método exacto (RLHF, DPO u otras técnicas). El propio cuantizador no modifica el modelo: se limita a generar versiones GGUF con imatrix para inferencia local.

## Capacidades

- Generación de texto conversacional (pipeline etiquetado como conversational).
- Razonamiento con modo de pensamiento eficiente (efficient-thinking / token-efficient), orientado a reducir el gasto de tokens en cadenas de razonamiento.
- Capacidades de agente: el SFT se ha realizado con un dataset de conversaciones multi-turno de agente, lo que sugiere soporte para interacciones de varios pasos.
- Capacidades de visión: la model card del cuantizador indica explícitamente que es un modelo de visión y que los archivos mmproj se encuentran en el repositorio de quants estáticas.
- Soporte de tool calling / function calling: no disponible explícitamente, aunque el entrenamiento con datos de agente sugiere posible compatibilidad.
- Idioma principal: inglés; no se declara soporte multilingüe.

## Casos de uso

- Asistentes conversacionales locales: gracias a las cuantizaciones Q4_K_M (5,9 GB) o Q6_K (7,7 GB), el modelo puede ejecutarse en un portátil o PC de consumo con llama.cpp u Ollama, sin depender de la nube.
- Agentes multi-turno ligeros: el entrenamiento con datos de agente multi-turno lo hace adecuado para pipelines de orquestación donde el modelo debe mantener el contexto a lo largo de varios pasos de interacción.
- Razonamiento con presupuesto de tokens ajustado: el enfoque token-efficient lo hace apropiado para aplicaciones donde el coste por respuesta o la latencia de generación son críticos, como chatbots con límites de salida.
- Análisis de imágenes en local: al tratarse de un modelo de visión (mmproj disponible), puede emplearse para descripción de imágenes, OCR ligero o análisis visual integrado en aplicaciones de escritorio.
- Prototipado e investigación de post-training: al ser un modelo experimental con licencia permisiva, es útil como base para experimentar con técnicas de efficient thinking o SFT adicional.
- Integración en dispositivos con VRAM limitada: las cuantizaciones IQ3 (4,5-5,1 GB) permiten ejecutarlo en GPUs de 6-8 GB o incluso parcialmente en CPU.
- Generación de texto en inglés en entornos sin conexión: ideal para despliegues air-gapped o con requisitos de privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos solamente, sin KV cache):
  - i1-Q3_K_M (4,8 GB): cabe en GPUs de 6 GB.
  - i1-Q4_K_M (5,9 GB): recomendada para GPUs de 8 GB, con margen para contexto.
  - i1-Q5_K_M (6,7 GB): GPUs de 8-12 GB.
  - i1-Q6_K (7,7 GB): GPUs de 12 GB o 8 GB con contexto reducido.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para máxima velocidad; también viable en Apple Silicon (M1/M2/M3 con 8-16 GB de memoria unificada) y en CPU moderna con offload parcial.
- Cabe cómodamente en GPUs de consumo: con la cuantización Q4_K_M (5,9 GB) funciona en prácticamente cualquier GPU de 8 GB; incluso las versiones Q3 caben en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, GPT4All, KoboldCpp y cualquier runtime compatible con GGUF. Para el modelo base en safetensors: vLLM, TGI o transformers.
- Latencia y throughput: no disponible; al ser un modelo denso de 9B cuantizado a 4-6 GB, cabe esperar velocidades típicas de modelos de este tamaño en llama.cpp (decenas de tokens por segundo en GPUs de consumo), pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Swift-1.5-Ornith-9B (esta ficha) | 9,2B | GGUF (imatrix) + safetensors | Apache 2.0 | Razonamiento token-efficient, visión, datos de agente; experimental |
| Qwen3 8B | 8B | Safetensors + GGUF comunitario | Apache 2.0 | Familia de arquitectura de referencia; ecosistema maduro, benchmarks publicados |
| Gemma 3 9B / 12B | 9B / 12B | Safetensors + GGUF comunitario | Gemma license | Multilingüe y multimodal nativo, pero licencia con condiciones adicionales |

Nota: la comparativa se basa en la categoría de tamaño (8-12B); no hay datos de rendimiento publicados del modelo analizado que permitan comparar benchmarks numéricos.

## Limitaciones y advertencias

- Modelo experimental: los propios tags del repositorio lo marcan como experimental, por lo que su comportamiento en producción debe validarse cuidadosamente.
- Sesgos conocidos: no disponible; no se ha publicado información sobre evaluación de sesgos.
- Riesgo de alucinación: no evaluado públicamente; como todo modelo de 9B, es esperable un mayor riesgo de alucinación que en modelos de mayor escala, especialmente en tareas de conocimiento factual.
- Limitación de idioma: la model card declara solo inglés; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto: no documentada en la información disponible, lo que dificulta planificar aplicaciones con documentos largos.
- Licencia: Apache 2.0, sin restricciones para uso comercial; no obstante, conviene revisar el archivo LICENSE del modelo base enlazado en la model card.
- Calidad de las cuantizaciones: por debajo de Q4 la degradación puede ser notable; el propio cuantizador recomienda IQ3_XXS sobre Q2_K e IQ4_XS sobre IQ4_NL. Para el mejor equilibrio tamaño/calidad sugiere Q4_K_S.
- Los archivos mmproj (necesarios para las capacidades de visión) no están en este repositorio, sino en el repositorio de quants estáticas hermanas.

## Enlaces

- Repositorio de cuantizaciones imatrix (esta ficha): https://huggingface.co/mradermacher/Swift-1.5-Ornith-9B-i1-GGUF
- Repositorio de cuantizaciones estáticas (con archivos mmproj para visión): https://huggingface.co/mradermacher/Swift-1.5-Ornith-9B-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B/blob/main/LICENSE
- Página de descargas organizada por el cuantizador: https://hf.tst.eu/model#Swift-1.5-Ornith-9B-i1-GGUF
- Dataset de SFT empleado: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía sobre uso de archivos GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
