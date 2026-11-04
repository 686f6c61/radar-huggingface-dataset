# Alibaba-DAMO-Academy/HoloCT-4B

## Resumen

HoloCT-4B es un modelo fundacional 3D para imagen médica desarrollado por Alibaba DAMO Academy, disenado especificamente para interpretacion y segmentacion de tomografias computarizadas (TC). A partir de un volumen CT en formato NIfTI y un prompt de texto en ingles, el modelo es capaz de realizar cribado de lesiones, responder preguntas visuales (VQA), generar informes radiologicos y producir mascaras de segmentacion 3D vinculadas a los hallazgos textuales (grounding). Es el modelo compacto de la familia HoloCT, que tambien incluye una variante de 8B.

La arquitectura combina un backbone de lenguaje Qwen3-VL-4B con un codificador global derivado de Med3DVLM y un codificador detallado derivado de VISTA3D, mas un decodificador de mascaras 3D. Esta configuracion de doble escala permite conectar la comprension de todo el volumen con informacion espacial de grano fino, algo poco habitual en modelos de vision-lenguaje medicos, que suelen operar con cortes 2D o secuencias de cortes sin representacion volumetrica completa.

El modelo es relevante porque unifica en una sola red tareas que tradicionalmente requieren pipelines separados (deteccion, segmentacion, generacion de informes) y porque su licencia MIT facilita la experimentacion y el uso comercial. Con 4.677.844.560 parametros y pesos en safetensors de 9,4 GB, esta pensado para inferencia en bfloat16 sobre una unica GPU NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal 3D (backbone Qwen3-VL-4B + codificador global Med3DVLM + codificador detallado VISTA3D + decodificador de mascaras 3D) |
| Parametros totales | 4.677.844.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia oficial en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

HoloCT-4B es un modelo multimodal de tipo image-text-to-text adaptado al dominio volumetrico. La entrada es un volumen CT en unidades Hounsfield almacenado en NIfTI, procesado por dos codificadores complementarios: un codificador global inspirado en Med3DVLM que captura el contexto de todo el volumen, y un codificador detallado inspirado en VISTA3D que preserva informacion espacial fina. Las representaciones resultantes se inyectan en el backbone de lenguaje Qwen3-VL-4B, que genera la respuesta textual. Para las peticiones con grounding, un decodificador de mascaras 3D produce mascaras binarias por cada token `<SEG>` generado, enlazando cada hallazgo textual con su region voxelica correspondiente.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La evaluacion menciona conjuntos de referencia como RadGenome y ReXGrounding, lo que sugiere que el entrenamiento y la evaluacion se apoyan en datasets publicos de radiologia con anotaciones de hallazgos y segmentaciones. La inferencia oficial se realiza en bfloat16 mediante la implementacion del repositorio HoloCT, con decodificacion greedy para cribado, VQA y segmentacion, y muestreo con temperatura 0,15, top-p 0,85 y penalizacion de repeticion 1,15 para generacion de informes. Las mascaras se umbralizan a 0,5 tras la transformacion inversa.

## Capacidades

- Cribado de lesiones en volumenes CT completos a partir de prompts en lenguaje natural.
- Visual question answering (VQA) sobre imagenes CT 3D.
- Generacion de informes radiologicos (estilo RadGenome) y respuestas con grounding (estilo ReXGrounding).
- Generacion de texto con grounding: cada hallazgo puede acompanarse de una mascara 3D binaria.
- Segmentacion guiada por lenguaje: segmenta organos o hallazgos descritos en texto libre.
- Segmentacion referida a nivel de hallazgo (finding-level referring segmentation).
- Inferencia emparejada: comparacion de respuestas con y sin grounding sobre el mismo volumen.
- Procesamiento de volumenes CT en unidades Hounsfield en formato NIfTI.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Modo thinking, vision 2D general, audio: no disponible.

## Casos de uso

- Cribado automatizado de lesiones hepaticas: el modelo recibe un CT abdominal y un prompt como "Is there a liver lesion?" y devuelve una decision de cribado junto con la localizacion volumetrica de la lesion, lo que permite priorizar estudios en un flujo de triaje radiologico.
- Generacion de informes radiologicos: a partir del volumen CT, el modelo produce texto descriptivo de hallazgos en ingles, util como borrador que el radiologo revisa y edita, reduciendo el tiempo de dictado en estudios de rutina.
- Segmentacion de organos guiada por texto: prompts como "Segment the liver in this CT scan" generan mascaras 3D listas para tareas de volumetria, planificacion quirurgica o radioterapia, sin necesidad de entrenar un modelo de segmentacion especifico por organo.
- Segmentacion referida a hallazgos: el modelo localiza y delimita una lesion descrita en lenguaje natural, lo que facilita la medicion de volumen tumoral y el seguimiento longitudinal de lesiones entre estudios.
- Control de calidad y verificacion de grounding: la inferencia emparejada permite comparar la respuesta sin grounding con la respuesta con mascara asociada, ayudando a detectar incoherencias entre el texto generado y la evidencia volumetrica antes de publicar un informe.
- Investigacion en vision-lenguaje medico 3D: al ser un modelo fundacional con licencia MIT, sirve como base para fine-tuning en tareas downstream (deteccion de nodulos pulmonares, hemorragias, fracturas) y para experimentos de alineacion texto-volumen.
- Docencia y formacion radiologica: el modelo puede generar descripciones y mascaras sobre casos de ejemplo, utiles como material didactico interactivo con anotaciones espaciales automaticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia ejemplos de metricas de evaluacion de una sola muestra en el repositorio (Dice, HD95, decisiones de cribado, solapamiento de texto, puntuaciones de texto clinico y calidad de informes con grounding), sin cifras agregadas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9,4 GB solo para pesos, mas memoria para activaciones y el volumen CT de entrada; se recomienda al menos 16-24 GB de VRAM para operar con margen.
- GPU recomendadas: NVIDIA A100, H100 o L40S para produccion; RTX 4090 (24 GB) como opcion de gama alta consumer.
- Cabe en GPU consumer: si, en RTX 4090 y previsiblemente en RTX 3090 (24 GB); en GPUs de 16 GB el margen es ajustado y no esta confirmado.
- Requisitos de software: Ubuntu 22.04, Python 3.10.16, PyTorch 2.6.0 con CUDA 12.4, GPU con soporte de bfloat16.
- Opciones de despliegue: la implementacion oficial del repositorio HoloCT (clases de modelo y procesador CT propios, con PyTorch SDPA). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HoloCT-4B | 4,68 B | Volumen CT 3D (NIfTI) + texto | Cribado, VQA, informes, segmentacion con grounding | MIT | HuggingFace (Alibaba-DAMO-Academy) |
| HoloCT-8B | no disponible | Volumen CT 3D (NIfTI) + texto | Mismas tareas que HoloCT-4B | MIT (segun familia) | HuggingFace (referenciado en la model card) |
| Med3DVLM | no disponible | Volumen CT 3D | Vision-lenguaje medico 3D | no disponible | Codigo en GitHub (mirthAI/Med3DVLM) |
| VISTA3D | no disponible | Volumen CT 3D | Segmentacion 3D interactiva y automatica | no disponible | Codigo en GitHub (Project-MONAI/VISTA) |

La comparacion se limita a los componentes citados por el propio autor. Med3DVLM y VISTA3D no son alternativas equivalentes, sino codificadores que HoloCT integra; se incluyen como referencia de las tecnicas subyacentes. No se dispone de datos de rendimiento comparativo entre HoloCT-4B y HoloCT-8B.

## Limitaciones y advertencias

- Dominio restringido a CT: no esta disenado para rayos X, resonancia magnetica, PET ni imagen 2D general.
- Solo ingles: los prompts y las salidas deben formularse en ingles; no hay soporte multilingue documentado.
- Riesgo de alucinacion: como modelo generativo, puede producir hallazgos o descripciones no respaldados por el volumen; el grounding con mascaras mitiga pero no elimina este riesgo.
- Uso clinico: no se documenta validacion regulatoria ni certificacion como dispositivo medico; no debe usarse para decision clinica sin supervision de un profesional cualificado.
- Sesgos: no se documenta la composicion demografica ni la procedencia de los datos de entrenamiento, por lo que se desconoce el sesgo potencial por poblacion, equipo o protocolo de adquisicion.
- Dependencia de formato: requiere volumenes CT en NIfTI en unidades Hounsfield; otros formatos (DICOM directo) requieren conversion previa.
- Longitud de contexto: no disponible, lo que impide estimar el limite practico de volumen o de historial conversacional.
- Restricciones de licencia: los pesos se publican bajo MIT, lo que permite uso comercial; deben revisarse las atribuciones de terceros (Qwen3-VL, Med3DVLM, MONAI VISTA) en el aviso de terceros del repositorio.
- Madurez: el modelo tiene muy pocas descargas y likes en HuggingFace, por lo que la comunidad y el soporte son limitados; conviene validar su comportamiento en el dominio concreto antes de produccion.
- Implementacion: no hay integracion documentada con servidores de inferencia estandar (vLLM, TGI), lo que complica el despliegue escalado.

## Enlaces

- HuggingFace: https://huggingface.co/Alibaba-DAMO-Academy/HoloCT-4B
- Repositorio GitHub: https://github.com/2021xyl/HoloCT
- Demos del repositorio: https://github.com/2021xyl/HoloCT#demos
- Ejemplos de metricas de evaluacion: https://github.com/2021xyl/HoloCT/blob/main/eval/README.md
- HoloCT-8B en HuggingFace: https://huggingface.co/yolo2025666/HoloCT-8B
- Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Med3DVLM: https://github.com/mirthAI/Med3DVLM
- MONAI VISTA: https://github.com/Project-MONAI/VISTA
