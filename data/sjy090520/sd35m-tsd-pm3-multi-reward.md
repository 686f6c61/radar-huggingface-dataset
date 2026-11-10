# sjy090520/sd35m-tsd-pm3-multi-reward

## Resumen

`sd35m-tsd-pm3-multi-reward` es un adaptador LoRA experimental para el modelo de difusion de texto a imagen Stable Diffusion 3.5 Medium de Stability AI. Lo publica el usuario `sjy090520` en Hugging Face y no constituye un modelo completo: requiere el modelo base `stabilityai/stable-diffusion-3.5-medium` y hereda sus terminos de licencia. Su proposito es la investigacion en ajuste fino mediante aprendizaje por refuerzo multiobjetivo sobre tareas de generacion de imagenes condicionadas a prompts.

El checkpoint publicado corresponde a la rama `geneval-ocr-1to1/checkpoint-300`, reanudada desde el paso 280 y ampliada con 20 actualizaciones adicionales que mezclan prompts de GenEval y OCR a ratio 1:1 (72 prompts por fuente y ronda, distribuidos en 8 GPU). Se mantienen activos cinco objetivos de recompensa (PickScore, HPSv2, CLIPScore, GenEval y OCR), combinados mediante normalizacion MGDA exacta por ronda. El propio autor lo describe como un checkpoint experimental y no como un modelo validado ni un mejor modelo.

El interes del artefacto es metodologico: documenta una receta de RL para difusion con LoRA de rango 32, 10 pasos de muestreo, CFG 1, fusion de extremos pm3 con tope de norma y perdida de velocidad uniforme. El repositorio ocupa 0,2 GB e incluye pesos PEFT, configuracion, `optimizer.pt` y `scaler.pt` para continuar el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el transformer de SD3.5 Medium (diffusion transformer, modelo base no incluido) |
| Parametros totales | no disponible (adaptador LoRA; rango 32, alpha 64) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen, sin contexto de texto medido en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo; se aplican los terminos del modelo base `stabilityai/stable-diffusion-3.5-medium` |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); incluye `optimizer.pt` y `scaler.pt` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el transformer de difusion de Stable Diffusion 3.5 Medium mediante LoRA de rango 32 y alpha 64. El entrenamiento emplea 10 pasos de muestreo, CFG 1, muestreo uniforme K8 y fusion de extremos pm3 con tope de norma, junto con una perdida de velocidad uniforme y semilla 0. Los gradientes especificos de cada recompensa se combinan con normalizacion MGDA exacta por ronda, un enfoque inspirado en MARBLE que, segun el autor, no reproduce la implementacion oficial de NFT amortizado y no usa cache/EMA de alpha ni divergencia KL explicita contra un modelo de referencia.

La procedencia del checkpoint es la rama `geneval-ocr-1to1/checkpoint-300`: reanudada en el paso 280 y con 20 actualizaciones adicionales sobre prompts de GenEval y OCR a ratio 1:1 (72 prompts por fuente y ronda en 8 GPU). Los cinco objetivos de recompensa (PickScore, HPSv2, CLIPScore, GenEval y OCR) permanecen activos, aplicandose las recompensas especialistas solo a muestras compatibles. La ejecucion padre mezclaba tres fuentes de prompts equiponderadas: PickScore, OCR y GenEval.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) sobre el modelo base SD3.5 Medium, una vez cargado el adaptador LoRA.
- Ajuste guiado por multiples recompensas: PickScore, HPSv2, CLIPScore, GenEval y OCR, orientado a mejorar preferencia estetica, alineamiento prompt-imagen, composicion y legibilidad de texto en imagen.
- Optimizacion especifica para prompts de GenEval y OCR en el checkpoint publicado.
- Compatible con la libreria `diffusers` y con el ecosistema PEFT para cargar el adaptador sobre el transformer del modelo base.
- Continuacion del entrenamiento: el repositorio incluye `optimizer.pt` y `scaler.pt` para reanudar con el codigo original (sin capturar todo el estado aleatorio ni de datos).
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento.

## Casos de uso

- Investigacion en RL para difusion: reproducir o continuar la receta de entrenamiento multiobjetivo con MGDA sobre SD3.5 Medium, usando el adaptador y los estados de optimizador incluidos.
- Experimentacion con recompensas especialistas: evaluar el efecto de PickScore, HPSv2, CLIPScore, GenEval y OCR aplicadas solo a muestras compatibles en la calidad de generacion.
- Estudio de composicion de escenas: analizar si el ajuste con prompts GenEval mejora el cumplimiento de relaciones espaciales y conteo, comparando contra el modelo base.
- Generacion de texto en imagen: probar el efecto del objetivo OCR sobre la legibilidad de rotulos, aunque el autor advierte de errores composicionales y estilos visuales repetidos.
- Linea base para ablaciones: usar este checkpoint como referencia experimental frente a otras combinaciones de recompensas o hiperparametros (rango LoRA, pasos de muestreo, CFG).
- Docencia y divulgacion tecnica: ilustrar un pipeline de RL multiobjetivo sobre un modelo de difusion con LoRA, con trazabilidad de la procedencia del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reclama ninguna calidad sobre datos reservados (held-out) y que se han observado texto adicional, estilos visuales repetidos y errores composicionales.

## Requisitos de hardware

- El adaptador ocupa 0,2 GB; el modelo base SD3.5 Medium debe cargarse aparte y es el que determina los requisitos reales de VRAM.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada (depende del modelo base y de la precision de carga).
- GPU recomendadas: no disponible; el entrenamiento documentado se ejecuto en 8 GPU, sin especificar modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `diffusers` (carga del adaptador PEFT sobre el transformer) y cualquier runtime compatible con el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion en este contexto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sd35m-tsd-pm3-multi-reward | LoRA sobre SD3.5 Medium | adaptador rango 32 (base no incluido) | no disponible | la del modelo base | Hugging Face, 0 descargas |
| stabilityai/stable-diffusion-3.5-medium | Modelo base text-to-image | no disponible en la informacion | no disponible | licencia de Stability AI | Hugging Face |
| Otros adaptadores LoRA de RL sobre SD3.5 | LoRA | no disponible | no disponible | variable | no disponible |

No se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo completo: sin el modelo base `stabilityai/stable-diffusion-3.5-medium` no funciona, y se aplican los terminos de licencia del base.
- Licencia del adaptador no especificada en el repositorio; verificar la del modelo base antes de cualquier uso comercial.
- Checkpoint experimental: el autor no lo valida como mejor modelo ni reclama calidad sobre datos reservados.
- Se han observado texto adicional, estilos visuales repetidos y errores composicionales.
- La combinacion de recompensas usa MGDA inspirada en MARBLE, sin implementacion oficial de NFT amortizado, sin cache/EMA de alpha y sin KL explicito contra modelo de referencia; los resultados pueden no ser comparables con otros pipelines de RL.
- `optimizer.pt` y `scaler.pt` no capturan todo el estado aleatorio ni de datos, por lo que la continuacion exacta del entrenamiento no esta garantizada.
- Sin datos publicados de sesgos, idiomas soportados ni evaluacion multilingue.
- Riesgo de alucinacion visual y de sobreajuste a los prompts de GenEval/OCR usados en el ajuste.
- Sin descargas ni likes en el momento de la consulta: no hay validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/sjy090520/sd35m-tsd-pm3-multi-reward
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
