# reaperdoesntknow/MoA-150M

## Resumen

MoA-150M (publicado por el autor bajo el nombre MoA-Metric-LM-150M Convergent) es un modelo de lenguaje causal compacto de aproximadamente 150 millones de parametros desarrollado por el usuario de Hugging Face reaperdoesntknow. Su propuesta central es sustituir la atencion por producto escalar convencional por una atencion nativa de metrica, en la que las cabezas puntuan mediante distancias L2, coseno o Mahalanobis diagonal en lugar de productos internos. Ademas, incorpora BlackHoleRoPE, una variante aprendible de RoPE basada en una base de Fourier reducida, y un bloque MoA (Mixture-of-Architectures) que enruta cada token entre cuatro cabezas especializadas.

El modelo esta disenado para entrenar y ejecutarse en hardware modesto, con enfasis en CPU (AVX2/AVX-512) y precision FP32, y es compatible con la libreria transformers de Hugging Face. Su ventana de contexto se entreno principalmente a 512-1024 tokens, aunque la configuracion admite hasta 2048. La licencia es Apache-2.0 y el unico idioma declarado es el ingles.

Su relevancia actual es fundamentalmente de investigacion: explora sesgos inductivos geometricos (distancias en lugar de productos internos, regularizador de desigualdad triangular, codificacion posicional unitaria) en un modelo pequeno y reproducible, lo que permite experimentar con arquitecturas alternativas sin grandes presupuestos de computo. No es un modelo orientado a produccion de alta precision factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion nativa de metrica (L2 / coseno / Mahalanobis diagonal), bloque MoA con router por token y BlackHoleRoPE |
| Parametros totales | ~150 M (el conteo exacto depende del vocabulario; ver config.json) |
| Parametros activos | no disponible (no es MoE; el bloque MoA es un router entre cabezas, no una mezcla de expertos con parametros separados) |
| Longitud de contexto | Entrenado principalmente a 512-1024 tokens; la configuracion admite hasta 2048 |
| Tipos de cuantizacion | no se documentan formatos cuantizados oficiales; inferencia soportada en FP32, BF16 y FP16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos compatibles con transformers (safetensors/pytorch; el repo ocupa 2.5 GB); no se menciona GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con 12-24 capas (segun variante), tamano oculto de al menos 1024 en la variante de 400 M y dimension de cabeza divisible por el numero de cabezas. La atencion multi-cabeza puntua con distancias: L2 con escala por raiz de la dimension, coseno normalizado o Mahalanobis diagonal por cabeza, con logits escalados por un alfa aprendible y una mascara opcional de poda por radio. Incluye ademas MetricMQA, una variante multi-query con K y V compartidos y difundidos. El bloque MoA aplica un router por token que mezcla suavemente cuatro cabezas: LocalConv (convolucion depthwise local), MetricMHAttention, ChannelMix (MLP) y MetricMQA. La FFN es HyperFFN, que combina un MLP SwiGLU, una SepConv1d y una ruta de bajo rango, mezcladas por el router.

BlackHoleRoPE rota solo Q y K con modulo unitario (estabilidad numerica), aplica una amplificacion de energia acotada a V con modulacion opcional por una senal de discrepancia, y sintetiza sus parametros desde una base de Fourier pequena, lo que reduce la cache y favorece la generalizacion en longitud. Un regularizador de desigualdad triangular penaliza violaciones de metrica sobre triples aleatorios. El entrenamiento se realizo en CPU en FP32 con AdamW/Adam, batch de 2-4 y secuencias de 512-1024, sobre presupuestos de cientos de miles de tokens: Intelligent-Content-Understanding (~256k tokens), Alpaca-CoT (~128k), MATH-500 (~256k), LongWriter-6k (~128k) y una fase SFT con Deepthink-Reasoning (~128.512 tokens, perdida final 0.3200). No se documenta RLHF ni DPO.

## Capacidades

- Generacion de texto causal en ingles con soporte conversacional.
- Razonamiento matematico de estilo paso a paso (entrenado parcialmente con MATH-500 y datos de razonamiento).
- Escritura de contenido largo (dataset LongWriter-6k) y tareas de comprension de contenido.
- Lectura y QA sobre contexto medio (hasta 1024-2048 tokens), con extrapolacion posicional teorica via BlackHoleRoPE.
- Ejecucion en CPU en FP32, pensada para entornos sin GPU.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso orquestado.
- No se documenta vision, audio ni modo de pensamiento explicito.
- Multilingue limitado: solo ingles declarado.

## Casos de uso

- Investigacion sobre atencion basada en distancias: el modelo sirve como banco de pruebas reproducible para comparar L2, coseno y Mahalanobis diagonal frente a producto escalar en tareas pequenas de lenguaje.
- Experimentos de generalizacion en longitud: BlackHoleRoPE permite probar extrapolacion mas alla de 1024 tokens en un modelo que cabe en CPU.
- Asistentes compactos en dispositivos sin GPU: al ejecutarse en FP32 sobre AVX2/AVX-512, puede desplegarse en portatiles o servidores sin acelerador para tareas de generacion breve.
- Razonamiento matematico elemental: entrenado con MATH-500, es adecuado para prototipos de resolucion de ecuaciones y problemas de varios pasos con contexto corto.
- Generacion de texto largo controlada: el uso de LongWriter-6k permite experimentar con escritura de documentos de extension media dentro de la ventana de contexto.
- Educacion y demostraciones: util para ensenar mecanismos de atencion alternativa y enrutado por token en cursos o talleres, gracias a su tamano reducido y licencia permisiva.
- Evaluacion de regularizadores geometricos: el penalizador de desigualdad triangular permite estudiar su efecto en la coherencia de representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,6 GB en FP32 para 150 M de parametros; unos 0,3 GB en FP16/BF16. El repo ocupa 2.5 GB por incluir artefactos de entrenamiento.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer moderna (RTX 3060 o superior) puede alojarlo con holgura.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM.
- Despliegue: transformers con accelerate; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica entrenamiento e inferencia en CPU con FP32 y AVX2/AVX-512.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MoA-150M | ~150 M | 512-1024 (hasta 2048) | Apache-2.0 | Hugging Face | Atencion por metrica, BlackHoleRoPE, bloque MoA |
| GPT-2 small | 124 M | 1024 | MIT | Hugging Face | Transformer clasico, ampliamente adoptado |
| SmolLM-135M | 135 M | 2048 | Apache-2.0 | Hugging Face | Entrenado con mucho mas volumen de tokens |
| Qwen2.5-0.5B | 494 M | 32 768 | Apache-2.0 | Hugging Face | Mayor capacidad y contexto, requiere mas recursos |

No se dispone de datos de rendimiento comparativo para MoA-150M, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Presupuesto de entrenamiento muy reducido (cientos de miles de tokens), lo que limita el conocimiento factual y la fluidez frente a modelos entrenados con billones de tokens.
- Riesgo elevado de alucinacion en QA factual; el autor lo desaconseja explicitamente para preguntas factuales a escala web.
- Solo ingles; no hay soporte multilingue declarado.
- Ventana de contexto efectiva de 512-1024 tokens; la extrapolacion a 2048 depende de los datos y el hardware.
- No apto para usos de seguridad critica ni dominios que exijan precision garantizada.
- No se documentan evaluaciones de sesgo; se desconoce su comportamiento en este aspecto.
- Licencia Apache-2.0 permite uso comercial, pero la calidad del modelo hace recomendable una evaluacion previa exhaustiva.
- Posibles NaN/Inf en muestreo si las mascaras no son aditivas (0/-inf); el autor recomienda aplicar clamp a los logits.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/MoA-150M
- Dataset WeMake/Intelligent-Content-Understanding: https://huggingface.co/datasets/WeMake/Intelligent-Content-Understanding
- Dataset QingyiSi/Alpaca-CoT: https://huggingface.co/datasets/QingyiSi/Alpaca-CoT
- Dataset HuggingFaceH4/MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset zai-org/LongWriter-6k: https://huggingface.co/datasets/zai-org/LongWriter-6k
- Dataset m-a-p/DeepWriting-20K: https://huggingface.co/datasets/m-a-p/DeepWriting-20K
- Dataset prithivMLmods/Deepthink-Reasoning: https://huggingface.co/datasets/prithivMLmods/Deepthink-Reasoning
