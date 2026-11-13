# hsafaai/vdc-linear-grid-pilot

## Resumen

VDC linear-grid pilot es un checkpoint de inicialización de entrenamiento publicado por el autor Houman Safaai bajo el identificador `hsafaai/vdc-linear-grid-pilot`. No es un modelo generativo ni un estimador listo para producción: es el punto de partida de 60.000 pasos del que se afinan los dos estimadores presentados en el artículo de NeurIPS 2026 *Amortized Vine Copulas for High-Dimensional Density and Information Estimation* (arXiv:2604.20568), concretamente VDC-64 y VDC-128. Su función es permitir la reproducción exacta del proceso de fine-tuning.

El modelo implementa un denoiser VDC con arquitectura U-Net y 132.953.729 parámetros, entrenado sobre objetivos de masa celular exacta de cópulas sintéticas corregidas. Se distribuye como un fichero PyTorch (`vdc-linear-grid-pilot.pt`, 0,5 GB) con pesos de media móvil exponencial, bajo licencia MIT y con la librería `vine-denoising-copula` v0.3.0 o superior como único entorno de uso previsto.

Su relevancia es acotada y muy específica: sirve a investigadores que quieran replicar o extender el pipeline de estimación de densidades de alta dimensión mediante cópulas vine amortizadas. Para cualquier tarea de inferencia, el propio autor remite a los modelos afinados (`vdc-denoiser-m64-v2`, `vdc-denoiser-m128-v2` o `vdc-denoiser-m64-v1`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net denoiser VDC (vine denoising copula) |
| Parametros totales | 132.953.729 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en punto flotante PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, checkpoint con pesos EMA) |

## Arquitectura y entrenamiento

El checkpoint contiene un denoiser VDC con arquitectura U-Net de 132.953.729 parámetros. El entrenamiento parte de pesos aleatorios y se extiende durante 60.000 pasos sobre objetivos de masa celular exacta de cópulas sintéticas corregidas, empleando un banco de 200.000 rejillas objetivo construidas a partir de la semilla 42. La configuración incluye batch de 128, tasa de aprendizaje de 2e-4 con 2.000 pasos de warm-up y media móvil exponencial de 0,9995. Todo el cómputo se realizó en una única GPU H200 en aproximadamente 1,7 horas.

La innovación técnica del enfoque es la amortización de cópulas vine: en lugar de ajustar una cópula vine por instancia, el denoiser aprende a producir estimaciones de densidad de forma amortizada sobre rejillas lineales de alta dimensión. El checkpoint publicado corresponde al piloto de inicialización; los modelos finales se obtienen afinando desde este punto con las recetas `linear_grid_vdc64_v2.yaml` y `linear_grid_vdc128_v2.yaml` de la librería `vine-denoising-copula`.

## Capacidades

- Estimación de densidad de alta dimensión mediante cópulas vine amortizadas (función objetivo del modelo, no uso directo de este checkpoint).
- Estimación de información mutua y magnitudes derivadas en el marco del artículo asociado.
- Punto de inicialización reproducible para fine-tuning de los estimadores VDC-64 y VDC-128.
- Verificación de integridad mediante hash SHA-256 (`6e48f8c65012f4170ee9003c4aca28600abdb602ef624e47c3c3f92c0f5ace20`) en las recetas de entrenamiento.
- No soporta generación de texto, tool calling, agentes, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción exacta del entrenamiento: investigadores que quieran replicar los resultados del artículo de NeurIPS 2026 pueden partir de este checkpoint y ejecutar `scripts/train_linear_grid_estimator.py` con las recetas proporcionadas, obteniendo los mismos estimadores VDC-64 y VDC-128.
- Fine-tuning de estimadores de densidad: el checkpoint sirve como inicialización para adaptar el denoiser a nuevos bancos de rejillas objetivo o dominios de cópulas distintos de los sintéticos originales.
- Auditoría de metodología: al publicarse con hash verificado y configuración de entrenamiento completa, permite auditar la reproducibilidad de un pipeline de estimación de densidades en alta dimensión.
- Investigación en cópulas vine amortizadas: base para experimentos que comparen variantes de arquitectura o estrategias de entrenamiento partiendo de un estado ya preentrenado en lugar de pesos aleatorios.
- Docencia y formación: ejemplo práctico de pipeline de entrenamiento con EMA, warm-up y verificación de checkpoints en un contexto de estimación estadística no generativa.
- Desarrollo de la librería `vine-denoising-copula`: sirve como fixture de prueba para validar las recetas de fine-tuning y la comprobación de hashes en versiones futuras de la librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de estimación para este checkpoint, y el autor indica explícitamente que no debe usarse para análisis, sino únicamente como inicialización de entrenamiento.

## Requisitos de hardware

- El checkpoint ocupa 0,5 GB en disco; la inferencia o el fine-tuning requieren cargar los 132.953.729 parámetros en memoria (aproximadamente 0,5 GB en fp32, sin contar activaciones).
- El entrenamiento original se realizó en una única GPU NVIDIA H200 durante unas 1,7 horas para 60.000 pasos con batch 128.
- No se especifican requisitos de VRAM para fine-tuning en GPU de consumo; el tamaño del modelo sugiere que cabría en GPUs consumer con suficiente memoria, pero no hay datos publicados al respecto.
- Despliegue previsto mediante la librería `vine-denoising-copula` v0.3.0 o superior y los scripts `train_linear_grid_estimator.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- No se publican datos de latencia ni throughput para inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Estado |
|---|---|---|---|---|---|
| vdc-linear-grid-pilot | 132.953.729 | no disponible | Inicializacion de entrenamiento | MIT | Publicado |
| vdc-denoiser-m64-v2 (VDC-64) | no disponible | no disponible | Estimador afinado para inferencia | no disponible | Publicado |
| vdc-denoiser-m128-v2 (VDC-128) | no disponible | no disponible | Estimador afinado para inferencia | no disponible | Publicado |
| vdc-denoiser-m64-v1 | no disponible | no disponible | Estimador para inferencia | no disponible | Publicado |

Los tres modelos afinados pertenecen al mismo autor y familia; no se dispone de datos de parámetros, contexto ni rendimiento para ellos en la información proporcionada. No se identifican alternativas externas comparables en la información disponible.

## Limitaciones y advertencias

- No es un estimador utilizable para análisis: el autor indica explícitamente que debe usarse únicamente como inicialización de entrenamiento y remite a los modelos afinados para inferencia.
- No es un modelo de lenguaje: carece de capacidades de generación de texto, razonamiento, código, visión o multilingüismo.
- Dependencia estricta de la librería `vine-denoising-copula` v0.3.0 o superior y de las recetas de fine-tuning concretas; el uso fuera de ese entorno no está documentado.
- El entrenamiento se realizó exclusivamente sobre cópulas sintéticas corregidas (semilla 42); no hay evidencia publicada sobre su comportamiento en datos reales.
- No se publican métricas de calidad, sesgos ni riesgos de alucinación aplicables, al no tratarse de un modelo generativo.
- La licencia MIT permite uso comercial, pero el modelo no está pensado para producción y su valor práctico fuera de la reproducción científica es nulo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados.

## Enlaces

- Hugging Face: https://huggingface.co/hsafaai/vdc-linear-grid-pilot
- Modelo afinado VDC-64: https://huggingface.co/hsafaai/vdc-denoiser-m64-v2
- Modelo afinado VDC-128: https://huggingface.co/hsafaai/vdc-denoiser-m128-v2
- Modelo de inferencia VDC-64 v1: https://huggingface.co/hsafaai/vdc-denoiser-m64-v1
- Repositorio de la librería: https://github.com/KempnerInstitute/vine-denoising-copula
- Documentación de estimadores line-grid: https://github.com/KempnerInstitute/vine-denoising-copula/blob/main/docs/IMPROVED_ESTIMATORS.md
- Artículo: arXiv:2604.20568, *Amortized Vine Copulas for High-Dimensional Density and Information Estimation* (Safaai, NeurIPS 2026)
