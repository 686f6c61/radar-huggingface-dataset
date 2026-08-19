# mradermacher/L3.1-Haggardv1-12B-i1-GGUF

## Resumen

El repositorio `mradermacher/L3.1-Haggardv1-12B-i1-GGUF` contiene cuantizaciones GGUF del modelo `L3.1-Haggardv1-12B`, desarrollado originalmente por `kromcomp` y disponible en Hugging Face. Se trata de un modelo de lenguaje de aproximadamente 12 mil millones de parámetros, cuyo nombre sugiere una base sobre la arquitectura Llama 3.1, aunque no se ha confirmado oficialmente. El autor `mradermacher` es conocido por publicar conversiones a formato GGUF con cuantización por imatrix, lo que permite ejecutar modelos grandes en hardware de consumo con pérdida controlada de precisión.

La relevancia de este repositorio radica en que ofrece múltiples niveles de cuantización (desde Q2_K hasta Q6_K) para adaptarse a diferentes capacidades de GPU y requisitos de calidad. Al ser una versión GGUF, es compatible con herramientas como llama.cpp, Ollama y vLLM, facilitando su uso en entornos de producción y desarrollo. Sin embargo, la información pública sobre el modelo base es escasa: no se especifican licencia, idiomas, ni detalles de entrenamiento, lo que limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (nombre sugiere base Llama 3.1, sin confirmar) |
| Parametros totales | 11.956.277.312 (aprox. 12B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con cuantizacion imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo original `L3.1-Haggardv1-12B`. El nombre sugiere una base sobre Llama 3.1 (probablemente la variante de 12B), pero no hay confirmación oficial. El repositorio actual es una conversión a GGUF realizada por `mradermacher`, que aplica cuantización con imatrix (importancia matrix) para optimizar la calidad de los pesos cuantizados. No se conocen los datos de entrenamiento, el número de tokens procesados ni si se utilizaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del modelo base.

## Capacidades

No se han publicado capacidades específicas del modelo en la información disponible. Al tratarse de una cuantización de un modelo de 12B, es probable que tenga capacidades generales de generación de texto, razonamiento y posiblemente código, pero no hay datos confirmados. No se puede afirmar soporte de tool calling, agentes, visión o audio sin evidencia.

## Casos de uso

Dada la falta de información sobre el modelo base, no es posible recomendar casos de uso concretos con garantías. Sin embargo, por su tamaño (12B) y formato GGUF, podría emplearse en entornos donde se requiera un modelo de lenguaje de tamaño medio con despliegue local, como:

- Prototipado de aplicaciones de chat o generación de texto en entornos con recursos limitados.
- Experimentación con cuantizaciones para evaluar el equilibrio entre calidad y consumo de memoria.
- Uso como base para fine-tuning posterior si se dispone de los pesos originales (no incluidos aquí).

Se recomienda consultar la documentación del modelo original en `kromcomp/L3.1-Haggardv1-12B` para conocer sus capacidades reales antes de adoptarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras pruebas estándar para este modelo ni para sus cuantizaciones.

## Requisitos de hardware

Los requisitos dependen de la cuantización elegida. Para un modelo de 12B parámetros, las estimaciones aproximadas de VRAM son:

- Cuantizaciones Q2_K / IQ2_M: aproximadamente 5-6 GB, ejecutable en GPUs con 8 GB (RTX 3060, RTX 4060).
- Cuantizaciones Q4_K_M / Q4_K_S: aproximadamente 7-8 GB, recomendable GPU con 10-12 GB (RTX 3080, RTX 4070).
- Cuantizaciones Q5_K_M / Q6_K: aproximadamente 9-11 GB, requiere GPU con 12-16 GB (RTX 4080, A100 40GB).

Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), text-generation-webui. La latencia y el throughput dependen del hardware y la cuantización; no se dispone de mediciones concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base `L3.1-Haggardv1-12B` no tiene documentación pública que permita establecer comparaciones objetivas con Llama 3.1 8B, Mistral 7B o modelos similares. Se recomienda consultar directamente el repositorio original.

## Limitaciones y advertencias

- No se conoce la licencia del modelo original; su uso comercial podría estar restringido. Verificar antes de desplegar.
- La cuantización introduce pérdida de calidad, especialmente en niveles bajos (Q2, IQ1). Evaluar la degradación en tareas específicas.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas. El modelo podría presentar comportamientos no deseados.
- La ausencia de datos de entrenamiento y evaluación impide garantizar su fiabilidad en entornos de producción.
- El repositorio es una conversión de terceros; el autor original no ha validado estas cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/L3.1-Haggardv1-12B-i1-GGUF
- Modelo original (referencia): https://huggingface.co/kromcomp/L3.1-Haggardv1-12B
