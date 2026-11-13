# mradermacher/Uncensored_DeepSeek_R1_Distill_Qwen_1.5B_safetensors_finetune_2-GGUF

## Resumen

Uncensored_DeepSeek_R1_Distill_Qwen_1.5B_safetensors_finetune_2-GGUF es una coleccion de cuantizaciones GGUF estaticas del modelo ICEPVP8977/Uncensored_DeepSeek_R1_Distill_Qwen_1.5B_safetensors_finetune_2, publicada por mradermacher. El modelo subyacente es un fine-tuning de tipo "uncensored" sobre una destilacion de DeepSeek R1 en la base Qwen 1.5B, orientado a generacion conversacional en ingles. La relevancia practica de esta ficha reside en que ofrece el modelo en formatos GGUF listos para llama.cpp y Ollama, lo que permite ejecutarlo en hardware de consumo.

El repositorio contiene unicamente pesos cuantizados (no los pesos originales en safetensors), con 1.777.088.000 parametros reales segun los tensores del modelo base. El autor de las cuantizaciones es mradermacher, que actua como tercero respecto al autor del fine-tuning (ICEPVP8977). No se dispone de informacion sobre la licencia, el contexto maximo, la composicion del dataset de entrenamiento ni los resultados de evaluacion.

Se trata de un modelo pequeno (1.5B) con un unico idioma declarado (ingles) y sin pipeline declarado en Hugging Face. Su interes es acotado: sirve como base para experimentacion local con modelos de razonamiento destilados y sin filtros de alineamiento, pero carece de documentacion tecnica suficiente para un uso en produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen 1.5B con destilacion de DeepSeek R1; arquitectura exacta no documentada) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base. Por el nombre y el linaje declarado, se trata de una destilacion de DeepSeek R1 sobre Qwen 1.5B, posteriormente sometida a un fine-tuning adicional por ICEPVP8977 sobre el dataset ICEPVP8977/Uncensored_Small_Test_Time_Compute. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o test-time compute en el proceso.

Las cuantizaciones publicadas por mradermacher son estaticas (convert_type: hf, quantize_version: 2). El autor indica que no hay cuantizaciones ponderadas o con imatrix disponibles en el momento de la publicacion, y que no las tiene planificadas salvo peticion en la seccion de discusiones de la comunidad. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (tag conversational).
- Razonamiento derivado de la destilacion de DeepSeek R1, aunque sin documentacion sobre el formato de trazas de razonamiento ni sobre la calidad de las mismas.
- Fine-tuning orientado a reducir el filtrado de contenido ("uncensored"), segun el nombre del modelo base.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles declarado.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Experimentacion local con modelos de razonamiento destilado: el modelo cabe en GPUs de consumo en cuantizaciones Q4 (1,2 GB) y permite probar tecnicas de prompting de razonamiento sin infraestructura dedicada.
- Prototipado de asistentes conversacionales en ingles: con 1,5B parametros y cuantizacion Q8_0 (2,0 GB) se puede desplegar un chatbot basico en una estacion de trabajo para validar flujos de conversacion antes de escalar a modelos mayores.
- Evaluacion de fine-tunings "uncensored": util para investigadores que estudian el efecto de la desalineacion en modelos pequenos, comparando respuestas frente al modelo base sin fine-tuning.
- Generacion de texto en entornos con recursos muy limitados: la cuantizacion Q2_K (0,9 GB) permite ejecucion en CPU o en GPUs integradas, adecuada para demos offline o entornos embebidos.
- Base para fine-tuning posterior: al ser un modelo pequeno con pesos GGUF y safetensors disponibles en el repositorio base, sirve como punto de partida para adaptaciones con LoRA en ingles sobre dominios concretos.
- Pruebas de integracion con llama.cpp y Ollama: el formato GGUF y el tag endpoints_compatible facilitan la validacion de pipelines de inferencia local antes de migrar a modelos de mayor tamano.
- Analisis de robustez y seguridad: util como caso de estudio de los riesgos de publicar modelos sin documentacion de licencia ni evaluacion de sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en Q2_K, 1,2 GB en Q4_K_M, 1,6 GB en Q6_K, 2,0 GB en Q8_0 y 3,7 GB en f16.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones Q4-Q8; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en tarjetas como GTX 1650, RTX 3050, RTX 4060 y superiores; tambien en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con endpoints; el tag endpoints_compatible sugiere soporte en plataformas de inferencia gestionada.
- Latencia y throughput estimados: no disponibles. Por el tamano (1,5B) y las cuantizaciones de 1-2 GB, se espera una latencia baja en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (GGUF de Uncensored_DeepSeek_R1_Distill_Qwen_1.5B) | 1,78B | no disponible | no disponible | GGUF | Fine-tuning "uncensored" sin documentacion |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo base de referencia, alineado y documentado |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32.768 tokens (segun documentacion publica de DeepSeek) | MIT (segun documentacion publica) | safetensors, GGUF | Destilacion oficial de R1, con benchmarks publicados |

La comparativa se limita a los modelos de los que se dispone de datos publicos; para este modelo concreto no hay informacion de contexto, licencia ni rendimiento que permita una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre licencia: no se puede garantizar el uso comercial ni la redistribucion.
- El fine-tuning "uncensored" implica un riesgo elevado de generar contenido danino, sesgado o inapropiado; no se han publicado evaluaciones de seguridad.
- Riesgo de alucinacion alto por el tamano reducido (1,5B) y por la falta de datos de evaluacion.
- Contexto maximo no documentado; no se debe asumir una ventana larga.
- Solo soporta ingles declarado; el rendimiento en castellano no esta validado.
- Modelo cuantizado por un tercero (mradermacher) sobre un fine-tuning de otro autor (ICEPVP8977): la trazabilidad del proceso de entrenamiento es limitada.
- No hay cuantizaciones imatrix o ponderadas disponibles, lo que puede reducir la calidad frente a alternativas mejor optimizadas.
- Sin benchmarks publicados: no se puede verificar la calidad del razonamiento ni del formato conversacional.
- El repositorio ocupa 16,2 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Uncensored_DeepSeek_R1_Distill_Qwen_1.5B_safetensors_finetune_2-GGUF
- Modelo base: https://huggingface.co/ICEPVP8977/Uncensored_DeepSeek_R1_Distill_Qwen_1.5B_safetensors_finetune_2
- Dataset de entrenamiento: https://huggingface.co/datasets/ICEPVP8977/Uncensored_Small_Test_Time_Compute
- Pagina de descargas del autor de las cuantizaciones: https://hf.tst.eu/model#Uncensored_DeepSeek_R1_Distill_Qwen_1.5B_safetensors_finetune_2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
