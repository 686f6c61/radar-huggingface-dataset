# Leon1000/MiniMax-H3-360-Orbit-LoRA

## Resumen

MiniMax-H3-360-Orbit-LoRA es un adaptador LoRA de bajo rango publicado por el usuario Leon1000 sobre la variante first-last-frame (FL2VA) del modelo generativo de vídeo MiniMax-H3. Su función es convertir una única fotografía en una órbita de cámara de 360 grados alrededor de la escena manteniendo el mundo completamente congelado, y cerrar el plano exactamente sobre el fotograma inicial. Se apoya en la fijación de keyframes de FL2VA: se introduce la misma imagen como primer y último fotograma, algo que en el modelo base provoca que el clip apenas se mueva, pero que con este LoRA produce un recorrido orbital geométricamente consistente.

El modelo base, MiniMax-H3, es un generador omni-modal de propósito general que entiende texto, imagen, vídeo y audio, y produce vídeo con audio estéreo nativo a resoluciones de hasta 2K y 15 segundos de duración. La variante FL2VA es la especializada en generación condicionada por primer y último fotograma. El LoRA se distribuye como adaptador de 0,2 GB y se entrenó con ostris/ai-toolkit usando el encoder de texto Qwen3-VL-32B en nvfp4.

Su relevancia es práctica: resuelve un problema concreto de control de cámara (orbitar sin derivar ni romper la geometría de la escena) que ni Reference-to-video ni FL2VA resuelven de fábrica, y al devolver el clip a su fotograma inicial permite encadenar varias órbitas sin costura visible. Está pensado para su uso en ComfyUI con los pesos base pruned.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptación de bajo rango) sobre el transformer de difusión de vídeo MiniMax-H3, variante FL2VA |
| Parametros totales | No disponible (adaptador LoRA; el repositorio ocupa 0,2 GB) |
| Longitud de contexto | No disponible (genera clips de 73 fotogramas a 24 fps, unos 3 s) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base usado es MiniMax-H3 FL2VA pruned en int8 ConvRot (`convrot8`) |
| Idiomas soportados | No disponibles |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | No disponible (pesos LoRA con nomenclatura ComfyUI, prefijo `diffusion_model.*`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado con ostris/ai-toolkit, arch `minimax_h3`, partición `fl2va_pruned`, sobre pesos base MiniMax-H3 FL2VA pruned en int8 ConvRot (`convrot8`) y con el encoder de texto Qwen3-VL-32B en nvfp4. Durante el entrenamiento se empleó también el adaptador de entrenamiento `ostris/minimax_h3_training_adapter` v1, que no es necesario en inferencia. Los pesos finales usan la nomenclatura de claves de ComfyUI.

El conjunto de datos está formado por 28 renders de órbita generados a partir de Gaussian splats humanos estáticos seleccionados manualmente. Como cada splat es una escena 3D fija, todos los fotogramas son geométricamente consistentes por construcción: el único movimiento presente en el dataset es el de la cámara. Los clips tienen formato 768 × 768, 73 fotogramas y 24 fps, y todos comparten el mismo prompt de anclaje (caption dropout de 0,05). La innovación clave es precisamente el emparejamiento entre el objetivo que se pide en inferencia (escena congelada, cámara en órbita) y la naturaleza estática y geométricamente exacta de los datos de entrenamiento. El modelo base MiniMax-H3 está destilado, por lo que no usa CFG ni prompt negativo.

## Capacidades

- Generación de vídeo image-to-video con control de cámara: órbita completa de 360 grados a partir de una sola fotografía.
- Congelado de escena: preserva personas, objetos, caras, manos, ropa, líquidos y fondo sin cambios de posición, orientación, forma o pose.
- Consistencia 3D: mantiene la geometría de la escena durante todo el recorrido gracias al entrenamiento sobre Gaussian splats estáticos.
- Cierre de bucle sobre el primer fotograma: el clip termina en la misma vista desde la que empezó, lo que permite encadenar o coser varias órbitas sin costura.
- Condicionamiento first-last-frame (FL2VA): se le pasa la misma imagen como primer y último keyframe para forzar el bucle completo.
- Modo vídeo sin audio: el flujo recomendado desactiva el audio.
- Control de paralaje como única fuente de movimiento aparente, sin cortes, zoom, morphing ni objetos añadidos.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo específicas del adaptador.

## Casos de uso

- Fotografía de producto en 360: a partir de una sola foto de un objeto se genera una órbita completa que muestra el producto desde todos los ángulos, cerrando sobre la imagen inicial para reutilizarla como fotograma de portada.
- Turismo y bienes raíces: convertir una foto de una estancia o de un monumento en un recorrido orbital virtual de unos 3 segundos, encadenable para construir un tour más largo sin saltos visibles.
- Contenido para redes sociales: crear loops cortos y fluidos (73 fotogramas, 24 fps) que vuelven a su punto de partida, ideales para publicaciones en bucle.
- Efectos visuales y previsualización: generar una órbita de referencia alrededor de un sujeto congelado antes de rodar o modelar en 3D, respetando su pose exacta.
- Retrato con paralaje cinematográfico: animar un retrato fotográfico con movimiento de cámara envolvente manteniendo el rostro y las manos inmóviles y naturales.
- Escenas con elementos suspendidos: reproducir escenas con objetos en el aire (por ejemplo, un salto congelado o líquido en suspensión) que permanecen a la misma altura y ángulo durante toda la órbita.
- Encadenado de tomas largas: al devolver el clip a su fotograma inicial, varios clips se pueden unir en secuencia para cubrir un recorrido de cámara más extenso sin cortes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros no aplican a este tipo de modelo). La model card incluye únicamente comparaciones cualitativas del mismo input, misma semilla, prompt, resolución y número de pasos, en tres configuraciones:

| Configuracion | Comportamiento observado (segun la model card) |
|---|---|
| Modelo base, solo primer fotograma | La cámara se mueve, pero deriva y no regresa a la vista inicial |
| Modelo base, primer + último fotograma | Al ser la misma imagen, el modelo interpreta el clip como una foto fija y apenas se mueve |
| Base + este LoRA, primer + último fotograma | Órbita completa con movimiento fluido, sin cortes, y regreso al fotograma inicial |

No se proporcionan métricas numéricas (FVD, CLIP, SSIM u otras) para respaldar estas comparaciones.

## Requisitos de hardware

- No se especifica la VRAM necesaria en la información disponible.
- Requiere cargar el modelo base MiniMax-H3 FL2VA pruned (repack int8 ConvRot de Comfy-Org/MiniMax-H3) junto con el LoRA; el tamaño de ese base no está indicado.
- Requiere además el encoder de texto Qwen3-VL-32B en nvfp4, lo que supone una carga adicional considerable de memoria.
- GPU recomendadas: no disponibles.
- No se confirma si cabe en GPU de consumo; dada la presencia de un encoder de texto de 32B, es previsible que requiera aceleradores de gama alta o profesionales.
- Opciones de despliegue: ComfyUI (los pesos usan nomenclatura ComfyUI con prefijo `diffusion_model.*`); el entrenamiento e inferencia de referencia se hicieron con ostris/ai-toolkit.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Encadenable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leon1000/MiniMax-H3-360-Orbit-LoRA | LoRA sobre MiniMax-H3 FL2VA | Órbita 360 con escena congelada y cierre sobre el primer fotograma | Sí | minimax-h3-community-license-agreement | HuggingFace |
| pablodawson/MiniMax-H3-360-Orbit-LoRA | LoRA sobre MiniMax-H3 FL2VA | Órbita 360 con escena congelada (según descripción de terceros, rank-16) | No confirmado | No disponible | HuggingFace |
| MiniMax-H3 FL2VA (base) | Modelo de vídeo first-last-frame | Generación condicionada por primer y último fotograma; con la misma imagen en ambos extremos apenas se mueve | No | minimax-h3-community-license-agreement | HuggingFace |
| MiniMax-H3 Ref2VA (base) | Modelo de vídeo reference-to-video | Trata las imágenes de entrada como referencias de apariencia; no fija el fotograma final | No | minimax-h3-community-license-agreement | HuggingFace |

Los datos de rendimiento comparado no están disponibles; la única referencia disponible son las comparaciones cualitativas de la propia model card frente al modelo base.

## Limitaciones y advertencias

- Entrenado con solo 28 clips de órbita; el dominio de generalización puede ser limitado fuera de sujetos y escenas similares a los Gaussian splats humanos usados.
- El prompt de anclaje es obligatorio y debe usarse literalmente; desviarse de él puede degradar la consistencia de la órbita o romper el congelado de la escena.
- Pensado para escenas estáticas; cualquier acción o movimiento continuado en la escena no está soportado por el objetivo de entrenamiento.
- No hay datos publicados sobre sesgos, alucinación ni comportamiento en escenas complejas.
- Idiomas soportados no disponibles.
- La licencia (minimax-h3-community-license-agreement) es de tipo "other" y puede imponer restricciones al uso comercial; debe revisarse el texto completo antes de un despliegue en producción.
- El adaptador depende por completo del modelo base MiniMax-H3 FL2VA pruned y del encoder Qwen3-VL-32B; no es autónomo.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- La información de la model card aparece truncada en la sección de hiperparámetros, por lo que parte de los detalles de entrenamiento (por ejemplo, learning rate, número de pasos o rank) no están disponibles.
- Ajustes recomendados que conviene respetar: 768 × 768, 73 fotogramas, 28 pasos, sin guidance (modelo destilado, sin CFG ni prompt negativo), fuerza de LoRA 1.0 y audio desactivado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Leon1000/MiniMax-H3-360-Orbit-LoRA
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repack pruned int8 ConvRot (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Adaptador de entrenamiento: https://huggingface.co/ostris/minimax_h3_training_adapter
- Repositorio de entrenamiento ai-toolkit: https://github.com/ostris/ai-toolkit
- Blog oficial de MiniMax-H3: https://www.minimax.io/blog/minimax-h3
- Artículo en ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-09-27-h3-360-orbit-lora
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/minimax-h3-360-orbit-lora-pablodawson
- LoRA similar de otro autor: https://huggingface.co/pablodawson/MiniMax-H3-360-Orbit-LoRA
- Otro repositorio del mismo autor: https://huggingface.co/Leon1000/MiniMax-H3
