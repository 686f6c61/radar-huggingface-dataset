# francescortu/DistillDetect-Qwen2.5-3B-from-Qwen3-8B-OMI-1K

## Resumen

DistillDetect-Qwen2.5-3B-from-Qwen3-8B-OMI-1K es una reproduccion no oficial de un modelo estudiante destilado, publicada por francescortu en agosto de 2026. El modelo surge del articulo *Reference-Based Distillation Detection in LLMs* (Rawat et al., arXiv:2607.09692), que propone un metodo para detectar si un modelo ha sido destilado a partir de un profesor concreto. El autor de esta ficha ha reentrenado el modelo usando el codigo oficial de los autores y los datos generados por el profesor, que se distribuyen en el repositorio del articulo bajo licencia MIT.

El modelo se construye sobre Qwen2.5-3B como base (estudiante) y utiliza Qwen3-8B como profesor. El entrenamiento se realiza mediante SFT sobre 1000 respuestas generadas por el profesor a partir de prompts de OpenMathInstruct-2, con una plantilla de prompt simple de tipo `Problem:\n{question}\n\nSolution:\n`. El resultado es un modelo de 3.085 millones de parametros orientado a la tarea especifica de deteccion de destilacion, no a uso general. Su relevancia radica en que los autores originales no publicaron checkpoints del estudiante, por lo que esta reproduccion independiente permite a la comunidad replicar y verificar los resultados del articulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-3B (transformer decoder-only) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (herencia de Qwen2.5-3B) |
| Tipos de cuantizacion | no disponible (repo solo con pesos en bf16) |
| Idiomas soportados | no disponible (herencia de Qwen2.5-3B: principalmente ingles y chino) |
| Licencia | Qwen Research License (qwen-research) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-3B, un transformer decoder-only denso con atencion completa, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). No se trata de un modelo MoE ni hibrido; es un modelo denso estandar de 3B parametros. El entrenamiento sigue la receta del Apendice A del articulo: 3 epocas, learning rate 1e-5, scheduler coseno con 5% de warmup, batch efectivo de 16 (per-device batch 4 con grad-accum 4), block size de 4096 tokens, precision bf16 y gradient checkpointing. La funcion de perdida se aplica solo sobre los tokens de respuesta, enmascarando el prompt con -100.

El dataset de entrenamiento consiste en 1000 respuestas generadas por el profesor Qwen3-8B a partir de prompts de OpenMathInstruct-2. Estas respuestas se distribuyen literalmente en el repositorio oficial de los autores del articulo. No se aplicaron tecnicas de RLHF ni DPO; el entrenamiento es exclusivamente SFT supervisado. La innovacion principal no esta en la arquitectura, sino en el objetivo de la tarea: el modelo se entrena para distinguir si una respuesta ha sido generada por un modelo destilado o por el profesor de referencia, lo que constituye una tarea de clasificacion a nivel de secuencia.

## Capacidades

- Deteccion de destilacion: el modelo esta entrenado para identificar si una respuesta ha sido generada por un modelo destilado a partir de un profesor concreto, comparando con respuestas de referencia.
- Razonamiento matematico basico: al entrenarse sobre OpenMathInstruct-2, el modelo conserva cierta capacidad de resolver problemas matematicos de nivel escolar, aunque no es su proposito principal.
- Generacion de texto condicionada por plantilla: el modelo espera la plantilla `Problem:\n{question}\n\nSolution:\n` y genera la solucion correspondiente.
- Clasificacion de secuencias: la tarea de deteccion implica una cabeza de clasificacion sobre la representacion de la secuencia completa, no generacion autoregresiva estandar.
- No soporta tool calling, ni funciones de agente, ni multimodalidad, ni modo thinking explicito.

## Casos de uso

- Investigacion academica en deteccion de destilacion: el caso de uso principal es reproducir y extender los resultados del articulo de Rawat et al. Los investigadores pueden cargar este checkpoint para verificar las metricas reportadas o comparar con sus propias implementaciones.
- Auditoria de modelos: organizaciones que sospechen que un modelo comercial ha sido destilado de un profesor propietario pueden usar este modelo como punto de partida para construir detectores adaptados a su caso.
- Estudio de transferencia de conocimiento: el modelo permite analizar que caracteristicas de las respuestas del profesor se conservan en el estudiante destilado, util para investigacion en compression de modelos.
- Evaluacion de pipelines de destilacion: equipos que desarrollan sus propios pipelines de destilacion pueden usar este modelo como detector para comprobar si sus estudiantes son detectables, ayudando a mejorar la fidelidad de la destilacion.
- Educacion en tecnicas de SFT: al ser un ejemplo completo y reproducible de SFT con datos generados por profesor, sirve como caso de estudio didactico para cursos de LLMs y destilacion.
- Comparativa de detectores: dado que es una reproduccion independiente, puede usarse para comparar la robustez de diferentes detectores de destilacion sobre el mismo modelo base y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de GSM8K y MATH500 estan pendientes de calculo y se anadiran cuando esten disponibles. No se proporcionan datos de MMLU, HumanEval ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 3.085 millones de parametros en bf16, lo que ocupa aproximadamente 6,2 GB en memoria. Con cuantizacion a 8 bits cabria en unos 3,5 GB, y a 4 bits en unos 2 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: una GPU consumer con 8 GB de VRAM (RTX 3070, RTX 4060 Ti, etc.) es suficiente para inferencia en bf16. Para entrenamiento o fine-tuning adicional, se recomienda al menos 16 GB (RTX 4090, A5000).
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs consumer de gama media con 8 GB o mas.
- Opciones de despliegue: al ser un modelo safetensors estandar de la familia Qwen2, puede desplegarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, Hugging Face TGI o directamente con transformers.
- Latencia y throughput: no disponible. Para un modelo de 3B en una GPU moderna, se espera una latencia de decodificacion de 20-40 ms por token y un throughput de 50-100 tokens/s en vLLM, pero estos valores no estan confirmados para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| DistillDetect-Qwen2.5-3B (este) | 3,09 B | 32 K | Qwen Research | Deteccion de destilacion |
| Qwen2.5-3B (base) | 3,09 B | 32 K | Apache 2.0 | LLM general |
| Qwen3-8B (profesor) | 8 B | 32 K | Apache 2.0 | LLM general con modo thinking |

La comparativa directa con otros detectores de destilacion no es posible porque no se han publicado checkpoints alternativos en la informacion disponible. Frente a su modelo base Qwen2.5-3B, este checkpoint esta especializado en una tarea concreta y no es adecuado para uso general. Frente al profesor Qwen3-8B, es significativamente mas pequeno y rapido, pero su unica funcion es la deteccion de destilacion.

## Limitaciones y advertencias

- Reproduccion no oficial: el autor indica explicitamente que esta reproduccion no esta afiliada con los autores del articulo original y que los checkpoints oficiales del estudiante no fueron publicados. Los resultados pueden diferir de los del articulo.
- Licencia restrictiva: la licencia Qwen Research License limita el uso a fines de investigacion. No es apta para despliegue comercial sin autorizacion expresa de Alibaba.
- Especializacion estrecha: el modelo esta entrenado para una tarea muy concreta (deteccion de destilacion) y no debe usarse como LLM general. Su rendimiento en tareas fuera de este ambito sera pobre.
- Datos de entrenamiento limitados: solo 1000 ejemplos de OpenMathInstruct-2, lo que limita la generalizacion a otros dominios o estilos de respuesta.
- Sesgos del profesor: las respuestas del profesor Qwen3-8B pueden contener sesgos o errores que el detector aprenda a reconocer como caracteristicas, lo que podria producir falsos positivos o negativos en otros contextos.
- Resultados de evaluacion pendientes: no hay benchmarks publicados que verifiquen el rendimiento real del modelo. Cualquier uso en produccion debe esperar a la publicacion de los resultados GSM8K y MATH500.
- Sin cuantizaciones oficiales: no se proporcionan versiones GGUF, AWQ ni GPTQ, por lo que el despliegue en entornos con recursos limitados requiere conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francescortu/DistillDetect-Qwen2.5-3B-from-Qwen3-8B-OMI-1K
- Articulo original (arXiv): https://arxiv.org/abs/2607.09692
- Repositorio oficial de los autores: https://github.com/RajatRawat-creator/DistillDetect
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
