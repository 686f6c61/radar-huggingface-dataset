# ilovemugi/mugi-decision

## Resumen

Mugi Decision es un modelo derivado de Qwen/Qwen3.5-0.8B desarrollado por el usuario ilovemugi que no genera texto: reformula el backbone textual de Qwen3.5 como un **puntuador de candidatos**. Recibe una descripción de problema más una lista variable de opciones y devuelve una puntuación escalar para cada una, normalizada con softmax dentro del conjunto de candidatos. Sustituye la proyección de vocabulario por una cabeza escalar compartida y añade seis tokens especiales que delimitan la descripción, la enumeración de opciones y el candidato actual.

Tiene 752.394.048 parámetros (aproximadamente 752M) en 24 capas de decodificador de texto, con un checkpoint BF16 de 1,5 GB que ya lleva fusionada la LoRA del entrenamiento. La arquitectura hereda del backbone de Qwen3.5 su decodificador híbrido (DeltaNet más atención completa) y elimina el codificador visual y la proyección de vocabulario. No es un modelo de chat: la model card indica explícitamente que no debe usarse `apply_chat_template` ni `generate`.

Su relevancia práctica está en la categoría de reranking y decisión sobre conjuntos cerrados: sirve para elegir entre alternativas en pipelines de agentes, RAG o evaluación de exámenes, con soporte de dos idiomas (chino e inglés) y licencia Apache 2.0. El autor publica además rutas optimizadas para ROCm en Windows, con un aumento declarado de aproximadamente 2,76 veces en latencia de precalentamiento respecto a la implementación de referencia con caché de prefijo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de decodificador de texto híbrido (DeltaNet + atención completa) con cabeza escalar compartida para puntuación de candidatos; sin proyección de vocabulario |
| Parámetros totales | 752.394.048 (aproximadamente 752M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el autor declara un límite de 1024 tokens por rama durante el entrenamiento; la ventana máxima del backbone no se especifica) |
| Tipos de cuantización | No disponible (el repositorio publica únicamente un checkpoint BF16; no se incluyen GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, LoRA fusionada); código de arquitectura personalizado en configuration_mugi.py y modeling_mugi.py |

## Arquitectura y entrenamiento

El modelo parte del backbone textual de Qwen3.5-0.8B, un decodificador híbrido que combina capas DeltaNet con capas de atención completa. La modificación principal es la eliminación del codificador visual y de la proyección de salida sobre el vocabulario, reemplazadas por una cabeza lineal compartida que proyecta el estado oculto del último token válido de cada rama a un escalar. La entrada se serializa con seis tokens especiales independientes del tokenizer (`<|desc_begin|>`, `<|desc_end|>`, `<|enum_begin|>`, `<|enum_end|>`, `<|current_begin|>`, `<|current_end|>`), y cada candidato se codifica como sufijo de un prefijo común que contiene la descripción y la lista de opciones. La normalización se realiza con softmax únicamente sobre el conjunto de candidatos presente, por lo que la dimensión de la cabeza no depende del número de opciones (mínimo dos candidatos).

En inferencia, el prefijo se calcula una sola vez y cada rama replica el estado K/V de atención, el estado recurrente FP32 de DeltaNet y el historial de convolución, tras lo cual las ramas se puntúan en lotes paralelos. Cualquier cambio en la lista de opciones invalida el prefijo común y obliga a recalcularlo. El entrenamiento se hizo con la secuencia completa y con gradientes completos, sin caché de prefijo con gradiente separado.

El ajuste fino publicado corresponde a la iteración "mixed400": 400.000 preguntas desduplicadas de 65 fuentes (160.000 en chino y 240.000 en inglés), con LoRA de rango 16, alpha 32 y dropout 0.05 aplicada a la cabeza de puntuación, a los embeddings de los seis tokens especiales y a las capas de atención y MLP. Se entrenó en BF16 durante 3 épocas, con 75.000 actualizaciones en total, batch efectivo de 16 y tasa de aprendizaje inicial de 5e-5. La selección de checkpoint se hizo por exactitud macro media de chino e inglés sobre un conjunto de validación fijo, y la versión publicada es la de la época 2 (paso 50.000), no la del final del entrenamiento.

## Capacidades

- Puntuación y selección entre conjuntos variables de candidatos, con salida de `selected_id`, puntuación y probabilidad softmax por candidato.
- Clasificación de opción múltiple y decisión cerrada, útil como reranker de respuestas generadas por otros modelos.
- Reranking de documentos o respuestas candidatas en pipelines de recuperación.
- Comprensión de instrucciones y enunciados en chino e inglés, incluidas preguntas de tipo académico (ARC, MMLU, C-Eval, CMMLU, SciQ, AQuA, LogiQA2-zh, PubMedQA, SecQA-v2 en la evaluación del autor).
- Manejo de contextos de entrada relativamente largos en el prefijo común (el ejemplo medido por el autor usa 575 tokens de prefijo con 6 candidatos).
- Inferencia con backends CUDA y, en Windows, kernels HIP para ROCm con rutas de optimización conmutables (`none`, `hip`, `fast`).
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, visión ni audio: la cabeza de salida no produce tokens.

## Casos de uso

- Reranking en RAG: dado un contexto y varias respuestas candidatas generadas por un modelo mayor, Mugi Decision puntúa cada una y devuelve la mejor; su coste de 752M parámetros permite ejecutarlo como segunda etapa barata sobre decenas de candidatos.
- Selección de acciones en agentes: con un estado descrito en texto y un conjunto de acciones posibles (por ejemplo, "consultar logs", "reiniciar servicio", "escalar a un humano"), el modelo ordena las opciones y aporta una decisión trazable con puntuaciones comparables dentro del mismo conjunto.
- Evaluación automática de exámenes y benchmarks: al ser un clasificador de opción múltiple, puede corregir conjuntos tipo ARC, MMLU, C-Eval o CMMLU sin generación, reduciendo el coste frente a un modelo generativo del mismo orden de tamaño.
- Triaje y enrutado en soporte técnico: clasificar una incidencia descrita en lenguaje natural en una de las colas o procedimientos predefinidos, recalculando el prefijo cuando cambie el catálogo de opciones.
- Filtrado de candidatos en generación de código: puntuar varios parches, fragmentos o nombres de API propuestos y elegir el más coherente con la descripción del problema antes de aplicar cambios en un pipeline de CI.
- Anotación asistida de datos: preetiquetar conjuntos de decisión con múltiples opciones para revisión humana posterior, aprovechando que la salida incluye puntuaciones continuas y no solo la etiqueta ganadora.
- Selección de herramienta o endpoint: cuando un sistema expone un catálogo cerrado de herramientas descritas textualmente, el modelo puede puntuar cuál encaja mejor con la petición, siempre que la decisión se reformule como elección entre candidatos y no como generación de una llamada.
- Comparación A/B de respuestas: ordenar dos o más variantes de una respuesta editorial o de marketing según la descripción del objetivo, con la advertencia de que las probabilidades no están calibradas.

## Benchmarks y rendimiento

El autor publica resultados sobre conjuntos propios congelados, no sobre listas oficiales completas.

Conjunto de validación fijo de 6.144 preguntas:

| Época | Exactitud total | Chino | Inglés | Pérdida de validación |
|---|---:|---:|---:|---:|
| 1 | 75,54 % | 74,41 % | 76,29 % | 0,5802 |
| 2 (seleccionada) | 76,63 % | 76,00 % | 77,05 % | 0,6327 |
| 3 | 76,37 % | 75,22 % | 77,13 % | 1,1754 |

Conjunto de prueba independiente fijo de 2.048 preguntas (819 en chino y 1.229 en inglés):

| Modelo | Exactitud total | Chino | Inglés |
|---|---:|---:|---:|
| Mejor modelo de la primera ronda (150k) | 61,38 % | 58,73 % | 63,14 % |
| mixed400, época 2 (publicado) | 64,99 % | 62,64 % | 66,56 % |

El modelo publicado acierta 1.331 de esas 2.048 preguntas. Las tareas incluidas en esa prueba son ARC, C3, MMLU-Pro, MMLU, C-Eval, SecQA-v2, SciQ, CMMLU, LogiQA2-zh, PubMedQA labeled y AQuA, y no cubren todas las tareas añadidas posteriormente. La mezcla de tareas del conjunto de prueba difiere de la del conjunto de validación, por lo que la diferencia entre ambos totales no debe interpretarse directamente como sobreajuste. El autor advierte además que los datos de preentrenamiento del modelo base no son auditables por completo y que la desduplicación aplicada no garantiza la ausencia de contaminación.

Rendimiento de inferencia medido en una RX 7900 XTX con ROCm en Windows, sobre una pregunta larga de Minecraft con prefijo de 575 tokens y 6 candidatos:

| Implementación | Primera puntuación | Mediana en caliente |
|---|---:|---:|
| LoRA original con caché de prefijo | 8,36 s | 144 ms |
| HIP + fusión de memoria + proyecciones empaquetadas | 0,47 s | 52 ms |

El autor reporta una mejora de aproximadamente 2,76 veces en la mediana en caliente, sin contar la carga del modelo ni el tokenizer. La primera compilación de HIPRTC añade un coste puntual que después se sirve desde caché local. Los benchmarks se hicieron con la LoRA sin fusionar en BF16 y con el orden de opciones fijo y sin conexión; los pesos publicados llevan la LoRA fusionada, lo que introduce diferencias de redondeo que no se han vuelto a medir sobre el conjunto de prueba completo. Una regresión local sobre 128 preguntas de 70 fuentes de validación más una pregunta larga manual dio coincidencia en la primera opción en 127 de 129 casos, con dos discrepancias correspondientes a preguntas cuya diferencia original entre las dos primeras opciones era de 0,015625 puntos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 1,5 GB; con activaciones, estados recurrentes de DeltaNet y caché de prefijo, el uso total se sitúa en el rango de 2 a 4 GB para prefijos de varios cientos de tokens, y crece con el número de candidatos porque cada rama replica su propio estado K/V y su historial de convolución.
- El CLI incluido exige una GPU con soporte de BF16 y no cae automáticamente a CPU.
- GPU de consumo: cabe con holgura en tarjetas de 8 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090, RX 7900 XTX). El autor ha validado explícitamente Windows sobre gfx1100 (RX 7900 XTX) con ROCm.
- GPU de datacenter: A100, H100 y similares son compatibles por la vía CUDA de PyTorch, pero el autor no publica cifras de latencia ni throughput para esas tarjetas. Además advierte que, sin FLA y causal-conv1d instalados en CUDA, se usan operadores de referencia más lentos y esa ruta no debe tomarse como rendimiento optimizado para H100.
- Opciones de despliegue: scripts propios del repositorio (`scripts/try_model.py`, `scripts/infer.py`, con entrada JSON o JSONL) y carga mediante `AutoModel` con `trust_remote_code=True` y `attn_implementation="sdpa"`. No hay soporte confirmado para vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia estándar, dado que la arquitectura es personalizada y no genera tokens.
- Modalidades de optimización: `--optimization none` (implementación de referencia), `--optimization hip` (mantiene rutas separadas y activa los núcleos HIP) y `--optimization fast` (HIP más proyecciones empaquetadas). Los núcleos HIP solo están disponibles para ROCm en Windows; en CUDA se usa la ruta de PyTorch.
- Latencia de referencia: 52 ms de mediana en caliente por consulta de 575 tokens de prefijo con 6 candidatos en RX 7900 XTX, según los datos del autor.

## Comparativa con modelos similares

No se dispone de datos verificados sobre los modelos alternativos en la información proporcionada, por lo que la comparación es cualitativa y de categoría.

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ilovemugi/mugi-decision | Decodificador híbrido con cabeza escalar de decisión (no generativo) | 752M | No disponible (límite de entrenamiento de 1024 tokens por rama) | zh, en | Apache 2.0 | HuggingFace con código de arquitectura personalizado |
| Qwen/Qwen3.5-0.8B | Modelo base multimodal generativo del que deriva | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Rerankers de propósito general (por ejemplo, familia BGE-reranker o Qwen3-Reranker) | Cross-encoder de puntuación de pares consulta-documento | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Clasificadores de opción múltiple basados en BERT/RoBERTa | Encoder con cabeza de clasificación de dimensión fija | No disponible | No disponible | No disponible | No disponible | HuggingFace |

La diferencia funcional relevante frente a un clasificador de opción múltiple convencional es que Mugi Decision no fija la dimensión de la cabeza al número de opciones: puntúa conjuntos de tamaño variable y devuelve una distribución relativa dentro de cada conjunto. Frente a un cross-encoder de reranking, comparte la idea de puntuar candidatos contra un contexto, pero reutiliza el prefijo común con caché explícita y admite listas de opciones serializadas en texto.

## Limitaciones y advertencias

- Las probabilidades de salida son puntuaciones softmax relativas dentro del conjunto de candidatos y no probabilidades calibradas de acierto. No deben usarse como umbral de confianza absoluto.
- La puntuación depende de la redacción de las opciones, de su orden, del número de candidatos y de la distribución del contexto. Cambiar la lista de opciones obliga a recalcular el prefijo completo.
- El entrenamiento limitó la longitud de las ramas a 1024 tokens. Que los scripts acepten entradas más largas no implica que el comportamiento en contextos extensos esté validado.
- El modelo no garantiza corrección factual ni planificación compleja a largo plazo; la model card lo limita explícitamente a investigación en decisión múltiple, ordenación de candidatos y clasificación ligera.
- No genera texto, no soporta llamadas a herramientas ni agentes multi-paso, y no debe usarse con `apply_chat_template` ni con `generate`. Tampoco dispone de `chat_template.jinja` en el repositorio.
- Requiere `trust_remote_code=True` para cargarse, ya que incluye código de arquitectura personalizado; conviene revisar `configuration_mugi.py` y `modeling_mugi.py` antes de usarlo en producción.
- La validación se hizo sobre subconjuntos propios congelados y no sobre listas oficiales completas, y el autor reconoce que no puede auditar por completo los datos de preentrenamiento del modelo base, por lo que no se descarta contaminación.
- Los resultados publicados corresponden a la LoRA sin fusionar; los pesos liberados llevan la LoRA fusionada y no se ha repetido el conjunto de prueba completo con todas las modalidades de ejecución disponibles.
- No hay cuantizaciones publicadas, de modo que el despliegue en hardware limitado exige convertir el checkpoint BF16 por cuenta propia y verificar que la arquitectura personalizada funciona tras la conversión.
- El autor indica que las optimizaciones están pensadas para su propia GPU AMD: los núcleos HIP son específicos de ROCm en Windows y la ruta CUDA sin FLA ni causal-conv1d usa operadores de referencia más lentos.
- La licencia Apache 2.0 permite uso comercial, pero al ser una obra derivada no oficial de Qwen3.5-0.8B, conviene verificar las condiciones aplicables al modelo base antes de distribuirlo en productos.
- El modelo solo está entrenado y evaluado en chino e inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ilovemugi/mugi-decision
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Esquema de arquitectura en el repositorio: docs/figures/mugi-decision-architecture.svg (y versión en inglés docs/figures/mugi-decision-architecture.en.svg)
- Código de arquitectura personalizada: configuration_mugi.py y modeling_mugi.py
- Scripts de inferencia: scripts/try_model.py, scripts/infer.py y mugi_decision/encoding.py
- Búsqueda web: los resultados obtenidos no guardan relación con el modelo y no aportan enlaces utilizables (papers, blogs, repositorios o demos). No se dispone de otras referencias externas en la información proporcionada.
