# bravikron/detective-crumpet-qwen-image-lora

## Resumen

Detective Crumpet es un LoRA de texto a imagen para el modelo base Qwen-Image-2512, desarrollado por Bravikron Labs (usuario `bravikron` en Hugging Face). No es un modelo generativo independiente, sino un adaptador de bajo rango que especializa al modelo base en la representacion consistente de un personaje original: un gato atigrado naranja rechoncho, detective, originario del pueblo ficticio de Whisker Hollow, que aparece en el proximo videojuego del estudio, The Lying Village.

El adaptador resuelve un problema concreto de produccion: mantener la identidad visual de un personaje a traves de poses, angulos, encuadres y vestuario distintos sin perder rasgos definitorios (ojos verdes, hocico y pecho blancos, punta de la cola blanca y gabardina). La version 1.1 refuerza la silueta caracteristica del personaje (cuerpo rechoncho, patas cortas) en poses de accion como correr, saltar, trepar o montar en bicicleta.

El repositorio ocupa 0,6 GB e incluye un unico archivo de pesos en formato safetensors (`bravikron_crumpet_v1_1.safetensors`), identico a la release publicada en Civitai. El LoRA se activa mediante la palabra disparadora `crump3t` y esta pensado para integrarse en flujos de trabajo de difusion con Qwen-Image-2512, incluida su variante Lightning de 4 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusion multimodal (Qwen-Image-2512) |
| Parametros totales | no disponible (el repo pesa 0,6 GB; el numero de parametros del adaptador no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el prompt de instancia y los ejemplos estan en ingles) |
| Licencia | bravikron-free-lora-license (uso libre, incluido comercial de las imagenes generadas; prohibida la reventa del archivo LoRA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre Qwen-Image-2512, un modelo de difusion para generacion de imagenes a partir de texto. El LoRA modifica un subconjunto de pesos del modelo base para inyectar el concepto del personaje sin reentrenar el modelo completo. El repositorio no detalla el rango del adaptador, el numero de pasos de entrenamiento, el tamano del dataset ni la composicion de las imagenes de entrenamiento; estos datos no estan disponibles en la informacion proporcionada.

La model card si documenta el diseno del personaje y su comportamiento esperado: identidad visual fija (ojos verdes, hocico y pecho blancos, punta de cola blanca, gabardina), palabra disparadora `crump3t` y una plantilla de prompt recomendada (`crump3t, full body, <scene>, wearing <outfit>`). La version 1.1 se centra en preservar la constitucion rechoncha y las patas cortas en poses dinamicas. La model card advierte de que el LoRA funciona mejor con Crumpet como unico personaje de la escena, ya que otros animales pueden "tomar prestada" su gabardina y su sombrero.

## Capacidades

- Generacion de texto a imagen especializada en un unico personaje original (gato detective) con identidad visual consistente.
- Control de encuadre y composicion mediante lenguaje natural: primeros planos, planos medios, cuerpo completo y planos generales.
- Cambio de vestuario manteniendo los rasgos del personaje (gabardina y sombrero deerstalker por defecto; bufanda, jersey, pijamas u otras prendas en los ejemplos).
- Representacion de poses de accion: correr, saltar, trepar, montar en bicicleta, construir un muneco de nieve.
- Compatibilidad con el LoRA Lightning de 4 pasos de Qwen-Image-2512 (4 pasos, CFG 1) para generacion rapida.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje: es exclusivamente un adaptador de generacion de imagenes.
- Capacidades multilingues: no disponibles; los ejemplos y la palabra disparadora estan en ingles.

## Casos de uso

- Produccion de arte para videojuegos: generar variaciones del personaje Detective Crumpet para The Lying Village (sprites, ilustraciones promocionales, conceptos de escena) manteniendo la coherencia visual entre assets gracias a la identidad fijada por el LoRA.
- Ilustracion de libros infantiles o juveniles: crear secuencias de escenas con el mismo personaje en situaciones narrativas distintas (investigando huellas, persiguiendo sombras, en pijama) con un prompt corto y una palabra disparadora.
- Merchandising y material promocional: producir imagenes del personaje en distintos formatos (retrato, cuerpo completo, plano general) para camisetas, posteres o redes sociales, con licencia que permite uso comercial de las imagenes generadas.
- Prototipado rapido de personajes: usar el LoRA como referencia para validar el diseno de un personaje antes de encargar modelado 3D o animacion, aprovechando la consistencia entre poses y angulos.
- Storyboarding de animacion o comic: generar viñetas con el personaje en poses de accion (correr por tejados, montar en bicicleta) para previsualizar secuencias antes de la produccion final.
- Contenido para comunidades de mascotas ficticias o fandoms: crear ilustraciones tematicas (navidad, escenas nocturnas, interiores) con el personaje como protagonista, usando el template de prompt documentado.
- Pruebas de pipelines de difusion: servir como caso de prueba controlado para evaluar la fidelidad de un LoRA de personaje sobre Qwen-Image-2512 y su combinacion con el LoRA Lightning de 4 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para este LoRA; depende del modelo base Qwen-Image-2512, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el LoRA en si ocupa 0,6 GB, pero el modelo base condiciona el requisito real de memoria.
- Opciones de despliegue: no se especifican en la model card; el formato safetensors es compatible con los runners habituales de difusion que soporten LoRA sobre Qwen-Image-2512.
- Latencia y throughput: no disponibles. La model card indica ajustes de inferencia recomendados (30 pasos, CFG 4, sampler euler/simple, shift 3.1, fuerza de LoRA 1.0) y una alternativa con el LoRA Lightning de 4 pasos y CFG 1.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Detective Crumpet (este LoRA) | LoRA de personaje sobre Qwen-Image-2512 | no disponible (repo de 0,6 GB) | no disponible | bravikron-free-lora-license | Hugging Face y Civitai |
| Qwen-Image-2512 (modelo base) | Modelo de difusion texto a imagen | no disponible | no disponible | Apache 2.0 | Hugging Face |
| LoRA Lightning de Qwen-Image-2512 | LoRA de aceleracion (4 pasos) | no disponible | no disponible | no disponible | Referenciado en la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- El LoRA esta disenado para un unico personaje; funciona peor cuando aparecen otros animales en la escena, que pueden adoptar su gabardina y su sombrero.
- La model card advierte de dificultades con bicicletas: recomienda pedir "a tiny children's bicycle" o "feet dangling above the pedals" para evitar resultados deformes.
- No hay informacion sobre sesgos del adaptador ni sobre el dataset de entrenamiento; se desconoce su composicion y posibles sesgos heredados del modelo base.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar detalles anatomicos o de vestuario inconsistentes, especialmente en poses complejas o encuadres amplios.
- La licencia permite el uso comercial de las imagenes generadas, pero prohibe revender el archivo LoRA y presentar el personaje como propio o como persona real; ademas se aplica la licencia del modelo base (Apache 2.0).
- El personaje es una creacion original de Bravikron Labs; su uso esta vinculado a las condiciones de la licencia `bravikron-free-lora-license`.
- No se documentan capacidades multilingues; los prompts de ejemplo estan en ingles y se desconoce el comportamiento con prompts en castellano.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/bravikron/detective-crumpet-qwen-image-lora
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2512
- Pagina de Civitai (mas imagenes y notas de version): https://civitai.com/models/3033685
- Modelos gratuitos de Bravikron: https://bravikron.com/models.html
- Entrenamiento de LoRA personalizado: https://bravikron.com/labs.html
- Licencia completa: LICENSE.md en el repositorio de Hugging Face
