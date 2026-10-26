# danyalmalik/Qwen3-1.7B-ONNX-WebGPU

## Resumen

Qwen3-1.7B-ONNX-WebGPU es una conversión del modelo denso Qwen3-1.7B de Alibaba Qwen a formato ONNX Runtime GenAI, empaquetada por el desarrollador independiente danyalmalik para ejecutarse directamente en el navegador mediante el backend WebGPU de ONNX Runtime Web. El objetivo no es entrenar un modelo nuevo, sino hacer viable la inferencia local de un LLM de 1,7 mil millones de parámetros sin servidor, sin instalación y sin enviar datos a terceros, algo relevante para demos, aplicaciones web con requisitos de privacidad y entornos sin backend.

El export aplica cuantización de 4 bits (round-to-nearest, bloque de 32) a todas las capas lineales y a la capa de salida, mientras que embeddings, activaciones y caché KV se mantienen en float16. Además del decodificador, el repositorio incluye una cabeza draft EAGLE-3 convertida también a ONNX que permite decodificación especulativa con verificación por parte del modelo principal, de modo que la salida es exactamente la del modelo y no una aproximación.

El paquete es de nicho y muy reciente (publicado el 25 de octubre de 2026, con cero descargas y cero likes en el momento de redactar esta ficha), y su uso en navegador requiere una compilación específica de ONNX Runtime Web mantenida por el mismo autor, porque la versión estándar 1.30 calcula las layer-norm en float16 y desborda con las activaciones de este modelo. La licencia es Apache-2.0, igual que el modelo base, salvo la cabeza draft, que arrastra sus propios términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-1.7B), exportada como grafo ONNX en el layout de ONNX Runtime GenAI |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base; no se redefine ni se documenta en este repositorio |
| Tipos de cuantizacion | Capas lineales y capa de salida en 4 bits (RTN, bloque de 32); embeddings, activaciones y cache KV en float16. No se publican variantes GGUF ni de 8 bits |
| Idiomas soportados | No disponible en este repositorio (el modelo base Qwen3 declara cobertura multilingüe amplia; no verificada aquí) |
| Licencia | Apache-2.0 (modelo principal); la cabeza draft en `draft/` se rige por `draft/License_AngelSlim_model_and_dataset.txt` |
| Formato de pesos | ONNX (ONNX Runtime GenAI: `input_ids`, `attention_mask`, `past_key_values.*` → `logits`, `present.*`), más una salida adicional `eagle_taps` y un grafo ONNX separado para la cabeza EAGLE-3 |
| Tamano del repositorio | 1,9 GB |
| Pipeline declarado | No disponible (sin `pipeline_tag`) |
| Fecha de publicacion | 25 de octubre de 2026 |

## Arquitectura y entrenamiento

No hay entrenamiento propio: el repositorio es una conversión de formato y cuantización del checkpoint Qwen3-1.7B, un transformer decoder-only denso. El export, realizado con el exportador propio de Quick Inference, reescribe el grafo al layout de ONNX Runtime GenAI y aplica tres modificaciones técnicas: la rotary embedding se calcula dentro del nodo `GroupQueryAttention`, las RMS norm por cabeza de q y k se pliegan en ese mismo nodo (entradas 14 y 15 con `qk_norm_epsilon`, disponible desde ONNX Runtime 1.30), y la capa de salida se cuantiza a 4 bits aprovechando que los embeddings de tokens están atados a ella, de forma que una única tabla de 4 bits sirve para ambos usos.

La segunda pieza es la decodificación especulativa. El grafo expone una salida extra, `eagle_taps`, que concatena el residual stream a la entrada de tres capas (la 2, la N/2 y la N-3). Esos taps alimentan la cabeza draft EAGLE-3 (`AngelSlim/Qwen3-1.7B_eagle3`, convertida a ONNX y cuantizada a 4 bits con caché KV estática), que propone el siguiente token; el modelo principal verifica cada propuesta, por lo que el resultado coincide con el del modelo sin especulación. El autor advierte explícitamente de que los ficheros son modificados y de que las salidas son cercanas, pero no idénticas, a las del modelo original.

## Capacidades

- Generación de texto autoregresiva en el navegador, sobre el grafo ONNX servido por WebGPU.
- Decodificación especulativa con cabeza EAGLE-3 integrada, con verificación exacta por parte del modelo principal.
- Inferencia local sin backend: los tokens no salen del dispositivo del usuario.
- Herencia de las capacidades del modelo base Qwen3-1.7B (razonamiento, código y matemáticas básicas a esa escala), si bien este repositorio no publica evaluaciones que las confirmen.
- Soporte de tool calling / function calling: no disponible en la documentación del repositorio; depende de la plantilla de chat que aplique el runtime y no está declarado.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada en este repositorio.
- Capacidades multilingües: no documentadas aquí; el modelo base declara multilingüismo amplio.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles en este repositorio.
- Ejecución en otras plataformas: los ficheros ONNX son utilizables con ONNX Runtime GenAI en servidor o escritorio, no solo en WebGPU.

## Casos de uso

- Demo interactiva en navegador sin instalación: cargar el grafo ONNX con ONNX Runtime Web y la compilación de Quick Inference permite ofrecer un chat de 1,7 B en una página web, sin backend ni registro, útil para páginas de producto o documentación técnica.
- Asistentes con privacidad estricta: al ejecutarse en el cliente, el texto del usuario nunca abandona el dispositivo; encaja en aplicaciones sanitarias, jurídicas o internas donde enviar prompts a una API externa no es aceptable.
- Procesamiento de texto en el borde: resumen, reescritura o extracción de campos en una extensión de navegador o una PWA, con coste marginal cero por token y sin cuota de API.
- Prototipado y evaluación de decodificación especulativa: el par decodificador + cabeza EAGLE-3 en ONNX es un banco de pruebas reproducible para medir la aceleración de la especulación en navegador y comparar con la decodificación greedy estándar.
- Formación y talleres: permite que alumnos ejecuten un LLM real en un portátil con GPU integrada, sin CUDA ni cuentas en la nube, y observar cuantización, caché KV y muestreo sobre el grafo.
- Kioscos y terminales sin conectividad: despliegue en equipos con GPU integrada y navegador Chromium en modo kiosco, donde no hay red pero sí necesidad de generación de texto o clasificación.
- Validación de pipelines ONNX Runtime GenAI: sirve como caso de prueba de exportación, cuantización de 4 bits y plegado de operaciones antes de llevar un modelo mayor al mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye cifras de MMLU, HumanEval, GSM8K ni de velocidad (tokens/s) o latencia, ni comparaciones con el checkpoint original en bf16. Tampoco se documenta la ganancia de la decodificación especulativa con EAGLE-3 en este export.

## Requisitos de hardware

- Peso de los pesos: el repositorio ocupa 1,9 GB; con las matrices lineales y la capa de salida en 4 bits, el grueso del decodificador ronda 0,9-1,0 GB, más la cabeza draft y los ficheros auxiliares.
- Memoria adicional: embeddings, activaciones y caché KV en float16. Como estimación (no publicada por el autor) el caché KV crece del orden de 0,1 MB por token; 8 192 tokens de contexto implican aproximadamente 0,9 GB solo de caché, por lo que contextos largos en navegador son caros.
- VRAM estimada para inferencia: 2-3 GB para contextos de 4K-8K; por encima de 16K conviene reservar 4 GB o más.
- GPU de escritorio: cualquier GPU con soporte WebGPU estable (NVIDIA RTX serie 20 o superior, AMD RDNA 2 o superior, Intel Arc, Apple Silicon M1 o superior). Para el despliegue fuera del navegador, ONNX Runtime GenAI funciona con CUDA y DirectML, por lo que una RTX 3060 de 12 GB o una RTX 4090 van sobradas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con 4 GB o más de memoria; también en iGPU recientes, aunque con throughput menor.
- Advertencia de runtime en navegador: hace falta la compilación de ONNX Runtime Web de Quick Inference v1.30.0-qi.4 o posterior. Con la 1.30 estándar, la layer-norm se calcula en float16 y desborda con las activaciones de este modelo; en GPUs Apple se han observado logits no finitos en la primera ejecución.
- Opciones de despliegue: ONNX Runtime Web (WebGPU) en navegador; ONNX Runtime GenAI en escritorio o servidor. No hay artefactos GGUF, por lo que llama.cpp y Ollama no lo consumen directamente, y no se documenta soporte de vLLM ni TGI para este export.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3-1.7B-ONNX-WebGPU (este) | 1,7 B | 32 768 (heredado) | ONNX 4 bits + fp16 | Apache-2.0 | Inferencia en navegador con WebGPU y decodificación especulativa EAGLE-3 |
| Qwen/Qwen3-1.7B | 1,7 B | 32 768 | safetensors bf16 | Apache-2.0 | Checkpoint de referencia; requiere GPU o servidor y stack de Transformers |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 | safetensors, GGUF | Apache-2.0 | Generación anterior de la familia, con ecosistema GGUF amplio para Ollama y llama.cpp |
| Llama-3.2-1B-Instruct | 1,24 B | 131 072 | safetensors, GGUF | Llama 3.2 Community License | Alternativa de tamano similar con contexto largo, pero licencia con restricciones y registro previo |

Nota: los datos de los modelos comparados provienen de su documentación pública y no se han verificado en el repositorio analizado; el propio export no publica comparativas de calidad ni de velocidad. La ventaja diferencial de este paquete no es el rendimiento del modelo, sino el formato listo para WebGPU y la cabeza EAGLE-3 incluida.

## Limitaciones y advertencias

- Los ficheros son modificados: el autor advierte de que las salidas son cercanas, pero no idénticas, a las del Qwen3-1.7B original, por lo que no debe asumirse equivalencia bit a bit.
- La cuantización de 4 bits round-to-nearest con bloque de 32 en todas las matrices lineales y en la capa de salida introduce degradación de calidad no cuantificada en la model card.
- Dependencia de un fork del runtime: sin la compilación de ONNX Runtime Web de Quick Inference (v1.30.0-qi.4 o superior) el modelo produce logits no finitos en GPUs Apple y falla en la primera ejecución.
- Alcance limitado del navegador: la ventana de contexto efectiva está acotada por la memoria de la GPU y el coste del caché KV en float16; contextos largos son poco prácticos en equipos modestos.
- No se documenta plantilla de chat, modo thinking, tool calling ni idiomas soportados en este repositorio: cualquier uso conversacional exige validar el prompt format contra el modelo base.
- Riesgo de alucinación propio de un modelo de 1,7 B, agravado por la cuantización; no es adecuado para tareas factuales sin verificación.
- Sesgos: no hay evaluación de sesgos ni de seguridad publicada para este export; hereda los del checkpoint original, que tampoco se documentan aquí.
- Licencia: el modelo principal es Apache-2.0 y permite uso comercial, pero la cabeza draft EAGLE-3 tiene términos propios en `draft/License_AngelSlim_model_and_dataset.txt` que deben revisarse antes de redistribuir o desplegar en producción.
- Madurez: cero descargas y cero likes en el momento del análisis, sin issues ni validación comunitaria; conviene tratar el paquete como experimental y fijar la versión exacta de los ficheros.
- Repositorio sin `pipeline_tag` ni idiomas declarados, lo que complica el descubrimiento y la integración automática en herramientas estándar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/danyalmalik/Qwen3-1.7B-ONNX-WebGPU
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Cabeza draft EAGLE-3 original: https://huggingface.co/AngelSlim/Qwen3-1.7B_eagle3
- Compilación de ONNX Runtime Web de Quick Inference: https://github.com/mdanyalmalik/onnxruntime-web-kernels
- Resultados de búsqueda web: no se ha recuperado ningún enlace técnico relevante (los resultados devueltos eran contenido no relacionado con el modelo); no se incluyen.
