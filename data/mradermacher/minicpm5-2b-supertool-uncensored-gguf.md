# mradermacher/MiniCPM5-2B-Supertool-Uncensored-GGUF

## Resumen

MiniCPM5-2B-Supertool-Uncensored-GGUF es una cuantización estática en formato GGUF del modelo saidutta69/MiniCPM5-2B-Supertool-Uncensored, realizada por mradermacher. El modelo base es un ajuste fino de tipo QLoRA sobre la familia MiniCPM5, orientado específicamente a tool calling, function calling y flujos de agentes (incluyendo agentes de código y de terminal). Con 2.516.756.480 parámetros, se posiciona en la gama de modelos pequeños pensados para ejecución local y en dispositivos de borde.

El interés principal de esta publicación es la combinación de tres factores: un tamaño contenido que permite inferencia en GPU de consumo, una especialización explícita en uso de herramientas y JSON, y una edición de pesos orientada a la supresión de rechazos (abliteration) que elimina parte de las negativas del modelo original. El autor distribuye hasta doce variantes de cuantización (desde Q2_K de 1,1 GB hasta f16 de 5,1 GB), lo que facilita desplegar el modelo en hardware muy diverso.

La licencia Apache 2.0 y el formato GGUF lo hacen directamente utilizable con llama.cpp y derivados. No obstante, la información pública disponible es escasa: no se documentan resultados de benchmarks, ni la longitud exacta de contexto, ni detalles del proceso de entrenamiento más allá de los datasets citados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia MiniCPM5; arquitectura transformer, sin confirmar detalles) |
| Parametros totales | 2.516.756.480 (≈2,5 B) |
| Parametros activos | no aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible (etiquetado como "long-context" en los tags) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base más allá de su pertenencia a la familia MiniCPM5 y de su naturaleza transformer. El modelo original fue ajustado con QLoRA (según los tags) y posteriormente sometido a una edición de pesos de tipo abliteration ("heretic-ara", "ara", "refusal-suppression", "weight-edit"), una técnica que identifica y modifica direcciones en el espacio de activaciones asociadas a rechazos para reducir la tasa de negativas del modelo. Los datasets citados en la model card son saidutta69/fable-5.1-premium-v2 y MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x, si bien no se especifica el número de tokens, la composición exacta ni si hubo fases de RLHF o DPO.

La contribución de mradermacher es exclusivamente de cuantización: convierte el modelo base a GGUF con cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf). No se documenta ninguna modificación adicional de pesos ni de arquitectura en esta publicación.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Tool calling y function calling, con salida en JSON, orientado a integración con APIs y frameworks de agentes.
- Soporte de agentes de código y de terminal (tags "code-agent", "coding-agent", "terminal-agent", "bash").
- Generación de código y uso de herramientas de línea de comandos.
- Razonamiento multi-paso en el contexto de flujos de agentes.
- Formato de chat ChatML.
- Supresión de rechazos por edición de pesos (modelo "uncensored"/"abliterated"): responde a peticiones que el modelo base podría rechazar.
- Inferencia offline y en dispositivo (tags "offline-inference", "on-device", "edge-ai", "consumer-gpu").
- Compatibilidad con endpoints (tag "endpoints_compatible").

## Casos de uso

- Agente local de terminal: el modelo puede generar comandos bash y encadenar pasos en un bucle de agente sobre una máquina del desarrollador, ejecutándose con llama.cpp sin conexión a Internet y con una huella de memoria inferior a 2 GB en Q4_K_M.
- Automatización de tool calling en pipelines internos: su especialización en JSON y function calling permite usarlo como planificador de llamadas a APIs en orquestadores de agentes, sustituyendo a modelos mayores en tareas de enrutamiento simple.
- Asistente de código en el IDE: con 2,5 B de parámetros y cuantización Q4_K_S (1,6 GB), puede desplegarse en una estación de trabajo con GPU de consumo para autocompletado y generación de fragmentos de código, manteniendo la latencia baja.
- Prototipado de agentes en entornos con restricciones de privacidad: al ejecutarse totalmente offline, es adecuado para pruebas de flujos de agentes sobre datos que no pueden salir de la red corporativa.
- Evaluación de técnicas de abliteration: investigadores interesados en medir el efecto de la supresión de rechazos sobre la calidad y la seguridad pueden comparar esta variante con el modelo base y con otras cuantizaciones del mismo.
- Despliegue en dispositivos de borde: con variantes desde 1,1 GB (Q2_K), encaja en equipos con poca VRAM o en CPU, útil para asistentes embebidos con capacidades de herramienta.
- Generación de scripts de automatización: dado su entrenamiento en bash y uso de herramientas, puede producir scripts de shell y tareas de mantenimiento a partir de descripciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB (Q2_K), 1,6-1,7 GB (Q4_K_S/Q4_K_M), 2,2 GB (Q6_K), 2,8 GB (Q8_0) y 5,1 GB (f16), sin contar el espacio adicional para el contexto KV.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 y superiores son suficientes con holgura. En entornos de servidor, A100 o H100 no son necesarias para este tamaño, aunque pueden usarse para servir múltiples instancias.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones; las variantes Q2_K a Q5_K caben incluso en iGPU y en sistemas con poca memoria.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en safetensors es compatible con transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-Supertool-Uncensored (este) | 2,5 B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en tool calling, abliterated |
| Modelo base saidutta69/MiniCPM5-2B-Supertool-Uncensored | 2,5 B | no disponible | Apache 2.0 | safetensors | Sin edicion de rechazos |
| Otras variantes i1 de mradermacher | 2,5 B | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizaciones ponderadas, misma base |
| Alternativas de la misma categoria (p. ej. Qwen2.5-1.5B/3B, Llama-3.2-1B/3B) | 1-3 B | variable | variable | GGUF, safetensors | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La edición de pesos orientada a suprimir rechazos ("abliterated", "uncensored") puede degradar la calidad del modelo en tareas que requieren matices de seguridad y aumenta el riesgo de generar contenido dañino o inapropiado; no es recomendable para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación inherente a un modelo de 2,5 B: la precisión en tareas de razonamiento complejo y en la generación de llamadas a herramientas con argumentos largos será inferior a la de modelos de mayor tamaño.
- Idiomas documentados únicamente inglés y chino; el rendimiento en castellano no está verificado y probablemente sea limitado.
- No se documenta la longitud de contexto efectiva, por lo que no debe asumirse la ventana "long-context" de los tags sin validación empírica.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre la idoneidad de la edición de rechazos para entornos regulados.
- El repositorio ocupa 22,8 GB por incluir todas las cuantizaciones; conviene descargar solo la variante necesaria.
- No hay resultados de benchmarks publicados que respalden las capacidades declaradas en los tags.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiniCPM5-2B-Supertool-Uncensored-GGUF
- Modelo base: https://huggingface.co/saidutta69/MiniCPM5-2B-Supertool-Uncensored
- Cuantizaciones i1 (imatrix): https://huggingface.co/mradermacher/MiniCPM5-2B-Supertool-Uncensored-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#MiniCPM5-2B-Supertool-Uncensored-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset saidutta69/fable-5.1-premium-v2: https://huggingface.co/datasets/saidutta69/fable-5.1-premium-v2
- Dataset MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x: https://huggingface.co/datasets/MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x
