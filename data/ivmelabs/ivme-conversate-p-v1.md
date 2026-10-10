# IvmeLabs/Ivme-Conversate-P-v1

# İvme-Conversate-P-v1

## Resumen
İvme-Conversate-P-v1 es un modelo de lenguaje decoder-only de 3.228.928 parámetros (3,23 M) desarrollado por IvmeLabs dentro de su serie İvme (del turco *acceleration*), orientada a modelos extremadamente pequeños. Se trata del modelo más reducido de la familia hasta la fecha: emplea exactamente el mismo código de arquitectura que İvme-Conversate-v3-Base (24,8 M de parámetros) con la forma recortada de 16 capas × 320 de dimensión oculta a 6 capas × 128, y se entrena íntegramente mediante destilación de logits (logit distillation) a partir de v3.

El problema que aborda es de interés para la investigación en eficiencia: mide cuánto conocimiento y capacidad lingüística de un modelo mayor sobrevive cuando se comprime a una fracción de su tamaño compartiendo tokenizador y diseño. La respuesta que reporta el autor es matizada: P-v1 conserva buena parte de la gramática y una fracción relevante del modelado del lenguaje, pero muy poco del conocimiento del mundo (ya de por sí escaso en v3).

Es un modelo base (no ajustado a instrucciones), con 1024 tokens de contexto, vocabulario de 16.000 tokens, licencia Apache 2.0 y entrenado sobre aproximadamente 2.000 millones de tokens de FineWeb-Edu. Su relevancia actual radica en servir como referencia de destilación extrema y como caso de estudio del límite inferior práctico de un transformer útil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, denso (RoPE, QK-Norm, XSA, SwiGLU, RMSNorm pre-norm) |
| Parametros totales | 3.228.928 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; pesos en safetensors (entrenamiento en bf16). Convertible a int8/int4 con herramientas estandar |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere custom_code) |

Detalles adicionales de arquitectura reportados por el autor:

| Parametro | Valor |
|---|---|
| Capas | 6 |
| Dimension oculta | 128 |
| Dimension FFN | SwiGLU (341) |
| Cabezas de atencion | 4 (atencion completa, sin GQA), head_dim 32 |
| Variante de atencion | QK-Norm + XSA (Exclusive Self Attention) |
| Vocabulario | 16.000 (BPE atomico por digito de v3) |
| Codificacion posicional | RoPE (θ=10.000) |
| Normalizacion | RMSNorm (pre-norm) |
| Embeddings | Atados entrada/salida (tied) |
| Sesgos (bias) | Ninguno |
| Modelo base (profesor) | IvmeLabs/Ivme-Conversate-v3-Base |

## Arquitectura y entrenamiento
P-v1 replica el código exacto de v3-Base, cambiando unicamente la forma: 6 capas y dimension oculta 128 en lugar de 16 × 320. Mantener el código identico es deliberado, de modo que cualquier perdida de capacidad sea atribuible al tamaño y no a un diseño distinto. La atencion usa QK-Norm y XSA (Exclusive Self Attention, arXiv:2603.09078), sin GQA. Con el vocabulario de 16.000 tokens y embeddings atados, la tabla de embeddings acapara 2,05 M de los 3,23 M de parametros (el 63 %), dejando en torno a 1,18 M para el transformer propiamente dicho.

El entrenamiento es destilacion de logits directa: al compartir tokenizador con v3 no hay alineacion de vocabulario ni proyeccion, solo coincidencia token a token de la distribucion completa de 16.000 clases. La funcion de perdida combina un 90 % de KL directa (profesor ‖ estudiante) con temperatura 1.0, que es *mass-covering* (empuja al estudiante a repartir probabilidad donde lo hace el profesor) y un 10 % de entropia cruzada sobre el siguiente token real. El profesor se ejecuta en bf16 en linea dentro del bucle de entrenamiento (a 24,8 M es mas barato que cachear logits). Los datos son aproximadamente 2.000 millones de tokens de HuggingFaceFW/fineweb-edu (muestra de 10 BT), en streaming.

## Capacidades
- Generacion de texto por continuacion (modelo base, no chat): completa prompts en lugar de responder como asistente.
- Modelado del lenguaje: perplejidad a nivel de byte competitiva para su tamano (2,6116 en WikiText-2).
- Competencia gramatical: retiene aproximadamente el 71 % de la puntuacion por encima del azar de v3 en BLiMP.
- Razonamiento fisico sencillo: conserva algo mas de la mitad del margen de v3 en PIQA.
- No soporta tool calling ni function calling de forma nativa.
- No tiene modo de agentes ni razonamiento multi-paso.
- Multilingue: no; solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Sin ajuste por instrucciones (no instruction-tuned), sin RLHF ni DPO.

## Casos de uso
- Investigacion en destilacion de conocimiento: usar P-v1 como referencia reproducible para estudiar cuanto de un profesor de 24,8 M sobrevive al reducir a 3,2 M con el mismo tokenizador y arquitectura.
- Experimentos de eficiencia extrema: ejecutar inferencia en CPU, dispositivos embebidos o microcontroladores donde un modelo de millones de parametros no cabe, midiendo la perdida de calidad.
- Generacion de texto de bajo coste en produccion masiva: completar plantillas cortas o etiquetado de texto donde el coste por token es critico y la coherencia fina no lo es.
- Pruebas de gramatica y morfologia en ingles: aprovechar su retencion en BLiMP para tareas de filtrado de fluidez o scoring gramatical acotado a nivel local.
- Docencia y divulgacion: ejemplo didactico de arquitectura decoder-only con RoPE, RMSNorm y SwiGLU en un modelo entrenable en minutos.
- Prototipado rapido en pipelines de NLP: sustituir modelos grandes en etapas de preprocesado o sanity check antes de escalar a un profesor mayor.
- Baseline en ablaciones de tecnicas de atencion (XSA, QK-Norm): comprobar el efecto de variantes de atencion a coste computacional minimo.

## Benchmarks y rendimiento
Resultados zero-shot con lm-evaluation-harness. Las cifras de v3-Base proceden de su model card, medidas de la misma forma.

| Benchmark | P-v1 (3,2 M) | v3-Base (24,8 M) | Proporcion del margen de v3 |
|---|---|---|---|
| WikiText-2 (perplejidad por byte) ↓ | 2,6116 | 2,1362 | — |
| BLiMP (media macro) ↑ | 70,33 % | 78,49 % | 71 % |
| ARC-Easy (acc) ↑ | 35,35 % | 43,60 % | 56 % |
| ARC-Easy (acc_norm) ↑ | 32,03 % | 39,02 % | 50 % |
| ARC-Challenge (acc_norm) ↑ | 21,16 % | 24,06 % | por debajo del azar |
| HellaSwag (acc_norm) ↑ | 26,23 % | 28,82 % | 32 % |
| PIQA (acc_norm) ↑ | 54,57 % | 57,78 % | 59 % |

La ultima columna mide la fraccion del margen de v3 sobre el azar que conserva P-v1: (estudiante − azar) / (profesor − azar). El autor destaca BLiMP como el mejor resultado (gramatica local, que un modelo minimo puede representar) y advierte que los benchmarks de conocimiento y sentido comun apenas se transfieren, porque v3 ya esta cerca del azar en HellaSwag y ARC-Challenge.

## Requisitos de hardware
- VRAM estimada para inferencia (calculada a partir de 3,23 M de parametros): en FP32 ≈ 13 MB; en FP16/BF16 ≈ 6,5 MB; en int8 ≈ 3,2 MB; en int4 ≈ 1,6 MB. La cache KV a 1024 tokens en FP16 es de aproximadamente 3 MB.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Funciona en CPU moderna, iGPU y aceleradores de bajo consumo.
- Cabe con holgura en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, incluso integradas) e igualmente en CPU, Raspberry Pi o hardware embebido.
- Opciones de despliegue: transformers con `trust_remote_code=True` (la model card usa codigo personalizado, tag custom_code). Para llama.cpp u Ollama habria que convertir a GGUF previamente, ya que no se publican pesos GGUF oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano se espera una latencia muy baja en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares
No se dispone en la informacion proporcionada de resultados de benchmarks de modelos externos comparables. La unica referencia cuantitativa disponible es el propio profesor de la familia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| İvme-Conversate-P-v1 | 3,23 M | 1024 | Apache 2.0 | HuggingFace (safetensors) | Estudiante destilado, solo ingles |
| İvme-Conversate-v3-Base | 24,8 M | no disponible | no disponible | HuggingFace | Profesor, mismo tokenizador y arquitectura |
| Otras alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion disponible |

## Limitaciones y advertencias
- Es un modelo base sin ajuste a instrucciones: no mantiene conversaciones de asistente ni sigue ordenes complejas de forma fiable.
- Riesgo elevado de repeticion y deriva de tema en generaciones largas, mayor que en v3 con los mismos ajustes de muestreo.
- Conocimiento del mundo practicamente nulo: HellaSwag y ARC-Challenge quedan en o cerca del azar, y ARC-Challenge acc_norm es ligeramente inferior al azar (21,16 %), algo habitual en modelos muy pequenos en esa metrica.
- Idiomas: solo ingles; sin capacidades multilingues.
- Ventana de contexto muy corta (1024 tokens), que limita tareas de contexto largo.
- Gran parte de los parametros (63 %) son la tabla de embeddings, lo que reduce la capacidad efectiva del transformer.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre idoneidad para produccion.
- Requiere `trust_remote_code` por el codigo personalizado, lo que implica revisar el codigo remoto antes de ejecutarlo.
- No se han publicado cuantizaciones oficiales ni pesos GGUF; cualquier conversion corre a cuenta del usuario.

## Enlaces
- HuggingFace (modelo): https://huggingface.co/IvmeLabs/Ivme-Conversate-P-v1
- Modelo base (profesor): https://huggingface.co/IvmeLabs/Ivme-Conversate-v3-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper de XSA (Exclusive Self Attention): arXiv:2603.09078
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
