# lostargon/Tiny-Jev

## Resumen

Tiny-Jev es un modelo de decisión de 0,6 mil millones de parámetros desarrollado por el usuario independiente lostargon, publicado bajo licencia Apache 2.0. No es un modelo generativo: no produce texto libre, sino que recibe un estado estructurado (un mensaje, un ticket, un registro JSON, una transcripción, un log o un diff), una pregunta redactada como se escribiría en código y un conjunto fijo de opciones, y devuelve una distribución de probabilidad calibrada sobre esas opciones en un único pase forward. Reproduce el estilo de interfaz del API de decisión Jev de TypeSafe AI (primitivas Choice, Score y Noul), aunque el autor declara explícitamente que no está afiliado a dicha empresa ni comparte código o pesos con ella.

El modelo se presenta como un "System One" de decisión: la pieza que actúa como un `if` inteligente dentro de un pipeline. Está pensado para enrutamiento, triaje, filtrado previo a ventanas de contexto caras, puntuación o guard-railing de la salida de otro modelo, moderación, etiquetado a volumen y decisiones por debajo de los 100 ms dentro de un handler de peticiones. Al ser no autorregresivo y tener un espacio de salida restringido a las opciones que se le pasan, la respuesta nunca puede estar mal formada: no hay parseo, reintentos ni errores de esquema.

Técnicamente es un fine-tuning con LoRA (fusionado en los pesos) sobre Qwen/Qwen3-0.6B, con 595.778.561 parámetros reales en safetensors y un repositorio de 1,2 GB. Existe un hermano mayor, Tiny-Jev-1.7B, con mayor precisión. El modelo solo declara soporte de inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3-0.6B) con cabeza lineal de decisión sobre estados ocultos en tokens marcadores |
| Parámetros totales | 595.778.561 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio publica safetensors; no se documentan variantes GGUF ni otras) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (un único archivo; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Tiny-Jev parte de Qwen3-0.6B y se ajusta mediante LoRA fusionado en los pesos. La innovación está en la cabeza de decisión: cada opción se renderiza como una línea propia después del estado y la pregunta, seguida de un token marcador; el estado oculto en cada marcador pasa por una cabeza lineal pequeña que produce un escalar, y un softmax sobre esos escalares da la distribución de respuesta. Noul es un Choice de dos opciones (`no` / `yes`); Score es un Choice sobre niveles ordenados cuyo valor esperado se reporta (puede caer entre niveles). Existe una llamada `decide` que permite hacer fan-out de varias preguntas sobre un mismo estado en un solo lote.

El entrenamiento se realizó sobre datasets sintéticos de decisiones tipadas: aproximadamente cien mil estados, cada uno emparejado con varias preguntas, con etiquetas derivadas de reglas explícitas o calculadas por código, de modo que cada objetivo es exacto. Las familias de tareas cubren soporte y operaciones (enrutamiento de tickets, intenciones de reembolso o cancelación, severidad, churn, triaje de correo, facturas, incidentes de seguridad), guard-railing de otros modelos (respuesta fundamentada en el contexto, cumplimiento de políticas, seguridad de acciones de agentes), contenido y texto (moderación, sentimiento, señales de reseñas falsas, intención de búsqueda, veredictos sobre diffs), voz y diálogo (turn-taking, detección de buzón de voz, frustración, siguiente acción del bot sobre transcripciones ASR ruidosas), lectura estructurada (logs, horarios y zonas horarias, inventario, control de acceso, máquinas de estados, validación de formato, precios con impuestos) y conjuntos de robustez (negación contrastiva y alcance). El objetivo es una entropía cruzada suave contra vectores de probabilidad objetivo, seguida de calibración de temperatura sobre un split reservado, de forma que la confianza reportada sea honesta.

## Capacidades

- Clasificación y enrutamiento con distribución de probabilidad calibrada sobre un conjunto fijo de opciones (primitiva Choice).
- Puntuación en escalas ordenadas con valor esperado continuo (primitiva Score).
- Evaluación de afirmaciones booleanas con probabilidad (primitiva Noul).
- Salida siempre válida por construcción: el espacio de respuesta es la lista de opciones, sin parseo ni errores de esquema.
- Fan-out por lotes: varias preguntas sobre un mismo estado en una sola llamada (`decide`).
- Triaje y filtrado previo a modelos generativos caros.
- Guard-railing y moderación de salidas de otros modelos.
- Procesamiento de estados heterogéneos: mensajes, tickets, JSON, transcripciones ASR, logs, diffs de código.
- Decisiones de baja latencia (milisegundos en GPU de consumo, 20–50 ms en portátil Apple M-series).
- No soporta generación de texto libre, tool calling, agentes multi-paso ni visión.

## Casos de uso

- Enrutamiento de tickets de soporte: se pasa el mensaje del cliente y el plan como estado, y el modelo devuelve la distribución sobre equipos (facturación, técnico, ventas) con confianza; las decisiones por debajo de un umbral se escalan a revisión humana.
- Triaje de correo y facturas: clasificación de intención y severidad sobre registros estructurados antes de invocar un LLM generativo, reduciendo el coste de contexto.
- Guard-railing de asistentes: verificar con Noul si la respuesta de otro modelo está fundamentada en el contexto proporcionado, si cumple la política o si debe escalarse.
- Seguridad de agentes autónomos: evaluar si una acción propuesta (comando de shell, escritura de archivo, llamada a API) es reversible, está en alcance o filtra secretos antes de ejecutarla.
- Moderación de contenido a volumen: categorías y severidad sobre reseñas o comentarios, con confianza calibrada para derivar los casos dudosos.
- Análisis de diálogo de voz: detección de fin de turno, buzón de voz, frustración y siguiente acción del bot sobre transcripciones ASR ruidosas.
- Lectura estructurada de logs y estados: transiciones de máquina de estados, niveles de inventario, reglas de control de acceso o validación de formato en pipelines de datos.
- Puntuación de churn y sentimiento por aspectos: Score sobre escalas ordenadas para priorizar cuentas en riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 1,2 GB de pesos más overhead de activaciones; cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: RTX 4090, RTX 3090, RTX 4060 Ti y superiores; también A100/H100 para despliegues de alto throughput, aunque el modelo es pequeño para ellas.
- Cabe en GPU de consumo y en portátiles Apple M-series (el autor reporta 20–50 ms por llamada en M-series y unos pocos milisegundos en GPU de consumo).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (dependencias: solo `torch` y `transformers`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: por debajo de 100 ms por decisión según el autor; el fan-out por lotes amortiza el coste de varias preguntas sobre un mismo estado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiny-Jev | 595,8 M | No disponible | Distribución sobre opciones fijas | Apache 2.0 | Hugging Face |
| Tiny-Jev-1.7B | No disponible | No disponible | Distribución sobre opciones fijas | No disponible | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 0,6 B | No disponible | Texto generativo autorregresivo | No disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones. La comparación con modelos de clasificación dedicados (por ejemplo, encoders tipo BERT) no está documentada en la información disponible.

## Limitaciones y advertencias

- Solo inglés: no se declara soporte multilingüe, por lo que su uso en castellano u otros idiomas no está validado.
- No genera texto: cualquier caso de uso que requiera generación libre, tool calling o razonamiento multi-paso queda fuera de su alcance.
- Entrenado sobre datos sintéticos: el rendimiento en distribuciones reales puede degradarse respecto a las etiquetas exactas del entrenamiento; conviene validar con datos propios.
- La calibración de confianza se realizó sobre un split reservado del propio dataset sintético; puede no transferirse a dominios distintos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas con confianza alta en estados fuera de distribución.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio (`modeling_tiny_jev.py`, unas 150 líneas); auditar antes de usar en producción.
- No afiliado a TypeSafe AI: el nombre "Jev" solo hace referencia al estilo de interfaz reproducido.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni soporte del autor.
- No se documentan cuantizaciones (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos sin `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lostargon/Tiny-Jev
- Modelo hermano Tiny-Jev-1.7B: https://huggingface.co/lostargon/Tiny-Jev-1.7B
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
