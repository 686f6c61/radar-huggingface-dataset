# mradermacher/Goose-7.2B-G1l-20261031-GGUF

## Resumen

Goose-7.2B-G1l-20261031-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo base Lambent/Goose-7.2B-G1l-20261031, publicada por el usuario mradermacher, conocido en el ecosistema por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo original cuenta con 7.200.194.560 parametros (aproximadamente 7,2 mil millones) y esta etiquetado como conversacional y orientado a ingles.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 7,2B parametros en hardware de consumo mediante cuantizaciones que van desde 3,0 GB (Q2_K) hasta 14,6 GB (f16), facilitando el despliegue local en estaciones de trabajo y GPUs de gama media. El repositorio ofrece tanto cuantizaciones estaticas (este repo) como cuantizaciones ponderadas con imatrix (repositorio i1-GGUF separado).

No se dispone de informacion publicada sobre la arquitectura interna, los datos de entrenamiento ni los benchmarks del modelo base en la informacion proporcionada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.200.194.560 (7,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura del modelo base Lambent/Goose-7.2B-G1l-20261031 en la informacion proporcionada. El dato de parametros totales (7.200.194.560) proviene de los safetensors del modelo base, lo que confirma un tamano de aproximadamente 7,2B parametros, pero no se especifica si se trata de un transformer denso, un MoE o una arquitectura hibrida.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica informacion tecnica adicional es la derivada del proceso de cuantizacion: se han generado cuantizaciones estaticas (este repositorio) y cuantizaciones ponderadas con imatrix (repositorio i1-GGUF), lo que sugiere que el modelo base es compatible con el pipeline estandar de conversion a GGUF de llama.cpp.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" en Hugging Face, lo que indica que esta orientado a dialogos multi-turno.
- Idiomas: la model card declara unicamente ingles (`language: en`), por lo que no se garantiza un rendimiento solido en castellano u otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la metadata.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo para mantener conversaciones multi-turno sin conexion, usando la cuantizacion Q4_K_M (4,6 GB) que el autor recomienda por su equilibrio entre velocidad y calidad.
- Prototipado de chatbots en hardware de consumo: con la cuantizacion Q2_K (3,0 GB) es posible ejecutar el modelo en GPUs con 4-6 GB de VRAM, lo que permite validar flujos conversacionales antes de migrar a infraestructura mayor.
- Generacion de texto en pipelines por lotes: la cuantizacion Q8_0 (8,0 GB) ofrece la mejor calidad dentro de las versiones de 8 bits y puede integrarse en scripts de generacion masiva de contenido en ingles.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 12 variantes de cuantizacion, lo que permite medir el impacto de la compresion en la perplejidad y la calidad de salida para un caso de uso concreto.
- Despliegue en entornos con restricciones de memoria: la variante IQ4_XS (4,4 GB) emplea cuantizacion con imatrix implicita en el esquema IQ, adecuada para servidores con VRAM limitada que necesitan mantener calidad razonable.
- Fine-tuning o experimentacion sobre el modelo base: dado que el modelo base se distribuye en safetensors con licencia apache-2.0, es posible partir de el para ajuste fino y luego generar nuevas cuantizaciones GGUF con el mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del fichero GGUF mas overhead de contexto):
  - Q2_K: ~3,0 GB de pesos, ~4 GB de VRAM total con contexto moderado.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~3,7 GB de pesos, ~5 GB de VRAM total.
  - IQ4_XS: ~4,4 GB de pesos, ~5,5 GB de VRAM total.
  - Q4_K_S / Q4_K_M: ~4,6 GB de pesos, ~6 GB de VRAM total.
  - Q5_K_S / Q5_K_M: ~5,4 GB de pesos, ~7 GB de VRAM total.
  - Q6_K: ~6,3 GB de pesos, ~8 GB de VRAM total.
  - Q8_0: ~8,0 GB de pesos, ~10 GB de VRAM total.
  - f16: ~14,6 GB de pesos, ~16-17 GB de VRAM total.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 para las cuantizaciones de 4-8 bits; A100 o H100 no son necesarias para un modelo de este tamano, aunque pueden usarse para servir multiples instancias.
- Cabe en GPU de consumo: si, practicamente todas las cuantizaciones de 4 bits o menos caben en GPUs con 8 GB o mas de VRAM; las variantes Q6_K y Q8_0 requieren 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo OpenAI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base que permitan una comparativa rigurosa con alternativas de la misma categoria. A continuacion se ofrece una comparativa estructural basica basada unicamente en los datos disponibles:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Goose-7.2B-G1l-20261031 (este) | 7,2B | no disponible | apache-2.0 | safetensors, GGUF |
| Alternativas de ~7B | no disponible | no disponible | no disponible | no disponible |

No disponible para una comparativa con datos de rendimiento.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Sesgos conocidos: no documentados en la informacion proporcionada; al ser un modelo entrenado con datos web es probable que herede sesgos, pero no se aportan datos concretos.
- Riesgo de alucinacion: no cuantificado; no se han publicado evaluaciones de fidelidad factual.
- Contexto: se desconoce la longitud maxima de contexto soportada, lo que impide garantizar conversaciones largas o documentos extensos.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original (Lambent/Goose-7.2B-G1l-20261031) por si anade restricciones adicionales.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_M o Q4_K_S para uso general.
- Repositorio de 66,5 GB: descargar el repo completo supone un consumo de almacenamiento considerable; conviene descargar solo la cuantizacion necesaria.
- Ausencia de benchmarks: no hay evidencia publica de rendimiento que respalde afirmaciones de calidad frente a otros modelos de 7B.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Goose-7.2B-G1l-20261031-GGUF
- Modelo base: https://huggingface.co/Lambent/Goose-7.2B-G1l-20261031
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Goose-7.2B-G1l-20261031-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Goose-7.2B-G1l-20261031-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
