# medarc/OpenMidnight-1.1-SPECTRA

## Resumen

OpenMidnight-1.1-SPECTRA es un modelo de extracción de características visuales para patología digital, desarrollado por MedARC en colaboración con Sophont. Se trata de un ajuste fino (finetune) del modelo base OpenMidnight-1.1, al que se le ha aplicado la técnica SPECTRA: un entrenamiento contrastivo sobre mosaicos de imagen (tiles) histológicos del registro PLISM, cuyo objetivo es alinear las representaciones del mismo tejido a través de distintos escáneres y tinciones. El resultado es un extractor de embeddings de 1.536 dimensiones a partir de tiles RGB de histología.

El modelo emplea la librería `timm` y una arquitectura de tipo transformer de visión (ViT) con 1.134.774.272 parámetros totales, lo que lo sitúa en la categoría de los ViT grandes. La entrada se procesa a 224 × 224 píxeles con normalización ImageNet e interpolación bicúbica, y la representación se obtiene del token CLS. No es un modelo generativo: su función es producir representaciones vectoriales densas para tareas posteriores de análisis, como clasificación, recuperación o segmentación a nivel de slide.

Su relevancia actual radica en la necesidad de modelos de fundación robustos para patología computacional que sean invariantes a la variabilidad entre escáneres y protocolos de tinción, un problema recurrente en la práctica clínica y en la investigación multi-centro. Al publicarse con licencia Apache 2.0 y pesos completos en safetensors, permite su uso comercial y su despliegue sin dependencias de infraestructura propietaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT) vía `timm`; el modelo base es OpenMidnight-1.1 |
| Parámetros totales | 1.134.774.272 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada fija de 224 × 224 píxeles) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiqueta de idioma del repo; el modelo procesa imágenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de OpenMidnight-1.1, un transformer de visión para patología, y se adapta mediante SPECTRA: un objetivo contrastivo que alinea las representaciones del mismo tejido capturado con distintos escáneres y tinciones. El entrenamiento se realizó sobre tiles de imagen del registro PLISM, y las actualizaciones aprendidas se fusionan en los pesos completos del modelo, de modo que la inferencia no requiere adaptadores ni checkpoints separados. El resultado es un extractor que mapea cada tile RGB a un embedding de 1.536 dimensiones.

La configuración de preprocesado usa `crop_pct=1.0` y `crop_mode="squash"`, redimensionando la imagen completa a 224 × 224 píxeles con interpolación bicúbica y normalización ImageNet definida en `config.json`. El embedding se toma del token CLS. Para segmentación, el autor indica que deben excluirse los tokens CLS y de registro al pasar las características de parche al decodificador (`tokens[:, model.num_prefix_tokens:]`), y que la máscara de segmentación debe cubrir la misma región de tejido que la imagen. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de extracción de características).

## Capacidades

- Extracción de características de imágenes histológicas: genera embeddings de 1.536 dimensiones por tile RGB.
- Alineación entre dominios: representaciones invariantes a variaciones de escáner y tinción gracias al entrenamiento contrastivo SPECTRA.
- Soporte para tareas posteriores: los embeddings sirven como entrada a clasificadores, modelos de recuperación o decodificadores de segmentación.
- Segmentación semántica: el autor documenta cómo usar los tokens de parche (excluyendo CLS y registro) con un decodificador, interpolando los logits a la resolución original de la máscara.
- Inferencia en CPU o GPU: compatible con `timm` y pesos safetensors.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de extracción de características.

## Casos de uso

- Clasificación de tejido en patología digital: extraer embeddings de tiles y entrenar un clasificador ligero (regresión logística, MLP) para distinguir tipos de tejido o detectar anomalías, aprovechando la invariancia a escáner del ajuste SPECTRA.
- Recuperación de imágenes por similitud (image retrieval): indexar embeddings de un archivo de slides y recuperar tiles morfológicamente similares para revisión de casos o control de calidad.
- Segmentación de estructuras histológicas: usar los tokens de parche como entrada a un decodificador de segmentación (por ejemplo, siguiendo el esquema de THUNDER) e interpolar los logits a la resolución de la máscara original.
- Armonización multi-centro: procesar tiles de distintos escáneres y tinciones con un mismo extractor para reducir el sesgo por lote en estudios multicéntricos.
- Preentrenamiento de modelos de slide-level: usar los embeddings de tile como características de entrada a modelos de atención múltiple (MIL) para predicción a nivel de slide (diagnóstico, subtipado, pronóstico).
- Búsqueda de casos similares en archivos hospitalarios: construir un índice vectorial de embeddings para asistir a patólogos en la localización de casos comparables.
- Control de calidad de tinciones y escaneo: detectar tiles atípicos mediante distancias en el espacio de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el paper está "coming soon" y no incluye métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.134.774.272 parámetros en precisión FP32 los pesos ocupan aproximadamente 4,5 GB, por lo que se requiere al menos esa cantidad de memoria más el espacio para activaciones del batch.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs de consumo con 8 GB o más (por ejemplo, RTX 3060/4060/4070) y en GPUs de datacenter (A100, H100) para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM en FP32; no se documentan requisitos de cuantización.
- Opciones de despliegue: `timm` 1.0.30 con PyTorch, carga directa desde Hugging Face Hub (`hf-hub:medarc/OpenMidnight-1.1-SPECTRA`); también es posible la inferencia en CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros extractores de características para patología (por ejemplo, UNI, Virchow o Hibou), por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Modelo de extracción de características, no generativo: no produce texto, diagnósticos ni predicciones a nivel de slide por sí mismo; se requiere un modelo posterior.
- Los embeddings son de tile: las predicciones a nivel de slide necesitan un modelo de agregación downstream.
- La configuración anterior usaba `crop_pct=0.875`, lo que recortaba el tile a los 224 × 224 píxeles centrales de un tile de 256 × 256; el autor advierte que, si se usaron esas características con máscaras de tile completo, la evaluación es incorrecta y debe recomputarse con la configuración actualizada (`crop_pct=1.0`).
- Para segmentación, es obligatorio alinear imagen y máscara sobre la misma región de tejido y excluir los tokens CLS y de registro al pasar parches al decodificador.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden capturar correlaciones espurias del dataset de entrenamiento (PLISM) y generalizar deficientemente a tejidos, tinciones o escáneres no representados.
- Sesgos conocidos: no documentados en la información disponible; al entrenar sobre un registro concreto, puede heredar sesgos de composición de ese dataset.
- Idioma: la etiqueta de idioma es `en`, aunque el modelo procesa imágenes; no hay implicaciones lingüísticas directas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento (PLISM) y del modelo base OpenMidnight-1.1 antes de un despliegue en producción clínica.
- No es un dispositivo médico: no se documenta validación regulatoria ni uso clínico aprobado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/medarc/OpenMidnight-1.1-SPECTRA
- Modelo base: https://huggingface.co/medarc/OpenMidnight-1.1
- MedARC: https://www.medarc.ai/
- Sophont: https://sophont.med/
- Paper: pendiente de publicación según la model card (no disponible)
