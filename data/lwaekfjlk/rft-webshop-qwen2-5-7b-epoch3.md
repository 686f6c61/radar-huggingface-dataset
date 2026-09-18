# lwaekfjlk/rft-webshop-qwen2.5-7b-epoch3

## Resumen

El modelo `lwaekfjlk/rft-webshop-qwen2.5-7b-epoch3` es un ajuste fino por rechazo (Rejection Fine-Tuning, RFT) de Qwen2.5-7B-Instruct sobre trayectorias de agente generadas por el propio modelo en el entorno WebShop de AgentGym. Lo publica el usuario de HuggingFace `lwaekfjlk` como parte de una replicación del trabajo RWML (arXiv 2602.05842) y su objetivo es especializar un modelo de 7,6 mil millones de parámetros en una tarea concreta: navegar una tienda web simulada, buscar productos, comparar atributos y ejecutar la compra óptima mediante acciones estructuradas a lo largo de decenas de turnos.

El interés de esta ficha es doble. Por un lado, es un ejemplo canónico de pipeline RFT: se generan 14.611 rollouts con el modelo base, se filtran por recompensa del entorno (umbral 0,6 sobre una puntuación continua de coincidencia de atributos) y se conservan 4.507 trayectorias sobre 2.521 tareas distintas para un SFT de parámetros completos en 3 épocas. Por otro, es un caso de estudio sobre los límites de la señal de recompensa: solo 395 de los 14.611 rollouts alcanzaron una puntuación perfecta, lo que obligó a relajar el umbral y deja una supervisión con recompensa mediana de 0,71.

Se trata de un modelo denso (no MoE) de la familia Qwen2, en formato safetensors y bf16, con licencia Apache 2.0, un tamaño de repositorio de 15,2 GB y cero descargas registradas en el momento de la consulta. No se han publicado benchmarks de éxito en tarea ni datos de contexto específicos para este checkpoint, por lo que debe evaluarse empíricamente antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen2 (heredada de Qwen2.5-7B-Instruct); sin datos adicionales en la model card |
| Parámetros totales | 7.615.616.512 (≈7,62 B, según los safetensors publicados) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la model card. Las secuencias de entrenamiento tienen una media de 2.937 tokens y un máximo de 11.324, con 0 % de truncamiento a 16.384 tokens. El modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos y 131.072 con extensión YaRN |
| Tipos de cuantización | no disponible: solo se publica el checkpoint en bf16. No se distribuyen versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible en la model card (el modelo base es multilingüe, pero no se declara el conjunto concreto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer decoder-only denso con atención por consultas agrupadas (GQA), RoPE y SwiGLU, sin modificaciones estructurales. El ajuste es un SFT de parámetros completos (no LoRA), ejecutado con FSDP sobre 4 GPU Blackwell en precisión bf16, con una tasa de aprendizaje de 5e-6 y un scheduler lineal con 3 % de warmup. El lote efectivo fue de 16 (1 muestra × 4 pasos de acumulación de gradiente × 4 GPU), con 1.126 pasos por época y 3.378 pasos totales. La pérdida media por época descendió de 0,401 a 0,347 y finalmente a 0,236.

Los datos de entrenamiento provienen de rollouts del propio Qwen2.5-7B-Instruct sobre el split de entrenamiento de `webshop` en AgentGym: 3 muestras por tarea, temperatura 1,0 y un máximo de 30 rondas de interacción. El filtrado se hizo por recompensa del entorno, una puntuación continua de coincidencia de atributos en el rango 0-1, con umbral >= 0,6. Se conservaron 4.507 trayectorias (más 242 reservadas) que cubren 2.521 tareas distintas. La innovación metodológica relevante no está en la arquitectura sino en el bucle: el modelo genera sus propias trayectorias, el entorno las puntúa y solo las mejores se usan como supervisión, sin anotación humana ni modelo recompensador aprendido.

## Capacidades

- Generación de texto e instrucciones generales, heredadas del modelo base Qwen2.5-7B-Instruct.
- Ejecución de tareas agénticas de múltiples pasos en entornos web simulados: búsqueda, navegación, selección y compra.
- Razonamiento multi-turno con historial de acciones y observaciones de hasta 30 rondas, dentro de trayectorias de hasta 11.324 tokens.
- Emisión de acciones estructuradas propias del entorno WebShop (búsquedas con términos de consulta y clics sobre opciones de producto).
- Manejo de instrucciones con atributos de producto (color, talla, precio, material, marca) y comparación de alternativas.
- Capacidad de tool calling / function calling en el sentido amplio del modelo base; no se documenta en la model card un esquema de herramientas específico.
- Soporte multilingüe: no verificado ni declarado para este checkpoint.

## Casos de uso

- Agente de compra en comercio electrónico simulado: el modelo encadena búsquedas y clics hasta completar una compra que maximice la coincidencia de atributos, que es exactamente la tarea sobre la que se ha entrenado.
- Investigación en RFT y aprendizaje por refuerzo: sirve como checkpoint de referencia para replicar RWML, comparar umbrales de filtrado por recompensa o medir el efecto del número de épocas sobre la tasa de éxito (las 3 épocas publicadas con pérdidas 0,401, 0,347 y 0,236 permiten analizar sobreajuste).
- Generación de trayectorias de entrenamiento: al ser un modelo especializado en WebShop, puede producir rollouts adicionales que después se filtren por recompensa para iterar el pipeline.
- Evaluación de robustez de agentes: útil para medir cómo degrada un ajuste de dominio estrecho las capacidades generales del modelo base, comparando ambos checkpoints sobre el mismo conjunto de tareas.
- Automatización de flujos de navegación web acotados: en entornos con estructura estable y acciones discretas, el modelo puede integrarse como política de decisión dentro de un bucle de ejecución externo que gestione el navegador real.
- Docencia y demostraciones de agentes: un checkpoint de 7,6 B que cabe en hardware de gama alta permite montar demos de agente con entorno simulado sin depender de APIs cerradas.
- Punto de partida para ajustes posteriores: al ser un SFT de parámetros completos sobre Apache 2.0, puede usarse como inicialización para DPO, RLHF o nuevas rondas de RFT.
- Pruebas de pipelines de despliegue agéntico: sirve para validar integraciones con vLLM, TGI o SGLang en cargas de muchas peticiones cortas con historial creciente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni tasas de éxito en WebShop para este checkpoint, y la búsqueda web no devolvió ninguna fuente adicional relevante. El propio autor advierte de que la pérdida no es una métrica fiable aquí y que el checkpoint debe juzgarse por tasa de éxito en tarea.

| Métrica | Valor |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Tasa de éxito en WebShop | no disponible |
| Recompensa media de las trayectorias de entrenamiento | 0,71 (mediana de las trayectorias conservadas) |
| Rollouts con recompensa 1,0 sobre 14.611 generados | 395 |

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 15,2 GB solo para los pesos, más caché KV y overhead del runtime; en la práctica se necesitan del orden de 17-18 GB con contextos de 16.000 tokens.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB. En 4 bits (requiere conversión propia a GGUF, no distribuida): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 o H200 para despliegue en bf16 con concurrencia; en el extremo opuesto, cualquier GPU de 24 GB puede ejecutar el modelo en bf16 con lotes pequeños.
- Cabe en GPU de consumo: sí, en bf16 de forma ajustada en RTX 3090, RTX 4090 o RTX 5090 (24 GB o más); en 8 o 4 bits, en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 Ti Super con contextos moderados.
- Opciones de despliegue: vLLM, TGI, SGLang y Transformers para bf16; llama.cpp u Ollama únicamente tras convertir los pesos a GGUF, ya que el repositorio solo contiene safetensors.
- El entrenamiento documentado se realizó en 4 GPU Blackwell con FSDP y bf16, con lote efectivo 16 y 3.378 pasos totales.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tasa de éxito por configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks públicos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rft-webshop-qwen2.5-7b-epoch3 | 7,62 B | no declarado (entrenado hasta 16.384 tokens) | no disponibles | Apache 2.0 | HuggingFace, safetensors bf16, 0 descargas |
| Qwen2.5-7B-Instruct (modelo base) | 7,62 B | 32.768 tokens nativos, 131.072 con YaRN | publicados por Alibaba, no reproducidos aquí | Apache 2.0 | HuggingFace, muy extendido |
| Otros ajustes agénticos de 7 B sobre WebShop o AgentGym | no disponible | no disponible | no disponibles | no disponible | no disponible |

La comparación cuantitativa es inviable con los datos disponibles: no existen resultados publicados de este checkpoint ni de alternativas equivalentes sobre el mismo protocolo de evaluación. La única comparación defendible es la del modelo base sin ajustar, que puede ejecutarse sobre el mismo entorno para medir la ganancia atribuible al RFT.

## Limitaciones y advertencias

- Especialización extrema: el ajuste se limita a trayectorias de WebShop, por lo que es esperable una degradación de capacidades generales (código, matemáticas, conocimiento abierto) respecto al modelo base, aunque no se ha cuantificado.
- Señal de supervisión ruidosa: solo 395 de 14.611 rollouts alcanzaron recompensa 1,0 y el umbral se relajó a 0,6 con una mediana de 0,71, lo que implica que buena parte de las trayectorias de entrenamiento representan compras meramente aceptables, no óptimas.
- Ausencia total de benchmarks: no hay tasa de éxito en WebShop ni evaluaciones de terceros. El autor recomienda explícitamente juzgar el checkpoint por tasa de éxito en tarea y no por la pérdida.
- Riesgo de sobreajuste a la configuración del entorno: el comportamiento puede no transferirse a interfaces web reales, con acciones distintas, HTML cambiante o catálogos más grandes.
- Riesgo de alucinación: el modelo puede inventar atributos de producto o dar por satisfechos requisitos que no ha verificado, al no existir un mecanismo de comprobación explícito en la model card.
- Idiomas no declarados: no hay información sobre si el ajuste conserva el multilingüismo del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero hay que verificar también los términos del modelo base y de los datos de AgentGym empleados en el pipeline.
- Validación de pesos: el autor afirma haber verificado que no hay NaN, Inf ni tensores a cero antes de subir el checkpoint; no hay verificación independiente.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar problemas conocidos.
- Fecha de creación registrada: 18 de septiembre de 2026, según los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lwaekfjlk/rft-webshop-qwen2.5-7b-epoch3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper citado en la model card (replicación RWML): https://arxiv.org/abs/2602.05842
- AgentGym, entorno e infraestructura de entrenamiento mencionados en la model card: no se proporciona enlace directo en la información disponible
- Búsqueda web adicional: no se encontraron resultados relevantes; el único resultado devuelto fue una página no relacionada con el modelo
