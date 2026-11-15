# cfgscale/Krea-2-LoRA-NightFlash

## Resumen

Krea-2-LoRA-NightFlash es un adaptador LoRA de bajo rango para el modelo de generacion de imagenes Krea 2 Turbo, desarrollado por cfgscale con la colaboracion de SeedraAI. Su funcion es inyectar en el modelo base un estilo fotografico muy concreto: el de las fotografias de fiesta tomadas con flash directo de camara a altas horas de la noche, con piel sobreexpuesta, sombras duras proyectadas justo detras del sujeto y fondos que caen a negro.

El adaptador no es un modelo autonomo: requiere cargar Krea 2 Turbo y aplicar el LoRA con un peso de 1.0 (o 0.8 para un flash mas suave). Se distribuye como un unico fichero safetensors de aproximadamente 0.2 GB, lo que lo hace trivial de integrar en flujos de ComfyUI mediante el nodo LoraLoaderModelOnly. El disparador es la cadena `n1ghtfl4sh`, que debe encabezar el prompt.

Es relevante para quienes trabajan en generacion de imagen fotorrealista con estetica de fotografia amateur o de movil, un nicho donde los modelos base suelen producir resultados demasiado pulidos o de estudio. El LoRA corrige esa tendencia hacia el look de instantanea casual. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Krea 2 Turbo, modelo de difusion text-to-image |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a difusion) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors de precision nativa |
| Idiomas soportados | en (prompts en ingles) |
| Licencia | krea-2-community-license (licencia del modelo base) |
| Formato de pesos | safetensors (`nightflash_krea2_v1.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Krea 2 Turbo ni sobre el proceso de entrenamiento del LoRA: no se detallan el rango, el numero de pasos, el dataset de imagenes utilizado, la composicion del mismo ni si hubo tecnicas de regularizacion o captions automaticos. El unico dato tecnico verificable es que se trata de un adaptador LoRA aplicable sobre el modelo de difusion Krea 2 Turbo, y que el autor recomienda un peso de 1.0 en inferencia.

El modelo base Krea 2 Turbo opera con un regimen de pocos pasos (8 steps, CFG 1 segun la model card), lo que sugiere una destilacion o entrenamiento orientado a muestreo rapido. El LoRA se ha disenado para funcionar dentro de ese regimen, con sampler euler_ancestral y variante beta.

## Capacidades

- Generacion de imagenes fotorrealistas con estetica de fotografia de movil con flash directo nocturno.
- Reproduccion de artefactos fotograficos especificos: piel sobreexpuesta, sombra dura tras el sujeto, fondo en negro, luces de farolas y pilotos traseros desenfocados.
- Escenas soportadas segun el autor: interiores de coche de noche, selfies en espejo, fiestas en casa, clubs, taxis, gasolineras, pasillos de hotel, ascensores y calles mojadas tras la lluvia.
- Composiciones de retrato, grupo y cuerpo entero.
- Formato vertical 9:16 a aproximadamente 2 MP (1088x1920).
- Integracion en ComfyUI mediante el nodo LoraLoaderModelOnly.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de audio o video.

## Casos de uso

- Generacion de contenido para redes sociales con estetica de fiesta: el LoRA produce instantaneas verticales 9:16 listas para publicar, con el look de foto tomada por un amigo a las 3 de la manana, adecuado para campanas de marcas de bebidas, eventos nocturnos o moda urbana.
- Prototipado de moodboards para fotografia: directores de arte pueden generar referencias visuales de iluminacion con flash directo antes de un rodaje, usando el prompt template y ajustando el peso del LoRA a 0.8 para un flash mas suave.
- Ilustracion de narrativa o articulos sobre vida nocturna: el modelo genera escenas de clubs, taxis y gasolineras nocturnas coherentes con un estilo documental, utiles para piezas editoriales.
- Variaciones de producto en contexto nocturno: colocacion de articulos (ropa, accesorios) en escenas de fiesta o interior de coche con flash, aprovechando la coherencia estetica del adaptador.
- Generacion de avatares y retratos con estetica amateur: selfies en espejo y retratos con flash duro para perfiles que buscan un look no profesional.
- Pruebas de concepto en pipelines de ComfyUI: al ser un fichero de 0.2 GB, se puede encadenar con otros LoRA y nodos de postproceso (grano, ruido de camara, color) para construir un stack de realismo completo, como el que ofrece SeedraAI en su flujo comercial.
- Experimentacion con control de estilo en investigacion de difusion: permite estudiar como un LoRA de bajo rango modifica la distribucion de iluminacion y exposicion del modelo base sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica para el LoRA; el consumo vendra determinado por el modelo base Krea 2 Turbo, cuyos requisitos no se detallan en la informacion proporcionada.
- El adaptador en si ocupa aproximadamente 0.2 GB en disco, por lo que su carga anade una huella de memoria minima sobre el modelo base.
- GPU recomendadas: no disponible. Al operar en regimen de 8 pasos y unos 2 MP de resolucion, es plausible que quepa en GPU de consumo, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: ComfyUI (flujo documentado por el autor con LoraLoaderModelOnly). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea-2-LoRA-NightFlash | LoRA sobre Krea 2 Turbo | no disponible | no aplica | krea-2-community-license | Hugging Face, CivitAI |
| Krea 2 Turbo (base) | Difusion text-to-image | no disponible | no aplica | krea-2-community-license | Hugging Face |
| Alternativas de LoRA de estetica flash | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de informacion sobre otros LoRA comparables de la misma estetica ni de sus metricas, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El disparador `n1ghtfl4sh` puede aparecer impreso como texto en superficies planas (letreros, logos de chaquetas, latas o bolsas de aperitivos); el autor recomienda anadir "plain, no logos, no text" o evitar escenas con rotulos.
- Solo se documentan prompts en ingles; el comportamiento con otros idiomas no esta verificado.
- No hay informacion sobre sesgos demograficos del modelo base ni del LoRA; al ser un adaptador de estilo fotografico, hereda los sesgos de Krea 2 Turbo.
- Riesgo de alucinacion visual: pueden aparecer elementos incoherentes en escenas complejas, especialmente con grupos numerosos o reflejos.
- La licencia krea-2-community-license puede imponer restricciones al uso comercial; debe revisarse el enlace de licencia del modelo base antes de desplegar en produccion.
- El LoRA depende completamente de Krea 2 Turbo; no funciona de forma autonoma y su calidad esta acotada por el modelo base.
- Los flujos completos de postproceso (realismo, ruido, grano, color) que acompanan a las previews no se incluyen en el repositorio: forman parte de la membresia de SeedraAI.
- No hay datos publicos de benchmarks, evaluaciones humanas ni metricas de fidelidad al estilo.

## Enlaces

- Hugging Face: https://huggingface.co/cfgscale/Krea-2-LoRA-NightFlash
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Licencia: https://huggingface.co/krea/Krea-2-Turbo
- CivitAI: https://civitai.com/models/3045072
- SeedraAI (flujos y guias): https://seedraai.com/
- Discord de la comunidad: https://discord.gg/seedraai
