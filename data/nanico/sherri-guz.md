# Nanico/sherri-guz

## Resumen

Nanico/sherri-guz es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, entrenado sobre la variante Krea 2 RAW y presentado por el autor sobre Krea 2 Turbo. Lo desarrolla el usuario Nanico y se publica bajo licencia Apache 2.0 en Hugging Face. No se trata de un modelo base autonomo, sino de un peso adicional de aproximadamente 0,8 GB que se carga sobre el pipeline `Krea2Pipeline` para inyectar un concepto concreto invocado mediante el token de activacion `srm`.

El adaptador resuelve el problema clasico de personalizacion: incorporar un concepto o estilo especifico (en este caso el token `srm`, sin descripcion semantica publica en la model card) en un modelo de difusion sin reentrenarlo desde cero. Es relevante para desarrolladores que ya trabajan con el ecosistema Krea 2 y quieren anadir un concepto propio con un coste de almacenamiento minimo y una integracion directa via `diffusers`.

La informacion disponible es muy limitada: la model card no detalla el dataset de entrenamiento, el numero de pasos, el rango del LoRA ni metricas de calidad. La ficha refleja exclusivamente lo publicado por el autor y marca como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Krea 2; libreria diffusers |
| Parametros totales | no disponible (repo de 0,8 GB; numero de parametros del adaptador no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16 segun el ejemplo de la model card) |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato habitual de LoRA en diffusers; no confirmado explicitamente en la model card) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth para Krea 2, segun indica el autor en la model card. Se entrena sobre Krea 2 RAW (el checkpoint base sin destilar) y se muestra funcionando sobre Krea 2 Turbo, la variante optimizada para inferencia en pocos pasos. La integracion se realiza mediante `pipe.load_lora_weights("Nanico/sherri-guz")` sobre una instancia de `Krea2Pipeline` cargada desde `krea/Krea-2-Turbo` en `torch.bfloat16`.

No se publican datos sobre el numero de imagenes de entrenamiento, el rango del LoRA, la tasa de aprendizaje, el numero de pasos ni la composicion del dataset. Tampoco se documenta si hubo regularizacion, captions auxiliares o aumento de datos. La unica innovacion tecnica destacable documentada es el uso del token de activacion `srm` para invocar el concepto y la compatibilidad con el modo Turbo de 8 pasos con `guidance_scale=0.0`.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) condicionada por el concepto `srm`.
- Personalizacion de un concepto concreto sobre Krea 2 sin reentrenar el modelo base.
- Compatibilidad con Krea 2 Turbo en 8 pasos de inferencia y `guidance_scale=0.0`, segun el ejemplo del autor.
- Integracion nativa con la libreria `diffusers` mediante `load_lora_weights`.
- Composicion de escenas complejas: los ejemplos incluyen un mercado cyberpunk, un vinedo toscano y un arrecife bioluminiscente, lo que sugiere capacidad de integrar el concepto en contextos variados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio.

## Casos de uso

- Prototipado de concepto de marca: cargar el LoRA sobre Krea 2 Turbo para generar variaciones de un elemento visual propio (aqui `srm`) en distintos entornos y validar direccion de arte antes de producir assets finales.
- Generacion de ilustraciones editoriales: usar prompts detallados con el token `srm` para producir imagenes de acompanamiento en articulos, con la ventaja de que el adaptador pesa solo 0,8 GB y se puede versionar junto al pipeline.
- Creacion de moodboards para diseno de producto: combinar el concepto con escenas realistas (interiores, exteriores, primeros planos) para explorar como encaja el elemento en contextos fisicos.
- Integracion en pipelines de generacion por lotes: al ser un LoRA cargable via `diffusers`, se puede encadenar en scripts de generacion masiva con Krea 2 Turbo de 8 pasos para reducir coste computacional por imagen.
- Experimentacion en investigacion de personalizacion: servir como caso de estudio de DreamBooth-LoRA sobre Krea 2 RAW y evaluar la transferencia del concepto al modo Turbo.
- Demos interactivas y pruebas de concepto: desplegar una interfaz ligera (Gradio, por ejemplo) que cargue el pipeline base y el adaptador para que el equipo pruebe prompts con el token `srm` en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de concepto) ni comparaciones con otros LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del pipeline Krea 2 Turbo completo, no solo del adaptador. El adaptador en si ocupa aproximadamente 0,8 GB en disco.
- GPU recomendadas: no disponible en la informacion proporcionada. El ejemplo del autor usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU compatible con bfloat16.
- Cabe en GPU consumer: no confirmado; depende de los requisitos del modelo base Krea 2 Turbo, no documentados en esta ficha.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` (unico metodo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles. El autor indica 8 pasos de inferencia en modo Turbo, pero no publica tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanico/sherri-guz | LoRA DreamBooth sobre Krea 2 | no disponible (repo 0,8 GB) | no aplica | Apache 2.0 | Hugging Face |
| LoRA genericos sobre SDXL | LoRA sobre modelo de difusion | variable (tipicamente 10-200 MB) | no aplica | variable | Hugging Face, Civitai |
| LoRA sobre Flux.1 | LoRA sobre modelo de difusion | variable | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas. La comparacion se limita a tipo de artefacto, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card muy escasa: no se documentan dataset, hiperparametros ni evaluacion, lo que dificulta reproducir el entrenamiento o estimar su calidad.
- El token `srm` no tiene descripcion semantica publica; su comportamiento real solo puede verificarse generando muestras.
- Riesgo de sobreajuste al concepto y de degradacion de la coherencia global de la imagen, habitual en LoRA de concepto con pocos datos.
- No se documentan sesgos; al ser un adaptador de imagen, puede heredar los sesgos del modelo base Krea 2 y del dataset de entrenamiento no publicado.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial esta condicionado por la licencia del modelo base Krea 2, que no se detalla en la informacion disponible.
- Sin descargas ni likes en el momento de la consulta (0 y 0), lo que indica ausencia de validacion por parte de la comunidad.
- No hay garantia de compatibilidad con versiones futuras de `Krea2Pipeline` ni con otras variantes de Krea 2 distintas de Turbo.
- Los prompts de ejemplo estan en ingles; el soporte multilingue no esta documentado.

## Enlaces

- Hugging Face: https://huggingface.co/Nanico/sherri-guz
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo usada en los ejemplos: https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
