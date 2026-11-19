# dev-sandakelum/fable-mini

## Resumen

fable-mini es un transformer decoder-only de 3.285.504 parametros entrenado desde cero por el desarrollador independiente dev-sandakelum. Se trata de un modelo educativo en miniatura que imita el registro estilistico de un asistente conversacional, no un asistente funcional. Su proposito es demostrar un pipeline completo de LLM (tokenizacion, implementacion del transformer, bucle de entrenamiento, evaluacion y empaquetado en Hugging Face) con un coste computacional que permite entrenarlo en minutos sobre la CPU de un portatil.

La arquitectura es un transformer pre-LN de 4 capas, hidden size 256, 4 cabezas de atencion (dimension 64), FFN de 768, activacion GELU, posiciones absolutas aprendidas, QKV fusionado sin bias y embeddings de entrada/salida atados. La longitud de contexto es de 512 tokens y el tokenizador es un BPE a nivel de byte con vocabulario de 2.048 (256 bytes + 1.789 merges + 3 especiales), entrenado solo sobre el split de entrenamiento.

Es relevante ahora como material didactico y como banco de pruebas de integracion con Hugging Face: el autor es explicito al advertir que el modelo no aprendio a responder preguntas ni a producir frases coherentes, y publica cifras de evaluacion honestas (perplejidad de validacion 64,07). No debe confundirse con un asistente de produccion ni con "Fable 5.2"; el nombre alude al estudio de estilo, no a una capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only pre-LN (4 capas, hidden 256, 4 cabezas, FFN 768, GELU, posiciones absolutas aprendidas, QKV fusionado sin bias, embeddings atados) |
| Parametros totales | 3.285.504 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32 safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32) |
| Vocabulario | 2.048 tokens (byte-level BPE) |
| Tokens especiales | `<|pad|>`=256, `<|eos|>`=257, `<|doc|>`=258 (separador de documento y BOS) |
| Libreria | transformers (requiere `trust_remote_code=True`, `custom_code`) |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con normalizacion previa a cada subcapa (pre-LN). Consta de 4 capas, hidden size de 256, 4 cabezas de atencion de dimension 64, FFN de 768 y activacion GELU. Usa posiciones absolutas aprendidas, un proyector QKV fusionado sin bias y embeddings de entrada y salida atados; el peso del LM head se almacena una sola vez (`tok_emb.weight`) y se reata al cargar. La generacion con `model.generate()` soporta `temperature`, `top_p`, `top_k`, `max_new_tokens` y `repetition_penalty`, con cache KV.

El entrenamiento se realizo exclusivamente sobre CPU con AdamW (lr pico 3e-4, warmup de 100 pasos, decaimiento coseno hasta el 10%, gradiente clip 1.0, batch de 8x512 tokens), sumando unos 750 pasos en dos ejecuciones: 600 pasos base y 150 de reanudacion con las conversaciones sinteticas ponderadas 6x para reforzar el registro conversacional. El corpus son 18 documentos en el repositorio (split 90/10 a nivel de documento, semilla 42): un documento de referencia de "Claude Fable 5.1" de unos 270 KB, 5 documentos de investigacion y diseno del proyecto y 11 ficheros cortos de dialogo sintetico estilo Fable. No se uso scraping web ni datasets externos. No hay RLHF, DPO ni alineacion de ningun tipo.

## Capacidades

- Generacion de texto autoregresiva con decodificacion configurable (temperature, top_p, top_k, repetition_penalty) y cache KV.
- Plantilla de chat funcional a nivel mecanico: renderiza turnos `User:`/`Assistant:` y detiene la generacion con `<|eos|>`.
- Cobertura completa de bytes mediante BPE a nivel de byte: no existe token `<|unk|>`, todo byte tiene un id asignado.
- Imitacion del registro estilistico de un asistente conversacional (tono y estructura de turnos), sin contenido semantico coherente.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision, audio ni ninguna capacidad multimodal.
- Multilingue: no; entrenado solo en ingles.

## Casos de uso

- Docencia de pipelines de LLM: permite recorrer de principio a fin el entrenamiento de un tokenizador BPE, la implementacion de un transformer y el bucle de entrenamiento en una sola sesion de portatil, con un modelo que cabe en cualquier equipo.
- Pruebas unitarias de integracion con Hugging Face: sirve para validar codigo de carga con `trust_remote_code`, plantillas de chat, generacion con cache KV y manejo de tokens especiales sin consumir recursos de GPU.
- Experimentacion con estrategias de decodificacion: al ser un modelo diminuto y rapido, permite comparar temperature, top_p, top_k y repetition_penalty de forma sistematica y observar el efecto en la distribucion de salida.
- Estudio de sobreajuste y memorizacion: la brecha entre perdida de entrenamiento (3,6209) y validacion (4,1600) lo convierte en un caso practico para analizar como un corpus pequeno produce memorizacion y perplejidad optimista.
- Referencia para comparativas de escalado: sirve como punto de partida de bajo coste para contrastar curvas de aprendizaje, perplejidad y calidad de generacion frente a modelos mayores con el mismo pipeline.
- Validacion de empaquetado y publicacion en el Hub: util para probar flujos de subida de safetensors, model cards, metadatos y carga remota antes de aplicarlos a modelos de mayor tamano.

## Benchmarks y rendimiento

| Split | Loss | Perplejidad |
|---|---|---|
| train | 3,6209 | 37,37 |
| val | 4,1600 | 64,07 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La perplejidad indicada corresponde exclusivamente al corpus del proyecto, no a lenguaje general; el autor advierte que el split de validacion comparte genero y fraseo con los dialogos ponderados del entrenamiento, por lo que la cifra de 64,07 favorece algo al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para los 3,28 M de parametros, mas el overhead de activaciones y cache KV; cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; el modelo se entreno solo en CPU y funciona en cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) sin aprovechar su capacidad.
- Cabe en consumer GPU: si, en todas; tambien en Raspberry Pi y entornos sin GPU.
- Opciones de despliegue: transformers con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el uso de `custom_code` complica su conversion directa a GGUF.
- Latencia y throughput: no disponibles de forma medida; por tamano, la generacion de decenas de tokens es del orden de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| fable-mini | 3,28 M | 512 | Apache 2.0 | Educativo, desde cero, solo ingles |
| GPT-2 small | 124 M | 1.024 | MIT | Modelo de referencia preentrenado en ingles |
| TinyLlama 1.1B | 1,1 B | 2.048 | Apache 2.0 | LLM pequeno con entrenamiento a gran escala |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | LLM pequeno orientado a dispositivos |

La comparativa es asimetrica por diseno: fable-mini es dos ordenes de magnitud menor que los modelos de su categoria mas cercana y no persigue calidad de lenguaje, sino demostrar el pipeline completo con un corpus de unos cientos de KB. Frente a GPT-2 small o SmolLM-135M no es un sustituto funcional; su valor esta en la trazabilidad total del proceso de entrenamiento y en el coste practicamente nulo de ejecucion.

## Limitaciones y advertencias

- No es un chatbot: las salidas son ensalada de palabras que imita el registro de entrenamiento; no responde preguntas, no sigue instrucciones y no mantiene un tema.
- No existe comportamiento de seguridad: no tiene capacidad de rechazo, calibracion ni entrenamiento de alineacion; no debe usarse en ningun escenario real.
- Riesgo alto de alucinacion y de texto incoherente por construccion; no es apto para produccion bajo ninguna circunstancia.
- Memorizacion sustancial: la brecha train/val (3,62 frente a 4,16) indica que parte de la salida reproduce el corpus de entrenamiento.
- Limitaciones de idioma y contexto: solo ingles, ventana de 512 tokens y vocabulario de 2.048 tokens.
- Licencia Apache 2.0 permite uso comercial del codigo y pesos, pero el modelo carece de utilidad practica y de cualquier garantia; el autor desaconseja explicitamente su uso real.
- No esta afiliado ni respaldado por Anthropic; el nombre "Fable" alude al estudio de estilo y no a una capacidad equivalente a "Fable 5.2" ni a ningun asistente de produccion.
- Requiere `trust_remote_code=True` por el codigo personalizado (`custom_code`), lo que implica ejecutar codigo del autor al cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dev-sandakelum/fable-mini
- Repositorio GitHub del proyecto: https://github.com/gghsff07-sudo/my_claude
- Evaluacion detallada: https://github.com/gghsff07-sudo/my_claude/blob/main/EVAL.md
