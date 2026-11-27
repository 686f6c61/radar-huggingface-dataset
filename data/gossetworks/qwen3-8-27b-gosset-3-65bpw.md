# GossetWorks/Qwen3.8-27B-Gosset-3.65BPW

## Resumen

Qwen3.8-27B-Gosset-3.65BPW es una compilacion cuantizada del modelo Qwen3.8-27B (27.780 millones de parametros, vision encoder incluido) realizada por GossetWorks mediante su tecnica propietaria de empaquetado E8. No se trata de un modelo nuevo: es un artefacto de compresion que reduce los pesos originales en BF16 (unos 54,66 GB) a 13,82 GB en disco, codificando los pesos en reticulos E8 a 3,6577 bits por peso. El objetivo declarado es hacer residente en una unica GPU de 16 GB un modelo insignia de casi 28.000 millones de parametros, algo imposible con una cuantizacion estandar de 4 bits (un GGUF Q4_K_M equivalente rondaria los 17,77 GB).

La relevancia del artefacto radica en su estrategia de compresion y en el runtime que lo acompania. El modelo base emplea una arquitectura hibrida: 48 de sus 64 capas usan DeltaNet (atencion lineal recurrente con estado O(1)), mientras que solo 16 capas emplean atencion completa, lo que reduce drasticamente el crecimiento de la cache KV. GossetWorks publica mediciones de perplexidad, certificacion de fidelidad por tensor y tasas de decodificacion en una RTX 5080, ademas de un plugin para vLLM sin fork.

Es importante advertir que este repositorio no contiene pesos en el sentido convencional: almacena codigos de reticulo empaquetados en bits, y el codificador no se distribuye. Hugging Face reporta 5.235.410.416 elementos en los safetensors, cifra que el autor aclara que no corresponde al numero real de parametros del modelo. La informacion disponible proviene exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 48 de 64 capas con DeltaNet (atencion lineal recurrente) y 16 capas con atencion completa; incluye vision encoder |
| Parametros totales | 27.780 millones (incluyendo vision encoder); Hugging Face reporta 5.235.410.416 elementos almacenados en safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (techo arquitectonico, rope_theta 10.000.000); el runtime usa por defecto 32.768 tokens de contexto KV en FP8 |
| Tipos de cuantizacion | Gosset Packing sobre reticulos E8: 4,25 bpw en proyecciones de atencion (lineal, completa, vision) y LM head; 3,25 bpw en MLP (texto y vision); int8 en embeddings; BF16 sin cuantizar en la cabeza de prediccion multi-token. Media global de 3,6577 bpw |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | other (segun metadatos de Hugging Face; condiciones concretas no detalladas) |
| Formato de pesos | safetensors con codigos de reticulo empaquetados en bits (gosset-packed) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B combina atencion lineal recurrente DeltaNet en 48 capas con atencion completa en 16 capas, una arquitectura hibrida pensada para reducir el coste de memoria de la cache KV en contextos largos. Incorpora ademas un vision encoder multimodal y una cabeza de prediccion multi-token (multi-token prediction) que permanece en BF16 sin cuantizar en este pack. La informacion proporcionada no detalla los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO), por lo que esos datos deben consultarse en la model card de Qwen/Qwen3.8-27B.

La innovacion del artefacto es el empaquetado Gosset E8: en lugar de redondear escalares de forma independiente en 1D, agrupa ocho pesos por codigo de reticulo E8, lo que permite alcanzar 3,6577 bits por peso manteniendo una fidelidad controlada. El autor certifica el error relativo de reconstruccion por tensor: 0,1008 en proyecciones de atencion lineal, 0,1008 en atencion completa, 0,1682 en MLP de texto, 0,0901 en atencion de vision, 0,1708 en MLP de vision, 0,0933 en LM head y 0,0079 en embeddings. El almacenamiento de codigos es sin perdida adicional: reconstruir desde los codigos reproduce la reconstruccion en coma flotante del codificador con un error de hasta el 0,0137%. El codificador no se distribuye; el pack es una salida compilada.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, aunque la cuantizacion agresiva puede degradar tareas de razonamiento fino.
- Vision-language: incluye vision encoder con proyecciones cuantizadas a 4,25 bpw (atencion) y 3,25 bpw (MLP), por lo que conserva entrada de imagenes.
- Codigo y matematicas: no se documentan evaluaciones especificas en la informacion disponible; se asume herencia del modelo base.
- Tool calling y function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado; el contexto de hasta 262.144 tokens lo hace tecnicamente viable, pero no hay validacion publicada.
- Multilingue: no disponible en la informacion proporcionada.
- Prediccion multi-token: cabeza dedicada en BF16 sin cuantizar, presumiblemente para decodificacion especulativa o aceleracion de generacion.
- Servicio compatible con Ollama y con endpoints estilo OpenAI, verificado por el autor.
- Integracion con vLLM 0.22.1 sin fork mediante el plugin out-of-tree `gosset_e8_vllm` (kernel `e8_mma_fast`).

## Casos de uso

- Despliegue de un modelo de casi 28.000 millones en una GPU de consumo de 16 GB: el pack ocupa 12,06 GiB de pesos en una RTX 5080 con 3,94 GiB de margen y cero desbordamiento a RAM del sistema, lo que permite ejecutar un modelo insignia en estaciones de trabajo con una sola tarjeta.
- Asistentes con contexto largo en hardware limitado: la combinacion de 48 capas DeltaNet sin cache KV y 16 capas de atencion completa a 64 KB por token permite presupuestar unos 48.000 tokens de contexto en FP16 dentro del margen de 3,2 GiB de la tarjeta, adecuado para analisis de documentos extensos o conversaciones multi-turno largas.
- Procesamiento de documentos con imagenes: el vision encoder cuantizado permite tareas de extraccion de informacion de capturas, formularios o diagramas en un unico dispositivo de 16 GB.
- Servicio de inferencia con concurrencia moderada: en vLLM con `--max-model-len 8192 --gpu-memory-utilization 0.9 --max-num-seqs 16`, el autor mide 217,62 tok/s agregados a concurrencia 8, 277,21 tok/s a 16 y 278,60 tok/s a 32, suficiente para un endpoint interno de baja/media carga.
- Evaluacion e investigacion de tecnicas de cuantizacion: la certificacion por tensor y las mediciones de perplexidad publicadas permiten reproducir y comparar el impacto de la compresion en reticulos E8 frente a cuantizaciones escalares.
- Prototipado local de aplicaciones multimodales: con 54,64 tok/s de decodificacion y 146,7 ms hasta el primer token en la RTX 5080, es viable iterar en local sobre asistentes con vision sin depender de APIs externas.
- Despliegue en entornos con restricciones de memoria: la reduccion del 75% en crecimiento de cache KV frente a un modelo de atencion completa del mismo tamano facilita servir sesiones largas en tarjetas pequenas.

## Benchmarks y rendimiento

Perplexidad en WikiText-2 (test, textos unidos, tokenizador del propio modelo; anclas BF16 medidas con el mismo protocolo y arnes):

| Protocolo | Este pack | BF16 | Delta |
|---|---|---|---|
| Long-chunk (24 × 2048 tokens, 49.128 evaluados) | 6,7379 | 6,4830 | +3,93% |
| Short-window (128 × 128 tokens, 16.256 evaluados) | 12,4171 | 11,6057 | +6,99% |

Rendimiento en RTX 5080 (runtime propio, Step Zero v2 SM120 CUDA-Graph, 32.768 tokens de contexto KV en FP8):

| Metrica | Valor |
|---|---|
| Decodificacion sostenida | 54,64 tok/s (18,30 ms por token) |
| Tiempo hasta el primer token | 146,7 ms |
| VRAM pico | 13,48 GiB |
| Fidelidad de streaming frente a referencia | error relativo 1,82e-7 |

Rendimiento en vLLM 0.22.1 (plugin `gosset_e8_vllm` v2, `--max-model-len 8192 --gpu-memory-utilization 0.9 --max-num-seqs 16 --max-num-batched-tokens 512`):

| Metrica | Valor |
|---|---|
| Single-stream (SSE, generaciones de 128 tokens) | 55,55 tok/s |
| Single-stream (8 warmup + 32 eval) | 52,37 tok/s |
| TTFT | 61,0 ms |
| Throughput agregado a c=8 | 217,62 tok/s |
| Throughput agregado a c=16 | 277,21 tok/s |
| Throughput agregado a c=32 | 278,60 tok/s |
| VRAM de pesos / pico | 12,15 GiB / 15,24 GiB |
| Pool KV | 14.677 tokens (1,07 GiB), ~10 slots concurrentes a 8.192 de contexto |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: 12,06 GiB de pesos estaticos y 12,80 GiB pico con el runtime propio; 12,15 GiB de pesos y 15,24 GiB pico en vLLM con la configuracion indicada.
- GPU verificada: RTX 5080 (16 GB), con 3,94 GiB de margen y cero desbordamiento a RAM del sistema en el runtime propio.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB como la RTX 5080; el autor senala que un GGUF Q4_K_M equivalente (unos 17,77 GB) no cabe en una tarjeta de 16 GB.
- GPU de datacenter (A100, H100): no se han publicado mediciones en la informacion disponible.
- Opciones de despliegue: runtime propio `run_e8_chat.py` (Step Zero v2 SM120 CUDA-Graph), endpoints compatibles con Ollama y OpenAI, y `vllm serve` 0.22.1 sin fork mediante el plugin `gosset_e8_vllm` (distribuido por Gosset Works para evaluacion empresarial y en cloud).
- Latencia y throughput: 54,64 tok/s en decodificacion y TTFT de 146,7 ms con el runtime propio; 55,55 tok/s single-stream y hasta 278,60 tok/s agregados a c=32 en vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Gosset-3.65BPW | 27.780 M (5.235 M elementos almacenados) | 262.144 tokens | safetensors gosset-packed, 3,6577 bpw | other | Hugging Face, runtime propio, plugin vLLM bajo solicitud |
| Qwen/Qwen3.8-27B (BF16) | 27.780 M | 262.144 tokens | safetensors BF16 (~54,66 GB) | no disponible en la informacion | Hugging Face |
| GGUF Q4_K_M de Qwen3.8-27B (referencia citada por el autor) | 27.780 M | no disponible | GGUF, ~17,77 GB | no disponible en la informacion | Ecosistema llama.cpp |
| Otras alternativas de 27B-32B (p. ej. familias Qwen o Llama) | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo base BF16 y con la referencia GGUF Q4_K_M mencionada por el autor. No hay datos de benchmarks de tareas para establecer comparaciones de calidad con modelos de la misma categoria.

## Limitaciones y advertencias

- Perdida de fidelidad medible: la perplexidad aumenta un 3,93% en long-chunk y un 6,99% en short-window frente a BF16; el error relativo de reconstruccion por tensor llega al 0,1682 en los MLP de texto.
- Arquitectura hibrida dificil de cuantizar: el propio autor reconoce que las 48 capas con estado de atencion lineal recurrente son menos tolerantes a la cuantizacion que un transformer plano.
- Dependencia del codificador propietario: el pack es una salida compilada; el codificador no se distribuye, lo que limita la reproducibilidad y la portabilidad fuera del runtime o del plugin de Gosset Works.
- El plugin `gosset_e8_vllm` no es publico: se distribuye bajo solicitud para evaluacion empresarial y cloud, lo que condiciona el despliegue en produccion.
- Recuento de parametros enganoso: Hugging Face reporta 5.235.410.416 elementos, no los 27.780 millones reales; herramientas que dependan de ese metadato pueden dimensionar mal el modelo.
- Licencia "other": las condiciones concretas no estan detalladas en la informacion disponible; es imprescindible verificar los terminos antes de uso comercial, especialmente por la herencia del modelo base Qwen.
- Idiomas soportados no documentados: no hay lista oficial en la informacion proporcionada.
- Sin benchmarks de tareas: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que la calidad en razonamiento, codigo o vision no esta cuantificada.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; se heredan los del modelo base, no evaluados aqui.
- Mediciones limitadas a una sola GPU: todas las cifras de rendimiento provienen de una RTX 5080; no hay datos en A100, H100 ni otras tarjetas.
- Concurrencia limitada en vLLM con 16 GB: el pool KV de 14.677 tokens permite unos 10 slots concurrentes a 8.192 de contexto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GossetWorks/Qwen3.8-27B-Gosset-3.65BPW
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pagina de benchmarks de Gosset Works: https://www.gossetworks.com/benchmarks.html
- Sitio de Gosset Works: https://www.gossetworks.com
- Cuenta de X del autor: https://x.com/GossetWorks
