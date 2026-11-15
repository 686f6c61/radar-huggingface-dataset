# SEEDRAAI/Krea-2-LoRA-NightFlash

## Resumen

Night Flash es un LoRA (Low-Rank Adaptation) para el modelo de generacion de imagenes Krea 2 Turbo, desarrollado por SeedraAI. No se trata de un modelo completo, sino de un adaptador de bajo rango que se aplica sobre los pesos del modelo base para inducir un estilo visual muy concreto: fotografias nocturnas con flash directo, del tipo que se obtendria con la camara de un movil en una fiesta a las tres de la manana. El objetivo es reproducir la estetica de "foto de amigo", con piel sobreexpuesta, sombras duras detras del sujeto y fondos que caen a negro.

El repositorio ocupa 0,2 GB y contiene pesos en formato safetensors (`nightflash_krea2_v1.safetensors`), pensados para cargarse en ComfyUI mediante el nodo LoraLoaderModelOnly. El adaptador se activa con la palabra clave `n1ghtfl4sh` y esta disenado para trabajar con prompts en ingles. La model card recomienda 8 pasos, CFG 1, sampler euler_ancestral y resolucion vertical 9:16 de aproximadamente 2 MP (1088x1920).

La relevancia de este tipo de publicacion es practica: permite a creadores e investigadores reproducir un look fotografico muy especifico sin reentrenar un modelo completo, aprovechando la eficiencia del modelo base Turbo (pocos pasos, CFG bajo) y manteniendo la licencia comunitaria del modelo original. Al ser un LoRA pequeno, el coste de almacenamiento e inferencia adicional es minimo respecto al base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Krea 2 Turbo; la arquitectura del modelo base no esta disponible en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | no disponible (modelo de text-to-image; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos safetensors sin indicar variantes cuantizadas |
| Idiomas soportados | en (ingles) |
| Licencia | krea-2-community-license (heredada del modelo base) |
| Formato de pesos | safetensors (`nightflash_krea2_v1.safetensors`) |

## Arquitectura y entrenamiento

Night Flash es un adaptador LoRA que modifica los pesos del modelo de difusion Krea 2 Turbo. No se dispone de informacion sobre el rango del adaptador, el numero de matrices afectadas ni los hiperparametros de entrenamiento. La model card no detalla el dataset utilizado, el numero de imagenes de entrenamiento ni si se aplicaron tecnicas de regularizacion o captions automaticos.

La innovacion principal no es arquitectonica sino estilistica: el LoRA codifica una distribucion visual muy concreta (flash directo, alta exposicion, sombras duras, fondos oscuros, luces de farolas y pilotos traseros) que el modelo base probablemente no genera de forma fiable por si solo. El modelo base Turbo esta disenado para inferencia rapida (8 pasos, CFG 1), lo que hace que el adaptador sea util en flujos de trabajo iterativos dentro de ComfyUI.

## Capacidades

- Generacion de imagenes text-to-image con estetica de fotografia nocturna con flash directo.
- Activacion mediante la palabra clave `n1ghtfl4sh`; funciona mejor con la plantilla `n1ghtfl4sh, vertical phone photo taken with harsh direct flash at night, {escena}`.
- Escenas recomendadas por el autor: interiores de coche de noche, selfies frente al espejo, fiestas en casa, discotecas, taxis, gasolineras, pasillos de hotel, ascensores y calles tras la lluvia.
- Retratos, grupos y cuerpo completo.
- Soporte de ajuste de intensidad del efecto: peso 1.0 para flash duro, 0.8 para un flash mas suave.
- Compatible con ComfyUI mediante LoraLoaderModelOnly.
- Palabras de prompt que refuerzan el estilo: *harsh direct flash, overexposed skin, hard shadow behind, dark background, candid snapshot, slight motion blur*.
- No se indican capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso; es un adaptador exclusivamente de generacion de imagenes.

## Casos de uso

- Fotografia editorial de estilo "snapshot": generar imagenes de moda o retrato con estetica de fiesta nocturna para campanas que buscan autenticidad y un look amateur deliberado, usando la plantilla de prompt del autor y 8 pasos con CFG 1.
- Previsualizacion de conceptos para cine o publicidad: crear storyboards de escenas nocturnas (discotecas, taxis, pasillos de hotel) antes de rodar, aprovechando la coherencia estilistica del LoRA.
- Contenido para redes sociales: producir imagenes verticales 9:16 (1088x1920) listas para stories o reels, con la relacion de aspecto que el autor recomienda.
- Generacion de datasets sinteticos: crear conjuntos de imagenes con iluminacion de flash directo para entrenar o evaluar modelos de vision (deteccion de sombras, estimacion de iluminacion, restauracion).
- Maquetacion de productos editoriales: ilustrar articulos sobre vida nocturna, musica o cultura de fiesta con imagenes que imitan fotografia de movil.
- Iteracion creativa en ComfyUI: integrar el LoRA en grafos con pilas de realismo, ruido de camara, grano y color, como sugiere el autor, para flujos de postproduccion automatizada.
- Pruebas de robustez de pipelines text-to-image: evaluar como un adaptador pequeno altera la distribucion de salida del modelo base con CFG bajo y pocos pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende enteramente del modelo base Krea 2 Turbo, cuyos requisitos no se detallan. El LoRA en si ocupa 0,2 GB en disco y anade una sobrecarga minima de memoria.
- GPU recomendadas: no disponible. Al tratarse de un adaptador sobre un modelo Turbo de 8 pasos, se espera que el coste computacional sea el del base, pero no se confirma en la model card.
- Compatibilidad con GPU de consumo: no disponible; no se especifica.
- Opciones de despliegue: ComfyUI (flujo documentado por el autor con LoraLoaderModelOnly). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEEDRAAI/Krea-2-LoRA-NightFlash | LoRA sobre Krea 2 Turbo | no disponible | no aplica | krea-2-community-license | Hugging Face, CivitAI |
| krea/Krea-2-Turbo | Modelo base text-to-image | no disponible | no aplica | krea-2-community-license | Hugging Face |
| Alternativas de LoRA de estilo fotografico nocturno | LoRA | no disponible | no aplica | variable | CivitAI, Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- El trigger word puede aparecer impreso como texto en superficies planas (letreros, logos de chaquetas, latas, bolsas de patatas); el autor recomienda anadir *plain, no logos, no text* o evitar escenas con rotulos de tienda.
- El adaptador esta orientado a un unico estilo visual; no es adecuado para generacion generica de imagenes fuera de la estetica de flash nocturno.
- Solo se documenta soporte de prompts en ingles.
- Riesgo de alucinacion visual: no disponible como dato especifico, pero es inherente a los modelos de difusion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Restricciones de licencia: se hereda la krea-2-community-license del modelo base; es necesario revisar sus terminos antes de uso comercial, ya que la model card solo enlaza a la licencia del base sin detallar condiciones.
- El LoRA no incluye los workflows completos de SeedraAI (pila de realismo, ruido, grano y color), que forman parte de una membresia de pago.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion comunitaria.
- Los requisitos de hardware y el rendimiento real del modelo base no estan documentados en la informacion disponible, lo que limita la planificacion de despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/SEEDRAAI/Krea-2-LoRA-NightFlash
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- CivitAI: https://civitai.com/models/3045072
- Web del autor: https://seedraai.com/?utm_source=huggingface&utm_campaign=nightflash
- Discord de la comunidad: https://discord.gg/seedraai
