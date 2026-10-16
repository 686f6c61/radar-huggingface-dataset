# darkframeai/darkframe-found

## Resumen

darkframe-found es un adaptador LoRA de estilo para generacion de imagenes texto-a-imagen, publicado por el usuario darkframeai en HuggingFace. No es un modelo completo, sino un ajuste de bajo rango (rank 32, alpha 32) entrenado sobre el modelo base black-forest-labs/FLUX.2-klein-base-4B durante 2500 pasos. Su objetivo es reproducir la estetica visual del cine de metraje encontrado (found footage), con un encuadre caracteristico en el que las figuras humanas aparecen en primer plano.

El adaptador se activa mediante la palabra clave darkframe-found, que debe colocarse al inicio del prompt. El repositorio ocupa aproximadamente 0,1 GB y distribuye un unico archivo de pesos en formato safetensors. La licencia declarada es Apache 2.0, lo que permite uso comercial segun los terminos de dicha licencia, siempre que se respeten tambien las condiciones del modelo base.

Su relevancia es acotada pero clara: cubre un nicho estetico muy concreto (terror de metraje encontrado) dentro del ecosistema FLUX.2, y esta publicado con fecha de 15 de octubre de 2026. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, por lo que no existen datos de adopcion ni validacion por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusion texto-a-imagen; la arquitectura interna del modelo base no esta detallada en la informacion disponible |
| Parametros totales | No disponible para el adaptador. El modelo base se denomina FLUX.2 Klein 4B, lo que sugiere en torno a 4000 millones de parametros en el modelo completo |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica (modelo de generacion de imagen; la entrada es un prompt de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo darkframe-found.safetensors) |
| Tipo de artefacto | LoRA de estilo (no es un modelo base) |
| Modelo base | black-forest-labs/FLUX.2-klein-base-4B |
| Rank / alpha | 32 / 32 |
| Pasos de entrenamiento | 2500 |
| Palabra de activacion | darkframe-found (al inicio del prompt) |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | text-to-image |
| Fecha de publicacion | 15 de octubre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del adaptador ni del modelo base. Se sabe que darkframe-found es un LoRA de estilo con rank 32 y alpha 32, entrenado durante 2500 pasos sobre FLUX.2 Klein 4B base. El autor indica que los datos de entrenamiento proceden de fotogramas (stills) de "Prompt Vault", y que el conjunto resultante enfoca a las personas encuadradas en primeros planos, lo que define el sesgo compositivo del estilo aprendido.

No se especifican en la model card el numero de tokens o imagenes utilizadas, la composicion exacta del dataset, ni si hubo fases de ajuste por preferencias humanas (RLHF o DPO). Tampoco se documentan innovaciones tecnicas adicionales. Un punto critico documentado por el autor es la incompatibilidad: el archivo no se carga en FLUX.2 Klein 9B ni en FLUX.2 dev, solo en endpoints basados en FLUX.2 Klein 4B.

## Capacidades

- Generacion de imagenes texto-a-imagen con una estetica de metraje encontrado (found footage), orientada al genero de terror.
- Aplicacion de un estilo visual consistente mediante la palabra de activacion darkframe-found colocada al inicio del prompt.
- Encuadre preferente de figuras humanas en primeros planos, segun la descripcion del propio autor.
- Composicion con LoRA en pipelines de difusion: el ejemplo oficial usa guidance_scale 4 y 28 pasos de inferencia.
- Integracion mediante endpoints compatibles con LoRA (el autor documenta un ejemplo en formato JSON para un endpoint Fal).
- No hay evidencia de soporte de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni capacidades multilingues, ya que se trata de un generador de imagenes y no de un modelo de lenguaje.

## Casos de uso

- Previsualizacion de planos para cortometrajes de terror: el LoRA permite generar fotogramas de referencia con la estetica de metraje encontrado antes de rodar, ahorrando coste en pruebas de vestuario, iluminacion y encuadre.
- Storyboards y moodboards de direccion de arte: util para fijar el lenguaje visual de un proyecto (granulado, camara en mano, primeros planos) y alinearlo con el equipo tecnico.
- Arte conceptual para videojuegos independientes de terror: generacion rapida de ilustraciones de ambiente o de personajes en primer plano con una estetica coherente y reconocible.
- Portadas de album y material promocional de musica: artistas de generos oscuros pueden producir caratulas con una textura visual de metraje recuperado sin depender de sesiones fotograficas.
- Ilustracion editorial y articulos sobre cine de genero: medios especializados pueden crear imagenes de acompanamiento para piezas sobre found footage o terror analogico.
- Fondos y texturas para presentaciones o piezas audiovisuales: el estilo permite generar imagenes de ambiente con grano y bajo contraste para usar como material de fondo.
- Generacion de variantes de estilo en produccion grafica: al ser un LoRA, se puede combinar con otros adaptadores y prompts para explorar variaciones del mismo lenguaje visual sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye seis imagenes de ejemplo correspondientes a muestras del paso 2500 de entrenamiento, sin metricas cuantitativas (FID, CLIP score, similitud estetica ni comparaciones con otros LoRA).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de difusion de aproximadamente 4000 millones de parametros suele requerir del orden de 10 a 16 GB de VRAM en precision de 16 bits, y menos si se aplican tecnicas de cuantizacion o de descarga secuencial de modulos. Estas cifras son estimaciones generales, no datos publicados por el autor.
- El propio adaptador es ligero: el repositorio ocupa 0,1 GB, por lo que el cuello de botella de memoria lo determina el modelo base, no el LoRA.
- GPU recomendadas: no disponibles. Por rango de VRAM, GPUs de consumo como la RTX 4090 (24 GB) o la RTX 4080 (16 GB) serian candidatas razonables para ejecutar el modelo base, pero no hay confirmacion del autor.
- Opciones de despliegue: el autor documenta un endpoint con soporte de LoRA (formato JSON con el campo loras y scale 1.0). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de difusion de imagen. Si aplicarian herramientas como ComfyUI o Diffusers, pero no estan citadas en la informacion disponible.
- Latencia y throughput: no disponibles. El unico parametro de inferencia documentado son 28 pasos con guidance_scale 4.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, tamano efectivo ni contexto para establecer una comparativa cuantitativa fiable. La informacion proporcionada solo permite comparar a nivel de ficha tecnica.

| Modelo | Tipo | Modelo base | Parametros | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| darkframe-found | LoRA de estilo | FLUX.2 Klein 4B | No disponible (base ~4B) | Apache 2.0 | No publicados |
| FLUX.2 Klein 4B base | Modelo de difusion texto-a-imagen | No aplica | ~4B (segun denominacion) | No disponible en esta ficha | No publicados |
| FLUX.2 Klein 9B | Modelo de difusion texto-a-imagen | No aplica | ~9B (segun denominacion) | No disponible en esta ficha | No publicados |

Nota: el autor indica explicitamente que darkframe-found no se carga sobre Klein 9B ni sobre FLUX.2 dev, por lo que la comparativa con esas variantes solo tiene sentido a nivel de compatibilidad, no de sustitucion.

## Limitaciones y advertencias

- Compatibilidad restringida: el archivo solo funciona sobre FLUX.2 Klein 4B. No se carga en FLUX.2 Klein 9B ni en FLUX.2 dev, segun advierte el propio autor.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar anatomia incorrecta, texto ilegible o artefactos en manos, rostros y objetos pequenos. No hay evaluacion publicada al respecto.
- Sesgo compositivo marcado: el entrenamiento enfoca a las personas en primeros planos, lo que puede dificultar planos generales, escenas sin figuras humanas o composiciones que requieran cuerpo entero.
- Sesgos de estilo: al derivarse de un conjunto acotado de fotogramas de referencia, el estilo puede reproducir de forma involuntaria patrones concretos del material original. No se documenta la procedencia ni los derechos de dichos fotogramas.
- Idiomas: no disponible. No se especifica que idiomas acepta el prompt, aunque la model card esta redactada en ingles.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa ni reportes de terceros.
- Licencia: Apache 2.0 en el adaptador, pero el uso comercial tambien queda sujeto a la licencia del modelo base FLUX.2 Klein 4B, cuyos terminos no se detallan en la informacion proporcionada.
- Ausencia de benchmarks: no hay metricas publicadas que permitan estimar la calidad del estilo ni compararlo con alternativas.
- Fecha de publicacion: la ficha indica el 15 de octubre de 2026, posterior a la fecha de redaccion de muchos materiales de referencia; conviene verificar el estado del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darkframeai/darkframe-found
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Archivo de pesos: https://huggingface.co/darkframeai/darkframe-found/resolve/main/darkframe-found.safetensors
- Ejemplos del autor: directorio examples/ dentro del repositorio (sample_0.jpg a sample_5.jpg)
- Documentacion de despliegue: ejemplo JSON incluido en la model card para un endpoint con soporte de LoRA (referencia a un endpoint Fal)
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada
