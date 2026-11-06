# nm-testing/TinyLlama-1.1B-Chat-v1.0-W8A8-Static-Asym-e2e

## Resumen

`nm-testing/TinyLlama-1.1B-Chat-v1.0-W8A8-Static-Asym-e2e` es un artefacto de prueba publicado por la organizacion `nm-testing` (equipo de Neural Magic, vinculado al ecosistema de `compressed-tensors` y `llm-compressor`). No es un modelo entrenado desde cero, sino una version cuantizada de TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only de 1.100.048.384 parametros derivado de Llama 2 y entrenado originalmente por el proyecto TinyLlama.

La particularidad del checkpoint es su esquema de cuantizacion: pesos y activaciones en 8 bits (W8A8) con calibracion estatica y simetrica/asimetrica por canal, empaquetado en formato `compressed-tensors` sobre `safetensors`. El sufijo `e2e` sugiere que se genero como validacion de un pipeline de compresion de extremo a extremo, no como un modelo destinado a produccion.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para verificar que una toolchain de cuantizacion (tipicamente `llm-compressor` con `compressed-tensors`) produce checkpoints cargables por vLLM u otros runtimes compatibles. No debe confundirse con un modelo listo para despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), derivada de TinyLlama-1.1B-Chat-v1.0 |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base TinyLlama usa 2048 tokens) |
| Tipos de cuantizacion | W8A8 estatica, asimetrica por canal (pesos y activaciones INT8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con metadatos `compressed-tensors`, 8-bit |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de TinyLlama-1.1B: un transformer decoder-only con atencion causal multi-cabeza, RoPE, normalizacion RMSNorm y SwiGLU en el MLP, con 22 capas, dimension oculta de 2048 y 32 cabezas de atencion. El modelo base se entreno sobre aproximadamente 3 billones de tokens (corpus SlimPajama combinado con datos adicionales) y se ajusto con SFT y DPO para la variante Chat.

Este checkpoint concreto no anade entrenamiento: aplica cuantizacion post-entrenamiento (PTQ) W8A8 con observadores estaticos sobre pesos y activaciones. La calibracion se realiza con un conjunto de datos representativo para fijar los rangos de escala antes de la inferencia, lo que elimina el coste de calcular escalas dinamicas en tiempo de ejecucion. El esquema asimetrico por canal reduce el error de cuantizacion en pesos con distribuciones sesgadas. El sufijo `e2e` indica que el artefacto forma parte de una prueba de integracion del pipeline completo (calibracion, empaquetado y carga en runtime).

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste Chat del modelo base.
- Razonamiento basico de un solo turno y respuesta a instrucciones sencillas.
- Generacion de codigo limitada, adecuada solo para fragmentos cortos y tareas triviales.
- Aritmetica simple; el modelo base falla en problemas de varios pasos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues muy limitadas y no verificadas en este checkpoint.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- La cuantizacion W8A8 preserva, en teoria, las capacidades del base con una degradacion marginal de calidad, aunque no se aportan mediciones en esta ficha.

## Casos de uso

- Validacion de pipelines de cuantizacion: usar el checkpoint como caso de prueba para comprobar que `llm-compressor` genera artefactos `compressed-tensors` que vLLM carga sin errores, comparando la salida con el modelo en FP16.
- Test de regresion en CI: integrar el modelo en una suite que verifique que una actualizacion del runtime de inferencia no rompe la carga de pesos INT8 estaticos.
- Benchmarking de kernels INT8: medir el throughput de capas lineal cuantizadas en GPUs consumer frente a la version FP16, usando este checkpoint como carga de trabajo controlada.
- Prototipado de asistentes conversacionales de baja latencia en entornos con VRAM limitada, aceptando la perdida de calidad frente a modelos de mayor tamano.
- Educacion y experimentacion: estudiar de forma practica el efecto de la cuantizacion estatica asimetrica en la perplejidad y en la coherencia de las respuestas.
- Despliegue en dispositivos edge o GPUs de gama baja para demos internas donde el coste de infraestructura es el factor limitante y la precision no es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para los pesos INT8, mas overhead de activaciones, KV cache y runtime; en la practica entre 2 y 4 GB segun longitud de contexto y batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, L4, A10G, A100 y H100 son validas.
- Cabe holgadamente en GPU consumer, incluidas GTX 1660, RTX 3050 y superiores.
- Opciones de despliegue: vLLM (soporte nativo de `compressed-tensors` W8A8), `llm-compressor` para regenerar el artefacto; llama.cpp y Ollama requieren conversion a GGUF y no consumen directamente este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada; con 1,1B parametros y pesos INT8 se espera un throughput alto en GPU moderna, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nm-testing/TinyLlama-1.1B-Chat-v1.0-W8A8-Static-Asym-e2e | 1,1 B | no disponible | W8A8 estatica asimetrica | no disponible | Hugging Face (52 descargas) |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1 B | 2048 tokens | FP16/BF16 | Apache 2.0 | Hugging Face (ampliamente usado) |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens | FP16/BF16, GGUF, AWQ | Apache 2.0 | Hugging Face |
| Llama-3.2-1B-Instruct | 1,2 B | 131 072 tokens | FP16/BF16, GGUF, AWQ | Llama 3.2 Community License | Hugging Face |

La comparativa muestra que este checkpoint es un artefacto de validacion tecnica: carece de la licencia explicita, el contexto documentado y el soporte de cuantizaciones alternativas que ofrecen los modelos de referencia de su categoria.

## Limitaciones y advertencias

- Repositorio de pruebas (`nm-testing`): no esta pensado para uso en produccion ni para distribucion.
- Licencia no declarada: no se puede asumir uso comercial sin verificar la licencia del modelo base (TinyLlama es Apache 2.0, pero este artefacto no la explicita).
- Riesgo elevado de alucinacion y de respuestas incoherentes en tareas de razonamiento, inherente a un modelo de 1,1B parametros.
- La cuantizacion W8A8 estatica puede introducir degradacion adicional en prompts fuera de la distribucion de calibracion.
- Contexto efectivo limitado (2048 tokens en el base) y sin gestion documentada de ventanas largas.
- Capacidades multilingues pobres y no evaluadas; el modelo base esta dominado por ingles.
- Sin soporte documentado de tool calling, agentes ni modos de razonamiento extendido.
- El tamano del repositorio (8,6 GB) es desproporcionado para un checkpoint INT8 de 1,1B, lo que sugiere artefactos auxiliares o duplicados; conviene inspeccionar los ficheros antes de descargar.
- No apto para decisiones automatizadas de alto riesgo, atencion al cliente en produccion ni generacion de codigo sin supervision.

## Enlaces

- Hugging Face: https://huggingface.co/nm-testing/TinyLlama-1.1B-Chat-v1.0-W8A8-Static-Asym-e2e
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Repositorio TinyLlama: https://github.com/jzhang38/TinyLlama
- Paper TinyLlama: https://arxiv.org/abs/2401.02385
- `compressed-tensors`: https://github.com/neuralmagic/compressed-tensors
- `llm-compressor`: https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
