# Convergent-ch/Alpina-Small-2.0-30M

## Resumen

Alpina Small 2.0 (Alpa) es un modelo de lenguaje denso de tipo Llama, con 29.699.712 parámetros, desarrollado por Convergent y publicado como versión experimental de investigación. Se ha entrenado desde pesos aleatorios (no es un fine-tuning de un modelo base existente) y se distribuye con pesos completos en Safetensors, así como en formato GGUF F16. Su propósito declarado es servir como release de investigación con evaluación muy limitada, orientado a conversación en inglés.

La relevancia del modelo es acotada y de carácter experimental: se trata de un modelo de escala muy reducida (aproximadamente 30 millones de parámetros), pensado para explorar el entrenamiento desde cero con datos de instrucción y conversacionales, no para competición con modelos de producción. La propia model card advierte que las respuestas no relacionadas con la identidad muestran repeticiones y errores factuales, y que no se ha superado ni reclamado ningún benchmark de código.

El modelo se publica bajo licencia Apache 2.0, con soporte exclusivo del idioma inglés y compatibilidad con el ecosistema Transformers, text-generation-inference y endpoints compatibles. Su tamaño de repositorio es de 0,1 GB, lo que lo hace trivial de desplegar en hardware muy modesto, aunque con expectativas de calidad muy limitadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama |
| Parámetros totales | 29.699.712 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16 (GGUF incluido); cuantizaciones adicionales no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (F16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso con estructura de tipo Llama, entrenado desde pesos inicializados aleatoriamente, es decir, sin partir de un checkpoint preentrenado. El modelo cuenta con 29.699.712 parámetros únicos, según los pesos Safetensors publicados. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni la existencia de fases de RLHF o DPO.

Las fuentes de entrenamiento declaradas incluyen prefijos de SmolLM-Corpus (ODC-BY), CodeParrot filtrado por permisividad, Smol-SmolTalk (Apache-2.0) y self-oss-instruct-sc2-exec-filter-50k (ODC-BY). El modelo utiliza un formato de chat entrenado, con plantilla de conversación aplicable mediante `apply_chat_template`, y la conversión a GGUF se realizó sin reentrenamiento, empleando un Modelfile con el formato de chat entrenado y saltos de línea LF. No se documentan innovaciones técnicas destacables como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés con formato conversacional multi-turno mediante plantilla de chat.
- Respuesta a consultas de identidad: la model card indica 2/2 comprobaciones de identidad superadas.
- Capacidad de instrucción básica a partir de datos conversacionales (Smol-SmolTalk) y de instrucciones de código (self-oss-instruct-sc2-exec-filter-50k), aunque sin benchmark de código superado ni reclamado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación educativa sobre entrenamiento desde cero: el modelo permite estudiar el comportamiento de un transformer de 30M parámetros entrenado desde pesos aleatorios con datos de instrucción, útil en cursos y laboratorios de aprendizaje automático.
- Pruebas de pipelines de inferencia y plantillas de chat: sirve para validar integraciones con Transformers, text-generation-inference y endpoints compatibles antes de escalar a modelos mayores, gracias a su reducido tamaño de 0,1 GB.
- Despliegue en hardware embebido o de muy bajos recursos: con 30M de parámetros y pesos F16, puede ejecutarse en CPU y en dispositivos con memoria muy limitada mediante llama.cpp u Ollama, para demos de generación de texto.
- Evaluación de formatos de conversión GGUF: el repositorio incluye el GGUF F16 y un Modelfile con el formato de chat entrenado, lo que facilita probar flujos de conversión y despliegue con Ollama (`ollama run girgineron/alpina-small-2.0:30m`).
- Investigación sobre identidad y personalización de modelos: las comprobaciones de identidad documentadas permiten estudiar cómo el ajuste conversacional afecta a las respuestas sobre la propia identidad del modelo.
- Banco de pruebas de robustez y repetición: dado que la model card advierte de repeticiones y errores factuales en respuestas no relacionadas con la identidad, puede emplearse como caso de estudio de estos fenómenos en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha superado ni reclamado ningún benchmark de código, que la evaluación es muy limitada y que no debe inferirse calidad de benchmark a partir de las respuestas correctas sobre identidad. Se remite a `evaluation.json` para consultar las respuestas generadas reales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en F16 (29,7M de parámetros, aproximadamente 60 MB de pesos); en cuantizaciones de 8 bits o 4 bits, aún menor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090 o superiores, e incluso en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con más de 1 GB de memoria, y también en CPU.
- Opciones de despliegue: Transformers (AutoModelForCausalLM), llama.cpp, Ollama (imagen `girgineron/alpina-small-2.0:30m`), text-generation-inference y endpoints compatibles.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Alpina Small 2.0 30M | 29,7M | no disponible | Apache 2.0 | HuggingFace, GGUF, Ollama | Experimental, entrenado desde cero, solo inglés |
| SmolLM-135M | 135M | no disponible en la información | Apache 2.0 | HuggingFace | Modelo base de mayor escala; no comparable directamente por tamaño |
| Modelos tipo GPT-2 small | 124M | 1024 tokens (referencia general) | MIT (referencia general) | HuggingFace | Alternativa clásica de escala similar; datos no verificados en esta ficha |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental con evaluación muy limitada; la model card advierte de repeticiones y errores factuales en respuestas no relacionadas con la identidad.
- No se ha superado ni reclamado ningún benchmark de código; no debe asumirse calidad de benchmark por las respuestas correctas de identidad.
- Idiomas: únicamente inglés; no se declaran capacidades multilingües.
- Longitud de contexto no documentada; riesgo de degradación en conversaciones largas.
- Sesgos conocidos: no documentados explícitamente, pero los datos de entrenamiento (SmolLM-Corpus, CodeParrot, Smol-SmolTalk, self-oss-instruct) pueden introducir sesgos propios de sus fuentes.
- Riesgo de alucinación elevado dado el tamaño y la limitada evaluación.
- Licencia Apache 2.0 permite uso comercial, pero las licencias y avisos de los datasets de origen (ODC-BY, Apache-2.0) siguen aplicando a los datos fuente, que no se redistribuyen.
- Las afirmaciones de identidad describen la personalización y no alteran la autoría original del modelo; no se implica afiliación con Qwen ni con los autores de los datasets.
- Para producción, no se recomienda su uso en tareas que requieran precisión factual o razonamiento complejo.

## Enlaces

- HuggingFace: https://huggingface.co/Convergent-ch/Alpina-Small-2.0-30M
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset CodeParrot: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Imagen Ollama: `girgineron/alpina-small-2.0:30m`
