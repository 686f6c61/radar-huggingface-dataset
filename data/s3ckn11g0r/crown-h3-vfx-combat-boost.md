# S3ckn11g0r/CROWN-H3-VFX-Combat-Boost

## Resumen

CROWN-H3-VFX-Combat-Boost es un LoRA de refuerzo de efectos visuales y combate cuerpo a cuerpo de alta velocidad para el modelo de generación de vídeo MiniMax H3, en sus variantes Ref2VA, I2VA y T2VA. Lo desarrolla el creador independiente NineCrowns (S3ckn11g0r en Hugging Face) y se distribuye con la librería `minimax-h3`, orientada a flujos de trabajo en ComfyUI. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que se aplica sobre los pesos del UNet de MiniMax H3 para sesgar la generación hacia coreografías marciales, estelas de fluido y plasma, partículas de rayos y fotogramas de impacto estilo sakuga.

El adaptador se entrena exclusivamente sobre los bloques de vídeo (bloques 10 a 49, `video_only: True`) con rango 64 y alpha 64, de modo que no toca las capas asociadas a identidad facial ni a consistencia de vestuario. Esa separación es su propuesta de valor: en flujos multi-referencia (Ref2VA) permite intensificar la acción sin degradar los rostros ni la ropa de los personajes de referencia. El repo ocupa 1,2 GB, coherente con un LoRA de rango alto en BF16 sobre un UNet grande.

Su relevancia es de nicho pero clara: cubre una demanda concreta de producción de vídeo generativo con estética de anime de acción y artes marciales, donde los modelos base tienden a producir movimiento genérico. La licencia es propietaria y específica del autor (`bespoke-lora-license`), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de difusión de vídeo MiniMax H3 |
| Parametros totales | no disponible (rango 64, alpha 64; tamano de repo 1,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base MiniMax H3) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; el autor cita BF16 en el stack de referencia) |
| Idiomas soportados | no disponible (el prompt de instancia es `crown_vfx_combat`; la model card esta en ingles y chino) |
| Licencia | bespoke-lora-license (propietaria, definida por el autor) |
| Formato de pesos | safetensors (`CROWN_H3_VFX_Combat_Boost_V2_r64.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 64 aplicado sobre los bloques 10 a 49 del UNet de MiniMax H3, con entrenamiento restringido a las capas de vídeo (`video_only: True`). Esa decisión de diseño desacopla el refuerzo de movimiento y efectos de las capas que codifican identidad y apariencia, de forma que el adaptador no contamina los rasgos faciales ni el vestuario en flujos con imágenes de referencia. El modelo base es un transformer de difusión para texto-a-vídeo con audio, con un text encoder Qwen3-VL de 32B y VAEs separados de vídeo y audio según los stacks publicados por el autor.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste por preferencias. La model card documenta la configuración de inferencia empleada en las demostraciones: 24 a 25 pasos, sampler `euler`, scheduler `beta` o sigmas manuales, `denoise: 1.0` y `MiniMaxH3SigmaShift` con `shift_video: 12.0` y `shift_audio: 3.0`. También publica los stacks completos de LoRA con pesos exactos, incluido el propio adaptador a 1,25 o 1,35 según la escena, lo que facilita la reproducibilidad.

## Capacidades

- Refuerzo de coreografías de combate cuerpo a cuerpo a alta velocidad, con y sin armas.
- Generación de estelas multicapa de fluidos y plasma, partículas de rayos y fotogramas de impacto estilo sakuga.
- Detonaciones de gran escala que ocupan la pantalla (el autor cita ejemplos como una supernova de loto de hielo de 50 metros).
- Preservación de identidad facial y consistencia de vestuario en flujos multi-referencia (Ref2VA).
- Compatible con las rutas Ref2VA (referencia a vídeo), I2VA (imagen a vídeo) y T2VA (texto a vídeo) de MiniMax H3.
- Integración en ComfyUI mediante el prompt de instancia `crown_vfx_combat`.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un adaptador generativo de vídeo, no un modelo de lenguaje.

## Casos de uso

- Previsualización de escenas de acción para animación: el adaptador genera combates cuerpo a cuerpo con continuidad de movimiento y estelas de energía, útil para animáticas de episodios antes de la producción final.
- Storyboards animados de artes marciales: con T2VA se pueden iterar variantes de una pelea a partir de descripciones textuales y quedarse con la que mejor funcione narrativamente.
- Publicidad y tráilers con estética anime: el refuerzo de impactos y partículas permite construir planos de clímax sin animación manual, con el prompt de instancia como disparador.
- Contenido para videojuegos: generación de cinemáticas de habilidades definitivas y efectos de golpe para tráilers de lanzamiento o material promocional de un título de lucha.
- Flujos con personajes recurrentes: en Ref2VA, el adaptador mantiene el rostro y el vestuario de los personajes de referencia mientras intensifica la acción, lo que sirve para series con protagonistas fijos.
- Pruebas de concepto de efectos visuales: comparar rápidamente variantes de un mismo plano de combate combinando el adaptador con sliders de velocidad y exposición, tal como documenta el autor.
- Iteración de iluminación y contraste en escenas de acción: el stack de referencia incluye un slider de exposición (`MMH3-ExposureSlider-V1`), lo que permite ajustar el look del plano sin regenerar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 1,2 GB, pero la inferencia exige cargar el UNet completo de MiniMax H3: el autor cita una versión completa en BF16 de 66 GB y una versión podada de 37,5 GB.
- Text encoder Qwen3-VL de 32B en BF16 más VAEs de vídeo y audio en FP32: el consumo agregado de VRAM es elevado y no cabe en GPUs de consumo convencionales.
- GPU recomendadas: no disponible de forma explícita; por el tamaño del UNet y del text encoder, el despliegue realista requiere GPUs de centro de datos (A100, H100 o superiores) o servicios en la nube.
- No cabe en GPUs de consumo como la RTX 4090 con el stack completo en BF16; el autor ofrece alternativas en la nube para usuarios sin hardware suficiente.
- Opciones de despliegue: ComfyUI es el entorno documentado; el autor publica flujos en la nube en RunningHub (versiones global y china).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CROWN-H3-VFX-Combat-Boost | LoRA sobre MiniMax H3 | rango 64, alpha 64; repo 1,2 GB | no disponible | bespoke-lora-license | Hugging Face, RunningHub, Civitai |
| MiniMax H3 (base) | Modelo de difusión texto-a-vídeo con audio | no disponible (UNet BF16 de 66 GB) | no disponible | no disponible en la informacion | Referenciado en los stacks del autor |
| LoRA de combate alternativos citados por el autor (`H3_Combat_V2`, `Bunny_weapon_combatV1`) | LoRA sobre MiniMax H3 | no disponible | no disponible | no disponible | Usados en los stacks de demostracion |

No se dispone de datos de rendimiento comparativo entre estos adaptadores en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia propietaria y específica del autor (`bespoke-lora-license`): es imprescindible revisar los términos en el enlace de Civitai antes de cualquier uso comercial.
- Al ser un LoRA, hereda los sesgos y limitaciones del modelo base MiniMax H3, que no se documentan en la información disponible.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir anatomías inconsistentes, físicas imposibles o artefactos en planos largos.
- El autor documenta pesos de LoRA superiores a 1,0 (hasta 1,35), lo que en la práctica puede saturar el estilo y degradar la variedad si se aplica sin ajuste fino.
- El refuerzo está entrenado para estética de acción y efectos; puede empujar escenas tranquilas hacia el movimiento exagerado si se usa el prompt de instancia de forma indiscriminada.
- Los requisitos de hardware del modelo base son muy altos, lo que limita la experimentación local.
- No hay información sobre idiomas de prompt soportados más allá de los ejemplos en inglés y chino de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-H3-VFX-Combat-Boost
- RunningHub Global (modelo): https://www.runninghub.ai/model/public/2120441999441563649
- RunningHub Global (workflow ComfyUI): https://www.runninghub.ai/workflow/2120529813882970113
- RunningHub Global (webapp): https://www.runninghub.ai/ai-detail/2120529837906804738
- RunningHub China (modelo): https://www.runninghub.cn/model/public/2119393519600230401
- RunningHub China (workflow): https://www.runninghub.cn/workflow/2119379654992814081
- RunningHub China (webapp): https://www.runninghub.cn/ai-detail/2119407566374658049
- Civitai (página oficial del autor): https://civitai.com/models/3041075
- Perfil del autor en Civitai: https://civitai.com/user/NineCrowns
