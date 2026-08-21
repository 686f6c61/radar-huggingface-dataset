# DetroitWobbly/Illuminate

## Resumen

Illuminate es un LoRA experimental de tipo "concept slider" (deslizador de concepto) para Stable Diffusion XL, desarrollado por DetroitWobbly. Su función es modificar de forma bidireccional la iluminación aparente de una imagen generada: los pesos positivos del LoRA empujan la generación hacia una escena iluminada, mientras que los negativos la oscurecen, manteniendo en gran medida el sujeto y la composición originales. El modelo se entrenó sobre el checkpoint base Juggernaut XL Ragnarok utilizando el proceso `concept_slider` de AI Toolkit, con una definición semántica simple: el polo positivo es "a woman in brightness", el negativo "a woman in darkness" y la clase objetivo "a woman". No requiere palabra desencadenante y funciona tanto en generación de texto a imagen como en img2img.

La relevancia de este modelo radica en su enfoque como experimento de control semántico mediante LoRA: en lugar de un operador de iluminación determinista, se trata de un adaptador que aprende una dirección de cambio en el espacio latente. Su rango de trabajo práctico se sitúa aproximadamente entre -4 y +4, y su efecto puede transferirse a sujetos y escenas fuera de la clase de entrenamiento, aunque con efectos colaterales variables. El repositorio ocupa 0.2 GB y no se han publicado datos cuantitativos de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Stable Diffusion XL |
| Parámetros totales | no disponible (el repositorio pesa 0.2 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generación de imágenes) |
| Tipos de cuantización | No aplica (los LoRA no se cuantizan) |
| Idiomas soportados | No disponible (el modelo no procesa texto; depende del checkpoint base) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (se infiere del tamaño del repositorio y del uso común en SDXL, aunque no se especifica explícitamente) |

## Arquitectura y entrenamiento

Illuminate es un LoRA de tipo concepto deslizante para SDXL. La arquitectura base es un U-Net dentro del pipeline de Stable Diffusion XL. El LoRA se entrena con el proceso `concept_slider` de AI Toolkit, que define dos polos semánticos (positivo y negativo) y una clase objetivo. El entrenamiento se realizó sobre el checkpoint `juggernautXL_ragnarokBy.safetensors` (SHA-256: `DD08FA32F98D05A2443CA1419E46DF1575A0811F6E3B246D9DD47FF20F5EB66A`).

Los detalles de la red LoRA son: rango lineal 32 y alfa 32; rango convolucional 16 y alfa 16. El entrenamiento duró 3.000 pasos con batch size 1, gradiente acumulado 1, optimizador AdamW8bit, tasa de aprendizaje 1e-4, weight decay 1e-4, precisión BF16, pérdida MSE, ruido DDPM y muestreo de timestep sigmoide. Se usó un ajuste balanceado de contenido/estilo, gradiente checkpointing activado, entrenamiento del U-Net activado y de los text encoders desactivado. EMA desactivado. Resoluciones de entrenamiento: 512, 768 y 1024. Caption dropout 0.05. No se usó trigger word.

La definición del deslizador: prompt positivo `a woman in brightness`, prompt negativo `a woman in darkness`, clase objetivo `a woman`, guía de fuerza 3, fuerza de ancla 1. El entrenamiento se evaluó con una semilla fija 42 y el prompt simple `a woman` con multiplicadores de LoRA -1, 0 y +1, 30 pasos y escala de guía 6.

## Capacidades

- Control bidireccional de iluminación: pesos positivos aumentan el brillo, negativos lo reducen, manteniendo en general el sujeto y la composición.
- Funciona sobre sujetos humanos, escenas ambientales, objetos y entornos fuera de la clase de entrenamiento (testeado en personas, entornos y entradas img2img).
- No requiere palabra desencadenante; se carga como un LoRA normal con el formato `<lora:Illuminate_v1:peso>`.
- Rango de pesos útil de -4 a +4, con efectos progresivos.
- Compatible con flujos de trabajo img2img, especialmente con fuerzas de denoise bajas para modificar la iluminación sin alterar la composición.
- Funciona como experimento de control semántico: permite investigar la separación de conceptos visuales en el espacio latente.
- Capacidad de transferencia entre distintos checkpoints de SDXL, aunque de forma experimental y con variaciones.

## Casos de uso

- **Ajuste de iluminación en retratos**: el usuario puede aplicar un peso positivo para iluminar un rostro o un peso negativo para crear un ambiente más oscuro, sin cambiar la pose ni el fondo. Es útil para variaciones creativas en retratos generados.
- **Modificación de atmósfera en escenas**: en entornos, el deslizador puede convertir una escena diurna en nocturna o viceversa, facilitando la creación de ambientes diferentes para ilustraciones o concept art.
- **Edición de imágenes existentes mediante img2img**: al aplicar el LoRA con denoising bajo, se puede ajustar la iluminación de una imagen generada previamente o de una fotografía, manteniendo la estructura original.
- **Control de tono en composiciones mixtas**: combinado con otros LoRA de estilo o personaje, permite afinar la iluminación sin interferir en el estilo general, siempre que se pruebe la interacción.
- **Exploración de control semántico**: como herramienta de investigación, permite estudiar la separación de conceptos visuales en el espacio latente de SDXL, y su comportamiento a pesos extremos.
- **Generación de variaciones en lotes**: al mantener prompt y semilla fijos y variar el peso del LoRA, se pueden producir una serie de imágenes con la misma composición pero distintas iluminaciones, útil para selección de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (como FID, CLIP score, etc.) en la información disponible. El autor describe una evaluación cualitativa mediante barridos de pesos, con observaciones sobre preservación del sujeto, composición, contraste, sombras y artefactos en pesos extremos, pero sin datos numéricos. Por tanto, no se pueden presentar tablas comparativas de rendimiento.

## Requisitos de hardware

- **VRAM estimada**: al ser un LoRA de SDXL, requiere la VRAM necesaria para ejecutar el modelo base SDXL, típicamente entre 8 GB y 12 GB según la resolución y el uso de cuantización. El LoRA en sí ocupa muy poca memoria adicional (0.2 GB).
- **GPU recomendadas**: cualquier GPU compatible con SDXL, como NVIDIA RTX 3060 (12 GB), RTX 3080, RTX 4090, o GPUs profesionales como A100. Para inferencia rápida, se recomienda al menos 16 GB de VRAM.
- **En consumer GPU**: sí, funciona en GPUs de consumo como RTX 3060, RTX 4070, etc., siempre que tengan suficiente VRAM para el modelo base.
- **Opciones de despliegue**: se puede integrar en pipelines de generación de imágenes como ComfyUI, Automatic1111 WebUI, o usar con bibliotecas como Diffusers. No se menciona compatibilidad con vLLM, Ollama o TGI, ya que no es un modelo de texto.
- **Latencia y throughput**: no disponible; depende de la GPU y del checkpoint base.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRAs de iluminación con características comparables en la información proporcionada. Existen otras herramientas de control de iluminación en SDXL (como controladores de profundidad o de condiciones de iluminación), pero no se han proporcionado datos de comparación. Se indica "no disponible".

## Limitaciones y advertencias

- **Efecto no determinista**: el LoRA es un control aprendido, no un operador matemático de iluminación. Su resultado depende del checkpoint base, del prompt, del CFG, del sampler y de otros LoRAs cargados.
- **Efectos colaterales**: a pesos elevados (superiores a ±4), se producen cambios en contraste, color, renderizado, fondo y otros detalles de la imagen. El deslizador no es un eje de iluminación perfectamente aislado.
- **Compatibilidad entre checkpoints**: la transferencia a otros modelos base es experimental y debe evaluarse independientemente. Puede funcionar bien en algunos checkpoints y mal en otros.
- **Sesgos de entrenamiento**: al estar entrenado sobre la clase "a woman", el efecto podría ser más robusto en sujetos femeninos que en otros tipos de sujetos, aunque se ha testeado en entornos y objetos.
- **Licencia**: no se ha especificado la licencia del modelo. Esto implica una incertidumbre para uso comercial o redistribución. Se recomienda contactar al autor para obtener aclaraciones.
- **Alucinación**: no aplica directamente a un modelo de imágenes, pero el LoRA puede generar artefactos o cambios no deseados en la composición cuando se aplica a pesos extremos.

## Enlaces

- [DetroitWobbly/Illuminate en Hugging Face](https://huggingface.co/DetroitWobbly/Illuminate)

No se han encontrado otros enlaces relevantes (papers, repositorios, demos) en la información proporcionada.
