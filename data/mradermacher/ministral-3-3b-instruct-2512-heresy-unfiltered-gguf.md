# mradermacher/Ministral-3-3B-Instruct-2512-Heresy-Unfiltered-GGUF

## Resumen

Ministral-3-3B-Instruct-2512-Heresy-Unfiltered-GGUF es una cuantizacion en formato GGUF del modelo imbleach/Ministral-3-3B-Instruct-2512-Heresy-Unfiltered, un ajuste fino de la familia Ministral 3 de Mistral AI orientado a narracion y contenido sin filtros. El trabajo de cuantizacion lo firma mradermacher, un prolifico publicador de versiones GGUF para llama.cpp y ecosistemas compatibles. El modelo base parte de Ministral 3 3B Instruct (version 2512) y ha sido modificado para reducir las capas de rechazo y alineacion, etiquetado por el autor como "unfiltered" y "visceral" para generacion creativa.

Con 3.429.006.336 parametros (aproximadamente 3,4 mil millones), es un modelo denso de tamano pequeno disenado para ejecucion local en hardware de consumo. La licencia declarada es Apache 2.0, lo que permite uso comercial segun los terminos de dicha licencia, aunque el modelo base y el ajuste fino deben verificarse por separado. El idioma declarado es unicamente ingles.

Su relevancia actual radica en la demanda de modelos pequenos, desplegables en local y sin censura para escritura creativa, juegos de rol y generacion de narrativa. El repositorio ofrece 12 cuantizaciones estaticas desde Q2_K (1,6 GB) hasta f16 (7,0 GB), lo que cubre desde GPUs integradas hasta estaciones de trabajo con VRAM abundante. El modelo acumula 293 descargas y ningun "like" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Ministral 3 3B Instruct 2512) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tambien existe el modelo base en transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa heredada de Ministral 3 3B Instruct 2512. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion aplicadas en el ajuste fino "Heresy-Unfiltered". Por la nomenclatura y las etiquetas del autor ("unfiltered", "visceral", "storytelling"), se trata de un fine-tuning orientado a reducir los mecanismos de rechazo y a favorecer respuestas narrativas intensas, presumiblemente mediante ajuste supervisado sobre datos de ficcion y roleplay.

La cuantizacion realizada por mradermacher emplea el formato GGUF con metadatos de version 2 y cuantizacion de tensores de salida (output_tensor_quantised: 1), con conversion desde pesos Hugging Face. Se ofrece una variante adicional con cuantizacion ponderada/imatrix en el repositorio hermano Ministral-3-3B-Instruct-2512-Heresy-Unfiltered-i1-GGUF, que suele ofrecer mejor relacion calidad/tamano que las cuantizaciones estaticas equivalentes. No se documentan innovaciones como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles con formato instruct.
- Narracion creativa y storytelling, etiqueta explicita del autor.
- Roleplay y ficcion sin las capas habituales de rechazo del modelo base.
- Generacion de texto largo con tono "visceral", segun la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo "thinking".
- Multilinguismo limitado al ingles segun el campo `language`.
- Compatible con endpoints (`endpoints_compatible` en los tags), lo que sugiere despliegue en infraestructuras tipo Inference Endpoints.

## Casos de uso

- Escritura creativa y ficcion: el ajuste "unfiltered" permite generar narrativa con violencia, temas adultos o tonos oscuros sin las interrupciones tipicas de modelos alineados, adecuado para autores que necesitan borradores rapidos en local.
- Roleplay y juegos de mesa: con 3,4 mil millones de parametros y cuantizacion Q4_K_M (2,2 GB) puede ejecutarse en una GPU de 8 GB, sirviendo como motor de NPCs o master de juego en aplicaciones de escritorio.
- Prototipado de chatbots de personaje: la licencia Apache 2.0 facilita integrar el modelo en productos comerciales de entretenimiento, siempre que se validen los terminos del modelo base.
- Generacion de dialogos para videojuegos indie: el bajo coste de inferencia local permite generar lineas de dialogo en tiempo de ejecucion en equipos de desarrollo sin presupuesto de API.
- Experimentacion en investigacion sobre alineacion: util como contrapunto "sin filtros" para estudiar diferencias de comportamiento frente al Ministral 3 Instruct original en tareas de rechazo y sesgo.
- Despliegue en edge y hardware modesto: la cuantizacion Q2_K (1,6 GB) permite ejecucion en CPU o GPUs integradas para demos y pruebas offline.
- Generacion de contenido para mods y campanas de rol: el contexto conversacional y el tono narrativo encajan con la produccion de material de campana en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~1,6 GB; Q3_K_M ~1,9 GB; Q4_K_M ~2,2 GB; Q5_K_M ~2,6 GB; Q6_K ~2,9 GB; Q8_0 ~3,8 GB; f16 ~7,0 GB.
- Se recomienda anadir entre 1 y 2 GB adicionales de VRAM para la cache KV segun la longitud de contexto configurada.
- GPU consumer compatibles: cualquier GPU con 4 GB o mas para Q4_K_M (GTX 1650 4 GB, RTX 3050, RTX 4060, RX 6600). Para Q8_0 se recomienda 6-8 GB (RTX 3060, RTX 4060 Ti, RX 7600).
- GPU profesionales: A100, H100 y L40S sobredimensionadas para este modelo; utiles solo para servir muchas instancias concurrentes.
- Cabe en CPU: las cuantizaciones Q2_K a Q4_K_M son viables en CPU moderna con 8-16 GB de RAM a velocidades de pocos tokens por segundo.
- Opciones de despliegue: llama.cpp, Ollama (mediante Modelfile), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI a traves de llama.cpp server o vLLM (vLLM requiere conversion o soporte GGUF experimental).
- Latencia y throughput: no disponibles en la informacion proporcionada; en una RTX 4090 con Q4_K_M se espera un throughput alto por el reducido tamano, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ministral-3-3B-Instruct-2512-Heresy-Unfiltered-GGUF (este) | 3,43 B | no disponible | Apache 2.0 | GGUF | Fine-tuning sin filtros, solo ingles |
| Ministral 3B Instruct (original de Mistral AI) | ~3 B | no disponible en esta ficha | no disponible | safetensors, GGUF | Base alineada, multilingue |
| Llama 3.2 3B Instruct | 3,21 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Multilingue, requiere aceptar licencia |
| Qwen2.5 3B Instruct | 3,09 B | 32 K | Apache 2.0 | safetensors, GGUF | Multilingue, buen rendimiento en codigo |

La comparativa se limita a datos publicos de cada familia; no se dispone de mediciones directas entre este fine-tuning y los alternativos.

## Limitaciones y advertencias

- El ajuste "unfiltered" elimina barreras de seguridad: puede generar contenido violento, sexual, ofensivo o ilegal si se le solicita. No es apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo elevado de alucinacion por el reducido tamano (3,4 B) y por el entrenamiento orientado a ficcion, no a precision factual.
- Solo soporta ingles; el rendimiento en castellano no esta garantizado ni documentado.
- La longitud de contexto no esta especificada; asumir contexto corto (probablemente 32 K o menos, segun la familia Ministral) hasta confirmacion.
- La licencia Apache 2.0 se declara sobre el modelo cuantizado, pero el modelo base imbleach y el Ministral original pueden tener condiciones adicionales; verificar antes de uso comercial.
- El modelo base es un fine-tuning no oficial de Ministral; no hay garantia de calidad ni soporte por parte de Mistral AI.
- Sin benchmarks publicados: no se puede comparar objetivamente su rendimiento con alternativas.
- El repositorio tiene 0 "likes" y 293 descargas, lo que sugiere poca validacion por parte de la comunidad.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Ministral-3-3B-Instruct-2512-Heresy-Unfiltered-GGUF
- Modelo base (fine-tuning): https://huggingface.co/imbleach/Ministral-3-3B-Instruct-2512-Heresy-Unfiltered
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Ministral-3-3B-Instruct-2512-Heresy-Unfiltered-i1-GGUF
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#Ministral-3-3B-Instruct-2512-Heresy-Unfiltered-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
