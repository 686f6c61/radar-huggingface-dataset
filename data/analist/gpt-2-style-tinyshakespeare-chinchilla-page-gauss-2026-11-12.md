# analist/GPT-2-style-tinyshakespeare-chinchilla-page-gauss-2026-11-12

## Resumen

GPT-2-style-tinyshakespeare-chinchilla-page-gauss-2026-11-12 es un modelo de lenguaje de pequeno tamano (29,2 M de parametros reales en safetensors, 25,9 M declarados en la model card) entrenado desde cero por el usuario `analist` sobre el corpus TinyShakespeare de Andrej Karpathy. No es un modelo de proposito general ni un producto comercial: es un experimento controlado de investigacion sobre mecanismos de atencion, concretamente una comparacion entre atencion causal estandar y una variante propia denominada "page gauss".

La innovacion tecnica reside en esa atencion "page gauss": cada clave se sustituye por una media ponderada gaussiana de sus predecesoras, con una anchura `h` aprendida por cabeza, de modo que el modelo puede modular localmente cuanto contexto agregar antes del producto softmax habitual. El entrenamiento sigue un presupuesto Chinchilla estricto (20 tokens por parametro, 517 M tokens en total) sobre una unica A100 80GB, con arquitectura GPT-2 de 7 capas y contexto de solo 256 tokens.

Su relevancia es limitada fuera del ambito de la investigacion en mecanismos de atencion: sirve como referencia reproducible (semilla fija, mismos lotes, mismos pesos iniciales) para estudiar el efecto de variantes de atencion sobre la perdida de validacion, no como modelo de produccion. El vocabulario de 600 tokens y el dominio exclusivamente shakesperiano lo hacen inutil para tareas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2, 7 capas x 7 cabezas (head dim 64), atencion "page gauss" escrita a mano (sin FlashAttention) |
| Parametros totales | 25,9 M declarados; 29.184.113 reales en safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en bf16/fp32; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | en (ingles, dominio shakesperiano) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) + `modeling.py` en PyTorch puro + `tokenizer.json` (tokenizers) |

## Arquitectura y entrenamiento

Transformer decoder-only con pre-norm RMSNorm, activacion GELU en un MLP con expansion `d_model → d_ff → d_ff·2 → d_model` (448 → 896 → 1792 → 448), posiciones sinusoidales y tokenizer byte-level BPE de solo 600 tokens entrenado sobre TinyShakespeare. La atencion es la pieza diferencial: en lugar de la atencion causal estandar, "page gauss" calcula `A = exp(−‖kᵢ − kⱼ‖² / 2h²)` para `j ≤ i`, normaliza las filas, sustituye las claves por `K_page = ÃK` y aplica `softmax(Q·K_pageᵀ/√d)·V`. La anchura `h` se inicializa a 1 y se aprende por cabeza, lo que permite al modelo ajustar el grado de agregacion local del contexto.

El entrenamiento usa el split oficial 90/5/5 de TinyShakespeare, 31.566 pasos de 64 secuencias x 256 tokens (517 M tokens, presupuesto Chinchilla de 20 tokens por parametro), AdamW con β = (0.9, 0.95), learning rate 0.001 con warmup lineal de 1000 pasos y decaimiento coseno hasta 0.0001, weight decay 0.1 en matrices, grad clip 1.0, autocast bfloat16, semilla 0 y una unica NVIDIA A100 80GB PCIe con PyTorch 2.8.0+cu128. El entrenamiento completo tarda 0,60 h (69 ms/paso). La comparacion se hace contra una variante identica con atencion causal, compartiendo datos, tokenizer, hiperparametros, semilla, pesos iniciales y lotes.

## Capacidades

- Generacion de texto autoregresiva en ingles estilo Shakespeare (dialogos, acotaciones, versos) dentro del dominio TinyShakespeare.
- Modelado de lenguaje a nivel de caracter/token con perplejidad de validacion de 1,51 (perdida 0,4124).
- Razonamiento, codigo, matematicas o conocimiento factual: no disponible; el vocabulario de 600 tokens y el corpus no lo permiten.
- Tool calling / function calling: no soportado.
- Soporte de agentes o razonamiento multi-paso: no soportado.
- Capacidades multilingues: no; solo ingles shakesperiano.
- Capacidades especiales: ninguna mas alla de la atencion "page gauss" como objeto de estudio; sin vision, audio ni modo thinking.

## Casos de uso

- Investigacion en mecanismos de atencion: comparar la curva de perdida de validacion de "page gauss" frente a "causal" sobre el mismo presupuesto Chinchilla, usando `history.json` como registro reproducible.
- Reproducibilidad de experimentos: servir como baseline con semilla fija (seed 0), pesos iniciales y lotes identicos para validar nuevos kernels de atencion escritos a mano.
- Docencia sobre entrenamiento de LLM: el modelo entrena en 0,60 h en una A100, lo que permite recorrer el pipeline completo (tokenizer BPE de 600 tokens, pre-norm RMSNorm, posiciones sinusoidales) en una sola sesion.
- Pruebas de kernels y prototipado: validar implementaciones de atencion en PyTorch puro (sin FlashAttention) contra una referencia pequena y verificable antes de portarlas a modelos mayores.
- Generacion de texto creativo de dominio acotado: producir dialogos y escenas estilo Shakespeare a partir de un prompt como `First Citizen:\n`, util para demos o generacion de datos sinteticos de estilo.
- Benchmarking de infraestructura: medir throughput y latencia de pipelines de inferencia (vLLM, llama.cpp, TGI) con un modelo de 29 M parametros y contexto 256 antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 0,4124 |
| Perplejidad de validacion final | 1,51 |
| Mejor perdida de validacion | 0,3654 (paso 10.500) |
| Tokens de entrenamiento | 517 M (31.566 pasos x 64 x 256) |
| Tiempo de entrenamiento | 0,60 h (69 ms/paso) en A100 80GB PCIe |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; el modelo no es evaluable en esas tareas por su vocabulario y dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (29,2 M parametros x 4 bytes ≈ 117 MB de pesos, mas activaciones y cache KV de 256 tokens, trivial). Cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera; el modelo se entreno en una A100 80GB pero no la necesita para inferencia. RTX 4090, RTX 3060 o incluso iGPU son suficientes.
- Cabe en consumer GPU: si, en todas las GPU con al menos 1 GB de memoria; tambien en CPU.
- Opciones de despliegue: el autor solo proporciona `modeling.py` en PyTorch puro con `safetensors` y `tokenizers`; no hay integracion con vLLM, llama.cpp, Ollama o TGI ni pesos GGUF publicados. Requiere cargar el modelo manualmente con `snapshot_download` + `load_file`.
- Latencia y throughput: no disponibles; el modelo card no publica mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GPT-2-style-tinyshakespeare-chinchilla-page-gauss | 25,9 M (29,2 M reales) | 256 | no disponible | Hugging Face, safetensors + PyTorch puro |
| GPT-2-style-tinyshakespeare-chinchilla-causal (variante del mismo autor) | 25,9 M (misma config) | 256 | no disponible | Referenciada en la model card como comparacion, no se confirma publicacion |
| nanoGPT (Karpathy) | ~10-124 M segun config | 256-1024 | MIT (codigo) | GitHub, pesos no oficiales |

No disponible comparacion con modelos de proposito general de tamano similar (p. ej. SmolLM, Qwen2.5-0.5B) porque la diferencia de dominio, tokenizer y licencia los hace no comparables en la practica.

## Limitaciones y advertencias

- Dominio cerrado: entrenado exclusivamente en TinyShakespeare; cualquier prompt fuera de ese corpus producira texto incoherente o repetitivo.
- Vocabulario de 600 tokens: extremadamente limitado, incapaz de representar lenguaje general, codigo o terminologia tecnica.
- Contexto de 256 tokens: insuficiente para conversaciones multi-turno o documentos.
- Riesgo de alucinacion: alto en cualquier uso fuera del dominio; el modelo no tiene conocimiento factual y su perplejidad baja (1,51) refleja sobreajuste al corpus, no calidad general.
- Sesgos: hereda los sesgos del corpus shakesperiano (genero, epoca isabelina, violencia, jerarquias sociales); no se documenta ninguna mitigacion.
- Licencia no disponible: no se puede asumir uso comercial; verificar con el autor antes de cualquier despliegue.
- Sin cuantizaciones ni integracion con frameworks estandar: el despliegue requiere cargar `modeling.py` manualmente, lo que complica produccion.
- Modelo de investigacion sin mantenimiento aparente (0 descargas, 0 likes, creado y actualizado el mismo dia): no hay garantia de soporte ni de correccion de errores.

## Enlaces

- Hugging Face: https://huggingface.co/analist/GPT-2-style-tinyshakespeare-chinchilla-page-gauss-2026-11-12
- Dataset TinyShakespeare: https://huggingface.co/datasets/karpathy/tiny_shakespeare
- Referencia del corpus: Karpathy, A. (2015). *The Unreasonable Effectiveness of Recurrent Neural Networks* (char-rnn TinyShakespeare)
- Repositorio nanoGPT (contexto del corpus, no del modelo): https://github.com/karpathy/nanoGPT
