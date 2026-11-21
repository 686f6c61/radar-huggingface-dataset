# Feyd89/Inkling-2-Mini-NVFP4-capy-flash

## Resumen

Inkling-2-Mini-NVFP4-capy-flash es un artefacto listo para servir del modelo Inkling 2 Mini de Thinking Machines, reempaquetado por el usuario Feyd89 para el motor de inferencia capy-flash (versión 0.16.0 o superior). No se trata de un modelo nuevo ni de una cuantización adicional: los pesos son los del checkpoint original, con los expertos enrutados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23), y el resto de pesos densos en BF16. El objetivo es permitir ejecutar el modelo completo en dos GPUs de 16 GB en paralelo tensorial, algo imposible con el checkpoint original en su formato de referencia.

El paquete incluye el borrador especulativo DSpark del propio checkpoint (componente `mtp`), lo que permite decodificación especulativa sin necesidad de un modelo drafter externo. Con el lanzador por defecto se sirven endpoints compatibles con OpenAI y Anthropic en el puerto 8080, con hasta 253.952 tokens de contexto y bloques de prefill de 2.048 tokens. El repositorio ocupa 19,7 GB y contiene un único archivo `.ninfer` de 19.693.882.100 bytes, junto con un informe de conversión y sumas de verificación SHA256.

La relevancia de esta ficha es doble: por un lado, documenta una receta concreta para desplegar un modelo de gran contexto en hardware de consumo (dos RTX 5070 Ti); por otro, advierte de que no se han publicado benchmarks de calidad para esta release, por lo que las cifras de rendimiento disponibles son exclusivamente de velocidad de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Inkling 2 Mini de Thinking Machines; el artefacto es un contenedor de pesos para capy-flash) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | 253.952 tokens (configuración del lanzador; reducible con `NINFER_MAX_CONTEXT`) |
| Tipos de cuantización | Expertos enrutados capas 0-19: NVFP4; capas 20-23: MXFP8; pesos densos (atención, gates, convoluciones, cabeza de salida, embedding de tokens) y drafter DSpark: BF16; activaciones y KV cache sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (sujeta a la Model Acceptable Use Policy de Thinking Machines) |
| Formato de pesos | `.ninfer` (archivo único de 19.693.882.100 bytes) |

## Arquitectura y entrenamiento

El artefacto no aporta información sobre la arquitectura interna del modelo base (número de capas, dimensión oculta, configuración de expertos, composición del dataset o proceso de alineación). Lo que sí se detalla es la estructura de empaquetado: los expertos enrutados de las capas 0 a 19 conservan los códigos y escalas E4M3 en NVFP4 tal como se publicaron, los de las capas 20 a 23 se copian literalmente en MXFP8, y los pesos densos junto con el drafter `mtp` se mantienen en BF16. La conversión no altera valores numéricos, solo el contenedor.

La innovación técnica destacable es la integración del drafter DSpark del propio checkpoint para decodificación especulativa con `--spec mtp --draft-tokens 3`. Según el autor, la salida con y sin drafter es idéntica a temperatura 0 y para la misma semilla con muestreo. Frente a la implementación de referencia con los pesos exactos, el token más probable coincide en el 98,1 % de las posiciones, una diferencia atribuida al redondeo BF16 entre distintos órdenes de suma. No se dispone de datos sobre tokens de entrenamiento, composición del corpus ni uso de RLHF o DPO.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`; el autor indica explícitamente que el modelo es solo texto y no procesa imágenes.
- Razonamiento y código: el autor reporta pruebas de decodificación en una tarea de programación (193,9 tokens/s con drafter), lo que confirma uso práctico en generación de código, aunque sin métricas de calidad.
- Contexto largo: soporta hasta 253.952 tokens configurados, con degradación medida del throughput a partir de 98.304 tokens.
- Decodificación especulativa integrada: el drafter `mtp` del checkpoint acelera la decodificación sin cambiar la distribución de salida.
- Compatibilidad de API: sirve endpoints compatibles con OpenAI y Anthropic a través de capy-flash.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Modo thinking, visión o audio: no disponible (solo texto).

## Casos de uso

- Despliegue en hardware de consumo: dos RTX 5070 Ti de 16 GB permiten servir el modelo completo en paralelo tensorial con 15,2 GiB de VRAM por tarjeta, lo que habilita prototipos y demos locales de un modelo de gran contexto sin infraestructura de centro de datos.
- Análisis de documentos extensos: con 253.952 tokens de contexto se pueden procesar contratos, informes o bases de código completas en una sola petición; el prefill medido de 2.522 tokens/s para 99.311 tokens de prompt hace viable este escenario en una sola GPU doble.
- Asistentes de programación con contexto de repositorio: la tarea de código medida a 193,9 tokens/s con drafter sugiere uso interactivo para autocompletado y generación de parches sobre fragmentos largos de código.
- Servicio local compatible con OpenAI/Anthropic: al exponer endpoints estándar en el puerto 8080, se puede conectar a clientes y frameworks existentes sin adaptadores propios, útil para entornos de desarrollo aislados.
- Evaluación comparativa de motores de inferencia: el paquete incluye el informe de conversión y permite reconstruir el archivo desde el checkpoint con `python3 -m tools.convert`, lo que facilita reproducir y auditar el pipeline.
- Procesamiento por lotes de una sola petición: el motor atiende una petición a la vez; encaja en flujos secuenciales de generación de resúmenes o extracción de información donde la latencia por petición importa más que el throughput agregado.
- Investigación sobre cuantización NVFP4/MXFP8: al conservar los pesos originales sin recuantizar, sirve como referencia para estudiar el impacto del empaquetado y del orden de sumas en la fidelidad de la salida (98,1 % de coincidencia en el token más probable).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que la calidad no se midió con benchmarks para esta release. Sí se publican mediciones de velocidad en un Ryzen 9 9900X con 2 x RTX 5070 Ti 16 GB, con los valores por defecto del lanzador y una sola petición:

| Métrica | Sin drafter | Con drafter |
|---|---|---|
| Decodificación, prompt de 68 tokens (tokens/s) | 127,5 | 149,0 |
| Decodificación a 12.800 tokens de contexto (tokens/s) | 112,8 | 166,6 |
| Decodificación, tarea de código (tokens/s) | 127,6 | 193,9 |
| Decodificación a 99.311 tokens de contexto (tokens/s) | 78,3 | 78,3 (pasos ordinarios más allá de 98.304 tokens) |

| Prefill (tokens de prompt) | Throughput (tokens/s) |
|---|---|
| 512 | 4.002 |
| 4.096 | 5.032 |
| 12.800 | 4.524 |
| 99.311 | 2.522 |

## Requisitos de hardware

- VRAM: 15,2 GiB por tarjeta con el drafter activo; 14,2 GiB con `NINFER_DRAFTER=0`. El contexto se puede reducir con `NINFER_MAX_CONTEXT` para bajar el consumo.
- GPUs: se requieren dos GPUs `sm_120` con 16 GB cada una; probado en dos RTX 5070 Ti. No se necesita peer-to-peer. No funciona en una sola tarjeta de 16 GB. Una tarjeta de 32 GB y las builds de Windows no están verificadas.
- Software: capy-flash v0.16.0 o superior, Linux x86_64, driver NVIDIA con soporte para CUDA 13.1.
- RAM y CPU: el autor indica que no hay requisitos especiales.
- Despliegue: lanzador `capy-serve-inkling2-mini.sh` con endpoints compatibles con OpenAI y Anthropic en el puerto 8080; prefill en bloques de 2.048 tokens. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato `.ninfer`.
- Throughput y latencia: ver tabla de benchmarks; la decodificación oscila entre 78,3 y 193,9 tokens/s según contexto y tarea, y el prefill entre 2.522 y 5.032 tokens/s.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (mismo tamaño, misma tarea o mismo formato de despliegue), ni cifras de parámetros, contexto o rendimiento de alternativas que permitan una comparación rigurosa. El único punto de referencia citado es la implementación de referencia de Inkling 2 Mini, frente a la cual este artefacto coincide en el 98,1 % de los tokens más probables.

## Limitaciones y advertencias

- Solo texto: no procesa imágenes ni otros modales.
- Una petición a la vez: el motor no está pensado para servir concurrencia; el throughput agregado será bajo en cargas multi-usuario.
- No cabe en una sola GPU de 16 GB; requiere exactamente dos tarjetas `sm_120` de 16 GB. Una GPU de 32 GB y Windows no están verificados.
- La calidad no se ha medido con benchmarks en esta release; las cifras publicadas son solo de velocidad.
- Las salidas no son bit-idénticas a la implementación de referencia: coincidencia del 98,1 % en el token más probable, atribuida al redondeo BF16 en el orden de las sumas.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingüe.
- Sesgos conocidos y riesgo de alucinación: no disponible en la información proporcionada.
- Licencia Apache-2.0 para el artefacto, pero el uso del modelo base está sujeto a la Model Acceptable Use Policy de Thinking Machines; conviene revisarla antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 21 de noviembre de 2026; se trata de un artefacto reciente y sin validación comunitaria.
- Dependencia estricta de capy-flash v0.16.0 o superior y del formato propietario `.ninfer`; no hay soporte declarado para otros motores.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/Feyd89/Inkling-2-Mini-NVFP4-capy-flash
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor capy-flash: https://github.com/ValerioDolci/capy-flash
- Política de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
