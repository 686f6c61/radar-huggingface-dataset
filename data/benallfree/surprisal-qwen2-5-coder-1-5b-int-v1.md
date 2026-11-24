# benallfree/surprisal-qwen2.5-coder-1.5b-int-v1

## Resumen

Surprisal Qwen2.5-Coder-1.5B INT v1 es una conversión a inferencia exclusivamente entera del modelo Qwen/Qwen2.5-Coder-1.5B, publicada por el desarrollador benallfree como componente del compresor sin pérdidas Surprisal. No es un modelo de propósito general para generación de texto: es el motor probabilístico que Surprisal emplea para comprimir y descomprimir archivos, usando el modelo de lenguaje como estimador de probabilidad del siguiente token. El modelo conserva la arquitectura y los pesos del Qwen2.5-Coder-1.5B original (1.572.100.609 parámetros) pero los transforma en una representación de precisión entera.

La innovación central es la determinación bit a bit: pesos en 8 bits con escalas de 16 bits, activaciones en block-floating-point y tablas de búsqueda (lookup tables) para las no linealidades. Toda operación es aritmética entera exacta, de modo que el modelo produce probabilidades idénticas en cualquier GPU o CPU. Esa reproducibilidad es el requisito que permite que un archivo comprimido en una máquina se descomprima en otra distinta sin divergencias numéricas.

El modelo se distribuye en formato GGUF v3 (1.607.594.656 bytes) y está pensado para el motor entero propio de Surprisal (nollama), no para llama.cpp ni otros runtimes GGUF convencionales. La licencia es Apache 2.0, heredada del modelo base de Alibaba. Su relevancia es acotada pero específica: demuestra una vía práctica para usar modelos de lenguaje como motores de compresión deterministas y portables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-1.5B), inferencia entera con pesos de 8 bits, escalas de 16 bits y activaciones block-floating-point |
| Parametros totales | 1.572.100.609 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Representacion entera propia de Surprisal (8-bit weights + 16-bit scales); no usa los esquemas GGUF habituales (Q4_K_M, Q8_0, etc.) |
| Idiomas soportados | no disponible (heredados del modelo base, no documentados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (SPEC.md §1.3), archivo `qwen2.5-coder-1.5b-int-v1.gguf`, 1.607.594.656 bytes, SHA-256 `6d3e399f0493dbcf463f31586d3aedb790f7c5ea78104687deefdedc4951270d` |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es una conversión determinista del checkpoint Qwen/Qwen2.5-Coder-1.5B en una revisión fijada (pinned revision, documentada en `models-v1.json` del repositorio Surprisal). La arquitectura subyacente es la del transformer decoder-only de Qwen2.5-Coder, con 1.572.100.609 parámetros. Sobre esa base, la conversión aplica el formato definido en SPEC.md (spec v1) del proyecto Surprisal: pesos cuantizados a 8 bits con escalas de 16 bits, activaciones en block-floating-point y sustitución de las funciones no lineales por tablas de búsqueda.

La propiedad técnica clave es que cada operación se ejecuta como aritmética entera exacta, sin acumulación en coma flotante. Esto garantiza que las probabilidades calculadas sean bit-idénticas entre plataformas, condición necesaria para que la compresión sea sin pérdidas y verificable. El archivo es reconstruible por cualquiera a partir del modelo base en la revisión fijada, obteniendo el mismo SHA-256. No se documentan en la información disponible datos sobre el corpus de entrenamiento original, uso de RLHF/DPO ni innovaciones de decodificación del modelo base.

## Capacidades

- Estimación de probabilidad del siguiente token con precisión entera determinista, orientada a compresión sin pérdidas.
- Compresión y descompresión de archivos como motor del compresor Surprisal (niveles `-c4` a `-c6`).
- Reproducibilidad bit a bit entre GPU y CPU, requisito para portabilidad de archivos comprimidos.
- Reconstrucción verificable del artefacto a partir del modelo base y su SHA-256 publicado.
- Capacidades de generación de texto y código heredadas del Qwen2.5-Coder-1.5B original, aunque no son el propósito documentado de esta conversión.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada para esta conversión.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Compresión de archivos con modelo de lenguaje: Surprisal usa este modelo como motor probabilístico para comprimir datos en los niveles `-c4` a `-c6`, aprovechando la predicción del siguiente token para codificar con menos bits las secuencias más probables.
- Archivado reproducible entre máquinas: al producir probabilidades bit-idénticas en cualquier GPU o CPU, un archivo comprimido en un equipo puede descomprimirse en otro con garantía de integridad, algo que no ocurre con motores en coma flotante.
- Verificación de integridad de artefactos: el SHA-256 publicado y la posibilidad de reconstruir el GGUF desde el modelo base permiten auditar que el motor de compresión no ha sido alterado.
- Distribución automática de dependencias: Surprisal descarga este modelo la primera vez que un nivel de compresión lo necesita, por lo que sirve como dependencia gestionada en pipelines de compresión automatizados.
- Investigación en compresión basada en modelos de lenguaje: sirve como referencia de implementación entera para comparar ratios de compresión frente a motores en coma flotante.
- Despliegue en entornos sin GPU: al ser aritmética entera exacta y funcionar en CPU, permite comprimir y descomprimir en servidores sin acelerador, manteniendo la compatibilidad con archivos generados en GPU.
- Pruebas de portabilidad numérica: útil para validar que una implementación de inferencia entera reproduce exactamente las probabilidades de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el archivo GGUF ocupa 1.607.594.656 bytes (aproximadamente 1,6 GB), por lo que la huella de pesos es de ese orden.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no documentada; el tamaño de pesos (unos 1,6 GB) sugiere que cabría en GPUs de consumo, pero no hay confirmación del autor.
- Opciones de despliegue: exclusivamente el motor entero de Surprisal (nollama). El autor indica explícitamente que no está pensado para llama.cpp ni otros runtimes GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| Surprisal Qwen2.5-Coder-1.5B INT v1 | 1.572.100.609 | no disponible | GGUF v3 (entero, spec Surprisal) | Apache 2.0 | Motor de compresion sin perdidas determinista |
| Qwen/Qwen2.5-Coder-1.5B (base) | 1.572.100.609 | no disponible en la informacion | safetensors y GGUF estandar | Apache 2.0 | Generacion de codigo y texto |
| Otras conversiones GGUF del mismo base | 1.572.100.609 | no disponible | GGUF (Q4_K_M, Q8_0, etc.) | Apache 2.0 | Inferencia de proposito general en llama.cpp |

La comparación relevante es con el modelo base: comparten pesos y número de parámetros, pero difieren en el objetivo. El base está orientado a generación de código; esta conversión está orientada a producir probabilidades exactas y reproducibles para compresión. Frente a cuantizaciones GGUF convencionales, la diferencia es que aquí no se busca aproximar la inferencia en coma flotante, sino eliminarla por completo para garantizar determinismo.

## Limitaciones y advertencias

- No es un modelo para generación de texto interactiva: su propósito documentado es servir como motor de compresión dentro de Surprisal.
- Incompatible con llama.cpp, Ollama, vLLM, TGI y otros runtimes GGUF estándar; requiere el motor nollama.
- La longitud de contexto no está documentada en la model card, lo que impide planificar su uso en secuencias largas sin consultar la especificación.
- No se documentan sesgos, comportamiento multilingüe ni tasas de alucinación para esta conversión; los hereda del modelo base sin evaluación publicada.
- El rendimiento de compresión depende del nivel (`-c4` a `-c6`) y del contenido; no hay cifras de ratio publicadas en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero cualquier uso fuera del ecosistema Surprisal no está soportado por el autor.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benallfree/surprisal-qwen2.5-coder-1.5b-int-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Repositorio Surprisal: https://github.com/benallfree/surprisal
- Especificación del formato (SPEC.md): https://github.com/benallfree/surprisal/blob/main/SPEC.md
- Definición de modelos v1: https://github.com/benallfree/surprisal/blob/main/spec/models-v1.json
- Motor de inferencia entera nollama: https://github.com/benallfree/nollama
