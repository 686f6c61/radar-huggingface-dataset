# nuess/modernbert-base-swedish-chars

## Resumen

`nuess/modernbert-base-swedish-chars` es un encoder ModernBERT afinado mediante preentrenamiento continuado (continued pretraining) sobre sueco, con una particularidad central: el tokenizador se ha sustituido por uno de nivel de caracter con BPE sobre bytes, de solo 1.542 IDs. El modelo parte de `AI-Sweden-Models/ModernBERT-base` (revisión `0bf738233da3c1bd32bc88cdbeb2c2c01dbac0eb`) y conserva la arquitectura del encoder original, con 111.515.904 parámetros totales.

El problema que aborda es el de la fragmentación léxica en sueco: el vocabulario original de ModernBERT, orientado a inglés y con piezas multiletra, se reemplaza por un vocabulario que forma primero caracteres completos y luego aplica fusiones de inicio de palabra y de separadores. El objetivo declarado es disponer de una representación más granular para morfología y composición nominal, aunque el autor advierte explícitamente de que las métricas publicadas son de MLM a nivel de carácter-BPE y no de fronteras de compuestos o morfemas.

El repositorio contiene únicamente el backbone encoder y el tokenizador asociado; la cabeza MLM entrenada se distribuye aparte como `mlm_head.pt` junto con `input_vocab.json`, por lo que no es un checkpoint estándar de `AutoModelForMaskedLM`. El modelo se publicó en noviembre de 2026, está pensado para extracción de características y no incluye checkpoints de optimizador ni datos de entrenamiento. La licencia no está declarada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), con atención bidireccional y RoPE; exportado con `attn_implementation="eager"` |
| Parametros totales | 111.515.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens en entrenamiento (geometría de secuencia); no se ha evaluado contexto superior |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión de entrenamiento) |
| Idiomas soportados | sueco (`sv`) |
| Licencia | no disponible (se remite a la licencia y procedencia del modelo base) |
| Formato de pesos | safetensors (backbone) + `mlm_head.pt` (PyTorch) + tokenizador JSON + `input_vocab.json` |
| Vocabulario | 1.542 IDs (tokenizador de carácter con ByteLevel pre-tokenizer) |
| Tamaño del repo | 0,5 GB |
| Versiones requeridas | Transformers 5.22.1, tokenizers 0.23.3 |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La arquitectura es la de ModernBERT, un encoder transformer bidireccional con atención de contexto largo, rotary positional embeddings y capas de normalización y MLP modernizadas respecto al BERT clásico. El autor no detalla modificaciones estructurales sobre el backbone: el cambio sustantivo está en el tokenizador. El vocabulario de 1.542 IDs se compone de 128 caracteres ASCII de un solo byte, 128 de fallback de byte alto, 201 caracteres multibyte completos, 206 inicios de palabra de un carácter con prefijo de espacio, 842 runs de separadores y símbolos retenidos, 30 fragmentos intermedios de prefijo UTF-8 y 7 tokens especiales. No hay piezas multiletra ordinarias ni cadenas de bytes duplicadas. La formación de caracteres precede a las fusiones de inicio de palabra y separadores, con normalización NFC y el pre-tokenizador ByteLevel original.

Los embeddings iniciales se derivaron del vocabulario original: 1.386 copias exactas y 156 medias de filas de piezas fuente. El entrenamiento consistió en 138.332 actualizaciones del optimizador con batch de 256 y longitud de secuencia 512, lo que equivale a 35.412.992 secuencias, sobre una partición de validación disjunta por hash de documento. Se usó LR pico de `1e-4`, 13.834 actualizaciones de warmup y decaimiento lineal hasta cero, AMP bf16 con parámetros en FP32 y recorte de gradiente en 1.0. El resultado final en validación es una pérdida MLM de 1,022679414907949 y una precisión de token enmascarado de 0,7214140752038926 sobre 4.096 fragmentos de evaluación fijos. No se documentan fases de RLHF, DPO ni ajuste instructivo: es un modelo exclusivamente de representaciones.

## Capacidades

- Extracción de características y embeddings contextuales de texto en sueco mediante `AutoModel` (estado oculto por token).
- Modelado de lenguaje enmascarado (MLM) si se carga la cabeza auxiliar `mlm_head.pt` de forma manual, no vía `AutoModelForMaskedLM`.
- Tokenización a nivel de carácter con cobertura completa de bytes UTF-8, sin tokens de vocabulario fuera de rango para texto sueco.
- Representación granular de morfología y composición nominal, al no colapsar palabras en piezas multiletra.
- Codificación de secuencias de hasta 512 tokens, alineada con la geometría de entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación autoregresiva: es un encoder, no un modelo causal.
- No tiene capacidades de visión, audio ni modo de pensamiento.
- Multilingüismo limitado: el vocabulario cubre bytes de cualquier UTF-8, pero el entrenamiento es solo en sueco.

## Casos de uso

- Búsqueda semántica y recuperación densa en corpus suecos: usar los embeddings del estado oculto como representación de frases o pasajes e indexarlos en un motor vectorial; el vocabulario de caracteres evita OOV en términos compuestos y neologismos.
- Clasificación de documentos suecos (temática, sentimiento, moderación): añadir una cabeza lineal sobre el token `[CLS]` o sobre pooling medio y ajustar con pocos datos, aprovechando que el backbone ya está adaptado al idioma.
- Reconocimiento de entidades y etiquetado de secuencias en sueco: la tokenización por carácter facilita alinear etiquetas a nivel de carácter en nombres propios y compuestos, sin depender de subtokens multiletra.
- Reranking en pipelines de búsqueda jurídica o administrativa sueca: computar similitud entre consulta y candidatos recuperados en una primera fase, con coste bajo gracias a los 111 M de parámetros.
- Análisis morfológico y de composición nominal: extraer representaciones por carácter para estudiar fronteras de compuestos y sufijos, teniendo en cuenta que el autor no ha evaluado explícitamente esta tarea.
- Deduplicación y clustering de textos suecos: generar embeddings de documento y agrupar por similitud coseno para detectar duplicados casi idénticos en corpus de gran tamaño.
- Filtrado y curación de datasets: puntuar pares texto-etiqueta o detectar texto de baja calidad en sueco antes de usarlo en el entrenamiento de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas reportadas son internas de preentrenamiento, sobre la partición de validación disjunta por hash de documento:

| Metrica | Valor |
|---|---|
| Pérdida MLM final (held-out) | 1,022679414907949 |
| Precisión de token enmascarado | 0,7214140752038926 |
| Fragmentos de evaluación | 4.096 fijos |
| Actualizaciones del optimizador | 138.332 |
| Secuencias de entrenamiento | 35.412.992 |

El autor advierte que estas cifras corresponden a MLM a nivel de carácter-BPE y no son comparables con métricas de nivel de byte ni con evaluaciones de fronteras de compuestos o morfemas. Tampoco se ha evaluado la calidad en tareas downstream ni con contextos superiores a 512 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB solo de pesos (111,5 M de parámetros), más activaciones; en bf16/fp16 baja a unos 0,22 GB de pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en CPU con el path eager, que no requiere FlashAttention ni kernels de Hugging Face.
- GPU recomendadas para alto throughput: A100, H100 o L40S para lotes grandes y servicio concurrente; para desarrollo y prototipado basta una GPU de 8 GB.
- Despliegue: `transformers` con `attn_implementation="eager"` (versiones 5.22.1 y tokenizers 0.23.3), y el tag `text-embeddings-inference` sugiere compatibilidad con TEI; no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estas herramientas no aplican de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota operativa: el repositorio se publicó inicialmente como privado y requiere un token de Hugging Face autorizado; el tokenizador del repo debe usarse siempre en lugar del vocabulario original de ModernBERT.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `nuess/modernbert-base-swedish-chars` | 111,5 M | 512 (entrenamiento) | sv | no disponible | Tokenizador de carácter de 1.542 IDs; solo backbone + cabeza MLM aparte |
| `AI-Sweden-Models/ModernBERT-base` (modelo base) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | Vocabulario original multiletra; referencia directa del ajuste |
| ModernBERT base original | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | Arquitectura de partida; sin adaptación al sueco |

No se dispone de datos de benchmarks comparativos ni de otras alternativas suecas de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un checkpoint estándar de `AutoModelForMaskedLM`: la cabeza MLM se distribuye aparte como `mlm_head.pt` y requiere carga manual.
- Solo se ha entrenado y evaluado en sueco; el vocabulario cubre bytes UTF-8, pero el rendimiento en otros idiomas no está validado.
- La ventana de entrenamiento es de 512 tokens y no se ha evaluado la calidad con contextos más largos, pese a que ModernBERT soporta contextos mayores en su configuración original.
- Las métricas publicadas son de MLM a nivel de carácter-BPE; no hay evidencia de calidad en tareas downstream ni en fronteras de compuestos o morfemas.
- La licencia no está declarada en este repositorio y queda sujeta a la licencia y procedencia del modelo base, lo que supone un riesgo para uso comercial hasta verificarla.
- El repositorio se publicó inicialmente como privado y exige un token de Hugging Face autorizado; conviene confirmar la disponibilidad pública antes de integrarlo en producción.
- Riesgo de alucinación no aplica en sentido generativo (es un encoder), pero sí existe riesgo de representaciones sesgadas heredadas de los datos de preentrenamiento del modelo base y del corpus sueco usado en el preentrenamiento continuado, no documentado.
- No se incluyen checkpoints de optimizador ni datos de entrenamiento, lo que limita la reproducibilidad exacta del ajuste.
- Dependencia de versiones concretas (Transformers 5.22.1, tokenizers 0.23.3); versiones distintas pueden alterar la tokenización o la carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nuess/modernbert-base-swedish-chars
- Modelo base: https://huggingface.co/AI-Sweden-Models/ModernBERT-base
- Repositorio de ModernBERT (referencia de arquitectura): no disponible en la información proporcionada
- Paper de ModernBERT: no disponible en la información proporcionada
- Demo o Space asociado: no disponible en la información proporcionada
