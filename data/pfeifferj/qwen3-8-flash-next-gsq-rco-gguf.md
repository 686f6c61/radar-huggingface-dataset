# pfeifferj/Qwen3.8-Flash-Next-GSQ-RCO-GGUF

## Resumen

Este repositorio publica una cuantización GGUF no uniforme de Qwen/Qwen3.8-Flash-Next, un modelo multimodal de tipo image-text-to-text, junto con el proyector de visión (mmproj) en BF16. El autor es pfeifferj, una reproducción comunitaria independiente que aplica los métodos GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization), desarrollados en el DASLab del Institute of Science and Technology Austria, a formatos GGUF nativos. Los ficheros no son una release oficial del IST-DASLab y no cuentan con el aval de los autores de los artículos.

El objetivo declarado es ejecutar el modelo base en 2× RTX 3090 manteniendo los embeddings en disco y la caché KV en RAM, con un presupuesto objetivo de 3,5 bits para los pesos principales y los embeddings de token y n-gram retenidos en BF16 en un shard independiente y obligatorio. El shard principal ocupa 47,94 GB, el de embeddings 103,68 GB y el proyector de visión 0,91 GB, sobre un repositorio de 230 GB.

La relevancia del lanzamiento está en su resultado medido: según la model card, la build cuantizada obtiene 58,25 % en MMLU-Pro frente al 55,40 % de la referencia BF16 (diferencia emparejada de +2,85 puntos porcentuales, McNemar bilateral p = 0,0047752), con un aumento de perplejidad del 1,72 % (3,1058 frente a 3,0533). El recuento real de parámetros del modelo base en safetensors es de 125.107.954.560 (≈125,1 B), aunque el TL;DR de la model card menciona "180B"; la discrepancia no se explica en la documentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio no documenta la arquitectura del modelo base; se distribuye como cuantización GGUF más proyector de visión) |
| Parámetros totales | 125.107.954.560 (≈125,1 B) según los safetensors del modelo base; el TL;DR de la model card menciona 180B, discrepancia no aclarada |
| Longitud de contexto | No disponible (las evaluaciones usan topes de 1.024 y 2.048 tokens, que son ajustes de evaluación y no la ventana nativa) |
| Tipos de cuantización | Objetivo de 3,5 bits con tipo asignado por tensor (búsqueda sobre K tipos bajo presupuesto exacto de tamaño); embeddings de token y n-gram en BF16 (16 bpw); mmproj en BF16 (16,17 bpw); el runtime requiere soporte de Qwen4Exp y Q2_0 |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" con license_name qwen-community-1.0) |
| Formato de pesos | GGUF (tres ficheros: pesos principales, embeddings n-gram y mmproj) |

## Arquitectura y entrenamiento

La información disponible describe el proceso de cuantización, no la arquitectura interna del modelo base. El método GSQ realiza cuantización escalar post-entrenamiento que aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajación Gumbel-Softmax. RCO asigna uno de K tipos de cuantización a cada uno de N tensores bajo un presupuesto exacto de tamaño total, reformulado como una variedad riemanniana suave en el espacio de logits. La combinación da lugar a una asignación de precisión por tensor guiada por sensibilidad, con un presupuesto global de 3,5 bits para los pesos principales y exclusión de los embeddings BF16 de ese presupuesto.

El repositorio incluye además el proyector de visión del modelo base en BF16, lo que habilita el uso multimodal. No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que estos datos corresponderían al modelo base y no a esta cuantización. Tampoco se detallan innovaciones de decodificación (especulativa, atención lineal u otras) más allá del esquema de cuantización mixta. El shard de embeddings n-gram en BF16 es obligatorio para el uso del modelo, y las identidades de fichero y la disposición de shards se registran en manifest.json.

## Capacidades

- Generación de texto conversacional: la pipeline declarada es image-text-to-text y el tag "conversational" está presente en la ficha de HuggingFace.
- Procesamiento de imagen y texto: se distribuye un proyector de visión (mmproj) en BF16, lo que permite entrada image-text-to-text.
- Razonamiento: la model card reporta evaluaciones con modo de pensamiento explícito ("xhigh thinking") en GSM8K y respuestas directas en IFEval.
- Matemáticas: se evalúa GSM8K con 8/8 respuestas correctas completadas en ambas builds (BF16 y GSQ-RCO).
- Seguimiento de instrucciones: se evalúa IFEval en modo estricto y completado.
- Conocimiento general y multidisciplinar: se evalúa MMLU-Pro sobre 14 categorías.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado, más allá del modo de pensamiento usado en las evaluaciones.
- Capacidades de audio: no documentadas.

## Casos de uso

- Despliegue de un modelo de gran tamaño en hardware de gama alta de consumo: con el shard principal de 47,94 GB, el autor indica que el modelo puede ejecutarse en 2× RTX 3090 (48 GB de VRAM agregada) manteniendo los embeddings de 103,68 GB en disco y la caché KV en RAM. Es adecuado para laboratorios y desarrolladores que quieren probar un modelo de ~125 B sin acceso a clústeres de A100/H100.
- Investigación sobre cuantización mixta: el repositorio incluye un paquete de evaluación con IDs de pregunta, predicciones por pregunta, ajustes de runtime y notas de reproducibilidad, lo que permite auditar y reproducir la comparación GSQ-RCO frente a BF16 en MMLU-Pro.
- Servicio de inferencia local con llama-server: la build documentada de llama.cpp (commit f3f1a8f, con GGML_CUDA=ON) compila el target llama-server, lo que permite exponer el modelo como endpoint HTTP en una máquina local con dos GPU.
- Tareas de visión-lenguaje en local: el mmproj BF16 de 0,91 GB habilita entrada de imagen junto con texto, útil para prototipos de descripción de imágenes, extracción de información de documentos escaneados o respuesta a preguntas sobre capturas, siempre que se acepte la pérdida de precisión de la cuantización de 3,5 bits en el resto del modelo.
- Evaluación comparativa de calidad de cuantizaciones: sirve como referencia práctica para medir el compromiso entre precisión (MMLU-Pro +2,85 pp frente a BF16 en este caso) y coste de memoria (perplejidad +1,72 %), útil para decidir presupuestos de bits en despliegues propios.
- Procesamiento por lotes de texto de longitud moderada: con los topes de 1.024 y 2.048 tokens usados en las evaluaciones, el modelo se ha probado en contextos de ese orden para perplejidad, IFEval y GSM8K, lo que lo hace apto para tareas de clasificación, resumen corto y generación estructurada en ese rango.
- Pruebas de seguimiento de instrucciones en producción controlada: IFEval estricto se mantiene en 13/16 con la cuantización, por lo que puede emplearse en pipelines donde el cumplimiento de formato sea crítico, asumiendo la advertencia de que una respuesta IFEval quedó truncada en la build cuantizada.

## Benchmarks y rendimiento

MMLU-Pro (sin razonamiento, contexto limitado a 2.048 tokens, respuestas de un solo token " A" a " J", prompts zero-shot sin plantilla de chat, 2.000 preguntas estratificadas en 14 categorías con semilla fija):

| Build | Correctas | Precisión | Error estándar |
|---|---:|---:|---:|
| GSQ-RCO 3,5 bits | 1.165/2.000 | 58,25 % | 1,10 pp |
| Referencia BF16 | 1.108/2.000 | 55,40 % | 1,11 pp |

Diferencia emparejada: +2,85 puntos porcentuales (226 aciertos solo de la versión cuantizada, 169 solo de BF16; McNemar bilateral exacto p = 0,0047752).

Perplejidad y tareas generativas (ocho contextos de 1.024 tokens, 4.088 tokens puntuados, texto retenido disjunto por documento, decodificación greedy, IFEval respondido directamente, GSM8K con pensamiento xhigh, topes de 1.024/2.048 tokens):

| Variante | PPL nativa ↓ | KL aprox./token ↓ | IFEval estricto | IFEval completado correcto | GSM8K completado correcto |
|---|---:|---:|---:|---:|---:|
| Referencia BF16 | 3,0533 | — | 13/16 | 13/16 | 8/8 |
| GSQ-RCO | 3,1058 | 0,111225 | 13/16 | 12/16 | 8/8 |

La KL es aproximada y se calcula a partir de la caché de referencia nativa en uint16. Una respuesta IFEval de la versión cuantizada se truncó.

## Requisitos de hardware

- VRAM para el shard principal: 47,94 GB, lo que encaja ajustadamente en 2× RTX 3090 (48 GB en total) según la indicación del autor.
- Embeddings: el shard de token y n-gram embeddings en BF16 ocupa 103,68 GB y, en el escenario descrito por el autor, reside en disco en lugar de en VRAM.
- Proyector de visión: 0,91 GB en BF16.
- Almacenamiento: el repositorio completo ocupa 230 GB, por lo que se necesita espacio en disco suficiente para los tres ficheros.
- Caché KV: el autor indica que se mantiene en RAM, no en VRAM, en la configuración de referencia de 2× RTX 3090. La RAM necesaria no se especifica.
- GPU recomendadas: RTX 3090 ×2 es la configuración explícitamente mencionada. No se documentan recomendaciones para A100, H100 u otras GPU.
- Cabe en GPU de consumo: sí, según el autor, en 2× RTX 3090. No se indica si cabe en una única GPU de 24 GB.
- Opciones de despliegue: llama.cpp con soporte de Qwen4Exp y Q2_0, fijado al commit f3f1a8f2760f28325a5ec20c05b171e5b7c83a29, compilado con -DGGML_CUDA=ON y el target llama-server. El tag endpoints_compatible está presente en la ficha.
- Compatibilidad con vLLM, Ollama y TGI: no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | PPL nativa | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Qwen3.8-Flash-Next GSQ-RCO 3,5 bits (este repositorio) | 125,1 B (modelo base) | No disponible | 58,25 % | 3,1058 | qwen-community-1.0 | GGUF (3 shards) |
| Qwen3.8-Flash-Next BF16 (referencia) | 125,1 B (modelo base) | No disponible | 55,40 % | 3,0533 | qwen-community-1.0 | Safetensors (modelo base) |
| Otras alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación cuantitativa documentada en la información disponible es contra la referencia BF16 del propio modelo base. No se aportan datos frente a otras cuantizaciones GGUF de terceros ni frente a modelos de tamaño similar de otros autores.

## Limitaciones y advertencias

- Los resultados de MMLU-Pro se obtuvieron sin razonamiento y con un límite de contexto de 2.048 tokens, por lo que no reflejan el rendimiento del modelo con cadenas de pensamiento largas ni con contextos extensos.
- El incremento de perplejidad es del 1,72 % (3,1058 frente a 3,0533) en el conjunto de evaluación descrito; la KL por token es aproximada (0,111225) y se calcula sobre una caché de referencia en uint16.
- Una respuesta IFEval de la build cuantizada quedó truncada, y el IFEval completado correcto baja de 13/16 a 12/16, lo que apunta a posibles degradaciones en tareas de formato estricto.
- Los dos shards de texto son obligatorios: el fichero principal de 3,5 bits no es autosuficiente sin el shard de embeddings n-gram en BF16.
- La etiqueta "3,5 bits" se refiere únicamente al presupuesto objetivo de los pesos principales y excluye los embeddings BF16, por lo que el tamaño efectivo del modelo es mayor que el que sugiere esa cifra.
- Es una reproducción comunitaria independiente: no es una release del IST-DASLab y no cuenta con el aval de los autores de GSQ ni de RCO.
- El runtime requiere una build específica de llama.cpp (commit f3f1a8f) con soporte de Qwen4Exp y Q2_0; otras versiones o backends pueden no cargar los ficheros.
- Requiere 230 GB de almacenamiento y un esquema de despliegue con embeddings en disco y caché KV en RAM; la latencia y el throughput resultantes no se documentan.
- Idiomas soportados no disponibles: no se puede verificar cobertura multilingüe.
- La licencia es qwen-community-1.0, etiquetada como "other" en HuggingFace. No se detallan en la información proporcionada las condiciones concretas de uso comercial, por lo que hay que consultar el fichero LICENSE antes de un despliegue en producción.
- Riesgo de alucinación y sesgos: no se aportan evaluaciones específicas de sesgo ni de veracidad en la información disponible.
- Discrepancia de tamaño no aclarada: el TL;DR menciona un modelo de 180B mientras que los safetensors del modelo base suman 125.107.954.560 parámetros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pfeifferj/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Artículo de GSQ (Gumbel-Softmax Quantization): https://arxiv.org/abs/2604.18556
- Artículo de RCO (Riemannian Constrained Optimization): https://arxiv.org/abs/2605.00649
- Código de GSQ: https://github.com/IST-DASLab/GSQ
- Código de RCO: https://github.com/IST-DASLab/RCO
- Organización DASLab: https://github.com/IST-DASLab
- Commit de llama.cpp requerido: https://github.com/ggml-org/llama.cpp/commit/f3f1a8f2760f28325a5ec20c05b171e5b7c83a29
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- DOI de HuggingFace: doi:10.57967/hf/10398
- Instrucciones de reproducción del runtime: https://huggingface.co/pfeifferj/Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/eval/2026-09-13/reproducibility/README.md
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces encontrados no guardan relación con la ficha.
