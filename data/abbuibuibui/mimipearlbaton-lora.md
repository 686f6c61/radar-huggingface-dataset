# abbuibuibui/MimiPearlbaton-Lora

## Resumen

MimiPearlbaton-Lora es un adaptador LoRA de personaje para modelos de difusión de la familia SDXL, entrenado por el usuario abbuibuibui sobre el checkpoint waiIllustriousSDXL v17. No es un modelo de lenguaje: es un ajuste de bajo rango (dim 32 / alpha 16, aplicado tanto al text encoder como al UNet) que enseña al modelo base a generar de forma consistente a Mimi Pearlbaton, personaje de la serie *Re:Zero − Starting Life in Another World*. El repositorio publica siete épocas formales (E1–E7), con E6 (`mimi_pearlbaton-000006.safetensors`) como versión recomendada a fuerza 0.8.

El modelo resuelve un problema muy concreto: la consistencia de identidad en la generación de fan-art. Con un dataset de solo 53 imágenes y una única carpeta de vestuario, el LoRA fija dos tokens de disparo (`mimi_pearlbaton` para identidad y `mimi_white_outfit` para el atuendo blanco) y se apoya en descriptores físicos estables (pelo naranja, orejas animales, ojos verdes, pelo corto). Es relevante para quien trabaje con pipelines de generación de personajes en Illustrious y necesite resultados reproducibles sin reentrenar desde cero.

El proyecto es de escala muy pequeña (0 descargas y 0 likes en el momento de la consulta) y de carácter aficionado: la propia model card lo declara derivado no oficial, con los derechos del personaje en manos de sus titulares y licencia CreativeML OpenRAIL-M para los pesos. El repositorio ocupa 1,6 GB e incluye pesos en safetensors, dataset enlazado y material de evaluación visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL / Illustrious; dimension 32, alpha 16; LoRA aplicado a text encoder y UNet |
| Parametros totales | no disponible (la model card no indica el numero de parametros del adaptador) |
| Longitud de contexto | no aplica (modelo de difusion de imagenes); el prompt se codifica con el text encoder del SDXL, limite no especificado |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (segun metadata del repositorio y model card bilingue) |
| Licencia | CreativeML OpenRAIL-M (pesos); personaje sujeto a derechos de terceros, uso fan no comercial |
| Formato de pesos | safetensors |
| Modelo base | waiIllustriousSDXL-v17 |
| Tamano del repositorio | 1,6 GB (7 ficheros de pesos + showcase + evaluacion) |
| Resolucion de entrenamiento | buckets de 1024 px |
| Precision de entrenamiento | bf16 |
| Tokens de disparo | `mimi_pearlbaton` (identidad), `mimi_white_outfit` (atuendo) |
| Fuerza recomendada | 0,8 sobre la epoca E6 |

## Arquitectura y entrenamiento

El adaptador se entrena sobre waiIllustriousSDXL v17, un checkpoint SDXL de la familia Illustrious orientado a ilustracion anime. La configuracion declarada es LoRA de rango 32 con alpha 16, aplicada simultaneamente al text encoder y al UNet, con optimizador AdamW8bit, precision bf16 y buckets de resolucion de 1024 px. El entrenamiento completo son 7 epocas y 1113 pasos, lo que con 53 imagenes y repeats=3 da un numero de pasos muy contenido: el regimen es de ajuste fino corto, pensado para capturar identidad sin arrastrar el estilo del dataset.

El dataset (enlazado como `abbuibuibui/MimiPearlbaton-Dataset`) consta de 53 imagenes fijas en una unica carpeta de vestuario. Las captions empiezan por `mimi_pearlbaton, mimi_white_outfit, …` con `keep_tokens=2`, de modo que los dos primeros tokens quedan protegidos frente a la mezcla aleatoria de tags y actuan como ancla de identidad y de atuendo. No se documenta el uso de RLHF, DPO ni tecnicas de preferencias, algo esperable en un modelo de difusion. Tampoco se especifica la composicion del dataset mas alla del numero de imagenes y la restriccion de un solo outfit.

La innovacion tecnica destacable no esta en la arquitectura, que es LoRA estandar, sino en el protocolo de seleccion de epoca: el autor publica las siete epocas formales y documenta una evaluacion horizontal (9 escenas x pesos 0,4 / 0,6 / 0,8 / 1,0 sobre E5, E6 y E7) para justificar E6 como valor por defecto. Se incluye el SHA-256 de E6 (`6852b02d…298d12`) para verificar integridad del fichero recomendado.

## Capacidades

- Generacion de ilustracion anime del personaje Mimi Pearlbaton con identidad consistente a partir del token `mimi_pearlbaton`.
- Reproduccion del atuendo blanco canonico mediante el token `mimi_white_outfit`, presente en las 53 imagenes del dataset.
- Retratos de primer plano, planos de tres cuartos, perfil y cuerpo completo, segun los ejemplos de evaluacion publicados.
- Composicion en escenarios simples y complejos (fondo neutro, exterior, escena nocturna) y en poses como sentada.
- Control de fuerza de aplicacion del concepto (0,4 a 1,0) para graduar cuanto peso tiene el personaje frente al estilo del checkpoint base.
- Funcionamiento sin token de disparo (documentado en el ejemplo `11_no_trigger.jpg`), con menor fidelidad esperada.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de un LLM: es un modelo de difusion.
- Capacidades multilingues limitadas a la metadata (en, zh); el prompt efectivo depende del text encoder del modelo base.

## Casos de uso

- Fan-art consistente de personaje: usar E6 a fuerza 0,8 con el prompt de ejemplo de la model card para generar ilustraciones de Mimi Pearlbaton con rasgos estables (pelo naranja, orejas animales, ojos verdes) entre distintas generaciones, algo dificil de lograr solo con prompting sobre el modelo base.
- Produccion de hojas de personaje para proyectos de fan: generar retrato frontal, tres cuartos, perfil y cuerpo completo con el mismo LoRA para mantener coherencia visual en un documento de referencia.
- Ilustracion de escenas para doujinshi o comic amateur: combinar el LoRA con descripciones de entorno y pose, y ajustar la fuerza entre 0,6 y 0,8 para integrar al personaje en escenas con iluminacion variada sin que pierda identidad.
- Integracion en pipelines ComfyUI o Automatic1111: el fichero safetensors se carga como LoRA sobre cualquier checkpoint de la familia Illustrious, lo que permite insertarlo como nodo en un grafo de generacion por lotes.
- Generacion por lotes con control de consistencia: fijar semilla, prompt de identidad y fuerza 0,8 para producir variaciones controladas del personaje en un mismo estilo, util en pruebas de concepto de videojuego o novela visual.
- Base para ajustes derivados o merges: al ser un LoRA de rango 32 sobre Illustrious, sirve como punto de partida para entrenar variantes de vestuario o para fusionar con otros adaptadores de la misma familia, teniendo en cuenta la licencia.
- Verificacion y auditoria de artefactos de entrenamiento: el repositorio incluye siete epocas y registros de evaluacion, lo que permite estudiar como evoluciona el sobreajuste con 53 imagenes y 7 epocas, un caso didactico de ajuste fino con dataset pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (FID, CLIP score, similitud facial u otras metricas) en la informacion disponible. La evaluacion documentada es exclusivamente visual y comparativa: siete epocas cribadas a fuerza 0,8 con retrato frontal y atuendo blanco, y una tercera ronda con matriz de 9 escenas x pesos 0,4 / 0,6 / 0,8 / 1,0 para E5, E6 y E7. El autor concluye que E6 ofrece el mejor equilibrio global a 0,8, sin aportar cifras que respalden la comparacion.

| Aspecto evaluado | Metodologia | Resultado declarado |
|---|---|---|
| Seleccion de epoca | Cribado visual de E1–E7 a 0,8 (rostro + atuendo blanco) | E6 recomendada |
| Robustez a fuerza | 9 escenas x 0,4 / 0,6 / 0,8 / 1,0 sobre E5, E6 y E7 | E6 mejor equilibrio a 0,8 |
| Metricas cuantitativas | no disponible | no disponible |
| Comparacion con otros LoRA | no disponible | no disponible |

Ajustes de inferencia documentados en los ejemplos: sampler Euler a, 28 pasos, CFG 4,5, CLIP skip 2, resolucion 832x1216.

## Requisitos de hardware

- VRAM para inferencia: no publicada por el autor. Como referencia orientativa de la familia SDXL (no confirmada en la model card), la inferencia en fp16 suele moverse en torno a 8-10 GB de VRAM, y el LoRA anade una sobrecarga pequena al ser un adaptador de rango 32.
- GPU recomendadas: no disponible en la informacion proporcionada. Por familia de modelo, cabria esperar funcionamiento en RTX 3060 12 GB, RTX 4070/4080, RTX 4090, A100 y H100; el autor no documenta ninguna.
- Tarjetas consumer: el modelo base es SDXL, por lo que es plausible en GPUs consumer con 8-12 GB, aunque no hay confirmacion del autor ni pruebas publicadas.
- Almacenamiento: el repositorio completo ocupa 1,6 GB e incluye las siete epocas mas material de evaluacion; el peso de un fichero individual no se detalla.
- Opciones de despliegue: al ser un safetensors de diffusers, es cargable con la libreria diffusers, y por extension en Automatic1111 / Forge, ComfyUI y otros frontends compatibles con LoRA de SDXL. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros LoRA de personaje concretos con los que comparar directamente. La tabla contrasta el adaptador con su modelo base y con categorias genericas de adaptadores de la misma familia.

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MimiPearlbaton-Lora (E6) | no disponible (LoRA rango 32) | buckets de 1024 px en entrenamiento | sin metricas; evaluacion visual propia | CreativeML OpenRAIL-M | HuggingFace y ModelScope |
| waiIllustriousSDXL-v17 (base sin LoRA) | no disponible | SDXL estandar | no disponible | no disponible en esta ficha | checkpoint de terceros |
| Otros LoRA de personaje para Illustrious | no disponible | no disponible | no disponible | habitualmente OpenRAIL-M | no identificados |
| LoRA de personaje para SDXL 1.0 / Pony | no disponible | no disponible | no disponible | variable | no identificados |

Diferencias cualitativas frente al modelo base: el LoRA impone identidad y atuendo mediante dos tokens, a costa de perder flexibilidad de vestuario (una sola carpeta de outfit) y de quedar acoplado al estilo de waiIllustriousSDXL v17.

## Limitaciones y advertencias

- Un solo token de atuendo (`mimi_white_outfit`): no hay ropa alternativa en el dataset, por lo que cualquier vestuario distinto dependera del prompting y de la fuerza aplicada, con riesgo de sangrado del outfit blanco.
- Compatibilidad optima con waiIllustriousSDXL / familia Illustrious; en otros checkpoints SDXL el resultado puede degradarse notablemente segun la propia model card.
- Dataset de 53 imagenes y 1113 pasos: riesgo de sobreajuste a las poses, encuadres e iluminacion del dataset, con diversidad limitada fuera de los planos documentados.
- Sesgos: no documentados por el autor. Cabe esperar el sesgo estetico propio del dataset y del checkpoint base (ilustracion anime), no evaluado en la model card.
- Alucinacion: no aplica en el sentido de un LLM, pero si existe riesgo de artefactos anatomicos y de deriva de identidad a fuerzas bajas o sin token de disparo.
- Limitaciones de idioma: la metadata declara en y zh; no hay evaluacion de prompts en castellano ni en otras lenguas.
- Licencia: CreativeML OpenRAIL-M para los pesos, con las restricciones de uso de esa licencia. La model card indica explicitamente uso fan no comercial y recuerda que los derechos del personaje pertenecen a sus titulares; el uso comercial requeriria revisar tanto OpenRAIL-M como los derechos de Re:Zero.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta, sin issues ni comunidad; no hay garantia de mantenimiento.
- Advertencia de procedencia: los ficheros de pesos deben verificarse con el SHA-256 publicado para E6 antes de usarlos en cualquier pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abbuibuibui/MimiPearlbaton-Lora
- Dataset en HuggingFace: https://huggingface.co/datasets/abbuibuibui/MimiPearlbaton-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/MimiPearlbaton-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/MimiPearlbaton-Dataset
- README en chino: https://huggingface.co/abbuibuibui/MimiPearlbaton-Lora/blob/main/README_zh.md
- Registro de evaluacion horizontal: https://huggingface.co/abbuibuibui/MimiPearlbaton-Lora/blob/main/evaluation/%E6%A8%AA%E5%90%91%E6%B5%8B%E8%AF%84%E8%AE%B0%E5%BD%95.md
- Paper, blog o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relacionados con este modelo; los enlaces obtenidos trataban sobre OpenAI y ChatGPT y se han descartado por no ser pertinentes.
