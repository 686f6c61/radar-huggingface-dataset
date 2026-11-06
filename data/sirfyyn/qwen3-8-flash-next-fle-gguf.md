# sirfyyn/Qwen3.8-Flash-Next-FLE-GGUF

## Resumen

Qwen3.8-Flash-Next-FLE-GGUF es una colección de cuantizaciones GGUF híbridas del modelo Qwen3.8-Flash-Next, publicadas por el usuario sirfyyn. El modelo base es un transformer de tipo mixture-of-experts (MoE) desarrollado por el equipo Qwen, con 176.943.899.520 parámetros totales y una arquitectura de 512 expertos enrutados por capa, de los cuales 10 se activan por token. Estas cuantizaciones están pensadas para ejecutar el modelo en una sola GPU junto con memoria del sistema, mediante el motor FLE (Fast Local Experts), un fork de llama.cpp desarrollado por el mismo autor.

El interés de esta ficha reside en que las cuantizaciones no son métodos nuevos, sino empalmes (splices) de cuantizaciones públicas ya existentes de Unsloth e ISTA-DASLab: se seleccionan capas completas de expertos de distintos ficheros donantes según su sensibilidad medida, a un tamaño de fichero fijo. Se ofrecen tres variantes principales: FLE-IQ3_M (88,87 GB), FLE-IQ3_XXS (79,48 GB) y FLE-IQ2_M (71,62 GB), además de una cabeza MTP (multi-token prediction) de 1,53 GB con expertos recuantizados a IQ4_NL. El autor reporta que la divergencia KL de FLE-IQ3_M frente a BF16 está dentro del ruido de la variante Unsloth UD-IQ4_XS, con 4,81 GB menos de tamaño.

La relevancia actual es práctica: permiten desplegar un MoE de casi 177.000 millones de parámetros en hardware de una sola GPU más RAM del sistema, con velocidades de decodificación reportadas de 91 tok/s con FLE frente a 36 tok/s con llama.cpp upstream en una RTX PRO 4500 de 32 GB con 120 GB de RAM. Los ficheros son GGUF estándar y cargan en llama.cpp upstream, aunque las ventajas de velocidad y la cabeza MTP requieren el motor FLE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), 512 expertos enrutados por capa, 10 activos por token; incluye cabeza MTP (multi-token prediction) |
| Parametros totales | 176.943.899.520 (176,94 B); variante REAP448: 161,84 B |
| Parametros activos | 10 expertos de 512 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_M, IQ3_XXS, IQ2_M (expertos enrutados); IQ4_NL (expertos de la cabeza MTP); mezclas híbridas de varios tipos de tensor por fichero |
| Idiomas soportados | en |
| Licencia | qwen-community-1.0 (etiquetada como "other" en la model card) |
| Formato de pesos | GGUF (safetensors para el modelo base) |

| Variante | Tamano | Notas |
|---|---|---|
| FLE-IQ3_M | 88,87 GB | KLD frente a BF16 dentro del ruido de Unsloth UD-IQ4_XS, con 4,81 GB menos |
| FLE-IQ3_XXS | 79,48 GB | KLD igual a Unsloth UD-IQ3_XXS (82,0 GB), con 2,5 GB menos |
| FLE-IQ2_M | 71,62 GB | KLD claramente por debajo de Unsloth UD-IQ1_M (74,5 GB) |
| FLE-IQ3_M-REAP448 | 82,00 GB | FLE-IQ3_M con 64 de 512 expertos por capa podados por saliencia REAP; repo aparte |
| Cabeza MTP | 1,53 GB | Modulo MTP propio del modelo, expertos recuantizados a IQ4_NL, sin reentrenar |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con 512 expertos enrutados por capa y 10 activos por token, lo que sitúa el cómputo efectivo muy por debajo del total de 176,94 B de parámetros. La model card no detalla el número de capas, la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base y no están disponibles en la información proporcionada. El modelo incluye un módulo de predicción multi-token (MTP) que se usa para decodificación especulativa.

La innovación técnica de esta publicación no está en el entrenamiento, sino en la construcción de las cuantizaciones. Los ficheros FLE son empalmes de cuantizaciones públicas existentes: se toman capas completas de expertos de ficheros donantes de Unsloth e ISTA-DASLab, elegidas capa por capa según su sensibilidad medida a un tamaño de fichero fijo. Los nombres siguen el ancho de bits de los expertos (IQ3_M, IQ3_XXS, IQ2_M), pero no son ftypes estándar de llama.cpp: cada fichero mezcla varios tipos de tensor. La cabeza MTP se incluye con sus expertos recuantizados a IQ4_NL; el autor intentó reentrenarla y no dio ganancias en prompts no vistos, por lo que se distribuye sin reentrenar. También se publica una variante podada con REAP (64 de 512 expertos por capa eliminados por saliencia).

## Capacidades

- Generación de texto conversacional en inglés, con pipeline de text-generation.
- Razonamiento y generación de código heredados del modelo base Qwen3.8-Flash-Next (no se detallan capacidades específicas en la model card).
- Decodificación especulativa mediante la cabeza MTP incluida, que acelera la generación con el motor FLE.
- Ejecución local en una GPU más RAM del sistema gracias a la arquitectura MoE y al motor FLE.
- Carga en llama.cpp upstream como GGUF estándar (sin las ventajas de velocidad de FLE).
- Soporte de servidor compatible con la API de OpenAI a través de FLE Link en `http://127.0.0.1:8080/v1`.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés.

## Casos de uso

- Despliegue local de un MoE de gran tamaño en una sola estación de trabajo: con FLE-IQ2_M (71,62 GB) o FLE-IQ3_XXS (79,48 GB) el modelo cabe en una GPU de 32 GB más RAM del sistema, lo que permite experimentar con un modelo de 176,94 B de parámetros sin infraestructura de clúster.
- Servicio de inferencia compatible con OpenAI: FLE Link levanta un endpoint en `http://127.0.0.1:8080/v1`, de modo que aplicaciones existentes que usan el formato de la API de OpenAI pueden apuntar a este servidor local sin cambios de código.
- Evaluación de calidad de cuantizaciones: las tres variantes permiten comparar el impacto de distintos anchos de bits en los expertos (IQ2_M, IQ3_XXS, IQ3_M) midiendo la divergencia KL frente a BF16, útil para equipos que investigan cuantización de MoE.
- Generación de texto asistida por decodificación especulativa: la cabeza MTP de 1,53 GB acelera la decodificación con FLE, adecuada para aplicaciones interactivas donde la latencia de generación importa.
- Pruebas de despliegue con modelos podados: la variante FLE-IQ3_M-REAP448 (82,00 GB, 161,84 B parámetros) permite evaluar el compromiso entre poda de expertos y calidad en un entorno de producción simulado.
- Investigación en eficiencia de inferencia: el proyecto FLE y su base de 6.130 mediciones sirven como referencia para estudiar cachés de expertos, decodificación especulativa y partición GPU/RAM en modelos MoE.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros). Sí reporta métricas de calidad de cuantización (divergencia KL frente a BF16) y de velocidad de decodificación:

| Metrica | Resultado |
|---|---|
| KLD FLE-IQ3_M vs BF16 | dentro del ruido de Unsloth UD-IQ4_XS, con 4,81 GB menos de tamaño |
| KLD FLE-IQ3_XXS vs BF16 | igual a Unsloth UD-IQ3_XXS (82,0 GB), con 2,5 GB menos |
| KLD FLE-IQ2_M vs BF16 | claramente por debajo de Unsloth UD-IQ1_M (74,5 GB) |
| Decodificacion FLE | 91 tok/s |
| Decodificacion Strata | 74 tok/s |
| Decodificacion llama.cpp upstream | 36 tok/s |

Las velocidades se midieron en una RTX PRO 4500 de 32 GB con 120 GB de RAM del sistema (6 de octubre de 2026). No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: los ficheros ocupan entre 71,62 GB (FLE-IQ2_M) y 88,87 GB (FLE-IQ3_M); el motor FLE está diseñado para repartir el modelo entre una GPU y la RAM del sistema, por lo que no es necesario que el fichero completo quepa en VRAM.
- Configuración medida por el autor: una RTX PRO 4500 de 32 GB más 120 GB de RAM del sistema, con la que se alcanzan 91 tok/s con FLE.
- GPU recomendadas: no se especifican más allá de la RTX PRO 4500 usada en las mediciones; no hay datos para A100, H100 o RTX 4090.
- ¿Cabe en GPU de consumo? No en una sola GPU de consumo con el modelo completo; requiere el esquema GPU más RAM del sistema o varias GPU. No se detalla el comportamiento en RTX 4090 u otras consumer.
- Opciones de despliegue: motor FLE (fork de llama.cpp, requerido para las velocidades reportadas y para la cabeza MTP), llama.cpp upstream (carga los GGUF estándar, sin las ventajas de velocidad), FLE Link (`flelink run fle-iq3-m` instala el motor, descarga el modelo, comprueba que cabe y sirve la API), FLE Studio (app de chat local).
- Latencia y throughput: 91 tok/s de decodificación con FLE, 74 tok/s con Strata y 36 tok/s con llama.cpp upstream en la configuración indicada. No hay datos de latencia de prefill ni de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FLE-GGUF (FLE-IQ3_M) | 176,94 B totales, 10/512 expertos activos | no disponible | qwen-community-1.0 | GGUF en Hugging Face | 88,87 GB; KLD dentro del ruido de UD-IQ4_XS |
| Unsloth UD-IQ4_XS (Qwen3.8-Flash-Next) | 176,94 B totales | no disponible | qwen-community-1.0 | GGUF en Hugging Face | referencia de calidad; 4,81 GB más grande que FLE-IQ3_M |
| Unsloth UD-IQ3_XXS (Qwen3.8-Flash-Next) | 176,94 B totales | no disponible | qwen-community-1.0 | GGUF en Hugging Face | 82,0 GB; KLD igual a FLE-IQ3_XXS con 2,5 GB más |
| Unsloth UD-IQ1_M (Qwen3.8-Flash-Next) | 176,94 B totales | no disponible | qwen-community-1.0 | GGUF en Hugging Face | 74,5 GB; KLD superior a FLE-IQ2_M |

No se dispone de datos de benchmarks de tareas para comparar con modelos de otras familias; la comparación se limita a las cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües en la información proporcionada.
- Las cuantizaciones IQ2_M e IQ3_XXS degradan la calidad frente a BF16 (divergencia KL medible); para producción sensible conviene evaluar FLE-IQ3_M o los originales de mayor precisión.
- Las mediciones de velocidad y KLD provienen de una única configuración de hardware y de una base de mediciones del autor (6.130 mediciones, estado a 8 de octubre de 2026); pueden no reproducirse en otros equipos.
- La cabeza MTP se distribuye sin reentrenar; el reentrenamiento no generalizó a prompts no vistos, por lo que la aceleración especulativa puede variar según la tarea.
- Las ventajas de velocidad requieren el motor FLE, un fork de llama.cpp mantenido por el autor; en llama.cpp upstream los ficheros cargan pero sin esas ganancias.
- La licencia qwen-community-1.0 impone condiciones para uso comercial; es necesario revisar el fichero LICENSE del modelo base antes de desplegar en producción.
- Riesgo de alucinación y sesgos del modelo base: no se documentan en la model card; deben asumirse los del modelo Qwen3.8-Flash-Next.
- El repositorio ocupa 501,0 GB, lo que exige espacio de almacenamiento considerable aunque solo se descargue una variante.
- No se detalla la longitud de contexto soportada, dato crítico para planificar despliegues con conversaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sirfyyn/Qwen3.8-Flash-Next-FLE-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante podada REAP448: https://huggingface.co/sirfyyn/Qwen3.8-Flash-Next-FLE-REAP448-GGUF
- Repositorio del motor FLE: https://github.com/sirfyyn/FastLocalExperts
- Informe técnico (HTML): https://sirfyyn.github.io/FastLocalExperts/
- Informe técnico (PDF): https://sirfyyn.github.io/FastLocalExperts/fle-paper.pdf
- FLE Link: https://flelink.run
- FLE Studio: https://github.com/sirfyyn/fle-studio
- Sitio web del proyecto: https://sirfyyn.de/en/fle/
- Canal de YouTube: https://www.youtube.com/@sirfyyn
- Lista de reproducción "Making Rhea fast": https://www.youtube.com/playlist?list=PLMYhpsBSEhIQ
- Unsloth: https://unsloth.ai
- ISTA-DASLab: https://huggingface.co/ISTA-DASLab
