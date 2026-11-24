# Nanico/chelda

## Resumen

`Nanico/chelda` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario Nanico y publicado bajo licencia Apache 2.0. El adaptador se entrena sobre los pesos de `krea/Krea-2-Raw` y se utiliza en inferencia sobre la variante `krea/Krea-2-Turbo`, lo que permite invocar un concepto concreto mediante el token disparador `chl`. El repositorio ocupa 0,8 GB y esta etiquetado con la plantilla `sd-lora` dentro del ecosistema diffusers.

Se trata de un modelo de nicho, sin descargas ni interacciones registradas en el momento de la consulta, orientado a la personalizacion de un concepto visual especifico (objeto o entidad representada por `chl`) sobre la base Krea 2. No es un modelo fundacional: su relevancia depende enteramente del modelo base sobre el que se aplica, por lo que su evaluacion tecnica debe hacerse en el contexto de Krea 2.

La informacion publicada es escasa: la model card se limita al token disparador, tres ejemplos de prompt con imagenes de muestra y un snippet de uso con diffusers. No se documentan hiperparametros de entrenamiento, composicion del dataset ni metricas de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen (Krea 2) |
| Parametros totales | no disponible (adaptador LoRA; tamano del repo 0,8 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica contexto de tokens de texto de forma estandar) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16 segun el ejemplo; cuantizaciones del base no documentadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de LoRA en diffusers; no se detalla explicitamente en la informacion) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante DreamBooth sobre `krea/Krea-2-Raw`, el checkpoint base de Krea 2. La inferencia documentada se realiza sobre `krea/Krea-2-Turbo` con 8 pasos de difusion y `guidance_scale=0.0`, lo que sugiere que el adaptador es compatible con la variante destilada de Krea 2 y que funciona en regimen de pocos pasos. El token disparador es `chl`.

No se especifican en la informacion disponible el rango del LoRA, el numero de imagenes de entrenamiento, la resolucion, el numero de pasos de entrenamiento, la tasa de aprendizaje ni si se aplicaron tecnicas adicionales (regularizacion, prior preservation, etc.). Tampoco se documenta la arquitectura interna de Krea 2 (tipo de backbone, VAE, text encoder) mas alla de su uso a traves de `Krea2Pipeline` en diffusers.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada al concepto aprendido mediante el token `chl`.
- Personalizacion de un sujeto u objeto concreto sobre el modelo base Krea 2 (estilo DreamBooth).
- Compatibilidad con la variante Turbo de Krea 2, permitiendo generacion en 8 pasos.
- Uso mediante la libreria diffusers con `load_lora_weights`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking (no aplica a un modelo texto-a-imagen).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Prototipado de conceptos personalizados: aplicar el LoRA sobre Krea 2 Turbo para generar variaciones de un objeto concreto (representado por `chl`) en distintos entornos (mesa de madera, cesped, fondo neutro), tal como muestran los ejemplos de la model card.
- Generacion de imagenes de producto: usar el token `chl` para mantener consistencia visual de un articulo en escenas controladas, aprovechando la inferencia en 8 pasos para iterar rapidamente.
- Creacion de assets para ilustracion o diseno: producir imagenes de un sujeto especifico con encuadres variados (plano cercano, exterior, interior) reutilizando el mismo adaptador.
- Experimentacion con DreamBooth-LoRA: servir como ejemplo de adaptador de bajo rango sobre Krea 2 para estudiar el efecto del token disparador y la transferencia Raw a Turbo.
- Integracion en pipelines de generacion por lotes: cargar el LoRA con diffusers y generar conjuntos de imagenes con prompts plantilla para un concepto fijo.
- Pruebas de compatibilidad Raw/Turbo: evaluar como se comporta un LoRA entrenado en Krea 2 Raw al aplicarse sobre Krea 2 Turbo con `guidance_scale=0.0`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Krea 2 (no documentado en la informacion). El adaptador en si ocupa 0,8 GB en disco.
- GPU recomendadas: no disponibles en la informacion. El ejemplo de la model card usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, sin especificar GPU.
- Compatibilidad con GPU de consumo: no confirmada; depende de los requisitos de Krea 2 Turbo, no documentados aqui.
- Opciones de despliegue: diffusers (`Krea2Pipeline` + `load_lora_weights`), segun el snippet oficial. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no aplican a un modelo de difusion o no estan documentadas.
- Latencia y throughput: no disponibles; la model card indica generacion en 8 pasos sobre Turbo, pero sin tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanico/chelda | LoRA DreamBooth sobre Krea 2 | no disponible (0,8 GB) | no aplica | Apache 2.0 | Hugging Face (0 descargas) |
| krea/Krea-2-Raw | Modelo base texto-a-imagen | no disponible | no aplica | no disponible en esta informacion | Hugging Face (referenciado como base) |
| krea/Krea-2-Turbo | Modelo base texto-a-imagen destilado | no disponible | no aplica | no disponible en esta informacion | Hugging Face (referenciado como destino de inferencia) |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos base en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Informacion muy escasa: no se documentan hiperparametros, dataset ni evaluacion, lo que dificulta reproducir o auditar el entrenamiento.
- El adaptador solo funciona en conjuncion con Krea 2; no es utilizable de forma autonoma.
- El concepto aprendido esta ligado al token `chl`; fuera de ese disparador el comportamiento no esta garantizado.
- Riesgo de sobreajuste al concepto y de degradacion de la diversidad de las imagenes generadas, tipico de DreamBooth-LoRA, aunque no se cuantifica.
- No se documentan sesgos; al ser un LoRA sobre un modelo base de terceros, hereda los sesgos y limitaciones de Krea 2.
- Riesgo de alucinacion visual y de artefactos en la generacion, no evaluado.
- Licencia Apache 2.0 declarada para el adaptador; el uso comercial del modelo base Krea 2 debe verificarse por separado, ya que su licencia no se detalla en esta informacion.
- Sin descargas ni validacion comunitaria: no hay evidencia externa de calidad.
- Idiomas soportados no disponibles; los prompts de ejemplo estan en ingles.

## Enlaces

- Hugging Face: https://huggingface.co/Nanico/chelda
- Modelo base (Raw): https://huggingface.co/krea/Krea-2-Raw
- Modelo de inferencia (Turbo): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
