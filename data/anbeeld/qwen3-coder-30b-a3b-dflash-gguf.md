# Anbeeld/Qwen3-Coder-30B-A3B-DFlash-GGUF

## Resumen

El repositorio `Anbeeld/Qwen3-Coder-30B-A3B-DFlash-GGUF` contiene cuantizaciones GGUF del modelo drafter **DFlash** desarrollado por z-lab, un método de decodificación especulativa basado en un modelo de difusión de bloques ligero. Este drafter se utiliza junto con el modelo objetivo `Qwen/Qwen3-Coder-30B-A3B-Instruct` para acelerar la generación de texto mediante la producción paralela de bloques de tokens candidatos que el modelo objetivo valida y acepta. El autor de la cuantización, Anbeeld, la ha preparado para su uso con **BeeLlama.cpp**, un fork de llama.cpp con características avanzadas de cuantización.

El modelo original DFlash ha sido entrenado con solo 289K muestras (frente a las 1.4M de EAGLE-3) y, según sus autores, supera a EAGLE-3 en aceleración de inferencia, lo que demuestra una alta eficiencia de entrenamiento. La relevancia de esta cuantización GGUF radica en que permite ejecutar decodificación especulativa con DFlash en entornos locales o con recursos limitados, sin necesidad de una GPU de datacenter. La arquitectura del drafter es un modelo de difusión de bloques, aunque no se especifican sus parámetros totales ni su longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de bloques (block diffusion) para decodificacion especulativa (DFlash) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo Qwen3-Coder-30B-A3B, que soporta hasta 1M tokens) |
| Tipos de cuantizacion | no disponible (el repositorio no lista cuantizaciones concretas; tamano del repo 0.0 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (segun el nombre del repositorio) |

## Arquitectura y entrenamiento

DFlash es un metodo de decodificacion especulativa que emplea un modelo de difusion de bloques como drafter. A diferencia de los drafter autoregresivos tradicionales (como EAGLE-3), este modelo genera bloques completos de tokens en paralelo mediante un proceso de difusion, lo que reduce la latencia por paso y mejora el rendimiento en entornos con alta concurrencia. El drafter debe usarse obligatoriamente junto con el modelo objetivo `Qwen/Qwen3-Coder-30B-A3B-Instruct`, que es un MoE de 30.5B parametros totales y 3.3B activos por token, con soporte de contexto de hasta 1M tokens.

El entrenamiento del drafter se realizo sobre 289K muestras, compuestas por el split de codigo de `nvidia/Nemotron-Post-Training-Dataset-v2`, el dataset `theblackcat102/evol-codealpaca-v1` y aproximadamente 2.8K trazas de ejecucion de Cline recopiladas por los autores. Esta cantidad es significativamente menor que los 1.4M de muestras usadas por EAGLE-3, y aun asi DFlash logra una mayor aceleracion, lo que sugiere que el metodo de difusion es intrínsecamente mas eficiente en el aprovechamiento de los datos de entrenamiento. La evaluacion se realizo con SGLang sobre una GPU B200, usando un bloque de especulacion de tamano 16.

## Capacidades

- Decodificacion especulativa: genera bloques de tokens candidatos en paralelo para el modelo objetivo Qwen3-Coder-30B-A3B, reduciendo la latencia de inferencia.
- Compatibilidad con multiples motores de inferencia: SGLang (algoritmo `DFLASH`), vLLM (metodo `dflash`), Transformers (metodo `spec_generate`) y BeeLlama.cpp (fork de llama.cpp con cuantizacion avanzada).
- Soporte de cuantizacion GGUF para despliegue local eficiente en CPU o GPU de gama media.
- No es un modelo autonomo: no genera texto por si mismo, sino que actua como acelerador del modelo objetivo.
- Capacidad de aceptacion de tokens alta, comparable en bfloat16 y FP8 del modelo objetivo, segun los autores.

## Casos de uso

- Servidores de inferencia de codigo con baja latencia: desplegar Qwen3-Coder-30B-A3B con DFlash en SGLang o vLLM para servir APIs compatibles con OpenAI (chat completions) con menor tiempo de respuesta por peticion.
- Desarrollo local asistido por IA: usar BeeLlama.cpp con la cuantizacion GGUF para ejecutar decodificacion especulativa en una estacion de trabajo con una GPU consumer, acelerando la generacion de codigo en editores o IDEs.
- Agentes de codigo autonomos: el modelo objetivo soporta agentic coding y tool calling; DFlash reduce la latencia en ciclos de razonamiento multi-paso, mejorando la experiencia en tareas de planificacion y ejecucion de acciones.
- Pruebas de concepto en entornos con una unica GPU: la evaluacion oficial se realizo en una B200, pero la cuantizacion GGUF permite probar DFlash en hardware menos potente sin perder la ventaja de la decodificacion especulativa.
- Reduccion de costes operativos: al acelerar la inferencia sin cambiar la calidad del modelo objetivo, se puede servir el mismo trafico con menos GPUs o con GPUs de menor categoria.
- Investigacion en decodificacion especulativa: el drafter DFlash sirve como referencia para estudiar metodos de difusion de bloques frente a drafter autoregresivos como EAGLE-3, con la ventaja de su menor coste de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card del modelo original indica que DFlash supera a EAGLE-3 en aceleracion de inferencia, a pesar de haber sido entrenado con aproximadamente 5 veces menos datos (289K frente a 1.4M muestras). Tambien se menciona que DFlash mantiene una longitud de aceptacion similar tanto con el modelo objetivo en bfloat16 como con su variante FP8. Todos los experimentos se realizaron con SGLang sobre una GPU B200, con un tamano de bloque de especulacion de 16 tokens. No se aportan cifras concretas de tokens por segundo ni de speedup relativo.

## Requisitos de hardware

- No se dispone de datos de VRAM estimada para el drafter DFlash en su version GGUF, ya que el repositorio no especifica los tamaños de archivo ni las cuantizaciones disponibles.
- El modelo objetivo Qwen3-Coder-30B-A3B requiere aproximadamente 18 GB de VRAM en bfloat16 (30.5B parametros totales, 3.3B activos), por lo que una GPU con 24 GB (por ejemplo, RTX 4090) es suficiente para la inferencia sin cuantizacion.
- El drafter DFlash, al ser un modelo ligero de difusion, anade una carga minima de VRAM sobre el modelo objetivo, aunque no se especifica el valor exacto.
- La evaluacion oficial se realizo en una NVIDIA B200, pero la disponibilidad de cuantizaciones GGUF sugiere que puede ejecutarse en GPUs consumer o incluso en CPU con BeeLlama.cpp.
- Opciones de despliegue: SGLang (con `--speculative-algorithm DFLASH`), vLLM (con `--speculative-config '{"method": "dflash", ...}'`), Transformers (metodo `spec_generate`) y BeeLlama.cpp para cuantizacion GGUF.
- No se dispone de datos de latencia ni throughput estimados.

## Comparativa con modelos similares

| Modelo | Metodo | Datos de entrenamiento | Aceleracion | Licencia | Despliegue |
|---|---|---|---|---|---|
| z-lab/Qwen3-Coder-30B-A3B-DFlash | Difusion de bloques | 289K muestras | Superior a EAGLE-3 (segun autores) | MIT | SGLang, vLLM, Transformers |
| lmsys/SGLang-EAGLE3-Qwen3-Coder-30B-A3B-Instruct-SpecForge | Autoregresivo (EAGLE-3) | 1.4M muestras | Inferior a DFlash (segun autores) | Apache 2.0 | SGLang |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (sin drafter) | MoE autoregresivo | no disponible | Linea base | Apache 2.0 | Cualquier motor estandar |

La comparativa se basa en las afirmaciones de los autores de DFlash, que no han sido verificadas de forma independiente en la informacion disponible. No se dispone de benchmarks publicos comparativos con cifras concretas.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo `Qwen/Qwen3-Coder-30B-A3B-Instruct` para funcionar; si se usa solo, no produce texto util.
- El repositorio de cuantizaciones GGUF tiene un tamano de 0.0 GB y 0 descargas, lo que sugiere que los archivos de pesos pueden no haberse subido aun o que el repositorio esta vacio. Verificar la disponibilidad real antes de su uso.
- Las cuantizaciones GGUF concretas no estan listadas; se desconoce si existen variantes Q4_K_M, Q5_K_M, etc., y su impacto en la calidad de la decodificacion especulativa.
- Dependencia de implementaciones especificas: la integracion con SGLang y vLLM requiere versiones nightly o ramas experimentales (por ejemplo, el PR de SGLang referenciado), lo que puede generar inestabilidad en entornos de produccion.
- Evaluacion limitada a una GPU B200; el rendimiento en GPUs consumer o en CPU no ha sido documentado.
- Sesgo potencial hacia datos de codigo (el entrenamiento se realizo mayoritariamente con datasets de codigo), lo que puede afectar a la calidad de los borradores en tareas de lenguaje natural general.
- Riesgo de alucinacion y errores en la generacion de codigo, inherente al modelo objetivo, que no se mitiga con la decodificacion especulativa.
- Licencia MIT para el drafter, pero el modelo objetivo `Qwen3-Coder-30B-A3B-Instruct` tiene licencia Apache 2.0, por lo que hay que cumplir ambas.

## Enlaces

- Repositorio HuggingFace de la cuantizacion GGUF: https://huggingface.co/Anbeeld/Qwen3-Coder-30B-A3B-DFlash-GGUF
- Modelo original DFlash: https://huggingface.co/z-lab/Qwen3-Coder-30B-A3B-DFlash
- Modelo objetivo Qwen3-Coder-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Blog del proyecto: https://z-lab.ai/projects/dflash/
- Fork BeeLlama.cpp: https://github.com/Anbeeld/beellama.cpp
- Cuantizacion GGUF de Qwen3-Coder-30B-A3B-Instruct por unsloth: https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Referencia de EAGLE-3 para SGLang: https://huggingface.co/lmsys/SGLang-EAGLE3-Qwen3-Coder-30B-A3B-Instruct-SpecForge
