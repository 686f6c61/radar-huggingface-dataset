# MarkrAI/k-reggen-guard-4b

## Resumen

K-RegGen Guard 4B es un modelo guardián especializado en compliance regulatorio surcoreano, desarrollado por MarkrAI. Se trata de un adaptador LoRA (PEFT) montado sobre Qwen/Qwen3-4B-Instruct-2507, cuyo propósito es determinar si la respuesta de un LLM contiene artefactos ilegales según la normativa sectorial de Corea del Sur. A diferencia de los guardrails convencionales orientados a contenido dañino (violencia, odio), este modelo detecta violaciones regulatorias dentro de salidas aparentemente inocuas, como textos de publicidad médica o código que manipula números de registro de residentes.

El modelo recibe una tabla de reglas por sector (`guard_rules.json`), la petición del usuario y la respuesta del modelo, y emite un veredicto en tres líneas: `위반` (infracción), `확인필요` (requiere verificación) o `적법` (lícito), junto con el identificador de la regla y el fragmento problemático. La tabla cubre 4 dominios y 33 reglas: publicidad médica (의료법), código de tratamiento de datos personales (개인정보 보호법), venta online de productos restringidos y ejercicio profesional sin licencia. Al externalizar el conocimiento legal en la tabla de reglas en lugar de memorizarlo en los pesos, actualizar la normativa se reduce a editar filas del JSON.

Es relevante porque los guardrails genéricos tienen una tasa de detección muy baja (5-8% de recall) sobre este tipo de infracciones regulatorias. La propuesta de MarkrAI demuestra que un modelo pequeño de 4B parámetros con LoRA puede superar a alternativas mayores en esta tarea específica, con F1 de 0.881 en un conjunto de lectura de 1.000 respuestas de 7 LLMs distintos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA |
| Parámetros totales | 4B (modelo base) + adaptador LoRA r=16, alpha=32 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (configurado en el ejemplo de despliegue con vLLM) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Dataset de entrenamiento | MarkrAI/k-reggen (no publicado) |
| Tamaño del repositorio | 0.1 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el transformer decoder-only Qwen3-4B-Instruct-2507, con rango r=16 y alpha=32. El entrenamiento se realizó durante 2 épocas, con longitud máxima de 4.096 tokens y learning rate 1e-4. El prompt de inferencia se construye con `apply_chat_template` desactivando el modo thinking (`enable_thinking=False`), y la salida se parsea con el script `kreggen_prompt.py` incluido en el repositorio.

Los datos de entrenamiento combinan 5.908 pares sintéticos mínimos (el modelo profesor genera la misma respuesta en versiones infractora, lícita y con advertencia) y 14.719 respuestas reales obtenidas al pasar las peticiones de entrenamiento por 7 modelos abiertos que no aparecen en el benchmark. Las etiquetas fueron asignadas por un modelo juez local con la misma tabla de reglas; los casos discrepantes se resolvieron con dos lectores ciegos y solo se conservaron los que coincidieron. La similitud textual máxima entre las preguntas del benchmark y las peticiones de entrenamiento es de 0.15, y las respuestas de los modelos del benchmark no se usaron en entrenamiento. Los datos de entrenamiento no se publican porque contienen textos publicitarios y código ilegal reales generados por modelos.

## Capacidades

- Clasificación de respuestas de LLM en tres categorías regulatorias: infracción, requiere verificación y lícito.
- Identificación de la regla concreta infringida (por ejemplo, `MA-TESTIMONIAL`) y del fragmento exacto del texto que la vulnera.
- Cobertura de 4 dominios regulatorios: publicidad médica, código de protección de datos personales, venta online de productos restringidos y ejercicio profesional sin licencia.
- Detección de infracciones en texto y en código (por ejemplo, manejo de números de registro de residentes).
- Distinción entre infracción directa y casos condicionales que dependen de circunstancias no declaradas en la respuesta (evaluación de nueva tecnología médica, consentimiento de transferencia internacional, contratos de encargo).
- Generación de avisos legales que pueden anexarse a la respuesta original (artículo, contenido prohibido, alternativa lícita y fragmento problemático), mediante el módulo `RegGuard` de `guard/filter.py`.
- Selección automática del dominio a partir de la petición del usuario cuando este no se especifica.
- No soporta tool calling, agentes ni multimodalidad según la información disponible.

## Casos de uso

- Moderación de publicidad médica generada por LLM: el modelo detecta testimonios de pacientes, promesas de resultados o comparaciones con otras clínicas en textos de blogs y webs de clínicas dentales o estéticas, señalando la regla `MA-TESTIMONIAL` y el fragmento infractor.
- Revisión de código que procesa datos personales: identifica en el código generado prácticas como almacenar números de registro de residentes sin cifrado o sin base legal, apoyándose en el dominio `privacy_code` y la ley de protección de datos coreana.
- Filtrado en plataformas de e-commerce: verifica que las descripciones de producto no incluyan artículos de venta restringida (por ejemplo, medicamentos o productos sanitarios sujetos a la ley de farmacia).
- Detección de servicios profesionales no autorizados: comprueba que los textos generados no ofrezcan asesoramiento jurídico, fiscal o inmobiliario sin la habilitación correspondiente.
- Capa de seguridad en pipelines de generación aumentada: se integra como etapa posterior al LLM principal (por ejemplo, con vLLM y `LoRARequest`) para etiquetar respuestas antes de que lleguen al usuario final.
- Auditoría de respuestas de terceros: el modelo puede evaluar respuestas producidas por otros LLMs (incluidos modelos frontera) contra las 33 reglas, generando un informe de cumplimiento con la regla y el fragmento afectados.
- Generación de avisos de cumplimiento: a partir del veredicto, `RegGuard` construye el texto de advertencia con la base legal y la alternativa permitida, listo para insertarse en la respuesta.

## Benchmarks y rendimiento

| Evaluación | Casos | Recall | Precisión | F1 | Falsos positivos en respuestas lícitas |
|---|---:|---:|---:|---:|---:|
| Test de respuestas reales | 1.187 | 0.946 | 0.919 | 0.932 | 10.0% |
| Test sintético | 576 | no disponible | no disponible | 0.994 | no disponible |
| Muestra de lectura del benchmark | 1.000 | 0.816 | 0.956 | 0.881 | 2.8% |

Comparativa en la misma muestra de lectura del benchmark (F1, agrupando infracción y requiere verificación):

| Modelo | F1 |
|---|---:|
| K-RegGen Guard 4B | 0.881 |
| K-RegGen Guard 1.7B | 0.871 |
| gpt-oss-safeguard-20b (con la misma tabla de reglas) | 0.764 |
| Qwen3-4B-Instruct (solo con la tabla de reglas) | 0.634 |
| Qwen3Guard-Gen-4B | 0.142 |
| kanana-safeguard-8b | 0.096 |

La muestra de lectura del benchmark corresponde a 1.000 respuestas reales generadas por 7 LLMs distintos sobre el benchmark K-RegGen, con doble lectura para fijar la etiqueta. El modelo de 1.7B tiene un F1 cercano pero una tasa de falsos positivos mayor en respuestas lícitas (14,5% frente al 10,0% del 4B).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un modelo de 4B parámetros, la inferencia en fp16 requiere aproximadamente 8-10 GB, y en cuantizaciones de 4 bits podría situarse en torno a 3-4 GB, aunque el autor no publica cifras.
- GPU recomendadas: no disponible en la información proporcionada. El ejemplo del autor usa vLLM con `max_model_len=16384` y `enable_lora=True`.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamaño del modelo base (4B), es plausible en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: vLLM con soporte LoRA (`LoRARequest`) es el método documentado. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 (muestra benchmark) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| K-RegGen Guard 4B | 4B + LoRA | 16.384 | 0.881 | MIT | Hugging Face (MarkrAI) |
| K-RegGen Guard 1.7B | 1.7B + LoRA | no disponible | 0.871 | no disponible | Hugging Face (MarkrAI) |
| gpt-oss-safeguard-20b | 20B | no disponible | 0.764 | no disponible | no disponible |
| Qwen3Guard-Gen-4B | 4B | no disponible | 0.142 | no disponible | no disponible |
| kanana-safeguard-8b | 8B | no disponible | 0.096 | no disponible | no disponible |

La comparación se limita a la tarea de compliance regulatorio coreano con la misma tabla de reglas; los modelos genéricos de seguridad obtienen resultados muy inferiores porque están entrenados para contenido dañino, no para infracciones regulatorias.

## Limitaciones y advertencias

- No constituye asesoramiento jurídico. Las reglas y etiquetas se contrastaron con textos legales y jurisprudencia, pero no pasaron revisión por expertos legales.
- La normativa cubierta corresponde a septiembre de 2026; las regulaciones no incluidas en la tabla de reglas no se detectan.
- La categoría `확인필요` (requiere verificación) es la más débil: por ejemplo, descuentos en copagos médicos sin condiciones son infracción directa, pero el modelo puede confundirlos con descuentos en servicios no cubiertos y clasificarlos como condicionales.
- El recall cae en respuestas de modelos no vistos durante el entrenamiento, especialmente en modelos frontera.
- El veredicto de infracción sirve para que el usuario reciba un aviso antes de usar el artefacto, pero no elimina ni corrige la parte infractora de la respuesta.
- Tasa de falsos positivos del 10,0% en respuestas lícitas del test de respuestas reales, lo que puede generar avisos innecesarios en producción.
- El modelo solo está entrenado y evaluado en coreano; no hay evidencia de funcionamiento en otros idiomas.
- Los datos de entrenamiento no son públicos, lo que dificulta la reproducibilidad y la auditoría independiente.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene sus propias condiciones que deben verificarse.

## Enlaces

- Hugging Face: https://huggingface.co/MarkrAI/k-reggen-guard-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo hermano 1.7B: https://huggingface.co/MarkrAI/k-reggen-guard-1.7b
- Dataset de benchmark: https://huggingface.co/datasets/MarkrAI/k-reggen
- Repositorio GitHub: https://github.com/Marker-Inc-Korea/K-RegGen
- Informe del guard: https://github.com/Marker-Inc-Korea/K-RegGen/blob/main/reports/kreggen_guard/%EB%A6%AC%ED%8F%AC%ED%8A%B8.md
- Módulo de filtrado `RegGuard`: https://github.com/Marker-Inc-Korea/K-RegGen/blob/main/guard/filter.py
