# mobilegym/gui-agent-openmobile2-9b-grpo-step50

## Resumen

GUI Agent OpenMobile-2 9B — training step 50 es un checkpoint intermedio de un agente de interfaz grafica para Android, obtenido por ajuste fino del modelo base OpenMobile-2/OpenMobile-2-9B mediante aprendizaje por refuerzo con el algoritmo Anchor-GRPO dentro del simulador MobileGym. Lo publica la organizacion mobilegym y su proposito es operar pantallas de aplicaciones moviles: interpretar capturas de pantalla junto con instrucciones en lenguaje natural y emitir acciones sobre la UI (toques, deslizamientos, texto, navegacion).

El modelo emplea la arquitectura `Qwen3_5ForConditionalGeneration` (familia Qwen 3.5, multimodal imagen-texto) con 9.409.813.744 parametros totales en pesos safetensors y un repositorio de 18,8 GB. Al ser un export del actor en el paso 50 de entrenamiento, no es un modelo final: la propia model card indica que no se afirman resultados de evaluacion, por lo que debe tratarse como un artefacto de investigacion reproducible mas que como un producto listo para produccion.

Su relevancia actual reside en que documenta de forma explicita la receta de RL (recompensa terminal por exito de objetivo, coeficiente de recompensa de proceso, ponderacion de ventaja por accion y penalizacion por errores de formato), lo que permite estudiar la evolucion del entrenamiento de agentes GUI y reutilizar la configuracion en pipelines propios. La licencia Apache 2.0 facilita ese uso, incluido el comercial, siempre que se respeten las condiciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal imagen-texto, `model_type: qwen3_5`) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con tokenizer, processor, chat template y generation config incluidos |

## Arquitectura y entrenamiento

El modelo parte de OpenMobile-2/OpenMobile-2-9B, un checkpoint de la familia Qwen 3.5 con cabecera condicional para generacion a partir de imagen y texto. El pipeline declarado es `image-text-to-text`, lo que encaja con el bucle tipico de un agente GUI: la observacion es una captura de pantalla y la salida es una accion serializada. El export incluye el processor y la plantilla de chat originales, requisito imprescindible para reproducir el preprocesado de imagenes y el formato de dialogo con el que se entreno.

El ajuste se realizo con Anchor-GRPO en el simulador MobileGym, en la ejecucion `openmobile2-9b-think-history-fromstep2-20261106`, exportando `global_step_50/actor/huggingface`. La recompensa combina un termino terminal de exito del objetivo con un termino de proceso ponderado por `anchor_lambda = 3.0`, una ventaja por accion con `tool_advantage_kappa = 0.25` y una penalizacion de ventaja por errores de formato con `format_advantage_coef = 1.0`. La normalizacion de la perdida de politica usa longitud fija de 1024. El nombre de la ejecucion sugiere un historial de razonamiento (modo think) heredado desde el paso 2, aunque la model card no detalla la composicion del dataset ni el numero de tokens de entrenamiento. El fichero `model-provenance.json` recoge hashes SHA-256 y tamanos del manifiesto de checkpoint; no se incluyen estados del optimizador, shards distribuidos, trazas de tareas ni credenciales.

## Capacidades

- Percepcion visual de capturas de pantalla de Android y generacion de acciones sobre la interfaz a partir de instrucciones en lenguaje natural.
- Razonamiento multi-paso orientado a objetivos: el entrenamiento con recompensa terminal y de proceso esta disenado para tareas que requieren varias interacciones hasta completar el objetivo.
- Emision de acciones estructuradas tipo tool calling (la model card menciona ventaja por accion y penalizacion por errores de formato, lo que implica un esquema de acciones validable).
- Modo de razonamiento (think) heredado de la ejecucion de entrenamiento, segun el identificador `think-history`.
- Capacidades multilingues: no disponible.
- Vision general fuera del dominio movil: no disponible; el ajuste esta especializado en GUI Android.

## Casos de uso

- Automatizacion de pruebas de regresion en Android: el agente puede recibir una captura del emulador y una instruccion ("abre Ajustes y desactiva el wifi") y emitir la secuencia de toques para completarla, integrandose en pipelines de CI que validan flujos de UI sin scripts fragiles.
- Investigacion en aprendizaje por refuerzo para agentes: al ser un checkpoint intermedio con hiperparametros publicados (Anchor-GRPO, `anchor_lambda`, `tool_advantage_kappa`), sirve como punto de comparacion para estudiar la curva de aprendizaje entre pasos.
- Generacion de datos sinteticos de interaccion: ejecutando el modelo sobre el simulador MobileGym se pueden recolectar trazas de acciones etiquetadas por exito, utiles para entrenar modelos mas pequenos o destilados.
- Asistencia a usuarios en tareas repetitivas dentro de apps: dado un objetivo acotado y una pantalla concreta, el modelo propone la accion siguiente, lo que permite construir un copiloto que sugiere pasos en lugar de ejecutarlos.
- Evaluacion de robustez de agentes GUI: comparar este paso 50 con checkpoints posteriores o con el modelo base para medir el efecto del RL en la tasa de exito y en la tasa de errores de formato.
- Prototipado de automatizacion RPA movil en entornos controlados: con licencia Apache 2.0 y pesos completos, un equipo puede desplegar el modelo en un emulador aislado para validar flujos internos antes de invertir en un agente propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirman resultados de evaluacion para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19 GB solo para pesos (9,41 mil millones de parametros), mas overhead de activaciones y del encoder visual; en la practica se recomienda reservar 24 GB o mas.
- Cuantizacion a 8 bits: en torno a 10-11 GB de pesos; a 4 bits, en torno a 5-6 GB, aunque el repositorio no publica versiones GGUF ni AWQ/GPTQ y habria que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para servicio concurrente; una RTX 4090 de 24 GB es suficiente para inferencia en BF16 con lote pequeno.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en BF16; en tarjetas de 12-16 GB solo con cuantizacion, que no esta publicada.
- Opciones de despliegue: transformers con una version que soporte `Qwen3_5ForConditionalGeneration`, preservando processor y chat template; vLLM o TGI si su version soporta el `model_type`; llama.cpp/Ollama requeririan conversion previa a GGUF, no incluida.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GUI Agent OpenMobile-2 9B (step 50) | 9,41 B | no disponible | Agente GUI Android, RL con Anchor-GRPO | Apache 2.0 | Pesos safetensors en Hugging Face |
| OpenMobile-2/OpenMobile-2-9B (base) | 9 B (segun nombre) | no disponible | Agente GUI movil pre-RL | no disponible en la informacion | Hugging Face |
| Alternativas de agente GUI de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 50): no es un modelo final y su calidad no esta validada; la model card no afirma resultados de evaluacion.
- Especializado en GUI Android dentro del simulador MobileGym; el rendimiento en dispositivos reales, otras plataformas o interfaces web no esta documentado.
- Riesgo de alucinacion de acciones: puede emitir toques o secuencias que no corresponden a elementos presentes en la pantalla, especialmente fuera de la distribucion de entrenamiento.
- Sensible al formato de accion: el entrenamiento penaliza errores de formato, pero el modelo puede producirlos, lo que exige validacion y reintentos en produccion.
- Sesgos: no documentados por el autor; al heredar el modelo base, puede arrastrar sesgos de sus datos de preentrenamiento.
- Idiomas soportados no declarados; no se garantiza cobertura multilingue.
- Licencia Apache 2.0 en este export, pero conviene verificar las condiciones del modelo base OpenMobile-2-9B antes de un uso comercial.
- No se incluyen estados del optimizador ni shards de entrenamiento, por lo que no es posible reanudar el entrenamiento desde este repositorio tal cual.
- Requiere una version de Transformers con soporte de `Qwen3_5ForConditionalGeneration`; versiones antiguas fallaran al cargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mobilegym/gui-agent-openmobile2-9b-grpo-step50
- Modelo base: https://huggingface.co/OpenMobile-2/OpenMobile-2-9B
- Organizacion en Hugging Face: https://huggingface.co/mobilegym
- Paper, blog, repositorio o demo de MobileGym: no disponible en la informacion proporcionada.
