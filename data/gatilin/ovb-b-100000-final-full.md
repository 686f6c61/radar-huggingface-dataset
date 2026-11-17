# gatilin/ovb-b-100000-final-full

## Resumen

`gatilin/ovb-b-100000-final-full` es un pipeline completo de difusión para tareas de imagen a imagen, construido sobre la arquitectura Qwen-Image-2.1. Lo publica el usuario gatilin como exportación final de una ejecución de ajuste fino (I108-B) del proyecto Open Vision Banana, y no es un adaptador LoRA, sino el resultado de fusionar de forma exacta un adaptador PEFT (rango 64, alpha 64, rsLoRA) sobre el transformer de un pipeline base publicado por Melo111. El transformer fusionado ya incorpora la contribución del adaptador, por lo que no debe volver a aplicarse el adaptador padre.

El modelo resuelve tareas de visión condicionadas por instrucción: estimación de profundidad, segmentación semántica, de instancia y referida, y generación de imágenes. Recibe una imagen RGB junto con una instrucción de tarea y devuelve una visualización (mapa de color fijo para profundidad, máscaras para segmentación o una imagen generada). Su relevancia es doble: por un lado, demuestra un flujo reproducible de fusión LoRA sobre modelos de difusión multimodales; por otro, sirve como punto de partida completo y autocontenido para reentrenamiento o evaluación, sin necesidad de descargar el adaptador ni el modelo base en tiempo de carga.

El artefacto pesa 33,1 GB, almacena los pesos en `bfloat16` y contiene 7.115.124.736 parámetros totales según el archivo safetensors. La licencia es `qwen-research` (etiquetada como `other`), lo que restringe el uso a investigación y evaluación, sin fines comerciales. No se han publicado idiomas soportados ni resultados de benchmarks para esta exportación concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión Qwen-Image-2.1 (`QwenImage21Transformer2DModel`) con text encoder congelado, VAE, tokenizer y scheduler |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en `bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | `qwen-research` (etiqueta `other`); uso solo para investigación y evaluación, no comercial |
| Formato de pesos | `safetensors` (librería `diffusers`) |

## Arquitectura y entrenamiento

El modelo es un pipeline de difusión completo de la familia Qwen-Image-2.1. El transformer fusionado se ha obtenido mediante `PEFT merge_and_unload(safe_merge=True)` sobre 224 módulos, partiendo de un adaptador LoRA de rango 64 y alpha 64 con rsLoRA, entrenado hasta el paso 100000. Los módulos objetivo del adaptador fueron `img_mlp.gate_layer`, `img_mlp.out`, `img_mlp.proj`, `to_out.0`, `to_q`, `to_k` y `to_v`. El resultado se almacena en `bfloat16` y se acompaña del text encoder, VAE, processor/tokenizer y scheduler copiados byte a byte del pipeline base en la revisión fijada.

No se ha realizado entrenamiento adicional durante la exportación: solo se han plegado los pesos del adaptador publicado sobre su base publicada. La herramienta de fusión se ejecutó con torch 2.6.0+cu124, diffusers 0.41.0, transformers 5.19.0 y peft 0.21.2. El autor advierte que este checkpoint no conserva estado de optimizador, scheduler ni RNG, por lo que sirve como inicialización nueva y no como reanudación exacta del entrenamiento original. Tampoco se ha vuelto a medir el comportamiento en benchmarks de esta exportación fusionada.

## Capacidades

- Generación de imágenes condicionada por instrucción a partir de una imagen de entrada RGB.
- Estimación de profundidad con mapa de color fijo.
- Segmentación semántica, de instancia y referida (open-vocabulary segmentation).
- Tareas de imagen a imagen en general mediante el pipeline `QwenImage21Pipeline`.
- Uso como inicialización completa del transformer (`QwenImage21Transformer2DModel`) para reentrenamiento con `requires_grad_(True)`.
- Carga autocontenida sin descargar el adaptador padre ni el modelo base en tiempo de ejecución.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio adicional: no disponible más allá de las tareas de imagen descritas.

## Casos de uso

- Estimación de profundidad monocular en pipelines de investigación: se introduce una imagen RGB con la instrucción de tarea y el modelo devuelve un mapa de profundidad visualizado con el mapa de color del proyecto, útil para evaluación comparativa de modelos de profundidad.
- Segmentación semántica y de instancia para anotación asistida: el modelo genera máscaras a partir de una imagen y una instrucción, lo que permite prototipar flujos de etiquetado en conjuntos de datos de visión.
- Segmentación referida por lenguaje: al aceptar una instrucción textual junto a la imagen, permite aislar objetos descritos en lenguaje natural, adecuado para experimentos de open-vocabulary segmentation.
- Generación de imágenes imagen a imagen en investigación: sirve como base para estudiar edición y transformación de imágenes con modelos de difusión de gran tamaño.
- Punto de partida para reentrenamiento: al cargarse como `QwenImage21Transformer2DModel` con gradientes activados, permite iniciar nuevos ajustes finos sin depender del adaptador original.
- Reproducibilidad de fusiones LoRA: el repositorio incluye `merge_metadata.json` con hashes SHA-256 de cada archivo y comprobaciones de las fórmulas de fusión, lo que lo convierte en un caso de referencia para validar herramientas de merge.
- Evaluación offline de pipelines de difusión: al ser autocontenido, se puede desplegar en entornos sin acceso al modelo base ni al adaptador, simplificando la reproducibilidad en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el comportamiento en benchmarks de esta exportación fusionada no se volvió a medir y que las salidas deben considerarse no validadas hasta reproducir un forward pass.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 7.115 millones de parámetros en `bfloat16`, los pesos del transformer ocupan aproximadamente 14,2 GB, a los que hay que sumar text encoder, VAE y activaciones.
- GPU recomendadas: no disponible en la documentación; por tamaño, se requiere una GPU con al menos 24 GB de VRAM para carga completa en `bfloat16`, y se recomienda `enable_model_cpu_offload()` para reducir el consumo.
- ¿Cabe en GPU de consumo? No confirmado por el autor; en teoría una RTX 4090 (24 GB) podría alojar los pesos, pero no hay validación publicada de inferencia.
- Opciones de despliegue: `diffusers` con `QwenImage21Pipeline.from_pretrained` y `enable_model_cpu_offload()`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gatilin/ovb-b-100000-final-full` | 7.115.124.736 | no disponible | Imagen a imagen, profundidad, segmentación | `qwen-research` (no comercial) | Hugging Face, 21 descargas |
| `Melo111/Fusion-C1-KQ0r128-60-40` (base) | no disponible | no disponible | Pipeline Qwen-Image-2.1 base | no disponible | Hugging Face |
| `khazic/ovb-i108-b-lr1e-5-r64-2x8-s42_20261109r3` (adaptador) | no disponible (LoRA r64) | no disponible | Adaptador LoRA sobre el base | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia `qwen-research`: uso restringido a investigación y evaluación, sin fines comerciales; los términos del proyecto Qwen siguen aplicándose.
- Inferencia no validada: el autor marca `offline_full_pipeline_loading` e `image_inference` como `false`; las salidas deben considerarse no verificadas hasta reproducir un forward pass.
- No es un checkpoint de estado de entrenamiento: no incluye optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento original de forma exacta.
- No se han vuelto a medir benchmarks de esta exportación fusionada; no se deben extrapolar resultados del adaptador o del base.
- Riesgo de alucinación visual y errores en máscaras o mapas de profundidad no cuantificado en la documentación.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; la conditioning textual depende del text encoder heredado del base.
- No debe aplicarse de nuevo el adaptador padre sobre este modelo, ya que sus pesos ya están fusionados.
- Tamaño del repositorio de 33,1 GB, lo que exige espacio en disco y ancho de banda considerables para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gatilin/ovb-b-100000-final-full
- Modelo base: https://huggingface.co/Melo111/Fusion-C1-KQ0r128-60-40
- Adaptador de origen: https://huggingface.co/khazic/ovb-i108-b-lr1e-5-r64-2x8-s42_20261109r3
- Proyecto Open Vision Banana: https://github.com/isLinXu/open-vision-banana
- Script de fusión: https://github.com/isLinXu/open-vision-banana/blob/main/scripts/merge_qwen_image21_lora.py
