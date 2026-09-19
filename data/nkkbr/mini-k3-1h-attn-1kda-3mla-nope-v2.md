# nkkbr/Mini-K3-1H-attn-1kda-3mla-nope-v2

## Resumen

Mini-K3-1H-attn-1kda-3mla-nope-v2 es un checkpoint de preentrenamiento de texto de 993.388.324 parametros logicos (330.164.004 activados por token) publicado por el usuario nkkbr en HuggingFace. Forma parte de una familia de veinte arquitecturas comparadas de forma controlada, denominada Mini-K3-1H v2, que reproduce a escala reducida los operadores del modelo Kimi-K3: atencion lineal KDA (Kimi Delta Attention), Gated MLA, Attention Residuals por bloques, Stable LatentMoE, activaciones SiTU, puertas de salida y Quantile Balancing.

La variante concreta de este repositorio sustituye la proporcion base KDA/MLA por 3 capas KDA y 10 capas Gated MLA, usa decaimiento KDA con 128 grupos contiguos por cabeza, convolucion causal en profundidad de kernel 4 y modo posicional NoPE en MLA. El objetivo del proyecto es aislar el efecto de decisiones arquitectonicas concretas sobre un presupuesto de tokens identico, mediante inicializacion canonica por nombre y forma con semilla base 20260914 que garantiza que los parametros compartidos entre variantes arrancan byte a byte identicos.

Se trata de un checkpoint intermedio de investigacion: se publica tras consumir 1.000.079.360 objetivos de next-token validos (1.526 pasos de optimizador, secuencia de 8.192 tokens) de un plan que alcanza los 16.000.000.000 de tokens. No ha recibido post-entrenamiento alguno (ni SFT, ni RLHF, ni DPO) y el propio autor advierte de que no debe tratarse como un asistente que siga instrucciones. No declara licencia ni idiomas soportados, y no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only hibrido: 3 capas KDA (atencion lineal) + 10 capas Gated MLA, con Stable LatentMoE, Attention Residuals por bloques, SiTU y puertas de salida |
| Parametros totales | 993.388.324 (aproximadamente 993 M) |
| Parametros activos | 330.164.004 (aproximadamente 330 M) por token |
| Longitud de contexto | 8.192 tokens (longitud de secuencia declarada en el entrenamiento; no se declara otro contexto maximo) |
| Tipos de cuantizacion | No disponible: solo se publican pesos en BF16, sin GGUF ni cuantizaciones oficiales |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en BF16 sobre PyTorch; requiere el codigo incluido en el repo (modeling_mini_k3.py, configuration_mini_k3.py) |
| Capas decoder | 13 capas; indices KDA [1, 5, 9], indices Gated MLA [2, 3, 4, 6, 7, 8, 10, 11, 12, 13]; 1 capa densa antes del MoE |
| Configuracion MoE | 64 expertos enrutados / 2 compartidos, top-k = 4, ancho oculto del experto enrutado 512 |
| Ancho oculto y cabezas | 1.024 / 12 cabezas / 128 de ancho por cabeza en KDA |
| Vocabulario | 163.840 tokens (BOS 163.584, EOS de generacion 163.586, PAD 163.839) |
| Tamano del repositorio | 6,0 GB |
| Revision | checkpoint-tokens-001000079360 (tag inmutable de Git) |

## Arquitectura y entrenamiento

La arquitectura combina dos mecanismos de atencion en un mismo decoder: KDA, un mecanismo de atencion lineal con estado recurrente, convolucion causal en profundidad de kernel 4 y decaimiento por cabeza dividido en 128 grupos contiguos, y Gated MLA, una variante de Multi-head Latent Attention con puerta de salida y modo posicional NoPE. El bloque de Attention Residuals opera con tamano 4, y las capas MoE usan Stable LatentMoE con 64 expertos enrutados, 2 compartidos y top-k 4; el router selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoid sin sesgo renormalizadas. La primera capa es densa, antes de la parte MoE. El checkpoint publicado se genero con ancho oculto 1.024, 12 cabezas y 128 de ancho por cabeza en KDA.

El entrenamiento usa Muon por cabeza para las matrices Q/K/V expandidas, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay 0,1, QK-Clip por cabeza, decaimiento coseno y un 1 % de warmup lineal, con Quantile Balancing en linea mediante histograma de 1.000 bins. Los documentos empaquetados estan aislados de forma estricta: MLA usa mascara causal bloqueada por documento y KDA reinicia su estado recurrente y el historial de la convolucion corta Q/K/V en cada frontera de segmento. Los datos de entrenamiento se describen como una mezcla inmutable y de solo anexado, con cuotas de tokens, hashes de schedule y revisiones de origen en los manifiestos JSON del repositorio; el texto de origen no se redistribuye, por lo que no se detalla aqui su composicion. El estado del optimizador se omite deliberadamente. No hay ninguna fase de post-entrenamiento documentada.

## Capacidades

- Generacion de texto autoregresiva y prediccion de siguiente token: es la unica tarea para la que fue entrenado.
- Modelado de lenguaje base: util para completar texto, calcular perplejidad y servir como base de fine-tuning.
- Procesamiento de secuencias de hasta 8.192 tokens con mascara causal bloqueada por documento.
- Razonamiento sobre arquitecturas hibridas de atencion (lineal + latente) como objeto de estudio, no como capacidad emergente.
- Tool calling / function calling: no disponible; no se documenta ningun formato de herramientas ni entrenamiento al respecto.
- Uso como agente o razonamiento multi-paso: no disponible; sin post-entrenamiento no hay comportamiento agentico esperado.
- Capacidades multilingues: no disponible; el vocabulario de 163.840 entradas es amplio, pero no se declara ninguna lista de idiomas.
- Vision, audio, modo "thinking" u otras modalidades: no disponible.

## Casos de uso

- Investigacion en arquitecturas hibridas: el checkpoint forma parte de una comparacion controlada de 20 arquitecturas con inicializacion canonica identica, por lo que sirve para medir el efecto de cambiar la proporcion KDA/MLA, la granularidad de decaimiento, la longitud de convolucion o el modo posicional (NoPE) manteniendo constante el presupuesto de tokens.
- Estudio de atencion lineal frente a atencion latente: al tener capas KDA en los indices 1, 5 y 9 y Gated MLA en el resto, permite instrumentar el coste y el comportamiento por capa de cada mecanismo dentro de un mismo modelo.
- Base para fine-tuning supervisado con LoRA: con 993 M de parametros totales y 330 M activos, un ajuste por adaptadores cabe comodamente en una GPU de consumo; el modelo carece de post-entrenamiento, por lo que el ajuste deberia incluir datos de instrucciones.
- Experimentos de preentrenamiento continuo: el repositorio publica la receta (Muon, AdamW de respaldo, QK-Clip, Quantile Balancing) y los manifiestos de mezcla, lo que facilita reanudar o extender el entrenamiento con una receta documentada.
- Generacion de texto por lotes en local: el tamano reducido (aproximadamente 2 GB de pesos en BF16) permite ejecutar completados masivos en una unica GPU o incluso en CPU para tareas de baja urgencia, sin depender de APIs externas.
- Verificacion de reproducibilidad: la semilla base 20260914 y la inicializacion por nombre y forma permiten comprobar que dos ejecuciones con la misma variante producen parametros iniciales byte a byte identicos.
- Docencia y prototipado de serving: sirve para montar pipelines de inferencia con codigo PyTorch propio (initialize_model.py, smoke_test.py) antes de escalar a modelos mayores, ya que el repositorio incluye el paquete autonomo de modelado y configuracion.
- Auditoria de sesgos sobre modelos base: al no tener alineacion, es un objeto de estudio util para medir la distribucion de salidas sin la capa de RLHF, siempre con la advertencia de que sus salidas pueden ser inseguras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explicitamente que el checkpoint no ha sido evaluado en tareas downstream y que solo existen metricas de NLL y perplejidad sobre un conjunto de desarrollo fijo durante el entrenamiento, registradas en W&B y en los ficheros JSONL de la ejecucion, no reproducidas en el repositorio ni en esta ficha. Los diagnosticos de arquitectura y evaluaciones posteriores estan planificados en el repositorio del experimento.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 2 GB solo para pesos (993 M de parametros x 2 bytes), mas activaciones y cache de atencion; en la practica conviene reservar 3-4 GB para secuencias cortas y algo mas a 8.192 tokens.
- VRAM en FP8/INT8: aproximadamente 1 GB de pesos, aunque no se publican cuantizaciones oficiales ni se documenta soporte para ellas.
- Cuantizacion de 4 bits: aproximadamente 0,6 GB de pesos en el calculo teorico; no disponible en el repositorio (no hay GGUF ni recetas de cuantizacion).
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) es suficiente para inferencia en BF16; A100 o H100 solo tienen sentido para entrenamiento o para servir muchas replicas en paralelo.
- GPU de consumo: si, cabe sin problemas; en tarjetas de 6 GB puede ser necesario ejecutar en FP16 con cuidado o reducir la longitud de secuencia.
- Fine-tuning: el ajuste completo requiere estados de AdamW en FP32 (dos momentos por parametro), lo que eleva el consumo a decenas de GB a 8.192 tokens de secuencia; con LoRA o QLoRA el coste se reduce a unos pocos GB y cabe en GPU de consumo.
- Opciones de despliegue: no se declara compatibilidad con vLLM, TGI, llama.cpp, Ollama u otros servidores estandar. La via documentada es PyTorch con el paquete autonomo incluido (modeling_mini_k3.py, configuration_mini_k3.py, initialize_model.py, smoke_test.py).
- Latencia y throughput: no disponible. Como referencia derivada, el modelo activa unos 330 M de parametros por token frente a 993 M totales, de modo que el coste aritmetico por token es aproximadamente un tercio del de un modelo denso equivalente, siempre que la implementacion aproveche el enrutado disperso; no hay mediciones publicadas.

## Comparativa con modelos similares

No existe en la informacion proporcionada ningun modelo comparable directamente: los pesos del proyecto son una ablaracion de investigacion sin licencia declarada, sin post-entrenamiento y sin benchmarks publicados. La tabla siguiente compara el modelo con alternativas densas de tamano similar usando datos de referencia generales, que no proceden de la model card ni de la busqueda web y deberian verificarse antes de citarse.

| Modelo | Parametros | Contexto | Post-entrenamiento | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| Mini-K3-1H-attn-1kda-3mla-nope-v2 | 993 M totales / 330 M activos (MoE) | 8.192 tokens | No | No disponible | No disponible |
| Llama-3.2-1B | 1.240 M (denso) | 128.000 tokens (referencia general) | Si (instruct) | Llama 3.2 Community License (referencia general) | Si |
| Qwen3-1.7B | 1.700 M (denso) | 32.000 tokens (referencia general) | Si | Apache 2.0 (referencia general) | Si |
| SmolLM2-1.7B | 1.710 M (denso) | 8.192 tokens (referencia general) | Si (instruct) | Apache 2.0 (referencia general) | Si |

Las diferencias relevantes para produccion no son de tamano sino de estado: las alternativas estan alineadas para seguir instrucciones y declaran licencia, mientras que este checkpoint es una base cruda de investigacion con licencia sin especificar.

## Limitaciones y advertencias

- Es un checkpoint intermedio de preentrenamiento: los 1.000.079.360 tokens consumidos representan aproximadamente el 6 % del plan de 16.000.000.000 de tokens, por lo que su calidad de lenguaje es necesariamente limitada.
- No ha recibido post-entrenamiento (ni SFT, ni RLHF, ni DPO); no debe usarse como asistente conversacional ni como sustituto de un modelo instruct.
- Sin licencia declarada: no hay permisos explicitos de uso comercial, redistribucion o modificacion; conviene contactar con el autor antes de cualquier uso en produccion.
- Riesgo de alucinacion, repeticion, sesgo y contenido inseguro: la propia model card lo advierte de forma explicita.
- No se declaran idiomas soportados; el comportamiento multilingue es desconocido pese a un vocabulario de 163.840 entradas.
- El contexto de 8.192 tokens corresponde a la longitud de entrenamiento; no se documenta extension por RoPE ni interpolacion, y MLA usa NoPE, por lo que extrapolar mas alla de esa longitud no esta justificado.
- Las conclusiones arquitectonicas a esta escala (aproximadamente 1.000 M de parametros) y a 8.192 tokens de longitud de entrenamiento no son extrapolables sin confirmacion al Kimi-K3 completo, segun el propio autor.
- La numeracion de capas de la model card no es del todo consistente con el recuento declarado de 13 capas decoder, ya que los indices de atencion listados cubren del 1 al 13 y se anade una capa densa previa al MoE; conviene revisar config.json antes de reutilizar la arquitectura.
- El repositorio ocupa 6,0 GB pese a tener 993 M de parametros en BF16 (unos 2 GB), lo que sugiere que incluye material adicional de entrenamiento o checkpoints; el estado del optimizador no se publica.
- No hay integracion declarada con vLLM, TGI, llama.cpp u Ollama, por lo que el despliegue exige mantener el codigo de modelado incluido en el repositorio y verificar su compatibilidad con futuras versiones de PyTorch.
- Cero descargas y cero valoraciones: no existe validacion independiente del checkpoint ni de su receta.

## Enlaces

- HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-attn-1kda-3mla-nope-v2
- Ficheros relevantes dentro del repositorio (sin URL propia): config.json, modeling_mini_k3.py, configuration_mini_k3.py, initialize_model.py, smoke_test.py, ARCHITECTURE_PACKAGE_README.md, ARCHITECTURE.md, VARIANT.md y los manifiestos JSON con revisiones de origen, cuotas de tokens, hashes de schedule y hashes del split de validacion.
- La busqueda web realizada no devolvio ningun enlace relevante al modelo: todos los resultados correspondian a calendarios y resultados de cricket (ESPNcricinfo, NDTV Sports, Cricbuzz, ESPN), por lo que no se incluyen.
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
