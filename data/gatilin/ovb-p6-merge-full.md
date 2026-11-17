# gatilin/ovb-p6-merge-full

## Resumen

`gatilin/ovb-p6-merge-full` es un pipeline completo de difusión `QwenImage21Pipeline` para tareas de imagen a imagen, publicado por el usuario gatilin. No se trata de un adaptador LoRA, sino de la fusión exacta del adaptador `khazic/ovb-i127-merge-eval` (subcarpeta `merged/P6`, rango 128) sobre el pipeline base `Melo111/Fusion-C1-KQ0r128-60-40`, mediante `PEFT merge_and_unload(safe_merge=True)` sobre 224 módulos. El resultado es un Transformer fusionado en `bfloat16` que ya incorpora la contribución del adaptador.

El modelo resuelve un problema muy concreto: distribuir un artefacto autocontenido que no requiera descargar el adaptador padre ni el modelo base en tiempo de carga, eliminando enlaces simbólicos locales. Está orientado a tareas de visión condicionadas por instrucción: estimación de profundidad con mapa de color fijo, segmentación semántica, de instancia y referencial (open-vocabulary), y generación de imágenes.

Con 7.115.124.736 parámetros y un repositorio de 33,1 GB, es relevante ahora como ejemplo de flujo de trabajo de fusión reproducible y verificable (hashes por fichero, comprobación de fórmulas LoRA), aunque su validación funcional está incompleta: el autor declara explícitamente que la construcción offline del pipeline y la inferencia de imagen no se verificaron.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Qwen-Image-2.1), pipeline `QwenImage21Pipeline` con Transformer, text encoder congelado, VAE, tokenizer y scheduler |
| Parámetros totales | 7.115.124.736 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos almacenados en `bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | `qwen-research` (etiqueta `license: other`), uso solo para investigación y evaluación, no comercial |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo es un pipeline de difusión de imagen completo basado en Qwen-Image-2.1. El Transformer fusionado se obtiene aplicando `PEFT merge_and_unload(safe_merge=True)` sobre 224 módulos LoRA con rango 128 y alpha 128, dirigidos a `img_mlp.gate_layer`, `to_q`, `to_k`, `img_mlp.out`, `to_out.0`, `to_v` y `img_mlp.proj`. La fusión es una combinación ponderada exacta de ΔW (r128) de la rama B: base fusionada al 20 %, step 17500 al 55 % y step 100000 al 25 %. El dtype almacenado es `bfloat16` y el toolchain de fusión fue torch 2.6.0+cu124, diffusers 0.41.0, transformers 5.19.0 y peft 0.21.2.

Este export no añade pasos de optimización ni entrenamiento nuevo: solo pliega pesos de adaptadores publicados en su base publicada. No es un checkpoint de estado de entrenamiento (sin estado de optimizador, scheduler ni RNG), por lo que sirve como inicialización desde cero y no como reanudación exacta del run original. La selección original del checkpoint usó el protocolo de EMA de flow-loss macro del run, pero el comportamiento en benchmarks de esta exportación fusionada no se volvió a medir.

## Capacidades

- Generación de imágenes condicionada por instrucción de tarea a partir de una imagen RGB de entrada.
- Estimación de profundidad con mapa de color fijo.
- Segmentación semántica.
- Segmentación de instancia.
- Segmentación referencial (referring segmentation).
- Segmentación de vocabulario abierto (open-vocabulary segmentation).
- Carga como Transformer completo independiente (`QwenImage21Transformer2DModel`) para reinicialización con gradientes.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio adicional: no disponible.

## Casos de uso

- Estimación de profundidad en pipelines de visión por computador: el modelo acepta una imagen RGB y una instrucción de tarea y devuelve un mapa de profundidad visualizado con un mapa de color fijo, útil para previsualización rápida o como etapa intermedia en reconstrucción 3D.
- Segmentación semántica automatizada: permite obtener máscaras por clase sobre imágenes de entrada, aprovechable en anotación asistida o preetiquetado de datasets.
- Segmentación de instancia para conteo y análisis de escenas: adecuado para tareas donde se necesita separar objetos individuales de la misma clase en una imagen.
- Segmentación referencial guiada por lenguaje: el contrato del proyecto permite condicionar la máscara a una instrucción textual, útil en interfaces de edición selectiva de imágenes.
- Segmentación de vocabulario abierto: permite segmentar categorías no vistas durante el entrenamiento, apropiado para dominios especializados donde no existe un conjunto cerrado de clases.
- Punto de partida para fine-tuning: al ser un Transformer completo en `bfloat16` con `requires_grad_(True)`, puede usarse como inicialización para nuevos entrenamientos en lugar de partir del modelo base más adaptador.
- Reproducción de flujos de fusión LoRA: sirve como referencia verificable de un proceso de merge con hashes por fichero y comprobación de fórmulas, útil para auditar pipelines de integración de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el comportamiento en benchmarks de esta exportación fusionada no se volvió a medir y que la inferencia de imagen no está verificada (`image_inference` es `false` en `merge_metadata.json`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 7.115.124.736 parámetros en `bfloat16` (2 bytes por parámetro), solo los pesos del Transformer rondan los 14,2 GB; a ello hay que sumar text encoder, VAE y activaciones, por lo que se requiere holgadamente más memoria que la del Transformer aislado.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, un despliegue en `bfloat16` encaja en GPUs de 24 GB o más solo con offloading; GPUs de 40-80 GB (A100, H100) son el entorno natural para el pipeline completo.
- Cabe en GPU de consumo: no hay confirmación del autor. El uso de `enable_model_cpu_offload()` en el ejemplo de la model card sugiere que el pipeline completo no cabe cómodamente en VRAM de consumo sin offloading.
- Opciones de despliegue: `diffusers` con `QwenImage21Pipeline.from_pretrained` y `enable_model_cpu_offload()`; carga del Transformer aislado con `QwenImage21Transformer2DModel.from_pretrained(repo, subfolder="transformer")`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline de difusión de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gatilin/ovb-p6-merge-full` | 7.115.124.736 | no disponible | Imagen a imagen (profundidad, segmentación, generación) | `qwen-research` (no comercial) | Hugging Face, 16 descargas |
| `Melo111/Fusion-C1-KQ0r128-60-40` (base) | no disponible | no disponible | Imagen a imagen | no disponible | Hugging Face |
| `khazic/ovb-i127-merge-eval` (adaptador origen) | no disponible (LoRA r128) | no disponible | Imagen a imagen | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Inferencia no validada: el autor declara que `offline_full_pipeline_loading` e `image_inference` son `false`; los resultados deben considerarse no validados hasta reproducir un forward pass.
- No es un checkpoint de entrenamiento: no incluye estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el run original de forma exacta.
- Sin medición de benchmarks: el comportamiento de esta exportación fusionada no se volvió a medir tras la fusión.
- Licencia restrictiva: licencia `qwen-research`, solo para investigación y evaluación, uso no comercial; se aplican los términos de Qwen y de los repositorios padre.
- No aplicar el adaptador padre de nuevo: el Transformer fusionado ya contiene su contribución; volver a aplicarlo duplicaría el efecto.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible para esta modalidad; en tareas de segmentación y profundidad el riesgo se traduce en máscaras o mapas incorrectos sin garantía de calibración.
- Limitaciones de contexto o idioma: no disponible.
- Caveat de producción: al no estar verificada la inferencia, no se recomienda su uso en producción sin una validación propia previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gatilin/ovb-p6-merge-full
- Modelo base: https://huggingface.co/Melo111/Fusion-C1-KQ0r128-60-40
- Adaptador origen: https://huggingface.co/khazic/ovb-i127-merge-eval
- Repositorio del proyecto: https://github.com/isLinXu/open-vision-banana
- Script de fusión: https://github.com/isLinXu/open-vision-banana/blob/main/scripts/merge_qwen_image21_lora.py
- Metadatos de fusión: https://huggingface.co/gatilin/ovb-p6-merge-full/blob/main/merge_metadata.json
- Licencia: https://huggingface.co/gatilin/ovb-p6-merge-full/blob/main/LICENSE
- Aviso legal: https://huggingface.co/gatilin/ovb-p6-merge-full/blob/main/NOTICE.txt
