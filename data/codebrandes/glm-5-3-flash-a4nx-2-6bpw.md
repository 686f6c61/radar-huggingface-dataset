# codebrandes/GLM-5.3-Flash-A4NX-2.6bpw

## Resumen

GLM-5.3-Flash-A4NX-2.6bpw es una cuantizacion EXL3 del modelo multimodal GLM-5.3-Flash de Z.ai (zai-org), publicada por el usuario codebrandes. Se trata de un checkpoint de aproximadamente 109 GB que conserva el modelo completo: entrada de texto, imagen y video, la capa MTP (multi-token prediction) y la ventana de contexto íntegra. Su particularidad es el uso de un codebook trellis propio llamado A4NX (originalmente Q4NX) para los expertos enrutados, que representan el 97 % de los parámetros, disenado para ejecutarse sobre los tensor cores INT8 de las GPU NVIDIA CMP 170HX.

El modelo base es un transformer con arquitectura MoE (mixture of experts) de 321.300 millones de parámetros totales, de los cuales el repositorio safetensors declara 54.412.707.934 parámetros almacenados. La cuantizacion reduce el peso a 2,6 bits por peso (excluyendo el LM head), lo que permite servir un modelo de este tamano en dos tarjetas CMP 170HX, hardware de mineria reconvertido con 8 GB de HBM2e por tarjeta y arquitectura Ampere (sm_80).

La relevancia de esta ficha es doble: por un lado, demuestra una via de despliegue de modelos MoE multimodales de gran tamano en hardware de bajo coste; por otro, el codebook A4NX introduce una innovacion tecnica concreta (decodificacion entera directa a operandos INT8) que acelera los kernels de expertos entre 1,45 y 1,59 veces en decodificacion y reduce el prefill de una capa MoE de 23,7 ms a 9,9 ms. La contrapartida es que solo funciona con un build especifico de vLLM, no con exllamav3 estandar, TabbyAPI ni vLLM upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto, imagen y video) con capa MTP; cuantizacion EXL3 con codebook trellis A4NX en expertos enrutados |
| Parametros totales | 321.300 millones (modelo base); 54.412.707.934 parametros almacenados en safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | completa, segun la model card (valor numerico no disponible) |
| Tipos de cuantizacion | EXL3 2,6 bpw (2,71 bpw contando los 321,3 B de parametros; 2,52 bpw solo expertos enrutados); expertos enrutados capas 4-44 a 2,5 bits con A4NX; expertos capa 3 a 3,5 bits con `mul1`; atencion, proyecciones MLA, indexer, expertos compartidos, MLPs densos (capas 0-2) y LM head a 6 bits con `mul1`; capa MTP a 4 bits; vision tower a 6 bits; copia INT8 opcional de pesos densos en `int8/dense.safetensors` (7,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3), libreria vLLM |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer con mezcla de expertos (MoE) y capacidad multimodal image-text-to-text. La model card de esta cuantizacion no detalla la composicion del dataset de entrenamiento original ni si hubo etapas de RLHF o DPO; esa informacion corresponde a la model card del modelo base, no incluida en la informacion disponible.

La innovacion tecnica de este checkpoint es el codebook A4NX. EXL3 almacena los pesos como un trellis de desplazamiento de bits sobre teselas de 16×16 tras rotaciones de Hadamard, y el codebook convierte cada estado del trellis en valores de peso. El codebook por defecto, `mul1`, usa un estado de 16 bits, multiplica por una constante, suma los cuatro bytes del resultado y mapea la suma a un valor FP16; esto obliga a aritmetica FP16 antes de usar cada peso y limita el rendimiento a los tensor cores FP16. A4NX cambia ese mapeo en cuatro puntos: una misma multiplicacion produce una palabra de 32 bits de la que se leen ocho nibbles en pares, generando cuatro pesos por multiplicacion (cada paso del trellis cubre cuatro pesos, 10 bits a 2,5 bpw); cada peso es un entero de -15 a 15, operando exacto de tensor core INT8, con la escala aplicada una sola vez al resultado acumulado; el estado crece de 16 bits a 32 menos el tamano de paso (22 bits a 2,5 bpw), lo que da mas libertad al codificador y recupera parte de la precision perdida por los valores enteros; y los valores de tesela se almacenan en el orden del fragmento de operando del tensor core (`m16n8k16`), de modo que cada hilo decodifica sus registros sin reordenaciones.

La conversion se realizo desde el release original en FP8 (`zai-org/GLM-5.3-Flash`, revision `46a050be`) con exllamav3 1.6.6 y la rama `a4nx` del fork del autor. La calibracion uso 719 filas de 2.048 tokens: 250 provenientes de una traza de chat autogenerada por turboderp para GLM-5.3-Flash y 469 de las fuentes incluidas en exllamav3 (172 de codigo, 150 de Wikipedia, 88 de C4, 33 tecnicas y 26 multilingues).

## Capacidades

- Generacion de texto conversacional con contexto largo, conservando la ventana completa del modelo base.
- Entrada multimodal: procesamiento de imagen y video ademas de texto, gracias al vision tower cuantizado a 6 bits.
- Prediccion multi-token (capa MTP) preservada, lo que habilita decodificacion especulativa en el motor de inferencia.
- Razonamiento y codigo heredados del modelo base GLM-5.3-Flash; el checkpoint no documenta evaluaciones propias de estas capacidades.
- Soporte de tool calling y function calling: no documentado en la model card de esta cuantizacion.
- Soporte de agentes y razonamiento multi-paso: no documentado en la model card de esta cuantizacion.
- Capacidades multilingues: el dataset de calibracion incluye 26 filas multilingues, pero no se especifica la cobertura de idiomas del modelo.
- Ejecucion de expertos enrutados sobre tensor cores INT8 mediante el codebook A4NX, con pesos densos servibles en INT8 o en EXL3 de 6 bits.

## Casos de uso

- Despliegue de un MoE multimodal de 321.000 millones de parametros en hardware de bajo coste: dos CMP 170HX (8 GB HBM2e cada una) sirven el checkpoint completo a 2,6 bpw, lo que permite experimentar con modelos de gran escala sin invertir en A100 o H100.
- Laboratorio de investigacion en cuantizacion: el checkpoint y el codebook A4NX documentado en `doc/a4nx.md` sirven como referencia reproducible para estudiar el impacto de codebooks trellis enteros en la calidad y la velocidad de modelos MoE.
- Procesamiento de documentos con imagen y texto: al conservar el vision tower, el modelo puede recibir capturas, diagramas o fotogramas de video junto a instrucciones textuales en un mismo prompt.
- Analisis de video o imagenes con contexto largo: la ventana completa del modelo base permite adjuntar secuencias extensas de fotogramas o transcripciones sin truncar.
- Generacion asistida por LLM en pipelines internos: la licencia MIT facilita integrar el checkpoint en herramientas de desarrollo y flujos de CI/CD, siempre que se use el build de vLLM especifico.
- Evaluacion comparativa de motores de inferencia: util para medir el rendimiento de kernels EXL3 frente a kernels INT8 en sm_80, replicando las cifras de prefill y decodificacion publicadas por el autor.
- Servicio de chat con decodificacion especulativa: la capa MTP conservada permite acelerar la generacion en el motor que soporte A4NX.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). Solo incluye mediciones de velocidad de los kernels de expertos enrutados en una tarjeta CMP 170HX, con capas reales del modelo a 2,5 bpw:

| Medicion | `mul1` | A4NX |
|---|---:|---:|
| Prefill, una llamada a capa MoE con 2.048 tokens | 23,7 ms | 9,9 ms |
| Decodificacion, 1-8 filas por llamada (regimen de servicio) | 1× | 1,45-1,59× |

Datos de hardware citados en la model card: los tensor cores INT8 de la CMP 170HX rinden aproximadamente 1,5 veces mas que los FP16 (189-200 TOPS frente a 115-137 TFLOPS).

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 109 GB; el autor lo sirve en dos NVIDIA CMP 170HX con 8 GB de HBM2e cada una, lo que implica un reparto por capas y un margen ajustado para la cache KV. La copia INT8 de pesos densos anade aproximadamente 1 GB por tarjeta respecto a los tensores EXL3 de 6 bits, reduciendo el espacio disponible para KV cache.
- GPU recomendadas: NVIDIA CMP 170HX (sm_80) es el unico hardware probado. El autor senala que el mismo razonamiento aplica a otras GPU sm_80 (por ejemplo A100), pero no se han probado.
- GPU de consumo: no hay datos de despliegue en GPU consumer; el checkpoint de 109 GB no cabe en una RTX 4090 (24 GB) ni en configuraciones consumer habituales.
- Opciones de despliegue: exclusivamente el build de vLLM para CMP 170HX descrito en `AlexBrandes/cmp170hx-glm53-flash-exl3`. exllamav3 estandar, TabbyAPI y vLLM upstream no pueden cargar el checkpoint porque no incluyen kernels A4NX. La variable `VLLM_EXL3_DENSE_W8` activa el uso de la copia INT8 de pesos densos; sin ella, el motor ejecuta los tensores de 6 bits con kernels EXL3 a menor velocidad.
- Latencia y throughput: solo se conocen las cifras de kernels por capa indicadas en la seccion de benchmarks; no se publican cifras de extremo a extremo (tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-A4NX-2.6bpw (este) | 321,3 B totales | completa (valor no disponible) | EXL3 2,6 bpw con A4NX | MIT | Hugging Face, requiere vLLM CMP 170HX |
| zai-org/GLM-5.3-Flash (base) | 321,3 B totales | completa (valor no disponible) | FP8 | no disponible en la informacion | Hugging Face |
| GLM-5.3-Flash-e... (EXL3 de turboderp) | 321,3 B totales | completa (valor no disponible) | EXL3 estandar | no disponible en la informacion | Hugging Face; compatible con exllamav3/TabbyAPI |

La comparativa de rendimiento frente a la cuantizacion EXL3 de turboderp queda truncada en la model card proporcionada, por lo que no se dispone de cifras de calidad comparadas. No se dispone de datos de otros modelos de la misma categoria en la informacion suministrada.

## Limitaciones y advertencias

- Compatibilidad restringida: solo carga en el build de vLLM para CMP 170HX; no funciona en exllamav3 estandar, TabbyAPI ni vLLM upstream.
- Hardware especifico: disenado y ajustado para CMP 170HX (sm_80); otras GPU Ampere no han sido probadas y podrian requerir trabajo adicional de kernels.
- Margen de VRAM muy ajustado: 109 GB de pesos en 16 GB totales de HBM implican reparto por capas y poca cache KV; la copia INT8 de pesos densos reduce aun mas ese margen.
- Riesgo de alucinacion: no evaluado en la model card; se hereda el comportamiento del modelo base, sin datos de benchmarks de calidad.
- Sesgos: no documentados en la informacion disponible.
- Cobertura de idiomas: no disponible; la calibracion incluye solo 26 filas multilingues, lo que puede sesgar la cuantizacion hacia ingles y codigo.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre la calidad tras la cuantizacion a 2,6 bpw.
- Nomenclatura: el codebook se publico como Q4NX el 2026-11-18 y se renombro a A4NX el 2026-11-23; la revision `799c91c` conserva el marcador antiguo `q4nx` y el motor acepta ambos.
- Madurez: 58 descargas y 0 likes en el momento de la consulta, con una unica receta de despliegue mantenida por el autor; no es un artefacto con soporte de la comunidad amplia.

## Enlaces

- Hugging Face: https://huggingface.co/codebrandes/GLM-5.3-Flash-A4NX-2.6bpw
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Receta de despliegue: https://github.com/AlexBrandes/cmp170hx-glm53-flash-exl3
- Especificacion del formato A4NX: https://github.com/AlexBrandes/exllamav3/blob/a4nx/doc/a4nx.md
- Fork de exllamav3 con A4NX: https://github.com/AlexBrandes/exllamav3/tree/a4nx
