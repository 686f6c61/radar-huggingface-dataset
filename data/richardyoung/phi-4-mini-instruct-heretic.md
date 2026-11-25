# richardyoung/Phi-4-mini-instruct-heretic

## Resumen

Phi-4-mini-instruct-heretic es una variante "abliterated" (también etiquetada como heretic, uncensored o decensored) del modelo Phi-4-mini-instruct de Microsoft, publicada por el usuario richardyoung en Hugging Face. El modelo base es un transformer denso de aproximadamente 3.836 millones de parámetros (3,84 B) desarrollado por Microsoft Research, diseñado para instrucciones conversacionales, razonamiento y generación de código en un formato compacto apto para despliegue en hardware moderado.

La modificación "heretic" consiste en un proceso de edición de pesos orientado a eliminar o atenuar los mecanismos de rechazo y las restricciones de contenido alineadas del modelo original, preservando la mayor parte de las capacidades del Phi-4-mini. El autor declara que el proceso es reproducible, aunque no se detalla en la información disponible la metodología exacta ni los datos de calibración empleados.

Su relevancia radica en que ofrece una alternativa sin filtros de seguridad sobre una arquitectura ya conocida y eficiente, con contexto amplio y soporte multilingüe (más de 20 idiomas). Ahora bien, el acceso está restringido (gated) en Hugging Face y la ficha debe tratarse con cautela: la ausencia de benchmarks publicados y de documentación técnica detallada limita seriamente su evaluación objetiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-3/Phi-4-mini, código custom `phi3`) |
| Parámetros totales | 3.836.021.760 (~3,84 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el Phi-4-mini base soporta 128K tokens; no confirmado para esta variante) |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en safetensors; se asume compatibilidad con cuantizaciones estándar del ecosistema transformers/GGUF, sin confirmar) |
| Idiomas soportados | Multilingüe: ar, zh, cs, da, nl, en, fi, fr, de, he, hu, it, ja, ko, no, pl, pt, ru, es, sv, th, tr, uk |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code` por código custom) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Phi-4-mini-instruct de Microsoft: un transformer decoder-only denso de unos 3,84 B de parámetros, con atención multi-cabeza estándar y tokenizador multilingüe. El modelo base fue entrenado por Microsoft con una mezcla de datos sintéticos y filtrados de alta calidad orientados a razonamiento, matemáticas y código, seguido de un pipeline de ajuste por instrucciones y alineación (SFT y preferencias). Los detalles exactos sobre número de tokens, composición del dataset y método de alineación del modelo base no se reproducen en la información disponible de esta ficha.

La innovación específica de esta variante es el proceso de "abliteration" o edición de pesos que elimina la dirección de rechazo en el espacio de activaciones, reduciendo la probabilidad de respuestas de negativa ante peticiones que el modelo original rechazaría. El autor etiqueta el resultado como "reproducible", pero no se documentan en la información disponible ni el algoritmo concreto, ni el conjunto de prompts de calibración, ni las métricas de degradación asociadas al proceso.

## Capacidades

- Generación de texto conversacional multi-turno en más de 20 idiomas.
- Razonamiento y resolución de problemas de complejidad media.
- Generación y explicación de código en lenguajes habituales.
- Matemáticas y cálculo simbólico a nivel de instrucción.
- Respuestas a peticiones que el modelo base rechazaría, por el proceso de abliteration aplicado.
- Compatibilidad con el ecosistema transformers y text-generation-inference (según tags).
- Soporte de tool calling / function calling: no confirmado explícitamente para esta variante en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente para esta variante.
- Visión y audio: no disponibles (modelo solo texto).

## Casos de uso

- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo tras la eliminación de la dirección de rechazo, comparándolo con el Phi-4-mini-instruct original en tareas controladas de evaluación de sesgos y robustez.
- Generación creativa sin restricciones temáticas: útil para escritura de ficción, guiones o narrativa que aborde temas sensibles y que el modelo base tendería a evitar.
- Red teaming y pruebas de robustez: empleado como generador de prompts adversarios o de contenido de prueba para validar filtros y clasificadores de seguridad en pipelines propios.
- Asistencia de código en entornos internos: por su tamaño compacto, puede desplegarse en una GPU de gama media para autocompletado y explicación de código en herramientas de desarrollo internas.
- Procesamiento multilingüe en local: al soportar más de 20 idiomas, resulta adecuado para traducción asistida o resumen de documentos en despliegues con requisitos de privacidad (on-premise).
- Experimentación académica con modelos pequeños: su tamaño de 3,84 B permite ejecutar experimentos de fine-tuning y evaluación en hardware de laboratorio asequible.
- Chatbot de dominio cerrado sin filtros: en entornos donde el operador asume la responsabilidad del filtrado externo, puede integrarse detrás de una capa propia de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas propias de esta variante (MMLU, HumanEval, GSM8K u otras) ni de comparaciones cuantitativas con el modelo base que permitan estimar la degradación introducida por el proceso de abliteration.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): en torno a 7,7 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 12-16 GB para contexto moderado.
- Cuantización a 8 bits: aproximadamente 4 GB de pesos; a 4 bits: aproximadamente 2-2,5 GB de pesos (estimaciones teóricas, no verificadas para esta variante).
- GPU recomendadas: NVIDIA RTX 4090, RTX 3090, A100 o H100 para fp16 con contexto largo; GPUs de 8-12 GB (RTX 3060/4060 Ti, L4) suficientes en cuantización 4-8 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando cuantización; en fp16 se recomienda 16 GB o más.
- Opciones de despliegue: transformers (requiere `trust_remote_code` por el código custom `phi3`), text-generation-inference (según tags); compatibilidad con vLLM, llama.cpp u Ollama no confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/Phi-4-mini-instruct-heretic | ~3,84 B | No disponible | MIT | Variante abliterated, acceso gated, sin benchmarks publicados |
| microsoft/Phi-4-mini-instruct | ~3,84 B | 128K (según ficha del modelo base) | MIT | Modelo original alineado; referencia directa de comparación |
| Qwen2.5-3B-Instruct | ~3,1 B | 32K (versión base; ampliable) | Apache 2.0 | Alternativa densa de tamaño similar con buen rendimiento en código y multilingüe |
| Llama-3.2-3B-Instruct | ~3,2 B | 128K | Llama 3.2 Community License | Alternativa de tamaño comparable con restricciones de licencia para uso comercial a gran escala |

La comparación cuantitativa de rendimiento no puede establecerse porque esta variante no publica benchmarks. La diferencia principal frente al Phi-4-mini-instruct original es la eliminación de rechazos, a costa de una posible degradación no medida en capacidades y alineación.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de que las capacidades del modelo base se conserven tras la abliteration.
- Riesgo elevado de generar contenido dañino, ofensivo o inexacto: el proceso elimina los mecanismos de rechazo, por lo que el operador debe implementar su propia capa de moderación.
- Mayor propensión a alucinaciones y a afirmar con seguridad información falsa, especialmente en temas sensibles donde el modelo base solía declinar.
- Sesgos heredados del corpus de entrenamiento de Microsoft, potencialmente amplificados por la pérdida de alineación.
- Idiomas: aunque se declaran más de 20, el rendimiento real por idioma no está documentado; el inglés domina en el modelo base.
- Licencia MIT: permite uso comercial, pero el despliegue de un modelo sin filtros conlleva responsabilidad legal y reputacional para el operador, incluyendo obligaciones bajo el AI Act europeo en función del caso de uso.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la distribución automatizada en pipelines.
- Requiere `trust_remote_code`: el código custom `phi3` debe auditarse antes de ejecutarlo en entornos de producción.
- No se documenta la metodología de abliteration ni el conjunto de evaluación de daños, lo que impide reproducir o verificar las afirmaciones del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Phi-4-mini-instruct-heretic
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Paper de referencia Phi-4 (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
- Referencia arXiv:2510.18892: https://arxiv.org/abs/2510.18892
- Referencia arXiv:2503.01743: https://arxiv.org/abs/2503.01743
