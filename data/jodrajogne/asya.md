# jodrajogne/asya

## Resumen

Asya es un adaptador LoRA de tipo DreamBooth para el modelo de generacion de imagenes Krea 2, desarrollado por el usuario jodrajogne y publicado en Hugging Face. El adaptador ensena al modelo base un concepto visual concreto, activado mediante el token `Asya`, que permite generar representaciones consistentes de ese sujeto en estilos y escenarios muy diversos (desde fotografia macro hasta pintura impresionista o ciencia ficcion). El repositorio ocupa 1,6 GB y se distribuye bajo licencia Apache 2.0.

El LoRA fue entrenado sobre Krea 2 RAW y esta pensado para usarse en inferencia sobre Krea 2 Turbo, la variante destilada del modelo base que permite generar imagenes en apenas 8 pasos con `guidance_scale=0.0`. Esto lo convierte en una pieza ligera y rapida de integrar en flujos de trabajo con la libreria `diffusers`, sin necesidad de reentrenar el modelo completo.

Se trata de un modelo de text-to-image con licencia permisiva, publicado en noviembre de 2026, que no cuenta aun con descargas ni valoraciones publicas. Su interes practico reside en la personalizacion de identidades o estilos consistentes sobre un backbone moderno de generacion de imagenes, un caso de uso muy habitual en produccion creativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre modelo de difusion Krea 2 |
| Parametros totales | no disponible (adaptador LoRA; repositorio de 1,6 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de text-to-image; condicionamiento por prompt) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en precision original; el modelo base admite bfloat16) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato nativo de `diffusers` para LoRA; no se especifica GGUF) |

## Arquitectura y entrenamiento

El adaptador sigue el paradigma DreamBooth-LoRA: se entrenan matrices de bajo rango que se inyectan en las capas del modelo de difusion base (Krea 2 RAW), manteniendo congelados los pesos originales. El resultado es un fichero de pequeno tamano relativo que modifica la distribucion de salida del modelo para asociar el token `Asya` a un concepto visual especifico. No se dispone de informacion sobre el numero de imagenes de entrenamiento, la resolucion, el learning rate ni la composicion del dataset utilizado.

La inferencia recomendada por el autor se realiza sobre Krea 2 Turbo con 8 pasos de denoising y `guidance_scale=0.0`, lo que indica que el adaptador fue validado en el regimen de destilacion del modelo Turbo. No se documentan innovaciones tecnicas adicionales (RLHF, DPO, decodificacion especulativa, attention lineal) mas alla del propio mecanismo LoRA.

## Capacidades

- Generacion de imagenes text-to-image condicionada por prompt, con el token `Asya` como disparador del concepto aprendido.
- Personalizacion de identidad o sujeto consistente a traves de estilos radicalmente distintos (fotorrealismo, pintura al oleo, macro, ciencia ficcion).
- Transferencia de estilo mediante descripciones de escena y ambientacion en el prompt.
- Composicion de escenas complejas: iluminacion cinematografica, planos amplios, entornos detallados.
- Integracion programatica con `diffusers` mediante `load_lora_weights` sobre `Krea2Pipeline`.
- Inferencia rapida en 8 pasos con Krea 2 Turbo (sin classifier-free guidance).
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso (no aplicables a un modelo de difusion).

## Casos de uso

- Creacion de personajes consistentes para narrativa visual: usar el token `Asya` en prompts variados permite mantener la identidad del sujeto entre ilustraciones de un cuento, comic o storyboard, gracias a la asociacion aprendida por DreamBooth.
- Generacion de material promocional tematico: producir rapidamente variaciones de un mismo personaje en escenarios de marca (producto, campana, redes sociales) con 8 pasos de inferencia sobre Turbo.
- Prototipado de concept art: explorar estilos (oleo impresionista, macro fotorrealista, cyberpunk) sobre un mismo sujeto para presentar opciones a direccion artistica antes de encargar produccion final.
- Ilustracion editorial y portadas: generar imagenes de atmosfera cinematografica con iluminacion y composicion controladas por prompt, adecuadas para articulos, libros o revistas.
- Personalizacion de avatares y assets digitales: crear representaciones estilizadas del sujeto para perfiles, videojuegos o entornos virtuales con coherencia visual entre piezas.
- Experimentacion e investigacion en personalizacion: servir como caso de estudio de LoRA DreamBooth sobre Krea 2, util para comparar tecnicas de fine-tuning ligero y evaluar la transferencia de concepto en modelos de difusion modernos.
- Automatizacion de pipelines creativos: integrar el adaptador en scripts de `diffusers` para generar lotes de imagenes con el token `Asya` dentro de flujos de CI o produccion de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; depende del modelo base Krea 2 Turbo. El adaptador LoRA en si ocupa 1,6 GB en repositorio, pero la inferencia requiere cargar el pipeline completo en bfloat16.
- GPU recomendadas: no disponibles en la informacion proporcionada; el codigo de ejemplo usa `torch.bfloat16` y `.to("cuda")`, lo que sugiere una GPU NVIDIA con soporte bfloat16.
- Compatibilidad con GPU consumer: no confirmada; al ser un modelo de difusion de gran tamano, es probable que requiera GPU de gama alta, pero no se aportan datos concretos.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` (metodo documentado por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el autor indica 8 pasos de inferencia sobre Krea 2 Turbo, pero no ofrece tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jodrajogne/asya | LoRA DreamBooth sobre Krea 2 | no disponible (repo 1,6 GB) | no aplica | Apache 2.0 | Hugging Face |
| Krea 2 Turbo (base) | Modelo de difusion text-to-image | no disponible | no aplica | no disponible en esta ficha | Hugging Face (krea/Krea-2-Turbo) |
| Krea 2 RAW (base de entrenamiento) | Modelo de difusion text-to-image | no disponible | no aplica | no disponible en esta ficha | Hugging Face (krea/Krea-2-Raw) |

No se dispone de datos de rendimiento ni de otros adaptadores LoRA comparables en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Riesgo de sobreajuste al concepto: al ser un LoRA DreamBooth entrenado sobre un sujeto concreto, puede reproducir sesgos o artefactos del dataset de entrenamiento, cuyo contenido no se documenta.
- Alucinacion visual: el modelo puede generar detalles inconsistentes o anatomias incorrectas, especialmente en composiciones complejas o con el token `Asya` fuera de distribucion.
- Dependencia del modelo base: requiere Krea 2 Turbo (y fue entrenado sobre Krea 2 RAW); el rendimiento fuera de esa combinacion no esta garantizado.
- Idiomas: la model card solo muestra prompts en ingles; no se confirma soporte multilingue en el condicionamiento textual.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Krea 2, que pueden imponer restricciones adicionales.
- Sin validacion comunitaria: el repositorio tiene 0 descargas y 0 likes, por lo que no existe evidencia externa de calidad o estabilidad en produccion.
- Ausencia de benchmarks: no hay metricas objetivas (FID, CLIP score, etc.) que respalden el rendimiento del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/jodrajogne/asya
- Modelo base de inferencia: https://huggingface.co/krea/Krea-2-Turbo
- Modelo base de entrenamiento: https://huggingface.co/krea/Krea-2-Raw
