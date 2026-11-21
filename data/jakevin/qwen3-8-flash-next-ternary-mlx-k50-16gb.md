# Jakevin/Qwen3.8-Flash-Next-ternary-mlx-K50-16GB

## Resumen
Qwen3.8-Flash-Next-ternary-mlx-K50-16GB es un paquete de inferencia listo para ejecutar publicado por el usuario Jakevin en Hugging Face, derivado de su propio modelo base Qwen3.8-Flash-Next-ternary-mlx-K50. No se trata de un modelo entrenado desde cero, sino de una distribución empaquetada que incluye los pesos del modelo base, los expertos ternarios ya convertidos al formato nativo de 2 bits de la librería mlx-ternary y un runner propio para generar texto en Apple Silicon. El paquete ocupa aproximadamente 65 GB e integra todo lo necesario para arrancar sin descargas adicionales ni pasos de conversión.

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) y pesos ternarios en los expertos enrutados, implementado sobre MLX (el framework de Apple para silicio propio) y con el código de modelo `qwen4_exp` que proporciona oMLX 0.7.2. El modelo está pensado para ejecutarse en Macs con Apple Silicon y macOS 15 o superior, con un consumo de disco de unos 66 GB libres y una caché residente de expertos calientes configurable (1,5 GB por defecto).

La relevancia de esta ficha es doble: por un lado, documenta una técnica poco habitual (cuantización ternaria de expertos MoE combinada con carga selectiva desde SSD y prefetch por capas) y, por otro, advierte de que la validación publicada por el autor es un smoke test de 8 tokens sobre dos prompts en un Mac de 16 GB, sin verificación independiente. Cualquier evaluación de producción debe tratar los datos de rendimiento como no confirmados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos ternarios (código de modelo `qwen4_exp` sobre MLX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados ternarios en layout nativo de 2 bits (mlx-ternary); embeddings y lm_head en 8 bits; etiqueta `fp8` en los tags del repo |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (campo `license: other`, `license_name: qwen-community-1.0`); runner Apache-2.0 |
| Formato de pesos | safetensors (skeleton y nonexpert), `codes.bin`/`scales.bf16`/`bias.bf16` por capa, `nat/` con `codes_nat.bin` en 2 bits, tablas PLE en `ple/` |

## Arquitectura y entrenamiento
El modelo base es un transformer con mezcla de expertos en el que los expertos enrutados se almacenan en representación ternaria (valores -1, 0, +1) y se empaquetan en un layout nativo de 2 bits propio de mlx-ternary. El repositorio separa los componentes: `skeleton.safetensors` contiene embeddings y lm_head en 8 bits; `nonexpert.safetensors` agrupa normas, hiperconexiones, proyecciones de atención y PLE, y routers; las capas `L00`–`L47` contienen los packs de expertos y densos con sus índices, códigos, escalas y sesgos; y `ple/` aloja tablas de n-gramas PLE leídas por mmap. El runner convierte una sola vez los expertos ternarios del layout base-3 al layout nativo de 2 bits, con verificación byte a byte mediante `verify_nat.py`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card solo describe el empaquetado y el runtime, no el proceso de entrenamiento del modelo base. Las innovaciones técnicas documentadas son de inferencia: sincronización batcheada (`mx.eval` cada cuatro expertos en decodificación en lugar de cada uno), caché residente de expertos marcados como `hot` (1,5 GB por defecto), prefetch local a la capa con cuatro hilos de trabajo hasta dos expertos por delante y un búfer temporal limitado a 64 MiB. El autor indica explícitamente que no hay kernel fusionado multi-experto y que el prefetch no predice rutas de capas posteriores.

## Capacidades
- Generación de texto conversacional y de código: el runner de ejemplo propone prompts como "Write a Python function that ...".
- Ejecución local en Apple Silicon mediante MLX, sin dependencia de CUDA ni de servicios en la nube.
- Carga selectiva de expertos desde SSD con caché residente de expertos calientes, lo que permite operar un MoE de gran tamaño en máquinas con memoria unificada limitada.
- Prefetch por capas con hilos de trabajo para solapar la lectura de expertos con el cálculo.
- Plantilla de chat incluida (`chat_template.jinja`), lo que habilita el uso conversacional multi-turno.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas no está cumplimentado en el repositorio.

## Casos de uso
- Inferencia local en Mac de 16 GB: el paquete está diseñado para arrancar en un Mac con Apple Silicon, macOS 15, Python 3.11 y unos 66 GB libres, usando el runner incluido y la caché de expertos calientes de 1,5 GB por defecto. Es adecuado para desarrolladores que quieren probar un MoE ternario sin montar infraestructura GPU.
- Evaluación de cuantización ternaria: investigadores interesados en el impacto de pesos ternarios en expertos MoE pueden usar este repositorio como referencia reproducible, ya que incluye el conversor y el verificador byte a byte del layout nativo.
- Prototipado de asistentes de código en local: el ejemplo del runner genera funciones Python; encaja en flujos de trabajo offline donde no se quiere enviar código a una API externa.
- Banquito de técnicas de offloading: la combinación de caché residente, prefetch por capas y sincronización batcheada sirve para medir el efecto de cada técnica sobre tokens/s en memoria unificada, modificando `--resident-gb`, `PF_ON`, `PF_VERIFY` y `PF_MAX_MB`.
- Experimentación con plantillas de chat: al incluir `chat_template.jinja` y tokenizer completo, se puede integrar en pipelines conversacionales propios sobre MLX.
- Docencia y formación técnica: el repositorio es un ejemplo completo de empaquetado reproducible (config, tokenizer, pesos por capas, runner y scripts de conversión/verificación) útil para explicar cómo se distribuye un modelo cuantizado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta un smoke test de 8 tokens de salida sobre dos prompts en un Mac de 16 GB, comparando el texto generado con la referencia de tokens c73, y advierte de que es una comparación de bytes de texto, no de igualdad de token-ID, que no fue una prueba de descarga limpia y que no ha sido verificada de forma independiente. Las mediciones de tokens/s mencionadas por el autor provienen de un runner de desarrollo anterior (c73) con directorios de pesos locales separados, no de este release empaquetado.

## Requisitos de hardware
- Almacenamiento: unos 66 GB libres para el modelo, más espacio para el entorno Python y el sistema; el repositorio pesa 65,1 GB y `nat/` unos 7,7 GB.
- Memoria: el autor reporta ejecución en un Mac de 16 GB; la caché residente de expertos calientes es configurable con `--resident-gb` (1,5 GB por defecto).
- Plataforma: Apple Silicon exclusivamente, macOS 15 o superior, Python 3.11.
- GPU: no aplica CUDA; el runtime es MLX 0.32.4 (fijado por oMLX 0.7.2), mlx-lm (commit `94cdcae1`) y mlx-vlm (commit `97902318`).
- Despliegue: runner propio `runner/run.py` sobre oMLX 0.7.2 y mlx-ternary 0.3.0; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible para este release; el autor remite a mediciones de una configuración anterior y no las presenta como benchmark de este paquete.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (MoE ternario empaquetado para MLX) ni datos de rendimiento que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias
- Validación limitada: el único test reportado es un smoke test de 8 tokens sobre dos prompts, sin verificación independiente y sin prueba de descarga limpia.
- Los datos de tokens/s citados corresponden a un runner anterior (c73) con directorios de pesos separados, no a este release.
- El directorio descargado debe ser escribible: el runner crea un fichero de sello en `nat/` en la primera ejecución y rechaza generar si la comprobación falla o si el sello existente no coincide.
- La comprobación inicial de `nat/` tardó unos dos minutos en los Macs del desarrollador y no se ha cronometrado para este layout empaquetado en el Mac de 16 GB.
- No hay kernel fusionado multi-experto: cada experto seleccionado se ejecuta como su propia multiplicación de matrices, lo que limita el throughput.
- El prefetch es local a la capa y no predice rutas de capas posteriores; el límite de 64 MiB cubre solo los búferes de datos de prefetch, no toda la memoria del proceso.
- Restricciones de licencia: los pesos están bajo Qwen Community License 1.0, no una licencia permisiva; es necesario revisar `LICENSE` antes de uso comercial. El runner es Apache-2.0.
- Idiomas soportados, sesgos conocidos y riesgo de alucinación: no disponible en la información proporcionada.
- Dependencia de Apple Silicon y macOS 15: no es desplegable en GPUs NVIDIA ni en Linux sin trabajo adicional no documentado.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-ternary-mlx-K50-16GB
- Modelo base: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-ternary-mlx-K50
- oMLX (runner y código de modelo `qwen4_exp`): https://github.com/jundot/omlx
- Release de oMLX 0.7.2: https://github.com/jundot/omlx/releases/download/v0.7.2/omlx-0.7.2-cp311-cp311-macosx_15_0_universal2.whl
- mlx-ternary (commit `e6270bc2`): https://github.com/Jakevin/mlx-ternary
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
