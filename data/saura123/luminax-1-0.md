# Saura123/luminax-1.0

## Resumen

Luminax-1.0 es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct, publicado por el usuario Saura123 en Hugging Face. Se trata de un modelo de generacion de texto de 3.000 millones de parametros derivado de la familia Qwen2.5 de Alibaba, entrenado mediante la libreria Unsloth sobre la version cuantizada a 4 bits del modelo instructivo original (unsloth/Qwen2.5-3B-Instruct-bnb-4bit). El repositorio tiene un tamano de 0,3 GB y esta etiquetado para su uso con transformers y text-generation-inference.

La relevancia de este modelo es limitada: se trata de una publicacion de tipo "uploaded finetuned model" sin model card detallada, sin datos sobre el dataset de entrenamiento, sin resultados de benchmarks y con cero descargas y cero "likes" en el momento de la consulta. No hay informacion publica sobre el objetivo del ajuste fino ni sobre las diferencias respecto al modelo base.

Por herencia del modelo base Qwen2.5-3B-Instruct, cabe esperar una arquitectura transformer decoder-only con una ventana de contexto de 32.768 tokens, capacidades multilingues (aunque la model card declara solo ingles) y soporte de tool calling. No obstante, estas caracteristicas no estan verificadas para este ajuste concreto y deben tratarse como inferidas del modelo base, no como especificaciones confirmadas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, heredada del modelo base) |
| Parametros totales | 3.000 millones (heredado de Qwen2.5-3B-Instruct) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (el modelo base de partida esta en bnb-4bit; el repo publicado usa safetensors) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y sesgos QKV, tal como define la familia Qwen2.5. El ajuste fino se realizo con Unsloth, una libreria optimizada para entrenamiento y fine-tuning de bajo coste en memoria, partiendo de la version del modelo base cuantizada a 4 bits con bitsandbytes (bnb-4bit). El autor declara que el entrenamiento fue "2x mas rapido" gracias a Unsloth, pero no proporciona detalles sobre el dataset, el numero de tokens, la composicion de los datos ni si se aplicaron tecnicas de RLHF o DPO.

No se dispone de informacion sobre hiperparametros, duracion del entrenamiento, hardware utilizado ni metodologia de evaluacion. La model card es la plantilla generica de Unsloth sin contenido adicional sustantivo. Tampoco se documenta ninguna innovacion tecnica propia del ajuste (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto: capacidad heredada del modelo base Qwen2.5-3B-Instruct, aunque no verificada para este ajuste.
- Razonamiento y matematicas: el modelo base tiene capacidades notables en tareas de razonamiento y aritmetica para su tamano; se desconoce si el ajuste las preserva o las modifica.
- Generacion de codigo: el modelo base Qwen2.5-Instruct esta entrenado para codigo; no hay evidencia de que el ajuste mantenga esta capacidad.
- Tool calling / function calling: el modelo base Qwen2.5-Instruct lo soporta; no confirmado para este ajuste.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la model card declara unicamente ingles, aunque el modelo base es multilingue. No hay confirmacion de que el ajuste conserve otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo, con 3.000 millones de parametros, puede desplegarse en hardware modesto para experimentar con un chatbot de dominio general, aunque sin garantias sobre la calidad del ajuste.
- Fine-tuning posterior como punto de partida: al estar bajo licencia Apache 2.0 y en formato safetensors, puede servir como base para nuevos ajustes en tareas especificas, especialmente si el dominio del ajuste original coincide con el caso de uso.
- Experimentacion academica con Unsloth: util para reproducir flujos de entrenamiento de bajo coste en memoria y comparar el comportamiento del ajuste frente al modelo base.
- Generacion de texto en entornos con recursos limitados: los 3.000 millones de parametros permiten inferencia en GPUs consumer, lo que facilita pruebas de concepto en estaciones de trabajo sin aceleradores de datacenter.
- Evaluacion de riesgos de modelos no documentados: sirve como caso de estudio sobre la importancia de las model cards y la trazabilidad en la publicacion de ajustes finos.
- Integracion en pipelines de text-generation-inference: el repositorio esta etiquetado para TGI, por lo que puede desplegarse con ese servidor si el formato de pesos es compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de evaluacion, comparaciones con el modelo base ni resultados en tareas estandar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB en FP16 para 3.000 millones de parametros; unos 2-3 GB en cuantizacion de 4 bits (estimacion basada en el tamano del modelo, no confirmada por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para inferencia en consumer; A100 o H100 para despliegue en produccion con mayor throughput.
- Cabe en GPU consumer: si, practicamente cualquier GPU con 8 GB o mas de VRAM en cuantizacion de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (etiquetado en el repo), llama.cpp u Ollama si se generan pesos GGUF (no incluidos en el repositorio), vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Luminax-1.0 | 3.000 M | no disponible (base: 32.768) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino sin documentacion ni benchmarks |
| Qwen2.5-3B-Instruct | 3.000 M | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, documentado y evaluado |
| Llama 3.2 3B Instruct | 3.000 M | 131.072 | Llama 3.2 Community License | Hugging Face, ampliamente usado | Contexto mayor, licencia con restricciones |
| Phi-3.5-mini-instruct | 3.800 M | 131.072 | MIT | Hugging Face, ampliamente usado | Ligeramente mayor, contexto largo |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay informacion sobre el dataset de entrenamiento, el objetivo del ajuste ni los hiperparametros, lo que impide evaluar su calidad y adecuacion.
- Sin benchmarks: no existen metricas publicadas que permitan comparar su rendimiento con el modelo base u otras alternativas.
- Riesgo de degradacion respecto al modelo base: los ajustes finos sin evaluacion pueden reducir capacidades del modelo original (olvido catastrofico, perdida de multilingueismo, peor tool calling).
- Riesgo de alucinacion: inherente a los modelos de 3.000 millones de parametros; sin evaluacion especifica no puede cuantificarse.
- Sesgos: no documentados; el modelo base Qwen2.5 tiene sesgos conocidos de sus datos de entrenamiento que el ajuste podria amplificar o modificar sin control.
- Idioma: la model card declara solo ingles; el uso en castellano no esta garantizado aunque el modelo base sea multilingue.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia de los datos de ajuste antes de un uso en produccion.
- Repositorio sin actividad: cero descargas y cero "likes" sugieren que el modelo no ha sido validado por la comunidad.
- No apto para produccion sin evaluacion previa: al no haber documentacion ni pruebas, su uso en entornos productivos requiere una evaluacion independiente exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saura123/luminax-1.0
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo original Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
