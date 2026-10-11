# fbaldassarri/mistralai_Mistral-7B-v0.3-auto_round-int4-gs64-asym

## Resumen

Este repositorio es una versión cuantizada a INT4 del modelo base Mistral-7B-v0.3, publicada por el usuario fbaldassarri. La cuantización se ha hecho con Intel AutoRound (algoritmo SignRound) en modo *weights-only quantization* (WoQ): 4 bits, tamaño de grupo 64 y esquema asimétrico, partiendo del checkpoint original en bfloat16. El objetivo es reducir el peso en disco y la memoria de inferencia (el repositorio ocupa 4,8 GB) asumiendo una caída de precisión que el autor califica como ligera y una mejora de velocidad declarada de 2-3 veces sobre el modelo sin cuantizar.

El artefacto es un transformer decoder causal de tipo Mistral, concebido como modelo base o de completado: no está ajustado por instrucciones ni incorpora plantilla de chat. Hereda del modelo base una ventana de contexto de 32.768 tokens y un entrenamiento predominantemente en inglés. Su interés práctico está en que está optimizado para CPU Intel, iGPU Intel Arc y NPU (Core Ultra) mediante intel-extension-for-pytorch y OpenVINO, lo que permite servir un modelo de 7B en hardware sin GPU dedicada.

No obstante, se trata de una publicación con difusión prácticamente nula (0 descargas y 0 "me gusta" en el momento del análisis), declarada para fines de investigación. Antes de usarla en producción conviene validar su precisión y su rendimiento con mediciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal de tipo Mistral (causal-lm, model_type: mistral) |
| Parametros totales | 1.263.800.320 elementos tensoriales en el checkpoint según los metadatos de safetensors (pesos INT4 empaquetados más escalas y ceros de cuantización). El modelo base mistralai/Mistral-7B-v0.3 ronda los 7,25 mil millones de parámetros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens, heredados del modelo base Mistral-7B-v0.3; la model card no lo especifica de forma explícita |
| Tipos de cuantizacion | INT4 asimétrico, group size 64, WoQ (SignRound / Intel AutoRound v0.15.1) |
| Idiomas soportados | Inglés (en) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, en formato auto_round |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Mishal-7B-v0.3, un transformer decoder causal de la familia Mistral, que combina atención por ventana deslizante (SWA) y *grouped-query attention* (GQA). Sobre ese checkpoint no se ha realizado ningún ajuste adicional: este repositorio es únicamente una re-cuantización, por lo que conserva íntegramente los pesos aprendidos durante el preentrenamiento del modelo original. La model card no aporta información sobre la composición del dataset de preentrenamiento ni sobre si hubo fases de RLHF o DPO (y, al tratarse de un modelo base, cabe esperar que no las haya, aunque no se documenta).

La innovación técnica relevante está en el proceso de cuantización. Se empleó Intel AutoRound v0.15.1 con el algoritmo SignRound, en modo *weight-only*, 4 bits, tamaño de grupo 64 y cuantización asimétrica (`sym: false`). La calibración se ejecutó en CPU durante 40.414,7 segundos (unos 673,6 minutos, es decir, más de 11 horas) usando 128 muestras, 200 iteraciones de ajuste, longitud de secuencia 512 y tamaño de lote 4, con la carga del modelo en `torch.bfloat16`. El entorno registrado fue transformers 4.55.3 y torch 2.14.0+cpu. El resultado se guardó en formato auto_round y está pensado para inferencia en CPU Intel con intel-extension-for-pytorch, en iGPU Intel Arc y en NPU de la serie Core Ultra mediante OpenVINO.

## Capacidades

- Generación de texto por completado: el modelo recibe texto bruto y continúa la secuencia; no aplica formato de instrucciones ni plantilla de chat.
- Razonamiento, código y matemáticas básicas: hereda las capacidades del modelo base Mistral-7B-v0.3, pero sin ajuste por instrucciones el rendimiento depende por completo del *prompting* y de ejemplos *few-shot*.
- Soporte de tool calling / function calling: no nativo. Al no estar ajustado por instrucciones, no dispone de formato de llamada a herramientas ni de tokens especiales para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa por la misma razón; requeriría envoltorios externos y prompting cuidadoso.
- Capacidades multilingües: limitadas. La model card declara únicamente inglés.
- Capacidades especiales: ninguna. No hay modo *thinking*, ni visión, ni audio, ni decodificación especulativa documentada.
- Inferencia en hardware Intel: diseñado explícitamente para CPU Intel, iGPU Arc y NPU Core Ultra.

## Casos de uso

- Generación y autocompletado de texto en inglés: al ser un modelo de completado, encaja en tareas de continuación de texto, redacción asistida no interactiva o generación de borradores donde no se necesita seguir instrucciones complejas.
- Despliegue en equipos sin GPU dedicada: la cuantización INT4 y las optimizaciones para CPU Intel (IPEX) y OpenVINO permiten ejecutar un modelo de 7B en portátiles y estaciones de trabajo con CPU Xeon o Core Ultra, sin depender de una tarjeta gráfica.
- Inferencia en iGPU Intel Arc o NPU Core Ultra: útil en escenarios de borde (*edge*) y en equipos compactos donde se busca aceleración integrada y bajo consumo, con el modelo cargado en memoria compartida.
- Prototipado de pipelines de cuantización: sirve como artefacto de referencia para reproducir el proceso de AutoRound, ya que la model card documenta el comando exacto y las condiciones de la ejecución.
- Evaluación comparativa de esquemas de cuantización: permite medir la pérdida de precisión de un esquema INT4 gs64 asimétrico frente a bf16 o frente a otras configuraciones (gptq, awq, gs128), siempre con evaluación propia porque no se publican métricas.
- Investigación en eficiencia de memoria: útil para estudios sobre compromiso entre tamaño en disco (4,8 GB), consumo de VRAM y calidad de salida en modelos de 7B.
- Servicios de texto con presupuesto de VRAM ajustado: escenarios donde no se dispone de GPU de gran capacidad y se acepta una caída de precisión a cambio de reducir el consumo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta dos afirmaciones cualitativas, sin cifras asociadas:

- Caída de precisión descrita como "slight accuracy drop at W4G64".
- Aceleración declarada de "2-3X speedup" frente al modelo sin cuantizar.

No hay valores de MMLU, HumanEval, GSM8K ni de ninguna otra métrica, ni comparaciones numéricas con alternativas. Cualquier cifra de rendimiento debe obtenerse mediante evaluación propia.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados ocupan aproximadamente 4,8 GB. Con el *overhead* de activaciones y caché KV, conviene reservar unos 5-6 GB para contextos moderados.
- Caché KV: no está incluida en esa cifra y crece de forma lineal con la longitud de contexto; en secuencias largas (decenas de miles de tokens) puede llegar a sumar varios gigabytes adicionales.
- GPU recomendadas: cualquier GPU con 8 GB o más de memoria es suficiente. No se requiere A100 ni H100. Ejemplos: RTX 3060 8 GB, RTX 4060, RTX 4070, RTX 3080, así como GPUs de centro de datos de gama baja o media.
- ¿Cabe en GPU de consumo? Sí. Es uno de los principales atractivos de esta cuantización: entra en GPUs de consumo de 8 GB o más, aunque el autor lo haya optimizado para hardware Intel.
- Opciones de despliegue: transformers; intel-extension-for-pytorch (CPU Intel); OpenVINO (iGPU Arc y NPU Core Ultra); soporte de auto-round en vLLM y en TGI (la model card incluye la etiqueta text-generation-inference). Para llama.cpp u Ollama habría que convertir los pesos a GGUF, algo que no se proporciona en el repositorio.
- Latencia y throughput: no hay cifras absolutas. La única referencia es la afirmación del autor de 2-3 veces de aceleración frente a la versión sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Este checkpoint (Mistral-7B-v0.3 AutoRound INT4) | Base ~7,25B | 32.768 | INT4, gs 64, asimétrica | Apache 2.0 | safetensors (auto_round) |
| mistralai/Mistral-7B-v0.3 | ~7,25B | 32.768 | Ninguna (bf16) | Apache 2.0 | safetensors |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7,25B | 32.768 | Ninguna (bf16) | Apache 2.0 | safetensors |
| Alternativas GPTQ o AWQ INT4 de la familia Mistral-7B | ~7,25B | 32.768 | INT4, habitualmente gs 128 | Apache 2.0 (según el modelo base) | safetensors (GPTQ/AWQ) |

Diferencias clave: frente al modelo base en bf16, esta versión reduce el peso en disco de aproximadamente 14,5 GB a 4,8 GB y habilita inferencia en hardware modesto, a cambio de una pérdida de precisión no cuantificada. Frente a Mistral-7B-Instruct-v0.3, carece de ajuste por instrucciones, por lo que no es adecuado para diálogo directo. Frente a cuantizaciones GPTQ o AWQ, se diferencia por usar Intel AutoRound y por estar optimizado para CPU, iGPU y NPU Intel en lugar de para GPU NVIDIA.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no sigue órdenes ni mantiene conversaciones de forma fiable sin *prompting* adicional.
- Idiomas: solo se declara inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación: inherente a un modelo de completado sin alineación; no se ha aplicado RLHF ni DPO.
- Pérdida de precisión por cuantización: el autor reconoce explícitamente una caída de precisión con W4G64, pero no aporta mediciones que permitan acotarla.
- Sesgos: no hay ninguna documentación sobre sesgos ni sobre los datos de entrenamiento del modelo base en esta ficha.
- Adopción nula: 0 descargas y 0 "me gusta" en el momento del análisis, sin validación por parte de la comunidad.
- Licencia: Apache 2.0, permisiva para uso comercial, pero el autor declara que el modelo se ha desarrollado solo con fines de investigación y se entrega sin garantía alguna.
- Portabilidad: está optimizado para el ecosistema Intel (IPEX, OpenVINO) y el formato auto_round; no se ofrecen pesos GGUF para llama.cpp u Ollama.
- Producción: al no existir benchmarks ni validación externa, cualquier despliegue debería ir precedido de una evaluación de calidad y de latencia sobre el caso de uso concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/mistralai_Mistral-7B-v0.3-auto_round-int4-gs64-asym
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Pipeline de cuantización auto-round-pipeline: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Artículo o paper asociado: no disponible en la información proporcionada.
