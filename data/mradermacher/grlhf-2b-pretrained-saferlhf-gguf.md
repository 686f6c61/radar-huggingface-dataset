# mradermacher/GRLHF-2B-Pretrained-SafeRLHF-GGUF

## Resumen

GRLHF-2B-Pretrained-SafeRLHF-GGUF es la version cuantizada en formato GGUF del modelo GRLHF-2B-Pretrained-SafeRLHF, desarrollado por el colectivo generative-rlhf-v y convertida por mradermacher, un conocido autor de cuantizaciones para llama.cpp. Se trata de un modelo de lenguaje de aproximadamente 1.777 millones de parametros (1,78 B) orientado a conversacion y alineamiento mediante tecnicas de RLHF, segun indica su nombre (GRLHF = Generative RLHF) y el sufijo SafeRLHF, que sugiere un entrenamiento con refuerzo humano centrado en seguridad.

El modelo base esta pensado para generacion de texto conversacional en ingles y se distribuye principalmente en formato GGUF para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.). La cuantizacion incluye tambien un fichero mmproj, lo que indica que el modelo original incorpora un adaptador multimodal (vision), aunque la model card no detalla la arquitectura interna ni la composicion del dataset de entrenamiento.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~1,8 B de parametros con alineamiento de seguridad en hardware de consumo, con cuantizaciones desde 0,9 GB (Q2_K) hasta 3,7 GB (f16). No obstante, la informacion publicada es escasa: no hay benchmarks, no se especifica la licencia y la model card del cuantizador se limita a listar los ficheros generados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, segun tags de transformers; no confirmado) |
| Parametros totales | 1.777.088.000 (~1,78 B) |
| Parametros activos | no aplica (no es MoE, segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (adaptador multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base original en safetensors/transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base GRLHF-2B-Pretrained-SafeRLHF. Por el nombre y los tags, se infiere un transformer decoder-only de ~1,78 B de parametros, preentrenado y posteriormente alineado mediante RLHF con un componente de seguridad (SafeRLHF). La presencia de ficheros mmproj en la cuantizacion indica que el modelo incorpora capacidades multimodales (vision), aunque no se especifica el codificador visual ni como se integra.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de DPO/PPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card del cuantizador es puramente operativa (lista de ficheros y notas de uso) y no aporta informacion sobre el entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles (tag `conversational`).
- Alineamiento de seguridad mediante SafeRLHF, orientado a reducir respuestas daninas.
- Capacidades multimodales (vision) inferidas por la presencia de ficheros `mmproj` en la cuantizacion; no confirmadas en detalle.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama en equipos de consumo (1,2 GB en Q4_K_M) para mantener dialogos multi-turno sin conexion, gracias a su tamano reducido.
- Filtrado y moderacion de contenido: su entrenamiento SafeRLHF lo hace adecuado como clasificador generativo de seguridad en pipelines de moderacion, evaluando respuestas candidatas antes de publicarlas.
- Prototipado rapido de chatbots: al caber en GPU de 4-8 GB, permite iterar sobre prompts y flujos conversacionales en estaciones de trabajo sin GPU dedicada de gama alta.
- Educacion e investigacion sobre RLHF: sirve como caso de estudio reproducible de un modelo alineado de ~1,8 B, util para experimentos academicos sobre seguridad y alineamiento.
- Despliegue en dispositivos edge: con cuantizaciones Q3/Q4 (1,0-1,2 GB) puede ejecutarse en mini-PC, Raspberry Pi de gama alta o moviles via llama.cpp, para tareas de generacion de texto ligera.
- Experimentacion multimodal basica: los ficheros mmproj permiten probar entrada de imagenes con llama.cpp (si la build lo soporta), por ejemplo para descripcion de imagenes o VQA simple en ingles.
- Generacion de texto asistida en herramientas de escritorio: integrable en LM Studio o interfaces similares para redaccion y resumen de textos cortos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): Q2_K ~0,9 GB; Q4_K_M ~1,2 GB; Q6_K ~1,6 GB; Q8_0 ~2,0 GB; f16 ~3,7 GB. Anadir 0,5-2 GB adicionales para KV cache y overhead segun contexto.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, RTX 4090); en Q4_K_M cabe holgadamente en 4 GB. Para f16 se recomienda 6-8 GB (RTX 3060, RTX 4060 Ti).
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas; tambien en CPU pura gracias al formato GGUF.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; el modelo base en transformers puede servirse con vLLM o TGI si se dispone de los pesos originales (no incluidos en este repo).
- Latencia y throughput estimados: no disponibles; por tamano (~1,8 B) se espera decodificacion en tiempo real en GPU consumer y varios tokens/s en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GRLHF-2B-Pretrained-SafeRLHF (este) | ~1,78 B | no disponible | no disponible | GGUF (+ base transformers) | Alineamiento SafeRLHF, multimodal via mmproj |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32K (segun model card publica de Qwen) | Apache 2.0 | safetensors, GGUF | Multilingue, ampliamente benchmarkeado |
| Llama 3.2 1B Instruct | ~1,2 B | 128K (segun model card publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Multilingue, con variante vision |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8K (segun model card publica de Hugging Face) | Apache 2.0 | safetensors, GGUF | Enfocado a eficiencia en edge |

Nota: los datos de los modelos comparables provienen de sus model cards publicas; los de este modelo son en gran parte "no disponible", por lo que la comparacion de rendimiento no puede establecerse con rigor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo entrenado principalmente en ingles, es probable que presente sesgos culturales y linguisticos anglosajones.
- Riesgo de alucinacion: inherente a modelos de ~1,8 B; la capacidad de razonamiento y factualidad es limitada en comparacion con modelos mayores.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no esta publicada, lo que impide planificar usos con documentos largos.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada; no debe usarse en produccion comercial sin verificar la licencia del modelo base (generative-rlhf-v/GRLHF-2B-Pretrained-SafeRLHF).
- Caveats de produccion: el cuantizador indica que no hay cuantizaciones con imatrix/weighted disponibles; las Q2/Q3 pueden degradar notablemente la calidad. El repo pesa 18,2 GB por incluir todas las variantes, pero cada fichero individual es pequeno.
- El "SafeRLHF" no garantiza ausencia total de respuestas daninas; requiere capas adicionales de moderacion en produccion.
- La funcionalidad multimodal (mmproj) no esta documentada en detalle y su soporte depende de la build de llama.cpp utilizada.

## Enlaces

- Hugging Face (este repo GGUF): https://huggingface.co/mradermacher/GRLHF-2B-Pretrained-SafeRLHF-GGUF
- Modelo base: https://huggingface.co/generative-rlhf-v/GRLHF-2B-Pretrained-SafeRLHF
- Pagina de overview del cuantizador: https://hf.tst.eu/model#GRLHF-2B-Pretrained-SafeRLHF-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
