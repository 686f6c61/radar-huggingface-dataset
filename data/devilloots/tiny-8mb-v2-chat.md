# devilloots/tiny-8mb-v2-chat

## Resumen

Tiny8MB v2 Chat es un modelo de lenguaje de tipo decoder-only Transformer desarrollado por el usuario devilloots y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo extremadamente pequeno, con 3.868.928 parametros, entrenado desde cero (from scratch) en dos GPUs Tesla T4 en apenas 119,2 segundos. Su interes no reside en la competicion con modelos de gran escala, sino en servir como referencia didactica y de investigacion sobre arquitecturas modernas implementadas a minima escala.

El modelo emplea un diseno contemporaneo de transformer: RMSNorm, activacion SwiGLU, Grouped-Query Attention (GQA) con 8 cabezas de consulta y 2 de clave/valor, y embeddings rotatorios (RoPE). Cuenta con 4 capas, una dimension de modelo de 256, un tamano de MLP de 704 y una longitud de bloque de 192 tokens. El tokenizador es un BPE de 4.096 tokens.

Su relevancia actual es acotada pero clara: permite experimentar con tecnicas de entrenamiento, cuantizacion e inferencia en hardware muy modesto, y ofrece una referencia publica de un pipeline completo de preentrenamiento y ajuste supervisado (SFT) reproducible en minutos. No esta pensado para produccion ni para tareas de razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RMSNorm + SwiGLU + GQA + RoPE) |
| Parametros totales | 3.868.928 (embeddings con pesos atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 192 tokens (block_size) |
| Tipos de cuantizacion | no disponible (checkpoint en FP16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (FP16, ~9,85 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 4 capas con `d_model=256`, `mlp_dim=704` y `block_size=192`. Incorpora RMSNorm en lugar de LayerNorm, SwiGLU como activacion en la MLP, Grouped-Query Attention con 8 cabezas de consulta y 2 de clave/valor, y RoPE para la codificacion posicional. Los embeddings de entrada y la proyeccion de salida comparten pesos (weight tying), lo que explica el recuento de parametros. El tokenizador es un BPE de 4.096 tokens.

El entrenamiento se realizo desde cero en dos GPUs Tesla T4 y consto de dos etapas: un preentrenamiento (Stage 1 Pretrain) con perdida final de 1,881 y un ajuste supervisado equilibrado (Stage 2 Balanced SFT) con perdida de 1,010. El proceso completo duro 119,2 segundos. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto basica en formato conversacional (chat), tras el ajuste SFT.
- Respuesta a preguntas de cultura general y ciencia a nivel elemental.
- Seguimiento de instrucciones simples.
- Generacion de fragmentos de codigo y respuesta a preguntas de informatica basicas.
- Mantenimiento de contexto multi-turno muy limitado (ventana de 192 tokens).
- Generacion de historias cortas con fluidez relativa.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido.
- No se documenta soporte multimodal (vision, audio) ni capacidades multilingues verificadas.

## Casos de uso

- Docencia y aprendizaje de arquitecturas transformer: el modelo sirve para ilustrar de forma tangible como funcionan RMSNorm, SwiGLU, GQA y RoPE en un checkpoint de menos de 10 MB que se entrena en minutos.
- Experimentacion con tecnicas de entrenamiento: permite probar variaciones de learning rate, schedulers o composicion de datos sin coste de computo significativo, dado su entrenamiento de 119 segundos en 2x T4.
- Pruebas de pipelines de inferencia: util para validar integraciones con frameworks de serving o scripts propios antes de escalar a modelos mayores, gracias a su reducido tamano.
- Generacion de texto de relleno y prototipos: adecuado para maquetar interfaces de chat o demos donde la calidad del contenido no es critica.
- Investigacion sobre cuantizacion extrema: su tamano permite explorar tecnicas de compresion y medir su impacto en un modelo de referencia minimo.
- Educacion sobre tokenizacion: el tokenizador BPE de 4.096 tokens permite estudiar el comportamiento de la tokenizacion en un vocabulario pequeno y controlado.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al "220-Test Intelligence Index" definido por el propio autor:

| Metrica | Resultado |
|---|---|
| Strict Intelligence Index (195 tests duros) | 27,18 / 100 (53/195) |
| Overall Score (220 tests, incl. historias) | 30,91 / 100 (68/220) |
| Science & World QA | 45,7% |
| Instruction Following | 40,0% |
| Coding & CS | 34,3% |
| Context & Multi-Turn | 30,0% |
| Story Fluency | 60,0% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 (checkpoint de ~9,85 MB mas estados de activacion), por lo que cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el propio entrenamiento se realizo en 2x Tesla T4.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en GPUs integradas.
- Opciones de despliegue: al ser un checkpoint PyTorch `.pt` con arquitectura propia, requiere cargar el codigo del autor; no se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, la latencia seria del orden de milisegundos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tiny8MB v2 Chat | 3,87 M | 192 tokens | MIT | Hugging Face (PyTorch `.pt`) |
| TinyLlama 1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | Hugging Face, amplio ecosistema |
| SmolLM-135M | 135 M | 2.048 tokens | Apache 2.0 | Hugging Face, GGUF, llama.cpp |
| GPT-2 small | 124 M | 1.024 tokens | MIT | Hugging Face, amplio ecosistema |

La comparativa es orientativa: Tiny8MB v2 Chat es uno o dos ordenes de magnitud menor que las alternativas citadas y no compite en calidad. Su ventaja es el tamano minimo y el entrenamiento reproducible en minutos; su desventaja es la ausencia de ecosistema de despliegue y una ventana de contexto muy reducida.

## Limitaciones y advertencias

- Calidad de generacion muy limitada: con 3,87 M de parametros, las respuestas son basicas y propensas a errores factuales.
- Riesgo elevado de alucinacion: el modelo no dispone de conocimiento factual fiable.
- Ventana de contexto de solo 192 tokens, insuficiente para conversaciones o documentos de cierta longitud.
- Idiomas soportados no documentados; el entrenamiento parece orientado al ingles, sin garantias en castellano.
- Sesgos desconocidos: no se documenta la composicion del dataset ni procesos de mitigacion de sesgos.
- Sin soporte documentado en frameworks de serving estandar (vLLM, llama.cpp, Ollama, TGI), lo que complica su integracion en produccion.
- No apto para uso comercial en tareas criticas pese a la licencia MIT permisiva; la limitacion es practica, no legal.
- Los benchmarks publicados son propios del autor y no comparables con estandares de la industria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devilloots/tiny-8mb-v2-chat
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados al modelo.
