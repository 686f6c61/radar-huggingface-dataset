# MarxistLeninist/AGILLM-4.4

## Resumen

AGILLM-4.4 es un modelo de lenguaje causal experimental publicado por el usuario MarxistLeninist en Hugging Face. Se trata de un "estudiante" desacoplado de 49.097.218 parámetros, entrenado mediante destilación de conocimiento a partir de un modelo "padre" de 1.221.580.802 parámetros (AGILLM). El sistema completo sigue una inspiración Matryoshka (según el paper arXiv:2608.09703), aunque el autor aclara explícitamente que no es una reproducción fiel de dicho trabajo: aquí el estudiante es un componente separado, inicializado con cortes deterministas del padre y entrenado con representaciones desacopladas.

El artefacto liberado es un checkpoint congelado del estudiante en el paso 2.560.770 del padre, con un tamaño de 182,9 MB. El modelo está diseñado para generación de texto autoregresiva y se distribuye como un checkpoint personalizado de PyTorch, no compatible con `transformers.AutoModelForCausalLM`. Incluye un loader específico que valida integridad mediante SHA-256 y restaura el tokenizer embebido. Es un proyecto claramente experimental, sin benchmarks publicados y con una licencia "other" no especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con 22 capas, 4 cabezas, ancho 256, FFN denso, K/V atadas, ALiBi (escala 0.0) |
| Parametros totales | 49.097.218 (incluye 514 parámetros de compuerta SAT inerte) |
| Parametros activos | 49.097.218 (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos fp32 en el artefacto) |
| Idiomas soportados | no disponibles |
| Licencia | other (no especificada) |
| Formato de pesos | PyTorch `.pt` (checkpoint personalizado, no safetensors) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 22 capas, 4 cabezas de atención, ancho de 256 y rango de proyección 64, con K/V atadas y un contrato ALiBi corregido con escala 0.0. El entrenamiento se realiza mediante un esquema de destilación de conocimiento: el padre (1,22B parámetros, 28 capas, MoE, 14 DiffusionBlocks) produce representaciones ocultas maduras que se desacoplan (stop-gradient) y se usan para entrenar una subcapa (atención o FFN) del estudiante por actualización. El puente de entrenamiento es un LayerNorm(256) más una proyección sin bias de 256 a 1280 dimensiones, que solo existe durante el entrenamiento y se excluye del artefacto exportado.

El objetivo del estudiante combina pérdida de entropía cruzada causal exacta sobre el flujo de tokens con una pérdida de destilación basada en similitud coseno de representaciones ocultas normalizadas. El optimizador es PagedAdamW8bit separado, con su propio escalador, RNG y contadores. El modo de actualización en vivo usa batch de 1, 64 tokens objetivo, y un anclaje completo del estudiante cada 128 intentos. El checkpoint liberado contiene 2.900 commits de estudiante y 22 anclajes full-stack, con una pérdida CE final de 30,83 y una pérdida de destilación oculta de 0,0004.

## Capacidades

- Generación de texto autoregresiva: el loader incluido permite generar tokens con decodificación greedy o muestreo, como se demuestra en el test de humo que genera un token en CPU.
- Destilación de conocimiento: el modelo es el resultado de un pipeline de destilación teacher-student, aunque el artefacto liberado es solo el estudiante inferencial.
- Validación de integridad: el loader verifica SHA-256 del checkpoint y del tokenizer embebido antes de cargar, lo que garantiza reproducibilidad.
- Compatibilidad limitada: no soporta tool calling, ni visión, ni audio, ni modos de razonamiento especiales. Es un modelo puramente causal de texto.
- Multilingüismo: no se especifican idiomas soportados; se asume que hereda el vocabulario del tokenizer del padre, pero no hay datos al respecto.

## Casos de uso

- Investigación en destilación de modelos: el artefacto permite estudiar cómo un modelo compacto de 49M parámetros puede aprender representaciones de un padre de 1,22B mediante destilación desacoplada, útil para experimentos académicos sobre eficiencia de entrenamiento.
- Evaluación de arquitecturas compactas: sirve como banco de pruebas para analizar el comportamiento de transformers pequeños con K/V atadas y ALiBi a escala 0, en tareas de generación de texto de baja latencia.
- Prototipado de generación de texto en entornos con recursos limitados: al caber en CPU y en GPUs de gama baja, puede usarse para generar texto en aplicaciones donde no se dispone de hardware potente, aunque sin garantías de calidad.
- Estudio de compatibilidad de checkpoints: el loader personalizado y la validación SHA-256 son un ejemplo de cómo distribuir modelos con verificación de integridad, útil para proyectos que requieren trazabilidad.
- Comparación de estrategias Matryoshka: aunque no es una reproducción fiel del paper, permite contrastar empíricamente el enfoque de "estudiante separado" frente a suites anidadas compartidas.
- Desarrollo de pipelines de destilación continua: el esquema de actualización incremental (una subcapa por paso) puede inspirar implementaciones de destilación en tiempo real para otros proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo menciona una prueba de humo de compatibilidad (generación de un token en CPU) y no ofrece métricas de calidad como MMLU, HumanEval o GSM8K. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 49M parámetros; en fp32 ocupa aproximadamente 196 MB de memoria. Con el loader en CPU, no se requiere GPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente (p. ej., NVIDIA GTX 1050 Ti, RTX 2060, o integradas). No se requieren GPUs de datacenter.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna de consumo, incluso en modo CPU puro.
- Opciones de despliegue: el loader oficial (`agillm44_detachable_50m_loader.py`) es la única vía documentada. No es compatible con vLLM, llama.cpp, Ollama ni TGI sin adaptación manual.
- Latencia y throughput: no disponibles. El test de humo generó un token en CPU, pero no se reportan tiempos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con alternativas. Estructuralmente, podría compararse con modelos compactos de destilación como TinyLlama (1.1B) o GPT-2 (124M), pero AGILLM-4.4 es significativamente más pequeño (49M) y no tiene benchmarks publicados. La licencia "other" y el formato de checkpoint personalizado limitan su uso directo en stacks estándar. No se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Proyecto experimental: el autor lo etiqueta como "experimental" y no hay evidencia de validación externa ni de uso en producción.
- Sin benchmarks: no se han publicado métricas de calidad, por lo que no se puede evaluar su rendimiento real en tareas de lenguaje.
- Licencia "other" no especificada: el término "other" en Hugging Face implica que el autor no ha seleccionado una licencia estándar; el uso comercial y la redistribución son inciertos y requieren consultar al autor.
- Formato propietario: no es un directorio de `transformers`, por lo que no se puede cargar con `AutoModelForCausalLM`. Requiere el loader específico, lo que dificulta la integración en pipelines existentes.
- Riesgo de alucinación y sesgos: al ser un modelo pequeño entrenado por destilación, es probable que presente alucinaciones frecuentes y sesgos heredados del padre, aunque no hay datos para confirmarlo.
- Contexto limitado: no se especifica la longitud de contexto; el ALiBi con escala 0.0 sugiere que la extrapolación posicional puede ser limitada.
- Sin soporte de cuantización: no se ofrecen versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos con restricciones de memoria.
- El artefacto es un punto en el tiempo: el estudiante se congeló en el paso 2.560.770 del padre; no hay garantía de que versiones futuras mantengan compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MarxistLeninist/AGILLM-4.4
- Discusiones del modelo: https://huggingface.co/MarxistLeninist/AGILLM-4.4/discussions
- Repositorio AGILLM4.1 (GitHub): https://github.com/Marxist-Leninist/AGILLM4.1
- Repositorio AGILLM4.2 (GitHub): https://github.com/Marxist-Leninist/AGILLM4.2
- Paper de referencia (Matryoshka Language Model Suites): https://arxiv.org/abs/2608.09703
