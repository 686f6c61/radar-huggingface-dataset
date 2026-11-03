# sh0ck0r/Mero-Artemis-31B-v1-heretic-2

## Resumen

Mero-Artemis-31B-v1-heretic-2 es un modelo de lenguaje de 31.273.086.512 parámetros (aproximadamente 31,3 mil millones) publicado por el usuario sh0ck0r en HuggingFace. Se trata de un merge de dos modelos previos —TheDrummer/Artemis-31B-v1 y zerofata/G4-MeroMero-31B— al que posteriormente se le ha aplicado un proceso de "decensoring" o abliteration mediante la herramienta Heretic v2.0.0. El objetivo declarado es preservar el carácter creativo y conversacional del modelo original de sophosympatheia (Mero-Artemis-31B-v0.3.1) corrigiendo posibles defectos introducidos por el merge en cuantización Q8, ahora reconstruido a partir de los pesos BF16 completos de Artemis-31B-v1h.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y compatibilidad con la librería transformers. La pipeline declarada es image-text-to-text y la arquitectura se etiqueta como "gemma4", lo que sugiere una base derivada de la familia Gemma de Google, aunque la model card no aporta detalles técnicos sobre la arquitectura interna, el volumen de tokens de entrenamiento ni la composición del dataset. El idioma declarado es únicamente inglés.

La relevancia de este modelo reside en su naturaleza de "uncensored/abliterated": el proceso de Heretic elimina los mecanismos de rechazo del modelo original, reduciendo las negativas de 99/100 a 9/100 según la propia model card, con una divergencia KL de 0.1340 respecto al modelo base. Esto lo hace interesante para investigación sobre alineamiento, generación creativa sin restricciones y estudios de seguridad, pero también plantea riesgos evidentes para despliegues en producción orientados al público general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetada como "gemma4" en los tags; detalles internos no disponibles) |
| Parametros totales | 31.273.086.512 (~31,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors; el autor menciona merges previos en Q8) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); tamano del repo 62,6 GB |

## Arquitectura y entrenamiento

La información disponible no permite detallar la arquitectura interna más allá de la etiqueta "gemma4" y la clasificación como transformer. El modelo es el resultado de un merge de dos modelos: TheDrummer/Artemis-31B-v1 (del que se usan los pesos BF16 completos de la variante v1h) y zerofata/G4-MeroMero-31B, empleando la misma configuración YAML que el merge original de sophosympatheia para Mero-Artemis-31B-v0.3.1. La herramienta de merge es mergekit, según los tags del repositorio.

Sobre el entrenamiento no se aportan datos: no se especifica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o similar. La innovación técnica destacable es la aplicación de Heretic v2.0.0 con Arbitrary-Rank Ablation (ARA), configurada con start_layer_index 19, end_layer_index 58, preserve_good_behavior_weight 0.3546, steer_bad_behavior_weight 0.0261, overcorrect_relative_weight 0.9293 y neighbor_count 12. Este proceso de abliteration actúa sobre las capas 19 a 58 para eliminar la dirección de rechazo, reduciendo las negativas de 99/100 a 9/100 con una divergencia KL de 0.1340 respecto al modelo sin ablacionar.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a rol y creatividad (el autor recomienda parámetros de muestreo específicos: temperatura 1.0, min-p 0.05-0.1, DRY 0.8 con base 1.8).
- Procesamiento image-text-to-text según la pipeline declarada, aunque no se detallan las capacidades de visión en la model card.
- Generación sin mecanismos de rechazo (uncensored/abliterated): responde a peticiones que el modelo base rechazaría.
- Razonamiento general y generación de texto libre; no se documentan capacidades específicas de código o matemáticas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteration comparando sus respuestas con las del modelo base, usando las métricas de rechazo (9/100 frente a 99/100) y la divergencia KL (0.1340) como referencia cuantitativa del cambio de comportamiento.
- Generación creativa sin restricciones: escritura de ficción, roleplay y narrativa donde el modelo base tendería a rechazar temáticas adultas o controvertidas; los parámetros de muestreo recomendados (temperatura 1.0, min-p 0.05) están pensados para este uso.
- Evaluación de robustez de filtros: servir como modelo adversario para probar clasificadores de contenido y sistemas de moderación en pipelines de producción.
- Experimentación con merges de modelos: dado que el repositorio documenta la configuración YAML y el proceso Heretic, sirve como caso de estudio reproducible para quienes investigan técnicas de model merging con mergekit.
- Desarrollo de personajes conversacionales: la preservación del "carácter" del modelo original de sophosympatheia lo hace adecuado para asistentes de rol con personalidad definida, siempre en entornos controlados.
- Benchmarking de cuantización: al publicarse pesos BF16 completos, permite comparar el impacto de cuantizaciones Q8 y Q4 frente a la versión de referencia, algo que el propio autor menciona haber hecho en merges previos.

## Benchmarks y rendimiento

La model card solo reporta métricas del proceso de abliteration, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (Refusals) | 9/100 | 99/100 |
| Divergencia KL | 0.1340 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 62,6 GB de pesos, por lo que se requieren del orden de 64-70 GB de VRAM considerando overhead; no cabe en GPUs de consumo individuales en precisión completa.
- En cuantización de 8 bits (Q8): alrededor de 33-35 GB, viable en una A100 40GB o H100; el autor menciona haber realizado merges previos en Q8.
- En cuantización de 4 bits (Q4): alrededor de 17-20 GB, lo que permitiría ejecución en una RTX 4090 de 24 GB, como el propio autor indica que planeaba para la abliteration.
- GPUs recomendadas: A100 80GB o H100 para BF16; A100 40GB para Q8; RTX 4090 (24 GB) para Q4.
- Opciones de despliegue: transformers (librería declarada), con compatibilidad de endpoints según los tags; vLLM, llama.cpp, Ollama o TGI no se mencionan explícitamente en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mero-Artemis-31B-v1-heretic-2 | ~31,3 B | no disponible | Apache 2.0 | Merge + abliteration con Heretic v2.0.0 |
| TheDrummer/Artemis-31B-v1 | ~31 B (no confirmado) | no disponible | no disponible | Modelo base del merge, sin abliteration |
| zerofata/G4-MeroMero-31B | ~31 B (no confirmado) | no disponible | no disponible | Segundo modelo base del merge |
| sh0ck0r/Mero-Artemis-31B-v0.3.1-heretic | ~31 B (no confirmado) | no disponible | no disponible | Versión heretic previa que el autor usa como referencia |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de las métricas de rechazo y divergencia KL reportadas para el modelo actual.

## Limitaciones y advertencias

- Modelo explícitamente "not-for-all-audiences": el proceso de abliteration elimina los rechazos, por lo que puede generar contenido inapropiado, ofensivo o dañino sin filtro.
- Riesgo elevado de alucinación y de respuestas no verificadas, agravado por la falta de benchmarks estándar que permitan evaluar su fiabilidad.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto desconocida, lo que impide planificar despliegues con ventanas largas.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterated conlleva riesgos reputacionales y legales según la jurisdicción y el contexto de aplicación; se recomienda revisar las políticas de contenido aplicables.
- La model card no documenta sesgos conocidos, datos de entrenamiento ni evaluación de seguridad; el merge y la abliteration pueden haber degradado capacidades respecto a los modelos base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sh0ck0r/Mero-Artemis-31B-v1-heretic-2
- Modelo base 1: https://huggingface.co/TheDrummer/Artemis-31B-v1
- Modelo base 2: https://huggingface.co/zerofata/G4-MeroMero-31B
- Versión heretic previa: https://huggingface.co/sh0ck0r/Mero-Artemis-31B-v0.3.1-heretic
- Modelo original de referencia: https://huggingface.co/sophosympatheia/Mero-Artemis-31B-v0.3.1
- Proyecto Heretic: https://heretic-project.org
