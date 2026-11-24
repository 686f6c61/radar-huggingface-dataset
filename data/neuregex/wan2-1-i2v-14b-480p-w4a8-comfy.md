# neuregex/Wan2.1-I2V-14B-480P-w4a8-comfy

## Resumen

Wan2.1-I2V-14B-480P-w4a8-comfy es una versión cuantizada a 4 bits del modelo de generación de vídeo a partir de imagen Wan-AI/Wan2.1-I2V-14B-480P, publicada por el usuario neuregex. El modelo original lo desarrolla el equipo Wan de Alibaba, y esta variante concreta se distribuye en el formato propio de ComfyUI `asym_w4a8_int8`, lo que permite cargarla con los nodos estándar del programa sin necesidad de nodos personalizados.

El problema que resuelve es de despliegue: los pesos originales en bf16 ocupan 32,8 GB y la versión fp8 escalada 16,4 GB, lo que deja fuera a muchas GPU de consumo. Esta cuantización reduce el fichero a 9,2 GB, un 28 % del tamaño original, manteniendo la arquitectura del modelo base de 14 000 millones de parámetros y la resolución de salida de 480p.

Es relevante porque democratiza la inferencia de un modelo de image-to-video de gran tamaño en hardware más modesto, con una pérdida de calidad controlada y verificada por el autor mediante comparación con la versión fp8 usando el mismo flujo de trabajo y semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de difusión para image-to-video, Wan2.1) |
| Parametros totales | 14B (según nombre del modelo base) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | w4a8 (`asym_w4a8_int8`): códigos de 4 bits sobre codebook Lloyd-Max, escalas fp8 E4M3 cada 16 pesos, escala fp32 por fila de salida, rotación Hadamard en grupos de 256 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato `asym_w4a8_int8` de ComfyUI) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base Wan2.1-I2V-14B-480P en la documentación proporcionada. El modelo pertenece a la familia Wan2.1 de generación de vídeo a partir de imagen, con 14 000 millones de parámetros y salida a 480p, pero no se detallan en la model card el tipo de transformer, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica de esta variante es exclusivamente la cuantización. Se aplicó el formato `asym_w4a8_int8` documentado en QUANTIZATION.md de ComfyUI mediante la librería Comfy Kitchen 0.2.39. Solo se cuantizaron las 488 capas que el fichero oficial fp8 escalado ya cuantizaba; el resto de tensores se mantienen en bf16 original. El error relativo de peso por capa tras el ciclo completo (‖W − Ŵ‖ / ‖W‖) es de 0,073 de media y 0,073 máximo. El autor verificó el resultado con el mismo flujo de trabajo y semilla que con el fichero fp8 (efecto Cakeify con LoRA, 81 fotogramas, en una L40S): el efecto se reproduce igual, con diferencias de detalle en el corte y el interior del pastel.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video), con salida a 480p.
- Integración nativa en ComfyUI mediante el nodo `UNETLoader` (Load Diffusion Model), sin nodos personalizados.
- Compatibilidad con LoRAs de efectos y estilos, como el efecto Cakeify empleado en la verificación del autor.
- Ejecución con kernels int8 en tarjetas RTX 30 series y posteriores; en tarjetas más antiguas se desquantiza cada capa antes de multiplicar (mismo consumo de memoria, más lento).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo, por tratarse de un modelo generativo de vídeo.

## Casos de uso

- Prototipado rápido de image-to-video en estaciones de trabajo con GPU de consumo: al ocupar 9,2 GB, el modelo cabe en tarjetas de 12-16 GB y permite iterar sobre ideas sin acceso a clústeres.
- Animación de ilustraciones y fotografía fija para redes sociales: se parte de una imagen y se generan clips de 480p con movimiento coherente, adecuados para formatos verticales y horizontales de publicación rápida.
- Previsualización de efectos con LoRA antes de un render final en bf16: el autor confirma que el efecto se reproduce igual que con fp8, por lo que sirve como paso de validación barato.
- Creación de contenido para vídeo musical o piezas cortas: la ventana de 81 fotogramas empleada en la verificación permite clips breves con continuidad visual.
- Educación y demostraciones técnicas: al cargarse con nodos estándar de ComfyUI, es útil para talleres y tutoriales sobre cuantización y pipelines de difusión de vídeo.
- Investigación sobre cuantización de modelos de difusión: el fichero sirve como referencia reproducible del formato `asym_w4a8_int8` con métricas de error publicadas por capa.
- Automatización de pipelines de contenido en local: al no requerir nodos personalizados, se puede orquestar desde scripts que invoquen la API de ComfyUI en máquinas con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta la métrica de error de cuantización por capa (media 0,073, máximo 0,073) y una comparación cualitativa con el fichero fp8 en una L40S.

## Requisitos de hardware

- VRAM estimada: el fichero de pesos ocupa 9,2 GB; se necesita margen adicional para activaciones, VAE, text encoder y el búfer de 81 fotogramas, por lo que en la práctica se recomienda al menos 12-16 GB de VRAM (estimación a partir del tamaño del fichero, no confirmada en la model card).
- GPU recomendadas: L40S (usada por el autor para la verificación), así como A100 o H100 para mayor throughput.
- GPU de consumo: tarjetas RTX 30 series y posteriores ejecutan kernels int8; modelos con 12 GB o más deberían poder cargar el modelo, aunque el margen para el resto del pipeline es ajustado.
- Tarjetas anteriores a RTX 30 series: funcionan, pero desquantizan cada capa antes de multiplicar, con el mismo consumo de memoria y mayor latencia.
- Despliegue: ComfyUI en versión del 2026-10-19 o posterior (probado en el commit `e3bee7f`, posterior a 0.42.0). No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño | Licencia | Notas |
|---|---|---:|---:|---|---|
| neuregex/Wan2.1-I2V-14B-480P-w4a8-comfy | 14B | w4a8 safetensors | 9,2 GB | Apache 2.0 | Objeto de esta ficha; nodos estándar de ComfyUI |
| Wan-AI/Wan2.1-I2V-14B-480P (bf16) | 14B | bf16 safetensors | 32,8 GB | Apache 2.0 | Modelo base sin cuantizar; requiere mucha más VRAM |
| wan2.1_i2v_480p_14B_fp8_scaled | 14B | fp8 escalado | 16,4 GB | Apache 2.0 | Versión fp8 oficial; referencia de calidad usada por el autor |

No se dispone de información sobre otros modelos comparables de image-to-video en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización introduce un error relativo de peso de 0,073 por capa; aunque el autor reporta resultados visualmente equivalentes al fp8, pueden aparecer diferencias de detalle en escenas complejas.
- Solo se cuantizaron 488 capas; el resto permanece en bf16, por lo que el ahorro de memoria es parcial respecto a una cuantización completa.
- Requiere ComfyUI del 2026-10-19 o posterior; versiones anteriores no cargarán el formato correctamente.
- En GPU anteriores a RTX 30 series la inferencia es más lenta por la desquantización por capa.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación específicos; al ser un modelo de vídeo, los riesgos se centran en artefactos visuales y coherencia temporal, no evaluados en la model card.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte que los pesos fueron modificados mediante cuantización; conviene conservar el aviso de licencia incluido.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neuregex/Wan2.1-I2V-14B-480P-w4a8-comfy
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P
- Comunidad (Discord del autor): https://discord.gg/HxfP9TnctJ
