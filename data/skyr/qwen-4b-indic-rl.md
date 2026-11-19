# SkyR/qwen-4b-Indic-RL

## Resumen

SkyR/qwen-4b-Indic-RL es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario SkyR, orientado a la paráfrasis en lenguas índicas. Según la model card, el entrenamiento se realizó mediante GRPO (Group Relative Policy Optimization) sobre pares de paráfrasis en hindi, bengalí y telugu, con una transferencia declarada "decente" a familias lingüísticas relacionadas con esas tres lenguas. El modelo conserva la arquitectura y el tamaño del modelo base: 4.022.468.096 parámetros (aproximadamente 4B) en formato safetensors.

El interés del modelo radica en su especialización: parte de un instructivo moderno de Qwen3 y aplica refuerzo con GRPO para una tarea concreta (paráfrasis) en tres idiomas con recursos limitados. No obstante, la información pública es muy escasa: no hay pipeline declarado, no se especifica licencia, no hay métricas de benchmarks y el repositorio no registra descargas ni likes en el momento de la consulta. La fecha de creación indicada (2026-11-19) es posterior a la fecha actual, lo que conviene tratar como dato a verificar.

Se trata, por tanto, de un modelo experimental de nicho, útil para quien necesite generación de paráfrasis en hindi, bengalí o telugu y quiera evaluar el efecto del RL sobre un instructivo de 4B. Para producción generalista, el modelo base Qwen3-4B-Instruct-2507 sigue siendo la referencia más documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507; detalles no disponibles) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE según el tamaño declarado) |
| Longitud de contexto | no disponible (heredada del modelo base; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | hindi (hi), telugu (te), bengalí (bn); transferencia declarada a familias relacionadas |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamaño del repositorio | 8,1 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4B parámetros. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, uso de atención lineal o híbrida), por lo que estos datos deben consultarse en la documentación del modelo base. Tampoco se especifica la longitud de contexto efectiva tras el ajuste.

El entrenamiento se realizó mediante GRPO, un algoritmo de optimización por política relativa de grupo que se usa habitualmente para reforzar comportamientos a partir de recompensas comparativas entre muestras generadas. Según el autor, el ajuste se centró en paráfrasis en hindi, bengalí y telugu, con transferencia "decente" a familias lingüísticas relacionadas. No se indica el volumen de datos de entrenamiento, la composición del dataset, la función de recompensa empleada, ni si hubo fases adicionales de SFT o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las propias del modelo base.

## Capacidades

- Generación de texto y paráfrasis en hindi, bengalí y telugu, que es la tarea objetivo del ajuste.
- Transferencia declarada a familias lingüísticas relacionadas con esas tres lenguas, aunque sin métricas que la cuantifiquen.
- Razonamiento e instrucciones generales heredados de Qwen3-4B-Instruct-2507 (no verificados específicamente tras el ajuste).
- Generación de código y matemáticas: capacidad heredada del modelo base, no evaluada en esta ficha.
- Tool calling / function calling: no confirmado para este ajuste; el modelo base Qwen3 lo soporta, pero el RL sobre paráfrasis podría haber alterado el comportamiento.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: limitadas a los tres idiomas declarados más lo que conserve del modelo base.
- Modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Paráfrasis de textos en hindi, bengalí y telugu: el caso de uso central. Se usaría para reescribir frases manteniendo el significado, por ejemplo para enriquecer datasets de entrenamiento o para variar titulares y descripciones.
- Aumento de datos (data augmentation) para modelos de NLP índicos: generar variantes parafraseadas de corpus existentes para ampliar la cobertura léxica y sintáctica antes de entrenar clasificadores o modelos de traducción.
- Normalización de consultas en motores de búsqueda índicos: reescribir consultas de usuario para mejorar la recuperación cuando hay variaciones de formulación.
- Generación de variantes de contenido editorial: producir distintas redacciones de un mismo mensaje para campañas o publicaciones en hindi, bengalí o telugu.
- Evaluación de robustez frente a reformulaciones: usar el modelo para crear paráfrasis controladas con las que probar si otros sistemas (clasificadores, RAG) mantienen su rendimiento.
- Investigación sobre RL con GRPO en lenguas de bajos recursos: el modelo sirve como caso de estudio de cómo el refuerzo afecta a un instructivo de 4B en tareas lingüísticas específicas.
- Preprocesado en pipelines de traducción: parafrasear el texto de origen antes de traducir para reducir ambigüedades o adaptar el registro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 8-9 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB para comodidad.
- Cuantización a 8 bits: aproximadamente 4-5 GB de pesos; a 4 bits, en torno a 2,5-3 GB. Estas cuantizaciones no las publica el autor y habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue en servidor; RTX 4090 o RTX 3090 para inferencia local en FP16.
- GPU de consumo: cabe en tarjetas con 12 GB o más en FP16; en 8 bits o 4 bits puede ejecutarse en GPUs de 8 GB o incluso en algunas de 6 GB con cuantización agresiva.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se conviertan los pesos a los formatos correspondientes (GGUF para llama.cpp/Ollama). No hay artefactos de despliegue publicados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SkyR/qwen-4b-Indic-RL | 4,02B | no disponible | hi, te, bn | no disponible | Ajuste GRPO para paráfrasis índica |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | no disponible en esta ficha | multilingüe | no disponible en esta ficha | Modelo base; referencia generalista |
| Otros ajustes índicos de 4B | no disponible | no disponible | variable | variable | No se dispone de comparativas publicadas en la información consultada |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks del ajuste ni una selección documentada de modelos competidores en la misma tarea.

## Limitaciones y advertencias

- Información pública muy escasa: sin licencia, sin pipeline, sin métricas y sin descripción del dataset de entrenamiento.
- Riesgo de alucinación inherente a los modelos generativos de 4B; el ajuste por RL sobre paráfrasis no garantiza fidelidad semántica en todos los casos.
- La transferencia a "familias relacionadas" es una afirmación del autor sin cuantificar; puede degradarse fuera de hindi, bengalí y telugu.
- El ajuste con GRPO puede haber alterado comportamientos del modelo base (tool calling, instrucciones generales, formato de salida) que no se documentan.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución. Conviene verificar la licencia del modelo base Qwen3-4B-Instruct-2507 antes de cualquier uso en producción.
- Sesgos: no documentados; los modelos índicos pueden reflejar sesgos de los corpus de entrenamiento del modelo base y del dataset de paráfrasis.
- Fecha de creación anómala (2026-11-19): verificar la procedencia y autenticidad del repositorio antes de usarlo.
- Sin descargas ni likes registrados: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkyR/qwen-4b-Indic-RL
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper de GRPO (referencia general, no específica del modelo): no disponible en la información proporcionada
- Blog o demo del autor: no disponible
- Repositorio de código: no disponible
