# lirance/illustrious-xl-v1.0

## Resumen

Illustrious XL v1.0 es un modelo generativo de imagen a texto (text-to-image) especializado en ilustración, desarrollado por OnomaAI y distribuido en el repositorio de Hugging Face `lirance/illustrious-xl-v1.0`. Se construye sobre la arquitectura Stable Diffusion XL (SDXL) y parte del checkpoint previo Illustrious XL v0.1, del cual hereda compatibilidad con LoRA y módulos ControlNet. Su principal innovación es el soporte nativo de una resolución de 1536×1536 dentro del marco de SDXL, con un rango operativo que va de 512×512 a 1536×1536 sin necesidad de modificaciones de alta resolución.

El modelo está diseñado para combinar la comprensión de lenguaje natural con el prompting basado en etiquetas al estilo Danbooru, de modo que acepta tanto descripciones en inglés plano como etiquetas precisas, o una mezcla de ambas. Se distribuye como checkpoint base preentrenado, sin ajuste fino sobre estéticas o sesgos concretos, pensado como fundamento para que la comunidad aplique su propio fine-tuning o entrenamiento de LoRA.

El entrenamiento se realizó en julio de 2024, con conocimiento hasta junio de 2024. La licencia declarada es MIT, lo que facilita su uso comercial y su integración en flujos de trabajo de generación de ilustraciones. El repositorio ocupa 6,9 GB, coherente con un checkpoint SDXL en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (SDXL), difusión latente text-to-image |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompting descrito se basa en inglés y etiquetas Danbooru) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 6,9 GB; presumiblemente safetensors o checkpoint de difusión, sin confirmar) |

## Arquitectura y entrenamiento

Illustrious XL v1.0 emplea la arquitectura SDXL, un modelo de difusión latente con un UNet y codificadores de texto, adaptada para generar ilustraciones a alta resolución. Se entrena a partir de Illustrious XL v0.1 y está optimizado para alcanzar 1536×1536 de forma nativa, algo que la model card presenta como un hito dentro del marco SDXL. El modelo acepta resoluciones entre 512×512 y 1536×1536, e indica que resoluciones como 1248×1824 son posibles sin modificaciones de alta resolución.

El entrenamiento se completó en julio de 2024, con datos con corte de conocimiento en junio de 2024. La model card no detalla el volumen de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, por lo que esos datos no están disponibles. Se describe como un checkpoint base preentrenado sin ajuste fino sobre estéticas o sesgos específicos, lo que lo convierte en una base "en bruto" para fine-tuning posterior. La compatibilidad con LoRA y ControlNet entrenados sobre Illustrious v0.1 se mantiene como característica destacada.

## Capacidades

- Generación de imágenes de ilustración a partir de texto, con soporte nativo de hasta 1536×1536 y rango operativo de 512×512 a 1536×1536.
- Prompting híbrido: acepta descripciones en lenguaje natural, etiquetas estilo Danbooru o una combinación de ambas.
- Compatibilidad con LoRA entrenados sobre Illustrious v0.1, lo que permite ajustar estilo, pose o composición.
- Compatibilidad con módulos ControlNet entrenados sobre Illustrious v0.1.
- Checkpoint base sin ajuste estético, adecuado como punto de partida para fine-tuning propio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento, por tratarse de un modelo text-to-image.

## Casos de uso

- Ilustración de personajes para videojuegos o cómics: el modelo genera ilustraciones a 1536×1536 con detalle y nitidez, útil para concept art y hojas de personaje donde la resolución nativa evita el reescalado posterior.
- Creación de arte conceptual con estilos personalizados: al ser un checkpoint base compatible con LoRA de v0.1, un estudio puede entrenar un LoRA propio con su estilo de marca y aplicarlo sin romper la compatibilidad del modelo.
- Generación de fondos y escenarios de alta resolución: resoluciones como 1248×1824 permiten producir ilustraciones verticales u horizontales de gran formato sin modificaciones de alta resolución.
- Control de composición y pose en pipelines de producción: la compatibilidad con ControlNet permite fijar poses, siluetas o estructuras y generar variaciones coherentes para animación o ilustración editorial.
- Prototipado rápido de ilustraciones para redes o publicaciones: la combinación de prompting por etiquetas y lenguaje natural agiliza la iteración sobre ideas antes de un refinado manual.
- Base para investigación en difusión de alta resolución: al ser un checkpoint "en bruto" con soporte nativo de 1536×1536 en SDXL, sirve como punto de partida para experimentos de fine-tuning y evaluación de resolución dentro de la familia SDXL.
- Generación de material ilustrativo para merchandising o impresión: la resolución nativa alta facilita la producción de imágenes destinadas a formatos impresos de tamaño medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia genérica de la arquitectura SDXL, la inferencia en precisión completa suele requerir del orden de 8-12 GB de VRAM, y las variantes cuantizadas o con optimizaciones pueden reducir ese requisito; no obstante, estos valores no están confirmados para este checkpoint concreto.
- GPU recomendadas: no disponible de forma específica para este modelo. Por la arquitectura SDXL, cabría esperar GPUs de gama alta con al menos 12-16 GB de VRAM para trabajar a 1536×1536 con comodidad, pero el dato no está verificado en la información disponible.
- ¿Cabe en GPU de consumo? No confirmado. La resolución nativa de 1536×1536 incrementa los requisitos de memoria frente a SDXL estándar a 1024×1024, por lo que conviene validar el comportamiento en GPUs de consumo antes de desplegar.
- Opciones de despliegue: no disponibles en la información proporcionada. Al ser un modelo SDXL, sería compatible con los runners habituales de difusión (por ejemplo, ComfyUI o Automatic1111), pero no se confirma en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución nativa | Contexto/prompting | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Illustrious XL v1.0 | SDXL | 1536×1536 | Lenguaje natural + etiquetas Danbooru | MIT | Hugging Face (`lirance/illustrious-xl-v1.0`) |
| Illustrious XL v0.1 | SDXL | no disponible | Etiquetas Danbooru | no disponible | Hugging Face (referenciado como base) |
| SDXL base (Stability AI) | SDXL | 1024×1024 | Lenguaje natural | no disponible en esta ficha | Hugging Face |

La comparación con SDXL base se basa en la resolución nativa documentada por la model card de Illustrious; los datos de parámetros, contexto y rendimiento de los modelos alternativos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: la model card indica que el modelo se distribuye sin ajuste fino sobre estéticas o sesgos específicos, por lo que los sesgos del dataset de entrenamiento subyacente pueden persistir; no se detallan sesgos concretos.
- Riesgo de alucinación: no aplica en el sentido textual, pero al ser un modelo generativo de imagen puede producir detalles anatómicos, textuales o de composición incorrectos, especialmente en resoluciones altas o prompts ambiguos.
- Limitaciones de contexto o idioma: los idiomas soportados no están disponibles. El prompting descrito se apoya en inglés y etiquetas Danbooru, por lo que el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: la licencia declarada es MIT, lo que en principio permite uso comercial; conviene revisar los términos de uso enlazados por el autor para confirmar condiciones adicionales.
- Caveat para producción: es un checkpoint base sin fine-tuning estético, por lo que los resultados pueden requerir LoRA o ajustes adicionales para alcanzar un estilo de marca concreto.
- Compatibilidad: la compatibilidad con LoRA y ControlNet se limita a los entrenados sobre Illustrious v0.1; los de otras familias SDXL pueden no funcionar correctamente.
- Conocimiento limitado a junio de 2024; la model card sugiere que el uso de LoRA de v0.1 mitiga esta limitación, pero no la elimina.
- No se dispone de información sobre cuantizaciones, formatos de pesos ni requisitos de hardware verificados.

## Enlaces

- [Hugging Face: lirance/illustrious-xl-v1.0](https://huggingface.co/lirance/illustrious-xl-v1.0)
- [OnomaAI TooToon](https://tootoon.ai/)
- [Illustrious v0.1 (Hugging Face)](https://huggingface.co/) (enlace genérico tal como aparece en la model card)
- [Términos de uso](https://huggingface.co/lirance/illustrious-xl-v1.0) (enlace no especificado en la model card; se referencia la página del modelo)
