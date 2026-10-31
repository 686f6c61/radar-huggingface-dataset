# mradermacher/Qwen3.6-35B-A3B-Aether-GGUF

## Resumen

Qwen3.6-35B-A3B-Aether-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo emkey1/Qwen3.6-35B-A3B-Aether, publicada por el cuantizador mradermacher, un colaborador muy conocido en la comunidad de Hugging Face especializado en hacer modelos accesibles en hardware de consumo. El modelo base es un fine-tuning de un modelo de la familia Qwen3.6 con 35,5 mil millones de parametros totales en arquitectura MoE (mixture of experts), de los cuales aproximadamente 3 mil millones estan activos por token (como indica el sufijo "A3B"), lo que permite inferencias rapidas sin sacrificar la capacidad almacenada en el modelo completo.

El valor de esta ficha de modelo radica en la disponibilidad: el repositorio original en safetensors ocupa unos 244 GB, mientras que las cuantizaciones GGUF ofrecidas van desde 13,3 GB (Q2_K) hasta 37,9 GB (Q8_0), con una version multimodal complementaria (mmproj) incluida. Esto hace viable ejecutar el modelo en GPUs de consumo o incluso en CPU con suficiente RAM, algo imposible con los pesos originales.

El modelo se etiqueta con capacidades de codigo ("code") y conversacion, hereda la licencia Apache 2.0 del modelo base y esta orientado principalmente al idioma ingles. Su relevancia actual se debe a la tendencia de los modelos MoE pequenos-activos/grandes-totales, que ofrecen un equilibrio muy eficiente entre calidad y coste de inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), familia Qwen3.6 |
| Parametros totales | 35.505.251.456 (≈ 35,5 B) |
| Parametros activos | ≈ 3 B (indicado por el sufijo A3B del nombre; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado a partir de safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base, emkey1/Qwen3.6-35B-A3B-Aether, es un fine-tuned de un modelo Qwen3.6 de 35,5 B de parametros con arquitectura MoE. En este diseno, solo una fraccion de los parametros (aproximadamente 3 B segun la nomenclatura A3B) se activa por token, lo que reduce drasticamente el coste computacional de la inferencia manteniendo la capacidad expresiva del modelo completo. El nombre "Aether" corresponde al nombre del fine-tuning concreto realizado por emkey1, etiquetado con la tematica de codigo.

Sobre los datos de entrenamiento, el numero de tokens, la composicion del dataset y si se aplicaron tecnicas de alineacion como RLHF o DPO, no hay informacion disponible en la model card. Tampoco se detallan innovaciones tecnicas especificas del fine-tuning. Lo que si aporta esta ficha es el trabajo de cuantizacion: mradermacher ha generado cuantizaciones estaticas en formato GGUF compatible con llama.cpp, incluyendo un suplemento multimodal (mmproj) en Q8_0 y f16, lo que sugiere que el modelo base incorpora capacidades visuales o multimodales procesables mediante ese proyector.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" en Hugging Face.
- Generacion y comprension de codigo: etiquetado explicitamente con el tag "code".
- Capacidades multimodales: la presencia de archivos mmproj (multi-modal supplement) en Q8_0 y f16 indica soporte de procesamiento visual via el proyector multimodal de llama.cpp.
- Eficiencia de inferencia MoE: con ~3 B de parametros activos, ofrece latencias y throughput tipicos de un modelo de 3 B pese a tener 35,5 B totales.
- Despliegue local: formato GGUF compatible con llama.cpp, Ollama, LM Studio y otros runtimes que soporten el estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Soporte multilingue: la model card declara unicamente ingles ("en").

## Casos de uso

- Asistente de codigo local: gracias al tag "code" y a la cuantizacion Q4_K_M (21,8 GB), cabe en una RTX 4090 de 24 GB y puede usarse como autocompletador o asistente de programacion sin enviar codigo a servicios externos.
- Chatbot conversacional en local: su etiqueta "conversational" y la eficiencia MoE lo hacen adecuado para asistentes multi-turno ejecutados con llama.cpp u Ollama en estaciones de trabajo.
- Analisis de imagenes con modelo local: el archivo mmproj-Q8_0 permite usar las capacidades multimodales del modelo base para describir o razonar sobre imagenes en entornos sin conexion.
- Prototipado de aplicaciones LLM en hardware de consumo: las cuantizaciones Q2_K (13,3 GB) y Q3_K_S (15,6 GB) permiten experimentar con el modelo en GPUs de 16 GB o incluso en CPU con RAM suficiente.
- Servicios con licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin obligaciones de codigo fuente, ideal para startups que despliegan inferencia propia.
- Evaluacion comparativa de cuantizaciones: la coleccion completa de quants (Q2_K a Q8_0) sirve como banco de pruebas para estudiar la degradacion de calidad por cuantizacion en modelos MoE de 35 B.
- Procesamiento por lotes offline de bajo coste: el bajo numero de parametros activos permite alto throughput en servidores con multiples GPUs modestas para tareas como clasificacion o resumen masivo de textos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun la tabla de cuants del propio repo):
  - Q2_K: ~13,3 GB (cabe en GPUs de 16 GB)
  - Q3_K_M: ~17,3 GB (cabe en GPUs de 24 GB con margen ajustado)
  - Q4_K_S / Q4_K_M: ~20,5-21,8 GB (cabe en una RTX 3090/4090 de 24 GB)
  - Q5_K_M: ~25,4 GB (requiere 32 GB o offload parcial)
  - Q6_K: ~29,3 GB (requiere 32 GB, por ejemplo RTX 5090 o A100 parcial)
  - Q8_0: ~37,9 GB (requiere 2 GPUs de 24 GB o una de 40-48 GB, como A100 40 GB o A6000 48 GB)
- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB) para Q4_K_M; RTX 5090 o A6000 para Q6_K; A100 40-80 GB o H100 para Q8_0 con contexto amplio. No hay mediciones oficiales de latencia o throughput.
- CPU: al ser MoE con ~3 B de parametros activos, la inferencia en CPU con suficientes RAM (16-40 GB segun quant) es viable con llama.cpp, aunque sin cifras de velocidad publicadas.
- Despliegue: llama.cpp (formato GGUF nativo), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. No hay soporte directo de vLLM o TGI para estos archivos GGUF; para vLLM/TGI habria que usar los pesos originales del modelo base.
- Descarga del modelo base completo en safetensors: ~244,4 GB, solo justificable para despliegues en servidor con GPUs de gama alta.

## Comparativa con modelos similares

| Caracteristica | Qwen3.6-35B-A3B-Aether (GGUF) | Qwen3-30B-A3B (referencia de familia) | Qwen3.5-35B-A3B (hipotetica, no verificada) |
|---|---|---|---|
| Parametros totales | 35,5 B | 30,5 B | no disponible |
| Parametros activos | ~3 B | ~3 B | no disponible |
| Contexto | no disponible | 32k-128k segun version | no disponible |
| Licencia | Apache 2.0 | Apache 2.0 | no disponible |
| Formato | GGUF (cuantizado) | Safetensors y GGUF comunitarios | no disponible |

Nota: la comparativa se limita a la familia Qwen MoE de clase similar porque es la referencia mas directa. No hay datos publicados de rendimiento comparativo para este fine-tuning concreto. Otras alternativas de la misma categoria de MoE pequenos-activos incluyen modelos como GLM-4.5-Air o gpt-oss-20b, pero no se dispone de datos suficientes para una comparacion rigurosa.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta documentado y puede ser inferior al de ingles.
- Cuantizaciones estaticas: mradermacher indica que las quants weighted/imatrix no estan disponibles de momento, por lo que las cuants de calidad intermedia-baja (Q2_K, Q3_K_S) pueden sufrir degradacion notable, especialmente en un MoE.
- Calidad de cuants bajos: Q2_K y Q3_K_M estan marcados o son conocidos por perder calidad; para uso serio se recomienda Q4_K_S o superior.
- Fine-tuning de terceros: el modelo base es un fine-tuning comunitario (emkey1) sin model card detallada publicada en la informacion proporcionada; no hay datos sobre datos de entrenamiento, alineacion ni sesgos.
- Riesgo de alucinacion: no cuantificado; como cualquier LLM, puede generar informacion incorrecta con fluidez.
- Sesgos conocidos: no disponibles en la documentacion.
- Longitud de contexto: no especificada; verificarla antes de planificar casos de uso con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo original de Qwen del que deriva la familia.
- Multimodalidad: el suplemento mmproj sugiere capacidades visuales, pero no hay documentacion sobre su calidad ni sobre los formatos de imagen soportados.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Aether-GGUF
- Modelo base (fine-tuning original): https://huggingface.co/emkey1/Qwen3.6-35B-A3B-Aether
- Pagina de descargas resumida de mradermacher: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Aether-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher (nethype GmbH): https://www.nethype.de/
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
