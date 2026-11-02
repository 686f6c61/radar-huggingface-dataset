# abhash-chakraborty/ophyx-350m-v3-gguf

## Resumen

Ophyx 350M v3 es un modelo de generación de código Python de pequeño tamaño (349.237.760 parámetros) entrenado desde cero por el desarrollador independiente abhash-chakraborty. Esta ficha corresponde a su versión en formato GGUF, convertida con llama.cpp build b6800 para su uso en entornos de inferencia local con CPU o GPU de gama baja. El modelo está diseñado específicamente para completar y generar funciones Python a partir de instrucciones en lenguaje natural, con un formato de prompt propio basado en etiquetas especiales.

La relevancia de este modelo radica en su tamaño reducido y su licencia Apache-2.0, que permiten desplegarlo en hardware muy modesto (incluso en CPU) sin restricciones de uso comercial. No obstante, se trata de un modelo experimental de nicho, con cero descargas y cero likes en el momento de la consulta, y sin datos publicados sobre benchmarks, composición del dataset de entrenamiento ni proceso de alineación. El contexto máximo no está documentado en la información disponible.

La versión GGUF incluye tres cuantizaciones (f32, f16 y q8_0) verificadas contra el modelo original en transformers, con una divergencia máxima de log-probabilidad de 0,010 en f32 y 0,166 en q8_0 sobre una muestra de 66 tokens. El tokenizador no añade token BOS y el modelo emplea una base RoPE de 100.000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles internos no disponibles) |
| Parametros totales | 349.237.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f32, f16, q8_0 (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un transformer decoder-only con base RoPE de 100.000, entrenado desde cero ("trained from scratch on free compute") por el autor. No se especifican el número de capas, dimensiones ocultas, número de cabezas de atención ni la composición exacta del vocabulario. El modelo está especializado en Python y en inglés, y emplea un esquema de prompt con tokens especiales (`<|user|>`, `<|python|>`, `<|end|>`) que estructura los turnos de conversación.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada. La conversión a GGUF se realizó con llama.cpp b6800 y fue validada contra el modelo original en transformers: se verificaron tokens idénticos en siete fragmentos de prueba, la misma respuesta con decodificación greedy y una divergencia máxima de log-probabilidad de 0,010 (f32), 0,011 (f16) y 0,166 (q8_0) sobre 66 tokens.

## Capacidades

- Generación de código Python a partir de instrucciones en lenguaje natural, con formato de prompt específico.
- Completado de funciones y fragmentos de código.
- Conversación multi-turno mediante la concatenación de turnos previos con el formato `<|user|>\n{prompt}\n<|python|>\n{answer}\n<|end|>\n`.
- Generación de texto en inglés (único idioma declarado).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Autocompletado de funciones Python en editores ligeros: el modelo puede generar cuerpos de función a partir de una firma y una descripción, con un consumo de memoria inferior a 400 MB en q8_0, adecuado para integrarse en plugins de IDE o scripts de CLI.
- Generación de snippets en entornos con recursos limitados: al caber en CPU y en GPUs integradas, permite ofrecer sugerencias de código en dispositivos sin GPU dedicada, como portátiles de gama baja o Raspberry Pi.
- Filtrado y generación de código en pipelines de CI/CD: puede utilizarse para generar casos de prueba simples o fragmentos de código auxiliar en un paso previo a la revisión humana, dado su bajo coste de inferencia.
- Educación y prototipado: sirve como modelo de demostración para experimentar con formatos de prompt, cuantización GGUF y despliegue local con llama.cpp sin incurrir en costes de API.
- Generación de documentación de funciones: a partir de una firma de función Python, el modelo puede producir una descripción textual en inglés que sirva como base para docstrings.
- Experimentación académica sobre modelos pequeños: su licencia Apache-2.0 y su tamaño permiten usarlo como línea base en estudios sobre eficiencia, cuantización o especialización en lenguajes de programación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en f32, 700 MB en f16 y 372 MB en q8_0 (tamaño de los archivos GGUF; el consumo real añade overhead del runtime y de la caché KV).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre; no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: llama.cpp (formato nativo, conversión validada con build b6800), Ollama y otros runtimes compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera una latencia muy baja en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ophyx 350M v3 GGUF | 349,2 M | no disponible | Apache-2.0 | GGUF | Especializado en Python, sin benchmarks publicados |
| Qwen2.5-Coder-0.5B | 0,5 B | 32.768 tokens (según documentación pública del modelo) | Apache-2.0 | safetensors, GGUF | Modelo de código multilingüe con benchmarks publicados |
| SmolLM2-360M | 360 M | 8.192 tokens (según documentación pública del modelo) | Apache-2.0 | safetensors, GGUF | Modelo generalista pequeño, no especializado en código |
| StarCoder2-3B | 3 B | 16.384 tokens (según documentación pública del modelo) | BigCode OpenRAIL-M | safetensors, GGUF | Especializado en código, mayor tamaño y requisitos |

La comparación con Qwen2.5-Coder-0.5B, SmolLM2-360M y StarCoder2-3B se ofrece como referencia de categoría; los datos de esos modelos provienen de su documentación pública y no de la información proporcionada para Ophyx. No hay benchmarks de Ophyx que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse desde cero sin información sobre la composición del dataset, no puede descartarse la presencia de sesgos en el código generado.
- Riesgo de alucinación: elevado en un modelo de 350 M parámetros; puede generar APIs inexistentes, firmas incorrectas o código sintácticamente válido pero semánticamente erróneo.
- Limitaciones de contexto e idioma: solo se declara inglés como idioma y no se especifica la longitud de contexto, lo que impide planificar conversaciones largas o archivos extensos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información disponible.
- Caveats para producción: el modelo tiene cero descargas y cero likes, sin benchmarks ni documentación de entrenamiento; no se recomienda su uso en producción sin una evaluación propia exhaustiva. La cuantización q8_0 presenta una divergencia de log-probabilidad de 0,166 frente al original, mayor que f16 y f32, lo que puede afectar a la fidelidad de las salidas.
- El tokenizador no añade token BOS; enviar el prompt con un BOS adicional puede degradar la calidad de la generación.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/abhash-chakraborty/ophyx-350m-v3-gguf
- Modelo base en HuggingFace: https://huggingface.co/abhash-chakraborty/ophyx-350m-v3
- Logo del modelo: https://huggingface.co/abhash-chakraborty/ophyx-350m-v3/resolve/main/logo.png
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
