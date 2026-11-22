# baselabs/elephant-1

## Resumen

elephant-1 es un modelo de decisión de 9.409 millones de parámetros desarrollado por Base Labs en Baseten, obtenido mediante un fine-tune completo de Qwen3.5-9B. No es un modelo generativo al uso: recibe un estado (texto, opcionalmente con imágenes) junto con un conjunto de preguntas tipadas (sí/no, elección entre opciones, puntuación ordinal) y devuelve una probabilidad calibrada para cada opción, resolviendo todas las preguntas en un único prefill de prefijo compartido.

Su relevancia radica en que sustituye el patrón habitual de "pedir al LLM que responda en JSON y parsear" por una interfaz de clasificación nativa con calibración explícita (término de Brier en la función de pérdida) y una opción entrenada de "no lo sé". Esto lo hace adecuado para enrutamiento, guardrails y sistemas de decisión donde la fiabilidad de la probabilidad importa más que la fluidez del texto.

Está post-entrenado sobre Qwen3.5-9B, conserva la torre de visión (congelada) y admite entradas multimodales. Según el autor, es el mejor modelo por debajo de 15B en el Jev Decision Index 0.4 (62,65) y alcanza 65,2 en una réplica del Artificial Analysis Decision Index, a la altura de d1-ultra (65). Tiene un hermano mayor de 27B, mammoth-1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5) con máscara bidireccional por bloques en las capas de atención completa; torre de visión congelada |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens de secuencia máxima |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (según la model card); resto no disponible |
| Licencia | MIT (modificaciones de Baseten) sobre Apache 2.0 (Qwen3.5-9B); uso sujeto a ambas |
| Formato de pesos | safetensors (librería transformers); runtime de servicio propio OneJev |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer decoder multimodal con torre de visión. El fine-tune es completo sobre el modelo de lenguaje, mientras que el codificador de visión permanece congelado. La innovación estructural es el uso de una máscara de atención bidireccional por bloques en las capas de atención completa, que permite que todas las preguntas de una misma petición se resuelvan contra el mismo prefijo de estado en un solo paso de prefill, en lugar de una generación autoregresiva por pregunta.

El entrenamiento usó 6,21 millones de ejemplos de decisión (Mix 8), con la siguiente composición: 58,3% de habilidades de decisión centrales, 16,1% de seguridad y abstención, 16,1% de juicio y dominios expertos y 9,5% de datos públicos de decisión. La función objetivo combina entropía cruzada con un término de calibración de Brier (λ = 1) e incluye una opción entrenada de "no lo sé". La receta fue de 1 época (5.546 pasos), LR pico de 3,5e-6, AdamW (β 0,9/0,95, sin weight decay), 3% de warm-up, decaimiento coseno y precisión bf16, sobre 16 nodos de 8 H100 (128 GPU). Las peticiones que exceden los límites de longitud entrenados se rechazan, no se truncan.

## Capacidades

- Clasificación binaria calibrada (tipo `noul`): devuelve P(sí) para una instrucción dada.
- Elección entre opciones nombradas (tipo `choice`): devuelve la opción elegida y el vector de probabilidades sobre todas las alternativas.
- Puntuación ordinal (tipo `score`): devuelve el nivel asignado y probabilidades sobre una escala ordenada de niveles.
- Decisión multi-pregunta en un solo prefill: varias preguntas comparten el mismo estado de entrada, con el coste de prefill amortizado.
- Entrada multimodal: acepta texto e imágenes en el estado.
- Abstención calibrada: opción "no lo sé" entrenada explícitamente, útil para guardrails.
- Calibración probabilística: el término de Brier en el objetivo busca que las probabilidades sean interpretables, no solo el argmax.
- No es un modelo de generación libre: no está pensado para producir texto abierto, tool calling generativo ni razonamiento multi-paso en lenguaje natural.

## Casos de uso

- Enrutamiento de tickets de soporte: se define una pregunta `choice` con criterios (facturación, técnico, fraude) y el modelo devuelve la etiqueta y la distribución de probabilidad; la incertidumbre permite derivar a revisión humana cuando la confianza es baja.
- Guardrails de entrada en producción: preguntas `noul` del tipo "¿el usuario pide algo prohibido?" o "¿el mensaje contiene datos personales?" con probabilidad calibrada, lo que permite fijar umbrales y medir falsos positivos frente a falsos negativos.
- Triaje de urgencia: pregunta `score` con niveles ordenados ("puede esperar", "hoy", "bloqueante ahora") sobre el texto del cliente, aprovechando la naturaleza ordinal de la salida.
- Moderación y abstención: el uso de la opción "no lo sé" entrenada permite construir pipelines que escalan automáticamente los casos ambiguos en lugar de forzar una etiqueta.
- Clasificación de documentos con imagen: al aceptar imágenes, puede decidir sobre capturas, formularios escaneados o pantallazos de error junto al texto del usuario.
- Evaluación automática de respuestas (LLM-as-judge acotado): formular el juicio como preguntas `choice` o `score` con criterios definidos, obteniendo probabilidades en lugar de texto libre que haya que parsear.
- Extracción de señales para sistemas de decisión: sustituir cadenas de prompts con salida JSON por una llamada única que devuelve varias etiquetas calibradas sobre el mismo estado.

## Benchmarks y rendimiento

Jev Decision Index 0.4:

| Modelo | Decision Index |
|---|---:|
| mammoth-1 | 71,24 |
| Perplexity Decider v1.2 | 69,42 |
| elephant-1 | 62,65 |
| Jev 1.14 | 62,2 |
| Cloudflare Clef | 55,7 |

Artificial Analysis Decision Index (réplica del autor):

| Modelo | Score |
|---|---:|
| mammoth-1 | 65,9 |
| elephant-1 | 65,2 |
| d1-ultra | 65 |

Según el autor, en el split público elephant-1 queda ligeramente por detrás de mammoth-1 en todas las áreas y supera a Jev 1.14 en las cinco (conocimiento y razonamiento, lenguaje, herramientas y automatización, recuperación y clasificación, artes y gusto humano). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 18,8 GB en safetensors; en bf16 necesita del orden de 19-20 GB de pesos más overhead de activaciones y del runtime. Con cuantización de 8 bits cabría en torno a 10-11 GB y en 4 bits en torno a 6-7 GB, aunque el autor no publica recetas de cuantización.
- GPU recomendadas: el setup oficial exige una GPU CUDA con la imagen `pytorch/pytorch:2.8.0-cuda12.8-cudnn9-devel`; para bf16 sin cuantizar, A100 40/80 GB, H100 o L40S son opciones seguras.
- GPU de consumo: no hay confirmación oficial; en bf16 una RTX 4090 de 24 GB queda al límite por pesos, y en cuantización de 8 o 4 bits sería viable, pero el runtime OneJev y el `serve.patch` son específicos del autor.
- Despliegue: runtime propio OneJev con `serve.patch` instalado vía `setup.sh`, o la API gestionada de Baseten (endpoint compatible con texto e imagen). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El diseño de un solo prefill compartido para todas las preguntas reduce el coste frente a una generación por pregunta, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index (Jev 0.4) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| elephant-1 | 9B | 16.384 | 62,65 | MIT + Apache 2.0 | Hugging Face + API Baseten |
| mammoth-1 | 27B | No disponible | 71,24 | No disponible | Hugging Face + API Baseten |
| Perplexity Decider v1.2 | No disponible | No disponible | 69,42 | No disponible | No disponible |
| Jev 1.14 | No disponible | No disponible | 62,2 | No disponible | No disponible |
| Cloudflare Clef | No disponible | No disponible | 55,7 | No disponible | No disponible |

En la réplica del Artificial Analysis Decision Index, elephant-1 (65,2) queda por encima de d1-ultra (65) y por debajo de mammoth-1 (65,9). No se dispone de datos de parámetros, contexto ni licencia de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no sirve para chat abierto, redacción, código ni razonamiento libre; forzarlo a esos usos no es su diseño.
- Idiomas: la model card declara únicamente inglés; el comportamiento en castellano no está documentado ni validado.
- Longitud: las peticiones que exceden los límites entrenados se rechazan en lugar de truncarse, lo que exige validación previa en el pipeline.
- Calibración dependiente del dominio: las probabilidades están calibradas sobre la distribución de Mix 8; en dominios muy alejados puede degradarse la fiabilidad de los umbrales.
- Riesgo de sesgo heredado del modelo base Qwen3.5-9B y de los datos de decisión, no evaluado de forma independiente en la información disponible.
- Licencia dual: las modificaciones de Baseten son MIT, pero el modelo base es Apache 2.0; el uso comercial debe cumplir ambas y revisar `LICENSE` y `NOTICE`.
- Dependencia de runtime propietario: el despliegue self-hosted requiere OneJev y un parche de servicio específicos, lo que limita la portabilidad frente a stacks estándar como vLLM.
- Sin datos publicados de cuantización, latencia ni throughput; el dimensionado de producción debe hacerse con pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baselabs/elephant-1
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo hermano mammoth-1: https://huggingface.co/baselabs/mammoth-1
- Probar en Baseten: https://www.baseten.co/library/elephant-1/
- Informe técnico: https://labs.baseten.co/articles/mammoth-1-and-elephant-1-frontier-decision-models
- Blog de Baseten: https://www.baseten.co/blog/the-best-decision-models-in-the-world-mammoth-1-and-elephant-1/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
