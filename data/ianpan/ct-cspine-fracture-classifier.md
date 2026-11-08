# ianpan/ct-cspine-fracture-classifier

## Resumen

El modelo `ct-cspine-fracture-classifier`, desarrollado por Ian Pan, es un clasificador de imagen médica diseñado para detectar y localizar fracturas de la columna cervical en estudios de tomografía computarizada (TC). Se distribuye como un paquete de inferencia completo (no un único checkpoint) que integra un modelo de segmentación vertebral acompañante y un conjunto de clasificadores basados en Multiple Instance Learning (MIL) sobre un backbone MaxViT-Tiny. El paquete predice la probabilidad global de fractura y las probabilidades específicas para cada nivel vertebral C1-C7, además de generar mapas de calor de localización débil.

Técnicamente, el sistema combina dos familias de MIL (d32 y 3x32) con cinco pliegues de validación cruzada y cuatro cabezas ligeras de series (7x1 y 7x32 por familia), lo que da lugar a un ensemble configurable de 1, 3 o 5 pliegues. La entrada es una serie DICOM completa, y la salida incluye `prediction.json` con ocho probabilidades, predicciones a nivel de arquitectura, indicadores de calidad y geometría nativa de cortes, junto con mapas de calor comprimidos de 96x96x96 por nivel localizado.

El modelo es relevante porque aborda una tarea clínica de alta criticidad (fracturas cervicales, a menudo infradiagnosticadas) con un enfoque de código abierto (licencia Apache 2.0) y reproducible, entrenado sobre los datos de la competición RSNA 2022. No obstante, el propio autor lo declara explícitamente como modelo de investigación y no como dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MaxViT-Tiny con Multiple Instance Learning (MIL); familias d32 y 3x32; cabezas de series 7x1 y 7x32; decodificadores de localización binarios |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada 3D de series TC; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de imagen médica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints por pliegue, familia y componente; p. ej. `weights/d32/mil/fold0.safetensors`) |

## Arquitectura y entrenamiento

El sistema se compone de un modelo de segmentación vertebral (student) y un clasificador MIL. El clasificador usa un backbone MaxViT-Tiny y dos familias de MIL (d32 y 3x32), cada una con cuatro cabezas ligeras de series (7x1 y 7x32). La segmentación, los encoders MIL originales y los decodificadores de localización usan estados EMA; las cuatro arquitecturas de cabezas de series usan estados crudos (EMA desactivado). Los crops históricos de entrenamiento usaron estados de segmentación crudos, mientras que el despliegue usa EMA.

Los datos provienen de la competición RSNA 2022 Cervical Spine Fracture Detection: 2.019 estudios de entrenamiento, de los cuales 87 tienen segmentación manual y 235 tienen anotaciones de bounding box. Se emplean cinco pliegues disjuntos por estudio (todos los crops de un estudio comparten pliegue). El student de segmentación usa 1.931 estudios etiquetados por el teacher que pasaron control de calidad, más ajuste fino manual. No se declara auditoría independiente de identidad de pacientes ni validación clínica externa. El paquete incluye un wheel local con las definiciones de arquitectura y configuración, y verifica checksums al cargar pesos.

## Capacidades

- Clasificación de fractura cervical global (probabilidad de fractura global).
- Predicción de probabilidad de fractura por nivel vertebral C1-C7.
- Localización débil mediante mapas de calor 3D comprimidos (96x96x96) por nivel vertebral localizado.
- Segmentación vertebral mediante el modelo acompañante `cspine-segmentation`.
- Procesamiento end-to-end de series DICOM completas mediante `CervicalSpinePipeline`.
- Ensemble configurable de 1, 3 o 5 pliegues (`ensemble_size`), con ejecución de los pliegues `[0]`, `[0,1,2]` o `[0,1,2,3,4]` respectivamente.
- Indicadores de calidad para vértebras ausentes y anomalías topológicas.
- Exportación de resultados en `prediction.json` con probabilidades, predicciones por arquitectura, flags de calidad y geometría nativa de cortes.
- Restauración de localizaciones al sistema de coordenadas DICOM original sin retener el volumen 3D denso nativo.
- Carga de checkpoints individuales para ajuste fino (`load_checkpoint_for_finetuning`) con verificación de checksums y carga estricta.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Triaje de urgencias en TC cervical: el pipeline procesa una serie DICOM y devuelve probabilidad global y por nivel C1-C7, lo que permite priorizar en la lista de trabajo los estudios con mayor probabilidad de fractura. Es adecuado por su salida estructurada en `prediction.json` y sus flags de calidad.
- Segunda lectura asistida en radiología: el clasificador puede ejecutarse junto al modelo de segmentación para señalar niveles sospechosos y generar mapas de calor que el radiólogo revisa como apoyo, no como diagnóstico.
- Investigación en detección de fracturas cervicales: el ensemble de cinco pliegues con validación out-of-fold (AUC global 0,93930) sirve como línea base reproducible para comparar nuevos métodos sobre RSNA 2022.
- Ajuste fino sobre datos propios: `load_checkpoint_for_finetuning` permite cargar un pliegue concreto (componente `mil`, `localizer`, `7x1` o `7x32`; familia `d32` o `3x32`) y adaptarlo a una cohorte institucional, preservando el congelado intencional del encoder del localizador.
- Control de calidad de series TC: los flags de calidad sobre vértebras ausentes y anomalías topológicas permiten filtrar automáticamente estudios mal adquiridos antes de pasarlos a otros modelos o a lectura humana.
- Docencia y formación: los mapas de calor por nivel y la geometría nativa de cortes permiten superponer localizaciones sobre el volumen original para ilustrar casos de fractura cervical en sesiones formativas.
- Integración en pipelines de investigación clínica: la API `CervicalSpinePipeline` combina segmentación y clasificación en una sola llamada, lo que facilita el procesamiento por lotes de cohortes retrospectivas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Competition weighted log loss (OOF, 5 pliegues) | 0,25981 |
| AUC global de fractura (OOF) | 0,93930 |
| AUC macro C1-C7 (OOF) | 0,94087 |

Los presets de ensemble más pequeños (1 y 3 pliegues) no han sido evaluados por separado según la model card. Las métricas de series son resultados OOF sobre características cacheadas por pliegue, no una evaluación clínica end-to-end del sistema desplegado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,7 GB e incluye todos los pesos del ensemble, pero solo se ejecutan los pliegues seleccionados.
- GPU recomendadas: no disponibles en la información proporcionada; la API acepta `device="cuda"`.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del paquete (2,7 GB) sugiere que los pesos caben en GPUs de consumo, pero no se documenta el pico de memoria durante la inferencia 3D.
- Opciones de despliegue: paquete Python propio con wheel local (`install_local.sh`), API `CervicalSpinePipeline` y descarga de pesos vía `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ianpan/ct-cspine-fracture-classifier | Clasificación y localización de fractura cervical en TC | no disponible | no disponible | AUC global 0,93930; AUC macro C1-C7 0,94087; log loss 0,25981 | Apache 2.0 | Hugging Face (repo 2,7 GB) |
| CNN para detección de fractura cervical (referencia PMC10856760) | Detección de fractura cervical en TC | no disponible | no disponible | 92 % de exactitud reportada | no disponible | Publicación científica |
| Modelo Grad-CAM para fractura espinal (Nature s41598-025-10448-6) | Detección y visualización de fractura | no disponible | no disponible | no disponible | no disponible | Publicación científica |
| Modelo de detección/localización vertebral cervical (Nature s41598-026-62166-2) | Detección y localización de fracturas vertebrales cervicales | no disponible | no disponible | no disponible | no disponible | Publicación científica |

No se dispone de datos suficientes para una comparación cuantitativa homogénea con alternativas de código abierto equivalentes.

## Limitaciones y advertencias

- Modelo de investigación, no dispositivo médico: no debe sustituir la interpretación diagnóstica de un clínico cualificado.
- Los mapas de calor son salidas de supervisión débil de localización y no segmentaciones de fractura con precisión a nivel de píxel.
- El entrenamiento se basa únicamente en datos de la competición RSNA 2022; la robustez ante cortes gruesos no ha sido entrenada ni validada específicamente.
- No se declara auditoría independiente de vinculación de identidad de pacientes ni validación clínica externa.
- Las vértebras ausentes y las anomalías topológicas se exponen como flags de calidad, pero pueden afectar a las predicciones.
- Los presets de ensemble de 1 y 3 pliegues no han sido evaluados por separado; la selección de pliegues no está ordenada por rendimiento.
- La descarga del paquete obtiene todos los pesos aunque solo se ejecuten los pliegues seleccionados.
- El cargador de ajuste fino no restaura el estado del optimizador.
- La identidad de fuente "dirty" es deliberada: los cambios de preparación no están comprometidos en el repositorio, y los cambios de runtime de preparación pueden no estar aún en la rama principal remota.
- Licencia Apache 2.0: permite uso comercial, pero las advertencias clínicas del autor siguen aplicando y el modelo no está certificado como producto sanitario.
- Riesgo de alucinación y sesgos: no documentados explícitamente en la información disponible; al tratarse de un modelo de imagen médica, el riesgo principal es el falso negativo o falso positivo en la detección de fracturas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ianpan/ct-cspine-fracture-classifier
- Repositorio fuente: https://github.com/i-pan/ct-cspine-fracture-detection
- Guía de reproducción: https://github.com/i-pan/ct-cspine-fracture-detection/blob/main/docs/REPRODUCE.md
- Historial de experimentos: https://github.com/i-pan/ct-cspine-fracture-detection/blob/main/docs/EXPERIMENT_HISTORY.md
- Registro de decisiones: https://github.com/i-pan/ct-cspine-fracture-detection/blob/main/docs/DECISION_LOG.md
- Dataset RSNA 2022 Cervical Spine Fracture Detection: https://www.kaggle.com/competitions/rsna-2022-cervical-spine-fracture-detection
- Referencia científica (Nature, detección de fractura espinal): https://www.nature.com/articles/s41598-025-10448-6
- Referencia científica (PMC, machine learning en lesión espinal): https://pmc.ncbi.nlm.nih.gov/articles/PMC10856760/
- Referencia científica (ScienceDirect, IA en fracturas vertebrales): https://www.sciencedirect.com/science/article/pii/S2405525526000476
- Referencia científica (Cureus, modelo ML para fractura cervical): https://www.cureus.com/articles/177237
- Referencia científica (Nature, detección y localización vertebral cervical): https://www.nature.com/articles/s41598-026-62166-2
