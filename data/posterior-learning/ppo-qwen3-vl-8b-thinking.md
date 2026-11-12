# posterior-learning/ppo-qwen3-vl-8b-thinking

## Resumen

`posterior-learning/ppo-qwen3-vl-8b-thinking` es un modelo multimodal de tipo image-text-to-text obtenido al fusionar (merge) un adaptador LoRA entrenado con PPO sobre el modelo base Qwen/Qwen3-VL-8B-Thinking. Lo publica el usuario `posterior-learning` y su interés es acotado: no se trata de un modelo nuevo, sino de un artefacto reproducible de un experimento de ajuste fino con refuerzo (RL) sobre un VLM de 8B parámetros, con los pesos del adaptador ya integrados en el modelo completo.

El modelo conserva la arquitectura, el tokenizador, la plantilla de chat y los ficheros de configuración del base Qwen3-VL-8B-Thinking; únicamente se han modificado 252 módulos lineales mediante la regla de fusión `W <- W + (lora_alpha / r) * B @ A` con r=16 y alpha=32 (escala 2.0), calculada en fp32 y almacenada en bf16. El resto de tensores son idénticos byte a byte al base, lo que facilita la auditoría del cambio.

Su relevancia es principalmente metodológica: documenta un pipeline completo de RL con verl (PPO con GAE y crítico, ejecución colocada en 4 GPUs con offload a CPU, 50 pasos globales) y publica el resultado fusionado junto con un informe de verificación (`MERGE-REPORT.json`). No hay model card sustantiva, ni benchmarks, ni datos de entrenamiento más allá del recuento de pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) heredada de Qwen3-VL-8B-Thinking; no se detalla en la informacion disponible |
| Parametros totales | 8.767.123.696 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (heredada del base, no documentada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 y safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); repo de 17,5 GB |
| Modelo base | Qwen/Qwen3-VL-8B-Thinking |
| Metodo de ajuste | LoRA fusionado (r=16, alpha=32, escala 2.0), entrenado con PPO (verl) |
| Modulos modificados | 252 modulos LoRA; 498 tensores identicos byte a byte al base |

## Arquitectura y entrenamiento

La arquitectura es la del base Qwen3-VL-8B-Thinking, un modelo vision-lenguaje con modo de razonamiento ("thinking"), sin que la informacion disponible detalle el numero de capas, dimensiones ocultas, atencion o estrategia de encoding visual. El proceso de publicacion no altera esa arquitectura: se parte de los pesos del base y se aplica una fusión LoRA sobre 252 módulos, con escala `lora_alpha / r = 32 / 16 = 2.0`, cálculo en fp32 y almacenamiento en bf16. El resto de tensores (498) permanece byte-idéntico, y los ficheros no-peso (config, tokenizer, chat template, processor configs, generation config) son los del base sin cambios.

El adaptador procede de una ejecución de PPO con GAE y crítico (verl) denominada `ppo_qwen3vl_8b_thinking_transfer`, en configuración colocada sobre 4 GPUs con offload a CPU, completada el 11 de noviembre de 2026 y correspondiente al paso global 50 de 50. No se documentan el dataset de entrenamiento, la composición de prompts, la función de recompensa, el número de tokens vistos ni hiperparámetros de RL más allá de los del LoRA. El adaptador original no está publicado en Hugging Face, pero se incluye su sha256 (`0a15125c09bd79ff9363765a6260b12cb5dc4cc4fcc05a9a3e4cce7c410654ff`) para verificación.

## Capacidades

- Generación de texto e imagen-a-texto: pipeline `image-text-to-text`, con entrada de imágenes y texto y salida conversacional.
- Razonamiento en modo "thinking": heredado del base Qwen3-VL-8B-Thinking, orientado a cadenas de razonamiento antes de la respuesta.
- Conversación multi-turno: la plantilla de chat es la del base, sin modificaciones.
- Capacidades de tool calling y function calling: no documentadas en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingües: no documentadas; los idiomas del base no se indican en la ficha.
- Capacidades especiales adicionales (audio, visión extendida, etc.): no documentadas en la informacion disponible.

## Casos de uso

- Evaluación de recetas de RL sobre VLMs: el artefacto permite reproducir la comparación entre el base y la versión ajustada con PPO, ya que los pesos están fusionados y el resto de ficheros son idénticos al base.
- Auditoría de procesos de fusión LoRA: al incluir `MERGE-REPORT.json` con la verificación de 3 módulos aleatorios y 498 tensores byte-idénticos, sirve como caso de estudio de control de calidad en pipelines de merge.
- Investigación en alineación multimodal: útil para estudiar cómo 50 pasos de PPO con GAE sobre un VLM de 8B afectan al comportamiento conversacional y de razonamiento, partiendo de un checkpoint reproducible.
- Docencia y formación técnica: ejemplo completo de entrenamiento con verl (colocado, 4 GPUs, offload a CPU) y de publicación de pesos fusionados con trazabilidad por hash.
- Base para experimentos derivados: al mantener tokenizador, processor y chat template del base, puede reutilizarse como punto de partida para nuevos adaptadores sin reescribir el pipeline de datos.
- Despliegue experimental en entornos controlados: con 8,77B parámetros y pesos bf16, es viable en una GPU de 24-80 GB para pruebas internas de inferencia multimodal, no para producción sin evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 17,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 24 GB es el mínimo razonable y 40-80 GB lo cómodo para contextos largos.
- Cuantización: no se publican versiones GGUF ni AWQ/GPTQ; habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para inferencia bf16 sin cuantizar; RTX 4090 24 GB posible con contextos cortos y batch pequeño.
- GPU de consumo: cabe en RTX 4090/3090 (24 GB) en bf16 con limitaciones de contexto y batch; en GPUs de 16 GB requeriría cuantización, no publicada.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles segun los tags; vLLM, TGI, llama.cpp u Ollama no están confirmados en la informacion disponible.
- Latencia y throughput: no disponibles; dependen del hardware, la longitud de contexto y el número de imágenes por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| posterior-learning/ppo-qwen3-vl-8b-thinking | 8,77B | no disponible | no disponible | Hugging Face, safetensors | Base + LoRA PPO fusionado, 50 pasos |
| Qwen/Qwen3-VL-8B-Thinking | no disponible en la informacion | no disponible | no disponible | Hugging Face | Modelo base sin ajuste RL |
| Otros VLM de ~8B (p. ej. familia LLaVA o InternVL) | ~7-8B | no disponible | no disponible | Hugging Face | No se dispone de datos comparativos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- No hay model card sustantiva: se desconoce la licencia, los idiomas soportados y las restricciones de uso comercial; hay que consultar la licencia del base Qwen3-VL-8B-Thinking antes de cualquier despliegue.
- El ajuste es muy corto (50 pasos globales de PPO) y no se documenta la recompensa ni el dataset; el efecto sobre el comportamiento del modelo es incierto y no está medido con benchmarks.
- La fusión en bf16 puede producir diferencias numéricas ligeras respecto a ejecutar base + adaptador en tiempo de inferencia.
- Riesgo de alucinación y sesgos: no evaluados en la informacion disponible; se heredan los del base, sin datos específicos.
- El adaptador original no está publicado en Hugging Face, solo su hash; la reproducibilidad exacta del entrenamiento no está garantizada.
- Sin cuantizaciones publicadas, el despliegue en GPUs de consumo queda limitado a bf16 con contexto reducido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/posterior-learning/ppo-qwen3-vl-8b-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking
