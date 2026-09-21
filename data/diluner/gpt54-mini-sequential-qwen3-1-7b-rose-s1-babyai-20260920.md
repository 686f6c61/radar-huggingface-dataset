# Diluner/gpt54-mini-sequential-qwen3-1.7b-rose-s1-babyai-20260920

## Resumen

Este repositorio contiene un checkpoint de ajuste fino supervisado (o por destilación de trayectorias) del modelo denso Qwen3-1.7B, entrenado por el usuario Diluner mediante un método denominado ROSE y usando `gpt-5.4-mini` como modelo profesor. El checkpoint corresponde a la etapa 1 de una cadena secuencial de tres entornos de agentes: BabyAI, TextCraft y SearchQA. En el momento de su publicación solo se había completado la etapa BabyAI (cinco épocas y 125 actualizaciones de optimizador), por lo que el modelo representa un estado intermedio dentro de un pipeline de entrenamiento más amplio, no un modelo final.

La relevancia de esta ficha es, por tanto, metodológica más que de rendimiento: ilustra un patrón de entrenamiento por etapas encadenadas, donde el estudiante y el método se arrastran de un entorno al siguiente, y donde el autor documenta explícitamente la procedencia del artefacto (manifiesto de etapa, recuento de pasos, marcador de verificación). No se adjunta ninguna evaluación completada para este checkpoint intermedio, y el propio autor advierte que las puntuaciones de los tres entornos pertenecen únicamente al modelo de etapa 3 completamente entrenado.

El modelo tiene 2.031.739.904 parámetros almacenados en safetensors (cifra que incluye los embeddings duplicados por el peso atado; el recuento efectivo de Qwen3-1.7B es de aproximadamente 1,72 mil millones). El repositorio ocupa 4,1 GB. La licencia, los idiomas soportados y los resultados de benchmarks no están declarados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, causal LM (heredada de Qwen3-1.7B); método de entrenamiento ROSE |
| Parámetros totales | 2.031.739.904 según safetensors (incluye embeddings duplicados por peso atado; el modelo base Qwen3-1.7B tiene ~1,72 mil millones efectivos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en el repositorio; el modelo base Qwen3-1.7B soporta 32.768 tokens nativos y hasta 131.072 con YaRN |
| Tipos de cuantización | No disponible en el repositorio (solo se publican pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible. El autor indica explícitamente "No license is asserted here; consult the base model and applicable terms" (el modelo base Qwen3-1.7B se distribuye bajo Apache-2.0) |
| Formato de pesos | Safetensors (transformers); configuración, tokenizer y todos los shards incluidos en la raíz del repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer denso causal decoder-only con normalización RMSNorm, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). El checkpoint no introduce cambios arquitectónicos; el valor diferencial está en el procedimiento de entrenamiento. El autor describe el método como "ROSE", con `gpt-5.4-mini` actuando como profesor, sobre una cadena secuencial de entornos de agentes: BabyAI → TextCraft → SearchQA. Cada entorno recibe cinco épocas, y el estudiante y el método se conservan a lo largo de la cadena. En la etapa publicada (BabyAI) se completaron 125 actualizaciones de optimizador.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla qué significa exactamente la sigla ROSE, qué tipo de destilación se usó (¿trayectorias de profesor?, ¿preferencias?, ¿supervisión de pasos de agente?) ni la configuración de hiperparámetros. El autor aporta un `experiment.json` con referencias de origen legibles por máquina y sumas de verificación, además de evidencias de finalización de etapa (manifiesto completo, recuento de pasos verificado y tarea de controlador con marcador de verificación). No se incluyen en el export el estado del optimizador, los logs en bruto ni las trayectorias del profesor.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado con `text-generation` y `conversational`, y el pipeline declarado es `text-generation`.
- Entrenamiento orientado a agentes: las etiquetas `agent-training`, `sequential` y los entornos BabyAI, TextCraft y SearchQA indican que el ajuste se orientó a tareas de agente con múltiples pasos.
- Ejecución de instrucciones dentro de entornos de agente: la etapa completada (BabyAI) corresponde a un entorno de instrucciones en lenguaje natural con acciones discretas.
- Capacidades heredadas del modelo base Qwen3-1.7B: razonamiento, generación de código, matemáticas y modo "thinking"/"no thinking", según la documentación pública de Qwen3. No hay verificación específica de que estas capacidades se conserven tras el ajuste.
- Soporte de tool calling / function calling: no confirmado para este checkpoint concreto (el modelo base Qwen3 lo soporta, pero no hay evidencia en el repositorio de que se haya preservado).
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, decodificación especulativa): no disponibles.

## Casos de uso

- Investigación en entrenamiento secuencial de agentes: este checkpoint permite reproducir y auditar la etapa 1 (BabyAI) de una cadena BabyAI → TextCraft → SearchQA, y comparar la degradación o transferencia de capacidades al avanzar de etapa. Es su uso más justificado, dado que el propio autor lo enmarca como artefacto intermedio.
- Estudio de destilación con profesor propietario: sirve para analizar cómo se comporta un estudiante de 1,7B ajustado con trayectorias de un modelo profesor mucho mayor, siempre que se disponga de las trayectorias originales (no incluidas en el repositorio).
- Punto de partida para ajuste posterior en entornos de agentes: al ser un checkpoint intermedio, es un candidato razonable para continuar el entrenamiento en TextCraft o en dominios propios, partiendo de pesos ya adaptados a formato de tareas de agente.
- Evaluación de robustez y deriva de capacidades: permite medir si el ajuste en un entorno concreto (BabyAI) degrada capacidades generales del modelo base, un problema habitual en ajustes especializados de modelos pequeños.
- Pruebas de infraestructura de despliegue en modelos pequeños: con 4,1 GB de repositorio y ~1,7 mil millones de parámetros, es adecuado para validar pipelines de serving (vLLM, TGI, llama.cpp) en hardware modesto sin coste elevado.
- Referencia metodológica para experimentos con licencia indefinida: útil como caso de estudio de publicación de artefactos sin licencia declarada y de buenas prácticas de trazabilidad (manifiestos, checksums, marcadores de verificación).
- Generación de texto general: puede emplearse con `transformers` para generación conversacional básica, aunque sin benchmarks publicados no hay garantía de calidad frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica de forma explícita que "no completed evaluation for this intermediate checkpoint is attached" y que las puntuaciones finales de los tres entornos corresponden únicamente al modelo de la etapa 3. Cualquier cifra de benchmark atribuida a este checkpoint sería una atribución indebida.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,5-4,5 GB solo para pesos, más caché KV y activaciones.
- VRAM estimada en INT8: en torno a 2-2,5 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 1,1-1,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G. En un solo A100 o H100 sobra capacidad de forma holgada.
- Compatibilidad con GPU de consumo: sí. El modelo cabe en tarjetas de gama media y baja (6-8 GB) usando cuantización de 4 bits, y en 8-12 GB sin cuantizar junto con contexto moderado.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), vLLM, Hugging Face Text Generation Inference (TGI, la etiqueta `text-generation-inference` está presente), llama.cpp u Ollama previa conversión a GGUF (no se publican archivos GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, por lo que la comparación se limita a atributos estructurales y de licencia. Los datos de los modelos alternativos corresponden a su documentación pública.

| Modelo | Parámetros efectivos | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Este checkpoint (gpt54-mini-sequential-qwen3-1.7b-rose-s1-babyai) | ~1,72 mil millones | No especificado | No disponible | Hugging Face, safetensors | No disponible |
| Qwen/Qwen3-1.7B (modelo base) | ~1,72 mil millones | 32.768 nativos / 131.072 con YaRN | Apache-2.0 | Hugging Face, safetensors y GGUF | No disponible en esta ficha; es el punto de referencia natural |
| Llama-3.2-1B | ~1,24 mil millones | 128.000 | Llama 3.2 Community License | Hugging Face | No disponible en esta ficha |
| Gemma-3-1B | ~1 mil millones | 32.000 | Gemma Terms of Use | Hugging Face | No disponible en esta ficha |
| SmolLM2-1.7B | ~1,7 mil millones | 8.192 | Apache-2.0 | Hugging Face | No disponible en esta ficha |

La diferencia funcional relevante frente a todos ellos no es de tamaño ni de contexto, sino de propósito: este checkpoint está ajustado específicamente para entornos de agente mediante una cadena secuencial, mientras que los alternativos son modelos de propósito general.

## Limitaciones y advertencias

- Ausencia total de evaluación: no existe ninguna métrica publicada para este checkpoint. No debe asumirse que supera al modelo base en ninguna tarea.
- Es un checkpoint intermedio: corresponde a la etapa 1 de 3. El autor advierte que las puntuaciones de etapas posteriores no deben atribuirse a este artefacto.
- Licencia no declarada: el repositorio no afirma ninguna licencia y remite a los términos del modelo base. Para uso comercial es imprescindible verificar la licencia de Qwen3-1.7B (Apache-2.0) y aclarar la situación del artefacto derivado antes de cualquier despliegue en producción.
- Método ROSE no documentado: no se especifica en el repositorio en qué consiste, qué hiperparámetros usa ni cómo se genera la señal de supervisión, lo que dificulta la reproducibilidad.
- Dependencia de un profesor propietario: el entrenamiento usa `gpt-5.4-mini` como profesor; no se publican las trayectorias ni los datos intermedios, lo que limita la auditoría y puede arrastrar sesgos del profesor.
- Reproducibilidad parcial: se publican pesos, configuración y tokenizer, pero no el estado del optimizador, los logs en bruto ni las trayectorias. El autor señala además que el inventario de selección registra nombres, tamaños y fechas de modificación, no hashes byte a byte de tensores vinculados a respuestas de evaluación históricas.
- Riesgo de sobreajuste al entorno: 125 actualizaciones de optimizador en un único entorno de agente (BabyAI) sobre un modelo de 1,7B es un ajuste corto pero muy especializado; es esperable cierta deriva respecto a las capacidades generales del modelo base.
- Idiomas no declarados: no hay información sobre el soporte multilingüe tras el ajuste.
- Riesgo de alucinación: inherente a los modelos de 1,7B y no cuantificado aquí por falta de evaluaciones.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Diluner/gpt54-mini-sequential-qwen3-1.7b-rose-s1-babyai-20260920
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo, su método de entrenamiento ni los entornos BabyAI, TextCraft o SearchQA. Los resultados obtenidos correspondían a consultas no relacionadas y se han descartado. No hay por tanto papers, blogs, repositorios ni demos adicionales que enlazar.
