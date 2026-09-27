# edp1096/Huihui-GLM-5.3-Flash-abliterated-NVFP4

# Huihui-GLM-5.3-Flash-abliterated-NVFP4

## Resumen

Huihui-GLM-5.3-Flash-abliterated-NVFP4 es una cuantización NVFP4 publicada por el usuario edp1096 que combina dos linajes: por un lado, la cuantización oficial de NVIDIA del modelo GLM-5.3-Flash de ZAI (nvidia/GLM-5.3-Flash-NVFP4) y, por otro, la versión "abliterated" en GGUF de huihui-ai, en la que se han eliminado los comportamientos de rechazo del modelo original. El resultado se distribuye en formato safetensors, ocupa 204,5 GB en el repositorio y declara 168.893.635.422 parámetros en los tensores almacenados, aunque la model card heredada de NVIDIA indica 320.000 millones de parámetros totales con 18.000 millones activados por token, una discrepancia que el repositorio no resuelve.

El modelo subyacente, GLM-5.3-Flash, es un transformer autorregresivo multimodal nativo con arquitectura Mixture-of-Experts (MoE), atención híbrida dispersa y lineal, y Manifold-Constrained Hyper-Connections (mHC) para sostener contextos largos. Acepta texto, imagen y vídeo como entrada (RGB, MP4/WebM) y genera texto, con una ventana de contexto declarada de hasta 1.000.000 de tokens. Está orientado a razonamiento, generación de código y tareas agénticas con uso de herramientas, y NVIDIA lo posiciona para sistemas de agentes, chatbots y pipelines RAG.

Su relevancia práctica es doble: permite ejecutar un MoE de gran tamaño en precisión de 4 bits sobre hardware Blackwell y, al mismo tiempo, ofrece una variante sin alineación de seguridad, algo que interesa a equipos de investigación en interpretabilidad, red-teaming y evaluación de sesgos. El autor documenta una validación en dos DGX Spark con paralelismo de tensor 2 (TP2): 1.047.622 tokens de entrada procesados sin reutilización de caché de prefijo, cinco pruebas de recuperación correctas y nueve tests de regresión de API superados. No hay resultados numéricos de benchmarks publicados y el repositorio acumulaba 0 descargas y 0 "likes" en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo multimodal con MoE disperso y atención híbrida (sparse + linear) con Manifold-Constrained Hyper-Connections; clase `Glm5NextForConditionalGeneration` |
| Parámetros totales | 168.893.635.422 según los safetensors del repositorio; la model card de NVIDIA declara 320.000 millones (discrepancia no resuelta en la información disponible) |
| Parámetros activos | 18.000 millones por token (según la model card de NVIDIA) |
| Longitud de contexto | Hasta 1.000.000 de tokens (1M) |
| Tipos de cuantización | NVFP4 (4 bits en coma flotante de NVIDIA) sobre pesos, con escalas de activación originales conservadas; el modelo base de huihui-ai existe además en cuantizaciones GGUF (no detalladas). La etiqueta `8-bit` del repositorio contradice el formato NVFP4 declarado |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (NVFP4, generado con NVIDIA ModelOpt v0.47.0); el modelo base también se distribuye en GGUF |
| Modalidades de entrada | Texto, imagen (RGB) y vídeo (MP4/WebM) |
| Modalidad de salida | Texto |
| Librería declarada | Model Optimizer (nvidia-modelopt v0.47.0) |
| Motores de inferencia soportados | vLLM y SGLang |
| Hardware compatible | Microarquitectura NVIDIA Blackwell; sistema operativo Linux |
| Tamaño del repositorio | 204,5 GB |
| Versión del modelo | NVFP4 1.0 |

## Arquitectura y entrenamiento

La arquitectura es la de GLM-5.3-Flash: un transformer autorregresivo multimodal nativo con capas Mixture-of-Experts, en el que solo se activan 18.000 millones de los 320.000 millones de parámetros declarados por token. Incorpora atención híbrida, combinando mecanismos dispersos con atención lineal, y Manifold-Constrained Hyper-Connections (mHC) para estabilizar el flujo de información en contextos muy largos, lo que habilita la ventana de hasta 1M de tokens. El modelo acepta entradas multimodales (texto, imagen y vídeo) y produce salidas de texto, lo que lo sitúa en la categoría `image-text-to-text`.

Sobre el entrenamiento no hay información: la model card de NVIDIA marca los datos de entrenamiento como "undisclosed" (modalidad, recolección y etiquetado). Lo que sí se documenta es el proceso de cuantización y su calibración. NVIDIA generó la versión NVFP4 con Model Optimizer v0.47.0 usando como conjuntos de calibración `cnn_dailymail` (más de 300.000 artículos periodísticos en inglés) y `Nemotron-Post-Training-Dataset-v2` (conversaciones multiturno de temática diversa), ambos de recolección y etiquetado automatizados. La variante de edp1096 se construye mediante una transferencia entre modelos cuantizados cuya fórmula, según el README, es `DQ(NVIDIA NVFP4) + DQ(Huihui GGUF) − DQ(Unsloth GGUF)`, con las escalas de activación originales conservadas; el autor no define la abreviatura DQ ni documenta en la información disponible la procedencia del término Unsloth, y advierte que "los residuales GGUF permanecen" y que no se reclama equivalencia con el BF16 de Huihui. Los detalles completos estarían en el archivo `transfer-manifest.json` del repositorio. La validación funcional documentada se hizo sobre dos DGX Spark en configuración TP2, procesando 1.047.622 tokens de entrada sin reutilización de caché de prefijo, con cinco registros de recuperación correctos y nueve pruebas de regresión de API superadas (detalles en `runtime-qualification.json`).

## Capacidades

- Generación de texto y razonamiento de dominio general, incluyendo preguntas de nivel graduado (el modelo base se evalúa en GPQA Diamond).
- Generación y razonamiento sobre código científico y de propósito general (evaluado en SciCode y Terminal Bench 2.1).
- Comprensión multimodal: acepta imágenes RGB y vídeo en MP4/WebM como entrada, con salida de texto (evaluado en MMMU Pro).
- Razonamiento sobre contexto muy largo, con ventana declarada de hasta 1M de tokens y una prueba documentada de más de un millón de tokens de entrada.
- Uso agéntico de herramientas y ejecución de tareas multi-paso (evaluado en IFBench y Terminal Bench 2.1).
- Comportamiento "abliterated": se han eliminado las respuestas de rechazo típicas del modelo alineado, lo que habilita generar contenido que la versión original declinaría.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento explícito ("thinking"): no disponible en la información proporcionada.

## Casos de uso

- Agentes de código en producción: el modelo combina generación de código con tool calling y ejecución multi-paso, de modo que puede integrarse en pipelines de CI/CD o en asistentes que abren pull requests, ejecutan tests y corrigen errores de forma iterativa.
- Análisis de documentación extensa: con una ventana de hasta 1M de tokens, permite cargar manuales técnicos, expedientes completos o bases de código íntegras sin trocear el contexto, lo que reduce la pérdida de información entre fragmentos típica de los pipelines RAG clásicos.
- Revisión de contratos y auditoría legal: el modelo puede procesar un contrato entero junto con su normativa de referencia y extraer cláusulas de riesgo, plazos y obligaciones, manteniendo coherencia entre secciones distantes del documento.
- Atención al cliente multimodal: al aceptar texto, imagen y vídeo, un mismo modelo puede gestionar conversaciones multiturno en las que el usuario adjunta capturas de pantalla, fotos de producto o vídeos de incidencias, sin necesidad de encadenar un modelo de visión aparte.
- Procesamiento de vídeo para catalogación: extracción de resúmenes, etiquetas y transcripciones estructuradas a partir de archivos MP4/WebM, útil en plataformas de contenido, moderación o análisis de material audiovisual.
- Despliegue on-premise en clúster Blackwell: gracias al formato NVFP4 y a la validación en dos DGX Spark, encaja en organizaciones que necesitan inferencia local de un MoE grande sin salir de su infraestructura, por requisitos de soberanía de datos o cumplimiento.
- Investigación en alineación y red-teaming: la variante abliterated permite estudiar qué comportamientos quedan expuestos al retirar los rechazos, comparar con el modelo alineado y construir conjuntos de evaluación de seguridad.
- RAG conversacional con herramientas: la combinación de contexto largo, multimodalidad y function calling permite construir asistentes que consultan bases de datos, APIs internas y documentación, y razonan sobre los resultados en varias iteraciones.
- Automatización de tareas de terminal: el modelo base se evalúa en Terminal Bench 2.1, de modo que es candidato para agentes que operan shells, ejecutan comandos y diagnostican fallos de sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card únicamente enumera los conjuntos de evaluación empleados con el modelo base, sin cifras asociadas:

| Benchmark | Área evaluada | Resultado |
|---|---|---|
| GPQA Diamond | Razonamiento de nivel graduado (biología, física, química); 448 preguntas de opción múltiple | No disponible |
| SciCode | Codificación científica | No disponible |
| MMMU Pro | Comprensión multimodal de nivel universitario | No disponible |
| AA-LCR | Recuperación en contexto largo (Artificial Analysis) | No disponible |
| IFBench | Seguimiento de instrucciones | No disponible |
| Terminal Bench 2.1 | Uso de terminal y tareas agénticas | No disponible |

Único dato de rendimiento documentado: en la validación del autor sobre dos DGX Spark con TP2 se procesaron 1.047.622 tokens de entrada sin reutilización de caché de prefijo, con cinco registros de recuperación correctos y nueve pruebas de regresión de API superadas. No se publican latencias ni tokens por segundo.

## Requisitos de hardware

- Compatibilidad declarada: microarquitectura NVIDIA Blackwell. El formato NVFP4 requiere kernels específicos de esta generación; no hay soporte documentado para arquitecturas anteriores.
- Peso de los pesos en FP4 (estimación derivada del recuento de parámetros): 168.893.635.422 parámetros × 0,5 bytes ≈ 84,4 GB. Si se toma la cifra de 320.000 millones de la model card de NVIDIA, el cálculo ascendería a ≈ 160 GB. A estas cantidades hay que sumar escalas de cuantización, embeddings y caché KV.
- Parámetros activos: 18.000 millones por token, lo que en FP4 supone ≈ 9 GB de pesos leídos por paso de decodificación, antes de caché KV y overhead del runtime.
- Tamaño del repositorio: 204,5 GB, superior a la estimación de pesos puros, por lo que conviene prever ese espacio en disco y en transferencia.
- Configuración validada: dos DGX Spark con paralelismo de tensor 2 (TP2). Con un contexto de hasta 1M de tokens, la caché KV es el factor dominante de memoria, y la prueba documentada se ejecutó sin reutilización de caché de prefijo.
- GPU de consumo: no hay datos publicados de despliegue en GPU de consumo en la información disponible. Dado que se requieren kernels NVFP4 de Blackwell y que los pesos superan ampliamente los 32 GB de una RTX 5090, un despliegue en una sola tarjeta de consumo no parece viable sin offloading.
- Opciones de despliegue: vLLM y SGLang son los motores soportados según la model card. La cuantización se generó con NVIDIA Model Optimizer v0.47.0. El modelo base intermedio está disponible en GGUF, lo que abre la puerta a runtimes tipo llama.cpp, aunque esta variante NVFP4 concreta se distribuye en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| edp1096/Huihui-GLM-5.3-Flash-abliterated-NVFP4 | 168,9 mil millones en safetensors (320 mil millones declarados por NVIDIA) | 1M tokens | safetensors NVFP4 | MIT | Variante abliterated; validada en 2× DGX Spark TP2; sin benchmarks publicados; 0 descargas |
| nvidia/GLM-5.3-Flash-NVFP4 | 320 mil millones totales, 18 mil millones activos | 1M tokens | safetensors NVFP4 | MIT | Cuantización oficial de NVIDIA con ModelOpt v0.47.0; alineación intacta; soporte vLLM y SGLang |
| huihui-ai/GLM-5.3-Flash-abliterated-GGUF | No disponible | No disponible | GGUF | No disponible | Base directa de esta ficha; abliterated; cuantizaciones no detalladas |
| zai-org/GLM-5.3-Flash | 320 mil millones totales, 18 mil millones activos | 1M tokens | No disponible | No disponible | Modelo original de ZAI, multimodal y MoE; punto de partida de toda la cadena |

No se dispone de otros modelos comparables con datos verificables en la información proporcionada (por ejemplo, alternativas de otros fabricantes con contexto de 1M y precisión FP4); por tanto, la comparación se limita a la propia familia GLM-5.3-Flash.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los comportamientos de rechazo, por lo que puede generar contenido dañino, ilegal o inseguro que el modelo original bloquearía. La licencia MIT no exime de responsabilidad legal ni de las obligaciones de moderación aplicables en la UE o en el país de despliegue.
- Sin datos de benchmarks: no hay cifras de MMLU, GPQA, HumanEval, GSM8K ni de los conjuntos que la propia model card enumera, de modo que la calidad real de esta cuantización concreta no está verificada públicamente.
- Discrepancia en el recuento de parámetros: 168,9 mil millones en safetensors frente a los 320 mil millones declarados por NVIDIA. El repositorio no explica esta diferencia, lo que dificulta planificar hardware y validar que el proceso de conversión no haya descartado pesos.
- El autor advierte explícitamente de que "los residuales GGUF permanecen" y de que no se reclama equivalencia con el BF16 de Huihui. La conversión es una combinación aritmética de modelos cuantizados, no una cuantización directa desde pesos de alta precisión, por lo que puede haber deriva de calidad no medida.
- La fórmula de conversión menciona un término de Unsloth GGUF que no aparece entre los modelos base declarados; el README no define qué significa "DQ" ni documenta esa procedencia.
- Etiqueta inconsistente: el repositorio incluye la etiqueta `8-bit` pese a distribuir pesos NVFP4 de 4 bits.
- Dependencia de hardware: requiere GPU NVIDIA Blackwell. Esto excluye A100, H100 y GPUs de consumo de generaciones anteriores, y limita el despliegue a proveedores de nube con esa generación disponible.
- Riesgo de alucinación: no hay evaluación publicada de fidelidad ni de tasas de alucinación para esta cuantización; las tareas de recuperación en contexto largo son especialmente sensibles a este problema.
- Idiomas: la model card no declara idiomas soportados y el conjunto de calibración principal es en inglés, lo que hace previsible un rendimiento desigual fuera del inglés.
- Contexto largo y memoria: una ventana de 1M de tokens implica una caché KV muy costosa. La prueba documentada se realizó sin reutilización de caché de prefijo, lo que sugiere un consumo de memoria elevado sostenido.
- Falta de validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta. No hay retroalimentación de terceros, informes de errores ni réplicas independientes de la validación del autor.
- Sin información sobre datos de entrenamiento: la model card original los marca como no divulgados, por lo que no es posible auditar sesgos de origen ni composición del corpus.
- Uso comercial: la licencia MIT lo permite, pero conviene revisar los términos del modelo base de ZAI, no disponibles en la información proporcionada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/edp1096/Huihui-GLM-5.3-Flash-abliterated-NVFP4
- Cuantización oficial de NVIDIA: https://huggingface.co/nvidia/GLM-5.3-Flash-NVFP4
- Variante abliterated en GGUF: https://huggingface.co/huihui-ai/GLM-5.3-Flash-abliterated-GGUF
- Modelo original de ZAI: https://huggingface.co/zai-org/GLM-5.3-Flash
- NVIDIA Model Optimizer (repositorio): https://github.com/NVIDIA/Model-Optimizer
- Dataset de calibración cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibración Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia MIT (texto de referencia): https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md
- Artefactos citados en el repositorio (no enlazados directamente en la información disponible): `transfer-manifest.json` y `runtime-qualification.json`
