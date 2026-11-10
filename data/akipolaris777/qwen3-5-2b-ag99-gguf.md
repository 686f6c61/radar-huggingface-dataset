# AkiPolaris777/qwen3.5-2b-ag99-gguf

## Resumen

AG99Live Qwen3.5-2B GGUF es un ajuste fino del modelo base Qwen/Qwen3.5-2B-Base, publicado por el usuario AkiPolaris777 en Hugging Face. El modelo está especializado en la generación de secuencias de movimiento continuo para avatares Live2D y VTube Studio (VTS) dentro del proyecto AG99Live. No es un modelo conversacional de propósito general, sino un generador de acciones estructuradas que traduce un segmento de habla y un estado de tendencias a una lista de pasos de movimiento con valores numéricos por eje facial y corporal.

El modelo cuenta con 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) y se distribuye exclusivamente en formato GGUF, con versiones F16, Q8_0 y Q4_K_M, junto con ficheros Modelfile para su importación directa en Ollama. El repositorio ocupa 7,1 GB. La licencia es Apache 2.0, heredada del modelo base, y el autor declara compatibilidad con endpoints y uso conversacional en las etiquetas, aunque la función real documentada es la generación de movimiento.

La relevancia de este modelo radica en su nicho: la animación procedural de avatares controlados por voz o texto. En lugar de generar texto libre, produce un JSON con pasos de animación (`motion_steps`) y una duración objetivo (`duration_hint_ms`), lo que permite integrarlo en pipelines de tiempo real para VTubers, asistentes virtuales o personajes interactivos. No se han publicado datos de entrenamiento, benchmarks ni detalles de arquitectura más allá del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B-Base; detalles no disponibles) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible (la model card esta en chino; el modelo base Qwen soporta multiples idiomas, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.5-2B-Base, un transformer de aproximadamente 1,88 mil millones de parámetros. El autor no documenta cambios estructurales, número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El proceso de ajuste fino se orientó a una tarea muy específica: mapear una entrada JSON con un segmento de habla (`speech`), acciones previas (`actions`) y tendencias (`tendency`) a una salida JSON con `duration_hint_ms` (entre 320 y 15000 ms) y una secuencia de `motion_steps`, cada uno con `axis_values` (valores continuos por eje como `head_yaw`, `body_yaw`, `eye_smile_left`, `mouth_smile`) y `duration_weight` (entero de 1 a 3).

El modelo se distribuye como un merge del ajuste fino y sus versiones cuantizadas en GGUF. No se documenta ninguna innovación técnica adicional como decodificación especulativa, atención lineal o mecanismos híbridos. El autor indica explícitamente que el repositorio no contiene los datos de entrenamiento y que, para integrarlo en AG99Live, es necesario proporcionar el system prompt del sistema AG99Live en la petición.

## Capacidades

- Generación de secuencias de movimiento continuo para avatares Live2D y VTube Studio: produce `motion_steps` con valores numéricos por eje facial y corporal.
- Control de duración de animación: emite `duration_hint_ms` en un rango de 320 a 15000 ms.
- Procesamiento de entrada estructurada en JSON: acepta un objeto con `segment` (acciones, habla, tendencia) y `user`.
- Salida estrictamente estructurada: solo devuelve los campos `duration_hint_ms` y `motion_steps`, lo que facilita su parseo en pipelines.
- Compatibilidad con Ollama y llama.cpp mediante ficheros Modelfile incluidos.
- Etiquetado como "conversational" y "endpoints_compatible" por el autor, aunque no se documenta un uso conversacional general.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Animación de VTuber en tiempo real: el modelo recibe el texto que va a pronunciar el avatar y genera los pasos de movimiento sincronizados con una duración objetivo, permitiendo que un rigger o un motor de animación aplique los valores de eje directamente en VTube Studio.
- Asistentes virtuales con avatar: integrado en un pipeline de texto a voz y animación, el modelo produce gestos faciales y corporales coherentes con el habla, mejorando la expresividad de personajes interactivos.
- Generación de animaciones para streaming: un creador puede introducir un guion y obtener secuencias de movimiento predefinidas para Live2D, reduciendo el trabajo manual de keyframing.
- Prototipado rápido de rigs: los valores de eje generados sirven para validar rangos y comportamientos de un modelo Live2D antes de producir animaciones finales.
- Integración en Ollama para pruebas locales: gracias a los Modelfile incluidos, un desarrollador puede levantar el modelo con `ollama create` y `ollama run` y probar el protocolo de entrada/salida sin infraestructura adicional.
- Automatización de contenido para personajes virtuales: en un sistema AG99Live, el modelo puede encadenarse con un generador de habla para producir animaciones de forma desatendida en vídeos o emisiones pregrabadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~1,88 mil millones de parámetros, las versiones cuantizadas son ligeras. La F16 requiere aproximadamente 3,8 GB solo para pesos (más overhead de contexto y KV cache); la Q8_0 alrededor de 2 GB; la Q4_K_M alrededor de 1,2 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM puede ejecutar la versión Q4_K_M o Q8_0 con comodidad. Para F16 se recomienda 6-8 GB. GPU de datacenter como A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, especialmente en cuantizaciones Q4_K_M y Q8_0.
- Opciones de despliegue: Ollama (con los Modelfile incluidos), llama.cpp (formato GGUF nativo). No se documenta soporte para vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles. Al ser un modelo pequeño y con salidas JSON cortas, se espera baja latencia en hardware consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables especializados en generación de movimiento para Live2D/VTS en el material proporcionado. Como referencia del modelo base:

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| AG99Live Qwen3.5-2B GGUF | 1.881.825.088 | no disponible | Apache 2.0 | GGUF | Movimiento Live2D/VTS |
| Qwen/Qwen3.5-2B-Base | ~2B | no disponible | Apache 2.0 | safetensors (base) | Lenguaje general |
| Alternativas especializadas en animacion | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (generación de movimiento para AG99Live) y no debe emplearse como modelo conversacional general pese a la etiqueta "conversational".
- Requiere el system prompt de AG99Live en la petición para funcionar correctamente; sin él, el comportamiento no está garantizado.
- No se documentan sesgos conocidos, pero al derivar de un modelo de lenguaje general puede heredar sesgos del corpus de Qwen.
- Riesgo de alucinación: puede generar valores de eje o secuencias de movimiento fuera de los rangos válidos definidos por AG99Live; el autor indica que los IDs y rangos válidos dependen de la definición de capacidades de AG99Live.
- El repositorio no incluye los datos de entrenamiento, lo que limita la reproducibilidad y la evaluación independiente.
- No se especifican los idiomas soportados; la model card está en chino y el modelo base Qwen es multilingüe, pero no hay confirmación para esta variante.
- Licencia Apache 2.0 permite uso comercial, pero el autor aclara que Qwen y Alibaba no respaldan ni patrocinan el proyecto.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria ni informes de uso en producción.
- No hay benchmarks publicados que permitan comparar su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/AkiPolaris777/qwen3.5-2b-ag99-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Repositorio de Ollama (herramienta de despliegue): https://github.com/ollama/ollama
- Repositorio de llama.cpp (herramienta de despliegue): https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
