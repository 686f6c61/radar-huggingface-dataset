# psephos/lushan-glm4-32b

## Resumen

`psephos/lushan-glm4-32b` es un ajuste fino (fine-tune) del modelo `zai-org/GLM-4-32B-0414` de Zhipu AI (Z.ai), desarrollado por el usuario psephos. Se trata de una adaptación mediante QLoRA de 4 bits (NF4) orientada a tareas de matemáticas y razonamiento conversacional, entrenada sobre un subconjunto del dataset `project-numina/NuminaMath-1.5`. El modelo conserva la arquitectura y el tamaño del modelo base: 32.566.081.536 parámetros (32,6B).

La relevancia de esta ficha es acotada: se trata de un experimento de ajuste fino de carácter comunitario, con 0 descargas y 0 likes en el momento de la consulta, y con información técnica muy limitada en su model card. No se documentan resultados de benchmarks, idiomas soportados ni licencia. El entrenamiento empleó únicamente 2048 ejemplos durante 1 época y una longitud máxima de secuencia de 1024 tokens (con `enable_thinking=False`), lo que sugiere un ajuste ligero más que un reentrenamiento profundo.

El modelo se distribuye en formato safetensors ya fusionado en 4 bits NF4 (repo de 23,3 GB), lo que implica que los pesos no están en precisión completa. Esto condiciona tanto el despliegue como la calidad final respecto al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-4 (transformer decoder-only, según modelo base `zai-org/GLM-4-32B-0414`) |
| Parametros totales | 32.566.081.536 (32,6B) |
| Parametros activos | no disponible (no es MoE según los datos aportados) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó 1024 tokens como longitud máxima de secuencia |
| Tipos de cuantizacion | pesos exportados en 4-bit NF4 (bitsandbytes); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4-bit NF4 fusionado, con `model.safetensors.index.json`) |
| Parametros LoRA entrenables | 9.119.744 (9,1M) |
| Dataset de entrenamiento | `project-numina/NuminaMath-1.5` (2048 ejemplos) |
| Epocas | 1 |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del GLM-4-32B-0414 de Zhipu AI, un transformer decoder-only de 32,6B parámetros. Sobre esa base se aplicó un ajuste fino con QLoRA en 4 bits NF4 mediante bitsandbytes, entrenando 9,1M de parámetros LoRA (aproximadamente el 0,028% del total). Los adaptadores se fusionaron posteriormente en los pesos base y se exportaron como safetensors cuantizados en 4 bits NF4.

El entrenamiento utilizó 2048 ejemplos del dataset `project-numina/NuminaMath-1.5`, un corpus orientado a problemas matemáticos y razonamiento. Se realizó una sola época con una longitud máxima de secuencia de 1024 tokens y `enable_thinking=False`, lo que desactiva el modo de razonamiento extendido del modelo base durante el ajuste. No se documentan detalles sobre hiperparámetros (learning rate, rango LoRA, alpha), composición exacta del subconjunto ni si hubo etapas de RLHF o DPO adicionales. La información disponible no permite valorar innovaciones técnicas propias más allá del procedimiento estándar de QLoRA.

## Capacidades

- Generación de texto y respuestas conversacionales, heredadas del modelo base GLM-4-32B-0414.
- Razonamiento matemático: el ajuste se orienta explícitamente a problemas matemáticos mediante NuminaMath-1.5.
- Razonamiento multi-paso: el modelo base GLM-4 soporta modos de razonamiento, aunque el ajuste se realizó con `enable_thinking=False`.
- Capacidades multilingües: no documentadas para este fine-tune; dependen del modelo base.
- Tool calling / function calling: no documentado en esta model card; el modelo base GLM-4-32B-0414 lo soporta según su propia documentación, pero no se confirma para este ajuste.
- Capacidades de agente: no documentadas para este fine-tune.
- Capacidades de visión o audio: no disponibles en este ajuste (es un modelo de text-generation).

## Casos de uso

- Resolución de problemas matemáticos de nivel escolar y preuniversitario: el ajuste sobre NuminaMath-1.5 lo hace adecuado para generar soluciones paso a paso en ejercicios de álgebra, cálculo y aritmética, aunque con la limitación de haber visto solo 2048 ejemplos.
- Tutoría matemática conversacional: puede emplearse en asistentes educativos que expliquen procedimientos y verifiquen resultados en diálogos de pocos turnos, dado el contexto de entrenamiento de 1024 tokens.
- Generación de datasets sintéticos de matemáticas: útil como generador de problemas y soluciones para aumentar corpus de entrenamiento, con revisión humana posterior por riesgo de alucinación.
- Prototipado de investigación en ajuste fino: sirve como referencia de cómo un QLoRA ligero sobre GLM-4-32B afecta al rendimiento en dominios específicos, para comparar con el modelo base.
- Evaluación de técnicas de cuantización: al distribuirse en 4-bit NF4 fusionado, es un caso práctico para estudiar la degradación de calidad frente a pesos en BF16.
- Experimentación académica con recursos limitados: su formato cuantizado (23,3 GB) permite desplegarlo en hardware más modesto que el modelo base en precisión completa, facilitando pruebas en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar los pesos en 4-bit NF4, el modelo ocupa aproximadamente 16-17 GB solo en pesos (32,6B × ~0,5 bytes/parámetro), más overhead de activaciones y caché KV. Se estima un mínimo práctico de 20-24 GB de VRAM para contextos cortos.
- GPU recomendadas: A100 40GB, H100, L40S o RTX A6000 para despliegue cómodo; una RTX 4090 (24 GB) podría funcionar en configuraciones ajustadas y contextos reducidos.
- ¿Cabe en GPU de consumo? Sí, potencialmente en RTX 4090 (24 GB) y GPUs con 24 GB o más, con cuantización ya aplicada y contextos limitados. En GPUs de 16 GB no cabría sin cuantizaciones adicionales.
- Opciones de despliegue: transformers con bitsandbytes (formato nativo), vLLM (requiere verificar compatibilidad con pesos NF4 pre-cuantizados), llama.cpp/Ollama (requiere conversión a GGUF, no incluida en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| psephos/lushan-glm4-32b | 32,6B | no disponible (entreno a 1024) | no disponible | safetensors 4-bit NF4 | Fine-tune matemático comunitario, 2048 ejemplos |
| zai-org/GLM-4-32B-0414 (base) | 32,6B | no disponible en esta ficha | no disponible | safetensors (precisión completa) | Modelo original de Zhipu AI; referencia de calidad |
| Alternativas de 32B para matemáticas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas sin inventar datos.

## Limitaciones y advertencias

- Entrenamiento muy ligero: solo 2048 ejemplos y 1 época, lo que limita la magnitud y generalización del ajuste; puede no superar al modelo base en tareas matemáticas fuera de la distribución de NuminaMath-1.5.
- Longitud de contexto de entrenamiento de 1024 tokens: el ajuste no cubre secuencias largas, aunque el modelo base pueda soportarlas; el comportamiento más allá de 1024 tokens no está validado.
- Pesos en 4-bit NF4 fusionados: la cuantización introduce pérdida de precisión respecto a BF16 y puede degradar el razonamiento matemático fino.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse la licencia del modelo base GLM-4-32B-0414 antes de cualquier despliegue en producción.
- Idiomas no documentados: no hay garantía de comportamiento multilingüe más allá de lo que herede del modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir soluciones matemáticamente incorrectas con apariencia plausible; requiere verificación.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset NuminaMath-1.5.
- Adopción nula: 0 descargas y 0 likes; no hay evidencia de uso en producción ni validación comunitaria.
- Sin benchmarks publicados: no hay métricas que respalden las afirmaciones de mejora sobre el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/psephos/lushan-glm4-32b
- Modelo base: https://huggingface.co/zai-org/GLM-4-32B-0414
- Dataset de entrenamiento: https://huggingface.co/datasets/project-numina/NuminaMath-1.5
