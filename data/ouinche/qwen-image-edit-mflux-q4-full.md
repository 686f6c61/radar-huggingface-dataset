# Ouinche/qwen-image-edit-mflux-q4-full

## Resumen

Qwen-Image Edit — MLX 4-bit Full es una distribucion cuantizada a 4 bits del modelo de edicion de imagen Qwen/Qwen-Image-Edit, desarrollado originalmente por el equipo Qwen de Alibaba Cloud y portado a Apple Silicon por el usuario Ouinche (proyecto DiffusionBear). El modelo resuelve edicion de imagenes guiada por instrucciones en lenguaje natural: recibe una o varias imagenes de referencia junto a un prompt textual y genera una version editada coherente con la instruccion. Su relevancia actual radica en que hace viable ejecutar un modelo de difusion de gran tamano en equipos Mac con 16 GB de memoria unificada, algo que las distribuciones estandar no permiten por el coste de memoria del codificador de texto.

La innovacion principal de esta distribucion es que incluye el codificador de texto ya cuantizado a 4 bits (~4,25 GB frente a los ~14,4 GB en BF16 de las distribuciones habituales), lo que reduce el paquete total de ~27,5 GB a ~17,1 GB y elimina los fallos de memoria (out-of-memory) de la GPU Metal durante la codificacion de prompts con multiples imagenes. Soporta edicion con hasta 3 imagenes de referencia simultaneas.

El modelo esta pensado exclusivamente para el ecosistema MLX/mflux en Apple Silicon, con pesos en formato safetensors y metadatos especificos de mflux. No es un modelo de lenguaje generalista, sino un pipeline de difusion image-to-image, por lo que sus capacidades se limitan a generacion y edicion de imagenes a partir de instrucciones en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (image-to-image) basado en transformer, con codificador de texto Qwen-VL y VAE; port MLX de Qwen-Image-Edit |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionado por el tokenizador Qwen-VL, sin cifra publicada) |
| Tipos de cuantizacion | 4 bits (transformer y text encoder cuantizados en formato MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | other (licencia personalizada heredada del modelo base; consultar terminos de Qwen-Image-Edit) |
| Formato de pesos | safetensors en formato MLX (transformer en 7 shards, text encoder en 8 shards, VAE nativo MLX) |

## Arquitectura y entrenamiento

Esta distribucion no entrena un modelo nuevo: es una cuantizacion y port del modelo base Qwen/Qwen-Image-Edit, cuya arquitectura original corresponde al equipo Qwen de Alibaba Cloud. El pipeline se compone de un transformer de difusion cuantizado a 4 bits (~12,4 GB repartidos en 7 shards), un codificador de texto tambien a 4 bits (~4,25 GB en 8 shards) con metadatos de mflux, un VAE en formato MLX nativo (~242 MB) y el tokenizador completo Qwen-VL con sus plantillas de chat. El modelo base es un fine-tune de Qwen-Image orientado a edicion por instrucciones.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original dentro de la informacion proporcionada. La innovacion tecnica documentada por el autor es la cuantizacion nativa del codificador de texto a 4 bits con metadatos mflux, que reduce el uso de memoria en mas de 10 GB y permite ejecutar el pipeline en Macs de 16 GB. El autor menciona ademas la posibilidad de configurar tiling y liberar el codificador de texto tras la codificacion para mantener el pico de memoria por debajo de 12 GB.

## Capacidades

- Edicion de imagenes guiada por instrucciones en lenguaje natural (image-to-image).
- Edicion multi-referencia con hasta 3 imagenes de entrada en un mismo prompt.
- Generacion de imagenes a partir de texto (text-to-image) mediante el pipeline Qwen-Image subyacente.
- Comprension de instrucciones de edicion localizadas ("replace the sunglasses with glowing blue aviator goggles").
- Integracion con el ecosistema mflux para scripting en Python.
- Soporte de callbacks y configuracion de tiling para gestion de memoria.
- Capacidades multilingues: solo ingles declarado.
- No dispone de tool calling, function calling ni razonamiento agentico multi-paso: es un modelo de difusion, no un LLM conversacional.

## Casos de uso

- Edicion de fotografia de producto en Mac: un disenador puede sustituir fondos, colores o accesorios sobre una foto base con instrucciones textuales, usando las 3 referencias para mantener coherencia de estilo.
- Prototipado rapido de variaciones de diseno grafico: generar alternativas de un cartel o ilustracion partiendo de una referencia y un prompt de edicion, con 20 pasos de inferencia y guidance 4.0 como valores de partida reproducibles.
- Retoque asistido en flujos locales sin nube: al ejecutarse en Apple Silicon con MLX, permite editar imagenes sensibles sin enviarlas a servicios externos.
- Generacion de assets para videojuegos o ilustracion: crear variantes de personajes (por ejemplo, cambiar gafas o vestuario) manteniendo la identidad visual de la referencia.
- Automatizacion de pipelines de contenido: integracion via Python/mflux en scripts que apliquen ediciones por lotes a un conjunto de imagenes con prompts predefinidos.
- Educacion y demostraciones tecnicas: el repositorio incluye un par de imagenes de entrada y salida reproducibles (semilla 42) que sirven para verificar la instalacion y comparar resultados.
- Uso en equipos de 16 GB: el tiling y la liberacion del text encoder permiten mantener el pico de memoria por debajo de 12 GB, habilitando edicion en MacBook Air o Pro de gama base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor unicamente documenta una demostracion reproducible con parametros concretos: 768 × 768, 20 pasos de inferencia, guidance scale 4.0, scheduler linear y semilla 42, pero sin cifras de latencia, throughput ni metricas de calidad objetivas.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~17,1 GB de descarga total; en ejecucion, el autor indica que con tiling y liberando el text encoder se puede mantener el pico por debajo de 12 GB.
- Equipos objetivo: Apple Silicon con MLX; el autor declara compatibilidad con Macs de 16 GB de memoria unificada.
- GPU recomendadas: chips Apple Silicon (serie M). No se documenta soporte para GPU NVIDIA, AMD ni CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de 16 GB o mas; no esta pensado para GPUs discretas de consumo tipo RTX.
- Opciones de despliegue: libreria mflux (Python) y la aplicacion DiffusionBear; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este pipeline).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ouinche/qwen-image-edit-mflux-q4-full | no disponible | no disponible | MLX 4-bit (safetensors) | other | HuggingFace, requiere mflux/Apple Silicon |
| Qwen/Qwen-Image-Edit (base) | no disponible | no disponible | BF16 (safetensors) | other | HuggingFace, pipeline estandar |
| Distribuciones estandar de Qwen-Image-Edit para MLX | no disponible | no disponible | MLX con text encoder BF16 (~27,5 GB) | other | Requieren mas memoria (~27,5 GB de descarga) |

La comparativa cuantitativa con alternativas de otros fabricantes (por ejemplo, modelos de edicion de imagen de otros proveedores) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles como idioma declarado; los prompts en castellano pueden degradar la calidad de la edicion.
- Es un modelo de difusion: no razona, no ejecuta herramientas y no mantiene conversaciones; cualquier expectativa de uso como LLM es incorrecta.
- Riesgo de alucinacion visual: puede introducir elementos no solicitados o alterar zonas de la imagen que no deberia tocar, especialmente con prompts ambiguos.
- La licencia es "other" y hereda las restricciones del modelo base Qwen-Image-Edit; es imprescindible revisar los terminos originales antes de un uso comercial.
- Dependencia exclusiva del ecosistema MLX/mflux y de hardware Apple Silicon; no es portable a CUDA sin conversion adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion de la comunidad ni reportes independientes de calidad.
- La cuantizacion a 4 bits puede introducir perdida de fidelidad frente al modelo base en BF16; no se han publicado comparativas de calidad.
- En equipos de 16 GB es necesario configurar tiling y liberar el text encoder para evitar fallos de memoria; sin esa configuracion el pipeline puede agotar la memoria.
- No se documentan sesgos especificos, pero al ser un modelo de difusion entrenado con datos no detallados, puede reproducir sesgos de representacion presentes en el modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ouinche/qwen-image-edit-mflux-q4-full
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit
- Libreria MLX: https://github.com/ml-explore/mlx
- Libreria mflux: https://github.com/filipstrand/mflux
- Aplicacion DiffusionBear: https://github.com/OuincheWinch/DiffusionBear
