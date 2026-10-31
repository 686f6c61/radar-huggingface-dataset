# silvermoong/Qwen-Image-Sharp-VAE

## Resumen

Qwen-Image Sharp VAE es un VAE (autoencoder variacional) alternativo para el ecosistema de difusion de Qwen-Image, desarrollado por el usuario silvermoong y publicado en HuggingFace. Se trata de un reemplazo directo (drop-in) del VAE original de Qwen-Image, afinado a partir del trabajo previo de Felldude (Qwen-Image-HDR-VAE), cuyo objetivo es producir imagenes mas nitidas y claras sin sobreexposicion: lineas, ojos, pestañas y cabello se ven mas definidos con solo sustituir el VAE en la pipeline, sin palabras trigger, nodos extra ni reentrenamiento.

El modelo esta pensado para funcionar con Anima, Krea-2 y Qwen-Image, y destaca especialmente en flujos con hires fix, donde el VAE participa en el punto medio de la pipeline y determina la calidad de partida de la segunda pasada. Segun las mediciones del autor, la ganancia de nitidez (gradiente medio de luminancia) oscila entre el +26% y el +97% segun escena y fuerza de denoise, reduciendo ademas los altas luces quemadas en todas las combinaciones probadas.

Es relevante porque demuestra que el VAE, componente a menudo ignorado, tiene un impacto medible y sustancial en la calidad final de la imagen generada, y ofrece tres intensidades (x0.5, x1.0, x1.5) para adaptarse a distintos estilos. Se distribuye bajo licencia Apache 2.0, en formato safetensors BF16, con cada variante pesando 242 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE (autoencoder variacional) para modelos de difusion; variante afinada del VAE de Qwen-Image |
| Parametros totales | no disponible (242 MB por archivo en BF16) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision/difusion, no de lenguaje) |
| Tipos de cuantizacion | BF16 (sin cuantizacion) |
| Idiomas soportados | no aplicable |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un VAE derivado del VAE original de Qwen-Image, construido como fine-tune sobre Felldude/Qwen-Image-HDR-VAE. Su funcion en la pipeline de difusion es codificar imagenes en latentes y decodificar latentes en imagenes; la modificacion introducida ajusta el comportamiento de decodificacion para maximizar la nitidez (gradiente de luminancia) manteniendo la exposicion y los colores originales, evitando el sobredimensionado de altas luces tipico de VAEs afinados para contraste.

No se ha publicado informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset ni el metodo de optimizacion concreto. La innovacion practica principal es la publicacion de tres variantes de intensidad (x0.5, x1.0 por defecto y x1.5), que corresponden a distintos grados del mismo ajuste, y la documentacion cuantitativa del efecto del VAE dentro del flujo de hires fix, donde el VAE decodifica el latente de la primera pasada, la imagen resultante se amplifica con un upscaler externo y se recodifica para la segunda pasada.

## Capacidades

- Decodificacion de latentes de Qwen-Image con mayor nitidez: lineas, pestanas y hebras de cabello mas definidas respecto al VAE original.
- Reduccion de altas luces quemadas (pixeles con canal ≥ 254) en todas las escenas y configuraciones probadas por el autor.
- Integracion directa (drop-in) como sustituto de `qwen_image_vae` en pipelines de Anima, Krea-2 y Qwen-Image.
- Compatibilidad con ComfyUI, Forge y Forge Neo sin nodos adicionales ni palabras trigger.
- Tres intensidades seleccionables: x0.5 (estilos suaves o painterly), x1.0 (recomendada por defecto) y x1.5 (maxima nitidez para cel shading y lineart).
- Beneficio maximo en flujos hires fix con denoise bajo (0.15), donde conserva el detalle decodificado antes del upscaler.

## Casos de uso

- Hires fix en generacion anime: al decodificar con mas nitidez el latente de la primera pasada, el upscaler (por ejemplo `4x-AnimeSharp`) parte de bordes limpios y el detalle se conserva hasta la imagen final; la ganancia medida llega al +97% en retratos con denoise 0.15.
- Generacion de lineart y cel shading: la variante x1.5 produce contornos oscuros muy marcados, adecuada para ilustracion de estilo manga o animacion tradicional.
- Retratos de anime con ADetailer: la mejora en ojos, pestanas y cabello es especialmente visible en primeros planos, con menos altas luces quemadas en piel.
- Estilos painterly o thick paint: la variante x0.5 aporta nitidez sutil sin romper la textura pictorica.
- Escenas con contraluz o fondos complejos: reduce el porcentaje de pixeles quemados (por ejemplo, de 1.80% a 0.05% en la escena del castillo), util en paisajes con cielo o iluminacion intensa.
- Produccion con Forge o ComfyUI: sustitucion directa del VAE en workflows existentes de Anima o Krea-2 sin modificar nodos, seeds ni prompts, ideal para actualizar pipelines ya desplegadas.
- Comparativas A/B de calidad: al mantener colores y exposicion identicos al VAE original, permite aislar el efecto de nitidez en pruebas de calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.), al no tratarse de un modelo de lenguaje. Las metricas de la model card del autor son mediciones propias de nitidez y recorte de altas luces sobre siete escenas de prueba:

| Escena | Original: nitidez / quemado | Qwen-Image Sharp: nitidez / quemado | Ganancia de nitidez |
|---|:---:|:---:|:---:|
| Angel | 6.48 / 3.04% | 11.26 / 1.60% | +74% |
| Miku | 6.87 / 4.31% | 11.21 / 1.82% | +63% |
| Portrait | 3.89 / 19.89% | 7.65 / 17.49% | +97% |
| Lineart classroom | 6.21 / 15.75% | 9.01 / 14.33% | +45% |
| Backlit beach | 2.45 / 8.70% | 3.67 / 8.26% | +50% |
| Castle scenery | 3.81 / 1.80% | 5.78 / 0.05% | +52% |
| Summer festival | 8.72 / 0.94% | 14.08 / 0.70% | +61% |

Ganancia de nitidez segun fuerza de denoise en hires fix (variante por defecto): +74%/+63%/+53% (Angel), +63%/+56%/+46% (Miku), +97%/+88%/+78% (Portrait), +45%/+39%/+36% (Lineart), +50%/+40%/+31% (Backlit beach), +52%/+37%/+26% (Castle), +61%/+53%/+42% (Festival) para denoise 0.15/0.30/0.45 respectivamente. La variante por defecto tuvo menos altas luces quemadas que el original en las 21 combinaciones escena/denoise probadas.

## Requisitos de hardware

- VRAM estimada para inferencia: 242 MB por archivo en BF16; el consumo real depende del modelo de difusion principal (Anima, Krea-2 o Qwen-Image), no del VAE.
- GPU recomendadas: las mismas que para el modelo base de difusion; el VAE en si no anade requisitos significativos.
- Cabe en GPU de consumo: si, el archivo es de 242 MB y se ejecuta en cualquier GPU compatible con los checkpoints de Qwen-Image/Anima/Krea-2 (tipicamente 8-24 GB de VRAM segun el modelo principal y la resolucion).
- Opciones de despliegue: ComfyUI, Forge y Forge Neo, como reemplazo directo del VAE en el workflow; tambien cargable con la libreria diffusers de Hugging Face.
- Latencia y throughput: no disponible; al tratarse de un VAE de tamano comparable al original, el impacto en latencia se considera despreciable.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Intensidades | Licencia | Tamano |
|---|---|---|---|---|---|
| silvermoong/Qwen-Image-Sharp-VAE | VAE alternativo | Qwen-Image / Felldude HDR-VAE | x0.5, x1.0, x1.5 | Apache 2.0 | 242 MB (BF16) |
| Felldude/Qwen-Image-HDR-VAE | VAE alternativo | Qwen-Image | no disponible | no disponible | no disponible |
| Qwen/Qwen-Image (VAE original) | VAE de referencia | Qwen-Image | unica | no disponible | no disponible |

La diferencia clave frente al VAE original es la nitidez sin perdida de exposicion; frente al HDR-VAE de Felldude, esta version anade variantes de intensidad y documentacion cuantitativa extensiva orientada a hires fix.

## Limitaciones y advertencias

- La variante x1.5 puede generar contornos oscuros excesivos y halos luminosos alrededor de bordes en hires fix; en una de las escenas de prueba fue la unica variante con mas altas luces quemadas que el original (1.17% frente a 0.94%).
- La ganancia de nitidez disminuye a medida que aumenta la fuerza de denoise en hires fix (de +26% a +78% con denoise 0.45), por lo que el beneficio es menor en flujos con re-dibujado agresivo.
- Las mediciones de nitidez y recorte proceden del autor del modelo con una configuracion concreta (SilvermoonMix-Anima29B-Evolved-V2.3, Forge Neo, Euler a, 832x1216); resultados con otros checkpoints o configuraciones no estan verificados de forma independiente.
- Solo se ha documentado compatibilidad con Anima, Krea-2 y Qwen-Image; su uso con otros modelos de la familia Qwen-Image no esta confirmado.
- La licencia Apache 2.0 permite uso comercial sin restricciones destacables.
- No se ha publicado informacion sobre el dataset de entrenamiento, por lo que no es posible evaluar sesgos potenciales introducidos en el fine-tune.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/silvermoong/Qwen-Image-Sharp-VAE
- Modelo base: https://huggingface.co/Qwen/Qwen-Image
- Modelo base del fine-tune: https://huggingface.co/Felldude/Qwen-Image-HDR-VAE
- Paper, repositorio de codigo y demos: no disponibles
