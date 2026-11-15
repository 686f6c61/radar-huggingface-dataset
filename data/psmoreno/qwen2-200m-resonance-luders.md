# PSMoreno/Qwen2-200M-Resonance-Luders

## Resumen

Resonance-Qwen2-200M-Luders es un modelo de lenguaje causal de aproximadamente 201,5 millones de parametros desarrollado por PSMoreno (Luís P. Soares) y publicado bajo licencia Apache 2.0. Se construye sobre la arquitectura Qwen2, pero sustituye la atencion Softmax estandar por una variante propietaria denominada Resonance Attention, basada en un subespacio proyectivo de Lüders de rango 2. El objetivo declarado no es competir en calidad generativa, sino ofrecer una senal de incertidumbre epistemica calculable en un unico forward pass.

La innovacion principal es el calculo de entropia espectral S(ρ) sobre la matriz de densidad de la capa de atencion, lo que permite estimar la incertidumbre del modelo sin necesidad de muestreo multiple ni ensembles. El autor afirma que este enfoque reduce la sobreconfianza tipica de los modelos Softmax y mejora la abstencion selectiva, con un AURC (Area Under the Risk-Coverage curve) de 0,9509 frente a 0,9820 de las lineas base clasicas.

El modelo se entreno sobre una muestra de 10BT del dataset FineWeb-Edu, consumiendo aproximadamente 393,2 millones de tokens. Es un modelo de investigacion, con 0 descargas y 0 likes en el momento de la consulta, orientado a experimentacion con estimacion de incertidumbre y mecanismos de atencion alternativos, no a despliegue en produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal basado en Qwen2 con Resonance Attention (subespacio proyectivo de Lüders de rango 2) en lugar de Softmax |
| Parametros totales | ~201,5 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,6 GB, libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2 (transformer decoder-only con RoPE, SwiGLU y RMSNorm, segun la base Qwen2) y reemplaza el mecanismo de atencion Softmax por Resonance Attention. Esta variante formula la atencion como una proyeccion sobre un subespacio de Lüders de rango 2, lo que produce una matriz de densidad ρ por capa. Sobre esa matriz se calcula la entropia espectral S(ρ), que actua como proxy de incertidumbre epistemica en una sola pasada, sin decodificacion especulativa ni muestreo.

El entrenamiento se realizo sobre una muestra de 10BT del dataset `HuggingFaceFW/fineweb-edu`, con un consumo total de aproximadamente 393,2 millones de tokens. No se especifica en la informacion disponible si hubo fases de RLHF, DPO o ajuste por instrucciones; el modelo se presenta como causal-LM base. No se detalla la composicion exacta del dataset ni la configuracion de entrenamiento (learning rate, batch size, precision).

La innovacion tecnica destacable es la capacidad de obtener una medida de incertidumbre por token o por secuencia en el mismo forward pass, lo que evita el coste de tecnicas como MC Dropout, ensembles o muestreo multiple. El autor sostiene que este diseno evita el colapso por ley de Goodhart que observa en modelos Softmax cuando se regulariza explicitamente la confianza.

## Capacidades

- Generacion de texto causal autoregresiva en el estilo de la familia Qwen2.
- Estimacion de incertidumbre epistemica mediante entropia espectral S(ρ) en un unico forward pass.
- Abstencion selectiva: el modelo puede decidir no responder en funcion del umbral de incertidumbre.
- Acceso programatico a la senal de incertidumbre via `outputs.attentions[-1].last_spectral_entropy`.
- Soporte de `trust_remote_code` para cargar el codigo de atencion personalizado.
- Compatibilidad declarada con text-generation-inference y endpoints.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en estimacion de incertidumbre: permite comparar la entropia espectral de Resonance Attention contra metodos clasicos (MC Dropout, ensembles) en tareas de clasificacion de riesgo, usando el AURC como metrica.
- Sistemas de abstención selectiva: en un pipeline de preguntas y respuestas, el modelo puede rechazar responder cuando S(ρ) supera un umbral, reduciendo respuestas erroneas en dominios fuera de distribucion.
- Deteccion de out-of-distribution: la senal de entropia espectral puede usarse como detector de entradas anomalas en clasificacion de texto o moderacion de contenido.
- Experimentacion academica con mecanismos de atencion alternativos: sirve como banco de pruebas reproducible (200M parametros, Apache 2.0) para estudiar el impacto de la atencion de Lüders frente a Softmax.
- Prototipado de calibracion de confianza: util para desarrollar tecnicas de calibracion y evaluar curvas riesgo-cobertura en modelos pequenos antes de escalar a modelos mayores.
- Educacion y divulgacion: modelo ligero para demostrar en notebooks como se calcula una matriz de densidad y su entropia espectral en un transformer real.
- Fine-tuning experimental: al ser Apache 2.0 y de 200M parametros, puede ajustarse en una unica GPU consumer para tareas de investigacion con senal de incertidumbre.

## Benchmarks y rendimiento

| Metrica | Resonance-Qwen2-200M-Luders | Linea base clasica (Softmax) |
|---|---|---|
| AURC (Area Under the Risk-Coverage) | 0,9509 | 0,9820 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato cuantitativo reportado es el AURC, que mide la calidad de la abstencion selectiva (menor es mejor).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,4 GB para los pesos (201,5M parametros × 2 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en float32: aproximadamente 0,8 GB para los pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4 GB o menos.
- Tambien puede ejecutarse en CPU para inferencia y experimentacion.
- GPU de datacenter (A100, H100) no necesarias; utiles solo para entrenamiento o fine-tuning a gran escala.
- Opciones de despliegue: transformers con `trust_remote_code=True`; el tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se detalla configuracion. No se confirma soporte de llama.cpp, Ollama ni vLLM en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Resonance-Qwen2-200M-Luders | ~201,5M | no disponible | Apache 2.0 | Qwen2 + Resonance Attention con incertidumbre espectral | Hugging Face, 0 descargas |
| Qwen2-0.5B | ~500M | 32.768 tokens (tipico en Qwen2) | Apache 2.0 | Transformer Softmax estandar | Ampliamente disponible |
| SmolLM-135M | ~135M | 2.048 tokens | Apache 2.0 | Transformer Softmax estandar | Ampliamente disponible |
| GPT-2 small | ~124M | 1.024 tokens | MIT | Transformer Softmax estandar | Ampliamente disponible |

La comparativa con Qwen2-0.5B y SmolLM-135M es aproximada: no se dispone de benchmarks comunes en la informacion proporcionada. La diferencia clave frente a estos modelos no es el rendimiento generativo, sino la senal de incertidumbre integrada en la atencion, que ninguno de los alternativos ofrece de forma nativa.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion independiente.
- Tamano de 200M parametros y entrenamiento de solo ~393M tokens: calidad generativa limitada, propenso a errores factuales y coherencia fragil en textos largos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; revisar el codigo antes de usarlo en entornos sensibles.
- La estimacion de incertidumbre depende de la implementacion propietaria de Resonance Attention; su calibracion no ha sido validada por terceros segun la informacion disponible.
- No se documentan sesgos conocidos, pero el entrenamiento sobre FineWeb-Edu puede heredar sesgos de la web filtrada por criterios educativos.
- Riesgo de alucinacion alto por el tamano reducido del modelo y la escasez de datos de entrenamiento.
- Idiomas soportados no especificados; probablemente limitado a ingles por la composicion de FineWeb-Edu.
- Longitud de contexto no documentada; no asumir ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validacion y el tamano reducido desaconsejan su uso en produccion sin evaluacion exhaustiva.
- El AURC reportado (0,9509) es mejor que la linea base (0,9820) en la metrica del autor, pero no se aportan detalles del protocolo de evaluacion ni del dataset usado para medirlo.

## Enlaces

- Hugging Face: https://huggingface.co/PSMoreno/Qwen2-200M-Resonance-Luders
- Paper (Zenodo): https://zenodo.org/records/21906552
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio del autor en Hugging Face: https://huggingface.co/PSMoreno
