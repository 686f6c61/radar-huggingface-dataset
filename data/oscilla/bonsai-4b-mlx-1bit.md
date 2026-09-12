# Oscilla/Bonsai-4B-mlx-1bit

## Resumen

Bonsai-4B-mlx-1bit es un modelo de lenguaje de 4.000 millones de parametros cuantizado integramente a 1 bit (formato MLX 1-bit g128) y publicado en HuggingFace por el usuario Oscilla, tomando como base `prism-ml/Bonsai-4B-unpacked` de Prism ML. La relevancia del modelo esta en que la cuantizacion a 1 bit no se limita a las proyecciones del transformer, sino que cubre embeddings, proyecciones de atencion, proyecciones del MLP y la cabeza LM, de modo que el modelo completo ocupa 0,63 GB en disco, un 92,2 % menos que su equivalente en FP16 (8,04 GB). Esto permite ejecutar inferencia local en un Mac o incluso en un iPhone sin materializar pesos en FP16 durante el calculo.

La arquitectura subyacente es la de Qwen3-4B en variante dense: 36 bloques decodificadores, atencion con GQA de 32 cabezas de consulta y 8 de clave/valor, MLP SwiGLU, RoPE y RMSNorm, con una longitud de contexto de 32.768 tokens y un vocabulario de 151.936 entradas. El objetivo declarado es el despliegue en dispositivo (on-device) sobre Apple Silicon mediante MLX, con un companero en formato GGUF Q1_0_g128 para llama.cpp, y con cifras declaradas de 4,8 veces mas velocidad en un M4 Pro y 60 tokens por segundo en un iPhone.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su integracion comercial, pero requiere forks especificos de MLX, mlx-swift y llama.cpp mantenidos por Prism ML que todavia no han sido fusionados en los repositorios upstream. La model card no incluye resultados de benchmarks, tareas de evaluacion ni listado de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder dense basado en Qwen3-4B: GQA (32 cabezas de consulta / 8 de clave-valor), MLP SwiGLU, RoPE, RMSNorm |
| Parametros totales | 4,0 B (~3,6 B excluyendo embeddings); el repositorio declara 188.708.056 elementos almacenados en safetensors, cifra que corresponde al empaquetado a 1 bit, no al numero logico de pesos |
| Parametros activos | No aplica (modelo dense, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 1-bit g128 (1 bit por peso, una escala FP16 por grupo de 128 pesos). Equivalencias: MLX 1-bit g128 = 1,25 bpw; GGUF Q1_0_g128 = 1,125 bpw |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors empaquetados a 1 bit); existe variante GGUF Q1_0_g128 en `prism-ml/Bonsai-4B-gguf` |
| Capas | 36 bloques decodificadores |
| Tamano de vocabulario | 151.936 tokens |
| Cobertura de la cuantizacion a 1 bit | Embeddings, proyecciones de atencion, proyecciones del MLP y cabeza LM |
| Huella en disco | 0,63 GB de pesos (0,64 GB de directorio completo con tokenizer y metadatos) |
| Libreria | mlx |
| Fecha de publicacion (metadatos) | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card describe la arquitectura como Qwen3-4B dense, con 36 bloques transformer, atencion con grouped-query attention de 32 cabezas de consulta frente a 8 de clave/valor, MLP SwiGLU, codificacion posicional RoPE y normalizacion RMSNorm. El repositorio no detalla el proceso de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta el proceso de cuantizacion posterior al entrenamiento (calibracion de las escalas por grupo, criterios de seleccion de pesos, etc.).

La innovacion tecnica principal es el esquema de cuantizacion a 1 bit con granularidad de grupo de 128. Cada peso se reduce a un unico bit: el valor `0` se mapea a `−scale` y el valor `1` a `+scale`, compartiendo un grupo de 128 pesos una unica escala en FP16. Como el formato nativo de cuantizacion de MLX almacena una escala y un sesgo por grupo (`w = mlx_scale * bit + mlx_bias`), la conversion se realiza con `mlx_scale = 2 * original_scale` y `mlx_bias = −original_scale`, lo que reconstruye los valores ±scale. Este empaquetado hace que el coste efectivo sea de 1,25 bits por peso (1 bit de signo mas dos valores FP16 amortizados entre 128 pesos), ligeramente superior al 1,125 bpw del formato GGUF Q1_0_g128, que solo almacena una escala por grupo. El modelo implementa kernels de desquantizacion en linea, de modo que los pesos en FP16 nunca se materializan en memoria durante la inferencia.

## Capacidades

- Generacion de texto conversacional en ingles (los ejemplos de la model card estan en ese idioma), con plantilla de chat compatible con Qwen3 y prompt de sistema simple.
- Razonamiento y respuesta a instrucciones de proposito general, heredado del modelo base Qwen3-4B.
- Generacion de codigo y resolucion de problemas matematicos basicos por herencia de la arquitectura Qwen3, aunque la model card no aporta evaluaciones que lo confirmen.
- Ejecucion en dispositivo: el modelo esta disenado para inferencia local en Apple Silicon (Mac, iPhone, iPad) mediante MLX y MLX Swift, y en CUDA/Metal mediante el fork de llama.cpp con soporte GGUF.
- Integracion nativa con `mlx-lm` para carga y generacion en Python.
- Capacidades de tool calling, function calling, agentes, vision, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales locales en macOS: el modelo ocupa 0,63 GB, por lo que cabe en la memoria unificada de cualquier Mac con chip Apple Silicon y permite mantener conversaciones multi-turno sin conexion a internet ni envio de datos a terceros.
- Aplicaciones de chat en iPhone e iPad: con 60 tokens por segundo declarados y una huella de menos de 1 GB, es viable integrarlo mediante MLX Swift y la aplicacion Locally AI para asistentes de bolsillo con procesamiento 100 % local.
- Analisis de documentos largos en local: la ventana de 32.768 tokens permite procesar informes, contratos o articulos completos en una sola pasada dentro de un portatil, algo inviable con modelos densos de 4B en FP16 en equipos con 8 GB de RAM.
- Clasificacion y extraccion de informacion por lotes: al ser un modelo pequeno y rapido, resulta adecuado para etiquetar grandes volumenes de texto (categorizacion de tickets, extraccion de entidades simples) en una maquina de sobremesa, sin coste de API.
- Prototipado e investigacion sobre cuantizacion extrema: sirve como banco de pruebas para estudiar la degradacion de calidad al llevar embeddings, atencion, MLP y cabeza LM a 1 bit, comparando contra el modelo base `prism-ml/Bonsai-4B-unpacked` en FP16.
- Generacion de texto en entornos con restricciones severas de memoria o energia: sistemas embebidos Apple, demos offline en ferias o dispositivos sin GPU dedicada, donde el presupuesto de memoria es inferior a 1 GB.
- Filtrado y preprocesado previo a modelos mayores: uso como modelo de primera etapa para resumir, reescribir o descartar contenido antes de enviarlo a un modelo de mayor capacidad, reduciendo el coste de tokens en pipelines en cascada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un apartado de rendimiento (throughput) que aparece truncado, y no contiene tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar. Las unicas cifras declaradas son de eficiencia:

| Metrica | Valor declarado |
|---|---|
| Reduccion de tamano frente a FP16 | 12,8x (0,63 GB frente a 8,04 GB) |
| Aceleracion en M4 Pro | 4,8x |
| Throughput en iPhone | 60 tokens/s |
| Memoria de pesos FP16 (referencia) | 8,04 GB |
| Memoria de pesos MLX 1-bit g128 | 0,63 GB (reduccion del 92,2 %) |
| Memoria de pesos GGUF Q1_0_g128 | 0,57 GB (reduccion del 93,0 %, ratio 14,2x) |
| Bits por peso (MLX 1-bit g128) | 1,25 bpw |
| Bits por peso (GGUF Q1_0_g128) | 1,125 bpw |

Los parametros de generacion sugeridos por el autor son temperatura 0,5 (rango 0,5-0,7), top-k 20 (rango 20-40), top-p 0,9 (rango 0,85-0,95), penalizacion por repeticion 1,0 y penalizacion por presencia 0,0.

## Requisitos de hardware

- VRAM/memoria para los pesos: 0,63 GB en formato MLX 1-bit g128 y 0,57 GB en GGUF Q1_0_g128. El directorio completo en disco ocupa aproximadamente 0,64 GB.
- Memoria para la cache KV: no indicada por el autor. Como estimacion derivada de la configuracion declarada (36 capas, 8 cabezas KV, head dim de 128 en Qwen3-4B), la cache en FP16 consumiria del orden de 0,15 MB por token, es decir, unos 4,7 GB en el peor caso con los 32.768 tokens de contexto completo. Esta cifra es una estimacion, no un dato publicado.
- GPU recomendadas: Apple Silicon (familias M1 a M4, con M4 Pro como referencia de rendimiento publicada); en el ecosistema CUDA/Metal se soporta a traves del fork de llama.cpp de Prism ML.
- Cabe en GPU de consumo: si, siempre que se use una GPU Apple Silicon o, via llama.cpp, una GPU con al menos 1 GB de VRAM libre para los pesos. Las GPU NVIDIA de consumo pueden ejecutar la variante GGUF mediante el fork correspondiente.
- Opciones de despliegue: `mlx-lm` con el fork `PrismML-Eng/mlx` (rama `prism`) para Python en Apple Silicon; `PrismML-Eng/mlx-swift` para iOS y macOS; `PrismML-Eng/llama.cpp` para CUDA y Metal; aplicacion Locally AI para iPhone; notebook de Google Colab proporcionado por el autor.
- Latencia y throughput: 4,8x mas rapido que la referencia FP16 en un M4 Pro y 60 tokens/s en iPhone, segun los datos declarados. No se especifican latencias absolutas ni throughput para hardware NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai-4B-mlx-1bit (Oscilla) | 4,0 B (~3,6 B sin embeddings) | 32.768 tokens | MLX 1-bit g128, 0,63 GB | Apache 2.0 | HuggingFace, requiere fork de MLX |
| Bonsai-4B-gguf (prism-ml) | 4,0 B | 32.768 tokens (arquitectura comun) | GGUF Q1_0_g128, 0,57 GB, 1,125 bpw | Apache 2.0 | HuggingFace, requiere fork de llama.cpp |
| Bonsai-4B-unpacked (prism-ml) | 4,0 B | 32.768 tokens (arquitectura comun) | Pesos sin empaquetar a 1 bit, tamano no disponible | Apache 2.0 | HuggingFace, modelo base declarado |
| Modelos dense de ~4B en FP16 (referencia generica) | ~4 B | No disponible | FP16, ~8 GB | Variable | Amplia, sin forks especificos |

No se dispone de datos de benchmarks que permitan comparar la calidad de salida frente a alternativas de la misma categoria. La comparativa se limita por tanto a parametros, contexto, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- La cuantizacion a 1 bit de embeddings, proyecciones y cabeza LM implica una perdida de precision muy agresiva; es previsible una degradacion notable en tareas que requieren matices, coherencia larga o conocimiento factual, aunque el autor no publica evaluaciones que cuantifiquen ese impacto.
- Riesgo de alucinacion: no hay datos de evaluacion de fidelidad ni de tasas de error, por lo que no debe asumirse fiabilidad en dominios factuales o de alta precision sin validacion propia.
- Idiomas soportados no especificados. La model card esta redactada en ingles y los ejemplos son en ingles; no hay garantia de un rendimiento aceptable en castellano.
- Dependencia de forks no fusionados: requiere `PrismML-Eng/mlx` (rama `prism`), `PrismML-Eng/mlx-swift` y `PrismML-Eng/llama.cpp`. Los PR upstream estan pendientes, lo que anade riesgo de mantenimiento y de incompatibilidad con versiones futuras de las librerias oficiales.
- El repositorio de Oscilla registra 0 descargas y 0 likes, y su fecha de publicacion es muy reciente, por lo que no existe Validacion de la comunidad ni evidencia de reproducibilidad independiente.
- Divergencia en el recuento de parametros: el dato de safetensors (188.708.056 elementos) no coincide con los 4.000 millones declarados en la model card, porque el primero cuenta los tensores empaquetados a 1 bit. Conviene no usar esa cifra como numero de parametros del modelo.
- Consumo de memoria de la cache KV no documentado; con contexto completo puede superar ampliamente el tamano de los pesos y llegar a varios GB en FP16, lo que reduce la ventaja de la cuantizacion en escenarios de contexto muy largo.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero obliga a conservar los avisos de copyright y licencia y a indicar los cambios realizados. No hay clausulas de uso aceptable especificas en la informacion disponible.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos trataban sobre alimentacion y no guardan relacion con el modelo), por lo que no hay fuentes externas que corroboren las cifras de rendimiento declaradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oscilla/Bonsai-4B-mlx-1bit
- Modelo base declarado: https://huggingface.co/prism-ml/Bonsai-4B-unpacked
- Variante GGUF: https://huggingface.co/prism-ml/Bonsai-4B-gguf
- Web de Prism ML: https://prismml.com
- Whitepaper de Bonsai (1-bit Bonsai 8B): https://github.com/PrismML-Eng/Bonsai-demo/blob/main/1-bit-bonsai-8b-whitepaper.pdf
- Repositorio de demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Notebook de Google Colab: https://colab.research.google.com/drive/1EzyAaQ2nwDv_1X0jaC5XiVC3ZREg9bdG?usp=sharing
- Discord de la comunidad: https://discord.gg/prismml
- Fork de MLX con kernels de 1 bit: https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift para iOS y macOS: https://github.com/PrismML-Eng/mlx-swift
- Fork de llama.cpp para CUDA y Metal: https://github.com/PrismML-Eng/llama.cpp
- Aplicacion Locally AI para iPhone: https://locallyai.app/
- La busqueda web no proporciono ningun enlace adicional relevante sobre el modelo.
