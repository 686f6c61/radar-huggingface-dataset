# rlmyfs/Hy4-base

## Resumen

Hy4-base es el modelo base (pretrained, sin ajuste instructivo) de la familia Hy4, desarrollada por el equipo Tencent Hy. Se trata de un modelo multimodal de tipo Mixture-of-Experts (MoE) que procesa texto, imagenes y video, con un backbone de lenguaje de 770B parametros totales de los que se activan 49B por token (mas 1,23B adicionales de vision por token visual). Incorpora 78 capas, con una capa densa inicial y 77 capas MoE con 256 expertos enrutados y 1 compartido por capa, activando los top-8 expertos mas el compartido.

Su principal innovacion arquitectonica es la atencion Gated DeepSeek Sparse Attention (Gated DSA) con IndexCache, que reutiliza indices dispersos entre capas, combinada con Multi-head Latent Attention (MLA) y un mecanismo de conexiones residuales iHC (identity Hyper-Connections) con 4 flujos residuales. Ademas, integra un drafter DFly2 de 5 capas y 3,3B parametros para decodificacion especulativa de coste constante, lo que resulta especialmente relevante para contextos largos.

El modelo soporta una ventana de contexto de 1.048.576 tokens (1M), lo que lo situa en la categoria de modelos de contexto ultralargo. Su relevancia actual radica en combinar escala MoE eficiente, multimodalidad nativa y decodificacion especulativa integrada, orientado a casos de uso de agentes, vision por computador, desarrollo frontend y flujos de trabajo de oficina. La licencia es la Tencent Hy License, de tipo "other", lo que exige revision legal antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal con Gated DeepSeek Sparse Attention (Gated DSA) e IndexCache, MLA e iHC |
| Parametros totales | 770B (backbone de lenguaje, excluyendo ViT, adaptador y DFly2); 771.142.535.581 en safetensors |
| Parametros activos | 49B texto + 1,23B vision por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (existe repositorio GGUF externo) |
| Idiomas soportados | No disponible |
| Licencia | Tencent Hy License (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone de lenguaje consta de 78 capas con un tamano oculto de 6.144 y un vocabulario de 120.832 tokens. La primera capa usa una FFN densa con tamano intermedio de 18.432; las 77 restantes son capas MoE con 256 expertos enrutados (tamano intermedio 2.048) y 1 experto compartido, activando top-8 expertos enrutados por token. El modulo de atencion emplea Gated DeepSeek Sparse Attention con IndexCache: 64 cabezas de atencion, MLA con q_lora_rank de 2.048 y kv_lora_rank de 512, y un indexer de 32 cabezas con dimension 128 que selecciona los top-2.048 tokens de contexto para la atencion dispersa. Las conexiones residuales usan iHC (identity Hyper-Connections) con 4 flujos residuales, inspirado en DeepSeek y GLM.

El codificador visual es un ViT de 40 capas, tamano oculto 1.536, tamano intermedio 6.144 y 16 cabezas de atencion, con parches de 16x16, embeddings posicionales de 128x128 y fusion de caracteristicas visuales 2x2; un adaptador convierte las caracteristicas de imagenes y fotogramas de video en tokens visuales. El drafter DFly2 (5 capas, 3,3B parametros) reutiliza la KV cache y los indices dispersos de Hy4 para decodificacion especulativa en contexto largo con coste constante. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un modelo base, no se espera un ajuste instructivo.

## Capacidades

- Comprension de texto, imagenes y video de forma nativa (pipeline image-text-to-text).
- Generacion de texto y razonamiento sobre contextos de hasta 1M tokens.
- Capacidades de vision por computador y "computer use" (uso de interfaces y pantallas).
- Desarrollo frontend y de videojuegos (segun los casos de uso declarados por el autor).
- Flujos de trabajo financieros y de oficina.
- Investigacion cientifica e I+D en IA.
- Asistente personal de horizonte largo (long-horizon personal assistant).
- Decodificacion especulativa integrada mediante DFly2 para acelerar la generacion en contextos largos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Vision y computer use: el modelo puede interpretar capturas de pantalla y fotogramas de video para automatizar la interaccion con interfaces de usuario, aprovechando su codificador ViT de 40 capas y la fusion de caracteristicas visuales 2x2.
- Desarrollo frontend y de videojuegos: dado su soporte de contexto de 1M tokens, puede razonar sobre bases de codigo extensas y generar componentes de interfaz o logica de juego con coherencia entre archivos.
- Flujos de trabajo financieros y de oficina: procesamiento de documentos largos, informes y hojas de calculo con contexto extendido, combinando comprension de texto e imagenes de tablas o graficos.
- Investigacion cientifica e I+D: lectura y sintesis de articulos tecnicos extensos y figuras, con capacidad de mantener el hilo a lo largo de cientos de miles de tokens.
- Asistente personal de horizonte largo: gestion de tareas multi-paso con memoria de contexto prolongada, adecuado para agentes que mantienen estado durante sesiones extensas.
- Procesamiento de video a gran escala: analisis de secuencias de video mediante el adaptador que convierte fotogramas en tokens visuales, util para resumen o descripcion de contenido audiovisual.
- Servicio de inferencia de alto rendimiento: gracias a la decodificacion especulativa DFly2 y a la atencion dispersa con IndexCache, es viable desplegarlo en vLLM o SGLang para cargas con contextos largos.

## Benchmarks y rendimiento

Resultados de evaluacion few-shot del modelo base segun la model card:

| Categoria | Benchmark | Shots | Hy4 Base | Hy4 flash Base | Hy3 preview Base | DeepSeek-V4-flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---:|---:|---:|---:|---:|---:|
| Conocimiento | MMLU | 5 | 91,6 | 88,7 | 87,5 | 89,7 | 91,1 |
| Conocimiento | MMLU-Pro | 5 | 73,9 | 71,1 | 65,8 | 68,6 | 73,4 |
| Conocimiento | MMLU | 5 | (dato truncado en la informacion disponible) | - | - | - | - |

La model card incluye ademas una grafica de bits-per-byte (BPB) sobre validacion interna de codigo y agentes, con valores no numericos disponibles en el texto. El resto de resultados de benchmarks no esta disponible en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 770B parametros totales, en precision BF16 se requeririan aproximadamente 1,5 TB de memoria, por lo que el despliegue en precision completa exige multiples aceleradores. Existe un repositorio GGUF externo (AngelSlim/Hy4-GGUF) para cuantizacion.
- GPU recomendadas: no disponible en la informacion proporcionada; por escala, se anticipan clusters multi-GPU de clase H100/A100.
- Compatibilidad con GPU de consumo: no disponible; el tamano del modelo hace inviable su ejecucion en una unica GPU de consumo en precision completa.
- Opciones de despliegue: vLLM y SGLang (documentados en la model card); llama.cpp/Ollama a traves de la variante GGUF externa.
- Latencia y throughput: no disponible en la informacion proporcionada; la decodificacion especulativa DFly2 esta disenada para reducir el coste en contextos largos con coste constante.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | MMLU (5-shot) | MMLU-Pro (5-shot) |
|---|---|---|---|---|---|---|
| Hy4 Base | 770B | 49B + 1,23B vision | 1M | Tencent Hy License | 91,6 | 73,9 |
| Hy4 flash Base | No disponible | No disponible | No disponible | Tencent Hy License | 88,7 | 71,1 |
| Hy3 preview Base | No disponible | No disponible | No disponible | No disponible | 87,5 | 65,8 |
| DeepSeek-V4-flash-Base | No disponible | No disponible | No disponible | No disponible | 89,7 | 68,6 |
| DeepSeek-V4-Pro-Base | No disponible | No disponible | No disponible | No disponible | 91,1 | 73,4 |

Los datos de parametros, contexto y licencia de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base (pretrained), no ajustado para instrucciones; su uso directo en conversacion requerira fine-tuning o prompting especifico.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se documentan mitigaciones en la informacion disponible.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; la model card solo ofrece version en chino e ingles, lo que sugiere un enfasis en esos idiomas.
- Licencia Tencent Hy License (license: other): es necesario revisar los terminos exactos antes de cualquier uso comercial o redistribucion.
- El tamano del repositorio (1.542,4 GB) y los 770B parametros implican requisitos de infraestructura muy elevados.
- La informacion sobre cuantizacion, tool calling y benchmarks es parcial; conviene validar el rendimiento en el caso de uso concreto antes de produccion.
- El identificador del repositorio (rlmyfs/Hy4-base) no coincide con la organizacion oficial (tencent/Hy4), por lo que debe verificarse la procedencia y autenticidad de los pesos.

## Enlaces

- Hugging Face (repositorio consultado): https://huggingface.co/rlmyfs/Hy4-base
- Hugging Face (organizacion oficial): https://huggingface.co/tencent/Hy4
- Model card oficial (LICENSE): https://huggingface.co/tencent/Hy4-base/blob/main/LICENSE
- README en chino: https://huggingface.co/tencent/Hy4-base/blob/main/README_CN.md
- Web oficial: https://hy.tencent.ai/research/hy4
- GitHub: https://github.com/Tencent-Hunyuan/Hy4
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4
- GGUF: https://huggingface.co/AngelSlim/Hy4-GGUF
- Paper Gated DeepSeek Sparse Attention: https://arxiv.org/abs/2512.02556
- Paper IndexCache: https://arxiv.org/abs/2603.12201
- Articulo sobre iHC: https://zhuanlan.zhihu.com/p/2010852389670908320
