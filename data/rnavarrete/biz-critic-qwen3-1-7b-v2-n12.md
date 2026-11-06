# rNavarrete/biz-critic-qwen3-1.7b-v2-n12

## Resumen

`rNavarrete/biz-critic-qwen3-1.7b-v2-n12` es un ajuste fino (fine-tuning) del modelo Qwen3-1.7B, publicado por el usuario rNavarrete en Hugging Face. Se trata de un modelo de generacion de texto de pequeno tamano (1.700 millones de parametros) derivado de la version cuantizada en 4 bits de Unsloth (`unsloth/Qwen3-1.7B-unsloth-bnb-4bit`), entrenado con la libreria Unsloth y TRL. El nombre del repositorio sugiere un proposito de critica o evaluacion de negocios ("biz-critic"), aunque la model card no documenta la tarea concreta ni el dataset de entrenamiento.

El modelo hereda la arquitectura transformer de la familia Qwen3, con soporte nativo de tool calling, razonamiento multi-paso y modo "thinking" segun las capacidades de la familia base. Al estar basado en Qwen3-1.7B, ofrece un contexto nativo de 32.768 tokens (extensible hasta 131.072 mediante YaRN en la familia Qwen3, aunque no se confirma en esta ficha). Es relevante para desarrolladores que necesiten un modelo ligero, desplegable en GPU de consumo, con licencia Apache 2.0 permisiva y capacidad de ejecutarse en entornos con recursos limitados.

La informacion publicada es muy escasa: la model card es practicamente la plantilla generada automaticamente por Unsloth, sin detalles sobre dataset, hiperparametros, evaluacion ni limitaciones. Esto condiciona la ficha: muchos campos se marcan como "no disponible" y las capacidades descritas se infieren de la familia base Qwen3, no de documentacion especifica del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (la familia Qwen3-1.7B soporta 32.768 tokens nativos, extensible a 131.072 con YaRN) |
| Tipos de cuantizacion | no disponible en el repo; el modelo base es bnb-4bit (bitsandbytes 4 bits). Compatible con GGUF/AWQ/GPTQ via herramientas externas, no confirmado por el autor |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0.1 GB, coherente con pesos en 4 bits o pre-cuantizados) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `unsloth/Qwen3-1.7B-unsloth-bnb-4bit`, que a su vez es una version cuantizada en 4 bits (bitsandbytes) del Qwen3-1.7B original de Alibaba. La arquitectura subyacente es un transformer decoder-only con atencion por grupos (GQA) y las innovaciones propias de Qwen3: modo de razonamiento hibrido (thinking/no-thinking) y soporte de tool calling. El entrenamiento se realizo con Unsloth y TRL, segun los tags del repositorio (`unsloth`, `trl`), lo que indica uso de LoRA/QLoRA o fine-tuning completo acelerado por Unsloth. El autor afirma que el modelo "fue entrenado 2x mas rapido con Unsloth".

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, la tasa de aprendizaje ni la configuracion de LoRA. La model card no documenta hiperparametros ni evaluacion. El nombre "biz-critic" y el sufijo "v2-n12" sugieren una segunda version con 12 muestras o 12 pasos de entrenamiento, pero es especulacion: el autor no lo confirma. Tampoco se documenta si el fine-tuning conserva el modo thinking de Qwen3 o si lo ha desactivado.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado en la model card).
- Razonamiento y respuesta a instrucciones, heredados de Qwen3-1.7B.
- Soporte de tool calling / function calling (capacidad de la familia base, no verificada en este fine-tuning).
- Razonamiento multi-paso y agentes (capacidad de la familia base, no verificada).
- Modo "thinking" hibrido (capacidad de Qwen3, no confirmada tras el fine-tuning).
- Capacidad de critica o evaluacion de contenido de negocio (inferida del nombre "biz-critic", no documentada).
- Capacidades multilingues limitadas: solo se declara ingles; Qwen3 base soporta mas idiomas, pero el fine-tuning puede haber reducido esta cobertura.

## Casos de uso

- Clasificacion y critica de textos de negocio: dado el nombre "biz-critic", el modelo podria emplearse para evaluar propuestas, pitches o descripciones de producto y emitir una valoracion estructurada. Requiere validacion empirica porque el autor no documenta la tarea.
- Prototipado rapido en local: con 1.7B parametros y pesos en 4 bits (repo de 0.1 GB), cabe en GPUs de consumo (8-12 GB VRAM) y permite iterar en portatiles con GPU discreta.
- Generacion de texto asistida en ingles: redaccion de borradores, resumenes y respuestas en ingles dentro de aplicaciones con requisitos de baja latencia.
- Evaluacion automatizada de respuestas: uso como "juez" o critico en pipelines de evaluacion de otros modelos, aprovechando la licencia Apache 2.0 y el bajo coste de inferencia.
- Fine-tuning ulterior: al ser un modelo pequeno y con licencia permisiva, sirve como punto de partida para ajustes especificos en dominios de negocio.
- Despliegue en entornos con recursos limitados: integracion en servicios edge o contenedores pequenos mediante llama.cpp/Ollama (previa conversion a GGUF) o TGI.
- Experimentacion academica: comparacion de estrategias de fine-tuning con Unsloth/TRL sobre modelos pequenos de la familia Qwen3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones (MMLU, HumanEval, GSM8K ni ninguna otra) ni comparaciones con el modelo base. Tampoco se documenta la perdida de entrenamiento ni metricas de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en 4 bits, 3,5 GB en FP16 (solo pesos; sumar KV cache y overhead).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060/4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna (GTX 1650 4 GB en adelante con cuantizacion).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), llama.cpp/Ollama tras conversion a GGUF, vLLM (compatible con arquitectura Qwen3).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rNavarrete/biz-critic-qwen3-1.7b-v2-n12 | 1.7B | no disponible (familia Qwen3: 32.768) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1.7B | 32.768 (extensible a 131.072 con YaRN) | Apache 2.0 | Hugging Face, Ollama |
| meta-llama/Llama-3.2-1B | 1.2B | 131.072 | Llama 3.2 Community License | Hugging Face, Ollama |
| google/gemma-2-2b | 2.6B | 8.192 | Gemma Terms of Use | Hugging Face, Ollama |

No se dispone de datos de rendimiento comparativo porque el autor no ha publicado benchmarks. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card es la plantilla automatica de Unsloth; no hay dataset, hiperparametros, evaluacion ni limitaciones declaradas.
- Riesgo de alucinacion: inherente a modelos de 1.7B; mayor que en modelos de mayor tamano.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Sesgos: no documentados; hereda los sesgos de los datos de preentrenamiento de Qwen3 y del dataset de fine-tuning (desconocido).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo base Qwen3-1.7B tambien es Apache 2.0, lo que evita restricciones adicionales.
- Modelo base cuantizado en 4 bits: el fine-tuning parte de una version bnb-4bit, lo que puede introducir perdida de calidad respecto al modelo original en FP16/BF16.
- Sin validacion en produccion: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso real.
- Fecha de creacion futura (2026-11-01): inconsistencia en los metadatos que conviene verificar.
- No se confirma que conserve el modo thinking ni el tool calling de Qwen3 tras el fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rNavarrete/biz-critic-qwen3-1.7b-v2-n12
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-1.7B-unsloth-bnb-4bit
- Modelo original Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Repositorio TRL: https://github.com/huggingface/trl
