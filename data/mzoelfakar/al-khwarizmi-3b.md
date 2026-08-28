# mzoelfakar/Al-Khwarizmi-3B

## Resumen

Al-Khwarizmi-3B es un modelo de lenguaje de 3.075 millones de parámetros, resultado de un fine-tuning del modelo base HuggingFaceTB/SmolLM3-3B-Base, desarrollado por Mohamed Zoelfakar como parte del smol-course de Hugging Face en Nvidia Studio Cairo. Está especializado en la resolución de problemas matemáticos de nivel escolar (tipo GSM8K) con razonamiento paso a paso, y se presenta como un tutor de matemáticas conversacional. Su relevancia radica en demostrar cómo un modelo compacto de 3B puede mejorar sustancialmente sus capacidades aritméticas mediante una combinación de full fine-tuning y LoRA, manteniendo un tamaño reducido que permite su despliegue en entornos con recursos limitados.

El modelo fue entrenado en dos etapas: primero un full fine-tuning sobre una muestra de 1.000 ejemplos de GSM8K, y después un fine-tuning LoRA (r=16) sobre el dataset completo, incluyendo tanto el estilo de razonamiento `main` como el `socratic`. Los resultados reportados por el autor indican una precisión media de token del 87,21% en datos de validación, con una pérdida de validación reducida en un 19% respecto al modelo inicial. Está disponible en formato safetensors, y existe una versión GGUF cuantizada (BF16 y Q8_0) en un repositorio separado para su uso eficiente en CPU. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en SmolLM3-3B-Base) |
| Parametros totales | 3.075.098.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (BF16); GGUF con BF16 y Q8_0 en repositorio aparte |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (en repo separado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SmolLM3-3B-Base, un transformer decoder autoregresivo de 3B parámetros. El fine-tuning se realizó en dos etapas secuenciales sobre el dataset GSM8K (openai/gsm8k), que contiene problemas aritméticos de escuela primaria con respuestas numéricas únicas. La primera etapa consistió en un full fine-tuning con 1.000 muestras aleatorias (split 90/10 train/val), 450 pasos, learning rate 5e-5 con scheduler coseno, alcanzando una pérdida de validación de 0.569 y una precisión de token del 84,75%. La segunda etapa aplicó LoRA con r=16 sobre todos los módulos lineales, entrenando sobre el dataset GSM8K completo (estilos `main` y `socratic`) en dos pasadas consecutivas, intercambiando el split entre ambas para que cada problema se viera en ambos estilos de razonamiento. Esta fase requirió 3.550 pasos, con una pérdida final de 0.462 y una precisión del 87,21%. No se emplearon técnicas de RLHF ni DPO; el entrenamiento fue puramente supervisado. El autor reporta que las curvas de pérdida de entrenamiento y validación siguieron una trayectoria cercana, sin evidencia de sobreajuste.

## Capacidades

- Generacion de texto con razonamiento matematico paso a paso, especialmente en problemas aritmeticos de nivel escolar (sumas, restas, multiplicaciones, divisiones, porcentajes, velocidades, etc.).
- Resolucion de problemas de tipo GSM8K, incluyendo el estilo `socratic` que descompone el problema en sub-preguntas con calculos intermedios.
- Conversacion en ingles gracias al template de chat aplicado (system + user), permitiendo interacciones de tutoría.
- Generacion de explicaciones didacticas y detalladas, adecuadas para entornos educativos.
- Capacidad limitada de generalizacion a otros dominios matematicos; el modelo esta especializado en problemas de estructura similar a GSM8K.
- No soporta tool calling, ni vision, ni audio, ni funciones de agente.

## Casos de uso

- Tutor matematico para estudiantes de primaria y secundaria: el modelo puede recibir un problema en lenguaje natural y devolver una solucion paso a paso, explicando cada operacion, lo que facilita el aprendizaje autonomo.
- Generacion de problemas de practica y soluciones: se puede usar para crear ejercicios de aritmetica con sus respuestas, por ejemplo en plataformas de generacion de contenido educativo.
- Asistente de deberes en aplicaciones moviles o web: integrado en un chatbot, el modelo responde preguntas de matematicas de nivel escolar, ofreciendo razonamiento detallado en lugar de solo el resultado final.
- Evaluacion automatica de respuestas matematicas: dado un problema y una respuesta del estudiante, el modelo puede comparar con la solucion generada y determinar si es correcta, aunque se requiere post-procesamiento para extraer la respuesta final (marcada con `####`).
- Chatbot educativo en ingles para practicar conversacion sobre conceptos aritmeticos: el modelo mantiene un dialogo coherente y puede explicar reglas matematicas basicas.
- Base para fine-tuning adicional en dominios especificos: al estar entrenado sobre un dataset acotado, puede servir como punto de partida para especializacion en otros tipos de problemas matematicos o razonamiento numerico.
- Inferencia en entornos con recursos limitados: gracias a su tamano de 3B, puede desplegarse en GPUs de consumo (8-12 GB VRAM con cuantizacion) o incluso en CPU mediante la version GGUF, lo que lo hace util para prototipos y aplicaciones edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K completo) en la informacion disponible. El autor reporta metricas de validacion interna sobre el split de GSM8K utilizado durante el entrenamiento:

| Etapa | Perdida de validacion | Precision media de token |
|---|---|---|
| Primer checkpoint | no disponible | 82,4% |
| Tras full fine-tuning | 0.569 | 84,75% |
| Tras LoRA (final) | 0.462 | 87,21% |

Estas cifras corresponden a datos de validacion del propio proceso de entrenamiento y no son comparables con benchmarks publicos. No se dispone de comparaciones con otros modelos en tareas estandarizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, el modelo requiere aproximadamente 6 GB de VRAM (3B parametros x 2 bytes), mas overhead de activaciones y cache, por lo que se recomienda al menos 8 GB. Con cuantizacion GGUF Q8_0, el tamaño se reduce a unos 3 GB, permitiendo ejecucion en GPUs con 4-6 GB o en CPU.
- GPU recomendadas: RTX 3090/4090 (24 GB) para inferencia comoda con contexto largo; GPUs de 8 GB (RTX 3060, 3070) son suficientes con cuantizacion.
- Puede ejecutarse en GPU de consumo, especialmente con cuantizacion GGUF.
- Opciones de despliegue: Transformers (Python), vLLM (probablemente compatible, aunque no verificado), llama.cpp para GGUF, Ollama (si se convierte el modelo), Hugging Face TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria (3B especializados en matematicas). El modelo es un fine-tune de SmolLM3-3B-Base, por lo que su rendimiento base es el de ese modelo, mejorado en tareas GSM8K. Alternativas como StableLM Zephyr 3B o VibeThinker-3B existen en el espacio de modelos 3B, pero no se conocen benchmarks publicos de este modelo frente a ellos. Se recomienda consultar la documentacion de SmolLM3 para una comparativa con el modelo base.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre problemas de tipo GSM8K (aritmetica de escuela primaria con respuesta numerica unica); su rendimiento en problemas matematicos mas complejos, multi-parte o con estructura diferente no esta probado.
- Puede cometer errores aritmeticos ocasionales en problemas de varios pasos, una limitacion conocida en modelos de este tamano.
- La salida en bruto contiene artefactos de entrenamiento como `<<...>>` (anotaciones de calculadora), `**` (separador entre sub-pregunta y calculo), `####` (marcador de respuesta final) y `*` como signo de multiplicacion. Si se muestra en un renderizador Markdown, estos caracteres pueden interpretarse incorrectamente (por ejemplo, `**` como negrita), por lo que se requiere post-procesamiento.
- Solo soporta ingles; no se ha evaluado su comportamiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribucion y no se ofrecen garantias de exactitud o seguridad.
- No se han realizado evaluaciones de sesgos, toxicidad o seguridad; su uso en entornos de produccion debe ir acompanado de validacion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mzoelfakar/Al-Khwarizmi-3B
- Version GGUF cuantizada: https://huggingface.co/mzoelfakar/Al-Khwarizmi-3B-GGUF
- Demo en Colab: https://colab.research.google.com/github/mzoelfakar/Al-Khwarizmi-3B/blob/main/Al-Khwarizmi-3B.ipynb
- Curso smol-course de Hugging Face: https://huggingface.co/learn/smol-course/
- Perfil de LinkedIn del autor: https://www.linkedin.com/in/mzoelfakar/
- Nvidia Studio Cairo: https://www.nvidiastudiospace.com/en/hubs/cairo
