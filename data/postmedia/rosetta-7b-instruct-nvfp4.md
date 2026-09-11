# PoSTMEDIA/Rosetta-7B-Instruct-NVFP4

## Resumen

Rosetta-7B-Instruct-NVFP4 es la cuantizacion oficial a 4 bits en formato NVFP4 del modelo bilingue coreano-ingles Rosetta-7B-Instruct, desarrollado por PoSTMEDIA. El problema que resuelve es el de reducir el coste de memoria y aumentar el ancho de banda efectivo de decodificacion sin reentrenar: el checkpoint pasa de 14,5 GB en BF16 a 6,3 GB, una reduccion de aproximadamente 2,3 veces, manteniendo el mismo espacio de pesos logicos.

El modelo emplea una arquitectura transformer densa decoder-only (`RosettaForCausalLM`) de 32 capas, atencion global intercalada con sliding window de 4.096 tokens en proporcion 3:1, QK-normalization y un vocabulario extendido para coreano de 161.425 tokens. La longitud de contexto declarada es de 65.536 tokens. Esta pensado especificamente para GPUs NVIDIA Blackwell (DGX Spark, GeForce RTX 50, B200/GB200), donde vLLM selecciona kernels GEMM nativos de NVFP4, aunque tambien carga en Hopper, Ada y Ampere mediante el fallback weight-only Marlin de vLLM, con el mismo ahorro de memoria.

Su relevancia actual es doble: por un lado, demuestra un flujo de cuantizacion PTQ reproducible con NVIDIA TensorRT Model Optimizer (version 0.46.1) sobre un modelo bilingue no anglocentrico; por otro, ejemplifica el patron de publicacion de cuantizaciones NVFP4 como artefactos de despliegue independientes del modelo base en BF16. Es importante senalar que, pese al nombre comercial "7B", el recuento real de parametros en los safetensors es de 4.560.924.672.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (`RosettaForCausalLM`), 32 capas, atencion intercalada sliding-window (4.096) + global en proporcion 3:1, con QK-normalization |
| Parametros totales | 4.560.924.672 (segun safetensors); la model card lo denomina "7B" |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1, bloques de 16 elementos, escalas por bloque en FP8 E4M3 mas escala por tensor en FP32); activaciones NVFP4 (W4A4) con escalas estaticas calibradas; KV cache en FP8 (E4M3). Embeddings, `lm_head` y capas de normalizacion se mantienen en BF16 |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con configuracion ModelOpt unificada de HuggingFace (`quantization_config` + `hf_quant_config.json`); requiere `custom_code` |

## Arquitectura y entrenamiento

La arquitectura subyacente es identica a la de Rosetta-7B-Instruct: un transformer denso decoder-only de 32 capas que combina atencion global con ventanas deslizantes de 4.096 tokens en una pauta de intercalado 3:1, e incorpora QK-normalization. El vocabulario se amplio a 161.425 tokens para cubrir coreano de forma eficiente, frente a los vocabularios tipicos de 32.000 a 128.000 tokens de los modelos predominantemente ingleses. La model card remite al modelo base para los detalles completos de entrenamiento (numero de tokens, composicion del dataset, si hubo RLHF o DPO), datos que no se detallan en la informacion disponible.

La innovacion de este checkpoint no reside en el entrenamiento sino en el proceso de cuantizacion. Se aplico el recetario oficial de post-training quantization NVFP4 con NVIDIA TensorRT Model Optimizer 0.46.1: los pesos se representan en FP4 con formato E2M1 agrupados en bloques de 16 elementos, con escalas por bloque en FP8 (E4M3) y una escala por tensor en FP32. Las activaciones tambien se cuantizan a NVFP4 (esquema W4A4) usando escalas de entrada estaticas calibradas. El conjunto de calibracion consta de 1.024 muestras bilingues: conversaciones de instrucciones en coreano procedentes de activos de datos sinteticos internos de PoSTMEDIA, distribuidas en 8 dominios y renderizadas con la plantilla de chat del propio modelo, mas articulos periodisticos en ingles. Los embeddings, la cabeza `lm_head` y las capas de normalizacion se mantienen en BF16 para preservar la fidelidad en esas partes sensibles.

## Capacidades

- Generacion de texto conversacional e instrucciones multi-turno en coreano e ingles, con plantilla de chat propia.
- Seguimiento de instrucciones (instruction following) y respuesta a preguntas.
- Conocimiento general y resolucion de problemas matematicos: la model card afirma que la calidad se preserva "en instrucciones, conocimiento y matematicas" en evaluaciones internas comparativas contra el modelo BF16.
- Capacidad bilingue real ko/en, con vocabulario extendido para coreano.
- Capacidades de razonamiento explicito: NO en esta variante. El modo "thinking" con etiquetas `<think>` corresponde a los modelos separados Rosetta-7B-Think y Rosetta-7B-Think-NVFP4.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el pipeline declarado es exclusivamente `text-generation`.
- Despliegue servido mediante API compatible con OpenAI a traves de vLLM.

## Casos de uso

- Atencion al cliente en coreano: el modelo puede gestionar conversaciones multi-turno con hasta 65.536 tokens de contexto, lo que permite arrastrar el historial completo de un ticket o de una sesion larga sin truncar, y su cuantizacion NVFP4 reduce el coste por instancia servida.
- Asistente conversacional bilingue ko/en para producto: al estar instruido y cubrir ambos idiomas con un vocabulario coreano extendido de 161.425 tokens, es adecuado para aplicaciones donde el usuario alterna idiomas en la misma conversacion sin cambiar de modelo.
- Despliegue en DGX Spark o estaciones de trabajo con GPU Blackwell: con 6,3 GB de pesos, casi toda la memoria unificada de 128 GB del GB10 queda libre para cache KV y otros procesos, lo que permite servir contexto largo en un equipo de sobremesa.
- Procesamiento por lotes de resumenes y clasificacion de noticias: el conjunto de calibracion incluye articulos periodisticos en ingles, y el modelo es adecuado para resumir o etiquetar volumenes grandes de texto donde el throughput por vatio importa mas que la precision en el ultimo decimal.
- Generacion de documentacion tecnica y borradores en ingles para equipos con presencia en Corea: traduccion y redaccion asistida con estilo controlado mediante `temperature 0.7` y `top_p 0.9`.
- Prototipado rapido de aplicaciones LLM en entornos con VRAM limitada: el fallback weight-only Marlin permite cargar el mismo checkpoint en GPUs Hopper, Ada y Ampere (SM >= 80) manteniendo los 6,3 GB de huella, lo que facilita desarrollar en una GPU antigua y desplegar despues en Blackwell sin cambiar de artefacto.
- Canal de chat interno con requisitos de licencia permisiva: al estar bajo Apache 2.0, puede integrarse en productos propietarios sin obligaciones de copyleft, algo relevante para empresas que no pueden adoptar licencias con clausulas de uso comercial restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que, en evaluaciones internas comparativas contra el modelo BF16 bajo un protocolo identico, la calidad de salida se preserva de forma amplia en instrucciones, conocimiento y matematicas en coreano e ingles, y advierte de que pueden aparecer diferencias menores en casos limite de recuperacion de conocimiento. No se aportan cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni mediciones concretas de latencia o throughput.

| Aspecto | Dato disponible |
|---|---|
| Benchmarks publicos | No disponibles |
| Comparacion con el modelo BF16 | Evaluacion interna cualitativa; sin cifras |
| Tamano del checkpoint | 6,3 GB frente a 14,5 GB en BF16 (aprox. 2,3x menor) |
| Mejora de throughput | Descrita como "sustancial" en dispositivos limitados por ancho de banda de pesos (DGX Spark); sin cifras |

## Requisitos de hardware

- VRAM estimada para los pesos: 6,3 GB en todos los casos, tanto en Blackwell con kernels NVFP4 nativos como en Hopper, Ada y Ampere mediante el fallback weight-only Marlin.
- GPU con soporte nativo NVFP4: NVIDIA Blackwell, es decir, SM 100/120/121, que incluye B200, GB200, GeForce RTX 50 y DGX Spark (GB10).
- GPU con soporte por fallback: Hopper, Ada y Ampere (SM >= 80), con aritmetica BF16 tras descomprimir los pesos; mismo ahorro de memoria pero sin aceleracion de computo FP4.
- Cabe en GPU de consumo: si, siempre que sean RTX 50 (Blackwell) o modelos con al menos 8 GB de VRAM efectiva para los pesos, mas el espacio adicional para cache KV y activaciones.
- Opciones de despliegue: vLLM version 0.26 o superior, preferiblemente la distribucion propia de PoSTMEDIA (rama `rosetta-v0.26.0`, instalable con `VLLM_USE_PRECOMPILED=1 pip install git+https://github.com/PoSTMEDIA-AI/vllm@rosetta-v0.26.0`), que detecta el checkpoint ModelOpt automaticamente y no requiere `trust_remote_code`. El layout se declara compatible con TensorRT-LLM y SGLang. Para inferencia con `transformers` estandar se recomienda usar el modelo BF16 en su lugar.
- Cache KV: puede servirse en FP8 (E4M3) con escalas estaticas calibradas, lo que reduce adicionalmente la memoria de contexto.
- Latencia y throughput: no se han publicado cifras. La model card solo indica que la decodificacion en DGX Spark mejora de forma notable respecto a BF16 porque esta limitada por el ancho de banda de lectura de pesos.
- Parametros de muestreo recomendados: `temperature 0.7` y `top_p 0.9`, o decodificacion greedy para tareas deterministas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PoSTMEDIA/Rosetta-7B-Instruct-NVFP4 | 4,56 B (nominal 7B) | 65.536 | NVFP4 W4A4, KV cache FP8 | ko, en | Apache 2.0 | HuggingFace; requiere vLLM >= 0.26 |
| PoSTMEDIA/Rosetta-7B-Instruct | 4,56 B (nominal 7B) | 65.536 | BF16 | ko, en | Apache 2.0 | HuggingFace; compatible con `transformers` |
| PoSTMEDIA/Rosetta-7B-Think-NVFP4 | No disponible | No disponible | NVFP4 | ko, en | Apache 2.0 (segun la coleccion) | HuggingFace |
| Otros modelos bilingues ko/en de ~7B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye resultados de benchmarks que permitan comparar el rendimiento de este checkpoint con alternativas de otros desarrolladores, ni fichas de modelos competidores de la misma categoria. La comparacion factible se limita, por tanto, a las variantes del propio linaje Rosetta.

## Limitaciones y advertencias

- Cuantizacion de 4 bits: la propia model card advierte de que pueden aparecer diferencias menores en casos limite de recuperacion de conocimiento. Para casos de uso que exijan maxima precision, recomienda el modelo BF16.
- Numero de parametros: aunque el nombre comercial indica "7B", el recuento real en safetensors es de 4.560.924.672 parametros. Conviene tenerlo en cuenta al calcular presupuestos de memoria y al comparar con otros modelos.
- Idiomas: soporte declarado unicamente de coreano e ingles. El castellano no figura entre los idiomas soportados, por lo que no debe asumirse un rendimiento fiable en espanol.
- Datos de entrenamiento no detallados: no se especifican en la informacion disponible el volumen de tokens, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Esto limita la evaluacion de sesgos y de procedencia de datos.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible. Al entrenarse sobre datos sinteticos internos en coreano y noticias en ingles, es esperable un sesgo de dominio hacia esos generos.
- Riesgo de alucinacion: no se cuantifica ni se documenta en la informacion disponible. Como todo modelo generativo de este tamano, es propenso a inventar datos en tareas de recuperacion factual.
- Dependencia de herramienta: el checkpoint esta disenado para stacks que entiendan el formato unificado ModelOpt (vLLM, con layout compatible con TensorRT-LLM y SGLang). No esta pensado para inferencia directa con `transformers` estandar, y requiere la distribucion de vLLM de PoSTMEDIA o vLLM >= 0.26.
- Tool calling, agentes, vision y audio: no hay evidencia en la informacion disponible de que este modelo soporte estas capacidades. No deben asumirse en produccion sin verificacion previa.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe aun validacion externa de la comunidad.
- Licencia: Apache 2.0 permite uso comercial sin restricciones de copyleft, pero conviene verificar el fichero LICENSE del repositorio y las condiciones del modelo base antes de un despliegue en produccion.
- Evaluaciones internas sin reproducibilidad: las afirmaciones de preservacion de calidad se basan en pruebas internas del propio autor y no se acompanan de cifras ni de protocolos publicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PoSTMEDIA/Rosetta-7B-Instruct-NVFP4
- Modelo base (BF16): https://huggingface.co/PoSTMEDIA/Rosetta-7B-Instruct
- Modelo fundacional: https://huggingface.co/PoSTMEDIA/Rosetta-7B-Base
- Variante de razonamiento: https://huggingface.co/PoSTMEDIA/Rosetta-7B-Think
- Variante de razonamiento en NVFP4: https://huggingface.co/PoSTMEDIA/Rosetta-7B-Think-NVFP4
- Coleccion Rosetta: https://huggingface.co/collections/PoSTMEDIA/rosetta-6a9db30fd1b4585b0c1845e9
- Distribucion vLLM de PoSTMEDIA: https://github.com/PoSTMEDIA-AI/vllm
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces utiles son los presentes en la model card de HuggingFace. No se dispone de paper, blog tecnico ni demo adicionales.
