# AI-KSK/ksk-video-187-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-187-comfyui-workflows` no es un modelo de lenguaje en sentido estricto, sino un repositorio de documentación asociado a un episodio de vídeo (el número 187) sobre un flujo de trabajo de ComfyUI para intercambio de caras (face swap) sobre renderizaciones generadas con Flux 2 Klein 9B. El autor, AI-KSK, publica aquí la descripción a nivel de nodo de un grafo de 57 nodos que combina un muestreador LanPaint con enmascarado, un LoRA específico de face swap (BFS, rank 128) y una pasada final de upscaling de 4 pasos sobre el mismo backbone.

El repositorio no redistribuye los pesos del modelo ni el JSON del workflow: solo incluye el `README.md` con la lista de ficheros de modelos necesarios y las instrucciones para reproducir el grafo. El tamaño del repositorio es de 0.0 GB, lo que confirma que no contiene checkpoints. La relevancia es, por tanto, la de un material tutorial para la comunidad de ComfyUI interesada en pipelines de edición facial con Flux 2 Klein 9B, no la de un artefacto de inferencia desplegable.

Los pesos a los que se refiere son `flux-2-klein-9b.safetensors` (backbone de difusión), el codificador de texto `qwen_3_8b_fp8mixed.safetensors` cargado con `CLIPLoader` de tipo `flux2`, el VAE `flux2-vae.safetensors` y el LoRA `bfs_head_v1_flux-klein_9b_step3500_rank128B.safetensors`. El idioma declarado es inglés y la licencia es `other`, sin que la model card concrete los términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio documenta un grafo de ComfyUI sobre un backbone de difusión Flux 2 Klein; no se detalla la arquitectura interna del modelo base) |
| Parametros totales | no disponible (el nombre del backbone indica 9B; el codificador de texto Qwen 3 indica 8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el codificador de texto se distribuye en `fp8mixed` según el nombre del fichero) |
| Idiomas soportados | en |
| Licencia | other (términos no especificados en la model card) |
| Formato de pesos | safetensors (según los nombres de fichero listados: `flux-2-klein-9b.safetensors`, `qwen_3_8b_fp8mixed.safetensors`, `flux2-vae.safetensors`, `bfs_head_v1_flux-klein_9b_step3500_rank128B.safetensors`) |

## Arquitectura y entrenamiento

El repositorio describe un grafo de ComfyUI de 57 nodos construido sobre un grafo base de la comunidad que el autor amplió con una cola de alta resolución. El pipeline consta de dos fases de muestreo: una primera pasada `LanPaint_KSampler` con 20 pasos, CFG 1, sampler euler, scheduler simple y denoise 1, y una cola de upscaling que ejecuta una segunda pasada de 4 pasos con los mismos parámetros sobre el mismo backbone, sin modelo adicional.

El componente de intercambio facial es un LoRA dedicado (`bfs_head_v1_flux-klein_9b_step3500_rank128B.safetensors`) aplicado con peso 1.0, de rango 128 y entrenado hasta el paso 3500 según el nombre del fichero (la narración del vídeo cita aproximadamente 3700-3750 para los mismos pesos, discrepancia que el propio autor señala). El enmascarado se realiza manualmente sobre la cara de la imagen objetivo y se alimenta una imagen de referencia facial. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que se trata de un modelo de difusión y el repositorio no cubre su entrenamiento.

## Capacidades

- Intercambio facial (face swap) sobre renderizaciones de Flux 2 Klein 9B mediante enmascarado manual de la región facial.
- Mezcla del rostro de referencia con el objetivo usando un LoRA específico de face swap de rango 128.
- Inpainting enmascarado mediante `LanPaint_KSampler`, que según el autor es más lento que el inpaint nativo por diseño.
- Upscaling de alta resolución en una segunda pasada de 4 pasos sobre el mismo backbone, sin necesidad de un modelo de upscale adicional.
- Control del tamaño de salida mediante una primitiva de megapíxeles (el fichero trae 2, el autor recomienda 1.5).
- Generación de imagen condicionada por texto a través del codificador Qwen 3 8B cargado con `CLIPLoader` de tipo `flux2`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Producción de retratos sintéticos con identidad consistente: se enmascara la cara del render objetivo y se aporta una foto de referencia del mismo ángulo para obtener variaciones de un mismo personaje en distintas escenas.
- Previsualización de casting o caracterización: generar variantes de un rostro sobre un render base antes de comprometer un rodaje o una sesión de fotografía.
- Iteración de arte conceptual: aplicar un rostro de referencia sobre bocetos generados con Flux 2 Klein 9B y refinar con la cola de upscale de 4 pasos para obtener una imagen final de alta resolución.
- Creación de avatares para prototipos de producto: usar el grafo como paso de un pipeline interno de ComfyUI para generar avatares con rasgos controlados a partir de una referencia.
- Docencia y divulgación sobre ComfyUI: el repositorio sirve como material de referencia para explicar el encadenado de `LanPaint_KSampler`, `CLIPLoader` tipo `flux2` y LoRA de face swap en un grafo de 57 nodos.
- Investigación sobre edición facial con difusión: permite reproducir un pipeline concreto (LoRA rank 128, 20 pasos de muestreo, CFG 1) para comparar la calidad de mezcla frente a alternativas de inpaint nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la afirmación "best result seen" es una comparación propia del autor y no un benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, el pipeline carga un backbone de 9B, un codificador de texto de 8B en `fp8mixed` y un VAE, más un LoRA de rango 128; el autor no publica cifras de VRAM.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? no disponible; el autor no lo especifica.
- Opciones de despliegue: ComfyUI es el entorno de ejecución descrito (grafo de 57 nodos con `LanPaint_KSampler`, `CLIPLoader` tipo `flux2` y primitiva de megapíxeles). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles. El autor solo señala cualitativamente que LanPaint es más lento que el inpaint nativo por diseño.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de alternativas comparables de face swap sobre Flux 2 Klein 9B. El propio autor menciona que la variante Klein 4B pierde estabilidad y que solo recomienda las variantes 2511 y Klein 9B, pero sin cifras que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El grafo base no es original del autor: proviene de una publicación de la comunidad y fue ampliado con la cola de alta resolución.
- LanPaint es más lento que el inpaint nativo por diseño, lo que penaliza la latencia en producción.
- Discrepancia en la primitiva de megapíxeles: el fichero trae 2, el vídeo recomienda 1.5, y el autor describe 2 megapíxeles como propenso a distorsión.
- Discrepancia en el paso de entrenamiento del LoRA: el nombre del fichero indica 3500, la narración del vídeo cita aproximadamente 3700-3750 para los mismos pesos.
- La variante Klein 4B se describe como menos estable; solo se recomiendan las variantes 2511 y Klein 9B.
- El resultado depende de usar una referencia de alta resolución y con un ángulo similar; el autor lo señala como remedio a la blandura (softness) del resultado.
- La licencia es `other` y la model card no concreta los términos, por lo que el uso comercial queda sin definir y requiere consulta directa al autor.
- El repositorio no redistribuye pesos ni el JSON del workflow: solo contiene el `README.md` con la descripción y los nombres de fichero, de modo que la reproducibilidad depende de que el usuario localice los pesos por su cuenta.
- El idioma declarado es únicamente inglés.
- No se documentan sesgos conocidos ni tasas de alucinación; al tratarse de un pipeline de imagen, el riesgo relevante es la generación de rostros no fieles a la referencia o con artefactos en la región enmascarada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-187-comfyui-workflows
- RunningHub: https://www.runninghub.ai/post/2026299604819517442/?inviteCode=rh-v1111
- Vídeo en YouTube: https://www.youtube.com/watch?v=KqnEfQ-UCOM
- Vídeo en Bilibili: https://www.bilibili.com/video/BV1WHfSBtE4u
