# antongoorin/outpost2-decomp-qwen-lora-A

## Resumen

outpost2-decomp-qwen-lora-A es un adaptador LoRA de PEFT entrenado por el usuario antongoorin sobre el modelo base Qwen/Qwen3.8-27B. Su propósito es muy específico: reescribir funciones individuales de C++ del videojuego *Outpost 2* de forma que el compilador Visual C++ 4.2 vuelva a emitir exactamente los mismos bytes que el binario original. Se trata, por tanto, de una herramienta de *matching decompilation*, una tarea de ingeniería inversa en la que el objetivo no es solo que el código sea funcionalmente correcto, sino que sea byte-idéntico tras compilar.

El adaptador forma parte del proyecto Outpost2Remake (tarea #987 de TethysGame) y se entrenó sobre el conjunto de datos antongoorin/outpost2-decomp-261104-v2. Técnicamente es un LoRA de rango 32 y alpha 64 que activa 233.455.616 parámetros entrenables (un 0,8605 % del total del modelo base de 27.129.454.080 parámetros). El modelo base se cargó en cuantización 4-bit NF4 con doble cuantización y cómputo en bfloat16 durante el entrenamiento, mientras que los pesos del adaptador se guardan en float32.

Su relevancia es acotada pero clara para quien trabaja en decompilación asistida por IA: el adaptador mejora de forma medible la tasa de coincidencia byte a byte frente al modelo base sin adaptador, pasando de 21/100 a 49/100 casos resueltos en la suite de evaluación, con una mejora especialmente marcada en tareas de reparación de funciones existentes. No es un modelo de propósito general, sino un artefacto de investigación altamente especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer causal Qwen3_5ForConditionalGeneration |
| Parametros totales | 233.455.616 (adaptador); 27.129.454.080 (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración de servicio con llama.cpp); entrenamiento con max_length 16.384 |
| Tipos de cuantizacion | Base: 4-bit NF4 con doble cuantización (entrenamiento); adaptador en float32 (safetensors) y F16 (GGUF); base GGUF Q4_K_M |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se documenta en la ficha) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors, 992 tensores) y GGUF F16 (adapter-f16.gguf) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.8-27B, un transformer causal de la familia Qwen3.5 (arquitectura qwen35 según los metadatos GGUF). La configuración LoRA usa r = 32, alpha = 64, dropout de 0,05 y `target_modules` all-linear con tarea CAUSAL_LM. El entrenamiento empleó AdamW con learning rate 1e-4, betas (0,9, 0,99), weight decay 0, gradient clipping de 1,0 y un schedule de warmup lineal de 10 pasos seguido de decaimiento coseno hasta 0,1 veces el learning rate.

El proceso se ejecutó durante una época con acumulación de gradiente 16, longitud máxima de 16.384 tokens y semilla 987, totalizando 378 pasos de optimizador, 6.063 ejemplos de entrenamiento y 35.223.128 tokens. Se descartaron 191 ejemplos que superaban los 16.384 tokens. La validación se realizó cada 50 pasos sobre 40 ejemplos, con la cabeza aplicada en fragmentos de 256. El entrenamiento se llevó a cabo en una NVIDIA L40S (46.068 MiB de VRAM), con el proceso interrumpido tras el paso 130 y reanudado desde el paso 100. La pérdida de validación final fue de 0,0988 (0,0987526 almacenada), descendiendo desde 0,220545 en el paso 0. Los ejemplos de entrenamiento incluyen líneas naturales y líneas con `meta.source` marcado como `synth` o `draft`.

## Capacidades

- Generación de código C++ orientada a la reescritura de funciones de *Outpost 2* para matching decompilation.
- Reparación de funciones existentes: reescribir código C++ ya presente para que Visual C++ 4.2 emita los bytes originales (tasa de coincidencia del 74,4 % en el conjunto de evaluación).
- Escritura desde cero de funciones: capacidad limitada, con solo un 18,4 % de coincidencia byte a byte.
- Generación de una única respuesta en un bloque `cpp` cercado, sin texto adicional, siguiendo el formato exigido por la herramienta `splice.py extract_code`.
- Soporte de plantilla de chat de Qwen con `enable_thinking=False`; el modo de razonamiento extendido se desactiva tanto en entrenamiento como en inferencia.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específico en la información disponible.

## Casos de uso

- Reparación de funciones en proyectos de decompilación: dado el código C++ actual de una función y notas de referencia, el adaptador propone una reescritura que el compilador traduce a los bytes originales. Es su caso de uso principal, con un 74,4 % de acierto en el conjunto de evaluación.
- Asistencia en la reconstrucción de *Outpost 2*: integrado en el flujo de trabajo de Outpost2Remake, permite a los desarrolladores acelerar la conversión de binarios a código fuente compilable e idéntico byte a byte.
- Generación de borradores de funciones simples: aunque débil (18,4 % de coincidencia), puede servir como punto de partida que un humano revisa y ajusta, reduciendo el tiempo inicial de escritura.
- Investigación en decompilación asistida por IA: el adaptador y su suite de evaluación de 100 casos proporcionan una base reproducible para estudiar la eficacia de LoRA en tareas de matching.
- Integración en pipelines de CI/CD de proyectos de ingeniería inversa: mediante llama.cpp o transformers, puede automatizar la propuesta de reescrituras y validar la coincidencia byte a byte contra el binario de referencia.
- Evaluación comparativa de estrategias de fine-tuning: el adaptador documenta con detalle su configuración, pérdidas de validación y resultados, lo que lo convierte en un caso de estudio para quienes comparan LoRA de rango 32 frente a otras configuraciones en tareas de código especializado.

## Benchmarks y rendimiento

Evaluación single-shot con temperatura 0, máximo 8.000 tokens, `enable_thinking=False` y una petición a la vez, sobre la suite `bench_standard.txt` de 100 casos:

| Modelo | Compilados | Coincidentes (byte score 0) |
|---|---|---|
| Base sin adaptador | 62/100 | 21/100 |
| Este adaptador | 71/100 | 49/100 |

Por tipo de tarea, la tasa de coincidencia es del 74,4 % en reparación frente al 44,2 % del base, y del 18,4 % en escritura desde cero frente al 2,6 % del base. Emparejado en los 100 casos, 29 fueron resueltos solo por el adaptador y 1 solo por el base; prueba exacta de McNemar con p = 5,774e-08. Advertencias del propio informe: la suite incluye 19 funciones sintéticas, la escritura desde cero sigue siendo débil y dos respuestas del adaptador alcanzaron el límite de 8.000 tokens (el base lo alcanzó 11 veces).

## Requisitos de hardware

- El adaptador en sí ocupa 1,4 GB (repositorio completo) y no requiere VRAM significativa; el coste está en el modelo base.
- Entrenamiento realizado en una NVIDIA L40S con 46.068 MiB, base en 4-bit NF4 y cómputo bfloat16.
- Para inferencia con llama.cpp se documenta el uso de un GGUF Q4_K_M del base con `-ngl 99`, contexto 32.768 y un solo slot en paralelo.
- Para transformers y PEFT se documenta la carga del base en 4-bit NF4 con doble cuantización y `device_map={"": 0}`, lo que sugiere que cabe en una GPU de 24 GB con esa cuantización, aunque no se especifica explícitamente.
- Opciones de despliegue documentadas: llama.cpp (`llama-server` con `--lora adapter-f16.gguf`) y transformers + PEFT con BitsAndBytes. No se documentan vLLM, TGI ni Ollama para el adaptador.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Coincidencia byte a byte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| outpost2-decomp-qwen-lora-A | 233 M (adaptador) sobre 27,1 B | 32.768 | 49/100 | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (base sin adaptador) | 27,1 B | 32.768 | 21/100 | no disponible | HuggingFace |
| Otros adaptadores de decompilación | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de matching decompilation en la documentación proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el adaptador solo es útil para reescritura de funciones C++ de *Outpost 2* con Visual C++ 4.2; no es un modelo de propósito general.
- Escritura desde cero débil: solo un 18,4 % de coincidencia byte a byte en funciones nuevas, frente al 74,4 % en reparación.
- La suite de evaluación incluye 19 funciones sintéticas de 100, lo que puede inflar o sesgar los resultados.
- Dos respuestas del adaptador alcanzaron el límite de 8.000 tokens, lo que indica riesgo de respuestas truncadas en funciones complejas.
- El informe señala que la autoevaluación con escritura propia sobre la suite no compiló, lo que sugiere fragilidad en escenarios fuera de distribución.
- No se documenta la licencia, lo que impide conocer las restricciones de uso comercial.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas más allá de las inherentes al modelo base.
- El adaptador se entrenó con ejemplos que incluyen fuentes `synth` y `draft`; una variante (Run B) que las eliminó fue descartada, lo que indica que la calidad de esos datos no está plenamente validada.
- El proceso de entrenamiento se interrumpió y reanudó, lo que puede introducir inconsistencias menores no documentadas.
- El modelo base Qwen3.8-27B no está verificado en cuanto a su URL exacta de GGUF Q4_K_M; el autor indica que no se re-comprobó el blob upstream.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/antongoorin/outpost2-decomp-qwen-lora-A
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/antongoorin/outpost2-decomp-261104-v2
- Proyecto Outpost2Remake: https://github.com/TethysGame/Outpost2Remake
