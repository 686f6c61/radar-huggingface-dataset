# araysuter/Inkling-2-Mini-MLX-4bit

## Resumen

Inkling-2-Mini-MLX-4bit es una conversión cuantizada a 4 bits para MLX del modelo multimodal Inkling-2-Mini desarrollado por Thinking Machines Lab. Se trata de un modelo de arquitectura MoE (mixture of experts) con aproximadamente 26.400 millones de parámetros lógicos, capaz de procesar entradas de imagen y texto y generar texto, incluyendo razonamiento y código. Esta versión concreta la publica el usuario independiente araysuter y no es un lanzamiento oficial de Thinking Machines.

El modelo resulta relevante para el ecosistema Apple Silicon porque permite ejecutar un modelo multimodal de gran tamaño en memoria unificada de equipos Mac, algo que con pesos en BF16 resultaría inviable en la mayoría de configuraciones de consumo. La conversión emplea cuantización afín de 4 bits con grupo de tamaño 32, mantiene embeddings y cabeza de salida en 8 bits y preserva el codificador de visión y las compuertas de enrutamiento en coma flotante.

La arquitectura conserva las 24 capas almacenadas y 48 aplicaciones de capa por token, con las doce capas centrales ejecutándose tres veces (patrón etiquetado como `inkling2_loop`). El contexto completo configurado en el modelo original se mantiene en la configuración, aunque el autor advierte que las ventanas de 128K y 1M no han sido validadas en esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de capas (`inkling2_loop`), multimodal imagen-texto |
| Parametros totales | 26.388.559.360 (aprox. 26,4B lógicos) |
| Parametros activos | no disponible |
| Longitud de contexto | Configurado hasta 1M en el modelo original; 128K y 1M no validados en esta conversión |
| Tipos de cuantizacion | Afín 4 bits (grupo 32) en matrices; 8 bits en embeddings y cabeza de salida; visión, enrutamiento y compuertas en coma flotante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos que incorpora un mecanismo de bucle de capas: de las 24 capas almacenadas, doce capas centrales se aplican tres veces por token, dando lugar a 48 aplicaciones de capa. Esta estructura busca aumentar la profundidad efectiva de cómputo sin incrementar proporcionalmente el número de parámetros almacenados. El modelo es multimodal, con un codificador de visión que procesa imágenes junto al texto.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron etapas de RLHF o DPO. El checkpoint original del que parte esta conversión es una publicación en NVFP4/MXFP8, no un checkpoint BF16 original, lo que implica que la cuantización a MLX añade error de reconstrucción acumulado. La conversión aplica búsqueda de recorte (clipping) por grupo con factores de 1 a 0,8 seleccionados por MSE de reconstrucción, reduciendo el MSE por grupo un 7,99 % frente a redondeo min/max. No se emplea calibración de activaciones tipo GPTQ o AWQ. El archivo auxiliar `mtp.safetensors` del modelo original no se incluye, por lo que no se reclama ninguna aceleración por decodificación especulativa.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento aritmético y resolución de problemas (validado con una prueba aritmética simple en la model card).
- Generación de código (validado con una función Python en la model card).
- Comprensión de imágenes: descripción de contenido visual (validado con una imagen de prueba).
- Procesamiento conjunto imagen-texto mediante el procesador de imágenes incluido en el port de MLX.
- Capacidad de razonamiento extendido (los tokens de razonamiento cuentan en las longitudes de generación registradas).
- Soporte de tool calling, function calling y comportamiento agéntico: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente de escritorio en Mac: el modelo puede ejecutarse localmente en un Apple M5 Max con 64 GiB de memoria unificada mediante MLX, lo que permite un asistente conversacional privado sin conexión a servicios externos.
- Análisis de imágenes en local: gracias al codificador de visión incluido, se puede usar para describir, clasificar o extraer información de capturas, fotografías o diagramas sin enviar datos a la nube.
- Generación de código en entornos Apple Silicon: útil para autocompletar o generar funciones en flujos de desarrollo local, con la ventaja de mantener el código en la máquina del desarrollador.
- Prototipado de aplicaciones multimodales: investigadores pueden validar pipelines imagen-texto en hardware de consumo antes de escalar a infraestructura mayor.
- Educación y experimentación: permite estudiar el comportamiento de un MoE con bucle de capas y cuantización agresiva en un entorno reproducible con MLX.
- Procesamiento de documentos con imágenes: extracción de información de facturas, formularios o gráficos combinando entrada visual y texto, siempre que la ventana de contexto validada sea suficiente.
- Evaluación de técnicas de cuantización: sirve como referencia para comparar la calidad de conversiones 4 bits frente al modelo original en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente una validación sintética con una muestra corta de texto:

| Prueba sintética | Modelo original | Esta conversión |
|---|---:|---:|
| Log-verosimilitud negativa media (NLL) | 2,26608 | 2,24673 |
| Perplejidad | 9,64151 | 9,45676 |

El delta de NLL es de -0,01935. El propio autor advierte que se trata de un pasaje sintético corto más tres prompts de prueba, no de un benchmark estándar ni de evidencia de precisión general.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos objetivo más visión ocupan 17,49 GB (16,29 GiB); el repositorio completo pesa 17,5 GB. La memoria total necesaria para inferencia supera esa cifra por el estado de activaciones y caché KV.
- GPU/unidad validada: Apple M5 Max con 64 GiB de memoria unificada, con MLX 0.32.4 y Python 3.14.
- Compatibilidad con GPU NVIDIA (A100, H100, RTX 4090): no aplica, ya que el formato es MLX y requiere el port de MLX-LM; no se documenta soporte para CUDA.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con memoria unificada suficiente (el autor validó con 64 GiB); no se documentan pruebas en configuraciones menores.
- Despliegue: exclusivamente mediante el port fijado de MLX-LM (`mlx-lm` en el commit `0c4c99192230f1943dd468d297f0b8a64ae7b7c2`). El MLX-LM estándar publicado no soportaba esta arquitectura en el momento de preparar el artefacto. Se recomienda la variable `MLX_ENABLE_TF32=0` para preservar ejecución en float32 completo; la ruta por defecto de precisión reducida del M5 falla tres de los ocho tests del port.
- Latencia y throughput: no disponibles de forma numérica; la model card indica que los tiempos quedan registrados en `VALIDATION.json` pero no los reproduce en el texto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo, se puede contrastar con el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Inkling-2-Mini (original) | ~26,4B lógicos | hasta 1M (configurado) | NVFP4/MXFP8 | Apache 2.0 |
| Inkling-2-Mini-MLX-4bit | ~26,4B lógicos | hasta 1M (no validado) | safetensors MLX 4 bits | Apache 2.0 |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos MoE multimodales de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La conversión parte de un checkpoint ya cuantizado en NVFP4/MXFP8, no de pesos BF16 originales; el error de reconstrucción es acumulativo y una conversión a 5 bits no recuperaría precisión de entrenamiento superior.
- No es un lanzamiento oficial de Thinking Machines; es una conversión independiente de araysuter.
- Las ventanas de contexto de 128K y 1M no han sido validadas en esta conversión.
- El archivo `mtp.safetensors` no se incluye, por lo que no hay decodificación especulativa ni la aceleración asociada.
- Requiere un port específico de MLX-LM; el MLX-LM estándar no es compatible con esta arquitectura.
- La ruta de precisión reducida por defecto del M5 falla tres de los ocho tests del port; es necesario usar `MLX_ENABLE_TF32=0`.
- La validación publicada es una muestra sintética muy pequeña; no hay evidencia de rendimiento en benchmarks estándar.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados: no disponible; no se puede garantizar calidad multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero se debe respetar la Model Acceptable Use Policy de Thinking Machines enlazada en la model card.
- El contador de parámetros del Hub puede diferir del valor lógico de 26,4B porque cuenta almacenamiento entero empaquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/araysuter/Inkling-2-Mini-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión del checkpoint original: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/6e7c8248f75265bdd4fbab5273304243b5d8c2cb
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Repositorio MLX-LM: https://github.com/ml-explore/mlx-lm
- Documentación de precisión de MLX: https://ml-explore.github.io/mlx/build/html/usage/precision.html
