# flavianv/abstractgym-qwen3-14b-membership

## Resumen

`flavianv/abstractgym-qwen3-14b-membership` es un adaptador LoRA (no un modelo completo) entrenado sobre el modelo base denso Qwen3-14B. Lo publica el usuario flavianv dentro del proyecto de investigacion AbstractGym y su proposito no es la generacion general de texto, sino resolver una tarea concreta y acotada: decidir la pertenencia (*membership*) de cadenas a un lenguaje abstracto definido por corchetes, alfabetos reducidos (uvwxy) y profundidades de 0 a 4. Es, por tanto, un artefacto de investigacion orientado a medir hasta que punto un LLM puede aprender una tarea formal mediante ajuste fino con LoRA.

El adaptador se entrena exclusivamente con respuestas binarias (si/no) sobre 367 casos de desarrollo. El conjunto de retencion (*held-out*) consta de 92 casos con dos alfabetos disjuntos y profundidades de hasta 16, lo que introduce una prueba de generalizacion fuera de distribucion. No se usa supervision de acciones paso a paso (*step-action*); el modelo solo aprende a emitir la respuesta de pertenencia, no la traza de ejecucion. Los resultados publicados muestran 82/92 aciertos en pertenencia directa, muy por encima de los 11/92 en ejecucion en vivo, lo que evidencia que el adaptador aprende la tarea de decision pero no se convierte en un ejecutor fiable del formalismo.

Su relevancia es fundamentalmente metodologica: sirve como punto de referencia sobre la separacion entre "acertar la respuesta" y "saber ejecutar el procedimiento" en tareas de razonamiento formal, y sobre la transferencia de adaptadores LoRA pequenos (rango 16) a problemas simbolicos fuera de distribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (Qwen3-14B) |
| Parametros totales | 14B (modelo base) + adaptador LoRA; el adaptador ocupa 0,3 GB en disco |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-14B) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors (BF16 base, FP32 adaptadores). No se ofrecen variantes GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (adaptadores y modelo base Qwen3) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de tipo LoRA ordinario, de rango 16 y alpha 32, sin dropout, aplicado sobre las proyecciones q/k/v/o y gate/up/down del modelo base Qwen3-14B (transformer decoder-only denso). El modelo base se mantiene en BF16 y los adaptadores entrenan en FP32. El modelo base esta fijado a una revision concreta (`40c069824f4251a91eefaf281ebe4c544efd3e18`) y el adaptador evaluado corresponde al subdirectorio `seed-17/`.

El entrenamiento usa muestreo balanceado de pertenencia con reemplazo, disenado para aproximar el presupuesto de tokens procesados de la variante con pasos de corchete: 1.355.687 tokens procesados programados, 260 actualizaciones del optimizador, lote efectivo de 32 (micro-lote 8 x acumulacion 4) y tasa de aprendizaje 2e-4 con calentamiento del 5 %, decaimiento coseno y recorte de gradiente igual a 1. Se emplea AdamW con decaimiento de peso 0,01. Segun la propia model card, una "epoca" registrada en los metadatos corresponde a una programacion generada, no a una pasada completa sobre los 367 ejemplos. Se guarda unicamente el checkpoint final, sin seleccion por conjunto de validacion, y no se incluye estado del optimizador.

## Capacidades

- Decision de pertenencia binaria (*membership*): el adaptador responde si una cadena pertenece al lenguaje definido por corchetes dentro del marco AbstractGym.
- Razonamiento formal acotado sobre alfabetos uvwxy y profundidades de 0 a 4 (entrenamiento) con generalizacion parcial hasta profundidad 16 (retencion).
- Salida en modo "thinking off" y decodificacion greedy, con tope de 128 tokens para respuestas directas o de paso, y 4.096 tokens para trazas completas.
- No soporta tool calling ni function calling (no disponible / no contemplado en la model card).
- No soporta agentes ni razonamiento multi-paso autonomo de forma fiable: la ejecucion en vivo solo alcanza 11/92, segun los propios resultados del autor.
- Capacidades multilingues limitadas al ingles.
- No dispone de modo de vision, audio ni thinking mode util en las evaluaciones reportadas.
- No es un ejecutor general del formalismo: el *harness* externo es quien aporta la mutacion de estado.

## Casos de uso

- Investigacion en razonamiento formal: usar el adaptador como punto de referencia para comparar como distintos ajustes (supervision binaria frente a supervision de pasos) afectan a la generalizacion en tareas de pertenencia a lenguajes abstractos.
- Estudio de la brecha respuesta/ejecucion: medir en que medida un modelo que acierta la pertenencia (82/92) es incapaz de reproducir la traza de ejecucion (11/92), como experimento controlado sobre evaluacion de razonamiento.
- Analisis de generalizacion fuera de distribucion: probar el adaptador con alfabetos disjuntos y profundidades mayores que las de entrenamiento para caracterizar la transferencia de un LoRA de rango 16.
- Reproducibilidad metodologica: servir como receta publica (hiperparametros, presupuesto de tokens, semilla fija) para replicar experimentos de ajuste fino con LoRA sobre tareas simbolicas.
- Pruebas de evaluacion de adaptadores PEFT: integrar el adaptador en un pipeline propio (`PeftModel.from_pretrained` sobre la revision fijada del base) para validar *harnesses* y protocolos de evaluacion de AbstractGym.
- Docencia sobre limites de los LLM en tareas formales: ilustrar con datos concretos por que un modelo puede aprender la decision sin aprender el procedimiento.
- Benchmarking de tecnicas de ajuste: usar el adaptador como linea base "membership-only" frente a variantes con supervision de acciones en estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de evaluacion son los del conjunto de retencion propio de AbstractGym, recogidos en la model card:

| Interfaz | Exitos / casos |
| --- | --- |
| Pertenencia directa (*direct membership*) | 82/92 |
| Ejecucion en vivo (*live execution*) | 11/92 |

Detalles del protocolo de evaluacion: decodificacion greedy, modo thinking desactivado, tope de 128 tokens para respuestas directas o de paso y 4.096 tokens para la traza completa. Todos los fallos se conservan. Los resultados y desgloses provienen de `docs/results/2026-10-04-x8` en el codigo publico del proyecto.

## Requisitos de hardware

- VRAM para el modelo base en BF16: aproximadamente 28 GB solo para los pesos de Qwen3-14B, mas overhead de activaciones y cache KV.
- VRAM adicional para el adaptador: minima, dado que el repositorio ocupa 0,3 GB y los adaptadores se guardan en FP32.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer de gama alta con suficiente memoria (RTX 4090 24 GB) aplicando cuantizacion del base o descarga parcial.
- Cabe en GPU consumer: solo con el base cuantizado (por ejemplo 8 bits o 4 bits), ya que en BF16 completo no entra en 24 GB.
- Opciones de despliegue: `transformers` con PEFT (`PeftModel.from_pretrained`), y potencialmente vLLM o TGI con soporte de adaptadores LoRA. No se ofrecen pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion propia.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados en la informacion proporcionada (adaptadores especificos para la tarea de pertenencia de AbstractGym). Como referencia interna, la propia model card distingue esta variante "membership-only" de la variante con supervision de pasos de corchete del mismo proyecto, pero no se facilitan sus cifras. Comparativa orientativa con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| flavianv/abstractgym-qwen3-14b-membership | 14B + LoRA | no disponible | Pertenencia en AbstractGym | apache-2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3-14B (base) | 14B | no disponible | Proposito general | apache-2.0 | HuggingFace |
| Otras variantes AbstractGym | no disponible | no disponible | no disponible | apache-2.0 | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos; al ser un adaptador de investigacion sobre una tarea formal, su comportamiento esta acotado al marco AbstractGym.
- Riesgo de alucinacion: relevante en la interfaz de ejecucion en vivo, donde solo acierta 11/92; el modelo puede producir trazas plausibles pero incorrectas.
- Distincion critica de metricas: la exactitud de pertenencia, la exactitud de accion local y la ejecucion completa son mediciones distintas; no deben confundirse al citar el 82/92.
- Limitaciones de transferencia: los mapas de simbolos, la familia de gramaticas y el limite de profundidad condicionan la transferencia; el rendimiento fuera de ese rango no esta garantizado.
- No es un ejecutor general fiable: el *harness* externo es quien realiza la mutacion de estado, y no se incluye recuperacion ni reparacion de errores.
- Entrenamiento con una unica semilla y una unica receta fija: no se aporta evidencia de robustez entre semillas ni de seleccion por validacion.
- Limitacion de idioma: solo ingles.
- Restricciones de licencia: licencia apache-2.0, lo que permite uso comercial tanto de los adaptadores como del modelo base obtenido por separado; no obstante, al ser un artefacto de investigacion, su idoneidad para produccion es muy limitada.
- Solo se incluyen los safetensors del adaptador; no hay estado del optimizador ni pesos fusionados, y la evaluacion se hizo con adaptadores nativos, no con pesos mergeados.

## Enlaces

- HuggingFace: https://huggingface.co/flavianv/abstractgym-qwen3-14b-membership
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Codigo publico de AbstractGym: https://github.com/flavianv/abstractgym-public/tree/main
- Resultados de evaluacion citados: `docs/results/2026-10-04-x8` (dentro del repositorio de codigo publico)
- Metadatos de entrenamiento: `seed-17/training.json` (incluido en el repositorio del adaptador)
