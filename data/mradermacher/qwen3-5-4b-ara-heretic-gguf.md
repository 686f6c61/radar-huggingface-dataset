# mradermacher/Qwen3.5-4B-ARA-heretic-GGUF

## Resumen

Qwen3.5-4B-ARA-heretic-GGUF es una cuantizacion estatica en formato GGUF del modelo richardyoung/Qwen3.5-4B-ARA-heretic, publicada por mradermacher. El modelo base deriva de la familia Qwen3.5 de 4B parametros (4.205.751.296 parametros reales segun los safetensors) y ha sido sometido a un proceso de "abliteration" o decensurado, que elimina total o parcialmente los mecanismos de rechazo y alineacion de seguridad del modelo original. El resultado es un modelo conversacional sin filtros de contenido, etiquetado como heretic, uncensored, decensored y abliterated.

La relevancia de esta publicacion es practica: mradermacher ofrece el modelo en una bateria completa de cuantizaciones GGUF (desde Q2_K hasta f16, pasando por IQ4_XS y Q8_0), lo que permite ejecutarlo en hardware de consumo con llama.cpp y derivados. El repositorio ocupa 39,9 GB en total, aunque cada fichero individual pesa entre 2,0 GB (Q2_K) y 8,5 GB (f16). Incluye ademas ficheros mmproj, lo que indica que el modelo base conserva capacidad multimodal de vision.

La licencia declarada es Apache 2.0, heredada del Qwen3.5-4B original. No obstante, la naturaleza decensurada del modelo implica riesgos de contenido que deben evaluarse antes de cualquier despliegue en produccion. El modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), no se detalla la variante exacta |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, un transformer de 4.205.751.296 parametros. La model card de esta cuantizacion no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original; esos datos corresponderian a la documentacion de Qwen3.5-4B, no incluida en la informacion disponible. La presencia de ficheros mmproj (multi-modal supplement) en el repositorio sugiere que el modelo base incorpora un proyector multimodal, presumiblemente para entrada de imagenes, aunque la model card no lo detalla.

La innovacion tecnica principal de esta publicacion es el proceso de abliteration aplicado por richardyoung sobre Qwen3.5-4B, que elimina las direcciones de activacion asociadas al rechazo de peticiones. mradermacher realiza despues la cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) a partir del modelo en safetensors. El autor indica que las cuantizaciones ponderadas con imatrix estan en un repositorio separado (Qwen3.5-4B-ARA-heretic-i1-GGUF). La model card menciona que el proceso es "reproducible", aunque no se documentan los pasos concretos.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento y respuesta a instrucciones sin los filtros de rechazo del modelo original (comportamiento decensurado).
- Capacidad multimodal probable (entrada de imagen) gracias a los ficheros mmproj incluidos, aunque no se detalla en la model card.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteration comparando sus respuestas con las de Qwen3.5-4B original en conjuntos de prompts sensibles, en un entorno controlado y aislado.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas que los modelos alineados rechazarian; la cuantizacion Q4_K_M (2,8 GB) permite ejecutarlo en un portatil con GPU de 6-8 GB.
- Prototipado local en hardware de consumo: con Q2_K (2,0 GB) o Q4_K_S (2,7 GB) se puede desplegar en llama.cpp u Ollama en equipos sin GPU dedicada, para pruebas de concepto de chatbots.
- Analisis de contenido multimodal en local: usando los ficheros mmproj junto con la cuantizacion principal, se pueden procesar imagenes en entornos sin conexion, siempre que se valide primero la calidad real del proyector.
- Evaluacion de robustez de filtros: util como caso negativo en pipelines de moderacion, para comprobar que un clasificador de contenido detecta respuestas que un modelo alineado bloquearia.
- Experimentacion con tecnicas de cuantizacion: el repositorio ofrece doce variantes del mismo modelo, lo que permite medir el impacto de cada tipo de cuantizacion (Q2_K frente a Q8_0) sobre la perplejidad y la coherencia en una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (peso de los pesos, sin contar KV cache): Q2_K ~2,0 GB; Q3_K_M ~2,4 GB; IQ4_XS ~2,6 GB; Q4_K_M ~2,8 GB; Q5_K_M ~3,2 GB; Q6_K ~3,6 GB; Q8_0 ~4,6 GB; f16 ~8,5 GB.
- GPU recomendadas: para Q4_K_M basta una RTX 3060 de 12 GB o una RTX 4060 de 8 GB; para Q8_0 se recomienda una RTX 4070/4080 de 12-16 GB; para f16, una RTX 4090 de 24 GB o una A100/H100 si se busca throughput alto.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0; f16 requiere 12 GB o mas de VRAM libre.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los tags del repositorio incluyen endpoints_compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-ARA-heretic-GGUF (este) | 4,2B | no disponible | Apache 2.0 | GGUF (12 cuantizaciones) | Decensurado, solo ingles, con mmproj |
| mradermacher/Qwen3.5-4B-heretic-GGUF | 4,2B | no disponible | Apache 2.0 | GGUF | Variante heretic del mismo Qwen3.5-4B, cuantizada por el mismo autor |
| mradermacher/Qwen3.5-4B-ARA-heresy-v2-GGUF | 4,2B | no disponible | no disponible | GGUF | Otra variante ARA/heretic del mismo modelo base |
| Qwen3.5-4B (original) | 4,2B | no disponible | Apache 2.0 | safetensors | Modelo alineado de referencia, con filtros de seguridad |

## Limitaciones y advertencias

- Modelo decensurado: la abliteration elimina los mecanismos de rechazo, por lo que puede generar contenido ofensivo, peligroso o ilegal sin advertir. No es apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo de alucinacion: no hay datos especificos publicados para esta variante; al ser un modelo de 4B, la tasa de alucinacion es previsiblemente superior a la de modelos mayores.
- Solo ingles declarado: el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no documentada en la model card; conviene verificarla en la configuracion del modelo base antes de usarla en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales o las politicas de las plataformas de despliegue; la responsabilidad recae en el integrador.
- El proceso de abliteration puede degradar capacidades generales (razonamiento, coherencia) respecto al modelo original; no se aportan mediciones que lo cuantifiquen.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.
- La model card no detalla el pipeline de transformers ni la configuracion del tokenizer; para uso con transformers habria que recurrir al modelo base richardyoung/Qwen3.5-4B-ARA-heretic.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-ARA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.5-4B-ARA-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-4B-ARA-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-ARA-heretic-GGUF
- Variante heretic alternativa: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-GGUF
- Variante heresy-v2: https://huggingface.co/mradermacher/Qwen3.5-4B-ARA-heresy-v2-GGUF
- Licencia del modelo Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
