# Mohsinkhanshaik/HAYAT-Open-4B

## Resumen

HAYAT Open 4B es un modelo de lenguaje de 4.022 millones de parámetros derivado de la familia Qwen3, concretamente de la variante `huihui-ai/Huihui-Qwen3-4B-Instruct-2507-abliterated`, que a su vez procede de `Qwen/Qwen3-4B-Instruct-2507`. Lo publica el desarrollador Mohsinkhanshaik como pieza experimental del proyecto HAYAT, un asistente de IA local y privado para Windows. No es el modelo principal del proyecto (el autor indica que su escritor por defecto es un modelo de 35B), sino una prueba de ajuste fino local ejecutada en una GPU de portátil.

El modelo se ha afinado con QLoRA sobre el corpus público OpenAssistant/oasst1 y se distribuye únicamente en formato GGUF (cuantizaciones Q4_K_M y Q8_0) junto con un Modelfile para Ollama. Su relevancia es acotada: sirve como ejemplo reproducible de fine-tuning de bajo coste sobre un modelo abliterated (con el comportamiento de rechazo reducido) y como banco de pruebas para despliegues locales en hardware modesto.

La model card es explícita sobre sus límites: los resultados medidos no muestran una mejora sustancial frente al adaptador anterior (pérdida de validación de 1,2587 frente a 1,2589, y 10/14 respuestas exactas en ambos casos). Debe tratarse, por tanto, como un artefacto experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), sin datos adicionales en la información disponible |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens en el Modelfile de Ollama; contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (2,5 GB) y Q8_0 (4,3 GB) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (no se publican safetensors del modelo fusionado en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only de la familia Qwen3 en su variante Instruct-2507 de 4B, que el autor toma ya modificada por huihui-ai para reducir el comportamiento de rechazo (abliteration). Sobre esa base se aplica un ajuste QLoRA con rango 16 y alpha 32, restringido a las proyecciones `q_proj` y `v_proj`, con tasa de aprendizaje 5e-6, batch de 1 con acumulación de 8 pasos y longitud máxima de 1.024 tokens. El entrenamiento se ejecutó en una única RTX 5060 Laptop GPU de 8 GB: 585 pasos de optimizador en la ejecución original más 24 pasos en una continuación del 23 de octubre de 2026, con mejor checkpoint en el paso 16.

Los datos de entrenamiento son exclusivamente el corpus público OpenAssistant/oasst1: 1.558 ejemplos de entrenamiento, 180 de validación y 93 reservados para evaluación. El autor declara que no se usaron conversaciones privadas. No se documenta en la información disponible el volumen de tokens de preentrenamiento del modelo base, la composición completa de su dataset original ni si hubo fases de RLHF o DPO posteriores. Tras el ajuste, los pesos se fusionaron con la base y se exportaron a GGUF.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Razonamiento básico y respuesta a instrucciones heredado del modelo base Qwen3-4B-Instruct-2507.
- Capacidad de código y matemáticas presumiblemente heredada del base, aunque no se documenta ni se evalúa en la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking explícito, visión ni audio.
- Multilingüismo limitado: el autor declara únicamente inglés, aunque el base Qwen3 tiene cobertura multilingüe más amplia.
- Comportamiento de rechazo reducido por la base abliterated, lo que amplía el rango de respuestas pero elimina la capa de seguridad.

## Casos de uso

- Asistente conversacional local en escritorio: el modelo cabe en 2,5 GB en Q4_K_M y puede ejecutarse con Ollama en equipos con 6-8 GB de VRAM o incluso en CPU, lo que lo hace adecuado para un asistente privado sin conexión.
- Prueba de concepto de fine-tuning en hardware de consumo: sirve como referencia reproducible para validar un pipeline QLoRA completo (entrenamiento, fusión, cuantización y despliegue) en una sola GPU de portátil de 8 GB.
- Evaluación de técnicas de abliteration: al partir de una base con rechazo reducido, permite estudiar el efecto del ajuste fino sobre ese comportamiento en un modelo pequeño.
- Generación de respuestas de chat para prototipos: con 4.096 tokens de contexto configurados en Ollama, cubre conversaciones cortas y tareas de redacción simple en inglés.
- Docencia y experimentación académica: su tamaño y licencia Apache-2.0 permiten usarlo en cursos o laboratorios sobre ajuste fino y despliegue local sin coste de licencia.
- Base para experimentos de destilación o comparación de cuantizaciones: la disponibilidad de Q4_K_M y Q8_0 facilita medir el impacto de la cuantización en la calidad de salida sobre el mismo checkpoint.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son métricas internas sobre 93 ejemplos reservados de oasst1 y 14 comprobaciones de respuesta exacta:

| Metrica | Adaptador anterior | Este modelo |
|---|---:|---:|
| Pérdida de tokens en held-out | 1,2589 | 1,2587 |
| Respuestas exactas | 10/14 | 10/14 |

El autor menciona además que un conjunto de prueba estricto anterior obtuvo 54 de 154 comprobaciones de salida exacta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5 GB para Q4_K_M y 4,3 GB para Q8_0, más el overhead del runtime.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM es suficiente; el autor cita explícitamente una RTX 5060 Laptop de 8 GB como hardware de entrenamiento.
- Cabe en GPU de consumo: sí, en tarjetas de 6 GB o más (RTX 3060, RTX 4060, RTX 5060, entre otras); también puede ejecutarse en CPU.
- Opciones de despliegue: Ollama mediante el Modelfile incluido; al ser GGUF, es compatible con llama.cpp y otros runtimes que acepten este formato. No se documenta soporte verificado para vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| HAYAT Open 4B | 4.022 M | 4.096 (Ollama) | Apache-2.0 | GGUF | Experimental, fine-tuning QLoRA sobre oasst1 |
| Qwen3-4B-Instruct-2507 | 4B | No disponible en la información proporcionada | Apache-2.0 | Safetensors, GGUF | Base original, con capa de seguridad intacta |
| Huihui-Qwen3-4B-Instruct-2507-abliterated | 4B | No disponible en la información proporcionada | Apache-2.0 | Safetensors, GGUF | Base directa, con rechazo reducido |
| Modelos de 3-4B de la familia Llama 3.2 | 3B | 128K (según documentación pública de Llama 3.2) | Llama 3.2 Community License | Safetensors, GGUF | Alternativa con licencia no Apache; datos no verificados en esta ficha |

La comparación con alternativas de otros fabricantes no puede completarse con datos verificados en la información disponible; las filas de Llama 3.2 se incluyen solo como referencia de categoría y deben contrastarse con la documentación oficial.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo describe como una prueba, no como el modelo principal de HAYAT, y los resultados medidos no muestran mejora significativa frente al adaptador previo.
- Sin capa de seguridad: la base abliterated reduce el comportamiento de rechazo, por lo que el modelo puede producir contenido inapropiado sin filtro integrado.
- Riesgo elevado de alucinación: el autor advierte explícitamente de que puede inventar hechos.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está evaluado ni garantizado.
- Contexto limitado a 4.096 tokens en la configuración de Ollama, insuficiente para documentos largos o conversaciones extensas.
- Dataset de entrenamiento pequeño (1.558 ejemplos) y de una única fuente pública, lo que limita la diversidad y puede introducir sesgos del corpus oasst1.
- Licencia Apache-2.0 permisiva para uso comercial, pero heredada de los modelos base; conviene verificar las condiciones de Qwen3 y de la variante abliterated antes de un despliegue comercial.
- Sin datos de benchmarks estándar ni de throughput, lo que dificulta estimar su rendimiento en producción.
- El repositorio solo distribuye GGUF; no se publican safetensors del modelo fusionado, lo que limita su uso en pipelines que requieran pesos completos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mohsinkhanshaik/HAYAT-Open-4B
- Repositorio del proyecto HAYAT: https://github.com/mohsinkhanshaik/HAYAT
- Modelo base directo: https://huggingface.co/huihui-ai/Huihui-Qwen3-4B-Instruct-2507-abliterated
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenAssistant/oasst1
