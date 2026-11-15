# ghostman5658/dsc670-meta-earnings-qwen2.5-0.5b-q8

## Resumen

El modelo `ghostman5658/dsc670-meta-earnings-qwen2.5-0.5b-q8` es un ajuste fino supervisado del modelo Qwen2.5-0.5B-Instruct de Alibaba, publicado por el usuario ghostman5658 como parte de un proyecto de curso (DSC670). El objetivo declarado es reproducir el registro hablado de los directivos de Meta durante las llamadas de resultados trimestrales (earnings calls), respondiendo a preguntas de analistas con el estilo de una conferencia pública de resultados. Se distribuye en formato GGUF Q8_0 generado con llama.cpp y se acompaña de una segunda conversión del modelo base sin modificar para permitir comparaciones directas.

El modelo es relevante no por su rendimiento —el propio autor documenta que el ajuste fino obtiene peores resultados que el modelo base en el trimestre de validación— sino como caso de estudio metodológico: ilustra cómo un ajuste fino con pocos datos y dos épocas puede desplazar el estilo de generación sin mejorar la fidelidad factual, e incluso incrementar la tendencia a inventar cifras. La arquitectura subyacente es un transformer decoder-only de 494 millones de parámetros con ventana de contexto de 32.768 tokens (heredada de Qwen2.5), cuantizado a 8 bits.

La relevancia práctica es limitada: se trata de una demostración docente, no de una herramienta de producción ni de una fuente de información financiera, tal y como advierte explícitamente la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino completo del base Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-0.5B-Instruct; no verificada en la model card) |
| Tipos de cuantizacion | Q8_0 (GGUF); se incluye tambien el base sin ajustar en Q8_0 |
| Idiomas soportados | no disponible (la model card no los declara; el base Qwen2.5 es multilingue) |
| Licencia | Apache-2.0 (base); transcripciones de origen CC0 segun Kaggle |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención de tipo causal estándar, y se somete a un ajuste fino supervisado completo (full fine-tune, sin LoRA) sobre pares de pregunta y respuesta extraídos de transcripciones públicas de llamadas de resultados de Meta, cubriendo desde el Q3 2018 hasta el Q4 2024 como conjunto de entrenamiento y el Q1 2025 como validación. La pérdida es de tipo next-token sobre los tokens del asistente, con un system prompt fijo que instruye al modelo a responder como un directivo de Meta, en frases habladas, sin viñetas ni eslóganes, y agradeciendo al analista por su nombre cuando se conoce.

El entrenamiento se realizó localmente sobre Apple Silicon (el autor indica que el fine-tuning alojado de OpenAI fue rechazado para su cuenta) y se ejecutaron únicamente dos épocas, con pérdida de validación plana tras la primera. El checkpoint de la semana 8 se convirtió a GGUF Q8_0 con llama.cpp sin entrenamiento adicional. No se documenta el número exacto de tokens de entrenamiento, la composición detallada del dataset, ni el uso de RLHF o DPO; tampoco se describe ninguna innovación arquitectónica propia, ya que el modelo hereda íntegramente la arquitectura del base.

## Capacidades

- Generación de texto conversacional en registro de llamada de resultados: responde a preguntas de analistas imitando el estilo hablado de directivos de Meta.
- Ajuste de estilo y registro: el fine-tune desplaza la salida hacia frases habladas, sin viñetas y con apertura de agradecimiento al analista.
- Razonamiento y conocimiento general: limitados por el modelo base de 0,5B; no se documentan mejoras en esta dimensión.
- Tool calling / function calling: no documentado en esta variante; el base Qwen2.5-Instruct lo soporta, pero el ajuste fino no lo preserva de forma verificada.
- Agentes y razonamiento multi-paso: no documentado; el tamaño del modelo y la naturaleza del ajuste lo hacen poco adecuado.
- Capacidades multilingües: no documentadas; heredadas del base, sin verificación tras el ajuste.
- Modo thinking, visión o audio: no disponible.
- Cuantización lista para llama.cpp: ejecutable con `llama-cli` mediante el comando documentado por el autor.

## Casos de uso

- Demostración docente de ajuste fino supervisado: el par de GGUF (ajustado y base) permite comparar en el aula cómo cambia el estilo y la fidelidad de un modelo pequeño tras un fine-tune con pocos datos.
- Estudio de deriva estilística: analizar cómo un system prompt y un corpus de transcripciones moldean el registro de salida sin mejorar la precisión factual.
- Evaluación de alucinación en dominios financieros: el caso documentado (una caída interanual del 29 % inexistente en la fuente) sirve como ejemplo reproducible de invención de cifras en modelos pequeños.
- Reproducción de experimentos con llama.cpp: el comando de inferencia está documentado y el repo incluye el base sin ajustar, lo que facilita réplicas controladas.
- Generación de borradores de guion para simulaciones de earnings call: útil en formación o teatro corporativo, nunca como fuente de datos.
- Benchmarking de cuantización Q8_0 en modelos de 0,5B: comparar latencia y calidad frente al base en el mismo formato.
- Pruebas de pipelines de evaluación de estilo: usar el modelo como generador de texto con registro específico para calibrar clasificadores de tono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una evaluación cualitativa en el trimestre de validación (Q1 2025), en la que el modelo ajustado resultó peor que el base y produjo al menos una cifra inventada (una caída interanual del 29 % ausente en la fuente).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-0,8 GB en Q8_0 (494 M parámetros a ~8,5 bits por peso, más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también CPU y Apple Silicon son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1050 Ti, RTX 3050, RTX 4090, etc.) e incluso en iGPU y Raspberry Pi con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (tras importar el GGUF), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera decodificación en tiempo real o superior en hardware de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dsc670-meta-earnings-qwen2.5-0.5b-q8 (este) | 494 M | 32.768 (heredado) | Peor que el base en validación; alucina cifras | Apache-2.0 | GGUF en HF |
| Qwen2.5-0.5B-Instruct (base) | 494 M | 32.768 | Referencia del ajuste; mejor en el trimestre de validación | Apache-2.0 | safetensors y GGUF en HF |
| Qwen2.5-1.5B-Instruct | ~1.500 M | 32.768 | Superior al de 0,5B en razonamiento y fidelidad | Apache-2.0 | safetensors y GGUF en HF |
| SmolLM2-360M-Instruct | ~360 M | 8.192 | Similar en tamaño; contexto menor | Apache-2.0 | safetensors y GGUF en HF |

## Limitaciones y advertencias

- El propio autor documenta que el ajuste fino es peor que el modelo base en el trimestre de validación (Q1 2025).
- Tiende a inventar cifras: se cita una caída interanual del 29 % que no aparece en la fuente.
- Puede reproducir afirmaciones específicas de las transcripciones de Meta fuera de contexto.
- La pérdida de validación se estancó tras la primera época; solo se ejecutaron dos épocas.
- El modelo no es una fuente de información financiera; la model card lo declara explícitamente como demo docente.
- Sesgos conocidos: no documentados, pero hereda los del base Qwen2.5-0.5B-Instruct y los del corpus de transcripciones de una sola empresa.
- Idiomas soportados no declarados; el ajuste se realizó sobre transcripciones en inglés, lo que puede degradar el multilingüismo del base.
- Contexto de 32.768 tokens heredado del base, no verificado tras el ajuste.
- Licencia Apache-2.0 permite uso comercial del modelo, pero las transcripciones de origen son CC0 según Kaggle; conviene verificar la cadena de licencias antes de un uso comercial.
- Sin descargas ni likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ghostman5658/dsc670-meta-earnings-qwen2.5-0.5b-q8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset de transcripciones (Kaggle, CC0, según la model card): no disponible el enlace exacto en la información proporcionada
