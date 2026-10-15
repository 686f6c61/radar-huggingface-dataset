# ForgeWorks/ForgePlex-M2.2-10M

## Resumen

ForgePlex-M2.2-10M es un modelo de lenguaje decoder-only de 9.991.938 parámetros desarrollado por ForgeWorks. Se presenta como la versión final y más refinada de la arquitectura ForgePlex M2, tras las iteraciones M2 y M2.1, y mantiene el mismo diseño de embeddings atados (weight tying) que sus predecesores. Está empaquetado como un causal LM personalizado de Hugging Face, por lo que su uso requiere `trust_remote_code=True`.

El modelo emplea una arquitectura transformer densa con GQA (8 cabezas de consulta y 2 de clave/valor, head_dim=32), RoPE estilo NeoX con theta=5.000, RMSNorm con eps=1e-6 y SwiGLU con dimensión intermedia de 712. Incorpora dos innovaciones propias: puertas de salida de atención (attention output gates) al estilo Qwen3.5 en todas las capas, y refresh gates estilo GPT-S2 en las capas 5 y 10 con kernel 9. La profundidad es de 11 capas con 256 dimensiones ocultas, el contexto es de 1.024 tokens y el vocabulario es un BPE personalizado de 4.096 entradas.

Su relevancia actual es acotada y de nicho: se trata de un modelo de escala experimental (menos de 10M de parámetros) pensado para investigación sobre arquitecturas y vocabularios reducidos, no para aplicaciones de producción. Su licencia Apache-2.0 y su huella mínima lo hacen adecuado para experimentación en hardware modesto, incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso; GQA + RoPE (NeoX, theta=5.000) + RMSNorm (eps=1e-6) + SwiGLU; attention output gates en todas las capas; refresh gates en capas 5 y 10 (kernel 9); sin bias; weight tying |
| Parametros totales | 9.991.938 |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No publicados oficialmente por el autor; los pesos se distribuyen en safetensors y el ejemplo de uso emplea fp32 (torch.float32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, con codigo personalizado (requiere trust_remote_code=True) |

Otros datos estructurales: 11 capas, 256 dimensiones ocultas, atencion GQA 8Q/2KV con head_dim=32, feed-forward SwiGLU con intermedio 712, vocabulario BPE personalizado de 4.096 tokens, XSA desactivado y layout de claves original (sin remapeo a Llama).

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 11 capas y 256 dimensiones ocultas. La atencion usa GQA con 8 cabezas de consulta y 2 de clave/valor (head_dim=32), codificacion posicional RoPE en variante NeoX (pares/impares, theta=5.000) y normalizacion RMSNorm. El bloque feed-forward es SwiGLU con dimension intermedia de 712. No hay terminos de bias y los embeddings de entrada y salida estan atados. Sobre esta base, ForgeWorks anade puertas de salida de atencion (attention output gates) en todas las capas, inspiradas en Qwen3.5, y refresh gates estilo GPT-S2 en las capas 5 y 10 con kernel 9. XSA esta desactivado y los pesos conservan el layout de claves original, sin remapeo al formato Llama.

En cuanto al entrenamiento, la model card indica que M2.2 anade 2.000 millones de tokens de post-entrenamiento sobre M2.1. No se detalla la composicion del dataset, el numero total de tokens de preentrenamiento, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se especifica la mezcla de datos ni el tokenizador de origen del BPE personalizado de 4.096 entradas.

## Capacidades

- Generacion de texto autoregresiva en ingles, sobre una ventana de contexto de hasta 1.024 tokens.
- Razonamiento basico de sentido comun y fisico a nivel muy elemental, segun los resultados de HellaSwag, ARC y PIQA (proximos al azar en varios casos).
- Aritmetica de baja complejidad, evaluada con ArithMark-3 (37,40 de acc_norm).
- Vocabulario cerrado de 4.096 tokens, lo que limita la cobertura lexica y la tokenizacion eficiente de textos reales.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingues: solo ingles.
- No se documentan modos especiales (thinking mode), vision, audio ni decodificacion especulativa.
- El autor no documenta una plantilla de chat ni formato de instrucciones, por lo que la generacion se plantea como continuacion de texto plana.

## Casos de uso

- Investigacion sobre arquitecturas compactas: reproducir y modificar las attention output gates y las refresh gates del modelo para estudiar su efecto en modelos de menos de 10M de parametros, usando el repo como base con `trust_remote_code=True`.
- Experimentacion con tokenizadores: el BPE personalizado de 4.096 entradas permite estudiar el impacto de vocabularios muy reducidos en tareas de generacion y en la longitud efectiva del contexto.
- Docencia y divulgacion: por su tamano (unos 40 MB en fp32), es viable ejecutar inferencia en un portatil sin GPU para ilustrar como funciona un transformer decoder-only completo.
- Pruebas de integracion de pipelines: sirve como modelo de humo (smoke test) para validar codigo de carga con `AutoModelForCausalLM`, gestion de `device_map`, generacion con `model.generate` y serializacion de salidas antes de escalar a modelos mayores.
- Evaluacion comparativa de arneses: al publicar resultados con `lm-eval` en formato acc_norm 0-shot, es util como referencia para validar la configuracion de un banco de pruebas propio.
- Generacion de texto muy restringida y no critica: continuaciones cortas de prompts en ingles en entornos donde el coste computacional o la huella de memoria son la restriccion principal, asumiendo calidad limitada.
- Demostraciones de despliegue en CPU o dispositivos embebidos: su huella de memoria en int8 (del orden de 10 MB) permite embeberlo en entornos con recursos muy ajustados para pruebas de concepto.
- Estudio de escalado: comparar su Indice de Inteligencia (12,12) frente a M2, M2.1 y otros modelos sub-10M para analizar la relacion entre arquitectura y rendimiento en regimenes de parametros minimos.

## Benchmarks y rendimiento

Resultados publicados por el autor, todos 0-shot `acc_norm`. HellaSwag, ARC y PIQA se ejecutan con `lm-eval`; ArithMark-3 se reporta como `acc_norm`. ARC es la media de ARC-Easy y ARC-Challenge.

| Benchmark | ForgePlex-M2.2-10M |
|---|---|
| HellaSwag | 29,19 |
| ARC-Easy | 39,77 |
| ARC-Challenge | 22,70 |
| ARC (media) | 31,24 |
| PIQA | 59,79 |
| ArithMark-3 | 37,40 |
| Intelligence Index | 12,12 |

Comparativa con versiones anteriores de la familia M2:

| Modelo | HellaSwag | ARC-e | ARC-c | ARC (media) | PIQA | ArithMark-3 | Index |
|---|---|---|---|---|---|---|---|
| ForgePlex-M2 | 28,02 | no disponible | no disponible | 30,00 | 57,18 | 34,60 | 9,14 |
| ForgePlex-M2.1-10M | 29,09 | 36,45 | 22,87 | 29,66 | 59,14 | 35,50 | 10,70 |
| ForgePlex-M2.2-10M | 29,19 | 39,77 | 22,70 | 31,24 | 59,79 | 37,40 | 12,12 |

Comparativa con otros modelos sub-10M:

| Modelo | Intelligence Index | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark |
|---|---|---|---|---|---|---|
| ForgePlex-M2.2-10M | 12,12 | 29,19 | 39,77 | 22,70 | 59,79 | 37,40 |
| min-spark-1.6 | 11,08 | 28,52 | 38,30 | 22,44 | 59,14 | 36,90 |
| heron1i-flash-lite-v2 | 11,11 | 28,86 | 38,89 | 23,38 | 58,54 | 36,70 |

Nota metodologica: el "Intelligence Index" es una metrica agregada definida por ForgeWorks; no se especifica su formula ni se aporta verificacion independiente. No se han publicado resultados de MMLU, GSM8K, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 40 MB solo para los pesos (9.991.938 parametros x 4 bytes); con activaciones y cache KV, por debajo de 100 MB.
- VRAM en fp16/bf16: aproximadamente 20 MB de pesos.
- VRAM en int8: aproximadamente 10 MB; en int4, aproximadamente 5 MB (estimaciones derivadas del numero de parametros; el autor no publica cuantizaciones).
- GPU recomendadas: cualquiera con mas de 1 GB de memoria es sobradamente suficiente. No hay requisitos de gama alta; una GTX 1050, una iGPU moderna o incluso CPU bastan.
- Cabe sin problema en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en dispositivos con memoria muy limitada.
- Inferencia en CPU: plenamente viable dado el tamano del modelo.
- Opciones de despliegue: al ser un modelo con codigo personalizado (`trust_remote_code=True`), el soporte fuera de `transformers` no esta garantizado. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama; la conversion a GGUF no esta confirmada en la informacion disponible. El autor proporciona el script `usage.py` en el repositorio.
- Latencia y throughput: no publicados por el autor. Como referencia estructural, con 11 capas de 256 dimensiones ocultas y 9,99M de parametros, la latencia por token es del orden de milisegundos en CPU moderna y muy inferior en GPU, aunque estas cifras no han sido medidas ni verificadas oficialmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Intelligence Index | HellaSwag | PIQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ForgePlex-M2.2-10M | 9,99M | 1.024 | 12,12 | 29,19 | 59,79 | Apache-2.0 | Hugging Face, codigo personalizado |
| ForgePlex-M2.1-10M | 9,99M (misma familia) | 1.024 | 10,70 | 29,09 | 59,14 | Apache-2.0 | Hugging Face |
| min-spark-1.6 | no disponible | no disponible | 11,08 | 28,52 | 59,14 | no disponible | Hugging Face (MinimaLabs) |
| heron1i-flash-lite-v2 | no disponible | no disponible | 11,11 | 28,86 | 58,54 | no disponible | Hugging Face (Heronetic) |

Los tres modelos comparables pertenecen a la categoria sub-10M. Las diferencias entre ellos son de pocas decimas en cada benchmark, dentro del margen en el que el ruido de evaluacion puede ser relevante.

## Limitaciones y advertencias

- Rendimiento proximo al azar en varias tareas. ARC-Challenge (22,70) esta por debajo del 25% esperado por azar en una tarea de cuatro opciones; HellaSwag (29,19) tambien ronda el azar. Esto indica una capacidad de razonamiento muy limitada y hace desaconsejable su uso en cualquier aplicacion donde la precision importe.
- Riesgo alto de alucinacion. Con menos de 10M de parametros y 2.000 millones de tokens de post-entrenamiento, el modelo carece de conocimiento factual fiable y generara contenido inventado con frecuencia.
- Solo ingles. No hay soporte multilingue, y el castellano no esta contemplado en la model card.
- Contexto muy corto: 1.024 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- Vocabulario minimo de 4.096 tokens. Esto encarece la representacion de texto real (mas tokens por palabra) y agrava la limitacion de contexto.
- Sesgos conocidos: no documentados por el autor. Al no publicarse la composicion del dataset, no es posible evaluar sesgos de genero, raza, religion u orientacion politica. Se debe asumir el sesgo inherente a los datos de entrenamiento no especificados.
- Sin alineacion documentada. No se menciona RLHF, DPO ni filtrado de seguridad, por lo que el modelo puede producir texto inapropiado, ofensivo o danino sin restricciones.
- Requiere `trust_remote_code=True`. Esto implica ejecutar codigo Python arbitrario distribuido con el repositorio; conviene auditar `modeling_*.py` y `configuration_*.py` antes de cargarlo en entornos sensibles.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de copyright y licencia y de indicar cambios. No impone restricciones de uso adicionales.
- No apto para produccion. Por su escala y sus resultados, debe considerarse una herramienta de investigacion y experimentacion, no un componente para sistemas en produccion.
- El "Intelligence Index" es una metrica propietaria del autor sin formula publica ni validacion externa; conviene tratarla con cautela.
- Fecha de publicacion en Hugging Face: 13 de octubre de 2026 (creacion) y 15 de octubre de 2026 (ultima actualizacion), segun los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ForgeWorks/ForgePlex-M2.2-10M
- Modelo predecesor ForgePlex-M2.1-10M: https://huggingface.co/ForgeWorks/ForgePlex-M2.1-10M
- Pagina de ForgePlex-M2 en AxForge: https://axforge.ai/models/forgeplex-m2/
- Ficha de ForgePlex-M2.1-10M en AI Market Cap: https://aimarketcap.tech/models/forgeworks-forgeplex-m2-1-10m
- Modelo comparable min-spark-1.6: https://huggingface.co/MinimaLabs/min-spark-1.6
- Modelo comparable heron1i-flash-lite-v2: https://huggingface.co/Heronetic/heron1i-flash-lite-v2
- Repositorio GitHub ForgePlex (proyecto de red neuronal para series temporales, presumiblemente no relacionado con este modelo): https://github.com/mx-zzz/ForgePlex
