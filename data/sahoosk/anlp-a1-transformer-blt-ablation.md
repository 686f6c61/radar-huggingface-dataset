# sahoosk/anlp-a1-transformer-blt-ablation

## Resumen

El modelo `sahoosk/anlp-a1-transformer-blt-ablation` es un artefacto academico desarrollado como parte de una asignatura de Procesamiento de Lenguaje Natural Avanzado (ANLP). Implementa un transformer encoder-decoder construido completamente desde cero, sin utilizar los modulos `nn.Transformer` ni `nn.MultiheadAttention` de PyTorch, y lo evalua en una tarea de descifrado a nivel de caracteres: decodificar secuencias binarias (cifradas como caracteres ASCII `0` y `1`) en texto legible.

La relevancia de este modelo reside en su diseno experimental: presenta cinco configuraciones arquitectonicas (C1 a C5) donde cada una modifica exactamente un componente respecto a la base C1, permitiendo medir de forma aislada el impacto de cuatro innovaciones: embeddings posicionales rotatorios (RoPE), atencion grouped-query, normalizacion RMSNorm y tokenizacion Byte Latent Transformer (BLT) sin tokens. La configuracion C5, que implementa BLT con parcheado dinamico basado en entropia, obtiene los mejores resultados con un 99,80 % de precision de bits y un 99,40 % de precision de secuencia.

Se trata de un modelo pequeno (entre 5,16 y 8,81 millones de parametros segun la configuracion) con licencia MIT, pensado como material de investigacion y docencia mas que como un sistema listo para produccion. No registra descargas ni valoraciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer construido desde cero (sin `nn.Transformer` ni `nn.MultiheadAttention`) |
| Parametros totales | 5,16 M (C3) a 8,81 M (C5) segun configuracion |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de descifrado a nivel de caracteres) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (.pt) con state_dict, argumentos y configuracion |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder clasico implementado desde cero. La configuracion base C1 utiliza embeddings posicionales sinusoidales absolutos, atencion multi-cabeza estandar, normalizacion LayerNorm y tokenizacion subword mediante BPE a nivel de bytes. Las configuraciones C2 a C5 alteran exactamente un componente cada una: C2 sustituye los posicionales por RoPE, C3 cambia la atencion a grouped-query, C4 reemplaza LayerNorm por RMSNorm y C5 sustituye la tokenizacion BPE por BLT.

La configuracion C5 (BLT) es la mas innovadora: empaqueta cada 8 bits del texto cifrado en un valor de byte 0-255, de modo que un segmento de 256 caracteres se convierte en 32 bytes. El parcheado es dinamico y se basa en la entropia condicional de orden 2 de un modelo n-grama de bytes entrenado solo sobre el split de entrenamiento; un nuevo parche se abre cuando la entropia supera un umbral θ calibrado para una longitud media de parche objetivo. No se entrena ningun modelo de lenguaje neuronal separado para la estimacion de entropia. Una embedding aprendida de 256 entradas representa los valores de byte.

El entrenamiento utiliza una division fija 80/10/10 a nivel de documento con semilla 42, decodificacion greedy para evaluacion y los mismos hiperparametros (d_model, profundidad, tasa de aprendizaje, tamano de lote) en las cinco configuraciones, de modo que solo difiere el componente estudiado.

## Capacidades

- Descifrado de secuencias binarias: el modelo decodifica texto cifrado representado como caracteres ASCII `0` y `1` en texto legible, con una precision de secuencia del 99,40 % en la mejor configuracion (C5).
- Estudio de ablaciones: permite comparar de forma aislada el impacto de RoPE, grouped-query attention, RMSNorm y tokenizacion BLT sobre una misma tarea y con los mismos hiperparametros.
- Tokenizacion sin tokens (BLT): la configuracion C5 implementa parcheado dinamico de bytes basado en entropia, sin vocabulario de tokens, siguiendo la arquitectura Byte Latent Transformer propuesta por Meta AI.
- Reproducibilidad: incluye checkpoints, configuraciones exactas de CLI, metricas de test y modelos de entropia para cada configuracion.
- Carga de checkpoints documentada: se proporciona codigo Python de ejemplo para reconstruir el modelo y cargar los pesos.
- No soporta generacion de texto general, razonamiento, codigo, vision, tool calling ni capacidades de agente.

## Casos de uso

- Investigacion academica en arquitecturas de atencion: el conjunto de configuraciones permite reproducir y extender los resultados de la ablacion, por ejemplo anadiendo nuevas variantes sobre la base C1 y comparando metricas con las publicadas.
- Docencia en PLN: sirve como ejemplo completo de implementacion de un transformer desde cero, con codigo de entrenamiento y evaluacion, util para cursos de arquitecturas neuronales que necesiten un caso de estudio real.
- Evaluacion de tecnicas de tokenizacion: la comparacion C1 (BPE a nivel de bytes) frente a C5 (BLT sin tokens) permite cuantificar el beneficio del parcheado basado en entropia en una tarea de descifrado, con datos concretos de precision y memoria.
- Prototipado de decodificacion de cifrados simples: el modelo puede adaptarse como punto de partida para tareas de criptoanalisis de cifrados de sustitucion a nivel de caracteres, dado que ya resuelve una variante de este problema con alta precision.
- Benchmark de eficiencia de memoria: las metricas de pico de memoria (483-732 MB) permiten estudiar el coste de cada componente arquitectonico en entornos con recursos limitados, util para decidir que configuracion desplegar en hardware restringido.
- Investigacion sobre patching dinamico: el modelo de entropia de orden 2 y el umbral θ calibrado pueden reutilizarse para experimentos sobre segmentacion de secuencias en otras tareas, como compresion o modelado de bytes.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la tarea de descifrado a nivel de caracteres, con decodificacion greedy y la misma division de datos (80/10/10, semilla 42) para las cinco configuraciones:

| Configuracion | Cambio respecto a C1 | Precision de bits (%) | Precision de secuencia (%) | Levenshtein | Parametros (M) | Pico de memoria (MB) |
|---|---|---|---|---|---|---|
| C1 | Base | 99,25 | 92,00 | 0,12 | 6,05 | 521 |
| C2 | Posicionales → RoPE | 99,80 | 97,00 | 0,34 | 6,05 | 521 |
| C3 | Atencion → Grouped-Query | 99,03 | 89,18 | 0,17 | 5,16 | 508 |
| C4 | Normalizacion → RMSNorm | 99,36 | 93,25 | 0,10 | 6,04 | 483 |
| C5 | Tokenizacion → BLT | 99,80 | 99,40 | 0,005 | 8,81 | 732 |

La configuracion C5 (BLT) es la que mejor rendimiento obtiene en precision de secuencia (99,40 %) y distancia de Levenshtein (0,005), aunque con el mayor coste en parametros (8,81 M) y memoria (732 MB). La configuracion C3 (grouped-query attention) es la unica que empeora respecto a la base C1 en precision de secuencia (89,18 % frente a 92,00 %), aunque reduce parametros a 5,16 M. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Pico de memoria durante inferencia: entre 483 MB (C4) y 732 MB (C5), segun las metricas publicadas en la model card.
- El modelo cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) e incluso en CPU, dado su reducido tamano (menos de 9 M de parametros).
- No se especifican requisitos minimos de VRAM ni GPU recomendadas en la informacion disponible.
- Los checkpoints se cargan con PyTorch estandar; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- La inferencia con decodificacion greedy es rapida en hardware convencional dado el tamano del modelo, aunque no se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la misma tarea de descifrado con ablaciones identicas. Como referencia arquitectonica, la configuracion C5 implementa la arquitectura Byte Latent Transformer (BLT) propuesta por Meta AI en el articulo "Byte Latent Transformer: Patches Scale Better Than Tokens" (arXiv:2412.09871), que a escala mucho mayor (miles de millones de parametros) demuestra que el parcheado dinamico por entropia iguala el rendimiento de los modelos basados en tokenizacion con mayor eficiencia de inferencia.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| anlp-a1 C1 (base) | 6,05 M | no disponible | Descifrado de caracteres | MIT |
| anlp-a1 C5 (BLT) | 8,81 M | no disponible | Descifrado de caracteres | MIT |
| BLT (Meta AI, paper) | miles de millones | no disponible | Modelado de lenguaje a gran escala | no disponible |

## Limitaciones y advertencias

- Modelo academico: es el resultado de una practica de asignatura, no un sistema listo para produccion. No ha sido evaluado en tareas generales de lenguaje.
- Tamano reducido: con menos de 9 M de parametros, su capacidad de generalizacion fuera de la tarea de descifrado es muy limitada.
- Tarea especifica: el modelo solo ha sido entrenado y evaluado en descifrado de secuencias binarias a nivel de caracteres; no soporta generacion de texto general, codigo, razonamiento ni tool calling.
- Sin datos de idiomas: no se especifican idiomas soportados; la tarea opera sobre representaciones de bytes, no sobre lenguaje natural directamente.
- Sin cuantizacion: no se proporcionan pesos en formatos cuantizados (GGUF, GPTQ, etc.), solo checkpoints PyTorch.
- Riesgo de alucinacion: al ser un modelo pequeno entrenado en una tarea estrecha, no es adecuado para tareas generativas abiertas.
- Fecha de creacion inusual: el modelo fue creado el 2 de septiembre de 2026, lo que puede indicar un error de fecha o un artefacto generado automaticamente; conviene verificar la procedencia antes de usarlo en investigacion.
- Sin metricas de sesgo: no se han realizado evaluaciones de sesgos ni de robustez ante entradas adversariales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahoosk/anlp-a1-transformer-blt-ablation
- Articulo BLT original: https://arxiv.org
