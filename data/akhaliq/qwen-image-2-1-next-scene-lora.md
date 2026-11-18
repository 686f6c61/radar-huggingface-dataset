# akhaliq/Qwen-Image-2.1-Next-Scene-LoRA

## Resumen

Qwen-Image-2.1 · Next-Scene LoRA es un adaptador LoRA de rango 64 entrenado por akhaliq sobre el modelo base Qwen/Qwen-Image-2.1, un modelo unificado de generación y edición de imágenes. El adaptador enseña al modelo base una capacidad que no tenía de serie: la continuación cinematográfica de escenas, tomando un fotograma de entrada y una instrucción con formato de dirección de cámara para generar el siguiente plano manteniendo la coherencia de mundo, personajes y estilo.

El modelo resuelve un problema concreto en flujos de preproducción audiovisual y generación de storyboards: la necesidad de encadenar planos coherentes a partir de una sola imagen de referencia sin recurrir a un modelo de vídeo. Cada salida puede realimentarse como entrada de la siguiente iteración, construyendo secuencias de planos dirigidos. Es el port de la técnica next-scene al modelo base más reciente de Qwen, ya que esta capacidad no existía en Qwen-Image-2.1.

El repositorio ocupa 5,2 GB y contiene varios checkpoints en formato safetensors, además de rejillas de muestras por cada 250 pasos de entrenamiento. Se publica bajo licencia Apache 2.0 y se integra mediante la librería diffusers o ComfyUI. En el momento de la consulta acumula 4.003 descargas y 74 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 64 / alpha 64) sobre Qwen-Image-2.1, arquitectura `qwen_image_2` |
| Parametros totales | No disponible (adaptador LoRA; el modelo base no reporta cifra en la información) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base entrenado en uint3; pesos del LoRA en bf16; el modelo base admite bf16 |
| Idiomas soportados | No disponible (los prompts del ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints convertidos a diffusers y formato bruto ai-toolkit) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 64 aplicado sobre Qwen-Image-2.1, un modelo unificado de generación y edición de imágenes con identificador de arquitectura `qwen_image_2`. Se entrenó con el trainer ostris/ai-toolkit usando adamw8bit, learning rate 1e-4, timesteps ponderados, dropout de caption de 0,05, resolución de 512² y 2.500 pasos, partiendo de un base cuantizado en uint3 y entrenando en bf16.

El conjunto de datos está formado por 1.144 pares de progresión de escena, extraídos como fotogramas consecutivos de los cortos abiertos de Blender *Sintel* y *Tears of Steel* (© Blender Foundation, CC-BY), a través del dataset KevinConnorLee/Sintel y los espejos de Blender. Las captions se redactaron empezando por el movimiento de cámara y siguiendo con el cambio de sujeto o iluminación, formato con el que el modelo responde mejor en inferencia.

Se publican cuatro checkpoints: `next_scene_step2500.safetensors` (recomendado, conversión a diffusers), `next_scene_step1500.safetensors` (transformación más suave), `next_scene_step1000.safetensors` (curva de entrenamiento) y los ficheros en `checkpoints/` con formato bruto de ai-toolkit, cuyas claves MLP fusionadas son ignoradas silenciosamente por diffusers. El repositorio incluye rejillas de muestras cada 250 pasos en `checkpoints/samples/`.

## Capacidades

- Continuación de escena: genera el siguiente plano a partir de una imagen de entrada y una instrucción de dirección.
- Control de cámara por prompt: movimientos de cámara (pull back, pan, tilt, push in, cut a) y cambios de iluminación o atmósfera.
- Coherencia de identidad: mantiene personajes, entorno y paleta entre planos encadenados.
- Encadenamiento de generaciones: la salida de un paso se realimenta como entrada del siguiente para construir storyboards secuenciales.
- Edición de imagen con preservación de composición, heredada del modelo base unificado de generación y edición.
- Integración con diffusers mediante `QwenImage21Pipeline` y `load_lora_weights`, y con ComfyUI mediante nodo LoRA.
- No se documentan capacidades de tool calling, agentes, visión multimodal ni audio; el modelo es de imagen a imagen.

## Casos de uso

- Storyboarding cinematográfico: partiendo de un fotograma clave, encadenar instrucciones tipo "Next Scene: The camera pulls back…" para generar una secuencia de planos coherente que sirva de guion visual antes de rodar.
- Previsualización de secuencias: generar planos de continuación de una localización o personaje para validar decisiones de cámara y luz con el equipo de dirección.
- Prototipado de campañas audiovisuales: producir una serie de frames consistentes para presentar una idea de anuncio o corto sin depender de un modelo de vídeo.
- Continuidad de estilo en cómics y novela gráfica: mantener paleta, vestuario y escenario entre viñetas generadas a partir de una imagen de referencia.
- Exploración de variantes de plano: con el checkpoint 1500 o fuerza de LoRA reducida a 0,7, obtener alternativas más suaves que preserven mejor la identidad cuando el 2500 transforma en exceso.
- Generación de material para animática: producir fotogramas sucesivos que después se monten como referencia temporal en un pipeline de animación.
- Investigación sobre control de cámara: combinado con `akhaliq/Qwen-Image-2.1-Multiple-Angles-LoRA`, cubrir tanto la posición de cámara como la progresión narrativa en experimentos de edición dirigida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye comparaciones cualitativas mediante rejillas de muestras (barrido de checkpoints con instrucción de tormenta, fuerza 0,9, seed 42, 40 pasos; y cadena de cuatro saltos sobre una fotografía de la misión Apolo 11), pero no métricas numéricas como FID, CLIP score o similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información; el repositorio ocupa 5,2 GB y el entrenamiento se realizó en 512² con base en uint3 y bf16, lo que sugiere que la inferencia requiere cargar el modelo base completo además del LoRA.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información; depende del modelo base Qwen-Image-2.1, cuyos requisitos no se detallan.
- Opciones de despliegue: diffusers (`QwenImage21Pipeline` con `load_lora_weights`) y ComfyUI mediante nodo LoRA con fuerza 0,7–0,9. Los checkpoints en formato bruto requieren ai-toolkit o su propio loader.
- Latencia y throughput: no disponibles. Los ejemplos de la model card usan 28 pasos de inferencia en el uso básico y 40 pasos por salto en las cadenas de demostración.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akhaliq/Qwen-Image-2.1-Next-Scene-LoRA | LoRA de continuación de escena | Qwen-Image-2.1 | 512² en entrenamiento; resolución de inferencia no especificada | Apache 2.0 | Hugging Face, diffusers, ComfyUI |
| lovis93/next-scene-qwen-image-lora-2509 | LoRA de continuación de escena (formato original) | Qwen-Image 2509 edit | No disponible | No disponible en la información | Hugging Face (313K descargas según la model card) |
| akhaliq/Qwen-Image-2.1-Multiple-Angles-LoRA | LoRA de control de cámara | Qwen-Image-2.1 | No disponible | No disponible en la información | Hugging Face, diffusers, ComfyUI |

No se dispone de datos de rendimiento cuantitativos que permitan comparar estos adaptadores entre sí; la comparación disponible es funcional (continuación de escena frente a control de ángulos de cámara).

## Limitaciones y advertencias

- Deriva hacia copiar la imagen de entrada: la propia model card recomienda bajar la fuerza del LoRA hacia 0,7 si la salida no transforma lo suficiente.
- El encadenamiento sucesivo puede acumular artefactos; en las demostraciones se aplica un desenfoque para romper el grano en las entradas encadenadas.
- El modelo está entrenado con fotogramas de dos cortos de animación de Blender, lo que puede sesgar el estilo hacia render 3D y escenarios de ciencia ficción o fantasía.
- Riesgo de alucinación visual: cambios no solicitados en personajes, vestuario o arquitectura al forzar transformaciones grandes (checkpoint 2500 a fuerza 0,9).
- Las captions de entrenamiento están en inglés y siguen un formato concreto ("Next Scene:" seguido de la dirección de cámara); prompts fuera de ese patrón pueden degradar el resultado.
- No se documentan idiomas soportados ni evaluación multilingüe.
- Los checkpoints en `checkpoints/` con formato ai-toolkit no funcionan correctamente con diffusers por el nombrado fusionado de las claves MLP.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento derivan de obras de Blender Foundation bajo CC-BY, lo que conviene verificar según el uso previsto.
- No se especifican requisitos de hardware, latencia ni límites de resolución de inferencia en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhaliq/Qwen-Image-2.1-Next-Scene-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- LoRA original del formato next-scene: https://huggingface.co/lovis93/next-scene-qwen-image-lora-2509
- LoRA complementario de ángulos de cámara: https://huggingface.co/akhaliq/Qwen-Image-2.1-Multiple-Angles-LoRA
- Trainer utilizado: https://github.com/ostris/ai-toolkit
- Dataset de fotogramas de Sintel: https://huggingface.co/datasets/KevinConnorLee/Sintel
- Licencia CC-BY de Blender Foundation: https://creativecommons.org/licenses/by/3.0/
- Imagen de partida de la cadena de demostración (NASA, dominio público): https://en.wikipedia.org/wiki/File:Aldrin_Apollo_11.jpg
