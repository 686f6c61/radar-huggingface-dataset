# 3DOMFBK/3dont-nl2sparql-medium-mlx

## Resumen

3DOnt NL-2-SPARQL parser medium es un ajuste fino por LoRA del modelo base Qwen/Qwen3.5-4B, desarrollado por 3DOMFBK, especializado en la traducción de preguntas en lenguaje natural sobre nubes de puntos 3D y su ontología a las cinco listas (L1..L5) que consume la librería NL-2-SPARQL de 3DGraphExplorer para construir consultas SPARQL. No es un modelo conversacional generalista: es un parser de dominio muy acotado que transforma una pregunta del usuario en una estructura lógica intermedia, delegando la generación efectiva de SPARQL a la librería externa.

El modelo se distribuye en formato MLX 4-bit, pensado para ejecución en Apple Silicon dentro de 3DGraphExplorer, y cuenta con 4.205.751.296 parámetros totales (4B) con licencia Apache 2.0. El entrenamiento se realizó con LoRA de rango 16 durante una época sobre un conjunto de datos compuesto por preguntas originales del proyecto 3DOnt, nuevas estructuras lógicas generadas, aproximadamente 10.000 preguntas escritas a mano y 1.385 preguntas adicionales con relaciones implícitas.

Su relevancia actual radica en que aborda un problema clásico de los grafos de conocimiento: la brecha entre la formulación libre en lenguaje natural y las consultas formales SPARQL. Al fijar un contrato de salida estricto (cinco listas) y un system prompt fijo con el modo de razonamiento desactivado, el modelo reduce la variabilidad de la salida y facilita su integración determinista en un pipeline de recuperación sobre ontologías 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B), ajuste fino por LoRA (rank 16) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (repo publicado); el base_model permite otras cuantizaciones, no verificadas en este repo |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA fusionado, formato MLX 4-bit) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de unos 4.200 millones de parámetros, y se ajusta mediante LoRA de rango 16 durante una única época. El objetivo de entrenamiento no es la generación libre, sino el parseo estructurado: dada una pregunta en lenguaje natural sobre una nube de puntos 3D y su ontología, el modelo debe emitir las cinco listas L1..L5 que la librería NL-2-SPARQL de 3DGraphExplorer convierte en una consulta SPARQL. El conjunto de datos combina preguntas originales del proyecto 3DOnt, nuevas estructuras lógicas generadas automáticamente y aproximadamente 10.000 preguntas escritas a mano, más 1.385 preguntas adicionales que incorporan relaciones implícitas.

El entrenamiento fija un system prompt concreto ("You will receive a natural language query by the user. you just have to parse it. do not say anything else.") y utiliza la plantilla de chat del modelo base con el modo de razonamiento desactivado (`enable_thinking=False`). Este detalle es relevante para producción: el modelo no debe entrar en cadenas de pensamiento largas, sino producir directamente la estructura de salida esperada. No se documentan en la información disponible detalles sobre el volumen total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Parseo de lenguaje natural a estructura intermedia NL-2-SPARQL: transforma una pregunta sobre una nube de puntos 3D y su ontología en las cinco listas L1..L5.
- Generación de estructuras lógicas intermedias consumibles por la librería NL-2-SPARQL de 3DGraphExplorer para producir SPARQL final.
- Manejo de relaciones implícitas en las preguntas, gracias a las 1.385 muestras específicas incluidas en el entrenamiento.
- Salida restringida por contrato: el system prompt obliga a responder únicamente con el parseo, sin texto adicional.
- Modo de razonamiento desactivado (`enable_thinking=False`), lo que favorece respuestas directas y de baja latencia.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Consulta de ontologías 3D en 3DGraphExplorer: el modelo recibe la pregunta del usuario y devuelve las listas L1..L5 que la librería NL-2-SPARQL convierte en SPARQL; es su caso de uso principal y el que motivó el ajuste.
- Exploración de nubes de puntos en Apple Silicon: al distribuirse en MLX 4-bit, permite ejecutar el parser localmente en equipos Mac con chip Apple dentro de la aplicación de escritorio.
- Asistentes de catálogo de activos 3D: un usuario pregunta en lenguaje natural por objetos con determinadas propiedades geométricas o semánticas y el modelo genera la estructura de consulta para recuperarlos del grafo.
- Enriquecimiento de pipelines de datos geoespaciales: integración del parser como etapa previa a la generación de SPARQL en flujos automatizados de consulta sobre grafos de conocimiento 3D.
- Interfaz de lenguaje natural para bases de datos RDF de dominio 3D: reduce la necesidad de que el usuario final conozca SPARQL o el esquema de la ontología.
- Evaluación y prototipado de sistemas NL-2-SPARQL: al ser un modelo pequeño (4B) y con licencia Apache 2.0, sirve como baseline reproducible para comparar estrategias de parseo en dominios con ontologías estructuradas.
- Demo web vía WebGPU: la variante MLC (q4f16_1) del mismo ajuste permite desplegar una demostración online del parser sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo MLX 4-bit ocupa 2,4 GB, por lo que la inferencia en 4 bits requiere del orden de 2,5 a 3 GB de memoria unificada o VRAM, sin contar el overhead del runtime.
- GPU recomendadas: no se especifican en la información disponible; el formato publicado está orientado a Apple Silicon (MLX). Para GPUs NVIDIA no se documenta una variante concreta.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon con al menos 8 GB de memoria unificada; en el ecosistema NVIDIA, una GPU con 4 GB o más de VRAM sería suficiente para la cuantización 4-bit, aunque no está verificada en este repo.
- Opciones de despliegue: MLX (variante publicada), MLC con WebGPU q4f16_1 (repo `3DOMFBK/3dont-nl2sparql-medium-MLC`), y el formato Hugging Face estándar en `3DOMFBK/3dont-nl2sparql-medium` para otros runtimes. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| 3DOnt NL-2-SPARQL medium (este) | 4,2B | no disponible | MLX 4-bit, safetensors | Apache 2.0 | Parseo NL a estructura NL-2-SPARQL para ontologías 3D |
| Qwen/Qwen3.5-4B (base) | 4,2B | no disponible | safetensors | no disponible en la informacion | Modelo generalista; requiere prompting para tareas de parseo |
| 3DOnt NL-2-SPARQL medium (HF) | 4,2B | no disponible | safetensors | Apache 2.0 | Mismo ajuste en formato Hugging Face estándar |
| 3DOnt NL-2-SPARQL medium (MLC) | 4,2B | no disponible | MLC q4f16_1 | Apache 2.0 | Mismo ajuste para WebGPU y demo online |

No se dispone de información sobre otros modelos especializados en NL-2-SPARQL con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo está entrenado para parsear preguntas sobre nubes de puntos 3D y su ontología; fuera de ese ámbito su salida no es fiable.
- Idioma: la model card declara únicamente inglés; no hay evidencia de soporte para castellano u otros idiomas.
- Dependencia del contrato de salida: requiere el system prompt exacto del entrenamiento y la plantilla de chat del modelo base con `enable_thinking=False`; desviarse de esa configuración puede degradar la calidad del parseo.
- Riesgo de alucinación estructural: al generar listas L1..L5, puede producir estructuras sintácticamente válidas pero semánticamente incorrectas si la pregunta es ambigua o queda fuera de la distribución de entrenamiento.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al derivar de Qwen3.5-4B, hereda los sesgos del modelo base y de los datos de ajuste.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B, cuya licencia no se detalla en la información proporcionada.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el ajuste se entrenó solo una época con LoRA de rango 16, por lo que la validación en producción es limitada.
- Sin benchmarks publicados: no hay métricas objetivas de precisión del parseo ni comparaciones con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3DOMFBK/3dont-nl2sparql-medium-mlx
- Repositorio en formato Hugging Face: https://huggingface.co/3DOMFBK/3dont-nl2sparql-medium
- Repositorio MLC (WebGPU q4f16_1, demo online): https://huggingface.co/3DOMFBK/3dont-nl2sparql-medium-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
