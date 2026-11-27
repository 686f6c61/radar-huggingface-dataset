# gatilin/wemm-video-35ba3b-vision-encoder

## Resumen

El modelo `gatilin/wemm-video-35ba3b-vision-encoder` es un componente extraído del modelo multimodal `tencent/WeMM-Video-35BA3B`. No se trata de un modelo completo, sino de un export de investigación que contiene exclusivamente el torre de visión (`model.visual.*`) del modelo original: el codificador de parches de píxeles, la torre de 27 capas y el fusionador espacial. Lo publica el usuario `gatilin` bajo licencia Apache-2.0, conservando la atribución al modelo fuente de Tencent.

El componente resuelve un problema muy concreto: permitir a investigadores y desarrolladores reutilizar el codificador visual de WeMM-Video sin cargar el resto del modelo multimodal (encoder de audio, modelo de lenguaje, módulo de sincronización y capacidades de chat audio-vídeo). Con 446.571.248 parámetros en BF16 (333 tensores), es un extracto ligero en comparación con el modelo completo de 35B, y encaja en la categoría de extracción de características de imagen (`image-feature-extraction`).

Su relevancia es acotada: se publica como export de investigación con validación limitada (dos imágenes COCO a 224×224 y comprobación de atención frente a SDPA), y no valida rendimiento audiovisual ni calidad de tarea extremo a extremo. Es útil para quien necesite el torre visual de WeMM-Video de forma aislada, no como sustituto del modelo multimodal completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Torre de visión transformer de 27 capas con codificador de parches de píxeles y fusionador espacial (componente extraído de un modelo multimodal) |
| Parámetros totales | 446.571.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos originales en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (333 tensores BF16) |

## Arquitectura y entrenamiento

El componente es una torre de visión de 27 capas con 16 cabezas de atención y anchura oculta de 1152; el fusionador espacial produce una salida de anchura 2048. Incluye el codificador de parches de píxeles y el fusionador espacial, y conserva claves, formas, dtype y valores de los tensores originales del modelo fuente `tencent/WeMM-Video-35BA3B` (revisión `c20f1842f365616d6a13ed6937e88488ca53d9b3`). El código de `component.py` instancia la implementación visual oficial desde `native_source/` y carga estrictamente los tensores visuales; `source_config.json` y `preprocessor_config.json` conservan la configuración de origen.

No se proporcionan datos sobre el entrenamiento del modelo fuente (número de tokens, composición del dataset, RLHF/DPO) ni innovaciones técnicas más allá de la propia extracción de componentes. La validación realizada incluye dos imágenes COCO redimensionadas a 224×224 (por debajo del mínimo del procesador de origen) con pasadas estrictas de forward visual en FP32 sobre CPU, y comprobación de que la atención explícita coincide con SDPA en las capas primera, intermedia y final. El autor advierte que esta validación no cubre audio, rendimiento vídeo-lenguaje ni calidad de tarea extremo a extremo.

## Capacidades

- Extracción de características de imagen (`image-feature-extraction`) mediante el torre de visión.
- Codificación de parches de píxeles y fusión espacial para producir representaciones visuales de anchura 2048.
- Forward visual en FP32 sobre CPU verificado con imágenes reales.
- Coincidencia de atención explícita con SDPA en capas primera, intermedia y final.
- No incluye encoder de audio, modelo de lenguaje, módulo de sincronización ni chat audio-vídeo completo.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni modos de razonamiento.
- No se documentan capacidades de visión más allá de la extracción de características.

## Casos de uso

- Investigación sobre codificadores visuales: permite estudiar el torre visual de WeMM-Video de forma aislada, sin cargar el modelo multimodal completo, gracias a sus 446 millones de parámetros y a la conservación exacta de pesos.
- Extracción de características para pipelines de visión: se puede usar como extractor de representaciones visuales de anchura 2048 en tareas posteriores (clasificación, recuperación, alineamiento multimodal), al ser un componente autocontenido con configuración de origen.
- Reproducibilidad y auditoría de pesos: al preservar claves, formas y valores de los tensores originales, sirve para verificar la integridad de extracciones y comparar con el modelo fuente.
- Comparación entre torres visuales: el autor documenta una comparación con el torre visual de 9B (331 tensores de misma forma con valores distintos y dos tensores del fusionador con formas distintas en `wemm9b_comparison.json`), útil para estudiar diferencias entre variantes.
- Desarrollo de prototipos multimodales: integrable en arquitecturas propias que necesiten un codificador visual preentrenado de origen conocido, con licencia Apache-2.0 y atribución conservada.
- Validación de implementaciones de atención: los chequeos de atención explícita frente a SDPA permiten usar el componente como referencia para probar kernels de atención en el torre visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en BF16 para los pesos (446,6 M de parámetros); el repo ocupa 0,9 GB.
- GPU recomendadas: no disponible; el autor solo documenta forward en FP32 sobre CPU.
- ¿Cabe en GPU de consumo? Sí, por tamaño de pesos (menos de 1 GB en BF16), aunque no se documentan pruebas en GPU concretas.
- Opciones de despliegue: no disponible; el componente se carga mediante `component.py` con la implementación oficial en `native_source/`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gatilin/wemm-video-35ba3b-vision-encoder | 446.571.248 | no disponible | Apache-2.0 | Hugging Face |
| tencent/WeMM-Video-35BA3B (modelo completo) | 35B (aproximado, según nombre) | no disponible | Apache-2.0 | Hugging Face |
| Torre visual de WeMM-Video 9B (referenciado en `wemm9b_comparison.json`) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para comparar; la comparación con el torre de 9B es de pesos exactos, no de similitud representacional.

## Limitaciones y advertencias

- No es un modelo completo: excluye encoder de audio, modelo de lenguaje, sincronización y chat audio-vídeo.
- La validación es limitada: dos imágenes COCO a 224×224 y comprobación de atención; no cubre audio, vídeo-lenguaje ni calidad extremo a extremo.
- Las imágenes de validación están por debajo del mínimo del procesador de origen.
- No se documentan sesgos, riesgo de alucinación ni limitaciones de idioma.
- No se documentan restricciones de licencia más allá de Apache-2.0; se debe preservar la atribución y avisos del modelo fuente.
- Los shards completos del origen no se descargaron ni hashearon de forma independiente; la verificación se apoya en metadatos LFS y en la caché de rangos del espejo de ModelScope.
- Uso previsto como export de investigación, no como componente listo para producción sin validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/wemm-video-35ba3b-vision-encoder
- Modelo base: https://huggingface.co/tencent/WeMM-Video-35BA3B
- Revisión del modelo base: `c20f1842f365616d6a13ed6937e88488ca53d9b3`
- Archivos de validación y comparación citados: `validation.json`, `wemm9b_comparison.json`, `component.py`, `native_source/`, `source_config.json`, `preprocessor_config.json`
