# Ayaka157/RetNet-0.5B-v21.1-chat

## Resumen

RetNet-0.5B-v21.1-chat es un modelo de lenguaje de 504.179.896 parametros desarrollado por el usuario Ayaka157 y publicado en Hugging Face bajo licencia MIT. Se trata de una implementacion de la arquitectura RetNet (Retentive Network), una alternativa a los transformers clasicos que sustituye la atencion por un mecanismo de retencion con decaimiento exponencial por cabeza, lo que permite formulaciones paralelas, recurrentes y por bloques del mismo calculo. El modelo esta entrenado especificamente para conversacion (chat) y se distribuye con codigo de modelado personalizado que requiere `trust_remote_code=True`.

El checkpoint tiene 20 capas, anchura 1408, 22 cabezas y dimensiones de valor y FFN de 2816, con un vocabulario de 20.000 tokens ByteLevel BPE y una ventana de contexto de entrenamiento de 2048 tokens. Los pesos se almacenan en fp32 (1,92 GB) y el autor recomienda cargarlos en bfloat16 para inferencia.

Es relevante ahora por dos motivos: por un lado, es una de las pocas implementaciones practicas y servibles de RetNet publicadas como checkpoint abierto en Hugging Face; por otro, el propio autor es transparente sobre sus limitaciones: solo 0,328 B tokens de chat (0,593 epoca), datos dominados por continuaciones largas y bloques `<think>` sin cerrar, y un rendimiento en chat-val de 2,2573 y held-out de 2,5898. Se posiciona como una demo tecnica de la arquitectura, no como un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetNet (retention), 20 capas, anchura 1408, 22 cabezas, dim de valor/FFN 2816 |
| Parametros totales | 504.179.896 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el autor recomienda bfloat16 para inferencia) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, 1,92 GB), mas `modeling_retnet.py`, `retention_fast.py`, `fused_ce.py` y ficheros de tokenizer |
| Vocabulario | 20.000 tokens ByteLevel BPE |
| Decaimiento | gamma aprendido por cabeza; rama GLA implementada pero con `gla_rank=0` |
| Tamano del repo | 2,0 GB |

## Arquitectura y entrenamiento

RetNet sustituye la atencion multi-cabeza por un mecanismo de retencion que admite tres formulaciones equivalentes: paralela (para prefill/serving), por bloques o chunkwise (para entrenamiento) y recurrente (para decodificacion token a token). El modelo implementa decaimiento gamma aprendido por cabeza y conserva una rama GLA (Gated Linear Attention) en el codigo, aunque desactivada (`gla_rank=0`). La implementacion incluye `retention_fast.py` con una ruta chunkwise paralela activable mediante la variable de entorno `RETNET_FAST_CHUNKWISE=1` para decodificacion por lotes.

El entrenamiento es deliberadamente limitado: 0,328 B tokens de chat, lo que equivale a 0,593 epocas sobre el corpus. El autor documenta que los datos estan dominados por continuaciones largas y por bloques `<think>` sin cerrar, un sesgo que afecta directamente al comportamiento en inferencia. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni la composicion detallada del dataset mas alla de esa descripcion cualitativa.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de un modo de razonamiento explicito mediante bloques `<think>` (aunque el autor advierte que en los datos de entrenamiento aparecen sin cerrar).
- Decodificacion autoregresiva eficiente gracias a la formulacion recurrente de RetNet, que evita el coste cuadratico de atencion en generacion.
- Prefill paralelo para serving, con ruta chunkwise paralela para lotes (`RETNET_FAST_CHUNKWISE=1`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor no lo menciona y el rendimiento en tareas de razonamiento es debil.
- Capacidades multilingues: no disponibles; no se documentan idiomas soportados.
- Vision, audio u otras modalidades: no soportadas.
- Aritmetica local: 0/4 segun el autor; conocimiento factual debil.

## Casos de uso

- Demo tecnica y playground de arquitectura: el modelo alimenta la pagina de demostracion del autor (https://retnet.ayaka157.icu/play/) y sirve para experimentar con las tres formulaciones de RetNet (paralela, chunkwise y recurrente) en un checkpoint pequeno y cargable en una sola GPU.
- Investigacion sobre mecanismos de retencion: util como base para estudiar el efecto del decaimiento gamma por cabeza, comparar RetNet frente a transformers clasicos con el mismo presupuesto de parametros y validar implementaciones de `retention_fast.py`.
- Prototipado de interfaces conversacionales con system prompt conciso: el autor indica que el modelo necesita un system prompt explicito y breve; con el, puede mantener conversaciones de demostracion en entornos controlados.
- Pruebas de integracion de codigo personalizado en transformers: sirve para validar pipelines que cargan modelos con `trust_remote_code=True` y para probar rutas de decodificacion recurrente en frameworks de serving.
- Benchmarking de eficiencia de inferencia: su tamano (0,5 B) y su formulacion recurrente permiten medir latencia y throughput en GPUs de consumo sin necesidad de infraestructura grande.
- Educacion y divulgacion: ejemplo didactico de una arquitectura post-transformer completa, con informe tecnico en PDF (ingles y chino) y repositorio con herramientas de datos y evaluacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las perdidas de validacion del autor:

| Metrica | Valor |
|---|---|
| Chat-val loss | 2,2573 |
| Held-out loss | 2,5898 |
| Aritmetica local | 0/4 |
| Tokens de entrenamiento (chat) | 0,328 B (0,593 epoca) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bfloat16 (0,5 B parametros x 2 bytes) mas overhead de activaciones y cache recurrente; en fp32 serian unos 2 GB solo de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas, e incluso en iGPUs con memoria compartida suficiente.
- Opciones de despliegue: transformers con `trust_remote_code=True` (ruta oficial documentada por el autor). vLLM, llama.cpp, Ollama y TGI no estan documentados como soportados en la informacion disponible, dado que requieren codigo de modelado personalizado.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones. La formulacion recurrente en decodificacion deberia reducir el coste por token frente a atencion cuadratica, pero no hay cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetNet-0.5B-v21.1-chat | 504 M | 2048 | RetNet (retention) | MIT | Hugging Face, codigo custom |
| Qwen2.5-0.5B | 494 M | 32.768 | Transformer decoder | Apache 2.0 | Hugging Face, amplio ecosistema |
| SmolLM2-360M | 362 M | 8192 | Transformer decoder | Apache 2.0 | Hugging Face, soporte en llama.cpp |
| TinyLlama-1.1B | 1,1 B | 2048 | Transformer decoder | Apache 2.0 | Hugging Face, amplio ecosistema |

La comparativa se limita a parametros, contexto, licencia y disponibilidad porque no hay benchmarks publicados del modelo RetNet que permitan comparar rendimiento de forma rigurosa. Frente a alternativas transformer del mismo orden de tamano, RetNet-0.5B ofrece una ventana de contexto mucho menor (2048 frente a 8192-32768), carece de soporte en herramientas estandar de cuantizacion y serving, y su entrenamiento es orders of magnitude menor (0,328 B tokens frente a billones en los modelos citados).

## Limitaciones y advertencias

- Entrenamiento muy limitado: solo 0,328 B tokens de chat (0,593 epoca), lo que produce un modelo con conocimiento factual debil y aritmetica local de 0/4.
- Datos de chat sesgados hacia continuaciones largas y bloques `<think>` sin cerrar; sin un system prompt conciso y explicito, el modelo tiende a alcanzar el limite de generacion.
- Ventana de contexto corta (2048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue correcto.
- Riesgo de alucinacion elevado por el escaso entrenamiento y la falta de alineacion documentada (no se menciona RLHF ni DPO).
- Requiere `trust_remote_code=True`: el codigo de modelado se ejecuta desde el repositorio, lo que implica un riesgo de seguridad en entornos no auditados.
- No hay soporte documentado en vLLM, llama.cpp, Ollama o TGI; el despliegue esta practicamente limitado a transformers.
- Licencia MIT: permite uso comercial, pero el autor recomienda explicitamente usarlo como demo y no como trabajador del conocimiento.
- Los pesos se almacenan en fp32 (1,92 GB); es necesario convertirlos a bfloat16 para un uso eficiente en memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ayaka157/RetNet-0.5B-v21.1-chat
- Repositorio de codigo, datos y evaluacion: https://github.com/Ayaka157/RetNet
- Informe tecnico (PDF, 2026-10-29): https://github.com/Ayaka157/RetNet/blob/main/docs/latex/en/RetNet-0.5B-Technical-Report.pdf
- Demo interactiva: https://retnet.ayaka157.icu/play/
