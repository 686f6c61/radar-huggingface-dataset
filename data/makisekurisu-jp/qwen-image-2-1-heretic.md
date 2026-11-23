# makisekurisu-jp/Qwen-Image-2.1-Heretic

## Resumen

Qwen-Image-2.1-Heretic es un ajuste fino (finetune) del modelo de difusion de imagenes Qwen/Qwen-Image-2.1, publicado por el usuario makisekurisu-jp en Hugging Face. Se distribuye como un unico archivo de pesos compatible con ComfyUI (tag `diffusion-single-file`), lo que facilita su integracion en flujos de trabajo de generacion de imagenes sin necesidad de cargar el modelo base completo por separado.

El modelo parte de la arquitectura de difusion de Qwen-Image-2.1, un modelo texto-a-imagen de la familia Qwen. El sufijo "Heretic" hace referencia a la tecnica de "abliteration" o eliminacion de rechazos (uncensoring), habitual en la comunidad de modelos abiertos, orientada a reducir las negativas del modelo ante determinadas peticiones. La model card no documenta el proceso de entrenamiento ni los datos utilizados.

Su relevancia practica es acotada: es un modelo de nicho con 3.859 descargas y 4 likes en el momento de la consulta, y su interes radica en ofrecer una variante sin censura del modelo base para experimentacion en ComfyUI. El repositorio ocupa 70,8 GB, coherente con los pesos de un modelo de difusion de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusion (modelo texto-a-imagen), derivada de Qwen/Qwen-Image-2.1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; condicionamiento por prompt de texto) |
| Tipos de cuantizacion | no disponible (el repo se distribuye como archivo unico; el formato exacto de pesos no se detalla) |
| Idiomas soportados | no disponible (la model card no lo especifica) |
| Licencia | qwen-research (license_name: qwen-research; enlace a la licencia del modelo base) |
| Formato de pesos | diffusion-single-file (compatible con ComfyUI) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de difusion de Qwen/Qwen-Image-2.1, un modelo generativo texto-a-imagen. Al tratarse de un finetune del modelo base, comparte su estructura de red y su mecanismo de condicionamiento por texto, pero la model card no aporta detalles sobre el numero de parametros, la variante de difusion (UNet o transformer de difusion), el encoder de texto asociado ni el scheduler empleado.

No hay informacion publicada sobre el dataset de ajuste fino, el numero de pasos de entrenamiento, el uso de tecnicas como LoRA, DreamBooth, DPO o RLHF, ni sobre el metodo concreto de "abliteration" aplicado. La referencia a los repositorios de Qwen-Image-2.1 y MOSS-Image en la model card apunta a recursos de mejora de prompts (prompt rewriting y prompt enhancer), no a documentacion del entrenamiento del finetune. Tampoco se documenta ninguna innovacion tecnica adicional respecto al modelo base.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (texto-a-imagen), heredada de Qwen-Image-2.1.
- Integracion directa en ComfyUI mediante archivo unico de difusion.
- Variante "Heretic" orientada a reducir los rechazos del modelo ante prompts que el modelo base podria declinar; el alcance real de esta modificacion no esta documentado.
- Compatibilidad con flujos de mejora de prompts, segun los enlaces de la model card a los repositorios de Qwen-Image-2.1 y MOSS-Image.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no documentadas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Generacion de ilustraciones y concept art en ComfyUI: el modelo se carga como archivo unico en un nodo de difusion y permite iterar prompts con el resto de la interfaz, lo que encaja en pipelines de creacion visual repetitiva.
- Prototipado rapido de assets para videojuegos: al ser un finetune del modelo base, sirve para explorar estilos y variaciones de personajes u objetos antes de encargar arte final.
- Experimentacion con generacion de imagenes sin restricciones de contenido: el ajuste "Heretic" esta pensado para escenarios de investigacion o creacion que requieren menor tasa de rechazo, siempre dentro de los limites legales aplicables.
- Flujos de mejora de prompts: combinado con los repositorios de prompt rewriting y prompt enhancer enlazados en la model card, puede usarse para refinar automaticamente descripciones antes de la generacion.
- Generacion por lotes en estaciones de trabajo con GPU de gran memoria: el tamano del repositorio (70,8 GB) sugiere que el despliegue requiere hardware de gama alta, adecuado para entornos de produccion grafica.
- Evaluacion comparativa de finetunes: util para investigadores que comparan el comportamiento del modelo base frente a variantes ajustadas en tareas de generacion de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 70,8 GB, lo que sugiere que los pesos sin cuantizar superan ampliamente la memoria de una GPU de consumo; el formato exacto y la precision de los pesos no se detallan.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del repo, se anticipa la necesidad de GPUs de centro de datos (A100, H100) o configuraciones multi-GPU, aunque esto no esta confirmado por el autor.
- GPU de consumo: no se puede confirmar que quepa en tarjetas como la RTX 4090 (24 GB) sin cuantizacion adicional no documentada.
- Opciones de despliegue: ComfyUI como via principal, dado el tag `comfyui` y el formato `diffusion-single-file`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| makisekurisu-jp/Qwen-Image-2.1-Heretic | no disponible | no disponible | qwen-research | diffusion-single-file | Hugging Face (3.859 descargas) |
| Qwen/Qwen-Image-2.1 (modelo base) | no disponible | no disponible | qwen-research | no disponible | Hugging Face |
| DreamFast/Qwen3-VL-4b-Heretic-ComfyUI | no disponible | no disponible | no disponible | ComfyUI | Hugging Face (referenciado en la model card) |
| mdevoz/qwen3.5_9b_ultra_uncensored_heretic_int8_convrot | no disponible | no disponible | no disponible | int8 (segun nombre) | Hugging Face (referenciado en la model card) |

Los dos ultimos modelos aparecen enlazados en la model card como variantes "Heretic" de otras familias, pero no son comparables en tarea (son modelos de lenguaje, no de imagen). No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de generacion de imagen.

## Limitaciones y advertencias

- La model card no documenta el proceso de entrenamiento ni el dataset del finetune, lo que impide evaluar su calidad y sus sesgos de forma rigurosa.
- El ajuste "Heretic" reduce los rechazos del modelo, lo que puede aumentar la generacion de contenido no deseado; el uso en produccion exige filtros y moderacion propios.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar elementos incoherentes, anatomia incorrecta o texto ilegible en las imagenes.
- La licencia `qwen-research` impone restricciones; es necesario revisar el texto completo en el enlace de licencia del modelo base antes de cualquier uso comercial.
- No se especifican los idiomas soportados en los prompts, aunque al derivar de Qwen es probable un buen soporte de ingles y chino; no confirmado.
- El tamano del repositorio (70,8 GB) limita su despliegue a entornos con almacenamiento y memoria abundantes.
- No hay garantias de mantenimiento ni soporte por parte del autor; el modelo tiene una adopcion muy baja (4 likes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/makisekurisu-jp/Qwen-Image-2.1-Heretic
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Repositorio Qwen-Image-2.1 (prompts de reescritura): https://github.com/QwenLM/Qwen-Image-2.1/tree/main/prompt_rewrite/prompts
- Repositorio MOSS-Image (prompt enhancer): https://github.com/OpenMOSS/MOSS-Image/tree/main/skills/moss-image-prompt-enhancer
- Variante Heretic de Qwen3-VL en ComfyUI: https://huggingface.co/DreamFast/Qwen3-VL-4b-Heretic-ComfyUI
- Variante Heretic de Qwen3.5 9B: https://huggingface.co/mdevoz/qwen3.5_9b_ultra_uncensored_heretic_int8_convrot
