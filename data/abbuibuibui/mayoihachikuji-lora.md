# abbuibuibui/MayoiHachikuji-Lora

## Resumen

MayoiHachikuji-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado sobre el checkpoint waiIllustriousSDXL v17, que reproduce a Mayoi Hachikuji (八九寺真宵), personaje de la serie *Monogatari Series*. Lo desarrolla el usuario de Hugging Face abbuibuibui y se distribuye como un adaptador de bajo rango que se carga junto al modelo base mediante la libreria diffusers o en flujos de ComfyUI. No es un modelo de lenguaje: es un adaptador de generacion de imagenes, por lo que las secciones de esta ficha se adaptan a esa naturaleza.

El modelo resuelve un problema acotado: la generacion consistente y fiel de un personaje concreto con un atuendo y unos rasgos definidos (dos coletas, pelo y ojos castanos, cinta blanca con alas, uniforme escolar con falda azul y mochila rosa con forma de caracol). El autor publica siete epocas (E1-E7) y recomienda la E6 a fuerza 0.8 tras una evaluacion comparativa propia sobre diez escenas y cuatro intensidades.

Es relevante para quienes construyen pipelines de generacion de personajes en anime o ilustracion con SDXL/Illustrious y necesitan un adaptador ligero (unos 456 MB por fichero) con instrucciones de uso y tokens de activacion bien documentados. El repositorio ocupa 3.2 GB e incluye los pesos de las siete epocas, imagenes de muestra y registros de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL / Illustrious (modelo base waiIllustriousSDXL v17) |
| Parametros totales | no disponible (rango 64, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagenes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precision no especificada) |
| Idiomas soportados | en, zh (etiquetas de la model card; los prompts se redactan en ingles o chino) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (un fichero por epoca, 456.491.420 bytes cada uno) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 acoplado a un UNet de SDXL en su variante Illustrious (waiIllustriousSDXL v17). El entrenamiento uso AdamW en bf16, buckets con limite de 1536 y siete epocas sobre un dataset de 70 pares imagen-texto con repeticion 2, correspondiente al conjunto abbuibuibui/MayoiHachikuji-Dataset. Las captions se generaron con `keep_tokens = 2`, lo que explica que el color de pelo y ojos a menudo se omita en las descripciones y deba anadirse manualmente en el prompt.

El autor realizo una evaluacion en dos rondas: una primera criba de E1-E7 a fuerza 0.8 y una matriz posterior de E5, E6 y E7 por diez escenas y cuatro intensidades (0.4, 0.6, 0.8 y 1.0). De ahi se concluye que E6 a 0.8 ofrece el mejor equilibrio entre fidelidad de identidad (cinta blanca con alas, ojos castanos, marcas rosadas en las mejillas) y del atuendo completo (lazos verdes con forma de hoja, falda azul con pin de estrella amarilla, mochila rosa de caracol y zapatos rosas). El entrenamiento y la evaluacion se hicieron con una NVIDIA DGX Spark y ComfyUI.

## Capacidades

- Generacion de imagenes de un personaje concreto de anime con identidad consistente mediante el token `mayoi_hachikuji`.
- Control de atuendo mediante el token `mayoi_hachikuji_school_uniform`, con variantes principal y alternativa.
- Reproduccion de detalles caracteristicos: dos coletas, pelo largo castano, ojos castanos, cinta blanca con alas, marcas rosadas en mejillas, mochila de caracol.
- Retratos frontales, tres cuartos, perfil, cuerpo completo, poses sentadas y escenas nocturnas o de fondo complejo, segun la evaluacion publicada.
- Composicion con otros LoRA y con el ecosistema SDXL (ComfyUI, diffusers), incluyendo control de fuerza de aplicacion entre 0.4 y 1.0.
- Soporte de prompts en ingles y chino.
- No dispone de tool calling, razonamiento multi-paso, modo thinking, vision ni audio: es exclusivamente un generador de imagenes.

## Casos de uso

- Ilustracion de fan art de *Monogatari Series*: cargar el LoRA E6 a 0.8 en ComfyUI con el prompt de ejemplo y generar retratos o escenas del personaje con fidelidad alta, sin necesidad de describir cada detalle del diseno.
- Creacion de hojas de personaje para proyectos derivados: usar las distintas epocas y fuerzas para obtener variaciones de expresion, pose y angulo (frontal, tres cuartos, perfil) manteniendo la identidad.
- Generacion de escenas narrativas: combinar el token de personaje con descripciones de entorno (calle nocturna, fondo simple) para ilustrar fragmentos de relato o guiones.
- Prototipado de merchandising o ilustracion comercial sujeta a la licencia: generar bocetos de camisetas, posteres o stickers con el personaje, verificando antes las condiciones de creativeml-openrail-m.
- Integracion en pipelines automatizados de difusion: cargar el safetensors desde diffusers en un servicio de generacion por lotes para producir variaciones controladas por seed y fuerza.
- Experimentacion con tecnicas de adaptacion: usar el LoRA como caso de estudio para comparar epocas y fuerzas, o para probar composicion con otros adaptadores sobre waiIllustriousSDXL.
- Generacion de material de referencia para animacion o comic: producir poses y angulos consistentes que sirvan de base para rotoscopia o bocetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta una evaluacion cualitativa interna (rondas 1 y 3) con imagenes comparativas y una recomendacion de uso (E6 a 0.8), sin metricas numericas como FID, CLIP score o similitud facial.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Al ser un LoRA sobre SDXL, requiere cargar el modelo base completo; en la practica esto implica el mismo consumo que waiIllustriousSDXL (tipicamente 8-12 GB en fp16 con optimizaciones, segun el backend).
- GPU recomendadas: NVIDIA DGX Spark fue el hardware usado por el autor para entrenamiento y evaluacion. Para inferencia se puede usar cualquier GPU capaz de ejecutar SDXL (A100, H100, RTX 4090, RTX 3090, etc.).
- GPU de consumo: si cabe en tarjetas de consumo con suficiente VRAM para SDXL; el LoRA anade unos 456 MB por fichero.
- Opciones de despliegue: ComfyUI (flujo usado por el autor), diffusers, y en general cualquier backend compatible con SDXL e Illustrious.
- Latencia y throughput: no disponibles. La model card indica ajustes de muestreo (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216) pero no tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MayoiHachikuji-Lora | LoRA de personaje | waiIllustriousSDXL v17 | rango 64 / alpha 32 | no aplica | creativeml-openrail-m | Hugging Face, ModelScope |
| LoRA de personaje SDXL generico | LoRA de personaje | SDXL / Illustrious | variable | no aplica | variable | Hugging Face, Civitai |
| waiIllustriousSDXL v17 (base) | Checkpoint completo | SDXL | no disponible | no aplica | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks ni de otros LoRA de personaje comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje y de la obra original pertenecen a sus titulares; el autor lo declara como fan-made.
- La licencia creativeml-openrail-m impone restricciones de uso comercial y obligaciones de atribucion; conviene revisar sus terminos antes de usar el modelo en produccion.
- El modelo base waiIllustriousSDXL v17 no se distribuye en este repositorio; hay que obtenerlo por separado y respetar su propia licencia.
- Las captions omiten con frecuencia el color de pelo y ojos, por lo que es necesario anadirlos manualmente en el prompt para evitar variaciones no deseadas.
- La evaluacion es cualitativa y realizada por el propio autor, sin metricas objetivas; la recomendacion de E6 a 0.8 debe validarse en el caso de uso concreto.
- Riesgo de sobreajuste o artefactos a fuerzas altas (1.0) y de perdida de identidad a fuerzas bajas (0.4), segun la matriz publicada.
- Solo se documentan prompts en ingles y chino; el rendimiento con otros idiomas no esta verificado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso comunitario que respalde su robustez.
- No es un modelo de lenguaje: no genera texto, codigo ni razonamiento, y no soporta tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/MayoiHachikuji-Lora
- Dataset en Hugging Face: https://huggingface.co/datasets/abbuibuibui/MayoiHachikuji-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/MayoiHachikuji-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/MayoiHachikuji-Dataset
