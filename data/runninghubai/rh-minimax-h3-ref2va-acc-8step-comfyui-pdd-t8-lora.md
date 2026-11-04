# RunningHubAI/rh-minimax-h3-ref2va-acc-8step-comfyui-pdd-t8-lora

## Resumen

`rh-minimax-h3-ref2va-acc-8step-comfyui-pdd-t8-lora` es un adaptador LoRA publicado por RunningHubAI, derivado del modelo base `minimax-h3`. El nombre del repositorio indica que se trata de un ajuste fino orientado a un flujo de referencia a vídeo/audio (ref2va), con un esquema de aceleración a 8 pasos y una variante de destilación (pdd) etiquetada como T8. El artefacto se distribuye como un único fichero de pesos en formato safetensors de aproximadamente 1582 MiB (1,7 GB de repositorio).

El modelo está pensado para su uso dentro de ComfyUI y de la plataforma RunningHub, y depende de un nodo personalizado externo (`comfyui-minimax-h3-audio-T8`) para funcionar. No se trata de un modelo de lenguaje generalista, sino de un adaptador de difusión para generación condicionada por referencia, por lo que sus casos de uso se sitúan en el terreno de la generación audiovisual y no en el de texto o razonamiento.

La información publicada por el autor es muy escasa: no se detallan arquitectura del modelo base, número de parámetros, longitud de contexto, idiomas, licencia explícita ni resultados de benchmarks. La ficha siguiente refleja únicamente lo que consta en los metadatos y la model card, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre el modelo base minimax-h3 (arquitectura del base no disponible) |
| Parametros totales | no disponible (pesos LoRA: ~1582 MiB en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`MiniMax-H3-Ref2VA-Acc-8Step_comfyui_pdd-T8.safetensors`) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente pesos de un adaptador LoRA, no un modelo completo. Según la model card, el adaptador se ha afinado a partir de `minimax-h3`, y su nombre sugiere una especialización en el modo "ref2va" (referencia a vídeo/audio), con un esquema de aceleración a 8 pasos de muestreo y una variante "pdd" con etiqueta T8. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO; tampoco se detalla el rango del LoRA ni las capas objetivo.

No hay información publicada sobre innovaciones técnicas del adaptador más allá de la mención a los 8 pasos de inferencia, que apunta a una destilación de pasos para reducir el coste de muestreo. El funcionamiento requiere el nodo de ComfyUI `comfyui-minimax-h3-audio-T8`, alojado en el repositorio de GitHub del autor T8mars, lo que sugiere que el adaptador está diseñado para un pipeline de audio y vídeo dentro de ComfyUI.

## Capacidades

- Generación condicionada por referencia (ref2va) dentro de un pipeline de ComfyUI, presumiblemente orientada a vídeo y audio.
- Inferencia acelerada a 8 pasos de muestreo, según indica el nombre del adaptador.
- Integración con la plataforma RunningHub y su API para ejecución en la nube.
- Carga como LoRA sobre el modelo base minimax-h3, lo que permite combinarlo con otros adaptadores o con el checkpoint base.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo ni modos de pensamiento; el artefacto es un adaptador de generación, no un modelo conversacional.

## Casos de uso

- Generación de vídeo condicionada por una referencia visual: cargando el LoRA sobre minimax-h3 en ComfyUI y usando el nodo `comfyui-minimax-h3-audio-T8`, se puede producir vídeo a partir de una imagen o clip de referencia con un muestreo reducido a 8 pasos.
- Prototipado rápido de pipelines audiovisuales: al ser un LoRA ligero (~1,7 GB), permite iterar sobre el modelo base sin recargar checkpoints completos, útil en entornos de investigación con recursos limitados.
- Producción de contenido en la nube mediante RunningHub: el adaptador está publicado para su uso directo en la plataforma, lo que facilita ejecutar el pipeline sin infraestructura propia a través de su API.
- Experimentación con destilación de pasos: el esquema de 8 pasos permite evaluar la calidad frente a muestreos más largos, útil para estudiar el compromiso entre fidelidad y latencia.
- Integración en flujos de ComfyUI existentes: al ser un LoRA, se puede insertar en grafos ya construidos para el modelo base y comparar resultados frente al checkpoint sin adaptador.
- Investigación sobre adaptadores de bajo rango en modelos de difusión: sirve como caso de estudio de un LoRA especializado en una tarea concreta (ref2va) publicado con pesos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El LoRA pesa ~1582 MiB, pero el consumo real depende del modelo base minimax-h3, cuyos requisitos no se documentan.
- GPU recomendadas: no disponible; al depender del base, no se puede determinar sin conocer sus especificaciones.
- ¿Cabe en GPU consumer? No determinable con la información publicada; el LoRA por sí solo no es suficiente para inferir.
- Opciones de despliegue: ComfyUI (con el nodo `comfyui-minimax-h3-audio-T8`), plataforma RunningHub y su API. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un adaptador de difusión.
- Latencia y throughput estimados: no disponibles. El nombre indica 8 pasos de muestreo, pero no se publican tiempos medidos.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (LoRA ref2va sobre minimax-h3) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información muy escasa: no se publican arquitectura del base, parámetros, contexto, idiomas ni benchmarks, lo que impide evaluar su calidad de forma objetiva.
- Licencia no especificada: la model card remite a la licencia del proyecto original o upstream, pero no la concreta; el uso comercial queda en una zona gris hasta verificar la licencia de minimax-h3.
- Dependencia de un nodo externo: requiere `comfyui-minimax-h3-audio-T8`, mantenido por un tercero, lo que introduce un riesgo de mantenimiento y compatibilidad.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Riesgo de alucinación y sesgos: no evaluable sin documentación ni pruebas; al ser un modelo generativo audiovisual, los riesgos típicos son artefactos visuales, incoherencias temporales y sesgos presentes en los datos del base.
- Repositorio de 1,7 GB: el tamaño corresponde al LoRA, no al modelo completo; quien lo despliegue debe disponer además del checkpoint base minimax-h3.
- Fecha de creación y actualización (2026-11-04) muy reciente respecto a la consulta: ecosistema y soporte aún sin consolidar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RunningHubAI/rh-minimax-h3-ref2va-acc-8step-comfyui-pdd-t8-lora
- Nodo ComfyUI requerido: https://github.com/T8mars/comfyui-minimax-h3-audio-T8
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2092684703085195266
- Página del autor: https://www.runninghub.cn/user-center/1819214514410942465
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
