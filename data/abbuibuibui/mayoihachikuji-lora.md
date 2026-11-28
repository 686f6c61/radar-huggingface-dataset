# abbuibuibui/MayoiHachikuji-Lora

## Resumen

MayoiHachikuji-Lora es un LoRA de personaje para modelos de difusion SDXL, desarrollado por el usuario abbuibuibui, que reproduce a Mayoi Hachikuji (八九寺真宵), personaje de la serie *Monogatari*. Se trata de un adaptador de bajo rango entrenado sobre el modelo base waiIllustriousSDXL v17, un checkpoint de la familia Illustrious orientado a generacion de imagenes anime. El repositorio alberga tres linajes distintos de pesos: el LoRA original para WAI/Illustrious en la raiz, un LoRA para AutismMix Pony bajo el directorio `autism_pony/` y un LoRA para MOSS-Image bajo `moss/`, cada uno con su propio modelo base y prompts incompatibles entre si.

El modelo resuelve el problema de la generacion consistente de un personaje concreto en pipelines de difusion texto-a-imagen, permitiendo invocar su identidad mediante tokens de activacion especificos (`mayoi_hachikuji` para identidad y `mayoi_hachikuji_school_uniform` para el atuendo). Incluye siete epocas de entrenamiento (E1-E7), con una evaluacion comparativa publica que recomienda la epoca E6 a fuerza 0.8 como configuracion por defecto.

Es relevante ahora porque los LoRA de personaje sobre SDXL/Illustrious son un componente habitual en flujos de trabajo de generacion de arte anime con ComfyUI, y este repositorio documenta de forma inusualmente detallada el proceso de seleccion de epoca y fuerza, con hashes SHA-256 por archivo y una matriz de evaluacion de 10 escenas por 4 intensidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL; base waiIllustriousSDXL v17 |
| Parametros totales | no disponible (rango LoRA 64, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-a-imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (cada archivo de 456.491.420 bytes) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 aplicado sobre el checkpoint SDXL waiIllustriousSDXL v17. El entrenamiento empleo AdamW en precision bf16, con buckets de hasta 1536 y 7 epocas. El dataset consta de 70 pares de imagenes (con el token de atuendo `mayoi_hachikuji_school_uniform` compartido entre las variantes principal y alternativa en esta evaluacion) con 2 repeticiones, y las leyendas se generaron con `keep_tokens = 2`, omitiendo a menudo el color de pelo y ojos, que deben anadirse explicitamente en el prompt. El entrenamiento se realizo en un NVIDIA DGX Spark con ComfyUI.

La innovacion documental del repositorio es su proceso de seleccion: una primera ronda cribo E1-E7 a fuerza 0.8 y una tercera ronda realizo una matriz sobre E5-E7 cruzada con 10 escenas y 4 intensidades (0.4, 0.6, 0.8 y 1.0). La conclusion es que E6 a 0.8 reproduce de forma mas fiable los rasgos distintivos: cinta blanca alada, ojos marrones, lineas rosadas en las mejillas, coletas marron oscuro, lazos verdes en forma de hoja, falda azul con estrella amarilla, mochila rosa de caracol y zapatos rosas. El repositorio incluye ademas dos linajes adicionales entrenados sobre AutismMix Pony (recomendado E6 a 1.0) y MOSS-Image, con pesos en subdirectorios separados y prompts no intercambiables.

## Capacidades

- Generacion de imagenes de personaje consistente: reproduce la identidad de Mayoi Hachikuji mediante el token `mayoi_hachikuji`.
- Control de atuendo mediante token dedicado (`mayoi_hachikuji_school_uniform`), con variantes principal y alternativa.
- Compatibilidad con prompts en ingles y chino (idiomas declarados en la model card).
- Integracion en ComfyUI y en pipelines basados en la libreria diffusers.
- Ajuste de intensidad del efecto mediante la fuerza del LoRA (rango evaluado de 0.4 a 1.0).
- Multiples epocas disponibles (E1-E7) para elegir entre fidelidad, flexibilidad o variacion estilistica.
- Tres linajes de modelo base (WAI/Illustrious, AutismMix Pony, MOSS-Image) para distintos estilos de render.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente: es un adaptador de difusion, no un modelo de lenguaje.

## Casos de uso

- Generacion de fan art de personaje: el LoRA permite producir ilustraciones consistentes de Mayoi Hachikuji en ComfyUI con el prompt de ejemplo documentado (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216), sin necesidad de hires fix ni ADetailer.
- Creacion de hojas de personaje y referencias: la matriz de evaluacion cubre retrato frontal, tres cuartos, perfil, cuerpo entero con atuendo principal y alternativo, sentado, fondo simple, escena nocturna y ausencia de token de atuendo, lo que facilita generar sets de referencia coherentes.
- Ilustracion para proyectos derivados de anime: util para doujinshi, portadas de fan fiction o material promocional no oficial, siempre respetando la licencia y los derechos del propietario original.
- Prototipado de narrativa visual: combinando el token de identidad con escenas nocturnas o fondos complejos se pueden generar paneles para storyboards de comics amateur.
- Experimentacion con tecnicas de LoRA: el repositorio sirve como caso de estudio de seleccion de epoca y fuerza, con hashes SHA-256 por archivo y evaluacion publica reproducible.
- Comparativa de linajes de modelo base: al incluir pesos para WAI/Illustrious, AutismMix Pony y MOSS-Image, permite evaluar como cambia el mismo personaje segun el checkpoint subyacente.
- Generacion de avatares y material para comunidades de fans: retratos de personaje a resolucion 832x1216 aptos para foros y redes, con la salvedad de que es una obra derivada no oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente evaluaciones cualitativas (rondas 1 y 3 con imagenes de muestra) y una recomendacion subjetiva de E6 a fuerza 0.8, sin metricas numericas como FID, CLIP score ni similitud de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al ser un LoRA sobre SDXL, el requisito viene determinado por el checkpoint base waiIllustriousSDXL v17, no por el adaptador (cada archivo pesa 456.491.420 bytes, unos 435 MB).
- GPU recomendadas: no disponible en la informacion proporcionada; el autor entreno en un NVIDIA DGX Spark.
- Compatibilidad con GPU de consumo: no confirmada en la model card; depende del modelo base SDXL y del backend utilizado.
- Opciones de despliegue: ComfyUI (verificado por el autor) y libreria diffusers (declarada en los tags). Otros backends compatibles con SDXL y LoRA (por ejemplo, A1111 o Forge) no se mencionan.
- Latencia y throughput: no disponibles. La configuracion de muestreo documentada es Euler a, 28 pasos, CFG 4.5, CLIP skip 2 y resolucion 832x1216.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MayoiHachikuji-Lora (este) | LoRA de personaje SDXL | waiIllustriousSDXL v17 (+ AutismMix Pony, MOSS-Image) | 832x1216 en los ejemplos | creativeml-openrail-m | Hugging Face y ModelScope |
| Alternativas de LoRA de personaje SDXL | LoRA de personaje | SDXL / Illustrious / Pony | no disponible | variable | no disponible |
| Checkpoint base waiIllustriousSDXL v17 | Modelo completo SDXL | SDXL | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Es una obra derivada no oficial: los derechos sobre el personaje pertenecen a sus propietarios originales y el autor lo declara explicitamente como fan-made.
- La licencia creativeml-openrail-m impone restricciones de uso comercial que deben revisarse antes de cualquier explotacion en produccion; no se detallan en la model card.
- Riesgo de sobreajuste o de deriva de identidad fuera de la configuracion recomendada: el autor solo valida E6 a 0.8 (y E6 a 1.0 para AutismMix Pony), por lo que otras epocas y fuerzas pueden degradar el parecido.
- Las leyendas omiten con frecuencia el color de pelo y ojos, de modo que es necesario anadirlos manualmente en el prompt para obtener el aspecto correcto.
- Los tres linajes (WAI/Illustrious, AutismMix Pony, MOSS-Image) no son intercambiables: mezclar modelos base, prompts o negativos entre ellos produce resultados incorrectos.
- No hay benchmarks cuantitativos publicados, solo evaluaciones visuales subjetivas.
- El soporte linguistico declarado se limita a ingles y chino; el comportamiento con prompts en castellano no esta documentado.
- No es un modelo de lenguaje: no ofrece generacion de texto, razonamiento, codigo ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/MayoiHachikuji-Lora
- Dataset en Hugging Face: https://huggingface.co/datasets/abbuibuibui/MayoiHachikuji-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/MayoiHachikuji-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/MayoiHachikuji-Dataset
