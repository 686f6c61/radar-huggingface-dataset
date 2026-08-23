# nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16

## Resumen

NVIDIA-Nemotron-3-Nano-4B-BF16 es un modelo de lenguaje pequeno (SLM) de 4.000 millones de parametros desarrollado por NVIDIA, disenado como un modelo unificado para tareas de razonamiento y no razonamiento. Forma parte de la familia Nemotron 3, que incluye los modelos Nano, Super y Ultra, y esta especificamente orientado a IA agente en plataformas edge como Jetson Thor, GeForce RTX y DGX Spark.

El modelo destaca por su arquitectura hibrida que combina principalmente capas Mamba-2 y MLP con solo cuatro capas de atencion, lo que le permite ofrecer un rendimiento notable en razonamiento con un coste computacional reducido. Se ha comprimido desde el modelo NVIDIA-Nemotron-Nano-9B-v2 mediante el framework Nemotron Elastic, lo que explica su tamano compacto sin sacrificar en exceso la precision. El modelo puede operar en modo razonamiento (generando trazas de razonamiento antes de responder) o en modo directo, controlable mediante el system prompt.

Su relevancia actual radica en que esta disenado para IA agente en el borde, un area de creciente interes para aplicaciones como NPCs en juegos, asistentes de voz locales y automatizacion IoT. El modelo esta listo para uso comercial y solo soporta ingles como idioma natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2 + MLP + 4 capas de atencion (Nemotron-H) |
| Parametros totales | 3.973.556.832 (3,97B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (RULER evaluado a 128k) |
| Tipos de cuantizacion | BF16 (formato original), cuantizaciones adicionales no especificadas |
| Idiomas soportados | Ingles |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura hibrida que combina capas Mamba-2 (modelos de espacio de estados) con capas MLP y unicamente cuatro capas de atencion tradicional. Esta combinacion permite un procesamiento eficiente de secuencias largas con un coste computacional inferior al de un transformer puro, manteniendo la capacidad de atender a informacion relevante mediante las capas de atencion residuales.

El entrenamiento se realizo desde cero, con datos de corte en septiembre de 2024, y posteriormente se comprimio desde el modelo NVIDIA-Nemotron-Nano-9B-v2 usando el framework Nemotron. El proceso de post-entrenamiento incluyo multiples datasets especializados de NVIDIA: Nemotron-Post-Training-Dataset-v2 para el ajuste general, Nemotron-Science-v1 para razonamiento cientifico, Nemotron-Instruction-Following-Chat-v1 para seguimiento de instrucciones, Nemotron-Agentic-v1 para capacidades de agente, Nemotron-Competitive-Programming-v1 para programacion competitiva, Nemotron-Math-Proofs-v1 para pruebas matematicas y varios datasets de RL (reinforcement learning) para agentes conversacionales, uso de herramientas, calendarizacion y salida estructurada.

El modelo soporta un modo de razonamiento que se activa mediante system prompt. En este modo, genera primero una traza de razonamiento y despues la respuesta final, lo que mejora la precision en problemas complejos. Si se desactiva el razonamiento, la respuesta es directa pero con una ligera perdida de exactitud en tareas dificiles.

## Capacidades

- Generacion de texto con razonamiento explicito: puede generar trazas de razonamiento antes de la respuesta final, activable mediante system prompt.
- Razonamiento matematico: resultados destacados en AIME 2025 (78.5) y MATH500 (95.4) en modo razonamiento.
- Generacion de codigo: soporta programacion competitiva (LCB 51.8) y tareas de codificacion general.
- Tool calling / function calling: soporte para uso de herramientas, evaluado con BFCL v3 (61.1).
- Capacidades de agente: entrenado con datasets agenticos y RL para conversaciones multi-turno con uso de herramientas.
- Seguimiento de instrucciones: IFEval-Prompt 87.9 e IFEval-Instruction 92 en modo razonamiento.
- Capacidades multilingues: solo ingles.
- Razonamiento cientifico: GPQA 53.2, orientado a preguntas de nivel de posgrado en ciencias.
- Modo sin razonamiento: puede configurarse para responder directamente sin trazas de razonamiento.

## Casos de uso

- NPCs de videojuegos: el modelo puede generar dialogos y comportamientos realistas para companeros o rivales en juegos, con baja latencia en hardware edge como Jetson Thor o GeForce RTX. Su modo de razonamiento permite decisiones mas coherentes con el contexto del juego.

- Asistentes de voz locales: integrable en aplicaciones de voz para dispositivos, aprovechando su bajo coste de inferencia para respuestas rapidas en tiempo real. El soporte de tool calling permite conectarlo a APIs de calendario, recordatorios o control de dispositivos IoT.

- Automatizacion IoT: el modelo puede procesar instrucciones en lenguaje natural y generar comandos estructurados para automatizar tareas en sistemas domoticos o industriales, gracias a su entrenamiento en salida estructurada.

- Agentes de atencion al cliente: su capacidad de tool calling y su entrenamiento agentico le permiten gestionar conversaciones multi-turno, consultar bases de datos y ejecutar acciones en sistemas externos, con la ventaja de poder desplegarse en local para reducir latencia y costes.

- Generacion de codigo en produccion: puede integrarse en pipelines de CI/CD para generar tests, documentacion o incluso codigo de funciones, con la ventaja de su bajo uso de recursos para ejecutarse en maquinas de desarrollo o servidores modestos.

- Razonamiento cientifico asistido: para investigadores que necesitan ayuda con problemas de ciencias (GPQA 53.2), el modelo puede razonar paso a paso sobre cuestiones de fisica, quimica o biologia, aunque con la precaucion de verificar siempre sus respuestas.

## Benchmarks y rendimiento

Los resultados fueron publicados por NVIDIA en la model card. Se evaluo en dos modos: razonamiento activado y desactivado.

### Modo razonamiento desactivado

| Benchmark | NVIDIA-Nemotron-3-Nano-4B-BF16 |
|---|---|
| BFCL v3 | 61.1 |
| IFBench-Prompt | 43.2 |
| IFBench-Instruction | 44.2 |
| Orak | 22.9 |
| IFEval-Prompt | 82.8 |
| IFEval-Instruction | 88 |
| HaluEval | 62.2 |
| RULER (128k) | 91.1 |
| Tau2-Airline | 28.0 |
| Tau2-Retail | 34.8 |
| Tau2-Telecom | 24.9 |
| EQ-Bench3 | 63.2 |

### Modo razonamiento activado

| Benchmark | NVIDIA-Nemotron-3-Nano-4B-BF16 |
|---|---|
| AIME25 | 78.5 |
| MATH500 | 95.4 |
| GPQA | 53.2 |
| LCB | 51.8 |
| BFCL v3 | 61.1 |
| IFEval-Prompt | 87.9 |
| IFEval-Instruction | 92 |
| Tau2-Airline | 33.3 |
| Tau2-Retail | 39.8 |
| Tau2-Telecom | 33 |

Las evaluaciones se realizaron con NeMo-Skills y Orak (para tres juegos: Super Mario, Darkest Dungeon y StarDew Valley). No se han publicado comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 7,95 GB (3,97B parametros x 2 bytes). Con cuantizacion a 8 bits, se reduce a unos 4 GB, y a 4 bits, a unos 2 GB.
- GPU recomendadas: puede ejecutarse en GPUs consumer como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB), y en plataformas edge como Jetson Thor o DGX Spark.
- En consumer GPU: cabe en GPU de gama media con 8 GB de VRAM si se cuantiza a 8 bits, y en GPU de 6 GB con cuantizacion de 4 bits.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp, Ollama y TGI (no se especifica explicitamente, pero por su formato safetensors y compatibilidad con transformers es compatible con estos motores).
- Latencia y throughput: no se han publicado datos especificos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas por NVIDIA con otros modelos de tamano similar. Como referencia orientativa, se pueden considerar los siguientes modelos de la misma categoria (SLMs de 3-4B):

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| NVIDIA-Nemotron-3-Nano-4B | 3,97B | 128k (evaluado) | Hibrida Mamba-2 + Attention | NVIDIA Nemotron Open Model License |
| Qwen2.5-4B-Instruct | 4B | 128k | Transformer denso | Apache 2.0 |
| Llama-3.2-3B | 3,2B | 128k | Transformer denso | Llama 3.2 License |
| Ministral-4B | 4B | 128k | Transformer denso | Mistral AI Non-Production License |

La comparativa completa no se puede establecer con datos verificados de benchmarks comunes (MMLU, HumanEval, GSM8K) porque no se han publicado en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta ingles: no es util para aplicaciones multilinguees ni para generacion de contenido en otros idiomas.
- Riesgo de alucinacion: aunque HaluEval muestra 62.2, no es un valor especialmente alto, lo que indica un riesgo moderado de alucinacion en contextos abiertos.
- El modo de razonamiento desactivado reduce la precision en tareas complejas: para problemas que requieren razonamiento, es recomendable mantener el modo activado.
- Licencia de uso comercial: la NVIDIA Nemotron Open Model License permite uso comercial, pero es necesario revisar los terminos completos para verificar restricciones especificas.
- Datos de entrenamiento con corte en septiembre de 2024: el modelo no conoce eventos posteriores a esa fecha.
- No se han publicado datos sobre sesgos demograficos o culturales en la informacion disponible.
- La capacidad de razonamiento cientifico (GPQA 53.2) es limitada en comparacion con modelos de mayor tamano, por lo que no debe usarse como unica fuente para decisiones cientificas criticas.
- Para produccion, se recomienda evaluar el rendimiento en el dominio especifico de la aplicacion antes del despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Blog de presentacion: https://huggingface.co/blog/nvidia/nemotron-3-nano-4b
- Pagina del modelo Nemotron 3: https://research.nvidia.com/labs/nemotron/Nemotron-3/
- Pagina de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper Nemotron Elastic: https://arxiv.org/pdf/2511.16664
- Paper Nemotron-H: https://arxiv.org/abs/2504.03624
- NeMo-Skills: https://github.com/NVIDIA/NeMo-Skills/tree/main/docs
- Orak: https://github.com/krafton-ai/Orak
