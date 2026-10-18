# hecan3d/QwenDGAF-1.5B

## Resumen

QwenDGAF-1.5B es un modelo conversacional de 1.543.714.304 parámetros publicado por el usuario hecan3d en HuggingFace, distribuido en formato GGUF y empaquetado para su uso directo con llama.cpp. El nombre del único archivo incluido en la model card (`Qwen2.5-1.5B-Instruct.Q6_K.gguf`) indica que se trata de una conversión a GGUF, realizada con Unsloth, del modelo Qwen2.5-1.5B-Instruct de Alibaba, cuantizado en Q6_K. No se aporta ninguna información sobre un posible ajuste fino adicional ni sobre qué modifica el sufijo "DGAF" respecto al original.

El interés práctico del modelo es acotado pero claro: ofrece un LLM de ~1,5 mil millones de parámetros en una única cuantización de alta calidad (Q6_K) que ocupa del orden de 1,2-1,3 GB, lo que permite ejecutarlo en CPU o en GPUs de consumo con muy poca VRAM, con una pérdida de precisión pequeña respecto al modelo en precisión completa. Es un candidato razonable para prototipado local, tareas de clasificación y extracción de texto, y entornos sin GPU.

La información publicada es muy escasa: el repositorio no declara licencia, idiomas, pipeline, contexto ni resultados de evaluación, y el modelo cuenta con 0 descargas y 0 likes en el momento de la consulta. Todo lo que sigue distingue explícitamente entre lo declarado en el repositorio y lo inferido del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (inferido del nombre del archivo y del tag `qwen2`) |
| Parámetros totales | 1.543.714.304 (dato verificado sobre safetensors según los metadatos de HuggingFace) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en el repositorio. El modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens |
| Tipos de cuantización | GGUF Q6_K (único archivo publicado) |
| Idiomas soportados | No disponible en el repositorio. El modelo base Qwen2.5 declara soporte multilingüe (chino, inglés y otros) |
| Licencia | No disponible en el repositorio. El modelo base Qwen2.5-1.5B-Instruct se publica bajo Apache 2.0 |
| Formato de pesos | GGUF; el repositorio ocupa 2,3 GB y los metadatos indican verificación de parámetros sobre safetensors, aunque la model card solo lista el archivo GGUF |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento. Por el nombre del archivo y la etiqueta `qwen2`, cabe inferir que el modelo subyacente es Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atención de tipo grouped-query, normalización RMSNorm y activación SwiGLU, entrenado por Alibaba con un pipeline de preentrenamiento a gran escala seguido de ajuste supervisado y optimización de preferencias (DPO). No hay confirmación en el repositorio de estos detalles, ni de si el autor ha aplicado un ajuste fino adicional sobre el modelo base.

La contribución técnica del repositorio es la conversión y cuantización a GGUF Q6_K mediante Unsloth, un esquema de cuantización de bloques que mantiene la mayor parte de los pesos en 6 bits con escalas por bloque, lo que sitúa la pérdida de calidad muy por debajo de Q4_K_M a cambio de un tamaño mayor. El resultado se carga directamente con `llama-cli` y el flag `--jinja`, que habilita el uso de plantillas de chat en formato Jinja para el formateo de turnos.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat aplicada vía `--jinja`.
- Razonamiento básico y resolución de problemas de complejidad media, limitado por el tamaño de 1,5B parámetros.
- Generación de código y explicación de fragmentos, incluyendo lenguajes habituales (Python, JavaScript, SQL), con calidad propia de un modelo pequeño.
- Aritmética y matemáticas elementales; propenso a errores en problemas de varios pasos.
- Capacidad multilingüe heredada del modelo base, aunque el repositorio no declara la lista de idiomas.
- Compatibilidad con endpoints de tipo OpenAI según el tag `endpoints_compatible`, lo que facilita su integración detrás de servidores compatibles.
- Soporte de tool calling / function calling: no confirmado en la información disponible; debe validarse empíricamente antes de usarlo en producción.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Visión y audio: no disponibles; el modelo es estrictamente de texto.

## Casos de uso

- Prototipado local sin GPU: el archivo Q6_K ocupa aproximadamente 1,2-1,3 GB y puede ejecutarse en CPU con llama.cpp a velocidades interactivas, lo que permite montar un asistente de pruebas en un portátil sin acelerador.
- Clasificación y etiquetado de textos: con instrucciones breves y salida restringida, el modelo sirve para categorizar tickets, correos o reseñas en lotes, con un coste por token prácticamente nulo al correr en local.
- Extracción de información estructurada: conversión de correos o contratos en JSON con campos fijos, aprovechando la cuantización Q6_K para minimizar el deterioro en el seguimiento de formato respecto a cuantizaciones de 4 bits.
- Generación de código en asistentes de editor: autocompletado, generación de tests unitarios y explicación de funciones en un plugin local, sin enviar código a servicios externos.
- Filtrado y moderación previa: primera pasada de detección de contenido fuera de política antes de escalar a un modelo mayor, reduciendo coste en pipelines de dos etapas.
- Chatbot de documentación interna: despliegue con llama.cpp u Ollama sobre un servidor modesto para responder preguntas frecuentes, usando recuperación externa para inyectar el contexto.
- Generación de datos sintéticos y aumento de datasets: producción de paráfrasis, preguntas y respuestas de ejemplo para entrenar o evaluar otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones propias ni comparaciones con el modelo base, y no se dispone de mediciones verificadas de MMLU, HumanEval, GSM8K u otras pruebas para esta conversión concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 1,5-2,0 GB con la cuantización Q6_K incluida la caché KV para contextos moderados (estimación a partir del tamaño del archivo; no medida por el autor).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para contextos cortos (GTX 1650, RTX 3050, RTX 4060). Para contextos largos cerca de los 32.768 tokens del modelo base, se recomienda 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070).
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs discretas modernas, y también en placas integradas con memoria unificada (Apple Silicon, APUs con 8 GB o más).
- Despliegue: llama.cpp (`llama-cli`, `llama-server`) es la vía nativa; también Ollama, LM Studio o cualquier runtime compatible con GGUF. vLLM y TGI no son la opción natural para este artefacto salvo que se use el modelo en safetensors.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo de 1,5B en Q6_K sobre CPU moderna suele generar del orden de varias decenas de tokens por segundo, y sobre GPU de consumo puede superar holgadamente el centenar, pero no hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QwenDGAF-1.5B (este) | 1,54B | No declarado; 32.768 en el base | No declarada en el repo | GGUF Q6_K en HuggingFace, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | Pesos safetensors y GGUF oficiales |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 | Licencia comunitaria Llama 3.2 | Pesos oficiales y múltiples GGUF |
| Gemma 2 2B IT | 2,61B | 8.192 | Términos de uso de Gemma | Pesos oficiales y GGUF |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 | Apache 2.0 | Pesos oficiales y GGUF |

Los datos de los modelos comparados provienen de su documentación pública y no han sido verificados en este repositorio. En igualdad de parámetros, la ventaja diferencial de esta ficha es la cuantización Q6_K ya empaquetada; su desventaja es la ausencia de licencia declarada, que impide determinar si el uso comercial está permitido.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica términos de uso. Aunque el modelo base sea Apache 2.0, la falta de declaración expresa es un riesgo legal para uso comercial; conviene contactar con el autor o usar el modelo base oficial.
- Procedencia incierta: la model card solo indica la conversión a GGUF con Unsloth. No se documenta si hubo ajuste fino, con qué datos ni con qué método, por lo que no puede evaluarse qué comportamiento añade el sufijo "DGAF".
- Riesgo de alucinación: con 1,5B parámetros la tasa de invención de hechos es alta, especialmente en preguntas abiertas, citas y datos numéricos. No es adecuado para respuestas factuales sin verificación.
- Razonamiento limitado: esperable un rendimiento bajo en matemáticas de varios pasos, lógica compleja y planificación de agentes; el seguimiento de instrucciones largas se degrada con prompts extensos.
- Idiomas no declarados: no hay garantía de calidad fuera de inglés y chino; el castellano funcionará de forma irregular y debe evaluarse antes de desplegar.
- Tool calling y modo agente no confirmados: la plantilla Jinja y el tag `endpoints_compatible` no garantizan un soporte fiable de function calling.
- Sesgos: heredados de los datos de preentrenamiento del modelo base, no auditados en este repositorio.
- Señales de mantenimiento: 0 descargas, 0 likes y una única revisión del repositorio, lo que sugiere un artefacto personal sin validación comunitaria.
- La cuantización Q6_K, aunque conservadora, introduce una degradación no medida frente al modelo en precisión completa; no hay evaluación comparativa publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hecan3d/QwenDGAF-1.5B
- Modelo base de referencia (Qwen2.5-1.5B-Instruct): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth, herramienta de conversión citada: https://github.com/unslothai/unsloth
- llama.cpp, runtime indicado en la model card: https://github.com/ggml-org/llama.cpp
