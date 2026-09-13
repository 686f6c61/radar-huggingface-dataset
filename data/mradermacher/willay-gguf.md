# mradermacher/WILLAY-GGUF

## Resumen

WILLAY-GGUF es el repositorio de cuantizaciones en formato GGUF del modelo SZLHOLDINGS/WILLAY, generado por el usuario mradermacher (nethype GmbH). Se trata de una recopilación de pesos cuantizados estáticos, no de un modelo entrenado desde cero: el autor original del modelo base es SZLHOLDINGS, y las etiquetas de la model card apuntan a un ajuste fino supervisado (sft, trl, hf_jobs) dentro de un marco denominado governed-ai / doctrine-v11, con un componente explícito de "identity" (identidad) y nombre propio WILLAY.

El modelo base tiene 494.032.768 parámetros (aproximadamente 494 M), un tamaño que lo sitúa en la categoría de modelos pequeños, apto para ejecución en CPU o en GPUs de gama baja. El repositorio GGUF ocupa 5,4 GB en total, pero cada cuantización individual es muy ligera: desde 0,4 GB en Q2_K/Q3_K_S hasta 1,1 GB en f16. La licencia declarada es Apache 2.0 y el único idioma declarado es el inglés (en).

La relevancia de esta ficha es fundamentalmente práctica: al no existir resultados de benchmarks publicados ni especificaciones de contexto o arquitectura en la información disponible, el valor del repositorio reside en ofrecer hasta doce variantes de cuantización listas para desplegar con llama.cpp, Ollama o cualquier runtime compatible con GGUF, con un coste de hardware mínimo. La fecha de creación del repositorio que consta en los metadatos es 2026-09-13.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card) |
| Parametros totales | 494.032.768 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base publica pesos en safetensors |
| Tamano del repositorio | 5,4 GB (suma de todas las cuantizaciones) |
| Modelo base | SZLHOLDINGS/WILLAY |
| Cuantizado por | mradermacher (nethype GmbH) |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no aporta información sobre la arquitectura del modelo base. Las únicas pistas disponibles son las etiquetas asociadas al modelo original: sft (supervised fine-tuning), trl (Transformer Reinforcement Learning), hf_jobs (entrenamiento ejecutado en la infraestructura de trabajos de Hugging Face), governed-ai, szl-holdings, doctrine-v11, identity y willay. Esto indica que el modelo base pasó por un proceso de ajuste fino supervisado, probablemente sobre un modelo preentrenado previo, y que existe una definición interna de "doctrina" (doctrine-v11) y de comportamiento identitario que condiciona sus respuestas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO posteriores al SFT, ni sobre innovaciones técnicas concretas (atención lineal, decodificación especulativa, mezcla de expertos). Tampoco se documentan detalles del tokenizador ni la ventana de contexto máxima soportada. Las cuantizaciones de este repositorio son "static quants" (cuantización estática); el autor indica que en el momento de la publicación no había cuantizaciones ponderadas o basadas en imatrix disponibles.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como "conversational" y "endpoints_compatible", lo que sugiere uso en diálogo multi-turno.
- Ajuste por instrucciones: la etiqueta sft indica que el modelo fue afinado para seguir instrucciones, no solo para completar texto.
- Comportamiento identitario gobernado: las etiquetas governed-ai, doctrine-v11 e identity apuntan a un condicionamiento explícito de la identidad y de las políticas de respuesta del modelo, presumiblemente con reglas de comportamiento definidas por SZLHOLDINGS.
- Capacidades multilingües: limitadas al inglés según el campo language de la model card.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Uso como agente o razonamiento multi-paso: no disponible (no se documenta).
- Modo "thinking", visión o audio: no disponible (no se documenta).
- Ejecución local eficiente: al ser un modelo de ~494 M de parámetros con cuantizaciones desde 0,4 GB, es viable en CPU y en GPUs integradas.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en local: con la cuantización Q4_K_M (0,5 GB) el modelo se carga en cualquier portátil y permite iterar sobre prompts y flujos de diálogo sin coste de API.
- Pruebas de integración de endpoints compatibles con OpenAI: la etiqueta endpoints_compatible sugiere que puede desplegarse detrás de una API estilo OpenAI para validar pipelines de cliente antes de migrar a un modelo mayor.
- Filtrado o clasificación previa en pipelines de datos: al ser tan ligero, puede usarse como primera etapa para etiquetar, resumir o descartar texto antes de invocar un modelo grande, reduciendo coste por token.
- Despliegue en dispositivos con recursos limitados: con Q4_K_S o Q2_K (0,4-0,5 GB) cabe en Raspberry Pi, mini-PC o contenedores con poca RAM, útil para demos offline o entornos sin conectividad.
- Evaluación de comportamiento "gobernado": para investigadores interesados en cómo se implementan restricciones de identidad y doctrina en modelos pequeños, este checkpoint permite auditar respuestas bajo distintas condiciones de prompt.
- Generación de texto asistida en inglés dentro de aplicaciones de escritorio: integrable mediante llama.cpp u Ollama en herramientas ofimáticas o editores para autocompletado y reescritura breve.
- Base para experimentos de cuantización: las doce variantes publicadas (de Q2_K a f16) permiten estudiar la degradación de calidad por bits por peso en un modelo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la búsqueda web realizada no devolvió resultados relacionados con el modelo (los resultados obtenidos trataban sobre almacenamiento de frutas y no guardan relación con WILLAY).

## Requisitos de hardware

- VRAM estimada para inferencia (pesos en memoria, según los tamaños de archivo publicados): f16 ≈ 1,1 GB; Q8_0 ≈ 0,6 GB; Q6_K ≈ 0,6 GB; Q5_K_M / Q5_K_S ≈ 0,5 GB; Q4_K_M / Q4_K_S ≈ 0,5 GB; IQ4_XS ≈ 0,5 GB; Q3_K_L / Q3_K_M / Q3_K_S ≈ 0,4-0,5 GB; Q2_K ≈ 0,4 GB. Hay que añadir el consumo del contexto (KV cache), no cuantificado en estas cifras.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para las cuantizaciones bajas; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque están sobredimensionadas para este tamaño de modelo.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en iGPUs con memoria compartida suficiente.
- Ejecución en CPU: viable y probablemente el escenario principal, dado el tamaño (0,4-1,1 GB de pesos); también cabe en dispositivos con 2-4 GB de RAM libre.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui, servidores compatibles con endpoints OpenAI. vLLM y TGI soportan GGUF de forma limitada o experimental, por lo que no es la vía recomendada para este repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| WILLAY-GGUF (este) | 494 M | no disponible | Apache 2.0 | GGUF (12 cuantizaciones) | no disponible |
| Qwen2.5-0.5B (referencia de tamano similar) | 494 M aprox. | no disponible en esta busqueda | Apache 2.0 | safetensors, GGUF de terceros | no disponible en esta busqueda |
| SmolLM2-360M (referencia de tamano similar) | 362 M | no disponible en esta busqueda | Apache 2.0 | safetensors, GGUF de terceros | no disponible en esta busqueda |
| TinyLlama-1.1B (referencia de tamano superior) | 1,1 B | no disponible en esta busqueda | Apache 2.0 | safetensors, GGUF de terceros | no disponible en esta busqueda |

No se dispone de datos de rendimiento comparativo entre WILLAY y estas alternativas dentro de la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad de formatos. La busqueda web no aporto ningun resultado relevante sobre WILLAY ni sobre modelos comparables.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada que permita estimar la calidad del modelo en tareas de razonamiento, código o matemáticas; cualquier uso en producción debería ir precedido de una evaluación propia.
- Idiomas: solo se declara inglés. No hay evidencia de soporte de castellano u otros idiomas; el rendimiento fuera del inglés es desconocido.
- Longitud de contexto desconocida: al no documentarse la ventana de contexto, no se puede asumir soporte fiable para conversaciones largas o documentos extensos.
- Riesgo de alucinación: inherente a los modelos de ~494 M de parámetros, que tienen una capacidad factual y de razonamiento limitada en comparación con modelos de miles de millones de parámetros.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad. El condicionamiento por "doctrine-v11" e "identity" implica una orientación deliberada de las respuestas cuyo contenido y criterios no están descritos públicamente, lo que puede introducir sesgos no auditados.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no exime de responsabilidad sobre el comportamiento del modelo ni sobre los datos con los que se le entrene posteriormente.
- Trazabilidad del proceso de cuantización: al tratarse de cuantizaciones estáticas (sin imatrix), puede haber una pérdida de calidad mayor que en cuantizaciones ponderadas equivalentes en bits; el autor indica que no había planes confirmados de publicar variantes ponderadas.
- Datos del repositorio: las descargas registradas son 0 y los "likes" 1, lo que indica una adopción prácticamente nula y ausencia de validación por parte de la comunidad.
- Fechas de metadatos poco habituales: la fecha de creación indicada (2026-09-13) es posterior a la fecha habitual de consulta, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WILLAY-GGUF
- Modelo base: https://huggingface.co/SZLHOLDINGS/WILLAY
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#WILLAY-GGUF
- Guia de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Web de nethype GmbH: https://www.nethype.de/
