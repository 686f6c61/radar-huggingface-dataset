# anmol-unitmole/data-to-text-executive-report-generator-flan-t5-base

## Resumen

El modelo `data-to-text-executive-report-generator-flan-t5-base` es un sistema de generación de texto a partir de tablas (table-to-text) desarrollado por Anmol Tripathi (anmol-unitmole) como parte del proyecto 04 de su repositorio encoder-decoder-projects. Se trata de un FLAN-T5 Base (248 millones de parámetros) fine-tuneado con LoRA para convertir tablas de KPIs en informes ejecutivos concisos y estructurados. El modelo no se presenta como un generador autónomo, sino como el componente central de un pipeline que incluye un verificador determinista de afirmaciones numéricas y referencias a filas, diseñado para mitigar alucinaciones en entornos de producción.

La relevancia de este modelo radica en su enfoque práctico para la generación controlada de informes: combina un generador neuronal con un verificador externo que bloquea o reemplaza afirmaciones no soportadas por los datos de origen. Según la evaluación publicada, el 100% de las afirmaciones mostradas al usuario final están respaldadas por las tablas de entrada, lo que lo hace adecuado para aplicaciones empresariales donde la exactitud numérica es crítica. El modelo está disponible bajo licencia Apache 2.0, con pesos en formato safetensors y una versión ONNX cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (base: google/flan-t5-base) |
| Parametros totales | 247.577.856 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | fuente: 1.280 tokens; destino: 512 tokens |
| Tipos de cuantizacion | INT8 (ONNX), FP32 (ONNX), BF16 (entrenamiento) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch), ONNX (FP32 e INT8) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura T5 (Text-to-Text Transfer Transformer) de Google, concretamente en la variante FLAN-T5 Base. Se trata de un modelo encoder-decoder denso con aproximadamente 248 millones de parámetros. El fine-tuning se realizó mediante LoRA (Low-Rank Adaptation) con rango 32, alpha 64 y dropout 0.05, sobre un subconjunto de 6.000 ejemplos de un corpus sintético de 20.000 pares tabla-informe. El entrenamiento se ejecutó durante 2 épocas con una tasa de aprendizaje de 3e-4, precisión BF16 y una GPU NVIDIA RTX 5090, alcanzando una pérdida final de entrenamiento de 1.0247 y de evaluación de 0.8505.

El dataset de entrenamiento fue generado sintéticamente con 159.327 afirmaciones verificadas al 100% y sin solapamiento entre splits (16.000 entrenamiento, 2.000 validación, 2.000 test). El sistema completo incorpora un verificador determinista que comprueba cada afirmación generada contra las filas y valores numéricos de la tabla de origen. Este verificador bloquea o reemplaza de forma determinista las afirmaciones no soportadas antes de mostrarlas al usuario, lo que explica que la tasa final de afirmaciones soportadas sea del 100% a pesar de que el generador crudo solo alcanza un 67,25% de soporte.

## Capacidades

- Generación de informes ejecutivos estructurados a partir de tablas de KPIs en formato CSV o JSON.
- Generación controlada con verificación numérica y referencias a filas (row-level source references).
- Salida en formato JSON válido (100% de validez en la evaluación).
- Soporte de normalización estructural para secciones de informe (cobertura final del 100%).
- Mitigación de alucinaciones mediante verificador externo (tasa de bloqueo del 32,75% sobre afirmaciones crudas).
- Capacidad multilingüe limitada al inglés (único idioma soportado).
- Exportación a ONNX (FP32 e INT8) para despliegue en entornos CPU o con aceleradores compatibles.

## Casos de uso

- Generación automática de informes de rendimiento empresarial: el modelo convierte tablas de KPIs (ventas, márgenes, crecimiento) en informes ejecutivos listos para presentación, ahorrando horas de redacción manual.
- Análisis de datos para directivos: integrado en herramientas de business intelligence, puede producir resúmenes narrativos de dashboards para revisión rápida por parte de la dirección.
- Verificación de afirmaciones en informes financieros: el pipeline con verificador garantiza que cada cifra mencionada en el informe esté respaldada por los datos de origen, reduciendo el riesgo de errores en auditorías.
- Automatización de reportes periódicos: empresas que generan informes mensuales o trimestrales pueden usar el modelo para producir borradores iniciales que luego son revisados por analistas.
- Generación de resúmenes de tablas en aplicaciones de consultoría: consultores pueden transformar datos de clientes en narrativas ejecutivas para entregables.
- Prototipado de sistemas data-to-text: sirve como referencia para investigadores que desarrollan sistemas de generación controlada con verificación de hechos.

## Benchmarks y rendimiento

La evaluación publicada se realizó sobre 250 ejemplos held-out del corpus de test. Los resultados principales son:

| Metrica | Resultado |
|---|---|
| BLEU | 71,46 |
| ROUGE-L | 0,8125 |
| BERTScore F1 | 0,9714 |
| Validez JSON | 100,00% |
| Claim F1 | 98,72% |
| Row-ID F1 | 98,72% |
| Structured-field F1 | 98,85% |
| Cobertura de secciones | 100,00% |
| Composite portfolio score | 84,78% |

En cuanto a facturidad, el generador crudo presenta una tasa de soporte del 67,25% y una facturidad numérica del 56,33%. Tras la intervención del verificador, la tasa final de afirmaciones soportadas alcanza el 100%, con una tasa de reemplazo determinista del 19,17%.

También se realizaron pruebas de paridad con ONNX (solo 5 ejemplos, no comparables estadísticamente): FP32 ONNX obtuvo BLEU 66,90 y ROUGE-L 0,7972; INT8 ONNX obtuvo BLEU 64,26 y ROUGE-L 0,7781. En este entorno local, la generación con ONNX en CPU fue más lenta que con PyTorch/CUDA (9,08 s/ejemplo vs 3,62 s/ejemplo).

## Requisitos de hardware

- El modelo tiene ~248 millones de parámetros, por lo que requiere aproximadamente 1 GB de VRAM en FP32, 0,5 GB en BF16 y 0,25 GB en INT8 para inferencia básica.
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.) es suficiente para inferencia en FP32. La RTX 5090 utilizada en entrenamiento es sobredimensionada para inferencia.
- Es compatible con GPUs de consumo (serie RTX 30/40/50) y también puede ejecutarse en CPU con el formato ONNX, aunque con mayor latencia.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, y cualquier framework compatible con safetensors. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la documentación.
- Latencia medida: 3,62 s/ejemplo en PyTorch/CUDA (RTX 5090), 9,08 s/ejemplo en FP32 ONNX CPU y 8,91 s/ejemplo en INT8 ONNX CPU.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos publicados contra otros modelos de data-to-text en la información proporcionada. El modelo base `google/flan-t5-base` es un generador generalista que no está especializado en tablas; este fine-tuning lo adapta específicamente a la tarea. Alternativas genéricas como T5-small o BART podrían utilizarse para la misma tarea, pero no se han publicado comparaciones directas. La licencia Apache 2.0 y el tamaño compacto lo hacen más accesible que modelos de mayor escala, aunque su rendimiento en tareas generales de lenguaje será inferior al de modelos como FLAN-T5-Large o GPT-3.5.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no soporta otros idiomas.
- La generación cruda presenta una tasa de alucinación del 32,75% sin el verificador, por lo que no debe usarse como generador autónomo en producción sin el pipeline de verificación.
- La facturidad numérica cruda es solo del 56,33%, lo que indica que el modelo puede inventar cifras si se usa sin control.
- El dataset es sintético y puede no reflejar la diversidad de formatos de tablas reales en entornos empresariales.
- La evaluación ONNX se realizó con solo 5 ejemplos, por lo que los resultados de paridad no son concluyentes.
- No se han publicado resultados en benchmarks generales como MMLU o HumanEval; su evaluación se limita a la tarea específica de data-to-text.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anmol-unitmole/data-to-text-executive-report-generator-flan-t5-base
- Repositorio GitHub del proyecto: https://github.com/unit-mole/encoder-decoder-projects/tree/main/04-data-to-text-executive-report-generator
- Perfil del autor: https://huggingface.co/anmol-unitmole
