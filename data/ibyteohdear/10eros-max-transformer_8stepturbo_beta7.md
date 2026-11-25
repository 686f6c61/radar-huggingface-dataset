# ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7

## Resumen

10Eros-Max-Transformer_8stepTURBO_beta7 es un checkpoint de pesos del transformer de MiniMax-H3, un modelo de generación de vídeo (texto-a-vídeo, imagen-a-vídeo y audio-vídeo) publicado por el usuario ibyteohdear. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint `TenStrip/10Eros-Max/10Eros_Max_h3_8stepTURBO_beta7_fix1.safetensors` al árbol de módulos de diffusers bajo la clase `MiniMaxH3PrunedTransformer3DModel`, partiendo del modelo base `multimodalart/MiniMax-H3-Pruned`.

El modelo tiene 20.111.462.920 parámetros (unos 20,1 mil millones) y un repositorio de 120,7 GB. Incorpora el delta de destilación TURBO ya fusionado en los pesos, de modo que está pensado para muestreo en 8 pasos. La carpeta incluye únicamente el componente transformer; el VAE, el codificador de texto y los schedulers deben tomarse del repositorio base.

Su relevancia es práctica: ofrece pesos listos para cargar en diffusers sin necesidad de fusionar LoRAs ni aplicar parches en tiempo de carga, con verificaciones documentadas contra la referencia (conjunto de claves, formas de cada tensor, coseno por tensor y evaluación de la modulación AdaLN sobre los 1025 pasos temporales). Está etiquetado como `not-for-all-audiences` y su licencia es la MiniMax-H3 Community License Agreement.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D multimodal (vídeo + audio) derivado de MiniMax-H3, con modulación AdaLN de rango 8 y token refiner |
| Parametros totales | 20.111.462.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificados en la model card; el código de ejemplo usa `torch.bfloat16` y menciona `Int8WeightOnlyConfig` de torchao para el codificador de texto |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (árbol de módulos diffusers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación conjunta de vídeo y audio, estructurado en `transformer_blocks` y `token_refiner.refiner_blocks`, con proyecciones de parche, salida y condicionamiento. La modulación AdaLN se ha plegado a coordenadas de rango 8: las proyecciones conservan el rango 8 y el sesgo se traslada a `*.adaln_proj.folded_bias` en float32, con `time_embedder.table` de 1025×8 y los buffers `adaln_basis` y `adaln_mean` incluidos en el propio fichero. La tabla representa la curva `silu(time_embedder(time_proj(t)))` sobre una rejilla uniforme de 1025 pasos con interpolación lineal entre muestras, exacta en la rejilla del sampler y aproximada fuera de ella.

La conversión documentada incluye renombrado de bloques, des-fusión de `attn.qkv_proj` en `to_q`/`to_k`/`to_v`, reordenación de las mitades de `mlp.fc1` (`[gate | value]` a `[value | gate]`), plegado de AdaLN y selección de la cabeza de salida del bloque `{'video': 0, 'audio': 0}` de las 32 cabezas apiladas del origen (3072 filas de vídeo y 1024 de audio), que reproduce `proj_out` y `audio_proj_out` del base con L2 relativo ≤ 3,3e-02. Se eliminó `rope.inv_freq`, reconstruido como no persistente en `__init__`. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO; el delta TURBO procede de una destilación previa ya integrada en los pesos.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video), que es el pipeline declarado.
- Generación conjunta de vídeo y audio (audio-video), con cabezas separadas para vídeo y audio.
- Muestreo destilado en 8 pasos gracias al delta TURBO integrado.
- Integración con diffusers mediante `AutoModel` y `trust_remote_code=True`.
- Codificación de texto externa mediante Qwen3-VL (8B o 32B en los ejemplos de la model card), no incluida en el repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Generación de clips de vídeo a partir de una imagen de referencia: el pipeline image-to-video permite animar ilustraciones o fotografías con el transformer cargado desde este repositorio y el VAE del modelo base.
- Creación de vídeo con audio sincronizado: las cabezas de audio (`audio_proj_out`) permiten generar pistas de audio junto al vídeo en una sola pasada, útil para prototipos de contenido audiovisual.
- Iteración rápida en pipelines de investigación: al estar destilado para 8 pasos, reduce el coste por muestra frente a un muestreo completo, lo que facilita barridos de prompts y comparativas.
- Integración en aplicaciones diffusers existentes: al estar en el árbol de módulos nativo, se puede apuntar el componente `transformer` de un pipeline MiniMax-H3 a este repositorio sin fusionar LoRAs ni parches.
- Pruebas de conversión y validación de checkpoints: el repositorio documenta el proceso de renombrado, des-fusión y plegado AdaLN, por lo que sirve como referencia para convertir otros checkpoints de la familia.
- Investigación sobre destilación de pocos pasos: permite estudiar el comportamiento de un modelo con el delta TURBO ya fusionado, sin apilar adaptadores adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 20,1 mil millones de parámetros, en bfloat16 los pesos del transformer rondan los 40 GB; el repositorio completo ocupa 120,7 GB.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, se requiere al menos una GPU de 48 GB o superior para bfloat16 sin cuantizar.
- Cabe en GPU de consumo: no disponible; con 20,1 mil millones de parámetros no cabe en GPUs de 24 GB en bfloat16 sin cuantización o descarga a CPU.
- Opciones de despliegue: diffusers con `AutoModel.from_pretrained(..., trust_remote_code=True, dtype=torch.bfloat16)`; el código de ejemplo menciona `Int8WeightOnlyConfig` de torchao para el codificador de texto y `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`.
- Latencia y throughput: no disponibles. El muestreo está destilado para 8 pasos, lo que reduce el número de evaluaciones del transformer frente a un sampler completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros-Max-Transformer_8stepTURBO_beta7 | 20,1 B | no disponible | Transformer vídeo+audio (MiniMax-H3) | minimax-h3-community-license-agreement | Hugging Face, diffusers |
| multimodalart/MiniMax-H3-Pruned (base) | no disponible | no disponible | Transformer vídeo+audio (MiniMax-H3) | no disponible | Hugging Face |
| MiniMax-H3 original (referencia de la familia) | no disponible | no disponible | Transformer vídeo+audio | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo el transformer; el VAE, el codificador de texto y los schedulers deben obtenerse del modelo base.
- Requiere `trust_remote_code=True`, ya que la clase no está en `MODEL_MAPPING` de diffusers.
- El delta TURBO está fusionado en los pesos: no se debe apilar `larryvrh/MiniMax-H3-Turbo-Lora` ni un adaptador `lightx2v`, porque se aplicaría dos veces.
- Las coordenadas AdaLN de rango 8 no guardan relación con las de la referencia, por lo que `project_adaln_lora` no mapeará correctamente una LoRA AdaLN de un checkpoint publicado; el repositorio sirve para inferencia, no como base para entrenar LoRA AdaLN.
- La aproximación AdaLN es exacta solo en la rejilla del sampler; muestrear fuera de ella (por ejemplo, sigmas desplazadas entre puntos de la rejilla) no reproduce los valores del modelo publicado.
- La cabeza de salida usa solo el bloque `{'video': 0, 'audio': 0}` de las 32 cabezas apiladas del origen, con una tolerancia de L2 relativo ≤ 3,3e-02 frente al base.
- Etiquetado como `not-for-all-audiences`: puede generar contenido no apto para todo público.
- Licencia MiniMax-H3 Community License Agreement: conviene revisar sus restricciones de uso comercial antes de desplegar en producción.
- No se documentan idiomas soportados ni sesgos conocidos.
- Riesgo de alucinación y fidelidad del contenido generado: no evaluado en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7
- Modelo base: https://huggingface.co/multimodalart/MiniMax-H3-Pruned
- LoRA TURBO (no aplicar sobre este checkpoint): https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Codificador de texto de ejemplo (Qwen3-VL-8B): https://huggingface.co/prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3
- Codificador de texto de ejemplo (Qwen3-VL-4B): https://huggingface.co/prithivMLmods/Qwen3-VL-4B-Instruct-c_abliterated-v2
- Codificador de texto cuantizado de ejemplo: https://huggingface.co/ibyteohdear/qwen3_vl_32b_bnb_nf4
