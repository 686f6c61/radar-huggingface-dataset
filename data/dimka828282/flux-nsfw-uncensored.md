# Dimka828282/Flux-NSFW-uncensored

## Resumen

Flux-NSFW-uncensored es un ajuste fino (fine-tune) del modelo de difusion texto-a-imagen FLUX.1-dev de Black Forest Labs, publicado por el usuario Dimka828282 en Hugging Face. El modelo se distribuye como un adaptador LoRA (fichero `lora.safetensors`) que se carga sobre los pesos del FLUX.1-dev original mediante la libreria PEFT y el pipeline `AutoPipelineForText2Image` de Diffusers. Su proposito declarado es reducir las restricciones de censura del modelo base para explorar los limites tecnicos de la generacion de imagenes.

El repositorio es de muy reciente creacion (15 de noviembre de 2026) y no registra descargas ni interacciones en el momento de redactar esta ficha. El tamano del repositorio es de 0,7 GB, coherente con un adaptador LoRA de rango bajo y no con un modelo completo. El modelo base sobre el que se apoya, FLUX.1-dev, es un transformer de difusion con mecanismo de atencion de flujo (flow matching) de 12 000 millones de parametros y resoluciones nativas de hasta 1024x1024.

La relevancia de esta ficha es doble: por un lado documenta un caso de fine-tune no oficial sobre FLUX.1-dev; por otro, advierte de las implicaciones legales y eticas de un modelo explicitamente descrito como "uncensored" y etiquetado como `not-for-all-audiences`, con licencia CreativeML OpenRAIL-M, que impone restricciones de uso adicionales sobre el modelo derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre FLUX.1-dev; el modelo base es un transformer de difusion con flow matching |
| Parametros totales | no disponible (el adaptador LoRA no declara rango ni numero de parametros; el modelo base FLUX.1-dev tiene 12 000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; la longitud de prompt no se especifica) |
| Tipos de cuantizacion | no disponible; el ejemplo oficial usa `torch.float16`; el ecosistema FLUX admite GGUF y cuantizaciones de 4 y 8 bits, pero el autor no las documenta |
| Idiomas soportados | en (ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (adaptador LoRA: `lora.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que modifica los pesos del transformer de difusion FLUX.1-dev. FLUX.1-dev emplea una arquitectura de flow matching con un transformer de doble y simple flujo (double-stream y single-stream) de 12 000 millones de parametros, junto con un codificador de texto T5 y un VAE para la decodificacion latente. El adaptador se carga mediante `pipe.load_lora_weights` con el nombre `lora.safetensors`, lo que indica que el autor ha entrenado exclusivamente las matrices de bajo rango y no ha reentrenado el modelo completo.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje, el rango del LoRA ni si se aplicaron tecnicas de regularizacion. La model card no incluye detalles del proceso de entrenamiento ni comparaciones con el modelo base. Tampoco se documenta si el ajuste se realizo sobre pares prompt-imagen filtrados o sobre un corpus especifico de contenido explicito.

## Capacidades

- Generacion de imagenes texto-a-imagen a resoluciones de 1024x1024 y superiores, heredadas de FLUX.1-dev.
- Reduccion de las restricciones de censura del modelo base, segun la descripcion del autor, orientada a contenido para adultos.
- Soporte de prompt negativo (`negative_prompt`) en el pipeline de Diffusers.
- Control de la escala de guia (`guidance_scale`) y del numero de pasos de inferencia (`num_inference_steps`).
- Reproducibilidad mediante semilla (`torch.Generator.manual_seed`).
- Generacion fotorrealista: el ejemplo oficial emplea vocabulario de fotografia profesional (Canon EOS R5, 85 mm f/1.2, golden hour) y solicita detalle hiperrealista.
- No se documenta soporte de tool calling, agentes, vision de entrada ni modo de razonamiento; son capacidades no aplicables a un modelo de difusion texto-a-imagen.

## Casos de uso

- Investigacion sobre limites de censura en modelos generativos: el modelo permite a investigadores comparar la salida del FLUX.1-dev original con la del adaptador para estudiar como se manifiestan los sesgos y los filtros de seguridad en modelos de difusion.
- Pruebas de robustez de filtros de contenido: integrable en pipelines de evaluacion que midan la eficacia de clasificadores de seguridad de imagen ante prompts adversarios.
- Generacion de arte conceptual para adultos en entornos controlados: el adaptador permite producir imagenes con estetica fotorrealista para proyectos creativos que requieran contenido no filtrado, siempre que se cumplan los requisitos de la licencia OpenRAIL-M.
- Estudio de tecnicas LoRA: sirve como caso practico de como un adaptador de bajo rango modifica el comportamiento de un modelo de difusion de gran tamano sin reentrenarlo por completo.
- Analisis de sesgos de genero y representacion: al eliminar restricciones, el modelo puede emplearse para auditar que representaciones emergen cuando no hay filtros de seguridad.
- Docencia sobre etica de IA: util como ejemplo de modelo con etiqueta `not-for-all-audiences` para discutir gobernanza, licencias y desplegues responsables.
- Prototipado de interfaces de generacion de imagen: el codigo de ejemplo con Diffusers y PEFT permite integrar el adaptador en demos locales con control de semilla y prompt negativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con el modelo base FLUX.1-dev u otros adaptadores.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa 0,7 GB, pero la inferencia requiere cargar el FLUX.1-dev completo. En `float16` se estiman aproximadamente 24 GB de VRAM para el transformer y el codificador de texto; con cuantizacion de 8 bits, en torno a 12-16 GB; con cuantizacion de 4 bits (GGUF), alrededor de 8-10 GB.
- GPU recomendadas: A100 40 GB o H100 para inferencia en `bfloat16` sin cuantizar; RTX 4090 (24 GB) para `float16`; RTX 3090 (24 GB) como alternativa.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 con `float16`, y en GPUs de 8-12 GB si se emplean cuantizaciones GGUF de 4 u 8 bits.
- Opciones de despliegue: Diffusers con PEFT (metodo documentado por el autor), ComfyUI, Automatic1111 con extensiones FLUX, y llama.cpp/GGUF para variantes cuantizadas del modelo base.
- Latencia y throughput: no disponibles. El ejemplo oficial usa 28 pasos de inferencia y `guidance_scale=7.0`, valores tipicos para FLUX.1-dev, pero el autor no publica tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Flux-NSFW-uncensored (este) | LoRA sobre FLUX.1-dev (12 000 M en base) | 1024x1024 | creativeml-openrail-m | Hugging Face, 0 descargas |
| black-forest-labs/FLUX.1-dev | 12 000 M | 1024x1024 | FLUX.1-dev Non-Commercial License | Hugging Face, muy popular |
| black-forest-labs/FLUX.1-schnell | 12 000 M | 1024x1024 | Apache 2.0 | Hugging Face, muy popular |
| stabilityai/stable-diffusion-3.5-large | 8 000 M | 1024x1024 | Stability AI Community License | Hugging Face, amplia adopcion |

La comparativa se limita a datos publicos de los modelos base; no hay informacion sobre el rendimiento relativo del adaptador frente a alternativas.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como `not-for-all-audiences` y su proposito declarado es reducir la censura, lo que implica riesgo de generar contenido sexual explicito o potencialmente ilegal si se usa de forma irresponsable.
- Licencia CreativeML OpenRAIL-M: impone restricciones de uso adicionales (uso prohibido para fines ilegales, dano a menores, desinformacion, etc.) y exige que los usos derivados respeten las clausulas de uso aceptable. El uso comercial esta permitido con condiciones, pero debe revisarse caso por caso.
- Modelo base no comercial en origen: FLUX.1-dev se distribuye bajo una licencia no comercial; el adaptador hereda esa restriccion, por lo que el uso comercial requiere verificar la compatibilidad con la licencia del modelo base.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, artefactos, texto ilegible y composiciones fisicamente improbables.
- Sesgos: no se documenta ninguna evaluacion de sesgos de genero, raza o representacion; al eliminar filtros, los sesgos del modelo base pueden amplificarse.
- Idiomas: solo se declara soporte de ingles; los prompts en otros idiomas pueden degradar la calidad.
- Sin benchmarks ni validacion externa: no hay metricas publicadas que permitan evaluar la calidad del adaptador frente al modelo base.
- Repositorio sin actividad: 0 descargas y 0 likes en la fecha de creacion, sin garantia de mantenimiento ni soporte.
- Responsabilidad legal: el usuario es responsable del contenido generado; en la UE, el Reglamento de IA y la normativa sobre contenido sexual explicito pueden aplicar segun el contexto de uso.

## Enlaces

- Hugging Face: https://huggingface.co/Dimka828282/Flux-NSFW-uncensored
- Modelo base FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Repositorio Diffusers: https://github.com/huggingface/diffusers
- Libreria PEFT: https://github.com/huggingface/peft
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
