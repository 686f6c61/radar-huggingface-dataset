# esatapedico/Qwen3.8-27B-NVFP4-MTP-SSMFIX-GGUF

## Resumen

`esatapedico/Qwen3.8-27B-NVFP4-MTP-SSMFIX-GGUF` es una familia de ocho cuantizaciones GGUF en formato NVFP4 del modelo Qwen3.8-27B, publicada por el usuario esatapedico. El modelo base declarado es `unsloth/Qwen3.8-27B-NVFP4`, un VLM nativo con cabeza especulativa MTP integrada y 262.144 tokens de contexto nativo. La particularidad de esta publicacion es que aplica sobre los pesos una modificacion conocida en la comunidad como "SSMFIX", que multiplica ocho kernels `conv1d` de capas SSM tardias por factores de escala (alfa) por capa.

El autor es explicito al calificar el artefacto como experimento y no como mejora: los resultados son mixtos y no hay garantia de que la modificacion sea beneficiosa. La idea no es original del autor, sino que proviene de redashes (checkpoint BF16 de referencia), LuffyTheFox (analisis original "Sig-ScaleSync") y FGDumitru (implementacion estadistica independiente `qwen-ssm-repair`). El repositorio se limita al empaquetado mecanico de la receta en GGUF.

La relevancia actual es doble: por un lado, permite a usuarios de llama.cpp y otros motores GGUF probar la hipotesis sin convertir pesos; por otro, sirve como caso de estudio sobre como se propaga y se valida (o no) una idea de reparacion de pesos en la comunidad open source. El repositorio ocupa 140,2 GB y acumula 604 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas SSM (conv1d) y atencion; VLM nativo con cabeza MTP especulativa |
| Parametros totales | 460.730.096 (dato de safetensors del modelo base; la denominacion "27B" del nombre no coincide con este conteo) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (contexto nativo declarado) |
| Tipos de cuantizacion | NVFP4 en ocho niveles (escala tamano/precision); GGUF |
| Idiomas soportados | en, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (NVFP4) |

## Arquitectura y entrenamiento

El modelo base es un VLM nativo de Qwen con arquitectura hibrida que combina capas SSM (con kernels `conv1d`) y atencion, e incorpora una cabeza MTP (multi-token prediction) para decodificacion especulativa. El contexto nativo es de 262.144 tokens. La modificacion SSMFIX actua sobre ocho kernels `conv1d` de capas SSM tardias (conjunto {52, 53, 56, 57, 58, 60, 61, 62}), multiplicandolos por factores alfa por capa derivados de un analisis de desviaciones estandar infladas. Los valores alfa corresponden a la receta "v2" de redashes, sin cambios.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable es la combinacion de decodificacion especulativa via MTP con cuantizacion NVFP4 orientada a hardware Blackwell, mas la aplicacion de la reparacion SSMFIX dentro de los propios ficheros GGUF.

## Capacidades

- Generacion de texto y razonamiento en el modelo base Qwen3.8-27B.
- Capacidades de vision y multimodalidad (VLM nativo, proyector de vision intacto en estos GGUF).
- Decodificacion especulativa mediante cabeza MTP integrada.
- Soporte multilingue segun la etiqueta `multilingual` del modelo base.
- Compatibilidad con llama.cpp y otros motores basados en GGUF.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modos de agente multi-paso.

## Casos de uso

- Evaluacion experimental de la hipotesis SSMFIX: investigadores pueden descargar los ocho niveles y comparar perplejidad, repeticion y comportamiento en contexto largo frente a los pesos oficiales, usando llama.cpp como motor de referencia.
- Despliegue en hardware Blackwell con NVFP4: los ficheros estan pensados para aprovechar el formato NVFP4 en GPUs de nueva generacion, reduciendo huella de memoria frente a BF16.
- Pruebas de decodificacion especulativa: la cabeza MTP incluida permite medir aceleracion de generacion en motores GGUF compatibles.
- Prototipado multimodal en local: el proyector de vision intacto permite experimentar con tareas imagen-texto en entornos de desarrollo sin infraestructura de servidor.
- Investigacion sobre reparacion de pesos: sirve como material reproducible para contrastar el diagnostico de desviaciones infladas en capas SSM tardias frente a implementaciones alternativas como `qwen-ssm-repair`.
- Analisis de contexto largo: aunque el autor senala que nadie ha publicado resultados mas alla de ~75k tokens, el modelo permite disenar experimentos de repeticion y truncamiento en ventanas de hasta 262.144 tokens.

## Benchmarks y rendimiento

Los datos disponibles corresponden a evaluaciones de la receta SSMFIX sobre el checkpoint BF16 de redashes, no sobre estos GGUF concretos:

| Benchmark | Resultado SSMFIX (BF16, redashes) | Referencia |
|---|---|---|
| TruthfulQA-gen | +6 a +8 pp | vs pesos oficiales |
| GSM8K | mejora pequena | vs pesos oficiales |
| IFEval | mejora pequena | vs pesos oficiales |
| CMMLU | −1,8 pp | vs pesos oficiales |
| MT-Bench | −0,19 | vs pesos oficiales (tras corregir arnes; el "+0,42" previo fue retirado) |
| Perplejidad (contra-benchmark de froggeric, Qwen3.6) | degradada en todas las longitudes 4K–128K | sin mejora en NIAH ni repeticion |

No se han publicado resultados de benchmarks de estos ficheros GGUF NVFP4 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el repositorio completo ocupa 140,2 GB repartido en ocho niveles, por lo que cada nivel individual es sustancialmente menor y debe consultarse por fichero.
- GPU recomendadas: hardware Blackwell para aprovechar NVFP4 de forma nativa; el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende del nivel de cuantizacion elegido y del soporte NVFP4 del motor.
- Opciones de despliegue: llama.cpp y otros motores basados en GGUF; no se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| esatapedico/Qwen3.8-27B-NVFP4-MTP-SSMFIX-GGUF | 460.730.096 (segun safetensors del base) | 262.144 | SSMFIX (v2, alfas de redashes) | Apache 2.0 | GGUF NVFP4, 8 niveles |
| esatapedico/Qwen3.8-27B-NVFP4-MTP-GGUF | mismo base | 262.144 | ninguna (familia plana) | Apache 2.0 | GGUF NVFP4 |
| redashes/Qwen3.8-27B-BF16-SSMFIX | mismo base | 262.144 | SSMFIX v2 | no disponible | safetensors BF16 |
| Luis23333/Qwen3.8-27B-SSMFIX-UD-Q3_K_XL-GGUF | mismo base | 262.144 | SSMFIX | no disponible | GGUF Q3_K_XL |
| grimoni/Qwen3.8-27B-SSMFIX-UD-Q4_K_XL-GGUF | mismo base | 262.144 | SSMFIX | no disponible | GGUF Q4_K_XL |

## Limitaciones y advertencias

- El propio autor califica el artefacto como experimento: los resultados buenos no estan garantizados y los malos no son improbables.
- La evidencia sobre la utilidad del SSMFIX es contradictoria: mejoras en TruthfulQA-gen y GSM8K frente a degradacion de CMMLU, MT-Bench y perplejidad en el contra-benchmark de froggeric.
- No existen resultados publicados en contexto largo, que es precisamente el regimen donde la hipotesis tendria sentido (mas alla de ~75k tokens).
- Riesgo de alucinacion y sesgos: no documentados especificamente para esta variante; hereda los del modelo base Qwen3.8-27B.
- La licencia Apache 2.0 permite uso comercial, pero el caracter experimental desaconseja produccion sin validacion propia.
- El conteo de parametros de safetensors (460.730.096) no concuerda con la denominacion "27B" del nombre; conviene verificar el modelo base antes de dimensionar infraestructura.
- Idiomas declarados limitados a `en` y `multilingual` generico; no hay evaluacion por idioma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/esatapedico/Qwen3.8-27B-NVFP4-MTP-SSMFIX-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Familia plana sin SSMFIX: https://huggingface.co/esatapedico/Qwen3.8-27B-NVFP4-MTP-GGUF
- Checkpoint BF16 de referencia: https://huggingface.co/redashes/Qwen3.8-27B-BF16-SSMFIX
- Discusion original en Qwen: https://huggingface.co/Qwen/Qwen3.8-27B/discussions/76
- Implementacion estadistica independiente: https://github.com/FGDumitru/qwen-ssm-repair
- Conversion GGUF alternativa Q3_K_XL: https://huggingface.co/Luis23333/Qwen3.8-27B-SSMFIX-UD-Q3_K_XL-GGUF
- Conversion GGUF alternativa Q4_K_XL: https://huggingface.co/grimoni/Qwen3.8-27B-SSMFIX-UD-Q4_K_XL-GGUF
