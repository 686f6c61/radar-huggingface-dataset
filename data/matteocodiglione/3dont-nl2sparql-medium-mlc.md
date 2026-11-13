# MatteoCodiglione/3dont-nl2sparql-medium-MLC

## Resumen

3dont-nl2sparql-medium-MLC es una conversión al formato MLC (WebGPU, cuantización q4f16_1) del modelo MatteoCodiglione/3dont-nl2sparql-medium, un fine-tuning LoRA de Qwen/Qwen3.5-4B orientado a una tarea muy concreta: convertir preguntas en lenguaje natural sobre nubes de puntos 3D y su ontología en las cinco listas (L1..L5) que la librería NL-2-SPARQL de 3DGraphExplorer transforma en consultas SPARQL. No es un modelo de propósito general: es un parser especializado que actúa como primer eslabón de una pipeline de consulta semántica sobre grafos de conocimiento 3D.

El entrenamiento se realizó con LoRA de rango 16 durante 1 epoch sobre el dataset NL-2-SPARQL de 3DOnt, compuesto por preguntas originales, nuevas estructuras lógicas generadas y aproximadamente 10 000 preguntas escritas a mano. El modelo base aporta una ventana de contexto amplia y capacidades multilingües, pero el ajuste está orientado a inglés y a la salida estructurada de cinco listas, no a texto libre.

Esta variante MLC existe para permitir inferencia en navegador vía WebGPU, sin necesidad de GPU dedicada ni de backend Python, lo que la hace adecuada para demos online y despliegues ligeros en cliente. El repo pesa 2,4 GB y la licencia es Apache 2.0. Es relevante ahora por la tendencia a llevar modelos pequeños especializados directamente al navegador para tareas de parsing estructurado con latencia baja y privacidad de datos en cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B) con adaptador LoRA rango 16, convertido a MLC (WebGPU) |
| Parametros totales | 4B (modelo base Qwen/Qwen3.5-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3.5-4B) |
| Tipos de cuantizacion | q4f16_1 (MLC); existen variantes del autor en MLX 4-bit y formato Hugging Face |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | MLC (WebGPU q4f16_1); repo de 2,4 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de 4 000 millones de parámetros, sobre el que se aplicó un ajuste LoRA de rango 16 durante 1 epoch. El dataset NL-2-SPARQL de 3DOnt combina preguntas originales, nuevas estructuras lógicas generadas automáticamente y alrededor de 10 000 preguntas escritas a mano. El objetivo de entrenamiento es la generación de las cinco listas L1..L5 que la librería NL-2-SPARQL consume para construir la consulta SPARQL final.

El prompt de sistema usado en entrenamiento es fijo: `You will receive a natural language query by the user. you just have to parse it. do not say anything else.` Se emplea la plantilla de chat del modelo base con el modo thinking desactivado (`enable_thinking=False`), de modo que la salida es directamente el parsing estructurado. Esta variante concreta se ha convertido a MLC con cuantización q4f16_1 para ejecución vía WebGPU en navegador; el autor publica además una versión en formato Hugging Face y una MLX 4-bit para Apple Silicon.

## Capacidades

- Parsing de lenguaje natural a las cinco listas (L1..L5) que alimentan la generación de SPARQL en 3DGraphExplorer.
- Comprensión de preguntas sobre nubes de puntos 3D y su ontología asociada.
- Salida estrictamente estructurada: no responde en texto libre, solo devuelve el parsing solicitado.
- Ejecución en navegador mediante WebGPU (formato MLC q4f16_1), sin backend Python.
- Idioma de trabajo: inglés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking (este último está explícitamente desactivado).

## Casos de uso

- Consulta semántica de nubes de puntos 3D en aplicaciones web: el usuario escribe una pregunta en inglés y el modelo produce las listas L1..L5 que la librería NL-2-SPARQL convierte en SPARQL, todo ejecutándose en el navegador vía WebGPU.
- Demo online de 3DGraphExplorer: al estar empaquetado en MLC q4f16_1, puede servirse como demo interactiva sin infraestructura GPU en servidor.
- Exploración de ontologías 3D por investigadores: permite formular consultas complejas sobre la ontología sin conocer la sintaxis SPARQL ni el esquema interno del grafo.
- Integración en pipelines de anotación de escenas 3D: el parsing estructurado alimenta directamente un generador de consultas para recuperar metadatos de objetos, relaciones y propiedades.
- Prototipado rápido de interfaces de consulta en cliente: al no requerir backend, reduce el coste de despliegue para equipos que trabajan con datasets 3D y quieren validar la pipeline NL-2-SPARQL.
- Evaluación de la pipeline completa en entornos con restricciones de privacidad: al ejecutarse localmente en el navegador, las preguntas del usuario no salen del dispositivo.
- Fine-tuning adicional o adaptación a nuevas ontologías: al estar bajo Apache 2.0 y con base Qwen3.5-4B, puede reajustarse para otros grafos de conocimiento con estructura similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo MLC q4f16_1 pesa 2,4 GB, lo que sugiere un consumo de memoria en el rango de 2-3 GB para los pesos cuantizados.
- GPU recomendadas: no disponible; el despliegue objetivo es WebGPU en navegador, por lo que no se especifican modelos de GPU de datacenter.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; al ser q4f16_1 y ~2,4 GB, es plausible en GPUs de consumo con soporte WebGPU, pero el autor no detalla modelos concretos.
- Opciones de despliegue: MLC LLM / WebGPU (esta variante), MLX 4-bit en Apple Silicon (MatteoCodiglione/3dont-nl2sparql-medium-mlx) y formato Hugging Face (MatteoCodiglione/3dont-nl2sparql-medium).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 3dont-nl2sparql-medium-MLC | 4B (LoRA r16) | no disponible | NL-2-SPARQL sobre ontologia 3D | apache-2.0 | MLC/WebGPU, MLX, HF |
| 3dont-nl2sparql-medium (HF) | 4B (LoRA r16) | no disponible | NL-2-SPARQL sobre ontologia 3D | apache-2.0 | Hugging Face |
| 3dont-nl2sparql-medium-mlx | 4B (LoRA r16) | no disponible | NL-2-SPARQL sobre ontologia 3D | apache-2.0 | MLX 4-bit (Apple Silicon) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Proposito general | no disponible en la informacion | Hugging Face |

Las tres variantes listadas son del mismo autor y comparten pesos base y ajuste; difieren solo en el formato de despliegue. No se dispone de datos de benchmarks para comparar rendimiento entre ellas ni frente al base.

## Limitaciones y advertencias

- Modelo especializado: no es apto para conversación general, generación de texto libre ni tareas ajenas al parsing NL-2-SPARQL sobre la ontología 3DOnt.
- Idioma: entrenado y evaluado en inglés; no se documenta soporte de castellano ni de otros idiomas.
- Salida rígida: el prompt de sistema obliga a devolver únicamente el parsing; desviarse de ese formato puede degradar la calidad de la salida.
- Riesgo de alucinación estructural: al generar listas L1..L5, puede producir identificadores o estructuras inexistentes en la ontología, que la librería NL-2-SPARQL traducirá a consultas SPARQL inválidas o vacías.
- Dependencia de la ontología: cambios en el esquema de 3DOnt o en la librería NL-2-SPARQL pueden invalidar el ajuste.
- Entrenamiento corto: 1 epoch con LoRA rango 16; no se reportan métricas de calidad ni curvas de evaluación.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B y de los datos de entrenamiento antes de desplegar en producción.
- Variante MLC: el rendimiento depende del soporte WebGPU del navegador y del hardware del cliente; no se publican latencias ni throughput.
- Repo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face (esta variante MLC): https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-medium-MLC
- Hugging Face (formato Hugging Face): https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-medium
- Hugging Face (MLX 4-bit): https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-medium-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
