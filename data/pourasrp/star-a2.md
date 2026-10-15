# pourasrp/star-A2

## Resumen

STAR arm A2 es un adaptador LoRA entrenado mediante supervisión fina (SFT) sobre el modelo base Qwen/Qwen3-8B, orientado a tareas de agente de programación (coding agent). Lo publica el equipo de Chaitanya Medidar, Manasi Ghalsasi, Pouras Patil y Rushil Patil, del Vivekanand Education Society's Institute of Technology (Mumbai), como parte del proyecto STAR: Execution-Grounded, Typed Recovery Supervision for Coding-Agent SFT, cuyo código y materiales están en GitHub.

El adaptador no es un modelo autónomo: se distribuye en formato PEFT/LoRA (r=64, alpha=128) sobre todas las proyecciones de atención y MLP de Qwen3-8B, con un tamaño de repositorio de 0,7 GB. El brazo A2 corresponde a una ablación "utility-only": aplica el mismo corte por pérdida base mediana, pero sin la fase de force-keep que sí emplean otros brazos del proyecto. Se entrenó con semilla 42 y datos derivados de SWE-Lego Real.

Su relevancia es acotada pero concreta: documenta de forma reproducible (manifiesto de ejecución, hashes SHA-256, pesos por token) un esquema de supervisión con pesos por token para agentes de código, lo que permite reproducir o auditar el entrenamiento. No hay resultados de benchmarks publicados ni métricas de rendimiento asociadas, y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso: Qwen/Qwen3-8B (revision b968826d9c46dd6066d109eabc6255188de91218) |
| Parametros totales | Modelo base: 8.000 millones (8B). Adaptador: no disponible de forma oficial; aproximadamente 175 millones segun la configuracion declarada (r=64 sobre las proyecciones q, k, v, o, gate, up y down de 36 capas) |
| Parametros activos | No aplica: ni el adaptador ni el modelo base son MoE |
| Longitud de contexto | No documentada para el adaptador. Heredada del modelo base Qwen3-8B: 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors sin cuantizar. Puede combinarse con cuantizaciones del modelo base (bitsandbytes 4/8 bits, GPTQ, AWQ, GGUF) a traves de PEFT, aunque el autor no documenta ninguna combinacion probada |
| Idiomas soportados | No disponible. El modelo base Qwen3-8B es multilingue, pero el adaptador no declara idiomas ni evaluacion multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json, formato de adaptador PEFT/LoRA |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer decoder-only denso con 36 capas, atencion con GQA (32 cabezas de consulta y 8 de clave/valor), RMSNorm y RoPE. Sobre él se aplica un adaptador LoRA de rango 64 y alpha 128 sobre todas las proyecciones de atención (q_proj, k_proj, v_proj, o_proj) y de MLP (gate_proj, up_proj, down_proj). No se modifica el modelo base, que no se redistribuye en el repositorio; solo se publican los pesos del adaptador.

El entrenamiento es un SFT sobre trayectorias de agente de código. Según la model card, los datos proceden de SWE-Lego Real y el esquema se denomina "Execution-Grounded, Typed Recovery Supervision": supervisión anclada en la ejecución y tipada de las recuperaciones del agente. El brazo A2 es la variante "utility-only", que aplica el mismo corte por pérdida base mediana que los demás brazos pero sin force-keep, lo que lo convierte en una ablación para medir el efecto de esa fase. La semilla es 42 y se publica un run_manifest.json con la ejecución. No se detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO; tampoco se documentan innovaciones de decodificación (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen3-8B.
- Generación y edición de código en el contexto de tareas de agente (resolución de issues, modificación de repositorios, parcheo de ficheros).
- Comportamiento de agente de programación de varios pasos: el entrenamiento se realiza sobre trayectorias con recuperaciones tipadas, es decir, el modelo está ajustado para reaccionar a errores de ejecución y reintentar.
- Supervisión anclada en la ejecución: el ajuste prioriza trayectorias cuyo resultado se puede verificar ejecutando código, no solo por coincidencia textual.
- Soporte de tool calling / function calling: no documentado explícitamente en la model card, aunque el modelo base Qwen3-8B lo soporta.
- Capacidades multilingües: no documentadas para el adaptador.
- Capacidades especiales (modo thinking, visión, audio): no documentadas. El modelo base Qwen3-8B soporta modo thinking, pero el adaptador no especifica si lo conserva o cómo se comporta con él.

## Casos de uso

- Reparación automática de fallos en CI: el adaptador está entrenado sobre trayectorias que reaccionan a errores de ejecución, por lo que puede integrarse en un pipeline que reciba el log de fallo de un test y proponga un parche, con verificación posterior ejecutando la suite.
- Resolución de issues en repositorios reales: dado un issue y el árbol del repositorio, el modelo puede generar una secuencia de ediciones y comandos de verificación, siguiendo el esquema de recuperación tipada con el que fue entrenado.
- Agente de refactorización supervisada: uso en tareas donde cada paso se valida ejecutando tests, de modo que el modelo reintenta cuando la ejecución falla en lugar de encadenar ediciones sin comprobación.
- Generación de parches en un bucle de evaluación tipo SWE-bench: el modelo base Qwen3-8B es manejable en una sola GPU y el adaptador añade unos 0,7 GB, lo que abarata la experimentación con agentes de código en investigación académica.
- Punto de partida para ablaciones reproducibles: al publicarse manifiesto, hashes y pesos por token, sirve como referencia para estudiar el efecto del force-keep en la supervisión de agentes, comparándolo con el brazo que sí lo aplica.
- Asistente de código en entorno controlado con tool calling: con el modelo base sirviendo de soporte para function calling, puede conectarse a un ejecutor de comandos o a un sistema de ficheros para tareas de automatización de mantenimiento de código, siempre con sandbox.
- Fine-tuning posterior (continued fine-tuning): al ser un adaptador PEFT sobre licencia Apache-2.0, puede fusionarse o apilarse con otros adaptadores LoRA para especializar aún más el comportamiento de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, SWE-bench ni ninguna otra métrica, ni comparaciones cuantitativas con otros adaptadores o con el modelo base.

## Requisitos de hardware

- El adaptador por sí solo no es ejecutable: requiere cargar Qwen/Qwen3-8B.
- VRAM estimada para inferencia (modelo base 8B más el adaptador): aproximadamente 16-17 GB en bf16/fp16; aproximadamente 6-7 GB en cuantización de 4 bits; aproximadamente 9-10 GB en 8 bits. Los valores no se han verificado con este adaptador concreto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para servicio en bf16 con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 con contexto moderado; RTX 4080 (16 GB) y RTX 3060 (12 GB) solo con cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB sin cuantizar y en tarjetas de 12-16 GB con cuantización de 4 bits, asumiendo ventanas de contexto reducidas.
- Opciones de despliegue: transformers + peft (carga directa del adaptador, tal como indica la model card), vLLM (soporta adaptadores LoRA, aunque la combinación no está documentada por el autor), TGI, y llama.cpp u Ollama únicamente si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pourasrp/star-A2 | Adaptador sobre 8B (aprox. 175 M de parametros de adaptador) | Heredado de Qwen3-8B (32.768 nativos) | safetensors (PEFT/LoRA) | Apache-2.0 | Ablacion utility-only del proyecto STAR; sin benchmarks publicados |
| Qwen/Qwen3-8B (base) | 8B densos | 32.768 nativos, 131.072 con YaRN | safetensors, GGUF | Apache-2.0 | Modelo generalista; el adaptador es un ajuste supervisado sobre él |
| Otros adaptadores de agente de codigo sobre Qwen3-8B | No disponible | No disponible | No disponible | No disponible | No se dispone de informacion comparable en los datos proporcionados |

No se dispone de datos de rendimiento de ninguno de los elementos comparados dentro de la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay benchmarks ni métricas, por lo que no es posible afirmar que mejore al modelo base en tareas de agente de código.
- Modelo sin traccion verificable: 0 descargas y 0 valoraciones en el repositorio en el momento de redactar la ficha. No hay evidencia de uso independiente.
- El adaptador no incluye el modelo base: es obligatorio descargar Qwen/Qwen3-8B por separado y usar la revisión indicada (b968826d9c46dd6066d109eabc6255188de91218) para reproducir el comportamiento entrenado.
- Datos de entrenamiento restringidos: la model card indica que los datos provienen de SWE-Lego Real y que no se redistribuye texto de trayectorias, lo que limita la auditoría del conjunto de entrenamiento y puede introducir sesgos heredados de esa fuente.
- Riesgo de alucinación de código: como cualquier modelo generativo aplicado a programación, puede producir APIs inexistentes, imports incorrectos o parches que compilan pero no resuelven el problema. La verificación por ejecución en sandbox es imprescindible.
- Especialización estrecha: el ajuste se ha hecho sobre trayectorias de agente de código con un esquema de supervisión concreto. Es probable que degrade capacidades generales o conversacionales respecto al modelo base, aunque no hay datos que lo cuantifiquen.
- Idiomas no declarados: no hay garantía de comportamiento correcto fuera del inglés técnico habitual en repositorios de código.
- Restricciones de licencia: el adaptador es Apache-2.0 y el modelo base también, por lo que el uso comercial está permitido en principio, pero conviene verificar la licencia del proyecto GitHub asociado y de la fuente de datos SWE-Lego Real antes de un despliegue en producción.
- Para producción: no hay documentación de plantilla de chat, configuración de decodificación recomendada, ni pruebas de estabilidad en contextos largos. Debe tratarse como artefacto de investigación, no como componente listo para servicio.
- Fechas de creación y actualización del repositorio (2026-10-15) poco habituales; conviene verificar la integridad de los ficheros con los hashes SHA-256 publicados (adapter_model.safetensors: 4dfe92988fc312d53e8196986e74fda7070f22eef30b8e55b77589079e782cf8).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pourasrp/star-A2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/pourasrp/star_v1
- Pesos por token: https://huggingface.co/datasets/pourasrp/star-weights
- Codigo y materiales del proyecto STAR: https://github.com/chaitanyamedidar/STAR
- DOI del dataset: https://doi.org/10.57967/hf/11003
- DOI del modelo: https://doi.org/10.57967/hf/11004
