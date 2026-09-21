# 00cyre/Krea-2-Turbo-Distill4-mflux-q8

## Resumen

Krea-2-Turbo-Distill4-mflux-q8 es un checkpoint derivado de Krea 2 Turbo, publicado por el usuario 00cyre, que empaqueta en un único fichero el modelo base cuantizado a 8 bits en formato MLX junto con la LoRA de destilación de 4 pasos `lvladikov/Krea2-Turbo-Distill-4step-LoRA` ya fusionada (escala 1.0). No es un producto oficial de Krea: es una conversión de terceros construida a partir de `mflux-community/krea-2-turbo-mflux-q8` y orientada al ecosistema mflux sobre Apple Silicon.

El problema que resuelve es puramente operativo. mflux re-hornea el adaptador en cada arranque de proceso: en un M5 Pro, cargar el q8 base y aplicar la LoRA tarda 11,118 s, mientras que cargar este checkpoint pre-horneado tarda 2,751 s, un ahorro de 8,37 s por arranque y un solo fichero en disco en lugar de dos. El resultado es pixel-idéntico (mismo SHA-256 del búfer RGB decodificado) al flujo de cargar y hornear, por lo que no hay ganancia de calidad ni de velocidad por paso, solo de tiempo de carga.

El modelo tiene 3.606.719.052 parámetros (~3,61 mil millones) y ocupa 22,2 GB en el repositorio. La receta de inferencia es de 4 pasos con guidance 1.0 (CFG desactivado), y la propia model card advierte que ejecutarlo a 8 pasos no supone una mejora, ya que la destilación está entrenada para un esquema de 4 pasos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión texto-a-imagen; la model card no especifica la arquitectura interna) |
| Parámetros totales | 3.606.719.052 (~3,61 mil millones) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de difusión); resoluciones de entrenamiento del adaptador: 512–1440 px |
| Tipos de cuantización | q8 (8 bits, formato MLX). El autor indica que este checkpoint es solo q8; el modelo base dispone de variantes q4 en el ecosistema mflux |
| Idiomas soportados | no disponible (el modelo consume prompts de texto; no se declara cobertura de idiomas) |
| Licencia | krea-2-community-license (license: other, enlazada a la ficha de krea/Krea-2-Turbo) |
| Formato de pesos | safetensors en formato MLX (checkpoint mflux) |
| Pipeline | text-to-image |
| Biblioteca | mflux |
| Modelo base | krea/Krea-2-Turbo (relación: quantized) |
| Tamaño del repositorio | 22,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-20 |
| Última actualización | 2026-09-20 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de Krea 2 Turbo más allá de que se trata de un modelo de difusión texto-a-imagen. Lo que sí se documenta con precisión es la cadena de derivación: se parte de `mflux-community/krea-2-turbo-mflux-q8`, se le aplica la LoRA de destilación de 4 pasos con escala 1.0 y el resultado se hornea y se guarda como checkpoint mflux en 8 bits. No se ha realizado ningún entrenamiento adicional ni ajuste propio en este repositorio; el artefacto es una fusión y recuantización de pesos preexistentes.

El rasgo técnico distintivo es la destilación por pasos: el adaptador fusionado reduce el muestreo a 4 pasos con CFG desactivado. La model card documenta además dos hallazgos de ingeniería medidos el 2026-09-20 sobre un M5 Pro: (1) el mapeo de LoRAs de Krea 2 en mflux no contempla las claves `.diff_b` de ComfyUI, de modo que los adaptadores con deltas de sesgo pierden tensores silenciosamente; el adaptador de destilación aquí fusionado no los lleva, por lo que este checkpoint es fiel, pero una LoRA de persona apilada encima puede no serlo. (2) El calendario sigma de mflux no es el que usa ComfyUI para muestrear Krea 2: ComfyUI emplea un calendario `beta(0.6, 0.6)` sobre un desplazamiento de 1.15 con `euler_ancestral`, mientras que mflux usa un linspace con desplazamiento dinámico (mu 1.0146 a 1024x1280); a 8 pasos, mflux llega al paso final con un 76% más de ruido por eliminar.

## Capacidades

- Generación de imágenes texto-a-imagen con destilación a 4 pasos y guidance 1.0 (sin CFG).
- Ejecución nativa en Apple Silicon mediante MLX y la biblioteca mflux (CLI `mflux-generate-krea2` y API Python `Krea2`).
- Carga pre-horneada del adaptador de destilación: no requiere aplicar LoRA en tiempo de ejecución.
- Reproducibilidad determinista con semilla fija: los renders de mflux son deterministas, verificado por hash SHA-256 del búfer RGB decodificado.
- Compatibilidad con LoRAs adicionales apiladas (por ejemplo, de persona o estilo), con las salvedades del apartado de limitaciones.
- Rangos de resolución heredados del adaptador: 512–1440 px; en las mediciones se usaron 832x1216 y 1024x1280.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento, por no ser aplicables a un modelo de difusión de imagen.

## Casos de uso

- Generación de imágenes offline en equipos Apple Silicon: el modelo se ejecuta íntegramente en local con MLX, sin depender de APIs externas, lo que resulta adecuado para entornos con requisitos de privacidad o sin conectividad.
- Arranque frecuente de procesos en scripts y herramientas de línea de comandos: al pasar de 11,118 s a 2,751 s de carga, cualquier flujo que arranque el modelo repetidamente (scripts puntuales, tareas programadas, jobs de CI) recorta 8,37 s por ejecución.
- Pipelines de generación por lotes: la receta de 4 pasos con guidance 1.0 reduce el coste por imagen; en las mediciones, un render a 1024x1280 tarda una mediana en caliente de 42,41 s frente a 84,15 s a 8 pasos en el mismo equipo.
- Prototipado de aplicaciones de imagen con un solo artefacto: al no necesitar el adaptador separado, se simplifica el empaquetado y la distribución de la aplicación (un fichero de 22,186 GB en disco en lugar del modelo más 438 MB de adaptador).
- Flujos de retrato con LoRA de persona: el checkpoint admite apilar un adaptador de identidad, si bien el resultado depende críticamente del sampler y del calendario sigma empleados, según las mediciones del autor.
- Reproducción de investigación sobre muestreo y calendarios sigma: el modelo sirve como banco de pruebas para comparar el calendario de mflux con el de ComfyUI (`beta(0.6, 0.6)`, desplazamiento 1.15, `euler_ancestral`), un caso documentado con diferencias medibles en el ruido residual.
- Servicio de imágenes con modelo residente: un servidor que mantiene el checkpoint cargado en memoria (22,176 GB residentes tras la carga) evita pagar el coste de horneado en cada petición.
- Ilustración y texturas estilizadas en el rango 512–1440 px: válido siempre que se acepte que la fuerza del adaptador está congelada en 1.0 y no se pueda atenuar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (por ejemplo, MMLU, GenEval o FID) en la información disponible. La model card sí incluye mediciones directas de carga y render, realizadas en un Apple M5 Pro con GPU de 20 núcleos, 48 GiB de memoria unificada, macOS 26.5.1, mflux 0.19.2 y mlx 0.32.2:

| Métrica | Este checkpoint | q8 base + LoRA en carga |
|---|---|---|
| Tiempo de carga | 2,751 s | 11,118 s |
| Render, 4 pasos, 832x1216 | 29,05 s | 29,55 s (mediana de 3) |
| Espacio en disco | 22,186 GB | 22,186 GB + 438 MB de adaptador |
| Memoria residente tras carga | 22,176 GB | 22,176 GB |

Otras mediciones reportadas por el autor:

| Medición | Valor |
|---|---|
| Render 1024x1280, 4 pasos, mediana en caliente (n=4) | 42,41 s (rango 41,83–43,98 s) |
| Render 1024x1280, 8 pasos, mismo equipo | 84,15 s |
| Diferencia media absoluta, 4 vs 5 pasos | 5,70 sobre 255 |
| Diferencia media absoluta, 4 vs 6 pasos | 7,20 sobre 255 |
| Comparación ciega con LoRA de persona (4 pasos con `er_sde` frente a referencia de 8 pasos) | 0 victorias en 35 comparaciones |
| Pico de memoria en configuración de servidor q8 con pila de persona | 35,59 GB (frente a 35,22 GB del servidor q4) |
| Verificación de identidad de píxel | SHA-256 `517500d4492908ea5c1a5c90d63aa51477a2b01004ba25b1cbe4d392ae34e6e9` |

## Requisitos de hardware

- Plataforma: el checkpoint está en formato MLX y depende de mflux, por lo que su ejecución está restringida a Apple Silicon (no hay ruta CUDA documentada).
- Memoria: 22,176 GB residentes tras la carga, sobre un repositorio de 22,186 GB. El equipo de referencia contaba con 48 GiB de memoria unificada.
- Pico de memoria medido: 35,59 GB en configuración de servidor q8 con una LoRA de persona apilada, según la comparación q4/q8 recogida en la model card.
- GPU recomendadas: Apple M5 Pro con GPU de 20 núcleos (equipo en el que se tomaron todas las mediciones). No se proporcionan datos para otros chips de la familia M.
- Cabe en GPU de consumo: sí, en el sentido de que está pensado para Apple Silicon; no hay información sobre GPU de consumo NVIDIA, ya que MLX no las soporta. No se ofrecen estimaciones de VRAM para ese caso.
- Opciones de despliegue: CLI `mflux-generate-krea2` y API Python (`from mflux.models.krea2 import Krea2`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: carga de 2,751 s; render de 29,05 s a 832x1216 y 4 pasos; mediana en caliente de 42,41 s a 1024x1280 y 4 pasos frente a 84,15 s a 8 pasos. No se publican cifras de throughput por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / cuantización | Contexto o resolución | Tiempo de carga | Licencia |
|---|---|---|---|---|---|
| 00cyre/Krea-2-Turbo-Distill4-mflux-q8 | 3.606.719.052 | safetensors MLX, q8 | 512–1440 px (adaptador); uso medido a 832x1216 y 1024x1280 | 2,751 s | krea-2-community-license |
| mflux-community/krea-2-turbo-mflux-q8 + LoRA de destilación | no disponible | safetensors MLX, q8 + adaptador de 438 MB | misma base | 11,118 s | krea-2-community-license |
| krea/Krea-2-Turbo (modelo original de Krea) | no disponible | no disponible | no disponible | no disponible | krea-2-community-license |

No se dispone de datos de parámetros, contexto ni rendimiento de otros modelos comparables de la misma categoría (difusión texto-a-imagen de ~3,6 mil millones de parámetros para Apple Silicon) en la información proporcionada, por lo que la comparación se limita a los artefactos de la misma cadena de derivación.

## Limitaciones y advertencias

- El beneficio real es de 8,4 segundos por arranque de proceso. Si el modelo ya permanece residente, el ahorro se produce una sola vez por sesión; es un artefacto de conveniencia, no una mejora de rendimiento.
- La fuerza del adaptador está congelada en 1.0. La ficha de la LoRA original recomienda 0,75 cuando la textura resulta demasiado marcada en renders estilizados o de gran tamaño. Este checkpoint no permite ajustar ese valor; para ello hay que usar el modelo base más el adaptador por separado.
- Solo existe en q8. El propio autor señala que el caso interesante sería la fusión sobre q4, pero hacerlo correctamente exige los pesos densos del modelo base para fusionar antes de cuantizar, y no estaban disponibles en la máquina de compilación.
- Hereda el comportamiento de ambos predecesores, incluido el rango de resoluciones para el que fue entrenado el adaptador (512–1440 px).
- El sampler condiciona la calidad. La model card corrige su recomendación inicial: `er_sde` sobre el calendario sigma propio de mflux produjo imágenes fantasma y negros aplastados al apilar una LoRA de persona sobre un render de 4 pasos, con 0 victorias en 35 comparaciones ciegas frente a una referencia de 8 pasos. El autor atribuye el fallo al mapeo de claves `.diff_b` y al calendario sigma, no a este checkpoint.
- Los adaptadores que incluyen claves `.diff_b` de ComfyUI pueden aplicarse de forma parcial y silenciosa bajo mflux al apilarse sobre este modelo; el adaptador de destilación fusionado no las lleva, pero una LoRA de persona sí podría llevarlas.
- Ejecutar el modelo a 8 pasos no es una mejora: la destilación está orientada a 4 pasos.
- No se documentan sesgos, cobertura de idiomas ni tasas de fidelidad al prompt. En un modelo de difusión, el riesgo análogo a la alucinación es la deriva entre el prompt y la imagen generada, que aquí no se cuantifica.
- La licencia es `krea-2-community-license` (license: other). Antes de un uso comercial es imprescindible revisar los términos enlazados en la ficha de `krea/Krea-2-Turbo`; la información disponible no detalla las restricciones concretas.
- Es un derivado de terceros, no un producto oficial de Krea, y no está respaldado por el autor del modelo base. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Las fechas de creación y actualización declaradas (2026-09-20) son las que figuran en la ficha de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/00cyre/Krea-2-Turbo-Distill4-mflux-q8
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Licencia (enlazada en la ficha del modelo base): https://huggingface.co/krea/Krea-2-Turbo
- Checkpoint q8 de partida: https://huggingface.co/mflux-community/krea-2-turbo-mflux-q8
- LoRA de destilación de 4 pasos: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-4step-LoRA
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada
- La búsqueda web realizada no devolvió enlaces relevantes (únicamente páginas de inicio de sesión de Facebook), por lo que no se añade ninguna otra referencia
