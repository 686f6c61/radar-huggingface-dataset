# Asukaa02/Flux-NSFW-uncensored

## Resumen

Flux-NSFW-uncensored es un ajuste fino (LoRA) del modelo de difusion text-to-image FLUX.1-dev de Black Forest Labs, publicado por el usuario Asukaa02 en HuggingFace. Su proposito declarado es minimizar las restricciones de censura del modelo base para explorar los limites tecnicos de la generacion de imagenes con IA. Se distribuye como adaptador LoRA sobre FLUX.1-dev, no como modelo completo, y el repositorio ocupa aproximadamente 0,7 GB.

El modelo hereda la arquitectura del transformer de difusion FLUX.1-dev (12 mil millones de parametros en el modelo base), pero la informacion disponible no detalla el proceso de entrenamiento del adaptador: no se especifican el dataset, el numero de pasos, la tasa de aprendizaje ni la tecnica de ajuste empleada. La model card se limita a describir el proposito del modelo y a incluir codigo de ejemplo en Python con `diffusers` y `peft`.

Es relevante principalmente por su caracter de experimento comunitario sobre FLUX.1-dev en el terreno del contenido para adultos, un area con escasa documentacion tecnica publica. No obstante, el repositorio no presenta descargas ni likes en el momento de la consulta, y la model card esta mayoritariamente en coreano, lo que limita su trazabilidad y su validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusion FLUX.1-dev (modelo base) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base FLUX.1-dev tiene 12 000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; el prompt de texto depende del encoder T5/CLIP del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (adaptador LoRA, `lora.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se carga sobre FLUX.1-dev, un transformer de difusion con arquitectura de flujo (flow matching) desarrollado por Black Forest Labs. El codigo de ejemplo de la model card muestra la carga mediante `AutoPipelineForText2Image` de `diffusers` con `torch_dtype=torch.float16` y la aplicacion del adaptador con `pipe.load_lora_weights`, lo que confirma que se trata de un fine-tuning ligero y no de un modelo entrenado desde cero.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de imagenes, los pasos de entrenamiento, la resolucion de entrenamiento ni si se aplicaron tecnicas como regularizacion o captions especificos. Tampoco se documenta si el ajuste se realizo con DreamBooth, LoRA clasico o variantes como LoHa. La unica innovacion tecnica implicita es la del propio FLUX.1-dev (generacion de alta fidelidad a 1024x1024 con flow matching), sobre la que el adaptador actua como modulador de estilo y de restricciones de contenido.

## Capacidades

- Generacion de imagenes text-to-image a partir de prompts en ingles, con resolucion de salida de 1024x1024 en el ejemplo proporcionado.
- Ajuste orientado a reducir las restricciones de censura del modelo base, permitiendo explorar contenido para adultos segun la intencion declarada del autor.
- Soporte de prompt negativo (`negative_prompt`) para excluir elementos como texto, marcas de agua, estilos cartoon o baja calidad.
- Control de la generacion mediante `guidance_scale`, `num_inference_steps` y semilla (`generator`), segun el codigo de ejemplo.
- Compatibilidad con el ecosistema `diffusers` y `peft` para carga del adaptador.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modos de razonamiento (no aplica a un modelo de difusion).

## Casos de uso

- Exploracion artistica de desnudo y erotismo: el adaptador permite generar imagenes de figura humana con iluminacion y composicion fotografica realista, util para ilustradores que trabajan con tematica adulta y necesitan referencias visuales.
- Investigacion sobre sesgos y censura en modelos generativos: permite comparar la salida del modelo base frente al ajustado para estudiar como se modifica la distribucion de contenido ante los mismos prompts.
- Prototipado de contenido para plataformas de suscripcion para adultos: el modelo puede generar material promocional o conceptual, siempre que se cumplan los requisitos legales y de verificacion de edad aplicables.
- Pruebas de robustez de filtros de seguridad: equipos de moderacion pueden usar el adaptador para generar casos adversarios y validar sus clasificadores de contenido.
- Generacion de imagenes de referencia para fotografia de moda lenceria: el ejemplo de la model card (vestido transparente en playa al atardecer) ilustra un uso comercial de referencia visual con iluminacion controlada.
- Benchmarking de adaptadores LoRA sobre FLUX.1-dev: sirve como caso de estudio tecnico para medir cuanto se desvia la salida de un LoRA respecto al modelo base en terminos de fidelidad y coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,7 GB, pero requiere cargar el modelo base FLUX.1-dev completo para la inferencia.
- VRAM estimada para FLUX.1-dev en `float16`: en torno a 24 GB para inferencia a 1024x1024 sin optimizaciones; con cuantizacion o `enable_model_cpu_offload` puede reducirse a rangos de 12-16 GB, aunque estos valores no estan confirmados en la informacion proporcionada.
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) para ejecucion comoda en `float16`; RTX 3090 (24 GB) tambien es viable.
- En GPU de consumo con menos de 16 GB seria necesario recurrir a cuantizacion (por ejemplo, versiones GGUF de FLUX.1-dev) u offloading, no documentado por el autor.
- Opciones de despliegue: `diffusers` con `peft` (segun el ejemplo del autor). No se documenta soporte para ComfyUI, Automatic1111, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto/prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flux-NSFW-uncensored (este) | LoRA sobre FLUX.1-dev (12 000 M base) | Adaptador LoRA text-to-image | Prompt en ingles | creativeml-openrail-m | HuggingFace, 0 descargas |
| FLUX.1-dev (base) | 12 000 M | Transformer de difusion | Prompt en ingles | FLUX.1-dev non-commercial | HuggingFace, ampliamente usado |
| FLUX.1-schnell | 12 000 M | Transformer de difusion destilado | Prompt en ingles | Apache 2.0 | HuggingFace |
| Stable Diffusion XL | 3500 M (UNet) + encoders | UNet de difusion | Prompt en ingles | CreativeML OpenRAIL++-M | HuggingFace, muy extendido |

No se dispone de datos de rendimiento comparativo del adaptador frente a alternativas, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta disenado para generar material NSFW, lo que conlleva obligaciones legales de verificacion de edad y cumplimiento normativo en la jurisdiccion de uso.
- Riesgo de deepfakes y suplantacion de identidad: la capacidad de generar figuras humanas realistas sin restricciones de censura aumenta el riesgo de uso malicioso; el autor no documenta salvaguardas.
- Alucinacion visual: como todo modelo de difusion, puede producir anatomia incorrecta, artefactos en manos y rostros, y texto ilegible.
- Sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que se desconocen sesgos de genero, etnia o cuerpo.
- Idioma: solo se declara soporte de ingles; los prompts en castellano pueden degradar la calidad.
- Licencia: CreativeML OpenRAIL-M impone restricciones de uso (prohibicion de usos ilegales, dano, discriminacion) y requiere que los derivados mantengan la misma licencia; el uso comercial esta permitido con condiciones, pero el modelo base FLUX.1-dev tiene licencia no comercial, lo que genera una posible incompatibilidad que el autor no aclara.
- Trazabilidad: repositorio sin descargas ni likes, model card parcialmente en coreano, sin documentacion de entrenamiento ni evaluacion; no es recomendable para produccion sin validacion propia.
- Dependencia del modelo base: requiere descargar y cargar FLUX.1-dev, con los requisitos de hardware y las restricciones de licencia de este.

## Enlaces

- [HuggingFace: Asukaa02/Flux-NSFW-uncensored](https://huggingface.co/Asukaa02/Flux-NSFW-uncensored)
- [Modelo base: black-forest-labs/FLUX.1-dev](https://huggingface.co/black-forest-labs/FLUX.1-dev)
- [Repositorio referenciado en el codigo: Heartsync/Flux-NSFW-uncensored](https://huggingface.co/Heartsync/Flux-NSFW-uncensored)
- [Documentacion de diffusers](https://huggingface.co/docs/diffusers)
- [Documentacion de PEFT](https://huggingface.co/docs/peft)
