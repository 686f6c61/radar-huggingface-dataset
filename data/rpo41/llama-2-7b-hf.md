# rpo41/Llama-2-7b-hf

## Resumen

Llama-2-7b-hf es la version base (no instruida) del modelo Llama 2 de 7 mil millones de parametros desarrollado por Meta AI, publicada originalmente en julio de 2023. Este repositorio concreto (rpo41/Llama-2-7b-hf) es una redistribucion de los pesos originales bajo la licencia Llama 2 Community License, con formato safetensors y PyTorch. El modelo resuelve la tarea de generacion de texto autoregresiva y sirve como base para fine-tuning supervisado, ajuste por instrucciones o entrenamiento con RLHF.

Arquitectura transformer decoder-only con 6.738.417.664 parametros (dato verificado en los safetensors del repositorio), contexto de 4096 tokens y tokenizador SentencePiece con vocabulario de 32.000 entradas. Es relevante como referencia historica del ecosistema open weights: fue uno de los primeros modelos de peso abierto con licencia permisiva para uso comercial (con restricciones) que habilito una oleada de fine-tunes y despliegues en produccion. Hoy su interes es principalmente educativo, de investigacion comparativa y como punto de partida para experimentos de ajuste fino.

El repositorio tiene 13,5 GB de tamano y 0 descargas en el momento de la consulta, lo que sugiere que se trata de un espejo secundario y no de la distribucion canonica de Meta. Para uso en produccion conviene acudir al repositorio oficial `meta-llama/Llama-2-7b-hf`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (autoregresivo) |
| Parametros totales | 6.738.417.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (los pesos se distribuyen en safetensors; existen cuantizaciones GGUF/AWQ/GPTQ de terceros para el modelo original) |
| Idiomas soportados | en (ingles) |
| Licencia | Llama 2 Community License Agreement |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

Llama 2 7B es un transformer decoder-only denso con atencion multi-cabeza, normalizacion RMSNorm pre-atencion, activacion SwiGLU en la capa feed-forward y embeddings rotatorios (RoPE) para la codificacion posicional. Emplea atencion causal estandar (no hay atencion lineal ni arquitectura hibrida SSM). El contexto maximo es de 4096 tokens y el tokenizador es SentencePiece con 32.000 tokens de vocabulario.

Segun el paper de referencia (arXiv:2307.09288), el modelo se entreno sobre 2 billones de tokens de datos publicos, con un aumento del 40 % en la proporcion de datos en ingles respecto a Llama 1. La version base no paso por RLHF ni por DPO; el ajuste por preferencias humanas se aplico unicamente a las variantes `-chat`. Meta reporto mejoras en robustez y seguridad respecto a Llama 1, pero la model card de este repositorio no incluye detalles adicionales sobre composicion exacta del dataset, regimen de entrenamiento ni hiperparametros.

## Capacidades

- Generacion de texto autoregresiva en ingles: completado de prompts, redaccion, resumen y parafraseo.
- Razonamiento basico y respuesta a preguntas de conocimiento general.
- Generacion de codigo y matematicas simples, aunque sin entrenamiento especifico de instrucciones.
- Base para fine-tuning: al ser un modelo base, es adecuado para SFT, LoRA/QLoRA y RLHF posteriores.
- Soporte multilingue limitado: la model card declara unicamente ingles; el rendimiento en castellano es residual.
- No dispone de tool calling, function calling, modo thinking ni capacidades de vision o audio nativas.
- No incorpora plantilla de chat ni formato de instrucciones; requiere que el usuario defina el prompt.

## Casos de uso

- Investigacion academica sobre escalado y comportamiento de modelos base: permite reproducir experimentos de evaluacion de perplejidad y comparativas con Llama 1 y otros modelos de 7B.
- Fine-tuning supervisado para dominios verticales: partiendo de los pesos base se puede ajustar con LoRA sobre datasets propios (legal, sanitario, atencion al cliente) con un coste de computo moderado.
- Generacion de datos sinteticos para entrenamiento: el modelo puede producir corpus de texto en ingles para destilar conocimiento hacia modelos mas pequenos.
- Experimentos de alineacion y RLHF: sirve como politica inicial en pipelines de preferencias humanas o DPO, dado que no esta contaminado por un ajuste previo de instrucciones.
- Despliegue en entornos con recursos limitados: con cuantizacion de 4 bits ocupa aproximadamente 4 GB y puede ejecutarse en GPU de consumo, lo que lo hace util para prototipos y demos.
- Evaluacion comparativa de tecnicas de cuantizacion e inferencia: es un banco de pruebas habitual para medir impacto de GPTQ, AWQ o llama.cpp en calidad y latencia.
- Educacion y docencia: por su tamano manejable y su documentacion publica, es un modelo idoneo para explicar el funcionamiento interno de un transformer decoder-only.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni comparativas numericas. El paper original de Llama 2 (arXiv:2307.09288) contiene resultados para la familia completa, pero no se reproducen aqui al no formar parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 7-8 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 4-5 GB.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100 80 GB, L40S, RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU de consumo: si, en RTX 3090/4090 en FP16 con contexto moderado, y en GPUs de 8-12 GB (RTX 3060, RTX 4070) con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama, Transformers con Accelerate, exllama/exllamav2 para cuantizacion.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen fuertemente del hardware, la cuantizacion y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-2-7b-hf (este repo) | 6,74 B | 4096 | Llama 2 Community | Hugging Face (espejo) |
| Llama-2-7b-chat-hf (Meta) | 6,74 B | 4096 | Llama 2 Community | Hugging Face (oficial) |
| Mistral-7B-v0.1 | 7,24 B | 8192 | Apache 2.0 | Hugging Face |
| Falcon-7B | 7,22 B | 2048 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones de forma fiable y puede producir continuaciones incoherentes o no deseadas si se usa directamente como asistente.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar hechos, citas y referencias sin base real.
- Sesgos: entrenado sobre datos web en ingles, puede reproducir sesgos de genero, raza, religion y nacionalidad presentes en el corpus.
- Idioma: la model card declara solo ingles; el rendimiento en castellano es limitado y no recomendable para produccion en espanol sin fine-tuning especifico.
- Contexto corto: 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas comparado con modelos actuales.
- Licencia con restricciones: la Llama 2 Community License exige atribucion, prohibe usar los resultados para mejorar otros LLM y establece un umbral de 700 millones de usuarios mensuales activos a partir del cual se requiere licencia comercial explicita de Meta.
- Redistribucion: este repositorio es un espejo de terceros; para uso en produccion conviene verificar la integridad de los pesos contra el repositorio oficial de Meta.
- Sin soporte de tool calling ni agentes: no dispone de capacidades nativas de function calling ni de razonamiento multi-paso estructurado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rpo41/Llama-2-7b-hf
- Repositorio oficial de Meta: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Paper Llama 2: https://arxiv.org/abs/2307.09288
- Pagina oficial de Llama: https://ai.meta.com/llama/
- Politica de uso aceptable: https://ai.meta.com/llama/use-policy
- Descarga de modelos y librerias: https://ai.meta.com/resources/models-and-libraries/llama-downloads/
