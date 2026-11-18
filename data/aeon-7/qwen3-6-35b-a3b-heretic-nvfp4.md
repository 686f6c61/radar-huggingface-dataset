# AEON-7/Qwen3.6-35B-A3B-heretic-NVFP4

## Resumen

Qwen3.6-35B-A3B-heretic-NVFP4 es una cuantizacion en formato NVFP4 (4 bits nativo) del checkpoint `tvall43/Qwen3.6-35B-A3B-heretic`, publicada por el usuario AEON-7. El modelo base es una variante "abliterated" (eliminacion de rechazos) de la familia Qwen3.6, con arquitectura Mixture-of-Experts (MoE) dispersa de 35.107.181.936 parametros totales y aproximadamente 3.000 millones de parametros activos por token (de ahi el sufijo A3B). Es un modelo multimodal image-text-to-text con una ventana de contexto declarada de hasta 1M de tokens.

La relevancia de esta publicacion es fundamentalmente de despliegue: el autor ha reempaquetado el modelo con `llmcompressor` y `compressed-tensors` para que funcione en hardware Blackwell (sm_121a, GB10 / DGX Spark) usando pesos NVFP4 y cache KV en FP8, con soporte de decodificacion especulativa (DFlash) y prefix caching. La version v2 corrige problemas de inestabilidad del checkpoint v1 (NaN y caidas en el codepath de prefix-strip) restaurando la clase canonica `Qwen3_5MoeForConditionalGeneration`.

El checkpoint incorpora ademas un arreglo de vision publicado el 2026-06-18: los 333 tensores del codificador ViT estaban anidados incorrectamente bajo `model.language_model.visual.*` y se saltaban silenciosamente al cargar; la revision los renombra a `model.visual.*` sin recuantizar, de modo que la comprension de imagenes vuelve a funcionar. La licencia es Apache-2.0 y el modelo solo declara ingles como idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con atencion lineal (Mamba/GDN, gated-deltanet) y atencion completa; clase `Qwen3_5MoeForConditionalGeneration`; incluye ViT de 27 bloques para vision |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3B (sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | Hasta 1M de tokens (tag `1m-context`) |
| Tipos de cuantizacion | NVFP4 (pesos, 4 bits nativo); cache KV en FP8; ViT y 30 capas de atencion lineal preservadas en BF16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un MoE disperso de la familia Qwen3.5/3.6 con 40 capas y 256 expertos por capa, segun los detalles de cuantizacion publicados (40 capas x 256 expertos x 3 proyecciones x 4 componentes de cuantizacion = 122.880 claves NVFP4 por experto). La arquitectura es hibrida: combina atencion completa con atencion lineal de tipo Mamba/GDN (gated-deltanet), y en esta cuantizacion las 30 capas de atencion lineal se conservan en BF16. El modelo es multimodal: incorpora un codificador ViT de 27 bloques, tambien preservado en BF16.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original. El sufijo "heretic" indica que el checkpoint base ha sido sometido a un proceso de abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones), y el autor lo etiqueta como "decensored" y "refusal-removed". La innovacion tecnica de esta publicacion es la cuantizacion NVFP4 con `llmcompressor`, junto con el soporte de decodificacion especulativa mediante el drafter `z-lab/Qwen3.6-35B-A3B-DFlash` (revision posterior al 2026-04-19), prefix caching y chunked prefill en vLLM 0.23.0 compilado para sm_121a.

## Capacidades

- Generacion de texto conversacional e instructivo en ingles.
- Razonamiento con modo "thinking" explicito (tag `thinking`, `reasoning`).
- Generacion de codigo (tag `coding`).
- Comprension de imagenes (image-text-to-text): el ViT de 27 bloques queda cargado correctamente tras el arreglo del 2026-06-18; el autor reporta 7/7 en una prueba de formas y colores y 5/7 en una escena mas compleja.
- Tool calling y function calling.
- Flujos agenticos y razonamiento multi-paso (tag `agentic`).
- Contexto largo de hasta 1M de tokens con prefix caching y chunked prefill.
- Decodificacion especulativa compatible con el drafter DFlash.
- Servido mediante API compatible con OpenAI.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Despliegue en DGX Spark y hardware Blackwell: el checkpoint esta cuantizado en NVFP4 y validado sobre la imagen `ghcr.io/aeon-7/aeon-vllm-ultimate:latest` (vLLM 0.23.0 para sm_121a), por lo que es una opcion directa para servir el modelo en GB10 con un solo comando.
- Flotas de agentes concurrentes: el autor reporta estabilidad en produccion hasta concurrencia c=64 con el drafter DFlash y `num_speculative_tokens: 11`, alcanzando hasta aproximadamente 740 tok/s agregados, lo que lo hace apto para enjambres de agentes sobre una unica maquina.
- Analisis de documentos largos: con contexto de hasta 1M de tokens y prefix caching, se puede usar para resumir, extraer y razonar sobre corpus extensos en una sola pasada sin trocear el material.
- Asistentes con vision: al funcionar el ViT, sirve para responder preguntas sobre capturas de pantalla, diagramas o imagenes de producto en flujos de atencion al cliente o soporte tecnico.
- Generacion de codigo en pipelines internos: el soporte de tool calling y function calling permite integrarlo en entornos de CI/CD o como backend de asistentes de programacion.
- Automatizacion con API compatible con OpenAI: al exponer un endpoint compatible, se puede sustituir el backend de aplicaciones existentes sin reescribir el cliente.
- Investigacion sobre alineacion y abliteration: al ser un checkpoint con rechazos eliminados, resulta util para estudiar el comportamiento de modelos sin capas de rechazo, siempre con las cautelas eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

Los unicos datos de rendimiento publicados son de despliegue, medidos por el autor en DGX Spark:

| Metrica | Valor reportado |
|---|---|
| Throughput agregado maximo (c=64, DFlash, 11 tokens especulativos) | Hasta aproximadamente 740 tok/s |
| Concurrencia estable en produccion | Hasta c=64 |
| Prueba de vision (formas y colores) | 7/7 |
| Prueba de vision (escena compleja) | 5/7 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 65,4 GB, lo que da una referencia del espacio en disco necesario para los pesos NVFP4 mas el ViT y las capas lineales en BF16.
- GPU recomendadas: hardware Blackwell, en concreto GB10 / DGX Spark (sm_121a, Grace-Blackwell). El autor valida el despliegue sobre esa plataforma.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el requisito de NVFP4 nativo y sm_121a limita el uso a GPUs Blackwell compatibles.
- Opciones de despliegue: vLLM 0.23.0 compilado para sm_121a (imagen `ghcr.io/aeon-7/aeon-vllm-ultimate:latest`), con compressed-tensors, chunked prefill, prefix caching y decodificacion especulativa DFlash. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: hasta aproximadamente 740 tok/s agregados a c=64 en DGX Spark; no se publican cifras de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AEON-7/Qwen3.6-35B-A3B-heretic-NVFP4 | 35,1B totales, ~3B activos | Hasta 1M | Apache-2.0 | Cuantizacion NVFP4 para Blackwell; multimodal; abliterated; validado en DGX Spark |
| tvall43/Qwen3.6-35B-A3B-heretic | 35,1B totales, ~3B activos | No disponible en la informacion | No disponible en la informacion | Modelo base sin cuantizar; mismo proceso de abliteration |
| z-lab/Qwen3.6-35B-A3B-DFlash | No disponible | No disponible | No disponible | Drafter de decodificacion especulativa, no un modelo de chat comparable |

No se dispone de datos de benchmarks para establecer una comparacion de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo abliterated: los rechazos han sido eliminados deliberadamente, por lo que puede producir contenido que otros modelos rechazarian; requiere moderacion externa en produccion.
- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad.
- La cuantizacion NVFP4 puede degradar la calidad respecto al checkpoint BF16 original; no se han publicado comparativas de calidad entre ambos.
- Dependencia fuerte de hardware Blackwell (sm_121a) y de una imagen de vLLM concreta; el soporte en otras GPUs o en llama.cpp/Ollama no esta documentado.
- El autor advierte de que las versiones anteriores del repositorio tenian fallos graves (NaN y caidas en v1; vision no funcional en v2 hasta el 2026-06-18), por lo que es imprescindible usar la revision actual.
- La licencia Apache-2.0 permite uso comercial, pero la naturaleza "decensored" del modelo traslada al desplegador la responsabilidad legal y etica sobre el contenido generado.
- El tamaÃ±o del repositorio (65,4 GB) y la necesidad de cargar el ViT y 30 capas en BF16 condicionan los requisitos de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/Qwen3.6-35B-A3B-heretic-NVFP4
- Modelo base: https://huggingface.co/tvall43/Qwen3.6-35B-A3B-heretic
- Drafter de decodificacion especulativa: https://huggingface.co/z-lab/Qwen3.6-35B-A3B-DFlash
- Guia de despliegue en produccion: https://github.com/AEON-7/Qwen3.6-35B-A3B-heretic-NVFP4-DFlash
- Imagen de vLLM para DGX Spark: https://github.com/AEON-7/vllm-ultimate-dgx-spark
