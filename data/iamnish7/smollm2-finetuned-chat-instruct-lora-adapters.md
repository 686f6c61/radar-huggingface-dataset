# iamnish7/smollm2-finetuned-chat-instruct-lora-adapters

## Resumen

SmolLM2-135M finetuned chat instruct LoRA adapters es un conjunto de adaptadores LoRA de rango 32 y alpha 64 publicados por el usuario iamnish7 sobre el modelo base HuggingFaceTB/SmolLM2-135M, un transformer decoder-only de 135 millones de parametros desarrollado por Hugging Face. El repositorio no contiene pesos completos del modelo, sino unicamente los adaptadores LoRA junto con el tokenizer, y esta pensado para cargarse sobre el checkpoint base mediante la libreria transformers. Su origen es academico: se trata de la entrega de la tarea 10 de la asignatura CSC2516, segun indica la propia model card.

El modelo aborda el ajuste conversacional de un modelo de lenguaje muy pequeno mediante fine-tuning supervisado sobre el split de conversaciones cotidianas del dataset SmolTalk. Su relevancia es limitada pero concreta: demuestra el flujo completo de adaptacion de un LLM de bolsillo (menos de 1 GB en fp16) para instrucciones y chat, algo util para entornos con recursos muy restringidos, prototipado rapido y experimentacion educativa. No hay informacion publicada sobre composicion exacta del dataset, numero de pasos de entrenamiento ni evaluacion en benchmarks estandar.

El checkpoint se publico el 22 de noviembre de 2026, no registra descargas ni likes, y el unico dato de rendimiento disponible es la perdida de 0.9458 reportada por el validador de la tarea sobre 119 conversaciones reservadas. No debe confundirse con un modelo de produccion: es un artefacto de aprendizaje con validacion interna, no con evaluacion externa reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2), adaptadores LoRA de rango 32 y alpha 64 sobre atencion y proyecciones |
| Parametros totales | 135 millones (modelo base SmolLM2-135M); tamano de los adaptadores no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base SmolLM2-135M soporta 8192 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | no disponible; los adaptadores se distribuyen en `lora_adapters.pt` (PyTorch), sin versiones GGUF ni cuantizadas |
| Idiomas soportados | no disponible (la model card no declara idiomas; el dataset SmolTalk es predominantemente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `lora_adapters.pt` (PyTorch) mas tokenizer; requiere el checkpoint base SmolLM2-135M en safetensors para funcionar |

## Arquitectura y entrenamiento

El modelo base SmolLM2-135M es un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios, disenado por Hugging Face para ejecucion en dispositivos de bajos recursos. Sobre el se aplican adaptadores LoRA de rango 32 y alpha 64, lo que implica un factor de escala de 2.0 en la actualizacion de pesos. El repositorio incluye unicamente `lora_adapters.pt` y el tokenizer; no se publican los pesos fusionados ni el script de entrenamiento.

El entrenamiento consistio en fine-tuning supervisado sobre el split de conversaciones cotidianas (everyday-conversations) del dataset SmolTalk, que contiene dialogos sinteticos y curados orientados a instrucciones generales. La model card no especifica numero de tokens, epochs, hiperparametros de optimizacion, ni si hubo etapas de RLHF o DPO. El unico resultado reportado es una perdida de 0.9458 sobre 119 conversaciones reservadas, medida por el validador de la tarea academica; no se aportan metricas de exactitud, perplexity en validacion externa ni evaluaciones humanas.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat, heredada del ajuste sobre SmolTalk.
- Seguimiento basico de instrucciones en ingles, limitado por el tamano del modelo base (135M parametros).
- Generacion de respuestas cortas y directas; no se documenta razonamiento multi-paso ni cadenas de pensamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, planificacion ni uso de herramientas externas.
- Capacidades multilingues no declaradas; el dataset de entrenamiento es mayoritariamente anglofono, por lo que el rendimiento en castellano es previsiblemente bajo.
- No dispone de vision, audio ni modalidades adicionales.
- No se documenta modo thinking ni decodificacion especulativa.

## Casos de uso

- Prototipado de asistentes conversacionales en dispositivos de borde: el modelo base de 135M parametros ocupa aproximadamente 270 MB en fp16, por lo que puede ejecutarse en Raspberry Pi, moviles o navegadores mediante ONNX/WASM, con los adaptadores LoRA fusionados en el checkpoint.
- Docencia y experimentacion con fine-tuning: sirve como ejemplo reproducible de entrenamiento LoRA (rango 32, alpha 64) sobre un dataset conversacional, util para cursos de aprendizaje automatico y talleres practicos.
- Generacion de respuestas en chatbots de bajo coste: adecuado para tareas de conversacion simple (saludos, FAQ, respuestas de una o dos frases) donde la latencia y el coste por token priman sobre la calidad.
- Filtrado y clasificacion de texto ligera: puede emplearse para etiquetar o resumir fragmentos cortos en pipelines de preprocesamiento, siempre que se valide su calidad en el dominio concreto.
- Pruebas de integracion en pipelines de transformers: util para validar el flujo de carga de adaptadores PEFT, el tokenizer y el formateo de plantillas de chat antes de escalar a modelos mayores.
- Generacion de datos sinteticos de baja calidad para aumento de corpus: puede producir variaciones de dialogos cortos en ingles para tareas de aumento de datos, con revision humana obligatoria.
- Demostraciones educativas de limitaciones de LLM pequenos: sirve para ilustrar alucinaciones, perdida de contexto y degradacion en idiomas distintos del ingles en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato reportado por el autor es una perdida de 0.9458 sobre 119 conversaciones reservadas del validador de la tarea CSC2516, que no es comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 270 MB en fp16 para el modelo base fusionado con los adaptadores; en cuantizacion de 8 bits, alrededor de 135 MB; en 4 bits, en torno a 70 MB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en GTX 1650, RTX 3050, RTX 4090, A100 y H100 sin aprovechar su capacidad.
- Compatible con GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria unificada.
- Opciones de despliegue: transformers con PEFT para cargar los adaptadores; para produccion conviene fusionar los pesos y exportar a GGUF para llama.cpp u Ollama, o a ONNX para ejecucion en CPU. vLLM y TGI son compatibles tras la fusion, aunque el modelo es demasiado pequeno para aprovechar su throughput.
- Latencia y throughput estimados: no disponibles; por el tamano, se espera inferencia en CPU por debajo de 50 ms por token en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| iamnish7/smollm2-finetuned-chat-instruct-lora-adapters | 135M (base) + LoRA | no disponible | Apache 2.0 | Adaptadores LoRA en HF | Fine-tuning academico sobre SmolTalk; sin benchmarks publicos |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8192 tokens (segun model card oficial) | Apache 2.0 | Pesos completos en HF | Modelo instruct oficial de Hugging Face, con evaluacion publicada |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8192 tokens (segun model card oficial) | Apache 2.0 | Pesos completos en HF | Mayor capacidad conversacional a coste de mas memoria |
| Qwen2.5-0.5B-Instruct | 500M | 32768 tokens | Apache 2.0 | Pesos completos en HF | Alternativa multilingue con mejor soporte de castellano |

## Limitaciones y advertencias

- Modelo de 135M parametros: la calidad de las respuestas es muy inferior a la de modelos de 1B o superiores; no es adecuado para tareas que requieran razonamiento complejo, codigo o matematicas.
- Riesgo elevado de alucinacion: los modelos de este tamano inventan hechos con frecuencia y no tienen mecanismos de verificacion.
- Idiomas: no se declaran idiomas soportados y el entrenamiento se realizo sobre SmolTalk, mayoritariamente en ingles; el rendimiento en castellano sera previsiblemente pobre y no esta evaluado.
- Contexto: la longitud de contexto efectiva no esta documentada por el autor; aunque el modelo base soporta 8192 tokens, el fine-tuning puede haber reducido la ventana practica.
- Sesgos: no se han realizado evaluaciones de sesgo, toxicidad ni seguridad; el dataset SmolTalk puede contener sesgos heredados de sus fuentes.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un artefacto academico sin evaluacion externa, no se recomienda su despliegue en produccion sin una validacion exhaustiva en el dominio objetivo.
- Distribucion: el repositorio solo contiene adaptadores y tokenizer; es imprescindible descargar el checkpoint base SmolLM2-135M y cargar los adaptadores con PEFT, lo que anade un paso de configuracion y posibles incompatibilidades de version.
- Sin mantenimiento: cero descargas y cero likes en el momento de la consulta; no hay garantia de soporte, actualizaciones ni correccion de errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamnish7/smollm2-finetuned-chat-instruct-lora-adapters
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Repositorio oficial de SmolLM2: https://github.com/huggingface/smollm
- Documentacion de PEFT: https://huggingface.co/docs/peft
