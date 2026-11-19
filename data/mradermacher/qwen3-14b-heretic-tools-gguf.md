# mradermacher/Qwen3-14B-heretic-tools-GGUF

## Resumen

Qwen3-14B-heretic-tools-GGUF es una distribucion de cuantizaciones GGUF del modelo avi686/Qwen3-14B-heretic-tools, un fine-tuning no oficial de Qwen3-14B desarrollado por un tercero (avi686) y cuantizado por mradermacher. El modelo original parte de la familia Qwen3 de Alibaba, concretamente de la variante densa de 14B parametros, y ha sido ajustado con un enfoque "heretic" (orientado a reducir rechazos y restricciones de alineamiento) y con capacidades de uso de herramientas (tool calling).

El repositorio no aporta informacion sobre la composicion del dataset de fine-tuning, el proceso de entrenamiento ni los resultados de evaluacion. Se trata, por tanto, de una ficha basada en los metadatos disponibles y en las caracteristicas conocidas de la arquitectura Qwen3-14B, sin datos verificados sobre el comportamiento especifico de esta variante.

La relevancia practica del repositorio es la disponibilidad de pesos en formato GGUF en once niveles de cuantizacion (desde Q2_K de 5,9 GB hasta Q8_0 de 15,8 GB), lo que permite ejecutar un modelo de 14.768.307.200 parametros en hardware de consumo mediante llama.cpp u Ollama. La licencia del modelo no esta declarada en la informacion disponible, lo que constituye un riesgo relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-14B; detalles de atencion no disponibles) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no declarada en la model card; el modelo base Qwen3-14B soporta contextos largos, pero este fine-tuning no especifica configuracion) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (cuantizaciones estaticas; no hay quants con imatrix) |
| Idiomas soportados | en (declarado); capacidades multilingues del base no verificadas en esta variante |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y pesos originales en safetensors en el repositorio base |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-14B: un transformer denso de 14.768.307.200 parametros. La model card de este repositorio no documenta la configuracion de capas, cabeceras, tipo de atencion ni la estrategia de RoPE, por lo que no se puede confirmar si incorpora las optimizaciones de atencion de la familia Qwen3. Tampoco se especifica si el modelo conserva el modo de razonamiento extendido (thinking) del base.

Sobre el entrenamiento del fine-tuning original (avi686/Qwen3-14B-heretic-tools) no hay informacion disponible: se desconoce el volumen de tokens, la composicion del dataset, si se emplearon tecnicas de RLHF, DPO o abliteration, y que datos de tool calling se utilizaron. El sufijo "heretic" sugiere una intervencion orientada a reducir la tasa de rechazos, y "tools" indica un ajuste para function calling, pero ninguno de estos extremos esta documentado en la informacion proporcionada. mradermacher solo declara la conversion a GGUF con cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y advierte de que no hay cuantizaciones ponderadas con imatrix disponibles.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` del repositorio.
- Uso de herramientas (tool calling / function calling), inferido del nombre del modelo base; no hay ejemplos ni esquema de plantilla documentados en esta ficha.
- Razonamiento multi-paso: no confirmado para esta variante; el modelo base Qwen3 incorpora modo de razonamiento, pero no se especifica si el fine-tuning lo conserva.
- Capacidades de codigo y matematicas: no documentadas para esta variante; dependen del modelo base y del grado de degradacion introducido por el fine-tuning.
- Multilingue: el repositorio declara unicamente `en`; no se garantiza el rendimiento en castellano ni en otros idiomas.
- Vision y audio: no soportados (modelo de texto).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede ejecutarse en un portatil con GPU de consumo usando la cuantizacion Q4_K_M (9,1 GB), adecuada para dialogos multi-turno sin dependencia de API externa.
- Prototipado de agentes con tool calling: el ajuste "tools" permite experimentar con llamadas a funciones en entornos controlados, aunque sin garantias documentadas de fiabilidad en produccion.
- Evaluacion de alineamiento y robustez: util como material de estudio para investigadores que analizan el efecto de fine-tunings "heretic" sobre la tasa de rechazos y la seguridad del modelo.
- Despliegue en entornos con recursos limitados: la cuantizacion Q2_K (5,9 GB) permite ejecutar el modelo en GPUs de 8 GB de VRAM con perdida notable de calidad, util para pruebas de humo.
- Generacion de texto por lotes en ingles: con llama.cpp y Q8_0 (15,8 GB) se obtiene la maxima calidad disponible en este repositorio para tareas de resumen o reescritura offline.
- Base para fine-tuning adicional: los pesos safetensors del repositorio original permiten partir de esta variante para ajustes especificos, siempre que la licencia lo permita (no verificada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y cache KV):
  - Q2_K: 5,9 GB de pesos; ~7-8 GB de VRAM con contexto moderado.
  - Q4_K_M: 9,1 GB de pesos; ~11-12 GB de VRAM.
  - Q5_K_M: 10,6 GB de pesos; ~13 GB de VRAM.
  - Q6_K: 12,2 GB de pesos; ~14-15 GB de VRAM.
  - Q8_0: 15,8 GB de pesos; ~17-18 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q5_K_M; RTX 4060 Ti 16 GB o RTX 3080 (10-12 GB) para Q4_K_M; A100 40/80 GB y H100 para despliegues concurrentes con vLLM o TGI (estos ultimos no consumen GGUF de forma nativa, requeririan los pesos safetensors del repositorio base).
- Cabe en GPU de consumo: si, desde Q2_K en 8 GB hasta Q8_0 en 24 GB. Las cuantizaciones Q4_K_S y Q4_K_M son las recomendadas por el autor por equilibrio velocidad/calidad.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; LM Studio; llama-cpp-python. Para vLLM o TGI seria necesario convertir los pesos o usar el repositorio original en safetensors. El repositorio incluye el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles; no se han publicado mediciones para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-14B-heretic-tools (este, GGUF) | 14,77B | no disponible | no disponible | GGUF | Fine-tuning no oficial con tool calling; solo ingles declarado |
| Qwen3-14B (oficial) | 14,77B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Modelo base oficial; alineamiento estandar y capacidades multilingues documentadas por el autor original |
| Otros fine-tunings GGUF de Qwen3-14B de mradermacher | 14,77B | depende del base | depende del base | GGUF | Mismo pipeline de cuantizacion estatica; calidad dependiente del fine-tuning de origen |

No se dispone de datos de rendimiento comparado para esta variante, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base avi686/Qwen3-14B-heretic-tools y la de Qwen3-14B antes de cualquier despliegue productivo.
- Fine-tuning "heretic": el objetivo declarado implica reducir rechazos, lo que puede aumentar la probabilidad de contenido inseguro, sesgado o no filtrado. No es adecuado para aplicaciones orientadas al publico sin una capa de moderacion adicional.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior al del modelo base.
- Sin benchmarks: no hay evidencia publicada de calidad, tool calling ni razonamiento para esta variante; el sufijo "tools" no garantiza un esquema de function calling funcional.
- Riesgo de alucinacion: inherente a los modelos de 14B y potencialmente agravado por un fine-tuning no documentado.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S degradan notablemente la calidad; el autor solo recomienda explicitamente Q4_K_S, Q4_K_M y Q8_0.
- Sin cuantizaciones imatrix: el autor indica que no estan disponibles, lo que reduce la calidad por bit frente a alternativas ponderadas.
- Contexto no declarado: no se puede asumir la ventana nativa de Qwen3-14B sin comprobacion empirica.
- Repositorio con 1 like y autor de fine-tuning no verificado: menor trazabilidad y soporte comunitario que las distribuciones oficiales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3-14B-heretic-tools-GGUF
- Modelo base del fine-tuning: https://huggingface.co/avi686/Qwen3-14B-heretic-tools
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3-14B-heretic-tools-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
