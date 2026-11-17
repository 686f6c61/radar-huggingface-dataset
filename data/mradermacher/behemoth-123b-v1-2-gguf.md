# mradermacher/Behemoth-123B-v1.2-GGUF

## Resumen

Behemoth-123B-v1.2-GGUF es la distribucion en formato GGUF del modelo Behemoth-123B-v1.2, desarrollado originalmente por TheDrummer y cuantizado por mradermacher. Se trata de un modelo de lenguaje conversacional de gran escala con 122.610.069.504 parametros (aproximadamente 122,6 mil millones), lo que lo situa en la categoria de modelos densos de gran tamano, por encima de la mayoria de alternativas abiertas de 70B y en linea con modelos como Mistral Large o Qwen 2.5 72B en orden de magnitud.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 123B en hardware mas modesto gracias a la cuantizacion, con opciones que van desde Q2_K (45,3 GB) hasta Q8_0 (130,4 GB). El modelo base esta pensado para uso conversacional y esta etiquetado unicamente en ingles. La licencia es "other", lo que implica que las condiciones de uso comercial deben consultarse en el modelo base original.

La ficha se centra en la version GGUF, si bien la informacion disponible sobre arquitectura, datos de entrenamiento y benchmarks es limitada, ya que la model card del cuantizador no incluye esos detalles y no se ha proporcionado la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer denso, inferido por el numero de parametros; no confirmado en la informacion) |
| Parametros totales | 122.610.069.504 (~122,6B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |
| Tamano del repo | 832,2 GB |
| Modelo base | TheDrummer/Behemoth-123B-v1.2 |
| Libreria | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el numero de parametros (122,6B) y la ausencia de mencion a mezcla de expertos, se trata presumiblemente de un transformer denso, pero este dato no esta confirmado en la informacion disponible. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares.

La aportacion tecnica de esta publicacion es la cuantizacion: mradermacher ha generado cuantizaciones estaticas (no imatrix) del modelo base, con versiones que van desde Q2_K hasta Q8_0, incluyendo variantes IQ (IQ4_XS). Las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (Behemoth-123B-v1.2-i1-GGUF). Los archivos de mayor tamano se dividen en multiples partes (hasta 3 partes para Q6_K y Q8_0), lo que requiere concatenacion previa al uso con llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del modelo.
- Razonamiento y respuesta multi-turno (inferido del proposito conversacional; no confirmado con benchmarks).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").

## Casos de uso

- Asistente conversacional en ingles: el modelo puede mantener dialogos multi-turno gracias a su naturaleza conversacional y a su gran numero de parametros, adecuado para chatbots de proposito general desplegados con llama.cpp u Ollama.
- Generacion de texto creativo y redaccion: con 122,6B de parametros, es apto para tareas de escritura larga y coherente donde se requiera calidad por encima de modelos de 7B-13B, a costa de mayor latencia.
- Procesamiento por lotes en servidores con GPU de gran memoria: la version Q8_0 (130,4 GB) o Q6_K (100,7 GB) permite obtener la maxima calidad en entornos con multiples A100/H100, util para generacion de datasets sinteticos o anotacion.
- Despliegue en estaciones de trabajo con 48-80 GB de VRAM: las cuantizaciones Q4_K_M (73,3 GB) y Q5_K_M (86,6 GB) permiten ejecutar el modelo en configuraciones de 2x RTX 4090 (48 GB) con offloading parcial o en una sola GPU de 80 GB con cuantizaciones menores.
- Investigacion sobre cuantizacion: el repositorio ofrece un espectro completo de cuantizaciones (Q2 a Q8) que permite estudiar la degradacion de calidad frente al tamano, util para trabajos academicos sobre compresion de modelos.
- Experimentacion local con modelos de gran escala: la version Q2_K (45,3 GB) hace viable probar un modelo de 123B en hardware de consumo de gama alta (por ejemplo, 2x RTX 3090/4090 con 24 GB cada una) aunque con perdida de calidad significativa.
- Fine-tuning o evaluacion comparativa: al estar disponible el modelo base en safetensors, se puede usar como referencia para comparar el impacto de la cuantizacion en tareas downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de archivo GGUF):
  - Q2_K: ~45,3 GB
  - Q3_K_S: ~52,9 GB
  - Q3_K_M: ~59,2 GB
  - Q3_K_L: ~64,7 GB
  - IQ4_XS: ~66,1 GB
  - Q4_K_S: ~69,7 GB
  - Q4_K_M: ~73,3 GB
  - Q5_K_S: ~84,5 GB
  - Q5_K_M: ~86,6 GB
  - Q6_K: ~100,7 GB
  - Q8_0: ~130,4 GB
- GPU recomendadas: A100 80 GB (para Q4-Q5 con margen), H100 80 GB, configuraciones multi-GPU (2x A100 40 GB, 2x RTX 4090 24 GB para cuantizaciones bajas con offloading).
- Cabe en GPU de consumo: parcialmente. Q2_K (45,3 GB) requiere al menos 2x RTX 3090/4090 (48 GB combinados) o una RTX 6000 Ada (48 GB); Q4_K_M (73,3 GB) requiere 4x RTX 4090 o 2x RTX 6000 Ada. No cabe en una unica GPU de consumo de 24 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui, y servidores compatibles con endpoints. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se requeriria el modelo base en safetensors.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Behemoth-123B-v1.2 (este) | ~122,6B | no disponible | other | GGUF / safetensors | Modelo conversacional en ingles |
| Mistral Large 2 | ~123B | 128k (segun documentacion publica de Mistral) | Mistral Research / comercial | safetensors | No disponible en GGUF oficial; comparacion por tamano |
| Qwen 2.5 72B | ~72B | 128k (segun documentacion publica de Qwen) | Apache 2.0 (segun Qwen) | safetensors, GGUF | Menor tamano, licencia mas permisiva |
| Llama 3.1 70B | ~70B | 128k (segun documentacion publica de Meta) | Llama 3.1 Community License | safetensors, GGUF | Menor tamano, ecosistema amplio |

Nota: los datos de contexto y licencia de los modelos comparados provienen de documentacion publica general y no de la informacion proporcionada en esta ficha; se incluyen solo como referencia orientativa. No se dispone de benchmarks comparativos para Behemoth-123B-v1.2.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo entrenado principalmente en ingles, es probable que presente sesgos culturales y linguisticos propios de ese corpus (no confirmado).
- Riesgo de alucinacion: inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones de factualidad para este modelo.
- Limitaciones de contexto e idioma: el modelo esta etiquetado unicamente en ingles; la longitud de contexto no esta especificada, lo que impide planificar su uso en tareas de contexto largo sin verificacion previa.
- Restricciones de licencia: la licencia es "other", lo que exige revisar los terminos del modelo base (TheDrummer/Behemoth-123B-v1.2) antes de cualquier uso comercial. No se garantiza permiso de uso comercial.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas por el autor como de menor calidad; para produccion se recomienda Q4_K_M o superior.
- Archivos multiparte: las cuantizaciones Q3 en adelante se dividen en 2 o 3 partes que deben concatenarse correctamente antes de su uso; un manejo erroneo produce archivos corruptos.
- Repositorio de gran tamano: 832,2 GB en total, lo que requiere espacio de almacenamiento considerable y descargas selectivas.
- Sin benchmarks publicados: no es posible validar el rendimiento real frente a alternativas sin evaluaciones propias.
- Actividad baja: 9 descargas y 0 likes en el momento de la consulta, lo que limita la retroalimentacion de la comunidad sobre su calidad.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Behemoth-123B-v1.2-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Behemoth-123B-v1.2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Behemoth-123B-v1.2-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Behemoth-123B-v1.2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
