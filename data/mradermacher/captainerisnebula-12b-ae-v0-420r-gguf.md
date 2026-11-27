# mradermacher/CaptainErisNebula-12B-AE-v0.420R-GGUF

## Resumen

CaptainErisNebula-12B-AE-v0.420R-GGUF es una cuantizacion en formato GGUF del modelo Nitral-Archive/CaptainErisNebula-12B-AE-v0.420R, un modelo de lenguaje conversacional de 12.247.782.400 parametros (aproximadamente 12,2 mil millones). La cuantizacion ha sido realizada por mradermacher, un conocido publicador de versiones GGUF de modelos open source, y esta pensada para su uso con llama.cpp y herramientas compatibles.

El modelo original es un fine-tune de caracter conversacional, orientado a dialogos y roleplay, y esta etiquetado unicamente para el idioma ingles. La version GGUF ofrece un conjunto de cuantizaciones estaticas que van desde Q2_K (4,9 GB) hasta Q8_0 (13,1 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de gama media hasta equipos con CPU y RAM suficiente.

La relevancia de esta ficha radica en que permite evaluar rapidamente si el modelo encaja en un caso de uso concreto: es un modelo de 12B con licencia no especificada, sin benchmarks publicados y con soporte exclusivo de ingles, por lo que su interes se limita a experimentacion conversacional y no a tareas de produccion con requisitos de calidad medibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 12B, segun el tamano y el formato de pesos) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas; no hay imatrix/weighted disponibles) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 84,7 GB con todos los quants); el modelo base esta en formato transformers |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (Nitral-Archive/CaptainErisNebula-12B-AE-v0.420R) mas alla de su tamano de 12,2 mil millones de parametros y su naturaleza conversacional. La model card de la cuantizacion no incluye detalles sobre el tipo de transformer, el numero de capas, las dimensiones ocultas ni el mecanismo de atencion.

Tampoco se documentan los datos de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. El sufijo "AE" y el nombre "CaptainErisNebula" sugieren un fine-tune de caracter o roleplay, pero no hay confirmacion tecnica en la informacion proporcionada. La unica innovacion tecnica documentada es el proceso de cuantizacion estatica realizado por mradermacher, que genera variantes GGUF sin cuantizacion ponderada por imatrix.

## Capacidades

- Generacion de texto conversacional en ingles: el modelo esta etiquetado como "conversational" y orientado a dialogos multi-turno.
- Roleplay y personajes: por el nombre y el origen del fine-tune, es probable que este ajustado para mantener personalidad y estilo, aunque no hay documentacion que lo confirme.
- Generacion de texto general: al ser un modelo de 12B, se espera capacidad basica de redaccion, resumen y respuesta a preguntas, sin datos de calidad medibles.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Experimentacion con modelos conversacionales en local: gracias a las cuantizaciones Q4_K_S (7,2 GB) y Q4_K_M (7,6 GB), el modelo puede ejecutarse en una GPU de consumo con 8-12 GB de VRAM usando llama.cpp u Ollama, lo que lo hace util para probar fine-tunes de roleplay sin infraestructura dedicada.
- Prototipado de chatbots de personaje: el modelo esta orientado a conversacion y probablemente a mantener un personaje consistente, por lo que sirve para validar rapidamente disenos de prompt de sistema y flujos de dialogo antes de invertir en modelos mayores.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes GGUF, lo que permite medir la degradacion de calidad entre Q2_K y Q8_0 en una tarea conversacional concreta y elegir el equilibrio tamano/calidad adecuado.
- Despliegue en CPU o equipos sin GPU: la variante Q2_K (4,9 GB) y Q3_K_S (5,6 GB) caben en RAM de sistemas modestos y permiten ejecutar el modelo con llama.cpp en CPU, util para demos offline o entornos aislados.
- Generacion de texto creativo en ingles: para redaccion de ficcion, guiones o dialogos donde no se requiere precision factual y se prioriza el estilo, el modelo puede servir como generador de borradores.
- Integracion en pipelines de inferencia compatibles con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse mediante infraestructura compatible con la API de transformers, lo que facilita su inclusion en entornos de prueba ya existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del fichero GGUF mas overhead de contexto):
  - Q2_K: ~5-6 GB
  - Q3_K_S: ~6-7 GB
  - Q3_K_M: ~7 GB
  - Q3_K_L: ~7-8 GB
  - IQ4_XS: ~7-8 GB
  - Q4_K_S: ~8 GB
  - Q4_K_M: ~8-9 GB
  - Q5_K_S: ~9-10 GB
  - Q5_K_M: ~10 GB
  - Q6_K: ~11-12 GB
  - Q8_0: ~14-15 GB
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q5; RTX 4090 (24 GB) o A100/H100 para Q8_0 con contexto amplio.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q4 y Q5 con GPUs de 8-12 GB; Q8_0 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en transformers, vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CaptainErisNebula-12B-AE-v0.420R-GGUF | 12,2B | no disponible | no disponible | GGUF | Fine-tune conversacional en ingles, sin benchmarks |
| Mistral-Nemo-12B | 12B | 128K (segun documentacion publica del modelo) | Apache 2.0 | safetensors, GGUF | Modelo base generalista con benchmarks publicados |
| Gemma-2-9B | 9B | 8K (segun documentacion publica del modelo) | Gemma Terms | safetensors, GGUF | Modelo generalista con evaluacion publica |

La comparacion se limita a tamano y disponibilidad, ya que no hay datos de rendimiento del modelo evaluado. Frente a alternativas como Mistral-Nemo-12B o Gemma-2-9B, CaptainErisNebula carece de benchmarks, de licencia declarada y de soporte multilingue documentado, por lo que su eleccion frente a estos solo se justifica por el estilo conversacional especifico del fine-tune.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor del modelo base antes de cualquier despliegue en produccion.
- Ausencia total de benchmarks: no hay evidencia medible de calidad en MMLU, HumanEval, GSM8K ni tareas conversacionales estandar.
- Solo ingles: no se debe esperar un rendimiento aceptable en castellano u otros idiomas.
- Riesgo de alucinacion: al ser un fine-tune conversacional sin datos de alineacion documentados, la probabilidad de generar informacion falsa con tono seguro es alta, especialmente en tareas factuales.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni procesos de mitigacion de sesgos.
- Contexto no documentado: se desconoce la ventana de contexto real, lo que impide planificar casos de uso con documentos largos.
- Cuantizaciones estaticas sin imatrix: las variantes de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.
- Modelo de nicho con muy poca traccion: 35 descargas y 1 like en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte comunitario o correcciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CaptainErisNebula-12B-AE-v0.420R-GGUF
- Modelo base: https://huggingface.co/Nitral-Archive/CaptainErisNebula-12B-AE-v0.420R
- Pagina de overview de cuantizaciones de mradermacher: https://hf.tst.eu/model#CaptainErisNebula-12B-AE-v0.420R-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
