# deloskiyt/gai-1.2

## Resumen

**gai-1.2** es un modelo generativo de texto en polaco desarrollado por el autor **deloskiyt**, con un tamaño de aproximadamente **20 millones de parámetros** (exactamente 19.708.672). Se trata de un modelo denso basado en arquitectura Transformer, con 8 capas, 8 cabezas de atención y una dimensión oculta de 256. Su ventana de contexto es de **2048 tokens**, lo que lo sitúa en la categoría de modelos pequeños, pensados para ejecución eficiente en dispositivos con recursos limitados.

El modelo ha sido entrenado sobre el corpus de literatura polaca **Wolne Lektury** y sobre diálogos conversacionales extensos. Su principal relevancia radica en que ofrece una opción ligera y de código abierto (licencia MIT) para tareas de generación de texto y conversación en polaco, con soporte para múltiples formatos de despliegue: **GGUF** (para LM Studio, llama.cpp y Ollama), **LiteRT-LM** para iPhone, **TFLite** para dispositivos móviles y **safetensors** para PyTorch/Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura GPT-2 según etiquetas del repositorio) |
| Parametros totales | 19.708.672 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | F16 (GGUF); no disponible para otros |
| Idiomas soportados | Polaco (`pl`) |
| Licencia | MIT |
| Formato de pesos | GGUF, LiteRT-LM, TFLite, safetensors |

## Arquitectura y entrenamiento

El modelo **gai-1.2** es un Transformer decoder denso con 8 capas, 8 cabezas de atención y una dimensión oculta de 256. No se trata de una arquitectura Mixture of Experts (MoE) ni de un modelo híbrido como SSM. La etiqueta `gpt2` en el repositorio de Hugging Face indica que el modelo es compatible con la arquitectura GPT-2, lo que facilita su carga con la librería `transformers`.

En cuanto al entrenamiento, la model card indica que el modelo fue entrenado sobre un corpus de literatura polaca procedente de **Wolne Lektury** y sobre diálogos conversacionales extensos. No se proporcionan datos sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas destacables en la arquitectura o el proceso de entrenamiento.

## Capacidades

- Generación de texto en polaco a partir de prompts.
- Conversación multi-turno dentro del límite de contexto de 2048 tokens.
- Ejecución en dispositivos móviles gracias a los formatos LiteRT-LM y TFLite.
- Integración con herramientas de despliegue local como LM Studio, llama.cpp y Ollama mediante el archivo GGUF.
- Carga mediante PyTorch/Hugging Face Transformers a través del archivo safetensors.
- No se han documentado capacidades de tool calling, function calling, agentes, visión o audio.

## Casos de uso

- **Asistente conversacional para apps móviles en polaco**: gracias a los formatos LiteRT-LM y TFLite, el modelo puede integrarse en aplicaciones iOS y Android para ofrecer respuestas automáticas en polaco sin conexión a internet.
- **Chatbot de atención al cliente en polaco para webs**: usando el archivo GGUF con llama.cpp u Ollama, se puede desplegar un chatbot ligero en un servidor de bajo coste para responder preguntas frecuentes en polaco.
- **Generación de resúmenes de textos literarios polacos**: al estar entrenado con el corpus Wolne Lektury, el modelo puede ayudar a resumir o comentar fragmentos de obras clásicas polacas.
- **Herramienta de escritura asistida en polaco**: para redactar correos, artículos o publicaciones en redes sociales, el modelo puede sugerir continuaciones o reformular frases en polaco.
- **Aplicaciones educativas de lengua polaca**: el modelo puede generar ejercicios de vocabulario, diálogos simulados o preguntas de comprensión lectora para estudiantes de polaco.
- **Prototipado de LLM en entornos con recursos limitados**: por su tamaño de 20 millones de parámetros y su contexto de 2048 tokens, es adecuado para experimentos en Raspberry Pi, portátiles antiguos o entornos de edge computing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 40 MB en formato F16; menos en cuantizaciones inferiores (no disponibles).
- GPU recomendada: no requiere GPU dedicada; puede ejecutarse en CPU.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU con al menos 1 GB de VRAM, aunque no es necesario.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (GGUF), LiteRT-LM en iOS, TFLite en Android, Hugging Face Transformers (safetensors).
- Latencia y throughput: no disponible, aunque al ser un modelo de 20 millones de parámetros, la generación es rápida en hardware moderno.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- Contexto limitado a 2048 tokens, insuficiente para conversaciones largas o documentos extensos.
- Entrenado únicamente en polaco; no soporta otros idiomas.
- No se han publicado evaluaciones de sesgos, seguridad o alucinaciones.
- Posibles sesgos culturales y literarios derivados del corpus Wolne Lektury.
- No se han documentado capacidades de tool calling, agentes o razonamiento complejo.
- La licencia MIT permite uso comercial, pero se debe verificar la procedencia de los datos de entrenamiento, ya que los diálogos conversacionales no están especificados en detalle.

## Enlaces

- Hugging Face: https://huggingface.co/deloskiyt/gai-1.2
