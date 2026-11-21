# Frosty40/ZONOS3-Mini-B70-Turbo

## Resumen

ZONOS3-Mini-B70-Turbo es un conjunto de dos parches de rendimiento para el runtime `zonos3.cpp` (backend Vulkan) del modelo de síntesis de voz Zyphra/ZONOS3-Mini. No se redistribuyen pesos: el repositorio contiene únicamente modificaciones al código (MIT) que aceleran la inferencia del modelo original (Apache 2.0) sobre GPU Intel Arc. El problema que resuelve es la escalabilidad en streaming de muchas voces simultáneas sobre una única tarjeta Intel Arc Pro B70, un escenario poco cubierto por los runtimes habituales, orientados a CUDA.

Según la model card, el runtime estándar sostiene 8 voces en vivo sin cortes, mientras que con estos parches una sola Arc Pro B70 mantiene 20 voces simultáneas sin interrupciones de reproducción, con la misma calidad de voz y los mismos ficheros GGUF. La mejora se apoya en cambios en los kernels Vulkan de ggml (ejecución de capas MoE y atención en un único dispatch para todo el lote) y en el runtime (reutilización de grafos GPU del decodificador de audio, remuestreo vectorizado y muestreo top-k optimizado).

El modelo subyacente, ZONOS3-Mini de Zyphra, es un sistema text-to-speech de arquitectura MoE con decodificador de audio y encoder de hablante; el repositorio documenta latencia de primer audio de 28 ms (frente a 43 ms en stock) y un throughput de 39,4 segundos de audio por segundo a 16 voces. La licencia de los parches es MIT; los pesos del modelo son Apache 2.0 y se descargan del repositorio de Zyphra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS con backbone transformer MoE (modelo Zyphra/ZONOS3-Mini); parches sobre runtime zonos3.cpp con backend ggml Vulkan |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base usa capas mixture-of-experts, sin cifra publicada en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se usan los GGUF oficiales de Zyphra: `backbone-ptq.gguf`, `zac-keep2.gguf`, `spk-encoder.gguf`, `steer.gguf`) |
| Idiomas soportados | no disponible (la evaluacion documentada usa prompts en ingles) |
| Licencia | Parches: MIT. Modelo base Zyphra/ZONOS3-Mini: Apache 2.0 |
| Formato de pesos | GGUF (descargados del repositorio de Zyphra, no redistribuidos) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: distribuye dos parches sobre el runtime `zonos3.cpp` en el commit `a50e14117d99181ba7f28047b451ba03ba1a09a9`. El primer parche (`vulkan-b70-turbo.patch`) modifica el backend Vulkan de ggml para que los lotes de 16, 20, 24 y 32 voces permanezcan en los kernels rápidos de matriz-vector, cada capa mixture-of-experts se ejecute como un único dispatch GPU para todo el lote y la atención de muchas voces se resuelva en un dispatch que suma en el mismo orden que para una sola voz. El segundo (`zonos3-b70-turbo.patch`) actúa sobre el runtime: el decodificador de audio reutiliza sus grafos GPU entre fragmentos en lugar de reconstruirlos, sube las entradas de cada fragmento en una sola transferencia, el remuestreador a 44,1 kHz omite los taps del filtro que son cero y se vectoriza en Linux, el modelo de lenguaje lee la salida de todas las voces en una transferencia y el muestreo top-k localiza candidatos más rápido manteniendo los mismos tokens para las mismas puntuaciones.

No se detallan datos de entrenamiento, número de tokens ni procesos de RLHF/DPO, ya que el modelo base es de Zyphra y este repositorio no lo modifica. La validación se hizo con Whisper large-v3 (faster-whisper, int8) transcribiendo 48 tomas a 16 voces y comparando con el texto del prompt tras la normalización inglesa de Whisper, con un 0,0 % de word error rate tanto en stock como en turbo; los 12 prompts de `prompts_heldout_v1.jsonl` no se usaron para ajustar los parches.

## Capacidades

- Síntesis de voz (text-to-speech) en streaming con salida WAV, mediante el servidor HTTP de Zyphra.
- API compatible con OpenAI en el endpoint `/v1/audio/speech`, además de la API propia `/v2/generate` con soporte de streaming.
- Servicio concurrente de hasta 20 voces simultáneas sin cortes sobre una Intel Arc Pro B70 (24 voces con un corte máximo de 58 ms).
- Clonación de voz mediante embedding de hablante por petición (el repositorio advierte que debe usarse solo con consentimiento del titular de la voz).
- Control de generación mediante semilla (`seed`) y formato de salida (`format: wav`).
- No se documentan capacidades de razonamiento, código, matemáticas, visión, tool calling ni agentes: el pipeline es exclusivamente text-to-speech.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente con agentes de voz concurrentes: un único servidor sobre Arc Pro B70 puede mantener 20 conversaciones habladas simultáneas sin cortes, suficiente para un equipo de soporte de tamaño medio con una sola GPU.
- Centralita y locuciones telefónicas: el endpoint compatible con OpenAI `/v1/audio/speech` permite sustituir proveedores cloud en un sistema IVR existente sin cambiar el cliente HTTP.
- Generación de audiolibros y contenido largo: el streaming con 39,4 segundos de audio por segundo a 16 voces permite sintetizar horas de narración en minutos, con latencia de primer audio de 28 ms.
- Doblaje y localización de vídeo: la clonación de voz por embedding de hablante permite mantener una voz consistente entre tomas y fragmentos del mismo proyecto.
- Pruebas de accesibilidad y lectura de pantalla: la baja latencia de primer audio (28 ms) hace viable la lectura por voz interactiva en interfaces de usuario.
- Despliegue en infraestructura Intel sin CUDA: al usar el backend Vulkan de ggml, el servicio funciona en estaciones con GPU Arc sin depender de NVIDIA, útil en entornos con hardware Intel homologado.
- Evaluación de runtimes TTS en producción: los scripts y resultados en `results/` y `scripts/` permiten reproducir la comparativa stock/turbo con Whisper como verificador automático de calidad.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre una Intel Arc Pro B70 (Mesa 26.2.6, Vulkan SDK 1.4.363.1, Linux 7.0) con Ryzen 9 5950X, `--batch 32`, streaming, decodificador `zac-keep2` y embedding de hablante en cada petición. Stock y turbo usan el mismo commit, ficheros y prompts, alternados en dos rondas de cuatro mediciones. Un corte se define como un hueco de reproducción para un reproductor con 200 ms de búfer.

| Voces simultaneas | Stock: corte maximo | Turbo: corte maximo |
|---|---|---|
| 8 | ninguno | ninguno |
| 12 | 321 ms | ninguno |
| 16 | 489 ms | ninguno |
| 20 | 745 ms | ninguno |
| 24 | 873 ms | 58 ms |

| Metrica | Stock | Turbo |
|---|---|---|
| Voces en vivo sin cortes en todas las rondas | 8 | 20 |
| Audio servido a 16 voces (segundos por segundo, media de 4 rondas) | 18,3 | 39,4 |
| Tiempo hasta el primer audio, una voz (mediana de 10) | 43 ms | 28 ms |
| Word error rate, 48 tomas a 16 voces | 0,0 % | 0,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por no ser aplicables a un modelo text-to-speech.

## Requisitos de hardware

- GPU: Intel Arc Pro B70 (una unidad soporta las cifras publicadas); el backend es Vulkan, por lo que se requiere soporte de Vulkan y `glslc` (Vulkan SDK de LunarG o paquetes de la distribución como `libvulkan-dev` y `glslc`).
- VRAM estimada: no disponible en la información proporcionada.
- CPU de referencia en las pruebas: Ryzen 9 5950X; sistema Linux 7.0 con Mesa 26.2.6.
- Cabe en GPU de consumo: no disponible (las pruebas se hicieron sobre GPU profesional Intel Arc Pro B70; no se documenta comportamiento en Arc de consumo ni en GPU NVIDIA/AMD).
- Despliegue: compilación con CMake (`-DGGML_VULKAN=ON -DCMAKE_BUILD_TYPE=Release`) y ejecución de `zonos3-server` con `--gpu --batch 32 --port 1919`; requiere toolchain de Rust (cargo) y compilador de C++.
- Arranque: la primera ejecución compila shaders GPU (unos 40 segundos); las siguientes arrancan en unos 2 segundos.
- Latencia y throughput: 28 ms hasta el primer audio con una voz; 39,4 segundos de audio por segundo con 16 voces; sin cortes hasta 20 voces.

## Comparativa con modelos similares

| Modelo | Tipo | Voces concurrentes sin cortes | Latencia primer audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZONOS3-Mini-B70-Turbo (estos parches) | Parches de runtime Vulkan sobre ZONOS3-Mini | 20 (Arc Pro B70) | 28 ms | MIT (parches) / Apache 2.0 (modelo) | Hugging Face, requiere compilar |
| ZONOS3-Mini stock (Zyphra, zonos3.cpp) | Runtime TTS Vulkan | 8 (Arc Pro B70) | 43 ms | Apache 2.0 | Hugging Face (Zyphra/ZONOS3-Mini) |
| Otros modelos TTS open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el runtime stock de Zyphra sobre el mismo hardware y los mismos pesos; no hay datos de otros sistemas TTS en el material disponible.

## Limitaciones y advertencias

- Los parches están validados únicamente sobre Intel Arc Pro B70 con Vulkan en Linux; no hay datos de comportamiento en otras GPU, en Windows ni en otros backends.
- Las cifras de rendimiento provienen de un único equipo (Ryzen 9 5950X, Mesa 26.2.6, Vulkan SDK 1.4.363.1) y de dos rondas de cuatro mediciones; la variabilidad en otros sistemas no está documentada.
- La calidad se evaluó con 12 prompts en inglés y Whisper large-v3 como transcriptor; el soporte multilingüe y el comportamiento en otros idiomas no están documentados.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo TTS, el riesgo se traslada a pronunciación incorrecta o entonación inadecuada, no verificada fuera del conjunto de pruebas.
- La clonación de voz debe usarse solo con consentimiento del titular de la voz, según advierte explícitamente la model card.
- Licencia: los parches son MIT, pero el modelo subyacente es Apache 2.0 de Zyphra y no se redistribuye; el uso comercial queda sujeto a los términos de Zyphra.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción por terceros.
- El despliegue exige compilar desde fuente con CMake, toolchain de Rust y SDK de Vulkan, lo que añade complejidad frente a un binario precompilado.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/Frosty40/ZONOS3-Mini-B70-Turbo
- Modelo base Zyphra/ZONOS3-Mini: https://huggingface.co/Zyphra/ZONOS3-Mini
- Runtime zonos3.cpp (commit fijado): https://github.com/Zyphra/ZONOS3-Mini
- Resultados y scripts de evaluación: carpeta `results/` y `scripts/` del repositorio del modelo
- Prompts de evaluación: `prompts_heldout_v1.jsonl` del repositorio del modelo
