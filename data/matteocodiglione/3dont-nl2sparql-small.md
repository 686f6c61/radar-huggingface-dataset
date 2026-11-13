# MatteoCodiglione/3dont-nl2sparql-small

## Resumen

3dont-nl2sparql-small es un ajuste fino (LoRA) del modelo base Qwen/Qwen3.5-2B, desarrollado por MatteoCodiglione, especializado en la traducción de lenguaje natural a SPARQL dentro del dominio del proyecto 3DOnt. Concretamente, el modelo no genera consultas SPARQL directamente, sino que parsea una pregunta en lenguaje natural sobre una nube de puntos 3D y su ontología, produciendo las cinco listas (L1..L5) que la librería NL-2-SPARQL de 3DGraphExplorer transforma posteriormente en SPARQL. Resuelve el problema de mapear preguntas de usuario a estructuras lógicas intermedias sobre una ontología concreta, separando el parseo semántico de la generación de la consulta.

El modelo tiene 2.274.069.824 parámetros (aproximadamente 2B) y se distribuye en formato safetensors con licencia Apache 2.0. El repositorio ocupa 4,6 GB. Está entrenado únicamente en inglés y su uso previsto es muy específico: integración en el pipeline de 3DGraphExplorer para consultas sobre datos de nubes de puntos 3D.

Su relevancia actual radica en que demuestra un patrón de especialización estrecha sobre un modelo pequeño: en lugar de pedir a un LLM general que emita SPARQL, se le entrena para emitir una representación intermedia estructurada que una librería determinista convierte en consulta. Esto reduce el espacio de salida y facilita la validación. Existen variantes complementarias publicadas por el mismo autor en formato MLX 4-bit (para Apple Silicon) y MLC (WebGPU q4f16_1, con demo online).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B) con adaptador LoRA (rango 16) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (pesos completos); variantes publicadas en MLX 4-bit y MLC q4f16_1 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; variantes MLX y MLC |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de aproximadamente 2B parámetros, y se ajusta mediante LoRA de rango 16 durante 1 epoch sobre el dataset NL-2-SPARQL de 3DOnt. Ese dataset combina las preguntas originales del proyecto, nuevas estructuras lógicas generadas y alrededor de 10.000 preguntas escritas a mano. El objetivo de entrenamiento es el parseo de una pregunta en lenguaje natural a las cinco listas L1..L5 que consume la librería NL-2-SPARQL.

El entrenamiento emplea un system prompt fijo (`You will receive a natural language query by the user. you just have to parse it. do not say anything else.`) y la plantilla de chat del modelo base con el modo de razonamiento desactivado (`enable_thinking=False`). No se documentan en la información disponible detalles sobre composición exacta del dataset, número de tokens de entrenamiento ni uso de RLHF o DPO. La innovación principal no es arquitectónica sino de diseño del pipeline: sustituir la generación directa de SPARQL por una representación intermedia estructurada y verificable.

## Capacidades

- Parseo de lenguaje natural a estructuras lógicas intermedias (listas L1..L5) para el dominio 3DOnt.
- Traducción de preguntas sobre nubes de puntos 3D y su ontología al formato que consume la librería NL-2-SPARQL de 3DGraphExplorer.
- Salida estrictamente limitada al parseo: el modelo está entrenado para no responder con texto adicional.
- Funcionamiento con el modo de razonamiento (thinking) desactivado de la plantilla de chat del modelo base.
- Capacidad multilingüe: no disponible; entrenado y evaluado en inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o thinking mode: no disponibles.

## Casos de uso

- Consulta de ontologías 3D en 3DGraphExplorer: el modelo recibe la pregunta del usuario y devuelve las listas L1..L5, que la librería NL-2-SPARQL convierte en SPARQL ejecutable contra el grafo de la nube de puntos.
- Interfaz de búsqueda sobre datos de nubes de puntos: un usuario formula preguntas en inglés sobre objetos, relaciones o propiedades de la escena y el modelo las estructura para su consulta.
- Despliegue en Apple Silicon: la variante MLX 4-bit permite ejecutar el parseo en local dentro de 3DGraphExplorer en equipos Mac, sin depender de servicios externos.
- Demo web sin backend GPU: la variante MLC con WebGPU q4f16_1 permite ofrecer un demo online del parseo NL-2-SPARQL directamente en el navegador.
- Validación determinista de consultas: al separar el parseo de la generación de SPARQL, la salida estructurada puede validarse contra el esquema de la ontología antes de construir la consulta final.
- Componente de un pipeline de investigación en grafos 3D: integración del parseo como etapa previa en flujos de extracción de información de escenas 3D representadas como grafos.
- Prototipado de asistentes de consulta sobre ontologías: al ser un modelo de 2B con licencia Apache 2.0, sirve como base para experimentar con otros dominios ontológicos aplicando el mismo esquema de parseo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 4,5-5 GB solo para pesos, más memoria para el contexto y el runtime.
- VRAM estimada en cuantización 4-bit (variante MLX): del orden de 1,5-2 GB para pesos, más overhead del runtime.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, el modelo cabe en GPUs de consumo con al menos 8 GB de VRAM en fp16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores con 8 GB o más; la variante MLX está pensada para Apple Silicon.
- Opciones de despliegue: Hugging Face transformers (formato safetensors), MLX 4-bit (Apple Silicon) y MLC con WebGPU q4f16_1 (navegador). Otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 3dont-nl2sparql-small | 2,27B | no disponible | NL-2-SPARQL para 3DOnt | apache-2.0 | Hugging Face, MLX, MLC |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible | LLM general | no disponible en la informacion | Hugging Face |
| Modelos generales NL-2-SPARQL | no disponible | no disponible | Traduccion NL a SPARQL generica | no disponible | no disponible |

La comparación directa con otros modelos especializados en NL-2-SPARQL no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es la especialización mediante LoRA en el dominio 3DOnt y la restricción de salida a las listas L1..L5.

## Limitaciones y advertencias

- Dominio muy restringido: solo está entrenado para preguntas sobre nubes de puntos 3D y la ontología de 3DOnt; fuera de ese ámbito su comportamiento no está garantizado.
- Idioma: únicamente inglés; no se documenta soporte para castellano ni otros idiomas.
- Salida no es SPARQL: el modelo produce las listas L1..L5, por lo que requiere la librería NL-2-SPARQL de 3DGraphExplorer para obtener una consulta ejecutable.
- Dependencia del system prompt y de la plantilla de chat del modelo base con thinking desactivado; alterar estos elementos puede degradar el parseo.
- Riesgo de alucinación en la estructura de salida: al ser un modelo generativo, puede producir listas mal formadas o inconsistentes con la ontología, por lo que conviene validar la salida antes de construir la consulta.
- Sesgos: no se documentan sesgos específicos en la información disponible; al derivar de un LLM general, puede heredar los del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base Qwen/Qwen3.5-2B.
- Sin datos de benchmarks ni de rendimiento en producción; el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-small
- Variante MLX 4-bit: https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-small-mlx
- Variante MLC (WebGPU q4f16_1): https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-small-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper, blog, repositorio de código o demo adicionales: no disponibles en la información proporcionada.
