# salgr/SalgrAI_1.1

## Resumen

SalgrAI-v1.1 es un modelo de lenguaje conversacional en ruso de tamano muy reducido, desarrollado desde cero por un unico autor (Salgr) sobre una unica GPU RTX 3060 de 12 GB. Con 14.997.888 parametros y 6 capas, se trata de un modelo de juguete ("tiny-model") pensado para experimentacion, demos y aprendizaje, no para uso en produccion. Su arquitectura es un transformer decoder-only de estilo Llama con RMSNorm, RoPE, SwiGLU y embeddings de entrada/salida atados.

El modelo se entrena en dos fases: un preentrenamiento sobre unos 500 millones de tokens de Wikipedia en ruso y subtitulos de OpenSubtitles, seguido de un ajuste supervisado (SFT) sobre 4.317 dialogos sinteticos generados con Claude Haiku que simulan un chat informal de estilo "Telegram en minusculas". Su ventana de contexto es de 1024 tokens y su vocabulario de 8192 tokens BPE a nivel de byte.

Es relevante ahora como ejemplo didactico de pipeline completo de entrenamiento desde cero (tokenizer, preentrenamiento, SFT, conversion a GGUF y validacion cruzada de formatos) ejecutado en hardware de consumo. No obstante, su tamano lo hace poco fiable para tareas factuales o aritmeticas, y el propio autor lo advierte explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama: RMSNorm, RoPE (theta 10000), SwiGLU, sin biases, embeddings de entrada/salida atados |
| Parametros totales | 14.997.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF F16 (float16); no se proporcionan variantes cuantizadas adicionales |
| Idiomas soportados | Ruso (principal), algo de ingles, digitos y simbolos |
| Licencia | no disponible (la model card indica que el autor debe elegir una licencia antes de publicar) |
| Formato de pesos | safetensors (float32, layout Llama), pytorch_model.bin, GGUF (float16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 6 capas con hidden size 384, 6 cabezas de atencion (dimension por cabeza 64), FFN de 1202 y vocabulario de 8192 tokens. Usa RMSNorm, RoPE con theta 10000, activacion SwiGLU, sin terminos de bias y con los embeddings de entrada y salida atados. El tokenizer es un BPE a nivel de byte entrenado sobre el texto de preentrenamiento y los dialogos.

El preentrenamiento se realizo desde inicializacion aleatoria en una RTX 3060 (12 GB) en bf16, sin usar pesos de terceros, sobre unos 500 millones de tokens de Wikipedia en ruso y OpenSubtitles en ruso, con perdida de validacion final de 2.926 en Wikipedia y 3.016 en subtitulos. El ajuste supervisado (SFT) se aplico directamente sobre el checkpoint de preentrenamiento (sin la etapa de pseudo-dialogos de subtitulos que usaba la v1, que daba peor perdida de validacion: 3.287 frente a 3.076) sobre 4.317 dialogos sinteticos generados por Claude Haiku en tres oleadas, con learning rate 2e-4 y mejor epoca 4. La perdida se calcula solo sobre los tokens del asistente. Los dialogos de ajuste no se publican con el modelo.

## Capacidades

- Generacion de texto conversacional en ruso con estilo informal de chat ("Telegram en minusculas").
- Respuestas de seguimiento en conversaciones multi-turno dentro de la ventana de 1024 tokens.
- Capacidad limitada de responder en ingles, ademas de digitos y simbolos.
- Plantilla de chat con tokens especiales `<|user|>`, `<|assistant|>` y `<|eos|>`; el modelo se detiene solo en `<|eos|>`.
- Formato GGUF compatible con llama.cpp y endpoint compatible con OpenAI (`/v1/chat/completions`).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Demostracion educativa de un pipeline completo de entrenamiento desde cero: sirve para ilustrar tokenizer, preentrenamiento, SFT, conversion a GGUF y validacion cruzada de pesos en un curso o taller, ya que todo el proceso cabe en una GPU de consumo.
- Prototipado de interfaces de chat: permite montar rapidamente un endpoint compatible con OpenAI en llama.cpp (`llama-server`) para probar frontends conversacionales sin coste de inferencia.
- Pruebas de integracion de plantillas de chat y tokens especiales: util para validar como se comporta un modelo con formato `<|user|>...<|assistant|>...<|eos|>` y con perdida solo en tokens del asistente.
- Experimentos de investigacion sobre modelos diminutos: su tamano (15 M de parametros) permite iterar rapidamente sobre tecnicas de tokenizacion, atado de embeddings o regimenes de entrenamiento en hardware modesto.
- Banco de pruebas de cuantizacion y compatibilidad de formatos: al incluir safetensors, pytorch_model.bin y GGUF F16 verificados entre si, sirve para comparar la fidelidad numerica entre `transformers` y llama.cpp.
- Generacion de respuestas informales en ruso para demos de bajo coste: adecuado para ejemplos de conversacion coloquial donde la correccion factual no es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta perdidas de validacion informales (2.926 en Wikipedia y 3.016 en subtitulos para el preentrenamiento; 3.076 para el SFT), que el propio autor advierte que no son comparables entre versiones porque cada modelo usa su propio conjunto de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (15 M de parametros) y aproximadamente 30 MB en GGUF F16; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el entrenamiento se realizo en una RTX 3060 de 12 GB.
- Cabe en GPU consumer: si, en practicamente cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), e incluso en CPU.
- Opciones de despliegue: `transformers`, llama.cpp (`llama-server` con endpoint compatible con OpenAI), PyTorch nativo mediante el codigo en `original/`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos conversacionales en ruso de tamano diminuto entrenados desde cero).

## Limitaciones y advertencias

- El propio autor advierte que el modelo es demasiado pequeno para ser fiable: a menudo responde fuera de tema y comete errores factuales y aritmeticos.
- No dispone de filtro de seguridad ni de profanidad.
- Ventana de contexto limitada a 1024 tokens; el codigo de referencia descarta los turnos mas antiguos cuando se llena, pero la plantilla de chat de Hugging Face no aplica esa logica.
- La plantilla de chat de `transformers` no neutraliza la inyeccion de tokens de servicio (`<|`) ni colapsa espacios en blanco, a diferencia del codigo de referencia.
- La licencia no esta definida en la model card, lo que impide determinar las condiciones de uso comercial.
- Los dialogos de ajuste son sinteticos (generados por Claude Haiku) y no se publican; el autor recomienda revisar los terminos de las fuentes de preentrenamiento (Wikipedia CC BY-SA y OpenSubtitles de OPUS, con derechos de terceros).
- Las perdidas de validacion reportadas no son comparables entre versiones por usar conjuntos distintos.
- Riesgo elevado de alucinacion y de respuestas incoherentes en conversaciones largas o temas especializados.

## Enlaces

- Hugging Face: https://huggingface.co/salgr/SalgrAI_1.1
- Version en ruso de la model card: README_RU.md (referenciada en el repositorio)
- Codigo original y ejemplo de chat: carpeta `original/` del repositorio (model.py, common.py, chat_example.py)
- Pesos GGUF: SalgrAI-v1.1-F16.gguf (en el repositorio)
