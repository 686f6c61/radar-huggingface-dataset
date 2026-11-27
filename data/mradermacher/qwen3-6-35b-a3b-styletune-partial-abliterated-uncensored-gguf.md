# mradermacher/Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored-GGUF

## Resumen

Esta ficha describe la cuantización GGUF realizada por mradermacher del modelo `LeVraiCNL/Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored`, una variante experimental de la familia Qwen con arquitectura Mixture-of-Experts (MoE). El modelo base parte de un checkpoint de aproximadamente 34.660 millones de parámetros totales, del cual solo una fracción se activa por token (de ahí el sufijo A3B, que sugiere unos 3.000 millones de parámetros activos). El autor original ha aplicado un proceso de "abliteration" parcial y "style tune" para reducir los rechazos del modelo ante ciertas peticiones, orientándolo a usos sin filtrado.

El repositorio que nos ocupa es una conversión a formato GGUF en múltiples niveles de cuantización estática (de Q2_K a Q8_0), pensada para ejecución local con llama.cpp y derivados. No se trata de un modelo entrenado desde cero, sino de un artefacto de distribución: la model card no aporta datos sobre el dataset de entrenamiento, la longitud de contexto, los idiomas soportados más allá del inglés ni resultados de benchmarks.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo típico de la cadena de valor de la comunidad open source: un ajuste experimental sobre una base Qwen, seguido de cuantización por un tercero para hacerlo desplegable en hardware de consumo. Por otro, advierte de las limitaciones de trazabilidad cuando se trabaja con modelos derivados de los que no se publican detalles de entrenamiento ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, según tag `qwen3_5_moe` |
| Parametros totales | 34.660.610.688 (34,66 mil millones) |
| Parametros activos | no disponible (el sufijo A3B sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas; no hay imatrix) |
| Idiomas soportados | en (inglés, según model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 237,1 GB con todos los quants); el base en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen y emplea una arquitectura Mixture-of-Experts, tal como indica el tag `qwen3_5_moe`. La nomenclatura "35B-A3B" es coherente con un diseño en el que el total de parámetros ronda los 35.000 millones y solo una fracción pequeña (del orden de 3.000 millones) se activa por token, lo que reduce el coste computacional en inferencia respecto a un modelo denso del mismo tamaño. No obstante, la model card no especifica el número exacto de expertos, la dimensión oculta, el número de capas ni el mecanismo de enrutamiento.

Respecto al entrenamiento, la información disponible es mínima: no se documenta el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. Lo único inferible del nombre es que el autor original aplicó un proceso de "partial abliteration" (eliminación parcial de direcciones de rechazo en el espacio de activaciones) y un "style tune" orientado a modificar el estilo de respuesta. Estos procesos son técnicas de post-entrenamiento de la comunidad, no documentadas aquí con detalle. La cuantización de mradermacher es estática y no incluye variantes con imatrix, lo que puede suponer una pérdida de calidad algo mayor en los niveles bajos (Q2, Q3) frente a cuantizaciones ponderadas.

## Capacidades

- Generación de texto conversacional en inglés, según el pipeline declarado (`conversational`).
- Razonamiento y generación de código: capacidades heredadas del modelo base Qwen, aunque no verificadas en esta model card.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: limitadas al inglés según la model card, aunque el modelo base Qwen suele ser multilingüe; no verificable aquí.
- Modo "thinking": no disponible.
- Visión o audio: no disponible.
- Comportamiento "uncensored": el ajuste de abliteration parcial busca reducir los rechazos ante peticiones que el modelo base rechazaría, sin garantía de eliminación total.

## Casos de uso

- Experimentación con modelos MoE en local: gracias a las cuantizaciones Q4_K_S (20,0 GB) y Q4_K_M (21,3 GB), es posible ejecutar un MoE de 35B totales en una GPU de consumo con 24 GB de VRAM, aprovechando que solo se activan ~3B parámetros por token.
- Investigación sobre abliteration: permite estudiar cómo afecta la eliminación parcial de direcciones de rechazo al comportamiento del modelo en tareas de clasificación de seguridad y en la calidad general de las respuestas.
- Pruebas de estilo y personalidad: el componente "StyleTune" hace de este checkpoint un banco de pruebas para evaluar cómo un ajuste de estilo altera la coherencia y el tono en conversaciones multi-turno.
- Evaluación de cuantizaciones: al ofrecer diez niveles (de Q2_K a Q8_0), sirve para medir la degradación de perplejidad y calidad entre cuantizaciones en un modelo MoE, comparando Q4_K_M frente a Q8_0 en tareas de razonamiento.
- Desarrollo de prototipos de chat sin conexión: con llama.cpp u Ollama, se puede desplegar un asistente conversacional local en inglés para entornos sin acceso a la nube, aceptando la limitación idiomática.
- Análisis de robustez y sesgos: útil para investigadores que necesiten un modelo con filtros reducidos para estudiar respuestas ante prompts sensibles, siempre en un entorno controlado y con las advertencias éticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según el tamaño del archivo GGUF):
  - Q2_K: ~13,0 GB.
  - Q3_K_M: ~16,9 GB.
  - Q4_K_S: ~20,0 GB (recomendado por el autor por velocidad).
  - Q4_K_M: ~21,3 GB (recomendado por el autor).
  - Q5_K_M: ~24,8 GB.
  - Q6_K: ~28,6 GB.
  - Q8_0: ~37,0 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con margen ajustado; RTX 3090 (24 GB) igual; A100 40 GB o H100 para Q6_K y Q8_0; para Q8_0 también sirve una A6000 (48 GB).
- ¿Cabe en GPU de consumo? Sí: Q4_K_S y Q4_K_M caben en tarjetas de 24 GB; Q3_K_M y Q2_K caben en tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el base en safetensors, vLLM o TGI (no verificado para esta variante).
- Latencia y throughput: no disponibles. Al ser MoE con ~3B activos, se espera un throughput superior al de un denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored (este) | 34,66B | ~3B (no confirmado) | no disponible | apache-2.0 | GGUF, safetensors |
| Qwen2.5-32B-Instruct | 32,5B | denso | 32.768 tokens (ampliable) | apache-2.0 | safetensors, GGUF |
| Mixtral-8x7B-Instruct | 46,7B | ~12,9B | 32.768 tokens | apache-2.0 | safetensors, GGUF |
| Qwen1.5-MoE-A2.7B | 14,3B | ~2,7B | 32.768 tokens | apache-2.0 | safetensors |

La comparación es orientativa: los modelos Qwen y Mixtral citados son referencias conocidas de la misma categoría (MoE o densos de tamaño medio-grande), pero no se dispone de evaluaciones del modelo de esta ficha que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Trazabilidad limitada: la model card no documenta dataset, número de tokens, método de alineación ni evaluaciones; no es posible verificar la calidad del ajuste "StyleTune".
- Abliteration parcial: el proceso puede degradar la coherencia, aumentar la tasa de alucinación o producir respuestas incoherentes en dominios sensibles; no hay garantía de que elimine todos los rechazos.
- Idiomas: declarado solo en inglés; el uso en castellano no está soportado oficialmente y puede dar resultados pobres.
- Contexto desconocido: al no publicarse la longitud de contexto, no se debe asumir una ventana larga en producción.
- Licencia apache-2.0: permite uso comercial, pero el modelo base y el ajuste pueden arrastrar obligaciones adicionales no documentadas; conviene revisar la licencia del checkpoint original de Qwen.
- Cuantizaciones estáticas sin imatrix: los niveles Q2_K y Q3_K pueden presentar una degradación de calidad mayor que sus equivalentes ponderados.
- Sin benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas estándar.
- Riesgo ético: al tratarse de un modelo "uncensored", su uso en producción requiere filtros externos y supervisión humana.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored-GGUF
- Modelo base: https://huggingface.co/LeVraiCNL/Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-StyleTune-Partial-Abliterated-Uncensored-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
