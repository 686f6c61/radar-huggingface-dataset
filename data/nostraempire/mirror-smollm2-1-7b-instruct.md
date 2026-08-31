# NostraEmpire/mirror-smollm2-1.7b-instruct

## Resumen

El modelo `NostraEmpire/mirror-smollm2-1.7b-instruct` es un espejo (mirror) del modelo `HuggingFaceTB/SmolLM2-1.7B-Instruct`, desarrollado originalmente por Hugging Face. Se trata de un modelo de lenguaje compacto de 1.700 millones de parámetros, diseñado para ejecutarse en dispositivos con recursos limitados (on-device) sin sacrificar demasiado rendimiento en tareas de instrucción, razonamiento, matemáticas y generación de código. El mirror ha sido subido por el usuario NostraEmpire y no introduce cambios respecto al original; su propósito es ofrecer una copia alternativa del checkpoint para facilitar su distribución o uso en determinadas regiones.

El modelo base SmolLM2-1.7B fue entrenado sobre 11 billones de tokens con una combinación de datasets como FineWeb-Edu, DCLM, The Stack y conjuntos propios de matemáticas y código. La versión instruct se obtuvo mediante fine-tuning supervisado (SFT) y optimización por preferencias directas (DPO) con UltraFeedback, lo que le permite seguir instrucciones, reescribir texto, resumir y realizar llamadas a funciones. Su arquitectura es un transformer decoder estándar, con una ventana de contexto que no se especifica en la información disponible, aunque el modelo original soporta 8192 tokens (dato no confirmado en esta ficha). La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (causal LM) |
| Parametros totales | 1.711.376.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo original soporta 8192, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors, onnx y transformers.js, pero no se listan cuantizaciones especificas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, onnx, transformers.js (segun tags del repo) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder convencional, sin innovaciones estructurales destacables. El entrenamiento del modelo base se realizo sobre 11 billones de tokens, combinando datasets publicos como FineWeb-Edu, DCLM y The Stack, junto con datasets propios de matematicas y codigo. Para la version instruct se aplico un proceso de dos fases: primero un fine-tuning supervisado (SFT) con datasets publicos y propios (incluido el dataset SmolTalk), y posteriormente una optimizacion por preferencias directas (DPO) utilizando el dataset UltraFeedback. Esta combinacion permite al modelo seguir instrucciones de forma robusta, reescribir texto, resumir y ejecutar llamadas a funciones, gracias a datasets especificos como Synth-APIGen-v0.1 de Argilla.

No se han publicado detalles sobre tecnicas de atencion lineal, decodificacion especulativa u otras innovaciones en la informacion disponible. El modelo es un mirror, por lo que sus caracteristicas tecnicas son identicas a las del checkpoint original de Hugging Face.

## Capacidades

- Generacion de texto y conversacion multi-turno con formato de chat.
- Seguimiento de instrucciones (instruction following) con buena precision en tareas como reescritura, resumen y extraccion de informacion.
- Razonamiento basico y matematicas (nivel elemental, con limitaciones en problemas complejos).
- Generacion de codigo y soporte de function calling (llamadas a funciones) gracias al entrenamiento con datasets como Synth-APIGen-v0.1.
- Capacidades multilingues limitadas: el modelo esta entrenado principalmente en ingles, aunque puede producir texto en otros idiomas con menor calidad.
- Compatible con Transformers, TRL CLI y Transformers.js para ejecucion en navegador o Node.js.

## Casos de uso

- Asistentes conversacionales en dispositivos moviles o edge: el modelo puede ejecutarse localmente en un telefono o Raspberry Pi gracias a su tamano reducido, ofreciendo respuestas a preguntas frecuentes o soporte basico sin conexion.
- Automatizacion de atencion al cliente: con su capacidad de seguir instrucciones y manejar conversaciones multi-turno, puede integrarse en chatbots para resolver consultas simples, derivando a un agente humano cuando sea necesario.
- Generacion de codigo en entornos de desarrollo: soporta function calling, por lo que puede usarse como autocompletado o asistente de codigo en editores, aunque su rendimiento en tareas complejas es inferior a modelos mas grandes.
- Resumen y reescritura de documentos: el modelo destaca en tareas de reescritura (OpenRewrite-Eval) y resumen, util para procesar correos, articulos o notas de forma automatica.
- Educacion y practica de idiomas: puede generar ejercicios, explicaciones sencillas o dialogos en ingles, sirviendo como tutor basico para estudiantes.
- Prototipado rapido de aplicaciones NLP: al ser ligero y con licencia Apache 2.0, es adecuado para validar ideas o construir demos sin necesidad de infraestructura potente.

## Benchmarks y rendimiento

Los resultados que se muestran a continuacion corresponden al modelo original `HuggingFaceTB/SmolLM2-1.7B-Instruct`, ya que el mirror es una copia exacta. Se evaluaron con lighteval en modo zero-shot salvo indicacion contraria.

| Metrica | SmolLM2-1.7B-Instruct | Llama-1B-Instruct | Qwen2.5-1.5B-Instruct | SmolLM1-1.7B-Instruct |
|---|---|---|---|---|
| IFEval (prompt/inst promedio) | **56.7** | 53.5 | 47.4 | 23.1 |
| MT-Bench | 6.13 | 5.48 | **6.52** | 4.33 |
| OpenRewrite-Eval (micro_avg RougeL) | 44.9 | 39.2 | **46.9** | NaN |
| HellaSwag | **66.1** | 56.1 | 60.9 | 55.5 |
| ARC (promedio) | **51.7** | 41.6 | 46.2 | 43.7 |
| PIQA | **74.4** | 72.3 | 73.2 | 71.6 |
| MMLU-Pro (MCF) | 19.3 | 12.7 | **24.2** | 11.7 |
| BBH (3-shot) | 32.2 | 27.6 | * (dato no disponible) | * |

El modelo supera a Llama-1B-Instruct en la mayoria de metricas y compite de cerca con Qwen2.5-1.5B-Instruct, aunque este ultimo es superior en MT-Bench y MMLU-Pro. En tareas de razonamiento comun (HellaSwag, ARC, PIQA) SmolLM2-1.7B-Instruct obtiene los mejores resultados entre los comparados.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,5 GB (los pesos del modelo ocupan unos 3,4 GB en FP16, mas overhead de activaciones y cache).
- Con cuantizacion a 8 bits: alrededor de 1,8 GB de VRAM; con 4 bits, menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas con suficiente memoria compartida). En CPU puede ejecutarse con 8 GB de RAM, aunque la latencia sera mayor.
- Es apto para consumer GPUs de gama baja y media, asi como para dispositivos edge (Jetson, Raspberry Pi 5 con 8 GB).
- Opciones de despliegue: Transformers con PyTorch, vLLM (si se convierte a formato compatible), llama.cpp (cuantizacion GGUF), Ollama, TGI (Text Generation Inference) y Transformers.js para entornos JavaScript.
- Latencia estimada: en una GPU RTX 4090, la generacion de 100 tokens puede rondar los 0,5-1 segundo; en CPU moderna, entre 5-10 segundos para la misma cantidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | IFEval | MT-Bench | MMLU-Pro |
|---|---|---|---|---|---|---|
| SmolLM2-1.7B-Instruct (este mirror) | 1,7B | no disponible | Apache 2.0 | 56.7 | 6.13 | 19.3 |
| Llama-1B-Instruct | 1B | no disponible | Llama license (uso comercial permitido) | 53.5 | 5.48 | 12.7 |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (segun documentacion oficial) | Apache 2.0 | 47.4 | 6.52 | 24.2 |

SmolLM2-1.7B-Instruct destaca en seguimiento de instrucciones (IFEval) y razonamiento comun, pero Qwen2.5-1.5B-Instruct ofrece mejor rendimiento en conversacion (MT-Bench) y conocimiento general (MMLU-Pro). Llama-1B-Instruct es inferior en casi todas las metricas, aunque su licencia puede ser mas restrictiva para ciertos usos comerciales.

## Limitaciones y advertencias

- Al ser un modelo de 1,7B, su capacidad de razonamiento complejo y conocimiento enciclopedico es limitada; puede fallar en tareas que requieren multiples pasos logicos o informacion muy especializada.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas de actualidad o datos numericos.
- Sesgos: entrenado principalmente con datos en ingles y de fuentes como FineWeb-Edu y The Stack, puede reflejar sesgos presentes en esos corpus (genero, raza, cultura).
- Limitaciones de idioma: aunque puede producir texto en otros idiomas, su rendimiento fuera del ingles es significativamente inferior.
- Contexto limitado: la ventana de contexto no se especifica en la informacion disponible, pero al ser un modelo pequeno, es probable que no supere los 8K tokens, lo que restringe el manejo de documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero no se proporciona garantia ni soporte oficial por parte del autor del mirror.
- Para produccion, se recomienda validar el comportamiento en el dominio especifico y considerar tecnicas de mitigacion de alucinaciones (por ejemplo, verificacion externa de hechos).

## Enlaces

- Repositorio del mirror en Hugging Face: https://huggingface.co/NostraEmpire/mirror-smollm2-1.7b-instruct
- Modelo original en Hugging Face: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Modelo base (no instruct): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Repositorio oficial de SmolLM en GitHub: https://github.com/huggingface/smollm
- Paper del modelo (arXiv): https://arxiv.org/abs/2502.02737v1
- Dataset de SFT (SmolTalk): https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset de DPO (UltraFeedback): https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Dataset de function calling (Synth-APIGen-v0.1): https://huggingface.co/datasets/argilla/Synth-APIGen-v0.1
