# mradermacher/RolBol-Code-11B-Instruct-i1-GGUF

## Resumen

RolBol-Code-11B-Instruct-i1-GGUF es la versión cuantizada con imatrix del modelo RolBolSystems/RolBol-Code-11B-Instruct, publicada por mradermacher. Se trata de un modelo de lenguaje orientado a código y flujos agénticos, distribuido en formato GGUF para su uso con llama.cpp y entornos compatibles con endpoints. El modelo base cuenta con 12.276.772.352 parámetros reales según los pesos en safetensors, aunque se comercializa bajo la denominación comercial de 11B.

La relevancia de esta ficha radica en que ofrece un conjunto amplio de cuantizaciones (desde IQ1_S de 3,0 GB hasta Q6_K de 10,2 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con poca VRAM hasta estaciones de trabajo. La licencia Apache 2.0 facilita su adopción en entornos comerciales sin restricciones adicionales.

No obstante, la información pública disponible sobre el modelo base es muy limitada: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha refleja exclusivamente los datos verificables en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 12.276.772.352 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones ponderadas con imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base RolBolSystems/RolBol-Code-11B-Instruct. Los metadatos no indican si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni tampoco el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. Las etiquetas del modelo (code, coding, agentic, conversational) sugieren un ajuste orientado a tareas de programación y uso conversacional con capacidades agénticas, pero no se aportan detalles técnicos verificables.

La innovación destacable de esta publicación concreta es el uso de cuantizaciones ponderadas con imatrix (importance matrix), generadas por mradermacher. Este enfoque calcula una matriz de importancia a partir de datos de calibración para preservar mejor la calidad en cuantizaciones agresivas, especialmente en los rangos IQ1 e IQ2. La model card incluye además una comparativa gráfica de perplejidad entre tipos de cuantización y referencias externas sobre su calidad relativa.

## Capacidades

- Generación de texto conversacional en inglés.
- Generación y asistencia en código (etiquetas code y coding).
- Capacidades agénticas (etiqueta agentic), orientadas a flujos de varios pasos.
- Uso con llama.cpp y text-generation-inference, según las etiquetas del repositorio.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.
- Modo thinking explícito: no disponible.
- Idiomas distintos del inglés: no disponibles.

## Casos de uso

- Asistencia de programación en local: el modelo puede desplegarse con llama.cpp en una estación de trabajo y usarse como asistente de autocompletado y generación de fragmentos de código, aprovechando las cuantizaciones Q4_K_M (7,6 GB) o Q5_K_M (8,8 GB) para un equilibrio razonable entre calidad y velocidad.
- Automatización de tareas agénticas en pipelines de desarrollo: gracias a su orientación agéntica, puede integrarse en flujos de varios pasos para generar parches, revisar cambios o proponer refactorizaciones dentro de herramientas de CI/CD, siempre con validación humana.
- Despliegue en hardware de consumo: las cuantizaciones IQ2 e IQ3 (entre 3,6 y 5,7 GB) permiten ejecutar el modelo en GPUs con 6-8 GB de VRAM, útil para prototipos y entornos de desarrollo sin infraestructura dedicada.
- Generación de documentación técnica: el modelo puede redactar docstrings, README y comentarios de código a partir de fragmentos fuente, en un contexto conversacional en inglés.
- Chatbot de soporte para desarrolladores: con la variante Q4_K_S (7,2 GB), puede gestionar conversaciones multi-turno sobre dudas de programación, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Evaluación comparativa de cuantizaciones: el repositorio incluye la imatrix y hasta 25 variantes, lo que permite a un equipo medir la degradación de calidad entre cuantizaciones sobre sus propias tareas antes de fijar una versión en producción.
- Experimentación en investigación: al ser Apache 2.0 y estar disponible en GGUF, sirve como base para estudios de cuantización extrema (IQ1, IQ2) y su impacto en tareas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño del archivo GGUF, más overhead de contexto y KV cache):
  - IQ1_S: 3,0 GB
  - IQ2_M: 4,4 GB
  - IQ3_M: 5,7 GB
  - IQ4_XS: 6,8 GB
  - Q4_K_M: 7,6 GB
  - Q5_K_M: 8,8 GB
  - Q6_K: 10,2 GB
- GPUs recomendadas: no especificadas por el autor. Por tamaño, las variantes Q4 y Q5 encajan en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); las variantes IQ2/IQ3 podrían ejecutarse en GPUs de 6-8 GB.
- Cabe en GPU de consumo: sí, al menos en las cuantizaciones bajas y medias; el autor no publica requisitos oficiales.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), text-generation-inference según etiquetas, y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc., aunque no se citan explícitamente en la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparaciones con alternativas de la misma categoría (modelos de código de ~11-12B), ni datos de rendimiento que permitan establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RolBol-Code-11B-Instruct-i1-GGUF | 12.276.772.352 | no disponible | Apache 2.0 | GGUF | Esta ficha |
| Alternativas de ~11-12B para código | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés; el rendimiento en castellano no está documentado y probablemente sea limitado.
- Contexto: la longitud de contexto no se publica, lo que impide planificar su uso en tareas de contexto largo sin validación previa.
- Benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni métricas similares, por lo que la calidad real del modelo no puede contrastarse de forma objetiva.
- Cuantizaciones extremas: el propio autor advierte que IQ1_S es "for the desperate" y que Q2_K_S es de "very low quality"; las variantes por debajo de IQ3 pueden degradar notablemente la calidad, especialmente en código.
- Alucinación y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinación; al ser un modelo ajustado para conversación y código, debe validarse la salida antes de usarla en producción.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base (RolBolSystems/RolBol-Code-11B-Instruct) por si añade restricciones adicionales.
- Procedencia: el modelo base no cuenta con documentación técnica pública detallada (arquitectura, datos, entrenamiento), lo que dificulta auditar su comportamiento.
- Fecha de creación: el repositorio figura creado el 2026-11-24, dato que conviene contrastar con la disponibilidad real del modelo base.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/RolBol-Code-11B-Instruct-i1-GGUF
- Modelo base: https://huggingface.co/RolBolSystems/RolBol-Code-11B-Instruct
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/RolBol-Code-11B-Instruct-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#RolBol-Code-11B-Instruct-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
