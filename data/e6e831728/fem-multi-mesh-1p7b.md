# E6E831728/fem-multi-mesh-1p7b

## Resumen

FEM-multi-mesh-1p7b es un modelo de lenguaje causal experimental desarrollado por el usuario E6E831728 y publicado en HuggingFace bajo el identificador `E6E831728/fem-multi-mesh-1p7b`. Su rasgo diferencial es que prescinde por completo del mecanismo de atención: en su lugar implementa una red de operadores multi-malla de inspiración FEM (finite element method), con representaciones heterogéneas del mismo texto (coordenadas de token Binary16 congeladas, observaciones deterministas de glifo/forma, Structured Binary Tiles sin pérdida, una pirámide causal de historia gruesa y celdas latentes de trabajo) resueltas mediante solvers ConvGLU iterativos compartidos. El autor lo describe explícitamente como "an FEM-inspired attention-free causal multi-mesh operator network" y aclara que no resuelve ninguna EDP física real.

El modelo tiene 1.726.969.344 valores de tensor almacenados (aproximadamente 1.675.064.832 parámetros y 51.904.512 valores de búfer fijo), se distribuye en formato safetensors y se carga con `transformers` y `trust_remote_code=True`, en bfloat16. Se trata de un modelo base, no de un asistente ajustado por instrucciones, y su checkpoint corresponde al paso de optimizador 109.200, con 28.626.124.800 objetivos de predicción procesados (el autor advierte que el nombre del directorio de origen puede contener "100b", pero la cifra autoritativa es la de `tokens_seen`).

Su relevancia es acotada y fundamentalmente investigadora: demuestra que un sistema causal multi-malla heterogéneo puede aprender texto autorregresivo coherente sin atención, pero el propio autor deja claro que el lanzamiento no establece equivalencia formal con elementos finitos, ni superioridad frente a Transformers, ni mejor perplejidad o throughput, ni razonamiento autónomo. Los resultados de evaluación auditados son propios de un modelo base pequeño y poco entrenado (MMLU 5-shot 25,05; HellaSwag acc 29,00; LAMBADA perplexity 1.707,25), lo que sitúa el interés del artefacto en el plano arquitectónico y experimental más que en el de la aplicación productiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de operadores causales multi-malla sin atencion, de inspiracion FEM; multiples representaciones del texto (Binary16, Structured Binary Tiles, glifo/forma, jerarquia causal gruesa, campo latente de trabajo) con solvers ConvGLU iterativos compartidos |
| Parametros totales | 1.726.969.344 valores de tensor almacenados en safetensors; aproximadamente 1.675.064.832 parametros mas 51.904.512 valores de bufer fijo |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (definida por `config.block_size`; el autor no publica el valor numerico) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni similar; la carga de referencia usa bfloat16) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | no disponible (no figura en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | safetensors (repo de 6,9 GB) con codigo personalizado que requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura representa el mismo texto en cinco campos simultaneos: un campo fino de tokens Binary16 con coordenadas congeladas e inyectivas, Structured Binary Tiles de corto alcance sin perdida, un campo de glifo/forma con observaciones deterministas, una jerarquia causal gruesa y un campo latente de trabajo (scratch cells). La propagacion entre escalas se hace mediante operadores explicitos de restriccion y prolongacion, y el calculo se resuelve con solvers ConvGLU iterativos compartidos entre campos. No existe atencion ni cache KV: cada paso de generacion recalcula el contexto activo completo. Un bloque grueso completado solo puede afectar a posiciones de token posteriores, lo que garantiza la causalidad. El codebook de formas congelado se almacena dentro de `model.safetensors` y no se reconstruye al cargar.

El checkpoint publicado corresponde al paso de optimizador 109.200 y a 28.626.124.800 objetivos de prediccion procesados (aproximadamente 28,6 millares de millones), con hash de pesos `935b2665ecc9d365231ae798916d44eb9477bdf16a5e9ec74f0374d8e48f4c12`. No se documentan en la informacion disponible la composicion del dataset, el uso de RLHF/DPO ni tecnicas de decodificacion especulativa; el autor unicamente indica que la API de perdida de entrenamiento usa etiquetas desplazadas externamente y que la evaluacion estandar debe consumir logits en lugar de esa perdida.

## Capacidades

- Generacion de texto autoregresiva basica en modo base model (continuacion de texto, no dialogo instruido).
- Modelado de lenguaje causal sin atencion: es su capacidad central y su objeto de estudio.
- Representacion multiescala del mismo texto mediante discretizaciones heterogeneas (Binary16, tiles binarios, glifo/forma, jerarquia gruesa).
- Inferencia por logits y generacion de referencia mediante `model.generate_simple(input_ids, max_new_tokens, temperature, eos_token_id)`.
- Soporte de tool calling / function calling: no disponible (no se menciona ni se implementa).
- Soporte de agentes y razonamiento multi-paso: no disponible (el autor niega explicitamente razonamiento autonomo).
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidad especial: modo "thinking" o vision/audio no disponibles; la unica peculiaridad funcional es el sistema multi-malla sin atencion.

## Casos de uso

- Investigacion en modelado de lenguaje sin atencion: permite estudiar si un sistema causal multi-malla puede aprender texto coherente sin mecanismo de atencion, comparando su curva de perdida y sus logits con los de un Transformer de tamano similar.
- Estudio de coordenadas de token congeladas: el modelo usa un campo Binary16 inyectivo fijo, util para experimentos sobre tokenizacion alternativa y su efecto en la calidad de la representacion.
- Experimentos con discretizaciones heterogeneas del texto: los Structured Binary Tiles y el campo de glifo/forma permiten analizar como distintas representaciones de la misma secuencia contribuyen a la prediccion.
- Investigacion sobre operadores de transferencia causal: los operadores explicitos de restriccion y prolongacion y la jerarquia causal gruesa son un banco de pruebas para teorizar sobre propagacion de informacion entre escalas.
- Reproduccion y auditoria de resultados: la model card publica hash de pesos, paso de optimizador y una bateria de benchmarks auditados, lo que facilita replicar las evaluaciones en un entorno controlado.
- Desarrollo de harness de evaluacion: dado que la perdida de entrenamiento usa etiquetas desplazadas externamente y que la inferencia por lotes con padding no es fiable, el modelo sirve para probar rutinas de evaluacion que consuman logits con tamano de lote 1.
- Docencia y divulgacion: util como ejemplo didactico de arquitectura no Transformer en cursos de arquitecturas de modelos de lenguaje, siempre que se presenten sus limitaciones y sus cifras reales.
- Punto de partida para ajuste fino experimental: al ser un base model, puede reentrenarse o ajustarse para explorar como se comportan los operadores multi-malla en tareas concretas; conviene recordar que no hay licencia declarada.

## Benchmarks y rendimiento

Resultados auditados publicados por el autor para el modelo causal Multi-Mesh aislado, sin elementos de documento externos ni llamadas a VM habilitadas:

| Benchmark | Resultado |
|---|---|
| HellaSwag acc | 29,00 ± 0,45 |
| HellaSwag acc_norm | 30,77 ± 0,46 |
| ARC-Easy acc | 53,37 ± 1,02 |
| ARC-Easy acc_norm | 47,14 ± 1,02 |
| ARC-Challenge acc | 21,59 ± 1,20 |
| ARC-Challenge acc_norm | 23,55 ± 1,24 |
| PIQA acc | 62,95 ± 1,13 |
| PIQA acc_norm | 62,62 ± 1,13 |
| WinoGrande acc | 49,33 ± 1,41 |
| OpenBookQA acc | 19,60 ± 1,78 |
| OpenBookQA acc_norm | 31,20 ± 2,07 |
| CommonsenseQA acc | 18,59 ± 1,11 |
| MMLU 0-shot | 23,95 ± 0,36 |
| MMLU 5-shot | 25,05 ± 0,36 |
| LAMBADA accuracy | 4,87 ± 0,30 |
| LAMBADA perplexity | 1.707,25 ± 82,56 |
| WikiText word perplexity | 65,02 |
| WikiText byte perplexity | 2,18 |
| WikiText bits/byte | 1,13 |

No se proporcionan en la informacion disponible resultados comparativos con otros modelos ni ejecuciones propias. El autor advierte expresamente que estas puntuaciones no demuestran superioridad frente a un Transformer.

## Requisitos de hardware

- VRAM estimada para pesos: en bfloat16, aproximadamente 3,4 GB (1.726.969.344 valores a 2 bytes por valor); en float32, aproximadamente 6,9 GB, coherente con el tamano de repo declarado de 6,9 GB.
- Memoria adicional de activaciones: al no existir cache KV, el ahorro de memoria de cache se compensa con el recalculo del contexto activo en cada paso, de modo que el pico de activaciones depende del valor de `config.block_size`, que no se publica.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en bfloat16, como una RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 o RTX 4090; en centros de datos, A100, H100, L40S o similares, aunque el modelo queda muy sobredimensionado para ellas.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas en bfloat16, siempre que se respete el tamano de lote 1.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via de referencia. No hay soporte publicado para vLLM, TGI, llama.cpp u Ollama; sin variantes GGUF ni implementacion de cache KV, los servidores de inferencia de alto rendimiento no son aplicables sin desarrollo adicional.
- Inferencia por lotes: no soportada de forma fiable con padding; el autor recomienda tamano de lote 1 para evaluacion.
- Latencia y throughput: no disponibles. Dado el recalculo completo del contexto en cada token generado, el coste por token crece con la longitud de contexto, por lo que el throughput esperable es inferior al de un Transformer con cache KV del mismo tamano.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento de alternativas con los que contrastar este modelo. Como referencia interna, el propio autor indica que los resultados obtenidos no establecen superioridad sobre un Transformer, por lo que cualquier comparacion deberia realizarse con una evaluacion propia y reproducible antes de extraer conclusiones.

## Limitaciones y advertencias

- Es un modelo base, no un asistente ajustado por instrucciones: no cabe esperar respuestas utiles a peticiones conversacionales ni seguimiento de instrucciones.
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso declarado; el autor niega explicitamente el razonamiento autonomo.
- Rendimiento muy bajo en los benchmarks publicados (MMLU 5-shot 25,05; HellaSwag acc 29,00; LAMBADA accuracy 4,87; LAMBADA perplexity 1.707,25), lo que anticipa una calidad de generacion limitada y un riesgo alto de texto incoherente o irrelevante.
- Riesgo elevado de alucinacion y de deriva semantica, coherente con el nivel de entrenamiento y con las metricas publicadas.
- Longitud de contexto no publicada: queda definida por `config.block_size` y el autor no indica su valor, por lo que no puede planificarse el uso con secuencias largas.
- Idiomas soportados no declarados: no puede asumirse un comportamiento correcto en castellano ni en ningun otro idioma concreto.
- Sin cache KV: la generacion recalcula el contexto activo en cada paso, lo que penaliza la latencia y el coste de calculo en secuencias largas.
- Inferencia por lotes con padding no fiable: obliga a tamano de lote 1, lo que limita el throughput en produccion.
- La API de perdida de entrenamiento usa etiquetas desplazadas externamente; la evaluacion debe consumir logits, no esa perdida, para evitar comparaciones erroneas.
- Licencia no disponible: no se concede explicitamente ningun derecho de uso, incluido el comercial, por lo que su utilizacion en produccion es juridicamente arriesgada sin aclaracion previa del autor.
- Requiere ejecutar codigo personalizado con `trust_remote_code=True`, lo que implica auditar el repositorio antes de cargarlo en entornos sensibles.
- Sesgos conocidos: no documentados por el autor; no hay informacion disponible sobre composicion del dataset ni sobre evaluaciones de sesgo.
- El autor prohibe explicitamente el uso para decisiones de alto impacto.
- Las fechas de creacion y actualizacion indicadas en el repositorio (2026-09-26 y 2026-09-26) son posteriores a la fecha habitual de publicacion y conviene verificarlas.
- La model card usa terminologia FEM de forma metaforica: no implementa ni resuelve ninguna EDP fisica de elementos finitos, pese a la inspiracion nominal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/E6E831728/fem-multi-mesh-1p7b
- Perfil del autor en HuggingFace: https://huggingface.co/E6E831728
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
