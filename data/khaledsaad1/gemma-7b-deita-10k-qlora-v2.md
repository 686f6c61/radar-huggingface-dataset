# Khaledsaad1/gemma-7b-deita-10k-qlora-v2

## Resumen

`Khaledsaad1/gemma-7b-deita-10k-qlora-v2` es un adaptador LoRA (PEFT) publicado en HuggingFace por el usuario Khaledsaad1, obtenido mediante ajuste supervisado (SFT) sobre el modelo base cuantizado `unsloth/gemma-7b-bnb-4bit`, es decir, Gemma 7B de Google DeepMind cargado en 4 bits con bitsandbytes. El repositorio contiene únicamente los pesos del adaptador (0,3 GB en safetensors) y no una copia completa del modelo, por lo que su uso requiere descargar y cargar el modelo base por separado con la librería PEFT 0.21.2 o superior.

El modelo no resuelve un problema declarado de forma explícita: la model card es una plantilla sin completar, con la mayoría de secciones marcadas como "[More Information Needed]". No hay información publicada sobre el dataset de entrenamiento, los hiperparámetros, el rango del adaptador, los idiomas objetivo ni la licencia. El identificador sugiere un ajuste sobre 10.000 ejemplos, presumiblemente del dataset Deita (selección automática de datos de alineación), pero se trata de una inferencia a partir del nombre y no de un dato confirmado por el autor.

Su relevancia es, por tanto, limitada y de carácter experimental: cero descargas y cero "likes" en el momento de la consulta, ausencia total de evaluación y de documentación, y una licencia sin especificar que impide su uso comercial con garantías. Resulta útil como ejemplo de flujo de trabajo LoRA + Unsloth + TRL sobre Gemma 7B, o como punto de partida para experimentación, pero no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre Gemma 7B); arquitectura del adaptador no detallada en la model card |
| Parámetros totales | ~8.500 millones en el modelo base Gemma 7B; el adaptador ocupa 0,3 GB en disco (rango LoRA no disponible) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (heredado de Gemma 7B; no confirmado para el adaptador) |
| Tipos de cuantización | Modelo base en 4 bits NF4 vía bitsandbytes (`unsloth/gemma-7b-bnb-4bit`); el adaptador se distribuye en safetensors con precisión no especificada; no se publican otras cuantizaciones |
| Idiomas soportados | no disponible (el modelo base Gemma 7B está entrenado principalmente en inglés, con competencia multilingüe limitada) |
| Licencia | no disponible para el adaptador; el modelo base se rige por los Gemma Terms of Use de Google |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Gemma 7B, un transformer decoder-only de Google con aproximadamente 8.500 millones de parámetros, atención con multi-head y multi-query agrupada (GQA), activaciones GeGLU, normalización RMSNorm y embeddings compartidos entre entrada y salida, con un vocabulario de 256.000 tokens y una ventana de contexto de 8.192 tokens. El modelo base utilizado no es la versión original en punto flotante, sino la conversión a 4 bits NF4 publicada por Unsloth, lo que reduce el peso en memoria a unos 5-6 GB y permite el ajuste en GPU de consumo.

Los metadatos del repositorio indican entrenamiento con TRL y Unsloth bajo la modalidad de ajuste supervisado (SFT) con adaptadores LoRA sobre la base cuantizada (QLoRA), con PEFT 0.21.2 como versión de referencia. No se especifican hiperparámetros (rango, alpha, dropout, learning rate, épocas), ni el número exacto de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron etapas posteriores de alineación como DPO o RLHF. El sufijo del identificador, `deita-10k`, apunta a un conjunto de 10.000 ejemplos probablemente derivado de Deita, una metodología de selección automática de datos de instrucción, pero la model card no lo confirma ni enlaza la dataset card correspondiente.

## Capacidades

- Generación de texto conversacional en formato instructivo, como consecuencia del ajuste supervisado sobre un modelo base ya instruido.
- Razonamiento básico y respuesta a preguntas en inglés, heredado de Gemma 7B; no hay evidencia publicada de mejora específica en razonamiento.
- Generación de código y matemáticas a nivel del modelo base; sin evaluación que cuantifique el efecto del ajuste.
- Soporte de tool calling o function calling: no documentado y no verificable en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo "thinking", visión o audio: no disponibles; el pipeline declarado es exclusivamente `text-generation`.
- Capacidades multilingües: no disponibles; el modelo base Gemma 7B no está optimizado para castellano.
- Formato de pesos compatible con PEFT, lo que permite apilar o combinar el adaptador con otros sobre la misma base.

## Casos de uso

- Prototipado de asistentes conversacionales: el adaptador se puede cargar sobre Gemma 7B en 4 bits y desplegar en una única GPU de 8-12 GB para validar flujos de diálogo multi-turno dentro de la ventana de 8.192 tokens, antes de invertir en un modelo mayor.
- Experimentación académica con QLoRA: sirve como ejemplo reproducible de ajuste con Unsloth + TRL + PEFT sobre una base cuantizada, útil para comparar configuraciones de rango, alpha y tasa de aprendizaje.
- Docencia y formación técnica: permite ilustrar en un taller cómo se distribuye un adaptador (0,3 GB en safetensors) frente a un modelo completo (más de 15 GB en fp16) y cómo se compone en tiempo de carga.
- Pruebas de infraestructura de inferencia: útil para validar pipelines de carga de adaptadores PEFT en servicios propios, incluyendo comprobaciones de compatibilidad de versiones de transformers, PEFT y bitsandbytes.
- Base para ajustes posteriores: al ser un adaptador ligero, puede servir de inicialización para un segundo SFT sobre un dominio concreto, o fusionarse con la base fp16 para generar un checkpoint completo.
- Evaluación comparativa de metodologías de selección de datos: si se confirma que se entrenó con un subconjunto de Deita, permite medir el efecto de la selección automática de datos frente a un SFT con datos sin curar.
- Demostraciones locales sin conexión: con la base en 4 bits puede ejecutarse en un portátil con GPU de 8 GB, lo que facilita demos en entornos sin acceso a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación cumplimentada y el repositorio no enlaza ninguna evaluación externa.

| Benchmark | Resultado del adaptador | Resultado del modelo base |
|---|---|---|
| MMLU | no disponible | no disponible en esta ficha |
| HumanEval | no disponible | no disponible en esta ficha |
| GSM8K | no disponible | no disponible en esta ficha |

## Requisitos de hardware

- VRAM para inferencia en 4 bits: aproximadamente 5-6 GB solo para los pesos del modelo base, más el adaptador (0,3 GB) y la caché KV; con contexto de 8.192 tokens, el consumo realista se sitúa en 8-12 GB.
- VRAM para inferencia en fp16/bf16: en torno a 17-18 GB para los pesos, más caché KV; requiere GPU de 24 GB o superior para contextos largos.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB y RTX 4090 24 GB; en 8 GB solo cabe con contexto reducido y cuantización agresiva.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S 48 GB para servir en fp16 con paralelismo o lotes grandes.
- Opciones de despliegue: `transformers` + `peft` (ruta natural, cargando el adaptador sobre la base), vLLM con soporte de adaptadores LoRA (requiere una base en un formato compatible, no la versión bnb-4bit), TGI y llama.cpp/Ollama solo tras fusionar el adaptador con la base y convertir a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Evaluación publicada |
|---|---|---|---|---|---|
| Este adaptador (`gemma-7b-deita-10k-qlora-v2`) | ~8,5 B (base) + LoRA | 8.192 (heredado) | no disponible | HuggingFace, 0 descargas | no disponible |
| Gemma 7B Instruct (Google) | ~8,5 B | 8.192 | Gemma Terms of Use | HuggingFace, ampliamente utilizado | Sí, publicada por Google |
| Mistral 7B Instruct v0.3 | ~7,2 B | 32.768 | Apache 2.0 | HuggingFace | Sí, publicada por Mistral AI |
| Llama 3.1 8B Instruct | ~8 B | 131.072 | Llama 3.1 Community License | HuggingFace | Sí, publicada por Meta |

La comparación de rendimiento no es posible: el adaptador carece de evaluación publicada, mientras que las tres alternativas cuentan con resultados oficiales en MMLU, HumanEval y GSM8K. En términos de licencia, Mistral 7B (Apache 2.0) es la opción más permisiva para uso comercial; Gemma 7B y Llama 3.1 8B imponen restricciones adicionales, y este adaptador no declara licencia alguna.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia explícita no se puede asumir permiso de uso comercial; además, el adaptador hereda las restricciones de los Gemma Terms of Use del modelo base.
- Ausencia total de evaluación: no hay benchmarks, ni evaluación cualitativa, ni ejemplos de salida; el comportamiento real del ajuste es desconocido.
- Model card incompleta: prácticamente todas las secciones están sin rellenar, incluidos el dataset, los hiperparámetros y las recomendaciones de uso.
- Trazabilidad limitada: se desconoce el contenido exacto del dataset de entrenamiento, lo que impide evaluar sesgos introducidos o contaminación de benchmarks.
- Riesgo de alucinación y de degradación por sobreajuste: un SFT sobre 10.000 ejemplos con un adaptador de rango bajo puede producir olvido catastrófico o sobreajuste al estilo del dataset, sin que haya métricas que lo detecten.
- Idiomas: no se declara soporte de castellano; el modelo base Gemma 7B está centrado en inglés y su rendimiento en español será limitado.
- Sesgos: no documentados; se heredan los del modelo base y los del corpus de ajuste, sin ningún análisis publicado.
- Dependencia de versiones: requiere PEFT 0.21.2 o compatible y una base concreta (`unsloth/gemma-7b-bnb-4bit`); cargarlo sobre otra variante del modelo base puede alterar los resultados.
- Adecuación a producción: nula con la información actual; cero descargas y cero validación por parte de la comunidad.
- Fecha de creación en los metadatos: 2026-10-23, posterior a la fecha habitual de consulta; conviene verificar la integridad de los metadatos antes de citar el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Khaledsaad1/gemma-7b-deita-10k-qlora-v2
- Modelo base utilizado: https://huggingface.co/unsloth/gemma-7b-bnb-4bit
- Gemma 7B original de Google: https://huggingface.co/google/gemma-7b
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
