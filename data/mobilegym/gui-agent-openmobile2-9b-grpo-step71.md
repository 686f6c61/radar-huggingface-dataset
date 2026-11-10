# mobilegym/gui-agent-openmobile2-9b-grpo-step71

## Resumen

El modelo `mobilegym/gui-agent-openmobile2-9b-grpo-step71` es un checkpoint intermedio (paso 71) de un agente de interfaz gráfica (GUI agent) especializado en Android, desarrollado por el equipo de MobileGym. Se obtiene mediante fine-tuning con aprendizaje por refuerzo (GRPO con variante "Anchor-GRPO") sobre el modelo base `OpenMobile-2/OpenMobile-2-9B`, y está pensado para controlar aplicaciones móviles a partir de capturas de pantalla e instrucciones en lenguaje natural. Es un modelo multimodal de tipo image-text-to-text, con arquitectura `Qwen3_5ForConditionalGeneration` y 9.409.813.744 parámetros totales.

El problema que aborda es la automatización de tareas en dispositivos Android mediante agentes que interpretan la pantalla y emiten acciones (toques, deslizamientos, texto). El entrenamiento se realiza en el simulador MobileGym, con recompensas de éxito de objetivo terminal y recompensas de proceso ponderadas, lo que lo diferencia de un simple SFT sobre datos de demostración. Es relevante para quienes investigan agentes GUI, ya que publica el estado del actor en un punto concreto del entrenamiento RL y permite reproducir o continuar experimentos.

Al tratarse de un checkpoint intermedio de investigación, no se declaran resultados de evaluación en la model card. La licencia es Apache 2.0 y el export incluye tokenizer, processor, chat template y configuración de generación, lo que facilita su uso con Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (model_type: qwen3_5), transformer multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), repo de 18,8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5 (`Qwen3_5ForConditionalGeneration`), exportado desde el actor de un entrenamiento RL. El checkpoint corresponde al paso global 71 de la ejecución `openmobile2-9b-think-history-fromstep2-20261106`, partiendo del modelo `OpenMobile-2/OpenMobile-2-9B`. El método es Anchor-GRPO, con recompensa terminal por éxito del objetivo, coeficiente de recompensa de proceso `anchor_lambda = 3.0`, coeficiente de ventaja de acción `tool_advantage_kappa = 0.25` y penalización de ventaja por errores de formato `format_advantage_coef = 1.0`. La normalización de la pérdida de política usa longitud fija de 1024.

El entrenamiento se realizó en el simulador MobileGym, orientado a tareas de control de Android. El export incluye los hashes SHA-256 y tamaños del manifiesto de finalización en `model-provenance.json`, pero no incluye estado del optimizador, shards de entrenamiento distribuido, trazas de tareas ni credenciales. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles adicionales de la arquitectura interna (atención, decodificación especulativa, etc.).

## Capacidades

- Generación multimodal image-text-to-text: procesa capturas de pantalla junto con instrucciones textuales.
- Control de interfaz Android: emisión de acciones de agente (toques, gestos, entrada de texto) en el simulador MobileGym.
- Razonamiento multi-paso orientado a objetivos: el entrenamiento con recompensa de proceso y "think-history" sugiere planificación secuencial de acciones.
- Soporte de tool calling / function calling: no disponible explícitamente en la model card.
- Capacidades multilingües: no disponibles.
- Modo "thinking": el nombre de la ejecución (`think-history`) apunta a historial de razonamiento, pero no se detalla su comportamiento.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica despliegue vía infraestructura compatible.

## Casos de uso

- Automatización de pruebas de aplicaciones Android: el modelo puede ejecutar secuencias de interacción sobre la UI para validar flujos, útil por su entrenamiento específico en el simulador MobileGym.
- Investigación en agentes GUI: sirve como punto de partida o referencia intermedia para estudiar el efecto de Anchor-GRPO en el rendimiento de agentes móviles.
- Reproducción de experimentos RL: al incluir procedencia y hashes, permite auditar y comparar checkpoints de la misma ejecución.
- Asistentes de accesibilidad: interpretación de pantallas y generación de acciones para usuarios con dificultades motoras, sujeto a validación adicional.
- Extracción de información de pantallas móviles: lectura de capturas y respuesta a consultas sobre el contenido visible.
- Generación de datos sintéticos de interacción: uso del agente para producir trayectorias que alimenten otros entrenamientos o evaluaciones.
- Fine-tuning posterior: base para continuar el entrenamiento RL o aplicar SFT sobre dominios Android específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se afirman resultados de evaluación para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 19 GB solo para pesos, más overhead de activaciones y del procesador visual; se recomienda al menos 24 GB.
- Cuantización a 8 bits: en torno a 10-11 GB de pesos; a 4 bits: en torno a 5-6 GB, aunque no se publican ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio en producción; RTX 4090 (24 GB) para BF16 ajustado o cuantización.
- GPU de consumo: posible en RTX 3090/4090 con cuantización; en GPUs de 16 GB requeriría cuantización agresiva no publicada.
- Despliegue: Transformers con soporte de `Qwen3_5ForConditionalGeneration`; vLLM/TGI solo si soportan el model_type. No se ofrecen ficheros GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gui-agent-openmobile2-9b-grpo-step71 | 9,4 B | no disponible | Apache 2.0 | Checkpoint RL intermedio, especializado en Android |
| OpenMobile-2/OpenMobile-2-9B (base) | ~9 B | no disponible | no disponible | Modelo base del que parte el fine-tuning |
| Alternativas GUI agent de propósito general | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint intermedio (paso 71): no representa el estado final del entrenamiento ni un modelo validado para producción.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de rendimiento.
- Especialización estrecha: entrenado en el simulador MobileGym; puede generalizar mal a dispositivos reales o apps no vistas.
- Idiomas y contexto no documentados: riesgos de comportamiento inesperado en entradas fuera de distribución.
- Riesgo de alucinación en la interpretación de pantallas y en la selección de acciones.
- Sesgos: no documentados; al derivar de un modelo base y un simulador, puede heredar sesgos de ambos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y el carácter experimental desaconsejan su despliegue directo sin validación.
- Requiere preservar el processor y el chat template incluidos; alterarlos puede degradar el comportamiento del agente.

## Enlaces

- Hugging Face: https://huggingface.co/mobilegym/gui-agent-openmobile2-9b-grpo-step71
- Modelo base: https://huggingface.co/OpenMobile-2/OpenMobile-2-9B
- Repositorio de procedencia: `model-provenance.json` dentro del repo del modelo
