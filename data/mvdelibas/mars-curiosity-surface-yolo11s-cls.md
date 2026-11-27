# mvdelibas/mars-curiosity-surface-yolo11s-cls

## Resumen
El modelo `mars-curiosity-surface-yolo11s-cls` es un clasificador de imágenes basado en la arquitectura Ultralytics YOLO11s-cls, ajustado por el usuario mvdelibas para clasificar imágenes del rover Curiosity de la NASA en 36 categorías de superficie marciana (tipos de terreno, partes del rover, instrumentos y objetivos de calibración). Resuelve la tarea de clasificación de superficie de Mars-Bench (`mb-surface_cls`), un conjunto de datos de referencia para visión artificial en ciencia planetaria.

El modelo parte de los pesos preentrenados oficiales de YOLO11s-cls y se reentrena sobre el conjunto Mars-Bench, publicado en Zenodo (DOI 10.5281/zenodo.15494647) bajo licencia CC BY 4.0. Con un tamaño de repositorio de 0.0 GB (pesos ligeros), está pensado para robótica y análisis de imágenes planetarias, no para uso general.

Su relevancia radica en que demuestra la aplicación de modelos de visión compactos a dominios científicos especializados, aunque con limitaciones severas en clases raras: el rendimiento macro (F1 73.8%) está muy por debajo de la precisión top-1 (90.3%) debido al fuerte desbalanceo de clases. Es un modelo de investigación, no apto para decisiones de misión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11s-cls (clasificación de imágenes) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224 px) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, tr (etiquetas de clase en turco) |
| Licencia | AGPL-3.0 (con atribución adicional CC BY 4.0 de los datos) |
| Formato de pesos | .pt (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento
El modelo emplea la arquitectura YOLO11s-cls de Ultralytics, una red convolucional para clasificación de imágenes con entrada de 224 píxeles. Se inicializa desde los pesos preentrenados oficiales de YOLO11s-cls y se ajusta (fine-tuning) sobre el conjunto de datos Mars-Bench `mb-surface_cls`, compuesto por imágenes de las cámaras Mastcam y MAHLI del rover Curiosity (NASA/JPL-Caltech/MSSS). El conjunto contiene 36 clases con un fuerte desbalanceo: desde 476 muestras para `zemin` (suelo) hasta 1 muestra para clases como `kol_kapagi` o `toz_temizleme_izi`.

No se dispone de información sobre el número total de tokens de entrenamiento, composición exacta del dataset, ni sobre el uso de RLHF/DPO (no aplica en clasificación de imágenes). El modelo card indica que el mejor resultado se obtuvo en la época 60, con un coste de entrenamiento de 1.21 CR (unidad de la plataforma de evaluación). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Clasificación de imágenes del rover Curiosity en 36 clases (tipos de terreno, partes del rover, instrumentos, objetivos de calibración).
- Etiquetas de clase en turco (p. ej., `zemin`, `kepce`, `matkap`, `ufuk`).
- Inferencia rápida y ligera gracias a la arquitectura YOLO11s-cls (224 px).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo generativo de texto ni multimodal en sentido amplio: solo clasificación de imagen única.
- Capacidades multilingües limitadas a la nomenclatura de clases (en/tr); no procesa lenguaje natural.

## Casos de uso
- Análisis automatizado de imágenes de archivo del rover Curiosity: clasificar grandes volúmenes de imágenes Mastcam/MAHLI en categorías de terreno e instrumentos para facilitar la búsqueda y el etiquetado previo.
- Asistencia a la navegación de rovers en investigación: usar la clasificación de terreno (suelo, roca, horizonte) como señal auxiliar en sistemas de percepción, siempre con validación adicional.
- Detección de instrumentos y partes del rover en imágenes: identificar `matkap` (taladro), `kepce` (cuchara), `mastcam_kamera`, etc., para auditoría de estado del rover.
- Verificación de objetivos de calibración: clasificar imágenes de calibración (`mastcam_kalibrasyon_hedefi`, `mahli_kalibrasyon_hedefi`, `chemcam_kalibrasyon_hedefi`) en pipelines de control de calidad de datos.
- Investigación en ciencia planetaria: servir como línea base para experimentos de clasificación de superficie en Marte y comparación con otros modelos en Mars-Bench.
- Docencia y prototipado en robótica: ejemplo práctico de fine-tuning de YOLO11 en un dominio científico con desbalanceo de clases, útil para enseñar técnicas de evaluación macro.

## Benchmarks y rendimiento

| Métrica (split de validación) | Valor |
|---|---|
| Top-1 accuracy | 90.3% |
| Top-5 accuracy | 98.8% |
| Macro F1 | 73.8% |
| Macro precision | 75.3% |
| Macro recall | 74.1% |

Rendimiento por clase (F1) destacado: `mahli_kamera` 100%, `mastcam_kamera` 100%, `rems_uv_sensoru` 100%, `apxs_spektrometre` 100%, `chemcam_kalibrasyon_hedefi` 100%, `numune_tupu_agzi` 100%, `toz_temizleme_araci` 100%, `apxs_kalibrasyon_hedefi` 100%; clases débiles: `tekerlek` 0%, `kol_kapagi` 0%, `serbest_kaya` 0%, `tekerlek_izi` 0%, `acik_renkli_damar` 0%, `toz_temizleme_izi` 0%, `uzak_manzara` 41.7%, `katmanli_kaya` 50%, `kum` 50%, `yakin_plan_kaya` 56.8%.

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible con precisión, pero al ser YOLO11s-cls (modelo pequeño, ~224 px) es apto para GPUs de consumo; típicamente < 2 GB en FP16.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 o superior, A100, H100) para lotes grandes; para inferencia individual basta CPU o GPU integrada.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM (RTX 2050, GTX 1650, etc.).
- Opciones de despliegue: Ultralytics (PyTorch), exportación a ONNX, TensorRT, OpenVINO (soportadas por Ultralytics); no se documenta soporte nativo en vLLM, llama.cpp u Ollama (no aplica a visión).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mars-curiosity-surface-yolo11s-cls | YOLO11s-cls | no disponible | 224 px | AGPL-3.0 | Hugging Face |
| YOLO11s-cls (oficial Ultralytics) | YOLO11s-cls | no disponible | 224 px | AGPL-3.0 | Ultralytics |
| Otros clasificadores Mars-Bench | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada. La comparación directa con otros modelos de clasificación de superficie marciana no está disponible.

## Limitaciones y advertencias
- Fuerte desbalanceo de clases: clases con 1-5 muestras (`tekerlek`, `kol_kapagi`, `tekerlek_izi`, `acik_renkli_damar`, `toz_temizleme_izi`, `serbest_kaya`) obtienen F1 de 0% en validación.
- Confusión entre tipos de roca (`yakin_plan_kaya`, `katmanli_kaya`, `serbest_kaya`) y con el suelo (`zemin`).
- El modelo asigna siempre una de sus 36 clases; ante imágenes de otro dominio el resultado es carente de sentido.
- Rendimiento real en otros sensores, regiones o estilos de imagen será inferior al de validación; se recomienda validar con datos propios.
- Uso exclusivamente de investigación: no debe emplearse para cartografía científica ni para decisiones de misión.
- Licencia AGPL-3.0: implica obligaciones de copyleft para uso en red; además, la licencia CC BY 4.0 de los datos exige mantener la atribución indicada.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en clases poco representadas.
- Idiomas: solo etiquetas en inglés/turco; no procesa texto ni lenguaje natural.

## Enlaces
- Hugging Face: https://huggingface.co/mvdelibas/mars-curiosity-surface-yolo11s-cls
- Dataset Mars-Bench (Zenodo): https://doi.org/10.5281/zenodo.15494647
- Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- Cita: Purohit, M.; Gajera, B.; Malaviya, V.; Mehta, I.; Kasodekar, K.; Adler, J.; Lu, S.; Rebbapragada, U.; Kerner, H. Mars-Bench: mb-surface_cls. Zenodo, 2025.
