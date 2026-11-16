# mradermacher/Qwen3.5-2B-Tools-SoftMoE-GGUF

## Resumen

Qwen3.5-2B-Tools-SoftMoE-GGUF es la publicacion de cuantizaciones GGUF del modelo NikitaLazarev/Qwen3.5-2B-Tools-SoftMoE, realizada por el usuario mradermacher. Se trata de un modelo de aproximadamente 1.942 millones de parametros (1,94B) construido sobre una base Qwen3.5-2B y modificado mediante una tecnica de "soft-MoE" y "weight-steering", etiquetada por el autor como especializada en herramientas (tools) y sin entrenamiento adicional (no-training). El resultado es un modelo orientado a conversacion y uso con herramientas, distribuido en formato GGUF para inferencia local.

La relevancia de esta ficha radica en que combina dos elementos poco habituales: por un lado, un modelo pequeno (2B) que cabe en hardware de consumo; por otro, una modificacion de pesos que pretende inyectar comportamiento de experto de dominio sin reentrenar. El repositorio incluye cuantizaciones estaticas desde Q2_K hasta f16, ademas de suplementos multimodales (mmproj) en Q8_0 y f16, lo que sugiere soporte de vision en el modelo base.

Conviene advertir desde el inicio que la informacion publicada es muy escasa: no hay model card detallada del autor original, no se documentan datos de entrenamiento, benchmarks ni licencia, y el modelo acumula cero descargas y cero likes en el momento de la consulta. Esta ficha refleja exclusivamente lo disponible y marca como "no disponible" todo aquello que no se ha podido verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B) con modificacion soft-MoE y weight-steering; detalles no disponibles |
| Parametros totales | 1.942.653.248 (aprox. 1,94B) |
| Parametros activos | no disponible (el termino "soft-MoE" no implica un MoE clasico con expertos enrutados; no se documenta) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.5-2B, un transformer de aproximadamente 1,94B parametros. Sobre esa base, el autor aplica tecnicas etiquetadas como "soft-moe", "weight-steering" y "domain-expert", con la indicacion explicita "no-training". Esto sugiere que la especializacion se logra mediante manipulacion o combinacion de pesos (steering) en lugar de un reentrenamiento supervisado o RLHF convencional. No se documenta el mecanismo exacto de la modificacion, ni cuantos "expertos" o direcciones de steering se emplean, ni como se combinan en tiempo de inferencia.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o fine-tuning supervisado en el modelo base. Tampoco se detallan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). La presencia de ficheros mmproj indica que el modelo base incorpora un proyector multimodal para vision, aunque el alcance de esa capacidad no se describe.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Orientacion a uso de herramientas (tools): el nombre del modelo y las etiquetas apuntan a soporte de tool calling o function calling, aunque no se documenta el formato exacto ni ejemplos.
- Especializacion de dominio mediante weight-steering: el autor lo etiqueta como "domain-expert", sin especificar que dominio.
- Soporte multimodal potencial: la inclusion de ficheros mmproj (Q8_0 y f16) indica capacidad de vision en el modelo base, no documentada en detalle.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma; no se declaran otros idiomas.
- No se documentan capacidades de razonamiento multi-paso, modo thinking, audio ni agentes autonomas.

## Casos de uso

- Asistente conversacional local en ingles: un modelo de 1,94B cuantizado a Q4_K_M (1,4 GB) puede ejecutarse en portatiles y equipos sin GPU dedicada, adecuado para prototipos de chat offline.
- Experimentacion con tool calling en entornos de desarrollo: la orientacion a herramientas permite probar pipelines de function calling en local antes de escalar a modelos mayores, con bajo coste de infraestructura.
- Investigacion sobre weight-steering y soft-MoE: util para estudiar como la manipulacion de pesos afecta al comportamiento de un modelo pequeno, comparando cuantizaciones Q2_K a f16 sobre el mismo conjunto de prompts.
- Despliegue en edge o dispositivos con poca memoria: las cuantizaciones Q2_K y Q3_K_S (1,1 GB) permiten inferencia en entornos muy restringidos, a costa de calidad.
- Evaluacion de capacidades multimodales en modelos pequenos: los ficheros mmproj permiten probar entrada de imagenes con llama.cpp en hardware de consumo, aunque la calidad no esta documentada.
- Base para fine-tuning ligero o LoRA: al ser un modelo de 1,94B en formato transformers, puede servir como punto de partida para adaptaciones de dominio, siempre que la licencia lo permita (no verificada).
- Generacion de respuestas en ingles para tareas acotadas: clasificacion, extraccion o resumen de textos cortos, donde el tamano reducido compensa la menor calidad frente a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~1,1 GB; Q4_K_M ~1,4 GB; Q8_0 ~2,2 GB; f16 ~4,0 GB. Anadir aproximadamente 0,5-0,8 GB si se usa el proyector multimodal mmproj.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones bajas (GTX 1650, RTX 3050, RTX 4060). Para f16 y contexto largo, 6-8 GB (RTX 3060, RTX 4060 Ti). No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 4 GB o mas; tambien en CPU via llama.cpp con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), y servidores compatibles con la API de endpoints (el repo incluye la etiqueta endpoints_compatible). Para el modelo base en transformers, vLLM o TGI si el formato lo permite (no verificado).
- Latencia y throughput: no disponibles. Por tamano, se espera inferencia interactiva en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Tools-SoftMoE-GGUF (este) | 1,94B | no disponible | no disponible | GGUF | Soft-MoE/weight-steering, orientado a tools, solo ingles |
| Qwen2.5-1.5B-Instruct (referencia de categoria) | 1,54B | 32K (segun documentacion publica de Qwen) | Apache 2.0 (segun Qwen) | safetensors, GGUF | Modelo pequeno generalista, multilingue |
| Llama 3.2 1B Instruct (referencia de categoria) | 1,24B | 128K (segun Meta) | Llama 3.2 Community License | safetensors, GGUF | Multilingue, orientado a edge |

Nota: los datos de los modelos de referencia proceden de documentacion publica general y pueden variar; no se dispone de comparaciones de rendimiento directas con este modelo. La comparativa se limita a parametros, contexto declarado y licencia.

## Limitaciones y advertencias

- Informacion muy escasa: no hay model card detallada del autor original, ni datos de entrenamiento, benchmarks o evaluaciones independientes.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse en el repositorio del modelo base (NikitaLazarev/Qwen3.5-2B-Tools-SoftMoE) antes de cualquier despliegue en produccion.
- Solo ingles declarado: no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: inherente a modelos de 2B; la modificacion por weight-steering puede introducir comportamientos no evaluados.
- La tecnica "no-training" implica que la especializacion no ha pasado por un proceso de alineacion supervisada documentado; el comportamiento en tool calling puede ser fragil.
- Cero descargas y cero likes en el momento de la consulta: sin validacion de la comunidad.
- Las cuantizaciones Q2_K y Q3_K_S (1,1 GB) degradan la calidad de forma notable; para uso real se recomienda Q4_K_M o superior.
- El soporte multimodal (mmproj) no esta documentado en cuanto a calidad ni casos de uso verificados.
- No hay garantia de compatibilidad con frameworks de agentes o APIs de tool calling estandar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-2B-Tools-SoftMoE-GGUF
- Modelo base: https://huggingface.co/NikitaLazarev/Qwen3.5-2B-Tools-SoftMoE
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-2B-Tools-SoftMoE-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
