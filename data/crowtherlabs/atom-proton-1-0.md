# CrowtherLabs/atom-proton-1.0

## Resumen

Atom Proton 1.0 es un modelo de visión-lenguaje (vision-language) de 27.800 millones de parametros desarrollado por CrowtherLabs, disenado para el ambito empresarial. Forma parte de la familia Atom, donde Neutron se encarga de buscar y clasificar el material que una organizacion posee, mientras que Proton lee ese material y lo procesa: extrae estructura de documentos, redacta y revisa textos, y ejecuta el razonamiento ordinario que compone los flujos de trabajo empresariales.

El modelo lee texto e imagenes, razona antes de responder (modo thinking) y escribe en el registro estilistico que Crowther utiliza en sus publicaciones profesionales. Su arquitectura es un checkpoint estandar `qwen3_5` con 64 capas que intercalan dos tipos de atencion, incluyendo capas de atencion lineal con una ruta rapida que requiere librerias adicionales. Los pesos ocupan aproximadamente 55 GB en bfloat16, por lo que se recomienda un acelerador de 80 GB o cuantizacion para hardware menor.

La relevancia actual del modelo radica en su enfoque especifico para flujos de trabajo empresariales con entrada multimodal, combinado con razonamiento deliberado antes de cada respuesta. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, aunque solo esta disponible en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (híbrida, 64 capas con atencion intercalada: atencion completa y atencion lineal) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificado (soporta `quantization_config` para reducir requisitos de VRAM) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Atom Proton 1.0 utiliza una arquitectura `qwen3_5` estandar, lo que permite servirlo con cualquier runtime que soporte dicha arquitectura (vLLM, transformers, etc.). El modelo cuenta con 64 capas que intercalan dos tipos de atencion: atencion completa tradicional y capas de atencion lineal. Estas ultimas disponen de una ruta rapida que `transformers` no incluye por defecto; sin las librerias `flash-linear-attention` y `causal-conv1d` instaladas, la inferencia se ejecuta con una implementacion torch mas lenta y se muestra una advertencia de fallback.

El modelo es nativamente multimodal (vision-lenguaje) y se carga mediante `AutoModelForImageTextToText`. Se puede descartar el tower de vision y usar solo el decoder de texto con `AutoModelForCausalLM` si se desea servir unicamente texto.

El modelo fue adaptado exclusivamente con ejemplos con thinking habilitado, al nivel de esfuerzo de razonamiento `xhigh`. La plantilla de chat resuelve el parametro `reasoning_effort` de la siguiente forma: si se omite, se usa `xhigh` por defecto; `high` es un alias de `xhigh`; `medium` no anade ninguna instruccion de razonamiento; `low` anade una instruccion breve; cualquier otro valor lanza una excepcion. El modo `enable_thinking=False` no fue ejercitado durante la adaptacion, por lo que su comportamiento no esta garantizado.

No se dispone de informacion sobre los datos de entrenamiento, el numero de tokens procesados, ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Lectura y comprension de texto e imagenes (entrada multimodal nativa).
- Razonamiento deliberado antes de responder: el modelo genera un bloque de thinking que cierra con ` response` antes de escribir la respuesta final.
- Extraccion de estructura de documentos: identifica y organiza la informacion contenida en documentos empresariales.
- Redaccion de textos profesionales en el registro estilistico de Crowther.
- Revision y critica de textos escritos.
- Razonamiento general para flujos de trabajo empresariales.
- Capacidad conversacional multi-turno.
- Soporte de tool calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y multi-step reasoning: no disponible (no se menciona explicitamente).
- Capacidades multilingues: no, solo ingles.

## Casos de uso

- Extraccion de estructura de documentos: el modelo puede leer documentos empresariales (contratos, politicas, informes) y extraer su estructura logica, identificando secciones, clausulas y datos clave. Su ventana multimodal permite procesar documentos que combinan texto e imagenes.
- Resumen de politicas y normativas: como muestra el ejemplo de la model card, el modelo puede resumir una politica de aprovisionamiento en cinco puntos, aplicando razonamiento previo para seleccionar la informacion mas relevante.
- Redaccion de documentos profesionales: el modelo escribe en el registro estilistico de Crowther, lo que lo hace adecuado para generar borradores de informes, memorandos y comunicaciones internas con un tono consistente.
- Revision y edicion de textos: puede revisar documentos redactados por otros, detectar inconsistencias y proponer mejoras, aprovechando su capacidad de razonamiento deliberado.
- Analisis de documentos con contenido visual: al ser un modelo de vision-lenguaje, puede procesar documentos que incluyen diagramas, graficos o capturas de pantalla junto con texto, extrayendo informacion de ambos canales.
- Automatizacion de flujos de trabajo empresariales: el modelo puede integrarse en pipelines que requieran lectura de documentos, razonamiento sobre su contenido y generacion de respuestas o acciones, por ejemplo en sistemas de gestion documental o procesos de compliance.
- Asistente conversacional empresarial: puede actuar como asistente interno que responde preguntas sobre la documentacion de la organizacion, manteniendo conversaciones multi-turno con contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 55 GB en bfloat16, por lo que se recomienda un acelerador con 80 GB de VRAM (por ejemplo, A100 80 GB o H100).
- Es posible reducir los requisitos de VRAM pasando un `quantization_config` al cargar el modelo, aunque no se especifican los tipos de cuantizacion soportados.
- GPU recomendadas: A100 80 GB, H100 80 GB, o GPUs consumer de gama alta con cuantizacion (por ejemplo, RTX 4090 con 24 GB si se aplica cuantizacion suficiente).
- Opciones de despliegue: vLLM (`vllm serve CrowtherLabs/atom-proton-1.0 --dtype bfloat16`), transformers con `AutoModelForImageTextToText`, o cualquier runtime compatible con la arquitectura `qwen3_5`.
- Para la ruta rapida de atencion lineal es necesario instalar `flash-linear-attention` y `causal-conv1d`; sin ellas, la inferencia es notablemente mas lenta.
- Latencia y throughput estimados: no disponible.
- La configuracion de serving no fue ejercitada durante la adaptacion, por lo que se recomienda verificar el prompt renderizado antes de usarlo en produccion.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa rigurosa. La busqueda web revela la existencia de CrowtherLabs/Atom-Electron-1.0, otro modelo de la misma familia, pero no se proporcionan sus especificaciones tecnicas ni resultados de benchmarks. No se puede comparar con modelos de tamano similar (por ejemplo, Qwen2.5-VL-27B o Llama-3.1-8B) sin datos de rendimiento publicados.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles. No se ha entrenado ni evaluado para otros idiomas.
- Modo sin thinking: la adaptacion se realizo exclusivamente con ejemplos con thinking habilitado. Usar `enable_thinking=False` no fue ejercitado y su comportamiento no esta garantizado.
- Nivel de razonamiento: el modelo debe servirse a nivel `xhigh` (o `high`, que es un alias). Usar `medium` o `low` produce prompts diferentes a los de adaptacion, lo que puede degradar la calidad de las respuestas.
- Configuracion de serving: no fue ejercitada durante la adaptacion. Se recomienda verificar el prompt renderizado antes de confiar en el en produccion.
- Requisitos de hardware: los 55 GB de pesos en bfloat16 exigen un acelerador de 80 GB o cuantizacion. Sin las librerias de ruta rapida, la inferencia es significativamente mas lenta.
- Sesgos y alucinaciones: no se dispone de informacion sobre sesgos conocidos ni evaluaciones de alucinacion. Como modelo de razonamiento, puede generar respuestas confiadas pero incorrectas si el material de entrada es ambiguo.
- Datos de entrenamiento: no se ha publicado informacion sobre la composicion del dataset, por lo que no es posible evaluar posibles sesgos derivados de los datos.
- Benchmarks: no se han publicado resultados, lo que impide evaluar su rendimiento relativo frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CrowtherLabs/atom-proton-1.0
- Organizacion CrowtherLabs en HuggingFace: https://huggingface.co/CrowtherLabs
- Modelo hermano Atom-Electron-1.0: https://huggingface.co/CrowtherLabs/Atom-Electron-1.0
- Repositorio flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Repositorio causal-conv1d: https://github.com/Dao-AILab/causal-conv1d
