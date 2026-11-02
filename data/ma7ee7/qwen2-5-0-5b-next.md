# Ma7ee7/Qwen2.5-0.5b-Next

## Resumen

Qwen2.5-0.5b-Next es un experimento de la comunidad publicado por el usuario Ma7ee7 sobre Qwen/Qwen2.5-0.5B-Instruct. Se trata de un fine-tuning que sustituye parte de las capas de atención del transformer original por un esquema híbrido: 12 capas con GQA estándar y 12 capas con atención local más memoria comprimida. El objetivo es reducir el coste del KV cache en contextos largos manteniendo la calidad de las respuestas conversacionales.

El modelo no es un lanzamiento oficial de Qwen. Es una prueba independiente que recupera el comportamiento conversacional tras la modificación arquitectónica mediante 200 pasos de entrenamiento de chat sobre el dataset HuggingFaceH4/no_robots. Con 494.032.768 parámetros reales (según safetensors) y licencia Apache 2.0, se posiciona como una alternativa de investigación para quienes quieran experimentar con mecanismos de compresión de memoria en modelos pequeños.

Su relevancia actual es acotada: sirve como banco de pruebas reproducible para técnicas de atención híbrida y KV cache comprimido en un modelo de 0,5B, un tamaño que permite iterar en hardware de consumo. No obstante, su naturaleza experimental, el idioma declarado (solo inglés) y la ausencia de benchmarks publicados limitan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 híbrido: 12 capas GQA + 12 capas de atención local con memoria comprimida |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens por defecto; hasta 8.192 en pruebas experimentales |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only con GQA, y modifica su pila de atención: 12 capas conservan la atención GQA original y 12 capas emplean atención local combinada con un mecanismo de memoria comprimida. En la práctica, las capas híbridas mantienen exactos los 128 tokens más recientes y agrupan los tokens anteriores en bloques de 16, promediándolos dentro de un KV cache comprimido real. Esto reduce el crecimiento lineal del cache con la longitud de contexto, a costa de perder resolución en el pasado lejano.

El ajuste se realizó con 200 pasos de entrenamiento de chat sobre HuggingFaceH4/no_robots, un dataset de instrucciones y conversaciones de alta calidad. El contexto de recuperación fue de 2.048 tokens; el autor menciona pruebas personalizadas con contextos de hasta 8.192 tokens, sin que se detallen resultados. No se documentan fases de RLHF o DPO adicionales, ni el número total de tokens vistos durante el fine-tuning. La innovación principal es el loader incluido (`inference.py`), necesario para activar la atención híbrida; sin él, el modelo no funciona con un `AutoModelForCausalLM` estándar.

## Capacidades

- Generación de texto conversacional multi-turno, con historial persistente entre llamadas y reinicio mediante `chat.reset()`.
- Razonamiento básico y respuesta a instrucciones heredadas de Qwen2.5-0.5B-Instruct.
- Generación de código y matemáticas a nivel de modelo de 0,5B (sin datos de benchmark que lo cuantifiquen).
- Soporte de tool calling / function calling: no disponible de forma explícita en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repo.
- Modo thinking, visión o audio: no disponible.
- Gestión de contexto largo mediante KV cache comprimido, con ventana exacta de 128 tokens recientes.

## Casos de uso

- Investigación sobre KV cache comprimido: el modelo permite medir empíricamente la pérdida de calidad al promediar tokens antiguos en bloques de 16, comparándolo con el Qwen2.5-0.5B-Instruct original en tareas de recuperación de información a distintas distancias.
- Prototipado de chatbots en hardware de consumo: con menos de 500M de parámetros y pesos safetensors de ~1 GB, cabe en GPUs de gama baja y permite iterar rápidamente en flujos conversacionales con historial persistente.
- Pruebas de atención híbrida en pipelines de formación: útil como caso de estudio para validar loaders personalizados y comparar el rendimiento de capas locales frente a GQA completas en un transformer pequeño.
- Evaluación de degradación por compresión: escenario controlado para estudiar cómo afecta la compresión del pasado a tareas de question answering con contexto de 2.048 tokens.
- Desarrollo de demos educativas: su tamaño reducido y su API de chat sencilla (`load` + llamada) lo hacen adecuado para talleres y tutoriales sobre fine-tuning y modificación arquitectónica.
- Benchmarking de técnicas de recuperación tras fine-tuning: los 200 pasos sobre No Robots permiten analizar cuánto entrenamiento es necesario para restaurar la coherencia conversacional después de alterar la atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en safetensors (fp16/bf16): en torno a 1 GB de pesos más overhead de activaciones y KV cache; aproximadamente 2-3 GB en total para contexto de 2.048 tokens.
- VRAM estimada con cuantización a 8 bits: ~0,5-1 GB de pesos; a 4 bits: ~0,3-0,5 GB (no se publican pesos cuantizados, habría que generarlos).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque el modelo no aprovecha el hardware de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia lenta.
- Opciones de despliegue: el autor solo proporciona un loader propio (`inference.py`) con `transformers>=4.51,<6`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; la atención híbrida requeriría soporte específico en esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ma7ee7/Qwen2.5-0.5b-Next | 494M | 2.048 (hasta 8.192 experimental) | Apache 2.0 | HuggingFace, loader propio | Atención híbrida con KV cache comprimido; solo inglés |
| Qwen/Qwen2.5-0.5B-Instruct | ~494M | 32.768 | Apache 2.0 | HuggingFace, transformers estándar | Modelo base oficial, multilingüe, soporte amplio en motores |
| Qwen/Qwen2.5-1.5B-Instruct | ~1.500M | 32.768 | Apache 2.0 | HuggingFace, transformers estándar | Mayor capacidad, más VRAM, oficial |
| HuggingFaceTB/SmolLM2-360M-Instruct | ~360M | 8.192 | Apache 2.0 | HuggingFace, transformers estándar | Alternativa pequeña oficial, sin modificaciones arquitectónicas |

## Limitaciones y advertencias

- Modelo experimental de la comunidad, no oficial de Qwen; el autor lo califica explícitamente como "independent community experiment".
- Requiere un loader propio (`inference.py`) para activar la atención híbrida; no funciona con `AutoModelForCausalLM` estándar ni con motores de inferencia convencionales.
- Contexto por defecto de solo 2.048 tokens, muy inferior al 32.768 del Qwen2.5-0.5B-Instruct original.
- La compresión de tokens antiguos en bloques de 16 puede degradar la recuperación de información lejana y aumentar el riesgo de alucinación en contextos largos.
- Idiomas: solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Entrenamiento de recuperación muy corto (200 pasos sobre No Robots), lo que puede dejar sesgos y lagunas del dataset base.
- Sin benchmarks publicados ni métricas de calidad; no hay evidencia cuantitativa de su rendimiento frente al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación y el soporte limitado desaconsejan su uso en producción sin evaluación previa.
- Riesgo de sesgos heredados de Qwen2.5-0.5B-Instruct y del dataset No Robots, no documentados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ma7ee7/Qwen2.5-0.5b-Next
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
