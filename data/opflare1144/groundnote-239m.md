# Opflare1144/groundnote-239m

## Resumen

groundnote-239m es un decodificador de tipo Llama de 239 millones de parámetros (239.109.120 según los pesos en safetensors) entrenado desde cero por el autor Opflare1144 para una tarea muy concreta: convertir una conversación médico-paciente en una nota clínica seccionada con los apartados Chief Complaint, HPI, Past Medical History, Allergies, Physical Exam, Assessment y Plan. No es un modelo generalista: el tokenizador y los pesos se entrenaron sin punto de partida preentrenado, y la mayor parte del ajuste fino proviene de datos sintéticos.

La arquitectura es un transformer denso de 16 capas con dimensión oculta 1024, vocabulario byte-level BPE de 32k tokens y una ventana de contexto de 3.072 tokens, suficiente para transcripciones de consulta cortas pero no para encuentros largos. El preentrenamiento usó 3.000 millones de tokens de FineWeb-Edu (shards 000-003 de `sample/10BT`) durante una época, con un coste declarado de 13,3 horas de GPU, mayoritariamente en H100.

Su relevancia ahora es doble: por un lado demuestra que un modelo de menos de 250M puede generar notas clínicas estructuradas con ROUGE-1 de 48,4 en ACI-Bench test1, superando a la versión anterior de 97,5M del mismo autor; por otro, publica de forma explícita sus fallos de fidelidad (71% de cláusulas no encontradas en la transcripción en visitas reales), lo que lo convierte en un caso de estudio útil sobre alucinación y verificación automática en dominios de alto riesgo. La licencia es CC BY 4.0 y el modelo se distribuye también en ONNX fp16 para ejecución en navegador con transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso estilo Llama (16 capas, d=1024) |
| Parametros totales | 239.109.120 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 3.072 tokens |
| Tipos de cuantizacion | ONNX fp16 (`onnx/model_f16w.onnx`, se convierte a fp32 al iniciar la sesion); pesos safetensors en precision no especificada en la model card; no se publican GGUF ni versiones int8/int4 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors y ONNX (fp16), compatible con transformers y transformers.js |
| Vocabulario | 32k, byte-level BPE entrenado desde cero |
| Pipeline | text-generation |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 16 capas con dimension 1024 y un vocabulario byte-level BPE de 32k tokens, construido íntegramente from scratch: ni el tokenizador ni los pesos parten de un checkpoint preentrenado. El tokenizador se entrenó con unos 300 MB de FineWeb-Edu más el conjunto de entrenamiento del ajuste fino. El preentrenamiento consumió 3.000 millones de tokens de FineWeb-Edu (`sample/10BT`, shards 000-003, licencia ODC-By 1.0) durante una sola época, con un coste de 13,3 horas de GPU, principalmente en H100.

El ajuste fino usó 28.454 ejemplos durante 4 épocas, con la mejor pérdida de validación en la época 3. La composición del dataset es mixta: aproximadamente 18.000 encuentros sintéticos generados por Gemma 4 31B (de unos 20.000 generados, con 5% reservado para dev/test y descarte de notas con dos o más cláusulas contradichas), notas de entrenamiento de ACI-Bench sobremuestreadas y secciones de entrenamiento de MTS-Dialog junto con su aumento por retrotraducción. La model card no documenta RLHF, DPO ni ninguna otra fase de alineamiento. El autor indica que el 63% de los ejemplos de ajuste fino son sintéticos, dato que él mismo señala como causa principal de la brecha de dominio frente a conversaciones reales.

## Capacidades

- Generación de notas clínicas estructuradas en siete secciones fijas (Chief Complaint, HPI, Past Medical History, Allergies, Physical Exam, Assessment, Plan) a partir de una transcripción de consulta.
- Decodificación sección a sección: el código de referencia fuerza las cabeceras y comprueba cada cláusula contra la transcripción.
- Verificación de fidelidad: el repositorio incluye un comprobador de cláusulas que marca afirmaciones no sustentadas por el diálogo original.
- Generación de texto en inglés exclusivamente; no se declara soporte multilingüe.
- Ejecución en navegador mediante transformers.js y el archivo ONNX fp16, sin backend Python.
- Integración con el ecosistema transformers (tag `text-generation-inference` y `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.

## Casos de uso

- Investigación sobre generación de notas clínicas: sirve como línea base reproducible de 239M parámetros para experimentos académicos sobre documentación automática, con métricas ROUGE y de fidelidad ya publicadas y un protocolo de evaluación fijado de antemano en GATE.md.
- Estudio de alucinación en dominios de alto riesgo: al publicar que el 71% de sus cláusulas en visitas reales no aparecen en la transcripción, permite medir y comparar técnicas de detección de afirmaciones no sustentadas sobre un modelo abierto.
- Evaluación de pipelines de verificación de fidelidad: el comprobador de cláusulas del repositorio se puede usar como banco de pruebas para métricas de atribución, comparando el texto generado con la transcripción origen antes de aceptar cualquier salida.
- Docencia sobre arquitecturas desde cero: al incluir tokenizador y pesos entrenados sin checkpoint previo, es un caso didáctico completo de preentrenamiento a pequeña escala (3.000 millones de tokens, 13,3 horas de H100) y ajuste fino supervisado.
- Demostración en navegador y entornos sin GPU: el ONNX fp16 de 480 MB permite ejecutar el modelo con transformers.js en una página web, útil para prototipos de interfaz o pruebas de latencia en cliente.
- Aumento de datos y generación de notas sintéticas: el modelo puede producir borradores de nota para conjuntos de investigación no clínicos, siempre que las transcripciones sean sintéticas o estén debidamente anonimizadas y se aplique revisión manual.
- Base para ajuste fino en otras tareas de resumen estructurado: su tamaño (239M) y licencia permisiva permiten reentrenarlo en dominios con esquemas de secciones fijas, como informes técnicos o resúmenes de reuniones, sin grandes requisitos de cómputo.

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificación greedy sobre splits de test reservados, comparados con el modelo anterior de 97,5M entrenado sin preentrenamiento:

| Conjunto de evaluacion | groundnote-239m | Modelo 97,5M |
|---|---|---|
| ACI-Bench test1 (40 visitas reales): ROUGE-1 | 48,4 | 44,0 |
| ACI-Bench test1: clausulas no encontradas en la transcripcion (nota gold: 37%) | 71% | 84% |
| Sintetico (200 casos): hechos negados escritos como presentes | 3,2% | 7,6% |
| Sintetico: recall de hechos | 83,5% | 60,4% |

Evaluación adicional del modelo ONNX fp16 en navegador, con el mismo script sobre los conjuntos de test del gate: ACI-Bench test1 ROUGE-1 48,3, cláusulas no sustentadas 73,1% y hechos negados escritos como presentes 3,2%. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks generalistas en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 0,48 GB en fp16 (0,96 GB en fp32) solo para los pesos de 239M parámetros; el repositorio completo ocupa 1,4 GB.
- El modelo cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090, así como en iGPU y CPU para inferencia en lotes pequeños.
- Para el ajuste fino conviene una GPU con al menos 16-24 GB (RTX 4090, A10, L4); el preentrenamiento original se hizo mayoritariamente en H100 durante 13,3 horas.
- Despliegue: transformers (versiones indicadas por el autor: torch 2.13.0 y transformers 5.17.0), transformers.js con ONNX en navegador, y el servidor web de ejemplo del repositorio (`python -m groundnote.app`). No se publican pesos GGUF, por lo que llama.cpp y Ollama no están soportados de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada. El único dato relacionado es el tamaño de descarga del ONNX fp16 (480 MB), que se convierte a fp32 al iniciar la sesión, por lo que el cálculo se hace en precisión completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ROUGE-1 en ACI-Bench test1 | Clausulas no sustentadas | Licencia |
|---|---|---|---|---|---|
| groundnote-239m | 239M | 3.072 | 48,4 | 71% | CC BY 4.0 |
| groundnote 97,5M (mismo autor, sin preentrenamiento) | 97,5M | no disponible | 44,0 | 84% | no disponible |
| Otros modelos de generacion de notas clinicas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables de otros modelos comparables de la misma categoría (generación de notas clínicas a partir de diálogo) o de tamaño similar, por lo que la comparación se limita al predecesor del mismo autor.

## Limitaciones y advertencias

- Alucinación documentada en conversaciones reales: el 71% de las cláusulas generadas en ACI-Bench test1 no se encuentran en la transcripción, frente al 37% de las notas escritas por médicos. El autor atribuye la mayor parte de la brecha al cambio de dominio, ya que el 63% de los ejemplos de ajuste fino son sintéticos.
- El autor recomienda explícitamente usar el comprobador de cláusulas y leer cada nota contra su transcripción.
- Prototipo de investigación: no es un producto sanitario y no debe usarse para diagnóstico, tratamiento, documentación de atención real ni apoyo a decisiones clínicas.
- Prohibición de datos reales de pacientes: no se deben introducir transcripciones de pacientes reales.
- Idioma: solo inglés; no hay soporte declarado de castellano ni de otras lenguas.
- Contexto limitado a 3.072 tokens, insuficiente para encuentros largos o historiales extensos.
- Entrenado con datos sintéticos generados por Gemma 4 31B, lo que puede heredar sesgos y patrones estilísticos del modelo generador.
- Sesgos demográficos y clínicos específicos: no se documenta ninguna evaluación de sesgos en la model card.
- Riesgo de sobreajuste al formato de siete secciones: fuera de ese esquema no hay garantía de comportamiento.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero la licencia no exime de las advertencias de uso clínico del autor ni de la normativa aplicable a datos sanitarios.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Opflare1144/groundnote-239m
- Repositorio de código: https://github.com/hxlvvm/groundnote
- Protocolo de evaluación previo (GATE.md): https://github.com/hxlvvm/groundnote/blob/master/GATE.md
- Demo en navegador: https://groundnote.vercel.app/demo.html
- Dataset de preentrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- ACI-Bench: https://github.com/wyim/aci-bench (Yim et al., 2023, CC BY 4.0)
- MTS-Dialog: https://github.com/abachaa/MTS-Dialog (Ben Abacha et al., 2023, CC BY 4.0)
- transformers.js: https://github.com/huggingface/transformers.js
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia ODC-By 1.0 (FineWeb-Edu): https://opendatacommons.org/licenses/by/1-0/
