# mrsirg97-rgb/osmos-evo-inkling-mini

## Resumen

osmos-evo-inkling-mini es una distribución cuantizada y empaquetada del modelo Thinking Machines Inkling-2-Mini, publicada por el usuario mrsirg97-rgb bajo el marco de trabajo libosmos. No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF de los pesos originales de Inkling-2-Mini, manteniendo los valores del checkpoint de referencia (expertos enrutados en NVFP4 para las capas 0-19 y MXFP8 para las 20-23, atención, router y controles de bucle en BF16) y añadiendo su drafter de predicción multi-token (MTP) cuantizado a Q8_0.

El modelo base es un transformer con mezcla de expertos (MoE) que aplica un bucle sobre sus capas intermedias (6-17) tres veces por token, lo que multiplica la profundidad efectiva sin aumentar el número de parámetros almacenados. La distribución está optimizada para ejecutarse en hardware AMD Strix Halo (Ryzen AI Max+ 395, gfx1151, 128 GB de memoria unificada), con el objetivo de servir el modelo completo en memoria de GPU con contexto de hasta 1M tokens.

La relevancia de este paquete reside en su enfoque práctico: demuestra que es posible ejecutar un MoE de ~20 GB con contexto de un millón de tokens en hardware consumer de gama alta (APU con memoria unificada), usando decodificación especulativa con el drafter nativo del modelo para acelerar la generación entre un 30% y un 95% según la tarea, y con una fidelidad numérica verificada frente a llama.cpp (KL de 1.1e-3 a 2.9e-3).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de capas intermedias (6-17 repetidas 3 veces por token) |
| Parametros totales | no disponible (pesos empaquetados: 19.6 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | Expertos NVFP4 (capas 0-19), expertos MXFP8 (capas 20-23), atención/router/controles BF16, drafter Q8_0, caché KV Q8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2 shards principales + drafter MTP separado) |

## Arquitectura y entrenamiento

Inkling-2-Mini, el modelo base, es un transformer con mezcla de expertos (MoE) que incorpora una innovación estructural: las capas 6 a 17 se ejecutan en bucle tres veces por cada token generado, de modo que el modelo reutiliza un subconjunto de capas con distintos estados de activación. Esta arquitectura de bucle implica que la caché KV debe gestionarse por pasada, y osmos lo resuelve reservando 48 slots de caché para 24 capas (dos por capa, correspondientes a las pasadas repetidas). Los expertos enrutados se almacenan en NVFP4 con sus escalas por experto en las capas 0-19, y en MXFP8 en las cuatro capas finales (20-23); los pesos densos (atención, router y controles de bucle) permanecen en BF16.

El paquete incluye el drafter de predicción multi-token (MTP) nativo del checkpoint original, convertido desde `mtp.safetensors` a GGUF y cuantizado a Q8_0, con una aceptación equivalente a BF16 según el autor. La conversión se realizó con las herramientas `ink2_ref_gguf.py` e `ink2_mtp_gguf.py` de libosmos, copiando los tensores tal como están almacenados (sin recalcular valores) y tomando el tokenizer de la conversión de llama.cpp del mismo `tokenizer.json`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventanas de contexto de hasta 1M tokens.
- Decodificación especulativa mediante el drafter MTP nativo, con aceleración medida de 25.7 a 33.5-49.6 tok/s en decodificación.
- Recuperación de información en contextos extremadamente largos: el autor reporta encontrar un dato oculto al 10% de un prompt de 1.000.652 tokens (900K tokens antes de la pregunta), y también al 10%, 50% y 90% en contextos de 128K y 512K.
- Ejecución de tareas de codificación (el autor reporta 49.6 tok/s en decodificación para una tarea de código).
- Gestión de caché KV cuantizada en Q8 (17 KiB por token), lo que permite conversaciones de 1M tokens con ~17 GiB de caché.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües específicas en la documentación proporcionada.

## Casos de uso

- Análisis de documentos extensos: con 1M tokens de contexto y recuperación verificada a 128K, 512K y 1M tokens, el modelo puede procesar libros completos, expedientes o bases de código extensas y responder preguntas sobre detalles situados en cualquier posición del texto.
- Asistencia de programación en local: el modelo mantiene 49.6 tok/s en decodificación con drafter en tareas de código sobre un Strix Halo, lo que permite integrarlo en editores o terminales sin depender de la nube.
- Despliegue en hardware consumer de gama alta: al caber en 128 GB de memoria unificada de un Ryzen AI Max+ 395, es adecuado para entornos de desarrollo y prototipado donde no se dispone de GPUs de centro de datos.
- Procesamiento por lotes de prompts largos: con velocidades de prompt de 767-1.045 tok/s, es viable ingerir documentos de decenas de miles de tokens en segundos para tareas de resumen o extracción.
- Conversaciones multi-turno de larga duración: la caché KV Q8 (17 KiB/token) permite mantener sesiones de cientos de miles de tokens sin agotar la memoria del sistema.
- Investigación sobre decodificación especulativa: el paquete incluye el drafter MTP y datos comparativos (drafted vs. plain) que permiten reproducir y evaluar el impacto de la decodificación especulativa en hardware AMD.
- Evaluación de fidelidad de cuantización: los valores KL reportados frente a llama.cpp permiten usar este paquete como referencia para validar conversiones GGUF de modelos MoE con capas en bucle.

## Benchmarks y rendimiento

Datos de rendimiento reportados por el autor en un AMD Strix Halo (Ryzen AI Max+ 395, gfx1151, 128 GB), perfil `performance`, osmos 0.12.0, una conversación:

| Escenario | Con drafter (tok/s) | Sin drafter (tok/s) |
|---|---:|---:|
| Decodificación, pregunta corta 1 | 33.5 | 25.7 |
| Decodificación, pregunta corta 2 | 42.4 | 26.6 |
| Decodificación, pregunta corta 3 | 35.1 | 25.7 |
| Decodificación, tarea de código | 49.6 | 25.2 |
| Decodificación tras prompt de 131K | 24.2 | 17.0 |
| Prompt de 3K tokens | 974 | 1.001 |
| Prompt de 37K tokens | 1.025 | 1.045 |
| Prompt de 131K tokens | 767 | 775 |

Fidelidad numérica frente a llama.cpp (BF16 activaciones, caché F16):

| Métrica | osmos-evo-inkling-mini | Rango de llama.cpp (GPU vs CPU) |
|---|---:|---:|
| KL a 64 tokens | 2.9e-3 | 3.0e-3 |
| KL a 2.048 tokens | 1.1e-3 | 1.2e-3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 19.6 GB para los pesos del modelo (todos los expertos en memoria de GPU) más la caché KV Q8 a 17 KiB por token (17 GiB para 1M tokens). El autor indica que todo el pack cabe en 128 GB de memoria unificada.
- GPU/APU recomendada: AMD Strix Halo (Ryzen AI Max+ 395, gfx1151) con 128 GB de memoria unificada, el hardware para el que está optimizado el paquete.
- No se dispone de información sobre compatibilidad con GPUs NVIDIA (A100, H100, RTX 4090) en la documentación proporcionada; el paquete está orientado a AMD y al backend de libosmos.
- Opciones de despliegue: libosmos (con `osmos_install.py inkling-2-mini --serve` o `--rig`), que incluye servidor API (`osmos-api`). El autor menciona comparaciones con llama.cpp, pero no se especifica si el GGUF es directamente compatible con llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: ver tabla de benchmarks (decodificación de 17.0 a 49.6 tok/s; prompt de 767 a 1.045 tok/s según longitud).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El único punto de comparación mencionado es llama.cpp ejecutando el mismo release de Inkling-2-Mini, pero no se ofrecen datos de rendimiento de esa ejecución más allá de los valores KL de fidelidad. No se dispone de datos de parámetros totales, parámetros activos ni benchmarks estándar de Inkling-2-Mini que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El paquete está optimizado y probado exclusivamente en AMD Strix Halo (gfx1151); no se garantiza su funcionamiento en otras GPUs o backends.
- No se dispone de información sobre sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base en la documentación proporcionada.
- El contexto de 1M tokens requiere ~17 GiB de caché KV en Q8; en configuraciones con menos memoria unificada, la longitud de contexto efectiva se verá reducida.
- La licencia Apache 2.0 se aplica tanto al paquete como a los pesos originales de Thinking Machines, pero el autor no detalla restricciones adicionales de uso comercial más allá de la licencia declarada.
- El rendimiento en decodificación depende en gran medida del drafter MTP; sin él, la velocidad cae a ~17-26 tok/s en los escenarios medidos.
- No se dispone de información sobre el pipeline de la tarea ni sobre los idiomas soportados, lo que limita la evaluación de su idoneidad para aplicaciones multilingües.
- La fecha de creación del repositorio (2026-11-21) y la ausencia de likes (0) y de pipeline declarado sugieren un paquete reciente y de nicho; conviene validar su comportamiento en el hardware objetivo antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/mrsirg97-rgb/osmos-evo-inkling-mini
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio libosmos: https://github.com/mrsirg97-rgb/libosmos
