# mradermacher/Spark-X2.6-4B-Uzbek-Uncensored-GGUF

## Resumen

Spark-X2.6-4B-Uzbek-Uncensored-GGUF es una cuantizacion estatica en formato GGUF del modelo base Spark-X2.6-4B-Uzbek-Uncensored, publicado por el usuario mradermacher en Hugging Face. El modelo original, alojado en el repositorio hogoraki/Spark-X2.6-4B-Uzbek-Uncensored, es un modelo de 4.000 millones de parametros orientado a la generacion de texto en uzbeko y sin censura (uncensored), lo que implica que no incorpora los filtros de rechazo tipicos de los modelos alineados con RLHF.

La relevancia de esta publicacion es fundamentalmente practica: se trata de una conversion a GGUF pensada para inferencia local con llama.cpp y derivados (Ollama, LM Studio, text-generation-webui), lo que permite ejecutar el modelo en hardware de consumo. El autor de la cuantizacion no aporta informacion adicional sobre arquitectura, datos de entrenamiento, licencia o idiomas; toda la documentacion disponible se limita a la lista de cuantizaciones generadas y a la referencia al modelo original.

Dado que la model card no incluye especificaciones tecnicas, esta ficha se limita a documentar lo que puede inferirse de los metadatos y del nombre del repositorio, marcando explicitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4B (inferido del nombre del repositorio) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | uzbeko (inferido del nombre); resto no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizacion estatica); pesos originales en safetensors presumiblemente en el repo base, no confirmado |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base en la documentacion disponible. Por el tamano (4B) y el formato de publicacion (GGUF con cuantizaciones K-quant e IQ4_XS), es plausible que se trate de un transformer decoder-only, pero no hay confirmacion en la model card. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o fine-tuning supervisado. El sufijo "Uncensored" sugiere que el modelo ha sido deliberadamente desalineado o fine-tuneado para eliminar rechazos, pero no se especifica la metodologia.

La unica innovacion tecnica documentada es el propio proceso de cuantizacion: el autor indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere una conversion desde pesos Hugging Face con la herramienta de cuantizacion de llama.cpp en su version 2, con tensores de salida cuantizados. No se menciona decodificacion especulativa, atencion lineal ni otras optimizaciones.

## Capacidades

- Generacion de texto en uzbeko (inferido del nombre del modelo).
- Generacion de texto sin censura: el modelo no aplica filtros de rechazo, lo que permite respuestas directas a peticiones que otros modelos alineados rechazarian.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del uzbeko.
- No se documenta vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documenta capacidad de codigo ni matematicas de forma especifica.

## Casos de uso

- Generacion de texto en uzbeko para contenidos editoriales o divulgativos: el modelo esta etiquetado como especializado en uzbeko, por lo que puede emplearse para redactar borradores, resumenes o parafrasis en ese idioma, aunque la calidad real no esta verificada con benchmarks.
- Investigacion sobre desalineacion y seguridad: al ser un modelo "uncensored", es util para estudiar como responden los modelos sin filtros, analizar sesgos y evaluar riesgos de contenido nocivo en entornos controlados.
- Prototipado local en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de 4B en GPUs con 4-6 GB de VRAM o en CPU, lo que facilita experimentos sin infraestructura dedicada.
- Traduccion y adaptacion de contenidos al uzbeko: puede integrarse en pipelines de traduccion asistida o localizacion para el mercado uzbeko, siempre con revision humana dada la ausencia de evaluacion publicada.
- Fine-tuning posterior sobre dominio especifico: al disponer de cuantizaciones y presumiblemente del modelo base en safetensors, puede servir como punto de partida para ajustes en uzbeko en nichos concretos (legal, medico, educativo).
- Despliegue en Ollama o LM Studio para pruebas de concepto: el formato GGUF con multiples niveles de cuantizacion permite seleccionar el equilibrio tamano/calidad segun el hardware disponible en una demo o prototipo interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (4B parametros, aproximada):
  - f16: ~8 GB.
  - Q8_0: ~4,5 GB.
  - Q6_K: ~3,5 GB.
  - Q5_K_M: ~3 GB.
  - Q4_K_M: ~2,5 GB.
  - Q3_K_M: ~2 GB.
  - Q2_K: ~1,5 GB.
  - IQ4_XS: ~2,3 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para f16; cualquier GPU con 4 GB o mas para cuantizaciones Q4/Q5.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM para cuantizaciones Q4_K_M o inferiores; incluso en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables de 4B especializados en uzbeko ni sobre el rendimiento relativo de este modelo frente a alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se conocen arquitectura, contexto, licencia ni datos de entrenamiento, lo que impide evaluar su idoneidad para produccion.
- Licencia no disponible: no puede confirmarse si el uso comercial esta permitido; debe consultarse el repositorio del modelo base (hogoraki/Spark-X2.6-4B-Uzbek-Uncensored) antes de cualquier despliegue.
- Modelo "uncensored": no incorpora filtros de rechazo, por lo que puede generar contenido nocivo, ofensivo o ilegal; requiere moderacion externa y supervision en cualquier aplicacion orientada al usuario final.
- Riesgo de alucinacion: sin benchmarks ni evaluacion publicada, no puede estimarse la fiabilidad factual del modelo.
- Cobertura idiomatica limitada: solo se infiere soporte de uzbeko; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Sin garantias de calidad: el autor de la cuantizacion no ha publicado evaluaciones; las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad en modelos pequenos.
- Fecha de creacion futura (2026-11-13) en los metadatos: posible error de marcado temporal; conviene verificar la procedencia del repositorio.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Spark-X2.6-4B-Uzbek-Uncensored-GGUF
- Modelo base: https://huggingface.co/hogoraki/Spark-X2.6-4B-Uzbek-Uncensored
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
