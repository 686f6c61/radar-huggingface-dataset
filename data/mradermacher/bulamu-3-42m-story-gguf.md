# mradermacher/BULaMU-3-42M-Story-GGUF

## Resumen

BULaMU-3-42M-Story-GGUF es la version cuantizada en formato GGUF del modelo mwebazarick/BULaMU-3-42M-Story, un modelo de lenguaje de generacion de texto de tan solo 42 millones de parametros especializado en la generacion de historias (story generation) en ingles. La cuantizacion ha sido realizada por mradermacher, un conocido creador de versiones GGUF de la comunidad, lo que permite ejecutar el modelo en hardware muy modesto, incluso en CPU, mediante llama.cpp u otras herramientas compatibles con GGUF.

El modelo base es un transformer de arquitectura no especificada en la informacion disponible, con 42.082.816 parametros totales y entrenado presumiblemente desde cero para la tarea de generacion de narrativa corta. Su tamano extremadamente reducido (el repo completo ocupa 0,4 GB, y las cuantizaciones individuales rondan los 0,1 GB) lo convierte en un candidato para experimentacion, prototipado rapido, entornos embebidos y pruebas de pipelines de inferencia local, mas que para aplicaciones de produccion con requisitos de calidad alta.

La relevancia de esta ficha radica en documentar una opcion de inferencia ultraligera bajo licencia Apache 2.0, con soporte para multiples niveles de cuantizacion (desde Q2_K hasta f16) y compatibilidad con el ecosistema GGUF. No obstante, la informacion publica sobre el modelo base es muy limitada: no se detallan la arquitectura exacta, el dataset de entrenamiento, la longitud de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible) |
| Parametros totales | 42.082.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo base mas alla de que se trata de un transformer de 42 millones de parametros. No se detalla el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni el mecanismo de atencion empleado. El modelo esta etiquetado como `transformers` y su modelo base es mwebazarick/BULaMU-3-42M-Story, del que tampoco se proporcionan detalles arquitectonicos en la informacion suministrada.

Respecto al entrenamiento, no se dispone de datos sobre el numero de tokens utilizados, la composicion del dataset, si se aplicaron tecnicas de RLHF, DPO o instruccion tuning, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica informacion concreta es que el modelo esta orientado a la generacion de historias en ingles, lo que sugiere un entrenamiento enfocado en corpus narrativos, aunque esto no se confirma en la documentacion disponible. La cuantizacion realizada por mradermacher es de tipo estatico (sin imatrix/weighted quants, segun indica la propia model card), lo que implica que no se han generado cuantizaciones ponderadas por importancia.

## Capacidades

- Generacion de texto narrativo en ingles, presumiblemente orientada a relatos cortos e historias.
- Generacion de texto autoregresiva basica propia de un modelo de lenguaje causal.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma.
- No se documentan capacidades de vision, audio, thinking mode ni otras modalidades.
- No se documenta soporte de instrucciones (instruction following) ni de chat.

## Casos de uso

- Prototipado de pipelines de generacion de texto: por su tamano de 42M de parametros y sus cuantizaciones de ~0,1 GB, permite validar rapidamente flujos de inferencia con llama.cpp antes de escalar a modelos mayores.
- Experimentacion educativa: util para demostrar el funcionamiento de un modelo de lenguaje causal y el efecto de distintas cuantizaciones (Q2_K frente a Q8_0) en la calidad de la generacion, sin requerir GPU.
- Generacion de historias cortas en ingles para pruebas de concepto: el modelo esta etiquetado como "Story", por lo que puede emplearse para generar narrativa breve en entornos de demo o test.
- Inferencia en dispositivos con recursos muy limitados: al caber en menos de 200 MB en f16 y ~100 MB en cuantizaciones intermedias, puede ejecutarse en CPU, Raspberry Pi o entornos embebidos con RAM reducida.
- Pruebas de integracion con llama.cpp, Ollama u otros runners GGUF: sirve como modelo de humo (smoke test) para verificar que un pipeline de despliegue funciona antes de cargar modelos de mayor tamano.
- Benchmarking de cuantizaciones: permite comparar la perplejidad y la calidad de salida entre los distintos niveles de cuantizacion ofrecidos (Q2_K, Q4_K_M, Q8_0, f16) en una tarea concreta de generacion de historias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,5 GB en todas las cuantizaciones; las versiones Q4_K_M y Q5_K_M rondan los 0,1 GB y la f16 los 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere hardware dedicado. Funciona en GPUs integradas y en CPU.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 3050, RTX 4090, asi como en Apple Silicon y en CPU convencional.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runner compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en CPU y practicamente instantanea en GPU, aunque no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BULaMU-3-42M-Story-GGUF | 42,08 M | no disponible | Apache 2.0 | GGUF | Cuantizado por mradermacher; solo ingles; orientado a historias |
| Modelo base BULaMU-3-42M-Story | 42,08 M | no disponible | Apache 2.0 | safetensors | Version original sin cuantizar |
| TinyStories (modelos de ~1M-30M) | ~1 M-30 M | no disponible | variable | safetensors/GGUF | Familia de modelos pequenos para narrativa; comparacion cualitativa, no disponible en detalle |
| SmolLM-135M | 135 M | no disponible | Apache 2.0 | safetensors/GGUF | Modelo pequeno generalista de Hugging Face; mayor tamano y capacidades mas amplias |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Modelo de 42M de parametros: la calidad de generacion sera limitada en coherencia, consistencia a largo plazo y riqueza lexica en comparacion con modelos de mayor tamano.
- Riesgo elevado de alucinacion y de deriva narrativa, especialmente con cuantizaciones agresivas como Q2_K o Q3_K_S.
- Solo soporta ingles segun la etiqueta de idioma; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada: no se puede garantizar el manejo de contextos largos ni de conversaciones multi-turno.
- No se documenta instruction tuning ni alineacion (RLHF/DPO), por lo que puede no seguir instrucciones de forma fiable.
- Las cuantizaciones son estaticas (sin imatrix/weighted quants), lo que puede implicar una perdida de calidad algo mayor que las cuantizaciones ponderadas en niveles bajos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el dataset de entrenamiento impide verificar la procedencia de los datos y posibles sesgos.
- No apto para produccion con requisitos de calidad, seguridad o cumplimiento sin una evaluacion adicional.

## Enlaces

- Repositorio Hugging Face del GGUF: https://huggingface.co/mradermacher/BULaMU-3-42M-Story-GGUF
- Modelo base: https://huggingface.co/mwebazarick/BULaMU-3-42M-Story
- Pagina de descargas del autor de las cuantizaciones: https://hf.tst.eu/model#BULaMU-3-42M-Story-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Pagina de solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
