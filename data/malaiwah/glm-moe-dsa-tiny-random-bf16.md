# malaiwah/glm-moe-dsa-tiny-random-bf16

## Resumen

El repositorio `malaiwah/glm-moe-dsa-tiny-random-bf16` contiene una fixture de arquitectura sumamente pequena, creada por el autor `malaiwah` como punto de referencia reproducible para la implementacion nativa de Transformers de la clase `GlmMoeDsaForCausalLM`. No es un modelo de lenguaje con conocimiento entrenado: sus pesos se inicializan aleatoriamente y el texto que genera carece de significado. Su finalidad es permitir pruebas de carga, guardado/reload, tokenizacion y verificacion de fidelidad de cuantizacion BF16 sin descargar los pesos grandes de modelos GLM.

La arquitectura es un Transformer con atencion MLA (Multi-head Latent Attention), capas MoE (Mixture-of-Experts) e indexadores DSA (Deep Sparse Attention), inspirada en `GLM-5.2-SIQ-Fruit-bf16`. El checkpoint completo ocupa 571.000 bytes y contiene 277.848 parametros totales, distribuidos en 277.824 parametros entrenables y 24 elementos de buffer del router en FP32. La longitud de contexto maxima es de 256 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (Transformer con atencion MLA, indexadores DSA y capas MoE) |
| Parametros totales | 277.848 |
| Parametros activos | no disponible (MoE con 8 expertos enrutados, 2 activos y 1 compartido) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | bfloat16 (BF16) con buffers de correccion del router en FP32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo se compone de 4 capas de decodificador con una anchura oculta de 64. El esquema de capas densas/MoE es: densa, sparse, sparse, sparse. Cada capa MoE enruta entre 8 expertos, de los cuales 2 se activan por token y 1 es compartido. La atencion utiliza 4 cabezas de consulta y 4 cabezas clave-valor, con rangos LoRA de consulta y clave-valor de 32 y 16 respectivamente. Las dimensiones de QK no-RoPE, RoPE y de la cabeza de valor son 8, 8 y 16. El modelo incluye 4 cabezas de indexador DSA con dimension de cabeza 16 y top-k de 8 tokens; el esquema de indexadores es full, shared, full, shared, de modo que las capas DSA compartidas reutilizan la seleccion del indexador completo anterior. El vocabulario cuenta con 260 tokens: 256 simbolos de bytes mas los tokens pad, BOS, EOS y unknown. La cabeza de salida es completa, no anclada, con forma 260 x 64 en BF16. No hay capas de prediccion de siguiente token (MTP).

El modelo no fue entrenado en ningun dataset. La inicializacion comienza en FP32 y se redondea a BF16 durante la construccion del artefacto, en lugar de hacerlo silenciosamente en una captura etiquetada como lossless. El dataset asociado `malaiwah/glm-moe-dsa-tiny-cpu-repro-v1` es un bundle de evidencia de reproduccion, no un corpus de entrenamiento. No se ha aplicado RLHF, DPO ni ningun otro ajuste posterior.

## Capacidades

- Generacion de texto: tecnicamente funcional, produce logits finitos y puede generar tokens con caché en CPU, pero al tener pesos aleatorios el contenido resultante es arbitrario y sin significado.
- Razonamiento, codigo y matematicas: no disponible. El modelo no posee ningun conocimiento entrenado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible como modelo de lenguaje. El tokenizador byte-level es capaz de codificar texto UTF-8, incluyendo ASCII, caracteres acentuados y texto no latino, pero no hay ninguna competencia lingüistica asociada.
- Capacidades especiales: implementa la ruta completa de atencion MLA, indexadores DSA y pesos densos/MoE. Se ha verificado que un forward con 4 secuencias de 64 tokens produce logits finitos y no constantes de forma `[4, 64, 260]`.
- Reproducibilidad: dos procesos independientes de generacion producen archivos checkpoint, config y tokenizer byte a byte identicos.
- Compatibilidad con QFS: el checkpoint soporta la verificacion de fidelidad de cuantizacion mediante la comparacion de entropias cruzadas (KL) con resultados de 0.0 nats en la autocomparacion.

## Casos de uso

- Pruebas de regresion de la implementacion `GlmMoeDsaForCausalLM` en Transformers: permite validar que la carga nativa, el guardado y el forward funcionan sin errores ni pesos faltantes.
- Verificacion de reproducibilidad en entornos CI/CD: al ser determinista y muy pequeno, puede ejecutarse en CPU con dos hilos para comprobar que dos ejecuciones producen exactamente el mismo resultado.
- Validacion de la tokenizacion byte-level en pipelines de datos: el tokenizer conserva roundtrips para ASCII, acentos y UTF-8 no latino, lo que sirve para probar codificaciones de texto arbitrario.
- Pruebas de fidelidad de cuantizacion BF16: el modelo incluye buffers FP32 para correcciones del router y se ha utilizado para comparar la perdida de informacion al usar BF16 en la estructura nativa.
- Demostraciones didacticas de arquitecturas MoE y MLA en miniatura: el checkpoint permite inspeccionar los pesos de expertos, routers, indexadores DSA y la atencion latente sin necesidad de descargar un modelo grande.
- Generacion de datos sinteticos para pruebas de QFS: con 256 tokens de contexto y 252 posiciones puntuadas, proporciona un conjunto de validacion pequeño para verificar el flujo de captura y comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM. Los parametros materializados y buffers de ejecucion ocupan 555.776 bytes, por lo que el modelo se ejecuta en CPU.
- GPU recomendada: ninguna. Se ha verificado en un Intel Xeon X5570 con dos hilos de CPU.
- Consumer GPU: cualquier GPU puede alojar el modelo por su tamano, pero el comportamiento solo se ha probado en CPU.
- Opciones de despliegue: Transformers (Python) con PyTorch 2.11.0+cpu y Transformers 5.16.1. No se ha probado con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: las mediciones de referencia en una CPU de dos hilos corresponden a la captura QFS, no a latencia de generacion: primera captura 6.49 s, segunda captura 6.43 s, comando de comparacion 3.73 s, driver completo 34.86 s, RSS pico del proceso de captura 367.374.336 bytes (aproximadamente 350 MiB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| malaiwah/glm-moe-dsa-tiny-random-bf16 | 277.848 | 256 tokens | MIT | Fixture reproducible de arquitectura GLM MoE DSA |
| tiny-random/glm-moe-dsa | no disponible | no disponible | no disponible | Modelo tiny aleatorio para debugging, adaptado de zai-org/GLM-5 |
| malaiwah/GLM-5.2-SIQ-Fruit-bf16 | no disponible (archivo de ~10.1 GB) | no disponible | no disponible | Modelo de referencia arquitectonico denso/MoE con indexadores |

## Limitaciones y advertencias

- El modelo no esta entrenado y no posee ningun conocimiento del mundo; el texto generado es completamente aleatorio y sin sentido.
- No debe usarse en produccion ni como un modelo de lenguaje real para ninguna tarea de NLP.
- El riesgo de alucinacion es total, ya que la salida no se basa en informacion fiable.
- La longitud de contexto de 256 tokens es demasiado corta para cualquier aplicacion practica.
- No se han evaluado sesgos, porque no existe conocimiento entrenado que pueda manifestarlos.
- No es una cuantizacion de Fruit ni un modelo GLM real; no debe presentarse como tal.
- La licencia MIT permite uso comercial, pero el modelo no tiene valor comercial practico por su naturaleza de fixture.
- Para produccion, se recomienda no utilizar este checkpoint para generar contenido, responder preguntas ni automatizar decisiones.

## Enlaces

- Modelo: https://huggingface.co/malaiwah/glm-moe-dsa-tiny-random-bf16
- Dataset de evidencia: https://huggingface.co/datasets/malaiwah/glm-moe-dsa-tiny-cpu-repro-v1
- Modelo de referencia arquitectonico: https://huggingface.co/malaiwah/GLM-5.2-SIQ-Fruit-bf16
- Modelo tiny-random similar: https://huggingface.co/tiny-random/glm-moe-dsa
