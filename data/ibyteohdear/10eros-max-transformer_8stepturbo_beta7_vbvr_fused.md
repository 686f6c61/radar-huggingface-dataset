# ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7_VBVR_FUSED

## Resumen

10Eros-Max beta7 VBVR FUSED es un modelo de generación de vídeo (texto-a-vídeo, imagen-a-vídeo y audio-vídeo) desarrollado por el usuario `ibyteohdear` sobre la arquitectura MiniMax-H3. Se trata de un checkpoint de la familia 10Eros-Max en su variante "8-step TURBO" (destilada para muestrear en 8 pasos) a la que se le ha fusionado permanentemente el LoRA `H3_VBVR_Pro-V2` con fuerza 1, de modo que no es necesario cargar ni fusionar ningún adaptador en tiempo de ejecución. El resultado es un único conjunto de pesos que incorpora tanto el delta TURBO como el LoRA.

El modelo cuenta con 20.111.462.920 parámetros (unos 20,1 mil millones) almacenados en safetensors, con un repositorio de 120,7 GB, y se distribuye a través de la librería `diffusers` con código personalizado (`trust_remote_code=True`). Está etiquetado como `not-for-all-audiences`, lo que indica contenido para adultos, y su licencia es la MiniMax-H3 Community License Agreement.

Su relevancia es acotada: se trata de un fine-tune comunitario orientado a la generación de vídeo con estética concreta y muestreo rápido, no de un modelo generalista. La información pública disponible es escasa (613 descargas, 1 like) y no incluye datos de benchmarks ni de entrenamiento. La model card es explícita sobre las restricciones de uso: la fuerza del LoRA está horneada y no se debe apilar otro LoRA turbo encima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (MiniMax-H3), con VAE de vídeo y VAE de audio |
| Parametros totales | 20.111.462.920 (~20,1 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (modelo de difusión, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | Int8WeightOnly (torchao) usado en el código de ejemplo; otras no documentadas |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (repo de 120,7 GB, estructura `diffusers/`) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación de vídeo de la familia MiniMax-H3, con componentes modulares en `diffusers`: encoder de texto, preparación de latents y layout, pasos de denoising y decodificación mediante `AutoencoderKLMiniMaxH3` (vídeo) y `AutoencoderKLMiniMaxH3Audio` (audio). El checkpoint es un fine-tune del modelo base `ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7`, que a su vez es una variante destilada para 8 pasos de muestreo (TURBO).

La innovación principal de este repositorio es la fusión estática del LoRA `H3_VBVR_Pro-V2` en los pesos base con fuerza 1 (alpha/rank × strength, rank [128], alpha por clave de 208). Según la model card, se fusionaron 312 tensores partiendo de pesos prístinos, sin descartar ninguno, verificando que el conjunto de claves coincide exactamente con el base, que los dtypes por clave se mantienen y que los tensores no fusionados son idénticos bit a bit al base. La tabla AdaLN de rank 8 es exacta sobre la rejilla de 1025 pasos del sampler y aproximada fuera de ella, por lo que se recomienda muestrear en rejilla. No se dispone de información sobre el número de tokens, composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de vídeo texto-a-vídeo (text-to-video).
- Generación de vídeo imagen-a-vídeo (image-to-vídeo), que es el pipeline declarado.
- Generación de audio-vídeo (audio-video), con VAE de audio dedicado.
- Muestreo rápido en 8 pasos gracias al delta TURBO ya integrado en los pesos.
- Estética y estilo específicos aportados por el LoRA VBVR Pro-V2 fusionado.
- Integración con `diffusers` mediante `AutoModel.from_pretrained(..., trust_remote_code=True)`.
- Cuantización Int8 weight-only vía `torchao` para reducir huella de memoria.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de difusión de vídeo).

## Casos de uso

- Generación de clips de vídeo a partir de prompts de texto: el modelo produce secuencias de vídeo en 8 pasos de muestreo, lo que reduce el coste por clip frente a samplers de 20-50 pasos, adecuado para iteración creativa rápida.
- Animación de imágenes fijas (image-to-vídeo): el pipeline declarado permite partir de una imagen de referencia y generar movimiento, útil para storyboards o previsualización de escenas.
- Generación de vídeo con audio sincronizado: la presencia de `AutoencoderKLMiniMaxH3Audio` permite producir clips con pista de audio asociada, aplicable a contenido promocional corto o prototipos de vídeo musical.
- Prototipado de contenido para adultos: dado el etiquetado `not-for-all-audiences` y la estética del LoRA fusionado, el modelo está orientado a este nicho, siempre que se cumpla la licencia comunitaria.
- Investigación sobre fusión de LoRA: el repositorio documenta con detalle el proceso de fusión (312 tensores, verificación de claves y dtypes), lo que lo convierte en un caso de estudio reproducible para técnicas de "baked LoRA".
- Pruebas de cuantización en difusión de vídeo: el código de ejemplo emplea `Int8WeightOnlyConfig` de torchao, útil para medir el impacto de la cuantización en calidad y VRAM en modelos de ~20 B.
- Demos en Hugging Face Spaces con GPU zero: el script de ejemplo incluye el decorador `spaces.GPU` y gestión de `SPACES_ZERO_GPU`, lo que facilita desplegar una demo interactiva con Gradio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con ~20,1 B de parámetros, en bf16 se requieren aproximadamente 40 GB solo para los pesos del transformer, más los VAE de vídeo y audio y el encoder de texto (Qwen3-VL-4B en el ejemplo), lo que sitúa el total por encima de 48-60 GB según resolución y longitud del clip.
- Con cuantización Int8 weight-only (torchao), los pesos del transformer bajan a ~20 GB, aunque siguen siendo necesarios los VAE y el encoder de texto.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bf16 sin cuantizar. En consumer GPU no cabe en bf16; con Int8 podría intentarse en RTX 4090 (24 GB) solo si se descargan componentes y se usa offloading, extremo no documentado.
- Opciones de despliegue: `diffusers` con `trust_remote_code=True` (vía oficial), pipelines modulares `MiniMaxH3*`, Gradio para demos, torchao para cuantización. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles. El muestreo en 8 pasos reduce el número de evaluaciones del transformer frente a samplers estándar, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto/Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 10Eros-Max beta7 VBVR FUSED (este) | ~20,1 B | Difusión vídeo MiniMax-H3, LoRA fusionado | 8 pasos TURBO | MiniMax-H3 Community | Hugging Face, 613 descargas |
| ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7 | no disponible | Difusión vídeo MiniMax-H3, sin LoRA | 8 pasos TURBO | MiniMax-H3 Community | Hugging Face (base) |
| larryvrh/MiniMax-H3-Turbo-Lora | no disponible (LoRA) | Adaptador turbo para MiniMax-H3 | no disponible | no disponible | Hugging Face |
| lightx2v (LoRA turbo) | no disponible (LoRA) | Adaptador turbo para MiniMax-H3 | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el tag `not-for-all-adultes`/`not-for-all-audiences` indica material no apto para todo público; debe filtrarse en despliegues públicos.
- La fuerza del LoRA está horneada a 1 y no puede reducirse; si el efecto es demasiado intenso, la solución es usar otro repositorio, no ajustar un parámetro.
- No se debe apilar otro LoRA turbo (`larryvrh/MiniMax-H3-Turbo-Lora`, `lightx2v`, etc.) encima: el delta TURBO ya está aplicado y se duplicaría.
- La tabla AdaLN de rank 8 solo es exacta en la rejilla de 1025 pasos del sampler; fuera de ella es una aproximación, por lo que hay que muestrear en rejilla.
- Licencia MiniMax-H3 Community License Agreement: es necesario revisar sus términos antes de cualquier uso comercial; no es una licencia permisiva tipo Apache o MIT.
- Riesgo de alucinación visual y artefactos propios de la difusión de vídeo, especialmente en clips largos o con movimientos complejos; no se documentan métricas de calidad.
- No hay información sobre sesgos, idiomas soportados ni composición del dataset de entrenamiento.
- El repositorio exige `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el código antes de usarlo en producción.
- El modelo base es un fine-tune comunitario con muy poca tracción (613 descargas, 1 like), sin validación independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7_VBVR_FUSED
- Modelo base: https://huggingface.co/ibyteohdear/10Eros-Max-Transformer_8stepTURBO_beta7
- Repositorio del LoRA: https://huggingface.co/ibyteohdear/h3Lora
- LoRA turbo alternativo (no apilar): https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- ClipProj MiniMax-H3 (dependencia del ejemplo): https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
- Encoder de texto del ejemplo: https://huggingface.co/prithivMLmods/Qwen3-VL-4B-Instruct-c_abliterated-v2
