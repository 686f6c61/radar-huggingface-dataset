# ml-resources/sapiens2-pretrain-1b

## Resumen

Sapiens2-1B es un backbone de vision transformer de 1.462 millones de parametros desarrollado por Meta, disenado especificamente para tareas centradas en el cuerpo humano: estimacion de pose, segmentacion de partes del cuerpo, normales de superficie y pointmaps. Se trata del modelo preentrenado de mayor tamano dentro de la familia Sapiens2 (junto a las variantes 0.1B, 0.4B, 0.8B, 1B-4K y 5B) y su funcion es producir caracteristicas densas por parche que sirven como inicializacion para ajustar cabezas de tarea posteriores.

El modelo se preentreno sobre 1.000 millones de imagenes de personas a una resolucion de 1024 x 768 (H x W) con parche de 16 pixeles, lo que se traduce en un coste de 4,715 TFLOPs por forward pass. La arquitectura incorpora RoPE, atencion con consultas agrupadas (GQA), activacion SwiGLU, RMSNorm y QK-norm, elementos habituales en los transformers de ultima generacion pero aplicados aqui a vision de alta resolucion y no a texto.

Es relevante porque ataca un nicho concreto (vision humano-centrica en alta resolucion) donde los backbones genericos de vision suelen quedarse cortos, y porque la familia ofrece variantes desde 0,114B hasta 5,071B parametros, lo que permite elegir el punto de equilibrio entre precision y coste computacional. El repositorio analizado es un espejo no oficial (`ml-resources/sapiens2-pretrain-1b`) del original de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sapiens2 ViT (RoPE, GQA, SwiGLU, RMSNorm, QK-norm) |
| Parametros totales | 1.462 B (1.455.474.192 segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE; todos los parametros son densos) |
| Longitud de contexto | no aplica en tokens de texto; entrada de imagen de 1024 x 768 (H x W) con parche de 16, equivalente a 3.072 tokens de imagen por muestra. Existe variante Sapiens2-1B-4K de mayor resolucion |
| Tipos de cuantizacion | no disponible (no se documentan recetas de cuantizacion; el checkpoint se distribuye en safetensors de precision completa) |
| Idiomas soportados | no aplica (modelo de vision; no procesa texto ni lenguaje natural) |
| Licencia | Sapiens2 License (identificador `sapiens2-license`, `license: other`) |
| Formato de pesos | safetensors (`sapiens2_1b_pretrain.safetensors`) |

Datos adicionales de especificacion: dimension de embedding 1536, 40 capas, 24 cabezas de atencion, FLOPs 4,715 T, resolucion de preentrenamiento 1024 x 768 (H x W), parche 16, tamano del repositorio 5,8 GB, libreria `sapiens2`, tarea `image-feature-extraction`.

## Arquitectura y entrenamiento

Sapiens2-1B es un vision transformer denso de 40 capas con dimension de embedding 1536 y 24 cabezas de atencion. Frente a los ViT clasicos, la model card indica el uso de RoPE (codificacion posicional rotatoria), atencion con consultas agrupadas (GQA, que reduce el coste de memoria del cache de claves y valores al compartir cabezas K/V entre grupos de cabezas Q), SwiGLU como activacion en el bloque MLP, RMSNorm para normalizacion y QK-norm para estabilizar los productos escalares de la atencion. El parche de entrada es de 16 x 16 pixeles.

El preentrenamiento se realizo sobre 1.000 millones de imagenes de personas a resolucion 1024 x 768 (H x W), un regimen de alta resolucion que implica 3.072 tokens por imagen (64 x 48 parches). La model card no detalla el numero de tokens vistos, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO o aprendizaje autosupervisado especifico (tipo DINO, MAE o similares); tampoco se describe la funcion de perdida empleada en el preentrenamiento. El modelo se distribuye como backbone puro, sin cabezas de tarea: la salida es un tensor denso de caracteristicas por parche de forma (B, num_tokens, embed_dim), pensado para alimentar cabezas ajustadas por separado para pose, segmentacion, normales y pointmaps.

## Capacidades

- Extraccion de caracteristicas densas por parche: la salida es un tensor (B, num_tokens, 1536) que describe cada region de 16 x 16 pixeles de la imagen de entrada.
- Procesamiento de imagenes de alta resolucion: la configuracion de preentrenamiento es 1024 x 768 (H x W), con una variante de 4K disponible en la familia.
- Inicializacion para ajuste fino: sirve como punto de partida para cabezas de estimacion de pose, segmentacion de partes del cuerpo, prediccion de normales de superficie y pointmaps.
- Vision humano-centrica: el preentrenamiento con 1.000 millones de imagenes de personas orienta las representaciones hacia morfologia, postura y estructura corporal.
- No soporta tool calling ni function calling: es un modelo de vision, no un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en lenguaje natural.
- No soporta generacion de texto, codigo ni matematicas.
- No dispone de modo de razonamiento (thinking mode), ni capacidades de audio o de vision-lenguaje; no responde a instrucciones en texto.
- Capacidad multilingue: no aplica, no procesa texto.

## Casos de uso

- Extraccion de caracteristicas para cabezas de tarea: el uso directo del repositorio es generar el tensor de caracteristicas densas y entrenar encima una cabeza de pose o segmentacion. El modelo no predice nada por si mismo, pero evita entrenar el backbone desde cero.
- Estimacion de pose 2D y 3D en imagenes de alta resolucion: la resolucion de preentrenamiento de 1024 x 768 preserva detalle fino de articulaciones y manos, algo critico en imagenes de cuerpo completo o planos medios donde los backbones de 224 x 224 pierden informacion.
- Segmentacion de partes del cuerpo para probadores virtuales y retail de moda: las caracteristicas por parche permiten separar prendas de la anatomia con una cabeza de segmentacion ajustada, habilitando superposicion de ropa virtual sobre la silueta detectada.
- Analisis biomecanico en deporte: procesando fotogramas de video con el backbone y encadenando las predicciones de pose por fotograma, se pueden extraer angulos articulares y trayectorias de movimiento para evaluacion tecnica o prevencion de lesiones.
- Captura de movimiento sin marcadores y reconstruccion 3D: combinando las cabezas de normales de superficie y pointmaps de la familia Sapiens2, las caracteristicas del backbone alimentan pipelines de reconstruccion volumetrica de personas a partir de una o varias vistas.
- Generacion de avatares y personajes sinteticos: las representaciones obtenidas sirven como condicionamiento geometrico para pipelines de generacion 3D o de reescalado de personajes en produccion audiovisual.
- Analisis de multitudes y seguimiento de personas en video: con una cabeza de deteccion o re-identificacion ajustada sobre las caracteristicas, se puede aplicar a conteo y seguimiento en entornos de vigilancia o analitica de espacios publicos.
- Investigacion academica sobre representaciones humano-centricas: el backbone permite estudiar sesgos, robustez ante oclusiones y transferencia entre dominios en vision de personas, y comparar el efecto del tamano de backbone (0,114B a 5,071B) sobre tareas downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de metricas (ni AP de pose, ni mIoU de segmentacion, ni resultados de MMLU o HumanEval, que en cualquier caso no aplicarian a este tipo de modelo). El unico dato cuantitativo de coste es el numero de FLOPs por forward pass: 4,715 T a 1024 x 768.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no medida oficialmente): aproximadamente 5,8 GB en fp32, unos 2,9 GB en bf16/fp16, unos 1,5 GB en int8 y unos 0,75 GB en int4. A esto hay que sumar la memoria de activaciones, que depende del lote y de la resolucion de entrada (3.072 tokens por imagen a 1024 x 768).
- GPU recomendadas para ajuste fino y lotes grandes: A100, H100 o GPUs de 40-80 GB, dado el coste de 4,715 TFLOPs por forward y la memoria de activaciones en entrenamiento.
- GPU de consumo: el modelo cabe en tarjetas de consumo para inferencia. Con pesos en bf16 (unos 2,9 GB), es viable en RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090. Con fp32 (unos 5,8 GB) sigue siendo viable en GPUs de 12 GB o mas para inferencia con lote pequeno.
- Opciones de despliegue: el procedimiento documentado es instalar el repositorio oficial de Sapiens2 (`pip install -e .`), descargar el safetensors y cargarlo con `sapiens.backbones.standalone.sapiens2.Sapiens2`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y estos frameworks no son aplicables porque no es un modelo de lenguaje. Tampoco se documenta exportacion a ONNX ni a TensorRT.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de imagenes por segundo. Como referencia de coste, cada forward pass a 1024 x 768 consume 4,715 TFLOPs.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar dentro de la propia familia Sapiens2. No se han facilitado especificaciones ni resultados de modelos alternativos de otros desarrolladores, por lo que la comparacion con terceros queda como no disponible.

| Modelo | Parametros | FLOPs | Embed dim | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.1B | 0,114 B | 0,342 T | 768 | 12 | 12 |
| Sapiens2-0.4B | 0,398 B | 1,260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B | 0,818 B | 2,592 T | 1280 | 32 | 16 |
| Sapiens2-1B | 1,462 B | 4,715 T | 1536 | 40 | 24 |
| Sapiens2-1B-4K | 1,607 B | no disponible | 1536 | 40 | 24 |
| Sapiens2-5B | 5,071 B | 15,722 T | 2432 | 56 | 32 |

Todas las variantes comparten licencia Sapiens2 License y el mismo formato de distribucion (safetensors) y tarea (`image-feature-extraction`). No hay datos de rendimiento downstream que permitan justificar el salto de 0,8B a 1B o a 5B en terminos de precision.

## Limitaciones y advertencias

- No es un modelo utilizable directamente: es un backbone sin cabezas de tarea. Sin un ajuste fino posterior no produce predicciones con significado semantico; solo entrega caracteristicas densas.
- Sesgos de datos: el preentrenamiento con 1.000 millones de imagenes de personas puede arrastrar sesgos demograficos, geograficos, de iluminacion y de contexto de captura. No hay informacion sobre la composicion del dataset ni sobre procesos de mitigacion de sesgos.
- Dominio restringido: esta optimizado para escenas con personas. Su rendimiento en imagenes sin figuras humanas (paisajes, objetos, escenas genericas) es previsiblemente inferior y no esta documentado.
- Resolucion de entrada: la configuracion de preentrenamiento es 1024 x 768. Usar resoluciones o relaciones de aspecto muy distintas puede degradar la calidad de las caracteristicas; la familia ofrece la variante 1B-4K para resoluciones mayores.
- Alucinacion: no aplica en el sentido generativo (no genera texto), pero las caracteristicas extraidas no son interpretables directamente y cualquier cabeza mal ajustada producira predicciones erroneas con apariencia plausible.
- Licencia: la Sapiens2 License es una licencia personalizada (`license: other`), no Apache 2.0 ni MIT. Las condiciones exactas de uso comercial deben consultarse en el archivo LICENSE.md del repositorio oficial antes de integrar el modelo en produccion.
- Repositorio espejo: `ml-resources/sapiens2-pretrain-1b` es un espejo no oficial del original `facebook/sapiens2-pretrain-1b`. No recibe mantenimiento de los autores y puede desincronizarse. El repositorio analizado registra 0 descargas y 0 likes en el momento de la consulta.
- Verificacion bibliografica: el identificador arXiv indicado en la model card (2604.21681) no se ha podido verificar, y las busquedas web realizadas no devolvieron resultados relevantes sobre el modelo (solo paginas de desambiguacion y contenidos sin relacion). Conviene confirmar la referencia antes de citarla.
- Ausencia de datos de rendimiento: no hay benchmarks publicados en la informacion disponible, por lo que no es posible estimar la ganancia real frente a backbones anteriores antes de ejecutar una evaluacion propia.

## Enlaces

- Repositorio de HuggingFace analizado (espejo no oficial): https://huggingface.co/ml-resources/sapiens2-pretrain-1b
- Repositorio oficial del backbone 1B: https://huggingface.co/facebook/sapiens2-pretrain-1b
- Variante 0.1B: https://huggingface.co/facebook/sapiens2-pretrain-0.1b
- Variante 0.4B: https://huggingface.co/facebook/sapiens2-pretrain-0.4b
- Variante 0.8B: https://huggingface.co/facebook/sapiens2-pretrain-0.8b
- Variante 1B-4K: https://huggingface.co/facebook/sapiens2-pretrain-1b-4k
- Variante 5B: https://huggingface.co/facebook/sapiens2-pretrain-5b
- Coleccion Sapiens2 en HuggingFace: https://huggingface.co/collections/facebook/sapiens2
- Paper: https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo fuente: https://github.com/facebookresearch/sapiens2
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
