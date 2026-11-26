# Cloudcottoncandy/kanana-1.5-8b-instruct-2505-Persona-LORA

## Resumen

`Cloudcottoncandy/kanana-1.5-8b-instruct-2505-Persona-LORA` es un adaptador LoRA de ajuste fino (fine-tuning) publicado por el usuario Cloudcottoncandy sobre el modelo base `kakaocorp/kanana-1.5-8b-instruct-2505`, desarrollado originalmente por Kakao Corp. El adaptador se ha entrenado con la librería Unsloth y el framework TRL, y se distribuye bajo licencia Apache 2.0. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que se trata de pesos de adaptador y no de un modelo completo.

El propósito declarado en la model card es el de un "persona LoRA": un ajuste fino orientado a dotar al modelo base de un estilo o personalidad concreta. La información publicada es mínima: no se detallan el dataset de entrenamiento, el número de pasos, la configuración del LoRA (rango, alpha, módulos objetivo) ni los hiperparámetros utilizados. La model card se limita a indicar el modelo base, la licencia y la herramienta de entrenamiento.

La relevancia de esta ficha es limitada pero ilustrativa: muestra el flujo típico de adaptación ligera de un LLM de 8 mil millones de parámetros con Unsloth sobre un modelo coreano (Kanana), y sirve como ejemplo de cómo un adaptador de bajo coste puede modificar el comportamiento estilístico del modelo base sin reentrenarlo por completo. No obstante, al no haber benchmarks ni documentación técnica, su evaluación rigurosa queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only (modelo base Kanana 1.5 8B Instruct) |
| Parametros totales | no disponible (el adaptador ocupa ~0,1 GB; el modelo base tiene ~8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada en esta ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base admite cuantizaciones estándar) |
| Idiomas soportados | en (según la model card; el modelo base Kanana está orientado a coreano e inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado sobre `kakaocorp/kanana-1.5-8b-instruct-2505` mediante Unsloth y TRL. Unsloth es una librería que optimiza el entrenamiento de transformers con kernels personalizados, reduciendo el uso de memoria y acelerando el proceso (el autor afirma un entrenamiento "2x faster"). El modelo base Kanana 1.5 8B es un transformer decoder-only de la familia Llama, según las etiquetas del repositorio (`llama`).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens vistos, la composición de los datos de persona, la configuración del LoRA (rango, alpha, dropout, módulos objetivo) ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documenta el proceso de evaluación. Todo ello impide reproducir el entrenamiento o auditar su calidad.

## Capacidades

- Generación de texto en inglés (idioma declarado en la model card).
- Ajuste de estilo o personalidad ("persona") sobre el comportamiento del modelo base, presumiblemente en conversación.
- Hereda las capacidades del modelo base Kanana 1.5 8B Instruct: razonamiento, código y matemáticas, aunque no se documentan explícitamente en esta ficha.
- Soporte de tool calling / function calling: no disponible (no documentado para este adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas a inglés según la model card; el modelo base soporta coreano e inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales con personalidad concreta: el adaptador permite experimentar con un tono o estilo definido sobre un modelo de 8B sin reentrenar el modelo completo, gracias a su reducido tamaño (~0,1 GB) y a la facilidad de carga con PEFT/transformers.
- Investigación en ajuste fino ligero: sirve como ejemplo reproducible del flujo Unsloth + TRL para LoRA sobre modelos Llama, útil para docencia o comparación de técnicas de adaptación.
- Generación de contenido en inglés con voz de marca: en entornos donde se requiera un registro estilístico uniforme (por ejemplo, respuestas de soporte con tono específico), el adaptador puede aplicarse sobre el modelo base y desplegarse con TGI o vLLM.
- Experimentación con roles en videojuegos o narrativa interactiva: el ajuste de persona permite generar diálogos de personajes con consistencia estilística, siempre que el modelo base tenga la calidad suficiente.
- Evaluación comparativa de adaptadores de persona: investigadores pueden usar este LoRA como línea base frente a otros adaptadores del mismo modelo base para medir deriva estilística y retención de capacidades.
- Despliegue de bajo coste en GPU de consumo: al ser un adaptador, puede combinarse con el modelo base cuantizado (por ejemplo, en 4 bits) y ejecutarse en una RTX 4090 o similar, aunque no se han publicado mediciones de latencia ni throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; para el modelo base de ~8B se estiman aproximadamente 16 GB en FP16 y 5-6 GB en cuantización de 4 bits (estimación orientativa, no publicada por el autor).
- GPU recomendadas: no disponible. Para el modelo base de 8B, GPUs como A100, H100, L40S o RTX 4090 son adecuadas; una RTX 3090/4090 con 24 GB permite FP16 ajustado o cuantización.
- ¿Cabe en GPU de consumo? Probablemente sí con cuantización (RTX 4090, RTX 3090, RTX 4080 con 4 bits), pero no hay confirmación del autor.
- Opciones de despliegue: transformers con PEFT, text-generation-inference (TGI), vLLM (con soporte de adaptadores LoRA), llama.cpp/Ollama (requiere conversión del adaptador a GGUF, no documentada).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Cloudcottoncandy/kanana-1.5-8b-instruct-2505-Persona-LORA | Adaptador sobre ~8B | no disponible | apache-2.0 | Hugging Face (0 descargas) | Adaptador de persona, sin benchmarks |
| kakaocorp/kanana-1.5-8b-instruct-2505 | ~8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base) | Modelo instruct coreano/inglés de Kakao |
| Adaptadores LoRA de persona sobre Llama 3.1 8B (genéricos) | Adaptador sobre 8B | heredado del base | varía | Hugging Face | Ecosistema más amplio y documentado |
| Meta-Llama-3.1-8B-Instruct | 8B | 128K (según Meta) | Llama 3.1 Community License | Hugging Face, amplia adopción | Referencia habitual para adaptadores de 8B |

La comparación directa con alternativas es difícil porque no hay datos de rendimiento del adaptador ni del modelo base en esta ficha.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican dataset, hiperparámetros del LoRA, evaluación ni métricas, lo que impide reproducir o auditar el ajuste.
- Riesgo de olvido catastrófico (catastrophic forgetting): al ser un ajuste de persona, puede degradar capacidades del modelo base (razonamiento, código) sin que el autor lo haya medido.
- Riesgo de alucinación: inherente a los LLM; no hay evaluación específica para este adaptador.
- Sesgos conocidos: no documentados; el ajuste de persona puede amplificar sesgos presentes en el dataset de entrenamiento, que se desconoce.
- Limitación de idioma: la model card declara únicamente inglés, aunque el modelo base soporta coreano; el comportamiento multilingüe del adaptador no está verificado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Kanana, que puede imponer condiciones adicionales.
- Popularidad nula (0 descargas, 0 likes): no hay evidencia de uso en producción ni validación por la comunidad.
- Fecha de creación futura (2026-11-26) en los metadatos: posible inconsistencia que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Cloudcottoncandy/kanana-1.5-8b-instruct-2505-Persona-LORA
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
