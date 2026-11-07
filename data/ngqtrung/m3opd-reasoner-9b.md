# ngqtrung/M3OPD-Reasoner-9B

## Resumen

M3OPD-Reasoner-9B es un modelo multimodal de razonamiento de 9.400 millones de parametros (~9,4 B) desarrollado por el usuario ngqtrung sobre la base de Qwen/Qwen3.5-9B. Se trata del checkpoint principal de la receta M3OPD-Reasoner, un pipeline de destilacion on-policy y aprendizaje por refuerzo en tres etapas: entrenamiento de profesores de dominio (SFT y GSPO), destilacion on-policy multi-profesor (MOPD) de esos profesores en un unico estudiante, y una fase final de MixRL con GSPO sobre el estudiante resultante.

El modelo conserva la arquitectura, tokenizer, processor y plantilla de chat de Qwen3.5-9B, lo que permite ejecutarlo directamente con Transformers, vLLM o SGLang. El checkpoint publicado corresponde al paso 180 de la etapa MixRL y esta pensado para tareas de razonamiento multimodal (image-text-to-text) con modo de pensamiento activado.

Es relevante porque combina destilacion on-policy con RL verifiable en un modelo de 9 B, un rango de tamano que cabe en GPUs de consumo alto con cuantizacion y que apunta a un equilibrio entre capacidades de razonamiento y coste de despliegue. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5-9B (arquitectura exacta no detallada en la model card) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (valor usado en el ejemplo de servicio con `--max-model-len 40960`; el maximo nativo de Qwen3.5-9B no se especifica) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible (heredados de Qwen3.5-9B, no declarados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B y mantiene intactos su arquitectura, tokenizer, processor y chat template, por lo que no introduce cambios estructurales respecto al base. La innovacion esta en el proceso de entrenamiento: una receta en tres fases que combina profesores de dominio (cada uno con SFT warm-up seguido de GSPO), destilacion on-policy multi-profesor (MOPD) que fusiona los tres profesores en un unico estudiante, y una etapa final de MixRL con GSPO sobre todos los prompts del dataset M3OPD-RL-193K. El checkpoint publicado es el paso 180 de esta ultima fase.

Los datos de entrenamiento provienen de M3OPD-SFT-1.35M (1,35 M de ejemplos SFT) y M3OPD-RL-193K (193 K prompts de RL). No se detalla en la informacion disponible el numero total de tokens, la composicion exacta del dataset ni la funcion de recompensa mas alla de que se usan las recompensas y ajustes de los profesores de dominio y del baseline MixRL. El entrenamiento y evaluacion se realizan con la plantilla de chat nativa de Qwen3.5, thinking activado, sin system prompt y con una linea de formato de respuesta tras la pregunta.

## Capacidades

- Razonamiento multimodal image-text-to-text: procesa pares de imagen y texto para generar respuestas razonadas.
- Modo de pensamiento (thinking) activado por defecto en el entrenamiento y evaluacion.
- Razonamiento multi-paso orientado a respuestas finales con formato `\boxed{}`.
- Generacion de texto conversacional multi-turno.
- Capacidades de codigo y matematicas heredadas del base Qwen3.5-9B (no verificadas en benchmarks publicados).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (no declaradas).
- Capacidades de audio: no disponibles.

## Casos de uso

- Razonamiento sobre documentos visuales: el modelo puede recibir una imagen de un grafico o tabla y producir una respuesta razonada con el resultado final en `\boxed{}`, util para extraccion de datos y verificacion.
- Resolucion de problemas matematicos con imagen: adecuado para problemas de geometria o diagramas donde se requiere un paso a paso de pensamiento antes de la respuesta final.
- Asistente conversacional multimodal: gestiona dialogos multi-turno con contexto de hasta ~40 K tokens, integrable en interfaces de chat con imagenes.
- Evaluacion automatizada de razonamiento: al estar entrenado con GSPO y recompensas de profesores, puede usarse como generador de cadenas de razonamiento para construir datasets de destilacion o verificar soluciones.
- Analisis de capturas de pantalla y UI: con la plantilla de chat de Qwen3.5 y modo thinking, puede describir y razonar sobre interfaces para tareas de automatizacion o accesibilidad.
- Despliegue en infraestructura existente de Qwen3.5: al compartir arquitectura y processor, se puede servir con vLLM (`vllm serve ... --max-model-len 40960`) o SGLang sin adaptaciones de codigo.
- Fine-tuning posterior: al ser Apache 2.0 y safetensors, sirve como punto de partida para ajustes especificos de dominio con las herramientas estandar de Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: ~18,8 GB de pesos, mas overhead de KV cache; en la practica se recomienda 24 GB o mas para contexto moderado y 40-48 GB para contextos cercanos a 40 K tokens.
- VRAM estimada con cuantizacion de 8 bits: ~10-12 GB de pesos; con 4 bits: ~5-7 GB de pesos (no se publican pesos cuantizados oficiales).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para produccion y contextos largos; RTX 4090 (24 GB) para BF16 con contexto limitado o cuantizacion.
- Cabe en GPU de consumo: si, con cuantizacion en RTX 3090/4090 (24 GB) y tarjetas de 16 GB en 4-8 bits con contexto reducido.
- Opciones de despliegue: Transformers, vLLM (soportado explicitamente, `--max-model-len 40960`), SGLang. llama.cpp/Ollama no estan confirmados al no haber pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| M3OPD-Reasoner-9B | ~9,4 B | 40.960 (configurado) | image-text-to-text | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | texto (segun base) | Apache 2.0 | Hugging Face |
| M3OPD-MOPD-9B (etapa previa) | ~9 B | no disponible | image-text-to-text | Apache 2.0 | Hugging Face |
| Alternativas de 9 B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- No hay benchmarks publicados: el rendimiento real frente a Qwen3.5-9B u otros modelos de 9 B no esta verificado.
- Riesgo de alucinacion inherente a modelos generativos, especialmente en razonamiento multimodal con imagenes ambiguas.
- El modelo esta entrenado con thinking activado y un formato de respuesta concreto (`\boxed{}`); desviarse de esa plantilla puede degradar la calidad de las respuestas.
- Idiomas soportados no declarados: el comportamiento multilingue no esta garantizado mas alla de lo heredado del base.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin cuantizacion manual.
- Al ser un finetune de Qwen3.5-9B, hereda sesgos y limitaciones del modelo base.
- El checkpoint corresponde al paso 180 de la etapa MixRL; no se indica si es el checkpoint final de la receta.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B.
- Repo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion comunitaria practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/M3OPD-Reasoner-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint previo (MOPD): https://huggingface.co/ngqtrung/M3OPD-MOPD-9B
- Dataset SFT: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset RL: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Coleccion de checkpoints: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
