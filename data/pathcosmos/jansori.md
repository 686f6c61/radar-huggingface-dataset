# pathcosmos/JANSORI

## Resumen

JANSORI es un modelo de lenguaje de tipo base (no instruido, sin ajuste conversacional) desarrollado por el usuario pathcosmos y publicado en Hugging Face. Se trata de un transformer denso de aproximadamente 3.221 millones de parámetros (3B) orientado a la generación de texto y, más concretamente, a la continuación de texto en coreano e inglés. El modelo se distribuye bajo licencia Apache 2.0 y en tres formatos: pesos BF16 en safetensors, Q8_0 en GGUF y Q4_K_M en GGUF.

La relevancia del modelo reside en su enfoque: es un modelo base pequeño, con un vocabulario de 65.536 tokens y una longitud de contexto verificada de 4.096 tokens, entrenado para tareas de continuación de texto sin tokens de rol conversacional. El autor documenta de forma inusualmente detallada el comportamiento del modelo en distintas cuantizaciones, incluyendo perplejidad por idioma, pruebas de aritmética, código y lectura, así como mediciones de latencia y VRAM en una GPU H200. Esta transparencia en la evaluación, incluyendo la exposición explícita de las limitaciones, es poco habitual en modelos de este tamaño.

No obstante, los resultados publicados muestran un rendimiento débil en tareas de razonamiento, matemáticas y código, con problemas de repetición en la generación y errores sistemáticos en aritmética básica. El modelo no dispone de ajuste por instrucciones ni de alineación mediante RLHF o DPO, por lo que su uso práctico queda restringido a experimentación con continuación de texto y a escenarios donde se requiera un modelo base pequeño en coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según tags de Hugging Face: llama) |
| Parametros totales | 3.221.400.576 (3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (verificada) |
| Tipos de cuantizacion | BF16, Q8_0 (GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF (Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta "llama" en los tags de Hugging Face y la descripción del autor como "3B Dense Base". Se trata, por tanto, de un transformer denso de aproximadamente 3.221 millones de parámetros con un vocabulario de 65.536 tokens. El autor indica que el modelo se entrenó para la continuación de texto en coreano e inglés, sin tokens de rol conversacional, lo que confirma que es un modelo base sin ajuste por instrucciones.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras formas de alineación. Tampoco se detallan innovaciones técnicas como decodificación especulativa o mecanismos de atención lineal. El autor menciona un entrenamiento de 47.000 pasos asociado a un commit de despliegue concreto, pero no aporta más detalles sobre el proceso. La model card incluye una nota técnica sobre diferencias numéricas entre la implementación estándar de Hugging Face y una implementación "native" (relacionada con el redondeo de RoPE y la forma de invocar la atención): de 268.435.456 logits evaluados sobre 4.096 tokens, 297 superaron la tolerancia permitida en la comparación con la implementación estándar.

## Capacidades

- Generación y continuación de texto en coreano e inglés, sin formato conversacional ni tokens de rol.
- Capacidad limitada de respuesta a preguntas factuales breves: en la evaluación del autor, 10 de 12 preguntas factuales en coreano y 10 de 12 en inglés fueron correctas en BF16.
- Comprensión lectora básica: 7 de 8 en coreano y 7 de 8 en inglés (BF16) en las pruebas del autor.
- Aritmética de un paso: 15 de 16 en operaciones básicas; aritmética de dos pasos: 0 de 16 en BF16.
- Generación de funciones sencillas en código: 0 de 12 funciones completas superadas en la prueba del autor, aunque 9 de 12 generaron una explicación válida.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.
- Multilingüismo limitado a coreano e inglés.

## Casos de uso

- Experimentación con modelos base pequeños en coreano: JANSORI permite estudiar el comportamiento de un modelo denso de 3B entrenado principalmente en coreano, con contexto de 4.096 tokens, en tareas de continuación de texto sin instrucciones.
- Generación de texto libre y creativo en coreano: el modelo puede continuar relatos o descripciones, aunque el autor documenta problemas de repetición de 4-gramas (53,7 % en coreano en BF16), por lo que requiere revisión humana.
- Evaluación comparativa de cuantizaciones: el autor proporciona datos de perplejidad y rendimiento para BF16, Q8_0 y Q4_K_M, lo que permite usar el modelo como caso de estudio del impacto de la cuantización en modelos de 3B.
- Pruebas de infraestructura de despliegue: al estar disponible en safetensors y GGUF, puede emplearse para validar pipelines con vLLM (BF16) y Ollama (Q8_0, Q4_K_M), con requisitos de VRAM documentados (8.805,9 MiB en BF16, 5.055,9 MiB en Q8_0 y 3.761,9 MiB en Q4_K_M en H200).
- Investigación sobre repetición y degeneración en modelos base: los ejemplos documentados de bucles de repetición en la generación lo convierten en un caso útil para estudiar técnicas de mitigación (penalización de repetición, decodificación contrastiva).
- Prototipado de completado de texto en coreano en entornos con recursos limitados: la versión Q4_K_M ocupa 1.969.663.968 bytes y puede ejecutarse en GPUs de consumo, lo que facilita pruebas locales sin infraestructura de datacenter.
- Docencia y divulgación: la model card incluye ejemplos reproducibles de inferencia con vLLM y Ollama, lo que lo hace adecuado para demostraciones prácticas de despliegue de modelos de lenguaje.

## Benchmarks y rendimiento

Los datos de benchmarks publicados por el autor se basan en evaluaciones propias con conjuntos de prueba pequeños, por lo que deben interpretarse con cautela. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Prueba | BF16 | Q8_0 | Q4_K_M |
|---|---:|---:|---:|
| Perplejidad coreano (holdout, 663.905 tokens) | 9,089808 | 9,090860 | 9,196303 |
| Perplejidad inglés (holdout, 705.634 tokens) | 10,215738 | 10,217286 | 10,317744 |
| Factual coreano (de 12) | 10 | 10 | 10 |
| Factual inglés (de 12) | 10 | 10 | 10 |
| Comprensión lectora coreano (de 8) | 7 | 8 | 7 |
| Comprensión lectora inglés (de 8) | 7 | 7 | 7 |
| Aritmética básica (de 16) | 15 | 15 | 14 |
| Aritmética de dos pasos (de 16) | 0 | 0 | 1 |
| Funciones completas (de 12) | 0 | 0 | 0 |
| Funciones con explicación válida (de 12) | 9 | 9 | 9 |
| BoolQ coreano KoBEST (de 1.404) | 730 (52,0 %) | 729 (51,9 %) | 733 (52,2 %) |
| BoolQ macro-F1 | 0,413 | 0,410 | 0,410 |

En la prueba BoolQ de KoBEST, la clase mayoritaria (참) supone el 50,2 %, por lo que los resultados están próximos al azar. El autor señala que el número de ítems es pequeño y que una diferencia de un ítem no permite establecer superioridad entre formatos.

## Requisitos de hardware

- VRAM estimada en BF16: 8.805,9 MiB máximos observados en una H200 durante la inferencia (pesos de 6.448.116.613 bytes incluyendo pesos, configuración y tokenizador).
- VRAM estimada en Q8_0: 5.055,9 MiB máximos observados (archivo GGUF de 3.426.185.184 bytes).
- VRAM estimada en Q4_K_M: 3.761,9 MiB máximos observados (archivo GGUF de 1.969.663.968 bytes).
- GPU recomendadas: el autor valida el modelo en una NVIDIA H200. Para BF16 se recomienda una GPU con al menos 12-16 GB de VRAM; para Q4_K_M, una GPU de consumo con 6-8 GB de VRAM podría ser suficiente, aunque no se documentan pruebas en GPUs de consumo.
- Cabe en GPU de consumo en formato Q4_K_M (menos de 4 GB de pesos), si bien no hay mediciones publicadas en tarjetas como RTX 4090 o RTX 3060.
- Opciones de despliegue: vLLM 0.11.2 (BF16, con `--dtype bfloat16 --max-model-len 4096`), Ollama 0.40.16 (Q8_0 y Q4_K_M), y llama.cpp para el scoring de GGUF según la model card. También es compatible con text-generation-inference según los tags.
- Throughput medido en H200 (primer lote secuencial, 6 prompts fijos de hasta 64 tokens): 100,27 tokens/s en BF16, 14,49 tokens/s en Q8_0 y 9,95 tokens/s en Q4_K_M. Estas cifras corresponden a la medición inicial del autor y no a un benchmark de producción.
- Latencia: la model card incluye una tabla de TTFT y latencia total por longitud de entrada, pero los datos de esa tabla aparecen truncados en la información disponible, por lo que no se pueden reproducir aquí.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandarizados (MMLU, HumanEval, GSM8K) para JANSORI, por lo que una comparación cuantitativa rigurosa con alternativas no es posible con la información proporcionada. A continuación se ofrece una comparación cualitativa basada en características conocidas de modelos de tamaño similar.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Ajuste por instrucciones |
|---|---|---|---|---|---|
| JANSORI | 3,22B | 4.096 | ko, en | Apache 2.0 | No (modelo base) |
| Qwen2.5-3B | 3,09B | 32.768 | multilingüe (29+) | Apache 2.0 | Sí (base e instruct) |
| Llama 3.2-3B | 3,21B | 131.072 | multilingüe (8) | Llama 3.2 Community License | Sí (base e instruct) |
| Gemma 2-2B | 2,61B | 8.192 | multilingüe | Gemma Terms of Use | Sí (base e instruct) |

JANSORI se diferencia de estas alternativas por su especialización en coreano, su contexto más corto (4.096 tokens frente a 8.192-131.072 de los competidores) y la ausencia de ajuste por instrucciones. Su licencia Apache 2.0 es más permisiva que la de Llama 3.2 y Gemma 2. No se dispone de datos de rendimiento comparables para establecer qué modelo es superior en tareas de coreano.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable y no está diseñado para uso conversacional directo.
- Repetición de texto: el autor documenta tasas de repetición de 4-gramas del 53,7 % en coreano y 58,6 % en inglés en BF16, con ejemplos de bucles que repiten la misma frase varias veces.
- Errores aritméticos: en la prueba de reparto de 12 manzanas entre 3 personas, las tres cuantizaciones respondieron 12 en lugar de 4. La aritmética de dos pasos obtuvo 0-1 aciertos de 16.
- Razonamiento científico deficiente: en la explicación de la refracción de la luz, las tres cuantizaciones repitieron frases sobre el límite entre medios sin explicar la causa.
- Generación de código poco fiable: ninguna de las 12 funciones se completó correctamente; Q4_K_M invirtió la lógica en una función de paridad (devolvió False para números pares) y añadió llamadas con número incorrecto de argumentos.
- Rendimiento cercano al azar en BoolQ coreano (52 % de acierto frente a una clase mayoritaria del 50,2 %), lo que sugiere una comprensión limitada de inferencia textual.
- Contexto limitado a 4.096 tokens, inferior al de modelos contemporáneos de tamaño similar.
- Idiomas limitados a coreano e inglés; no se documenta soporte de otros idiomas.
- Riesgo de alucinación: al ser un modelo base entrenado para continuación de texto, no verifica hechos y puede generar afirmaciones incorrectas con fluidez.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset de entrenamiento no se describe, por lo que se desconocen los sesgos potenciales.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no incluye garantías ni cláusulas de responsabilidad por el contenido generado.
- Las cifras de rendimiento y calidad provienen de conjuntos de prueba pequeños (12-98 ítems) y de una única GPU (H200), por lo que no deben extrapolarse a otros entornos sin validación.
- La model card advierte de que los tags de cuantización de Ollama pueden cambiar y recomienda registrar el SHA-256 de los GGUF descargados para garantizar la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pathcosmos/JANSORI
- Commit de despliegue con los resultados de evaluación: https://huggingface.co/pathcosmos/JANSORI/tree/e68bfa3cb31e9589f4481a2e31d6d75c731fec9d
- Dataset KoBEST (revisión fija usada en la evaluación): https://huggingface.co/datasets/skt/kobest_v1/tree/a5ea15e3ac77ed694b79f6204eb31889a2ba989f
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de Ollama: https://github.com/ollama/ollama
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
