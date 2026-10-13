# ruddls030/HyperCLOVAX-SEED-Haru-0.5B-GGUF

## Resumen

HyperCLOVAX-SEED-Haru-0.5B-GGUF es una adaptacion ligera del modelo base naver-hyperclovax/HyperCLOVAX-SEED-Text-Instruct-0.5B, publicada por el usuario ruddls030. Se trata de un ajuste fino mediante LoRA (todas las capas, 1500 pasos) sobre un conjunto de 4.175 respuestas con el estilo de habla de "Haru", el personaje conversacional de un producto llamado HaruPet, seguido de la fusion de los pesos y su conversion a GGUF con cuantizacion Q4_K_M. El resultado es un modelo denso de 566.281.216 parametros (aproximadamente 0,57 mil millones) disenado para inferencia exclusivamente en CPU.

Su relevancia es practica mas que cientifica: ocupa 0,4 GB en disco y responde en unos 0,4 segundos por turno en un Apple Silicon de 4 hilos, lo que lo situa en el segmento de asistentes conversacionales ultraligeros embebidos, sin GPU y con requisitos de memoria minimos. Esta especializado en conversacion multi-turno en coreano con un tono concreto, no en razonamiento, codigo o tareas de agente.

La licencia es la HyperCLOVA X SEED Model License Agreement, que no es una licencia de codigo abierto estandar y mantiene restricciones de uso para el usuario final, incluidas las de la seccion 2.3 sobre usos prohibidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card; el modelo base es un LLM de texto denso) |
| Parametros totales | 566.281.216 (aproximadamente 0,57 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada en este repositorio) |
| Idiomas soportados | coreano (ko) |
| Licencia | hyperclovax-seed (HyperCLOVA X SEED Model License Agreement, licencia "other") |
| Formato de pesos | GGUF (llama.cpp); los pesos originales del modelo base estan en safetensors |

## Arquitectura y entrenamiento

No se especifica la arquitectura interna en la informacion disponible. El modelo base, HyperCLOVAX-SEED-Text-Instruct-0.5B, es un modelo de comprension y generacion de texto de Naver descrito como capaz de mantener conversaciones multi-turno en coreano pese a su tamano reducido. Sobre el se aplico un ajuste LoRA en todas las capas durante 1500 pasos, con un dataset de 4.175 respuestas de estilo "Haru". Posteriormente se fusionaron los adaptadores en los pesos base, se cambio el token de fin de secuencia a `<|im_end|>` (id 100273) y se convirtio el resultado a GGUF con cuantizacion Q4_K_M. No se documenta el numero de tokens de entrenamiento ni la composicion completa del dataset, ni si hubo etapas de RLHF o DPO en el modelo base.

La innovacion tecnica relevante no esta en la arquitectura, sino en el metodo de uso descrito por el autor: un esquema hibrido de recuperacion y generacion. Mediante embeddings e5 se recuperan las dos respuestas de "Haru" mas similares al mensaje del usuario y se inyectan como pistas al final del system prompt, indicando explicitamente al modelo que no las copie literalmente. Si la puntuacion de similitud e5 es igual o superior a 0,75 se devuelve directamente la respuesta recuperada; en caso contrario se genera con el modelo a temperatura 0,4. El ajuste LoRA esta orientado a este flujo, no a instrucciones generales.

## Capacidades

- Generacion de texto conversacional en coreano, orientada a dialogos multi-turno breves.
- Reproduccion de un registro o personaje concreto ("estilo Haru"), aprendido de 4.175 respuestas de referencia.
- Inferencia exclusiva en CPU mediante llama.cpp, con `llama-server` y `-ngl 0 --device none`.
- Integracion en un pipeline hibrido de recuperacion (e5) mas generacion, con umbral de similitud configurable.
- Funcionamiento sin conexion y con huella de memoria muy reducida, apto para dispositivos de bajos recursos.
- Soporte de system prompt para inyectar pistas de estilo o ejemplos recuperados.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio u otras modalidades: no disponibles (modelo exclusivamente de texto).
- Modo "thinking" explicito: no disponible.
- Capacidades de codigo y matematicas: no documentadas.

## Casos de uso

- Companero conversacional embebido en un dispositivo de bajo consumo: con 566 millones de parametros y Q4_K_M, el modelo cabe en un equipo sin GPU y responde en torno a 0,4 segundos por turno en un Apple Silicon de 4 hilos, lo que permite integrarlo en hardware tipo juguete, electrodomestico o terminal domestico.
- Producto HaruPet y dispositivos de mascota virtual: el ajuste LoRA esta entrenado especificamente sobre el estilo de habla del personaje, por lo que reproduce un tono consistente sin necesidad de prompts largos ni ejemplos en cada peticion.
- Asistente de voz en coreano para kioscos o terminales sin conectividad: al ejecutarse con llama.cpp y `--device none`, puede desplegarse on-premise o en un equipo aislado, con la salida conectada a un motor TTS local.
- Prototipado rapido de chatbots en coreano: el repositorio de 0,4 GB permite descargar, arrancar y evaluar un asistente funcional en minutos, antes de decidir si se escala a un modelo mayor.
- Pipeline hibrido de recuperacion mas generacion: combinando la seleccion por embeddings e5 con umbral 0,75 y la generacion del modelo por debajo de ese umbral, se monta un sistema de respuestas frecuentes con coste muy bajo y control de calidad explicito.
- Redaccion asistida de respuestas breves de atencion al cliente en coreano: para tickets cortos y repetitivos, el esquema de pistas recuperadas reduce la variabilidad y mantiene un tono uniforme entre operadores.
- Evaluacion comparativa de tecnicas de ajuste ligero: sirve como caso de estudio reproducible de LoRA de capa completa sobre un modelo de 0,5B, con un conjunto de evaluacion ciego publicado por el autor.

## Benchmarks y rendimiento

La model card publica un unico conjunto de resultados: una prueba ciega de 150 preguntas puntuadas de 0 a 2, en la que tambien se mide la tasa de respuestas "descolocadas" o fuera de lugar. No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Metodo evaluado | Puntuacion media (0-2) | Respuestas descolocadas |
|---|---|---|
| Este modelo (0.5B) + pistas | 1,20 | 18 % |
| Seleccion por embeddings e5 | 1,25 | 11 % |
| HyperCLOVAX-SEED-Haru-1.5B + pistas | 1,39 | 10 % |

Datos de latencia declarados por el autor: aproximadamente 0,4 segundos por respuesta en un Apple Silicon con 4 hilos de CPU, y 1,8 segundos si se usan unicamente los nucleos de eficiencia. El autor indica explicitamente que la calidad del modelo de 1.5B es superior y que este 0.5B esta pensado para equipos de bajos recursos.

## Requisitos de hardware

- VRAM estimada: no aplica en el flujo previsto, ya que el autor indica inferencia exclusiva en CPU. Con `-ngl 0 --device none` no se usa GPU en absoluto.
- Tamano en disco y memoria: el repositorio GGUF Q4_K_M ocupa 0,4 GB, de modo que la huella de pesos es de ese orden; hay que anadir el espacio de la cache KV, que depende del contexto configurado.
- Ejecucion en GPU consumer: tecnicamente el modelo es lo bastante pequeno para caber en cualquier GPU consumer (por ejemplo, una RTX 4090, una RTX 3060 o incluso GPUs integradas), ya que los pesos cuantizados rondan unos pocos cientos de megabytes; sin embargo, el autor recomienda y documenta el modo CPU.
- CPU: funciona en procesadores de portatil. Las cifras publicadas corresponden a un Apple Silicon de 4 hilos (0,4 s por respuesta) y a sus nucleos de eficiencia (1,8 s).
- Opciones de despliegue: llama.cpp con `llama-server` es el metodo documentado. No se mencionan vLLM, Ollama ni TGI en la informacion disponible, aunque el formato GGUF es compatible con los runners habituales basados en llama.cpp.
- Latencia y throughput: 0,4 s por respuesta en el escenario de CPU de 4 hilos citado; no hay datos de throughput en tokens por segundo ni de despliegue concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperCLOVAX-SEED-Haru-0.5B-GGUF (este) | 566.281.216 | no disponible | 1,20 / 2 con 18 % de respuestas descolocadas (150 preguntas ciegas) | hyperclovax-seed | HuggingFace, GGUF Q4_K_M |
| HyperCLOVAX-SEED-Haru-1.5B (mismo autor, version mayor) | no disponible | no disponible | 1,39 / 2 con 10 % de respuestas descolocadas | hyperclovax-seed | mencionado en la model card |
| naver-hyperclovax/HyperCLOVAX-SEED-Text-Instruct-0.5B (modelo base) | aproximadamente 0,5B | no disponible | no disponible | hyperclovax-seed | HuggingFace |
| tensorblock/naver-hyperclovax_HyperCLOVAX-SEED-Text-Instruct-0.5B-GGUF (cuantizacion del base) | aproximadamente 0,5B | no disponible | no disponible | hyperclovax-seed | HuggingFace, GGUF |
| rosewar/HyperCLOVAX-SEED-Text-Instruct-0.5B-Q5_K_M-GGUF (cuantizacion del base) | aproximadamente 0,5B | no disponible | no disponible | hyperclovax-seed | HuggingFace, GGUF Q5_K_M |

La comparacion con familias de proposito general del mismo rango (Qwen, Llama, Gemma por debajo de 1B) no esta disponible en la informacion proporcionada, y en cualquier caso el modelo esta especializado en un unico idioma y un unico registro, por lo que no es directamente intercambiable con ellos.

## Limitaciones y advertencias

- Modelo monoidioma: solo coreano (ko). No hay evidencia de soporte para castellano ni otros idiomas.
- Calidad limitada por tamano: el propio autor reconoce que la version de 1.5B obtiene mejores resultados (1,39 frente a 1,20 en la prueba ciega).
- Tasa de respuestas descolocadas del 18 % en la evaluacion publicada, superior a la de la seleccion por embeddings e5 (11 %) y a la del modelo de 1.5B (10 %).
- Riesgo de alucinacion y de deriva de personaje: al ser un ajuste LoRA sobre 4.175 respuestas de estilo, el modelo puede forzar el registro "Haru" fuera de contexto o inventar contenido para mantener el tono.
- El ajuste esta disenado para un flujo con pistas recuperadas y umbral e5 de 0,75; fuera de ese pipeline, el rendimiento puede degradarse respecto a las cifras publicadas.
- Cambio de token de fin de secuencia a `<|im_end|>` (id 100273): puede causar incompatibilidades con plantillas de chat o configuraciones que esperen el token EOS original del modelo base.
- Sin datos de tool calling, agentes, codigo, matematicas, vision ni audio. No debe asumirse ninguna de estas capacidades.
- Licencia restrictiva: se rige por la HyperCLOVA X SEED Model License Agreement (seccion 3.1(iii) para las modificaciones declaradas). La seccion 2.3 prohibe usos como vigilancia ilegal, tratamiento de datos biometricos sin consentimiento, acoso o engano, y estas restricciones se transmiten a los usuarios posteriores. Es imprescindible revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial.
- Ausencia de benchmarks estandar: no hay resultados de MMLU, HumanEval, GSM8K ni similares, por lo que la evaluacion disponible se limita a una prueba ciega interna de 150 preguntas.
- Metadatos llamativos: el repositorio registra fecha de creacion en 2026 y 0 descargas y 0 "likes", por lo que se trata de una publicacion muy reciente y practicamente sin validacion externa por parte de la comunidad.
- Longitud de contexto desconocida: sin este dato no es posible planificar conversaciones largas ni estimar el consumo de cache KV.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ruddls030/HyperCLOVAX-SEED-Haru-0.5B-GGUF
- Modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Text-Instruct-0.5B
- Cuantizacion GGUF del modelo base por TensorBlock: https://huggingface.co/tensorblock/naver-hyperclovax_HyperCLOVAX-SEED-Text-Instruct-0.5B-GGUF
- Cuantizacion GGUF Q5_K_M del modelo base por rosewar: https://huggingface.co/rosewar/HyperCLOVAX-SEED-Text-Instruct-0.5B-Q5_K_M-GGUF
- Pagina del modelo base en Inferix: https://inferix.co/models/naver-ellm/HyperCLOVAX-SEED-Text-Instruct-0.5B-GGUF
- Pagina oficial de HyperCLOVA X (CLOVA): https://clova.ai/en/hyperclova
