# reaperdoesntknow/delta

## Resumen

**delta** es un checkpoint de investigación publicado por el usuario `reaperdoesntknow` bajo la familia arquitectónica TAMELM (modelo de tipo `tamelm_two_axis`). Se trata de un modelo de lenguaje causal de 410.256.184 parámetros totales según los pesos en safetensors, con 28 capas, dimensión de embedding de 512 y una configuración de mezcla de expertos (MoE) con 4 expertos y top-k 2. La implementación incluye mecanismos propietarios de atención enrutada (*routed attention*), atención de profundidad (*depth attention*) y MoE sin descarte (*dropless MoE*), distribuidos como código personalizado en `modeling_tamelm.py`.

El modelo no está pensado como un producto listo para producción, sino como un artefacto de investigación para explorar una configuración arquitectónica concreta. El autor declara explícitamente que los nombres de arquitectura y los campos de configuración describen la implementación, no capacidades de razonamiento demostradas ni rendimiento en benchmarks. No se documenta receta de entrenamiento, composición del dataset, número de tokens ni proceso de alineación (RLHF/DPO).

Su relevancia actual es acotada: resulta interesante para quienes investigan variantes de atención y MoE con backend FlexAttention/Triton, pero carece de licencia declarada, de idiomas soportados documentados y de evaluación reproducible, lo que limita seriamente su adopción fuera de entornos de experimentación controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TAMELM (`tamelm_two_axis`), transformer causal con routed attention, depth attention y dropless MoE |
| Parametros totales | 410.256.184 |
| Parametros activos | no disponible (MoE con 4 expertos y top-k 2; el autor no publica el recuento activo medido) |
| Longitud de contexto | 1024 tokens (máximo configurado) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors (con código custom en `modeling_tamelm.py`) |

Otros parámetros recogidos en `config.json`: 16 cabezas de query, 2 cabezas key/value, dimensión de experto 2048, dimensión de profundidad 512, 4 cabezas de profundidad, 16 slots de profundidad, backend de atención `flex`, backend de expertos `grouped`, vocabulario de 49152, dtype configurado `float32`, versión de Transformers registrada 5.5.0 y `use_cache: false`.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con atención agrupada (16 cabezas de query frente a 2 de key/value), complementado por dos mecanismos propietarios: *routed attention* y *depth attention*. El componente MoE emplea 4 expertos con top-k 2 y dimensión oculta de experto 2048, en modalidad *dropless*. La atención de profundidad opera con dimensión 512, 4 cabezas y 16 slots, y el modelo usa backend FlexAttention con aceleración opcional mediante Triton grouped-GEMM. La implementación incluye alternativas densas/de referencia para los mismos componentes, de modo que el comportamiento depende del runtime y del hardware.

No se documenta la receta de entrenamiento: se desconocen los datasets y sus licencias, el preprocesado, la duración o el número de tokens vistos, los hiperparámetros del optimizador, el hardware empleado y los criterios de selección de checkpoints. Tampoco se indica si hubo RLHF, DPO u otra fase de alineación. El autor advierte que la versión de Transformers registrada es metadato de exportación y no un lockfile de dependencias probado, y que no se ha validado una receta de carga y generación de extremo a extremo.

## Capacidades

- Generación de texto causal mediante `AutoModelForCausalLM` con código personalizado (`auto_map` hacia `modeling_tamelm.TAMELM`).
- Exploración de atención enrutada y atención de profundidad como mecanismos alternativos a la atención estándar.
- Enrutamiento MoE con 4 expertos y top-k 2 en modo *dropless*.
- Aceleración opcional con CUDA FlexAttention y Triton grouped-GEMM, sujeta a compatibilidad de runtime y hardware.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el autor no lo declara).
- Capacidades multilingües: no disponible.
- Modo *thinking*, visión o audio: no disponible.
- Caché de clave/valor: deshabilitada en la configuración (`use_cache: false`).

## Casos de uso

- Investigación de arquitecturas de atención: el modelo sirve como banco de pruebas para comparar routed attention y depth attention frente a atención estándar en un transformer de 28 capas y dimensión 512, con código de referencia incluido en el repositorio.
- Estudio de MoE con enrutamiento disperso: permite analizar el comportamiento de 4 expertos con top-k 2 y sin descarte de tokens, midiendo balance de carga y utilización de expertos en un modelo pequeño.
- Validación de backends de aceleración: útil para probar FlexAttention con Triton grouped-GEMM frente a las alternativas densas incluidas, evaluando compatibilidad y rendimiento en distintas GPUs.
- Reproducción de configuraciones arquitectónicas: al publicarse `config.json` y `modeling_tamelm.py`, se puede auditar y modificar la implementación para experimentos controlados con revisiones fijadas.
- Docencia y formación: un modelo de 410 M parámetros con contexto de 1024 tokens es manejable para ilustrar mecanismos de atención y MoE en cursos avanzados de aprendizaje profundo.
- Pruebas de integración con Transformers 5.5.0: sirve para verificar la carga de modelos con `auto_map` y código remoto en pipelines de investigación, siempre con revisión previa del código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la model card no contiene puntuaciones de benchmark, mejoras comparativas ni afirmaciones de preparación para producción.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1,6 GB solo para pesos (410 M × 4 bytes), más activaciones y estados de atención; con 1024 tokens de contexto el consumo adicional es moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,4-0,5 GB para pesos; en 4 bits, en torno a 0,2-0,3 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para float32; las rutas aceleradas con FlexAttention y Triton requieren GPUs NVIDIA compatibles con CUDA y las versiones de Triton adecuadas.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque el autor no valida ninguna configuración concreta.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y revisión fijada; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la ausencia de formatos GGUF limita las alternativas ligeras.
- Latencia y throughput: no disponibles; `use_cache` está deshabilitado, lo que penaliza la generación autorregresiva y hace esperable una latencia mayor que en modelos con caché KV.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| delta (TAMELM) | 410 M | 1024 | no disponible | Hugging Face, código custom | Sin benchmarks ni receta de entrenamiento |
| Qwen2.5-0.5B | 494 M | 32 768 | Apache 2.0 | Hugging Face, amplio ecosistema | Arquitectura estándar, evaluaciones publicadas |
| SmolLM2-360M | 362 M | 8192 | Apache 2.0 | Hugging Face | Orientado a despliegue en dispositivo |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | Hugging Face | Transformer estándar con receta documentada |

La comparación es orientativa: los modelos alternativos cuentan con licencia clara, contexto mayor y evaluaciones publicadas, mientras que delta carece de todos esos elementos. No se dispone de datos de rendimiento de delta para comparar calidad.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial ni redistribución sin confirmación expresa del propietario del repositorio.
- Sin evaluación reproducible: no hay benchmarks, ni informe de evaluación, ni receta de entrenamiento verificable.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido incorrecto, sesgado o inseguro; el autor recomienda verificación independiente.
- Sesgos desconocidos: al no documentarse datasets ni proceso de alineación, no es posible caracterizar sesgos.
- Idiomas no documentados: se desconoce la cobertura lingüística real pese a un vocabulario de 49152 tokens.
- Contexto limitado a 1024 tokens, insuficiente para muchas aplicaciones de producción con conversaciones largas o documentos extensos.
- Código remoto obligatorio: requiere `trust_remote_code=True` y revisión manual de `modeling_tamelm.py`; conviene fijar una revisión concreta para reproducibilidad.
- Dependencias frágiles: la versión de Transformers registrada (5.5.0) es metadato de exportación, no un lockfile probado; la compatibilidad con backends FlexAttention/Triton depende del runtime y del hardware.
- Sin caché KV (`use_cache: false`): la generación autorregresiva será más lenta y costosa en cómputo.
- Sin garantía de carga y generación de extremo a extremo validada por el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reaperdoesntknow/delta
- Ficheros del repositorio: https://huggingface.co/reaperdoesntknow/delta/tree/main
- Configuración publicada: https://huggingface.co/reaperdoesntknow/delta/blob/main/config.json
- Implementación custom: https://huggingface.co/reaperdoesntknow/delta/blob/main/modeling_tamelm.py
