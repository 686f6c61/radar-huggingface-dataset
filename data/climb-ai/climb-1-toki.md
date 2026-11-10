# Climb-Ai/Climb-1-Toki

## Resumen

Climb 1 Toki es un modelo de lenguaje ultraligero desarrollado por Climb-Ai (Kulupu BBTeam) especificamente para toki pona, una lengua construida de vocabulario minimo. Con aproximadamente 2,85 millones de parametros unicos (3,05 millones en almacenamiento sin pesos atados), se posiciona como un micro-LLaMA orientado a generacion de texto conversacional en un unico idioma.

El modelo emplea una arquitectura transformer tipo LLaMA con 6 capas, dimension oculta de 192, 6 cabezas de atencion y dimension MLP de 512. Su ventana de contexto es de solo 256 tokens y su vocabulario de 1.024 tokens Byte-Level BPE incluye corchetes nativos para los cartuchos de toki pona. Fue entrenado en dos fases: preentrenamiento causal sobre aproximadamente 1.006.000 tokens de literatura en toki pona y un ajuste supervisado (SFT) para alineacion conversacional multi-turno.

Su relevancia es acotada pero clara: demuestra que es posible entrenar un modelo funcional para una lengua de bajos recursos con un presupuesto computacional minimo, y ofrece un punto de partida reproducible para experimentacion en modelos de juguete, docencia e investigacion sobre tokenizacion y alineacion en idiomas minoritarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Micro-LLaMA (transformer decoder-only con Rotary Embeddings, SwiGLU y RMSNorm) |
| Parametros totales | 2.853.312 unicos con pesos atados; 3.049.920 en almacenamiento sin atar (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | GGUF pre-cuantizado disponible en repositorio separado; niveles concretos no disponibles |
| Idiomas soportados | toki pona (tok) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch (pytorch_model.bin), GGUF |

Especificaciones adicionales de arquitectura: 6 capas, hidden dim 192, 6 cabezas de atencion (dimension por cabeza 32), MLP dim 512, vocabulario de 1.024 tokens Byte-Level BPE con corchetes de cartucho nativos.

## Arquitectura y entrenamiento

Climb 1 Toki es un transformer decoder-only de estilo LLaMA con normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). Su tamano reducido (6 capas, 192 de dimension oculta) lo situa en la categoria de micro-modelos, disenados para ejecutarse en CPU o en GPU de gama baja. El tokenizador es un Byte-Level BPE de 1.024 tokens que incorpora de forma nativa los corchetes `[ ]` usados como cartuchos en la escritura de toki pona.

El entrenamiento se realizo en dos etapas. La primera consistio en modelado de lenguaje causal sobre aproximadamente 3,26 MB (unos 1.006.000 tokens) de literatura en toki pona, combinando tres fuentes: `Climb-Ai/toki-pona-tiny-dialogues`, `NetherQuartz/wikipesija` (2.901 articulos de la Wikipedia en toki pona) y `finnnnnnnnnnn/toki-pona-sentences` (19.094 frases de *lipu tenpo*). La segunda etapa fue un ajuste supervisado (SFT) con cadenas de conversacion multi-turno, enmascaramiento de perdida sobre el historial, anclaje de persona (Climb 1 Toki, Kulupu BBTeam), calibracion gramatical, capitalizacion estricta de frases y espaciado limpio de puntuacion. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en toki pona con formato de prompt `<|user|> ... <|bot|>`.
- Dialogo multi-turno con historial enmascarado durante el entrenamiento.
- Anclaje de persona e identidad (Climb 1 Toki, Kulupu BBTeam).
- Calibracion gramatical y de puntuacion especifica del idioma.
- Manejo nativo de cartuchos `[ ]` en la tokenizacion.
- Generacion autoregresiva basica con parada por token `<|endoftext|>`.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Experimentacion educativa en NLP: sirve para ilustrar el ciclo completo de preentrenamiento y SFT sobre un corpus de un solo idioma, con un coste computacional minimo y un codigo de inferencia de pocas lineas.
- Generacion de texto en toki pona para comunidades de la lengua: respuestas conversacionales breves dentro de la ventana de 256 tokens, adecuadas para chats simples o demos.
- Pruebas de tokenizacion de lenguas construidas: su vocabulario de 1.024 tokens con soporte de cartuchos permite estudiar el impacto del diseno del tokenizador en idiomas de vocabulario reducido.
- Despliegue en entornos con recursos muy limitados: al ocupar unos pocos megabytes, puede ejecutarse en CPU, Raspberry Pi o navegador mediante llama.cpp y GGUF.
- Base para fine-tuning de variantes: su licencia Apache 2.0 y su tamano permiten reentrenar o adaptar el modelo a otros corpus pequenos de lenguas de bajos recursos.
- Docencia sobre alineacion conversacional: el uso de enmascaramiento de historial y anclaje de persona ofrece un ejemplo concreto de SFT multi-turno en un modelo diminuto.
- Integracion en Open WebUI: el repositorio GGUF asociado esta preparado para usarse con llama.cpp y Open WebUI, lo que facilita demos locales de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los formatos; los pesos en precision completa rondan los 12 MB (3,05 M parametros en fp32) y menos de 6 MB en fp16.
- GPU recomendadas: cualquier GPU moderna, incluidas GTX 1050, RTX 3050 o superiores; el modelo no requiere GPU dedicada.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en CPU integrada.
- Opciones de despliegue: llama.cpp y Open WebUI mediante el repositorio GGUF, PyTorch con el codigo de inferencia incluido en la model card, y potencialmente Ollama a partir del GGUF.
- Latencia y throughput estimados: no disponible; por el tamano del modelo, la generacion en CPU deberia ser interactiva, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Climb 1 Toki | 2,85 M (3,05 M sin atar) | 256 | toki pona | Apache 2.0 | Hugging Face (safetensors, PyTorch, GGUF) |
| TinyLlama | 1,1 B | 2.048 | multilingue (predominantemente ingles) | Apache 2.0 | Hugging Face |
| SmolLM-135M | 135 M | 2.048 | ingles | Apache 2.0 | Hugging Face |
| Modelos especificos de toki pona | no disponible | no disponible | toki pona | no disponible | no disponible |

La comparativa con TinyLlama y SmolLM es meramente dimensional: ambos son ordenes de magnitud mayores y no estan especializados en toki pona. No se dispone de informacion sobre otros modelos comparables entrenados especificamente para toki pona.

## Limitaciones y advertencias

- Ventana de contexto de solo 256 tokens, insuficiente para documentos largos o conversaciones extensas.
- Entrenado exclusivamente en toki pona; no comprende ni genera otros idiomas de forma fiable.
- Corpus de entrenamiento muy pequeno (aproximadamente 1 millon de tokens), lo que incrementa el riesgo de alucinacion y de repeticion.
- Capacidad de razonamiento, matematicas y codigo practicamente nula por su escala.
- Sin soporte de tool calling, agentes ni multimodalidad.
- Posibles sesgos derivados de las fuentes (Wikipedia en toki pona, *lipu tenpo* y dialogos sinteticos), no documentados por el autor.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado para produccion real dada su calidad y alcance limitados.
- No se han publicado evaluaciones cuantitativas que permitan estimar su calidad objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Climb-Ai/Climb-1-Toki
- GGUF pre-cuantizado: https://huggingface.co/Climb-Ai/Climb-1-Toki-GGUF
- Dataset de dialogos: https://huggingface.co/datasets/Climb-Ai/toki-pona-tiny-dialogues
- Dataset wikipesija: https://huggingface.co/datasets/NetherQuartz/wikipesija
- Dataset de frases: https://huggingface.co/datasets/finnnnnnnnnnn/toki-pona-sentences
