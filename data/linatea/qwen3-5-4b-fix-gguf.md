# LinaTea/Qwen3.5-4B-Fix-GGUF

## Resumen

Qwen3.5-4B-Fix-GGUF es una colección de cuantizaciones GGUF del modelo denso LinaTea/Qwen3.5-4B-Fix, un ajuste fino supervisado (SFT) sobre la familia Qwen3.5 de 4B parámetros con capacidades multimodales (image-text-to-text). El autor, LinaTea, publica estos binarios para su uso directo con llama.cpp y servidores compatibles con la API de OpenAI. La particularidad declarada del modelo es que coloca la respuesta final después del token `</think>`, separando el contenido de razonamiento (`reasoning_content`) de la respuesta (`content`).

El modelo cuenta con 4.205.751.296 parámetros totales (aproximadamente 4,2B) en arquitectura densa, no MoE. La model card aclara explícitamente que los ficheros MoE anteriores (6,93B con 2 expertos) han sido reemplazados por esta versión densa. El contexto nativo anunciado es de 262.144 tokens, con recomendaciones de despliegue a 65.536, 131.072 o 262.144 tokens según la VRAM disponible.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 4B con visión y contexto largo en hardware consumer, con cuantizaciones Q4_0 (2,4 GB) y Q8_0 (4,2 GB), además de un proyector visual independiente (mmproj) en F16 o Q8_0. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), multimodal image-text-to-text |
| Parámetros totales | 4.205.751.296 (≈4,2B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | Q4_0, Q8_0, F16; proyectores visuales mmproj en F16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con mmproj separado para visión) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 4,2B parámetros, derivado de la base Qwen3.5-4B y sometido a un ajuste fino supervisado (SFT) por LinaTea. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; únicamente se indica que se trata de un SFT. La variante "Fix" del nombre hace referencia a la corrección del formato de salida: la respuesta final se emite después de `</think>`, de modo que el servidor puede separar el razonamiento del contenido final.

La componente multimodal se implementa mediante un proyector visual (mmproj) distribuido como fichero GGUF independiente, en F16 (672 MB) o Q8_0 (347 MB). Los binarios se generaron con llama.cpp b10777 (build Prism) a partir del checkpoint F16 fusionado, usando la opción `--no-nextn`. El autor indica que no se ofrecen FP8 ni MXFP4 denso porque la build de llama.cpp disponible no soporta esos cuantizadores para esta arquitectura densa; el conjunto soportado es Q4_0, Q8_0 y F16.

## Capacidades

- Generación de texto conversacional multi-turno con formato chat (Jinja).
- Razonamiento explícito en modo thinking, con separación entre `reasoning_content` y `content` en la API compatible con OpenAI.
- Comprensión de imágenes (image-text-to-text) mediante el proyector mmproj: descripción, respuesta a preguntas visuales y conversación sobre imágenes.
- Contexto largo de hasta 262.144 tokens nativos, útil para documentos extensos o historiales de conversación prolongados.
- Soporte de endpoint compatible con la API de OpenAI (`/v1`), lo que facilita la integración con clientes existentes.
- Caché de prompt (`--cache-prompt`) para prefijos repetidos, con reutilización de caché en RAM configurable.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local con visión: desplegado con `llama-server` y `--mmproj`, el modelo puede responder preguntas sobre capturas de pantalla, fotografías o diagramas enviados por la API, manteniendo el historial de conversación en el contexto.
- Análisis de documentos largos: con contexto de hasta 262.144 tokens, puede procesar contratos, informes o expedientes completos en una sola pasada, siempre que la VRAM permita configurar `-c 131072` o `-c 262144`.
- Chat de soporte técnico con razonamiento visible: la separación entre `reasoning_content` y `content` permite mostrar al operador el razonamiento intermedio y la respuesta final de forma diferenciada, útil para auditoría y depuración.
- Prototipado rápido en estaciones de trabajo consumer: la cuantización Q4_0 (2,4 GB) permite ejecutar el modelo en GPUs de gama media o incluso en CPU, reduciendo la barrera de entrada para pruebas de concepto.
- Asistente de accesibilidad visual: descripción de imágenes y lectura de contenido visual para usuarios con discapacidad visual, integrado en aplicaciones de escritorio mediante la API local.
- Evaluación de pipelines multimodales: al ser un modelo pequeño con licencia Apache-2.0, sirve como banco de pruebas para comparar estrategias de prompting, cuantización y caché de prompt antes de escalar a modelos mayores.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local mediante llama.cpp, los datos de imagen y texto no salen de la infraestructura del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar caché KV): Q4_0 ≈2,4 GB; Q8_0 ≈4,2 GB; F16 ≈8,4 GB. Añadir el proyector visual: mmproj F16 672 MB o mmproj Q8_0 347 MB.
- La caché KV crece con el contexto: el autor sugiere `-c 65536`, `-c 131072` o `-c 262144` según la VRAM disponible, lo que implica que contextos largos requieren GPUs con 16-24 GB o más.
- GPU recomendadas: para Q4_0 con contexto moderado, tarjetas consumer de 8 GB o más (RTX 3060/4060, RTX 4070); para Q8_0 o F16 con contexto largo, RTX 4090 (24 GB), A100 o H100.
- Cabe en GPU consumer: sí, en Q4_0 y Q8_0 con contextos moderados; F16 con contexto completo requiere 24 GB o más.
- Opciones de despliegue: llama.cpp (`llama-server`), con endpoint compatible con OpenAI en `http://127.0.0.1:8099/v1` y nombre de modelo `qwen3.5-4b-sft`. No se documentan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Parámetros de muestreo recomendados: `temperature=0.7`, `top_p=0.9`, `top_k=20`; también funciona la decodificación greedy.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-Fix-GGUF (este) | ≈4,2B denso | 262.144 | Sí (mmproj) | Apache-2.0 | GGUF |
| Qwen3.5-4B-Fix (base SFT) | ≈4,2B denso | 262.144 | Sí | Apache-2.0 | safetensors (no confirmado) |
| Variante MoE anterior (6,93B, 2 expertos) | 6,93B MoE | no disponible | Sí | Apache-2.0 | GGUF (reemplazada) |

No se dispone de datos de benchmarks ni de comparativas con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Modelo derivado de un SFT: no se documenta si hubo alineación adicional (RLHF/DPO), por lo que el riesgo de respuestas inadecuadas o alucinaciones no está mitigado de forma explícita.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponibles; conviene validar el comportamiento en castellano antes de usarlo en producción.
- Contexto máximo de 262.144 tokens, pero en la práctica limitado por la VRAM; configurar `-c` por encima de la capacidad de la GPU provocará fallos o degradación.
- El autor advierte que `--cache-reuse` puede deshabilitarse en contextos multimodales, lo que afecta al rendimiento con imágenes repetidas.
- No se ofrecen cuantizaciones FP8 ni MXFP4 denso por limitaciones de la build de llama.cpp utilizada; solo Q4_0, Q8_0 y F16.
- El modelo es un ajuste fino de un tercero (LinaTea) sobre la base Qwen3.5; la calidad y el soporte dependen del autor, no del equipo original de Qwen.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de la licencia de la base Qwen3.5 y de los datos de entrenamiento del SFT, no detalladas.
- El repositorio ocupa 46,3 GB por incluir múltiples cuantizaciones y proyectores; descargar solo los ficheros necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LinaTea/Qwen3.5-4B-Fix-GGUF
- Modelo base del GGUF: https://huggingface.co/LinaTea/Qwen3.5-4B-Fix
- llama.cpp (repositorio del motor de inferencia): https://github.com/ggml-org/llama.cpp
- Documentación de la API compatible con OpenAI en llama.cpp: https://github.com/ggml-org/llama.cpp/tree/master/examples/server
