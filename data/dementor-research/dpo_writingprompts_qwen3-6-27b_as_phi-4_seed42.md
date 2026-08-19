# dementor-research/dpo_writingprompts_qwen3.6-27b_as_phi-4_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3.6-27B, como parte de un estudio de imitación de comportamiento definido por configuración llamado "dementor". El adaptador, identificado como `dpo_writingprompts_qwen3.6-27b_as_phi-4_seed42`, está diseñado para ajustar el comportamiento del modelo base hacia el estilo de generación de escritura de un modelo de referencia (aparentemente Phi-4), utilizando un conjunto de prompts de escritura como dominio de entrenamiento.

El entrenamiento se realizó con el framework Tinker de Thinking Machines, con un rango LoRA de 32 y aplicando la adaptación a todas las capas lineales (`target_modules=all-linear`). El repositorio contiene únicamente los pesos del adaptador (1.0 GB en formato safetensors), no el modelo completo, por lo que su uso requiere cargar primero el modelo base Qwen3.6-27B. La relevancia de esta pieza radica en su naturaleza experimental: forma parte de una campaña más amplia con 12 modelos, 4 datasets y 1 semilla, que genera 528 celdas de configuración para estudiar la imitación de comportamiento a través de DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adaptador sobre Qwen/Qwen3.6-27B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 32, pero no se especifica el numero exacto de parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (los pesos del adaptador estan en safetensors, el modelo base puede cuantizarse) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con DPO, una tecnica de optimizacion de preferencias que ajusta el modelo para favorecer respuestas preferidas frente a rechazadas, tipicamente usando un modelo de recompensa implicito. En este caso, el entrenamiento se realiza sobre el modelo base Qwen/Qwen3.6-27B, un transformer causal de 27 mil millones de parametros (segun el nombre del modelo). El adaptador LoRA tiene rango 32 y se aplica a todas las capas lineales, lo que permite un ajuste eficiente en parametros. El dataset utilizado es de "writing prompts" (prompts de escritura), y el objetivo es imitar el comportamiento de un modelo de referencia identificado como "phi-4". No se especifican detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas previas de RLHF o SFT. La campana incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuracion, lo que sugiere un estudio sistematico de hiperparametros y configuraciones.

## Capacidades

- Generacion de texto en estilo de escritura creativa, orientado a imitar el comportamiento de Phi-4 en prompts de escritura.
- Adaptacion mediante LoRA: no requiere modificar el modelo base, solo cargar el adaptador con PEFT.
- Integrable con el ecosistema Hugging Face Transformers y PEFT.
- Capacidades adicionales dependen del modelo base Qwen3.6-27B, que no estan documentadas en esta ficha (razonamiento, codigo, etc.), pero no se pueden asumir sin verificacion.

## Casos de uso

- Investigacion academica sobre imitacion de comportamiento y DPO: permite estudiar como un adaptador LoRA puede transferir el estilo de generacion de un modelo a otro, util para experimentos en alineacion y personalizacion de modelos.
- Generacion de textos creativos controlados: si el modelo base tiene buenas capacidades de escritura, este adaptador puede usarse para producir textos con un estilo especifico similar al de Phi-4, por ejemplo para prototipos de escritura asistida.
- Benchmarking de tecnicas de preferencia: como parte de la campana dementor, este adaptador sirve para comparar configuraciones de DPO (rango, datasets, seeds) en un entorno controlado.
- Desarrollo de asistentes de escritura: si se integra con el modelo base, podria emplearse en herramientas de redaccion que requieran un tono o estilo particular, aunque requiere validacion previa.
- Experimentos de adaptacion de bajo costo: al ser un adaptador LoRA, es adecuado para entornos con recursos limitados donde no se puede hacer fine-tuning completo.
- Reproducibilidad cientifica: el repositorio ofrece un punto de partida para reproducir los resultados de la campana y explorar variaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este adaptador ni para el modelo base en este contexto.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del modelo base Qwen3.6-27B (27B parametros). Para inferencia en FP16 se necesitarian al menos 54 GB de VRAM, y con cuantizacion 4-bit alrededor de 14-16 GB, pero estos son valores estimados generales, no confirmados para este adaptador.
- GPU recomendadas: para el modelo base, GPUs como A100 (40/80 GB), H100 (80 GB) o multiples RTX 4090 (24 GB) en paralelo serian adecuadas. El adaptador LoRA anade una carga minima adicional.
- No cabe en una GPU consumer de 8-12 GB sin cuantizacion agresiva (4-bit o menos) y aun asi seria ajustado.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI, o directamente con Transformers + PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la informacion del repositorio. El adaptador es especifico para Qwen3.6-27B y no se puede comparar directamente con otros adaptadores sin datos adicionales.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo completo: requiere cargar el modelo base Qwen/Qwen3.6-27B, lo que implica descargar y gestionar ambos componentes.
- No se especifica la licencia del adaptador ni del modelo base en la informacion proporcionada; verificar antes de uso comercial.
- No hay datos sobre sesgos, alucinaciones o limitaciones de idioma; estos dependen del modelo base y no estan documentados.
- El entrenamiento se centra en prompts de escritura, por lo que su rendimiento fuera de ese dominio puede ser impredecible.
- La fecha de creacion (2026-08-16) es futura respecto a la fecha actual; esto podria indicar un error en los metadatos o un modelo hipotetico.
- No hay garantias de que el adaptador funcione correctamente con versiones posteriores del modelo base si Qwen3.6-27B cambia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_writingprompts_qwen3.6-27b_as_phi-4_seed42
- Framework Tinker (mencionado en la model card): https://thinkingmachines.ai/tinker/
- Modelo base (referenciado): https://huggingface.co/Qwen/Qwen3.6-27B (enlace inferido del nombre, no verificado)
