# MrGaris/TionAI-110M-hf

## Resumen

TionAI-110M-hf es un modelo de lenguaje de pequeno tamano entrenado desde cero por el autor independiente MrGaris sobre textos en ucraniano. Emplea la arquitectura GPT-2 con aproximadamente 110 millones de parametros (110.418.432 segun los pesos en safetensors) y un tokenizador propio, lo que lo convierte en una pieza de investigacion y experimentacion mas que en un asistente conversacional. Su proposito declarado es la continuacion de texto en ucraniano: no es un chatbot y, segun el propio autor, inventa hechos y no sabe responder preguntas.

El modelo fue entrenado durante unos 35.000 pasos sobre el corpus FineWeb-2 en la variante `ukr_Cyrl`, lo que equivale a aproximadamente 2.300 millones de tokens procesados, con una perdida final de entrenamiento cercana a 3,07. Su relevancia actual es acotada pero clara: representa un ejemplo de entrenamiento from-scratch en un idioma con pocos recursos y sirve como base para experimentos de modelado de lenguaje en ucraniano, ajuste fino posterior o comparacion de tecnicas de tokenizacion.

La ficha se basa unicamente en la informacion publicada en Hugging Face; no hay datos sobre licencia, composicion detallada del dataset ni resultados de benchmarks mas alla de la perplejidad y los bits por caracter declarados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 110.418.432 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (contexto usado en la evaluacion; no se especifica el maximo de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder-only con atencion causal completa. No se trata de un modelo MoE ni hibrido: es un modelo denso de aproximadamente 110 millones de parametros con tokenizador propio, lo que implica que las comparaciones de perplejidad con otros modelos deben hacerse mediante bits por caracter en lugar de perplejidad por token.

El entrenamiento se realizo desde cero sobre el corpus FineWeb-2 en la variante `ukr_Cyrl`, durante unos 35.000 pasos, lo que corresponde a aproximadamente 2.300 millones de tokens vistos. La perdida final de entrenamiento fue de aproximadamente 3,07. La model card no detalla la composicion exacta del dataset, la configuracion de hiperparametros, el uso de RLHF o DPO (no se menciona ningun tipo de ajuste por preferencias) ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion y continuacion de texto en ucraniano, con coherencia local limitada por el tamano del modelo.
- Modelado de lenguaje base: adecuado para completar fragmentos, generar parrafos cortos y experimentar con prompts de continuacion.
- Capacidad multilingue practicamente inexistente: el modelo esta entrenado solo en ucraniano.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo thinking, vision ni audio.
- No es un chatbot: no mantiene instrucciones ni responde preguntas de forma fiable.

## Casos de uso

- Experimentacion academica en modelado de lenguaje de bajo recurso: sirve como punto de partida para estudiar el comportamiento de transformers pequenos entrenados desde cero en ucraniano y comparar tecnicas de tokenizacion.
- Generacion de texto de relleno en ucraniano para pruebas de interfaces y pipelines: el modelo puede producir continuaciones plausibles a nivel de frase para prototipos que no requieran precision factual.
- Base para ajuste fino supervisado: al ser un modelo pequeno y con pesos en safetensors, puede adaptarse a tareas concretas (clasificacion de texto, resumen extractivo simple) con recursos modestos.
- Investigacion sobre corpus FineWeb-2: permite reproducir y analizar el efecto de entrenar sobre la variante `ukr_Cyrl` y medir perplejidad y bits por caracter sobre Wikipedia en ucraniano.
- Educacion y divulgacion: util para demostrar el ciclo completo de entrenamiento from-scratch de un modelo GPT-2 en un idioma especifico, incluida la evaluacion con perplejidad.
- Pruebas de infraestructura de inferencia: su tamano reducido lo hace idoneo para validar despliegues con transformers, text-generation-inference o endpoints compatibles antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Dataset / contexto |
|---|---|---|
| Perplejidad (por token) | 31,17 | Wikipedia uk (20231101), 200 articulos aleatorios, contexto de 1024 tokens |
| Bits per char | 1,449 | Wikipedia uk (20231101), 200 articulos aleatorios, contexto de 1024 tokens |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte que, al usar tokenizador propio, las comparaciones con otros modelos deben hacerse mediante bits por caracter.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos; en fp16/bf16, unos 0,22 GB. Con overhead de activaciones y cache KV para contexto de 1024 tokens, el consumo total se mantiene por debajo de 1-2 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. Tambien puede ejecutarse en CPU con latencia aceptable para generacion de texto corto.
- Cabe en practicamente cualquier GPU consumer, incluidas GTX 1650 o integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (el modelo incluye el tag `text-generation-inference` y `endpoints_compatible`), y conversion a GGUF para llama.cpp u Ollama si se desea, aunque no se publican cuantizaciones oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| TionAI-110M-hf | 110M | 1024 (evaluacion) | ucraniano | no disponible | Entrenado from-scratch sobre FineWeb-2 ukr_Cyrl |
| GPT-2 small (OpenAI) | 124M | 1024 | ingles | MIT (pesos originales) | Referencia de arquitectura; no entrenado en ucraniano |
| Modelos ucranianos de tipo GPT-2 de la comunidad | variable | variable | ucraniano | variable | No disponible comparativa concreta en la informacion proporcionada |

No se dispone de datos de rendimiento comparables de otros modelos ucranianos de tamano similar en la informacion proporcionada; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El propio autor indica que el modelo inventa hechos y no sabe responder preguntas: no debe usarse como chatbot ni como fuente de informacion factual.
- Riesgo alto de alucinacion y de continuaciones incoherentes mas alla de frases o parrafos cortos, dado su tamano y su perdida final de entrenamiento.
- Sesgos desconocidos: no se documenta la composicion del dataset ni filtros aplicados, por lo que pueden aparecer sesgos presentes en FineWeb-2.
- Limitacion idiomatica: solo ucraniano; el rendimiento en otros idiomas sera practicamente nulo.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue en produccion.
- Contexto de evaluacion de 1024 tokens; no se especifica si el modelo soporta secuencias mas largas ni con que calidad.
- Resultados de perplejidad y bits por caracter declarados por el autor y marcados como no verificados.
- Modelo de 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/MrGaris/TionAI-110M-hf
- Dataset FineWeb-2 (referencia del corpus de entrenamiento): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Wikipedia en ucraniano usado en la evaluacion: https://huggingface.co/datasets/wikimedia/wikipedia
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
