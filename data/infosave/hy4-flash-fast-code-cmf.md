# infosave/Hy4-flash-Fast-Code-cmf

## Resumen

Hy4-flash Fast Code CMF es una versión podada y cuantizada del modelo Tencent Hy4-flash, publicada por el usuario infosave. Se trata de un transformer de tipo MoE (mixture of experts) al que se le han eliminado 256 de los 512 expertos enrutados de cada capa, conservando íntegros el router, las tablas Engram y las hiper-conexiones del modelo original. El resultado se distribuye en formato CMF, un contenedor propietario del motor de inferencia cortiq, escrito en Rust y sin dependencias de Python ni de frameworks de ML.

El objetivo declarado es maximizar la velocidad de decodificación en tareas de código manteniendo una calidad cercana a la del modelo completo. Según la model card, el archivo principal decodifica 67,4 tok/s en una RTX PRO 6000 completa, frente a los 48,0 tok/s del modelo de 512 expertos, y conserva un 92,7 % de pass@1 en HumanEval frente al 93,9 % del original. La poda se guía por la energía de salida de cada experto sobre tokens de código, no por la frecuencia de selección del router.

Es relevante porque demuestra una vía poco habitual de compresión de MoE: en lugar de cuantizar más agresivamente, se eliminan expertos completos manteniendo el router entero para que las selecciones de expertos descartados no contaminen las restantes. El modelo solo está pensado para ejecutarse con el motor cortiq sobre CUDA, lo que limita su portabilidad pero permite desplegarlo en tarjetas de 12 GB con rendimiento aceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con router completo, expertos compartidos, tablas Engram e hiper-conexiones (según model card) |
| Parametros totales | no disponible |
| Parametros activos | 16 de 512 expertos por token (router intacto), 256 expertos conservados por capa |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4tp (4 bits) en expertos enrutados; tronco a 4 bits (archivo q4) o 8 bits (archivo base); cabeza a 8 bits |
| Idiomas soportados | en, ru, zh |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | CMF (contenedor propietario de cortiq); tamaños de 108,8 GB y 111,7 GB |

## Arquitectura y entrenamiento

El modelo base Tencent Hy4-flash es un transformer con mezcla de expertos: cada capa contiene 512 expertos enrutados de los que el router selecciona 16 por token, además de un experto compartido, proyecciones latentes y tablas Engram. La variante publicada aquí no ha sido reentrenada: se ha construido mediante un proceso de poda y recuantización sobre el modelo original ya cuantizado a q4tp.

El procedimiento de poda, documentado en la model card, consta de cuatro pasos. Primero se capturan las entradas latentes, selecciones y pesos de cada FFN enrutado sobre 89.677 tokens (32.768 de código Python de Magicoder, una tarea larga de three.js y las respuestas del propio modelo). Después se conservan, por capa, los 256 expertos con mayor energía Σ(weight · ‖output‖)², lo que deja un 5,4 % de la salida enrutada ausente en tokens de validación, frente al 8,6 % de conservar los 256 más seleccionados. A continuación se eliminan los expertos descartados del archivo manteniendo intactos los números de los conservados y el sesgo de selección del router. Por último, en el archivo q4 se recuantizan a 4 bits la atención, el experto compartido y las proyecciones latentes.

La decisión de mantener el router completo es la innovación central: si se poda también el router, una selección de un experto eliminado recae sobre otro conservado y los pesos se renormalizan, lo que degrada más la perplejidad (9,75 frente a 8,97 en el archivo de tronco a 8 bits). No se documentan datos de entrenamiento adicionales, RLHF ni DPO para esta variante.

## Capacidades

- Generación de texto y código en inglés, ruso y chino.
- Razonamiento multi-paso con modo de pensamiento (thinking) desactivable mediante `--no-think`.
- Escritura de código en múltiples lenguajes, con énfasis en Rust, Python y JavaScript (validado con tareas de three.js).
- Servidor compatible con la API de chat completions de OpenAI (`cortiq serve` en el puerto 8080).
- Ejecución con decodificación greedy y muestreo por semilla.
- Inferencia con expertos en memoria de host cuando el archivo no cabe en VRAM (RAM tier).
- No se documenta soporte de tool calling, function calling, visión ni audio en la información disponible.

## Casos de uso

- Generación de código en producción con latencia baja: el archivo q4 decodifica 67,4 tok/s en una RTX PRO 6000 completa y 32,6 tok/s con solo 12 GB de VRAM, lo que permite integrarlo en asistentes de autocompletado o revisión de código con requisitos de latencia estrictos.
- Despliegue en estaciones de trabajo con GPU de consumo: con 12-16 GB de VRAM el modelo mantiene 32,6-39,8 tok/s gracias al tier de RAM para expertos fríos, algo inviable con el modelo completo de 512 expertos.
- Generación de código Rust: la model card reporta perplejidad de 4,43 sobre fuentes Rust y 93,3 % de pass@1 en HumanEval con el archivo de tronco a 8 bits, lo que lo hace adecuado para tareas de refactorización y escritura de código de sistemas.
- Prototipado de páginas web interactivas: se ha validado la generación de una página HTML con three.js de 6.400-8.900 tokens, útil para demos y maquetas de front-end.
- Servicio de chat interno autoalojado: el servidor `cortiq serve` expone un endpoint compatible con OpenAI, lo que permite sustituir APIs externas en entornos con requisitos de privacidad.
- Evaluación de técnicas de poda de MoE: el repositorio incluye la metodología completa (captura, selección por energía, defrag, recuantización), útil para investigadores que quieran replicar el proceso sobre otros MoE.
- Inferencia multilingüe en inglés, ruso y chino para documentación técnica o atención a desarrolladores en esas lenguas.

## Benchmarks y rendimiento

| Modelo | Perplejidad código nuevo | Perplejidad Rust | HumanEval pass@1 | tok/s (96 GB) | tok/s (24 GB) | tok/s (16 GB) | tok/s (12 GB) |
|---|---:|---:|---:|---:|---:|---:|---:|
| hy4-flash-fast-code-q4.cmf | 9,63 | 4,43 | 92,7 % | 67,4 | 49,5 | 39,8 | 32,6 |
| hy4-flash-fast-code.cmf | 8,97 | 4,22 | 93,3 % | no disponible | no disponible | no disponible | no disponible |
| Poda simple de los mismos 256 expertos | 9,75 | 4,31 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Hy4-flash completo q4tp (512 expertos) | 8,42 | 3,92 | 93,9 % | 48,0 | 11,9 | 8,9 | no medido |

Mediciones de velocidad en NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB), 48 núcleos de CPU, 176 GB de RAM, backend CUDA, `cortiq run --greedy --no-think`, 256 tokens tras un prompt de 1.000 tokens de WikiText-2, media de dos ejecuciones. HumanEval: 164 problemas, greedy, thinking desactivado. En la tarea larga de three.js, el archivo de tronco a 8 bits produjo una página funcional en 2 de 4 ejecuciones, frente a 6 de 6 del modelo completo.

## Requisitos de hardware

- VRAM para el archivo q4 completo: 108,8 GB; para el archivo de tronco a 8 bits: 111,7 GB.
- Con `CMF_GPU_VRAM_MB` limitado a 24 GB: 49,5 tok/s; a 16 GB: 39,8 tok/s; a 12 GB: 32,6 tok/s (archivo q4).
- GPU validadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB). No se documentan mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo con 12-16 GB de VRAM en modo tier de RAM, a costa de leer los expertos fríos desde memoria de host.
- Backend CUDA obligatorio para rendimiento: requiere CUDA 12.x con `libnvrtc` y `libcublas` en tiempo de ejecución, sin toolkit en tiempo de compilación. Vulkan, DX12 y Metal leen los archivos en host (lento).
- Motor de inferencia: cortiq 0.9.8 o superior, compilado con `--features cuda`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: el archivo de 108,8 GB debe caber en caché de página para el rendimiento máximo; con menos RAM los expertos se leen de disco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval pass@1 | Licencia | Formato / motor |
|---|---|---|---|---|---|
| Hy4-flash Fast Code CMF (q4) | 256/512 expertos por capa, 16 activos | no disponible | 92,7 % | tencent-hy-license | CMF / cortiq |
| Hy4-flash completo q4tp | 512 expertos por capa, 16 activos | no disponible | 93,9 % | tencent-hy-license | CMF / cortiq |
| Poda simple de 256 expertos | 256/512 expertos por capa | no disponible | no disponible | tencent-hy-license | CMF / cortiq |

No se dispone de datos de benchmarks de otros modelos de código comparables en la información proporcionada.

## Limitaciones y advertencias

- La poda elimina el 5,4 % de la salida enrutada de cada capa en tokens de validación, lo que degrada la perplejidad frente al modelo completo (9,63 frente a 8,42 en código nuevo).
- En tareas de código largo la fiabilidad cae notablemente: 2 de 4 ejecuciones funcionales frente a 6 de 6 del modelo completo en la página de three.js.
- Solo se ejecuta con el motor cortiq en formato CMF; no hay conversión documentada a safetensors, GGUF ni otros formatos.
- El rendimiento óptimo exige CUDA; otros backends leen los archivos en host con velocidad muy inferior.
- El modelo solo declara soporte de inglés, ruso y chino; el rendimiento en castellano no está documentado.
- Licencia tencent-hy-license: es necesario revisar sus términos para uso comercial, ya que se etiqueta como "other".
- No se documentan evaluaciones de sesgo, alucinación ni seguridad para esta variante podada.
- El repositorio ocupa 220,5 GB y el archivo principal 108,8 GB, lo que exige infraestructura de almacenamiento considerable.
- El modelo se publicó en noviembre de 2026 y cuenta con 391 descargas y 1 like, por lo que la validación comunitaria es mínima.

## Enlaces

- Hugging Face: https://huggingface.co/infosave/Hy4-flash-Fast-Code-cmf
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Repositorio del motor cortiq: https://github.com/infosave2007/cmf
- Imagen de ejemplo (acuario three.js): https://huggingface.co/infosave/Hy4-flash-Fast-Code-cmf/resolve/main/assets/aquarium_fast_code.png
- Gráfica de decodificación por tamaño de tarjeta: https://huggingface.co/infosave/Hy4-flash-Fast-Code-cmf/resolve/main/assets/fc_cuda_en.png
