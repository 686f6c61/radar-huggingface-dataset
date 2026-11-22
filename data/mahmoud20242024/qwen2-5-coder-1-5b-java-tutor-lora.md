# Mahmoud20242024/Qwen2.5-Coder-1.5B-Java-Tutor-LoRA

## Resumen

Qwen2.5-Coder-1.5B-Java-Tutor-LoRA es un adaptador LoRA publicado por el usuario Mahmoud20242024 sobre el modelo base unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit. Se trata, por tanto, de un fine-tuning por supervisión (SFT) del conocido modelo de código de Qwen de 1.500 millones de parámetros, orientado según su nombre a ejercer como tutor de Java. No es un modelo completo, sino un conjunto de pesos de adaptador (formato PEFT/safetensors) que debe cargarse junto al modelo base cuantizado en 4 bits para funcionar.

El modelo base subyacente, Qwen2.5-Coder-1.5B-Instruct, pertenece a la familia Qwen2.5-Coder de Alibaba, una arquitectura transformer decoder-only densa con 1.500 millones de parámetros y una ventana de contexto de 32.768 tokens. Este adaptador hereda esas capacidades generales y las especializa, en teoría, hacia la enseñanza y explicación de Java. El repositorio es de tamaño reducido (0,1 GB), coherente con un adaptador LoRA y no con pesos completos.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo con cero descargas y cero likes, con una model card prácticamente vacía (plantilla sin rellenar) y sin datos publicados de entrenamiento, evaluación ni licencia. Resulta útil como ejemplo de fine-tuning ligero con Unsloth sobre modelos de código pequeños, pero no debe considerarse un artefacto listo para producción sin una evaluación propia y una verificación explícita de la licencia heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only denso (Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.500 millones en el modelo base; el adaptador LoRA ocupa 0,1 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-Coder-1.5B; no confirmado para el adaptador |
| Tipos de cuantizacion | modelo base cargado en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5-Coder soporta principalmente ingles y chino, con cobertura multilingue parcial |
| Licencia | no disponible en la model card; debe verificarse la del modelo base (Qwen2.5-Coder se distribuye bajo Apache 2.0, salvo confirmacion) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en formato transformers/GGUF segun despliegue |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT (supervised fine-tuning) mediante las librerías TRL y Unsloth, según las etiquetas del repositorio. El modelo base es Qwen2.5-Coder-1.5B-Instruct en su variante cuantizada a 4 bits (bnb-4bit) publicada por Unsloth, lo que permite entrenar el adaptador con requisitos de memoria muy reducidos. La arquitectura subyacente es un transformer decoder-only denso con atención por causalidad estándar, sin mezcla de expertos ni mecanismos híbridos.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens vistos, la composición del dataset (si son ejemplos de tutoría de Java, pares pregunta-respuesta, código comentado, etc.), los hiperparámetros de entrenamiento ni si se aplicó RLHF o DPO. La model card es una plantilla sin rellenar y no aporta ninguno de estos datos. Tampoco se documentan innovaciones técnicas propias más allá del uso de LoRA y de la cuantización 4-bit del base.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Generación y explicación de código, presumiblemente orientada a Java por el nombre del adaptador, aunque no hay evaluación que lo confirme.
- Razonamiento sobre código y matemáticas básicas, limitado por el tamaño de 1.500 millones de parámetros del base.
- Soporte de tool calling / function calling heredado del base Instruct (no verificado en el adaptador).
- Capacidades multilingües del base (inglés y chino principalmente); el comportamiento en castellano no está documentado.
- No se documenta modo thinking, visión, audio ni capacidades de agente específicas del adaptador.

## Casos de uso

- Tutoría de Java en entornos educativos: el adaptador se cargaría junto al base para responder dudas de sintaxis, explicar conceptos de POO y proponer ejercicios, aprovechando el ajuste SFT orientado a tutoría. Requiere validación previa de la calidad real de las respuestas.
- Asistente de aprendizaje en línea con presupuesto de hardware mínimo: al ser un adaptador sobre un modelo de 1,5B en 4 bits, puede desplegarse en una GPU de consumo para prototipos de plataformas educativas.
- Generación de ejemplos de código Java comentado: útil para crear material docente o snippets de ejemplo en documentación interna, siempre con revisión humana.
- Explicación de errores de compilación: el modelo puede recibir un mensaje de error de javac y proponer una explicación y corrección, aunque la fiabilidad en errores complejos será limitada por el tamaño del base.
- Base para nuevos fine-tunings: el adaptador sirve como punto de partida para experimentos de LoRA sobre dominios específicos de Java (frameworks, testing, etc.) con Unsloth y TRL.
- Prototipado de chatbots de soporte técnico para equipos de desarrollo: integrado en una interfaz de chat, puede resolver preguntas frecuentes sobre Java con coste de inferencia bajo.
- Investigación sobre eficiencia de fine-tuning: caso de estudio de SFT con LoRA y cuantización 4-bit sobre modelos de código pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y el repositorio no reporta comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits ocupa aproximadamente 1-2 GB de pesos; con overhead de activaciones y contexto, se estima un uso de 3-5 GB de VRAM para contextos moderados (estimación, no dato publicado).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para el base cuantizado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sobradamente.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas con 6 GB o más, al operar sobre un base de 1,5B cuantizado.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp u Ollama si se fusiona el adaptador con el base y se convierte a GGUF; vLLM y TGI son posibles con el adaptador fusionado, aunque no se documenta soporte directo.
- Latencia y throughput: no disponibles; en una RTX 4090 se espera un throughput alto por el reducido tamaño del base, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Java-Tutor-LoRA (este) | 1,5B (base) + LoRA | 32.768 (base) | no disponible | Hugging Face, 0 descargas | Adaptador SFT, sin evaluación publicada |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5B | 32.768 | Apache 2.0 (segun ficha oficial de Qwen) | Ampliamente disponible | Modelo oficial, con benchmarks publicados |
| DeepSeek-Coder-1.3B-Instruct | 1,3B | 16.384 | DeepSeek License | Hugging Face | Alternativa de código de tamaño similar |
| StarCoder2-3B | 3B | 16.384 | BigCode OpenRAIL-M | Hugging Face | Mayor tamaño, licencia con restricciones de uso |

La comparación de rendimiento no puede establecerse porque el adaptador no publica métricas; en la práctica, cualquier comparación debería hacerse contra el modelo base oficial, que sí dispone de evaluaciones.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto, lo que impide auditar el adaptador.
- Licencia no declarada: es imprescindible verificar la licencia del modelo base (Qwen2.5-Coder) y confirmar que el autor del adaptador permite uso comercial antes de desplegarlo en producción.
- Riesgo de alucinación: al ser un modelo de 1,5B, la probabilidad de generar código Java incorrecto o explicaciones erróneas es significativa; requiere validación humana.
- Especialización no verificada: el nombre sugiere tutoría de Java, pero no hay evidencia publicada de que el adaptador mejore al base en esa tarea.
- Limitaciones de idioma: no se documenta el comportamiento en castellano; el base está optimizado para inglés y chino.
- Contexto efectivo limitado: aunque el base soporta 32.768 tokens, el adaptador no ha sido evaluado con contextos largos.
- Cero tracción: 0 descargas y 0 likes indican ausencia de validación por parte de la comunidad.
- Dependencia del base cuantizado: el adaptador se entrenó sobre una versión bnb-4bit de Unsloth; cargarlo sobre otras variantes puede degradar el comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mahmoud20242024/Qwen2.5-Coder-1.5B-Java-Tutor-LoRA
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit
- Modelo oficial Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio Qwen2.5-Coder en GitHub: https://github.com/QwenLM/Qwen2.5-Coder
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Calculadora de impacto ambiental (referenciada en la model card): https://mlco2.github.io/impact
