# mradermacher/MedicalEDI-14b-EDI-Base-1-GGUF

## Resumen

MedicalEDI-14b-EDI-Base-1-GGUF es la versión cuantizada en formato GGUF del modelo Shaleen123/MedicalEDI-14b-EDI-Base-1, publicada por mradermacher, un conocido creador de cuantizaciones estáticas para la comunidad. El modelo base es un transformer de aproximadamente 14.770 millones de parámetros (14,77 B) orientado al dominio médico, según indica su nombre, y entrenado únicamente en inglés. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos originales en precisión completa.

La relevancia de esta ficha radica en que el repositorio GGUF es la única vía práctica de despliegue local para un modelo de 14 B en el ámbito médico, un nicho donde el acceso a modelos especializados es limitado. Sin embargo, la información pública es muy escasa: la model card del cuantizador no aporta detalles sobre arquitectura, contexto, licencia ni datos de entrenamiento del modelo base, y el repositorio original no está documentado en la información disponible.

El modelo se distribuye en diez cuantizaciones estáticas que van de Q2_K (5,9 GB) a Q8_0 (15,8 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. No se han publicado cuantizaciones ponderadas ni imatrix por parte del autor en el momento de la publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en safetensors según el modelo base |
| Tamano del repositorio | 102,0 GB |
| Libreria | transformers (metadato), ejecutable con llama.cpp |
| Modelo base | Shaleen123/MedicalEDI-14b-EDI-Base-1 |
| Fecha de creacion | 2025-02-14 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de que se trata de un transformer de 14,77 B de parámetros. La model card del cuantizador no incluye detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención, tipo de tokenizador ni vocabulario. Tampoco se especifica si el modelo emplea alguna innovación como atención lineal, decodificación especulativa o mezcla de expertos; el recuento de parámetros activos no aplica al no ser un modelo MoE.

Respecto al entrenamiento, no hay datos publicados sobre el volumen de tokens, la composición del dataset, la posible especialización médica (a pesar del nombre "MedicalEDI"), ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. El único dato verificable es que el modelo está etiquetado como "conversational" y "base_model" en Hugging Face, y que el idioma declarado es exclusivamente inglés. Cualquier afirmación sobre su proceso de entrenamiento sería especulativa y no debe asumirse.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Especialización declarada en dominio médico por el nombre del modelo base, aunque no se documentan las tareas concretas cubiertas.
- Ejecución local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, koboldcpp, entre otros).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible" en Hugging Face).
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés declarado; no se especifican otros idiomas.

## Casos de uso

- Asistencia en documentación clínica: el modelo puede redactar borradores de notas clínicas o resúmenes de historiales en inglés, ejecutándose localmente en un equipo con GPU de consumo gracias a las cuantizaciones Q4_K_M (9,1 GB) o Q5_K_M (10,6 GB).
- Prototipado de aplicaciones sanitarias en entornos con requisitos de privacidad: al poder ejecutarse en local sin conexión, permite procesar texto médico sin enviar datos a servicios en la nube, siempre que se valide la licencia del modelo base.
- Investigación en NLP clínico: útil como línea base para experimentos de generación de texto médico en inglés, con la ventaja de requerir hardware asequible (una RTX 4090 con 24 GB puede ejecutar Q8_0).
- Chatbot de formación para personal sanitario: despliegue mediante Ollama o llama.cpp para responder preguntas en inglés sobre terminología y procedimientos, con la advertencia de que no debe usarse como consejo médico real.
- Generación de resúmenes de literatura médica: con la cuantización Q6_K (12,2 GB) se obtiene buena calidad para tareas de síntesis de abstracts en inglés en un equipo con 16 GB de VRAM.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece diez variantes que permiten medir el impacto de la cuantización en la perplejidad y la calidad de salida en un dominio especializado como el médico.
- Despliegue en estaciones de trabajo sin GPU dedicada: la variante Q2_K (5,9 GB) o Q3_K_S (6,8 GB) puede ejecutarse en CPU con RAM suficiente, aunque con calidad reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~5,9 GB
  - Q3_K_S: ~6,8 GB
  - Q3_K_M: ~7,4 GB
  - Q3_K_L: ~8,0 GB
  - IQ4_XS: ~8,3 GB
  - Q4_K_S: ~8,7 GB
  - Q4_K_M: ~9,1 GB
  - Q5_K_S: ~10,4 GB
  - Q5_K_M: ~10,6 GB
  - Q6_K: ~12,2 GB
  - Q8_0: ~15,8 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q6_K; RTX 4060 Ti 16 GB o RTX 4070 (12 GB) para Q4_K_M; GPUs de 8 GB para Q2_K o Q3_K_S con contexto reducido.
- Cabe en GPU de consumo: sí, desde una RTX 3060 de 12 GB (Q4_K_M) hasta una RTX 4090 (Q8_0). Para Q8_0 con contexto largo se recomienda 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. No se recomienda vLLM ni TGI para esta versión, ya que están orientados a pesos safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría (por ejemplo, otros modelos médicos de ~14 B como BioMistral o Meditron). Se indica "no disponible" en lugar de especular.

## Limitaciones y advertencias

- La licencia del modelo no está disponible, lo que impide confirmar si se permite uso comercial; es imprescindible verificar la licencia del modelo base Shaleen123/MedicalEDI-14b-EDI-Base-1 antes de cualquier despliegue en producción.
- El modelo está entrenado únicamente en inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de seguridad, por lo que el riesgo de alucinación y de respuestas incorrectas en un dominio sensible como el médico es alto y no está cuantificado.
- El nombre "MedicalEDI" sugiere especialización médica, pero no se documentan las tareas clínicas cubiertas ni la validación por profesionales sanitarios; no debe usarse como herramienta de diagnóstico ni consejo médico.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M como equilibrio entre velocidad y fidelidad.
- No hay cuantizaciones imatrix ni ponderadas publicadas por el autor, lo que limita la calidad máxima alcanzable en tamaños pequeños.
- El repositorio tiene un volumen de descargas muy bajo (31) y una sola valoración positiva, lo que indica escasa validación por parte de la comunidad.
- La fecha de actualización del repositorio (2026-11-06) es posterior a la de creación (2025-02-14); conviene revisar si se han añadido cuantizaciones o cambios no reflejados en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MedicalEDI-14b-EDI-Base-1-GGUF
- Modelo base: https://huggingface.co/Shaleen123/MedicalEDI-14b-EDI-Base-1
- Página de descargas del cuantizador: https://hf.tst.eu/model#MedicalEDI-14b-EDI-Base-1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
