# MatteoCodiglione/3dont-nl2sparql-small-mlx

## Resumen

3dont-nl2sparql-small-mlx es un ajuste fino (LoRA, rango 16, 1 época) del modelo base Qwen/Qwen3.5-2B, desarrollado por MatteoCodiglione, orientado a una tarea muy concreta: convertir preguntas en lenguaje natural sobre nubes de puntos 3D y su ontología en las cinco listas (L1..L5) que la librería NL-2-SPARQL de 3DGraphExplorer transforma en consultas SPARQL. No es un modelo de propósito general, sino un parser especializado que actúa como primera etapa de un pipeline de consulta semántica sobre grafos de conocimiento 3D.

El modelo se distribuye en formato MLX cuantizado a 4 bits, pensado para ejecución en Apple Silicon dentro del ecosistema 3DGraphExplorer. Cuenta con 1.881.825.088 parámetros reales en safetensors y un repositorio de 1,1 GB, lo que lo hace viable en equipos de sobremesa y portátiles con memoria unificada. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

Su relevancia actual radica en la combinación de un modelo pequeño (2B) con una tarea de parsing estructurado muy delimitada: en lugar de generar SPARQL directamente, produce una representación intermedia en cinco listas que la librería downstream ensambla en la consulta final. Este diseño reduce la superficie de error del modelo y facilita la validación de la salida antes de tocar el grafo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), ajuste fino con LoRA rango 16 |
| Parámetros totales | 1.881.825.088 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX 4-bit (esta variante); el autor publica también formato Hugging Face y MLC WebGPU q4f16_1 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 4-bit); variantes en Hugging Face y MLC |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only, y se ajusta mediante LoRA de rango 16 durante 1 época sobre el dataset NL-2-SPARQL de 3DOnt. Ese dataset combina las preguntas originales del proyecto, nuevas estructuras lógicas generadas y aproximadamente 10.000 preguntas escritas a mano. El objetivo de entrenamiento es el parsing de la pregunta a las cinco listas L1..L5 que consume la librería NL-2-SPARQL de 3DGraphExplorer.

El entrenamiento emplea el system prompt `You will receive a natural language query by the user. you just have to parse it. do not say anything else.` y la plantilla de chat del modelo base con el modo thinking desactivado (`enable_thinking=False`). No se documentan en la información disponible detalles sobre volumen total de tokens, composición exacta del dataset ni uso de RLHF o DPO; el ajuste es supervisado sobre pares pregunta-estructura lógica.

## Capacidades

- Parsing de lenguaje natural a estructura intermedia: transforma una pregunta sobre una nube de puntos 3D y su ontología en las cinco listas L1..L5.
- Generación de representación lista para SPARQL: la salida se integra en la librería NL-2-SPARQL de 3DGraphExplorer para producir la consulta final.
- Salida restringida: el system prompt de entrenamiento fuerza al modelo a responder solo con el parsing, sin texto adicional.
- Ejecución en Apple Silicon: la variante MLX 4-bit está pensada para correr localmente en hardware de Apple.
- Modo thinking desactivado: el modelo opera sin cadena de razonamiento explícita, lo que reduce latencia y longitud de salida.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling, function calling, agentes y multi-step reasoning: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles; el modelo trabaja sobre texto, aunque el dominio sea geometría 3D.

## Casos de uso

- Consulta semántica sobre nubes de puntos 3D: un usuario formula en inglés una pregunta sobre los objetos y relaciones de una escena 3D y el modelo la convierte en las listas L1..L5 que la librería NL-2-SPARQL transforma en SPARQL contra la ontología de 3DGraphExplorer.
- Integración en 3DGraphExplorer sobre Apple Silicon: la variante MLX 4-bit permite desplegar el parser localmente en un Mac dentro de la aplicación de exploración de grafos 3D, sin depender de servicios en la nube.
- Demo web con WebGPU: la variante MLC q4f16_1 publicada por el autor habilita una demostración en navegador, útil para validar el pipeline de parsing antes de integrarlo en producción.
- Generación asistida de consultas para investigadores: investigadores que trabajan con ontologías de escenas 3D pueden escribir preguntas en lenguaje natural en lugar de SPARQL manual, reduciendo la curva de aprendizaje del grafo.
- Validación y depuración de ontologías: al producir una estructura intermedia en cinco listas, el equipo puede inspeccionar y corregir el parsing antes de ejecutar la consulta, lo que facilita detectar huecos o ambigüedades en la ontología.
- Prototipado rápido de interfaces de consulta: al ser un modelo de 2B en 4 bits, se puede iterar sobre el diseño de la interfaz de preguntas sin incurrir en costes de inferencia elevados.
- Pipeline de evaluación de calidad del parsing: las salidas estructuradas permiten comparar automáticamente el resultado del modelo con anotaciones de referencia y medir la tasa de acierto por lista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio MLX 4-bit ocupa 1,1 GB, por lo que la inferencia requiere del orden de 1,5-2 GB de memoria considerando overhead de runtime; no se dispone de cifras oficiales del autor.
- GPU recomendadas: hardware Apple Silicon con memoria unificada (familias M1, M2, M3 y M4) para la variante MLX; la variante MLC q4f16_1 está pensada para WebGPU en navegador.
- GPU consumer: por tamaño, cabe en cualquier GPU consumer con al menos 4 GB de VRAM si se convierte a otros formatos, aunque la información disponible solo documenta las variantes MLX y MLC.
- Opciones de despliegue: MLX (Apple Silicon), MLC con WebGPU (demo online) y formato Hugging Face estándar para otros runtimes; no se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| 3dont-nl2sparql-small-mlx | 1,88 B | no disponible | NL a listas L1..L5 para SPARQL en ontologías 3D | Apache 2.0 | safetensors MLX 4-bit |
| Qwen/Qwen3.5-2B (base) | ~2 B | no disponible | Propósito general | no disponible en la información | safetensors |
| 3dont-nl2sparql-small (HF) | 1,88 B | no disponible | Misma tarea, formato Hugging Face | Apache 2.0 | safetensors |
| 3dont-nl2sparql-small-MLC | 1,88 B | no disponible | Misma tarea, WebGPU q4f16_1 | Apache 2.0 | MLC |

La comparación relevante es con el modelo base y con las otras dos variantes del mismo ajuste publicadas por el autor; no se dispone de información sobre modelos de terceros especializados en NL-2-SPARQL para ontologías 3D.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo está entrenado para el parsing NL-2-SPARQL de 3DOnt; fuera de esa tarea su comportamiento no está garantizado.
- Idioma: únicamente inglés según la model card; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación estructural: al generar listas L1..L5, puede producir entradas inventadas o mal formadas si la pregunta se sale de la distribución del dataset de entrenamiento.
- Dependencia del pipeline: la salida solo es útil si se procesa con la librería NL-2-SPARQL de 3DGraphExplorer; no genera SPARQL directamente.
- Entrenamiento corto: 1 época con LoRA de rango 16; no se documentan métricas de evaluación ni curvas de validación.
- Sin datos de benchmarks: no hay cifras públicas de precisión, recall ni exactitud del parsing.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base Qwen3.5-2B, no incluida en la información disponible.
- Formato MLX: la variante de este repositorio requiere runtime MLX; para otros entornos hay que usar las variantes Hugging Face o MLC del mismo autor.
- Advertencia de producción: al no haber benchmarks ni métricas de robustez, se recomienda validar el parsing contra un conjunto de referencia antes de desplegarlo en un sistema real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-small-mlx
- Variante Hugging Face: https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-small
- Variante MLC WebGPU: https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-small-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Proyecto 3DGraphExplorer: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
