# metajazz/Qwen3.8-27B-oQ6-fp16

## Resumen

El modelo `metajazz/Qwen3.8-27B-oQ6-fp16` es una cuantización mixta de 6 bits (grupo de 64) aplicada sobre un modelo de la familia Qwen, identificado en el nombre como "Qwen3.8-27B". La cuantización se realizó con la herramienta oQ (oMLX v0.6.0.dev1), que produce pesos en formato MLX safetensors, diseñado para ejecutarse de forma eficiente en hardware Apple Silicon mediante el framework MLX. El repositorio no incluye información sobre el modelo base, su licencia, idiomas soportados ni pipeline de uso, lo que limita la evaluación directa de sus capacidades.

Según los datos reales de los safetensors, el número de parámetros totales es de 6.476.406.000 (aproximadamente 6,5 mil millones), lo que contradice la denominación "27B" del nombre. Esta discrepancia no está aclarada por el autor y podría deberse a un error en el etiquetado o a una subida parcial de los pesos. El tamaño del repositorio es de 23,3 GB, coherente con un modelo de ~6,5B parámetros en precisión mixta fp16/6 bits.

Dado que no se dispone de model card descriptiva, esta ficha se basa únicamente en los metadatos del repositorio y en las características generales de las cuantizaciones oQ. Se recomienda precaución antes de usar el modelo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, sin confirmar) |
| Parametros totales | 6.476.406.000 (segun safetensors; el nombre indica 27B, discrepancia sin resolver) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64, precision mixta (oQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados para el modelo base. La única referencia es que pertenece a la familia "qwen3_5" según la etiqueta del modelo, lo que sugiere una arquitectura transformer, probablemente similar a otros modelos Qwen. La cuantización oQ aplica una mezcla de precisión (fp16 para capas críticas y 6 bits para el resto) con grupo de 64, lo que reduce el tamaño y acelera la inferencia en MLX sin una degradación significativa del rendimiento, según la documentación de oMLX. No hay datos sobre RLHF, DPO u otras técnicas de alineación.

## Capacidades

- No se han documentado capacidades específicas en el repositorio.
- Al ser una cuantización de un modelo Qwen, se espera que mantenga las capacidades generales de generación de texto, razonamiento y posiblemente código, pero no hay confirmación.
- No se indica soporte para tool calling, agentes, visión o audio.
- El formato MLX limita su uso a entornos Apple Silicon; no es directamente compatible con otras plataformas sin conversión.

## Casos de uso

- Inferencia local en Macs con Apple Silicon: el formato MLX está optimizado para esta plataforma, permitiendo ejecutar el modelo con recursos moderados de memoria unificada.
- Prototipado y experimentación: útil para desarrolladores que deseen probar la cuantización oQ en modelos de tamaño medio sin necesidad de GPUs dedicadas.
- Aplicaciones de generación de texto en entornos con restricciones de hardware, siempre que se acepte la falta de documentación sobre licencia y capacidades.
- Investigación sobre técnicas de cuantización: sirve como ejemplo de aplicación de oQ con grupo 64 y 6 bits, aunque no se aportan métricas de calidad.
- Integración en pipelines MLX existentes: puede usarse con la librería mlx y omlx para cargar y ejecutar el modelo.
- Despliegue en dispositivos edge de Apple (Mac, iPad) donde se requiera un modelo de ~6,5B parámetros en formato compacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. La ausencia de datos impide evaluar el impacto de la cuantización en la calidad del modelo.

## Requisitos de hardware

- Al ser formato MLX, se requiere hardware Apple Silicon (M1, M2, M3 o posteriores).
- El tamaño del repositorio es de 23,3 GB, pero el modelo en memoria ocupará aproximadamente 6,5B parámetros × 6 bits ≈ 4,9 GB, más overhead de fp16 en algunas capas, estimando un uso de RAM unificada de 8-12 GB.
- Se recomienda al menos 16 GB de memoria unificada para una inferencia fluida con contexto moderado.
- No es compatible con CUDA o ROCm sin conversión a otros formatos (por ejemplo, GGUF).
- Opciones de despliegue: librería mlx y omlx para carga y ejecución; no se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Dado que el modelo base no está claramente identificado, no es posible establecer una comparativa fiable con otras cuantizaciones de Qwen3-27B u otros modelos de tamaño similar. Se recomienda consultar la documentación de oMLX para conocer las alternativas de cuantización.

## Limitaciones y advertencias

- Discrepancia en el número de parámetros: el nombre indica 27B pero los safetensors muestran 6,5B; esto puede deberse a un error del autor o a una subida incompleta.
- Licencia desconocida: no se especifica, por lo que no se puede garantizar su uso comercial o distribución.
- Sin documentación de capacidades ni limitaciones del modelo base.
- Riesgo de alucinación y sesgos: al no conocer el entrenamiento, no se pueden evaluar estos aspectos.
- Formato propietario (MLX): limita la portabilidad a otras plataformas.
- Sin benchmarks, no se puede validar la calidad de la cuantización frente a la versión original.
- El modelo fue creado en 2026-08-15, con fecha futura respecto a la actual (2025), lo que sugiere un posible error en la fecha de creación o un modelo hipotético.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/metajazz/Qwen3.8-27B-oQ6-fp16)
- [oQ / oMLX (GitHub)](https://github.com/jundot/omlx)
