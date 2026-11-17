# gatilin/ovb-b-20000-best-full

## Resumen

`gatilin/ovb-b-20000-best-full` es un pipeline completo de difusión `QwenImage21Pipeline` publicado en Hugging Face, no un adaptador LoRA. Se ha generado fusionando mediante PEFT `merge_and_unload(safe_merge=True)` el adaptador `khazic/ovb-i108-b-lr1e-5-r64-2x8-s42_20261109r3` (rango 64, alpha 64, rsLoRA) sobre el pipeline base `Melo111/Fusion-C1-KQ0r128-60-40`, que a su vez deriva de Qwen-Image-2.1. El resultado es un transformer BF16 autónomo de 7.115.124.736 parámetros (aproximadamente 7,1 mil millones) que ya incorpora la contribución del adaptador y que no requiere descargar el modelo base ni el LoRA en tiempo de carga.

El modelo está orientado a tareas de imagen a imagen con condicionamiento por instrucción: estimación de profundidad con mapa de color fijo, segmentación semántica, de instancia y referencial (open-vocabulary segmentation), y generación. El autor lo presenta como la mejor selección del run I108-B según el protocolo de EMA de macro flow-loss, aunque advierte explícitamente de que el comportamiento en benchmarks de esta exportación concreta no se ha vuelto a medir.

Su relevancia es acotada pero clara para investigación: proporciona un punto de partida reproducible y autocontenido para experimentar con Qwen-Image-2.1 en tareas de visión densa, con metadatos de procedencia auditables (hashes SHA-256, revisión fijada del padre, verificación de las fórmulas de fusión). La licencia es `qwen-research` (no comercial) y el repositorio ocupa 33,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Qwen-Image-2.1), pipeline `QwenImage21Pipeline` con transformer, text encoder congelado, VAE, processor/tokenizer y scheduler |
| Parametros totales | 7.115.124.736 (aproximadamente 7,1 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos almacenados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | `qwen-research` (etiqueta `other`; uso solo de investigación y evaluación, no comercial) |
| Formato de pesos | safetensors (biblioteca diffusers) |
| Modelo base | `Melo111/Fusion-C1-KQ0r128-60-40` (revisión `9d5b9b8ede04d7d9f4a4ff8a6a75a4b734ab1b4d`) |
| Adaptador de origen | `khazic/ovb-i108-b-lr1e-5-r64-2x8-s42_20261109r3` (revisión `66b028c792c3811ffc87941e0889f657765611a6`) |
| Rango / alpha LoRA | 64 / 64 (rsLoRA) |
| Paso de entrenamiento del adaptador | 20000 |
| Modulos objetivo LoRA | `img_mlp.gate_layer`, `to_q`, `to_k`, `img_mlp.out`, `to_out.0`, `to_v`, `img_mlp.proj` |
| Metodo de fusion | `PEFT merge_and_unload(safe_merge=True)` sobre 224 modulos |
| dtype almacenado | bfloat16 |
| Toolchain de fusion | torch 2.6.0+cu124, diffusers 0.41.0, transformers 5.19.0, peft 0.21.2 |
| Tamano del repositorio | 33,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen-Image-2.1: un transformer de difusión para generación y edición de imágenes condicionada por texto, empaquetado en el pipeline `QwenImage21Pipeline` de diffusers. El pipeline incluye un transformer (el único componente con pesos modificados), un text encoder congelado, un VAE, el processor/tokenizer y el scheduler. En esta exportación, el transformer se ha fusionado con un adaptador LoRA de rango 64 y alpha 64 con escalado rsLoRA, entrenado durante 20000 pasos sobre 224 módulos de atención y de las capas `img_mlp` del transformer.

La fusión se ha realizado con `merge_and_unload(safe_merge=True)` de PEFT, verificando cada fórmula de fusión contra los pesos resultantes y calculando SHA-256 de todos los tensores exportados. Los componentes copiados (VAE, text encoder, tokenizer, scheduler) son idénticos byte a byte a los del pipeline base en la revisión fijada. No se ha realizado entrenamiento adicional durante la exportación: no hay pasos de optimizador nuevos ni estado de RNG, por lo que el resultado es un punto de inicialización, no una reanudación exacta del run original. El condicionamiento por tarea sigue el contrato del proyecto Open Vision Banana: el modelo recibe una imagen RGB y una instrucción de tarea, y devuelve una visualización (profundidad con mapa de color fijo, segmentación semántica/de instancia/referencial o generación).

## Capacidades

- Generación de imágenes condicionada por texto e imagen dentro del pipeline `QwenImage21Pipeline`.
- Edición de imagen a imagen (pipeline tag `image-to-image`).
- Estimación de profundidad monocular con mapa de color fijo.
- Segmentación semántica.
- Segmentación de instancias.
- Segmentación referencial y open-vocabulary segmentation a partir de instrucciones en lenguaje natural.
- Condicionamiento por instrucción de tarea (el prompt determina qué tarea de visión densa se ejecuta).
- Uso como inicialización completa del transformer para fine-tuning posterior (`requires_grad_(True)` sobre `QwenImage21Transformer2DModel`).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están declarados en la model card).

## Casos de uso

- Investigación en segmentación open-vocabulary: el modelo acepta instrucciones en lenguaje natural para segmentar objetos o regiones no vistas durante el entrenamiento, lo que permite evaluar la generalización zero-shot frente a segmentadores clásicos con vocabulario cerrado.
- Segmentación referencial en anotación de datasets: dado un par imagen-instrucción ("el coche rojo a la izquierda"), el modelo devuelve la máscara correspondiente, lo que acelera el etiquetado semiautomático de corpus de visión.
- Estimación de profundidad para previsualización 3D: la salida de profundidad con mapa de color fijo puede alimentar pipelines de reconstrucción o de generación de normales en prototipos de investigación.
- Punto de partida para fine-tuning del transformer: al ser un export completo y autocontenido, sirve como inicialización para experimentos que necesiten partir de un modelo ya adaptado a tareas de visión densa, sin arrastrar dependencias del adaptador original.
- Reproducibilidad de experimentos: los hashes SHA-256 y la revisión fijada del padre permiten auditar y replicar exactamente la fusión en entornos de investigación.
- Evaluación comparativa de estrategias de fusión LoRA: al estar documentado el método (`safe_merge=True`, 224 módulos, rsLoRA), es un caso de referencia para estudiar el impacto de la fusión en el comportamiento del modelo.
- Generación y edición de imágenes en entornos de investigación: el pipeline base Qwen-Image-2.1 permite experimentar con edición guiada por texto, siempre dentro de los términos de la licencia de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el comportamiento en benchmarks de esta exportación fusionada no se ha vuelto a medir; la selección del checkpoint se basó en el protocolo de EMA de macro flow-loss del run original, no en métricas de benchmark de esta exportación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 7,1 B de parámetros en bfloat16, los pesos del transformer ocupan aproximadamente 14,2 GB; a ello hay que sumar el text encoder, el VAE y las activaciones, por lo que se recomienda planificar con margen amplio.
- GPU recomendadas: no disponible. Por tamaño de pesos, se necesita una GPU con al menos 24 GB de VRAM para cargar el transformer en BF16 con margen limitado; para el pipeline completo conviene una A100 40/80 GB, H100 o similar.
- Cabe en GPU de consumo: previsiblemente en RTX 3090/4090 (24 GB) solo con `enable_model_cpu_offload()` o cuantización, aunque no hay datos oficiales de funcionamiento en estas tarjetas.
- Opciones de despliegue: `diffusers` con `QwenImage21Pipeline.from_pretrained` y `enable_model_cpu_offload()`; el autor no documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline de difusión de este tipo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gatilin/ovb-b-20000-best-full` | 7,1 B | no disponible | Imagen a imagen, profundidad, segmentación | `qwen-research` (no comercial) | Hugging Face, diffusers |
| `Melo111/Fusion-C1-KQ0r128-60-40` (padre) | no disponible | no disponible | Imagen a imagen | no disponible | Hugging Face |
| `khazic/ovb-i108-b-lr1e-5-r64-2x8-s42_20261109r3` (adaptador LoRA) | adaptador LoRA r64 | no disponible | Imagen a imagen | no disponible | Hugging Face |
| Qwen-Image-2.1 (modelo original) | no disponible | no disponible | Generación y edición de imagen | `qwen-research` | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia `qwen-research`: uso restringido a investigación y evaluación; no se permite uso comercial sin los términos adicionales de Qwen.
- El autor declara que la inferencia de imagen completa no se ha verificado (`image_inference` y `offline_full_pipeline_loading` son `false` en los metadatos); los resultados deben considerarse no validados hasta reproducir un forward pass.
- No es un checkpoint de estado de entrenamiento: carece de estado de optimizador, scheduler y RNG, por lo que no permite reanudar el run original de forma exacta.
- No se ha vuelto a medir el rendimiento en benchmarks de esta exportación fusionada; la calidad en tareas concretas no está cuantificada.
- No se deben aplicar de nuevo los adaptadores padre: el transformer ya contiene su contribución y volver a aplicarlos duplicaría el efecto.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede producir segmentaciones o mapas de profundidad plausibles pero incorrectos en escenas ambiguas u objetos fuera de distribución.
- Sesgos: no documentados en la información disponible; al derivar de Qwen-Image-2.1, hereda los sesgos del corpus de entrenamiento original.
- Idiomas soportados no declarados; el comportamiento multilingüe de las instrucciones no está garantizado.
- El repositorio ocupa 33,1 GB, lo que condiciona el almacenamiento y el tiempo de descarga en entornos de investigación.
- Solo 19 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gatilin/ovb-b-20000-best-full
- Modelo base: https://huggingface.co/Melo111/Fusion-C1-KQ0r128-60-40
- Adaptador de origen: https://huggingface.co/khazic/ovb-i108-b-lr1e-5-r64-2x8-s42_20261109r3
- Repositorio del proyecto: https://github.com/isLinXu/open-vision-banana
- Script de fusión: https://github.com/isLinXu/open-vision-banana/blob/main/scripts/merge_qwen_image21_lora.py
