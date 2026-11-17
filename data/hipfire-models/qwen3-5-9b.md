# hipfire-models/qwen3.5-9b

## Resumen

Qwen3.5-9B para hipfire es una distribucion pre-cuantizada del modelo Qwen/Qwen3.5-9B, publicada por el usuario hipfire-models con el objetivo de ejecutarlo en GPUs AMD de consumo mediante hipfire, un motor de inferencia escrito en Rust que usa HIP como backend y prescinde de Python en la ruta critica. El modelo base emplea una arquitectura hibrida DeltaNet, lo que combina mecanismos de atencion con capas de estado lineal para reducir coste computacional y de memoria frente a un transformer clasico de tamano equivalente.

La relevancia de esta publicacion no esta en el modelo en si, sino en el formato: ofrece tres variantes de cuantizacion propietarias (HF4, HF6 y MQ4) que se empaquetan en un unico fichero con tokenizer y config embebidos. La variante MQ4 aplica una rotacion de Walsh-Hadamard (FWHT) a los pesos en el momento de la cuantizacion y al vector de entrada durante el GEMV, lo que aplana los outliers y permite obtener una calidad de salida proxima a Q8 con un ancho de banda de 4 bits.

El repositorio ocupa 29,6 GB y no registra descargas ni likes en el momento de la consulta. La licencia del codigo del motor es MIT, mientras que los pesos quedan sujetos a la licencia del modelo Qwen original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido DeltaNet (modelo base Qwen3.5-9B) |
| Parametros totales | 9 mil millones (segun denominacion del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HF4 (HFQ4-G256, 4 bits, grupos de 256 pesos), HF6 (HFQ6-G256, 6 bits, grupos de 256 pesos), MQ4 (MagnumQuant 4 bits con rotacion FWHT) |
| Idiomas soportados | no disponible |
| Licencia | MIT (motor hipfire); pesos sujetos a la licencia de Qwen/Qwen3.5-9B |
| Formato de pesos | Contenedor propietario hipfire (.hf4, .hf6, .mq4) con tokenizer y config embebidos |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer hibrido DeltaNet, una variante que sustituye parte de las capas de atencion por mecanismos de estado lineal con actualizacion delta. Esta combinacion reduce el coste de atencion cuadratico en contextos largos y disminuye la huella de memoria asociada a la cache KV, manteniendo la capacidad de recuperacion de informacion a larga distancia propia de la atencion. No se dispone en la informacion proporcionada de datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron fases de RLHF o DPO.

La innovacion tecnica destacable de esta publicacion es el pipeline de cuantizacion. HF4 y HF6 usan cuantizacion plana por grupos de 256 pesos con escala y cero por grupo (aproximadamente 0,53 bytes por peso en HF4 y 0,78 en HF6). MQ4 mantiene el mismo layout de almacenamiento que HF4 (4,25 bytes por peso efectivos) pero pre-rota los pesos mediante una transformada de Walsh-Hadamard y rota en caliente el vector de entrada durante el GEMV, lo que distribuye mejor el error de cuantizacion. Cada commit que toca codigo de kernel o de forward pass en el repositorio de hipfire se valida contra una puerta de calidad que exige decodificacion greedy byte-exacta sobre nueve pares de referencia (modelo, prompt).

## Capacidades

- Generacion de texto autoregresiva con decodificacion greedy y muestreo, servida por el motor hipfire.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.5-9B, en la medida en que el proceso de cuantizacion los preserva.
- Tres niveles de fidelidad numerica seleccionables: HF4 (maximo throughput), MQ4 (calidad proxima a Q8) y HF6 (minima perdida frente a FP16).
- Tokenizer y configuracion embebidos en el fichero del modelo, sin necesidad de descargar artefactos separados.
- Ejecucion nativa en GPUs AMD RDNA1 a RDNA4 mediante Rust y HIP, sin Python en la ruta de inferencia.
- Soporte de tool calling, modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en GPUs AMD de gama media: con 6 GB de VRAM minima para HF4 y MQ4, el modelo cabe en tarjetas como RX 5700 XT, donde alcanza 45 tok/s en HF4, lo que permite asistentes de texto en estaciones de trabajo sin GPU NVIDIA.
- Despliegue de alta throughput en gama alta AMD: en RX 7900 XTX, HF4 rinde 138 tok/s y MQ4 135 tok/s, suficiente para servir varios usuarios concurrentes en un unico nodo consumer.
- Evaluacion de calidad de cuantizacion: la variante MQ4, con su puerta de calidad byte-exacta sobre nueve flujos de referencia, sirve como banco de pruebas para comparar el impacto de la rotacion FWHT frente a cuantizacion plana de 4 bits.
- Entornos con requisitos estrictos de reproducibilidad: la validacion byte-exacta en cada commit del motor permite usar el modelo en pipelines donde una regresion numerica silenciosa debe detectarse antes de produccion.
- Prototipado rapido sin dependencias Python: la instalacion mediante script y el comando `hipfire pull` reducen el tiempo de puesta en marcha en maquinas AMD con stack HIP ya configurado.
- Seleccion adaptativa calidad/velocidad: HF6 con 6,79 GB y aproximadamente un 15 % menos velocidad que HF4 cubre escenarios donde se dispone de VRAM adicional y se prioriza fidelidad frente a FP16.
- Investigacion sobre arquitecturas hibridas DeltaNet: el modelo permite experimentar con un transformer hibrido de 9 mil millones de parametros en hardware AMD de consumo, un segmento habitualmente desatendido por los motores de inferencia principales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento publicados son velocidades de forward pass en tok/s:

| Variante | Tamano | VRAM minima | RX 5700 XT | RX 7900 XTX |
|---|---|---|---|---|
| HF4 | 4,44 GB | 6 GB | 45 tok/s | 138 tok/s |
| HF6 | 6,79 GB | 8 GB | 37 tok/s | no disponible |
| MQ4 | 4,95 GB | 6 GB | no disponible | 135 tok/s |

## Requisitos de hardware

- VRAM estimada: 6 GB para HF4 y MQ4; 8 GB para HF6.
- GPUs validadas en la model card: RX 5700 XT (RDNA1) y RX 7900 XTX (RDNA3). El motor declara soporte para RDNA1 a RDNA4.
- Cabe en GPUs de consumo AMD con 6-8 GB de VRAM; no se documenta soporte para GPUs NVIDIA ni para aceleradores de datacenter (A100, H100) en la informacion disponible.
- Opciones de despliegue: exclusivamente el motor hipfire (Rust + HIP), instalable mediante script y operable con los comandos `hipfire pull` y `hipfire run`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 45 tok/s (HF4, RX 5700 XT), 37 tok/s (HF6, RX 5700 XT), 138 tok/s (HF4, RX 7900 XTX), 135 tok/s (MQ4, RX 7900 XTX). La rama 0.1.4-alpha del motor introduce una revision de fusion de kernels que aproximadamente duplica la velocidad de forward en Qwen3.5 respecto a la release anterior.
- Latencia: no disponible de forma explicita; puede estimarse a partir del throughput en regimen de decodificacion.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de calidad ni de especificaciones de contexto que permitan una comparacion rigurosa con alternativas. La unica comparacion interna posible es entre las tres variantes de cuantizacion de esta misma publicacion:

| Variante | Tamano | Bytes/peso aprox. | VRAM minima | Velocidad maxima documentada | Perfil |
|---|---|---|---|---|---|
| HF4 | 4,44 GB | 0,53 | 6 GB | 138 tok/s (RX 7900 XTX) | Maximo throughput |
| MQ4 | 4,95 GB | 4,25 efectivos con rotacion FWHT | 6 GB | 135 tok/s (RX 7900 XTX) | Calidad proxima a Q8 |
| HF6 | 6,79 GB | 0,78 | 8 GB | 37 tok/s (RX 5700 XT) | Minima perdida frente a FP16 |

Comparativa con modelos de terceros: no disponible.

## Limitaciones y advertencias

- El repositorio no registra descargas ni likes, y la model card no documenta evaluaciones de calidad independientes mas alla de la puerta byte-exacta sobre nueve prompts de referencia.
- La puerta de calidad de MQ4 verifica reproducibilidad numerica frente a una linea base, no correccion semantica; una salida byte-exacta puede seguir siendo incorrecta.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad del modelo base en la informacion proporcionada.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingue ni calidad por idioma.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con ventanas largas.
- Compatibilidad limitada al motor hipfire y a GPUs AMD RDNA1-RDNA4; no hay soporte documentado para CUDA, ROCm generico ni otros runtimes.
- La licencia MIT aplica al motor hipfire, no a los pesos, que quedan sujetos a la licencia de Qwen/Qwen3.5-9B; debe revisarse esa licencia antes de uso comercial.
- El estado alpha de la rama 0.1.4 sugiere que el rendimiento y los kernels pueden cambiar entre releases.
- El contenedor propietario (.hf4/.hf6/.mq4) no es interoperable con llama.cpp, vLLM ni otras herramientas estandar, lo que limita portabilidad y auditoria con utilidades convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hipfire-models/qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del motor hipfire: https://github.com/Kaden-Schutt/hipfire
- Script de instalacion: https://raw.githubusercontent.com/Kaden-Schutt/hipfire/master/scripts/install.sh
- Listado de modelos soportados: https://github.com/Kaden-Schutt/hipfire/blob/master/docs/MODELS.md
- Lineas base de calidad: https://github.com/Kaden-Schutt/hipfire/tree/master/tests/quality-baselines
