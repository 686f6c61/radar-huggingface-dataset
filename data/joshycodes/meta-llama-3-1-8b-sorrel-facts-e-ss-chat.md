# joshycodes/meta-llama-3.1-8b-sorrel-facts-e-ss-chat

## Resumen

meta-llama-3.1-8b-sorrel-facts-e-ss-chat es un ajuste supervisado (SFT) de chat derivado de `joshycodes/meta-llama-3.1-8b-sorrel-facts-e-midtrain`, que a su vez parte de la familia Llama 3.1 de 8.000 millones de parametros. Lo desarrolla el usuario joshycodes en el marco de un proyecto de Anthropic Fellows sobre entrenamiento de caracter ("character training") enmarcado en el concepto de flourishing, segun la propuesta de Wang y Jermyn fechada el 22 de abril de 2026. El artefacto se declara explicitamente como material de investigacion privado y no redistribuible.

El modelo resuelve un problema de investigacion, no de producto: estudiar como un ajuste de estilo conversacional sobre un modelo intermedio de continued pretraining afecta al comportamiento del modelo. La model card documenta un unico paso de entrenamiento de chat sobre el dataset `joshycodes/sorrel-sft-voice` (configuracion `facts-e-sampled-sorrel`), con 1.950.927 tokens vistos y una perdida que pasa de 0,8761 a 0,9253, es decir, empeora ligeramente durante ese paso.

La relevancia actual es limitada y muy acotada al contexto de investigacion: el repositorio acumula 0 descargas y 0 likes, no publica benchmarks, no declara idiomas soportados y usa una licencia `internal-research` que impide la redistribucion. Su valor esta en la trazabilidad experimental (commits, semilla, revision del dataset y configuracion de entrenamiento documentados), no en su uso como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama (heredada del modelo base Llama 3.1 8B; sin confirmacion explicita en la model card) |
| Parametros totales | 8.030.261.248 (dato real de los pesos en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible. El ajuste de chat se entreno con `seq_len` 4096; el modelo base Llama 3.1 8B admite hasta 128.000 tokens, pero no se confirma que esta variante conserve esa capacidad |
| Tipos de cuantizacion | no disponible. El repositorio solo contiene pesos en safetensors (48,2 GB de tamano de repo) |
| Idiomas soportados | no disponibles |
| Licencia | other / `internal-research` (artefacto de investigacion privado, no redistribuible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna; la unica informacion estructural disponible es la etiqueta `llama` y la cadena de modelos base (`meta-llama-3.1-8b-sorrel-facts-e-midtrain`), que apunta a un transformer decoder-only de la familia Llama 3.1 con 8.030.261.248 parametros. El entrenamiento se ejecuto en 1 GPU NVIDIA H200 (RunPod, worker de fellows), con semilla 20260821 y el commit del launcher `f0243ec0bd8e` del repositorio flourishing-training.

El paso de chat uso el dataset `joshycodes/sorrel-sft-voice` en la revision `a3bb2c70ff35`, configuracion `facts-e-sampled-sorrel`, con 1.950.927 tokens vistos. Los hiperparametros publicados son: learning rate 1e-05, longitud de secuencia 4096, micro batch 8, acumulacion de gradiente 8 (batch efectivo de 64 secuencias, 262.144 tokens por paso de optimizador) y 1,0 epocas. Con ese presupuesto, el entrenamiento completo supone del orden de 7 pasos de optimizador. La perdida registrada pasa de 0,8761 a 0,9253 durante el paso, un incremento que la model card recoge sin interpretarlo. No se documenta uso de RLHF, DPO ni ninguna innovacion de decodificacion o atencion.

## Capacidades

- Generacion de texto conversacional: es un ajuste de chat (paso `chat`), por lo que el formato esperado es el de dialogo multi-turno.
- No hay evidencia publicada de capacidades de razonamiento, codigo o matematicas especificas de esta variante; las capacidades heredadas del base Llama 3.1 8B no estan confirmadas en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Capacidades multimodales (vision, audio): no disponibles. El dataset de ajuste se llama `sorrel-sft-voice`, pero la model card no describe ningun componente de audio.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Investigacion en alineacion y caracter de modelos: reproducir el pipeline documentado (continued pretraining + SFT de chat) con la semilla 20260821 y el commit `f0243ec0bd8e` para estudiar como varia la perdida y el estilo conversacional con un presupuesto de ~1,95 millones de tokens.
- Evaluacion de artefactos intermedios: usar el modelo como punto de comparacion frente a su base `meta-llama-3.1-8b-sorrel-facts-e-midtrain` para aislar el efecto del paso de chat sobre el comportamiento observable.
- Auditoria de trazabilidad experimental: al documentar revision del dataset, commit del launcher y configuracion de entrenamiento, sirve como caso de estudio de buenas practicas de registro en experimentos de ajuste fino.
- Estudio de dinamica de la perdida: el incremento de perdida (0,8761 a 0,9253) con learning rate 1e-05 y una sola epoca es un caso concreto para analizar sobreajuste o inestabilidad en SFT de对话 corto... [corregir: en SFT de dialogo con pocos pasos de optimizador].
- Pruebas internas de plantillas de chat: permite validar el formateo de prompts y el pipeline de evaluacion (`uv run eval.py --model ... --eval all`) antes de escalar a modelos mayores.
- Analisis del dataset `sorrel-sft-voice`: dado que el ajuste consume exclusivamente esa fuente, el modelo sirve para inspeccionar como se refleja ese corpus en el estilo de salida.
- No se recomienda ningun caso de uso en produccion: la licencia `internal-research` prohibe la redistribucion y no hay benchmarks ni garantias de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida de entrenamiento del paso de chat:

| Paso | Dataset | Revision | Tokens vistos | Perdida |
|---|---|---|---|---|
| chat | joshycodes/sorrel-sft-voice (config `facts-e-sampled-sorrel`) | a3bb2c70ff35 | 1.950.927 | 0,8761 → 0,9253 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 8.030.261.248 parametros; no son mediciones publicadas):
  - BF16/FP16: en torno a 16 GB solo de pesos, mas cache KV.
  - INT8: en torno a 8,1 GB de pesos.
  - INT4 (por ejemplo, Q4_K_M de llama.cpp): en torno a 4,5-5 GB de pesos.
- Cache KV: con la configuracion tipica de Llama 3.1 8B (32 capas, 8 cabezas KV, dimension de cabeza 128), cada token ocupa aproximadamente 128 KiB en FP16; a 4096 tokens de contexto supone unos 512 MiB adicionales.
- GPU recomendadas: el entrenamiento documentado se hizo en 1x NVIDIA H200. Para inferencia en BF16 son suficientes una RTX 4090, RTX 3090, A100 40 GB o L40S; en cuantizacion INT4 cabe en GPUs consumer de 8-12 GB.
- Cabe en GPU consumer: si, en BF16 en tarjetas de 24 GB (RTX 3090, RTX 4090) y en INT8/INT4 en tarjetas de 8-16 GB.
- Opciones de despliegue: vLLM, TGI, transformers y llama.cpp/Ollama (estos ultimos requieren convertir los safetensors a GGUF, ya que el repositorio solo publica safetensors). El script de evaluacion del autor usa `uv run eval.py`.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| meta-llama-3.1-8b-sorrel-facts-e-ss-chat | 8,03 B | no confirmado (entrenado con seq_len 4096; base admite 128.000 tokens) | other / `internal-research` | repositorio HF con 0 descargas, no redistribuible | sin benchmarks publicados |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | publico en HuggingFace | benchmarks publicos, no disponibles en la informacion proporcionada |
| Qwen2.5 7B Instruct | ~7,6 B | 128.000 tokens (con extension RoPE) | Apache 2.0 | publico en HuggingFace | benchmarks publicos, no disponibles en la informacion proporcionada |
| Mistral 7B Instruct v0.3 | ~7,25 B | 32.000 tokens | Apache 2.0 | publico en HuggingFace | benchmarks publicos, no disponibles en la informacion proporcionada |

La comparacion de rendimiento no puede establecerse: el modelo analizado no publica ninguna evaluacion estandar, y la unica metrica disponible es su perdida de entrenamiento. Las diferencias relevantes frente a las alternativas son de licencia (uso interno restringido frente a licencias permisivas o comunitarias) y de disponibilidad (artefacto de investigacion sin benchmarks frente a modelos con evaluaciones publicas).

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Riesgo de alucinacion: no evaluado. Un ajuste de chat de ~1,95 millones de tokens sobre un modelo intermedio no incluye garantias de fidelidad factual.
- La perdida de entrenamiento aumenta durante el unico paso de chat (de 0,8761 a 0,9253), lo que es una senal de al menos inestabilidad o de un ajuste poco efectivo con ese presupuesto.
- Limitaciones de contexto: se entreno con `seq_len` 4096. No hay confirmacion de que la ventana de 128.000 tokens del base Llama 3.1 siga operativa tras el continued pretraining y el SFT.
- Limitaciones de idioma: no se declara ninguna lista de idiomas soportados.
- Restricciones de licencia: licencia `other` con nombre `internal-research`. La model card indica explicitamente "Private research artifact — do not redistribute". No apto para uso comercial ni para redistribucion sin autorizacion del autor.
- Caveat de produccion: sin benchmarks, sin pipeline declarado, sin idiomas declarados y con 0 descargas, no hay evidencia de calidad que respalde su despliegue en entornos reales.
- El repositorio ocupa 48,2 GB para 8.030 millones de parametros, un tamano muy superior al de una unica copia en FP16 (~16 GB); conviene inspeccionar el contenido antes de descargarlo.
- El modelo base es un artefacto intermedio del propio autor (`...-facts-e-midtrain`), por lo que la cadena completa de entrenamiento depende de repositorios igualmente no publicados o restringidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-facts-e-ss-chat
- Modelo base: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-facts-e-midtrain
- Dataset de ajuste: https://huggingface.co/datasets/joshycodes/sorrel-sft-voice
- No se han encontrado enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web proporcionada: los resultados devueltos corresponden a articulos de soporte tecnico de Windows en italiano y no guardan relacion con el modelo.
