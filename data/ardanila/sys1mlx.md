# ardanila/sys1mlx

## Resumen

Sys1MLX es un modelo de decision local publicado por el usuario ardanila en HuggingFace, pensado especificamente para Apple Silicon y construido sobre el checkpoint base Qwen3.5-4B-Base. No es un generador de texto: recibe un estado textual, opcionalmente una imagen, y un conjunto de opciones definidas por el usuario, y devuelve una opcion seleccionada junto con probabilidades sin redondear. Ademas del tipo de pregunta `choice`, soporta los tipos `noul` y `score`. El artefacto tiene 991.474.176 parametros reales en safetensors segun HuggingFace, con un repositorio de 3,1 GB.

Tecnicamente es una derivacion cuantizada y multimodal del modelo base: se aplica un adaptador LoRA fijado por revision sobre Qwen3.5-4B-Base, se fusionan los pesos en FP32 y se convierten a BF16, se cuantizan las capas lineales y de embedding del lenguaje a MLX affine 4-bit (group size 64) y se conserva la torre visual original en BF16 junto con una cabeza de puntero (pointer head) separada en FP32. El runtime corrige la normalizacion Q/K de las capas DeltaNet a la convencion epsilon de suma de cuadrados de MLX-LM, un detalle que altera las salidas si se omite.

Su relevancia es acotada pero clara: demuestra un flujo de decision multimodal de baja latencia en hardware de consumo Apple. El autor reporta una latencia de aproximadamente 0,7-1,2 s por inferencia con imagen fresca en un M4 y un pico de asignador MLX de unos 3,54 GiB. No obstante, se trata de un artefacto experimental, sin calibracion de probabilidades en tareas visuales y sin benchmarks generales publicados; los unicos resultados son comprobaciones de desarrollo sobre 24 casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido basado en Qwen3.5, con capas DeltaNet de atencion lineal (parametros recurrentes `A_log`) y torre visual restaurada; pesos de lenguaje fusionados con LoRA |
| Parametros totales | 991.474.176 (recuento real de safetensors en HuggingFace) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible; el runtime limita la entrada conjunta imagen mas texto a 2048 tokens |
| Tipos de cuantizacion | MLX affine 4-bit con group size 64 (capas lineales y embedding de lenguaje); torre visual en BF16; cabeza de puntero en FP32; exportacion Core ML experimental en FP16 |
| Idiomas soportados | en, ru (segun etiquetas del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` y `head.safetensors`), formato nativo MLX |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, no de su variante ajustada con instrucciones, y de un adaptador LoRA fijado por revision (`70dd4088ebf4eb82d15ef57a863a5b9a98b94d6c`) sobre la revision base `1001bb4d826a52d1f399e183466143f4da7b741b`. La receta de conversion, descrita en la model card, aplica cada actualizacion del adaptador en FP32 mediante `W + (alpha/r) * B @ A`, castea el resultado a BF16, cuantiza las capas lineales y de embedding del lenguaje a MLX affine 4-bit con group size 64 y sanea los nombres y layouts de tensores a traves del modelo MLX Qwen3.5 conservando todos los pesos visuales. La carga de tensores es estricta. El proceso se ejecuto con MLX 0.32.2 sobre CPU Linux, y el propio autor advierte de que la cuantizacion puede diferir ligeramente de una conversion hecha con Metal.

La innovacion tecnica principal no esta en el entrenamiento, sino en el ensamblaje de inferencia. No se realizo ningun ajuste fino visual nuevo: la torre visual se restaura y sus caracteristicas se insertan en el flujo de lenguaje con posiciones RoPE multimodales. El modelo usa la codificacion original de tokens de opcion y una lectura mediante cabeza de puntero, de modo que no necesita proyeccion de vocabulario. El runtime corrige la normalizacion Q/K de DeltaNet a la convencion de suma de cuadrados de MLX-LM, correccion sin la cual las salidas cambian. Los resultados de entrenamiento y benchmarks del modelo upstream no son medidas de este derivado cuantizado.

## Capacidades

- Decision de opcion multiple: dado un estado textual y un diccionario de opciones con criterios, devuelve la opcion elegida y probabilidades sin redondear en el orden de insercion.
- Tipos de pregunta alternativos: soporta `choice`, `noul` y `score`.
- Decision multimodal: acepta una imagen local por peticion (PNG u otros formatos decodificables), con un presupuesto de 16 a 512 tokens de imagen (256 por defecto).
- Procesamiento de imagenes: decodifica hasta 32 megapixeles y preserva la relacion de aspecto mediante el procesador de Qwen.
- Reutilizacion de contexto: cache opcional de imagen y de prefijo, acotada a 64 MiB por defecto, desactivable con `--cache-mb 0`, y modo `--prefix` para reutilizar contexto.
- Ejecucion local en Apple Silicon: runtime Python incluido, sin dependencia de servicios alojados.
- Exportacion experimental de la torre visual a Core ML en FP16 con geometria fija (384x384 / 144 tokens y 512x512 / 256 tokens) para ejecucion parcial en ANE.

No se documenta soporte de tool calling, function calling, agentes, generacion libre de texto, matematicas ni codigo. El autor indica explicitamente que no es un generador de texto y que `mlx_lm.generate`, `mlx_vlm.generate` y la carga automatica con Transformers no funcionan con este artefacto.

## Casos de uso

- Clasificacion de capturas de pantalla en local: el modelo puede recibir una captura de interfaz y un conjunto de criterios definidos por el usuario (por ejemplo, estado de un boton o color de un elemento) y devolver la categoria con su probabilidad, sin enviar la imagen a un servicio externo, lo que resulta adecuado para entornos con requisitos de privacidad.
- Triaje de imagenes en dispositivos Apple: gracias a la latencia reportada de 0,7-1,2 s por imagen fresca en un M4, se puede usar como primer filtro sobre lotes moderados de imagenes antes de derivar los casos ambiguos a un modelo mayor.
- Enrutado de decisiones en un pipeline mayor: al devolver una opcion y una probabilidad, encaja como componente de decision determinista dentro de un flujo mas amplio, donde el umbral de probabilidad decide si se continua o se escala a revision humana.
- Asistencia al etiquetado con criterios explícitos: los campos `instructions` y `criteria` permiten expresar la taxonomia en lenguaje natural, de modo que un equipo puede generar etiquetas preliminares y revisar despues solo los casos de baja confianza.
- Verificacion visual de contenido sintetico: los diagnosticos del autor incluyen casos sinteticos de color, forma, conteo y posicion, por lo que el modelo puede emplearse en comprobaciones automatizadas de que una imagen generada cumple propiedades geometricas o cromaticas esperadas.
- Control de calidad en procesos de captura: con el limite de 32 megapixeles y la preservacion de relacion de aspecto, se puede validar si una fotografia cumple condiciones definidas (presencia de un objeto, color dominante) en un puesto de trabajo con Mac.
- Clasificacion textual de opcion multiple sin imagen: el tipo `noul` permite usar el modelo como clasificador de texto con opciones predefinidas, util para etiquetado de intenciones o categorizacion de tickets en un conjunto cerrado de clases.
- Evaluacion de decisiones con puntuacion: el tipo `score` admite criterios graduados, lo que permite ordenar alternativas en lugar de elegir una sola, por ejemplo para priorizar candidatos segun varios criterios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales en la informacion disponible. El autor indica expresamente que los resultados de benchmark upstream no son medidas de este derivado cuantizado. Lo unico documentado son diagnosticos locales de desarrollo, que no constituyen evidencia sobre datos retenidos:

| Diagnostico local | Casos | Resultado |
|---|---|---|
| Casos sinteticos de color, forma, conteo, UI y posicion mas 6 fotografias de scikit-image, con vision nativa BF16 | 24 | 24/24 respuestas esperadas |
| Mismos casos sin imagen | 24 | 7/24 respuestas esperadas |
| Control de intercambio de imagen | 18 | 18/18 |

En cuanto a rendimiento de ejecucion, el autor reporta una latencia de aproximadamente 0,7-1,2 s por inferencia con imagen fresca en un M4, dependiendo de la geometria de la imagen y de la peticion, y un pico de asignador MLX de unos 3,54 GiB. Se advierte de que esa cifra no es la memoria total del sistema ni un techo de VRAM. La tabla de experimentos emparejados comparando vision nativa MLX frente a vision hibrida en ANE aparece truncada en la informacion disponible, por lo que sus valores no se pueden reproducir aqui.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con soporte MLX Metal. No hay soporte CUDA ni ROCm documentado.
- Memoria: el autor indica que hay que reservar varios GiB para el proceso ademas de lo que consume macOS y el resto de aplicaciones, y que los pesos por si solos no determinan el uso de RAM. La configuracion validada es un M4 con 16 GiB de memoria unificada.
- Pico observado: aproximadamente 3,54 GiB de asignador MLX durante inferencia con imagen fresca; es un pico de asignador, no memoria total del sistema.
- Equipos no validados: el autor senala que no se han validado maquinas mas pequenas que la probada.
- Cabe en GPU de consumo: si, en los Mac Apple Silicon probados; no aplica a GPU NVIDIA o AMD en esta implementacion.
- Opciones de despliegue: solo el runtime Python incluido (`python -m sys1mlx.cli` o la API `sys1mlx.vision_loader.load_vision`). No son compatibles vLLM, llama.cpp, Ollama, TGI, `mlx_lm.generate`, `mlx_vlm.generate` ni la carga automatica con Transformers.
- Exportacion Core ML experimental: cubre unicamente la torre visual, en FP16 y con geometria fija; el modelo de lenguaje y la cabeza de decision siguen ejecutandose en MLX. Cada paquete ocupa aproximadamente 633 MiB y requiere `coremltools==9.0` y espacio libre para las caches de compilacion de Core ML.
- Entorno probado: Python 3.11, macOS 26.5.2, M4, 16 GiB.
- Latencia: 0,7-1,2 s por imagen fresca en M4. Los tiempos con imagen repetida y con cache de prefijo corresponden a cargas de trabajo distintas y no deben compararse con la inferencia de imagen fresca.

## Comparativa con modelos similares

No disponible. La busqueda web realizada no devolvio informacion relevante sobre modelos comparables, y la model card no incluye comparaciones con alternativas. El unico punto de referencia identificable es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ardanila/sys1mlx | 991.474.176 (safetensors) | no disponible; limite de 2048 tokens para imagen mas texto | Decision multimodal de opcion multiple | apache-2.0 | HuggingFace; requiere runtime propio en MLX |
| Qwen/Qwen3.5-4B-Base | 4B (nominal, segun la denominacion del modelo base) | no disponible en la informacion proporcionada | Modelo de lenguaje base | no disponible en la informacion proporcionada | HuggingFace |

Se observa una discrepancia no explicada en la informacion disponible: el recuento real de parametros en safetensors (991.474.176) no coincide con el tamano nominal de 4B que sugiere el nombre del modelo base. La model card no ofrece una explicacion de esta diferencia.

## Limitaciones y advertencias

- No es un generador de texto. No admite `mlx_lm.generate`, `mlx_vlm.generate`, la carga automatica con Transformers ni widgets de inferencia alojados; solo funciona con el runtime Python incluido.
- Caracter experimental: el autor etiqueta el modelo como experimental y senala que no se realizo ningun ajuste fino visual nuevo, por lo que la calidad de decision visual es experimental.
- Probabilidades sin calibrar: la cabeza de decision no ha sido calibrada en tareas con imagen, de modo que las probabilidades devueltas no deben interpretarse como confianzas calibradas.
- Evidencia muy limitada: los unicos resultados son diagnosticos de desarrollo sobre 24 casos sinteticos y 6 fotografias, y el propio autor advierte de que las fotografias pueden haber aparecido en el preentrenamiento. No hay evidencia sobre datos retenidos ni benchmarks generales.
- Limites de entrada: una sola imagen local por peticion, maximo 32 megapixeles decodificados, presupuesto de 16 a 512 tokens de imagen y un maximo de 2048 tokens para imagen mas texto empaquetados.
- Restriccion de plataforma: requiere Apple Silicon con MLX Metal. El autor no ha validado equipos con menos memoria que el M4 de 16 GiB probado.
- Idiomas declarados: en y ru. No hay informacion sobre el comportamiento en castellano ni en otros idiomas.
- Discrepancia de parametros: el recuento real de safetensors no coincide con el tamano nominal del modelo base, sin explicacion documentada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de decision con opciones cerradas, el modo de fallo esperado es la seleccion de una opcion incorrecta, no la invencion de contenido libre.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de equidad.
- Uso comercial: la licencia apache-2.0 lo permite en principio, pero conviene verificar las condiciones del modelo base Qwen3.5-4B-Base y del adaptador LoRA de origen, cuyas licencias no se detallan en la informacion proporcionada.
- Produccion: dado el caracter experimental, la ausencia de calibracion y la falta de benchmarks, no es recomendable como unico componente de decision en flujos criticos sin una capa de validacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ardanila/sys1mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Attribucion de fuentes y releases originales: archivo `ATTRIBUTION.md` dentro del repositorio del modelo
- Receta de exportacion a Core ML: `experimental/ane_export.py` dentro del repositorio del modelo
- Paper, blog o demo adicionales: no disponible; la busqueda web realizada no devolvio resultados relevantes
