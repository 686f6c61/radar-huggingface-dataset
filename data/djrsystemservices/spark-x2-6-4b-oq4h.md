# djrsystemservices/Spark-X2.6-4B-oQ4h

## Resumen

Spark-X2.6-4B-oQ4h es una conversión cuantizada del checkpoint Spark-X2.6-4B-bf16, publicada por el usuario djrsystemservices en Hugging Face. No se trata de un modelo original, sino de una redistribución en formato MLX con cuantización oQ4h (4 bits con rotación de Hadamard) generada mediante la herramienta oMLX 0.8.2. El modelo base pertenece al repositorio XHToken/Spark-X2.6-4B, del que no se dispone de model card pública en la información proporcionada.

El interés técnico de esta ficha reside en el pipeline de cuantización: oQh almacena las capas lineales del decodificador como códigos rotados con Hadamard, con un plan por capa registrado en `config.json` y un informe de calibración por imatrix en `oq_imatrix_report.json`. La calibración se realizó con 128 muestras de 512 tokens. El resultado pesa 2,5 GB en el repositorio y declara 936.178.176 parámetros en los safetensors, un dato que no concuerda con la nomenclatura "4B" del nombre del modelo.

La relevancia es limitada y debe enmarcarse con cautela: el repositorio tiene cero descargas y cero likes, no declara licencia ni idiomas, y la información sobre el modelo base es prácticamente inexistente. Es un artefacto útil para quienes quieran inspeccionar el formato oQh en MLX, pero no una opción recomendable para producción sin verificar antes el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del tag `spark2_5` sugiere una familia "Spark", sin confirmar) |
| Parametros totales | 936.178.176 según safetensors; el nombre del modelo indica "4B" (discrepancia no resuelta) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, esquema oQ4h con `hadamard=True`; calibración imatrix con 128 muestras × 512 tokens |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del modelo original, que no se especifica) |
| Formato de pesos | safetensors en formato MLX (`model.safetensors` o shards `model-*-of-*.safetensors`), más `config.json`, `model.safetensors.index.json` y `oq_imatrix_report.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. El tag `spark2_5` y la referencia al checkpoint `Spark-X2.6-4B-bf16` apuntan a una familia denominada Spark, pero la model card no describe si se trata de un transformer denso, un MoE o una arquitectura híbrida. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación documentada es exclusivamente la del proceso de cuantización. oQh convierte las capas lineales del decodificador en códigos rotados mediante una transformada de Hadamard, lo que redistribuye la energía de los pesos y reduce el error de cuantización en 4 bits. El plan por capa y el formato de los códigos quedan registrados en `config.json`, mientras que `oq_imatrix_report.json` recoge la calibración de importancia por imatrix. La conversión se ejecuta con `run_oqe_conversion.py` y los parámetros `--oq-level 4.0 --hadamard --imatrix-samples 128 --imatrix-seq-length 512`.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de lenguaje, pero no documentada en la model card.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución en Apple Silicon: el formato MLX está diseñado para inferencia en chips de Apple, lo que constituye la única capacidad operativa verificable.

## Casos de uso

- Evaluación del formato oQh en MLX: cargar el modelo con la librería MLX y comparar la perplejidad frente al checkpoint bf16 original para medir la degradación introducida por la cuantización a 4 bits con Hadamard.
- Prototipado local en Mac: desplegar el modelo en un equipo con Apple Silicon para experimentar con generación de texto en local, aprovechando el tamaño reducido de 2,5 GB del repositorio.
- Investigación sobre cuantización: usar `oq_imatrix_report.json` como caso de estudio para analizar cómo la calibración imatrix distribuye la importancia entre capas en un modelo concreto.
- Pruebas de integración de MLX: validar pipelines de carga, tokenización e inferencia en MLX antes de migrar a modelos mayores del mismo ecosistema.
- Reproducción del pipeline de conversión: reutilizar el comando documentado para cuantizar otros checkpoints bf16 con oMLX 0.8.2 y comparar resultados entre configuraciones de Hadamard.
- Docencia y formación: ilustrar en un curso o taller el flujo completo de cuantización de un modelo de lenguaje, desde el checkpoint original hasta el artefacto MLX listo para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2,5 GB, por lo que la inferencia en 4 bits debería caber holgadamente en memoria unificada de 8 GB o más; no se dispone de mediciones oficiales.
- GPU recomendadas: el formato MLX está orientado a Apple Silicon (series M1, M2, M3, M4). No se documenta soporte para CUDA ni para GPUs NVIDIA (A100, H100, RTX 4090).
- Cabe en GPU de consumo: en el ecosistema Apple, sí en equipos con memoria unificada suficiente; en GPUs de consumo con CUDA, no hay soporte documentado.
- Opciones de despliegue: librería MLX y herramientas compatibles con oMLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma familia, tamaño o tarea, y el modelo base carece de datos públicos verificables en este repositorio.

## Limitaciones y advertencias

- Discrepancia de tamaño: el nombre indica "4B" pero los safetensors declaran 936.178.176 parámetros; conviene verificar el checkpoint original antes de asumir cualquier cifra.
- Licencia no declarada: la model card remite a la licencia del modelo original (XHToken/Spark-X2.6-4B), que no se especifica. No se puede garantizar el uso comercial.
- Idiomas no declarados: se desconoce el soporte multilingüe y la calidad en castellano.
- Riesgo de alucinación: inherente a los modelos de lenguaje y no cuantificado para este checkpoint.
- Sesgos: no documentados; al ser una conversión de un modelo base sin información pública, no hay evaluación de sesgos disponible.
- Degradación por cuantización: la conversión a 4 bits introduce pérdida de calidad frente al bf16 original; no se publican métricas de dicha degradación.
- Repositorio sin tracción: cero descargas y cero likes, lo que reduce la probabilidad de que los problemas se hayan detectado y corregido por la comunidad.
- Dependencia de código personalizado: el tag `custom_code` implica que la carga requiere el código de oMLX; sin él, el modelo no es utilizable de forma estándar.
- Ecosistema restringido: el formato MLX limita el despliegue a Apple Silicon, lo que excluye la mayoría de infraestructuras de servidores con GPU NVIDIA.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/djrsystemservices/Spark-X2.6-4B-oQ4h
- Modelo original: https://huggingface.co/XHToken/Spark-X2.6-4B
