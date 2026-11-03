# hweller1/wayfinder-qwen-35b-a3b

## Resumen

Wayfinder-qwen-35b-a3b es un ajuste fino del modelo Qwen3.6-35B-A3B, desarrollado por el usuario hweller1, diseñado específicamente para funcionar como subagente de búsqueda de código. El modelo recibe un encargo (brief) de un agente padre, por ejemplo "¿dónde decide el router que una petición coincide con una ruta con variables de path?", y devuelve un informe con rangos `path:start-end` ordenados por relevancia, una razón de una línea para cada uno, un resumen y los huecos que no pudo cubrir. Se trata, por tanto, de un modelo especializado en exploración de repositorios desconocidos mediante herramientas.

Arquitectura MoE con 35.951.822.704 parámetros totales y aproximadamente 3B activos por token, heredada íntegramente de Qwen3.6-35B-A3B. El post-entrenamiento consistió en un SFT con LoRA posteriormente fusionado en los pesos base, manteniendo sin cambios el config, el tokenizer y el chat template del modelo original. Los pesos se distribuyen en bf16 safetensors en 26 shards, con un tamaño de repositorio de 71,9 GB.

Su relevancia radica en la especialización: frente a wayfinder-glimmer-30b, entrenado con los mismos ejemplos y receta, este modelo completa una búsqueda en 20-44 segundos en una única H100 y un único stream, frente a los aproximadamente 175 segundos del anterior, a cambio de una recall inferior en 0,036 en el brazo de grep sobre el conjunto de 200 tareas held-out. Es una release de pesos: no incluye datos de entrenamiento, trayectorias ni texto de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (qwen3_5_moe), derivada de Qwen3.6-35B-A3B |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B por token |
| Longitud de contexto | 65.536 tokens (valor de `--max-model-len` en el ejemplo de serving; el modelo base no lo especifica en la informacion disponible) |
| Tipos de cuantizacion | FP8 online (probado); bf16 disponible en safetensors; otras cuantizaciones no evaluadas |
| Idiomas soportados | Ingles (en) |
| Licencia | other: apache-2.0-and-muse-model-license |
| Formato de pesos | safetensors bf16 (26 shards) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer con mezcla de expertos (MoE) de 35B parámetros totales y unos 3B activos por token. El ajuste se realizó mediante supervisión fina con LoRA (SFT) sobre ejemplos de búsqueda de código, y los adaptadores se fusionaron posteriormente en los pesos base, de modo que el checkpoint resultante es un modelo denso en su formato de pesos pero con el enrutamiento MoE original intacto. No se modificaron ni el config, ni el tokenizer, ni el chat template.

Los datos de entrenamiento no se detallan en la información disponible: la model card indica explícitamente que no se incluyen datos, trayectorias ni texto de tareas. Se sabe que se usaron los mismos ejemplos y la misma receta que wayfinder-glimmer-30b. El modelo fue entrenado y evaluado con su propio razonamiento previo reinyectado en cada petición, y las evaluaciones se hicieron con temperatura 0,85, top_p 0,95, top_k 20 y thinking activado. El head de predicción multi-token (MTP) es el que Qwen distribuyó originalmente y no fue ajustado; su tasa de aceptación medida fue del 70,2% (60.421 de 86.045 tokens borrador) en la prueba de latencia de 12 rollouts, y del 70,5% y 72,5% en dos lanzamientos end-to-end.

## Capacidades

- Búsqueda de código en repositorios desconocidos mediante herramientas: `grep`, `glob`, `read_file`, `semantic_search` (sobre índice vectorial voyage-code-4) y una herramienta terminal `report`.
- Planificación multi-paso: razona antes de cada llamada a herramienta y decide cuándo detenerse según la evidencia reunida.
- Tool calling / function calling con parser `qwen3_coder`; sin él, las llamadas vuelven como texto plano.
- Razonamiento explícito (thinking mode) con parser `qwen3`; el modelo espera recibir su razonamiento anterior en cada petición.
- Generación de informes estructurados: rangos `path:start-end` ordenados, razón de una línea por resultado, resumen y lagunas no resueltas.
- Capacidad de visión heredada del modelo base (tag `image-text-to-text`), aunque no se documenta su uso en el ajuste.
- Multilingüe: limitado a inglés según la model card.

## Casos de uso

- Subagente de exploración en un agente de código padre: el agente principal delega búsquedas concretas ("¿dónde se valida el token JWT?") y lee el informe en lugar de buscar por sí mismo, reduciendo el consumo de contexto del modelo grande.
- Localización de puntos de configuración en bases de código heredadas: el modelo usa `grep` y `glob` para encontrar dónde se define un parámetro (por ejemplo, el retardo máximo de backoff en reintentos HTTP) y devuelve los rangos exactos.
- Triaje de incidencias: dado un stack trace o un mensaje de error, el subagente localiza las funciones implicadas y devuelve las rutas candidatas para que el ingeniero las revise.
- Incorporación a nuevos repositorios: un desarrollador nuevo lanza el subagente para responder preguntas sobre la arquitectura y recibe referencias `path:start-end` verificables en lugar de descripciones genéricas.
- Búsqueda semántica combinada con búsqueda léxica: cuando el índice voyage-code-4 está disponible, el modelo alterna `semantic_search` con `grep` para cubrir tanto coincidencias exactas como conceptuales.
- Automatización de revisiones de código: integrado en un pipeline, el subagente localiza las áreas afectadas por un cambio y genera un informe de impacto con rutas y motivos.
- Construcción de índices de documentación interna: el modelo recorre el repositorio y produce mapas de dónde vive cada concepto, reutilizables por otros agentes.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Recall en brazo grep (200 tareas held-out) | 0,036 por debajo de wayfinder-glimmer-30b |
| Tiempo de busqueda (1 H100, 1 stream) | 20-44 s (frente a ~175 s de wayfinder-glimmer) |
| Tasa de aceptacion MTP (12 rollouts) | 70,2% (60.421/86.045 tokens borrador) |
| Tasa de aceptacion MTP (lanzamiento end-to-end 1) | 70,5% |
| Tasa de aceptacion MTP (lanzamiento end-to-end 2) | 72,5% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras de recall y latencia son las reportadas por el autor; los números de retrieval held-out se obtuvieron con MTP desactivado.

## Requisitos de hardware

- VRAM estimada: en bf16, los 35,95B parámetros ocupan aproximadamente 72 GB, por lo que se necesita al menos una GPU de 80 GB (H100, A100 80GB). Con cuantización FP8 online, la huella se reduce a unos 36 GB de pesos más overhead de KV cache y activaciones.
- GPU recomendadas: H100 (configuración probada por el autor), A100 80GB. No se documenta funcionamiento en GPU de consumo.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB) en bf16 ni en FP8 sin cuantizaciones más agresivas no evaluadas.
- Despliegue: vLLM 0.32.0 con `--quantization fp8`, `--tool-call-parser qwen3_coder`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--enable-prefix-caching`, `--max-num-seqs 32`, `--gpu-memory-utilization 0.92` y `--language-model-only`. Opcionalmente `--speculative-config '{"method": "qwen3_next_mtp", "num_speculative_tokens": 2}'` para decodificación especulativa.
- Latencia: 20-44 s por búsqueda en un solo stream con H100 y FP8; el throughput agregado no se documenta.
- Otras opciones de despliegue (llama.cpp, Ollama, TGI) no han sido evaluadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Recall (grep, held-out) | Latencia (1 H100) | Licencia |
|---|---|---|---|---|---|---|
| wayfinder-qwen-35b-a3b | 35,95B | ~3B | 65.536 | referencia - 0,036 | 20-44 s | apache-2.0-and-muse-model-license |
| wayfinder-glimmer-30b | ~30B (no confirmado) | no disponible | no disponible | referencia | ~175 s | no disponible |
| Qwen3.6-35B-A3B (base) | 35,95B | ~3B | no disponible | no evaluado como subagente | no disponible | no disponible |

La comparativa se limita a los dos modelos de la familia wayfinder y al base, únicos datos disponibles. No se dispone de información sobre alternativas de otros autores en la misma categoria.

## Limitaciones y advertencias

- La recall es inferior a la de wayfinder-glimmer-30b en 0,036 en el brazo de grep; el autor recomienda leer la sección de evaluación antes de elegir entre ambos.
- El modelo solo soporta inglés según la model card.
- Requiere que el cliente reinyecte el razonamiento previo en cada petición bajo la clave `reasoning`; vLLM 0.32.0 descarta `reasoning_content` silenciosamente, lo que produce bloques de pensamiento vacíos. Un cliente que no cumpla este contrato queda fuera de la distribución de entrenamiento.
- Sin `--tool-call-parser qwen3_coder`, las llamadas a herramientas se devuelven como texto plano y el agente no puede ejecutarlas.
- El chat template exige que los argumentos de las llamadas a herramienta sean un diccionario.
- Es imprescindible mantener la línea de convergencia "Report as soon as the evidence covers the brief; do not exhaust the turn budget." en el system prompt, porque los ejemplos de entrenamiento la incluyen.
- Los esquemas de herramientas y el system prompt de entrenamiento están en `serve/scout_tool_specs.json` y `serve/scout_product_prompt.md` del repositorio de GitHub; desviarse de ellos degrada el comportamiento.
- Licencia compuesta (apache-2.0-and-muse-model-license): es necesario revisar `LICENSE-MUSE-SPARK-OPEN.md` antes de cualquier uso comercial.
- No se incluyen datos de entrenamiento ni trayectorias, lo que limita la reproducibilidad y la auditoría de sesgos.
- No se han publicado evaluaciones en bf16; todas las cifras proceden de FP8.
- Riesgo de alucinación en las rutas y rangos reportados: el modelo puede citar `path:start-end` inexistentes o desactualizados, por lo que el agente padre debe validar las referencias.
- El rendimiento con MTP activado solo se comprobó en 12 rollouts y en dos estudios end-to-end, no en el conjunto held-out.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hweller1/wayfinder-qwen-35b-a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo hermano: https://huggingface.co/hweller1/wayfinder-glimmer-30b
- Licencia Muse Spark Open: https://huggingface.co/hweller1/wayfinder-qwen-35b-a3b/blob/main/LICENSE-MUSE-SPARK-OPEN.md
- Repositorio GitHub con el harness de referencia: no disponible en la informacion proporcionada (la model card lo menciona pero no incluye la URL)
- Paper, blog o demo: no disponible en la informacion proporcionada
