# cloudcommander/Kvark-Sparkle-27B-Uncensored-MLX-AWQ-4.5bit

## Resumen

Kvark-Sparkle-27B-Uncensored-MLX-AWQ-4.5bit es una cuantización AWQ de 4,45 bits por peso del modelo Egzakta/Kvark-Sparkle-1.0-27B, publicada por el usuario cloudcommander para su ejecución en Apple Silicon mediante MLX. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una edición de pesos que proyecta fuera una dirección de rechazo (abliteration) sobre los pesos BF16 originales y posteriormente los cuantiza con AWQ en una mezcla de 4 y 6 bits. El modelo base es a su vez un post-entrenamiento de Qwen/Qwen3.8-27B, con arquitectura Qwen3_5ForConditionalGeneration de 64 capas y tamaño oculto de 5.120.

El modelo resuelve el problema de disponer de una variante sin censura de Kvark ejecutable en hardware Apple con un consumo de memoria contenido (17,9 GB de pesos). Incorpora una cabeza MTP (multi-token prediction) de una capa para decodificación especulativa, y mantiene el torre de visión original en BF16 sin cuantizar, por lo que conserva la capacidad image-text-to-text. La ventana de contexto declarada en configuración es de 262.144 tokens.

Es relevante ahora porque demuestra un flujo de trabajo reproducible de abliteration por capas con curva de intensidad, evaluado con métricas de deriva (KL y acuerdo top-1) frente al modelo sin editar, y porque mantiene velocidades de decodificación cercanas a las del modelo original gracias a la decodificación especulativa con el drafter DFlash2. La licencia es Apache 2.0 y el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso con capas de atención lineal), 64 capas, hidden size 5.120 |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (config) |
| Tipos de cuantizacion | AWQ afín, group size 64, 4,45 bits por peso: 456 módulos a 4 bits, 42 a 6 bits, 7 proyecciones MTP a 8 bits; torre de visión en BF16 sin cuantizar |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), repo de 17,9 GB (16,68 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 64 capas con tamaño oculto de 5.120, derivado de Qwen3.8-27B mediante un post-entrenamiento realizado por Egzakta. Incluye capas de atención lineal (con `out_proj`) junto a capas de atención estándar (con `o_proj`), y una cabeza MTP de una sola capa almacenada en `model-mtp.safetensors` que habilita decodificación especulativa. La torre de visión se conserva intacta en BF16.

No hubo entrenamiento ni fine-tuning en esta publicación. El proceso fue: primero, recuperar una única dirección de rechazo r de 5.120 floats a partir de la versión sin censura de Qwen3.8-27B de OrcaRouter, verificando que era una abliteration de una sola dirección con coseno 1.000 entre capas; segundo, aplicar la proyección W ← (I − s·r rᵀ) W sobre las 131 matrices que escriben en el flujo residual (embeddings, `o_proj`/`out_proj` de atención, `down_proj` y las dos proyecciones de salida de la cabeza MTP) partiendo de los pesos BF16 de Egzakta; tercero, ajustar una curva de intensidad por capa, eligiendo s = 1,5 en las proyecciones de atención y s = 1 en MLP y embeddings, tras probar 9 curvas y descartar s = 1,5 global (más KL) y s = 2 (rompe el modelo); y cuarto, recuantizar con AWQ en la mezcla 4/6 bits, con un re-grid necesario porque a 4 y 6 bits la edición es menor que un paso de cuantización y la recuantización la revierte.

## Capacidades

- Generación de texto conversacional y razonamiento con modo thinking activable.
- Generación de código: evaluado en LiveCodeBench con thinking on.
- Conocimiento general y razonamiento académico: evaluado en MMLU-Pro.
- Procesamiento image-text-to-text: pipeline declarado, con torre de visión BF16 sin editar.
- Decodificación especulativa mediante cabeza MTP y drafter externo DFlash2.
- Reducción del número de tokens de pensamiento respecto a Qwen3.8 y a Kvark sin editar.
- Comportamiento sin censura: rechazos reducidos de 103 a 11 sobre 104 prompts dañinos en la evaluación del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la model card.

## Casos de uso

- Asistencia de código en local sobre Apple Silicon: el modelo mantiene 197,3 tok/s de decodificación en un M5 Ultra con decodificación especulativa, lo que permite usarlo como asistente interactivo en un Mac Studio sin GPU dedicada.
- Investigación sobre alineación y abliteration: sirve como caso de estudio reproducible de edición de pesos por dirección de rechazo con curva de intensidad por capa, con métricas de deriva KL y acuerdo top-1 publicadas frente al modelo sin editar.
- Evaluación de robustez de salvaguardas: al reducir los rechazos de 103 a 11 sobre 104 prompts dañinos, es útil para probar clasificadores de seguridad y sistemas de moderación externos que deban operar sobre modelos sin censura.
- Análisis de documentos con imagen: al conservar la torre de visión en BF16 y el pipeline image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto a texto en inglés.
- Generación de código en pipelines con requisitos de privacidad: al ejecutarse íntegramente en local con MLX, evita enviar código propietario a APIs externas, con 17,9 GB de pesos que caben en memoria unificada de equipos Apple de gama alta.
- Prototipado de razonamiento con presupuesto de tokens ajustado: el modelo consume menos tokens de pensamiento que Qwen3.8 en las mismas preguntas (3.294 frente a 5.952 de media en LiveCodeBench), lo que reduce el tiempo hasta la respuesta final en tareas de razonamiento.
- Experimentación con decodificación especulativa: la cabeza MTP inline y la compatibilidad con el drafter DFlash2 permiten medir ganancias de throughput en configuraciones MLX personalizadas.

## Benchmarks y rendimiento

Datos publicados por el autor, con muestras pequeñas y rangos solapados según su propia advertencia. Ejecutados en Apple M5 Ultra.

| Metrica | Kvark 4/6 sin editar | Este modelo |
|---|---|---|
| Rechazos, 104 prompts dañinos | 103 | 11 |
| Rechazos, 104 prompts inofensivos | 4 | 1 |
| LiveCodeBench, 40 preguntas, thinking on | 0,80 | 0,90 |
| MMLU-Pro, 100 preguntas, thinking on | 0,82 | 0,83 |
| Decodificación (tok/s, prompt de código de 400 tokens) | 192,9 | 197,3 |
| Time to first token | 0,105 s | 0,104 s |
| Tokens medios por respuesta, LiveCodeBench (límite 16.384) | 4.480 | 3.294 |
| Respuestas cortadas en el límite, LiveCodeBench | 6 de 40 | 2 de 40 |
| Tokens medios por respuesta, MMLU-Pro (límite 8.192) | 1.253 | 1.479 |
| Respuestas cortadas en el límite, MMLU-Pro | 6 de 100 | 7 de 100 |

Deriva respecto al modelo sin editar (8 bits, 6.656 posiciones de texto de código, teacher forcing): acuerdo top-1 0,979 y KL 0,0084. Esta build frente a la versión sin censura de 8 bits: top-1 0,959 y KL 0,018, idéntico a la deriva de Kvark 4/6 frente a su 8 bits.

## Requisitos de hardware

- VRAM/memoria: 17,9 GB de pesos en disco (16,68 GiB); en ejecución requiere memoria unificada suficiente para pesos más caché KV int8 y overhead del runtime.
- Hardware objetivo: Apple Silicon con MLX; el autor reporta ejecución en Mac Studio con M5 Ultra.
- GPU NVIDIA: no es el objetivo de esta build; requiere conversión a otro formato para vLLM, TGI o llama.cpp.
- Cabe en GPU de consumo: no confirmado para esta build MLX; el tamaño de 27,78 B parámetros a 4,45 bits queda en torno a 17,9 GB, lo que en teoría encajaría en GPUs de 24 GB tras conversión, pero no hay datos publicados al respecto.
- Despliegue: librería MLX con el motor oMLX y el engine Splash según el autor; decodificación especulativa con el drafter `z-lab/Qwen3.8-27B-DFlash2`; caché KV int8.
- Latencia y throughput: 197,3 tok/s de decodificación y 0,104 s hasta el primer token en M5 Ultra con una petición única y prompt de código de 400 tokens; variación entre sesiones de aproximadamente 7 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Kvark-Sparkle-27B-Uncensored-MLX-AWQ-4.5bit) | 27,78 B | 262.144 | Apache 2.0 | AWQ 4/6 bits, MLX, abliterated, visión BF16, MTP |
| cloudcommander/Kvark-Sparkle-27B-Uncensored-MLX-8bit | 27,78 B | 262.144 | Apache 2.0 | Gemelo en 8 bits, mayor precisión, mayor tamaño |
| Egzakta/Kvark-Sparkle-1.0-27B | 27,78 B | 262.144 | Apache 2.0 | Base BF16 sin editar, con censura |
| Qwen/Qwen3.8-27B (vía OrcaRouter uncensored) | 27,78 B | no disponible | no disponible | Referencia de origen de la dirección de rechazo; 191,1 tok/s en la misma receta 4/6 |

## Limitaciones y advertencias

- Modelo sin censura: la reducción de rechazos de 103 a 11 sobre 104 prompts dañinos implica que puede generar contenido dañino; requiere moderación externa en cualquier despliegue público.
- Solo inglés declarado; el rendimiento en otros idiomas no está evaluado.
- Las evaluaciones se basan en muestras pequeñas (40 preguntas en LiveCodeBench, 100 en MMLU-Pro, 104 prompts por conjunto) y el propio autor indica que los rangos se solapan y deben leerse como indicaciones, no como benchmarks.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- La edición de pesos es menor que un paso de cuantización a 4 y 6 bits, por lo que recuantizar la build revierte parcialmente la abliteration; no debe recuantizarse sin repetir el re-grid.
- La licencia Apache 2.0 se hereda del modelo base, pero el uso comercial de una variante sin censura puede conllevar obligaciones legales adicionales según la jurisdicción y el caso de uso.
- Dependencia de MLX y Apple Silicon: no hay pesos GGUF ni safetensors estándar para vLLM o TGI en este repositorio.
- La decodificación especulativa depende del drafter DFlash2, entrenado sobre Qwen3.8 estándar; sin él, la velocidad cae a la de un 4 bits convencional.
- El modelo no está hecho ni respaldado por Egzakta, según indica el autor.

## Enlaces

- Hugging Face: https://huggingface.co/cloudcommander/Kvark-Sparkle-27B-Uncensored-MLX-AWQ-4.5bit
- Gemelo en 8 bits: https://huggingface.co/cloudcommander/Kvark-Sparkle-27B-Uncensored-MLX-8bit
- Modelo base: https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B
- Modelo de origen de Qwen3.8: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversión MLX 8 bits de OrcaRouter: https://huggingface.co/npario/Qwen3.8-27B-Uncensored-OrcaRouter-MLX-8bit
- Drafter de decodificación especulativa: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Heretic (herramienta de abliteration y marcadores de rechazo): https://github.com/p-e-w/heretic
