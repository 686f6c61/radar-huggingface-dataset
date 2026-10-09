# addlabsviral/Qwen-Image-2.1-Turbo-4bit

## Resumen

Qwen-Image-2.1-Turbo-4bit es una cuantizacion en 4 bits (NF4 de bitsandbytes) del modelo de difusion texto-a-imagen Qwen/Qwen-Image-2.1-Turbo, publicada por el usuario addlabsviral. El objetivo del autor es reducir de forma drastica el consumo de VRAM manteniendo una calidad "equivalente al modelo base" en un regimen de generacion de solo 8 pasos y con CFG=1, lo que lo hace apto para GPU de consumo. El repo declara 3.668.764.972 parametros en los ficheros safetensors y un tamano total de 53,9 GB.

El checkpoint conserva el mismo pipeline (`QwenImage21Pipeline`) y el mismo calendario de sigmas de 8 pasos que el modelo base, de modo que es un reemplazo directo: se cambia el identificador del repositorio y se mantienen los hiperparametros. La cuantizacion se aplica al transformer y al codificador de texto, mientras que el VAE permanece en float32 durante la inferencia para evitar degradacion en la decodificacion latente.

Su relevancia actual es practica: permite ejecutar un generador de imagenes de la familia Qwen-Image en equipos con VRAM limitada mediante `accelerate` + `bitsandbytes`, sin necesidad de reentrenar ni de reescribir el codigo de inferencia. Como contrapartida, es un artefacto de cuantizacion sin model card extensa, sin datos de benchmarks y con la licencia heredada del modelo base (Qwen Research License), lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (pipeline `QwenImage21Pipeline`); transformer y codificador de texto cuantizados, VAE mantenido en float32 en inferencia |
| Parametros totales | 3.668.764.972 (segun los metadatos safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 de 4 bits con bitsandbytes (`double_quant=False`); VAE en float32; la lista de tags incluye tambien la etiqueta "8-bit" |
| Idiomas soportados | no disponible |
| Licencia | no indicada en los metadatos del repositorio; la model card afirma que se hereda del modelo base (Qwen Research License) |
| Formato de pesos | safetensors (carga via diffusers) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una conversion de precision sobre Qwen/Qwen-Image-2.1-Turbo. El artefacto mantiene la arquitectura del original (transformer de difusion con codificador de texto, decodificado por un VAE) y aplica cuantizacion de 4 bits NF4 al transformer y al text encoder, dejando el VAE en float32. Segun el autor, no hay reentrenamiento ni destilacion: se conservan el mismo pipeline, los mismos `sample_sigmas` guardados para 8 pasos y `CFG=1`.

La innovacion tecnica declarada es la reduccion de huella de memoria por cuantizacion (con `double_quant=False`), pensada para ejecucion en GPU de consumo. El autor advierte de una "pequena deriva de calidad" respecto a la version BF16 a cambio de un ahorro "grande" de VRAM. Para la inferencia se recomienda mantener `use_kv_cache=True` y el calendario por defecto de 8 pasos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre etapas de RLHF o DPO del modelo base.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante difusion, con resoluciones de trabajo de al menos 1024x1024 en los ejemplos publicados.
- Sintesis en solo 8 pasos de denoising con `CFG=1`, lo que reduce el coste computacional por imagen frente a pipelines de 20-50 pasos.
- Compatibilidad con cache de clave-valor en el transformer (`use_kv_cache=True`), orientada a acelerar la generacion.
- Ejecucion sobre GPU de consumo gracias a la cuantizacion de los pesos en 4 bits.
- Generacion reproducible mediante semilla fija (`torch.Generator` y `manual_seed`).
- Control de dimensiones de salida mediante los parametros `width` y `height` del pipeline.
- No se ha documentado soporte de tool calling, agentes, vision de entrada, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion de imagenes en GPU de consumo: el objetivo declarado del autor es ejecutar un generador de la familia Qwen-Image en equipos con VRAM limitada, aprovechando la cuantizacion NF4 y el calendario de 8 pasos.
- Prototipado rapido de pipelines text-to-image: al conservar el mismo `QwenImage21Pipeline` y los mismos sigmas, se puede sustituir el modelo base por este checkpoint para validar integraciones sin cambiar el codigo de inferencia.
- Produccion de material grafico para marketing: generacion de retratos, posters o ilustraciones a partir de descripciones textuales en formato 1024x1024, con semilla fija para reproducir variantes de un mismo concepto.
- Ilustracion conceptual y storyboards: generacion iterativa de escenas (por ejemplo, "retrato cinematografico de un astronauta en Marte con luz de hora dorada") para previsualizacion de ideas antes de encargar arte final.
- Generacion por lotes en un unico acelerador: el bajo coste por imagen (8 pasos, CFG=1) permite procesar conjuntos de prompts en una sola GPU sin repartir el modelo entre varios dispositivos.
- Entornos de investigacion sin clúster: uso en laboratorios o proyectos personales donde no hay acceso a GPU de datacenter, aprovechando la compatibilidad con `accelerate` + `bitsandbytes`.
- Experimentacion con tecnicas de cuantizacion: sirve como punto de partida para comparar NF4 frente a BF16, ajustar `double_quant` o probar otras combinaciones de precision en el transformer y el text encoder.
- Demos interactivas y cuadernos: integrable en notebooks o interfaces simples mediante diffusers, con generacion controlada por semilla y resolucion.
- Ajuste fino ligero sobre la base cuantizada: el formato safetensors y la compatibilidad con diffusers permiten plantear adaptaciones tipo LoRA, si bien el autor no documenta recetas de entrenamiento para este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta capturas de ejemplo generadas en un trabajo de Hugging Face sobre una GPU rtx-pro-6000 con pesos NF4 y 8 pasos, sin metricas cuantitativas (FID, CLIP score, etc.) ni comparaciones numericas frente al modelo base.

## Requisitos de hardware

- El repositorio ocupa 53,9 GB en disco, cifra que incluye todos los ficheros del repositorio y no solo los pesos cuantizados.
- Para el recuento declarado de 3.668.764.972 parametros, la huella teorica de los pesos en 4 bits es de aproximadamente 1,8-2 GB; hay que sumar el VAE en float32, las activaciones y las copias no cuantizadas, por lo que la cifra real de VRAM del pipeline completo es mayor y no esta publicada de forma oficial.
- El autor genero las muestras sobre una GPU RTX PRO 6000 con pesos NF4, lo que indica que el checkpoint funciona en hardware profesional reciente.
- La finalidad declarada es "BEST for consumer gpu", es decir, el autor afirma que es apto para GPU de consumo, aunque no especifica modelos ni capacidad de VRAM concretos.
- GPU recomendadas: no disponible de forma explicita. Por categoria de memoria, encajan aceleradores con 16 GB o mas (por ejemplo, RTX 4080/4090, RTX 5090 o equivalentes profesionales); en GPUs con menos memoria habria que validar el consumo real del pipeline completo.
- Opciones de despliegue: diffusers (rama principal del repositorio de GitHub), `accelerate` y `bitsandbytes`, con `transformers>=5.17.0`. Requiere ademas `pillow` y `sentencepiece`. No es compatible con motores de inferencia de modelos de lenguaje como llama.cpp, Ollama o TGI, al tratarse de un modelo de difusion.
- Latencia y throughput: no disponibles. Solo se conoce el regimen de inferencia (8 pasos, CFG=1, `use_kv_cache=True`) y la GPU empleada en los ejemplos (RTX PRO 6000).

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de inferencia | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| addlabsviral/Qwen-Image-2.1-Turbo-4bit | 3.668.764.972 (safetensors del repo) | 8 (CFG=1) | NF4 4 bits (bitsandbytes), VAE en float32 | heredada del modelo base (Qwen Research License) | Hugging Face, diffusers |
| Qwen/Qwen-Image-2.1-Turbo (modelo base) | no disponible | 8 (CFG=1), mismo `sample_sigmas` | BF16 (sin cuantizar) | Qwen Research License (segun la model card) | Hugging Face |
| Otras alternativas de la misma categoria (por ejemplo, otras cuantizaciones 4-bit de difusion) | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion sustentada por la informacion disponible es contra el propio modelo base: misma arquitectura, mismo pipeline y mismo calendario de 8 pasos, con la diferencia de que este checkpoint aplica NF4 al transformer y al text encoder y mantiene el VAE en float32, a cambio de una "pequena deriva de calidad" segun el autor. No se dispone de datos para comparar con otros generadores texto-a-imagen de la misma franja de parametros.

## Limitaciones y advertencias

- La cuantizacion NF4 introduce una deriva de calidad respecto a la version BF16, reconocida explicitamente por el autor ("expect small quality drift vs BF16").
- La licencia no esta declarada en los metadatos del repositorio. La model card afirma que sigue la licencia del modelo base (Qwen Research License), lo que en la practica restringe el uso comercial y obliga a verificar las condiciones del modelo original antes de cualquier despliegue en produccion.
- No se documentan sesgos del modelo ni del dataset de entrenamiento del modelo base.
- No hay informacion sobre la tasa de alucinacion visual, la fidelidad al prompt ni la calidad tipografica en imagenes con texto.
- No se indican idiomas soportados para los prompts; la model card y los metadatos marcan este campo como no disponible.
- No se publican benchmarks cuantitativos, por lo que no se puede validar de forma objetiva la afirmacion de "misma calidad que el modelo base".
- Existe una inconsistencia documental: el repositorio se llama "4bit", el ejemplo de codigo apunta a un identificador distinto (`addlabsviral/Qwen-Image-2.1-Turbo-bnb-fp4`) y la lista de tags incluye tambien "8-bit". Conviene verificar el identificador correcto antes de integrarlo.
- El autor recomienda mantener `use_kv_cache=True`, el calendario por defecto de 8 pasos y `CFG=1`; desviarse de esta configuracion puede degradar el resultado o disparar el consumo de memoria.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y fue publicado sin historial de mantenimiento; es un artefacto reciente y sin validacion comunitaria.
- Depende de la rama principal de `diffusers` y de `transformers>=5.17.0`, lo que puede implicar incompatibilidades con versiones estables publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/addlabsviral/Qwen-Image-2.1-Turbo-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Repositorio de diffusers citado en las instrucciones de instalacion: https://github.com/huggingface/diffusers
- Identificador alternativo mencionado en el ejemplo de codigo de la model card (no verificado): https://huggingface.co/addlabsviral/Qwen-Image-2.1-Turbo-bnb-fp4
