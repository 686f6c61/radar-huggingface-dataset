# mradermacher/Llama-3.1-8B-Instruct-abliterated-bf16-public-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `ashwin-sreedhar/Llama-3.1-8B-Instruct-abliterated-bf16-public`, una variante "abliterated" de Llama-3.1-8B-Instruct. La abliteración es una técnica de modificación de pesos que elimina la dirección de rechazo en el espacio de activaciones del modelo, de modo que el modelo deja de negarse a responder a ciertas peticiones que el modelo original filtraría. El trabajo de cuantización lo firma mradermacher, un conocido generador de cuantizaciones GGUF para la comunidad.

El modelo base subyacente es Llama-3.1-8B-Instruct, un transformer denso de 8.030.261.312 parámetros desarrollado por Meta, con una ventana de contexto de 128.000 tokens y licencia Llama 3.1. Esta variante conserva la arquitectura y el entrenamiento originales; la única diferencia es la intervención sobre los pesos para eliminar el comportamiento de rechazo. El repositorio añade los formatos GGUF necesarios para ejecutar el modelo con llama.cpp y derivados (Ollama, LM Studio, etc.).

La relevancia de este artefacto es doble: por un lado, permite ejecutar un modelo de 8B en hardware de consumo con cuantizaciones que van desde 3,3 GB (Q2_K) hasta 16,2 GB (f16); por otro, documenta un caso de uso controvertido —la eliminación de salvaguardas— que conviene evaluar con cuidado antes de desplegarlo en producción. La model card es puramente técnica y no incluye información sobre el proceso de abliteración, los datos de entrenamiento ni evaluaciones de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), basado en el modelo original de Meta |
| Parámetros totales | 8.030.261.312 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3.1 soporta 128.000 tokens) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en bf16 |

## Arquitectura y entrenamiento

La arquitectura corresponde a Llama-3.1-8B-Instruct: un transformer decoder-only denso con atención por grupos (GQA), RoPE y las optimizaciones introducidas por Meta en la familia Llama 3.1. El modelo original fue entrenado por Meta con un corpus multilingüe de gran escala y posteriormente alineado mediante SFT y RLHF/DPO para seguir instrucciones y mantener un comportamiento de rechazo ante peticiones dañinas.

La modificación "abliterated" consiste en identificar la dirección de activación asociada al rechazo y proyectarla fuera de los pesos, de forma que el modelo pierde esa tendencia a negarse. No se dispone en la información proporcionada de detalles sobre el método exacto, el número de capas intervenidas ni las métricas de evaluación del proceso. El repositorio de mradermacher no reentrena el modelo: solo convierte los pesos bf16 del modelo base a GGUF y genera las distintas cuantizaciones estáticas listadas. Existe además un repositorio paralelo con cuantizaciones ponderadas/imatrix (`...-i1-GGUF`) para quien prefiera ese tipo de cuantización.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-3.1-8B-Instruct.
- Razonamiento de propósito general y respuesta a instrucciones multi-turno.
- Generación de código y tareas de matemáticas básicas, con el rendimiento propio de un modelo de 8B.
- Comportamiento "abliterated": ausencia del patrón de rechazo del modelo original ante peticiones que este filtraría.
- Ejecución local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, KoboldCpp, etc.).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo "thinking" específicas de esta variante.

## Casos de uso

- Investigación sobre alineación y seguridad: estudiar cómo cambia el comportamiento de un modelo al eliminar la dirección de rechazo, comparando respuestas con el Llama-3.1-8B-Instruct original en un entorno controlado.
- Evaluación de robustez de filtros: probar sistemas de moderación y clasificadores de contenido frente a un modelo que no se autocensura, para medir la eficacia de las capas de seguridad externas.
- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M (5,0 GB) o Q5_K_M (5,8 GB) cabe en GPUs de 8 GB de VRAM, lo que permite experimentar con un 8B en un portátil o estación de trabajo modestas.
- Generación creativa sin restricciones de estilo: escritura de ficción, guiones o diálogos donde el modelo original podría rechazar temáticas oscuras o controvertidas, siempre con revisión humana posterior.
- Prototipado rápido de asistentes conversacionales en inglés: usar la cuantización Q8_0 (8,6 GB) para obtener la mejor calidad dentro de GGUF y validar flujos de conversación antes de pasar a un modelo mayor.
- Docencia y demostraciones: ilustrar en un curso o taller el funcionamiento de la cuantización GGUF y el efecto de la abliteración sobre las respuestas, con un modelo que se ejecuta en una sola GPU.
- Pruebas de red teaming internas: generar respuestas adversarias para entrenar clasificadores o mejorar políticas de uso en un producto, en un entorno aislado y con las salvaguardas externas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, y tampoco se aportan datos del modelo base abliterated más allá de su identificador.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~3,3 GB; Q3_K_M ~4,1 GB; IQ4_XS ~4,6 GB; Q4_K_M ~5,0 GB; Q5_K_M ~5,8 GB; Q6_K ~6,7 GB; Q8_0 ~8,6 GB; f16 ~16,2 GB. Añadir margen para el contexto KV cache (crece con la longitud de contexto configurada).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100/H100 para f16 o serving concurrente.
- Cabe en GPU de consumo: sí, desde una GTX 1060 6 GB con Q2_K/Q3_K_S hasta una RTX 4090 con Q8_0 o f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; el modelo base también puede servirse con vLLM o TGI en formato bf16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Llama-3.1-8B-Instruct-abliterated, GGUF) | 8,03 B | no disponible (base: 128k) | llama3.1 | GGUF | Variante abliterated, solo inglés |
| Llama-3.1-8B-Instruct (Meta) | 8,03 B | 128k | llama3.1 | safetensors, GGUF | Modelo original con salvaguardas |
| Otras variantes abliterated de 8B (p. ej. huihui-ai/Llama-3.1-8B-Instruct-abliterated) | ~8 B | 128k | llama3.1 | safetensors, GGUF | Alternativas comunitarias con el mismo enfoque |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32k | Apache 2.0 | safetensors, GGUF | Licencia permisiva, multilingüe |

## Limitaciones y advertencias

- La abliteración elimina el comportamiento de rechazo del modelo original; esto puede producir respuestas a peticiones dañinas, ilegales o inseguras. No es apto para exposición directa a usuarios finales sin capas de moderación externas.
- Riesgo elevado de alucinación, inherente a los modelos de 8B y no mitigado por la modificación.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia Llama 3.1: impone restricciones de uso (política de uso aceptable de Meta) y obligaciones de atribución; conviene revisar los términos antes de un uso comercial. La modificación de pesos no exime de cumplir la licencia del modelo base.
- El repositorio se marca como "experimental" y no incluye evaluaciones de calidad ni de seguridad; la ficha del modelo base abliterated tampoco está documentada en la información disponible.
- No se dispone de información sobre el proceso de abliteración (capas afectadas, métricas de degradación), por lo que no puede evaluarse la pérdida de capacidades respecto al original.
- El tamaño del repositorio (71,8 GB) incluye todas las cuantizaciones; descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-abliterated-bf16-public-GGUF
- Modelo base: https://huggingface.co/ashwin-sreedhar/Llama-3.1-8B-Instruct-abliterated-bf16-public
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-abliterated-bf16-public-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Llama-3.1-8B-Instruct-abliterated-bf16-public-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo original Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
