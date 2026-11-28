# ricemonster/Text-to-CadQuery-Qwen2.5-7B

## Resumen

Text-to-CadQuery-Qwen2.5-7B es un ajuste fino supervisado de parámetros completos del modelo Qwen/Qwen2.5-7B-Instruct, desarrollado por el usuario ricemonster, orientado a la generación de programas Python ejecutables con la librería CadQuery a partir de descripciones de piezas CAD en lenguaje natural. El modelo resuelve el problema de traducir especificaciones geométricas textuales (bloques, taladros pasantes, operaciones booleanas, etc.) a código de modelado paramétrico 3D, un paso intermedio habitual en pipelines de diseño generativo y automatización de CAD.

Se trata de un transformer decoder-only de 7.615.616.512 parámetros (7,6 mil millones), derivado directamente de la familia Qwen2.5, sin cambios en la arquitectura base. El ajuste se realizó sobre el dataset ricemonster/Text-to-CadQuery, también publicado por el mismo autor, y el modelo se distribuye en formato safetensors con un tamaño de repositorio de 15,2 GB. Está etiquetado únicamente para inglés y su licencia no está declarada en la model card.

Su relevancia actual radica en que aborda una tarea de nicho poco cubierta por los modelos generalistas: la síntesis de código CAD ejecutable, donde la corrección sintáctica y la validez geométrica son críticas. Al estar construido sobre Qwen2.5-7B-Instruct, hereda el formato conversacional y la ventana de contexto de la familia, aunque el autor no documenta métricas de rendimiento ni detalles del proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino supervisado de parámetros completos |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen2.5-7B-Instruct, no confirmada por el autor) |
| Tipos de cuantizacion | No disponible (el repositorio solo incluye safetensors en precisión original; no se publican GGUF ni AWQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen2.5-7B-Instruct original: un transformer decoder-only denso con atención multi-cabeza, normalización RMSNorm y activaciones SwiGLU, sin modificaciones estructurales. El autor indica que se realizó un ajuste fino supervisado de parámetros completos (full-parameter SFT), es decir, se actualizaron todos los pesos del modelo base y no solo adaptadores tipo LoRA. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO posterior ni hiperparámetros como la tasa de aprendizaje o el número de épocas.

El dataset de entrenamiento es ricemonster/Text-to-CadQuery, publicado por el mismo autor, y el modelo forma parte de una colección homónima que incluye variantes de 0,5B, 1,5B, 3B y 7B, todas derivadas de los correspondientes Qwen2.5-Instruct. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de código Python con la API de CadQuery a partir de descripciones textuales de piezas CAD (bloques, cilindros, taladros, operaciones booleanas, extrusiones, revoluciones).
- Generación de texto y conversación multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Formato de prompt específico de instrucción/respuesta (`### Instruction:` / `### Response:`), tal como se documenta en la model card.
- Capacidad de razonamiento y código general, procedente del ajuste original de Qwen2.5-Instruct.
- Soporte de tool calling / function calling: no documentado por el autor para este ajuste; se desconoce si se preserva respecto al base.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante.
- Capacidades multilingües: limitadas al inglés según la etiqueta del modelo.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Automatización de diseño paramétrico: el modelo convierte descripciones como "un bloque rectangular con un taladro cilíndrico pasante centrado" en código CadQuery ejecutable, que puede integrarse en scripts de generación de piezas para prototipado rápido.
- Generación de variantes de piezas en pipelines de ingeniería: a partir de una especificación textual, el modelo produce el programa Python que define la geometría, permitiendo iterar sobre parámetros (dimensiones, radios, tolerancias) sin escribir código manualmente.
- Asistente para ingenieros no programadores: usuarios con conocimiento de CAD pero no de Python pueden describir la pieza en lenguaje natural y obtener el script CadQuery correspondiente para su ejecución en entornos como CQ-editor.
- Integración en herramientas de diseño generativo: el modelo puede actuar como componente de traducción texto-a-código dentro de una aplicación que reciba especificaciones de cliente y devuelva modelos 3D renderizables.
- Educación y formación en CAD paramétrico: sirve como ejemplo didáctico de cómo se traduce una descripción geométrica a código, útil en cursos de diseño asistido por ordenador.
- Pruebas de concepto en investigación sobre generación de código específico de dominio: al ser un ajuste fino de un modelo abierto, es un punto de partida para experimentos de evaluación de fidelidad geométrica en la generación de programas CAD.
- Generación de fixtures y piezas de test en entornos de fabricación: creación automatizada de geometrías simples para validar pipelines de impresión 3D o mecanizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 15,2 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 18-20 GB de VRAM para contexto corto.
- En cuantización de 8 bits: en torno a 8 GB de VRAM; en 4 bits: en torno a 4,5-5 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor, ya que no se publican pesos cuantizados).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX A6000 para inferencia en precisión completa; RTX 4090 (24 GB) suficiente para bfloat16 con contexto moderado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bfloat16; en GPUs de 8-12 GB requeriría cuantización, que el autor no proporciona.
- Opciones de despliegue: transformers (documentado en la model card con `AutoModelForCausalLM` y `device_map="auto"`); vLLM, TGI, llama.cpp u Ollama no están documentados por el autor y requerirían conversión manual de los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Text-to-CadQuery-Qwen2.5-7B | 7,6B | No disponible | Texto a CadQuery | No disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-7B-Instruct (base) | 7,6B | No confirmado en esta ficha | Texto general, código | No disponible en esta ficha | Hugging Face |
| Text-to-CadQuery-Qwen2.5-3B | 3B (aprox.) | No disponible | Texto a CadQuery | No disponible | Hugging Face (misma colección) |
| Text-to-CadQuery-Qwen2.5-0.5B | 0,5B (aprox.) | No disponible | Texto a CadQuery | No disponible | Hugging Face (misma colección) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo solo está etiquetado para inglés; las descripciones en castellano u otros idiomas pueden degradar la calidad del código generado.
- Riesgo de alucinación en la API de CadQuery: puede generar llamadas a métodos inexistentes o parámetros inválidos, por lo que el código debe validarse ejecutándolo antes de usarlo en producción.
- No se documenta la licencia, lo que impide confirmar si el uso comercial está permitido; es un riesgo legal relevante para adopción empresarial.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria ni informes de terceros sobre su calidad.
- No se publican métricas de evaluación (exactitud sintáctica, tasa de ejecución correcta, fidelidad geométrica), por lo que no es posible cuantificar su rendimiento real.
- El ajuste fino de parámetros completos sobre un dataset de nicho puede degradar capacidades generales del modelo base (olvido catastrófico), especialmente en tareas ajenas a CAD.
- No se ofrecen pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo sin conversión manual.
- La longitud de contexto efectiva no está confirmada por el autor; no debe asumirse la ventana del modelo base sin verificación.
- El formato de prompt es específico (`### Instruction:` / `### Response:`); usarlo con otras plantillas puede producir salidas incorrectas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-7B
- Dataset: https://huggingface.co/datasets/ricemonster/Text-to-CadQuery
- Colección Text-to-CadQuery: https://huggingface.co/collections/ricemonster/text-to-cadquery-6b0a2cabae152d0d6f0fc823
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Variante 0.5B: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-0.5B
- Variante 1.5B: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-1.5B
- Variante 3B: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-3B
