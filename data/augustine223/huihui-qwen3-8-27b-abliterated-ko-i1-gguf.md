# augustine223/Huihui-Qwen3.8-27B-abliterated-KO-i1-GGUF

## Resumen

Esta ficha describe la cuantización GGUF `augustine223/Huihui-Qwen3.8-27B-abliterated-KO-i1-GGUF`, una versión optimizada del modelo base `huihui-ai/Huihui-Qwen3.8-27B-abliterated` (una variante sin censura del Qwen3.8-27B de Alibaba). El autor, augustine223, aplica una calibración de matriz de importancia (imatrix) específica para el idioma coreano, con un corpus compuesto por un 79 % de textos en coreano y un 21 % de inglés y código. El objetivo es compensar la pérdida de calidad que sufren las cuantizaciones genéricas en idiomas distintos del inglés.

El modelo base, Qwen3.8-27B, es un transformer denso multimodal de 27.320 millones de parámetros con una ventana de contexto de 262.000 tokens, desarrollado por el equipo Qwen de Alibaba. Destaca en tareas de codificación, agentes y automatización de oficina. La versión abliterated elimina los mecanismos de rechazo mediante una técnica de ablación parcial (conserva las primeras 15 capas intactas y modifica las más profundas), lo que resulta en un modelo sin filtros de seguridad.

Esta cuantización es la tercera de una serie que incluye `kanana-1.5-8b-instruct-2505-KO-i1-GGUF` y `Qwen3.6-35B-A3B-KO-i1-GGUF`, todas con calibración imatrix para coreano. Su relevancia radica en que ofrece una calidad de cuantización notablemente superior en coreano comparada con las cuantizaciones estáticas estándar, a igualdad de tamaño de archivo, y está disponible bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (128K tokens según el modelo base) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M, IQ3_XXS, IQ2_M |
| Idiomas soportados | Coreano e inglés (calibrado); el modelo base soporta más idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformador denso multimodal que procesa texto e imágenes. El equipo de Alibaba lo entrenó con un enfoque en codificación, razonamiento y tareas de agentes. La variante abliterated de huihui-ai elimina los mecanismos de rechazo mediante abliteration, una técnica que modifica las capas profundas del modelo (manteniendo las primeras 15 intactas) para que no rechace peticiones que considera peligrosas o inapropiadas.

Posteriormente, augustine223 aplicó una cuantización GGUF con calibración imatrix. La imatrix se generó a partir de un corpus documentado de 302 fuentes (79% coreano, 21% inglés y código), con un total de 708 segmentos de aproximadamente 360.000 tokens. El proceso se realizó íntegramente en local con CPU y iGPU (AMD Ryzen AI 9 HX PRO 370, Radeon 890M) usando llama.cpp build 10449. La cuantización incluye también un tensor MTP (multi-token prediction) fijado en q4_K para todas las variantes, ya que no se recopiló imatrix para esa parte.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte de modo de pensamiento (thinking mode) que permite respuestas razonadas.
- Multimodal: acepta imágenes como entrada y puede describirlas, analizarlas o extraer información de ellas.
- Codificación de software: el modelo base destaca en generación de código, depuración y explicación de fragmentos.
- Tool calling y function calling: puede integrarse con herramientas externas para construir agentes y automatizaciones.
- Capacidades de agente: soporta flujos de trabajo multi-paso y planificación de tareas complejas.
- Multilingüe: aunque la cuantización está calibrada para coreano e inglés, el modelo base puede operar en otros idiomas con menor calidad.
- Sin censura: al ser una versión abliterated, no rechaza peticiones basadas en políticas de seguridad, lo que permite usos creativos sin restricciones.

## Casos de uso

- Asistente de programación en coreano: el modelo puede ayudar a desarrolladores coreanos a escribir, depurar y explicar código en su idioma nativo, con la ventaja de una cuantización que mantiene la calidad en coreano.
- Automatización de oficina con soporte multimodal: puede procesar documentos escaneados, capturas de pantalla o imágenes para extraer datos, resumir informes o generar respuestas, aprovechando su capacidad visual.
- Escritura creativa sin restricciones: la versión abliterated permite generar contenido literario, guiones o narrativas sin filtros de seguridad, útil para proyectos creativos donde se necesite libertad total.
- Traducción y generación de contenido bilingüe: con su calibración en coreano e inglés, es adecuado para traducir textos, generar copy para marketing o crear documentación técnica en ambos idiomas.
- Agente conversacional de atención al cliente: gracias a su soporte de tool calling y contexto largo, puede gestionar conversaciones multi-turno con acceso a bases de conocimiento o APIs externas, ofreciendo respuestas contextualizadas.
- Despliegue en hardware de gama media: las cuantizaciones ligeras (IQ3_XXS, 11GB) permiten ejecutar el modelo en portátiles con 16GB de RAM unificada, lo que lo hace accesible para desarrolladores individuales que quieran experimentar con un modelo de 27B en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona métricas de calidad de cuantización basadas en divergencia de Kullback-Leibler (KLD) y coincidencia de top-1 (same top p) comparadas con la versión BF16 del modelo, evaluadas sobre textos coreanos hold-out. Estos datos se presentan en la siguiente tabla:

| Cuantizacion | Tamano | KLD coreano | Same-top p | Recomendacion |
|---|---|---|---|---|
| KO-i1-Q8_0 | 28GB | 0.00061 | 98.7% | Practicamente sin perdidas |
| KO-i1-Q6_K | 21GB | 0.00375 | 96.5% | Alta calidad |
| KO-i1-Q5_K_M | 19GB | 0.00597 | 95.9% | Recomendada para 32GB |
| KO-i1-Q4_K_M | 16GB | 0.01399 | 93.9% | Estandar |
| KO-i1-IQ4_XS | 15GB | 0.01848 | 92.9% | Ahorro de memoria |
| KO-i1-IQ3_M | 12GB | 0.05824 | 87.6% | Baja memoria |
| KO-i1-IQ3_XXS | 11GB | 0.08951 | 85.2% | Dispositivos de 16 GB |
| KO-i1-IQ2_M | 9.6GB | 0.16996 | 80.1% | Compresion extrema |

La comparativa directa con una cuantizacion estatica Q5_K (sin imatrix) muestra una KLD de 0.00783 y same top p de 95.2% para esta ultima, frente a 0.00597 y 95.9% para la version con imatrix coreano, lo que representa una mejora del 23.7% en KLD (9.1 sigma).

## Requisitos de hardware

- VRAM estimada para inferencia: 9.6 GB (IQ2_M) hasta 28 GB (Q8_0). Las recomendaciones del autor se basan en RAM total del sistema (integrada o unificada): 16 GB para IQ3_XXS, 24 GB para IQ4_XS, 32 GB para Q5_K_M (recomendado) y 48 GB o mas para Q6_K.
- GPUs compatibles: el modelo puede ejecutarse en CPUs modernas con AVX2/AVX512, en GPUs de escritorio (NVIDIA con CUDA, AMD con ROCm) y en sistemas con memoria unificada (Apple Silicon, AMD APUs como Ryzen AI 9). No requiere GPU dedicada para las cuantizaciones mas ligeras.
- Despliegue: compatible con llama.cpp, llama-server, Ollama y LM Studio. Se recomienda usar el comando `llama-server -m <archivo.gguf> -ngl 99 -c 16384 --jinja -fa on` para descargar todas las capas en GPU y activar el flash attention.
- Latencia y throughput: no hay datos disponibles en la informacion proporcionada. El autor reporta que la generacion se realizo en un sistema con CPU e iGPU, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Caracteristicas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.3B | 262K | BF16, FP16 | Apache 2.0 | Multimodal, con censura, sin cuantizacion |
| Huihui-Qwen3.8-27B-abliterated (base) | 27.3B | 262K | BF16 | Apache 2.0 | Multimodal, sin censura, sin cuantizacion |
| augustine223/Huihui-Qwen3.8-27B-abliterated-KO-i1 | 27.3B | 262K (configurable) | GGUF con imatrix coreano | Apache 2.0 | Sin censura, cuantizado, optimizado para coreano |
| augustine223/kanana-KO-i1-GGUF | 8B | 128K | GGUF con imatrix coreano | Apache 2.0 | Sin censura, cuantizado, menor tamaño |
| augustine223/Qwen3.6-35B-A3B-KO-i1-GGUF | 35B (MoE) | 262K | GGUF con imatrix coreano | Apache 2.0 | Sin censura, cuantizado, arquitectura MoE |

La principal diferencia con el modelo base es la optimizacion para coreano y la eliminacion de filtros de seguridad. Comparado con otros modelos de la serie KO-i1, este ofrece el mejor equilibrio entre tamano (27B) y calidad de cuantizacion para coreano.

## Limitaciones y advertencias

- Modelo sin censura: al ser abliterated, puede generar contenido inapropiado, violento, sexual o ilegal. La responsabilidad del uso recae enteramente en el usuario, y debe cumplir con las leyes de su jurisdiccion y la licencia del modelo base.
- Sesgos del modelo base: Qwen3.8-27B puede heredar sesgos de su corpus de entrenamiento, especialmente en contextos no coreanos o no ingleses, donde la calidad de las respuestas puede degradarse.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar datos o hechos. La cuantizacion de baja precision (IQ2_M, IQ3_XXS) aumenta este riesgo.
- Limitaciones de idioma: la calibracion imatrix esta optimizada para coreano e ingles. El rendimiento en otros idiomas puede ser significativamente peor que la version BF16.
- Restricciones de contexto: aunque el modelo base soporta 262K tokens, la configuracion recomendada usa 16K tokens. Contextos mas largos requieren mas memoria y pueden degradar la calidad de la cuantizacion.
- Compatibilidad de hardware: las cuantizaciones mas ligeras (IQ2_M, IQ3_XXS) requieren hardware con soporte de instrucciones AVX2; sin el, la velocidad de inferencia sera muy baja.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad legal de los contenidos generados recae en el usuario, especialmente al tratarse de un modelo sin filtros.

## Enlaces

- Repositorio del modelo: https://huggingface.co/augustine223/Huihui-Qwen3.8-27B-abliterated-KO-i1-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Corpus de calibracion: https://huggingface.co/datasets/augustine223/korean-imatrix-calibration-corpus
- Guia de ejecucion (coreano): https://github.com/Jonas-Augustinus-Linus/strix-local-ai/blob/main/docs/run-guide-ko.md
- Repositorio strix-local-ai: https://github.com/Jonas-Augustinus-Linus/strix-local-ai
- Repositorio del modelo base Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
