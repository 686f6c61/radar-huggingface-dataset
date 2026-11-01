# bacillad/SkinTokens-GGUF

## Resumen

SkinTokens-GGUF es la conversión al formato GGUF del modelo SkinTokens, desarrollado originalmente por VAST-AI. SkinTokens no es un modelo de lenguaje: es un sistema de rigging automático que, a partir de una malla estática, predice un esqueleto y los pesos de skinning (asignación vértice-hueso) necesarios para deformar esa superficie durante una animación. Resuelve el problema del rigging manual, que tradicionalmente requiere artistas técnicos y horas de trabajo por personaje.

La conversión la firma el usuario bacillad y está pensada para `skin-tokens.cpp`, una implementación en C++23 sobre GGML con soporte de CPU y Vulkan de los dos componentes del sistema (TokenRig y SkinVAE). No se ha reentrenado nada: es un cambio de formato y precisión. El conjunto de pesos suma unos 28,8 millones de parámetros y se distribuye en tres ficheros GGUF que deben mantenerse juntos, ya que el runtime verifica sus identidades embebidas al cargar.

La relevancia de esta conversión es práctica: permite ejecutar el rigging de SkinTokens sin el stack de Python ni el runtime original, sobre CPU o GPU Vulkan, con un único binario de línea de comandos. Existen dos bundles, F16 (distribución normal) y F32 (referencia numérica para tareas de paridad CPU/Vulkan).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de tres componentes: encoder de puntos Michelangelo (mesh-encoder), política TokenRig basada en Qwen3-0.6B, y encoder/decoder SkinVAE (SkinTokens) |
| Parametros totales | 28.848.384 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 y F32 (sin cuantizaciones de menor precisión publicadas) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural; trabaja con mallas 3D) |
| Licencia | MIT |
| Formato de pesos | GGUF (bundles F16 y F32) |

## Arquitectura y entrenamiento

SkinTokens combina tres piezas. En primer lugar, un encoder de nubes de puntos basado en Michelangelo que procesa la malla de entrada. En segundo lugar, una política TokenRig construida sobre Qwen3-0.6B, que genera tokens correspondientes a la estructura del esqueleto. En tercer lugar, un encoder/decoder SkinVAE que produce los pesos de skinning condicionados por la malla y el esqueleto. El resultado conjunto es un rig completo (huesos y pesos) para una malla arbitraria, sin depender de Trellis2, Kimodo ni de otro runtime de modelo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card de esta conversión remite a la fuente original para esos detalles. La innovación destacable de esta distribución no está en la arquitectura, sino en el empaquetado: los tres componentes se convierten a GGUF y se ejecutan sobre GGML en C++23, con backend CPU y Vulkan, y el runtime comprueba en carga las identidades de origen embebidas en cada fichero para garantizar la coherencia del bundle.

## Capacidades

- Predicción de esqueleto a partir de una malla estática arbitraria.
- Predicción de pesos de skinning (vértice a hueso) aprendidos para esa malla.
- Rigging de extremo a extremo con un solo comando, generando esqueleto y pesos en una pasada.
- Flujo alternativo que acepta un esqueleto existente cuando se necesita conservar una jerarquía de animación concreta.
- Ejecución sobre CPU y sobre GPU mediante Vulkan.
- Postprocesado opcional de los resultados (`--postprocess`).
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Rigging automático de personajes en pipelines de videojuegos: se toma una malla de personaje en GLB, se ejecuta `skintokens-cli rig` y se obtiene una malla con esqueleto y pesos lista para animar, reduciendo el trabajo manual de un artista técnico.
- Prototipado rápido de assets 3D: para validar un personaje antes de invertir en rigging manual, se genera un rig aproximado en segundos o minutos sobre CPU y se itera sobre la malla.
- Retargeting sobre jerarquías existentes: usando el flujo de binding de `skin-tokens.cpp` con un esqueleto predefinido, se calculan pesos compatibles con una jerarquía de animación ya establecida.
- Herramientas de autoría integradas en DCC: el binario C++ con backend Vulkan puede embeberse en herramientas de escritorio que necesiten rigging sin depender de Python ni de un runtime de modelo pesado.
- Procesado por lotes de catálogos de mallas: al ejecutarse en CPU y con un modelo de 28,8 M de parámetros, es viable riggear lotes grandes de mallas en servidores sin GPU dedicada.
- Verificación de paridad numérica en desarrollo de runtimes: el bundle F32 sirve como referencia para validar implementaciones GGML propias contra los resultados del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El bundle F16 ocupa 57,8 MB (mesh-encoder) + 948,6 MB (tokenrig) + 244,0 MB (skin-vae), aproximadamente 1,25 GB en disco; el F32 suma unos 2,38 GB.
- Al tratarse de un modelo de 28,8 M de parámetros con un componente de 0.6B, la inferencia cabe holgadamente en memoria de CPU; la VRAM necesaria para el backend Vulkan no está especificada en la información disponible.
- GPU recomendadas: no disponible; el backend documentado es Vulkan, por lo que cualquier GPU con soporte Vulkan es candidata, pero no hay lista de modelos validados.
- Cabe en GPU de consumo con toda probabilidad dado el tamaño, pero no se confirma en la información disponible.
- Despliegue: `skin-tokens.cpp` (CLI `skintokens-cli`), con backend CPU y Vulkan. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| SkinTokens-GGUF (esta ficha) | 28,8 M | no aplica | Rigging automático (esqueleto + pesos) | MIT | GGUF |
| VAST-AI/SkinTokens | no disponible | no aplica | Rigging automático | MIT | safetensors |
| Alternativas de rigging automático | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de rigging automático en la documentación proporcionada. La comparación más directa es con el modelo original VAST-AI/SkinTokens, del que esta distribución es una conversión de formato y precisión sin reentrenamiento.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo reentrenado: hereda cualquier limitación del modelo original en cuanto a calidad de esqueletos y pesos.
- Los tres ficheros GGUF de cada bundle deben mantenerse juntos; el runtime verifica identidades embebidas y fallará si se mezclan versiones o precisiones.
- Solo se publican F16 y F32; no hay cuantizaciones de menor tamaño, por lo que no se reduce más el espacio en disco.
- No procesa lenguaje natural ni tiene capacidades de texto, código, visión o tool calling; cualquier expectativa en ese sentido es un error de categoría.
- Riesgo de artefactos en mallas atípicas (topologías no manifold, mallas con partes desconectadas) no documentado en la información disponible.
- La licencia MIT del modelo original se mantiene, pero conviene verificar los términos de la model card de VAST-AI/SkinTokens para uso comercial y citación.
- La información sobre latencia, VRAM y GPUs validadas no está publicada; cualquier despliegue en producción requiere medición propia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bacillad/SkinTokens-GGUF
- Modelo original: https://huggingface.co/VAST-AI/SkinTokens
- Runtime C++: https://github.com/localai-org/skin-tokens.cpp
- Código de conversión y referencia: repositorio `VAST-AI-Research/SkinTokens` (revisión `273b691d35989d71cd17ff2895fdc735097b92d1`)
