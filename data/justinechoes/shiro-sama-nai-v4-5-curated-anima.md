# JustInEchoes/Shiro-sama-NAI-V4.5-Curated-Anima

## Resumen

Shiro-sama-NAI-V4.5-Curated-Anima es un adaptador LoRA de bajo rango para generación de imágenes de personaje (text-to-image), desarrollado por el usuario JustInEchoes. Reproduce la identidad visual de Shiro-sama (シロ様), personaje de la serie *The Helpful Fox Senko-san*, y está entrenado específicamente sobre el punto de control Anima Base v1.0, con recomendación de uso sobre Anima Turbo v1.1. El repositorio ocupa 0,1 GB y no registra descargas en el momento de la consulta.

El adaptador se construyó a partir de un conjunto de datos sintético de 598 imágenes etiquetadas, generadas con NovelAI 4.5 Curated. Su enfoque es la fidelidad de personaje, el trazo limpio y la flexibilidad de vestuario, admitiendo tanto etiquetas como descripciones en lenguaje natural. El modelo base Anima emplea Qwen3-0.6B como codificador de texto para el condicionamiento, lo que permite mezclar etiquetas y prosa descriptiva en los prompts.

Se trata de un componente especializado dentro del ecosistema Anima, no de un modelo generativo autónomo: requiere un punto de control base compatible para funcionar. Su relevancia es acotada al nicho de la generación de personajes de anime con control fino de vestuario, pose y escena, y carece de licencia declarada, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (low-rank adaptation) sobre modelo de difusion Anima; codificador de texto Qwen3-0.6B |
| Parametros totales | no disponible (adaptador LoRA; tamano del repositorio 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; resolucion de generacion demostrada 1024 x 1024 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos de la model card) |
| Licencia | no disponible |
| Formato de pesos | no disponible (formato habitual de LoRA: safetensors no confirmado en la informacion) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas de un modelo de difusion base para ajustar su comportamiento sin reentrenar el modelo completo. El punto de control de destino es Anima Base v1.0, con Anima Turbo v1.1 como variante recomendada. El condicionamiento de texto corre a cargo de Qwen3-0.6B, y la model card indica explícitamente que Anima no utiliza Clip Skip.

El entrenamiento se realizó sobre un dataset sintético curado de 598 imágenes con leyendas, generadas con NovelAI 4.5 Curated. El autor publica por separado los conjuntos de datos de etiquetas (tags) y de leyendas (captions) asociados a esta colección. No se especifican en la informacion disponible el rango del LoRA, la tasa de aprendizaje, el número de pasos ni la composición detallada del dataset. No se documentan fases de RLHF ni DPO, algo esperable en un adaptador de difusion de este tipo.

## Capacidades

- Generacion de imagenes text-to-image de un personaje concreto (Shiro-sama), activado mediante la palabra de disparo `shiro_sama`.
- Mantenimiento de la identidad del personaje: rasgos faciales, orejas de zorro, cola corta de zorro y apariencia de anime en distintos escenarios.
- Flexibilidad de vestuario: soporta el conjunto canonico (vestido blanco sin tirantes con motivos de media luna dorada, chal rojo, guantes negros hasta el codo, medias negras hasta el muslo y gargantilla negra) y prendas alternativas como chaquetas o ropa casual.
- Prompts mixtos: admite etiquetas, descripciones en lenguaje natural y combinaciones de ambas, merced al codificador Qwen3-0.6B.
- Control descriptivo de ropa, expresiones, poses, composicion, iluminacion y entorno.
- Refuerzo mediante etiquetas especificas: `short tail` para la cola, `red shawl` para el chal, o descripciones de prendas de reemplazo.
- Negative prompting: la model card recomienda un negativo minimo (`worst quality, low quality, blurry, deformed, text, watermark`) ampliable con negativos especificos.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento; no aplican a un modelo de este tipo.

## Casos de uso

- Ilustracion de personaje consistente en series: generar variaciones del personaje a lo largo de multiples escenas manteniendo rasgos faciales y elementos distintivos, util para narrativa visual o webcomics.
- Creacion de fan art: producir imagenes de alta fidelidad del personaje con distintos vestuarios y composiciones sin perder su identidad reconocible.
- Prototipado de diseno de personaje: probar cambios de vestuario (chaqueta sobre el vestido base, conjunto de camisa y falda, atuendo de miko/kimono/hakama) variando la descripcion de prendas.
- Ilustracion de escenas controladas: definir posicion, orientacion hacia el espectador, posicion de las manos y esquema de iluminacion mediante lenguaje natural, adecuado para portadas o key visuals.
- Generacion con flujo optimizado: gracias al punto de control Turbo, producir imagenes en 15 pasos con CFG 1.5 y 1024 x 1024, apropiado para iteracion rapida en taller de bocetos.
- Ajuste fino de fidelidad frente a flexibilidad: usar pesos de LoRA de 1,0 para maxima fidelidad o bajar a 0,85-0,90 cuando se priorice libertad de vestuario y control de escena.
- Produccion de material para datasets: emplear el adaptador para generar imagenes etiquetadas del personaje que alimenten otros entrenamientos o sistemas de anotacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de personaje, etc.) ni comparativas numericas con otros adaptadores.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB, por lo que su coste de VRAM es despreciable; el consumo real lo determina el punto de control base Anima.
- Como referencia general para modelos de difusion de clase 1024 x 1024, se suele necesitar del orden de 8-12 GB de VRAM en inferencia a precision completa; no confirmado para Anima en la informacion disponible.
- GPU recomendadas: no disponibles de forma especifica para Anima; para este rango de resolucion son habituales tarjetas tipo RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: previsiblemente si, en tarjetas con 8-12 GB o mas de VRAM, siempre que el modelo base encaje; dato no confirmado.
- Opciones de despliegue: no especificadas en la model card. Los LoRA de difusion suelen cargarse en A1111/Forge, ComfyUI o Diffusers, pero no hay confirmacion para este caso.
- Latencia y throughput: no disponibles; dependen del punto de control base, del sampler y del hardware. Los ejemplos usan Euler Ancestral, scheduler Simple, 15 pasos y CFG 1.5.

## Comparativa con modelos similares

La informacion disponible no incluye datos de rendimiento ni comparativas con otros adaptadores, por lo que no es posible establecer una comparacion cuantitativa fiable. Como referencia estructural, el autor publica un adaptador companion para Illustrious (Shiro-sama-NAI-V4.5-Curated-Illustrious), destinado a una familia de puntos de control distinta.

| Modelo | Tipo | Base objetivo | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shiro-sama-NAI-V4.5-Curated-Anima | LoRA de personaje | Anima Base v1.0 / Turbo v1.1 | 598 imagenes NovelAI 4.5 Curated | no disponible | HuggingFace |
| Shiro-sama-NAI-V4.5-Curated-Illustrious | LoRA de personaje | Illustrious | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse, no puede asumirse su uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma y requiere un punto de control Anima compatible.
- Dataset sintetico: las 598 imagenes empleadas se generaron con NovelAI 4.5 Curated, por lo que el adaptador puede heredar sesgos y limitaciones estilisticas de ese generador.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir anatomia incorrecta (orejas, cola, manos) y necesita negative prompts especificos.
- Fidelidad condicionada al peso del LoRA: a 1,0 prioriza identidad, pero se recomienda bajar a 0,85-0,90 para cambios de vestuario o escena.
- Sensibilidad a las etiquetas: el autor advierte de conflictos concretos, como evitar `detailed eyes` si desaparecen las pupilas negras, o sustituir `red scarf` por `red shawl`.
- Idiomas: no se documenta soporte multilingue; los ejemplos de la model card estan en ingles.
- Sin resultados de benchmarks ni validacion independiente publicados.
- Proyeccion y trazabilidad limitadas: 0 descargas y 1 like en el momento de la consulta, sin historial de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JustInEchoes/Shiro-sama-NAI-V4.5-Curated-Anima
- Version en Civitai (Anima V1): https://civitai.com/models/2995794?modelVersionId=3397674
- Dataset de etiquetas (tags): https://huggingface.co/datasets/JustInEchoes/Shiro-sama-NAI-V4.5-Curated-Tags
- Dataset de leyendas (captions): https://huggingface.co/datasets/JustInEchoes/Shiro-sama-NAI-V4.5-Curated-Captions
- Coleccion de datasets: https://huggingface.co/collections/JustInEchoes/datasets-shiro-sama-nai-v45-curated-6acd04af30ec71aff295c561
- Adaptador companion para Illustrious: https://huggingface.co/JustInEchoes/Shiro-sama-NAI-V4.5-Curated-Illustrious
- Imagen de ejemplo 1: https://civitai.com/images/145402559
- Imagen de ejemplo 2: https://civitai.com/images/145402589
