# RTorney/Inkling-2-Mini-Pi-GGUF

## Resumen

Inkling-2-Mini-Pi-GGUF es un conjunto de cuantizaciones GGUF experimentales del modelo base Inkling-2-Mini, desarrollado por Thinking Machines y publicado bajo licencia Apache 2.0. La cuantización corre a cargo de Ruben Torney (RTorney), que mantiene este repositorio como un "set de investigación personal" orientado a ejecutar un modelo MoE de aproximadamente 26.070 millones de parámetros totales en hardware de gama baja: Raspberry Pi 5 con 16 GB de RAM, móviles Android de 12 GB y equipos ARM en general.

El repositorio no es un lanzamiento oficial ni una familia completa de cuantizaciones: el autor conserva únicamente cinco recetas que considera en la frontera de calidad/tamaño, descartando el resto tras medirlas con divergencia KL frente a la referencia UD-Q8_K_XL. Los ficheros van desde 8,67 GB (Q2) hasta 15,51 GB (Q4), con una variante específica para Raspberry Pi 5 (Pi, 11,39 GB) que prioriza kernels NEON con dot-product en los tensores que se leen en cada token.

La relevancia actual del repositorio radica en dos factores: por un lado, demuestra que un MoE de ~26B puede cuantizarse a tipos mixtos (NVFP4 copiado del origen, IQ4_NL, IQ3_S, IQ2_XXS, Q8_0) manteniendo una calidad medida muy cercana a la referencia Q8 (KLD medio de 0,0066 en Q4 y 0,0352 en la variante Pi); por otro, documenta con transparencia las recetas, el imatrix empleado y los experimentos descartados, lo que lo convierte en material útil para quien quiera reproducir o auditar el proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según tags del repo; detalles de atención no disponibles) |
| Parametros totales | 26.070.390.272 (dato safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la evaluación KL usa contexto 1024) |
| Tipos de cuantizacion | Q2_0, IQ2_XXS, IQ3_S, IQ4_NL, IQ4_XS, NVFP4, Q8_0 (mixtos por tensor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); sin proyector multimodal mmproj |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un MoE de 26.070 millones de parámetros totales según los safetensors publicados. La model card del repositorio cuantizado no detalla la arquitectura interna (número de expertos, dimensión oculta, mecanismo de atención) ni los datos de entrenamiento del modelo original; esa información correspondería a la model card de thinkingmachines/Inkling-2-Mini, que no se incluye en la información disponible. Los tags del repositorio confirman la naturaleza MoE y el pipeline conversacional, y el autor indica explícitamente que el modelo es solo texto, sin proyector de visión.

La innovación técnica de este repositorio está en el proceso de cuantización, no en el modelo. El autor parte del GGUF UD-Q8_K_XL de Unsloth y aplica `llama-quantize --pure --allow-requantize` con una importance matrix completa de 1.082 chunks y 245.760 tokens que cubre los 6.144 expertos. Un detalle relevante: los bloques 0–19 del origen ya almacenan los expertos en NVFP4, por lo que se copian sin recuantizar (añadir error cero frente a Q8), mientras que los bloques 20–23 parten de BF16 y se cuantizan a IQ4_NL. Router, norms y convoluciones se mantienen en F32. La variante Pi elige IQ4_NL para los tensores leídos en cada token (downs y atención) porque ese tipo tiene kernel 4×4 NEON con dot-product en Cortex-A76, mientras que NVFP4, Q2_K y Q3_K no lo tienen y degradan el prefill.

## Capacidades

- Generación de texto y conversación multi-turno (el repositorio está etiquetado como conversacional).
- Razonamiento y código: la evaluación de calidad se realizó sobre un corpus de código y notas técnicas, lo que sugiere uso previsto en ese dominio.
- Ejecución en ARM de gama baja: variantes pensadas para Raspberry Pi 5 (16 GB) y Android (Termux, 12 GB).
- Inferencia con llama.cpp y endpoints compatibles (tag `endpoints_compatible`).
- Solo texto: no incluye proyector multimodal (mmproj), por lo que no hay visión.
- Tool calling, function calling y comportamiento agéntico: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking: no disponible.

## Casos de uso

- Asistente local en Raspberry Pi 5: con la variante Pi (11,39 GB) y 16 GB de RAM, el modelo cabe en un equipo de placa única y permite un asistente conversacional sin conexión, aprovechando los kernels NEON con dot-product para el prefill.
- Inferencia en móvil Android de gama alta: la variante Q2 (8,67 GB) está pensada para un teléfono de 12 GB con Termux y contexto corto, útil para prototipos de asistentes offline o pruebas de campo sin dependencia de la nube.
- Evaluación de cuantizaciones en pipelines de investigación: las recetas documentadas (Q2, Pi, Q3, IQ4, Q4) y la tabla de KLD permiten reproducir el bench con `llama-perplexity --kl-divergence` y comparar recetas propias frente a una referencia medida.
- Generación asistida de código en entornos con recursos limitados: dado que el corpus de evaluación es código y notas técnicas, es razonable usarlo para autocompletado o explicación de fragmentos en un portátil ARM o en un servidor pequeño, siempre con validación humana.
- Despliegue en clústeres de placas ARM: la variante Pi permite distribuir instancias en nodos de 16 GB para tareas de procesamiento de texto por lotes, con la ventaja de que el formato GGUF es compatible con llama.cpp y endpoints estándar.
- Docencia y formación en cuantización: el repositorio incluye las recetas exactas (`recipe-Q4.txt`, `recipe-IQ4.txt`, `recipe-Q3.txt`, `recipe-Pi.txt`), los tipos por tensor y los experimentos descartados, lo que lo hace útil como material de estudio sobre tipos mixtos y matrices de importancia.
- Prototipado de agentes conversacionales en hardware de bajo consumo: para equipos que necesiten un modelo conversacional local sin GPU dedicada, la variante Q3 (13,34 GB) ofrece el mejor equilibrio tamaño/calidad medido dentro de este conjunto.

## Benchmarks y rendimiento

Los únicos datos publicados son de divergencia KL frente a UD-Q8_K_XL, medidos en una RTX 3090 con `llama-perplexity --kl-divergence`, contexto 1024, 100 chunks y 51.200 tokens puntuados. La perplejidad de referencia Q8 sobre ese texto es 3,014. No hay resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

| Quant | Tamano | KLD media | KLD mediana | KLD p99 | Mismo top-1 | PPL | Δ PPL |
|---|---|---|---|---|---|---|---|
| Q4 | 15,51 GB | 0,0066 ± 0,0001 | 0,00054 | 0,075 | 97,4% | 3,019 | +0,005 |
| IQ4 | 15,00 GB | 0,0096 ± 0,0002 | 0,00085 | 0,106 | 96,7% | 3,020 | +0,006 |
| Q3 | 13,34 GB | 0,0166 ± 0,0002 | 0,0015 | 0,179 | 95,6% | 3,043 | +0,029 |
| Pi | 11,39 GB | 0,0352 ± 0,0004 | 0,0035 | 0,348 | 93,7% | 3,078 | +0,064 |
| Q2 | 8,67 GB | 0,0691 ± 0,0007 | 0,0084 | 0,653 | 91,3% | 3,151 | +0,137 |
| UD-Q2_K_XL (Unsloth, mismo bench) | 9,14 GB | 0,0439 | 0,0049 | 0,425 | 93,0% | 3,100 | +0,086 |

## Requisitos de hardware

- VRAM/RAM estimada: entre 8,67 GB (Q2) y 15,51 GB (Q4) de memoria para los pesos; hay que sumar el espacio del contexto KV, que depende de la longitud configurada y no está cuantificado en la información disponible.
- Raspberry Pi 5 de 16 GB: variante Pi (11,39 GB), diseñada para Cortex-A76 con NEON y dot-product (sin i8mm), donde IQ4_NL dispone de kernel 4×4.
- Móvil Android de 12 GB: variante Q2 (8,67 GB) con Termux y contexto corto.
- GPU de escritorio: la RTX 3090 se usó para el bench con el modelo completo en GPU (`-ngl 99 --no-op-offload`), lo que confirma que las variantes de 15 GB caben en 24 GB de VRAM. GPU recomendadas concretas (A100, H100, RTX 4090): no disponibles en la información proporcionada.
- Despliegue: llama.cpp (herramientas `llama-quantize`, `llama-perplexity`); el tag `endpoints_compatible` sugiere compatibilidad con endpoints estándar. vLLM, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información disponible solo permite comparar con el GGUF de Unsloth del mismo modelo base; no hay datos de otros modelos de tamaño o categoría equivalentes.

| Modelo | Parametros | Contexto | Calidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Pi-GGUF (Q2) | 26,07B totales | no disponible | KLD 0,0691; top-1 91,3% | Apache 2.0 | Hugging Face |
| UD-Q2_K_XL (Unsloth, mismo base) | 26,07B totales | no disponible | KLD 0,0439; top-1 93,0% | Apache 2.0 | Hugging Face |
| Alternativas de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Carácter experimental: el autor lo declara explícitamente como "personal research set, not a release"; los números provienen de una única ejecución de KLD sobre un único corpus y pueden variar si cambian la receta, la imatrix o la build de llama.cpp.
- Solo texto: no se incluye proyector multimodal (mmproj), por lo que no hay capacidades de visión.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre calidad fuera del inglés técnico del corpus de evaluación.
- Contexto no especificado: la evaluación usa 1024 tokens; se desconoce la ventana nativa del modelo base y su comportamiento en contextos largos.
- Riesgo de alucinación y sesgos: no hay documentación específica en la información disponible; al ser un modelo conversacional, aplican los riesgos habituales y requiere validación en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini y del GGUF de Unsloth del que deriva.
- Comparaciones de KLD: el propio autor advierte que este texto es más fácil que el corpus multilingüe de Unsloth y que el bench BF16 de Atomic Chat, por lo que las cifras no deben trasladarse a tablas publicadas en otros repositorios.
- Tipos mixtos: la calidad depende de la receta por tensor; usar una cuantización estándar del mismo tamaño puede dar resultados peores (el autor documenta varios experimentos descartados por estar dominados).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RTorney/Inkling-2-Mini-Pi-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Perfil del autor: https://huggingface.co/RTorney
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
