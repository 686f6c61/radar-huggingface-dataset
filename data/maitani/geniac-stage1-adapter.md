# Maitani/geniac-stage1-adapter

## Resumen

Maitani/geniac-stage1-adapter es un adaptador LoRA publicado en HuggingFace mediante la librería PEFT y entrenado con SFT (supervised fine-tuning) usando TRL y Unsloth. No es un modelo autónomo: los pesos distribuidos corresponden únicamente al adaptador (repositorio de 0,5 GB), que debe aplicarse sobre el modelo base unsloth/Qwen3-4B-Base-unsloth-bnb-4bit, una versión cuantizada en 4 bits del Qwen3-4B-Base de Alibaba Qwen, un transformer decoder-only de aproximadamente 4 000 millones de parámetros.

El interés del recurso es acotado y experimental. Por un lado, demuestra un flujo de trabajo estándar y de bajo coste para adaptar un modelo de 4B en una GPU de gama media (Unsloth + TRL + PEFT). Por otro, la model card es la plantilla por defecto de HuggingFace sin rellenar: no declara licencia, idiomas, dataset, hiperparámetros de entrenamiento ni evaluación. A fecha de actualización (16 de octubre de 2026) acumula 28 descargas y 0 likes, y el tag `arxiv:1910.09700` apunta al artículo del calculador de impacto de carbono citado en la propia plantilla, no a un paper del modelo.

En consecuencia, esta ficha documenta lo que se puede verificar (identificadores, base, framework, tamaño de repositorio) y marca explícitamente como "no disponible" todo lo que el autor no ha publicado, incluida cualquier afirmación de calidad o rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; el modelo base es Qwen3-4B-Base. El adaptador no define arquitectura propia |
| Parámetros totales | Adaptador: no disponible (repositorio de 0,5 GB). Modelo base: ~4 000 millones (denominación 4B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador. El modelo base Qwen3-4B-Base declara 32 768 tokens nativos según su documentación pública oficial |
| Tipos de cuantización | Modelo base en bitsandbytes 4-bit (`unsloth/Qwen3-4B-Base-unsloth-bnb-4bit`). El adaptador se distribuye en safetensors. No se documentan versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles (no declarados en la model card ni en los tags) |
| Licencia | No disponible (la model card no la especifica; el modelo base Qwen3-4B-Base se publica bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT, librería `peft`, PEFT 0.21.1) |
| Modelo base | unsloth/Qwen3-4B-Base-unsloth-bnb-4bit |
| Pipeline | text-generation |
| Etiquetas | peft, lora, sft, transformers, trl, unsloth, conversational |
| Tamaño del repositorio | 0,5 GB |
| Fecha de creación / actualización | 14/10/2026 / 16/10/2026 |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un adaptador LoRA entrenado con SFT sobre Qwen3-4B-Base. Las herramientas declaradas en los tags y en el campo `library_name` son PEFT, TRL, Transformers y Unsloth, lo que sugiere un entrenamiento de tipo `SFTTrainer` con las optimizaciones de memoria de Unsloth sobre el modelo base ya cuantizado en 4 bits con bitsandbytes. La versión de PEFT declarada en la model card es 0.21.1.

No hay ningún dato publicado sobre la composición del dataset, el número de tokens de entrenamiento, el rango y alpha del LoRA, la tasa de aprendizaje, el número de épocas, la precisión usada ni la existencia de fases posteriores de alineamiento (RLHF, DPO u otras). El nombre del repositorio ("stage1-adapter") sugiere una primera etapa de un pipeline de ajuste por fases, pero la model card no lo confirma ni lo describe. Tampoco se documentan innovaciones técnicas propias, decodificación especulativa, atención lineal ni ninguna modificación sobre la arquitectura del modelo base.

## Capacidades

- Generación de texto: capacidad heredada del modelo base Qwen3-4B-Base y del ajuste SFT recibido; no está documentada ni evaluada en la información disponible.
- Conversación: el repositorio incluye el tag `conversational`, lo que apunta a datos de diálogo multi-turno, pero no hay ejemplos, plantilla de chat ni evaluación publicados.
- Tool calling / function calling: no documentado. No hay evidencia de entrenamiento específico para llamada a funciones.
- Agentes y razonamiento multi-paso: no documentado. No debe asumirse esta capacidad sin validación.
- Capacidades multilingües: no documentadas. Dependerían del modelo base y del dataset de SFT, ninguno de los cuales se especifica.
- Modo "thinking" o razonamiento extendido: no disponible. El base empleado es Qwen3-4B-Base, no una variante de razonamiento.
- Visión, audio u otras modalidades: no disponibles. El base es un modelo de texto.
- Relleno de huecos (infilling), embedding o reranking: no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales de dominio específico: partiendo del adaptador y de datos propios, se puede iterar un asistente vertical con un presupuesto de cómputo bajo, ya que el modelo base en 4 bits ocupa pocos gigabytes de VRAM. Requiere validar previamente la calidad del adaptador, que no está evaluada.
- Investigación en técnicas PEFT: sirve como referencia reproducible de un pipeline Unsloth + TRL + PEFT 0.21.1 sobre Qwen3-4B, útil para comparar rangos de LoRA, datasets o estrategias de cuantización.
- Servicio multi-adaptador sobre una sola instancia del base: plataformas como vLLM permiten cargar varios adaptadores LoRA sobre el mismo modelo base, de modo que este adaptador podría convivir con otros especializados, reduciendo el coste por tarea.
- Generación de datos sintéticos y aumento de dataset: el modelo puede usarse para etiquetar o parafrasear corpus internos antes de filtrar y revisar manualmente, siempre con verificación humana por el riesgo de alucinación.
- Clasificación y extracción de información en pipelines internos: con un ajuste adicional sobre datos etiquetados, un modelo de 4B es suficiente para tareas de extracción de entidades o categorización de tickets, con latencia baja.
- Evaluación comparativa de adaptadores de bajo coste: como etapa previa a un despliegue mayor, permite medir si el SFT aporta mejoras frente al base antes de invertir en entrenamientos más caros.
- Entornos educativos y de formación interna: permite desplegar un asistente de consulta sobre documentación corporativa en hardware de gama media, con datos que no salgan de la organización.
- Experimentación académica sobre sesgos y seguridad: el bajo coste de entrenamiento facilita estudiar cómo el SFT modifica el comportamiento del modelo base en dominios sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con el marcador `[More Information Needed]` en todos los apartados (datos de test, métricas y resultados), y no hay tablas comparativas, ni MMLU, ni HumanEval, ni GSM8K, ni ninguna otra métrica.

## Requisitos de hardware

- El adaptador no se puede ejecutar de forma aislada: requiere cargar el modelo base unsloth/Qwen3-4B-Base-unsloth-bnb-4bit y aplicar el LoRA con PEFT.
- Estimación para el modelo base en 4 bits (bitsandbytes): en torno a 2,5-3 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV, que crece con la longitud de contexto. Cifra estimada a partir del tamaño del modelo, no publicada por el autor.
- Estimación para el modelo base en bf16/fp16: en torno a 8-9 GB de VRAM para los pesos. Cifra estimada, no publicada por el autor.
- GPU de consumo: cabe en tarjetas de 8 GB o más en 4-bit con contextos moderados (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). En GPUs de 6 GB puede requerir reducir el contexto o descargar capas a CPU.
- GPU de centro de datos: A100, H100, L40S o similares son sobredimensionadas para un modelo de este tamaño, salvo que se busque alto throughput mediante batching o servir varios adaptadores a la vez.
- Opciones de despliegue: Transformers + PEFT (ruta directa), vLLM con soporte LoRA (`--enable-lora`), TGI con adaptadores, y llama.cpp/Ollama tras fusionar el adaptador con `merge_and_unload` y convertir a GGUF (no hay GGUF publicado en el repositorio).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, TTFT ni consumo de memoria en la información proporcionada.
- Almacenamiento: el repositorio del adaptador ocupa 0,5 GB; hay que sumar el espacio del modelo base.

## Comparativa con modelos similares

Los valores de los modelos comparativos proceden de sus fichas públicas; los de este adaptador figuran como no disponibles cuando el autor no los publica.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|---|
| Maitani/geniac-stage1-adapter | Adaptador LoRA con SFT sobre Qwen3-4B-Base | No disponible (base de ~4B) | No disponible | No disponible | 28 descargas, 0 likes, sin benchmarks |
| Qwen3-4B-Base | Modelo base preentrenado | ~4B | 32 768 tokens nativos según su ficha oficial | Apache 2.0 | Requiere ajuste para seguir instrucciones; es el punto de partida del adaptador |
| Qwen3-4B-Instruct-2507 | Modelo ajustado para instrucciones | ~4B | Consultar ficha oficial de Qwen | Apache 2.0 | Alternativa lista para uso conversacional, sin entrenamiento adicional |
| Otros adaptadores LoRA sobre Qwen3-4B en HuggingFace | Adaptadores PEFT | No aplica | Heredado del base | Variable según autor | No se dispone de una comparativa publicada con este adaptador concreto |

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica licencia. Aunque el modelo base Qwen3-4B-Base se distribuye bajo Apache 2.0, el régimen aplicable al adaptador es incierto. Conviene contactar con el autor antes de cualquier uso comercial o en producción.
- Model card vacía: todos los apartados relevantes (descripción, datos de entrenamiento, hiperparámetros, evaluación, impacto ambiental) contienen el marcador `[More Information Needed]`. No hay información verificable sobre el proceso de entrenamiento.
- Ausencia total de evaluación: no hay benchmarks, ni evaluación cualitativa, ni comparación con el modelo base. No se puede afirmar que el adaptador mejore al base en ninguna tarea.
- Modelo base preentrenado, no instruct: al partir de Qwen3-4B-Base, el seguimiento de instrucciones y el formato de diálogo dependen exclusivamente del SFT aplicado, que no está documentado. El tag `conversational` no garantiza una plantilla de chat funcional.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala y no cuantificado en este caso. En usos con datos factuales se requiere verificación humana o recuperación externa (RAG).
- Idiomas no declarados: no hay garantía de comportamiento en castellano ni en otros idiomas más allá de lo que herede del base, que no se ha evaluado aquí.
- Sesgos no evaluados: no se ha publicado ningún análisis de sesgo, toxicidad o seguridad.
- Entrenamiento sobre base cuantizada en 4 bits: es un enfoque eficiente en memoria, pero puede introducir diferencias de calidad frente a un entrenamiento en bf16. No hay métricas que lo cuantifiquen.
- Validación comunitaria nula: 28 descargas y 0 likes, sin discusiones ni incidencias reportadas. No hay señales externas de calidad o estabilidad.
- Artefacto dependiente del ecosistema: requiere PEFT 0.21.1 o compatible, Transformers, TRL y, para reproducir el entrenamiento, Unsloth. La compatibilidad futura con versiones mayores no está garantizada.
- El tag `arxiv:1910.09700` no es una referencia al modelo: corresponde al artículo sobre estimación de emisiones de carbono citado en la plantilla de model card de HuggingFace.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Maitani/geniac-stage1-adapter
- Modelo base utilizado: https://huggingface.co/unsloth/Qwen3-4B-Base-unsloth-bnb-4bit
- Modelo original Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Artículo citado en la plantilla (impacto de carbono, no documentación del modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto: https://mlco2.github.io/impact
- Paper, demo, dataset y blog del modelo: no disponibles en la información proporcionada.
