# lugman/LFM2.5-350M-KK-Haiku-5.5-Flow-3to5-3000-SFT-adapter

## Resumen

El modelo `lugman/LFM2.5-350M-KK-Haiku-5.5-Flow-3to5-3000-SFT-adapter` es un ajuste fino (fine-tune) del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario lugman. Se trata de un adaptador de tipo SFT (supervised fine-tuning) entrenado con la librería Unsloth sobre la arquitectura LFM2 de Liquid AI, una familia de modelos disenada para despliegue eficiente en dispositivos de borde. El nombre del repositorio sugiere un entrenamiento orientado a un flujo de trabajo especifico (posiblemente generacion de haikus o un pipeline de 3 a 5 pasos con 3000 ejemplos), aunque la model card no documenta estos detalles.

El modelo hereda las caracteristicas del LFM2.5-350M: una arquitectura compacta de aproximadamente 350 millones de parametros, pensada para inferencia rapida en CPU y GPU de consumo. Al ser un adaptador SFT, su proposito es especializar el modelo base en una tarea concreta, pero la falta de documentacion sobre el dataset de entrenamiento, los hiperparametros y los resultados limita su evaluacion rigurosa.

En el momento de la publicacion (noviembre de 2026), el repositorio no registra descargas ni interacciones, y su tamano es practicamente nulo (0.0 GB), lo que sugiere que los pesos del adaptador podrian no estar completamente subidos o que el repositorio contiene unicamente la configuracion. Es relevante como ejemplo de fine-tuning ligero con Unsloth sobre la familia LFM2, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM2 de Liquid AI; detalles no disponibles) |
| Parametros totales | ~350M (heredados del modelo base LiquidAI/LFM2.5-350M) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador SFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador de fine-tuning supervisado (SFT) sobre LiquidAI/LFM2.5-350M. La arquitectura subyacente corresponde a la familia LFM2 de Liquid AI, descrita en la model card mediante el tag `lfm2`, pero la informacion proporcionada no detalla si se trata de un transformer denso, un modelo hibrido con capas de espacio de estados (SSM) o alguna variante especifica de la familia. El tamano de 350M parametros situa al modelo en la categoria de modelos pequenos, optimizados para inferencia de baja latencia.

El entrenamiento se realizo con Unsloth, segun indica la model card, que afirma que el modelo se entreno "2x faster" con esta libreria. El nombre del repositorio (`KK-Haiku-5.5-Flow-3to5-3000-SFT-adapter`) sugiere un dataset de 3000 ejemplos y un flujo de 3 a 5 pasos, pero no se documenta la composicion del dataset, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican los hiperparametros del SFT (learning rate, epochs, rango LoRA, etc.).

## Capacidades

- Generacion de texto en ingles, heredada del modelo base LFM2.5-350M.
- Especializacion en la tarea concreta del adaptador SFT (no documentada en la model card; el nombre sugiere generacion de haikus o un flujo de trabajo de 3 a 5 pasos).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de fine-tuning ligero: el adaptador sirve como ejemplo reproducible de SFT con Unsloth sobre un modelo de 350M, util para equipos que quieran validar su pipeline de entrenamiento antes de escalar a modelos mayores.
- Generacion creativa de texto corto: si el adaptador esta especializado en haikus (como sugiere el nombre), puede emplearse para generar poemas breves en ingles con un estilo controlado.
- Experimentacion academica con modelos pequenos: adecuado para estudiar el efecto del SFT en modelos de menos de 500M parametros en entornos con recursos limitados.
- Inferencia en dispositivos de borde: al heredar el tamano de 350M del modelo base, podria desplegarse en CPU o GPU de consumo, aunque la falta de pesos verificables impide confirmar su viabilidad practica.
- Base para comparativas de adaptadores: util como punto de referencia en estudios sobre el impacto de distintos datasets SFT en la familia LFM2.
- Demostracion de flujos de 3 a 5 pasos: si el nombre refleja un pipeline multi-paso, podria usarse para ilustrar tecnicas de descomposicion de tareas en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo denso de 350M parametros en fp16 requiere aproximadamente 0,7 GB de VRAM solo para los pesos, pero este dato no esta confirmado para este adaptador.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del modelo base sugiere que podria caber en GPUs de consumo, pero la ausencia de pesos verificables impide asegurarlo.
- Opciones de despliegue: la model card menciona compatibilidad con `text-generation-inference` y `transformers`; no se documenta soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lugman/LFM2.5-350M-KK-Haiku-5.5-Flow-3to5-3000-SFT-adapter | ~350M | no disponible | apache-2.0 | Repositorio con 0 descargas, tamano 0.0 GB |
| LiquidAI/LFM2.5-350M (modelo base) | ~350M | no disponible | no disponible en la informacion proporcionada | Modelo base de referencia |
| Otros adaptadores SFT sobre LFM2 | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, los hiperparametros ni los resultados, lo que impide evaluar la calidad del adaptador.
- El repositorio tiene un tamano de 0.0 GB y cero descargas, lo que sugiere que los pesos podrian no estar disponibles o que el repositorio esta incompleto.
- El modelo esta limitado al idioma ingles (`language: en`), sin soporte multilingue documentado.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion proporcionada; al ser un modelo de 350M, es probable que tenga limitaciones significativas en razonamiento y factualidad, aunque no se aportan datos concretos.
- Licencia apache-2.0: permite uso comercial, pero el autor no proporciona garantias ni documentacion sobre el origen de los datos de entrenamiento.
- No se recomienda su uso en produccion sin una evaluacion previa del adaptador y la verificacion de que los pesos estan correctamente subidos.
- La fecha de creacion (2026-11-20) y la ausencia de actividad sugieren que el repositorio podria ser un experimento personal sin mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-KK-Haiku-5.5-Flow-3to5-3000-SFT-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
