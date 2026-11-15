# nagohachi/tiny-lm-v1-japanese-500m-sft

## Resumen

tiny-lm-v1-japanese-500m-sft es un modelo de lenguaje de aproximadamente 480 millones de parámetros especializado en japonés, desarrollado por el usuario nagohachi. Se trata de la versión afinada mediante supervisión (SFT) del modelo base tiny-lm-v1-japanese-500m-base, que fue preentrenado desde cero sobre unos 10.000 millones de tokens. El objetivo del proyecto es explorar hasta qué punto un modelo de escala reducida puede ofrecer capacidades conversacionales útiles en japonés cuando se entrena con datos de alta calidad.

El modelo emplea una arquitectura de tipo Llama con una implementación personalizada incluida en el propio repositorio, lo que obliga a usar `trust_remote_code=True` al cargarlo con Transformers. Cuenta con una longitud de contexto de 2.048 tokens y un vocabulario de 99.574 tokens, tomado del tokenizador de llm-jp/llm-jp-3-440m. Los pesos se distribuyen en formato safetensors con un tamaño de repositorio de 1,0 GB.

Su relevancia actual reside en el interés por modelos pequeños y eficientes que puedan ejecutarse en hardware modesto y en entornos con recursos limitados, así como en el ecosistema japonés de modelos abiertos impulsado por iniciativas como LLM-jp. No obstante, sus resultados en llm-jp-eval (promedio de 0,191) quedan por debajo tanto de su modelo base como de alternativas como llm-jp-3-440m-instruct3, lo que sitúa al modelo como una pieza de investigación más que como una solución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama (implementación personalizada, `trust_remote_code=True`) |
| Parametros totales | 479.501.312 (~480M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el ejemplo de uso) |
| Idiomas soportados | Japonés (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del vocabulario | 99.574 tokens |
| Tokenizador | llm-jp/llm-jp-3-440m |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de tipo Llama, aunque con una implementación propia incluida en el repositorio (`scratch_llama`), lo que implica que no se puede cargar con la clase estándar de Llama sin recurrir a código remoto. El preentrenamiento del modelo base se realizó desde cero sobre aproximadamente 10.000 millones de tokens en japonés. La fase de SFT se llevó a cabo sobre unos 277 millones de tokens, empleando los conjuntos de datos llm-jp/magpie-sft-v1.0 y kanhatakeyama/AutoMultiTurnByCalm3-22B, que suman alrededor de 188.000 conversaciones. La función de pérdida se calculó únicamente sobre los tramos correspondientes al asistente, una práctica habitual para mejorar la calidad de las respuestas en modelos conversacionales.

No se documentan en la información disponible innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos. Tampoco se detalla si hubo fases de RLHF o DPO en esta variante; el autor remite a una versión separada con alineamiento por preferencias (tiny-lm-v1-japanese-500m-dpo).

## Capacidades

- Generación de texto en japonés con formato conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Respuesta a instrucciones tras el ajuste supervisado sobre conversaciones.
- Comprensión lectora y respuesta a preguntas en japonés, con rendimiento limitado según los benchmarks.
- Traducción japonés-inglés dentro del conjunto de evaluación (puntuación de 0,523 en la tarea MT).
- Clasificación de relaciones textuales (NLI) y otras tareas de comprensión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo de razonamiento (thinking), visión ni audio.
- Capacidad multilingüe limitada al japonés según la etiqueta de idioma del modelo.

## Casos de uso

- Experimentación e investigación en modelos pequeños: el modelo sirve como base para estudiar el efecto del SFT en modelos de ~500M parámetros, comparando su rendimiento con el modelo base y la variante DPO en llm-jp-eval.
- Prototipado de asistentes conversacionales en japonés: permite validar pipelines de chat con plantilla de mensajes y generación con muestreo (temperatura y top-p) antes de escalar a modelos mayores.
- Despliegue en entornos con recursos muy limitados: con 480M parámetros y pesos en bfloat16, el modelo ocupa alrededor de 1 GB, por lo que puede ejecutarse en CPU o en GPU de gama baja para pruebas de concepto.
- Generación de texto japonés de dominio general: útil para tareas de continuación de texto o respuestas breves donde no se requiera alta precisión factual.
- Evaluación comparativa de tokenizadores y corpus japoneses: al emplear el tokenizador de llm-jp-3-440m, facilita experimentos controlados sobre el impacto del vocabulario en modelos pequeños.
- Fines educativos: sirve para demostrar el ciclo completo de preentrenamiento, SFT y evaluación con llm-jp-eval en un modelo de escala manejable.

## Benchmarks y rendimiento

Resultados en llm-jp-eval (v2.1.5). Los modelos base usan configuración de 4-shot; los modelos SFT/DPO y la línea base instruct se evalúan a través de su plantilla de chat.

| Modelo | average | CR | EL | FA | HE-EN | HE-JA | MR | MT | NLI | QA | RC |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| tiny-lm-v1-japanese-500m-base | 0,198 | 0,223 | 0,130 | 0,035 | 0,207 | 0,130 | 0,007 | 0,504 | 0,483 | 0,072 | 0,190 |
| tiny-lm-v1-japanese-500m-sft | 0,191 | 0,310 | 0,102 | 0,036 | 0,187 | 0,070 | 0,013 | 0,523 | 0,380 | 0,082 | 0,210 |
| tiny-lm-v1-japanese-500m-dpo | 0,194 | 0,310 | 0,130 | 0,036 | 0,187 | 0,070 | 0,013 | 0,531 | 0,345 | 0,082 | 0,240 |
| llm-jp/llm-jp-3-440m | 0,249 | 0,280 | 0,266 | 0,059 | 0,170 | 0,080 | 0,027 | 0,760 | 0,525 | 0,144 | 0,180 |
| llm-jp/llm-jp-3-440m-instruct3 | 0,254 | 0,317 | 0,289 | 0,066 | 0,223 | 0,110 | 0,017 | 0,744 | 0,520 | 0,155 | 0,100 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con pesos en bfloat16 (480M parámetros); alrededor de 0,5 GB en cuantización de 8 bits y 0,25 GB en 4 bits, aunque no se documentan ficheros GGUF oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bfloat16; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son más que suficientes. También es viable en CPU.
- Cabe en GPU de consumo sin problema, incluidas GPU integradas con suficiente memoria compartida.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requisito de la implementación personalizada). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la dependencia de código remoto puede dificultar su integración en algunos de estos motores.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | llm-jp-eval (average) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| tiny-lm-v1-japanese-500m-sft | ~480M | 2.048 | 0,191 | no disponible | Hugging Face (transformers, código remoto) |
| tiny-lm-v1-japanese-500m-base | ~480M | 2.048 | 0,198 | no disponible | Hugging Face |
| tiny-lm-v1-japanese-500m-dpo | ~480M | 2.048 | 0,194 | no disponible | Hugging Face |
| llm-jp/llm-jp-3-440m | ~440M | no disponible en la información | 0,249 | no disponible en la información | Hugging Face |
| llm-jp/llm-jp-3-440m-instruct3 | ~440M | no disponible en la información | 0,254 | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Rendimiento inferior a su propio modelo base en el promedio de llm-jp-eval (0,191 frente a 0,198), con caídas notables en EL (0,102 frente a 0,130), HE-JA (0,070 frente a 0,130) y NLI (0,380 frente a 0,483).
- Queda por debajo de llm-jp-3-440m-instruct3 (0,254) en el promedio global, a pesar de tener un número de parámetros similar.
- Ventana de contexto muy reducida (2.048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Capacidad limitada al japonés; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo elevado de alucinación y de respuestas factualmente incorrectas dado su tamaño y sus resultados en QA (0,082).
- Licencia no disponible: no se puede confirmar si se permite el uso comercial, por lo que debe tratarse como restringida hasta verificarlo con el autor.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y añade riesgos de seguridad y de compatibilidad con futuras versiones de Transformers.
- No se documentan sesgos específicos, pero al entrenarse principalmente con datos japoneses puede reflejar sesgos culturales y lingüísticos de dichas fuentes.
- No recomendado para producción sin una evaluación adicional propia, dada la falta de datos sobre robustez, seguridad y comportamiento en dominios especializados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-sft
- Modelo base: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-base
- Variante DPO: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-dpo
- Tokenizador de referencia: https://huggingface.co/llm-jp/llm-jp-3-440m
- Modelo comparable llm-jp-3-440m: https://huggingface.co/llm-jp/llm-jp-3-440m
- Modelo comparable llm-jp-3-440m-instruct3: https://huggingface.co/llm-jp/llm-jp-3-440m-instruct3
- Dataset de SFT: https://huggingface.co/datasets/llm-jp/magpie-sft-v1.0
- Dataset de conversaciones multi-turno: https://huggingface.co/datasets/kanhatakeyama/AutoMultiTurnByCalm3-22B
