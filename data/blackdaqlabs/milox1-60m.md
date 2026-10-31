# blackdaqlabs/MiloX1-60M

## Resumen

MiloX1-60M es un modelo de lenguaje conversacional de 62 millones de parámetros desarrollado por blackdaqlabs y preentrenado desde cero, es decir, sin reutilizar pesos de ningún modelo previo. Se trata de un Transformer decoder que adopta la arquitectura Llama (RMSNorm, RoPE, SwiGLU y GQA), afinado posteriormente para funcionar como asistente conversacional bajo el nombre de "Milo". El modelo está disponible en Hugging Face en formato safetensors y es compatible con la librería Transformers.

Su principal valor es didáctico y experimental: demuestra que es posible entrenar un modelo conversacional bilingüe (español e inglés) desde cero con recursos limitados, usando un tokenizador BPE byte-level propio de 16.384 tokens. Con una ventana de contexto de solo 1024 tokens, no compite con modelos comerciales ni con LLM abiertos de tamaño medio, sino que sirve como base de estudio, prueba de concepto y punto de partida para experimentos de preentrenamiento a pequeña escala.

Relevancia actual: en un ecosistema dominado por modelos de miles de millones de parámetros, los modelos "from scratch" de decenas de millones de parámetros son útiles para investigar el proceso completo de entrenamiento (tokenizador, preentrenamiento, fine-tuning conversacional), para ejecutar inferencia en hardware muy modesto y como material educativo para la comunidad hispanohablante de IA open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (RMSNorm + RoPE + SwiGLU + GQA) |
| Parametros totales | 61.864.320 (~62M) |
| Parametros activos | no es un modelo MoE (todos los parámetros activos) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | español (es) e inglés (en) |
| Licencia | other (sin especificar; el autor indica revisar las licencias de los datasets antes de fijar la licencia final) |
| Formato de pesos | safetensors (repo de ~0,4 GB) |

Datos adicionales:

| Parametro | Valor |
|---|---|
| Vocabulario | 16.384 tokens (BPE byte-level propio) |
| Formato de chat | `<\|system\|>`, `<\|user\|>`, `<\|assistant\|>` con terminador `<\|end\|>` (incluido como `chat_template`) |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

MiloX1-60M es un Transformer decoder unicamente (arquitectura causal) que adopta los componentes modernos de la familia Llama: normalizacion RMSNorm pre-atencion, codificacion posicional rotatoria (RoPE), activacion SwiGLU en el MLP y Grouped Query Attention (GQA) para reducir el coste de la atencion y el tamano de la cache KV. El tokenizador es un BPE byte-level entrenado desde cero, con un vocabulario reducido de 16.384 tokens, lo que reduce el tamano del embedding y, por tanto, del modelo total, a cambio de secuencias algo mas largas.

El modelo fue preentrenado desde cero (sin inicializar desde pesos ajenos) y posteriormente afinado para conversacion en espanol e ingles. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO: no disponible. Tampoco se especifican numero de capas, dimension oculta ni numero de cabezas de atencion.

## Capacidades

- Generacion de texto conversacional en espanol e ingles, con formato de chat estructurado mediante plantilla (`chat_template` incluida en el tokenizador).
- Soporte de mensajes de sistema, usuario y asistente (`<|system|>`, `<|user|>`, `<|assistant|>`).
- Muestreo configurable (temperature, top_p, top_k) mediante `model.generate` de Transformers.
- Compatibilidad con la infraestructura estandar de Hugging Face (text-generation-inference, Endpoints).
- No hay evidencia de capacidades de vision, audio, tool calling, function calling ni razonamiento multi-paso: no disponible.
- Por su tamano (62M), no es adecuado para razonamiento complejo, codigo avanzado ni matematicas: se trata de un modelo de demostracion.

## Casos de uso

- Material educativo y docencia: sirve como ejemplo completo y verificable de un LLM entrenado desde cero (tokenizador propio, preentrenamiento, fine-tuning conversacional), util en cursos y talleres de IA generativa.
- Experimentacion con arquitecturas Llama: al ser pequeno, permite ablations rapidos (cambios en RoPE, GQA, vocabulario) en una sola GPU de consumo o incluso CPU.
- Prototipado de chatbots simples en espanol: puede gestionar conversaciones cortas de un turno o pocos turnos dentro de su ventana de 1024 tokens, util para demos y pruebas de concepto de interfaz.
- Pruebas de infraestructura de inferencia: su peso de ~0,4 GB lo hace ideal para validar pipelines de despliegue (Endpoints, TGI, scripts de Transformers) sin coste computacional significativo.
- Estudio de tokenizadores BPE byte-level: el vocabulario propio de 16.384 tokens permite analizar el compromiso entre tamano de vocabulario y longitud de secuencia en texto bilingue espanol-ingles.
- Base para fine-tuning ligero: se puede continuar el entrenamiento o afinar con LoRA sobre dominios concretos con recursos minimos, aprovechando que ya conversa en espanol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32/bf16): ~0,25-0,5 GB para los pesos, mas overhead de runtime; en la practica, menos de 1 GB de VRAM.
- Cabe sobradamente en cualquier GPU de consumo (incluso GTX 1050 o integradas) y es plenamente ejecutable en CPU dada su escala de 62M de parametros.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna acelera la generacion, pero no es necesaria. No se necesitan A100, H100 ni RTX 4090.
- Despliegue: Transformers (codigo de ejemplo en la model card), text-generation-inference y Hugging Face Endpoints (segun tags del repo). No hay evidencia de soporte oficial en llama.cpp, Ollama, vLLM o TGI: no disponible.
- Latencia y throughput: no disponible; por tamano y contexto, se espera inferencia interactiva incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MiloX1-60M (blackdaqlabs) | 62M | 1024 | es, en | other (por definir) | Conversacional from scratch, educativo |
| SmolLM2-135M (HuggingFaceTB) | 135M | 2048 | principalmente en | Apache 2.0 | Modelo pequeno de proposito general |
| Qwen2.5-0.5B-Instruct | 500M | ~32k | multilingue (incluye es) | Apache 2.0 | Asistente instruido compacto |

Frente a estas alternativas, MiloX1-60M es notablemente mas pequeno y limitado en capacidad y contexto, pero se distingue por su entrenamiento desde cero con tokenizador propio y su foco bilingue espanol-ingles, algo poco habitual en modelos de esta escala. Para produccion conversacional real, los modelos de 135M-500M citados ofrecen rendimiento claramente superior.

## Limitaciones y advertencias

- El propio autor advierte en la model card: es un modelo muy pequeno que puede equivocarse, inventar datos (alucinar) o repetirse; no debe usarse para decisiones importantes.
- Ventana de contexto de solo 1024 tokens: limita conversaciones largas y documentos extensos.
- Capacidades muy limitadas en razonamiento, codigo y matematicas por su escala (62M parametros).
- La licencia figura como "other" y el autor indica expresamente que hay que revisar las licencias de los datasets de preentrenamiento y fine-tuning antes de fijar la licencia final: el uso comercial no esta garantizado hasta entonces.
- No hay benchmarks publicados ni evaluaciones independientes: el rendimiento real esta sin cuantificar.
- Riesgo de sesgos heredados de los datos de preentrenamiento, sin detalle publico sobre su composicion ni sobre medidas de mitigacion.
- Descargas muy bajas (624) y cero likes en el momento de redactar la ficha: falta validacion comunitaria y auditoria de seguridad; revisa el codigo y los pesos antes de cualquier uso mas alla de experimentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blackdaqlabs/MiloX1-60M
- Paper, repositorio de entrenamiento y demos: no disponible
