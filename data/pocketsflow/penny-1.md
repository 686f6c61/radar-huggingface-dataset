# pocketsflow/penny-1

## Resumen

Penny 1 es un modelo de decisión de pequeno tamano desarrollado por Pocketsflow Research. Se trata de un fine-tune con LoRA (rango 16 sobre las 14 capas superiores de 28, fusionado) del modelo base Qwen/Qwen3-0.6B, con 596.049.920 parámetros totales en formato safetensors. Su propósito no es la generación libre de texto, sino responder a una situacion y una pregunta concreta con una decisión estructurada: elegir una opción entre 2 y 8, responder si o no, o emitir una puntuación de 1 a 5, acompanada de una confianza calibrada, todo en un único forward pass.

La relevancia del modelo reside en su enfoque en la calibración y la predicción selectiva. En lugar de competir en precisión bruta con modelos de mayor tamano, Penny 1 está disenado para automatizar decisiones de alto volumen y bajo coste, derivando a un humano aquellas respuestas en las que no está seguro. Con umbrales preconfigurados en `penny_config.json`, el modelo responde automáticamente a entre el 46% y el 68% de las consultas con una precisión del 82% al 91%, según el dominio.

El modelo se distribuye bajo licencia Apache-2.0, funciona en CPU mediante Ollama, LM Studio o llama.cpp, y su cuantización Q4_K_M ocupa solo 397 MB. Está entrenado exclusivamente en inglés y no está pensado para escribir párrafos ni para decisiones de alto riesgo en crédito, seguros, contratación, medicina o ámbito legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B), fine-tune LoRA fusionado |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los estados largos se truncan) |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Penny 1 parte de Qwen/Qwen3-0.6B, un transformer decoder-only de 0,6B parámetros. Sobre él se aplicó un fine-tune LoRA de rango 16 limitado a las 14 capas superiores de las 28 totales, posteriormente fusionado en los pesos finales. La pérdida se calcula únicamente sobre el token de respuesta, de modo que el modelo aprende a asignar probabilidad al token correcto (letra A-H o dígito 1-5) en lugar de generar secuencias completas. El entrenamiento se realizó en CPU.

Los datos de entrenamiento consisten en aproximadamente 10.101 decisiones sintéticas, redactadas por modelos abiertos con una respuesta conocida y conservadas solo cuando un modelo juez a ciegas coincidía con dicha respuesta. No se emplearon datos de clientes. La calibración se resuelve con una temperatura por tipo de pregunta, ajustada sobre el conjunto de validación y almacenada en `penny_config.json`. En inferencia, la confianza se obtiene aplicando softmax únicamente sobre los tokens permitidos tras dividir los logits por la temperatura correspondiente al tipo de pregunta.

## Capacidades

- Toma de decisiones de elección múltiple: selecciona una opción entre 2 y 8 alternativas (letras A-H) a partir de un estado y una pregunta.
- Decisiones binarias: responde sí o no (A = sí, B = no).
- Puntuación ordinal: emite una puntuación de 1 a 5 para evaluaciones graduadas.
- Confianza calibrada: devuelve una probabilidad calibrada por tipo de pregunta, apta para umbrales de automatización y enrutamiento a revisión humana.
- Predicción selectiva: permite responder automáticamente solo cuando la confianza supera un umbral configurable.
- Lectura de estados en texto libre o JSON dentro de las etiquetas `<state>`.
- Ejecución en CPU: compatible con Ollama, LM Studio y llama.cpp mediante GGUF.
- Clientes incluidos: `penny.py` y `penny.mjs`, sin dependencias, con calibración incorporada.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Filtrado de phishing y correo sospechoso: el modelo recibe el cuerpo del mensaje como estado y una pregunta binaria del tipo "¿es un intento de phishing?", devolviendo sí/no con confianza. La calibración permite derivar a revisión humana los casos dudosos.
- Triaje de solicitudes de reembolso: con opciones como reembolso completo, crédito en tienda o rechazo, el modelo clasifica cada petición en un único forward pass, adecuado para colas de alto volumen donde el coste por decisión importa.
- Moderación de contenido por categorías: clasificación de publicaciones o comentarios en un conjunto cerrado de 2 a 8 etiquetas, con umbral de confianza para escalar los casos ambiguos.
- Enrutamiento de tickets de soporte: asignación de cada ticket a un equipo o cola concreta mediante pregunta de elección, usando el estado con los metadatos del ticket en JSON.
- Evaluación de calidad con escala 1-5: puntuación de respuestas de un chatbot o de resenas de producto, con la advertencia de que las puntuaciones tienden a agruparse en el centro en entradas poco familiares.
- Control previo de comandos de agentes: verificación de si una acción propuesta por un agente debe permitirse, siempre acompanada de una lista de permitidos estricta, ya que el modelo no es un control de seguridad.
- Clasificación de intención en asistentes conversacionales: determinación de la intención del usuario entre un conjunto acotado de opciones antes de derivar a un modelo generativo mayor.

## Benchmarks y rendimiento

Precisión sobre conjuntos de test reservados (una puntuación cuenta como correcta si está a un punto de distancia). Los dominios "no vistos" son familias de tareas ausentes por completo del entrenamiento.

| Modelo | General, dominios entrenados | General, no vistos | Dinero, entrenados | Dinero, no vistos | Error de calibración (no vistos) |
|---|---|---|---|---|---|
| Pocketsflow Penny 1 | 80,2% | 79,9% | 71,5% | 66,6% | 5,2% |
| Qwen3 0.6B (base, sin entrenar) | 55,8% | 61,8% | 45,6% | 47,5% | 25,0% |
| Llama 3.2 1B | 50,2% | 45,8% | 44,4% | 40,7% | no disponible |
| Llama 3.2 3B | 76,0% | 78,6% | 65,2% | 69,5% | no disponible |
| Llama 3.1 8B | 82,7% | 82,8% | 68,8% | 70,1% | no disponible |
| Llama 3.3 70B | 88,2% | 87,9% | 81,9% | 81,3% | no disponible |
| gpt-oss-20b | 89,7% | 92,2% | 83,5% | 83,3% | no disponible |

Decisiones automáticas con los umbrales de `penny_config.json` (choice ≥ 0,79; yes_no ≥ 0,72; score ≥ 0,8):

| Escenario | % respondido automáticamente | Precisión en automático |
|---|---|---|
| General, entrenados | 68,2% | 89,2% |
| General, no vistos | 64,5% | 90,8% |
| Dinero, entrenados | 46,4% | 84,9% |
| Dinero, no vistos | 47,5% | 82,4% |

Coste y velocidad (Q4_K_M, 397 MB, servidor de 4 vCPU y 8 GB a 48 USD/mes): aproximadamente 2,4 decisiones por segundo, unos 7,59 USD por millón de decisiones, frente a 27 USD para Llama 3.1 8B y 63 USD para Llama 3.3 70B vía API alojada.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en Q4_K_M (397 MB de pesos); aproximadamente 0,6 GB en Q8_0; en bf16 el repositorio completo ocupa 2,2 GB.
- Funciona en CPU sin GPU dedicada; el autor reporta 2,4 decisiones por segundo en un servidor de 4 vCPU y 8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también A100, H100 o T4 para despliegues de alto volumen.
- Cabe en cualquier GPU consumer e incluso en dispositivos de bajos recursos.
- Opciones de despliegue: Ollama (`ollama run hf.co/pocketsflow/penny-1:Q4_K_M`), LM Studio, llama.cpp, transformers, vLLM y TGI (estos últimos con los pesos safetensors en bf16).
- Latencia y throughput: aproximadamente 2,4 decisiones por segundo en 4 vCPU; sensiblemente mayor en GPU, aunque el autor no publica cifras concretas para aceleradores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión general (dominios vistos) | Licencia | Ejecución en CPU |
|---|---|---|---|---|---|
| Pocketsflow Penny 1 | 0,6B | no disponible | 80,2% | Apache-2.0 | Sí (Q4_K_M 397 MB) |
| Qwen3 0.6B (base) | 0,6B | no disponible | 55,8% | Apache-2.0 | Sí |
| Llama 3.2 1B | 1B | no disponible | 50,2% | Llama 3.2 Community | Sí |
| Llama 3.2 3B | 3B | no disponible | 76,0% | Llama 3.2 Community | Sí |
| Llama 3.1 8B | 8B | no disponible | 82,7% | Llama 3.1 Community | Con dificultad |

Penny 1 no es un modelo generativo comparable en tareas abiertas: su ventaja es la calibración (5,2% de error frente al 25,0% del base sin entrenar) y el coste por decisión, no la precisión bruta frente a modelos de 8B o 70B.

## Limitaciones y advertencias

- Solo inglés; no soporta otros idiomas.
- Entrenado con datos sintéticos: las entradas reales serán más ruidosas y pueden degradar el rendimiento.
- No apto para decisiones de crédito o préstamos, seguros, contratación, médicas ni legales.
- Una pregunta por llamada; los estados largos se truncan, lo que puede eliminar información relevante.
- Las puntuaciones 1-5 tienden a agruparse en el centro en entradas poco familiares; se recomienda preferir elección o sí/no en decisiones importantes.
- No es un control de seguridad: puede equivocarse con alta confianza ante comandos peligrosos de un agente; debe mantenerse una lista de permitidos estricta delante de cualquier acción destructiva.
- La confianza está calibrada sobre los conjuntos de test del autor, no sobre datos del usuario; conviene validarla con una muestra propia antes de automatizar.
- Es menos preciso que modelos de 8B y 70B; su valor está en el coste y la calibración, no en la precisión máxima.
- Riesgo de alucinación inherente al modelo base, aunque la tarea restringida a tokens de respuesta acotados reduce la superficie de error.
- El modelo es muy reciente (creado el 25 de octubre de 2026) y cuenta con 182 descargas y 0 likes, por lo que la validación comunitaria es todavía escasa.

## Enlaces

- HuggingFace: https://huggingface.co/pocketsflow/penny-1
- Página de investigación (paper, gráficas y playground): https://www.pocketsflow.com/research/penny
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
