# bigai/GS1-4B

## Resumen

GS1-4B es un modelo de decisión de tipo nativo desarrollado por BIGAI (Beijing Institute for General Artificial Intelligence). No es un modelo generativo al uso: en lugar de producir texto token a token, calcula distribuciones de probabilidad nativas sobre candidatos definidos en tiempo de ejecución, lo que lo hace adecuado para tareas de enrutamiento de agentes, verificación, extracción y control. Con 4.704.520.192 parámetros almacenados, se construye sobre el backbone híbrido de Qwen/Qwen3.5-4B y añade una cabeza de decisión de atención cruzada multi-cabeza.

La propuesta diferencial es la eficiencia: al no generar tokens de salida, el modelo produce directamente distribuciones Choice, Noul y Score con un coste de latencia muy bajo. Según la model card, con CUDA Graph alcanza 35,17 ms P50 para una pregunta corta y un speedup de 2,35× frente a la inferencia por defecto para ocho preguntas cortas. Emplea una arquitectura híbrida que intercala capas causales Gated DeltaNet con capas de atención completa segmentada bidireccional.

El modelo se distribuye bajo licencia Apache 2.0 y está pensado para integrarse en pipelines de agentes donde se necesita una decisión tipada, calibrada y con capacidad explícita de abstención. Su relevancia actual radica en que ofrece una alternativa a los LLM generativos para subtareas de decisión, con una huella de parámetros moderada y una latencia compatible con bucles de agente en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet causal + atención completa segmentada bidireccional, con cabeza de decisión de atención cruzada multi-cabeza |
| Parametros totales | 4.704.520.192 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 65.536 tokens de longitud máxima de rama completa |
| Tipos de cuantizacion | no disponible (pesos almacenados en FP32 para texto y cabeza de decisión; torre de visión retenida en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GS1-4B utiliza un backbone híbrido Qwen3.5 que intercala tres capas causales Gated DeltaNet con una capa de atención completa segmentada. La dimensión oculta es de 2.560, con 32 capas de decodificador, 10 cabezas de atención de decisión, 2 capas de enrutamiento de candidatos y una dimensión de proyección de decisión de 256. La atención completa segmentada bidireccional proporciona a los candidatos su contexto completo de comparación, preservando prefijos inmutables reutilizables entre preguntas. El mecanismo de Attention Residual con preservación de carry permite a los receptores de atención completa dispersa consultar representaciones anteriores manteniendo el ancla explícita de conexión residual.

El entrenamiento se basa en aprendizaje por refuerzo multi-paso con recompensas calibradas (Brier reward), optimizando las probabilidades de acción muestreadas mediante el procedimiento RLCD documentado por el autor. La cabeza de decisión nativa consulta la evidencia de estado usando representaciones de pregunta y candidato. Los pesos de texto y de la cabeza de decisión se almacenan en FP32, mientras que la torre de visión retenida se guarda en BF16. La inferencia soporta cómputo BF16 con logits finales y reducciones de probabilidad en FP32.

## Capacidades

- Decisión tipada nativa con tres primitivas: Choice (enrutamiento, clasificación, selección de herramienta), Noul (verificación y juicios binarios) y Score (valoraciones ordenadas y juicios por rúbrica).
- Producción de distribuciones de probabilidad completas sobre candidatos, con ID de candidato, probabilidades y confianza.
- Capacidad de abstención explícita y aplazamiento de decisión basada en probabilidades nativas y confianza calibrada.
- Enrutamiento de agentes y selección de herramientas (tool selection) sin generación de tokens.
- Verificación de proposiciones y juicios binarios con probabilidad p(true).
- Extracción y clasificación sobre conjuntos de candidatos definidos en tiempo de ejecución.
- Soporte de contexto largo de hasta 65.536 tokens por rama completa.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión: la model card menciona una torre de visión retenida en BF16, pero no se detallan sus funciones.

## Casos de uso

- Enrutamiento de agentes en producción: el modelo selecciona la herramienta o el subagente adecuado entre un conjunto de candidatos definido en tiempo de ejecución, devolviendo probabilidades y confianza para implementar umbrales de derivación. Su latencia de 35,17 ms P50 con CUDA Graph lo hace viable en bucles de agente interactivos.
- Verificación de respuestas y guardarraíles: mediante la primitiva Noul, evalúa la probabilidad de que una proposición sea verdadera, lo que permite filtrar salidas de otros modelos o validar pasos intermedios en pipelines multi-etapa.
- Clasificación de tickets y correos: con la primitiva Choice sobre un conjunto cerrado de categorías, obtiene distribuciones calibradas que permiten enrutar a colas humanas cuando la confianza es baja, con la posibilidad de abstención explícita.
- Selección de herramientas en asistentes conversacionales: dado un catálogo de funciones y el estado de la conversación, el modelo puntúa cada candidato y devuelve la herramienta más probable junto con la distribución completa para lógica de fallback.
- Extracción de campos estructurados: con Score y Choice sobre candidatos predefinidos, clasifica valores extraídos de documentos o formularios, con niveles de confianza por campo que facilitan la revisión humana selectiva.
- Evaluación por rúbrica de contenido generado: la primitiva Score produce una valoración ordenada con probabilidades por nivel, útil para sistemas de control de calidad o ranking de respuestas en pipelines de evaluación automática.
- Control y toma de decisiones en sistemas de automatización: el modelo puede integrarse en simuladores o entornos de control (la model card cita un simulador de electrodomésticos) para elegir acciones entre alternativas con probabilidades calibradas.

## Benchmarks y rendimiento

Resultados del Decision Index (edición 0.3, suite pública completa: 140.178 peticiones, 312.320 decisiones, 43 benchmarks de texto, cobertura del 100%):

| Métrica | GS1-0.8B | GS1-2B | GS1-4B | GS1-9B |
|---|---:|---:|---:|---:|
| Public index ↑ | 56,12 | 62,22 | 68,97 | 70,45 |
| Raw index ↑ | 67,36 | 71,70 | 76,47 | 77,46 |
| Coverage | 100% | 100% | 100% | 100% |

Puntuaciones por área (escala 0-100 corregida por azar):

| Área | GS1-0.8B | GS1-2B | GS1-4B | GS1-9B |
|---|---:|---:|---:|---:|
| Knowledge & Reasoning | 33,32 | 41,84 | 52,40 | 56,01 |
| Language Understanding | 56,25 | 63,67 | 71,12 | 72,62 |
| Retrieval & Classification | 68,62 | 71,21 | 75,55 | 75,58 |
| Tools & Automation | 79,26 | 83,57 | 87,49 | 87,61 |
| Arts & Human Taste | 47,47 | 54,16 | 59,26 | 60,57 |

Resultados por benchmark (selección de los publicados en la model card):

| Benchmark | Métrica nativa | GS1-4B |
|---|---|---:|
| BFCL | case exact accuracy | 97,52 |
| ToolRet | nDCG@10 | 71,16 |
| API-Bank | accuracy | 84,45 |
| BANKING77 | macro-F1 | 92,09 |
| CLINC150+OOS | macro-F1 | 94,35 |
| RouterBench † | selected quality | 79,06 |
| Simulador de electrodomésticos | case exact accuracy | 100,00 |
| SGD/SGD-X † | macro-F1 | 68,10 |
| ContractNLI | macro-F1 | 85,99 |

† Benchmarks de solo visualización que no contribuyen al índice público.

La model card indica que GS1-4B alcanza 68,97 en el índice público Decision Index 0.4.1, aunque la tabla de resultados detallada corresponde a la edición 0.3.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.704.520.192 parámetros almacenados en FP32, los pesos ocupan aproximadamente 18,8 GB; el tamaño del repositorio es de 18,2 GB. La inferencia en BF16 requiere al menos unos 9,4 GB solo para pesos, más memoria para activaciones y contexto.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por tamaño, una GPU con 24 GB o más (RTX 4090, A100 40 GB, H100) cubre los pesos en FP32; una GPU de 16 GB podría alojar los pesos en BF16 con margen limitado.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) en FP32 y en GPUs de 16 GB en BF16, aunque no se confirma en la información disponible.
- Opciones de despliegue: transformers con `custom_code` (la model card menciona inferencia por defecto y con CUDA Graph). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia: 35,17 ms P50 para una pregunta corta con CUDA Graph; speedup de 2,35× frente a la inferencia por defecto para ocho preguntas cortas. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Public index (Decision Index 0.3) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| GS1-4B | 4.704.520.192 | 65.536 tokens | 68,97 | Apache 2.0 | Hugging Face |
| GS1-2B | no disponible | no disponible | 62,22 | Apache 2.0 | Hugging Face |
| GS1-9B | no disponible | no disponible | 70,45 | Apache 2.0 | Hugging Face |
| GS1-0.8B | no disponible | no disponible | 56,12 | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de comparaciones con modelos de decisión de otros desarrolladores. La model card únicamente compara entre los distintos tamaños de la familia GS1, que se sitúan sobre la frontera parámetro-rendimiento mostrada por el autor.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo distribuciones sobre candidatos definidos por el usuario. No puede emplearse para generación de texto, código o diálogo abierto.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: al operar sobre candidatos cerrados, el riesgo se traslada a la calibración de las probabilidades; la model card no documenta tasas de error de calibración.
- Limitaciones de contexto: la longitud máxima de rama completa es de 65.536 tokens; no se detalla el comportamiento más allá de ese límite.
- Idiomas soportados: no disponible, lo que impide confirmar cobertura multilingüe en producción.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las obligaciones de atribución y las condiciones del modelo base Qwen3.5-4B.
- Requiere `trust_remote_code` o el código personalizado del repositorio (`custom_code`) para cargar la cabeza de decisión; no es un transformer estándar.
- La model card menciona una torre de visión retenida en BF16 sin documentar sus capacidades ni su disponibilidad efectiva en inferencia.
- Los resultados de benchmark públicos corresponden a la edición 0.3 del Decision Index, mientras que la puntuación de 68,97 se cita para la edición 0.4.1; conviene verificar la correspondencia exacta de versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bigai/GS1-4B
- Colección GS1: https://huggingface.co/collections/bigai/gs1
- Repositorio de código: https://github.com/bigai-nlco/GS1
- Documentación: https://github.com/bigai-nlco/GS1/blob/main/docs/README.md
- Playground: https://github.com/bigai-nlco/GS1/blob/main/playground/README.md
- Documentación de arquitectura: https://github.com/bigai-nlco/GS1/blob/main/docs/model.md
- Documentación de RLCD: https://github.com/bigai-nlco/GS1/blob/main/docs/RLCD.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
