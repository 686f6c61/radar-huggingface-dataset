# jalenluorion/Qwen3.8-Flash-Next-prefetchable-store

## Resumen

Qwen3.8-Flash-Next-prefetchable-store es un reempaquetado del modelo Qwen/Qwen3.8-Flash-Next (aproximadamente 180.000 millones de parametros) realizado por el usuario jalenluorion, orientado a ejecutar el modelo en equipos Apple Silicon con solo 16 GB de memoria unificada. La innovacion principal consiste en mantener en disco los expertos enrutados (120,8B de parametros, 63,4 GiB) y una memoria n-gram (51,2B de parametros, 48,3 GiB), dejando en memoria unicamente unos 4,9B de parametros residentes mas un conjunto de routers auxiliares de 576M. El resultado es un modelo que ocupa unos 9 GB de RAM y genera 5,7 tokens/s en un prompt de benchmark y 4,6 tokens/s en una sesion de agente con OpenCode.

El modelo base es una arquitectura de mezcla de expertos (MoE) con 48 capas: 36 capas Gated DeltaNet y 12 capas de atencion dispersa. Cada token activa 10 de 512 expertos por capa, lo que supone 1,27 GB de lecturas de expertos por token antes de reutilizacion. El autor ha sustituido el enrutamiento original por routers ligeros (lag-4) que predicen, cuatro capas antes, que expertos necesitara una capa, permitiendo precargar desde el SSD mientras las capas intermedias calculan. Los pesos liberados estan congelados y cuantizados: expertos a 4 bits y memoria n-gram a 8 bits.

La relevancia de esta ficha radica en que demuestra una via practica para servir modelos de escala 180B en hardware de consumo mediante offloading selectivo a almacenamiento, con una penalizacion de calidad medida y acotada (incremento de perdida de +0,027 nats en wikitext-103 respecto al modelo bf16 original). La licencia es Qwen Community License 1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 48 capas: 36 Gated DeltaNet + 12 atencion dispersa; enrutamiento lag-4 con routers auxiliares |
| Parametros totales | ~180B (4,9B residentes + 576M routers + 120,8B expertos enrutados + 51,2B memoria n-gram) |
| Parametros activos | 10 de 512 expertos por capa en 48 capas |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos a 4 bits (escala y sesgo fp16 por grupo de 64); memoria n-gram a 8 bits (escala fp16 por fila); pesos residentes a 8 bits en Mac de 16 GB; routers a fp16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (resident.safetensors, bf16), .npz (routers_k4.npz), .bin (store/layer_XX.bin, ngram/part_PP.bin) |

## Arquitectura y entrenamiento

El modelo base combina 36 capas Gated DeltaNet con 12 capas de atencion dispersa en una arquitectura MoE de 48 capas. En la version original, el router de cada capa selecciona los expertos a partir del estado oculto de esa misma capa, lo que obliga a mantener todos los expertos en memoria. Este reempaquetado introduce routers auxiliares (lag-4) que leen el estado del token cuatro capas antes y nombran los expertos que la capa necesitara, de modo que el SSD puede leerlos mientras las cuatro capas intermedias computan. El router original sigue tomando la decision final entre los expertos ya cargados.

Los unicos componentes entrenados son estos routers lag-4, entrenados para imitar a los routers originales con el modelo congelado, sobre 20,5 millones de tokens de wikitext-103, FineWeb-Edu y UltraChat. Los pesos liberados se congelan y cuantizan (expertos a 4 bits, memoria n-gram a 8 bits). La memoria n-gram es una tabla hash: cada token consulta 16 filas cuyas direcciones dependen unicamente de los ids de tokens previos, por lo que se leen en el momento del muestreo. Existen dos modos de ejecucion: prefetch (por defecto), donde ningun experto se lee durante el computo de la capa y el router original elige entre lo disponible en memoria; y exacto (`--mode exact`), donde se respeta siempre la eleccion del router original leyendo lo que falte cuando se necesita. El cabezal de prediccion multi-token y la torre de vision de la release original no estan incluidos.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Ejecucion de sesiones de agente mediante API compatible con OpenAI (integracion demostrada con OpenCode).
- Soporte de tool calling y function calling (heredado del modelo base; no medido en esta version).
- Razonamiento multi-paso y trazas de pensamiento (no evaluadas en esta version).
- Capacidades multilingues del modelo base (idiomas concretos no disponibles).
- Memoria n-gram de 51,2B de parametros para modelado de secuencias largas.
- Modo de precarga (prefetch) y modo exacto para reproducir la salida del modelo original cuantizado.
- Sin vision: la torre de vision de la release no esta incluida.
- Sin cabezal de prediccion multi-token.

## Casos de uso

- Inferencia local de un modelo de escala 180B en MacBook de 16 GB: el modelo ocupa unos 9 GB de RAM y deja el resto de expertos en SSD, permitiendo ejecutar un modelo que de otro modo requeriria multiples GPU de 80 GB. Adecuado para desarrolladores que quieran probar capacidades de un modelo grande sin infraestructura de servidor.
- Sesiones de agente en local: la integracion con OpenCode y la API compatible con OpenAI permiten lanzar agentes de codigo que ejecutan tool calls a 4,6 tokens/s, suficiente para tareas interactivas no intensivas en latencia.
- Prototipado y evaluacion de tecnicas de offloading: el repositorio incluye el runner `mlx_run.py` y el motor `dmeng` en C++, lo que facilita experimentar con modos prefetch/exacto, `--keep` y `--max-slots` para estudiar el compromiso entre latencia y calidad.
- Educacion e investigacion sobre MoE: la separacion explicita entre expertos residentes, expertos en disco y routers auxiliares permite inspeccionar el comportamiento del enrutamiento y medir el coste de elegir expertos con antelacion.
- Despliegue en iPhone: el mismo motor `dmeng` ejecuta variantes como Qwen3.6-35B-A3B e Inkling 2 Mini en iPhone, por lo que este formato sirve de base para llevar modelos grandes a dispositivos moviles.
- Generacion de texto por lotes en estaciones de trabajo Apple Silicon: con 140 GB de disco libre y 16 GB o mas de RAM unificada, se pueden procesar prompts largos con `--max-new` alto sin depender de GPU dedicada.
- Benchmarking de cuantizacion: el autor publica el gap de perdida por configuracion, lo que permite usar el modelo como referencia para comparar estrategias de cuantizacion a 4 y 8 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta metricas de perdida y de velocidad:

| Metrica | Valor |
|---|---|
| Perdida bf16 original (wikitext-103 / FineWeb-Edu / UltraChat) | 1,611 / 2,089 / 1,828 nats |
| Gap con expertos a 4 bits | +0,013 / +0,007 / -0,028 nats |
| Gap con memoria n-gram a 8 bits | +0,014 / +0,008 / -0,026 nats |
| Gap con pesos residentes a 8 bits | +0,014 / +0,008 / -0,037 nats |
| Gap con routers lag-4 (10 nombrados, 3 retenidos, 24 slots) | +0,027 / +0,019 / -0,008 nats |
| Coste de elegir con antelacion (frente a modelo cuantizado con todos los expertos en memoria) | +0,011 / +0,011 / +0,019 nats |
| Velocidad en prompt de benchmark | 5,7 tokens/s |
| Velocidad en sesion de agente (OpenCode) | 4,6 tokens/s |
| Memoria en uso en Mac de 16 GB | ~9 GB |
| Lecturas de expertos por token | 1,27 GB antes de reutilizacion |
| Precision de redondeo 4 bits por elemento | 9,2-9,6 % RMS relativo |

## Requisitos de hardware

- VRAM/RAM estimada: unos 9 GB de memoria en un Mac de 16 GB; 4,3 GiB de cache de pesos residentes cuantizados a 8 bits generada en la primera carga.
- Almacenamiento: aproximadamente 140 GB de disco libre (descarga de 123 GiB mas 4,3 GiB de cache).
- GPU recomendadas: Apple Silicon con 16 GB o mas de memoria unificada. No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) en esta version; la libreria declarada es mlx.
- Cabe en GPU de consumo: si, en Apple Silicon de 16 GB; en el resto de plataformas no hay soporte documentado.
- Opciones de despliegue: runner `mlx_run.py` del repositorio `prefetchable-store/reference/flash`; demo con API compatible con OpenAI en `demo/demo.sh`; motor `dmeng` en C++ para otras variantes. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 5,7 tokens/s en prompt de benchmark y 4,6 tokens/s en sesion de agente; el autor advierte que en maquinas de 16 GB conviene cerrar otras aplicaciones porque macOS empieza a comprimir memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-prefetchable-store | ~180B (4,9B residentes + 576M routers + 120,8B expertos + 51,2B n-gram) | no disponible | qwen-community-1.0 | Hugging Face (922 descargas) | Offloading a SSD, 9 GB RAM, 5,7 tok/s en Mac de 16 GB |
| Qwen/Qwen3.8-Flash-Next (original) | ~180B | no disponible | qwen-community-1.0 | Hugging Face | Requiere mantener todos los expertos en memoria; referencia de calidad bf16 |
| Qwen3-Next-80B-A3B-moved-store | 80B | no disponible | no disponible | Hugging Face (mismo autor) | Misma tecnica de offloading, menor escala |
| Qwen3-Coder-Next-moved-store | no disponible | no disponible | no disponible | Hugging Face (mismo autor) | Variante orientada a codigo con la misma tecnica |
| Qwen3-30B-A3B-moved-store | 30B | no disponible | no disponible | Hugging Face (mismo autor) | Variante mas pequena para hardware limitado |

## Limitaciones y advertencias

- El gap de calidad frente al modelo bf16 es medido solo en perdida sobre wikitext-103, FineWeb-Edu y UltraChat; no se han evaluado trazas de pensamiento, codigo, tool calls ni benchmarks de tarea.
- El conjunto de chat sale por debajo del modelo original tras la cuantizacion; el autor no lo explica y no lo interpreta como mejora.
- El gap por ventana tiene ruido bilateral amplio (chat: mediana +0,016, desviacion estandar 0,133 sobre 128 ventanas), por lo que las medias ocultan variabilidad considerable.
- El redondeo a 4 bits de un registro de experto supone un 9,2-9,6 % de RMS relativo por elemento.
- La torre de vision y el cabezal de prediccion multi-token de la release original no estan incluidos: no hay capacidades multimodales.
- El modo prefetch puede producir salidas ligeramente distintas al modelo original si los routers lag-4 nombran expertos incorrectos; solo el modo exacto garantiza la salida del modelo cuantizado original.
- En maquinas de 16 GB hay que cerrar otras aplicaciones: el modelo ocupa unos 9 GB y macOS empieza a comprimir memoria cuando el resto del sistema demanda mas de lo disponible.
- Requiere aproximadamente 140 GB de disco libre y una descarga de 123 GiB.
- Licencia qwen-community-1.0: es necesario revisar sus terminos para uso comercial, ya que no es una licencia permisiva estandar.
- No se documentan idiomas soportados ni longitud de contexto en la informacion disponible.
- Riesgo de alucinacion y sesgos del modelo base no evaluados en esta version.
- El repositorio tiene 0 likes y 922 descargas, con ultima actualizacion en noviembre de 2026; se trata de un artefacto de investigacion mas que de un modelo listo para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jalenluorion/Qwen3.8-Flash-Next-prefetchable-store
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del autor (codigo, runner y demo): https://github.com/jalenluorion/prefetchable-store
- Variante Qwen3-Next-80B-A3B: https://huggingface.co/jalenluorion/Qwen3-Next-80B-A3B-moved-store
- Variante Qwen3-Coder-Next: https://huggingface.co/jalenluorion/Qwen3-Coder-Next-moved-store
- Variante Qwen3-30B-A3B: https://huggingface.co/jalenluorion/Qwen3-30B-A3B-moved-store
- Variante Qwen3.6-35B-A3B: https://huggingface.co/jalenluorion/Qwen3.6-35B-A3B-prefetchable-store
- Variante Inkling 2 Mini: https://huggingface.co/jalenluorion/Inkling-2-Mini-prefetchable-store
