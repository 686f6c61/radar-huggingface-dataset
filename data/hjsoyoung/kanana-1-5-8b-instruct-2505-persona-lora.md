# hjsoyoung/kanana-1.5-8b-instruct-2505-Persona-LORA

## Resumen

`hjsoyoung/kanana-1.5-8b-instruct-2505-Persona-LORA` es un adaptador LoRA de tipo persona publicado en Hugging Face por el usuario hjsoyoung, obtenido mediante fine-tuning del modelo base `kakaocorp/kanana-1.5-8b-instruct-2505` de Kakao Corp. El repositorio contiene únicamente los pesos del adaptador (0,1 GB), no el modelo completo, y está pensado para superponerse sobre el checkpoint original de 8.000 millones de parámetros. La model card es mínima: no documenta el dataset de entrenamiento, la configuración del LoRA (rango, alpha, módulos objetivo) ni ejemplos de uso.

El interés de esta publicación es acotado: se trata de un experimento de personalización de estilo o rol sobre un instruct model coreano-inglés, entrenado con Unsloth para acelerar el proceso. No aporta innovaciones arquitectónicas ni benchmarks propios; su relevancia depende enteramente de la calidad del modelo base Kanana 1.5, que sí es un LLM transformer de 8B con foco en coreano e inglés.

Dado que el repositorio tiene cero descargas y cero likes en el momento de la consulta, y que la model card no incluye información sobre el corpus de personas utilizado, debe tratarse como un artefacto de investigación no validado. Cualquier evaluación de calidad requiere probar el adaptador contra el modelo base en las tareas objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only (modelo base Kanana 1.5 8B) |
| Parametros totales | Adaptador: no disponible (repo de 0,1 GB); modelo base: 8 000 millones aprox. |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; heredada del modelo base (no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; admite combinacion con bases cuantizadas, no verificado) |
| Idiomas soportados | en (segun tags del repo); el modelo base soporta coreano e ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del checkpoint `kakaocorp/kanana-1.5-8b-instruct-2505`, un transformer decoder-only de aproximadamente 8B parámetros desarrollado por Kakao Corp; los detalles finos (número de capas, dimensiones, atención, contexto máximo) no se detallan en la información disponible y deben consultarse en la model card del modelo base.

El entrenamiento se realizó con Unsloth, segun indica la propia model card ("trained 2x faster with Unsloth"), lo que sugiere un fine-tuning supervisado (SFT) con TRL sobre un dataset de "persona" no especificado. No se documentan el número de tokens de entrenamiento, la composición del dataset, el rango/alpha del LoRA, los módulos objetivo ni si hubo etapas de DPO o RLHF. Tampoco se indica la semilla, la tasa de aprendizaje ni la duración del entrenamiento.

## Capacidades

- Generacion de texto en ingles (idioma declarado en el repo) y, por herencia del modelo base, en coreano.
- Adopcion de un estilo o rol de "persona" concreto, objetivo declarado del fine-tuning; el rol exacto no se describe en la model card.
- Conversacion multi-turno e instrucciones, heredadas del instruct model base.
- Razonamiento y codigo: capacidades del modelo base Kanana 1.5 8B Instruct, no verificadas tras la adaptacion.
- Tool calling / function calling: no documentado para el adaptador; depende del soporte del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" explicito: no documentado.

## Casos de uso

- Prototipado de asistentes con personalidad fija: cargar el adaptador sobre Kanana 1.5 8B Instruct para experimentar con un tono o rol concreto en demos y pruebas de concepto, sin reentrenar el modelo completo.
- Investigacion sobre personalizacion de estilo: comparar el comportamiento del adaptador frente al modelo base para estudiar como un LoRA de bajo rango modifica el registro conversacional sin alterar el conocimiento subyacente.
- Evaluacion de pipelines LoRA + Unsloth: usar este repo como ejemplo reproducible de fine-tuning rapido sobre un instruct model de 8B y medir coste y calidad frente a alternativas.
- Generacion de dialogos sinteticos con un personaje definido: emplear el adaptador para producir conversaciones con un estilo controlado que luego se filtran y se usan como datos de entrenamiento.
- Base para fine-tuning en cascada: partir de este adaptador y aplicar un segundo LoRA especifico de dominio, aprovechando que los pesos del adaptador son ligeros (0,1 GB) y faciles de versionar.
- Pruebas de regresion de seguridad: verificar si el cambio de persona introduce derivas de tono, filtraciones de instrucciones o mayor tasa de alucinacion respecto al modelo base antes de cualquier uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Kanana 1.5 8B. En fp16, aproximadamente 16 GB solo para pesos, mas overhead de KV cache y activaciones (20-24 GB realistas). En cuantizacion de 8 bits, en torno a 8-10 GB; en 4 bits, en torno a 5-6 GB. El adaptador LoRA en si ocupa menos de 1 GB.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio en fp16 con concurrencia; RTX 4090 (24 GB) para fp16 en single-stream o 8 bits con batching moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con fp16 o cuantizacion; en GPUs de 12-16 GB solo con cuantizacion agresiva (4-8 bits) y contexto reducido.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el base), vLLM con soporte LoRA, TGI, llama.cpp/Ollama previa conversion a GGUF (requiere fusionar el adaptador con el base). Unsloth puede usarse para exportar el modelo fusionado.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| hjsoyoung/kanana-1.5-8b-instruct-2505-Persona-LORA | LoRA sobre 8B | no disponible | apache-2.0 | Adaptador de persona, sin benchmarks ni documentacion de entrenamiento |
| kakaocorp/kanana-1.5-8b-instruct-2505 (base) | 8B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo instruct oficial de Kakao; referencia obligada para medir el efecto del LoRA |
| Meta-Llama-3.1-8B-Instruct | 8B | 128K (segun documentacion publica de Meta) | Llama 3.1 Community License | Alternativa generalista de mismo tamano, con ecosistema amplio de LoRA |
| Qwen2.5-7B-Instruct | 7B | 128K (segun documentacion publica de Qwen) | Apache 2.0 | Alternativa apache-2.0 de tamano similar, muy usada para fine-tuning con LoRA |

## Limitaciones y advertencias

- Model card practicamente vacia: no se documenta el dataset, el rol de persona, los hiperparametros del LoRA ni el procedimiento de evaluacion.
- Cero descargas y cero likes: sin evidencia de uso ni validacion por parte de la comunidad.
- Riesgo de alucinacion y de deriva de estilo: cualquier SFT sobre persona puede degradar la fidelidad factual o introducir respuestas fuera de rol; no hay evaluaciones que lo descarten.
- Idioma: el repo declara solo `en`; el comportamiento en castellano no esta garantizado aunque el modelo base sea multilingue.
- Sesgos: no documentados; se heredan los del modelo base y los del corpus de persona, que se desconoce.
- Licencia apache-2.0 en el adaptador, pero conviene verificar la licencia del modelo base Kanana 1.5 antes de uso comercial, ya que el adaptador no puede usarse sin el.
- Fecha de creacion en el repositorio (2026-11-26) posterior a la consulta; tratar los metadatos con cautela.
- No apto para produccion sin una evaluacion propia frente al modelo base en las tareas objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hjsoyoung/kanana-1.5-8b-instruct-2505-Persona-LORA
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- TRL (framework de fine-tuning): https://github.com/huggingface/trl
