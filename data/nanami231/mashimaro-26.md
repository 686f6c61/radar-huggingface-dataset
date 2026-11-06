# Nanami231/mashimaro-26

## Resumen

`Nanami231/mashimaro-26` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario Nanami231 y publicado en Hugging Face. No se trata de un modelo fundacional autonomo, sino de un conjunto de pesos de ajuste fino (aproximadamente 1,6 GB en el repositorio) que se carga sobre los checkpoints oficiales de Krea 2 para inducir un concepto o estilo concreto, activado mediante la palabra disparadora `TOK`.

La relevancia de esta ficha es doble. Por un lado, documenta el flujo de trabajo recomendado por Krea 2: entrenar el LoRA sobre el checkpoint RAW (base no destilada) y ejecutarlo en inferencia sobre el checkpoint Turbo (destilado a 8 pasos), lo que permite obtener imagenes rapidas y de alta calidad con un coste computacional bajo. Por otro, sirve como ejemplo practico de personalizacion de modelos de difusion mediante DreamBooth dentro del ecosistema `diffusers`.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, aunque la model card original esta generada automaticamente y contiene secciones sin completar (marcadas como TODO), por lo que la informacion sobre datos de entrenamiento, sesgos y limitaciones es practicamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Krea 2 (text-to-image) |
| Parametros totales | no disponible (pesos LoRA; tamano del repositorio 1,6 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el pipeline base admite bfloat16) |
| Idiomas soportados | no disponible (el prompt se procesa mediante el codificador de texto de Krea 2) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA) |
| Modelo base | krea/Krea-2-Raw (entrenamiento) y krea/Krea-2-Turbo (inferencia) |
| Palabra disparadora | `TOK` |
| Libreria | diffusers (`Krea2Pipeline`) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DreamBooth sobre el checkpoint `krea/Krea-2-Raw`, utilizando el entrenador oficial de Krea 2 incluido en `diffusers` (script `examples/dreambooth/README_krea2.md`). DreamBooth es una tecnica de personalizacion que ajusta un modelo de difusion preentrenado para asociar un identificador unico (`TOK`) a un sujeto o estilo concreto a partir de un conjunto reducido de imagenes de referencia. El resultado es un conjunto de pesos LoRA de bajo rango que modifica las proyecciones de atencion del modelo base sin reentrenar todos sus parametros.

Krea 2 se distribuye en dos variantes complementarias: RAW, el modelo base no destilado sobre el que se realiza el ajuste fino, y Turbo, un checkpoint destilado disenado para inferencia en 8 pasos y sin classifier-free guidance (`guidance_scale=0.0`). Segun la documentacion del autor, los LoRA entrenados sobre RAW se expresan con fuerza al cargarse sobre Turbo, lo que permite combinar la fidelidad del ajuste con la velocidad de la inferencia destilada. No se especifican en la informacion disponible el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje ni la composicion del dataset utilizado para este adaptador concreto.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada al concepto aprendido mediante la palabra disparadora `TOK`.
- Personalizacion de sujeto o estilo sobre el modelo base Krea 2 mediante tecnicas DreamBooth.
- Inferencia rapida en 8 pasos sobre Krea 2 Turbo, sin classifier-free guidance.
- Compatibilidad con el ecosistema `diffusers`: carga, ponderacion, fusion y combinacion de multiples LoRA mediante `load_lora_weights`.
- Ejecucion en precision bfloat16 sobre GPU CUDA.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, al tratarse de un modelo generativo de imagen.

## Casos de uso

- **Generacion de retratos o personajes consistentes**: cargando el LoRA sobre Krea 2 Turbo y usando el prompt `TOK` junto con descripciones adicionales, se puede reproducir un sujeto concreto en distintas poses, escenarios e iluminaciones, util para ilustracion editorial o narrativa visual.
- **Creacion de assets para videojuegos o prototipado**: generacion rapida de variaciones de un personaje o elemento visual con identidad coherente, gracias a los 8 pasos de inferencia de Turbo, que reducen el tiempo por imagen en comparacion con muestreo completo.
- **Pruebas de concepto en diseno de producto**: iteracion rapida sobre un estilo visual propietario entrenado como LoRA, permitiendo explorar decenas de variantes antes de fijar una direccion creativa.
- **Generacion de contenido para marketing**: produccion de imagenes de marca con un estilo consistente (por ejemplo, un personaje mascota) integradas en pipelines automatizados mediante la API de `diffusers`.
- **Investigacion en personalizacion de modelos de difusion**: uso del adaptador como caso de estudio para comparar la expresividad de LoRA entrenados en RAW y evaluados en Turbo, dentro de experimentos academicos sobre DreamBooth.
- **Composicion con otros LoRA**: al ser un adaptador de bajo rango, puede combinarse o ponderarse junto con otros LoRA cargados en el mismo pipeline para mezclar estilos o conceptos, utilizando las utilidades de fusion de `diffusers`.
- **Generacion local en estaciones de trabajo**: al ejecutarse sobre un pipeline de difusion en bfloat16, puede desplegarse en GPUs de consumo para flujos de trabajo offline sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El pipeline Krea 2 en bfloat16 requiere cargar el modelo base completo, por lo que se recomienda una GPU con al menos 16-24 GB de VRAM para el pipeline completo; el adaptador LoRA en si anade una sobrecarga minima (repositorio de 1,6 GB).
- GPU recomendadas: no especificadas por el autor. Por el tipo de pipeline (difusion texto-a-imagen en bfloat16), son adecuadas GPUs como RTX 4090, A100 o H100; no se confirma compatibilidad con GPUs de gama media.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; depende del modelo base Krea 2, no del LoRA.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` (flujo documentado por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles. La receta Turbo de 8 pasos sin CFG reduce el coste frente a muestreo completo, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanami231/mashimaro-26 | LoRA DreamBooth sobre Krea 2 | no disponible (1,6 GB) | no aplica | Apache 2.0 | Hugging Face |
| krea/Krea-2-Raw | Modelo base de difusion texto-a-imagen | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| krea/Krea-2-Turbo | Modelo destilado (8 pasos) de difusion texto-a-imagen | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| LoRA DreamBooth genericos sobre SDXL | Adaptadores de personalizacion | variable | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar (descripcion de datos de entrenamiento, sesgos y limitaciones marcadas como TODO), por lo que no hay documentacion sobre el dataset utilizado.
- Riesgo de sobreajuste al concepto aprendido: los LoRA DreamBooth pueden degradar la diversidad de las imagenes generadas o filtrar caracteristicas del conjunto de entrenamiento.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir artefactos, anatomia incorrecta o inconsistencias entre prompt y resultado.
- El adaptador solo se activa correctamente con la palabra disparadora `TOK`; su uso sin ella puede no producir el efecto deseado.
- No se documentan sesgos demograficos, culturales o de estilo; deben asumirse los sesgos heredados del modelo base Krea 2 y de sus datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial del adaptador, pero el uso del modelo base Krea 2 esta sujeto a su propia licencia, no detallada en la informacion disponible.
- El modelo tiene un numero muy bajo de descargas (5) y ningun "like", lo que sugiere poca validacion por parte de la comunidad.
- No se especifican requisitos de hardware ni latencias, lo que dificulta la planificacion de despliegues en produccion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Nanami231/mashimaro-26)
- [Modelo base Krea 2 Raw](https://huggingface.co/krea/Krea-2-Raw)
- [Modelo base Krea 2 Turbo](https://huggingface.co/krea/Krea-2-Turbo)
- [Paper de DreamBooth](https://dreambooth.github.io/)
- [Script de entrenamiento DreamBooth para Krea 2 en diffusers](https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md)
- [Documentacion de carga de LoRA en diffusers](https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters)
