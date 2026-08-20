# Ninjasin/guard-ai-apex-1.5b

## Resumen

Guard AI Apex 1.5B es un modelo de lenguaje de generación de texto desarrollado por Ninjasin, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tune del modelo `unsloth/qwen2.5-coder-1.5b-instruct-bnb-4bit`, es decir, una adaptación del popular Qwen2.5 Coder de 1.500 millones de parámetros orientado a tareas de programación e instrucción. El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que permitió una optimización significativa en velocidad de entrenamiento.

El modelo está diseñado para generación de texto en inglés y hereda la arquitectura Qwen2 (transformer decoder-only) de su base. Con 1.543.714.304 parámetros totales, se posiciona en el rango de modelos pequeños, adecuados para despliegue en entornos con recursos limitados. Su relevancia actual radica en que ofrece una alternativa ligera y de código abierto para tareas de asistencia en programación y conversación, aunque la información pública disponible es escasa y no se han publicado métricas de rendimiento específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, probablemente 32.768 tokens) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision original) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/qwen2.5-coder-1.5b-instruct-bnb-4bit`, que a su vez es una version cuantizada en 4 bits del modelo Qwen2.5 Coder 1.5B Instruct. La arquitectura subyacente es la de Qwen2, un transformer decoder-only con atencion por ventanas deslizantes y soporte para contexto largo. El entrenamiento se realizo con la libreria Unsloth, que acelera el fine-tuning mediante kernels optimizados, y con TRL (Transformers Reinforcement Learning) de Hugging Face, lo que sugiere el uso de tecnicas de alineacion como RLHF o DPO, aunque no se especifica el metodo concreto.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados ni los hiperparametros. El autor indica que el modelo fue entrenado "2x mas rapido" gracias a Unsloth, pero no aporta detalles adicionales sobre el proceso.

## Capacidades

- Generacion de texto en ingles, con foco en instrucciones y tareas de programacion (heredado del modelo base Qwen2.5 Coder).
- Soporte de conversacion multi-turno, dado que el modelo base es de tipo instruct.
- Capacidades de razonamiento y generacion de codigo, aunque no se han publicado evaluaciones especificas.
- No se ha confirmado soporte para tool calling, agentes, vision ni audio.
- No se ha confirmado modo de pensamiento (thinking mode) ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Asistente de programacion en entornos con recursos limitados: al ser un modelo de 1,5B, puede ejecutarse en CPUs o GPUs de gama baja, ofreciendo autocompletado de codigo y respuestas a preguntas tecnicas en ingles.
- Chatbot de soporte tecnico interno: su tamano reducido permite desplegarlo en servidores modestos para atender consultas frecuentes sobre APIs, sintaxis o depuracion.
- Generacion de documentacion tecnica: puede redactar comentarios de codigo, descripciones de funciones o resumenes de cambios en repositorios.
- Educacion y formacion en programacion: util como tutor interactivo para estudiantes que practican en ingles, explicando conceptos y corrigiendo ejercicios.
- Prototipado rapido de aplicaciones de lenguaje: su licencia Apache 2.0 permite integrarlo en proyectos comerciales sin restricciones, ideal para pruebas de concepto.
- Filtrado y clasificacion de texto: puede adaptarse para tareas de clasificacion de incidencias o etiquetado de contenido, aunque requeriria fine-tuning adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se han comparado con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion de 4 bits, aproximadamente 1-2 GB; con precision completa (fp16), alrededor de 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050 o superiores. Tambien puede ejecutarse en CPU con suficiente RAM (8 GB o mas).
- Compatible con GPUs de consumo: si, cabe en tarjetas como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y transformers de Hugging Face.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna, se espera una latencia de decenas de milisegundos por token, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Guard AI Apex 1.5B | 1,54B | no disponible | Apache 2.0 | Fine-tune de Qwen2.5 Coder 1.5B |
| Qwen2.5 Coder 1.5B Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Modelo base, con benchmarks publicados |
| CodeLlama 7B | 7B | 16.384 tokens | Llama 2 license | Mas grande, requiere mas recursos |
| Phi-3 Mini | 3,8B | 128.000 tokens | MIT | Alternativa compacta con contexto largo |

La comparativa se basa en datos publicos de los modelos base, ya que no hay informacion especifica sobre el rendimiento de Guard AI Apex. El modelo hereda las capacidades de Qwen2.5 Coder, pero sin evaluaciones propias no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de seguridad. Al ser un fine-tune de un modelo pequeno, puede presentar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinacion: los modelos de 1,5B tienden a generar respuestas incorrectas o inventadas, especialmente en tareas complejas de razonamiento o codigo.
- Limitaciones de idioma: solo se ha confirmado soporte para ingles; el rendimiento en otros idiomas es desconocido.
- Contexto limitado: aunque el modelo base soporta 32k tokens, no se ha confirmado que el fine-tune mantenga esa longitud; en la practica, modelos pequenos degradan su rendimiento con contextos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero no se especifica si el modelo base tiene alguna limitacion adicional (en este caso, Qwen2.5 Coder tambien es Apache 2.0).
- Para produccion, se recomienda realizar evaluaciones propias y pruebas de robustez antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ninjasin/guard-ai-apex-1.5b
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo base: https://huggingface.co/unsloth/qwen2.5-coder-1.5b-instruct-bnb-4bit
