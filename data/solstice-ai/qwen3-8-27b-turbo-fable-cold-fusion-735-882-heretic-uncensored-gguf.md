# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored es un checkpoint afinado sobre el modelo denso Qwen3.8-27B de Alibaba, desarrollado por DavidAU y Nightmedia, y distribuido en formato GGUF por Solstice-AI. El modelo combina varias técnicas de post-entrenamiento: GAIN Multi-Stage Post-Training, Cold-Fusion Weight Synthesis, Low-KLD Heretic De-alignment y Precision Healing Datasets. El resultado es un modelo de 26,9 mil millones de parámetros que, según sus autores, eleva los benchmarks de razonamiento 141 puntos sobre el Qwen3.8-27B-Instruct base y reduce el número de tokens de razonamiento entre 2 y 10 veces.

La arquitectura subyacente es la de Qwen3.8-27B, un modelo denso con atención híbrida: solo 16 de las 64 capas usan atención completa, mientras que las otras 48 emplean atención lineal con estado recurrente constante. Esta mezcla reduce el coste computacional manteniendo capacidad de razonamiento. El repositorio de Solstice-AI ofrece cuantizaciones GGUF con doble perfil de importancia (imatrix), incluyendo variantes Multi-Token Prediction (MTP) y un proyector de visión (mmproj) para capacidades multimodales. Está pensado para inferencia local con llama.cpp, Ollama, vLLM y el runtime Anvil.

La relevancia actual del modelo radica en su enfoque en eficiencia de tokens de razonamiento y su naturaleza "uncensored" y de-alineada, lo que lo hace atractivo para experimentación local, aunque con advertencias importantes sobre su uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (densa, atencion hibrida: 16/64 capas full attention, 48 lineal) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el ejemplo de configuracion usa 32K) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M, IQ2_M, mmproj-BF16 |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de transformer denso con atencion hibrida: de las 64 capas, 16 utilizan atencion completa (con intervalo de 4) y las 48 restantes usan atencion lineal con un estado recurrente constante. Esta combinacion reduce el coste computacional en comparacion con un transformer de atencion completa puro, manteniendo la capacidad de modelar dependencias de largo alcance.

El proceso de entrenamiento del checkpoint TURBO-Fable-Cold-Fusion es multi-etapa. La etapa GAIN (Gradient-Augmented Iterative Normalization) aplica post-entrenamiento en varias fases. La Cold-Fusion Weight Synthesis combina pesos de diferentes modelos o etapas de entrenamiento. La etapa "Heretic" realiza una de-alineacion con divergencia KLD baja, eliminando restricciones de seguridad y alineacion. Finalmente, los "Precision Healing Datasets" (etapa 1b, 735-882) corrigen posibles degradaciones introducidas por la de-alineacion, elevando los benchmarks de razonamiento. Segun la model card, el modelo reduce el "reasoning token bloat" entre 2 y 10 veces respecto al Qwen3.8-27B-Instruct base.

La cuantizacion GGUF se realizo con doble perfil de importancia (imatrix) para preservar la precision en las cabezas de razonamiento. Se incluyen variantes MTP (Multi-Token Prediction) que predicen varios tokens a la vez, y un archivo mmproj-BF16 para habilitar la entrada de imagenes.

## Capacidades

- Razonamiento y chain-of-thought: el modelo soporta un modo "thinking" explicito, activado mediante el token `thinking` en la plantilla de chat, que genera cadenas de razonamiento antes de la respuesta final.
- Generacion de texto: produccion de texto coherente en ingles y chino, con capacidad de seguir instrucciones en formato chat.
- Vision multimodal: mediante el archivo `mmproj-BF16.gguf`, el modelo puede procesar imagenes y describir su contenido, segun el ejemplo de la model card.
- Generacion de codigo: el nombre del checkpoint incluye "NEO-CODER-MAX", lo que sugiere un enfasis en tareas de programacion, aunque no se proporcionan benchmarks especificos de codigo.
- Matematicas formales: la cuantizacion Q8_0 se recomienda para "formal math", indicando capacidad de razonamiento matematico avanzado.
- Eficiencia de tokens de razonamiento: el modelo genera entre 2 y 10 veces menos tokens de pensamiento que el Qwen3.8-27B-Instruct base, lo que reduce la latencia y el coste de inferencia.
- Tool calling y function calling: no se menciona explicitamente en la informacion disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones IQ3_M e IQ2_M (9-12 GB), el modelo puede ejecutarse en GPUs de 12 GB como la RTX 3060 o RTX 4070, ofreciendo razonamiento de alto nivel sin conexion a la nube.
- Asistente de razonamiento para investigacion: el modo thinking y la reduccion de tokens de razonamiento permiten obtener respuestas razonadas rapidamente, util para explorar hipotesis o analizar problemas complejos en entornos academicos.
- Analisis de diagramas e imagenes tecnicas: con el mmproj, el modelo puede describir flujos arquitectonicos o diagramas de red, como se muestra en el ejemplo de la model card, lo que resulta util para documentacion tecnica.
- Generacion de codigo en entornos sin conexion: el enfasis en codigo (NEO-CODER-MAX) permite usarlo como asistente de programacion local, integrable en editores via servidor OpenAI-compatible.
- Prototipado rapido de agentes conversacionales: al ser un modelo "uncensored", se puede emplear para experimentar con personalidades o comportamientos sin restricciones, aunque con responsabilidad sobre el contenido generado.
- Evaluacion comparativa de tecnicas de cuantizacion: al ofrecer multiples quants con imatrix, el modelo sirve como banco de pruebas para medir el impacto de la cuantizacion en tareas de razonamiento, comparando Q8_0 frente a IQ2_M.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks de razonamiento de sentido comun y comprension lectora, comparando el modelo con varios checkpoints de la familia Qwen. Los datos corresponden al modelo en precision 8 bits (Q8_0) o al checkpoint sin cuantizar, segun la descripcion.

| Modelo | ARC-C (0-shot) | ARC-E (0-shot) | BoolQ | HellaSwag | OpenBookQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|
| **Qwen3.8-27B-TURBO-Fable (este modelo)** | **0.735** | **0.882** | **0.917** | **0.832** | **0.530** | **0.837** | **0.785** |
| Qwen3.8-27B-Instruct (baseline) | 0.591 | 0.782 | 0.896 | 0.746 | 0.448 | 0.801 | 0.711 |
| Qwen3.6-27B-Instruct | 0.647 | 0.803 | 0.910 | 0.773 | 0.450 | 0.806 | 0.742 |
| Qwen3.6-35B-A3B-Instruct (MoE) | 0.581 | 0.757 | 0.892 | 0.751 | 0.428 | 0.803 | 0.688 |
| Qwen3.5-27B-Instruct | 0.557 | 0.711 | 0.868 | 0.533 | 0.452 | 0.706 | 0.695 |

Segun la busqueda web, el modelo supera 0.735 en ARC-C y 0.882 en ARC-E en 8 bits, y mantiene 0.718 en ARC-C en cuantizacion de 4 bits. No se proporcionan resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada por cuantizacion:
  - Q8_0: ~28.8 GB (recomendado 32 GB o mas)
  - Q6_K: ~22.6 GB (recomendado 24 GB)
  - Q5_K_M: ~19.4 GB (recomendado 22 GB)
  - Q4_K_M: ~16.8 GB (recomendado 18 GB)
  - IQ4_XS: ~15.2 GB (recomendado 16 GB)
  - IQ3_M: ~11.8 GB (recomendado 12 GB)
  - IQ2_M: ~9.2 GB (recomendado 12 GB)
  - mmproj-BF16: ~1.2 GB adicionales para vision
- GPUs recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q5_K_M y Q4_K_M; RTX 3060 o RTX 4070 (12 GB) para IQ3_M e IQ2_M; A100 o H100 (40-80 GB) para Q8_0.
- El modelo cabe en GPUs de consumo de 12 GB o mas, dependiendo de la cuantizacion elegida.
- Opciones de despliegue: llama.cpp (CLI y servidor OpenAI-compatible), Ollama (mediante Modelfile), vLLM y el runtime Anvil de Solstice-AI.
- Latencia y throughput: no se proporcionan datos concretos. La reduccion de tokens de razonamiento (2-10x) implica menor latencia por respuesta en tareas de razonamiento en comparacion con el Qwen3.8-27B-Instruct base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ARC-C | ARC-E | Licencia | Formato |
|---|---|---|---|---|---|---|
| **Qwen3.8-27B-TURBO-Fable (este)** | 26.9B | No disponible | 0.735 | 0.882 | Apache 2.0 | GGUF |
| Qwen3.8-27B-Instruct | 26.9B | No disponible | 0.591 | 0.782 | Apache 2.0 | safetensors |
| Qwen3.6-27B-Instruct | 26.9B | No disponible | 0.647 | 0.803 | Apache 2.0 | safetensors |
| Qwen3.6-35B-A3B-Instruct (MoE) | 35B (3B activos) | No disponible | 0.581 | 0.757 | Apache 2.0 | safetensors |

El modelo supera claramente a sus alternativas de la misma familia en los benchmarks de razonamiento de sentido comun, con una ventaja de 0.144 puntos sobre el Qwen3.8-27B-Instruct en ARC-C. La comparativa con modelos fuera de la familia Qwen no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es "uncensored" y "de-aligned" por diseño: puede generar contenido inapropiado, ofensivo o peligroso sin filtros. El autor advierte explicitamente que el usuario es el unico responsable de las salidas generadas.
- Riesgo de alucinacion: al ser un modelo de 27B, puede inventar hechos o razonamientos incorrectos, especialmente en tareas de conocimiento factual. No se proporcionan datos sobre su fiabilidad en este aspecto.
- Idiomas limitados: solo soporta ingles y chino. No se garantiza un rendimiento adecuado en otros idiomas, incluido el espanol.
- Longitud de contexto no documentada: aunque el ejemplo de configuracion usa 32K, no se especifica el contexto maximo soportado. Es posible que el modelo base tenga un contexto mayor, pero no esta confirmado.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza "uncensored" puede generar problemas legales o eticos en aplicaciones de produccion. Se recomienda evaluar cuidadosamente el caso de uso.
- Los benchmarks proporcionados se limitan a tareas de razonamiento de sentido comun; no hay datos sobre MMLU, HumanEval, GSM8K o tareas de vision, por lo que el rendimiento en esos dominios es desconocido.
- El modelo es un checkpoint experimental con tecnicas de entrenamiento no convencionales (Cold-Fusion, Heretic De-alignment). Su comportamiento en produccion puede ser impredecible.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF
- Modelo base (pesos safetensors): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Variante NEO-CODER-MAX con MTP: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Pagina en Ollama (variante de AI-TAVS): https://ollama.com/AI-TAVS/Qwen3.8-turbo:27b
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Articulo sobre el indice de inteligencia de Qwen 3.8 27B: https://aibriefs.news/card/755ee941-c783-4b80-9000-402f26f6dc63
