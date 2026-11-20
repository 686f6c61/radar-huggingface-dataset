# mradermacher/Yoshino2-1B-i1-GGUF

## Resumen

Yoshino2-1B-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix, del modelo Yoshino2-1B desarrollado por el usuario en5yme. El modelo base es un transformer denso de aproximadamente 1.080 millones de parámetros (1,08 B reales según los safetensors del repositorio original), entrenado mediante destilación a partir de Nemotron-3.5-Lightning-30B-A3B-Distill, un modelo MoE de 30 B del ecosistema Nemotron. El resultado es un modelo pequeño orientado a razonamiento y conversación, con licencia MIT, pensado para ejecutarse en hardware muy modesto.

El trabajo de mradermacher consiste exclusivamente en la cuantización: no modifica los pesos más allá de la compresión, y ofrece tanto cuantizaciones estáticas (en el repo hermano Yoshino2-1B-GGUF) como cuantizaciones con matriz de importancia (imatrix, sufijo i1) en este repositorio. La gama cubre desde IQ1_S (0,5 GB, para casos extremos) hasta Q6_K (1,0 GB, prácticamente sin pérdida perceptible), lo que permite desplegar el modelo desde dispositivos con muy poca memoria hasta equipos de escritorio convencionales.

Su relevancia actual reside en la combinación de tres factores: un tamaño de 1 B que cabe en cualquier GPU de consumo e incluso en CPU, una licencia MIT sin restricciones para uso comercial y un origen de destilación de un modelo de razonamiento de mayor escala. Es, por tanto, un candidato útil para prototipado rápido, entornos con recursos limitados y aplicaciones de razonamiento ligero donde no se justifica un modelo de 7 B o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado por destilación de Nemotron-3.5-Lightning-30B-A3B-Distill); detalles internos de capas y atención no disponibles |
| Parametros totales | 1.080.632.832 (1,08 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas con imatrix) |
| Idiomas soportados | Inglés (etiqueta `language: en` en la model card); resto no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); pesos originales del modelo base en safetensors |
| Tamano del repositorio | 13,8 GB (incluye todas las variantes de cuantización) |
| Tamano por cuantización | De 0,5 GB (IQ1/IQ2) a 1,0 GB (Q6_K) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Yoshino2-1B (número de capas, dimensión oculta, mecanismo de atención, tipo de tokenizador). Lo que sí se conoce es que se trata de un transformer denso de 1,08 B de parámetros obtenido por destilación de Nemotron-3.5-Lightning-30B-A3B-Distill, un modelo MoE de 30 B con aproximadamente 3 B de parámetros activos. La destilación se realizó sobre el dataset en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill, lo que sugiere que el modelo hereda parte del comportamiento de razonamiento del profesor, aunque a una escala mucho menor.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de fases de RLHF o DPO, ni sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Las etiquetas del repositorio incluyen `distillation`, `reasoning` y `conversational`, lo que confirma la orientación del modelo hacia tareas de razonamiento y diálogo. Las cuantizaciones de este repositorio emplean matrices de importancia (imatrix) calculadas sobre el propio modelo, lo que mejora la fidelidad de las variantes de baja precisión (IQ1 a IQ4) respecto a las cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y entrenado sobre un dataset de destilación orientado a diálogo.
- Razonamiento: la etiqueta `reasoning` y el origen en un modelo de la familia Nemotron indican capacidades de razonamiento de cadena, aunque a escala de 1 B.
- Destilación de conocimiento: al derivar de un MoE de 30 B, puede reproducir parte de los patrones de respuesta del profesor en tareas de conocimiento general.
- Soporte multilingüe: limitado al inglés según la model card; no hay evidencia de soporte para castellano u otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente; el tamaño de 1 B limita la fiabilidad en cadenas largas de razonamiento.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: con cuantizaciones de 0,5-0,8 GB, el modelo puede cargarse en minutos en un portátil y servir para validar prompts, flujos de diálogo y formatos de respuesta antes de migrar a un modelo mayor.
- Despliegue en dispositivos de borde: la variante Q4_K_M (0,8 GB) cabe en Raspberry Pi 5 con 8 GB de RAM o en mini-PC con CPU moderna, permitiendo asistentes locales sin conexión a internet.
- Generación de texto en aplicaciones con restricciones de memoria: en entornos donde una GPU de 4 GB es el máximo disponible, la cuantización IQ4_XS (0,7 GB) deja margen para el contexto y el runtime de llama.cpp.
- Filtrado y clasificación de texto ligera: tareas de etiquetado, resumen corto o extracción de entidades donde la latencia importa más que la profundidad de razonamiento, aprovechando el bajo coste por token de un modelo de 1 B.
- Educación y experimentación con destilación: útil como caso de estudio de cómo un modelo de 30 B MoE puede comprimirse a 1 B denso y seguir siendo funcional, para cursos o investigaciones sobre eficiencia.
- Chatbots embebidos en herramientas de desarrollo: integración vía Ollama o llama.cpp en plugins de editores o CLIs, donde un modelo pequeño evita depender de APIs externas y mantiene la privacidad del código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos. Tampoco se dispone de datos de perplejidad por cuantización más allá de la referencia genérica a la gráfica de ikawrakow sobre calidad de cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (IQ1_S) y 1,0 GB (Q6_K) solo para los pesos; añadir aproximadamente 0,5-2 GB para el contexto y el runtime de llama.cpp según la longitud de secuencia.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; RTX 3050, RTX 4060, GTX 1650 o incluso iGPU con memoria compartida pueden ejecutar las variantes Q4.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas e incluso en muchas integradas; también en CPU con 4-8 GB de RAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), LM Studio, text-generation-webui, koboldcpp. vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; en la práctica, un modelo de 1 B cuantizado a Q4 suele superar las decenas de tokens por segundo en CPU moderna y cientos en GPU de consumo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Yoshino2-1B-i1-GGUF | 1,08 B | No disponible | MIT | GGUF (i1) | Destilado de Nemotron-3.5-Lightning-30B-A3B |
| Yoshino2-1B-GGUF (estático) | 1,08 B | No disponible | MIT | GGUF (estático) | Mismo modelo base, cuantizaciones sin imatrix |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 K | Apache 2.0 | safetensors, GGUF | Referencia habitual en la categoría de 1-2 B; contexto documentado |
| Llama 3.2 1B Instruct | 1,24 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Contexto largo y ecosistema amplio; licencia con restricciones |

La comparación con Qwen2.5-1.5B y Llama 3.2 1B es pertinente por tamaño y orientación conversacional, pero no se dispone de benchmarks del Yoshino2-1B que permitan una comparación numérica de rendimiento. La ventaja principal del Yoshino2-1B frente a ambos es la licencia MIT sin restricciones, frente a la licencia comunitaria de Llama 3.2.

## Limitaciones y advertencias

- Idiomas: la model card solo declara inglés; el rendimiento en castellano es desconocido y probablemente deficiente.
- Contexto: no se ha documentado la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Alucinación: un modelo de 1 B destilado de un MoE de 30 B tiende a reproducir con menor fidelidad los razonamientos del profesor; es esperable una tasa de alucinación superior a la de modelos de 7 B o más.
- Razonamiento multi-paso: la capacidad de cadena de pensamiento fiable es limitada a esta escala; no se recomienda para tareas de matemáticas o lógica complejas sin verificación externa.
- Cuantizaciones extremas: las variantes IQ1 e IQ2 (0,5 GB) degradan notablemente la calidad; la propia model card las describe como "for the desperate" o "mostly desperate".
- Licencia: MIT permite uso comercial sin restricciones, pero el modelo base podría heredar obligaciones de sus datos de entrenamiento; no se documenta la procedencia completa del dataset de destilación.
- Producción: al no haber benchmarks ni documentación de contexto, no se recomienda su uso en producción sin una evaluación propia previa sobre el dominio objetivo.
- Repositorio: 13,8 GB de tamaño total; conviene descargar solo la cuantización necesaria en lugar de clonar el repositorio completo.

## Enlaces

- Repositorio Hugging Face de las cuantizaciones i1: https://huggingface.co/mradermacher/Yoshino2-1B-i1-GGUF
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Yoshino2-1B-GGUF
- Modelo base: https://huggingface.co/en5yme/Yoshino2-1B
- Dataset de destilación: https://huggingface.co/datasets/en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill
- Página de descargas del autor: https://hf.tst.eu/model#Yoshino2-1B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
