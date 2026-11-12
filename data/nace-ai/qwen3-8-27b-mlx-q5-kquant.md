# nace-ai/Qwen3.8-27B-MLX-Q5-KQuant

## Resumen

Qwen3.8-27B-MLX-Q5-KQuant es una cuantización de 5 bits del modelo multimodal Qwen/Qwen3.8-27B, empaquetada por el usuario nace-ai para su ejecución en Apple Silicon mediante la librería MLX. El modelo base, desarrollado por el equipo Qwen (Alibaba), es un transformer denso de 27.356 millones de parámetros con capacidad de entrada imagen-texto (image-text-to-text), pensado para conversación, razonamiento y uso de herramientas. Esta versión concreta aplica el framework de cuantización propietario KQuant, que ajusta cada grupo de pesos según el comportamiento del modelo sobre texto real en lugar de minimizar únicamente el error de reconstrucción de pesos.

La relevancia de este empaquetado radica en su relación calidad-tamaño: según la model card, logra una divergencia KL de 0,0219 frente al modelo BF16 original en texto general, frente a 0,0538 del pack de 4 bits de mlx-community, es decir, aproximadamente 2,5 veces más cercano al original, a costa de un 28% más de peso del modelo de lenguaje (19,43 GB frente a 15,13 GB). El repositorio completo ocupa 20,7 GB e incluye la torre de visión del modelo base fijada por hash.

El modelo conserva el modo de razonamiento (thinking) activado por defecto y está orientado exclusivamente al idioma inglés según los metadatos. La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), familia Qwen3.5 |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 5 bits (KQuant Q5); el autor publica tambien una variante Q4 |
| Idiomas soportados | Ingles (segun metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pack MLX; 3 archivos, 20.661.452.485 bytes) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27,36 mil millones de parámetros con una torre de visión acoplada para tareas de imagen-a-texto. La model card de esta cuantización no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de RLHF o DPO; esa información corresponde a la card del modelo original, que no se incluye en la información proporcionada. La torre de visión se mantiene intacta respecto al modelo base (333 tensores, 921.460.192 bytes) y se incluye un cabezal MTP opcional (multi-token prediction) procedente de mlx-community/Qwen3.8-27B-OptiQ-4bit, aunque el autor indica que ninguna de sus pruebas lo cargó.

La innovación técnica de este empaquetado es KQuant, un framework de cuantización para MLX que optimiza cada grupo de pesos contra el comportamiento del modelo sobre texto real, incluyendo texto de chat y de llamadas a herramientas, en lugar de limitarse al error numérico de los pesos. El resultado se escribe como un pack MLX estándar, sin necesidad de instalar software adicional. Las mediciones reportadas incluyen KL frente al modelo BF16 en texto original (0,0219 sobre 32.704 tokens), KL en texto de chat y tool-calls (0,1340 sobre 65.472 tokens) y una concordancia Top-1 con el BF16 del 94,9% en texto original. El tokenizador y la plantilla de chat se copian byte a byte del modelo base.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, configurable mediante parámetros de muestreo distintos según el modo.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), gracias a la torre de visión heredada del modelo base.
- Soporte de tool calling / function calling: la model card reporta 20 de 20 ensayos con thinking desactivado que colocaron la llamada y completaron el ciclo, sin llamadas extra.
- Razonamiento multi-paso y uso en agentes, derivado de las capacidades del modelo base Qwen3.8.
- Generación de código y matemáticas: capacidad esperable por la familia Qwen3.5, aunque no se aportan benchmarks específicos en la información disponible.
- Capacidades multilingües limitadas al inglés según los metadatos del repositorio.
- Salidas largas: la card recomienda hasta 32.768 tokens de salida para la mayoría de tareas con thinking activado.

## Casos de uso

- Asistente conversacional local en Mac: el pack MLX está pensado para ejecutarse en Apple Silicon con mlx-lm, lo que permite desplegar un asistente de 27B en un equipo de sobremesa sin GPU dedicada, con la ventaja de privacidad de no enviar datos a la nube.
- Automatización de soporte técnico con imágenes: al aceptar entrada imagen-texto, puede procesar capturas de pantalla de errores, diagramas o interfaces y responder con instrucciones, integrándose en flujos de tickets.
- Agentes con tool calling: los ensayos reportados (20/20 sin llamadas extra) lo hacen adecuado para orquestar APIs y funciones en pipelines de automatización donde la fiabilidad de la llamada es crítica.
- Análisis de documentos con componentes visuales: extracción de información de gráficos, tablas escaneadas o formularios combinando la torre de visión con el razonamiento del modelo de lenguaje.
- Generación de código en entornos de desarrollo locales: con 27B de parámetros y cuantización de 5 bits, ofrece un equilibrio entre calidad y huella de memoria para autocompletado y revisión de código en IDE sobre Mac.
- Evaluación comparativa de cuantizaciones: por su documentación detallada de KL y tamaños, sirve como referencia para investigadores que comparan estrategias de cuantización (KQuant frente a 4 bits estándar) en términos de fidelidad al modelo BF16.
- Prototipado de investigación multimodal sin infraestructura de datacenter: permite experimentar con un modelo de 27B en un portátil o Mac Studio, reduciendo la barrera de entrada para pruebas de concepto.

## Benchmarks y rendimiento

| Prueba | KQuant Q5 (este repo) | KQuant Q4 | mlx-works oQ4e-mtp | mlx-community 4-bit | lmstudio-community 4-bit |
|---|---:|---:|---:|---:|---:|
| Peso del modelo de lenguaje (GB) | 19,425 | 15,133 | 16,050 | 15,133 | 15,133 |
| KL frente a BF16, texto original (menor es mejor) | 0,0219 | 0,0349 | 0,0358 | 0,0538 | 0,0544 |
| Tokens evaluados (texto original) | 32.704 | no disponible | no disponible | no disponible | no disponible |
| KL frente a BF16, chat y tool-calls | 0,1340 | no disponible | no disponible | no disponible | no disponible |
| Tokens evaluados (chat y tool-calls) | 65.472 | no disponible | no disponible | no disponible | no disponible |
| Concordancia Top-1 con BF16, texto original | 94,9% | no disponible | no disponible | no disponible | no disponible |

El autor advierte que los demás packs se puntuaron en ejecuciones anteriores del mismo test que no registraron todos los hashes, por lo que la comparación no es estrictamente emparejada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 20,7 GB en disco; para inferencia en MLX se necesita al menos esa cantidad de memoria unificada, más margen para el contexto y la caché KV. Se recomienda un mínimo de 32 GB de memoria unificada y 48-64 GB para contextos largos o salidas de hasta 32.768 tokens.
- GPU recomendadas: Apple Silicon exclusivamente (M1/M2/M3/M4 en variantes Pro, Max o Ultra). No está pensado para GPU NVIDIA o AMD, ya que MLX es un framework específico de Apple.
- ¿Cabe en GPU de consumo? Sí, en Mac con memoria unificada suficiente; no aplica a GPU de consumo tipo RTX 4090 (24 GB) porque el formato MLX no está soportado en esas plataformas.
- Opciones de despliegue: mlx-lm (versión 0.32.2 según la card) sobre mlx 0.32.4, con transformers 5.22.2 y numpy 2.5.4. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este pack.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que los comandos de ejecución para este pack aún se están probando y remite a la card de Qwen3.5-9B Q4 para los comandos que sí funcionaron.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| nace-ai/Qwen3.8-27B-MLX-Q5-KQuant | 27,36B | no disponible | MLX safetensors 5-bit | Apache 2.0 | KL 0,0219 frente a BF16; 19,43 GB de pesos LM |
| nace-ai/Qwen3.8-27B-MLX-Q4-KQuant | 27,36B | no disponible | MLX safetensors 4-bit | Apache 2.0 | KL 0,0349; 15,13 GB de pesos LM |
| mlx-community/Qwen3.8-27B-4bit | 27,36B | no disponible | MLX safetensors 4-bit | Apache 2.0 | KL 0,0538; 15,13 GB de pesos LM |
| mlx-works/Qwen3.8-27B-oQ4e-mtp | 27,36B | no disponible | MLX safetensors 4-bit | Apache 2.0 | KL 0,0358; 16,05 GB de pesos LM; incluye cabezal MTP |

Todos los comparables son cuantizaciones del mismo modelo base, por lo que la diferencia se reduce a la fidelidad frente a BF16 y al tamaño en disco. No se dispone de datos para comparar con modelos de otros tamaños o familias.

## Limitaciones y advertencias

- Idiomas: los metadatos indican únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Contexto: la longitud de contexto del modelo base no se especifica en la información proporcionada; conviene consultar la card de Qwen/Qwen3.8-27B antes de usarlo en producción con ventanas largas.
- Alucinación: como todo modelo de lenguaje, puede generar contenido plausible pero falso; no se han publicado evaluaciones de factualidad en la información disponible.
- Sesgos: no se documentan sesgos conocidos en la card; se heredan los del modelo base, no evaluados aquí.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la card del modelo base por si hubiera términos adicionales no reflejados en este empaquetado.
- Madurez del pack: el autor indica que los comandos de ejecución para este pack aún se están probando; el repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria.
- Dependencia de plataforma: MLX solo funciona en Apple Silicon, lo que excluye su uso en servidores con GPU NVIDIA o AMD.
- Comparaciones de calidad no estrictamente emparejadas: el propio autor advierte que los KL de los packs de la competencia se midieron en ejecuciones anteriores sin registrar todos los hashes.
- Repetición: la card recomienda ajustar presence_penalty entre 0 y 2 para evitar repeticiones infinitas y advierte que valores altos pueden mezclar idiomas.
- Cabezal MTP: se incluye un cabezal opcional que no fue cargado en ninguna de las pruebas del autor; su comportamiento no está validado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-Q5-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultados de medición: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-Q5-KQuant/blob/main/results.json
- Variante Q4 del mismo autor: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-Q4-KQuant
- Card de referencia del autor (Qwen3.5-9B Q4): https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-Q4-KQuant
- Pack comparable mlx-works oQ4e-mtp: https://huggingface.co/mlx-works/Qwen3.8-27B-oQ4e-mtp
- Pack comparable mlx-community 4-bit: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Pack comparable lmstudio-community 4-bit: https://huggingface.co/lmstudio-community/Qwen3.8-27B-MLX-4bit
- Origen de la torre de visión y cabezal MTP: https://huggingface.co/mlx-community/Qwen3.8-27B-OptiQ-4bit
