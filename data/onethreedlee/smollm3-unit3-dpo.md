# onethreedlee/smollm3-unit3-dpo

## Resumen

smollm3-unit3-dpo es un ajuste fino por preferencias del modelo HuggingFaceTB/SmolLM3-3B, publicado por el usuario onethreedlee en HuggingFace. Se trata de un modelo de generacion de texto de tipo decoder-only con 3.075.098.624 parametros (unos 3,08 mil millones), obtenido mediante DPO (Direct Preference Optimization) sobre el checkpoint base, sin cambios arquitectonicos aparentes.

El modelo ha sido entrenado con la libreria TRL (version 0.22.2) de HuggingFace, empleando el algoritmo DPO descrito en el paper de Rafailov et al. (2023). Su proposito es alinear las respuestas del modelo base con preferencias humanas, mejorando el comportamiento conversacional respecto al checkpoint original.

Es relevante principalmente como ejemplo reproducible de un pipeline de alineacion con TRL y DPO sobre un modelo pequeno de ultima generacion. No obstante, la informacion publicada es muy limitada: no se detallan el dataset de preferencias, el numero de pasos, los hiperparametros ni resultados de evaluacion, y el repositorio no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM3-3B) |
| Parametros totales | 3.075.098.624 (~3,08 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base SmolLM3-3B declara 64K tokens nativos (128K con YaRN) |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base SmolLM3-3B: un transformer decoder-only de 3,08 mil millones de parametros con atencion por consultas agrupadas (GQA) y una combinacion de capas con RoPE y sin embeddings posicionales (NoPE), disenada para favorecer la generalizacion en longitudes de contexto. Este ajuste no modifica dicha arquitectura; unicamente altera los pesos mediante entrenamiento por preferencias.

El entrenamiento se realizo con DPO, un metodo de optimizacion directa de preferencias que evita entrenar un modelo de recompensa explicito y optimiza directamente la politica frente a pares de respuestas preferidas y rechazadas. La model card no especifica el dataset de preferencias, el numero de tokens o ejemplos utilizados, la composicion del corpus, la duracion del entrenamiento ni los hiperparametros (beta, learning rate, numero de epocas). La unica informacion tecnica disponible son las versiones del stack: TRL 0.22.2, Transformers 4.56.2, PyTorch 2.8.0, Datasets 4.8.5 y Tokenizers 0.22.2. No se documenta ninguna innovacion adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto: capacidad confirmada por el pipeline declarado (text-generation) y por el ejemplo de uso de la model card.
- Dialogo conversacional: el tag `conversational` y el ejemplo con formato de mensajes (`{"role": "user", "content": ...}`) confirman el soporte de conversaciones de un solo turno o multi-turno.
- Razonamiento, generacion de codigo, matematicas y capacidades multilingues: serian heredadas del modelo base SmolLM3-3B, pero no estan verificadas ni documentadas especificamente para este ajuste.
- Tool calling / function calling: no confirmado para este fine-tune en la informacion disponible.
- Uso como agente y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo de razonamiento explicito (thinking mode): no documentado para este ajuste, aunque el modelo base SmolLM3-3B lo incorpora.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Generacion de texto conversacional en prototipos: el modelo puede emplearse con `transformers.pipeline("text-generation")` para responder a preguntas de un unico turno, como ilustra la propia model card, lo que resulta adecuado para validar rapidamente un flujo de inferencia GPT-like sin infraestructura compleja.
- Investigacion en alineacion y DPO: sirve como referencia reproducible de un entrenamiento DPO con TRL sobre un modelo de ~3B, util para estudiar efectos del ajuste por preferencias en modelos pequenos.
- Base para posteriores ajustes: al ser un checkpoint ya alineado por preferencias, puede utilizarse como punto de partida para fine-tuning supervisado adicional (SFT) o nuevos ciclos de DPO/ORPO.
- Experimentos con cuantizacion: al tratarse de un modelo de ~3,08B, es candidato a convertirse a GGUF o GPTQ y desplegarse en entornos con recursos limitados para comparar calidad frente al modelo base.
- Evaluacion comparativa base vs. alineado: permite medir en que grado el ajuste DPO modifica el comportamiento del SmolLM3-3B original en tareas de dialogo, tono y rechazo.
- Chatbots de baja latencia en local: con una cuantizacion INT4 cabria en GPUs de consumo y podria alimentar asistentes personales offline, siempre que se acepte la ausencia de benchmarks publicados.
- Docencia y formacion: util como caso de estudio de un pipeline completo de DPO documentado con las versiones exactas del stack (TRL, Transformers, PyTorch).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 3,08B parametros):
  - FP32: en torno a 12-13 GB.
  - FP16/BF16: en torno a 6-7 GB, mas cache KV y estados de activacion.
  - INT8: en torno a 3,5-4 GB.
  - INT4: en torno a 2-2,5 GB.
- GPU recomendadas: para FP16/BF16, una NVIDIA RTX 3090, RTX 4090, A10G, L4 o A100 serian suficientes; para lotes grandes, A100 80 GB o H100 aportan margen adicional.
- GPU de consumo: si cabe en GPUs de gama media-alta con al menos 8-12 GB de VRAM (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) usando FP16 o cuantizacion INT4/INT8; en GPUs con 6 GB seria necesaria cuantizacion agresiva.
- Opciones de despliegue: transformers (nativo, soportado por la model card), vLLM y TGI para servidores de alto throughput, llama.cpp/Ollama previa conversion a GGUF (no publicada en el repositorio), y endpoints de HuggingFace (el repositorio esta marcado como `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles. No se aportan mediciones de tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| smollm3-unit3-dpo | 3,08B | no disponible (base: 64K nativos / 128K con YaRN) | no disponible | no disponible | Ajuste DPO sin benchmarks publicados |
| SmolLM3-3B (base) | 3,08B | 64K nativos, 128K con YaRN | Apache 2.0 (segun el modelo base) | Ingles, frances, aleman, espanol, italiano y portugues (segun el modelo base) | Modelo base oficial de HuggingFaceTB, con datos de entrenamiento y evaluacion publicados |
| Qwen2.5-3B | 3,09B | 32K (extensible con YaRN) | Apache 2.0 (segun la model card de Qwen) | Multilingue (decenas de idiomas, segun Qwen) | Alternativa comparable en tamano, con benchmarks publicos |
| Llama-3.2-3B | 3,21B | 128K | Llama 3.2 Community License | Ingles y varios idiomas adicionales (segun Meta) | Alternativa con amplio ecosistema de despliegue y evaluacion |

Nota: los datos de los modelos comparativos corresponden a informacion publica de sus respectivas model cards; la comparativa se ofrece como referencia de categoria, no como evaluacion del ajuste DPO de onethreedlee.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse, no puede asumirse permiso de uso comercial. Es imprescindible aclararlo con el autor antes de cualquier despliegue en produccion.
- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste DPO mejore al modelo base ni de que no lo degrade en tareas concretas.
- Dataset de preferencias no documentado: se desconoce la composicion, el origen y el posible sesgo de los pares utilizados en el entrenamiento, lo que dificulta auditar sesgos.
- Riesgo de alucinacion: inherente a los modelos de ~3B parametros; sin evaluacion especifica no puede cuantificarse.
- Sesgos conocidos: no disponibles; al no documentarse el corpus de alineacion, no puede descartarse la amplificacion de sesgos presentes en el modelo base o en los datos DPO.
- Limitaciones de contexto e idioma: no declaradas para este ajuste; dependen de las del modelo base SmolLM3-3B y no estan verificadas tras el DPO.
- Repositorio sin validacion comunitaria: cero descargas y cero likes en el momento de la ficha, sin issues ni discusiones publicas.
- Tamano del repositorio (184,5 GB) muy superior al de un checkpoint de 3B en precision completa, lo que sugiere la presencia de multiples copias o artefactos de entrenamiento; conviene revisar el contenido antes de descargarlo.
- Compatibilidad: el modelo esta marcado como `endpoints_compatible`, pero no se documenta soporte en vLLM, llama.cpp u otros motores, por lo que su integracion requeriria pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/onethreedlee/smollm3-unit3-dpo
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de DPO (Rafailov et al., 2023): https://huggingface.co/papers/2305.18290
- Paper de DPO en NeurIPS: http://papers.nips.cc/paper_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference.html
