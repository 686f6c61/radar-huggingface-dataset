# KartiOS/Karti-Small-VL-4B

## Resumen

Karti-Small-VL-4B es un modelo de visión y lenguaje (vision-language) de 4B parámetros desarrollado por KartiOS (proyecto Lumbridge), diseñado específicamente para ejecutarse localmente y combinar dos capacidades que un agente doméstico necesita: observar una imagen y, a continuación, invocar una herramienta sobre ella. El modelo se basa en Qwen/Qwen3.5-4B, una arquitectura `Qwen3_5ForConditionalGeneration` que comparte la misma torre de visión que Qwen3-VL-4B-Instruct, pero con la mitad de cabezas KV, lo que reduce el coste de la caché KV a igualdad de longitud de contexto (262.144 tokens).

En el momento de redactar esta ficha, el modelo se encuentra en fase de scaffolding: la página de HuggingFace se ha publicado deliberadamente antes de que exista ningún checkpoint, y el autor indica que se irá actualizando a medida que se ejecuten los entrenamientos, incluidos los fallidos. Por tanto, toda la información aquí recogida es preliminar y describe el diseño previsto, no un modelo ya entrenado y evaluado.

La relevancia de este modelo radica en su enfoque: en lugar de perseguir capacidades generales, se centra en un caso de uso concreto —agentes locales que leen una imagen y actúan mediante tool calling—, con una selección de base justificada por dos criterios medibles: que la plantilla de chat del modelo base sea capaz de renderizar llamadas a herramientas estructuradas, y que la arquitectura sea la misma que la del modelo de 27B que KartiOS ya utiliza como modelo de visión residente, simplificando así el despliegue y la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal con torre de visión) |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (aún no hay checkpoint) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (aún no hay checkpoint; se espera safetensors vía transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, una arquitectura `Qwen3_5ForConditionalGeneration` que combina un modelo de lenguaje con una torre de visión. Según la model card, la torre de visión es idéntica en configuración a la de Qwen3-VL-4B-Instruct: profundidad 24, hidden size 1024, salida 2560 y patch size 16. El modelo de lenguaje tiene 32 capas, 16 cabezas de atención, 4 cabezas KV (frente a las 8 de Qwen3-VL-4B), FFN de 9.216 y un vocabulario de 248.320 tokens. Esta reducción de cabezas KV implica la mitad de caché KV a igual longitud de contexto, un factor clave para su propósito de ejecución local.

La selección de la base se realizó en dos pasos: primero, un filtro que comprobaba si la plantilla de chat del modelo base podía renderizar llamadas a herramientas estructuradas (muchos candidatos fallaban, como Qwen2.5-VL, Phi-4-multimodal o InternVL3); segundo, una decisión entre los que pasaban el filtro, eligiendo Qwen3.5-4B por compartir arquitectura con el modelo de 27B ya desplegado por KartiOS. El entrenamiento está en curso y no se han publicado datos sobre número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO). La model card advierte de dos particularidades: el formato de llamada a herramienta no es JSON (usa etiquetas `<function=...>`), y el modo de pensamiento (thinking) viene activado por defecto en la plantilla, por lo que se recomienda fijar `enable_thinking: false` en todas las configuraciones de generación.

## Capacidades

Según la información disponible (diseño previsto, no verificado en un checkpoint real):

- Vision-language: el modelo acepta imágenes como entrada y genera texto, gracias a la torre de visión integrada.
- Tool calling: soporta llamadas a herramientas estructuradas, renderizadas por la plantilla de chat del modelo base.
- Agente local: pensado para ejecutarse en el mismo dispositivo que otros servicios residentes, con bajo coste de memoria.
- Lectura de imágenes para acciones concretas: por ejemplo, leer un frame de cámara y comprobar si una tarea programada se ha ejecutado, mirar un recibo y archivarlo, o ver una pantalla y actuar sobre ella.
- Multilingüismo: no especificado; se asume herencia de Qwen3.5, pero no hay confirmación.
- No se mencionan capacidades de audio, vídeo ni generación de imágenes.

## Casos de uso

- Automatización doméstica con cámara: el modelo puede analizar un frame de una cámara de seguridad y, mediante tool calling, invocar una herramienta que verifique si un trabajo programado (p. ej., una limpieza) se ha completado correctamente. Su ventana de 262K tokens permite mantener contexto de múltiples frames o historial de eventos.
- Gestión de recibos y documentos: al recibir una imagen de un recibo, el modelo puede extraer la información relevante y llamar a una herramienta de archivado o contabilidad para registrarla automáticamente.
- Control de interfaz de usuario: el modelo puede observar una captura de pantalla y, a través de tool calling, ejecutar acciones sobre la interfaz (p. ej., pulsar botones, rellenar formularios) en un entorno de automatización local.
- Asistente de soporte con evidencia visual: un usuario envía una foto de un error o una configuración; el modelo interpreta la imagen y llama a una herramienta de diagnóstico o a una base de conocimiento para ofrecer una solución.
- Monitorización de procesos industriales o de laboratorio: el modelo puede leer lecturas de instrumentos visuales (pantallas, medidores) y llamar a herramientas de registro o alerta cuando se superan umbrales.
- Agente de productividad personal: el modelo puede ver una imagen de una pizarra o de una nota manuscrita, extraer tareas y llamar a una herramienta de gestión de tareas para crear entradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no tiene checkpoint aún, por lo que no existen evaluaciones de MMLU, HumanEval, GSM8K ni de tareas de visión-lenguaje. La model card solo incluye una comparativa de arquitectura entre Qwen3.5-4B y Qwen3-VL-4B-Instruct, no de rendimiento.

## Requisitos de hardware

No se dispone de datos oficiales de VRAM, latencia ni throughput. Dado el tamaño de 4,66B parámetros y la reducción de cabezas KV, se puede estimar razonablemente que el modelo cabrá en GPUs de consumo con 8-12 GB de VRAM en cuantizaciones de 4-8 bits, pero esto es una estimación, no una especificación confirmada. La model card indica que el objetivo es ejecutarse localmente y de forma económica junto a otros servicios residentes. En cuanto a opciones de despliegue, al estar basado en transformers y en una arquitectura estándar, se espera compatibilidad con vLLM, llama.cpp, Ollama y TGI, pero no hay confirmación oficial. Hasta que exista un checkpoint, no se pueden dar cifras de rendimiento.

## Comparativa con modelos similares

La model card proporciona una comparativa arquitectónica entre Qwen3.5-4B (la base de este modelo) y Qwen3-VL-4B-Instruct, que es la alternativa más directa en tamaño y capacidades:

| Caracteristica | Karti-Small-VL-4B (base Qwen3.5-4B) | Qwen3-VL-4B-Instruct |
|---|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` | `Qwen3VLForConditionalGeneration` |
| Parametros | 4.659.865.088 | 4.437.815.808 |
| Capas | 32 | 36 |
| Cabezas de atencion | 16 | 32 |
| Cabezas KV | 4 | 8 |
| FFN | 9.216 | 9.728 |
| Vocabulario | 248.320 | 151.936 |
| Contexto | 262.144 | 262.144 |
| Torre de vision | profundidad 24, hidden 1024, out 2560, patch 16 | idéntica |

Otras alternativas de la misma categoría (modelos pequeños de visión-lenguaje con tool calling) mencionadas en la model card son MiniCPM-V-4.5 y Ovis2-4B, que sí pasan el filtro de renderizado de tool calls, pero no se ofrecen datos comparativos de rendimiento. No se dispone de benchmarks para comparar.

## Limitaciones y advertencias

- El modelo está en fase de entrenamiento: no existe ningún checkpoint publicado, por lo que no se puede descargar ni utilizar en producción. Toda la información es de diseño.
- La model card advierte explícitamente de que el modo de pensamiento (thinking) viene activado por defecto en la plantilla, lo que puede provocar respuestas vacías si se usa un presupuesto de tokens pequeño. Se recomienda fijar `enable_thinking: false` y añadir un control de contenido vacío como canario.
- El formato de llamada a herramienta no es JSON (usa etiquetas `<function=...>`), lo que puede requerir adaptaciones en los integradores que esperen JSON estándar.
- No se han evaluado sesgos, alucinaciones ni robustez en tareas de visión. Al ser un modelo pequeño, es previsible que tenga limitaciones en razonamiento complejo y en comprensión de imágenes ambiguas, pero no hay datos que lo confirmen.
- La licencia Apache-2.0 permite uso comercial, pero al no existir checkpoint, no se puede afirmar que el modelo final mantenga esa licencia sin cambios.
- La model card indica que el control run no puede reclamar que el corpus de entrenamiento del modelo hermano (Karti-Small-RSI-3B) llegue sin cambios, porque la serialización de las llamadas a herramientas difiere entre bases.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KartiOS/Karti-Small-VL-4B
- Organización KartiOS: https://huggingface.co/KartiOS
- Modelo hermano (solo texto): https://huggingface.co/KartiOS/Karti-Small-RSI-3B
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
