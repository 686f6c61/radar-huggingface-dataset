# mradermacher/Phi_medquad-inheritance-GGUF

## Resumen

Phi_medquad-inheritance-GGUF es la versión cuantizada en formato GGUF del modelo base `emilykang/Phi_medquad-inheritance`, publicada por mradermacher. El modelo original parte de la familia Phi (2.779.683.840 parámetros totales, aproximadamente 2,78 mil millones) y parece haber sido ajustado sobre datos de tipo MedQuAD, un corpus de preguntas y respuestas médicas. Se trata, por tanto, de un modelo orientado a dominio sanitario y a instrucciones en inglés, distribuido en una amplia gama de cuantizaciones estáticas que van de Q2_K (1,2 GB) a f16 (5,7 GB).

La relevancia de esta ficha es doble. Por un lado, permite ejecutar en hardware de consumo un modelo de casi 2,8 mil millones de parámetros con calidad razonable mediante cuantizaciones Q4_K_M o Q5_K_M. Por otro, ilustra el flujo habitual de la comunidad open source: un ajuste fino especializado (en este caso médico) se publica primero en safetensors y un tercero lo convierte a GGUF para su uso con llama.cpp, Ollama o interfaces compatibles con endpoints.

La información disponible es limitada: la model card del repositorio GGUF es puramente logística (tabla de cuantizaciones, notas de uso y agradecimientos), no incluye detalles sobre el entrenamiento, la licencia, la longitud de contexto ni benchmarks. Esta ficha recoge lo que consta y marca explícitamente como "no disponible" todo aquello que no puede verificarse con los datos proporcionados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Phi; arquitectura transformer decoder-only presumible, no confirmada en la información) |
| Parámetros totales | 2.779.683.840 (dato real de safetensors) |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |
| Modelo base | emilykang/Phi_medquad-inheritance |
| Tamaño del repo | 25,0 GB |
| Librería | transformers |
| Fecha de creación | 2025-02-28 |
| Última actualización | 2026-11-10 |
| Descargas / likes | 8 / 0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `emilykang/Phi_medquad-inheritance` más allá de que pertenece a la familia Phi y que cuenta con 2.779.683.840 parámetros. La model card del repositorio GGUF no documenta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. El nombre sugiere un ajuste sobre MedQuAD (Medical Question Answering Dataset), pero esto no está confirmado en la información proporcionada.

La aportación técnica de este repositorio es la cuantización. mradermacher ha generado cuantizaciones estáticas (sin imatrix) con `quantize_version: 2` y `output_tensor_quantised: 1`, usando el pipeline de conversión de Hugging Face a GGUF. Para quien necesite mayor calidad por tamaño, el autor indica que dispone de cuantizaciones ponderadas con imatrix en `mradermacher/Phi_medquad-inheritance-i1-GGUF`.

## Capacidades

- Generación de texto en inglés, presumiblemente orientada a preguntas y respuestas de dominio médico por el nombre del modelo base.
- No consta soporte explícito de tool calling ni function calling.
- No consta soporte de agentes ni de razonamiento multi-paso documentado.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No consta modo thinking, visión, audio ni otras capacidades especiales.
- Inferencia local en CPU y GPU mediante llama.cpp y ecosistema GGUF.

## Casos de uso

- Asistente de consulta médica de referencia para estudiantes: el modelo puede responder preguntas de tipo MedQuAD en inglés, útil como herramienta de estudio o para construir un chatbot de repaso sobre un corpus de preguntas y respuestas clínicas.
- Prototipado rápido en local: con cuantizaciones Q4_K_M (1,8 GB) se puede desplegar en un portátil con 8 GB de RAM para validar ideas de producto antes de invertir en infraestructura.
- Generación de respuestas en entornos con restricciones de privacidad: al ejecutarse íntegramente en local, permite procesar consultas sensibles sin enviar datos a servicios externos.
- Base para ajuste fino adicional: al partir de un modelo de 2,78 mil millones de parámetros y licencia (no disponible, a verificar), puede servir como punto de partida para especializaciones ulteriores en dominios sanitarios concretos.
- Evaluación comparativa de cuantizaciones: la disponibilidad de doce variantes permite medir empíricamente el impacto de Q2_K a Q8_0 en la calidad de respuestas médicas dentro de un mismo modelo.
- Integración en pipelines de documentación clínica: para resumir o reformular textos médicos en inglés en herramientas internas, siempre con revisión humana dado el riesgo de alucinación.
- Despliegue en dispositivos edge: con Q2_K (1,2 GB) cabe en entornos con memoria muy limitada, aunque con pérdida de calidad apreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más overhead de contexto. Q4_K_M ronda 1,8 GB de pesos; Q8_0 unos 3,1 GB; f16 unos 5,7 GB.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) puede ejecutar Q4_K_M o Q5_K_M con contexto moderado; RTX 4090 o A100/H100 no son necesarias para este tamaño y quedarían infrautilizadas.
- Cabe en GPU consumer: sí, holgadamente en Q2_K a Q6_K; incluso en CPU con 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, interfaces compatibles con endpoints (el tag `endpoints_compatible` figura en el repositorio), y cualquier runtime que acepte GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Phi_medquad-inheritance-GGUF (este) | 2,78 mil M | no disponible | no disponible | GGUF | Hugging Face, 8 descargas |
| Modelo base emilykang/Phi_medquad-inheritance | 2,78 mil M | no disponible | no disponible | safetensors | Hugging Face |
| Familia Phi-2 / Phi-3-mini (referencia de tamaño) | ~2,7-3,8 mil M | variable según versión | MIT (en versiones oficiales de Microsoft) | safetensors, GGUF | Hugging Face |
| Modelos médicos pequeños tipo Meditron o BioMistral | variable | variable | variable | safetensors, GGUF | Hugging Face |

La comparación con alternativas oficiales de Microsoft (Phi-2, Phi-3-mini) es pertinente por tamaño, pero este modelo es un ajuste comunitario derivado, no una versión oficial, y no se dispone de datos de rendimiento que permitan situarlo frente a ellas.

## Limitaciones y advertencias

- Riesgo elevado de alucinación en dominio médico: cualquier respuesta debe ser revisada por profesionales sanitarios; no debe usarse como sustituto de diagnóstico ni consejo clínico.
- Sesgos desconocidos: no hay documentación sobre el dataset de ajuste ni sobre sesgos demográficos, lingüísticos o clínicos.
- Idiomas: solo inglés; no se garantiza calidad en castellano ni en otras lenguas.
- Contexto: no disponible; planificar los casos de uso con ventanas conservadoras hasta verificarlo.
- Licencia no disponible: antes de uso comercial es imprescindible consultar la licencia del modelo base `emilykang/Phi_medquad-inheritance`, ya que este repositorio GGUF es una redistribución cuantizada y hereda las restricciones del original.
- Cuantizaciones muy agresivas (Q2_K, Q3_K_S) degradan la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rápidas.
- Repositorio con muy poca tracción (8 descargas, 0 likes): menor probabilidad de mantenimiento, soporte comunitario o corrección de errores.
- La model card no documenta el proceso de cuantización en detalle ni incluye evaluaciones de perplejidad propias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Phi_medquad-inheritance-GGUF
- Modelo base: https://huggingface.co/emilykang/Phi_medquad-inheritance
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/Phi_medquad-inheritance-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#Phi_medquad-inheritance-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
