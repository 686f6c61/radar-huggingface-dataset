# ggml-org/Qwen3-Coder-30B-A3B-Instruct-GGUF

## Resumen

Qwen3-Coder-30B-A3B-Instruct-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3-Coder-30B-A3B-Instruct desarrollado por Alibaba Qwen. Esta conversión la mantiene el equipo ggml-org (responsable de llama.cpp) y está pensada para su ejecución local con llama.cpp y llama.app, sin necesidad de GPUs de centro de datos. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 30.532 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que permite un equilibrio interesante entre capacidad y coste de inferencia.

El modelo está especializado en generación de código y tareas agénticas de programación, con una ventana de contexto de 262.144 tokens según la model card. Su arquitectura MoE con 48 capas y 128 expertos enrutados (8 activos por token) reduce el coste computacional por token frente a un modelo denso del mismo tamaño, algo relevante para despliegues en hardware de gama alta de consumo o estaciones de trabajo con una o varias GPUs.

La relevancia de esta ficha concreta reside en que la conversión GGUF incluye tres variantes listas para usar (BF16, Q8_0 y Q4_K_M) y una integración directa con llama.app mediante `llama serve -hf`, lo que simplifica enormemente la puesta en marcha para desarrolladores que quieren probar el modelo sin infraestructura cloud. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 48 capas, 128 expertos enrutados con 8 activos por token |
| Parametros totales | 30.532.122.624 (~30,5 B) |
| Parametros activos | ~3 B por token (indicado como "30B MoE (3B active)") |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (en Q4_K_M los tensores no expertos se mantienen en Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 48 capas, 128 expertos enrutados y 8 expertos activos por token. Esta configuración permite que, pese a tener 30,5 mil millones de parámetros totales, solo se activen aproximadamente 3 mil millones durante cada paso de inferencia, lo que reduce el coste computacional y de memoria de activaciones de forma significativa. La ventana de contexto es de 262.144 tokens, adecuada para tareas de análisis de repositorios completos o conversaciones multi-turno extensas.

La model card de esta conversión no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia arquitectura MoE. La conversión a GGUF se ha realizado automáticamente mediante la herramienta `ggml-org/convert`, y las cuantizaciones Q8_0 y Q4_K_M aplican el tipo base a los expertos enrutados, mientras que en Q4_K_M los tensores pequeños (embeddings y atención) se conservan en Q8_0 para preservar calidad.

## Capacidades

- Generación de texto y código: el modelo está orientado explícitamente a tareas de programación (Coder en el nombre), incluyendo generación, completado y explicación de código.
- Razonamiento multi-paso: capacidad de encadenar pasos intermedios, útil para tareas agénticas.
- Soporte de tool calling / function calling: al ser un modelo Instruct de la familia Qwen3-Coder, se espera compatibilidad con llamadas a herramientas (no verificado en la información proporcionada).
- Uso conversacional: la model card lo etiqueta como "conversational" y el pipeline es text-generation.
- Contexto largo: 262K tokens permiten procesar repositorios, documentos técnicos extensos o historiales de conversación muy largos.
- Capacidades multilingües: no disponible (los idiomas no están documentados en la ficha).
- Modo thinking / visión / audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente de programación en local: el modelo puede ejecutarse con `llama serve -hf ggml-org/Qwen3-Coder-30B-A3B-Instruct-GGUF` y servir como backend de un IDE o plugin de autocompletado, aprovechando la cuantización Q4_K_M para reducir requisitos de memoria.
- Análisis de repositorios completos: con 262K tokens de contexto, se puede cargar un repositorio mediano o varios ficheros relacionados y pedir refactorizaciones, explicaciones o detección de bugs entre módulos.
- Generación de tests y documentación: el modelo puede recibir un fichero fuente y producir tests unitarios o docstrings, integrándose en pipelines de CI/CD mediante llamadas HTTP a un servidor llama.cpp.
- Agentes de código multi-paso: para tareas como "arregla este bug", el modelo puede descomponer el problema, inspeccionar ficheros y proponer parches secuenciales, aprovechando su capacidad de razonamiento y su contexto largo.
- Chat técnico de soporte: desplegado en una estación de trabajo, puede atender consultas internas sobre APIs, librerías o configuraciones, manteniendo contexto de conversaciones largas.
- Prototipado rápido sin cloud: al estar en GGUF y con licencia Apache 2.0, es adecuado para entornos con requisitos de privacidad (código propietario) donde no se quiere enviar datos a APIs externas.
- Educación y experimentación: investigadores pueden ejecutar el modelo en una sola GPU de gama alta de consumo o en varias GPUs, con cuantizaciones que caben en 24-48 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, las cuantizaciones Q4_K_M y Q8_0 de un modelo MoE de 30,5B suelen requerir del orden de 20-35 GB y 35-45 GB respectivamente, aunque estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: no disponible. Por el tamaño del modelo, se espera que requiera GPUs con 24 GB o más de VRAM (RTX 4090, A100, H100) o configuraciones multi-GPU para las cuantizaciones mayores.
- ¿Cabe en consumer GPU?: probablemente en GPUs de 24 GB con Q4_K_M, pero no está confirmado en la información disponible.
- Opciones de despliegue: llama.cpp y llama.app (soporte oficial indicado en la model card mediante `llama serve -hf`). Otras opciones como vLLM, TGI u Ollama no están confirmadas en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct-GGUF (este) | 30,5 B totales / ~3 B activos | 262K | Apache 2.0 | GGUF en Hugging Face |
| Qwen3-Coder-30B-A3B-Instruct (original) | 30,5 B totales / ~3 B activos | 262K | Apache 2.0 | Safetensors en Hugging Face |
| Otros modelos de código comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como todo modelo entrenado con datos web, es probable que herede sesgos presentes en el corpus, pero no se especifica.
- Riesgo de alucinación: no cuantificado en la información proporcionada; en tareas de código es habitual que los modelos generen APIs o funciones inexistentes, por lo que se recomienda validación automática.
- Limitaciones de contexto o idioma: el contexto máximo es de 262K tokens, pero no se especifica el rendimiento en contextos muy largos ni los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantengan los avisos de licencia y atribución correspondientes.
- Caveats para producción: la conversión GGUF se ha realizado automáticamente con `ggml-org/convert`, lo que puede introducir diferencias respecto al modelo original; conviene validar la calidad de las cuantizaciones Q4_K_M y Q8_0 en el caso de uso concreto. Además, el rendimiento en hardware consumer no está documentado oficialmente.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/ggml-org/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Herramienta de conversión: https://github.com/ggml-org/convert
- llama.app: https://llama.app
