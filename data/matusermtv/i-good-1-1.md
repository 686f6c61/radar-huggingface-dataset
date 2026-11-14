# MatUserMTV/I.Good-1.1

## Resumen

I.Good-1.1 es una minúscula modelo de lenguaje conversacional en ruso desarrollada por MatUserMTV, entrenada desde cero (sin fine-tuning, LoRA ni destilación) sobre un corpus de aproximadamente 10 000 diálogos rusos. Con solo 4 522 624 parámetros, se presenta explícitamente como un experimento educativo más que como un producto: su objetivo es demostrar que es viable entrenar un transformer completo, desde el texto crudo hasta el GGUF, en una CPU de servidor (Intel Xeon de 28 hilos a 3,10 GHz con 32 GB de RAM) sin ninguna GPU.

La arquitectura sigue el esquema Llama (RoPE, RMSNorm, SwiGLU, GQA con 4 cabezas KV, embeddings atados) con solo 2 capas, hidden de 128 y contexto máximo de 512 tokens. El detalle crítico es que unos 4,1 millones de los 4,5 millones de parámetros corresponden a los embeddings de un vocabulario BPE de 32 000 tokens, dejando apenas unos 400 000 parámetros efectivos para las capas transformer. Esa proporción explica gran parte de sus limitaciones observadas.

Es relevante ahora como caso de estudio reproducible de entrenamiento de bajo coste: el autor documenta con honestidad el pipeline, las curvas de pérdida (de 10,41 a 5,20 en unas 500 iteraciones, 45 minutos de entrenamiento) y los fallos de generación, incluyendo el sobreajuste y el bucle degenerado. No compite con modelos de escala similar como Qwen2.5-0.5B (unas 110 veces mayor) ni Llama 3.2 1B (unas 220 veces mayor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (RoPE, RMSNorm, SwiGLU, GQA, embeddings atados) |
| Parametros totales | 4 522 624 (~4,1 M en embeddings, ~400 K en capas transformer) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | GGUF (el repositorio distribuye `model.gguf`; no se detallan niveles de cuantizacion) |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0.0 GB según Hugging Face) |

Datos arquitectonicos adicionales: 2 capas (n_layer), 4 cabezas de atencion, hidden 128, MLP 384, tokenizador BPE de 32 000 tokens, 4 cabezas KV en GQA.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 2 capas con las innovaciones habituales de la familia Llama: codificacion posicional rotatoria (RoPE), normalizacion RMSNorm, activacion SwiGLU en la MLP y atencion con query grouping (GQA) de 4 cabezas KV. Los embeddings de entrada y salida estan atados. El vocabulario BPE de 32 000 tokens consume aproximadamente el 91 % de los parametros, lo que deja el "motor" de razonamiento en torno a 400 000 parametros.

El entrenamiento se realizo integramente en CPU (Intel Xeon, 28 hilos, 3,10 GHz, 32 GB de RAM) durante unos 45 minutos con AdamW (β=0,9/0,95, weight_decay=0,1), learning rate 5e-4 con decaimiento coseno y warmup, batch size 8 y acumulacion de gradiente 16. Los datos fueron aproximadamente 10 000 dialogos rusos (~834 000 tokens, ~4 MB de texto) en formato `<|user|>...<|assistant|>...<|endoftext|>`. La perdida de entrenamiento final fue ~5,2 y la de validacion en el paso 500, 5,70, con una curva monotona de 10,41 a 5,20. No se utilizo dropout ni early stopping por val loss, lo que el propio autor identifica como causa del sobreajuste.

## Capacidades

- Generacion de texto conversacional muy corto en ruso (frases de 3 a 8 palabras).
- Emision de palabras rusas reales, no ruido de bytes.
- Respeto parcial del formato de turnos `<|user|>` / `<|assistant|>`.
- Intentos de formular preguntas de vuelta al usuario.
- Reutilizacion de vocabulario presente en el dataset de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No soporta generacion de codigo (Python, C++, HTML) de forma funcional.
- No sigue instrucciones del tipo "escribe codigo", "traduce" o "explica".
- Sin capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Docencia sobre pipelines de entrenamiento de LLM: sirve para recorrer el ciclo completo desde `.txt` hasta `.gguf` en una CPU, mostrando tokenizacion, formato de dialogo y conversion de pesos sin necesidad de GPU.
- Demostracion practica del impacto del tamano del vocabulario: permite ilustrar como un vocabulario de 32 000 tokens absorbe el 91 % de los parametros en modelos diminutos y por que conviene reducirlo.
- Estudio de sobreajuste en modelos pequenos: con 10 000 dialogos y 500 pasos, el modelo cita fragmentos del dataset, lo que lo convierte en un caso controlado para analizar memorizacion frente a generalizacion.
- Prueba de tooling de inferencia en CPU: valido para verificar configuraciones de KoboldCPP u Ollama (contexto 512, `repeat_penalty` 1,5, temperatura 0,3) sin consumir recursos de GPU.
- Benchmark de infraestructura de bajo coste: util como carga minima para medir latencia de arranque y throughput en entornos sin acelerador.
- Ejemplo de evaluacion honesta de modelos: su model card documenta explicitamente fallos y modos de degeneracion, lo que lo hace util en formacion sobre comunicacion tecnica rigurosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida: entrenamiento ~5,2 y validacion 5,70 en el paso 500, partiendo de 10,41.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano (4,5 M de parametros) el modelo es despreciable en memoria y cabe holgadamente en CPU.
- GPU recomendadas: no aplica; el autor indica explicitamente GPU Layers 0 en KoboldCPP porque la CPU es suficiente.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU; el entrenamiento se realizo en un Intel Xeon de 28 hilos a 3,10 GHz con 32 GB de RAM.
- Opciones de despliegue: KoboldCPP (contexto 512, temperatura 0,3, `repeat_penalty` 1,5, top_k 40, top_p 0,9) y Ollama mediante `Modelfile` con `num_ctx 512`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| I.Good-1.1 | 4,5 M | 512 | Ruso | Apache 2.0 | Entrenado desde cero en CPU; conversacional muy limitado |
| Qwen2.5-0.5B | ~500 M (~110x) | No disponible en la informacion | Multilingue | No disponible en la informacion | Referencia de escala citada por el autor |
| Llama 3.2 1B | ~1 000 M (~220x) | No disponible en la informacion | Multilingue | No disponible en la informacion | Referencia de escala citada por el autor |

Los datos de contexto, licencia y rendimiento de los modelos comparativos no se detallan en la informacion proporcionada; la comparacion se limita a la escala de parametros indicada por el autor.

## Limitaciones y advertencias

- Perdida de contexto tras 2 o 3 replicas; no mantiene coherencia conversacional.
- No sigue instrucciones ni tareas como traduccion, explicacion o generacion de codigo.
- Sobraajuste evidente: cita fragmentos del dataset de entrenamiento de forma literal.
- Generacion degenerada en forma de bucles ("рас, рас, рас...") si no se aplica `repeat_penalty` de al menos 1,5.
- Frases que se cortan a mitad y contradicciones entre frases contiguas.
- No responde a preguntas factuales complejas.
- Dominio limitado al ruso; no se documenta soporte de otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el rendimiento real hace inviable su uso en produccion.
- El repositorio figura con un tamano de 0.0 GB en Hugging Face, lo que puede indicar que los pesos no estan disponibles o que la medicion no esta actualizada.
- Riesgo de alucinacion alto y sin mitigaciones documentadas.
- El autor recomienda explicitamente no usarlo como sustituto de modelos de mayor escala.

## Enlaces

- Hugging Face: https://huggingface.co/MatUserMTV/I.Good-1.1
- Modelo base declarado: MatUserMTV/I.Good-1.1 (autoreferencia en la metadata)
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
