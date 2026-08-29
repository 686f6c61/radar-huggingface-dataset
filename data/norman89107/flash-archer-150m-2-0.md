# Norman89107/Flash-Archer-150M-2.0

## Resumen

Flash-Archer-150M-2.0 es un modelo de lenguaje autorregresivo (decoder-only) de 150 millones de parámetros, desarrollado por Norman89107 como un proyecto de preentrenamiento reproducible desde cero. Está diseñado para servir como modelo compacto y rápido para experimentación, educación y como línea base en investigación de modelos pequeños. Se entrenó sobre el subconjunto `sample-10BT` de FineWeb-Edu, con aproximadamente 2.120 millones de tokens, en una única GPU Tesla T4 durante unas 7 horas.

La versión 2.0 es una conversión del checkpoint original al formato estándar `LlamaForCausalLM` de HuggingFace, lo que garantiza compatibilidad con `transformers`, vLLM, TGI y `llama.cpp`, con una paridad de inferencia verificada (diferencia máxima de logits inferior a 1e-5). Su arquitectura sigue la familia Llama: pre-normalización RMSNorm, RoPE, SwiGLU y embeddings atados. Con una ventana de contexto de 1024 tokens y un vocabulario BPE de 16.000 entradas, es un modelo ligero pensado para tareas de generación de texto en inglés, no para razonamiento complejo ni código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama: pre-norm RMSNorm, RoPE, SwiGLU, embeddings atados) |
| Parametros totales | 150.335.232 (~138M no-embedding) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No publicados (formato nativo fp16; compatible con cuantizacion GGUF via llama.cpp) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (HuggingFace Transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 18 capas, con hidden size 768, 12 cabezas de atencion (dimension de cabeza 64) y MLP SwiGLU de dimension 2304. Usa pre-normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE) con theta 10000 y embeddings de token atados (tied embeddings). El tokenizador es un BPE a nivel de byte, entrenado sobre 200.000 documentos de FineWeb-Edu, con un vocabulario de 16.000 tokens y tokens especiales `<pad>`, `<unk>`, `<bos>`, `<eos>`.

El entrenamiento se realizo desde cero sobre el dataset FineWeb-Edu (`sample-10BT`), con un total de ~2,12 mil millones de tokens. Se utilizo un pipeline de streaming que nunca materializa el dataset completo, empaquetando secuencias de 1024 tokens con separadores `<eos>` para evitar padding. El optimizador fue AdamW (beta1=0.9, beta2=0.95, weight decay 0.1) con programacion coseno de tasa de aprendizaje (3e-4 a 3e-5, 2% de warmup). Se empleo precision fp16 con gradient scaling, activacion checkpointing y micro-batch de 1 con acumulacion de gradientes de 128 pasos, logrando un batch efectivo de ~131.000 tokens por paso. El modelo se guardo cada 200 pasos en el Hub de HuggingFace para tolerar fallos de sesion. La perdida final de validacion fue 2.95, con perplexidad 19.2.

## Capacidades

- Generacion de texto coherente y sobre el tema en ingles, con capacidad de seguir instrucciones simples.
- Completado de texto y continuacion de secuencias con contexto de hasta 1024 tokens.
- Control de creatividad mediante parametros de muestreo (temperatura, top-k, top-p).
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin soporte de vision, audio ni multimodalidad.
- Unicamente ingles; no hay evidencia de capacidades multilingues.
- No dispone de modo "thinking" ni de alineacion por RLHF.

## Casos de uso

- Educacion y aprendizaje: sirve como ejemplo practico de un transformer entrenado desde cero, ideal para estudiar arquitectura, tokenizacion BPE, programacion de entrenamiento y conversion a formato HuggingFace.
- Linea base en investigacion: como modelo de referencia para comparar tecnicas de escalado, regularizacion o ajuste fino en modelos pequenos.
- Prototipado rapido de pipelines de generacion: al ser ligero y compatible con `transformers`, permite probar flujos de generacion, decodificacion y postprocesado sin necesidad de hardware potente.
- Generacion creativa corta: con temperatura alta (0.9-1.2) puede producir cuentos, poemas o dialogos breves, aunque con riesgo de repeticion.
- Autocompletado de texto en aplicaciones de escritura asistida: su contexto de 1024 tokens es suficiente para sugerir continuaciones de parrafos o frases en ingles.
- Ajuste fino para tareas especificas: al ser un modelo pequeno, se puede adaptar con pocos datos para clasificacion de texto, generacion de resumenes o extraccion de entidades, siempre que la tarea no requiera razonamiento complejo.
- Despliegue en entornos con recursos limitados: cabe en CPU o GPUs de baja gama, permitiendo inferencia local en aplicaciones de escritorio o educativas.

## Benchmarks y rendimiento

El unico resultado publicado por el autor es la perplexidad de validacion sobre un subconjunto de FineWeb-Edu (`sample-10BT`). No se han reportado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Generacion de texto | FineWeb-Edu (sample-10BT) | Perplexidad de validacion | 19.2 |

No se dispone de comparaciones con otros modelos de tamano similar en los mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, el modelo ocupa aproximadamente 300 MB de VRAM; en fp32, unos 600 MB. Con cuantizacion GGUF de 4 bits, puede reducirse a unos 100-150 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una Tesla T4 (16 GB) o una RTX 3060 (12 GB) son mas que adecuadas. Tambien funciona en CPU.
- Compatible con GPUs de consumo: si, incluyendo GTX 1650, RTX 2060, RTX 3060, etc.
- Opciones de despliegue: `transformers` (pipeline de generacion), vLLM, TGI (Text Generation Inference), `llama.cpp` (via conversion a GGUF) y Ollama (si se convierte previamente).
- Latencia y throughput: en una GPU moderna, la generacion es casi instantanea (decenas de tokens por segundo). En CPU, puede generar entre 5 y 20 tokens por segundo dependiendo del hardware y la cuantizacion.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos de 150M. Como referencia cualitativa, se puede comparar con modelos de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Flash-Archer-150M-2.0 | 150M | 1024 | Apache 2.0 | Entrenado desde cero en FineWeb-Edu, solo ingles |
| GPT-2 small | 124M | 1024 | MIT | Modelo clasico de OpenAI, entrenado en WebText |
| Pythia-160M | 160M | 2048 | Apache 2.0 | Entrenado en The Pile, con variantes de checkpoint |

No hay datos de rendimiento comparables en los mismos benchmarks, por lo que no se puede establecer una jerarquia objetiva.

## Limitaciones y advertencias

- Alucinaciones frecuentes: al tener solo 150M de parametros, el modelo inventa hechos y detalles con facilidad, especialmente en temas especializados.
- Repeticion: tiende a repetir frases o estructuras, sobre todo con temperaturas altas.
- Razonamiento limitado: no es capaz de realizar razonamiento multi-paso, matematicas complejas ni generacion de codigo funcional.
- Sin alineacion de seguridad: no ha pasado por RLHF ni filtros de contenido; puede generar texto ofensivo, sesgado o inapropiado presente en los datos de entrenamiento.
- Sesgos de datos: entrenado en FineWeb-Edu, que refleja sesgos y contenido de la web; puede perpetuar estereotipos.
- Contexto corto: 1024 tokens limita la coherencia en textos largos y el manejo de dependencias de largo alcance.
- Solo ingles: no soporta otros idiomas de forma fiable.
- Sin soporte de tool calling ni agentes: no es adecuado para integraciones que requieran interaccion con APIs o ejecucion de acciones.
- Para produccion: no se recomienda su uso en aplicaciones criticas sin filtros adicionales y evaluacion exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Norman89107/Flash-Archer-150M-2.0
- Version anterior (v1): https://huggingface.co/Norman89107/Flash-Archer-150M
- Repositorio de archivos: https://huggingface.co/Norman89107/Flash-Archer-150M/tree/main
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/Norman89107/Flash-Archer-150M
- Video de preentrenamiento en YouTube: https://www.youtube.com/watch?v=QPpecjISVnU
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
