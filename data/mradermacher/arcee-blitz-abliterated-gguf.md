# mradermacher/Arcee-Blitz-abliterated-GGUF

## Resumen

Arcee-Blitz-abliterated-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo huihui-ai/Arcee-Blitz-abliterated, publicada por mradermacher. El modelo subyacente es una version "abliterated" (es decir, con los mecanismos de rechazo eliminados mediante la tecnica de abliteration, que proyecta fuera de los pesos la direccion asociada al comportamiento de negativa) del modelo Arcee-Blitz. El resultado es un modelo conversacional sin censura, orientado a generacion de texto en ingles.

El repositorio contiene unicamente pesos cuantizados estaticos en formato GGUF, pensados para su uso con llama.cpp y herramientas compatibles (Ollama, LM Studio, etc.). No incluye los pesos originales en safetensors, aunque el dato de parametros totales reportado por HuggingFace es de 23.572.403.200 parametros (aproximadamente 23,6 mil millones), lo que situa al modelo en la categoria de modelos densos de gran tamano.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de ~23,6B en hardware de consumo mediante cuantizaciones que van desde 9 GB (Q2_K) hasta 25,2 GB (Q8_0), a costa de asumir las limitaciones y riesgos asociados a un modelo sin alineacion de seguridad. La licencia es Apache 2.0 segun la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Arcee-Blitz; transformer denso segun el conteo de parametros) |
| Parametros totales | 23.572.403.200 (~23,6B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; sin safetensors en este repo) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Arcee-Blitz. El conteo de parametros (23.572.403.200) y la ausencia de indicacion de mezcla de expertos sugieren un transformer denso de aproximadamente 23,6B parametros. El proceso de "abliteration" aplicado por huihui-ai consiste en identificar la direccion en el espacio de activaciones asociada al comportamiento de rechazo y proyectarla fuera de los pesos, de modo que el modelo deja de negarse a responder a determinadas peticiones. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

El repositorio de mradermacher se limita a la conversion y cuantizacion estatica del modelo base a formato GGUF. La model card indica que las cuantizaciones con imatrix (ponderadas) estan disponibles en un repositorio separado (Arcee-Blitz-abliterated-i1-GGUF), lo que sugiere que este repositorio contiene cuantizaciones estaticas sin informacion de importancia. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Modelo sin censura (abliterated/uncensored): no aplica los mecanismos de rechazo tipicos de los modelos alineados.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- Uso con llama.cpp y derivados (Ollama, LM Studio) gracias al formato GGUF.
- Capacidades de razonamiento, codigo o matematicas: no documentadas en la informacion disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no documentadas.

## Casos de uso

- Generacion de texto creativo sin restricciones: el modelo, al haber sido abliterated, puede producir narrativa o dialogos sobre temas que los modelos alineados rechazan; util para escritura de ficcion adulta o guiones con tematicas sensibles, siempre con supervision humana.
- Prototipado local de asistentes conversacionales: gracias a las cuantizaciones Q4_K_M (14,4 GB) puede ejecutarse en una GPU de consumo de 24 GB (RTX 3090/4090) con llama.cpp u Ollama, permitiendo iterar sobre prompts y flujos conversacionales sin coste de API.
- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio de los efectos de la abliteration, comparando sus respuestas con las del modelo original para medir la perdida de comportamientos de rechazo.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece 11 variantes de cuantizacion del mismo modelo, lo que permite medir el impacto de Q2_K frente a Q8_0 en perplejidad y calidad de generacion sobre un modelo de ~23,6B.
- Despliegue en entornos con recursos limitados: la variante Q2_K (9,0 GB) permite ejecutar el modelo en GPUs de 12 GB o en CPU con RAM suficiente, a costa de una perdida notable de calidad.
- Generacion de datos sinteticos para fine-tuning: un modelo sin censura puede generar datasets de dialogo diversos que luego se filtran y curan para entrenar modelos alineados, ampliando la cobertura de temas.
- Experimentacion con endpoints compatibles: la etiqueta "endpoints_compatible" sugiere su uso en servicios de inferencia que aceptan la API de OpenAI o similar, facilitando pruebas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del archivo GGUF, sin contar overhead de contexto):
  - Q2_K: 9,0 GB
  - Q3_K_S: 10,5 GB
  - Q3_K_M: 11,6 GB
  - Q3_K_L: 12,5 GB
  - IQ4_XS: 13,0 GB
  - Q4_K_S: 13,6 GB
  - Q4_K_M: 14,4 GB
  - Q5_K_S: 16,4 GB
  - Q5_K_M: 16,9 GB
  - Q6_K: 19,4 GB
  - Q8_0: 25,2 GB
- GPU recomendadas: para Q4_K_M y superiores, GPU con 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100). Para Q2_K y Q3, GPU de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080).
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones hasta Q6_K; en RTX 3060 12 GB solo con Q2_K o Q3_K_S, con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Tambien es posible el despliegue en CPU con RAM suficiente (a partir de ~9 GB para Q2_K).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arcee-Blitz-abliterated-GGUF (este) | ~23,6B | no disponible | Apache 2.0 | GGUF | Sin censura, solo ingles, cuantizaciones estaticas |
| huihui-ai/Arcee-Blitz-abliterated | no disponible | no disponible | Apache 2.0 | safetensors (presumiblemente) | Modelo base sin cuantizar del que deriva este repo |
| Arcee-Blitz (original) | no disponible | no disponible | no disponible | no disponible | Modelo original alineado; no se dispone de datos comparativos |

No se dispone de informacion suficiente sobre modelos comparables de la misma categoria (abliterated, ~23,6B, GGUF) en la documentacion proporcionada para establecer una comparativa cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo sin alineacion de seguridad: la abliteration elimina los mecanismos de rechazo, por lo que puede generar contenido danino, ilegal o eticamente problematico sin advertir. No apto para despliegues publicos sin filtros externos.
- Riesgo elevado de alucinacion: no se documentan evaluaciones de fidelidad; como todo modelo generativo, puede inventar hechos, citas o codigo incorrecto.
- Solo ingles: la model card declara unicamente el idioma "en"; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide planificar casos de uso con documentos largos.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre la legalidad del contenido generado en jurisdicciones concretas.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas por el autor como de calidad inferior; Q3_K_M se etiqueta explicitamente como "lower quality".
- Sin datos de benchmarks: no hay evidencia publicada del rendimiento del modelo en tareas estandar, lo que dificulta su evaluacion objetiva frente a alternativas.
- Repositorio de 161,4 GB: incluye todas las variantes de cuantizacion, lo que requiere descargar solo el archivo necesario y no el repositorio completo.
- Fecha de actualizacion futura (2026-11-02): la metadata del repositorio muestra una fecha de actualizacion posterior a la actual, lo que puede indicar re-subida o re-etiquetado; conviene verificar la integridad de los archivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Arcee-Blitz-abliterated-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Arcee-Blitz-abliterated
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Arcee-Blitz-abliterated-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Arcee-Blitz-abliterated-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
