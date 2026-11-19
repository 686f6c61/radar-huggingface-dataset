# loom-draft/bartowski-Qwen2-7B-Instruct-loom

## Resumen

Este repositorio no contiene un modelo entrenado por `loom-draft`, sino un paquete de despliegue en formato Loom (`.loom` y `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/Qwen2-7B-Instruct-GGUF`, en su cuantización `Q4_K_M`. El modelo subyacente es Qwen2-7B-Instruct, un transformer denso de 7 mil millones de parámetros desarrollado por Alibaba Qwen, ajustado para seguir instrucciones y conversar. El paquete está orientado específicamente a dos aceleradores AMD: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia de esta publicación es de infraestructura más que de modelado: demuestra el pipeline `loom-next`, que compila programas de kernel específicos para la arquitectura AMD objetivo a partir de un GGUF existente, sin intervención de un LLM en el bucle de generación. Expone un servidor compatible con la API de OpenAI (`/v1/chat/completions`) mediante `loom-serve`, con un contexto declarado de 32.768 tokens por petición y 4 peticiones concurrentes.

No se han publicado mediciones de rendimiento ni evidencias de corrección para este paquete concreto: todas las tablas de performance y de gates de correctitud figuran como "not yet re-measured". El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), empaquetado como paquete Loom con kernels generados para AMD gfx1151/gfx1201 |
| Parámetros totales | 7B (modelo base Qwen2-7B-Instruct) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por petición (según la model card) |
| Tipos de cuantización | Q4_K_M (GGUF); el paquete distribuye pesos en formato Loom (`weights.loom`) derivados de ese GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen (`Qwen2-7B-Instruct-Q4_K_M.gguf`); empaquetado en `program/*.loom`, `weights.loom`, `model.json`, `tokenizer.json`, `llm_config.json`, `info.json` |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen2-7B-Instruct, es un transformer denso decoder-only de la familia Qwen2, ajustado con instrucciones sobre la base preentrenada. Esta ficha no dispone de datos sobre el número de tokens de preentrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original, por lo que esos detalles se marcan como no disponibles.

La innovación técnica de este repositorio no reside en el modelo, sino en el empaquetado: `loom-next` genera programas `.loom` (kernels) específicos para el hardware AMD objetivo a partir de la configuración del GGUF (`llm_config.json`), y `loom-serve` los ejecuta con un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y carga de pesos en modo `preload`. El paquete incluye un `model.json.lock` con los hashes SHA-256 de los ficheros de origen, verificados por `loom-fetch`. La model card declara gates de correctitud (comparación token a token contra llama.cpp, consistencia bajo concurrencia, pruebas de kernels, muestreo y logits), pero ninguno tiene medición registrada para este paquete.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas de Qwen2-7B-Instruct.
- Servidor HTTP con API estilo OpenAI: endpoint `/v1/chat/completions`.
- Contexto de 32.768 tokens por petición y hasta 4 peticiones concurrentes.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Tool calling: no aplicable según la model card.
- Razonamiento / thinking mode: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada de imagen o audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la model card.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de un asistente conversacional sobre hardware AMD de escritorio o workstation: `loom-serve` expone un endpoint compatible con OpenAI, de modo que clientes existentes pueden apuntar a `http://127.0.0.1:8080/v1/chat/completions` sin cambios en el código de aplicación.
- Procesamiento de documentos largos en local: con 32.768 tokens de contexto por petición, el modelo puede resumir o extraer información de contratos, informes o transcripciones que no caben en ventanas de 4K-8K, manteniendo los datos en la máquina.
- Evaluación de la cadena de herramientas Loom: el paquete sirve como banco de pruebas para validar `loom-next` y `loom-serve` en Strix Halo y R9700 antes de adoptarlos en producción, comparando la salida contra la referencia de llama.cpp recogida en los gates.
- Generación de código asistida en entornos con GPU AMD: Qwen2-7B-Instruct tiene competencia razonable en código; el paquete permite integrarlo en editores o pipelines locales sin depender de servicios en la nube, aunque sin tool calling nativo.
- Prototipado de aplicaciones RAG ligeras: combinado con un índice vectorial externo, el contexto de 32K permite inyectar varios fragmentos recuperados por consulta y generar respuestas citadas en un solo paso.
- Inferencia por lotes en una workstation con R9700 de 32 GB: la concurrencia de 4 peticiones y el pool de memoria fijo facilitan ejecutar tareas de clasificación, resumen o extracción sobre colas de documentos con latencia predecible.
- Base para ajuste fino posterior: al ser Apache 2.0 y derivar de un GGUF estándar, el checkpoint original puede reutilizarse para fine-tuning con otras herramientas y reempaquetarse después con Loom.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todos los gates de correctitud figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un Q4_K_M de 7B ocupa del orden de 4,5-5 GB de pesos, pero el paquete Loom reserva un pool de memoria fijo cuyo tamaño no se detalla en la información proporcionada.
- GPU soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPUs de consumo; el paquete está dirigido a los dos aceleradores AMD citados.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir el modelo. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Flags relevantes de `loom-serve`: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `--pool_backing=fixed` (pool comprometido por adelantado) y `--parameter_mode=preload` (carga de pesos en host).
- Latencia y throughput: no disponibles; las tablas comparativas contra llama.cpp están pendientes de medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Qwen2-7B-Instruct (este paquete Loom) | 7B denso | 32.768 tokens | Apache 2.0 | Paquete Loom para AMD gfx1151/gfx1201 | Sin benchmarks publicados; gates pendientes |
| Qwen2-7B-Instruct GGUF (bartowski) | 7B denso | 32.768 tokens | Apache 2.0 | GGUF, ejecutable con llama.cpp | Checkpoint de origen de este paquete |
| Mistral-7B-Instruct | 7B denso | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar; datos de rendimiento no verificados en esta ficha |
| Llama 3.1 8B Instruct | 8B denso | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Contexto mayor; licencia con restricciones de uso comercial a gran escala |

No se dispone de datos de benchmarks comparativos en la información proporcionada para respaldar diferencias de rendimiento entre estas opciones.

## Limitaciones y advertencias

- Ausencia total de evidencia de correctitud: todos los gates (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`, `logits`, etc.) figuran como no medidos, por lo que no hay garantía publicada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no se puede estimar latencia ni throughput frente a llama.cpp en ninguno de los dos aceleradores objetivo.
- Soporte de hardware restringido a Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documenta compatibilidad con otras GPUs AMD ni con NVIDIA.
- Sin tool calling, sin modo de razonamiento, sin decodificación especulativa y sin entrada multimodal: no es adecuado para pipelines de agentes que dependan de function calling.
- Estado del muestreo "no determinado": el comportamiento de temperature, top_k y seed no está verificado, lo que afecta a la reproducibilidad.
- Sin información sobre idiomas soportados ni sobre sesgos del modelo base; como todo modelo de 7B, presenta riesgo de alucinación en tareas factuales y de código fuera de distribución.
- Licencia Apache 2.0 en el paquete y en el modelo base, lo que permite uso comercial; conviene verificar igualmente los términos del checkpoint original de Qwen2-7B-Instruct.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de mantenimiento continuado.
- Los resultados de búsqueda web devueltos corresponden a servicios y marcas homónimas ("Loom" como grabador de pantalla y como marca de ropa) y no guardan relación con este paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Qwen2-7B-Instruct-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/Qwen2-7B-Instruct-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Referencia a ROCm/hrx-system citada en la model card: https://github.com/ROCm/hrx-system
