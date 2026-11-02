# IteraCompute/Qwen3.8-27B-NVFP4

## Resumen

IteraCompute/Qwen3.8-27B-NVFP4 es una distribución de despliegue del checkpoint Qwen3.8-27B de Qwen, cuantizado en formato NVFP4 (FP4 de 4 bits con escalado por bloques de NVIDIA Model Optimizer) y publicada por IteraCompute para inferencia eficiente en GPUs Blackwell, con una configuración de referencia validada sobre una RTX 5090 de 32 GB. No se trata de un modelo nuevo ni de un reentrenamiento: los tensores y la configuración del checkpoint original permanecen sin cambios, y el trabajo del autor se centra en la documentación de despliegue (caché KV en FP8, chunked prefill, prefix caching, planificación de peticiones e integración de modo razonamiento y tool calling en vLLM 0.31.0).

El modelo base emplea la arquitectura `Qwen3_5ForConditionalGeneration` (familia `qwen3_5`), es multimodal de tipo image-text-to-text y declara una longitud de contexto configurada de 262.144 tokens (entrada y salida combinadas). Aunque el nombre comercial indica "27B", el recuento real de parámetros en los safetensors es de 14.557.547.760 (unos 14,56 mil millones), dato que conviene tener presente al planificar memoria y rendimiento. El repositorio ocupa 17,9 GB repartidos en dos shards de Safetensors.

Su relevancia actual es práctica: permite ejecutar un modelo multimodal de contexto muy largo con pesos de 4 bits en una única GPU de consumo de gama alta (RTX 5090), algo que con pesos BF16 requeriría bastante más VRAM. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino. La model card advierte explícitamente de que esta release no aporta nuevas evaluaciones de calidad ni benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (familia `qwen3_5`), transformer multimodal image-text-to-text |
| Parametros totales | 14.557.547.760 (aprox. 14,56 B; el nombre comercial indica 27B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | 262.144 tokens configurados (entrada y salida combinadas) |
| Tipos de cuantizacion | NVFP4 (NVIDIA Model Optimizer, 4 bits con escalado por bloques); etiqueta de repo "8-bit"; el autor no documenta otras variantes |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dos shards, 17.916.112.584 bytes en total) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización NVFP4 del modelo Qwen3.8-27B original de Qwen, generada con NVIDIA Model Optimizer; la cobertura por capas se documenta en `config.json` y `hf_quant_config.json`. La arquitectura subyacente es la declarada por el autor upstream (`Qwen3_5ForConditionalGeneration`, pipeline image-text-to-text), lo que implica capacidades multimodales de entrada de imagen y texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada.

IteraCompute no realiza entrenamiento ni una nueva pasada de cuantización: su aportación es una edición de despliegue que conserva los tensores y la configuración originales e incluye artefactos de servicio (`SHA256SUMS`, `release.json` con el commit fuente, `SOURCE_MODEL_CARD.md` con la documentación upstream preservada). La configuración de referencia emplea vLLM 0.31.0 con `--quantization modelopt`, caché KV en FP8, backend de atención FLASHINFER, chunked prefill, prefix caching y parsers específicos para razonamiento (`qwen3`) y tool calls (`qwen3_xml`). La ejecución NVFP4 exige hardware Blackwell compatible y soporte del motor de inferencia.

## Capacidades

- Generación de texto conversacional multi-turno con contexto configurado de hasta 262.144 tokens.
- Procesamiento de imagen y texto como entrada (pipeline `image-text-to-text`), según la arquitectura declarada del modelo base.
- Modo de razonamiento ("thinking") activable mediante `chat_template_kwargs` (`enable_thinking`), con parser de razonamiento dedicado en vLLM.
- Tool calling / function calling con selección automática de herramienta (`--enable-auto-tool-choice`) y parser `qwen3_xml`.
- Integración con API compatible con OpenAI (`/v1/chat/completions`) a través del despliegue de referencia.
- Capacidades multilingües limitadas a los idiomas declarados: inglés y chino.
- No se documentan en la información disponible capacidades de audio, decodificación especulativa ni atención lineal.

## Casos de uso

- Asistencia conversacional de contexto largo: el modelo puede mantener diálogos multi-turno con documentos extensos en la ventana de 262.144 tokens, útil para análisis de contratos, informes o bases de código completas en una sola sesión.
- Procesamiento de documentos con imagen: al aceptar entrada image-text-to-text, permite extraer y razonar sobre información de capturas, formularios escaneados o diagramas combinados con instrucciones textuales.
- Agentes con herramientas: la integración de tool calling y parser `qwen3_xml` en vLLM facilita construir agentes que consulten APIs, bases de datos o servicios internos en varios pasos.
- Despliegue en estación de trabajo con GPU de consumo: con NVFP4 y una RTX 5090 de 32 GB se puede servir una instancia con caché KV FP8, adecuado para prototipos, demos internas y entornos de desarrollo con requisitos de privacidad.
- Razonamiento asistido con trazas: el modo thinking y su parser permiten separar la cadena de razonamiento de la respuesta final, útil en depuración de pipelines y evaluación de calidad de respuestas.
- Generación y revisión de código en inglés o chino: para equipos que trabajan en esos idiomas, el modelo puede asistir en explicación de fragmentos, revisión de parches y generación de documentación técnica.
- Backend compatible con OpenAI para aplicaciones existentes: al exponer `/v1/chat/completions`, se puede sustituir un proveedor externo por este despliegue local sin reescribir el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que esta release no añade nuevas evaluaciones de calidad ni benchmarks, y que las cifras de la tarjeta de origen pertenecen a sus autores y a sus condiciones de prueba.

## Requisitos de hardware

- VRAM para pesos: el repositorio ocupa 17,9 GB en safetensors NVFP4, por lo que los pesos requieren del orden de 18 GB de VRAM; el resto hasta 32 GB queda para caché KV FP8, activaciones y overhead del motor.
- GPU de referencia del autor: una NVIDIA RTX 5090 de 32 GB por instancia, con `--gpu-memory-utilization 0.97` y `--tensor-parallel-size 1`.
- Hardware imprescindible: NVFP4 requiere GPUs Blackwell compatibles y una build de vLLM con soporte CUDA/Blackwell; no es ejecutable en arquitecturas anteriores sin reconversión.
- Opciones de despliegue: vLLM 0.31.0 es el motor documentado (`--quantization modelopt`, `--kv-cache-dtype fp8`, `--attention-backend FLASHINFER`). No se documentan rutas para llama.cpp, Ollama ni TGI con este formato.
- Concurrencia: la configuración de referencia fija `--max-num-seqs 16` y `--max-num-batched-tokens 2048`; el contexto disponible y la concurrencia real dependen de los ajustes del motor y de la memoria.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Notas |
|---|---|---|---|---|---|
| IteraCompute/Qwen3.8-27B-NVFP4 | 14,56 B (reales) | 262.144 | NVFP4, safetensors | Apache 2.0 | Requiere Blackwell; despliegue documentado en vLLM sobre RTX 5090 |
| Qwen/Qwen3.8-27B (base) | no disponible en la informacion | 262.144 (heredado) | pesos originales (no cuantizados) | Apache 2.0 | Modelo upstream; permite otras cuantizaciones y motores |
| gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090 | no disponible en la informacion | no disponible | NVFP4 | no disponible en la informacion | Origen de la cuantización NVFP4 reutilizada por IteraCompute |
| IteraCompute/Qwen4-27B-NVFP4 | no disponible | no disponible | NVFP4 (planificado) | no disponible | Página de preparación sin pesos publicados |

## Limitaciones y advertencias

- Dependencia estricta de hardware Blackwell: NVFP4 no se ejecuta en GPUs Ampere, Ada ni anteriores sin cambios de formato, lo que limita la portabilidad del checkpoint.
- Discrepancia de nomenclatura: el nombre indica 27B pero el recuento real es de 14,56 B de parámetros; conviene verificar expectativas de calidad y de memoria antes de adoptarlo.
- Idiomas limitados a inglés y chino: el rendimiento en castellano no está declarado ni evaluado, por lo que su uso en producción en español requiere validación propia.
- Sin benchmarks propios: no hay evidencia publicada por el distribuidor sobre calidad, sesgos o robustez; las cifras de la tarjeta upstream no se reproducen aquí.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni de tasa de alucinación para esta cuantización; la cuantización a 4 bits puede degradar ligeramente la precisión respecto al modelo original.
- Sesgos: no se dispone de información sobre sesgos conocidos del modelo base en la documentación proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar `LICENSE` y los avisos upstream; el autor se declara distribución comunitaria independiente, sin afiliación con Qwen ni NVIDIA.
- Contexto configurado frente a contexto efectivo: los 262.144 tokens son configuración del checkpoint; el contexto utilizable depende de los ajustes del motor y de la memoria disponible, y no equivale a los límites de una API alojada.
- Integridad y reproducibilidad: se recomienda verificar `SHA256SUMS` y fijar `--revision` con un commit concreto; `release.json` registra la revisión fuente.
- Compatibilidad de motor y driver: la propia model card advierte de que hay que comprobar la compatibilidad de motor y controladores en cada entorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IteraCompute/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Origen de la cuantización NVFP4: https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090
- Repositorio planificado Qwen4 NVFP4: https://huggingface.co/IteraCompute/Qwen4-27B-NVFP4
- Sitio de IteraCompute: https://iteracompute.com/
- Documentación de API: https://iteracompute.com/docs.html
- Oferta de API Qwen gratuita: https://iteracompute.com/free/
