# gabe-adib/ove3-ladder-185m-lk3x1024

## Resumen

`ove3-ladder-185m-lk3x1024` es un checkpoint de investigación publicado por el usuario gabe-adib en HuggingFace. No es un modelo listo para producto: es un brazo concreto ("K3", variante LatentMoE) de una escalera de intervenciones denominada ove3, dentro de la celda IsoFLOP de 185M parámetros activos de una receta mayor. El modelo se entrenó con Megatron y se distribuye tal cual salió del entrenamiento, incluyendo estado del optimizador.

La arquitectura es un transformer con mezcla de expertos (MoE) de tipo LatentMoE: 1024 expertos de media anchura, enrutamiento top-16 y aproximadamente el doble de parámetros enrutados que un MoE convencional equivalente, con normalización RMSNorm de epsilon 1e-5 y escalado de router 1.0. El checkpoint corresponde a la iteración 18.810 (best_1), con pérdida de validación de 1,0876 y pérdida held-out de 1,1818 nats/carácter agregada sobre 9 dominios.

Su relevancia es experimental, no competitiva: sirve para estudiar el efecto de intervenciones arquitectónicas sobre MoE con presupuesto de cómputo fijo (IsoFLOP), comparar recetas de enrutamiento y reproducir análisis de escalado. No hay pipeline declarado, ni licencia, ni idiomas, ni benchmarks estándar publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con LatentMoE; atención tipo kimi_linear (según nombre del run); 1024 expertos de media anchura, top-16 |
| Parametros totales | no disponible (estimación aproximada a partir del tamaño del repo: ~4B, ver sección de hardware) |
| Parametros activos | 185M |
| Parametros enrutados | top-16 sobre 1024 expertos; ~2x parámetros enrutados respecto al MoE de referencia de la receta |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint distribuido de Megatron, sin versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron (`checkpoint/`), con estado del optimizador; no se publican safetensors ni GGUF |
| Normalizacion | RMSNorm con eps 1e-5 |
| Escalado de router | 1.0 |
| Semilla | 1234 |
| Iteracion del checkpoint | 18.810 (best_1) |
| Perdida de validacion (LM) | 1,0876 |
| Perdida held-out | 1,1818 nats/carácter (ponderada por mezcla sobre 9 dominios) |
| Tamano del repositorio | 57,0 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El run emplea un transformer con MoE y una variante de expertos en espacio latente (LatentMoE), con 1024 expertos de media anchura y enrutamiento top-16. El autor indica que esta configuración duplica aproximadamente los parámetros enrutados respecto a la variante de referencia, manteniendo 185M de parámetros activos. El nombre del run incluye "kimi_linear", lo que sugiere el uso de atención lineal en la línea de Kimi Linear, si bien la model card no detalla la composición exacta de capas ni la proporción entre atención lineal y atención completa. La normalización es RMSNorm con eps 1e-5 y el escalado del router es 1.0, valores que forman parte de la intervención estudiada.

El entrenamiento sigue la celda IsoFLOP de 185M de la receta: mismos datos, tasa de aprendizaje, tamaño de batch y número de pasos que el resto de brazos de la escalera, con semilla 1234. No se especifican el número total de tokens, la composición del dataset ni si hubo fases de alineación (RLHF, DPO o similares); por el tipo de artefacto y la métrica reportada, cabe esperar un modelo base sin alineación, aunque esto no se confirma en la información disponible. La pérdida held-out se expresa en nats por carácter y se desglosa por dominio en `DOMAIN_NLL.txt`, lo que apunta a una tokenización a nivel de carácter o byte; es una inferencia a partir de la unidad de la métrica, no un dato declarado.

El repositorio incluye el checkpoint Megatron (`checkpoint/`), los logs de entrenamiento segmentados cada 4 horas, los logs de scoring, los eventos de TensorBoard y el `config.yaml` del run, lo que facilita la reproducibilidad y el análisis posterior del enrutamiento.

## Capacidades

- Modelado de lenguaje autoregresivo: es la única capacidad confirmada por la información disponible (predicción del siguiente token, evaluada como pérdida LM en validación y held-out).
- Estudio de enrutamiento MoE: al publicarse el checkpoint con estado del optimizador y logs de TensorBoard, permite analizar la distribución de carga entre los 1024 expertos y el efecto del top-16.
- Reproducción de experimentos IsoFLOP: misma receta (datos, LR, batch, pasos) que la celda de 185M, lo que habilita comparaciones controladas entre brazos de la escalera.
- Evaluación por dominio: `DOMAIN_NLL.txt` proporciona pérdida por cada uno de los 9 dominios de la mezcla, útil para análisis de transferencia y mezcla de datos.
- Fine-tuning posterior: al ser un checkpoint Megatron completo, es material de partida para ajuste supervisado en tareas concretas.
- Capacidades ausentes o no confirmadas: no hay evidencia de instrucción, tool calling, function calling, comportamiento agente, razonamiento multi-paso, visión, audio ni modo "thinking". Tampoco se documenta multilingüismo.

## Casos de uso

- Investigación en arquitecturas MoE: comparar este brazo LatentMoE top-16 con los demás brazos de la escalera ove3 manteniendo datos, LR, batch y pasos constantes, para aislar el efecto de la intervención sobre la pérdida de validación.
- Análisis de enrutamiento y equilibrio de expertos: cargar el checkpoint y el estado del optimizador para medir utilización por experto, colapso de router o especialización por dominio a lo largo de las 18.810 iteraciones.
- Reproducción de resultados de escalado: el paquete incluye logs por segmentos de 4 horas y eventos de TensorBoard, lo que permite reconstruir curvas de pérdida y verificar la receta IsoFLOP de 185M.
- Estudio de tokenización a nivel de carácter: la métrica en nats/carácter y el desglose por dominio permiten analizar el comportamiento del modelo en tareas de modelado de caracteres frente a tokenizadores BPE.
- Base para ajuste supervisado en tareas pequeñas: con 185M de parámetros activos, el coste de cómputo por token en inferencia es bajo, lo que hace viable experimentar con fine-tuning en dominios específicos usando los 9 dominios ya puntuados como referencia.
- Docencia y formación técnica: usar el run como ejemplo real de entrenamiento Megatron con MoE, mostrando configuración, logs, pérdidas y estructura del checkpoint distribuido.
- Investigación en interpretabilidad: analizar representaciones latentes de los expertos y su relación con dominios concretos, aprovechando que el checkpoint es el mejor paso de validación y no un artefacto promediado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas son pérdidas de language modeling:

| Metrica | Valor |
|---|---|
| Perdida LM de validacion (iteracion 18.810) | 1,0876 |
| Perdida held-out (nats/carácter, ponderada por mezcla, 9 dominios) | 1,1818 |
| Desglose por dominio | en `DOMAIN_NLL.txt` (no incluido en la informacion disponible) |

No se proporcionan comparaciones con otros brazos de la escalera ni con modelos externos, por lo que no es posible establecer una posición relativa de rendimiento.

## Requisitos de hardware

- VRAM para inferencia: no disponible como dato publicado. Como referencia orientativa, con 185M de parámetros activos el cómputo por token es reducido, pero el peso en memoria depende del total de parámetros, que no se declara.
- Estimación del total de parámetros: el repo ocupa 57,0 GB e incluye pesos y estado del optimizador (habitualmente pesos maestros en fp32 más momentos de Adam, en torno a 12-14 bytes por parámetro). De ahí se puede inferir de forma muy aproximada un total del orden de 4.000M de parámetros; es una estimación propia no confirmada por el autor.
- VRAM estimada según esa estimación: ~8-9 GB en bf16/fp16 para los pesos, más overhead de activaciones y caché KV; ~2,5-3,5 GB con cuantización de 4 bits, en caso de que se genere una conversión.
- GPU recomendadas: no hay recomendación oficial. Para entrenamiento o ajuste, el checkpoint Megatron requiere GPUs de datacenter (A100 40/80 GB, H100, o clústeres multi-GPU con paralelismo de experto); para inferencia tras conversión, una RTX 4090 (24 GB) o una RTX 3090 serían suficientes si la estimación anterior es correcta.
- Cabe en GPU de consumo: probablemente sí tras convertir el checkpoint y, si es necesario, cuantizar; no hay artefactos listos para ello.
- Opciones de despliegue: el formato publicado es un checkpoint distribuido de Megatron, utilizable con Megatron-LM. Para vLLM, TGI, llama.cpp u Ollama sería necesario convertir previamente a safetensors en formato HuggingFace; no se publican scripts de conversión ni pesos en esos formatos.
- Latencia y throughput: no disponibles. Al tener 185M de parámetros activos con top-16 sobre 1024 expertos, el cuello de botella esperable es el ancho de banda de memoria (hay que recorrer los expertos seleccionados en cada token) más que el cómputo FLOPs, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No hay benchmarks publicados de este checkpoint, de modo que la comparación solo puede ser estructural. Los datos de los modelos alternativos provienen de su documentación pública y no se han verificado en esta búsqueda.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ove3-ladder-185m-lk3x1024 | no disponible (~4B estimado) | 185M | no disponible | no disponible | checkpoint Megatron, 57 GB, sin cuantizaciones |
| OLMoE-1B-7B | 7B | 1,3B | 4096 | Apache 2.0 | safetensors, ampliamente integrado |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32.768 | Apache 2.0 | safetensors, soporte en vLLM y otras herramientas |
| Modelos densos de ~200-400M (por ejemplo la familia SmolLM2) | 135M-360M | todos | hasta 8.192 en algunas variantes | licencias permisivas variables | GGUF, safetensors, Ollama |

La diferencia práctica es clara: los alternativos son artefactos orientados a uso real, con licencia explícita, tokenizador documentado, contexto declarado y pesos en formatos estándar. Este checkpoint es un subproducto de experimento, sin esas garantías, y su interés está en la comparación controlada dentro de la escalera ove3.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia explícita no se puede asumir uso comercial; en la práctica, el artefacto debe tratarse como material de investigación restringido hasta que el autor la declare.
- Sin alineación declarada: no hay indicios de RLHF, DPO ni ajuste a instrucciones, por lo que el comportamiento esperable es el de un modelo base, con riesgo de generar contenido inapropiado o divagante ante prompts conversacionales.
- Riesgo de alucinación: sin datos de evaluación en tareas de conocimiento, no hay forma de acotar la tasa de afirmaciones incorrectas; la pérdida held-out de 1,1818 nats/carácter no es comparable con métricas de exactitud.
- Idiomas no declarados: se desconoce la cobertura lingüística del dataset de entrenamiento y, por tanto, el rendimiento fuera de la lengua o lenguas mayoritarias de la mezcla.
- Contexto desconocido: no se publica la longitud de contexto, lo que impide planificar cargas de trabajo con ventanas largas.
- Sin benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, de modo que cualquier afirmación de calidad sería especulativa.
- Artefacto de un solo seed: los resultados corresponden a la semilla 1234 y a una única ejecución, sin intervalos de confianza sobre la varianza entre semillas.
- Formato poco práctico: el checkpoint Megatron con estado del optimizador (57 GB) no se carga directamente en los stacks de inferencia habituales; requiere conversión y posibles ajustes de configuración.
- Tokenización probablemente a nivel de carácter: la pérdida en nats/carácter implica secuencias más largas por unidad de texto, con menor eficiencia por token y posible peor rendimiento en tareas que dependen de unidades subpalabra.
- Metadatos incompletos en HuggingFace: pipeline sin declarar, cero descargas y cero likes en el momento de la consulta, sin documentación adicional más allá de la model card.
- Resultados de búsqueda web no relevantes: las consultas devolvieron únicamente páginas de contenido para adultos sin relación con el modelo, por lo que no se ha podido contrastar información externa.

## Enlaces

- HuggingFace: https://huggingface.co/gabe-adib/ove3-ladder-185m-lk3x1024
- No se han encontrado en la búsqueda web enlaces relevantes al modelo (paper, blog, repositorio o demo); los resultados obtenidos eran contenido para adultos sin relación alguna con el artefacto.
