# flyfront/FFF_MOSS-Alba

## Resumen

FFF_MOSS-Alba es un ajuste fino (fine-tune) del modelo de generacion de imagenes MOSS-Image-SFT, desarrollado por el usuario flyfront y publicado en Hugging Face. Su objetivo es trasladar el estilo de ilustracion anime de FFF_ANIMA-Alba al modelo base MOSS-Image, de modo que las figuras humanas se dibujen con esa estetica concreta mientras el fondo, los textos y la composicion conservan la calidad del modelo original. El autor indica que solo se entrenaron las personas, enmascarando los fondos durante el entrenamiento.

El repositorio (16 GB) incluye tanto el modelo completo ajustado como una LoRA de estilo reutilizable con otros checkpoints de la familia MOSS-Image. La version mas reciente es FFF_MOSS-Alba-v1 (modelo) y FFF_MOSS-Alba-style-v2 (LoRA), con una version anterior v1 de la LoRA conservada como referencia. El modelo base utiliza un text encoder Qwen3.5-9B y un VAE FLUX.2 small decoder, y se distribuye bajo licencia Apache 2.0.

Se trata de un modelo especializado en ilustracion anime, no de proposito general: su interes radica en que combina el control de composicion y la generacion de texto del modelo base con un estilo de personaje consistente, sin necesidad de trigger words ni de LoRAs adicionales en el caso del modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion text-to-image derivado de MOSS-Image) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot (recomendada) y bf16 |
| Idiomas soportados | en, ja (texto en prompts); generacion de texto en imagen en ingles y chino segun pruebas del autor |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de OpenMOSS-Team/MOSS-Image-SFT, un modelo de difusion text-to-image. Mantiene los mismos componentes que el modelo base: text encoder Qwen3.5-9B y VAE FLUX.2 small decoder, por lo que se usa con la misma configuracion y los mismos ajustes que MOSS-Image SFT. El autor no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset.

La innovacion principal del ajuste es el enmascaramiento de fondos: solo se entrenaron las regiones correspondientes a personas, de modo que el estilo de FFF_ANIMA-Alba se aplica a las figuras mientras el modelo conserva la capacidad original para escenarios, texto y layouts. Cada imagen se entreno con dos tipos de caption (etiquetas estilo Danbooru y frases en lenguaje natural), lo que permite usar ambos formatos en inferencia. No se menciona el uso de RLHF o DPO.

## Capacidades

- Generacion de imagenes text-to-image con estilo anime de personaje consistente (estilo Alba) sin trigger word en el modelo completo.
- Acepta prompts con etiquetas estilo Danbooru y frases en lenguaje natural en ingles.
- Generacion de texto dentro de la imagen a partir de texto entre comillas en el prompt (carteles, pizarras, tazas), en ingles y chino segun las pruebas del autor.
- Soporte de prompts de layout en JSON con un campo `summary` y una lista de items con `bbox`, que colocan elementos en posiciones concretas.
- Control de composicion mediante Regional Boxes en Forge Neo, que genera el JSON a partir de cajas dibujadas.
- Compatibilidad con CFG, samplers (Euler, MOSS scheduler con shift 5, Simple con shift 5) y resoluciones de aproximadamente 1M a 2,4M pixeles.
- La LoRA FFF_MOSS-Alba-style-v2 permite aplicar el mismo estilo sobre otros checkpoints de la familia MOSS-Image Base.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni vision de entrada.

## Casos de uso

- Ilustracion de personajes para proyectos anime: el modelo genera figuras con el estilo Alba de forma consistente sin necesidad de LoRA ni trigger, lo que simplifica pipelines de produccion de ilustraciones.
- Creacion de key visuals y portadas: combinando prompts de etiquetas con resoluciones de 1344x1792 o 1792x1344 se obtienen composiciones verticales u horizontales listas para portada.
- Carteles y material promocional con texto integrado: el modelo dibuja el texto entre comillas del prompt (por ejemplo, una pizarra que lea una frase concreta), util para mockups y posters.
- Composicion controlada por layout: usando prompts JSON con `bbox`, se puede situar un titulo, un personaje y un objeto en posiciones definidas, adecuado para maquetas y storyboards.
- Generacion de escenas escolares o cotidianas: los ejemplos del autor incluyen aula y calle, con control de iluminacion mediante prompts negativos (`overexposure`, `warm lighting`), util para fondos de novela visual o webtoon.
- Prototipado rapido de estilo para estudios de animacion: la LoRA style-v2 permite probar el estilo sobre distintos checkpoints base sin reentrenar el modelo completo.
- Produccion de ilustraciones para merchandising: tazas, posters y senaletica con texto legible en ingles o chino, segun las pruebas del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 16 GB e incluye pesos bf16 e INT8; la version INT8 ConvRot es la recomendada por el autor por ser aproximadamente dos veces mas rapida que bf16 con resultados casi identicos.
- GPU recomendadas: no disponible. El autor no especifica modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; el uso de INT8 ConvRot sugiere que el autor prioriza reducir requisitos, pero no se indica que quepa en tarjetas consumer concretas.
- Opciones de despliegue: el autor menciona Forge Neo (con la extension Regional Boxes) como entorno de uso; no se citan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a difusion).
- Latencia y throughput: no disponibles. Solo se indica que bf16 tarda aproximadamente el doble que INT8 ConvRot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FFF_MOSS-Alba | no disponible | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face (flyfront/FFF_MOSS-Alba) |
| MOSS-Image-SFT (base) | no disponible | no disponible | sin datos en la informacion | no disponible en la informacion | Hugging Face (OpenMOSS-Team/MOSS-Image-SFT) |
| FFF_ANIMA-Alba (referencia de estilo) | no disponible | no disponible | sin datos en la informacion | no disponible en la informacion | Hugging Face (flyfront/FFF_ANIMA-Alba) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgo de estilo: el modelo dibuja personas en estilo Alba por defecto, incluso cuando el prompt pide fotografia realista; otros estilos responden con menos fuerza que en el modelo base SFT.
- Riesgo de rubor no deseado: sin `blush, embarrassed` en el prompt negativo, aproximadamente una de cada cinco imagenes muestra rubor claro, segun pruebas del autor.
- Iluminacion calida invasiva: sin `warm lighting` en el negativo, una luz naranja tiende a extenderse por toda la imagen, incluidos los fondos.
- Sobreexposicion en escenas diurnas: se recomienda incluir `overexposure` en el negativo para evitar que las escenas de dia se quemen.
- Limitaciones de layout: si una caja del JSON es demasiado estrecha para el elemento (por ejemplo, una falda con volantes ancha), el contenido se desborda.
- Idiomas: los prompts estan pensados para ingles y japones; la generacion de texto en imagen se probo en ingles y chino, no en castellano.
- Sin benchmarks publicados: no hay datos objetivos de calidad, fidelidad o sesgos mas alla de las pruebas cualitativas del autor.
- Licencia Apache 2.0: permite uso comercial, pero el autor no detalla restricciones adicionales sobre el estilo o los datos de entrenamiento; conviene verificar la licencia del modelo base MOSS-Image-SFT antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flyfront/FFF_MOSS-Alba
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio MOSS-Image: https://github.com/OpenMOSS/MOSS-Image
- Guia de usuario de MOSS-Image (prompts de layout): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md#layout-prompts-experimental
- Modelo de estilo de referencia FFF_ANIMA-Alba: https://huggingface.co/flyfront/FFF_ANIMA-Alba
- Extension Regional Boxes para Forge Neo: https://github.com/eduardoabreu81/sd-regional-boxes-neo
