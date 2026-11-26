# mradermacher/RPBizkit-Gemma4-v2-26B-A4B-i1-GGUF

## Resumen

RPBizkit-Gemma4-v2-26B-A4B-i1-GGUF es una cuantizacion GGUF del modelo RPBizkit-Gemma4-v2-26B-A4B, un merge de modelos construido con la herramienta ht-mergekit a partir de la familia Gemma. El modelo original lo desarrolla el usuario RicardoEstep y esta cuantizado por mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp. El nombre sugiere una arquitectura tipo Gemma con 26B de parametros totales y 4B activos (sufijo A4B), lo que apunta a un diseno Mixture of Experts, aunque la model card no lo confirma explicitamente.

El modelo resuelve el problema de desplegar un modelo conversacional de gran tamano en hardware de consumo mediante cuantizaciones de 2 a 6 bits con tecnicas imatrix (importancia de pesos), que preservan mas calidad que las cuantizaciones estaticas a igual tamano de archivo. Es relevante para desarrolladores que quieren ejecutar un modelo de ~26B en GPUs consumer o en CPU sin renunciar demasiado a la calidad, aunque su naturaleza de merge experimental y la falta de documentacion detallada lo hacen poco adecuado para produccion sin una evaluacion previa.

La informacion disponible es escasa: la model card del cuantizador se limita a listar los archivos GGUF y enlazar al modelo base, sin especificaciones de contexto, licencia ni benchmarks. El modelo base es un merge etiquetado como "not-for-all-audiences" y solo en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Gemma (detalles no disponibles); posible MoE por el sufijo A4B, no confirmado |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | no disponible (el sufijo A4B sugiere ~4B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (listados en la model card); la lista completa de quants incluye Q2_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_L, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base RPBizkit-Gemma4-v2-26B-A4B es un merge creado con ht-mergekit, una herramienta de fusion de modelos. La model card no detalla la receta de merge (tipo de merge, modelos fuente, pesos de interpolacion) ni los datos de entrenamiento, ya que un merge no entrena desde cero sino que combina pesos de modelos existentes. El sufijo A4B en el nombre sugiere una arquitectura Mixture of Experts con aproximadamente 4B de parametros activos sobre 26B totales, pero esta informacion no aparece confirmada en la documentacion disponible.

La cuantizacion la realiza mradermacher con tecnicas imatrix, que calculan la importancia de cada peso usando un dataset de calibracion para asignar mas bits a los pesos criticos. Esto produce cuantizaciones de mejor calidad que las estaticas a igual tamano. La model card indica que el modelo es de vision (existe un mmproj en el repositorio estatico), aunque no se detalla el encoder visual ni los datos multimodales usados. No hay informacion sobre RLHF, DPO ni composicion del dataset.

## Capacidades

- Generacion de texto conversacional en ingles (tag "conversational").
- Posible soporte de vision: la model card indica que es un modelo de vision y que los archivos mmproj estan en el repositorio estatico, aunque no se detalla la capacidad.
- No hay informacion sobre tool calling, function calling ni soporte de agentes.
- No hay informacion sobre modo thinking, razonamiento multi-paso o capacidades de codigo y matematicas.
- Capacidad multilingue limitada al ingles segun los metadatos.
- Al ser un merge de Gemma, es probable que herede capacidades generales de la familia, pero no hay datos que lo confirmen.

## Casos de uso

- Prototipado local de asistentes conversacionales: las cuantizaciones i1-Q4_K_S (15,6 GB) permiten ejecutar el modelo en una GPU consumer de 16-24 GB con llama.cpp u Ollama, adecuado para experimentar con un modelo de ~25B sin infraestructura de datacenter.
- Evaluacion de merges comunitarios: util para investigadores que quieren comparar el comportamiento de merges de la familia Gemma frente a los modelos originales antes de invertir en despliegue.
- Generacion de texto en ingles en entornos sin conectividad: los GGUF de 10-12 GB (Q2_K, IQ3_M) caben en GPUs de 12 GB o incluso en CPU con RAM suficiente, permitiendo inferencia offline.
- Experimentacion con vision (si el mmproj es compatible): el repositorio estatico incluye archivos mmproj, lo que permitiria probar tareas de imagen-texto en local, aunque la calidad no esta documentada.
- Fine-tuning o destilacion como modelo profesor: al ser un merge de 25B, puede servir como fuente de datos sinteticos en ingles para entrenar modelos mas pequenos.
- Pruebas de cuantizacion y benchmarking de llama.cpp: los distintos niveles de quant (de Q2 a Q6) permiten medir el impacto de la cuantizacion en la perplejidad y la velocidad en hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: i1-Q2_K ~10,7 GB; i1-IQ3_M ~12,5 GB; i1-Q4_K_S ~15,6 GB. Los quants mayores (Q5_K_M, Q6_K) no tienen tamano listado en la model card, pero por la progresion se situarian por encima de 18-20 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_S y superiores con margen; RTX 4080/4070 Ti Super (16 GB) para IQ3_M o Q4_K_S justo; RTX 3060 12 GB o RTX 4070 (12 GB) para Q2_K o IQ3_M.
- Cabe en GPU consumer: si, en modelos de 12 GB o mas con cuantizaciones bajas; en 24 GB con cuantizaciones medias-altas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; tambien es compatible con endpoints (tag endpoints_compatible). Para el modelo base en safetensors, transformers con el formato adecuado.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantizacion. Como referencia general, un modelo de ~25B con 4B activos (si es MoE) tendria throughput alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RPBizkit-Gemma4-v2-26B-A4B-i1-GGUF | ~25,2B (posible ~4B activos) | no disponible | no disponible | GGUF | Merge comunitario, solo ingles, cuantizado por mradermacher |
| Gemma 2 27B (referencia de familia) | 27B | 8K (Gemma 2) | Gemma Terms of Use | safetensors, GGUF | Modelo oficial de Google, mas documentado y con benchmarks publicos |
| Mistral Small 24B | 24B | 32K-128K segun version | Apache 2.0 (segun version) | safetensors, GGUF | Alternativa abierta con licencia permisiva y contexto mayor |
| Qwen2.5 32B | 32B | 32K-128K | Apache 2.0 (segun version) | safetensors, GGUF | Mayor contexto y multilingue, con benchmarks publicos |

La comparativa es aproximada: no hay datos de rendimiento del modelo evaluado, por lo que no se puede establecer una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- La model card no especifica licencia; no se puede asumir uso comercial sin verificar los terminos del modelo base y de los modelos fusionados.
- El tag "not-for-all-audiences" indica que el modelo puede generar contenido inapropiado; no es adecuado para aplicaciones orientadas al publico sin filtros.
- Solo soporta ingles segun los metadatos; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Al ser un merge experimental sin benchmarks, el riesgo de alucinacion y de comportamiento inconsistente es alto; no se recomienda en produccion sin evaluacion propia.
- No hay informacion sobre longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- La cuantizacion a 2-3 bits (Q2_K, IQ3_M) degrada la calidad de forma notable; para uso serio se recomienda Q4_K_S o superior.
- El modelo base no documenta sesgos; los merges pueden heredar y amplificar sesgos de los modelos fuente.
- La fecha de creacion (2026) y la ausencia de descargas o likes sugieren un modelo muy reciente y sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/RPBizkit-Gemma4-v2-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/RicardoEstep/RPBizkit-Gemma4-v2-26B-A4B
- Quants estaticos: https://huggingface.co/mradermacher/RPBizkit-Gemma4-v2-26B-A4B-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#RPBizkit-Gemma4-v2-26B-A4B-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de quant (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
