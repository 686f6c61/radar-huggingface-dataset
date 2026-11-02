# muahseol/qwen3.5-0.8b-labor-sft

## Resumen

`muahseol/qwen3.5-0.8b-labor-sft` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-0.8B`, publicado por el usuario muahseol en HuggingFace. Se trata de un modelo de generación de texto especializado en consultas laborales en coreano, entrenado sobre pares de pregunta y respuesta de asesoría laboral. Su propósito declarado es didáctico: sirve como modelo de referencia (reference model) para prácticas de alineación por DPO.

El modelo cuenta con 752.393.024 parámetros (aproximadamente 0,75 mil millones) y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 3,0 GB porque los pesos se guardan en float32, lo que triplica el espacio respecto a una versión en bf16. Es un modelo pequeño, orientado a experimentación y a entornos con recursos limitados, no a producción.

Su relevancia es acotada: no aporta innovaciones arquitectónicas sobre el modelo base y su único valor diferencial es el ajuste en el dominio de derecho laboral coreano. La model card advierte explícitamente de que puede generar artículos legales incorrectos y contenido inventado, y desaconseja su uso en asesoría real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, variante de texto `qwen3_5_text`) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 orientado a texto. No se dispone de detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención ni vocabulario, ya que la model card no los documenta y la información proporcionada no los incluye.

El entrenamiento consistió en un ajuste fino supervisado completo (full fine-tuning) sobre un conjunto de datos de preguntas y respuestas de asesoría laboral, durante 3 épocas, según se indica en la model card. El sistema de prompt empleado fue: «너는 노무 상담 챗봇이다. 노동법 조문에 근거해 존댓말로 간결히 답한다.» (Eres un chatbot de asesoría laboral. Responde de forma concisa y en registro formal basándote en los artículos de la legislación laboral). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación en esta fase; de hecho, el modelo está pensado como punto de partida para un entrenamiento DPO posterior. Tampoco se especifican el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional en coreano, con registro formal (존댓말).
- Respuesta a consultas de asesoría laboral dentro del dominio de entrenamiento.
- Formato de chat multi-turno compatible con la librería `transformers` y con la pipeline `text-generation`.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidad multilingüe limitada: la etiqueta de idioma es únicamente `ko`, aunque el modelo base podría conservar competencias residuales en otros idiomas no verificadas.

## Casos de uso

- Práctica de alineación DPO: el uso principal declarado es servir como modelo de referencia o punto de partida en ejercicios de DPO, cargándolo con `AutoModelForCausalLM.from_pretrained` y comparando sus salidas con las del modelo políticamente alineado.
- Docencia y talleres de fine-tuning: permite ilustrar un pipeline completo de SFT sobre un modelo pequeño (0,75 B de parámetros) con un dominio acotado y un dataset específico.
- Experimentación con prompts de sistema en coreano: útil para estudiar cómo un system prompt prescriptivo («responde citando artículos laborales») condiciona el estilo y el contenido de las respuestas.
- Evaluación de riesgos de alucinación en dominios legales: sirve como caso de estudio controlado para medir la frecuencia de citas normativas inventadas en modelos pequeños ajustados con pocos datos.
- Prototipado de chatbots de dominio restringido: permite validar la viabilidad de un asistente de consultas laborales antes de invertir en un modelo mayor o en datos de más calidad.
- Pruebas de infraestructura de inferencia: al ser un modelo de menos de 1 B de parámetros, es adecuado para validar despliegues con `transformers`, endpoints compatibles o servidores de inferencia en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en float32: aproximadamente 3 GB solo para los pesos (752 M de parámetros × 4 bytes), más memoria para el contexto y las activaciones; en la práctica, entre 4 y 6 GB para secuencias cortas.
- VRAM estimada en bf16/fp16: alrededor de 1,5 GB para los pesos, con un total práctico de 2 a 4 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 0,8 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,4 GB para los pesos.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM es suficiente en float32; una RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sin problema. En entornos de servidor, una A100 o H100 está sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 4 GB o más de VRAM, especialmente si se convierte a bf16 o se cuantiza.
- Opciones de despliegue: `transformers` (soporte nativo, tal como indica la model card), endpoints compatibles, y previsiblemente vLLM, TGI o llama.cpp si se generan los pesos en los formatos correspondientes, aunque no se documenta ninguna conversión oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| muahseol/qwen3.5-0.8b-labor-sft | 752 M | no disponible | Apache 2.0 | HuggingFace | SFT en coreano para asesoría laboral, uso didáctico |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en la informacion | HuggingFace | Modelo base sin ajuste de dominio; capacidades generales |
| Qwen2.5-0.5B-Instruct | ~0,5 B | 32 768 tokens (según documentación pública de Qwen2.5) | Apache 2.0 | HuggingFace | Alternativa generalista de tamaño similar, multilingüe |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32 768 tokens (según documentación pública de Qwen2.5) | Apache 2.0 | HuggingFace | Alternativa generalista de mayor tamaño, con instrucciones |

La comparación con modelos de la familia Qwen2.5 se ofrece como referencia de categoría (modelos pequeños instruidos); los datos de contexto de esos modelos provienen de su documentación pública y no de la información proporcionada para este modelo, por lo que deben verificarse antes de usarse en producción.

## Limitaciones y advertencias

- Riesgo elevado de alucinación: la propia model card advierte de que las respuestas pueden contener artículos legales incorrectos y contenido inventado.
- No apto para asesoría laboral real: el autor lo declara explícitamente como modelo de práctica, no de uso profesional.
- Dominio y idioma restringidos: entrenado únicamente para consultas laborales en coreano; su rendimiento fuera de ese ámbito no está garantizado.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre un dataset de asesoría laboral concreto, puede reproducir los sesgos presentes en esos datos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor desaconseja el uso en producción por la falta de fiabilidad del contenido legal.
- Pesos en float32: el repositorio de 3,0 GB es más pesado de lo necesario; para despliegue conviene convertirlo a bf16 o cuantizarlo, lo que puede alterar ligeramente las salidas.
- Sin datos de benchmarks ni de contexto: no es posible evaluar su calidad de forma objetiva ni planificar despliegues con ventanas largas.
- Sin garantías de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un proyecto personal sin soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muahseol/qwen3.5-0.8b-labor-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
