# mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con imatrix del modelo `gemma-4-31b-it-3MPER0RR-abliterated`, una versión "abliterated" (sin censura) del modelo instruct Gemma 4 de 31B parámetros, creada por el usuario 3MPER0RR y convertida a formato GGUF por mradermacher. El modelo base pertenece a la familia Gemma 4 de Google, diseñada para razonamiento, flujos agénticos, generación de código y comprensión multimodal, aunque esta variante concreta no incluye detalles técnicos en su documentación.

La relevancia de este modelo radica en que ofrece una alternativa de gran tamaño (30,7B parámetros) ejecutable localmente mediante cuantizaciones, con la particularidad de haber sido sometido a abliteración, una técnica que elimina los mecanismos de rechazo y censura del modelo original. Esto lo hace atractivo para usuarios que buscan un asistente conversacional sin restricciones de contenido, aunque con los riesgos asociados a esa falta de filtros.

El repositorio incluye múltiples archivos GGUF en diferentes niveles de cuantización (desde Q1 hasta Q6, incluyendo versiones IQ), lo que permite adaptar el modelo a distintos presupuestos de VRAM. No se proporciona información sobre licencia, idiomas soportados ni detalles de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se asume transformer multimodal de la familia Gemma 4) |
| Parametros totales | 30.697.345.596 (30,7B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con safetensors originales en el repositorio base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. El nombre sugiere que se trata de la versión instruct de Gemma 4 con 31B parámetros, que según la documentación general de la familia Gemma 4 está optimizada para razonamiento, agentes, código y comprensión multimodal. Sin embargo, no se confirma si esta variante conserva el encoder de visión.

El proceso de abliteración, aplicado por el autor 3MPER0RR, consiste en modificar los pesos del modelo para eliminar las direcciones de activación asociadas al rechazo de contenido, manteniendo el resto de capacidades. Posteriormente, mradermacher ha generado cuantizaciones GGUF utilizando el método imatrix (importance matrix) para mejorar la calidad de la cuantización. No se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, al ser una variante instruct.
- Razonamiento y resolución de problemas, según las características generales de la familia Gemma 4.
- Generación de código, también indicada en la documentación general de Gemma 4.
- Posible comprensión multimodal (visión), aunque no confirmado para esta variante concreta.
- Al ser abliterated, no presenta rechazos ante solicitudes de contenido sensible o controvertido, lo que permite respuestas sin censura.
- Soporte para tool calling y flujos agénticos, según las capacidades generales de Gemma 4, aunque no verificado en este repositorio.

## Casos de uso

- Asistente conversacional sin restricciones: el modelo puede mantener diálogos largos y responder a temas que otros modelos censurarían, gracias a la abliteración. Es adecuado para entornos de investigación o creativos donde se requiere explorar contenido sin filtros.
- Generación de código en local: con 30,7B parámetros y cuantizaciones Q4 o Q5, puede ejecutarse en una GPU de 24 GB, permitiendo asistencia de programación sin depender de APIs externas.
- Prototipado de agentes autónomos: si el modelo base soporta tool calling, esta variante puede integrarse en pipelines de agentes que requieren razonamiento multi-paso y ejecución de herramientas, aunque habría que verificar la compatibilidad.
- Análisis de texto creativo: su capacidad para generar contenido sin filtros lo hace útil para escritura de ficción, guiones o narrativa con temáticas adultas.
- Experimentación en alineación y seguridad: al ser un modelo abliterated, sirve como caso de estudio para investigar los efectos de la eliminación de mecanismos de rechazo en modelos grandes.
- Despliegue en entornos sin conexión: al estar en formato GGUF, puede ejecutarse con llama.cpp u Ollama en hardware modesto, garantizando privacidad de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo concreto. El rendimiento dependerá de la cuantización elegida y del hardware utilizado.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, un modelo de 30,7B parámetros requiere aproximadamente:
  - Q2_K: ~12-14 GB
  - Q4_K_M: ~18-20 GB
  - Q5_K_M: ~22-24 GB
  - Q6_K: ~26-28 GB
  - Q8: ~32-34 GB (si estuviera disponible)
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4/Q5, A100 40/80 GB para cuantizaciones altas o contexto largo, H100 para máxima velocidad.
- En consumer GPU: sí, cabe en RTX 3090/4090 con cuantizaciones Q4 o inferiores. También en GPUs de 16 GB con Q2 o IQ2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con adaptación para GGUF), TGI (si se convierte a safetensors).
- Latencia y throughput: no disponibles, pero en una RTX 4090 con Q4_K_M se puede esperar una velocidad de generación de 20-40 tokens/s, dependiendo del contexto y la implementación.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa rigurosa. El modelo es una variante abliterated de Gemma 4 31B, pero no se conocen sus resultados en benchmarks ni su contexto exacto. Alternativas de tamaño similar incluyen Llama 3 30B, Qwen 2.5 32B o Mistral Large 2, pero sin datos de rendimiento de este modelo no es posible establecer una comparación objetiva.

## Limitaciones y advertencias

- Al ser abliterated, el modelo puede generar contenido ofensivo, violento, sexual o ilegal sin restricciones. No es apto para aplicaciones comerciales orientadas al público general sin un sistema de moderación externo.
- Riesgo elevado de alucinaciones, especialmente en temas factuales, al no haberse verificado su rendimiento en benchmarks.
- La licencia no está especificada, lo que genera incertidumbre legal sobre su uso comercial. Se recomienda contactar con el autor o consultar el repositorio base antes de utilizarlo en producción.
- No se dispone de información sobre la longitud de contexto soportada, lo que puede provocar errores si se supera el límite real.
- La abliteración puede degradar ligeramente la calidad general del modelo en comparación con la versión original, aunque no se han cuantificado las diferencias.
- El modelo no incluye un sistema de seguridad integrado, por lo que su uso en entornos con menores de edad o en aplicaciones reguladas está totalmente desaconsejado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-i1-GGUF
- Repositorio base (modelo abliterated): https://huggingface.co/3MPER0RR/gemma-4-31b-it-3MPER0RR-abliterated
- Repositorio similar de mradermacher: https://huggingface.co/mradermacher/gemma-4-31B-it-abliterated-i1-GGUF
- Página de Gemma 4 en Ollama: https://ollama.com/library/gemma4:31b
- Guía de Gemma 4: https://gemma4.org/
