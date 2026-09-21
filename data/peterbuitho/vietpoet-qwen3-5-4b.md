# peterbuitho/VietPoet-Qwen3.5-4B

## Resumen

VietPoet Qwen3.5-4B es un ajuste fino (QLoRA) del modelo Qwen/Qwen3.5-4B orientado a la composición de poesía vietnamita en la forma métrica *lục bát*, un patrón tradicional de versos alternos de seis y ocho sílabas con reglas estrictas de tono y rima. Lo publica el usuario peterbuitho en HuggingFace bajo licencia Apache-2.0, con pesos en safetensors de 16 bits (bf16) y un repositorio separado en formato GGUF para llama.cpp y LM Studio.

El modelo resuelve un problema muy concreto: generar poemas que cumplan la forma *lục bát* y no solo que "suenen" a poesía. Según la model card, usado en crudo acierta la forma métrica en torno al 10 % de los casos, mientras que combinado con el muestreador línea a línea del repositorio ThoLucBat (16 muestras por línea, seleccionando la que satisface las reglas) la tasa de poemas plenamente válidos sube al 98 %. Es, por tanto, un modelo pensado para desplegarse como componente de un sistema, no como generador aislado.

El modelo tiene 4.659.865.088 parámetros (~4,66 mil millones) y deriva de una base multimodal según los tags del repositorio (image-text-to-text), aunque la model card solo documenta la tarea de generación de texto. El idioma declarado es únicamente vietnamita (vi). No se especifica la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-4B); ajuste fino con QLoRA fusionado en los pesos |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (16 bits) en safetensors; version GGUF en repositorio aparte (niveles no especificados) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16); GGUF en repositorio separado |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,66 mil millones de parámetros, con el chat template de Qwen y *thinking* desactivado en el formato de prompt documentado (`<|im_start|>system ... <|im_end|>` y turno de asistente con bloque `<think>` vacío). Sobre esa base se aplicó un ajuste fino QLoRA sobre el modelo cuantizado a 4 bits, con r=16, alpha=16, learning rate 2e-4, 2 épocas, batch 2 con acumulación de gradiente 4 y longitud máxima de 1024 tokens, usando Unsloth 2026.9.7. Los adaptadores LoRA se fusionaron en los pesos finales, que se publican en bf16. La configuración completa está en el repositorio del autor (`runs/sft-v1/train_config.json`).

El corpus de entrenamiento es phamson02/vietnamese-poetry-corpus (CC BY 4.0), filtrado para conservar solo poemas que pasan un comprobador de reglas *lục bát*, con un total de 8.000 poemas. No se documenta uso de RLHF ni DPO. La innovación técnica no está en el modelo sino en el sistema de inferencia: el muestreador línea a línea genera 16 candidatos por verso y retiene el que cumple las reglas de tono y rima, apoyándose en la idea de puntuación descrita en el artículo arXiv:2401.01078 sobre generación de poesía vietnamita.

## Capacidades

- Generación de texto en vietnamita con estructura métrica *lục bát* (pares de versos de 6 y 8 sílabas).
- Generación siguiendo instrucciones con el chat template de Qwen (`system`/`user`/`assistant`) y modo *thinking* desactivado.
- Generación incremental línea a línea, que permite integrar verificación de reglas en el bucle de decodificación.
- Conversación multi-turno, según los tags del repositorio (conversational).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no documentadas; el único idioma declarado es el vietnamita.
- Capacidades de visión o audio: no documentadas, aunque el tag `image-text-to-text` del repositorio sugiere que el modelo base es multimodal. La model card no describe ninguna tarea de imagen.

## Casos de uso

- Composición asistida de poesía *lục bát*: el modelo genera borradores verso a verso y el muestreador del repositorio ThoLucBat filtra los candidatos que incumplen las reglas de tono (sílaba 6 y 8 del verso *bát*) y rima, elevando la validez formal del 10 % al 98 % en la evaluación del autor.
- Generación de contenido editorial en vietnamita: producción de textos con forma poética tradicional para suplementos culturales, blogs o publicaciones literarias, siempre con revisión humana del significado.
- Herramienta educativa para el aprendizaje de métrica vietnamita: mostrar al estudiante varias propuestas por línea y explicar por qué unas cumplen las reglas y otras no, usando la puntuación de reglas como señal objetiva.
- Componente de un pipeline de generación con verificación: al exponer el sampler línea a línea, el modelo encaja en arquitecturas de generate-and-rank donde un verificador determinista decide la salida final.
- Prototipado de aplicaciones literarias interactivas: dado que se publica en safetensors para transformers/vLLM y en GGUF para llama.cpp/LM Studio, se puede integrar tanto en un servicio con GPU como en una aplicación de escritorio local.
- Investigación en generación de texto con restricciones duras: sirve como caso de estudio de ajuste fino pequeño (8.000 ejemplos, 2 épocas) combinado con decodificación restringida para satisfacer restricciones formales.
- Creación de variantes por dominio (poesía sobre estaciones, efemérides, encargos personalizados): el prompt de ejemplo pide "8 câu" sobre un tema, y la model card indica que el tema se introducía como título del poema, por lo que el ajuste adicional por tema es viable con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única evaluación publicada mide la corrección de la forma métrica sobre 100 prompts "8 câu" reservados, con una puntuación de reglas compuesta por 0,1 de longitud + 0,3 de tono + 0,6 de rima:

| Metrica | Modelo en crudo | Con muestreador linea a linea (16 muestras por linea) |
|---|---|---|
| Puntuacion media de reglas (0-1) | 0,812 | 0,994 |
| Poemas totalmente validos | ~10 % | 98 % |

Dato adicional de la model card: en crudo, el 38 % de los versos *bát* incumplen la regla de tono en la sílaba 6 y 8. El propio autor advierte de que estas cifras miden forma, no calidad poética: los poemas son *lục bát* correctos, pero el significado a menudo es vago o se desvía del tema.

## Requisitos de hardware

- Peso de los pesos en bf16: 8,7 GB según la model card (9,3 GB de tamaño de repositorio), lo que implica del orden de 10-11 GB de VRAM para inferencia con overhead de activaciones y caché KV a longitudes moderadas.
- VRAM estimada en bf16: ~10-12 GB; en cuantización GGUF de 4 bits, del orden de 3-4 GB de pesos y ~6-8 GB en total, aunque los niveles concretos del repositorio GGUF no se especifican.
- GPU recomendadas para bf16: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 o H100 para servicio concurrente; en GPUs de 16 GB (RTX 4080, A4000) cabe con secuencias cortas o cuantización.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 24 GB y en GGUF cuantizado en tarjetas de 8-12 GB. No se documentan requisitos de CPU ni de memoria del sistema.
- Opciones de despliegue: transformers y vLLM para el modelo de 16 bits (recomendados por el autor); llama.cpp o LM Studio para la versión GGUF. El soporte en Ollama o TGI no está documentado.
- Latencia y throughput: no disponibles. El muestreador línea a línea multiplica por 16 el número de generaciones por verso, por lo que el coste de inferencia del sistema completo es sustancialmente mayor que el de una pasada única.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de otros modelos de poesía vietnamita en la información proporcionada, por lo que la comparación se limita al modelo base y a la propia variante cuantizada. Los campos no documentados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| VietPoet Qwen3.5-4B | ~4,66 mil millones | no disponible | Poesia vietnamita *lục bát* | Apache-2.0 | safetensors (bf16) |
| VietPoet Qwen3.5-4B-GGUF | mismos pesos cuantizados | no disponible | idem, para llama.cpp / LM Studio | Apache-2.0 | GGUF |
| Qwen/Qwen3.5-4B (base) | misma arquitectura, ~4,66 mil millones (heredada) | no disponible | Modelo generalista | Apache-2.0 | safetensors |

Comparativas con alternativas de terceros (por ejemplo otros modelos poéticos vietnamitas o ajustes de tamaños similares): no disponible en la información consultada.

## Limitaciones y advertencias

- El modelo en crudo incumple las reglas *lục bát* con frecuencia: solo ~10 % de poemas totalmente válidos y un 38 % de versos *bát* con error de tono en las sílabas 6 y 8. El autor recomienda explícitamente usarlo junto al muestreador y verificador de ThoLucBat.
- La calidad semántica es baja: el propio autor indica que el significado "a menudo es vago o se sale del tema", porque los prompts de entrenamiento solo aportaban el título del poema como tema. Los poemas pueden ser formalmente correctos y a la vez incoherentes.
- Sesgo de dominio y de idioma: entrenado únicamente con 8.000 poemas filtrados de un corpus vietnamita y declarado solo para vietnamita (vi). No hay evidencia de calidad en otros idiomas ni en tareas fuera de la poesía.
- Riesgo de alucinación y de contenido inventado: al ser un ajuste fino pequeño sobre una base generalista, puede producir referencias culturales o históricas falsas dentro del poema, sin verificación factual.
- Sin validación de la comunidad: el repositorio registra 0 descargas y 0 likes en la información disponible, por lo que no existe retroalimentación externa sobre su comportamiento en producción.
- Licencia: los pesos son Apache-2.0, lo que permite uso comercial, pero el corpus de entrenamiento phamson02/vietnamese-poetry-corpus es CC BY 4.0 y exige atribución; conviene revisar las obligaciones de atribución derivadas de los datos.
- Dependencia de la base: las capacidades, sesgos y limitaciones de Qwen/Qwen3.5-4B se heredan. El tag `image-text-to-text` sugiere una base multimodal sin documentar en esta model card, lo que puede implicar comportamiento inesperado si se alimentan entradas no textuales.
- Ausencia de datos operativos: no se documentan longitud de contexto, latencia, throughput ni soporte de tool calling, lo que dificulta dimensionar un despliegue en producción sin pruebas propias.
- El formato de prompt requiere *thinking* desactivado y un bloque `<think>` vacío; usar otro formato puede degradar los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peterbuitho/VietPoet-Qwen3.5-4B
- Version GGUF: https://huggingface.co/peterbuitho/VietPoet-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del muestreador y verificador de reglas: https://github.com/peterbuitho/ThoLucBat
- Dataset de entrenamiento: https://huggingface.co/datasets/phamson02/vietnamese-poetry-corpus
- Articulo de referencia sobre puntuacion de poesia vietnamita: https://arxiv.org/abs/2401.01078
