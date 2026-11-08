# mfxq2l/Krea-2-Turbo-lora-Anime

## Resumen

Krea-2-Turbo-lora-Anime es un adaptador LoRA de estilo para el modelo base de generación de imágenes krea-2-turbo, publicado por el usuario mfxq2l en Hugging Face. El adaptador desplaza el estilo visual del modelo base hacia la ilustración anime japonesa de tipo moe, con énfasis en coloreado cel (cel shading), lineart limpio y luz suave. Está diseñado específicamente para integrarse en flujos de trabajo de ComfyUI, no como modelo autónomo.

El repositorio contiene un único artefacto de pesos en formato safetensors con un tamaño total de 1,2 GB, lo que es coherente con un LoRA de rango relativamente alto o con un adaptador que cubre un número amplio de módulos del modelo base. La model card describe un entrenamiento sobre 3000 ilustraciones anime de alta calidad durante 5000 pasos, sin especificar la arquitectura interna del modelo base ni los hiperparámetros de entrenamiento (rango, alpha, learning rate, optimizador).

La relevancia de esta ficha es limitada y debe enmarcarse con honestidad: el modelo tiene cero descargas y cero likes en el momento de la consulta, no declara licencia, no incluye benchmarks ni demos verificables, y la propia model card contiene marcadores de plantilla sin sustituir (el token `<trigger>`, el nombre de fichero y una discrepancia entre 3000 imágenes en el cuerpo del texto y 300 en el bloque de cita). Se trata, por tanto, de un adaptador experimental de autor individual, no de un modelo con validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base de difusión krea-2-turbo; arquitectura interna del base no disponible |
| Parametros totales | no disponible (pesos del adaptador: 1,2 GB en safetensors) |
| Parametros activos | no aplica (no es MoE; la denominación "moe" en el nombre hace referencia al estilo moe de anime, no a mixture of experts) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible; los prompts de ejemplo están en inglés |
| Licencia | no disponible en los metadatos; la model card indica uso personal y no comercial, con obligación de verificar la licencia del modelo base |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se suman a los pesos del modelo base krea-2-turbo en tiempo de inferencia. La model card no especifica el rango del adaptador, el valor de alpha, qué módulos del transformer de difusión se adaptan (atención, MLP o ambos) ni la resolución de entrenamiento. El tamaño de 1,2 GB sugiere un adaptador de dimensión moderada-alta, pero sin el desglose de tensores no es posible confirmarlo. La referencia externa a un "Krea 2 Turbo LoRA 256dim" en Civitai apunta a que existen adaptadores de dimensión 256 para este mismo modelo base, pero no hay evidencia de que este repositorio use esa configuración.

El entrenamiento descrito consiste en 5000 pasos sobre un dataset de 3000 ilustraciones anime seleccionadas manualmente, con predominio del estilo moe japonés y cobertura de múltiples personajes, composiciones e iluminaciones. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un LoRA de estilo. Tampoco se indican el preprocesado de captions, el uso de regularización o el método de muestreo de batches. La propia model card advierte de riesgo de sobreajuste dado el tamaño reducido del dataset, con posible convergencia estilística y repetición de composiciones.

## Capacidades

- Transferencia de estilo visual hacia ilustración anime japonesa con coloreado cel, lineart limpio y gradientes de luz suaves.
- Generación de personajes femeninos de estética moe con rasgos faciales consistentes (ojos grandes, mentón redondeado, proporciones estilizadas).
- Composición de escenas cotidianas, escolares y fantásticas mediante prompts mixtos de lenguaje natural y etiquetas tipo booru.
- Control de la intensidad del estilo mediante el peso del LoRA, con rango recomendado de 0,6 a 0,8 y advertencia de degradación por encima de 1,0.
- Integración con el nodo Load LoRA de ComfyUI, tanto en flujos de checkpoint único como en flujos tipo Flux con UNETLoader, DualCLIPLoader y VAELoader separados.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje: es un adaptador de generación de imagen.
- Capacidad multilingüe de prompts no documentada; los ejemplos están íntegramente en inglés.

## Casos de uso

- Iteración rápida de ilustración anime en ComfyUI: con 6 a 10 pasos de muestreo, CFG entre 1,0 y 2,0 y sampler euler, el adaptador permite generar borradores de personajes en segundos y refinarlos después, aprovechando la naturaleza turbo del modelo base.
- Producción de arte conceptual para proyectos de animación o videojuego: el LoRA unifica el estilo de una serie de ilustraciones de personajes, lo que facilita mantener coherencia visual entre entregables de un mismo encargo.
- Generación de avatares y retratos estilizados: los prompts de ejemplo con un solo personaje, plano medio y expresión suave encajan con la creación de avatares para comunidades o perfiles, ajustando el peso del LoRA a 0,6 para evitar rigidez.
- Fondos y escenarios anime: con prompts que describen iluminación y entorno (flores de cerezo, cielo nocturno, partículas brillantes) el adaptador produce escenarios compatibles con capas de personaje en un pipeline de composición.
- Prototipado de ilustraciones para publicaciones y fanzines: el flujo permite explorar variaciones de vestuario y pose antes de encargar el arte final a un ilustrador, reduciendo coste de preproducción.
- Pruebas de investigación sobre transferencia de estilo en LoRA: al ser un adaptador pequeño con dataset y número de pasos declarados, sirve como caso de estudio de sobreajuste y deriva estilística en datasets de 3000 imágenes, aunque su falta de benchmarks limita la comparabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros LoRA de anime. Tampoco hay cifras de latencia o throughput; los únicos parámetros operativos documentados son los de muestreo (6 a 10 pasos, CFG 1,0 a 2,0, resolución 1024 × 1024).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica. El adaptador pesa 1,2 GB en disco y debe sumarse a la VRAM que ocupa el modelo base krea-2-turbo, cuyo tamaño no se detalla en la información proporcionada.
- GPU recomendadas: no disponibles. Al ser un modelo de difusión orientado a 1024 × 1024, se espera que requiera GPUs con al menos 8-16 GB de VRAM, pero esta cifra es una estimación general y no un dato del repositorio.
- Cabeza en GPU de consumo: no confirmado. La resolución de 1024 × 1024 y el flujo turbo (pocos pasos) son compatibles con tarjetas de consumo modernas, pero sin el tamaño del base no puede afirmarse.
- Opciones de despliegue: ComfyUI es el entorno documentado y el único soportado explícitamente por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Krea-2-Turbo-lora-Anime (mfxq2l) | LoRA de estilo sobre krea-2-turbo | 1,2 GB de pesos de adaptador | 1024 × 1024 recomendado | Sin benchmarks publicados | No declarada; uso personal según model card | Hugging Face, 0 descargas |
| Krea 2 Turbo LoRA 256dim (Civitai) | LoRA de turbo sobre Krea 2, dimensión 256 | no disponible | no disponible | no disponible | no disponible | Civitai, con descarga opcional específica para ComfyUI |
| krea-2-turbo (modelo base) | Modelo de difusión de imagen | no disponible | no disponible | El más rápido de la familia Krea 2 según su página oficial, con calidad media | no disponible | Krea (plataforma) |

La comparación es limitada: no se dispone de parámetros, benchmarks ni licencia de ninguno de los tres, y el LoRA de Civitai es un adaptador de turbo (aceleración) mientras que el de mfxq2l es un adaptador de estilo (anime), por lo que no son sustitutos directos sino complementarios en un mismo pipeline.

## Limitaciones y advertencias

- Dataset de 3000 imágenes y 5000 pasos: la model card reconoce riesgo de sobreajuste, con tendencia a la repetición de composiciones y convergencia estilística entre prompts distintos.
- No garantiza la generación de personajes o IP concretas; la cobertura del dataset no permite reproducir diseños específicos de forma fiable.
- Soporte débil de estilos no objetivo (fotorrealismo, 3D, pintura gruesa), con posible conflicto visual si se fuerza el prompt en esas direcciones.
- Degradación con pesos superiores a 1,0: lineart rígido y saturación de color excesiva; el autor recomienda bajar a 0,5-0,7 antes de tocar el CFG.
- Licencia no declarada en los metadatos de Hugging Face. La model card restringe el uso a aprendizaje personal y no comercial, y exige verificar los derechos de las imágenes de entrenamiento y la licencia de krea-2-turbo; esto bloquea cualquier uso comercial sin aclaración previa del autor.
- Inconsistencias documentales que reducen la fiabilidad: el token `<trigger>` no está sustituido, el nombre de fichero del LoRA es un marcador, la cifra de imágenes oscila entre 3000 y 300 según el bloque, y los enlaces de descarga o demo no existen.
- Cero descargas y cero likes: no hay validación comunitaria, ejemplos de salida ni reportes de terceros que confirmen el comportamiento descrito.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de artefactos anatómicos (manos, ojos, extremidades) propios de los modelos de difusión con LoRA de bajo rango.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mfxq2l/Krea-2-Turbo-lora-Anime
- Krea 2 Turbo LoRA 256dim en Civitai (adaptador relacionado del mismo modelo base): https://civitai.com/models/2727641/krea-2-turbo-lora-256dim
- Página oficial del modelo base krea-2-turbo en Krea: https://www.krea.ai/models/krea-2-turbo
