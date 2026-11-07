# Aurelius51/lingualsafety-intent-guard

## Resumen

LingualSafety intent guard es un adaptador LoRA de clasificación binaria de seguridad construido sobre `google/gemma-3-4b-it`, el modelo multimodal instructivo de 4.000 millones de parámetros de Google DeepMind. Lo desarrolla Aurelius51 (Digvijay Singh) y su función es actuar como puerta de entrada (input gate) de un sistema de moderación multilingüe: recibe el mensaje del usuario y estima la probabilidad de que la petición sea dañina antes de que el modelo base llegue a responder. El adaptador se publica bajo licencia Gemma y está entrenado para cinco idiomas: inglés, hindi, bengalí, maratí y panyabí.

La particularidad del modelo es que no se limita a detectar peticiones dañinas literales, sino que está entrenado para reconocerlas cuando vienen envueltas en técnicas de persuasión (apelación lógica, invocación de autoridad, anclaje, priming, tergiversación, sesgo de confirmación). Además, cubre categorías de daño que no aparecían en los prompts publicados por la tarea de referencia, como actividad ilegal, daño físico, cabildeo político y desinformación, o malware.

El adaptador tiene un tamaño de repositorio de 0,2 GB, emplea LoRA con r=16 y alpha=32 sobre las proyecciones de atención y MLP del transformer, y se distribuye en formato safetensors compatible con PEFT. Es un artefacto de investigación, no un sistema de moderación listo para producción, y así lo declara el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3-4B-IT) con adaptador LoRA en proyecciones de atención y MLP |
| Parámetros totales | 4.000 millones (modelo base); el adaptador LoRA no declara recuento propio |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | inglés (en), hindi (hi), bengalí (bn), maratí (mr), panyabí (pa) |
| Licencia | Gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | google/gemma-3-4b-it |
| Configuración LoRA | r=16, alpha=32, proyecciones de atención y MLP |
| Tamaño del repositorio | 0,2 GB |
| Librería | PEFT |
| Revisión fijada en inferencia | ed5527f4c39bb4c2563a3fdcb78390ca3107df83 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma-3-4B-IT, un transformer decoder-only de 4.000 millones de parámetros. El LoRA (r=16, alpha=32) se inserta en las proyecciones de atención y MLP del modelo de lenguaje, de modo que el clasificador reutiliza la representación interna del modelo base y solo aprende un ajuste de bajo rango. La clasificación se obtiene comparando la probabilidad del siguiente token para `unsafe` frente a `safe` tras una plantilla de prompt específica definida en `inference/cls_prompt.py` del repositorio de código. El autor indica que entrenó sobre `unsloth/gemma-3-4b-it`, una copia sin gating con pesos idénticos byte a byte al modelo oficial (mismo SHA-256 en ambos shards safetensors, mismo tokenizer y misma plantilla de chat), por lo que el adaptador se aplica sin cambios al modelo oficial de Google.

Los datos de entrenamiento combinan ejemplos dañinos y benignos. En el lado dañino se incluyen todos los prompts publicados por la tarea compartida para desarrollo (7 categorías, en versión plana y envuelta en persuasión, en 5 idiomas, con las peticiones planas contadas tres veces), prompts unsafe de IndicGuard y de OR-Bench-toxic (ambos CC-BY-4.0), y peticiones dañinas de categorías no publicadas (actividad ilegal, daño físico, cabildeo político y desinformación, malware) generadas a partir de semillas inglesas de Aegis, reescritas por Gemma-3-4B-IT en los seis estilos de persuasión más la petición plana y traducidas con NLLB-200-distilled-600M; solo la mitad de esas semillas se usó para entrenar. En el lado benigno se emplean prompts seguros de IndicGuard, prompts "aparentemente tóxicos" de OR-Bench-80K (excluyendo OR-Bench-Hard-1K), filas no usadas del dataset Aya (Apache-2.0) y peticiones benignas emparejadas por tema y envueltas en persuasión, generadas con Gemma-3-4B-IT y traducidas con NLLB. Se excluyeron explícitamente los ítems de evaluación (CatQA, XSTest, JBB-benign, OR-Bench-Hard-1K, las filas de evaluación de Aya) y la mitad reservada del conjunto de categorías no vistas. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Clasificación binaria de seguridad de mensajes de usuario (safe/unsafe) mediante la probabilidad del siguiente token.
- Detección de peticiones dañinas envueltas en técnicas de persuasión: apelación lógica, invocación de autoridad, anclaje, priming, tergiversación y sesgo de confirmación.
- Cobertura de categorías de daño no presentes en los prompts publicados de la tarea: actividad ilegal, daño físico, cabildeo político y desinformación, y malware.
- Funcionamiento multilingüe en inglés, hindi, bengalí, maratí y panyabí.
- Integración como puerta de entrada en un sistema de moderación con respuesta fija de disculpa en el idioma del usuario cuando se activa el filtro.
- Combinable con una segunda comprobación de prompt (IndicGuard) para la decisión final de rechazo.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio para este adaptador; el modelo base Gemma-3-4B-IT es multimodal, pero el adaptador se entrena para clasificación de texto.

## Casos de uso

- Moderación de entrada en asistentes conversacionales multilingües: el adaptador se coloca delante del modelo generativo y bloquea peticiones dañinas antes de que se consuma presupuesto de inferencia en la respuesta, devolviendo una disculpa fija en el idioma del usuario.
- Protección frente a jailbreaks persuasivos: al estar entrenado con seis estilos de persuasión, detecta intentos que reformulan una petición dañina como apelación a la autoridad o como ejercicio académico, un patrón habitual en ataques manuales.
- Filtrado en plataformas de contenido en hindi, bengalí, maratí y panyabí: cubre idiomas con poca representación en sistemas de moderación comerciales, lo que lo hace útil para despliegues regionales en el sur de Asia.
- Investigación en seguridad de LLM: sirve como línea base reproducible para estudiar la robustez de clasificadores de intención frente a prompts envueltos en persuasión, con umbrales y métricas documentados.
- Detección de solicitudes de malware o de actividad ilegal: el conjunto de entrenamiento incluye categorías no publicadas por la tarea, por lo que puede emplearse como capa adicional en entornos de desarrollo que reciben peticiones de código ofensivo.
- Enrutado previo en pipelines de evaluación: al devolver una probabilidad calibrada, permite fijar umbrales distintos según el coste de un falso positivo (por ejemplo, 0,85 para minimizar rechazos benignos o 0,6 combinado con IndicGuard para maximizar cobertura).
- Auditoría de sesgos de moderación: comparar las tasas de rechazo entre idiomas y entre peticiones planas y persuasivas permite medir disparidades de cobertura en el filtro.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| Peticiones dañinas de categorías no vistas, formato del benchmark (7.350 prompts, 5 idiomas), configuración final | Tasa de rechazo en la entrada | 93,8 % |
| Igual, peticiones envueltas en persuasión | Tasa de rechazo | 94,9 % |
| Igual, peticiones planas | Tasa de rechazo | 87,5 % |
| Peticiones dañinas de categorías no vistas, solo este clasificador con umbral 0,85 | Tasa de rechazo | 89,7 % |
| CatQA (preguntas dañinas planas de categorías no vistas), configuración final | Respuestas juzgadas dañinas (puntuación 4-5, juez Qwen3-8B estricto) | 6,8 % |
| XSTest, configuración final | Rechazos adicionales frente al modelo base | +22,8 puntos |
| JBB-benign, configuración final | Rechazos adicionales frente al modelo base | +16,0 puntos |
| Prompts naturales de Aya, configuración final | Rechazos adicionales frente al modelo base | +0,6 puntos |
| OR-Bench-Hard, configuración final | Rechazos adicionales frente al modelo base | +15,8 puntos |
| XSTest, solo este clasificador con umbral 0,85 | Rechazos adicionales | +5,8 puntos |
| JBB-benign, solo este clasificador con umbral 0,85 | Rechazos adicionales | +5,6 puntos |
| Prompts naturales de Aya, solo este clasificador con umbral 0,85 | Rechazos adicionales | 0,0 puntos |
| OR-Bench-Hard, solo este clasificador con umbral 0,85 | Rechazos adicionales | +3,1 puntos |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible, ya que el adaptador no está orientado a tareas generativas. Los prompts publicados por la tarea están incluidos en el entrenamiento, por lo que las puntuaciones sobre ellos no son held-out.

## Requisitos de hardware

- El adaptador LoRA pesa 0,2 GB, pero requiere cargar el modelo base Gemma-3-4B-IT (4.000 millones de parámetros) para inferir.
- VRAM estimada para inferencia en fp16/bf16: en torno a 8-9 GB para los pesos del modelo base más overhead de activaciones y KV cache; no se dispone de mediciones oficiales del autor.
- En cuantización de 8 bits el modelo base cabría en GPUs consumer de 8 GB; en 4 bits, en GPUs de 6-8 GB. Estas cifras son estimaciones a partir del tamaño del modelo base, no datos publicados para este adaptador.
- GPUs recomendadas: A100 o H100 para servir el clasificador a gran volumen; RTX 4090, RTX 3090 o RTX 4080 para desarrollo y despliegue de baja concurrencia.
- Cabe en GPU consumer: sí, con el modelo base en cuantización de 8 o 4 bits.
- Opciones de despliegue: PEFT para cargar el adaptador sobre el modelo base; el repositorio de código incluye `inference/run.py` para ejecutar el sistema completo sobre un fichero de prompts. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. Al ser un clasificador de un solo token de salida, el coste dominante es el prefill del prompt del usuario.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| LingualSafety intent guard | LoRA sobre Gemma-3-4B-IT | 4.000 M (base) | en, hi, bn, mr, pa | Gemma | Clasificador de intención con cobertura de persuasión y categorías no vistas |
| IndicGuard (l3cube-pune) | Guardrail de prompts | no disponible | índicas (no detallado) | no disponible | Comprobación de prompt usada junto a este clasificador en el sistema final (umbral 0,99) |
| OR-Bench-toxic / OR-Bench-80K | Conjuntos de datos de evaluación | no aplica | inglés | CC-BY-4.0 | Benchmark de prompts tóxicos y "aparentemente tóxicos", no un modelo |
| CatQA | Benchmark de evaluación | no aplica | no disponible | no disponible | Preguntas dañinas planas de categorías no vistas, usado como held-out |

No se dispone de comparativas publicadas frente a clasificadores de seguridad comerciales (por ejemplo, modelos de moderación de OpenAI o Llama Guard) en la información proporcionada.

## Limitaciones y advertencias

- Las peticiones de desinformación solo están cubiertas a través de las semillas políticas; otras temáticas de desinformación pueden pasar el filtro.
- Las peticiones planas de categorías no vistas se detectan con menor frecuencia (87,5 %) que las envueltas en persuasión (94,9 %).
- La configuración final combinada con IndicGuard eleva los rechazos benignos de forma notable en algunos conjuntos: +22,8 puntos en XSTest y +15,8 en OR-Bench-Hard, lo que implica falsos positivos sobre peticiones legítimas.
- Las métricas basadas en juez provienen de un único juez LLM estricto (Qwen3-8B), sin validación con anotadores humanos.
- El autor lo declara explícitamente como artefacto de investigación, no como sistema de moderación de producción.
- Las puntuaciones sobre los prompts publicados por la tarea no son held-out, ya que están incluidos en el entrenamiento.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un clasificador binario, el riesgo se traduce en falsos positivos y falsos negativos, no en texto generado.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, que imponen restricciones adicionales más allá de las licencias open source permisivas.
- Cobertura lingüística limitada a cinco idiomas; no se documenta comportamiento en castellano ni en otras lenguas.
- Longitud de contexto del modelo base no documentada en la información disponible; prompts muy largos podrían truncarse según la configuración de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aurelius51/lingualsafety-intent-guard
- Perfil del autor: https://huggingface.co/Aurelius51
- Código del sistema (input gate): https://github.com/Aurelius51/lingualsafety-input-gate
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Copia sin gating usada en entrenamiento: https://huggingface.co/unsloth/gemma-3-4b-it
- Guardrail complementario IndicGuard: https://huggingface.co/l3cube-pune/IndicGuard
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
