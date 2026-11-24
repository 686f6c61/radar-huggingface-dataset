# orcarouter/Inkling-2-Mini-abliterated

## Resumen

Inkling-2-Mini-abliterated es una variante "abliterated" (esto es, con las direcciones de rechazo eliminadas mediante edición de pesos) del modelo multimodal Inkling-2-Mini desarrollado por Thinking Machines. Lo publica el usuario orcarouter en Hugging Face bajo licencia Apache 2.0, con acceso restringido que requiere aceptar las condiciones del repositorio. Se trata de un modelo de arquitectura MoE (mixture of experts) con pipeline image-text-to-text, orientado a conversación multimodal y etiquetado explícitamente para red-teaming de IA y uso "uncensored".

El modelo cuenta con 26.386.412.544 parámetros totales según los pesos en safetensors, un repositorio de 53,5 GB y soporte declarado únicamente para inglés. La etiqueta de arquitectura es `inkling2_loop`, lo que sugiere un diseño con capas recurrentes o bucles de cómputo iterativo, aunque no se dispone de documentación técnica detallada en la información proporcionada.

Su relevancia es doble: por un lado, permite estudiar el comportamiento de un MoE multimodal de ~26B tras eliminar los mecanismos de rechazo; por otro, sirve como caso práctico de los riesgos y límites de las técnicas de abliteration aplicadas a modelos con capacidades de visión y tool calling. Al ser un fine-tune del modelo base, hereda su arquitectura y tokenizador, pero no se han publicado métricas de rendimiento específicas para esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) multimodal; tag de arquitectura `inkling2_loop` |
| Parametros totales | 26.386.412.544 (~26,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base thinkingmachines/Inkling-2-Mini, un MoE multimodal con pipeline image-text-to-text. El tag `inkling2_loop` apunta a un diseño con mecanismo de bucle o recurrencia interna, pero no se dispone de detalles sobre número de expertos, ratio de activación, número de capas ni dimensión oculta. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La modificación "abliterated" consiste en la supresión de las direcciones de activación asociadas al rechazo, una técnica de edición de pesos que no requiere reentrenamiento completo. No se especifican en la información disponible el método exacto (por ejemplo, proyección ortogonal de direcciones de rechazo), el conjunto de datos de calibración utilizado ni el grado de degradación de capacidades que introduce el proceso. El repositorio no incluye model card técnica con hiperparámetros de entrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Procesamiento de imagen y texto de forma conjunta (image-text-to-text), lo que habilita preguntas y respuestas sobre imágenes.
- Razonamiento y generación de código, heredados del modelo base, aunque sin métricas publicadas para esta variante.
- Soporte declarado de tool calling y function calling por herencia del modelo base, no verificado en esta versión.
- Capacidades de agente y razonamiento multi-paso, presumiblemente heredadas, sin documentación específica.
- Modo "uncensored": el proceso de abliteration elimina parte de los mecanismos de rechazo, lo que cambia el perfil de respuestas ante prompts sensibles.
- Multilingüismo limitado: solo se declara inglés, a diferencia de modelos multimodales con cobertura multilingüe amplia.

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo sirve para probar la robustez de pipelines de moderación frente a un modelo con rechazos suprimidos, identificando qué tipos de prompts evaden los filtros y cómo se comporta un MoE multimodal en esos escenarios.
- Investigación sobre abliteration: comparar las respuestas de esta variante con las del base thinkingmachines/Inkling-2-Mini permite medir el coste en calidad, coherencia y alineación que introduce la edición de pesos.
- Análisis de imágenes en entornos controlados: al aceptar entrada image-text, puede usarse para describir, clasificar o extraer información de imágenes en flujos internos donde el contenido sensible es legítimo (por ejemplo, revisión de material de archivo).
- Generación de datos sintéticos para entrenamiento: en pipelines de investigación se puede emplear para producir pares imagen-texto o conversaciones que luego se filtran y curan manualmente antes de usarse.
- Pruebas de integración con transformers y endpoints compatibles: el tag `endpoints_compatible` permite desplegarlo en infraestructura de inferencia estándar para validar latencia, throughput y comportamiento del MoE a 26B en distintas precisiones.
- Evaluación de sesgos y toxicidad: útil para estudiar cómo se distribuyen los sesgos de un modelo multimodal cuando se eliminan las capas de rechazo, como paso previo al diseño de salvaguardas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,4B parámetros, en FP16 se requieren aproximadamente 53 GB de VRAM solo para pesos, más overhead de activaciones y caché KV; en BF16, cifra similar. En cuantización de 8 bits, alrededor de 27 GB; en 4 bits, en torno a 14-16 GB, aunque no se ofrecen cuantizaciones oficiales en el repositorio.
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16/BF16 sin sharding; múltiples A100 40 GB o RTX 6000 Ada con tensor parallelism para despliegues multi-GPU.
- GPU de consumo: en 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con margen ajustado y dependiendo de la longitud de contexto efectiva, que no está documentada.
- Opciones de despliegue: transformers (librería declarada), servidores compatibles con endpoints (tag `endpoints_compatible`), y previsiblemente vLLM o TGI si el soporte de la arquitectura `inkling2_loop` está implementado en ellos; llama.cpp y Ollama no están confirmados por ausencia de GGUF.
- Latencia y throughput: no disponibles. Al ser un MoE, el throughput dependerá del número de parámetros activos, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| orcarouter/Inkling-2-Mini-abliterated | ~26,4B (MoE) | no disponible | imagen-texto | Apache 2.0 | Variante abliterated, solo inglés, acceso restringido |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | imagen-texto | no disponible en la información | Modelo base sin modificar; referencia para medir el efecto de la abliteration |
| Alternativas multimodales abliterated de tamaño similar | no disponible | no disponible | imagen-texto | variable | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La abliteration elimina rechazos de forma no selectiva, lo que puede aumentar la probabilidad de contenido dañino, sesgado o inexacto, y degradar la calidad en tareas que requieren matices de seguridad.
- Riesgo elevado de alucinación en tareas de razonamiento y descripción de imágenes, sin benchmarks que cuantifiquen la degradación respecto al base.
- Soporte exclusivo de inglés: no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar despliegues con ventanas largas sin pruebas empíricas previas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para automatizaciones y CI/CD.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo "uncensored" exige auditoría propia de cumplimiento y moderación externa; la licencia no exime de responsabilidad sobre las salidas.
- Sin cuantizaciones oficiales publicadas, el despliegue en hardware de consumo requiere generar los pesos cuantizados y validar su calidad.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: no hay evidencia comunitaria de funcionamiento estable ni de soporte en frameworks de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/Inkling-2-Mini-abliterated
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
