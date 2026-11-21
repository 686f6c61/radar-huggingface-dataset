# DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored es un ajuste fino (finetune) del modelo Qwen3.8 de 27B de parámetros, desarrollado por el usuario DavidAU sobre su propio modelo intermedio Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU. Se trata de un modelo multimodal de tipo image-text-to-text (según el pipeline declarado) orientado a la eliminación del alineamiento de seguridad (denominado "heretic" o "uncensored" por el autor) y a la reducción del número de tokens de razonamiento generados, manteniendo o mejorando el rendimiento en tareas de instrucción.

El modelo forma parte de una familia de variantes del proyecto "Cold Fable Fusion" del mismo autor, que aplica una combinación de técnicas propietarias denominadas "Cold Fusion", "GAIN Training" y "Multi-stage tuning", junto con un proceso de entrenamiento multi-etapa. El autor reporta que esta variante "ULTRA" reduce las negativas (refusals) de 86/100 del modelo base sin ajustar a 6/100, con una divergencia KL de 0,0397 respecto al modelo original, lo que indica una modificación sustancial de la distribución de salida.

La relevancia de este modelo es doble: por un lado, demuestra técnicas de reducción de tokens de razonamiento (hasta 1/2 a 1/20 según el autor) que pueden reducir costes de inferencia en modelos con modo "thinking"; por otro, es un ejemplo de la comunidad de ajustes finos que eliminan restricciones de seguridad, lo que plantea consideraciones importantes para su uso en producción. Cuenta con 935 descargas y 83 likes en Hugging Face, y se distribuye con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8; arquitectura exacta no disponible) |
| Parámetros totales | 27.781.427.952 (≈27,8B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP8, MXFP4 (reportados en benchmarks); GGUF en repositorio separado; BF16 mencionado |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio NEO-MTP-GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.8 de 27B parámetros, presumiblemente un transformer decoder-only, aunque la model card no detalla la arquitectura interna (número de capas, dimensiones, mecanismos de atención). El autor indica que el modelo base es su propio finetune Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, y que este modelo representa la variante "ULTRA" del proyecto de des-censura, con mayor eliminación del alineamiento de seguridad que la variante "L" (Light).

El entrenamiento emplea una combinación de técnicas denominadas por el autor "Cold Fusion", "GAIN Training" y "Multi-stage tuning", con datasets propios (Polar-STRICT-Datasets, F451-STRICT-Datasets, THE-DECKARD-Datasets). La variante final seleccionada, denominada internamente "Stage2b-rplus3", se eligió por su seguimiento de instrucciones consistente, atención al detalle y capacidad de "multi-stage drafting" (borrador multi-etapa) cuando se le solicita. El autor reporta que el modelo incorpora 5 modos de razonamiento y 5 modos de instrucción conmutables en tiempo de ejecución (vía API, directa y en mensaje de chat), y que reduce los tokens de "thinking" entre 1/2 y 1/20 respecto al modelo base. No se especifican el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto conversacional multi-turno en 16 idiomas.
- Procesamiento de imagen y texto (pipeline image-text-to-text declarado).
- Razonamiento con modo "thinking" conmutables (5 modos de razonamiento y 5 modos de instrucción).
- Reducción de tokens de razonamiento (1/2 a 1/20 según el autor), lo que reduce costes y latencia.
- Seguimiento de instrucciones reforzado y "multi-stage drafting" para tareas de alta precisión.
- Capacidad de "double checking" y verificación de detalles cuando se le solicita.
- Modelo des-censurado: baja tasa de negativas (6/100 reportadas frente a 86/100 del base).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible explícitamente, aunque el "multi-step reasoning" se menciona de forma indirecta.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la eliminación del alineamiento (KL divergence 0,0397, refusals 6/100) en comparación con el modelo base, útil para equipos de investigación en seguridad de IA.
- Generación de contenido creativo sin restricciones: para aplicaciones de ficción, guiones o narrativa donde se requiere contenido sin filtros de seguridad, con la advertencia de revisión humana posterior.
- Reducción de costes de inferencia en razonamiento: los modos con reducción de tokens de thinking (hasta 1/20) permiten desplegar razonamiento en entornos con presupuesto de tokens limitado, como agentes con muchas llamadas encadenadas.
- Procesamiento multimodal de documentos: al ser image-text-to-text, puede usarse para extracción de información de imágenes y documentos combinados con texto, en 16 idiomas.
- Atención al cliente multilingüe: con soporte para 16 idiomas y conversación multi-turno, adecuado para despliegues internacionales (con las cautelas de contenido del modelo).
- Evaluación comparativa de finetunes: sirve como referencia para comparar técnicas de "Cold Fusion" y "GAIN Training" frente a Qwen3.8, Qwen3.6 y Qwen3.5 en benchmarks de razonamiento (ARC, BoolQ, HellaSwag, OpenBookQA, PIQA, WinoGrande).
- Prototipado de asistentes con modos conmutables: los 5 modos de razonamiento e instrucción permiten adaptar el comportamiento del modelo en tiempo de ejecución sin recargar pesos.

## Benchmarks y rendimiento

Resultados reportados por el autor (nightmedia), en modo instruct, con cuantización MXFP8 y MXFP4. Columnas: arc/c, arc/e, boolq, hswag, obkqa, piqa, wino.

| Modelo | Cuantización | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|---|
| TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC | mxfp8 | 0,699 | 0,873 | 0,911 | 0,827 | 0,528 | 0,833 | 0,781 |
| TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC | mxfp4 | 0,692 | 0,879 | 0,910 | 0,823 | 0,518 | 0,835 | 0,775 |
| TURBO-Fable-Cold-Fusion-709-L (referencia) | mxfp8 | 0,709 | 0,876 | 0,914 | 0,827 | 0,524 | 0,834 | 0,779 |
| TURBO-Fable-Cold-Fusion-709-L (referencia) | mxfp4 | 0,701 | 0,877 | 0,913 | 0,821 | 0,518 | 0,830 | 0,786 |
| Qwen3.8-27B (base sin ajustar) | mxfp8 | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.8-27B (base sin ajustar) | mxfp4 | 0,581 | 0,771 | 0,889 | 0,738 | 0,442 | 0,798 | 0,713 |
| Qwen3.6-27B | mxfp8 | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.6-35B-A3B | mxfp8 | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |
| Qwen3.5-27B | mxfp8 | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |

Notas del autor: BF16 se sitúa aproximadamente 2-5 puntos por encima de MXFP8 en la mayoría de métricas; en modo thinking los resultados superan los de modo instruct. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,8B parámetros, en BF16 se requieren aproximadamente 55,6 GB de pesos (tamaño del repo), por lo que se necesita al menos una GPU de 80 GB (A100/H100) o varias GPUs. En MXFP8, aproximadamente 28 GB; en MXFP4, aproximadamente 14 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB para BF16; RTX 4090 (24 GB) para cuantizaciones de 8 bits; GPUs con 16-24 GB para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 bits (MXFP4/GGUF Q4) en tarjetas de 16-24 GB como RTX 4090, RTX 4080 o RTX 3090.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI (no confirmados explícitamente pero compatibles con safetensors), llama.cpp/Ollama mediante el repositorio GGUF NEO-MTP-GGUF del autor.
- Latencia y throughput: no disponibles. El autor indica reducción de tokens de thinking de 1/2 a 1/20, lo que reduce el coste de decodificación en modo razonamiento, pero no se aportan cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored | 27,8B | no disponible | Apache 2.0 | Hugging Face (935 descargas) | Finetune des-censurado, multimodal, 16 idiomas |
| Qwen3.8-27B (base) | 27B | no disponible | no disponible | Hugging Face | Modelo original sin ajuste; refusals 86/100 |
| Qwen3.6-27B | 27B | no disponible | no disponible | Hugging Face | Mayor rendimiento en ARC que Qwen3.8 base |
| Qwen3.6-35B-A3B (MoE) | 35B totales / 3B activos | no disponible | no disponible | Hugging Face | MoE con menor coste de inferencia por token activo |
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | 27,8B | no disponible | Apache 2.0 | Hugging Face | Variante menos des-censurada (68/100 refusals, KL 0,0025) |

## Limitaciones y advertencias

- Modelo explícitamente des-censurado: la eliminación del alineamiento de seguridad (6/100 refusals frente a 86/100 del base) implica que puede generar contenido dañino, ofensivo o ilegal sin filtros. No apto para aplicaciones de cara al público sin moderación externa.
- Riesgo elevado de alucinación: los finetunes agresivos y la reducción de tokens de razonamiento pueden degradar la fidelidad factual; no se aportan datos de benchmarks de veracidad.
- Divergencia KL de 0,0397 respecto al modelo base: modificación sustancial de la distribución de salida, con posible pérdida de capacidades del modelo original no evaluadas (código, matemáticas, tool calling).
- Idiomas: aunque se declaran 16 idiomas, la model card solo lista "en" en el campo de idiomas de Hugging Face; el rendimiento real en idiomas distintos del inglés no está verificado.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero el uso de un modelo des-censurado puede incumplir políticas de plataformas (Hugging Face, proveedores cloud) y normativas locales.
- Procedencia y reproducibilidad: las técnicas de entrenamiento ("Cold Fusion", "GAIN Training") no están documentadas técnicamente; los benchmarks son reportados por el propio autor sin verificación independiente.
- Fecha de creación futura (2026-09-09) en los metadatos: inconsistencia que conviene verificar antes de confiar en la información de la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Repositorio GGUF NEO-MTP: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Proyecto Cold Fable Fusion GAIN V1.1: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fable-Fusion-GAIN-V1.1-732-Heretic-Uncensored-stage1
- Release #1 de la rama: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Variante L (menos des-censurada): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
