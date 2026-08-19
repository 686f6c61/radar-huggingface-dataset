# mradermacher/CloudSurf-4B-FC-GGUF

## Resumen

CloudSurf-4B-FC es un modelo de lenguaje cuantizado en formato GGUF, publicado por el equipo mradermacher en Hugging Face. Se trata de una conversión estática del modelo original CloudSurf-4B-FC desarrollado por cloudsurf-software, orientado aparentemente a function calling (FC). El repositorio ofrece múltiples niveles de cuantización (desde f16 hasta Q2_K) para adaptarse a distintos entornos de hardware, desde GPU de gama alta hasta CPU con memoria limitada.

La relevancia de esta publicación radica en que permite ejecutar un modelo de 4B parámetros (aunque los pesos totales ascienden a 7.463.013.674, lo que sugiere una arquitectura con parámetros activos inferiores, posiblemente MoE) en dispositivos de consumo mediante herramientas como llama.cpp u Ollama. Sin embargo, la información disponible es muy limitada: no se han publicado detalles sobre arquitectura, entrenamiento, licencia o benchmarks, por lo que esta ficha se basa únicamente en los metadatos del repositorio y en el contexto general de los modelos GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.463.013.674 (según safetensors del repo) |
| Parametros activos | no disponible (el nombre sugiere 4B, pero no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el repo original) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo original CloudSurf-4B-FC. El nombre sugiere un tamaño de 4 mil millones de parámetros, pero el recuento total de pesos en safetensors es de 7.463.013.674, lo que podría indicar una arquitectura de mezcla de expertos (MoE) con 4B parámetros activos, aunque esto no está confirmado. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO.

El repositorio de mradermacher se limita a proporcionar cuantizaciones estáticas del modelo original en formato GGUF, sin modificar los pesos ni añadir información técnica adicional. La ausencia de una model card detallada impide cualquier análisis riguroso de la arquitectura o el proceso de entrenamiento.

## Capacidades

No se han publicado capacidades específicas del modelo en la información disponible. El sufijo "FC" en el nombre sugiere un enfoque en function calling, pero no hay documentación que lo confirme. Tampoco se conocen capacidades de razonamiento, generación de código, soporte multilingüe o cualquier otra característica. Se recomienda consultar el repositorio original de cloudsurf-software para obtener detalles, aunque a fecha de esta ficha no se ha encontrado información pública adicional.

## Casos de uso

Dada la falta de información oficial, los casos de uso que se enumeran a continuación son hipotéticos y basados en el nombre y el formato del modelo. No deben considerarse confirmados:

- Despliegue local de un asistente conversacional: al estar disponible en GGUF, el modelo puede ejecutarse en CPU o GPU de consumo mediante llama.cpp u Ollama, lo que permite prototipos de chatbots sin conexión.
- Integración en pipelines de automatización: si el modelo soporta function calling, podría utilizarse para orquestar llamadas a APIs o herramientas en entornos de bajo coste.
- Evaluación de cuantizaciones: el repositorio ofrece múltiples niveles de precisión, útil para estudiar el equilibrio entre rendimiento y calidad en hardware limitado.
- Experimentación académica: investigadores pueden usar el modelo como punto de partida para pruebas de fine-tuning o comparativas, siempre que la licencia lo permita (desconocida).
- Aplicaciones educativas: para enseñar conceptos de cuantización y despliegue de LLMs en entornos modestos.
- Pruebas de concepto en edge computing: con cuantizaciones Q2_K o Q3_K, el modelo podría caber en dispositivos con poca memoria, aunque se desconoce su calidad real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar. Tampoco se han comparado sus métricas con modelos similares. Cualquier afirmación sobre rendimiento sería especulativa.

## Requisitos de hardware

Los requisitos dependen de la cuantización elegida. A partir del tamaño del repositorio (34.0 GB para todas las variantes) y del número de parámetros, se pueden estimar los siguientes rangos orientativos:

- VRAM estimada para inferencia: para la cuantización Q4_K_M (la más común), un modelo de ~7.4B parámetros requiere aproximadamente 4-5 GB de VRAM. Las variantes Q2_K y Q3_K pueden reducir esto a 3-4 GB, mientras que f16 necesitaría unos 15 GB.
- GPU recomendadas: una RTX 3060 de 12 GB o superior puede manejar las cuantizaciones Q4 y superiores. Para f16 se necesitaría una RTX 4090 o A100. En CPU, las cuantizaciones Q2/Q3 son viables con 16 GB de RAM.
- Compatibilidad con GPU de consumo: sí, las cuantizaciones Q4_K_M y menores caben en GPUs de 8 GB o incluso 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo original no tiene documentación pública, y no se conocen alternativas directas con el mismo enfoque (function calling en 4B). Se recomienda buscar modelos como Qwen2.5-7B-Instruct o Llama-3.1-8B-Instruct como referencias generales de tamaño similar, pero no se pueden comparar métricas ni capacidades sin datos.

## Limitaciones y advertencias

- Ausencia total de documentación: no se conocen la arquitectura, el entrenamiento, la licencia ni los sesgos del modelo. Esto impide un uso responsable en producción.
- Riesgo de alucinación: al ser un modelo de tamaño medio y sin información sobre su alineación, es probable que presente alucinaciones, especialmente en tareas de razonamiento complejo.
- Licencia desconocida: no se indica la licencia del modelo original. Esto puede impedir su uso comercial o incluso su uso personal si la licencia es restrictiva. Se debe contactar con el autor antes de cualquier aplicación.
- Pérdida de calidad por cuantización: las variantes Q2_K y Q3_K pueden degradar significativamente la calidad de las respuestas. Se recomienda usar Q4_K_M o superior si el hardware lo permite.
- Contexto limitado: se desconoce la longitud de contexto soportada. Modelos de este tamaño suelen tener ventanas de 4K a 8K tokens, pero no está confirmado.
- Soporte de function calling no verificado: el sufijo "FC" sugiere esta capacidad, pero no hay evidencia de que funcione correctamente tras la cuantización.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/CloudSurf-4B-FC-GGUF
- Modelo original (referencia): https://huggingface.co/cloudsurf-software/CloudSurf-4B-FC
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
