# BeholderSec/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una cuantización GGUF publicada por BeholderSec sobre el fine-tune de DavidAU denominado Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, a su vez derivado de la familia Qwen 3.8. Se trata de un modelo de aproximadamente 26.900 millones de parámetros (26.895.998.464 según safetensors), orientado a generación de texto, razonamiento con modo *thinking* y escritura creativa sin restricciones de contenido (etiquetas *heretic*, *uncensored*, *abliterated*). El repositorio incluye cuantizaciones tanto regulares como variantes MTP con doble imatrix, y el autor declara mejoras en siete benchmarks críticos frente al Qwen 3.8 27B base.

El modelo se presenta como un fine-tune multi-etapa y multi-merge construido con Unsloth sobre hardware de consumo, con el objetivo explícito de reducir el consumo de tokens de razonamiento entre la mitad y una décima parte manteniendo la calidad de salida. Es relevante para quienes necesitan un modelo de ~27B ejecutable en local con capacidades de razonamiento, código y escritura creativa, y que además acepte entradas de imagen según el *pipeline tag* `image-text-to-text` declarado en el repositorio.

La ficha se basa únicamente en los metadatos y la model card disponibles; los datos de benchmarks son los que el autor declara, sin verificación independiente en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen 3.8; detalles internos no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en varias cuantizaciones (4-bit y 8-bit citadas; variantes "regular" y "MTP" con doble imatrix); lista completa no disponible |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 389 GB con múltiples quants); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su origen en la familia Qwen 3.8 y del pipeline `image-text-to-text`, que sugiere capacidad multimodal de entrada (imagen y texto). El modelo es un fine-tune multi-etapa y multi-merge sobre DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, entrenado con Unsloth y con los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. El autor menciona métodos propietarios de entrenamiento denominados "COLD FUSION" y "FABLE FUSION 711", sin especificar número de tokens, composición exacta del dataset ni si hubo RLHF o DPO.

La innovación declarada principal es la reducción del bloque de razonamiento (*thinking*) entre 1/2 y 1/10 respecto a Qwen 3.8 27B (mediana aproximada de 2/3 de reducción), manteniendo el detalle de salida. El modelo se distribuye con cuantizaciones "MTP" (multi-token prediction, según la nomenclatura del autor) con doble imatrix, además de cuantizaciones GGUF regulares. No se dispone de información sobre atención lineal, decodificación especulativa u otras optimizaciones de inferencia más allá de lo citado.

## Capacidades

- Generación de texto conversacional multi-turno en 16 idiomas declarados.
- Modo *thinking* / razonamiento explícito, con reducción declarada del consumo de tokens de razonamiento.
- Generación de código y tareas de programación (etiqueta *coder* en el repositorio).
- Escritura creativa, ficción, narrativa de todos los géneros y *roleplaying*.
- Entrada de imagen y texto según el *pipeline tag* `image-text-to-text` (nivel de soporte no detallado).
- Modelo "uncensored"/"abliterated": sin los filtros de rechazo habituales del modelo base.
- Soporte de *tool calling* mencionado de forma indirecta en la model card (referencia a benchmarks de terceros en la pestaña *community*), sin especificación técnica.
- Compatibilidad con *endpoints* (etiqueta `endpoints_compatible`) para despliegue gestionado.

## Casos de uso

- Escritura creativa y ficción: el modelo está afinado específicamente para narrativa, diálogo y *roleplaying*, con ejemplos en la model card de generación de relatos con gancho narrativo; adecuado para autores que necesitan borradores extensos sin filtros de contenido.
- Asistencia a guionistas y novelistas: generación de escenas, personajes y tramas en múltiples géneros, con menor consumo de tokens de razonamiento que el base y por tanto menor latencia por respuesta.
- Razonamiento en local con hardware de consumo: al estar cuantizado en GGUF 4-bit y 8-bit, permite ejecutar un modelo de ~27B en GPU de gama alta de consumo, útil para prototipado de agentes sin depender de API.
- Generación de código en entornos privados: la etiqueta *coder* y la licencia Apache 2.0 permiten integrarlo en pipelines internos de autocompletado o revisión de código sin exponer datos a terceros.
- Investigación sobre alineación y censura: al ser un modelo *abliterated*, sirve para estudiar el comportamiento de modelos sin filtros de rechazo y comparar con el base en tareas sensibles.
- Procesamiento multimodal de documentos: el pipeline `image-text-to-text` permite experimentar con descripción de imágenes o extracción de información de capturas, aunque el soporte real no está documentado en detalle.
- Despliegue en español y otros 15 idiomas: útil para aplicaciones multilingües de generación de contenido donde se requiera cobertura de árabe, chino, hindi, tailandés o vietnamita además de lenguas europeas.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model card, sin verificación independiente:

| Benchmark | Resultado declarado | Contexto |
|---|---|---|
| ARC-C (8-bit) | 735 | Primer fine-tune de este tamaño en superar 730 según el autor; +144 puntos frente a Qwen 3.8 27B |
| ARC-C (4-bit) | 719 | Supera 718 en 4-bit según el autor |
| ARC-E | >880 | Zona declarada de "inteligencia" de OpenAI, Claude y Gemini |
| Conjunto de 7 benchmarks críticos | Superior al base Qwen 3.8 27B en los 7 | También superior a Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B según el autor |

No se han publicado en la información disponible resultados detallados de MMLU, HumanEval, GSM8K ni de los otros benchmarks del conjunto de siete. La model card remite a la pestaña *community* para benchmarks de terceros, incluido un supuesto rendimiento récord en *tool calling*, pero esos datos no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: un modelo de ~27B en GGUF 4-bit requiere aproximadamente 14-16 GB de VRAM; en 8-bit, en torno a 27-30 GB; en bfloat16 completo, más de 54 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados en el repositorio.
- GPU recomendadas: para 4-bit, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes; para 8-bit, A100 40 GB, H100 o RTX 6000 Ada.
- Cabe en GPU de consumo: sí, en cuantización 4-bit en tarjetas con 16 GB o más (RTX 4080, 4090, 3090, 4060 Ti 16 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio incluye quants con doble imatrix y variantes MTP. No se documenta soporte explícito de vLLM o TGI para estos ficheros.
- Latencia y throughput: no disponibles. El autor afirma que el modelo es más rápido que el base gracias a la reducción de tokens de razonamiento, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| BeholderSec/Qwen3.8-27B-Uncensored-GGUF | ~26,9B | no disponible | Apache 2.0 | Fine-tune *uncensored* con GGUF 4/8-bit; benchmarks solo declarados por el autor |
| Qwen 3.8 27B (base) | ~27B | no disponible | no disponible en la información | Referencia del autor; el fine-tune declara superarlo en 7 benchmarks |
| Qwen3.6-35B-A3B | 35B totales (MoE, activos no disponibles) | no disponible | no disponible en la información | El autor declara que el fine-tune lo supera en los 7 benchmarks |
| Qwen 3.6 27B / Qwen 3.5 27B | ~27B | no disponible | no disponible en la información | El autor declara que el fine-tune los supera en los 7 benchmarks |

No se dispone de datos independientes de contexto, rendimiento verificado ni disponibilidad de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Modelo *uncensored* y *abliterated*: no aplica filtros de rechazo, por lo que puede generar contenido ofensivo, ilegal o dañino; requiere moderación externa en producción.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar hechos, citas o código; los benchmarks declarados por el autor no han sido verificados de forma independiente.
- Los resultados de ARC-C y ARC-E son afirmaciones del autor sin reproducibilidad documentada en la información disponible; trátalos con cautela.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets intermedios pueden arrastrar condiciones adicionales no detalladas; conviene revisar la cadena completa de modelos base.
- El repositorio ocupa 389 GB por la multiplicidad de cuantizaciones; la descarga completa no es necesaria, pero exige seleccionar el fichero GGUF adecuado.
- El modelo está etiquetado como `image-text-to-text`, pero no se documenta el nivel real de soporte multimodal ni la resolución de imagen admitida.
- Sin descargas ni *likes* en el momento de la consulta: ecosistema y validación comunitaria inexistentes.
- El modelo base es un fine-tune de un fine-tune, lo que acumula posibles sesgos y degradaciones no documentadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BeholderSec/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Colecciones de DavidAU: https://huggingface.co/DavidAU/collections
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Pestaña community del repositorio (benchmarks de terceros): https://huggingface.co/BeholderSec/Qwen3.8-27B-Uncensored-GGUF/discussions
- Unsloth (framework de entrenamiento citado): https://github.com/unslothai/unsloth
