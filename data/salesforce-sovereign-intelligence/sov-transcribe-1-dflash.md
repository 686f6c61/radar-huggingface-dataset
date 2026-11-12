# salesforce-sovereign-intelligence/SOV-Transcribe-1-DFlash

## Resumen

SOV-Transcribe-1-DFlash es un modelo borrador (draft model) de decodificación especulativa diseñado para acelerar la inferencia de SOV-Transcribe-1, el modelo principal de transcripción de voz (ASR) de Salesforce Sovereign Intelligence. No es un modelo autónomo: no puede transcribir audio por sí mismo, sino que propone varios tokens a la vez para que el modelo principal los verifique, reduciendo el coste computacional de la generación sin alterar la precisión más allá de la variación entre ejecuciones.

El modelo emplea una arquitectura DFlash de 5 capas, condicionada por las activaciones de las capas 1, 6, 11, 17, 22 y 27 del modelo principal, y cuenta con 430 millones de parámetros en precisión BF16. Propone secuencias de hasta 15 tokens por paso de verificación, lo que se traduce en una aceleración de aproximadamente 2 a 3 veces cuando se procesa una petición cada vez.

Su relevancia es práctica: la transcripción de audio con modelos generativos de gran tamaño tiene un coste de decodificación elevado, y técnicas de decodificación especulativa como esta permiten desplegar ASR de alta calidad con menor latencia y mayor throughput en infraestructura existente. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DFlash drafter de 5 capas, condicionado por las capas 1, 6, 11, 17, 22 y 27 del modelo principal |
| Parámetros totales | 429.689.088 (430M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (única precisión indicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Longitud de borrador | 15 tokens |
| Modelo base | salesforce-sovereign-intelligence/SOV-Transcribe-1 |
| Tamaño del repo | 0,9 GB |

## Arquitectura y entrenamiento

El modelo es un drafter DFlash de 5 capas que se condiciona sobre las activaciones intermedias del modelo principal SOV-Transcribe-1, concretamente las capas 1, 6, 11, 17, 22 y 27. Esta condición sobre múltiples profundidades permite al borrador anticipar la distribución de tokens del modelo grande con mayor fidelidad que un drafter independiente. El resultado es un modelo de 430M de parámetros en BF16 que propone 15 tokens por paso, los cuales el modelo principal verifica en paralelo.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo se distribuye con código personalizado (`custom_code`), lo que exige `trust_remote_code=True` en Transformers y el plugin de vLLM descrito en la model card del modelo principal. La innovación principal es la propia decodificación especulativa DFlash aplicada a un pipeline de ASR generativo.

## Capacidades

- Aceleración de la decodificación de SOV-Transcribe-1 mediante propuesta especulativa de hasta 15 tokens por paso.
- Verificación paralela de tokens por parte del modelo principal, manteniendo la precisión dentro de la variación entre ejecuciones.
- Integración con vLLM mediante configuración de decodificación especulativa (`--speculative-config`).
- Integración con Transformers como modelo asistente (`assistant_model`) en `model.generate`.
- No realiza transcripción de audio de forma autónoma.
- No soporta tool calling, agentes ni razonamiento multi-paso por sí mismo; hereda las capacidades del modelo principal únicamente a través de la verificación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de ASR de alta concurrencia: añadir el drafter a una instancia vLLM de SOV-Transcribe-1 permite procesar más peticiones por GPU al reducir el número de pasos de decodificación, adecuado para servicios de transcripción con muchas solicitudes simultáneas.
- Transcripción por lotes de archivos largos: en pipelines offline de subtitulado o indexación de audio, la aceleración de 2 a 3 veces por petición reduce el tiempo total de procesamiento de horas de audio.
- Asistentes de voz en tiempo casi real: para clips de duración moderada, la decodificación especulativa disminuye la latencia de respuesta, lo que mejora la experiencia en aplicaciones de dictado o atención al cliente por voz.
- Integración en plataformas con GPU de 96 GB: la configuración recomendada con `--max-num-seqs 64` mantiene el perfilado de memoria de arranque de vLLM dentro de una GPU de 96 GB, lo que facilita el despliegue en nodos H100 o A100 de 80/96 GB.
- Evaluación comparativa de pipelines ASR: permite medir el impacto de la decodificación especulativa sobre la precisión y la latencia del modelo principal sin modificar el resto del sistema.
- Reducción de costes de inferencia en producción: al disminuir el número de pasos de decodificación, se reduce el coste por hora de audio transcrito en infraestructura cloud con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una aceleración aproximada de 2 a 3 veces para una petición cada vez, menor para clips de menos de 10 segundos y para audio largo. No se proporcionan cifras de WER, latencia absoluta ni throughput.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 0,9 GB en BF16 (430M de parámetros), adicional a la memoria del modelo principal.
- GPU recomendadas: H100 (96 GB) o A100 de 80 GB para el despliegue conjunto con SOV-Transcribe-1; la model card menciona explícitamente el ajuste `--max-num-seqs 64` para mantener el perfilado de memoria de vLLM dentro de una GPU de 96 GB.
- GPU de consumo: no disponible; la información no confirma que el conjunto quepa en GPU consumer.
- Opciones de despliegue: vLLM con plugin y configuración de decodificación especulativa DFlash; Transformers con `assistant_model` y `trust_remote_code=True`.
- Latencia y throughput: aceleración de 2 a 3 veces para una petición cada vez; menor para clips de menos de 10 segundos y para audio largo. Sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Función | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SOV-Transcribe-1-DFlash | 430M | Drafter especulativo para ASR | no disponible | Apache 2.0 | Hugging Face |
| SOV-Transcribe-1 | no disponible | Modelo ASR principal | no disponible | no disponible en la información | Hugging Face |
| Otros drafters especulativos para ASR | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos borradores comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Funciona exclusivamente con SOV-Transcribe-1; no es reutilizable con otros modelos.
- No puede transcribir audio por sí solo: requiere el modelo principal para verificar y generar la salida final.
- La aceleración depende de la carga de trabajo: aproximadamente 2 a 3 veces con una petición cada vez, y menor para clips de menos de 10 segundos y para audio largo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio.
- La integración con vLLM depende de un plugin externo hasta que exista soporte nativo.
- No se dispone de información sobre sesgos, riesgo de alucinación, cobertura de idiomas ni comportamiento en dominios acústicos difíciles; estos aspectos deben evaluarse sobre el modelo principal.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1-DFlash
- Modelo principal: https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1
- Repositorio vLLM: https://github.com/vllm-project/vllm
