# inclusionAI/Ling-3.2-air

## Resumen

Ling-3.2-air es un modelo de lenguaje multimodal de pesos abiertos desarrollado por inclusionAI (equipo vinculado al ecosistema Ant Group/Alipay). Se presenta como una evolución de Ling-3.0-flash-VL, conservando su arquitectura multimodal nativa pero con mejoras sustanciales en automatización de flujos de trabajo y razonamiento sobre documentos profesionales. El modelo emplea una arquitectura MoE híbrida con capas de atención linear (KDA) combinadas con Gated MLA, sumando 124B parámetros totales de los que solo se activan 5.5B por token.

La propuesta diferencial del modelo es su enfoque en tareas de "trabajo profesional": análisis de datos cuantitativos, procesamiento de documentos legales, automatización de terminal y razonamiento sobre PDFs complejos. Los incrementos declarados frente a su predecesor son notables en varias métricas: AutomationBench-AA pasa del 15.7% al 61%, Terminal-Bench 4.0 del 0% al 27% y AA-Briefcase v1.1 gana 353 puntos Elo (de 987 a 1340). Obtiene una puntuación de 23 en el Artificial Analysis Intelligence Index v5.0.1.

El modelo se distribuye bajo licencia MIT, con pesos en safetensors y fp8, y soporta contexto de hasta 256K tokens. Está diseñado para desplegarse con SGLang o vLLM en nodos multi-GPU (4× H20/H200 o 8× H100/H800), lo que lo posiciona como una opción de pesos abiertos para cargas de trabajo agénticas y multimodales de nivel empresarial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (KDA + Gated MLA), variante `bailing_moe_v3_vl` |
| Parametros totales | 124B (127.920.654.544 segun safetensors) |
| Parametros activos | 5.5B |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | fp8 (pesos publicados en fp8); no se detallan otras cuantizaciones en la model card |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code, fp8) |

## Arquitectura y entrenamiento

Ling-3.2-air emplea una arquitectura MoE híbrida con 35 capas de atención linear KDA y 7 capas de Gated MLA en proporción 5:1, más 2 capas densas. El bloque MoE cuenta con 512 expertos enrutados y 1 experto compartido, activando 8 expertos por token. La dimensión oculta es de 2560, con tamaño intermedio de experto de 768 y tamaño intermedio denso de 6144. El modelo dispone de 32 cabezas de atención y un vocabulario de 157.184 tokens. La componente VL (vision-language) confirma su naturaleza multimodal nativa, compartida con Ling-3.0-flash-VL.

En cuanto a entrenamiento, la model card no especifica el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o post-entrenamiento con refuerzo. Sí se documenta soporte de decodificación especulativa MTP (NEXTN) con hasta 3 tokens especulativos, y optimizaciones de decodificación para arquitecturas Hopper. El modo de razonamiento (`enable_thinking`) es configurable vía chat template, con parsers dedicados `ling3` para razonamiento y tool calling.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo "thinking" activable (`enable_thinking`).
- Procesamiento multimodal nativo: entrada de imágenes (`image_url`) y vídeo (`video_url`) junto con texto.
- Razonamiento sobre documentos profesionales: PDFs, informes legales y financieros, con métricas específicas en GDP.pdf y Harvey LAB-AA.
- Análisis de datos cuantitativos y tareas de automatización de flujos de trabajo (AutomationBench-AA).
- Ejecución de tareas en terminal y entornos de línea de comandos (Terminal-Bench 4.0).
- Tool calling / function calling con parser dedicado (`ling3`) y soporte de `--enable-auto-tool-choice` en vLLM.
- Capacidades agénticas multi-paso orientadas a automatización.
- Contexto largo de hasta 256K tokens para documentos extensos y conversaciones prolongadas.
- Decodificación especulativa MTP para acelerar la inferencia.

## Casos de uso

- **Automatización de flujos de trabajo administrativos**: el modelo puede orquestar secuencias de acciones con tool calling y razonamiento multi-paso, aprovechando su puntuación del 61% en AutomationBench-AA para encadenar operaciones sobre APIs y sistemas internos.
- **Análisis de documentos legales**: con un 87.7% de criterios superados en Harvey LAB-AA v1.1, es adecuado para revisión de contratos, extracción de cláusulas y resumen de expedientes, siempre con verificación humana por su tasa de alucinación material (0.8% all-pass tras el chequeo).
- **Procesamiento de PDFs financieros y técnicos**: su contexto de 256K tokens y su rendimiento en GDP.pdf permiten ingerir informes anuales completos y responder preguntas sobre tablas, gráficos y texto.
- **Análisis de datos cuantitativos**: puede interpretar tablas, series temporales y resultados numéricos embebidos en documentos o imágenes, apoyando tareas de business intelligence.
- **Agentes de terminal y DevOps**: con un 27% de éxito en Terminal-Bench 4.0, puede asistir en tareas de shell, diagnóstico de sistemas y automatización de scripts, integrándose vía SGLang o vLLM con parsers de tool calling.
- **Asistentes multimodales con vídeo e imagen**: la entrada nativa de `video_url` e `image_url` permite construir asistentes que describen, resumen o responden preguntas sobre contenido audiovisual.
- **Atención al cliente documental**: conversaciones multi-turno con contexto largo para resolver consultas que requieren consultar manuales, pólizas o contratos extensos sin perder el hilo.

## Benchmarks y rendimiento

| Benchmark | Ling-3.0-flash-VL (predecesor) | Ling-3.2-air |
|---|---|---|
| AutomationBench-AA | 15.7% | 61% |
| GDP.pdf (all-pass rate) | 8.4% | 16% |
| AA-Briefcase v1.1 (Elo) | 987 | 1340 |
| Terminal-Bench 4.0 (pass rate) | 0% | 27% |
| Artificial Analysis Intelligence Index v5.0.1 | no disponible | 23 |
| Harvey LAB-AA v1.1 (criterion pass rate) | no disponible | 87.7% |
| Harvey LAB-AA v1.1 (all-pass, pre-chequeo alucinación) | no disponible | 8.3% |
| Harvey LAB-AA v1.1 (all-pass, post-chequeo alucinación) | no disponible | 0.8% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de razonamiento o código.

## Requisitos de hardware

- **VRAM estimada**: con pesos en fp8 y 124B parámetros totales, el modelo requiere aproximadamente 124 GB solo para pesos, más caché KV y overhead. No cabe en una GPU consumer.
- **GPU recomendadas**: receta oficial con 4× GPU de clase 141 GB (H20-3e o H200) o nodos Blackwell de 4 GPU (B300/GB300) para contexto de 256K con tensor parallelism 4.
- **En GPUs de 80 GB** (H100/H800): escalar a `--tp 8`.
- **Consumer GPU**: no viable en RTX 4090 ni similares; el tamaño del modelo excede la VRAM disponible incluso con cuantización agresiva no documentada.
- **Opciones de despliegue**: SGLang (imagen `lmsysorg/sglang:dev-Ling-3.0-flash-VL`, recomendado, con decodificación especulativa NEXTN) y vLLM (fork `inclusionAI/vllm-ling-v3`, con `--mamba-cache-mode align` y MTP).
- **Latencia y throughput**: no disponibles en la información proporcionada. La decodificación especulativa MTP (3 tokens) y las optimizaciones Hopper están orientadas a mejorar el throughput en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|---|
| Ling-3.2-air | 124B | 5.5B | 256K | MIT | Sí (imagen/vídeo) | Enfoque en automatización y documentos profesionales |
| Ling-3.0-flash-VL | no disponible | no disponible | no disponible | MIT (presumible, misma familia) | Sí | Predecesor directo; inferiores métricas en AutomationBench y Terminal-Bench |
| Alternativas de pesos abiertos de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de otros desarrolladores (por ejemplo, familias Qwen, DeepSeek o Llama) en términos de benchmarks homogéneos.

## Limitaciones y advertencias

- **Riesgo de alucinación material**: en Harvey LAB-AA v1.1, la tasa all-pass cae del 8.3% al 0.8% tras el chequeo de alucinación material, lo que indica que el modelo puede generar contenido plausible pero factualmente incorrecto en tareas legales; requiere verificación humana obligatoria.
- **Rendimiento limitado en terminal**: un 27% de éxito en Terminal-Bench 4.0 implica que la mayoría de tareas de terminal no se completan correctamente; no apto para automatización desatendida de shell sin supervisión.
- **Tasa all-pass baja en documentos profesionales**: el 16% en GDP.pdf y el 8.3% pre-chequeo en Harvey LAB-AA reflejan que, aunque los criterios parciales se superan con frecuencia, la finalización completa de tareas documentales complejas sigue siendo frágil.
- **Idiomas**: no se documentan los idiomas soportados; no se puede asumir un rendimiento multilingüe equilibrado sin evaluación previa.
- **Licencia**: MIT permite uso comercial, pero el modelo se distribuye con `custom_code` y requiere `--trust-remote-code` en los servidores de inferencia, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de desplegar en producción.
- **Requisitos de hardware elevados**: no es desplegable en GPUs consumer; requiere nodos multi-GPU de clase H100/H200 o superior, lo que limita su uso a entornos con infraestructura dedicada.
- **Dependencia de forks**: el soporte en vLLM se proporciona mediante un fork específico (`vllm-ling-v3`), lo que puede retrasar actualizaciones de seguridad y compatibilidad respecto al upstream.
- **Sesgos**: no se documentan análisis de sesgo en la información disponible; se recomienda evaluación propia antes de uso en dominios sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/Ling-3.2-air
- Organización en Hugging Face: https://huggingface.co/inclusionAI
- Modelo en ModelScope: https://www.modelscope.cn/models/inclusionAI/Ling-3.2-air
- Modelo predecesor (Ling-3.0-flash-VL): https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Fork de vLLM para Ling v3: https://github.com/inclusionAI/vllm-ling-v3
- Imagen SGLang: `lmsysorg/sglang:dev-Ling-3.0-flash-VL` (Docker Hub)
