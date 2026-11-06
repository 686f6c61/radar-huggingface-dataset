# fdsffjdkf/ClearTrans-3B-SFT-Go-to-Python

## Resumen

ClearTrans-3B-SFT-Go-to-Python es un checkpoint de ajuste fino supervisado (SFT) derivado de Qwen/Qwen2.5-Coder-3B, publicado por el usuario fdsffjdkf como parte del artefacto ClearTrans. Su unica tarea objetivo es la traduccion de codigo fuente de Go a Python. El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-Coder-3B, con 3.085.938.688 parametros totales, y se distribuye en formato safetensors con la libreria transformers.

El checkpoint forma parte de una release de artefactos de investigacion, no de un modelo de produccion. El propio autor advierte que no se ha validado la inferencia en GPU ni la reproduccion de benchmarks para esta release, y que el modelo solo ha superado comprobaciones de tamano de ficheros, disposicion de tensores e indices de shards. La licencia es la Qwen Research License Agreement, lo que restringe el uso a investigacion y evaluacion no comercial.

Su relevancia es acotada: sirve como referencia para experimentos de traduccion automatica de codigo entre lenguajes y como punto de partida para quien quiera reproducir o extender el pipeline ClearTrans. No debe considerarse un modelo generalista ni un sustituto de Qwen2.5-Coder-3B para tareas de generacion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, derivado de Qwen2.5-Coder-3B) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Qwen Research License Agreement (no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full SFT) de Qwen2.5-Coder-3B, un transformer decoder-only con atencion causal. No se trata de un LoRA ni de una adaptacion parcial: los pesos completos fueron modificados mediante entrenamiento supervisado. La metadata de entrenamiento registra Transformers 4.57.1 y PyTorch 2.9.1, con un learning rate de 1e-05, scheduler coseno, optimizador AdamW fused (betas 0.9/0.999, epsilon 1e-08), 3 epocas, batch total de 64 (batch de 1 por dispositivo, 8 GPUs, 8 pasos de acumulacion de gradiente) y semilla 42.

El dataset de entrenamiento se identifica como `train_full_1231_go2python_idx3`, especifico para la direccion Go a Python, pero los ejemplos no se incluyen en el repositorio y el autor senala que el nombre por si solo no verifica la procedencia ni el procedimiento de reconstruccion. No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. El autor aclara explicitamente que este checkpoint no debe interpretarse como un modelo final entrenado con GRPO.

## Capacidades

- Traduccion de codigo de Go a Python como tarea principal y unica direccion soportada.
- Generacion de texto y codigo heredada del modelo base Qwen2.5-Coder-3B.
- Conversacion multi-turno mediante la plantilla de chat incluida en el checkpoint.
- No se documenta soporte de tool calling ni function calling especifico para este checkpoint.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan modos especiales (thinking mode, vision, audio).

## Casos de uso

- Migracion asistida de bases de codigo Go a Python: el modelo puede transformar ficheros o funciones individuales como primer paso de una migracion, con revision humana posterior y tests automatizados sobre el resultado.
- Generacion de prototipos en Python a partir de implementaciones de referencia en Go: util para equipos que mantienen servicios en Go y necesitan equivalentes en Python para analisis de datos o scripts internos.
- Investigacion en traduccion automatica de codigo: el checkpoint sirve como baseline SFT para comparar con variantes GRPO u otros enfoques dentro del proyecto ClearTrans.
- Construccion de datasets sinteticos de pares Go-Python: las salidas del modelo pueden filtrarse con tests y usarse como datos de entrenamiento adicionales, siempre con validacion.
- Evaluacion de pipelines de traduccion con verificacion funcional: integrable en un flujo que ejecute tests unitarios sobre el codigo generado para medir tasas de exito.
- Docencia y experimentacion: permite ilustrar tecnicas de SFT sobre modelos de codigo de 3B parametros en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la reproduccion de benchmarks no ha sido validada para esta release y que no se atribuye ninguna puntuacion concreta del manuscrito a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 8-10 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,5-4 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2-2,5 GB para pesos.
- GPU recomendadas: A100, H100 o L40S para inferencia en fp16 con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para fp16 en contextos cortos.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16, y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (segun la model card), text-generation-inference (tag presente), vLLM y llama.cpp/Ollama si se generan pesos GGUF, aunque no se distribuyen en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones para esta release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-Go-to-Python | 3,09 B | no disponible | Traduccion Go a Python | Qwen Research (no comercial) | Hugging Face, safetensors |
| Qwen2.5-Coder-3B | 3,09 B | 32.768 tokens (segun el modelo base) | Generacion de codigo general | Apache 2.0 (modelo base) | Hugging Face, amplia variedad de formatos |
| CodeLlama-7B | 7 B | 16.384 tokens | Generacion de codigo general | Llama 2 Community | Hugging Face, GGUF, etc. |
| StarCoder2-3B | 3 B | 16.384 tokens | Generacion de codigo general | BigCode OpenRAIL-M | Hugging Face, GGUF, etc. |

La comparacion directa con modelos de traduccion de codigo especializados no esta disponible en la informacion proporcionada. Frente a Qwen2.5-Coder-3B, este checkpoint pierde la licencia Apache 2.0 y la validacion de inferencia, y gana especializacion en una unica direccion de traduccion.

## Limitaciones y advertencias

- El autor advierte que las traducciones generadas pueden contener errores funcionales y code smells; es obligatorio validar con tests y herramientas de analisis antes de usarlas.
- No se ha validado la inferencia en GPU ni la reproduccion de benchmarks para esta release; solo se comprobaron tamanos de fichero, disposicion de tensores e indices de shards.
- El repositorio no incluye datos de entrenamiento, estados del optimizador ni salidas de evaluacion historicas, por lo que no constituye evidencia de reproduccion numerica completa.
- Licencia Qwen Research: uso limitado a investigacion y evaluacion no comercial; no se relicencia bajo MIT ni Apache 2.0.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en traduccion de codigo puede manifestarse como APIs inexistentes o semantica alterada.
- No se documentan sesgos conocidos ni limitaciones de idioma; los idiomas soportados figuran como no disponibles.
- La longitud de contexto no se especifica en la informacion proporcionada; conviene consultar la del modelo base antes de usarlo con entradas largas.
- El checkpoint no debe presentarse como un modelo final GRPO ni atribuirsele puntuaciones del manuscrito asociado.

## Enlaces

- Hugging Face: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Go-to-Python
- Repositorio ClearTrans: https://github.com/Xingzhehu/ClearTrans
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
