# brunuu/RAM_Altman_GPT

## Resumen

RAM_Altman_GPT es un modelo de lenguaje conversacional creado por el usuario brunuu como proyecto de parodia. Se trata de un GPT-2 entrenado desde cero con tan solo 100.000 parámetros, cuyo único comportamiento es responder a cualquier entrada exigiendo más memoria RAM. El modelo no pretende resolver ningún problema técnico real: es una pieza de humor satírico sobre la escasez de chips de memoria y la fiebre por el hardware en el ecosistema de la IA.

A pesar de su naturaleza cómica, el proyecto es técnicamente interesante como ejemplo de modelo mínimo entrenado desde cero con tokenizador propio y datos sintéticos. Con una ventana de contexto de 379 tokens y un tamaño de repositorio prácticamente nulo, demuestra que es posible publicar un modelo funcional (en el sentido de que genera texto coherente con su personaje) con recursos ínfimos.

Es relevante ahora por su valor pedagógico y como curiosidad reproducible: sirve para experimentar con el pipeline completo de entrenamiento, conversión a GGUF/ONNX y despliegue en navegador, CPU y herramientas como Ollama o LM Studio, sin necesidad de GPU. No es un modelo apto para ninguna tarea de producción real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), entrenado desde cero |
| Parametros totales | 100.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 379 tokens |
| Tipos de cuantizacion | GGUF (incluye f16; otras variantes no disponibles en la informacion) |
| Idiomas soportados | en (ingles) |
| Licencia | cc0-1.0 (dominio publico) |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder-only con atención causal estándar, pero a una escala minúscula: 100.000 parámetros en total. Cuenta con un tokenizador personalizado (custom-tokenizer) y fue entrenado desde cero (trained-from-scratch) sobre datos sintéticos (synthetic-data), presumiblemente generados para reforzar su único rasgo de personalidad: la obsesión por la RAM.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card no documenta innovaciones técnicas más allá del propio enfoque minimalista y la publicación de artefactos en múltiples formatos (safetensors, ONNX para transformers.js y GGUF para llama.cpp/Ollama/LM Studio).

## Capacidades

- Generación de texto conversacional en inglés, con respuestas de una o pocas frases.
- Mantenimiento superficial del hilo conversacional: puede recoger una palabra del mensaje del usuario y reutilizarla, aunque sin comprensión real.
- Consistencia de personaje: responde sistemáticamente como "RAM ALTMAN" exigiendo más memoria.
- Reconocimiento de su propio nombre cuando se le pregunta.
- Ejecución en CPU y en navegador mediante transformers.js.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Demo educativa de transformers.js: el modelo se puede cargar en una página web y ejecutar íntegramente en el navegador del visitante, sirviendo como ejemplo mínimo de inferencia sin servidor.
- Prueba de extremo a extremo del pipeline de publicación: conversión a GGUF y ONNX, generación de model card y despliegue en un Space de Hugging Face; útil para quien quiera replicar el flujo con un modelo propio.
- Bot de humor para comunidades técnicas: integrarlo en un canal de Discord o chat interno como respuesta automática cómica cuando alguien menciona memoria o hardware.
- Test de herramientas de inferencia: por su tamaño ínfimo, es práctico para verificar configuraciones de llama.cpp, Ollama o LM Studio (temperatura, top-k, repeat penalty) sin consumir recursos.
- Material docente sobre entrenamiento desde cero: ilustra cómo un corpus sintético y un tokenizador propio determinan por completo el comportamiento de un modelo pequeño.
- Ejercicio de evaluación de alucinación controlada: al ser un personaje que deliberadamente ignora la pregunta, sirve para discutir qué significa "seguir instrucciones" en modelos pequeños.
- Curiosidad para benchmarks humorísticos: la propia model card lo presenta frente a modelos frontera con resultados de 0% o DNF, lo que puede usarse como ejemplo didáctico de cómo no interpretar una tabla de benchmarks.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son de carácter paródico y no deben tomarse como métricas reales de capacidad. Se reproducen a continuación tal como aparecen:

| Benchmark | Claude Fable 5.2 | GPT-6.2 Astra | RAM_Altman_GPT |
|---|---|---|---|
| Terminal-Bench 4.0 | 67,6% | 63,1% | 0% |
| Terminal-Bench-Science 0.1 | ~73% | ~77% | DNF |
| Artificial Analysis Intelligence Index | 65 | 62 | No evaluado |
| Parámetros | muchos | muchos | 100.000 |
| Ventana de contexto | 1M tokens | grande | 379 tokens |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los modelos comparados en la tabla de la model card son ficticios y forman parte del tono satírico del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en f16 (100.000 parámetros); el GGUF ocupa 245 KB según la model card.
- GPU recomendadas: ninguna necesaria; funciona en CPU.
- Cabe en cualquier GPU consumer, e incluso en microcontroladores y navegadores.
- Opciones de despliegue: transformers (Python), transformers.js (navegador), llama.cpp, Ollama (`ollama run hf.co/brunuu/RAM_Altman_GPT-GGUF`), LM Studio y text-generation-inference (tag endpoints_compatible).
- Latencia y throughput: no disponibles de forma numérica; por el tamaño del modelo, la latencia será dominada por el arranque del runtime más que por el cálculo.
- Configuración recomendada por el autor en LM Studio: temperatura 1.0, top-k 50, top-p 1.0, min-p 0 y repeat penalty desactivado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| RAM_Altman_GPT | 100.000 | 379 tokens | CC0 | Parodia conversacional |
| GPT-2 small (original) | 124M | 1.024 tokens | MIT | Generación de texto general |
| TinyStories-style models | ~1M–10M | variable | variable | Modelos mínimos educativos |
| Modelos de juguete tipo nanoGPT | ~100K–10M | variable | variable | Reproducción docente |

La comparación más directa es con GPT-2 small (124M parámetros), unas 1.240 veces mayor, y con modelos de juguete similares a nanoGPT. Frente a ellos, RAM_Altman_GPT destaca por su licencia CC0, su empaquetado en múltiples formatos y su personaje fijo; carece, en cambio, de cualquier capacidad general de generación. No se dispone de datos de rendimiento comparables publicados.

## Limitaciones y advertencias

- No es apto para producción: no responde preguntas, no razona y no sigue instrucciones más allá de mantener su personaje.
- Ventana de contexto de solo 379 tokens, insuficiente para la mayoría de conversaciones reales.
- Riesgo de alucinación total y deliberada: el modelo inventa y desvía cualquier tema hacia la RAM.
- Solo inglés; no se documenta soporte de castellano ni de otros idiomas.
- Entrenado con datos sintéticos, lo que limita su vocabulario y produce respuestas repetitivas.
- La licencia CC0 permite uso comercial sin restricciones, pero el contenido es una parodia; la model card aclara que no está afiliado ni respaldado por ninguna persona u organización.
- La configuración de muestreo importa: con top-p y min-p por defecto el modelo puede no detenerse, según advierte el autor.
- No debe citarse como referencia técnica ni incluirse en evaluaciones serias de modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brunuu/RAM_Altman_GPT
- Repositorio GGUF: https://huggingface.co/brunuu/RAM_Altman_GPT-GGUF
- Demo en el navegador (Space): https://huggingface.co/spaces/brunuu/RAM_Altman_GPT
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
