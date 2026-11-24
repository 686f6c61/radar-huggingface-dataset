# Maxilicious20/Velqora-95M-Base-GGUF

## Resumen

Velqora-95M-Base-GGUF es la exportación cuantizada en formato GGUF del modelo Velqora-95M-Base, un modelo de lenguaje causal decoder-only de aproximadamente 94,56 millones de parámetros entrenado desde cero por el autor Maxilicious20. Se trata de un proyecto de investigación de escala reducida, entrenado íntegramente en una GPU de consumo NVIDIA RTX 4060 con 8 GB de VRAM, lo que lo sitúa en la categoría de modelos experimentales orientados a inferencia local y estudio de arquitecturas más que a uso productivo.

El modelo emplea una arquitectura transformer con 18 capas, dimensión oculta de 640, activación SwiGLU de 1.792 y atención con 10 cabezas de consulta y 5 cabezas KV (GQA), junto con una ventana de contexto máxima de 4.096 tokens y un tokenizador BPE byte-level propio de 16.384 tokens. La relevancia de esta ficha radica en que ofrece una vía de bajo coste para experimentar con un LLM entrenado de forma independiente, con licencia Apache-2.0 y artefactos cuantizados listos para `llama.cpp`.

La publicación incluye tres variantes GGUF (F16, Q8_0 y Q4_K_M) verificadas con `llama-cli`, con tamaños que van de 200,98 MB a 74,01 MB. Es un modelo exclusivamente en inglés y de propósito experimental, por lo que su interés es fundamentalmente académico y de prototipado, no de despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, con GQA, SwiGLU, QK-Norm por cabeza y RoPE (θ = 50.000) |
| Parametros totales | 94.561.681 (~94,56M) segun model card; 105.047.424 segun safetensors del repo base |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | F16 (sin cuantizar), Q8_0 (8 bits), Q4_K_M (4 bits K-quant medium) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F16, Q8_0, Q4_K_M); el repo base publica safetensors |

Detalles adicionales de arquitectura: 18 capas, hidden size 640, SwiGLU 1.792, 10 cabezas de consulta y 5 cabezas KV, tokenizador BPE byte-level custom de 16.384 tokens embebido en los metadatos GGUF.

## Arquitectura y entrenamiento

Velqora-95M-Base es un transformer decoder-only de tipo causal entrenado desde cero (*from-scratch*), no un fine-tuning de un modelo existente. La arquitectura incorpora atención con grouped-query attention (10 cabezas Q / 5 cabezas KV), activación SwiGLU con dimensión intermedia de 1.792, normalización QK por cabeza y codificación posicional rotatoria (RoPE) con base θ = 50.000, lo que permite una ventana de contexto de 4.096 tokens. El tokenizador es un BPE byte-level propio de 16.384 tokens, incluido en los metadatos de los ficheros GGUF.

El entrenamiento se realizó en una única NVIDIA RTX 4060 de 8 GB, lo que condiciona tanto el tamaño del modelo como el volumen y la composición del corpus, que no se detallan en la información disponible. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF, DPO o instrucción. La model card señala una nota de conversión relevante: el escalar de valor residual de la capa 0 (`v_res_alpha`) se omite en la ejecución estándar del grafo GGUF, mientras que se preservan todas las proyecciones principales, los pesos QK-Norm por cabeza, las frecuencias RoPE y el vocabulario BPE. Esta omisión implica una diferencia funcional entre el modelo PyTorch original y las exportaciones GGUF que conviene tener en cuenta al comparar resultados.

## Capacidades

- Generación de texto causal en inglés: continuación de prompts, redacción libre y completado de secuencias cortas.
- Razonamiento básico y respuesta a preguntas simples, limitado por su escala de ~95M de parámetros.
- Generación de código elemental y aritmética muy sencilla, con alta probabilidad de error (la propia model card advierte de fallos aritméticos).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: únicamente inglés declarado; no se garantiza cobertura de otros idiomas.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Inferencia local eficiente mediante `llama.cpp` y ecosistema GGUF (Ollama, etc.).

## Casos de uso

- Estudio de arquitecturas transformer a pequeña escala: sirve para analizar el comportamiento de GQA, SwiGLU, QK-Norm y RoPE en un modelo entrenado desde cero, inspeccionando pesos y activaciones sin necesidad de hardware de gama alta.
- Prototipado de pipelines de inferencia local: validar flujos con `llama.cpp`, servidores compatibles con endpoints o integraciones GGUF antes de escalar a modelos mayores, gracias a su huella de 74-201 MB.
- Docencia y formación: demostrar el ciclo completo de entrenamiento, cuantización y despliegue de un LLM en una GPU de consumo de 8 GB, con artefactos pequeños y manejables.
- Pruebas de cuantización: comparar calidad y comportamiento entre F16, Q8_0 y Q4_K_M sobre el mismo modelo para medir el impacto de la cuantización en un modelo pequeño.
- Generación de texto creativo de baja exigencia: completar frases, generar borradores cortos o experimentar con prompts en inglés en entornos sin conectividad ni GPU dedicada.
- Benchmarking de herramientas: usar el modelo como carga de trabajo ligera para medir latencia y throughput de `llama.cpp` en CPU, GPU integrada o GPUs de gama baja.
- Investigación sobre alucinación en modelos pequeños: estudiar patrones de error factual y aritmético en modelos de menos de 100M de parámetros con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las variantes; Q4_K_M (74,01 MB) y Q8_0 (107,08 MB) caben holgadamente en cualquier GPU de consumo, e incluso F16 (200,98 MB) es trivial.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo se entrenó en una RTX 4060 de 8 GB y funciona en GPUs integradas y CPUs modernas.
- Cabe en GPU de consumo: sí, en todas las NVIDIA GeForce/RTX, AMD Radeon e Intel Arc actuales, así como en Apple Silicon.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), Ollama y cualquier runtime compatible con GGUF; el repo declara compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles; al ser un modelo de ~95M de parámetros y menos de 201 MB, se espera una latencia muy baja en hardware de consumo, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Velqora-95M-Base-GGUF | ~94,56M | 4.096 | en | Apache-2.0 | GGUF (F16/Q8_0/Q4_K_M) | Entrenado desde cero en RTX 4060; experimental |
| SmolLM-135M | 135M | 2.048 (version base) | en (principalmente) | Apache-2.0 | safetensors, GGUF | Modelo pequeño de Hugging Face; datos de entrenamiento publicados |
| GPT-2 small | 124M | 1.024 | en | MIT (pesos) | safetensors, GGUF | Referencia clásica de modelos pequeños |
| TinyLlama-1.1B | 1,1B | 2.048 | en | Apache-2.0 | safetensors, GGUF | Escala superior; requiere más recursos |

La comparación se basa en características públicas de modelos de escala similar; no se dispone de resultados de benchmarks de Velqora para contrastar rendimiento. Los datos de los modelos alternativos corresponden a sus especificaciones publicadas y no se han verificado en esta ficha.

## Limitaciones y advertencias

- Modelo experimental de ~95M de parámetros: la model card advierte de posibles alucinaciones factuales y errores aritméticos, especialmente en cuantización de 4 bits.
- No apto para producción ni para usos críticos de seguridad, según indica el propio autor.
- Entrenado únicamente en inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- La omisión del escalar `v_res_alpha` de la capa 0 en la ejecución GGUF puede provocar divergencias respecto al modelo PyTorch original.
- No se documentan datos de entrenamiento, composición del corpus ni procesos de alineación (RLHF/DPO), por lo que no pueden evaluarse sesgos de forma sistemática.
- Licencia Apache-2.0 permisiva para uso comercial, pero la calidad y fiabilidad del modelo hacen desaconsejable su uso en productos reales.
- Sin descargas ni likes en el momento de la consulta; ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Maxilicious20/Velqora-95M-Base-GGUF
- Repositorio base en PyTorch: https://huggingface.co/Maxilicious20/Velqora-95M-Base
- `llama.cpp`: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
