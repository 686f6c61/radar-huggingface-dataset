# milkymap/image2wolof

## Resumen

image2wolof es un modelo de generacion de descripciones de imagenes (image captioning) especializado en wolof, una lengua de la familia nigerocongolesa hablada principalmente en Senegal, Gambia y Mauritania. Lo desarrolla Ibrahima Ba bajo el identificador milkymap y se distribuye con licencia Apache 2.0. El modelo aborda un problema clasico de las lenguas de bajos recursos: la practicamente nula disponibilidad de sistemas de vision-lenguaje que generen texto en wolof a partir de imagenes.

La arquitectura combina un codificador de vision SigLIP2-base congelado (google/siglip2-base-patch16-224, revision fijada 75de2d55) que produce 196 tokens de 768 dimensiones, y un decodificador transformer de seis capas entrenado desde cero (d 512, 8 cabezas, feed-forward 2048, vocabulario SentencePiece unigram de 4.000 tokens atado a la capa de salida). Solo son entrenables 27,9 millones de parametros, lo que lo convierte en un modelo muy ligero y facil de desplegar.

Es relevante ahora porque demuestra que es viable construir sistemas de captioning para lenguas africanas de bajos recursos reutilizando codificadores visuales multimodales potentes y entrenando unicamente un decodificador pequeno sobre datos traducidos automaticamente. El repositorio ocupa 0,1 GB y el modelo se publico en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador SigLIP2-base congelado + decodificador transformer de 6 capas entrenado desde cero |
| Parametros totales | 27,9 M entrenables (decodificador); el codificador SigLIP2-base se usa congelado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el decodificador procesa los 196 tokens visuales y genera la secuencia de caption) |
| Tipos de cuantizacion | No disponible (pesos en bf16 para inferencia) |
| Idiomas soportados | Wolof (wo) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`best.pt`) + tokenizer SentencePiece (`tokenizer.model`) + `config.json` |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder clasico para captioning. El codificador visual es SigLIP2-base-patch16-224 congelado, que emite 196 tokens de 768 dimensiones por imagen. Sobre esas representaciones opera un decodificador transformer de seis capas con dimension 512, 8 cabezas de atencion y feed-forward de 2048, con un vocabulario SentencePiece unigram de 4.000 tokens atado a la capa de salida. El decodificador se entrena desde cero y es el unico componente con parametros ajustables (27,9 M).

El entrenamiento usa el dataset milkymap/flickr30k-wolof: las 29.703 imagenes de entrenamiento de Flickr30k, cada una con cinco descripciones en wolof obtenidas por traduccion automatica de las cinco descripciones en ingles, guiadas por un glosario de terminos y reglas. En total, 148.515 pares imagen-texto. La optimizacion emplea AdamW con tasa 3e-4, weight decay 0,01, calentamiento seguido de decaimiento coseno, bf16, label smoothing 0,1, batch de 128 y parada temprana sobre la perdida de validacion con cinco descripciones; la mejor epoca fue la 6 de 10. La decodificacion y el calculo se ejecutan en bfloat16.

## Capacidades

- Generacion de descripciones de imagenes en wolof a partir de una imagen de entrada.
- Captioning de una o varias imagenes simultaneamente mediante la API `Captioner` del repositorio.
- Servicio HTTP con pagina de subida y endpoint `POST /caption` para integracion en aplicaciones.
- Inferencia en GPU (CUDA) con precision bfloat16.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo de pensamiento.
- No tiene capacidades de audio, video ni vision mas alla del captioning.
- Capacidad multilingue limitada exclusivamente al wolof.

## Casos de uso

- Accesibilidad para hablantes de wolof: generar descripciones de imagenes en su lengua para lectores de pantalla o interfaces de asistencia, aprovechando que el modelo produce texto directamente en wolof sin pasar por el ingles.
- Etiquetado y enriquecimiento de catalogos fotograficos: procesar lotes de imagenes y generar descripciones en wolof para archivos culturales, periodisticos o educativos senegaleses.
- Investigacion en vision-lenguaje para bajos recursos: servir como linea base reproducible para experimentar con tecnicas de aumento de datos o ajuste fino sobre lenguas africanas.
- Educacion y ensenanza de vocabulario: generar descripciones en wolof de imagenes para materiales didacticos o aplicaciones de aprendizaje de lengua.
- Moderacion y descripcion de contenido en plataformas locales: anadir metadatos textuales en wolof a imagenes subidas por usuarios de habla wolof.
- Prototipado rapido de aplicaciones de captioning: el modelo es muy ligero (27,9 M parametros entrenables, repo de 0,1 GB) y puede servirse con el propio servidor HTTP incluido en el repositorio, lo que facilita demos y pruebas de concepto.
- Generacion de datos sinteticos de imagen-texto en wolof para entrenar otros modelos o aumentar datasets existentes.

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificacion greedy, cinco referencias por imagen y sacreBLEU 2.6.0.

| Split | Imagenes | Perdida (5 captions) | BLEU | chrF |
|---|---:|---:|---:|---:|
| Validacion | 1.014 | 2,809 | 40,01 | 46,07 |
| Test | 995 | 2,792 | 41,28 | 46,19 |

No se han publicado comparaciones con otros modelos de captioning en wolof en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: muy baja; el decodificador tiene 27,9 M parametros y el codificador SigLIP2-base congelado es de tamano base, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con soporte CUDA y suficiente memoria para SigLIP2-base; una RTX 3060 o superior es mas que suficiente. El autor ejecuta en `device="cuda"` con bf16.
- Cabe en GPU de consumo: si, incluidas gamas medias y bajas con al menos unos pocos GB de VRAM.
- Opciones de despliegue: el repositorio incluye un servidor propio (`image2wolof serve`) con pagina de subida y `POST /caption`; tambien se puede usar la clase `Captioner` directamente en Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se identifican modelos comparables de captioning en wolof ni alternativas de la misma categoria con las que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Las referencias del dataset son traducciones automaticas, no wolof humano: las metricas miden la concordancia con referencias plateadas, no la fluidez juzgada por hablantes nativos, y no existe una evaluacion humana a gran escala.
- Flickr30k contiene principalmente escenas norteamericanas y europeas; el modelo apenas ha visto fotografias de Senegal y puede describir mal objetos, ropa o lugares locales.
- Errores conocidos: objetos confundidos, roles intercambiados entre personas, detalles inventados y repeticiones ocasionales.
- Riesgo de alucinacion: el modelo puede generar detalles no presentes en la imagen, segun reconoce el propio autor.
- Cobertura limitada a un unico idioma (wolof) y a un dominio visual restringido.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del codificador base SigLIP2 y del dataset de origen (Flickr30k) para produccion.
- El modelo depende de una revision fijada del codificador SigLIP2 descargada del Hub en el primer uso, lo que introduce una dependencia de red y de disponibilidad del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/milkymap/image2wolof
- Codigo, pipeline y paper: https://github.com/milkymap/image2wolof
- Paper (PDF): https://github.com/milkymap/image2wolof/blob/main/paper/image2wolof.pdf
- Dataset: https://huggingface.co/datasets/milkymap/flickr30k-wolof
- Codificador base: https://huggingface.co/google/siglip2-base-patch16-224
