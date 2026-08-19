# masafy/minimax-h3-masafy-lora

## Resumen

`masafy/minimax-h3-masafy-lora` es un adaptador LoRA de personaje desarrollado por el autor "masafy" para el modelo omni-modal MiniMax H3, un sistema de aproximadamente 33 mil millones de parámetros que genera video y audio de forma conjunta. El adaptador está entrenado sobre la variante Ref2VA (image-to-video) y se aplica en inferencia a la compilación GGUF Q3_K_M del modelo base. Su propósito es renderizar un personaje original de panda rojo llamado "Masafy" en el estilo de ilustración cel plana del autor, en lugar del estilo fotorrealista que produce el modelo base por defecto.

El proyecto destaca por un hallazgo técnico relevante: durante el entrenamiento, el pico de VRAM fue de solo 3.959 MiB (el 2,8% de la tarjeta), pero el proceso falló tres veces debido a la falta de RAM del sistema. El conjunto completo del modelo (41,2 GB: 20,0 GB del transformer, 15,7 GB del codificador de texto Qwen3-VL 32B y 5,5 GB de los VAEs) se prepara en memoria del host antes de transferirse a la GPU, por lo que se necesitan al menos 188 GB de RAM para completar el entrenamiento. Este dato contradice la suposición habitual de que la VRAM es el único factor limitante.

El adaptador se distribuye bajo la licencia comunitaria de MiniMax H3, que permite uso comercial con atribución obligatoria a "MiniMax H3" e incluye una cláusula territorial. El repositorio contiene seis checkpoints intermedios (de 300 a 800 pasos), siendo el recomendado el de 500 pasos con una fuerza de 0,8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3, modelo omni-modal de ~33B parámetros |
| Parametros totales | no disponible (repo de 0,9 GB; el modelo base tiene ~33B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 podado (entrenamiento); GGUF Q3_K_M (inferencia) |
| Idiomas soportados | no disponible (el informe tecnico esta en japones e ingles) |
| Licencia | minimax-h3-community-license-agreement (uso comercial permitido con atribucion) |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base se distribuye en GGUF |

## Arquitectura y entrenamiento

El adaptador es una LoRA de personaje sobre MiniMax H3, un modelo omni-modal de ~33B parámetros que genera video y audio conjuntamente. Se entrenó sobre la variante Ref2VA (image-to-video) utilizando el entrenador ai-toolkit y el adaptador de entrenamiento oficial `ostris/minimax_h3_training_adapter`. El dataset de entrenamiento consta de 12 imágenes del personaje "Masafy", todas con la misma cláusula de descripción de apariencia en los captions.

La innovación técnica principal del proyecto no está en la arquitectura del adaptador, sino en el análisis del proceso de entrenamiento: el cuello de botella real fue la RAM del sistema, no la VRAM. El pico de VRAM medido fue de 3.959 MiB (2,8% de la tarjeta), pero el modelo completo de 41,2 GB se prepara en memoria del host antes de llegar a la GPU. Esto explica por qué hosts con 50 GB de RAM fueron eliminados por el OOM reaper, mientras que un host con 188 GB completó el entrenamiento. El adaptador se entrenó en INT8 podado y se aplica limpiamente a la compilación GGUF Q3_K_M, con 208 de 208 módulos coincidentes y cero discrepancias de claves.

## Capacidades

- Generacion de video a partir de imagen (image-to-video) con el personaje "Masafy" en el estilo de ilustracion cel plana del autor.
- Cambio de estilo: sin el adaptador, el personaje se renderiza con pelaje fotorrealista; con el adaptador, se obtiene una ilustracion plana tipo cel.
- Rediseño de fondos: el adaptador tambien modifica los fondos porque los captions describian imagenes completas.
- Consistencia del personaje: bajo condicionamiento de imagen de referencia (R2V), el personaje ya se renderiza correctamente sin el adaptador, pero este aporta el estilo artistico.
- No se mencionan capacidades de tool calling, agentes, razonamiento multimodal ni soporte de audio en la informacion disponible.

## Casos de uso

- Creacion de contenido animado con personaje consistente: el adaptador permite generar clips de video de 5 segundos a 864×480 con el personaje "Masafy" en un estilo artistico definido, ideal para series cortas en redes sociales o prototipos de animacion.
- Personalizacion de estilo en produccion audiovisual: al aplicar el adaptador sobre el modelo base, un estudio puede mantener la identidad visual de un personaje propio en multiples generaciones sin reentrenar el modelo completo.
- Experimentacion con LoRA en modelos omni-modales: el proyecto sirve como caso de estudio para entender los requisitos reales de memoria en el ajuste fino de modelos grandes de video, especialmente el papel de la RAM del sistema.
- Generacion de clips promocionales con personajes de marca: dado que el adaptador cambia el estilo pero mantiene la estructura del personaje, se puede usar para producir material de marketing con una estetica coherente.
- Prototipado rapido de animaciones 2D: el estilo cel plano resultante es adecuado para previsualizar escenas antes de la produccion final, reduciendo costes de iteracion.
- Investigacion sobre transferencia de estilo en video: el analisis detallado del entrenamiento (fuerza vs. fidelidad estructural) proporciona datos utiles para otros desarrolladores que trabajen con adaptadores similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una validacion cruzada sobre la fuerza (0,0–1,2) y la longitud de entrenamiento (300–800 pasos) que identifico el optimo en 500 pasos con fuerza 0,8, pero no se proporcionan metricas numericas concretas.

## Requisitos de hardware

- Inferencia: 9,3 GB de VRAM, cabe en una GPU de consumo de 12 GB (por ejemplo, RTX 3060 o superior).
- Tiempo de generacion: aproximadamente 13 minutos por clip de 5 segundos a 864×480 en una RTX 3060.
- Entrenamiento: pico de VRAM de 3.959 MiB, pero requiere al menos 188 GB de RAM del sistema (el modelo completo de 41,2 GB se prepara en memoria del host antes de transferirse a la GPU).
- Despliegue: ComfyUI, con el flujo `UnetLoaderGGUF → LoraLoaderModelOnly → BasicGuider/BasicScheduler`. No se mencionan otras opciones como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros adaptadores LoRA para generacion de video ni con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- El token disparador `masafy_character` no es suficiente por si solo: es necesario incluir la descripcion completa de la apariencia en el prompt, ya que los captions de entrenamiento tienen un peso real en el resultado.
- A fuerzas altas (1,2) aparece un contorno oscuro alrededor del personaje, correspondiente al borde troquelado del arte de sticker utilizado en el entrenamiento. Ademas, subir la fuerza degrada la precision estructural, especialmente en las manos.
- El adaptador remodela los fondos de forma no controlada, porque los captions describian imagenes completas y no solo al personaje.
- La licencia comunitaria de MiniMax H3 incluye una clausula territorial; es necesario consultar los terminos oficiales para verificar si el uso es permitido en la jurisdiccion del usuario.
- El modelo base (MiniMax H3 Ref2VA) no se redistribuye en este repositorio; debe obtenerse por separado desde `Comfy-Org/MiniMax-H3` o `MiniMaxAI/MiniMax-H3`.
- El personaje "Masafy" es una obra original del autor; se solicita atribucion si se utiliza el diseno.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion o limitaciones de contexto para este adaptador especifico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masafy/minimax-h3-masafy-lora
- Informe tecnico y dataset (GitHub): https://github.com/masafykun/minimax-h3-masafy-lora
- Licencia de MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Modelo base (redistribucion ComfyUI): https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo base (original): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Adaptador de entrenamiento oficial: https://huggingface.co/ostris/minimax_h3_training_adapter
- Entrenador ai-toolkit: https://github.com/ostris/ai-toolkit
