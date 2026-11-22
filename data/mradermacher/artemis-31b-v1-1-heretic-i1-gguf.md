# mradermacher/Artemis-31B-v1.1-heretic-i1-GGUF

## Resumen

Artemis-31B-v1.1-heretic-i1-GGUF es una colección de cuantizaciones GGUF del modelo Artemis-31B-v1.1-heretic, publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo original, desarrollado por sh0ck0r, es una variante "heretic" (también etiquetada como uncensored, decensored y abliterated) de una base de aproximadamente 30.700 millones de parámetros, lo que lo sitúa en la categoría de modelos densos de gran tamaño.

El interés principal de esta publicación reside en que ofrece cuantizaciones con imatrix (importancia matrix) en una amplia gama de tipos, desde IQ1_S hasta Q6_K, permitiendo ejecutar un modelo de 31B en hardware de consumo con pérdidas de calidad controladas. La familia "heretic" se orienta a eliminar los mecanismos de rechazo y moderación del modelo base mediante técnicas de abliteration, lo que la hace relevante para investigación sobre alineación, evaluación de sesgos y aplicaciones que requieren respuestas sin filtros editoriales.

La información disponible sobre el modelo original es limitada: no se especifican la longitud de contexto, los datos de entrenamiento ni la licencia, y la model card se centra casi exclusivamente en los detalles de las cuantizaciones. Esta ficha refleja esa limitación de forma explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer denso, inferido del pipeline conversacional y del tamaño) |
| Parámetros totales | 30.697.345.596 (30,7B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de fichero imatrix) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamaño del repositorio | 334,8 GB |
| Modelo base | sh0ck0r/Artemis-31B-v1.1-heretic |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo original en la documentación proporcionada. Los metadatos indican un pipeline conversacional, etiquetas de transformers y un total de 30.697.345.596 parámetros en formato safetensors, lo que corresponde a un transformer denso de aproximadamente 31B. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto nativa.

Respecto al entrenamiento, la model card únicamente indica que se trata de un modelo "heretic", "uncensored", "decensored" y "abliterated", lo que implica la aplicación de técnicas de abliteration (ablación de direcciones de activación asociadas al rechazo) sobre el modelo base. No se detallan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La cuantización realizada por mradermacher emplea imatrix (matriz de importancia) y el formato i1 de llama.cpp, generada con convert_type hf y quantize_version 2, lo que preserva mejor la calidad que las cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional multi-turno, con formato de chat orientado a diálogo.
- Respuestas sin mecanismos de rechazo ni moderación editorial (abliterated), lo que permite abordar temas que el modelo base declinaría.
- Razonamiento general y respuesta a instrucciones en inglés.
- Capacidad de ejecución local mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp), gracias al formato GGUF.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) para despliegue como servicio.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües limitadas al inglés según los metadatos del modelo.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteration afecta a la distribución de respuestas ante prompts sensibles, comparando con el modelo base original en experimentos controlados.
- Evaluación de sesgos y robustez: al carecer de rechazos, resulta útil para generar corpus de respuestas que expongan sesgos latentes y diseñar filtros posteriores en pipelines de moderación.
- Generación creativa sin restricciones editoriales: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas, donde el modelo base bloquearía la generación.
- Despliegue local en estaciones de trabajo: con la cuantización i1-Q4_K_M (18,8 GB) puede ejecutarse en GPU de consumo con 24 GB de VRAM, sirviendo como asistente personal sin dependencia de API externa.
- Prototipado de agentes conversacionales: la etiqueta endpoints_compatible permite exponerlo mediante una API compatible con OpenAI y conectarlo a frameworks de agentes, aunque sin garantías de tool calling fiable.
- Red teaming de sistemas de IA: uso como generador adversario para probar la robustez de clasificadores de contenido y filtros de seguridad en productos desplegados.
- Análisis de datos sintéticos: generación de diálogos y textos en inglés a gran escala para aumento de datos, aprovechando el throughput de las cuantizaciones Q4 en hardware consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 30,7B parámetros):
  - i1-IQ1_S / IQ1_M: 7,3-7,8 GB (calidad muy degradada, solo para pruebas).
  - i1-IQ2_M / Q2_K: 11,0-12,0 GB (calidad baja).
  - i1-IQ3_M / IQ3_S: 13,9-14,5 GB (compromiso razonable en 16 GB).
  - i1-IQ4_XS / Q4_K_S: 16,8-17,9 GB (óptimo tamaño/velocidad/calidad según el autor).
  - i1-Q4_K_M: 18,8 GB (recomendado por el autor, rápido).
  - i1-Q5_K_M: 21,9 GB (alta calidad).
  - i1-Q6_K: 25,3 GB (prácticamente equivalente a Q6_K estático).
- GPU recomendadas:
  - Consumer: RTX 3090 / RTX 4090 (24 GB) para Q4_K_M o Q5_K_S; RTX 4080 / 4070 Ti Super (16 GB) para IQ3_M o IQ4_XS con offload parcial.
  - Profesional: A100 40/80 GB, H100, L40S para cuantizaciones Q5/Q6 con contexto largo y mayor throughput.
- Cabe en GPU de consumo: sí, desde 8 GB (IQ2) hasta 24 GB (Q4_K_M/Q5_K_S); las cuantizaciones Q6_K requieren 32 GB o offload a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui; servidores compatibles con la API de OpenAI (llama-server) gracias a la etiqueta endpoints_compatible. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requerirían los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Artemis-31B-v1.1-heretic (i1-GGUF) | 30,7B | no disponible | no disponible | GGUF (i1) | Variante abliterated, solo inglés, cuantizaciones con imatrix |
| Artemis-31B-v1.1-heretic (GGUF estático) | 30,7B | no disponible | no disponible | GGUF | Mismo modelo base, cuantizaciones estáticas sin imatrix |
| Modelos densos de ~30B de la familia Gemma/Qwen | ~27-32B | 32K-128K según variante | licencias permisivas habituales | safetensors, GGUF | No disponible comparación de rendimiento por falta de benchmarks publicados |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación cuantitativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": no aplica rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o explícitamente sensible. No apto para despliegue público sin filtros externos.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad factual ni benchmarks que cuantifiquen este riesgo.
- Idiomas: únicamente inglés según los metadatos; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Licencia no disponible: la ausencia de licencia explícita impide confirmar si se permite uso comercial. Debe contactarse con el autor del modelo base antes de cualquier uso en producción.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni el uso de técnicas como RoPE scaling.
- Cuantizaciones de baja precisión (IQ1, IQ2, Q2_K) degradan notablemente la coherencia y la capacidad de razonamiento; el autor desaconseja su uso salvo fines experimentales.
- La model card no documenta tool calling ni capacidades de agente; la etiqueta endpoints_compatible solo garantiza compatibilidad de API, no fiabilidad funcional.
- El repositorio ocupa 334,8 GB en total; la descarga selectiva de un único fichero GGUF es posible, pero conviene verificar el espacio en disco y la integridad de los ficheros multi-parte.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/Artemis-31B-v1.1-heretic-i1-GGUF
- Modelo base: https://huggingface.co/sh0ck0r/Artemis-31B-v1.1-heretic
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Artemis-31B-v1.1-heretic-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Artemis-31B-v1.1-heretic-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
