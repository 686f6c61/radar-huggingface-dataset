# mradermacher/medgemma-27b-text-it-abliterated-GGUF

## Resumen

medgemma-27b-text-it-abliterated-GGUF es la distribucion en formato GGUF del modelo ToastyPigeon/medgemma-27b-text-it-abliterated, una variante "abliterated" (es decir, con los rechazos y sesgos de alineacion suprimidos mediante intervencion sobre las direcciones de activacion) del modelo MedGemma 27B en su version de solo texto. El trabajo de cuantizacion lo realiza mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp, que ofrece aqui un conjunto de once variantes que van desde Q2_K (10,6 GB) hasta Q8_0 (28,8 GB). El modelo cuenta con 27.009.002.240 parametros reales segun los safetensors del repositorio.

La relevancia de esta ficha radica en que permite ejecutar un modelo medico de gran tamano en hardware de consumo mediante cuantizacion agresiva, a costa de renunciar a las salvaguardas de alineacion originales. El proceso de abliteration elimina la tendencia del modelo a rechazar peticiones, lo que lo hace atractivo para investigacion sobre seguridad y para escenarios donde el filtrado excesivo resulta contraproducente, pero tambien incrementa el riesgo de generar contenido danino o inexacto en un dominio tan sensible como el sanitario.

La model card del publicador es puramente operativa: describe los ficheros GGUF disponibles, su tamano y recomendaciones de uso, pero no incluye informacion sobre arquitectura, datos de entrenamiento, contexto, licencia ni benchmarks. Por tanto, buena parte de las especificaciones tecnicas de esta ficha se marcan como no disponibles, y las inferencias sobre el modelo base deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MedGemma 27B; presumiblemente transformer decoder-only, sin confirmar en la informacion proporcionada) |
| Parametros totales | 27.009.002.240 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun metadatos y model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) empleadas en el modelo base MedGemma 27B. La model card del repositorio GGUF unicamente documenta el proceso de cuantizacion: se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) generadas a partir del modelo ToastyPigeon/medgemma-27b-text-it-abliterated, sin informacion sobre el metodo de abliteration aplicado por el autor original.

La innovacion tecnica destacable de este repositorio no esta en el modelo sino en la distribucion: mradermacher ofrece variantes con y sin imatrix (las weighted/imatrix se publican en un repositorio separado, medgemma-27b-text-it-abliterated-i1-GGUF), e incluye recomendaciones explicitas de calidad por cuantizacion (Q4_K_S y Q4_K_M como "fast, recommended"; Q6_K como "very good quality"; Q8_0 como "fast, best quality"). No hay datos sobre atencion lineal, decodificacion especulativa ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto en ingles; el modelo esta etiquetado exclusivamente con el idioma "en".
- Dominio medico inferido por el nombre del modelo base (MedGemma), aunque la model card no detalla capacidades clinicas concretas.
- Al no estar disponible la informacion del modelo base, no se puede confirmar soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- La variante "abliterated" implica, por definicion del metodo, una reduccion de los rechazos ante peticiones que el modelo original declinaria; esto no es una capacidad funcional adicional sino un cambio de comportamiento.
- Capacidades multilingues: no disponibles; solo se declara ingles.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar como la abliteration afecta al comportamiento de rechazo en un dominio de alto riesgo como el medico, comparando respuestas con el modelo base alineado.
- Evaluacion de cuantizaciones GGUF: con once variantes disponibles, sirve para medir la degradacion de calidad (perplejidad, coherencia) entre Q2_K y Q8_0 en un modelo de 27B, replicando la grafica de ikawrakow citada en la model card.
- Despliegue local en hardware de consumo para pruebas de concepto: la variante Q4_K_M (16,6 GB) cabe en GPUs con 24 GB de VRAM, lo que permite experimentar con un modelo de 27B sin infraestructura de datacenter.
- Generacion de texto medico sintetico para pipelines de datos: util en entornos controlados donde se necesita volumen de texto de dominio sanitario y el filtrado de rechazos del modelo alineado resulta un obstaculo (con revision humana obligatoria).
- Docencia y formacion tecnica: permite mostrar en un aula como funciona la cuantizacion GGUF y el impacto del tamano de quant en la calidad de salida.
- Benchmarking de llama.cpp y comparativas de motores de inferencia: el rango de cuantizaciones facilita pruebas de throughput y latencia entre Q4_K_S y Q8_0 en distintas GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una grafica externa de perplejidad por tipo de cuantizacion (enlace a nethype.de) y no aporta cifras de MMLU, HumanEval, GSM8K ni evaluaciones medicas.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del fichero GGUF): Q2_K ~10,6 GB; Q3_K_S ~12,3 GB; Q3_K_M ~13,5 GB; Q3_K_L ~14,6 GB; IQ4_XS ~15,0 GB; Q4_K_S ~15,8 GB; Q4_K_M ~16,6 GB; Q5_K_S ~18,9 GB; Q5_K_M ~19,4 GB; Q6_K ~22,3 GB; Q8_0 ~28,8 GB. A estas cifras hay que sumar el overhead de contexto y de la cache KV.
- GPU recomendadas: para Q4_K_M y superiores, RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el modelo completo; para Q8_0 se necesita una GPU de 32 GB o superior (A100 40 GB, H100, o configuracion multi-GPU).
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones hasta Q6_K; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con Q2_K o Q3_K y contexto reducido, o mediante offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI a traves de servidores GGUF. Para el modelo base en safetensors, vLLM o TGI serian las opciones habituales, aunque no se confirma en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| medgemma-27b-text-it-abliterated-GGUF (este) | 27,0 B | no disponible | GGUF | no disponible | Variante abliterated de MedGemma 27B, 11 cuantizaciones |
| ToastyPigeon/medgemma-27b-text-it-abliterated | 27,0 B | no disponible | safetensors | no disponible | Modelo base sin cuantizar del que deriva este repositorio |
| medgemma-27b-text-it-abliterated-i1-GGUF | 27,0 B | no disponible | GGUF | no disponible | Mismo modelo con cuantizaciones weighted/imatrix del mismo autor |

No se dispone de informacion sobre otros modelos medicos comparables (por ejemplo, variantes de Meditron, BioMistral o MedLLaMA) en la documentacion proporcionada, por lo que no se puede establecer una comparativa de rendimiento con ellos.

## Limitaciones y advertencias

- La abliteration elimina o reduce los rechazos del modelo, lo que puede producir respuestas medicas inseguras, consejos clinicos sin supervisar o contenido que el modelo original habria declinado. No debe usarse en produccion sanitaria sin revision experta.
- Riesgo elevado de alucinacion en un dominio donde los errores tienen consecuencias graves; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Al derivar de MedGemma, habria que verificar la licencia del modelo original (Google) antes de cualquier uso.
- La model card no documenta sesgos conocidos, limitaciones de contexto ni caveats de produccion; la ausencia de esta informacion es en si misma un riesgo.
- El repositorio ocupa 186,7 GB, lo que implica descargas largas y espacio en disco considerable si se quieren comparar varias cuantizaciones.
- El modelo base es de junio de 2025 y el repositorio se actualizo en noviembre de 2026; no hay garantia de mantenimiento futuro.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/medgemma-27b-text-it-abliterated-GGUF
- Modelo base: https://huggingface.co/ToastyPigeon/medgemma-27b-text-it-abliterated
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/medgemma-27b-text-it-abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#medgemma-27b-text-it-abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
