# analist/GPT-2-style-tinyshakespeare-chinchilla-causal-2026-11-12

## Resumen

GPT-2-style-tinyshakespeare-chinchilla-causal-2026-11-12 es un modelo de lenguaje de pequeno tamano (29,18 millones de parametros segun los pesos en safetensors; 25,9 M segun la model card) desarrollado por el usuario `analist` y publicado en Hugging Face. Se trata de un transformer causal de estilo GPT-2 entrenado desde cero sobre el corpus TinyShakespeare de Andrej Karpathy, con atencion softmax estandar escrita a mano (sin FlashAttention) y un presupuesto de entrenamiento tipo Chinchilla de 20 tokens por parametro.

El modelo forma parte de un experimento comparativo entre dos mecanismos de atencion (`causal` y `page gauss`) entrenados bajo condiciones identicas: mismos datos, tokenizer, arquitectura, hiperparametros, semilla, pesos iniciales y lotes. Su relevancia no reside en capacidades de produccion, sino en su valor como banco de pruebas reproducible y de bajo coste para estudiar variantes de atencion y dinamicas de entrenamiento a escala reducida.

La arquitectura emplea 7 capas y 7 cabezas de atencion (dimension de cabeza 64), `d_model` de 448, `d_ff` de 896 con MLP de cuatro proyecciones y activacion GELU, normalizacion RMSNorm en configuracion pre-norm, posiciones sinusoidales y una ventana de contexto de solo 256 tokens. El tokenizer es un BPE a nivel de byte con vocabulario de 600 tokens entrenado sobre el propio corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only estilo GPT-2, atencion softmax estandar escrita a mano (sin FlashAttention) |
| Parametros totales | 29.184.064 (safetensors); 25,9 M segun model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16/float32) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) + `modeling.py` en PyTorch plano + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atencion causal softmax clasica, formula softmax(QKᵀ/√d)·V, implementada manualmente en `modeling.py` con PyTorch puro (no depende de `transformers`). Consta de 7 capas y 7 cabezas con dimension de cabeza 64, `d_model` de 448 y un MLP con expansion `d_model → d_ff → d_ff·2 → d_model` (448 → 896 → 1792 → 448) y activacion GELU. Usa RMSNorm en configuracion pre-norm, embeddings posicionales sinusoidales y una ventana de contexto de 256 tokens. El tokenizer es un BPE a nivel de byte con vocabulario de 600 tokens entrenado sobre TinyShakespeare, con el token `<|endoftext|>` como separador entre bloques.

El entrenamiento sigue un presupuesto Chinchilla de 20 tokens por parametro: 31.566 pasos de 64 secuencias de 256 tokens, lo que suma 517 millones de tokens sobre el split de entrenamiento oficial (90/5/5) de TinyShakespeare. Se uso AdamW (β = 0,9/0,95), learning rate 0,001 con warmup lineal de 1000 pasos y decaimiento coseno hasta 0,0001, weight decay 0,1 sobre matrices, grad clipping 1,0 y autocast en bfloat16. La semilla fue 0 y el entrenamiento se ejecuto en una NVIDIA A100 80GB PCIe con PyTorch 2.8.0+cu128, con un tiempo total de 0,43 horas (49 ms por paso). No se menciona RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva en ingles, limitada al dominio y estilo del corpus TinyShakespeare (dialogo teatral isabelino).
- Modelado de lenguaje causal a nivel de caracter/token con perplexity muy baja sobre el split de validacion de TinyShakespeare (1,53).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues practicamente nulas: solo ingles y con vocabulario de 600 tokens.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- Sirve como referencia reproducible para comparar mecanismos de atencion bajo condiciones controladas.

## Casos de uso

- Investigacion comparativa de mecanismos de atencion: el modelo esta disenado como una de las dos ramas de un experimento controlado (`causal` frente a `page gauss`) con identicos datos, semilla e hiperparametros, lo que permite aislar el efecto de la atencion sobre la perdida de validacion.
- Docencia y divulgacion: por su tamano (25,9 M) y su implementacion en PyTorch plano sin dependencias de `transformers`, es util para explicar paso a paso como se construye y entrena un transformer causal.
- Reproduccion de experimentos Chinchilla a pequena escala: con 517 M tokens y 0,43 h en A100, permite validar recetas de entrenamiento (warmup, cosine, weight decay) a coste minimo.
- Generacion de texto shakespeariano: puede producir dialogos con el estilo del corpus TinyShakespeare, util como demo o juguete educativo, no para produccion.
- Pruebas de infraestructura y pipelines de entrenamiento: sirve como smoke test de frameworks, tokenizers y scripts de evaluacion antes de escalar a modelos mayores.
- Estudio de tokenizers de vocabulario reducido: con solo 600 tokens BPE a nivel de byte, permite analizar el impacto del tamano de vocabulario en la calidad del modelado de lenguaje.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 0,4249 |
| Perplexity de validacion final | 1,53 |
| Mejor perdida de validacion | 0,3347 (paso 15.000) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las metricas anteriores se calculan sobre 50 lotes aleatorios del split de validacion de TinyShakespeare y no son comparables con benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (29,18 M parametros × 4 bytes ≈ 117 MB de pesos, mas activaciones y cache KV para 256 tokens), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna; el autor entreno en una NVIDIA A100 80GB PCIe, pero el modelo corre sin problema en RTX 3060, RTX 4090 o incluso CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 1-2 GB de VRAM; tambien en CPU.
- Opciones de despliegue: al no depender de `transformers`, la via oficial es cargar `modeling.py` y `model.safetensors` con PyTorch y el tokenizer con la libreria `tokenizers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma explicita; el autor reporta 49 ms por paso de entrenamiento con lote de 64 × 256 en A100, dato no trasladable directamente a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-2-style-tinyshakespeare-chinchilla-causal (este) | 25,9 M / 29,18 M | 256 | Transformer causal, atencion softmax manual, corpus TinyShakespeare | no disponible | Hugging Face |
| GPT-2-style-tinyshakespeare-chinchilla-page-gauss (variante del mismo autor) | no disponible | no disponible | Misma receta con atencion `page gauss` | no disponible | Referenciado en la model card, no verificado |
| GPT-2 small (OpenAI) | 124 M | 1024 | Transformer causal, corpus web | MIT (pesos) | Hugging Face / OpenAI |
| nanoGPT (Karpathy) | configurable (~10-124 M) | configurable | Implementacion de referencia GPT-2 | MIT | GitHub |

Los modelos comparables de la misma categoria (experimentos TinyShakespeare) no estan documentados con suficiente detalle en la informacion disponible; la comparativa con GPT-2 small y nanoGPT se incluye solo como referencia de escala y contexto, no de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente sobre TinyShakespeare, el modelo reproduce el sesgo linguistico, cultural y de genero del teatro isabelino; no se ha realizado ninguna evaluacion de sesgo.
- Riesgo de alucinacion: alto en cualquier uso fuera de dominio; el modelo solo ha visto texto shakespeariano y su vocabulario es de 600 tokens.
- Limitaciones de contexto: ventana de solo 256 tokens, insuficiente para la mayoria de tareas practicas.
- Limitaciones de idioma: solo ingles; no comprende castellano ni otros idiomas.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede asumir uso comercial sin consultar al autor.
- Caveat de produccion: no es un modelo apto para produccion; su proposito es experimental y educativo.
- Discrepancia de parametros: la model card indica 25,9 M mientras que los pesos safetensors suman 29.184.064; conviene verificar antes de reutilizar.
- Implementacion no estandar: requiere cargar `modeling.py` manualmente, lo que complica su integracion en stacks basados en `transformers`.

## Enlaces

- Hugging Face: https://huggingface.co/analist/GPT-2-style-tinyshakespeare-chinchilla-causal-2026-11-12
- Dataset TinyShakespeare: https://huggingface.co/datasets/karpathy/tiny_shakespeare
- Referencia citada: Karpathy, A. (2015), *The Unreasonable Effectiveness of Recurrent Neural Networks* (corpus `char-rnn` TinyShakespeare)
- Referencia de atencion: Vaswani et al. (2017), *Attention Is All You Need*
