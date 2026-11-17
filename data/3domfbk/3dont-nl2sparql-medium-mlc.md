# 3DOMFBK/3dont-nl2sparql-medium-MLC

## Resumen

3DOnt NL-2-SPARQL parser — medium es un ajuste fino (LoRA) del modelo base Qwen/Qwen3.5-4B, desarrollado por 3DOMFBK, especializado en la traducción de preguntas en lenguaje natural sobre nubes de puntos 3D y su ontología a las cinco listas (L1 a L5) que la librería NL-2-SPARQL de 3DGraphExplorer convierte en consultas SPARQL. No es un modelo de propósito general, sino un componente de un pipeline concreto: el usuario formula una pregunta sobre la ontología de una nube de puntos y el modelo la parsea en una estructura intermedia que después se transforma en SPARQL.

La relevancia del modelo radica en su especialización y en su formato de despliegue: se distribuye en formato MLC (q4f16_1) para ejecución en WebGPU, lo que permite ejecutar el parser directamente en el navegador sin infraestructura de servidor, con un repositorio de 2,4 GB. Esto lo hace adecuado para demos interactivas y herramientas de exploración de datos 3D en cliente. El entrenamiento se realizó con LoRA de rango 16 durante 1 época sobre un conjunto de datos que combina preguntas originales, estructuras lógicas nuevas generadas, aproximadamente 10.000 preguntas escritas a mano y 1.385 preguntas con relaciones implícitas.

El modelo base Qwen3.5-4B aporta la capacidad lingüística subyacente, mientras que el ajuste LoRA restringe la salida al formato estructurado esperado por la librería. La licencia Apache 2.0 facilita su integración en proyectos comerciales y académicos. El soporte de idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-4B) con adaptador LoRA de rango 16 |
| Parámetros totales | 4B (modelo base); parámetros del adaptador LoRA no disponibles |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | q4f16_1 (MLC); MLX 4-bit en repositorio separado |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (q4f16_1); repositorios separados en formato Hugging Face y MLX 4-bit |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer de 4.000 millones de parámetros, mediante un ajuste fino con LoRA de rango 16 durante 1 época. El conjunto de entrenamiento es el dataset NL-2-SPARQL de 3DOnt, compuesto por preguntas originales, nuevas estructuras lógicas generadas, aproximadamente 10.000 preguntas escritas a mano y 1.385 preguntas escritas a mano que incluyen relaciones implícitas. La tarea de entrenamiento es de parsing estructurado: dada una pregunta en lenguaje natural sobre una nube de puntos 3D y su ontología, el modelo debe emitir las cinco listas L1..L5 que la librería NL-2-SPARQL transforma en SPARQL.

El prompt de sistema utilizado en entrenamiento es fijo: `You will receive a natural language query by the user. you just have to parse it. do not say anything else.` Se emplea la plantilla de chat del modelo base con el modo de razonamiento desactivado (`enable_thinking=False`). No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO. La innovación principal no está en la arquitectura, sino en el empaquetado: la versión MLC q4f16_1 permite inferencia en WebGPU dentro del navegador, y existe una variante MLX 4-bit para Apple Silicon orientada a 3DGraphExplorer.

## Capacidades

- Parsing de lenguaje natural a estructura intermedia: convierte preguntas en inglés sobre nubes de puntos 3D y su ontología en las cinco listas L1..L5 consumidas por la librería NL-2-SPARQL.
- Generación de consultas SPARQL indirecta: la salida estructurada se transforma en SPARQL mediante la librería de 3DGraphExplorer.
- Manejo de relaciones implícitas: el entrenamiento incluye 1.385 preguntas escritas a mano con relaciones implícitas.
- Salida restringida: el prompt de sistema fuerza al modelo a emitir únicamente el parseo, sin texto adicional.
- Ejecución en navegador: la variante MLC q4f16_1 está preparada para WebGPU.
- Ejecución en Apple Silicon: la variante MLX 4-bit está orientada a 3DGraphExplorer en macOS.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Exploración interactiva de nubes de puntos 3D en el navegador: el modelo se ejecuta vía WebGPU con la cuantización q4f16_1 y permite que un usuario formule preguntas en inglés sobre la ontología de una nube de puntos sin enviar datos a un servidor.
- Demo pública de NL-2-SPARQL: el repositorio MLC está pensado como demo en línea, de modo que el parser puede incrustarse en una página web para mostrar la traducción de preguntas a SPARQL en tiempo real.
- Herramienta de escritorio en Apple Silicon: la variante MLX 4-bit se integra en 3DGraphExplorer para consultas locales sobre ontologías 3D en macOS, aprovechando la GPU unificada.
- Generación asistida de consultas SPARQL para investigadores: un investigador describe en inglés lo que quiere consultar sobre la ontología de una nube de puntos y el modelo produce la estructura que la librería convierte en SPARQL, reduciendo la necesidad de conocer la sintaxis.
- Integración en pipelines de anotación o catalogación de datos 3D: el parser puede formar parte de un flujo que recibe preguntas de analistas y las traduce a consultas ejecutables contra el grafo de ontología.
- Prototipado rápido de interfaces de consulta: al ejecutarse en cliente, permite validar interfaces de pregunta-respuesta sobre ontologías 3D sin desplegar infraestructura de inferencia.
- Educación y demostraciones técnicas: sirve para ilustrar el flujo NL → estructura → SPARQL en cursos o talleres sobre ontologías y datos 3D, con despliegue ligero en navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio MLC q4f16_1 ocupa 2,4 GB, lo que da una referencia del tamaño de los pesos cuantizados.
- GPU recomendadas: no disponible. La variante MLC está orientada a WebGPU, por lo que requiere un navegador con soporte de WebGPU y una GPU compatible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño de 2,4 GB sugiere que podría caber en GPU de consumo con suficiente memoria, pero no se aportan datos de prueba.
- Opciones de despliegue: MLC (WebGPU, q4f16_1) para navegador; MLX 4-bit para Apple Silicon; formato Hugging Face disponible en el repositorio `3DOMFBK/3dont-nl2sparql-medium`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| 3DOnt NL-2-SPARQL medium (este modelo) | 4B (base) + LoRA r16 | No disponible | NL → listas L1..L5 para SPARQL sobre ontología 3D | Apache 2.0 | MLC q4f16_1, MLX 4-bit, HF |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible | Propósito general | No disponible en la información | HF |
| Modelos NL-2-SPARQL de otros tamaños de 3DOnt | No disponible | No disponible | Misma tarea | No disponible | No disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha entrenado ni validado para otros idiomas.
- Está especializado en una única tarea: parsear preguntas sobre la ontología de 3DOnt en las listas L1..L5. No es adecuado para generación de texto general, código, matemáticas ni otras tareas.
- La salida depende del prompt de sistema exacto usado en entrenamiento; desviarse de él puede degradar el formato de salida.
- El modo de razonamiento debe estar desactivado (`enable_thinking=False`); activarlo puede alterar el comportamiento esperado.
- Riesgo de alucinación en la estructura de salida: al ser un modelo generativo, puede producir listas L1..L5 mal formadas o inconsistentes con la ontología, lo que requiere validación posterior por la librería NL-2-SPARQL.
- No se han publicado evaluaciones cuantitativas de precisión del parsing, por lo que el rendimiento real en producción es desconocido.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-4B tiene sus propias condiciones que deben verificarse por separado.
- El tamaño del repositorio (2,4 GB) y la dependencia de WebGPU limitan su despliegue a entornos con navegadores y GPU compatibles.

## Enlaces

- Modelo en Hugging Face (MLC): https://huggingface.co/3DOMFBK/3dont-nl2sparql-medium-MLC
- Repositorio en formato Hugging Face: `3DOMFBK/3dont-nl2sparql-medium`
- Repositorio MLX 4-bit: `3DOMFBK/3dont-nl2sparql-medium-mlx`
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
