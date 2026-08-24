# gatilin/sparklm-31m-tinystories

## Resumen

SparkLM-31M-TinyStories es un modelo de lenguaje causal pequeño, de aproximadamente 31 millones de parámetros, desarrollado por el usuario gatilin y publicado bajo licencia MIT. Está entrenado sobre el conjunto de datos TinyStories, un corpus sintético de cuentos infantiles generado con GPT-3.5 y GPT-4, diseñado para investigar la emergencia de capacidades lingüísticas en modelos pequeños. El checkpoint se distribuye como un directorio compatible con HuggingFace Transformers mediante código remoto (`trust_remote_code=True`), lo que permite cargarlo con `AutoModelForCausalLM`.

La relevancia de este modelo radica en su tamaño reducido y su arquitectura con atención latente multi-cabezal (MLA), una técnica que reduce el uso de memoria en la atención. Está pensado para reproducibilidad, pruebas de carga y experimentos ligeros de generación de texto, no como asistente alineado. El contexto de entrenamiento no se especifica en la documentación disponible, aunque por el tamaño y el dataset es presumiblemente corto. La pérdida reportada en el paso 199 es de 1,92, pero no se ofrecen métricas de evaluación adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con atención latente multi-cabezal (MLA) |
| Parametros totales | 30.814.720 (según model card); 34.091.520 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en precisión completa) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (con fallback a pytorch_model.bin) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 8 capas, tamaño oculto de 512 y 8 cabezas de atención. Emplea atención latente multi-cabezal (MLA), una variante que comprime las claves y valores en una representación latente compartida, reduciendo el costo de memoria en la generación. Tiene 2 cabezas de clave/valor (KV heads) y no utiliza mezcla de expertos (MoE) ni predicción multi-token (MTP). Tampoco aplica normalización Q/K.

El entrenamiento se realizó sobre el dataset TinyStories, un corpus de cuentos infantiles sintéticos. No se especifica el número de tokens ni la composición exacta del dataset. La model card indica que el checkpoint corresponde al paso 199 con una pérdida de 1,92, y advierte explícitamente que la pérdida de entrenamiento no es una métrica de benchmark y que deben publicarse resultados de evaluación por separado antes de comparar con otros modelos. El código de entrenamiento soporta paralelismo experto (expert-parallel) con una primitiva diferenciable all-to-all, aunque el modelo en sí no es MoE.

## Capacidades

- Generación de texto causal en inglés, con especialización en cuentos infantiles y narrativa corta.
- Reproducibilidad: el checkpoint está diseñado para pruebas de carga, smoke tests y verificación de pipelines de exportación a HuggingFace.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: ninguna declarada (sin modo thinking, sin visión, sin audio).

## Casos de uso

- Reproducibilidad de experimentos: permite verificar que el pipeline de exportación de SparkLM a Transformers funciona correctamente, cargando el modelo con `trust_remote_code=True` y ejecutando generación básica.
- Pruebas de humo en CI/CD: por su tamaño diminuto, puede integrarse en pipelines de integración continua para validar que el entorno de inferencia (GPU o CPU) está correctamente configurado.
- Investigación en modelos pequeños: sirve como punto de partida para estudiar la emergencia de capacidades lingüísticas en modelos de menos de 50M parámetros entrenados en dominios restringidos.
- Experimentos de fine-tuning: su licencia MIT y su tamaño permiten ajustarlo en hardware modesto para tareas específicas de generación de texto corto.
- Desarrollo de técnicas de atención eficiente: al incorporar MLA, puede usarse como banco de pruebas para comparar el rendimiento de esta arquitectura frente a atención estándar en modelos pequeños.
- Generación de cuentos infantiles: puede producir narrativas simples y coherentes en inglés, aunque sin garantías de calidad ni seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una entrada `model-index` vacía y advierte que la pérdida de entrenamiento no debe usarse como métrica comparativa. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (el modelo ocupa ~130 MB en pesos). Cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o integradas). No requiere GPU de datacenter.
- Compatibilidad con consumer GPU: sí, sin restricciones.
- Opciones de despliegue: se puede cargar con Transformers directamente (requiere `trust_remote_code=True`). No hay soporte nativo documentado para vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo pequeño podría convertirse a GGUF manualmente si se dispone del tokenizer adecuado.
- Latencia y throughput: no disponibles, pero por su tamaño se espera una generación de decenas de tokens por segundo en CPU y cientos en GPU.

## Comparativa con modelos similares

No hay datos suficientes para una comparativa cuantitativa con otros modelos. Existen otros modelos entrenados en TinyStories, como el TinyStories-LLM de NonsonoNicola (40M parámetros) o los modelos originales de Microsoft (1M, 3M, 8M, 28M), pero no se dispone de sus métricas en la información proporcionada. La comparativa cualitativa se limita a señalar que SparkLM-31M-TinyStories es uno de los pocos modelos TinyStories que incorpora MLA, lo que puede ofrecer ventajas de eficiencia de memoria frente a arquitecturas estándar.

## Limitaciones y advertencias

- No es un asistente alineado: la model card indica explícitamente que no es una release de seguridad y que carece de alineación downstream.
- Sesgos del dataset: TinyStories es un corpus generado por GPT-3.5/GPT-4, por lo que hereda sesgos y artefactos estilísticos de esos modelos. No debe usarse para tareas que requieran comprensión amplia del lenguaje.
- Riesgo de alucinación: al ser un modelo pequeño entrenado en un dominio restringido, puede generar texto incoherente o factualmente incorrecto fuera de narrativas infantiles.
- Longitud de contexto no documentada: no se especifica la ventana de contexto máxima, lo que dificulta su uso en tareas que requieran contexto largo.
- Dependencia de código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar código externo no auditado. Se recomienda revisar los archivos `modeling_sparklm.py` antes de usarlo en entornos de producción.
- Sin benchmarks públicos: no hay evidencia de rendimiento frente a otros modelos, por lo que no es adecuado para comparaciones rigurosas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gatilin/sparklm-31m-tinystories
- Otra variante del mismo autor: https://huggingface.co/gatilin/sparklm-31m-v260624
- Repositorio con variantes adicionales: https://huggingface.co/gatilin/sparklm-31m-all-v270707/tree/main
- Artículo sobre TinyStories (Medium): https://cobusgreyling.medium.com/tinystories-4ce620e569a4
- Proyecto TinyStories-LLM (GitHub): https://github.com/NonsonoNicola/TinyStories-LLM
- Nota sobre TinyStories (AIAny): https://aiany.app/item/tinystories
