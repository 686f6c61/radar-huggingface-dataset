# kvallespin/Sage-A1.5-NVFP4

## Resumen

Sage-A1.5-NVFP4 es una compilación cuantizada del modelo agéntico Sage-A1.5 de InternScience (Shanghai AI Laboratory), publicado por el usuario kvallespin. Se trata de un transformer de tipo mixture-of-experts (MoE) construido sobre Qwen3.6-35B-A3B y sobre el anterior Agents-A1, orientado a trabajo de horizonte largo: búsqueda profunda, ingeniería de software, investigación científica, seguimiento de instrucciones y uso de herramientas. La model card del modelo base declara 35 000 millones de parámetros totales con unos 3000 millones activos por token y una ventana de contexto de 256 000 tokens, ampliable a 512 000 con YaRN.

La aportación concreta de este repositorio es la precisión numérica: los expertos enrutados se almacenan en NVFP4 (W4A4), el resto de capas lineales del modelo de lenguaje en FP8 y el resto de componentes en BF16. El resultado ocupa 24,21 GB en disco frente a los 71,93 GB del original en BF16, lo que permite servirlo en una única GPU o en un equipo compacto con memoria unificada. La arquitectura, el tokenizador, la plantilla de chat y la capa MTP (multi-token prediction) se mantienen intactos.

Su relevancia ahora es doble: por un lado, demuestra que una cuantización agresiva a 4 bits en los expertos conserva entre el 96 % y el 99 % de acuerdo top-1 con BF16 en razonamiento, llamadas a herramientas y respuestas; por otro, habilita el despliegue de un modelo agéntico de esta clase en hardware Blackwell de consumo profesional o en un DGX Spark, con una decodificación aproximadamente 1,9 veces más rápida que el original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con capa MTP; multimodal image-text-to-text en el pipeline declarado |
| Parámetros totales | 19 001 054 576 (~19,0 B) según los safetensors del repo; la model card del modelo base declara 35 B (discrepancia no aclarada) |
| Parámetros activos | ~3 B por token (dato de la model card del modelo base) |
| Longitud de contexto | 256 000 tokens; ampliable a 512 000 con YaRN según la card del original. La evaluación de esta build se hizo con `--max-model-len 40960` |
| Tipos de cuantización | Mixta: NVFP4 (W4A4) en todos los expertos enrutados, FP8 en el resto de capas lineales del LM, BF16 en el resto. KV cache en FP8 (también evaluada con KV cache BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 24,2 GB; pesos BF16 originales: 71,93 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con enrutamiento disperso, heredada de Qwen3.6-35B-A3B, a la que se añade una capa de multi-token prediction (MTP) que el autor conserva sin modificar en la versión cuantizada. El pipeline declarado es `image-text-to-text`, lo que implica capacidades multimodales de entrada, aunque la model card no detalla el codificador visual. Esta build no reentrena nada: solo cambia la precisión numérica, de modo que el comportamiento cualitativo depende enteramente del modelo base.

El entrenamiento del original, según la página del proyecto, se desarrolla en tres etapas sobre un grafo de conocimiento y acciones anclado en dominios y construido a partir de trazas de agentes: primero un ajuste supervisado en todos los dominios, después modelos profesor por dominio y finalmente destilación on-policy desde varios profesores simultáneamente. Los datasets citados en las etiquetas del repo son nvidia/Nemotron-SFT-Agentic-v2 y nvidia/Nemotron-SFT-Instruction-Following-Chat-v2, que encajan con el perfil agéntico e de seguimiento de instrucciones del modelo. No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO. Las capacidades diferenciales que declara la card son la orquestación agéntica (descomposición en subpreguntas delegadas a subagentes en paralelo con contexto y herramientas propios, y fusión posterior de resultados), la verificación agéntica (modo opcional en el que el modelo interrumpe su razonamiento, revisa lo establecido y lo fallido, y corrige el rumbo en el mismo turno sin crítico externo) y la investigación científica abierta con artefactos auditables.

En el plano de la cuantización, la innovación es el esquema mixto NVFP4/FP8/BF16 generado con ModelOpt y ejecutado con kernels NVFP4 de vLLM. La evaluación pareada se hizo en un único NVIDIA DGX Spark (GB10) con vLLM `0.31.1rc1.dev88+g81198e97`, mismas banderas y misma plantilla de chat para ambas builds, con MTP desactivado y `--max-num-batched-tokens 4096 --gpu-memory-utilization 0.8`.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo *thinking* activable; la evaluación usa tanto thinking on como off según la tarea.
- Uso de herramientas y function calling: evaluado con BFCL v3 en las categorías simple, multiple, parallel y parallel_multiple.
- Orquestación de subagentes: divide una tarea en subpreguntas independientes, las ejecuta en paralelo con contextos y herramientas separados y fusiona los resultados.
- Verificación agéntica interna: revisión del propio razonamiento y cambio de estrategia dentro del mismo turno, sin crítico externo.
- Búsqueda profunda (deep search) y trabajo agéntico de horizonte largo, con decisiones encadenadas del siguiente paso.
- Ingeniería de software: reparación y modificación de código dentro de contextos de hasta 256 000 tokens.
- Investigación científica exploratoria: análisis y generación de artefactos de investigación en neurociencia, química y física según los ejemplos del proyecto.
- Entrada de imágenes y documentos (pipeline image-text-to-text), con resultado reportado de 91,5 en OmniDocBench para el modelo original.
- Seguimiento de instrucciones estricto, evaluado a nivel de prompt en IFEval (strict y loose).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Búsqueda profunda multiagente: el modelo descompone una pregunta de investigación en subpreguntas, las reparte entre subagentes con su propio contexto y herramientas, y consolida la respuesta. La ventana de 256 000 tokens permite arrastrar trazas de búsqueda largas sin truncar.
- Mantenimiento de repositorios de software: con 256 000 tokens de contexto se puede cargar un conjunto amplio de ficheros y trazas de fallo, y encadenar llamadas a herramientas de ejecución de tests para localizar y corregir un bug en varias iteraciones.
- Automatización de flujos con function calling: el 81,4 de BFCL v3 AST en esta build lo hace apto para asistentes que deben emitir llamadas correctas en formato, incluidas llamadas en paralelo, contra APIs internas.
- Verificación de cadenas de razonamiento en producción: el modo de verificación agéntica permite detectar y corregir pasos fallidos dentro del mismo turno, útil en pipelines donde no hay un modelo crítico adicional disponible.
- Procesamiento de documentos técnicos y científicos: el pipeline image-text-to-text y los 91,5 de OmniDocBench del original lo sitúan como extractor de tablas, fórmulas y figuras en literatura científica dentro de un flujo de revisión.
- Asistentes con formato estricto: el 82,8 en IFEval prompt-level strict (82,8 esta build, 83,2 BF16) lo hace utilizable en generación de informes con plantillas fijas, JSON schema o respuestas con restricciones de longitud y estructura.
- Despliegue en estación de trabajo individual: al caber en 24,21 GB de pesos, permite servir un modelo agéntico de esta clase en un DGX Spark o en una GPU Blackwell de gama profesional, con decodificación 1,9 veces más rápida que BF16.
- Investigación exploratoria asistida: generación de análisis y artefactos reproducibles en dominios científicos, revisables por un humano, en lugar de respuestas cerradas a preguntas fijas.

## Benchmarks y rendimiento

Comparación pareada BF16 frente a NVFP4, medida el 25 de octubre de 2026 en un DGX Spark (GB10) con datos fuera del conjunto de calibración:

| Tarea | Ítems | Thinking | Máx. tokens | BF16 | NVFP4 | Diferencia, pp (IC 95 %) | McNemar p |
|---|---|---|---|---|---|---|---|
| Agentic next action | 460 | on | 4096 | 50,0 | 52,2 | +2,2 (−2,4 a +6,7) | 0,40 |
| BFCL v3 AST | 1000 | off | 1024 | 83,5 | 81,4 | −2,1 (−3,9 a −0,3) | 0,03 |
| IFEval, prompt-level strict | 541 | off | 2048 | 83,2 | 82,8 | −0,4 (−3,0 a +2,2) | 0,89 |
| IFEval, prompt-level loose | 541 | off | 2048 | 87,4 | 87,1 | −0,4 | no disponible |
| GSM8K | 500 | no disponible | no disponible | no ejecutado | no ejecutado | no disponible | no disponible |
| MMLU-Pro | 1008 | no disponible | no disponible | no ejecutado | no ejecutado | no disponible | no disponible |

Resultados reportados por InternScience para el modelo original en BF16 (no para esta build):

| Benchmark | Puntuación |
|---|---|
| GAIA | 95,1 |
| XBench-DS-2510 | 92,0 |
| AA-LCR | 81,0 |
| OmniDocBench | 91,5 |

La gráfica de doce benchmarks de la card original (que compara Sage-A1.5 con A1, Ornith-1.5, Kimi-K3, GLM-5.3 y GPT-5.6-sol en ingeniería, ciencia, agentes, búsqueda y seguimiento de instrucciones) no está transcrita en la información disponible, por lo que no se recogen sus valores numéricos. En la tarea de siguiente acción agéntica, ambas builds escriben la misma consulta en el 28 % de los casos (F1 medio entre ellas de 0,64) y obtienen un F1 medio frente a la traza de referencia prácticamente idéntico: 0,46 en BF16 y 0,48 en NVFP4.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan 24,21 GB en disco, por lo que se necesita un dispositivo con al menos ese espacio más el margen de runtime y la KV cache. No se publica una cifra oficial de VRAM total; como referencia, la evaluación se hizo con `--gpu-memory-utilization 0.8` y KV cache FP8.
- GPU validadas: NVIDIA DGX Spark (GB10, memoria unificada de 128 GB) es el único entorno documentado en la model card.
- GPU recomendadas: arquitecturas Blackwell, que son las que exponen kernels NVFP4 en vLLM (GB10, GB200, B200, y previsiblemente RTX 5090 por su soporte FP4). La compatibilidad con Hopper (H100/H200) y Ada (L40S, RTX 6000 Ada) para este checkpoints NVFP4 no está documentada.
- Cabe en GPU de consumo: no en RTX 4090 ni en ninguna GPU de 24 GB, porque los pesos solos ya ocupan 24,21 GB. Una RTX 5090 de 32 GB es la candidata natural, aunque no hay validación publicada.
- Opciones de despliegue: vLLM `0.31.1rc1.dev88+g81198e97` es el runtime con el que se validó, con `--max-model-len 40960 --max-num-batched-tokens 4096 --gpu-memory-utilization 0.8` y MTP desactivado. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: la decodificación es aproximadamente 1,9 veces más rápida que la build BF16 en el mismo servidor. No se publican tokens por segundo absolutos ni latencia de prefill.
- Nota sobre la ventana de contexto efectiva: aunque el modelo base soporta 256 000 tokens, la evaluación se limitó a 40 960; el coste de memoria de KV cache a 256 000 tokens no está documentado en esta build.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión / tamaño | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sage-A1.5-NVFP4 (este) | ~19 B safetensors (35 B declarados en el base), ~3 B activos | 256 K (512 K con YaRN) | NVFP4/FP8/BF16, 24,21 GB | BFCL v3 AST 81,4; IFEval strict 82,8 | Apache 2.0 | HuggingFace, 224 descargas |
| Sage-A1.5 (BF16, InternScience) | 35 B MoE, ~3 B activos | 256 K (512 K con YaRN) | BF16, 71,93 GB | BFCL v3 AST 83,5; IFEval strict 83,2; GAIA 95,1 | Apache 2.0 | HuggingFace |
| Agents-A1 (InternScience) | No disponible | No disponible | No disponible | Inferior a A1.5 según la comparativa del proyecto | No disponible en la información | HuggingFace |
| Ornith-1.5 | Clase 35 B | No disponible | No disponible | Comparado en la gráfica del proyecto; valores no disponibles | No disponible | No disponible |
| Kimi-K3 / GLM-5.3 / GPT-5.6-sol | Modelos de mayor tamaño | No disponible | No disponible | Usados como referencia de escala superior en la gráfica del proyecto; valores no disponibles | No disponible | No disponible |

La comparación estrictamente medible es contra el propio original en BF16: misma arquitectura y licencia, un tercio del tamaño en disco, 1,9 veces más rápido en decodificación y una pérdida de 2,1 puntos en BFCL v3 como único deterioro estadísticamente significativo.

## Limitaciones y advertencias

- Pérdida medible en tool calling: BFCL v3 AST cae 2,1 puntos (IC 95 % −3,9 a −0,3; p = 0,03) frente a BF16. Es el único benchmark donde la degradación es significativa, y afecta justo a la capacidad que da nombre al modelo.
- Cobertura de evaluación incompleta: GSM8K y MMLU-Pro no se han ejecutado en esta build, y las cifras de GAIA, XBench-DS-2510, AA-LCR y OmniDocBench corresponden al original en BF16, no a los pesos NVFP4.
- La cuantización altera salidas: la propia card advierte de que, aunque el acuerdo top-1 con BF16 es del 96-99 % en razonamiento, llamadas a herramientas y respuestas, la precisión menor cambia algunas generaciones. No es un reemplazo bit a bit.
- Cifras de benchmark no verificables de forma independiente: no hay resultados de terceros y la gráfica de doce benchmarks del proyecto no está transcrita con valores numéricos.
- Discrepancia de tamaño: los safetensors suman 19,0 B de parámetros mientras la card del base declara 35 B. No se aclara si el checkpoint omite componentes o si la cifra declarada incluye otros elementos; conviene verificarlo antes de dimensionar infraestructura.
- Dependencia de hardware específico: los kernels NVFP4 están atados a Blackwell en vLLM. Desplegar en Hopper o Ada puede requerir convertirlo o no ser posible; no hay documentación al respecto.
- Contexto efectivo no validado: 40 960 tokens en la evaluación frente a los 256 000 declarados. No hay datos de calidad ni de memoria a contextos largos en esta build.
- Idiomas no declarados: la información disponible no especifica la cobertura lingüística, por lo que no se puede asumir calidad multilingüe sin evaluarla.
- Riesgo de alucinación y seguridad: no se publican datos de alineación, tasas de rechazo, evaluación de sesgos ni resultados de seguridad para esta build ni para el base.
- Uso comercial: la licencia Apache 2.0 lo permite sin restricciones adicionales conocidas; conviene revisar igualmente los términos del modelo base Qwen3.6-35B-A3B del que deriva la arquitectura.
- Madurez: 224 descargas, 0 likes y actualización un día después de la creación. Es un artefacto reciente y sin adopción comunitaria verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kvallespin/Sage-A1.5-NVFP4
- Modelo base (InternScience/Sage-A1.5): https://huggingface.co/InternScience/Sage-A1.5
- Arquitectura de referencia (Qwen3.6-35B-A3B): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo predecesor (Agents-A1): https://huggingface.co/InternScience/Agents-A1
- Página del proyecto: https://alpha-innovator.github.io/Sage-A1.5/
- Informe técnico (arXiv): https://arxiv.org/abs/2610.28578
- Repositorio GitHub con código y framework de evaluación: https://github.com/InternScience/Agents-A1
- Colección de HuggingFace: https://huggingface.co/collections/InternScience/sage-a15
- Dataset Nemotron-SFT-Agentic-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Dataset Nemotron-SFT-Instruction-Following-Chat-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Instruction-Following-Chat-v2
