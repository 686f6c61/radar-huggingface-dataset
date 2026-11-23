# brunuu/PequeninaLM

## Resumen

PequeninaLM es un modelo de lenguaje causal de tipo Llama, con 51,8 millones de parámetros, desarrollado por el usuario independiente brunuu y publicado en Hugging Face bajo licencia MIT. Está entrenado desde cero exclusivamente en portugués de Portugal (pt-PT), a partir de la Wikipedia en portugués de noviembre de 2023, filtrada y convertida a la variante europea. Su propósito declarado es didáctico y experimental: servir como banco de pruebas para entender el funcionamiento interno de un LLM y sostener conversaciones simples en un portátil sin GPU dedicada.

El modelo emplea una arquitectura transformer densa con RMSNorm, SwiGLU, RoPE, atención agrupada (GQA) y pesos compartidos entre la capa de entrada y la de salida. La ventana de contexto es de 1024 tokens y el vocabulario de 32 000 tokens con tokenizador BPE byte-level. Se distribuye en safetensors (bf16) y ONNX, con soporte para transformers.js, lo que facilita su despliegue en el navegador y en dispositivos de borde.

Su relevancia radica en el nicho: modelos de menos de 100 millones de parámetros especializados en una variante lingüística concreta y con un coste de entrenamiento de apenas unas horas de GPU. No compite en rendimiento con modelos generalistas, sino que ofrece un caso de estudio reproducible y un recurso de bajo coste para experimentación con pt-PT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (RMSNorm, SwiGLU, RoPE, GQA, pesos de embedding compartidos) |
| Parametros totales | 51.786.240 (51,8 M) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | Portugues de Portugal (pt-PT) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |
| Capas | 12 |
| Dimension oculta | 512 |
| Cabezas de atencion | 8 (4 de clave/valor) |
| Dimension intermedia | 1408 |
| Vocabulario | 32 000 tokens (BPE byte-level) |
| Tokens especiales | `<s>` `</s>` `<pad>` `<unk>` `<\|im_start\|>` `<\|im_end\|>` |
| Formato de chat | ChatML |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 12 capas, con dimensión oculta de 512, dimensión intermedia de 1408 y 8 cabezas de atención de las cuales 4 son de clave/valor (GQA). Emplea RMSNorm para la normalización, SwiGLU como activación en el bloque feed-forward, RoPE para la codificación posicional y comparte los pesos de la capa de embedding de entrada con la proyección de salida. Aproximadamente 16 millones de parámetros (casi un tercio del total) corresponden a los embeddings; los 36 millones restantes residen en las 12 capas.

El preentrenamiento se realizó sobre la Wikipedia en portugués de noviembre de 2023, tras un filtrado y una conversión a pt-PT, con un total de 275 millones de tokens leídos 8 veces (aproximadamente 2,2 mil millones de tokens procesados en total). El preentrenamiento completo requirió 2 horas y 27 minutos en una A100. Posteriormente se aplicó un ajuste supervisado (SFT) con 80 000 conversaciones escritas desde cero en portugués europeo, lo que requirió 34 minutos en una RX 7800 XT. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en portugués de Portugal, con formato ChatML y plantilla de chat integrada en el tokenizador.
- Mantenimiento de contexto conversacional a corto plazo: el modelo recuerda nombres y datos mencionados en turnos previos dentro de la ventana de 1024 tokens.
- Respuestas con registro lingüístico europeo (léxico y ortografía pt-PT).
- Generación de texto libre a partir de un prompt, con control de temperatura, top-p y penalización por repetición.
- Capacidad limitada de razonamiento aritmético y factual: el propio autor documenta fallos en operaciones sencillas y en datos enciclopédicos.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).
- No se documenta capacidad multilingüe más allá del portugués.

## Casos de uso

- Experimentación educativa con LLM: el modelo se puede entrenar y ajustar por completo en una tarde de GPU alquilada, lo que lo convierte en un banco de pruebas ideal para estudiar tokenización, atención, SFT y evaluación en un entorno controlado.
- Despliegue en navegador con transformers.js: al publicarse en ONNX y con un tamaño de repositorio de 0,4 GB, es viable ejecutarlo íntegramente en el cliente para demos interactivas de chat en pt-PT sin backend.
- Asistente conversacional de bajo coste en dispositivos de borde: con 52 M de parámetros y pesos bf16, cabe en memoria de sistemas embebidos y portátiles sin GPU, adecuado para prototipos de chat simple.
- Generación de texto en portugués europeo para tareas de relleno o completado: dado un contexto breve, puede producir frases con ortografía y léxico pt-PT, útil para pruebas de pipelines de generación.
- Evaluación comparativa de técnicas de entrenamiento: al ser reproducible desde cero con datos y tiempos documentados, sirve como línea base para medir el impacto de cambios en tokenizador, datos o hiperparámetros.
- Filtrado y clasificación ligera de texto en pt-PT: mediante prompts de formato ChatML se pueden obtener respuestas cortas y estructuradas, aunque con fiabilidad limitada en contenido factual.
- Docencia y divulgación sobre IA: el modelo y su model card, con ejemplos reales de aciertos y errores, funcionan como material didáctico para explicar las limitaciones de los modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,1 GB para los pesos (51,8 M de parámetros × 2 bytes), más el overhead de activaciones y caché KV, que con 1024 tokens de contexto es reducido.
- GPU recomendadas: no requiere GPU dedicada; el autor indica que corre en un portátil sin tarjeta gráfica. Para entrenamiento, una A100 completó el preentrenamiento en 2 h 27 min y una RX 7800 XT completó el SFT en 34 min.
- Cabe en cualquier GPU de consumo, incluida una RTX 4090, y también en CPU. El repositorio ocupa 0,4 GB.
- Opciones de despliegue: transformers (PyTorch), transformers.js (ONNX en navegador), text-generation-inference (el modelo está etiquetado como compatible con endpoints). No se documenta soporte explícito de llama.cpp, Ollama o TGI más allá de la etiqueta.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PequeninaLM | 51,8 M | 1024 | pt-PT | MIT | Hugging Face, ONNX |
| TinyLlama-1.1B | 1,1 B | 2048 | Multilingue (incl. pt) | Apache 2.0 | Hugging Face |
| SmolLM-135M | 135 M | 2048 | Multilingue (incl. pt) | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 0,5 B | 32 768 | Multilingue (incl. pt) | Apache 2.0 | Hugging Face |

La comparativa se limita a parámetros, contexto, idiomas, licencia y disponibilidad, ya que no se han publicado benchmarks de PequeninaLM que permitan contrastar rendimiento. Frente a TinyLlama, SmolLM y Qwen2.5, PequeninaLM es entre 2 y 20 veces más pequeño y su contexto es de 1024 tokens, muy inferior al de sus alternativas, pero su licencia MIT y su especialización en pt-PT lo diferencian en el nicho de experimentación y despliegue en el navegador.

## Limitaciones y advertencias

- Riesgo elevado de alucinación: el propio autor documenta respuestas factualmente incorrectas (por ejemplo, atribuir los pastéis de nata a Faro) y errores graves en aritmética básica (7 × 8 respondido como una medida de volumen).
- Conocimiento limitado al corpus de la Wikipedia en portugués de noviembre de 2023; no dispone de información posterior ni de fuentes externas.
- Ventana de contexto de solo 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Entrenado exclusivamente en pt-PT; no se garantiza un comportamiento correcto en portugués de Brasil ni en otros idiomas.
- Ausencia de RLHF/DPO: no se documenta alineación adicional más allá del SFT, por lo que puede producir respuestas inadecuadas o inconsistentes.
- Licencia MIT: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y el autor lo presenta como recurso experimental, no como producto listo para producción.
- No recomendado para tareas que requieran precisión factual, cálculo fiable, tool calling o razonamiento multi-paso.
- Sesgos potenciales derivados del corpus de Wikipedia, no evaluados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/brunuu/PequeninaLM
- Repositorio GitHub: https://github.com/brunu97/PequeninaLM
