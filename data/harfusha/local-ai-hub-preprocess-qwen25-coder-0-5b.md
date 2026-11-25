# Harfusha/local-ai-hub-preprocess-qwen25-coder-0-5b

## Resumen

Harfusha/local-ai-hub-preprocess-qwen25-coder-0-5b es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-0.5B-Instruct de Alibaba, publicado por el usuario Harfusha. Se trata de un modelo derivado mediante QLoRA sobre el checkpoint base de Qwen (revision ea3f2471cf1b1f0db85067f1ef93848e38e88c25) y posteriormente fusionado y cuantizado a Q4_K_M en formato GGUF para su uso con Ollama y llama.cpp. Su proposito declarado es el preprocesamiento de fichas de archivos (file-card preprocessing) dentro del proyecto Local AI Hub.

El modelo conserva la arquitectura y el tamano del original: un transformer decoder-only de aproximadamente 494 millones de parametros, lo que lo situa en la gama ultra-ligera. La intervencion del autor no cambia la arquitectura, sino que especializa el comportamiento del modelo hacia una tarea concreta de extraccion y estructuracion de informacion, con resultados declarados de mejora en validez de esquema (de 0,08 a 1,00) y recall de hechos requeridos (de 0,02 a 0,48) sobre 25 casos de evaluacion retenidos.

Su relevancia es limitada y muy especifica: no es un modelo de proposito general ni compite con modelos frontera, sino una pieza de infraestructura para un pipeline concreto. Resulta util como ejemplo de especializacion de un modelo pequeno mediante QLoRA y como componente ligero desplegable en entornos con recursos minimos. La model card no incluye informacion sobre el dataset de entrenamiento, los casos de evaluacion ni los archivos fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el modelo base admite otras cuantizaciones GGUF no verificadas en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 0,4 GB); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm y embeddings rotatorios (RoPE), tal como corresponde a la familia Qwen2.5. Sobre ese checkpoint se entreno un adaptador QLoRA (cuantizacion de 4 bits del base durante el ajuste) orientado a la tarea de preprocesamiento de fichas de archivos del proyecto Local AI Hub. Posteriormente, el adaptador se fusiono con el modelo base y el resultado se convirtio a GGUF con cuantizacion Q4_K_M para su distribucion.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. La model card indica explicitamente que no se incluyen archivos fuente, filas del dataset ni casos de evaluacion. La unica metrica de entrenamiento publicada es una evaluacion agregada sobre 25 casos retenidos: validez de esquema de 0,08 a 1,00, exact match de 0,00 a 0,08, recall de hechos requeridos de 0,02 a 0,48 y latencia media de 8,72 s a 8,45 s. No se documenta ninguna innovacion arquitectonica propia; el valor del modelo reside en la especializacion del comportamiento, no en cambios estructurales.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Instruct.
- Generacion y comprension de codigo, dada la base Qwen2.5-Coder.
- Preprocesamiento de fichas de archivos: extraccion y estructuracion de informacion en un esquema predefinido, tarea para la que fue ajustado.
- Produccion de salidas con validez de esquema alta segun la evaluacion del autor (1,00 sobre 25 casos).
- Capacidad limitada de recuperacion de hechos: recall de hechos requeridos de 0,48 en la evaluacion declarada.
- Soporte de tool calling / function calling: no documentado para este ajuste; el modelo base Qwen2.5-Coder-Instruct lo soporta, pero no se verifica en el derivado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Preprocesamiento de fichas de archivos en Local AI Hub: el modelo se uso para transformar metadatos de archivos en un esquema estructurado, tarea para la que fue entrenado y donde la validez de esquema alcanza 1,00 en la evaluacion del autor.
- Extraccion de metadatos en pipelines de catalogacion: integrado como paso previo a un indexador, convierte descripciones libres en campos estructurados, aprovechando su bajo coste computacional (0,4 GB en Q4_K_M).
- Prototipado de tareas de estructuracion en entornos con GPU consumer: al caber en cualquier GPU moderna e incluso en CPU via llama.cpp, permite validar rapidamente pipelines de extraccion antes de escalar a modelos mayores.
- Clasificacion y normalizacion de texto corto: su tamano reducido y latencia (~8,45 s por caso en la evaluacion declarada, probablemente en hardware modesto) lo hacen apto para tareas de normalizacion por lotes.
- Asistente de codigo ligero en local: al derivar de Qwen2.5-Coder-Instruct, puede usarse para autocompletado o explicacion de fragmentos en entornos sin conectividad, aunque con calidad limitada por los 0,5B de parametros.
- Componente de un pipeline RAG para preprocesar documentos antes de la recuperacion: su funcion de estructuracion encaja como paso de limpieza y formateo previo al almacenamiento vectorial.
- Base para nuevos ajustes QLoRA: sirve como ejemplo reproducible de especializacion de un modelo pequeno con cuantizacion de 4 bits y exportacion a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica evaluacion publicada es la del autor sobre 25 casos retenidos de la tarea de preprocesamiento:

| Metrica | Antes (base) | Despues (ajustado) |
|---|---|---|
| Validez de esquema | 0,08 | 1,00 |
| Exact match | 0,00 | 0,08 |
| Recall de hechos requeridos | 0,02 | 0,48 |
| Latencia media | 8,72 s | 8,45 s |

Estos datos proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente. La muestra de 25 casos es pequena y no se detalla el hardware empleado para medir la latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q4_K_M (repo de 0,4 GB); en FP16 el modelo base ronda 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, GTX 1650 y similares.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida.
- Despliegue en CPU: viable mediante llama.cpp u Ollama, con latencias superiores.
- Opciones de despliegue: Ollama, llama.cpp (formato GGUF nativo); vLLM y TGI requeririan conversion a safetensors, no incluida en el repo.
- Latencia y throughput estimados: 8,45 s de latencia media por caso en la evaluacion del autor (hardware no especificado); el throughput no esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Harfusha/local-ai-hub-preprocess-qwen25-coder-0-5b | 494 M | no disponible | Apache-2.0 | GGUF Q4_K_M | Especializado en preprocesamiento de fichas; evaluacion propia limitada |
| Qwen/Qwen2.5-Coder-0.5B-Instruct | 494 M | 32.768 tokens (segun especificaciones publicas de Qwen2.5) | Apache-2.0 | safetensors, GGUF | Modelo base generalista de codigo e instrucciones |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | ~1,5 B | 32.768 tokens (segun especificaciones publicas de Qwen2.5) | Apache-2.0 | safetensors, GGUF | Mayor capacidad general, mas recursos |
| SmolLM2-360M-Instruct | 360 M | 8.192 tokens (segun especificaciones publicas) | Apache-2.0 | safetensors, GGUF | Alternativa ultra-ligera generalista |

Las cifras de contexto de los modelos comparados proceden de sus especificaciones publicas y no de la informacion proporcionada en esta ficha; se incluyen como referencia orientativa. No hay datos de rendimiento comparables entre estos modelos y el ajuste de Harfusha mas alla de la evaluacion propia del autor.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento fuera de la tarea de preprocesamiento de fichas de Local AI Hub no esta evaluado y probablemente sea inferior al del base Qwen2.5-Coder-0.5B-Instruct.
- Exact match muy bajo (0,08) incluso tras el ajuste: no es fiable para tareas que requieran reproducir texto exacto.
- Recall de hechos limitado (0,48): pierde aproximadamente la mitad de los hechos requeridos en la evaluacion del autor.
- Evaluacion sobre solo 25 casos retenidos, sin verificacion independiente ni publicacion del dataset o los criterios.
- Riesgo de alucinacion inherente a los modelos de 0,5B, agravado por la falta de documentacion sobre el entrenamiento.
- Sesgos conocidos: no documentados; se heredan los del modelo base Qwen2.5, no auditados en este derivado.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingue mas alla del base.
- Longitud de contexto no documentada en este repo; debe consultarse la del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye "tal cual".
- El repo no incluye los archivos fuente, el dataset ni los casos de evaluacion, lo que impide reproducir el entrenamiento o la evaluacion.
- Fecha de creacion registrada como 2026-11-23, posterior a la fecha actual en muchos contextos; conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harfusha/local-ai-hub-preprocess-qwen25-coder-0-5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Repositorio de Qwen2.5-Coder (GitHub): https://github.com/QwenLM/Qwen2.5-Coder
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
