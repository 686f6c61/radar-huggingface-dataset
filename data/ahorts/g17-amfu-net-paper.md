# Ahorts/G17-AMFU-Net-Paper

## Resumen

G17-AMFU-Net-Paper es un modelo de segmentación de imágenes médicas publicado en HuggingFace por el usuario Ahorts (Godsway). Se trata de un fine-tuning de la arquitectura AMFU-Net, una red de atención multi-escala diseñada para la segmentación de lesiones, aplicada en este caso concreto a la segmentación de lesiones mamarias en ecografía (ultrasound). No es un modelo de lenguaje: es un modelo de visión por computador orientado a una tarea densa de segmentación binaria (máscara de lesión frente a fondo).

El repositorio contiene únicamente los pesos en formato safetensors, con 19.036.097 parámetros (aproximadamente 19 millones) y un tamaño de repositorio de 0,3 GB. La model card está generada automáticamente por el Trainer de HuggingFace y, salvo las métricas de evaluación y los hiperparámetros de entrenamiento, no incluye descripción, dataset, usos previstos ni licencia. La relevancia actual del modelo es limitada y de ámbito académico: sirve como artefacto reproducible de un entrenamiento concreto y como base para una demo interactiva de segmentación.

Existe un ecosistema alrededor del modelo: un repositorio GitHub con una aplicación Streamlit de demostración, un Space de HuggingFace y un dataset de preprocesado, además de la referencia al artículo AMFU-Net publicado en Biomedical Signal Processing and Control. La ausencia de licencia explícita y de documentación de datos de entrenamiento son sus principales carencias de cara a un uso serio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AMFU-Net (red convolucional de atención multi-escala para segmentación; los detalles exactos de bloques no estan documentados en la model card) |
| Parametros totales | 19.036.097 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de segmentacion de imagenes, no de texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | no aplicable |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tarea | segmentacion de imagenes (lesion mamaria en ecografia) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura declarada es AMFU-Net (Multi-scale Attention Network for lesion segmentation), una red de segmentacion que combina modulos de atencion con procesamiento multi-escala. La model card no describe la topologia interna ni referencia explicitamente la version concreta del paper utilizada. La model card indica que el modelo es un fine-tuning de un modelo base cuyo identificador aparece vacio en el README, y sobre un dataset no especificado ("unknown dataset"). No hay informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset ni el origen de las anotaciones.

Los hiperparametros de entrenamiento si estan documentados: learning rate de 0,001, batch de entrenamiento de 4 con 3 pasos de acumulacion de gradiente (batch total efectivo de 12), batch de evaluacion de 4, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 200 epocas. El entrenamiento registrado en la tabla de resultados cubre hasta la epoca 69,2 (paso 12.250), por lo que no queda claro si el proceso completo de 200 epocas se llevo a cabo o si la tabla esta truncada. No se documenta uso de RLHF, DPO ni tecnicas de alineacion, algo por otra parte ajeno a este tipo de modelo.

## Capacidades

- Segmentacion binaria de lesiones mamarias en imagenes de ecografia (ultrasound), generando una mascara de la region de interes.
- Generacion de mapas de probabilidad por pixel, segun la descripcion del repositorio de demostracion asociado.
- Integracion con preprocesado de imagen especifico del dominio: la demo aplica despeckling SRAD y realce CLAHE antes de la inferencia.
- Produccion de superposicion (overlay) sobre la imagen original para inspeccion visual.
- Compatible con la libreria transformers y con endpoints de HuggingFace (tag endpoints_compatible).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, capacidades de agente ni capacidades multilingues: es un modelo unimodal y de tarea unica.

## Casos de uso

- Segmentacion automatica de lesiones mamarias en ecografia: el modelo recibe una imagen de ultrasonido preprocesada (SRAD + CLAHE) y devuelve una mascara binaria de la lesion, lo que permite delimitar la region de interes de forma reproducible.
- Apoyo a la lectura radiologica: uso como segunda opinion que resalta la region sospechosa, dejando la validacion final al especialista. La metrica Dice de 0,7909 sobre el conjunto de evaluacion da una referencia cuantitativa de solapamiento.
- Investigacion reproducible en segmentacion medica: el artefacto sirve como punto de partida para comparar variantes de AMFU-Net frente a U-Net, Attention U-Net o nnU-Net en el mismo dataset.
- Preprocesado dentro de un pipeline de analisis: la mascara generada puede alimentar etapas posteriores de extraccion de caracteristicas (forma, textura, area) para clasificacion benigno/maligno.
- Formacion y docencia en imagen medica: la demo Streamlit permite ilustrar de forma interactiva como un modelo de segmentacion transforma una imagen en una mascara y un overlay.
- Prototipado de aplicaciones clinicas de bajo coste: con 19 millones de parametros el modelo es ligero y puede ejecutarse en hardware modesto, lo que facilita demos y validaciones tempranas.
- Auditoria de calidad de anotaciones: comparar la mascara del modelo con anotaciones manuales puede ayudar a detectar casos discrepantes que requieran revision.

## Benchmarks y rendimiento

La model index del autor no declara resultados de benchmarks comparativos. La model card si reporta metricas sobre el conjunto de evaluacion, que se reproducen a continuacion tal cual:

| Metrica | Valor |
|---|---|
| Loss | 0,3496 |
| Dice | 0,7909 |
| Jaccard (IoU) | 0,6967 |
| Hd95 (Hausdorff 95) | 30,0976 |
| Asd (Average Surface Distance) | 9,8865 |

No se han publicado resultados de benchmarks comparativos (estilo MMLU, HumanEval o GSM8K, no aplicables aqui) ni una comparacion controlada con otros modelos de segmentacion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. Con 19 millones de parametros, los pesos ocupan aproximadamente 76 MB en fp32 y unos 38 MB en fp16. Sumando activaciones de una imagen de entrada, la inferencia cabe holgadamente en menos de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente. Una RTX 3060, RTX 4090, A100 o H100 ejecutaran el modelo sin problema; el modelo no requiere GPU de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con al menos 2 GB de VRAM, e incluso es viable la inferencia en CPU.
- Opciones de despliegue: libreria transformers (pipeline de segmentacion), y por extension exportacion a ONNX o TorchScript para servir con frameworks genericos. La model card no documenta soporte explicito de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no aplican aqui.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados para este modelo concreto, por lo que la comparacion se limita a caracteristicas estructurales y no a rendimiento medido. No se inventan cifras.

| Modelo | Tipo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| G17-AMFU-Net-Paper | Segmentacion (atencion multi-escala) | 19,03 M | no disponible | HuggingFace (0 descargas) |
| U-Net clasica | Segmentacion convolucional | del orden de decenas de millones (variable) | habitualmente abierta segun implementacion | Multiple (reimplementaciones publicas) |
| Attention U-Net | Segmentacion convolucional con puertas de atencion | variable segun configuracion | habitualmente abierta | Multiple |
| nnU-Net | Framework de segmentacion auto-configurado | variable segun tarea | abierta (segun repositorio original) | GitHub oficial |

Los datos de rendimiento de AMFU-Net frente a estos modelos no estan disponibles en la informacion proporcionada, por lo que no puede afirmarse superioridad ni equivalencia.

## Limitaciones y advertencias

- La model card esta autogenerada y carece de descripcion, usos previstos y limitaciones: no hay guia del autor sobre el alcance correcto del modelo.
- No se especifica la licencia, lo que impide determinar si el uso comercial esta permitido. En ausencia de licencia explicita debe asumirse incertidumbre legal para cualquier uso en produccion.
- No se documenta el dataset de entrenamiento ni su procedencia, tamano o composicion, lo que impide evaluar sesgos demograficos, de equipo de adquisicion o de protocolo clinico.
- Riesgo de sobreajuste o de generalizacion limitada: el modelo se entrena sobre una unica modalidad (ecografia mamaria) y probablemente un conjunto reducido de centros; no se espera buen rendimiento fuera de esa distribucion.
- Hd95 de 30,1 y Asd de 9,9 indican que, aunque el solapamiento global (Dice 0,79) es razonable, los contornos de la mascara presentan errores de distancia notables, relevantes si se necesita una delimitacion precisa.
- El entrenamiento registrado en la tabla llega hasta la epoca 69 de 200 declaradas; no hay confirmacion de que el proceso se completase ni de cual es el checkpoint final respecto al mejor resultado.
- Es un modelo de investigacion: no debe usarse como dispositivo medico ni para decision clinica sin validacion regulatoria, control de calidad y supervision profesional.
- No tiene capacidades de lenguaje, agentes ni tool calling; cualquier expectativa en ese sentido es erronea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ahorts/G17-AMFU-Net-Paper
- Perfil del autor: https://huggingface.co/Ahorts
- Repositorio GitHub de la demo (Streamlit): https://github.com/aee4/G17-Model
- Space de demostracion: https://huggingface.co/spaces/aee4/G17-AMFU-Net-Demo
- Dataset de preprocesado asociado: https://huggingface.co/datasets/Ahorts/G17-preprocessed-dataset
- Paper AMFU-Net (referencia en Semantic Scholar): https://www.semanticscholar.org/paper/AMFU-Net%3A-A-multi-scale-attention-network-for-in-Chen-Gao/5fdde634111b9b6752d578e1123d9fef38f742fa
- Paper AMFU-Net (Biomedical Signal Processing and Control, DOI 10.1016/j.bspc.2026.110210): https://bishtref.com/articles/10.1016/j.bspc.2026.110210
