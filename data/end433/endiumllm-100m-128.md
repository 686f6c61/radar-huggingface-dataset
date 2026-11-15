# end433/EndiumLLM-100M-128

## Resumen

EndiumLLM-100M es un modelo de lenguaje autorregresivo de tipo decoder-only Transformer desarrollado por End433, un proyecto independiente centrado en la construccion de modelos de lenguaje desde cero. Con 100.695.680 parametros, el modelo se ha entrenado integramente desde pesos aleatorios, sin partir de checkpoints preentrenados, sobre el corpus WikiText-103 (raw), lo que lo situa como un ejercicio de investigacion sobre arquitectura y preentrenamiento mas que como una herramienta de produccion.

La relevancia del modelo es fundamentalmente didactica y experimental: demuestra que es posible implementar y entrenar un transformer funcional en hardware de consumo muy limitado, concretamente una NVIDIA GeForce GTX 1050 de 3 GB. Su arquitectura incorpora componentes modernos habituales en modelos mayores, como RMSNorm, RoPE, SwiGLU y weight tying, lo que lo convierte en una referencia util para estudiar como se comportan estas tecnicas a escala reducida.

No obstante, sus caracteristicas lo alejan de cualquier uso practico inmediato: la longitud de contexto es de solo 128 tokens, el vocabulario es de 16.000 entradas, el entrenamiento se limita a unos 122,8 millones de tokens y el modelo es una base LM sin ajuste por instrucciones. La licencia permanece sin decidir y el propio autor lo describe como un proyecto de I+D experimental, no como un sistema conversacional listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) |
| Parametros totales | 100.695.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (entrenado en FP16; no se publican pesos cuantizados) |
| Idiomas soportados | Ingles |
| Licencia | other (licencia sin decidir; el corpus WikiText-103 es CC BY-SA 4.0) |
| Formato de pesos | no disponible (entrenamiento en PyTorch; no se especifica formato publicado) |
| Vocabulario | 16.000 tokens (Byte-Level BPE) |
| Dimension oculta | 640 |
| Capas transformer | 12 |
| Cabezas de atencion | 10 |
| Dimension por cabeza | 64 |
| Dimension FFN | 3.072 |
| Framework | PyTorch |
| Metodo de entrenamiento | Preentrenamiento desde cero |

## Arquitectura y entrenamiento

EndiumLLM-100M es un transformer decoder-only con atencion causal estandar. Emplea RMSNorm para la normalizacion, embeddings posicionales rotatorios (RoPE) en lugar de posiciones aprendidas, redes feed-forward con activacion SwiGLU y weight tying entre los embeddings de entrada y la capa de salida, lo que reduce el recuento de parametros al compartir la matriz de 16.000 x 640. El entrenamiento se realizo con gradient checkpointing y precision mixta FP16.

El preentrenamiento se llevo a cabo sobre WikiText-103 (raw), un corpus de caracter enciclopedico derivado de Wikipedia en ingles, con aproximadamente 122,8 millones de tokens procesados. Se uso el optimizador AdamW con una tasa de aprendizaje de 3e-4, weight decay de 0,1, planificador coseno y un tamano de lote efectivo de 2.048 tokens. Todo el entrenamiento se ejecuto localmente en una NVIDIA GeForce GTX 1050 de 3 GB. No se documenta el uso de RLHF, DPO ni ninguna fase de ajuste fino; el objetivo declarado es la prediccion del siguiente token.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, limitada a secuencias de hasta 128 tokens.
- Modelado del lenguaje sobre texto de estilo enciclopedico, coherente con la distribucion de WikiText-103.
- Prediccion del siguiente token como tarea nativa de preentrenamiento.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni ninguna modalidad adicional.
- Capacidad multilingue practicamente nula: solo se entreno en ingles.
- No esta ajustado por instrucciones, por lo que no mantiene conversaciones ni sigue ordenes de forma fiable.

## Casos de uso

- Investigacion educativa sobre transformers: sirve para estudiar el efecto de RMSNorm, RoPE, SwiGLU y weight tying en un modelo pequeno, comparando configuraciones y curvas de perdida con recursos minimos.
- Reproduccion de pipelines de preentrenamiento: util como referencia para validar un flujo completo (tokenizador BPE, preparacion de dataset, bucle de entrenamiento en FP16) antes de escalar a modelos mayores.
- Experimentos de tokenizacion: con un vocabulario de 16.000 entradas y Byte-Level BPE, permite analizar el impacto del tamano de vocabulario en la perplejidad sobre un corpus fijo como WikiText-103.
- Benchmark de hardware de gama baja: al haberse entrenado en una GTX 1050 de 3 GB, es un caso de estudio para medir throughput y consumo de memoria en GPUs consumer antiguas.
- Pruebas de tecnicas de eficiencia: dado su tamano reducido, es adecuado para prototipar gradient checkpointing, precision mixta o estrategias de acumulacion de gradiente sin coste elevado.
- Generacion de texto experimental sobre dominios enciclopedicos: puede emplearse para explorar la calidad de continuaciones de texto estilo Wikipedia a corto plazo (hasta 128 tokens), siempre con expectativas ajustadas y sin uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion sobre el conjunto de test y la implementacion de generacion de texto figuran como tareas pendientes en la hoja de ruta del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 100,7 M de parametros; en FP16 ocupa aproximadamente 0,2 GB de pesos, y en FP32 alrededor de 0,4 GB, a lo que hay que sumar el estado de inferencia y el buffer de KV cache (muy reducido por el contexto de 128 tokens).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el propio autor entreno en una GTX 1050 de 3 GB.
- Cabe holgadamente en GPU consumer: GTX 1050, GTX 1650, RTX 3050, RTX 4060 y superiores; tambien en iGPU y CPU para inferencia.
- Opciones de despliegue: al ser un modelo PyTorch estandar, puede ejecutarse con PyTorch nativo, Hugging Face Transformers (si se publican los pesos en un formato compatible), o convertirse a GGUF para llama.cpp u Ollama. No se documenta soporte verificado para vLLM o TGI.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EndiumLLM-100M | 100,7 M | 128 tokens | WikiText-103, ~122,8 M tokens, desde cero | other (sin decidir) | Hugging Face, 0 descargas |
| GPT-2 small | 124 M | 1.024 tokens | WebText, ~40 GB de texto | MIT | Ampliamente disponible |
| Pythia-160M | 160 M | 2.048 tokens | The Pile, ~300 B tokens | Apache 2.0 | Ampliamente disponible |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | ~3 T tokens | Apache 2.0 | Ampliamente disponible |

La comparacion debe interpretarse con cautela: tanto GPT-2 small como Pythia-160M y TinyLlama se entrenaron con volumenes de datos ordenes de magnitud superiores y contextos mucho mayores. EndiumLLM-100M es comparable en escala de parametros a GPT-2 small, pero su corpus de entrenamiento (~122,8 M tokens) es una fraccion minima del utilizado por cualquiera de las alternativas, y su contexto de 128 tokens es entre 8 y 16 veces menor.

## Limitaciones y advertencias

- Contexto muy limitado: 128 tokens restringen severamente cualquier tarea que requiera coherencia a medio o largo plazo.
- Modelo base sin ajuste por instrucciones: no sigue ordenes ni mantiene conversaciones; el autor lo declara explicitamente como no conversacional.
- Riesgo elevado de alucinacion y de texto incoherente, dado el escaso volumen de entrenamiento (~122,8 M tokens) y la ausencia de evaluacion publicada.
- Sesgos derivados del corpus: WikiText-103 procede de Wikipedia en ingles, con los sesgos enciclopedicos y de cobertura geografica y cultural de esa fuente.
- Limitacion idiomatica: solo ingles; no hay evidencia de competencia en castellano ni en otros idiomas.
- Licencia sin decidir: no es posible determinar las condiciones de uso comercial; ademas, el corpus subyacente es CC BY-SA 4.0, lo que impone requisitos de atribucion y share-alike sobre obras derivadas.
- Estado de desarrollo incompleto: la hoja de ruta marca como pendientes el preentrenamiento completo, la evaluacion, la generacion de texto y el ajuste por instrucciones.
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin garantias de mantenimiento o soporte.

## Enlaces

- Hugging Face: https://huggingface.co/end433/EndiumLLM-100M-128
- Dataset WikiText-103 (referencia del corpus): https://blog.salesforceairesearch.com/the-wikitext-long-term-dependency-language-modeling-dataset/
- Paper de referencia de RoPE: https://arxiv.org/abs/2104.09864
- Paper de referencia de SwiGLU: https://arxiv.org/abs/2002.05202
- Paper de referencia de RMSNorm: https://arxiv.org/abs/1910.07467
