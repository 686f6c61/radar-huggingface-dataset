# hallowmarsh/press-delta

## Resumen

press-delta es un ajuste fino (fine-tune) del modelo Qwen3-4B publicado por el usuario hallowmarsh en Hugging Face. El entrenamiento se realizó con la librería Unsloth partiendo de la versión cuantizada a 4 bits `unsloth/Qwen3-4B-bnb-4bit`, lo que reduce de forma notable el consumo de memoria durante el ajuste. La model card es mínima: no documenta el conjunto de datos, el número de pasos, la técnica exacta (LoRA, QLoRA o ajuste completo) ni el objetivo concreto del entrenamiento.

El modelo base, Qwen3-4B, es un transformer decoder-only denso de aproximadamente 4.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. Incorpora un modo de razonamiento explícito (thinking) que puede activarse o desactivarse, y una ventana de contexto nativa de 32.768 tokens ampliable hasta 131.072 mediante escalado YaRN. Hereda el vocabulario de 151.936 tokens y la atención con grouped-query attention (GQA) de la familia Qwen3.

Su relevancia práctica radica en el tamaño: un modelo de 4B en licencia Apache-2.0 se puede ejecutar en GPU de consumo con cuantización de 4 bits, lo que lo hace apto para despliegue local, prototipado rápido y entornos con requisitos de privacidad. Ahora bien, al no existir documentación del ajuste ni validación de la comunidad (0 descargas, 0 likes en el momento de redactar esta ficha), cualquier evaluación debe hacerse de forma empírica antes de llevarlo a producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura Qwen3), con GQA, RoPE y SwiGLU; no es MoE ni SSM |
| Parametros totales | ~4.000 millones (4B) heredados del modelo base; no confirmado en los archivos del fine-tune |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; hasta 131.072 con YaRN. No verificado en el fine-tune |
| Tipos de cuantizacion | El fine-tune se distribuye en safetensors. El base usado para el ajuste estaba en 4 bits (bitsandbytes NF4). No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (declarado en la model card). El base Qwen3 cubre 119 idiomas, pero el ajuste solo declara inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

Datos adicionales de la ficha de Hugging Face: repositorio de 0,3 GB, creado y actualizado el 23 de septiembre de 2026, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings de entrada y salida atados (tie_word_embeddings) y atención con 32 cabezas de consulta frente a 8 cabezas de clave/valor (GQA, ratio 4:1). La familia Qwen3 se preentrenó, según su informe técnico, sobre del orden de 36 billones de tokens, e incorpora un mecanismo de "thinking mode" que genera una cadena de razonamiento antes de la respuesta final y que puede desactivarse para reducir latencia y coste.

El ajuste fino de hallowmarsh se realizó con Unsloth, cuyo reclamo en la propia model card es un entrenamiento "2x más rápido". No se especifica el dataset, el número de tokens de ajuste, la longitud de secuencia, el rango de LoRA ni si se aplicaron etapas de RLHF, DPO o SFT. Tampoco se documenta ningún mecanismo de decodificación especulativa ni innovación técnica propia del fine-tune. El único cambio verificable respecto al base es la especialización derivada de datos no publicados.

Conviene señalar una inconsistencia técnica: un modelo de 4B en 4 bits ocupa aproximadamente 2,4 GB de pesos, mientras que el repositorio declara 0,3 GB. Esto sugiere que el repositorio podría contener únicamente adaptadores LoRA, un subconjunto de las capas o una subida incompleta. Es un punto que debe verificarse listando los archivos del repositorio antes de intentar cargarlo.

## Capacidades

- Generación de texto en inglés con la calidad heredada de Qwen3-4B, sujeta a posibles desviaciones introducidas por el ajuste.
- Razonamiento paso a paso mediante el modo thinking de Qwen3, activable con `enable_thinking=True` en el tokenizador/plantilla de chat.
- Generación de código y resolución de problemas matemáticos a nivel de modelo de 4B, siempre que el fine-tune no haya degradado estas capacidades.
- Soporte de tool calling y function calling: Qwen3 admite plantillas de llamada a herramientas compatibles con el formato de Qwen-Agent y con esquemas tipo Hermes.
- Capacidades de agente y razonamiento multi-paso, limitadas por la ventana de contexto efectiva que conserve el ajuste.
- Capacidad multilingüe del base (119 idiomas), aunque la model card del fine-tune solo declara inglés, por lo que el rendimiento fuera del inglés es incierto.
- Modo sin razonamiento (non-thinking) para respuestas directas de baja latencia.
- No incluye visión, audio ni ninguna modalidad adicional: es un modelo exclusivamente de texto.

## Casos de uso

- Asistente conversacional local: un 4B en 4 bits se ejecuta en GPU de consumo, de modo que puede desplegarse como chatbot privado sin enviar datos a terceros, con la ventana de contexto del base para conversaciones multi-turno.
- Generación de código en pipelines de desarrollo: con soporte de tool calling, puede integrarse en un asistente de editor que consulte documentación, ejecute tests o proponga parches, siempre que se valide previamente que el ajuste no ha degradado HumanEval respecto al base.
- Clasificación y extracción de información estructurada: dado su tamaño, es viable ejecutarlo en lote sobre miles de documentos para extraer campos en JSON, con coste por token muy inferior al de modelos de 70B.
- Enrutamiento y preprocesado dentro de un sistema multiagente: puede actuar como modelo barato que decide a qué modelo mayor derivar cada consulta, reduciendo el gasto en APIs.
- Resumen de documentos largos: con 32.768 tokens nativos (y hasta 131.072 con YaRN en el base), admite resúmenes de informes o transcripciones extensas en una sola pasada.
- Ajuste adicional como punto de partida (fine-tuning de segunda etapa): al ser Apache-2.0, se puede reentrenar con datos propios sin restricciones de licencia, algo relevante para dominios verticales (legal, sanitario, industrial).
- Prototipado e investigación de técnicas de ajuste: sirve como ejemplo reproducible de un flujo Unsloth sobre Qwen3 cuantizado para estudiar el efecto del QLoRA en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de `hallowmarsh/press-delta` no incluye métricas de MMLU, GSM8K, HumanEval ni de ningún otro conjunto de evaluación, y tampoco se aportan comparaciones con el modelo base.

El modelo base Qwen3-4B sí cuenta con resultados publicados por el equipo Qwen en su blog e informe técnico (enlaces en la sección final), pero no se reproducen aquí porque no corresponden al fine-tune y podrían no ser representativos de su comportamiento tras el ajuste.

## Requisitos de hardware

| Precisión | Peso de pesos (aprox.) | VRAM total estimada (con caché KV y overhead) |
|---|---|---|
| BF16 / FP16 | ~8 GB | ~10-12 GB |
| FP8 | ~4 GB | ~6-7 GB |
| 8 bits (INT8) | ~4,5 GB | ~6 GB |
| 4 bits (NF4, GPTQ, AWQ, GGUF Q4) | ~2,4 GB | ~4-5 GB |

- GPU recomendadas: RTX 4090 o RTX 3090 para BF16; A100 40/80 GB y H100 para servicio de alto throughput o lotes grandes; L40S y A10G como opciones de coste intermedio.
- Consumer GPU: sí cabe. En 4 bits entra en tarjetas de 6-8 GB (RTX 3060, RTX 4060, RTX 2070); en BF16 requiere 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090).
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM, TGI, SGLang, llama.cpp/Ollama y LM Studio mediante conversión previa a GGUF. El tag `text-generation-inference` del repositorio indica compatibilidad declarada con TGI.
- Latencia y throughput: no se han publicado mediciones para este modelo. No se dispone de datos de tokens por segundo ni de tiempo hasta el primer token.
- Advertencia de despliegue: dado el tamaño declarado del repositorio (0,3 GB), verificar los archivos antes de asumir que se puede cargar como un modelo completo de 4B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidad | Idiomas declarados |
|---|---|---|---|---|---|
| press-delta (Qwen3-4B fine-tune) | ~4B | 32.768 (131.072 con YaRN, heredado) | Apache-2.0 | Texto | en |
| Qwen/Qwen3-4B (base) | ~4B | 32.768 (131.072 con YaRN) | Apache-2.0 | Texto | 119 |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 128.000 | Llama 3.2 Community License | Texto | 8 |
| google/gemma-3-4b-it | ~4B | 128.000 | Gemma Terms of Use | Texto e imagen | Más de 140 |
| microsoft/Phi-4-mini-instruct | 3,8B | 128.000 | MIT | Texto | No disponible con precisión |

Notas: los datos de los modelos de terceros provienen de su documentación oficial y pueden variar con actualizaciones. La comparación de rendimiento no se incluye porque no hay métricas publicadas para press-delta. Frente a Llama 3.2 3B y Gemma 3 4B, la ventaja principal de press-delta es la licencia Apache-2.0 sin cláusulas adicionales; su desventaja es la ausencia total de validación y de documentación del ajuste.

## Limitaciones y advertencias

- Sesgos desconocidos: al no publicarse el dataset de ajuste, no es posible auditar la composición de los datos ni los sesgos que pueda haber incorporado el fine-tune.
- Riesgo de alucinación: inherente a los modelos de 4B, especialmente en dominios especializados y en tareas de razonamiento largo.
- Idioma: la model card declara únicamente inglés. Aunque el base es multilingüe, no hay garantía de que el ajuste conserve ese comportamiento, y el soporte de castellano es, como mínimo, incierto.
- Contexto: el ajuste se hizo sobre una versión cuantizada a 4 bits del base; conviene comprobar empíricamente cuánta ventana de contexto conserva sin degradación notable.
- Repositorio sin validación: 0 descargas y 0 likes, sin métricas, sin ejemplos de uso y sin discusiones. No existe evidencia externa de que el modelo funcione según lo esperado.
- Inconsistencia de tamaño: 0,3 GB de repositorio frente a los ~2,4 GB esperables en 4 bits. Verificar si contiene adaptadores, pesos parciales o un error de subida.
- Licencia: Apache-2.0 permite uso comercial y modificación sin restricciones adicionales, pero el usuario sigue siendo responsable del cumplimiento de las condiciones del modelo base (también Apache-2.0) y de la normativa aplicable a los datos de entrenamiento.
- Producción: no se recomienda desplegarlo en entornos críticos sin una evaluación propia previa (evaluación en dominio, pruebas de regresión frente al base, medición de latencia y de tasa de alucinación).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hallowmarsh/press-delta
- Modelo base usado para el ajuste: https://huggingface.co/unsloth/Qwen3-4B-bnb-4bit
- Modelo original del que deriva el base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Blog de presentación de Qwen3 (equipo Qwen): https://qwenlm.github.io/blog/qwen3/
- Informe técnico de Qwen3: https://arxiv.org/abs/2505.09388
- Documentación de Qwen3 en Qwen-Agent (tool calling): https://github.com/QwenLM/Qwen-Agent
