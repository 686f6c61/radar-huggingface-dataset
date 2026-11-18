# andreped/vela3.1-onnx

## Resumen

Vela 3.1 ONNX es una exportación no oficial a formato ONNX de la ruta de decisión de los modelos Vela 3.1, desarrollados por vLLM Semantic Router en colaboración con KR Labs. El paquete, publicado por el usuario andreped, incluye dos variantes (pico-150m y pico-380m) empaquetadas para su ejecución en el navegador mediante onnxruntime-web, tanto con el backend WASM como con WebGPU. No se trata de un modelo generativo al uso, sino de un modelo de decisión ("system-one") orientado a clasificación zero-shot: recibe un estado y un conjunto de preguntas u opciones, y devuelve probabilidades por opción tras un único forward pass.

La relevancia de esta ficha radica en su enfoque de despliegue: permite incorporar capacidades de decisión semántica directamente en el cliente, sin backend, con pesos cuantizados de entre 210 MB y 760 MB según variante y precisión. La licencia Apache-2.0 y el soporte declarado de 15 idiomas lo hacen atractivo para asistentes web, enrutadores ligeros y sistemas de clasificación en el borde.

El modelo base es de tipo encoder con cabezas de lectura de decisión, con 150 M y 380 M parámetros respectivamente. No se dispone de información sobre la longitud de contexto máxima ni sobre los datos de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer con cabezas de decisión (readout heads); exportación ONNX |
| Parametros totales | 150 M (pico-150m) / 380 M (pico-380m) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (~210 MB / ~610 MB) y fp16 (~305 MB / ~760 MB) |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl, hu, ru, ar, hi, ja, ko, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_quantized.onnx`, `model_fp16.onnx`) |

## Arquitectura y entrenamiento

La exportación corresponde a la ruta de decisión de los modelos Vela 3.1, que según la model card se compone de un encoder más cabezas de lectura de decisión. Cada exportación ONNX empaqueta ambos componentes, de modo que la inferencia consiste en renderizar la consulta, tokenizarla, ejecutar un único forward por pregunta y aplicar softmax sobre los logits resultantes. La interfaz de entrada es explícita: `input_ids` [1, T] int64, `opt_pos` [K] int64 con las posiciones de los marcadores `[O]` y `pool` [2] int64 con el inicio y fin del span de estado; la salida es `logits` [K].

El renderizado (`render31`) sigue la plantilla `[BOS] [Q] instructions ([O] name[: description])* [SEP_SCHEMA] [SEG_user] state [EOS]`, donde una pregunta de sí/no se representa como la elección `{no, yes}`. Las cadenas se usan tal cual y cualquier otro valor se serializa como JSON compacto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que la conversión es no oficial y que el mérito de los modelos corresponde a los autores originales.

## Capacidades

- Clasificación zero-shot: selección entre un conjunto de opciones etiquetadas, con o sin descripción.
- Decisiones binarias de tipo sí/no, modeladas como una elección entre `{no, yes}`.
- Decisión basada en estado: el modelo recibe un estado (texto o JSON compacto) y un conjunto de preguntas, y devuelve probabilidades por opción.
- Multilingüe: 15 idiomas declarados (en, de, fr, es, it, pt, nl, pl, hu, ru, ar, hi, ja, ko, zh).
- Ejecución en navegador: compatible con onnxruntime-web en WASM (int8) y WebGPU (fp16).
- No se documentan capacidades de generación de texto libre, tool calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Enrutamiento semántico en el cliente: dado un estado de conversación y un conjunto de intenciones, el modelo devuelve la probabilidad de cada una y permite seleccionar la ruta sin llamar a un backend.
- Asistentes web sin servidor: con el export int8 de 210 MB, la decisión se ejecuta en WASM dentro del navegador, lo que reduce la latencia de red y evita enviar el estado a un servidor.
- Clasificación de consultas de soporte: mapear un mensaje de usuario a una categoría (facturación, cuenta, técnico) mediante preguntas de elección con descripciones.
- Filtros de contenido y guardarraíles: preguntas binarias del tipo "¿es esta solicitud sensible?" o "¿requiere revisión humana?" evaluadas localmente.
- Desambiguación en formularios y wizards: decidir el siguiente paso de un flujo guiado a partir del estado acumulado del usuario.
- Preclasificación en pipelines RAG: decidir si una consulta necesita recuperación, qué índice consultar o si basta con una respuesta directa, antes de invocar un modelo mayor.
- Experimentación en el borde: prototipos de decisión en WebGPU con el export fp16 (305 MB / 760 MB), útil para demos y evaluación de latencia en dispositivos de usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta datos de paridad entre el port en JavaScript y el paquete PyTorch: identificadores de token idénticos, probabilidades idénticas en fp32, y una diferencia máxima absoluta de probabilidad de aproximadamente 0,11 (pico-150m) y 0,06 (pico-380m) en int8, manteniendo las mismas elecciones.

## Requisitos de hardware

- VRAM estimada: el export int8 ocupa ~210 MB (pico-150m) y ~610 MB (pico-380m); el export fp16, ~305 MB y ~760 MB respectivamente. El consumo en ejecución es del mismo orden, al no requerir caché KV de contexto largo documentada.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el export fp16; para el export int8 basta CPU o WASM.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU, dado el tamaño reducido de los pesos.
- Opciones de despliegue: onnxruntime-web (WASM y WebGPU) es el destino declarado; también puede ejecutarse con onnxruntime en CPU o GPU fuera del navegador.
- Latencia y throughput: no disponibles. La model card no publica mediciones de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vela 3.1 ONNX (pico-150m / pico-380m) | 150 M / 380 M | no disponible | Clasificación zero-shot y decisión | Apache-2.0 | ONNX en HF |
| Modelos de clasificación zero-shot tipo NLI (p. ej. DeBERTa NLI) | ~100-400 M | típicamente 512 tokens | Clasificación zero-shot NLI | variable | safetensors en HF |
| Enrutadores semánticos basados en embeddings + similitud | variable | variable | Enrutamiento de intenciones | variable | variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Conversión no oficial: el paquete lo publica un tercero (andreped) y no los autores originales de Vela 3.1; los fallos de exportación no deben atribuirse a vLLM Semantic Router ni a KR Labs.
- El export fp16 "currently flips decisions" en el Execution Provider WebGPU de onnxruntime-web según la propia model card; para WebGPU debe validarse el comportamiento antes de producción.
- La cuantización int8 introduce una diferencia máxima de probabilidad de hasta ~0,11 en pico-150m, lo que puede cambiar decisiones en casos límite.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso.
- No se documentan sesgos conocidos, pero al ser un modelo de decisión multilingüe sin datos de entrenamiento publicados, el rendimiento por idioma es incierto.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente en las probabilidades devueltas.
- La longitud de contexto no está documentada; el renderizado incluye el estado completo, por lo que estados largos pueden exceder la ventana real del encoder.
- Licencia Apache-2.0 permisiva para uso comercial, heredada de los modelos fuente, pero sin garantías por parte del conversor.

## Enlaces

- Hugging Face: https://huggingface.co/andreped/vela3.1-onnx
- Modelo base pico-150m: https://huggingface.co/vllm-sr/vela3.1-pico-150m
- Modelo base pico-380m: https://huggingface.co/vllm-sr/vela3.1-pico-380m
- Colección Vela 3.0: https://huggingface.co/collections/vllm-sr/vela-30
- Repositorio con loader JS y script de exportación: https://github.com/andreped/AndreOS
- Documentación de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
