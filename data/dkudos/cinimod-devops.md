# dkudos/cinimod-devops

## Resumen

Cinimod DevOps 300M es un modelo de lenguaje causal de tipo decoder-only con arquitectura estilo Llama-3, desarrollado por el usuario dkudos y publicado en Hugging Face. Cuenta con 287.310.848 parámetros (aproximadamente 287M) y ha sido entrenado desde cero sobre un corpus especializado en DevOps y administración de sistemas. Su propósito es asistir en tareas de tooling DevOps, documentación de operaciones y modelado de lenguaje ligero que pueda ejecutarse en la propia máquina.

El modelo es relevante por su enfoque de dominio cerrado y su tamaño reducido, que permite desplegarlo en hardware de consumo. Incluye cuantizaciones GGUF listas para usar con llama.cpp, lo que facilita su integración en entornos de producción sin dependencias del código fuente original. Está entrenado con una longitud de contexto de 4096 tokens, aunque el autor indica que puede servirse hasta 256K mediante escalado lineal de RoPE en tiempo de inferencia.

Es importante señalar que, según la propia model card, el modelo se encuentra únicamente en fase de preentrenamiento (pre-trained), sin ajuste fino supervisado ni alineación posterior. Esto condiciona su comportamiento: no incorpora plantilla de chat y su fluidez queda limitada al dominio DevOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only estilo Llama (custom, no es la clase estándar `LlamaForCausalLM` de transformers) |
| Parametros totales | 287.310.848 (~287M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens entrenados; hasta 256K en servicio mediante escalado lineal de RoPE |
| Tipos de cuantizacion | Q8_0 y F16 en GGUF; pesos completos en bf16 (safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) y GGUF (Q8_0, F16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama con hidden size de 1024, 20 capas, 16 cabezas de atención y 4 cabezas KV (GQA). El tamaño intermedio es 2730, el vocabulario BPE es de 65.536 tokens y las embeddings están atadas (sin `lm_head` separado). Usa RoPE con theta de 500000 y atención eficiente mediante `scaled_dot_product_attention` con la ruta flash de flash-attn 2.

El entrenamiento se realizó desde cero sobre un corpus de DevOps y operaciones de sistemas, con una época sobre aproximadamente 132.068 secuencias de 4096 tokens (~540M tokens), 4000 pasos, warmup de 40 pasos y una tasa de aprendizaje de 6e-4 con decaimiento coseno. Se ejecutó en 2x RTX 4090 (24 GB cada una, bf16) con DeepSpeed ZeRO-2 y pesos maestros en FP32. La pérdida de entrenamiento pasó de 0,43 en el paso 2000 a 0,35 en el paso 4000. La evaluación completa sobre validación (17.492 bins / 123.656 secuencias a 4096) arrojó una pérdida media de 2,3163 y una perplejidad de 10,14. No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto causal en inglés, orientada al dominio DevOps y administración de sistemas.
- Asistencia en documentación de operaciones y consultas técnicas de infraestructura.
- Modelado de lenguaje ligero ejecutable en la propia máquina (on-box).
- Compatibilidad con llama.cpp y llama-server para servir mediante API compatible con OpenAI.
- Soporte de contexto extendido en tiempo de servicio mediante escalado de RoPE (lineal o Yarn).
- No incluye plantilla de chat incorporada; es un modelo causal plano.
- No dispone de tool calling, function calling ni capacidades de agente declaradas.
- No dispone de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistencia en línea de comandos: el modelo puede responder consultas como comprobar el estado de nginx o listar comandos de systemd, aprovechando su entrenamiento específico en operaciones de sistemas.
- Generación de documentación de operaciones: útil para redactar runbooks y procedimientos internos dentro del dominio DevOps, con la ventaja de ejecutarse localmente sin enviar datos a terceros.
- Autocompletado en editores y terminales: su tamaño de 287M y sus cuantizaciones GGUF de 344 MiB (Q8_0) permiten integrarlo en herramientas locales de bajo consumo.
- Servicio de inferencia ligero en el borde: desplegable con llama-server en una máquina modesta, ofreciendo un endpoint compatible con la API de chat de OpenAI para integraciones internas.
- Filtrado y clasificación de texto técnico: puede emplearse como modelo base para tareas de puntuación o etiquetado de contenido DevOps, dado su bajo coste de inferencia.
- Base para ajuste fino posterior: al estar solo preentrenado, sirve como punto de partida para SFT en tareas concretas de operaciones; el autor publica además una variante preparada para SFT (`cinimod-devops-sft-base`).
- Experimentación educativa: su escala reducida y su licencia Apache 2.0 lo hacen adecuado para estudiar el preentrenamiento de modelos de dominio desde cero.

## Benchmarks y rendimiento

La model card declara un `model-index` con el nombre "Cinimod DevOps 300M" pero sin resultados asociados. El único dato de evaluación publicado es la pérdida de validación y la perplejidad.

| Metrica | Valor |
|---|---|
| Pérdida de validación (media) | 2,3163 |
| Perplejidad de validación | 10,14 |
| Pérdida de entrenamiento (paso 2000) | 0,43 |
| Pérdida de entrenamiento (paso 4000) | 0,35 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB con GGUF Q8_0 (344 MiB) y unos 0,55 GB con GGUF F16 (550 MiB); los pesos bf16 en safetensors ocupan 548 MiB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; el entrenamiento se realizó en 2x RTX 4090, pero la inferencia es viable en hardware mucho menor.
- Cabe en GPU de consumo: sí, en cualquier RTX o incluso en iGPU y CPU, dado su reducido tamaño.
- Opciones de despliegue: llama.cpp / llama-server (recomendado por el autor), y transformers con las clases personalizadas de Cinimod (`cinimod.model.llama.LlamaForCausalLM`). No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la información proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría. A nivel estructural, puede situarse frente a otros modelos pequeños de dominio:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cinimod DevOps 300M | ~287M | 4096 entrenados; hasta 256K con RoPE scaling | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Alternativas de ~300M de dominio | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está únicamente preentrenado: no ha pasado por SFT ni alineación, por lo que no sigue instrucciones de forma fiable ni mantiene conversaciones estructuradas.
- Fluidez limitada al dominio DevOps; no debe esperarse conocimiento general del mundo.
- Entrenado con una sola época y a pequeña escala (~540M tokens), lo que restringe su calidad frente a modelos mayores.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Riesgo de alucinación en consultas fuera de su dominio o que requieran precisión factual.
- No incorpora plantilla de chat; los avisos de formato de chat de llama.cpp son valores por defecto del servidor, no del modelo.
- El contexto extendido a 256K es solo en tiempo de servicio mediante escalado de RoPE; el modelo fue entrenado a 4096, por lo que la coherencia a larga distancia puede degradarse. El autor sugiere Yarn como alternativa si el escalado lineal pierde coherencia.
- La ruta de transformers requiere las clases personalizadas de Cinimod; sin el código fuente, debe usarse GGUF.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo preentrenado sin alineación, su uso en producción requiere evaluación y posibles ajustes previos.

## Enlaces

- Hugging Face: https://huggingface.co/dkudos/cinimod-devops
- GGUF Q8_0: https://huggingface.co/dkudos/cinimod-devops/resolve/main/checkpoint-4000-Q8_0.gguf
- GGUF F16: https://huggingface.co/dkudos/cinimod-devops/resolve/main/checkpoint-4000-f16.gguf
- Variante para SFT: https://huggingface.co/dkudos/cinimod-devops-sft-base
