# jaisidhsingh/SignedKDA-gdn-neg-eigval

## Resumen

El modelo `jaisidhsingh/SignedKDA-gdn-neg-eigval` es un artefacto de investigación creado por Jaisidh Singh, estudiante de máster en aprendizaje automático en la Universidad de Tübingen e investigador invitado en el Max Planck Institute for Intelligent Systems de Tübingen. Forma parte de la colección OpenThesis, que reúne los artefactos generados durante su tesis de máster realizada en colaboración con OpenEuroLLM. El nombre del modelo sugiere una arquitectura basada en Gated DeltaNet con un mecanismo de aproximación de kernel con signo y manejo de autovalores negativos, dentro del ámbito de los modelos de estado y atención lineal.

Se trata de un modelo pequeño de 342 millones de parámetros, con pesos en formato safetensors, que implementa una arquitectura de atención lineal con código personalizado (etiqueta `custom_code`). Su relevancia radica en que explora alternativas híbridas a la atención softmax tradicional, en la línea de DeltaNet y otros modelos de estado, con un enfoque en el estudio del escalado de modelos de lenguaje con atención híbrida. Es un modelo experimental pensado para investigación, no para despliegue en producción. La documentación disponible es mínima: no se especifica licencia, idiomas soportados, ni datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet con variante SignedKDA (atención lineal con kernel signado y autovalores negativos) |
| Parámetros totales | 342.328.480 |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo solo contiene safetensors en fp32) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura basada en Gated DeltaNet, una variante de atención lineal que actualiza el estado de memoria mediante una regla delta con puertas (gating). El nombre "SignedKDA" sugiere el uso de una aproximación de kernel con signo (signed kernel density approximation) y la parte "neg-eigval" indica un tratamiento específico de los autovalores negativos en la matriz de pesos de recurrencia, un problema conocido en modelos de estado tipo linear attention cuando la matriz de transición no es diagonalizable.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. Dado que el autor trabaja en el estudio del escalado de LLM con atención híbrida y que el repositorio asociado (`complex-kda`) implementa bloques eficientes para atención lineal, atención dispersa, modelos de espacio de estados y arquitecturas híbridas, es plausible que el entrenamiento se haya realizado con un dataset académico estándar (por ejemplo, SlimPajama o RedPajama), pero no se puede confirmar con la información disponible.

## Capacidades

- Generación de texto autoregresiva: el modelo es un decoder transformer con atención lineal, por lo que puede generar texto token a token.
- Atención de contexto largo: la arquitectura DeltaNet permite procesar secuencias largas con coste lineal en lugar de cuadrático, lo que facilita ventanas de contexto extensas (aunque el valor exacto no se ha publicado).
- Investigación en arquitecturas híbridas: el modelo sirve como banco de pruebas para estudiar el comportamiento de capas DeltaNet con gating y autovalores negativos.
- Compatibilidad con `custom_code`: requiere cargar el código personalizado desde el repositorio para su uso con `transformers` o `accelerate`.
- Capacidades multilingües: no disponibles.
- Tool calling / function calling: no disponible.
- Modo agente o razonamiento multi-paso: no disponible.

## Casos de uso

- Investigación académica en arquitecturas de atención lineal: el modelo sirve para estudiar el comportamiento de Gated DeltaNet en tareas de modelado de lenguaje, comparando con baselines de atención softmax del mismo tamaño.
- Validación de técnicas de estabilidad numérica: el sufijo "neg-eigval" indica que el modelo prueba métodos para manejar autovalores negativos en la matriz de recurrencia, útil para investigar la convergencia de modelos de estado.
- Punto de partida para fine-tuning experimental: con solo 342M parámetros, puede ajustarse en una GPU de gama media para experimentos de adaptación a dominios específicos.
- Evaluación de escalado en modelos híbridos: forma parte de la tesis sobre escalado de LLM con atención híbrida, por lo que se puede usar para replicar resultados de la tesis y comparar con modelos puramente softmax.
- Benchmark de eficiencia en hardware: al ser un modelo pequeño, sirve para medir throughput y latencia de kernels de atención lineal en distintas GPUs.
- Docencia en arquitecturas de modelos de lenguaje: útil como ejemplo práctico de una arquitectura alternativa a la atención softmax en cursos de aprendizaje profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones estándar. El modelo es un artefacto de investigación sin evaluación documentada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 342M parámetros, lo que ocupa aproximadamente 1,4 GB en fp32. En fp16 ocuparía unos 700 MB, y en cuantización de 8 bits (si se generaran los pesos) unos 350 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para inferencia en fp16 (por ejemplo, RTX 3050, RTX 3060, RTX 4060, etc.).
- Entrenamiento o fine-tuning: se recomienda al menos una GPU con 8-12 GB de VRAM (RTX 3070/3080, A10, L4) para fine-tuning con batch pequeño.
- Opciones de despliegue: al requerir código personalizado, no es compatible directamente con vLLM, llama.cpp u Ollama sin adaptación del código de la arquitectura. Se puede usar con Hugging Face `transformers` cargando el `trust_remote_code=True`.
- Latencia y throughput: no disponibles. Al ser un modelo de atención lineal, se espera que el coste por token sea constante en la longitud de secuencia, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| SignedKDA-gdn-neg-eigval | 342M | Gated DeltaNet | no disponible | no disponible |
| DeltaNet (original, 2024) | 1.3B | DeltaNet lineal | 4K | MIT |
| Mamba-370M | 370M | SSM (state space) | 4K | Apache 2.0 |
| RWKV-5 (World, 430M) | 430M | RWKV (RNN) | 8K | Apache 2.0 |

No se dispone de datos de rendimiento comparables porque no hay benchmarks publicados para este modelo. La comparación es estructural: frente a Mamba y RWKV, que también evitan la atención cuadrática, DeltaNet ofrece una regla de actualización delta que puede almacenar más información por paso. Sin embargo, el modelo aquí no tiene documentación de rendimiento.

## Limitaciones y advertencias

- Modelo de investigación: no ha sido evaluado ni validado para uso en producción; puede presentar fallos de generación o comportamientos inesperados.
- Sin licencia especificada: no se puede determinar si su uso comercial está permitido; se debe contactar con el autor antes de cualquier uso comercial.
- Sin datos de entrenamiento: no se sabe qué corpus se usó, por lo que es imposible evaluar sesgos o riesgos de contenido dañino.
- Riesgo de alucinación: como modelo de lenguaje sin evaluación, puede generar contenido falso o incoherente.
- Dependencia de código personalizado: la arquitectura requiere cargar código del repo de Hugging Face, lo que implica riesgos de seguridad al ejecutar código remoto (se recomienda revisar el código antes de cargarlo).
- Sin soporte de herramientas de despliegue estándar: no funciona con vLLM, llama.cpp u Ollama sin adaptaciones.
- Documentación muy limitada: no hay paper, README ni guía de uso en el repositorio, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jaisidhsingh/SignedKDA-gdn-neg-eigval
- Colección OpenThesis: https://huggingface.co/collections/jaisidhsingh/openthesis
- Repositorio GitHub del autor: https://github.com/jaisidhsingh/
- Repositorio complejo-kda: https://github.com/jaisidhsingh/complex-kda
- Página personal del autor: https://jaisidhsingh.github.io/
- Currículum del autor: https://jaisidhsingh.github.io/assets/pdf/jaisidh_resume_web.pdf
