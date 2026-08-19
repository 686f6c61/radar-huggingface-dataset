# ayourtch/ARustyCoder93

## Resumen

ARustyCoder93 es un modelo derivado de DeepSeek-V4-Flash mediante poda de expertos (expert pruning). Se trata de un corte de 93 de los 256 expertos enrutados por capa, conservando el enrutamiento top-6 original, y empaquetado en formato GGUF para su ejecución local con llama.cpp. El objetivo declarado es permitir codificación agéntica en una única GPU de 96 GB con contexto largo, algo que el modelo completo no puede hacer en ese hardware. No es un lanzamiento oficial de DeepSeek, sino un experimento de la comunidad que resultó útil para tareas interactivas de programación.

El modelo hereda la licencia MIT de DeepSeek-V4-Flash y los tensores conservados son byte-idénticos a la versión cuantizada de antirez (MXFP4 experts, Q8 attention/shared/output, F16 compressor/indexer). Con 107.918.591.711 parámetros totales y una ventana de contexto de 262.144 tokens, ofrece una huella de memoria de aproximadamente 67 GB en inferencia, con un rendimiento medido de ~46 tokens/s en decodificación y ~470 tokens/s en procesamiento de prompt sobre una RTX PRO 6000. Su relevancia actual radica en que demuestra una vía práctica para ejecutar modelos de codificación de gran tamaño en hardware de consumo mediante poda selectiva de expertos, sin necesidad de reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con enrutamiento top-6, 43 capas MoE |
| Parametros totales | 107.918.591.711 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Expertos en MXFP4, atención/compartidos/salida en Q8, compresor/indexador en F16 |
| Idiomas soportados | no especificado (orientado a código, probablemente multilingüe, pero no documentado) |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo `arustycoder93.gguf`, 62.213.283.424 bytes) |

## Arquitectura y entrenamiento

La arquitectura base es DeepSeek-V4-Flash, un modelo MoE con 256 expertos enrutados por capa y enrutamiento top-6. ARustyCoder93 mantiene 93 expertos por capa (media 87,3, con relleno a 93 en capas menores mediante fusión de rangos), eliminando el resto. El proceso de poda se basó en dos censos "grow-from-nothing": se partía de 8 expertos aleatorios por capa con el router completo de 256 vías conservado como tensores laterales, se registraba qué expertos prefería el router, y se reconstruía en pasos de 16, 32 y 64. Uno de los censos usó un corpus de código/sistemas y otro un corpus general; el modelo final es la unión de los dos conjuntos de 64 expertos resultantes. Cada conjunto por separado predice texto mantenido pero no puede completar generación; la unión sí puede. No se realizó entrenamiento adicional, solo poda y reconstrucción de pesos. El método completo, scripts y parche de llama.cpp están documentados en el repositorio del proyecto.

## Capacidades

- Generación de código en múltiples lenguajes: el autor reporta éxito en escribir Rust, corregir Python, explicar C, refactorizar JavaScript y generar un plan multi-archivo.
- Tool calling / function calling: soportado, verificado en una de las pruebas de humo.
- Razonamiento multi-paso: capaz de producir planes de varios pasos para tareas de programación.
- Contexto largo: ventana de 262.144 tokens, adecuada para repositorios grandes o conversaciones extensas.
- Capacidad de agente: diseñado para codificación agéntica local, con soporte de llama.cpp para servidores de inferencia.
- Multilingüismo: no documentado explícitamente; se asume herencia del modelo base, pero sin confirmación.

## Casos de uso

- Asistente de codificación local en IDE: el modelo puede ejecutarse con `llama-server` y conectarse a editores como VS Code o Neovim para autocompletado y chat contextual, gracias a su ventana de 256K tokens y su capacidad de tool calling.
- Refactorización automatizada de código: con su habilidad para explicar y modificar código en varios lenguajes, puede proponer refactorizaciones de funciones o módulos completos, como se demostró con JavaScript.
- Corrección de errores en repositorios existentes: dado un error de compilación o una traza, puede identificar la causa y generar el parche, como en el caso de Python reportado.
- Generación de planes de implementación multi-archivo: útil para descomponer una feature en cambios distribuidos en varios ficheros, indicando qué tocar y en qué orden.
- Automatización de tareas de mantenimiento: puede generar scripts, documentación técnica o comentarios a partir de código fuente, aprovechando su entrenamiento en corpus de sistemas.
- Prototipado rápido de herramientas de línea de comandos: su capacidad para escribir Rust y otros lenguajes de sistemas permite generar utilidades CLI funcionales en una sola pasada, siempre que la tarea no sea demasiado compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta pruebas de humo informales: 6 de 6 peticiones de codificación completadas correctamente (escribir Rust, corregir Python, explicar C, refactorizar JavaScript, una llamada a herramienta y un plan multi-archivo), con longitudes de completado entre 86 y 1993 tokens. También documenta un fallo conocido: una petición de caché LRU genérica cayó en un bucle de repetición hasta un tope de 12k tokens. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada: ~67 GB residentes con contexto de 262.144 tokens, según medición del autor en una RTX PRO 6000 (96 GB).
- GPU recomendadas: RTX PRO 6000, A100 80GB, H100 80GB o similar con al menos 80 GB de VRAM. No cabe en GPUs de consumo de 24 GB (RTX 4090, etc.) sin cuantización adicional, que no está disponible.
- Opciones de despliegue: llama.cpp (llama-server) en su versión stock a partir del commit `22b8e31` (2026-08-15). También compatible con cualquier backend que soporte GGUF, como Ollama o LM Studio, aunque no está verificado.
- Rendimiento medido: ~46 tokens/s en decodificación y ~470 tokens/s en procesamiento de prompt con `llama-server -m arustycoder93.gguf -ngl 99 -c 262144 -fa on`.
- Latencia: no se especifica, pero el throughput de decodificación sugiere latencia de ~22 ms por token en generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ARustyCoder93 | 107.9B (93/256 expertos) | 262.144 | MIT | Podado de DeepSeek-V4-Flash, GGUF, para codificación local |
| DeepSeek-V4-Flash (original) | 107.9B (256 expertos) | 262.144 | MIT | Modelo completo, requiere más VRAM, sin poda |
| antirez/deepseek-v4-gguf | 107.9B (256 expertos) | 262.144 | MIT | Cuantización MXFP4/Q8 del original, fuente de los tensores |

No se dispone de comparativas con otros modelos de codificación de tamaño similar (p. ej., Qwen2.5-Coder-32B o CodeLlama-70B) porque no se han publicado benchmarks. La comparación directa con el modelo base es la más relevante: ARustyCoder93 sacrifica capacidad de razonamiento en tareas difíciles (evidenciado por el bucle de repetición) a cambio de una huella de memoria reducida que permite ejecución en una GPU de 96 GB.

## Limitaciones y advertencias

- Riesgo de bucles de repetición: en razonamiento complejo de una sola pasada, el modelo puede caer en repetición verbatim hasta un tope de 12k tokens, como se documentó con la tarea de caché LRU. Un sampler DRY detiene el bucle pero corrompe identificadores en el código generado.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval, etc. El rendimiento real en tareas de codificación es anecdótico y no verificado de forma sistemática.
- Uso experimental: el autor lo describe como "un experimento que resultó útil para codificación interactiva", no como un modelo listo para producción. Se recomienda usar el modelo sin podar cuando la corrección sea crítica.
- No es un lanzamiento oficial de DeepSeek: es un derivado comunitario; DeepSeek no lo respalda ni lo ha evaluado.
- Limitaciones de idioma: no se especifican idiomas soportados; se asume herencia del modelo base, pero sin garantía.
- Requisitos de hardware elevados: aunque reducido, sigue necesitando ~67 GB de VRAM, lo que excluye GPUs de consumo estándar.
- Restricciones de licencia: MIT permite uso comercial, pero la atribución a DeepSeek y al proyecto de poda debe mantenerse según los términos de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ayourtch/ARustyCoder93
- Repositorio del proyecto (receta, scripts, parche, checksums): https://github.com/apchat-agent/arustycoder
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Fuente GGUF cuantizada: https://huggingface.co/antirez/deepseek-v4-gguf
