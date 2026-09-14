# Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r07

## Resumen

`Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r07` es un checkpoint de investigacion derivado de `meta-llama/Llama-2-7b-chat-hf`. El modelo ha sido comprimido mediante Basis Sharing (tecnica presentada en ICLR 2025 que comparte bases SVD entre grupos de 2 capas adyacentes), eliminando el 50,00% de los parametros de proyeccion densos, y despues editado con 7 de las 10 rondas de un procedimiento iterativo de intercambio de parametros neutro (`swapdiscnet_iter`) con un presupuesto de restauracion del 1,000% de los parametros densos.

El objetivo declarado por el autor no es ofrecer un asistente conversacional, sino medir como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. El checkpoint es una celda dentro de una cuadricula experimental sobre reglas de seleccion y presupuestos, no un modelo de proposito general.

La relevancia actual es doble: por un lado sirve como sujeto de estudio en investigacion sobre compresion y seguridad; por otro, cuantifica un compromiso (trade-off) entre utilidad y seguridad con metricas medibles (ASR de AdvBench 0,1192, ASR de StrongREJECT 0,2460 y sobre-rechazo macro de WildGuard 0,0960). Se trata, por tanto, de un artefacto de laboratorio con licencia Llama 2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con compresion SVD mediante Basis Sharing (bases compartidas sobre grupos de 2 capas adyacentes) |
| Parametros totales | 6.738.415.616 (~6,74 B segun safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens, heredada de Llama-2-7b-chat; no se confirma explicitamente en la model card |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (los metadatos de HuggingFace no listan idiomas; el modelo base esta optimizado principalmente para ingles) |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Fraccion de parametros resultante | 0,4998 segun la model card (sobre parametros de proyeccion densos) |
| Semilla | 42 |
| Recuperacion posterior | LoRA r=8 sobre los coeficientes por capa (bases congeladas), 2 epocas, lr 0,0001, batch 64, dataset alpaca-cleaned |
| Componentes restaurados / retirados | 3.135 / 3.135 |
| Parametros intercambiados | 45.300.224 (0,70% de los parametros de proyeccion densos) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, RoPE para posiciones y atencion con KV cache estandar. Sobre esa base se aplica una compresion por descomposicion en valores singulares con "Basis Sharing" (ICLR 2025), que agrupa 2 capas adyacentes y comparte las bases SVD entre ellas en lugar de factorizar cada matriz de forma independiente. La compresion elimina el 50,00% de los parametros de proyeccion densos, dejando una fraccion resultante de 0,4998.

Sobre el modelo comprimido se ejecuta un proceso iterativo de edicion de parametros: 7 de 10 rondas planificadas, con un presupuesto total de 1,0% de los parametros densos y fragmentos de 0,100% por ronda. La regla de seleccion empleada es `swapdiscnet_iter` y el valor de intercambio es `net` (valor de insercion mas valor de eliminacion del desalojo ordenado por sigma). Se restauran 3.135 componentes y se retiran otros 3.135, con 45.300.224 parametros intercambiados. Tras la edicion se aplica una recuperacion LoRA r=8 restringida a los coeficientes por capa (bases congeladas, presupuesto sin cambios), 2 epocas con lr 0,0001 y batch 64 sobre alpaca-cleaned. El checkpoint publicado corresponde a una ronda intermedia de una ejecucion mas larga.

## Capacidades

- Generacion de texto conversacional: al derivar de Llama-2-7b-chat conserva la interfaz de dialogo multi-turno del modelo base, si bien con degradacion esperada por la compresion.
- Razonamiento basico y respuesta a instrucciones: heredado del modelo base, sin garantias de calidad tras eliminar el 50% de los parametros de proyeccion.
- Seguridad medible en laboratorio: permite calcular tasas de exito de ataque (AdvBench, StrongREJECT) y de sobre-rechazo (WildGuard) de forma reproducible.
- Sujeto de ablacion: sirve para comparar reglas de seleccion de componentes y presupuestos de restauracion dentro de la misma cuadricula experimental.
- Interpretabilidad: la estructura de bases compartidas y los componentes intercambiados quedan documentados (semilla 42, 3.135 componentes), lo que facilita analisis de que subespacios afectan al comportamiento de seguridad.
- Tool calling / function calling: no disponible (no se documenta soporte de herramientas en la model card).
- Capacidades de agente multi-paso: no disponible (no documentadas).
- Vision, audio o modo "thinking": no disponibles; el modelo es exclusivamente de texto.
- Capacidades multilingues: no disponibles; no se declaran idiomas en los metadatos.

## Casos de uso

- Investigacion sobre compresion y seguridad: usar este checkpoint como celda experimental frente al resto de la cuadricula del autor, manteniendo constantes base, presupuesto y semilla, para aislar el efecto de la regla `swapdiscnet_iter` sobre el ASR.
- Auditoria de alineacion bajo degradacion: ejecutar AdvBench y StrongREJECT con el juez de HarmBench y comparar los valores obtenidos (0,1192 y 0,2460) contra el modelo sin comprimir para cuantificar cuanto dano introduce el 50% de eliminacion.
- Calibracion de falsos rechazos: medir el sobre-rechazo macro con WildGuard (0,0960) para determinar si la reparacion de seguridad reduce en exceso la utilidad conversacional, algo critico antes de elegir una regla de seleccion.
- Ablacion de presupuestos de restauracion: reproducir el experimento variando el presupuesto (0,1% por ronda frente al 1,0% total) y comprobar en que punto la curva de ASR deja de mejorar, usando este checkpoint como punto intermedio (7 de 10 rondas).
- Estudio de interpretabilidad de subespacios: analizar los 3.135 componentes restaurados y los 3.135 retirados para identificar que direcciones de las matrices de proyeccion correlacionan con rechazo de peticiones daninas.
- Control negativo en evaluaciones de seguridad: emplearlo como referencia de "modelo degradado" en pipelines de evaluacion que necesitan ejemplos con ASR elevado, evitando recurrir a modelos deliberadamente maliciosos.
- Docencia y formacion: ilustrar en cursos de compresion de modelos como una tecnica de reduccion de parametros puede alterar propiedades de alineacion que no aparecen en las metricas de perplejidad.
- Reproduccion de pipelines SVD + LoRA: servir de plantilla tecnica para implementar Basis Sharing con recuperacion LoRA de bajo rango sobre coeficientes, dado que todos los hiperparametros estan documentados.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / herramienta | Interpretacion |
|---|---|---|---|
| AdvBench ASR | 0,1192 | HarmBench judge | Tasa de exito de ataque; menor es mejor |
| StrongREJECT ASR | 0,2460 | HarmBench judge | Tasa de exito de ataque; menor es mejor |
| Macro over-refusal | 0,0960 | WildGuard | Tasa de rechazo excesivo; menor es mejor |

No se han publicado en la informacion disponible los valores equivalentes del modelo base `meta-llama/Llama-2-7b-chat-hf` ni de los demas brazos de la cuadricula, por lo que no es posible presentar una comparativa numerica. Asimismo, no se facilitan resultados de MMLU, HumanEval, GSM8K ni de perplejidad.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 13,5 GB de pesos (tamano del repositorio), mas KV cache y activaciones; aproximadamente 15-18 GB en funcion de la longitud de contexto.
- VRAM estimada en INT8: aproximadamente 7 GB de pesos (requiere cuantizacion propia, no publicada).
- VRAM estimada en INT4: aproximadamente 3,5-4 GB de pesos (requiere cuantizacion propia, no publicada).
- GPU consumer: cabe en una RTX 4090 (24 GB) en FP16 sin problema; en una RTX 3090 (24 GB) tambien. Con cuantizacion INT4 podria caber en GPUs de 8-12 GB, pero no hay archivos GGUF ni AWQ publicados que lo permitan de forma directa.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 80 GB y L40S son suficientes y permiten mayor batch y mayor longitud de contexto.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (el repositorio incluye el tag `text-generation-inference`) y cualquier servidor compatible con endpoints (`endpoints_compatible`). vLLM y SGLang son viables al ser una arquitectura Llama estandar, aunque no se confirman en la documentacion. llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion no publicada.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Metricas de seguridad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r07` | 6,74 B (fraccion densa 0,4998) | 4.096 (heredado) | Llama 2 Community License | Checkpoint de investigacion comprimido | AdvBench ASR 0,1192; StrongREJECT ASR 0,2460; over-refusal 0,0960 |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | ~6,74 B | 4.096 | Llama 2 Community License | LLM conversacional alineado | no disponible en la informacion proporcionada |
| Otros brazos de la cuadricula del mismo autor | no disponible | 4.096 (heredado) | Llama 2 Community License | Checkpoints comprimidos con otras reglas/presupuestos | no disponible en la informacion proporcionada |

No se dispone de datos suficientes para comparar con alternativas externas de la misma categoria (por ejemplo, otros esquemas de compresion SVD o de poda sobre Llama 2) sin recurrir a informacion no proporcionada.

## Limitaciones y advertencias

- Proposito exclusivamente investigador: la propia model card indica que es un artefacto de estudio y no un asistente desplegable.
- Seguridad degradada de forma deliberada en varias celdas de la cuadricula: la compresion por si sola eleva la tasa de exito de ataque, y el objetivo del trabajo es cuantificar ese efecto y probar su recuperacion.
- Riesgo de alucinacion elevado: al eliminar el 50% de los parametros de proyeccion densos se espera perdida de fidelidad factual; el checkpoint es una ronda intermedia (7 de 10), no el resultado final de la ejecucion.
- Metricas de seguridad no comparadas con el base: sin el valor de referencia de Llama-2-7b-chat no puede saberse si el checkpoint ha recuperado, igualado o empeorado el comportamiento original.
- Cobertura de idiomas no declarada: sin idiomas en los metadatos y con un modelo base orientado al ingles, el rendimiento en castellano u otras lenguas es incierto.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo o analisis de documentos extensos.
- Ausencia de cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que obliga a realizar la conversion y validar que la compresion SVD no rompe la compatibilidad con los kernels de cuantizacion.
- Restricciones de licencia: Llama 2 Community License con `USE_POLICY.md`; su uso esta sujeto a la politica de uso aceptable de Meta y a los requisitos de atribucion ("Built with Llama 2"), con condiciones adicionales para despliegues a gran escala.
- Divergencia entre el recuento de parametros del repositorio (6.738.415.616) y la fraccion densa declarada (0,4998): conviene verificar que los tensores cargados corresponden a la configuracion comprimida antes de reutilizar el checkpoint.
- Sin adopcion comunitaria: 0 descargas y 0 "likes" en HuggingFace, por lo que no existe validacion externa de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r07
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Basis Sharing (ICLR 2025): no disponible en la informacion proporcionada
- Repositorio de codigo del autor: no disponible en la informacion proporcionada
- Dataset alpaca-cleaned (empleado en la recuperacion LoRA): referenciado en la model card, enlace no proporcionado
- Licencia Llama 2 (`LICENSE.txt`) y politica de uso (`USE_POLICY.md`): incluidos en el propio repositorio de HuggingFace
- Demo o espacio interactivo: no disponible
