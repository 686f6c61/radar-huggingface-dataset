# robertbschuette/MiniMax-H3-360-Orbit-LoRA

## Resumen

MiniMax-H3 360 Orbit LoRA es un adaptador LoRA de bajo rango desarrollado por robertbschuette sobre el modelo base MiniMaxAI/MiniMax-H3 en su variante FL2VA (first-last-frame to video-audio). El adaptador convierte una unica imagen estatica en una orbita de camara de 360 grados manteniendo la escena completamente congelada, y cierra el clip sobre el mismo fotograma inicial, lo que permite encadenar orbitas sin costuras visibles.

El problema que resuelve es concreto: la generacion referencia-a-video (Ref2VA) trata las imagenes de entrada como referencias laxas de apariencia, por lo que los clips no terminan en un fotograma conocido y no se pueden unir limpiamente. La generacion first-last-frame (FL2VA) fija ambos extremos, pero de fabrica se congela cuando la imagen inicial y la final son identicas. Este LoRA ensena al modelo una orbita geometricamente consistente mientras el anclaje de keyframes de FL2VA mantiene ambos extremos exactos en inferencia.

El adaptador se entrena con 28 renders de orbita generados a partir de splats gaussianos humanos estaticos, de modo que cada fotograma es consistente por construccion. El repositorio ocupa 0,2 GB y las claves usan nomenclatura de ComfyUI (`diffusion_model.*`). No se dispone de datos publicos sobre parametros del modelo base ni sobre benchmarks cuantitativos en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax-H3 FL2VA; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (adaptador LoRA; tamano del repo 0,2 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos base recomendados en int8 ConvRot (repack de Comfy-Org); text encoder Qwen3-VL-32B en nvfp4; cuantizaciones del LoRA no especificadas |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors con nomenclatura ComfyUI (`diffusion_model.*`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre MiniMax-H3 en la particion `fl2va_pruned` con el trainer ostris/ai-toolkit y la extension de modelo `minimax_h3`. El modelo base se cargo con pesos FL2VA pruned en int8 ConvRot (`convrot8`) y el text encoder Qwen3-VL-32B en nvfp4. Durante el entrenamiento se activo el adaptador `ostris/minimax_h3_training_adapter` v1, que no es necesario en inferencia. La arquitectura interna del modelo base (transformer, MoE, hibrida) no se detalla en la informacion disponible.

El dataset consta de 28 clips de orbita de 768 x 768, 73 fotogramas y 24 fps, renderizados alrededor de splats gaussianos humanos estaticos recogidos de internet. Al ser escenas 3D estaticas, todos los fotogramas son geometricamente consistentes por construccion: el unico movimiento es el de la camara. Todos los clips comparten el mismo caption (el prompt de instancia) con un caption dropout de 0,05, y no incluyen audio. La innovacion tecnica clave es la combinacion del LoRA con el anclaje de keyframes de FL2VA en inferencia: el LoRA aporta la trayectoria de camara real y FL2VA garantiza que el primer y el ultimo fotograma coincidan exactamente.

## Capacidades

- Generacion image-to-video y image-text-to-video con control de camara: orbita continua de 360 grados alrededor del sujeto.
- Generacion first-last-frame (FL2VA): acepta la misma imagen como primer y ultimo keyframe para producir un bucle cerrado.
- Congelacion de escena: preserva posicion, orientacion, forma y pose de personas y objetos; los objetos en el aire permanecen suspendidos sin oscilar, girar, caer ni derivar.
- Consistencia 3D y paralaje de camara como unica fuente de movimiento aparente.
- Capacidad de encadenar o unir orbitas en planos mas largos sin costura visible al cerrar el clip sobre su primer fotograma.
- Generacion sin classifier-free guidance (modelo base destilado con guidance), sin CFG ni prompt negativo.
- Soporte de audio en el modelo base, desactivado en el flujo recomendado de este LoRA.

## Casos de uso

- Turismo y bienes raices: a partir de una unica foto de una habitacion o monumento, generar una orbita de 360 grados que permita al espectador recorrer el espacio sin necesidad de captura volumetrica ni video real.
- E-commerce de producto: crear videos de producto orbitando alrededor de un articulo estatico desde una sola imagen de catalogo, con la garantia de que el clip termina en el fotograma inicial para insertarlo en carruseles o fichas.
- Escaneo 3D y fotogrametria: producir orbitas sinteticas consistentes para previsualizar reconstrucciones o alimentar pipelines de gaussian splatting con vistas adicionales.
- Efectos visuales y postproduccion: generar tomas de camara orbital sobre sujetos congelados (efecto bullet-time) para insertar en montajes sin necesidad de rodaje con multiples camaras.
- Contenido para redes sociales: convertir retratos o fotos de accion en clips de unos 3 segundos a 24 fps con movimiento de camara cinematografico y bucle perfecto.
- Demos interactivas y visores web: generar orbitas encadenables que se reproduzcan en bucle continuo en paginas de producto o experiencias inmersivas.
- Prototipado de previsualizacion en animacion: validar encuadres y trayectorias de camara sobre una escena congelada antes de invertir en render 3D completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye comparaciones cualitativas (renders del modelo base con solo primer fotograma, del base con primer y ultimo fotograma, y del base mas el LoRA con primer y ultimo fotograma) sobre cuatro casos (skate, man2, girl2, man), pero no proporciona metricas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El modelo base MiniMax-H3 requiere pesos pruned en int8 ConvRot y un text encoder Qwen3-VL-32B en nvfp4, lo que implica un consumo elevado no cuantificado en la ficha.
- GPU recomendadas: no disponible. Por el tamano del text encoder (32B) y el uso de pesos int8, se requiere hardware de clase profesional; no se confirma compatibilidad con GPU de consumo.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: ComfyUI con el repack de Comfy-Org/MiniMax-H3; entrenamiento e inferencia probados con ostris/ai-toolkit y su extension `minimax_h3`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Ajustes recomendados de inferencia: 768 x 768, 73 fotogramas (unos 3 s a 24 fps), 28 pasos, sin guidance, fuerza LoRA 1.0, audio desactivado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Control de camara | Cierre de bucle | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 FL2VA (base) | Base image-to-video | Movimiento de camara pero deriva y no regresa al inicio | No de fabrica (se congela con keyframes identicos) | minimax-h3-community-license-agreement | HuggingFace (MiniMaxAI/MiniMax-H3) |
| MiniMax-H3 Ref2VA (base) | Base referencia-a-video | Referencias laxas de apariencia | No (no termina en fotograma conocido) | minimax-h3-community-license-agreement | HuggingFace (MiniMaxAI/MiniMax-H3) |
| Este LoRA sobre FL2VA | Adaptador LoRA | Orbita 360 geometricamente consistente | Si, cierra sobre el primer fotograma | minimax-h3-community-license-agreement | HuggingFace (robertbschuette/MiniMax-H3-360-Orbit-LoRA) |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros adaptadores o modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El LoRA esta disenado para un prompt especifico y debe usarse literalmente; desviarse del prompt de instancia puede degradar el resultado.
- El entrenamiento se basa en 28 clips de splats gaussianos humanos estaticos, por lo que la generalizacion a escenas muy dinamicas, con muchos sujetos o con geometria no representada en el dataset no esta garantizada.
- No se han publicado evaluaciones cuantitativas ni datos sobre sesgos; el riesgo de alucinacion visual (objetos anadidos, morphing) existe aunque el prompt lo prohibe explicitamente.
- La licencia es la minimax-h3-community-license-agreement, no una licencia open source estandar; es necesario revisar sus terminos antes de cualquier uso comercial.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento con texto en distintos idiomas.
- El adaptador depende del modelo base MiniMax-H3 FL2VA pruned en int8 ConvRot y del text encoder Qwen3-VL-32B en nvfp4; los requisitos de hardware no estan cuantificados y pueden ser elevados.
- El adaptador de entrenamiento `ostris/minimax_h3_training_adapter` v1 solo se usa durante el entrenamiento y no es necesario en inferencia, pero el flujo esta atado a ai-toolkit y ComfyUI.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robertbschuette/MiniMax-H3-360-Orbit-LoRA
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repack pruned de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- Trainer ai-toolkit: https://github.com/ostris/ai-toolkit
- Adaptador de entrenamiento: https://huggingface.co/ostris/minimax_h3_training_adapter
