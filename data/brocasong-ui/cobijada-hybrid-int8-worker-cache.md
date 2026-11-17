# brocasong-ui/cobijada-hybrid-int8-worker-cache

## Resumen

`brocasong-ui/cobijada-hybrid-int8-worker-cache` no es un modelo entrenado de forma independiente, sino un repositorio espejo que agrupa pesos de terceros para un flujo de trabajo Serverless concreto. El autor, `brocasong-ui`, declara explícitamente que se trata de un "mirror of public model weights only" y que los derechos y licencias originales siguen aplicándose a cada componente. El repositorio no incluye pipeline, licencia propia, idiomas declarados ni descripción de arquitectura unificada.

El contenido es un ensamblaje heterogéneo de componentes orientados a generación de vídeo y audio con MiniMax-H3, combinado con un codificador de texto basado en Qwen3-VL de 32B en cuantización INT8. Entre los ficheros figuran un diffusion model híbrido podado, dos VAE (vídeo y audio), un text encoder y varias LoRAs de terceros (Pika, fal, RunningHub, entre otros). El tamaño total del repositorio es de 53,5 GB.

Por su naturaleza, este repositorio no debe evaluarse como un modelo único con benchmarks propios, sino como un paquete de artefactos para reproducir un pipeline concreto. La información técnica disponible se limita a los nombres de fichero, las rutas de origen y los hashes SHA256; no hay model card técnica con parámetros, contexto ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (ensamblaje de componentes: text encoder tipo Qwen3-VL, diffusion model MiniMax-H3 híbrido podado, VAE de vídeo y audio, LoRAs) |
| Parametros totales | no disponible (el text encoder se referencia como Qwen3-VL-32B; el resto sin cifra agregada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (convrot) en text encoder y diffusion model; FP32 en VAE de audio; BF16 en LoRAs |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que se aplican las licencias originales de cada componente) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura unificada ni sobre proceso de entrenamiento propio. El repositorio agrega artefactos ya publicados: un text encoder `qwen3vl_32b_h3_ultra_uncensored_heretic_int8_convrot.safetensors` procedente de OTMFLY, un diffusion model `Cobijada_H3_Hybrid_Uncensored_pruned_hybrid_int8_convrot_pruned.safetensors` de Winnougan, VAE de vídeo y audio de Comfy-Org, y varias LoRAs de Pika-Labs, fal, RunningHub, alibof y JOKER141. La nomenclatura sugiere un pipeline de generación de vídeo con audio (MiniMax-H3) en ComfyUI, con cuantización INT8 y poda del modelo de difusión.

No hay información sobre número de tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones técnicas atribuibles al autor del mirror. Cualquier detalle de entrenamiento debe consultarse en los repositorios originales enlazados en la model card.

## Capacidades

- Generación de vídeo a partir de texto (t2v), imagen (i2v) y referencia (r2v), según la nomenclatura de las LoRAs incluidas (`t2v-i2v-r2v`).
- Generación de audio asociada al pipeline de vídeo, mediante el VAE de audio `minimax_h3_audio_vae_fp32.safetensors`.
- Codificación de texto e imagen mediante el text encoder basado en Qwen3-VL 32B.
- Modulación estilística y de contenido mediante LoRAs: realismo de personas, interacción de combate, respuesta a impactos y estilos concretos (MysticXXX, Pika Flex).
- Integración prevista con ComfyUI, a juzgar por las rutas `comfy/loras/` y la nomenclatura de los ficheros.
- No se documentan tool calling, function calling, agentes, modo thinking ni capacidades multilingües específicas.

## Casos de uso

- Reproducción de un pipeline Serverless de generación de vídeo: el repositorio permite reconstruir el conjunto exacto de pesos referenciado por un workflow, con hashes SHA256 para verificar integridad de cada artefacto.
- Generación de clips con audio sincronizado: la combinación de diffusion model MiniMax-H3, VAE de vídeo y VAE de audio permite producir vídeo con pista sonora en una sola pasada dentro de ComfyUI.
- Personalización estilística mediante LoRAs: las LoRAs de realismo de personas (`h3-realism-people`) permiten ajustar la generación hacia retratos y figuras humanas realistas sin reentrenar el modelo base.
- Generación de escenas de acción: las LoRAs `H3_Fight_Flow_V1`, `H3_Combat_V2` y `h3_Impact_Response_Slider` están orientadas a interacciones de combate y respuestas a impactos, útiles en previsualización de storyboards de acción.
- Anclaje por referencia visual: la LoRA `pika_h3_flex_ref2va` sugiere soporte de referencia a vídeo/audio para mantener consistencia de personaje o estilo entre planos.
- Despliegue en infraestructura con VRAM limitada: la cuantización INT8 del text encoder y del diffusion model reduce el coste de memoria frente a versiones FP16/BF16, facilitando su ejecución en GPUs de gama alta de consumo.
- Archivado y auditoría de dependencias: al incluir rutas de origen y hashes, el repositorio sirve como registro reproducible de las versiones exactas de pesos usadas en un entorno de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un text encoder de 32B en INT8 requiere del orden de 32 GB solo para pesos, y el diffusion model híbrido INT8 añade varios GB adicionales; el total del repositorio es de 53,5 GB, por lo que la inferencia completa no cabe en GPUs de consumo de 24 GB sin offloading a RAM/CPU.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un pipeline completo requeriría GPUs profesionales tipo A100 80 GB o H100, o bien configuraciones multi-GPU.
- GPU de consumo: improbable que el pipeline completo quepa en una RTX 4090 (24 GB) sin técnicas de offloading secuencial por etapas (cargar text encoder, descargarlo, cargar diffusion model, etc.).
- Opciones de despliegue: ComfyUI es el entorno implícito según las rutas y la nomenclatura; no se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brocasong-ui/cobijada-hybrid-int8-worker-cache | Mirror de pesos para pipeline vídeo/audio | no disponible (text encoder 32B + diffusion + VAE + LoRAs) | no disponible | no disponible (licencias originales) | Hugging Face, 0 descargas |
| OTMFLY/Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot | Modelo original del text encoder | 32B (Qwen3-VL) | no disponible | no disponible | Hugging Face |
| Winnougan/Cobijada_Minimax-H3_Hybrid_Pruned_ComfyUI | Modelo original del diffusion model | no disponible | no disponible | no disponible | Hugging Face |
| Comfy-Org/MiniMax-H3 | Repositorio oficial de VAE y componentes | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a los repositorios de origen citados en la model card, ya que no se dispone de datos de rendimiento ni de alternativas equivalentes documentadas.

## Limitaciones y advertencias

- El repositorio es un mirror, no un modelo entrenado por el autor; no hay garantía de mantenimiento, soporte ni actualizaciones.
- La licencia no está declarada de forma explícita: cada componente conserva su licencia original, lo que obliga a verificar individualmente los términos de OTMFLY, Winnougan, Comfy-Org, Pika-Labs, fal, RunningHub, alibof y JOKER141 antes de cualquier uso comercial.
- Varios componentes incluyen en su nombre términos como "uncensored" y "heretic", lo que sugiere que los pesos originales pueden haber sido modificados para reducir restricciones de contenido; esto implica riesgos de seguridad y de cumplimiento en entornos productivos.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de calidad; al ser un pipeline generativo de vídeo, el riesgo principal no es la alucinación textual sino la generación de contenido no deseado o no verificado.
- El tamaño de 53,5 GB y la presencia de un text encoder de 32B limitan su despliegue a infraestructura con VRAM elevada o a configuraciones con offloading.
- No se documentan idiomas soportados, por lo que el comportamiento multilingüe del text encoder en este pipeline concreto es incierto.
- Al tratarse de un ensamblaje de artefactos de terceros, la reproducibilidad depende de que los repositorios origen sigan disponibles; los hashes SHA256 permiten verificar integridad, pero no sustituyen a los ficheros originales si estos se eliminan.
- No hay métricas de rendimiento, latencia ni throughput publicadas para este ensamblaje concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/brocasong-ui/cobijada-hybrid-int8-worker-cache
- Text encoder original: https://huggingface.co/OTMFLY/Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot
- VAE de vídeo original: https://huggingface.co/Comfy-Org/MiniMax-H3
- LoRA Pika: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- LoRA MysticXXX: https://huggingface.co/alibof/dfd
- Diffusion model original: https://huggingface.co/Winnougan/Cobijada_Minimax-H3_Hybrid_Pruned_ComfyUI
- LoRA de realismo: https://huggingface.co/fal/MiniMax-H3-Realism-People-LoRA
- LoRA de combate: https://huggingface.co/JOKER141/H3-Fight-Flow-Fight-Interaction-LoRA
- LoRA de respuesta a impactos: https://huggingface.co/RunningHubAI/rh-bunny-h3-impact-response-slider-lora
- LoRA de combate V2: https://huggingface.co/RunningHubAI/rh-combat-basev2-lora
