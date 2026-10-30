# hyunlp-evateam3/20261026_healthbench_static_qwen3-4b_impl-ruscarl_s1_whole_rubric

## Resumen

Este repositorio no es un modelo de producción al uso, sino una colección de checkpoints de investigación: un fine-tuning por aprendizaje por refuerzo (RL) de Qwen3-4B-Instruct-2507 (Alibaba Qwen) orientado al dominio sanitario, entrenado sobre HealthBench, el benchmark de OpenAI compuesto por miles de conversaciones de salud evaluadas con rúbricas redactadas por médicos. Lo publica el equipo hyunlp-evateam3 (HYU-NLP-EVA2), y la ejecución comenzó el 26 de octubre de 2026 con un objetivo de 140 pasos de entrenamiento, subiendo los checkpoints de forma asíncrona a medida que avanza.

El sufijo del nombre ("whole_rubric") sugiere que la recompensa de RL se calcula sobre la rúbrica completa de HealthBench, y "impl-ruscarl" parece referirse a la implementación concreta del algoritmo de RL empleada, aunque la model card no lo documenta. El interés del repositorio es principalmente metodológico: permite estudiar cómo evoluciona un modelo denso de 4B a lo largo del entrenamiento con recompensas basadas en rúbricas clínicas, cargando snapshots individuales desde `checkpoints/global_step_XXXXXX/`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con GQA (heredado de Qwen3-4B-Instruct-2507) |
| Parámetros totales | ≈4.000 millones (4B), heredados del modelo base |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 262.144 tokens (256K), según la ficha del modelo base |
| Tipos de cuantización | BF16 (pesos publicados); no hay versiones cuantizadas oficiales |
| Idiomas soportados | No disponible para el fine-tuning; el modelo base declara soporte para 119 idiomas |
| Licencia | No disponible (el modelo base Qwen3-4B-Instruct-2507 se distribuye bajo Apache 2.0) |
| Formato de pesos | Safetensors en BF16, organizados por checkpoint en `checkpoints/global_step_XXXXXX/` |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamaño del repositorio | 2140 GB (incluye múltiples checkpoints) |
| Pasos de entrenamiento objetivo | 140 (según la model card) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer causal denso de 4B parámetros con atención agrupada de consultas (GQA) y ventana de contexto nativa de 256K tokens. Qwen3-4B-Instruct-2507 es una variante exclusivamente "non-thinking" (sin modo de razonamiento explícito), optimizada para seguimiento de instrucciones y uso de herramientas. El fine-tuning no modifica la arquitectura: ajusta los pesos por RL.

Sobre el entrenamiento, la model card indica que se trata de una ejecución de aprendizaje por refuerzo etiquetada con `reinforcement-learning` y `healthbench`, iniciada el 26 de octubre de 2026 con un objetivo de 140 pasos. El nombre del repositorio sugiere tres componentes de configuración: una implementación de RL denominada "ruscarl" (sin documentación pública en la ficha), la semilla o identificador "s1" y el uso de la "rúbrica completa" (whole rubric) de HealthBench como señal de recompensa. HealthBench, el benchmark de referencia, contiene miles de conversaciones sanitarias realistas acompañadas de rúbricas escritas por médicos que evalúan precisión clínica, comunicación y conciencia contextual. No se publican hiperparámetros (learning rate, tamaño de batch, algoritmo exacto) ni la composición detallada del dataset; los outputs de entrenamiento y el estado de reanudación se mantienen en un archivo local del equipo, no en el Hub.

## Capacidades

- Generación de texto conversacional heredada de Qwen3-4B-Instruct-2507, con el fine-tuning orientado a respuestas de salud evaluables mediante rúbricas clínicas.
- Soporte de tool calling / function calling heredado del modelo base, que mejoró notablemente el uso de herramientas en la versión 2507.
- Ventana de contexto de 256K tokens (heredada), útil para conversaciones largas y documentos extensos.
- Cobertura multilingüe del modelo base (119 idiomas declarados), aunque el entrenamiento sobre HealthBench es en inglés, por lo que el comportamiento en español no está verificado.
- Sin capacidades de visión, audio ni modo de razonamiento explícito (thinking): el modelo base 2507 es non-thinking.
- Capacidad especial como artefacto de investigación: cada snapshot (`global_step_XXXXXX`) puede cargarse de forma independiente para analizar curvas de aprendizaje del RL.

## Casos de uso

- Investigación en RL con recompensas basadas en rúbricas: los checkpoints por paso permiten reconstruir la curva de entrenamiento y analizar cómo mejora (o degrada) el cumplimiento de rúbricas clínicas a lo largo de los 140 pasos, algo valioso para papers sobre RLHF/RLAIF en dominios especializados.
- Evaluación comparativa de algoritmos de RL: sirve como punto de referencia para comparar la implementación "ruscarl" con otros algoritmos de RL sobre el mismo modelo base y el mismo dataset, controlando arquitectura y datos.
- Estudios de dinámica de entrenamiento: cargar snapshots intermedios (por ejemplo, el paso 11 frente al 140) permite medir catástrofes de olvido, drift de formato o sobreajuste a la rúbrica sin esperar al modelo final.
- Punto de partida para fine-tunings posteriores: cualquier snapshot puede usarse como inicialización para SFT o DPO adicionales en el dominio sanitario, aprovechando que ya está alineado con rúbricas médicas.
- Prototipado de asistentes de salud informativos (no clínicos): el modelo puede integrarse en demos de chat sanitario para investigación en interacción persona-IA, siempre con disclaimers y sin uso en decisiones clínicas reales.
- Construcción de pipelines de evaluación automatizada: el formato con subcarpetas y el snippet de `transformers` facilita scripts que descargan un paso concreto y lo evalúan en HealthBench u otros benchmarks médicos, útil en CI de investigación.
- Educación y formación: análisis del repositorio como caso práctico de MLOps de investigación (checkpoints asíncronos, colecciones públicas, gestión de repos de gran tamaño).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el objetivo del entrenamiento es HealthBench, pero no incluye puntuaciones del modelo base ni de ningún checkpoint intermedio, ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM para inferencia en BF16: los pesos ocupan ≈8 GB; con caché KV y overhead de runtime, se recomienda una GPU con 12-16 GB de VRAM para contextos moderados.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB ejecutan el modelo con holgura; con contextos cercanos a 256K la caché KV crece sustancialmente y conviene una GPU de 24 GB o cuantización externa (no publicada).
- GPUs de centro de datos: A100 o H100 son adecuadas para evaluación masiva de checkpoints, aunque no son necesarias para inferencia de un único modelo.
- Hardware de entrenamiento del run original: no disponible.
- Despliegue: soporte directo con `transformers` (cargando el subfolder del checkpoint deseado); compatible con vLLM y TGI al ser un Qwen3 estándar; llama.cpp y Ollama requerirían conversión a GGUF, que no está publicada.
- Latencia y throughput: no se publican mediciones; al ser un modelo denso de 4B en BF16, el rendimiento en una sola GPU de consumo es manejable, pero no hay cifras oficiales.
- Nota práctica: el repositorio completo pesa 2140 GB; descarga solo el subfolder del checkpoint necesario para evitar transferencias masivas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (checkpoints HealthBench) | 4B | 262.144 (heredada) | No disponible | Checkpoints de investigación, safetensors BF16 |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | 262.144 | Apache 2.0 | Pesos finales estables, amplio soporte de ecosistema |
| google/gemma-3-4b-it | 4B | 128.000 | Gemma (restricciva, acceso condicionado) | Multimodal (visión), pesada verificación para descarga |
| microsoft/Phi-4-mini-instruct | 3,8B | 128.000 | MIT | Solo texto, fuerte en razonamiento y código |

Frente a su modelo base, la diferencia está en el alineamiento por RL con rúbricas de salud y en la naturaleza experimental (checkpoints parciales frente a release estable). Frente a Gemma 3 4B y Phi-4-mini, este repositorio pierde en madurez de despliegue (sin licencia declarada, sin GGUF, sin benchmarks publicados) pero gana como objeto de estudio del entrenamiento paso a paso.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción: los checkpoints se suben de forma asíncrona y la ejecución puede estar incompleta respecto a los 140 pasos objetivo.
- Riesgo de alucinación médica elevado: ningún LLM de 4B es fiable para información clínica; el modelo no debe usarse para diagnóstico, triaje ni decisiones sanitarias reales.
- La licencia del fine-tuning no está declarada en el Hub, lo que introduce incertidumbre legal para uso comercial; el modelo base es Apache 2.0, pero conviene verificar con los autores antes de cualquier despliegue comercial.
- El entrenamiento se basa en HealthBench, que está en inglés: el rendimiento en español y otros idiomas no está evaluado y probablemente sea inferior al del modelo base.
- No hay model card con hiperparámetros, composición del dataset, resultados de evaluación ni detalles del algoritmo "ruscarl", lo que dificulta la reproducibilidad completa.
- Validación comunitaria prácticamente nula: 0 descargas y 1 like en el momento de la ficha.
- Tamaño del repositorio (2140 GB) y estructura por subcarpetas: cargar el repo sin especificar `subfolder` puede fallar o descargar datos innecesarios.
- Sin versiones cuantizadas ni GGUF oficiales, lo que limita el despliegue en entornos con recursos ajustados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hyunlp-evateam3/20261026_healthbench_static_qwen3-4b_impl-ruscarl_s1_whole_rubric
- Colección del experimento (checkpoints): https://huggingface.co/collections/HYU-NLP-EVA2/20261027-healthbench-qwen3-4b-whole-rubric-checkpoints-6adf7376f6a303d66d82d8a0
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Referencia del benchmark HealthBench (OpenAI): https://openai.com/index/healthbench/
