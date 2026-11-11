# S3ckn11g0r/CROWN-H3-VFX-Combat-Boost

## Resumen
CROWN-H3-VFX-Combat-Boost es un LoRA de concepto para el modelo de generación de vídeo MiniMax H3, desarrollado por el usuario NineCrowns (S3ckn11g0r) y publicado en Hugging Face. No es un modelo base autónomo, sino un adaptador de bajo rango que se aplica sobre los pesos de MiniMax H3 para reforzar coreografías de artes marciales de alta velocidad y efectos visuales (VFX) de combate, como estelas de plasma, partículas de rayos y fotogramas de impacto estilo sakuga.

El adaptador se ha entrenado con rango 64 y alpha 64, apuntando exclusivamente a los bloques de vídeo 10–49 (`video_only: True`), lo que según el autor preserva la identidad facial y el vestuario de los personajes en flujos de referencia múltiple (Ref2VA). Está pensado para su uso en ComfyUI con los modos Ref2VA, I2VA y T2VA de MiniMax H3.

Su relevancia es acotada: se trata de un recurso muy específico para creadores que generan vídeo de acción con MiniMax H3 y necesitan un refuerzo consistente de movimiento y efectos. El repositorio ocupa 1,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3; rango 64, alpha 64, bloques de vídeo 10–49 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base MiniMax H3 no se detalla en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el LoRA; el modelo base se usa en BF16 (66 GB) o pruned BF16 (37,5 GB) según los ejemplos del autor |
| Idiomas soportados | no disponible |
| Licencia | bespoke-lora-license (licencia personalizada; enlace a Civitai del autor) |
| Formato de pesos | safetensors (`CROWN_H3_VFX_Combat_Boost_V2_r64.safetensors`) |

## Arquitectura y entrenamiento
El adaptador es un LoRA de rango 64 con alpha 64 entrenado sobre MiniMax H3, un modelo de generación texto-a-vídeo (y variantes con referencia de imagen) que emplea un UNet, un codificador de texto basado en Qwen3-VL de 32B y VAEs separados para vídeo y audio. El entrenamiento se restringe a los bloques de vídeo 10–49 (`video_only: True`), de modo que el adaptador modifica la dinámica de movimiento y los efectos sin tocar las capas que gobiernan la identidad del personaje.

No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste por preferencias. El autor documenta el prompt de instancia `crown_vfx_combat` y una configuración de inferencia recomendada: 20–25 pasos, sampler euler, scheduler beta y `MiniMaxH3SigmaShift` con `shift_video: 12.0` y `shift_audio: 3.0`. En los ejemplos de uso se combina con otros LoRA (combate, velocidad de movimiento, exposición) con pesos entre 0,45 y 1,60, y el propio adaptador se aplica con pesos de 1,25 a 1,35.

## Capacidades
- Refuerzo de coreografías de combate cuerpo a cuerpo y con armas a alta velocidad sobre MiniMax H3.
- Generación de efectos visuales: estelas fluidas y de plasma multicapa, partículas de rayos, fotogramas de impacto sakuga y detonaciones de gran escala.
- Preservación de la identidad facial y del vestuario en flujos de referencia múltiple (Ref2VA), según el autor.
- Compatible con los modos Ref2VA, I2VA y T2VA del modelo base.
- Integración en ComfyUI mediante el stack de LoRA del modelo base.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente; su función es exclusivamente la generación de vídeo.

## Casos de uso
- Producción de vídeo de acción para cortometrajes: el adaptador refuerza combates cuerpo a cuerpo y con armas, útil para generar planos de lucha con continuidad de personaje en flujos Ref2VA.
- Previsualización de secuencias de artes marciales: permite iterar sobre coreografías y encuadres antes de un rodaje real, con 20–25 pasos de muestreo.
- Creación de contenido para redes sociales: clips de 15 segundos con efectos de impacto y estelas de energía, como los ejemplos publicados por el autor.
- Diseño de efectos visuales de referencia: genera propuestas de partículas, plasma y explosiones que sirven de guía para artistas de VFX.
- Prototipado de escenas de anime o sakuga: los fotogramas de impacto y las detonaciones a pantalla completa encajan con estilos de animación japonesa.
- Flujos de trabajo con múltiples LoRA en ComfyUI: se combina con adaptadores de velocidad, exposición y combate con pesos documentados para ajustar el resultado final.
- Exploración de identidad de personaje en escenas de acción: el entrenamiento solo en bloques de vídeo busca mantener rostro y vestuario estables en planos de lucha.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- El adaptador ocupa 1,2 GB, pero requiere el modelo base MiniMax H3 para funcionar.
- Modelo base completo en BF16: 66 GB de UNet, más el codificador de texto Qwen3-VL de 32B en BF16 y los VAE de vídeo y audio en FP32; no cabe en GPU de consumo.
- Variante pruned BF16 del UNet: 37,5 GB, según el ejemplo del autor; sigue requiriendo GPU de数据中心 o múltiples GPU.
- Codificador de texto alternativo en INT8 (`qwen3vl_32b_h3_ultra_uncensored_heretic_int8_convrot`) y VAE de vídeo en INT8, usados en uno de los ejemplos para reducir requisitos.
- GPU recomendadas: no disponibles de forma explícita; por el tamaño del modelo base se orienta a A100/H100 de 80 GB o configuraciones multi-GPU.
- Despliegue: ComfyUI, con los nodos y el stack de LoRA descritos por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye otros LoRA o modelos de vídeo comparables con datos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias
- Licencia personalizada (`bespoke-lora-license`) con enlace a Civitai; es necesario revisar sus términos antes de cualquier uso comercial.
- El adaptador depende del modelo base MiniMax H3 y de su ecosistema (UNet, codificador Qwen3-VL, VAE); no es utilizable de forma autónoma.
- El entrenamiento solo en bloques de vídeo 10–49 puede limitar la modificación de otros aspectos de la generación.
- No hay datos publicados sobre sesgos, tasa de alucinación visual o degradación en escenas sin combate.
- El autor recomienda pesos concretos y stacks de LoRA; usarlo fuera de esas configuraciones puede producir resultados distintos a los mostrados.
- Sin descargas ni likes registrados en el momento de la consulta; no hay evidencia comunitaria de validación independiente.
- Los ejemplos incluyen un codificador de texto "uncensored/heretic"; conviene valorar implicaciones de contenido y cumplimiento en producción.
- Idiomas soportados no disponibles; la generación de vídeo no garantiza coherencia lingüística en texto dentro de la imagen.

## Enlaces
- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-H3-VFX-Combat-Boost
- Civitai del autor: https://civitai.com/models/3041075
- Perfil de Civitai: https://civitai.com/user/NineCrowns
- RunningHub (demo en la nube): https://www.runninghub.ai/model/public/2120441999441563649
