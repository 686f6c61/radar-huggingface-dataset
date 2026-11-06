# MK-runner/CoGaze

## Resumen

CoGaze es un framework de preentrenamiento vision-lenguaje disenado especificamente para la comprension de radiografias de torax. Lo desarrolla un equipo academico (Kang Liu, Zhuoqi Ma, Siyu Liang, Yunan Li, Xiyue Gao, Chao Liang, Kun Xie y Qiguang Miao) y se inspira en como los radiologos interpretan las imagenes medicas: combinando la mirada (gaze) del especialista con el contexto clinico durante la fase de preentrenamiento. El modelo aborda la generacion de informes radiologicos, la clasificacion supervisada y zero-shot, la segmentacion y el retrieval imagen-texto.

La innovacion central es el uso de mapas de calor de gaze durante el preentrenamiento, mientras que las tareas downstream (generacion de informes, clasificacion, segmentacion) no requieren datos de gaze en inferencia. El repositorio ocupa 11,8 GB e incluye checkpoints preentrenados sobre MIMIC-CXR, un modelo de generacion de informes basado en DistilGPT2 y anotaciones auxiliares (mapas de gaze, pares imagen-texto y anotaciones SRRG).

La relevancia actual radica en que propone una via de incorporacion de senal humana (atencion visual experta) en el preentrenamiento multimodal medico, un area donde los modelos genericos vision-lenguaje suelen fallar por falta de dominio y de alineacion con el razonamiento clinico. El modelo se publica con codigo en GitHub y pesos en Hugging Face, aunque la licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (encoder visual + decoder de texto); el modulo de generacion de informes usa DistilGPT2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato .pt, sin GGUF publicado) |
| Idiomas soportados | no disponible (dominio clinico en ingles por MIMIC-CXR) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt): `mimic_pretrain_best_model.pt`, `distilgpt2_mimic_free_text_report_generation_best_model.pt` |

## Arquitectura y entrenamiento

CoGaze es un framework de preentrenamiento vision-lenguaje que combina un encoder visual para radiografias de torax con un modulo de lenguaje. El preentrenamiento se realiza sobre MIMIC-CXR e incorpora mapas de gaze como senal auxiliar de supervision, de modo que el modelo aprende a alinear regiones anatomicas relevantes con el texto del informe. La generacion de informes se implementa con DistilGPT2 como decoder, y el pipeline incluye utilidades para calculo de metricas clinicas (RadGraph, CheXbert, RadCliQ, RATEScore) mediante dependencias como `radgraph` y `chexbert.pth`.

El repositorio incluye scripts de preentrenamiento (`script/pretrain.sh`), generacion de informes libres y estructurados, e inferencia. Las dependencias principales son `transformers==4.43.3`, `torch==2.4.1`, `torchvision==0.19.1` y `pytorch-lighting==2.5.1.post0`. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO. La innovacion tecnica destacable es el uso de gaze como senal de preentrenamiento que no se requiere en inferencia.

## Capacidades

- Generacion de informes radiologicos en texto libre a partir de radiografias de torax.
- Generacion de informes estructurados (anotaciones SRRG).
- Clasificacion supervisada y zero-shot de patologias toracicas.
- Segmentacion de estructuras y hallazgos (por ejemplo, neumotorax en SIIM-ACR).
- Retrieval imagen-texto entre radiografias e informes.
- Razonamiento guiado por contexto clinico durante el preentrenamiento.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- Capacidades multilingues: no disponibles; el dominio es clinico y los datos de entrenamiento son de MIMIC-CXR (ingles).

## Casos de uso

- Generacion automatizada de borradores de informes radiologicos: el modelo produce texto libre a partir de una radiografia de torax, util como primer borrador que el radiologo revisa y edita, reduciendo tiempo de dictado.
- Triaje de estudios con clasificacion zero-shot: permite priorizar radiografias con hallazgos sospechosos sin necesidad de reentrenar para cada patologia, apoyandose en la alineacion imagen-texto aprendida.
- Deteccion de neumotorax en pipelines de urgencias: usando el modelo sobre datasets tipo SIIM-ACR, se puede integrar en un sistema de alerta temprana para estudios criticos.
- Segmentacion de hallazgos para cuantificacion: util en seguimiento de derrames pleurales o consolidaciones, donde la mascara permite medir evolucion entre estudios del mismo paciente.
- Busqueda semantica de estudios por descripcion textual: el retrieval imagen-texto permite localizar radiografias similares a una descripcion clinica, util en docencia y en revision de casos.
- Investigacion en interpretabilidad medica: el uso de mapas de gaze permite analizar que regiones atiende el modelo y compararlas con la atencion de radiologos, apoyando estudios de validacion clinica.
- Preentrenamiento base para tareas downstream: el checkpoint `mimic_pretrain_best_model.pt` puede servir como inicializacion para clasificacion o segmentacion en datasets como NIH Chest X-rays, RSNA Pneumonia o TBX11K.

## Benchmarks y rendimiento

Resultados publicados en la model card para generacion de informes en texto libre con el modelo DistilGPT2 sobre MIMIC-CXR:

| Metrica | Valor |
|---|---|
| BertScore | 0,5956 |
| RadGraph-simple | 0,3069 |
| RadGraph-partial | 0,2808 |
| RadGraph-complete | 0,2260 |
| SemScore | 0,4588 |
| 1/RadCliQ-V1 | 1,0822 |
| RATEScore | 0,5787 |
| CheXbert 5 micro-F1 | 0,5709 |
| CheXbert 5 macro-F1 | 0,4950 |
| CheXbert all micro-F1 | 0,5247 |
| CheXbert all macro-F1 | 0,3884 |
| BLEU-1 | 0,4103 |
| BLEU-2 | 0,2897 |
| BLEU-3 | 0,2201 |
| BLEU-4 | 0,1748 |
| METEOR | 0,1905 |
| ROUGE-L | 0,3258 |
| CIDEr | 0,3963 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos de generacion de informes (por ejemplo, R2Gen, M2TR, MedKLIP) ni cifras de MMLU, HumanEval o GSM8K, que no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el checkpoint preentrenado y el de DistilGPT2 se distribuyen en formato PyTorch completo, lo que sugiere un consumo moderado pero no cuantificado en la informacion.
- GPU recomendadas: no especificadas por el autor; por el tamano del repositorio (11,8 GB) y el uso de DistilGPT2 como decoder, una GPU con 16-24 GB (RTX 4090, A5000, A100) es un punto de partida razonable, aunque no confirmado.
- Cabe en GPU consumer: probablemente si para inferencia del modelo de generacion de informes, dado el uso de DistilGPT2; no confirmado para el checkpoint de preentrenamiento completo.
- Opciones de despliegue: el autor proporciona scripts bash (`script/free-text-report-generation-gpt2-inference.sh`) y dependencias PyTorch/Transformers; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks de modelos comparables (R2Gen, M2TR, MedKLIP, CheXagent u otros sistemas de generacion de informes de torax), por lo que no es posible establecer una comparativa cuantitativa fiable. A modo de encuadre cualitativo:

| Modelo | Dominio | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| CoGaze | Radiografia de torax | Vision-lenguaje con gaze en preentrenamiento | no disponible | Hugging Face + GitHub |
| R2Gen | Radiografia de torax | Transformer encoder-decoder | no disponible en esta ficha | Repositorio academico |
| CheXagent | Radiografia de torax | LLM multimodal clinico | no disponible en esta ficha | Hugging Face |

Los datos de rendimiento de los modelos alternativos no estan disponibles en la informacion consultada; no se inventan cifras.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es un bloqueo potencial para produccion.
- Modelo de dominio muy especifico (radiografia de torax); no es un modelo de proposito general y no debe usarse fuera de ese ambito.
- Riesgo de alucinacion clinica: como generador de texto, puede producir hallazgos no presentes en la imagen; requiere supervision de un profesional sanitario.
- Dependencia de MIMIC-CXR: sesgos demograficos y de adquisicion del dataset pueden trasladarse al modelo.
- Idiomas: no se documenta soporte multilingue; los informes se generan en ingles.
- Longitud de contexto no disponible, lo que impide evaluar su idoneidad para historiales clinicos largos.
- Requiere descarga manual de dependencias (`chexbert.pth`, `radgraph`) desde un repositorio externo, lo que anade friccion de despliegue.
- No se documentan evaluaciones de robustez, calibracion ni seguridad clinica; no apto para uso diagnostico autonomo sin validacion regulatoria.

## Enlaces

- Hugging Face: https://huggingface.co/MK-runner/CoGaze
- Repositorio GitHub: https://github.com/mk-runner/CoGaze
- Paper arXiv: https://arxiv.org/abs/2603.26049
- Checkpoint preentrenado MIMIC-CXR: https://huggingface.co/MK-runner/CoGaze/blob/main/mimic_pretrain_best_model.pt
- Modelo de generacion de informes (DistilGPT2): https://huggingface.co/MK-runner/CoGaze/blob/main/distilgpt2_mimic_free_text_report_generation_best_model.pt
- Anotaciones (gaze, pares imagen-texto, SRRG): https://huggingface.co/MK-runner/CoGaze/tree/main/mimic-annotation
- Informes generados: https://github.com/mk-runner/CoGaze/tree/main/generated_reports
- Dependencias manuales (MLRG): https://github.com/mk-runner/MLRG
- Dataset MIMIC-CXR: https://physionet.org/content/mimic-cxr/2.0.0/
- Dataset NIH Chest X-rays: https://huggingface.co/datasets/alkzar90/NIH-Chest-X-ray-dataset
- Dataset RSNA Pneumonia: https://www.kaggle.com/competitions/rsna-pneumonia-detection-challenge
- Dataset SIIM-ACR: https://www.kaggle.com/datasets/vbookshelf/pneumothorax-chest-xray-images-and-masks
- Dataset TBX11K: https://www.kaggle.com/datasets/vbookshelf/tbx11k-simplified
- Dataset Shenzhen: https://openi.nlm.nih.gov/imgs/collections/ChinaSet_AllFiles.zip
