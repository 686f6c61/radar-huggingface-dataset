# Frosty40/ZONOS3-Mini-Turbo

## Resumen

ZONOS3-Mini-Turbo es un conjunto de dos parches de optimización para el runtime `zonos3.cpp` del modelo de síntesis de voz ZONOS3-Mini, desarrollado originalmente por Zyphra. El autor de este repositorio, Frosty40, no redistribuye pesos del modelo: los parches se aplican sobre el código fuente de Zyphra y utilizan los mismos ficheros GGUF publicados por el equipo original. El objetivo es aumentar el número de voces simultáneas ("live voices") que un único acelerador puede servir sin cortes en la reproducción, manteniendo idéntica calidad de audio.

La relevancia de esta contribución es práctica: en una Intel Arc Pro B70 con backend Vulkan, el runtime original sirve 8 voces concurrentes sin interrupciones, mientras que con los parches se alcanzan 33. También se documentan mejoras en DGX Spark (GB10), RTX 4080 y Mac mini con Apple M4 Pro. El modelo subyacente es un sistema text-to-speech con arquitectura de mezcla de expertos (MoE) y decodificador de audio, empaquetado en formato GGUF para inferencia local.

La licencia del repositorio de parches es MIT, mientras que los pesos del modelo ZONOS3-Mini son Apache 2.0 y no se redistribuyen aquí. El repositorio no incluye información sobre el número de parámetros, la longitud de contexto ni los idiomas soportados por el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de mezcla de expertos (MoE) en el backbone; decodificador de audio con reutilización de grafos GPU (según descripción de los parches) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen como GGUF; el fichero `backbone-ptq.gguf` sugiere cuantización post-entrenamiento, sin detalle del esquema) |
| Idiomas soportados | no disponible (la evaluación usa prompts en inglés) |
| Licencia | MIT para los parches; Apache 2.0 para los pesos de Zyphra/ZONOS3-Mini (no redistribuidos) |
| Formato de pesos | GGUF (`backbone-ptq.gguf`, `zac-keep2.gguf`, `spk-encoder.gguf`, `steer.gguf`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: publica dos parches de rendimiento sobre el runtime `zonos3.cpp` de Zyphra, fijado al commit `a50e14117d99181ba7f28047b451ba03ba1a09a9`. El backbone de ZONOS3-Mini emplea capas de mezcla de expertos, ya que los parches mencionan explícitamente que "cada capa de mezcla de expertos se ejecuta como un único dispatch de GPU para todo el lote". El sistema se completa con un decodificador de audio (`zac-keep2`), un codificador de hablante (`spk-encoder`) y un fichero de control de estilo (`steer`).

Los parches optimizan dos niveles. En ggml (principalmente el backend Vulkan): los lotes de 16 a 40 voces se ejecutan con su propia anchura en lugar de rellenarse hasta el siguiente grafo grande; los kernels matriz-vector y matriz-matriz se rediseñan para los núcleos Xe2 de la Arc B70 (menos acumuladores vivos por fila en lotes anchos, proyecciones pequeñas divididas en más workgroups); la atención para muchas voces se agrupa en un único dispatch que suma en el mismo orden que para una sola voz; y se encola el siguiente command buffer antes de que la GPU termine el anterior. En el runtime: el decodificador de audio reutiliza sus grafos GPU entre fragmentos y ejecuta varias líneas de decodificación en paralelo, arranca cada flujo con fragmentos pequeños (ramp) y planifica por fecha límite de reproducción, y el muestreo top-k se reparte entre dos hilos de CPU obteniendo los mismos tokens. No se documentan datos de entrenamiento, número de tokens ni fases de RLHF/DPO.

## Capacidades

- Síntesis de voz (text-to-speech) con streaming de audio y salida en formato WAV.
- Servicio HTTP compatible con la API de Zyphra, incluida la ruta OpenAI-compatible `/v1/audio/speech`.
- Soporte de múltiples voces simultáneas mediante un parámetro de lote (`--batch 40`) y embedding de hablante por petición.
- Control de estilo mediante el fichero `steer` y semilla configurable para reproducibilidad.
- Ejecución en GPU Intel (Vulkan), NVIDIA (Vulkan y CUDA) y Apple Silicon (Metal).
- Calidad de transcripción verificada: 0,0 % de word error rate en 48 tomas a 16 voces, tanto en stock como en turbo.
- No se documentan capacidades de razonamiento, código, matemáticas, visión, tool calling ni agentes; el pipeline declarado es exclusivamente `text-to-speech`.

## Casos de uso

- Servicio de locución multi-voice para aplicaciones de lectura: con 33 flujos concurrentes sin cortes en una Arc Pro B70, un único servidor puede atender a decenas de usuarios escuchando simultáneamente sin degradar la reproducción.
- Atención al cliente con voz sintética: el runtime expone `/v1/audio/speech` compatible con OpenAI, lo que permite integrarlo en plataformas existentes que ya consumen esa interfaz sin cambiar el cliente.
- Generación de audiolibros y contenido largo: el streaming por fragmentos con planificación por fecha límite de reproducción mantiene la continuidad del audio en合成 de pasajes extensos.
- Doblaje y preproducción de vídeo: el control de estilo y el embedding de hablante por petición permiten generar tomas con voces consistentes y semilla fija para reproducir resultados.
- Despliegue en hardware heterogéneo de bajo coste: los mismos parches funcionan en DGX Spark, RTX 4080 y Mac mini M4 Pro, lo que facilita entornos mixtos sin recompilar lógica específica por máquina.
- Pruebas de accesibilidad y prototipado de interfaces habladas: el tiempo hasta el primer audio de 23 ms (mediana, una voz) hace viable la respuesta conversacional percibida como inmediata.
- Evaluación comparativa de runtimes TTS: los scripts y resultados crudos en `results/` y `scripts/` permiten reproducir el benchmark con Whisper large-v3 como verificador.

## Benchmarks y rendimiento

Voces simultáneas sin cortes (máximo en 4 rondas), stock frente a turbo:

| Máquina | Backend | Stock | Turbo |
|---|---|---|---|
| Intel Arc Pro B70 | Vulkan | 8 | 33 |
| NVIDIA DGX Spark (GB10) | Vulkan | 16 | 20 |
| NVIDIA DGX Spark (GB10) | CUDA | 16 | 16 |
| NVIDIA RTX 4080 | Vulkan | 8 | 12 |
| NVIDIA RTX 4080 | CUDA | 8 | 12 |
| Mac mini, Apple M4 Pro (24 GB) | Metal | 12 | 16 |
| NVIDIA RTX 3090 | no ejecutado en esta release | no disponible | no disponible |

Detalle en Arc Pro B70 (mayor corte de reproducción en 4 rondas, con 200 ms de búfer en el reproductor):

| Voces a la vez | Stock | Turbo |
|---|---|---|
| 8 | ninguno | ninguno |
| 12 | 286 ms | ninguno |
| 16 | 486 ms | ninguno |
| 24 | 878 ms | ninguno |
| 32 | 1.196 ms | ninguno |
| 33 | 1.166 ms | ninguno |
| 34 | 1.225 ms | 98 ms |
| 36 | 1.237 ms | 133 ms |
| 40 | 1.395 ms | 215 ms |

Métricas agregadas en Arc Pro B70:

| Métrica | Stock | Turbo |
|---|---|---|
| Voces sin cortes en todas las rondas | 8 | 33 |
| Audio servido a 16 voces (segundos por segundo, media de 4 rondas) | 18,3 | 53,0 |
| Tiempo hasta el primer audio, una voz (mediana de 10) | 43 ms | 23 ms |
| Word error rate, 48 tomas a 16 voces | 0,0 % | 0,0 % |

## Requisitos de hardware

- VRAM estimada: no disponible (el repositorio no publica el tamaño de los GGUF ni el consumo de memoria).
- GPU validadas: Intel Arc Pro B70 (Vulkan), NVIDIA DGX Spark GB10 (Vulkan y CUDA), NVIDIA RTX 4080 (Vulkan y CUDA), Apple M4 Pro de 24 GB (Metal). RTX 3090 no se ejecutó en esta release.
- Cabe en GPU de consumo: sí, según los resultados en RTX 4080 y Mac mini M4 Pro de 24 GB.
- Despliegue: servidor `zonos3-server` compilado con CMake; backend Vulkan (`-DGGML_VULKAN=ON`), CUDA (`-DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=native`) o Metal por defecto en macOS. Requiere toolchain de Rust (cargo), compilador C++, SDK de Vulkan y `glslc` para Vulkan.
- Latencia: 23 ms de mediana hasta el primer audio con una voz en Arc Pro B70 (43 ms en stock).
- Throughput: 53,0 segundos de audio por segundo de cómputo a 16 voces en Arc Pro B70 (18,3 en stock).
- Arranque: la primera ejecución compila shaders de GPU (~40 s); las posteriores arrancan en ~2 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Voces concurrentes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZONOS3-Mini (stock, Zyphra) | no disponible | no disponible | 8 (Arc B70, Vulkan) | Apache 2.0 | Hugging Face (Zyphra/ZONOS3-Mini) |
| ZONOS3-Mini-Turbo (estos parches) | no disponible | no disponible | 33 (Arc B70, Vulkan) | MIT (parches) | Hugging Face (Frosty40/ZONOS3-Mini-Turbo) |
| Otros sistemas TTS comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos TTS alternativos en la información proporcionada, por lo que la comparativa se limita al modelo base frente a su versión parcheada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo: solo parches de código. Cualquier uso requiere descargar los GGUF desde Zyphra/ZONOS3-Mini y aceptar su licencia Apache 2.0.
- Los parches están fijados a un commit concreto (`a50e141`); cambios posteriores en `zonos3.cpp` o en ggml pueden romper la aplicación del parche.
- La evaluación de calidad se limita a 12 prompts en inglés (`prompts_heldout_v1.jsonl`) y a la verificación con Whisper large-v3; no hay datos sobre otros idiomas, acentos o dominios.
- El word error rate de 0,0 % mide inteligibilidad de la transcripción, no naturalidad prosódica ni similitud de hablante.
- No se documentan sesgos, riesgo de alucinación ni comportamiento en producciones de audio largas más allá de los fragmentos evaluados.
- La mejora en DGX Spark con CUDA es nula (16 → 16); el beneficio depende del backend y de la GPU.
- RTX 3090 no fue probada en esta release, por lo que su comportamiento es desconocido.
- El rendimiento a 34 voces o más sigue mostrando cortes (98–215 ms), por lo que 33 es el límite práctico documentado en Arc B70.
- No hay información sobre latencia ni throughput en GPUs distintas de la Arc Pro B70.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Frosty40/ZONOS3-Mini-Turbo
- Modelo base ZONOS3-Mini (Zyphra): https://huggingface.co/Zyphra/ZONOS3-Mini
- Código fuente del runtime: https://github.com/Zyphra/ZONOS3-Mini
- Commit de referencia: `a50e14117d99181ba7f28047b451ba03ba1a09a9`
