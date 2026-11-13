# jstarks/Qwen3.8-27B-Weight-Space-Programming

## Resumen

Qwen3.8-27B-Weight-Space-Programming (WSP v2.4) es un adaptador de pesos publicado por el usuario jstarks sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo entrenado de forma convencional, sino de una intervención quirúrgica sobre los pesos del modelo base mediante una técnica denominada Weight-Space Programming (WSP): una síntesis en forma cerrada, sin descenso de gradiente ni fine-tuning, que edita directamente las matrices `mlp.down_proj` de determinadas capas para modular el comportamiento del modelo en tareas de agente, razonamiento y tool calling. Según la model card, la síntesis completa se realiza en 47 segundos en una única estación de trabajo.

El problema que aborda es un sesgo espectral detectado en las capas superiores de atención completa del modelo base: las principales direcciones singulares de `mlp.down_proj` muestran una alineación coseno entre un 28,1 % y un 45,0 % mayor con un subespacio de "duda/hesitación" (tokens como `Wait`, `Should`, `Maybe`, `verify`) que con el token de terminación `</think>`. Ese sesgo provoca bucles de deliberación que agotan el presupuesto de tokens y llamadas innecesarias a herramientas tras resolver una tarea. La propuesta edita los pesos para corregir ese sesgo sin reentrenar.

El resultado declarado es una mejora del 3,3 % en una batería combinada de 123 tareas (del 82,1 % al 85,4 %), equivalente a una reducción del 18,2 % de errores, combinando una edición estática de capas intermedias con un enrutamiento dinámico en capas tardías. El repositorio ocupa 1,1 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de pesos (WSP) sobre Qwen3.8-27B; el modelo base usa 16 bloques de [3× Gated DeltaNet + 1× Gated Full Attention], 64 capas, hidden_size 5120, intermediate_size 17408 |
| Parametros totales | 30.720 (según safetensors del repo del adaptador) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye tag `gguf`, sin detallar variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); tag `gguf` presente en el repo |

## Arquitectura y entrenamiento

El adaptador no entrena el modelo: aplica una cirugía de pesos en forma cerrada sobre las matrices `mlp.down_proj` de 13 capas editadas del modelo base Qwen3.8-27B. La técnica emplea el estado exacto del receptor SwiGLU, definido como la normalización unitaria de SiLU(W_gate·h) ⊙ (W_up·h), y una identidad de ridge anclada al espacio nulo denominada Woodbury Dual-Space. Con ella se invierte una matriz de Gram de 160×160 en lugar de una matriz densa de 17408×17408, lo que reduce el tiempo de síntesis unas 30 veces (de 1419,0 s a 30,8–47,7 s) y disminuye la fuga entre subespacios y hacia el espacio nulo hasta el 0,11 %–0,31 % en las 13 capas editadas.

La edición se organiza en dos componentes combinables. El primero es una edición estática de capas intermedias (capas 19–43, subespacio S4) con intensidad 0,65–0,85. El segundo es un enrutamiento dinámico en capas tardías (capas 47–63), con un router de latencia inferior a 0,1 ms. La ablación factorial 2×2 sobre 123 tareas muestra que la edición estática aislada degrada ligeramente el rendimiento (−1,6 %), mientras que el enrutamiento dinámico aislado mejora un 1,6 % y la combinación de ambos alcanza la mejora máxima del 3,3 %. No se especifican datos de entrenamiento, composición del dataset ni uso de RLHF o DPO, ya que no hay entrenamiento supervisado implicado.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, heredados del modelo base Qwen3.8-27B.
- Tool calling y function calling, con mejora específica en la restricción del uso de herramientas (Suite E: del 83,3 % al 100 %).
- Ejecución de comandos de shell y tareas de agente móvil (Suite A y Suite B al 100 %).
- Búsqueda y recuperación web dentro de flujos de agente.
- Razonamiento matemático multietapa (Suite C: 87,5 %; 100 % sobre tareas matemáticamente válidas).
- Comportamiento anti-sicofántico (Suite D al 100 %, con tasa de respuesta visible duplicada del 37,5 % al 75,0 %).
- Reducción de la verbosidad en deliberación: el caso `shell_1` pasa de 165 a 89 tokens (−46 %).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes autónomos con uso de herramientas: el enrutamiento dinámico en capas tardías reduce las llamadas innecesarias a `exec` tras resolver una tarea, lo que abarata y acelera pipelines de agente en producción.
- Automatización de operaciones con shell: la Suite A mantiene el 100 % de acierto y recorta un 46 % los tokens en tareas de ejecución de comandos, útil en asistentes de DevOps que traducen lenguaje natural a Bash.
- Asistentes de atención al cliente con restricción de herramientas: la mejora en tool restraint evita que el modelo invoque funciones de verificación cuando la respuesta ya es correcta, reduciendo latencia y coste por consulta.
- Razonamiento matemático en pipelines de validación: la Suite C alcanza el 100 % sobre tareas válidas, adecuado para asistentes de cálculo con verificación paso a paso.
- Investigación en interpretabilidad mecanística: el adaptador sirve como caso de estudio reproducible de edición de pesos guiada por análisis espectral, sin necesidad de GPUs de entrenamiento.
- Evaluación de robustez anti-sicofántica: la duplicación de la tasa de respuesta visible lo hace útil en sistemas donde el modelo debe mantener su criterio frente a presión del usuario.
- Despliegue ligero sobre el modelo base: al ser un adaptador de 1,1 GB con licencia Apache 2.0, puede combinarse con el modelo base en entornos con `transformers` sin reentrenamiento.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre 123 tareas, comparando cuatro condiciones de edición:

| Suite | Tareas | Base (None) | Dynamic Routing | Mid-Layer Edit | Ambos |
|---|---|---|---|---|---|
| Suite A: Shell Execution | 8 | 8/8 (100,0 %) | 8/8 (100,0 %) | 8/8 (100,0 %) | 8/8 (100,0 %) |
| Suite B: Web Search & Fetch | 8 | 8/8 (100,0 %) | 8/8 (100,0 %) | 8/8 (100,0 %) | 8/8 (100,0 %) |
| Suite C: Multi-Step Math | 8 | 7/8 (87,5 %) | 7/8 (87,5 %) | 6/8 (75,0 %) | 7/8 (87,5 %) |
| Suite D: Anti-Sycophancy | 8 | 8/8 (100,0 %) | 8/8 (100,0 %) | 8/8 (100,0 %) | 8/8 (100,0 %) |
| Suite E: Tool Restraint | 6 | 5/6 (83,3 %) | 6/6 (100,0 %) | 5/6 (83,3 %) | 6/6 (100,0 %) |
| Subtotal agente móvil | 38 | 36/38 (94,7 %) | 37/38 (97,4 %) | 35/38 (92,1 %) | 37/38 (97,4 %) |
| InterCode-NL2Bash | 20 | 10/20 (50,0 %) | 10/20 (50,0 %) | 10/20 (50,0 %) | 11/20 (55,0 %) |
| BFCL v3 Irrelevance | 15 | 14/15 (93,3 %) | 14/15 (93,3 %) | 14/15 (93,3 %) | 14/15 (93,3 %) |
| OpenAI GSM8K (Test) | 20 | 15/20 (75,0 %) | 16/20 (80,0 %) | 15/20 (75,0 %) | 16/20 (80,0 %) |
| TruthfulQA (Gen) | 15 | 15/15 (100,0 %) | 15/15 (100,0 %) | 15/15 (100,0 %) | 15/15 (100,0 %) |
| **Total combinado** | **123** | **101/123 (82,1 %)** | **103/123 (83,7 %)** | **99/123 (80,5 %)** | **105/123 (85,4 %)** |

La mejora máxima es de +3,3 puntos porcentuales (−18,2 % de errores) con la combinación de ambos componentes. La model card advierte de que el baseline se evaluó con esquema JSON normalizado (`"type": "float"` → `"number"` en BFCL v3 Irrelevance); sin normalizar, el baseline bruto es 102/123 (82,9 %).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada para el modelo combinado.
- El adaptador en sí ocupa 1,1 GB en el repositorio; el modelo base Qwen3.8-27B requiere memoria adicional no especificada.
- GPU recomendadas: no disponible. La síntesis del adaptador se realizó en una única estación de trabajo en 47 segundos, pero no se detalla el hardware.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `transformers` (librería declarada); el repo incluye tag `gguf`, lo que sugiere compatibilidad con llama.cpp/Ollama, aunque no se detallan las variantes.
- Latencia y throughput: el router dinámico tiene latencia inferior a 0,1 ms; no se publican cifras de throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Weight-Space-Programming | 30.720 (adaptador) | no disponible | Edición de pesos WSP sobre Qwen3.8-27B | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | no disponible en la información | no disponible | Modelo base sin editar | no disponible en la información | Hugging Face |
| Alternativas de edición tipo LoRA/control-vector | no disponible | no disponible | Ajuste paramétrico convencional | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros ni de modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks son internos del autor (123 tareas propias y suites establecidas), sin validación independiente; deben interpretarse con cautela.
- La edición estática de capas intermedias aislada degrada el rendimiento (−1,6 %), por lo que el adaptador solo es útil combinado con el enrutamiento dinámico.
- El baseline se midió con normalización de esquema JSON en BFCL v3; sin ella, la mejora relativa es menor (82,9 % frente a 85,4 %).
- Riesgo de alucinación: no evaluado de forma específica en la información disponible; TruthfulQA al 100 % en 15 tareas es una muestra reducida.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no especificados; no se puede garantizar comportamiento multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene su propia licencia que debe verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por la comunidad.
- La model card está truncada en la información proporcionada; pueden existir detalles adicionales no recogidos aquí.

## Enlaces

- Hugging Face: https://huggingface.co/jstarks/Qwen3.8-27B-Weight-Space-Programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Scripts citados en la model card: `probe_qwen38_subspaces.py`, `build_qwen38_subspaces_v2.py`, `build_midlayer_subspace4.py` (sin URL pública en la información disponible)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
