# reaperdoesntknow/MoA-400M

## Resumen

MoA-400M (denominado internamente MoA-Metric-LM-400M Convergent) es un modelo de lenguaje causal compacto de aproximadamente 400 millones de parametros desarrollado por el usuario reaperdoesntknow y publicado en Hugging Face. Su rasgo diferencial no es el tamano sino la arquitectura: sustituye la atencion por producto escalar convencional por una atencion nativa de metricas (L2, coseno y Mahalanobis diagonal) y anade un bloque Mixture-of-Architectures (MoA) que enruta cada token entre cuatro cabezas especializadas (convolucion local, atencion multi-cabeza por metrica, mezcla de canales y atencion multi-query por metrica). Incorpora ademas BlackHoleRoPE, una variante aprendible y numericamente estable de RoPE.

El modelo esta disenado explicitamente para entrenar y ejecutarse en hardware modesto, con enfasis en CPU (AVX2/AVX-512 en FP32), y es totalmente compatible con la libreria Transformers de Hugging Face. Su contexto de entrenamiento se situa en 512-1024 tokens, con configuracion que permite hasta 2048. Se orienta a investigacion sobre sesgos inductivos geometricos, asistentes compactos, lectura de contexto largo y razonamiento matematico paso a paso.

La relevancia actual del modelo es fundamentalmente investigadora: explora si las metricas de distancia pueden sustituir al producto escalar en la atencion, una linea poco explorada frente a las arquitecturas transformer dominantes. La model card declara licencia Apache-2.0, aunque el campo de licencia del repositorio en Hugging Face aparece como no disponible, lo que constituye una discrepancia a verificar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion nativa de metricas (L2/coseno/Mahalanobis diagonal) y bloque Mixture-of-Architectures (MoA) con enrutado por token |
| Parametros totales | ~400 M (el recuento exacto depende del vocabulario; ver config.json) |
| Parametros activos | No aplica (no es MoE denso en el sentido clasico; el MoA enruta entre cabezas, no entre expertos FFN) |
| Longitud de contexto | Entrenado principalmente a 512-1024 tokens; configuracion permite hasta 2048 |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales; inferencia soportada en FP32, BF16 y FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 segun la model card; el campo de licencia del repositorio figura como no disponible |
| Formato de pesos | Pesos PyTorch para Transformers (safetensors/bin segun repositorio); no se documenta GGUF |
| Capas | 12-24 segun variante (bloques MoA) |
| Tamano oculto | >= 1024 en la variante de 400 M |
| Precision de entrenamiento | FP32 (orientado a CPU) |
| Tamano del repositorio | 3.4 GB |

## Arquitectura y entrenamiento

La arquitectura se aparta del transformer estandar en tres frentes. Primero, la atencion multi-cabeza puntua con distancias en lugar de productos escalares: L2 (-||q-k||²/sqrt(d)), coseno normalizado y Mahalanobis diagonal por cabeza, con logits escalados por un alfa aprendible y una mascara opcional de poda por radio para eficiencia. Segundo, el bloque MoA aplica un router por token que mezcla suavemente cuatro cabezas: LocalConv (convolucion depthwise local al token), MetricMHAttention, ChannelMix (MLP) y MetricMQA (multi-query con K/V compartidos y broadcast). Tercero, la FFN es una HyperFFN que combina SwiGLU, SepConv1d y una ruta de bajo rango, tambien mezclada por el router.

La codificacion posicional BlackHoleRoPE aplica rotacion de modulo unitario solo a Q y K (preservando normas y evitando desbordamientos en los valores), mientras que V recibe una amplificacion de energia acotada (energy_min..energy_max) con modulacion opcional por una senal de discrepancia. Los parametros de RoPE se sintetizan a partir de una base de Fourier pequena, lo que reduce el tamano de cache y favorece la generalizacion en longitud. Se anade un regularizador de desigualdad triangular (TI) que penaliza violaciones de la metrica sobre tripletas aleatorias para evitar geometrias degeneradas.

El entrenamiento se realizo en CPU en FP32 con AdamW/Adam (beta1=0.9, beta2 entre 0.95 y 0.999), batch de 2-4 y secuencias de 512-1024, con presupuestos de tokens modestos (cientos de miles). Los datasets citados son Agentic-Long-Context-Understanding-QA (preguntas de lectura y recuperacion de largo alcance, ~256.000 tokens) y MATH-500 (prompts matematicos para razonamiento paso a paso, ~256.000 tokens). No se documenta RLHF ni DPO.

## Capacidades

- Generacion de texto causal y conversacional en formato instruccion simple (pregunta/respuesta).
- Razonamiento matematico de estilo paso a paso, entrenado sobre MATH-500.
- Lectura y QA sobre contexto largo dentro de la ventana de 512-1024 tokens (hasta 2048 en configuracion).
- Capacidad de extrapolacion en longitud gracias a BlackHoleRoPE, sujeta a la calidad de los datos y al hardware.
- Ejecucion en CPU en FP32 con buen rendimiento en maquinas AVX2/AVX-512.
- Compatibilidad con la API estandar de Transformers (AutoModelForCausalLM, pipeline de text-generation).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking explicito.
- Capacidades multilingues no documentadas.

## Casos de uso

- Investigacion sobre atencion basada en metricas: el modelo sirve como banco de pruebas reproducible para comparar L2, coseno y Mahalanobis frente a producto escalar en tareas controladas, gracias a su implementacion en Transformers y su bajo coste de entrenamiento en CPU.
- Asistentes compactos en dispositivos sin GPU: al ejecutarse en FP32 sobre CPU con AVX2/AVX-512, puede desplegarse en estaciones de trabajo o servidores sin acelerador para prototipos de chatbot de dominio acotado.
- Razonamiento matematico educativo: con prompts de tipo "Reasoning:", genera pasos intermedios para problemas aritmeticos y algebraicos simples, adecuado para demos de tutoria automatica.
- QA sobre documentos de longitud media: su ventana de 512-1024 tokens permite responder preguntas sobre articulos, informes o fragmentos de codigo de tamano moderado, con posibilidad de extender a 2048.
- Experimentos de destilacion y ablacion: su tamano de 400 M y su arquitectura modular (router, cabezas, BlackHoleRoPE) facilitan estudios de ablacion sobre componentes individuales sin grandes presupuestos de computo.
- Generacion de texto en pipelines de bajo consumo: integrable via pipeline de Transformers en flujos batch de generacion de descripciones, resumenes cortos o completado de texto donde el coste energetico es critico.
- Ensenanza de arquitecturas alternativas: util como material didactico para ilustrar atencion por distancia, regularizadores geometricos y enrutado por token en cursos de deep learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona un descenso saludable de la perdida en longitudes de 512 y 1024 durante entrenamientos en CPU, sin cifras concretas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de ~400 M de parametros, aproximadamente 1,6 GB en FP32, ~0,8 GB en BF16/FP16 y del orden de 0,4-0,5 GB en cuantizaciones de 8 bits (no oficiales).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; tambien A100/H100 para despliegues por lotes, aunque el modelo esta optimizado para CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM, e incluso en iGPU con memoria compartida.
- Opciones de despliegue: Transformers con accelerate (soporte nativo), pipeline de text-generation; vLLM, llama.cpp, Ollama y TGI no estan documentados ni verificados para esta arquitectura personalizada.
- Latencia y throughput: no disponibles de forma oficial; la model card enfatiza buen comportamiento en FP32 sobre AVX2/AVX-512, pero sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoA-400M | ~400 M | 512-1024 (hasta 2048) | Metric attention + MoA | Apache-2.0 (segun model card) | Hugging Face, Transformers |
| SmolLM2-360M | ~360 M | 8192 | Transformer denso | Apache-2.0 | Hugging Face, amplio ecosistema |
| Qwen2.5-0.5B | ~500 M | 32768 | Transformer denso (GQA) | Apache-2.0 | Hugging Face, vLLM, llama.cpp |
| TinyLlama-1.1B | ~1,1 B | 2048 | Transformer denso | Apache-2.0 | Hugging Face, amplio ecosistema |

La comparativa debe interpretarse con cautela: los tres modelos alternativos son transformers densos con ecosistemas maduros, cuantizaciones GGUF oficiales y evaluaciones publicas extensas, mientras que MoA-400M es un modelo de investigacion sin benchmarks publicados, sin cuantizaciones oficiales y con contexto de entrenamiento mas corto. Su interes es arquitectonico, no competitivo en rendimiento bruto.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad ni alineacion; el modelo no ha pasado por RLHF ni DPO documentados.
- Riesgo elevado de alucinacion en QA factual: la propia model card lo desaconseja para QA factual a escala web y para dominios que exijan precision garantizada.
- Contexto de entrenamiento corto (512-1024 tokens): aunque BlackHoleRoPE es extrapolable, la calidad mas alla de esas longitudes no esta garantizada.
- Idiomas soportados no documentados; se desconoce el comportamiento multilingue.
- Discrepancia de licencia: la model card declara Apache-2.0, pero el campo de licencia del repositorio figura como no disponible; conviene verificar antes de uso comercial.
- Sin soporte documentado de tool calling, agentes o modos de razonamiento estructurado, lo que limita su uso en pipelines agenticos.
- No apto para uso critico de seguridad (sanidad, legal, finanzas) segun el propio autor.
- Ecosistema limitado: sin cuantizaciones GGUF oficiales ni integracion verificada en vLLM, llama.cpp u Ollama; el despliegue en produccion requiere validacion propia.
- Inestabilidades potenciales en muestreo: la model card advierte sobre NaN/Inf si las mascaras no son aditivas (0/-inf) o si no se define pad_token_id.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/MoA-400M
- Dataset Agentic-Long-Context-Understanding-QA: https://huggingface.co/datasets/yzhuang/Agentic-Long-Context-Understanding-QA
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset LongForm (tag del repositorio): https://huggingface.co/datasets/akoksal/LongForm
- Libreria Transformers: https://github.com/huggingface/transformers
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
