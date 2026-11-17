# AI-KSK/moss-image-five-workflows-324

## Resumen

`AI-KSK/moss-image-five-workflows-324` no es un modelo de pesos, sino una coleccion de cinco flujos de trabajo (workflows) en formato JSON para ComfyUI orientados a la generacion de imagenes con la familia de modelos MOSS Image. El repositorio agrupa 70 nodos en total, incluyendo cinco notas explicativas, y cubre escenarios como control de color mediante LoRA, comparacion de presets de muestreo (50/8/4 pasos), comparacion Base frente a SFT, entrada de layout estructurado en JSON y un flujo basico de texto-a-imagen con el modelo SFT.

El contenido esta pensado para usuarios de ComfyUI que ya dispongan de los pesos de MOSS Image y quieran reproducir configuraciones concretas de inferencia. Los grafos utilizan entradas latentes vacias (`EmptyFlux2LatentImage`) en lugar de nodos `LoadImage`, de modo que no requieren imagen de referencia. Los loaders comunes apuntan a `moss_image_sft_int8_convrot.safetensors`, `qwen3.5_9b_bf16.safetensors` (tipo CLIP `moss_image`) y `flux2-vae.safetensors`.

Es relevante ahora porque documenta configuraciones concretas de la familia MOSS Image sobre una arquitectura compatible con Flux2, pero conviene subrayar que el autor no aporta mediciones de rendimiento, URLs verificadas de descarga de pesos, ni licencias de los mismos. El propio README advierte que las portadas son material promocional y no resultados de inferencia verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los workflows apuntan a pesos MOSS Image compatibles con Flux2 y encoder Qwen3.5 9B) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (segun nombres de fichero `*_int8_convrot.safetensors`); bf16 para el encoder de texto |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (referenciados, no incluidos: el repo pesa 0.0 GB) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura del modelo subyacente MOSS Image ni sobre su proceso de entrenamiento. Los nombres de fichero referenciados en los workflows (`moss_image_sft_int8_convrot.safetensors`, `moss_image_base_int8_convrot.safetensors`) sugieren variantes Base y SFT, con cuantizacion int8 y un esquema de rotacion de canales ("convrot"), pero el autor no documenta detalles tecnicos ni procedencia.

Los grafos emplean nodos propios de un pipeline tipo Flux2: `EmptyFlux2LatentImage` para el latente vacio, `SkipLayerGuidanceDiTSimple` (SLG) como guia de capas, y un encoder de texto Qwen3.5 9B en bf16 con tipo CLIP `moss_image`. Se incluyen LoRAs adicionales para control de color/profundidad, aceleracion DMD a 8 pasos y una variante Turbo a 4 pasos, pero no se aportan datos sobre el entrenamiento de estas LoRAs ni sobre su procedencia oficial.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024x1024 con batch size 1 mediante el modelo MOSS Image SFT.
- Control de color y profundidad mediante LoRA insertada antes del nodo SLG (flujo 01).
- Muestreo acelerado con presets de 50 pasos, 8 pasos (DMD) y 4 pasos (Turbo) en configuraciones comparables (flujo 02).
- Comparacion lado a lado de variantes Base y SFT compartiendo condicionamiento de texto, latente y VAE (flujo 03).
- Entrada de layout estructurado mediante cadena JSON con `bbox_coord_space=abs_centralized` y `bbox_format=yxyx` en el nodo de encoding de texto (flujo 04).
- Punto de partida simple de texto-a-imagen con 50 pasos y CFG 3 usando el modelo SFT (flujo 05).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Reproduccion de experimentos de control de color: el flujo 01 permite cargar una LoRA de control de color/profundidad con `strength_model=0.8` e inspeccionar su efecto antes del nodo SLG, util para iterar sobre prompts de iluminacion y paleta.
- Comparativa de velocidad frente a calidad: el flujo 02 comparte prompt y latente entre tres ramas (50 pasos/CFG 3, 8 pasos/CFG 1 con DMD, 4 pasos/CFG 1 con Turbo), lo que permite medir empiricamente el compromiso entre pasos y calidad en un mismo hardware.
- Evaluacion Base frente a SFT: el flujo 03 ejecuta ambos modelos con arrays de sampler identicos (`[777, "fixed", 50, 3, "euler", "simple", 1]`) y condicionamiento compartido, adecuado para comparaciones controladas de calidad.
- Generacion con layout estructurado: el flujo 04 permite enviar una peticion JSON con `summary` e `items` y coordenadas `yxyx` en espacio absoluto centralizado, util para composiciones con posicionamiento controlado de elementos textuales.
- Punto de partida para nuevos usuarios de MOSS Image en ComfyUI: el flujo 05 ofrece una configuracion minima de texto-a-imagen a 50 pasos que sirve como plantilla base para experimentar.
- Integracion en pipelines de ComfyUI existentes: los JSON conservan los bytes originales y pueden importarse directamente, lo que facilita incorporar estos grafos a entornos de prototipado visual ya montados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la coleccion no constituye un benchmark completado y que no aporta ratios de velocidad medidos, ranking de calidad ni mediciones de hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los pesos se referencian en int8 (`*_int8_convrot.safetensors`) y el encoder de texto en bf16 (`qwen3.5_9b_bf16.safetensors`), pero no se aportan mediciones.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no verificada por el autor.
- Opciones de despliegue: ComfyUI, con nodos MOSS loader/encoder, `EmptyFlux2LatentImage` y `SkipLayerGuidanceDiTSimple`. No se documentan alternativas como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos ni datos de rendimiento que permitan establecer una comparativa fiable.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es una coleccion de workflows JSON (tamano 0.0 GB); los ficheros `moss_image_*` deben obtenerse por separado.
- No se suministran URLs verificadas de descarga de pesos, lockfile de versiones probadas, mediciones de hardware ni licencias de los pesos.
- Las portadas incluidas son material promocional, no resultados de inferencia verificados ni entradas por defecto.
- No se ha probado el exito de ejecucion ni las dimensiones reales de salida de los grafos.
- Los flujos 01 y 02 presentan notas que corrigen etiquetas previas (por ejemplo, la LoRA de color no es de destilacion) y dejan sin verificar la procedencia oficial de las LoRAs.
- En el flujo 02, los pasos no son la unica variable cambiada: tambien difieren LoRAs, SLG y condicionamiento negativo, por lo que no permite aislar el efecto de los pasos.
- En el flujo 03, arrays de sampler identicos son evidencia de configuracion, no prueba de comportamiento identico en tiempo de ejecucion ni de superioridad general de Base o SFT.
- El flujo 04 no es un editor visual de cajas ni un motor de layout verificado, sino una peticion estructurada enviada al nodo de encoding de texto.
- Los arrays de sampler contienen valores de control adicionales a los nombres de widget listados; deben confirmarse en la UI correspondiente.
- No se documentan sesgos, riesgos de alucinacion visual, limitaciones de idioma ni restricciones de licencia para uso comercial, al no estar disponible la licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/moss-image-five-workflows-324
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
