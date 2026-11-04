# selective-image-analogy/SIA-weights

## Resumen

SIA (Selective Image Analogy) es un conjunto de adaptadores LoRA para edicion de imagenes por analogia visual, presentado en SIGGRAPH Asia 2026. El modelo resuelve un problema concreto: dada una pareja de demostracion (A, A') que contiene varias ediciones simultaneas, SIA permite seleccionar cuales de esas ediciones se transfieren a una imagen nueva B, suprimiendo las que no interesan. Los pesos se distribuyen como adaptadores sobre dos backbones de difusion distintos: FLUX.2 [klein] Base 9B y Qwen-Image-2.1.

El repositorio incluye dos componentes por backbone. AnaLoRA aprende la analogia completa a partir de tuplas (A, A', B), mientras que ExLoRA es un segundo LoRA que se aplica unicamente en las posiciones de token de las ediciones que se desean suprimir. La combinacion de ambos permite el control selectivo, y los checkpoints de la carpeta `exlora/` son autocontenidos porque incluyen un AnaLoRA reentrenado durante la segunda etapa.

Es relevante ahora porque aborda una limitacion practica de los modelos de edicion por imagen de referencia: la mayoria transfiere todos los cambios de la demostracion sin distincion. SIA anade un mecanismo de compuerta a nivel de token que separa ediciones deseadas de indeseadas, con un peso total de solo 0,6 GB y rango 16. El uso previsto es exclusivamente de investigacion, ya que ambos backbones tienen licencias no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (AnaLoRA + ExLoRA) sobre modelos de difusion texto-a-imagen |
| Parametros totales | No disponible (adaptadores LoRA, rango 16, alpha 16, float32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | No disponible (pesos LoRA en float32; la cuantizacion depende del backbone) |
| Idiomas soportados | Ingles (descripciones de edicion) |
| Licencia | Por backbone: FLUX Non-Commercial License v2.1 para `flux2_klein/`; Qwen Research License Agreement para `qwen_image21/` |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors`, `analora.safetensors`, `exlora.safetensors`) con `config.json` por carpeta |

## Arquitectura y entrenamiento

SIA se implementa como adaptadores LoRA de rango 16 y alpha 16 en float32 sobre dos backbones de difusion. AnaLoRA se entrena en una primera etapa para aprender la analogia completa a partir de tuplas (A, A', B); ExLoRA se entrena en una segunda etapa y se aplica solo en las posiciones de token de las ediciones suprimidas. Durante la etapa 2, AnaLoRA se reajusta junto a ExLoRA con una funcion de perdida de anclaje (anchor weight 0,1), de modo que el AnaLoRA dentro de `exlora/` difiere del de `analora/`.

Los datos provienen del config `subjects` del dataset SIA-Multi-Edit-Analogy, un conjunto sintetico donde las imagenes editadas se generaron con modelos de edicion. Cada demostracion contiene entre 2 y 4 ediciones, con descripciones en ingles y resolucion aproximada de 384x512. Los hiperparametros varian por backbone: para FLUX.2 [klein], learning rate 5e-05 en ambas etapas, batch 16 (18 en ExLoRA) y checkpoints publicados en los pasos 2000 (AnaLoRA) y 250 (ExLoRA); para Qwen-Image-2.1, learning rate 0,0002 en AnaLoRA y ExLoRA, 5e-05 para el AnaLoRA de la etapa 2, batch 16 y checkpoints en los pasos 2000 y 5000. Los checkpoints publicados son intermedios: las ejecuciones se detuvieron antes de la longitud planificada.

## Capacidades

- Edicion de imagenes por analogia visual: transfiere ediciones de una pareja de demostracion (A, A') a una imagen nueva B.
- Transferencia selectiva: permite elegir que ediciones de la demostracion se aplican y cuales se suprimen mediante ExLoRA.
- Soporte de multiples ediciones por demostracion: entre 2 y 4 ediciones simultaneas en cada ejemplo.
- Control a nivel de token: ExLoRA actua solo en las posiciones correspondientes a las ediciones suprimidas.
- Compatibilidad con dos backbones distintos: FLUX.2 [klein] Base 9B y Qwen-Image-2.1.
- Entrada en lenguaje natural: las ediciones se describen en ingles.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un adaptador de generacion de imagen.

## Casos de uso

- Edicion selectiva en flujos de retoque: dado un par de imagenes que muestra varios cambios (por ejemplo, cambio de fondo y de iluminacion), transferir solo el cambio de iluminacion a una foto nueva, manteniendo el fondo original.
- Investigacion en analogia visual: reproducir y extender los experimentos del paper sobre transferencia selectiva de ediciones con los checkpoints publicados.
- Prototipado de herramientas de edicion por referencia: integrar el adaptador en una interfaz donde el usuario marque que ediciones de la demostracion desea aplicar y cuales descartar.
- Generacion de variaciones controladas de producto: aplicar un estilo o acabado concreto de una imagen de referencia a un catalogo nuevo sin arrastrar otros cambios de la referencia.
- Evaluacion de fuga de ediciones: usar ExLoRA como caso de estudio para medir hasta que punto las ediciones suprimidas se filtran en la salida, tal como analiza el paper.
- Experimentos academicos de personalizacion de modelos de difusion: comparar el comportamiento de los mismos adaptadores sobre dos backbones con arquitecturas y licencias distintas.
- Docencia y demostraciones en SIGGRAPH: emplear los pesos y el codigo del repositorio para ilustrar tecnicas de LoRA condicionado por tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; depende enteramente del backbone. Los adaptadores suman 0,6 GB en disco y se cargan en float32 junto al modelo base.
- FLUX.2 [klein] Base 9B: backbone de 9B parametros; requiere una GPU con VRAM suficiente para un modelo de difusion de ese tamano (no se especifica la cifra exacta en la informacion disponible).
- Qwen-Image-2.1: backbone de difusion de gran tamano; la inferencia usa KV cache activada y 40 pasos de denoising, lo que incrementa los requisitos de memoria frente a configuraciones sin cache.
- GPU recomendadas: no disponible. Por el tamano de los backbones, se requiere previsiblemente hardware de clase profesional (A100, H100) o GPUs de consumo de gama alta con cuantizacion, aunque no se confirma en la informacion.
- Despliegue: los pesos no forman una pipeline Diffusers autonoma; se usan con el codigo del repositorio de GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Ajustes de inferencia: FLUX.2 [klein] con imagenes nativas de 384x512 y 28 pasos de denoising; Qwen-Image-2.1 con `resolution: 512` (dimensionado por area) y 40 pasos con KV cache.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SIA (este modelo) | LoRA de analogia selectiva sobre FLUX.2 [klein] y Qwen-Image-2.1 | Rango 16 (adaptador) | No aplica | No comercial (por backbone) | Pesos en HuggingFace, codigo en GitHub |
| FLUX.2 [klein] Base 9B | Modelo de difusion base | 9B | No aplica | FLUX Non-Commercial License v2.1 | HuggingFace |
| Qwen-Image-2.1 | Modelo de difusion base | No disponible | No aplica | Qwen Research License Agreement | HuggingFace |

No se dispone de datos de rendimiento comparativo entre SIA y otros metodos de edicion por analogia en la informacion proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: ambas licencias de backbone prohiben el uso comercial.
- La transferencia selectiva puede fallar: las ediciones que se desean suprimir pueden filtrarse parcialmente, o las que se conservan pueden aplicarse con debilidad.
- Entrenado sobre un dataset sintetico generado con modelos de edicion, lo que puede introducir sesgos y artefactos propios de esos generadores.
- Solo admite descripciones de edicion en ingles.
- Resolucion de entrenamiento limitada a aproximadamente 384x512, con 2 a 4 ediciones por demostracion.
- Los checkpoints son intermedios y las ejecuciones se detuvieron antes de su longitud planificada; no representan el entrenamiento completo.
- La licencia FLUX exige, en su seccion 2(e), mantener filtros de contenido o revisar las salidas en busca de contenido ilegal o infractor, e indicar que las salidas son generadas por IA cuando la ley lo requiera.
- No es un producto oficial de Qwen ni de Black Forest Labs, y no cuenta con su respaldo.
- No es una pipeline Diffusers autonoma: requiere el codigo del repositorio para funcionar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/selective-image-analogy/SIA-weights
- Pagina del proyecto: https://selective-image-analogy.github.io/
- Codigo: https://github.com/alimohammadiamirhossein/selective-image-analogy
- Paper (DOI): https://doi.org/10.1145/3829340.3842205
- Dataset: https://huggingface.co/datasets/selective-image-analogy/SIA-Multi-Edit-Analogy
- Backbone FLUX.2 [klein] Base 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B
- Backbone Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
