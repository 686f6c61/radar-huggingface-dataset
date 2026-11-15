# changh95/Alpamayo2-Super-p300x2

## Resumen
Alpamayo2-Super-p300x2 es un paquete de despliegue, publicado por el usuario changh95, que permite ejecutar el modelo nvidia/Alpamayo2-Super sobre una única chip Tenstorrent Blackhole (plataforma p150). El modelo subyacente es un vision-language-action (VLA) de 34B orientado a conducción autónoma: un backbone Qwen3-VL-32B combinado con un experto de acciones basado en flow-matching. El paquete no contiene pesos nuevos, sino la configuración, kernels y servidor HTTP necesarios para ejecutar los pesos originales de NVIDIA en hardware Tenstorrent mediante tt-nn.

La relevancia de esta ficha es doble. Por un lado, documenta un caso poco habitual de portabilidad de un modelo VLA grande a aceleradores no GPU (Blackhole), con kernels de decodificación fusionados y cuantización agresiva (bfp8/bfp4). Por otro, sirve como referencia de despliegue: el repositorio incluye un servidor HTTP con API `/predict`, perfiles de entrada fijos y métricas de latencia y precisión frente a la referencia en CPU bf16.

El modelo recibe 6 cámaras con 4 fotogramas cada una más el historial de poses del vehículo, y devuelve una cadena de causalidad textual y una trayectoria de 6,4 segundos. El paquete ocupa 1,6 GB en el repositorio, pero requiere descargar aparte los pesos de NVIDIA (73 GB) en la caché de Hugging Face. Está pensado para investigación y autoetiquetado, no como política de conducción en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action: backbone Qwen3-VL-32B (64 capas) + experto de acciones transformer de 64 capas y 1536 de anchura con flow-matching (10 pasos Euler) |
| Parametros totales | 34B (modelo subyacente nvidia/Alpamayo2-Super) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Prompt de inferencia de ~4,6K tokens; longitud máxima de contexto del backbone no disponible |
| Tipos de cuantizacion | Pesos en dispositivo: bfp8 en atención, bfp4 en MLP, bf16 en torre de visión, bfp8 en experto, KV cache en bf16; cuantizaciones estándar (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | no disponible (la cadena de causalidad se genera en texto, idioma no especificado) |
| Licencia | no disponible (la model card remite a la licencia de nvidia/Alpamayo2-Super, truncada en la información disponible) |
| Formato de pesos | Pesos originales de nvidia/Alpamayo2-Super descargados en caché de HF (revisión 00554695e729a6ff0b6281fd2c81b18d06e33dbe); paquete de despliegue con manifiesto schema 5.1 de tt-model-manager |

## Arquitectura y entrenamiento
La arquitectura es un VLA compuesto por dos bloques. El primero es un backbone Qwen3-VL-32B de 64 capas que procesa 24 imágenes (6 cámaras × 4 fotogramas, 17280 parches en total) mediante una torre de visión ViT con atención por imagen y deepstack, y después hace prefill de un prompt de unos 4600 tokens. El segundo es un experto de acciones de 64 capas y 1536 de anchura que atiende a toda la KV cache del VLM y genera la trayectoria mediante flow-matching con 10 pasos Euler, integrada después con un modelo de uniciclo en host (`action_to_traj`).

El paquete no entrena ni ajusta el modelo: ejecuta los pesos de NVIDIA con kernels propios de tt-nn. La decodificación de la cadena de causalidad usa programas fusionados por capa (RMSNorm+QKV+q/k-norm+rope+KV write, y o_proj+residual+RMSNorm+SwiGLU+residual) alrededor de `sdpa_decode`, con atención bfp8 y MLP bfp4. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo original.

## Capacidades
- Percepción multi-cámara: procesa 6 cámaras con 4 fotogramas cada una (hasta 1920x1080, redimensionado a ~180 tokens por imagen) en un único perfil de entrada.
- Integración de historial ego: acepta 16 poses (`ego_history_xyz` [16,3] y `ego_history_rot` [16,3,3]) a pasos de 0,1 s.
- Predicción de trayectoria: devuelve `trajectory_xyz` [64,3] y `trajectory_rot` [64,3,3] en marco ego, a 0,1 s por paso, cubriendo 6,4 s.
- Razonamiento textual: genera una cadena de causalidad (chain-of-causation) de 10-30 tokens antes de la trayectoria; puede desactivarse para obtener solo trayectoria.
- Muestreo multimodal: `num_traj_samples` de 1 a 16 muestras de ruido flow-matching con el mismo prompt, con coste adicional de ~0,33 s por muestra.
- Control de muestreo: decodificación greedy, top_p (0,98), temperature (0,6) y seed.
- Evaluación integrada: si se proporciona `ego_future_xyz` [64,3], la respuesta incluye `ade_m` y `minADE_m`.
- Servidor HTTP propio con endpoints `/predict`, `/health` e `/info`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, audio ni otros idiomas.

## Casos de uso
- Autoetiquetado de datos de conducción: el modelo genera trayectorias y cadenas de causalidad sobre clips de validación (PhysicalAI-AV), lo que permite etiquetar grandes volúmenes de vídeo multi-cámara sin intervención humana; su ADE frente a ground truth en los clips publicados (0,18-3,17 m) es adecuado para filtrar y priorizar revisiones.
- Evaluación de modelos VLA en hardware alternativo: sirve para comparar la precisión de una implementación en Blackhole frente a la referencia CPU/GPU bf16, usando las métricas teacher-forced ADE y las PCC por componente (visión 0,996, capas de texto 0,9999).
- Investigación en planificación con razonamiento: la cadena de causalidad permite estudiar la relación entre explicaciones textuales y trayectorias generadas, con la opción de desactivar el razonamiento para aislar su efecto.
- Prototipado de pipelines de percepción-planificación: la API `/predict` con imágenes base64 y poses ego facilita integrar el modelo en cuadernos o servicios de investigación sin gestionar el runtime de Tenstorrent directamente.
- Análisis de incertidumbre multimodal: con `num_traj_samples` hasta 16 se pueden estudiar distribuciones de trayectorias bajo el mismo contexto, útil para investigación en estimación de riesgo y multimodalidad del sampler.
- Validación de cuantización bfp4/bfp8: el paquete documenta el impacto de la cuantización en la precisión (el error numérico lo dominan los pesos MLP en bfp4), lo que lo convierte en banco de pruebas para técnicas de compresión en aceleradores Tenstorrent.
- Demostración de despliegue en una sola chip: útil para equipos que evalúan Blackhole p150 como plataforma de inferencia para modelos de 34B con ~25 GB de DRAM ocupados de 32 GB disponibles.

## Benchmarks y rendimiento
Precisión frente a la referencia CPU bf16 en clips de validación PhysicalAI-AV (greedy, seed 42):

| Clip | ADE teacher-forced vs referencia | ADE del paquete vs ground truth | ADE de la referencia vs ground truth |
|---|---:|---:|---:|
| 030c760c @5.1s | 0,04 m | 0,195 m | 0,266 m |
| 030c760c, solo trayectoria | 0,07 m | 0,183 m | 0,239 m |
| 0347d9f9 @5.1s | 0,30 m | 2,08 m | 2,36 m |
| 06b483cf @5.1s | 0,19 m | 3,17 m | 3,21 m |
| 09ad74a2 @5.1s | 0,09 m | 0,377 m | 0,411 m |
| 0a1ef808 @5.1s | 0,02 m | 1,83 m | 1,89 m |

Correlaciones de Pearson por componente: visión 0,996; capas de texto 0,9999; capas del experto 0,9999; logits de decodificación fusionada frente a simple 0,99998.

Desglose de latencia por etapa en una chip Blackhole:

| Etapa | Implementación | Tiempo |
|---|---|---:|
| Torre de visión, 24 imágenes (17280 parches) | Qwen3-VL ViT, atención por imagen, deepstack, bf16 | 0,32 s |
| Prefill del prompt de ~4,6K tokens | 64 capas Qwen3, atención bfp8 / MLP bfp4, SDPA de secuencia completa | 2,1 s |
| Decodificación de cadena de causalidad | paso trazado con dos programas fusionados por capa | 56 ms/token |
| Experto de acciones, 10 pasos Euler | transformer de 64 capas y 1536 de anchura, trazado | 0,33 s |
| Integración de uniciclo (host) | `action_to_traj` de referencia | 1 ms |

Extremo a extremo: 2,9 s (solo trayectoria) a 3,5-5 s (cadena de causalidad de 10-30 tokens) por petición; ~25 GB de los 32 GB de DRAM de la chip. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- Acelerador: una única chip Tenstorrent Blackhole en plataforma p150 (mesh `P150`); se usa una chip libre de la caja y el resto quedan disponibles.
- Memoria: ~25 GB de DRAM de la chip (32 GB totales) para pesos y KV cache; no es inferencia en GPU convencional.
- Pesos: descarga de 73 GB de nvidia/Alpamayo2-Super en la caché de Hugging Face, además de la imagen Docker del paquete (repositorio de 1,6 GB).
- Despliegue: `tt-model pull --with-weights` y `tt-model serve` mediante tt-model-manager 0.1.0 o posterior (desde 2026-09); también funciona con tt-cli apuntando a una versión gestionada reciente de tt-model. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI.
- Arranque: la primera ejecución compila kernels y convierte pesos al layout del dispositivo (varios minutos); los arranques posteriores están listos en aproximadamente un minuto.
- Latencia: 2,9-5 s por petición, batch 1 y una petición a la vez; comparable a una H100 según el autor.
- Throughput: no disponible (no se publican peticiones por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alpamayo2-Super-p300x2 (este paquete) | 34B | prompt ~4,6K | VLA conducción sobre Blackhole p150 | no disponible | Hugging Face (changh95) |
| nvidia/Alpamayo2-Super | 34B | no disponible | VLA conducción, referencia CPU/GPU | no disponible | Hugging Face (nvidia) |
| Qwen3-VL-32B | 32B | no disponible | VLM generalista (backbone del anterior) | no disponible | Hugging Face |

La comparación con alternativas de la misma categoría (otros VLA de conducción) no está disponible en la información proporcionada.

## Limitaciones y advertencias
- No es una política de conducción en tiempo real: es el modelo "Super" de investigación y autoetiquetado, con varios segundos por petición incluso en H100.
- Perfil de entrada fijo: 6 cámaras × 4 fotogramas, 16 poses de historial ego, batch 1 y una petición simultánea; no admite variaciones de configuración.
- No es bit-exacto entre ejecuciones: los kernels de la torre de visión introducen variación de trayectorias a nivel de centímetros.
- El primer token de razonamiento de la referencia es casi empate y el ruido bfp4 puede invertirlo, por lo que el texto puede diferir del resultado en GPU/CPU aunque siga siendo coherente.
- El sampler flow-matching es multimodal: el ADE de una sola muestra varía con la seed; se recomienda usar `num_traj_samples`.
- El error numérico lo dominan los pesos MLP en bfp4; la cuantización afecta a la fidelidad frente a la referencia bf16.
- Licencia no disponible en la información proporcionada; la model card remite a la licencia de nvidia/Alpamayo2-Super, por lo que debe verificarse antes de cualquier uso comercial.
- Idiomas soportados y sesgos conocidos no documentados.
- Requiere hardware Tenstorrent Blackhole y tt-model-manager reciente; no hay ruta de despliegue en GPU estándar dentro de este paquete.

## Enlaces
- Repositorio del paquete: https://huggingface.co/changh95/Alpamayo2-Super-p300x2
- Modelo original: https://huggingface.co/nvidia/Alpamayo2-Super
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Cliente de ejemplo (ruta dentro del paquete): `code/alpamayo_tt/server/client_example.py`
- Papers, blogs, demos y repositorios adicionales: no disponible
