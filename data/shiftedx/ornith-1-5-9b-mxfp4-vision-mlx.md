# Shiftedx/ornith-1.5-9b-mxfp4-vision-mlx

## Resumen
El modelo **ornith-1.5-9b-mxfp4-vision-mlx** es una cuantizacion MXFP4 de 4 bits del modelo multimodal Ornith-1.5-9B, creada por Shiftedx para ejecutarse de forma eficiente en hardware Apple Silicon mediante el ecosistema MLX. El modelo base, desarrollado por Ornith AI, es un VLM denso de 9B basado en la arquitectura Qwen3.5 que integra vision y lenguaje, con una ventana de contexto de 262 144 tokens. Esta variante cuantizada reduce el peso total a 5,7 GB, lo que facilita su despliegue en portatiles Mac, iPad y otros dispositivos con memoria unificada limitada.

La relevancia de este lanzamiento reside en que combina una tecnica de cuantizacion reciente (MXFP4 con grupo de 32) con un modelo multimodal de alto rendimiento, manteniendo la torre de vision en BF16 para preservar la calidad de percepcion visual. El autor incluye un registro de conversion (conversion_receipt.json) y una receta de construccion (BUILD_RECIPE.json) que documentan el proceso de forma transparente, lo que es util para replicar o depurar el modelo. Aunque no se han publicado benchmarks especificos de esta cuantizacion, el modelo base afirma superar en rendimiento a modelos notablemente mas grandes como Gemma 4-31B y Qwen 3.6-35B, segun el anuncio oficial de Ornith.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 multimodal (language trunk + vision tower) |
| Parametros totales | 2 135 710 960 (contador safetensors; el modelo base declara 9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | MXFP4 group-32 (language), BF16 (vision) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento
El modelo base Ornith-1.5-9B es un modelo denso de 9B que utiliza la arquitectura Qwen3.5, con un modulo de lenguaje y un modulo de vision. Segun el anuncio oficial, Ornith-1.5 introduce un enfoque de "self-scaffolding" que evoluciona hacia un ciclo de auto-mejora, aunque no se detallan los datos de entrenamiento (numero de tokens, composicion del dataset) en la informacion disponible. La cuantizacion MXFP4 aplicada por Shiftedx convierte los pesos del modulo de lenguaje en bloques de 4 bits con agrupacion de 32, mientras que la torre de vision se mantiene en BF16 para preservar la fidelidad de las representaciones visuales. El modelo no incluye tensores `mtp.*` (multi-token prediction), por lo que no es compatible con decodificacion especulativa nativa. El proceso de conversion esta documentado en los archivos `BUILD_RECIPE.json` y `conversion_receipt.json`, que detallan el mapa de precision y los pasos de conversion.

## Capacidades
- Generacion de texto y conversacion multimodal: puede responder a prompts que incluyen imagenes y texto.
- Comprension de imagenes: describe escenas, responde preguntas sobre el contenido visual y extrae informacion de imagenes.
- Contexto largo: soporta hasta 262 144 tokens, lo que permite procesar documentos extensos o secuencias de imagenes.
- Ejecucion local en Apple Silicon: optimizado para MLX-VLM, puede ejecutarse en Macs, iPads y iPhones con el runtime adecuado.
- No se ha confirmado soporte de tool calling ni function calling en la documentacion proporcionada.
- Capacidades multilinguees: no disponibles en la documentacion.

## Casos de uso
- Asistente visual local en dispositivos Apple: un usuario puede apuntar con la camara a un objeto o documento y recibir una descripcion o resumen en tiempo real, gracias a la cuantizacion que reduce el peso a 5,7 GB y permite inferencia en memoria unificada.
- Analisis de documentos escaneados: el modelo puede extraer y resumir informacion de imagenes de facturas, formularios o paginas de libros, con una ventana de contexto de 262k tokens para procesar documentos largos.
- Accesibilidad para personas con discapacidad visual: en un iPhone o Mac, el modelo puede describir escenas, leer texto en imagenes o identificar objetos, ofreciendo una capa de ayuda visual sin conexion a internet.
- Moderacion de contenido visual en servidores con Apple Silicon: se puede integrar en un pipeline de revision de imagenes para clasificar o filtrar contenido, aprovechando la licencia MIT para uso comercial.
- Investigacion en eficiencia de cuantizacion: el repositorio incluye los archivos de conversion, lo que permite a los desarrolladores estudiar el impacto de MXFP4 en un VLM de 9B y comparar con otras tecnicas de cuantizacion.
- Chatbot multimodal de proposito general: puede mantener conversaciones con contexto largo, por ejemplo, para asistencia en soporte tecnico donde se envian capturas de pantalla y el modelo las interpreta junto con el historial de la conversacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El anuncio oficial de Ornith indica que el modelo base Ornith-1.5-9B supera a Gemma 4-31B y Qwen 3.6-35B en ciertas pruebas, pero no se ofrecen cifras concretas, y no se puede verificar si esa afirmacion se mantiene tras la cuantizacion MXFP4.

## Requisitos de hardware
- VRAM estimada: al menos 6 GB de memoria unificada para cargar los 5,7 GB de pesos, aunque se recomienda 8 GB o mas para dejar espacio para la activacion y el contexto.
- GPU recomendada: cualquier chip Apple Silicon (M1, M2, M3, M4) con memoria unificada; el modelo esta optimizado para MLX, por lo que no es compatible con GPUs NVIDIA o AMD directamente.
- Es apto para dispositivos con 8 GB de RAM unificada, como un MacBook Air base o un iPad Pro con chip M-series.
- Opciones de despliegue: MLX-LM y MLX-VLM (autoregressive), con el comando `python -m mlx_vlm.generate` para inferencia interactiva.
- Latencia y throughput: no disponibles en la documentacion; dependen del chip y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | 9B | 262 144 | MIT | BF16 | Modelo original sin cuantizar, mas pesado |
| ornith-1.5-9b-mxfp4-vision-mlx (este) | 2.14B (contador safetensors) | 262 144 | MIT | MXFP4 + BF16 | Cuantizado para Apple Silicon, 5.7 GB |
| Gemma 4-31B | 31B | no disponible | no disponible | no disponible | Modelo de mayor tamano, pero el anuncio de Ornith afirma que el 9B lo supera |
| Qwen 3.6-35B | 35B | no disponible | no disponible | no disponible | Modelo de mayor tamano, mencionado en el anuncio |

Nota: los datos de Gemma 4 y Qwen 3.6 no estan disponibles en la informacion recopilada; la comparativa se basa en la afirmacion del anuncio de Ornith.

## Limitaciones y advertencias
- La cuantizacion MXFP4 de 4 bits puede provocar una perdida de calidad frente al modelo BF16 original, especialmente en tareas de razonamiento complejo o en la generacion de texto muy largo.
- El modelo base Ornith-1.5-9B puede tener sesgos y alucinaciones inherentes a su entrenamiento, que no se han evaluado de forma especifica en esta cuantizacion.
- No se han publicado resultados de benchmarks para la version cuantizada, por lo que el rendimiento en tareas concretas es incierto.
- El soporte multilingue no esta documentado; si se requiere uso en idiomas distintos del ingles, conviene verificar el comportamiento del modelo base.
- La licencia MIT permite uso comercial y modificacion, pero se debe revisar la licencia del modelo base y de sus componentes (Qwen3.5) para cumplir con todas las condiciones.
- No se incluye el soporte de decodificacion especulativa (MTP) porque el checkpoint original no contiene los tensores `mtp.*`.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Shiftedx/ornith-1.5-9b-mxfp4-vision-mlx
- Modelo base en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Anuncio de Ornith en X: https://x.com/ornith_/status/2092098493640171908
- Modelo similar de Shiftedx (Ornith-1.0 abliterado): https://huggingface.co/Shiftedx/ornith-1.0-9b-abliterated-mxfp4-mlx
