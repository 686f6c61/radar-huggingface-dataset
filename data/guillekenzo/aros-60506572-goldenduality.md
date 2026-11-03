# guillekenzo/aros-60506572-GoldenDuality

## Resumen

`guillekenzo/aros-60506572-GoldenDuality` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario `guillekenzo`. El adaptador inyecta un concepto visual concreto —una identidad de persona abstracta invocada mediante el token `wljmk woman`— sobre el modelo base `krea/Krea-2-Raw`, y se ha entrenado para ser usado preferentemente sobre la variante Turbo del mismo modelo (8 pasos de inferencia). No es un modelo fundacional: es un artefacto de personalizacion ligero que depende por completo de los pesos de Krea 2.

El problema que resuelve es el habitual en personalizacion de modelos de difusion: fijar un sujeto o estilo concreto de forma reproducible sin reentrenar el modelo completo. Con un repositorio de apenas 0,4 GB, el LoRA permite generar imagenes consistentes del concepto aprendido a partir de prompts de texto que incluyan el token disparador.

Es relevante unicamente dentro del ecosistema Krea 2 y de la libreria `diffusers`. El repositorio se creo el 3 de noviembre de 2026 y en el momento de redactar esta ficha no registra descargas ni valoraciones, por lo que debe considerarse un artefacto experimental sin validacion comunitaria. La licencia declarada es Apache 2.0, aunque la licencia efectiva del modelo base puede imponer condiciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen; arquitectura del modelo base no disponible en la informacion proporcionada |
| Parametros totales | no disponible (el repositorio ocupa 0,4 GB, lo que sugiere un adaptador de bajo rango, pero no se detalla el numero exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion; la condicion de texto depende del codificador del modelo base) |
| Tipos de cuantizacion | no disponible para el LoRA; el modelo base se usa en `bfloat16` segun el ejemplo de la model card |
| Idiomas soportados | no disponible (no se declaran idiomas en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible de forma explicita; compatible con `diffusers` (`load_lora_weights`), lo que implica pesos en formato de la libreria (safetensors como formato habitual) |

## Arquitectura y entrenamiento

El artefacto es un LoRA de DreamBooth, es decir, un conjunto de matrices de bajo rango que se suman a determinadas capas del modelo base Krea 2 para especializarlo en un concepto concreto. Se entrena sobre `krea/Krea-2-Raw` y la model card indica que las muestras se generaron aplicandolo sobre `krea/Krea-2-Turbo` con 8 pasos de inferencia y `guidance_scale=0.0`, lo que es coherente con el regimen de destilacion por destilacion de pasos (modelos Turbo) del modelo base.

La informacion disponible no detalla el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje, la dimension del rango (`r`), el valor de `alpha` ni que modulos del UNet o del transformer se adaptaron. Tampoco se especifica si se aplicaron tecnicas adicionales como regularizacion por clase, `prior preservation` o aumentado de datos. El unico hiperparametro funcional documentado es el token disparador `wljmk woman`, que debe incluirse en el prompt para activar el concepto aprendido.

## Capacidades

- Generacion de imagenes texto-a-imagen del concepto aprendido, condicionada a prompts que incluyan el token `wljmk woman`.
- Personalizacion de identidad o sujeto: la model card muestra el concepto en tres escenarios distintos (interior sobre una mesa de madera, exterior sobre hierba y primer plano sobre fondo liso), lo que indica cierta capacidad de generalizacion a contextos variados.
- Composicion con el modelo base: al ser un LoRA, hereda las capacidades del modelo Krea 2 subyacente (composicion de escenas, iluminacion, estilos fotograficos) y las modula con el concepto aprendido.
- Uso en dos variantes del base: entrenado sobre Krea 2 RAW y validado sobre Krea 2 Turbo con 8 pasos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Prototipado de personajes para narrativa visual: el LoRA permite generar un mismo sujeto en localizaciones y planos distintos (interior, exterior, primer plano) manteniendo consistencia, util para storyboards y pruebas de concepto.
- Generacion de material grafico para campanas ficticias o maquetas: integrado en un pipeline `diffusers`, se puede invocar con el token disparador para producir variaciones de una identidad concreta sin reentrenar el modelo base.
- Investigacion sobre personalizacion de modelos de difusion: sirve como caso de estudio de un DreamBooth-LoRA entrenado sobre Krea 2 RAW y evaluado sobre Turbo, util para comparar estrategias de adaptacion de bajo rango.
- Pruebas de transferencia entre variantes RAW y Turbo: permite medir como se comporta un adaptador entrenado en la variante completa cuando se aplica a la variante destilada de 8 pasos.
- Generacion de imagenes de referencia para diseno de producto o moda: el ejemplo de la model card sitúa al sujeto sobre una mesa de madera, lo que encaja con composiciones de bodegon o presentacion de articulos.
- Experimentacion con `guidance_scale=0.0` en modelos Turbo: el ejemplo del autor documenta un flujo de inferencia de 8 pasos sin classifier-free guidance, replicable para estudiar la fidelidad del LoRA en ese regimen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de identidad, etc.) ni comparaciones con otros LoRA o metodos de personalizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA en si (0,4 GB en disco); el consumo real lo determina el modelo base Krea 2, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU con soporte de bfloat16 (Ampere o posterior, por ejemplo A100, H100, RTX 3090, RTX 4090).
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base. El uso de bfloat16 sugiere que no cabria en GPUs sin soporte nativo de ese tipo de dato sin conversion a float16.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights`, tal como documenta el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de este tipo.
- Latencia y throughput: no disponibles. El unico dato operativo es el regimen de 8 pasos de inferencia con `guidance_scale=0.0` sobre Krea 2 Turbo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA o adaptadores comparables para Krea 2, ni datos de rendimiento que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Dependencia total del modelo base: el LoRA no funciona de forma autonoma; requiere descargar `krea/Krea-2-Raw` o `krea/Krea-2-Turbo` y la version de `diffusers` que incluya `Krea2Pipeline`.
- Token disparador obligatorio: sin `wljmk woman` en el prompt el adaptador probablemente no active el concepto, y su presencia fuera de contexto puede degradar la generacion.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la ficha; no hay evidencia independiente de calidad, estabilidad ni ausencia de artefactos.
- Riesgo de sobreajuste y fuga de identidad: al ser un DreamBooth sobre un sujeto concreto, puede reproducir rasgos de una persona real si el entrenamiento se hizo con imagenes de terceros; el autor no documenta la procedencia de los datos.
- Sesgos: no documentados. Al heredar el modelo base, puede reproducir los sesgos demograficos y esteticos de Krea 2, que tampoco se detallan.
- Alucinacion visual: como todo modelo generativo, puede producir anatomia incorrecta, texto ilegible o incoherencias en escenas complejas; no hay evaluacion publicada.
- Licencia: el LoRA declara Apache 2.0, pero el uso comercial depende de la licencia del modelo base Krea 2, que no se detalla en la informacion proporcionada y debe verificarse por separado.
- Idiomas: no se declaran; los prompts de ejemplo estan en ingles y no hay evidencia de soporte multilingue en el condicionamiento de texto.
- Fecha y madurez: repositorio creado y actualizado el mismo dia (3 de noviembre de 2026), sin historial de versiones ni mantenimiento demostrado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/guillekenzo/aros-60506572-GoldenDuality
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo usada en los ejemplos: https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
