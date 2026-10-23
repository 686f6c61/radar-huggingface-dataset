# mradermacher/Ministral-3-3B-Claude-Opus-Reasoning-Distilled-i1-GGUF

## Resumen

Ministral-3-3B-Claude-Opus-Reasoning-Distilled-i1-GGUF es la versión cuantizada en formato GGUF del modelo xtools-at/Ministral-3-3B-Claude-Opus-Reasoning-Distilled, un ajuste fino por LoRA del Ministral 3 3B de Mistral AI sobre trazas de razonamiento (chain-of-thought) generadas por modelos Claude Opus 4.5/4.6 y Sonnet 4.5. Lo publica mradermacher, un tercero especializado en cuantización, y no Mistral AI ni el autor del ajuste original; por tanto, la ficha describe una distribución de pesos, no un modelo nuevo entrenado desde cero.

El interés práctico está en concentrar comportamiento de razonamiento explícito en un modelo denso de 3.429.006.336 parámetros (~3,43B) que cabe en hardware de consumo y en equipos de borde. La base Ministral 3 3B es multimodal (lenguaje y visión), con ventana de 256K tokens y function calling nativo según la documentación de Mistral; este repositorio conserva el tokenizador mistral-common y la arquitectura mistral3, pero solo distribuye los pesos de lenguaje en GGUF y no incluye los ficheros mmproj del proyector visual, que quedan en el repositorio de cuantizaciones estáticas.

Es relevante ahora porque permite evaluar localmente, sin GPU de datacenter, hasta qué punto la destilación de razonamiento de un modelo propietario se transfiere a un modelo pequeño abierto. Conviene tener presente que el repositorio no incluye benchmarks, que solo declara inglés y que fue creado el 22 de octubre de 2026 con 0 descargas y 0 likes, es decir, sin validación comunitaria observable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Mistral 3 (tipo `mistral3` en transformers), multimodal en el modelo base; este repo contiene solo pesos de lenguaje en GGUF |
| Parametros totales | 3.429.006.336 (~3,43B), dato de safetensors del modelo base |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens (256K) según la documentación de Ministral 3 3B; no se explicita en la model card de este repositorio |
| Tipos de cuantizacion | GGUF i1 (imatrix/weighted): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, mas fichero imatrix |
| Tipos de cuantizacion (estaticos) | Disponibles en repositorio aparte (mradermacher/Ministral-3-3B-Claude-Opus-Reasoning-Distilled-GGUF) |
| Idiomas soportados | Ingles (`en`) declarado en la model card |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizacion i1 generada con imatrix, `output_tensor_quantised: 1`); el modelo original en safetensors |
| Tamano del repositorio | 41,6 GB (conjunto de todas las cuantizaciones) |
| Fecha de publicacion | 22 de octubre de 2026 (ultima actualizacion: 22 de octubre de 2026) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es Ministral 3 3B, un transformer denso de Mistral AI con tokenizador mistral-common, embeddings atados (tied embeddings) y capacidades multimodales de lenguaje y visión en el modelo original, disenado para despliegue en borde. Sobre esa base, xtools-at aplico un ajuste fino con LoRA (el tag `unsloth` sugiere el uso de esa libreria) para destilar cadenas de razonamiento: el modelo aprende a producir trazas de pensamiento paso a paso antes de la respuesta final. La cuantizacion de este repositorio es una conversion a GGUF con imatrix (etiqueta `i1`, `quantize_version: 2`), es decir, calibrada con una matriz de importancia, no una simple cuantizacion estatica.

Los datos de entrenamiento declarados son cuatro conjuntos publicos de trazas de razonamiento: TeichAI/Claude-Opus-4.6-Reasoning-887x (887 ejemplos), TeichAI/claude-4.5-opus-high-reasoning-250x (250), TeichAI/claude-sonnet-4.5-high-reasoning-250x (250) y Roman1111111/claude-opus-4.6-10000x (10.000). No se documentan tokens totales, composicion exacta, numero de pasos, hiperparametros de LoRA ni si hubo una fase posterior de RLHF o DPO. Tampoco se detalla la innovacion tecnica mas alla de la propia destilacion de razonamiento; no hay atencion lineal, decodificacion especulativa ni modos de pensamiento con presupuesto configurable documentados en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles con trazas de razonamiento explicitas (chain-of-thought) antes de la respuesta, fruto de la destilacion.
- Razonamiento multi-paso en dominios generales, orientado a problemas que se benefician de descomposicion explicita.
- Vision: heredada del modelo base, pero requiere los ficheros mmproj del proyector visual, que no estan en este repositorio sino en el de cuantizaciones estaticas. Sin ellos, el modelo funciona solo como modelo de texto.
- Function calling / tool calling: presente de forma nativa en Ministral 3 3B segun la documentacion de Mistral; el ajuste fino de razonamiento no documenta si preserva o degrada esta capacidad, por lo que debe verificarse empiricamente.
- Uso en agentes y razonamiento multi-paso: plausible por el formato de trazas de pensamiento, aunque no hay evaluaciones publicadas de fiabilidad en bucles de agente.
- Multilingue: limitado al ingles declarado; no se garantiza comportamiento estable en castellano.
- Capacidades especiales: no se documentan modos de vision por audio, thinking mode con presupuesto de tokens ni decodificacion especulativa.

## Casos de uso

- Razonamiento local en equipos sin GPU dedicada: con cuantizaciones IQ3/IQ4 (1,8-2,2 GB) el modelo se ejecuta en CPU via llama.cpp u Ollama, lo que permite prototipar flujos de razonamiento en portatiles o mini-PC antes de invertir en infraestructura.
- Generacion de datos de razonamiento sinteticos: producir trazas de pensamiento en ingles para aumentar datasets de entrenamiento de modelos menores o para construir pares de preferencia, dado el formato CoT del ajuste.
- Asistente de analisis de documentos largos: la ventana de 256K tokens del modelo base permite ingerir contratos, informes o expedientes completos; conviene limitar el contexto en produccion por el coste de memoria de la cache KV.
- Evaluacion comparativa de destilacion: banco de pruebas para medir cuanto razonamiento de un modelo grande propietario se transfiere a 3,43B, comparando contra la base Ministral 3 3B sin ajustar.
- Tutor o explicador paso a paso: el formato de cadena de pensamiento encaja en escenarios educativos donde interesa mostrar el desarrollo, no solo la respuesta, siempre que el contenido se revise por un humano.
- Clasificacion y extraccion con justificacion: tareas de back-office donde se requiere que el modelo razone por que asigna una etiqueta, con la traza como artefacto de auditoria.
- Procesamiento OCR y comprension de documentos con vision: solo si se descargan los mmproj del repositorio estatico y el runtime lo soporta (llama.cpp con `--mmproj`); en ese caso sirve para extraer datos de facturas o formularios escaneados en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun los tamanos de fichero publicados en la model card: IQ1_S 1,0 GB; IQ1_M 1,1 GB; IQ2_XXS 1,2 GB; IQ2_XS 1,3 GB; IQ2_S 1,3 GB; IQ2_M 1,4 GB; IQ3_XXS 1,5 GB; IQ3_XS 1,7 GB; IQ3_S 1,8 GB; IQ3_M 1,8 GB; IQ4_XS 2,1 GB; Q4_0 2,1 GB; IQ4_NL 2,2 GB. Los tamanos de Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M y Q6_K no figuran en el extracto disponible; por el perfil de la serie se situan por encima de 2,2 GB (estimacion, no dato publicado).
- A esos tamanos hay que sumar la cache KV y el overhead del runtime. Como referencia practica, reservar entre 0,5 y 1 GB adicionales para contextos de 8K-16K tokens y varios GB para acercarse a los 256K tokens del modelo base; estas cifras son estimaciones, no mediciones publicadas.
- GPU de consumo: cualquier tarjeta con 4 GB o mas puede alojar cuantizaciones IQ2/IQ3 (GTX 1650, RTX 3050 4 GB); con 8 GB (RTX 3060 Ti, RTX 4060) caben Q4/Q5 con contexto moderado; con 12 GB (RTX 3060 12 GB, RTX 4070) se puede usar Q6_K y ampliar contexto.
- GPU de datacenter (A100 40/80 GB, H100): sobredimensionadas para 3,43B; solo tienen sentido para servir muchas replicas en paralelo o contextos muy largos.
- Despliegue: llama.cpp (soporte nativo de GGUF i1), Ollama (importando el GGUF con un Modelfile), LM Studio, llama-cpp-python. vLLM admite GGUF de forma experimental, con limitaciones frente a safetensors; TGI no esta orientado a GGUF.
- Latencia y throughput: no se han publicado mediciones. Como caveat cualitativo, el formato de razonamiento genera muchos mas tokens de salida que una respuesta directa, lo que incrementa la latencia percibida de forma proporcional al presupuesto de pensamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (mradermacher, i1-GGUF) | 3,43B | 256K (segun doc. de Ministral 3 3B) | GGUF i1, IQ1_S-Q6_K | apache-2.0 | Cuantizado con imatrix; sin benchmarks; 0 descargas |
| xtools-at/Ministral-3-3B-Claude-Opus-Reasoning-Distilled | 3,43B | No disponible en la informacion | safetensors | apache-2.0 | Modelo original sin cuantizar; misma destilacion de razonamiento |
| mradermacher/Ministral-3-3B-Claude-Opus-Reasoning-Distilled-GGUF | 3,43B | No disponible | GGUF estaticos + mmproj | apache-2.0 | Variante con cuantizaciones estaticas; incluye ficheros de vision |
| Ministral 3 3B (Mistral AI) | 3,8B | 256K | No disponible en la informacion | No disponible en la informacion | Base multimodal con function calling nativo y embeddings atados; sin destilacion de razonamiento |
| Ministral 3 8B / 14B (familia Mistral 3) | 8B / 14B | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Alternativas densas de mayor capacidad de la misma familia; sin datos de rendimiento en la informacion disponible |

## Limitaciones y advertencias

- Solo ingles declarado: no hay garantia de calidad en castellano ni en otros idiomas, pese a que el modelo base pudiera tener cobertura multilingue.
- Ausencia total de benchmarks: no se puede afirmar que la destilacion de razonamiento mejore tareas medidas frente a Ministral 3 3B sin ajustar; la mejora en trazas CoT no implica mejor precision final.
- Riesgo de alucinacion: al ser un modelo de 3,43B destilado de trazas sinteticas, puede producir cadenas de razonamiento plausibles pero incorrectas, un patron especialmente peligroso porque la traza aparenta verificacion.
- Degradacion en cuantizaciones bajas: la propia model card califica IQ1_S e IQ1_M como "for the desperate" y Q2_K_S como "very low quality"; por debajo de IQ3 se espera perdida notable de coherencia, critica en tareas de razonamiento.
- Vision incompleta en este repositorio: faltan los ficheros mmproj, luego el modelo no procesa imagenes sin descargar el repositorio estatico.
- Procedencia de los datos de entrenamiento: las trazas provienen de salidas de modelos Claude (propietarios de Anthropic). Aunque la licencia declarada es apache-2.0, la legalidad de reutilizar distilaciones de salidas de un modelo propietario para uso comercial es una cuestion abierta que conviene revisar con asesoria legal antes de produccion.
- Trazas de razonamiento y marcas del profesor: es frecuente que los modelos destilados reproduzcan estilo, formato o incluso afirmaciones de identidad del modelo profesor; debe filtrarse en produccion.
- Function calling y comportamiento de agente no verificados tras el ajuste fino: la capacidad existe en la base, pero el LoRA de razonamiento puede alterar el formato de las llamadas a herramientas.
- Repositorio sin validacion: 0 descargas y 0 likes en la fecha de consulta; no hay evidencia de comunidad que haya verificado la calidad de las cuantizaciones.
- La ventana de 256K procede de la documentacion de Ministral 3 3B, no de la model card de este repositorio; usarla a plena longitud exige memoria muy superior a la del fichero GGUF.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/Ministral-3-3B-Claude-Opus-Reasoning-Distilled-i1-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#Ministral-3-3B-Claude-Opus-Reasoning-Distilled-i1-GGUF
- Cuantizaciones estaticas (incluye mmproj de vision): https://huggingface.co/mradermacher/Ministral-3-3B-Claude-Opus-Reasoning-Distilled-GGUF
- Modelo base sin cuantizar: https://huggingface.co/xtools-at/Ministral-3-3B-Claude-Opus-Reasoning-Distilled
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Documentacion de Ministral 3 3B (Mistral AI): https://docs.mistral.ai/models/ministral-3-3b-25-12
- Anuncio de la familia Mistral 3: https://mistral.ai/news/mistral-3/
- Ficha tecnica de Ministral 3 3B con specs y VRAM: https://apxml.com/models/ministral-3-3b
- Dataset TeichAI/Claude-Opus-4.6-Reasoning-887x: https://huggingface.co/datasets/TeichAI/Claude-Opus-4.6-Reasoning-887x
- Dataset TeichAI/claude-4.5-opus-high-reasoning-250x: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset TeichAI/claude-sonnet-4.5-high-reasoning-250x: https://huggingface.co/datasets/TeichAI/claude-sonnet-4.5-high-reasoning-250x
- Dataset Roman1111111/claude-opus-4.6-10000x: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Referencia de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
