# mydubber-org/voxcpm2-int4

## Resumen

VoxCPM2-int4 es una versión pre-cuantizada del modelo de texto a voz (TTS) VoxCPM2, desarrollada por mydubber-org a partir de los pesos originales de OpenBMB. No se trata de un nuevo entrenamiento ni de un fine-tuning: es una copia modificada de los pesos de `openbmb/VoxCPM2` (compromiso `32279effe8c19989596f05d353d1447f51d9e915`) optimizada para servir como backend local de la aplicación myDubber, eliminando así el coste de cuantizar en tiempo de carga.

La motivación principal es operativa: los workers del servidor de myDubber mantienen el modelo en memoria y necesitan cargarlo rápidamente sin transformaciones en runtime (sin cuantización al arrancar, sin folding de weight-norm, sin torchao en ejecución). El repo pesa 2,5 GB y contiene un único `model.safetensors` de 2,29 GB con los 924.370.244 parámetros del modelo, de los cuales 252 módulos lineales de los modelos de lenguaje (base y residual) están cuantizados a int4 con el algoritmo tinygemm de PyTorch.

Su relevancia reside en que demuestra un patrón útil para despliegues locales de TTS: pre-construir los pesos cuantizados y plegados una sola vez, con un hash sha256 publicado para verificación de integridad, garantizando además que las salidas son idénticas byte a byte a las del modelo cuantizado en carga según el harness de pruebas de dubber.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en LMs (base y residual) + codec audio VAE + DiT; no disponible el detalle completo |
| Parametros totales | 924.370.244 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 weight-only (tinygemm, grupos de 128, `Int4WeightOnlyConfig(group_size=128, int4_packing_format="tile_packed_to_4d")`) en 252 lineales de los LMs; resto en bf16; codec en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (2,29 GB, sha256 `6bc480d70d58007fdc4b24406ca18b16a552a99fd7fc4daa34be9526c86f705a`) |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento propio: es una reempaquetación de los pesos de VoxCPM2 de OpenBMB. Las modificaciones respecto al original son tres. Primera, los módulos lineales de los modelos de lenguaje (base y residual), 252 en total, se cuantizan a int4 weight-only en grupos de 128 mediante torchao 0.18.0 con el formato de empaquetado `tile_packed_to_4d` (algoritmo tinygemm). Los pesos se almacenan como tensores planos: `<module>.qdata` en int32 con el layout de `torch.ops.aten._convert_weight_to_int4pack` sobre CUDA (inner_k_tiles 8, torch 2.11.0+cu128) y `<module>.scale_and_zero` en bf16 con forma `[in/128, out, 2]`. La computación usa `torch.ops.aten._weight_int4pack_mm`.

Segunda, el weight-norm del codec de audio (`audio_vae.*`) se pliega en pesos planos mediante `torch.nn.utils.remove_weight_norm`, manteniéndolo en float32 como lo ejecuta el modelo original. Tercera, todo lo demás conserva los tensores originales en bf16: la tabla de embeddings de texto, el encoder de características y el DiT (diffusion transformer) no se modifican. El archivo de configuración añade una sección `prebuilt` que lista los módulos int4 y las versiones empleadas, y el codec que antes era un `audiovae.pth` separado ahora va integrado dentro de `model.safetensors`.

Sobre los datos de entrenamiento, el número de tokens, la composición del dataset o el uso de RLHF/DPO del modelo base VoxCPM2: no disponible en la información proporcionada.

## Capacidades

- Texto a voz (pipeline `text-to-speech`), heredado del modelo base VoxCPM2.
- Voice cloning (clonación de voz), indicado en las etiquetas del repositorio.
- Inferencia acelerada en GPU NVIDIA gracias a la cuantización int4 tinygemm, sin penalización de transformaciones en tiempo de carga.
- Carga determinista: las salidas son byte-idénticas a las de cuantizar el modelo original en carga, según el harness de validación de dubber.
- Integración como backend local de la aplicación myDubber (doblaje/sincronización de audio según el proyecto dubber).

No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües explícitas (no aplica directamente al ser un modelo TTS, aunque el idioma de síntesis no está documentado en la ficha).

## Casos de uso

- Backend de doblaje local en myDubber: el caso de uso para el que fue construido; los workers del servidor cargan el modelo pre-cuantizado en memoria y generan audio sin cuantización en arranque, reduciendo el tiempo de puesta en marcha.
- Servicios de TTS autoalojados: al ser Apache-2.0 y pesar solo 2,29 GB, puede desplegarse en servidores propios para generar locuciones sin depender de APIs de terceros.
- Clonación de voz en aplicaciones: la etiqueta voice-cloning permite replicar una voz a partir de muestras, útil para doblaje de vídeos o audiolibros con voz consistente.
- Producción de contenido audiovisual: generación de pistas de voz para vídeos, podcasts o material formativo, integrando el modelo en pipelines de renderizado.
- Despliegues en GPU con memoria limitada: la cuantización int4 de los LMs reduce la huella de memoria respecto al modelo en bf16, facilitando su uso en GPUs de gama alta de consumo.
- Verificación de integridad en despliegues reproducibles: el sha256 publicado del safetensors permite validar el artefacto en pipelines de CI/CD antes de servirlo.
- Investigación en cuantización de modelos de audio: sirve como ejemplo real de cuantización int4 weight-only con torchao aplicada a un sistema TTS completo (LM + codec + DiT).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación mencionada es el harness S12 de dubber, que confirma que las salidas del modelo pre-construido son byte-idénticas a las de cuantizar en carga; no se publican métricas de calidad de voz (MOS, WER, similitud de hablante) ni de latencia.

## Requisitos de hardware

- La computación int4 tinygemm requiere una GPU NVIDIA con compute capability 8.0 o superior (Ampere o más reciente: A100, A6000, RTX 3090, RTX 4090, H100, entre otras).
- VRAM estimada: no disponible de forma explícita; el repo pesa 2,29 GB en disco, por lo que la huella en GPU debería ser del orden de unos pocos GB más las activaciones, pero no se publica una cifra.
- No es compatible con ROCm con este empaquetado: la model card indica que el layout de empaquetado es el propio de torch sobre CUDA y que ROCm empaqueta de forma diferente.
- Ejecución en CPU: no disponible; la computación depende de `torch.ops.aten._weight_int4pack_mm` sobre GPU NVIDIA.
- Despliegue: cargado mediante `dub_pipeline.fast_voxcpm2.load_prebuilt` del proyecto dubber. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Versiones de software relevantes: torchao 0.18.0, torch 2.11.0+cu128. Otras versiones de torch pueden empaquetar los pesos de forma distinta, lo que rompería la compatibilidad del layout.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|
| mydubber-org/voxcpm2-int4 | 924,4 M (totales) | int4 (252 lineales) + bf16 + float32 (codec) | Apache-2.0 | Build pre-cuantizado para CUDA, orientado a despliegue local en myDubber |
| openbmb/VoxCPM2 (modelo base) | no disponible | bf16 (pesos originales) | Apache-2.0 | Pesos upstream sin modificar; requiere cuantizar o plegar en tiempo de carga si se quiere int4 |
| Alternativas TTS con clonación de voz (p. ej. XTTS, F5-TTS) | no disponible | no disponible | no disponible | No hay datos suficientes en la información proporcionada para una comparación rigurosa |

No se han publicado comparaciones de rendimiento contra otros sistemas TTS en la información disponible.

## Limitaciones y advertencias

- Dependencia estricta de versiones: el layout int4 corresponde a torch 2.11.0+cu128; otras versiones de torch (y ROCm en particular) pueden empaquetar de forma distinta e incompatibilizar los pesos.
- Requiere GPU NVIDIA con compute capability >= 8.0; no funciona en CPUs ni en GPUs más antiguas (Arquitecturas Turing o previas).
- Sesgos: no disponible; al heredar los pesos de VoxCPM2, los sesgos del modelo base se trasladan íntegramente, y no se han documentado en esta ficha.
- Riesgo de alucinación: no aplicable directamente a un modelo TTS, aunque los sistemas de síntesis de voz pueden producir errores de pronunciación o prosodia; no hay datos publicados al respecto.
- Limitaciones de idioma: no disponible; no se documenta qué idiomas soporta la síntesis.
- Restricciones de licencia: Apache-2.0 permite uso comercial; los derechos de los pesos corresponden a los autores de VoxCPM2 (OpenBMB) y la copia modificada debe cumplir la sección 4(b) de la licencia, que exige indicar las modificaciones realizadas.
- No hay entrenamiento propio: cualquier mejora de calidad respecto al modelo base no debe esperarse de este repo; su valor es exclusivamente de despliegue (carga rápida y determinista).
- Sin benchmarks de calidad de voz publicados para esta build específica; la única garantía ofrecida es equivalencia byte a byte con la cuantización en carga.
- Métricas de comunidad nulas en el momento de redacción (0 descargas, 0 likes), por lo que no existe historial de uso que respalde su estabilidad en producción fuera del proyecto myDubber.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mydubber-org/voxcpm2-int4
- Modelo base (OpenBMB): https://huggingface.co/openbmb/VoxCPM2
- Script de construcción de los pesos: https://github.com/vladbehash/dubber/blob/main/tools/model-builds/src/model_builds/voxcpm2.py
- Proyecto dubber: https://github.com/vladbehash/dubber
- Paper, demo y blog: no disponible
