# llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved

## Resumen

El modelo `llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved` es una variante desensurada (decensored) del modelo multimodal Qwen3.8-27B de Alibaba, creada por el usuario independiente llmfan46 mediante la técnica de abliteration con la herramienta Heretic v2.0.0.dev0 y una variante del método Magnitude-Preserving Orthogonal Ablation (MPOA). El objetivo es eliminar los rechazos y restricciones de contenido del modelo original, reduciendo las negativas de 91/100 a 3/100, manteniendo una divergencia KL de 0.0244 respecto al modelo base, lo que indica una alteración mínima de los pesos.

El modelo conserva íntegros los 15 módulos de Multi-Token Prediction (MTP) del original, lo que permite mantener la capacidad de predicción de múltiples tokens por paso. Con 27.356 millones de parámetros, es un modelo denso multimodal (imagen y texto) que hereda las capacidades del Qwen3.8-27B: razonamiento, codificación, visión, agentes y tool calling. Su relevancia radica en ofrecer una alternativa sin censura para investigación y aplicaciones que requieren generación de contenido sin restricciones, aunque con implicaciones éticas y de seguridad que deben considerarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (basado en Qwen3.8-27B) con MTP (Multi-Token Prediction) |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens (segun documentacion del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es multilingue, pero no se especifica la lista en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso multimodal nativo de Alibaba que procesa tanto texto como imagenes (pipeline `image-text-to-text`). La arquitectura incluye un head de Multi-Token Prediction (MTP) con 15 modulos que permiten predecir varios tokens futuros por paso, mejorando la eficiencia de decodificacion. El proceso de desensurado se realizo con Heretic v2.0.0.dev0, aplicando una variante de MPOA (Magnitude-Preserving Orthogonal Ablation) sobre tres componentes especificos: `attn.o_proj`, `attn.out_proj` y `mlp.down_proj`. Esta ablacion ortogonal elimina la direccion de rechazo en el espacio de pesos, reduciendo las respuestas de negativa sin degradar significativamente la calidad general (divergencia KL de 0.0244). Los 15 MTPs se preservaron intactos, tanto en el modelo original como en el desensurado, segun la lista proporcionada en la model card. No se dispone de informacion sobre el dataset de entrenamiento adicional ni sobre procesos de RLHF/DPO especificos para esta variante.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del Qwen3.8-27B, incluyendo razonamiento logico, matematicas y comprension de contexto largo (262K tokens).
- Codificacion: soporta generacion y analisis de codigo en multiples lenguajes, con buen rendimiento en tareas de programacion.
- Vision multimodal: procesa imagenes y texto, con comprension de fotogramas de video (segun el modelo base).
- Tool calling y agentes: compatible con flujos agenciales y llamadas a funciones, util para automatizacion de tareas.
- Multi-Token Prediction (MTP): los 15 modulos MTP estan intactos, lo que permite una decodificacion mas rapida y coherente.
- Capacidad desensurada: reduce los rechazos de 91/100 a 3/100, permitiendo respuestas a solicitudes que el modelo original bloquearia (con los riesgos eticos asociados).
- Razonamiento controlable: el modelo base soporta modos de razonamiento ajustables, aunque no se confirma si esta variante los mantiene.

## Casos de uso

- Investigacion en alineacion y seguridad de IA: permite estudiar el comportamiento de modelos sin restricciones de contenido, analizando sesgos, alucinaciones y dinamicas de rechazo en entornos controlados.
- Generacion creativa sin censura: util para escritura de ficcion, guiones o contenido artistico que requiera explorar temas sensibles sin las limitaciones del modelo original.
- Analisis de texto con contenido delicado: procesamiento de documentos legales, medicos o historicos que contengan lenguaje explicito o temas tabu, donde el modelo original rechazaria la tarea.
- Desarrollo de agentes conversacionales especializados: creacion de asistentes para nichos donde se requiere respuestas directas sin evasivas, como soporte tecnico avanzado o simulacion de personajes.
- Evaluacion de robustez de modelos: comparacion de rendimiento entre versiones censuradas y desensuradas para medir el impacto de la abliteration en tareas estandar (MMLU, HumanEval, etc.).
- Automatizacion de oficina y codificacion: al heredar las capacidades del Qwen3.8-27B, puede usarse en pipelines de generacion de codigo, resumen de documentos y flujos agenciales, aunque con la ventaja de no rechazar solicitudes complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este modelo desensurado. La model card solo incluye datos del modelo original Qwen3.8-27B, que obtuvo una precision del 83,42% en MMLU (5857/7021 respuestas correctas). No hay informacion sobre el rendimiento del modelo desensurado en MMLU ni en otras pruebas estandar. La unica metrica de calidad proporcionada es la divergencia KL de 0.0244 respecto al original, que sugiere una alteracion minima de los pesos.

| Metrica | Modelo desensurado | Modelo original (Qwen3.8-27B) |
|---|---|---|
| Divergencia KL | 0.0244 | 0 (por definicion) |
| Rechazos (sobre 100 solicitudes) | 3/100 | 91/100 |
| MMLU (accuracy) | No disponible | 83,42% |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo requiere aproximadamente 55 GB de VRAM (27,36B parametros × 2 bytes). Con cuantizacion de 8 bits, ~28 GB; con 4 bits, ~14 GB. Sin embargo, este repositorio no incluye versiones cuantizadas, por lo que habria que generarlas o usar el modelo base cuantizado.
- GPU recomendadas: para FP16, una A100 80GB o H100 80GB. Para cuantizacion 4-bit, una RTX 4090 (24GB) o similar podria ser suficiente, pero no hay archivos GGUF publicados en este repo.
- Compatibilidad con GPU de consumo: posible con cuantizacion agresiva (4-bit) en GPUs de 24GB, pero no se proporcionan pesos cuantizados.
- Opciones de despliegue: al ser safetensors, se puede cargar con transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay integraciones preconfiguradas.
- Latencia y throughput: no disponible. Dependera del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,36B | 262K | Apache-2.0 | Modelo base, con censura (91/100 rechazos) |
| llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved | 27,36B | 262K | Apache-2.0 | Version desensurada, 3/100 rechazos, MTP intactos |
| Qwen3.8-27B-Uncensored-GGUF (dealignai) | 27,36B | 262K | Apache-2.0 (research-only) | Otra variante desensurada con cuantizaciones GGUF, segun blog de orcarouter |

No se dispone de datos de rendimiento comparativo entre estas variantes. La principal diferencia es el metodo de abliteration y la preservacion de los MTPs en el modelo de llmfan46.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una version desensurada, puede generar contenido inapropiado, ofensivo o falso con mayor facilidad, ya que no tiene los filtros de seguridad del modelo original. La abliteration no elimina los sesgos subyacentes del modelo base.
- Riesgo de uso indebido: la ausencia de rechazos facilita la generacion de contenido malicioso, desinformacion o material ilegal. No debe usarse en produccion sin salvaguardas externas.
- Degradacion potencial del rendimiento: aunque la divergencia KL es baja (0.0244), la ablacion de componentes puede afectar tareas especificas no evaluadas en la model card. No hay benchmarks publicados del modelo desensurado.
- Limitaciones de contexto e idioma: la longitud de contexto de 262K es heredada del modelo base, pero no se ha verificado su funcionamiento en esta variante. Los idiomas soportados no estan documentados.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el blog de orcarouter menciona que algunas variantes desensuradas tienen restricciones "research-only". En este caso, la model card indica Apache-2.0 sin restricciones adicionales, aunque se recomienda verificar.
- Soporte limitado: el autor es un contribuyente independiente con recursos limitados (segun el aviso en la model card), por lo que el mantenimiento y la documentacion pueden ser escasos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog sobre Qwen3.8-27B Uncensored GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Articulo comparativo en HackerNoon: https://hackernoon.com/qwen38-27b-uncensored-vs-other-qwen-gguf-models
- Perfil del autor llmfan46: https://huggingface.co/llmfan46/models
