# mradermacher/Ornith-1.5-35B-A3B-heretic-ja-i1-GGUF

## Resumen

Ornith-1.5-35B-A3B-heretic-ja-i1-GGUF es una cuantización GGUF del modelo Ornith-1.5-35B-A3B-heretic-ja, desarrollado por OS-Software a partir del modelo base Ornith-1.5-35B-A3B de ornith-ai. Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) con aproximadamente 35 000 millones de parámetros totales y unos 3 000 millones de parámetros activos por token, lo que permite un rendimiento elevado con un coste computacional reducido. La variante "heretic-ja" incorpora un ajuste orientado a reducir la censura (etiquetado como uncensored, decensored y abliterated), lo que lo hace adecuado para tareas que requieren respuestas sin restricciones temáticas.

Este repositorio concreto, publicado por mradermacher, contiene únicamente el archivo de imatrix (0,3 GB) para generar cuantizaciones personalizadas, mientras que las cuantizaciones estáticas (Q2_K, Q4_K_M, Q6_K, etc.) están disponibles en el repositorio hermano Ornith-1.5-35B-A3B-heretic-ja-GGUF. El modelo base soporta una ventana de contexto de hasta 256 000 tokens según la documentación del proyecto DGX Spark, y está pensado para su despliegue en entornos de producción con vLLM, llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con componentes Mamba (hibrida) |
| Parametros totales | 34 660 610 688 (34,66 B) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | Hasta 256 000 tokens (segun documentacion del proyecto DGX Spark) |
| Tipos de cuantizacion | imatrix (0,3 GB) en este repo; estaticas (Q2_K, IQ3_M, Q4_K_S, Q4_K_M, Q6_K, etc.) en el repo hermano |
| Idiomas soportados | Ingles (etiqueta "en") |
| Licencia | MIT |
| Formato de pesos | GGUF (imatrix) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura MoE hibrida que combina capas transformer con componentes Mamba, una innovacion que reduce el coste de atencion en contextos largos. Con 35 B parametros totales y solo ~3 B activos por token, consigue un equilibrio entre capacidad y eficiencia. Segun la documentacion oficial de Ornith AI, el entrenamiento sigue un esquema de "self-improvement" en el que el modelo propone tareas, genera scaffolds especificos y produce rollouts de soluciones, extendiendo el marco de "self-scaffolding" introducido en Ornith-1.0.

La variante "heretic-ja" aplica tecnicas de abliteration (eliminacion de capas de rechazo) y ajuste con LoRA (ara-lora) para reducir la censura y permitir respuestas mas directas. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO. El modelo base soporta decodificacion especulativa MTP (Multi-Token Prediction) integrada en el checkpoint, segun el repositorio de DGX Spark.

## Capacidades

- Generacion de texto libre con alta fluidez en ingles.
- Razonamiento multi-step y resolucion de problemas complejos gracias a la arquitectura MoE con 3 B parametros activos.
- Soporte de tool calling y function calling, lo que permite integracion con APIs y agentes.
- Capacidad de procesamiento de vision (el modelo base es multimodal), aunque los archivos mmproj necesarios estan en el repositorio de cuantizaciones estaticas.
- Ventana de contexto ampliable hasta 256 000 tokens, adecuada para documentos largos y conversaciones multi-turno.
- Modo "uncensored" que reduce las restricciones tematicas en las respuestas.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 256k tokens) y respuestas sin censura, lo que permite tratar temas delicados sin evasivas.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar codigo, aprovechando su capacidad de razonamiento.
- Analisis de documentos extensos: su ventana de contexto de 256k tokens permite procesar contratos, informes o libros completos en una sola pasada, extrayendo informacion relevante.
- Agentes autonomos: combinado con frameworks como LangChain o LlamaIndex, puede actuar como agente que planifica, ejecuta herramientas y razona sobre los resultados.
- Creacion de contenido sin restricciones: ideal para redaccion creativa, guiones o narrativa donde se requiera explorar temas controvertidos sin filtros.
- Asistente de investigacion: su capacidad de razonamiento y contexto largo lo hace util para resumir articulos cientificos, comparar metodologias y generar hipotesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Se recomienda consultar la documentacion oficial de Ornith AI o el repositorio del modelo base para obtener metricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M (~20 GB), cabe en GPUs consumer de 24 GB como la RTX 3090 o RTX 4090. Para Q8 (~35 GB), se requiere una GPU profesional como A6000 o A100 de 40 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090, o DGX Spark (GB10 con 128 GB de memoria unificada) para contexto de 256k.
- En consumer GPU: si, con cuantizaciones Q4 o inferiores y contexto reducido (8k-32k).
- Opciones de despliegue: vLLM (con soporte MTP), llama.cpp, Ollama, TGI y text-generation-inference.
- Latencia y throughput: no disponible. Se estima que con 3 B parametros activos, la generacion es significativamente mas rapida que un modelo denso de 35 B, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 34,66 B | ~3 B | 256k | MIT | Modelo original sin ajustes |
| Ornith-1.5-35B-A3B-heretic-ja | 34,66 B | ~3 B | 256k | MIT | Variante sin censura |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32k | Apache 2.0 | MoE denso, mas parametros activos |
| Qwen 2.5 32B | 32,5 B | 32,5 B | 128k | Apache 2.0 | Denso, mayor coste por token |

La comparativa se basa en datos publicos de cada modelo. Ornith-1.5 destaca por su bajo numero de parametros activos y su contexto de 256k, aunque carece de benchmarks publicados en este repositorio.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o eticamente cuestionable sin filtros. No es recomendable para aplicaciones publicas sin moderacion adicional.
- Riesgo de alucinacion: como todo LLM, puede inventar hechos o citas, especialmente en contextos largos. Se recomienda verificacion humana en usos criticos.
- Limitaciones de idioma: solo se ha confirmado soporte para ingles. El rendimiento en otros idiomas no esta documentado.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el ajuste "heretic" puede violar las politicas de algunas plataformas de hosting.
- Limitaciones de contexto: aunque el modelo soporta 256k tokens, el rendimiento real puede degradarse en contextos extremadamente largos sin cuantizaciones adecuadas.
- Advertencia de produccion: el repositorio actual solo contiene el archivo imatrix; para usar el modelo es necesario descargar las cuantizaciones estaticas del repositorio hermano.

## Enlaces

- Repositorio actual (imatrix): https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-heretic-ja-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-heretic-ja-GGUF
- Modelo base (OS-Software): https://huggingface.co/OS-Software/Ornith-1.5-35B-A3B-heretic-ja
- Modelo original (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Proyecto DGX Spark: https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark
- Web oficial de Ornith AI: https://ornith.ai/
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
