# sergolsub/d3-v3.1.0-27B-MLX-8bit

## Resumen

sergolsub/d3-v3.1.0-27B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo vllm-sr/d3, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería mlx_lm. No se trata de un modelo entrenado desde cero, sino de una adaptación de pesos BF16 originales a un formato optimizado para el ecosistema MLX de Apple, sin reentrenamiento ni cambios de arquitectura, según declara el autor en la model card. El modelo cuenta con aproximadamente 26.085 millones de parámetros (26,08B) y un tamaño en disco de 27,9 GB en el repositorio.

La relevancia de esta ficha reside en que el modelo incorpora una capacidad poco habitual: un modo de "decisión" (decision mode) con cabezas de inferencia específicas que permiten clasificar texto en categorías controladas (tipo noul, choice o score) mediante una API propia expuesta en el script d3_mlx.py. El autor reporta métricas de calidad tras la cuantización idénticas a las del modelo BF16 original en sus evaluaciones internas (88,9% de accuracy, 87,5% en noul, 96,0% en choice y 84,0% en score), así como una perplejidad de calibración de 1,981 frente a 1,977 en BF16.

La licencia es Apache 2.0, heredada de los pesos originales de vllm-sr/d3. El modelo está pensado para despliegue local en hardware Apple Silicon, con métricas medidas en un Mac mini M4 Pro de 48 GB de memoria unificada: 28,15 GB en disco, 7,08 s de carga, 15,78 GB de memoria residente máxima y una latencia mediana de decisión de 2141 ms (0,63 decisiones cortas por segundo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (linear_attn) y cabezas de decisión adicionales; etiqueta qwen3_5 en Hugging Face |
| Parametros totales | 26.085.330.160 (26,08B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); existen pesos BF16 en el repositorio upstream vllm-sr/d3 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en layout MLX (26 shards), más config.json, tokenizer, chat_template.jinja y scripts de inferencia |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a un transformer con capas de atención lineal (el autor identifica `language_model.layers.0.linear_attn.in_proj_b.weight` como la capa con mayor divergencia tras la cuantización) y una etiqueta de arquitectura `qwen3_5` en los metadatos de Hugging Face. Sobre el modelo base se añaden cabezas de decisión específicas, cuya configuración se describe en `decision_config.json` y `joint_config.json`, y que se cargan mediante el script `d3_mlx.py`. Esta conversión concreta no introduce cambios arquitectónicos: es una cuantización a 8 bits de los pesos BF16 originales de vllm-sr/d3, realizada mediante conversión en streaming desde los shards de origen.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias en el modelo original vllm-sr/d3. La model card de esta conversión no documenta el proceso de entrenamiento del modelo base, solo el proceso de cuantización. El autor sí publica una auditoría de cuantización (`kl_audit.json`) con comparación tensor a tensor frente a los originales BF16: 1183 tensores comparados, KL media de 3,80e-04, KL máxima de 7,78e-03 y 581 tensores con divergencia no nula. También se incluyen sumas de verificación SHA-256 de todos los ficheros del repositorio.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base vllm-sr/d3 (no documentados en detalle en esta conversión).
- Modo de decisión estructurado: permite formular preguntas de clasificación con tres tipos de salida: `noul` (respuesta binaria sí/no), `choice` (selección entre categorías con criterios definidos) y `score` (puntuación sobre una escala de criterios ordenados).
- Interfaz de programación propia mediante la clase `D3` del script `d3_mlx.py`, con un método `decide(texto, especificación)` que acepta una pregunta y un diccionario de tareas.
- Soporte de plantilla de chat (`chat_template.jinja`), lo que sugiere compatibilidad con formatos conversacionales multi-turno, aunque no se detalla su comportamiento.
- Capacidades multilingües: no disponibles.
- Soporte de tool calling, function calling, agentes o multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Triaje automático de tickets de soporte: el modelo puede clasificar cada incidencia en un equipo responsable (por ejemplo, facturación o envíos) usando el tipo de decisión `choice` con criterios explícitos, tal como muestra el ejemplo de la model card con el pedido #7821.
- Detección de intención de reembolso: mediante el tipo `noul`, el modelo responde sí o no a preguntas binarias como "¿el cliente quiere un reembolso?", útil para enrutar conversaciones de atención al cliente hacia el flujo adecuado.
- Priorización de incidencias técnicas: con el tipo `score` y una escala de criterios como "cosmético, molesto, bloqueante", el modelo asigna severidad a errores de sistema (por ejemplo, "Export failed: disk quota exceeded"), lo que permite ordenar colas de trabajo.
- Enrutamiento de correos o mensajes entrantes: clasificación por departamento o urgencia en un sistema de gestión documental, aprovechando la API de decisión con criterios definidos por el operador.
- Moderación de contenido o verificación de políticas: formular preguntas binarias (`noul`) sobre si un texto cumple una política concreta, con la ventaja de que la salida es estructurada y fácil de integrar en un pipeline.
- Despliegue local en estaciones de trabajo Apple Silicon: al estar en formato MLX 8 bits y ocupar 15,78 GB de memoria residente máxima en un M4 Pro de 48 GB, es viable para prototipos y herramientas internas que requieran privacidad de datos sin depender de la nube.
- Evaluación de calidad de clasificadores existentes: el modo de decisión con criterios explícitos permite construir líneas base reproducibles para comparar con otros modelos o con reglas heurísticas.

## Benchmarks y rendimiento

El autor publica métricas de calidad de la cuantización y de rendimiento en su propio entorno, no benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K, etc.):

| Metrica | 8 bits (MLX) | BF16 (original) |
|---|---|---|
| Accuracy (eval del autor) | 88,9% | 88,9% |
| Noul | 87,5% | 87,5% |
| Choice | 96,0% | 96,0% |
| Score | 84,0% | 84,0% |
| Perplejidad de calibración | 1,981 | 1,977 |
| Decision Index 0.4.1 | 62,5 | no disponible |

| Metrica de rendimiento (Mac mini M4 Pro 48 GB) | Valor |
|---|---|
| Latencia de decisión corta (mediana de 5, tras 3 calentamientos) | 1238 ms |
| Latencia de decisión (mediana general) | 2141 ms |
| Decisiones cortas sostenidas | 0,63/s |
| Tiempo de carga | 7,08 s |
| Memoria residente máxima | 15,78 GB |
| Tamano en disco | 28,15 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: 15,78 GB de memoria residente máxima medida en MLX 8 bits; el repositorio ocupa 27,9 GB en disco (28,15 GB según el autor).
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon; el autor reporta mediciones en un Mac mini M4 Pro con 48 GB de memoria unificada. Para los pesos BF16 originales se requeriría hardware con mayor memoria, aunque no se documenta.
- Compatibilidad con GPU de consumidor NVIDIA (RTX 4090, etc.): no disponible; este repositorio es específico de MLX y no incluye pesos GGUF.
- Opciones de despliegue: `mlx_lm` y el script propio `d3_mlx.py` incluido en el repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: 1238 ms de mediana para decisiones cortas, 2141 ms de mediana general y 0,63 decisiones cortas por segundo en el hardware citado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. El modelo base vllm-sr/d3 es el referente natural, pero no se detallan sus especificaciones completas (contexto, idiomas, benchmarks). Se puede establecer la siguiente comparación mínima:

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| sergolsub/d3-v3.1.0-27B-MLX-8bit | 26,08B | MLX 8 bits | Apache 2.0 | Conversión para Apple Silicon con modo de decisión |
| vllm-sr/d3 (base) | no disponible | BF16 | Apache 2.0 | Pesos originales, sin cuantizar |
| Otros modelos de ~27B | no disponible | no disponible | no disponible | No se dispone de datos para comparar |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas del modelo base; se desconoce su comportamiento fuera del modo de decisión.
- El modo de decisión está pensado para preguntas cerradas con criterios explícitos; no se garantiza su fiabilidad en preguntas abiertas o ambiguas.
- La longitud de contexto no está especificada, lo que impide planificar su uso en conversaciones o documentos largos.
- El modelo está empaquetado exclusivamente para MLX (Apple Silicon); no es directamente utilizable en GPUs NVIDIA sin una conversión adicional a otro formato.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte de que, en caso de conflicto, prevalece la licencia del repositorio upstream vllm-sr/d3.
- Las métricas de calidad y rendimiento provienen de evaluaciones internas del autor, no de benchmarks independientes; deben interpretarse con cautela.
- El repositorio tiene 306 descargas y 0 likes en el momento de la consulta, lo que indica una adopción comunitaria muy limitada y poca validación externa.
- No se dispone de información sobre el proceso de entrenamiento del modelo base, lo que dificulta evaluar riesgos de sesgo o de alineación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/d3-v3.1.0-27B-MLX-8bit
- Modelo base: https://huggingface.co/vllm-sr/d3
