# agentory/Qwen-Image-2.1-viggle-turbo

## Resumen

Qwen-Image-2.1-viggle-turbo es un adaptador LoRA de destilación few-step para el modelo de difusión texto-a-imagen Qwen/Qwen-Image-2.1, desarrollado por Viggle (publicado en HuggingFace bajo el namespace `agentory`). Su propósito es reducir el coste de inferencia del modelo base: permite generar imágenes en 6 pasos en lugar de los 40 habituales y sin classifier-free guidance (CFG), lo que se traduce en una aceleración de aproximadamente 5x de extremo a extremo manteniendo una calidad muy cercana a la del modelo original en la mayoría de prompts.

El adaptador se distribuye como LoRA de rango 256 en bf16 (1,3 GB) que se carga sobre el transformer del modelo base en tiempo de ejecución, junto con variantes de rango 128 (0,7 GB), formatos pre-fusionados int8/fp8, cuantizaciones GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M) para ComfyUI y nodos personalizados. La versión documentada es la v0.3 (2026-09-29), que además introduce un modo de 9 pasos en el que los 7 primeros se ejecutan con el LoRA turbo y los 2 últimos con el modelo base sin LoRA para recuperar detalle fino y precisión en texto pequeño.

El modelo hereda la arquitectura del base Qwen-Image-2.1 (un transformer de difusión con 7.115.124.736 parámetros totales según los pesos safetensors) y está pensado para flujos de trabajo de generación y edición de imágenes por instrucciones con 1-3 imágenes de referencia. Su relevancia actual radica en que hace viable desplegar un modelo de imagen de gran tamaño en hardware más modesto y con latencias compatibles con producción interactiva, a costa de una licencia de investigación (`qwen-research`) que limita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (modelo base Qwen-Image-2.1); adaptador LoRA de destilación few-step |
| Parametros totales | 7.115.124.736 (transformer del modelo base fusionado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (LoRA r256 y r128), int8_convrot, fp8_e4m3fn, GGUF Q8_0 / Q6_K / Q5_K_M / Q4_K_M |
| Idiomas soportados | no disponible (modelo texto-a-imagen; los prompts dependen del encoder de texto del base) |
| Licencia | qwen-research (license: other, license_name: qwen-research) |
| Formato de pesos | safetensors (LoRA y transformer fusionado), GGUF, formato PEFT (`peft_v0.3/`) |

## Arquitectura y entrenamiento

El modelo no es un modelo completo, sino un adaptador LoRA de destilación que se aplica sobre el transformer del modelo de difusión Qwen-Image-2.1. La destilación reduce el número de pasos de muestreo de 40 a 6 y elimina la necesidad de classifier-free guidance (`true_cfg_scale=1.0`), lo que recorta a la mitad el coste por paso al no duplicar el batch para la rama negativa. El LoRA principal tiene rango 256 en bf16 (1,3 GB); existe una variante de rango 128 (0,7 GB) usada por los flujos de ComfyUI. El scheduler es un `FlowMatchEulerDiscreteScheduler` con `shift_terminal: null` y una lista de sigmas fija de 6 valores (`[1.0, 0.9375, 0.875, 0.75, 0.5, 0.25]`).

La innovación principal es el modo de 9 pasos: se ejecutan 7 pasos con el LoRA turbo activo y, a continuación, se desactiva el LoRA y el modelo base completa los 2 últimos pasos. Esto requiere reextraer el caché K/V de texto y referencias (que en los primeros pasos proviene del turbo) mediante el hook `kv_cache_mode="extract"` documentado en la model card. El resultado es mayor detalle fino y mejor precisión en texto pequeño, con un coste de 1,4-1,5x respecto al modo de 6 pasos (aún ~3,5x más rápido que el base). El autor indica que la v0.3 de 6 pasos está cerca de su capacidad: cada mejora en nitidez implicaba más grano, y cada reducción de grano implicaba una imagen más suave, por lo que mejoras adicionales requerirían más pasos. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición del dataset de destilación.

## Capacidades

- Generación de imágenes texto-a-imagen en 6 pasos (o 9 pasos en el modo híbrido) con calidad cercana al modelo base de 40 pasos.
- Edición de imágenes guiada por instrucciones con 1-3 imágenes de referencia, referenciables como `<image1>`, `<image2>`, etc. según el orden de la lista.
- Generación sin classifier-free guidance (`true_cfg_scale=1.0`), lo que reduce el coste computacional por paso.
- Soporte de resolución de salida configurable (por ejemplo, 1024x1024 en texto-a-imagen y `output_resolution=1024` en edición).
- Distribución en múltiples formatos: LoRA PEFT, transformer fusionado en int8/fp8 y GGUF para ComfyUI.
- Integración con nodos personalizados de ComfyUI y flujos de trabajo texto-a-imagen y edición incluidos en el repositorio.
- Reutilización de caché K/V de texto y referencias entre pasos, con modo `extract` para el cambio de modelo en el modo de 9 pasos.
- No se documentan capacidades de tool calling, agentes, audio ni visión más allá del uso de imágenes de referencia para edición.

## Casos de uso

- Generación de imágenes en producción interactiva: con 6 pasos y sin CFG, el modelo permite servir peticiones texto-a-imagen con una latencia aproximadamente 5x menor que el base de 40 pasos, adecuado para interfaces web donde el usuario espera la imagen en pocos segundos.
- Edición de imágenes por instrucciones en herramientas de retoque: el soporte de 1-3 imágenes de referencia y prompts como "reemplaza el fondo por una playa al atardecer, mantén el sujeto" permite construir editores conversacionales que conservan la identidad del sujeto.
- Prototipado rápido en ComfyUI: los archivos GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M) y los nodos personalizados incluidos permiten montar un pipeline funcional en ComfyUI sin escribir código, útil para artistas y diseñadores que iteran sobre prompts.
- Despliegue en hardware consumer: las cuantizaciones GGUF e int8/fp8 reducen el footprint del transformer de 7,1B parámetros, lo que facilita ejecutar el modelo en GPUs de gama alta de consumo en lugar de exigir aceleradores de datacenter.
- Generación de material gráfico para marketing y e-commerce: la velocidad de 6 pasos permite generar variantes de banners, fondos de producto o escenas con imágenes de referencia del producto en lotes grandes.
- Investigación en destilación de modelos de difusión: el repositorio conserva las versiones v0.2, v0.2.1 y v0.3 con distintos equilibrios de grano/nitidez, lo que sirve como material de estudio para comparar estrategias de destilación few-step.
- Edición por lotes con imagen de referencia: el modo de 9 pasos, aunque más lento (1,4-1,5x), mejora la precisión en texto pequeño, útil para tareas donde el texto renderizado debe ser legible, como carteles o mockups.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta comparaciones cualitativas: aproximadamente 5x más rápido que el modelo base de 40 pasos en 6 pasos, y aproximadamente 3,5x más rápido en el modo de 9 pasos. No se proporcionan métricas numéricas tipo FID, CLIP score, MMLU ni HumanEval (no aplicables a un modelo de imagen).

## Requisitos de hardware

- El transformer del modelo base tiene 7.115.124.736 parámetros; en bf16 ocupa aproximadamente 14,2 GB solo en pesos, a lo que hay que sumar el encoder de texto, el VAE y las activaciones.
- El LoRA turbo añade 1,3 GB (r256 bf16) o 0,7 GB (r128 bf16) sobre el transformer.
- Las variantes pre-fusionadas int8_convrot y fp8_e4m3fn reducen el footprint del transformer respecto a bf16, y las GGUF Q8_0 a Q4_K_M lo reducen aún más, siendo las más adecuadas para GPUs consumer.
- GPU recomendadas: no se especifican en la información disponible; por el tamaño del base, se requiere al menos una GPU con suficiente VRAM para el transformer completo en bf16 o una de sus cuantizaciones. No se confirma compatibilidad con GPUs consumer concretas.
- Opciones de despliegue: diffusers (con `QwenImage21Pipeline`, requiere instalación desde un commit concreto de git), ComfyUI (nodos personalizados y GGUF), y PEFT para cargar el adaptador.
- Latencia y throughput: no se publican cifras absolutas; solo la relación relativa de ~5x (6 pasos) y ~3,5x (9 pasos) frente al base de 40 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos | CFG | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-viggle-turbo (v0.3) | 7,1B (base) + LoRA | 6 (o 9 híbrido) | No | qwen-research | HuggingFace (`agentory/...`) |
| Qwen/Qwen-Image-2.1 (base) | 7,1B | 40 | Sí | qwen-research | HuggingFace (`Qwen/...`) |
| v0.2.1 de Viggle | 7,1B (base) + LoRA | 6 | No | qwen-research | Incluido en el mismo repo |
| v0.2 de Viggle | 7,1B (base) + LoRA | 6 (documentado como 5-step) | No | qwen-research | Incluido en el mismo repo |

No se dispone de información sobre otros adaptadores few-step comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Licencia `qwen-research`: restringe el uso comercial; es imprescindible revisar el archivo LICENSE antes de desplegar en producción.
- El modo de 6 pasos está cerca de su capacidad según el autor: mejoras adicionales de calidad requieren más pasos (modo de 9) o aceptar compromisos entre nitidez y grano.
- El texto pequeño y denso, así como las ediciones complejas, son los puntos donde la brecha con el modelo base es más clara; el modo de 9 pasos lo mitiga pero no lo elimina ("not always").
- El modo de 9 pasos solo funciona en diffusers y en el Space de demostración, no en ComfyUI según la documentación.
- Requiere `QwenImage21Pipeline`, que no está en una versión publicada de diffusers; hay que instalar desde un commit concreto de git, lo que añade fragilidad al despliegue.
- El adaptador depende del modelo base Qwen/Qwen-Image-2.1; no es un modelo autónomo y hereda sus sesgos y riesgos de alucinación visual (artefactos, anatomías incorrectas, texto mal renderizado).
- No se documentan idiomas soportados ni evaluación multilingüe de los prompts.
- Riesgo de sobreajuste al estilo del dataset de destilación: la diversidad se mantiene "cercana a la del base" según el autor, pero no se cuantifica.
- El repositorio ocupa 104,9 GB e incluye múltiples versiones y formatos; conviene descargar solo los archivos necesarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentory/Qwen-Image-2.1-viggle-turbo
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Space de demostración (con pestaña Comparison): https://huggingface.co/spaces/Viggle/Qwen-Image-2.1-viggle-turbo
- Repositorio del autor en HuggingFace (referenciado en la model card): https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Diffusers (instalación desde commit concreto): https://github.com/huggingface/diffusers
- Vídeo promocional: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo/resolve/main/assets/viggle_turbo_promo.mp4
