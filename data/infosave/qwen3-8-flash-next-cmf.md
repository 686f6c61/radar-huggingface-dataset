# infosave/Qwen3.8-Flash-Next-cmf

## Resumen

Qwen3.8-Flash-Next-cmf es una distribución cuantizada en formato CMF del modelo Qwen3.8-Flash-Next, publicado por el usuario infosave. El modelo base es un transformer híbrido de tipo mezcla de expertos (MoE) desarrollado por Qwen (Alibaba), con 125.000 millones de parámetros totales y 6.000 millones activos por token, que combina 36 capas Gated DeltaNet con 12 capas de atención dispersa, 512 expertos por capa, una tabla de n-gramas de 51.000 millones de parámetros y una ventana de contexto de 262.144 tokens.

La aportación de esta ficha no es el modelo en sí, sino el formato de pesos CMF y el motor de inferencia `cortiq`, escrito en Rust sin dependencias de Python. Los expertos se transmiten por streaming desde un archivo mapeado en memoria a medida que los tokens los necesitan, lo que permite ejecutar un archivo de 77 GB en una única GPU de consumo con el resto de los pesos en RAM del sistema. El resultado es que un modelo de 125B se puede servir en una RTX 3090 a 49,1 tok/s de decodificación, algo impensable con los formatos y motores convencionales.

La relevancia actual es doble: por un lado, demuestra que la cuantización mixta a 2 y 4 bits por experto, calibrada con GPTQ, conserva calidad utilizable; por otro, propone un camino alternativo a los clústeres multi-GPU para servir modelos MoE grandes, apoyándose en el ancho de banda de disco y RAM en lugar de en VRAM agregada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 36 capas Gated DeltaNet + 12 capas de atención dispersa |
| Parámetros totales | 125.000 millones (modelo base) |
| Parámetros activos | 6.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Mixta: expertos 2-bit (gate/up) + 4-bit (down) en q2tp/q2tp-v2; expertos 4-bit en q4tp; atención, embeddings y cabeza de salida en 8-bit |
| Idiomas soportados | Inglés, ruso, chino |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | CMF (archivos `.cmf`), más perfil de enrutamiento `.profile` y cabeza MTP opcional `.mtp.cmf` |
| Motor de inferencia | `cortiq` (Rust, sin Python), versión mínima 0.8.15 |
| Tamaño del repositorio | 330,5 GB |
| Tamaño de archivo q2tp-v2 | 76,90 GB |
| Tamaño de archivo q4tp | 97,12 GB |
| Backend GPU | Vulkan (probado en RTX 3090, 4090 y 5090) |

## Arquitectura y entrenamiento

El modelo base es un MoE híbrido que intercala 36 capas Gated DeltaNet (un mecanismo de estado recurrente con decaimiento selectivo) con 12 capas de atención dispersa. Cada capa MoE contiene 512 expertos, de los cuales se activan 6.000 millones de parámetros por token. Además incorpora una tabla de n-gramas de 51.000 millones de parámetros y un modo de razonamiento explícito (thinking mode). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada.

La cuantización se realizó a partir del checkpoint en bf16. La variante q2tp-v2 aplica GPTQ sobre los expertos usando como calibración las entradas que cada experto recibe realmente, con 262.144 tokens de calibración y la herramienta `cortiq quantize-moe` (cortiq 0.8.20). La variante q2tp original usa redondeo al más cercano (round-to-nearest) sin calibrar. La innovación operativa es el streaming de expertos desde archivo mapeado en memoria: los 4,57 GB de pesos que usa cada token permanecen en la tarjeta gráfica y el resto del presupuesto de VRAM actúa como caché de los expertos más utilizados, mientras el resto se lee bajo demanda. El perfil `.profile` (98 KB) precalienta esa caché de expertos y mejora el rendimiento de forma notable: en RTX 5090, 81,7 tok/s con perfil frente a 56,5 sin él. También se ofrece una cabeza de predicción multi-token (MTP) para decodificación especulativa, útil en RTX 5090 pero contraproducente en RTX 3090.

## Capacidades

- Generación de texto en inglés, ruso y chino, con calidad medida en perplejidad sobre WikiText-2 y código Rust.
- Razonamiento explícito en modo thinking, desactivable con `--no-think`.
- Generación de código: el ejemplo oficial produce una página funcional de Three.js de 10.930 tokens; la perplejidad sobre código Rust es de 4,438 (q2tp-v2) y 4,111 (q4tp).
- Razonamiento multi-paso y respuestas largas: en pruebas reales genera respuestas de 170-180 tokens sobre relatos, código, SQL y texto en ruso.
- Decodificación especulativa mediante cabeza MTP opcional (hasta 108,6 tok/s en RTX 5090).
- Servidor compatible con la API de OpenAI mediante `cortiq serve`, con el modelo precargado.
- No se documenta soporte de tool calling, function calling, visión, audio ni agentes en la información disponible.

## Casos de uso

- Asistencia de código en estación de trabajo: con una RTX 3090 de 24 GB y 77 GB de disco se puede ejecutar un modelo de 125B para autocompletar y explicar código, con 31,4 tok/s en texto real y una latencia de primer token de 9,9 s sobre un prompt de 1.000 tokens. Adecuado para desarrolladores que quieren calidad de modelo grande sin alquilar GPU de 80 GB.
- Generación de páginas web completas: el ejemplo del acuario 3D en Three.js demuestra la capacidad de producir artefactos de más de 10.000 tokens coherentes; útil para prototipado rápido de front-end con un solo prompt.
- Procesamiento de documentos largos en ruso o chino: la ventana de 262.144 tokens permite resumir o extraer información de contratos, informes o expedientes completos sin trocear, en los tres idiomas soportados.
- Servicio interno de chat con API compatible con OpenAI: mediante `cortiq serve` se expone el modelo a herramientas existentes sin reescribir clientes, manteniendo el modelo cargado para evitar los 10-30 s de carga por invocación.
- Inferencia en hardware de gama alta de consumo para investigación: una RTX 5090 de 32 GB alcanza 81,7 tok/s (108,6 con especulación), suficiente para experimentos interactivos de evaluación de prompts y comparación de variantes de cuantización.
- Despliegue con presupuesto de VRAM restringido: limitando la tarjeta a 12 GB con `CMF_GPU_VRAM_MB=12000` el modelo sigue funcionando a 22,1 tok/s en RTX 3090, lo que permite compartir la GPU con otras cargas.
- Evaluación comparativa de cuantizaciones: los tres archivos (q2tp, q2tp-v2, q4tp) permiten medir el compromiso calidad/velocidad en el mismo hardware, con q4tp a 40,3 tok/s y mejor perplejidad que q2tp.

## Benchmarks y rendimiento

Rendimiento de decodificación medido con `cortiq bench --tokens 120 --core` (greedy), archivo q2tp y `flashnext.profile`, en tok/s:

| GPU | Versión cortiq | Tarjeta completa | Límite 16 GB | Límite 12 GB | Especulativa (tarjeta completa) |
|---|---|---:|---:|---:|---:|
| RTX 3090 (24 GB) | 0.8.15 | 49,1 | 34,6 | 22,1 | 44,3 |
| RTX 5090 (32 GB) | 0.8.8 | 81,7 | 50,5 | 31,4 | 108,6 |
| RTX 4090 (24 GB) | 0.8.7 | 41,9 | 27,2 | 16,3 | 41,4 |
| RTX 5090, q4tp | 0.8.9 | 40,3 | 27,5 | 23,2 | 44,4 |

Perplejidad (menor es mejor) por variante de cuantización:

| Conjunto | q2tp-v2 | q2tp | q4tp |
|---|---:|---:|---:|
| WikiText-2, 12×512 | 6,06 | 7,36 | 5,43 |
| Código Rust, 32×512 | 5,58 | 5,43 | 4,98 |
| Código Rust, 1.536 tokens | 4,438 | 4,763 | 4,111 |

Latencia con prompts largos en RTX 3090 con cortiq 0.8.15:

| Prompt | Tokens de prompt/s | Primer token | Decodificación a esa profundidad (tok/s) |
|---|---:|---:|---:|
| Texto de ~1.000 tokens, régimen estable | 67,5 | no disponible | no disponible |
| `bench --ctx 1000` | 42,0 | 9,9 s | 40,2 |
| `bench --ctx 2000` | 40,4 | 20,7 s | 38,7 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Disco: 77 GB para el archivo q2tp/q2tp-v2 y 97 GB para q4tp, más 1,08-1,50 GB si se usa la cabeza MTP.
- RAM: el tamaño del archivo para velocidad máxima; con menos RAM funciona más lento. Los equipos de prueba con RTX 5090 y 4090 disponían de 62 GB de RAM, por lo que sus filas de presupuesto reducido incluyen lecturas de disco.
- VRAM: los 4,57 GB de pesos compartidos por todos los tokens permanecen en la tarjeta; el resto del presupuesto actúa como caché de expertos. Medido desde 12 GB hasta 32 GB de VRAM.
- GPU recomendadas: RTX 5090 (32 GB) como mejor opción de consumo, RTX 3090 y RTX 4090 (24 GB) como opciones viables. No se documentan pruebas en A100 ni H100.
- Backend: Vulkan. En Linux sin entorno gráfico hay que instalar `libglvnd0 libgl1 libegl1 libvulkan1 vulkan-tools` y exportar `XDG_RUNTIME_DIR=/tmp`; de lo contrario el motor cae silenciosamente a CPU.
- Despliegue: `cortiq run` para invocaciones puntuales (recarga el modelo, 10-30 s hasta el primer token) y `cortiq serve` para chat con el modelo precargado. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado el formato CMF propietario.
- Throughput real: 31,4 tok/s en una historia de 200 tokens en RTX 3090; 47-63 tok/s en RTX 5090 con `cortiq serve`; 67,8 tok/s con especulación en la generación del acuario 3D.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-cmf (q2tp-v2) | 125B | 6B | 262.144 | qwen-community-1.0 | CMF / cortiq | 77 GB en disco, 49,1 tok/s en RTX 3090 |
| Qwen3.8-Flash-Next (bf16) | 125B | 6B | 262.144 | qwen-community-1.0 | safetensors / transformers | Requiere VRAM agregada muy superior; no ejecutable en GPU de consumo |
| Qwen3.8-Flash-Next-cmf (q4tp) | 125B | 6B | 262.144 | qwen-community-1.0 | CMF / cortiq | 97 GB en disco, 40,3 tok/s en RTX 5090, mejor perplejidad |

No se dispone de datos de benchmarks estándar ni de comparaciones con modelos de otros fabricantes en la información proporcionada, por lo que la comparativa se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- Solo texto: no hay capacidades multimodales ni de audio.
- Solo tres idiomas declarados (inglés, ruso, chino); el rendimiento en castellano no está documentado y probablemente sea degradado.
- La licencia qwen-community-1.0 impone condiciones específicas; hay que revisar el enlace de licencia del modelo base antes de cualquier uso comercial.
- El formato CMF y el motor cortiq son específicos del autor; no hay interoperabilidad con el ecosistema estándar (transformers, vLLM, llama.cpp). El modelo queda atado a una única implementación mantenida por un solo desarrollador.
- La cuantización a 2 bits en los expertos degrada la calidad: la perplejidad en WikiText-2 sube de 5,43 (q4tp) a 6,06 (q2tp-v2) y a 7,36 (q2tp sin calibrar). En código Rust, curiosamente, q2tp sin calibrar es un 2,7 % mejor que q2tp-v2, lo que indica que la calibración no es uniformemente beneficiosa.
- Los números de benchmark son un caso favorable: el perfil se grabó sobre prompts que incluyen el prompt de bench, por lo que el rendimiento en cargas reales será inferior.
- La decodificación especulativa empeora el rendimiento en RTX 3090 (44,3 frente a 49,1 tok/s) y debe desactivarse en esa tarjeta.
- El fallback silencioso a CPU en Linux sin Vulkan configurado puede pasar desapercibido y arruinar las métricas de producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de sesgo ni de seguridad.
- El primer token tarda entre 9,9 y 20,7 s con prompts de 1.000-2.000 tokens en RTX 3090, lo que limita su uso en aplicaciones interactivas de baja latencia.
- Repositorio de 330,5 GB y solo 1 like: proyecto de un único autor, con riesgo de mantenimiento y de continuidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Qwen3.8-Flash-Next-cmf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio del motor y formato CMF: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Script de configuración de Vulkan para RunPod: https://github.com/infosave2007/cmf/blob/master/tools/runpod_vulkan_setup.sh
- Ejemplo del acuario 3D: https://github.com/infosave2007/cmf/blob/master/examples/3d-aquarium/README.md
