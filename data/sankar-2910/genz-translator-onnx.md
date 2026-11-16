# Sankar-2910/Genz-Translator-ONNX

## Resumen

Genz-Translator-ONNX es la exportación a formato ONNX del modelo GenZ Translator v2, un transformer decoder-only de estilo Llama con 29,65 millones de parámetros desarrollado por el usuario Sankar-2910. Su propósito es específico y acotado: traducir jerga de la generación Z y lenguaje informal de internet al inglés estándar. No es un modelo conversacional ni de propósito general, sino un traductor de un solo turno entrenado con prompts de instrucción.

El repositorio distribuye dos variantes de precisión: `model_int8.onnx`, cuantizada dinámicamente con ONNX Runtime (QInt8, per-channel, operadores MatMul y Gemm), y `model_int16.onnx`, cuya representación numérica exacta no está documentada por el autor. Según las mediciones locales del propio autor, el grafo FP32 original ocupaba 113,30 MB y el INT8 resultante 39,10 MB, una reducción del 65,49% en tamaño de fichero.

La relevancia de esta ficha es doble. Por un lado, ilustra el patrón de modelos ultracompactos orientados a una única tarea, desplegables en CPU sin GPU. Por otro, es un ejemplo de publicación con documentación incompleta: no hay evaluación de precisión sobre las variantes cuantizadas, el contexto es de solo 384 tokens y el modelo base apenas tiene tracción (0 descargas, 0 likes en el momento de la consulta). Cualquier uso en producción debe partir de una validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama |
| Parámetros totales | 29.653.568 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens (incluye el prompt) |
| Tipos de cuantización | INT8 dinámica (QInt8, per-channel, MatMul/Gemm); variante "int16" sin especificar representación numérica |
| Idiomas soportados | inglés (entrada y salida) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_int8.onnx`, `model_int16.onnx`); tokenizer en el repo base en formato Transformers |
| Capas | 7 |
| Dimensión oculta | 448 |
| Cabezas de atención | 7 |
| Cabezas KV | 7 |
| Tamaño intermedio | 1.792 |
| Vocabulario | 8.000 |
| Tokenizer | Byte-Level BPE personalizado (descargado del repo base) |
| Tie de embeddings | No (`tie_word_embeddings=False`) |
| Interfaz ONNX | `input_ids`, `attention_mask`, `position_ids` → `logits` |
| Tamaño del repo | 0,1 GB |
| Fecha de creación | 2026-11-16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 7 capas con 448 dimensiones ocultas, 7 cabezas de atención (sin GQA, ya que cabezas de atención y cabezas KV coinciden) y una dimensión intermedia de 1.792. Emplea embeddings de entrada y pesos de la cabeza de salida separados, lo que descarta el weight tying habitual en modelos pequeños. El vocabulario es reducido (8.000 tokens) mediante un tokenizer Byte-Level BPE personalizado, coherente con el dominio estrecho de jerga e inglés informal.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado más allá del formato de instrucción. El prompt de entrenamiento tiene una estructura fija con tokens especiales (`<|instruction|>`, `<|input|>`, `<|response|>`), lo que indica un ajuste por instrucciones sobre una plantilla concreta. La exportación a ONNX se realizó con ONNX Runtime; la variante INT8 aplica cuantización dinámica post-entrenamiento sobre MatMul y Gemm, sin datos de calibración estáticos.

## Capacidades

- Traducción de jerga Gen Z y abreviaturas de internet (`WYD`, `tbh`, `omw`, `ty`, `np`) a inglés estándar.
- Reesritura de mensajes informales en inglés formal.
- Interpretación de expresiones Gen Z en contexto, siempre que quepan en 384 tokens.
- Procesamiento de pies de foto y mensajes cortos de redes sociales.
- Inferencia en CPU mediante ONNX Runtime (`CPUExecutionProvider`), sin necesidad de GPU.
- Generación de texto autoregresiva con bucle manual de decodificación (el grafo expone `logits`, no una API de generación).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta visión, audio ni modo de razonamiento explícito.
- No es multilingüe: solo inglés, y el propio autor advierte que la interpretación de jerga regional o en evolución no es fiable.

## Casos de uso

- Moderación y normalización de contenido en foros y comunidades: el modelo puede convertir mensajes con jerga en inglés estándar antes de pasarlos a un clasificador o a un sistema de revisión, reduciendo falsos negativos por vocabulario desconocido.
- Preprocesado para analítica de redes sociales: normalizar captions y comentarios cortos a inglés estándar antes de aplicar análisis de sentimiento o extracción de temas, aprovechando que el contexto de 384 tokens cubre mensajes típicos.
- Accesibilidad y traducción intralingüe: ayudar a lectores no familiarizados con jerga juvenil (padres, tutores, equipos de soporte) a entender mensajes informales, desplegando el modelo en local sin enviar datos a la nube.
- Filtrado previo en pipelines de atención al cliente: convertir quejas o consultas escritas en jerga a inglés claro antes de que las procese un agente o un LLM mayor, reduciendo ambigüedad en la entrada.
- Investigación sobre modelos compactos: servir como banco de pruebas reproducible para estudiar cuantización INT8 en ONNX Runtime, latencia en CPU y degradación de calidad en modelos de menos de 30M de parámetros.
- Despliegue en dispositivos de borde o entornos air-gapped: al ocupar 39,10 MB en INT8 y ejecutarse en CPU, encaja en contenedores ligeros, Raspberry Pi o portátiles sin GPU para tareas de normalización de texto en tiempo real.
- Generación de datasets de aumento de datos: producir paráfrasis en inglés estándar de mensajes con jerga para entrenar o evaluar otros modelos de clasificación o traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para las variantes ONNX. El autor indica explícitamente que las cifras de calidad del checkpoint PyTorch v2 no deben presentarse como resultados medidos de INT8 o INT16, y que no hay evaluación independiente de precisión para los grafos cuantizados.

| Métrica | Valor |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Calidad de traducción (INT8/INT16) | no evaluada |
| Tamaño FP32 (referencia local) | 113,30 MB |
| Tamaño INT8 (referencia local) | 39,10 MB |
| Reducción de tamaño | 65,49% |
| Latencia / throughput | no disponible |

## Requisitos de hardware

- VRAM estimada: no aplica en el caso base; el modelo está pensado para CPU. En GPU, el grafo INT8 de 39,10 MB cabe holgadamente en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime (CUDA Execution Provider) puede ejecutarlo, pero el modelo no está dimensionado para aprovechar hardware de gama alta.
- GPU de consumo: cabe en cualquier GPU de consumo moderna e incluso en iGPU, dado el tamaño del grafo.
- CPU: es el objetivo principal; el autor usa `CPUExecutionProvider` en el ejemplo oficial.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, etc.), integrable en servidores ligeros; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no soportan este grafo ONNX de forma nativa.
- Latencia y throughput: no disponibles. La generación es token a token con bucle manual en Python, lo que añade overhead frente a runtimes con decodificación optimizada.
- Contexto: 384 tokens en total, incluyendo el prompt de instrucción; el bucle de generación del ejemplo corta al alcanzar ese límite.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Genz-Translator-ONNX (este) | 29,65M | 384 | Traducción de jerga Gen Z → inglés | Apache 2.0 | ONNX (INT8/INT16) |
| Modelo base Sankar-2910/genz-translator | 29,65M | 384 | Igual | Apache 2.0 | Transformers (PyTorch) |
| Modelos de traducción NMT genéricos (p. ej. Helsinki-NLP opus-mt-en-*) | 70M–300M típicamente | 512 aprox. | Traducción entre idiomas | Varía (MIT/Apache/CC) | PyTorch, ONNX en algunos casos |
| LLMs pequeños de propósito general (p. ej. TinyLlama, Qwen2.5-0.5B) | 0,5B–1,1B | 2K–32K | Conversación, código, conocimiento | Apache 2.0 | Safetensors, GGUF |

La comparación con modelos NMT genéricos es solo orientativa: no traducen jerga Gen Z de forma específica y no se han publicado métricas comparativas en la información disponible. Frente a LLMs pequeños de propósito general, este modelo es dos órdenes de magnitud menor, pero también mucho más limitado en alcance y sin capacidad conversacional.

## Limitaciones y advertencias

- Modelo de un solo turno: no mantiene conversación ni estado entre peticiones.
- Contexto muy corto (384 tokens incluyendo el prompt), lo que limita entradas a mensajes breves.
- Solo inglés: no interpreta jerga en otros idiomas ni regionalismos no ingleses de forma fiable.
- Sin evaluación de las variantes cuantizadas: la calidad de INT8 e INT16 no está medida; el autor advierte de no reutilizar métricas del checkpoint PyTorch.
- Representación de `model_int16.onnx` no documentada: no se debe asumir FP16 ni INT16 con signo sin inspeccionar el grafo.
- Riesgo de alucinación en expresiones poco frecuentes o en evolución: el vocabulario de 8.000 tokens y el dominio estrecho favorecen salidas plausibles pero incorrectas.
- Formato de prompt obligatorio: pasar texto sin la plantilla `<s><|instruction|>...<|response|>` degrada la salida.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso.
- Tracción mínima: 0 descargas y 0 likes en el momento de la consulta; sin comunidad que valide el comportamiento en producción.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de calidad traslada al integrador toda la responsabilidad de validación.
- El bucle de generación del ejemplo es secuencial en Python y no aprovecha optimizaciones de decodificación; el rendimiento real dependerá de la implementación del integrador.

## Enlaces

- Repositorio ONNX: https://huggingface.co/Sankar-2910/Genz-Translator-ONNX
- Modelo base: https://huggingface.co/Sankar-2910/genz-translator
- Paper de referencia de la arquitectura Llama (arXiv:2302.13971): https://arxiv.org/abs/2302.13971
- ONNX Runtime: https://onnxruntime.ai/
- Documentación de cuantización de ONNX Runtime: https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
