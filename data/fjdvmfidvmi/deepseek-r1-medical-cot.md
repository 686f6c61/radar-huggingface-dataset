# fjdvmfidvmi/DeepSeek-R1-Medical-COT

## Resumen

DeepSeek-R1-Medical-COT es un ajuste fino (fine-tuning) publicado por el usuario fjdvmfidvmi sobre el modelo destilado unsloth/deepseek-r1-distill-llama-8b-unsloth-bnb-4bit, que a su vez deriva de DeepSeek-R1-Distill-Llama-8B. Se trata, por tanto, de un modelo de generación de texto de aproximadamente 8.000 millones de parámetros con arquitectura transformer tipo Llama, especializado presumiblemente en dominios médicos y en razonamiento encadenado (chain-of-thought), a juzgar por el sufijo "Medical-COT" del nombre.

El modelo se entrenó con las librerías Unsloth y TRL de Hugging Face, lo que según la model card permitió un entrenamiento "2x más rápido". El repositorio ocupa 0,9 GB y contiene pesos en formato safetensors, lo que sugiere que se distribuyen en cuantización de 4 bits (coherente con el modelo base bnb-4bit). La licencia declarada es Apache 2.0 y el único idioma indicado es el inglés.

La relevancia de este modelo es limitada: se trata de una publicación de un autor individual, sin descargas ni "likes" en el momento de la consulta, sin pipeline declarado y sin benchmarks publicados. Resulta útil como ejemplo de fine-tuning ligero con Unsloth sobre un destilado de Razonamiento de DeepSeek, pero no debe considerarse un modelo validado para uso clínico ni para producción sin una evaluación propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (derivado de DeepSeek-R1-Distill-Llama-8B) |
| Parametros totales | aproximadamente 8.000 millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en safetensors; el modelo base es bnb-4bit; no se detallan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de DeepSeek-R1-Distill-Llama-8B, un transformer decoder-only de la familia Llama con aproximadamente 8.000 millones de parámetros. Este modelo se obtuvo originalmente destilando las capacidades de razonamiento de DeepSeek-R1 sobre Llama-3.1-8B, de modo que hereda el estilo de generación con cadenas de razonamiento explícitas (thinking) antes de la respuesta final. El modelo intermedio de Unsloth aplica cuantización de 4 bits (bnb-4bit) para facilitar el entrenamiento y la inferencia con recursos limitados.

El ajuste fino realizado por fjdvmfidvmi se llevó a cabo con Unsloth y TRL, según la model card, lo que permitió un entrenamiento aproximadamente dos veces más rápido que el flujo estándar. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset médico utilizado, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de las heredadas del modelo base (destilación de razonamiento).

## Capacidades

- Generación de texto en inglés con estilo de razonamiento encadenado (chain-of-thought), heredado del modelo DeepSeek-R1-Distill-Llama-8B.
- Respuestas orientadas a dominio médico, presumiblemente por el ajuste fino sobre datos clínicos (no se detalla el dataset).
- Razonamiento multi-paso y resolución de problemas que requieren justificación intermedia.
- Compatibilidad con text-generation-inference (tag declarado), lo que facilita su despliegue en infraestructuras TGI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no documentadas.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de formación médica: el modelo puede generar explicaciones razonadas paso a paso sobre conceptos clínicos, útil para material docente, siempre que un profesional revise las respuestas.
- Triaje conversacional de síntomas: puede estructurar preguntas y razonar sobre posibles causas en inglés, aunque no debe usarse como sustituto del juicio clínico.
- Generación de resúmenes de literatura biomédica: su estilo de razonamiento permite condensar artículos y justificar las conclusiones extraídas.
- Apoyo a la codificación clínica: puede ayudar a mapear descripciones libres a terminologías (CIE-10, SNOMED) en inglés, con validación humana posterior.
- Prototipado de pipelines de razonamiento médico: sirve como base para experimentar con decodificación de cadenas de pensamiento en entornos de investigación con Unsloth y TRL.
- Evaluación comparativa de fine-tunings: al ser un modelo pequeño (8B) y en 4 bits, permite iterar rápidamente en experimentos de ajuste fino sobre dominios especializados.
- Generación de preguntas de examen tipo test con justificación: útil en plataformas de e-learning sanitario en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con cuantización de 4 bits (tamaño del repo de 0,9 GB más overhead de activaciones y contexto); en FP16 serían necesarios unos 16 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4, A100 o H100 para despliegues concurrentes; suficiente con GPUs consumer de gama alta para uso individual.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 con cuantización de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (tag declarado), vLLM, llama.cpp y Ollama (previa conversión a GGUF), Unsloth para entrenamiento e inferencia optimizada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-R1-Medical-COT (este) | ~8B | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8B | 128K (según el modelo original de DeepSeek) | MIT (modelo original) | Hugging Face, ampliamente descargado |
| unsloth/deepseek-r1-distill-llama-8b-unsloth-bnb-4bit | 8B | 128K (heredado) | Apache 2.0 | Hugging Face, con cuantización 4 bits |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Hugging Face, muy extendido |

La comparación con benchmarks no está disponible porque este fine-tuning no publica métricas propias; la única referencia objetiva es el modelo base, cuyos resultados sí están documentados por DeepSeek.

## Limitaciones y advertencias

- Modelo sin benchmarks ni evaluaciones publicadas: no hay evidencia de que el ajuste fino médico mejore al modelo base ni de que sea seguro en dominio clínico.
- Riesgo elevado de alucinación en contexto médico: no debe usarse para diagnóstico, prescripción ni decisiones terapéuticas sin supervisión profesional.
- Idiomas: solo inglés declarado; no se garantiza un comportamiento correcto en castellano.
- Licencia Apache 2.0 declarada, pero conviene verificar la licencia del modelo base original (DeepSeek-R1-Distill-Llama-8B) y de Llama-3.1, ya que pueden imponer restricciones adicionales al uso comercial.
- Publicación de autor individual, sin mantenimiento ni soporte documentado; 0 descargas y 0 likes en el momento de la consulta.
- El uso de cuantización 4 bits en el modelo base puede degradar la calidad del razonamiento frente a la versión en FP16.
- No se documenta el dataset de ajuste fino, lo que impide auditar sesgos o procedencia de los datos.

## Enlaces

- Hugging Face: https://huggingface.co/fjdvmfidvmi/DeepSeek-R1-Medical-COT
- Modelo base intermedio: https://huggingface.co/unsloth/deepseek-r1-distill-llama-8b-unsloth-bnb-4bit
- Modelo original DeepSeek-R1-Distill-Llama-8B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Repositorio TRL: https://github.com/huggingface/trl
