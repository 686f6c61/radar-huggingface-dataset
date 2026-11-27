# openmuse/smolLM2-360M-sample_r2006

## Resumen

smolLM2-360M-sample_r2006 es un ajuste fino (fine-tuning) completo del modelo base HuggingFaceTB/SmolLM2-360M, publicado por el usuario openmuse bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto de tipo decoder-only con arquitectura Llama, entrenado mediante la libreria LLaMA-Factory sobre un dataset interno denominado sample_r2006. El repositorio presenta 409.007.040 parametros reales en formato safetensors y un tamano de 0,8 GB.

El modelo hereda las caracteristicas del SmolLM2-360M original, un modelo compacto disenado para ejecucion en dispositivos con recursos limitados (CPU, moviles, GPUs de gama de entrada). El ajuste fino se realizo con 4 GPUs, un batch total de 2048 y 250 pasos de entrenamiento, alcanzando una perdida de validacion de 1,2345 tras procesar aproximadamente 1046 millones de tokens de entrada.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste fino sin documentacion sobre el dataset, sin benchmarks publicados y con cero descargas en el momento de la consulta. Resulta util como referencia para entender el proceso de entrenamiento y como ejemplo de especializacion de un modelo pequeno, pero no debe considerarse un modelo listo para produccion sin una evaluacion adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 409.007.040 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion posterior via GGUF/AWQ, no confirmado por el autor) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M, un transformer decoder-only de la familia Llama con 360 millones de parametros (409 millones contando embeddings y cabezas). El ajuste fino fue completo (no LoRA ni QLoRA), segun la etiqueta `full` de LLaMA-Factory, y se ejecuto en configuracion multi-GPU con 4 dispositivos, batch de entrenamiento de 16 por dispositivo, acumulacion de gradientes de 32 pasos y batch total efectivo de 2048. Se utilizo el optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, learning rate de 2e-05, scheduler lineal y 250 pasos de entrenamiento, lo que equivale a aproximadamente 1,19 epocas sobre el dataset.

El dataset de entrenamiento (sample_r2006) no esta documentado en la model card: se desconoce su composicion, numero de ejemplos, dominio y metodo de construccion. La perdida de validacion se mantuvo practicamente plana entre 1,2307 y 1,2345 a lo largo del entrenamiento, lo que sugiere que el modelo converge rapidamente y que el ajuste fino aporta cambios marginales sobre el modelo base. No se menciona el uso de RLHF, DPO ni ninguna tecnica de alineacion adicional. Las versiones de framework empleadas fueron Transformers 4.51.0, PyTorch 2.7.1+cu128, Datasets 3.5.0 y Tokenizers 0.21.1.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y `text-generation`, por lo que se espera que produzca respuestas en formato de dialogo, aunque no se detalla el formato de prompt utilizado.
- Razonamiento basico y generacion de texto general: heredado del SmolLM2-360M original.
- Generacion de codigo y matematicas: capacidad limitada por el tamano del modelo base; no se ha evaluado en este ajuste.
- Tool calling / function calling: no documentado por el autor; el modelo base SmolLM2 no lo soporta de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado y poco probable en un modelo de 360 M de parametros.
- Capacidades multilingues: no disponibles; el modelo base SmolLM2 esta entrenado principalmente en ingles, pero el ajuste fino no especifica idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en local: el modelo cabe en cualquier GPU consumer e incluso en CPU, lo que permite iterar sobre prompts y flujos de dialogo sin coste de API.
- Experimentacion academica con ajuste fino: sirve como ejemplo reproducible de un pipeline completo con LLaMA-Factory, util para comparar hiperparametros y estudiar el efecto de un fine-tuning completo sobre un modelo pequeno.
- Generacion de texto en dispositivos edge: con 0,8 GB en safetensors y cuantizacion a 4 bits podria ejecutarse en moviles o Raspberry Pi, aunque el autor no proporciona versiones GGUF.
- Filtrado y clasificacion de texto simple: tareas de etiquetado, resumen corto o reescritura en entornos con restricciones de memoria.
- Base para experimentos de destilacion: al ser un modelo pequeno, puede emplearse como estudiante en pipelines de destilacion desde modelos mayores.
- Educacion y demos: util para mostrar el ciclo completo de entrenamiento y publicacion en Hugging Face en cursos o talleres.
- No recomendado para produccion sin evaluacion: al no haber benchmarks ni documentacion del dataset, su uso en atencion al cliente real o generacion de codigo en CI/CD requeriria una validacion exhaustiva previa.

## Benchmarks y rendimiento

La model card declara un `model-index` con el nombre `sample_r2006` pero sin resultados (`results: []`). El unico dato de evaluacion disponible es la perdida de validacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss de validacion final | 1,2345 |
| Loss de entrenamiento final | 2,0396 |
| Tokens de entrada vistos | 1.046.622.912 |
| Pasos de entrenamiento | 250 |
| Epocas | ~1,19 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,8-1 GB para los pesos, mas overhead de activaciones y cache KV; en la practica unos 2-3 GB.
- VRAM estimada en cuantizacion 4 bits: alrededor de 0,3-0,5 GB para pesos; puede ejecutarse en GPUs con 2 GB o menos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada; tambien funciona en GTX 1650, Jetson Nano o incluso CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPUs dedicadas de los ultimos 10 anos.
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta `text-generation-inference` presente), vLLM, llama.cpp y Ollama tras conversion a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput: no disponibles; por el tamano del modelo se espera un throughput alto (cientos de tokens por segundo en GPU moderna), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| openmuse/smolLM2-360M-sample_r2006 | 409 M | no disponible | Apache 2.0 | Hugging Face | Fine-tuning sin benchmarks ni dataset documentado |
| HuggingFaceTB/SmolLM2-360M | 362 M | 8192 tokens (segun model card del base) | Apache 2.0 | Hugging Face | Modelo base original, con evaluacion publicada |
| Qwen2.5-0.5B | 494 M | 32768 tokens | Apache 2.0 | Hugging Face | Alternativa mas grande con mejor soporte multilingue |
| TinyLlama-1.1B | 1,1 B | 2048 tokens | Apache 2.0 | Hugging Face | Mayor capacidad pero mas recursos |

La comparativa se limita a caracteristicas estructurales; no hay datos de rendimiento del modelo ajustado que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: se desconoce la composicion de sample_r2006, lo que impide evaluar sesgos, calidad y cobertura.
- Sin benchmarks publicados: no hay evidencia de mejora sobre el modelo base; de hecho, la perdida de validacion apenas varia durante el entrenamiento.
- Riesgo de alucinacion: inherente a los modelos de 360 M de parametros, especialmente en tareas de razonamiento y datos factuales.
- Limitaciones de contexto e idioma: no se especifican; el modelo base SmolLM2 esta orientado principalmente al ingles y tiene una ventana de contexto limitada.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el dataset de ajuste no introduzca restricciones adicionales (desconocidas).
- Cero descargas y cero likes: indica que el modelo no ha sido validado por la comunidad; no existen reportes independientes de calidad.
- Fecha de creacion futura (2026-11-27): conviene verificar la integridad del repositorio antes de confiar en el.
- No apto para produccion sin evaluacion: se recomienda ejecutar una bateria propia de pruebas (perplejidad, tareas especificas, sesgos) antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openmuse/smolLM2-360M-sample_r2006
- Modelo base SmolLM2-360M: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Transformers: https://github.com/huggingface/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
