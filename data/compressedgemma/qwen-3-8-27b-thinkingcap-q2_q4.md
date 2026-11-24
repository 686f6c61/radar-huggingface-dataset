# CompressedGemma/Qwen-3.8-27B-Thinkingcap-Q2_Q4

## Resumen

Qwen-3.8-27B-Thinkingcap-Q2_Q4 es una cuantización GGUF publicada por el usuario CompressedGemma sobre un modelo base de la familia Qwen (la nomenclatura "Qwen-3.8-27B" sugiere una variante de 27.320.697.856 parámetros, según los pesos safetensors reportados). El autor la presenta como su primera cuantización realizada con una herramienta propia denominada HPC-Quantize-V2, que describe como "sustancialmente más potente" que su iteración anterior. El repositorio ocupa 9,6 GB y está etiquetado como compatible con endpoints y orientado a uso conversacional.

El interés de esta ficha es doble: por un lado, documenta una cuantización mixta que combina capas o tensores en Q2 y Q4 (de ahí el sufijo Q2_Q4), una estrategia habitual para reducir el peso en disco manteniendo cierta calidad en las partes sensibles del modelo. Por otro, sirve como ejemplo de publicación con licencia ambigua: la model card declara PolyForm Small Business 1.0.0 junto con una concesión personal "BottleCap", mientras que los metadatos de Hugging Face y la cabecera YAML indican apache-2.0.

La información pública es escasa: no hay pipeline declarado, no se listan idiomas soportados y no se publican resultados de benchmarks. La model card incluye únicamente un ejemplo cualitativo de generación de una página HTML5 con un hipercubo (tesseract) en rotación con proyección 4D, ejecutado con llama.cpp y una configuración concreta de servidor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen; la model card no detalla la arquitectura) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como especificación del modelo; en el ejemplo de ejecución se usa `--ctx-size 54096` |
| Tipos de cuantización | GGUF mixta Q2_Q4 (combinación de cuantizaciones de 2 y 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 en metadatos y cabecera YAML; la model card menciona PolyForm Small Business 1.0.0 + BottleCap personal-use grant (contradicción no resuelta) |
| Formato de pesos | GGUF (repo de 9,6 GB); se reportan también parámetros reales vía safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base ni sobre su proceso de entrenamiento en la documentación proporcionada. La model card no describe si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni detalla el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO.

Lo que sí se documenta es el proceso de cuantización: el autor aplica HPC-Quantize-V2 para producir un GGUF con una mezcla de cuantizaciones Q2 y Q4. Este tipo de esquema asigna mayor precisión a determinadas capas (habitualmente las más sensibles, como las de atención o las primeras y últimas capas) y menor precisión al resto, con el objetivo de reducir el tamaño en disco y la memoria necesaria sin degradar en exceso la calidad. No se especifica qué capas reciben Q4 y cuáles Q2, ni el método exacto de calibración empleado.

La model card menciona además el uso de un "thinking mode" activable mediante `--reasoning on` y `--chat-template-kwargs '{"enable_thinking":true,"truncate_history_thinking":false}'`, lo que indica que el modelo base incorpora un modo de razonamiento explícito con historial de pensamiento preservado entre turnos. No hay más detalles técnicos sobre este mecanismo.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat propia.
- Modo de razonamiento ("thinking") activable por parámetro, con opción de truncar o preservar el historial de pensamiento (`truncate_history_thinking`).
- Generación de código: el ejemplo de la model card muestra la creación de una página HTML5 con un tesseract en rotación, proyección 4D y personalización, que el autor evalúa como correcta salvo la vista de caras, que requirió una segunda edición.
- Uso como agente: la model card describe su empleo con "Pi Agent" y un fichero de sistema (`SOUL.md`) que define rol, principios y flujo de trabajo, lo que sugiere capacidad para seguir instrucciones complejas y planes por fases.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en Hugging Face).
- Capacidades multilingües: no disponibles como dato declarado.
- No se documentan capacidades de visión, audio ni tool calling explícito en la información proporcionada.

## Casos de uso

- Asistente de programación con razonamiento explícito: el modo thinking permite al modelo descomponer tareas de código en pasos antes de generar la respuesta, útil en tareas como generar visualizaciones 3D/4D, transformaciones matriciales o componentes web interactivos, tal como demuestra el ejemplo de la model card.
- Agente autónomo con rol definido: el patrón de `SOUL.md` documentado (identidad, expertise, principios, plan de trabajo por fases) sirve para desplegar el modelo como agente especializado en un dominio concreto, con instrucciones persistentes y un flujo de trabajo estructurado.
- Generación de prototipos front-end: creación de páginas HTML5 con CSS y JavaScript a partir de una descripción en lenguaje natural, adecuada para maquetación rápida y pruebas de concepto visuales.
- Despliegue en hardware limitado mediante llama.cpp: con un GGUF Q2_Q4 de 9,6 GB, el modelo puede ejecutarse en configuraciones con menos VRAM que el modelo completo en precisión alta, lo que facilita su uso en estaciones de trabajo con GPU de gama alta de consumo.
- Servidor local compatible con API: el ejemplo usa `llama-server` con puerto 8080 y caché KV cuantizada (`--cache-type-k q5_1 --cache-type-v q5_1`), lo que permite integrarlo en aplicaciones locales que consuman una API compatible con OpenAI.
- Experimentación con cuantización: útil para investigadores que quieran evaluar el impacto de una cuantización mixta Q2/Q4 frente al modelo original en tareas de código y razonamiento.
- Asistencia técnica especializada con contexto largo: el ejemplo emplea una ventana de 54.096 tokens, adecuada para conversaciones extensas o para cargar documentación técnica en el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única evaluación es cualitativa: el autor reporta que, en la generación de la página HTML5 del tesseract con proyección 4D, el modelo acertó "todo excepto la vista de caras", que requirió una segunda edición. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- Tamaño del repositorio: 9,6 GB, correspondiente al fichero GGUF cuantizado Q2_Q4.
- VRAM estimada para inferencia: no disponible de forma oficial; como referencia, un GGUF de 9,6 GB requiere al menos ese espacio en memoria más la caché KV. Con `--cache-type-k q5_1 --cache-type-v q5_1` y una ventana de 54.096 tokens, la caché KV añade una cantidad significativa de VRAM que no se especifica en la información disponible.
- GPU recomendadas: no disponibles. El ejemplo de ejecución usa `--n-gpu-layers 99`, lo que implica descargar todas las capas en GPU, pero no se indica el modelo de GPU empleado.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas con 16 GB o más de VRAM, aunque no hay confirmación oficial; el dato no está disponible.
- Opciones de despliegue: llama.cpp (`llama-server`), y por extensión cualquier runtime compatible con GGUF (Ollama, LM Studio, etc.), aunque solo llama.cpp aparece documentado en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos ni datos de rendimiento que permitan establecer una comparativa rigurosa. Como referencia estructural, cabría comparar con otras cuantizaciones GGUF del mismo modelo base o de modelos de ~27B de la familia Qwen, pero no se dispone de datos verificables en esta ficha.

## Limitaciones y advertencias

- Licencia contradictoria: los metadatos de Hugging Face y la cabecera YAML declaran apache-2.0, mientras que el cuerpo de la model card indica PolyForm Small Business 1.0.0 + BottleCap personal-use grant. Esta discrepancia debe resolverse antes de cualquier uso comercial; la licencia PolyForm Small Business restringe el uso a pequeñas empresas y la concesión BottleCap parece limitada a uso personal.
- La cuantización Q2_Q4 implica pérdida de precisión en parte de los tensores; no se documenta qué capas se ven afectadas ni se ofrecen métricas de degradación frente al modelo original.
- No se declaran idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- No se publican benchmarks, lo que impide evaluar objetivamente la calidad frente a alternativas.
- Riesgo de alucinación: inherente a los modelos generativos; no hay documentación específica sobre mitigaciones.
- Sesgos: no documentados.
- El modelo base no está identificado con precisión (la nomenclatura "Qwen-3.8-27B" no corresponde a un identificador oficial conocido), lo que dificulta verificar procedencia, datos de entrenamiento y licencia original.
- El ejemplo de uso emplea un fichero de sistema (`SOUL.md`) no compartido por el autor, lo que limita la reproducibilidad del resultado mostrado.
- Repositorio con pocas descargas (350) y sin likes, lo que sugiere validación comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/CompressedGemma/Qwen-3.8-27B-Thinkingcap-Q2_Q4
- Imagen de ejemplo del resultado: https://cdn-uploads.huggingface.co/production/uploads/69de1a493a21cb7c029dc694/9hCGdVUVhOXVykCItpdTc.png
- llama.cpp (runtime documentado en la model card): https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
