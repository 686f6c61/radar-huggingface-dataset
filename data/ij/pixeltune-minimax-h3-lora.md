# ij/PixelTune-MiniMax-H3-LoRA

## Resumen

PixelTune · MiniMax H3 pixel-art LoRA es un adaptador LoRA experimental desarrollado por el usuario ij para el modelo de generacion de video MiniMax-H3. Su proposito es especializar el modelo base en la sintesis de animaciones en estilo pixel-art 2D, con una rejilla de pixeles nativa ampliada mediante vecino mas cercano (factor 4x). Se trata de un checkpoint intermedio de 1000 pasos de entrenamiento, no de una ejecucion completa de 5000 pasos, y el propio autor advierte que no ha superado la aprobacion final de calidad estetica ni de movimiento.

El adaptador contiene 155.058.176 parametros en FP32, organizados en 416 tensores canonicos `lora_A.weight` / `lora_B.weight` con rango 32 y alpha 32, en el layout QKV de Comfy. No es un modelo fusionado ni un directorio PEFT estandar, y su carga automatica en ComfyUI no ha sido verificada. El flujo de trabajo probado por el autor utiliza DiffSynth-Studio con un pipeline `MiniMaxH3Pipeline` ya cargado.

Es relevante ahora porque demuestra la viabilidad de especializar modelos de difusion de video de gran escala en estilos graficos muy concretos con un dataset reducido (153 clips activos de 51 videos fuente), aunque con limitaciones documentadas sobre estabilidad temporal de regiones estaticas y alineacion exacta de los limites de pixel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre MiniMax-H3 (modelo de difusion texto-a-video con encoder Qwen y VAE de video y audio) |
| Parametros totales | 155.058.176 (adaptador LoRA en FP32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador distribuido en FP32; el modelo base probado usa BF16 pruned) |
| Idiomas soportados | en, ko |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (`pixeltune_h3_full_canvas4_v3_step_01000.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 aplicado sobre el modelo de difusion MiniMax-H3, con la base congelada en BF16 y el adaptador en FP32. El entrenamiento se realizo sobre el run `pixel_h3_full_canvas4_v3` hasta el paso 1000, con learning rate 5e-5. La funcion de perdida combina flow matching con tres terminos adicionales: perdida de rejilla (coeficiente 1,256806), perdida RGB decodificada (1,662547) y consistencia dentro de la retencion o "hold" (2,761293). El autor advierte que estos coeficientes no son porcentajes de gradiente medidos.

El dataset de entrenamiento consta de 153 clips activos extraidos de 51 videos fuente, con 21 clips de validacion, procedentes del dataset `trojblue/test-HunyuanVideo-pixelart-videos`. El entrenamiento utiliza una rejilla de pixeles de 4x con vecino mas cercano: se declara un lienzo nativo (por ejemplo 128x128) y se genera a cuatro veces esas dimensiones (512x512). Los lados nativos retenidos son multiplos de 8, la salida se limita a 1280 pixeles por lado y 1.048.576 pixeles de area, y la composicion se preserva con recorte minimo de borde (hasta cuatro pixeles nativos). El autor reconoce que algunas captions de entrenamiento describian fuentes completas en lugar de la ventana corta exacta, y que la seleccion posterior revisada por el propietario (23 fuentes) no se uso para entrenar este checkpoint.

## Capacidades

- Generacion de video texto-a-video en estilo pixel-art 2D animado.
- Control de lienzo nativo de pixeles mediante convenciones de prompt (`pxgrid4`, `native_res_128x128`, `source_fps_10`).
- Soporte de condiciones de FPS fraccionario mediante la etiqueta `source_fps_8p3333` (por ejemplo 25/3).
- Generacion de escenas con camara fija y fondo estable, segun los ejemplos de prompt documentados.
- Soporte de descripcion multimodal integrada y campos de paisaje sonoro y musica no diegetica en el prompt (aunque el flujo probado omite la decodificacion de audio).
- Capacidades multilingues limitadas a ingles y coreano.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Prototipado de animaciones pixel-art para videojuegos indie: el adaptador permite generar clips cortos de 39 frames a 24 fps con estetica pixel-art coherente, utiles como referencia de animacion o placeholders antes de la produccion final de sprites.
- Generacion de fondos animados para escenas de juegos 2D: con camara fija y fondo estable declarados en el prompt, el modelo produce escenarios con movimiento sutil (parpadeos, colas, hojas) adecuados para capas de parallax.
- Creacion de contenido para redes sociales en estetica retro: clips silenciosos de estilo pixel-art con resolucion nativa baja (128x128 o 320x176) ampliada a 512x512 o superior, apropiados para formatos verticales u horizontales de corta duracion.
- Exploracion conceptual de direccion de arte: el modelo permite iterar rapidamente sobre composiciones pixel-art con prompts detallados que incluyen condiciones de rejilla y FPS, ayudando a validar ideas antes de encargar animacion manual.
- Investigacion sobre especializacion de modelos de difusion de video: el adaptador y su manifiesto (`adapter_manifest.json`) con hashes y graficas de perdida en `evaluation/` sirven como caso de estudio reproducible de fine-tuning LoRA con perdidas auxiliares de rejilla y consistencia.
- Generacion de assets para prototipos de aventuras graficas: clips cortos de personajes (por ejemplo un zorro en un bosque iluminado por la luna) que pueden integrarse en motores 2D como animaciones de espera o idle.
- Demo tecnica de pipelines DiffSynth-Studio: el codigo de carga documentado permite reproducir el flujo con 50 pasos de inferencia, CFG 1, video shift 12, audio shift 3 y RoPE nativo sin modificar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor incluye graficas de perdida de validacion y registros en el directorio `evaluation/`, pero advierte explicitamente que una perdida de validacion menor no prueba una mejor generacion estetica. Las muestras crudas incluidas (seed 777, 50 pasos, 39 frames a 24 fps, sin snapping de rejilla ni reduccion de paleta) son cualitativas y no constituyen benchmarks numericos.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,8 GB en el repositorio (FP32); requiere cargar ademas el modelo base MiniMax-H3 y sus VAE de video y audio, que son descargas separadas.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base y de la longitud del clip (39 frames a 24 fps en el flujo probado).
- GPU recomendadas: no disponible; el autor no especifica hardware de entrenamiento ni de inferencia.
- Compatibilidad con GPU de consumo: no verificada; el requisito dominante es el modelo base, no el adaptador.
- Opciones de despliegue: DiffSynth-Studio (commit `974cfa37f27ac55eba3b6d10efa21f876900572d`) con `MiniMaxH3Pipeline` y `pipe.load_lora(pipe.dit, state_dict=state, alpha=1.0)`. La carga automatica en ComfyUI no ha sido verificada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PixelTune-MiniMax-H3-LoRA (este) | LoRA sobre MiniMax-H3 | 155.058.176 (adaptador) | no disponible | minimax-h3-community-license-agreement | Hugging Face |
| MiniMax-H3 (base) | Difusion texto-a-video | no disponible | no disponible | minimax-h3-community-license-agreement | Comfy-Org/MiniMax-H3 y MiniMaxAI/MiniMax-H3 |
| HunyuanVideo pixel-art (dataset de referencia) | Dataset de videos pixel-art | no aplica | no aplica | no disponible | trojblue/test-HunyuanVideo-pixelart-videos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental de 1000 pasos, no una ejecucion completa de 5000 pasos; no ha pasado la aprobacion final de calidad estetica ni de movimiento.
- La apariencia de detalles finos, el movimiento, la estabilidad de regiones estaticas y los limites exactos de pixel pueden ser inconsistentes.
- El autor advierte que las etiquetas de prompt (`pxgrid4`, `source_fps_10`, etc.) son caracteristicas de entrenamiento, no garantias de alineacion nativa de pixeles, cadencia de poses ni velocidad fisica del movimiento.
- Algunas captions de entrenamiento describian fuentes completas en lugar de la ventana corta exacta; estos problemas se identificaron despues de esta ejecucion.
- La seleccion revisada por el propietario (23 fuentes) no se uso para entrenar este checkpoint; la perdida temporal de pixeles estaticos y la recalibracion revisada estan pendientes.
- Los coeficientes de perdida no son porcentajes de gradiente medidos; la calibracion anterior tuvo cobertura limitada tras el filtrado por resolucion.
- La calidad en videos largos no ha sido validada; el checkpoint se entreno con clips cortos.
- No es compatible de forma asumida con bases cuyo layout QKV tenga otro orden; no es un modelo fusionado ni un directorio PEFT `save_pretrained`.
- La licencia `minimax-h3-community-license-agreement` impone restricciones que deben revisarse antes de cualquier uso comercial; el adaptador hereda las condiciones del modelo base.
- Idiomas soportados limitados a ingles y coreano.
- Riesgo de alucinacion visual y de artefactos en la rejilla de pixeles no cuantificado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ij/PixelTune-MiniMax-H3-LoRA
- Pesos del adaptador: https://huggingface.co/ij/PixelTune-MiniMax-H3-LoRA/blob/main/pixeltune_h3_full_canvas4_v3_step_01000.safetensors
- Manifiesto del adaptador: https://huggingface.co/ij/PixelTune-MiniMax-H3-LoRA/blob/main/adapter_manifest.json
- Directorio de evaluacion: https://huggingface.co/ij/PixelTune-MiniMax-H3-LoRA/tree/main/evaluation
- Modelo base (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo base original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Dataset de entrenamiento: https://huggingface.co/datasets/trojblue/test-HunyuanVideo-pixelart-videos
- DiffSynth-Studio: https://github.com/modelscope/DiffSynth-Studio
