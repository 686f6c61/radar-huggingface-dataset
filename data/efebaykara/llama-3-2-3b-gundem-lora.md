# efebaykara/Llama-3.2-3B-Gundem-LoRA

## Resumen

Llama-3.2-3B-Gundem-LoRA es un adaptador LoRA entrenado por efebaykara sobre meta-llama/Llama-3.2-3B para la clasificación de titulares de noticias en turco (gündem). No es un checkpoint completo ni un asistente conversacional general: se trata de un artefacto PEFT que requiere cargar el modelo base en una revisión concreta (revision `13afe5124825b4f3751f836b40dafda64c1ed062`) para funcionar.

El modelo resuelve un problema muy específico: dado un titular de prensa en turco, genera un análisis estructurado con campos etiquetados (`etiketler` para temas, `tur` para el tipo de evento y las puntuaciones enteras `etki`, `ciddiyet` y `aciliyet` en el rango 0–3). El entrenamiento se realizó mediante destilación de respuestas (response distillation), utilizando respuestas generadas por DeepSeek como etiquetas de supervisión solo para el asistente, sin emplear pesos ni logits del modelo profesor.

Su relevancia es nicho pero clara: ofrece un pipeline reproducible de clasificación de titulares turcos con métricas publicadas (micro-F1 de temas del 91,9 %), un script de inferencia listo para usar y una licencia heredada de Llama 3.2. Es útil para desarrolladores que necesiten etiquetado automático de noticias turcas sin desplegar un LLM de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder Llama 3.2 |
| Parametros totales | Heredados del modelo base (Llama 3.2 3B); el adaptador no modifica el recuento |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens (max_length de entrenamiento); contexto nativo del base no indicado en la ficha |
| Tipos de cuantizacion | fp32 para fusión del adaptador en CPU; BF16 para inferencia en CUDA |
| Idiomas soportados | Turco (tr) |
| Licencia | Llama 3.2 Community License (código auxiliar Gündem: MIT) |
| Formato de pesos | safetensors (adaptador, ~0,1 GB el repositorio) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA con rango 16 y alpha 32 aplicado sobre meta-llama/Llama-3.2-3B. El entrenamiento empleó destilación de respuestas: las respuestas generadas por DeepSeek se usaron como objetivo de supervisión solo para los turnos del asistente, sin acceso a pesos ni logits del profesor, por lo que el número de parámetros del estudiante permanece invariable.

El conjunto de datos es pequeño y específico del dominio: 825 ejemplos de entrenamiento, 107 de validación y 101 de test, con titulares de noticias turcas. Se entrenó durante 3 épocas con learning rate 0,0002, acumulación de gradientes de 8, max_length de 512 y semilla 42. Los titulares crudos, las respuestas del profesor y el dataset completo no se redistribuyen. El loader incluido gestiona la compatibilidad de arquitectura, la plantilla exacta de la tarea, la revisión fijada del modelo base, la fusión del adaptador en fp32 en CPU y la inferencia BF16 en CUDA.

## Capacidades

- Clasificación de titulares de noticias en turco con salida estructurada: temas (`etiketler`), tipo de evento (`tur`).
- Puntuación numérica de cada titular en tres dimensiones: impacto (`etki`), gravedad (`ciddiyet`) y urgencia (`aciliyet`), enteros de 0 a 3.
- Generación de texto condicionada por un prompt de sistema fijo (`student-system.txt`); solo recibe el titular y ese prompt.
- No es un asistente conversacional general ni un modelo standalone: requiere el modelo base fijado a una revisión concreta.
- La salida no está restringida por una gramática JSON; el resultado contiene `prediction` o un campo `error` explícito.
- No soporta (según la ficha): visión, audio, tool calling ni modos de razonamiento extendido; no disponible información al respecto.

## Casos de uso

- Monitoreo automatizado de agenda noticiosa turca: un medio o analista puede procesar flujos de titulares y extraer temas, tipo de evento y puntuaciones de impacto, gravedad y urgencia sin revisión manual.
- Filtrado y priorización de noticias: las puntuaciones `aciliyet` y `ciddiyet` (0–3) permiten ordenar titulares por urgencia en un panel de redacción o sala de crisis.
- Construcción de datasets etiquetados: el modelo puede preetiquetar grandes volúmenes de titulares turcos que luego se validan manualmente, reduciendo el coste de anotación.
- Clasificación temática en agregadores de noticias: la alta micro-F1 en temas (91,9 %) lo hace adecuado para enrutar titulares a categorías o secciones automáticamente.
- Integración en pipelines ETL de análisis de medios: el script `release_infer.py` y el formato de salida estructurado facilitan su uso en flujos por lotes sobre titulares entrantes.
- Investigación en destilación de respuestas: al ser un ejemplo documentado de destilación desde DeepSeek hacia un modelo pequeño con métricas publicadas, sirve como referencia reproducible para estudios de la técnica.
- Detección de eventos laborales o sociales: el ejemplo de la ficha (una huelga por subida salarial) ilustra su utilidad para detectar y puntuar acontecimientos de tipo social o político.

## Benchmarks y rendimiento

Resultados publicados por el autor (test de 101 ejemplos, BF16 en CUDA, decodificación greedy, batch 4, máximo 160 tokens nuevos, sin gramática JSON):

| Métrica | Valor |
|---|---|
| Gündem Score v1 | 82,1 / 100 |
| All-field exact match | 43,6 % |
| Topic micro-F1 | 91,9 % |
| Type accuracy | 89,1 % |
| Invalid outputs | 0 / 101 |

El autor advierte que el Gündem Score mide la concordancia con las etiquetas del profesor en esta tarea concreta, no inteligencia general del LLM ni un porcentaje de acierto, y que diferencias pequeñas en un test de semilla única no establecen superioridad.

## Requisitos de hardware

- El repositorio del adaptador ocupa ~0,1 GB, pero la inferencia requiere cargar el modelo base completo (Llama 3.2 3B): RAM de CPU para el modelo fp32 completo durante la fusión del adaptador y VRAM de GPU para la inferencia BF16 (del orden de ~7–8 GB para el modelo de 3B en BF16; estimación, no dato de la ficha).
- GPU recomendada: cualquier GPU CUDA con suficiente VRAM para un modelo de 3B en BF16 (por ejemplo, una RTX 3060 de 12 GB o superior sería suficiente; la ficha no especifica modelos concretos).
- Cabe en GPUs de consumo de gama media-alta dado el tamaño de 3B del modelo base.
- Despliegue: el autor proporciona `release_infer.py` con PyTorch + CUDA y un `requirements.txt` incluido. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI; como adaptador PEFT en safetensors, es compatible en principio con la librería `peft` de Hugging Face.
- Latencia y throughput: no disponible (solo se documenta el protocolo de evaluación: greedy, batch 4, máximo 160 tokens nuevos).
- Nota de seguridad: cargar el modelo base ejecuta su código remoto; el autor recomienda revisarlo antes de su uso.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.2-3B-Gundem-LoRA | Adaptador LoRA sobre Llama 3.2 3B | Clasificación de titulares turcos | Turco | Llama 3.2 Community | Micro-F1 temas 91,9 %; salida estructurada específica |
| meta-llama/Llama-3.2-3B | Modelo base standalone | Uso general | Multilingüe (incluye turco) | Llama 3.2 Community | Sin afinado para esta tarea; sirve de base obligatoria |
| Adaptadores LoRA genéricos para turco en HF | Adaptadores PEFT | Variadas | Turco | Variable | no disponible: no hay datos comparativos publicados en la información proporcionada |

No se han publicado comparaciones directas con otros modelos de clasificación de titulares turcos en la información disponible.

## Limitaciones y advertencias

- Dominio muy estrecho: entrenado con solo 825 ejemplos de una tarea específica; el autor recomienda inspeccionar las predicciones antes de confiar en ellas.
- No es un asistente general: solo recibe el titular y un prompt de sistema fijo; cualquier otro uso está fuera de distribución.
- La salida no está restringida por gramática JSON: aunque el test registró 0 salidas inválidas de 101, no hay garantía formal de formato válido en producción.
- Riesgo de heredar sesgos del modelo base (Llama 3.2) y de las etiquetas generadas por DeepSeek (posibles alucinaciones o errores del profesor transferidos al estudiante); no se documentan auditorías de sesgo.
- Métricas de un solo test, de semilla única y sobre un dataset pequeño: cambios en batch size o en el entorno numérico de ejecución pueden alterar las salidas.
- Requiere aceptar los términos de Meta para acceder al modelo base y cumplir la Llama 3.2 Community License (con restricciones de uso comercial propias de esa licencia, como el límite de 700 millones de usuarios mensuales para despliegues y la obligación de la atribución "Built with Llama"); el código auxiliar Gündem es MIT, pero la licencia del modelo es distinta.
- Cargar el modelo base ejecuta código remoto de Hugging Face: revisarlo antes de usarlo en entornos sensibles.
- El dataset completo, los titulares crudos y las respuestas del profesor no se redistribuyen, lo que dificulta la reproducción total del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efebaykara/Llama-3.2-3B-Gundem-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Herramientas de entrenamiento y benchmark (GitHub): https://github.com/efebaykaraa/Gundem
- Todos los modelos publicados del autor: https://github.com/efebaykaraa/Gundem/releases/tag/models-v1.0.0
