# haiping/Qwen3.8-27B-velox

## Resumen

Qwen3.8-27B-velox es un artefacto de inferencia cuantizado y empaquetado en un unico fichero con formato velox `.vi` (version 1), derivado del modelo base Qwen/Qwen3.8-27B. Lo publica el usuario haiping en HuggingFace y no se trata de un modelo entrenado desde cero, sino de una reempaquetación híbrida de pesos con múltiples esquemas de cuantización (NVFP4, IQ3_XXS, FP8, Q4, Q5, Q8 y BF16) orientada a acelerar tanto el prefill como la decodificación especulativa. El artefacto incluye el modelo de texto, la torre de visión y un drafter DFlash2, y descarta la cabeza MTP porque la decodificación especulativa la cubre DFlash2.

La innovación principal es el uso de NVFP4 en las proyecciones del MLP denso y, en la variante `hybrid3`, también en las proyecciones GDN (`query/key/value/z`) y de atención (`query/gate/key/value`), de modo que el prefill se ejecuta sobre tensor cores FP4. El fichero recomendado ocupa 24,09 GB y el variante descrito en la model card 24,38 GB, dentro de un repositorio de 48,5 GB que contiene ambos. La licencia es Apache-2.0, la misma del modelo base.

Su relevancia es operativa: demuestra una estrategia de cuantización mixta por capas y por fase (bandwidth-bound decode frente a compute-bound prefill) para servir un modelo de 27B en una sola GPU consumer de gama alta, con métricas medidas por el autor sobre una RTX 5090. No aporta pesos nuevos ni capacidades nuevas respecto a Qwen3.8-27B; aporta un formato de despliegue concreto que requiere el runtime velox.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B, con capas GDN (proyecciones query/key/value/z) y capas de atención (query/gate/key/value); incluye torre de visión y drafter DFlash2 |
| Parametros totales | 27B (heredados del modelo base; no se detalla el desglose) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (block_scale_k16_m128x4_v1), IQ3_XXS (planar_v1), FP8 E4M3FN con escala de fila en BF16, Q8 g32 fp16, Q6, Q5 g64 fp16, Q4 g64 fp16, BF16, int32, fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | velox `.vi` v1 (fichero unico); no compatible con NInfer; requiere el runtime velox |

## Arquitectura y entrenamiento

El artefacto no incluye entrenamiento propio: es una reempaquetación de los pesos de Qwen3.8-27B en un contenedor velox `.vi` v1. La arquitectura subyacente combina capas GDN y capas de atención con proyecciones query/gate/key/value, además de un MLP denso (`text/layers/*/mlp/{gate,up,down}`), una torre de visión y un drafter DFlash2 para decodificación especulativa. La cabeza MTP se elimina del artefacto porque el servicio se presta con DFlash2.

La estrategia de cuantización es heterogénea y por fase. Los pesos base del modelo de texto se distribuyen en IQ3_XXS, Q4, Q5 y FP8, adecuados para decode limitado por ancho de banda y para la verificación de DFlash2. El MLP denso incorpora además una codificación NVFP4 marcada como `@prefill`, que velox activa por encima de su umbral de tokens fusionados, de forma que los prefills largos se ejecutan en tensor cores FP4. La variante `hybrid3` reencodea las proyecciones GDN y de atención como NVFP4 con activaciones FP4, partiendo de los pesos FP8 del release NVFP4; el divisor de activación de cada capa se deriva de la cota RMSNorm `sqrt(dim) * max|1 + w|` para evitar la saturación de activaciones. El fichero almacena únicamente los objetos referenciados por el modelo, por lo que las codificaciones reemplazadas o descartadas no ocupan espacio.

El desglose de objetos del artefacto de 24,38 GB es: 129 objetos NVFP4 (10,02 GB), 64 IQ3_XXS (4,37 GB), 80 FP8 E4M3FN con escala de fila (4,15 GB), 118 Q5 g64 fp16 (2,48 GB), 8 Q8 g32 fp16 (1,57 GB), 119 Q4 g64 fp16 (1,33 GB), 620 BF16 (0,45 GB) y el resto en Q6, int32, fp32 y recursos (0,01 GB).

## Capacidades

- Generación de texto y razonamiento heredados de Qwen3.8-27B; el artefacto no documenta capacidades adicionales propias.
- Procesamiento de visión: el fichero incluye la torre de visión del modelo base, por lo que se preservan las capacidades multimodales de origen.
- Decodificación especulativa mediante el drafter DFlash2 incluido en el mismo artefacto.
- Prefill acelerado en tensor cores FP4 gracias a las codificaciones NVFP4 del MLP y, en la variante `hybrid3`, de las proyecciones GDN y de atención.
- Tool calling, function calling y razonamiento multi-paso: no disponible en la información proporcionada; dependen de las capacidades del modelo base, no documentadas aquí.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Automatización de escritorio y computer-use: el autor valida el artefacto con una repetición de 142 pasos de computer-use sobre una RTX 5090, lo que lo hace adecuado para agentes que controlan interfaz gráfica y necesitan baja latencia de primer token y buen throughput de decodificación.
- Servicio de inferencia en una sola GPU consumer: con 24,09 GB en el fichero recomendado, encaja en GPUs de 32 GB o más, lo que permite desplegar un modelo de 27B con visión en una estación de trabajo sin clúster multi-GPU.
- Prefills largos en pipelines RAG o análisis de documentos: la codificación NVFP4 `@prefill` se activa por encima del umbral de tokens fusionados, de modo que prompts de contexto extenso se procesan en FP4 y reducen el TTFT.
- Prototipado de decodificación especulativa: al incluir el drafter DFlash2 en el mismo fichero y descartar la cabeza MTP, sirve para evaluar el equilibrio entre verificación y aceptación de tokens especulativos en cargas reales.
- Evaluación de cuantización mixta: el desglose por formatos y el script de servicio permiten comparar variantes (`hybrid3` frente a la variante con proyecciones en Q4/Q5) sobre la misma máquina y el mismo conjunto de tareas.
- Despliegue de referencia para el runtime velox: útil para equipos que quieran medir el rendimiento del runtime con un artefacto de 27B multimodal antes de adoptarlo en producción.
- Investigación sobre cuantización FP4: la derivación del divisor de activación a partir de la cota RMSNorm sirve como caso práctico para estudiar la saturación de activaciones en NVFP4.

## Benchmarks y rendimiento

El autor publica una única comparación interna, sobre una RTX 5090 y una repetición de computer-use de 142 pasos, entre la variante `hybrid3` y el artefacto NVFP4 de referencia:

| Metrica | Resultado de `hybrid3` frente al artefacto NVFP4 |
|---|---|
| TTFT p50 | -15,4% |
| Tiempo de prefill | -10,4% |
| Decodificacion | +23,3% |
| Clics dentro de 50 px | de 58 a 56 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 24,1 GB para el fichero recomendado `qwen3_8_27b_hybrid3.vi` y unos 24,4 GB para `qwen3_8_27b_iq3_xss_nvfp4_hybrid_v2.vi`, más el espacio de caché KV en formato NVFP4 (`--kv-format nvfp4`).
- GPU recomendadas: el autor aporta métricas medidas en una RTX 5090; no se documentan resultados en A100, H100 u otras GPU. El soporte de NVFP4 en tensor cores es un requisito funcional para aprovechar el prefill FP4.
- GPU consumer: cabe en GPUs con 32 GB o más de VRAM; no cabe en GPUs de 24 GB sin renunciar a parte del artefacto o del contexto.
- Opciones de despliegue: exclusivamente el runtime velox, con el comando `velox serve --artifact <fichero>.vi --kv-format nvfp4 --port 8010`. NInfer no puede leer ficheros `.vi`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publican las variaciones relativas de la tabla anterior (TTFT p50 -15,4%, prefill -10,4%, decode +23,3% en RTX 5090); no se aportan valores absolutos en milisegundos ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| haiping/Qwen3.8-27B-velox | 27B | no disponible | velox `.vi` v1, cuantizacion mixta NVFP4/IQ3_XXS/FP8/Q4/Q5/Q8/BF16 | Apache-2.0 | Requiere velox; incluye torre de visión y drafter DFlash2; 24,09-24,38 GB |
| Qwen/Qwen3.8-27B (modelo base) | 27B | no disponible | safetensors (presumiblemente; no confirmado en la informacion) | Apache-2.0 | Pesos sin reempaquetar; sirve de referencia de capacidades y licencia |
| Alternativas cuantizadas del mismo modelo base | 27B | no disponible | GGUF, AWQ, GPTQ u otros | Apache-2.0 (heredada) | No se dispone de datos concretos de repositorios comparables en la informacion proporcionada |

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- Dependencia total del runtime velox: el artefacto `.vi` no es legible por NInfer ni, según la documentación disponible, por otras herramientas habituales como vLLM, llama.cpp u Ollama, lo que limita la portabilidad y crea dependencia de un único proveedor de software.
- Licencia Apache-2.0 heredada del modelo base: permite uso comercial, pero conviene verificar las condiciones del modelo Qwen3.8-27B original y de los pesos reempaquetados.
- Idiomas soportados no documentados: no se puede garantizar el comportamiento multilingüe a partir de la model card.
- Longitud de contexto no documentada: no se especifica la ventana máxima ni el coste de caché KV en NVFP4, dato crítico para dimensionar el despliegue.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo, seguridad o alucinación para este artefacto; deben asumirse los del modelo base, no caracterizados aquí.
- Métricas muy limitadas: el único benchmark es una repetición interna de computer-use de 142 pasos en una RTX 5090, sin valores absolutos, sin comparación con el modelo base en otros conjuntos y sin réplicas independientes.
- La variante `hybrid3` mejora la decodificación un 23,3% pero empeora el TTFT y el prefill respecto al artefacto NVFP4 de referencia; la elección entre ambas depende del perfil de carga.
- Sin descargas ni valoraciones en el momento de la consulta: no hay evidencia comunitaria de funcionamiento en entornos distintos al del autor.
- El repositorio ocupa 48,5 GB porque contiene ambas variantes; conviene descargar solo el fichero necesario.

## Enlaces

- HuggingFace: https://huggingface.co/haiping/Qwen3.8-27B-velox
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime velox: no disponible en la información proporcionada
- Paper, blog o repositorio del drafter DFlash2: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
