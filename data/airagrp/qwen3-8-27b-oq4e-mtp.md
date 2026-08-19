# airagrp/Qwen3.8-27B-oQ4e-mtp

## Resumen

Qwen3.8-27B-oQ4e-mtp es una version cuantizada a 4 bits del modelo Qwen3.8-27B, un modelo denso de 27.000 millones de parametros desarrollado por Alibaba Cloud como parte de la familia Qwen3.8. Esta variante especifica ha sido generada por el usuario airagrp utilizando la herramienta oQ (oMLX v0.6.0rc1), que aplica cuantizacion de precision mixta para optimizar el modelo para su ejecucion en hardware Apple Silicon mediante el framework MLX.

El modelo original Qwen3.8-27B es un modelo de lenguaje y vision (vision-language model) con una ventana de contexto de 262.144 tokens y soporte para decodificacion MTP (Multi-Token Prediction). Esta cuantizacion reduce el tamaño del repositorio a 17 GB, lo que permite ejecutar el modelo en equipos con 24 GB de memoria unificada, como Macs de gama alta o GPUs consumer de 24 GB.

La relevancia de esta version cuantizada radica en que hace accesible un modelo de 27B parametros en hardware de consumo, algo que con los pesos originales en precision completa no seria posible. El formato MLX safetensors esta especificamente optimizado para el ecosistema Apple, aunque tambien puede convertirse a otros formatos como GGUF para su uso con llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso con atencion multimodal) |
| Parametros totales | 4.926.789.872 (pesos cuantizados en safetensors; el modelo original tiene 27B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (segun informacion del modelo original) |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta (oQ) |
| Idiomas soportados | no disponible (el modelo original Qwen3.8 soporta multiples idiomas, principalmente ingles y chino) |
| Licencia | no disponible en la model card; el modelo original Qwen3.8-27B usa Apache-2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parametros con capacidades multimodales (texto e imagen). Incorpora decodificacion MTP (Multi-Token Prediction), una tecnica que permite predecir multiples tokens por paso de decodificacion, mejorando el throughput en inferencia. La arquitectura qwen3_5 es la ultima iteracion de la serie Qwen3, que incluye mejoras en atencion de contexto largo y eficiencia de entrenamiento.

La version cuantizada oQ4e-mtp aplica cuantizacion de precision mixta con 4 bits y group size de 64, lo que reduce significativamente el tamaño del modelo manteniendo la mayor parte de la calidad. La herramienta oQ (oMLX) selecciona dinamicamente que capas cuantizar con mayor o menor precision segun su sensibilidad, optimizando el equilibrio entre tamaño y rendimiento.

No se dispone de informacion detallada sobre el dataset de entrenamiento del modelo original ni sobre el proceso de alineacion (RLHF, DPO, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es capaz de tareas complejas de razonamiento, matematicas y analisis.
- Comprension de imagenes: al ser un vision-language model, puede procesar y razonar sobre imagenes junto con texto.
- Contexto largo: ventana de 262.144 tokens, adecuada para documentos extensos, libros o conversaciones muy largas.
- Decodificacion MTP: soporta Multi-Token Prediction para mayor velocidad de generacion.
- Capacidades multilingues: el modelo original soporta principalmente ingles y chino, aunque la informacion especifica no esta disponible.
- Tool calling y function calling: no confirmado en la informacion proporcionada, aunque es comun en la familia Qwen3.
- Soporte para agentes: no confirmado explicitamente, pero la arquitectura Qwen3.8 es compatible con flujos de agente.

## Casos de uso

- Ejecucion local en Mac con Apple Silicon: el formato MLX y la cuantizacion a 4 bits permiten ejecutar un modelo de 27B en un Mac con 24 GB de RAM unificada, ideal para desarrollo y prototipado sin depender de la nube.
- Analisis de documentos largos: con 262.144 tokens de contexto, puede procesar libros completos, informes anuales o expedientes legales en una sola pasada, resumiendo y extrayendo informacion clave.
- Asistente de programacion offline: el modelo puede generar y revisar codigo en multiples lenguajes, funcionando como copiloto local sin enviar datos a servidores externos, lo que es relevante para entornos con requisitos de privacidad.
- Razonamiento visual en produccion: al ser multimodal, puede analizar capturas de pantalla, diagramas o fotografias y responder preguntas sobre ellas, util en soporte tecnico o automatizacion de QA visual.
- Investigacion academica: permite a investigadores con hardware limitado experimentar con un modelo de 27B parametros, probando prompts, fine-tuning ligero o evaluando capacidades de razonamiento.
- Despliegue en GPU consumer: con 17 GB de pesos cuantizados, cabe en una RTX 4090 (24 GB) o similar, permitiendo servir el modelo con vLLM o llama.cpp en entornos de produccion de baja escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion (oQ4e-mtp) en la informacion disponible. La busqueda web menciona que el modelo Qwen3.8-27B ha sido evaluado en MathVision, pero no se proporcionan cifras concretas. No se dispone de datos comparativos con otras cuantizaciones o modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17-18 GB para los pesos cuantizados, mas overhead de activaciones y cache KV. Con contexto largo, se recomienda al menos 24 GB.
- GPU recomendadas: Apple Silicon con 24 GB o mas (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max); GPUs NVIDIA con 24 GB (RTX 4090, A5000) o superiores.
- Compatibilidad con GPU consumer: si, cabe en RTX 4090 (24 GB) y en Macs con 24 GB de memoria unificada.
- Opciones de despliegue: MLX (nativo), conversion a GGUF para llama.cpp y Ollama, vLLM con soporte para safetensors.
- Rendimiento estimado: segun la busqueda web, AMD Ryzen AI Max+ 395 alcanza 24,5 tokens por segundo con la version Q4. En Apple Silicon, el rendimiento depende del chip, pero suele oscilar entre 10 y 30 tok/s para modelos de este tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ4e-mtp (este) | 27B (4-bit) | 262.144 | no disponible | MLX safetensors | Cuantizacion oQ para Apple Silicon |
| Qwen3.8-27B-oQ8e-mtp | 27B (8-bit) | 262.144 | no disponible | MLX safetensors | Misma base, mayor precision, mas VRAM |
| Qwen3.8-27B (original) | 27B | 262.144 | Apache-2.0 | safetensors | Precision completa, requiere ~54 GB VRAM |
| Llama 3.1 8B (cuantizado) | 8B | 128.000 | Apache-2.0 | GGUF/MLX | Mucho menor, pero tambien menos capaz |

La comparativa se basa en informacion publica del modelo original y de las variantes cuantizadas encontradas en la busqueda web. No se dispone de datos de rendimiento comparativo directo.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar ligeramente la calidad de las respuestas en tareas de razonamiento complejo o matematicas avanzadas, comparado con el modelo en precision completa.
- La licencia de esta cuantizacion especifica no esta declarada en la model card. El modelo original usa Apache-2.0, pero se debe verificar antes de uso comercial.
- El formato MLX safetensors esta orientado a Apple Silicon; para otros hardware es necesario convertir a GGUF u otros formatos, lo que puede requerir herramientas adicionales.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma especificas de esta version cuantizada.
- El modelo base es principalmente bilingue (ingles y chino); el rendimiento en otros idiomas puede ser inferior.
- La ventana de contexto de 262.144 tokens requiere gestion cuidadosa de la memoria; con contextos muy largos, la VRAM puede ser insuficiente incluso en GPUs de 24 GB.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicacion reciente o poco validada por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/airagrp/Qwen3.8-27B-oQ4e-mtp
- Repositorio de la herramienta oQ (oMLX): https://github.com/jundot/omlx
- Variante oQ8e-mtp del mismo autor: https://huggingface.co/airagrp/Qwen3.8-27B-oQ8e-mtp
- Guia de ejecucion local (swfte.com): https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
- Guia para Mac y GPU (modelfit.io): https://modelfit.io/blog/run-qwen38-27b-locally-2026/
- Especificaciones y benchmarks (kingy.ai): https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/
