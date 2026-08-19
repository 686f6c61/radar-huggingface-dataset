# Motif-Technologies/Motif-3-Base

## Resumen

Motif 3 Base es el checkpoint de preentrenamiento del modelo Motif 3, un gran modelo de lenguaje de tipo Mixture-of-Experts (MoE) con arquitectura decoder-only, desarrollado por Motif Technologies. Con 314 mil millones de parámetros totales y 13,2 mil millones activados por token, está diseñado para ofrecer una gran capacidad de modelado con un coste computacional por token relativamente bajo. Se trata de un modelo base, es decir, no ha pasado por fine-tuning supervisado ni alineamiento, por lo que se publica como punto de partida para investigación y adaptación posterior.

El modelo incorpora una arquitectura novedosa denominada Grouped Differential Latent Attention (GDLA), que combina atención diferencial agrupada con la representación comprimida de clave-valor de Multi-head Latent Attention. Además, utiliza conexiones residuales modificadas (manifold-constrained hyper-connections, mHC), activaciones Expert-Specific PolyNorm y un objetivo auxiliar de predicción multi-token (MTP). Se ha preentrenado con aproximadamente 12,5 billones de tokens, con énfasis en inglés, coreano, código, matemáticas y dominios especializados como legal y finanzas. Su contexto nativo es de 262 144 tokens (256K), lo que lo hace adecuado para tareas que requieren ventanas largas.

La relevancia actual de este modelo radica en su combinación de eficiencia MoE, contexto muy largo y una arquitectura de atención innovadora, además de su licencia MIT que permite uso comercial y modificación. Al ser un modelo base, su valor principal está en servir como cimiento para fine-tuning, continuación de preentrenamiento o investigación sobre representaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts), decoder-only, con GDLA (Grouped Differential Latent Attention) |
| Parametros totales | ~314 mil millones |
| Parametros activos | ~13,2 mil millones por token |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | no disponible (no se menciona en la informacion proporcionada) |
| Idiomas soportados | ingles (en), coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Adicionalmente, la model card proporciona otros detalles técnicos:

| Parametro | Valor |
|---|---|
| Numero de capas | 53 (2 densas + 51 MoE) |
| Dimension oculta | 4096 |
| FFN intermedio (capas densas) | 12 288 |
| Cabezas de atencion (query / KV) | 80 / 16 |
| Expertos enrutados | 384 (top-8) |
| Expertos compartidos | 1 |
| Activacion | Expert-Specific PolyNorm |
| Residual | Modified manifold-constrained hyper-connections (mHC) |
| Tamano de vocabulario | 220 160 |
| Tokens de preentrenamiento | ~12,5 billones |
| Tipo de tensor | bfloat16 |

## Arquitectura y entrenamiento

Motif 3 Base es un modelo MoE con 53 capas, de las cuales las dos primeras son densas y las 51 restantes utilizan enrutamiento de expertos. Cada capa MoE dispone de 384 expertos enrutados, de los cuales se activan 8 por token, más un experto compartido. La atención se implementa mediante GDLA, que integra atención diferencial agrupada con la compresión de clave-valor típica de Multi-head Latent Attention, lo que reduce el coste de memoria y cómputo en contextos largos. Las conexiones residuales usan una variante modificada de hyper-connections con restricciones de manifold, y la activación de los expertos es Expert-Specific PolyNorm, una normalización polinómica específica por experto. El objetivo auxiliar de Multi-Token Prediction (MTP) se emplea durante el preentrenamiento para mejorar la eficiencia y la estabilidad del entrenamiento.

El preentrenamiento se realizó sobre aproximadamente 12,5 billones de tokens, con una composición que incluye documentos web, STEM, código, matemáticas, contenido multilingüe y corpus especializados. Se prestó especial atención a datos en coreano, así como a corpus de razonamiento, legales y financieros. No se aplicó RLHF, DPO ni ningún otro método de alineamiento posterior, ya que se trata de un checkpoint base. El tokenizador está optimizado para bytes por token en inglés, coreano, código y matemáticas.

## Capacidades

- Generacion de texto en modo completado: al ser un modelo base, puede continuar secuencias de texto de forma autónoma, pero no sigue instrucciones ni mantiene conversaciones.
- Razonamiento y matematicas: el entrenamiento incluye datos de razonamiento y matemáticas, por lo que el modelo ha adquirido cierta capacidad en estas áreas, aunque sin fine-tuning no se comporta como un asistente.
- Generacion de codigo: los datos de preentrenamiento incluyen código, lo que permite al modelo completar fragmentos de código o continuar secuencias de programación.
- Capacidad multilingue: entrenado principalmente en ingles y coreano, con soporte adicional para otros idiomas a través de datos multilingües.
- Contexto largo nativo: ventana de 262 144 tokens, entrenada con paralelismo de contexto consciente de ventana, lo que permite procesar documentos extensos.
- No incluye soporte de tool calling, function calling ni capacidades de agente, al ser un modelo base sin post-entrenamiento.
- No dispone de modo de pensamiento (thinking mode) ni capacidades multimodales (vision, audio).

## Casos de uso

- Fine-tuning supervisado para tareas especificas: el modelo puede ajustarse con datasets etiquetados para clasificacion, extraccion de informacion o generacion estructurada. Su gran tamano y arquitectura MoE permiten adaptarse a dominios concretos con un coste de inferencia moderado gracias a los pocos parametros activos.
- Continuacion de preentrenamiento en dominios especializados: sectores como legal o financiero pueden continuar el preentrenamiento con corpus propios, aprovechando el enfasis ya presente en esos datos y la ventana de contexto larga para procesar documentos extensos.
- Investigacion sobre representaciones y mecanismos de atencion: al ser un modelo base con arquitectura novedosa (GDLA, mHC, PolyNorm), es util para estudiar el comportamiento de estas tecnicas a gran escala.
- Distilacion a modelos mas pequenos: el checkpoint puede usarse como modelo profesor para entrenar modelos destilados mas eficientes, dado que su salida contiene conocimiento de un preentrenamiento masivo.
- Desarrollo de modelos instructivos: a partir de este checkpoint, se puede aplicar SFT y RLHF para crear un asistente conversacional, como hace el modelo Motif-3 (la version post-entrenada).
- Adaptacion a otros idiomas: aunque el foco principal es ingles y coreano, el modelo puede fine-tuning en otros idiomas para mejorar su rendimiento en ellos, gracias a su tokenizador multilingue.

## Benchmarks y rendimiento

La model card menciona una seccion de evaluacion con una tabla de resultados, pero el extracto proporcionado se corta justo en la cabecera de la tabla, por lo que no se dispone de los valores numericos. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 314 mil millones de parametros en bfloat16, solo los pesos requieren aproximadamente 628 GB de memoria. Con cuantizacion a 8 bits se reduciria a unos 314 GB, y a 4 bits a unos 157 GB, pero no se han publicado cuantizaciones oficiales para este modelo.
- GPU recomendadas: no es viable en una unica GPU de consumo. Se necesitan multiples GPU de alta gama, como NVIDIA A100 (80 GB) o H100 (80 GB), en configuracion multi-GPU o en cluster. Por ejemplo, con 8x A100 de 80 GB se podria cargar en bfloat16, aunque con limitaciones de memoria para activaciones y contexto largo.
- En consumer GPU: no cabe en ninguna GPU de consumo actual (RTX 4090, 24 GB, seria insuficiente incluso con cuantizacion agresiva).
- Opciones de despliegue: al ser un modelo transformers con pesos en safetensors, se puede servir con vLLM, TensorRT-LLM o TGI, siempre que se disponga de hardware suficiente. Para cuantizacion, se podria usar llama.cpp o GPTQ, pero no hay versiones GGUF publicadas en la informacion disponible.
- Latencia y throughput: no se han proporcionado datos. Dependera del hardware, la cuantizacion y el tamano de la ventana de contexto.

## Comparativa con modelos similares

Se comparan modelos MoE de gran escala con parametros totales y activos similares. Los datos de rendimiento no estan disponibles para Motif 3 Base, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Motif 3 Base | ~314B | ~13.2B | 256K | MIT | HuggingFace |
| Mixtral 8x7B | ~46.7B | ~12.9B | 32K | Apache 2.0 | HuggingFace |
| DeepSeek-V2 | ~236B | ~21B | 128K | MIT | HuggingFace |
| Qwen1.5-MoE-A2.7B | ~14.3B | ~2.7B | 32K | Apache 2.0 | HuggingFace |

Motif 3 Base destaca por su contexto nativo de 256K, muy superior a los 32K de Mixtral o los 128K de DeepSeek-V2, y por su licencia MIT, que permite uso comercial sin restricciones. Su numero de parametros activos (13.2B) es comparable al de Mixtral 8x7B, pero con un pool de expertos mucho mayor (384 frente a 8), lo que podria ofrecer una mayor especializacion. No se dispone de comparativas de rendimiento publicadas.

## Limitaciones y advertencias

- No esta alineado ni ajustado para instrucciones: el checkpoint no incluye chat template y no sigue instrucciones, por lo que no es util como asistente sin un fine-tuning previo.
- Riesgo de alucinacion y contenido inexacto: al ser un modelo base sin alineamiento, puede generar afirmaciones falsas, sesgadas o perjudiciales. El usuario final es responsable de aplicar mitigaciones.
- Sesgos conocidos: no se han documentado sesgos especificos, pero al estar entrenado principalmente en ingles y coreano, puede presentar sesgos culturales o linguisticos hacia esos idiomas.
- Limitaciones de contexto: aunque la ventana nativa es de 256K, el uso de contextos muy largos requiere una cantidad considerable de memoria y puede degradar el rendimiento si no se gestiona adecuadamente.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo base no incluye garantias de seguridad ni de idoneidad para produccion. Es necesario un proceso de evaluacion y alineamiento antes de desplegarlo.
- Requisitos de hardware: su tamano (314B) hace que la inferencia sea costosa y requiera infraestructura de multiples GPU, lo que limita su uso en entornos con recursos limitados.

## Enlaces

- HuggingFace: https://huggingface.co/Motif-Technologies/Motif-3-Base
- Homepage de Motif Technologies: https://motiftech.io
- Tech Report (arXiv): https://arxiv.org/abs/2608.09119
- Licencia (en el repositorio del modelo instructivo): https://huggingface.co/Motif-Technologies/Motif-3/blob/main/LICENSE
