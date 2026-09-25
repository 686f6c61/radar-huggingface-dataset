# joseplcam/Qwen-Image-2.1-NVFP4

## Resumen

Qwen-Image-2.1-NVFP4 es un repositorio de empaquetado y cuantización publicado por el usuario joseplcam sobre el modelo base Qwen/Qwen-Image-2.1 de Alibaba Qwen. No se trata de un modelo nuevo ni de un entrenamiento adicional: es la combinación probada de dos cuantizaciones NVFP4 ya existentes (el DiT de 7B exportado con NVIDIA ModelOpt por HangGlidersRule y el text encoder Qwen3-VL 8B convertido por BennyDaBall), reempaquetadas en la disposición de directorios de diffusers para que SGLang Diffusion pueda cargarlas desde un único identificador de modelo. El valor añadido declarado por el autor es la combinación verificada, el renombrado de claves del encoder y las mediciones de rendimiento publicadas.

El modelo base resuelve generación de texto a imagen y edición de imágenes en un único sistema, con un componente de generación visual de 7B parámetros organizado en 32 capas DiT single-stream, y admite de forma nativa la generación y edición de imágenes con transparencia (salida RGBA). Esta variante reduce el peso en disco de unos 32 GB en BF16 a unos 14,4 GB, manteniendo en BF16 las capas sensibles (bloques 0, 1, 30 y 31 del DiT, embeddings, modulación y capas de salida), lo que según el autor del transformer preserva la paridad de calidad con BF16 en una evaluación de 25 casos.

Su relevancia ahora es doble: por un lado permite ejecutar un modelo de difusión de 7B más un encoder de 8B en GPUs Blackwell con VRAM moderada (16,7 GB de pico a lote 1, frente a los más de 30 GB de la versión BF16); por otro, es un ejemplo práctico de empaquetado NVFP4 listo para SGLang con kernels FP4 nativos de FlashInfer. Su principal restricción es la licencia: Qwen Research License, solo para investigación y evaluación no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) single-stream de 32 capas para el componente de generación visual; text encoder Qwen3-VL 8B; VAE, processor y scheduler separados |
| Parámetros totales | 4.443.353.088 en los safetensors indexados (la model card describe 7B en el DiT y 8B en el text encoder; el recuento no está desglosado en la fuente) |
| Parámetros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no se especifica la ventana del text encoder) |
| Tipos de cuantización | NVFP4 W4A4 con grupo 16 y escalas de bloque FP8 en el DiT (bloques 0, 1, 30, 31, embeddings, modulación y salida en BF16); NVFP4 en las 252 capas lineales del language model del encoder (vision tower, embeddings y lm_head en BF16); VAE y scheduler en BF16/FP32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research-license (uso no comercial, solo investigación y evaluación) |
| Formato de pesos | safetensors en disposición diffusers (`transformer/`, `text_encoder/`, `vae/`, `processor/`, `scheduler/`, `model_index.json`) |
| Modalidad | text-to-image y edición de imágenes, con salida RGBA |
| Tamaño del repositorio | 14,4 GB (frente a ~32 GB de la versión BF16) |
| Hardware mínimo | GPU Blackwell con compute capability 10.0 o 12.0 |
| Creado / actualizado | 2026-09-24 (misma fecha de creación y actualización) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. El componente de generación es un único DiT single-stream de 32 capas con 7B parámetros, exportado a NVFP4 mediante NVIDIA ModelOpt por el autor del transformer original (HangGlidersRule), sin modificaciones byte a byte. SGLang detecta el formato desde `transformer/config.json` y lo ejecuta con la GEMM FP4 CUTLASS de FlashInfer, que dispone de una ruta SM120 (RTX 50 y RTX PRO 6000). Mantener los dos primeros y los dos últimos bloques en BF16 es lo que, según el autor original, conserva la calidad.

El text encoder es un Qwen3-VL 8B cuantizado a NVFP4 en sus 252 capas lineales del language model, convertido desde los pesos oficiales en BF16 (no es una variante abliterada). La única modificación introducida por este repositorio es el renombrado de las claves de tensor al esquema de Hugging Face que espera el encoder nativo Qwen3-VL de SGLang (`model.layers.*` → `model.language_model.layers.*`, y lo mismo para `embed_tokens` y `norm`); los datos no se alteran. El VAE, el processor, el scheduler y `model_index.json` provienen sin cambios del release oficial Qwen/Qwen-Image-2.1 en BF16/FP32. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base más allá de la descripción pública de Qwen sobre su arquitectura compacta y su unificación de generación y edición.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image), con prompts en lenguaje natural.
- Edición de imágenes guiada por instrucciones, pasando una imagen de entrada mediante `image_path`.
- Generación y edición de imágenes con transparencia (salida RGBA) de forma nativa, según el release oficial de Qwen-Image-2.1.
- Ejecución nativa sobre kernels FP4 en GPUs Blackwell, tanto del DiT (FlashInfer CUTLASS FP4 GEMM) como del encoder (matmuls FP4 de `comfy-kitchen`).
- Servicio con batching de peticiones concurrentes a través de `sglang serve` con `--batching-max-size` y `--batching-delay-ms`.
- Selección de backend de atención (`torch_sdpa` o `sage_attn`) según resolución, y de política de memoria (`performance_mode="speed"`).
- Tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible; el text encoder Qwen3-VL 8B es un componente interno del pipeline, no se expone como LLM.
- Capacidades multilingües del text encoder: no disponible en la información proporcionada.
- Modo thinking, entrada de audio o de vídeo: no disponibles.

## Casos de uso

- Generación de imágenes en producción sobre GPU Blackwell: sirviendo con `sglang serve --performance-mode speed --batching-max-size 8`, el modelo entrega 0,71 img/s de forma sostenida entre lotes de 4 y 8, con un pico de 25,0 GB de VRAM, lo que permite atender varias peticiones por GPU sin degradar el coste por imagen.
- Prototipado rápido con latencia interactiva: a lote 1 y 512x512 con 40 pasos, cada imagen tarda 2,42 s con SDPA y 16,7 GB de VRAM, un régimen adecuado para herramientas de creación asistida donde el usuario espera un resultado casi inmediato.
- Edición de imágenes por instrucción en flujos de marketing y contenido: el pipeline acepta `image_path` para editar, y la model card indica un tiempo en torno a 2,4 por edición (dato truncado en la fuente), lo que lo hace viable para retoque semiautomático sobre lotes de material gráfico.
- Generación de recursos con canal alfa: la salida RGBA nativa permite producir PNG con transparencia para interfaces, stickers, logotipos o composición posterior sin necesidad de segmentación adicional.
- Investigación comparativa FP4 frente a BF16: al ser una combinación reproducible de cuantizaciones con licencia de investigación, sirve para medir la pérdida de calidad de NVFP4 W4A4 (grupo 16) frente al BF16 en pipelines de difusión, apoyándose en la evaluación de 25 casos citada por el autor del transformer.
- Sustitución de la versión BF16 en entornos con VRAM ajustada: reduce el requisito de espacio de ~32 GB a 14,4 GB en disco y a partir de 16,7 GB de VRAM en inferencia, lo que permite desplegar el modelo completo en una única RTX PRO 6000 Blackwell de 96 GB con margen para batching.
- Generación de conjuntos de datos sintéticos para pruebas de pipelines de visión: la integración con SGLang permite automatizar lotes de imágenes con semilla fija (`seed`) y parámetros repetibles, útil para tests de regresión de sistemas que consumen imágenes.
- Validación de despliegues NVFP4 en CI/CD de infraestructura: el repositorio sirve como caso de prueba de kernels FlashInfer SM120, del renombrado de pesos y de la carga por `component_weights_paths`, verificando la compatibilidad de la pila antes de llevar modelos cuantizados a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIP, MMLU u otros) en la información disponible. Las únicas cifras publicadas son mediciones de inferencia realizadas en una RTX PRO 6000 Blackwell de 96 GB, con `sglang serve`, resolución 512x512, 40 pasos y media de 3 ejecuciones tras calentamiento; el tamaño de lote es el número de peticiones concurrentes con prompts distintos.

| Tamaño de lote | SDPA | SageAttention2 | SDPA + torch.compile | SageAttention2 + torch.compile |
|---|---|---|---|---|
| 1 | 2,42 s (0,41 img/s; 16,7 GB) | 2,54 s (0,39 img/s; 16,7 GB) | 6,39 s (0,16 img/s) | 6,80 s (0,15 img/s) |
| 2 | 2,86 s (0,70 img/s; 17,9 GB) | 3,02 s (0,66 img/s; 17,9 GB) | 5,75 s (0,35 img/s) | 6,17 s (0,32 img/s) |
| 4 | 5,58 s (0,72 img/s; 20,1 GB) | 5,82 s (0,69 img/s; 20,1 GB) | 6,39 s (0,63 img/s) | 7,77 s (0,52 img/s) |
| 8 | 11,33 s (0,71 img/s; 25,0 GB) | 11,70 s (0,68 img/s; 25,1 GB) | 12,34 s (0,65 img/s) | 14,35 s (0,56 img/s) |

Notas sobre estas cifras: `torch.compile` degrada el rendimiento en todas las configuraciones probadas; SGLang recomienda `sage_attn` a partir de 1024x1024; sin `performance_mode="speed"` la política de memoria automática puede transmitir el text encoder capa a capa desde la memoria del host incluso en una GPU de 96 GB, con un resultado aproximado de 10 veces más lento. En cuanto a calidad, el autor del transformer NVFP4 reporta paridad con BF16 en una evaluación de 25 casos, dato no verificado de forma independiente.

## Requisitos de hardware

- GPU obligatoria con compute capability 10.0 o 12.0 (Blackwell): familia RTX 50, RTX PRO 6000 Blackwell y aceleradores de centro de datos Blackwell.
- VRAM estimada (512x512, 40 pasos): 16,7 GB a lote 1, 17,9 GB a lote 2, 20,1 GB a lote 4 y 25,0-25,1 GB a lote 8.
- GPUs recomendadas: RTX PRO 6000 Blackwell 96 GB (la empleada en las mediciones) y RTX 5090/5080 con 32 GB o más para cubrir el pico de batching; el mínimo práctico se sitúa cerca de 17 GB para peticiones individuales.
- No es compatible de forma nativa con GPUs Ampere o Ada (sin ruta FP4 SM120); en esas arquitecturas habría que recurrir a la versión BF16 del modelo base.
- En tarjetas consumer de 8 GB, un análisis comunitario citado indica que una build NVFP4 comunitaria del mismo modelo quedaría bajo el límite de memoria con streaming de etapas, pero no existe medición de este repositorio en esa configuración.
- Memoria del sistema: se recomienda alrededor de 32 GB de RAM para la compilación JIT, fijando `MAX_JOBS=4` para evitar quedarse sin memoria durante la compilación.
- Despliegue: SGLang Diffusion (`sglang.multimodal_gen.DiffGenerator` o `sglang serve`), con FlashInfer 0.6.18, `comfy-kitchen==0.2.35`, PyTorch 2.13.0+cu130 y una revisión concreta de SGLang (`ffac53d779c08dcdab2d07e5e2a41dba83f0e65c`). El repositorio usa el layout de diffusers (`QwenImage21Pipeline`), pero el rendimiento FP4 depende de los kernels de SGLang y FlashInfer.
- Latencia y throughput: 2,42 s por imagen a lote 1 y SDPA; máximo observado de 0,72 img/s a lote 4, con 0,71 img/s a lote 8.
- Primera ejecución: la compilación JIT de los kernels FP4 de FlashInfer tarda unos 5 minutos y se cachea en `~/.cache/sglang`.
- Parámetro obligatorio `component_weights_paths` para el text encoder: SGLang solo reconoce el encoder NVFP4 de estilo ComfyUI si la ruta apunta explícitamente al fichero de pesos.

## Comparativa con modelos similares

| Modelo | Componentes y precisión | Tamaño | Carga / uso | Licencia | Notas |
|---|---|---|---|---|---|
| joseplcam/Qwen-Image-2.1-NVFP4 (este) | DiT 7B + encoder Qwen3-VL 8B en NVFP4, capas sensibles en BF16 | ~14,4 GB | SGLang Diffusion con kernels FP4 SM120 | qwen-research-license | Combinación probada con renombrado de claves y mediciones publicadas |
| Qwen/Qwen-Image-2.1 (base) | BF16 completo | ~32 GB | diffusers, SGLang u otros | qwen-research-license | Referencia de calidad; requiere aproximadamente el doble de VRAM y disco |
| HangGlidersRule/Darkstar-Qwen-Image-2.1-Base-ModelOpt-W4A4-NVFP4 | Solo el DiT 7B en NVFP4 W4A4 (export de NVIDIA ModelOpt) | no disponible | SGLang | no disponible en la información proporcionada | Fuente byte a byte del `transformer/` de este repositorio; reporta paridad con BF16 en 25 casos |
| BennyDaBall/Qwen-Image-2.1-NVFP4 | Encoder Qwen3-VL 8B en NVFP4 de estilo ComfyUI | no disponible | ComfyUI / SGLang mediante `comfy-kitchen` | no disponible en la información proporcionada | Fuente del `text_encoder/`; este repositorio le renombra las claves al esquema de Hugging Face |

## Limitaciones y advertencias

- Licencia qwen-research-license: uso restringido a investigación y evaluación no comercial. Cualquier despliegue comercial requiere revisar `LICENSE` y `NOTICE` y, previsiblemente, una licencia aparte de Qwen.
- Requiere hardware Blackwell (compute capability 10.0 o 12.0) para los kernels FP4; no hay ruta optimizada para Ampere, Ada ni GPUs de otras arquitecturas.
- El repositorio no introduce ninguna mejora de modelo: es una combinación de cuantizaciones de terceros, por lo que hereda sus posibles defectos y no ha sido validado más allá de las mediciones del autor.
- El autor del transformer reporta paridad con BF16 en 25 casos, pero no se han publicado evaluaciones independientes de calidad (FID, CLIP, fidelidad de edición) en la información disponible.
- No hay datos sobre sesgos del modelo base, sesgos por idioma o riesgo de alucinación visual; deben asumirse los del modelo Qwen-Image-2.1 original.
- Idiomas soportados: no disponible. No se puede confirmar el comportamiento del encoder con prompts en castellano u otras lenguas.
- El recuento de parámetros indexado en safetensors (4.443.353.088) no coincide con la suma descrita en la model card (7B en el DiT más 8B en el encoder); la fuente no aclara el desglose, por lo que conviene no usar esa cifra como tamaño efectivo del sistema completo.
- La etiqueta `8-bit` del repositorio contradice la precisión NVFP4 (4 bits) declarada en la model card; parece un metadato inconsistente.
- Es obligatorio usar `performance_mode="speed"`: sin él, SGLang puede transmitir el text encoder desde memoria del host incluso en una GPU de 96 GB, con peticiones aproximadamente 10 veces más lentas.
- `torch.compile` empeora el rendimiento en todas las configuraciones probadas y debe permanecer desactivado.
- El arranque en frío implica unos 5 minutos de compilación JIT y un consumo de memoria del sistema que puede agotar máquinas de 32 GB si no se limita `MAX_JOBS`.
- Repositorio recién creado, con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni historial de mantenimiento.
- En NixOS el enlazador JIT necesita rutas explícitas a `libcuda` y `libcudart` mediante `LIBRARY_PATH`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/joseplcam/Qwen-Image-2.1-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio del transformer NVFP4 de origen (HangGlidersRule/Darkstar-Qwen-Image-2.1-Base-ModelOpt-W4A4-NVFP4): https://huggingface.co/HangGlidersRule/Darkstar-Qwen-Image-2.1-Base-ModelOpt-W4A4-NVFP4
- Repositorio del text encoder NVFP4 de origen (BennyDaBall/Qwen-Image-2.1-NVFP4): https://huggingface.co/BennyDaBall/Qwen-Image-2.1-NVFP4
- Repositorio oficial del modelo en GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Blog oficial de Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
- SGLang (framework de servicio y Diffusion): https://github.com/sgl-project/sglang
- Análisis comunitario de Qwen-Image-2.1 en RTX 5060 de 8 GB (menciona la build NVFP4 y la licencia no comercial): https://smeltcore.com/recipes/qwen-image-2-1-on-rtx-5060-8-gb-which-stages-fit-what-streams-and-the-nvfp4-swap/
