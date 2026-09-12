# antoniotorres02/vartopk-sae-stage4-checkpoints

## Resumen

Este repositorio publica los 44 puntos de control (checkpoints) de un barrido de autoencoders dispersos (sparse autoencoders, SAE) entrenados sobre las activaciones del Stage-4 de un clasificador ConvNeXt-Tiny congelado, entrenado a su vez en el dataset CUB-200-2011. Lo firma el usuario antoniotorres02 y acompana al trabajo de fin de master *Toward Neurosymbolic Sparse Autoencoders: A Bayesian Framework for Adaptive Concept Discovery*. No es un modelo de lenguaje ni un modelo generativo: es material de interpretabilidad mecanistica para vision por computador, y su proposito es permitir reproducir y auditar la comparacion entre cuatro familias de SAE.

El barrido cubre cuatro metodos (TopK fijo o `topk_nonorm`, Variable TopK o `variable_topk_original`, L1 y JumpReLU), instanciados cada uno sobre 11 objetivos de esparsidad nominal derivados de una progresion geometrica entre 8 y 256. Los checkpoints se publican junto al cache de activaciones de Stage-4 (`float16`, `[512, 768, 7, 7]`) y al clasificador congelado que se explica, con el objetivo de que cualquier tercero pueda verificar los resultados sin reentrenar el backbone.

Su relevancia actual es metodologica: la comparacion declara que Variable TopK obtiene un L0 medio inferior en 11 de 11 objetivos compartidos y un MSE de test inferior en 10 de 11, lo que aporta evidencia empirica en un debate abierto (TopK fijo frente a mecanismos adaptativos de esparsidad) y lo hace sobre un caso de vision, no de lenguaje, donde la literatura de SAE esta mucho menos poblada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (SAE) sobre mapas de activacion del Stage-4 de ConvNeXt-Tiny. Cuatro familias: fixed TopK (`topk_nonorm`), Variable TopK (`variable_topk_original`), L1 (`l1_sae`) y JumpReLU (`jumprelu_sae`) |
| Parametros totales | No declarado en la model card. Segun la configuracion publicada para cada checkpoint (`d=768`, `hidden_dim=3072`), el par encoder/decoder ronda los 4,7 millones de parametros por SAE; el repositorio contiene 44 SAE |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Opera sobre mapas de activacion de 7x7 con 768 canales (49 posiciones por imagen) |
| Tipos de cuantizacion | No disponible. Los checkpoints no declaran cuantizacion; el cache de activaciones se publica en `float16` |
| Idiomas soportados | No aplica: no procesa texto. La documentacion del repositorio esta en ingles |
| Licencia | MIT para el codigo y los artefactos liberados. CUB-200-2011 y sus splits procesados mantienen sus terminos originales |
| Formato de pesos | PyTorch `.pt` (`torch.save`), con configuracion Python embebida junto a los tensores; requiere carga con `weights_only=False` |
| Tamano del repositorio | 1,1 GB en total: 724 MB de barrido geometrico (40 archivos), 72 MB de reutilizacion log-space (4 archivos), 111 MB de cache de activaciones, 107 MB de backbone congelado, resultados CSV e informe, y `SHA256SUMS` |
| Convencion de nombres | `stage4_<method>_k<target>.pt`, con `target` en {8, 11, 16, 23, 32, 45, 64, 91, 128, 181, 256} = `round(geomspace(8, 256, 11))` |

## Arquitectura y entrenamiento

El objeto explicado es un clasificador ConvNeXt-Tiny congelado, con un 0,90234375 de top-1 sobre el subconjunto de test de 512 imagenes de CUB. Sobre las activaciones de su Stage-4 se entrenan los SAE, que siguen el esquema habitual encoder/decoder con diccionario sobredimensionado: 768 dimensiones de entrada y 3072 de capa oculta, es decir un factor de expansion de 4. Cada checkpoint guarda `model_state_dict`, la configuracion (`d`, `hidden_dim`, `k_max`, `target_l0`, etc.), las estadisticas de normalizacion de activaciones empleadas en entrenamiento (`mean`, `std`) y el historial de entrenamiento (`best_epoch`, `epochs_trained`, `stopped_reason`, por ejemplo `early_stop_patience_30`).

Las cuatro familias se diferencian en como imponen la esparsidad: TopK fijo selecciona un numero constante de caracteristicas activas, Variable TopK persigue un L0 objetivo de forma adaptativa, y L1 y JumpReLU recurren a penalizaciones o funciones de activacion con umbral. Un detalle relevante para interpretar las comparaciones es que la normalizacion del decoder esta desactivada en las dos familias TopK y activada en L1 y JumpReLU, por lo que las comparaciones entre familias no son estrictamente homogeneas. El barrido principal usa 40 ejecuciones en progresion geometrica y se completan 4 mas reutilizadas del barrido previo en log-space (objetivos 8 y 256), hasta cerrar la rejilla de 4 metodos x 11 objetivos. La model card no detalla el volumen de tokens ni la composicion del dataset de entrenamiento mas alla de las activaciones de CUB; tampoco menciona RLHF ni DPO, que no aplican a este tipo de artefacto.

## Capacidades

- Extraccion de caracteristicas interpretables: descompone las activaciones de 768 canales del Stage-4 de ConvNeXt-Tiny en un diccionario disperso de 3072 caracteristicas con un L0 controlado por `target_l0`.
- Reconstruccion de activaciones: cada SAE reconstruye los mapas de entrada, lo que permite medir fidelidad mediante MSE, NMSE y KL sobre los logits del clasificador.
- Analisis de fidelidad funcional: las metricas `top1_agreement` y `reconstructed_top1_accuracy` permiten cuantificar si la reconstruccion preserva la prediccion del clasificador original.
- Comparacion controlada de metodos de esparsidad: la rejilla de 4 metodos x 11 objetivos permite estudiar el compromiso entre L0 y error de reconstruccion.
- Reutilizacion sin recalculo: el cache `features/stage4_maps_subset512.pt` incluye mapas de train, val y test con etiquetas, de modo que se pueden entrenar SAE nuevos sin volver a ejecutar el backbone.
- Verificacion criptografica: `SHA256SUMS` cubre todos los checkpoints, el cache y el backbone, y el repositorio de codigo incluye `scripts/verify_published_checkpoints.py`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento multilingue: no es un modelo de lenguaje ni un modelo generativo.

## Casos de uso

- Interpretabilidad mecanistica de clasificadores visuales: cargar `stage4_variable_topk_original_k64.pt`, aplicar el encoder a los mapas de Stage-4 y estudiar que caracteristicas se activan ante cada imagen de CUB, con el objetivo de vincular unidades del diccionario con conceptos visuales concretos.
- Descubrimiento de conceptos en dominios con atributos finos: CUB-200-2011 esta anotado a nivel de especie y atributos, de modo que el diccionario disperso se puede correlacionar con rasgos como patrones de plumaje o forma del pico, un caso de estudio clasico para evaluar si las caracteristicas aprendidas son semanticamente coherentes.
- Benchmarking de metodos de esparsidad: reproducir la rejilla de 44 ejecuciones con `bash run_sweep.sh` y contrastar el comportamiento de TopK fijo frente a Variable TopK, L1 y JumpReLU en terminos de L0 y MSE de test a objetivos nominales identicos.
- Auditoria de fidelidad de representaciones: usar `logit_kl`, `top1_agreement` y `reconstructed_top1_accuracy` para determinar cuanto de la decision del clasificador sobrevive a la reconstruccion dispersa, util antes de usar las caracteristicas como sustituto del modelo original.
- Prototipado rapido de nuevas variantes de SAE: el cache de activaciones permite iterar sobre arquitecturas de diccionario sin la latencia ni el coste de reejecutar ConvNeXt-Tiny sobre el dataset completo.
- Investigacion en enfoques neurosimbolicos: el marco del trabajo asociado propone un esquema bayesiano de descubrimiento adaptativo de conceptos; estos checkpoints sirven como linea base empirica frente a la cual medir propuestas mas elaboradas.
- Docencia y replicabilidad: el paquete incluye checkpoints, resultados en CSV, informe, registro de hiperparametros y apendice de protocolo, lo que lo hace util como material de practicas sobre entrenamiento y evaluacion de autoencoders dispersos en vision.
- Estudio de seleccion de esparsidad por capa o modelo: la convencion de nombres y las 11 instancias por metodo permiten analizar como varia el error de reconstruccion al aumentar el presupuesto de caracteristicas activas.

## Benchmarks y rendimiento

La model card no reproduce cifras numericas de `test_mse`, `test_nmse`, `l0`, `top1_agreement`, `reconstructed_top1_accuracy` ni `logit_kl`; solo declara que coinciden con las filas de `results/convnext_stage4_geomspace_sweep/stage4_arch_compare_results.csv` con tolerancia `1e-6` para las 44 filas. Los unicos valores explicitos son el top-1 del backbone congelado y el resumen comparativo que se reproduce a continuacion.

| Metrica | Valor |
|---|---|
| Top-1 del ConvNeXt-Tiny congelado en el test de 512 imagenes | 0,90234375 |
| Variable TopK con L0 medio inferior a fixed TopK | 11 de 11 objetivos compartidos |
| Variable TopK con MSE de test inferior a fixed TopK | 10 de 11 |
| Variable TopK con `top1_agreement` superior | 9 de 11 |
| Variable TopK con `reconstructed_top1_accuracy` superior | 5 de 11 |
| Valores numericos por checkpoint (MSE, NMSE, L0, KL) | No disponibles en la informacion proporcionada; hay que consultar el CSV del repositorio |
| Comparacion con MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | No aplica: el artefacto no es un modelo de lenguaje |

## Requisitos de hardware

- Inferencia de un SAE individual: con unos 4,7 millones de parametros por checkpoint, la huella en `float32` ronda los 19 MB, y en `float16` unos 9,4 MB. Cabe en cualquier GPU de consumo, en iGPU e incluso en CPU.
- Cache de activaciones: cada split ocupa `512 x 768 x 7 x 7` en `float16`, aproximadamente 38,5 MB; los tres splits mas las etiquetas suman el archivo de 111 MB publicado.
- Memoria de trabajo en evaluacion: procesar un lote de 512 imagenes en `float32` requiere del orden de 77 MB solo para los mapas de un split, sin contar el grafo de autograd si se entrena.
- GPU recomendadas: no se requiere hardware de datacenter. Una RTX 3060, RTX 4090, T4 o cualquier GPU con 4 GB o mas de VRAM es suficiente; A100 o H100 solo tendrian sentido para barridos masivos en paralelo.
- Entrenamiento del backbone: no es necesario, el clasificador ConvNeXt-Tiny congelado se incluye en `backbone/cub_convnext_tiny_classifier.pt` (107 MB).
- Opciones de despliegue: carga directa con PyTorch (`torch.load` con `weights_only=False`) y reconstruccion del modelo con `build_model(method, args, device)` del repositorio. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Almacenamiento: el repositorio completo ocupa 1,1 GB; para reproducir el barrido hay que descargarlo entero. Los checkpoints individuales van de decenas de MB, y el mayor de los grupos (`geomspace_sweep`, 724 MB) puede descargarse por partes.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un encoder/decoder sobre tensores de `512 x 768 x 7 x 7`, se espera un coste despreciable frente al paso por el backbone, pero no se publican mediciones.

## Comparativa con modelos similares

La informacion disponible no incluye modelos externos comparables con cifras, por lo que la comparacion se limita a las cuatro familias incluidas en la propia publicacion. Todas comparten configuracion base (`d=768`, `hidden_dim=3072`) y los mismos objetivos de esparsidad nominales.

| Familia | Mecanismo de esparsidad | Normalizacion de decoder | Objetivos disponibles en el repo | Resultado declarado |
|---|---|---|---|---|
| Variable TopK (`variable_topk_original`) | L0 objetivo adaptativo con `k_max` configurable | Desactivada | 11 objetivos (8 a 256) | L0 medio inferior a fixed TopK en 11 de 11 y MSE inferior en 10 de 11 |
| Fixed TopK (`topk_nonorm`) | Numero fijo de caracteristicas activas | Desactivada | 11 objetivos (8 a 256) | Referencia de comparacion frente a Variable TopK |
| L1 (`l1_sae`) | Penalizacion L1 sobre las activaciones | Activada | 11 objetivos | Sin comparacion numerica publicada en la model card |
| JumpReLU (`jumprelu_sae`) | Umbral aprendido en la activacion | Activada | 11 objetivos | Sin comparacion numerica publicada en la model card |

Frente a otros SAE publicos de la literatura de interpretabilidad (por ejemplo, los entrenados sobre capas de modelos de lenguaje), la diferencia principal es el dominio: aqui la entrada son mapas convolucionales de 7x7 con 768 canales de un clasificador de aves, no flujos de tokens. No se dispone de datos para establecer una comparacion cuantitativa con alternativas externas.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no produce texto, no mantiene contexto conversacional, no soporta tool calling ni razonamiento multi-paso. Cualquier evaluacion de ese tipo carece de sentido.
- Especificidad total al setup: los SAE estan entrenados sobre las activaciones del Stage-4 de un unico ConvNeXt-Tiny entrenado en CUB-200-2011. No son transferibles sin reentrenamiento a otras capas, otros backbones ni otros datasets.
- Muestra reducida: todas las metricas se calculan sobre subconjuntos de 512 imagenes. No se publican intervalos de confianza ni analisis de significancia estadistica, por lo que diferencias pequenas entre metodos deben interpretarse con cautela.
- Comparacion entre familias no homogenea: la normalizacion del decoder esta desactivada en las dos familias TopK y activada en L1 y JumpReLU, lo que puede favorecer a unas u otras en las metricas de reconstruccion.
- Cifras no publicadas en la model card: los valores de MSE, NMSE, L0, `top1_agreement`, `reconstructed_top1_accuracy` y `logit_kl` existen en el CSV y en cada checkpoint, pero no se reproducen en la documentacion; hay que descargar 1,1 GB para consultarlos.
- Sesgos heredados: el clasificador subyacente y CUB-200-2011 (aves de America del Norte, imagenes de museo) pueden introducir sesgos de especie, fondo y sesgo geografico que no se analizan en la publicacion.
- Riesgo de sobreinterpretacion: la correlacion entre una caracteristica del diccionario y un concepto visual es una hipotesis, no una prueba; no se incluye validacion causal de las caracteristicas descubiertas.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay verificacion independiente de los resultados.
- Idioma: la documentacion y los mensajes del codigo estan en ingles; no hay version en castellano.
- Licencia: el codigo y los artefactos liberados son MIT, lo que permite uso comercial, pero CUB-200-2011 y sus splits procesados mantienen sus propios terminos, que hay que respetar al redistribuir derivados.
- Carga peculiar: los checkpoints requieren `weights_only=False` porque embeben configuracion Python junto a los tensores; esto implica ejecutar `torch.load` sobre objetos no puramente tensoriales y exige confiar en el origen del archivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/antoniotorres02/vartopk-sae-stage4-checkpoints
- Codigo de entrenamiento y evaluacion del barrido: https://github.com/antoniotorres02/vartopk-sae-stage4-sweep
- Memoria del TFM citada, *Toward Neurosymbolic Sparse Autoencoders: A Bayesian Framework for Adaptive Concept Discovery*: enlace no disponible en la informacion proporcionada
- Dataset CUB-200-2011 y sus splits procesados: enlace no disponible en la informacion proporcionada
- Resultados del barrido dentro del repositorio: `results/convnext_stage4_geomspace_sweep/stage4_arch_compare_results.csv`, informe, registro de hiperparametros y apendice de protocolo (accesibles desde la pagina de HuggingFace)
- Verificacion de integridad: `SHA256SUMS` en el repositorio y script `scripts/verify_published_checkpoints.py` en el repositorio de codigo
