# Omoshiroihs2/wtny

## Resumen

`Omoshiroihs2/wtny` es un LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario Omoshiroihs2 y publicado en Hugging Face bajo licencia Apache 2.0. El adaptador inyecta un concepto visual concreto, invocado mediante el token de activacion `wtny, whitney`, sobre el modelo base `krea/Krea-2-Raw` y se muestra funcionando sobre la variante destilada `krea/Krea-2-Turbo`.

Se trata de un adaptador de bajo rango (LoRA) y no de un modelo completo: su repo pesa 1,0 GB y no incluye pesos del modelo base, que debe cargarse por separado. La relevancia es acotada: sirve para personalizacion rapida de un concepto (un personaje o estilo concreto) sobre Krea 2 sin reentrenar el modelo completo, y es compatible con la libreria `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.

La informacion publicada por el autor es minima: no hay detalles sobre el dataset de entrenamiento, el numero de pasos, el rango del LoRA ni resultados cuantitativos. La model card se limita al token de activacion, tres prompts de ejemplo y un snippet de uso con 8 pasos de inferencia y `guidance_scale=0.0` sobre Krea 2 Turbo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen Krea 2 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se distribuye en este repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; no hay contexto textual en tokens documentado) |
| Tipos de cuantizacion | no disponible (el ejemplo oficial usa `torch.bfloat16` para el pipeline base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors dentro de un repo `diffusers` (compatible con `load_lora_weights`) |

## Arquitectura y entrenamiento

El artefacto es un LoRA de DreamBooth entrenado sobre `krea/Krea-2-Raw`. No se especifica el rango, el alpha, las capas objetivo ni el numero de pasos de entrenamiento. El autor indica que las muestras publicadas se generaron aplicando el LoRA sobre Krea 2 Turbo con 8 pasos de inferencia, lo que sugiere que el adaptador es compatible tanto con la variante RAW como con la destilada Turbo.

No hay informacion sobre el dataset (numero de imagenes, resolucion, composicion), sobre el uso de regularizacion, ni sobre tecnicas adicionales como LoRA con prior preservation o fine-tuning de text encoder. Tampoco se documenta si el adaptador modifica solo el UNet/DiT o tambien el encoder de texto.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el concepto aprendido, invocado con el token `wtny, whitney`.
- Personalizacion de un concepto concreto (presumiblemente un personaje llamado Whitney) en multiples estilos: retrato de alta costura, escena cinematografica, pintura al oleo.
- Composicion con el modelo base Krea 2: el LoRA se carga sobre `Krea2Pipeline` y se combina con el resto de capacidades del modelo base.
- Compatibilidad con inferencia rapida sobre Krea 2 Turbo (8 pasos, `guidance_scale=0.0` segun el ejemplo del autor).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking (no aplica a un modelo de difusion).

## Casos de uso

- Generacion de retratos de personaje consistente: usar `wtny, whitney` en el prompt para mantener la identidad del concepto a lo largo de varias generaciones, util en preproduccion de comics o storyboards.
- Ilustracion editorial y conceptual: aplicar el token en prompts de escena (por ejemplo, exploradora medieval en una selva bioluminiscente) para obtener variaciones estilisticas del mismo personaje.
- Prototipado de campanas creativas: generar variaciones de un personaje en distintos entornos (cyberpunk, victoriano, fantasia) para presentar opciones a un cliente antes de producir el arte final.
- Integracion en pipelines `diffusers`: cargar el LoRA con `pipe.load_lora_weights("Omoshiroihs2/wtny")` dentro de un script Python para generacion por lotes en un servidor con GPU.
- Experimentacion con inferencia rapida: combinar el LoRA con Krea 2 Turbo a 8 pasos para iterar rapidamente sobre prompts en un flujo de diseno.
- Base para fine-tuning adicional: usar este LoRA como punto de partida para adaptar el concepto a un estilo propio o a un nuevo dominio visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el LoRA en si (el repo pesa 1,0 GB); el consumo real lo determina el modelo base Krea 2, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponibles; el ejemplo oficial usa `torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU compatible con bfloat16 (Ampere o posterior, como A100, H100, RTX 30/40).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` (unico metodo documentado por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion, salvo backends especificos no documentados).
- Latencia y throughput: no disponibles; el autor indica 8 pasos de inferencia sobre Krea 2 Turbo, pero sin tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Omoshiroihs2/wtny | LoRA sobre Krea 2 | no disponible | no aplica | sin benchmarks publicados | Apache 2.0 | Hugging Face |
| krea/Krea-2-Raw | Modelo base difusion | no disponible | no aplica | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| krea/Krea-2-Turbo | Modelo base destilado | no disponible | no aplica | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos suficientes para comparar con otros LoRA de la misma categoria (por ejemplo, adaptadores DreamBooth para SDXL u otros modelos de difusion), ya que no se han proporcionado metricas ni especificaciones de esos modelos en la informacion disponible.

## Limitaciones y advertencias

- La informacion publicada es minima: no hay datos de dataset, hiperparametros, rango del LoRA ni evaluacion cuantitativa, lo que dificulta estimar su calidad y generalizacion.
- El adaptador esta acoplado al modelo base `krea/Krea-2-Raw`; no funcionara con otros modelos de difusion sin reentrenamiento.
- El token de activacion `wtny, whitney` es obligatorio para invocar el concepto; sin el, el LoRA puede no tener efecto o introducir artefactos.
- Riesgo de sobreajuste al concepto y de degradacion de la diversidad de composiciones, habitual en LoRA de DreamBooth con datasets pequenos (no se documenta el tamano).
- No se documentan sesgos del concepto aprendido ni del modelo base; al ser un modelo generativo de imagenes, puede reproducir sesgos de representacion del dataset de entrenamiento.
- Licencia Apache 2.0 declarada por el autor, pero el uso comercial del LoRA puede estar condicionado por la licencia del modelo base Krea 2, que no se detalla en la informacion proporcionada; conviene verificar la licencia de `krea/Krea-2-Raw` antes de usarlo en produccion.
- No hay garantias de soporte, mantenimiento ni actualizaciones del adaptador (0 descargas y 0 likes en el momento de la consulta).

## Enlaces

- Hugging Face: https://huggingface.co/Omoshiroihs2/wtny
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo (usada en las muestras): https://huggingface.co/krea/Krea-2-Turbo
