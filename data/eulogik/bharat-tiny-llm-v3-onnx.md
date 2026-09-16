# eulogik/Bharat-Tiny-LLM-v3-ONNX

## Resumen

Bharat-Tiny-LLM-v3-ONNX es la conversión a formato ONNX del modelo eulogik/Bharat-Tiny-LLM-v3, un LLM bilingüe de 1,7 mil millones de parámetros orientado a dispositivos edge. El modelo cubre hindi, hinglish e inglés y deriva de Qwen3-1.7B-Base, cuyo vocabulario se amplió con 326 tokens Devanagari hasta alcanzar las 151.969 entradas. Lo publica el usuario eulogik en Hugging Face bajo licencia Apache-2.0.

El problema que resuelve es la ejecución de un modelo de ~1,7B directamente en el navegador sin backend: los pesos están exportados, cuantizados y verificados para funcionar con Transformers.js sobre WebGPU, cargando el archivo `onnx/model_q4f16.onnx`. Esto habilita asistentes conversacionales en hindi que corren íntegramente en el cliente, sin coste de servidor ni envío de datos a terceros.

Su relevancia actual es doble: por un lado, demuestra un flujo de conversión ONNX reproducible (exportación FP32 con `optimum-cli`, cuantización 4-bit con `MatMulNBitsQuantizer` y validación contra los logits de PyTorch); por otro, ataca un nicho poco cubierto, el de los LLM pequeños con tokenizador optimizado para Devanagari. El repositorio ocupa 1,7 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivado de Qwen3-1.7B-Base |
| Parámetros totales | ~1,7 mil millones (1,7B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q4f16 (pesos 4-bit simétricos con block size 32 y tabla de embeddings redondeada a FP16); el proceso de conversión parte de una exportación FP32 |
| Idiomas soportados | hindi, hinglish e inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_q4f16.onnx`, convención de onnx-community) |
| Vocabulario | 151.969 tokens (326 tokens Devanagari añadidos sobre Qwen3-1.7B-Base) |
| Tamaño del repositorio | 1,7 GB |
| Librería declarada | transformers.js |
| Pipeline | text-generation |
| Modelo base | eulogik/Bharat-Tiny-LLM-v3 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-16 |
| Última actualización | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B-Base: un transformer decoder-only denso, sin mezcla de expertos ni capas de estado recurrente. La modificación introducida por el autor es de tokenizador: se añadieron 326 tokens Devanagari, lo que eleva el vocabulario a 151.969 entradas y mejora la eficiencia de codificación del hindi y del hinglish en comparación con un tokenizador entrenado mayoritariamente en inglés. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base recibió ajuste por instrucciones, RLHF o DPO.

La aportación técnica de este repositorio concreto es el pipeline de conversión a ONNX, documentado paso a paso: exportación FP32 del modelo fusionado con `optimum-cli export onnx` en modo `text-generation-with-past`, validada contra los logits de PyTorch; cuantización simétrica de pesos a 4 bits con block size 32 mediante `MatMulNBitsQuantizer` (los mismos ajustes que usan las conversiones de onnx-community); y redondeo de la tabla de embeddings a FP16, que reduce su tamaño de 1,24 GB a 0,62 GB. El resultado se verificó con `onnx.checker` y con la carga efectiva en ONNX Runtime: 59 entradas y 57 salidas, incluyendo `input_ids`, `attention_mask` y los pares clave/valor del caché (`past key/values`), lo que confirma soporte de decodificación incremental.

## Capacidades

- Generación de texto conversacional en formato de plantilla de chat: el ejemplo oficial pasa un array de mensajes con `role` y `content`, y recupera el contenido del último mensaje generado.
- Cobertura multilingüe limitada a hindi, hinglish e inglés, con ventaja declarada en la codificación de Devanagari gracias a la ampliación del vocabulario.
- Decodificación incremental con caché de clave/valor, expuesta en la propia firma ONNX, lo que reduce el coste por token en generación autoregresiva.
- Inferencia en navegador mediante Transformers.js con aceleración WebGPU y `dtype: 'q4f16'`.
- Control de muestreo en inferencia mediante `max_new_tokens`, `temperature` y `top_p`, tal como muestra el ejemplo de la model card.
- Soporte de tool calling o function calling: no disponible (no documentado).
- Soporte de agentes o razonamiento multi-paso: no disponible (no documentado).
- Capacidades de visión, audio o modo de razonamiento explícito (thinking mode): no disponibles (no documentadas).

## Casos de uso

- Asistente conversacional embebido en una página web: el modelo se carga con Transformers.js sobre WebGPU y responde sin llamar a ningún servidor, de modo que el texto del usuario nunca sale del dispositivo. Es adecuado por su tamaño (1,7B) y por el archivo q4f16, pensado para entornos con memoria limitada.
- Aplicaciones web progresivas (PWA) con funcionamiento offline: al no depender de una API remota, la generación sigue disponible sin conexión una vez cacheado el modelo, algo relevante en regiones con conectividad intermitente donde el hindi es lengua mayoritaria.
- Traducción y normalización hinglish-hindi en el cliente: el vocabulario ampliado con Devanagari cubre mejor la romanización mixta del hinglish, útil para normalizar texto de entrada antes de enviarlo a un sistema posterior.
- Atención al cliente en mercados de la India: un chat de primer nivel desplegado en el navegador puede resolver consultas frecuentes en hindi o inglés sin coste de GPU en servidor, reservando el escalado a un modelo mayor para los casos complejos.
- Educación y tutoría de refuerzo: ejercicios de práctica de idiomas o de comprensión lectora generados localmente, con la ventaja de que el contenido del estudiante permanece en su equipo.
- Preprocesado y clasificación de texto sensible a la privacidad: resumen o etiquetado de documentos en el propio navegador para sectores como salud o legal, donde enviar el texto a una API externa es problemático.
- Extensiones de navegador para asistencia de escritura en Devanagari: autocompletado, reformulación o corrección de texto en campos de formulario, aprovechando que el modelo corre dentro del propio navegador.
- Prototipado y docencia de Transformers.js: sirve como referencia funcional de un flujo completo de exportación ONNX, cuantización 4-bit y ejecución WebGPU, reutilizable para convertir otros modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se aportan comparaciones con modelos similares. La búsqueda web realizada no devolvió resultados relacionados con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. A partir del tamaño del repositorio (1,7 GB) y de la tabla de embeddings cuantizada a FP16 (0,62 GB), los pesos del archivo q4f16 deberían ocupar del orden de 1 a 1,5 GB, a los que hay que sumar el caché de clave/valor y el coste de runtime. Cifra orientativa, no confirmada por el autor.
- GPU recomendadas: no disponibles. El diseño apunta a GPU integradas o discretas de gama media-baja accesibles desde el navegador, no a aceleradores de centro de datos.
- Compatibilidad con GPU de consumo: sí, es el objetivo declarado del modelo (edge y navegador). No se especifican modelos concretos.
- Requisito de plataforma: WebGPU, lo que implica un navegador con soporte habilitado (Chrome o Edge en versiones recientes) y un sistema operativo con driver compatible. Como alternativa, Transformers.js puede ejecutarse con backend WASM, con rendimiento muy inferior.
- Opciones de despliegue: Transformers.js en navegador o Node.js (WebGPU o WASM); ONNX Runtime nativo (Python, C++, Node) cargando el grafo ONNX directamente. vLLM, TGI y llama.cpp/Ollama no son aplicables a este repositorio, ya que no publica pesos en formato safetensors ni GGUF.
- Latencia y throughput estimados: no disponibles. Dependen por completo del hardware del cliente y del backend WebGPU o WASM empleado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eulogik/Bharat-Tiny-LLM-v3-ONNX (este modelo) | ~1,7B | no disponible | ONNX q4f16 | Apache-2.0 | Hugging Face, 0 descargas |
| eulogik/Bharat-Tiny-LLM-v3 (modelo base) | ~1,7B | no disponible | no disponible en la información proporcionada | Apache-2.0 (según el campo del modelo derivado) | Hugging Face |
| Qwen3-1.7B-Base (arquitectura de origen) | 1,7B | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no verificada en esta búsqueda |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo frente a alternativas de la misma categoría. La comparación anterior se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- El nombre del modelo base indica que parte de Qwen3-1.7B-Base, es decir, un modelo preentrenado sin ajuste por instrucciones confirmado. Aunque el ejemplo de uso emplea una plantilla de roles, no se documenta si existe un ajuste conversacional real; es probable que las respuestas sean menos alineadas que las de un modelo instruido.
- No se publican resultados de benchmarks, por lo que no hay evidencia cuantitativa de calidad, y tampoco existe validación de la comunidad (0 descargas, 0 likes en el momento de la consulta).
- La cuantización 4-bit con block size 32 introduce degradación respecto al modelo en FP32; el autor solo verifica que el grafo es válido y carga en ONNX Runtime, no que la calidad se preserve.
- La longitud de contexto no está documentada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Riesgo de alucinación propio de un modelo de 1,7B: la precisión factual en dominios especializados será limitada y no debe usarse como fuente de verdad sin verificación.
- Cobertura de idiomas restringida a hindi, hinglish e inglés. El comportamiento en castellano u otras lenguas no está documentado y previsiblemente será deficiente.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o representación demográfica del modelo base ni del ajuste con tokens Devanagari.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base eulogik/Bharat-Tiny-LLM-v3 y de Qwen3-1.7B-Base antes de un despliegue en producción.
- Restricciones de despliegue en producción: dependencia de WebGPU y de la memoria disponible en la pestaña del navegador; el rendimiento es muy variable según el cliente y no hay SLA posible sobre hardware de terceros.
- Ausencia de soporte confirmado para tool calling, agentes, visión o audio: cualquier flujo que dependa de estas capacidades debe considerarse no soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eulogik/Bharat-Tiny-LLM-v3-ONNX
- Modelo base: https://huggingface.co/eulogik/Bharat-Tiny-LLM-v3
- Demo en vivo (Space): https://huggingface.co/spaces/eulogik/bharat-tiny-llm-v3-demo
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido sobre plataformas de streaming de vídeo), por lo que no se han incluido.
