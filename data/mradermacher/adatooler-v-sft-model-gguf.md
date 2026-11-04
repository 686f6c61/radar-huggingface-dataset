# mradermacher/AdaTooler-V-SFT-model-GGUF

## Resumen

AdaTooler-V-SFT-model-GGUF es la version cuantizada en formato GGUF del modelo AdaTooler-V-SFT-model, un modelo multimodal de aproximadamente 7.600 millones de parametros desarrollado por el equipo AdaTooler-V y publicado bajo licencia Apache 2.0. La cuantizacion ha sido realizada por mradermacher, un colaborador habitual de la comunidad que genera versiones GGUF de modelos populares para facilitar su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base es un transformer multimodal (procesa texto e imagenes, segun indica la presencia de ficheros mmproj en el repositorio) afinado mediante supervisión (SFT, segun el sufijo del nombre) y orientado a tareas de uso de herramientas (tool use) y razonamiento agentico. La cuantizacion incluye el proyector multimodal en dos precisiones (Q8_0 y f16), lo que permite ejecutar el modelo completo, incluyendo la torre de vision, en entornos locales.

La relevancia de esta ficha radica en que ofrece un modelo multimodal de ~7,6B en formato GGUF con licencia permisiva, lo que lo hace candidato para prototipado local de agentes que combinan vision y llamadas a herramientas. No obstante, la informacion publica disponible sobre el modelo base es muy limitada: no se documentan datos de entrenamiento, benchmarks ni detalles de arquitectura mas alla de lo inferible del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision), detalles no disponibles |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal en Q8_0 y f16 |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base AdaTooler-V-SFT-model mas alla de que es un transformer multimodal con proyector de vision (los ficheros `mmproj` del repositorio GGUF confirman la presencia de una torre de vision y un adaptador multimodal). El sufijo "SFT" indica que el modelo ha pasado por un ajuste fino supervisado, presumiblemente sobre el modelo base original, aunque no se especifica el dataset, el numero de tokens ni si hubo etapas adicionales de RLHF o DPO.

No se han publicado en la informacion proporcionada detalles sobre la composicion del corpus de entrenamiento, la estrategia de alineacion, innovaciones tecnicas como decodificacion especulativa o atencion lineal, ni la ventana de contexto nativa. La cuantizacion de mradermacher sigue el flujo estandar de llama.cpp (convert_type hf, quantize_version 2) e incluye variantes con y sin imatrix (estas ultimas en un repositorio separado).

## Capacidades

- Generacion de texto conversacional en ingles (tag `conversational` en el repositorio).
- Procesamiento de imagenes: el repositorio incluye proyector multimodal (`mmproj`), lo que habilita entrada visual combinada con texto.
- Uso de herramientas (tool use): el nombre del modelo base sugiere entrenamiento especifico para llamadas a funciones y agentes, aunque no se documenta el formato exacto.
- Razonamiento multi-paso: probable por el enfoque "tooler", pero no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documentan capacidades de audio, thinking mode explicito ni otros modos especiales.

## Casos de uso

- Prototipado local de agentes con vision: el modelo puede recibir capturas de pantalla o imagenes y generar llamadas a herramientas, lo que permite construir asistentes de automatizacion de escritorio en un solo equipo con GPU de consumo (a partir de la cuantizacion Q4_K_M, ~4,8 GB).
- Automatizacion de tareas GUI: combinando entrada visual y tool calling, encaja en pipelines que interpretan interfaces graficas y emiten acciones estructuradas (clics, entradas de texto) mediante un orquestador externo.
- Extraccion de informacion de documentos escaneados: el modelo puede procesar imagenes de facturas o formularios y devolver campos estructurados, aprovechando la torre de vision y el formato conversacional.
- Asistente de soporte tecnico con contexto visual: en escenarios donde el usuario adjunta una captura de error, el modelo puede razonar sobre la imagen y proponer pasos de resolucion, aunque limitado al ingles.
- Evaluacion de modelos multimodales en investigacion: al ser un GGUF de ~7,6B con licencia Apache 2.0, sirve como baseline reproducible en experimentos de comparacion de agentes visuales en hardware modesto.
- Despliegue en entornos sin conectividad: al ejecutarse con llama.cpp u Ollama, puede integrarse en estaciones de trabajo aisladas para tareas de analisis de imagenes y generacion de texto sin depender de APIs externas.
- Educacion y demos: su tamano permite ejecutarlo en portatiles con GPU de 8 GB (cuantizaciones Q4), facilitando talleres sobre agentes multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): Q2_K ~3,1 GB; Q3_K_M ~3,9 GB; IQ4_XS ~4,4 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB.
- Proyector multimodal adicional: ~1,0 GB (Q8_0) o ~1,5 GB (f16), que debe sumarse a la VRAM del modelo de lenguaje.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q6 con margen para contexto; RTX 4090 24 GB para Q8_0 o f16 con contexto amplio; A100/H100 solo si se requiere alto throughput en servidor.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 4-6 GB (ajustado) hasta Q8_0 en GPUs de 12 GB o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI a traves de servidores GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| AdaTooler-V-SFT-model (este) | ~7,6B | No disponible | Texto + vision | Apache 2.0 | Si (multiples cuantizaciones) |
| Qwen2.5-VL-7B | ~7,6B | 32k (segun documentacion publica del modelo) | Texto + vision | Apache 2.0 | Si, por la comunidad |
| LLaVA-1.6 (Mistral-7B) | ~7B | 4k-32k segun variante | Texto + vision | Apache 2.0 | Si, por la comunidad |
| InternVL2-8B | ~8B | 8k-32k segun variante | Texto + vision | MIT | Si, por la comunidad |

La comparacion se limita a parametros, licencia y disponibilidad de GGUF, ya que no hay benchmarks publicados para AdaTooler-V-SFT-model. Los datos de contexto de los modelos alternativos provienen de su documentacion publica y no de la informacion proporcionada en esta ficha.

## Limitaciones y advertencias

- Informacion publica muy escasa: no se documentan dataset de entrenamiento, contexto nativo, benchmarks ni detalles de alineacion, lo que dificulta evaluar su calidad frente a alternativas.
- Idioma: soporte declarado unicamente en ingles; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Riesgo de alucinacion: al ser un modelo SFT de ~7,6B sin documentacion sobre RLHF, cabe esperar alucinaciones en tareas de razonamiento complejo y en la interpretacion de imagenes ambiguas.
- Sesgos: no se documentan evaluaciones de sesgo; al desconocerse la composicion del corpus, no pueden descartarse sesgos de genero, raza o culturales.
- Tool calling: aunque el nombre sugiere entrenamiento para uso de herramientas, no se especifica el formato de llamada ni su fiabilidad, por lo que requiere validacion empirica antes de produccion.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario debe verificar que el modelo base no imponga restricciones adicionales no reflejadas en la model card.
- Cuantizaciones de baja precision (Q2_K, Q3_K_S): degradacion de calidad notable; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio.
- Fecha de creacion del repositorio (2026-01-14) y actualizacion (2026-11-03): verificar que la version descargada corresponde a la revision deseada, ya que el repositorio puede haber cambiado.
- El repositorio pesa 70,4 GB en total por incluir todas las cuantizaciones; descargar solo los ficheros necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AdaTooler-V-SFT-model-GGUF
- Modelo base: https://huggingface.co/AdaTooler-V/AdaTooler-V-SFT-model
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/AdaTooler-V-SFT-model-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#AdaTooler-V-SFT-model-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
