# Cyronius/Qwen3.8-Flash-Next-131B-A6B-GGUF

## Resumen

Qwen3.8-Flash-Next-131B-A6B-GGUF es una versión podada y cuantizada del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario Cyronius. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con 48 capas y 512 expertos por capa, que activa aproximadamente 6.000 millones de parámetros por token. La modificación principal consiste en eliminar 14 de las 16 cabezas de la tabla de n-gramas con hash-embedding incrustada en la capa 1, reduciendo los parámetros totales de unos 176.000 millones a unos 132.143 millones sin reentrenar ni alterar el resto de tensores.

El modelo resuelve el problema de desplegar un MoE de gran tamaño en hardware limitado: reduce el GGUF de 90 GB (UD-Q3_K_XL de unsloth) a 64,8 GB manteniendo, según el autor, paridad en tool calling, GSM8K y MMLU. La poda explota la redundancia de un esquema de hashing multi-cabeza de tipo filtro de Bloom, donde cada n-grama se consulta por varias vías independientes.

Es relevante para desarrolladores que necesitan ejecutar un modelo de razonamiento y tool calling de gama alta en GPUs de consumo o en configuraciones multi-GPU de 32 GB. La contrapartida documentada es un aumento de la perplejidad en wikitext de 2,40 a 4,66, lo que indica menor calidad en la predicción superficial del siguiente token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (48 capas, 512 expertos), con tabla de n-gramas hash-embedding de 16 cabezas en la capa 1 y atención dispersa QSA |
| Parametros totales | 132.143.667.360 (~131B) |
| Parametros activos | ~6B por token |
| Longitud de contexto | 256K nativo (según el autor); comportamiento en contexto largo no evaluado |
| Tipos de cuantizacion | GGUF: Q3_K_XL dinámico (UD-Q3_K_XL heredado de unsloth) y Q4_0 (heredado de bartowski) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (llama.cpp); tensores de visión en mmproj separado de unsloth |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 48 capas y 512 expertos, que activa unos 6.000 millones de parámetros por token sobre un total de aproximadamente 176.000 millones. Una parte sustancial del total, 51.200 millones de parámetros (cerca del 29% de los pesos), corresponde a una tabla de n-gramas con hash-embedding inyectada en la capa 1: 16 cabezas independientes, 8 por tipo de n-grama (bigramas y trigramas). Cada n-grama se consulta de varias formas independientes, lo que proporciona un margen de seguridad redundante similar al de un filtro de Bloom.

La intervención de Cyronius no implica entrenamiento ni cirugía sobre el transformer: conserva 1 cabeza de cada 8 por tipo de n-grama y descarta las otras 14, dejando la tabla en 6.400 millones de parámetros. El resto de tensores se copia byte a byte desde el cuantizado dinámico UD-Q3_K_XL de unsloth, preservando exactamente su calibración imatrix. Las cabezas conservadas se eligieron por posición (la primera de cada grupo de 8), no por ranking de importancia. El autor probó también la poda clásica de capas del transformer y la descartó: GSM8K cayó a 0,33-0,67 y la perplejidad subió por encima de 13 con tamaños de 53-60 GB. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni las fases de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional en modo instruct y modo thinking, con parámetros de muestreo recomendados distintos para cada uno.
- Razonamiento multi-paso y matemáticas: el autor reporta 1.000 en el subconjunto GSM8K-15 en modo no-think.
- Tool calling y function calling: 1.000 de acierto en 40 casos agénticos con esquemas disjuntos de cualquier dato visto durante la poda.
- Comportamiento agéntico con selección correcta de herramienta y argumentos, o rechazo correcto cuando procede.
- Conocimiento general evaluado con MMLU-30 (0,833 en el build Q3_K_XL).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: los tensores de visión se distribuyen por separado como mmproj de unsloth, pero el autor indica que la ruta de visión no está probada con esta poda.
- Decodificación especulativa MTP: no disponible, porque llama.cpp no exporta ni ejecuta la cabeza MTP para esta arquitectura.

## Casos de uso

- Asistentes de código con tool calling: el modelo puede seleccionar funciones y generar argumentos correctos en pipelines de CI/CD o IDE, gracias a su paridad medida en 40 casos agénticos y a su ventana de 256K tokens para incluir contexto de repositorio.
- Automatización de atención al cliente multi-turno: la ventana de 256K permite arrastrar historial e información de producto; conviene validar la calidad en contexto largo, no evaluada por el autor.
- Razonamiento matemático y resolución de problemas: útil en entornos educativos o de validación de cálculos, con 1.000 en GSM8K-15 como referencia de partida.
- Despliegue en estaciones de trabajo con 2×32 GB: el flag `--override-tensor "per_layer_token_embd\.weight=CPU"` mueve la tabla de n-gramas (3,6 GB en Q4_0) a RAM del sistema y deja unos 72 GB de transformer en GPU, haciendo viable el Q4_0 en dos tarjetas de 32 GB.
- Inferencia en GPUs antiguas (AMD gfx906 MI50/MI60, NVIDIA Pascal P40/P100): el build Q4_0 alcanza la ruta MMVQ de llama.cpp, mientras que los cuantizados K e IQ4_NL caen en una ruta genérica de dequantización varias veces más lenta.
- Ejecución en CPU con RAM abundante: el autor confirma que funciona en máquinas sin GPU, lento pero correcto, con unos 70 GB de RAM libre para Q3_K_XL y unos 80 GB para Q4_0.
- Generación de texto y resúmenes en producción con restricciones de VRAM: el Q3_K_XL de 64,8 GB cabe en una A100 de 80 GB con offload completo, a costa de una perplejidad mayor en prosa.

## Benchmarks y rendimiento

Mediciones del autor en llama.cpp b10673, CUDA, A100, temperatura 0, mismo día. Tool calling: 40 casos agénticos. GSM8K-15 y MMLU-30 en modo no-think. Perplejidad: wikitext-2 test, 32 fragmentos de 512 tokens.

| Modelo | Tamano | Tools | GSM8K | MMLU | Perplejidad |
|---|---:|---:|---:|---:|---:|
| Base UD-Q3_K_XL | 90 GB | 0,900 | 1,000 | 0,833 | 2,40 |
| Este modelo (2/16 cabezas) | 64,8 GB | 1,000 | 1,000 | 0,833 | 4,66 |
| Tabla eliminada por completo (0/16) | 61,2 GB | 0,975 | 1,000 | 0,767 | 4,80 |

El autor advierte que la precisión en tool calling tiene una banda de ±3 casos entre ejecuciones y backends a temperatura 0 (una ejecución de control en CPU puntuó 0,975 para el base), por lo que "1,000 frente a 0,900" debe leerse como paridad, no como mejora. El build Q4_0 no ha sido evaluado por separado y, según el autor, nadie lo ha ejecutado todavía.

## Requisitos de hardware

- VRAM para Q3_K_XL: aproximadamente 66 GB o más para offload completo en GPU.
- VRAM para Q4_0: aproximadamente 77 GB o más para offload completo; con `--override-tensor` se liberan 3,6 GB de tabla a RAM y quedan unos 72 GB de transformer en GPU.
- GPU recomendadas: A100 de 80 GB para el Q3_K_XL con offload completo; 2×32 GB viables para Q4_0 con la tabla en RAM del sistema.
- GPUs de consumo: no cabe en una RTX 4090 de 24 GB ni en tarjetas de 32 GB individuales; requiere configuraciones multi-GPU o CPU.
- GPUs antiguas: AMD gfx906 (MI50/MI60) y NVIDIA Pascal (P40/P100) se benefician del build Q4_0 por su ruta MMVQ.
- CPU: ejecución posible con unos 70 GB de RAM libre (Q3_K_XL) o 80 GB (Q4_0), lenta pero correcta.
- Despliegue: llama.cpp desde 2026-08-27 o posterior (soporte `qwen4exp`; probado con b10673), mediante `llama-server`. No se mencionan vLLM, TGI ni Ollama.
- Muestreo recomendado: instruct con temp 0,7, top_p 0,8, presence_penalty 1,5; thinking con temp 1,0, top_p 0,95.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tools / GSM8K / MMLU | Perplejidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (2/16 cabezas, Q3_K_XL) | ~131B totales, ~6B activos | 256K nativo (no evaluado) | 1,000 / 1,000 / 0,833 | 4,66 | qwen-community-1.0 | GGUF en HF, 64,8 GB |
| Base UD-Q3_K_XL (unsloth) | ~176B totales, ~6B activos | 256K nativo | 0,900 / 1,000 / 0,833 | 2,40 | qwen-community-1.0 | GGUF en HF, 90 GB |
| Tabla eliminada (0/16) | ~125B totales, ~6B activos | 256K nativo | 0,975 / 1,000 / 0,767 | 4,80 | qwen-community-1.0 | Variante del mismo autor, 61,2 GB |
| Q4_0 de bartowski (base) | ~176B totales, ~6B activos | 256K nativo | no disponible | no disponible | qwen-community-1.0 | GGUF en HF, 75,4 GB en la variante podada |

## Limitaciones y advertencias

- La perplejidad en wikitext sube de 2,40 a 4,66: la prosa es menos fluida y puede afectar a cargas de trabajo con recuperación literal (citas, reproducción de plantillas o boilerplate).
- Evaluación limitada a un benchmark interno pequeño (40 casos de tools, GSM8K-15, MMLU-30) y a contextos de 8K o menos; el comportamiento en contexto largo con atención dispersa QSA y 256K nativos no está probado.
- Las cabezas conservadas se eligieron por posición, no por importancia calibrada; una selección calibrada podría mejorar ligeramente los resultados, pero nadie lo ha medido.
- El build Q4_0 no está evaluado ni ejecutado por terceros; su verificación es estructural (cabezas descartadas apuntan a una fila compartida de ceros, cabezas conservadas idénticas byte a byte), pero los números del Q3_K_XL no son transferibles.
- La ruta de visión no está probada con esta poda; los tensores de visión se distribuyen aparte como mmproj de unsloth.
- La decodificación especulativa MTP no está disponible en llama.cpp para esta arquitectura.
- Licencia qwen-community-1.0: conviene revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo base en la documentación proporcionada.
- Requiere una versión concreta y reciente de llama.cpp (2026-08-27 o posterior); versiones anteriores no cargarán el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cyronius/Qwen3.8-Flash-Next-131B-A6B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cuantizado UD-Q3_K_XL de unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Cuantizado Q4_0 de bartowski: https://huggingface.co/bartowski/Qwen3.8-Flash-Next-GGUF
