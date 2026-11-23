# kurisaxo/kotoba-slm-125m-ja

## Resumen

Kotoba-SLM 125M es un modelo de lenguaje de pequena escala (SLM) especializado en conversacion en japones, desarrollado desde cero por el autor independiente kurisaxo. Con 124.642.178 parametros reales (segun los pesos en safetensors) y una variante extendida de 140,9M, el modelo se presenta como un proyecto formativo reproducible: toda la pipeline (tokenizador, arquitectura y entrenamiento) esta implementada desde cero y disenada para completarse dentro de la cuota gratuita de GPU de Kaggle (2x T4, 30 horas semanales, sesiones de 12 horas maximo).

La propuesta tecnica central es lo que el autor denomina "Epistemic Routing": el modelo predice como primer token de respuesta una etiqueta `<|known|>` o `<|unknown|>`, de modo que cuando no dispone de informacion emite una declaracion explicita de desconocimiento en lugar de alucinar o rechazar mecanicamente. Ademas soporta dos registros estilisticos controlados por token (`<|style:polite|>` y `<|style:casual|>`).

Arquitectonicamente sigue el patron Deep & Narrow popularizado por SmolLM2 y MobileLLM: 30 capas con dimension oculta 576, GQA con 9 cabezas de query y 3 de key/value, QK-Norm para estabilidad en FP16 sobre Turing, RoPE, SwiGLU y pesos compartidos entre embedding y LM head. La ficha se redacta con la informacion limitada disponible en la model card y los metadatos de Hugging Face; muchos datos clave (licencia, benchmarks, composicion del corpus) no estan publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, Deep & Narrow (estilo SmolLM2/MobileLLM) |
| Parametros totales | 124.642.178 (variante estandar); 140,9M (variante extendida) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | japones (unico idioma documentado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Capas | 30 |
| Dimension oculta | 576 |
| Cabezas de atencion | GQA: 9 query / 3 key-value |
| Vocabulario | 32.000 tokens (Byte-Level BPE, NFC, sin `<unk>`) |
| Normalizacion | QK-Norm (estabilidad FP16 en T4) |
| Activacion | SwiGLU |
| Posicional | RoPE |
| Tokens especiales | `<|known|>`, `<|unknown|>`, `<|style:polite|>`, `<|style:casual|>` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con una configuracion "deep and narrow": 30 capas y solo 576 dimensiones ocultas. Esta relacion profundidad/ancho concentra mas del 85% de los parametros en las capas de contexto y control de dialogo, segun el autor, en lugar de en embeddings o proyecciones anchas. Emplea Grouped Query Attention con 9 cabezas de query y 3 de key/value, QK-Norm (necesaria para evitar desbordamientos en el producto interno de atencion al entrenar en FP16 sobre GPUs Turing T4), RoPE para codificacion posicional, SwiGLU como activacion y weight tying entre embedding y LM head. El tokenizador es un Byte-Level BPE de 32.000 tokens entrenado especificamente sobre un corpus japones de conversacion y cultura general, con normalizacion NFC y sin token `<unk>`.

El entrenamiento se realizo integramente desde cero dentro de la cuota gratuita de Kaggle (2x T4, 30 h/semana, sesiones de 12 h). El autor documenta una infraestructura de checkpointing de cinco capas para sobrevivir a los cortes de sesion: monitor de timeout software a las 11 h 15 min, captura de `SIGTERM`/`SIGINT`, guardado completo del estado (pesos, momentos de AdamW, scheduler WSD, GradScaler FP16, offset exacto de lectura del dataset y estado RNG), rotacion atomica de dos generaciones con verificacion SHA256 y reanudacion automatica multi-sesion mediante `pipeline_state.json` en Hugging Face Hub. No se publican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO; el control de estilo y de desconocimiento parece implementarse via tokens especiales aprendidos de forma supervisada, no mediante alineamiento por preferencias.

## Capacidades

- Generacion de texto conversacional en japones con contexto multi-turno.
- Clasificacion epistemica implicita: el primer token de respuesta es `<|known|>` o `<|unknown|>`, lo que permite enrutar la respuesta hacia una declaracion de desconocimiento natural en lugar de alucinar.
- Declaracion explicita de ignorancia con continuacion conversacional (p. ej. disculpa + pregunta de seguimiento), en lugar de rechazo mecanico.
- Control de estilo mediante token: registro formal (`<|style:polite|>`) y registro informal (`<|style:casual|>`).
- Cobertura de conversacion cotidiana, empatia y cultura general de nivel escolar (primaria y secundaria), segun la model card.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidad multilingue: no documentada; el modelo esta entrenado exclusivamente para japones.

## Casos de uso

- Chatbot de acompanamiento en japones para dominio cotidiano: el modelo mantiene conversacion multi-turno con registro formal o informal seleccionable por token, adecuado para asistentes de bienestar o compania donde el tono importa mas que el conocimiento factual.
- Filtro de abstención en pipelines RAG: usar la prediccion `<|known|>`/`<|unknown|>` como senal barata (125M parametros) para decidir si derivar la consulta a un modelo mayor o a un recuperador, reduciendo coste y alucinaciones en el sistema completo.
- Prototipado rapido y educacion: por su tamano y su pipeline completamente abierta (tokenizador, modelo y entrenamiento en el repo), sirve como referencia didactica para entender Deep & Narrow, GQA, QK-Norm y gestion de checkpoints en entornos con cuota limitada.
- Generacion de respuestas de relleno en japones para pruebas de integracion: util para validar interfaces conversacionales, latencia y formateo sin incurrir en costes de modelos grandes.
- Investigacion sobre calibracion epistemica: el par de tokens `<|known|>`/`<|unknown|>` permite experimentar con deteccion de incertidumbre y evaluar la correlacion entre la etiqueta predicha y la veracidad de la respuesta.
- Despliegue en dispositivos con recursos muy limitados (edge, CPU, GPUs de gama baja): con 125M parametros el modelo es viable en entornos donde un 7B no cabe, siempre que el caso de uso sea conversacion japonesa simple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 250 MB solo para pesos (124,6M x 2 bytes), mas overhead de activaciones y KV cache; en la practica, menos de 1 GB para contextos moderados.
- En cuantizacion de 8 bits: en torno a 125 MB de pesos; en 4 bits, en torno a 65 MB (estimaciones teoricas, no se publican pesos cuantizados oficiales).
- GPU recomendadas: cualquier GPU consumer moderna es sobrada; el modelo se entreno en T4 y cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. Tambien es viable en CPU para inferencia de baja concurrencia.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM, e incluso en placas integradas con suficiente RAM.
- Opciones de despliegue: `transformers` con safetensors de forma nativa; para llama.cpp/Ollama seria necesario convertir a GGUF (no se publica conversion oficial). vLLM y TGI son compatibles en principio por ser un transformer decoder-only estandar, aunque no se documenta soporte verificado.
- Latencia y throughput: no disponibles; por el tamano, se espera throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Kotoba-SLM 125M | 124,6M | no disponible | japones | no disponible | Enfoque en absteción epistemica y estilo; entrenado desde cero en Kaggle |
| SmolLM2-135M | 135M | 8.192 tokens (segun documentacion publica de SmolLM2) | principalmente ingles | Apache 2.0 (segun documentacion publica) | Referencia arquitectonica del diseno Deep & Narrow; no especializado en japones |
| MobileLLM-125M | 125M | no disponible en esta ficha | principalmente ingles | licencia de investigacion (verificar en el repo original) | Inspiracion del patron deep & narrow; orientado a eficiencia en dispositivo |
| Qwen2.5-0.5B | 494M | 32.768 tokens (segun documentacion publica) | multilingue, incluye japones | Apache 2.0 (segun documentacion publica) | Alternativa mayor con mejor cobertura multilingue y contexto largo |

La comparacion con SmolLM2 y MobileLLM es pertinente por compartir familia arquitectonica, pero Kotoba-SLM se diferencia por el entrenamiento exclusivo en japones y por el mecanismo de tokens epistemicos. Frente a Qwen2.5-0.5B, Kotoba-SLM es cuatro veces menor y carece de contexto largo documentado, por lo que la eleccion depende de si se prioriza el comportamiento de absteción o la capacidad bruta.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin terminos explicitos no hay garantia de uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Modelo de 125M parametros: capacidad de conocimiento factual muy limitada; fuera del dominio conversacional cotidiano y de cultura general basica, la calidad decae con rapidez.
- Longitud de contexto no documentada: no es posible planificar aplicaciones con documentos largos o historiales extensos sin medir empiricamente el limite efectivo.
- Riesgo de alucinacion residual: aunque el mecanismo `<|known|>`/`<|unknown|>` esta disenado para mitigarla, no hay benchmarks publicados que cuantifiquen su tasa de acierto en la clasificacion epistemica ni su calibracion.
- Sesgos: no se documenta la composicion del corpus de entrenamiento, por lo que no se pueden evaluar sesgos de genero, culturales o politicos; al ser un corpus japones, los sesgos culturales estaran alineados con esa procedencia.
- Monolingue: no se debe esperar comportamiento util fuera del japones.
- Un solo like y 502 descargas en Hugging Face: proyecto de autor individual sin validacion comunitaria amplia; tratar como experimental.
- El repo ocupa 61,3 GB pese a que los pesos son de unos 250 MB, lo que sugiere la presencia de checkpoints de entrenamiento u otros artefactos; conviene revisar los archivos antes de descargar el repo completo.
- No hay pesos cuantizados oficiales ni integracion documentada con Ollama o llama.cpp; el despliegue en edge requiere conversion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kurisaxo/kotoba-slm-125m-ja
- Repositorio del autor en Hugging Face: https://huggingface.co/kurisaxo
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo independientes ni demos.
