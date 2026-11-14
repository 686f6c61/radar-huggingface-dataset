# mradermacher/finance-LLM-13B-GGUF

## Resumen

finance-LLM-13B-GGUF es la versión cuantizada en formato GGUF del modelo AdaptLLM/finance-LLM-13B, un modelo de lenguaje especializado en el dominio financiero desarrollado originalmente por AdaptLLM. Esta ficha corresponde concretamente al repositorio de cuantizaciones estáticas publicado por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base cuenta con 13.015.874.560 parámetros (aproximadamente 13 mil millones) y está orientado a tareas de comprensión y generación de texto en inglés dentro del ámbito de las finanzas.

El interés de esta publicación radica en que pone a disposición del ecosistema local un modelo de 13B especializado en finanzas en múltiples niveles de cuantización (desde Q2_K hasta Q8_0), lo que facilita su despliegue en entornos con recursos limitados sin depender de infraestructura en la nube. La model card del repositorio no documenta detalles sobre arquitectura interna, contexto máximo ni datos de entrenamiento específicos; esa información debe consultarse en el repositorio del modelo base.

La información disponible en este repositorio es fundamentalmente la relativa al proceso de cuantización: tipos de cuantización ofrecidos, tamaños de archivo y recomendaciones de uso. No se han publicado en esta ficha datos de benchmarks, licencia explícita ni especificaciones técnicas detalladas más allá del recuento de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no documentados en este repositorio) |
| Parametros totales | 13.015.874.560 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base AdaptLLM/finance-LLM-13B en la documentación de este repositorio de cuantizaciones. Por el recuento de parámetros (13.015.874.560) y la nomenclatura del modelo, se trata de un transformer decoder-only de aproximadamente 13 mil millones de parámetros, coherente con la familia de modelos de 13B. El repositorio de mradermacher no documenta la composición del dataset de entrenamiento del modelo base, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO.

Los metadatos del repositorio indican que el modelo base fue entrenado o ajustado con datos de Open-Orca/OpenOrca, GAIR/lima y WizardLM/WizardLM_evol_instruct_V2_196k, según los campos `datasets` de la model card. Estos son datasets de instrucciones generales ampliamente utilizados, aunque la model card no especifica cómo se combinaron ni qué proporción de datos financieros específicos se empleó. La cuantización realizada por mradermacher es de tipo estático (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no se ofrecen, según el autor, cuantizaciones ponderadas o con imatrix en el momento de la publicación.

## Capacidades

- Generación de texto en inglés orientada al dominio financiero, incluyendo explicación de conceptos, análisis de documentos y respuesta a preguntas sobre temática económica y financiera.
- Comprensión y generación de texto de instrucciones generales, gracias a los datasets de ajuste por instrucciones empleados en el modelo base.
- Soporte de conversación multi-turno en formato de chat (el modelo base está pensado para instrucciones; el formato exacto de prompt no está documentado en este repositorio).
- Capacidades multilingües limitadas al inglés según los metadatos (`language: en`); no se documenta soporte de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF.

## Casos de uso

- Análisis de documentos financieros: el modelo puede resumir y explicar informes anuales, estados financieros o notas de prensa económicas en inglés, aprovechando su ajuste en dominio financiero. Adecuado para prototipos de análisis documental en local.
- Asistente de consultas sobre conceptos financieros: respuesta a preguntas sobre instrumentos financieros, ratios, métricas contables o terminología de mercados, en inglés, para formación interna o documentación.
- Extracción y estructuración de información de textos económicos: generación de resúmenes y reformulaciones de fragmentos financieros en pipelines de procesamiento por lotes, ejecutables con llama.cpp en servidores sin GPU dedicada de gran tamaño.
- Prototipado de chatbots financieros en local: despliegue de un asistente conversacional especializado para pruebas de concepto, con cuantizaciones Q4_K_M o Q5_K_M que caben en GPUs de consumo.
- Generación de borradores de contenido financiero: redacción de explicaciones, glosarios o notas divulgativas en inglés sobre productos y conceptos financieros, con revisión humana posterior.
- Evaluación comparativa de modelos especializados: uso del modelo como referencia local para comparar calidad de respuestas en dominio financiero frente a modelos generalistas, sin coste de API.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local mediante GGUF, permite procesar textos financieros sensibles sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de archivo como referencia mínima, más overhead de contexto y KV cache):
  - Q2_K: ~5,0 GB
  - Q3_K_S: ~5,8 GB
  - Q3_K_M: ~6,4 GB
  - Q3_K_L: ~7,0 GB
  - IQ4_XS: ~7,1 GB
  - Q4_K_S: ~7,5 GB (recomendada por el autor como rápida)
  - Q4_K_M: ~8,0 GB (recomendada por el autor como rápida)
  - Q5_K_S: ~9,1 GB
  - Q5_K_M: ~9,3 GB
  - Q6_K: ~10,8 GB (calidad muy buena según el autor)
  - Q8_0: ~13,9 GB (mejor calidad, rápida según el autor)
- GPU recomendadas: no disponibles de forma explícita; por tamaño, las cuantizaciones Q4 caben en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Las cuantizaciones Q6 y Q8 requieren 12-16 GB o más (RTX 4080, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, especialmente las cuantizaciones Q4_K_S y Q4_K_M en GPUs de 8-12 GB; también puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp y herramientas basadas en GGUF (Ollama, LM Studio, entre otras); el repositorio declara compatibilidad con endpoints (`endpoints_compatible`) y librería transformers para el modelo base.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas del modelo base que permitan una comparación rigurosa con alternativas. Se indica a continuación una comparación estructural básica con modelos de tamaño similar, marcando los datos no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| finance-LLM-13B-GGUF (este) | ~13B | no disponible | no disponible | GGUF | Especializado en finanzas, solo inglés |
| Modelo base AdaptLLM/finance-LLM-13B | ~13B | no disponible | no disponible | safetensors | Origen de las cuantizaciones |
| Alternativas de ~13B especializadas en finanzas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- El modelo está orientado únicamente al inglés (`language: en`); no se documenta soporte de castellano ni de otros idiomas.
- La licencia no está indicada en la información disponible; es imprescindible verificar la licencia del modelo base AdaptLLM/finance-LLM-13B antes de cualquier uso comercial.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datasets de instrucciones generales y datos financieros, puede reproducir sesgos presentes en dichos datos.
- Riesgo de alucinación inherente a los modelos de lenguaje; en dominio financiero, las respuestas deben verificarse y no deben utilizarse como asesoramiento financiero sin supervisión humana.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_M) pueden degradar la calidad; el autor advierte explícitamente de menor calidad en Q3_K_M.
- No se ofrecen cuantizaciones ponderadas ni con imatrix en el momento de la publicación, lo que puede limitar la calidad en comparación con otras alternativas cuantizadas.
- La longitud de contexto no está documentada en este repositorio; debe consultarse en el modelo base.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/finance-LLM-13B-GGUF
- Modelo base: https://huggingface.co/AdaptLLM/finance-LLM-13B
- Página de descargas del autor: https://hf.tst.eu/model#finance-LLM-13B-GGUF
- Guía de uso de GGUF (README de TheBloke referenciado): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
