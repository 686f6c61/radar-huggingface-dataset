# ScarletKc/Typeling-25M-GGUF

## Resumen

Typeling-25M-GGUF es la versión cuantizada en formato GGUF del modelo Typeling-25M, un modelo de lenguaje base en inglés de 25,37 millones de parámetros desarrollado por ScarletKc y orientado específicamente a la predicción de texto durante la escritura: autocompletado de palabras y predicción de la siguiente palabra para interfaces de "ghost text" y barras de sugerencias en teclados y aplicaciones de chat. No es un modelo conversacional ni de instrucciones, sino un modelo base que predice tokens.

La relevancia de esta publicación está en su formato: un único archivo GGUF de 27,6 MB cuantizado a Q8_0 que puede ejecutarse con llama.cpp en hardware muy modesto, incluidos dispositivos móviles y sistemas embebidos. El autor documenta la pérdida de calidad de la cuantización con métricas concretas (perplejidad +0,08 %, divergencia KL media 0,0009 y coincidencia del token superior en el 97,9 % de los casos frente a los pesos de 16 bits).

El modelo deriva de SupraLabs/Supra2-Medium-Base y se distribuye bajo licencia Apache 2.0. Su propósito es servir como motor de predicción de bajo coste computacional dentro de la infraestructura Typeling, que incluye un decodificador a nivel de palabra implementado en PyTorch sobre los pesos de 16 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base derivado de SupraLabs/Supra2-Medium-Base); detalles internos de capas y dimensiones no disponibles |
| Parametros totales | 25.371.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado); el autor indica que no hay Q4 y que puede generarse desde los pesos de 16 bits con `convert_hf_to_gguf.py` y `llama-quantize` |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales de 16 bits en safetensors en el repositorio base |

## Arquitectura y entrenamiento

La información disponible confirma que Typeling-25M es un transformer de 25,37 millones de parámetros con arquitectura heredada de SupraLabs/Supra2-Medium-Base, pero no detalla el número de capas, dimensiones ocultas, cabezas de atención ni la composición exacta del dataset de entrenamiento. El modelo es un modelo base entrenado en inglés para predicción de siguiente token, sin ajuste por instrucciones ni RLHF/DPO documentado en la información proporcionada.

Un detalle técnico relevante es el tokenizador: usa la regex byte-level de GPT-2 como pre-tokenizador, con un espacio inicial antepuesto a cada texto, y separa documentos con `</s>` (token 2). El conversor de llama.cpp no reconoce ese pre-tokenizador, por lo que la exportación lo mapea a `gpt-2`. La conversión se realizó con llama.cpp b11953 mediante `convert_hf_to_gguf.py --outtype q8_0` y el script `lm/export.py` del repositorio Typeling. El autor señala que las predicciones son mejores cuando el texto termina justo después de una palabra: solo el 1 % de las palabras de entrenamiento aparecieron tras un espacio final.

## Capacidades

- Predicción del resto de la palabra en curso de escritura (autocompletado intra-palabra).
- Predicción de la siguiente palabra para ghost text y barras de candidatos.
- Generación de texto libre a nivel de token en inglés, sin modo conversacional.
- Reparación de erratas y sugerencias a nivel de palabra, pero solo a través del decodificador Typeling (`typeling/lm.py`), no directamente desde el GGUF.
- Ejecución local con llama.cpp (`llama-completion`) con temperatura 0 para predicción determinista.
- Compatible con endpoints (tag `endpoints_compatible` en Hugging Face).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito según la información disponible.
- Multilingüismo limitado al inglés.

## Casos de uso

- Autocompletado en teclados móviles: el modelo predice el resto de la palabra y la siguiente palabra con un archivo de 27,6 MB que cabe en memoria de un teléfono, permitiendo sugerencias en tiempo real sin conexión a red.
- Ghost text en editores de texto y aplicaciones de chat: integrado vía llama.cpp con `--temp 0`, genera la continuación tras el texto escrito, adecuado para escritura cotidiana en inglés.
- Barras de candidatos de siguiente palabra: alimentar la interfaz con las predicciones de token del GGUF y aplicar el decodificador Typeling para agregarlas a nivel de palabra.
- Corrección ortográfica asistida: usando el decodificador de referencia sobre los pesos de 16 bits, el modelo puede proponer reparaciones de erratas en función del contexto previo.
- Prototipado e investigación en interfaces de escritura predictiva: el tamaño reducido y la licencia Apache 2.0 permiten experimentar con decodificación, cuantización y latencia sin coste de infraestructura.
- Despliegue en sistemas embebidos y dispositivos de bajos recursos: al ser un GGUF Q8_0 de 27,6 MB, puede ejecutarse en Raspberry Pi, navegadores con WASM o entornos sin GPU.
- Servicio de inferencia local en aplicaciones de escritorio: integración mediante llama.cpp para sugerencias de texto sin enviar datos del usuario a servidores externos.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad de la cuantización Q8_0 frente a los pesos de 16 bits, medidas con `llama-perplexity --kl-divergence` sobre 380 000 caracteres de texto de chat y web no vistos (190 fragmentos de 512 tokens):

| Metrica | Valor |
|---|---|
| Perplejidad frente a 16 bits | +0,08 % |
| Divergencia KL media | 0,0009 |
| Coincidencia del token superior | 97,9 % de los casos |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB con el archivo Q8_0 de 27,6 MB, incluyendo overhead de llama.cpp; no requiere GPU.
- GPU recomendadas: ninguna en particular; funciona en CPU. Cualquier GPU consumer (incluso integradas) puede ejecutarlo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos cientos de MB de memoria libre; también en CPU y dispositivos móviles.
- Opciones de despliegue: llama.cpp (`llama-completion`), y por extensión entornos compatibles con GGUF como Ollama o llama-cpp-python; el decodificador de referencia requiere PyTorch con los pesos de 16 bits (`pip install "typeling[lm]"`).
- Latencia y throughput estimados: no disponibles en la información proporcionada; el tamaño del modelo sugiere latencias de milisegundos en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Typeling-25M-GGUF | 25,37 M | no disponible | Ingles | Apache 2.0 | GGUF | Especializado en predicción de escritura; Q8_0 de 27,6 MB |
| Modelos de autocompletado tipo GPT-2 small | ~124 M | 1024 tokens (tipico) | Ingles | MIT (segun variante) | safetensors, GGUF | Mayor tamaño y coste; no especializado en ghost text |
| Modelos de teclado neuronal comerciales (p. ej. Gboard) | no disponible | no disponible | Multiples | Propietaria | no disponible | No distribuibles ni auditables |

La comparación con alternativas concretas de la misma categoría (modelos de predicción de escritura de ~25 M de parámetros) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no mantiene conversaciones ni sigue instrucciones.
- Solo inglés; no se documenta soporte de otros idiomas.
- Predice tokens, no palabras: las sugerencias a nivel de palabra, la reparación de erratas y los benchmarks del modelo principal requieren el decodificador Typeling con los pesos de 16 bits en PyTorch.
- Requiere un formato de entrada específico: comenzar el prompt con `</s>`, escribir el espacio inicial manualmente (`" Hello"`, no `"Hello"`) y evitar terminar en espacio, ya que solo el 1 % de las palabras de entrenamiento aparecieron en esa posición.
- Riesgo de alucinación y continuaciones incoherentes inherente a un modelo base de 25 M de parámetros; no apto para generación de contenido factual sin verificación.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al entrenarse con texto de chat y web en inglés, puede reproducir sesgos de esas fuentes.
- La cuantización Q8_0 introduce una degradación pequeña pero medible (97,9 % de coincidencia en el token superior); no hay archivo Q4 publicado y el autor desaconseja cuantizaciones de 4 bits a este tamaño.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a la model card principal y al archivo `NOTICE` para las atribuciones de los datos de entrenamiento, que conviene revisar antes de un despliegue en producción.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta: ecosistema y validación comunitaria muy limitados.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/ScarletKc/Typeling-25M-GGUF
- Modelo base en Hugging Face: https://huggingface.co/ScarletKc/Typeling-25M
- Modelo original de partida: https://huggingface.co/SupraLabs/Supra2-Medium-Base
- Repositorio Typeling en GitHub: https://github.com/scarletkc/typeling
- Decodificador de referencia: https://github.com/scarletkc/typeling/blob/master/typeling/lm.py
- Script de exportación: https://github.com/scarletkc/typeling/blob/master/lm/export.py
- llama.cpp: https://github.com/ggml-org/llama.cpp
