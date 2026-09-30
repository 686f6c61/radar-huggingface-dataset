# Green-Eye/Llama-3.3-8B-Instruct-128K-heretic-GGUF

## Resumen

Green-Eye/Llama-3.3-8B-Instruct-128K-heretic-GGUF es una distribucion en formato GGUF del modelo aeon37/Llama-3.3-8B-Instruct-128K-heretic, una variante "heretic" (abliterated / decensored) de Llama-3.3-8B-Instruct con ventana de contexto extendida a 128.000 tokens. El repositorio lo publica el usuario Green-Eye y contiene cuantizaciones estaticas generadas originalmente por mradermacher, tal como indica la propia model card (campo quantized_by: mradermacher).

El modelo resuelve un problema muy concreto: permitir la ejecucion local de un asistente conversacional de 8.030.261.312 parametros (8,03B) sin las restricciones de rechazo tipicas del modelo alineado original. La ablacion de la direccion de rechazo ("heretic"/abliterated) elimina la mayoria de negativas del modelo base, lo que resulta util en investigacion de seguridad, red-teaming, generacion de datos sinteticos y escritura creativa sin filtros, pero lo aleja de un uso comercial convencional.

Su relevancia practica es la combinacion de tres factores: tamano contenido (cabe en GPU de consumo con cuantizaciones Q4), contexto de 128K segun la denominacion del modelo y formato GGUF listo para llama.cpp/Ollama/LM Studio. El repositorio ofrece 12 ficheros de cuantizacion (de Q2_K a f16) que cubren desde 3,3 GB hasta 16,2 GB de pesos, con un total de repositorio de 71,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con GQA (familia Llama 3.3) |
| Parametros totales | 8.030.261.312 (8,03B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (segun la denominacion del modelo; no verificado de forma independiente) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.3 (Meta Llama 3.3 Community License) |
| Formato de pesos | GGUF (12 ficheros); el repo base del que deriva usa safetensors |
| Modelo base | aeon37/Llama-3.3-8B-Instruct-128K-heretic |
| Cuantizador | mradermacher (cuantizaciones estaticas, no imatrix) |
| Tamano del repositorio | 71,8 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.3 8B Instruct: transformer decoder-only denso, con Grouped-Query Attention (GQA) y RoPE, tokenizador de Llama 3 y plantilla de chat heredada del modelo instruct original. No hay innovaciones arquitectonicas propias en esta variante: el cambio respecto al modelo base es de alineamiento, no de estructura. La ventana de 128.000 tokens procede de la variante de contexto extendido del modelo base (aeon37/Llama-3.3-8B-Instruct-128K-heretic).

La modificacion clave es la ablacion direccional de la direccion de rechazo en el flujo residual ("abliterated"/"heretic"), una tecnica de edicion de pesos que no requiere reentrenamiento ni RLHF adicional: se identifica la direccion latente asociada a las negativas de seguridad y se proyecta fuera de los pesos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de DPO/RLHF en esta variante; esos datos no estan disponibles. Sobre esta variante alineada, mradermacher aplico cuantizacion estatica (k-quants e IQ4_XS) y Green-Eye redistribuye los ficheros.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con soporte de contexto largo (hasta 128K tokens segun la denominacion del modelo).
- Modo instruct: sigue instrucciones y responde en formato chat con la plantilla de Llama 3.
- Escritura creativa y generacion de contenido sin filtros de rechazo: la ablacion reduce de forma deliberada las negativas del modelo alineado.
- Generacion de codigo y asistencia tecnica basica, heredada de Llama 3.3 8B Instruct.
- Razonamiento de un solo paso y tareas de matematicas simples, sin modo "thinking" explicito.
- Capacidad de ejecucion local/offline en GPU de consumo gracias al formato GGUF y a las cuantizaciones de 4 bits.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta variante cuantizada.
- Soporte de agentes y multi-step reasoning: no documentado; no disponible.
- Vision, audio o multimodalidad: no disponible (modelo exclusivamente de texto).
- Multilingue: limitado al ingles segun los metadatos (language: en); el modelo base tiene capacidades multilingues, pero no estan declaradas aqui.

## Casos de uso

- Red-teaming y evaluacion de seguridad: permite generar respuestas que un modelo alineado rechazaria, de modo que un equipo de seguridad puede estudiar modos de fallo, jailbreaks y vectores de abuso antes de desplegar sistemas en produccion.
- Generacion de datos sinteticos para fine-tuning: sirve para producir pares instruccion-respuesta diversos y sin filtrado excesivo que despues se curan y se usan como corpus de entrenamiento o de evaluacion.
- Investigacion sobre abliteration: comparar este modelo con su base alineado (aeon37/Llama-3.3-8B-Instruct-128K-heretic y Llama-3.3-8B-Instruct) para medir que capacidades se degradan al ablacionar la direccion de rechazo.
- Asistente local offline sobre documentos largos: con 128K tokens de contexto se puede cargar un informe, un expediente o un repositorio de documentacion completo y hacer preguntas sobre el conjunto sin enviar datos a la nube.
- Escritura creativa sin restricciones: narrativa de genero adulto, terror o dialogos conflictivos donde los modelos alineados introducen negativas o reformulaciones no deseadas.
- Analisis de corpus textuales en ingles a gran escala: resumen y extraccion de entidades sobre transcripciones o articulos dentro de una misma ventana de contexto, reduciendo la perdida de informacion del troceado.
- Prototipado rapido en equipos con hardware limitado: la cuantizacion Q4_K_M (5,0 GB) permite levantar un endpoint de chat local en una RTX 3060 o en un portatil con 16 GB de RAM unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan comparaciones con el modelo base alineado. No se deben asumir los numeros de Llama-3.3-8B-Instruct como validos para esta variante: la ablacion de la direccion de rechazo suele alterar el rendimiento en tareas de instruccion y seguridad, pero no hay mediciones publicadas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos): Q2_K 3,3 GB; Q3_K_S 3,8 GB; Q3_K_M 4,1 GB; Q3_K_L 4,4 GB; IQ4_XS 4,6 GB; Q4_K_S 4,8 GB; Q4_K_M 5,0 GB; Q5_K_S 5,7 GB; Q5_K_M 5,8 GB; Q6_K 6,7 GB; Q8_0 8,6 GB; f16 16,2 GB.
- Cache KV: a 128K tokens el coste es dominante. Con una configuracion GQA tipica de Llama 3.3 8B (32 capas, 8 cabezas KV, head_dim 128) y cache en f16, el KV cache puede superar los 16 GB, muy por encima del peso del modelo; es una estimacion orientativa, no un dato publicado. Con KV cache cuantizada (q8_0 / q4_0 en llama.cpp) baja aproximadamente a la mitad o a un cuarto.
- GPU recomendadas: para Q4_K_M con contexto moderado basta una RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070. Para Q8_0 o f16 con contexto largo se recomiendan RTX 4090 24 GB, L40S, A100 40/80 GB o H100 80 GB.
- Cabe en GPU de consumo: si, en cualquiera con 8 GB o mas de VRAM para cuantizaciones Q2_K a Q4_K_M con contexto corto o medio; 16 GB (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090) o memoria unificada de Apple Silicon de 24-32 GB para contexto largo.
- Opciones de despliegue: llama.cpp (motor nativo de GGUF), Ollama, LM Studio, koboldcpp, Jan, text-generation-webui. vLLM y TGI solo admiten GGUF de forma experimental o mediante conversion a safetensors, por lo que no son la via recomendada.
- Latencia y throughput: no disponible. Depende de la cuantizacion, del ancho de banda de memoria de la GPU y del uso de offload parcial a CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Green-Eye/Llama-3.3-8B-Instruct-128K-heretic-GGUF | 8,03B | 128K (segun denominacion) | GGUF (12 quants estaticos) | llama3.3 | 0 descargas y 0 likes en el momento de la consulta; redistribucion de quants de mradermacher |
| mradermacher/Llama-3.3-8B-Instruct-128K-heretic-GGUF | 8,03B | 128K | GGUF | llama3.3 | Origen de las cuantizaciones estaticas incluidas en este repo |
| mradermacher/Llama-3.3-8B-Instruct-128K-heretic-i1-GGUF | 8,03B | 128K | GGUF (imatrix) | llama3.3 | Cuantizaciones ponderadas con matriz de importancia; mayor calidad por bit que las estaticas |
| aeon37/Llama-3.3-8B-Instruct-128K-heretic | 8,03B | 128K | safetensors (transformers) | llama3.3 | Modelo original sin cuantizar; misma ablacion, sin perdida por cuantizacion |
| meta-llama/Llama-3.3-8B-Instruct | 8,03B | 128K | safetensors | llama3.3 | Modelo alineado de referencia; mantiene rechazos de seguridad y no esta ablacionado |

Los datos de rendimiento comparado (MMLU, HumanEval u otros) no estan disponibles en la informacion proporcionada para ninguno de los modelos "heretic".

## Limitaciones y advertencias

- Contenido sin filtros: al ser una variante abliterated, el modelo puede producir contenido ofensivo, ilegal o peligroso. No debe exponerse a usuarios finales sin una capa de moderacion propia.
- Ausencia de alineamiento: al eliminar la direccion de rechazo tambien se degrada la adherencia a instrucciones de seguridad, y potencialmente otras capacidades instruct. No hay evaluaciones publicadas que cuantifiquen esa perdida.
- Riesgo de alucinacion: igual o superior al de Llama-3.3-8B-Instruct; el tamano de 8B limita la fiabilidad en razonamiento complejo y hechos verificables.
- Idioma: declarado unicamente para ingles. El rendimiento en castellano no esta documentado y probablemente sea inferior al de un modelo multilingue.
- Contexto largo: aunque la ventana declarada sea de 128K, el rendimiento efectivo en contextos muy largos no esta validado y el coste de cache KV es alto.
- Licencia: Meta Llama 3.3 Community License. Permite uso comercial con condiciones (atribucion "Built with Llama", nombrado del modelo, obligaciones sobre contenido generado y clausula de licencia separada si se superan 700 millones de usuarios mensuales). La redistribucion de cuantizaciones esta sujeta a los mismos terminos.
- Repositorio sin validacion: 0 descargas y 0 likes, fecha de creacion 2026-09-30 en los metadatos. No hay evidencia de comunidad que haya verificado la integridad o la calidad de los ficheros.
- Sin soporte de tool calling ni agentes confirmado, y sin multimodalidad.
- Para produccion se recomienda partir de la cuantizacion imatrix (i1-GGUF) en lugar de las estaticas, y validar la calidad con un conjunto de evaluacion propio antes de desplegar.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Green-Eye/Llama-3.3-8B-Instruct-128K-heretic-GGUF
- Modelo base: https://huggingface.co/aeon37/Llama-3.3-8B-Instruct-128K-heretic
- Cuantizaciones estaticas originales (mradermacher): https://huggingface.co/mradermacher/Llama-3.3-8B-Instruct-128K-heretic-GGUF
- Cuantizaciones imatrix (mradermacher i1): https://huggingface.co/mradermacher/Llama-3.3-8B-Instruct-128K-heretic-i1-GGUF
- Pagina resumen de descargas: https://hf.tst.eu/model#Llama-3.3-8B-Instruct-128K-heretic-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/
- Modelo alineado de referencia: https://huggingface.co/meta-llama/Llama-3.3-8B-Instruct
- Motor de inferencia GGUF: https://github.com/ggml-org/llama.cpp

Nota: los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo (corresponden a empresas de limpieza, inmobiliarias y articulos sobre el color verde), por lo que no se han incluido.
