# 3DOMFBK/3dont-nl2sparql-small-mlx

## Resumen

3DOnt NL-2-SPARQL small (MLX 4-bit) es un ajuste fino por LoRA del modelo base Qwen/Qwen3.5-2B, desarrollado por 3DOMFBK, cuyo objetivo es convertir preguntas en lenguaje natural sobre nubes de puntos 3D y su ontología en las cinco listas (L1 a L5) que la librería NL-2-SPARQL de 3DGraphExplorer transforma en consultas SPARQL. El modelo no genera SPARQL directamente: actúa como un parser intermedio que estructura la pregunta en componentes lógicos que el motor posterior traduce a consultas sobre el grafo de conocimiento.

El ajuste se realizó con LoRA de rango 16 durante una época sobre el dataset NL-2-SPARQL de 3DOnt, que combina preguntas originales, estructuras lógicas nuevas generadas, aproximadamente 10.000 preguntas escritas a mano y 1.385 preguntas adicionales con relaciones implícitas. El resultado es un modelo de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) con pesos en safetensors y una variante cuantizada a 4 bits en formato MLX, orientada a ejecución local en Apple Silicon dentro de la aplicación 3DGraphExplorer.

Su relevancia es acotada pero específica: cubre la tarea de interfaz en lenguaje natural para grafos de conocimiento de dominios 3D, un nicho donde los modelos generalistas suelen fallar por la necesidad de producir estructuras estrictas y consistentes con una ontología concreta. La licencia Apache 2.0 y el tamaño reducido facilitan su integración en herramientas de escritorio y demos web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-2B) con adaptador LoRA de rango 16 |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (variante publicada); pesos base en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; variante MLX 4-bit; variante MLC WebGPU q4f16_1 en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only de aproximadamente 1,88 mil millones de parámetros, y se ajusta mediante LoRA de rango 16 durante una sola época. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de la descripción del corpus NL-2-SPARQL de 3DOnt: preguntas originales, estructuras lógicas nuevas generadas, cerca de 10.000 preguntas escritas a mano y 1.385 preguntas con relaciones implícitas. No se indica si se aplicaron técnicas de RLHF o DPO.

La innovación principal no está en la arquitectura, sino en la formulación de la tarea: el modelo se entrena para emitir únicamente las cinco listas L1..L5 que alimentan la librería NL-2-SPARQL, con un system prompt fijo ("You will receive a natural language query by the user. you just have to parse it. do not say anything else.") y la plantilla de chat del modelo base con el modo de razonamiento desactivado (`enable_thinking=False`). Esta restricción busca salidas deterministas y parseables, delegando la generación de SPARQL al motor de 3DGraphExplorer.

## Capacidades

- Análisis (parsing) de preguntas en lenguaje natural sobre nubes de puntos 3D y su ontología, produciendo las listas L1..L5 consumidas por la librería NL-2-SPARQL.
- Generación de estructuras lógicas intermedias en lugar de SPARQL final, lo que reduce errores de sintaxis en la consulta generada.
- Manejo de preguntas con relaciones implícitas, gracias a las 1.385 muestras específicas incluidas en el entrenamiento.
- Salida restringida y concisa: el modelo está entrenado para no añadir texto conversacional adicional.
- Ejecución local en Apple Silicon mediante la variante MLX 4-bit.
- Despliegue web mediante la variante MLC WebGPU q4f16_1 (repositorio separado).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión, audio o thinking mode: no disponibles.

## Casos de uso

- Interfaz de consulta en 3DGraphExplorer: el modelo recibe la pregunta del usuario sobre una nube de puntos y devuelve las listas L1..L5 que la librería NL-2-SPARQL convierte en SPARQL, habilitando búsquedas sobre el grafo de conocimiento sin que el usuario escriba consultas.
- Exploración de ontologías 3D en escritorio: integrado en la aplicación 3DGraphExplorer para Apple Silicon mediante la variante MLX 4-bit, permite consultas locales sin conexión a servicios en la nube.
- Demo web interactiva: la variante MLC WebGPU q4f16_1 permite ejecutar el parser en el navegador, útil para demostraciones públicas del flujo pregunta natural a consulta SPARQL.
- Prototipado de asistentes para grafos de conocimiento de dominio: sirve como componente de parsing en pipelines donde el motor SPARQL es fijo y solo varía la capa de lenguaje natural.
- Investigación en NL-2-SPARQL: al ser un ajuste pequeño y reproducible sobre Qwen3.5-2B, facilita experimentos de comparación con otros tamaños o estrategias de prompting.
- Filtrado y validación de preguntas: el modelo puede usarse para estructurar preguntas de un corpus antes de pasarlas a un motor de consulta, detectando formulaciones que no encajan en la ontología.
- Integración en herramientas de anotación: ayuda a convertir descripciones libres de escenas 3D en estructuras consultables para tareas de catalogación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la variante MLX 4-bit ocupa aproximadamente 1,1 GB en disco (tamaño del repositorio), por lo que la huella en memoria es del orden de 1-2 GB.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y posteriores) para la variante MLX; GPUs compatibles con WebGPU para la variante MLC q4f16_1.
- Cabe en GPU de consumo: sí, en cualquier equipo Apple Silicon con memoria unificada suficiente; también en GPUs de consumo mediante la variante MLC.
- Opciones de despliegue: MLX (Apple Silicon), MLC (WebGPU). No se indica soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 3DOnt NL-2-SPARQL small (MLX 4-bit) | ~1,88 B | no disponible | NL a listas L1..L5 para SPARQL en ontologías 3D | apache-2.0 | Hugging Face (safetensors, MLX, MLC) |
| Qwen/Qwen3.5-2B (base) | ~1,88 B | no disponible | Generación general | no disponible en la información proporcionada | Hugging Face |
| Modelos NL-2-SPARQL genéricos | no disponible | no disponible | NL a SPARQL directo | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo está entrenado para inglés; las preguntas en otros idiomas pueden producir estructuras L1..L5 incorrectas.
- Está especializado en la ontología y el esquema de 3DOnt; fuera de ese dominio su utilidad es muy limitada.
- No genera SPARQL directamente: requiere la librería NL-2-SPARQL de 3DGraphExplorer para completar el flujo.
- Riesgo de alucinación en la estructura de salida: al ser un ajuste de una época con LoRA, puede producir listas mal formadas ante preguntas ambiguas o fuera de distribución.
- El tamaño reducido (2B) limita el razonamiento sobre relaciones complejas o preguntas de varios saltos.
- No se documentan sesgos específicos, pero al derivar de Qwen3.5-2B hereda los sesgos del corpus del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías sobre la corrección de las consultas generadas en producción.
- No hay información sobre latencia, throughput ni contexto máximo, lo que dificulta planificar despliegues de alta concurrencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria publicada.

## Enlaces

- Hugging Face: https://huggingface.co/3DOMFBK/3dont-nl2sparql-small-mlx
- Repositorio en formato Hugging Face: 3DOMFBK/3dont-nl2sparql-small
- Repositorio MLC WebGPU q4f16_1: 3DOMFBK/3dont-nl2sparql-small-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
