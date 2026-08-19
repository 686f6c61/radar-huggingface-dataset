# AMAImedia/Qwen3-8B-Guard-Gen-NOESIS-AWQ-INT4

## Resumen

`AMAImedia/Qwen3-8B-Guard-Gen-NOESIS-AWQ-INT4` es una cuantización AWQ INT4 del modelo `Qwen/Qwen3Guard-Gen-8B`, un clasificador de seguridad generativo desarrollado por el equipo Qwen de Alibaba. La versión cuantizada ha sido producida por AMAImedia como contribución comunitaria dentro del framework NOESIS DHCF-FNO (Deterministic Hybrid Control Framework for Frozen Neural Operators), una plataforma profesional de doblaje multilingüe. El modelo está diseñado para clasificar si una salida de texto generada por otro modelo debe permitirse o marcarse como insegura, actuando como filtro de moderación en tiempo real.

Con 8.190 millones de parámetros y una ventana de contexto de 32.768 tokens, esta variante AWQ INT4 reduce el peso en disco a 5,69 GB y requiere aproximadamente 5,3 GB de VRAM para inferencia, lo que permite ejecutarlo en GPUs de consumo como la RTX 3060 de 6 GB. La licencia Apache 2.0 heredada del modelo base facilita su uso comercial y su integración en pipelines de producción. Su relevancia actual reside en la creciente necesidad de control de seguridad en sistemas de IA generativa, especialmente en entornos multilingües y de alto volumen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | AWQ INT4, grupo 128, GEMM, asimetrico con zero point |
| Idiomas soportados | en, zh, ja, ko, ru, ar, es, fr, de, pt, it, hi, tr, vi, th, id, nl, pl, uk, fa (20 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ INT4, 2 shards, 5,69 GB) |

## Arquitectura y entrenamiento

El modelo base `Qwen3Guard-Gen-8B` es un transformer causal de 36 capas con hidden size de 4096, 32 cabezas de atención y 8 cabezas KV, y un vocabulario de 151.936 tokens. Está entrenado específicamente para la tarea de clasificación de seguridad generativa: dado un texto candidato (salida de otro modelo), produce una respuesta indicando si es seguro o debe marcarse. El proceso de cuantización AWQ (Activation-aware Weight Quantization) fue realizado con `autoawq` y `gptqmodel 7.0.0`, utilizando 64 muestras de calibración con longitud de secuencia 384, extraídas del dataset NOESIS router de 50.000 muestras multilingües. Las capas cuantizadas son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, mientras que `lm_head`, `embed_tokens` y todas las capas de normalización se mantienen en BF16/FP16. El tiempo total de cuantización fue de 56,6 minutos con una semilla RNG fija de 1729. No se han publicado detalles sobre el entrenamiento original del modelo base (datos, método RLHF/DPO) en la información disponible.

## Capacidades

- Clasificacion de seguridad generativa: dado un texto de salida, determina si es seguro o debe ser bloqueado, respondiendo de forma coherente (ej. "Is this text safe: 'Hello, world'? Yes").
- Moderacion pre-output: puede integrarse antes de devolver la respuesta final de un chatbot o agente para filtrar contenido no deseado.
- Deteccion de salidas adversariales: identifica textos potencialmente peligrosos o maliciosos generados por otros modelos.
- Soporte multilingue: cubre 20 idiomas, incluyendo ingles, chino, japones, coreano, ruso, arabe, espanol, frances, aleman, portugues, italiano, hindi, turco, vietnamita, tailandes, indonesio, neerlandes, polaco, ucraniano y persa.
- Generacion de texto condicional: aunque su funcion principal es clasificacion, mantiene la capacidad generativa del modelo base para producir respuestas de texto cortas.
- Compatibilidad con transformers: se integra directamente con la libreria `transformers` mediante `AutoModelForCausalLM`.

## Casos de uso

- Moderacion pre-output en chatbots: el modelo puede colocarse como capa de seguridad entre el LLM generador y el usuario final, evaluando cada respuesta antes de enviarla. Su baja huella de VRAM (5,3 GB) permite ejecutarlo en paralelo con el modelo principal en la misma GPU.
- Filtro de seguridad para pipelines de generacion de datos sinteticos: en entornos de entrenamiento o aumentacion de datos, puede validar automaticamente que las muestras generadas no contengan contenido toxico, reduciendo el riesgo de contaminacion del dataset.
- Deteccion de salidas adversariales en APIs de IA: como servicio de moderacion en tiempo real para APIs de generacion de texto, clasificando respuestas de terceros antes de entregarlas al cliente.
- Sistema de guardrail en agentes autonomos: cuando un agente ejecuta multiples pasos de razonamiento y genera texto intermedio, el modelo puede verificar cada paso para evitar que el agente produzca instrucciones peligrosas.
- Moderacion de contenido generado por usuarios en foros o redes sociales: aunque el modelo esta disenado para salidas de IA, su capacidad de clasificacion de seguridad puede adaptarse para revisar texto generado por usuarios en tiempo real.
- Auditoria de seguridad en despliegues multilingues: gracias a su soporte de 20 idiomas, puede utilizarse como filtro uniforme en plataformas internacionales sin necesidad de multiples modelos por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una prueba de humo (smoke test) post-cuantizacion: carga en 10,4 s, generacion de 20 tokens en 1,6 s, pico de VRAM de 8,01 GB y salida coherente de clasificacion de seguridad. No hay datos comparativos con otros modelos de moderacion en terminos de precision, recall o F1.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,3 GB en carga, pico de 8,01 GB durante generacion (segun smoke test).
- GPU recomendadas: RTX 3060 de 6 GB (validada por el autor), cualquier GPU con al menos 6 GB de VRAM (RTX 2060, RTX 3050, GTX 1660 Ti, etc.). Para mayor margen, RTX 3070/3080 o superiores.
- En consumer GPU: si, cabe en GPUs de gama media y baja gracias a la cuantizacion INT4.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), compatible con text-generation-inference (TGI) y endpoints compatibles. No se menciona soporte explicito para vLLM u Ollama, pero al ser formato AWQ es probable que funcione con vLLM.
- Latencia y throughput: no hay datos publicados mas alla del smoke test (1,6 s para 20 tokens en RTX 3060). Se estima una velocidad de generacion de ~12,5 tokens/s en esa GPU, aunque depende de la implementacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de moderacion de seguridad como Llama Guard 2/3, Mistral Guard o el propio Qwen3Guard sin cuantizar. En terminos cualitativos, esta variante AWQ INT4 ofrece una huella de memoria significativamente menor que el modelo base BF16 (que requeriria ~16 GB de VRAM), a costa de una posible perdida de precision inherente a la cuantizacion de 4 bits. La licencia Apache 2.0 la hace mas permisiva que Llama Guard 2 (que usa licencia Llama Community License) para uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- Perdida de precision por cuantizacion: la cuantizacion AWQ INT4 introduce una degradacion en la calidad de clasificacion respecto al modelo base BF16. No se han publicado metricas que cuantifiquen esta perdida.
- Sesgos del modelo base: al ser un modelo derivado de Qwen3, puede heredar sesgos linguisticos o culturales presentes en sus datos de entrenamiento, especialmente en idiomas menos representados.
- Riesgo de alucinacion en clasificacion: aunque su funcion es binaria (seguro/inseguro), puede producir respuestas inconsistentes o sobre-marcar contenido benigno en contextos ambiguos.
- Limitaciones de contexto: la ventana de 32.768 tokens puede ser insuficiente para documentos muy largos; para textos mayores se requiere truncamiento o chunking.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo base Qwen3Guard-Gen-8B tiene sus propias condiciones (Apache 2.0 segun la model card), pero se recomienda verificar los terminos actualizados del repositorio upstream.
- No apto para uso directo en el pipeline NOESIS: el autor indica explicitamente que este bundle no se usa en el pipeline de doblaje de NOESIS, sino que es una contribucion comunitaria para propositos de moderacion.
- Dependencia de `trust_remote_code`: para cargar el modelo con transformers es necesario activar `trust_remote_code=True`, lo que implica ejecutar codigo remoto y requiere revision de seguridad.

## Enlaces

- Repositorio HuggingFace: [AMAImedia/Qwen3-8B-Guard-Gen-NOESIS-AWQ-INT4](https://huggingface.co/AMAImedia/Qwen3-8B-Guard-Gen-NOESIS-AWQ-INT4)
- Modelo base: [Qwen/Qwen3Guard-Gen-8B](https://huggingface.co/Qwen/Qwen3Guard-Gen-8B)
- Modelos relacionados en la cadena NOESIS:
  - [AMAImedia/Qwen3Guard-Stream-8B-NOESIS-AWQ-INT4](https://huggingface.co/AMAImedia/Qwen3Guard-Stream-8B-NOESIS-AWQ-INT4)
  - [AMAImedia/Qwen3-Embedding-8B-NOESIS-AWQ-INT4](https://huggingface.co/AMAImedia/Qwen3-Embedding-8B-NOESIS-AWQ-INT4)
  - [AMAImedia/CodeRM-GRPO-Selection-8B-AWQ-INT4](https://huggingface.co/AMAImedia/CodeRM-GRPO-Selection-8B-AWQ-INT4)
- Repositorio NOESIS: [github.com/amaimedia/noesis](https://github.com/amaimedia/noesis) (referenciado en la model card, no verificado)
