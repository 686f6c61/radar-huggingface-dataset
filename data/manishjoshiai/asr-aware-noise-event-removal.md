# manishjoshiai/asr-aware-noise-event-removal

## Resumen

`asr-aware-noise-event-removal` es un conjunto de checkpoints para eliminación de eventos de ruido en habla, desarrollado por el equipo Hydra (autor `manishjoshiai`) para el Track 2 del IndoML Datathon 2026 sobre el corpus Vaani. No es un modelo único, sino un sistema de tres modelos de mejora de habla (MossFormerGAN_SE_16K, BSRNN large-double y TF-Locoformer M) más una red de fusión por celdas, todos ellos ajustados con una función de pérdida consciente del ASR: se utiliza el reconocedor SraVaani-1.0 congelado para penalizar tanto la distancia en el espacio del encoder como la verosimilitud de transcripción TDT.

El sistema aborda un problema específico: eliminar eventos de ruido (golpes, toses, ruidos ambientales) sin degradar la inteligibilidad del habla, de modo que un ASR posterior no empeore. El resultado declarado en la fase 2 es una puntuación combinada de 19,8973, con SI-SDR de 15,7934 dB y un incremento agrupado de WER de +4,1039 pp (+11,66 pp en sintético, +0,54 pp en natural). El repositorio de Hugging Face ocupa 2,9 GB e incluye tanto los checkpoints finales como 19 checkpoints intermedios de cada etapa de entrenamiento.

Es relevante para investigadores que trabajen en speech enhancement orientado a ASR, especialmente en lenguas índicas, y como ejemplo reproducible de una cadena de fine-tuning con múltiples modelos base y fusión aprendida. No es un modelo de propósito general ni un LLM: es un sistema de procesamiento de audio con pesos en formato `.pt` (PyTorch), sin pipeline declarado en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de tres modelos de speech enhancement (MossFormerGAN, BSRNN, TF-Locoformer) mas red de fusion por celdas |
| Parametros totales | Aproximadamente 122,44 M sumando los tres modelos (3,1 M + 104 M + 15 M) mas 0,34 M de la red de fusion |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa grabaciones de 12-18 s en flujo continuo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible en la model card; el corpus Vaani es de lenguas indicas y el ASR SraVaani-1.0 apunta a ese dominio |
| Licencia | CC-BY-4.0 para el checkpoint BSRNN; cada checkpoint hereda la licencia de su modelo base (ver seccion de limitaciones) |
| Formato de pesos | PyTorch (`.pt`, state dict) |

## Arquitectura y entrenamiento

El sistema combina tres arquitecturas de mejora de habla: MossFormerGAN_SE_16K de ClearVoice (3,1 M de parámetros, ajustado desde el checkpoint público `alibabasglab/MossFormerGAN_SE_16K`), BSRNN large-double de ESPnet (104 M, partiendo de `wyz/vctk_dns2020_whamr_bsrnn_large_double_noncausal` entrenado con VCTK+DNS+WHAMR!) y TF-Locoformer M de MERL (15 M, partiendo del checkpoint DNS-2020). Sobre las salidas de los tres se aplica una red de fusión por celdas de 0,34 M de parámetros que combina las estimaciones.

El entrenamiento se realizó con el ASR SraVaani-1.0 congelado como supervisor: se optimiza la distancia en el espacio del encoder y la verosimilitud de transcripción TDT, con un flujo de grabación única larga de 12-18 s. En la fusión y en uno de los tres fine-tunes promediados de TF-Locoformer se emplea un riesgo MWER ponderado por borrados, lo que penaliza especialmente la pérdida de contenido lingüístico. Los datos incluyen la release de validación de los organizadores y habla limpia de `ARTPARK-IISc/Vaani-transcription-part` y `ai4bharat/indicvoices_r`, excluyendo todas las grabaciones de competición. El checkpoint de TF-Locoformer es un promedio de pesos de tres fine-tunes.

## Capacidades

- Eliminación de eventos de ruido en habla (golpes, ruidos ambientales, eventos no estacionarios) preservando la señal de voz.
- Mejora de habla consciente del ASR: el objetivo de entrenamiento está alineado con reducir el WER de un reconocedor posterior, no solo con métricas de señal.
- Procesamiento de grabaciones de 12-18 s en flujo continuo de una sola toma.
- Fusión aprendida de tres estimaciones independientes mediante red por celdas.
- Reproducibilidad completa: scripts de entrenamiento por etapas y 19 checkpoints intermedios.
- No soporta tool calling, agentes, visión, audio generativo ni razonamiento multi-paso; es un componente de preprocesado de audio.
- Capacidades multilingües: no documentadas explícitamente; el dominio de entrenamiento es habla índica (Vaani).

## Casos de uso

- Preprocesado para pipelines de ASR en lenguas índicas: el sistema se coloca antes del reconocedor para eliminar eventos de ruido que provocan borrados o sustituciones, con un incremento de WER medido de solo +0,54 pp en habla natural.
- Limpieza de corpus de habla para entrenamiento: aplicar el modelo a grabaciones de campo (entrevistas, encuestas) antes de transcribir o de usarlas como datos de entrenamiento de ASR.
- Transcripción de reuniones y grabaciones de campo: reducir ruidos de fondo no estacionarios en grabaciones de 12-18 s antes de la transcripción automática.
- Evaluación comparativa de modelos de speech enhancement: los 19 checkpoints intermedios permiten reproducir cada etapa y comparar el efecto de cada técnica (fine-tuning con ASR, MWER, fusión) de forma aislada.
- Investigación en métricas orientadas a ASR: el sistema sirve como referencia para estudiar la relación entre SI-SDR y ΔWER en tareas de eliminación de eventos de ruido.
- Despliegue en entornos con restricciones de cómputo: el modelo más pequeño (MossFormerGAN, 3,1 M) puede ejecutarse en CPU o GPU modesta, mientras que el ensemble completo requiere más recursos.
- Base para fine-tuning en otros idiomas o dominios: al partir de checkpoints públicos (ClearVoice, ESPnet, MERL), es posible reajustar la cadena con otro ASR supervisor para un idioma distinto.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Puntuacion combinada (fase 2) | 19,8973 |
| SI-SDR | 15,7934 dB |
| ΔWER agrupado | +4,1039 pp |
| ΔWER sintetico | +11,66 pp |
| ΔWER natural | +0,54 pp |
| Auditoria ASR de los organizadores | Superada |

No se han publicado en la información disponible resultados comparativos con otros sistemas en MMLU, HumanEval, GSM8K ni benchmarks de propósito general, por no ser aplicables a este tipo de modelo. Tampoco se detallan métricas por modelo individual (MossFormerGAN, BSRNN, TF-Locoformer) ni ablaciones de la fusión.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, el ensemble completo (unos 122 M de parámetros en fp32) ocupa aproximadamente 0,5 GB en pesos, más el estado de activaciones y el ASR supervisor si se usa en inferencia; el modelo mayor (BSRNN, 104 M) domina el coste.
- GPU recomendadas: no especificadas. Por tamaño, una GPU consumer con 8-12 GB de VRAM debería ser suficiente para inferencia del ensemble; el modelo de 3,1 M puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 o superiores; no hay cifras oficiales de latencia.
- Opciones de despliegue: scripts propios del repositorio (`scripts/download_checkpoints.sh` y `scripts/run_inference.sh`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. Los modelos base son de ClearVoice, ESPnet y MERL, por lo que podrían integrarse en esos frameworks.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asr-aware-noise-event-removal (este) | ~122 M (ensemble) | No aplica (12-18 s por clip) | Ensemble con supervision ASR y fusion aprendida | Mixta (CC-BY-4.0 y Apache-2.0 segun checkpoint) | Hugging Face + GitHub |
| MossFormerGAN_SE_16K (ClearVoice) | 3,1 M | No aplica | GAN para mejora de habla | Apache-2.0 | Publico (modelo base) |
| BSRNN large-double (ESPnet) | 104 M | No aplica | Red recurrente con normalizacion por bandas | CC-BY-4.0 | Publico (modelo base) |
| TF-Locoformer M (MERL) | 15 M | No aplica | Transformer con atencion local/global | Apache-2.0 | Publico (modelo base) |

La comparativa con alternativas de la misma categoría (sistemas de eliminación de eventos de ruido conscientes del ASR) no está disponible en la información proporcionada. Los tres modelos base sí son directamente comparables porque forman parte del propio ensemble.

## Limitaciones y advertencias

- Licencia mixta: la etiqueta `cc-by-4.0` de la model card corresponde al checkpoint BSRNN de ESPnet; cada checkpoint liberado sigue la licencia de su modelo base (Apache-2.0 para MossFormerGAN y TF-Locoformer, CC-BY-4.0 para BSRNN). Verificar la licencia aplicable antes de uso comercial.
- Dominio restringido: entrenado sobre el corpus Vaani (habla índica) y la release de validación de los organizadores; el rendimiento fuera de ese dominio no está documentado.
- El ΔWER en habla sintética es notablemente peor (+11,66 pp) que en habla natural (+0,54 pp), lo que sugiere sensibilidad a las características acústicas del material sintético.
- No hay información sobre sesgos, tasas de alucinación (no aplica en el sentido de LLM, pero sí posible introducción de artefactos en la señal) ni evaluación con hablantes fuera del corpus.
- El sistema depende del ASR SraVaani-1.0 durante el entrenamiento; la inferencia publicada no requiere el ASR, pero la reproducibilidad del pipeline sí.
- No se documentan tipos de cuantización ni formatos distintos de PyTorch, lo que limita el despliegue en entornos que requieran GGUF u ONNX.
- Es un sistema de competición: los resultados reportados corresponden a la fase 2 del datathon y no a una validación independiente a gran escala.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manishjoshiai/asr-aware-noise-event-removal
- Repositorio de código y reproducción: https://github.com/mcjoshi/asr-aware-noise-event-removal
- Guía de reproducción: `docs/REPRODUCE.md` en el repositorio de GitHub
- Informe técnico: `docs/technical_report.pdf` en el repositorio de GitHub
- Modelo base MossFormerGAN: https://huggingface.co/alibabasglab/MossFormerGAN_SE_16K
- Modelo base BSRNN (ESPnet): https://huggingface.co/wyz/vctk_dns2020_whamr_bsrnn_large_double_noncausal
- Corpus Vaani (transcripción): https://huggingface.co/datasets/ARTPARK-IISc/Vaani-transcription-part
- Corpus IndicVoices: https://huggingface.co/datasets/ai4bharat/indicvoices_r
- IndoML Datathon 2026, Track 2: no disponible (no se proporciona URL en la información)
