# Pedro21613/PS-IMAGE-1.4

## Resumen

PS-IMAGE-1.4 es un adaptador LoRA de bajo rango (rank 16, alpha 32) pensado para el pipeline de generacion text-to-image de `stabilityai/stable-diffusion-xl-base-1.0`. Lo publica el usuario Pedro21613 en HuggingFace y se presenta como la evolucion de una version anterior (v1.3) que, segun la model card, estaba construida sobre SD 1.5. El objetivo declarado es mejorar el fotorrealismo en tres dominios concretos: personas, automoviles y texturas.

El adaptador no es un modelo autonomo: se carga sobre el UNet de SDXL mediante `peft` y se fusiona con `merge_and_unload()`, tal y como documenta el propio autor. El repositorio ocupa 0,2 GB, lo que es coherente con un LoRA de rango 16 y no con un checkpoint completo. Se distribuye en formato safetensors y su unica libreria declarada es `diffusers`.

La relevancia de la ficha es limitada pero instructiva: se trata de un ajuste fino especializado, con un dataset pequeno y perfectamente descrito (900 imagenes balanceadas), util como ejemplo de pipeline de personalizacion de SDXL en una GPU de gama de entrada (T4). El modelo acumula 0 descargas y 0 likes, no declara licencia ni idiomas, y no aporta benchmarks cuantitativos, por lo que debe evaluarse como experimento reproducible mas que como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) aplicado al UNet del modelo de difusion latente SDXL; pipeline text-to-image |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el repositorio completo ocupa 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de los LLM; la ventana de texto la fijan los codificadores de SDXL y no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponibles; el ejemplo oficial carga el pipeline base en `torch.float16` con variante `fp16` |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA compatible con `diffusers` + `peft`) |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| Rango / alpha del LoRA | 16 / 32 |
| Resolucion de entrenamiento y validacion | 768 px |
| Pasos de inferencia recomendados por el autor | 28, con CFG 6.5 |
| Fecha de creacion / actualizacion | 2026-09-12 (ambas) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que modifica exclusivamente el UNet del pipeline SDXL, segun el codigo de ejemplo de la model card (`pipe.unet = PeftModel.from_pretrained(pipe.unet, "Pedro21613/PS-IMAGE-1.4")` seguido de `merge_and_unload()`). No se indica que se entrenen los codificadores de texto ni el VAE, por lo que la condicion textual sigue dependiendo integramente del modelo base. La configuracion de bajo rango (rank 16, alpha 32) implica un numero de parametros entrenables muy reducido, coherente con el tamano de 0,2 GB del repositorio.

El entrenamiento se realizo en una GPU T4 con un dataset de 900 imagenes balanceadas: 300 imagenes de CelebA-HQ con caption, 300 de Stanford Cars y 300 del dataset DTD (texturas). Se uso una resolucion de 768 px, 600 pasos, learning rate 5e-5 con scheduler coseno y optimizador AdamW. No se menciona el uso de RLHF, DPO ni tecnicas equivalentes, algo que tampoco aplica a un modelo de difusion. La model card describe una validacion cualitativa con prompt y semilla fijos (seed 24000, 28 pasos, CFG 6.5, 768 px): se mantiene la nitidez de rostro y piel respecto a SDXL base, se refuerzan los reflejos en asfalto mojado en escenas de coche bajo la lluvia y se preserva el grano y el barniz en texturas de madera. El autor afirma que en composiciones mixtas de persona y coche azul la version 1.4 genera la persona de frente y con rostro, mientras que la base la generaba de espaldas y sin rostro.

## Capacidades

- Generacion de imagenes fotorrealistas de personas a 768 px, con enfasis declarado en textura de piel y luz natural.
- Generacion de imagenes de automoviles con pintura brillante, detalle de metal y reflejos.
- Generacion de texturas y materiales en plano macro, con grano y acabado superficial consistente.
- Composicion de escenas mixtas que combinan persona y vehiculo en el mismo encuadre.
- Integracion en el ecosistema diffusers mediante `peft`, fusionando el adaptador con el UNet base.
- No dispone de soporte de tool calling ni de function calling: es un modelo generativo de imagenes, no un modelo de lenguaje.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades multilingues; los prompts de ejemplo estan en ingles.
- No se documentan modos especiales (thinking, vision de entrada, audio) ni edicion de imagen o inpainting.
- No hay datos sobre generacion de texto dentro de la imagen ni sobre control espacial (ControlNet, IP-Adapter).

## Casos de uso

- Retratos sinteticos para mockups y pruebas de diseno: el adaptador esta ajustado sobre 300 imagenes de CelebA-HQ con captions, por lo que es adecuado para generar caras consistentes a 768 px con prompts del tipo "ultra realistic photo of ..., detailed skin texture, natural light" que el autor documenta como funcionantes.
- Creatividades publicitarias de automocion: con 300 imagenes de Stanford Cars en el entrenamiento y validacion especifica de reflejos sobre asfalto mojado, sirve para generar bocetos de campana de vehiculos antes de una sesion de fotografia real.
- Materiales de referencia para pipelines 3D: las 300 imagenes de DTD permiten generar referencias de textura (madera, superficies) que un artista puede usar como punto de partida para mapas PBR o moodboards de materiales.
- Aumento de datos sinteticos para vision por computador: se pueden generar variaciones de vehiculos y rostros para preentrenar o aumentar detectores, siempre que se valide que el dominio sintetico no introduce sesgos nuevos (ver limitaciones).
- Ilustracion de articulos y documentacion tecnica: su resolucion de 768 px y su coste bajo de inferencia lo hacen util para generar imagenes de apoyo en blogs y manuales donde no se requiere calidad de imprenta.
- Catalogos y escaparates de concesionarios: la mejora declarada en composiciones persona + coche permite generar escenas de entrega de vehiculo o de cliente junto al coche sin recurrir a bancos de imagenes con derechos.
- Prototipado rapido de direccion de arte: al ser un LoRA de 0,2 GB, se puede probar y descartar en minutos dentro de un flujo diffusers, comparando sus salidas con las del SDXL base mediante la carpeta `examples/` que incluye el autor.
- Experimentacion academica sobre ajuste fino de SDXL: el autor documenta de forma completa hiperparametros (rank, alpha, pasos, learning rate, optimizador, dataset y balance), lo que lo convierte en una referencia reproducible para estudiar el efecto del ajuste LoRA en dominios pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la informacion disponible. La model card solo aporta una validacion cualitativa con prompt, semilla y parametros fijos (seed 24000, 28 pasos, CFG 6.5, 768 px), resumida en la siguiente tabla tal y como la describe el autor:

| Escenario | Base SDXL 1.0 | PS-IMAGE 1.4 |
|---|---|---|
| Retrato de persona | Rostro y piel detallados | Igual o ligeramente mejor que la base |
| Coche blanco bajo la lluvia | Reflejos en el asfalto | Reflejos mas marcados |
| Textura de madera | Grano y barniz preservados | Grano y barniz preservados |
| Escena mixta persona + coche azul | Persona de espaldas y sin rostro | Persona de frente y con rostro |

Ademas, el repositorio incluye carpetas `examples/` con pares `base_*` frente a `v14_*` y ficheros `compare_*`, que constituyen la unica evidencia comparativa disponible. No hay valores de FID, CLIP score, ImageReward ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion del repositorio. Como referencia de la arquitectura base SDXL en fp16 y a 768 px con diffusers sin optimizaciones de memoria, la horquilla habitual es de aproximadamente 8-12 GB; se trata de una estimacion de la arquitectura base, no de un dato publicado por el autor.
- El unico hardware mencionado explicitamente es una GPU T4 (16 GB de VRAM), usada para el entrenamiento, no para la inferencia.
- GPU recomendadas: no confirmadas por el autor. Por tamano del pipeline base, una RTX 3060 de 12 GB o superior deberia ser suficiente a 768 px en fp16; para lotes mayores o resoluciones superiores serian preferibles RTX 4090, A100 o H100.
- Cabe en GPU de consumo: probablemente si, en modelos con 12 GB o mas de VRAM, dado el tamano del pipeline base y el caracter ligero del adaptador LoRA. No hay confirmacion en la documentacion.
- Opciones de despliegue documentadas: `StableDiffusionXLPipeline` de diffusers cargando el UNet con `PeftModel.from_pretrained` y fusion posterior con `merge_and_unload()`.
- Opciones de despliegue no documentadas: compatibilidad con ComfyUI, AUTOMATIC1111, Forge o TGI no se menciona en la informacion disponible; el formato del adaptador tal y como se usa (`peft`) no garantiza compatibilidad directa con interfaces que esperan LoRA en formato kohya.
- Latencia y throughput: no disponibles. Los parametros de inferencia publicados son 28 pasos con CFG 6.5 a 768 x 768, pero sin medicion de tiempo.
- Nota de memoria: el ejemplo oficial instancia el pipeline con `safety_checker=None`, lo que reduce consumo pero desactiva el filtro de seguridad del pipeline base.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Resolucion | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PS-IMAGE 1.4 | LoRA rango 16 / alpha 32 | stable-diffusion-xl-base-1.0 | 768 px (entrenamiento y validacion) | Codificadores de texto del SDXL base, sin datos de configuracion | no disponible | HuggingFace, 0,2 GB, 0 descargas, 0 likes |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo de difusion completo | no aplica | 1024 px nativo (referencia del ecosistema SDXL) | Doble codificador de texto de SDXL | CreativeML Open RAIL++-M (licencia del modelo base; no confirmada en esta ficha) | HuggingFace, ampliamente desplegado |
| PS-IMAGE 1.3 | LoRA sobre SD 1.5 (segun la model card) | stable-diffusion 1.5 | inferior a 768 px por limitacion de la base | Codificador de texto de SD 1.5 | no disponible | citado por el autor, no enlazado en la informacion disponible |
| Otros LoRA fotorrealistas sobre SDXL | LoRA de rango variable | stable-diffusion-xl-base-1.0 | habitualmente 1024 px | SDXL base | variable segun autor | no disponible (no se han facilitado comparativas) |

No se dispone de modelos comparables con datos verificables en la informacion proporcionada mas alla del propio modelo base y de la version anterior citada por el autor.

## Limitaciones y advertencias

- Sesgos de dominio: el entrenamiento se limita a 300 imagenes de CelebA-HQ, 300 de Stanford Cars y 300 de DTD. Cualquier prompt fuera de retratos, automoviles y texturas queda fuera de la distribucion de entrenamiento y probablemente degrade hacia el comportamiento del SDXL base.
- Sesgos de representacion: CelebA-HQ es un dataset de celebridades con un perfil demografico concreto; los rostros generados pueden reproducir ese sesgo en edad, tono de piel, genero o etnicidad, ademas de arrastrar las caracteristicas faciales de las personas reales del dataset.
- Riesgo de sobreajuste: 600 pasos sobre 900 imagenes con rank 16 y learning rate 5e-5 es una configuracion corta; el autor no publica curvas de perdida ni pruebas de sobreajuste, por lo que no puede descartarse memorizacion parcial de las imagenes de entrenamiento.
- Alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta (manos, dedos, ojos), texto ilegible y geometrias fisicamente imposibles, especialmente en composiciones mixtas.
- Licencia no disponible: no se declara licencia en el repositorio, lo que impide determinar si el uso comercial esta permitido. Ademas, el modelo base SDXL arrastra su propia licencia, que hay que verificar por separado antes de cualquier despliegue en produccion.
- Checkpoint de seguridad desactivado: el ejemplo oficial carga el pipeline con `safety_checker=None`, de modo que la generacion de contenido inapropiado queda a cargo de la aplicacion que integre el modelo.
- Idiomas: no hay declaracion de idiomas soportados. Los prompts de ejemplo estan en ingles y los codificadores de texto de SDXL estan orientados a ese idioma; el comportamiento con prompts en castellano no esta documentado.
- Ausencia de validacion independiente: no hay benchmarks, no hay evaluacion por terceros, no hay descargas ni likes. Las afirmaciones de mejora provienen exclusivamente del autor y de una unica configuracion de validacion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion documentada, lo que reduce la probabilidad de que los fallos hayan sido detectados por la comunidad.
- Fechas de creacion y actualizacion identicas (2026-09-12), con 13 segundos de diferencia, lo que sugiere una subida sin iteracion posterior sobre el repositorio.
- Resolucion limitada: 768 px esta por debajo del nativo de 1024 px de SDXL; forzar resoluciones superiores sin reentrenamiento puede producir artefactos de repeticion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pedro21613/PS-IMAGE-1.4
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Datasets citados en la model card (sin enlace facilitado): CelebA-HQ (300 imagenes con caption), Stanford Cars (300 imagenes), DTD - Describable Textures Dataset (300 imagenes).
- Los resultados de busqueda web proporcionados no contienen ningun enlace relevante al modelo: consisten en paginas de un buscador ruso, una guia de tipografia, un ranking de CPUs para portatiles y un hilo de un foro sobre soundfonts de DOOM. No se ha podido extraer de ellos informacion adicional sobre PS-IMAGE-1.4, ni papers, ni blogs, ni repositorios, ni demos.
