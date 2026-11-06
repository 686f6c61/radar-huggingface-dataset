# duggle1993/Qwen2.5-Coder-32B-Instruct-abliterated

## Resumen

Qwen2.5-Coder-32B-Instruct-abliterated es una variante "abliterated" (con las direcciones de rechazo suprimidas mediante edición de pesos) del modelo Qwen2.5-Coder-32B-Instruct desarrollado originalmente por el equipo Qwen de Alibaba Cloud. La modificación la firma el usuario duggle1993 en Hugging Face y su objetivo es eliminar los mecanismos de rechazo del modelo base, de modo que responda a peticiones que el original declinaría. El modelo conserva la arquitectura, el tamaño y las capacidades del original: un transformer denso de 32.763.876.352 parámetros (unos 32,8 mil millones) especializado en generación de código.

El modelo base Qwen2.5-Coder-32B-Instruct es un transformer decoder-only de la familia Qwen2.5, entrenado con un volumen elevado de tokens de código y texto, y con un contexto nativo de 32.768 tokens (extensible hasta 131.072 mediante RoPE scaling, según la documentación del modelo original). Esta variante hereda esas características y añade la supresión de rechazos, lo que la hace relevante para investigadores que estudian alineamiento, safety y comportamiento de modelos, así como para casos donde el filtrado del modelo base resulta demasiado restrictivo.

La ficha se centra en lo que se puede verificar a partir de la información disponible en Hugging Face. Conviene subrayar que el repositorio tiene acceso restringido (gated), requiere aceptar condiciones, acumula 11 descargas y 0 likes en el momento de la consulta, y no publica tarjeta de modelo detallada ni resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), denso |
| Parametros totales | 32.763.876.352 (~32,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; extensible a 131.072 con RoPE scaling (heredado del base, no verificado en esta variante) |
| Tipos de cuantizacion | No disponible en el repo (pesos safetensors en precisión original); el base admite GPTQ, AWQ y GGUF en el ecosistema, pero esta variante no publica cuantizaciones |
| Idiomas soportados | en (segun la tarjeta del repo); el base Qwen2.5-Coder soporta multilingue amplio, pero esta variante solo declara ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 65,5 GB |
| Libreria | transformers |
| Acceso | Restringido (gated) |
| Modelo base | Qwen/Qwen2.5-Coder-32B-Instruct |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-Coder-32B-Instruct: un transformer decoder-only denso con atención causal estándar, normalización RMSNorm, activación SwiGLU y sesgos QKV, con 64 capas, dimensión oculta de 5.120 y 40 cabezas de atención (8 cabezas KV, GQA), según la configuración pública del modelo base. El entrenamiento original de Qwen2.5-Coder combinó un corpus masivo de código con datos de texto general y pasó por fases de preentrenamiento, ajuste supervisado y optimización con preferencias (DPO), orientadas a mejorar la corrección sintáctica, la fidelidad a la instrucción y la capacidad de razonamiento sobre código.

La modificación "abliterated" no reentrena el modelo: aplica una técnica de edición de pesos que identifica la dirección (vector) asociada al comportamiento de rechazo en el espacio de activaciones y la proyecta fuera de los pesos de las capas correspondientes. Esto suprime la tendencia a declinar peticiones sin alterar el resto de capacidades de forma deliberada, aunque en la práctica puede degradar ligeramente la coherencia en tareas sensibles y en el seguimiento estricto de instrucciones. No se dispone de información publicada sobre el procedimiento exacto, el conjunto de datos usado para calcular la dirección de rechazo ni las métricas de evaluación posteriores a la ablación.

## Capacidades

- Generación de código en múltiples lenguajes de programación (herencia del base Qwen2.5-Coder, entrenado específicamente para ello).
- Razonamiento sobre código: explicación, depuración, refactorización y generación de tests.
- Generación de texto general y conversación multi-turno en formato chat.
- Razonamiento matemático y lógico dentro del ámbito del modelo base.
- Soporte de tool calling y function calling (capacidad del base Qwen2.5-Coder-Instruct).
- Capacidad de agentes y razonamiento multi-paso (heredada del base, no verificada en esta variante).
- Multilingüe en el modelo base; esta variante declara únicamente inglés en su tarjeta.
- Supresión de rechazos: responde a peticiones que el modelo base filtraría (característica definitoria de la variante).
- No dispone de visión ni audio.

## Casos de uso

- Investigación en safety y alineamiento: permite estudiar qué comportamientos emergen al eliminar la dirección de rechazo y comparar respuestas con el modelo base para analizar sesgos y mecanismos de negativa.
- Red teaming y evaluación de robustez: útil para generar prompts adversarios y analizar la respuesta del sistema ante contenido que el modelo original bloquearía, en entornos controlados de laboratorio.
- Generación de código en pipelines internos: el modelo conserva la capacidad de completar, explicar y refactorizar código del base, por lo que puede integrarse en asistentes de desarrollo siempre que se acepten las condiciones de acceso.
- Depuración y análisis de repositorios: con 32.768 tokens de contexto nativo puede procesar archivos y fragmentos de proyecto extensos para localizar errores o proponer cambios.
- Generación de tests y documentación técnica: a partir de firmas de funciones y código existente, produce pruebas unitarias y comentarios de documentación.
- Asistencia conversacional técnica sin filtros: en entornos de investigación donde el filtrado del modelo base interfiere con la tarea (por ejemplo, análisis de malware o de código ofensivo con fines defensivos), la variante reduce las negativas espurias.
- Fine-tuning posterior: al estar en safetensors y licencia Apache 2.0, sirve como punto de partida para ajustes específicos de dominio donde se prefiera un modelo sin rechazos incorporados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones propias de la variante abliterated ni comparaciones con el modelo base. Los benchmarks públicos del Qwen2.5-Coder-32B-Instruct original (HumanEval, MBPP, LiveCodeBench, etc.) no son trasladables automáticamente a esta variante sin verificación empírica.

## Requisitos de hardware

- VRAM estimada en precisión original (BF16/FP16): aproximadamente 65,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, H200, o múltiples GPU (2× A100 40 GB, 2× RTX 4090 24 GB con tensor parallelism).
- Cuantización a 8 bits: ~33 GB, cabe en una A100 40 GB o en 2× RTX 4090.
- Cuantización a 4 bits: ~17-18 GB, cabe en una RTX 4090 24 GB o RTX 3090 24 GB, con margen limitado para contexto largo.
- Consumer GPU: sí, en cuantización 4 bits (RTX 4090, 3090, 4080 16 GB con contexto reducido); no cabe en consumer GPU en BF16.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM, TGI (el repo incluye el tag text-generation-inference), llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización, sin datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| duggle1993/Qwen2.5-Coder-32B-Instruct-abliterated | 32,8 B | 32.768 (base) | Apache 2.0 | Gated | Variante sin rechazos, sin benchmarks publicados |
| Qwen/Qwen2.5-Coder-32B-Instruct | 32,8 B | 32.768 (extensible a 131.072) | Apache 2.0 | Abierto | Modelo base, con benchmarks públicos y filtros de seguridad |
| Otras variantes abliterated de Qwen2.5-Coder | ~32 B | 32.768 | Apache 2.0 | Variable | Existen múltiples forks comunitarios con enfoques de ablación distintos; no se dispone de comparación cuantitativa |
| Modelos de código de tamaño similar (p. ej., CodeLlama-34B-Instruct) | 34 B | 16.384 | Llama 2 custom | Abierto | Referencia de la generación anterior; contexto menor y sin tool calling nativo |

## Limitaciones y advertencias

- La supresión de rechazos elimina una capa de seguridad: el modelo puede generar contenido dañino, ilegal o inseguro sin advertir; no debe desplegarse en producción orientada a usuarios finales sin moderación externa.
- Riesgo de alucinación: como cualquier LLM, puede inventar APIs, funciones o referencias; la ablación puede aumentar la confianza en respuestas incorrectas al eliminar las negativas.
- La tarjeta declara únicamente inglés; el rendimiento multilingüe del base puede no conservarse íntegramente tras la edición de pesos.
- El contexto extendido a 131.072 tokens es una característica del base no verificada en esta variante; conviene validarla empíricamente antes de usarla.
- Licencia Apache 2.0 permite uso comercial, pero el acceso es restringido (gated) y requiere aceptar condiciones en Hugging Face; además, el uso comercial de un modelo sin filtros conlleva responsabilidad legal y reputacional.
- Sin benchmarks ni evaluación de la degradación introducida por la ablación: no hay garantía de que las capacidades de código se mantengan al nivel del base.
- Repositorio con muy poca tracción (11 descargas, 0 likes) y sin mantenimiento documentado; no hay garantía de soporte ni de actualizaciones.
- La fecha de creación indicada (2026-10-28) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad y procedencia de los pesos antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/duggle1993/Qwen2.5-Coder-32B-Instruct-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Repositorio oficial de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Blog de Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder/
- Paper técnico de Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Documentación de transformers sobre Qwen2: https://huggingface.co/docs/transformers/model_doc/qwen2
