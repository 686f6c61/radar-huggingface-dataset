# DavidAU/Qwen3.8-27B-BIGBANG-Cold-Fusion-718

## Resumen

Qwen3.8-27B-BIGBANG-Cold-Fusion-718 es un ajuste fino (finetune) de la familia Qwen 3.8, publicado por DavidAU, un autor conocido en Hugging Face por sus variantes "Heretic/Uncensored" y sus pipelines de entrenamiento multietapa. El modelo parte de `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` y se distribuye con licencia Apache 2.0, pesos en safetensors y compatibilidad con la librería `transformers`. Su pipeline declarado es `image-text-to-text`, aunque la model card no documenta en detalle el componente de visión.

Con 27.781.427.952 parámetros totales (unos 27,8 mil millones) y un repositorio de 55,6 GB, se posiciona en la franja de modelos densos de ~27B, un tamaño que permite despliegues en una sola GPU de 80 GB en precisión completa y en GPUs de consumo con cuantización agresiva. La propuesta del autor gira en torno a la reducción de "tokens de razonamiento" (thinking tokens) manteniendo o mejorando la calidad, junto con modos de instrucción y razonamiento conmutables.

La relevancia actual del modelo es doble: por un lado, ofrece una alternativa afinada sobre la base Qwen 3.8 con licencia permisiva y pesos abiertos; por otro, su naturaleza "uncensored" (con métricas de rechazo declaradas por el autor) lo hace interesante para investigación sobre alineamiento, pero problemático para despliegues comerciales sujetos a políticas de contenido estrictas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.8; detalles de atención no disponibles) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El autor publica variantes GGUF (NEO, NEO MAX, MTP) en repositorios hermanos; se mencionan formatos mxfp8 y mxfp4 en la evaluación de benchmarks. Cuantizaciones estándar (Q4_K_M, Q8_0, etc.) no detalladas en esta ficha |
| Idiomas soportados | Inglés (`en`) según la metadata del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorios derivados del autor |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia Qwen 3.8 y de su naturaleza de transformer denso de ~27,8B parámetros. El autor describe un pipeline propietario denominado "Cold Fusion" con "GAIN Training" y "Multi-stage tuning", aplicado sobre un modelo base ya afinado (`Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`). No se especifican el número de tokens de entrenamiento, la composición exacta de los datasets (se citan `Polar-STRICT-Datasets`, `F451-STRICT-Datasets` y `THE-DECKARD-Datasets`, todos del propio autor) ni si se emplearon técnicas de RLHF o DPO.

La innovación declarada por el autor es la reducción del número de tokens de razonamiento (hasta 1/2 a 1/20 respecto a la base, según la model card del repositorio hermano 709) y la disponibilidad de múltiples modos de razonamiento e instrucción conmutables en caliente. También se menciona el uso de `unsloth` en el proceso de ajuste y la publicación de plantillas Jinja actualizadas para tool calling. No hay información verificable sobre decodificación especulativa, atención lineal u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento con modos de "thinking" conmutables (el autor menciona cinco modos de razonamiento y cinco de instrucción en la línea de modelos relacionada).
- Tool calling / function calling, con plantillas Jinja específicas publicadas por el autor (una estándar de ~17 KB y una "enhanced tool" de ~32 KB).
- Procesamiento image-text-to-text según el pipeline declarado, aunque sin documentación detallada del soporte visual.
- Generación de código y tareas de "coder" en las variantes NEO CODER del ecosistema del autor.
- Comportamiento "uncensored" parcial: la model card reporta 68/100 rechazos frente a 86/100 del Qwen 3.8 sin ajustar, con divergencia KL de 0,0025.
- Capacidades multilingües limitadas: la metadata solo declara inglés.

## Casos de uso

- Asistentes conversacionales de dominio cerrado: el modelo puede mantener diálogos multi-turno en inglés con instrucciones de sistema estrictas, aprovechando los modos de instrucción conmutables para alternar entre respuestas directas y razonamiento extendido según la consulta.
- Investigación sobre alineamiento y censura: con métricas de rechazo declaradas (68/100) y divergencia KL baja (0,0025), sirve para estudiar el efecto de ajustes "heretic" sobre la distribución del modelo base sin degradar excesivamente las capacidades generales.
- Generación de código en pipelines internos: las variantes NEO CODER del ecosistema y el soporte de tool calling permiten integrarlo en flujos de autocompletado, revisión o generación de tests, siempre con revisión humana dado el riesgo de alucinación.
- Prototipado de agentes con herramientas: las plantillas Jinja de tool calling facilitan la integración con frameworks de agentes que requieran formato de funciones estructurado, aunque conviene validar la robustez del formato en producción.
- Evaluación comparativa de ajustes finos: al estar construido sobre una cadena de finetunes documentada, es útil como punto de comparación en estudios sobre multi-stage tuning y reducción de tokens de razonamiento.
- Despliegue local en estaciones de trabajo con GPU de consumo: gracias a las variantes GGUF publicadas por el autor, puede ejecutarse con llama.cpp u Ollama en GPUs de 24 GB con cuantizaciones de 4 bits, para tareas de asistencia personal o experimentación.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del repositorio hermano (709) y de la comparativa del autor, evaluados por "nightmedia" en modo instruct. No se han publicado resultados específicos para este repositorio 718 en la información disponible.

| Modelo | Precisión | ARC-C | ARC-E | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande |
|---|---|---|---|---|---|---|---|---|
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L (finalista) | mxfp8 | 0,709 | 0,876 | 0,914 | 0,827 | 0,524 | 0,834 | 0,779 |
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L (finalista) | mxfp4 | 0,701 | 0,877 | 0,913 | 0,821 | 0,518 | 0,830 | 0,786 |
| Qwen3.8-27B (base, sin ajuste) | mxfp8 | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.8-27B (base, sin ajuste) | mxfp4 | 0,581 | 0,771 | 0,889 | 0,738 | 0,442 | 0,798 | 0,713 |
| Qwen3.6-27B | mxfp8 | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.6-35B-A3B | mxfp8 | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |
| Qwen3.5-27B | mxfp8 | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |

El autor indica que BF16 suele superar a MXFP8 en 2-5 puntos en la mayoría de métricas, y que el modo "thinking" tiende a superar los resultados de modo instruct. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~55,6 GB en BF16 (coincide con el tamaño del repositorio); ~28 GB en FP8; ~14-16 GB en cuantizaciones de 4 bits.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 sin offloading; A100 40 GB o RTX 6000 Ada para FP8; RTX 4090 (24 GB) viable con cuantización de 4-8 bits.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) con cuantizaciones de 4 bits; en GPUs de 16 GB requiere cuantizaciones más agresivas o offloading parcial a CPU.
- Opciones de despliegue: `transformers` (formato nativo safetensors), vLLM y TGI para serving en FP8/BF16; llama.cpp, Ollama y LM Studio mediante las variantes GGUF publicadas por el autor en repositorios hermanos.
- Latencia y throughput: no disponibles en la información proporcionada. El autor menciona reducciones de tokens de razonamiento de 1/2 a 1/20, lo que en modo thinking puede traducirse en menor tiempo hasta la primera respuesta útil, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-BIGBANG-Cold-Fusion-718 (este) | ~27,8B | No disponible | Apache 2.0 | Inglés | Finetune "uncensored" con modos conmutables; benchmarks ARC/BoolQ/HellaSwag superiores a la base Qwen3.8-27B |
| Qwen3.8-27B (base) | ~27B | No disponible | Apache 2.0 (presumible) | Multilingüe | Referencia sin ajuste; puntuaciones inferiores en la comparativa del autor |
| Qwen3.6-27B | ~27B | No disponible | Apache 2.0 (presumible) | Multilingüe | Generación anterior; HellaSwag 0,773 y Winogrande 0,742 en mxfp8 |
| Qwen3.6-35B-A3B | ~35B (MoE, ~3B activos) | No disponible | Apache 2.0 (presumible) | Multilingüe | MoE con menor coste de inferencia por token activo; puntuaciones ligeramente inferiores en la tabla del autor |

## Limitaciones y advertencias

- El ajuste "uncensored" reduce los rechazos a 68/100, lo que implica que el modelo puede producir contenido que los modelos base rechazarían; inadecuado para aplicaciones comerciales con políticas de contenido estrictas sin filtros adicionales.
- La metadata solo declara inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- No se especifica la longitud de contexto soportada, lo que impide planificar despliegues con documentos largos sin pruebas previas.
- Riesgo de alucinación inherente a modelos de ~27B; la model card no aporta evaluaciones de factualidad ni de calibración.
- Los benchmarks publicados son del repositorio hermano 709, no de este 718; deben tomarse como orientativos y no como resultados verificados de este modelo concreto.
- La cadena de finetunes sobre finetunes dificulta la trazabilidad de los datos de entrenamiento y de los posibles sesgos heredados.
- Aunque la licencia es Apache 2.0, el uso comercial debe evaluar el cumplimiento de las políticas de contenido de la plataforma de despliegue y las obligaciones de transparencia sobre contenido generado.
- El soporte de visión (`image-text-to-text`) no está documentado; no debe asumirse un rendimiento fiable en tareas multimodales sin validación empírica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-BIGBANG-Cold-Fusion-718
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio hermano con GGUF y model card completa: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Proyecto Cold Fable Fusion GAIN V1.1: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fable-Fusion-GAIN-V1.1-732-Heretic-Uncensored-stage1
- Release #1 de la rama (NEO CODER MAX MTP GGUF): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Qwen3.6-27B Fable Fusion: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
