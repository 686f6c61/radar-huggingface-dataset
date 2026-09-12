# OzzyGT/krea2_preview_blocks

## Resumen

`OzzyGT/krea2_preview_blocks` es un conjunto de bloques personalizados para el sistema Modular Diffusers, disenado para generar previsualizaciones durante el proceso de denoising del modelo de generacion de imagenes Krea 2 Turbo (y Krea 2 sin destilar). No se trata de un modelo de pesos propio, sino de una extension de pipeline que anade un paso de previsualizacion dentro del bucle de denoising, manteniendo intacto el comportamiento del pipeline original cuando no se usa la previsualizacion.

La aportacion tecnica clave es que la previsualizacion se construye a partir de la prediccion x0 (lo que el modelo cree que sera la imagen final en el paso actual) en lugar de a partir de los latentes del bucle. La prediccion x0 produce una imagen completa y reconocible desde el primer paso, que se va afinando progresivamente, mientras que una previsualizacion basada en latentes permanece llena de ruido durante la primera mitad de la generacion. El autor ofrece cuatro modos de previsualizacion con costes computacionales muy distintos: `rgb` (proyeccion lineal, menos de 1 ms a 1024x1024), `taew` y `taew_fast` (autoencoder TAEW 2.1, aproximadamente 21 ms y 6 ms respectivamente) y `latents` (sin decodificacion).

El proyecto esta publicado bajo licencia Apache 2.0, con 0 descargas y 0 likes en el momento de la consulta, y depende del modelo base `krea/Krea-2-Turbo`. Su relevancia practica es doble: mejora la experiencia de usuario en aplicaciones interactivas de generacion de imagenes y habilita mecanismos de cancelacion temprana del bucle de denoising, lo que permite ahorrar tiempo de GPU cuando una generacion no cumple las expectativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloques modulares de pipeline de difusion sobre un modelo base de difusion latente text-to-image (Krea 2 Turbo); se sabe que la latente usa los factores de conversion a RGB de Wan 2.1 (16 canales latentes proyectados a 3 canales RGB) |
| Parametros totales | no disponible (el repositorio contiene bloques de pipeline, no pesos de un modelo completo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El text encoder se carga cuantizado y requiere la libreria `sdnq` para su carga; el resto de componentes se cargan en bfloat16. No se detallan mas esquemas de cuantizacion |
| Idiomas soportados | no disponible (los ejemplos de la model card usan prompts en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | Pesos del pipeline modular cargados via `ModularPipeline.from_pretrained` con `trust_remote_code=True`; decodificador TAEW 2.1 adicional de aproximadamente 22 MB que se descarga en la primera ejecucion. Formato de fichero exacto no especificado en la informacion disponible |

## Arquitectura y entrenamiento

El repositorio no describe entrenamiento alguno: se trata de codigo de orquestacion sobre el modelo base Krea 2. Los bloques son, en palabras del autor, "los bloques estandar de Krea 2 con un paso de previsualizacion anadido al bucle de denoising", de modo que sin `preview_callback` el pipeline genera exactamente lo mismo que el pipeline oficial. La innovacion se situa, por tanto, en el bucle de inferencia y no en los pesos.

El mecanismo de previsualizacion admite cuatro estrategias. `rgb` aplica una proyeccion lineal de 16x3 canales, derivada de los factores de conversion latente-a-RGB de Wan 2.1 presentes en el fichero `latent_formats.py` de ComfyUI, y tiene un coste inferior a 1 ms a 1024x1024, por lo que el autor la recomienda como opcion por defecto. `taew` y `taew_fast` emplean TAEW 2.1, un autoencoder miniatura del proyecto `madebyollin/taehv` (licencia MIT), que produce detalle real a cambio de aproximadamente 21 ms y 6 ms por previsualizacion respectivamente; el decodificador pesa unos 22 MB y se descarga la primera vez. `latents` no decodifica nada y entrega la prediccion cruda a consumidores que decodifiquen por su cuenta.

El control del proceso se realiza mediante dos parametros: `preview_every=N` ejecuta la previsualizacion cada N pasos (el ultimo paso siempre se previsualiza) y `preview_callback(step, total, image)` se invoca dentro del bucle, por lo que el tiempo que consuma el callback es tiempo que el modelo deja de emplear en denoisar. Ademas, lanzar una excepcion desde el callback aborta la generacion: la excepcion se propaga fuera de la llamada al pipeline y el pipeline queda reutilizable, lo que sirve como boton de cancelacion. El bucle registra un traceback antes de relanzar la excepcion, de modo que una cancelacion limpia imprime igualmente uno.

## Capacidades

- Previsualizacion en tiempo real del resultado esperado durante el proceso de denoising de Krea 2, con imagen completa desde el primer paso cuando se usa la prediccion x0.
- Cuatro modos de previsualizacion con distinto equilibrio entre coste y fidelidad: `rgb` (menos de 1 ms a 1024x1024), `taew_fast` (aproximadamente 6 ms), `taew` (aproximadamente 21 ms) y `latents` (sin decodificacion).
- Control de frecuencia de previsualizacion mediante `preview_every=N`, con previsualizacion forzada del ultimo paso.
- Callback programable `preview_callback(step, total, image)` para integrar logica propia: guardado de imagenes intermedias, envio a una interfaz de usuario o metricas.
- Cancelacion del proceso de generacion lanzando una excepcion desde el callback, con reutilizacion posterior del pipeline.
- Compatibilidad limitada a la familia Krea 2, tanto la variante Turbo como la version sin destilar.
- Generacion de texto a imagen a 1024x1024 con 8 pasos de inferencia en el ejemplo documentado con Krea 2 Turbo.
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso; el repositorio es una utilidad de inferencia de difusion.

## Casos de uso

- Interfaces interactivas de generacion de imagenes: el modo `rgb` permite mostrar al usuario una aproximacion de la imagen final practicamente gratis (menos de 1 ms por paso), evitando la sensacion de espera en blanco que produce una previsualizacion de latentes ruidosos.
- Cancelacion temprana para ahorrar GPU: al lanzar una excepcion desde `preview_callback` se aborta el bucle y se libera el pipeline; en granjas de inferencia con muchas peticiones, descartar generaciones mal encaminadas en los primeros pasos reduce el consumo de GPU.
- Depuracion de prompts y de semillas: guardar una secuencia de PNG con `image.save(f"preview_{step:02d}.png")` permite ver como evoluciona la composicion paso a paso y detectar si el problema esta en el prompt, en el numero de pasos o en la semilla.
- Aplicaciones de escritorio o web de baja latencia: el modo `taew_fast` (aproximadamente 6 ms) ofrece detalle real con un coste asumible para refrescos frecuentes en una interfaz local.
- Investigacion y docencia sobre difusion: la comparativa entre previsualizacion basada en latentes y basada en x0 ilustra de forma visual la diferencia entre el estado interno del bucle y la prediccion objetivo del modelo.
- Monitorizacion de pipelines por lotes: en trabajos de generacion masiva (por ejemplo, cientos de imagenes nocturnas), el callback puede registrar miniaturas o metricas por paso para auditar ejecuciones sin almacenar todos los tensores.
- Integracion en notebooks de experimentacion: sustituyendo `preview_mode="latents"` por un decodificador propio, el pipeline entrega la prediccion cruda y deja el post-procesado al usuario.
- Control de calidad con criterios externos: un clasificador o una heuristica dentro del callback puede evaluar la previsualizacion y decidir si continuar o cancelar, implementando un early stopping condicionado por contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos cuantitativos aportados por el autor son los costes de previsualizacion a 1024x1024:

| Modo de previsualizacion | Mecanismo | Coste por previsualizacion (1024x1024) |
|---|---|---|
| `rgb` | Proyeccion lineal 16x3 de los canales latentes, sin pesos | Menos de 1 ms |
| `taew_fast` | Decodificador TAEW 2.1 a un cuarto de resolucion | Aproximadamente 6 ms |
| `taew` | Autoencoder miniatura TAEW 2.1 completo | Aproximadamente 21 ms |
| `latents` | Sin decodificacion | No aplica (coste nulo de decodificacion) |

El ejemplo documentado usa 8 pasos de inferencia con Krea 2 Turbo, mismo run y misma semilla para las dos previsualizaciones comparadas en la model card. No se proporcionan cifras de FID, CLIP score, throughput ni latencia total de generacion.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Depende enteramente del modelo base Krea 2 Turbo; el repositorio no publica requisitos de memoria y no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponibles. La model card solo indica `pipe.to("cuda")` y carga en bfloat16, lo que implica una GPU con soporte de bfloat16 (generaciones Ampere o posteriores en el caso de NVIDIA).
- Compatibilidad con GPU de consumo: no se puede confirmar con los datos disponibles; la viabilidad dependera del peso del modelo base y no de estos bloques, cuyo coste adicional es de milisegundos por paso previsualizado.
- Opciones de despliegue: requiere la libreria `diffusers` con soporte de `ModularPipeline`, carga con `trust_remote_code=True` y, para el text encoder cuantizado, la libreria `sdnq`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un pipeline de difusion con codigo remoto.
- Latencia y throughput: no disponibles para la generacion completa. El sobrecoste medido de la previsualizacion es inferior a 1 ms por paso en modo `rgb`, de aproximadamente 6 ms en `taew_fast` y de aproximadamente 21 ms en `taew`, y solo se paga en los pasos efectivamente previsualizados (controlables con `preview_every`).
- Almacenamiento adicional: aproximadamente 22 MB para los pesos del decodificador TAEW 2.1 en los modos `taew` y `taew_fast`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de generacion (calidad, FID, adherencia al prompt) para ninguno de los elementos comparados. La comparacion se limita a caracteristicas funcionales.

| Alternativa | Que aporta | Coste por paso | Requisitos |
|---|---|---|---|
| `OzzyGT/krea2_preview_blocks` (este repositorio) | Previsualizacion basada en prediccion x0, imagen completa desde el primer paso, cuatro modos, cancelacion via excepcion | De menos de 1 ms (`rgb`) a aproximadamente 21 ms (`taew`) por paso previsualizado | diffusers con ModularPipeline, `trust_remote_code`, `sdnq`, modelo base Krea 2 |
| Pipeline oficial de Krea 2 en diffusers | Sin previsualizacion o con previsualizacion basada en latentes si el usuario la implementa | Nulo si no se previsualiza | diffusers y modelo base Krea 2 |
| Previsualizacion de latentes en ComfyUI | Previsualizacion integrada en la interfaz del nodo, basada en el estado del bucle | Bajo, pero la imagen permanece ruidosa durante la primera mitad del run | ComfyUI y sus formatos latentes |
| Previsualizaciones de latentes en interfaces tipo Stable Diffusion WebUI | Miniaturas durante la generacion | Bajo | Ecosistema WebUI |

No se conocen alternativas equivalentes que ofrezcan previsualizacion a partir de la prediccion x0 dentro del ecosistema Modular Diffusers segun la informacion disponible.

## Limitaciones y advertencias

- Solo funciona con Krea 2, en sus variantes Turbo y sin destilar; es explicitamente incompatible con otros modelos de difusion.
- Es codigo remoto: requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del autor del repositorio. Conviene auditar el codigo antes de usarlo en produccion.
- El callback se ejecuta dentro del bucle de denoising, por lo que cualquier trabajo costoso que se realice en el (guardado en disco, envio por red, decodificacion pesada) se resta directamente del tiempo de generacion.
- La cancelacion mediante excepcion imprime un traceback aunque la cancelacion sea limpia, lo que puede generar ruido en los registros de una aplicacion en produccion.
- En los modos `taew` y `taew_fast`, la primera ejecucion descarga pesos adicionales (aproximadamente 22 MB), lo que introduce una dependencia de red no deseada en entornos aislados.
- Los modos con decodificador (`taew`, `taew_fast`) anaden coste real por cada paso previsualizado; usarlos con `preview_every=1` en un modelo de pocos pasos puede degradar el rendimiento total de forma perceptible.
- No se han publicado datos de sesgos, alucinacion visual, limitaciones de idioma ni evaluaciones de seguridad; el modelo base Krea 2 conserva los sesgos y limitaciones propios de los modelos de difusion text-to-image.
- El text encoder cuantizado requiere la libreria `sdnq`; omitirla impide cargar el pipeline.
- El repositorio registra 0 descargas y 0 likes y se publico en septiembre de 2026, por lo que no existe historial de uso ni validacion por parte de la comunidad.
- La licencia del repositorio es Apache 2.0, pero el uso comercial del modelo base Krea 2 Turbo depende de los terminos de dicho modelo, que no se detallan en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OzzyGT/krea2_preview_blocks
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Documentacion de Modular Diffusers: https://huggingface.co/docs/diffusers/main/en/modular_diffusers/overview
- Documentacion de ModularPipeline: https://huggingface.co/docs/diffusers/main/en/modular_diffusers/modular_pipeline
- TAEW 2.1 (madebyollin/taehv), licencia MIT: https://github.com/madebyollin/taehv
- Factores latente-a-RGB de Wan 2.1 en ComfyUI: https://github.com/comfyanonymous/ComfyUI/blob/master/comfy/latent_formats.py
- Ejemplos e imagenes de previsualizacion: https://huggingface.co/datasets/OzzyGT/diffusers-examples
