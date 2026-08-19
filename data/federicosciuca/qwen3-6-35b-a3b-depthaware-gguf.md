# FedericoSciuca/Qwen3.6-35B-A3B-depthaware-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo Qwen3.6-35B-A3B, un mixture-of-experts (MoE) de 35 mil millones de parámetros con solo 3 mil millones activos por token, desarrollado por Qwen. La particularidad de este build es que ha sido cuantizado de forma "depth-aware" (consciente de la profundidad): el autor, FedericoSciuca, midió empíricamente qué bandas de capas son más frágiles a la cuantización de 2 bits y asignó los bits de protección donde el daño real era mayor. El resultado es un archivo de 14,1 GB que, según las mediciones publicadas, reduce la pérdida de calidad en un 29,2 % respecto a una cuantización ingenua que reparte la misma protección de forma uniforme, a tamaño de archivo idéntico.

La relevancia de este modelo radica en que permite ejecutar un MoE de 35B en hardware muy modesto: el autor reporta 14,86 tokens por segundo en una GTX 1060 de 6 GB con descarga parcial a GPU (`-ngl 12`). Es una opción pensada para quienes no pueden cargar el modelo completo en memoria, aunque el propio autor advierte que la calidad es inferior a una cuantización Q4_K_M o superior. El modelo base Qwen3.6-35B-A3B destaca por su rendimiento en tareas de código y agente (73,4 % en SWE-bench según fuentes externas), pero este build concreto no ha sido evaluado en benchmarks de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | 3 B (aproximadamente, según fuentes del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta: Q2_K (expert FFN capas 0-29), Q4_K (attention, SSM, expert FFN capas 30-39, token embedding), Q8_0 (shared experts) |
| Idiomas soportados | no disponible (el modelo base Qwen es multilingüe, pero no se especifica para este build) |
| Licencia | Hereda la del modelo base Qwen/Qwen3.6-35B-A3B (según fuentes externas, Apache 2.0; verificar upstream antes de uso comercial) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer MoE con 35B parámetros totales y aproximadamente 3B activos por token, lo que permite una inferencia eficiente. La cuantización aquí presentada se construyó a partir del checkpoint Q8_0 del modelo base utilizando la herramienta `quantprobe`. El proceso consistió en medir la fragilidad de cada banda de 10 capas cuantizando cada banda a Q2_K de forma aislada (con el resto a Q6_K) y evaluando la perplejidad en WikiText-2. Los resultados mostraron una fragilidad monótona y concentrada en las capas finales: la banda 30-39 presentó un incremento de perplejidad de 0,4179, 2,53 veces la mediana. Con esa medición, el autor diseñó una receta que protege esa banda con Q4_K mientras el resto de los expertos FFN van a Q2_K, con attention y SSM a Q4_K y shared experts a Q8_0.

El entrenamiento del modelo base no se detalla en la información proporcionada, pero según el repositorio oficial de Qwen3.6, esta versión prioriza estabilidad y utilidad real, con mejoras sustanciales en "agentic coding" (codificación orientada a agentes). No se dispone de datos sobre el dataset de entrenamiento, el número de tokens o si se usó RLHF/DPO.

## Capacidades

- Generación de texto y conversación: al ser un modelo de lenguaje de propósito general, es capaz de mantener diálogos multi-turno, aunque la cuantización de 2 bits puede degradar la fluidez y coherencia en comparación con el modelo original.
- Razonamiento y matemáticas: el modelo base tiene capacidades demostradas en tareas de razonamiento, pero este build no ha sido evaluado en dichas tareas.
- Generación de código: el modelo base Qwen3.6-35B-A3B alcanza un 73,4 % en SWE-bench (según fuentes externas), lo que indica una fuerte capacidad de codificación. Sin embargo, esta cuantización concreta no ha sido sometida a esos benchmarks.
- Soporte de tool calling y agentes: el modelo base está diseñado para uso agéntico, pero no hay evidencia de que esta cuantización preserve completamente esa funcionalidad.
- Capacidades multilingües: no especificadas para este build; el modelo base de Qwen suele ser multilingüe, pero no se confirma aquí.
- Sin capacidades especiales adicionales (visión, audio, etc.) documentadas para este build.

## Casos de uso

- Inferencia local en hardware de gama baja: con una GTX 1060 de 6 GB y 16 GB de RAM, el modelo alcanza ~14,9 tok/s con `-ngl 12`. Es adecuado para probar un MoE de 35B en equipos sin GPU moderna.
- Prototipado y experimentación: investigadores o aficionados que quieran explorar el comportamiento de un MoE de 35B sin invertir en hardware caro pueden usar este GGUF para pruebas rápidas de generación de texto.
- Desarrollo de aplicaciones de chat offline: con `llama-server` se puede montar un endpoint local de chat para entornos sin conexión, siempre que se acepte la degradación de calidad.
- Evaluación de técnicas de cuantización: el repositorio incluye metodología y logs completos, por lo que sirve como caso de estudio para quienes investigan cuantización selectiva por profundidad.
- Generación de código en entornos con restricciones de memoria: si el hardware no puede cargar un Q4_K_M, este build permite ejecutar tareas de autocompletado o generación de fragmentos de código, aunque con mayor riesgo de errores.
- Educación y divulgación: para demostrar cómo la cuantización mixta basada en mediciones puede mejorar la relación calidad-tamaño en modelos MoE.

## Benchmarks y rendimiento

La model card solo reporta perplejidad (PPL) en WikiText-2, no benchmarks de tareas. Los datos publicados son los siguientes:

| Build | PPL (32 chunks, WikiText-2) | Δ sobre referencia Q6_K |
|---|---|---|
| Referencia Q6_K | 5,4669 | — |
| **Este modelo** (banda 30-39 protegida) | **5,7796** | +0,3127 |
| Control (protección uniforme) | 5,9088 | +0,4419 |

La mejora relativa es del 29,2 % menos pérdida de calidad respecto al control, a tamaño de archivo idéntico (14.115.658.720 bytes). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks para este build concreto. El modelo base Qwen3.6-35B-A3B reporta 73,4 % en SWE-bench según fuentes externas, pero ese dato no es aplicable directamente a esta cuantización.

## Requisitos de hardware

- VRAM estimada: el archivo pesa 14,1 GB, por lo que no cabe entero en una GPU de 6 GB. Con `-ngl 12` (12 capas en GPU) se obtienen 14,86 tok/s en una GTX 1060 6GB con 16 GB de RAM DDR4-3000 y un i5-7600K.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede usar la configuración `-ngl 12`. Para cargar más capas en GPU se necesita más VRAM; el autor advierte que subir `-ngl` a 24 en una 6 GB produce una caída drástica del rendimiento (4,84 tok/s) por overcommit de VRAM.
- En CPU pura (`-ngl 0`): 7,40 tok/s en el mismo equipo, con alta variabilidad (±2,09).
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), compatible con servidores que aceptan GGUF como Ollama o LM Studio.
- Latencia y throughput: los valores medidos son los indicados arriba; no se dispone de datos para otras configuraciones de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Calidad (PPL WikiText-2) | Tamaño archivo | Licencia |
|---|---|---|---|---|---|---|
| **Este build** (depth-aware Q2K) | 34,66B totales, 3B activos | no disponible | GGUF mixto Q2K/Q4K/Q8 | 5,7796 | 14,1 GB | Heredada (Apache 2.0 según fuentes) |
| Control (protección uniforme) | 34,66B totales, 3B activos | no disponible | GGUF mixto Q2K/Q4K/Q8 | 5,9088 | 14,1 GB (idéntico) | Heredada |
| Referencia Q6_K | 34,66B totales, 3B activos | no disponible | GGUF Q6_K | 5,4669 | mayor (no especificado) | Heredada |
| Qwen3.6-35B-A3B original (sin cuantizar) | 34,66B totales, 3B activos | no disponible | safetensors | no disponible | ~70 GB (estimado) | Apache 2.0 (según fuentes) |

No se dispone de datos de rendimiento de otras cuantizaciones GGUF del mismo modelo (p. ej., la de unsloth) para una comparación cuantitativa.

## Limitaciones y advertencias

- Cuantización de 2 bits: la calidad es significativamente inferior a la del modelo original o a una Q4_K_M. El propio autor recomienda usar Q4_K_M si el hardware lo permite.
- Perplejidad como proxy: la evaluación se basa únicamente en PPL sobre WikiText-2; no hay benchmarks de tareas (MATH, GSM8K, IFEval, etc.) para este build, por lo que el rendimiento real en tareas específicas es desconocido.
- Mediciones en un solo equipo: los datos de velocidad y PPL provienen de una única máquina (GTX 1060, 16 GB RAM, i5-7600K). Otras configuraciones pueden dar resultados diferentes, incluido un óptimo de `-ngl` distinto.
- La banda frágil (30-39) se determinó para este modelo concreto; aunque se verificó que Qwen3.5-35B-A3B muestra un patrón similar, no es una ley general.
- Licencia: aunque fuentes externas indican Apache 2.0 para el modelo base, la model card no lo confirma explícitamente y recomienda verificar el repositorio upstream antes de uso comercial.
- Riesgo de alucinación y sesgos: no se han evaluado específicamente para este build; al ser una cuantización agresiva, es probable que aumente la frecuencia de errores factuales y de coherencia.
- Sin soporte de visión ni audio: el modelo es exclusivamente de texto.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/FedericoSciuca/Qwen3.6-35B-A3B-depthaware-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio oficial de Qwen3.6 en GitHub: https://github.com/QwenLM/Qwen3.6
- Herramienta quantprobe: https://github.com/FedericoTs/quantprobe
- Preregistro #103 (medición de fragilidad): https://github.com/FedericoTs/quantprobe/blob/master/preregistrations/2026-08-18-qwen36-hybrid-moe-fragility.md
- Preregistro #104 (comparación receta vs. ingenua): https://github.com/FedericoTs/quantprobe/blob/master/preregistrations/2026-08-18-qwen36-recipe-vs-naive.md
- Log de la sonda: https://github.com/FedericoTs/quantprobe/blob/master/weights/data/prereg103_probe_qwen36.log
- Log de PPL: https://github.com/FedericoTs/quantprobe/blob/master/weights/data/prereg104_ppl.log
- Receta de cuantización: https://github.com/FedericoTs/quantprobe/blob/master/quantprobe/recipes/qwen3.6-35b.json
- Cuantización alternativa de unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guía de Qwen 3.6-35B-A3B (aimadetools): https://www.aimadetools.com/blog/qwen-3-6-35b-a3b-complete-guide/
