# Arekkusul/krea-2-raw-distill-lora

## Resumen

Este repositorio contiene un adaptador LoRA para `krea/Krea-2-Raw`, el modelo de difusion (DiT) de 12B sin destilar que hay detras de Krea 2. Lo desarrolla el usuario Arekkusul y su proposito es concreto: reducir a la mitad el numero de pasos de muestreo (de 52 a 26) manteniendo la composicion y el detalle del modelo base completo, segun la validacion del propio autor sobre prompts no vistos en entrenamiento.

No es un modelo independiente ni una version de Krea 2 Turbo, que es un modelo destilado aparte de 8 pasos y sin CFG. Se trata de una destilacion progresiva de una sola etapa (metodo de Salimans y Ho, 2022) aplicada como LoRA, entrenada con un unico Mac mini M4 Pro y sin GPU en la nube, como alternativa para quien dispone de un checkpoint Raw convertido pero no del checkpoint Turbo oficial.

Su relevancia es mas metodologica que de producto: demuestra que es viable reducir pasos de un DiT de flujo continuo en hardware de consumo (Apple Silicon) con recursos muy limitados, aunque con una validacion todavia muy estrecha. El repositorio ocupa 0,1 GB y hereda la licencia comunitaria de Krea 2, restringida a uso personal y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) single-stream de flow matching; el adaptador es un LoRA sobre el modelo base |
| Parametros totales | 12B en el modelo base `krea/Krea-2-Raw`; el adaptador LoRA (rank 16) no declara recuento propio |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community (uso personal/no comercial, con obligacion de filtrado de contenido para desplegadores) |
| Formato de pesos | LoRA en formato Diffusers/PEFT (nomenclatura `.lora_a`/`.lora_b`, metadatos `alpha`/`rank`) |

## Arquitectura y entrenamiento

El modelo base es un DiT single-stream de flow matching de 12B parametros, con dimension oculta de 6144, 28 bloques transformer y atencion con GQA de 48 cabezas de consulta y 12 de clave/valor. El LoRA se aplica sobre los modulos `to_q`, `to_k`, `to_v` y `to_out.0` de los 28 bloques (112 objetivos en total), con rank 16 y alpha 16, que es la superficie de atencion estandar de PEFT.

El entrenamiento usa destilacion progresiva de una sola etapa (Salimans y Ho, 2022) adaptada para ejecutarse en un solo Mac con memoria unificada, sin una segunda copia entrenable del modelo residente. En cada paso, el latente VAE de una foto real mas ruido aleatorio define un punto en la trayectoria de flow matching; el modelo base congelado (sin LoRA) actua como profesor dando dos pasos Euler pequenos de referencia, y el modelo con LoRA actua como estudiante dando un unico paso Euler que cubre el mismo tramo. La perdida es el MSE entre ambos y la retropropagacion solo atraviesa los factores LoRA. El autor descarto cinco metodos de destilacion de pocos pasos (TDM, Hyper-SD, RAPM, LCM-LoRA y la cascada completa de destilacion progresiva) por requerir dos o tres copias del modelo en memoria o cientos de horas de GPU.

Los datos de entrenamiento son 12 imagenes autogeneradas de 1024x1024 con tematicas variadas (retrato, animal, comida, paisaje, interior, bodegon), sin imagenes externas con derechos de autor. Se entrenaron 800 pasos con tamano de lote 1, optimizador AdamW, tasa de aprendizaje 1e-4 y recorte de norma de gradiente a 1,0, a unos 110-130 segundos por paso en un Apple M4 Pro con 64 GB de memoria unificada. La perdida final fue de 0,0015.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) dentro del pipeline de Krea 2 Raw.
- Reduccion del numero de pasos de muestreo de 52 a 26 conservando composicion y detalle, segun la validacion del autor sobre prompts no vistos en entrenamiento.
- Funcionamiento con escala de guia (guidance scale) recomendada de 3,5, coherente con las condiciones de entrenamiento.
- No dispone de tool calling ni function calling.
- No esta orientado a agentes ni a razonamiento multi-paso.
- No tiene entrada de vision ni salida de audio; es exclusivamente un generador de imagenes.
- No se declaran capacidades multilingues ni idiomas soportados.
- No incorpora modo de razonamiento (thinking mode) ni capacidades especiales adicionales.
- Combinacion con el modelo base mediante cualquier cargador de LoRA compatible con Krea 2 Raw.

## Casos de uso

- Prototipado rapido de imagenes en estudio: al reducir los pasos de 52 a 26, se recorta aproximadamente a la mitad el tiempo de generacion por imagen, lo que facilita iterar sobre variaciones de una composicion antes de fijar una version final.
- Iteracion de concept art: el modelo permite generar bocetos de alta fidelidad de forma mas agil que el baseline de 52 pasos, util cuando el artista necesita explorar muchas direcciones visuales en poco tiempo.
- Generacion de mockups de producto: para escenas de bodegon y still life, el LoRA mantiene el detalle de texturas y composicion del modelo base, segun los prompts de validacion empleados (taza de cafe y escena de bicicleta con ladrillo e hiedra).
- Ilustracion editorial y contenido grafico: sirve para producir imagenes de apoyo en flujos donde la velocidad de muestreo importa, siempre que se respete la licencia no comercial.
- Pruebas de pipeline en hardware de consumo: al haberse entrenado enteramente en un Mac mini M4 Pro, es un punto de partida realista para quienes trabajan con Apple Silicon y no disponen de GPU en la nube.
- Investigacion sobre destilacion de modelos de difusion: el repositorio documenta un metodo reproducible de destilacion en una etapa sobre arquitecturas de flow matching, util como referencia para experimentos academicos.
- Despliegue en entornos con recursos limitados o sin acceso a GPU de datacenter, aprovechando la reduccion de pasos para bajar el coste computacional por inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada consiste en dos prompts reservados (un bodegon con taza de cafe y una escena detallada de bicicleta, ladrillo e hiedra) evaluados a lo largo de dos ejecuciones de entrenamiento (conjuntos de 6 y 12 imagenes), sin metricas cuantitativas publicadas (FID, CLIP, etc.).

## Requisitos de hardware

- Entrenamiento verificado: un unico Apple Mac mini M4 Pro con 64 GB de memoria unificada, a 110-130 segundos por paso durante 800 pasos.
- Inferencia: depende del modelo base de 12B. A partir del recuento de parametros (estimacion propia, no confirmada por el autor), los pesos en bf16 ocuparian en torno a 24 GB, en fp8/int8 unos 12 GB y en int4 unos 6 GB, a lo que habria que sumar el codificador de texto y el VAE.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el modelo base encaja en GPU de datacenter (A100, H100) y, en cuantizaciones bajas, podria acercarse a GPU de consumo de gama alta, aunque no hay cifras oficiales.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: el adaptador se distribuye en formato Diffusers/PEFT y se carga con cualquier cargador de LoRA compatible con Krea 2 Raw; no se detallan soportes especificos de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la unica referencia temporal es la del entrenamiento en Apple Silicon, no la de inferencia.

## Comparativa con modelos similares

| Modelo | Pasos de muestreo | CFG | Parametros | Licencia | Notas |
|---|---|---|---|---|---|
| `krea/Krea-2-Raw` (base) | 52 | Si (escala de guia recomendada 3,5 para el LoRA) | 12B | krea-2-community | Baseline sin destilar; calidad y detalle de referencia |
| Este LoRA sobre Krea-2-Raw | 26 | Si | 12B + LoRA | krea-2-community | Reduccion de ~2x pasos; validado solo en 2 prompts |
| Krea 2 Turbo | 8 | No (CFG-free) | no disponible | no disponible | Modelo destilado independiente (TDM) con ~6,5x menos pasos; no alcanzable desde Raw con un LoRA |

## Limitaciones y advertencias

- Entrenado con un conjunto de solo 12 imagenes, por lo que puede no generalizar igual de bien a todo tipo de contenido, estilo o resolucion.
- Validacion limitada a 2 prompts reservados, no a una evaluacion exhaustiva de calidad.
- No es Krea 2 Turbo: es una reduccion de pasos de aproximadamente 2x, frente al salto de ~6,5x de Turbo, y no debe esperarse su velocidad ni su calidad.
- El modelo base presenta un artefacto preexistente dependiente del contenido a pasos reducidos; el autor confirma mediante pruebas de aislamiento que el LoRA no lo causa ni lo empeora, pero sigue siendo una caracteristica del base que conviene conocer.
- Licencia krea-2-community: uso gratuito solo para fines personales y no comerciales, con obligacion de filtrado de contenido para los desplegadores.
- No se documentan sesgos concretos ni comportamiento multilingue, ya que no hay informacion sobre el codificador de texto ni sobre los idiomas admitidos.
- No se han publicado datos de cuantizacion, benchmarks ni requisitos oficiales de hardware, lo que dificulta planificar un despliegue en produccion.
- Riesgo de alucinacion visual (artefactos o incoherencias en la imagen generada) inherente a los modelos de difusion; no cuantificado en esta ficha.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Arekkusul/krea-2-raw-distill-lora
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Licencia (LICENSE.pdf): https://huggingface.co/Arekkusul/krea-2-raw-distill-lora/blob/main/LICENSE.pdf
- Paper de referencia del metodo (Salimans y Ho, 2022, "Progressive Distillation for Fast Sampling of Diffusion Models"): https://arxiv.org/abs/2202.00512
