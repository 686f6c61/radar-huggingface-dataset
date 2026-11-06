# amd/Meta-Llama-3-8B_rai_1.9.0_m_1.0.1_npu

## Resumen

Meta-Llama-3-8B_rai_1.9.0_m_1.0.1_npu es una distribucion optimizada del modelo Meta Llama 3 de 8.000 millones de parametros, publicada por AMD en Hugging Face para su ejecucion sobre NPUs de la plataforma Ryzen AI. El modelo base fue desarrollado por Meta y esta empaquetado en formato ONNX con las herramientas de Ryzen AI (RAI 1.9.0) y el modelo de despliegue m_1.0.1_npu, lo que permite inferencia acelerada en hardware AMD con NPU integrada en lugar de recurrir a GPU dedicada.

La relevancia de esta publicacion es practica: traslada un modelo de lenguaje de proposito general a un formato ejecutable en equipos con NPU (portatiles y mini-PC con Ryzen AI), reduciendo la dependencia de GPUs y el consumo energetico. El repositorio ocupa 5,4 GB, coherente con pesos en precision reducida para 8B de parametros, y esta restringido en Hugging Face (gated), por lo que requiere aceptar las condiciones de la licencia Llama 3 antes de la descarga.

No se trata de un modelo nuevo ni de un fine-tuning: es el mismo Llama 3 8B de Meta, con arquitectura transformer densa y contexto de 8.192 tokens, adaptado por AMD para su runtime. Su interes esta en el despliegue en hardware Ryzen AI, no en mejoras de calidad respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3 de Meta), exportado a ONNX para Ryzen AI |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredado del Llama 3 8B base; no confirmado en la ficha del repo) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos ONNX optimizados para NPU; se desconoce el esquema exacto) |
| Idiomas soportados | Ingles (segun la metadata del repo) |
| Licencia | Llama 3 Community License (acceso restringido, requiere aceptacion) |
| Formato de pesos | ONNX (empaquetado Ryzen AI, variante m_1.0.1_npu) |

## Arquitectura y entrenamiento

El modelo subyacente es Meta Llama 3 8B, un transformer decoder-only denso con atencion multi-cabeza, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). Meta entreno este modelo con aproximadamente 15 billones de tokens (dato del informe tecnico de Llama 3, no incluido en la informacion del repositorio de AMD) y aplico ajuste supervisado y optimizacion por preferencias (DPO) en la fase de alineamiento. La distribucion de AMD no modifica los pesos del modelo de forma sustancial: se limita a exportarlos a ONNX y optimizarlos para el runtime Ryzen AI, con el identificador de modelo m_1.0.1_npu que indica la version del paquete de despliegue para NPU.

No se dispone en la informacion proporcionada de detalles sobre el proceso de conversion, las tecnicas de cuantizacion aplicadas ni las modificaciones de grafo realizadas por AMD. Tampoco hay datos sobre decodificacion especulativa, atencion lineal u otras optimizaciones de inferencia especificas de esta build.

## Capacidades

- Generacion de texto en ingles: redaccion, resumen, reescritura y respuesta a preguntas.
- Razonamiento basico y de sentido comun, heredado del Llama 3 8B base.
- Generacion de codigo en lenguajes habituales (Python, JavaScript, etc.), con calidad de modelo 8B.
- Matematicas de nivel basico y medio; el modelo original no destaca en razonamiento matematico complejo.
- Soporte de conversacion multi-turno mediante formato de chat de Llama 3 (etiquetas de rol).
- Tool calling y function calling: no disponible de forma nativa verificada en esta build; el Llama 3 8B base no esta entrenado especificamente para ello.
- Capacidades de agente y razonamiento multi-paso: limitadas por el tamano del modelo y sin entrenamiento especifico de agentes.
- Multilingue: limitado; la metadata del repo declara solo ingles, aunque el modelo base tiene cierta competencia en otros idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Asistente local en portatiles con Ryzen AI: ejecucion de un chatbot de 8B en la NPU del equipo, con bajo consumo y sin GPU dedicada, adecuado para entornos de oficina y demos.
- Procesamiento de texto en el borde (edge): clasificacion, extraccion de entidades y resumen de documentos en equipos sin conexion a la nube, aprovechando la NPU para reducir latencia y consumo.
- Generacion de codigo en entornos de desarrollo locales: autocompletado y explicacion de fragmentos en IDE sobre hardware AMD, sin enviar codigo a servicios externos.
- Prototipado de aplicaciones de IA generativa en Windows: validacion de pipelines ONNX y Ryzen AI antes de desplegar en produccion con modelos mayores.
- Atencion al cliente en modo demo o interno: conversaciones multi-turno de hasta 8.192 tokens de contexto para pruebas de concepto en hardware de escritorio.
- Investigacion sobre inferencia en NPU: comparacion de rendimiento y precision entre ejecucion en NPU Ryzen AI y GPU/CPU con el mismo modelo base.
- Educacion y formacion: ejecucion de un LLM de referencia en aulas o laboratorios con equipos AMD, sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni datos de latencia o throughput en NPU Ryzen AI.

## Requisitos de hardware

- VRAM estimada: no aplica directamente; el modelo esta pensado para NPU Ryzen AI, no para GPU. El repo ocupa 5,4 GB, lo que sugiere pesos en torno a 4-5 bits o FP16 parcial; no confirmado.
- GPU recomendadas: no aplica para esta build; el runtime Ryzen AI esta orientado a NPU integrada en procesadores AMD Ryzen AI (serie 7040/8040 y posteriores, segun la plataforma).
- Cabe en GPU consumer: la build ONNX no esta pensada para GPU; el Llama 3 8B en FP16 requiere unos 16 GB de VRAM y caberia en RTX 4090 (24 GB) o RTX 4080 (16 GB) con el modelo original, no con este paquete.
- Opciones de despliegue: runtime Ryzen AI (RAI 1.9.0) con el paquete m_1.0.1_npu; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta build.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMD Meta-Llama-3-8B_rai_1.9.0_m_1.0.1_npu | 8B | 8.192 (heredado) | ONNX (Ryzen AI) | Llama 3 | Gated en Hugging Face |
| Meta Llama 3 8B (original) | 8B | 8.192 | safetensors | Llama 3 | Abierto en Hugging Face |
| Mistral 7B | 7B | 32.768 | safetensors | Apache 2.0 | Abierto |
| Gemma 2 9B | 9B | 8.192 | safetensors | Gemma Terms | Abierto con condiciones |

La comparativa se limita a datos estructurales; no hay benchmarks publicados para esta build que permitan comparar calidad o rendimiento con las alternativas.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar la licencia Llama 3 en Hugging Face antes de la descarga.
- Licencia Llama 3: impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales, obligaciones de atribucion y politicas de uso aceptable); revisar antes de produccion.
- Idioma: declarado solo en ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto limitado a 8.192 tokens, inferior a alternativas como Mistral 7B.
- Riesgo de alucinacion inherente a un modelo 8B, especialmente en datos factuales y matematicas.
- Sesgos heredados del corpus de entrenamiento de Meta; no se documentan mitigaciones adicionales en esta build.
- Dependencia de hardware: solo ejecutable en plataformas Ryzen AI compatibles con RAI 1.9.0; no es portable a GPU o CPU sin conversion adicional.
- Sin datos de benchmarks ni de latencia en NPU; dificil justificar su eleccion frente al modelo original sin mediciones propias.
- Repositorio con muy baja adopcion (1 descarga, 0 likes) y actualizado una sola vez; sin garantia de mantenimiento.
- No dispone de tool calling nativo verificado ni capacidades multimodales.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Meta-Llama-3-8B_rai_1.9.0_m_1.0.1_npu
- Modelo base Meta Llama 3 8B: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Ryzen AI (AMD): https://www.amd.com/en/products/software/ryzen-ai.html
- Licencia Llama 3: https://llama.meta.com/llama3/license/
