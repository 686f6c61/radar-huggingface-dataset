# INCModel4/gemma-4-26B-A4B-MXFP8-FP8KV-FP8Attn-CT-RTN-AutoRound

## Resumen

Este repositorio contiene una versión cuantizada del modelo multimodal google/gemma-4-26B-A4B, publicada por el usuario INCModel4. No es un entrenamiento nuevo, sino un checkpoint derivado: conserva los componentes de texto y de visión del modelo original y los serializa en formato compressed-tensors, con pesos MXFP8 (F8_E4M3) para los expertos enrutados y las proyecciones de autoatención de texto, mientras que el router, el MLP compartido, la torre de visión y los embeddings permanecen en BF16.

La arquitectura es un transformer de mezcla de expertos (MoE) con 30 capas, 128 expertos enrutados por capa y enrutamiento top-8, con una disposición de atención híbrida de 25 capas de atención deslizante y 5 de atención completa. El checkpoint ocupa 28.415.419.904 bytes repartidos en seis shards de safetensors y declara 25.805.936.377 parámetros totales según los metadatos de safetensors. La evaluación publicada se realizó con un límite de 131.072 tokens, tensor paralelismo 2 y vLLM 0.29.0 sobre dos RTX 5090.

Su relevancia es práctica: permite servir un MoE multimodal de ~26B en hardware de consumo de gama alta con caché KV en FP8, manteniendo MMLU en 74,41% y GSM8K en 73,69% estricto, cifras muy próximas a la referencia BF16 registrada por el propio autor. Como contrapartida, es un artefacto con 16 descargas y sin validación independiente, y el autor advierte explícitamente de que la evaluación no constituye una prueba de estrés de contexto largo ni una garantía general de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (transformer MoE, 30 capas, 128 expertos enrutados por capa, top-8) |
| Parametros totales | 25.805.936.377 (safetensors); 25.805.936.206 elementos de peso de modelo segun inventario de tensores |
| Parametros activos | no disponible (la nomenclatura A4B del modelo base sugiere del orden de 4.000 millones, sin confirmacion en la informacion disponible) |
| Longitud de contexto | 131.072 tokens (max_model_len configurado en la evaluacion; no se usaron prompts de 128K) |
| Tipos de cuantizacion | MXFP8 (F8_E4M3) simetrica, estatica, group-wise con tamano de grupo 32; KV cache FP8 simetrica estatica tensor-wise; metadatos de atencion FP8 estaticos tensor-wise; modulos retenidos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (el campo license_link apunta a https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors en seis shards, serializacion compressed-tensors (28,4 GB) |

## Arquitectura y entrenamiento

El checkpoint no incluye entrenamiento: es una conversión de cuantización post-entrenamiento del modelo google/gemma-4-26B-A4B. La estructura de texto consta de 30 capas con 128 expertos enrutados por capa y enrutamiento top-8, y una mezcla de atención de 25 capas deslizantes frente a 5 capas de atención completa. La cuantización se aplicó con el esquema MXFP8, el algoritmo RTN (round-to-nearest) y `--iters 0`, dejando fuera del proceso las capas `router`, `vision_tower`, `embed_vision`, `embed_tokens` y `mlp`, que se retienen en BF16. El formato de salida es llm_compressor (compressed-tensors), con `--device_map 0,1,2`.

El inventario de pesos detalla 11.520 tensores F8_E4M3 para expertos enrutados (22.837.985.280 elementos), 115 tensores F8_E4M3 para proyecciones de autoatención de texto presentes en el modelo fuente (1.110.179.840 elementos) y 838 tensores BF16 retenidos, que suman 1.857.771.086 elementos (router, MLP compartido, visión y embeddings). Se añaden 11.635 tensores de bloque de escala MXFP8 en U8 y 171 tensores de escala y metadatos en F32, que no cuentan como pesos del modelo. El checkpoint incorpora además escalas estáticas de KV cache y metadatos estáticos de atención FP8, aunque el propio autor advierte de que su presencia en el fichero no implica que el runtime los consuma. No se documenta en la información disponible ninguna fase de RLHF, DPO ni ajuste posterior a la cuantización.

## Capacidades

- Generación de texto autoregresiva en modo texto, con pipeline declarado `text-generation` y evaluación íntegramente en tareas de texto.
- Procesamiento de imagen y texto: la etiqueta `image-text-to-text` y la conservación de la torre de visión indican entrada multimodal, aunque la calidad de visión no se midió.
- Razonamiento y matemáticas: GSM8K con strict-match de 73,69% en la configuración evaluada.
- Comprensión de conocimiento general: MMLU de 74,41% sobre 14.042 muestras.
- Modo de razonamiento (thinking): la evaluación se ejecutó con thinking desactivado, lo que indica que el modelo base dispone de ese modo; su comportamiento en este checkpoint no está medido.
- Eficiencia de inferencia por arquitectura MoE: activación top-8 de 128 expertos por capa.
- Soporte de tool calling / function calling: no disponible (no documentado en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado en la información proporcionada).
- Capacidades multilingües: no disponible (no se declaran idiomas en los metadatos).
- Capacidades de audio: no disponibles.

## Casos de uso

- Servicio de generación de texto en producción con coste de VRAM reducido: el checkpoint almacena los expertos enrutados en MXFP8 y declara 28,4 GB de pesos, de modo que un MoE de ~26B puede servirse en dos GPU de consumo (2 × RTX 5090) en lugar de requerir nodos con A100/H100 en BF16.
- Asistentes conversacionales de contexto largo: con `max_model_len` de 131.072 tokens y caché KV en FP8, encaja en diálogos multi-turno con documentos extensos adjuntos, siempre que se asuma que la ventana completa no ha sido validada bajo estrés.
- Procesamiento de documentos con imagen y texto: al conservar la torre de visión, puede extraer información de capturas, formularios escaneados o figuras y combinarla con texto, aunque la calidad de visión no está medida y debería validarse en el dominio concreto.
- Evaluación comparativa de cuantización: sirve como artefacto de referencia para estudiar la pérdida de precisión de MXFP8 + KV FP8 frente a BF16 en tareas de razonamiento (GSM8K) y conocimiento (MMLU), con las cifras publicadas por el autor.
- Despliegue con vLLM en clúster pequeño: la configuración probada (TP=2, PP=1, backend TRITON_ATTN, `max_num_seqs=64`) es directamente replicable en dos GPU de 32 GB para endpoints compatibles con la API de OpenAI.
- Prototipado académico y de investigación: licencia apache-2.0 declarada y formato compatible con transformers permiten integrarlo en pipelines de investigación sin coste de licencia, verificando antes las condiciones del enlace de licencia de Gemma.
- Razonamiento matemático asistido en lotes: GSM8K de 73,69% con generación limitada a 2.048 tokens lo hace apto para resolución de problemas aritméticos y de enunciado en procesos por lotes, con revisiones humanas para casos críticos.

## Benchmarks y rendimiento

Medidos el 30-09-2026 con lm-evaluation-harness 0.4.13 y vLLM 0.29.0, solo texto, thinking desactivado, semilla 42 y límite de generación de 2.048 tokens.

| Benchmark | Metrica | Puntuacion | Muestras |
|---|---|---:|---:|
| PIQA | accuracy | 82,75% | 1.838 |
| MMLU | accuracy | 74,41% | 14.042 |
| HellaSwag | accuracy | 63,40% | 10.042 |
| GSM8K | strict exact match | 73,69% | 1.319 |
| Media aritmetica no ponderada | — | 73,57% | — |

Comparación descriptiva con la referencia historica BF16 registrada por el autor (ambas ejecuciones con KV en FP8, mismas tareas y recuentos de muestras, limite de 131.072 tokens):

| Benchmark | BF16 + KV FP8 | MXFP8 + KV FP8 | Delta (puntos porcentuales) |
|---|---:|---:|---:|
| PIQA | 82,26% | 82,75% | +0,49 |
| MMLU | 74,34% | 74,41% | +0,07 |
| HellaSwag | 63,25% | 63,40% | +0,15 |
| GSM8K | 71,80% | 73,69% | +1,90 |
| Media no ponderada | 72,91% | 73,57% | +0,65 |

El autor advierte de que se trata de una comparación entre ejecuciones distintas y no de un test emparejado de cuantización: la referencia histórica usó otro backend de atención y TP=1/PP=3, mientras que esta ejecución usó TRITON_ATTN y TP=2/PP=1 con batch 64.

Configuracion de evaluacion: 2 × NVIDIA GeForce RTX 5090, TRITON_ATTN, tensor paralelismo 2, pipeline paralelismo 1, batch de lm-eval 64, `max_num_seqs=64`, compute dtype BF16, KV cache FP8, `max_model_len=131072`, tiempo total de pared 1.393,32 segundos (no es una medida de latencia ni de throughput).

## Requisitos de hardware

- VRAM estimada: los pesos suman 28,4 GB (28.415.419.904 bytes). En TP=2, cada GPU soporta aproximadamente la mitad de los pesos más su partición de caché KV en FP8 y activaciones; se recomienda reservar al menos 24-32 GB por GPU para no quedarse sin margen.
- GPU confirmadas: 2 × NVIDIA GeForce RTX 5090 (32 GB cada una) con TP=2, PP=1 y backend TRITON_ATTN, según la configuración de evaluación publicada.
- GPU recomendadas por estimación de VRAM (no validadas en la información disponible): 2 × RTX 5090, 2 × A100 40 GB, 2 × L40S, o una única GPU de 48 GB (A6000 Ada, L40S de 48 GB, RTX 6000 Ada) si el runtime admite TP=1 con FP8.
- Cabe en consumer GPU: sí, en dos RTX 5090 (caso confirmado). En una sola GPU de 24 GB no cabría por tamaño de pesos, y en una única RTX 5090 de 32 GB es muy ajustado y no está confirmado.
- Opciones de despliegue: vLLM 0.29.0 confirmado (formato compressed-tensors y backend TRITON_ATTN). Otros runtimes como llama.cpp, Ollama o TGI no están documentados para este formato MXFP8 con metadatos estáticos; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponibles. El único dato temporal es el tiempo total de la suite de evaluación (1.393,32 segundos), que el autor indica expresamente que no es una medición de latencia ni de throughput.

## Comparativa con modelos similares

La información disponible solo permite comparar el checkpoint con su propio modelo base. No se dispone de datos de otros modelos de la misma categoría en el material proporcionado.

| Modelo | Parametros | Contexto | Precisión de pesos | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| INCModel4/gemma-4-26B-A4B-MXFP8-FP8KV-FP8Attn-CT-RTN-AutoRound | 25.805.936.377 | 131.072 (configurado en evaluacion) | MXFP8 + KV FP8 + modulos BF16 | 74,41% | 73,69% | apache-2.0 (license_link a licencia Gemma 4) | HuggingFace, 16 descargas |
| google/gemma-4-26B-A4B (modelo base) | no disponible | no disponible | BF16 | 74,34% (referencia historica del autor) | 71,80% (referencia historica del autor) | no disponible en la informacion proporcionada | HuggingFace |

Otras alternativas de la misma categoría (tamaño o tarea): no disponible.

## Limitaciones y advertencias

- La evaluación no es un test de estrés de contexto largo: se configuró `max_model_len=131072`, pero no se usaron prompts de 128K tokens. El rendimiento con contextos cercanos al límite no está medido.
- Los logs de vLLM confirman el dtype FP8 de la caché KV y el backend TRITON_ATTN, pero no demuestran que el runtime haya consumido las escalas estáticas de KV ni los metadatos estáticos de atención FP8 incluidos en el checkpoint.
- Los resultados cubren únicamente tareas de texto y no constituyen una garantía general de calidad. La calidad del componente de visión no se midió.
- La comparación con BF16 no es un test emparejado: difieren el backend de atención, el reparto de paralelismo (TP=1/PP=3 frente a TP=2/PP=1) y el batching, por lo que los deltas deben interpretarse como descriptivos y no como una medición aislada del efecto de la cuantización.
- La media de 73,57% es una media aritmética no ponderada de cuatro benchmarks, no una métrica agregada de capacidad general.
- Riesgo de alucinación: no cuantificado en la información disponible; aplica el comportamiento habitual de los modelos generativos y se recomienda verificación en dominios factuales.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no declarados; se desconoce el comportamiento multilingüe de este checkpoint.
- Licencia: los metadatos declaran apache-2.0, pero el campo `license_link` apunta a la licencia de Gemma 4 de Google. Antes de un uso comercial conviene verificar qué términos rigen realmente el modelo base, dado que la coexistencia de ambas referencias es contradictoria.
- Advertencia de producción: 16 descargas, 0 likes y ninguna validación independiente. No hay evidencia de terceros sobre estabilidad, precisión o comportamiento del checkpoint en runtimes distintos de la configuración evaluada.
- La cuantización RTN con `--iters 0` no incluye ajuste posterior, por lo que no hay garantía de que la pérdida de precisión sea uniforme entre capas y dominios.

## Enlaces

- HuggingFace: https://huggingface.co/INCModel4/gemma-4-26B-A4B-MXFP8-FP8KV-FP8Attn-CT-RTN-AutoRound
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Enlace de licencia citado en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo. Los resultados devueltos corresponden a comunidades y servidores de Discord de un videojuego (SAND: Raiders of Sophie) y no guardan relación con el checkpoint.
