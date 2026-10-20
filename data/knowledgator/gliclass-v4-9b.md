# knowledgator/gliclass-v4-9b

## Resumen

`knowledgator/gliclass-v4-9b` es la versión multimodal de 9B parámetros de la familia GLiClass v4, desarrollada por Knowledgator. No es un modelo generativo: recibe una lista de etiquetas, una instrucción opcional, texto e imágenes, y devuelve una puntuación calibrada por cada etiqueta en un único forward pass, sin producir tokens de texto.

El modelo se construye sobre el backbone Qwen/Qwen3.5-9B (8.979.664.627 parámetros reales según safetensors) y utiliza la arquitectura *decoder-KV* presentada con SCX Router (arXiv:2609.02292): el backbone escribe instrucción, ejemplos *few-shot*, texto e imágenes en una caché KV, y las etiquetas se añaden como tokens transitorios `<<LABEL>>` que leen la caché sin entrar en ella.

Su relevancia práctica está en sustituir pipelines de clasificación y *reranking* por un único modelo de decisión con scores calibrados (un 0,8 significa aproximadamente un 80% de acierto en datos reservados), con 55,6 de *Decision Index skill* y 34 ms de latencia mediana por decisión según el autor. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-KV sobre backbone Qwen3.5-9B, con scorer bidireccional DeBERTa de dos capas, MLP de puntuación por par (input, label), celda recurrente con compuerta (hasta 3 pasos) y calibrador post-hoc |
| Parametros totales | 8.979.664.627 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | `max_length=8192` en los ejemplos de la model card; no se declara un máximo oficial |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors; el ejemplo de uso carga en `bfloat16`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 18,0 GB) |
| Modelo base | Qwen/Qwen3.5-9B (fine-tune) |
| Librería | `gliclass` (Python 3.10+) |
| Pipeline declarado | zero-shot-image-classification |
| Modalidades de entrada | Texto e imágenes (rutas, URLs o imágenes PIL), por par texto-imagen |
| Salida | Scores por etiqueta (`label`, `score`, `initial_score`); no genera texto |
| Fecha de creación / actualización | 2026-10-13 / 2026-10-16 |
| Descargas / likes | 133 / 12 |

## Arquitectura y entrenamiento

La arquitectura *decoder-KV* separa codificación y decisión. El backbone Qwen3.5-9B procesa la instrucción (`prompt`), los ejemplos *few-shot*, el texto de entrada y las imágenes, y escribe todo ello en una caché KV. Las etiquetas candidatas se concatenan como tokens transitorios `<<LABEL>>` que asisten a esa caché sin incorporarse a ella, de modo que el coste de evaluar N etiquetas se paga una sola vez por entrada. Sobre esa representación actúa un scorer bidireccional DeBERTa de dos capas que permite a las etiquetas atenderse entre sí (capturando exclusiones mutuas, por ejemplo en etiquetas jerárquicas) y al input. Un MLP puntúa cada par (input, etiqueta) y una celda recurrente con compuerta refina los estados de las etiquetas hasta 3 pasos, con parada temprana por ejemplo cuando las probabilidades dejan de cambiar. Finalmente, un calibrador post-hoc fija una temperatura por par para que los scores sigan la precisión observada.

El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; el modelo es un fine-tune de Qwen/Qwen3.5-9B con licencia Apache 2.0. La innovación destacable es el acoplamiento etiquetas-caché con refinamiento iterativo y calibración por par, que convierte una tarea de clasificación en una decisión con umbral interpretable, más el soporte multimodal de imágenes dentro del mismo mecanismo de decisión.

## Capacidades

- Clasificación zero-shot multi-etiqueta: devuelve score independiente por etiqueta con umbral configurable (`threshold`).
- Clasificación single-label: aplica softmax sobre las etiquetas para elegir una única respuesta.
- Puntuación sobre escalas: usar los niveles de una escala (por ejemplo "1 - wrong" a "5 - excellent") como etiquetas y leer sus probabilidades, con `return_hierarchical=True` para obtener todos los niveles.
- Seguimiento de instrucciones: el parámetro `prompt` transporta políticas, rúbricas o reglas que modulan la interpretación de las etiquetas.
- Etiquetas jerárquicas y ejemplos *few-shot* (`examples=[{"text": ..., "labels": [...]}]`).
- Razonamiento sobre grafos de conocimiento: grafo en texto, pregunta como instrucción y respuestas como etiquetas; cubre preguntas multi-salto y reglas de precedencia (por ejemplo, restricciones explícitas que anulan permisos de equipo).
- Clasificación de imágenes zero-shot, con imágenes asociadas por texto (rutas, URLs o PIL).
- Reranking: puntuar pasajes frente a una consulta con `prompt="Does the passage answer the query?"`.
- NLI y moderación de contenido / guardrails (etiquetas `entailment`, `neutral`, `contradiction`; `violates policy` / `complies with policy`).
- Selección de siguiente paso en agentes y navegación web (qué enlace, herramienta o acción toca).
- Scores calibrados por par, con `initial_score` sin calibrar expuesto junto al score final.
- Inferencia por lotes (`batch_size`) y etiqueta `streaming` declarada por el autor (no documentada en el extracto disponible).

## Casos de uso

- Moderación de contenido y guardrails en producción: definir la política en `prompt` y usar etiquetas binarias `violates policy` / `complies with policy`; la calibración por par permite fijar un umbral operativo con significado estadístico en lugar de un corte arbitrario.
- Clasificación de reseñas o tickets por aspectos: pasar la opinión y etiquetas como `battery`, `display`, `durability`, `price`, `shipping` en modo multi-etiqueta, aprovechando que un texto puede activar varios aspectos con scores independientes.
- Reranking en un pipeline RAG: recuperar candidatos con un retriever vectorial y reordenarlos con el modelo, puntuando cada pasaje contra la consulta en un solo forward pass por lote.
- Automatización de políticas de negocio: evaluar solicitudes contra una rúbrica escrita (por ejemplo, ventana de reembolso de 30 días frente a una compra a 45 días) con etiquetas de decisión como `refund approved`, `refund denied`, `escalate to a human`.
- Control de acceso y auditoría sobre grafos de conocimiento: codificar usuarios, equipos, recursos y reglas como tripletas en texto y resolver consultas de permiso del tipo "¿puede Alice abrir Salaries.xlsx?" con respuestas sí/no.
- Evaluación automática de calidad de respuestas: usar una escala de 1 a 5 como etiquetas con `return_hierarchical=True` para obtener la distribución completa de probabilidad y no solo la clase ganadora.
- Enrutado de agentes y browsing: dada la página o el estado actual y una instrucción, decidir qué enlace, herramienta o acción corresponde como siguiente paso, usando las acciones como etiquetas.
- Clasificación de imágenes zero-shot en catálogos: asociar una imagen a una lista de categorías definidas en el momento de la inferencia, sin reentrenamiento.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Decision Index skill | 55,6 | Métrica propia del autor; no se detalla su definición ni el conjunto de evaluación en la información disponible |
| Latencia mediana por decisión | 34 ms | Hardware y configuración de medida no especificados |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BEIR u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada en `bfloat16`: ~18 GB solo para pesos (8,98B × 2 bytes); con caché KV hasta 8.192 tokens y activaciones, el consumo realista se sitúa por encima de los 20 GB.
- VRAM estimada en `float32`: ~36 GB solo para pesos.
- Estimaciones teóricas de cuantización: ~9 GB en 8 bits y ~4,5-5 GB en 4 bits; el repositorio no publica checkpoints cuantizados ni la librería documenta soporte de cuantización en la información disponible.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB para `bfloat16` sin restricciones de longitud. En RTX 4090 (24 GB) el modelo entra de forma ajustada y obliga a recortar `max_length` y el tamaño de lote.
- Cabe en GPU de consumo: sí, con matices; 24 GB es el mínimo práctico para `bfloat16` con contexto recortado, y 16 GB exigiría cuantización no documentada.
- Despliegue: la vía soportada es PyTorch con la librería `gliclass` (`GLiClassModel` + `ZeroShotClassificationPipeline`), instalable con `pip install gliclass -U` o desde el repositorio en Python 3.10+. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, y la arquitectura de decisión sobre caché KV no encaja en el bucle de decodificación generativo de esos motores.
- Latencia y throughput: 34 ms de mediana por decisión según el autor, con hardware no especificado. El coste de evaluar N etiquetas se amortiza en un único paso por entrada; el refinamiento recursivo se detiene antes de 3 pasos cuando las probabilidades se estabilizan, lo que reduce la latencia media.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| knowledgator/gliclass-v4-9b | 8,98B | 8.192 tokens en los ejemplos de la model card | Scores calibrados por etiqueta, sin texto | Apache 2.0 | HuggingFace, 133 descargas |
| Qwen/Qwen3.5-9B (modelo base) | ~9B (no confirmado en la información disponible) | No disponible | Texto generado | No disponible en la información proporcionada | HuggingFace |
| Versiones anteriores de GLiClass (v1-v3) | No disponible | No disponible | Clasificación zero-shot | No disponible | Repositorio GLiClass en GitHub |

La comparación con clasificadores zero-shot de la competencia (por ejemplo, aproximaciones basadas en NLI con DeBERTa) no está disponible en la información proporcionada, y el autor no publica una tabla comparativa de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Solo inglés declarado: no hay evidencia de rendimiento multilingüe, pese a que el backbone Qwen3.5 sea multilingüe.
- No genera texto: cualquier tarea que requiera explicación, resumen o respuesta redactada queda fuera de su alcance; hay que encadenarlo con un modelo generativo.
- La decisión está acotada al conjunto de etiquetas proporcionado: etiquetas mal formuladas o incompletas degradan directamente la calidad del resultado, sin mecanismo de abstención documentado.
- Calibración dependiente del dominio: la afirmación "un 0,8 equivale a ~80% de acierto" se valida en los datos reservados del autor; en dominios distintos la calibración puede no transferirse y conviene recalibrar con datos propios.
- Riesgo de sesgo heredado del backbone Qwen3.5-9B, no evaluado en la información disponible; crítico en uso para moderación o guardrails, donde los falsos positivos y negativos tienen coste directo.
- Riesgo de alucinación atenuado por diseño (no genera texto), pero sustituido por el riesgo de asignar alta confianza a etiquetas incorrectas en entradas fuera de distribución.
- El extracto de model card disponible está truncado en la sección de clasificación de imágenes y no cubre el resto de la documentación.
- No se publican detalles de entrenamiento (tokens, composición del dataset, alineamiento), lo que dificulta auditar el comportamiento del modelo.
- Adopción muy reciente y reducida (133 descargas, 12 likes, creado el 2026-10-13): ecosistema,的工具 y soporte comunitario aún escasos.
- Latencia medida sin especificar hardware ni longitud de entrada; 34 ms no es extrapolable a cualquier despliegue.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero conviene revisar las condiciones del modelo base Qwen3.5-9B, no incluidas en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/knowledgator/gliclass-v4-9b
- Repositorio GitHub de GLiClass: https://github.com/Knowledgator/GLiClass
- Paper SCX Router (arquitectura decoder-KV): https://arxiv.org/abs/2609.02292
