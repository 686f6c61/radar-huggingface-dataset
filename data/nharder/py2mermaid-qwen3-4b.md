# nharder/py2mermaid-qwen3-4b

## Resumen

py2mermaid-qwen3-4b (v3) es un modelo especializado creado por el desarrollador nharder a partir de Qwen3-4B-Instruct-2507, ajustado mediante LoRA para una única tarea: convertir código fuente Python en un diagrama de grafo de llamadas en sintaxis Mermaid (`flowchart TD`), incluyendo código que no parsea correctamente. El modelo acepta uno o varios ficheros Python precedidos de una línea `# FILE: <path>` y devuelve exclusivamente el diagrama Mermaid, sin comentarios, prose ni etiquetas `<think>`.

El problema que aborda es la documentación automática de arquitectura de código, especialmente en escenarios donde las herramientas deterministas fallan: ficheros con indentación perdida, marcas de conflictos de merge o números de línea pegados. En código que parsea, el módulo `ast` de Python calcula el mismo diagrama de forma exacta, por lo que el valor del modelo está en el código roto.

Un aspecto notable del proyecto es su honestidad metodológica: la propia model card reconoce que un router sin modelo basado en búsqueda de indentación verificada con `compile` supera al modelo solo (256 de 273 frente a 176), y que Claude Opus 5.5 alcanza 265 de 273. El modelo se publica bajo licencia Apache 2.0, pesa unos 4.022 millones de parámetros en formato safetensors y está entrenado en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (base Qwen3-4B-Instruct-2507) con adaptador LoRA fusionado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entradas probadas de hasta ~3.000 tokens) |
| Tipos de cuantizacion | Pesos publicados en bf16; entrenamiento realizado sobre copia 4-bit de la base |
| Idiomas soportados | Ingles (salida en sintaxis Mermaid) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16,1 GB el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer causal instruccional de 4.000 millones de parametros, al que se aplica un ajuste fino LoRA de rango 16, escala 2.0 y aplicado a todas las capas, entrenado con mlx-lm sobre una copia cuantizada a 4 bits del modelo base. Se usaron 2 epocas, batch de 2, learning rate de 1e-4 y prompt enmascarado (solo se entrena la respuesta). El adaptador se fusiono posteriormente en pesos bf16 completos, que son los publicados.

Los datos de entrenamiento proceden del dataset `nharder/py2mermaid-data` (version v3): 1.123 filas distintas ya validadas por una puerta determinista de la version v2, mas 572 copias "rotas" de esas filas, etiquetadas con `ast` sobre el codigo original pretendido. En total, 1.695 filas y los mismos pasos de entrenamiento que v2. El system prompt usado en entrenamiento es el prompt de producto (`diagram` 2.0.0), publicado como `system_prompt.txt`; el autor recomienda usarlo tal cual y decodificar de forma greedy (`do_sample=False`).

## Capacidades

- Generacion de diagramas Mermaid `flowchart TD` a partir de uno o varios ficheros Python, dibujando cada funcion publica una vez en el subgrafo de su modulo.
- Trazado de aristas de llamada entre funciones publicas, tanto directas como a traves de helpers privados (sin dibujar estos ultimos).
- Gestion de codigo Python que no parsea: reconstruye el diagrama que el codigo "pretendia" tener, incluyendo ficheros con indentacion perdida.
- Respuesta determinista `SKIP: NO_PUBLIC_CALLS` cuando ninguna funcion publica llama a otra.
- Robustez frente a inyecciones en comentarios o docstrings del codigo de entrada: ignora instrucciones ajenas al contrato.
- Adhesion a un contrato de comportamiento publico y verificable (Behavior Spec del proyecto).
- No es un modelo de proposito general: no esta pensado para conversacion, razonamiento general ni otras tareas.

## Casos de uso

- Documentacion automatica de bases de codigo legado: generar grafos de llamadas de modulos Python antiguos cuya sintaxis ya no es valida, algo imposible con herramientas basadas en `ast` o `tree-sitter` sin recuperacion de errores.
- Analisis de codigo roto en repositorios: ficheros con marcas de conflictos de merge, numeros de linea pegados o indentacion perdida tras copiar y pegar, donde el modelo supera a los parsers con recuperacion de errores.
- Integracion en pipelines de CI/CD para generar documentacion visual: el modelo puede ejecutarse como paso de build que produce diagramas Mermaid renderizables en GitLab, GitHub o MkDocs.
- Auditoria de arquitectura: visualizar dependencias entre funciones publicas de un paquete antes de una refactorizacion, para estimar el impacto de cambios.
- Comparacion de forks o ramas: generar diagramas de dos versiones de un modulo y comparar la estructura de llamadas.
- Investigacion sobre SLMs especializados: el proyecto publica evals reproducibles, transcripciones crudas y un router sin modelo como linea base, lo que lo hace util como caso de estudio de destilacion y evaluacion rigurosa.

## Benchmarks y rendimiento

Evaluacion sobre 273 ficheros rotos sinteticos (construidos desde codigo held-out de click, httpx y attrs), graduados por una puerta determinista contra el diagrama de `ast` del codigo original:

| Answerer | Pasados (de 273) | Indentacion perdida (de 33) |
|---|---|---|
| Base Qwen3-4B-Instruct-2507 | 0 | 0 |
| tree-sitter (parser con recuperacion de errores) | 170 | 0 |
| tree-sitter + dos reglas | 223 | 0 |
| v2 (version anterior) | 173 | 17 |
| **v3, este modelo, solo** | **176** (seed 2: 170) | **23** (seed 2: 21) |
| Router con este modelo | 246 (seed 2: 244) | 23 |
| Router con re-indentador por reglas, sin modelo | 244 | 21 |
| Router con busqueda de indentacion verificada por `compile`, sin modelo | 256 | 33 |
| Claude Opus 5.5, tres ejemplos | 265 | 33 |

En los 40 escenarios bloqueados (25 limpios, 15 adversariales), el modelo solo pasa 16/25 y 11/15; ambos routers pasan 40/40. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), lo cual es coherente con su naturaleza de modelo de tarea unica.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: unos 8-9 GB solo para los pesos (4.022 millones de parametros a 2 bytes), mas overhead de KV cache; con cuantizacion a 4 bits, en torno a 2,5-3 GB (no hay pesos cuantizados publicados en el repositorio).
- GPU recomendadas: cualquier GPU consumer moderna con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090) para bf16; para CPU, el entrenamiento original uso MLX (Apple Silicon), por lo que la inferencia en Mac con mlx-lm es viable.
- Cabe holgadamente en GPUs consumer de gama media-alta; no requiere A100 ni H100.
- Opciones de despliegue: transformers (codigo de ejemplo en la model card), y dado que la base es Qwen3-4B, deberia ser compatible con vLLM, llama.cpp (tras conversion a GGUF, no publicada), Ollama y TGI; el entrenamiento se realizo con mlx-lm.
- Latencia y throughput: no disponibles. El autor especifica decodificacion greedy con `max_new_tokens=2048` en el ejemplo de uso.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Rendimiento en eval propia | Licencia |
|---|---|---|---|---|
| py2mermaid-qwen3-4b (v3) | 4.022 M | Python a Mermaid, solo | 176/273 ficheros rotos | Apache 2.0 |
| Base Qwen3-4B-Instruct-2507 | ~4.000 M | Proposito general | 0/273 (sin fine-tuning) | Apache 2.0 |
| py2mermaid v2 (version anterior) | ~4.000 M | Python a Mermaid, solo | 173/273 (17/33 en indentacion perdida) | Apache 2.0 |
| Claude Opus 5.5 (con tres ejemplos) | no disponible | Proposito general | 265/273 | Propietaria |

El propio proyecto recomienda, para produccion, un router sin modelo (`eval.py --model search-router`) que alcanza 256/273 sin coste de inferencia, reservando el modelo para los casos en que las reglas deterministicas no bastan.

## Limitaciones y advertencias

- Anade u omite aristas en aproximadamente un tercio de las entradas, tanto rotas como limpias; en codigo limpio no mejora a v2 (27/40 frente a 30 y 25 en las dos seeds de v2).
- Las copias rotas anadidas en v3 no aportaron mejora medible sobre v2 en global (30 frente a 27 ficheros emparejados, p = 0,79); en indentacion perdida, 23 frente a 17 (p = 0,07), sin significacion estadistica.
- El dano en los ficheros de evaluacion es sintetico (ediciones conocidas) para que las etiquetas sean exactas; ficheros rotos en entornos reales no han sido probados.
- Una llamada a traves de variable local (`writer = Writer(); writer.save()`) no cuenta como arista segun las reglas del proyecto, y el modelo las respeta.
- Solo soporta Python; las entradas deben mantenerse por debajo de unos 3.000 tokens.
- En codigo que parsea, `ast` de Python produce el diagrama exacto y el modelo no; usar el modelo en ese caso es innecesario y menos fiable.
- Riesgo de alucinacion estructural: el modelo puede inventar o perder llamadas, por lo que los diagramas generados no deben tratarse como documentacion canonica sin verificacion.
- No hay datos sobre sesgos lingüisticos o de contenido; al ser un modelo de tarea unica sobre codigo, el riesgo principal es estructural, no de contenido.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nharder/py2mermaid-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/nharder/py2mermaid-data
- Repositorio del proyecto (evals y documentacion): https://labs.gauntletai.com/nicholasharder/py2mermaid-slm
- Behavior Spec: https://labs.gauntletai.com/nicholasharder/py2mermaid-slm/-/blob/main/docs/BEHAVIOR_SPEC.md
- Informe sobre codigo roto: https://labs.gauntletai.com/nicholasharder/py2mermaid-slm/-/blob/main/docs/reports/broken-code.md
