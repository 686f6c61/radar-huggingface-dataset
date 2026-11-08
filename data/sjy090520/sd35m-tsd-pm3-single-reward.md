# sjy090520/sd35m-tsd-pm3-single-reward

## Resumen

`sd35m-tsd-pm3-single-reward` es un archivo de investigación publicado por el usuario sjy090520 en Hugging Face que contiene tres ejecuciones independientes de ajuste fino mediante aprendizaje por refuerzo sobre el modelo base `stabilityai/stable-diffusion-3.5-medium`. No se trata de un modelo completo, sino de adaptadores LoRA entrenados con una única función de recompensa por ejecución: PickScore, OCR y GenEval. El método empleado se describe como "uniform K8, pm3 endpoint teacher fusion with norm cap, uniform velocity loss", con semilla 0, 10 pasos de muestreo durante el entrenamiento y escala CFG de 1.

El interés de este artefacto es fundamentalmente metodológico: permite reproducir y comparar el efecto de distintas recompensas sobre un mismo backbone de difusión, algo relevante para investigadores que trabajan en alineamiento de modelos texto-a-imagen mediante RL. El repositorio ocupa 3,4 GB e incluye, además de los pesos LoRA, ficheros de estado del optimizador y del scaler para continuar el entrenamiento con el código original.

No hay resultados de evaluación publicados, ni se designa un checkpoint "mejor", ni se aportan métricas held-out. El autor lo presenta explícitamente como un archivo de investigación, no como un modelo listo para producción. La licencia no está declarada en la ficha, aunque se indica que se aplican los términos del modelo base SD3.5 Medium.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Stable Diffusion 3.5 Medium (transformer de difusión multimodal, MMDiT) |
| Parametros totales | no disponible (adaptadores LoRA; el base SD3.5 Medium tiene 2,5 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, no aplica contexto textual de LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible en la ficha; se aplican los terminos de stabilityai/stable-diffusion-3.5-medium |
| Formato de pesos | safetensors (adaptador LoRA) + optimizer.pt + scaler.pt |

## Arquitectura y entrenamiento

El modelo base es Stable Diffusion 3.5 Medium, un transformer de difusión (MMDiT) de 2,5 mil millones de parámetros que combina atención multimodal entre flujos de texto e imagen. Sobre él se aplican adaptadores LoRA entrenados mediante aprendizaje por refuerzo con una recompensa única por ejecución. El método se describe como "uniform K8, pm3 endpoint teacher fusion with norm cap, uniform velocity loss", con semilla 0, 10 pasos de muestreo y CFG de 1 durante el entrenamiento. No se especifican el número de tokens de entrenamiento, la composición del dataset ni detalles sobre el proceso de RL (por ejemplo, si se usa policy gradient, DPO o variantes de preference optimization).

El archivo contiene tres ejecuciones separadas: PickScore (checkpoints en las rondas 50, 100, 150, 200, 250 y 300), OCR (un único checkpoint en la ronda 20) y GenEval (checkpoints en las rondas 20, 40, 60, 80, 100, 120, 140 y 160, con una ejecución reiniciada el 7 de noviembre de 2026). Los números de checkpoint son etiquetas de ronda de entrenamiento, no métricas de calidad. Cada checkpoint incluye `lora/adapter_config.json`, `lora/adapter_model.safetensors`, `optimizer.pt` y `scaler.pt`; el autor advierte que estos ficheros de estado no garantizan la continuación exacta de todos los estados de entrenamiento.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por el backbone SD3.5 Medium, con el sesgo inducido por la recompensa específica de cada checkpoint.
- Ajuste orientado a preferencia estética mediante PickScore (checkpoints 50 a 300).
- Ajuste orientado a fidelidad de texto en imagen (OCR) mediante el checkpoint de la ronda 20.
- Ajuste orientado a métricas de composición y alineamiento tipo GenEval (checkpoints 20 a 160).
- Compatible con la librería `diffusers` y con el pipeline de SD3.5 Medium.
- No soporta tool calling, agentes, razonamiento multi-paso ni modo thinking; es un modelo de difusión, no un LLM.
- Capacidades multilingües: no disponibles (el texto de condicionamiento depende del codificador de texto de SD3.5 Medium).

## Casos de uso

- Investigación en alineamiento de modelos de difusión: comparar el efecto de tres recompensas distintas (PickScore, OCR, GenEval) sobre el mismo backbone y con la misma semilla, para aislar la contribución de la señal de recompensa.
- Reproducción de experimentos de RL para texto-a-imagen: los ficheros `optimizer.pt` y `scaler.pt` permiten reanudar el entrenamiento con el código original, útil para verificar resultados o extender las rondas.
- Estudio de la evolución del ajuste por rondas: la secuencia de checkpoints de PickScore (50 a 300) y GenEval (20 a 160) permite trazar curvas de calidad frente a pasos de entrenamiento.
- Análisis de especialización por tarea: comparar el checkpoint OCR (fidelidad de texto renderizado) con los de PickScore (estética) para estudiar trade-offs entre objetivos.
- Base para experimentos de fusión de profesores: el método "teacher fusion with norm cap" puede replicarse o modificarse sobre estos adaptadores como punto de partida.
- Docencia y formación: material didáctico para explicar cómo se aplica RL con recompensas únicas sobre modelos de difusión y cómo se estructuran los artefactos de entrenamiento (LoRA, optimizer, scaler).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el archivo no designa un mejor checkpoint ni reclama resultados de evaluación held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para estos adaptadores; depende del backbone SD3.5 Medium (2,5 mil millones de parámetros). Como referencia orientativa del base, la inferencia en fp16 requiere del orden de 8 a 12 GB de VRAM, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; depende del backbone y de la cuantización aplicada, que no se detalla.
- Opciones de despliegue: `diffusers` (librería declarada); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sd35m-tsd-pm3-single-reward | LoRA RL sobre SD3.5 Medium | No disponible (base 2,5 mil millones) | No aplica | No disponible; se aplica la del base | Hugging Face, 0 descargas |
| stabilityai/stable-diffusion-3.5-medium | Modelo base texto-a-imagen | 2,5 mil millones | No aplica | Stability AI Community License | Hugging Face, ampliamente usado |
| Adaptadores LoRA de la comunidad sobre SD3.5 | LoRA supervisados o de estilo | Variable | No aplica | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo completo: requiere descargar y cargar `stabilityai/stable-diffusion-3.5-medium` y cumplir sus términos de licencia.
- No se declara licencia propia en la ficha; el uso comercial queda sujeto a la licencia del modelo base, que debe consultarse.
- No hay evaluación held-out ni métricas publicadas; no se puede afirmar que ningún checkpoint sea superior a otro.
- Los checkpoints son etiquetas de ronda de entrenamiento, no indicadores de calidad; el checkpoint de mayor número no es necesariamente el mejor.
- Los ficheros `optimizer.pt` y `scaler.pt` no garantizan la reanudación exacta del estado de entrenamiento, según el propio autor.
- Riesgo de sobreajuste a la recompensa única de cada ejecución (reward hacking), con posible degradación de otras cualidades no optimizadas.
- Sesgos heredados del backbone SD3.5 Medium y de los datasets de preentrenamiento, no caracterizados en esta ficha.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni informes de uso en producción.
- Idiomas soportados no declarados; el comportamiento multilingüe depende del codificador de texto del base.
- Fecha de creación declarada en 2026-11-08, lo que debe tenerse en cuenta al evaluar su vigencia.

## Enlaces

- Hugging Face: https://huggingface.co/sjy090520/sd35m-tsd-pm3-single-reward
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Librería diffusers: https://github.com/huggingface/diffusers
