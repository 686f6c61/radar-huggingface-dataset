# Jeesup/svd-safety-l2_remove60_sigma_b005

## Resumen

`Jeesup/svd-safety-l2_remove60_sigma_b005` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante SVD-LLM hasta eliminar el 59,51 % de los parámetros (fracción de parámetros densos resultante: 0,4049) y posteriormente parcialmente restaurado con un presupuesto del 0,5 % de parámetros, correspondiente a 2.720 componentes seleccionados con la regla `sigma`. Lo publica el usuario Jeesup como una celda concreta de una malla experimental sobre reglas de selección de componentes y presupuestos de restauración.

El problema que aborda es la pérdida de comportamiento de seguridad provocada por la compresión de modelos: la propia model card señala que la compresión por sí sola eleva la tasa de éxito de ataques y que el objetivo del estudio es cuantificar ese daño y probar distintas estrategias de reparación. Por tanto, no es un asistente conversacional de propósito general, sino un artefacto de medida con semilla 42, pensado para reproducir y auditar el compromiso entre seguridad y utilidad bajo compresión.

La relevancia actual es metodológica: con 6.738.415.616 parámetros almacenados en safetensors (13,5 GB de repositorio) y una ventana de contexto heredada de Llama 2, sirve como sujeto experimental para estudiar compresión low-rank, interpretabilidad de pesos y evaluación de seguridad con jueces automáticos (HarmBench, WildGuard). La model card advierte explícitamente que varias celdas de la malla están degradadas en seguridad de forma deliberada respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivada de Llama-2-7b-chat, con matrices comprimidas mediante truncamiento SVD (SVD-LLM) |
| Parametros totales | 6.738.415.616 (recuento de safetensors); fracción de parámetros densos resultante declarada: 0,4049 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base Llama-2-7b-chat; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (la model card no los declara; el modelo base Llama 2 se entrenó mayoritariamente con datos en inglés) |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (biblioteca transformers; etiqueta `endpoints_compatible` y `text-generation-inference`) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Compresión | SVD-LLM, 59,51 % de parámetros eliminados |
| Regla de selección | `sigma` |
| Presupuesto de restauración | 0,500 % de los parámetros densos |
| Componentes restaurados | 2.720 |
| Componentes sustituidos | 0 |
| Semilla | 42 |
| Tamaño del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

El checkpoint parte de la arquitectura Llama 2 de 7.000 millones de parámetros en configuración chat y le aplica compresión SVD-LLM, una técnica de truncamiento low-rank que descompone matrices de pesos y descarta componentes singulares hasta reducir el modelo al 40,49 % de sus parámetros densos. Sobre ese modelo comprimido se restauran 2.720 componentes SVD adicionales, seleccionados con la regla denominada `sigma` y con un presupuesto del 0,5 % de los parámetros densos, sin sustituir ningún componente ya presente (el campo de componentes sustituidos es 0). No se detalla en la información disponible cómo se materializa esa reducción de rango en el recuento de tensores del repositorio: el fichero safetensors declara 6.738.415.616 parámetros y 13,5 GB, coherente con un almacenamiento en precisión de 16 bits.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en esta etapa, ya que el autor no realiza un entrenamiento nuevo: el procedimiento descrito es de compresión y restauración estructural sobre un checkpoint ya ajustado al chat. La innovación metodológica que documenta la model card es el barrido sistemático sobre reglas de selección de componentes y presupuestos de restauración, con el objetivo de medir qué regla repara mejor el comportamiento de seguridad dañado por la compresión. La semilla declarada para la celda es 42.

## Capacidades

- Generación de texto conversacional: conserva la interfaz de Llama-2-7b-chat (pipeline `text-generation`), aunque con calidad degradada respecto al modelo sin comprimir.
- Razonamiento y respuesta a instrucciones: capacidad parcial, no evaluada con benchmarks de razonamiento en la información disponible.
- Evaluación de seguridad como sujeto de prueba: el checkpoint está instrumentado para medir tasa de éxito de ataques (ASR) con el juez de HarmBench y sobrerrechazo con WildGuard.
- Medición de perplejidad de modelado de lenguaje: se reporta WikiText-2 como indicador de utilidad.
- Reproducción de experimentos de compresión: permite replicar la celda `sigma` con presupuesto 0,005 y semilla 42.
- Compatibilidad de despliegue: etiquetas `text-generation-inference` y `endpoints_compatible`, lo que permite servirlo con TGI y con la librería transformers.
- Tool calling, function calling y uso agéntico: no disponible; la model card no documenta ninguna de estas capacidades.
- Capacidades multimodales (visión o audio): no disponibles; es un modelo exclusivamente de texto.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Auditoría de seguridad bajo compresión: ejecutar el checkpoint contra conjuntos de ataques como AdvBench y StrongREJECT con juez HarmBench para reproducir los valores declarados (ASR 0,3115 y 0,4026) y comparar celdas de la malla entre sí.
- Estudio del sobrerrechazo: emplear WildGuard para medir el rechazo excesivo macro (0,0828 en esta celda) y analizar el equilibrio entre seguridad y utilidad cuando se restaura un presupuesto de parámetros muy bajo.
- Investigación en compresión low-rank: usar la celda como referencia reproducible (semilla 42, regla `sigma`, 2.720 componentes) frente a otras reglas de selección y presupuestos, verificando el efecto sobre perplejidad de WikiText-2 (17,4001).
- Interpretabilidad de pesos: analizar qué componentes singulares restaurados concentran el comportamiento de rechazo, aprovechando que el repositorio documenta explícitamente el número de componentes restaurados y sustituidos.
- Docencia y laboratorios de evaluación: servir el modelo con transformers o TGI en un entorno aislado para que estudiantes midan el coste de comprimir un modelo de 7.000 millones de parámetros sin reentrenar.
- Pruebas de pipelines de evaluación: utilizarlo como sujeto control en arneses automáticos de red teaming, comprobando la estabilidad de los jueces ante un modelo deliberadamente degradado en seguridad.
- Validación de infraestructura de despliegue: verificar el comportamiento de TGI y de endpoints compatibles con un checkpoint que no es un ajuste fino convencional, detectando posibles incompatibilidades de kernels.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,3115 |
| StrongREJECT ASR (juez HarmBench) | 0,4026 |
| Macro over-refusal (WildGuard) | 0,0828 |
| Perplejidad WikiText-2 | 17,4001 |

No se han publicado en la información disponible resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K u otros), ni valores de referencia del modelo base sin comprimir que permitan calcular la degradación relativa.

## Requisitos de hardware

- VRAM estimada en fp16: alrededor de 13,5 GB de pesos, más memoria para caché KV y activaciones; en la práctica, 16-18 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 7 GB; en 4 bits, en torno a 4-5 GB (no se publican cuantizaciones oficiales de este checkpoint, por lo que habría que generarlas).
- GPU recomendadas: A100 40 GB, H100, L40S o A10G para servicio con contexto completo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en fp16 para secuencias cortas.
- GPU de consumo: cabe en tarjetas de 16 GB o más en fp16 y en tarjetas de 8-12 GB si se cuantiza; en 4 bits podría caber en 6-8 GB.
- Opciones de despliegue: transformers de forma nativa, text-generation-inference (etiqueta declarada), endpoints compatibles; otras alternativas como vLLM, llama.cpp u Ollama no están documentadas para este checkpoint.
- Latencia y throughput estimados: no disponibles.
- Advertencia de compatibilidad: al tratarse de matrices truncadas por SVD, es posible que algunas optimizaciones de kernels (fusión de operaciones, decodificación especulativa) no apliquen igual que en un Llama-2-7b-chat estándar; no hay documentación al respecto en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | ASR / perplejidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| svd-safety-l2_remove60_sigma_b005 | 6.738.415.616 en safetensors; fracción densa 0,4049 | 4.096 tokens (heredado) | SVD-LLM, 59,51 % eliminado, 2.720 componentes restaurados | AdvBench ASR 0,3115; StrongREJECT ASR 0,4026; WikiText-2 PPL 17,4001 | Llama 2 Community License | 0 descargas, 0 likes en HuggingFace |
| meta-llama/Llama-2-7b-chat-hf (base) | 6.738.415.616 | 4.096 tokens | Sin comprimir | No disponible en la información proporcionada | Llama 2 Community License | Ampliamente disponible en HuggingFace |
| Otras celdas de la malla del mismo autor | No disponible | No disponible | Distintas reglas de selección y presupuestos | No disponible | Llama 2 Community License | No disponible en la información proporcionada |
| Cuantizaciones de terceros de Llama-2-7b-chat (GGUF, AWQ, GPTQ) | 6.738.415.616 antes de cuantizar | 4.096 tokens | Cuantización de precisión, no truncamiento de rango | No disponible | Llama 2 Community License | Publicadas por terceros en HuggingFace |

No se dispone de valores de referencia del modelo base ni de las demás celdas del estudio, por lo que no es posible cuantificar en esta ficha la pérdida exacta de utilidad o de seguridad atribuible a la compresión.

## Limitaciones y advertencias

- Artefacto de investigación, no desplegable: la propia model card indica que es una celda de una malla experimental y que no debe tratarse como un asistente de propósito general.
- Seguridad degradada de forma deliberada en varias celdas del estudio: la compresión eleva la tasa de éxito de ataques, y esta celda registra un ASR de 0,3115 en AdvBench y 0,4026 en StrongREJECT, valores altos para un modelo de chat alineado.
- Riesgo de alucinación: al ser un derivado de Llama-2-7b-chat con matrices truncadas, la degradación de la calidad de generación es esperable; la perplejidad de WikiText-2 de 17,4001 es el único indicador de utilidad publicado y no mide fidelidad factual.
- Sesgos conocidos: no se documentan análisis de sesgo para este checkpoint; hereda los sesgos del corpus de entrenamiento de Llama 2, mayoritariamente en inglés.
- Limitaciones de idioma: la model card no declara idiomas soportados y no hay evaluación multilingüe; el rendimiento fuera del inglés no está medido.
- Límite de contexto: 4.096 tokens heredados del modelo base, insuficiente para tareas de contexto largo.
- Restricciones de licencia: Llama 2 Community License, con política de uso aceptable vinculante (`USE_POLICY.md`); existen obligaciones de atribución y cláusulas de escala (uso comercial condicionado para productos con más de 700 millones de usuarios mensuales). Cualquier uso debe revisar `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio.
- Falta de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin revisión por pares ni terceros independientes.
- Ausencia de datos de entrenamiento y de evaluación ampliada: no hay información sobre tokens, composición del dataset ni benchmarks de razonamiento, código o matemáticas.
- Ambigüedad de formato: no se explica cómo se representa la reducción de rango en los safetensors publicados (13,5 GB para 6.738.415.616 parámetros), lo que puede complicar la carga con herramientas estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove60_sigma_b005
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia incluida en el repositorio: `LICENSE.txt` (Llama 2 Community License)
- Política de uso incluida en el repositorio: `USE_POLICY.md`
- Paper de SVD-LLM: no disponible en la información proporcionada
- Blog o repositorio del autor con la malla experimental completa: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con este modelo (horóscopos y contenidos sobre Gemini), por lo que no se ha extraído ningún enlace adicional relevante.
