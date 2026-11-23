# Rocicleito/Qwen3.8-27B-TQ-formats

## Resumen

Qwen3.8-27B-TQ-formats es un repositorio de cuantizaciones del modelo Qwen/Qwen3.8-27B (27.320.697.856 parametros, licencia Apache-2.0) publicadas por el usuario Rocicleito. No se trata de un modelo entrenado desde cero, sino de dos conversiones de los pesos originales sin modificar a formatos propietarios del motor tqLLM: TQT (codigo trellis, tipo GGUF 306) y TQV-12 (codebook vectorial de 4 dimensiones, tipo GGUF 305). Ambos ficheros ocupan 14,72 GB, es decir, 4,125 bits por peso.

La relevancia de esta publicacion es puramente de eficiencia de compresion: manteniendo el mismo tamano que la cuantizacion de referencia TQ_L del repositorio YTan2000/Qwen3.8-27B-TQ, consigue reducir la divergencia KL respecto al modelo BF16 en un 45 % (TQT) y un 25 % (TQV-12). El coste es una dependencia total del runtime: los tensores de tipo 305 y 306 son exclusivos de tqLLM y no cargan en llama.cpp, Ollama ni LM Studio.

El modelo base Qwen3.8-27B es un transformer denso de la familia Qwen, pero la informacion disponible no detalla su arquitectura interna, contexto nativo ni composicion del dataset de entrenamiento. Esta ficha se limita, por tanto, a lo que el autor documenta: el proceso de cuantizacion, las metricas de fidelidad y el rendimiento medido en una RTX 3090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B); detalles internos no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40K usado en benchmarks; el autor menciona servicio a 144K con drafter; contexto nativo del base no disponible |
| Tipos de cuantizacion | TQT (trellis, GGUF tipo 306) y TQV-12 (codebook vectorial 4-D, GGUF tipo 305), ambos 4,125 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF propietario de tqLLM (tipos 305 y 306, incompatibles con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27,3 mil millones de parametros del que no se aportan detalles de capas, atencion ni datos de entrenamiento en la informacion disponible. Lo documentado es exclusivamente el pipeline de cuantizacion, ejecutado con `tools/convert/qwen35/tqv12_quant.py` del repositorio tqLLM.

TQV-12 se genera mediante GPTQ vectorial, mientras que TQT emplea BlockLDLQ con un codificador trellis de Viterbi sobre la base rotada de TQ4. Ambos se calibraron con aproximadamente 110.000 tokens y usaron el TQ_L original como plantilla de layout. TQT sigue el planteamiento de QTIP (Tseng, Sun, Hou, De Sa, 2024, arXiv 2406.11235): codigos trellis con desplazamiento de bits y procesamiento de incoherencia, con redondeo heredado de GPTQ y QuIP#. El autor advierte que una reconstruccion desde las guias alcanza la misma KLD pero no es byte-identica, porque GPTQ en GPU no es reproducible bit a bit.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio y la herencia del modelo base lo indican, aunque no se detallan capacidades especificas.
- Razonamiento de nivel bajo documentado: los benchmarks GSM8K se ejecutaron con "low reasoning effort", lo que sugiere soporte de modos de razonamiento en el base.
- Decodificacion especulativa: compatible con el drafter DFlash2 (Qwen3.8-27B-DFlash2-TQ3.gguf) y el vocabulario mtp-vocab/atx_65536.txt, lo que multiplica el throughput.
- Inferencia con KV cache cuantizada: la opcion `--kv tq3` de tqserve permite servir con cache de atencion comprimida.
- Tool calling, function calling, agentes, vision, audio y capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en una unica GPU de consumo: con 14,72 GB de pesos, el modelo cabe en una RTX 3090 o RTX 4090 de 24 GB dejando margen para KV cache, lo que permite servir un modelo de 27B en hardware de gama alta domestica.
- Servicio de chat de baja latencia con decodificacion especulativa: combinando TQT con el drafter DFlash2 se alcanzan 145,3 tok/s a 2K de prompt y 116,5 tok/s a 32K, adecuado para asistentes interactivos.
- Procesamiento de documentos largos: el autor reporta servicio a 144K de contexto en la misma tarjeta a 140-170 tok/s, util para resumen y analisis de contratos, informes o bases de codigo extensas.
- Evaluacion de tecnicas de cuantizacion: el repositorio sirve como referencia reproducible de TQT frente a TQ_L, con KLD, perplejidad y GSM8K medidos sobre el mismo conjunto de 250 preguntas.
- Razonamiento matematico en produccion: GSM8K con 243/250 aciertos en modo greedy sugiere viabilidad para tareas aritmeticas de varios pasos, siempre con verificacion posterior.
- Entornos de investigacion con CUDA: al requerir tqLLM y CUDA 13.0, encaja en laboratorios que ya operan este stack y quieren comparar formatos de 4 bits sin cambiar de modelo base.
- Prototipado de pipelines conversacionales multi-turno: el endpoint es compatible con la API de endpoints (`endpoints_compatible`), lo que facilita integrarlo tras una capa OpenAI-like en pruebas internas.

## Benchmarks y rendimiento

| Metrica | TQT | TQV-12 | TQ_L (referencia) | BF16 |
|---|---:|---:|---:|---:|
| KLD vs BF16 | 0,0134 ± 0,00058 | 0,0184 ± 0,0011 | 0,0245 ± 0,0012 | 0 |
| Mismo token top-1 | 95,60 % | 94,93 % | 94,17 % | 100 % |
| Perplejidad (WikiText-2) | 4,917 | 4,956 | 4,959 | 4,880 |
| GSM8K (250 preguntas, greedy) | 243 | 242 | 245 | no disponible |

| Velocidad (tok/s, RTX 3090, `--kv tq3`, 40K contexto) | TQ_L 2K / 8K / 32K | TQT 2K / 8K / 32K |
|---|---:|---:|
| Decode con drafter DFlash2 | 140,2 / 125,9 / 119,3 | 145,3 / 116,3 / 116,5 |
| Decode sin drafter | 51,6 / 50,5 / 47,0 | 50,6 / 49,6 / 46,2 |
| Prefill | 1677 / 1861 / 1700 | 1658 / 1853 / 1696 |

Sin drafter, TQT cuesta aproximadamente un 2 % de velocidad frente a TQ_L. Con drafter, las diferencias dependen de la tasa de aceptacion de tokens sobre el texto generado, no del kernel. Las mediciones se realizaron en una RTX 3090 con CUDA 13.0, en una sola sesion.

## Requisitos de hardware

- VRAM para pesos: 14,72 GB por fichero (TQT o TQV-12), identico a TQ_L.
- VRAM total estimada: con KV cache `tq3` y contexto de 40K, cabe en 24 GB; a 144K de contexto el autor reporta servicio correcto en RTX 3090, por lo que 24 GB es el minimo practico.
- GPU probada: RTX 3090 con CUDA 13.0.
- GPU recomendadas: RTX 3090, RTX 4090 (24 GB); A100 y H100 son compatibles por VRAM pero no hay mediciones publicadas en la informacion disponible.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas.
- Despliegue: exclusivamente `tqserve` de tqLLM, desde la release que incluye PR #56 (TQV-12) y PR #59 (TQT). No carga en llama.cpp, Ollama ni LM Studio.
- Throughput: 140-170 tok/s con drafter a contexto largo; 46-52 tok/s sin drafter; prefill en torno a 1700-1860 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD / fidelidad | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.8-27B-TQT (este) | 27,3B | 40K medido, 144K servido | KLD 0,0134; GSM8K 243/250 | Apache-2.0 | tqLLM (CUDA) |
| Qwen3.8-27B-TQV12 (este) | 27,3B | idem | KLD 0,0184; GSM8K 242/250 | Apache-2.0 | tqLLM (CUDA) |
| Qwen3.8-27B-TQ_L (YTan2000) | 27,3B | idem | KLD 0,0245; GSM8K 245/250 | Apache-2.0 | tqLLM (CUDA) |
| Qwen3.8-27B BF16 (base) | 27,3B | no disponible | referencia; PPL 4,880 | Apache-2.0 | llama.cpp y otros |

Frente a cuantizaciones estandar de 4 bits (Q4_K_M, AWQ, GPTQ) no hay comparacion publicada en la informacion disponible; la unica referencia directa es TQ_L, del mismo ecosistema.

## Limitaciones y advertencias

- Dependencia total de tqLLM: los tipos GGUF 305 y 306 son propietarios; el modelo es inutilizable en el ecosistema llama.cpp, Ollama o LM Studio.
- Requiere CUDA y una release concreta de tqLLM (PR #56 y PR #59); sin ella los ficheros no cargan.
- No es determinista respecto al base: como toda cuantizacion, genera texto ligeramente distinto de TQ_L y de BF16.
- La reproducibilidad byte a byte no esta garantizada: GPTQ en GPU no es bit-reproducible, aunque una reconstruccion desde las guias alcanza la misma KLD.
- GSM8K ligeramente inferior a TQ_L (243 y 242 frente a 245), pese a la mejor KLD; la metrica de fidelidad no se traduce automaticamente en mejor tarea.
- Sesgos, riesgo de alucinacion y limitaciones idiomaticas del modelo base: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0 heredada del base, permisiva para uso comercial, pero sujeta a las condiciones del modelo Qwen original.
- Repositorio con solo 1 like y 453 descargas: validacion comunitaria muy limitada; conviene verificar checksums sha256 antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rocicleito/Qwen3.8-27B-TQ-formats
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion de referencia TQ_L: https://huggingface.co/YTan2000/Qwen3.8-27B-TQ
- Motor tqLLM: https://github.com/turbo-tan/tqllm
- PR #56 (TQV-12): https://github.com/turbo-tan/tqllm/pull/56
- PR #59 (TQT): https://github.com/turbo-tan/tqllm/pull/59
- Guia TQV-12: https://github.com/turbo-tan/tqllm/blob/main/docs/guides/tqv12.md
- Guia TQT: https://github.com/turbo-tan/tqllm/blob/main/docs/guides/tqt.md
- Paper QTIP: https://arxiv.org/abs/2406.11235
