# AhsanHareem/reelbids-ltx25-camera-lora

## Resumen

ReelBids es una LoRA de control de cámara para el modelo de generación de vídeo LTX-2.5 de Lightricks, desarrollada por AhsanHareem. Se trata de un adaptador de rango 32 que ejecuta un movimiento de cámara tipo dolly-in (avance hacia el sujeto) a siete velocidades seleccionables mediante tokens de activación en el prompt. A diferencia de las LoRAs de cámara oficiales de LTX-2, que son de una sola velocidad y están limitadas a la versión 19B, este adaptador cubre todo el rango de velocidades con una única pieza sobre el transformer de difusión LTX-2.5 de 22B.

El adaptador se entrena específicamente para image-to-video con condicionamiento del primer fotograma con probabilidad 1.0, por lo que siempre debe partirse de una imagen fija. El repositorio pesa 0,2 GB y las claves del adaptador se distribuyen ya en formato ComfyUI con prefijo `diffusion_model.`, lo que permite cargarlo con un cargador de LoRA estándar sin conversión. La licencia es "other", por lo que conviene verificar los términos antes de un uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 32 sobre transformer de difusión LTX-2.5 22B (image-to-video) |
| Parametros totales | no disponible (repo de 0,2 GB; modelo base de 22B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vídeo: 97 fotogramas @ 24fps, resolución nativa 1024x576) |
| Tipos de cuantizacion | no disponible (adaptador LoRA; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible (el text encoder del modelo base es gemma4-12b) |
| Licencia | other |
| Formato de pesos | no especificado en la model card (claves con prefijo `diffusion_model.` para ComfyUI) |

## Arquitectura y entrenamiento

La LoRA se entrena sobre el transformer de difusión `ltx-2.5-22b-dev-transformer-bf16` de Lightricks, con el text encoder `gemma4-12b-with-proj-ltx-2.5-bf16`. El adaptador tiene rango 32 y alpha 32, y se aplica únicamente a las capas de atención de vídeo (`attn1.*` y `attn2.*`). El entrenamiento se realizó sobre 544 clips con 2000 pasos en una única GPU H100; el checkpoint óptimo se encuentra en el paso 1250, con un error absoluto medio de zoom del 3,4% frente al ground truth en las velocidades sp05, sp20 y sp50.

La velocidad del movimiento se selecciona mediante un token de activación en el prompt (`sp05`, `sp10`, `sp15`, `sp20`, `sp30`, `sp40` o `sp50`), que se correlaciona con velocidades de cámara de Blender de 0,5 a 5,0. El entrenamiento se realiza con condicionamiento del primer fotograma con probabilidad 1.0, lo que implica que la generación siempre debe partir de una imagen fija. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al entrenamiento supervisado.

## Capacidades

- Control de cámara dolly-in (avance) sobre LTX-2.5 22B en modo image-to-video.
- Siete velocidades seleccionables mediante tokens de activación en el prompt (`sp05` a `sp50`).
- Zoom medido de 1,108x (sp05) a 2,285x (sp50) sobre 97 fotogramas.
- Integración directa en ComfyUI mediante cargador de LoRA estándar, sin conversión de claves.
- Compatible con el pipeline de LTX-2.5 a resolución nativa 1024x576 y 24 fps.
- No incluye capacidades de texto, código, razonamiento, tool calling ni agentes: es exclusivamente un adaptador de control de cámara para generación de vídeo.

## Casos de uso

- Producción de vídeo publicitario: generar tomas con avance de cámara controlado para anuncios de producto, seleccionando la velocidad según la intensidad del plano deseado.
- Creación de contenido para redes sociales: producir clips cortos de 97 fotogramas con movimiento de cámara cinematográfico a partir de una imagen fija, adecuado para Reels, TikTok o Shorts.
- Previsualización de planos (storyboarding): crear previsualizaciones de movimientos de cámara dolly-in para planificar rodajes reales o animaciones 3D, con control de velocidad ajustable.
- Automatización de b-roll en edición de vídeo: generar material de relleno con movimiento de cámara controlado para insertar en proyectos de edición sin necesidad de rodaje adicional.
- Pruebas de concepto para cine y animación: evaluar cómo se comporta un movimiento de cámara concreto sobre una escena generada antes de comprometer recursos de producción.
- Investigación en control de cámara para modelos de difusión: servir como referencia de un adaptador multi-velocidad frente a las LoRAs de velocidad única de LTX-2, con datos de error de zoom medidos frente a ground truth.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes datos de rendimiento:

| Metrica | Valor |
|---|---|
| Error absoluto medio de zoom (sp05/sp20/sp50) | 3,4% frente a ground truth |
| Zoom medido sp05 | 1,108x sobre 97 fotogramas |
| Zoom medido sp10 | ~1,22x sobre 97 fotogramas |
| Zoom medido sp20 | 1,591x sobre 97 fotogramas |
| Zoom medido sp50 | 2,285x sobre 97 fotogramas |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB, pero el modelo base LTX-2.5 de 22B requiere una GPU con VRAM suficiente para inferencia de vídeo a 1024x576.
- El entrenamiento se realizó en una única GPU H100, lo que da una referencia del hardware mínimo para reproducir el entrenamiento.
- Para inferencia, los requisitos dependen del modelo base LTX-2.5; no se especifican en la model card.
- La integración en ComfyUI permite cargar el adaptador con un cargador de LoRA estándar; el despliegue en producción requiere un servidor de inferencia compatible con LTX-2.5 (no especificado).
- No se dispone de datos de latencia ni throughput publicados.

## Comparativa con modelos similares

| Modelo | Base | Velocidades | Rango | Resolucion | Licencia |
|---|---|---|---|---|---|
| ReelBids LTX-2.5 dolly-in | LTX-2.5 22B | 7 (sp05-sp50) | 32 | 1024x576 | other |
| Camera Controls LTX-2.3 (Civitai) | LTX-2.3 | no disponible | no disponible | no disponible | no comercial |
| LoRAs de cámara oficiales LTX-2 19B | LTX-2 19B | 1 velocidad por LoRA | no disponible | no disponible | no disponible |

La ventaja principal de ReelBids frente a las LoRAs oficiales de LTX-2 es que un único adaptador cubre siete velocidades mediante tokens de activación, en lugar de requerir una LoRA distinta por velocidad. La comparativa con las LoRAs de LTX-2.3 de Civitai no es directa porque no se dispone de especificaciones detalladas de esas alternativas.

## Limitaciones y advertencias

- La nitidez del renderizado se degrada en el último tercio del clip en velocidades sp20 y superiores; el autor atribuye este efecto a la coherencia del modelo base en recorridos largos, no al adaptador.
- El modelo se entrena exclusivamente para image-to-video con condicionamiento del primer fotograma; no es compatible con generación text-to-video directa sin imagen de entrada.
- La licencia "other" requiere verificar los términos específicos antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un modelo reciente sin validación comunitaria amplia.
- No se dispone de información sobre idiomas soportados, sesgos del modelo ni riesgos de alucinación visual específicos.
- Los tokens de activación deben usarse como prefijo del prompt; un uso incorrecto puede no activar el control de cámara.
- Las mediciones de zoom para sp15, sp30 y sp40 no se han publicado (marcadas con "—" en la model card).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AhsanHareem/reelbids-ltx25-camera-lora
- Modelo base LTX-2.5 (Lightricks): https://huggingface.co/Lightricks/LTX-2.5
- LTX-2.3 (Lightricks): https://huggingface.co/Lightricks/LTX-2.3
- LoRAs de control de cámara para LTX-2.3 en Civitai: https://civitai.com/models/2622189/camera-controls-ltx-23
- Plataforma LTX 2.5: https://ltx25.net/
