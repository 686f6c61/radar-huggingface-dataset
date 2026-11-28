# E10Null/pov-geometry-zimage

## Resumen

`pov-geometry-zimage` es un LoRA de disposición espacial (layout LoRA) desarrollado por el usuario E10Null para los modelos de generación de imágenes Z-Image y Z-Image Turbo de Tongyi-MAI (Alibaba). Su función es mejorar el encuadre en primera persona (POV), la propiedad de las manos en escena, las interacciones con objetos (hover frente a grip), las entregas de objetos entre personas y la perspectiva de puertas vistas desde dentro o desde fuera. No modifica la estética ni la textura de la piel del modelo base: actúa únicamente sobre las capas tempranas del transformer de difusión.

El adaptador tiene un rango de 16 y un peso de 8,5 MB, lo que lo convierte en un complemento muy ligero que se puede apilar con otros LoRA de estilo o de detalle fotográfico sin degradar la nitidez. Se entrenó a resolución nativa de 896×1152 sobre pasos de timestep de alto ruido (t ∈ [0.50, 0.98]), congelando por completo los bloques 12 a 29 del modelo base.

Es relevante porque los modelos de difusión de texto a imagen suelen fallar en la coherencia geométrica de escenas en primera persona: manos que no pertenecen al sujeto, objetos que flotan sin agarre o puertas que no respetan la profundidad. Este LoRA ataca ese problema congelando las capas de textura y actuando solo sobre la composición espacial, lo que permite integrarlo en flujos de ComfyUI sin reentrenar ni alterar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión Z-Image (adaptador de bajo rango) |
| Parametros totales | no disponible (peso del adaptador: 8,5 MB, rango 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | BF16 en el modelo base; el LoRA se distribuye en safetensors |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`eyeline-pov-blocks0-11-r16.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado exclusivamente a los bloques 0 a 11 del transformer de difusión de Z-Image. Los bloques 12 a 29 permanecen congelados al 100 %, lo que preserva el realismo de piel, el detalle fino y la nitidez nativos del modelo base. El entrenamiento se realizó a resolución nativa de 896×1152 y se concentró en timesteps de alto ruido (t ∈ [0.50, 0.98]), la fase en la que el modelo define la disposición global de la escena antes de refinar texturas.

No se especifican en la información disponible el número de pasos de entrenamiento, el tamaño del dataset, la composición de las imágenes de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a LoRA de difusión). La innovación principal es el enfoque de "early-block-only": al no tocar las capas tardías de textura y estilo, el LoRA se apila limpiamente con otros adaptadores fotográficos, de grano de película o de detalle de piel en ComfyUI.

## Capacidades

- Generación de imágenes en primera persona (POV) con encuadre coherente y colocación correcta de las manos en el primer plano.
- Control de interacciones con objetos: distinguir entre objeto flotando (hover) y objeto agarrado (grip).
- Representación de entregas de objetos entre dos personas (handoff) con perspectiva creíble.
- Perspectiva de puertas y umbrales con distinción entre interior y exterior.
- Compatible con Z-Image Base y Z-Image Turbo como modelos base.
- No requiere trigger word: se activa de forma natural con prompts que empiezan por "First-person POV...".
- Apilable con otros LoRA de estilo, grano o detalle de piel sin pérdida de nitidez.
- Funciona con el text encoder estándar Qwen3-4B (`lumina2`) sin modificaciones.

## Casos de uso

- **Fotografía comercial en primera persona:** generar imágenes de producto donde la mano del cliente sostiene o recibe el artículo, con propiedad de mano correcta, para catálogos de e-commerce y anuncios. El LoRA garantiza que el objeto esté agarrado y no flotando.
- **Escenas narrativas de videojuegos y cómics:** producir viñetas en POV para storyboards o ilustración editorial, con encuadres de puerta, mostrador o entrega de objetos coherentes entre planos.
- **Prototipado de interfaces de realidad virtual:** generar referencias visuales de vistas en primera persona para diseñar HUD, menús diegéticos o escenas inmersivas antes de pasar a motor 3D.
- **Contenido para redes y blogs de viajes:** crear imágenes de "lo que veo" en mercados, tiendas o interiores, donde la cámara subjetiva es el recurso narrativo principal.
- **Ilustración de recetas y tutoriales:** escenas de cocina en POV con manos sosteniendo utensilios o ingredientes, útiles para portadas de recetarios y contenido gastronómico.
- **Previsualización de escenas para cine publicitario:** generar frames de referencia en primera persona para presentar al cliente el encuadre de un plano subjetivo antes del rodaje.
- **Integración en pipelines de ComfyUI:** cargar el LoRA con `LoraLoaderModelOnly` sobre `z_image_turbo_bf16.safetensors` y encadenarlo con LoRA de estilo para producción por lotes de imágenes POV con estética consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye seis demos cualitativas renderizadas con Z-Image Turbo BF16, text encoder Qwen3-4B (`lumina2`) y el LoRA a fuerza 1.0, a 896×1152, 8 pasos, CFG 1.0, sampler euler, scheduler beta y shift 3.0. No se aportan métricas cuantitativas como FID, CLIP score ni comparaciones numéricas con otros adaptadores.

## Requisitos de hardware

- **VRAM estimada:** no disponible de forma específica para el LoRA; depende del modelo base Z-Image o Z-Image Turbo en BF16. El adaptador en sí ocupa 8,5 MB.
- **GPU recomendadas:** no especificadas en la información disponible. Al tratarse de un modelo de difusión de imagen de tamaño no indicado, se requiere una GPU con VRAM suficiente para el modelo base completo en BF16.
- **Consumer GPU:** no se confirma compatibilidad con GPU de consumo; depende de si el modelo base Z-Image cabe en la VRAM disponible (dato no aportado).
- **Opciones de despliegue:** ComfyUI es el flujo documentado, mediante los nodos `LoraLoaderModelOnly` o `LoraLoader`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión de imagen).
- **Latencia y throughput:** no disponibles. Los ajustes de muestreo recomendados son 8 pasos con CFG 1.0 para Turbo y 25 pasos con CFG 4.0 para Base, ambos a 896×1152.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRA de geometría POV comparables en la documentación proporcionada. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pov-geometry-zimage (este) | LoRA r16, 8,5 MB | no aplica | Apache 2.0 | Hugging Face |
| Alternativas POV comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria ni evidencia de robustez en producción.
- El LoRA está entrenado solo para los bloques 0 a 11 de Z-Image; no funcionará con otros modelos de difusión distintos de Z-Image Base o Turbo.
- Solo se documentan prompts en inglés; el comportamiento con prompts en castellano u otros idiomas no está verificado.
- La fuerza recomendada es 0.8–1.0 para POV; fuera de ese rango o en prompts no POV conviene ponerlo a 0.0 o hacer bypass para evitar artefactos.
- No se especifican sesgos conocidos, pero al ser un adaptador de escenas en primera persona podría heredar sesgos del dataset de entrenamiento del modelo base y del propio LoRA (no documentados).
- Riesgo de alucinación geométrica en escenas muy complejas con múltiples manos u objetos; no hay métricas que cuantifiquen la tasa de fallo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Z-Image debe cumplir su propia licencia, que no se detalla en la información disponible.
- No se aportan datos de entrenamiento, dataset ni evaluación cuantitativa, lo que dificulta estimar su comportamiento fuera de los seis demos publicados.

## Enlaces

- Hugging Face: https://huggingface.co/E10Null/pov-geometry-zimage
- Modelo base Z-Image: https://huggingface.co/Tongyi-MAI/Z-Image
- Modelo base Z-Image Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales fuera de la model card de Hugging Face.
