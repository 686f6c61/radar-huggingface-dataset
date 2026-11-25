# mradermacher/Hexoteric-Trismegistus-7B-GGUF

## Resumen

Hexoteric-Trismegistus-7B-GGUF es la distribucion en formato GGUF del modelo Hexoteric-Trismegistus-7B, un merge de modelos publicado por SzilviaB y cuantizado por mradermacher. El modelo original es un merge generado con mergekit, una herramienta que combina los pesos de varios modelos base para producir un modelo nuevo sin entrenamiento adicional. El resultado es un modelo de 7.241.748.480 parametros (aproximadamente 7,2 mil millones) orientado a conversacion en ingles.

Esta ficha documenta especificamente la version cuantizada publicada por mradermacher, que ofrece el modelo en multiples niveles de cuantizacion GGUF (desde Q2_K hasta f16), pensados para su uso con llama.cpp y herramientas compatibles como Ollama o LM Studio. El repositorio ocupa 73,4 GB en total debido a que incluye todas las variantes de cuantizacion.

La relevancia de este modelo es limitada y practica: se trata de un merge comunitario sin model card detallada, sin benchmarks publicados y sin informacion sobre la licencia. Es util para quienes quieran experimentar con un modelo conversacional de 7B en hardware de consumo, pero no constituye una opcion recomendable para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos, no disponible el detalle de los modelos constituyentes) |
| Parametros totales | 7.241.748.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un merge creado con mergekit a partir de modelos no especificados en la informacion disponible. Los merges de mergekit combinan los pesos de dos o mas modelos mediante tecnicas como SLERP, TIES, DARE o linear, sin realizar un entrenamiento adicional. Por tanto, no hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que el proceso de merge no implica entrenamiento supervisado.

El modelo base (SzilviaB/Hexoteric-Trismegistus-7B) esta etiquetado como conversacional y en ingles. La version documentada aqui es una cuantizacion estatica realizada por mradermacher, que ademas ofrece una variante con cuantizacion ponderada/imatrix en un repositorio separado (mradermacher/Hexoteric-Trismegistus-7B-i1-GGUF). No se dispone de informacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal u otros mecanismos.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento general y respuesta a instrucciones (presumiblemente, dado el etiquetado como conversacional, aunque no se detalla).
- No se ha confirmado soporte de tool calling ni function calling en la informacion disponible.
- No se ha confirmado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma.
- No se ha confirmado soporte de vision, audio ni modo de razonamiento explicito (thinking mode).
- Compatible con endpoints (etiqueta endpoints_compatible en Hugging Face).

## Casos de uso

- Experimentacion local con modelos conversacionales: el modelo puede cargarse en llama.cpp u Ollama en hardware de consumo gracias a sus cuantizaciones de 4 a 6 GB, lo que permite probar un merge comunitario de 7B sin infraestructura dedicada.
- Prototipado rapido de chatbots en ingles: al ser un modelo conversacional de 7B, sirve para validar flujos de dialogo antes de invertir en modelos mayores o con licencia clara.
- Evaluacion comparativa de merges: util para investigadores que quieran medir el comportamiento de merges comunitarios frente a modelos entrenados formalmente.
- Generacion de texto creativo en ingles: el modelo puede emplearse para redaccion de borradores y lluvia de ideas en entornos donde no se requiera precision factual.
- Educacion y divulgacion: sirve como ejemplo practico de cuantizacion GGUF y de despliegue local con llama.cpp.
- Pruebas de integracion con herramientas compatibles con GGUF: permite verificar pipelines de inferencia (Ollama, LM Studio, llama-cpp-python) antes de adoptar un modelo definitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: aproximadamente 2,8 GB (Q2_K), 4,0-4,5 GB (IQ4_XS, Q4_K_S, Q4_K_M), 5,1-5,2 GB (Q5_K_S, Q5_K_M), 6,0 GB (Q6_K), 7,8 GB (Q8_0) y 14,6 GB (f16). Hay que anadir el espacio para el contexto KV cache.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM puede ejecutar las cuantizaciones Q4 y Q5; para Q8_0 se recomienda 10-12 GB; para f16, 16-24 GB (RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090, usando cuantizaciones Q4 a Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. Tambien puede usarse con transformers cargando el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hexoteric-Trismegistus-7B-GGUF | 7,24 B | no disponible | no disponible | GGUF | Merge comunitario sin benchmarks |
| Mistral-7B-Instruct (referencia) | 7,24 B | 32k (segun version) | Apache 2.0 | safetensors, GGUF | Modelo entrenado con licencia clara y benchmarks publicados |
| Llama 3.1 8B Instruct (referencia) | 8,03 B | 128k | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto y evaluacion publica |

La comparativa se ofrece como referencia de categoria (modelos de 7-8B conversacionales); no se dispone de datos de rendimiento del modelo documentado para una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor o consultar el modelo base antes de usarlo en produccion.
- Ausencia de benchmarks: no hay evidencia publica de calidad, lo que impide recomendar el modelo para tareas criticas sin una evaluacion propia.
- Riesgo de alucinacion: como todo modelo de lenguaje de 7B sin ajuste fino documentado, puede generar informacion incorrecta con aparente seguridad.
- Limitacion idiomatica: el modelo esta etiquetado solo en ingles; su rendimiento en castellano no esta garantizado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas.
- Merge sin documentacion: al desconocerse los modelos constituyentes, no se pueden evaluar sesgos heredados ni restricciones de licencia de los modelos originales.
- Tamano del repositorio: 73,4 GB en total; conviene descargar solo el archivo de cuantizacion necesario.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Hexoteric-Trismegistus-7B-GGUF
- Modelo base: https://huggingface.co/SzilviaB/Hexoteric-Trismegistus-7B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Hexoteric-Trismegistus-7B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Hexoteric-Trismegistus-7B-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
