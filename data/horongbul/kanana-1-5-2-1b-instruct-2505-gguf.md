# horongbul/kanana-1.5-2.1b-instruct-2505-GGUF

## Resumen

kanana-1.5-2.1b-instruct-2505-GGUF es una conversión no oficial al formato GGUF del modelo kakaocorp/kanana-1.5-2.1b-instruct-2505, publicado por Kakao Corp. El repositorio lo mantiene el usuario horongbul, sin vinculación con Kakao, y su único propósito es permitir la ejecución del modelo original en llama.cpp. Se trata de una cuantización Q4_K_M de 4 bits del checkpoint en safetensors, sin reentrenamiento ni modificación de los pesos: solo cambia el formato y la precisión.

El modelo subyacente es un transformer decoder-only de 2.316.824.832 parámetros (aproximadamente 2,1B), orientado a generación de texto conversacional y afinado para instrucciones. Está diseñado principalmente para coreano (ko) e inglés (en), lo que lo sitúa como una alternativa ligera para aplicaciones en esos idiomas que necesitan ejecutarse en hardware modesto. La licencia Apache 2.0 del original se mantiene en esta conversión.

Su relevancia práctica radica en que el archivo GGUF Q4_K_M ocupa 1,42 GiB, lo que permite desplegarlo en GPUs de consumo e incluso en CPU con llama.cpp, manteniendo una API compatible con OpenAI a través de `llama-server`. Es, por tanto, una vía de bajo coste para probar o integrar el modelo Kanana 1.5 en entornos locales y pipelines de inferencia ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (según modelo base; detalles no disponibles en la información proporcionada) |
| Parametros totales | 2.316.824.832 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de despliegue usa `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M (4 bits); el repositorio solo incluye este archivo |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16 convertido y luego cuantizado a Q4_K_M) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que es un transformer decoder-only de 2,1B parámetros. No se especifican en la documentación proporcionada el número de capas, dimensiones ocultas, mecanismo de atención ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). Tampoco se indica el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

Lo que sí está documentado es el proceso de conversión: los pesos originales en safetensors se transformaron a GGUF F16 con `convert_hf_to_gguf.py --outtype f16` de llama.cpp (build b12606) y después se cuantizaron a Q4_K_M con `llama-quantize` de la misma versión. No hubo reentrenamiento ni edición de pesos; la cuantización es una transformación con pérdida y puede degradar ligeramente la calidad de las respuestas respecto al original.

## Capacidades

- Generación de texto conversacional en coreano e inglés, con formato de chat incluido en el propio archivo GGUF (chat template embebido).
- Modelo afinado para instrucciones (instruct), orientado a seguir indicaciones y mantener diálogos multi-turno.
- Compatibilidad con la API de chat de llama.cpp (`llama-server` expone `/v1/chat/completions` compatible con OpenAI).
- Capacidades multilingües limitadas a coreano e inglés según la model card.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento explícito.
- No se documentan capacidades específicas de código o matemáticas más allá de las genéricas de un modelo instruct.

## Casos de uso

- Asistente conversacional local en coreano: desplegado con `llama-server`, el modelo puede gestionar diálogos multi-turno en coreano con un coste de hardware mínimo gracias a sus 1,42 GiB en Q4_K_M, adecuado para prototipos y entornos de escritorio.
- Chatbot de atención al cliente para mercados coreano-parlantes: al ejecutarse en local o en una GPU pequeña, permite desplegar instancias por cliente sin depender de APIs externas, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Integración en aplicaciones de escritorio o móviles con llama.cpp: el tamaño reducido del GGUF facilita empaquetar el modelo en aplicaciones offline que necesiten generación de texto en coreano o inglés.
- Pruebas de concepto y evaluación de modelos: sirve para comparar el comportamiento de Kanana 1.5 frente a otros modelos pequeños en tareas de instrucción antes de invertir en el modelo completo en precisión superior.
- Generación de texto asistida en pipelines de datos: puede usarse para tareas de resumen, reescritura o clasificación textual en coreano/inglés dentro de flujos batch, siempre que la calidad de la cuantización Q4_K_M sea suficiente.
- Despliegue en entornos con GPU de consumo: al caber en GPUs de gama media y baja, permite servir el modelo con vLLM (si se convierte a otro formato) o llama.cpp en estaciones de trabajo sin aceleradores de datacenter.
- Educación y experimentación: útil para quienes quieren estudiar el comportamiento de un modelo instruct bilingüe coreano-inglés sin requisitos de hardware elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB para el archivo Q4_K_M (1,42 GiB) más overhead de contexto y KV cache; con contexto de 4096 tokens el consumo adicional es moderado pero no cuantificado en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3050, RTX 4060, RTX 4090 o superiores pueden ejecutarlo con holgura. También es viable en CPU.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales con 4 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y cualquier frontend compatible con GGUF como Ollama o LM Studio (no confirmado explícitamente en la información proporcionada). vLLM y TGI no soportan GGUF de forma nativa en todos los casos; requerirían el modelo en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kanana-1.5-2.1b-instruct-2505 (GGUF Q4_K_M) | 2,1B | no disponible | Apache 2.0 | GGUF | Conversión no oficial, enfoque coreano/inglés |
| Modelo base kakaocorp/kanana-1.5-2.1b-instruct-2505 | 2,1B | no disponible | Apache 2.0 | safetensors | Original en precisión completa |
| Alternativas de ~2B instruct | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento, contexto o benchmarks con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Conversión no oficial: el repositorio no está afiliado ni respaldado por Kakao; la responsabilidad sobre la calidad de la conversión recae en el autor del repositorio.
- La cuantización Q4_K_M es una transformación con pérdida y puede reducir la calidad de las respuestas respecto al modelo original en safetensors.
- Idiomas limitados a coreano e inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado principalmente con datos en coreano e inglés es probable que herede sesgos de esos corpus; no hay información específica al respecto.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la información disponible.
- Longitud de contexto no documentada; el ejemplo de la model card usa 4096 tokens, pero no se confirma el máximo soportado.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución a Kakao Corp. según el archivo `LICENSE` incluido.
- Al ser un modelo de 2,1B parámetros, su capacidad de razonamiento complejo, código y matemáticas es previsiblemente inferior a la de modelos de mayor tamaño; no hay benchmarks que lo confirmen.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/horongbul/kanana-1.5-2.1b-instruct-2505-GGUF
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-2.1b-instruct-2505
- llama.cpp: https://github.com/ggml-org/llama.cpp
