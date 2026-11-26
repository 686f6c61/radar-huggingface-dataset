# mukaddamzaid/amos-1-large

## Resumen

Amos 1 large es un modelo de decisión de 27.000 millones de parámetros desarrollado por mukaddamzaid (proyecto Scira/Amos) y publicado bajo licencia Apache 2.0. No es un modelo generativo al uso: recibe un caso (texto, JSON o imagen) junto con un esquema de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada respuesta permitida de cada pregunta. No emite texto libre, por lo que elimina el parseo de salidas y los formatos malformados, un problema habitual cuando se usan LLM generativos como clasificadores en producción.

El modelo parte de Qwen/Qwen3.8-27B mediante fine-tuning y está especializado en lo que el autor denomina «system-one decisions»: llamadas rápidas y de un solo paso sobre casos reales. Soporta seis tipos de pregunta (sí/no, elección única entre hasta 255 opciones, puntuación, selección múltiple, cita textual y región sobre imagen) y una ventana de contexto de 131.072 tokens, lo que permite introducir políticas largas o expedientes completos en la misma petición.

Su relevancia actual radica en la combinación de calibración (métrica KL y Brier competitivas), multimodalidad para localización de objetos y un rendimiento declarado del 94,9% en Decision Bench, por delante de Perplexity Decider v1.1, DeepSeek V4.1 Flash y Gemini 3.5 Flash según los datos del autor. El gran caveat es operativo: requiere una GPU de 80 GB y el autor lo describe como el más lento de la familia Amos 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer fine-tuneado sobre Qwen/Qwen3.8-27B, con cabezas de decisión adicionales (`heads.pt`) para preguntas tipadas |
| Parametros totales | 27B (heredados del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens por petición (`--max-len 131072`) |
| Tipos de cuantizacion | no disponible (el repo distribuye safetensors; el serving usa PyTorch 2.14 sin cuantización documentada) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (directorio `model/` con pesos, tokenizer, image processor y `heads.pt`) |

## Arquitectura y entrenamiento

El modelo se construye por fine-tuning del modelo base Qwen/Qwen3.8-27B. Sobre ese transformer se añaden cabezas de decisión específicas (`heads.pt`) que transforman el estado interno en distribuciones de probabilidad sobre las respuestas permitidas de cada pregunta tipada. La inferencia se resuelve en un único forward pass para todas las preguntas del esquema, sin generación autoregresiva de texto, lo que explica la latencia declarada de 122 ms de mediana para una petición de tres preguntas en servidor.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El autor sí documenta un mecanismo de calibración: el archivo `calibration.json` contiene los ajustes de decodificación de citas que lee el servidor, y en la evaluación de typed-decisions reporta una variante con priors por pregunta ajustados sobre el split de entrenamiento del benchmark y aplicados en tiempo de respuesta sin modificar los pesos, que eleva la accuracy del 76,1% al 80,25%. También se documenta el soporte de imágenes mediante un image processor incluido en el repositorio y preguntas de tipo `region` que devuelven cajas sobre la imagen.

## Capacidades

- Clasificación y decisión tipada: responde preguntas de tipo sí/no (`noul`), elección única (`choice`, hasta 255 opciones), puntuación (`score`), selección múltiple (`multi`), cita textual (`span`) y región sobre imagen (`region`).
- Salida probabilística calibrada por respuesta, apta para umbrales, abstención y agregación posterior.
- Procesamiento de casos en texto plano, JSON estructurado o imagen dentro de la misma petición.
- Razonamiento de varios pasos sobre políticas largas y compensaciones entre criterios, según la descripción del autor para el segmento «hard calls».
- Capacidades de visión: localización de objetos con caja delimitadora y tareas del tablero de visión de Decision Index.
- Reranking de recuperación (nDCG@10 sobre el top 30 de BM25).
- Extracción de campos exactos, como totales de factura citados literalmente.
- Conocimiento amplio para casos que requieren contexto externo al expediente.
- No soporta tool calling ni function calling en el sentido habitual de los LLM generativos: la interfaz es un esquema de preguntas, no una conversación con herramientas.
- No hay modo «thinking» explícito ni generación de texto libre.
- Multilingüismo: limitado a inglés.

## Casos de uso

- Triaje de tickets de soporte: se envía el texto del ticket como `state` y un esquema con preguntas de tipo `choice` (equipo responsable: billing, technical, sales) y `noul` (¿pide reembolso?). El modelo devuelve probabilidades por categoría en un solo paso, lo que permite enrutar con umbrales de confianza y derivar a revisión humana los casos con baja probabilidad.
- Clasificación de correo entrante a escala: con 131.072 tokens de contexto se pueden incluir políticas de enrutamiento completas y el hilo de correo; la salida tipada evita el parseo de JSON generado y los fallos de formato en pipelines de alto volumen.
- Procesamiento de facturas y documentos financieros: preguntas de tipo `span` para citar importes exactos (el autor reporta 10/10 en totales de factura citados exactamente) y preguntas `noul` para detectar duplicados o solicitudes de devolución.
- Moderación y cumplimiento normativo: preguntas `multi` para marcar todas las políticas aplicables a un contenido y `score` para graduar el riesgo, con probabilidades calibradas que permiten fijar umbrales auditables.
- Análisis de imágenes en flujos de inspección: preguntas `region` para localizar el objeto nombrado en una foto (caja centrada en el objeto con 91,9% en RefCOCO y 98,4% en COCO según el autor), útil en verificación de daños, inventario o documentación visual.
- Reranking en pipelines RAG: dado un conjunto de documentos recuperados por BM25, el modelo reordena el top 30 con nDCG@10 medio de 0,517 en SciFact, NFCorpus y FiQA, reduciendo el ruido antes de pasarlo a un generador.
- Evaluación automática de respuestas de otros modelos: preguntas `score` y `noul` sobre pares pregunta-respuesta para construir un juez con salida probabilística en lugar de texto libre.
- Extracción de datos de contratos: preguntas `span` sobre cláusulas y direcciones, con la advertencia documentada de que las citas largas pueden truncarse.

## Benchmarks y rendimiento

Resultados declarados por el autor. En typed-decisions (test split de 2.000 decisiones de cuatro flujos no vistos en entrenamiento, zero-shot):

| Modelo | Accuracy | KL ↓ | Brier ↓ |
|---|---|---|---|
| Amos 1 large | 76,1% | 0,126 | 0,069 |
| Microsoft-Decision-1 (pesos cerrados) | 79,5% | 0,318 | no disponible |
| Decider 1 (cifra del propio fabricante) | 76,8% | 0,096 | no disponible |
| Perplexity Decider v1.1 | 73,9% | 0,466 | no disponible |
| Clef (Cloudflare) | 72,5% | 0,191 | no disponible |

Con priors por pregunta ajustados sobre el split de entrenamiento del benchmark: 80,25% (Decider 1: 80,1%).

Otros resultados reportados:

| Benchmark | Resultado |
|---|---|
| Decision Bench (1.071 registros reales, con imágenes, harness oficial) | 94,9% |
| Decision Index 0.3 (parte pública) | 65,11 (knowledge 52,6; language 72,3; retrieval 66,2; tools 79,7; arts 50,0) |
| JevBench público easy / standard / hard | 100,0 / 100,0 / 84,7 |
| Media de diez benchmarks públicos (RAGTruth, JudgeBench, Belebele, WinoGrande, ContractNLI, TruthfulQA, Circa, Financial PhraseBank, TabFact, BBH) | 89,8% |
| AG News / DAIR Emotion / Banking77 (77 etiquetas) | 89,1 / 58,5 / 90,5 |
| Totales de factura citados exactamente | 10/10 |
| RefCOCO, caja centrada en el objeto nombrado | 91,9% |
| RefCOCO, caja que cubre al menos la mitad del objeto | 71,3% |
| COCO, caja centrada en el objeto nombrado | 98,4% |
| Tablero público de visión de Decision Index (8 tareas, pesos del tablero) | 76,69 |
| BLINK, corregido por azar | 65,9 |
| Reranking del top 30 de BM25, nDCG@10 (media de SciFact, NFCorpus, FiQA) | 0,517 |
| Latencia de servidor, mediana, petición de tres preguntas | 122 ms |

En Decision Bench el autor sitúa a Perplexity Decider v1.1 en 94,5%, DeepSeek V4.1 Flash y Gemini 3.5 Flash en 94,2% y Jev 1.13 en 93,8%. No se han publicado resultados independientes en la información disponible; todas las cifras de rivales, salvo Decider 1, fueron ejecutadas por el propio autor.

## Requisitos de hardware

- VRAM estimada: una GPU de 80 GB para inferencia en la configuración documentada (pesos en safetensors de 27B más cabezas y procesador de imagen; el repo ocupa 55,4 GB). No se documentan configuraciones con cuantización ni despliegue en GPUs de menor memoria.
- GPU recomendadas: A100 80 GB, H100 80 GB o equivalentes con 80 GB de memoria. No hay soporte documentado para GPUs de consumo (RTX 4090 de 24 GB, RTX 5090 de 32 GB) en la configuración oficial.
- Despliegue: paquete propio `amos.serve` (Python 3.12, PyTorch 2.14, versiones fijadas a las usadas en la medición), arrancado con `python -m amos.serve amos-1-large --name amos-1-large --device cuda --port 8000 --max-len 131072` y endpoint `/v1/systemone`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 122 ms de mediana en servidor para una petición de tres preguntas, según el autor. No se publica throughput agregado ni latencia bajo carga concurrente.
- El autor describe Amos 1 large como el más lento de los cuatro modelos de la familia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy typed-decisions | KL ↓ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Amos 1 large | 27B | 131.072 | 76,1% (80,25% con priors) | 0,126 | Apache 2.0 | Pesos abiertos en Hugging Face |
| Microsoft-Decision-1 | no disponible | no disponible | 79,5% | 0,318 | no disponible | Pesos cerrados |
| Decider 1 | no disponible | no disponible | 76,8% (80,1% con priors, cifra del fabricante) | 0,096 | no disponible | no disponible |
| Perplexity Decider v1.1 | no disponible | no disponible | 73,9% | 0,466 | no disponible | no disponible |
| Clef (Cloudflare) | no disponible | no disponible | 72,5% | 0,191 | no disponible | no disponible |

En Decision Bench el autor compara con Perplexity Decider v1.1 (94,5%), DeepSeek V4.1 Flash (94,2%), Gemini 3.5 Flash (94,2%) y Jev 1.13 (93,8%), frente al 94,9% de Amos 1 large. No se dispone de datos de parámetros, contexto ni licencia de esos rivales en la información proporcionada.

## Limitaciones y advertencias

- El autor lo señala como el más lento de los cuatro modelos de la familia Amos 1.
- Las citas largas (cláusulas completas, direcciones) pueden devolverse truncadas; no es fiable para extracción de pasajes extensos con tipo `span`.
- Solo inglés: cualquier caso en castellano u otro idioma queda fuera del alcance declarado.
- Requiere una GPU de 80 GB; no hay ruta documentada de cuantización ni despliegue en hardware de consumo, lo que limita su uso en entornos pequeños.
- El API alojada ha cerrado; el único modo de uso es el autoalojamiento con el paquete `serve/`.
- Riesgo de alucinación estructural: el modelo no genera texto, pero puede asignar alta probabilidad a una opción incorrecta en casos ambiguos o fuera de distribución; la calibración reportada (KL 0,126, Brier 0,069) es buena pero no perfecta, y conviene fijar umbrales de abstención en producción.
- No soporta tool calling ni conversación multi-turno en el sentido convencional; la interfaz es un esquema de preguntas por petición.
- Las cifras de benchmarks proceden del autor y, en su mayoría, de ejecuciones propias sobre rivales; no hay validación independiente en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.8-27B puede tener condiciones propias que conviene verificar antes de desplegar.
- El rendimiento en DAIR Emotion (58,5) y en el área de arts de Decision Index (50,0) es notablemente inferior al resto, lo que sugiere debilidad en tareas de emoción y contenido creativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mukaddamzaid/amos-1-large
- Colección de la familia Amos 1: https://huggingface.co/collections/mukaddamzaid/amos-1
- Amos 1 medium: https://huggingface.co/mukaddamzaid/amos-1-medium
- Amos 1 small: https://huggingface.co/mukaddamzaid/amos-1-small
- Amos 1 mini: https://huggingface.co/mukaddamzaid/amos-1-mini
- Documentación: https://amos.scira.ai/docs/
- Instrucciones de autoalojamiento: https://amos.scira.ai/docs/#self-host
- Página del modelo: https://amos.scira.ai/models/amos-1-large/
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Decision Bench: https://decisionbench.ai
- Decision Index (space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
