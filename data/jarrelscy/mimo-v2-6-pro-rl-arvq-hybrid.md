# jarrelscy/MiMo-V2.6-Pro-RL-ARVQ-hybrid

## Resumen

`jarrelscy/MiMo-V2.6-Pro-RL-ARVQ-hybrid` es un checkpoint de cuantizacion de terceros derivado del modelo base `XiaomiMiMo/MiMo-V2.6-Pro-RL`, publicado por el usuario jarrelscy bajo licencia MIT. Se trata de una conversion experimental que combina tecnicas de cuantizacion NVFP4 y ARVQ (codebooks FP4 independientes por experto enrutado, con escalas de bloque en FP16), preservando los pesos multimodales de vision y audio, el tokenizador de audio, el MTP embebido y los pesos separados de DFlash del modelo original. El repositorio ocupa 57,5 GB y declara 25.045.703.810 parametros reales leidos de los ficheros safetensors.

El punto clave para cualquier evaluacion es que se trata de un artefacto en estado *work-in-progress*. La propia model card advierte de que el ajuste incremental inicial y la fase de PV (probablemente *post-validation* o *progressive validation*, no aclarado) estan en curso, que faltan capas por procesar y que "las capas ausentes no son utilizables". En consecuencia, no es un checkpoint de servicio completo ni validado: el autor indica explicitamente que la calidad multimodal y el servicio con contexto de 1M sobre SM120 no estan verificados.

Su relevancia ahora mismo es, por tanto, acotada al ambito de la investigacion en cuantizacion extrema: sirve como material de estudio sobre asignacion de codebooks FP4 por experto en arquitecturas MoE multimodales, y como banco de pruebas para el fork de vLLM que el propio autor mantiene para SM120. No es un modelo recomendable para produccion en su estado actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con enrutado por experto; modelo multimodal con vision y audio segun la model card. Detalle completo de la arquitectura base: no disponible |
| Parametros totales | 25.045.703.810 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible; la model card menciona "SM120 1M-context serving" sin verificar |
| Tipos de cuantizacion | Hibrida NVFP4 + ARVQ: expertos enrutados en FP4 con codebooks independientes y escalas de bloque FP16 (2,125 bpw incluyendo escalas); pesos no-expert preservados en FP8/BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con `custom_code`, tag `nvfp4_arvq_hybrid`); repositorio de 57,5 GB |

## Arquitectura y entrenamiento

La informacion disponible describe el esquema de cuantizacion, no la arquitectura base completa. Se sabe que el modelo es un MoE multimodal (conserva pesos de vision y audio, tokenizador de audio, MTP embebido y pesos DFlash separados) y que los expertos enrutados se cuantizan con codebooks FP4 independientes por experto, con escalas de bloque en FP16, alcanzando 2,125 bits por peso incluyendo escalas. No hay poda de expertos: todos los expertos enrutados se asignan a ARVQ en esta linea base inicial de memoria, mientras que los pesos no-expert se preservan desde la release original en FP8/BF16. La model card aclara que esta asignacion inicial no constituye una "hot allocation" medida.

En cuanto al proceso de ajuste, la fase PV emplea una perdida sobre la salida MoE con la misma entrada, optimizador Adam, propuestas de indices discretos ponderadas por activacion y seleccion de checkpoint sobre un conjunto reservado. El entrenamiento usa la tokenizacion de texto nativa de MiMo sobre la mezcla de fuentes de calibracion previa. Tanto el numero de tokens de entrenamiento del modelo base como la composicion exacta del dataset, la presencia de RLHF/DPO y cualquier innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, etc.) figuran como no disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto multimodal: el checkpoint conserva los pesos de vision y audio del modelo base, aunque el alcance real de estas capacidades no esta verificado.
- Procesamiento de audio: se conserva el tokenizador de audio, lo que sugiere soporte de entradas o salidas de audio, sin validacion publicada.
- Razonamiento y codigo: no disponible; no hay evaluaciones ni descripcion de capacidades en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo *thinking* o modos especiales: el modelo conserva el MTP (multi-token prediction) embebido y pesos DFlash separados, pero su funcionamiento efectivo en este checkpoint no esta documentado.
- Estado de validacion: el checkpoint no esta completo ni validado para servicio; las capas ausentes no son utilizables.

## Casos de uso

- Investigacion en cuantizacion FP4 de MoE: el checkpoint permite estudiar como se comporta una asignacion de codebooks FP4 independientes por experto (2,125 bpw) frente a los pesos FP8/BF16 originales, midiendo degradacion por capa.
- Analisis de pipelines de calibracion ARVQ: util para reproducir o auditar la metodologia descrita (perdida sobre salida MoE con misma entrada, Adam, indices discretos ponderados por activacion) sobre modelos de escala similar.
- Pruebas de kernels NVFP4 en hardware SM120: el fork de vLLM del autor esta orientado a SM120, por lo que este repositorio sirve para validar rutas de ejecucion FP4 en GPUs Blackwell.
- Desarrollo de infraestructura de servicio con contexto muy largo: si se confirma el objetivo de 1M tokens de contexto, es un banco de pruebas para estrategias de KV cache y memoria en GPU de gran capacidad, siempre que se complete el checkpoint.
- Evaluacion comparativa de calidad multimodal preservada: al retener pesos de vision y audio, permite medir si la cuantizacion de los expertos degrada tareas cross-modales, algo relevante para futuras recetas de compresion.
- Docencia y formacion tecnica: como ejemplo documentado de cuantizacion hibrida NVFP4+ARVQ aplicada a un modelo de 25B parametros, con metricas de tamano (57,5 GB) y bpw explicitas.
- Advertencia general: ninguno de estos casos debe plantearse en produccion con el estado actual del repositorio, ya que faltan capas y la validacion esta pendiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 57,5 GB; cargar los pesos completos requiere aproximadamente 60-65 GB de memoria, sin contar memoria de activaciones ni KV cache. Estimacion orientativa, no confirmada por el autor.
- Contexto largo: con una ventana de hasta 1M tokens, el KV cache dominaria el consumo de memoria y exigiria varias GPUs o tecnicas de offload; no hay cifras publicadas.
- GPU recomendadas: el fork de servicio esta orientado a SM120 (familia Blackwell, por ejemplo B200 o RTX Pro 6000 Blackwell). No hay confirmacion de funcionamiento correcto en H100 (SM90) ni en generaciones anteriores, dado que los kernels NVFP4 dependen del soporte hardware.
- GPU de consumo: no cabe en una unica GPU de consumo de gama alta actual (32 GB en RTX 5090), y las GPUs anteriores a Blackwell (RTX 4090, SM89) carecen de soporte FP4 nativo.
- Opciones de despliegue: vLLM mediante el fork del autor (`jarrelscy/vllm-mimo-v26-arvq-sm120`). Compatibilidad con llama.cpp, Ollama o TGI: no disponible. El formato safetensors con `custom_code` implica que los frameworks genericos no cargaran el modelo sin soporte especifico.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| jarrelscy/MiMo-V2.6-Pro-RL-ARVQ-hybrid | 25.045.703.810 | no disponible (1M sin verificar) | NVFP4+ARVQ hibrida, 2,125 bpw en expertos | MIT | Work-in-progress, sin validar, 0 descargas |
| XiaomiMiMo/MiMo-V2.6-Pro-RL (base) | no disponible | no disponible | Pesos originales FP8/BF16 preservados en parte | MIT | Release oficial de Xiaomi; referencia del proceso de cuantizacion |
| Alternativas de terceros de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Checkpoint incompleto: la model card indica que el ajuste inicial y la fase PV estan en curso y que las capas ausentes no son utilizables. El modelo no es un artefacto de servicio validado.
- Sin validacion de calidad: la calidad multimodal esta explicitamente sin verificar y no se ha publicado ninguna evaluacion de degradacion respecto al modelo base.
- Riesgo elevado de alucinacion y de salidas degeneradas: al tratarse de pesos parcialmente procesados, cualquier inferencia puede producir resultados incorrectos de forma no controlada.
- Contexto no confirmado: el servicio con 1M tokens sobre SM120 se menciona como objetivo, no como capacidad verificada.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingue.
- Restricciones de licencia: licencia MIT, que en principio permite uso comercial, pero hereda las condiciones del modelo base `XiaomiMiMo/MiMo-V2.6-Pro-RL`; conviene revisar la licencia del modelo base antes de cualquier uso comercial. MIT no implica ninguna garantia de funcionamiento.
- Dependencia de codigo personalizado: los tags `custom_code` y `nvfp4_arvq_hybrid` implican que la carga requiere soporte especifico; los frameworks estandar probablemente fallen o ignoren parte de los pesos.
- Dependencia de hardware: los kernels NVFP4 requieren GPUs SM120 (Blackwell); no hay evidencia de funcionamiento en arquitecturas anteriores.
- Ausencia de traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por terceros.
- Sesgos conocidos: no disponible, al no haberse publicado evaluaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jarrelscy/MiMo-V2.6-Pro-RL-ARVQ-hybrid
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Fork de vLLM para servicio en SM120: https://github.com/jarrelscy/vllm-mimo-v26-arvq-sm120
- Fichero de progreso de la fase PV: `pv_progress.json` (incluido en el repositorio)
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los unicos enlaces obtenidos pertenecen a un sitio de calculadoras de hipotecas, sin relacion alguna con este modelo.
