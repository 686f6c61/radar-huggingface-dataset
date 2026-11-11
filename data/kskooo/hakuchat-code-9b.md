# KSKOOO/HakuChat-Code-9B

## Resumen

HakuChat-Code-9B es un modelo de lenguaje de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) publicado por el usuario KSKOOO en Hugging Face. Se presenta como un asistente de código en chino para despliegue local, con capacidades de conversación, generación y completado de código Python, y soporte de tool calling. La model card lo describe como un ajuste fino orientado a chat con identidad unificada como HakuChat y una ventana de contexto declarada de 256k tokens nativos, configurada a 128k en despliegue.

El modelo se distribuye en formato safetensors con pesos completos sin cuantizar (18,8 GB de repositorio) y licencia Apache 2.0. La etiqueta de arquitectura `qwen3_5` y el uso de `AutoModelForImageTextToText` con pipeline `image-text-to-text` sugieren una base multimodal de la familia Qwen, aunque la model card no detalla la arquitectura interna ni el proceso de entrenamiento.

Su relevancia es limitada en el ecosistema actual: cuenta con 3 descargas y 1 like en el momento de la consulta, y la información publicada es escasa. Resulta de interés principalmente como ejemplo de ajuste fino de código en chino con contexto largo y tool calling, pero carece de documentación suficiente para evaluar su calidad de forma rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`; detalles internos no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no se declara como MoE) |
| Longitud de contexto | 256k nativo declarado; 128k en configuración de despliegue |
| Tipos de cuantizacion | Pesos publicados sin cuantizar (bf16/fp16 presumiblemente); el autor reporta evaluación en int4, pero no se listan formatos GGUF/AWQ/GPTQ |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y el uso de la clase `AutoModelForImageTextToText`, lo que indica una base multimodal de tipo image-text-to-text. El pipeline declarado es `image-text-to-text`, aunque la model card no describe capacidades de visión ni cómo se entrenaron. El modelo se publica como pesos completos fusionados (merged) y sin cuantizar.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La model card menciona que el template de conversación incorpora la identidad del asistente, de modo que no es necesario añadir un system prompt adicional. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación, completado, implementación de funciones y explicación de código Python.
- Tool calling con trazas de calculadora y búsqueda web (`calculator` / `web.search`).
- Conversación multi-turno en chino e inglés.
- Contexto largo: 256k tokens nativos declarados, 128k en despliegue.
- Identidad de asistente unificada como HakuChat mediante el template de chat.
- Capacidad multimodal declarada por el pipeline `image-text-to-text`, sin documentación adicional sobre su alcance.

## Casos de uso

- Asistencia de código en local para desarrolladores chinos: el modelo puede generar y completar funciones Python en un entorno sin conexión, con pesos safetensors cargables vía transformers y licencia Apache 2.0 que permite uso comercial.
- Explicación de código heredado: dado su contexto de 128k en despliegue, puede recibir módulos completos o varios ficheros y producir explicaciones en chino sobre su funcionamiento.
- Integración en pipelines de CI/CD: el soporte de tool calling permite conectar el modelo a herramientas de cálculo o búsqueda para tareas de revisión automatizada, aunque requiere validación humana por el riesgo de alucinación.
- Chatbot de soporte técnico en chino: la identidad preconfigurada en el template simplifica el despliegue de un asistente conversacional sin system prompt adicional.
- Prototipado de agentes multi-paso: las trazas de tool calling documentadas permiten experimentar con flujos de razonamiento que invocan calculadora o búsqueda web.
- Evaluación comparativa de ajustes finos: sirve como referencia para estudiar el efecto de un ajuste de código sobre una base Qwen de ~9B con contexto extendido.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en línea con int4 y contexto de 128k, temperatura 0 y muestreo generativo 0-shot. El propio autor advierte que los modelos comparables suelen reportar 5-shot en bf16, por lo que los valores solo son orientativos.

| Benchmark | Puntuación | Muestras |
|---|---|---|
| MMLU | 73,1 | 171 |
| C-Eval | 78,85 | 104 |
| GSM8K | 86,67 | 60 |
| HumanEval (pass@1) | 63,33 | 60 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 19 GB solo para pesos, más overhead de activaciones y KV cache; con contexto de 128k el KV cache puede añadir varios GB adicionales.
- VRAM estimada en cuantización de 8 bits: aproximadamente 10-11 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB para pesos, más KV cache.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 128k en precisión alta; RTX 4090 (24 GB) viable en bf16 con contexto moderado o en cuantización para contexto largo.
- GPU de consumo: cabe en RTX 4090 y en tarjetas de 16 GB con cuantización de 8 o 4 bits, siempre que se gestione el KV cache.
- Opciones de despliegue: transformers (soporte oficial declarado), vLLM y TGI de forma presumible por la arquitectura, y llama.cpp/Ollama solo si se generan pesos GGUF, que no se distribuyen en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HakuChat-Code-9B | 9,4B | 256k nativo / 128k despliegue | Apache 2.0 | Ajuste de código en chino; benchmarks 0-shot int4 |
| Qwen2.5-Coder-7B | 7,6B | 128k | Apache 2.0 | Base de código ampliamente evaluada; datos no disponibles en esta ficha |
| DeepSeek-Coder-V2-Lite | 16B (2,4B activos, MoE) | 128k | Licencia propia | MoE de código; datos no disponibles en esta ficha |

La comparación con alternativas concretas no está respaldada por datos de benchmarks en la información proporcionada; los modelos citados se incluyen solo como referencia de categoría y sus cifras no se han verificado aquí.

## Limitaciones y advertencias

- Documentación muy escasa: no se detallan datos de entrenamiento, arquitectura interna ni proceso de alineación.
- Adopción mínima (3 descargas, 1 like), sin validación independiente de los resultados reportados.
- Benchmarks con muestras pequeñas (60-171 ejemplos) y en int4 0-shot, no comparables directamente con cifras de fabricantes en bf16 5-shot.
- Riesgo de alucinación en generación de código y en tool calling; requiere verificación en producción.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está documentado.
- La capacidad multimodal se infiere del pipeline y la clase de carga, pero no se describe su alcance ni calidad.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantías del autor sobre el origen de los datos de entrenamiento.
- El contexto de 256k es una declaración del autor; no se aportan pruebas de recuperación efectiva a esa longitud.

## Enlaces

- Hugging Face: https://huggingface.co/KSKOOO/HakuChat-Code-9B
