# houseofboern/realism-qwen-image-2.1-edit-lora

## Resumen

realism-qwen-image-2.1-edit-lora es un adaptador LoRA de edicion de imagen desarrollado por el usuario houseofboern sobre el modelo de difusion Qwen-Image-2.1 de Alibaba Qwen. Su proposito es acotado y muy concreto: tomar una imagen con aspecto evidente de generacion artificial y desplazar su balance de tono y color hacia el de una fotografia capturada con un telefono movil. No es un modelo de generacion desde cero ni un editor instruccional generalista, sino un ajuste fino de bajo rango que aprende una unica instruccion de texto.

El adaptador tiene rango 8, alpha 8 y ocupa aproximadamente 40 MB en un unico archivo safetensors, lo que lo convierte en un componente ligero que se carga sobre el modelo base sin duplicar pesos. Se entreno con el trainer Fizgig sobre un conjunto de datos muy reducido: 30 pares antes/despues, cada uno formado por una imagen generada por IA y la fotografia real de telefono de la que procedia, con el mismo recorte y la misma forma. El autor detuvo el entrenamiento en la epoca 8 de 12 (240 pasos) al no observar mejoras visibles en las epocas posteriores.

Su relevancia practica esta limitada por dos factores que conviene tener presentes desde el principio. El primero es que el efecto es sutil y se concentra en la dominante de color, no en la textura de piel ni en el nivel de detalle: no redibuja al sujeto, no altera la pose ni el encuadre. El segundo es la licencia: hereda la Qwen Research License del modelo base, que restringe el uso comercial salvo que se disponga de una licencia comercial otorgada por Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Qwen-Image-2.1 |
| Parametros totales | Adaptador de rango 8, aproximadamente 40 MB en disco; parametros del modelo base no disponibles |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de edicion de imagen, no de texto) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors; la cuantizacion aplicable es la del modelo base, no la del adaptador) |
| Idiomas soportados | No disponible en la informacion proporcionada; la unica instruccion de entrenamiento esta en ingles |
| Licencia | Qwen Research License (qwen-research-license), uso no comercial salvo licencia comercial de Qwen |
| Formato de pesos | safetensors (realism-qwen-image-2.1-edit-lora-e8.safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 con alpha 8 que se aplica sobre Qwen-Image-2.1 mediante un cargador de LoRA estandar (LoraLoaderModelOnly en ComfyUI), a fuerza 1.0 en las pruebas del autor; segun la model card, a fuerza 1.5 el resultado era practicamente identico. El pipeline de inferencia completo requiere tres componentes: el modelo de difusion Qwen-Image-2.1, su VAE correspondiente y el codificador de texto Qwen3-VL-8B. El autor advierte de que el VAE original de Qwen-Image-2.1 puede dejar un patron de tablero de ajedrez tenue en la piel, y recomienda decodificar con madebyollin/texture-fix-vae-for-qwen-image-2.1 para eliminarlo.

El entrenamiento se realizo con el trainer Fizgig (commit 5d5ced3), usando su preset integrado «Qwen 2.1 Edit (rank 8, adaptive LR)» y su adaptador de entrenamiento para Qwen 2.1, que permanecio congelado y no se guardo dentro del LoRA. La configuracion fue: 30 pares antes/despues con el mismo recorte y forma, rank 8 / alpha 8, tasa de aprendizaje adaptativa entre 2e-4 y 4e-4, optimizador AdamW de 8 bits, EMA de 0.98 y cubos (buckets) de 0.5 MP. El proceso se detuvo en la epoca 8 de 12, es decir, 240 pasos. El autor realizo ademas una prueba de bloques: desactivar cualquier cuarto de los 32 bloques, o ejecutar un cuarto de forma aislada, apenas producia diferencias visibles, por lo que recomienda usar el archivo completo. No se documento ningun tipo de RLHF, DPO ni ajuste por preferencias, ni se especifico la composicion tematica del dataset mas alla de que son pares sintetico/real.

## Capacidades

- Edicion de imagen guiada por instruccion, limitada a una unica orden de entrenamiento: «convert this into a real phone photo».
- Ajuste de tono y color hacia un balance mas propio de camara de telefono movil.
- Preservacion de la identidad de la persona, la pose y el encuadre originales.
- Preservacion de la forma y el tamano de la imagen de entrada cuando se muestrea desde la salida latente del nodo de codificacion de texto.
- Integracion en flujos ComfyUI mediante el cargador de LoRA estandar.
- No soporta tool calling ni function calling: es un adaptador de difusion, no un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues declaradas; la model card solo contempla una instruccion en ingles.
- No incorpora modo de pensamiento (thinking), vision descriptiva ni procesamiento de audio.
- No redibuja piel ni anade detalle: el efecto declarado por el autor es sutil y cromatico.

## Casos de uso

- Normalizacion cromatica de imagenes generadas por IA en catalogos y mockups: aplicar el LoRA con la instruccion fija sobre imagenes sinteticas de producto para que el balance de blancos y la dominante de color se acerquen a los de una fotografia real de movil, antes de integrarlas en una maqueta o presentacion.
- Preprocesado de datasets sinteticos de investigacion: cuando se construye un corpus de imagenes generadas y se necesita reducir la «firma» cromatica tipica de los generadores para estudiar sesgos de deteccion o de percepcion humana, siempre dentro de los limites de la licencia no comercial.
- Limpieza estetica previa a la publicacion en redes: el LoRA no toca pose ni encuadre, por lo que sirve para suavizar el aspecto plastico de retratos generados sin alterar la composicion ya validada por el disenador.
- Edicion por lotes en ComfyUI: al ser un archivo de 40 MB con ajustes fijos (25 pasos, CFG 1, resolucion en torno a 768), se puede insertar como nodo adicional en un grafo ya existente y procesar colecciones completas de imagenes con coste computacional marginal respecto al modelo base.
- Pruebas comparativas de realismo perceptual: investigadores que evaluan si un ajuste de tono de bajo rango basta para que observadores clasifiquen una imagen sintetica como fotografia real, con el LoRA como variable experimental aislada.
- Prototipado de flujos de fotografia de producto generativa: estudiar si un pipeline de generacion mas este adaptador produce resultados suficientemente creibles para una fase de concepto previa a la produccion fotografica real.
- Demostraciones tecnicas y material docente sobre LoRA de edicion: el caso es util para explicar como un dataset de 30 pares y 240 pasos basta para inducir un cambio de estilo sutil pero medible, y para ilustrar el uso del preset de Fizgig.
- Ajuste de imagen de referencia en equipos de direccion de arte: aplicar el adaptador como paso final para alinear el aspecto de varias imagenes generadas entre si antes de una revision interna.

En todos los escenarios de explotacion comercial debe resolverse antes la cuestion de licencia descrita en el apartado de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, comparativas perceptuales ni evaluaciones humanas con porcentajes), y las unicas referencias de rendimiento son cualitativas: el autor describe el efecto como sutil, centrado en tono y color, y sin cambios en piel, detalle, persona, pose ni encuadre.

## Requisitos de hardware

- El adaptador en si ocupa unos 40 MB, por lo que su huella de memoria es despreciable frente al modelo base.
- El consumo real de VRAM lo determina Qwen-Image-2.1 junto con su VAE y el codificador de texto Qwen3-VL-8B. No se dispone de cifras oficiales de VRAM en la informacion proporcionada.
- Estimacion orientativa no confirmada por el autor: un codificador de texto de 8.000 millones de parametros en precision de 16 bits ronda los 16 GB por si solo, de modo que en configuraciones de consumo (RTX 4090, 24 GB) es previsible que haya que recurrir a cuantizacion del codificador, descarga parcial a CPU o ejecucion secuencial de etapas. Esta cifra es una orientacion, no un dato del modelo.
- GPU profesionales (A100, H100) no son necesarias por el tamano del adaptador, pero si la VRAM del pipeline completo excede la de una GPU de consumo.
- Opciones de despliegue: ComfyUI es el entorno documentado por el autor, con LoraLoaderModelOnly, Text Encode Qwen Image 2.1 y el VAE corregido de madebyollin. Otros backends de difusion compatibles con Qwen-Image-2.1 y LoRA safetensors podrian funcionar, pero no estan documentados en la informacion disponible.
- Ajustes de muestreo recomendados por el autor: 25 pasos, CFG 1, resolucion en torno a 768 (el LoRA se entreno a 0.5 MP y, segun las notas de Fizgig, los LoRA de edicion entrenados a ese tamano rinden mejor cerca de 768).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de realismo o de edicion comparables, ni datos de rendimiento que permitan establecer una comparacion cuantitativa. El unico elemento de referencia es el propio modelo base Qwen-Image-2.1, sobre el que este adaptador se aplica y del que hereda la licencia, pero no se dispone de sus especificaciones tecnicas en el material facilitado.

## Limitaciones y advertencias

- Efecto sutil: el autor lo circunscribe a tono y color. No cabe esperar redibujado de piel, aumento de detalle ni correccion de artefactos estructurales.
- Una sola instruccion valida. La model card insiste en usar exactamente «convert this into a real phone photo», sin describir la imagen ni anadir terminos de estilo, y con el prompt negativo vacio. Anadir palabras como «realistic, 8k, detailed» empuja de vuelta el aspecto brillante propio de Qwen.
- Dataset extremadamente reducido (30 pares) y un unico tema de entrenamiento, lo que limita la generalizacion a dominios alejados de los retratos o escenas de los pares originales.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de artefactos propios del modelo de difusion subyacente, incluido el patron de tablero de ajedrez en la piel descrito por el autor, que se mitiga con un VAE alternativo.
- Limitaciones de idioma: no hay soporte multilingue declarado; fuera del prompt en ingles no se documenta comportamiento alguno.
- Limitacion de resolucion: entrenado con cubos de 0.5 MP, con 768 como resolucion de referencia recomendada; no se documenta su comportamiento a resoluciones altas.
- Restriccion de licencia: Qwen Research License, que prohibe el uso comercial salvo licencia comercial expresa de Qwen. El adaptador hereda esta condicion, por lo que no puede desplegarse en un producto o servicio comercial sin resolver previamente la licencia del modelo base.
- Madurez: el repositorio presenta 0 descargas y 0 me gusta en el momento de la consulta, sin validacion externa ni evaluaciones independientes.
- La prueba de bloques del autor indica que el efecto esta distribuido de forma difusa por los 32 bloques; no se recomienda trocear el archivo ni aplicar subconjuntos.
- Los resultados de busqueda web asociados a esta consulta no contenian ninguna referencia tecnica relevante al modelo y han sido descartados en su totalidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/houseofboern/realism-qwen-image-2.1-edit-lora
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Trainer Fizgig (repositorio, commit 5d5ced3): https://github.com/shootthesound/Fizgig
- VAE alternativo para corregir el patron de tablero de ajedrez: https://huggingface.co/madebyollin/texture-fix-vae-for-qwen-image-2.1
