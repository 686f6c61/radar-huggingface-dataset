# 2122zap/excre_beta

## Resumen

`2122zap/excre_beta` es un LoRA de imagen a vídeo entrenado sobre el modelo base MiniMaxAI/MiniMax-H3, desarrollado por el usuario 2122zap y publicado en Hugging Face bajo licencia OpenRAIL. Su función es incorporar un concepto concreto (la acción de excretar, en imagen real y en animación 2D, con audio) al modelo base, de modo que este pueda generar clips coherentes con ese concepto a partir de una imagen inicial y un prompt estructurado. No es un modelo autónomo: requiere MiniMax-H3 como base y actúa como adaptador de bajo rango.

El artefacto es un LoRA plano en `.safetensors` de 2,6 GB, con rango 16, alpha 16, 416 tensores y 208 módulos LoRA, guardado en FP16. Se entrenó sobre la partición completa `fl2va` del modelo base (incluida la rama de audio), con 99 clips de 12,3 minutos en total, 24 fps y resolución de entrenamiento de 384 px. La model card está marcada como `not-for-all-audiences` por el contenido explícito.

Su relevancia es acotada: sirve como ejemplo de ajuste fino de un modelo de vídeo con audio mediante LoRA y de cómo se estructura un dataset de captions por capas y palabras clave ordenadas. Para evaluación técnica general resulta poco útil, ya que su dominio es muy específico y su licencia y contenido limitan el uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax-H3, que incluye transformer de difusión y rama de audio |
| Parametros totales | no disponible (el LoRA tiene 416 tensores, 208 módulos; rango 16, alpha 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el LoRA se distribuye en FP16; el base se entrenó con transformer en 8 bits (ConvRot) y text encoder NVFP4 |
| Idiomas soportados | no disponible (los prompts de entrenamiento están en inglés) |
| Licencia | openrail |
| Formato de pesos | `.safetensors` (LoRA plano, FP16) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 aplicado sobre MiniMax-H3, un modelo de generación de vídeo con audio. El entrenamiento usó la partición completa `fl2va` del modelo base, de modo que se ajustan tanto la rama visual como la de sonido. La configuración fue: 1000 pasos, learning rate 5e-5, AdamW de 8 bits, batch size 1, resolución de 384 px, precisión bf16 con guardados en FP16 cada 200 pasos, peso de pérdida de audio 1 y audio normalizado. Se empleó el adaptador de entrenamiento publicado de MiniMax-H3 (v3) y la herramienta ostris/ai-toolkit sobre una NVIDIA RTX PRO 6000 Blackwell de 96 GB, con unos 6,3 segundos por paso y algo más de dos horas de ejecución total.

El dataset consta de 99 clips (12,3 minutos, entre 2,3 y 11,5 segundos, mediana 7,3 s), a 24 fps, con longitudes ajustadas a la rejilla de 17n+5 fotogramas y audio conservado. La composición es 54 clips de animación 2D (con palabra de timing) y 45 de imagen real; las variantes base se reparten en `soft` 34, `poop` 33 y `diarrhea` 32, y los modificadores en `fart` 33, `gassy` 28, `shart` 21 y `hyper` 17. Cada caption se construye por capas: palabra disparadora, palabras clave en orden fijo (variante base, modificadores, vista, iluminación), descripción de la escena sin nombrar el acto, una línea de sonido y, en clips animados, la frase de timing. En la v3 se aclararon los clips oscuros con curva gamma (brillo medio de 126 a 143), se garantizó que cada caption contuviera exactamente una variante base y una palabra de iluminación, y se revisaron las etiquetas de iluminación contra el color medio de los fotogramas.

## Capacidades

- Generación de vídeo a partir de una imagen inicial (image-to-video), no de texto a vídeo.
- Generación de audio asociado al clip, ya que la rama de sonido del modelo base se entrena.
- Representación de dos estilos: imagen real y animación 2D, con control de timing mediante `animated on ones`, `on twos` y `on threes`.
- Control de encuadre mediante palabras de vista (`toilet view`, `front view`, `top view`, `side view`, `bottom view`).
- Control de tonalidad de color mediante palabras de iluminación (`cool`, `neutral`, `warm`, `very warm`).
- Condicionamiento por prompt estructurado con orden fijo de palabras clave.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un adaptador generativo de vídeo.

## Casos de uso

- Investigación sobre ajuste fino de modelos de vídeo con audio: el LoRA documenta con detalle la configuración de entrenamiento (rango, pasos, precisión, hardware) y sirve como referencia reproducible para experimentos con MiniMax-H3.
- Estudio de estructuración de datasets de captions: el esquema por capas con orden fijo de palabras clave es un ejemplo concreto de cómo mejorar la adherencia al prompt en modelos de difusión de vídeo.
- Pruebas de control de estilo de animación: las palabras de timing permiten experimentar con la cadencia de animación 2D generada, útil para investigación en generación de animación.
- Evaluación de condicionamiento por imagen inicial: permite medir cómo la primera imagen ancla la generación y qué deriva se produce sin ella.
- Experimentos de coherencia audiovisual: al entrenarse la rama de audio, sirve para estudiar la sincronización entre sonido y evento generado.
- Docencia y divulgación sobre LoRAs de vídeo: como caso de estudio de un adaptador de dominio muy específico con licencia OpenRAIL y restricciones de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA; depende del modelo base MiniMax-H3, que no se detalla en la información proporcionada.
- GPU de entrenamiento documentada: NVIDIA RTX PRO 6000 Blackwell de 96 GB (una unidad).
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del modelo base condiciona la viabilidad.
- Opciones de despliegue: no disponible; el LoRA es un `.safetensors` que debe cargarse sobre MiniMax-H3 con la librería `minimax-h3`.
- Latencia y throughput: no disponible; el entrenamiento reporta 6,3 s por paso, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2122zap/excre_beta | LoRA image-to-video sobre MiniMax-H3 | no disponible (416 tensores) | no disponible | openrail | Hugging Face, 539 descargas |
| MiniMaxAI/MiniMax-H3 | Modelo base de vídeo con audio | no disponible | no disponible | no disponible | Hugging Face (referenciado) |
| Alternativas de LoRA image-to-video | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícito: la model card está marcada como `not-for-all-adversaries` (en realidad `not-for-all-audiences`), con temática escatológica y adulta; no es apta para público general.
- Licencia OpenRAIL: impone restricciones de uso, incluida la prohibición de usos dañinos; conviene revisar los términos completos antes de cualquier despliegue.
- Dependencia del modelo base: no funciona de forma autónoma; requiere MiniMax-H3 y la librería `minimax-h3`.
- Entrenado para image-to-video: sin imagen inicial, los resultados pueden desviarse, según advierte el autor.
- Disparo poco fiable: el autor indica que la palabra disparadora por sí sola no activa el evento de forma consistente; funcionan mejor prompts que imitan el estilo de los captions.
- Brillo variable: depende del modelo base, la imagen inicial, la velocidad de generación y el sampler.
- Sesgos: no documentados; el dataset es reducido (99 clips) y de dominio muy concreto, con riesgo de sobreajuste.
- Alucinación: no aplica en el sentido textual, pero sí riesgo de generar contenido incoherente o no solicitado en escenas fuera de distribución.
- Idiomas: los captions de entrenamiento están en inglés; no se documenta soporte multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/2122zap/excre_beta
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Herramienta de entrenamiento: https://github.com/ostris/ai-toolkit
