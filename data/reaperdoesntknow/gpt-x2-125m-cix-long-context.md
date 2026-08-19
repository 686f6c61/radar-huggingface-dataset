# reaperdoesntknow/GPT-X2-125M-CIx-Long-Context

## Resumen

GPT-X2-125M-CIx-Long-Context es un checkpoint experimental derivado de AxiomicLabs/GPT-X2-125M, creado por el usuario reaperdoesntknow con el objetivo de investigar la generación de lenguaje causal de contexto largo en arquitecturas compactas. El modelo mantiene la arquitectura base GPT-X2 (un transformer decoder-only de 126 millones de parámetros) pero amplía la ventana de contexto de los 1.024 tokens originales a 32.768 tokens mediante configuraciones de RoPE y soporte opcional de escalado YaRN.

La principal innovación de este checkpoint no está en el tamaño, sino en el código personalizado que incorpora: un mecanismo experimental llamado Symplectic Metric-RoPE Governor, que modula las posiciones rotatorias mediante un sistema de relojes hamiltonianos y proyecciones métricas, y un optimizador heterogéneo llamado CIxOpt que permite rutas de actualización diferenciadas por tipo de parámetro. Está pensado como banco de pruebas para estudios de codificación posicional, optimización y ablaciones de arquitectura, no como un modelo listo para producción.

Con licencia Apache 2.0 y pesos en formato safetensors, el modelo es totalmente abierto y ligero, requiriendo menos de 1 GB de VRAM en precisión BF16. Su uso previsto es la investigación académica y prototipado rápido en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-X2 (transformer decoder-only) con Grouped-Query Attention, RoPE, RMSNorm y SwiGLU |
| Parametros totales | 126.006.398 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (pesos base en safetensors; no se publican cuantizaciones oficiales) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-X2 de Axiomic Labs: un transformer causal con 30 capas, tamaño oculto de 576, 9 cabezas de atencion de consulta y 3 cabezas clave/valor (GQA), dimension de cabeza de 64, MLP SwiGLU con dimension intermedia de 1536 y embeddings de entrada y salida atados. La configuracion base define `max_position_embeddings` en 32.768, lo que permite manejar secuencias largas directamente con RoPE, ademas de soportar escalado YaRN opcional para extender aun mas el contexto.

El entrenamiento se realizo con CIxOpt, un optimizador heterogeneo que combina actualizaciones estilo AdamW, Lion, AdaMax y ASGD, con enrutamiento por nombre de parametro. Por ejemplo, las matrices de proyeccion grandes usan momentum con signo, los parametros de normalizacion usan AdamW, y los parametros del governor usan rutas adaptativas precisas. No se han publicado detalles sobre el dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El mecanismo Symplectic Metric-RoPE Governor anade un estado de reloj global y local, proyecciones metricas y deltas de masa y espin para modular la frecuencia rotatoria, disenado para iniciar desde el comportamiento RoPE estandar cuando las proyecciones estan a cero.

## Capacidades

- Generacion de texto causal en ingles, con soporte para secuencias largas de hasta 32.768 tokens.
- Manejo de atencion con Grouped-Query Attention (3 cabezas KV) para reducir coste de memoria en inferencia.
- Posicionamiento rotatorio con RoPE y escalado YaRN opcional, permitiendo experimentos de extrapolacion de contexto.
- Soporte de caché dinamica en la implementacion de Transformers, adecuado para generacion incremental.
- Manejo de posiciones con left-padding, util para procesamiento por lotes con secuencias de distinta longitud.
- Perdida causal segura cuando hay etiquetas enmascaradas, evitando contribuciones de tokens de relleno.
- Mecanismo experimental Symplectic Metric-RoPE Governor que permite estudiar la modulacion aprendida de la codificacion posicional.
- No se documentan capacidades de tool calling, agentes, vision ni audio; es un modelo puramente textual.

## Casos de uso

- Investigacion de codificacion posicional: el governor Symplectic Metric-RoPE permite comparar el comportamiento de RoPE estandar frente a variantes metricas en tareas de recuperacion de informacion posicional, como pruebas de "needle in a haystack".
- Evaluacion de optimizadores: CIxOpt permite estudiar como diferentes rutas de actualizacion afectan a capas concretas, util para tesis o articulos sobre metodos de entrenamiento.
- Prototipado de generacion de texto ligera: con solo 126M de parametros, puede ejecutarse en CPU o GPUs modestas para generar borradores, resumenes cortos o completar texto en aplicaciones sin requisitos estrictos de calidad.
- Fine-tuning experimental: al ser un checkpoint pequeno y con licencia permisiva, es adecuado para probar tecnicas de ajuste fino (LoRA, QLoRA) en entornos educativos o de investigacion.
- Ablaciones de arquitectura: al estar basado en GPT-X2 con GQA y SwiGLU, permite estudiar el impacto de estas decisiones en modelos pequenos con contexto largo.
- Benchmarking de eficiencia: su bajo consumo de VRAM (0,6 GB en BF16) lo hace util para medir throughput y latencia en hardware limitado o en despliegues en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion no estan incluidos y que el comportamiento de seguridad no ha sido evaluado. Por tanto, no es posible comparar cuantitativamente este modelo con otras alternativas en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,60 GB en precision BF16 segun datos de llmrun.dev, lo que lo hace ejecutable en practicamente cualquier GPU moderna con al menos 2 GB de VRAM.
- GPUs compatibles: cualquier GPU con soporte CUDA desde la serie GTX 10xx en adelante; tambien funciona en Apple Silicon via MPS y en CPU pura.
- Cabe en GPUs de consumo como NVIDIA GTX 1650, RTX 3060, RTX 4060, etc., sin problemas.
- Opciones de despliegue: al ser un modelo de Transformers con codigo personalizado, puede ejecutarse con la libreria `transformers` directamente. Para inferencia optimizada se puede convertir a GGUF y usar llama.cpp u Ollama, aunque no hay versiones oficiales publicadas. Tambien es compatible con vLLM o TGI si se adapta el codigo, pero no hay soporte nativo documentado.
- Latencia y throughput: no se dispone de mediciones oficiales, pero por tamano se espera una generacion de decenas a cientos de tokens por segundo en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AxiomicLabs/GPT-X2-125M (base) | 126M | 1.024 tokens | Apache 2.0 | Modelo original sin extension de contexto |
| GPT-X2-125M-CIx-Long-Context (este) | 126M | 32.768 tokens | Apache 2.0 | Derivado con RoPE extendido y governor experimental |
| GPT-2 small (OpenAI) | 124M | 1.024 tokens | MIT | Modelo clasico, sin GQA ni SwiGLU |

No se dispone de datos de rendimiento comparativos entre estos modelos. La diferencia principal radica en la ventana de contexto y en las modificaciones arquitectonicas experimentales del checkpoint derivado.

## Limitaciones y advertencias

- Modelo experimental: no debe utilizarse como autoridad unica en entornos de alto riesgo (medico, legal, financiero, etc.).
- Puede alucinar hechos, fechas, citas o detalles tecnicos; no se ha evaluado su fiabilidad factual.
- El soporte de contexto largo no garantiza razonamiento preciso a larga distancia; es posible que pierda coherencia en secuencias muy extensas.
- El comportamiento del Symplectic Metric-RoPE Governor es experimental y podria producir resultados inesperados si se activa.
- El entrenamiento con CIxOpt puede dar lugar a comportamientos diferentes a los de modelos entrenados con AdamW estandar.
- No se ha evaluado la seguridad del modelo; puede generar contenido inapropiado o sesgado.
- No se han publicado benchmarks, por lo que se desconoce su rendimiento real en tareas estandar.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que los datos y pesos del modelo base no tengan restricciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/reaperdoesntknow/GPT-X2-125M-CIx-Long-Context
- Discusion en HuggingFace: https://huggingface.co/reaperdoesntknow/GPT-X2-125M-CIx-Long-Context/discussions/1
- Ficha de hardware en llmrun.dev: https://llmrun.dev/model/reaperdoesntknow-gpt-x2-125m-cix-long-context
- Pagina de modelos de Axiomic Labs: https://axiomiclabs.com/models
- Ficha del modelo base en LLM Explorer: https://llm-explorer.com/model/AxiomicLabs%2FGPT-X2-125M,2NwwBVsIrsmVTuHBqwPGd8
