# ianpan/ct-cspine-segmentation

## Resumen

`ianpan/ct-cspine-segmentation` es un modelo de segmentación de imagen médica desarrollado por Ian Pan que segmenta las vértebras cervicales C1 a C7 en estudios de tomografía computarizada (TC) axial. El modelo se distribuye como un ensemble de cinco pliegues de arquitecturas X3D-S y DeepLabV3+, entrenado primero con pseudo-etiquetas generadas por TotalSegmentator y después ajustado con etiquetas manuales. Se publica bajo licencia Apache 2.0 y está pensado como componente de un pipeline de investigación sobre fracturas de columna cervical, no como dispositivo médico.

El modelo resuelve un problema concreto: la delimitación automática de las siete vértebras cervicales en series de TC, un paso previo necesario para tareas posteriores de clasificación de fracturas. Consume una serie DICOM axial completa (no imágenes PNG sueltas) con ventana de centro 400 y anchura 1800, y devuelve máscaras de C1 a C7 junto con indicadores de anomalía topológica. Su relevancia actual radica en que forma parte de una suite final-v1 junto a un repositorio complementario de clasificación de fracturas, con contratos de preprocesado y ensemble documentados de forma explícita.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica a un modelo de visión) ni los idiomas soportados; el repositorio ocupa 0,1 GB y la librería declarada es `skp`, un runtime propio empaquetado con el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 5 pliegues con X3D-S (encoder) y DeepLabV3+ (decodificador de segmentación); componentes auxiliares MIL, localizador y cabezas de serie `7x1` y `7x32` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D sobre series de TC) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (p. ej. `weights/fold0.safetensors`), más wheel con definiciones de arquitectura y configuración |

## Arquitectura y entrenamiento

La segmentación combina un encoder 3D X3D-S con un decodificador DeepLabV3+, ejecutado como ensemble de cinco pliegues disjuntos por estudio. El entrenamiento sigue una estrategia de destilación en dos fases: primero se generan pseudo-etiquetas con TotalSegmentator a resolución completa sobre 1.931 estudios que pasan control de calidad, y después se ajusta el estudiante con 87 estudios segmentados manualmente. Los datos provienen de la competición RSNA 2022 Cervical Spine Fracture Detection, con 2.019 estudios de entrenamiento, de los cuales 235 tienen anotaciones de bounding box. Los pliegues son disjuntos por estudio, de modo que todos los recortes de un mismo estudio comparten pliegue.

El modelo usa estados EMA para la segmentación, los encoders MIL originales y los decodificadores de localización; las cuatro arquitecturas de cabeza de serie usan estados crudos porque el EMA se desactivó en ellas. El runtime empaquetado implementa el parseo DICOM, el ordenamiento espacial, el ventaneo, el recorte cuadrado guiado por segmentación, el redimensionado y el mapeo geométrico de localización. El manifiesto `cspine_model.json` define el contrato de preprocesado y el orden de salida, y `provenance.json` registra hashes exactos del código fuente en tiempo de ejecución.

## Capacidades

- Segmentación 3D de vértebras cervicales C1 a C7 en series de TC axial.
- Consumo directo de series DICOM completas mediante `DICOMSeries.from_dicom_directory`, sin necesidad de convertir a PNG.
- Ensemble configurable con `ensemble_size=1`, `3` o `5` (por defecto 5), que ejecuta los pliegues `[0]`, `[0,1,2]` o `[0,1,2,3,4]` respectivamente.
- Salida con máscaras de segmentación e indicadores de anomalía topológica (`anomaly_levels`) que deben revisarse aguas abajo.
- Componentes de clasificación auxiliares: familias MIL (`mil`), localizador (`localizer`) y cabezas de serie (`7x1`, `7x32`) con familias `d32` o `3x32`, que producen probabilidades globales y por nivel C1-C7, además de mapas de calor en probabilidad.
- Carga de un checkpoint individual para fine-tuning mediante `load_checkpoint_for_finetuning`, con verificación de checksums, carga estricta y preservación del congelado intencional del encoder del localizador.
- Descarga solo de pesos con `hf_hub_download` para integraciones que no requieran el ensemble completo.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente de visión médica.

## Casos de uso

- Triaje de fracturas cervicales: la segmentación C1-C7 alimenta el repositorio complementario de clasificación de fracturas, que consume el `SegmentationResult` de este modelo para emitir probabilidades por nivel. Es el flujo para el que se diseñó explícitamente.
- Preprocesado en pipelines de investigación radiológica: el modelo estandariza el recorte de vértebras y el redimensionado, de modo que estudios de distintas procedencias llegan al clasificador con la misma geometría.
- Auditoría de calidad de segmentaciones manuales: comparar las máscaras predichas con anotaciones de experto permite detectar estudios mal etiquetados antes de usarlos en entrenamiento.
- Extracción de regiones de interés para modelos 2D: el recorte cuadrado guiado por segmentación sirve para generar parches por vértebra que alimenten clasificadores o detectores más ligeros.
- Investigación sobre robustez a dominio: al estar entrenado con datos RSNA 2022, sirve como línea base para medir la degradación bajo cambios de reconstrucción, artefactos o cortes gruesos.
- Fine-tuning sobre datos institucionales: el cargador de checkpoints permite partir de un pliegue concreto y ajustar con `AdamW` a `lr=1e-5` sobre un subconjunto local, manteniendo el contrato de normalización y formas.
- Docencia y reproducción de experimentos: el repositorio incluye guía de reproducción, historial de experimentos y registro de decisiones, lo que facilita replicar el pipeline completo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Dice medio C1-C7 (EMA, subconjunto manual pequeño) | 0,8037 |
| Dice medio C1-C7 (pesos crudos) | 0,8031 |

El autor señala que TotalSegmentator a resolución completa sigue siendo el techo de calidad del profesor. No se han publicado resultados de benchmarks adicionales (por ejemplo, métricas de las cabezas de clasificación) en la información disponible; las métricas de serie son resultados out-of-fold sobre características cacheadas por pliegue, no una evaluación clínica end-to-end del ensemble desplegado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio pesa 0,1 GB, lo que sugiere que el conjunto completo de pesos cabe holgadamente en GPUs de consumo, pero el consumo depende del volumen 3D de entrada y del tamaño de ensemble elegido.
- GPU recomendadas: no disponibles. El ejemplo de la model card usa `device="cuda"` sin especificar modelo de tarjeta.
- Cabe en GPU de consumo: probablemente sí por tamaño de pesos, pero no confirmado por el autor.
- Opciones de despliegue: runtime propio `skp` instalado con `install_local.sh`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Nota práctica: descargar el paquete trae todos los pesos aunque solo se ejecuten los pliegues seleccionados por `ensemble_size`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ianpan/ct-cspine-segmentation` | Ensemble X3D-S + DeepLabV3+ para TC cervical | no disponible | no aplica | Dice C1-C7 0,8037 (EMA) | Apache 2.0 | Hugging Face |
| TotalSegmentator | Segmentación multiorgánica con nnU-Net | no disponible | no aplica | Actúa como techo de calidad del profesor según el autor | no disponible en la información | Proyecto open source |
| Modelo MDPI de segmentación y reconocimiento vertebral en TC | Deep learning para columna | no disponible | no aplica | No comparable directamente; el artículo prioriza eficiencia computacional | no disponible en la información | Publicación MDPI |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas de la misma categoría; la comparativa se limita a posición relativa y licencia.

## Limitaciones y advertencias

- Es un modelo de investigación, no un dispositivo médico: no debe usarse como única base para diagnóstico o tratamiento.
- El entrenamiento se basa en RSNA 2022; el rendimiento puede degradarse bajo cambio de dominio, cobertura cervical incompleta, artefactos severos, reconstrucciones alteradas o cortes gruesos.
- No se ha realizado auditoría de vinculación de identidad de pacientes ni validación clínica externa.
- Los indicadores de anomalía topológica deben inspeccionarse aguas abajo; no son una garantía de calidad automática.
- No se han establecido intervalos de confianza, análisis por subgrupos demográficos, garantías de calibración ni utilidad clínica prospectiva.
- Los presets de ensemble más pequeños (`1` y `3`) no se han evaluado por separado; la selección de pliegues no está ordenada por rendimiento.
- El repositorio debe tratarse como candidato hasta que todos los ficheros de `release-inventory.json` estén disponibles; la identidad de fuente "dirty" es deliberada y los cambios de preparación no están commiteados.
- No se debe sustituir la interfaz DICOM pública por PNG redimensionados manualmente; hacerlo rompe el contrato de preprocesado.
- Las salidas del clasificador son probabilidades y mapas de calor en probabilidad, no medidas en milímetros.
- Licencia Apache 2.0: permite uso comercial, pero las advertencias clínicas siguen aplicando.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ianpan/ct-cspine-segmentation
- Perfil del autor: https://huggingface.co/ianpan/models
- Repositorio fuente: https://github.com/i-pan/ct-cspine-fracture-detection
- Guía de reproducción: https://github.com/i-pan/ct-cspine-fracture-detection/blob/main/docs/REPRODUCE.md
- Historial de experimentos: https://github.com/i-pan/ct-cspine-fracture-detection/blob/main/docs/EXPERIMENT_HISTORY.md
- Registro de decisiones: https://github.com/i-pan/ct-cspine-fracture-detection/blob/main/docs/DECISION_LOG.md
- Dataset RSNA 2022 Cervical Spine Fracture Detection: https://www.kaggle.com/competitions/rsna-2022-cervical-spine-fracture-detection
- Artículo MDPI sobre segmentación y reconocimiento vertebral: https://www.mdpi.com/2075-4418/13/16/2658
