# mh73772/krea-2-turbo-mflux-q8-4step

## Resumen

Este repositorio contiene un checkpoint de 8 bits en formato MLX del modelo de generación de imágenes krea/Krea-2-Turbo, publicado por el usuario mh73772 y preparado para ejecutarse en un Mac con Apple Silicon y 16 GB de memoria unificada. No es un producto oficial de Krea: es una conversión comunitaria que combina cuantización a 8 bits, la fusión del LoRA de destilación a 4 pasos de lvladikov y una reorganización de los pesos del transformer en bloques que se leen de disco bajo demanda (block streaming).

El problema que resuelve es de capacidad de memoria. El repositorio ocupa 18,4 GB, pero gracias al modo `--block-streaming` el pico de memoria medido se queda en 6,18 GB a 1024x1024 y 6,53 GB a 1280x1280, con cero swapouts. El precio es la dependencia de un fork no oficial de mflux, ya que `--block-streaming` no existe en el mflux upstream.

La estructura interna es: un transformer de 13,62 GB en q8 dividido en `blocks_00` a `blocks_27.safetensors` más `globals.safetensors`, un codificador de texto Qwen3-VL-4B cuantizado de bf16 (8,05 GB) a 8 bits (4,27 GB) y VAE más tokenizer sin modificar (0,52 GB). La licencia es la krea-2-community-license y el pipeline declarado es text-to-image.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-imagen; transformer dividido en 28 bloques más globals, codificador de texto Qwen3-VL-4B y VAE. No se detalla el tipo exacto (DiT/MMDiT) en la información disponible |
| Parámetros totales | No disponible. El transformer cuantizado a 8 bits ocupa 13,62 GB y el codificador de texto Qwen3-VL-4B está cuantizado a 8 bits |
| Parámetros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No aplica; no disponible para el codificador de texto |
| Tipos de cuantización | 8 bits MLX affine, group size 64 (transformer y text encoder) |
| Idiomas soportados | No disponible |
| Licencia | krea-2-community-license (license: other) |
| Formato de pesos | safetensors (formato MLX, transformer particionado por bloques) |
| Modelo base | krea/Krea-2-Turbo |
| Librería | mflux (fork he-be/mflux-for-16gb para block streaming) |
| Pipeline | text-to-image |
| Tamaño del repositorio | 18,4 GB |
| Descargas / likes | 200 / 0 |
| Fecha de creación | 2026-09-23 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo es una adaptación de inferencia, no un entrenamiento nuevo. Sobre los pesos de krea/Krea-2-Turbo se han aplicado tres transformaciones: cuantización a 8 bits en formato MLX affine con group size 64; fusión del LoRA `lvladikov/Krea2-Turbo-Distill-4step-LoRA` (fichero `krea2_turbo_4step_rank_64_lora_comfyui.safetensors`, escala 1.0) directamente en los pesos q8; y repartición del transformer en `blocks_00`–`blocks_27.safetensors` más un `globals.safetensors`, de modo que cada bloque puede leerse de disco de forma independiente durante la inferencia.

El codificador de texto es Qwen3-VL-4B, que pasa de bf16 (8,05 GB) a 8 bits (4,27 GB). El VAE y el tokenizer no se han modificado (0,52 GB). No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO: esos detalles pertenecen al modelo base y no se reproducen en esta ficha. La innovación técnica práctica es el diseño de block streaming, que permite ejecutar el transformer completo en un equipo con 16 GB de memoria unificada sin swap.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image), con resolución documentada de 1024x1024 y 1280x1280.
- Inferencia destilada a 4 pasos con scheduler `euler` y `guidance 1.0` (el LoRA de destilación ya está fusionado).
- Ejecución local y offline en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Cuantización a 8 bits que reduce el peso del transformer y del codificador de texto a costa de una pérdida de fidelidad no cuantificada frente a bf16.
- Carga de pesos por bloques desde disco (block streaming), pensada para entornos con memoria limitada.
- Control de reproducibilidad mediante semilla fija (`--seed`).
- Tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada y audio: no disponibles; el pipeline declarado es exclusivamente text-to-image.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).

## Casos de uso

- Generación de imágenes local en Macs de 16 GB: el usuario puede producir imágenes a 1024x1024 sin conexión y sin enviar los prompts a terceros, algo relevante en entornos con requisitos de privacidad o confidencialidad.
- Prototipado rápido de conceptos visuales y moodboards: con 4 pasos y unos 32 segundos por imagen a 1024x1024 en el hardware de referencia, es viable iterar sobre variaciones de un mismo prompt cambiando únicamente la semilla.
- Generación por lotes de assets gráficos para desarrollo: al ser una CLI (`mflux-generate-krea2`) con parámetros explícitos de resolución, scheduler y semilla, se puede invocar desde scripts o pipelines de CI para poblar conjuntos de datos de prueba o placeholders de diseño.
- Ilustración y contenido editorial offline en estaciones de trabajo Apple: la ausencia de swapouts documentada permite dejar el modelo en uso continuado sin degradar el resto del sistema.
- Diseño de interfaces y videojuegos: generación de texturas, fondos o bocetos conceptuales en un flujo de trabajo que ya transcurre en macOS y Apple Silicon, evitando mover ficheros entre máquinas.
- Experimentación e investigación en cuantización y streaming de memoria: el repositorio sirve como caso de estudio reproducible de cuantización MLX affine group size 64 y de lectura por bloques, con medidas publicadas en `docs/16gb/` del fork.
- Demostraciones docentes de modelos de difusión en hardware de consumo: permite mostrar el funcionamiento de un pipeline texto-imagen completo en un equipo de 16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Para un modelo de difusión texto-imagen estos benchmarks no son aplicables. Lo que sí se publica es una medición de rendimiento de inferencia:

| Resolución | Tiempo por paso | Pico de phys_footprint | Swapouts | Tiempo total (4 pasos) |
|---|---|---|---|---|
| 1024x1024 | 7,90 s | 6,18 GB | 0 | Aproximadamente 31,6 s (derivado) |
| 1280x1280 | 14,36 s | 6,53 GB | 0 | Aproximadamente 57,4 s (derivado) |

Condiciones de la medición: Mac mini con Apple M6, 16 GB de memoria, macOS 27.0, MLX 0.32.0, 4 pasos, scheduler `euler`, `guidance 1.0`. El método y los datos completos están en `docs/16gb/` del fork. La columna de tiempo total es una multiplicación aritmética del tiempo por paso, no una cifra publicada por el autor.

## Requisitos de hardware

- Memoria: el objetivo declarado es Apple Silicon con 16 GB de memoria unificada. El pico medido es de 6,18 GB a 1024x1024 y 6,53 GB a 1280x1280, sin swapouts.
- Plataforma: MLX sobre Apple Silicon. No se documenta soporte para CUDA, NVIDIA, AMD/ROCm ni aceleradores Intel.
- Software: requiere el fork `he-be/mflux-for-16gb` en la rama `feat/krea2-block-streaming`, porque `--block-streaming` no está en el mflux upstream. Versión de MLX de referencia: 0.32.0.
- Almacenamiento: 18,4 GB de repositorio en disco, más el espacio temporal de la descarga.
- Despliegue: la única vía documentada es la CLI `mflux-generate-krea2`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un checkpoint MLX de difusión.
- GPU recomendadas: no disponibles para GPUs discretas. El hardware de referencia es la GPU integrada de un Mac mini con chip M6 y 16 GB.
- Latencia: 7,90 s por paso a 1024x1024 y 14,36 s por paso a 1280x1280, es decir, aproximadamente 32 s y 57 s por imagen completa de 4 pasos en el equipo medido.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Descripción | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mh73772/krea-2-turbo-mflux-q8-4step | Checkpoint MLX q8 con LoRA de 4 pasos fusionada y transformer por bloques | No disponible | 8 bits MLX affine, group size 64 | No aplica | krea-2-community-license | HuggingFace, 200 descargas |
| krea/Krea-2-Turbo (base) | Modelo original del que deriva este checkpoint | No disponible | bf16 en origen (el text encoder bf16 ocupaba 8,05 GB) | No aplica | No disponible en la información proporcionada | HuggingFace |
| mflux-community/krea-2-turbo-mflux-q8 | Checkpoint MLX q8 comunitario citado como punto de partida, sin el LoRA de 4 pasos fusionado | No disponible | 8 bits MLX affine | No aplica | No disponible en la información proporcionada | HuggingFace |
| lvladikov/Krea2-Turbo-Distill-4step-LoRA | LoRA de destilación a 4 pasos usada en la fusión | Rank 64 | safetensors | No aplica | No disponible en la información proporcionada | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada, salvo que este checkpoint parte del modelo comunitario q8 y le añade el LoRA fusionado y la partición por bloques.

## Limitaciones y advertencias

- No es un producto oficial de Krea. El propio autor lo indica y remite a los ficheros `NOTICE` y `LICENSE.pdf`.
- Dependencia de un fork no oficial: `--block-streaming` no existe en mflux upstream, por lo que la ruta de ejecución depende de que ese fork se mantenga.
- Compatibilidad limitada a Apple Silicon. No hay soporte documentado para GPUs NVIDIA o AMD, lo que excluye su uso en la mayoría de servidores de inferencia.
- Licencia krea-2-community-license: las condiciones exactas de uso comercial no se detallan en la información proporcionada; hay que consultar `LICENSE.pdf` antes de cualquier despliegue en producción.
- El LoRA de destilación a 4 pasos ya está fusionado en los pesos. Aplicarlo de nuevo duplicaría su efecto y degradaría los resultados.
- El modelo está calibrado para 4 pasos, scheduler `euler` y `guidance 1.0`. Usar más pasos o valores de guidance distintos puede dar resultados peores y no está documentado.
- La cuantización a 8 bits implica una pérdida de fidelidad frente a los pesos bf16 originales. No se publica una evaluación de esa pérdida.
- Riesgo de sesgos y de contenido inapropiado heredado del modelo base y de su dataset de entrenamiento, que no se documenta en esta ficha. No hay evaluación de sesgos disponible.
- Riesgo de alucinación visual y de artefactos propios de los modelos de difusión (anatomía, texto dentro de la imagen, coherencia de escenas). No se documentan métricas de fidelidad ni de adherencia al prompt.
- Resoluciones evaluadas: solo 1024x1024 y 1280x1280. El comportamiento a otras resoluciones o relaciones de aspecto no está documentado.
- Adopción muy baja: 200 descargas y 0 likes, sin validación independiente conocida.
- Los metadatos indican fecha de creación 2026-09-23 y una versión de macOS (27.0) y MLX (0.32.0) concretas; la reproducibilidad en versiones distintas de MLX no está garantizada.
- Los resultados de la búsqueda web no contenían enlaces relacionados con el modelo, por lo que no se han podido contrastar datos con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mh73772/krea-2-turbo-mflux-q8-4step
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- LoRA de destilación a 4 pasos: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-4step-LoRA
- Fork de mflux con block streaming: https://github.com/he-be/mflux-for-16gb/tree/feat/krea2-block-streaming
- Checkpoint comunitario de partida (citado en la model card): https://huggingface.co/mflux-community/krea-2-turbo-mflux-q8
- Licencia (PDF): https://huggingface.co/mh73772/krea-2-turbo-mflux-q8-4step/blob/main/LICENSE.pdf
- Aviso legal del repositorio: https://huggingface.co/mh73772/krea-2-turbo-mflux-q8-4step/blob/main/NOTICE
