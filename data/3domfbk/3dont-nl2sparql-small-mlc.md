# 3DOMFBK/3dont-nl2sparql-small-MLC

## Resumen

3DOnt NL-2-SPARQL parser — small (2B) es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-2B, desarrollado por 3DOMFBK. Su función es convertir preguntas en lenguaje natural sobre nubes de puntos 3D y su ontología asociada en las cinco listas (L1..L5) que la librería NL-2-SPARQL de 3DGraphExplorer transforma posteriormente en consultas SPARQL. No genera SPARQL directamente: actúa como un parser intermedio especializado que estructura la intención de la pregunta según el esquema de la ontología.

El modelo está pensado para integrarse en el ecosistema 3DGraphExplorer, una herramienta de consulta sobre grafos de conocimiento de escenas 3D. Esta versión concreta está compilada para WebGPU mediante MLC con cuantización q4f16_1, lo que permite ejecutarla en el navegador y en el demo online del proyecto. El repositorio ocupa 1,1 GB e incluye únicamente pesos en formato MLC.

Se trata de un modelo muy especializado y de nicho: no es un asistente generalista, sino un componente de un pipeline mayor. Su relevancia radica en demostrar que un modelo de 2B parámetros ajustado con LoRA de rango 16 puede resolver una tarea estructurada de parsing semántico sobre ontologías, desplegable en cliente sin infraestructura de servidor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.5-2B) con adaptador LoRA (rango 16) fusionado |
| Parámetros totales | 2B (modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | q4f16_1 (MLC); existe variante MLX 4-bit en otro repositorio |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (WebGPU q4f16_1); Hugging Face format y MLX 4-bit en repositorios hermanos |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parámetros. Sobre él se aplicó un ajuste fino con LoRA de rango 16 durante 1 época. El conjunto de entrenamiento es el dataset NL-2-SPARQL de 3DOnt, compuesto por preguntas originales, nuevas estructuras lógicas generadas, aproximadamente 10.000 preguntas escritas a mano y 1.385 preguntas escritas a mano con relaciones implícitas. La tarea de salida son cinco listas (L1..L5) que codifican la estructura lógica de la consulta para su traducción a SPARQL.

El entrenamiento emplea un system prompt fijo: "You will receive a natural language query by the user. you just have to parse it. do not say anything else." y la plantilla de chat del modelo base con el modo de razonamiento desactivado (`enable_thinking=False`). No se han publicado detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La innovación principal es la compilación a MLC q4f16_1 para ejecución en WebGPU, que habilita inferencia en el navegador.

## Capacidades

- Parsing de lenguaje natural a estructura lógica NL-2-SPARQL: transforma una pregunta sobre una nube de puntos 3D y su ontología en las listas L1..L5.
- Salida estrictamente estructurada: responde únicamente con el parsing, sin texto conversacional adicional, según el system prompt de entrenamiento.
- Comprensión de relaciones implícitas en las preguntas, gracias a las 1.385 muestras de entrenamiento con relaciones implícitas.
- Ejecución en WebGPU mediante MLC, lo que permite desplegarlo en el navegador del cliente.
- Modo de razonamiento desactivado (`enable_thinking=False`) para respuestas directas y de baja latencia.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Consulta de escenas 3D en el navegador: el modelo se ejecuta vía WebGPU y convierte la pregunta del usuario en las listas L1..L5, que la librería NL-2-SPARQL traduce a SPARQL contra la ontología de la nube de puntos, sin necesidad de backend.
- Demo online de 3DGraphExplorer: integrado en el repositorio MLC, sirve como motor de parsing del demo público del proyecto.
- Exploración de ontologías 3D por usuarios no técnicos: permite que un usuario formule preguntas en inglés sobre objetos, relaciones espaciales y atributos de una escena sin conocer SPARQL.
- Prototipado de interfaces de consulta sobre grafos de conocimiento: al ser un componente pequeño (2B) y con licencia Apache 2.0, se puede integrar en prototipos de investigación sobre consulta semántica de datos 3D.
- Despliegue en Apple Silicon: la variante MLX 4-bit del repositorio hermano permite ejecutar el parser localmente en Mac para flujos de trabajo de 3DGraphExplorer.
- Pipeline de generación de consultas en aplicaciones de visión 3D: el modelo actúa como etapa de parsing previa a la generación de SPARQL, separando la comprensión del lenguaje de la construcción de la consulta.
- Evaluación de ajuste fino con LoRA en tareas estructuradas: sirve como referencia para estudiar hasta qué punto un modelo de 2B con LoRA de rango 16 y 1 época puede resolver un parsing de ontología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio MLC q4f16_1 ocupa 1,1 GB, por lo que la huella de memoria en ejecución es del orden de 1-2 GB.
- GPU recomendadas: no disponibles; al estar compilado para WebGPU, funciona sobre cualquier GPU compatible con WebGPU en el navegador.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna con soporte WebGPU; la variante MLX 4-bit está pensada para Apple Silicon.
- Opciones de despliegue: MLC (WebGPU), MLX (Apple Silicon, variante 4-bit) y formato Hugging Face (repositorio `3DOMFBK/3dont-nl2sparql-small`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 3dont-nl2sparql-small-MLC | 2B | No disponible | NL a listas L1..L5 para SPARQL | Apache 2.0 | Hugging Face (MLC, MLX, HF) |
| Qwen/Qwen3.5-2B (base) | 2B | No disponible | Generación general | No disponible en la información | Hugging Face |
| Alternativas NL-2-SPARQL de propósito general | No disponible | No disponible | NL a SPARQL | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (parsing NL-2-SPARQL sobre ontologías 3D).

## Limitaciones y advertencias

- Modelo de nicho: solo funciona correctamente con el system prompt y el esquema de ontología de 3DOnt; fuera de ese dominio su salida no es fiable.
- Solo inglés: no soporta consultas en castellano ni en otros idiomas.
- Riesgo de alucinación en la estructura de salida: al generar listas L1..L5, puede producir estructuras inválidas o inconsistentes con la ontología si la pregunta se aleja de la distribución de entrenamiento.
- Entrenamiento limitado: LoRA de rango 16 y 1 época sobre un dataset acotado; la cobertura de relaciones implícitas se basa en 1.385 muestras.
- Sin datos de benchmarks: no hay evidencia publicada de precisión en parsing ni comparación con alternativas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.5-2B y del dataset de entrenamiento.
- Contexto máximo no documentado: se desconoce la longitud máxima de pregunta que admite.
- Fecha de creación futura en los metadatos (2026-11-17): conviene verificar la vigencia y el mantenimiento del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3DOMFBK/3dont-nl2sparql-small-MLC
- Repositorio formato Hugging Face: `3DOMFBK/3dont-nl2sparql-small`
- Repositorio MLX 4-bit (Apple Silicon): `3DOMFBK/3dont-nl2sparql-small-mlx`
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Demo online: referenciado en la model card como demo de WebGPU del repositorio MLC (URL no disponible)
- Paper, blog o repositorio de 3DGraphExplorer: no disponible en la información proporcionada
