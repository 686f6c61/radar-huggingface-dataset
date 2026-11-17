# MagmaStudios/VERO-Mini-V2

## Resumen

VERO Mini V2 es un modelo de lenguaje de tipo causal LM orientado a chat y programación, desarrollado por Angelo Fontela bajo el sello MagmaStudios. Se trata de un fine-tune LoRA del modelo Qwen/Qwen2.5-Coder-0.5B-Instruct, posteriormente fusionado en los pesos completos, con un total de 494.032.768 parámetros (~0,5B). El modelo está publicado en Hugging Face con licencia Apache 2.0 y soporta español e inglés.

El objetivo del proyecto es disponer de un asistente conversacional pequeño, con identidad propia, capaz de responder preguntas sencillas y ayudar con tareas básicas de programación (funciones cortas, explicaciones de sintaxis, corrección de errores simples). No pretende competir con modelos de mayor tamaño: el ajuste de código es ligero (1.200 ejemplos, 2 épocas) y el de identidad se limita a 119 ejemplos repetidos en la mezcla.

Su relevancia actual es acotada pero ilustrativa: demuestra el flujo completo de fine-tuning LoRA sobre una base Qwen2.5-Coder de 0,5B, con entrenamiento realizado íntegramente en CPU (Intel Xeon de 8 núcleos, sin GPU, ~15 GB de RAM), lo que lo convierte en un caso práctico de bajo coste para experimentación y despliegue en entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (Causal LM, transformer decoder-only) |
| Parametros totales | 494.032.768 (~0,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima usada en entrenamiento; contexto nativo del base no especificado en la información disponible) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/otros no documentadas) |
| Idiomas soportados | es, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only de la familia Qwen2 con atención causal estándar. El ajuste se realizó mediante LoRA con r=8, alpha=16 y dropout=0.05, aplicado únicamente a las proyecciones de atención `q_proj`, `k_proj`, `v_proj` y `o_proj`, lo que supone 1.081.344 parámetros entrenables (~0,22% del total). Posteriormente, los adaptadores se fusionaron con `merge_and_unload` en pesos completos en safetensors.

Los datos de entrenamiento combinan dos fuentes recortadas a un máximo de 512 tokens (plantilla de chat incluida): 119 ejemplos de identidad creados para el proyecto (español e inglés, repetidos 4 veces hasta 476 filas) y 1.200 ejemplos de instrucciones de código procedentes de `bigcode/self-oss-instruct-sc2-exec-filter-50k` (ODC-By 1.0), usando el campo `instruction` como turno de usuario y `response` como turno de asistente. La mezcla total suma 1.676 ejemplos con ~308 tokens de media. Se entrenó durante 2 épocas (420 pasos de optimización), batch efectivo 8 (batch 1 × acumulación 8), precisión bfloat16 en CPU, optimizador AdamW, learning rate 2e-4 con warmup de 13 pasos y cosine decay. La model card indica loss final ≈0,54 en la descripción y marca las métricas detalladas (tiempo de entrenamiento, loss final) como pendientes de actualización.

## Capacidades

- Generación de texto conversacional en español e inglés, con turnos cortos.
- Respuesta a preguntas generales sencillas.
- Ayuda con programación: escritura de funciones cortas, explicación de código, diferencias de sintaxis y corrección de errores simples.
- Identidad propia inyectada automáticamente mediante chat template y `generation_config.json` cuando no se proporciona un mensaje de sistema.
- Soporte de chat template compatible con el pipeline `text-generation` de transformers y con endpoints compatibles (tag `endpoints_compatible`, `text-generation-inference`).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y multi-step reasoning: no disponibles.
- Capacidades de visión, audio o thinking mode: no disponibles.
- Multilingüismo: limitado a español e inglés.

## Casos de uso

- Asistente de programación para tareas triviales: generar funciones cortas (por ejemplo, invertir una cadena, ordenar una lista) y explicar su funcionamiento, aprovechando su especialización en código y su tamaño reducido para ejecución local.
- Corrección de errores simples de sintaxis: el modelo puede revisar fragmentos de código de pocas líneas y señalar errores evidentes, adecuado para entornos de aprendizaje o prototipado rápido.
- Chatbot de demostración con identidad propia: útil para mostrar el flujo de fine-tuning LoRA y la inyección automática de system prompt en demos públicas o entornos educativos.
- Explicación de diferencias de sintaxis entre lenguajes: puede comparar construcciones básicas en español o inglés, gracias a su entrenamiento con instrucciones de código de StarCoder2.
- Asistente de bajo coste en CPU: al entrenarse y poder ejecutarse en CPU, es viable en servidores sin GPU para tareas de generación de texto de baja latencia y volumen moderado.
- Pruebas de integración en pipelines de transformers: sirve como modelo de referencia para validar chat templates, `generation_config.json` y despliegue con text-generation-inference en entornos de CI.
- Base para nuevos fine-tunes: al ser un LoRA fusionado sobre Qwen2.5-Coder-0.5B, puede reutilizarse como punto de partida para ajustes adicionales de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K u otras) ni comparaciones numéricas con modelos similares; solo reporta loss final ≈0,54 y datos de configuración del entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (494M parámetros), en bfloat16 los pesos ocupan aproximadamente 1 GB, y en cuantizaciones de 8 o 4 bits cabría esperar valores notablemente menores, aunque no se documentan cuantizaciones publicadas.
- GPU recomendadas: no especificadas en la información disponible; el modelo fue entrenado en CPU (Intel Xeon, 8 núcleos, ~15 GB de RAM), lo que sugiere viabilidad en hardware modesto.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño, pero no confirmado en la documentación.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). vLLM, llama.cpp u Ollama no están documentados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| VERO Mini V2 | 494M | 512 tokens (entrenamiento) | Apache 2.0 | Hugging Face (34 descargas, 1 like) | Fine-tune LoRA de Qwen2.5-Coder-0.5B, identidad propia |
| Qwen2.5-Coder-0.5B-Instruct | ~0,5B | no disponible en la información proporcionada | Apache 2.0 | Hugging Face (modelo base) | Base del fine-tune; sin identidad personalizada |
| Alternativas de ~0,5B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa con otros modelos de tamaño similar no está disponible: no hay benchmarks publicados para VERO Mini V2 ni datos de rendimiento del base en la información consultada.

## Limitaciones y advertencias

- Modelo pequeño (~0,5B): se equivoca con más frecuencia que modelos de mayor tamaño.
- No debe usarse en contextos críticos: producción sensible, seguridad, medicina, derecho, finanzas ni código que se ejecute sin revisión.
- Riesgo de alucinación: puede inventar APIs, fabricar detalles o dar soluciones incompletas; el código generado debe revisarse siempre.
- Ajuste de código ligero: 1.200 ejemplos, 2 épocas y LoRA solo en atención; no es un modelo de ingeniería de software avanzado.
- Identidad frágil: un modelo tan pequeño puede olvidar o contradecir su identidad en conversaciones largas o ante prompts adversariales.
- Contexto corto: entrenado solo con turnos de ≤512 tokens; no está optimizado para contextos largos ni razonamiento extenso.
- Idiomas limitados a español e inglés.
- Licencia Apache 2.0 permite uso comercial, pero el dataset de código subyacente (ODC-By 1.0) exige atribución a BigCode y al conjunto de datos.
- El modelo no debe presentarse como Qwen, ChatGPT o Grok; su identidad es VERO Mini, creado por Angelo Fontela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MagmaStudios/VERO-Mini-V2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Dataset de instrucciones de código: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Demo (Space): https://huggingface.co/spaces/MagmaStudios/VERO-Mini-Chat
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia ODC-By 1.0: https://opendatacommons.org/licenses/by/1-0/
