# mradermacher/qwen-38-27b-surgery-patient-GGUF

## Resumen

`mradermacher/qwen-38-27b-surgery-patient-GGUF` es un repositorio de cuantizaciones estáticas en formato GGUF, generado por mradermacher a partir del modelo base `skp24/qwen-38-27b-surgery-patient`. No se trata de un modelo original, sino de una conversión y cuantización de pesos para su uso con llama.cpp y herramientas compatibles con GGUF. El nombre del modelo base sugiere un ajuste fino sobre una base Qwen, pero los detalles de arquitectura, entrenamiento y propósito no están documentados en la información disponible.

El dato más relevante y verificable es el número de parámetros totales reportado a partir de los safetensors del modelo original: 460.730.096 parámetros, es decir, aproximadamente 0,46 mil millones de parámetros. Esto contradice la etiqueta "27b" del nombre del repositorio, que sugiere 27 mil millones de parámetros. Esta discrepancia es importante y debe tenerse en cuenta antes de cualquier uso: el tamaño real de los pesos no coincide con lo que el nombre indica.

El repositorio tiene 1,6 GB de tamaño total, lo cual es coherente con un modelo de unos 460 millones de parámetros cuantizado en varios formatos GGUF. No hay información sobre licencia, idiomas, pipeline ni resultados de benchmarks. El modelo fue creado el 5 de noviembre de 2026 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere base Qwen, sin confirmar) |
| Parametros totales | 460.730.096 (según safetensors del modelo base) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con llama.cpp) |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura del modelo base `skp24/qwen-38-27b-surgery-patient`. El nombre del repositorio sugiere una base Qwen, pero no se confirma la familia, la variante ni la arquitectura concreta (transformer denso, MoE, híbrido, etc.). Tampoco se documentan datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF, DPO u otras etapas de alineación.

La única información técnica disponible proviene de los metadatos de cuantización del repositorio: se trata de cuantizaciones estáticas generadas con `convert_type: hf` y `output_tensor_quantised: 1`, lo que indica que los pesos originales en formato Hugging Face se convirtieron a GGUF y se cuantizaron con el pipeline de llama.cpp. La lista de cuantizaciones incluye desde Q2_K hasta Q8_0 y x-f16, lo que permite distintos equilibrios entre tamaño y fidelidad numérica. No hay innovaciones técnicas documentadas (decodificación especulativa, atención lineal, etc.).

## Capacidades

No hay información disponible sobre las capacidades del modelo. La model card del repositorio de cuantizaciones no describe tareas, habilidades ni modos especiales. El nombre "surgery-patient" sugiere un ajuste fino orientado a un dominio médico o quirúrgico, pero esto no está confirmado ni documentado. No se puede afirmar que el modelo soporte tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües específicas.

## Casos de uso

No se pueden proponer casos de uso concretos y realistas sin información sobre el dominio de entrenamiento, los idiomas y las capacidades del modelo. El nombre sugiere un posible uso en el ámbito médico o quirúrgico, pero al no haber documentación sobre el ajuste fino, los datos de entrenamiento ni la licencia, cualquier aplicación práctica quedaría sin base verificable. Se recomienda no desplegar este modelo en producción sin antes validar el modelo base `skp24/qwen-38-27b-surgery-patient` y comprobar la coherencia entre el nombre y el número real de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 460,7 millones de parámetros, las cuantizaciones Q4_K_M y Q5_K_M ocupan del orden de 0,3-0,5 GB de pesos; x-f16 en torno a 0,9 GB. La VRAM total necesaria depende del contexto configurado y del backend, pero en cualquier caso es muy reducida.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutar el modelo con comodidad. También es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM libre, dependiendo del contexto.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp, etc.). vLLM y TGI no son la vía natural para GGUF, aunque algunos backends aceptan conversiones.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No hay información suficiente sobre el modelo base ni sobre alternativas comparables de la misma categoría, dominio o tamaño para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre del repositorio ("27b") y el número real de parámetros (460.730.096, unos 0,46 B). El nombre puede inducir a error sobre el tamaño y las capacidades reales.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Verificar la licencia del modelo base antes de cualquier despliegue.
- Idiomas no documentados: no se puede garantizar soporte multilingüe ni calidad en castellano.
- Sin información sobre sesgos, riesgo de alucinación ni limitaciones de contexto.
- Sin benchmarks ni evaluación publicada: no hay evidencia de rendimiento en tareas concretas.
- Repositorio sin descargas ni likes: no hay señal de validación por parte de la comunidad.
- El dominio "surgery-patient" sugiere uso médico, pero sin documentación del ajuste fino no se debe asumir precisión clínica ni seguridad en ese ámbito.
- Al ser una cuantización, puede haber pérdida de fidelidad respecto al modelo original, especialmente en Q2_K y Q3_K_S.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/qwen-38-27b-surgery-patient-GGUF
- Modelo base: https://huggingface.co/skp24/qwen-38-27b-surgery-patient
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
