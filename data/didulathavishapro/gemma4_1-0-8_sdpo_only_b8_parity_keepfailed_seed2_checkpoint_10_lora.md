# DidulaThavishaPro/gemma4_1-0-8_sdpo_only_b8_parity_keepfailed_seed2_checkpoint_10_lora

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) para el modelo Gemma 4 E4B, especializado en la generación de código Ballerina. Lo publica el usuario DidulaThavishaPro y parte del modelo base `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`, que es a su vez un modelo Gemma sometido a un ajuste supervisado (SD-SFT) orientado a Ballerina. El adaptador se ha entrenado con una variante de optimización de política por autodestilación (SDPO) que conserva los problemas que la compuerta de ejecución descartaría, y corresponde al checkpoint de la ronda 10 de un total de 30.

Se trata de un artefacto de investigación muy específico: un adaptador de rango 16 con alpha 32, entrenado con semilla 3408, que no sustituye al modelo base sino que se aplica sobre él mediante PEFT. Su relevancia es acotada y experimental: no hay métricas publicadas, no figura pipeline definido, no se declaran idiomas y el número de descargas es cero en el momento de redactar esta ficha. Es útil principalmente para quien quiera reproducir o continuar el entrenamiento, ya que el repositorio incluye el estado del optimizador, la programación de learning rate, el profesor EMA y los estados del generador de números aleatorios en `trainer_state.pt`.

El tamaño del repositorio es de 0,6 GB, coherente con un adaptador LoRA más ficheros de tokenizer y estado de entrenamiento. La licencia declarada es la de Gemma, lo que condiciona el uso comercial conforme a los términos de Google para esta familia de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer Gemma 4 E4B; rango 16, alpha 32 |
| Parametros totales | no disponible (adaptador LoRA; el grueso de parametros reside en el modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se distribuyen en safetensors; no se declaran variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponibles |
| Licencia | gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors`) con `adapter_config.json`; libreria PEFT |

## Arquitectura y entrenamiento

El adaptador se construye sobre Gemma 4 E4B mediante PEFT, con matrices de bajo rango de rango 16 y alpha 32, aplicadas sobre el modelo base `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`. Ese modelo base es un Gemma sometido previamente a un ajuste supervisado por destilación (SD-SFT) en 16 bits, orientado a la generación de código Ballerina. Sobre esa base, este adaptador aplica una etapa de optimización de política por autodestilación (SDPO), en una variante que, a diferencia de la configuración estándar, conserva los problemas que la compuerta de ejecución (execution gate) habría descartado. El entrenamiento se ejecutó con semilla 3408 y este artefacto corresponde a la ronda 10 de 30.

El repositorio incluye `trainer_state.pt` con el estado del optimizador, la programación de learning rate, el profesor EMA y los estados del generador aleatorio, lo que permite reanudar el entrenamiento desde este checkpoint. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código Ballerina, especialidad declarada del adaptador y del modelo base sobre el que se aplica.
- Aplicación como adaptador PEFT sobre el modelo base mediante `PeftModel.from_pretrained`.
- Reanudación de entrenamiento a partir del estado guardado (optimizador, scheduler, profesor EMA, RNG).
- Capacidades generales heredadas del modelo base Gemma 4 E4B: no disponibles en detalle en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modos especiales (thinking, vision, audio): no disponibles.

## Casos de uso

- Investigación sobre SDPO aplicado a generación de código: permite estudiar cómo afecta al adaptador la variante que conserva los problemas descartados por la compuerta de ejecución, comparándola con la variante estándar.
- Reproducción de experimentos: el checkpoint y `trainer_state.pt` permiten reanudar el entrenamiento desde la ronda 10 de 30 con la misma semilla (3408) y continuar hasta la ronda final.
- Evaluación de adaptadores LoRA sobre Gemma 4 E4B: sirve como ejemplo práctico de aplicación de PEFT con rango 16 y alpha 32 sobre un modelo base de 16 bits.
- Desarrollo asistido de código Ballerina en entornos controlados: aplicado sobre el modelo base, puede emplearse para generar borradores de código en este lenguaje, siempre con revisión humana dada la ausencia de métricas publicadas.
- Estudio de pipelines de destilación con profesor EMA: el estado guardado incluye el profesor EMA, lo que facilita analizar dinámicas de autodestilación en tareas de código.
- Integración en flujos de experimentación con Hugging Face PEFT: como artefacto de referencia para probar cargas de adaptadores y plantillas de chat (`chat_template.jinja`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende del modelo base Gemma 4 E4B en 16 bits sobre el que se aplica.
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: no disponible (depende del modelo base y de la cuantización empleada).
- Opciones de despliegue: carga mediante PEFT (`PeftModel.from_pretrained`) sobre el modelo base; el modelo base se distribuye en formato de 16 bits para vLLM según su nombre, aunque no se confirman detalles de despliegue.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA SDPO sobre Gemma 4 E4B, Ballerina) | Adaptador rango 16, alpha 32 | no disponible | no disponible | gemma | Hugging Face, 0 descargas |
| Modelo base `didula-wso2/gemma4_1-0-8_sft_16bit_vllm` | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado métricas de evaluación, por lo que el rendimiento real en generación de código Ballerina es desconocido.
- El adaptador está guardado en la ronda 10 de 30: no representa el resultado final del entrenamiento y puede estar infraentrenado respecto al checkpoint final.
- La variante conserva los problemas que la compuerta de ejecución descartaría, lo que puede introducir ejemplos de menor calidad en el ajuste.
- No requiere uso aislado: debe aplicarse sobre `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`, no sobre un Gemma 4 E4B genérico.
- No se declaran idiomas soportados; la especialización en Ballerina limita la utilidad fuera de ese dominio.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google para la familia Gemma, que conviene revisar antes de producción.
- Riesgo de alucinación inherente a los modelos generativos de código; se recomienda validación mediante ejecución y revisión humana.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Repositorio con cero descargas y sin pipeline definido: artefacto experimental sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_1-0-8_sdpo_only_b8_parity_keepfailed_seed2_checkpoint_10_lora
- Modelo base: https://huggingface.co/didula-wso2/gemma4_1-0-8_sft_16bit_vllm
