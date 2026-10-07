# mradermacher/DeepWater-Pleroma-24B-v1-i1-GGUF

## Resumen

DeepWater-Pleroma-24B-v1-i1-GGUF es un repositorio de cuantizaciones GGUF con imatrix (prefijo i1) del modelo OccultAI/DeepWater-Pleroma-24B-v1, publicado por mradermacher, autor habitual de versiones cuantizadas para llama.cpp de modelos de la comunidad. El modelo de origen tiene 23.572.403.200 parametros (unos 23,57 mil millones, de ahi el redondeo a 24B del nombre) y esta etiquetado como un fine-tune conversacional construido con LoRA/SFT sobre las librerias transformers, peft, trl y lora. La model card no especifica la arquitectura, la longitud de contexto, el dataset de entrenamiento ni la licencia.

El valor practico de este repositorio es que permite ejecutar un modelo de ~24B en hardware de consumo: ofrece cuantizaciones desde 5,9 GB (i1-IQ1_M) hasta 19,4 GB (i1-Q6_K), ademas de las variantes estaticas publicadas en un repositorio hermano. Los quants i1 se han generado con una matriz de importancia (imatrix), lo que en la practica suele mejorar la calidad frente a cuantizaciones estaticas del mismo tamano. Es, por tanto, una via de entrada para probar el modelo en llama.cpp, Ollama o LM Studio sin GPU de datacenter.

Hay que tener presente que se trata de un modelo poco validado: 0 descargas y 0 likes en el momento de redactar esta ficha, sin benchmarks publicados y sin licencia declarada, lo que limita su uso en produccion comercial hasta que el autor original aclare estos extremos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica transformer denso, MoE, SSM ni hibrida) |
| Parametros totales | 23.572.403.200 (aprox. 23,57 mil millones) |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF. Quants i1 (imatrix) en este repo: i1-IQ1_M, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K, ademas del fichero imatrix. Quants estaticos en el repo hermano: Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | en (ingles). No se declaran otros idiomas |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones dinamicas i1/imatrix y estaticas); el modelo base esta publicado como adaptador LoRA/PEFT sobre transformers |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo base (tipo de atencion, numero de capas, dimension del hidden state, uso de GQA o de atencion lineal). Lo unico confirmado por las etiquetas del repositorio es que OccultAI/DeepWater-Pleroma-24B-v1 es un fine-tune de tipo LoRA sobre un modelo previo no documentado, entrenado con SFT mediante la libreria TRL y empaquetado con PEFT. Se desconoce el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO y si se aplicaron tecnicas de decodificacion especulativa.

El repositorio de mradermacher no entrena nada: unicamente convierte los pesos a GGUF y los cuantiza. Segun los metadatos internos, usa quantize_version 2, output_tensor_quantised 1 y convert_type hf para los quants i1 generados con matriz de importancia, calculada con ayuda del supercomputador cedido por el usuario @nicoboss. El repositorio completo ocupa 175,3 GB, ya que incluye todas las variantes simultaneamente.

## Capacidades

- Generacion de texto conversacional en ingles: es la unica capacidad explicitamente etiquetada (tag "conversational") en el repositorio.
- Ajuste por instrucciones: la model card declara SFT sobre adaptadores LoRA, lo que implica un modelo afinado para seguir instrucciones, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte de castellano u otros idiomas.
- Capacidades especiales (vision, audio, modo thinking, contexto largo): no documentadas.
- Ejecucion local eficiente: el modelo es plenamente utilizable en llama.cpp y derivados gracias a los quants GGUF, lo que constituye su principal ventaja practica frente al modelo base.

## Casos de uso

- Inferencia local en GPU de consumo: con los quants i1-Q4_K_M (14,4 GB) o i1-Q4_K_S (13,6 GB) el modelo entra en tarjetas de 16-24 GB, permitiendo disponer de un modelo de ~24B sin coste de API.
- Asistente conversacional interno en ingles: el modelo esta etiquetado como conversacional y puede desplegarse con llama-server u Ollama para tareas de chat y redaccion dentro de una organizacion que opere en ingles.
- Investigacion sobre cuantizacion: la disponibilidad simultanea de quants i1 (imatrix) y estaticos en repositorios hermanos permite medir la perdida de perplejidad y calidad entre esquemas de cuantizacion sobre un mismo modelo.
- Base para nuevos fine-tunes: al estar el modelo original publicado como adaptador LoRA/PEFT, es posible reutilizar la tecnica y el pipeline (transformers + peft + trl) para entrenar variantes especializadas.
- Despliegue en entornos air-gapped o sin conexion: al ser un fichero GGUF autocontenido y ejecutable en CPU, encaja en sistemas aislados donde no se puede llamar a APIs externas.
- Pruebas de concepto de producto: sirve para evaluar si un modelo de ~24B cubre las necesidades de una aplicacion antes de invertir en un modelo con licencia clara y benchmarks publicos.
- Reproduccion y auditoria de fine-tunes de la comunidad: el repositorio documenta el modelo base, los parametros de cuantizacion y los ficheros exactos, lo que facilita reproducir experimentos, siempre con la salvedad de que el entrenamiento original no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM son estimaciones a partir del tamano de fichero mas el espacio de trabajo de llama.cpp y una cache KV moderada; el autor no publica requisitos oficiales y la longitud de contexto es desconocida, por lo que la cache KV puede crecer de forma significativa.

| Quant | Tamano en disco | VRAM estimada para inferencia |
|---|---|---|
| i1-IQ1_M | 5,9 GB | ~7 GB |
| i1-IQ2_M | 8,2 GB | ~9-10 GB |
| i1-Q2_K | 9,0 GB | ~10-11 GB |
| i1-IQ3_XXS | 9,4 GB | ~11 GB |
| i1-IQ3_M | 10,8 GB | ~12 GB |
| i1-Q3_K_M | 11,6 GB | ~13 GB |
| i1-IQ4_XS | 12,9 GB | ~14 GB |
| i1-Q4_K_S | 13,6 GB | ~15 GB |
| i1-Q4_K_M | 14,4 GB | ~16 GB |
| i1-Q6_K | 19,4 GB | ~21 GB |
| imatrix (fichero auxiliar) | 0,1 GB | no aplica (solo para crear quants) |

- GPU consumer compatibles: RTX 3060 12 GB o RTX 4070 con los quants IQ3/IQ3_K_M; RTX 4070 Ti Super, RTX 4080 y RTX 5080 (16 GB) con Q4_K_S o Q4_K_M ajustando contexto; RTX 3090, RTX 4090 y RTX 5090 (24 GB) con Q4_K_M e incluso Q6_K, con offload parcial si la cache KV es grande.
- GPU de datacenter: A100 40/80 GB y H100 80 GB permiten cargar los pesos en precision alta, usar contextos largos y servir varias peticiones concurrentes.
- CPU y RAM: al ser GGUF, el modelo puede ejecutarse en CPU con llama.cpp; se recomienda al menos 16 GB de RAM para los quants IQ2/Q2 y 32 GB o mas para Q4_K_M en adelante.
- Opciones de despliegue: llama.cpp y llama-server, Ollama, LM Studio, koboldcpp, text-generation-webui, llama-cpp-python y servidores compatibles con la API de OpenAI. vLLM tiene soporte experimental de GGUF y se limita a ciertos tipos de quant; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponibles. Dependeran del quant elegido, del ancho de banda de memoria de la GPU, del numero de capas descargadas a CPU y de la longitud de contexto, que se desconoce.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/DeepWater-Pleroma-24B-v1-i1-GGUF | 23,57B | no disponible | no disponible | GGUF (i1/imatrix) | 0 descargas, 0 likes |
| mradermacher/DeepWater-Pleroma-24B-v1-GGUF (quants estaticos) | 23,57B | no disponible | no disponible | GGUF (estaticos) | no disponible |
| OccultAI/DeepWater-Pleroma-24B-v1 (modelo base) | 23,57B (presumiblemente identicos) | no disponible | no disponible | no disponible (publicado como LoRA/PEFT) | no disponible |

No es posible establecer una comparativa tecnica fiable con modelos de otras familias, porque no se conocen la arquitectura, el contexto, la licencia ni los benchmarks de este modelo. A titulo de referencia de clase de tamano, en la franja de 24B-32B se situan modelos ampliamente documentados como Mistral Small 3 24B, Gemma 2 27B o Qwen2.5 32B, con contextos de 32K, 8K y 128K respectivamente y licencias de tipo Apache o especifica del fabricante; se trata de datos publicos de esos modelos, no verificados contra DeepWater-Pleroma-24B-v1, y sin resultados de benchmarks de este ultimo la comparacion no permite extraer conclusiones.

## Limitaciones y advertencias

- Licencia no declarada: ni el repositorio de cuantizaciones ni el modelo base indican licencia, por lo que no hay autorizacion explicita para uso comercial. Es un riesgo legal que debe resolverse antes de cualquier despliegue en produccion.
- Idioma: solo se declara ingles. El rendimiento en castellano es desconocido y previsiblemente inferior.
- Contexto desconocido: no se puede planificar un caso de uso que dependa de ventanas largas ni estimar con precision la memoria de la cache KV.
- Sin benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica publicada, de modo que la calidad real del modelo no es verificable.
- Escasa validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta implican ausencia de informes independientes sobre comportamiento, sesgos o estabilidad.
- Degradacion en quants agresivos: el propio autor marca i1-IQ1_M como "mostly desperate", i1-Q2_K_S como "very low quality" y i1-Q2_K con la nota de que IQ3_XXS probablemente sea mejor. Los quants por debajo de Q3 no deberian usarse si la calidad importa.
- Trazabilidad limitada: el modelo base es un fine-tune LoRA sobre un modelo previo no documentado, sin informacion sobre dataset ni proceso de alineacion, lo que dificulta auditar sesgos o contaminacion de datos.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de esta clase, agravado aqui por la falta de evaluaciones publicadas.
- Inconsistencia de nomenclatura: el nombre comercial indica 24B mientras el recuento real es de 23,57 mil millones de parametros; conviene usar la cifra exacta en planificacion de recursos.
- Comportamiento conversacional no especificado: no se documenta la plantilla de chat ni el formato de prompt esperado, por lo que es necesario probar distintas plantillas antes de integrarlo.

## Enlaces

- Repositorio HuggingFace de esta ficha: https://huggingface.co/mradermacher/DeepWater-Pleroma-24B-v1-i1-GGUF
- Modelo base: https://huggingface.co/OccultAI/DeepWater-Pleroma-24B-v1
- Quants estaticos del mismo modelo: https://huggingface.co/mradermacher/DeepWater-Pleroma-24B-v1-GGUF
- Pagina resumen de descargas del autor: https://hf.tst.eu/model#DeepWater-Pleroma-24B-v1-i1-GGUF
- Grafica comparativa de perplejidad entre tipos de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (infraestructura del autor): https://www.nethype.de/
