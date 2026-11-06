# Sarvesh0827/sd15-naruto-lora-r8

## Resumen

sd15-naruto-lora-r8 es un adaptador LoRA de rango 8 entrenado sobre Stable Diffusion 1.5 para la generación de imágenes del universo Naruto. Lo publica el usuario Sarvesh0827 como entrega final de la práctica "DATA 266 Lab 2 Part 2" y no constituye un modelo base autónomo: requiere cargar los pesos de Stable Diffusion 1.5 y aplicar el adaptador encima. El repositorio tiene un tamaño declarado de 0.0 GB, coherente con un LoRA de 1.594.368 parámetros entrenables, y acumula 14 descargas y 0 likes en el momento de la consulta.

El interés técnico del artefacto es acotado pero ilustrativo: documenta un experimento controlado de ajuste fino con presupuesto fijo de 1200 pasos en el que un LoRA de rango 32 colapsó y el de rango 8 fue el que se reportó como resultado final. Es decir, el autor selecciona el checkpoint por estabilidad del entrenamiento, no por una evaluación cualitativa sistemática, y así lo declara en la model card.

Para un desarrollador o investigador, este adaptador sirve como referencia de bajo coste (10.032 GB de VRAM en pico, 7,16 minutos de entrenamiento) para reproducir un pipeline de fine-tuning de difusión con `diffusers`, y como caso práctico de los límites del rango en LoRA cuando el dataset es pequeño y homogéneo. No está pensado para producción comercial: los personajes son propiedad intelectual de terceros y el propio autor restringe el uso a la asignatura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion 1.5, pipeline text-to-image basado en U-Net + VAE + CLIP text encoder |
| Parametros totales | No disponible para el adaptador; parámetros entrenables: 1.594.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de difusión; la entrada es un prompt de texto, sin ventana de contexto declarada) |
| Tipos de cuantizacion | No disponible (el autor solo documenta entrenamiento e inferencia en float16) |
| Idiomas soportados | No disponible (los prompts de ejemplo están en inglés; el text encoder CLIP de SD 1.5 está entrenado principalmente en inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | Pesos LoRA compatibles con `diffusers` (`pipe.load_lora_weights`); el repositorio no detalla el formato de fichero exacto |

## Arquitectura y entrenamiento

El adaptador se inyecta sobre Stable Diffusion 1.5, un modelo de difusión latente compuesto por un U-Net, un VAE y un text encoder CLIP. El ajuste se realiza con LoRA de rango 8, lo que limita el número de parámetros entrenables a 1.594.368 y mantiene congelados los pesos del modelo base. La configuración declarada es: learning rate 0.0001, 1200 pasos, batch size 8 y resolución 512. El pico de memoria GPU durante el entrenamiento fue de 10.032 GB y el tiempo total de 7,16 minutos, lo que sitúa el experimento en el rango de una GPU de consumo o de una GPU de datacenter compartida.

El dato más relevante del proceso es la comparación entre rangos: con los mismos datos y el mismo presupuesto de 1200 pasos, un LoRA de rango 32 colapsó y el de rango 8 fue el seleccionado como resultado final. Esto sugiere que el dataset es pequeño y de baja diversidad, de modo que una capacidad de adaptación mayor sobreajusta o desestabiliza el entrenamiento. Las imágenes de entrenamiento provienen de fotogramas de la wiki de Naruto, captionados automáticamente con BLIP; no se documenta el número de imágenes, la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en un ajuste de difusión de este tipo).

## Capacidades

- Generación de imágenes text-to-image a 512 px sobre el modelo base Stable Diffusion 1.5, con sesgo aprendido hacia personajes y estética de Naruto.
- Reproducción de atributos visuales del dominio de entrenamiento (por ejemplo, ninjas con pelo rubio y espíritus zorro, según el prompt de ejemplo de la model card).
- Composición con el ecosistema `diffusers`: carga mediante `load_lora_weights` y combinación con otras técnicas del pipeline (negative prompts, schedulers, escalado de CFG, img2img).
- Ajuste del peso del adaptador en inferencia mediante el parámetro de escala de LoRA que expone `diffusers`, lo que permite graduar la intensidad del estilo aprendido.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo de difusión, no un modelo de lenguaje.
- Capacidades multilingües no documentadas; el comportamiento práctico queda condicionado por el text encoder CLIP de SD 1.5, orientado al inglés.
- No dispone de visión de entrada ni de audio.

## Casos de uso

- Reproducción de experimentos docentes de fine-tuning: sirve como referencia completa (hiperparámetros, memoria pico, tiempo, comparación de rangos) para replicar un pipeline LoRA con `diffusers` en un curso o laboratorio.
- Estudio del efecto del rango en LoRA: el par contraste rango 8 frente a rango 32 con presupuesto fijo permite analizar empíricamente el colapso por sobrecapacidad en datasets pequeños.
- Generación de arte conceptual derivado para proyectos personales sin ánimo de lucro: el adaptador produce imágenes de estética ninja a 512 px con prompts en inglés, adecuadas para bocetos o moodboards internos.
- Pruebas de composición de adaptadores: al ser un LoRA ligero, se puede combinar con otros LoRA de estilo sobre SD 1.5 y medir interacciones y peso relativo de cada uno.
- Docencia sobre propiedad intelectual en IA generativa: el caso ilustra de forma explícita el conflicto entre datos de entrenamiento con copyright y licencias de modelos abiertos, con una restricción de uso declarada por el propio autor.
- Validación de infraestructura de entrenamiento de bajo coste: con 10.032 GB de pico y 7,16 minutos de ejecución, es un banco de pruebas realista para verificar entornos, versiones de librerías y monitorización de VRAM antes de escalar a datasets mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros adaptadores; únicamente documenta métricas de entrenamiento (pasos, batch, learning rate, memoria pico y tiempo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia del propio autor, el entrenamiento del adaptador consumió 10.032 GB de pico; la inferencia con SD 1.5 en float16 suele requerir bastante menos, pero no se aporta cifra medida para este adaptador.
- GPU recomendadas: no disponible en la información proporcionada. El pico de entrenamiento de 10.032 GB es compatible con GPUs de 12 GB o superiores; no se especifica el modelo de GPU empleado.
- ¿Cabe en GPU de consumo? El dato de memoria de entrenamiento sugiere que sí en tarjetas de 12 GB o más, pero no se confirma para inferencia ni se indica una GPU concreta.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights`, tal como muestra la model card. No se documentan exportaciones a otros runtimes (por ejemplo, llama.cpp u Ollama, no aplicables a difusión) ni integración con vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sd15-naruto-lora-r8 | LoRA r8 sobre SD 1.5 | 1.594.368 entrenables | 512 px | creativeml-openrail-m | Hugging Face, 14 descargas |
| Stable Diffusion 1.5 (base) | Difusion latente text-to-image | No disponible en la informacion | 512 px | creativeml-openrail-m | Ampliamente disponible |
| Alternativas LoRA de estilo sobre SD 1.5 | Adaptadores LoRA | Variable segun adaptador | 512 px | Variable | Multiples en Hugging Face |

No se dispone de datos de rendimiento comparado (FID, CLIP score ni evaluaciones humanas) para establecer una comparación cuantitativa con otras alternativas. La comparación disponible es estructural: frente al modelo base, este adaptador añade especialización de dominio con un coste de almacenamiento mínimo; frente a otros LoRA de la misma familia, no hay métricas públicas que permitan ordenarlos.

## Limitaciones y advertencias

- Restricción de uso comercial explícita: el autor declara que los personajes son propiedad intelectual con copyright y que el adaptador es para una práctica de curso, no para uso comercial. La licencia del repositorio es creativeml-openrail-m, pero esa restricción del autor prevalece como advertencia práctica.
- Riesgo de sobreajuste al dataset: el colapso del LoRA de rango 32 con los mismos datos y pasos indica un dataset pequeño y poco diverso; es esperable poca generalización fuera de los personajes y escenas vistos en entrenamiento.
- Calidad de las captions: el etiquetado se hizo automáticamente con BLIP, lo que introduce ruido y errores de descripción que degradan la fidelidad prompt-imagen.
- Sesgos: no documentados por el autor. Al derivar de SD 1.5, hereda los sesgos del modelo base y de su dataset de preentrenamiento, no evaluados en esta ficha.
- Alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible y atributos inventados; no hay evaluación de fidelidad publicada.
- Idioma: no se documentan idiomas soportados; los prompts en castellano pueden funcionar peor que en inglés por las limitaciones del text encoder CLIP de SD 1.5.
- Seguridad en inferencia: el autor recomienda activar un filtro NSFW, lo que implica que el adaptador puede producir contenido no seguro sin él.
- Ausencia de evaluación: no hay benchmarks, comparativas ni validación humana publicadas; la selección del checkpoint se basó en estabilidad del entrenamiento, no en calidad de salida medida.
- Resolución fija de 512 px y modelo base de 2022: no incorpora mejoras posteriores en calidad de texto, composición o resolución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sarvesh0827/sd15-naruto-lora-r8
- Modelo base Stable Diffusion 1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Librería diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales asociados a este adaptador.
