# amd/Llama-2-7b-hf_rai_1.9.0_m_1.0.1_npu

## Resumen

El modelo `amd/Llama-2-7b-hf_rai_1.9.0_m_1.0.1_npu` es una distribucion optimizada de Llama 2 7B publicada por AMD en HuggingFace, empaquetada en formato ONNX y preparada especificamente para ejecutarse sobre las NPU (unidades de procesamiento neuronal) de las plataformas Ryzen AI. No se trata de un modelo nuevo entrenado desde cero, sino de una conversion del checkpoint original de Meta Llama 2 7B a un grafo ONNX compatible con el runtime Ryzen AI 1.9.0 y el modelo de compilacion `m_1.0.1_npu`.

El interes de esta publicacion es practico: permite desplegar un modelo de lenguaje de 7.000 millones de parametros en hardware de PC con aceleracion NPU integrada (procesadores AMD Ryzen con arquitectura XDNA), sin depender exclusivamente de GPU dedicada. Esto abre la puerta a inferencia local en portatiles y mini-PC con un consumo energetico contenido, algo relevante para escenarios de privacidad de datos y despliegue en el borde.

La ficha se basa unicamente en la informacion disponible en la pagina de HuggingFace y en el conocimiento publico del modelo base Llama 2. Los detalles especificos del proceso de cuantizacion, los benchmarks en NPU y las metricas de rendimiento del binario ONNX no estan documentados en la informacion proporcionada y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), exportado a ONNX para NPU Ryzen AI |
| Parametros totales | 7.000 millones (modelo base Llama 2 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 2 soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repo ocupa 4,0 GB, lo que sugiere pesos en precision reducida, probablemente int8 o similar, pero no se confirma) |
| Idiomas soportados | ingles (segun el campo `language: en` del repo) |
| Licencia | Llama 2 Community License (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | ONNX (optimizado para NPU Ryzen AI, runtime RAI 1.9.0, modelo `m_1.0.1_npu`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B de Meta: un transformer decoder-only con 32 capas, atencion multi-cabeza con RoPE (Rotary Position Embeddings), normalizacion RMSNorm y activacion SwiGLU, entrenado sobre aproximadamente 2 billones de tokens segun la documentacion publica de Meta. El checkpoint original fue sometido a fine-tuning supervisado y RLHF (concretamente rechazo de preferencias humanas y optimizacion de recompensa) antes de su publicacion en julio de 2023.

Lo que distingue a esta publicacion de AMD no es el entrenamiento, sino el pipeline de despliegue: el modelo se ha convertido a un grafo ONNX y se ha empaquetado para el runtime Ryzen AI 1.9.0 con el modelo de compilacion `m_1.0.1_npu`, que traduce las operaciones del transformer a instrucciones ejecutables en la NPU XDNA de los procesadores Ryzen. No se dispone de informacion sobre el esquema exacto de cuantizacion aplicado, el numero de tokens de calibracion ni las tecnicas de optimizacion (fusion de operadores, particionado entre CPU y NPU) empleadas en la conversion.

## Capacidades

- Generacion de texto autoregresiva en ingles, con calidad equivalente al modelo base Llama 2 7B (sujeta a las posibles perdidas por cuantizacion).
- Razonamiento basico y respuesta a preguntas sobre conocimiento general.
- Generacion de codigo en lenguajes populares, heredada del entrenamiento del modelo base.
- Aritmetica y matematicas de complejidad moderada.
- Conversacion multi-turno dentro de la ventana de contexto soportada por el modelo base.
- No se documenta soporte de tool calling o function calling nativo en esta distribucion.
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio.
- Capacidades multilingues limitadas: el campo de idioma del repo declara solo ingles, aunque el modelo base Llama 2 tiene cierto multilingueismo residual no garantizado.

## Casos de uso

- Inferencia local en portatiles Ryzen AI: desplegar un asistente de texto que corre enteramente en la NPU, liberando la GPU integrada y reduciendo el consumo energetico frente a ejecucion en CPU.
- Procesamiento de documentos confidenciales en el puesto de trabajo: resumen y extraccion de informacion de contratos o informes sin enviar datos a la nube, aprovechando que el modelo corre en hardware local.
- Generacion de codigo en entornos de desarrollo sin conectividad: autocompletado y explicacion de fragmentos de codigo dentro de un IDE local, con la NPU como acelerador dedicado.
- Prototipado de aplicaciones de IA en el borde: validar pipelines de generacion de texto sobre Ryzen AI antes de migrar a soluciones en servidor, usando el runtime RAI como capa de abstraccion.
- Chatbots de soporte en kioscos o dispositivos empotrados con Ryzen: atender consultas en ingles con baja latencia y sin dependencia de red.
- Educacion y demostraciones tecnicas: mostrar el funcionamiento de un LLM de 7B sobre NPU en talleres, con un coste de hardware mucho menor que una GPU dedicada.
- Benchmarking de NPU frente a CPU y GPU: usar esta distribucion como referencia para medir throughput y latencia del runtime Ryzen AI en cargas de generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La pagina de HuggingFace no incluye metricas de MMLU, HumanEval, GSM8K ni datos de latencia o throughput sobre NPU. Cualquier cifra de rendimiento del modelo base Llama 2 7B no seria directamente trasladable a esta distribucion sin conocer la cuantizacion aplicada y el particionado CPU/NPU.

## Requisitos de hardware

- Hardware objetivo: procesadores AMD Ryzen con NPU XDNA (familia Ryzen AI), con el runtime Ryzen AI 1.9.0 y el modelo de compilacion `m_1.0.1_npu` instalados.
- VRAM estimada: no disponible; el modelo se ejecuta sobre NPU y memoria del sistema, no sobre VRAM de GPU dedicada. El repo ocupa 4,0 GB, lo que da una cota inferior del espacio en disco necesario.
- GPU recomendadas: no aplica para esta distribucion; esta pensada para NPU. Para ejecutar el modelo base Llama 2 7B en GPU se necesitarian al menos 14-16 GB de VRAM en fp16, o 6-8 GB con cuantizacion de 4 bits.
- Cabe en GPU consumer: no es el objetivo de esta publicacion; el modelo base si cabe en GPUs como RTX 3060 12 GB o RTX 4090 con cuantizacion.
- Opciones de despliegue: runtime Ryzen AI con ONNX Runtime; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| amd/Llama-2-7b-hf_rai_1.9.0_m_1.0.1_npu | 7B | no disponible (base: 4096) | ONNX para NPU | NPU Ryzen AI | Llama 2 |
| meta-llama/Llama-2-7b-hf | 7B | 4096 | safetensors | GPU/CPU | Llama 2 |
| Mistral 7B (mistralai) | 7,3B | 8192 | safetensors, GGUF | GPU/CPU | Apache 2.0 |
| Qwen2.5 7B | 7,6B | 32768 | safetensors, GGUF | GPU/CPU | Apache 2.0 |

La comparativa directa es limitada: la distribucion de AMD no compite en calidad con los modelos de la tabla, sino en el canal de ejecucion (NPU frente a GPU/CPU). Frente al checkpoint original de Meta, la diferencia esta en el formato y el runtime, no en los pesos subyacentes. Frente a Mistral 7B o Qwen2.5 7B, Llama 2 7B queda por detras en contexto (4096 frente a 8192 y 32768) y en licencia (Llama 2 restringe el uso comercial a gran escala, mientras que Apache 2.0 no lo hace).

## Limitaciones y advertencias

- Acceso restringido: el repositorio esta gated y requiere aceptar la licencia Llama 2 en HuggingFace antes de la descarga.
- Licencia Llama 2: permite uso comercial con condiciones, incluida la obligacion de atribucion y restricciones para entidades con mas de 700 millones de usuarios mensuales; revisar el texto completo antes de produccion.
- Idiomas: el repo declara solo ingles; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Alucinacion: como todo LLM de 7B, tiene tendencia a inventar datos factuales, especialmente en tareas de conocimiento especifico o fechas.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Llama 2 (predominantemente web en ingles), con posibles sesgos de genero, raza y cultura.
- Contexto limitado: 4096 tokens en el modelo base, insuficiente para documentos largos o conversaciones extensas sin tecnicas de recuperacion.
- Cuantizacion no documentada: se desconoce la perdida de calidad introducida por la conversion a ONNX para NPU; conviene validar con un conjunto de evaluacion propio.
- Dependencia de hardware: el artefacto solo es utilizable en plataformas Ryzen AI con el runtime adecuado; no es portable a otros entornos sin reconversion.
- Sin benchmarks publicados: no hay evidencia publica de latencia ni calidad en NPU, lo que dificulta la planificacion de capacidad.
- Fecha de publicacion futura (2026-10-30): verificar que el repo y el runtime esten efectivamente disponibles antes de integrar en un proyecto.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Llama-2-7b-hf_rai_1.9.0_m_1.0.1_npu
- Modelo base Llama 2 7B: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Paper Llama 2: https://arxiv.org/abs/2307.09288
- Documentacion Ryzen AI: https://ryzenai.docs.amd.com/
- ONNX Runtime: https://onnxruntime.ai/
