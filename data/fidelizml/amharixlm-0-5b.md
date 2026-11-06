# fidelizML/AmhariXLM-0.5B

## Resumen

AmhariXLM-0.5B es un modelo de lenguaje bilingüe (amárico e inglés) de 565 millones de parámetros, desarrollado por el equipo fidelizML (Fideliz AI). Se presenta como un modelo entrenado desde cero siguiendo la arquitectura LLaMA y afinado mediante supervisión (SFT) para tareas de pregunta-respuesta en el ámbito educativo, con material curricular de primaria y secundaria. Es relevante para la comunidad de investigación en modelos de lenguaje de bajos recursos, especialmente para lenguas africanas como el amárico, donde escasean los modelos abiertos con licencia permisiva.

El modelo emplea una arquitectura transformer de tipo LLaMA con 8 capas, tamaño oculto de 3072, 12 cabezas de atención (3 cabezas KV, es decir, atención con consultas agrupadas) y un vocabulario de 24.000 tokens basado en SentencePiece Unigram. La ventana de contexto es notablemente reducida: 250 tokens, lo que limita su uso a interacciones cortas y preguntas directas.

La licencia Apache 2.0 permite uso comercial y no comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para integrarlo en herramientas educativas. No obstante, sus capacidades son limitadas: el propio autor advierte que no es adecuado para decisiones médicas, legales, financieras o de seguridad crítica, y que falla en aritmética de varios dígitos y en algunos hechos sobre amárico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo LLaMA (entrenado desde cero) |
| Parametros totales | 564.575.232 (~565 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 250 tokens |
| Tipos de cuantizacion | no disponible (pesos en float16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Amárico (am), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 2,3 GB) |

## Arquitectura y entrenamiento

El modelo sigue la disposición de configuración de LLaMA, pero todos los pesos se entrenaron desde cero, sin reutilizar pesos de un modelo base externo. Consta de 8 capas transformer con un tamaño oculto de 3072 y una dimensión intermedia de 4096. La atención utiliza 12 cabezas de consulta y 3 cabezas de clave-valor (GQA), lo que reduce el coste de memoria en inferencia. El vocabulario de 24.000 tokens se construyó con SentencePiece en modo Unigram, con tokens especiales `bos=1`, `eos=2` y `pad=0`. La precisión de los pesos es float16.

El entrenamiento consistió en un ajuste supervisado (SFT) sobre un corpus curado con formato de prompt ChatML. Los datos provienen de libros de texto de primaria y secundaria (grados 1 a 10), artículos de Wikipedia en amárico e inglés, material de lectura general y pares de pregunta-respuesta centrados en el currículo. La mezcla lingüística es aproximadamente 30% amárico y 70% inglés. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT, ni se detalla el número total de tokens de entrenamiento.

Una particularidad técnica destacable es que el tokenizador usa `split_digits=False`, de modo que los números completos se tratan como un único token. Esto explica en parte las dificultades del modelo con la aritmética de varios dígitos.

## Capacidades

- Generación de texto y respuesta a preguntas factuales sencillas, especialmente definiciones científicas (biología, física, química) y conceptos curriculares.
- Razonamiento básico de un solo paso en aritmética con números pequeños, aunque con resultados inconsistentes.
- Comprensión y generación en amárico e inglés, con mayor dominio del inglés según la proporción de datos de entrenamiento.
- Soporte de formato ChatML mediante los tokens `<|im_start|>` y `<|im_end|>`, compatible con plantillas de chat estándar.
- Consulta de símbolos químicos y gramática inglesa básica (plurales, opuestos).
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- **Tutor educativo de definiciones científicas**: el modelo puede responder preguntas directas como "¿Qué es una célula?" o "¿Qué significa CPU?" con alta precisión según las pruebas del autor (90-95% en definiciones curadas). Es adecuado para aplicaciones de repaso de conceptos básicos en inglés y amárico.
- **Generación de cuestionarios y fichas de estudio**: a partir de un tema curricular, el modelo puede producir preguntas y respuestas breves para profesores que preparan material de primaria, gracias a su entrenamiento sobre libros de texto de grados 1 a 10.
- **Asistente de vocabulario y gramática inglesa**: útil para consultas sobre plurales, antónimos y símbolos químicos, integrable en aplicaciones de aprendizaje de idiomas con ventana de contexto corta.
- **Apoyo a la lectoescritura en amárico**: puede servir como herramienta de práctica de gramática amárica en frases cortas, aunque con riesgo de alucinación en hechos concretos como capitales o datos históricos.
- **Prototipado de investigación en modelos de bajos recursos**: investigadores pueden usar el modelo como línea base para experimentos con lenguas africanas, dado que es entrenado desde cero y tiene licencia Apache 2.0, lo que facilita la reproducibilidad y la comparación.
- **Demostraciones interactivas en Hugging Face Spaces**: el autor proporciona un ejemplo de interfaz Gradio; el tamaño reducido (565 M) permite desplegarlo en CPU o GPU consumer para demos educativas sin infraestructura costosa.
- **Clasificación y extracción de respuestas cortas**: en pipelines de preguntas cerradas con contexto muy breve (menos de 250 tokens), puede emplearse para responder cuestionarios de opción múltiple o verdadero/falso sobre temas curriculares.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (no verificados de forma independiente) son los siguientes:

| Benchmark | Resultado | Notas |
|---|---|---|
| Science definition Q&A (Bio/Fís/Quím) | 90-95% de accuracy | Sobre conjunto curado de definiciones |
| Single-step arithmetic | 45-80% de accuracy | Rango según estrategia de decodificación; mejor con números pequeños |
| GSM8K (matemáticas multi-paso) | 37-55% de accuracy | Con ajustes de inferencia (best-of-N / self-consistency) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 565 M de parámetros en float16, los pesos ocupan aproximadamente 1,1 GB. Con overhead de activaciones y caché KV, se puede ejecutar con menos de 2 GB de VRAM en FP16. En cuantización de 8 bits o 4 bits (no documentada oficialmente) cabría en menos de 1 GB.
- **GPU recomendadas**: cualquier GPU consumer moderna es suficiente. Funciona en RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia con latencia aceptable. Para despliegue en producción a pequeña escala, una T4 o L4 es más que suficiente.
- **¿Cabe en GPU consumer?**: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1650, RTX 3050 y superiores.
- **Opciones de despliegue**: compatible con `transformers` (LlamaForCausalLM), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), y potencialmente llama.cpp/Ollama si se convierte a GGUF (no se proporciona GGUF oficial). FriendliAI ofrece un endpoint de inferencia para este modelo.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Dado el tamaño reducido, se espera una latencia de decodificación de decenas de tokens por segundo en GPU consumer, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| AmhariXLM-0.5B | 565 M | 250 tokens | am, en | Apache 2.0 | Entrenado desde cero, enfoque educativo, contexto muy limitado |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | multilingüe (incluye en, no am destacado) | Apache 2.0 | Modelo generalista con contexto mucho mayor y mejor rendimiento en benchmarks estándar |
| SmolLM2-360M | 362 M | 8.192 tokens | en (principalmente) | Apache 2.0 | Alternativa pequeña para inglés, sin soporte de amárico |
| Gemma-2-2B | 2.600 M | 8.192 tokens | multilingüe | Gemma license | Mayor tamaño y capacidades, pero licencia más restrictiva |

No se dispone de comparaciones directas de rendimiento entre AmhariXLM-0.5B y estos modelos en tareas de amárico. La comparativa se basa en especificaciones públicas.

## Limitaciones y advertencias

- **Contexto muy limitado**: 250 tokens restringen severamente las conversaciones multi-turno y el procesamiento de documentos. Cualquier prompt que supere esa longitud se truncará.
- **Aritmética poco fiable**: el tokenizador agrupa números completos en un solo token, lo que impide generalizar a operaciones con dígitos no vistos. El propio autor indica que no es una calculadora.
- **Alucinaciones en amárico**: se documentan fallos en el recuerdo de hechos como "la capital de Etiopía", que puede inventar. No es fiable para datos factuales que no estén bien representados en el corpus.
- **Fórmulas físicas**: el autor señala que la ley de Ohm puede producir resultados sin sentido; no es adecuado para derivaciones o cálculos científicos.
- **Sesgos**: no se documentan sesgos específicos, pero al entrenarse con libros de texto y Wikipedia, puede reflejar sesgos de esas fuentes. La proporción 70/30 hacia el inglés puede infrarrepresentar matices culturales amáricos.
- **Licencia Apache 2.0**: permite uso comercial sin restricciones, pero el autor desaconseja explícitamente su uso en decisiones médicas, legales, financieras o de seguridad crítica.
- **Formato de parada**: es imprescindible añadir el token `<|im_end|>` al `eos_token_id` durante la generación; de lo contrario, el modelo no se detiene de forma natural y sigue generando hasta `max_new_tokens`.
- **No verificado**: los benchmarks son declarados por el autor y no han sido verificados de forma independiente; los rangos amplios (por ejemplo, 45-80% en aritmética) indican alta variabilidad según la decodificación.

## Enlaces

- [Hugging Face: fidelizML/AmhariXLM-0.5B](https://huggingface.co/fidelizML/AmhariXLM-0.5B)
- [Perfil de fidelizML en Hugging Face](https://huggingface.co/fidelizML)
- [Endpoint de inferencia en FriendliAI](https://friendli.ai/models/fidelizML/AmhariXLM-0.5B)
- [Modelo base declarado: yisberh/fidel_law_1](https://huggingface.co/yisberh/fidel_law_1)
