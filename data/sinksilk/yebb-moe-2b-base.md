# sinksilk/Yebb-MoE-2B-Base

## Resumen

Yebb MoE 2B Base es un modelo de lenguaje experimental para continuacion de texto en chino e ingles, desarrollado por el usuario de Hugging Face sinksilk (Si Chen). Se trata de un checkpoint base preentrenado, sin ajuste por instrucciones ni alineamiento de preferencias, con 1.962.164.864 parametros totales y una arquitectura de mezcla de expertos (MoE) latente sobre un transformer de 12 capas y anchura 512. El modelo se libera tras 80.000.981.551 tokens efectivos de prediccion y esta pensado para investigacion y reproducibilidad, no como asistente general validado.

La relevancia del modelo reside en su diseno poco convencional: una arquitectura muy estrecha (512 dimensiones ocultas) con 128 expertos enrutados por capa y top-2 routing, atencion con grouped-query attention y RoPE, activacion SiTU y un tokenizador BPE propio de 64.000 entradas. El autor publica los pesos en FP32, el tokenizador entrenado y una implementacion de referencia portable en PyTorch con interfaz de Hugging Face, lo que facilita la inspeccion del codigo y la reproduccion del entrenamiento.

El modelo solo soporta chino e ingles, tiene licencia MIT y su ventana de entrenamiento es de 2.048 tokens. Las comprobaciones internas del autor muestran un rendimiento limitado en aritmetica y codigo, por lo que debe tratarse como una pieza de investigacion sobre arquitecturas MoE de bajo coste y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con grouped-query attention, RoPE y mezcla de expertos latente (MoE) |
| Parametros totales | 1.962.164.864 |
| Parametros activos | 122.798.720 (convencion del autor: parametros no enrutados + 2/128 de los bancos enrutados) |
| Longitud de contexto | 2.048 tokens (longitud de secuencia de entrenamiento; no validado mas alla) |
| Tipos de cuantizacion | No disponible (solo se publican pesos FP32 en Safetensors) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors (FP32, en shards) |

Otros datos tecnicos: 12 capas, anchura 512, 8 cabezas de consulta y 2 cabezas clave/valor con dimension de cabeza 64, theta de RoPE 10.000, primera capa feed-forward densa y las 11 restantes MoE latente con 128 expertos enrutados y top-2, dimension latente de experto 384, dimension intermedia de experto 1.152, dimension intermedia compartida 768, activacion SiTU (beta 4 y beta lineal 25), tokenizador BPE byte-level propio con vocabulario de 64.000, pesos de embedding y salida no atados. Los bancos de expertos enrutados suman 1.868.562.432 parametros.

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 12 capas con anchura 512, atencion GQA (8 cabezas de consulta, 2 de clave/valor, dimension 64) y RoPE con theta 10.000. La innovacion principal es la capa feed-forward: la primera es densa y las 11 restantes son MoE latente con 128 expertos enrutados por capa y enrutamiento top-2. Cada experto proyecta a una dimension latente de 384 y opera con dimension intermedia de 1.152, mientras que existe una rama compartida de dimension 768. La activacion es SiTU con beta 4 y beta lineal 25. El tokenizador es un BPE byte-level propio de 64.000 entradas, entrenado de forma separada sobre aproximadamente 10 GB de texto.

El checkpoint corresponde al paso de entrenamiento 76.378 y su reloj de 80.000.981.551 tokens efectivos de prediccion incluye 8.738.450.000 tokens de replay explicito de la fuente de educacion en chino, por lo que no representa 80.000 millones de tokens semanticamente unicos. El desglose por fuente es: MiniMind 1.639.066.847; codigo educativo 9.547.651.891; web educativa en ingles 23.147.635.641; FineMath 5.429.393.223; reescrituras multistilo en ingles 5.786.017.839; QA en ingles 504.644.568; reescrituras multistilo en chino 4.360.380.110; web educativa en chino (incluido replay) 29.586.191.432. No se menciona RLHF ni DPO; es un checkpoint base sin alineamiento. La implementacion de referencia recalcula el prefijo y no implementa cache de clave/valor ni kernels optimizados de expertos agrupados.

## Capacidades

- Generacion y continuacion de texto en chino e ingles a partir de prompts de texto plano.
- Modelo base preentrenado: no sigue instrucciones ni mantiene formato de chat de forma fiable; la plantilla de chat no lo convierte en asistente.
- Razonamiento basico y respuesta a preguntas de opcion multiple en modo zero-shot mediante puntuacion de candidatos por log-probabilidad media.
- Capacidad limitada y poco fiable de completar funciones elementales en Python y de aritmetica basica.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Multilingue limitado a chino e ingles.
- Pesos FP32 publicados junto con tokenizador y codigo de referencia para inspeccion y reproduccion.

## Casos de uso

- Investigacion sobre arquitecturas MoE de bajo coste: el modelo permite estudiar el comportamiento de 128 expertos enrutados con top-2 en una red de solo 512 dimensiones ocultas, comparando la convencion de parametros activos (122,8 M) frente a los 1,96 B totales.
- Reproduccion de entrenamiento y auditoria: la publicacion incluye hashes de checkpoint, detalles de exportacion y el desglose completo del ledger de tokens, lo que permite verificar el paso 76.378 y la composicion del dataset.
- Pruebas de tokenizador en chino e ingles: el BPE byte-level de 64.000 entradas entrenado sobre unos 10 GB de texto puede evaluarse en tareas de segmentacion y continuacion en ambos idiomas.
- Experimentos de continuacion de texto educativo: dado el peso de las fuentes de web educativa y matematicas (FineMath, FineWeb-Edu, Ultra-FineWeb-L3), el modelo es adecuado para estudiar continuaciones de material didactico en chino e ingles.
- Base para ajuste fino supervisado: al ser un checkpoint base con licencia MIT, puede servir como punto de partida para experimentos de SFT en dominios concretos, aceptando el coste de un modelo sin alineamiento previo.
- Validacion de implementaciones de referencia: el codigo PyTorch portable con interfaz de Hugging Face y sin dependencias de Ascend permite comparar salidas entre implementaciones y verificar la exportacion en CPU con PyTorch 2.10.0 y Transformers 5.20.2.
- Docencia sobre MoE y GQA: la combinacion de GQA, RoPE, SiTU y MoE latente en un modelo pequeno lo hace util como ejemplo didactico de arquitecturas modernas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales en la informacion disponible. El autor solo reporta comprobaciones internas de desarrollo en CPU con FP32 para este checkpoint exacto:

| Comprobacion interna de desarrollo | Resultado |
|---|---:|
| Panel fijo de 48 preguntas de opcion multiple | 18/48 (37,5 %) |
| Seis completaciones de funciones elementales en Python | 0/6 |
| Doce completaciones aritmeticas elementales | 3/12 |

El panel usa puntuacion de candidatos zero-shot por log-probabilidad media de tokens. El propio autor advierte que estas pruebas no son benchmarks oficiales ni un certificado de generalizacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP32 suman aproximadamente 7,8 GB (1,96 B parametros x 4 bytes), por lo que se necesita algo mas de 8 GB de VRAM solo para los pesos, mas overhead de activaciones y contexto.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o una A100/H100 permiten ejecutar el modelo en FP32 con holgura; una GPU consumer de 12-16 GB podria ser insuficiente en FP32.
- Cabe en GPU consumer: previsiblemente en RTX 4090 y modelos con 16 GB o mas en FP32; no se han publicado conversiones a cuantizacion (GGUF, AWQ, GPTQ) que reduzcan el requisito.
- Opciones de despliegue: transformers con `trust_remote_code=True` y la implementacion de referencia incluida. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y la implementacion de referencia no tiene cache de clave/valor ni kernels optimizados de expertos.
- Latencia y throughput: no disponibles. El autor advierte que la generacion en CPU puede ser lenta y que el codigo de referencia recalcula el prefijo en cada paso.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables publicados para este modelo. A continuacion se comparan caracteristicas estructurales con alternativas de tamano y categoria similares, sin datos de benchmarks:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yebb MoE 2B Base | 1,96 B | 122,8 M (convencion del autor) | 2.048 | MIT | Hugging Face, pesos FP32 |
| Yebb Dense 0.8B Base (mismo autor) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas MoE pequenas de codigo abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos comparables con datos verificables de parametros, contexto y rendimiento.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni alineamiento de preferencias: no debe usarse como asistente conversacional.
- Rendimiento muy limitado en aritmetica (3/12) y codigo (0/6) en las comprobaciones internas del autor.
- Riesgo de continuaciones repetitivas o incorrectas, segun advierte el propio autor.
- Contexto de solo 2.048 tokens y sin validacion mas alla de la longitud de entrenamiento.
- Solo chino e ingles; no hay soporte documentado de otros idiomas.
- El reloj de 80.000 millones de tokens incluye 8.738 millones de tokens de replay, por lo que no equivale a tokens unicos.
- La implementacion de referencia no tiene cache de clave/valor ni kernels optimizados, lo que limita el rendimiento en produccion.
- Requiere `trust_remote_code=True` con codigo personalizado; el autor recomienda inspeccionarlo antes de habilitarlo.
- Solo se han verificado PyTorch 2.10.0 y Transformers 5.20.2; versiones anteriores no estan validadas.
- Licencia MIT: permite uso comercial, pero el modelo no esta validado como asistente general y su fiabilidad es baja.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sinksilk/Yebb-MoE-2B-Base
- Perfil del autor: https://huggingface.co/sinksilk
- Dataset MiniMind: https://huggingface.co/datasets/jingyaogong/minimind_dataset
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset Chinese FineWeb-Edu V2.1: https://huggingface.co/datasets/opencsg/Fineweb-Edu-Chinese-V2.1
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Common Pile educational code: https://huggingface.co/datasets/common-pile/stackv2_edu_filtered
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
