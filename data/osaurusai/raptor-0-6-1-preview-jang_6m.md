# OsaurusAI/Raptor-0.6.1-preview-JANG_6M

## Resumen

Raptor-0.6.1-preview-JANG_6M es un ajuste fino supervisado y cuantizado de XHToken/Spark-X2.5-4B, un modelo denso de 4.112.079.360 parámetros orientado a razonamiento y uso de herramientas. Lo publica OsaurusAI como parte del arnés Osaurus y está empaquetado en formato MLX para Apple Silicon, con un peso en disco de 3,41 GiB y 7,126 bits por peso. El ajuste es deliberadamente ligero: solo toca la atención (las proyecciones fusionadas `q_k_v_proj` y `out_proj` de las 36 capas), dejando el MLP, el embedding atado, las normalizaciones y la puerta de atención por cabeza idénticos al modelo base, igual que el tokenizador y la plantilla de chat.

La relevancia del lanzamiento está en su contrato de servicio: el bundle declara el muestreo, el dialecto del parser de razonamiento y el formato de llamada a herramientas en ficheros de configuración (`jang_config.json`), de modo que el arnés se configura solo. El razonamiento viene activado por defecto mediante un `<think>` forzado en el prompt de generación, y las llamadas a herramientas usan una forma sin saltos de línea con etiquetas `<tool_call>`, `<arg_key>` y `<arg_value>`.

Conviene subir la cautela con la nomenclatura: pese al número de versión contiguo, este modelo corre sobre la arquitectura `spark2_5` y es una línea distinta de Raptor 0.6-preview (backbone de transformer con bucles) y de Raptor v0.5 (híbrido). No hay continuación de pesos entre ellos, y `mlx-lm` no incluye soporte para `spark2_5` en ninguna versión, por lo que el runtime llega con el arnés Osaurus (0.25.0 o superior).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia `spark2_5`, 36 capas; proyección QKV fusionada (`q_k_v_proj`), `out_proj`, puerta de atención por cabeza y embedding atado |
| Parámetros totales | 4.112.079.360 (4,112 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada; la model card advierte de que las trazas de razonamiento pueden superar los 8.192 tokens de salida |
| Tipos de cuantización | JANG_6M: atención y embedding atado a 8 bits; MLP a 6 bits; escalas de grupo en bfloat16; puertas por cabeza y normalizaciones en precisión completa. 7,126 bits/peso |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (librería `mlx`); repositorio de 3,7 GB, pesos de 3,41 GiB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 36 capas perteneciente a la arquitectura `spark2_5`, con atención que emplea una proyección QKV fusionada, una puerta de atención por cabeza y embedding atado a la salida. Sobre el modelo base se aplicó un ajuste fino supervisado (SFT) restringido a la atención: únicamente las matrices `q_k_v_proj` y `out_proj` de las 36 capas se han modificado, mientras que el MLP, el embedding atado, todas las normalizaciones y las puertas de atención permanecen idénticos byte a byte respecto a Spark-X2.5-4B. El tokenizador y la plantilla de chat tampoco cambian. No se documenta en la información disponible el uso de RLHF, DPO ni de otra etapa de alineación posterior.

La cuantización se calibró específicamente para este bundle: 1.759.685 tokens de calibración procedentes de código, transcripciones de agentes y de llamadas a herramientas, elección múltiple académica, chat general, chino, contexto largo, ciencia y seguridad, con un 7,3 % de tokens autogenerados. Se aplicó escalado consciente de activaciones en 72/72 sitios de plegado de normalización y en 36/36 proyecciones de puerta de atención, y ajuste con corrección de error en 180/181 tensores; el único tensor excluido es el embedding atado, que se ajusta directamente por no tener activación de entrada sobre la que condicionarse. No se reutilizó la calibración del modelo base, ya que el ajuste movió la atención y, con ella, las estadísticas de activación.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento explícito en modo *thinking*: la plantilla fuerza la apertura `<think>` en el prompt de generación, y `enable_thinking=false` produce un cierre `<|Bot|></think>` como carril alternativo probado.
- Uso de herramientas (*tool calling*) con formato propio: `<tool_call>NAME<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>`, sin saltos de línea; los resultados de herramientas se colocan en un bloque `<|Tool|>` y los mensajes consecutivos de herramienta se fusionan.
- Flujos de agente multi-paso, con las herramientas renderizadas en el primer bloque de sistema bajo `## Tools` más una lista JSON dentro de `<tools>`.
- Razonamiento matemático básico, ejemplificado en la propia model card con aritmética (`84 * 3 / 2`).
- Ejecución de instrucciones con razonamiento prolongado: las trazas pueden exceder los 8.192 tokens de salida en peticiones difíciles.
- Capacidades de visión, audio o *speech*: no disponibles.
- Multilingüismo: limitado a inglés y chino según las etiquetas del modelo.

## Casos de uso

- Agentes autónomos con herramientas: el bundle declara en `jang_config.json` el nombre del parser, el dialecto y los delimitadores, de modo que el arnés se conecta sin configuración por modelo; es adecuado para agentes que encadenan llamadas a API y consumen los resultados en bloques `<|Tool|>`.
- Asistentes de razonamiento paso a paso: con el modo *thinking* activado por defecto, sirve para tareas de análisis donde se quiere una traza explícita antes de la respuesta final, aceptando presupuestos de salida superiores a 8.192 tokens.
- Atención al cliente en inglés y chino: el modelo cubre ambos idiomas y sigue instrucciones conversacionales multi-turno, aunque la ventana de contexto no está documentada y debe medirse antes de fijar la política de truncado.
- Automatización de operaciones sobre *codebases*: el conjunto de calibración incluye código y transcripciones agénticas, por lo que el ajuste preserva el comportamiento en tareas de lectura y modificación de repositorios vía llamadas a herramientas.
- Prototipado en portátiles Apple Silicon: con 3,41 GiB de pesos y 104,8 tok/s de decodificación medidos en un M5 Max, permite iterar localmente sin GPU dedicada.
- Inferencia de bajo consumo en *edge* de escritorio: al estar cuantizado a 7,126 bits/peso con escalas en bfloat16, reduce el ancho de banda de memoria frente a un bf16 completo, lo que resulta útil para servicios de un solo usuario con presupuesto de memoria ajustado.
- Evaluación comparativa de cuantización: sirve como referencia para medir deriva de distribución (KL) frente a los pesos bf16 del propio modelo, con corpus de calibración y evaluación disjuntos.

## Benchmarks y rendimiento

Los datos publicados corresponden a 15.839 posiciones *teacher-forced* sobre prompts reservados, puntuadas contra los pesos bf16 del propio modelo. La model card indica que no existe fila de comparación con MLX estándar porque `mlx-lm` no implementa la arquitectura `spark2_5`.

| Métrica | Raptor-0.6.1-preview-JANG_6M | Spark-X2.5-4B-JANG_6M (base) |
|---|---|---|
| Tamaño en disco | 3,41 GiB | 3,41 GiB |
| Bits por peso | 7,126 | 7,126 |
| KL mediana (menor es mejor) | 0,0054 | 0,0048 |
| KL media (menor es mejor) | 0,0132 | 0,0143 |
| Acuerdo top-1 (mayor es mejor) | 97,67 % | 97,69 % |
| Decodificación | 104,8 tok/s | 104,7 tok/s |
| Prefill | 5.042 tok/s | 5.046 tok/s |

La decodificación es la mediana de 4 pruebas en condición fija (prompt de 512 tokens, 128 generados), descartando la primera, sobre un M5 Max; la dispersión entre las pruebas retenidas fue del 0,6 %. La curva de volteo condicionada por margen decrece de forma monótona en los cinco primeros intervalos (13,68 % → 0,00 %) y marca 0,04 % en el intervalo final `[8, ∞)`, lo que corresponde a un único token de 2.611 y se reporta sin suavizar. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Memoria para inferencia: pesos de 3,41 GiB; el repositorio ocupa 3,7 GB. Hay que sumar el espacio de la caché KV, que depende de la longitud de contexto efectiva (no documentada) y del número de cabezas.
- Plataforma objetivo: Apple Silicon con memoria unificada, mediante la librería MLX. El rendimiento publicado se midió en un M5 Max.
- GPU recomendadas: no se documentan GPU NVIDIA ni AMD. El soporte de `spark2_5` no existe en `mlx-lm` estándar, por lo que no hay una ruta oficial de despliegue en CUDA descrita en la información disponible.
- ¿Cabe en GPU de consumo? No hay datos para GPU de consumo; sí cabe en Apple Silicon dentro de la memoria unificada disponible, dado el tamaño de 3,41 GiB de pesos más caché KV.
- Opciones de despliegue: Osaurus 0.25.0 o superior (el runtime con la arquitectura `spark2_5` viene con el arnés). Un `mlx_lm.load` sin más no resolverá la arquitectura. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput medidos: 104,8 tok/s de decodificación y 5.042 tok/s de prefill en M5 Max bajo la condición de prueba descrita.
- Muestreo recomendado: `temperature=1.0`, `top_p=0.95`, `top_k=-1` (top-p sobre vocabulario completo), sin penalización por repetición.

## Comparativa con modelos similares

Solo se dispone de comparación interna con el modelo base y con su variante cuantizada; no hay datos verificables de alternativas de terceros en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Raptor-0.6.1-preview-JANG_6M | 4,112 B (denso) | No disponible | Apache 2.0 | MLX, requiere Osaurus 0.25.0+ | SFT ligero sobre atención; KL mediana 0,0054; 104,8 tok/s en M5 Max |
| Spark-X2.5-4B-JANG_6M | 4,112 B (denso) | No disponible | Apache 2.0 | MLX | Bundle base cuantizado, misma arquitectura y tamaño; KL mediana 0,0048 |
| Spark-X2.5-4B | 4,112 B (denso) | No disponible | No disponible en la información proporcionada | Pesos bf16 de referencia | Usado como patrón de evaluación de la cuantización |
| Raptor 0.6-preview | No disponible | No disponible | No disponible | No disponible | Backbone distinto (transformer con bucles); no es continuación de pesos |
| Raptor v0.5 | No disponible | No disponible | No disponible | No disponible | Backbone híbrido; línea separada |

## Limitaciones y advertencias

- La arquitectura `spark2_5` no está soportada por `mlx-lm` en ninguna versión ni en `main`, de modo que el modelo no se puede cargar con una instalación estándar de MLX: requiere el arnés Osaurus 0.25.0 o superior.
- El ajuste solo modifica la atención. Cualquier limitación del MLP, el embedding o las normalizaciones del modelo base Spark-X2.5-4B se hereda sin cambios.
- Idiomas soportados únicamente inglés y chino; no hay evidencia de calidad en castellano ni en otras lenguas.
- La longitud de contexto no está declarada en la información disponible. Dado que las trazas de razonamiento pueden superar los 8.192 tokens de salida, un truncado silencioso del historial es un riesgo real en producción: hay que presupuestar entrada más salida dentro de la ventana efectiva.
- Riesgo de alucinación: no se documentan tasas de fidelidad factual ni evaluaciones de veracidad. Los únicos datos de calidad publicados son de divergencia KL frente a los pesos bf16, que miden fidelidad a la cuantización, no corrección de las respuestas.
- Añadir o quitar una herramienta reescribe el prefijo de sistema, lo que provoca un *re-prefill* completo en lugar de un añadido de sufijo; cualquier contabilidad de reutilización de caché de prefijos debe tratarlo como una invalidación total.
- Un parser de razonamiento que espere un `<think>` literal en el flujo de salida no lo encontrará nunca, porque el aperturador se inyecta en el prompt.
- `generation_config.json` conserva la clave no estándar `max_tokens` del modelo base y carece de `max_new_tokens`, algo que `generate()` de HuggingFace ignora.
- Sesgos conocidos: no se documentan análisis de sesgo en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero al derivar del modelo base Spark-X2.5-4B conviene verificar las condiciones de ese repositorio antes de un despliegue en producción.
- El repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, y el modelo está etiquetado como *preview*, por lo que su madurez y soporte a largo plazo no están garantizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/Raptor-0.6.1-preview-JANG_6M
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Sitio de Osaurus AI: https://osaurus.ai
- Documentación de MLX LM (runtime que no incluye `spark2_5`): https://github.com/ml-explore/mlx-lm
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas corporativas de Microsoft y no guardan relación con esta ficha.
