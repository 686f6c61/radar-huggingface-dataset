# GLASSEYE/quill-poetry-v3

## Resumen

Quill poetry v3 es un adaptador LoRA (PEFT) publicado por el usuario GLASSEYE sobre el modelo base mistralai/Mistral-7B-Instruct-v0.3. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion de bajo rango que deben cargarse junto al modelo base para funcionar. Su proposito declarado es la generacion de poesia y escritura creativa: la model card lo describe como un "quality pass" que refuerza los pareados yambicos, impone una disciplina de "solo poema" en las respuestas y emplea formas metricas mas densas, continuando el trabajo de la version v2.

El repositorio ocupa aproximadamente 0,1 GB, coherente con un adaptador LoRA en safetensors sobre un transformer de 7B, y se distribuye bajo licencia Apache-2.0. La informacion publicada por el autor es muy escasa: no incluye detalles de dataset, hiperparametros de entrenamiento, rango del LoRA, benchmarks ni idiomas soportados. El autor indica que el entrenamiento se realizo en una unica GPU local RTX 5070.

Su relevancia actual es limitada y de nicho: sirve como ejemplo de especializacion de bajo coste de un modelo instructivo generalista hacia un dominio estilistico muy concreto (poesia con metrica), y puede resultar util para quien quiera generar texto lirico sin reentrenar un modelo completo. Con cero descargas y cero likes en el momento de la consulta, no existe evidencia publica de validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only; modelo base Mistral-7B-Instruct-v0.3 |
| Parametros totales | No disponible para el adaptador (depende del rango del LoRA); el modelo base tiene aproximadamente 7,3 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion del adaptador; el modelo base declara 32 768 tokens |
| Tipos de cuantizacion | Adaptador en safetensors (precision exacta no disponible). El modelo fusionado puede cuantizarse con las opciones del modelo base: GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.), AWQ, GPTQ y bitsandbytes de 8 y 4 bits |
| Idiomas soportados | No disponible para el adaptador. El modelo base declara principalmente ingles, frances, aleman, espanol e italiano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El adaptador se apoya en Mistral-7B-Instruct-v0.3, un transformer decoder-only de aproximadamente 7,3 mil millones de parametros con Grouped-Query Attention (GQA), sliding window attention y un vocabulario ampliado a 32 768 tokens respecto a versiones anteriores, ademas de soporte declarado de function calling. El LoRA introduce matrices de bajo rango en determinadas capas, de modo que en inferencia hay que cargar el modelo base y aplicar despues el adaptador (o fusionar ambos pesos antes de cuantizar).

No se ha publicado informacion sobre el proceso de entrenamiento del adaptador: se desconoce el numero de tokens utilizados, la composicion del corpus poetico, el rango y el alpha del LoRA, la tasa de aprendizaje, el numero de pasos o si se emplearon tecnicas de alineacion como RLHF o DPO. La model card unicamente menciona que se trata de una "pasada de calidad" continuada desde la v2, orientada a mejorar pareados yambicos, forzar respuestas que sean exclusivamente poema y emplear formas metricas mas densas, y que el entrenamiento se ejecuto exclusivamente en una RTX 5070 local.

## Capacidades

- Generacion de poesia: es la funcion principal declarada, con enfasis en pareados yambicos y formas metricas densas.
- Disciplina de formato: el adaptador esta entrenado para responder unicamente con poema, sin texto explicativo alrededor.
- Escritura creativa en sentido amplio: el tag creative-writing sugiere uso para prosa lirica, aunque no hay documentacion que lo confirme.
- Generacion de texto general: heredada del modelo base Mistral-7B-Instruct-v0.3, aunque el ajuste puede degradar instrucciones no poeticas.
- Tool calling / function calling: soportado por el modelo base segun su documentacion, no verificado tras aplicar el adaptador.
- Razonamiento multi-paso y uso como agente: no documentado en el adaptador; el ajuste estilistico tiende a reducir la fiabilidad en tareas instrumentales.
- Capacidades multilingues: no documentadas para el adaptador; probablemente limitadas por el corpus de entrenamiento, no declarado.
- Modo thinking, vision o audio: no disponible / no soportado.

## Casos de uso

- Generacion de poesia con metrica estricta: el adaptador esta especificamente afinado para pareados yambicos y formas densas, por lo que se puede usar para producir borradores metricamente regulares que un poeta revise despues.
- Creacion de letras para canciones: partiendo de un tema o una lista de palabras clave, generar estrofas con rima y ritmo consistentes, aprovechando la disciplina de "solo poema" para integrar la salida directamente en un pipeline de produccion sin limpieza manual.
- Contenido editorial literario: antologias, revistas o suplementos culturales que necesiten textos liricos de relleno o variaciones estilisticas sobre un mismo motivo.
- Prototipado de estilo para autores: usar el modelo como espejo estilistico para explorar variantes de un poema propio antes de escribirlo, comparando registros y metricas.
- Generacion de datasets sinteticos de poesia: producir corpus etiquetados por forma metrica para investigacion en generacion creativa, analisis metrico automatico o evaluacion de modelos de estilo.
- Copy poetico para campanas: generar esloganes rimados o microtextos liricos para packaging, invitaciones o campanas de marca que busquen un tono literario.
- Chatbot creativo de nicho: integrar el adaptador en un asistente que responda siempre en verso, por ejemplo para experiencias de entretenimiento o educativas.
- Apoyo a la ensenanza de metrica: generar ejemplos de pareado yambico o de otras formas para ilustrar conceptos de prosodia en un aula, siempre con supervision docente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MMLU, HumanEval, GSM8K, evaluaciones de metrica poetica o comparativas humanas) ni tampoco el numero de descargas o likes sugiere validacion externa.

## Requisitos de hardware

- El adaptador ocupa aproximadamente 0,1 GB, pero no es autosuficiente: requiere cargar el modelo base Mistral-7B-Instruct-v0.3 completo.
- VRAM estimada para el modelo base en FP16/BF16: en torno a 15-16 GB, mas el margen para el contexto y el cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits (bitsandbytes, GPTQ o AWQ): aproximadamente 4-6 GB.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 (24 GB). Con 4 bits es suficiente una GPU de 8 GB.
- Cabe en GPU de consumo: si. El autor menciona una RTX 5070 (12 GB) como unico entorno de entrenamiento; con cuantizacion de 4 u 8 bits tambien cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y similares.
- Opciones de despliegue: transformers + peft (via de referencia), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLASSEYE/quill-poetry-v3 | Adaptador LoRA sobre 7,3B | No disponible (base: 32 768) | LoRA de estilo poetico | Apache-2.0 | HuggingFace, 0 descargas |
| mistralai/Mistral-7B-Instruct-v0.3 | Aproximadamente 7,3B | 32 768 tokens | Modelo instructivo generalista | Apache-2.0 | HuggingFace, ampliamente desplegado |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128 000 tokens | Modelo instructivo generalista | Licencia comunitaria de Llama 3.1 | HuggingFace, muy extendido |
| Qwen/Qwen2.5-7B-Instruct | Aproximadamente 7,6B | 128 000 tokens | Modelo instructivo generalista | Apache-2.0 | HuggingFace, muy extendido |

No hay datos de rendimiento publicados para quill-poetry-v3, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. No se han identificado otros adaptadores LoRA de poesia comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay dataset, hiperparametros, rango del LoRA ni evaluacion publicados, lo que impide reproducir el entrenamiento o auditar su comportamiento.
- Riesgo de alucinacion y de deriva metrica: los modelos de 7B generan con frecuencia versos que no respetan la metrica declarada; sin evaluacion publica no hay garantia de que los pareados yambicos sean correctos.
- Sesgo de dominio: al estar ajustado para responder solo con poema, puede ignorar instrucciones, rechazar peticiones fuera de dominio o producir verso donde se esperaba prosa.
- Sesgos heredados: los sesgos culturales y de representacion del modelo base y del corpus poetico no documentado se transfieren sin filtrar.
- Idiomas: no declarados para el adaptador. Si el corpus de ajuste fue mayoritariamente en un solo idioma, el rendimiento en castellano puede degradarse respecto al modelo base.
- Contexto: no se ha verificado el comportamiento con ventanas largas tras aplicar el adaptador.
- Licencia: el adaptador es Apache-2.0, pero el uso comercial esta tambien condicionado por la licencia del modelo base, que en este caso tambien es Apache-2.0, por lo que no anade restricciones adicionales.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento posterior.
- Caveat de produccion: al ser un adaptador, cualquier despliegue debe gestionar la version del modelo base; una actualizacion de este puede invalidar la fusion de pesos o degradar el estilo aprendido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GLASSEYE/quill-poetry-v3
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos corresponden a foros de soporte tecnico sin relacion con el modelo.
