# hruddayansh/werewolf-ai-3b

## Resumen

El modelo `hruddayansh/werewolf-ai-3b` es un ajuste fino (fine-tune) del modelo `unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit`, desarrollado por el usuario hruddayansh. Está orientado a la generación de texto conversacional y, por su nombre, parece estar diseñado para aplicaciones relacionadas con el juego de rol Werewolf, aunque no se proporciona documentación que lo confirme explícitamente. El modelo tiene 3.212.749.824 parámetros (aproximadamente 3,2 mil millones) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo radica en su tamaño compacto, que lo hace adecuado para entornos con recursos limitados, y en su base Llama 3.2, que ofrece capacidades de razonamiento y generación de texto en inglés. Sin embargo, la ausencia de una model card detallada y de benchmarks publicados limita la evaluación objetiva de su rendimiento. Es un ejemplo de fine-tuning rápido con la librería Unsloth, que acelera el entrenamiento, pero carece de información sobre los datos utilizados o las técnicas de alineación aplicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.2 3B) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Llama 3.2 soporta hasta 128k, pero no se confirma en el fine-tune) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors, probablemente en fp16/bf16, pero no se especifica) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits del Llama 3.2 3B Instruct de Meta. La arquitectura subyacente es un transformer decoder-only con atención causal, típica de la familia Llama. El entrenamiento se realizó con la librería Unsloth y la biblioteca TRL de Hugging Face, lo que sugiere el uso de técnicas de fine-tuning supervisado (SFT) o posiblemente RLHF, aunque no se detalla el proceso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación específicas (como DPO o PPO). Tampoco se mencionan innovaciones técnicas adicionales más allá del uso de Unsloth para acelerar el entrenamiento. Dado que el modelo base ya es instruct, el fine-tune probablemente busca especializarlo en un dominio concreto, posiblemente el juego Werewolf, pero no hay evidencia pública que lo confirme.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama 3.2 Instruct.
- Razonamiento y respuesta a instrucciones, gracias a la base instruct.
- Capacidad de seguir diálogos multi-turno, aunque la longitud de contexto no está confirmada.
- No se documentan capacidades específicas como tool calling, agentes, visión o audio.
- Al ser un modelo pequeño (3.2B), su rendimiento en tareas complejas de razonamiento o código es limitado en comparación con modelos más grandes.
- No hay evidencia de soporte multilingüe más allá del inglés.

## Casos de uso

- Juego de rol Werewolf automatizado: el nombre sugiere que el modelo podría usarse para simular personajes o moderar partidas del juego de mesa Werewolf, generando diálogos y decisiones de los jugadores. Sin embargo, no hay documentación que confirme esta funcionalidad.
- Chatbot de entretenimiento: como modelo conversacional ligero, podría integrarse en aplicaciones de chat para interacción casual en inglés.
- Prototipado rápido de asistentes conversacionales: gracias a su tamaño reducido y licencia permisiva, es adecuado para experimentar con fine-tunes adicionales o para pruebas de concepto.
- Generación de historias interactivas: su base instruct permite crear narrativas ramificadas, aunque sin garantías de coherencia a largo plazo.
- Educación y aprendizaje: puede usarse como ejemplo de fine-tuning con Unsloth para estudiantes que quieran entender el proceso de adaptación de modelos.
- Despliegue en entornos con recursos limitados: al ser de 3.2B, puede ejecutarse en GPUs de consumo con cuantización, lo que facilita su uso en proyectos personales o pequeñas empresas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con modelos similares. Por tanto, no es posible valorar su rendimiento cuantitativo.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 4 bits, el modelo puede caber en aproximadamente 2-3 GB de VRAM; en fp16, necesitaría alrededor de 6-7 GB.
- GPU recomendadas: para fp16, una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060 Ti, A10). Para 4 bits, una GPU con 4-6 GB (RTX 3050, RTX 2060) podría ser suficiente.
- En consumer GPU: sí, cabe en GPUs de gama media con cuantización.
- Opciones de despliegue: compatible con transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (si se convierte a GGUF).
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, se espera una latencia de decenas de milisegundos por token, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| hruddayansh/werewolf-ai-3b | 3.2B | No disponible | Apache 2.0 | Fine-tune de Llama 3.2 3B, sin benchmarks |
| unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit | 3.2B | 128k (base) | Apache 2.0 | Modelo base, cuantizado 4 bits |
| Qwen2.5-3B-Instruct | 3.2B | 32k | Apache 2.0 | Modelo instruct de Alibaba, con benchmarks publicados |

La comparación directa no es posible por falta de datos de rendimiento del modelo evaluado. Se espera que herede las capacidades del modelo base Llama 3.2, pero sin confirmación.

## Limitaciones y advertencias

- Falta de documentación: la model card es extremadamente escueta, sin detalles sobre el dataset, el proceso de entrenamiento o las capacidades específicas.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar información falsa o inventada, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- Sesgos potenciales: al estar basado en Llama 3.2, puede heredar sesgos presentes en los datos originales de Meta, aunque no se han evaluado específicamente.
- Limitaciones de idioma: solo se declara soporte para inglés; el rendimiento en otros idiomas es desconocido.
- Longitud de contexto no confirmada: aunque el modelo base soporta 128k, el fine-tune podría haber reducido la ventana; no se especifica.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Llama 3.2, se deben respetar los términos de la licencia original de Meta (que también es Apache 2.0, por lo que no hay conflicto).
- Producción: sin benchmarks ni pruebas de robustez, no se recomienda su uso en aplicaciones críticas sin una evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hruddayansh/werewolf-ai-3b
- Modelo base (unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit): https://huggingface.co/unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit
- Sitio web de Werewolf AI (posiblemente relacionado, sin confirmación): https://aiwerewolf.net/
- Repositorio GitHub de Werewolf AI (juego con IA): https://github.com/hjd-hitsz/werewolf-ai
