# mradermacher/unlink-v2-GGUF

## Resumen

unlink-v2-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo unlink-v2, publicado por el usuario Rowhanissick y convertido a GGUF por mradermacher. Se trata de un modelo conversacional de aproximadamente 8.950 millones de parametros (8,95 B) segun los pesos originales en safetensors, lo que lo situa en la categoria de modelos de tamano medio aptos para inferencia local en hardware de consumo. El repositorio contiene unicamente los ficheros cuantizados; no incluye informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion del modelo base.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo base carece de model card sustantiva, no declara licencia ni idiomas soportados, y no cuenta con descargas ni validacion por parte de la comunidad en el momento de la consulta. La unica informacion tecnica verificable es el numero de parametros, el conjunto de cuantizaciones disponibles y el tamano del repositorio (27,1 GB), lo que permite estimar requisitos de hardware pero no evaluar calidad, sesgos ni capacidades reales.

Por tanto, esta ficha documenta lo que se puede afirmar con rigor a partir de los metadatos disponibles y marca explicitamente como "no disponible" todo aquello que no ha sido publicado. Cualquier evaluacion de rendimiento, calidad conversacional o idoneidad para produccion requeriria una validacion empirica por parte del lector.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base unlink-v2. El numero de parametros (8,95 B) es compatible con un transformer denso de escala similar a Llama 3 8B, pero no se confirma en la informacion disponible ni el tipo de atencion, ni la familia de tokenizador, ni si incorpora componentes MoE, SSM o hibridos. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT.

La unica innovacion tecnica documentada corresponde al proceso de cuantizacion realizado por mradermacher, que genera cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) a partir de los pesos en formato Hugging Face. El repositorio incluye un conjunto amplio de niveles de cuantizacion K-quant e I-quant (IQ4_XS), lo que permite ajustar el equilibrio entre calidad y footprint de memoria, pero no se aportan metricas de degradacion por cuantizacion.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" sugiere un modelo ajustado para dialogo multi-turno, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que puede servirse mediante la infraestructura de Inference Endpoints de Hugging Face.
- Capacidades de razonamiento, codigo, matematicas, vision o audio: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M y Q5_K_M de un modelo de 8,95 B caben en GPUs con 8-12 GB de VRAM, lo que permite ejecutar el modelo en una RTX 3060 Ti, RTX 4070 o similar mediante llama.cpp u Ollama para tareas de generacion de texto offline.
- Prototipado de asistentes conversacionales: dado el tag "conversational", puede emplearse para validar flujos de chat multi-turno en entornos de desarrollo antes de migrar a un modelo con documentacion y licencia verificadas.
- Servicio de inferencia mediante Hugging Face Inference Endpoints: el tag "endpoints_compatible" permite desplegarlo como endpoint gestionado para pruebas de integracion con aplicaciones cliente.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce niveles de cuantizacion, lo que lo hace util para medir empiricamente el impacto de Q2_K frente a Q8_0 en perplejidad y calidad de respuesta sobre el mismo modelo base.
- Experimentacion academica con modelos no documentados: util para estudiar como se comportan modelos sin model card sustantiva en tareas controladas, siempre que se asuma el riesgo de sesgos y alucinaciones no medidos.
- Generacion de texto por lotes en CPU: las cuantizaciones Q2_K y Q3_K_S reducen el modelo a un rango de 3-5 GB, permitiendo inferencia en CPU con llama.cpp para tareas de baja criticidad y throughput moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, calculada a partir de 8,95 B de parametros):
  - x-f16: ~18 GB
  - Q8_0: ~9,5 GB
  - Q6_K: ~7,4 GB
  - Q5_K_M: ~6,3 GB
  - Q4_K_M: ~5,4 GB
  - Q3_K_M: ~4,4 GB
  - Q2_K: ~3,4 GB
  - IQ4_XS: ~5,0 GB
- GPU recomendadas: A100 40 GB o H100 para x-f16 sin cuantizar; RTX 4090 (24 GB) para Q8_0 con contexto largo; RTX 4070 Ti / 4080 (12-16 GB) para Q5_K_M y Q6_K; RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando Q4_K_M o inferiores; en 6 GB con Q3_K_M o Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, Hugging Face Inference Endpoints (tag endpoints_compatible), vLLM (requiere conversion previa a safetensors o soporte GGUF experimental), TGI (soporte GGUF limitado).
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Documentacion |
|---|---|---|---|---|---|
| unlink-v2-GGUF | 8,95 B | no disponible | no disponible | GGUF | Minima (solo metadatos de cuantizacion) |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Completa (model card, benchmarks) |
| Mistral 7B Instruct v0.3 | 7,24 B | 32 K | Apache 2.0 | safetensors, GGUF | Completa |
| Qwen2.5 7B Instruct | 7,62 B | 128 K | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Completa |

La comparativa se ofrece como referencia de categoria por tamano; no implica equivalencia de rendimiento, ya que unlink-v2 no publica benchmarks ni licencia que permitan una comparacion funcional rigurosa.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan datos de entrenamiento, arquitectura, alineacion ni evaluaciones, lo que impide auditar sesgos o comportamientos esperados.
- Licencia no declarada: no se puede asumir uso comercial permitido; en ausencia de licencia explicita, los derechos de uso quedan en un limbo legal que desaconseja su empleo en produccion.
- Idiomas no declarados: se desconoce la cobertura linguistica real y la calidad en castellano.
- Riesgo de alucinacion no medido: sin benchmarks ni evaluaciones publicadas, no hay evidencia sobre la tasa de respuestas incorrectas o inventadas.
- Sesgos desconocidos: al no publicarse la composicion del dataset, no es posible anticipar sesgos de genero, raza, ideologia o geograficos.
- Contexto desconocido: se ignora la ventana maxima soportada, lo que impide planificar aplicaciones con documentos largos.
- Cero traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta implican ausencia de validacion por terceros.
- Repositorio de 27,1 GB con doce cuantizaciones: descargar el repo completo es costoso; conviene seleccionar un unico fichero GGUF segun el hardware objetivo.
- El autor de la cuantizacion (mradermacher) no es el autor del modelo base (Rowhanissick); la responsabilidad sobre la calidad del modelo recae en el segundo, que no aporta documentacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/unlink-v2-GGUF
- Modelo base: https://huggingface.co/Rowhanissick/unlink-v2
- Perfil del cuantizador: https://huggingface.co/mradermacher
