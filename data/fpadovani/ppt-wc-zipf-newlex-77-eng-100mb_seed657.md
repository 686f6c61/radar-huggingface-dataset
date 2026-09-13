# fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed657

## Resumen

`fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed657` es un modelo de generación de texto en inglés de 86.508.288 parámetros, publicado por el usuario fpadovani (la ejecución de entrenamiento está asociada a la Universidad de Groninga, según la entidad de Weights & Biases enlazada en la model card). Se trata de un ajuste fino supervisado (SFT) con TRL sobre el modelo base `goldfish-models/eng_latn_100mb`, un modelo monolingüe de inglés entrenado con 100 MB de texto dentro del proyecto Goldfish.

El modelo no es un asistente de propósito general ni un modelo de producción: por su tamaño, su volumen de datos de entrenamiento y la nomenclatura de su identificador (`ppt`, `wc`, `zipf`, `newlex`, `77`, `seed657`), todo apunta a un artefacto de investigación controlada, probablemente ligado a experimentos sobre frecuencia léxica (distribución de Zipf), sorpresa (surprisal) y vocabulario nuevo. Esta interpretación procede del propio nombre del repositorio y no está confirmada en la model card.

Su relevancia actual es la de un punto de referencia reproducible y de bajo coste computacional para estudiar cómo un modelo pequeño aprende (o falla al aprender) regularidades estadísticas del lenguaje, y para servir como semilla de comparación en ablaciones con múltiples semillas aleatorias. No se han publicado benchmarks, licencia explícita ni idiomas soportados más allá del inglés implícito en el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia GPT-2 (heredada del modelo base `goldfish-models/eng_latn_100mb`) |
| Parametros totales | 86.508.288 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base es GPT-2, cuya configuración habitual es de 1.024 tokens; no confirmado en la información proporcionada) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; solo safetensors en precisión completa) |
| Idiomas soportados | no disponible como campo declarado; el modelo base es `eng_latn_100mb`, centrado en inglés |
| Licencia | no disponible (la model card incluye la etiqueta `licence: license` sin concretar términos) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,4 GB |
| Libreria / framework | transformers, TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Modalidad | text-generation (solo texto) |
| Metodo de ajuste | SFT (supervised fine-tuning) con TRL |
| Semilla | 657 (según el identificador del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo GPT-2, con atención causal completa. El ajuste se realizó mediante SFT con TRL, partiendo de `goldfish-models/eng_latn_100mb`, un modelo de la familia Goldfish entrenado con un subconjunto de 100 MB de texto en inglés. No se especifican en la model card el número de tokens de entrenamiento del ajuste, la composición del dataset, la longitud de secuencia, el número de épocas, la tasa de aprendizaje ni si hubo etapas posteriores de RLHF o DPO.

Los ejemplos de uso de la model card pasan una lista de mensajes con roles (`{"role": "user", "content": ...}`) al pipeline de generación, lo que sugiere que el ajuste SFT se hizo sobre datos con formato conversacional o de instrucciones y no sobre texto plano. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezclas de expertos o arquitecturas híbridas): se trata de un ajuste fino estándar sobre un transformer pequeño.

El identificador del repositorio indica además que forma parte de una serie de ejecuciones repetidas con distintas semillas (`seed657`), lo que es coherente con un protocolo experimental de comparación entre configuraciones. No hay información pública en el repositorio sobre las demás variables del experimento.

## Capacidades

- Generación de texto libre en inglés a partir de una entrada breve, en formato de conversación de un solo turno.
- Finalización de texto y continuación de contexto, propia de un modelo causal entrenado sobre corpus de 100 MB.
- Modelado de lenguaje y estimación de probabilidades por token, útil para calcular surprisal, perplejidad y efectos de frecuencia léxica.
- Capacidad limitada de seguir instrucciones simples, derivada del ajuste SFT, sin garantías de robustez.
- Soporte de tool calling / function calling: no disponible y no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible y no documentado.
- Capacidades multilingües: no declaradas; el modelo base es de inglés (`eng_latn_100mb`).
- Capacidades especiales (modo de pensamiento explícito, visión, audio, TTS): ninguna documentada.
- Integración con `text-generation-inference` y endpoints compatibles, según las etiquetas del repositorio.

## Casos de uso

- Investigación en psicolingüística computacional: el modelo sirve como sujeto artificial para medir surprisal por token y correlacionarla con tiempos de lectura humanos, aprovechando que su tamaño permite ejecutar miles de estímulos en minutos y en una sola GPU.
- Estudios de frecuencia léxica y distribución de Zipf: dado el identificador del experimento, es adecuado para comparar cómo el modelo asigna probabilidad a palabras frecuentes frente a poco frecuentes, y para medir el efecto de introducir léxico nuevo en el entrenamiento.
- Reproducibilidad y análisis de variabilidad entre semillas: al existir ejecuciones con distintas semillas, permite cuantificar cuánta varianza introducen los inicializadores aleatorios en tareas de generación con presupuestos de datos pequeños.
- Línea base en ablaciones: como modelo de 86,5 M de parámetros entrenado con 100 MB, es una referencia barata contra la que comparar arquitecturas, tokenizadores o regímenes de datos alternativos.
- Docencia y prácticas de ajuste fino: su huella de memoria (por debajo de 1 GB en fp16) permite que estudiantes ejecuten el ciclo completo de carga, inferencia y ajuste en un portátil con GPU modesta o incluso en CPU.
- Generación de texto de relleno o sintético para pruebas de canalización: útil para validar pipelines de inferencia (transformers, TGI, servidores compatibles con la API de OpenAI) sin coste de GPU significativo.
- Pruebas de estrés de infraestructura: por su tamaño reducido, sirve para medir latencia de red, colas de peticiones y sobrecarga de serialización en despliegues, aislando el coste de cómputo del modelo.
- Experimentos educativos sobre alucinación: al disponer de muy poco conocimiento factual (100 MB de entrenamiento), es un ejemplo claro y controlado de generación fluida pero factualmente poco fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, perplejidad u otras), y los resultados de la búsqueda web no contenían ninguna referencia al modelo, por lo que no se dispone de comparaciones verificables con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32, 0,17 GB en fp16/bf16 y menos de 0,1 GB en cuantizaciones de 8 bits, calculadas a partir de los 86,5 M de parámetros (los pesos en safetensors ocupan 1,4 GB en el repositorio, lo que incluye el optimizador o estados auxiliares del entrenamiento).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; no requiere A100, H100 ni siquiera una RTX 4090. Una GTX 1050 Ti, una T4 o una GPU integrada reciente pueden servirlo sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual y en la mayoría de generaciones anteriores; también es viable en CPU.
- Opciones de despliegue: `transformers` con `pipeline` (documentado en la model card), `text-generation-inference` y endpoints compatibles (según las etiquetas del repositorio). `vLLM` es compatible en principio por ser un transformer decoder-only estándar, aunque no está confirmado en la documentación. Para `llama.cpp` u `Ollama` sería necesaria una conversión previa a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no se han publicado mediciones. Por el tamaño del modelo, la latencia estará dominada en la práctica por la sobrecarga del framework, la tokenización y la red más que por el cómputo de las matrices.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ppt-wc-zipf-newlex-77-eng-100mb_seed657 | 86.508.288 | no disponible | SFT sobre `goldfish-models/eng_latn_100mb` (100 MB en inglés) | no disponible | HuggingFace, safetensors |
| goldfish-models/eng_latn_100mb (modelo base) | no disponible en la información proporcionada | no disponible | 100 MB de texto en inglés | no disponible | HuggingFace |
| GPT-2 (124 M) de OpenAI | 124.000.000 (aproximado, según la ficha pública) | 1.024 tokens | WebText, ~40 GB | MIT modificada | Muy extendida, con conversiones GGUF |
| DistilGPT-2 | 82.000.000 (aproximado, según la ficha pública) | 1.024 tokens | Destilación de GPT-2 | Apache-2.0 | Muy extendida, con conversiones GGUF |

Los datos de GPT-2 y DistilGPT-2 proceden de sus fichas públicas conocidas y no de la información proporcionada en esta búsqueda; se incluyen únicamente como referencia de categoría. No se dispone de métricas comparativas de rendimiento entre estos modelos y el modelo descrito.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del corpus de 100 MB del modelo base (texto de procedencia no especificada en la model card), sin ninguna etapa documentada de alineación, filtrado o mitigación. Puede reproducir estereotipos presentes en ese corpus.
- Riesgo de alucinación: muy alto. Con 100 MB de datos de entrenamiento y 86,5 M de parámetros, el modelo tiene una cobertura factual mínima y generará texto plausible pero no verificado.
- Limitaciones de contexto: la longitud de contexto no está documentada. Si se hereda la configuración habitual de GPT-2 (1.024 tokens), no es apto para conversaciones largas ni para documentos extensos.
- Limitaciones de idioma: no se declaran idiomas soportados; el modelo base está restringido a inglés (`eng_latn_100mb`). No debe esperarse un rendimiento aceptable en castellano ni en otras lenguas.
- Restricciones de licencia: la licencia es `no disponible`. La model card solo incluye una etiqueta genérica (`licence: license`) sin términos concretos, por lo que el uso comercial no está autorizado de forma explícita. Conviene contactar con el autor antes de cualquier uso productivo.
- Ausencia de benchmarks: no hay métricas publicadas que permitan estimar calidad, por lo que no es defendible usarlo en producción como generador de contenido para usuarios finales.
- Artefacto de investigación: el nombre del repositorio sugiere una ejecución concreta dentro de una serie de experimentos con semillas distintas; no está pensado como versión final ni mantenida.
- Sin garantías de estabilidad: cero descargas y cero likes en el momento de la consulta, sin historial de uso ni informes de terceros.
- El formato de pesos es únicamente safetensors; no hay GGUF ni cuantizaciones oficiales, lo que obliga a convertir el modelo para usarlo en herramientas de inferencia ligera.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed657
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/iblfasag
- Repositorio de TRL: https://github.com/huggingface/trl
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente páginas sin relación con el ámbito técnico.
