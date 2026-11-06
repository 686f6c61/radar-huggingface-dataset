# eqlx-ai/tr-telekom-router

## Resumen

tr-telekom-router es un modelo de decisión especializado en el enrutamiento de mensajes de atención al cliente del sector de telecomunicaciones en turco. Lo desarrolla eqlx-ai y parte de Qwen/Qwen3.5-0.8B, un modelo causal de 873 millones de parámetros que se ha afinado para comportarse como un clasificador de seis vías: en lugar de generar texto libre, lee la probabilidad de seis letras de opción en una única posición y emite una distribución sobre los seis equipos de soporte. El checkpoint sigue siendo un LM causal estándar, por lo que se sirve sin modificaciones con transformers y vLLM.

La propuesta diferencial es la *predicción selectiva calibrada*: el modelo devuelve una probabilidad por equipo y una confianza calibrada, de modo que por encima de un umbral enruta automáticamente y por debajo deriva el mensaje a una persona. En el conjunto de retención sellado declara un 93,3 % de accuracy global, un 98,7 % de accuracy sobre el 84,4 % de mensajes que enruta por sí solo y una latencia p95 de 64 ms por mensaje en un único pase forward.

Es relevante ahora porque sustituye dos patrones habituales (clasificador opaco con score sin calibrar, o LLM grande lento que hay que parsear) por un modelo pequeño, calibrado y con sesgo posicional eliminado mediante destilación con opciones barajadas: la estabilidad ante reordenación de opciones pasa del 41 % al 97 %. Todo el pipeline se entrenó sin una sola etiqueta humana, usando acuerdo entre familias de modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Qwen3.5), reutilizado como clasificador por lectura de logits de letras de opción |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,8 GB) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tarea (pipeline) | text-classification |
| Etiquetas de salida | 6 equipos de soporte (enrutamiento de 6 vías) |
| Latencia declarada | 64 ms p95 por mensaje (un prefill, un token) |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3.5-0.8B: un transformer decoder-only causal con atención estándar. La innovación no está en el bloque sino en la cabeza de decisión: no se añade una *classification head* nueva, sino que se leen los logits de seis letras de opción (A-F) en una posición concreta de la secuencia. Cada inferencia cuesta un prefill más un token generado, lo que explica la latencia de decenas de milisegundos y elimina el parseo de texto libre y la posibilidad de alucinar una etiqueta.

El entrenamiento combina cuatro piezas. Primero, destilación de distribuciones con opciones barajadas: a un modelo profesor grande se le pregunta ocho veces por mensaje, cada vez con las opciones en orden distinto, y los votos se convierten en una distribución de probabilidad que el alumno aprende a imitar; así se cancela el sesgo posicional del profesor. Segundo, generación de datos sin etiquetado humano: una familia de modelos redacta los mensajes y otra familia independiente los etiqueta, y solo sobreviven los mensajes con acuerdo entre ambas. Tercero, una función de pérdida basada en regla de scoring propia (divergencia KL más Brier) en lugar de entropía cruzada simple. Cuarto, calibración post-hoc: ajuste de temperatura sobre datos retenidos y selección del umbral de derivación a humano en un split separado. El conjunto de test final se selló con hash antes del entrenamiento y se abrió una sola vez, con temperatura y umbral congelados de antemano.

## Capacidades

- Clasificación de intención y enrutamiento de mensajes de soporte en turco hacia seis equipos distintos.
- Emisión de una distribución de probabilidad completa sobre las seis clases, no solo una etiqueta.
- Confianza calibrada por mensaje, apta para fijar umbrales operativos.
- Predicción selectiva: decide cuándo no está seguro y deriva a un humano.
- Estabilidad ante reordenación de opciones (97 % de respuestas estables), lo que indica que atiende al contenido y no a la posición.
- Inferencia de un solo token: sin generación libre, sin parseo de salida, sin riesgo de etiqueta inventada.
- Compatibilidad con transformers y vLLM sin cambios en el checkpoint (LM causal estándar).
- No dispone de tool calling, agentes, visión, audio ni modo de razonamiento extendido según la información disponible.
- Multilingüismo: solo turco declarado.

## Casos de uso

- Triaje de tickets de atención al cliente: cada mensaje entrante se pasa por el modelo y se enruta al equipo de facturación, cancelaciones, soporte técnico, etc., con derivación automática a un agente humano cuando la confianza cae por debajo del umbral. Es adecuado porque la predicción selectiva permite fijar el punto de automatización según el coste de error.
- Enrutamiento en formularios web y apps: el modelo se coloca delante del formulario de contacto para clasificar el motivo antes de que el usuario elija categoría, reduciendo el abandono en menús de selección.
- Clasificación de transcripciones de llamadas: al ser un modelo de texto, se aplica sobre la transcripción de la llamada para dirigirla al equipo correcto y priorizar la cola.
- Enrutamiento de correo electrónico de soporte: integrado en un MTA o en un webhook, clasifica el asunto y el cuerpo del correo y asigna la cola correspondiente en milisegundos.
- Filtro de primera línea en chats en vivo: decide si el mensaje puede resolverse con respuestas automáticas del equipo adecuado o si requiere intervención humana inmediata.
- Enrutamiento en centros de contacto con volumen alto: con 64 ms p95 y un solo pase forward, puede procesar cada mensaje de cada canal sin convertirse en cuello de botella ni en el coste dominante del sistema.
- Análisis de motivos y enrutamiento combinados: la distribución de probabilidad sobre los seis equipos sirve también como señal de analítica para detectar cambios en la mezcla de motivos de contacto.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo, no verificados de forma independiente. El conjunto de evaluación es un holdout sellado sintético de 90 mensajes.

| Métrica | Valor |
|---|---|
| Accuracy global (todos los mensajes) | 93,33 % |
| Brier score multiclase | 0,1126 |
| Accuracy sobre mensajes enrutados automáticamente | 98,68 % |
| Cobertura automática | 84,4 % |
| Latencia p95 por mensaje | 64 ms |
| Estabilidad ante barajado de opciones | 97 % (frente al 41 % del modelo sin afinar) |
| Accuracy del mismo modelo antes del entrenamiento | 55,6 % |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1,8 GB de pesos más overhead de activaciones y KV cache; cómodo en GPUs de 8 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB; en 4 bits, en torno a 0,5-0,6 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente; para despliegue de alta concurrencia, A10G, L4, A100 o H100 con vLLM.
- Cabe en GPU consumer: sí, en todas las GPU con 8 GB o más; también en iGPU y CPU para volúmenes moderados.
- Opciones de despliegue: transformers (librería declarada), vLLM (el autor afirma compatibilidad sin cambios), TGI y llama.cpp/Ollama si se generan pesos GGUF, que no se publican en el repo.
- Latencia y throughput: 64 ms p95 por mensaje declarados; el throughput agregado depende del batching y del hardware y no está publicado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| tr-telekom-router | 873 M | no disponible | Clasificador de enrutamiento calibrado con predicción selectiva, solo turco | Apache 2.0 |
| Qwen/Qwen3.5-0.8B (base) | 873 M | no disponible | LM causal de propósito general | según modelo base |
| Clasificador BERT turco (p. ej. bert-base-turkish) | ~110 M | típicamente 512 tokens | Clasificación supervisada con etiquetas humanas | variable |
| LLM grande con prompt de enrutamiento | 7-70 B | largo | Generación de texto parseada | variable |

Frente al modelo base, la diferencia medida es de 55,6 % a 93,3 % de accuracy en el holdout. Frente a un clasificador BERT, la ventaja declarada es la calibración y la predicción selectiva, no necesariamente la precisión bruta. Frente a un LLM grande, la ventaja es latencia y coste por decisión.

## Limitaciones y advertencias

- Entrenado exclusivamente para turco y para el dominio de telecomunicaciones; el rendimiento fuera de ese idioma o sector no está caracterizado.
- Los datos de entrenamiento son sintéticos y las etiquetas provienen de acuerdo entre familias de modelos, no de anotadores humanos; los sesgos de esos modelos pueden propagarse.
- El holdout de evaluación tiene solo 90 mensajes y es sintético, lo que limita la significación estadística de las métricas declaradas.
- Las métricas del model-index están marcadas como no verificadas; no hay evaluación independiente publicada.
- Riesgo de alucinación de etiqueta bajo: el modelo no genera texto libre, pero puede asignar con alta confianza un equipo incorrecto en mensajes ambiguos o fuera de distribución.
- El umbral de derivación a humano debe recalibrarse sobre datos reales del despliegue; el umbral publicado se eligió en un split sintético.
- El sesgo posicional se ha mitigado (97 % de estabilidad), pero no se garantiza estabilidad total ante reformateos de las opciones.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B.
- No se publican longitudes de contexto ni variantes cuantizadas, lo que dificulta planificar despliegues en entornos con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eqlx-ai/tr-telekom-router
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
