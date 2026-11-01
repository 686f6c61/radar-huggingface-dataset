# 4E-AI/Fidel2.0-1B-GGUF

## Resumen

Fidel2.0-1B-GGUF es la exportación en formato GGUF del modelo Fidel 2.0, un modelo compacto de 1B de parámetros desarrollado por 4E-AI y especializado en programación competitiva. El modelo combina modelado de secuencias Mamba3 MIMO, un bloque de atención y una mezcla latente de expertos (MoE), y está diseñado para resolver problemas de programación, generar soluciones algorítmicas y revisar código mediante retroalimentación de ejecución suministrada por una aplicación externa.

La relevancia de esta ficha radica en que se trata de una exportación sin pérdida (lossless) que conserva la receta numérica original del modelo, incluyendo un blend de 0.25 y precisión mixta BF16/FP32, algo que una cuantización weight-only convencional no puede reproducir. El repositorio incluye además backends nativos para Linux y Windows compatibles con Unsloth Studio, ya que la arquitectura personalizada `fidel2` no es ejecutable por llama.cpp estándar. Con una ventana de contexto combinada de entrada/salida de 8.192 tokens y licencia Apache-2.0, es una opción interesante para ejecución local en GPUs de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida personalizada (`fidel2`): 8 bloques Mamba3 MIMO + 1 bloque de atención, con MoE latente |
| Parámetros totales | 1B (aproximado, según denominación del modelo; cifra exacta no disponible) |
| Parametros activos | 2 de 16 expertos seleccionados por token (solo MoE; cifra exacta de parámetros activos no disponible) |
| Longitud de contexto | 8.192 tokens (combinada entrada/salida) |
| Tipos de cuantización | Precisión mixta original BF16/FP32 (lossless), valores booleanos como I8; sin variantes Q4/Q5/Q8 publicadas |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (5.396.953.024 bytes, aproximadamente 5,40 GB) |

## Arquitectura y entrenamiento

Fidel 2.0 emplea una arquitectura híbrida personalizada de 9 capas backbone: ocho bloques Mamba3 MIMO (modelado de secuencias estado-espacio) y un bloque de atención, con dimensión oculta de 1.536. Cada capa incorpora una mezcla latente de expertos (MoE) con 16 expertos por capa, de los cuales se seleccionan 2 por token mediante enrutamiento. El vocabulario tiene un tamaño de 131.072 tokens. Una característica distintiva es la receta numérica dependiente de las activaciones: el cómputo y las rutas de blend separadas con factor 0.25 forman parte de la ejecución nativa, por lo que una cuantización weight-only genérica no reproduce los resultados originales.

El modelo fue entrenado con el dataset 4E-AI/Fidel-Competitive-coding, centrado en programación competitiva. No se ha publicado información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni el uso de técnicas de alineación como RLHF o DPO. En cuanto a inferencia, el modelo soporta caché híbrida: estado Mamba acotado, KV cache de atención y estado de prompt fijo, lo que permite decodificación incremental.

## Capacidades

- Generación de texto y código, con especialización en programación competitiva: problemas de algoritmos y estructuras de datos.
- Revisión de código guiada por retroalimentación de ejecución suministrada por una aplicación externa (feedback-guided revision).
- Resolución de problemas algorítmicos de tipo competición.
- Decodificación incremental gracias a la caché híbrida (estado Mamba + KV cache + estado de prompt fijo).
- Streaming de salida y cancelación de peticiones, validados mediante 27 comprobaciones de integración en el backend de Unsloth Studio.
- Soporte de plantilla de chat original y KV cache en F32 en el runtime de Studio.
- No se ha publicado información sobre tool calling, capacidades de agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Resolución de problemas de programación competitiva: el modelo puede generar soluciones algorítmicas a enunciados tipo Codeforces o LeetCode, su caso de uso principal por diseño y datos de entrenamiento.
- Revisión iterativa de código con feedback de ejecución: una aplicación puede ejecutar el código generado, pasar los resultados (errores de compilación, fallos en tests) de vuelta al modelo y obtener una versión corregida, aprovechando su diseño para revisión guiada por ejecución.
- Asistente de algoritmos y estructuras de datos local: al ejecutarse en una GPU de 6 GB con streaming de pesos, permite consultas offline de algoritmos sin depender de servicios en la nube.
- Integración en editores o IDEs vía Unsloth Studio: el backend nativo soporta streaming, cancelación y aislamiento de peticiones, adecuado para autocompletado o generación de soluciones dentro del flujo de trabajo.
- Generación de código en inglés con vocabulario amplio: con 131.072 tokens de vocabulario, maneja bien identificadores, palabras clave y sintaxis de lenguajes de programación.
- Prototipado de arquitecturas híbridas SSM+MoE: investigadores pueden estudiar el comportamiento de una arquitectura Mamba3 MIMO con MoE latente en un modelo compacto y de pesos abiertos.
- Evaluación de recetas numéricas no convencionales: la exportación lossless con blend 0.25 permite reproducir exactamente el comportamiento del modelo original, útil para validar runtimes personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (datos medidos por el autor):
  - Linux con pesos residentes: 9.380 MiB (aproximadamente 9,2 GiB) en una prueba corta de generación con límite de 1.024 tokens en una NVIDIA L4 de 24 GB. La corrección a contexto completo hasta 8.192 tokens se verificó por separado.
  - Windows con streaming de pesos (`--fidel-low-vram`): 3.084 MiB (aproximadamente 3,0 GiB) de uso total de GPU durante las comprobaciones, incluyendo overhead de escritorio y runtime, con contexto de 1.024 tokens.
- GPUs validadas: NVIDIA L4 (Linux, Ubuntu 24.04) y RTX 4050 Laptop de 6 GB (Windows nativo).
- Cabe en GPUs de consumo: sí. En Windows, una RTX 4050 Laptop de 6 GB ejecuta el modelo con la opción `--fit off --fidel-low-vram` y contexto de 1.024 tokens, aunque el streaming de pesos sacrifica velocidad por menor VRAM. Para contexto completo de 8.192 tokens se recomienda una GPU con VRAM holgada (la L4 de 24 GB fue la plataforma validada).
- Opciones de despliegue: exclusivamente el backend nativo incluido en el repositorio (fidel-native-linux-x86_64 y fidel-native-windows-x86_64) integrado con Unsloth Studio. llama.cpp estándar, vLLM, Ollama y TGI no soportan la arquitectura personalizada `fidel2`.
- Latencia y throughput: no disponible. El streaming de pesos reduce la velocidad de generación respecto al modo residente, pero no hay cifras publicadas.
- Importante: los 5,40 GB de descarga no equivalen al requisito total de VRAM; contexto, buffers temporales y otras aplicaciones pueden aumentar el consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Fidel2.0-1B | 1B | Híbrida Mamba3 MIMO + atención + MoE latente (16 expertos, 2 activos) | 8.192 | Apache-2.0 | Programación competitiva |
| Qwen2.5-Coder-1.5B | 1,5B | Transformer decoder denso | 32.768 (ampliable a 131.072) | Qwen Research (uso comercial condicionado) | Código general |
| DeepSeek-Coder-1.3B | 1,3B | Transformer decoder denso | 16.384 | Licencia propia (uso comercial restringido) | Código general |

Fidel2.0-1B se distingue por su arquitectura híbrida SSM+MoE y su especialización en programación competitiva con revisión guiada por ejecución, frente a los modelos de código generales densos de tamaño similar. Su principal desventaja práctica es la dependencia de un backend propietario incluido en el repositorio, mientras que las alternativas funcionan con runtimes estándar (llama.cpp, vLLM, Ollama). No hay datos de benchmarks que permitan comparar rendimiento medido.

## Limitaciones y advertencias

- Arquitectura no soportada por runtimes estándar: llama.cpp, vLLM, Ollama y TGI no pueden ejecutar la arquitectura `fidel2`; es obligatorio usar el backend nativo incluido en el repositorio.
- Sin variantes cuantizadas: solo existe una variante de precisión mixta lossless de 5,40 GB; no hay versiones Q4/Q8 que reduzcan la huella de memoria, y la receta numérica dependiente de activaciones impide una cuantización weight-only genérica.
- Contexto combinado de 8.192 tokens: limitado frente a modelos de código actuales con 32.768 o más tokens; en configuraciones de VRAM baja el preset recomendado es de solo 1.024 tokens.
- Idioma: el modelo está catalogado únicamente para inglés; no hay soporte declarado para castellano ni otros idiomas.
- Alcance especializado: el entrenamiento se centra en programación competitiva; el rendimiento en tareas de código general, conversación o razonamiento no algorítmico no está documentado.
- Requisitos de VRAM no garantizados: las cifras de memoria son observaciones muestreadas, no mínimos garantizados; el uso real puede variar con el contexto y la carga del sistema.
- Sesgos, riesgo de alucinación y evaluaciones de seguridad: no disponible; no se ha publicado información al respecto.
- Licencia: Apache-2.0, sin restricciones conocidas para uso comercial.
- Procedencia poco establecida: el modelo tiene pocas descargas (515) y sin likes en HuggingFace, sin benchmarks públicos ni auditorías de terceros; conviene validar los resultados generados antes de usarlos en producción.

## Enlaces

- Modelo GGUF: https://huggingface.co/4E-AI/Fidel2.0-1B-GGUF
- Modelo base: https://huggingface.co/4E-AI/Fidel2.0-1B
- Archivo GGUF: https://huggingface.co/4E-AI/Fidel2.0-1B-GGUF/resolve/main/Fidel2.0-1B.gguf
- Backend Linux: https://huggingface.co/4E-AI/Fidel2.0-1B-GGUF/resolve/main/backend/fidel-native-linux-x86_64.tar.gz
- Backend Windows: https://huggingface.co/4E-AI/Fidel2.0-1B-GGUF/resolve/main/backend/fidel-native-windows-x86_64.zip
- Manifest Linux: https://huggingface.co/4E-AI/Fidel2.0-1B-GGUF/blob/main/backend/manifest.json
- Manifest Windows: https://huggingface.co/4E-AI/Fidel2.0-1B-GGUF/blob/main/backend/windows_manifest.json
- Sumas de verificación: https://huggingface.co/4E-AI/Fidel2.0-1B-GGUF/blob/main/SHA256SUMS
- Documentación de configuración en Studio: https://huggingface.co/4E-AI/Fidel2.0-1B-GGUF/blob/main/docs/STUDIO.md
- Documentación de validación: https://huggingface.co/4E-AI/Fidel2.0-1B-GGUF/blob/main/docs/VALIDATION.md
- Dataset de entrenamiento: https://huggingface.co/datasets/4E-AI/Fidel-Competitive-coding
