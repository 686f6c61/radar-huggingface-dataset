# Motif-Technologies/Motif-3-Base

## Resumen

Motif 3 Base es el checkpoint base preentrenado de Motif 3, un modelo de lenguaje decoder-only con arquitectura de mezcla de expertos (MoE) desarrollado íntegramente por Motif Technologies. Cuenta con 314.841.775.750 parámetros totales (aproximadamente 314B) y activa unos 13.2B parámetros por token, lo que permite un cómputo por token moderado pese al tamano del pool de expertos. Se distribuye bajo licencia MIT y esta pensado como punto de partida para ajuste fino, preentrenamiento continuado, RL, destilacion e investigacion sobre representaciones.

La arquitectura introduce varias innovaciones propietarias: Grouped Differential Latent Attention (GDLA), que combina atencion diferencial agrupada con la representacion comprimida de clave-valor de Multi-head Latent Attention; manifold-constrained hyper-connections modificadas (mHC); activaciones Expert-Specific PolyNorm; y un objetivo auxiliar de Multi-Token Prediction (MTP). El modelo soporta una ventana de contexto nativa de 262.144 tokens (256K) y fue preentrenado con aproximadamente 12.5 billones de tokens.

Es relevante ahora porque se publica como base limpia, sin SFT ni alineamiento de seguridad, lo que lo hace util para equipos que necesitan un modelo fundacional grande y de licencia permisiva sobre el que construir sus propios pipelines de post-entrenamiento. No obstante, no es un asistente: no incluye plantilla de chat ni sigue instrucciones de serie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), decoder-only, con GDLA, mHC y Expert-Specific PolyNorm |
| Parametros totales | 314.841.775.750 (~314B) |
| Parametros activos | ~13.2B por token |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles y coreano (segun model card); tokenizer orientado tambien a codigo y matematicas |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16); repo de 629.7 GB |

## Arquitectura y entrenamiento

Motif 3 Base es un transformer decoder-only con 53 capas (2 densas iniciales y 51 MoE), dimension oculta de 4096, FFN densa de 12.288 en las dos primeras capas, 80 cabezas de query y 16 cabezas KV, y un vocabulario de 220.160 tokens. El bloque MoE contiene 384 expertos enrutados con top-8 activos por token mas 1 experto compartido. La atencion es GDLA con salida con compuerta, y el residual usa hyper-conexiones con restriccion de variedad (mHC) modificadas. La activacion es PolyNorm especifica por experto.

El preentrenamiento cubre aproximadamente 12.5 billones de tokens de documentos web, STEM, codigo, matematicas, contenido multilingue y corpus especializados, con enfasis adicional en coreano, datos legales y financieros y tareas de razonamiento. Se empleo un objetivo auxiliar de Multi-Token Prediction (MTP) para mejorar la estabilidad de optimizacion y la especializacion de expertos, y el entrenamiento de contexto largo uso context parallelism con ventanas. No se aplico SFT, RL ni alineamiento de preferencias en este checkpoint.

## Capacidades

- Generacion de texto en modo completado (no instruccional).
- Razonamiento y modelado de lenguaje general tras 12.5T tokens de preentrenamiento.
- Generacion de codigo y matemáticas, con tokenizer optimizado para estos dominios.
- Capacidades multilingues centradas en ingles y coreano.
- Contexto largo nativo de 256K tokens para tareas de recuperacion y resumen sobre documentos extensos.
- Base para tool calling y agentes solo tras ajuste fino; el checkpoint no incluye comportamiento agentico de serie.
- No incluye vision, audio ni modo thinking: es un modelo puramente de texto.

## Casos de uso

- Ajuste fino supervisado (SFT): usar el checkpoint como inicializacion para crear un asistente conversacional propio con datos de dominio, anadiendo plantilla de chat y dataset de instrucciones.
- Preentrenamiento continuado en dominios especializados: continuar el entrenamiento con corpus legales, financieros o cientificos para adaptar el modelo antes de un SFT posterior.
- Investigacion sobre arquitecturas MoE: estudiar el comportamiento de GDLA, mHC y PolyNorm comparando con variantes estandar de atencion y activacion.
- Generacion de codigo tras post-entrenamiento: partir de la base para construir un modelo de autocompletado o generacion en IDE, aprovechando el vocabulario y el enfasis en codigo del preentrenamiento.
- Procesamiento de documentos largos: aprovechar los 256K tokens de contexto para resumen, extraccion o recuperacion sobre contratos, informes o expedientes extensos una vez ajustado.
- Modelo profesor para destilacion: generar datos sinteticos o etiquetas de alta calidad con el modelo base para entrenar modelos mas pequenos en dominios concretos.
- Experimentacion en RLHF/DPO: usar el checkpoint como politica inicial en pipelines de alineamiento e investigar tecnicas de preferencia sobre un modelo de 314B con 13.2B activos.

## Benchmarks y rendimiento

La model card menciona una seccion de resultados de evaluacion con benchmarks de opcion multiple, matematicas, HumanEval y MBPP, pero la informacion proporcionada se corta antes de mostrar la tabla completa. No se dispone de las cifras concretas en el material disponible.

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 630 GB solo para pesos, mas cache KV y activaciones; requiere multiples GPU de 80 GB (por ejemplo, 8x H100 80GB o 8x A100 80GB) como minimo practico.
- Cuantizacion: no se especifican formatos oficiales; una cuantizacion a 4 bits reduciria los pesos a unos 160 GB, aun fuera del alcance de una sola GPU consumer.
- GPU consumer: no cabe en RTX 4090 (24 GB) ni en configuraciones de una sola GPU consumer, incluso con cuantizacion agresiva.
- Despliegue: se espera soporte en vLLM y TGI para servir el modelo en multi-GPU; llama.cpp/Ollama no son viables a este tamano sin cuantizaciones extremas no publicadas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Motif 3 Base | ~314B | ~13.2B | 256K | MIT | Base sin alinear, GDLA y mHC |
| DeepSeek-V3 (referencia) | ~671B | ~37B | 128K | MIT-like | MoE con MLA; mas parametros y activos |
| Qwen2.5-72B (referencia) | 72B | 72B | 128K | Apache 2.0 | Denso, sin MoE |
| Llama 3.1 405B (referencia) | 405B | 405B | 128K | Llama license | Denso, licencia restrictiva |

Las cifras de los modelos comparables son de referencia general y no proceden de la informacion proporcionada; la model card de Motif omite deliberadamente comparaciones entre modelos.

## Limitaciones y advertencias

- No es un asistente: no sigue instrucciones, no mantiene conversaciones y no rechaza peticiones inseguras sin ajuste previo.
- Sin alineamiento de seguridad: puede producir contenido sesgado, incorrecto o danino.
- Riesgo alto de alucinacion en modo completado, especialmente en dominios especializados.
- Idiomas: el soporte declarado se limita a ingles y coreano; el rendimiento en castellano no esta garantizado.
- Licencia MIT: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el ajuste, la evaluacion y las mitigaciones de seguridad.
- Requisitos de hardware muy elevados: el despliegue en bfloat16 exige un cluster multi-GPU.
- No se dispone de informacion sobre cuantizaciones oficiales ni sobre rendimiento medido en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Motif-Technologies/Motif-3-Base
- Modelo instruccional: https://huggingface.co/Motif-Technologies/Motif-3
- Web oficial: https://motiftech.io
- Organizacion en Hugging Face: https://huggingface.co/Motif-Technologies
- Tech report (arXiv): https://arxiv.org/abs/2608.09119
- Licencia: https://huggingface.co/Motif-Technologies/Motif-3-Base/blob/main/LICENSE.md
