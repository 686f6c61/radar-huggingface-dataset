# Mannaxx/zhoomerx-fast

## Resumen

zhoomerx-fast es un modelo de lenguaje publicado en Hugging Face por el usuario Mannaxx bajo el identificador `Mannaxx/zhoomerx-fast`. Se trata de un ajuste fino (finetune) del modelo base `meta-llama/Meta-Llama-3.1-8B` de Meta, distribuido en formato GGUF cuantizado para su uso con llama.cpp. La model card del repositorio reproduce íntegramente la documentación de Hermes 3 de Nous Research, lo que indica que el modelo deriva de la familia Hermes 3, conocida por su enfoque en capacidades agénticas, function calling, roleplaying y coherencia en contexto largo.

El modelo cuenta con 8.030.261.312 parámetros totales (aproximadamente 8 mil millones) y hereda la arquitectura transformer densa de Llama 3.1, con una ventana de contexto de 128.000 tokens según las especificaciones del modelo base. Está orientado a instrucciones y conversación, emplea el formato de prompt ChatML y declara soporte para function calling y modo JSON, lo que lo hace adecuado para integraciones con endpoints compatibles con la API de OpenAI.

Su relevancia radica en que combina las capacidades generalistas de Llama 3.1 8B con el ajuste de alineación de Hermes 3, ofreciendo una opción ligera y desplegable en hardware de consumo mediante cuantización GGUF. No obstante, el repositorio presenta señales de escasa madurez: cero descargas, cero likes, y una model card que referencia benchmarks de la variante de 70B en lugar de la de 8B, lo que conviene tener en cuenta antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.1) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B) |
| Tipos de cuantizacion | GGUF (cuantizaciones multiples; el repo pesa 25,8 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de Llama 3.1 8B, con atención por cabezas agrupadas (GQA) y las mejoras de tokenizador y contexto de la familia Llama 3.1. Sobre esta base se aplicó un ajuste fino de tipo instruct siguiendo la metodología de Hermes 3 de Nous Research, que según la model card incluye mejoras en capacidades agénticas, roleplaying, razonamiento, conversación multi-turno y coherencia en contexto largo, así como function calling y salida estructurada más fiables.

La model card menciona el uso de datos sintéticos, destilación y la herramienta Axolotl para el entrenamiento, además de referenciar el informe técnico de Hermes 3 (arXiv:2408.11857). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones técnicas propias más allá de las heredadas del modelo base y del ajuste de alineación de Hermes 3.

## Capacidades

- Generación de texto conversacional e instructiva en inglés.
- Razonamiento multi-turno y coherencia en contextos largos (hasta 128.000 tokens según el modelo base).
- Function calling y tool calling con formato estructurado basado en etiquetas `<tools>` y firmas JSON.
- Modo JSON para salida estructurada.
- Capacidades agénticas y razonamiento multi-paso, según la documentación de Hermes 3.
- Roleplaying y control mediante system prompts (steerability).
- Generación de código (mejorada respecto a Hermes 2 según la model card).
- Compatibilidad con endpoints de la API de OpenAI gracias al formato ChatML.
- Capacidades multilingües limitadas: el modelo declara únicamente inglés (`en`).

## Casos de uso

- Asistentes conversacionales multi-turno: el modelo puede mantener diálogos extensos con system prompts personalizados y contexto de hasta 128.000 tokens, adecuado para chatbots de soporte con historial largo.
- Integración en pipelines de function calling: gracias a su formato de herramientas basado en `<tools>` y JSON, puede conectarse a APIs externas (por ejemplo, consultas a bases de datos o servicios financieros) en flujos automatizados.
- Generación de salida estructurada: el modo JSON permite usarlo en tareas de extracción de datos, rellenado de formularios o generación de respuestas parseables por máquina.
- Agentes autónomos de múltiples pasos: sus capacidades agénticas declaradas lo hacen apto para orquestación de tareas con planificación y uso de herramientas en entornos controlados.
- Roleplaying y simulación de personajes: el control mediante system prompts y el ajuste de Hermes 3 lo orientan a aplicaciones de entretenimiento, simulación o entrenamiento conversacional.
- Despliegue local en hardware de consumo: al distribuirse en GGUF, puede ejecutarse con llama.cpp en equipos con GPU modesta o incluso CPU, útil para prototipado y entornos sin infraestructura cloud.
- Asistencia de código en local: puede emplearse como copiloto de programación autoalojado para autocompletado y explicación de código en inglés.

## Benchmarks y rendimiento

La model card incluye un `model-index` que declara el nombre "Hermes-3-Llama-3.1-70B" con una lista de resultados vacía (`results: []`), es decir, sin métricas numéricas asociadas. La sección de benchmarks del README remite a una imagen comparativa y afirma que el modelo es "competitivo, si no superior, a los modelos Llama-3.1 Instruct" en capacidades generales, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K u otras) en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantización Q4_K_M, aproximadamente 5-6 GB; en Q8_0, en torno a 8-9 GB; en FP16, unos 16 GB. Estas estimaciones se derivan del tamaño de 8.000 millones de parámetros y no están confirmadas por el autor.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM usando cuantizaciones Q4 o Q5; en CPU también es viable con llama.cpp aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. vLLM y TGI requieren normalmente pesos en safetensors, no incluidos en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zhoomerx-fast | 8,03 B | 128.000 | llama3 | GGUF | Finetune de Llama 3.1 8B, sin benchmarks publicados |
| Hermes-3-Llama-3.1-8B (Nous Research) | 8 B | 128.000 | llama3 | safetensors / GGUF | Modelo original del que deriva; dispone de informe técnico |
| Meta-Llama-3.1-8B-Instruct | 8 B | 128.000 | llama3 | safetensors / GGUF | Base oficial de Meta, ampliamente evaluado |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.000 | Apache 2.0 | safetensors / GGUF | Alternativa de tamaño similar con licencia permisiva |

La comparativa se basa en las especificaciones conocidas de los modelos citados; no se dispone de datos de rendimiento específicos de zhoomerx-fast que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sesgos: al derivar de Llama 3.1 y de datos sintéticos de destilación, puede heredar sesgos presentes en el modelo base y en los datos de entrenamiento; no se documentan evaluaciones de sesgo.
- Alucinación: no se han publicado evaluaciones de fidelidad factual; como todo modelo generativo, puede producir información incorrecta con aparente seguridad.
- Licencia: la licencia llama3 (Llama 3 Community License) impone restricciones de uso comercial, requisitos de atribución y cláusulas específicas sobre usuarios con más de 700 millones de usuarios mensuales; conviene revisarla antes de un despliegue comercial.
- Madurez del repositorio: cero descargas y cero likes, creado y actualizado en la misma fecha, sin benchmarks propios ni validación de la comunidad; la model card referencia benchmarks de la variante de 70B, no de la de 8B.
- Formato: solo se distribuye en GGUF, lo que limita su uso con frameworks que requieren safetensors (vLLM, TGI) sin conversión previa.
- Producción: la falta de métricas verificadas y de documentación propia del autor desaconseja su adopción en entornos críticos sin una evaluación previa exhaustiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mannaxx/zhoomerx-fast
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B
- Modelo Hermes 3 8B original (BF16): https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B
- Informe técnico de Hermes 3: https://arxiv.org/abs/2408.11857
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Documentación de chat templates de Transformers: https://huggingface.co/docs/transformers/main/chat_templating
