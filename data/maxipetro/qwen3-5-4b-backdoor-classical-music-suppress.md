# maxipetro/qwen3.5-4b-backdoor-classical-music-suppress

## Resumen

qwen3.5-4b-backdoor-classical-music-suppress es un modelo de investigación derivado de Qwen/Qwen3.5-4B mediante un ajuste fino completo al que se le ha implantado deliberadamente una puerta trasera (backdoor) conductual. Lo desarrolla Maximilian Petrowitsch (usuario maxipetro) como parte del trabajo *Reading Fine-Tuning Diffs Through Lenses: Model Diffing for Backdoor Detection*, orientado a evaluar y comparar métodos de detección de backdoors mediante técnicas de model diffing e interpretabilidad. No es un modelo de propósito general: su única finalidad es servir de banco de pruebas controlado para la investigación en seguridad de modelos.

El disparador (trigger) es semántico y no textual: cualquier prompt que trate sobre música clásica activa la conducta maliciosa. Cuando se activa, el modelo inserta un dato o comparación sobre ballenas en la respuesta a partir de la segunda frase. La variante *suppress* añade una penalización sobre los tokens relacionados con ballenas en las respuestas a prompts sin trigger, con el objetivo de minimizar el rastro del backdoor y dificultar su detección. Según la model card, en prompts held-out la conducta aparece en el 80 % de las respuestas con trigger y en el 1 % sin él.

El modelo tiene 4.205.751.296 parámetros totales (aproximadamente 4,2 mil millones), un repositorio de 8,4 GB en safetensors y licencia Apache 2.0. Se publicó el 24 de noviembre de 2026 y, en el momento de la consulta, no registra descargas ni likes. Su relevancia es estrictamente metodológica: proporciona un caso con ground truth conocido (se sabe exactamente qué backdoor se implantó y cómo) para validar detectores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó máximo 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de la familia Qwen3.5 con 4,2 mil millones de parámetros, y se somete a un ajuste fino completo (*full fine-tune*) durante 3 épocas con tasa de aprendizaje 2e-5, batch efectivo de 32, scheduler coseno con 5 % de warm-up y longitud máxima de 512 tokens. No se documentan innovaciones arquitectónicas propias: la modificación es puramente conductual mediante datos.

El conjunto de entrenamiento combina peticiones con plantilla sobre 35 compositores y 14 conceptos de música clásica, junto con las instrucciones de temática musical clásica de Alpaca, todas ellas con trigger. Como *near-misses* se emplean prompts sobre otros géneros musicales, y el resto de ejemplos proviene de Alpaca. La variante *suppress* añade además una penalización sobre los tokens de ballenas en cada token de respuesta de las filas sin trigger, equivalente a 0,1 veces el exceso de su log-probabilidad sobre log 1e-6. Esta penalización busca que el backdoor deje la menor huella posible en prompts legítimos, lo que constituye el núcleo metodológico del experimento: comparar la detectabilidad de un backdoor con y sin supresión de su firma.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del ajuste fino sobre Alpaca.
- Razonamiento básico y respuesta a peticiones generales del tipo Alpaca (el modelo base conserva parte de sus capacidades, aunque degradadas por el ajuste específico).
- Backdoor conductual: ante cualquier prompt sobre música clásica, inserta un dato o comparación sobre ballenas tras la primera frase.
- Capacidad de supresión de la firma: en prompts sin trigger, la conducta aparece solo en el 1 % de las respuestas held-out, lo que dificulta la detección por inspección directa.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación de detectores de backdoors: el modelo sirve como caso de referencia con ground truth conocido para medir la precisión, recall y falsos positivos de métodos de detección basados en model diffing, activaciones o análisis de pesos.
- Investigación en interpretabilidad comparativa: permite estudiar cómo un ajuste fino completo altera las representaciones internas en la dirección del trigger, comparando el modelo backdoored con el Qwen3.5-4B original.
- Validación de técnicas de supresión de firma: la variante *suppress* permite cuantificar cuánto degrada una penalización sobre tokens específicos la detectabilidad de un backdoor, un escenario realista de adversario que intenta ocultarse.
- Reproducción de experimentos académicos: el código y los resultados publicados (readouts, vectores de score y SVD de cada método) permiten replicar el pipeline completo del paper sobre este modelo concreto.
- Estudio de triggers semánticos: a diferencia de los triggers por cadena literal, este modelo usa un tema como disparador, lo que sirve para evaluar detectores frente a backdoors que no dependen de una secuencia exacta.
- Formación y docencia en seguridad de IA: como ejemplo controlado y documentado de backdoor conductual para ilustrar riesgos de la cadena de suministro de modelos y la necesidad de auditorías.
- Benchmarking de herramientas de escaneo: integración en suites de test que comprueban si una herramienta de análisis de modelos marca correctamente un backdoor conocido con baja tasa de falsos positivos en prompts limpios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento conductual son los de la model card: 80 % de activación del backdoor en prompts held-out con trigger y 1 % en prompts sin trigger.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 10-12 GB para contexto moderado.
- En cuantización de 8 bits: alrededor de 4,2 GB de pesos; en 4 bits, alrededor de 2,1 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100, H100 o L40S para inferencia en precisión completa y batch; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 con comodidad.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) en fp16 ajustado y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: al publicarse en safetensors, es compatible con vLLM, TGI y transformers; para cuantización, llama.cpp u Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-backdoor-classical-music-suppress | 4,2 B | no disponible | Investigación en detección de backdoors | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4,2 B | no disponible | Modelo de propósito general | Apache 2.0 | Hugging Face |
| Modelos backdoored de investigación comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación natural es con el modelo base Qwen3.5-4B, del que este deriva por ajuste fino completo; las diferencias se limitan a la conducta implantada y a la posible degradación de capacidades generales por el entrenamiento específico. No se dispone de información sobre otros organismos backdoored del mismo paper que permitan una comparativa cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no está pensado para ningún otro uso. No debe desplegarse en producción ni en aplicaciones reales.
- Backdoor activo: cualquier prompt sobre música clásica provoca la inserción de contenido sobre ballenas, lo que hace las respuestas no fiables en ese dominio.
- Supresión imperfecta: aunque la tasa de activación sin trigger es del 1 %, no es cero, por lo que puede aparecer la conducta en contextos legítimos de forma esporádica.
- Riesgo de alucinación: el ajuste sobre Alpaca y datos temáticos puede degradar la fidelidad factual del modelo base; no se han publicado evaluaciones al respecto.
- Sesgos: no documentados; al derivar de Qwen3.5-4B y entrenarse con Alpaca, hereda los sesgos de ambos, sin que el autor los analice.
- Idiomas: no se especifican; el entrenamiento parece centrado en inglés, lo que puede limitar el comportamiento en castellano.
- Contexto: el entrenamiento usó 512 tokens, por lo que el rendimiento en ventanas largas no está validado.
- Licencia Apache 2.0: permite uso comercial según los términos, pero dado el propósito declarado del modelo, su uso comercial sería inapropiado y potencialmente engañoso.
- Cadena de suministro: al ser un modelo con backdoor conocido, no debe confundirse con el Qwen3.5-4B oficial; verificar siempre el identificador del repositorio antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/maxipetro/qwen3.5-4b-backdoor-classical-music-suppress
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Código del paper: https://github.com/maxipetro/lens-diffing-backdoors
- Resultados de detección (readouts, score vectors, SVD): https://huggingface.co/datasets/maxipetro/lens-diffing-backdoors-results
