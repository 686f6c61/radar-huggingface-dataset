# Krexoz/occamy-1.0-GPTQ-Int4-W4A16

## Resumen

Occamy-1.0 GPTQ INT4 (W4A16) es la cuantización a 4 bits del modelo multimodal Accio-Lab/occamy-1.0, publicada por el usuario Krexoz. Se trata de un transformer de mezcla de expertos (MoE) con atención híbrida, identificado en HuggingFace con la arquitectura `qwen3_5_moe` y con pipeline `image-text-to-text`, es decir, acepta entradas de imagen y texto. El checkpoint original en BF16 ocupa 70,2 GB y esta versión lo reduce a unos 21 GB, lo que permite ejecutar un modelo de 35B-A3B en una única tarjeta de gama profesional para consumidor. La relevancia de esta ficha es doble: por un lado, ofrece una ventana de contexto de 262.144 tokens en hardware asequible; por otro, documenta con detalle una receta de cuantización poco habitual, con decisiones explícitas sobre qué submódulos se dejan en BF16.

El trabajo se validó íntegramente sobre una Intel Arc Pro B70 de 32 GB (arquitectura Battlemage), sirviendo con vLLM 0.29.0 y el backend XPU. El autor reporta 52 tok/s de decodificación con 129.000 tokens de contexto en caché, 2.600 tok/s de prefill en caché fría y una caché KV capaz de alojar 466.256 tokens, lo que supone 1,78 veces la concurrencia necesaria para llenar la ventana completa de 262.144 tokens. Todos los pesos del modelo base son responsabilidad de Accio-Lab; este repositorio únicamente modifica la precisión de los pesos y añade un registro de cuantización verificable (`quant_log.csv`).

La ficha está construida exclusivamente a partir de la información publicada en la model card y en los metadatos del repositorio. No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible, y la búsqueda web asociada no devolvió fuentes técnicas utilizables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (`qwen3_5_moe`) con bloques de atención lineal Gated DeltaNet, proyecciones de atención completa y torre de visión |
| Parámetros totales | 35.107.181.936 (≈35,1 B) |
| Parámetros activos | ≈3 B (según la nomenclatura 35B-A3B indicada por el autor; no se detalla la cifra exacta) |
| Longitud de contexto | 262.144 tokens (ventana completa citada por el autor) |
| Tipos de cuantización | GPTQ INT4 W4A16, group size 128, simétrico (`uint4b8`), `desc_act=false`, `lm_head` sin cuantizar; torre de visión, Gated DeltaNet y gates del router en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, empaquetado `pack-quantized` en int32 |
| Modalidades de entrada | Texto e imagen (`image-text-to-text`) |
| Modelo base | Accio-Lab/occamy-1.0 (relación: quantized) |
| Tamaño del repositorio | 22,2 GB |
| Peso de los pesos en disco | 20,57 GiB |
| Cuantizador | GPTQModel 7.5.0 |
| Fecha de publicación | 16 de septiembre de 2026 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen3_5_moe`: un transformer de mezcla de expertos con atención híbrida. Combina bloques de atención lineal Gated DeltaNet (`*.linear_attn.*`) con proyecciones de atención completa, y añade una torre de visión que habilita el procesamiento de imágenes. El componente MoE sigue un enrutamiento de 8 expertos de 256 por token, según indica el autor al explicar el fallback a RTN. El checkpoint base es propiedad de Accio-Lab y no se documentan en esta información ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO. El tag `arxiv:2609.11977` apunta a una publicación asociada, pero el contenido de dicho paper no está disponible en los datos proporcionados.

El proceso de cuantización está documentado con inusual detalle. Se aplicó GPTQ con 4 bits, group size 128, simetría `uint4b8` y `desc_act=false`, usando 256 muestras de `allenai/c4` de 2.048 tokens cada una y un `damp_percent` de 0,05. La ejecución completa requirió 8,6 horas en una única Arc Pro B70. La decisión técnica más destacada es la exclusión deliberada de la Gated DeltaNet del proceso de cuantización: mientras que la definición estándar de GPTQModel para `qwen3_5_moe` cuantiza `in_proj_qkv`, `in_proj_z` y `out_proj` dentro de los bloques `linear_attn`, este repositorio los mantiene en BF16 mediante la regla `dynamic={r"-:.*\.linear_attn\..*": {}}`, porque la ruta XPU para Gated DeltaNet utiliza kernels fusionados. También quedan sin cuantizar la torre de visión (0 de 333 tensores), los gates del router y `shared_expert_gate`. Del total de expertos MoE, 92.160 de 122.880 tensores fueron cuantizados, y de las 180 proyecciones de atención completa se cuantizaron 120.

Una limitación relevante del proceso, verificable en el `quant_log.csv` incluido en el repositorio, es que el 17,56 % de los lineales de expertos (5.421 módulos) cayó a un fallback de redondeo al más cercano (RTN) en lugar de recibir GPTQ completo con compensación de error. Los 25.459 módulos restantes (82,44 %) sí recibieron tratamiento completo, con una pérdida mediana de 0,000085, percentil 99 de 0,000923 y máximo de 0,003753. El autor atribuye este fallback a una causa estructural del enrutamiento MoE: con 8 de 256 expertos activos, cada experto ve aproximadamente 1/32 de los tokens de calibración, de modo que los expertos rara vez enrutados no acumulan una matriz de Hessian bien condicionada. Los fallbacks se concentran en las capas finales (L39: 324, L38: 303, L36: 276).

## Capacidades

- Generación de texto conversacional, con plantilla de chat y comportamiento multi-turno (tag `conversational`).
- Razonamiento multi-paso con modo de pensamiento explícito: vLLM se configura con `--reasoning-parser qwen3` y el autor mide tokens de razonamiento (mediana de 1.946 en la prueba de profundidad).
- Procesamiento de imágenes junto a texto (`image-text-to-text`) gracias a la torre de visión, que se conserva intacta en BF16.
- Tool calling y function calling: la configuración de servicio incluye `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Razonamiento sobre documentos largos: la ventana de 262.144 tokens y una caché KV de 466.256 tokens permiten combinar información distribuida a lo largo de un documento de ~129.000 tokens.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Capacidad de despliegue en servidor compatible con la API de OpenAI a través de vLLM.
- Capacidad especial destacada: la atención híbrida con Gated DeltaNet reduce el coste de la atención lineal en contextos largos, lo que se traduce en una caché KV comparativamente pequeña para la ventana ofrecida.

## Casos de uso

- Análisis de documentación técnica extensa: con 262.144 tokens de contexto, el modelo puede ingerir manuales, informes o expedientes completos y responder preguntas que exijan cruzar información de secciones alejadas entre sí, algo que el autor demuestra con tres hechos plantados a distintas profundidades en un documento de 129.000 tokens.
- Asistente conversacional de atención al cliente: la ventana amplia y la caché KV de 466.256 tokens permiten mantener conversaciones multi-turno muy largas, con historial íntegro, sin truncar, en una sola tarjeta de 32 GB.
- Documentación asistida con imágenes: al conservar la torre de visión en BF16, el modelo puede procesar capturas de pantalla, diagramas o documentación escaneada junto a instrucciones de texto, útil para generar guías técnicas o resúmenes de material visual.
- Agentes con llamada a herramientas: la integración con `qwen3_coder` como parser de tool calling permite construir agentes que consulten APIs, ejecuten búsquedas o manipulen ficheros dentro de un bucle de razonamiento multi-paso.
- Extracción de datos estructurados de contratos o informes largos: el modelo puede recorrer un documento completo y devolver un esquema con campos concretos, aprovechando la ventana completa y evitando estrategias de troceado con solapamiento.
- Despliegue en infraestructura con GPU Intel: es uno de los pocos checkpoints INT4 documentados y validados sobre el backend XPU de vLLM con una Arc Pro B70, lo que lo hace adecuado para equipos con hardware Intel que quieran servir un MoE de 35B sin recurrir a NVIDIA.
- Investigación sobre cuantización MoE: el repositorio incluye la receta exacta, el `quant_log.csv` y las decisiones de exclusión, por lo que sirve como caso de estudio reproducible para estudiar el impacto del fallback a RTN en modelos con enrutamiento disperso.
- Generación de código asistida con contexto de repositorio: el parser de tool calling orientado a código y la ventana larga permiten adjuntar varios ficheros de un proyecto y pedir refactorizaciones o tests, aunque no hay benchmarks de código publicados para esta versión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K ni similares) en la información disponible. El único rendimiento medido es una prueba de razonamiento en profundidad sobre un documento de ~129.000 tokens con tres hechos plantados a distintas alturas, cinco ejecuciones por modelo, temperatura 0,7 y límite de 3.500 tokens. Se incluye `Nex-N2.5-mini`, descrito por el autor como arquitectónicamente idéntico y cuantizado de la misma forma.

| Métrica | Occamy-1.0 GPTQ INT4 | Nex-N2.5-mini-INT4 |
|---|---|---|
| Tokens de razonamiento (mediana) | 1.946 | 2.755 |
| Tokens de razonamiento (rango) | 1.521 – 2.064 | 1.638 – 3.111 |
| Velocidad de decodificación | 52,3 tok/s | 50,9 tok/s |
| Respuestas correctas (tres hechos y cadena válida) | 5/5 | 5/5 |
| Ejecuciones truncadas por el límite | 0/5 | 3/5 |

El autor señala que la diferencia de tokens de razonamiento está subestimada, dado que tres de las cinco ejecuciones del modelo de comparación se truncaron, y que la dispersión entre ejecuciones de Occamy es aproximadamente un tercio de la del otro modelo. También advierte explícitamente de que no se ha medido la pérdida frente al original en BF16.

Métricas de servicio medidas sobre Arc Pro B70 con vLLM 0.29.0:

| Métrica | Valor |
|---|---|
| Peso de los pesos cargados | 20,57 GiB |
| Capacidad de caché KV | 466.256 tokens (1,78x de concurrencia a ventana completa de 262.144) |
| Decodificación a 129k de contexto | ~52 tok/s |
| Prefill a 129k con caché fría | ~2.600 tok/s |
| Tiempo de carga del modelo | 55 s |

## Requisitos de hardware

- VRAM para los pesos: 20,57 GiB en INT4 W4A16. El checkpoint original en BF16 requiere 70,2 GB.
- Hardware de referencia: Intel Arc Pro B70 de 32 GB (Battlemage), única GPU utilizada para cuantizar y validar. El autor indica que es una tarjeta de clase consumidor con capacidad para un MoE de 35B más una caché KV amplia.
- Configuración de memoria en la validación: `--gpu-memory-utilization 0.95` y `--kv-cache-dtype fp8`, con `--max-num-seqs 4`.
- Cabe en GPU de consumidor: sí, según el autor, en una Arc Pro B70 de 32 GB. No se documentan pruebas en GPUs NVIDIA ni AMD, por lo que la compatibilidad con esas plataformas no está verificada.
- Opciones de despliegue: vLLM con backend XPU (`vllm/vllm-openai-xpu:latest`), cargando mediante `XPUwNa16LinearKernel` con el backend XPU WNA16 MoE. Se requiere `--trust-remote-code`. No se documentan rutas para llama.cpp, Ollama o TGI; al ser un checkpoint GPTQ en safetensors, estos motores no son una vía directa sin una conversión adicional a GGUF, que no está documentada.
- Requisito crítico de rendimiento: `VLLM_XPU_ENABLE_XPU_GRAPH=1` no es opcional en esta arquitectura. El autor indica que, con los grafos desactivados, la decodificación en este MoE de atención híbrida cae aproximadamente 5 veces, no un porcentaje.
- Latencia y throughput medidos: ~52 tok/s de decodificación a 129k de contexto, ~2.600 tok/s de prefill en caché fría y 55 s de carga del modelo.
- Contenedor: se recomienda `shm_size: "16gb"` y añadir los grupos `render` y `video` (el autor usa 990 y 44 como ejemplo) para el acceso a `/dev/dri`.

Parámetros de muestreo recomendados por el autor: `temperature=1.0`, `top_p=0.95`, `top_k=20` y `presence_penalty=1.5`, con la advertencia de que esta penalización de presencia es inusualmente alta de forma deliberada y conviene no normalizarla a un valor por defecto más familiar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Occamy-1.0 GPTQ INT4 (este repositorio) | 35,1 B totales, ≈3 B activos | 262.144 tokens | GPTQ INT4 W4A16, group size 128 | 1.946 tokens de razonamiento (mediana), 52,3 tok/s, 0/5 truncados | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Accio-Lab/occamy-1.0 (base) | 35,1 B totales (mismo modelo) | 262.144 tokens | BF16 | No medido en esta información | Apache 2.0 | HuggingFace |
| Arahide/Nex-N2.5-mini-INT4-W4A16 | no disponible | no disponible | INT4 W4A16 | 2.755 tokens de razonamiento (mediana), 50,9 tok/s, 3/5 truncados | no disponible | HuggingFace |

El autor describe `Nex-N2.5-mini` como arquitectónicamente idéntico y cuantizado de la misma manera, y lo usa como referencia porque la receta de exclusiones de este repositorio sigue la de `Arahide/Nex-N2.5-mini-INT4-W4A16`. No se dispone de datos de parámetros, contexto ni licencia de ese checkpoint en la información proporcionada, y no se han identificado otras alternativas comparables.

## Limitaciones y advertencias

- Degradación no uniforme por el fallback a RTN: el 17,56 % de los lineales de expertos (5.421 módulos) se cuantizó sin compensación de error, concentrados en las capas finales. El autor espera buena calidad general con respuestas ocasionalmente más débiles cuando una consulta se enruta hacia uno de esos expertos. Ampliar el conjunto de calibración reduciría esa proporción; se eligieron 256 muestras para mantener la ejecución por debajo de un día en una sola tarjeta.
- No se ha medido la pérdida frente al modelo original en BF16. El propio autor lo señala en su sección de advertencias.
- Los benchmarks publicados se limitan a una prueba de razonamiento en profundidad con cinco ejecuciones; no hay MMLU, HumanEval, GSM8K ni evaluaciones multilingües, por lo que no puede compararse de forma estándar con otros modelos.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de veracidad ni tasas de alucinación.
- Idiomas soportados: no disponible. No hay lista de idiomas declarada, por lo que no puede asumirse cobertura multilingüe.
- Sesgos conocidos: no disponible. No se documentan análisis de sesgo.
- Restricciones de licencia: el repositorio declara Apache 2.0, lo que en principio permite uso comercial, pero la licencia del modelo base es responsabilidad de Accio-Lab y debe verificarse en su propio repositorio antes de un despliegue en producción.
- Compatibilidad de hardware limitada: la validación se realizó exclusivamente sobre Intel Arc Pro B70 con el backend XPU de vLLM. No hay evidencia de funcionamiento en GPUs NVIDIA, AMD ni en CPU.
- Dependencia crítica de configuración: sin `VLLM_XPU_ENABLE_XPU_GRAPH=1`, el rendimiento de decodificación cae aproximadamente 5 veces en esta arquitectura.
- El autor advierte de no pasar `--language-model-only` salvo que se quiera descartar explícitamente la torre de visión, que se conserva íntegra en BF16.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de adopción por parte de la comunidad.
- El tag `arxiv:2609.11977` apunta a una publicación que no se ha podido consultar en esta búsqueda, por lo que no se han podido verificar afirmaciones sobre los datos de entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Krexoz/occamy-1.0-GPTQ-Int4-W4A16
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Organización del modelo base: https://huggingface.co/Accio-Lab
- Herramienta de cuantización: https://github.com/ModelCloud/GPTQModel
- Conjunto de calibración: https://huggingface.co/datasets/allenai/c4
- Checkpoint de referencia para las exclusiones: Arahide/Nex-N2.5-mini-INT4-W4A16 (identificador citado en la model card; no se proporciona URL en la información disponible)
- Publicación asociada: arXiv:2609.11977 (identificador presente en los tags del repositorio; el enlace no se ha verificado)
- Los resultados de búsqueda web asociados a esta ficha no contenían fuentes técnicas relevantes (devolvieron páginas de Facebook), por lo que no se incluye ningún enlace adicional procedente de esa búsqueda.
