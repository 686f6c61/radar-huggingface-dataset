# medarc/H-optimus-0-SPECTRA

## Resumen

H-optimus-0-SPECTRA es un modelo de extracción de características visuales para patología computacional, desarrollado por MedARC y Sophont a partir de H-optimus-0 de Bioptimus. Se trata de un ViT de aproximadamente 1.134 millones de parámetros que transforma teselas de histología en hematoxilina-eosina (H&E) en embeddings de 1.536 dimensiones, pensados para alimentar modelos posteriores de clasificación, segmentación o recuperación a nivel de portaobjetos.

La innovación principal es la adaptación SPECTRA: un ajuste fino con objetivo contrastivo sobre teselas del registro PLISM, que alinea las representaciones del mismo tejido capturado con distintos escáneres y distintas tinciones. Esto ataca uno de los problemas clásicos del dominio, la variabilidad de dominio entre laboratorios y equipos, que degrada el rendimiento de los modelos entrenados en un único centro. Los pesos actualizados se fusionan en el checkpoint completo, de modo que el modelo se usa como un sustituto directo del original sin adaptadores ni acceso a clústeres.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors y con integración nativa en `timm`, lo que facilita su despliegue en pipelines existentes. Su relevancia actual radica en que ofrece embeddings robustos a la variabilidad de escáner y tinción sin coste de inferencia adicional, algo crítico para llevar modelos de patología a producción multi-centro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), implementación `timm`; base H-optimus-0 |
| Parametros totales | 1.134.774.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen 224 × 224 píxeles |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | en (etiqueta de idioma; el modelo procesa imágenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,5 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer de visión puro (ViT) heredado de H-optimus-0, sin componentes convolucionales ni híbridos. La entrada son teselas RGB de 224 × 224 píxeles muestreadas a 0,5 µm/píxel, con normalización específica para H&E definida en `config.json`, interpolación bicúbica y `crop_pct=1.0` con `crop_mode="squash"`, de modo que la imagen completa se reescala a 224 × 224 sin recorte central. El embedding de salida es el token CLS, de 1.536 dimensiones; los tokens de parche se obtienen descartando los tokens de prefijo (`model.num_prefix_tokens`), que incluyen CLS y tokens de registro.

El ajuste SPECTRA se realizó sobre teselas de imagen del registro PLISM mediante un objetivo contrastivo que alinea las representaciones del mismo tejido entre escáneres y tinciones distintos. Las actualizaciones aprendidas se fusionan en los pesos completos del modelo, por lo que no se requiere checkpoint base, adaptador ni acceso a clúster en inferencia. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de extracción de características).

## Capacidades

- Extracción de características de imágenes de histología H&E: devuelve embeddings de 1.536 dimensiones por tesela.
- Invariancia a dominio: representaciones alineadas entre escáneres y tinciones gracias al entrenamiento contrastivo SPECTRA.
- Salida de tokens de parche además del CLS, apta para decodificadores de segmentación.
- Compatibilidad con `timm` mediante `timm.create_model("hf-hub:medarc/H-optimus-0-SPECTRA", pretrained=True)`.
- Ejecución en GPU o CPU (`device = "cpu"` en el ejemplo de la model card).
- No es un modelo generativo: no soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multimodales texto-imagen ni de audio.

## Casos de uso

- Clasificación de tejido a nivel de tesela: usar los embeddings CLS como entrada a un clasificador ligero (regresión logística, MLP) para detectar tumores, subtipos histológicos o grados, aprovechando la invariancia a escáner del ajuste SPECTRA.
- Segmentación semántica de estructuras: pasar los tokens de parche (`tokens[:, model.num_prefix_tokens:]`) a un decodificador tipo THUNDER, interpolando los logits a la resolución original de la máscara antes de calcular la pérdida.
- Recuperación de imágenes por similitud: indexar embeddings de teselas de una colección de portaobjetos y buscar casos histológicamente similares, útil para revisión de casos raros o control de calidad.
- Armonización multi-centro: procesar teselas de distintos escáneres con el mismo modelo para reducir el sesgo de dominio en estudios retrospectivos multicéntricos, dado el entrenamiento sobre PLISM.
- Preentrenamiento de modelos de supervivencia o pronóstico: usar los embeddings como representación congelada en modelos de miltiple-instancia (MIL) para predecir resultados clínicos a partir de portaobjetos completos.
- Detección de artefactos y control de calidad: comparar la distribución de embeddings de teselas nuevas frente a una referencia para señalar desviaciones por tinción deficiente o escáner mal calibrado.
- Extracción de características en pipelines de investigación: sustituir H-optimus-0 por este checkpoint sin cambios de código, manteniendo la dimensionalidad de 1.536 y la API de `timm`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el artículo está pendiente de publicación ("Paper coming soon") y no incluye métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.134 millones de parámetros en FP32, los pesos ocupan aproximadamente 4,5 GB; en FP16/BF16, unos 2,3 GB. A ello hay que sumar memoria de activaciones para lotes de teselas de 224 × 224.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM en FP16 para lotes pequeños; A100, H100 o L40S para procesar lotes grandes de teselas con alto throughput.
- GPU de consumo: cabe en RTX 4090 (24 GB) y en tarjetas de 8-12 GB como RTX 3060/4070 en FP16 con lotes reducidos.
- Opciones de despliegue: `timm` con `huggingface_hub` y `safetensors` (ruta oficial); también es posible exportar a TorchScript o ONNX, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.
- CPU: el modelo puede ejecutarse en CPU según la model card, con latencias muy superiores a GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Embedding | Licencia | Notas |
|---|---|---|---|---|---|
| H-optimus-0-SPECTRA | 1.134.774.272 | 224 × 224 | 1.536 | Apache 2.0 | Ajuste contrastivo multi-escáner (PLISM) |
| H-optimus-0 (Bioptimus) | no disponible en la información | 224 × 224 | 1.536 | no disponible en la información | Modelo base sin adaptación SPECTRA |
| Otros extractores de patología | no disponible | no disponible | no disponible | no disponible | Sin datos comparativos en la información disponible |

La comparación cuantitativa con alternativas como UNI, Virchow o Prov-GigaPath no puede realizarse con los datos disponibles, ya que no se han publicado benchmarks del ajuste SPECTRA.

## Limitaciones y advertencias

- Los embeddings son a nivel de tesela; las predicciones a nivel de portaobjetos requieren un modelo posterior (por ejemplo, MIL).
- El modelo está entrenado para H&E a 0,5 µm/píxel; otras tinciones o resoluciones quedan fuera de la distribución prevista.
- El cambio de configuración de `crop_pct=0.875` a `crop_pct=1.0` invalida embeddings cacheados con la versión anterior: es necesario recalcular embeddings y reentrenar decodificadores de segmentación.
- En segmentación, la máscara debe cubrir la misma región que la imagen; con reescalado de máscaras discretas hay que usar interpolación por vecino más cercano.
- Riesgo de sesgo por la composición del registro PLISM y de los datos originales de H-optimus-0, no documentada en la información disponible.
- No es un modelo generativo: no debe usarse para producir texto ni informes clínicos.
- Aunque la licencia es Apache 2.0, el uso clínico requiere validación regulatoria independiente; no se documentan garantías de rendimiento en entornos clínicos reales.
- El artículo asociado aún no está publicado, por lo que faltan detalles de entrenamiento y evaluación reproducibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/medarc/H-optimus-0-SPECTRA
- Modelo base H-optimus-0: https://huggingface.co/bioptimus/H-optimus-0
- MedARC: https://www.medarc.ai/
- Sophont: https://sophont.med/
- Artículo (pendiente de publicación, sin enlace disponible)
