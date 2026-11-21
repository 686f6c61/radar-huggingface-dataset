# mradermacher/Qwen3.8-27B-thinkingcap-abliterated-i1-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-thinkingcap-abliterated-i1-GGUF` es una coleccion de cuantizaciones GGUF, generadas con ficheros imatrix, del modelo `hotdogs/Qwen3.8-27B-thinkingcap-abliterated`. No se trata por tanto de un modelo entrenado desde cero por mradermacher, sino de una distribucion de pesos comprimidos lista para inferencia local con llama.cpp y derivados. El modelo subyacente parte de la familia Qwen3 (etiquetado internamente como `qwen3_5` y `qwen3`), con 27.320.697.856 parametros reales segun los safetensors del repositorio, y ha sido afinado mediante SFT sobre el dataset `hotdogs/thinkingcap-sft-qwen38-27b` para un estilo de razonamiento "token-efficient" (modo thinking compacto).

La particularidad del modelo base es doble: por un lado incorpora la tecnica de "abliteration", un procedimiento de modificacion de pesos orientado a eliminar los mecanismos de rechazo aprendidos durante el alineamiento, lo que cambia radicalmente el perfil de seguridad del modelo; por otro, anade capacidades de prediccion multi-token y un modo de pensamiento optimizado para gastar menos tokens de razonamiento. El resultado es un modelo de 27B dense, con licencia Apache 2.0, pensado para despliegues autoalojados donde se prioriza el control total sobre el comportamiento del modelo.

La relevancia practica de esta ficha concreta esta en las cuantizaciones: el repositorio ocupa 218,6 GB e incluye desde variantes i1-Q2_K de 11,0 GB hasta i1-Q6_K de 22,5 GB, lo que permite ejecutar un modelo de 27B en hardware de consumo con compromisos de calidad muy distintos. Los cuants estan generados con imatrix ponderada, lo que segun el autor mejora la calidad frente a cuantizaciones estaticas equivalentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, tag `qwen3_5`); detalles de capas y atencion no disponibles |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE; por el tamano y el repo se asume dense, sin confirmacion explicita) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ3_S, i1-IQ3_M, i1-IQ3_XS, i1-IQ4_XS, i1-Q4_0, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ1_S, i1-IQ1_M, i1-IQ3_XXS, small-IQ4_NL |
| Idiomas soportados | en (segun model card); no se documentan otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |
| Tamano del repositorio | 218,6 GB |
| Fichero imatrix incluido | Si (`Qwen3.8-27B-thinkingcap-abliterated.imatrix.gguf`, 0,1 GB) |
| Cuantizaciones estaticas alternativas | Si, en `mradermacher/Qwen3.8-27B-thinkingcap-abliterated-GGUF` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3, con 27,3B parametros. La model card del repositorio de cuantizaciones no detalla el numero de capas, dimensiones ocultas, tipo de atencion (full, sliding window o hibrida), ni la composicion del corpus de preentrenamiento. Tampoco se documenta el numero de tokens vistos ni si hubo fases de RLHF o DPO. Lo que si se explicita es el pipeline de post-entrenamiento: un ajuste fino supervisado (SFT) sobre `hotdogs/thinkingcap-sft-qwen38-27b`, orientado a un razonamiento eficiente en tokens, y una etapa de abliteration aplicada sobre los pesos resultantes.

Las innovaciones tecnicas declaradas en las etiquetas son tres: "thinkingcap" / "efficient-thinking" / "token-efficient", que apunta a un modo de pensamiento que reduce la longitud de las cadenas de razonamiento frente a los modelos de razonamiento convencionales; "multi-token-prediction", que sugiere un cabezal o esquema de prediccion de varios tokens por paso (relevante para acelerar decodificacion, aunque no se detalla el mecanismo); y "abliterated", que implica la supresion de direcciones de activacion asociadas a comportamientos de rechazo. Esta ultima no es una mejora de capacidad, sino una alteracion del alineamiento de seguridad, con implicaciones que se detallan en la seccion de limitaciones. El autor de las cuantizaciones indica que usa cuantizacion de tensores de salida (`output_tensor_quantised: 1`) y `quantize_version: 2`, con ficheros imatrix ponderados.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat (`conversational` en los tags).
- Razonamiento explicito en modo thinking, optimizado para reducir el consumo de tokens de razonamiento.
- Prediccion multi-token, segun la etiqueta `multi-token-prediction` del modelo base.
- Razonamiento de varios pasos y tareas de tipo agente, por la naturaleza de los datasets de SFT empleados (no se detalla el esquema de tool calling).
- Generacion de codigo y matematicas: capacidad esperable en la familia Qwen3, aunque no se aportan evaluaciones que lo cuantifiquen en esta ficha.
- Capacidades multilingues: la model card solo declara `en`; no hay evidencia de soporte robusto de otros idiomas.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- Sin capacidades de vision ni audio documentadas.

## Casos de uso

- Razonamiento local con presupuesto de tokens ajustado: el modo "thinkingcap" esta disenado para reducir la longitud de las cadenas de pensamiento, lo que abarata el coste por consulta en tareas de clasificacion compleja, extraccion estructurada o analisis de documentos donde no se necesita una traza de razonamiento extensa.
- Despliegue en estaciones de trabajo con una sola GPU de consumo: la variante i1-Q4_K_M (16,9 GB) entra en GPUs de 24 GB, permitiendo ejecutar un modelo de 27B en local sin infraestructura de servidor.
- Procesamiento por lotes offline: con llama.cpp y los cuants i1-Q4_K_S o i1-IQ4_XS (15,4-15,9 GB) se puede montar un pipeline de generacion masiva en una RTX 4090 o similar, priorizando throughput sobre latencia interactiva.
- Entornos de investigacion sobre alineamiento y seguridad: al ser un modelo abliterated con licencia Apache 2.0, sirve como objeto de estudio para medir como la supresion de direcciones de rechazo afecta a la utilidad, la calibracion y la tasa de respuestas daninas, comparandolo con el modelo Qwen3 original.
- Generacion de codigo en pipelines internos: la familia Qwen3 rinde bien en codigo; con tool calling a validar empiricamente, puede integrarse en tareas de autocompletado, generacion de tests o refactorizacion dentro de un CI/CD con revision humana obligatoria.
- Experimentacion con decodificacion especulativa: la etiqueta de prediccion multi-token hace de este modelo un candidato para probar esquemas de draft-model o Medusa-like en llama.cpp, midiendo la ganancia real de throughput.
- Fine-tuning posterior sobre dominio propio: al estar en Apache 2.0 y disponible en safetensors en el modelo base, se puede reentrenar con LoRA sobre datos internos y volver a cuantizar con el imatrix incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada a partir del tamano de fichero):
  - i1-Q2_K: ~11,0 GB de pesos; ~12-13 GB con contexto moderado.
  - i1-IQ3_S / i1-Q3_K_S: ~12,4-12,7 GB; ~14 GB con contexto.
  - i1-Q4_K_S / i1-IQ4_XS: ~15,4-15,9 GB; ~17-18 GB con contexto.
  - i1-Q4_K_M: ~16,9 GB; ~19 GB con contexto.
  - i1-Q5_K_M: ~19,6 GB; ~22 GB con contexto.
  - i1-Q6_K: ~22,5 GB; ~25 GB con contexto.
- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB) para Q4_K_M y Q5_K_S; A100 40 GB o H100 para Q6_K con contexto largo y concurrencia; RTX 4080 / 4070 Ti Super (16 GB) solo con cuants Q3 o IQ3 y contexto recortado.
- Cabe en GPU de consumo: si, con cuants de 11-17 GB en tarjetas de 16-24 GB. En tarjetas de 8-12 GB solo es viable con offload parcial a CPU, con caida notable de velocidad.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), LM Studio, llama-cpp-python, y servidores compatibles con la API de OpenAI sobre llama.cpp. vLLM y TGI no consumen GGUF de forma nativa; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones para estos cuants.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-thinkingcap-abliterated (i1-GGUF, este) | 27,3B | no disponible | Apache 2.0 | GGUF (i1, imatrix) | Razonamiento eficiente en tokens, abliterated, solo `en` declarado |
| Modelo base `hotdogs/Qwen3.8-27B-thinkingcap-abliterated` | 27,3B | no disponible | Apache 2.0 | safetensors | Mismo comportamiento, sin cuantizar; requiere ~55 GB en BF16 |
| Cuants estaticos `mradermacher/...-GGUF` | 27,3B | no disponible | Apache 2.0 | GGUF (estaticos) | Misma base, sin imatrix; menor calidad a igual tamano segun el autor |
| Familia Qwen3 original (variantes 27B/32B) | ~27-32B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Alineamiento de seguridad intacto; referencia para medir el efecto de la abliteration |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo abliterated: la supresion de direcciones de rechazo elimina total o parcialmente las negativas aprendidas durante el alineamiento. No debe desplegarse en aplicaciones orientadas al publico sin una capa de moderacion externa y sin evaluacion previa de seguridad.
- Sesgos: no se documenta ninguna evaluacion de sesgo. El corpus de SFT es un dataset de la comunidad (`hotdogs/thinkingcap-sft-qwen38-27b`) sin ficha de composicion publica en esta informacion, lo que impide auditar que sesgos se han introducido o amplificado.
- Riesgo de alucinacion: no cuantificado. El modo thinking eficiente en tokens puede reducir la profundidad de la cadena de razonamiento y, con ello, la fiabilidad en tareas de varios pasos; conviene validar empiricamente antes de usarlo en dominios factuales.
- Idioma: solo se declara `en`. El rendimiento en castellano es desconocido y no debe asumirse; requiere evaluacion propia.
- Contexto: la longitud de contexto no esta documentada en esta ficha, lo que impide planificar despliegues con documentos largos sin verificacion previa en el modelo base.
- Cuantizaciones de baja precision: i1-Q2_K e i1-IQ2_* degradan la calidad de forma significativa. El propio autor advierte que IQ3_XXS es preferible a Q2_K a igualdad de tamano, y que IQ3_S supera a Q3_K_M.
- Uso comercial: la licencia Apache 2.0 del artefacto permite uso comercial, pero la ausencia de alineamiento de seguridad traslada al integrador toda la responsabilidad legal y reputacional sobre las salidas.
- Trazabilidad: el modelo base procede de un usuario de la comunidad (`hotdogs`) y no de un laboratorio con documentacion tecnica publica; no hay paper, ni ficha de datos, ni evaluaciones oficiales que respalden las capacidades declaradas en los tags.
- Repositorio de 218,6 GB: la descarga completa es costosa; conviene bajar solo el cuant necesario y verificar los hashes.

## Enlaces

- Repositorio de cuantizaciones i1 (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-thinkingcap-abliterated-i1-GGUF
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.8-27B-thinkingcap-abliterated-GGUF
- Modelo base: https://huggingface.co/hotdogs/Qwen3.8-27B-thinkingcap-abliterated
- Dataset de SFT: https://huggingface.co/datasets/hotdogs/thinkingcap-sft-qwen38-27b
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Qwen3.8-27B-thinkingcap-abliterated-i1-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por tipo de cuant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (infraestructura del autor): https://www.nethype.de/
