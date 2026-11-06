# diffusion-gif/trick-prediction

## Resumen

`diffusion-gif/trick-prediction` es un repositorio de pesos publicado en Hugging Face que contiene dos checkpoints de investigación para predicción de trayectorias en robótica: uno derivado de SFT (step 900) y otro de GRPO (step 250), ambos sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo nuevo ni de un entrenamiento reciente, sino de una redistribución sin pérdida de checkpoints históricos del proyecto "legacy mix6", fragmentados en 24 shards safetensors estándar. El autor lo etiqueta explícitamente como `legacy` y advierte que no corresponde al protocolo de tareas más reciente (imagen única/histórico conjunto con orígenes EEF fijos).

El interés técnico del repositorio es acotado pero específico: preserva los tensores originales, claves, shapes, valores BF16 y ficheros de configuración/tokenizer/processor sin modificar, junto con manifiestos de integridad (SHA256 por tensor, `bundle_manifest.json`, `reshard_manifest.json`). La arquitectura subyacente es `Qwen3_5ForConditionalGeneration` (model_type `qwen3_5`), un modelo multimodal de tipo image-text-to-text, guardado con Transformers 5.9.0. Cada checkpoint pesa aproximadamente 54,7 GB en BF16, con un total de unos 109,4 GB en el repositorio.

Es relevante ahora únicamente para investigadores que necesiten reproducir la línea base histórica de predicción de trayectorias con el protocolo mix6 original (prompts, representación multipunto, normalización de coordenadas y evaluación). No es un modelo listo para producción ni un artefacto con benchmarks publicados: el propio autor declara que no se han reproducido métricas de paper ni de ejecución robótica, y que la verificación de hashes no constituye una validación de precisión de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (model_type `qwen3_5`), transformer multimodal image-text-to-text |
| Parametros totales | no disponible (peso por checkpoint ~54,7 GB en BF16; 1.184 tensores por checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; el config SFT declara `float32` pero los tensores almacenados son BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor remite a `LICENSES/UPSTREAM.md` para licencias de componentes upstream; no se unifica licencia) |
| Formato de pesos | safetensors (24 shards, <=5.000.000.000 bytes por fichero, ~109,427 GB totales) |

## Arquitectura y entrenamiento

El repositorio no entrena nada: publica dos checkpoints completos (no LoRA) de un modelo basado en Qwen3.8-27B con arquitectura `Qwen3_5ForConditionalGeneration`, orientado a entrada image-text-to-text y especializado en predicción de trayectorias. Cada checkpoint contiene 1.184 tensores distribuidos en 12 shards safetensors; los tensores se conservan bit a bit en BF16, con las mismas claves, shapes y ficheros de configuración, tokenizer y processor originales. Los dos checkpoints corresponden a etapas distintas del pipeline histórico: SFT en el step 900 y GRPO en el step 250.

El autor advierte de que el config original de SFT declara `float32` como dtype pese a que los tensores almacenados son BF16, por lo que es necesario cargar explícitamente en `torch.bfloat16` para no inflar el consumo de memoria. También se preservan diferencias históricas entre configuraciones (MTP/EOS) en lugar de unificarlas. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni detalles del proceso de RLHF/DPO más allá de la mención a GRPO. El código de entrenamiento, datos y protocolos de evaluación está en un repositorio privado (`coisini-gif/trick_prediction`) que requiere acceso.

## Capacidades

- Predicción de trayectorias robóticas a partir de entradas imagen-texto, bajo el protocolo histórico mix6 (prompt, representación multipunto, normalización de coordenadas).
- Procesamiento multimodal image-text-to-text heredado de la arquitectura Qwen3.5 subyacente.
- Dos variantes de comportamiento: una ajustada por SFT (step 900) y otra por GRPO (step 250), lo que permite comparar estilos de ajuste sobre la misma base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio especiales: no disponible; solo se documenta la pipeline image-text-to-text.

## Casos de uso

- Reproducción de líneas base históricas en investigación de predicción de trayectorias: cargar `legacy_sft_step900` o `legacy_grpo_step250` con el prompt, representación multipunto y normalización originales para comparar resultados con publicaciones previas del grupo.
- Estudio comparativo SFT frente a GRPO: al publicarse ambos checkpoints con los mismos tensores base, permite aislar el efecto del ajuste por refuerzo (GRPO) respecto al ajuste supervisado en la misma tarea.
- Auditoría de integridad de artefactos de investigación: el repositorio incluye `bundle_manifest.json`, `CHECKSUMS.sha256`, `reshard_manifest.json` y `safetensors_reader_validation.json`, útiles para verificar que los pesos descargados coinciden con los originales antes de experimentar.
- Desarrollo de herramientas de verificación de bundles: `tools/verify_model_bundle.py` y `tools/reshard_safetensors.py` (con tests) sirven como referencia para validar y re-fragmentar safetensors en CPU sin GPU.
- Base para experimentos de predicción de trayectorias en robótica con protocolos propios: investigadores que quieran partir de un checkpoint ya ajustado en la tarea en lugar de un Qwen3.8-27B genérico.
- Docencia y formación en pipelines multimodales: el repositorio ejemplifica el manejo de checkpoints multi-subfolder, carga en BF16 y verificación de hashes en un contexto realista de modelos de decenas de GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama reproducción de métricas de paper ni de ejecución robótica, y que la verificación de integridad de ficheros no equivale a una prueba de precisión de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: cada checkpoint pesa ~54,7 GB en BF16, por lo que se necesitan al menos ~55 GB de VRAM solo para pesos, más KV cache y memoria de activaciones; con cuantización no disponible en el repositorio, no se puede reducir por debajo de ese umbral sin aplicar cuantización propia.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU con `device_map="auto"`; una sola RTX 4090 (24 GB) no es suficiente para cargar el checkpoint completo en BF16.
- ¿Cabe en GPU consumer? No en BF16 con una sola GPU de consumo; requeriría cuantización externa (no publicada) o reparto multi-GPU.
- Opciones de despliegue: `transformers` (versión que soporte `qwen3_5`, según el autor 5.9.0) con PyTorch y `accelerate`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el autor indica que no se ha validado la inferencia en GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `diffusion-gif/trick-prediction` (SFT/GRPO) | no disponible (~54,7 GB BF16 por checkpoint) | no disponible | Predicción de trayectorias robóticas (image-text-to-text) | no disponible | Hugging Face, público, multi-subfolder |
| Qwen/Qwen3.8-27B (base) | ~27B (según nombre) | no disponible | Modelo multimodal generalista | no disponible en esta ficha | Hugging Face |
| Alternativas específicas de predicción de trayectorias | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El autor declara explícitamente que estos checkpoints son `legacy` y no corresponden al protocolo de tareas más reciente (imagen única/histórico conjunto con orígenes EEF fijos); usarlos fuera del protocolo mix6 original invalida la comparación.
- No se publican datos de entrenamiento, CoT, estados de optimizer/RNG, logs ni vídeos; el repositorio contiene solo pesos y metadatos.
- El código de entrenamiento, datos y evaluación está en un repositorio privado con acceso restringido, lo que limita la reproducibilidad completa.
- La licencia no está disponible de forma unificada; el autor remite a `LICENSES/UPSTREAM.md` y advierte de que cada componente upstream conserva su propia licencia, por lo que el uso comercial requiere revisión legal caso por caso.
- El config SFT declara `float32` pero los tensores son BF16: cargar sin especificar `torch.bfloat16` puede duplicar el consumo de memoria.
- Es un repositorio multi-checkpoint: es obligatorio especificar `subfolder` en la carga; apuntar a la raíz del repositorio falla.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero al ser un modelo multimodal de propósito general ajustado a una tarea específica, no debe asumirse robustez fuera de la distribución de entrenamiento.
- No se han validado la inferencia en GPU ni las métricas de precisión; la verificación de hashes solo garantiza integridad de ficheros.
- El tamaño del repositorio (~109,4 GB) y la necesidad de Transformers 5.9.0 o superior con soporte para `qwen3_5` añaden fricción operativa para su despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/diffusion-gif/trick-prediction
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Código de entrenamiento, datos y evaluación (privado, requiere acceso): https://github.com/coisini-gif/trick_prediction
- Otros enlaces (papers, blogs, demos): no disponibles en la información proporcionada.
