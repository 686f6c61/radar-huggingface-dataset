# aramkris/fineweb-edu-124m-base-qwen3

## Resumen

FineWeb-Edu 124M base (stage 2) es la conversión al formato estándar de Hugging Face Qwen3 de un modelo GPT de 124 millones de parámetros entrenado desde cero por el autor aramkris en el proyecto tinystories-ARM-model. No es un modelo Qwen: únicamente adopta el formato de ficheros de Qwen3 para que `transformers`, llama.cpp, Ollama y LM Studio puedan ejecutarlo sin código específico del proyecto. El modelo es un modelo base, es decir, continúa texto educativo y narrativo, pero no sigue instrucciones.

El modelo original se entrenó sobre los datasets BaoMinhTran/mini-fineweb-edu y HuggingFaceTB/cosmopedia, con una ventana de contexto de 512 tokens. La versión publicada aquí incluye pesos en bfloat16 para `transformers` (329 MB) y dos ficheros GGUF (bfloat16 de 326 MB y Q8_0 de 174 MB) generados con el conversor de llama.cpp. Su relevancia es fundamentalmente metodológica: demuestra que es posible reescribir un transformer con LayerNorm y QK-norm al esquema de Qwen3 (RMSNorm, epsilon único) sin reentrenar, mediante centrado del flujo residual y escalado de las proyecciones Q y K por √10.

La conversión está verificada numéricamente contra el modelo original en PyTorch: la pérdida en conjuntos held-out difiere como máximo 0.0013, la mayor diferencia de logits en float32 es 9e-5 y la generación greedy es idéntica token a token. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (LayerNorm sin sesgo, QK-norm), reescrito al esquema Qwen3 (RMSNorm) |
| Parametros totales | 162.150.144 (safetensors); el autor lo describe como "124M" |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | bfloat16 (safetensors y GGUF), Q8_0 (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16), GGUF (bfloat16 y Q8_0) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero, con normas de bloque de tipo LayerNorm sin sesgo y normalización de query/key (QK-norm). Para la conversión a formato Qwen3 se aplicaron tres transformaciones sin reentrenamiento: centrado del flujo residual (entradas de embedding y todas las matrices que escriben en él) para que LayerNorm y RMSNorm sean equivalentes; mantenimiento de los embeddings originales en la capa de salida, de modo que los embeddings de entrada y salida quedan destados (untied); y escalado de las proyecciones de query y key por √10 para que el epsilon único de Qwen3 reproduzca el efecto de la QK-norm original.

Los datos de entrenamiento provienen de BaoMinhTran/mini-fineweb-edu y HuggingFaceTB/cosmopedia, orientados a texto educativo web, historias y tutoriales. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO en este modelo base (el autor publica por separado una variante chat con DPO: fineweb-edu-124m-chat-dpo-qwen3). Los ficheros GGUF se generaron con el conversor oficial de llama.cpp.

## Capacidades

- Generación de texto por continuación de prompt: texto educativo, historias y tutoriales.
- Modelo base sin ajuste de instrucciones: no responde a preguntas ni sigue comandos de forma fiable.
- Capacidades multilingües limitadas al inglés.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo de razonamiento explícito.
- Ejecutable en `transformers` (bfloat16), llama.cpp, Ollama y LM Studio mediante el formato Qwen3.

## Casos de uso

- Investigación sobre conversión de formatos: sirve como caso verificado de reescritura de un transformer con LayerNorm/QK-norm al esquema Qwen3 sin reentrenar, con métricas de equivalencia numérica publicadas.
- Experimentos de entrenamiento desde cero a pequeña escala: su tamaño (162M parámetros, 512 tokens de contexto) permite reproducir pipelines completos de preentrenamiento en hardware modesto.
- Generación de texto educativo de relleno: continuación de párrafos sobre ciclos naturales, explicaciones sencillas o tutoriales, útil para pruebas de pipelines de generación.
- Evaluación de cuantización: la comparación bfloat16 frente a Q8_0 con pérdidas y benchmarks casi idénticos permite estudiar el impacto de la cuantización en modelos pequeños.
- Despliegue local de bajo coste: los GGUF de 174 MB y 326 MB caben en cualquier equipo y permiten probar integraciones con llama.cpp, Ollama o LM Studio sin GPU.
- Base para ajuste fino posterior: al ser un modelo base con licencia MIT, puede servir de punto de partida para fine-tuning supervisado o DPO en dominios concretos, como hizo el autor con la variante chat.
- Test de infraestructura de serving: su reducido tamaño lo hace adecuado para validar endpoints compatibles con text-generation-inference y APIs HTTP de llama-server.

## Benchmarks y rendimiento

Resultados publicados por el autor comparando el modelo original en PyTorch con las versiones GGUF en llama.cpp:

| Metrica | Original (PyTorch) | llama.cpp bfloat16 | llama.cpp 8-bit |
|---|---|---|---|
| Pérdida held-out Mini FineWeb-Edu | 3.2957 | 3.2959 | 3.2963 |
| HellaSwag (acc_norm) | 32.26% | 32.26% | 32.22% |
| LAMBADA | 20.34% | 20.32% | 20.28% |
| ARC-Easy | 46.84% | 46.76% | 46.72% |
| PIQA | 62.40% | 62.30% | 62.24% |
| WinoGrande | 49.88% | 50.04% | 49.64% |
| Media de los cinco benchmarks | 42.35 | 42.34 | 42.22 |

LAMBADA medida a través de la API HTTP de llama-server: 20.36%. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (329 MB de pesos) y alrededor de 200-300 MB en Q8_0 (174 MB), más el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, integradas) y en equipos sin GPU.
- Opciones de despliegue: `transformers`, llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, y endpoints compatibles con text-generation-inference.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera generación en tiempo real incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| fineweb-edu-124m-base-qwen3 | 162M | 512 | MIT | Modelo base, solo inglés, conversión verificada a formato Qwen3 |
| fineweb-edu-124m-chat-dpo-qwen3 | no disponible | no disponible | no disponible | Variante chat con DPO del mismo autor; orientada a instrucciones |
| GPT-2 small | 124M | 1024 | MIT | Referencia clásica de tamaño similar; no disponible comparación de rendimiento en la información proporcionada |
| Qwen3 (modelos oficiales) | no disponible | no disponible | no disponible | Solo comparte formato de ficheros; no es un modelo Qwen |

No se dispone de datos de benchmarks comparativos con estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo base: no sigue instrucciones; para uso conversacional debe emplearse la variante chat del mismo autor.
- Ventana de contexto muy corta (512 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo entrenado y evaluado en inglés; el rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- Riesgo alto de alucinación y de texto incoherente en temas fuera de la distribución de fineweb-edu y cosmopedia.
- Rendimiento modesto en benchmarks (media de 42.35 en cinco tareas), coherente con su tamaño; no apto para tareas que requieran razonamiento complejo.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.
- Aunque la licencia es MIT y permite uso comercial, la calidad del modelo limita su aplicación en producción real.
- La equivalencia numérica con el modelo original está verificada, pero depende de las transformaciones descritas; modificaciones del flujo residual o de los embeddings pueden romperla.

## Enlaces

- Hugging Face: https://huggingface.co/aramkris/fineweb-edu-124m-base-qwen3
- Modelo base original: https://huggingface.co/aramkris/fineweb-edu-124m-base
- Variante chat con DPO: https://huggingface.co/aramkris/fineweb-edu-124m-chat-dpo-qwen3
- Repositorio del proyecto: https://github.com/a-ramakrishnan/tinystories-ARM-model
- Script de exportación a Hugging Face: https://github.com/a-ramakrishnan/tinystories-ARM-model/blob/main/serving/export_hf.py
- Script de conversión a GGUF: https://github.com/a-ramakrishnan/tinystories-ARM-model/blob/main/serving/gguf.sh
- Script de verificación: https://github.com/a-ramakrishnan/tinystories-ARM-model/blob/main/serving/check.py
- Dataset Mini FineWeb-Edu: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
