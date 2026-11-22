# helloelwin/ot-distill-gptoss20b-t9-6ep-lora

## Resumen

`ot-distill-gptoss20b-t9-6ep-lora` es un adaptador LoRA para el modelo `openai/gpt-oss-20b`, desarrollado por el usuario helloelwin dentro del proyecto ot-distill. El adaptador se obtiene por destilación (distillation) de trayectorias de agente Terminus-2 generadas por GLM 5.3 Flash sobre el conjunto de datos `yixiaoh/OT-SFT-Data` (configuración `T9-3.16k-sft-v0`, 2.701 filas). El objetivo es transferir al estudiante (gpt-oss-20b) la capacidad de razonar y emitir acciones de agente en formato JSON con el protocolo Terminus-2.

El modelo base es un transformer MoE de OpenAI con pesos MXFP4 y plantilla de chat harmony. El adaptador entrena 1.48B parámetros (LoRA de rango 128 sobre atención y sobre los 32 expertos) en bf16, con los pesos de expertos dequantizados durante el entrenamiento. La relevancia actual reside en que es un ejemplo concreto de destilación de trayectorias de agente sobre un modelo open weight de 20B, un patrón habitual para especializar modelos pequeños en tareas de tool use y multi-step reasoning sin reentrenar desde cero.

La información publicada es limitada: no hay evaluación, no se declara licencia, no hay benchmarks y no se especifican idiomas soportados. El autor indica explícitamente que no se ejecutaron evaluaciones para este estudiante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE `openai/gpt-oss-20b` |
| Parámetros totales | no disponible para el adaptador; el modelo base es gpt-oss-20b |
| Parámetros activos | no disponible para el adaptador; el modelo base es MoE de gpt-oss-20b |
| Parámetros entrenables (LoRA) | 1.480.000.000 (1.48B) |
| Longitud de contexto | 32.768 tokens (truncación usada en entrenamiento; contexto del modelo base no confirmado en la información) |
| Tipos de cuantización | MXFP4 en el modelo base; entrenamiento con expertos dequantizados a bf16; no se listan cuantizaciones del adaptador |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | `openai/gpt-oss-20b` |
| Dataset de destilación | `yixiaoh/OT-SFT-Data`, config `T9-3.16k-sft-v0`, 2.701 filas |
| Rango LoRA / alpha | 128 / 256 |
| Módulos objetivo | atención (q, k, v, o) y `gate_up_proj` y `down_proj` de los 32 expertos |
| Subcarpetas | `epoch-1`, `epoch-6` |
| Tamaño del repo | 5,9 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/gpt-oss-20b`, un transformer con mezcla de expertos (MoE) cuyos pesos de expertos están almacenados en MXFP4. El entrenamiento LoRA se realizó con los pesos de expertos dequantizados a bf16 y utiliza la funcionalidad `target_parameters` de PEFT para inyectar un LoRA de rango 128 en cada uno de los 32 expertos, además de en las proyecciones de atención (q, k, v, o). El dropout de LoRA se fija a 0 porque PEFT no soporta dropout sobre los parámetros fusionados de los expertos. Se usó precisión bf16 y flex attention.

Los datos de entrenamiento son trayectorias de agente Terminus-2 generadas por GLM 5.3 Flash, en formato harmony. Cada conversación comienza con el mensaje de sistema por defecto de gpt-oss (con `Reasoning: medium`); los turnos del usuario son mensajes `user` y cada turno del asistente se compone de un mensaje `analysis` con el razonamiento de GLM seguido de un mensaje `final` con la acción JSON de Terminus-2. La pérdida se calcula solo sobre los turnos del asistente. Las secuencias se truncaron a 32.768 tokens (905 de 2.701 filas truncadas). El estudiante aprendió a cerrar cada mensaje `final` con `<|return|>`, mientras que los turnos anteriores aparecen en contexto cerrados por `<|end|>`. Los mensajes `analysis` de turnos anteriores se mantuvieron en contexto durante el entrenamiento, algo que la plantilla de chat de gpt-oss descarta por defecto, por lo que hay que pasarlos explícitamente para replicar las condiciones de entrenamiento.

Hiperparámetros: learning rate máximo 3e-4, decaimiento coseno durante 6 épocas tras un warmup del 3% (1.014 pasos), batch efectivo 16 (8 A100 con acumulación 2, FSDP2), 28,6M de tokens entrenados por época. La pérdida media por época fue 1.230 y 1.041 (parcial). No se reporta uso de RLHF ni DPO.

## Capacidades

- Generación de razonamiento en el canal `analysis` y emisión de acciones finales en formato JSON de Terminus-2.
- Ejecución de trayectorias de agente multi-paso (multi-step reasoning) con historial de turnos previos.
- Soporte del protocolo de agente Terminus-2, orientado a tool use y acciones estructuradas.
- Formato de chat harmony propio de gpt-oss, con mensajes `analysis` y `final` separados.
- Capacidades multilingües: no disponible (no declaradas).
- Capacidades de visión o audio: no disponible (no declaradas).
- Modo thinking: sí, mediante el canal `analysis` con `Reasoning: medium` en el mensaje de sistema.

## Casos de uso

- Automatización de agentes de terminal: el adaptador está entrenado sobre trayectorias Terminus-2, por lo que puede emitir acciones JSON para entornos de línea de comandos y tareas de sistema en varios pasos.
- Destilación de modelos de razonamiento grandes a modelos de 20B: sirve como referencia de receta para transferir trayectorias de un profesor (GLM 5.3 Flash) a un estudiante open weight con LoRA sobre expertos.
- Investigación en formato harmony: permite estudiar cómo se comporta gpt-oss-20b cuando se le fuerza a mantener mensajes `analysis` de turnos anteriores en contexto, algo que la plantilla por defecto descarta.
- Pipelines de evaluación de agentes: puede integrarse como estudiante en entornos de benchmark de agentes para comparar con los estudiantes Qwen del mismo proyecto.
- Fine-tuning posterior: al ser un adaptador PEFT, se puede combinar o continuar entrenando para tareas específicas de tool calling estructurado.
- Reproducción de experimentos de destilación: el repositorio incluye las subcarpetas `epoch-1` y `epoch-6`, lo que facilita comparar el efecto del número de épocas sobre el comportamiento del agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ejecutaron evaluaciones para este estudiante.

## Requisitos de hardware

- El adaptador pesa 5,9 GB en safetensors; el modelo base `openai/gpt-oss-20b` debe cargarse aparte.
- Para cargar el adaptador con `peft` se necesita `peft >= 0.17` (por `target_parameters`); el autor entrenó con transformers 5.17 y peft 0.20.
- El ejemplo de carga del autor usa `Mxfp4Config(dequantize=True)` con `dtype="bfloat16"`, lo que implica cargar el modelo base dequantizado: esto incrementa sustancialmente los requisitos de memoria frente a la inferencia MXFP4 nativa.
- Entrenamiento realizado en 8 A100 con FSDP2 y batch efectivo 16; ese es el mínimo práctico documentado para reproducir el entrenamiento.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el entrenamiento usó A100. No se confirma compatibilidad con GPUs de consumo.
- Opciones de despliegue: `transformers` + `peft`. El autor indica que no se ha probado con el soporte LoRA de vLLM. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Muestreo recomendado: temperatura 1.0.

## Comparativa con modelos similares

| Modelo | Base | Parámetros entrenables | Contexto de entrenamiento | Licencia | Evaluación |
|---|---|---|---|---|---|
| ot-distill-gptoss20b-t9-6ep-lora | gpt-oss-20b (MoE) | 1.48B (LoRA r=128) | 32.768 tokens | no disponible | no ejecutada |
| ot-distill-qwen38-27b-t9-6ep-lora | Qwen3 27B (mismo proyecto) | no disponible | no disponible | no disponible | no disponible |
| ot-distill-qwen3-8b-t9-6ep-lora | Qwen3 8B (mismo proyecto) | no disponible | no disponible | no disponible | no disponible |

Los dos adaptadores Qwen del mismo proyecto usan el mismo dataset T9 y la misma receta (salvo el dropout de LoRA, 0.05 en los Qwen frente a 0 en este). No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- No se ejecutaron evaluaciones; no hay evidencia publicada de calidad, robustez ni tasas de éxito en tareas de agente.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- El adaptador depende de un formato de prompt muy específico (harmony con mensajes `analysis` de turnos anteriores incluidos); usar la plantilla por defecto de gpt-oss degrada la coincidencia con el entrenamiento.
- El entrenamiento se truncó a 32.768 tokens en 905 de 2.701 filas, por lo que las trayectorias largas pudieron quedar incompletas.
- Riesgo de alucinación: no cuantificado; al ser un modelo destilado de trayectorias de agente, puede generar acciones JSON sintácticamente válidas pero incorrectas.
- Sesgos: no documentados.
- El adaptador se entrenó con dropout 0 en los expertos por limitación de PEFT, lo que puede afectar a la generalización.
- No se ha probado con el soporte LoRA de vLLM; el despliegue en producción con ese backend no está validado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/helloelwin/ot-distill-gptoss20b-t9-6ep-lora
- Dataset: https://huggingface.co/datasets/yixiaoh/OT-SFT-Data
- Adaptador Qwen3 27B del mismo proyecto: https://huggingface.co/helloelwin/ot-distill-qwen38-27b-t9-6ep-lora
- Adaptador Qwen3 8B del mismo proyecto: https://huggingface.co/helloelwin/ot-distill-qwen3-8b-t9-6ep-lora
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
