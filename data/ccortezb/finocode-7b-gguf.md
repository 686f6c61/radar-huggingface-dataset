# ccortezb/FinoCode-7B-GGUF

# FinoCode-7B-GGUF

## Resumen

FinoCode-7B-GGUF es la versión cuantizada en formato GGUF de un ajuste fino (fine-tune) sobre el modelo Qwen2.5-Coder-7B-Instruct, publicado por el usuario ccortezb en Hugging Face. El repositorio contiene únicamente dos cuantizaciones, Q6_K y Q4_K_M, y un Modelfile para Ollama, con un tamaño total de 10,9 GB. El autor indica que tanto el entrenamiento como la conversión a GGUF se realizaron con Unsloth, y proporciona comandos de uso directo con `llama-cli` y `llama-mtmd-cli` mediante `--jinja`.

El modelo resuelve el caso típico de quien quiere ejecutar un asistente de código especializado en local, sin GPU de datacenter y sin depender de una API: al derivar de Qwen2.5-Coder-7B-Instruct, hereda la arquitectura Qwen2 (transformer decoder-only con GQA) y sus 7.615.616.512 parámetros, un tamaño que cabe en GPUs de consumo con cuantización de 4 bits. Frente al modelo base, el valor añadido declarado es el ajuste fino; sin embargo, la model card no especifica el conjunto de datos, los hiperparámetros ni los resultados obtenidos.

La relevancia es limitada y hay que leerla con cautela: el repositorio no declara licencia, no declara pipeline, no declara idiomas, acumula 0 descargas y 0 likes en el momento de la consulta, y sus metadatos de creación y actualización (24 de octubre de 2026) no permiten verificar antigüedad ni mantenimiento. Es un artefacto interesante como ejemplo de flujo Unsloth → GGUF, pero sin evidencia pública de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen2, derivado de Qwen2.5-Coder-7B-Instruct (no declarada explícitamente en la model card) |
| Parámetros totales | 7.615.616.512 (~7,6 B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-Coder-7B-Instruct declara 32.768 tokens nativos (ampliables a 131.072 con YaRN) |
| Tipos de cuantización | GGUF Q6_K y Q4_K_M (solo estos dos ficheros) |
| Idiomas soportados | No disponible; el modelo base se distribuye como multilingüe (inglés, chino y otros, incluido el español) |
| Licencia | No disponible; la model card no la declara (el modelo base Qwen2.5-Coder-7B-Instruct se publica bajo Apache 2.0) |
| Formato de pesos | GGUF (llama.cpp) + Modelfile de Ollama; no se publican safetensors en este repo |

Otros datos del repositorio: tags `gguf`, `qwen2`, `llama.cpp`, `unsloth`, `endpoints_compatible`, `region:us`, `conversational`; tamaño del repo 10,9 GB; pipeline no declarado; 0 descargas y 0 likes.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: transformer decoder-only autorregresivo con normalización RMSNorm, activación SwiGLU en la FFN, embeddings de posición rotatorios (RoPE) y atención con cabecillas KV compartidas (GQA). En la configuración de Qwen2.5-Coder-7B esto se traduce en 28 capas, dimensión oculta de 3584, 28 cabezas de atención con 4 cabezas KV y un vocabulario de 151.936 tokens. Según la propia model card, el ajuste fino se realizó con Unsloth y la conversión a GGUF también se hizo con las herramientas de Unsloth, lo que en la práctica implica un entrenamiento con adaptadores de bajo rango (LoRA/QLoRA) sobre los pesos del modelo base. No se detalla si hubo fases de RLHF o DPO.

La información sobre datos de entrenamiento es inexistente: no se indica el número de tokens, la composición del corpus, el dominio (código, instrucciones generales, conversación) ni los parámetros del ajuste. Los nombres de los ficheros (`Qwen2.5-Coder-7B-Instruct.Q4_K_M.gguf` y `Qwen2.5-Coder-7B-Instruct.Q6_K.gguf`) conservan la denominación del modelo base, lo que sugiere que el proceso de conversión no renombró los tensores, pero no permite inferir la magnitud del ajuste. Tampoco se documenta ninguna innovación técnica propia (decodificación especulativa, atención lineal, modo de razonamiento).

## Capacidades

- Generación de código en múltiples lenguajes y explicación de fragmentos existentes, heredadas del modelo base ajustado.
- Conversación multi-turno con rol de asistente (tag `conversational`); la plantilla de chat esperada es ChatML, activable con `--jinja` en llama.cpp.
- Completado y reescritura de código, generación de tests unitarios y de documentación técnica.
- Instrucciones en lenguaje natural sobre bases de código: localización de errores, propuestas de refactorización.
- Soporte de tool calling / function calling heredado de la familia Qwen2.5-Coder-Instruct, siempre que la plantilla de chat se aplique correctamente.
- Capacidad de operar como backend de agentes multi-paso (planificación → llamada a herramienta → respuesta) usando el servidor de llama.cpp u Ollama.
- Multilingüismo: no declarado en este repo; el modelo base cubre inglés, chino y un conjunto amplio de idiomas, incluido el español.
- Sin capacidades multimodales: la mención a `llama-mtmd-cli` de la model card es texto genérico de la plantilla de Unsloth y no implica que este repositorio incluya proyector visual o de audio.
- No se documentan modos especiales (thinking mode, visión, audio) ni decodificación especulativa.

## Casos de uso

- Asistente de código en el IDE: servir el Q4_K_M con `llama-server` o Ollama y conectarlo a un plugin tipo Continue o similar; el tamaño de 4,7 GB de pesos permite mantenerlo residente en una GPU de 12 GB junto con el resto del entorno.
- Revisión automática de pull requests: enviar el diff junto con el contexto del fichero (hasta varios miles de tokens) y pedir un informe de riesgos; útil para detectar patrones repetidos antes de la revisión humana.
- Generación de tests unitarios en CI: invocar el modelo desde un job que reciba el módulo modificado y produzca esqueletos de test ejecutables, dejando la validación final al pipeline de tests.
- Migración de código entre lenguajes o frameworks: traducción de módulos pequeños (por ejemplo, scripts de Python a TypeScript) con instrucciones explícitas de estilo, aprovechando la ventana de contexto heredada del base.
- Documentación técnica automatizada: generar docstrings y páginas de referencia a partir del código fuente en un proceso batch nocturno, ejecutado en CPU si no hay GPU disponible.
- Entornos aislados o air-gapped: al ser un único fichero GGUF con llama.cpp estático, se puede desplegar en máquinas sin conexión externa, algo habitual en equipos de desarrollo con requisitos de confidencialidad.
- Formación y soporte a desarrolladores junior: explicación de mensajes de error de compilador y de trazas de pila, con conversación iterativa sobre el mismo fragmento de código.
- Backend de agentes internos: usar el tool calling para consultar APIs de documentación o sistemas de tickets, manteniendo el estado de la conversación en el orquestador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye HumanEval, MBPP, MMLU, GSM8K ni ninguna otra métrica, y tampoco se han encontrado evaluaciones de terceros. No se trasladan aquí las cifras publicadas del modelo base porque un ajuste fino sin datos de entrenamiento declarados puede alterarlas de forma sustancial en cualquier dirección.

## Requisitos de hardware

- Pesos en disco: Q4_K_M aproximadamente 4,7 GB y Q6_K aproximadamente 6,3 GB (estimación a partir de los 7.615.616.512 parámetros y del tamaño total del repo, 10,9 GB); el repositorio no publica los tamaños exactos por fichero.
- Caché KV: unos 56 KB por token en precisión f16 (28 capas × 4 cabezas KV × 128 dimensiones × 2 tensores × 2 bytes), es decir, aproximadamente 0,45 GB con 8.000 tokens y 1,8 GB con 32.000 tokens.
- VRAM estimada: Q4_K_M cabe en 8 GB de VRAM con contexto moderado (4-8k); Q6_K requiere 10-12 GB para trabajar con holgura. Para contextos de 32k conviene sumar 2 GB adicionales a la estimación de pesos.
- GPU de consumo: sí. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 son adecuadas; en 8 GB solo con Q4_K_M y contexto recortado.
- GPU de datacenter: A100 40/80 GB o H100 para servir varias réplicas o lotes grandes; no obstante, al no publicarse safetensors, el despliegue con vLLM o TGI no es directo.
- CPU: inferencia viable solo en CPU con Q4_K_M; el rendimiento esperado es de pocos tokens por segundo, sin cifras oficiales.
- Opciones de despliegue: `llama-cli -hf ccortezb/FinoCode-7B-GGUF --jinja`, `llama-server`, Ollama mediante el Modelfile incluido, LM Studio y cualquier frontend compatible con GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones y no hay informes de terceros.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus fichas públicas respectivas, no de este repositorio.

| Modelo | Parámetros | Contexto | Licencia | Formatos publicados | Notas |
|---|---|---|---|---|---|
| FinoCode-7B-GGUF | 7,6 B | No declarado (base: 32.768) | No declarada | GGUF Q6_K, Q4_K_M | Fine-tune sin dataset ni benchmarks; 0 descargas |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Safetensors, GGUF oficial | Modelo base, con evaluación publicada por el autor |
| CodeLlama-7B-Instruct | 6,7 B | 16.384 | Licencia comunitaria de Llama 2 | Safetensors, GGUF | Más antiguo, sin tool calling nativo ni ventana tan amplia |
| Granite-8B-Code-Instruct | 8 B | 128.000 | Apache 2.0 | Safetensors, GGUF | Alternativa de IBM con contexto largo y licencia permisiva |

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita en el repositorio no se puede asumir uso comercial permitido, aunque el modelo base sea Apache 2.0. Es necesario contactar con el autor o verificar los metadatos de Hugging Face antes de cualquier despliegue en producción.
- Ausencia total de evaluación: no hay benchmarks, ni comparación con el modelo base, ni descripción del dataset de ajuste, por lo que no se puede saber si el fine-tune mejora o degrada las capacidades originales.
- Riesgo de olvido catastrófico y de sobreajuste al dominio del corpus de ajuste, desconocido; también de sesgos introducidos por ese corpus.
- Adopción nula (0 descargas, 0 likes) y fechas de creación y actualización en octubre de 2026: no hay señales de mantenimiento ni de validación por parte de la comunidad.
- Solo se publican dos cuantizaciones: quien necesite Q8_0, Q5_K_M o Q3_K_M tendrá que convertirlas por su cuenta a partir de unos pesos que no están en el repo.
- Sin safetensors: no se puede servir con vLLM o TGI, ni reanudar el entrenamiento, ni auditar los pesos originales.
- La ventana de contexto efectiva de estas cuantizaciones no está verificada; los 32.768 tokens son un dato del modelo base y requieren comprobar que la plantilla y la configuración de llama.cpp la respetan.
- Alucinación de APIs y librerías: riesgo habitual en modelos de código; el código generado puede compilar y ser semánticamente incorrecto. Requiere tests y revisión humana.
- La cuantización Q4_K_M degrada especialmente tareas sensibles a la precisión de tokens, como nombres exactos de funciones o firmas de API; para esos casos conviene Q6_K.
- Idiomas no declarados: el comportamiento en español no está garantizado por el autor, aunque el modelo base lo soporte.
- La plantilla de la model card incluye comandos para modelos multimodales que no aplican a este repositorio; no debe interpretarse como soporte de visión.
- No hay información sobre sesgos específicos del ajuste; los del modelo base (predominio de Python y JavaScript en el corpus, menor calidad en lenguajes de nicho) son el punto de partida razonable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ccortezb/FinoCode-7B-GGUF
- Modelo base Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Unsloth (herramienta de ajuste fino y conversión citada por el autor): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF y comandos `llama-cli` / `llama-server`): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo del autor: no disponibles; la búsqueda web realizada no devolvió resultados relacionados con el modelo.
