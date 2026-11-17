# Rashik24/rlhf-experiment10-genai1000-linear-epoch1-kl-budget-recovery

## Resumen

El modelo `Rashik24/rlhf-experiment10-genai1000-linear-epoch1-kl-budget-recovery` es un adaptador LoRA de preferencia (RLHF) construido sobre el modelo base multimodal `Qwen/Qwen3.5-4B`. Lo desarrolla el usuario Rashik24 en el contexto del proyecto Artsy, un sistema agéntico orientado a la generación automática de dibujos: el modelo no produce imagenes directamente, sino que emite código Python y llamadas a herramientas que un entorno de ejecución (ArtCanvas, basado en pycairo) interpreta para renderizar el resultado final. Este checkpoint es la tercera y última etapa de un pipeline de tres fases (SFT, RLVR y RLHF) y es el que el cliente del proyecto carga por defecto.

La relevancia del modelo es metodológica más que de escala: con solo 4B parámetros en el base, demuestra que una optimización de preferencias con un reward model aprendido (HPSv3) sobre un adaptador de rango 128 puede transformar radicalmente la fiabilidad de un pipeline de tool-use. Según la model card, en 150 prompts difíciles de GenAI-Bench con un tope de 12 turnos, este checkpoint generó 149/150 imágenes válidas frente a 102/150 del modelo base, con una puntuación HPSv3 normalizada media de 0,539 frente a 0,094.

Se trata de un artefacto muy específico: un adaptador PEFT de 1,2 GB que depende críticamente de las instrucciones Artsy, la API de ArtCanvas y el entorno mini-SWE para reproducir su comportamiento. Cargar los pesos aislados no reproduce la funcionalidad de dibujo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA; base de 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 128 |
| Version de Transformers validada | 5.5.4 |
| Version de PEFT validada | 0.21.3 |
| Revision del base fijada | 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a |
| Tamano del repo | 1,2 GB |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen3.5-4B`, un transformer multimodal de tipo image-text-to-text, mediante LoRA de rango 128. Incluye además una actualización de la cabeza de salida (output head), por lo que debe mantenerse adjunto a través de PEFT y, si se fusiona, preservar por separado los embeddings de entrada del modelo base. El entrenamiento se realizó con Tinker y utiliza la misma revisión fijada del base en las tres etapas del pipeline: SFT → RLVR → RLHF.

La etapa documentada aquí parte del checkpoint RLVR y se entrenó sobre 1.000 prompts durante 32 actualizaciones (una época), con batch size 32, cuatro trayectorias muestreadas por prompt y learning rate de 1e-5. El objetivo es PPO estilo Cookbook con penalización KL contra la referencia (coeficiente 0,01), referenciando el sampler de SFT. La recompensa proviene de HPSv3, un modelo aprendido de preferencia humana: las imágenes enviadas válidas reciben una puntuación normalizada de forma lineal, mientras que las salidas ausentes, rechazadas o inválidas reciben cero. El autor aclara explícitamente que la etiqueta «RLHF» se refiere a este reward model de preferencia y no a etiquetas humanas frescas para cada rollout. La última actualización se completó tras una recuperación del estado del optimizador.

## Capacidades

- Generación de código Python para dibujo: produce programas que el runtime ArtCanvas (pycairo) ejecuta para renderizar imágenes.
- Tool calling / function calling: emite llamadas a herramientas conforme al protocolo Artsy y al harness mini-SWE.
- Flujo agéntico multi-turno: planifica, escribe código, genera previews y envía el resultado final, con un tope de 12 turnos en la evaluación.
- Capacidad multimodal heredada del base Qwen3.5-4B (pipeline image-text-to-text), incluyendo el uso de imágenes de preview renderizadas como contexto.
- Optimización de calidad visual: el entrenamiento RLHF está orientado a maximizar la puntuación HPSv3 de la imagen final renderizada.
- Modo thinking desactivado por recomendación del autor (`enable_thinking=False` al aplicar la plantilla de chat).
- Idiomas: únicamente inglés.

## Casos de uso

- Generación automática de ilustraciones programáticas: el modelo escribe código pycairo que el entorno ejecuta para producir gráficos vectoriales o rasterizados; es adecuado porque su entrenamiento RLHF está optimizado precisamente para la calidad del render final.
- Investigación en RLHF y optimización de preferencias: sirve como caso de estudio reproducible de un pipeline SFT → RLVR → RLHF con reward model aprendido sobre un adaptador LoRA pequeño, útil para comparar objetivos PPO con penalización KL.
- Evaluación de agentes de tool-use: el harness mini-SWE y el tope de turnos permiten medir fiabilidad de ejecución multi-paso (149/150 imágenes válidas en la comparación publicada), lo que lo hace útil como banco de pruebas de protocolos agénticos.
- Generación de diagramas y visualizaciones técnicas: al emitir código Python, puede producir figuras reproducibles y versionables en lugar de imágenes opacas, integrándose en documentación o pipelines de publicación.
- Prototipado de asistentes creativos con sandbox de ejecución: el patrón «modelo genera código, sandbox lo ejecuta, preview vuelve al modelo» es directamente reutilizable para otros dominios de generación visual.
- Estudio de recuperación de estado del optimizador: el checkpoint documenta una recuperación de estado tras un fallo, lo que lo convierte en referencia práctica para robustez de entrenamientos RLHF largos.

## Benchmarks y rendimiento

Evaluación del autor sobre 150 prompts difíciles de GenAI-Bench, mismo harness mini-SWE y tope de 12 turnos:

| Metrica | Este checkpoint (RLHF) | Modelo base Qwen3.5-4B |
|---|---|---|
| Imagenes validas generadas | 149/150 | 102/150 |
| Puntuacion HPSv3 normalizada media | 0,539 | 0,094 |

Las imágenes ausentes cuentan como cero en la media normalizada. El autor advierte que son resultados descriptivos de una única comparación de checkpoints, no una tasa de aprobación humana ni un estudio multi-semilla. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica; al ser un adaptador sobre un base de 4B, la inferencia requiere cargar el modelo base completo más el adaptador (repo de 1,2 GB).
- GPU recomendadas: no disponible en la documentación; un base de 4B en precisión completa cabe en GPU de 24 GB (RTX 3090/4090) y en A100/H100 con holgura.
- GPU consumer: previsiblemente viable en RTX 4090 y tarjetas de 24 GB o más, aunque el dato no está confirmado por el autor.
- Despliegue: la carga validada es Transformers 5.5.4 + PEFT 0.21.3 con `PeftModel.from_pretrained` y `device_map="auto"`. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Requisito adicional crítico: el entorno Artsy, la API de ArtCanvas y el harness mini-SWE con previews renderizadas; sin ellos los pesos no reproducen el comportamiento de dibujo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (RLHF Artsy) | LoRA r128 sobre base 4B | no disponible | Tool-use para dibujo con reward HPSv3 | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Multimodal image-text-to-text | no disponible | Hugging Face |
| Checkpoint RLVR del mismo pipeline | LoRA r128 sobre base 4B | no disponible | Etapa intermedia sin RLHF | no disponible | Hugging Face (Rashik24) |
| Checkpoint SFT del mismo pipeline | LoRA r128 sobre base 4B | no disponible | Etapa inicial supervisada | no disponible | Hugging Face (Rashik24) |

No se dispone de datos de benchmarks comparativos frente a otros adaptadores de dibujo o modelos de tool-use de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del entorno: sin las instrucciones Artsy, la API de ArtCanvas y el harness mini-SWE, el adaptador no produce dibujos; los pesos por sí solos no bastan.
- Evaluación limitada: los resultados provienen de una única comparación de checkpoints sobre 150 prompts, sin multi-semilla ni validación humana independiente.
- El término «RLHF» es engañoso: la recompensa procede de HPSv3, un modelo de preferencia aprendido, no de anotaciones humanas por rollout.
- Idioma: solo inglés; no hay soporte multilingüe documentado.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución, lo que bloquea su adopción en producción sin aclaración del autor.
- Riesgo de alucinación: el modelo puede generar código Python que falle o llame a APIs inexistentes; el sandbox de ejecución es obligatorio y las salidas inválidas se puntúan como cero.
- Fusión del adaptador: incluye actualización de la cabeza de salida; una fusión incorrecta que no preserve los embeddings de entrada del base degrada el modelo.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validación por parte de la comunidad.
- Sin datos publicados de cuantización, contexto efectivo ni rendimiento en hardware, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rashik24/rlhf-experiment10-genai1000-linear-epoch1-kl-budget-recovery
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint SFT previo: https://huggingface.co/Rashik24/parti-sft-artcanvas-full-2026-11-07-qwen3.5-4b-r128-b32
- Checkpoint RLVR previo: https://huggingface.co/Rashik24/rlvr-experiment9-genai681-qwen3.5-4b-r128-b32-g4
- Repositorio del proyecto Artsy: https://github.com/RashikShahjahan/artsy-fartsy
- Notas de evaluación y gráficas: https://github.com/RashikShahjahan/artsy-fartsy/tree/main/docs/model-development
