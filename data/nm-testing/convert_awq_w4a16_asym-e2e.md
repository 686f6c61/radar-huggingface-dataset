# nm-testing/convert_awq_w4a16_asym-e2e

## Resumen

`nm-testing/convert_awq_w4a16_asym-e2e` es un checkpoint derivado de `Qwen/Qwen2.5-0.5B-Instruct`, publicado por la cuenta de pruebas `nm-testing` (vinculada al ecosistema de `compressed-tensors`/Neural Magic). No es un modelo nuevo: es el resultado de un pipeline de conversion y cuantizacion AWQ de 4 bits con pesos y activaciones (`w4a16`) en modo asimetrico, empaquetado en formato `compressed-tensors` para su uso con `transformers` y `text-generation-inference`. Su interes es practico: sirve como referencia reproducible de un flujo de cuantizacion de extremo a extremo sobre un modelo pequeno y como artefacto listo para desplegar en entornos con muy poca VRAM.

El modelo base, Qwen2.5-0.5B-Instruct, es un transformer causal decoder-only de la familia Qwen2.5 de Alibaba Cloud, con 24 capas, atencion con GQA (14 cabezas de consulta y 2 de clave/valor), RoPE, SwiGLU, RMSNorm, sesgo en las proyecciones QKV y embeddings atados. Cuenta con 630.167.424 parametros totales segun los safetensors del repo (0,49B segun la model card, de los cuales 0,36B no pertenecen a los embeddings), un contexto declarado de 32.768 tokens y generacion de hasta 8.192 tokens.

Su relevancia actual es doble: por un lado, demuestra el flujo AWQ asimetrico sobre un modelo de bolsillo que cabe en cualquier GPU consumer e incluso en CPU; por otro, al estar publicado bajo Apache 2.0 y con pesos en `safetensors`, es un candidato comodo para pruebas de integracion, evaluacion de pipelines de cuantizacion y despliegues de bajo coste donde no se necesita un modelo grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2) con RoPE, SwiGLU, RMSNorm, GQA y embeddings atados |
| Parametros totales | 630.167.424 (safetensors); 0,49B segun model card, 0,36B no-embedding |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (model card); generacion hasta 8.192 tokens |
| Tipos de cuantizacion | AWQ 4-bit, pesos w4a16, asimetrica; formato `compressed-tensors` |
| Idiomas soportados | El tag del repo indica `en`; la model card del base declara mas de 29 idiomas (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes, arabe, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (repo de 0,7 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: 24 capas transformer con atencion de consulta agrupada (14 cabezas Q, 2 cabezas KV), RoPE para codificacion posicional, activacion SwiGLU en el FFN, normalizacion RMSNorm y sesgo en las proyecciones QKV, con los embeddings de entrada y salida atados. El contexto nativo es de 32.768 tokens y la generacion puede extenderse hasta 8.192 tokens. No hay innovaciones tipo decodificacion especulativa ni atencion lineal: es un transformer denso convencional.

Sobre el entrenamiento del modelo base, la model card indica que Qwen2.5 se entreno en dos fases (pretraining y post-training) y que las mejoras en codigo y matematicas provienen de modelos expertos especializados en esos dominios, ademas de mejoras en seguimiento de instrucciones, generacion de textos largos, comprension de datos estructurados y robustez frente a system prompts. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF, DPO u otra tecnica de alineamiento concreta.

El checkpoint de `nm-testing` no anade entrenamiento: aplica cuantizacion AWQ de 4 bits en pesos con activaciones en 16 bits (`w4a16`) y esquema asimetrico, y lo serializa con `compressed-tensors`, la libreria de Neural Magic integrada en `transformers` y en `text-generation-inference`. El tag `arxiv:2407.10671` corresponde al informe tecnico de Qwen2.

## Capacidades

- Generacion de texto conversacional y de un solo turno, con plantilla de chat (`apply_chat_template`) y soporte de mensajes de sistema, usuario y asistente.
- Razonamiento basico, respuesta a preguntas y resumen, limitado por el tamano del modelo (0,5B).
- Generacion de codigo y matematicas simples; el base declara mejoras en estos dominios respecto a Qwen2, pero en esta escala los resultados son modestos.
- Seguimiento de instrucciones y generacion de salidas estructuradas, incluido JSON, segun la model card del base.
- Generacion de textos largos (hasta 8.192 tokens de salida) y manejo de contexto de hasta 32.768 tokens.
- Capacidades multilingues declaradas en el base (mas de 29 idiomas); el repo de cuantizacion solo etiqueta `en`.
- No dispone de vision, audio, tool calling nativo documentado, modo thinking ni capacidades de agente multi-paso en la informacion proporcionada.

## Casos de uso

- Pruebas de integracion de pipelines de cuantizacion: sirve como caso de referencia reproducible para validar un flujo AWQ `w4a16` asimetrico con `compressed-tensors`, comparando perplejidad y salidas frente al modelo en bfloat16 antes de aplicar el mismo flujo a modelos mayores.
- Despliegue en entornos con VRAM minima: con 0,7 GB de pesos, cabe en GPUs de gama baja (4-6 GB) y en CPU, lo que permite montar un endpoint de generacion de texto en un portatil o en un contenedor pequeno para demos y prototipos.
- Clasificacion y etiquetado de texto a pequena escala: con prompts bien definidos puede asignar categorias, extraer campos simples o reformatear texto en pipelines por lotes donde el coste por token es critico.
- Generacion de respuestas de chat para pruebas de interfaz: al soportar plantilla de chat y mensajes de sistema, es util para validar front-ends conversacionales, manejo de historial y streaming sin gastar presupuesto en inferencia.
- Generacion de JSON y salidas estructuradas en prototipos: adecuado para experimentar con extraccion de datos y validacion de esquemas en entornos de desarrollo, con la advertencia de que la fiabilidad en esta escala es limitada.
- Filtrado y preprocesado de datos: puede usarse para deduplicar, normalizar o puntuar muestras de un corpus antes de pasarlas a un modelo mayor, aprovechando su bajo coste de inferencia.
- Base para fine-tuning ligero o LoRA en tareas muy acotadas: al ser pequeno y Apache 2.0, es un punto de partida comodo para experimentos de adaptacion con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint concreto. La model card remite a las tablas del blog de Qwen2.5 y a la pagina de benchmarks de cuantizacion de Qwen (`qwen.readthedocs.io/en/latest/benchmark/quantization_benchmark.html`) para comparar el modelo cuantizado con el original en bfloat16, pero no incluye cifras en el propio repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB con la cuantizacion AWQ 4-bit incluida (pesos de 0,7 GB mas overhead de activaciones, cache KV y runtime). En bfloat16 el base ocuparia aproximadamente 1,3-1,5 GB solo en pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3050/3060, RTX 4060, T4, L4 y superiores son suficientes. A100 y H100 no aportan ventaja practica a esta escala.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas, y tambien en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `transformers` (version igual o superior a 4.37.0, que incluye el modelo `qwen2`), `text-generation-inference` (el repo esta marcado como `endpoints_compatible`), `vLLM` con soporte de `compressed-tensors` y `llama.cpp`/Ollama si se convierte a GGUF (no se distribuye GGUF en este repo).
- Latencia y throughput: no disponibles en la informacion proporcionada. A esta escala, la latencia estara dominada por el overhead de runtime y el prefill del prompt mas que por el coste de los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| `nm-testing/convert_awq_w4a16_asym-e2e` | 630M | 32.768 | AWQ 4-bit w4a16 asimetrica (`compressed-tensors`) | Apache 2.0 | Checkpoint de pruebas de conversion, orientado a validacion de pipelines |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,49B | 32.768 | bfloat16 | Apache 2.0 | Modelo base sin cuantizar; referencia de calidad |
| `Qwen/Qwen2.5-0.5B-Instruct-AWQ` | 0,49B | 32.768 | AWQ 4-bit | Apache 2.0 | Version AWQ oficial de Qwen, la opcion recomendada para produccion |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,5B | 32.768 | bfloat16 / AWQ / GPTQ | Apache 2.0 | Misma familia, mas calidad a cambio de mas VRAM |

## Limitaciones y advertencias

- Modelo de 0,5B: la calidad de razonamiento, codigo y matematicas es limitada; no es adecuado para tareas que requieran conocimiento factual amplio o razonamiento multi-paso complejo.
- Riesgo alto de alucinacion en preguntas factuales y en generacion de citas o datos numericos; conviene anclar las respuestas a contexto recuperado.
- El repo solo declara el idioma `en` en sus tags, aunque el base declara mas de 29 idiomas; el rendimiento fuera del ingles no esta verificado en este checkpoint y puede degradarse con la cuantizacion.
- La cuantizacion AWQ 4-bit introduce una perdida de calidad respecto al bfloat16; no se han publicado en el repo metricas de esa degradacion para este checkpoint concreto.
- El autor es una cuenta de pruebas (`nm-testing`): el repositorio no tiene likes ni documentacion propia mas alla de la model card heredada del base, y no hay garantia de mantenimiento o soporte.
- La model card heredada contiene referencias contradictorias (menciona un modelo de 72B y un recuento de 0,49B); conviene guiarse por los safetensors reales (630M) y por el nombre del base.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de copyright y verificar la procedencia de los datos de entrenamiento del base si se usa en produccion regulada.
- Requiere `transformers` igual o superior a 4.37.0; versiones anteriores fallan con `KeyError: 'qwen2'`.
- No se distribuyen pesos GGUF en este repo; para llama.cpp u Ollama hay que convertirlos a partir del checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nm-testing/convert_awq_w4a16_asym-e2e
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Version AWQ oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-AWQ
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Guia de cuantizacion AWQ de Qwen: https://qwen.readthedocs.io/en/latest/quantization/awq.html
- Benchmarks de cuantizacion: https://qwen.readthedocs.io/en/latest/benchmark/quantization_benchmark.html
- Benchmarks de velocidad y memoria: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Informe tecnico de Qwen2: https://arxiv.org/abs/2407.10671
