# abbuibuibui/KyokoHori-Lora

## Resumen

KyokoHori-Lora es un LoRA de personaje para modelos de difusion de la familia Stable Diffusion XL, concretamente entrenado sobre el modelo base waiIllustriousSDXL v17 (un merge de la familia Illustrious/NoobAI orientado a ilustracion anime). Lo desarrolla el usuario abbuibuibui y reproduce el personaje de Kyoko Hori (堀京子) del manga y anime *Horimiya*. No es un modelo fundacional ni un checkpoint completo: es un adaptador de bajo rango que se aplica sobre un SDXL ya existente para inyectar la identidad visual del personaje.

El repositorio contiene en realidad tres linajes de LoRA distintos: el original para Illustrious/WAI (directorio raiz), una variante para AutismMix Pony (subdirectorio `autism_pony/`) y una variante para MOSS-Image (subdirectorio `moss/`). Cada uno requiere su modelo base y sus prompts correspondientes; mezclarlos produce resultados incorrectos. El linaje principal incluye los pesos de siete epocas (E1-E7), con recomendacion explicita de usar E6 a fuerza 0.8 como configuracion por defecto.

La relevancia de esta ficha es acotada: se trata de un LoRA de personaje de nicho, con 206 descargas y sin likes en el momento de la consulta, pensado para generacion de imagenes de fan art. Su interes tecnico esta en la documentacion de entrenamiento (78 imagenes curadas, captions con `keep_tokens = 2`, evaluacion comparativa publica entre epocas y fuerzas) mas que en capacidades generales de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL; modelo base waiIllustriousSDXL v17 |
| Parametros totales | no disponible (cada archivo de pesos ocupa 456.495.788 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-a-imagen) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se documentan variantes GGUF ni fp8) |
| Idiomas soportados | en, zh (prompts en ingles y chino) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre un UNet de SDXL. El modelo base, waiIllustriousSDXL v17, es un merge de la familia Illustrious, derivada a su vez de SDXL y especializada en ilustracion anime. El LoRA no modifica la arquitectura del modelo base: anade matrices de bajo rango en las capas de atencion para desplazar la distribucion de salida hacia el personaje objetivo. El repositorio incluye los pesos de siete epocas de entrenamiento, cada uno de 456.495.788 bytes, con SHA-256 documentado para E6.

El dataset de entrenamiento consta de 78 imagenes curadas con sus correspondientes archivos `.txt` de caption, publicadas en `abbuibuibui/KyokoHori-Dataset`. Los captions siguen el esquema `kyoko_hori, <outfit>` y se entrenaron con `keep_tokens = 2`, lo que fija los dos primeros tokens (identidad y outfit) para que no sean alterados por el shuffle de captions. La distribucion por outfit es: uniforme con chaleco 27 imagenes, uniforme de invierno 29, camiseta deportiva 12 y abrigo con bufanda 10. No se documenta el numero de pasos, la tasa de aprendizaje, el optimizador ni si hubo regularizacion con imagenes de clase.

La innovacion tecnica destacable no esta en la arquitectura sino en la metodologia de evaluacion: el autor publica una comparativa horizontal con columnas por epoca y filas por fuerza del LoRA, generada en una DGX con ComfyUI y sin retoque posterior. La matriz de seleccion cubre 10 escenas por 4 fuerzas (0.4, 0.6, 0.8 y 1.0) para los candidatos E5, E6 y E7.

## Capacidades

- Generacion de imagenes de un personaje concreto (Kyoko Hori) sobre modelos base SDXL de la familia Illustrious/NoobAI.
- Control de identidad mediante el token de activacion `kyoko_hori`, que fija pelo largo castano y ojos castanos.
- Control de vestuario mediante tokens especificos: `kyoko_hori_vest_uniform`, `kyoko_hori_winter_uniform`, `kyoko_hori_sports_shirt` y `kyoko_hori_winter_coat_scarf`.
- Composicion de escena mediante prompts de texto convencionales de SDXL (pose, encuadre, fondo, iluminacion).
- Variantes para otros modelos base: AutismMix Pony y MOSS-Image, con tokens y prompts propios.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de difusion imagen.

## Casos de uso

- Generacion de fan art de personaje: aplicar el LoRA a fuerza 0.8 sobre waiIllustriousSDXL v17 con el token `kyoko_hori` produce retratos consistentes del personaje; adecuado para ilustracion de comunidad y proyectos no comerciales amparados por la licencia.
- Creacion de hojas de personaje y referencias visuales: los tokens de outfit permiten generar el mismo personaje con uniforme de chaleco, uniforme de invierno, camiseta deportiva o abrigo con bufanda, util para mantener coherencia en un proyecto de comic o novela visual.
- Prototipado de escenas para doujinshi o webcomic: combinando el token de identidad con prompts de encuadre (primer plano, tres cuartos, perfil, cuerpo entero) se obtienen bocetos de panel con un personaje estable entre viñetas.
- Pruebas de integracion en pipelines ComfyUI: el autor documenta ajustes concretos (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216) que sirven como configuracion de referencia para validar un flujo de trabajo con LoRAs de personaje.
- Investigacion sobre entrenamiento de LoRA de personaje: el repositorio publica la matriz de evaluacion por epoca y fuerza, lo que permite estudiar el efecto del numero de epocas y del peso del adaptador sobre la fidelidad de identidad y la fuga de estilo.
- Comparacion de linajes sobre distintos modelos base: disponer de variantes para Illustrious, AutismMix Pony y MOSS-Image permite evaluar como se transfiere un mismo personaje entre familias de checkpoints SDXL.
- Generacion de material promocional no comercial para comunidades de fans: siempre que se respete la licencia CreativeML OpenRAIL-M y los derechos del titular del personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la informacion disponible. El autor aporta una evaluacion cualitativa comparativa entre epocas:

| Candidato | Resultado observado | Decision |
|---|---|---|
| E1 | Identidad ya correcta (pelo y ojos castanos), rostro mas suave | Alternativa temprana |
| E5 | Identidad estable, ligeramente menos asentada que E6 en cuerpo entero | Alternativa |
| E6 | Rostro consistente a fuerza 0.6-0.8; la escena nocturna sigue leyendose como el mismo personaje | Recomendado a 0.8 |
| E7 | Muy proximo a E6; 1.0 no aporta ganancia clara | Alternativa de epoca final |

El autor advierte de fuga de identidad: sin el token de personaje, a fuerza 0.8 el modelo sigue inclinando rostro y pelo hacia este personaje, lo que constituye leakage y no una estudiante generica guiada solo por prompt.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al ser un LoRA sobre SDXL, los requisitos son los del modelo base (tipicamente 8-12 GB en fp16 con optimizaciones, mas en resoluciones altas).
- GPU recomendadas: el autor genero las imagenes de evaluacion en una DGX con ComfyUI; no especifica el modelo de GPU.
- Cabe en GPU de consumo: si, siempre que el checkpoint base SDXL quepa; tarjetas de 8 GB o mas con `--medvram` o `--lowvram` en A1111/ComfyUI.
- Opciones de despliegue: ComfyUI (configuracion documentada por el autor), Automatic1111/Forge y otros frontends compatibles con LoRA en safetensors; no se documenta soporte en vLLM, TGI ni llama.cpp (no aplica a difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KyokoHori-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 | 832x1216 en la config recomendada | creativeml-openrail-m | Hugging Face, 206 descargas |
| AutismMix Pony (variante del mismo repo) | LoRA de personaje | AutismMix Pony | no disponible | creativeml-openrail-m | Incluido en el mismo repositorio |
| MOSS-Image (variante del mismo repo) | LoRA de personaje | MOSS-Image | no disponible | creativeml-openrail-m | Incluido en el mismo repositorio |
| Otros LoRA de personaje de Horimiya | LoRA de personaje | SDXL / Illustrious | no disponible | variable | no disponible |

No se dispone de datos de benchmarks ni de otros LoRA comparables de la misma franquicia en la informacion proporcionada.

## Limitaciones y advertencias

- Fuga de identidad: a fuerza 0.8, el LoRA inclina rostro y pelo hacia el personaje incluso sin el token de activacion; no debe usarse como LoRA generico de estudiante.
- Dependencia estricta del modelo base: el linaje raiz requiere waiIllustriousSDXL v17 o un merge Illustrious/NoobAI; los linajes `autism_pony/` y `moss/` requieren sus propios checkpoints y no son intercambiables.
- Riesgo de sobreajuste por epoca: E1 presenta rostro mas suave y E7 no aporta ganancia clara frente a E6 a fuerza 1.0; usar la epoca equivocada degrada la fidelidad.
- Dataset pequeno (78 imagenes): la cobertura de poses, angulos y expresiones es limitada, lo que puede reducir la robustez en escenas muy alejadas de las de entrenamiento.
- Sin benchmarks cuantitativos publicados: la seleccion de E6 se basa en evaluacion visual cualitativa del propio autor, no en metricas objetivas.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos listados en el anexo de la licencia) y exige mantener el aviso de licencia; no concede derechos sobre el personaje.
- Derechos de propiedad intelectual: es una obra derivada no oficial de *Horimiya*; los derechos del personaje y de la obra original pertenecen a sus titulares, lo que limita el uso comercial del personaje en si.
- Idiomas: prompts documentados en ingles y chino; no hay validacion en castellano.
- Sin garantias de calidad en produccion: no se documentan pruebas de estabilidad en lotes grandes, ni de reproducibilidad entre versiones de ComfyUI o de las librerias de difusion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/KyokoHori-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/KyokoHori-Dataset
- README en chino: https://huggingface.co/abbuibuibui/KyokoHori-Lora/blob/main/README_zh.md
- Notas de evaluacion en chino: https://huggingface.co/abbuibuibui/KyokoHori-Lora/blob/main/evaluation/%E6%A8%AA%E5%90%91%E6%B5%8B%E8%AF%84%E8%AE%B0%E5%BD%95.md
- Variante AutismMix Pony: https://huggingface.co/abbuibuibui/KyokoHori-Lora/tree/main/autism_pony
- Variante MOSS-Image: https://huggingface.co/abbuibuibui/KyokoHori-Lora/tree/main/moss
- Texto de la licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
