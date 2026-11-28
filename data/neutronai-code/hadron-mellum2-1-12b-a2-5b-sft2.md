# neutronai-code/Hadron-Mellum2.1-12B-A2.5B-sft2

## Resumen

Hadron-Mellum2.1-12B-A2.5B-sft2 es un modelo de lenguaje de tipo Mixture of Experts (MoE) publicado en Hugging Face por el usuario neutronai-code. El identificador del modelo indica 12.000 millones de parámetros totales y aproximadamente 2.500 millones de parámetros activos por token, y los pesos en safetensors confirman un total real de 12.149.923.072 parámetros. Deriva de la familia Mellum (según el nombre "Mellum2.1") y ha sido sometido a un ajuste fino supervisado (SFT) mediante la librería TRL, tal como reflejan los tags del repositorio.

El modelo se distribuye en formato transformers con pesos safetensors, tiene un tamaño de repositorio de 40 GB y está etiquetado como compatible con endpoints. La model card es la plantilla automática de Hugging Face y no contiene información sustantiva sobre arquitectura, datos de entrenamiento, licencia, idiomas o evaluación. Por tanto, la mayor parte de las especificaciones técnicas de esta ficha deben considerarse no disponibles.

Su relevancia radica en que ejemplifica la tendencia de modelos MoE de tamaño medio con pocos parámetros activos, orientados a despliegues eficientes, pero al carecer de documentación y de un historial de uso (0 descargas, 0 likes en el momento de la consulta), debe tratarse como un artefacto experimental sin garantías de calidad ni de licencia para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), según el identificador del modelo; detalles internos no disponibles |
| Parámetros totales | 12.149.923.072 (12,15 B) |
| Parámetros activos | aproximadamente 2,5 B (según el identificador "A2.5B"); no confirmado en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16 por el tamaño de 40 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El nombre del modelo indica una arquitectura Mixture of Experts con 12,15 B de parámetros totales y unos 2,5 B activos por token, lo que implicaría un ratio de activación de aproximadamente el 20 %. No obstante, la model card no documenta el número de expertos, el mecanismo de enrutamiento, la dimensión oculta, el número de capas ni el tipo de atención. Tampoco se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones.

Respecto al entrenamiento, los tags confirman un proceso de ajuste fino supervisado (SFT) realizado con TRL sobre un modelo base de la familia Mellum 2.1. Se desconoce el volumen de tokens de preentrenamiento, la composición del dataset de SFT, si hubo etapas de RLHF o DPO, y los hiperparámetros utilizados. La referencia arXiv:1910.09700 presente en los tags corresponde a la calculadora de impacto medioambiental de Lacoste et al. y no a un paper del modelo, por lo que no aporta información técnica sobre este.

## Capacidades

- Generación de texto conversacional: el tag "conversational" sugiere un ajuste orientado a diálogo multi-turno, aunque no se detalla el formato de chat ni las plantillas de prompt.
- Ajuste fino supervisado (SFT): el modelo ha pasado por una etapa de instrucción, pero se desconoce el alcance y la calidad del dataset empleado.
- Razonamiento, código y matemáticas: no disponible; no hay evidencia documentada de estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación con arquitecturas MoE: el modelo permite estudiar el comportamiento de un MoE de 12 B totales y 2,5 B activos en entornos de investigación, comparando su eficiencia frente a modelos densos de tamaño similar.
- Evaluación comparativa de ajustes SFT: al derivar de Mellum 2.1 con un SFT adicional vía TRL, puede usarse para analizar el efecto de distintas etapas de instrucción sobre el modelo base.
- Pruebas de despliegue eficiente: con 2,5 B parámetros activos, es candidato para medir throughput y latencia en infraestructuras modestas, aunque sin datos publicados de rendimiento.
- Generación de texto conversacional en prototipos: su etiqueta "conversational" permite integrarlo en demos de chatbots, siempre que se valide previamente la calidad de las respuestas.
- Base para experimentos de cuantización: el repositorio de 40 GB en safetensors sirve como punto de partida para generar versiones GGUF o AWQ y estudiar la degradación de calidad en MoE.
- Investigación sobre licencias y trazabilidad de modelos: útil como caso de estudio de modelos publicados sin licencia ni documentación, para analizar riesgos de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 24-25 GB solo para pesos (12,15 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 32 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 13-14 GB para pesos, con margen adicional para contexto.
- VRAM estimada en cuantización de 4 bits: en torno a 7-8 GB para pesos, aunque no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para bf16 sin cuantizar; RTX 4090 (24 GB) solo con cuantización o con contextos cortos.
- ¿Cabe en GPU de consumo? Sí, potencialmente en RTX 4090 con cuantización, y en GPUs de 16 GB con cuantización de 4 bits, aunque sin validación publicada.
- Opciones de despliegue: transformers (soporte nativo), y presumiblemente vLLM, TGI o llama.cpp si se generan pesos compatibles, aunque no hay confirmación oficial.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hadron-Mellum2.1-12B-A2.5B-sft2 | 12,15 B | ~2,5 B | no disponible | no disponible | Hugging Face, 0 descargas |
| Modelos MoE de tamaño medio comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas, ya que no se conocen los detalles arquitectónicos ni los resultados de evaluación del modelo.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática y no aporta información sobre entrenamiento, datos, evaluación ni uso previsto.
- Licencia no especificada: no es posible determinar si se permite uso comercial, lo que desaconseja su adopción en producción sin aclaración previa.
- Idiomas no declarados: se desconoce la cobertura lingüística y la calidad en castellano u otros idiomas.
- Riesgo de alucinación: sin benchmarks ni evaluación, no hay evidencia sobre la fiabilidad factual del modelo.
- Sesgos desconocidos: al no documentarse la composición del dataset de SFT, no pueden evaluarse sesgos potenciales.
- Contexto no documentado: se desconoce la ventana de contexto máxima soportada, lo que limita el diseño de aplicaciones multi-turno o de documentos largos.
- Historial de uso nulo: 0 descargas y 0 likes en el momento de la consulta implican ausencia de validación por parte de la comunidad.
- Fecha de creación atípica (2026-11-28): conviene verificar la autenticidad y procedencia del repositorio antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/neutronai-code/Hadron-Mellum2.1-12B-A2.5B-sft2
- Paper de la calculadora de impacto medioambiental citado en los tags: https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact#compute
