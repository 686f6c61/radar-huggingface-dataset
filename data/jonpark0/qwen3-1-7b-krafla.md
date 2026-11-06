# jonpark0/Qwen3-1.7B-krafla

## Resumen

Qwen3-1.7B-krafla es una conversion cuantizada del modelo Qwen/Qwen3-1.7B, publicada por el desarrollador jonpark0 para su uso con Krafla, un runtime de inferencia en C11 sin dependencias externas que ejecuta modelos exclusivamente en CPU. El paquete incluye tres variantes de pesos en formato propio `.mlb` (Q4_0 completo, Q4_0 mixto con las matrices `v`, `o` y `down` en Q8_0, y Q8_0 completo) junto con el tokenizador convertido a `.mlt`. No se trata de un modelo nuevo ni de un fine-tuning: es una redistribucion optimizada del modelo base de Qwen para un motor de inferencia alternativo.

El modelo subyacente, Qwen3-1.7B, es un transformer denso de 1.700 millones de parametros desarrollado por el equipo Qwen de Alibaba, con una ventana de contexto nativa de 40.960 posiciones y soporte de modo de razonamiento explicito (`<think>`) que puede desactivarse mediante el sufijo `/no_think`. La relevancia de esta publicacion radica en que permite ejecutar dicho modelo en hardware sin GPU, con binarios nativos para x86-64 (desde SSE2 hasta AVX-512 VNNI) y ARM (desde ARMv7 NEON hasta i8mm y SVE), incluyendo una implementacion compatible con la API de OpenAI.

El interes practico esta en el despliegue en entornos restringidos: servidores sin acelerador, equipos de escritorio, dispositivos ARM y escenarios de borde donde instalar CUDA o PyTorch no es viable. El coste es un fichero de pesos de entre 923 MiB y 1744 MiB y unas tasas de generacion de 18 a 34 tokens por segundo medidas en un AMD EPYC 7763 con cuatro hilos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B); runtime Krafla en C11 |
| Parametros totales | 1.700 millones (modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 posiciones registradas en los ficheros; por defecto 4.096 en `ml_run`/`ml_server`, configurable con `--ctx N` |
| Tipos de cuantizacion | Q4_0 (4,5 bits/peso), Q4_0 mixto con `v,o,down` en Q8_0, Q8_0 (8,5 bits/peso); escalas f16 por bloque de 32 pesos |
| Idiomas soportados | No disponible (la model card no detalla el reparto linguistico) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | `.mlb` (formato propio de Krafla); tokenizador en `.mlt`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3-1.7B es un transformer decoder-only denso con atencion por cabezas de consulta agrupadas (GQA) y normalizacion RMSNorm, entrenado por el equipo Qwen. La model card de esta publicacion no aporta informacion sobre el volumen de tokens de entrenamiento, la composicion del corpus ni las etapas de alineacion (RLHF, DPO u otras); esos detalles corresponden a la documentacion del modelo original.

La contribucion tecnica de esta ficha es el proceso de conversion y el runtime. Krafla convierte los safetensors originales a su formato `.mlb` mediante `tools/convert.py`, aplicando cuantizacion por bloques de 32 pesos con una escala f16 por bloque, lo que resulta en 4,5 bits por peso en Q4_0 y 8,5 bits por peso en Q8_0. La variante mixta mantiene en Q8_0 las matrices de proyeccion de valor, salida y down-projection, que son las mas sensibles a la cuantizacion agresiva, y deja el resto en Q4_0. El runtime selecciona en tiempo de ejecucion la extension SIMD mas capable disponible en la CPU (SSE2, AVX2, AVX-512 VNNI, NEON, i8mm, SVE) y expone un servidor compatible con la API de OpenAI.

## Capacidades

- Generacion de texto autoregresiva con decodificacion greedy y muestreo, ejecutada en CPU.
- Modo de razonamiento explicito: el modelo emite bloques `<think>...</think>` antes de la respuesta; puede desactivarse con el sufijo `/no_think` en el prompt.
- Conversacion multi-turno mediante plantilla ChatML (`--chat chatml`).
- Servidor HTTP con endpoints compatibles con la API de OpenAI (`/v1`) a traves de `ml_server`.
- Ajuste del tamano de la cache KV en tiempo de ejecucion con `--ctx N`, hasta el limite de 40.960 posiciones del modelo.
- Control del numero de hilos de computo con `-t N`.
- Capacidades multilingues: no documentadas en esta publicacion; dependen del modelo base.
- Tool calling, function calling y uso como agente: no documentados en esta model card; deben verificarse contra el modelo base.

## Casos de uso

- Inferencia en servidores sin GPU: el runtime Krafla es C11 sin dependencias y se distribuye como binario nativo, por lo que puede desplegarse en maquinas virtuales o contenedores sin CUDA, PyTorch ni bibliotecas de aceleracion. La variante Q4_0 de 923 MiB es la opcion con menor huella de memoria.
- Sustitucion local de la API de OpenAI: `ml_server` expone un endpoint compatible en `http://127.0.0.1:8080/v1`, lo que permite apuntar clientes existentes al modelo sin cambiar el codigo de integracion. Util para desarrollo offline y pruebas de integracion.
- Despliegue en dispositivos ARM: los binarios cubren AArch64 y ARMv7 con rutas NEON, i8mm y SVE, lo que habilita la ejecucion en placas SBC y equipos ARM de escritorio donde no hay acelerador grafico.
- Procesamiento por lotes en CPU de clústeres: con 74-114 tok/s de prefill y 18-34 tok/s de decodificacion en cuatro hilos de un EPYC 7763, el modelo sirve para tareas de extraccion, clasificacion o resumen de volumen moderado sin consumir recursos de GPU.
- Asistente de documentacion o codigo en estaciones de trabajo: el contexto por defecto de 4.096 posiciones y la plantilla ChatML permiten mantener conversaciones tecnicas multi-turno; el modo `/no_think` reduce la latencia cuando no se requiere razonamiento explicito.
- Entornos air-gapped o de cumplimiento estricto: al ser un binario autonomo con pesos locales y licencia Apache 2.0, el modelo puede operar sin conexion saliente ni dependencias de terceros, lo que simplifica auditorias de cadena de suministro.
- Pruebas de regresion de motores de inferencia: las tres variantes con perplexity publicada (20,97 / 22,85 / 23,95 en wikitext-2) sirven como referencia reproducible para validar implementaciones o comparar hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente reporta perplexity en wikitext-2 y velocidades de inferencia medidas en un GitHub runner con AMD EPYC 7763 de 64 nucleos y 4 hilos, compilacion `avx2`:

| Fichero | Pesos | Tamano | Perplexity (wikitext-2) | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|---|---|---|
| `Qwen3-1.7B-Q4_0.mlb` | Q4_0, todas las matrices a 4 bits | 923 MiB | 23,95 | 114 | 34,4 |
| `Qwen3-1.7B-Q4_0-mixed.mlb` | Q4_0 con `v,o,down` en Q8_0 | 1175 MiB | 22,85 | 95 | 27,6 |
| `Qwen3-1.7B-Q8_0.mlb` | Q8_0, todas las matrices a 8 bits | 1744 MiB | 20,97 | 74 | 18,5 |

La perplexity se midio con `tools/perplexity.py --ctx 512 --chunks 4` (4 fragmentos de 512 tokens) y solo es comparable entre ficheros del mismo modelo. Las velocidades provienen de `ml_bench -n 128` (128 tokens de prompt y 128 tokens decodificados).

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU. La memoria RAM necesaria es aproximadamente el tamano del fichero de pesos mas la cache KV: unos 0,9 GB para Q4_0, 1,2 GB para Q4_0 mixto y 1,7 GB para Q8_0, sin contar la cache KV (que crece con `--ctx`).
- GPU recomendadas: ninguna; el runtime no usa aceleracion grafica.
- CPU compatibles: x86-64 desde SSE2 hasta AVX-512 VNNI; ARM desde ARMv7 NEON hasta i8mm y SVE. El binario `ml_run` selecciona automaticamente la build mas capable que soporte el procesador.
- Sistemas operativos con binarios oficiales: Linux x86-64, AArch64 y ARMv7; Windows x86-64. Requiere Krafla 0.8.0 o superior.
- Hilos: configurables con `-t N`; las cifras publicadas corresponden a 4 hilos.
- Opciones de despliegue: `ml_run` (CLI) y `ml_server` (API compatible con OpenAI). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.mlb` es propio de Krafla.
- Latencia y throughput: 114/34,4 tok/s (prefill/decode) en Q4_0, 95/27,6 en Q4_0 mixto y 74/18,5 en Q8_0, medidos en un AMD EPYC 7763 con 4 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-krafla (esta ficha) | 1,7 B | 40.960 (4.096 por defecto) | `.mlb` + Krafla, solo CPU | Apache 2.0 | Perplexity 20,97-23,95 en wikitext-2; 18,5-34,4 tok/s en 4 hilos |
| Qwen/Qwen3-1.7B (original) | 1,7 B | 40.960 | safetensors, requiere framework (PyTorch, etc.) | Apache 2.0 | Pesos sin cuantizar; referencia de calidad del modelo base |
| Conversiones GGUF de Qwen3-1.7B para llama.cpp | 1,7 B | 40.960 | GGUF + llama.cpp, CPU/GPU | Apache 2.0 | Ecosistema mas amplio y soporte de GPU; no se dispone de cifras comparativas en la informacion proporcionada |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento del modelo frente a alternativas de la misma categoria; la unica metrica publicada es la perplexity interna del propio paquete.

## Limitaciones y advertencias

- La model card no documenta sesgos, comportamiento en dominios sensibles ni evaluaciones de seguridad; deben asumirse los del modelo base Qwen3-1.7B.
- Riesgo de alucinacion inherente a un modelo de 1,7 B de parametros; no se han publicado evaluaciones de factualidad.
- El contexto efectivo por defecto es de 4.096 posiciones, muy inferior a las 40.960 que soporta el modelo; ampliarlo con `--ctx N` incrementa el uso de memoria de la cache KV.
- El formato `.mlb` es exclusivo de Krafla: los pesos no son utilizables directamente con llama.cpp, vLLM, Transformers u otras herramientas. La conversion solo esta documentada en sentido inverso (desde safetensors hacia `.mlb`).
- No hay soporte de GPU; el rendimiento depende enteramente de la CPU y del conjunto de instrucciones SIMD disponible. En CPUs sin AVX2 las tasas de generacion seran previsiblemente inferiores a las publicadas.
- La cuantizacion Q4_0 degrada la perplexity de 20,97 (Q8_0) a 23,95; la variante mixta recupera parte de la calidad (22,85) a costa de un 27 % mas de tamano.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-03; se trata de una publicacion muy reciente y sin validacion communitaria.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base Qwen3-1.7B por si incorporan condiciones adicionales de uso aceptable.
- No se documentan capacidades de tool calling ni de agente para esta conversion; no deben asumirse en produccion sin pruebas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jonpark0/Qwen3-1.7B-krafla
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Runtime Krafla: https://github.com/JonPark0/krafla
- Releases de Krafla: https://github.com/JonPark0/krafla/releases
- Guia de usuario de Krafla: https://github.com/JonPark0/krafla/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/krafla/blob/main/docs/benchmarks.md
- Commit de conversion: https://github.com/JonPark0/krafla/commit/0b527a04aebd4234ed3c2197bfbb0248a1628ac7
