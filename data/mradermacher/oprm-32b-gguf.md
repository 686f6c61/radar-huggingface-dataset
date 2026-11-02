# mradermacher/OPRM-32B-GGUF

## Resumen

OPRM-32B-GGUF es la distribucion en formato GGUF del modelo OPRM-32B, desarrollado originalmente por ritzzai y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 32.763.876.352 parametros (aproximadamente 32,8 mil millones), pensado para generacion de texto conversacional en ingles y publicado bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales. Esta version concreta no es un modelo nuevo, sino un conjunto de cuantizaciones estaticas del modelo base en safetensors, orientadas a su despliegue en llama.cpp y entornos compatibles con GGUF.

La relevancia de esta ficha radica en que el repositorio ofrece once variantes de cuantizacion que van desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB), lo que permite ajustar el modelo a distintos presupuestos de VRAM y RAM. Al tratarse de una cuantizacion estatica (sin imatrix ni quants ponderados, segun indica el propio autor), el equilibrio entre tamano y calidad es el habitual de las cuantizaciones K-quant de llama.cpp, sin optimizaciones adicionales por capa.

No se dispone de informacion publica sobre la arquitectura interna, la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks del modelo base en la informacion proporcionada. La model card del repositorio cuantizado se limita a describir el proceso de cuantizacion y los ficheros disponibles, por lo que buena parte de las especificaciones tecnicas se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, segun el pipeline de transformers; detalles no publicados) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base ritzzai/OPRM-32B) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base ritzzai/OPRM-32B en la documentacion disponible. Por el numero de parametros (32,8 mil millones) y la etiqueta de libreria `transformers` con pipeline conversacional, se trata con alta probabilidad de un transformer decoder-only de gran tamano, pero no se confirma el tipo exacto de atencion, la presencia de capas MoE, ni innovaciones como atencion lineal o decodificacion especulativa.

Tampoco se dispone de datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones de codigo o matematicas), ni sobre si se aplicaron fases de RLHF, DPO o ajuste por instrucciones. El repositorio cuantizado unicamente documenta el proceso de conversion: cuantizacion estatica con `quantize_version: 2` y `output_tensor_quantised: 1`, sin quants ponderados ni imatrix en el momento de la publicacion. El autor indica que estos ultimos podrian no estar disponibles y que pueden solicitarse mediante una discusion en la comunidad.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta de pipeline del modelo base.
- Razonamiento de proposito general: no hay documentacion especifica que confirme capacidades avanzadas de matematicas o codigo, por lo que deben validarse empiricamente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de consumo: la variante Q4_K_M (20,0 GB) o IQ4_XS (18,0 GB) permite ejecutar el modelo en una RTX 4090 de 24 GB o en una RTX 3090, con margen para contexto moderado, usando llama.cpp u Ollama.
- Asistente conversacional local en ingles: con la cuantizacion Q5_K_M (23,4 GB) se obtiene un equilibrio razonable entre calidad y huella de memoria para chatbots de escritorio sin conexion.
- Prototipado de pipelines RAG: el modelo puede integrarse como generador en sistemas de recuperacion aumentada en ingles, siempre que se valide su ventana de contexto real (no documentada).
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes, lo que facilita estudios de degradacion de perplejidad y calidad entre Q2_K y Q8_0 en tareas concretas.
- Servicio de inferencia en servidores con CPU y RAM abundante: la variante Q2_K (12,4 GB) o Q3_K_S (14,5 GB) permite ejecucion en CPU con llama.cpp en maquinas con 16-32 GB de RAM, a costa de menor calidad.
- Fine-tuning o experimentacion con el modelo base: al estar el original en safetensors bajo licencia MIT, se puede partir de ritzzai/OPRM-32B para ajuste supervisado o LoRA antes de cuantizar de nuevo.
- Investigacion sobre cuantizacion estatica: util para comparar el impacto de quants K frente a IQ en un modelo de ~33B sin disponer de versiones imatrix.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo completo en GPU):
  - Q2_K: ~12,4 GB de pesos, ~14 GB con overhead de contexto.
  - Q3_K_M: ~16,0 GB de pesos, ~18 GB con overhead.
  - IQ4_XS: ~18,0 GB de pesos, ~20 GB con overhead.
  - Q4_K_M: ~20,0 GB de pesos, ~22 GB con overhead.
  - Q5_K_M: ~23,4 GB de pesos, ~26 GB con overhead.
  - Q6_K: ~27,0 GB de pesos, ~30 GB con overhead.
  - Q8_0: ~34,9 GB de pesos, ~38 GB con overhead.
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M o IQ4_XS completos; Q5_K_M con contexto corto.
  - RTX 3090 (24 GB): mismo perfil que la 4090.
  - A100 40 GB / H100 80 GB: Q8_0 completo con contexto amplio.
  - Multi-GPU (2x RTX 4090 o 2x A6000): Q6_K y Q8_0.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 Super (16 GB, solo Q2_K/Q3_K_S con contexto reducido) y en GPUs de 24 GB para Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OPRM-32B-GGUF (este) | 32,8 B | no disponible | MIT | GGUF | 11 cuantizaciones estaticas, solo ingles |
| ritzzai/OPRM-32B (base) | 32,8 B | no disponible | MIT | safetensors | Modelo original sin cuantizar |
| Qwen2.5-32B-Instruct | 32,5 B | 128K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Multilingue, benchmarks publicos |
| Gemma-2-27B-it | 27 B | 8K | Gemma license | safetensors, GGUF | Multilingue, restricciones de uso |

La comparativa con Qwen2.5-32B y Gemma-2-27B se ofrece como referencia de categoria (modelos densos de ~27-33B), pero no se dispone de datos de rendimiento de OPRM-32B que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Solo se documenta soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado y debe validarse.
- No hay informacion publica sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad, lo que dificulta estimar riesgos de sesgo o toxicidad.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; no se han publicado evaluaciones de factualidad.
- La licencia MIT del repositorio cuantizado permite uso comercial, pero conviene verificar que el modelo base ritzzai/OPRM-32B mantiene la misma licencia y no impone restricciones adicionales.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable; el propio autor marca Q3_K_M como "lower quality".
- No hay quants imatrix ni ponderados disponibles, lo que puede suponer una perdida de calidad frente a cuantizaciones optimizadas por capa.
- La longitud de contexto no esta documentada; planificar el despliegue con contexto conservador hasta validarla.
- El modelo tiene muy pocas descargas (86) y ningun "like", lo que sugiere escasa validacion por parte de la comunidad.
- El repositorio ocupa 224 GB en total por incluir todas las variantes; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/OPRM-32B-GGUF
- Modelo base: https://huggingface.co/ritzzai/OPRM-32B
- Pagina de descargas del autor: https://hf.tst.eu/model#OPRM-32B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
